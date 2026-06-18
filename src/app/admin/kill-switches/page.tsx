import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminUser, getAdminClient } from '@/lib/admin';
import KillSwitchesClient from '@/components/KillSwitchesClient';

export const metadata: Metadata = {
  title: 'Admin – Kill Switches',
};

// Disable caching for real‑time admin control
export const revalidate = 0;

export default async function KillSwitchesPage() {
  // 1. Verify admin authentication
  const admin = await getAdminUser();
  if (!admin) redirect('/login');

  // 2. Fetch feature flags using the admin client
  const adminClient = getAdminClient();
  const { data: flags, error } = await adminClient
    .from('feature_flags')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  // 3. Render the client-side kill switch controls
  return <KillSwitchesClient initialFlags={flags ?? []} />;
}
