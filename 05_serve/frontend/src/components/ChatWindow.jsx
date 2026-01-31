import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages, sources, isLoading }) {
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isEmpty = messages.length === 0

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  sources={msg.role === 'assistant' ? sources[idx] : null}
                  isLatest={idx === messages.length - 1}
                />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      {/* Decorative legal symbol */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-legal-cream to-stone-150 flex items-center justify-center shadow-legal border border-stone-250">
          <span className="text-5xl text-legal-gold/70 font-serif"></span>
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border border-legal-gold/20 scale-125 animate-pulse-subtle" />
        <div className="absolute inset-0 rounded-full border border-legal-mist/30 scale-150" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-display text-2xl sm:text-3xl text-legal-navy mb-3"
      >
        Bienvenue
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-sans text-legal-steel max-w-md mb-8 leading-relaxed"
      >
        Je suis votre assistant juridique specialise dans le droit francais.
        Posez-moi vos questions sur les textes de loi, les procedures, ou tout autre sujet juridique.
      </motion.p>

      {/* Suggestion chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-2 max-w-lg"
      >
        {[
          "Qu'est-ce que le Code civil ?",
          "Expliquez l'article 1240",
          "Delai de prescription",
        ].map((suggestion, idx) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
            className="px-4 py-2 text-sm font-sans text-legal-slate bg-white rounded-full border border-stone-250 shadow-sm hover:border-legal-gold/40 hover:shadow-legal transition-all duration-200 cursor-default"
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>

      {/* Decorative footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <div className="flex items-center gap-3 text-legal-mist text-xs font-sans">
          <span className="w-8 h-px bg-legal-mist/30" />
          <span>Base sur les documents de Legifrance</span>
          <span className="w-8 h-px bg-legal-mist/30" />
        </div>
      </motion.div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-4"
    >
      <div className="bubble-assistant px-5 py-4 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-3">
          {/* Animated scales */}
          <div className="relative w-5 h-5">
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-legal-gold"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M12 3v18M5 7l7-4 7 4M5 7v5c0 2 2.5 3 2.5 3M19 7v5c0 2-2.5 3-2.5 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </div>

          {/* Typing dots */}
          <div className="flex items-center gap-1">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>

          <span className="text-sm text-legal-steel font-sans">Consultation en cours...</span>
        </div>
      </div>
    </motion.div>
  )
}
