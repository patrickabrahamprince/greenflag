-- Fix test users authentication fields
UPDATE auth.users 
SET encrypted_password = crypt('Test1234!', gen_salt('bf')),
    email_confirmed_at = now(),
    confirmed_at = now(),
    updated_at = now(),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
WHERE email IN ('man@test.com', 'woman@test.com', 'admin@test.com');

-- Verify update
SELECT email,
       email_confirmed_at IS NOT NULL AS confirmed,
       encrypted_password IS NOT NULL AS has_password
FROM auth.users 
WHERE email IN ('man@test.com', 'woman@test.com', 'admin@test.com');
