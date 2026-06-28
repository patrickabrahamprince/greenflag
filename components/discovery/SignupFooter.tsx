import Link from 'next/link';

export function SignupFooter() {
  return (
    <p className="text-ink/50 text-sm mt-8 text-center">
      Already have an account?{' '}
      <Link href="/login" className="text-[#C9A961] underline underline-offset-4 decoration-[#C9A961]/40 hover:decoration-[#C9A961] transition-colors">
        Sign in
      </Link>
    </p>
  );
}
