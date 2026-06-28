import { ArrowLeft } from 'lucide-react';

interface InterestsPageHeaderProps {
  title: string;
  onBack: () => void;
}

export function InterestsPageHeader({ title, onBack }: InterestsPageHeaderProps) {
  return (
    <div className="flex items-center mb-6">
      <button
        onClick={onBack}
        className="text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex-1 text-center">
        <p className="text-xs text-muted uppercase tracking-wider">{title}</p>
      </div>
      <div className="w-6" />
    </div>
  );
}
