'use client';

import { useEffect, useState } from 'react';

// Real numbers only -- fabricating a completed-connections count would be
// a dark pattern. Below MIN_CREDIBLE_COUNT the real number would look
// sparse rather than reassuring, so this falls back to an honest,
// values-based line instead of a volume claim until there's enough
// real activity to show.
const MIN_CREDIBLE_COUNT = 10;
const QUALITATIVE_FALLBACK = 'Every connection here follows the same standard — three real days, no shortcuts.';

export function SocialProofLine({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats/public')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setCount(data.completedStandards); })
      .catch(() => {});
  }, []);

  const text = count !== null && count >= MIN_CREDIBLE_COUNT
    ? `${count}+ Standards completed on Greenflag so far.`
    : QUALITATIVE_FALLBACK;

  return <p className={className}>{text}</p>;
}
