import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-display text-white mb-4">Sign in failed</h1>
        <p className="text-[#8E8E93] text-sm mb-8">
          Something went wrong. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-block btn-primary px-8 py-3"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
