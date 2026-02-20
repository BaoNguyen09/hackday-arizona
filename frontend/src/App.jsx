import { useState, useEffect, useRef } from 'react'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import MapsWidget from './components/MapsWidget'
import MicButton from './components/MicButton'
import VolumeIndicator from './components/VolumeIndicator'
import SuggestedPrompts from './components/SuggestedPrompts'
import { useLocation } from './hooks/useLocation'
import pot from './assets/pot.png';
import { useVoice } from './hooks/useVoice'

export default function App() {
  const [messages, setMessages] = useState([])
  const [widgetToken, setWidgetToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const { lat, lng, error: locationError, requestLocation } = useLocation()
  const voice = useVoice({ lat, lng })
  const prevVoiceActiveRef = useRef(false)

  // While voice is active: show live transcript in the input (real-time, including interim)
  useEffect(() => {
    if (voice.isActive) setInputText(voice.liveTranscript)
  }, [voice.isActive, voice.liveTranscript])

  // When voice session ends: put final transcript in input for user to edit or send (no auto-send)
  useEffect(() => {
    if (!prevVoiceActiveRef.current || voice.isActive) {
      prevVoiceActiveRef.current = voice.isActive
      return
    }
    prevVoiceActiveRef.current = false
    setInputText(voice.userTranscript?.trim() ?? '')
  }, [voice.isActive, voice.userTranscript])

  const handleSend = async (text) => {
    if (!text.trim()) return
    setInputText('')
    const userMessage = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    const history = [...messages, userMessage]
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), lat, lng, history }),
      })
      if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'model', content: data.reply }])
      setWidgetToken(data.widget_token ?? null)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `Sorry, something went wrong: ${err.message}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-linear-to-br from-[#D8A08A] to-[#A3634B]  text-[#f5f5f5]">
      
       <header className="p-2 flex items-center justify-between relative">
          <div className="flex-1 flex flex-col items-center justify-center p-2"
          >
              <h1 className="absolute text-xl text-[#612F1E] font-bold p-6 "
              style={{
              backgroundImage: `url(${pot})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
            }}
              >Dishcovery</h1>


            {locationError ? (
              <span className="flex items-center gap-100 text-sm text-[#9ca3af]">
                <div className="bg-[#FFE2D5] rounded-2xl p-2 min-w-[60px] min-h-[48px] flex items-center justify-center">
                  <span className="text-xl text-[#612F1E] font-bold">📍 Using default location</span>
                  </div>
                <div className="bg-[#FFE2D5] rounded-2xl p-2 min-w-[60px] min-h-[48px] flex items-center justify-center">
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-xl text-[#612F1E] font-bold hover:underline"
                  >
                    Use my location
                  </button>
                </div>
              </span>
            ) : (
              <span className="text-sm text-[#9ca3af]">📍 Near you</span>
            )}
          </div>
        </header>
      <div className="flex h-[calc(100vh-80px)] w-full gap-4 p-4" >
      {/* Chat panel */}
      <div className="flex-1 bg-[#FFF5F2] h-full rounded-2xl shadow-lg overflow-hidden">
        <div className="h-full flex flex-col shadow-lg">

        <ChatWindow messages={messages} isTyping={isLoading} />
        {messages.length === 0 && <SuggestedPrompts onSelect={handleSend} />}
        <div className="border-t border-[#1c1c1c] bg-[#FFF5F2] flex items-center gap-2 p-4 sticky bottom-0">
          <div className="flex items-center gap-2 p-4 border-t border-[#1c1c1c]">
          <ChatInput
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          disabled={isLoading}
        />
          <MicButton isActive={voice.isActive} onStart={voice.start} onStop={voice.stop} />
        </div>
        <VolumeIndicator isActive={voice.isActive} volume={voice.volume} />
      </div>
      </div>
      </div>
      {/* Maps panel */}

      <div className="flex-1 h-full flex items-center justify-center">
        <div className="w-full h-full rounded-2xl shadow-lg bg-white flex items-center justify-center overflow-hidden">
          <MapsWidget widgetToken={widgetToken} lat={lat} lng={lng} />
        </div>
      </div>
      </div>
    </div>
  )
}
