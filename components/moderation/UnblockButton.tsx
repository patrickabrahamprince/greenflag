'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { unblockUser } from '@/lib/supabase/moderation';

export function UnblockButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnblock = async () => {
    setLoading(true);
    const { error } = await unblockUser(userId);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('User unblocked');
    router.refresh();
  };

  return (
    <button
      onClick={handleUnblock}
      disabled={loading}
      className="text-xs uppercase tracking-wide text-[#C9A961] font-medium disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unblock'}
    </button>
  );
}
