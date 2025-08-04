import { NextResponse } from 'next/server'
import { NativeSustainabilityCoordinator } from '@/lib/agents/native-openai-agents'

export async function POST() {
  try {
    const coordinator = new NativeSustainabilityCoordinator()
    const firstQuestion = await coordinator.generateInitialQuestion()
    
    return NextResponse.json(firstQuestion)
  } catch (error) {
    console.error('Error generating initial question with native agents:', error)
    
    // Simple factual sustainability fallback questions
    const fallbackQuestions = [
      {
        id: 'fallback-vegetables',
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
        id: 'fallback-water-bottle',
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
        id: 'fallback-seasonal',
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
        id: 'fallback-pay-more',
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
      }
    ]
    
    const questionIndex = Math.floor(Math.random() * fallbackQuestions.length)
    return NextResponse.json(fallbackQuestions[questionIndex])
  }
}