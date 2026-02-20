import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import MapsWidget from './components/MapsWidget'
import MicButton from './components/MicButton'
import SuggestedPrompts from './components/SuggestedPrompts'
import { useLocation } from './hooks/useLocation'

export default function App() {
  const [messages, setMessages] = useState([])
  const [widgetToken, setWidgetToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { lat, lng, error: locationError, requestLocation } = useLocation()

  const handleSend = async (text) => {
    if (!text.trim()) return
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
    <div className="flex h-screen bg-[#111111] text-[#f5f5f5]">
      {/* Chat panel */}
      <div className="flex flex-col w-[55%] border-r border-[#1c1c1c]">
        <header className="flex items-center justify-between p-4 border-b border-[#1c1c1c]">
          <h1 className="text-xl font-bold">🍜 Dishcovery</h1>
          {locationError ? (
            <span className="flex items-center gap-2 text-sm text-[#9ca3af]">
              <span>📍 Using default location</span>
              <button
                type="button"
                onClick={requestLocation}
                className="text-[#f97316] hover:underline"
              >
                Use my location
              </button>
            </span>
          ) : (
            <span className="text-sm text-[#9ca3af]">📍 Near you</span>
          )}
        </header>

        <ChatWindow messages={messages} isTyping={isLoading} />
        {messages.length === 0 && <SuggestedPrompts onSelect={handleSend} />}

        <div className="flex items-center gap-2 p-4 border-t border-[#1c1c1c]">
          <ChatInput onSend={handleSend} disabled={isLoading} />
          <MicButton lat={lat} lng={lng} />
        </div>
      </div>

      {/* Maps panel */}
      <div className="w-[45%] flex items-center justify-center">
        <MapsWidget widgetToken={widgetToken} lat={lat} lng={lng} />
      </div>
    </div>
  )
}
