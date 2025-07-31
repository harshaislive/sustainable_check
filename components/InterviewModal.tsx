'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Question, Answer } from '@/types'
import QuestionCard from './QuestionCard'
import QuotePanel from './QuotePanel'
import ProgressBar from './ProgressBar'

interface InterviewModalProps {
  onComplete: (answers: Answer[]) => void
}

export default function InterviewModal({ onComplete }: InterviewModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const totalQuestions = 10

  useEffect(() => {
    fetchInitialQuestion()
  }, [])

  const fetchInitialQuestion = async () => {
    try {
      const response = await fetch('/api/start-interview', {
        method: 'POST'
      })
      const firstQuestion = await response.json()
      setQuestions([firstQuestion])
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial question:', error)
      setIsLoading(false)
    }
  }

  const handleAnswer = async (answer: string) => {
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      value: answer,
      timestamp: new Date()
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    if (currentQuestionIndex < totalQuestions - 1) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updatedAnswers })
        })
        const nextQuestion = await response.json()
        setQuestions([...questions, nextQuestion])
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } catch (error) {
        console.error('Error generating question:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      onComplete(updatedAnswers)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  if (isLoading && questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Preparing your interview...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        <div className="p-8">
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>
        
        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              {questions[currentQuestionIndex] && (
                <QuestionCard
                  key={questions[currentQuestionIndex].id}
                  question={questions[currentQuestionIndex]}
                  onAnswer={handleAnswer}
                  isLoading={isLoading}
                />
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-96 border-l border-gray-200 bg-white/50 backdrop-blur-sm">
            <QuotePanel currentQuestion={currentQuestionIndex} />
          </div>
        </div>
        
        <div className="p-8 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  )
}