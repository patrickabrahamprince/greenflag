-- Dev passwords for testing auth flow without SMS
UPDATE auth.users 
SET encrypted_password = crypt('test1234', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email IN ('demo-man@quest.local', 'demo-woman@quest.local');

-- Verify
SELECT email, encrypted_password IS NOT NULL as has_password, phone 
FROM auth.users 
WHERE email LIKE '%@quest.local';
