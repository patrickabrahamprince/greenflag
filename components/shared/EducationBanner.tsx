'use client';

import { X, Lightbulb } from 'lucide-react';
import { useState } from 'react';

export function EducationBanner({
  id,
  title,
  description,
  children
}: {
  id: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(`banner-dismissed-${id}`, 'true');
    setDismissed(true);
  };

  if (dismissed || (typeof window !== 'undefined' && localStorage.getItem(`banner-dismissed-${id}`))) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
      <div className="flex gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">{title}</h3>
          <p className="text-sm text-blue-800 mt-1">{description}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
