🎯 3 Question Generation Strategies for Holistic Sustainability Assessment
STRATEGY 1: "The Customer Value Journey" Framework
Inspired by Ryan Deiss's marketing funnel - Awareness → Engagement → Conversion → Ascension Concept: Guide users through a psychological journey from basic awareness to deep commitment. 10-Question Structure: Phase 1: Awareness (Q1-2) - Surface-level, non-threatening questions
Q1: Food awareness (vegetables, local sourcing)
Q2: Water/basic consumption habits
Phase 2: Engagement (Q3-5) - Medium difficulty, lifestyle questions
Q3: Transportation choices
Q4: Home energy usage
Q5: Shopping & consumption patterns
Phase 3: Conversion (Q6-8) - Values-based, identity questions
Q6: Waste management philosophy
Q7: Brand values alignment
Q8: Community involvement
Phase 4: Ascension (Q9-10) - Future vision, deep commitment
Q9: Financial sustainability (ESG investing, green banking)
Q10: Personal mission & influence (teaching others, advocacy)
✅ Pros:
Natural psychological progression
Builds trust before asking deeper questions
Mirrors marketing conversion path (familiar to business-minded users)
Each phase measures different commitment levels
❌ Cons:
Requires strict phase adherence (less flexibility)
Might feel "leading" if not carefully worded
AI Implementation:
const questionPhases = {
  1: { phase: 'Awareness', topics: ['food', 'water', 'basic-consumption'] },
  2: { phase: 'Awareness', topics: ['food', 'water', 'basic-consumption'] },
  3: { phase: 'Engagement', topics: ['transport', 'energy', 'shopping'] },
  4: { phase: 'Engagement', topics: ['transport', 'energy', 'shopping'] },
  5: { phase: 'Engagement', topics: ['transport', 'energy', 'shopping'] },
  6: { phase: 'Conversion', topics: ['waste', 'values', 'community'] },
  7: { phase: 'Conversion', topics: ['waste', 'values', 'community'] },
  8: { phase: 'Conversion', topics: ['waste', 'values', 'community'] },
  9: { phase: 'Ascension', topics: ['finance', 'advocacy', 'future-vision'] },
 10: { phase: 'Ascension', topics: ['finance', 'advocacy', 'future-vision'] }
}
STRATEGY 2: "The Sustainability Wheel" - Balanced Coverage
Inspired by Ryan Deiss's emphasis on comprehensive customer understanding Concept: Ensure every major sustainability pillar gets exactly 1-2 questions. No topic domination. 10-Question Structure (Enforced Diversity):
Food & Diet (Q1): Local sourcing, organic, plant-based
Water (Q2): Conservation, source awareness
Energy (Q3): Home efficiency, renewables
Transportation (Q4): Commute, travel habits
Waste (Q5): Recycling, composting, zero-waste
Fashion & Shopping (Q6): Fast fashion, second-hand, minimalism
Finance (Q7): ESG investing, ethical banking
Community (Q8): Local initiatives, activism, education
Digital (Q9): E-waste, cloud usage, digital footprint
Future Vision (Q10): Personal goals, willingness to change
✅ Pros:
Guaranteed holistic coverage
Prevents topic tunneling (the gardening problem you experienced)
Easy to score across categories
Fair assessment of all sustainability dimensions
❌ Cons:
Less adaptive to user's unique profile
Might ask irrelevant questions (e.g., digital footprint to someone who mentioned they're offline)
AI Implementation:
const mandatoryTopics = [
  { topic: 'Food & Diet', used: false },
  { topic: 'Water', used: false },
  { topic: 'Energy', used: false },
  { topic: 'Transportation', used: false },
  { topic: 'Waste', used: false },
  { topic: 'Fashion & Shopping', used: false },
  { topic: 'Finance', used: false },
  { topic: 'Community', used: false },
  { topic: 'Digital', used: false },
  { topic: 'Future Vision', used: false }
]

// For each question, pick the next unused topic
// Mark as used after generating question
STRATEGY 3: "The Deiss Deep Dive" - Adaptive Storytelling
Inspired by Ryan Deiss's "Soap Opera Sequence" - follow the user's unique story Concept: First 3 questions establish the user's "archetype," then adaptively deep-dive into their specific lifestyle profile. 10-Question Structure: Discovery Phase (Q1-3): Identify user archetype
Q1: Lifestyle Anchor - "What best describes your daily routine?"
Urban professional / Suburban family / Rural homesteader / Digital nomad / Student
Q2: Values Compass - "What motivates you most?"
Health / Environment / Cost savings / Community / Innovation
Q3: Action Readiness - "How ready are you to make changes?"
Already active / Very willing / Somewhat willing / Just exploring / Not ready
Based on answers, AI identifies archetype:
The Urban Minimalist → Focus on: Transportation, digital, micro-actions
The Suburban Family → Focus on: Food, home energy, community
The Rural Steward → Focus on: Land use, water, regenerative practices
The Conscious Consumer → Focus on: Shopping, fashion, ethical finance
The Community Builder → Focus on: Local initiatives, education, activism
Adaptive Questions (Q4-10): 7 deep-dive questions tailored to archetype Example for "Suburban Family":
Q4: Food sourcing for family meals
Q5: Home energy with kids
Q6: School involvement in sustainability
Q7: Family transportation patterns
Q8: Waste management with children
Q9: Teaching kids about environment
Q10: Future family sustainability goals
✅ Pros:
Highly personalized experience
Feels like a conversation, not a survey
Users feel "seen" and understood
Most engaging approach (Ryan Deiss's storytelling strength)
Deepest insights into actual behavior
❌ Cons:
Complex AI logic required
Might miss some sustainability dimensions
Harder to standardize scoring
Requires more sophisticated prompts
AI Implementation:
// After Q3, classify user archetype
const archetypes = {
  'urban-minimalist': {
    focusAreas: ['transportation', 'digital', 'small-space-solutions', 'community-actions'],
    questionTemplates: [...]
  },
  'suburban-family': {
    focusAreas: ['food', 'home-energy', 'kids-education', 'community'],
    questionTemplates: [...]
  },
  // ... more archetypes
}

// Generate remaining 7 questions from appropriate focus areas
🏆 My Recommendation:
Start with STRATEGY 2 (Sustainability Wheel) because:
Solves your immediate problem - No more topic tunneling
Ryan Deiss principle: "You can't optimize what you don't measure" - This ensures comprehensive data
Easier to implement - Clear rules for AI
Better reporting - Balanced scores across all dimensions
User experience - Feels thorough and professional
Then evolve to STRATEGY 3 (Deep Dive) later once you have:
More user data to refine archetypes
Proven the assessment works
Built confidence in the AI's adaptive capabilities
📝 Implementation Plan for Strategy 2:
Would you like me to:
✅ Implement Strategy 2 (recommended - fixes current issue immediately)
⏳ Implement Strategy 1 (good middle ground)
🚀 Implement Strategy 3 (most advanced, takes longer)