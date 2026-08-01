'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        'absolute top-4 left-4 z-10 text-ink/50 hover:text-ink active:scale-90 transition-all',
        className
      )}
    >
      <ArrowLeft size={24} />
    </button>
  );
}
