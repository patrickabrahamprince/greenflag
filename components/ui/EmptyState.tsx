import React from 'react';

export function EmptyState({ title, description, dataTestId }: { title: string; description: string; dataTestId?: string }) {
  return (
    <div data-testid={dataTestId || 'empty-state'} className="flex flex-col items-center justify-center h-full text-center px-6">
      <h3 className="text-[#EDEADE] text-xl font-playfair mb-2">{title}</h3>
      <p className="text-[#EDEADE]/60 mt-2">{description}</p>
    </div>
  );
}
