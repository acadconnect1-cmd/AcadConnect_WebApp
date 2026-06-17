export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string | null
          role: 'faculty' | 'institution_member' | 'admin'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          role?: 'faculty' | 'institution_member' | 'admin'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          role?: 'faculty' | 'institution_member' | 'admin'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      // Stubs for other tables (jobs, applications, etc.) can go here as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'faculty' | 'institution_member' | 'admin'
      institution_role: 'owner' | 'admin' | 'recruiter' | 'viewer'
      verification_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      job_status: 'draft' | 'published' | 'closed' | 'archived'
      application_status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
      employment_type: 'full-time' | 'part-time' | 'contract' | 'adjunct' | 'temporary'
      work_mode: 'on-site' | 'hybrid' | 'remote'
      notification_type: 'application_status_change' | 'new_job_alert' | 'system_alert' | 'message'
      subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
