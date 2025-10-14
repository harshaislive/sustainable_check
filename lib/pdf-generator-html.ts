import puppeteer from 'puppeteer'
import { marked } from 'marked'
import { ReportCard } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

// SVG Icons
const icons = {
  explorer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a10 10 0 0 1 7.07 17.07M12 2a10 10 0 0 0-7.07 17.07M12 2v20"/>
    <path d="M12 12l-6 6m12-6l-6 6"/>
  </svg>`,
  advocate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>`,
  catalyst: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>`,
  visionary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>`,
  seedling: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22v-8M12 14c-3.5 0-6-2.5-6-6 0 0 1.5 1 4 1 1.5 0 3-.5 4-1.5"/>
    <path d="M12 14c3.5 0 6-2.5 6-6 0 0-1.5 1-4 1-1.5 0-3-.5-4-1.5"/>
  </svg>`
}

// Generate HTML for the PDF report
function generateReportHTML(
  report: ReportCard,
  commitmentScore: CommitmentScore,
  userName: string,
  progressionGuidance?: string,
  answers?: any[]
): string {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Visionary': return '#D4AF37'
      case 'Catalyst': return '#1B5E3F'
      case 'Advocate': return '#C67B5C'
      case 'Explorer': return '#27724F'
      default: return '#1B5E3F'
    }
  }

  const levelColor = getLevelColor(commitmentScore.level)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #FAFAF8;
      color: #4A4A48;
      line-height: 1.6;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    .header {
      background: ${levelColor};
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .header-level {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.9;
    }

    .header-score-box {
      text-align: right;
    }

    .header-score {
      font-size: 48px;
      font-weight: bold;
      line-height: 1;
    }

    .header-score-label {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 5px;
    }

    .header-title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .header-subtitle {
      font-size: 16px;
      opacity: 0.9;
    }

    .user-info {
      font-size: 12px;
      color: #8B8680;
      margin-bottom: 30px;
    }

    .dimensions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .dimension-box {
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      border: 1px solid #F5F5F3;
    }

    .dimension-score {
      font-size: 36px;
      font-weight: bold;
      color: #1B5E3F;
      margin-bottom: 8px;
    }

    .dimension-label {
      font-size: 12px;
      color: #8B8680;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #0A3622;
      margin-bottom: 16px;
      text-align: center;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }

    .category-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #1B5E3F;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .category-name {
      font-weight: bold;
      color: #0A3622;
      font-size: 14px;
    }

    .category-score {
      font-weight: bold;
      color: #C67B5C;
      font-size: 16px;
    }

    .progress-bar {
      height: 6px;
      background: #F5F5F3;
      border-radius: 3px;
      margin-bottom: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1B5E3F 0%, #27724F 100%);
      border-radius: 3px;
    }

    .category-description {
      font-size: 12px;
      color: #8B8680;
      line-height: 1.5;
    }

    .list-item {
      display: flex;
      margin-bottom: 12px;
      padding-left: 8px;
    }

    .bullet {
      color: #1B5E3F;
      margin-right: 12px;
      font-weight: bold;
    }

    .list-text {
      flex: 1;
      font-size: 13px;
      line-height: 1.6;
    }

    .profile-box {
      background: #F5F5F3;
      padding: 20px;
      border-radius: 10px;
      font-style: italic;
      font-size: 13px;
      line-height: 1.7;
    }

    .progression-section {
      background: #F5F5F3;
      padding: 24px;
      border-radius: 10px;
      border-left: 4px solid #1B5E3F;
      margin-bottom: 30px;
    }

    .progression-title {
      font-size: 18px;
      font-weight: bold;
      color: #0A3622;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }

    .progression-title-icon {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      color: #27724F;
    }

    .progression-intro {
      font-size: 13px;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .progression-intro p {
      margin-bottom: 12px;
    }

    .progression-intro ol,
    .progression-intro ul {
      margin: 12px 0;
      padding-left: 24px;
    }

    .progression-intro li {
      margin-bottom: 10px;
      line-height: 1.6;
    }

    .progression-intro strong {
      color: #0A3622;
      font-weight: bold;
    }

    .progression-intro em {
      font-style: italic;
    }

    .progression-list {
      margin-top: 12px;
    }

    .progression-item {
      display: flex;
      margin-bottom: 14px;
    }

    .progression-number {
      font-weight: bold;
      color: #1B5E3F;
      margin-right: 12px;
      min-width: 24px;
      font-size: 14px;
    }

    .progression-text {
      flex: 1;
      font-size: 13px;
      line-height: 1.6;
    }

    .progression-text strong {
      color: #0A3622;
      font-weight: bold;
    }

    .qa-section {
      margin-bottom: 30px;
    }

    .qa-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border-left: 3px solid #C67B5C;
      margin-bottom: 16px;
    }

    .qa-question {
      font-weight: bold;
      color: #0A3622;
      font-size: 12px;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .qa-answer {
      font-size: 12px;
      color: #8B8680;
      padding-left: 12px;
      line-height: 1.5;
    }

    .levels-section {
      margin-top: 40px;
      margin-bottom: 30px;
    }

    .level-item {
      background: white;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #1B5E3F;
      margin-bottom: 16px;
    }

    .level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #F5F5F3;
    }

    .level-title-container {
      display: flex;
      align-items: center;
    }

    .level-icon {
      width: 24px;
      height: 24px;
      margin-right: 12px;
      color: #1B5E3F;
      flex-shrink: 0;
    }

    .level-title {
      font-size: 16px;
      font-weight: bold;
      color: #0A3622;
    }

    .level-score {
      font-size: 11px;
      font-weight: bold;
      color: #C67B5C;
      background: #F5F5F3;
      padding: 4px 10px;
      border-radius: 4px;
    }

    .level-description {
      font-size: 12px;
      color: #8B8680;
      line-height: 1.6;
    }

    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E5E5;
      text-align: center;
      font-size: 11px;
      color: #8B8680;
    }

    @media print {
      body {
        background: white;
      }

      .page-break {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div>
          <div class="header-level">${commitmentScore.level}</div>
        </div>
        <div class="header-score-box">
          <div class="header-score">${commitmentScore.finalScore}</div>
          <div class="header-score-label">Overall Score</div>
        </div>
      </div>
      <div class="header-title">Sustainability Commitment Report</div>
      <div class="header-subtitle">Your personalized impact assessment</div>
    </div>

    <!-- User Info -->
    <div class="user-info">
      <div>Report for: ${userName}</div>
      <div>Generated: ${generatedDate}</div>
    </div>

    <!-- Commitment Dimensions -->
    <div class="dimensions-grid">
      <div class="dimension-box">
        <div class="dimension-score">${Math.round(commitmentScore.actionVelocity * 100)}</div>
        <div class="dimension-label">Action Velocity</div>
      </div>
      <div class="dimension-box">
        <div class="dimension-score">${Math.round(commitmentScore.resourceAllocation * 100)}</div>
        <div class="dimension-label">Resource Allocation</div>
      </div>
      <div class="dimension-box">
        <div class="dimension-score">${Math.round(commitmentScore.influenceRadius * 100)}</div>
        <div class="dimension-label">Influence Radius</div>
      </div>
      <div class="dimension-box">
        <div class="dimension-score">${Math.round(commitmentScore.commitmentIntensity * 100)}</div>
        <div class="dimension-label">Commitment Intensity</div>
      </div>
    </div>

    <!-- Categories -->
    ${report.categories && report.categories.length > 0 ? `
    <div class="section">
      <div class="section-title">Sustainability Profile</div>
      <div class="categories-grid">
        ${report.categories.map(category => `
          <div class="category-card">
            <div class="category-header">
              <div class="category-name">${category.name}</div>
              <div class="category-score">${category.score}%</div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${category.score}%"></div>
            </div>
            <div class="category-description">${category.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Key Insights -->
    ${report.insights && report.insights.length > 0 ? `
    <div class="section">
      <div class="section-title">Key Insights</div>
      ${report.insights.map(insight => `
        <div class="list-item">
          <div class="bullet">•</div>
          <div class="list-text">${insight}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Personalized Recommendations -->
    ${report.recommendations && report.recommendations.length > 0 ? `
    <div class="section">
      <div class="section-title">Personalized Recommendations</div>
      ${report.recommendations.map(recommendation => `
        <div class="list-item">
          <div class="bullet">•</div>
          <div class="list-text">${recommendation}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Personality Profile -->
    ${report.personalityProfile ? `
    <div class="section">
      <div class="section-title">Your Sustainability Profile</div>
      <div class="profile-box">${report.personalityProfile}</div>
    </div>
    ` : ''}

    <!-- Personalized Path Forward -->
    ${progressionGuidance && commitmentScore.level !== 'Visionary' ? `
    <div class="progression-section">
      <div class="progression-title">
        <div class="progression-title-icon">${icons.seedling}</div>
        <span>Your Personalized Path Forward</span>
      </div>
      <div class="progression-intro">${marked.parse(progressionGuidance)}</div>
    </div>
    ` : ''}

    <!-- Assessment Questions & Responses -->
    ${answers && answers.length > 0 ? `
    <div class="qa-section">
      <div class="section-title">Your Assessment Responses</div>
      ${answers.map((answer, index) => `
        <div class="qa-item">
          <div class="qa-question">Q${index + 1}: ${answer.questionText}</div>
          <div class="qa-answer">Answer: ${answer.value}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Understanding the Commitment Levels -->
    <div class="levels-section">
      <div class="section-title">Understanding the Commitment Levels</div>

      <div class="level-item">
        <div class="level-header">
          <div class="level-title-container">
            <div class="level-icon">${icons.explorer}</div>
            <div class="level-title">Explorer</div>
          </div>
          <div class="level-score">0-24 points</div>
        </div>
        <div class="level-description">
          You're at the beginning of your sustainability journey with growing awareness. Explorers are curious minds
          who are starting to understand their environmental impact. You're learning about sustainable practices and
          beginning to make small changes. Focus on education, building habits, and connecting with like-minded communities.
        </div>
      </div>

      <div class="level-item">
        <div class="level-header">
          <div class="level-title-container">
            <div class="level-icon">${icons.advocate}</div>
            <div class="level-title">Advocate</div>
          </div>
          <div class="level-score">25-44 points</div>
        </div>
        <div class="level-description">
          You're personally committed to sustainable transformation with clear values. Advocates have integrated
          sustainability into their daily lives and are actively making conscious choices. You understand the importance
          of environmental stewardship and demonstrate consistent commitment. Your next step is to deepen your impact
          and inspire others through leadership.
        </div>
      </div>

      <div class="level-item">
        <div class="level-header">
          <div class="level-title-container">
            <div class="level-icon">${icons.catalyst}</div>
            <div class="level-title">Catalyst</div>
          </div>
          <div class="level-score">45-69 points</div>
        </div>
        <div class="level-description">
          You're a natural leader prepared to influence meaningful change in your sphere. Catalysts don't just practice
          sustainability—they inspire and enable it in others. You're ready to take on leadership roles, drive
          organizational change, and create ripple effects in your community. Your influence extends beyond personal
          actions to systemic impact.
        </div>
      </div>

      <div class="level-item">
        <div class="level-header">
          <div class="level-title-container">
            <div class="level-icon">${icons.visionary}</div>
            <div class="level-title">Visionary</div>
          </div>
          <div class="level-score">70-100 points</div>
        </div>
        <div class="level-description">
          You're a systemic change maker ready to transform industries and create lasting impact. Visionaries operate
          at the highest level of commitment, combining personal practice, leadership, resources, and influence to drive
          large-scale change. You're positioned to pioneer breakthrough solutions, shape policy, and create movements
          that transform entire sectors.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>Sustainability Assessment Platform</div>
      <div>Generated with care for your sustainability journey</div>
    </div>
  </div>
</body>
</html>
  `
}

// Generate PDF using Puppeteer
export async function generateReportPDFFromHTML(
  report: ReportCard,
  commitmentScore: CommitmentScore,
  userName: string,
  progressionGuidance?: string,
  answers?: any[]
): Promise<Buffer> {
  const html = generateReportHTML(report, commitmentScore, userName, progressionGuidance, answers)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
