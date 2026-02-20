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
  const { lat, lng } = useLocation()

  const handleSend = async (text) => {
    // TODO: POST to /chat, update messages + widgetToken
  }

  return (
    <div className="flex h-screen bg-[#111111] text-[#f5f5f5]">
      {/* Chat panel */}
      <div className="flex flex-col w-[55%] border-r border-[#1c1c1c]">
        <header className="flex items-center justify-between p-4 border-b border-[#1c1c1c]">
          <h1 className="text-xl font-bold">🍜 Dishcovery</h1>
          <span className="text-sm text-[#9ca3af]">📍 Near U of A</span>
        </header>

        <ChatWindow messages={messages} />
        <SuggestedPrompts onSelect={handleSend} />

        <div className="flex items-center gap-2 p-4 border-t border-[#1c1c1c]">
          <ChatInput onSend={handleSend} />
          <MicButton lat={lat} lng={lng} />
        </div>
      </div>

      {/* Maps panel */}
      <div className="w-[45%] flex items-center justify-center">
        <MapsWidget widgetToken={widgetToken} />
      </div>
    </div>
  )
}
