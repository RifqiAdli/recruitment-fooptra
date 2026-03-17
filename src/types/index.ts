export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  headline?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export type LocationType = 'remote' | 'onsite' | 'hybrid';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';

export interface JobPosting {
  id: string;
  title: string;
  slug: string;
  department: string;
  category_id?: string;
  category?: JobCategory;
  location: string;
  location_type: LocationType;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_visible: boolean;
  description: string;
  responsibilities: string;
  requirements: string;
  nice_to_have?: string;
  benefits?: string;
  skills: string[];
  headcount: number;
  status: JobStatus;
  deadline?: string;
  is_featured: boolean;
  banner_url?: string;
  views_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'pending' | 'reviewing' | 'shortlisted' | 'interview_scheduled'
  | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  job_id: string;
  job?: JobPosting;
  applicant_id: string;
  applicant?: Profile;
  status: ApplicationStatus;
  cover_letter?: string;
  cv_url: string;
  cv_filename: string;
  portfolio_url?: string;
  expected_salary?: number;
  availability_date?: string;
  source: string;
  notes?: string;
  rating?: number;
  rejection_reason?: string;
  applied_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  application?: Application;
  scheduled_at: string;
  duration_minutes: number;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
  location?: string;
  meeting_url?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'application' | 'status_update' | 'interview' | 'offer' | 'system';
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job?: JobPosting;
  saved_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  is_active: boolean;
  target_role: 'all' | 'user' | 'admin';
  expires_at?: string;
  created_by?: string;
  created_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}
