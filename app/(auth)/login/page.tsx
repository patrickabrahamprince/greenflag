'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import type { Profile } from '@/types';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'phone' | 'email';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((s) => s.setUser);

  const [tab, setTab] = useState<Tab>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    const fullPhone = `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOtpSent(true);
    toast.success('Code sent!');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    const fullPhone = `+91${phone}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: code,
      type: 'sms',
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await handleAuthSuccess();
  };

  const handleSendMagicLink = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Magic link sent! Check your email.');
  };

  const handleAuthSuccess = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.replace('/login');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (profile) {
      setUser(profile as unknown as Profile);
      if ((profile as unknown as Profile).role === 'host') {
        router.replace('/your-standards');
      } else {
        router.replace('/discover');
      }
    } else {
      router.replace('/onboard');
    }
  }, [router, supabase, setUser]);

  return (
    <div className="w-full animate-fade-in">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-muted hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-semibold text-white mb-2">
          Welcome to GreenFlag
        </h1>
        <p className="text-muted text-sm">
          {tab === 'phone'
            ? "Enter your number and we'll text you a code to confirm it's you."
            : 'Enter your email to receive a magic link.'}
        </p>
      </div>

      <div className="flex bg-surface rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('phone')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'phone'
              ? 'bg-gold text-black'
              : 'text-muted hover:text-white'
          }`}
        >
          <Phone size={16} />
          Phone
        </button>
        <button
          onClick={() => setTab('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'email'
              ? 'bg-gold text-black'
              : 'text-muted hover:text-white'
          }`}
        >
          <Mail size={16} />
          Email
        </button>
      </div>

      {tab === 'phone' ? (
        <div className="space-y-4">
          {!otpSent ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm bg-surface border border-border rounded-xl px-3 py-3">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter your number"
                  className="input flex-1"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted text-center">
                Enter the 6-digit code sent to +91 {phone}
              </p>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 bg-surface border border-border rounded-xl text-center text-white text-lg font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                className="btn-ghost w-full text-sm"
              >
                Change number
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="input"
          />
          <button
            onClick={handleSendMagicLink}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>
      )}
    </div>
  );
}
