require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const man = users.find(u => u.email === 'test-man@local.dev');
  const woman = users.find(u => u.email === 'test-woman@local.dev');
  if (!man || !woman) throw new Error('Run dateasy-seed-test-users.js first');

  const { data: existing } = await supabase.from('matches').select('*')
    .or(`and(user1_id.eq.${man.id},user2_id.eq.${woman.id}),and(user1_id.eq.${woman.id},user2_id.eq.${man.id})`)
    .maybeSingle();

  let matchId = existing?.id;
  if (!matchId) {
    const { data, error } = await supabase.from('matches').insert({
      user1_id: man.id, user2_id: woman.id, chat_unlocked: true, status: 'completed', current_day: 3,
    }).select('id').single();
    if (error) throw error;
    matchId = data.id;
    console.log('[match] created', matchId);
  } else {
    await supabase.from('matches').update({ chat_unlocked: true }).eq('id', matchId);
    console.log('[match] reused', matchId);
  }

  const { data: existingMsgs } = await supabase.from('messages').select('id').eq('match_id', matchId);
  if (!existingMsgs || existingMsgs.length === 0) {
    const messages = [
      { match_id: matchId, sender_id: woman.id, content: 'Hi! How\'s everything going?' },
      { match_id: matchId, sender_id: man.id, content: 'Great, thanks for asking! Excited to chat more.' },
      { match_id: matchId, sender_id: woman.id, content: 'Same here, looking forward to it.' },
    ];
    for (const m of messages) {
      const { error } = await supabase.from('messages').insert(m);
      if (error) throw error;
    }
    console.log('[messages] seeded', messages.length);
  } else {
    console.log('[messages] already exist:', existingMsgs.length);
  }

  console.log('Match ID for conversation screenshot:', matchId);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
