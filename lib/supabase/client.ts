'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<Database, 'public', 'public', Database['public'], { PostgrestVersion: '12' }>;

export function createClient(): TypedSupabaseClient {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://waqmflgufshwvyepusux.supabase.co').replace(/\\n/g, '').trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4r2NWfULLzScM_LT_OewrA_ESNfUODV').replace(/\\n/g, '').trim();

  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    },
  }) as unknown as TypedSupabaseClient;
}
