import { BehavioralData } from './scoring-engine'

export class BehavioralTracker {
  private startTime: number = 0
  private questionStartTime: number = 0
  private revisions: number = 0
  private lastAnswer: string = ''
  private pauseCount: number = 0
  private focusEvents: number = 0
  
  startQuestion(): void {
    this.questionStartTime = Date.now()
    this.revisions = 0
    this.pauseCount = 0
    this.focusEvents = 0
  }
  
  trackAnswerChange(newAnswer: string): void {
    if (this.lastAnswer !== newAnswer && this.lastAnswer !== '') {
      this.revisions++
    }
    this.lastAnswer = newAnswer
  }
  
  trackPause(): void {
    this.pauseCount++
  }
  
  trackFocusChange(): void {
    this.focusEvents++
  }
  
  finishQuestion(finalAnswer: string): BehavioralData {
    const responseTime = (Date.now() - this.questionStartTime) / 1000 // seconds
    const certaintyLanguage = this.analyzeCertaintyLanguage(finalAnswer)
    const specificityIndex = this.analyzeSpecificity(finalAnswer)
    
    return {
      responseTime,
      revisionCount: this.revisions,
      certaintyLanguage,
      specificityIndex,
      pausePattern: this.pauseCount / Math.max(1, responseTime) // pauses per second
    }
  }
  
  private analyzeCertaintyLanguage(text: string): number {
    const certainWords = [
      'definitely', 'absolutely', 'certainly', 'clearly', 'obviously',
      'without doubt', 'confident', 'sure', 'committed', 'decided'
    ]
    
    const uncertainWords = [
      'maybe', 'perhaps', 'possibly', 'might', 'could', 'potentially',
      'unsure', 'unclear', 'confused', 'hesitant', 'doubtful'
    ]
    
    const hedgeWords = [
      'sort of', 'kind of', 'somewhat', 'fairly', 'pretty much',
      'I think', 'I believe', 'I suppose', 'I guess'
    ]
    
    let certainCount = 0
    let uncertainCount = 0
    let hedgeCount = 0
    
    const lowerText = text.toLowerCase()
    
    certainWords.forEach(word => {
      if (lowerText.includes(word)) certainCount++
    })
    
    uncertainWords.forEach(word => {
      if (lowerText.includes(word)) uncertainCount++
    })
    
    hedgeWords.forEach(word => {
      if (lowerText.includes(word)) hedgeCount++
    })
    
    // Score from 0 to 1, where 1 is very certain
    const score = (certainCount - uncertainCount - (hedgeCount * 0.5)) / Math.max(1, text.split(' ').length / 10)
    return Math.max(0, Math.min(1, score + 0.5)) // Normalize to 0-1 range
  }
  
  private analyzeSpecificity(text: string): number {
    const specificIndicators = [
      // Numbers and quantities
      /\b\d+\b/g,
      // Specific times
      /\b(yesterday|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
      /\b\d{4}\b/, // years
      // Specific places
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Proper nouns (likely places/names)
      // Specific actions
      /\b(implemented|launched|created|built|designed|developed|established)\b/gi,
      // Measurements
      /\b\d+%\b/,
      /\$\d+/,
      /\b\d+\s*(minutes|hours|days|weeks|months|years)\b/gi
    ]
    
    let specificityCount = 0
    const wordCount = text.split(' ').length
    
    specificIndicators.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        specificityCount += matches.length
      }
    })
    
    // Also check for detailed explanations (longer answers with context)
    const detailScore = Math.min(1, wordCount / 50) // Reward longer, detailed answers
    const specificityScore = Math.min(1, specificityCount / Math.max(1, wordCount / 20))
    
    return (detailScore + specificityScore) / 2
  }
  
  // Advanced pattern analysis
  analyzeResponsePattern(allBehavioralData: BehavioralData[]): PatternAnalysis {
    if (allBehavioralData.length < 2) {
      return {
        consistency: 1,
        trend: 'stable',
        confidence: 0.5
      }
    }
    
    const responseTimes = allBehavioralData.map(d => d.responseTime)
    const certaintyScores = allBehavioralData.map(d => d.certaintyLanguage)
    const specificityScores = allBehavioralData.map(d => d.specificityIndex)
    
    // Calculate trends
    const responseTimeTrend = this.calculateTrend(responseTimes)
    const certaintyTrend = this.calculateTrend(certaintyScores)
    const specificityTrend = this.calculateTrend(specificityScores)
    
    // Calculate consistency (inverse of variance)
    const responseTimeConsistency = 1 - this.calculateVariance(responseTimes)
    const certaintyConsistency = 1 - this.calculateVariance(certaintyScores)
    
    const overallConsistency = (responseTimeConsistency + certaintyConsistency) / 2
    
    // Determine overall trend
    let overallTrend: 'improving' | 'declining' | 'stable' = 'stable'
    if (certaintyTrend > 0.1 && specificityTrend > 0.1) {
      overallTrend = 'improving'
    } else if (certaintyTrend < -0.1 && specificityTrend < -0.1) {
      overallTrend = 'declining'
    }
    
    // Calculate confidence in the assessment
    const dataPoints = allBehavioralData.length
    const confidence = Math.min(0.95, 0.3 + (dataPoints / 15) + (overallConsistency * 0.3))
    
    return {
      consistency: overallConsistency,
      trend: overallTrend,
      confidence,
      insights: this.generateInsights(allBehavioralData, overallTrend, overallConsistency)
    }
  }
  
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    
    // Simple linear regression slope
    const n = values.length
    const sumX = (n * (n - 1)) / 2 // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + (val * index), 0)
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    
    // Normalize variance to 0-1 scale
    return Math.min(1, variance / mean)
  }
  
  private generateInsights(
    data: BehavioralData[], 
    trend: string, 
    consistency: number
  ): string[] {
    const insights: string[] = []
    
    const avgResponseTime = data.reduce((sum, d) => sum + d.responseTime, 0) / data.length
    const avgCertainty = data.reduce((sum, d) => sum + d.certaintyLanguage, 0) / data.length
    const avgSpecificity = data.reduce((sum, d) => sum + d.specificityIndex, 0) / data.length
    
    // Response time insights
    if (avgResponseTime < 5) {
      insights.push("Shows quick decision-making ability")
    } else if (avgResponseTime > 20) {
      insights.push("Takes time to consider responses thoughtfully")
    }
    
    // Certainty insights
    if (avgCertainty > 0.7) {
      insights.push("Demonstrates high confidence in responses")
    } else if (avgCertainty < 0.3) {
      insights.push("Shows thoughtful uncertainty and openness")
    }
    
    // Specificity insights
    if (avgSpecificity > 0.6) {
      insights.push("Provides detailed, specific examples")
    }
    
    // Trend insights
    if (trend === 'improving') {
      insights.push("Growing confidence and engagement through the assessment")
    } else if (trend === 'declining') {
      insights.push("May be experiencing decision fatigue")
    }
    
    // Consistency insights
    if (consistency > 0.8) {
      insights.push("Maintains consistent response patterns")
    } else if (consistency < 0.4) {
      insights.push("Shows varied response patterns across questions")
    }
    
    return insights
  }
}

export interface PatternAnalysis {
  consistency: number
  trend: 'improving' | 'declining' | 'stable'
  confidence: number
  insights?: string[]
}

// Real-time behavioral hooks for React components
export const useBehavioralTracking = () => {
  const tracker = new BehavioralTracker()
  
  const trackQuestionStart = () => tracker.startQuestion()
  const trackAnswerChange = (answer: string) => tracker.trackAnswerChange(answer)
  const trackPause = () => tracker.trackPause()
  const trackFocusChange = () => tracker.trackFocusChange()
  const finishQuestion = (answer: string) => tracker.finishQuestion(answer)
  
  return {
    trackQuestionStart,
    trackAnswerChange,
    trackPause,
    trackFocusChange,
    finishQuestion
  }
}