import { NextResponse } from 'next/server'
import { NativeSustainabilityCoordinator } from '@/lib/agents/native-openai-agents'
import { AdaptiveQuestioningSystem } from '@/lib/commitment/adaptive-questions'
import { Answer } from '@/types'
import { BehavioralData } from '@/lib/commitment/scoring-engine'

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
    
    // Skip the adaptive system fallback as it has non-sustainability questions
    console.log('Native OpenAI failed, using improved sustainability fallbacks')
    
    // Diverse, simple sustainability questions with proper options (12 unique questions)
    const diverseQuestions = [
      {
        text: "Do you know where your water comes from?",
        type: "mcq",
        options: [
          "Yes, I know the source and quality",
          "I have a general idea",
          "No, but I'm curious to learn",
          "I don't really think about it",
          "Other (please specify)"
        ],
        context: "Water source awareness shows environmental mindfulness.",
        multiSelect: false,
        encourageOther: "Tell us about your water knowledge"
      },
      {
        text: "Where did you last go for your holiday?",
        type: "mcq",
        options: [
          "Nearby region (within 500km)",
          "Domestic destination",
          "International but nearby country",
          "Long-haul international destination",
          "Other (please specify)"
        ],
        context: "Travel patterns show environmental impact awareness.",
        multiSelect: false,
        encourageOther: "Tell us about your recent travel"
      },
      {
        text: "How would you classify your last holiday?",
        type: "mcq",
        options: [
          "Immersive local experience",
          "Barefoot luxury with local community support",
          "Standard resort/hotel stay",
          "Adventure/outdoor focused",
          "Other (please specify)"
        ],
        context: "Holiday style shows values around community and environment.",
        multiSelect: false,
        encourageOther: "Describe your travel style"
      },
      {
        text: "Is your food residue free?",
        type: "mcq",
        options: [
          "Yes, I buy organic/residue-free",
          "Mostly, I choose carefully",
          "Sometimes, when available",
          "I don't pay attention to this",
          "Other (please specify)"
        ],
        context: "Food quality choices show health and environmental awareness.",
        multiSelect: false,
        encourageOther: "Share your food quality approach"
      },
      {
        text: "Which brands represent your personality best?",
        type: "mcq",
        options: [
          "Sustainable, ethical brands",
          "Quality, heritage brands",
          "Innovative, tech-forward brands",
          "Affordable, practical brands",
          "Other (please specify)"
        ],
        context: "Brand alignment reveals personal values and priorities.",
        multiSelect: false,
        encourageOther: "Tell us about your brand preferences"
      },
      {
        text: "Do you compost your food waste?",
        type: "mcq",
        options: [
          "Yes, always",
          "Sometimes, when convenient",
          "I want to but don't know how",
          "No, it's not practical for me",
          "Other (please specify)"
        ],
        context: "Composting shows commitment to waste reduction.",
        multiSelect: false,
        encourageOther: "Share your waste management approach"
      },
      {
        text: "How do you heat/cool your home?",
        type: "mcq",
        options: [
          "Renewable energy systems",
          "High-efficiency conventional systems",
          "Standard heating/cooling",
          "Minimal use, natural methods",
          "Other (please specify)"
        ],
        context: "Home energy choices show environmental commitment.",
        multiSelect: false,
        encourageOther: "Tell us about your home energy approach"
      },
      {
        text: "Do you buy second-hand clothing?",
        type: "mcq",
        options: [
          "Yes, it's my preferred option",
          "Sometimes, for certain items",
          "Rarely, only when necessary",
          "Never, I prefer new items",
          "Other (please specify)"
        ],
        context: "Second-hand shopping shows circular economy thinking.",
        multiSelect: false,
        encourageOther: "Share your clothing shopping habits"
      },
      {
        text: "How do you handle electronic waste?",
        type: "mcq",
        options: [
          "I take it to proper recycling centers",
          "I donate or sell working electronics",
          "I keep old devices as backups",
          "I usually throw them in regular trash",
          "Other (please specify)"
        ],
        context: "E-waste management shows environmental responsibility.",
        multiSelect: false,
        encourageOther: "Tell us about your e-waste approach"
      },
      {
        text: "Do you use public transportation regularly?",
        type: "mcq",
        options: [
          "Yes, it's my primary transport",
          "Sometimes, when convenient",
          "Rarely, only when necessary",
          "Never, I prefer personal vehicles",
          "Other (please specify)"
        ],
        context: "Public transport use shows climate consciousness.",
        multiSelect: false,
        encourageOther: "Share your transportation choices"
      },
      {
        text: "How do you manage household cleaning products?",
        type: "mcq",
        options: [
          "I use eco-friendly/natural products",
          "I make my own cleaning solutions",
          "I choose standard commercial brands",
          "I don't pay attention to ingredients",
          "Other (please specify)"
        ],
        context: "Cleaning product choices impact home and environment.",
        multiSelect: false,
        encourageOther: "Tell us about your cleaning approach"
      },
      {
        text: "Do you grow any of your own food?",
        type: "mcq",
        options: [
          "Yes, I have a garden/significant growing",
          "I have herbs or small plants",
          "I want to but don't have space",
          "No, I haven't considered it",
          "Other (please specify)"
        ],
        context: "Growing food connects you to sustainable food systems.",
        multiSelect: false,
        encourageOther: "Share your growing experience"
      }
    ]
    
    // Track which questions have been used to avoid repetition
    const usedQuestionTexts = new Set()
    
    // Extract question texts from previous answers (rough matching)
    answers.forEach((answer: Answer) => {
      // This is a simplified approach - we'd need to store actual question texts
      // For now, we'll use a more robust fallback selection
      if (answer.value && typeof answer.value === 'string') {
        usedQuestionTexts.add(answer.value.toLowerCase())
      }
    })
    
    // Find an unused question or use round-robin with better randomization
    let selectedQuestion = diverseQuestions[0]
    let attempts = 0
    const maxAttempts = diverseQuestions.length
    
    while (attempts < maxAttempts) {
      const index = (answers.length + Date.now() + attempts) % diverseQuestions.length
      const candidateQuestion = diverseQuestions[index]
      
      // Simple check to avoid recently used questions
      const isRecentlyUsed = answers.slice(-3).some((ans: Answer) => 
        ans.questionId && ans.questionId.includes(candidateQuestion.text.split(' ')[0].toLowerCase())
      )
      
      if (!isRecentlyUsed) {
        selectedQuestion = candidateQuestion
        break
      }
      attempts++
    }
    
    const fallbackQuestion = {
      id: `q-fallback-${Date.now()}-${answers.length}`,
      ...selectedQuestion
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