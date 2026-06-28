import { Users } from 'lucide-react';

interface ConnectionsEmptyStateProps {
  title: string;
  description: string;
}

export function ConnectionsEmptyState({ title, description }: ConnectionsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#F0EDE9]"
      >
        <Users className="w-6 h-6 text-[#8E8E93]" />
      </div>
      <h3 className="font-['Playfair_Display'] text-ink italic text-lg mb-1">{title}</h3>
      <p className="text-[#8E8E93] text-sm max-w-[240px]">{description}</p>
    </div>
  );
}
