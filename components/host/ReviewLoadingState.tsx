import { Loader2 } from 'lucide-react';

export function ReviewLoadingState() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
    </div>
  );
}
