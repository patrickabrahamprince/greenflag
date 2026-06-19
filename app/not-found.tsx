import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center max-w-app mx-auto px-4 text-center">
      <h1 className="text-6xl font-display font-bold text-gold mb-4">404</h1>
      <p className="text-white text-lg font-medium mb-2">Page not found</p>
      <p className="text-muted text-sm mb-8">
        This page doesn't exist or has been moved.
      </p>
      <Link href="/discover" className="btn-primary">
        Back to Discover
      </Link>
    </div>
  );
}
