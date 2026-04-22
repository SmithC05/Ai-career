-- V3: Add Resume Analyser table
CREATE TABLE IF NOT EXISTS resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_text TEXT,
    extracted_skills JSONB,
    job_description TEXT,
    match_score INTEGER,
    suggestions JSONB,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON resume_analyses(user_id);
