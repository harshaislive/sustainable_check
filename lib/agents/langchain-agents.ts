import { AzureChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { Answer } from '@/types'
import { BehavioralData } from '@/lib/commitment/behavioral-tracker'

// Initialize Azure OpenAI configuration for LangChain
const azureConfig = {
  azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY!,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT!.replace('https://', '').replace('.openai.azure.com', ''),
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT!,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  temperature: 0.7,
  maxCompletionTokens: 500
}

// QUESTION GENERATOR AGENT
export class QuestionGeneratorAgent {
  private chain: RunnableSequence
  
  constructor() {
    const llm = new AzureChatOpenAI(azureConfig)
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an elite sustainability consultant and executive coach creating sophisticated questions for C-suite executives and high-net-worth individuals. Your questions reveal deep psychological patterns and wealth indicators through sustainability lens.

QUESTION DEPTH LEVELS:
1. SURFACE (Questions 1-3): Lifestyle and preferences
2. VALUES (Questions 4-6): Decision-making and priorities  
3. INFLUENCE (Questions 7-8): Leadership and network
4. TRANSFORMATION (Questions 9-10): Legacy and sacrifice

QUESTION TYPES TO MIX:
- MCQ with follow-up text: "Choose option + explain why"
- Pure MCQ: 4 sophisticated options
- Open text: For deep psychological probing
- Ranking: "Rank these 4 priorities"

WEALTH PROFILING STRATEGY:
- Travel: First-class vs economy patterns
- Time: Flexible schedule indicators
- Quality: Premium vs mass market preferences
- Network: Board positions, industry influence
- Investment: Long-term thinking, portfolio diversity
- Learning: Executive coaching, exclusive programs
- Impact: Philanthropic capacity, cause selection

SOPHISTICATED LANGUAGE PATTERNS:
- "How do you curate..." (not "choose")
- "What drives your..." (not "what do you like")
- "When you invest..." (subtle wealth probe)
- "Your preferred approach..." (executive framing)

NEVER mention money directly. Always elegant, brief, psychologically profound.`],
      ["human", "{input}"]
    ])
    
    this.chain = prompt.pipe(llm).pipe(new StringOutputParser())
  }
  
  async generateInitialQuestion() {
    const input = `Generate a sophisticated opening question for a C-suite executive. Focus on morning rituals that reveal time sovereignty and quality consciousness.

DEPTH LEVEL: SURFACE (Question 1 of 10)
GOAL: Establish baseline lifestyle indicators

Requirements:
- Question: 8-12 words, sophisticated language
- Type: "mcq" 
- 4 options revealing wealth/flexibility patterns
- Each option: 4-6 words, executive-level language
- Context: One elegant, exclusive-feeling sentence

WEALTH INDICATORS TO EMBED:
- Flexible schedule control
- Quality consciousness  
- Premium service preferences
- Time as luxury resource

Return as JSON: { 
  "text": "sophisticated question with executive framing", 
  "type": "mcq", 
  "options": ["premium option 1", "flexible schedule option", "quality-focused option", "sophisticated alternative"], 
  "context": "One elegant sentence about time sovereignty.",
  "id": "langchain-q-1"
}`

    try {
      const response = await this.chain.invoke({ input })
      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating initial question:', error)
      return {
        id: 'langchain-q-fallback',
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
  
  async generateAdaptiveQuestion(
    questionNumber: number,
    previousAnswers: Answer[],
    currentScore: number
  ) {
    // Build context from previous answers
    const context = previousAnswers.map((ans, i) => 
      `Q${i+1}: ${ans.value}`
    ).join('\n')
    
    // Advanced topic mapping with depth levels
    const questionConfig = {
      2: { topic: "Travel curation and experience preferences", depth: "SURFACE", type: "mcq", focus: "luxury travel patterns" },
      3: { topic: "Home environment and living philosophy", depth: "SURFACE", type: "mcq_text", focus: "premium lifestyle choices" },
      4: { topic: "Decision-making frameworks and velocity", depth: "VALUES", type: "mcq", focus: "executive decision patterns" },
      5: { topic: "Quality standards and luxury definition", depth: "VALUES", type: "text", focus: "wealth consciousness" },
      6: { topic: "Investment philosophy and time allocation", depth: "VALUES", type: "mcq_text", focus: "resource allocation" },
      7: { topic: "Network influence and leadership style", depth: "INFLUENCE", type: "mcq", focus: "authority and connections" },
      8: { topic: "Community impact and transformation approach", depth: "INFLUENCE", type: "text", focus: "change-making capacity" },
      9: { topic: "Legacy thinking and generational impact", depth: "TRANSFORMATION", type: "text", focus: "long-term vision" },
      10: { topic: "Sacrifice willingness and commitment depth", depth: "TRANSFORMATION", type: "mcq_text", focus: "transformation readiness" }
    }
    
    const config = questionConfig[questionNumber as keyof typeof questionConfig] || {
      topic: "Personal values exploration", depth: "VALUES", type: "mcq", focus: "general assessment"
    }
    
    // Determine sophistication based on score and depth
    let sophistication = "executive-level"
    if (currentScore > 70) sophistication = "visionary, board-level"
    else if (currentScore > 50) sophistication = "senior leadership"
    else if (currentScore > 30) sophistication = "management-level"
    
    const input = `Previous answers:
${context}

Current commitment score: ${currentScore}
Generate question ${questionNumber} of 10.

CONFIGURATION:
- Topic: ${config.topic}
- Depth Level: ${config.depth} 
- Type: ${config.type}
- Focus: ${config.focus}
- Sophistication: ${sophistication}

QUESTION TYPE REQUIREMENTS:
- "mcq": 4 sophisticated options, executive language
- "text": Deep psychological probe, open-ended
- "mcq_text": MCQ + "Please elaborate on your choice"

REQUIREMENTS:
- Question: 10-15 words, sophisticated executive language
- Build meaningfully on previous answers
- Reveal wealth indicators through ${config.focus}
- Context: One elegant sentence setting executive tone

WEALTH PROFILING FOR Q${questionNumber}:
${getWealthProfilingInstructions(questionNumber)}

Return JSON: { 
  "text": "sophisticated executive question", 
  "type": "${config.type}", 
  "options": [...] (if mcq or mcq_text), 
  "context": "Elegant executive context.",
  "id": "langchain-q-${questionNumber}",
  "hasTextInput": ${config.type.includes('text')}
}`

    try {
      const response = await this.chain.invoke({ input })
      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating adaptive question:', error)
      
      // Fallback questions
      const fallbacks = {
        2: { text: "What draws you to sustainable choices?", type: "mcq", options: ["Personal values", "Future generations", "Cost savings", "Social responsibility"] },
        3: { text: "How do you define quality living?", type: "text" },
        4: { text: "What represents luxury to you?", type: "text" },
        5: { text: "How do you make important decisions?", type: "mcq", options: ["Quick gut instinct", "Careful research", "Ask advisors", "Sleep on it"] }
      }
      
      const fallback = fallbacks[questionNumber as keyof typeof fallbacks] || {
        text: "What drives your biggest goals?",
        type: "mcq", 
        options: ["Personal growth", "Impact on others", "Financial success", "Legacy creation"]
      }
      
      return {
        id: `langchain-q-fallback-${questionNumber}`,
        ...fallback,
        context: "Understanding your perspective."
      }
    }
  }
}

// BEHAVIORAL ANALYST AGENT
export class BehavioralAnalystAgent {
  private chain: RunnableSequence
  
  constructor() {
    const llm = new AzureChatOpenAI(azureConfig)
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a forensic psychologist specializing in behavioral pattern analysis. You can read between the lines of what people say and how they say it.

Your expertise includes:
- Response time analysis (fast = high action velocity)
- Language pattern recognition (decisive vs hesitant words)
- Certainty calibration (confidence in responses)
- Specificity analysis (vague vs detailed responses)
- Revision patterns (edit frequency reveals decision-making style)

You analyze behavioral data to calculate 4-dimensional commitment scores:

ACTION VELOCITY INDICATORS:
- Fast response times (< 10 seconds = high velocity)
- Decisive language: "will", "immediately", "already", "committed"
- Past action evidence: "did", "implemented", "achieved", "transformed"
- Specificity in execution details

RESOURCE ALLOCATION INDICATORS:
- Investment language: "invest", "dedicate", "prioritize", "focus"
- Quality preferences: "premium", "artisanal", "sustainable", "custom"
- Time sovereignty indicators: flexible schedules, travel freedom
- Learning investments: coaching, courses, certifications

INFLUENCE RADIUS INDICATORS:
- Leadership language: "lead", "manage", "direct", "influence"
- Network references: "colleagues", "board", "industry", "mentors"
- Community impact: "team", "organization", "movement"
- Decision-making authority indicators

COMMITMENT INTENSITY INDICATORS:
- Transformation language: "transform", "revolutionize", "breakthrough"
- Legacy thinking: "future", "generations", "impact", "purpose"  
- Sacrifice willingness: "difficult", "trade-off", "commitment"
- Long-term vision indicators`],
      ["human", "{input}"]
    ])
    
    this.chain = prompt.pipe(llm).pipe(new StringOutputParser())
  }
  
  async analyzeBehavioralPatterns(
    answers: Answer[],
    behavioralData: BehavioralData[]
  ) {
    const answersText = answers.map((ans, i) => 
      `Q${i+1}: ${ans.value}`
    ).join('\n')
    
    const behavioralText = behavioralData.map((data, i) => 
      `Q${i+1} Behavior: Response time: ${data.responseTime}s, Revisions: ${data.revisionCount}, Certainty: ${data.certaintyLanguage}, Specificity: ${data.specificityIndex}`
    ).join('\n')
    
    const input = `Analyze these responses and behavioral patterns:

ANSWERS:
${answersText}

BEHAVIORAL DATA:
${behavioralText}

Provide insights on:
1. Action velocity patterns
2. Resource allocation indicators 
3. Influence radius signals
4. Commitment intensity markers
5. Overall psychological profile

Return as JSON: {
  "actionVelocityInsights": "Brief analysis",
  "resourceAllocationInsights": "Brief analysis", 
  "influenceRadiusInsights": "Brief analysis",
  "commitmentIntensityInsights": "Brief analysis",
  "overallProfile": "Executive summary",
  "wealthIndicators": ["indicator1", "indicator2", "indicator3"]
}`

    try {
      const response = await this.chain.invoke({ input })
      return JSON.parse(response)
    } catch (error) {
      console.error('Error analyzing behavioral patterns:', error)
      return {
        actionVelocityInsights: "Balanced decision-making approach with thoughtful consideration",
        resourceAllocationInsights: "Quality-conscious choices with growing investment awareness",
        influenceRadiusInsights: "Personal influence with potential for broader impact",
        commitmentIntensityInsights: "Genuine commitment with developing depth",
        overallProfile: "Thoughtful individual with growing sustainability commitment",
        wealthIndicators: ["Quality preferences", "Time flexibility", "Learning investments"]
      }
    }
  }
}

// REPORT GENERATOR AGENT
export class ReportGeneratorAgent {
  private chain: RunnableSequence
  
  constructor() {
    const llm = new AzureChatOpenAI(azureConfig)
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a senior consultant at a prestigious executive assessment firm. You write reports for C-suite executives, board members, and high-net-worth individuals.

Your reports are known for their psychological depth and strategic insights.

You specialize in:
- Behavioral psychology profiling
- Investment readiness assessment  
- Leadership potential evaluation
- Commitment depth analysis
- Strategic engagement recommendations

REPORT STYLE:
- Professional, insightful, sophisticated (like McKinsey reports)
- Concise but comprehensive
- Actionable insights for engagement

COMMITMENT LEVELS:
- Explorer: "Beginning their sustainability journey with curiosity"
- Advocate: "Personally committed with growing influence"
- Catalyst: "Ready to drive systemic change in their sphere"  
- Visionary: "Positioned to transform entire industries"

ENGAGEMENT RECOMMENDATIONS:
- Explorer: Educational content, gentle nurturing
- Advocate: Personal development opportunities, peer connections
- Catalyst: Leadership roles, strategic partnerships
- Visionary: Exclusive opportunities, board positions, major initiatives

INVESTMENT READINESS INDICATORS (subtle):
- High resource allocation scores suggest financial capacity
- Premium quality preferences indicate disposable income
- Time sovereignty suggests wealth independence
- Network influence suggests business success
- Never directly mention money or investment amounts`],
      ["human", "{input}"]
    ])
    
    this.chain = prompt.pipe(llm).pipe(new StringOutputParser())
  }
  
  async generateExecutiveReport(
    answers: Answer[],
    behavioralAnalysis: any,
    commitmentScore: any
  ) {
    const answersText = answers.map((ans, i) => 
      `Q${i+1}: ${ans.value}`
    ).join('\n')
    
    const input = `Create a comprehensive executive assessment report based on:

INTERVIEW RESPONSES:
${answersText}

BEHAVIORAL ANALYSIS:
${JSON.stringify(behavioralAnalysis, null, 2)}

COMMITMENT SCORES:
- Action Velocity: ${commitmentScore.actionVelocity * 100}%
- Resource Allocation: ${commitmentScore.resourceAllocation * 100}%
- Influence Radius: ${commitmentScore.influenceRadius * 100}%
- Commitment Intensity: ${commitmentScore.commitmentIntensity * 100}%
- Final Score: ${commitmentScore.finalScore}
- Level: ${commitmentScore.level}

Generate a sophisticated report with:
1. Executive Summary (commitment level and key insights)
2. Behavioral Profile (4-5 key behavioral insights)
3. Strategic Recommendations (4-5 actionable engagement strategies)

Return as JSON:
{
  "summary": "Executive summary of their commitment level and strategic profile",
  "insights": ["Behavioral insight 1", "Behavioral insight 2", "Behavioral insight 3", "Behavioral insight 4", "Behavioral insight 5"],
  "recommendations": ["Strategic recommendation 1", "Strategic recommendation 2", "Strategic recommendation 3", "Strategic recommendation 4", "Strategic recommendation 5"]
}`

    try {
      const response = await this.chain.invoke({ input })
      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating executive report:', error)
      return {
        summary: `Based on comprehensive behavioral analysis, this individual demonstrates ${commitmentScore.level} level commitment to sustainability with sophisticated decision-making patterns and strategic thinking capabilities.`,
        insights: [
          `Action Velocity: ${commitmentScore.actionVelocity * 100}% - Demonstrates ${commitmentScore.actionVelocity > 0.7 ? 'rapid decision-making with strong execution bias' : 'thoughtful decision-making with careful consideration'}`,
          `Resource Allocation: ${commitmentScore.resourceAllocation * 100}% - Shows ${commitmentScore.resourceAllocation > 0.7 ? 'sophisticated resource management and premium quality focus' : 'growing awareness of strategic investment value'}`,
          `Influence Radius: ${commitmentScore.influenceRadius * 100}% - Exhibits ${commitmentScore.influenceRadius > 0.7 ? 'significant leadership potential with broad network influence' : 'personal influence with capacity for broader impact'}`,
          `Commitment Intensity: ${commitmentScore.commitmentIntensity * 100}% - Reflects ${commitmentScore.commitmentIntensity > 0.7 ? 'deep transformational commitment with legacy thinking' : 'genuine personal commitment with developing depth'}`,
          "Behavioral consistency and authenticity indicators suggest high reliability for strategic partnerships"
        ],
        recommendations: [
          "Engage through exclusive thought leadership opportunities and strategic sustainability initiatives",
          "Connect with peer networks of high-impact sustainability leaders and change-makers",
          "Present opportunities for advisory or board positions in sustainability-focused organizations",
          "Explore strategic partnerships for large-scale sustainability transformation projects",
          "Consider involvement in premium sustainability investment opportunities and ventures"
        ]
      }
    }
  }
}

// MASTER AGENT COORDINATOR
export class SustainabilityAgentCoordinator {
  private questionAgent: QuestionGeneratorAgent
  private analystAgent: BehavioralAnalystAgent  
  private reportAgent: ReportGeneratorAgent
  
  constructor() {
    this.questionAgent = new QuestionGeneratorAgent()
    this.analystAgent = new BehavioralAnalystAgent()
    this.reportAgent = new ReportGeneratorAgent()
  }
  
  async generateInitialQuestion() {
    return await this.questionAgent.generateInitialQuestion()
  }
  
  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: Answer[],
    currentScore: number
  ) {
    return await this.questionAgent.generateAdaptiveQuestion(
      questionNumber,
      previousAnswers, 
      currentScore
    )
  }
  
  async generateFinalReport(
    answers: Answer[],
    behavioralData: BehavioralData[],
    commitmentScore: any
  ) {
    // First, get behavioral analysis
    const behavioralAnalysis = await this.analystAgent.analyzeBehavioralPatterns(
      answers,
      behavioralData
    )
    
    // Then generate comprehensive report
    const reportData = await this.reportAgent.generateExecutiveReport(
      answers,
      behavioralAnalysis,
      commitmentScore  
    )
    
    return {
      report: {
        id: `langchain-report-${Date.now()}`,
        summary: reportData.summary,
        insights: reportData.insights,
        recommendations: reportData.recommendations,
        score: commitmentScore.finalScore,
        level: commitmentScore.level,
        confidence: commitmentScore.confidence,
        timestamp: new Date()
      },
      commitmentScore,
      behavioralAnalysis
    }
  }
}

// Helper function for wealth profiling instructions
function getWealthProfilingInstructions(questionNumber: number): string {
  const instructions = {
    1: "Assess time sovereignty - flexible schedules vs rigid constraints",
    2: "Evaluate travel sophistication - premium experiences vs budget constraints", 
    3: "Analyze living standards - curated environments vs basic accommodations",
    4: "Probe decision authority - executive autonomy vs hierarchical approval",
    5: "Explore quality consciousness - premium preferences vs price sensitivity",
    6: "Assess investment thinking - long-term portfolio vs short-term savings",
    7: "Evaluate network influence - board connections vs individual contributor",
    8: "Measure impact capacity - transformation leadership vs participation",
    9: "Gauge legacy thinking - generational wealth vs current income",
    10: "Test commitment depth - significant sacrifice vs convenient changes"
  }
  
  return instructions[questionNumber as keyof typeof instructions] || "General wealth consciousness assessment"
}