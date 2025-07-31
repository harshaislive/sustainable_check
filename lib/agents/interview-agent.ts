import { AzureOpenAI } from 'openai'
import { Question, Answer } from '@/types'

export class InterviewAgent {
  private client: AzureOpenAI
  private deploymentName: string
  private systemPrompt: string

  constructor(apiKey: string, endpoint: string, deploymentName: string) {
    this.client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: '2025-01-01-preview',
      deployment: deploymentName
    })
    this.deploymentName = deploymentName

    this.systemPrompt = `You are an elite sustainability consultant creating BRIEF, engaging questions for high-achieving individuals. Think Ryan Deiss meets modern minimalism.

    CRITICAL: Keep questions SHORT and punchy (6-10 words max).
    
    Your role:
    1. Create sophisticated but BRIEF questions
    2. Use elevated yet approachable language
    3. Subtly assess lifestyle without being obvious
    4. Make each question feel exclusive yet effortless
    
    Wealth indicators to explore subtly:
    - Travel patterns and preferences
    - Home features and lifestyle
    - Time flexibility and priorities  
    - Quality consciousness
    - Network influence
    - Investment mindset
    - Learning pursuits
    - Philanthropic interests
    
    Style rules:
    - Questions: 6-10 words maximum
    - Options: 3-5 words each
    - Context: 1 sentence only
    - Tone: Sophisticated but conversational
    - Focus: Quality over quantity of words`
  }

  async generateInitialQuestion(): Promise<Question> {
    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        { role: 'system', content: this.systemPrompt },
        {
          role: 'user',
          content: `Generate a brief, engaging opening question (MAX 10 words). Focus on morning rituals that reveal lifestyle.

          Requirements:
          - Question: 6-10 words maximum
          - 4 short options (3-5 words each)
          - Options should subtly indicate wealth/flexibility
          - Context: 1 sentence maximum
          
          Example style: "How do you prefer starting your day?"
          
          Return as JSON: { 
            "text": "short question", 
            "type": "mcq", 
            "options": ["brief option1", "brief option2", "brief option3", "brief option4"], 
            "context": "One elegant sentence."
          }`
        }
      ]
    })

    const content = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)
    
    return {
      id: `q-${Date.now()}`,
      ...parsed
    }
  }

  async generateNextQuestion(previousAnswers: Answer[]): Promise<Question> {
    const conversationHistory = previousAnswers.map(a => 
      `Q${a.questionId}: ${a.value}`
    ).join('\n')

    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        { role: 'system', content: this.systemPrompt },
        {
          role: 'user',
          content: `Previous answers: ${conversationHistory}
          
          Generate question ${previousAnswers.length + 1} of 10. Keep it VERY short and engaging.
          
          Requirements:
          - Question: 6-10 words maximum
          - If MCQ: 4 options, 3-5 words each
          - If text: Skip options
          - Context: 1 sentence maximum
          - Build on previous answers naturally
          - Maintain sophisticated tone
          
          Topics to explore: ${this.getNextTopic(previousAnswers.length)}
          
          Return as JSON: { "text": "short question", "type": "mcq" or "text", "options": [...] (if mcq), "context": "One sentence." }`
        }
      ]
    })

    const content = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)
    
    return {
      id: `q-${Date.now()}`,
      ...parsed
    }
  }

  private getNextTopic(questionNumber: number): string {
    const topics = [
      'Travel preferences and destinations',
      'Home and living environment', 
      'Food and dining choices',
      'Investment and future planning',
      'Community and social impact',
      'Time allocation and priorities',
      'Shopping and consumption habits',
      'Learning and personal growth',
      'Giving back and philanthropy'
    ]
    return topics[questionNumber] || 'Personal values and lifestyle'
  }
}