'use client'

import { motion, AnimatePresence } from 'framer-motion'

const quotes = [
  {
    text: "The greatest threat to our planet is the belief that someone else will save it.",
    author: "Robert Swan"
  },
  {
    text: "We don't have to engage in grand, heroic actions to participate in change. Small acts, when multiplied by millions of people, can transform the world.",
    author: "Howard Zinn"
  },
  {
    text: "The Earth does not belong to us; we belong to the Earth. All things are connected like the blood that unites one family.",
    author: "Chief Seattle"
  },
  {
    text: "Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it's the only thing that ever has.",
    author: "Margaret Mead"
  },
  {
    text: "The future will either be green or not at all.",
    author: "Bob Brown"
  },
  {
    text: "What we are doing to the forests of the world is but a mirror reflection of what we are doing to ourselves and to one another.",
    author: "Mahatma Gandhi"
  },
  {
    text: "We cannot solve our problems with the same thinking we used when we created them.",
    author: "Albert Einstein"
  },
  {
    text: "The environment is where we all meet; where we all have a mutual interest; it is the one thing all of us share.",
    author: "Lady Bird Johnson"
  },
  {
    text: "In every walk with nature, one receives far more than he seeks.",
    author: "John Muir"
  },
  {
    text: "The Earth is what we all have in common.",
    author: "Wendell Berry"
  }
]

interface QuotePanelProps {
  currentQuestion: number
}

export default function QuotePanel({ currentQuestion }: QuotePanelProps) {
  const quote = quotes[currentQuestion % quotes.length]

  return (
    <div className="h-full flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-lg text-gray-700 italic mb-4 leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-sm text-gray-500">
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}