# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Configure Email (2 minutes)

Edit `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-company-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Sustainability Assessment
SMTP_FROM_EMAIL=your-company-email@gmail.com
```

**For Gmail users:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to 2-Step Verification → App passwords
4. Generate password for "Mail"
5. Copy 16-character password to `SMTP_PASS`

### Step 2: Setup Database (1 minute)

Open Supabase SQL Editor and run:

```sql
-- Create user_info table
CREATE TABLE IF NOT EXISTS user_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS
  user_info_id UUID REFERENCES user_info(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow anonymous insert on user_info" ON user_info
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select on user_info" ON user_info
    FOR SELECT USING (true);
```

### Step 3: Test! (1 minute)

```bash
npm run dev
```

Visit http://localhost:3000 and:
1. Click "Begin Assessment"
2. Fill in your name, email, phone
3. Complete the assessment
4. Click "Email Report" button
5. Check your email!

## 🎉 Done!

## 📚 Need More Help?

- Email setup issues? See [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md)
- Database questions? See [SQL_COMMANDS.md](SQL_COMMANDS.md)
- Full details? See [COMPLETE_IMPLEMENTATION_SUMMARY.md](COMPLETE_IMPLEMENTATION_SUMMARY.md)

## ⚡ Common Issues

### "Failed to send email"
- Check SMTP credentials in `.env`
- For Gmail, use App Password not regular password
- Verify port 587 is not blocked

### "User information not found"
- Complete the user info form before assessment
- Don't skip the name/email/phone step

### Dev server won't start
```bash
rm -rf .next
npm run dev
```

## 📧 Other Email Providers

### Microsoft 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Custom
```env
SMTP_HOST=mail.your-company.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

That's it! You're ready to go! 🚀
