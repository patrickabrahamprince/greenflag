'use client';

import { Heart, Coins, Users, MessageCircle, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

interface Section {
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
}

const SECTIONS: Section[] = [
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Set Your Standard',
    description: 'What she defines, he earns',
    points: [
      'Women define a 3-day Standard — the bar he needs to meet to earn a conversation',
      'Each day: one thought, one image, one voice',
      'Men discover curated profiles and complete each day\'s Standard to show real intention',
      'Standards can be updated anytime before they go live',
    ],
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Discover Profiles',
    description: 'Curated, not endless',
    points: [
      'Men browse curated profiles of women who are active and approved',
      'Coins unlock a profile, its photos, or a conversation',
      'Every profile is reviewed before it goes live, to keep things real',
    ],
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: '3 Days, 3 Intentions',
    description: 'How a Standard actually works',
    points: [
      'He completes all three intentions for a day before she sees anything — no half-effort',
      'She reviews and decides each day. Reject at any point and the connection ends',
      'No second attempt on the same day if she says no',
      'Complete all three days with her approval, and the conversation unlocks',
    ],
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Smart Messaging',
    description: 'Built to encourage real conversation',
    points: [
      'A first message can be generated for you based on shared interests',
      'Each day, new conversation prompts help you go deeper',
      'You control the pace — no pressure to rush',
      'Block or report any profile at any time',
    ],
  },
  {
    icon: <Coins className="w-8 h-8" />,
    title: 'Coins System',
    description: 'Unlock conversations',
    points: [
      'Coins unlock profiles, photos, and conversations — 500 coins unlocks one profile',
      'Coins are purchased directly in the app through the App Store',
      'Your coin balance is always visible in the app',
    ],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Safety & Trust',
    description: 'Your security is our priority',
    points: [
      'All profiles are reviewed before approval to keep the community real',
      'Block or report anyone at any time',
      'Your photos and personal info are never shared unless you choose to',
      'Never share payment info via messaging',
      'If something feels off, report it immediately',
    ],
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-dvh screen-gradient">
      {/* Header */}
      <div className="sticky top-safe-top bg-base/80 backdrop-blur-sm border-b border-raised z-40">
        <div className="max-w-app mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-semibold text-ink">How It Works</h1>
          <Link href="/discover" className="text-gold hover:text-gold/90 text-sm font-medium">
            Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-ink mb-3">
            Set your standards. Meet your match.
          </h2>
          <p className="text-ink/60">
            GreenFlag makes it easy to find people who share your values
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, idx) => (
            <div
              key={idx}
              className="bg-card rounded-2xl border border-raised p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{section.title}</h3>
                  <p className="text-sm text-ink/60 mt-0.5">{section.description}</p>
                </div>
              </div>

              <ul className="space-y-3 ml-16">
                {section.points.map((point, pidx) => (
                  <li key={pidx} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                    <p className="text-ink/80 text-sm leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-ink/60 mb-4">Ready to find your match?</p>
          <Link href="/discover" className="btn-primary inline-flex">
            Start Discovering
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-16 pt-12 border-t border-raised">
          <h3 className="text-2xl font-display font-bold text-ink mb-6">Questions?</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Is GreenFlag free to join?',
                a: 'Creating a profile and browsing is free. Coins are required to unlock a profile, its photos, or a conversation — 500 coins unlocks one profile.',
              },
              {
                q: 'What does a woman actually do on GreenFlag?',
                a: 'She defines a 3-day Standard — one thought, one image, one voice per day — and reviews what he submits each day before deciding whether the conversation unlocks.',
              },
              {
                q: 'What if I\'m not interested in someone?',
                a: 'You can block or report any profile at any time, and reject a Standard submission on any day to end the connection.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group bg-card rounded-lg border border-raised p-4 cursor-pointer"
              >
                <summary className="font-medium text-ink flex items-center justify-between">
                  {faq.q}
                  <span className="text-ink/60 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-ink/80 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
