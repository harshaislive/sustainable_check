import { AzureOpenAI } from 'openai'
import { Answer, ReportCard } from '@/types'

export class ReportAgent {
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

    this.systemPrompt = `You are an expert at analyzing sustainability interviews and creating insightful, actionable report cards.
    
    Your role is to:
    1. Synthesize interview responses into a comprehensive sustainability profile
    2. Identify patterns and themes in their answers
    3. Provide specific, actionable recommendations
    4. Create an encouraging yet honest assessment
    5. Use Ryan Deiss's style - be direct, insightful, and motivating
    
    The report should:
    - Celebrate what they're doing well
    - Identify clear opportunities for growth
    - Provide a personality profile related to sustainability
    - Give them a clear next step`
  }

  async generateReport(answers: Answer[]): Promise<ReportCard> {
    const answersText = answers.map((a, i) => 
      `Question ${i + 1}: ${a.value}`
    ).join('\n')

    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        { role: 'system', content: this.systemPrompt },
        {
          role: 'user',
          content: `Analyze these sustainability interview responses and create a comprehensive report card:
          
          ${answersText}
          
          Return as JSON with this structure:
          {
            "overallScore": 0-100,
            "categories": [
              { "name": "category name", "score": 0-100, "description": "brief description" }
            ],
            "insights": ["insight 1", "insight 2", "insight 3"],
            "recommendations": ["specific action 1", "specific action 2", "specific action 3"],
            "personalityProfile": "A paragraph describing their sustainability personality type"
          }`
        }
      ]
    })

    const content = response.choices[0]?.message?.content || '{}'
    return JSON.parse(content)
  }
}