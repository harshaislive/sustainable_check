-- Complete Supabase Setup Script
-- Run this entire file in your Supabase SQL Editor to set up all tables and policies

-- =============================================================================
-- 1. CREATE USER INFO TABLE
-- =============================================================================
-- This table stores user contact information collected before the assessment
CREATE TABLE IF NOT EXISTS user_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE SESSIONS TABLE
-- =============================================================================
-- This table tracks assessment sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_info_id UUID REFERENCES user_info(id) ON DELETE SET NULL,
    user_id UUID,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. CREATE QUESTIONS TABLE
-- =============================================================================
-- This table stores the questions asked during the assessment
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(10) CHECK (question_type IN ('mcq', 'text')),
    options JSONB,
    context TEXT,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. CREATE ANSWERS TABLE
-- =============================================================================
-- This table stores user answers to the assessment questions
CREATE TABLE IF NOT EXISTS answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. CREATE REPORT CARDS TABLE
-- =============================================================================
-- This table stores the generated assessment reports
CREATE TABLE IF NOT EXISTS report_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    categories JSONB NOT NULL,
    insights JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    personality_profile TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_info_id ON sessions(user_info_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_session_id ON report_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_user_info_email ON user_info(email);

-- =============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 8. CREATE RLS POLICIES (Anonymous Access)
-- =============================================================================
-- These policies allow anonymous access for the assessment application
-- Adjust these based on your authentication requirements

-- User Info Policies
DROP POLICY IF EXISTS "Allow anonymous insert on user_info" ON user_info;
CREATE POLICY "Allow anonymous insert on user_info" ON user_info
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on user_info" ON user_info;
CREATE POLICY "Allow anonymous select on user_info" ON user_info
    FOR SELECT USING (true);

-- Sessions Policies
DROP POLICY IF EXISTS "Allow anonymous insert on sessions" ON sessions;
CREATE POLICY "Allow anonymous insert on sessions" ON sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on sessions" ON sessions;
CREATE POLICY "Allow anonymous select on sessions" ON sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous update on sessions" ON sessions;
CREATE POLICY "Allow anonymous update on sessions" ON sessions
    FOR UPDATE USING (true);

-- Questions Policies
DROP POLICY IF EXISTS "Allow anonymous insert on questions" ON questions;
CREATE POLICY "Allow anonymous insert on questions" ON questions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on questions" ON questions;
CREATE POLICY "Allow anonymous select on questions" ON questions
    FOR SELECT USING (true);

-- Answers Policies
DROP POLICY IF EXISTS "Allow anonymous insert on answers" ON answers;
CREATE POLICY "Allow anonymous insert on answers" ON answers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on answers" ON answers;
CREATE POLICY "Allow anonymous select on answers" ON answers
    FOR SELECT USING (true);

-- Report Cards Policies
DROP POLICY IF EXISTS "Allow anonymous insert on report_cards" ON report_cards;
CREATE POLICY "Allow anonymous insert on report_cards" ON report_cards
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on report_cards" ON report_cards;
CREATE POLICY "Allow anonymous select on report_cards" ON report_cards
    FOR SELECT USING (true);

-- =============================================================================
-- 9. VERIFICATION QUERIES
-- =============================================================================
-- Run these queries after setup to verify everything is working

-- Check if all tables exist
DO $$
BEGIN
    RAISE NOTICE '=== TABLE VERIFICATION ===';
    RAISE NOTICE 'user_info exists: %', EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_info');
    RAISE NOTICE 'sessions exists: %', EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sessions');
    RAISE NOTICE 'questions exists: %', EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions');
    RAISE NOTICE 'answers exists: %', EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'answers');
    RAISE NOTICE 'report_cards exists: %', EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'report_cards');
END $$;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- You can now use the application with full database support.
--
-- Next steps:
-- 1. Configure SMTP settings in .env file
-- 2. Run: npm run dev
-- 3. Test the complete flow
-- =============================================================================
