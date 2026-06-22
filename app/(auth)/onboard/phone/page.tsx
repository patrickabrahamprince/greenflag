'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function PhonePage() {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

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
    toast.success('OTP sent');
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6">
      <button
        onClick={() => router.push('/onboard')}
        className="text-[#8E8E93] hover:text-white transition-colors mb-8 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-display font-semibold text-white mb-2">
          {otpSent ? 'Verify your number' : 'What\'s your number?'}
        </h1>
        <p className="text-[#8E8E93] text-sm mb-8">
          {otpSent
            ? `We sent a 6-digit code to ${phone}`
            : 'We\'ll send you a verification code'}
        </p>

        {!otpSent ? (
          <div className="space-y-4">
            <PhoneInput value={phone} onChange={handlePhoneChange} error={error} />
            <button
              onClick={handleSendOtp}
              disabled={!phone || loading}
              className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8E8E93] font-thin mb-1.5 tracking-wide">
                6-digit code
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
              className="w-full text-center text-sm text-[#8E8E93] hover:text-white transition-colors"
            >
              Resend OTP
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[#8E8E93] text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
      </div>
    </div>
  );
}
