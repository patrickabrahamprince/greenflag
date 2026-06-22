-- scripts/setup_test_users.sql

-- Delete existing test users if any
DELETE FROM auth.users WHERE email IN ('man@test.com', 'woman@test.com', 'admin@test.com');

-- Man account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'man@test.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);

INSERT INTO public.profiles (id, gender, name, age, city_auto, is_active, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'male', 'Test Man', 28, 'Bangalore', true, now());

-- Woman account  
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'woman@test.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);

INSERT INTO public.profiles (id, gender, name, age, city_auto, is_active, photos, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'female', 'Test Woman', 26, 'Bangalore', true, ARRAY['https://picsum.photos/seed/woman/800/1200'], now());

-- Admin account
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'admin@test.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);

INSERT INTO public.profiles (id, gender, name, is_admin, is_active, created_at)
VALUES ('33333333-3333-3333-3333-333333333333', 'male', 'Admin', true, true, now());

-- Wallets
INSERT INTO public.wallets (user_id, balance, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 100, now()),
('22222222-2222-2222-2222-222222222222', 50, now()),
('33333333-3333-3333-3333-333333333333', 999, now())
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;
