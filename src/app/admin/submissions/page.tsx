import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminUser, getAdminClient } from '@/lib/admin';
import SubmissionsDashboard from '@/components/SubmissionsDashboard';

export const metadata: Metadata = {
  title: 'Admin – Submissions',
};

// Disable caching for live updates
export const revalidate = 0;

export default async function AdminSubmissionsPage() {
  // 1. Verify admin authentication
  const admin = await getAdminUser();
  if (!admin) redirect('/login');

  // 2. Fetch pending submissions via RPC using the admin client
  const adminClient = getAdminClient();
  const { data: submissions, error } = await adminClient
    .rpc('admin_pending_submissions');

  if (error) {
    throw new Error(error.message);
  }

  // 3. Render the client-side dashboard
  return <SubmissionsDashboard initialSubmissions={submissions ?? []} />;
}
