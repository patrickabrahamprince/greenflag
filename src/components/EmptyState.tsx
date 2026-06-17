import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-[24px] bg-surface border-[0.5px] border-border flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
      </div>
      <h2 className="text-[20px] font-display font-semibold tracking-[-0.02em] mb-2">{title}</h2>
      {description && <p className="text-sm text-text-muted max-w-xs mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="h-12 px-6 rounded-[16px] bg-accent text-bg font-semibold text-sm transition-all hover:brightness-110">
          {action.label}
        </button>
      )}
    </div>
  );
}
