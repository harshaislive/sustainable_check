'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Question, Answer } from '@/types'
import PremiumQuestionCard from './PremiumQuestionCard'
import PremiumQuotePanel from './PremiumQuotePanel'
import PremiumProgressBar from './PremiumProgressBar'
import { BehavioralTracker } from '@/lib/commitment/behavioral-tracker'
import { BehavioralData } from '@/lib/commitment/scoring-engine'
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
  const [isInitialized, setIsInitialized] = useState(false)
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)

  const totalQuestions = 10

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (!isInitialized) {
      setIsInitialized(true)
      fetchInitialQuestion()
    }
  }, [])

  const fetchInitialQuestion = async () => {
    console.log('Fetching initial question...')
    try {
      const response = await fetch('/api/start-interview', {
        method: 'POST'
      })
      const firstQuestion = await response.json()
      console.log('Received initial question:', firstQuestion)
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
    // Prevent double-processing
    if (isProcessingAnswer) {
      console.log('Answer already being processed, ignoring duplicate')
      return
    }
    
    setIsProcessingAnswer(true)
    console.log('Handling answer:', answer, 'for question index:', currentQuestionIndex)
    
    try {
      // Finish behavioral tracking for current question
      const currentBehavioralData = tracker.finishQuestion(answer)
      const updatedBehavioralData = [...behavioralData, currentBehavioralData]
      setBehavioralData(updatedBehavioralData)

    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      questionText: questions[currentQuestionIndex].text,
      value: answer,
      timestamp: new Date(),
      isCustomResponse: answer.toLowerCase().includes('other:')
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    // Calculate live score for adaptive questioning
    const liveScore = scoringEngine.calculateLiveScore(updatedAnswers, updatedBehavioralData)
    setCurrentScore(liveScore)

      if (currentQuestionIndex < totalQuestions - 1) {
        setIsLoading(true)
        let retries = 0
        const maxRetries = 2
        
        while (retries <= maxRetries) {
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
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const nextQuestion = await response.json()
            
            // Validate question structure
            if (!nextQuestion.text || !nextQuestion.options) {
              throw new Error('Invalid question format received')
            }
            
            setQuestions([...questions, nextQuestion])
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            
            // Start tracking for next question
            tracker.startQuestion()
            break // Success, exit retry loop
            
          } catch (error) {
            console.error(`Error generating question (attempt ${retries + 1}):`, error)
            retries++
            
            if (retries > maxRetries) {
              // Final fallback - skip to completion
              console.error('Max retries reached, completing assessment')
              onComplete(updatedAnswers, updatedBehavioralData)
              break
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retries))
          }
        }
        setIsLoading(false)
      } else {
        onComplete(updatedAnswers, updatedBehavioralData)
      }
    } catch (error) {
      console.error('Error in handleAnswer:', error)
    } finally {
      setIsProcessingAnswer(false)
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
      <div className="h-full flex flex-col max-h-screen min-h-screen">
        {/* Progress Section */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex-shrink-0 safe-area-top">
          <PremiumProgressBar 
            current={currentQuestionIndex + 1} 
            total={totalQuestions}
            liveScore={currentScore}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Question Section */}
          <div className="flex-1 px-3 sm:px-4 py-2 sm:py-4 pb-24 overflow-y-auto overflow-x-hidden safe-area-bottom" style={{ WebkitOverflowScrolling: 'touch' }}>
            <AnimatePresence mode="wait">
              {questions[currentQuestionIndex] && (
                <PremiumQuestionCard
                  key={questions[currentQuestionIndex].id}
                  question={questions[currentQuestionIndex]}
                  questionNumber={currentQuestionIndex + 1}
                  onAnswer={handleAnswer}
                  isLoading={isLoading || isProcessingAnswer}
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