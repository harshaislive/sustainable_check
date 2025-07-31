import { Question, Answer } from '@/types'
import { CommitmentLevel } from './scoring-engine'

export class AdaptiveQuestioningSystem {
  
  selectNextQuestion(
    currentScore: number,
    previousAnswers: Answer[],
    questionNumber: number
  ): QuestionTemplate {
    
    const level = this.inferLevel(currentScore)
    const topic = this.getTopicForQuestion(questionNumber)
    
    if (level === 'Visionary' && questionNumber > 5) {
      return this.getVisionaryQuestion(topic, previousAnswers)
    } else if (level === 'Catalyst' && currentScore > 50) {
      return this.getCatalystQuestion(topic, previousAnswers)
    } else if (level === 'Advocate' && currentScore > 25) {
      return this.getAdvocateQuestion(topic, previousAnswers)
    } else {
      return this.getExplorerQuestion(topic, previousAnswers)
    }
  }
  
  private inferLevel(score: number): CommitmentLevel {
    if (score >= 60) return 'Visionary'
    if (score >= 40) return 'Catalyst'
    if (score >= 20) return 'Advocate'
    return 'Explorer'
  }
  
  private getTopicForQuestion(questionNumber: number): string {
    const topics = [
      'morning_ritual',     // Time sovereignty
      'travel_preferences', // Lifestyle indicators  
      'home_environment',   // Investment patterns
      'decision_making',    // Action velocity
      'luxury_definition',  // Values alignment
      'community_impact',   // Influence radius
      'learning_investment', // Growth mindset
      'time_allocation',    // Priority management
      'legacy_thinking',    // Long-term vision
      'transformation_readiness' // Commitment intensity
    ]
    return topics[questionNumber - 1] || 'values_exploration'
  }
  
  // EXPLORER LEVEL QUESTIONS (0-25)
  // Focus: Awareness building, low commitment
  private getExplorerQuestion(topic: string, previousAnswers: Answer[]): QuestionTemplate {
    const explorerQuestions: Record<string, QuestionTemplate> = {
      morning_ritual: {
        text: "How do you prefer starting mornings?",
        type: "mcq",
        options: [
          "Quick coffee and go",
          "Slow mindful routine", 
          "Exercise then breakfast",
          "Whatever feels right"
        ],
        context: "Morning habits reveal your relationship with time.",
        level: 'Explorer',
        scoringHints: {
          actionVelocity: [0.2, 0.6, 0.8, 0.3],
          resourceAllocation: [0.1, 0.7, 0.6, 0.2]
        }
      },
      
      travel_preferences: {
        text: "What draws you to new places?",
        type: "mcq", 
        options: [
          "Adventure and excitement",
          "Culture and learning",
          "Relaxation and escape", 
          "Unique experiences"
        ],
        context: "Travel preferences show your curiosity and values.",
        level: 'Explorer'
      },
      
      decision_making: {
        text: "How do you make important choices?",
        type: "mcq",
        options: [
          "Quick gut instinct",
          "Careful research first",
          "Ask trusted advisors",
          "Sleep on it"
        ],
        context: "Decision patterns reveal your action style.",
        level: 'Explorer'
      }
    }
    
    return explorerQuestions[topic] || explorerQuestions.morning_ritual
  }
  
  // ADVOCATE LEVEL QUESTIONS (26-50)  
  // Focus: Personal commitment, self-development
  private getAdvocateQuestion(topic: string, previousAnswers: Answer[]): QuestionTemplate {
    const advocateQuestions: Record<string, QuestionTemplate> = {
      luxury_definition: {
        text: "What represents luxury to you today?",
        type: "text",
        context: "Modern luxury reflects personal values and priorities.",
        level: 'Advocate',
        scoringHints: {
          commitmentIntensity: 0.7,
          resourceAllocation: 0.6
        }
      },
      
      learning_investment: {
        text: "Where do you invest learning time?",
        type: "mcq",
        options: [
          "Skills for immediate use",
          "Long-term capability building", 
          "Personal transformation",
          "Industry expertise"
        ],
        context: "Learning choices show commitment to growth.",
        level: 'Advocate'
      },
      
      home_environment: {
        text: "What makes your space feel right?",
        type: "mcq",
        options: [
          "Clean and organized",
          "Warm and welcoming",
          "Inspiring and creative",
          "Sustainable and mindful"
        ],
        context: "Home choices reflect inner values.",
        level: 'Advocate'
      }
    }
    
    return advocateQuestions[topic] || advocateQuestions.luxury_definition
  }
  
  // CATALYST LEVEL QUESTIONS (51-75)
  // Focus: Leadership, influence, change-making
  private getCatalystQuestion(topic: string, previousAnswers: Answer[]): QuestionTemplate {
    const catalystQuestions: Record<string, QuestionTemplate> = {
      community_impact: {
        text: "How do you create positive change?",
        type: "mcq",
        options: [
          "Lead by example",
          "Mentor and teach others",
          "Build systems and processes", 
          "Inspire through vision"
        ],
        context: "Change-making style reveals leadership approach.",
        level: 'Catalyst',
        scoringHints: {
          influenceRadius: 0.8,
          commitmentIntensity: 0.7
        }
      },
      
      time_allocation: {
        text: "What deserves your prime attention?",
        type: "mcq",
        options: [
          "High-impact projects",
          "Team development",
          "Strategic thinking",
          "Relationship building"
        ],
        context: "Attention allocation shows leadership priorities.",
        level: 'Catalyst'
      },
      
      decision_making: {
        text: "How do you approach major decisions?",
        type: "text", 
        context: "Decision processes reveal executive thinking.",
        level: 'Catalyst'
      }
    }
    
    return catalystQuestions[topic] || catalystQuestions.community_impact
  }
  
  // VISIONARY LEVEL QUESTIONS (76-100)
  // Focus: Systemic change, legacy, transformation
  private getVisionaryQuestion(topic: string, previousAnswers: Answer[]): QuestionTemplate {
    const visionaryQuestions: Record<string, QuestionTemplate> = {
      legacy_thinking: {
        text: "What legacy will you leave behind?",
        type: "text",
        context: "Legacy thinking reveals depth of purpose.",
        level: 'Visionary',
        scoringHints: {
          commitmentIntensity: 0.9,
          influenceRadius: 0.8
        }
      },
      
      transformation_readiness: {
        text: "What would you sacrifice for lasting impact?",
        type: "text",
        context: "Sacrifice willingness shows commitment depth.",
        level: 'Visionary'
      },
      
      community_impact: {
        text: "How will you transform your industry?",
        type: "mcq",
        options: [
          "Disrupt existing models",
          "Build new standards",
          "Create collaborative movements",
          "Pioneer breakthrough solutions"
        ],
        context: "Industry transformation shows visionary thinking.",
        level: 'Visionary'
      }
    }
    
    return visionaryQuestions[topic] || visionaryQuestions.legacy_thinking
  }
}

export interface QuestionTemplate {
  text: string
  type: 'mcq' | 'text'
  options?: string[]
  context: string
  level: CommitmentLevel
  scoringHints?: {
    actionVelocity?: number | number[]
    resourceAllocation?: number | number[]
    influenceRadius?: number | number[]
    commitmentIntensity?: number | number[]
  }
}

// Behavioral trigger questions that appear based on responses
export const triggerQuestions = {
  scarcity: {
    text: "If only 100 people could access this opportunity...",
    type: "mcq",
    options: [
      "I'd want to learn more immediately",
      "I'd need to understand the value first", 
      "I'd want to know who else is involved",
      "I'd be skeptical of the exclusivity"
    ],
    context: "Scarcity response reveals decision patterns."
  },
  
  social_proof: {
    text: "When industry leaders embrace new approaches...",
    type: "mcq", 
    options: [
      "I study their methods closely",
      "I wait to see results first",
      "I prefer to pioneer my own path",
      "I look for the underlying principles"
    ],
    context: "Social proof sensitivity shows influence patterns."
  },
  
  status_motivation: {
    text: "What drives your biggest accomplishments?",
    type: "mcq",
    options: [
      "Recognition from peers",
      "Personal satisfaction",
      "Impact on others", 
      "Legacy creation"
    ],
    context: "Motivation reveals core drivers."
  }
}