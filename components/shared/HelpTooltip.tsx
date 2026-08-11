'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function HelpTooltip({ title, content, children }: {
  title: string;
  content: string | string[];
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const contentArray = typeof content === 'string' ? [content] : content;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        title={title}
      >
        {children || <HelpCircle className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-900 text-white rounded-lg shadow-lg p-3 max-w-xs w-64">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {contentArray.map((line, idx) => (
                <p key={idx} className="text-xs text-gray-200 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </>
      )}
    </div>
  );
}
