import { motion } from 'motion/react'

export default function Header({ onClear, onExport, hasMessages }) {
  return (
    <header className="relative bg-white border-b border-stone-250 shadow-sm">
      {/* Subtle marble texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-marble-texture" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            {/* Scale icon */}
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-legal-navy to-legal-slate flex items-center justify-center shadow-legal">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-legal-goldLight"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v18" />
                  <path d="M5 7l7-4 7 4" />
                  <path d="M5 7v5c0 2 2.5 3 2.5 3" />
                  <path d="M19 7v5c0 2-2.5 3-2.5 3" />
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <path d="M9 21h6" />
                </svg>
              </div>
              {/* Decorative gold accent */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-legal-gold rounded-full border-2 border-white" />
            </div>

            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-legal-navy tracking-tight">
                My Little French Lawyer
              </h1>
              <p className="hidden sm:block text-xs font-sans text-legal-steel tracking-wide">
                Assistant juridique pour le droit francais
              </p>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="flex items-center gap-2"
          >
            {/* Clear button */}
            <button
              onClick={onClear}
              disabled={!hasMessages}
              className="btn-ghost flex items-center gap-1.5"
              title="Effacer la conversation"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline text-sm">Effacer</span>
            </button>

            {/* Export dropdown */}
            <div className="relative group">
              <button
                disabled={!hasMessages}
                className="btn-secondary flex items-center gap-1.5"
                title="Exporter la conversation"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline text-sm">Exporter</span>
                <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-1 w-36 py-1 bg-white rounded-lg shadow-legal-lg border border-stone-250 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => onExport('md')}
                  disabled={!hasMessages}
                  className="w-full px-4 py-2 text-left text-sm text-legal-ink hover:bg-stone-150 transition-colors disabled:opacity-50"
                >
                  Markdown (.md)
                </button>
                <button
                  onClick={() => onExport('txt')}
                  disabled={!hasMessages}
                  className="w-full px-4 py-2 text-left text-sm text-legal-ink hover:bg-stone-150 transition-colors disabled:opacity-50"
                >
                  Texte brut (.txt)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom border with gold accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-legal-gold/30 to-transparent" />
    </header>
  )
}
