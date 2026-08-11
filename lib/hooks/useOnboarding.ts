import { useEffect, useState } from 'react';

export function useOnboarding() {
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const complete = localStorage.getItem('onboardingComplete') === 'true';
      setIsComplete(complete);
      setIsLoading(false);
    }
  }, []);

  const markComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingComplete', 'true');
      setIsComplete(true);
    }
  };

  const reset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboardingComplete');
      setIsComplete(false);
    }
  };

  return { isComplete, isLoading, markComplete, reset };
}
