# User Information Collection Implementation

## Overview
This implementation adds a user information collection step at the beginning of the sustainability assessment. Users must provide their name, email, and phone number before starting the interview. This data is saved to Supabase and linked to their assessment session and final report.

## Changes Made

### 1. Database Schema Updates (`supabase-schema.sql`)
- **New Table**: `user_info`
  - `id` (UUID, primary key)
  - `name` (VARCHAR 255, required)
  - `email` (VARCHAR 255, required)
  - `phone` (VARCHAR 50, required)
  - `created_at` (timestamp)

- **Updated Table**: `sessions`
  - Added `user_info_id` foreign key linking to `user_info` table

- **Security**: Added RLS policies for anonymous access to user_info table

### 2. New Components

#### `components/UserInfoForm.tsx`
A beautiful, responsive form component that:
- Collects user's name, email, and phone number
- Validates all inputs with real-time error messages
- Provides visual feedback during submission
- Matches the app's design system with gradient backgrounds and animations
- Includes accessibility features (proper labels, error messages)

**Features**:
- Name validation (minimum 2 characters)
- Email validation (proper email format)
- Phone validation (flexible international format)
- Loading state during submission
- Back button to return to landing page

### 3. API Routes

#### `app/api/save-user-info/route.ts`
- POST endpoint to save user information to Supabase
- Validates required fields
- Returns userInfoId for linking to session
- Error handling with proper status codes

### 4. Updated Files

#### `app/page.tsx`
- Added new `userInfo` stage to the flow
- Added `userInfoId` state management
- Added `handleUserInfoSubmit` function to save user info
- Added `handleUserInfoBack` function for navigation
- Updated `handleInterviewComplete` to pass `userInfoId` to report generation
- Updated render logic to show UserInfoForm component

#### `app/api/generate-report/route.ts`
- Added `userInfoId` parameter handling
- Creates a session in Supabase with `user_info_id` link
- Saves session start and completion timestamps
- Saves the generated report to `report_cards` table
- Links report to session via `session_id`
- Handles both AI-generated and fallback reports

## User Flow

1. **Landing Page** → User clicks "Begin Your Assessment"
2. **User Info Form** → User enters name, email, phone
3. **Save to Database** → User info saved to Supabase, returns `userInfoId`
4. **Interview** → Standard interview process (unchanged)
5. **Generate Report** → Creates session linked to user info, generates report
6. **Save Report** → Saves report to database linked to session
7. **Display Report** → Shows report to user (unchanged)

## Database Relationships

```
user_info (1) ----< (many) sessions
sessions (1) ----< (many) questions
sessions (1) ----< (many) answers
sessions (1) ----< (many) report_cards
```

## To Apply Schema Changes

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create user_info table
CREATE TABLE IF NOT EXISTS user_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_info_id to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS user_info_id UUID REFERENCES user_info(id) ON DELETE SET NULL;

-- Enable RLS on user_info
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

-- Add policies for user_info
CREATE POLICY "Allow anonymous insert on user_info" ON user_info
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on user_info" ON user_info
    FOR SELECT USING (true);
```

## Testing Instructions

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to** `http://localhost:3000`

3. **Test the flow**:
   - Click "Begin Your Assessment"
   - You should see the User Info Form
   - Try submitting without filling fields → should see validation errors
   - Fill in valid information → should proceed to interview
   - Complete the interview → report should be saved with user info

4. **Verify in Supabase**:
   - Check `user_info` table for the new entry
   - Check `sessions` table for entry with `user_info_id`
   - Check `report_cards` table for entry with `session_id`

## Environment Variables Required

Make sure these are set in your `.env` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Benefits

1. **Data Collection**: Captures user contact information for follow-up
2. **Report Tracking**: Each report is linked to a specific user
3. **Analytics**: Can analyze user behavior and patterns over time
4. **Personalization**: Can send personalized recommendations via email
5. **Data Integrity**: Proper relational structure maintains data consistency

## Future Enhancements

Possible improvements:
- Email verification
- SMS verification for phone numbers
- User dashboard to view past reports
- Email notifications with report results
- Marketing automation integration
- GDPR compliance features (data export, deletion)
