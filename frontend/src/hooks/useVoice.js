import { useState, useRef, useCallback, useEffect } from 'react'

const TARGET_SAMPLE_RATE = 16000
const PLAYBACK_SAMPLE_RATE = 24000

/**
 * Resample float32 mono/stereo to 16-bit PCM at 16kHz mono.
 * @param {Float32Array} input - at context.sampleRate
 * @param {number} inputSampleRate
 * @returns {ArrayBuffer} 16-bit PCM little-endian
 */
function resampleTo16kMono(input, inputSampleRate) {
  const numSamples = input.length
  const ratio = inputSampleRate / TARGET_SAMPLE_RATE
  const outLength = Math.floor(numSamples / ratio)
  const out = new Int16Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio
    const idx = Math.floor(srcIndex)
    const frac = srcIndex - idx
    const nextIdx = Math.min(idx + 1, numSamples - 1)
    let s = input[idx]
    if (frac > 0) s = s + frac * (input[nextIdx] - s)
    const s16 = Math.max(-32768, Math.min(32767, Math.round(s * 32768)))
    out[i] = s16
  }
  return out.buffer
}

/**
 * Open WebSocket to /voice?lat=X&lng=Y
 * Capture mic via getUserMedia + ScriptProcessor (resample to 16kHz 16-bit PCM, send binary)
 * Receive binary (24kHz PCM) -> play via AudioContext; text (JSON) -> transcript, widget_token
 * Return { isActive, start, stop, transcript, widgetToken }
 */
/** Compute RMS from Float32Array (time-domain samples). */
function rmsFromSamples(samples) {
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
  return Math.sqrt(sum / samples.length)
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export function useVoice({ lat, lng, onWidgetToken }) {
  const [isActive, setIsActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [userTranscript, setUserTranscript] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [widgetToken, setWidgetToken] = useState(null)
  const [volume, setVolume] = useState(0)

  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const processorRef = useRef(null)
  const analyserRef = useRef(null)
  const playbackContextRef = useRef(null)
  const nextPlayTimeRef = useRef(0)
  const timeDataRef = useRef(null)
  const recognitionRef = useRef(null)
  const useLocalSttRef = useRef(false)
  const finalTranscriptRef = useRef('')

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current.abort()
      } catch (_) {}
      recognitionRef.current = null
    }
    useLocalSttRef.current = false
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect()
      } catch (_) {}
      analyserRef.current = null
    }
    timeDataRef.current = null
    if (processorRef.current && audioContextRef.current) {
      try {
        processorRef.current.disconnect()
        audioContextRef.current.close()
      } catch (_) {}
      processorRef.current = null
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {})
      playbackContextRef.current = null
    }
    nextPlayTimeRef.current = 0
    setIsActive(false)
    setVolume(0)
    // Don't clear transcript/userTranscript here — App reads them when session ends to add chat messages; we clear at start of next start()
  }, [])

  // Throttled volume meter while voice is active
  useEffect(() => {
    if (!isActive || !analyserRef.current) return
    const analyser = analyserRef.current
    const fftSize = 256
    if (!timeDataRef.current) timeDataRef.current = new Float32Array(analyser.fftSize)
    const data = timeDataRef.current
    let rafId
    const tick = () => {
      analyser.getFloatTimeDomainData(data)
      const rms = rmsFromSamples(data)
      setVolume(rms)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive])

  const start = useCallback(async () => {
    if (isActive) return
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/voice?lat=${encodeURIComponent(lat ?? '')}&lng=${encodeURIComponent(lng ?? '')}`

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      console.error('getUserMedia failed:', err)
      return
    }
    streamRef.current = stream

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioContextRef.current = ctx
    const sampleRate = ctx.sampleRate

    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.7
    source.connect(analyser)
    analyserRef.current = analyser

    setTranscript('')
    setUserTranscript('')
    setLiveTranscript('')
    setWidgetToken(null)
    // Don't clear App's widgetToken when starting voice — only update when we receive a new token
    finalTranscriptRef.current = ''
    setIsActive(true)

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onresult = (event) => {
        let finalAdded = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalAdded += t
          } else {
            interim += t
          }
        }
        if (finalAdded) {
          finalTranscriptRef.current = (finalTranscriptRef.current + finalAdded).trim()
          setUserTranscript(finalTranscriptRef.current)
        }
        const display = (finalTranscriptRef.current + (interim ? ' ' + interim : '')).trim()
        setLiveTranscript(display)
      }
      recognition.onerror = () => {}
      recognition.start()
      recognitionRef.current = recognition
      useLocalSttRef.current = true
    }

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.binaryType = 'arraybuffer'
    ws.onopen = () => {
      const bufferSize = 4096
      const processor = ctx.createScriptProcessor(bufferSize, 1, 1)
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        const input = e.inputBuffer.getChannelData(0)
        const chunk = resampleTo16kMono(input, sampleRate)
        wsRef.current.send(chunk)
      }
      source.connect(processor)
      processor.connect(ctx.destination)
      processorRef.current = processor
    }
    ws.onclose = () => stop()
    ws.onerror = () => stop()

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const json = JSON.parse(event.data)
          if (json.user_transcript != null && !useLocalSttRef.current) {
            setUserTranscript(json.user_transcript)
            setLiveTranscript(json.user_transcript)
          }
          if (json.transcript != null) setTranscript((t) => (t ? `${t} ${json.transcript}` : json.transcript))
          if (json.widget_token != null) {
            setWidgetToken(json.widget_token)
            onWidgetToken?.(json.widget_token)
          }
        } catch (_) {}
        return
      }
      // Binary: 24kHz 16-bit PCM mono
      const pcm = new Int16Array(event.data)
      if (!playbackContextRef.current) {
        const playbackCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: PLAYBACK_SAMPLE_RATE })
        playbackContextRef.current = playbackCtx
        nextPlayTimeRef.current = playbackCtx.currentTime
      }
      const playbackCtx = playbackContextRef.current
      const buffer = playbackCtx.createBuffer(1, pcm.length, PLAYBACK_SAMPLE_RATE)
      const ch = buffer.getChannelData(0)
      for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 32768
      const source = playbackCtx.createBufferSource()
      source.buffer = buffer
      source.connect(playbackCtx.destination)
      const when = Math.max(playbackCtx.currentTime, nextPlayTimeRef.current)
      source.start(when)
      nextPlayTimeRef.current = when + buffer.duration
    }
  }, [lat, lng, isActive, stop])

  return { isActive, start, stop, transcript, userTranscript, liveTranscript, widgetToken, volume }
}
