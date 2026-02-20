/**
 * TODO:
 * - Open WebSocket to /voice?lat=X&lng=Y
 * - Capture mic audio via getUserMedia + AudioWorklet (or ScriptProcessor fallback)
 * - Resample to 16-bit PCM at 16kHz mono, send as binary frames
 * - Receive binary frames (24kHz PCM) -> play via AudioContext
 * - Receive text frames (JSON) -> parse transcript and widget_token
 * - Return { isActive, start, stop, transcript, widgetToken }
 *
 * Key audio notes:
 * - Browser mic must output 16-bit PCM at 16kHz mono
 * - Use AudioContext.sampleRate resampling if needed
 * - Gemini Live responds at 24kHz — use separate AudioContext for playback
 */
export function useVoice({ lat, lng }) {
  // TODO: implement
  return {
    isActive: false,
    start: () => {},
    stop: () => {},
    transcript: '',
    widgetToken: null,
  }
}
