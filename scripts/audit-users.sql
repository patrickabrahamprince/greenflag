SELECT
  au.email,
  p.persona,
  p.name,
  p.onboarding_completed,
  w.balance
FROM profiles p
JOIN auth.users au ON au.id = p.id
LEFT JOIN wallets w ON w.user_id = p.id
WHERE p.persona IN ('man', 'woman', 'admin')
ORDER BY p.persona, au.email;
