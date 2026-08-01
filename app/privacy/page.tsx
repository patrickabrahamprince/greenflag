import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 text-ink">
        <h1 className="font-display text-3xl text-ink">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: August 1, 2026</p>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">1. Information We Collect</h2>
          <p>
            When you create an account, we collect the information you provide directly: your name,
            age, phone number, city, bio, and profile photos. We ask for your Instagram handle so our
            team can manually verify you&apos;re a real person before approving your profile — it is
            never shown to other users and is used only for that review.
          </p>
          <p>
            As you use GreenFlag, we collect the content you submit as part of a Standard (a written
            thought, a photo, or a voice recording), your quiz answers and stated interests, and
            records of your matches, messages, likes, and coin purchases and spending.
          </p>
          <p>
            With your permission, we use your device&apos;s location to suggest your city during
            profile setup — we only ever store the city, never your precise coordinates or address.
            We ask for camera, microphone, and photo library access only when you choose to add a
            photo or record a voice submission, and for notification permission to alert you about
            matches and messages.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">2. How We Use Your Information</h2>
          <p>
            We use your information to operate the app: showing your profile to compatible matches,
            running the Standard system (a woman sets three daily intentions; a man completes them to
            earn conversation), processing coin purchases, sending you notifications you&apos;ve
            enabled, reviewing new profiles for authenticity, and investigating reports of abuse.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">3. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We share data only with the service providers
            that make the app work: our database and authentication provider, our hosting provider,
            and — on iOS — Apple, which processes coin purchases through its In-App Purchase system
            and handles your payment details directly; we never see or store your card information.
            We may also disclose information when required by law or to protect the safety of our
            users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">4. Pausing and Deleting Your Account</h2>
          <p>
            You can pause your account at any time from Settings. Pausing signs you out and hides
            your profile from everyone else, but keeps your profile, matches, and messages exactly as
            they are — logging back in brings everything back.
          </p>
          <p>
            You can also permanently delete your account from Settings, without needing to contact
            support. Deleting is irreversible and erases your profile, photos, matches, messages,
            Standards and submissions, and coin transaction history. Any unused coin balance is
            forfeited and cannot be refunded. Some information may be retained where we&apos;re
            required to by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">5. Reporting and Blocking</h2>
          <p>
            Every profile can be reported or blocked directly from the app. Reports are reviewed by
            our team; blocking immediately and permanently prevents that person from seeing your
            profile or contacting you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">6. Your Rights</h2>
          <p>
            You can access, correct, or export your information, and request deletion of your account
            and data at any time, either through the app or by contacting us. Depending on where you
            live, you may have additional rights over how your information is used — contact us and
            we&apos;ll help.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">7. Children&apos;s Privacy</h2>
          <p>
            GreenFlag is not intended for anyone under 18. We do not knowingly collect information
            from anyone under 18, and we remove any account found to belong to a minor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">8. Contact Us</h2>
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
