import Link from 'next/link';

export default function DeleteAccount() {
  return (
    <div className="min-h-dvh bg-cream px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 text-ink">
        <h1 className="font-display text-3xl text-ink">Delete Your Account</h1>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">How to delete your account</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed">
            <li>Open the GreenFlag app and sign in.</li>
            <li>Go to <strong>Settings</strong>.</li>
            <li>Tap <strong>Delete Account</strong>.</li>
            <li>Confirm the deletion.</li>
          </ol>
          <p className="text-sm leading-relaxed text-muted">
            Deletion happens immediately when you confirm — there is no waiting period, and you
            don&apos;t need to contact support to complete it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">What gets deleted</h2>
          <p className="text-sm leading-relaxed">
            Deleting your account permanently removes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
            <li>Your profile, including all uploaded photos</li>
            <li>Your matches and connections</li>
            <li>All your messages and conversation history</li>
            <li>Your task/standard submissions</li>
            <li>Your coin wallet and purchase/transaction history</li>
            <li>Your account credentials and sign-in record</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted">
            This is a full, permanent deletion — nothing above is retained or recoverable once
            it&apos;s confirmed, and none of it is kept on any automatic schedule.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">Not ready to delete everything?</h2>
          <p className="text-sm leading-relaxed">
            Go to <strong>Settings → Pause Account</strong> instead. Your profile is hidden and
            you&apos;re signed out, but nothing is deleted — everything is restored when you log
            back in.
          </p>
        </section>

        <p className="text-sm leading-relaxed">
          Questions about account deletion? Email{' '}
          <a href="mailto:support@greenflag.app" className="text-gold-dark hover:underline">
            support@greenflag.app
          </a>
          .
        </p>

        <p className="flex gap-4">
          <Link href="/" className="text-sm text-gold-dark hover:underline">Back to GreenFlag</Link>
          <Link href="/support" className="text-sm text-gold-dark hover:underline">Support</Link>
          <Link href="/privacy" className="text-sm text-gold-dark hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
