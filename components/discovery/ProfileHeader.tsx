import { ArrowLeft } from 'lucide-react';

interface ProfileHeaderProps {
  isHost: boolean;
  onBack: () => void;
}

export function ProfileHeader({ isHost, onBack }: ProfileHeaderProps) {
  return (
    <>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-muted hover:text-ink active:scale-90 transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">
            {isHost ? 'Set Your Standards' : 'Meet the Standards'}
          </p>
        </div>
        <div className="w-6" />
      </div>

      <h1 className="font-display text-xl text-ink text-center mb-6">
        {isHost ? 'Create Your Profile' : 'Tell Us About Yourself'}
      </h1>
    </>
  );
}
