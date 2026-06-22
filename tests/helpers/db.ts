import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function resetTestData() {
  const testPhones = ['+919876500001', '+919876500002', '+919876500003']

  const { data: allUsers } = await supabase.auth.admin.listUsers()
  const testUsers = allUsers.users.filter(u => {
    const email = u.email ?? ''
    const cleanPhone = (u.phone ?? '').replace(/^\+/, '')
    const cleanTestPhones = testPhones.map(p => p.replace(/^\+/, ''))
    return cleanTestPhones.includes(cleanPhone) || email.endsWith('@test.com')
  })

  for (const user of testUsers) {
    await supabase.from('daily_discover_views').delete().or(`man_id.eq.${user.id},woman_id.eq.${user.id}`)
    await supabase.from('connections').delete().or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
    const { data: testRows } = await supabase.from('tests').select('id').eq('host_id', user.id)
    if (testRows && testRows.length > 0) {
      const testIds = testRows.map(r => r.id)
      await supabase.from('tasks').delete().in('test_id', testIds)
      await supabase.from('tests').delete().in('id', testIds)
    }
    await supabase.from('standards').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.admin.deleteUser(user.id).catch(() => {})
  }

  for (const phone of testPhones) {
    await supabase.from('users').delete().eq('phone', phone)
  }
}

export async function createTestUsers() {
  const password = process.env.TEST_USER_PASSWORD || 'Test1234!'
  const { data: manAuth } = await supabase.auth.admin.createUser({
    phone: '+919876500001', phone_confirm: true, password
  })
  const { data: womanAuth } = await supabase.auth.admin.createUser({
    phone: '+919876500002', phone_confirm: true, password
  })
  const { data: adminAuth } = await supabase.auth.admin.createUser({
    phone: '+919876500003', phone_confirm: true, password
  })

  const manId = manAuth!.user!.id
  const womanId = womanAuth!.user!.id
  const adminId = adminAuth!.user!.id

  await supabase.auth.admin.updateUserById(manId, { email: 'man@test.com', email_confirm: true })
  await supabase.auth.admin.updateUserById(womanId, { email: 'woman@test.com', email_confirm: true })
  await supabase.auth.admin.updateUserById(adminId, { email: 'admin@test.com', email_confirm: true })

  await supabase.from('profiles').insert([
    {
      id: manId,
      persona: 'man',
      name: 'Test Man',
      age: 25,
      city: 'Bangalore',
      bio: 'Test bio',
      photos: ['https://picsum.photos/400/600?random=1','https://picsum.photos/400/600?random=2','https://picsum.photos/400/600?random=3'],
      interests: ['Books','Music','Travel','Fitness','Cooking'],
      why_me_prompts: ['I am ambitious and driven','I value deep conversations','I show up consistently'],
      interests_have: ['Books','Music','Travel','Fitness','Cooking'],
      interests_looking_for: [],
      onboarding_completed: true,
    },
    {
      id: womanId,
      persona: 'woman',
      name: 'Test Woman',
      age: 24,
      city: 'Bangalore',
      bio: 'Test bio',
      photos: ['https://picsum.photos/400/600?random=4','https://picsum.photos/400/600?random=5','https://picsum.photos/400/600?random=6'],
      interests: ['Hiking', 'Dogs', 'Reading'],
      elo_score: 1050,
      last_active: new Date().toISOString(),
      looking_for_interests: ['Books','Music','Travel','Fitness','Cooking'],
      interests_have: ['Art','Gaming','Cinema','Philosophy','Spirituality'],
      interests_looking_for: ['Books','Music','Travel','Fitness','Cooking'],
      onboarding_completed: true,
    },
    {
      id: adminId,
      persona: 'man',
      name: 'Test Admin',
      age: 30,
      city: 'Bangalore',
      bio: 'Admin bio',
      photos: ['https://picsum.photos/400/600?random=7','https://picsum.photos/400/600?random=8','https://picsum.photos/400/600?random=9'],
      interests: ['Tech','Books','Music','Travel','Fitness'],
      why_me_prompts: ['Admin prompt 1','Admin prompt 2','Admin prompt 3'],
      interests_have: ['Tech','Books','Music','Travel','Fitness'],
      interests_looking_for: [],
      is_admin: true,
      onboarding_completed: true,
    }
  ])

  await supabase.from('profiles').update({ is_active: true, is_banned: false, gender: 'host' }).eq('id', womanId)

  await supabase.from('wallets').insert([
    { user_id: manId, balance: 500 },
    { user_id: adminId, balance: 500 },
  ])

  await supabase.from('users').upsert([
    { id: womanId, phone: '+919876500002', name: 'Test Woman', age: 24, city: 'Bangalore' },
  ], { onConflict: 'id' })

  return {
    manId,
    womanId,
    adminId
  }
}

export async function createTestUser(email: string, id?: string, isAdmin?: boolean) {
  const resolvedId = id || crypto.randomUUID();

  try { await supabase.auth.admin.deleteUser(resolvedId); } catch {}

  const { data: auth, error: createErr } = await Promise.race([
    supabase.auth.admin.createUser({
      id: resolvedId, email, password: 'testpass123', email_confirm: true,
      user_metadata: { is_admin: isAdmin || false },
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`createUser timeout for ${email}`)), 5000)
    ),
  ]) as any;

  if (createErr || !auth?.user) throw new Error(`Failed to create user ${email}: ${createErr?.message}`)

  const name = email.split('@')[0]

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: resolvedId, name,
    persona: 'man', age: 25, city: 'Bangalore', bio: 'Test bio',
    photos: ['https://picsum.photos/400/600?random=1'],
    interests: ['Books', 'Music', 'Travel', 'Fitness', 'Cooking'],
    onboarding_completed: true,
    is_admin: isAdmin || false,
  }, { onConflict: 'id' })
  if (profileErr) throw new Error(`Profile upsert failed: ${profileErr.message}`)

  await supabase.from('wallets').upsert({ user_id: resolvedId, balance: 500 }, { onConflict: 'user_id' })

  await supabase.from('users').upsert({
    id: resolvedId, phone: `+9198765${String(Math.floor(Math.random() * 90000) + 10000)}`, name, age: 25, city: 'Bangalore',
  }, { onConflict: 'id' })

  return { id: resolvedId, email }
}

export async function createTestWoman(email: string, id?: string) {
  const resolvedId = id || crypto.randomUUID();

  try { await supabase.auth.admin.deleteUser(resolvedId); } catch {}

  const { data: auth, error: createErr } = await Promise.race([
    supabase.auth.admin.createUser({
      id: resolvedId, email, password: 'testpass123', email_confirm: true,
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`createWoman timeout for ${email}`)), 5000)
    ),
  ]) as any;

  if (createErr || !auth?.user) throw new Error(`Failed to create woman ${email}: ${createErr?.message}`)

  const name = email.split('@')[0]

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: resolvedId, name,
    persona: 'woman', age: 24, city: 'Bangalore', bio: 'Test bio',
    photos: ['https://picsum.photos/400/600?random=4', 'https://picsum.photos/400/600?random=5', 'https://picsum.photos/400/600?random=6'],
    interests: ['Hiking', 'Dogs', 'Reading'],
    elo_score: 1050,
    last_active: new Date().toISOString(),
    looking_for_interests: ['Books', 'Music', 'Travel', 'Fitness', 'Cooking'],
    interests_have: ['Art', 'Gaming', 'Cinema', 'Philosophy', 'Spirituality'],
    interests_looking_for: ['Books', 'Music', 'Travel', 'Fitness', 'Cooking'],
    onboarding_completed: true,
    is_active: true, is_banned: false, gender: 'host',
  }, { onConflict: 'id' })
  if (profileErr) throw new Error(`Profile upsert failed: ${profileErr.message}`)

  await supabase.from('users').upsert({
    id: resolvedId, phone: `+9198765${String(Math.floor(Math.random() * 90000) + 10000)}`, name, age: 24, city: 'Bangalore',
  }, { onConflict: 'id' })

  return { id: resolvedId, email }
}

type StandardOptions = {
  required_interests?: string[]
  values?: string[]
  deal_breakers?: string[]
}

export async function createTestStandard(womanId: string): Promise<{ womanId: string; standardId: string }>
export async function createTestStandard(userId: string, options: StandardOptions): Promise<{ userId: string; standardId: string }>
export async function createTestStandard(id: string, options?: StandardOptions) {
  if (options) {
    const { data: standard, error: stdErr } = await supabase
      .from('standards')
      .insert({
        user_id: id, woman_id: id, is_active: true, intentions: {},
        required_interests: options.required_interests ?? [],
        values: options.values ?? [],
        deal_breakers: options.deal_breakers ?? [],
      })
      .select('id')
      .single()
    if (stdErr || !standard) throw new Error(`Failed to create standard: ${stdErr?.message ?? 'unknown error'}`)
    return { userId: id, standardId: standard.id }
  }

  const { data: standard, error: stdErr } = await supabase
    .from('standards')
    .insert({
      user_id: id, woman_id: id, intentions: { title: 'E2E Test', description: 'test' },
      is_active: true, required_interests: ['Hiking', 'Dogs'], values: ['Family-oriented'], deal_breakers: ['Smoking'],
    })
    .select('id')
    .single();

  if (stdErr || !standard) {
    throw new Error(`Failed to create standard: ${stdErr?.message ?? 'unknown error'}`);
  }

  const { data: test, error: insertError } = await supabase
    .from('tests')
    .insert({ host_id: id, name: 'Test Standard', is_active: true })
    .select('id')
    .single();

  if (insertError || !test) {
    throw new Error(`Failed to create test standard: ${insertError?.message ?? 'unknown error'}`);
  }

  await supabase.from('tasks').insert([
    { test_id: test.id, day: 1, type: 'text', description: 'Tell me 3 books that changed you' },
    { test_id: test.id, day: 2, type: 'text', description: 'Plan our ideal first date' },
    { test_id: test.id, day: 3, type: 'text', description: 'What does ambition mean to you?' },
    { test_id: test.id, day: 4, type: 'text', description: 'Your non-negotiables in a relationship' },
    { test_id: test.id, day: 5, type: 'text', description: 'A moment that defined you' },
    { test_id: test.id, day: 6, type: 'text', description: 'Why do you want to connect with me?' },
    { test_id: test.id, day: 7, type: 'text', description: 'What makes you different?' },
    { test_id: test.id, day: 8, type: 'text', description: 'Final message to convince me' },
  ]);

  return { womanId: id, standardId: standard.id };
}

export async function createIsolatedTestUsers() {
  const timestamp = Date.now();

  const man1 = await createTestUser(`man1+${timestamp}@test.com`, '11111111-1111-1111-1111-111111111111');
  const man2 = await createTestUser(`man2+${timestamp}@test.com`);
  const woman = await createTestWoman(`woman+${timestamp}@test.com`, '22222222-2222-2222-2222-222222222222');
  const admin = await createTestUser(`admin+${timestamp}@test.com`, '33333333-3333-3333-3333-333333333333', true);

  await createTestStandard(man1.id, {
    required_interests: ['Hiking', 'Dogs'],
    values: ['Family-oriented'],
    deal_breakers: [],
  });

  await createTestStandard(man2.id, {
    required_interests: ['Hiking', 'Dogs'],
    values: ['Family-oriented'],
    deal_breakers: [],
  });

  const { data: std, error: stdErr } = await supabase
    .from('standards')
    .insert({
      user_id: woman.id, woman_id: woman.id, intentions: { title: 'E2E Test', description: 'test' },
      is_active: false, required_interests: ['Hiking', 'Dogs'], values: ['Family-oriented'], deal_breakers: ['Smoking'],
    })
    .select('id')
    .single();
  if (stdErr || !std) throw new Error(`Failed to create woman standard: ${stdErr?.message ?? 'null'}`);

  const { data: testRow, error: testErr } = await supabase
    .from('tests')
    .insert({ host_id: woman.id, name: 'Test Standard', is_active: true })
    .select('id')
    .single();
  if (testErr || !testRow) throw new Error(`Failed to create test: ${testErr?.message ?? 'null'}`);

  const { error: taskErr } = await supabase.from('tasks').insert([
    { test_id: testRow.id, day_number: 1, description: 'Tell me 3 books that changed you' },
    { test_id: testRow.id, day_number: 2, description: 'Plan our ideal first date' },
    { test_id: testRow.id, day_number: 3, description: 'What does ambition mean to you?' },
    { test_id: testRow.id, day_number: 4, description: 'Your non-negotiables in a relationship' },
    { test_id: testRow.id, day_number: 5, description: 'A moment that defined you' },
    { test_id: testRow.id, day_number: 6, description: 'Why do you want to connect with me?' },
    { test_id: testRow.id, day_number: 7, description: 'What makes you different?' },
    { test_id: testRow.id, day_number: 8, description: 'Final message to convince me' },
  ]);
  if (taskErr) throw new Error(`Failed to create tasks: ${taskErr.message}`);

  return { man1, man2, woman, admin };
}

export async function createTestConnection(manId: string, womanId: string) {
  // Resolve user IDs via profiles if not provided
  let manProfileId = manId;
  let womanProfileId = womanId;

  if (!manId || !womanId) {
    const { data: manProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', 'Test Man')
      .single();
    const { data: womanProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', 'Test Woman')
      .single();
    manProfileId = manProfile?.id ?? '';
    womanProfileId = womanProfile?.id ?? '';
  }

  const { data: std } = await supabase
    .from('standards')
    .select('id')
    .eq('woman_id', womanProfileId)
    .single();
  const standardId = std?.id ?? null;

  const { error: coinErr } = await supabase.from('coin_transactions').insert({
    user_id: manProfileId,
    type: 'purchase',
    amount: 1000,
  });
  if (coinErr) throw new Error(`createTestConnection coin insert failed: ${coinErr.message}`);

  const { data: connection, error: connErr } = await supabase
    .from('connections')
    .insert({
      guest_id: manProfileId,
      host_id: womanProfileId,
      standard_id: standardId,
      status: 'pending',
      current_day: 1,
      chat_unlocked: false,
      connected: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (connErr || !connection) throw new Error(`createTestConnection connection insert failed: ${connErr?.message ?? 'null data'}`);

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .order('day_number', { ascending: true })
    .limit(1);

  if (tasks && tasks.length > 0) {
    const { error: subErr } = await supabase.from('submissions').insert({
      connection_id: connection.id,
      day: 1,
      day_number: 1,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    if (subErr) throw new Error(`createTestConnection submission insert failed: ${subErr.message}`);
  }

  return connection.id;
}

export async function fastForwardToDay(connectionId: string, day: number, chatUnlocked: boolean, connected: boolean) {
  await supabase.from('connections').update({
    current_day: day,
    chat_unlocked: chatUnlocked,
    connected,
    connected_at: connected ? new Date().toISOString() : null,
    status: connected ? 'connected' : 'active'
  }).eq('id', connectionId)

  await supabase.from('submissions').update({ status: 'approved' })
    .eq('connection_id', connectionId)

  if (!connected) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('day', day)
      .limit(1)

    if (tasks && tasks.length > 0) {
      await supabase.from('submissions').insert({
        connection_id: connectionId,
        task_id: tasks[0].id,
        day_number: day,
        status: 'pending_submission',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }
}

export async function expireSubmissionDeadline(connectionId: string) {
  await supabase.from('submissions').update({
    deadline: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }).eq('connection_id', connectionId).eq('status', 'pending_submission')
}
