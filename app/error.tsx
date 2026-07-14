'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center max-w-app mx-auto px-4 text-center">
      <h1 className="font-['Sora'] text-6xl text-gold mb-4">500</h1>
      <p className="text-ink text-lg font-medium mb-2">Something went wrong</p>
      <p className="text-muted text-sm mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary">
        Retry
      </button>
    </div>
  );
}
