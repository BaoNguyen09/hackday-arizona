import { useState } from 'react'
import pot from './assets/pot.png';
import ChatBox from './components/ChatBox'
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
      <div className="h-screen bg-[#D8A08A] text-[#f5f5f5]">
        <header
          className="p-2 flex items-center justify-between relative"
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[#FFE2D5] rounded-2xl p-2 min-w-[120px] min-h-[48px] flex items-center justify-center">
              <h1 className='text-xl text-[#612F1E] font-bold'>Favorites</h1>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4"
            style={{
              backgroundImage: `url(${pot})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
            }}
          >
            <h1 className="text-xl text-[#612F1E] font-bold">Dishcovery</h1>
            <span className="text-sm text-[#9ca3af]">📍 Near U of A</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[#FFE2D5] rounded-2xl p-2 min-w-[120px] min-h-[48px] flex items-center justify-center">
              <h1 className='text-xl text-[#612F1E] font-bold'>Map</h1>
            </div>
          </div>
        </header>
      <div className="flex h-[calc(100vh-64px)] w-full gap-4 p-4 ">
        <div className="flex-1 h-full rounded-2xl shadow-lg overflow-hidden">
          <ChatBox messages={messages} onSend={handleSend} lat={lat} lng={lng} />
        </div>
        <div className="flex-1 h-full flex items-center justify-center">
          <div className="w-full h-full rounded-2xl shadow-lg bg-white flex items-center justify-center">
            <MapsWidget widgetToken={widgetToken} />
          </div>
        </div>
      </div>
    </div>
  )
}
