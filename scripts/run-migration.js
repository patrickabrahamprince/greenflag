#!/usr/bin/env node
// Use Supabase Management API to execute DQL/DDL
// Docs: https://supabase.com/docs/guides/database/connecting-to-postgres#management-api

require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

async function runSql(sql) {
  // Use the Supabase Management API (available with service role key)
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return text;
}

async function main() {
  const statements = [
    'ALTER TABLE intentions ADD COLUMN IF NOT EXISTS task_number INT DEFAULT 1 NOT NULL',
    'ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_standard_day_task_key',
    'ALTER TABLE intentions ADD CONSTRAINT intentions_standard_day_task_key UNIQUE(standard_id, day_number, task_number)',
    'ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_day_number_check',
    'ALTER TABLE intentions ADD CONSTRAINT intentions_day_number_check CHECK (day_number BETWEEN 1 AND 3)',
  ];

  for (const sql of statements) {
    try {
      console.log(`\n▶ ${sql}`);
      const result = await runSql(sql);
      console.log(`  ✓ ${result.trim()}`);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
    }
  }
}

main().catch(console.error);
