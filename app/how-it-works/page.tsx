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
    title: 'Set Your Standards',
    description: 'Define what matters to you',
    points: [
      'Answer questions about your values, lifestyle, and interests',
      'Be specific about what you\'re looking for',
      'Your standards create the foundation for every match',
      'Update anytime from Settings as you learn more about yourself',
    ],
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Get Matched',
    description: 'See people who match your standards',
    points: [
      'GreenFlag\'s algorithm finds people who align with your values',
      'Each profile shows compatibility percentage and shared interests',
      'Swipe right to like someone, left to skip',
      'Both people must like each other to match',
    ],
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Day 1, 2, and 3 Flow',
    description: 'Three stages of genuine connection',
    points: [
      'Day 1 (Initial Match): You matched! See their full profile and decide if you want to message.',
      'Day 2 (First Exchange): Exchange 1-2 questions to learn about each other\'s values and personality.',
      'Day 3 (Real Connection): Share something personal (photo, voice note, or deeper question). Chemistry starts here.',
      'After Day 3, you can unlock video calls and continue however you want.',
    ],
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Smart Messaging',
    description: 'Built to encourage real conversation',
    points: [
      'First message is auto-generated based on your shared interests',
      'Each day, new conversation prompts help you go deeper',
      'You control the pace — no pressure to rush',
      'Block or report any profile at any time',
    ],
  },
  {
    icon: <Coins className="w-8 h-8" />,
    title: 'Coins System',
    description: 'Unlock premium features',
    points: [
      'Earn 10 free coins every week just for using the app',
      'Use coins to unlock special features like gifts or hidden photos',
      'Send thoughtful gifts to show you\'re interested',
      'Premium features help you stand out and connect faster',
      'Coins are optional — you can use the app for free',
    ],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Safety & Trust',
    description: 'Your security is our priority',
    points: [
      'All profiles are verified to ensure real people',
      'Block, report, or unmatch anyone at any time',
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
      <div className="sticky top-0 bg-base/80 backdrop-blur-sm border-b border-raised z-40">
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
          <Link
            href="/discover"
            className="inline-block px-8 py-3 bg-gold hover:bg-gold/90 text-ink font-medium rounded-lg transition-colors"
          >
            Start Discovering
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-16 pt-12 border-t border-raised">
          <h3 className="text-2xl font-display font-bold text-ink mb-6">Questions?</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Is GreenFlag really free?',
                a: 'Yes! You can use GreenFlag completely free. Coins are optional and let you unlock premium features, but you don\'t need them to match and message.',
              },
              {
                q: 'How often do I get matches?',
                a: 'It depends on how many people match your standards and vice versa. Most users get 1-3 matches per week, but it varies by location and preferences.',
              },
              {
                q: 'Can I skip someone and see them later?',
                a: 'Yes! If you swipe left on someone, they\'ll come back around in about a week.',
              },
              {
                q: 'What if I match with someone I\'m not interested in?',
                a: 'You can unmatch anytime. Just go to their chat, tap the three dots, and select "Unmatch."',
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
