'use client';

const TERMS_KEY = 'gf_terms_accepted_v1';

export function hasAcceptedTerms(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(TERMS_KEY) !== null;
}

// Timestamp, not just a boolean -- a bare '1' had no record of *when*
// acceptance happened, which is exactly what you'd need to point to for
// a dispute, a regulator, or an App Store inquiry. Also readable by
// persistTermsAcceptance (lib/termsGate.ts's server-side counterpart) so
// the same moment can be written to the user's profile row once they're
// actually authenticated -- acceptance itself happens before sign-in
// completes (it gates the sign-in action), so there's no user id yet at
// the moment this is called.
export function markTermsAccepted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TERMS_KEY, new Date().toISOString());
}

export function getTermsAcceptedAt(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(TERMS_KEY);
  if (!raw) return null;
  if (!Number.isNaN(new Date(raw).getTime())) return raw;
  // Legacy value from before this stored a real timestamp (just the
  // string '1', written by an older build) -- that's not parseable as a
  // Postgres timestamptz, so sending it as-is silently failed the
  // server-side update forever. Upgrade it in place to a real timestamp
  // now so this device converges instead of staying stuck.
  const now = new Date().toISOString();
  window.localStorage.setItem(TERMS_KEY, now);
  return now;
}
