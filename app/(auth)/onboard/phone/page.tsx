'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { PhoneInput } from '@/components/ui/phone-input';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { AppleButton } from '@/components/ui/AppleButton';
import { createClient } from '@/lib/supabase/client';
import { signInWithGoogleNative, signInWithAppleNative } from '@/lib/native/socialLogin';
import toast from 'react-hot-toast';

export default function PhonePage() {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserEmail(user.email ?? null);
      if (user.email && !user.phone) {
        setSkipping(true);
        await supabase
          .from('profiles')
          .update({ phone_verified: true })
          .eq('id', user.id);
        router.replace('/onboard/profile');
      }
    };
    init();
  }, []);

  const handlePhoneChange = useCallback((e164: string) => {
    setPhone(e164);
    setError('');
  }, []);

  const handleSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setOtpSent(true);
    toast.success('Code sent');
  };

  const handleVerifyOtp = async () => {
    if (!phone || otp.length !== 6) return;
    setLoading(true);
    setError('');
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    router.push('/onboard/profile');
  };

  const handleSkip = async () => {
    setSkipping(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ phone_verified: true })
        .eq('id', user.id);
    }
    router.push('/onboard/profile');
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Native gets the real iOS account picker; web keeps the existing
      // hosted-redirect flow. See handleGoogleLogin in
      // app/(auth)/login/page.tsx for why these need to differ.
      if (Capacitor.isNativePlatform()) {
        await signInWithGoogleNative();
        router.push('/onboard/profile');
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'USER_CANCELLED') {
        setError(err instanceof Error ? err.message : 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Required alongside Google -- Apple guideline 4.8. See handleAppleLogin
  // in app/(auth)/login/page.tsx for why this won't work until Sign In
  // with Apple is configured in the Developer Portal + Supabase.
  const handleAppleLogin = async () => {
    setAppleLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithAppleNative();
        router.push('/onboard/profile');
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'USER_CANCELLED') {
        setError(err instanceof Error ? err.message : 'Apple sign-in failed');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  if (skipping) {
    return (
      <div className="w-full animate-fade-in min-h-dvh flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#9DA0A6]" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top">
      <button
        onClick={() => router.push('/onboard/name')}
        className="text-ink/40 hover:text-ink transition-colors mb-8 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-display font-semibold text-ink mb-2">
          {otpSent ? "Verify Your Number" : "Your Number"}
        </h1>
        <p className="text-[#9DA0A6] text-sm mb-8">
          {otpSent
            ? `A code was sent to ${phone}`
            : "We'll send a discreet verification code"}
        </p>

        {!otpSent ? (
          <div className="space-y-4">
            <PhoneInput value={phone} onChange={handlePhoneChange} error={error} />
            <button
              onClick={handleSendOtp}
              disabled={!phone || loading}
              className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#9DA0A6] font-thin mb-1.5 tracking-wide">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  setError('');
                }}
                placeholder="000000"
                className="input text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full text-center text-sm text-ink/40 hover:text-ink transition-colors"
            >
              Resend Code
            </button>
          </div>
        )}

        <button
          onClick={handleSkip}
          disabled={skipping}
          className="mt-6 w-full text-sm text-[#9DA0A6] underline underline-offset-4 decoration-ink/20 hover:text-ink hover:decoration-ink/40 transition-colors disabled:opacity-50"
        >
          Maybe Later
        </button>

        {userEmail && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Signed in as {userEmail}. You can add your number later in Settings.
          </p>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#2A2A2A]" />
          <span className="text-[#9DA0A6] text-xs">or</span>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
        </div>

        <div className="space-y-3">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
          <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
        </div>
      </div>
    </div>
  );
}
