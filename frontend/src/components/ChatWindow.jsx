import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

/**
 * Message list with auto-scroll and typing indicator.
 */
export default function ChatWindow({ messages, isTyping = false }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#9ca3af]">
        <p>Ask me what you're craving...</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} content={msg.content} />
      ))}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-[#1c1c1c] border-l-4 border-[#f97316] rounded-xl px-4 py-3 flex gap-1 items-center min-w-[60px]">
            <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )
}
