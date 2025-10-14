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
      // STRATEGY 2: SUSTAINABILITY WHEEL - Question 1 is always about "Food & Diet"
      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a sustainability consultant using the SUSTAINABILITY WHEEL methodology for comprehensive assessment.

🎯 MANDATORY TOPIC FOR QUESTION 1:
Topic: **Food & Diet**
Keywords: food, vegetables, eat, diet, organic, local, seasonal, meat, plant-based
Example questions:
- "Do you know where your vegetables come from?"
- "How often do you eat plant-based meals?"
- "Do you buy organic or local produce?"

This is QUESTION 1 of 10 in the Sustainability Wheel covering these topics in order:
1. Food & Diet → 2. Water → 3. Energy → 4. Transportation → 5. Waste
6. Fashion & Shopping → 7. Finance → 8. Community → 9. Digital → 10. Future Vision

CRITICAL RULES:
- Question MUST be about Food & Diet (vegetables, eating habits, food sources)
- Make it simple, practical, and behavior-focused
- ALWAYS provide exactly 5 options
- 5th option MUST be "Other (please specify)"
- Use "mcq" type only
- Keep it concrete and observable

Return valid JSON only.`
          },
          {
            role: "user",
            content: `Create the opening question about **Food & Diet** (MANDATORY for Q1).

Make it simple, factual, and about concrete food/eating behaviors.

Return only this JSON format:
{
  "text": "Your simple question about food/diet",
  "type": "mcq",
  "options": [
    "First specific option",
    "Second meaningful choice",
    "Third practical option",
    "Fourth realistic choice",
    "Other (please specify)"
  ],
  "context": "Brief explanation why Food & Diet matters for sustainability",
  "id": "native-q-1",
  "multiSelect": false,
  "encourageOther": "Share your specific food approach"
}

REQUIREMENTS:
- Focus on Food & Diet only
- Use keywords: food, vegetables, eat, or diet
- 5 options total, last one is "Other (please specify)"
- Simple and factual`
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
      // STRATEGY 2: SUSTAINABILITY WHEEL - Enforced Topic Diversity
      // Each of 10 questions covers a different sustainability pillar

      const mandatoryTopics = [
        {
          id: 1,
          topic: 'Food & Diet',
          keywords: ['food', 'vegetables', 'eat', 'diet', 'organic', 'local', 'seasonal', 'meat', 'plant-based'],
          examples: ['Do you know where your vegetables come from?', 'How often do you eat plant-based meals?', 'Do you buy organic or local produce?']
        },
        {
          id: 2,
          topic: 'Water',
          keywords: ['water', 'bottle', 'conservation', 'tap', 'drink', 'hydration'],
          examples: ['Do you carry a reusable water bottle?', 'How do you conserve water at home?', 'Do you know where your water comes from?']
        },
        {
          id: 3,
          topic: 'Energy',
          keywords: ['energy', 'electricity', 'power', 'heating', 'cooling', 'solar', 'LED', 'appliances', 'thermostat'],
          examples: ['How do you manage home energy use?', 'Do you use LED bulbs?', 'Have you considered renewable energy?']
        },
        {
          id: 4,
          topic: 'Transportation',
          keywords: ['transport', 'car', 'drive', 'commute', 'bike', 'walk', 'public', 'bus', 'train', 'travel', 'flight'],
          examples: ['How do you commute to work?', 'How often do you use public transportation?', 'Do you carpool or bike?']
        },
        {
          id: 5,
          topic: 'Waste',
          keywords: ['waste', 'recycle', 'compost', 'trash', 'garbage', 'zero-waste', 'disposal', 'landfill'],
          examples: ['How do you handle food waste?', 'Do you compost?', 'What do you recycle at home?']
        },
        {
          id: 6,
          topic: 'Fashion & Shopping',
          keywords: ['clothing', 'clothes', 'fashion', 'shopping', 'buy', 'purchase', 'second-hand', 'thrift', 'fast fashion'],
          examples: ['Do you buy second-hand clothing?', 'How often do you shop for new clothes?', 'What guides your clothing choices?']
        },
        {
          id: 7,
          topic: 'Finance',
          keywords: ['money', 'invest', 'bank', 'finance', 'ESG', 'ethical', 'savings', 'budget', 'spend'],
          examples: ['Do you consider ESG factors in investing?', 'Do you use ethical banking?', 'Are you willing to pay more for sustainable products?']
        },
        {
          id: 8,
          topic: 'Community',
          keywords: ['community', 'local', 'volunteer', 'activism', 'education', 'teach', 'share', 'influence', 'neighbors'],
          examples: ['Are you involved in local sustainability initiatives?', 'Do you teach others about sustainability?', 'How do you influence your community?']
        },
        {
          id: 9,
          topic: 'Digital',
          keywords: ['digital', 'electronic', 'e-waste', 'devices', 'phone', 'computer', 'cloud', 'streaming', 'data'],
          examples: ['How do you handle electronic waste?', 'Do you consider digital carbon footprint?', 'How long do you keep devices before upgrading?']
        },
        {
          id: 10,
          topic: 'Future Vision',
          keywords: ['future', 'goal', 'change', 'improve', 'plan', 'vision', 'commitment', 'next', 'willing'],
          examples: ['What sustainability goal do you want to achieve next year?', 'How willing are you to make bigger changes?', 'What would you like to improve?']
        }
      ]

      // Determine which topic should be covered for this question number
      const assignedTopic = mandatoryTopics[questionNumber - 1]

      if (!assignedTopic) {
        throw new Error(`No topic assigned for question ${questionNumber}`)
      }

      // Check if this topic has already been covered (failsafe)
      const coveredTopics = previousAnswers.map((ans, i) => {
        const qNum = i + 1
        return mandatoryTopics[qNum - 1]?.topic || 'Unknown'
      })

      // Build context
      const context = previousAnswers.map((ans, i) => {
        const topicLabel = mandatoryTopics[i]?.topic || 'General'
        return `Q${i+1} [${topicLabel}]: "${ans.questionText}" → ${ans.value}`
      }).join('\n')

      // Previous question texts for deduplication
      const previousQuestionTexts = previousAnswers.map(ans => ans.questionText)

      const response = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a sustainability consultant using the SUSTAINABILITY WHEEL methodology to ensure comprehensive assessment coverage.

🎯 MANDATORY TOPIC FOR THIS QUESTION:
Topic: **${assignedTopic.topic}**
Keywords to include: ${assignedTopic.keywords.slice(0, 5).join(', ')}
Example questions for inspiration: ${assignedTopic.examples.join(' | ')}

CRITICAL RULES:
1. Your question MUST be about "${assignedTopic.topic}" - this is NON-NEGOTIABLE
2. Do NOT stray into other topics - stay focused on ${assignedTopic.topic}
3. NEVER REPEAT any previous question - each must be completely unique
4. Make it practical, concrete, and behavior-focused
5. ALWAYS provide exactly 5 options with "Other (please specify)" as the 5th option

PREVIOUS QUESTIONS TO AVOID REPEATING:
${previousQuestionTexts.map((q, i) => `${i+1}. "${q}"`).join('\n')}

TOPICS ALREADY COVERED:
${coveredTopics.map((t, i) => `Q${i+1}: ${t}`).join(', ')}

SUSTAINABILITY WHEEL STRUCTURE (10 Pillars):
1. Food & Diet → 2. Water → 3. Energy → 4. Transportation → 5. Waste
6. Fashion & Shopping → 7. Finance → 8. Community → 9. Digital → 10. Future Vision

ALWAYS respond with valid JSON in this exact format:
{
  "text": "Simple, practical question about ${assignedTopic.topic}",
  "type": "mcq",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Other (please specify)"],
  "context": "Brief explanation of why ${assignedTopic.topic} matters for sustainability",
  "id": "native-q-${questionNumber}",
  "multiSelect": false,
  "encourageOther": "Encourage specific details about ${assignedTopic.topic}"
}`
          },
          {
            role: "user",
            content: `Create question ${questionNumber} of 10 about **${assignedTopic.topic}** (MANDATORY TOPIC).

CONVERSATION HISTORY:
${context}

REQUIREMENTS:
- Question MUST focus on "${assignedTopic.topic}"
- Use these keywords naturally: ${assignedTopic.keywords.slice(0, 3).join(', ')}
- Do NOT repeat any of the ${previousQuestionTexts.length} questions above
- Keep it simple, factual, and actionable
- Make options realistic and practical

Return valid JSON only.`
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