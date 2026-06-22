# GreenFlag Deployment Guide

## Required Environment Variables

Create a `.env.local` file with these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Admin
ADMIN_EMAILS=admin@example.com

# Web Push (optional, for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## Supabase Project Setup

1. Create a new Supabase project at https://supabase.com
2. Run all migration files in order from `supabase/migrations/`
3. Enable Email and Phone auth providers in Authentication > Providers
4. Create storage buckets:
   - `profile-photos` (public)
   - `submissions` (public)
5. Deploy edge functions:
   ```bash
   supabase functions deploy send-push
   ```
6. Set edge function secrets:
   ```bash
   supabase secrets set VAPID_PUBLIC_KEY=your-key VAPID_PRIVATE_KEY=your-key VAPID_SUBJECT=mailto:admin@greenflag.app
   ```

## Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Get API keys from Settings > API Keys
3. Set up webhook:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Secret: Generate a strong secret and add to `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`

## Running Migrations

```bash
# Local development
supabase db push

# Production
supabase db push --linked
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deploy

```bash
npm install
npm run build
npm start
```

## Pre-deployment Checklist

- [ ] All environment variables set
- [ ] Supabase RLS enabled on all tables
- [ ] Razorpay webhook configured and tested
- [ ] Storage buckets created
- [ ] Edge functions deployed
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
