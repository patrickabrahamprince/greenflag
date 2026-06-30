'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function maxDob(): string {
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return eighteenYearsAgo.toISOString().slice(0, 10);
}

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export default function DobOnboardingPage() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const maxDate = useMemo(() => maxDob(), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dob) {
      setError('Please enter your date of birth.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError('You must be signed in to continue.');
        setLoading(false);
        return;
      }

      const user = userData.user;
      const age = getAge(dob);

      if (age < 18) {
        await supabase.auth.signOut();
        router.push('/?error=Must%20be%2018%2B');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ dob })
        .eq('id', user.id);

      if (updateError) {
        setError('Could not save your date of birth. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/discover');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-sm p-6 space-y-4"
      >
        <h1 className="font-display text-xl text-ink">Confirm your date of birth</h1>
        <p className="text-sm text-muted">
          You must be 18 or older to use GreenFlag.
        </p>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-ink mb-1">
            Date of birth
          </label>
          <input
            id="dob"
            type="date"
            value={dob}
            max={maxDate}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold text-ink py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
