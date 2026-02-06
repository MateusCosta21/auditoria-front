// Admin types
export interface Admin {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  admin: Admin;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  domain?: string;
  domains?: string[];
  data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface TenantListResponse {
  data: Tenant[];
  total: number;
}

export interface CreateTenantRequest {
  tenant_name: string;
  tenant_slug: string;
  tenant_subdomain?: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface CreateTenantResponse {
  message: string;
  tenant_id: string;
  domain: string;
  tenant_db: string;
  admin_created: boolean;
}

export interface ToggleStatusResponse {
  message: string;
  is_active: boolean;
}

// Tenant User types (for tenant portal)
export interface TenantUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantLoginResponse {
  access_token: string;
  token_type: string;
  user: TenantUser;
}

// Dashboard types
export interface DashboardStats {
  audits_this_month: number;
  audits_trend: number;
  average_compliance: number;
  compliance_trend: number;
  open_ncs: number;
  critical_ncs: number;
  active_checklists: number;
}

export interface ComplianceByArea {
  name: string;
  value: number;
}

export interface NcBySeverity {
  critical: number;
  medium: number;
  low: number;
}

// Checklist types
export interface ChecklistQuestion {
  id?: number;
  text: string;
  weight: 1 | 2 | 3;
  photo_required: boolean;
  comment_required: boolean;
  order: number;
}

export interface ChecklistSection {
  id?: number;
  name: string;
  order: number;
  questions: ChecklistQuestion[];
}

export interface ChecklistListItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'draft';
  sections_count: number;
  questions_count: number;
  audits_count: number;
  updated_at: string;
}

export interface ChecklistDetail {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'draft';
  sections: ChecklistSection[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistListResponse {
  data: ChecklistListItem[];
  total: number;
}

export interface SaveChecklistRequest {
  name: string;
  category: string;
  status: 'active' | 'draft';
  sections: {
    name: string;
    order: number;
    questions: {
      text: string;
      weight: 1 | 2 | 3;
      photo_required: boolean;
      comment_required: boolean;
      order: number;
    }[];
  }[];
}

// Audit types
export interface AuditListItem {
  id: string;
  checklist_name: string;
  unit: string;
  auditor_name: string;
  date: string;
  score: number | null;
  status: 'completed' | 'in_progress' | 'pending';
  non_conformities_count: number;
}

export interface AuditListResponse {
  data: AuditListItem[];
  total: number;
}

export interface AuditSectionDetail {
  id: number;
  name: string;
  order: number;
  score: number | null;
  max_score: number | null;
  questions: {
    id: number;
    text: string;
    weight: 1 | 2 | 3;
    photo_required: boolean;
    comment_required: boolean;
    order: number;
    answer: 'conform' | 'non-conform' | 'na' | null;
    comment: string | null;
    photos: string[];
  }[];
}

export interface AuditNonConformity {
  id: number;
  section: string;
  question: string;
  weight: 1 | 2 | 3;
  comment: string;
}

export interface AuditDetail {
  id: string;
  checklist_id: string;
  checklist_name: string;
  unit: string;
  auditor_name: string;
  date: string;
  score: number | null;
  status: 'completed' | 'in_progress' | 'pending';
  sections: AuditSectionDetail[];
  non_conformities: AuditNonConformity[];
  conform_count: number;
  non_conform_count: number;
  critical_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAuditRequest {
  checklist_id: string;
  unit: string;
  date: string;
}

export interface CreateAuditResponse {
  message: string;
  audit: AuditDetail;
}

export interface AnswerPayload {
  question_id: number;
  answer: 'conform' | 'non-conform' | 'na';
  comment?: string;
  photos?: string[];
}

export interface UpdateAnswersResponse {
  message: string;
}

export interface FinalizeAuditResponse {
  message: string;
  score: number;
  audit: AuditDetail;
}

// Non-conformity types
export interface NonConformityListItem {
  id: number;
  item: string;
  section: string;
  weight: 1 | 2 | 3;
  audit_id: string;
  audit_date: string;
  responsible: string | null;
  deadline: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'overdue';
  action: string | null;
}

export interface NonConformityListResponse {
  data: NonConformityListItem[];
  total: number;
  stats: {
    open: number;
    in_progress: number;
    overdue: number;
    resolved: number;
  };
}

export interface NonConformityDetail {
  id: number;
  item: string;
  section: string;
  weight: 1 | 2 | 3;
  audit_id: string;
  audit_date: string;
  responsible: string | null;
  deadline: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'overdue';
  action: string | null;
  evidence_url: string | null;
}

// Report types
export interface ReportListItem {
  id: string;
  checklist: string;
  unit: string;
  auditor: string;
  date: string;
  score: number;
  status: 'completed' | 'in_progress';
  non_conformities: number;
}

export interface ReportListResponse {
  data: ReportListItem[];
  total: number;
  summary: {
    total_audits: number;
    average_compliance: number;
    critical_audits: number;
    total_ncs: number;
  };
}

// Upload types
export interface UploadPhotoResponse {
  url: string;
  path: string;
}

// API Error
export interface ApiError {
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
