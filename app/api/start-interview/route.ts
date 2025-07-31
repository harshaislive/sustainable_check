import { NextResponse } from 'next/server'
import { NativeSustainabilityCoordinator } from '@/lib/agents/native-openai-agents'

export async function POST() {
  try {
    const coordinator = new NativeSustainabilityCoordinator()
    const firstQuestion = await coordinator.generateInitialQuestion()
    
    return NextResponse.json(firstQuestion)
  } catch (error) {
    console.error('Error generating initial question with native agents:', error)
    
    // Personal sustainability fallback questions
    const fallbackQuestions = [
      {
        id: 'fallback-start',
        text: "What first sparked your interest in sustainability?",
        type: "mcq",
        options: [
          "Concern for future generations",
          "Personal health and wellbeing", 
          "Environmental news or documentaries",
          "Cost savings and efficiency"
        ],
        context: "Understanding your sustainability journey beginning."
      },
      {
        id: 'fallback-daily',
        text: "How do you currently approach sustainability in daily life?",
        type: "mcq",
        options: [
          "Small consistent changes",
          "Big lifestyle shifts",
          "Still learning and exploring",
          "Focus on specific areas"
        ],
        context: "Daily habits reveal your personal sustainability approach."
      },
      {
        id: 'fallback-motivation',
        text: "What motivates your sustainability choices?",
        type: "mcq",
        options: [
          "Environmental protection",
          "Health and wellness",
          "Financial benefits",
          "Social responsibility"
        ],
        context: "Motivation shows the depth of your sustainability commitment."
      }
    ]
    
    const questionIndex = Math.floor(Math.random() * fallbackQuestions.length)
    return NextResponse.json(fallbackQuestions[questionIndex])
  }
}