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
    
    // Average response time (faster = higher velocity)
    const avgResponseTime = behavioralData.reduce((sum, data) => sum + data.responseTime, 0) / behavioralData.length
    const responseTimeScore = Math.max(0, 1 - (avgResponseTime / 30)) // 30 seconds max
    
    // Decisive language patterns
    const decisiveWords = ['will', 'immediately', 'already', 'started', 'committed', 'decided']
    const hesitantWords = ['might', 'probably', 'maybe', 'possibly', 'thinking about', 'considering']
    
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
    
    const languageScore = Math.max(0, (decisiveCount - hesitantCount) / answers.length)
    
    // Past action evidence
    const actionWords = ['did', 'implemented', 'changed', 'achieved', 'completed', 'transformed']
    let actionCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      actionWords.forEach(word => {
        if (text.includes(word)) actionCount++
      })
    })
    
    const pastActionScore = Math.min(1, actionCount / answers.length)
    
    // Specificity (detailed answers show execution thinking)
    const avgSpecificity = behavioralData.reduce((sum, data) => sum + data.specificityIndex, 0) / behavioralData.length
    
    score = (responseTimeScore + languageScore + pastActionScore + avgSpecificity) / 4
    return Math.max(0, Math.min(1, score))
  }
  
  private calculateResourceAllocation(answers: Answer[]): number {
    let score = 0
    
    // Look for evidence of time, money, attention investment
    const investmentIndicators = [
      'time', 'invest', 'dedicate', 'prioritize', 'focus', 'allocate',
      'budget', 'spend', 'commit resources', 'learning', 'education'
    ]
    
    const luxuryIndicators = [
      'premium', 'quality', 'artisanal', 'organic', 'sustainable',
      'high-end', 'exclusive', 'custom', 'bespoke', 'curated'
    ]
    
    let investmentCount = 0
    let luxuryCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      investmentIndicators.forEach(indicator => {
        if (text.includes(indicator)) investmentCount++
      })
      luxuryIndicators.forEach(indicator => {
        if (text.includes(indicator)) luxuryCount++
      })
    })
    
    const investmentScore = Math.min(1, investmentCount / answers.length)
    const qualityScore = Math.min(1, luxuryCount / answers.length)
    
    score = (investmentScore + qualityScore) / 2
    return Math.max(0, Math.min(1, score))
  }
  
  private calculateInfluenceRadius(answers: Answer[]): number {
    let score = 0
    
    const leadershipIndicators = [
      'lead', 'manage', 'direct', 'influence', 'mentor', 'guide',
      'team', 'organization', 'company', 'board', 'committee'
    ]
    
    const networkIndicators = [
      'network', 'community', 'connections', 'colleagues', 'partners',
      'industry', 'peers', 'advisors', 'mentors', 'investors'
    ]
    
    let leadershipCount = 0
    let networkCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      leadershipIndicators.forEach(indicator => {
        if (text.includes(indicator)) leadershipCount++
      })
      networkIndicators.forEach(indicator => {
        if (text.includes(indicator)) networkCount++
      })
    })
    
    const leadershipScore = Math.min(1, leadershipCount / answers.length)
    const networkScore = Math.min(1, networkCount / answers.length)
    
    score = (leadershipScore + networkScore) / 2
    return Math.max(0, Math.min(1, score))
  }
  
  private calculateCommitmentIntensity(answers: Answer[]): number {
    let score = 0
    
    const transformationIndicators = [
      'transform', 'change', 'shift', 'evolve', 'revolutionize',
      'reimagine', 'reinvent', 'reshape', 'redefine', 'breakthrough'
    ]
    
    const legacyIndicators = [
      'legacy', 'future', 'generations', 'impact', 'difference',
      'purpose', 'mission', 'vision', 'calling', 'destiny'
    ]
    
    const sacrificeIndicators = [
      'sacrifice', 'give up', 'trade off', 'prioritize', 'choose',
      'difficult', 'challenge', 'commitment', 'dedication'
    ]
    
    let transformationCount = 0
    let legacyCount = 0
    let sacrificeCount = 0
    
    answers.forEach(answer => {
      const text = answer.value.toLowerCase()
      transformationIndicators.forEach(indicator => {
        if (text.includes(indicator)) transformationCount++
      })
      legacyIndicators.forEach(indicator => {
        if (text.includes(indicator)) legacyCount++
      })
      sacrificeIndicators.forEach(indicator => {
        if (text.includes(indicator)) sacrificeCount++
      })
    })
    
    const transformationScore = Math.min(1, transformationCount / answers.length)
    const legacyScore = Math.min(1, legacyCount / answers.length)
    const sacrificeScore = Math.min(1, sacrificeCount / answers.length)
    
    score = (transformationScore + legacyScore + sacrificeScore) / 3
    return Math.max(0, Math.min(1, score))
  }
  
  private calculateBehavioralConsistency(behavioralData: BehavioralData[]): number {
    if (behavioralData.length < 2) return 1
    
    // Calculate variance in response times (lower variance = more consistent)
    const responseTimes = behavioralData.map(data => data.responseTime)
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
    const consistencyScore = Math.max(0.7, 1 - (variance / 100)) // Min 0.7, max 1.0
    
    return Math.min(1.3, consistencyScore * 1.1) // Allow slight boost for very consistent users
  }
  
  private classifyLevel(score: number): CommitmentLevel {
    if (score >= 76) return 'Visionary'
    if (score >= 51) return 'Catalyst'  
    if (score >= 26) return 'Advocate'
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