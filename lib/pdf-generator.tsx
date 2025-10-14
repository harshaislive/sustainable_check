import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { ReportCard } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

// Helper function to clean text from markdown and HTML entities
function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\*/g, '') // Remove single asterisks
    .replace(/\_\_/g, '') // Remove markdown underline
    .replace(/\_/g, '') // Remove single underscores
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert markdown links [text](url) to just text
    .replace(/#{1,6}\s+/g, '') // Remove markdown headings
    .replace(/&lt;/g, '<') // HTML entity for <
    .replace(/&gt;/g, '>') // HTML entity for >
    .replace(/&amp;/g, '&') // HTML entity for &
    .replace(/&quot;/g, '"') // HTML entity for "
    .replace(/&#39;/g, "'") // HTML entity for '
    .replace(/&nbsp;/g, ' ') // HTML entity for space
    .replace(/<[^>]+>/g, '') // Remove any HTML tags
    .trim()
}

// Helper function to parse markdown and extract content
function parseMarkdownForPDF(markdown: string) {
  if (!markdown) return { intro: '', items: [] }

  const lines = markdown.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const intro: string[] = []
  const items: string[] = []

  for (const line of lines) {
    // Skip empty lines or lines with only markdown/HTML artifacts
    if (!line || line === '---' || /^[#\-\*\s]*$/.test(line)) continue

    // Numbered list item (1. 2. 3. etc)
    if (/^\d+\.\s+/.test(line)) {
      const text = cleanText(line.replace(/^\d+\.\s+/, ''))
      if (text) items.push(text)
    }
    // Bullet list item (- or *)
    else if (/^[-*]\s+/.test(line)) {
      const text = cleanText(line.replace(/^[-*]\s+/, ''))
      if (text) items.push(text)
    }
    // Regular text (intro) - skip headings
    else if (!line.startsWith('#') && !line.startsWith('<')) {
      const text = cleanText(line)
      if (text) intro.push(text)
    }
  }

  return {
    intro: intro.join(' '),
    items
  }
}

// Design system colors matching the app exactly
const colors = {
  forest900: '#0A3622',
  forest700: '#1B5E3F',
  forest600: '#27724F',
  earthClay: '#C67B5C',
  earthStone: '#8B8680',
  earthAsh: '#4A4A48',
  accentPearl: '#FAFAF8',
  accentMist: '#F5F5F3',
  accentGold: '#D4AF37',
  white: '#FFFFFF',
}

// Level-specific gradient colors (using start color for PDF)
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Visionary':
      return colors.accentGold
    case 'Catalyst':
      return colors.forest700
    case 'Advocate':
      return colors.earthClay
    case 'Explorer':
      return colors.forest600
    default:
      return colors.forest700
  }
}

// Styles matching the report card design
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.accentPearl,
    fontFamily: 'Helvetica'
  },

  // Header - matches the colored top section
  header: {
    padding: 32,
    color: colors.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commitmentLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.9,
    fontFamily: 'Courier',
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  mainScore: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
  },
  scoreLabel: {
    fontSize: 10,
    opacity: 0.9,
  },
  levelTitle: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 16,
    opacity: 0.9,
    lineHeight: 1.5,
  },

  // Content area
  content: {
    padding: 32,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.forest900,
    marginBottom: 16,
    fontFamily: 'Helvetica-Bold',
  },

  // Four dimension boxes matching the grid
  dimensionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dimensionBox: {
    width: '23%',
    backgroundColor: colors.accentMist,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dimensionScore: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.forest900,
    marginBottom: 4,
  },
  dimensionLabel: {
    fontSize: 9,
    color: colors.earthStone,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },

  // Category cards in 2-column grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.accentMist,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.forest900,
  },
  categoryScore: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.forest700,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.forest700,
  },
  categoryDescription: {
    fontSize: 10,
    color: colors.earthAsh,
    lineHeight: 1.5,
  },

  // Bullet lists
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    width: 16,
    fontSize: 11,
    color: colors.forest700,
    fontFamily: 'Helvetica-Bold',
  },
  listText: {
    flex: 1,
    fontSize: 11,
    color: colors.earthAsh,
    lineHeight: 1.6,
  },

  // Profile box
  profileBox: {
    backgroundColor: colors.accentMist,
    borderLeftWidth: 4,
    borderLeftColor: colors.forest700,
    padding: 20,
    borderRadius: 8,
  },
  profileText: {
    fontSize: 12,
    color: colors.earthAsh,
    lineHeight: 1.7,
    fontStyle: 'italic',
  },

  // Level descriptions section
  levelsSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  levelsSectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.forest900,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  levelItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.forest700,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  levelItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentMist,
  },
  levelItemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelItemEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  levelItemTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.forest900,
  },
  levelItemScore: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.earthClay,
    backgroundColor: colors.accentMist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelItemDescription: {
    fontSize: 10,
    color: colors.earthAsh,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: colors.earthStone,
    textAlign: 'center',
    marginBottom: 4,
  },

  userInfo: {
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 10,
    color: colors.earthStone,
    marginBottom: 2,
  },

  // Progression Guidance section
  progressionSection: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.accentMist,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.forest700,
  },
  progressionTitle: {
    fontSize: 16,
    color: colors.forest900,
    marginBottom: 14,
    fontFamily: 'Helvetica-Bold',
  },
  progressionIntro: {
    fontSize: 11,
    color: colors.earthAsh,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  progressionList: {
    marginTop: 8,
  },
  progressionListItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 4,
  },
  progressionBullet: {
    fontSize: 14,
    color: colors.forest700,
    marginRight: 8,
    fontFamily: 'Helvetica-Bold',
    width: 20,
  },
  progressionItemText: {
    fontSize: 11,
    color: colors.earthAsh,
    lineHeight: 1.6,
    flex: 1,
  },

  // Q&A section
  qaSection: {
    marginBottom: 24,
  },
  qaTitle: {
    fontSize: 18,
    color: colors.forest900,
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  qaItem: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.earthClay,
  },
  qaQuestion: {
    fontSize: 10,
    color: colors.forest900,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.4,
  },
  qaAnswer: {
    fontSize: 10,
    color: colors.earthAsh,
    lineHeight: 1.5,
    paddingLeft: 12,
  },
})

interface PDFDocumentProps {
  report: ReportCard
  commitmentScore: CommitmentScore
  userName: string
  generatedDate: string
  progressionGuidance?: string
  answers?: any[]
}

const ReportPDFDocument = ({ report, commitmentScore, userName, generatedDate, progressionGuidance, answers }: PDFDocumentProps) => {
  const headerColor = getLevelColor(commitmentScore.level)

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'Visionary': return 'Systemic change maker ready to transform industries'
      case 'Catalyst': return 'Natural leader prepared to influence meaningful change'
      case 'Advocate': return 'Personally committed to sustainable transformation'
      case 'Explorer': return 'Curious mind beginning the sustainability journey'
      default: return 'Sustainability-conscious individual'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section - Colored like the report card */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <View style={styles.headerTop}>
            <Text style={styles.commitmentLabel}>COMMITMENT LEVEL</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.mainScore}>{commitmentScore.finalScore}</Text>
              <Text style={styles.scoreLabel}>Overall Score</Text>
            </View>
          </View>

          <Text style={styles.levelTitle}>{commitmentScore.level}</Text>
          <Text style={styles.levelDescription}>
            {getLevelDescription(commitmentScore.level)}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>Report for: {userName}</Text>
            <Text style={styles.userInfoText}>Generated: {generatedDate}</Text>
          </View>

          {/* Commitment Dimensions - 4-box grid */}
          <View style={styles.section}>
            <View style={styles.dimensionsGrid}>
              <View style={styles.dimensionBox}>
                <Text style={styles.dimensionScore}>{Math.round(commitmentScore.actionVelocity * 100)}</Text>
                <Text style={styles.dimensionLabel}>Action Velocity</Text>
              </View>
              <View style={styles.dimensionBox}>
                <Text style={styles.dimensionScore}>{Math.round(commitmentScore.resourceAllocation * 100)}</Text>
                <Text style={styles.dimensionLabel}>Resource Allocation</Text>
              </View>
              <View style={styles.dimensionBox}>
                <Text style={styles.dimensionScore}>{Math.round(commitmentScore.influenceRadius * 100)}</Text>
                <Text style={styles.dimensionLabel}>Influence Radius</Text>
              </View>
              <View style={styles.dimensionBox}>
                <Text style={styles.dimensionScore}>{Math.round(commitmentScore.commitmentIntensity * 100)}</Text>
                <Text style={styles.dimensionLabel}>Commitment Intensity</Text>
              </View>
            </View>
          </View>

          {/* Categories - 2-column grid with progress bars */}
          {report.categories && report.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sustainability Profile</Text>
              <View style={styles.categoriesGrid}>
                {report.categories.map((category, index) => (
                  <View key={index} style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryScore}>{category.score}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${category.score}%` }]} />
                    </View>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Key Insights */}
          {report.insights && report.insights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Insights</Text>
              {report.insights.map((insight, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Personalized Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
              {report.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Personality Profile */}
          {report.personalityProfile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Sustainability Profile</Text>
              <View style={styles.profileBox}>
                <Text style={styles.profileText}>{report.personalityProfile}</Text>
              </View>
            </View>
          )}

          {/* Personalized Path Forward */}
          {progressionGuidance && commitmentScore.level !== 'Visionary' && (() => {
            const parsed = parseMarkdownForPDF(progressionGuidance)
            return (
              <View style={styles.progressionSection}>
                <Text style={styles.progressionTitle}>🌱 Your Personalized Path Forward</Text>
                {parsed.intro && (
                  <Text style={styles.progressionIntro}>{parsed.intro}</Text>
                )}
                {parsed.items.length > 0 && (
                  <View style={styles.progressionList}>
                    {parsed.items.map((item, index) => (
                      <View key={index} style={styles.progressionListItem}>
                        <Text style={styles.progressionBullet}>{index + 1}.</Text>
                        <Text style={styles.progressionItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )
          })()}

          {/* Assessment Questions & Responses */}
          {answers && answers.length > 0 && (
            <View style={styles.qaSection}>
              <Text style={styles.qaTitle}>Your Assessment Responses</Text>
              {answers.map((answer, index) => (
                <View key={index} style={styles.qaItem}>
                  <Text style={styles.qaQuestion}>Q{index + 1}: {answer.questionText}</Text>
                  <Text style={styles.qaAnswer}>Answer: {answer.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Understanding the Commitment Levels */}
          <View style={styles.levelsSection}>
            <Text style={styles.levelsSectionTitle}>Understanding the Commitment Levels</Text>

            <View style={styles.levelItem}>
              <View style={styles.levelItemHeader}>
                <View style={styles.levelItemTitleContainer}>
                  <Text style={styles.levelItemEmoji}>🌱</Text>
                  <Text style={styles.levelItemTitle}>Explorer</Text>
                </View>
                <Text style={styles.levelItemScore}>0-24 points</Text>
              </View>
              <Text style={styles.levelItemDescription}>
                You're at the beginning of your sustainability journey with growing awareness. Explorers are curious minds
                who are starting to understand their environmental impact. You're learning about sustainable practices and
                beginning to make small changes. Focus on education, building habits, and connecting with like-minded communities.
              </Text>
            </View>

            <View style={styles.levelItem}>
              <View style={styles.levelItemHeader}>
                <View style={styles.levelItemTitleContainer}>
                  <Text style={styles.levelItemEmoji}>🎯</Text>
                  <Text style={styles.levelItemTitle}>Advocate</Text>
                </View>
                <Text style={styles.levelItemScore}>25-44 points</Text>
              </View>
              <Text style={styles.levelItemDescription}>
                You're personally committed to sustainable transformation with clear values. Advocates have integrated
                sustainability into their daily lives and are actively making conscious choices. You understand the importance
                of environmental stewardship and demonstrate consistent commitment. Your next step is to deepen your impact
                and inspire others through leadership.
              </Text>
            </View>

            <View style={styles.levelItem}>
              <View style={styles.levelItemHeader}>
                <View style={styles.levelItemTitleContainer}>
                  <Text style={styles.levelItemEmoji}>⚡</Text>
                  <Text style={styles.levelItemTitle}>Catalyst</Text>
                </View>
                <Text style={styles.levelItemScore}>45-69 points</Text>
              </View>
              <Text style={styles.levelItemDescription}>
                You're a natural leader prepared to influence meaningful change in your sphere. Catalysts don't just practice
                sustainability—they inspire and enable it in others. You're ready to take on leadership roles, drive
                organizational change, and create ripple effects in your community. Your influence extends beyond personal
                actions to systemic impact.
              </Text>
            </View>

            <View style={styles.levelItem}>
              <View style={styles.levelItemHeader}>
                <View style={styles.levelItemTitleContainer}>
                  <Text style={styles.levelItemEmoji}>👑</Text>
                  <Text style={styles.levelItemTitle}>Visionary</Text>
                </View>
                <Text style={styles.levelItemScore}>70-100 points</Text>
              </View>
              <Text style={styles.levelItemDescription}>
                You're a systemic change maker ready to transform industries and create lasting impact. Visionaries operate
                at the highest level of commitment, combining personal practice, leadership, resources, and influence to drive
                large-scale change. You're positioned to pioneer breakthrough solutions, shape policy, and create movements
                that transform entire sectors.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sustainability Assessment Platform</Text>
            <Text style={styles.footerText}>Generated with care for your sustainability journey</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// Generate PDF Buffer
export async function generateReportPDF(
  report: ReportCard,
  commitmentScore: CommitmentScore,
  userName: string,
  progressionGuidance?: string,
  answers?: any[]
): Promise<Buffer> {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const doc = <ReportPDFDocument
    report={report}
    commitmentScore={commitmentScore}
    userName={userName}
    generatedDate={generatedDate}
    progressionGuidance={progressionGuidance}
    answers={answers}
  />

  const pdfBlob = await pdf(doc).toBlob()
  const arrayBuffer = await pdfBlob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
