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
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

export default function PhonePage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
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
    router.prefetch('/onboard/profile');
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
    goTo('/onboard/profile', '/onboarding/age.jpg');
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
    goTo('/onboard/profile', '/onboarding/age.jpg');
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Native gets the real iOS account picker; web keeps the existing
      // hosted-redirect flow. See handleGoogleLogin in
      // app/(auth)/login/page.tsx for why these need to differ.
      if (Capacitor.isNativePlatform()) {
        await signInWithGoogleNative();
        goTo('/onboard/profile', '/onboarding/age.jpg');
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
        goTo('/onboard/profile', '/onboarding/age.jpg');
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
      <div className="w-full animate-fade-in min-h-dvh flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
      </div>
    );
  }

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/phone.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/onboard/name')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full overflow-y-auto overscroll-none pb-4">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-4 font-bold text-xl">
            📱
          </div>
          <h1 className="text-3xl font-display font-extrabold text-[#382A21] mb-2">
            {otpSent ? "Verify Your Number" : "Your Phone Number"}
          </h1>
          <p className="text-stone-600 text-sm font-medium mb-6">
            {otpSent
              ? `A 6-digit code was sent to ${phone}`
              : "We'll send a quick verification code"}
          </p>

          {!otpSent ? (
            <div className="space-y-4">
              <PhoneInput value={phone} onChange={handlePhoneChange} error={error} />
              <button
                onClick={handleSendOtp}
                disabled={!phone || loading}
                className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#382A21]/70 font-bold mb-1.5 tracking-wider uppercase">
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
                  className="w-full text-center text-3xl tracking-[0.4em] font-mono font-bold bg-stone-50 border-2 border-stone-200 focus:border-[#1D3B2A] focus:bg-white rounded-2xl py-3 text-[#382A21] transition-all"
                  autoFocus
                />
                {error && <p className="text-red-600 text-xs font-semibold mt-1.5">{error}</p>}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-center text-xs font-bold text-emerald-800 hover:text-emerald-950 active:scale-90 transition-all pt-1"
              >
                Resend Code
              </button>
            </div>
          )}

          <button
            onClick={handleSkip}
            disabled={skipping}
            className="mt-5 w-full text-xs font-bold text-stone-500 hover:text-[#382A21] tracking-wider uppercase transition-colors disabled:opacity-50 text-center"
          >
            Maybe Later
          </button>

          {userEmail && (
            <p className="text-xs text-stone-400 mt-3 text-center font-medium">
              Signed in as {userEmail}
            </p>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-xs font-bold uppercase">or continue with</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <div className="space-y-3">
            <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
            {Capacitor.getPlatform() !== 'android' && (
              <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
