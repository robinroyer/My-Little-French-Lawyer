import { motion } from 'motion/react'

export default function MessageBubble({ message, sources, isLatest }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl font-sans text-[15px] leading-relaxed
            ${isUser ? 'bubble-user rounded-br-md' : 'bubble-assistant rounded-bl-md'}
          `}
        >
          {/* Decorative section symbol for assistant */}
          {!isUser && (
            <span className="absolute -left-1 -top-1 text-legal-gold/20 font-serif text-lg select-none">

            </span>
          )}

          {/* Message content */}
          <div className={`relative ${!isUser ? 'prose prose-sm prose-legal' : ''}`}>
            {message.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Sources for assistant messages */}
        {!isUser && sources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-2 ml-1"
          >
            <div className="flex items-center gap-1.5 text-xs text-legal-steel mb-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium">Sources consultees</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sources.map((source, idx) => (
                <SourceChip key={idx} index={idx + 1} source={source} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Timestamp */}
        <div className={`mt-1.5 text-[10px] text-legal-mist font-sans ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  )
}

function SourceChip({ index, source }) {
  const hasMetadata = source.metadata && Object.keys(source.metadata).length > 0

  return (
    <div className="group relative">
      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans bg-stone-150 text-legal-slate rounded-md border border-stone-250 hover:bg-stone-250 hover:border-legal-mist transition-all duration-200">
        <span className="w-4 h-4 flex items-center justify-center bg-legal-gold/20 text-legal-gold rounded text-[10px] font-semibold">
          {index}
        </span>
        <span className="max-w-[120px] truncate">
          {source.metadata?.source || source.metadata?.filename || `Source ${index}`}
        </span>
      </button>

      {/* Tooltip with source preview */}
      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-white rounded-lg shadow-legal-lg border border-stone-250 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
        <div className="text-xs font-sans text-legal-ink leading-relaxed line-clamp-4">
          {source.content}
        </div>
        {hasMetadata && (
          <div className="mt-2 pt-2 border-t border-stone-150 text-[10px] text-legal-steel">
            {Object.entries(source.metadata).slice(0, 3).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}
        {/* Arrow */}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r border-b border-stone-250 transform rotate-45" />
      </div>
    </div>
  )
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
