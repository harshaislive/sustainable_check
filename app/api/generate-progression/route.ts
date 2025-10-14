import { NextResponse } from 'next/server'
import { AzureOpenAI } from "openai"
import { Answer } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!
})

export async function POST(request: Request) {
  let requestData: { answers?: Answer[], commitmentScore?: CommitmentScore } = {}
  
  try {
    requestData = await request.json()
    const { answers = [], commitmentScore } = requestData
    
    if (!commitmentScore) {
      throw new Error('Missing commitment score data')
    }
    
    const answersText = answers.map((ans: Answer, i: number) => 
      `Q${i+1}: ${ans.value}`
    ).join('\n')

    const nextLevel = getNextLevel(commitmentScore.level)
    const targetScore = getTargetScore(commitmentScore.level)
    const pointsNeeded = targetScore - commitmentScore.finalScore

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a sustainability coach providing personalized guidance to help someone advance their sustainability commitment.

ANALYZE THEIR RESPONSES:
${answersText}

CURRENT SITUATION:
- Current Level: ${commitmentScore.level}
- Current Score: ${commitmentScore.finalScore}
- Target Level: ${nextLevel}
- Target Score: ${targetScore}
- Points Needed: ${pointsNeeded}

SCORING COMPONENTS:
- Action Velocity: ${Math.round(commitmentScore.actionVelocity * 100)}%
- Resource Allocation: ${Math.round(commitmentScore.resourceAllocation * 100)}%
- Influence Radius: ${Math.round(commitmentScore.influenceRadius * 100)}%  
- Commitment Intensity: ${Math.round(commitmentScore.commitmentIntensity * 100)}%

TASK: Generate personalized, actionable guidance to help them reach the next level.

REQUIREMENTS:
- Be specific and actionable based on their actual responses
- Address their weakest scoring components first
- Provide 2-3 concrete next steps they can take immediately
- Keep it encouraging and achievable
- Make it personal to their situation, not generic advice
- Focus on practical actions that will increase their score

FORMAT YOUR RESPONSE AS CLEAN MARKDOWN:
- Start with a brief encouraging sentence about their current progress
- Then provide 2-3 numbered action items
- Use **bold** for key action words
- Keep each action item to 2-3 sentences max
- Total response should be 150-200 words
- NO headings, NO horizontal rules, NO extra formatting`
        },
        {
          role: "user",
          content: `Based on my sustainability assessment responses and current ${commitmentScore.level} level (${commitmentScore.finalScore} points), provide personalized guidance to help me reach ${nextLevel} level (${targetScore}+ points). I need ${pointsNeeded} more points.

Focus on specific actions I can take based on my responses, not general advice. Make it personal and actionable. Format as clean markdown with numbered steps.`
        }
      ],
      max_completion_tokens: 400,
      model: process.env.AZURE_OPENAI_DEPLOYMENT!
    })

    const guidance = response.choices[0]?.message?.content

    if (guidance) {
      return NextResponse.json({ 
        guidance: guidance.trim(),
        pointsNeeded,
        targetScore,
        nextLevel
      })
    }

    throw new Error('No guidance generated')

  } catch (error) {
    console.error('Error generating progression guidance:', error)
    
    // Use already parsed data for fallback
    const currentLevel = requestData.commitmentScore?.level || 'Explorer'
    const currentScore = requestData.commitmentScore?.finalScore || 0
    const nextLevel = getNextLevel(currentLevel)
    const targetScore = getTargetScore(currentLevel)
    
    return NextResponse.json({
      guidance: getFallbackGuidance(currentLevel),
      pointsNeeded: Math.max(0, targetScore - currentScore),
      targetScore,
      nextLevel
    })
  }
}

function getNextLevel(currentLevel: string): string {
  switch (currentLevel) {
    case 'Explorer': return 'Advocate'
    case 'Advocate': return 'Catalyst'
    case 'Catalyst': return 'Visionary'
    default: return 'Visionary'
  }
}

function getTargetScore(currentLevel: string): number {
  switch (currentLevel) {
    case 'Explorer': return 25
    case 'Advocate': return 45
    case 'Catalyst': return 70
    default: return 70
  }
}

function getFallbackGuidance(level: string): string {
  switch (level) {
    case 'Explorer':
      return "Focus on building consistent daily sustainability habits. Start with simple changes like choosing local produce, reducing single-use items, and learning about your environmental impact. Small, regular actions will build momentum."
    case 'Advocate':
      return "Expand your influence by sharing your sustainability knowledge with others. Lead by example in your community, join local environmental groups, and take on more challenging personal commitments like renewable energy or zero-waste practices."
    case 'Catalyst':
      return "Drive systemic change through leadership initiatives. Consider starting sustainability programs in your organization, mentoring others, forming partnerships with like-minded leaders, and advocating for policy changes in your community."
    default:
      return "Continue leading transformational change in your sphere of influence."
  }
}