import { Shield } from 'lucide-react';

export function ReviewIncompleteNotice() {
  return (
    <div className="card border-[#00C853]/30 bg-[#00C853]/5 mb-4">
      <p className="text-sm text-[#00C853] flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Waiting for all 8 tasks before you can review.
      </p>
    </div>
  );
}
