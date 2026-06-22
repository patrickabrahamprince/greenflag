'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient<Database, 'public', 'public', Database['public'], { PostgrestVersion: '12' }>;

export function createClient(): TypedSupabaseClient {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\\n/g, '').trim();

  return createBrowserClient<Database>(url, anonKey) as unknown as TypedSupabaseClient;
}
