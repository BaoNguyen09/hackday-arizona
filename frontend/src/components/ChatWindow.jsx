import MessageBubble from './MessageBubble'

/**
 * TODO:
 * - Render list of messages from props
 * - Auto-scroll to bottom on new message
 * - Show typing indicator while waiting for response
 */
export default function ChatWindow({ messages }) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#9ca3af]">
        <p>Ask me what you're craving...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} content={msg.content} />
      ))}
    </div>
  )
}
