import { Answer } from '@/types'

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

export class CommitmentScoringEngine {
  
  calculateCommitmentScore(
    answers: Answer[], 
    behavioralData: BehavioralData[]
  ): CommitmentScore {
    
    const actionVelocity = this.calculateActionVelocity(answers, behavioralData)
    const resourceAllocation = this.calculateResourceAllocation(answers)
    const influenceRadius = this.calculateInfluenceRadius(answers)
    const commitmentIntensity = this.calculateCommitmentIntensity(answers)
    const behavioralConsistency = this.calculateBehavioralConsistency(behavioralData)
    
    const baseScore = (
      actionVelocity * 0.30 +
      resourceAllocation * 0.25 +
      influenceRadius * 0.25 +
      commitmentIntensity * 0.20
    )
    
    const finalScore = baseScore * behavioralConsistency * 100
    const level = this.classifyLevel(finalScore)
    const confidence = this.calculateConfidence(behavioralData)
    
    console.log('Final scoring breakdown:', {
      actionVelocity: Math.round(actionVelocity * 100),
      resourceAllocation: Math.round(resourceAllocation * 100),
      influenceRadius: Math.round(influenceRadius * 100),
      commitmentIntensity: Math.round(commitmentIntensity * 100),
      behavioralConsistency: Math.round(behavioralConsistency * 100),
      baseScore: Math.round(baseScore * 100),
      finalScore: Math.round(finalScore),
      level,
      confidence: Math.round(confidence * 100)
    })
    
    return {
      actionVelocity,
      resourceAllocation,
      influenceRadius,
      commitmentIntensity,
      behavioralConsistency,
      finalScore: Math.round(finalScore),
      level,
      confidence
    }
  }
  
  private calculateActionVelocity(answers: Answer[], behavioralData: BehavioralData[]): number {
    let score = 0
    
    // Default to moderate response time if no behavioral data
    let responseTimeScore = 0.5
    if (behavioralData.length > 0) {
      const avgResponseTime = behavioralData.reduce((sum, data) => sum + data.responseTime, 0) / behavioralData.length
      responseTimeScore = Math.max(0, 1 - (avgResponseTime / 30)) // 30 seconds max
    }
    
    // Look for positive sustainability actions in answers
    const sustainabilityActions = [
      'yes', 'always', 'local', 'organic', 'seasonal', 'renewable', 'efficient',
      'sustainable', 'eco-friendly', 'compost', 'recycle', 'reuse', 'reduce'
    ]
    
    let sustainabilityScore = 0
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      sustainabilityActions.forEach(word => {
        if (text.includes(word)) sustainabilityScore += 0.1
      })
      
      // Bonus for first options (usually more positive)
      if (text.includes('yes, i') || text.includes('always')) {
        sustainabilityScore += 0.2
      }
    })
    
    sustainabilityScore = Math.min(1, sustainabilityScore)
    
    // Decisive language patterns
    const decisiveWords = ['will', 'immediately', 'already', 'started', 'committed', 'decided', 'always']
    const hesitantWords = ['might', 'probably', 'maybe', 'possibly', 'thinking about', 'considering', 'never']
    
    let decisiveCount = 0
    let hesitantCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      decisiveWords.forEach(word => {
        if (text.includes(word)) decisiveCount++
      })
      hesitantWords.forEach(word => {
        if (text.includes(word)) hesitantCount++
      })
    })
    
    const languageScore = Math.max(0, Math.min(1, (decisiveCount - hesitantCount) / Math.max(1, answers.length) + 0.5))
    
    // Default specificity if no behavioral data
    let avgSpecificity = 0.5
    if (behavioralData.length > 0) {
      avgSpecificity = behavioralData.reduce((sum, data) => sum + data.specificityIndex, 0) / behavioralData.length
    }
    
    score = (responseTimeScore * 0.2 + sustainabilityScore * 0.4 + languageScore * 0.3 + avgSpecificity * 0.1)
    console.log('Action velocity components:', { responseTimeScore, sustainabilityScore, languageScore, avgSpecificity, score })
    return Math.max(0, Math.min(1, score))
  }
  
  private calculateResourceAllocation(answers: Answer[]): number {
    let score = 0
    
    // Look for willingness to pay more or invest in quality
    const willingnessIndicators = [
      'yes, transparency is worth', 'premium', 'quality', 'organic', 'sustainable',
      'pay more', 'invest', 'worth it', 'better quality', 'local'
    ]
    
    // Look for budget consciousness but sustainability focus
    const balancedIndicators = [
      'sometimes, for certain', 'when available', 'try to', 'want to but budget'
    ]
    
    let willingnessCount = 0
    let balancedCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      willingnessIndicators.forEach(indicator => {
        if (text.includes(indicator)) willingnessCount += 1
      })
      balancedIndicators.forEach(indicator => {
        if (text.includes(indicator)) balancedCount += 0.5
      })
      
      // Bonus for choosing higher commitment options
      if (text.includes('yes, i buy local') || text.includes('always')) {
        willingnessCount += 0.5
      }
    })
    
    const resourceScore = Math.min(1, (willingnessCount + balancedCount) / Math.max(1, answers.length))
    
    console.log('Resource allocation components:', { willingnessCount, balancedCount, resourceScore })
    return Math.max(0.2, Math.min(1, resourceScore)) // Minimum 0.2 to avoid too low scores
  }
  
  private calculateInfluenceRadius(answers: Answer[]): number {
    // Give a baseline score since this is harder to detect from simple questions
    let score = 0.4
    
    const influenceIndicators = [
      'inspire', 'share', 'teach', 'recommend', 'influence', 'community',
      'friends', 'family', 'local experience', 'immersive'
    ]
    
    let influenceCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      influenceIndicators.forEach(indicator => {
        if (text.includes(indicator)) influenceCount += 0.2
      })
      
      // Bonus for choices that show community thinking
      if (text.includes('local community support') || text.includes('immersive local')) {
        influenceCount += 0.3
      }
    })
    
    score += Math.min(0.5, influenceCount / Math.max(1, answers.length))
    
    console.log('Influence radius components:', { influenceCount, score })
    return Math.max(0.3, Math.min(1, score))
  }
  
  private calculateCommitmentIntensity(answers: Answer[]): number {
    let score = 0.3 // Base score
    
    const deepCommitmentIndicators = [
      'always', 'yes, i plan', 'worth the premium', 'renewable', 
      'organic', 'preferred option', 'sustainable', 'ethical'
    ]
    
    const moderateCommitmentIndicators = [
      'sometimes', 'when available', 'try to', 'interested to learn',
      'general idea', 'mostly'
    ]
    
    let deepCount = 0
    let moderateCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      deepCommitmentIndicators.forEach(indicator => {
        if (text.includes(indicator)) deepCount += 0.3
      })
      moderateCommitmentIndicators.forEach(indicator => {
        if (text.includes(indicator)) moderateCount += 0.15
      })
    })
    
    score += Math.min(0.6, (deepCount + moderateCount) / Math.max(1, answers.length))
    
    console.log('Commitment intensity components:', { deepCount, moderateCount, score })
    return Math.max(0.2, Math.min(1, score))
  }
  
  private calculateBehavioralConsistency(behavioralData: BehavioralData[]): number {
    if (behavioralData.length < 2) return 1.0 // Default to perfect consistency
    
    // Calculate variance in response times (lower variance = more consistent)
    const responseTimes = behavioralData.map(data => data.responseTime)
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
    const consistencyScore = Math.max(0.8, 1 - (variance / 100)) // Min 0.8, max 1.0 - more generous
    
    console.log('Behavioral consistency:', { avgResponseTime, variance, consistencyScore })
    return Math.min(1.2, consistencyScore * 1.1) // Allow slight boost for very consistent users
  }
  
  private classifyLevel(score: number): CommitmentLevel {
    console.log('Classifying level for score:', score)
    if (score >= 70) return 'Visionary'
    if (score >= 45) return 'Catalyst'  
    if (score >= 25) return 'Advocate'
    return 'Explorer'
  }
  
  private calculateConfidence(behavioralData: BehavioralData[]): number {
    // Higher confidence with more data points and consistent patterns
    const dataPoints = behavioralData.length
    const avgCertainty = behavioralData.reduce((sum, data) => sum + data.certaintyLanguage, 0) / dataPoints
    
    const baseConfidence = Math.min(0.9, 0.5 + (dataPoints / 20)) // Max 90% confidence
    const certaintyBoost = avgCertainty * 0.2
    
    return Math.min(0.95, baseConfidence + certaintyBoost)
  }
  
  // Real-time scoring during interview
  calculateLiveScore(answers: Answer[], behavioralData: BehavioralData[]): number {
    if (answers.length < 2) return 0
    
    const partialScore = this.calculateCommitmentScore(answers, behavioralData)
    // Adjust for partial completion
    const completionFactor = answers.length / 10
    return partialScore.finalScore * completionFactor
  }
}