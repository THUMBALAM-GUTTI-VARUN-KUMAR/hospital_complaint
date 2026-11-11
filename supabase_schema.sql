-- ==============================================================================
-- CAREVOICE: Public Hospital Grievance Registration and Monitoring System
-- Supabase PostgreSQL Database Schema
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLE: complaints
-- Stores grievances lodged through the Web Portal or AI Telephone Voice Agent
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(32) UNIQUE NOT NULL,
    patient_name VARCHAR(255) NOT NULL DEFAULT 'Citizen',
    contact_number VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    source VARCHAR(50) NOT NULL DEFAULT 'web',
    description TEXT NOT NULL,
    assigned_to VARCHAR(255),
    assigned_department VARCHAR(100),
    resolution_notes TEXT,
    call_recording_url VARCHAR(500),
    transcript TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for complaints
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON public.complaints (complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON public.complaints (department);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints (category);
CREATE INDEX IF NOT EXISTS idx_complaints_source ON public.complaints (source);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints (created_at DESC);

-- ------------------------------------------------------------------------------
-- 2. TABLE: complaint_history
-- Full audit trail tracking every lifecycle transition, assignment, or status update
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_history (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(32) NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    assigned_to VARCHAR(255),
    changed_by VARCHAR(255) NOT NULL DEFAULT 'System',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT complaint_history_complaint_id_fkey 
        FOREIGN KEY (complaint_id) 
        REFERENCES public.complaints (complaint_id) 
        ON DELETE CASCADE
);

-- Performance Index for history lookups
CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_id ON public.complaint_history (complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_history_created_at ON public.complaint_history (created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. TABLE: feedback
-- Captures citizen star ratings, feedback, and resolution reviews
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(32),
    patient_name VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    service_aspect VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT feedback_complaint_id_fkey 
        FOREIGN KEY (complaint_id) 
        REFERENCES public.complaints (complaint_id) 
        ON DELETE SET NULL
);

-- Performance Index for feedback lookups
CREATE INDEX IF NOT EXISTS idx_feedback_complaint_id ON public.feedback (complaint_id);

-- ------------------------------------------------------------------------------
-- 4. TRIGGER: Auto-update updated_at on complaint modifications
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_complaints_updated_at ON public.complaints;
CREATE TRIGGER trigger_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Service Role key has full access; allow public read and insert for the portal
-- ------------------------------------------------------------------------------
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Complaints policies
DROP POLICY IF EXISTS "Allow service role full access on complaints" ON public.complaints;
CREATE POLICY "Allow service role full access on complaints"
    ON public.complaints FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on complaints" ON public.complaints;
CREATE POLICY "Allow public read access on complaints"
    ON public.complaints FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert on complaints" ON public.complaints;
CREATE POLICY "Allow public insert on complaints"
    ON public.complaints FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on complaints" ON public.complaints;
CREATE POLICY "Allow public update on complaints"
    ON public.complaints FOR UPDATE
    TO anon, authenticated
    USING (true);

-- Complaint History policies
DROP POLICY IF EXISTS "Allow service role full access on complaint_history" ON public.complaint_history;
CREATE POLICY "Allow service role full access on complaint_history"
    ON public.complaint_history FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access on complaint_history" ON public.complaint_history;
CREATE POLICY "Allow public read access on complaint_history"
    ON public.complaint_history FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert on complaint_history" ON public.complaint_history;
CREATE POLICY "Allow public insert on complaint_history"
    ON public.complaint_history FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Feedback policies
DROP POLICY IF EXISTS "Allow service role full access on feedback" ON public.feedback;
CREATE POLICY "Allow service role full access on feedback"
    ON public.feedback FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and insert on feedback" ON public.feedback;
CREATE POLICY "Allow public read and insert on feedback"
    ON public.feedback FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
