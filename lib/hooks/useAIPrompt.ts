import { useState } from 'react';
import toast from 'react-hot-toast';

export function useAIPrompt() {
  const [loading, setLoading] = useState(false);

  const generateDayPrompt = async (
    matchId: string,
    day: number,
    interests: string[],
    partnerName?: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, day, interests, partnerName }),
      });

      if (!res.ok) throw new Error('Failed to generate prompt');
      const data = await res.json();
      return data.prompt;
    } catch (err) {
      toast.error('Failed to generate prompt');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateFirstMessage = async (
    matchId: string,
    partnerName: string,
    partnerInterests: string[],
    yourName?: string,
    yourInterests?: string[]
  ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-first-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          partnerName,
          partnerInterests,
          yourName,
          yourInterests,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate message');
      const data = await res.json();
      return data.message;
    } catch (err) {
      toast.error('Failed to generate message');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateDayPrompt, generateFirstMessage, loading };
}
