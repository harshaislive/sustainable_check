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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherText, setOtherText] = useState('')

  const handleOptionClick = (option: string) => {
    if (question.type === 'mcq_multi' || question.multiSelect) {
      if (option.toLowerCase().includes('other')) {
        setShowOtherInput(!showOtherInput)
      }
      
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(o => o !== option))
        if (option.toLowerCase().includes('other')) {
          setShowOtherInput(false)
          setOtherText('')
        }
      } else {
        setSelectedOptions([...selectedOptions, option])
      }
    } else {
      setSelectedOption(option)
      if (option.toLowerCase().includes('other')) {
        setShowOtherInput(true)
      } else {
        setShowOtherInput(false)
        setOtherText('')
      }
    }
  }

  const handleSubmit = () => {
    if (question.type === 'text' && textAnswer.trim()) {
      onAnswer(textAnswer)
      setTextAnswer('')
    } else if (question.type === 'mcq' && selectedOption) {
      const answer = showOtherInput && otherText.trim() 
        ? `${selectedOption}: ${otherText}`
        : selectedOption
      onAnswer(answer)
      setSelectedOption(null)
      setOtherText('')
      setShowOtherInput(false)
    } else if ((question.type === 'mcq_multi' || question.multiSelect) && selectedOptions.length > 0) {
      let answer = selectedOptions.join('; ')
      if (showOtherInput && otherText.trim()) {
        answer = answer.replace(/Other.*$/, `Other: ${otherText}`)
      }
      onAnswer(answer)
      setSelectedOptions([])
      setOtherText('')
      setShowOtherInput(false)
    } else if (question.type === 'mcq_text') {
      const answer = selectedOption 
        ? `${selectedOption}${textAnswer.trim() ? ` - ${textAnswer}` : ''}`
        : textAnswer
      onAnswer(answer)
      setSelectedOption(null)
      setTextAnswer('')
    }
  }

  const canSubmit = () => {
    if (question.type === 'text') return textAnswer.trim() !== ''
    if (question.type === 'mcq') return selectedOption !== null
    if (question.type === 'mcq_multi' || question.multiSelect) return selectedOptions.length > 0
    if (question.type === 'mcq_text') return selectedOption !== null || textAnswer.trim() !== ''
    return false
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

        {(question.type === 'mcq_multi' || question.multiSelect) && (
          <p className="text-sm text-green-600 mb-4">
            Select your top priority for clearer assessment (multiple selections allowed)
          </p>
        )}

        {(question.type === 'mcq' || question.type === 'mcq_multi' || question.type === 'mcq_text') && question.options ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  (question.type === 'mcq_multi' || question.multiSelect)
                    ? selectedOptions.includes(option)
                      ? 'bg-green-100 border-2 border-green-500 text-green-900'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    : selectedOption === option
                    ? 'bg-green-100 border-2 border-green-500 text-green-900'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
            
            {showOtherInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder={question.encourageOther || "Tell us more about your approach..."}
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                  autoFocus
                />
              </motion.div>
            )}
          </div>
        ) : null}

        {question.type === 'text' && (
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
          />
        )}

        {question.type === 'mcq_text' && (
          <div className="mt-4">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Add any additional thoughts (optional)..."
              className="w-full h-24 p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || !canSubmit()}
          className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  )
}