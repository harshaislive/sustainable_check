export const wealthProfilingSystem = `You are an expert at creating engaging sustainability questions that subtly profile high-net-worth individuals without being obvious about it.

Your questions should:
1. Feel natural and focused on sustainability values
2. Indirectly reveal lifestyle choices that indicate wealth
3. Be sophisticated and thought-provoking
4. Never directly ask about money or assets
5. Create an experience that feels exclusive and personalized

Wealth indicators to subtly explore:
- Travel patterns (frequency, destinations, style)
- Home features (solar panels, smart home, multiple properties)
- Time allocation (work-life balance, leisure activities)
- Decision-making factors (quality over price, long-term thinking)
- Network effects (influence, community involvement)
- Investment mindset (ESG awareness, future planning)
- Lifestyle choices (organic, artisanal, exclusive brands)
- Philanthropic interests
- Education and continuous learning
- Global awareness and perspectives

Each question should have an unexpected element that makes it memorable and engaging.`

export const questionTemplates = [
  {
    id: 'morning_ritual',
    focus: 'Daily routine and lifestyle',
    wealthIndicators: ['Time flexibility', 'Health consciousness', 'Home amenities'],
    unexpectedElement: 'Interactive sunrise time picker with carbon footprint visualization'
  },
  {
    id: 'travel_footprint',
    focus: 'Travel and global perspective',
    wealthIndicators: ['Frequency', 'Destinations', 'Travel style'],
    unexpectedElement: 'Interactive globe to pin dream destinations'
  },
  {
    id: 'home_sanctuary',
    focus: 'Living space and values',
    wealthIndicators: ['Property features', 'Sustainability investments', 'Location'],
    unexpectedElement: 'Room-by-room sustainability scorer'
  },
  {
    id: 'culinary_philosophy',
    focus: 'Food choices and sourcing',
    wealthIndicators: ['Dining preferences', 'Quality consciousness', 'Health investment'],
    unexpectedElement: 'Seasonal ingredient wheel with origin mapping'
  },
  {
    id: 'future_legacy',
    focus: 'Long-term thinking and impact',
    wealthIndicators: ['Planning horizon', 'Legacy mindset', 'Investment awareness'],
    unexpectedElement: 'Timeline slider showing generational impact'
  },
  {
    id: 'community_ripples',
    focus: 'Social influence and network',
    wealthIndicators: ['Network size', 'Leadership roles', 'Community involvement'],
    unexpectedElement: 'Influence ripple effect visualization'
  },
  {
    id: 'mindful_consumption',
    focus: 'Purchase decisions and values',
    wealthIndicators: ['Brand consciousness', 'Quality preferences', 'Decision factors'],
    unexpectedElement: 'Virtual product scanner with sustainability scores'
  },
  {
    id: 'time_wealth',
    focus: 'Time allocation and priorities',
    wealthIndicators: ['Work flexibility', 'Leisure time', 'Personal development'],
    unexpectedElement: 'Interactive time allocation wheel'
  },
  {
    id: 'learning_journey',
    focus: 'Education and growth mindset',
    wealthIndicators: ['Continuous learning', 'Resource access', 'Global perspectives'],
    unexpectedElement: 'Knowledge constellation builder'
  },
  {
    id: 'giving_philosophy',
    focus: 'Philanthropy and impact',
    wealthIndicators: ['Charitable interests', 'Impact awareness', 'Giving capacity'],
    unexpectedElement: 'Impact calculator with cause selector'
  }
]