import React from 'react';

interface EmailSignupFormProps {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailSignupForm({
  name,
  email,
  password,
  error,
  loading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: EmailSignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" placeholder="Full Name" value={name} onChange={e => onNameChange(e.target.value)} required className="input" />
      <input type="email" placeholder="Email Address" value={email} onChange={e => onEmailChange(e.target.value)} required className="input" />
      <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => onPasswordChange(e.target.value)} required minLength={6} className="input" />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating Profile...' : 'Join Greenflag'}
      </button>
    </form>
  );
}
