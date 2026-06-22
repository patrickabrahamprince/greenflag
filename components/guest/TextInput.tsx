import { useState } from 'react';

interface TextInputProps {
  onText: (text: string) => void;
}

export function TextInput({ onText }: TextInputProps) {
  const [value, setValue] = useState('');
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); onText(e.target.value); }}
        placeholder="Write your response here..."
        rows={6}
        className="input resize-none"
      />
      <div className="flex justify-end">
        <span className="text-xs text-muted font-thin">{value.length} characters</span>
      </div>
    </div>
  );
}
