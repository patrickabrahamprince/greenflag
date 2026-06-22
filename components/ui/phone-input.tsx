'use client';

import { useState, useMemo } from 'react';
import { isValidPhoneNumber, parsePhoneNumber, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

const POPULAR_COUNTRIES: { code: CountryCode; name: string }[] = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'US' },
  { code: 'GB', name: 'UK' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi' },
  { code: 'SG', name: 'Singapore' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

interface PhoneInputProps {
  value: string;
  onChange: (e164: string, rawDigits: string) => void;
  error?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, error, placeholder }: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>('IN');
  const [digits, setDigits] = useState('');

  const callingCode = useMemo(() => getCountryCallingCode(country), [country]);

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 15);
    setDigits(cleaned);
    const fullNumber = `+${callingCode}${cleaned}`;
    if (isValidPhoneNumber(fullNumber)) {
      onChange(fullNumber, cleaned);
    } else {
      onChange('', cleaned);
    }
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);
    setDigits('');
    onChange('', '');
  };

  return (
    <div>
      <label className="block text-xs text-muted font-thin mb-1.5 tracking-wide">Phone number</label>
      <div className="flex gap-2">
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
          className="input w-24 text-center text-sm"
        >
          {POPULAR_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              +{getCountryCallingCode(c.code)} {c.name}
            </option>
          ))}
        </select>
        <input
          type="tel"
          placeholder={placeholder || '98765 43210'}
          value={digits}
          onChange={(e) => handleChange(e.target.value)}
          required
          className="input flex-1"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
