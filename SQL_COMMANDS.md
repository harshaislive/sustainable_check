# SQL Commands to Run in Supabase

Before testing the application, you need to run these SQL commands in your Supabase SQL Editor to create the necessary database tables and update the schema.

## Step 1: Create user_info table

```sql
-- Create user_info table to store user contact details
CREATE TABLE IF NOT EXISTS user_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 2: Update sessions table

```sql
-- Add user_info_id column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS user_info_id UUID REFERENCES user_info(id) ON DELETE SET NULL;
```

## Step 3: Enable Row Level Security

```sql
-- Enable RLS on user_info table
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;
```

## Step 4: Create RLS Policies

```sql
-- Allow anonymous insert on user_info
CREATE POLICY "Allow anonymous insert on user_info" ON user_info
    FOR INSERT WITH CHECK (true);

-- Allow anonymous select on user_info
CREATE POLICY "Allow anonymous select on user_info" ON user_info
    FOR SELECT USING (true);
```

## Alternative: Run All at Once

You can also run the complete schema from `supabase-schema.sql` file which includes all these changes plus the other tables (sessions, questions, answers, report_cards).

## Verification Queries

After running the above commands, verify everything is set up correctly:

```sql
-- Check if user_info table exists
SELECT * FROM user_info LIMIT 1;

-- Check if sessions table has user_info_id column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sessions'
  AND column_name = 'user_info_id';

-- Check RLS policies on user_info
SELECT * FROM pg_policies WHERE tablename = 'user_info';
```

## How to Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the SQL commands
5. Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)

## Notes

- These commands use `IF NOT EXISTS` and `IF EXISTS` to prevent errors if tables/columns already exist
- The `ON DELETE SET NULL` ensures that if a user_info record is deleted, the sessions won't be deleted but the reference will be set to NULL
- RLS policies allow anonymous access since the app doesn't have authentication set up yet
