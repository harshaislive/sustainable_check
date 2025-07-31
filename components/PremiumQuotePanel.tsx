'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { premiumQuotes } from '@/lib/premium-quotes'

interface PremiumQuotePanelProps {
  currentQuestion: number
}

export default function PremiumQuotePanel({ currentQuestion }: PremiumQuotePanelProps) {
  const quote = premiumQuotes[currentQuestion % premiumQuotes.length]

  return (
    <div className="h-full flex flex-col justify-center p-4 text-accent-pearl relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-900/90 to-forest-800/90" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-earth-clay/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="space-y-4"
          >
            {/* Quote category indicator */}
            <div className="inline-block">
              <span className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded-full text-xs font-mono uppercase tracking-wide">
                {quote.category}
              </span>
            </div>

            {/* Main quote */}
            <blockquote className="space-y-3">
              <p className="font-serif text-base leading-relaxed text-accent-pearl/90">
                "{quote.text}"
              </p>
              
              <footer className="flex items-center gap-2">
                <div className="w-6 h-px bg-accent-gold/40" />
                <cite className="text-accent-pearl/70 font-medium not-italic text-xs">
                  {quote.author}
                </cite>
              </footer>
            </blockquote>

            {/* Decorative elements */}
            <div className="flex gap-1 mt-6">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-1000 ${
                    i === currentQuestion 
                      ? 'w-4 bg-accent-gold' 
                      : 'w-1 bg-accent-pearl/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}