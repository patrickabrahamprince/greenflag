-- Man
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (gen_random_uuid(), 'man@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"persona": "man", "onboarding_completed": true}'::jsonb)
ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password, email_confirmed_at = now(), raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Woman
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (gen_random_uuid(), 'woman@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"persona": "woman", "onboarding_completed": true}'::jsonb)
ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password, email_confirmed_at = now(), raw_user_meta_data = EXCLUDED.raw_user_meta_data;
