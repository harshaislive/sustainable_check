export interface PremiumQuestion {
  id: string
  text: string
  type: 'mcq' | 'text' | 'interactive'
  interactiveType?: 'time-picker' | 'globe' | 'room-selector' | 'ingredient-wheel' | 
                    'timeline-slider' | 'network-viz' | 'product-scanner' | 
                    'time-wheel' | 'constellation' | 'impact-calc'
  options?: PremiumOption[]
  context?: string
  wealthIndicators: string[]
  visualElement?: VisualElement
}

export interface PremiumOption {
  value: string
  label: string
  metadata?: {
    wealthScore?: number
    sustainabilityScore?: number
    lifestyle?: string
  }
}

export interface VisualElement {
  type: string
  config: any
}

export interface WealthProfile {
  score: number // 0-100
  indicators: {
    travelFrequency: number
    propertyInvestment: number
    timeFlexibility: number
    qualityConsciousness: number
    networkInfluence: number
    philanthropicInterest: number
    investmentAwareness: number
    globalPerspective: number
  }
  lifestyle: 'ultra-premium' | 'premium' | 'aspirational' | 'conscious'
  qualificationStatus: 'highly-qualified' | 'qualified' | 'potential' | 'not-qualified'
}