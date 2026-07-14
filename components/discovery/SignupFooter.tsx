import Link from 'next/link';

export function SignupFooter() {
  return (
    <p className="text-ink/50 text-sm mt-8 text-center">
      Already have an account?{' '}
      <Link href="/login" className="text-[#D4AF37] underline underline-offset-4 decoration-[#D4AF37]/40 hover:decoration-[#D4AF37] transition-colors">
        Sign in
      </Link>
    </p>
  );
}
