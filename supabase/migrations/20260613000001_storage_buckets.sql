-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('resumes', 'resumes', false, 5242880, ARRAY['application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('logos', 'logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =========================================================================
-- STORAGE RLS POLICIES
-- =========================================================================

-- Enable RLS on storage.objects (normally enabled by default in Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Institution members with write access can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Institution members with write access can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Institution members with write access can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can read their own resume" ON storage.objects;
DROP POLICY IF EXISTS "Recruiters can view resumes of candidates who applied" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can upload their own resume" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can update their own resume" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can delete their own resume" ON storage.objects;

-- -------------------------------------------------------------------------
-- 1. Avatars Bucket Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- -------------------------------------------------------------------------
-- 2. Logos Bucket Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Logos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

CREATE POLICY "Institution members with write access can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = (storage.foldername(name))[1]::uuid
      AND im.profile_id = auth.uid()
      AND im.role IN ('owner'::public.institution_role, 'admin'::public.institution_role, 'recruiter'::public.institution_role)
  )
);

CREATE POLICY "Institution members with write access can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = (storage.foldername(name))[1]::uuid
      AND im.profile_id = auth.uid()
      AND im.role IN ('owner'::public.institution_role, 'admin'::public.institution_role, 'recruiter'::public.institution_role)
  )
)
WITH CHECK (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = (storage.foldername(name))[1]::uuid
      AND im.profile_id = auth.uid()
      AND im.role IN ('owner'::public.institution_role, 'admin'::public.institution_role, 'recruiter'::public.institution_role)
  )
);

CREATE POLICY "Institution members with write access can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = (storage.foldername(name))[1]::uuid
      AND im.profile_id = auth.uid()
      AND im.role IN ('owner'::public.institution_role, 'admin'::public.institution_role, 'recruiter'::public.institution_role)
  )
);

-- -------------------------------------------------------------------------
-- 3. Resumes Bucket Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Candidates can read their own resume"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Recruiters can view resumes of candidates who applied"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.faculty_id = (storage.foldername(name))[1]::uuid
      AND a.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM public.institution_members im
        WHERE im.institution_id = j.institution_id
          AND im.profile_id = auth.uid()
      )
  )
);

CREATE POLICY "Candidates can upload their own resume"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Candidates can update their own resume"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Candidates can delete their own resume"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
