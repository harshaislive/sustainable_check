import { AzureOpenAI } from "openai"
import { Answer } from '@/types'
import { BehavioralData } from '@/lib/commitment/scoring-engine'

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!
})

export class NativeQuestionAgent {
  async generateInitialQuestion() {
    try {
      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a sustainability consultant conducting a comprehensive assessment covering ALL aspects of personal sustainability. 

TOPICS TO COVER (rotate through these, don't repeat):
1. Food Sources & Diet: Do you know where your vegetables come from? Do you eat seasonal vegetables? Is your food residue free?
2. Water: Do you know where your water comes from? Do you carry your water bottle to the airport?
3. Transportation & Travel: Where did you last go for holiday? How would you classify your last holiday?
4. Consumption: Are you willing to pay more for knowing the source of your food? Which brands represent your personality best?
5. Energy & Home: renewable energy, efficiency, smart home tech
6. Waste & Recycling: zero waste efforts, composting, circular economy
7. Fashion & Shopping: fast fashion, sustainable brands, minimalism
8. Finance: ESG investing, sustainable banking, carbon offsets
9. Community: activism, education, local initiatives
10. Digital: e-waste, cloud usage, digital minimalism

ALWAYS:
- Respond with valid JSON only
- Make questions progressively deeper
- Include "Other (please specify)" as the last option with encouragement`
          },
          {
            role: "user", 
            content: `Create a simple, factual opening question about sustainability basics. Focus on concrete, everyday practices rather than abstract concepts.

Examples of good questions:
- "Do you know where your vegetables come from?"
- "Do you carry your water bottle when traveling?"
- "Are you willing to pay more for knowing the source of your food?"

Return only this JSON format:
{
  "text": "Your simple, factual sustainability question",
  "type": "mcq",
  "options": [
    "First specific, concrete option",
    "Second meaningful choice",
    "Third practical option",
    "Fourth realistic choice",
    "Other (please specify)"
  ],
  "context": "Brief context about the importance of this practice.",
  "id": "native-q-1",
  "multiSelect": false,
  "encourageOther": "Share your specific approach"
}

CRITICAL REQUIREMENTS:
- ALWAYS provide exactly 5 options
- The 5th option MUST ALWAYS be "Other (please specify)" - never add a second "Other" option
- Use "mcq" for single selection only
- Ask simple, factual questions about concrete behaviors
- Make options specific and realistic
- Focus on everyday sustainability practices`
          }
        ],
        max_completion_tokens: 1000,
        model: process.env.AZURE_OPENAI_DEPLOYMENT!
      })

      const content = response.choices[0]?.message?.content
      console.log('OpenAI response content:', content)
      
      if (content) {
        // Clean the content in case there are markdown code blocks
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Cleaned content length:', cleanContent.length)
        console.log('Full cleaned content:', cleanContent)
        
        try {
          const parsed = JSON.parse(cleanContent)
          // Validate and clean the question to prevent multiple "Other" options
          return this.validateAndCleanQuestion(parsed)
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          console.error('Content that failed to parse:', cleanContent)
          throw parseError
        }
      }
      throw new Error('No content returned')
    } catch (error) {
      console.error('Native OpenAI agent error:', error)
      // Fallback question
      return {
        id: 'native-fallback-initial',
        text: "What first got you interested in sustainability?",
        type: "mcq",
        options: [
          "Concern for future generations",
          "Personal health and wellbeing", 
          "Environmental documentaries or news",
          "Cost savings and efficiency",
          "Other (please specify)"
        ],
        context: "Understanding your sustainability journey starting point.",
        multiSelect: false,
        encourageOther: "Share what sparked your sustainability interest"
      }
    }
  }

  private validateAndCleanQuestion(question: any): any {
    if (!question.options || !Array.isArray(question.options)) {
      console.warn('Invalid question options, using fallback')
      return question
    }

    // Remove duplicate "Other" options - keep only the first one
    const otherIndices: number[] = []
    question.options.forEach((option: string, index: number) => {
      if (option.toLowerCase().includes('other') && option.toLowerCase().includes('specify')) {
        otherIndices.push(index)
      }
    })

    // If multiple "Other" options found, keep only the first one
    if (otherIndices.length > 1) {
      console.warn(`Found ${otherIndices.length} "Other" options, removing duplicates`)
      // Remove duplicates in reverse order to maintain indices
      for (let i = otherIndices.length - 1; i > 0; i--) {
        question.options.splice(otherIndices[i], 1)
      }
    }

    // Ensure exactly one "Other" option exists
    const hasOther = question.options.some((option: string) => 
      option.toLowerCase().includes('other') && option.toLowerCase().includes('specify')
    )

    if (!hasOther) {
      // Add "Other" option if missing
      question.options.push("Other (please specify)")
    }

    // Limit to max 5 options total
    if (question.options.length > 5) {
      question.options = question.options.slice(0, 5)
      // Make sure "Other" is still the last option
      const otherOption = question.options.find((opt: string) => 
        opt.toLowerCase().includes('other') && opt.toLowerCase().includes('specify')
      )
      if (otherOption) {
        question.options = question.options.filter((opt: string) => opt !== otherOption)
        question.options.push(otherOption)
      }
    }

    console.log('Validated question options:', question.options)
    return question
  }

  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: Answer[],
    currentScore: number
  ) {
    try {
      // Enhanced context with question history and custom responses
      const context = previousAnswers.map((ans, i) => {
        const customFlag = ans.isCustomResponse ? ' [CUSTOM RESPONSE - BUILD ON THIS]' : ''
        return `Q${i+1}: "${ans.questionText}" → ${ans.value}${customFlag}`
      }).join('\n')

      // Identify custom responses for follow-up
      const customResponses = previousAnswers.filter(ans => ans.isCustomResponse)
      const customContext = customResponses.length > 0 
        ? `\n\nIMPORTANT CUSTOM RESPONSES TO BUILD ON:\n${customResponses.map((ans, i) => 
            `- "${ans.questionText}" → ${ans.value}`
          ).join('\n')}` 
        : ''

      // Extract previous question texts to avoid repetition
      const previousQuestionTexts = previousAnswers.map(ans => ans.questionText)

      // Track topics to enforce diversity
      const getQuestionTopic = (questionText: string) => {
        const text = questionText.toLowerCase()
        if (text.includes('vegetable') || text.includes('food') || text.includes('eat') || text.includes('seasonal')) return 'Food & Diet'
        if (text.includes('water') || text.includes('bottle')) return 'Water'
        if (text.includes('holiday') || text.includes('travel') || text.includes('transport')) return 'Travel'
        if (text.includes('pay') || text.includes('brand') || text.includes('buy') || text.includes('purchase')) return 'Consumption'
        if (text.includes('energy') || text.includes('home') || text.includes('appliance')) return 'Energy & Home'
        if (text.includes('waste') || text.includes('recycle') || text.includes('compost')) return 'Waste'
        return 'General'
      }

      // Analyze last 2 questions for topic repetition
      const lastTwoTopics = previousAnswers.slice(-2).map(ans => getQuestionTopic(ans.questionText))
      
      const topicCounts = previousAnswers.reduce((acc, ans) => {
        const topic = getQuestionTopic(ans.questionText)
        acc[topic] = (acc[topic] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a sustainability consultant creating question ${questionNumber} of 10. Focus on concrete behaviors and everyday sustainability practices.

CRITICAL RULES:
1. NEVER REPEAT ANY PREVIOUS QUESTION - Each question must be completely unique
2. BUILD ON CUSTOM RESPONSES - If someone provided detailed "Other" responses, ask follow-up questions about those specific details
3. CREATE LOGICAL FLOW - Connect new questions to previous answers naturally
4. ALWAYS provide exactly 5 options with "Other (please specify)" as the 5th option

PREVIOUS QUESTIONS ASKED (DO NOT REPEAT ANY OF THESE):
${previousQuestionTexts.map((q, i) => `${i+1}. "${q}"`).join('\n')}

TOPIC COVERAGE STATUS:
${Object.entries(topicCounts).map(([topic, count]) => `- ${topic}: ${count} question(s)`).join('\n')}

QUESTION FLOW STRATEGY:
- Questions 1-3: Basic sustainability awareness (food, water, waste)
- Questions 4-6: Consumption patterns (shopping, brands, transportation)  
- Questions 7-8: Home & energy practices
- Questions 9-10: Community involvement & future planning

SAMPLE GOOD QUESTIONS (for reference - don't copy exactly):
- "Do you know where your vegetables come from?"
- "Do you carry your water bottle when traveling?"
- "How do you handle electronic waste?"
- "Do you buy second-hand clothing?"

ALWAYS respond with valid JSON in this exact format:
{
  "text": "Simple, factual sustainability question",
  "type": "mcq", 
  "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Other (please specify)"],
  "context": "Brief explanation of why this matters",
  "id": "native-q-${questionNumber}",
  "multiSelect": false,
  "encourageOther": "Encourage specific details"
}`
          },
          {
            role: "user",
            content: `Create sustainability question ${questionNumber} that builds logically on the conversation flow.

CONVERSATION HISTORY WITH QUESTIONS AND ANSWERS:
${context}${customContext}

CURRENT SCORE: ${currentScore}/100
QUESTION NUMBER: ${questionNumber}/10

DEDUPLICATION CHECK:
- Do NOT ask any variation of the ${previousQuestionTexts.length} questions already asked above
- Ensure your question is completely different from all previous questions
- If someone gave detailed "Other" responses above, ask specific follow-up questions about those details

TOPIC DIVERSIFICATION:
- Topics already covered: ${Object.keys(topicCounts).length > 0 ? Object.entries(topicCounts).map(([topic, count]) => `${topic} (${count})`).join(', ') : 'None yet'}
- Avoid topics with 2+ questions already
- Fresh topics available: Food & Diet, Water, Travel, Consumption, Energy & Home, Waste, Fashion, Digital

Create a completely unique question that naturally follows from the conversation above.
- This is question ${questionNumber} of 10
- You have already asked ${previousAnswers.length} questions
- NEVER ask the exact same question twice
- Each question must be completely unique and different from all previous questions

TOPIC DIVERSITY RULES:
- NEVER ask more than 2 questions on the same topic
- Count previous questions to ensure topic rotation
- Force topic switches after 2 questions on same area

ANALYZE THE PREVIOUS ANSWERS:
- What topics have been covered already?
- How many questions on each topic?
- What NEW topic should be explored?
- Ensure balanced coverage across different areas

TOPIC ROTATION (never more than 2 questions each):
- Food & Diet (vegetables, seasonal eating, food sources)
- Water (sources, bottles, conservation)
- Travel (holidays, transportation, style)
- Consumption (willingness to pay, brand choices)
- Energy & Home (appliances, renewable energy)
- Waste (recycling, composting, reduction)

MANDATORY TOPIC SWITCHING:
If last 2 questions were on same topic, MUST switch to different topic

ASK SIMPLE, FACTUAL QUESTIONS like:
- "Do you know where your vegetables come from?"
- "Do you eat seasonal vegetables?"
- "Do you carry your water bottle to the airport?"
- "Are you willing to pay more for knowing the source of your food?"
- "Where did you last go for holiday?" (can be open-ended but provide MCQ options)
- "How would you classify your last holiday?"

Return JSON:
{
  "text": "Your simple, factual sustainability question",
  "type": "mcq",
  "options": [
    "First specific, concrete option",
    "Second realistic choice",
    "Third practical option",
    "Fourth meaningful choice",
    "Other (please specify)"
  ],
  "context": "Brief context about why this matters.",
  "id": "native-q-${questionNumber}",
  "multiSelect": false,
  "encourageOther": "Share your specific approach"
}

CRITICAL RULES:
- ALWAYS provide exactly 5 options
- The 5th option MUST ALWAYS be "Other (please specify)" - NEVER duplicate this
- Use "mcq" type only
- Ask simple, observable behavior questions
- NEVER REPEAT THE EXACT SAME QUESTION - each question must be unique
- ENFORCE TOPIC DIVERSITY: Never more than 2 questions on same topic
- If any topic has 2+ questions, MUST choose different topic
- Rotate through topics: Food → Water → Travel → Consumption → Energy → Waste
- Keep questions factual and concrete, not abstract
- Balance depth with breadth across sustainability areas
- AVOID lifestyle questions that aren't about sustainability (no morning routines, etc.)`
          }
        ],
        max_completion_tokens: 1200,
        model: process.env.AZURE_OPENAI_DEPLOYMENT!
      })

      const content = response.choices[0]?.message?.content
      console.log('OpenAI next question response:', content)
      
      if (content) {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Next question cleaned content:', cleanContent)
        
        try {
          const parsed = JSON.parse(cleanContent)
          // Validate and clean the question to prevent multiple "Other" options
          return this.validateAndCleanQuestion(parsed)
        } catch (parseError) {
          console.error('Next question JSON parsing failed:', parseError)
          console.error('Next question content that failed:', cleanContent)
          throw parseError
        }
      }
      throw new Error('No content returned')
    } catch (error) {
      console.error('Native OpenAI next question error:', error)
      
      // Simple and factual sustainability fallback questions
      const fallbacks = [
        {
          text: "Do you know where your vegetables come from?",
          type: "mcq",
          options: [
            "Yes, I buy local/regional produce",
            "Sometimes, I check labels when shopping",
            "No, but I'm interested to learn",
            "I don't think about it much",
            "Other (please specify)"
          ],
          context: "Understanding food sources shows sustainability awareness.",
          multiSelect: false,
          encourageOther: "Tell us about your food sourcing preferences"
        },
        {
          text: "Do you eat seasonal vegetables?",
          type: "mcq",
          options: [
            "Yes, I plan meals around seasonal produce",
            "Sometimes, when they're available",
            "I try to but it's challenging",
            "I don't consider seasons when buying",
            "Other (please specify)"
          ],
          context: "Seasonal eating reduces environmental impact.",
          multiSelect: false,
          encourageOther: "Share your approach to seasonal eating"
        },
        {
          text: "Do you carry your water bottle to the airport?",
          type: "mcq",
          options: [
            "Always, I refill after security",
            "Usually, but sometimes forget",
            "Rarely, I buy water at the airport",
            "Never, it's too much hassle",
            "Other (please specify)"
          ],
          context: "Small habits like this show environmental mindfulness.",
          multiSelect: false,
          encourageOther: "Tell us about your travel water habits"
        },
        {
          text: "Are you willing to pay more for knowing the source of your food?",
          type: "mcq",
          options: [
            "Yes, transparency is worth the premium",
            "Sometimes, for certain products",
            "I want to but budget is tight",
            "No, price is my main concern",
            "Other (please specify)"
          ],
          context: "Willingness to pay shows commitment to sustainable practices.",
          multiSelect: false,
          encourageOther: "Share your thoughts on paying for transparency"
        },
        {
          text: "Where did you last go for your holiday?",
          type: "mcq",
          options: [
            "Nearby region (within 500km)",
            "Domestic destination",
            "International but nearby country",
            "Long-haul international destination",
            "Other (please specify)"
          ],
          context: "Travel patterns show environmental impact awareness.",
          multiSelect: false,
          encourageOther: "Tell us about your recent travel"
        },
        {
          text: "How would you classify your last holiday?",
          type: "mcq",
          options: [
            "Immersive local experience",
            "Barefoot luxury with local community support",
            "Standard resort/hotel stay",
            "Adventure/outdoor focused",
            "Other (please specify)"
          ],
          context: "Holiday style shows values around community and environment.",
          multiSelect: false,
          encourageOther: "Describe your travel style"
        }
      ]
      
      // Topic classification helper function
      const getQuestionTopic = (questionText: string) => {
        const text = questionText.toLowerCase()
        if (text.includes('vegetable') || text.includes('food') || text.includes('eat') || text.includes('seasonal')) return 'Food & Diet'
        if (text.includes('water') || text.includes('bottle')) return 'Water'
        if (text.includes('holiday') || text.includes('travel') || text.includes('transport')) return 'Travel'
        if (text.includes('pay') || text.includes('brand') || text.includes('buy') || text.includes('purchase')) return 'Consumption'
        if (text.includes('energy') || text.includes('home') || text.includes('appliance')) return 'Energy & Home'
        if (text.includes('waste') || text.includes('recycle') || text.includes('compost')) return 'Waste'
        return 'General'
      }
      
      // Select fallback ensuring topic diversity
      const usedTopics = previousAnswers.slice(-2).map(ans => getQuestionTopic(ans.value))
      let fallbackIndex = questionNumber % fallbacks.length
      
      // If we have answers and need to avoid topic repetition
      if (previousAnswers.length >= 2) {
        const lastTopic = getQuestionTopic(previousAnswers[previousAnswers.length - 1].value)
        const secondLastTopic = previousAnswers.length >= 2 ? getQuestionTopic(previousAnswers[previousAnswers.length - 2].value) : null
        
        // If last two questions were on same topic, force different topic
        if (lastTopic === secondLastTopic) {
          const availableFallbacks = fallbacks.filter((_, index) => {
            const fallbackTopic = index < 2 ? 'Food & Diet' : 
                                 index < 3 ? 'Water' : 
                                 index < 5 ? 'Travel' : 'Consumption'
            return fallbackTopic !== lastTopic
          })
          fallbackIndex = fallbacks.indexOf(availableFallbacks[0] || fallbacks[0])
        }
      }
      
      const fallback = fallbacks[fallbackIndex]
      return {
        id: `native-fallback-${questionNumber}`,
        ...fallback
      }
    }
  }

  async generateReport(
    answers: Answer[],
    behavioralData: BehavioralData[],
    commitmentScore: any
  ) {
    try {
      const answersText = answers.map((ans, i) => 
        `Q${i+1}: ${ans.value}`
      ).join('\n')

      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a senior consultant writing an executive assessment report for C-suite individuals.

Interview Responses:
${answersText}

Commitment Score: ${commitmentScore.finalScore}
Level: ${commitmentScore.level}

Generate a sophisticated executive report with:
1. Executive Summary (commitment level and key insights)
2. Behavioral Profile (4-5 key insights)
3. Strategic Recommendations (4-5 actionable strategies)

Return JSON:
{
  "summary": "Personal summary of their sustainability commitment and profile",
  "insights": ["Personal insight 1", "Personal insight 2", "Personal insight 3", "Personal insight 4", "Personal insight 5"],
  "recommendations": ["Personal recommendation 1", "Personal recommendation 2", "Personal recommendation 3", "Personal recommendation 4", "Personal recommendation 5"],
  "categories": [
    {"name": "Home & Lifestyle", "score": 75, "description": "Your approach to sustainable living at home"},
    {"name": "Consumption", "score": 60, "description": "How you think about purchases and waste"},
    {"name": "Transportation", "score": 45, "description": "Your travel and commuting choices"},
    {"name": "Community Impact", "score": 80, "description": "Your influence on others and social responsibility"}
  ],
  "personalityProfile": "Brief description of their sustainability personality and approach"
}`
          },
          {
            role: "user",
            content: `Generate an executive assessment report based on the interview responses and commitment analysis.`
          }
        ],
        max_completion_tokens: 1500,
        model: process.env.AZURE_OPENAI_DEPLOYMENT!
      })

      const content = response.choices[0]?.message?.content
      console.log('Report response content:', content)
      
      if (content) {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('Report cleaned content:', cleanContent)
        
        try {
          return JSON.parse(cleanContent)
        } catch (parseError) {
          console.error('Report JSON parsing failed:', parseError)
          console.error('Report content that failed:', cleanContent)
          throw parseError
        }
      }
      throw new Error('No content returned')
    } catch (error) {
      console.error('Native OpenAI report error:', error)
      
      // Fallback report
      return {
        summary: `Based on your responses, you demonstrate ${commitmentScore.level} level commitment to sustainability with genuine personal engagement.`,
        insights: [
          `Action Taking: ${Math.round(commitmentScore.actionVelocity * 100)}% - You ${commitmentScore.actionVelocity > 0.7 ? 'take quick action on sustainability goals' : 'think carefully before making sustainability changes'}`,
          `Resource Investment: ${Math.round(commitmentScore.resourceAllocation * 100)}% - You ${commitmentScore.resourceAllocation > 0.7 ? 'invest significantly in sustainable options' : 'are growing your sustainable investments'}`,
          `Personal Influence: ${Math.round(commitmentScore.influenceRadius * 100)}% - You ${commitmentScore.influenceRadius > 0.7 ? 'actively influence others toward sustainability' : 'lead by personal example'}`,
          `Commitment Depth: ${Math.round(commitmentScore.commitmentIntensity * 100)}% - Your commitment ${commitmentScore.commitmentIntensity > 0.7 ? 'runs deep with long-term thinking' : 'is genuine and developing'}`,
          "Your personal sustainability journey shows authentic engagement and growth potential"
        ],
        recommendations: [
          "Continue building sustainable habits in your daily routine",
          "Connect with local sustainability groups and communities",
          "Explore new areas where you can make a personal impact", 
          "Share your sustainability journey to inspire others",
          "Consider taking on bigger challenges that align with your values"
        ],
        categories: [
          {
            name: "Home & Lifestyle",
            score: Math.round(commitmentScore.resourceAllocation * 100),
            description: "Your approach to sustainable living at home"
          },
          {
            name: "Consumption Choices", 
            score: Math.round(commitmentScore.actionVelocity * 80),
            description: "How thoughtfully you make purchasing decisions"
          },
          {
            name: "Personal Impact",
            score: Math.round(commitmentScore.commitmentIntensity * 100), 
            description: "Your personal commitment to making a difference"
          },
          {
            name: "Community Influence",
            score: Math.round(commitmentScore.influenceRadius * 100),
            description: "How you inspire others toward sustainability"
          }
        ],
        personalityProfile: `You are a ${commitmentScore.level} in your sustainability journey, showing ${commitmentScore.finalScore >= 60 ? 'strong commitment' : commitmentScore.finalScore >= 30 ? 'growing engagement' : 'developing awareness'} and authentic personal values around environmental and social responsibility.`
      }
    }
  }
}

export class NativeSustainabilityCoordinator {
  private questionAgent: NativeQuestionAgent
  
  constructor() {
    this.questionAgent = new NativeQuestionAgent()
  }
  
  async generateInitialQuestion() {
    return await this.questionAgent.generateInitialQuestion()
  }
  
  async generateNextQuestion(
    questionNumber: number,
    previousAnswers: Answer[],
    currentScore: number
  ) {
    return await this.questionAgent.generateNextQuestion(
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
    const reportData = await this.questionAgent.generateReport(
      answers,
      behavioralData,
      commitmentScore
    )
    
    return {
      report: {
        id: `native-report-${Date.now()}`,
        summary: reportData.summary,
        insights: reportData.insights,
        recommendations: reportData.recommendations,
        score: commitmentScore.finalScore,
        level: commitmentScore.level,
        confidence: commitmentScore.confidence,
        timestamp: new Date()
      },
      commitmentScore
    }
  }
}