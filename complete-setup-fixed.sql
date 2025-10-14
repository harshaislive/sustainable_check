-- Complete Supabase Setup Script (Fixed for Existing Tables)
-- Run this entire file in your Supabase SQL Editor

-- =============================================================================
-- 1. CREATE USER INFO TABLE (NEW)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. UPDATE SESSIONS TABLE (ADD NEW COLUMN)
-- =============================================================================
-- Add user_info_id column to existing sessions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sessions'
        AND column_name = 'user_info_id'
    ) THEN
        ALTER TABLE sessions
        ADD COLUMN user_info_id UUID REFERENCES user_info(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added user_info_id column to sessions table';
    ELSE
        RAISE NOTICE 'user_info_id column already exists in sessions table';
    END IF;
END $$;

-- =============================================================================
-- 3. CREATE OTHER TABLES IF THEY DON'T EXIST
-- =============================================================================

-- Questions table
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

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report cards table
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
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_info_id ON sessions(user_info_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_session_id ON report_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_user_info_email ON user_info(email);

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE RLS POLICIES
-- =============================================================================

-- User Info Policies
DROP POLICY IF EXISTS "Allow anonymous insert on user_info" ON user_info;
CREATE POLICY "Allow anonymous insert on user_info" ON user_info
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on user_info" ON user_info;
CREATE POLICY "Allow anonymous select on user_info" ON user_info
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous update on user_info" ON user_info;
CREATE POLICY "Allow anonymous update on user_info" ON user_info
    FOR UPDATE USING (true);

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
-- 7. VERIFICATION
-- =============================================================================
DO $$
DECLARE
    v_user_info_exists BOOLEAN;
    v_sessions_exists BOOLEAN;
    v_questions_exists BOOLEAN;
    v_answers_exists BOOLEAN;
    v_report_cards_exists BOOLEAN;
    v_user_info_id_exists BOOLEAN;
BEGIN
    -- Check tables
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_info') INTO v_user_info_exists;
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sessions') INTO v_sessions_exists;
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions') INTO v_questions_exists;
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'answers') INTO v_answers_exists;
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'report_cards') INTO v_report_cards_exists;

    -- Check user_info_id column
    SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'sessions'
        AND column_name = 'user_info_id'
    ) INTO v_user_info_id_exists;

    -- Display results
    RAISE NOTICE '========================================';
    RAISE NOTICE '     SETUP VERIFICATION RESULTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'user_info table: %', CASE WHEN v_user_info_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'sessions table: %', CASE WHEN v_sessions_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'questions table: %', CASE WHEN v_questions_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'answers table: %', CASE WHEN v_answers_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'report_cards table: %', CASE WHEN v_report_cards_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'user_info_id in sessions: %', CASE WHEN v_user_info_id_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE '========================================';

    IF v_user_info_exists AND v_sessions_exists AND v_questions_exists AND v_answers_exists AND v_report_cards_exists AND v_user_info_id_exists THEN
        RAISE NOTICE 'SUCCESS! All tables and columns are set up correctly.';
    ELSE
        RAISE NOTICE 'WARNING: Some tables or columns are missing. Please review the output above.';
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- Next steps:
-- 1. Configure SMTP settings in .env file
-- 2. Run: npm run dev
-- 3. Test the application
-- =============================================================================
