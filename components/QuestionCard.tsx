'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  onAnswer: (answer: string) => void
  isLoading: boolean
}

export default function QuestionCard({ question, onAnswer, isLoading }: QuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSubmit = () => {
    if (question.type === 'text' && textAnswer.trim()) {
      onAnswer(textAnswer)
      setTextAnswer('')
    } else if (question.type === 'mcq' && selectedOption) {
      onAnswer(selectedOption)
      setSelectedOption(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {question.text}
        </h2>
        
        {question.context && (
          <p className="text-gray-600 mb-6 text-sm italic">
            {question.context}
          </p>
        )}

        {question.type === 'mcq' && question.options ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedOption === option
                    ? 'bg-green-100 border-2 border-green-500 text-green-900'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            (question.type === 'text' ? !textAnswer.trim() : !selectedOption)
          }
          className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  )
}