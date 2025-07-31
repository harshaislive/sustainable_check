import { AzureOpenAI } from "openai"
import { Answer } from '@/types'
import { BehavioralData } from '@/lib/commitment/behavioral-tracker'

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!
})

export class NativeQuestionAgent {
  async generateInitialQuestion() {
    try {
      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a sustainability consultant interviewing people about their personal sustainability journey and lifestyle choices. Always respond with valid JSON only."
          },
          {
            role: "user", 
            content: `Create a warm, personal opening question about sustainability for individuals. Focus on their personal approach to sustainability in daily life.

Return only this JSON format:
{
  "text": "How do you personally approach sustainability in your daily life?",
  "type": "mcq",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "context": "One sentence about personal sustainability journey.",
  "id": "native-q-1"
}

Make it PERSONAL, relatable, and about individual sustainability choices - not corporate or executive language.`
          }
        ],
        max_completion_tokens: 1000,
        model: process.env.AZURE_OPENAI_DEPLOYMENT!
      })

      const content = response.choices[0]?.message?.content
      console.log('OpenAI response content:', content)
      
      if (content) {
        // Clean the content in case there are markdown code blocks
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Cleaned content length:', cleanContent.length)
        console.log('Full cleaned content:', cleanContent)
        
        try {
          return JSON.parse(cleanContent)
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          console.error('Content that failed to parse:', cleanContent)
          throw parseError
        }
      }
      throw new Error('No content returned')
    } catch (error) {
      console.error('Native OpenAI agent error:', error)
      // Fallback question
      return {
        id: 'native-fallback-initial',
        text: "What first got you interested in sustainability?",
        type: "mcq",
        options: [
          "Concern for future generations",
          "Personal health and wellbeing", 
          "Environmental documentaries or news",
          "Cost savings and efficiency"
        ],
        context: "Understanding your sustainability journey starting point."
      }
    }
  }

  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: Answer[],
    currentScore: number
  ) {
    try {
      const context = previousAnswers.map((ans, i) => 
        `Q${i+1}: ${ans.value}`
      ).join('\n')

      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a sustainability consultant interviewing individuals about their personal environmental and social commitment. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: `Create sustainability question ${questionNumber} for a personal interview. 

Previous personal answers:
${context}

Current commitment score: ${currentScore}

Return only this JSON format:
{
  "text": "Your personal sustainability question here?",
  "type": "mcq",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "context": "One sentence about personal sustainability assessment.",
  "id": "native-q-${questionNumber}"
}

Types available: "mcq", "text", "mcq_text"
Focus on PERSONAL SUSTAINABILITY: daily habits, lifestyle choices, consumption patterns, travel decisions, home choices, personal values, individual climate actions.
Make it relatable and personal - NOT corporate or organizational language. Build on previous personal answers.`
          }
        ],
        max_completion_tokens: 1200,
        model: process.env.AZURE_OPENAI_DEPLOYMENT!
      })

      const content = response.choices[0]?.message?.content
      console.log('OpenAI next question response:', content)
      
      if (content) {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Next question cleaned content:', cleanContent)
        
        try {
          return JSON.parse(cleanContent)
        } catch (parseError) {
          console.error('Next question JSON parsing failed:', parseError)
          console.error('Next question content that failed:', cleanContent)
          throw parseError
        }
      }
      throw new Error('No content returned')
    } catch (error) {
      console.error('Native OpenAI next question error:', error)
      
      // Personal sustainability fallback questions
      const fallbacks = [
        {
          text: "What sustainability changes have you made at home?",
          type: "mcq_text",
          options: ["Energy-efficient appliances", "Reduced plastic use", "Sustainable food choices", "Water conservation"],
          context: "Home changes show personal commitment to sustainability."
        },
        {
          text: "How do you think about sustainability when making purchases?",
          type: "text",
          context: "Purchasing decisions reveal personal sustainability values."
        },
        {
          text: "What's your biggest sustainability challenge personally?",
          type: "mcq",
          options: ["Travel and transportation", "Food and consumption", "Waste and recycling", "Energy use at home"],
          context: "Personal challenges show areas for growth and commitment."
        }
      ]
      
      const fallback = fallbacks[questionNumber % fallbacks.length]
      return {
        id: `native-fallback-${questionNumber}`,
        ...fallback
      }
    }
  }

  async generateReport(
    answers: Answer[],
    behavioralData: BehavioralData[],
    commitmentScore: any
  ) {
    try {
      const answersText = answers.map((ans, i) => 
        `Q${i+1}: ${ans.value}`
      ).join('\n')

      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a senior consultant writing an executive assessment report for C-suite individuals.

Interview Responses:
${answersText}

Commitment Score: ${commitmentScore.finalScore}
Level: ${commitmentScore.level}

Generate a sophisticated executive report with:
1. Executive Summary (commitment level and key insights)
2. Behavioral Profile (4-5 key insights)
3. Strategic Recommendations (4-5 actionable strategies)

Return JSON:
{
  "summary": "Personal summary of their sustainability commitment and profile",
  "insights": ["Personal insight 1", "Personal insight 2", "Personal insight 3", "Personal insight 4", "Personal insight 5"],
  "recommendations": ["Personal recommendation 1", "Personal recommendation 2", "Personal recommendation 3", "Personal recommendation 4", "Personal recommendation 5"],
  "categories": [
    {"name": "Home & Lifestyle", "score": 75, "description": "Your approach to sustainable living at home"},
    {"name": "Consumption", "score": 60, "description": "How you think about purchases and waste"},
    {"name": "Transportation", "score": 45, "description": "Your travel and commuting choices"},
    {"name": "Community Impact", "score": 80, "description": "Your influence on others and social responsibility"}
  ],
  "personalityProfile": "Brief description of their sustainability personality and approach"
}`
          },
          {
            role: "user",
            content: `Generate an executive assessment report based on the interview responses and commitment analysis.`
          }
        ],
        max_completion_tokens: 1500,
        model: process.env.AZURE_OPENAI_DEPLOYMENT!
      })

      const content = response.choices[0]?.message?.content
      console.log('Report response content:', content)
      
      if (content) {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Report cleaned content:', cleanContent)
        
        try {
          return JSON.parse(cleanContent)
        } catch (parseError) {
          console.error('Report JSON parsing failed:', parseError)
          console.error('Report content that failed:', cleanContent)
          throw parseError
        }
      }
      throw new Error('No content returned')
    } catch (error) {
      console.error('Native OpenAI report error:', error)
      
      // Fallback report
      return {
        summary: `Based on your responses, you demonstrate ${commitmentScore.level} level commitment to sustainability with genuine personal engagement.`,
        insights: [
          `Action Taking: ${Math.round(commitmentScore.actionVelocity * 100)}% - You ${commitmentScore.actionVelocity > 0.7 ? 'take quick action on sustainability goals' : 'think carefully before making sustainability changes'}`,
          `Resource Investment: ${Math.round(commitmentScore.resourceAllocation * 100)}% - You ${commitmentScore.resourceAllocation > 0.7 ? 'invest significantly in sustainable options' : 'are growing your sustainable investments'}`,
          `Personal Influence: ${Math.round(commitmentScore.influenceRadius * 100)}% - You ${commitmentScore.influenceRadius > 0.7 ? 'actively influence others toward sustainability' : 'lead by personal example'}`,
          `Commitment Depth: ${Math.round(commitmentScore.commitmentIntensity * 100)}% - Your commitment ${commitmentScore.commitmentIntensity > 0.7 ? 'runs deep with long-term thinking' : 'is genuine and developing'}`,
          "Your personal sustainability journey shows authentic engagement and growth potential"
        ],
        recommendations: [
          "Continue building sustainable habits in your daily routine",
          "Connect with local sustainability groups and communities",
          "Explore new areas where you can make a personal impact", 
          "Share your sustainability journey to inspire others",
          "Consider taking on bigger challenges that align with your values"
        ],
        categories: [
          {
            name: "Home & Lifestyle",
            score: Math.round(commitmentScore.resourceAllocation * 100),
            description: "Your approach to sustainable living at home"
          },
          {
            name: "Consumption Choices", 
            score: Math.round(commitmentScore.actionVelocity * 80),
            description: "How thoughtfully you make purchasing decisions"
          },
          {
            name: "Personal Impact",
            score: Math.round(commitmentScore.commitmentIntensity * 100), 
            description: "Your personal commitment to making a difference"
          },
          {
            name: "Community Influence",
            score: Math.round(commitmentScore.influenceRadius * 100),
            description: "How you inspire others toward sustainability"
          }
        ],
        personalityProfile: `You are a ${commitmentScore.level} in your sustainability journey, showing ${commitmentScore.finalScore >= 60 ? 'strong commitment' : commitmentScore.finalScore >= 30 ? 'growing engagement' : 'developing awareness'} and authentic personal values around environmental and social responsibility.`
      }
    }
  }
}

export class NativeSustainabilityCoordinator {
  private questionAgent: NativeQuestionAgent
  
  constructor() {
    this.questionAgent = new NativeQuestionAgent()
  }
  
  async generateInitialQuestion() {
    return await this.questionAgent.generateInitialQuestion()
  }
  
  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: Answer[],
    currentScore: number
  ) {
    return await this.questionAgent.generateNextQuestion(
      questionNumber,
      previousAnswers,
      currentScore
    )
  }
  
  async generateFinalReport(
    answers: Answer[],
    behavioralData: BehavioralData[],
    commitmentScore: any
  ) {
    const reportData = await this.questionAgent.generateReport(
      answers,
      behavioralData,
      commitmentScore
    )
    
    return {
      report: {
        id: `native-report-${Date.now()}`,
        summary: reportData.summary,
        insights: reportData.insights,
        recommendations: reportData.recommendations,
        score: commitmentScore.finalScore,
        level: commitmentScore.level,
        confidence: commitmentScore.confidence,
        timestamp: new Date()
      },
      commitmentScore
    }
  }
}