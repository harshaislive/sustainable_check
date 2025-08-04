import { NextResponse } from 'next/server'
import { NativeSustainabilityCoordinator } from '@/lib/agents/native-openai-agents'
import { CommitmentScoringEngine } from '@/lib/commitment/scoring-engine'
import { Answer, ReportCard } from '@/types'
import { BehavioralData } from '@/lib/commitment/scoring-engine'

export async function POST(request: Request) {
  try {
    const { answers, behavioralData } = await request.json()
    
    // Calculate commitment score using our scoring engine
    const scoringEngine = new CommitmentScoringEngine()
    const commitmentScore = scoringEngine.calculateCommitmentScore(
      answers as Answer[],
      behavioralData as BehavioralData[]
    )
    
    // Try native OpenAI agents first
    try {
      const coordinator = new NativeSustainabilityCoordinator()
      const result = await coordinator.generateFinalReport(
        answers as Answer[],
        behavioralData as BehavioralData[],
        commitmentScore
      )
      
      return NextResponse.json(result)
    } catch (nativeError) {
      console.warn('Native OpenAI agents failed for report generation:', nativeError)
    }
    
    // Fallback to basic report generation
    const report: ReportCard = {
      overallScore: commitmentScore.finalScore,
      categories: [
        {
          name: "Action Velocity",
          score: Math.round(commitmentScore.actionVelocity * 100),
          description: getVelocityInsight(commitmentScore.actionVelocity)
        },
        {
          name: "Resource Allocation", 
          score: Math.round(commitmentScore.resourceAllocation * 100),
          description: getAllocationInsight(commitmentScore.resourceAllocation)
        },
        {
          name: "Influence Radius",
          score: Math.round(commitmentScore.influenceRadius * 100), 
          description: getInfluenceInsight(commitmentScore.influenceRadius)
        },
        {
          name: "Commitment Intensity",
          score: Math.round(commitmentScore.commitmentIntensity * 100),
          description: getIntensityInsight(commitmentScore.commitmentIntensity)
        }
      ],
      insights: [
        `Your action velocity score of ${Math.round(commitmentScore.actionVelocity * 100)}% indicates ${getVelocityInsight(commitmentScore.actionVelocity)}.`,
        `Resource allocation patterns suggest ${getAllocationInsight(commitmentScore.resourceAllocation)}.`,
        `Your influence radius shows ${getInfluenceInsight(commitmentScore.influenceRadius)}.`,
        `Commitment intensity reflects ${getIntensityInsight(commitmentScore.commitmentIntensity)}.`
      ],
      recommendations: getRecommendations(commitmentScore.level),
      personalityProfile: `You are a ${commitmentScore.level} with a commitment score of ${commitmentScore.finalScore}. This indicates ${getLevelDescription(commitmentScore.level)}.`
    }
    
    return NextResponse.json({ report, commitmentScore })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// Helper functions for insights
function getVelocityInsight(score: number): string {
  if (score > 0.7) return 'strong bias toward quick, decisive action'
  if (score > 0.4) return 'balanced approach to decision-making'
  return 'preference for careful, considered decisions'
}

function getAllocationInsight(score: number): string {
  if (score > 0.7) return 'sophisticated resource management and quality focus'
  if (score > 0.4) return 'growing awareness of sustainable investment value'
  return 'developing understanding of resource optimization'
}

function getInfluenceInsight(score: number): string {
  if (score > 0.7) return 'significant leadership and network influence potential'
  if (score > 0.4) return 'emerging influence within your immediate community'
  return 'personal influence focused on close relationships'
}

function getIntensityInsight(score: number): string {
  if (score > 0.7) return 'deep commitment to transformational change'
  if (score > 0.4) return 'genuine personal commitment with growing depth'
  return 'early-stage exploration of sustainability values'
}

function getRecommendations(level: string): string[] {
  const recommendations: Record<string, string[]> = {
    'Explorer': [
      "Start with small, achievable sustainability changes in your daily routine",
      "Connect with like-minded communities for inspiration and support",
      "Focus on learning about sustainability practices that align with your lifestyle"
    ],
    'Advocate': [
      "Deepen your personal sustainability practices with more challenging commitments",
      "Consider leadership roles in local sustainability initiatives",
      "Explore partnerships with organizations that share your values"
    ],
    'Catalyst': [
      "Lead sustainability transformation initiatives in your organization or community",
      "Build strategic networks with other change-makers for greater impact",
      "Consider advisory positions or board roles in sustainability-focused organizations"
    ],
    'Visionary': [
      "Pioneer breakthrough sustainability solutions in your industry",
      "Create or support large-scale initiatives that can transform entire sectors",
      "Consider significant investments in sustainability ventures and partnerships"
    ]
  }
  
  return recommendations[level] || recommendations['Explorer']
}

function getLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    'Explorer': 'a curious mind beginning the sustainability journey with growing awareness',
    'Advocate': 'personally committed to sustainable transformation with clear values',
    'Catalyst': 'a natural leader prepared to influence meaningful change in your sphere',
    'Visionary': 'a systemic change maker ready to transform industries and create lasting impact'
  }
  
  return descriptions[level] || descriptions['Explorer']
}