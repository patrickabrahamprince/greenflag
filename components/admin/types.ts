export interface AdminUser {
  id: string;
  name: string;
  email: string;
  persona: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  age: number;
  gender: string;
  city_auto?: string;
  city?: string;
  last_active?: string;
  photos: string[];
  bio?: string;
  job?: string;
  height?: string;
  coins: number;
  connected_count: number;
  banned_reason?: string;
  ban_reason?: string;
  interests?: string[];
  interests_have?: string[];
  interests_looking_for?: string[];
  quiz_answers?: Record<string, string> | null;
  dob?: string | null;
  phone?: string | null;
  phone_verified?: boolean;
  instagram_url?: string | null;
  role?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approval_reason?: string | null;
}

export interface AdminReport {
  id: string;
  reporter?: { name?: string };
  reported?: { name?: string };
  reported_id?: string;
  reason?: string;
  created_at: string;
}

export interface AdminData {
  profiles?: number;
  connections?: number;
  messages?: number;
  reports?: AdminReport[];
  users?: AdminUser[];
}

export interface Report {
  id: number;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  reporter: { id: string; name: string; email: string };
  reported: { id: string; name: string; email: string };
}

export type Tab = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export interface QueueItem {
  id: string;
  name: string;
  day: number;
  taskNumber: number;
  task: string;
  content: string | null;
  status: string;
  img: string;
  submitted_at: string;
  media_type: string | null;
}

export interface AuditLogEntry {
  id: string;
  admin_email: string | null;
  action: string;
  target: string | null;
  created_at: string;
}

export interface OverviewStats {
  totalUsers: number;
  hosts: number;
  guests: number;
  activeConnections: number;
  pendingModeration: number;
  revenue: number;
  connectedPairsToday: number;
  recentActivity: AuditLogEntry[];
}
