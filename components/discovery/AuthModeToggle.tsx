import { Phone, Mail } from 'lucide-react';

type AuthMode = 'email' | 'phone';

interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex gap-1 rounded-xl p-1 mb-6 bg-[#1C1C1E]">
      <button
        onClick={() => onModeChange('email')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'email' ? 'bg-gold text-white' : 'text-ink/50 hover:text-ink'}`}
      >
        <Mail className="w-4 h-4" />
        Email
      </button>
      <button
        onClick={() => onModeChange('phone')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${mode === 'phone' ? 'bg-gold text-white' : 'text-ink/50 hover:text-ink'}`}
      >
        <Phone className="w-4 h-4" />
        Phone
      </button>
    </div>
  );
}
