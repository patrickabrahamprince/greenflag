#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Try to add task_number column to intentions if it doesn't exist
  // Using raw SQL via the service role key through the REST API
  
  // First, let's try a direct insert with task_number to see if the column exists
  const { data: testData, error: testErr } = await supabase
    .from('intentions')
    .select('*')
    .limit(1);
  
  console.log('Sample intention:', JSON.stringify(testData, null, 2));
  if (testErr) console.error('Select error:', JSON.stringify(testErr, null, 2));

  // Check if task_number is in the data
  if (testData && testData.length > 0) {
    const hasTaskNumber = 'task_number' in testData[0];
    console.log('Has task_number column:', hasTaskNumber);
    console.log('Keys:', Object.keys(testData[0]));
  }

  // Check standards columns
  const { data: stdData, error: stdErr } = await supabase
    .from('standards')
    .select('*')
    .limit(1);
  
  console.log('\nSample standard:', JSON.stringify(stdData, null, 2));
  if (stdData && stdData.length > 0) {
    console.log('Standard keys:', Object.keys(stdData[0]));
    console.log('Has woman_id:', 'woman_id' in stdData[0]);
    console.log('Has user_id:', 'user_id' in stdData[0]);
  }

  // Check connections columns
  const { data: connData, error: connErr } = await supabase
    .from('connections')
    .select('*')
    .limit(1);
  
  console.log('\nSample connection:', JSON.stringify(connData, null, 2));
  if (connData && connData.length > 0) {
    console.log('Connection keys:', Object.keys(connData[0]));
  }
}

main().catch(console.error);
