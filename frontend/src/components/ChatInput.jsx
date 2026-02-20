import { useState } from 'react'

/**
 * TODO:
 * - Text input field with send button
 * - Call onSend(text) on submit, clear input
 * - Disable while waiting for response
 */
export default function ChatInput({ onSend }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are you craving?"
        className="flex-1 bg-[#1c1c1c] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#9ca3af] outline-none focus:ring-2 focus:ring-[#f97316]"
      />
      <button
        type="submit"
        className="bg-[#f97316] text-white px-4 py-2 rounded-lg hover:bg-[#ea580c] transition-colors"
      >
        Send
      </button>
    </form>
  )
}
