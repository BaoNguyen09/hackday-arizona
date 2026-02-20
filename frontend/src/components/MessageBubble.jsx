import ReactMarkdown from 'react-markdown'

/**
 * User bubble: orange filled, right-aligned.
 * Assistant bubble: dark card with left orange border, markdown rendered.
 */
export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2 ${
          isUser
            ? 'bg-[#E5784F] text-white'
            : 'bg-[#1c1c1c] border-l-4 border-[#f97316]'
        }`}
      >
        {isUser ? (
          content
        ) : (
          <div className="markdown-output [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
