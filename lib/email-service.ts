import nodemailer from 'nodemailer'

// Create reusable transporter
export function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // For development - set to true in production
    }
  })
}

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export async function sendEmail(options: EmailOptions) {
  const transporter = createEmailTransporter()

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments || []
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Generate HTML email template - AWAI-style copywriting
export function generateReportEmailHTML(
  userName: string,
  overallScore: number,
  level: string
): string {
  // Get level-specific messaging
  const getLevelHook = (level: string) => {
    switch (level) {
      case 'Visionary':
        return 'You\'re not just making waves—you\'re changing the tide.'
      case 'Catalyst':
        return 'Your actions don\'t just inspire—they ignite movements.'
      case 'Advocate':
        return 'You\'re not just aware—you\'re actively rewriting your impact story.'
      case 'Explorer':
        return 'Every revolution starts with a single curious mind. That\'s you.'
      default:
        return 'Your sustainability journey begins with understanding where you stand.'
    }
  }

  const getLevelInsight = (level: string) => {
    switch (level) {
      case 'Visionary':
        return 'You operate at the intersection of influence, resources, and conviction—the rare combination that transforms entire industries.'
      case 'Catalyst':
        return 'You\'ve moved beyond personal action to systemic influence. Your next move won\'t just change your life—it\'ll ripple through your entire community.'
      case 'Advocate':
        return 'You\'re past the "awareness" stage. You\'ve integrated sustainability into your identity. Now, it\'s time to amplify your impact.'
      case 'Explorer':
        return 'You\'re standing at the threshold of transformation. The choices you make in the next 90 days will define your impact for the next decade.'
      default:
        return 'Understanding your current position is the first step to meaningful change.'
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Impact Profile Revealed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F5F3EF;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px; text-align: center;">
            <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);">

              <!-- Logo Section -->
              <tr>
                <td style="background-color: #FFFFFF; padding: 30px 30px 20px 30px; text-align: center;">
                  <img src="https://beforest.co/wp-content/uploads/2024/10/23-Beforest-Black-with-Tagline.png" alt="Beforest" style="max-width: 200px; height: auto; display: inline-block;" class="logo-dark-mode" />
                  <style>
                    @media (prefers-color-scheme: dark) {
                      .logo-dark-mode {
                        filter: invert(1) brightness(1.2);
                      }
                    }
                  </style>
                </td>
              </tr>

              <!-- Intriguing Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1B5E3F 0%, #0A3622 100%); padding: 50px 30px; text-align: center;">
                  <p style="margin: 0 0 16px 0; color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">
                    YOUR IMPACT PROFILE
                  </p>
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; line-height: 1.3;">
                    ${userName}, here's what your choices<br/>reveal about your future
                  </h1>
                </td>
              </tr>

              <!-- Hook -->
              <tr>
                <td style="padding: 40px 35px 30px 35px;">
                  <p style="margin: 0; font-size: 20px; color: #1B5E3F; line-height: 1.5; font-weight: 600; font-style: italic;">
                    "${getLevelHook(level)}"
                  </p>
                </td>
              </tr>

              <!-- Your Level Reveal -->
              <tr>
                <td style="padding: 0 35px 30px 35px;">
                  <div style="background: linear-gradient(135deg, #F5F3EF 0%, #FAF8F5 100%); border-radius: 16px; padding: 35px; text-align: center; border: 2px solid #1B5E3F;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #8B8680; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                      YOU ARE A
                    </p>
                    <h2 style="margin: 0 0 8px 0; font-size: 48px; color: #1B5E3F; font-weight: 800; letter-spacing: -1px;">
                      ${level}
                    </h2>
                    <p style="margin: 0; font-size: 18px; color: #C67B5C; font-weight: 600;">
                      Commitment Score: ${overallScore}/100
                    </p>
                  </div>
                </td>
              </tr>

              <!-- What This Means -->
              <tr>
                <td style="padding: 0 35px 40px 35px;">
                  <p style="margin: 0 0 24px 0; font-size: 17px; color: #4A4A48; line-height: 1.7;">
                    ${getLevelInsight(level)}
                  </p>
                  <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6;">
                    Your personalized impact profile is attached as a PDF. Inside, you'll discover:
                  </p>
                </td>
              </tr>

              <!-- What's Inside - Icon-based -->
              <tr>
                <td style="padding: 0 35px 40px 35px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <div style="width: 32px; height: 32px; background-color: #1B5E3F; border-radius: 8px; text-align: center; line-height: 32px;">
                                <span style="color: #FFFFFF; font-size: 16px; font-weight: bold;">●</span>
                              </div>
                            </td>
                            <td style="vertical-align: middle; padding-left: 16px;">
                              <p style="margin: 0; font-size: 15px; color: #333333; font-weight: 600;">Your Four-Dimensional Commitment Profile</p>
                              <p style="margin: 4px 0 0 0; font-size: 13px; color: #8B8680;">Action Velocity • Resource Allocation • Influence Radius • Commitment Intensity</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <div style="width: 32px; height: 32px; background-color: #1B5E3F; border-radius: 8px; text-align: center; line-height: 32px;">
                                <span style="color: #FFFFFF; font-size: 16px; font-weight: bold;">◆</span>
                              </div>
                            </td>
                            <td style="vertical-align: middle; padding-left: 16px;">
                              <p style="margin: 0; font-size: 15px; color: #333333; font-weight: 600;">Behavioral Insights That Matter</p>
                              <p style="margin: 4px 0 0 0; font-size: 13px; color: #8B8680;">What your choices reveal about your sustainability mindset</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #F0F0F0;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <div style="width: 32px; height: 32px; background-color: #1B5E3F; border-radius: 8px; text-align: center; line-height: 32px;">
                                <span style="color: #FFFFFF; font-size: 16px; font-weight: bold;">▶</span>
                              </div>
                            </td>
                            <td style="vertical-align: middle; padding-left: 16px;">
                              <p style="margin: 0; font-size: 15px; color: #333333; font-weight: 600;">Your Personalized Action Roadmap</p>
                              <p style="margin: 4px 0 0 0; font-size: 13px; color: #8B8680;">Specific next steps designed for your commitment level</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <div style="width: 32px; height: 32px; background-color: #1B5E3F; border-radius: 8px; text-align: center; line-height: 32px;">
                                <span style="color: #FFFFFF; font-size: 16px; font-weight: bold;">★</span>
                              </div>
                            </td>
                            <td style="vertical-align: middle; padding-left: 16px;">
                              <p style="margin: 0; font-size: 15px; color: #333333; font-weight: 600;">How to Elevate to the Next Level</p>
                              <p style="margin: 4px 0 0 0; font-size: 13px; color: #8B8680;">The exact gaps to close and strengths to leverage</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Section -->
              <tr>
                <td style="padding: 20px 35px 45px 35px; text-align: center; background: linear-gradient(to bottom, #FFFFFF 0%, #F5F3EF 100%);">
                  <p style="margin: 0 0 24px 0; font-size: 18px; color: #4A4A48; font-weight: 600; line-height: 1.5;">
                    Ready to turn insight into impact?
                  </p>
                  <a href="https://www.beforest.co" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1B5E3F 0%, #0A3622 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(27, 94, 63, 0.3); letter-spacing: 0.5px;">
                    Explore Your Next Steps →
                  </a>
                  <p style="margin: 20px 0 0 0; font-size: 13px; color: #8B8680;">
                    Join thousands of impact-driven individuals at Beforest.co
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0A3622; padding: 30px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #8B8680;">
                    © ${new Date().getFullYear()} All rights reserved • <a href="https://www.beforest.co" style="color: #D4AF37; text-decoration: none;">Beforest</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Generate plain text version
export function generateReportEmailText(
  userName: string,
  overallScore: number,
  level: string
): string {
  const getLevelHook = (level: string) => {
    switch (level) {
      case 'Visionary': return "You're not just making waves—you're changing the tide."
      case 'Catalyst': return "Your actions don't just inspire—they ignite movements."
      case 'Advocate': return "You're not just aware—you're actively rewriting your impact story."
      case 'Explorer': return "Every revolution starts with a single curious mind. That's you."
      default: return 'Your sustainability journey begins with understanding where you stand.'
    }
  }

  return `
YOUR IMPACT PROFILE REVEALED

${userName}, here's what your choices reveal about your future

"${getLevelHook(level)}"

═══════════════════════════════════════

YOU ARE A ${level.toUpperCase()}
Commitment Score: ${overallScore}/100

═══════════════════════════════════════

Your personalized impact profile is attached as a PDF.

Inside, you'll discover:

• Your Four-Dimensional Commitment Profile
  Action Velocity • Resource Allocation • Influence Radius • Commitment Intensity

• Behavioral Insights That Matter
  What your choices reveal about your sustainability mindset

• Your Personalized Action Roadmap
  Specific next steps designed for your commitment level

• How to Elevate to the Next Level
  The exact gaps to close and strengths to leverage

═══════════════════════════════════════

Ready to turn insight into impact?

Explore your next steps at: https://www.beforest.co

Join thousands of impact-driven individuals at Beforest.co

═══════════════════════════════════════

© ${new Date().getFullYear()} All rights reserved • Beforest
Visit: https://www.beforest.co
  `.trim()
}
