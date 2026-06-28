import { Loader2 } from 'lucide-react';

export function ReviewLoadingState() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
    </div>
  );
}
