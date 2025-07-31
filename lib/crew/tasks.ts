import { Task } from 'crewai'
import { sustainabilityCrewAgents } from './agents'
import { Answer } from '@/types'
import { BehavioralData } from '../commitment/behavioral-tracker'

// TASK 1: Generate Initial Question
export const generateInitialQuestionTask = new Task({
  description: `Generate the first question for a sustainability commitment interview.
  
  Requirements:
  - Question must be 6-10 words maximum
  - Should explore morning rituals or time sovereignty
  - Include 4 MCQ options (3-5 words each)  
  - Provide elegant context (1 sentence)
  - Set sophisticated, exclusive tone
  
  Focus areas for subtle assessment:
  - Time flexibility and control
  - Quality consciousness  
  - Morning routine sophistication
  - Decision-making patterns
  
  Return JSON format: {"text": "brief question", "type": "mcq", "options": ["option1", "option2", "option3", "option4"], "context": "elegant context"}`,
  
  expected_output: 'JSON object with question text, type, options array, and context string',
  agent: sustainabilityCrewAgents.questionGenerator,
  output_file: null
})

// TASK 2: Analyze Behavioral Data
export const analyzeBehavioralDataTask = new Task({
  description: `Analyze response patterns and behavioral data to calculate commitment scores.
  
  Input data includes:
  - Previous answers with timestamps
  - Response times and revision patterns
  - Language analysis (certainty, specificity)
  - Current question number and context
  
  Calculate scores (0-100) for:
  1. Action Velocity: Decision speed, decisive language, past action evidence
  2. Resource Allocation: Investment mindset, quality preferences, time sovereignty
  3. Influence Radius: Leadership indicators, network strength, impact potential
  4. Commitment Intensity: Transformation readiness, legacy thinking, sacrifice willingness
  
  Provide:
  - Current commitment level (Explorer/Advocate/Catalyst/Visionary)
  - Confidence score for assessment
  - Recommended question topics for next interaction
  - Wealth indicator observations (subtle)
  
  Return structured analysis with scores and recommendations.`,
  
  expected_output: 'Behavioral analysis with 4-dimensional scores, commitment level, and next topic recommendations',
  agent: sustainabilityCrewAgents.behavioralAnalyst,
  output_file: null
})

// TASK 3: Generate Adaptive Next Question  
export const generateAdaptiveQuestionTask = new Task({
  description: `Generate the next question based on behavioral analysis and emerging commitment profile.
  
  Context provided:
  - Current commitment level and scores
  - Previous answers and response patterns  
  - Question number (2-10)
  - Recommended topics from behavioral analysis
  
  Adaptive approach:
  - Explorer level: Awareness building, gentle exploration
  - Advocate level: Personal commitment assessment
  - Catalyst level: Leadership and influence focus
  - Visionary level: Transformation and legacy themes
  
  Requirements:
  - Question: 6-10 words maximum
  - Build naturally on previous responses
  - Maintain sophisticated, exclusive tone
  - Include wealth indicators subtly
  - Choose MCQ or text input based on topic depth
  
  Return JSON with question, type, options (if MCQ), and context.`,
  
  expected_output: 'JSON object with adaptive question based on behavioral analysis',
  agent: sustainabilityCrewAgents.questionGenerator,
  context: [analyzeBehavioralDataTask],
  output_file: null
})

// TASK 4: Generate Final Report
export const generateFinalReportTask = new Task({
  description: `Create a comprehensive psychological profile and commitment assessment report.
  
  Based on complete interview data:
  - All answers and behavioral patterns
  - Final commitment scores across 4 dimensions
  - Response consistency and authenticity indicators
  - Wealth and influence indicators observed
  
  Report sections:
  1. Executive Summary
     - Overall commitment level classification
     - Key behavioral insights
     - Confidence in assessment
  
  2. Behavioral Profile  
     - Decision-making style
     - Response patterns analysis
     - Communication preferences
     - Authenticity indicators
  
  3. Commitment Analysis
     - Action Velocity score and evidence
     - Resource Allocation patterns and indicators
     - Influence Radius assessment and observations
     - Commitment Intensity depth and examples
  
  4. Engagement Strategy
     - Recommended approach style
     - Optimal communication channels
     - Timing and frequency suggestions
     - Value proposition alignment
  
  5. Development Potential
     - Growth opportunities identified
     - Leadership readiness assessment
     - Investment sophistication indicators (subtle)
     - Strategic partnership potential
  
  Tone: Executive consulting report (McKinsey/BCG style)
  Length: Comprehensive but concise
  Focus: Actionable insights for engagement`,
  
  expected_output: 'Professional executive assessment report with psychological insights and engagement recommendations',
  agent: sustainabilityCrewAgents.reportGenerator,
  context: [analyzeBehavioralDataTask],
  output_file: null
})

// TASK 5: Coordinate Complete Process
export const coordinateInterviewProcessTask = new Task({
  description: `Oversee the complete commitment assessment interview process from start to finish.
  
  Process coordination:
  1. Generate sophisticated initial question
  2. Monitor response quality and behavioral patterns
  3. Adapt questioning based on emerging profile  
  4. Ensure smooth progression through 10 questions
  5. Compile comprehensive final assessment
  
  Quality assurance:
  - Maintain question brevity and sophistication
  - Ensure subtle wealth profiling remains undetected
  - Adapt difficulty and focus based on commitment level
  - Coordinate seamless agent handoffs
  - Validate assessment accuracy and insights
  
  Success criteria:
  - High-quality behavioral data collection
  - Accurate commitment level classification
  - Actionable engagement recommendations
  - Professional-grade assessment report`,
  
  expected_output: 'Complete interview process coordination with quality validation',
  agent: sustainabilityCrewAgents.coordinator,
  context: [generateInitialQuestionTask, analyzeBehavioralDataTask, generateAdaptiveQuestionTask, generateFinalReportTask],
  output_file: null
})

export const sustainabilityCrewTasks = {
  generateInitialQuestion: generateInitialQuestionTask,
  analyzeBehavioralData: analyzeBehavioralDataTask,
  generateAdaptiveQuestion: generateAdaptiveQuestionTask,
  generateFinalReport: generateFinalReportTask,
  coordinateProcess: coordinateInterviewProcessTask
}

// Task factory functions for dynamic task creation
export function createQuestionGenerationTask(questionNumber: number, previousAnswers: Answer[], behavioralData: BehavioralData[], currentScore: number) {
  return new Task({
    description: `Generate question ${questionNumber} of 10 for sustainability commitment interview.
    
    Previous context:
    ${previousAnswers.map((a, i) => `Q${i+1}: ${a.value}`).join('\n')}
    
    Current commitment score: ${currentScore}
    Behavioral patterns: ${behavioralData.length} data points collected
    
    Requirements for question ${questionNumber}:
    - Build naturally on previous responses
    - Maintain 6-10 word brevity
    - Adapt to emerging commitment level
    - Include wealth indicators subtly
    - Choose appropriate question type (MCQ/text)
    
    ${questionNumber <= 3 ? 'Focus: Basic sustainability awareness and lifestyle' :
      questionNumber <= 6 ? 'Focus: Personal commitment and resource allocation' :
      questionNumber <= 8 ? 'Focus: Leadership influence and community impact' :
      'Focus: Transformation readiness and legacy thinking'}
    
    Return JSON format with question, type, options (if needed), and context.`,
    
    expected_output: `Adaptive question ${questionNumber} based on interview progression`,
    agent: sustainabilityCrewAgents.questionGenerator,
    output_file: null
  })
}

export function createBehavioralAnalysisTask(answers: Answer[], behavioralData: BehavioralData[]) {
  return new Task({
    description: `Analyze current behavioral data and response patterns.
    
    Data to analyze:
    - ${answers.length} answers collected
    - ${behavioralData.length} behavioral data points
    - Response times, revision patterns, language analysis
    
    Calculate commitment scores:
    1. Action Velocity (decisiveness, speed, past actions)
    2. Resource Allocation (investment mindset, quality focus)  
    3. Influence Radius (leadership, network, impact)
    4. Commitment Intensity (transformation, legacy, sacrifice)
    
    Provide:
    - Current scores (0-100 scale)
    - Commitment level classification
    - Confidence in assessment
    - Wealth indicator observations
    - Next question topic recommendations
    
    Focus on behavioral consistency and authenticity indicators.`,
    
    expected_output: 'Current behavioral analysis with scores and recommendations',
    agent: sustainabilityCrewAgents.behavioralAnalyst,
    output_file: null
  })
}