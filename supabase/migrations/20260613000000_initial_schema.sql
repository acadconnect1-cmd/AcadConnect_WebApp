-- AcadConnect: Initial Database Schema Migration
-- Includes Enums, Tables, Triggers, Indexes, RLS helper functions and RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================================================
-- 1. GLOBAL CUSTOM ENUMS
-- =========================================================================

CREATE TYPE public.user_role AS ENUM ('faculty', 'institution_member', 'admin');
CREATE TYPE public.institution_role AS ENUM ('owner', 'admin', 'recruiter', 'viewer');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE public.application_status AS ENUM ('applied', 'reviewed', 'shortlisted', 'rejected', 'hired');
CREATE TYPE public.employment_type AS ENUM ('full-time', 'part-time', 'contract', 'adjunct', 'temporary');
CREATE TYPE public.work_mode AS ENUM ('on-site', 'hybrid', 'remote');
CREATE TYPE public.notification_type AS ENUM ('application_status_change', 'new_job_alert', 'system_alert', 'message');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');

-- =========================================================================
-- 2. TABLES AND SCHEMAS
-- =========================================================================

-- Table: public.profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'faculty'::public.user_role,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Table: public.faculty_profiles
CREATE TABLE public.faculty_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    phone TEXT,
    bio TEXT,
    cv_url TEXT,
    resume_filename TEXT,
    resume_uploaded_at TIMESTAMPTZ,
    profile_completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    current_institution TEXT,
    highest_degree TEXT,
    major_discipline TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    search_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Table: public.institutions
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    website_url TEXT,
    logo_url TEXT,
    description TEXT,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    institution_type TEXT NOT NULL,
    verification_status public.verification_status NOT NULL DEFAULT 'pending'::public.verification_status,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Table: public.institution_members
CREATE TABLE public.institution_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.institution_role NOT NULL DEFAULT 'recruiter'::public.institution_role,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_institution_profile UNIQUE (institution_id, profile_id)
);

-- Table: public.subscription_plans
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    stripe_price_id TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    tier TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status public.subscription_status NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.jobs
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject_area TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    required_qualification TEXT NOT NULL,
    preferred_qualification TEXT,
    minimum_experience INTEGER CHECK (minimum_experience >= 0),
    maximum_experience INTEGER CHECK (maximum_experience >= 0),
    vacancies INTEGER NOT NULL DEFAULT 1 CHECK (vacancies >= 1),
    department TEXT NOT NULL,
    employment_type public.employment_type NOT NULL DEFAULT 'full-time'::public.employment_type,
    work_mode public.work_mode NOT NULL DEFAULT 'on-site'::public.work_mode,
    location TEXT NOT NULL,
    salary_range_min NUMERIC,
    salary_range_max NUMERIC,
    salary_currency TEXT NOT NULL DEFAULT 'USD',
    application_deadline TIMESTAMPTZ,
    status public.job_status NOT NULL DEFAULT 'draft'::public.job_status,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Table: public.job_views
CREATE TABLE public.job_views (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.applications
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    status public.application_status NOT NULL DEFAULT 'applied'::public.application_status,
    screening_score NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Table: public.application_status_history
CREATE TABLE public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status public.application_status NOT NULL,
    new_status public.application_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL DEFAULT 'system_alert'::public.notification_type,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.saved_jobs
CREATE TABLE public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_faculty_saved_job UNIQUE (faculty_id, job_id)
);

-- Table: public.activity_logs
CREATE TABLE public.activity_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 3. AUDIT TRIGGERS AND SYSTEM FUNCTIONS
-- =========================================================================

-- Trigger function to auto-update the `updated_at` column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_faculty_profiles_updated_at BEFORE UPDATE ON public.faculty_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_institution_members_updated_at BEFORE UPDATE ON public.institution_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Supabase Auth Synchronization Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_role public.user_role;
BEGIN
    v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', '');
    v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
    v_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'faculty'::public.user_role);

    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        new.id,
        new.email,
        v_first_name,
        v_last_name,
        v_role
    );

    IF v_role = 'faculty'::public.user_role THEN
        INSERT INTO public.faculty_profiles (id)
        VALUES (new.id);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute when a new user signs up via Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 4. PERFORMANCE AND CONSTRAINT INDEXES
-- =========================================================================

-- Foreign Key B-Tree Indexes
CREATE INDEX idx_institution_members_institution_id ON public.institution_members(institution_id);
CREATE INDEX idx_institution_members_profile_id ON public.institution_members(profile_id);
CREATE INDEX idx_jobs_institution_id ON public.jobs(institution_id);
CREATE INDEX idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX idx_job_views_job_id ON public.job_views(job_id);
CREATE INDEX idx_job_views_profile_id ON public.job_views(profile_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_faculty_id ON public.applications(faculty_id);
CREATE INDEX idx_application_status_history_application_id ON public.application_status_history(application_id);
CREATE INDEX idx_application_status_history_changed_by ON public.application_status_history(changed_by);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_saved_jobs_faculty_id ON public.saved_jobs(faculty_id);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);
CREATE INDEX idx_activity_logs_profile_id ON public.activity_logs(profile_id);
CREATE INDEX idx_subscriptions_institution_id ON public.subscriptions(institution_id);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);

-- Partial Indexes (Soft-Delete Aware constraints)
CREATE UNIQUE INDEX idx_applications_job_faculty_active 
ON public.applications(job_id, faculty_id) 
WHERE (deleted_at IS NULL);

CREATE INDEX idx_jobs_active_published 
ON public.jobs(status, created_at DESC) 
WHERE (deleted_at IS NULL AND status = 'published'::public.job_status);

-- GIN Index on JSONB Preferences
CREATE INDEX idx_faculty_preferences_gin 
ON public.faculty_profiles USING GIN (preferences);

-- Full-Text Trigram Search Index on job title and department
CREATE INDEX idx_jobs_title_trgm 
ON public.jobs USING GIN (title gin_trgm_ops);

CREATE INDEX idx_jobs_department_trgm 
ON public.jobs USING GIN (department gin_trgm_ops);

-- =========================================================================
-- 5. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper RLS claims query functions
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles 
    WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_institution_member(target_inst_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.institution_members
        WHERE institution_id = target_inst_id 
          AND profile_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_institution_admin(target_inst_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.institution_members
        WHERE institution_id = target_inst_id 
          AND profile_id = auth.uid()
          AND role IN ('owner'::public.institution_role, 'admin'::public.institution_role)
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND role = 'admin'::public.user_role
          AND deleted_at IS NULL
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- RLS Policies: public.profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
    USING (deleted_at IS NULL OR public.is_system_admin());

CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_system_admin());

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.is_system_admin())
    WITH CHECK (id = auth.uid() OR public.is_system_admin());

CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.faculty_profiles
CREATE POLICY "faculty_profiles_select_own" ON public.faculty_profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.is_system_admin());

CREATE POLICY "faculty_profiles_select_recruiter" ON public.faculty_profiles FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL 
        AND EXISTS (
            SELECT 1 FROM public.applications a 
            JOIN public.jobs j ON a.job_id = j.id 
            WHERE a.faculty_id = public.faculty_profiles.id 
              AND public.is_institution_member(j.institution_id)
        )
    );

CREATE POLICY "faculty_profiles_insert" ON public.faculty_profiles FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_system_admin());

CREATE POLICY "faculty_profiles_update" ON public.faculty_profiles FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.is_system_admin())
    WITH CHECK (id = auth.uid() OR public.is_system_admin());

CREATE POLICY "faculty_profiles_delete" ON public.faculty_profiles FOR DELETE TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.institutions
CREATE POLICY "institutions_select" ON public.institutions FOR SELECT TO authenticated
    USING (deleted_at IS NULL OR public.is_system_admin());

CREATE POLICY "institutions_insert" ON public.institutions FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "institutions_update" ON public.institutions FOR UPDATE TO authenticated
    USING (public.is_institution_admin(id) OR public.is_system_admin())
    WITH CHECK (public.is_institution_admin(id) OR public.is_system_admin());

CREATE POLICY "institutions_delete" ON public.institutions FOR DELETE TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.institution_members
CREATE POLICY "members_select" ON public.institution_members FOR SELECT TO authenticated
    USING (public.is_institution_member(institution_id) OR public.is_system_admin());

CREATE POLICY "members_write" ON public.institution_members FOR ALL TO authenticated
    USING (public.is_institution_admin(institution_id) OR public.is_system_admin())
    WITH CHECK (public.is_institution_admin(institution_id) OR public.is_system_admin());

-- RLS Policies: public.jobs
CREATE POLICY "jobs_select_published" ON public.jobs FOR SELECT TO authenticated
    USING (
        status = 'published'::public.job_status 
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.institutions i
            WHERE i.id = public.jobs.institution_id
              AND i.verification_status = 'approved'::public.verification_status
        )
    );

CREATE POLICY "jobs_select_draft_members" ON public.jobs FOR SELECT TO authenticated
    USING (public.is_institution_member(institution_id) AND deleted_at IS NULL);

CREATE POLICY "jobs_write_recruiters" ON public.jobs FOR ALL TO authenticated
    USING (
        deleted_at IS NULL 
        AND public.is_institution_member(institution_id) 
        AND EXISTS (
            SELECT 1 FROM public.institution_members 
            WHERE institution_id = public.jobs.institution_id 
              AND profile_id = auth.uid() 
              AND role IN ('owner'::public.institution_role, 'admin'::public.institution_role, 'recruiter'::public.institution_role)
        )
    );

CREATE POLICY "jobs_admin_all" ON public.jobs FOR ALL TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.job_views
CREATE POLICY "job_views_insert" ON public.job_views FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "job_views_select" ON public.job_views FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs j 
            WHERE j.id = public.job_views.job_id 
              AND public.is_institution_member(j.institution_id)
        ) OR public.is_system_admin()
    );

-- RLS Policies: public.applications
CREATE POLICY "applications_insert_faculty" ON public.applications FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = faculty_id 
        AND public.get_user_role() = 'faculty'::public.user_role
    );

CREATE POLICY "applications_select_applicant" ON public.applications FOR SELECT TO authenticated
    USING (faculty_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "applications_select_institution" ON public.applications FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL 
        AND EXISTS (
            SELECT 1 FROM public.jobs j 
            WHERE j.id = public.applications.job_id 
              AND public.is_institution_member(j.institution_id)
        )
    );

CREATE POLICY "applications_update_applicant" ON public.applications FOR UPDATE TO authenticated
    USING (faculty_id = auth.uid())
    WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "applications_update_institution" ON public.applications FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs j 
            WHERE j.id = public.applications.job_id 
              AND public.is_institution_member(j.institution_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.jobs j 
            WHERE j.id = public.applications.job_id 
              AND public.is_institution_member(j.institution_id)
        )
    );

CREATE POLICY "applications_admin_all" ON public.applications FOR ALL TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.application_status_history
CREATE POLICY "status_history_select_applicant" ON public.application_status_history FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = public.application_status_history.application_id 
              AND a.faculty_id = auth.uid()
        )
    );

CREATE POLICY "status_history_select_institution" ON public.application_status_history FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            JOIN public.jobs j ON a.job_id = j.id 
            WHERE a.id = public.application_status_history.application_id 
              AND public.is_institution_member(j.institution_id)
        )
    );

CREATE POLICY "status_history_insert_institution" ON public.application_status_history FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications a 
            JOIN public.jobs j ON a.job_id = j.id 
            WHERE a.id = public.application_status_history.application_id 
              AND public.is_institution_member(j.institution_id)
        )
    );

CREATE POLICY "status_history_admin_all" ON public.application_status_history FOR ALL TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.notifications
CREATE POLICY "notifications_all_recipient" ON public.notifications FOR ALL TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.saved_jobs
CREATE POLICY "saved_jobs_all_faculty" ON public.saved_jobs FOR ALL TO authenticated
    USING (faculty_id = auth.uid())
    WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "saved_jobs_admin_all" ON public.saved_jobs FOR ALL TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.activity_logs
CREATE POLICY "activity_logs_insert" ON public.activity_logs FOR INSERT TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "activity_logs_select_admin" ON public.activity_logs FOR SELECT TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.subscription_plans
CREATE POLICY "subscription_plans_select" ON public.subscription_plans FOR SELECT TO authenticated
    USING (active = true OR public.is_system_admin());

CREATE POLICY "subscription_plans_admin_all" ON public.subscription_plans FOR ALL TO authenticated
    USING (public.is_system_admin());

-- RLS Policies: public.subscriptions
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT TO authenticated
    USING (public.is_institution_member(institution_id) OR public.is_system_admin());

CREATE POLICY "subscriptions_admin_all" ON public.subscriptions FOR ALL TO authenticated
    USING (public.is_system_admin());
