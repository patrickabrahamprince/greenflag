import Link from 'next/link';

export function SignupFooter() {
  return (
    <p className="text-ink/50 text-sm mt-8 text-center">
      Already on Greenflag?{' '}
      <Link href="/login" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold transition-colors">
        Sign In
      </Link>
    </p>
  );
}
