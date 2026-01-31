import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'

export default function InputBar({ onSend, disabled }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
    }
  }, [message])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative bg-white border-t border-stone-250"
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-legal-gold/20 to-transparent" />

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
        <div className="relative flex items-end gap-3">
          {/* Input container with decorative border */}
          <div className="flex-1 relative">
            <div className="relative bg-legal-cream rounded-xl border border-stone-250 shadow-inner-subtle overflow-hidden transition-all duration-200 focus-within:border-legal-gold/40 focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.1)]">
              {/* Decorative corner */}
              <div className="absolute top-2 left-3 text-legal-gold/20 font-serif text-sm select-none pointer-events-none">

              </div>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="Posez votre question juridique..."
                rows={1}
                className="w-full px-4 py-3 pl-8 bg-transparent font-sans text-legal-ink placeholder:text-legal-mist resize-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '150px' }}
              />

              {/* Character hint */}
              <div className="absolute bottom-2 right-3 text-[10px] text-legal-mist font-sans opacity-0 transition-opacity duration-200" style={{ opacity: message.length > 0 ? 0.7 : 0 }}>
                Entree pour envoyer
              </div>
            </div>
          </div>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={disabled || !message.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-legal-navy to-legal-slate text-white shadow-legal hover:shadow-legal-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
          >
            {disabled ? (
              <LoadingSpinner />
            ) : (
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Helper text */}
        <p className="mt-2 text-center text-[11px] text-legal-mist font-sans">
          <span className="hidden sm:inline">
            Utilisez <kbd className="px-1.5 py-0.5 bg-stone-150 rounded text-[10px] font-medium">Shift + Entree</kbd> pour un saut de ligne
          </span>
          <span className="sm:hidden">Appuyez sur le bouton pour envoyer</span>
        </p>
      </form>
    </motion.div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
