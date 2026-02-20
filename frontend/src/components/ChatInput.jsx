import { useState } from 'react'

/**
 * Text input with send button. Disables while waiting for response.
 * When value/onChange are provided, input is controlled (e.g. for voice draft); parent clears after send.
 */
export default function ChatInput({ onSend, disabled = false, value, onChange }) {
  const [internalText, setInternalText] = useState('')
  const isControlled = value !== undefined && onChange !== undefined
  const text = isControlled ? value : internalText
  const setText = isControlled ? onChange : setInternalText

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    if (!isControlled) setInternalText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are you craving?"
        disabled={disabled}
        className="flex-1 bg-[#EFD2C7] rounded-lg px-4 py-2 text-[#461C0C] placeholder-[#461C0C] outline-none focus:ring-2 focus:ring-[#f97316] disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled}
        className="bg-[#E5784F] text-white px-4 py-2 rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  )
}
