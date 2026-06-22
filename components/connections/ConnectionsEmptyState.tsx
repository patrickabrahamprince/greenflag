import { Users } from 'lucide-react';

interface ConnectionsEmptyStateProps {
  title: string;
  description: string;
}

export function ConnectionsEmptyState({ title, description }: ConnectionsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: '#1C1C1E' }}
      >
        <Users className="w-6 h-6 text-[#8E8E93]" />
      </div>
      <h3 className="text-white font-display italic text-lg mb-1">{title}</h3>
      <p className="text-[#8E8E93] text-sm font-thin max-w-[240px]">{description}</p>
    </div>
  );
}
