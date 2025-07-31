-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
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

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_cards table
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

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_questions_session_id ON questions(session_id);
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_report_cards_session_id ON report_cards(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication setup)
-- For anonymous access (if no auth is set up yet)
CREATE POLICY "Allow anonymous insert on sessions" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on sessions" ON sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on questions" ON questions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on answers" ON answers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on answers" ON answers
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on report_cards" ON report_cards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select on report_cards" ON report_cards
    FOR SELECT USING (true);