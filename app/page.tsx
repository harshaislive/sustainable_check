'use client'

import { useState, useEffect } from 'react'
import PremiumInterviewModal from '@/components/PremiumInterviewModal'
import PremiumReportCard from '@/components/PremiumReportCard'
import LandingPage from '@/components/LandingPage'
import MomentOfTruthReveal from '@/components/MomentOfTruthReveal'
import { Answer, ReportCard as ReportCardType } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

export default function Home() {
  const [stage, setStage] = useState<'landing' | 'interview' | 'revealing' | 'report'>('landing')
  const [reportData, setReportData] = useState<ReportCardType | null>(null)
  const [commitmentScore, setCommitmentScore] = useState<CommitmentScore | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Answer[]>([])

  const handleStartInterview = () => {
    setStage('interview')
  }

  const handleInterviewComplete = async (answers: Answer[], behavioralData: any[]) => {
    // Prevent double report generation
    if (isGeneratingReport) {
      console.log('Report already being generated, ignoring duplicate')
      return
    }
    
    setUserAnswers(answers) // Store answers for progression guidance
    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, behavioralData })
      })
      const { report, commitmentScore } = await response.json()
      setReportData(report)
      setCommitmentScore(commitmentScore)
      setStage('revealing') // Show moment of truth first
    } catch (error) {
      console.error('Error generating report:', error)
      // Reset loading state on error
      setIsGeneratingReport(false)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleRevealComplete = () => {
    setStage('report')
  }

  const handleRestart = () => {
    setStage('landing')
    setReportData(null)
    setCommitmentScore(null)
    setUserAnswers([])
  }

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-gradient-dawn flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8 w-24 h-24 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-forest-700/20 rounded-full animate-spin" />
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-forest-700 rounded-full animate-spin" />
          </div>
          <h2 className="text-3xl font-serif text-forest-900 mb-2">Crafting your sustainability constellation...</h2>
          <p className="text-earth-stone">Analyzing your responses with care</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {stage === 'landing' && <LandingPage onStart={handleStartInterview} />}
      {stage === 'interview' && <PremiumInterviewModal onComplete={handleInterviewComplete} />}
      {stage === 'revealing' && commitmentScore && (
        <MomentOfTruthReveal 
          score={commitmentScore}
          onComplete={handleRevealComplete}
        />
      )}
      {stage === 'report' && reportData && commitmentScore && (
        <PremiumReportCard 
          report={reportData} 
          commitmentScore={commitmentScore}
          onRestart={handleRestart}
          answers={userAnswers}
        />
      )}
    </>
  )
}