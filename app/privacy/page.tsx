import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 text-ink">
        <h1 className="font-display text-3xl text-ink">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: June 28, 2026</p>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">1. Information We Collect</h2>
          <p>
            When you use GreenFlag, we collect information you provide directly, such as your name,
            date of birth, phone number, photos, bio, and preferences. We also collect usage data,
            device information, and approximate location to power matching and discovery features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">2. How We Use Your Information</h2>
          <p>
            We use your information to operate and improve the app, match you with other users,
            personalize your experience, communicate with you, and maintain the safety and security
            of our community.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">3. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share limited information with service
            providers who help us operate the app (such as hosting and analytics providers), or when
            required by law, to protect our rights, or to prevent fraud and abuse.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">4. Data Retention and Deletion</h2>
          <p>
            We retain your information for as long as your account is active. You may request
            deletion of your account and associated data at any time by contacting us. Some
            information may be retained as required by law or for legitimate business purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">5. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data rights,
            please contact us at support@greenflag.app.
          </p>
        </section>

        <p>
          <Link href="/" className="text-gold-dark hover:underline">Back to GreenFlag</Link>
        </p>
      </div>
    </div>
  );
}
