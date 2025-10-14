# Troubleshooting Guide

## Common Issues and Solutions

### 1. Dev Server Won't Start (EPERM Error)

**Error:**
```
Error: EPERM: operation not permitted, open '.next\trace'
```

**Solution:**

#### Option A: Clean .next folder (Recommended)
```bash
# Stop any running dev servers (Ctrl+C)
# Then delete .next folder and restart

# On Windows (PowerShell):
Remove-Item -Recurse -Force .next
npm run dev

# On Windows (CMD):
rmdir /s /q .next
npm run dev

# On Mac/Linux:
rm -rf .next
npm run dev
```

#### Option B: Close processes using port 3000
```bash
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

#### Option C: Use different port
Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3002"
  }
}
```

---

### 2. Email Sending Fails

**Error:** "Failed to send email" or "EAUTH" error

**Solutions:**

#### For Gmail Users:
1. **Use App Password (NOT your regular password)**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"
   - Go to "App passwords"
   - Generate password for "Mail"
   - Copy the 16-character password
   - Use it in `.env` as `SMTP_PASS`

2. **Check your `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # Your 16-char app password
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

3. **Common Gmail issues:**
   - Using regular password instead of App Password ❌
   - 2-Step Verification not enabled ❌
   - Wrong SMTP host or port ❌

#### For Other Email Providers:

**Microsoft 365 / Outlook:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
```

**Custom SMTP Server:**
```env
SMTP_HOST=mail.your-company.com
SMTP_PORT=587  # or 465, or 25
SMTP_USER=your-username
SMTP_PASS=your-password
```

**Test your SMTP credentials:**
- Try sending a test email using a mail client (Outlook, Thunderbird)
- If that fails, your credentials are wrong
- Contact your IT department for correct SMTP settings

---

### 3. PDF Generation Fails

**Error:** "Cannot read properties of undefined (reading 'map')"

**Solution:** This is now fixed in the latest code! The PDF generator now handles missing data gracefully.

If you still see this error:
1. Ensure you're using the updated code
2. Restart the dev server
3. Clear browser cache and localStorage:
   ```javascript
   // In browser console:
   localStorage.clear()
   location.reload()
   ```

---

### 4. User Info Not Found

**Error:** "User information not found. Please retake the assessment."

**Solution:**
1. **Don't skip the user info form**
   - Make sure you fill out name, email, phone
   - Don't refresh the page during assessment

2. **Clear localStorage and start over:**
   ```javascript
   // In browser console (F12):
   localStorage.clear()
   location.reload()
   ```

3. **Check if data is saved:**
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('userName'))
   console.log(localStorage.getItem('userEmail'))
   ```

---

### 5. Database Connection Issues

**Error:** Database queries failing or timeout

**Solutions:**

1. **Check Supabase credentials in `.env`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key-here
   ```

2. **Run the SQL setup script:**
   - Open Supabase SQL Editor
   - Run `complete-setup-fixed.sql`
   - Check for success messages

3. **Verify tables exist:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

4. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_info';
   ```

---

### 6. Module Not Found Errors

**Error:** "Cannot find module '@/lib/pdf-generator'"

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### 7. TypeScript Errors

**Error:** Type errors during compilation

**Solution:**
```bash
# Clean TypeScript cache
rm -rf .next tsconfig.tsbuildinfo

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Restart dev server
npm run dev
```

---

### 8. Port Already in Use

**Error:** "Port 3000 is already in use"

**Solutions:**

**Quick fix:** The dev server will automatically use port 3001 if 3000 is taken.

**Permanent fix:**

**Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

---

### 9. Email Arrives in Spam

**Issue:** Email is sent successfully but arrives in spam folder

**Solutions:**

1. **For testing:** Check your spam folder
2. **For production:**
   - Use a dedicated email service (SendGrid, Mailgun, SES)
   - Set up SPF, DKIM, DMARC records for your domain
   - Use a professional email address (not free Gmail)
   - Warm up your email sending domain

---

### 10. Slow Email Sending

**Issue:** Email takes too long to send

**Solutions:**

1. **Network issues:**
   - Check your internet connection
   - Try different SMTP port (587, 465, or 25)

2. **SMTP server issues:**
   - Use a faster email service (SendGrid, Mailgun)
   - Check SMTP server status

3. **PDF generation is slow:**
   - This is normal for first-time generation
   - Subsequent PDFs will be faster

---

## Debug Checklist

When things go wrong, check these in order:

- [ ] Is the dev server running? (`npm run dev`)
- [ ] Are there any error messages in the terminal?
- [ ] Are there any error messages in browser console (F12)?
- [ ] Is `.env` file configured correctly?
- [ ] Did you run the SQL setup in Supabase?
- [ ] Did you restart the server after code changes?
- [ ] Did you clear browser cache/localStorage?
- [ ] Is your internet connection working?
- [ ] Are the required npm packages installed?

---

## Getting Help

1. **Check error messages:** Read the full error in terminal/console
2. **Check browser console:** Open DevTools (F12) → Console tab
3. **Check network tab:** DevTools → Network tab to see API calls
4. **Check Supabase logs:** Supabase Dashboard → Logs
5. **Review documentation:**
   - [QUICK_START.md](QUICK_START.md)
   - [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md)
   - [COMPLETE_IMPLEMENTATION_SUMMARY.md](COMPLETE_IMPLEMENTATION_SUMMARY.md)

---

## Still Having Issues?

### Collect this information:

1. **Error messages** (full text from terminal and console)
2. **Environment:**
   - OS (Windows/Mac/Linux)
   - Node version (`node -v`)
   - npm version (`npm -v`)
3. **What you tried** (steps to reproduce)
4. **Expected vs actual behavior**

### Common "Works on my machine" issues:

- **Line endings:** Windows uses CRLF, Mac/Linux uses LF
- **File paths:** Use forward slashes (/) not backslashes (\)
- **Environment variables:** Make sure .env file is in project root
- **Port conflicts:** Another app might be using the same port

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Server won't start | `rm -rf .next && npm run dev` |
| Email fails | Check SMTP credentials, use App Password for Gmail |
| PDF fails | Already fixed in latest code |
| User info missing | Clear localStorage and retake assessment |
| Database errors | Run `complete-setup-fixed.sql` |
| Module errors | `rm -rf node_modules && npm install` |
| Type errors | Delete .next folder and restart |
| Port in use | Server auto-uses 3001, or kill process on 3000 |

---

## Preventive Tips

✅ **Always restart server after:**
- Changing `.env` file
- Installing new packages
- Major code changes

✅ **Clear cache when:**
- Seeing stale data
- Getting weird errors
- Testing new features

✅ **Use version control:**
- Commit working code
- Create backups
- Test before deploying

✅ **Test incrementally:**
- Test each feature separately
- Don't change multiple things at once
- Verify SMTP before testing full flow

---

That should cover most issues you might encounter! 🚀
