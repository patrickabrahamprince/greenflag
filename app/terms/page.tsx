import Link from 'next/link';

export default function Terms() {
  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 text-ink">
        <h1 className="font-display text-3xl text-ink">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: June 28, 2026</p>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">1. Eligibility</h2>
          <p>
            You must be at least 18 years old to create an account or use GreenFlag. By using the
            app, you represent and warrant that you meet this age requirement and that all
            information you provide, including your date of birth, is accurate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">2. User Content</h2>
          <p>
            You are responsible for the content you post, including photos, bios, and messages. You
            retain ownership of your content but grant us a license to display and distribute it
            within the app as necessary to provide our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">3. Conduct</h2>
          <p>
            You agree not to harass, threaten, impersonate, or harm other users; not to post
            unlawful, abusive, or sexually explicit content; and not to use the app for commercial
            solicitation or fraudulent purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">4. Termination</h2>
          <p>
            We may suspend or terminate your account at any time, with or without notice, if you
            violate these Terms or if we believe your conduct poses a risk to other users or to
            GreenFlag.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">5. Limitation of Liability</h2>
          <p>
            GreenFlag is provided "as is" without warranties of any kind. We are not liable for any
            indirect, incidental, or consequential damages arising from your use of the app or your
            interactions with other users.
          </p>
        </section>

        <p>
          <Link href="/" className="text-gold-dark hover:underline">Back to GreenFlag</Link>
        </p>
      </div>
    </div>
  );
}
