# GreenFlag OAuth Setup Guide

## Google OAuth Setup

### 1. Create Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create new project: "GreenFlag"
- Enable "Google+ API"

### 2. Create OAuth Credentials
- Go to Credentials → Create Credentials → OAuth Client ID
- Application type: Web application
- Add authorized origins:
  - `https://greenflag-dusky.vercel.app`
  - `https://localhost:3000` (for testing)
- Add authorized redirect URIs:
  - `https://greenflag-dusky.vercel.app/auth/callback`
  - `https://greenflag-dusky.vercel.app/api/auth/callback/google`
  - `https://localhost:3000/auth/callback`

### 3. Save Credentials
- Copy Client ID and Client Secret
- Add to Supabase provider settings:
  - Provider: Google
  - Client ID: [paste]
  - Client Secret: [paste]

### 4. Test Locally
```bash
NEXT_PUBLIC_SUPABASE_URL=... \
NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
npm run dev
```

Then test "Sign in with Google" button on login page.

---

## Apple Sign In Setup

### 1. Apple Developer Account Setup
- Go to [Apple Developer](https://developer.apple.com)
- Sign in with your Apple Developer account

### 2. Enable Sign in with Apple
- Go to Certificates, Identifiers & Profiles
- Select App IDs
- Select your app (com.greenflag.app)
- Enable "Sign in with Apple"

### 3. Create Service ID
- Go to Identifiers → Services IDs
- Click "+" to create new Service ID
- Identifier: `com.greenflag.app.signin`
- Enabled Domains: greenflag-dusky.vercel.app

### 4. Configure Return URLs
- Click "Configure" for your Service ID
- Add Return URLs:
  - `https://greenflag-dusky.vercel.app/api/auth/callback/apple`
  - `https://greenflag-dusky.vercel.app/auth/callback`

### 5. Create Private Key
- Go to Keys
- Create new key: "Sign in with Apple"
- Download the `.p8` file
- Save securely (you can't download again)

### 6. Add to Supabase
- Go to Authentication → Providers → Apple
- Enable Apple provider
- Client ID: `com.greenflag.app.signin`
- Team ID: (from Apple Developer account)
- Key ID: (from generated key)
- Private Key: (content of .p8 file)

### 7. Mobile Configuration (Capacitor)
```typescript
// src/main.ts or initialization file
import { CapacitorSocialLogin } from '@capgo/capacitor-social-login';

// For iOS native build
CapacitorSocialLogin.initialize({
  apple: {
    clientId: 'com.greenflag.app.signin',
    teamId: 'YOUR_TEAM_ID',
    keyId: 'YOUR_KEY_ID',
    redirectUrl: 'https://greenflag-dusky.vercel.app/auth/callback'
  }
});
```

---

## Testing OAuth Locally

### Test Google
1. Run `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Authorize with test Google account
5. Verify redirect and user creation

### Test Apple (Web)
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Apple"
3. Authorize with Apple ID
4. Verify redirect and user creation

### Test Apple (iOS Native)
1. Build native app
2. Test on device
3. Tap "Sign in with Apple"
4. Verify iCloud Keychain integration

---

## Environment Variables for OAuth

Add these to `.env.local` and production:

```
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple OAuth (for mobile)
NEXT_PUBLIC_APPLE_CLIENT_ID=com.greenflag.app.signin
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_private_key_content
```

---

## Troubleshooting OAuth

### Google OAuth Not Working
- [ ] Check Client ID in Supabase
- [ ] Verify redirect URLs match exactly
- [ ] Check browser console for errors
- [ ] Verify origins are authorized

### Apple OAuth Not Working
- [ ] Verify Service ID is configured
- [ ] Check Team ID matches Apple account
- [ ] Ensure Key ID is correct
- [ ] Check Private Key file is valid
- [ ] For mobile: ensure native plugin is installed

### Redirect Loop
- [ ] Check if callback URL is correct
- [ ] Verify Supabase session is created
- [ ] Clear browser cache and cookies
- [ ] Check if redirect URL has extra query params

---

## Security Best Practices

✅ Never commit private keys to git
✅ Use environment variables for secrets
✅ Rotate keys periodically
✅ Monitor failed login attempts
✅ Test logout and session invalidation
✅ Verify HTTPS on production

---

## After Setting Up OAuth

1. ✅ Test with real accounts (not test accounts)
2. ✅ Verify email/phone verification works
3. ✅ Test account linking (if enabled)
4. ✅ Test logout and re-login
5. ✅ Verify profile creation after OAuth
6. ✅ Test on multiple devices
7. ✅ Monitor error logs for issues

---

**Status**: OAuth setup ready for integration
