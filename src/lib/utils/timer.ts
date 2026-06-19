// @ts-nocheck
export const calculateTimeRemaining = (expiresAtISO: string): {
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
} => {
  const expires = new Date(expiresAtISO).getTime();
  const now = Date.now();
  const diffMs = expires - now;

  if (diffMs <= 0) {
    return { hours: '00', minutes: '00', seconds: '00', totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return {
    hours: String(hrs).padStart(2, '0'),
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
    totalSeconds,
  };
};

export const getDaysLeftText = (day: number): string => {
  if (day >= 8) return 'Completed';
  return `Day ${day}/8`;
};
