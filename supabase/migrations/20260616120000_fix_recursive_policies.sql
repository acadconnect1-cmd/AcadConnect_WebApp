-- Fix recursive RLS policies by converting language SQL helper functions to PL/pgSQL.
-- This prevents the PostgreSQL planner from inlining them and losing the SECURITY DEFINER context.

CREATE OR REPLACE FUNCTION public.is_institution_member(target_inst_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.institution_members
        WHERE institution_id = target_inst_id 
          AND profile_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_institution_admin(target_inst_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.institution_members
        WHERE institution_id = target_inst_id 
          AND profile_id = auth.uid()
          AND role IN ('owner'::public.institution_role, 'admin'::public.institution_role)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
DECLARE
    v_role public.user_role;
BEGIN
    SELECT role INTO v_role FROM public.profiles 
    WHERE id = auth.uid() AND deleted_at IS NULL;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND role = 'admin'::public.user_role
          AND deleted_at IS NULL
    ) INTO v_is_admin;
    RETURN v_is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the recursive RLS policy and recreate it using the PL/pgSQL helper function
DROP POLICY IF EXISTS "Enable modification for owners or admins" ON public.institution_members;
CREATE POLICY "Enable modification for owners or admins" 
ON public.institution_members FOR ALL 
TO authenticated 
USING (public.is_institution_admin(institution_id) OR public.is_system_admin());

