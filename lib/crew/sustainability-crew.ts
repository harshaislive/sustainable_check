import { Crew } from 'crewai'
import { Process } from 'crewai'
import { sustainabilityCrewAgents } from './agents'
import { sustainabilityCrewTasks, createQuestionGenerationTask, createBehavioralAnalysisTask } from './tasks'
import { Answer, Question, ReportCard } from '@/types'
import { BehavioralData } from '../commitment/behavioral-tracker'
import { CommitmentScore } from '../commitment/scoring-engine'

export class SustainabilityInterviewCrew {
  private crew: Crew
  
  constructor() {
    this.crew = new Crew({
      name: 'Sustainability Commitment Assessment Crew',
      agents: [
        sustainabilityCrewAgents.questionGenerator,
        sustainabilityCrewAgents.behavioralAnalyst,
        sustainabilityCrewAgents.reportGenerator,
        sustainabilityCrewAgents.coordinator
      ],
      tasks: [
        sustainabilityCrewTasks.generateInitialQuestion,
        sustainabilityCrewTasks.analyzeBehavioralData,
        sustainabilityCrewTasks.generateAdaptiveQuestion,
        sustainabilityCrewTasks.generateFinalReport,
        sustainabilityCrewTasks.coordinateProcess
      ],
      process: Process.sequential,
      verbose: true,
      memory: true,
      cache: true,
      max_rpm: 10 // Rate limiting for Azure OpenAI
    })
  }

  /**
   * Generate the initial question to start the interview
   */
  async generateInitialQuestion(): Promise<Question> {
    try {
      const result = await this.crew.kickoff({
        inputs: {
          task_type: 'initial_question',
          context: 'Starting sustainability commitment interview'
        }
      })

      const questionData = JSON.parse(result.raw)
      
      return {
        id: `crew-q-${Date.now()}`,
        text: questionData.text,
        type: questionData.type,
        options: questionData.options,
        context: questionData.context
      }
    } catch (error) {
      console.error('CrewAI initial question generation failed:', error)
      // Fallback to basic question
      return {
        id: `fallback-q-${Date.now()}`,
        text: "How do you prefer starting mornings?",
        type: "mcq",
        options: [
          "Quick coffee and go",
          "Slow mindful routine",
          "Exercise then breakfast", 
          "Whatever feels right"
        ],
        context: "Morning habits reveal your relationship with time."
      }
    }
  }

  /**
   * Generate adaptive next question based on previous answers and behavioral data
   */
  async generateNextQuestion(
    previousAnswers: Answer[], 
    behavioralData: BehavioralData[], 
    currentScore: number
  ): Promise<Question> {
    try {
      const questionNumber = previousAnswers.length + 1
      
      // Create dynamic tasks for this specific question
      const analysisTask = createBehavioralAnalysisTask(previousAnswers, behavioralData)
      const questionTask = createQuestionGenerationTask(questionNumber, previousAnswers, behavioralData, currentScore)
      
      // Create a focused crew for this specific question
      const questionCrew = new Crew({
        name: `Question ${questionNumber} Generation Crew`,
        agents: [
          sustainabilityCrewAgents.behavioralAnalyst,
          sustainabilityCrewAgents.questionGenerator
        ],
        tasks: [analysisTask, questionTask],
        process: Process.sequential,
        verbose: false,
        memory: true,
        cache: true
      })

      const result = await questionCrew.kickoff({
        inputs: {
          question_number: questionNumber,
          previous_answers: previousAnswers,
          behavioral_data: behavioralData,
          current_score: currentScore,
          task_type: 'adaptive_question'
        }
      })

      const questionData = JSON.parse(result.raw)
      
      return {
        id: `crew-q-${questionNumber}-${Date.now()}`,
        text: questionData.text,
        type: questionData.type,
        options: questionData.options,
        context: questionData.context
      }
    } catch (error) {
      console.error('CrewAI adaptive question generation failed:', error)
      
      // Fallback question based on question number
      const fallbackQuestions = [
        {
          text: "What draws you to sustainable choices?",
          type: "mcq",
          options: ["Personal values", "Future generations", "Cost savings", "Social responsibility"],
          context: "Understanding your sustainability motivation."
        },
        {
          text: "How do you define quality living?",
          type: "text",
          context: "Quality preferences reveal personal values."
        },
        {
          text: "What represents luxury to you?",
          type: "text", 
          context: "Modern luxury reflects evolved consciousness."
        }
      ]
      
      const fallback = fallbackQuestions[Math.min(previousAnswers.length, fallbackQuestions.length - 1)]
      
      return {
        id: `fallback-q-${previousAnswers.length + 1}-${Date.now()}`,
        ...fallback
      }
    }
  }

  /**
   * Generate comprehensive final report based on complete interview
   */
  async generateFinalReport(
    answers: Answer[], 
    behavioralData: BehavioralData[], 
    commitmentScore: CommitmentScore
  ): Promise<{ report: ReportCard, commitmentScore: CommitmentScore }> {
    try {
      // Create specialized report generation crew
      const reportCrew = new Crew({
        name: 'Final Report Generation Crew',
        agents: [
          sustainabilityCrewAgents.behavioralAnalyst,
          sustainabilityCrewAgents.reportGenerator
        ],
        tasks: [
          sustainabilityCrewTasks.analyzeBehavioralData,
          sustainabilityCrewTasks.generateFinalReport
        ],
        process: Process.sequential,
        verbose: true,
        memory: true,
        cache: true
      })

      const result = await reportCrew.kickoff({
        inputs: {
          answers: answers,
          behavioral_data: behavioralData,
          commitment_score: commitmentScore,
          task_type: 'final_report'
        }
      })

      // Parse the report result
      const reportData = JSON.parse(result.raw)
      
      const report: ReportCard = {
        id: `crew-report-${Date.now()}`,
        summary: reportData.summary || `You are classified as "${commitmentScore.level}" with a commitment score of ${commitmentScore.finalScore}.`,
        insights: reportData.insights || [
          `Action Velocity: ${Math.round(commitmentScore.actionVelocity * 100)}% - ${this.getVelocityInsight(commitmentScore.actionVelocity)}`,
          `Resource Allocation: ${Math.round(commitmentScore.resourceAllocation * 100)}% - ${this.getAllocationInsight(commitmentScore.resourceAllocation)}`,
          `Influence Radius: ${Math.round(commitmentScore.influenceRadius * 100)}% - ${this.getInfluenceInsight(commitmentScore.influenceRadius)}`,
          `Commitment Intensity: ${Math.round(commitmentScore.commitmentIntensity * 100)}% - ${this.getIntensityInsight(commitmentScore.commitmentIntensity)}`
        ],
        recommendations: reportData.recommendations || this.getDefaultRecommendations(commitmentScore.level),
        score: commitmentScore.finalScore,
        level: commitmentScore.level,
        confidence: commitmentScore.confidence,
        timestamp: new Date()
      }

      return { report, commitmentScore }
    } catch (error) {
      console.error('CrewAI report generation failed:', error)
      
      // Generate fallback report
      const report: ReportCard = {
        id: `fallback-report-${Date.now()}`,
        summary: `Based on your responses, you demonstrate "${commitmentScore.level}" level commitment to sustainability with a score of ${commitmentScore.finalScore}.`,
        insights: [
          `Your action velocity score of ${Math.round(commitmentScore.actionVelocity * 100)}% suggests ${this.getVelocityInsight(commitmentScore.actionVelocity)}`,
          `Resource allocation patterns indicate ${this.getAllocationInsight(commitmentScore.resourceAllocation)}`,
          `Your influence radius shows ${this.getInfluenceInsight(commitmentScore.influenceRadius)}`,
          `Commitment intensity reflects ${this.getIntensityInsight(commitmentScore.commitmentIntensity)}`
        ],
        recommendations: this.getDefaultRecommendations(commitmentScore.level),
        score: commitmentScore.finalScore,
        level: commitmentScore.level,
        confidence: commitmentScore.confidence,
        timestamp: new Date()
      }

      return { report, commitmentScore }
    }
  }

  // Helper methods for fallback insights
  private getVelocityInsight(score: number): string {
    if (score > 0.7) return "strong bias toward quick, decisive action"
    if (score > 0.4) return "balanced approach to decision-making"
    return "preference for careful, considered decisions"
  }

  private getAllocationInsight(score: number): string {
    if (score > 0.7) return "sophisticated resource management and quality focus"
    if (score > 0.4) return "growing awareness of sustainable investment value"
    return "developing understanding of resource optimization"
  }

  private getInfluenceInsight(score: number): string {
    if (score > 0.7) return "significant leadership and network influence potential"
    if (score > 0.4) return "emerging influence within your immediate community"
    return "personal influence focused on close relationships"
  }

  private getIntensityInsight(score: number): string {
    if (score > 0.7) return "deep commitment to transformational change"
    if (score > 0.4) return "genuine personal commitment with growing depth"
    return "early-stage exploration of sustainability values"
  }

  private getDefaultRecommendations(level: string): string[] {
    const recommendations = {
      'Explorer': [
        "Start with small, achievable sustainability changes",
        "Connect with like-minded communities for inspiration",
        "Focus on learning and awareness building"
      ],
      'Advocate': [
        "Deepen your personal sustainability practices",
        "Consider leadership roles in sustainability initiatives",
        "Explore strategic partnerships for greater impact"
      ],
      'Catalyst': [
        "Lead sustainability transformation in your organization",
        "Build strategic networks for systemic change",
        "Consider advisory or board positions in sustainability"
      ],
      'Visionary': [
        "Pioneer breakthrough sustainability solutions",
        "Create industry-transforming initiatives",
        "Consider major sustainability investments and partnerships"
      ]
    }
    
    return recommendations[level] || recommendations['Explorer']
  }

  /**
   * Get crew status and performance metrics
   */
  getCrewMetrics() {
    return {
      agents: this.crew.agents.length,
      memory_enabled: this.crew.memory,
      cache_enabled: this.crew.cache,
      process_type: this.crew.process,
      max_rpm: this.crew.max_rpm
    }
  }
}