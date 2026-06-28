import { ArrowLeft } from 'lucide-react';

interface ReviewBackButtonProps {
  onClick: () => void;
}

export function ReviewBackButton({ onClick }: ReviewBackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[#8E8E93] hover:text-ink transition-colors mb-4"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>
  );
}
