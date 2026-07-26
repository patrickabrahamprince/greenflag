import { Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import React from 'react';

interface PhoneOtpFormProps {
  name: string;
  displayDigits: string;
  e164Phone: string;
  error: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (e164: string, raw: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PhoneOtpForm({
  name,
  displayDigits,
  e164Phone,
  error,
  loading,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: PhoneOtpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" placeholder="Full Name" value={name} onChange={e => onNameChange(e.target.value)} className="input" />
      <PhoneInput
        value={displayDigits}
        onChange={onPhoneChange}
        placeholder="Phone Number"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading || !e164Phone} className="btn-primary w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Code'}
      </button>
    </form>
  );
}
