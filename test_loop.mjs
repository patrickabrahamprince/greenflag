import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://waqmflgufshwvyepusux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcW1mbGd1ZnNod3Z5ZXB1c3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODgwNjQsImV4cCI6MjA5NzI2NDA2NH0.p1RkdWgvylHApTE6Rq3FmzsJbEMWZSZrrZdJIXNiZE8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('--- STEP 1: DB TEST START ---');
  const { data: users, error: uErr } = await supabase.from('users').select('count').limit(1);
  const { data: codes, error: cErr } = await supabase.from('invite_codes').select('code').limit(1);
  
  console.log('SUPABASE_USERS error:', uErr);
  console.log('SUPABASE_INVITES error:', cErr);
  
  if (uErr || cErr) {
    console.log('FAIL: STEP 1');
    console.log('Users Err:', uErr);
    console.log('Invites Err:', cErr);
    return;
  }
  
  console.log('STEP 1 PASS');
  console.log('--- STEP 2: MONEY LOOP TEST START ---');
  
  // 1. Account A
  const accountA_Id = randomUUID();
  const { error: insAErr } = await supabase.from('users').insert({ id: accountA_Id, persona: 'woman', coins: 500 });
  if (insAErr) { console.log('FAIL: Insert A', insAErr); return; }
  
  const { error: stdErr } = await supabase.from('standards').insert({
    user_id: accountA_Id,
    is_active: true,
    intentions: [{day: 1, prompt: 'A1'}, {day: 2, prompt: 'A2'}, {day: 3, prompt: 'A3'}, {day: 4, prompt: 'A4'}, {day: 5, prompt: 'A5'}, {day: 6, prompt: 'A6'}, {day: 7, prompt: 'A7'}, {day: 8, prompt: 'A8'}]
  });
  if (stdErr) { console.log('FAIL: Insert Standard', stdErr); return; }
  
  // 2. Account B
  const accountB_Id = randomUUID();
  const { error: insBErr } = await supabase.from('users').insert({ id: accountB_Id, persona: 'man', coins: 500 });
  if (insBErr) { console.log('FAIL: Insert B', insBErr); return; }
  
  // Account B -> Begin Connection
  const { data: standardA, error: sErr } = await supabase.from('standards').select('id').eq('user_id', accountA_Id).single();
  if (sErr) { console.log('FAIL: Fetch standard', sErr); return; }
  
  const { error: txErr } = await supabase.from('transactions').insert({ user_id: accountB_Id, type: 'spend_begin', amount: 100 });
  await supabase.from('users').update({ coins: 400 }).eq('id', accountB_Id);
  const { data: conn, error: connErr } = await supabase.from('connections').insert({
    initiator_id: accountB_Id,
    recipient_id: accountA_Id,
    standard_id: standardA.id,
    state: 'in_progress',
    approved_count: 0,
    day_count: 1,
    expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString()
  }).select().single();
  
  if (txErr || connErr) {
    console.log('FAIL: STEP 2 (Begin Connection)');
    console.log('txErr:', txErr, 'connErr:', connErr);
    return;
  }
  
  // 4. B Submits Day 1, A Approves, Repeat to Day 3
  let currentConn = conn;
  for (let day = 1; day <= 3; day++) {
    // B Submit
    const { data: sub, error: subErr } = await supabase.from('submissions').insert({
      connection_id: currentConn.id,
      user_id: accountB_Id,
      day: day,
      text: 'Ans ' + day,
      status: 'pending'
    }).select().single();
    if (subErr) {
      console.log('FAIL: STEP 2 (B Submit Day ' + day + ')');
      console.log(subErr); return;
    }
    
    // A Approve
    await supabase.from('submissions').update({ status: 'approved' }).eq('id', sub.id);
    
    let nextApproved = currentConn.approved_count + 1;
    let nextDay = currentConn.day_count + 1;
    let chatUnlocked = currentConn.chat_unlocked_at;
    
    if (nextApproved === 3) {
      chatUnlocked = new Date().toISOString();
      const { data: userA } = await supabase.from('users').select('coins').eq('id', accountA_Id).single();
      await supabase.from('users').update({ coins: userA.coins + 20 }).eq('id', accountA_Id);
      await supabase.from('transactions').insert({ user_id: accountA_Id, type: 'earn_day3', amount: 20 });
    }
    
    const { data: updatedConn, error: upErr } = await supabase.from('connections').update({
      approved_count: nextApproved,
      day_count: nextDay,
      chat_unlocked_at: chatUnlocked
    }).eq('id', currentConn.id).select().single();
    if (upErr) { console.log('FAIL: UPDATE CONN', upErr); return; }
    
    currentConn = updatedConn;
  }
  
  // 7. Verification
  const { data: finalUserA } = await supabase.from('users').select('coins').eq('id', accountA_Id).single();
  
  if (currentConn.chat_unlocked_at === null || finalUserA.coins !== 520) {
    console.log('FAIL: STEP 2 (End Validation)');
    console.log('chat_unlocked_at:', currentConn.chat_unlocked_at);
    console.log('User A coins:', finalUserA?.coins);
    return;
  }
  
  console.log('STEP 2 PASS');

  // cleanup
  await supabase.from('connections').delete().eq('initiator_id', accountB_Id);
  await supabase.from('users').delete().in('id', [accountA_Id, accountB_Id]);
}
runTest();
