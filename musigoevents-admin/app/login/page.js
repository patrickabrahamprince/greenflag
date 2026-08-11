'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Wrong password');
        return;
      }
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          border: '1px solid #E8E6E1',
          borderRadius: 14,
          padding: 32,
          width: '100%',
          maxWidth: 320,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#C9A961',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 700 }}>G</span>
        </div>
        <h1 style={{ fontSize: 18, margin: '0 0 4px 0' }}>GreenFlag Admin</h1>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px 0' }}>
          Waitlist outreach — musigoevents.com
        </p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #E8E6E1',
            marginBottom: 12,
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <div style={{ color: '#B23B3B', fontSize: 12, marginBottom: 12 }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: 'none',
            background: '#C9A961',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {loading ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
