# Email & PDF Report Setup Guide

This guide will help you configure SMTP email sending to deliver PDF reports to users.

## Features Implemented

✅ **PDF Report Generation** - Beautiful, professional PDF reports using @react-pdf/renderer
✅ **Email Delivery** - Send reports via email using nodemailer
✅ **HTML Email Templates** - Professionally designed email with branding
✅ **User Interface** - "Email Report" button on the report card
✅ **Status Feedback** - Loading states, success, and error messages

## Quick Setup

### 1. Configure SMTP Settings

Update your `.env` file with your email provider's SMTP settings:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-company-email@company.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Sustainability Assessment
SMTP_FROM_EMAIL=your-company-email@company.com
```

### 2. Popular Email Provider Settings

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Important for Gmail:**
- You MUST use an App Password, not your regular Gmail password
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable 2-Step Verification
- Generate an App Password: Security → 2-Step Verification → App passwords
- Use the 16-character app password in SMTP_PASS

#### Microsoft 365 / Outlook
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

#### Custom SMTP Server
```env
SMTP_HOST=mail.your-company.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

### 3. Test Your Configuration

After configuring, test the email functionality:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Complete the assessment
3. On the report card, click "Email Report"
4. Check your email inbox for the PDF report

## Email Template

The email includes:
- Personalized greeting with user's name
- Overall commitment score and level
- Beautiful HTML design matching the app's branding
- PDF report attachment
- Call-to-action button (optional)

### Customizing the Email Template

Edit [`lib/email-service.ts`](lib/email-service.ts) to customize:

```typescript
export function generateReportEmailHTML(
  userName: string,
  overallScore: number,
  level: string
): string {
  // Customize the HTML here
}
```

## PDF Report

The PDF report includes:
- User name and generation date
- Overall commitment score
- All commitment metrics
- Category breakdown with scores
- Key insights
- Personalized recommendations
- Sustainability profile

### Customizing the PDF

Edit [`lib/pdf-generator.tsx`](lib/pdf-generator.tsx) to customize styles and content:

```typescript
const styles = StyleSheet.create({
  // Customize PDF styles here
})
```

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**
   - Verify SMTP_HOST, SMTP_USER, SMTP_PASS are correct
   - For Gmail, ensure you're using an App Password

2. **Check firewall/network**
   - Ensure port 587 is not blocked
   - Try port 465 (secure) or 25 (alternative)

3. **Check server logs**
   - Look at the browser console and terminal for error messages
   - Common errors:
     - `EAUTH` - Authentication failed (wrong credentials)
     - `ECONNECTION` - Cannot connect to server
     - `ETIMEDOUT` - Connection timeout

### Gmail-Specific Issues

If Gmail blocks the email:
1. Use an App Password (required)
2. Enable "Less secure app access" (not recommended)
3. Check [Google Account Activity](https://myaccount.google.com/notifications)

### PDF Generation Issues

If PDF fails to generate:
- Check browser console for errors
- Ensure all required data is present (report, commitmentScore, userName)
- Verify @react-pdf/renderer is installed

## API Endpoints

### POST `/api/send-report-email`

Sends the report via email with PDF attachment.

**Request Body:**
```json
{
  "report": { /* ReportCard object */ },
  "commitmentScore": { /* CommitmentScore object */ },
  "userEmail": "user@example.com",
  "userName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report sent successfully to your email"
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use App Passwords** - Don't use your main email password
3. **Enable TLS** - SMTP connections should use TLS encryption
4. **Rate Limiting** - Consider implementing rate limiting for email sending
5. **Validation** - Email addresses are validated before sending

## Production Deployment

For production, consider:

1. **Use a dedicated email service**
   - SendGrid, Mailgun, Amazon SES, or Postmark
   - These provide better deliverability and tracking

2. **Set up SPF, DKIM, DMARC records**
   - Improves email deliverability
   - Prevents emails from going to spam

3. **Monitor email sending**
   - Track delivery rates
   - Monitor bounces and complaints

4. **Implement retry logic**
   - Retry failed emails with exponential backoff

5. **Queue system**
   - Use a queue (Redis, Bull) for handling email sending asynchronously

## Files Created/Modified

### New Files
- [`lib/pdf-generator.tsx`](lib/pdf-generator.tsx) - PDF generation utility
- [`lib/email-service.ts`](lib/email-service.ts) - Email sending service
- [`app/api/send-report-email/route.ts`](app/api/send-report-email/route.ts) - Email API endpoint

### Modified Files
- [`.env`](.env) - Added SMTP configuration
- [`.env.example`](.env.example) - Added SMTP template
- [`app/page.tsx`](app/page.tsx) - Store user info in localStorage
- [`components/PremiumReportCard.tsx`](components/PremiumReportCard.tsx) - Added email button and functionality

## Dependencies

```json
{
  "nodemailer": "^7.0.9",
  "@react-pdf/renderer": "^4.3.1",
  "@types/nodemailer": "^7.0.2"
}
```

Already installed! ✓

## User Flow

1. User completes assessment and enters name/email
2. User views report card
3. User clicks "Email Report" button
4. System generates PDF report
5. System sends email with PDF attachment
6. User receives email with report

## Example Email Preview

```
Subject: Your Sustainability Assessment Report

Hello John Doe,

Thank you for completing the Sustainability Assessment!

YOUR COMMITMENT SCORE: 67
LEVEL: Advocate

Your detailed report is attached to this email as a PDF...
```

## Support

If you encounter issues:
1. Check this guide first
2. Review error messages in console/terminal
3. Verify SMTP credentials
4. Test with a simple email client to confirm SMTP works
5. Check email provider's documentation

## Next Steps

- [ ] Configure your SMTP credentials in `.env`
- [ ] Test email sending functionality
- [ ] Customize email template if needed
- [ ] Customize PDF design if needed
- [ ] Set up production email service (SendGrid, etc.)
- [ ] Configure SPF/DKIM records for your domain
