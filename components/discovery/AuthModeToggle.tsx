import { Phone, Mail } from 'lucide-react';

type AuthMode = 'email' | 'phone';

interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex gap-1 rounded-full p-1 mb-6" style={{ background: '#111111' }}>
      <button
        onClick={() => onModeChange('email')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'email' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
      >
        <Mail className="w-4 h-4" />
        Email
      </button>
      <button
        onClick={() => onModeChange('phone')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'phone' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
      >
        <Phone className="w-4 h-4" />
        Phone
      </button>
    </div>
  );
}
