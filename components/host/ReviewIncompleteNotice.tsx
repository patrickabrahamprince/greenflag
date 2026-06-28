import { Shield } from 'lucide-react';

export function ReviewIncompleteNotice() {
  return (
    <div className="card border-[#C9A961]/30 bg-[#C9A961]/5 mb-4">
      <p className="text-sm text-[#C9A961] flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Waiting for all 8 tasks before you can review.
      </p>
    </div>
  );
}
