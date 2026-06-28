export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'fake'
  | 'other';

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Block {
  host_id: string;
  guest_id: string;
  created_at: string;
}
