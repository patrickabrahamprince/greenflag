'use client';

const TERMS_KEY = 'gf_terms_accepted_v1';

export function hasAcceptedTerms(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(TERMS_KEY) === '1';
}

export function markTermsAccepted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TERMS_KEY, '1');
}
