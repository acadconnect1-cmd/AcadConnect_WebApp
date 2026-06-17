export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export type UserRole = 'faculty' | 'institution_member' | 'admin'
export type InstitutionRole = 'owner' | 'admin' | 'recruiter' | 'viewer'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived'
export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'adjunct' | 'temporary'
export type WorkMode = 'on-site' | 'hybrid' | 'remote'
export type NotificationType = 'application_status_change' | 'new_job_alert' | 'system_alert' | 'message'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing'
