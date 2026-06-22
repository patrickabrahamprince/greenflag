import Link from 'next/link';

export function SignupFooter() {
  return (
    <p className="text-muted text-sm mt-8 text-center font-thin">
      Already have an account?{' '}
      <Link href="/login" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-colors">
        Sign in
      </Link>
    </p>
  );
}
