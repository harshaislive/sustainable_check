export interface CommitmentAssessment {
  score: CommitmentScore
  behavioralData: BehavioralData[]
  patternAnalysis: PatternAnalysis
  levelProgression: LevelProgression[]
  insights: string[]
  nextActions: string[]
}

export interface CommitmentScore {
  actionVelocity: number
  resourceAllocation: number
  influenceRadius: number
  commitmentIntensity: number
  behavioralConsistency: number
  finalScore: number
  level: CommitmentLevel
  confidence: number
}

export type CommitmentLevel = 'Explorer' | 'Advocate' | 'Catalyst' | 'Visionary'

export interface BehavioralData {
  responseTime: number
  revisionCount: number
  certaintyLanguage: number
  specificityIndex: number
  pausePattern: number
}

export interface PatternAnalysis {
  consistency: number
  trend: 'improving' | 'declining' | 'stable'
  confidence: number
  insights?: string[]
}

export interface LevelProgression {
  questionNumber: number
  score: number
  level: CommitmentLevel
  timestamp: Date
}

export interface LevelProfile {
  level: CommitmentLevel
  scoreRange: [number, number]
  description: string
  characteristics: string[]
  nextSteps: string[]
  exclusiveOffers: string[]
  communityAccess: string[]
}

export const LEVEL_PROFILES: Record<CommitmentLevel, LevelProfile> = {
  Explorer: {
    level: 'Explorer',
    scoreRange: [0, 25],
    description: 'Curious mind beginning the sustainability journey',
    characteristics: [
      'Open to learning about sustainability',
      'Values awareness over immediate action',
      'Seeks educational resources and guidance',
      'Interested in understanding impact'
    ],
    nextSteps: [
      'Subscribe to sustainability insights newsletter',
      'Join beginner-friendly community discussions',
      'Explore foundational sustainability principles',
      'Connect with local sustainability groups'
    ],
    exclusiveOffers: [
      'Free sustainability starter guide',
      'Monthly educational webinars',
      'Access to beginner resources library'
    ],
    communityAccess: [
      'Explorer community forums',
      'Monthly Q&A sessions',
      'Peer learning groups'
    ]
  },
  
  Advocate: {
    level: 'Advocate',
    scoreRange: [26, 50],
    description: 'Personally committed to sustainable transformation',
    characteristics: [
      'Takes personal responsibility for sustainability',
      'Makes lifestyle changes for impact',
      'Seeks practical implementation strategies',
      'Values personal growth and development'
    ],
    nextSteps: [
      'Enroll in personal sustainability coaching',
      'Join advocate community for peer support',
      'Implement advanced sustainability practices',
      'Track and measure personal impact'
    ],
    exclusiveOffers: [
      'Personal sustainability audit ($500 value)',
      'Monthly coaching sessions',
      'Advocate toolkit and resources',
      'Early access to new programs'
    ],
    communityAccess: [
      'Advocate community platform',
      'Monthly group coaching calls',
      'Success story sharing sessions',
      'Peer accountability partnerships'
    ]
  },
  
  Catalyst: {
    level: 'Catalyst',
    scoreRange: [51, 75],
    description: 'Natural leader prepared to influence meaningful change',
    characteristics: [
      'Demonstrates leadership in sustainability',
      'Influences others toward sustainable practices',
      'Seeks systemic change opportunities',
      'Builds teams and communities around impact'
    ],
    nextSteps: [
      'Apply for leadership development program',
      'Explore corporate sustainability consulting',
      'Lead community sustainability initiatives',
      'Mentor other advocates and explorers'
    ],
    exclusiveOffers: [
      'Leadership accelerator program ($5,000 value)',
      'Quarterly strategy sessions with experts',
      'Speaking opportunity development',
      'Corporate partnership introductions'
    ],
    communityAccess: [
      'Catalyst leadership circle',
      'Quarterly leadership summits',
      'Mentorship program access',
      'Corporate sustainability network'
    ]
  },
  
  Visionary: {
    level: 'Visionary',
    scoreRange: [76, 100],
    description: 'Systemic change maker ready to transform industries',
    characteristics: [
      'Drives industry-wide transformation',
      'Creates systemic solutions for sustainability',
      'Influences policy and large-scale change',
      'Builds sustainable business ecosystems'
    ],
    nextSteps: [
      'Explore exclusive partnership opportunities',
      'Co-create innovative sustainability solutions',
      'Lead industry transformation initiatives',
      'Shape policy and regulatory frameworks'
    ],
    exclusiveOffers: [
      'Exclusive partnership discussion (₹1.5cr+ opportunities)',
      'Co-creation innovation labs',
      'Industry transformation consulting',
      'Policy influence and advocacy support'
    ],
    communityAccess: [
      'Visionary executive circle',
      'Private innovation workshops',
      'Direct access to industry leaders',
      'Policy maker networking events'
    ]
  }
}