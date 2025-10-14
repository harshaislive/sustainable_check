import { NextResponse } from 'next/server'
import { generateReportPDFFromHTML } from '@/lib/pdf-generator-html'
import { sendEmail, generateReportEmailHTML, generateReportEmailText } from '@/lib/email-service'
import { ReportCard } from '@/types'
import { CommitmentScore } from '@/lib/commitment/scoring-engine'

export async function POST(request: Request) {
  try {
    const { report, commitmentScore, userEmail, userName, progressionGuidance, answers } = await request.json()

    // Validate input
    if (!report || !commitmentScore || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP configuration is missing')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact administrator.' },
        { status: 500 }
      )
    }

    try {
      // Validate report data structure
      console.log('Validating report data...')
      if (!report.categories) {
        console.log('Warning: report.categories is undefined, setting to empty array')
        report.categories = []
      }
      if (!report.insights) {
        console.log('Warning: report.insights is undefined, setting to empty array')
        report.insights = []
      }
      if (!report.recommendations) {
        console.log('Warning: report.recommendations is undefined, setting to empty array')
        report.recommendations = []
      }
      if (!report.personalityProfile) {
        console.log('Warning: report.personalityProfile is undefined, setting default')
        report.personalityProfile = `You are a ${commitmentScore.level} with a commitment score of ${commitmentScore.finalScore}.`
      }

      // Generate PDF
      console.log('Generating PDF report from HTML...')
      const pdfBuffer = await generateReportPDFFromHTML(
        report as ReportCard,
        commitmentScore as CommitmentScore,
        userName,
        progressionGuidance,
        answers
      )

      // Generate email content
      const emailHTML = generateReportEmailHTML(
        userName,
        commitmentScore.finalScore,
        commitmentScore.level
      )

      const emailText = generateReportEmailText(
        userName,
        commitmentScore.finalScore,
        commitmentScore.level
      )

      // Send email with PDF attachment
      console.log('Sending email to:', userEmail)
      await sendEmail({
        to: userEmail,
        subject: 'Your Sustainability Assessment Report',
        text: emailText,
        html: emailHTML,
        attachments: [
          {
            filename: `sustainability-report-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      })

      console.log('Email sent successfully to:', userEmail)

      return NextResponse.json({
        success: true,
        message: 'Report sent successfully to your email'
      })
    } catch (emailError: any) {
      console.error('Error sending email:', emailError)

      // Provide more specific error messages
      let errorMessage = 'Failed to send email'

      if (emailError.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please check SMTP credentials.'
      } else if (emailError.code === 'ECONNECTION' || emailError.code === 'ETIMEDOUT') {
        errorMessage = 'Could not connect to email server. Please try again later.'
      } else if (emailError.message) {
        errorMessage = `Email error: ${emailError.message}`
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in send-report-email API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
