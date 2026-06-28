import { ArrowLeft, Loader2 } from 'lucide-react';
import React from 'react';

interface OtpVerificationFormProps {
  e164Phone: string;
  otp: string;
  error: string;
  loading: boolean;
  onOtpChange: (value: string) => void;
  onChangeNumber: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendOtp: (e: React.FormEvent) => void;
}

export function OtpVerificationForm({
  e164Phone,
  otp,
  error,
  loading,
  onOtpChange,
  onChangeNumber,
  onSubmit,
  onResendOtp,
}: OtpVerificationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <button type="button" onClick={onChangeNumber} className="flex items-center gap-1.5 text-muted text-sm hover:text-ink transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Change number
      </button>
      <p className="text-sm text-muted font-thin">OTP sent to <span className="text-ink">{e164Phone}</span></p>
      <input type="tel" placeholder="Enter 6-digit OTP" value={otp} onChange={e => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} className="input text-center text-lg tracking-[0.3em]" />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify & Create Account'}
      </button>
      <button type="button" onClick={onResendOtp} disabled={loading} className="text-xs text-muted hover:text-ink transition-colors w-full text-center font-thin">
        Resend OTP
      </button>
    </form>
  );
}
