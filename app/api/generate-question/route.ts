import { NextResponse } from 'next/server'
import { NativeSustainabilityCoordinator } from '@/lib/agents/native-openai-agents'
import { AdaptiveQuestioningSystem } from '@/lib/commitment/adaptive-questions'
import { Answer } from '@/types'
import { BehavioralData } from '@/lib/commitment/behavioral-tracker'

export async function POST(request: Request) {
  try {
    const { answers, behavioralData, currentScore } = await request.json()
    
    // Try native OpenAI agents first
    try {
      const coordinator = new NativeSustainabilityCoordinator()
      const questionNumber = answers.length + 1
      
      const nextQuestion = await coordinator.generateNextQuestion(
        questionNumber,
        answers as Answer[],
        currentScore
      )
      
      return NextResponse.json(nextQuestion)
    } catch (nativeError) {
      console.warn('Native OpenAI agents failed, falling back to adaptive system:', nativeError)
    }
    
    // Fallback to adaptive questioning system
    if (currentScore !== undefined && answers.length > 2) {
      try {
        const adaptiveSystem = new AdaptiveQuestioningSystem()
        const questionTemplate = adaptiveSystem.selectNextQuestion(
          currentScore,
          answers as Answer[],
          answers.length + 1
        )
        
        // Convert template to Question format
        const nextQuestion = {
          id: `q-adaptive-${Date.now()}`,
          text: questionTemplate.text,
          type: questionTemplate.type,
          options: questionTemplate.options,
          context: questionTemplate.context
        }
        
        return NextResponse.json(nextQuestion)
      } catch (adaptiveError) {
        console.warn('Adaptive system failed:', adaptiveError)
      }
    }
    
    // Enhanced fallback questions with variety
    const diverseQuestions = [
      {
        text: "What drives your quality preferences?",
        type: "mcq",
        options: ["Craftsmanship and durability", "Brand reputation", "Sustainable sourcing", "Performance excellence"],
        context: "Quality choices reveal deeper values."
      },
      {
        text: "How do you invest learning time?",
        type: "mcq_text",
        options: ["Executive coaching programs", "Industry masterclasses", "Self-directed research", "Peer advisory groups"],
        context: "Learning investments show growth commitment."
      },
      {
        text: "What defines meaningful impact for you?",
        type: "text",
        context: "Impact vision reveals leadership potential."
      },
      {
        text: "Where do you see sustainability creating value?",
        type: "mcq",
        options: ["Operational efficiency", "Brand differentiation", "Risk mitigation", "Innovation catalyst"], 
        context: "Business sustainability thinking."
      },
      {
        text: "How do you approach lifestyle changes?",
        type: "mcq_text",
        options: ["Gradual, sustainable shifts", "Bold, transformative leaps", "Research-based decisions", "Values-driven choices"],
        context: "Change approach reveals commitment depth."
      }
    ]
    
    const questionIndex = (answers.length + Date.now()) % diverseQuestions.length
    const fallbackQuestion = {
      id: `q-fallback-${Date.now()}`,
      ...diverseQuestions[questionIndex]
    }
    
    return NextResponse.json(fallbackQuestion)
  } catch (error) {
    console.error('Error generating next question:', error)
    return NextResponse.json(
      { error: 'Failed to generate next question' },
      { status: 500 }
    )
  }
}