'use client';

import { Flag, Coins, Users, MessageCircle, Zap, Shield } from 'lucide-react';
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
    title: 'Discover & Host Any Trip',
    description: 'Road trips, weekend getaways, treks, beaches, and city escapes',
    points: [
      'Browse trips to Goa, Coorg, Gokarna, Rishikesh, Manali, Pondicherry, and beyond',
      'Host any trip: road trips, mountain treks, beach getaways, cafe crawls, or camping',
      'Choose between co-ed trips and verified female-only travel groups',
      'Set available spots, transport splits (bike, car, flight, train), and stay preferences',
    ],
  },
  {
    icon: <Flag className="w-8 h-8 text-emerald-400" />,
    title: 'Meet New People for Trips',
    description: 'Find companions for any adventure',
    points: [
      'Discover fellow explorers nearby or heading to the same destination',
      'Match on any travel vibe: Road trips, Treks, Beach, Foodie, Camping, Backpacking',
      'View verified profiles, travel photos, and travel bucket lists',
      'Connect directly to meet for trips with a single tap',
    ],
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Instant Trip Requests & Chat',
    description: 'Effortless coordination without friction',
    points: [
      'Apply to join any open trip with a friendly intro note',
      'Hosts review requests and approve travelers to join the crew',
      'Once accepted, direct 1-on-1 and group chat unlocks immediately',
      'Coordinate departure times, carpooling, and homestays smoothly',
    ],
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Direct Messaging',
    description: 'Stay connected before and after the trip',
    points: [
      'Chat directly with your travel companions',
      'Share packing tips, itinerary ideas, and meeting locations',
      'Stay friends and plan your next reunion adventure',
      'Block or report any profile anytime with instant safety moderation',
    ],
  },
  {
    icon: <Coins className="w-8 h-8" />,
    title: 'Fair & Transparent Travel',
    description: 'Split costs and support the community',
    points: [
      'Transparent daily budget expectations on every posted trip',
      'Easily split fuel, vehicle rentals, and homestay costs with your group',
      'Coins enable premium travel features and verified traveler status',
      'No hidden subscription fees — pay only for what you use',
    ],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Safety & Trust on the Road',
    description: 'Your security is always top priority',
    points: [
      'Phone verification and profile checks keep the community genuine',
      'Female-only trip filters ensure safe, comfortable journeys for women travelers',
      'Hosts have full control over who joins their trips',
      'Zero tolerance for misconduct, discrimination, or harassment',
    ],
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-dvh screen-gradient">
      {/* Header */}
      <div className="sticky top-safe-top bg-base/80 backdrop-blur-sm border-b border-raised z-40">
        <div className="max-w-app mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-semibold text-ink">How GreenFlag Works</h1>
          <Link href="/trips" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
            Explore Trips
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-ink mb-3">
            The Easiest Way to Meet New People for Trips
          </h2>
          <p className="text-ink/60">
            GreenFlag connects verified travelers for weekend getaways, road trips, and shared adventures. Never travel alone again.
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
          <p className="text-ink/60 mb-4">Ready to meet new people for your next trip?</p>
          <Link href="/trips" className="btn-primary inline-flex">
            Explore Trips
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-16 pt-12 border-t border-raised">
          <h3 className="text-2xl font-display font-bold text-ink mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: 'How do I meet new people for trips?',
                a: 'Browse open trips or host your own. You can filter by destination, travel style, and dates to find compatible travel companions heading your way.',
              },
              {
                q: 'How do trip requests work?',
                a: 'Send a request with an intro note. Once the host accepts your request, direct chat unlocks so you can coordinate itinerary, gear, and travel details.',
              },
              {
                q: 'Is it safe to travel with people I meet here?',
                a: 'Safety is our top priority. We verify profiles with phone numbers and identity checks. Hosts have complete control over who joins, and you can report or block anyone at any time.',
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
