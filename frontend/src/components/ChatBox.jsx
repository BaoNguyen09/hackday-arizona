import ChatWindow from './ChatWindow'
import ChatInput from './ChatInput'
import MicButton from './MicButton'
import SuggestedPrompts from './SuggestedPrompts'

export default function ChatBox({ messages, onSend, lat, lng }) {
  return (
    <div className="bg-[#FFF5F2] h-full flex flex-col rounded-2xl shadow-lg">
      <div className="flex-1 overflow-y-auto">
        <ChatWindow messages={messages} />
      </div>
      <SuggestedPrompts onSelect={onSend} />
      <div className="border-t border-[#1c1c1c] bg-[#FFF5F2] flex items-center gap-2 p-4 sticky bottom-0">
        <ChatInput onSend={onSend} />
        <MicButton lat={lat} lng={lng} />
      </div>
    </div>
  )
}
