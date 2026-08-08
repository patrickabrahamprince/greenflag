import Link from 'next/link';

export default function Support() {
  return (
    <div className="min-h-dvh bg-cream px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 text-ink">
        <h1 className="font-display text-3xl text-ink">Support</h1>
        <p className="text-sm leading-relaxed">
          Need help with GreenFlag? Email us at{' '}
          <a href="mailto:support@greenflag.app" className="text-gold-dark hover:underline">
            support@greenflag.app
          </a>{' '}
          and we&apos;ll get back to you as soon as we can.
        </p>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">Common Questions</h2>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ink">How do I report or block someone?</h3>
            <p className="text-sm leading-relaxed text-muted">
              Open their profile and use the Report or Block option. Blocking is immediate and
              permanent; reports are reviewed by our team.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ink">How do I delete my account?</h3>
            <p className="text-sm leading-relaxed text-muted">
              Go to Settings → Delete Account. This is permanent and doesn&apos;t require contacting
              support.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ink">I bought coins but my balance didn&apos;t update.</h3>
            <p className="text-sm leading-relaxed text-muted">
              Coin purchases are processed through Apple's In-App Purchase system. If a purchase
              completed but your balance looks wrong, email us with your purchase date and we&apos;ll
              investigate.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ink">How do I pause my account instead of deleting it?</h3>
            <p className="text-sm leading-relaxed text-muted">
              Go to Settings → Pause Account. Your profile is hidden and you&apos;re signed out, but
              everything is restored when you log back in.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">Safety</h2>
          <p className="text-sm leading-relaxed">
            If you feel unsafe or encounter abusive behavior, report it from the person&apos;s profile
            or email us directly at{' '}
            <a href="mailto:support@greenflag.app" className="text-gold-dark hover:underline">
              support@greenflag.app
            </a>
            . We review every report.
          </p>
        </section>

        <p className="flex gap-4">
          <Link href="/" className="text-sm text-gold-dark hover:underline">Back to GreenFlag</Link>
          <Link href="/privacy" className="text-sm text-gold-dark hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-sm text-gold-dark hover:underline">Terms</Link>
        </p>
      </div>
    </div>
  );
}
