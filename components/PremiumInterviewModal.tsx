'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Question, Answer } from '@/types'
import PremiumQuestionCard from './PremiumQuestionCard'
import PremiumQuotePanel from './PremiumQuotePanel'
import PremiumProgressBar from './PremiumProgressBar'
import { BehavioralTracker, BehavioralData } from '@/lib/commitment/behavioral-tracker'
import { CommitmentScoringEngine } from '@/lib/commitment/scoring-engine'

interface PremiumInterviewModalProps {
  onComplete: (answers: Answer[], behavioralData: BehavioralData[]) => void
}

export default function PremiumInterviewModal({ onComplete }: PremiumInterviewModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [behavioralData, setBehavioralData] = useState<BehavioralData[]>([])
  const [currentScore, setCurrentScore] = useState(0)
  const [tracker] = useState(() => new BehavioralTracker())
  const [scoringEngine] = useState(() => new CommitmentScoringEngine())

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
      // Start behavioral tracking for first question
      tracker.startQuestion()
    } catch (error) {
      console.error('Error fetching initial question:', error)
      setIsLoading(false)
    }
  }

  const handleAnswer = async (answer: string) => {
    // Finish behavioral tracking for current question
    const currentBehavioralData = tracker.finishQuestion(answer)
    const updatedBehavioralData = [...behavioralData, currentBehavioralData]
    setBehavioralData(updatedBehavioralData)

    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      value: answer,
      timestamp: new Date()
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    // Calculate live score for adaptive questioning
    const liveScore = scoringEngine.calculateLiveScore(updatedAnswers, updatedBehavioralData)
    setCurrentScore(liveScore)

    if (currentQuestionIndex < totalQuestions - 1) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            answers: updatedAnswers, 
            behavioralData: updatedBehavioralData,
            currentScore: liveScore
          })
        })
        const nextQuestion = await response.json()
        setQuestions([...questions, nextQuestion])
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        
        // Start tracking for next question
        tracker.startQuestion()
      } catch (error) {
        console.error('Error generating question:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      onComplete(updatedAnswers, updatedBehavioralData)
    }
  }

  if (isLoading && questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-dawn flex items-center justify-center z-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-forest-700/20 rounded-full animate-spin" />
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-forest-700 rounded-full animate-spin" />
          </div>
          <h2 className="mt-8 text-2xl font-serif text-forest-900">Curating your experience...</h2>
          <p className="mt-2 text-earth-stone">This will just take a moment</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-accent-pearl">
      <div className="h-full flex flex-col max-h-screen">
        {/* Progress Section */}
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <PremiumProgressBar 
            current={currentQuestionIndex + 1} 
            total={totalQuestions}
            liveScore={currentScore}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Question Section */}
          <div className="flex-1 flex items-center justify-center px-3 py-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {questions[currentQuestionIndex] && (
                <PremiumQuestionCard
                  key={questions[currentQuestionIndex].id}
                  question={questions[currentQuestionIndex]}
                  questionNumber={currentQuestionIndex + 1}
                  onAnswer={handleAnswer}
                  isLoading={isLoading}
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* Quote Panel */}
          <div className="hidden xl:block w-60 bg-gradient-to-br from-forest-900 to-forest-800 flex-shrink-0">
            <PremiumQuotePanel currentQuestion={currentQuestionIndex} />
          </div>
        </div>
      </div>
    </div>
  )
}