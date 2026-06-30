import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto py-4 text-center text-xs text-gray-400">
      <Link href="/privacy" className="hover:underline">
        Privacy
      </Link>
      {' | '}
      <Link href="/terms" className="hover:underline">
        Terms
      </Link>
    </footer>
  );
}
