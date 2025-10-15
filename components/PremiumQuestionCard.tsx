'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Question } from '@/types'

interface PremiumQuestionCardProps {
  question: Question
  questionNumber: number
  onAnswer: (answer: string) => void
  isLoading: boolean
}

export default function PremiumQuestionCard({ question, questionNumber, onAnswer, isLoading }: PremiumQuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [elaboration, setElaboration] = useState('')
  const [customAnswer, setCustomAnswer] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleSubmit = () => {
    if (question.type === 'text' && textAnswer.trim()) {
      onAnswer(textAnswer)
      setTextAnswer('')
    } else if (question.type === 'mcq' && selectedOption) {
      if (selectedOption.toLowerCase().includes('other') && customAnswer.trim()) {
        onAnswer(`${selectedOption}: ${customAnswer}`)
      } else {
        onAnswer(selectedOption)
      }
      setSelectedOption(null)
      setCustomAnswer('')
      setShowCustomInput(false)
    } else if (question.type === 'mcq_text' && selectedOption) {
      let fullAnswer = selectedOption
      if (selectedOption.toLowerCase().includes('other') && customAnswer.trim()) {
        fullAnswer = `${selectedOption}: ${customAnswer}`
      } else if (selectedOption.toLowerCase().includes('other')) {
        fullAnswer = customAnswer.trim()
      }
      
      if (elaboration.trim()) {
        fullAnswer += ` - ${elaboration}`
      }
      
      onAnswer(fullAnswer)
      setSelectedOption(null)
      setElaboration('')
      setCustomAnswer('')
      setShowCustomInput(false)
    }
  }

  const canSubmit = () => {
    if (question.type === 'text') return textAnswer.trim()
    if (question.type === 'mcq') {
      if (selectedOption?.toLowerCase().includes('other')) return customAnswer.trim()
      return !!selectedOption
    }
    if (question.type === 'mcq_text') {
      if (selectedOption?.toLowerCase().includes('other')) return customAnswer.trim()
      return !!selectedOption
    }
    return false
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    // Only show custom input if "Other" option AND it includes "specify"
    if (option.toLowerCase().includes('other') && option.toLowerCase().includes('specify')) {
      setShowCustomInput(true)
    } else {
      setShowCustomInput(false)
      setCustomAnswer('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl premium-shadow border border-white/20 p-4 sm:p-5 mx-2 sm:mx-0">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-forest-900 text-accent-pearl rounded-full flex items-center justify-center font-mono text-xs">
              {questionNumber.toString().padStart(2, '0')}
            </div>
            <div className="h-px bg-gradient-to-r from-forest-700 to-transparent flex-1" />
          </div>
          
          <h2 className="font-arizona text-base sm:text-lg text-forest-900 mb-2 leading-tight">
            {question.text}
          </h2>

          {question.context && (
            <p className="font-arizona-light text-earth-stone text-xs sm:text-sm leading-relaxed">
              {question.context}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {(question.type === 'mcq' || question.type === 'mcq_text') && question.options ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleOptionSelect(option)}
                    className={`text-left p-3 sm:p-2.5 rounded-lg transition-all duration-200 border text-sm sm:text-xs min-h-[48px] sm:min-h-auto flex items-center font-arizona-light ${
                      selectedOption === option
                        ? 'bg-forest-50 border-forest-700 text-forest-900 shadow-sm'
                        : 'bg-white/50 border-earth-sand hover:border-forest-500 hover:bg-forest-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedOption === option
                          ? 'border-forest-700 bg-forest-700'
                          : 'border-earth-stone'
                      }`}>
                        {selectedOption === option && (
                          <div className="w-0.5 h-0.5 bg-accent-pearl rounded-full" />
                        )}
                      </div>
                      <span className="leading-relaxed">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Custom input for "Other" option */}
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-3 bg-accent-mist/50 rounded-lg border border-earth-sand"
                >
                  <label className="block text-xs text-earth-stone mb-2 font-medium">
                    Please specify:
                  </label>
                  <textarea
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Type your custom answer..."
                    className="w-full p-2 text-xs border border-earth-sand rounded-lg bg-white/80 text-forest-900 placeholder:text-earth-stone focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500/20 resize-none"
                    rows={2}
                  />
                </motion.div>
              )}
              
              {question.type === 'mcq_text' && selectedOption && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-3 bg-accent-mist/50 rounded-lg border border-earth-sand"
                >
                  <label className="block text-xs text-earth-stone mb-2 font-medium">
                    Please elaborate on your choice (optional):
                  </label>
                  <textarea
                    value={elaboration}
                    onChange={(e) => setElaboration(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-2 text-xs border border-earth-sand rounded-lg bg-white/80 text-forest-900 placeholder:text-earth-stone focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500/20 resize-none"
                    rows={3}
                  />
                </motion.div>
              )}
            </>
          ) : (
            <div>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Share your thoughts with us..."
                className="w-full h-20 p-2.5 border border-earth-sand rounded-lg focus:border-forest-700 
                         focus:outline-none resize-none bg-white/50 backdrop-blur-sm text-xs
                         placeholder:text-earth-stone/60"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit()}
            className="px-6 sm:px-5 py-3 sm:py-2 bg-forest-900 text-accent-pearl rounded-full font-medium text-sm sm:text-xs
                     hover:bg-forest-800 transition-all duration-300 disabled:opacity-50 
                     disabled:cursor-not-allowed shadow-md hover:shadow-lg min-h-[48px] sm:min-h-auto touch-manipulation"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-accent-pearl/30 border-t-accent-pearl rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Continue'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}