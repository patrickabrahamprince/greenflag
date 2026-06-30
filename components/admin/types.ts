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
  role?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
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

export interface RawConnection {
  id: string;
  status: string;
  current_day: number | null;
  expires_at: string | null;
  created_at: string | null;
  guest?: { name?: string; age?: number | null; city?: string | null } | null;
}

export interface MappedConnection {
  id: string;
  status: string;
  current_day: number | null;
  expires_at: string | null;
  created_at: string | null;
  guest_name?: string;
  guest_age?: number | null;
  guest_city?: string | null;
}

export interface QueueItem {
  id: string;
  name: string;
  day: number;
  task: string;
  status: string;
  img: string;
  submitted_at: string;
  media_type: string | null;
}

export interface ConnectionRow {
  id: string;
  guest: string;
  host: string;
  currentDay: number;
  tasks: string;
  startedAt: string;
  expires: string;
  status: string;
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
