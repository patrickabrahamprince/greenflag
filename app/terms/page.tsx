'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-dvh bg-cream px-4 pt-safe-top pb-12">
      <div className="mx-auto max-w-2xl space-y-6 text-ink">
        <div className="pt-4 pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-ink/70 hover:text-ink active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <h1 className="font-display text-3xl text-ink">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: August 1, 2026</p>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">1. Eligibility</h2>
          <p className="text-sm leading-relaxed">
            You must be at least 18 years old to create an account or use GreenFlag. By using the
            app, you represent and warrant that you meet this age requirement and that all
            information you provide is accurate. New profiles are reviewed before approval, and we
            may reject or remove any account we believe does not meet this requirement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">2. User Content</h2>
          <p className="text-sm leading-relaxed">
            You are responsible for the content you post, including photos, bios, and the thoughts,
            photos, and voice recordings you submit as part of a Standard. You retain ownership of
            your content but grant us a license to display and distribute it within the app as
            necessary to provide our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">3. Conduct, Reporting, and Blocking</h2>
          <p className="text-sm leading-relaxed">
            You agree not to harass, threaten, impersonate, or harm other users; not to post
            unlawful, abusive, or sexually explicit content; and not to use the app for commercial
            solicitation or fraudulent purposes. Every profile can be reported or blocked directly
            from the app, and we review every report we receive.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">4. Coins and Purchases</h2>
          <p className="text-sm leading-relaxed">
            Coins are a virtual currency used within GreenFlag to unlock conversations and other
            features. On iOS, coins are purchased through Apple&apos;s In-App Purchase system and are
            subject to Apple&apos;s own terms and refund policies in addition to these Terms. Coins
            have no cash value, cannot be transferred, exchanged, or redeemed for money, and are
            forfeited without compensation if your account is deleted or terminated. Purchases are
            generally final; refund requests for App Store purchases are handled by Apple.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">5. Your Account</h2>
          <p className="text-sm leading-relaxed">
            You can pause your account at any time to temporarily hide your profile without losing
            any data, or permanently delete it — both from Settings, without needing to contact
            support. We may also suspend or terminate your account at any time, with or without
            notice, if you violate these Terms or if we believe your conduct poses a risk to other
            users or to GreenFlag.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">6. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed">
            GreenFlag is provided &quot;as is&quot; without warranties of any kind. We are not liable
            for any indirect, incidental, or consequential damages arising from your use of the app or
            your interactions with other users. We do not perform criminal background checks on users
            and cannot guarantee the identity, intentions, or conduct of anyone you interact with.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">7. Changes to These Terms</h2>
          <p className="text-sm leading-relaxed">
            We may update these Terms from time to time. If we make material changes, we&apos;ll
            notify you in the app or by other reasonable means before they take effect. Continuing to
            use GreenFlag after a change means you accept the updated Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl text-ink">8. Governing Law</h2>
          <p className="text-sm leading-relaxed">
            These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of
            law principles.
          </p>
        </section>

        <div className="pt-6 border-t border-ink/10 flex gap-4">
          <button onClick={handleBack} className="text-sm text-gold-dark font-medium hover:underline">
            ← Back
          </button>
          <Link href="/privacy" className="text-sm text-gold-dark hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
