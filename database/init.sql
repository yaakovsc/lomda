-- =============================================================
-- Girón Information Security Awareness Training System
-- Database Initialization Script (Schema Only)
-- Questions are seeded via Node.js seed script on first startup
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================
-- TABLES
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    training_started_at TIMESTAMPTZ,
    training_completed_at TIMESTAMPTZ,
    training_slide_progress INTEGER DEFAULT 0,
    exam_completed_at TIMESTAMPTZ,
    exam_score INTEGER,
    exam_passed BOOLEAN,
    exam_attempts INTEGER DEFAULT 0,
    exam_locked_by_admin BOOLEAN DEFAULT false,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multiple')),
    category VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answers JSONB NOT NULL,
    explanation TEXT NOT NULL,
    is_learning BOOLEAN NOT NULL DEFAULT true,
    is_exam_question BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questions_snapshot JSONB NOT NULL,
    answers JSONB DEFAULT '{}',
    results JSONB,
    score INTEGER,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    current_question INTEGER DEFAULT 0,
    is_submitted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    selected_question_ids JSONB NOT NULL DEFAULT '[]',
    randomize_order BOOLEAN NOT NULL DEFAULT true,
    passing_score INTEGER NOT NULL DEFAULT 8,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT only_one_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS training_slides (
    id INTEGER PRIMARY KEY,
    order_index INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(20),
    content TEXT NOT NULL,
    key_points JSONB DEFAULT '[]',
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO company_settings (key, value) VALUES
    ('company_name', 'גירון פיתוח ובניה בע"מ'),
    ('primary_color', '#1a3a6b'),
    ('logo_url', '/giron.png')
ON CONFLICT (key) DO NOTHING;

-- is_custom separates default content from customer-specific overrides
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_submitted ON exam_attempts(is_submitted);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_is_exam ON questions(is_exam_question);

-- =============================================================
-- DEFAULT EXAM CONFIG ROW
-- =============================================================

INSERT INTO exam_config (id, selected_question_ids, randomize_order, passing_score)
VALUES (1, '[]', true, 8)
ON CONFLICT (id) DO NOTHING;
