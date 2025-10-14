import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { ReportCard } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2C5F4D',
    paddingBottom: 20
  },
  title: {
    fontSize: 28,
    color: '#2C5F4D',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold'
  },
  subtitle: {
    fontSize: 14,
    color: '#7A6D5E',
    marginBottom: 4
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    color: '#2C5F4D',
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold'
  },
  scoreContainer: {
    backgroundColor: '#F5F3EF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: '4 solid #2C5F4D'
  },
  scoreText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8
  },
  scoreBig: {
    fontSize: 48,
    color: '#2C5F4D',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8
  },
  levelText: {
    fontSize: 20,
    color: '#7A6D5E',
    fontFamily: 'Helvetica-Bold'
  },
  categoryContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FAFAF8',
    borderRadius: 6
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2C5F4D',
    marginBottom: 6
  },
  categoryScore: {
    fontSize: 16,
    color: '#7A6D5E',
    marginBottom: 6
  },
  categoryDescription: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 1.5
  },
  bulletPoint: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 1.6,
    paddingLeft: 15
  },
  personalityProfile: {
    backgroundColor: '#F5F3EF',
    padding: 15,
    borderRadius: 6,
    fontSize: 12,
    color: '#333333',
    lineHeight: 1.6,
    fontStyle: 'italic'
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #E5E5E5',
    fontSize: 10,
    color: '#999999',
    textAlign: 'center'
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1 solid #E5E5E5'
  },
  metricLabel: {
    fontSize: 11,
    color: '#666666'
  },
  metricValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2C5F4D'
  }
})

interface PDFDocumentProps {
  report: ReportCard
  commitmentScore: CommitmentScore
  userName: string
  generatedDate: string
}

// PDF Document Component
const ReportPDFDocument = ({ report, commitmentScore, userName, generatedDate }: PDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sustainability Assessment Report</Text>
        <Text style={styles.subtitle}>For: {userName}</Text>
        <Text style={styles.subtitle}>Generated: {generatedDate}</Text>
      </View>

      {/* Overall Score */}
      <View style={styles.section}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Your Overall Commitment Score</Text>
          <Text style={styles.scoreBig}>{commitmentScore.finalScore}</Text>
          <Text style={styles.levelText}>{commitmentScore.level}</Text>
        </View>
      </View>

      {/* Commitment Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commitment Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Action Velocity</Text>
          <Text style={styles.metricValue}>{Math.round(commitmentScore.actionVelocity * 100)}%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Resource Allocation</Text>
          <Text style={styles.metricValue}>{Math.round(commitmentScore.resourceAllocation * 100)}%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Influence Radius</Text>
          <Text style={styles.metricValue}>{Math.round(commitmentScore.influenceRadius * 100)}%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Commitment Intensity</Text>
          <Text style={styles.metricValue}>{Math.round(commitmentScore.commitmentIntensity * 100)}%</Text>
        </View>
      </View>

      {/* Categories */}
      {report.categories && report.categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {report.categories.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryScore}>Score: {category.score}/100</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Insights */}
      {report.insights && report.insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {report.insights.map((insight, index) => (
            <Text key={index} style={styles.bulletPoint}>• {insight}</Text>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
          {report.recommendations.map((recommendation, index) => (
            <Text key={index} style={styles.bulletPoint}>• {recommendation}</Text>
          ))}
        </View>
      )}

      {/* Personality Profile */}
      {report.personalityProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Sustainability Profile</Text>
          <Text style={styles.personalityProfile}>{report.personalityProfile}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>This report is generated by the Sustainability Assessment Platform</Text>
        <Text>For questions or support, please contact your administrator</Text>
      </View>
    </Page>
  </Document>
)

// Generate PDF Buffer
export async function generateReportPDF(
  report: ReportCard,
  commitmentScore: CommitmentScore,
  userName: string
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
  />

  const pdfBlob = await pdf(doc).toBlob()
  const arrayBuffer = await pdfBlob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
