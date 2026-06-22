import { Shield } from 'lucide-react';

export function ReviewIncompleteNotice() {
  return (
    <div className="card border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-4">
      <p className="text-sm text-[#D4AF37] flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Waiting for all 8 tasks before you can review.
      </p>
    </div>
  );
}
