import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#000000]">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-['Sora'] text-2xl text-ink mb-4">Sign in failed</h1>
        <p className="text-[#9DA0A6] text-sm mb-8">
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
