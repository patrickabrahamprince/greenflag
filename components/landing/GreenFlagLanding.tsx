'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Users,
  Star,
  ArrowRight,
  Check,
  Menu,
  X,
  Twitter,
  Instagram,
  Facebook,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Stories', href: '#testimonials' },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Matching',
    description:
      "Our compatibility engine learns what actually matters to you — values, vibe, and vision — so every match is one worth a real conversation.",
  },
  {
    icon: BadgeCheck,
    title: 'Verified Profiles',
    description:
      'Every profile is photo-verified with on-device liveness checks. No catfish, no bots — just real people who are who they say they are.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety First',
    description:
      'Built-in check-ins, one-tap location sharing on dates, and 24/7 moderation mean you can focus on the connection, not the risk.',
  },
  {
    icon: Heart,
    title: 'Green Flag Score',
    description:
      'A transparent trust signal on every profile, built from verified behavior — not vanity metrics — so healthy relationships start on the right foot.',
  },
  {
    icon: Users,
    title: 'Curated Daily Picks',
    description:
      "No endless swiping. Just a handful of thoughtfully chosen matches delivered every day, so quality always beats quantity.",
  },
  {
    icon: Star,
    title: 'Icebreakers That Work',
    description:
      'AI-suggested conversation starters based on shared interests — because "hey" has never gotten anyone a second date.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      "I matched with my now-partner in the first week. The verification badge alone made me trust the app enough to actually show up to a date.",
    name: 'Priya S.',
    role: 'Matched in Mumbai',
    rating: 5,
  },
  {
    quote:
      'Finally a dating app that filters for red flags instead of just faces. The Green Flag Score genuinely changed how I vet matches.',
    name: 'Arjun M.',
    role: 'Matched in Bangalore',
    rating: 5,
  },
  {
    quote:
      "The safety check-ins on my first few dates gave my friends real peace of mind. Small feature, huge difference in how safe I felt.",
    name: 'Ananya R.',
    role: 'Matched in Delhi',
    rating: 5,
  },
]

const PRICING_TIERS = [
  {
    name: 'Free',
    tagline: 'Get started, no strings attached',
    monthly: 0,
    yearly: 0,
    cta: 'Get started',
    highlighted: false,
    features: [
      '5 curated matches a day',
      'Verified profile badge',
      'Basic safety check-ins',
      'Standard messaging',
    ],
  },
  {
    name: 'Plus',
    tagline: 'For people serious about finding someone',
    monthly: 599,
    yearly: 4999,
    cta: 'Upgrade to Plus',
    highlighted: true,
    features: [
      'Unlimited curated matches',
      'See who green-flagged you',
      'Priority safety support',
      'Advanced filters & preferences',
      'Read receipts',
    ],
  },
  {
    name: 'Gold',
    tagline: 'The full GreenFlag experience',
    monthly: 999,
    yearly: 8999,
    cta: 'Go Gold',
    highlighted: false,
    features: [
      'Everything in Plus',
      'Top-of-stack visibility boost',
      'Monthly compatibility insights',
      'Dedicated safety concierge',
      'Early access to new features',
    ],
  },
]

const STATS = [
  { value: '2.4M+', label: 'Verified profiles' },
  { value: '89%', label: 'Report feeling safer' },
  { value: '340K+', label: 'Real connections made' },
  { value: '4.8/5', label: 'App Store rating' },
]

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
      {children}
    </span>
  )
}

function GradientOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-[100px] opacity-40',
        className
      )}
    />
  )
}

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-well/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gold flex items-center justify-center">
            <Heart className="h-5 w-5 text-ink fill-ink" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">GreenFlag</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink/60 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-ink">
            Sign in
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-well px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-ink/70"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-4">
              <Link href="/login" className="text-sm font-medium text-ink/70">
                Sign in
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="primary" size="default" className="w-full">Get started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
      <GradientOrb className="left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 bg-gold/30" />
      <GradientOrb className="right-[-10%] top-1/3 h-[360px] w-[360px] bg-[#45050C]/50" />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mb-6 flex justify-center animate-fade-in">
          <SectionBadge>
            <Sparkles className="h-3.5 w-3.5" />
            Dating, without the guesswork
          </SectionBadge>
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Find people worth
          <span className="bg-gradient-to-r from-gold via-[#FF5C7A] to-gold bg-clip-text text-transparent">
            {' '}building something{' '}
          </span>
          real with
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-ink/60 md:text-lg">
          GreenFlag verifies every profile, filters for genuine compatibility, and keeps you
          safe from the first message to the first date — so you can stop swiping and start
          connecting.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="shadow-glow-crimson">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="secondary" size="lg">See how it works</Button>
          </a>
        </div>

        <p className="mt-4 text-xs text-ink/40">No credit card required · Free forever plan</p>

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute inset-0 -z-10 translate-y-8 scale-95 rounded-card bg-gradient-to-br from-gold/40 to-[#45050C]/40 blur-3xl" />
          <div className="rounded-card border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-2 shadow-depth-xl backdrop-blur">
            <div className="overflow-hidden rounded-[20px] border border-white/10 bg-surface">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsStrip() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] px-6 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-semibold text-ink md:text-3xl">{stat.value}</div>
            <div className="mt-1 text-xs text-ink/50 md:text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge>Built different</SectionBadge>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Everything you need to date with confidence
          </h2>
          <p className="mt-4 text-ink/60">
            We rebuilt dating from the ground up around three things every good match needs:
            genuine compatibility, verified trust, and real safety.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-card border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 shadow-flat-dark transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-glow-crimson"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden px-6 py-24 md:py-32">
      <GradientOrb className="left-[-10%] top-0 h-[400px] w-[400px] bg-[#45050C]/40" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge>Loved by real people</SectionBadge>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Stories, not just swipes
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-card border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-depth-md"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/75">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-[#45050C] text-xs font-semibold text-ink">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  <div className="text-xs text-ink/45">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge>Simple pricing</SectionBadge>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Start free. Upgrade when you're ready.
          </h2>
          <p className="mt-4 text-ink/60">
            No hidden fees. Cancel anytime. Every plan includes profile verification and core
            safety features.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <span className={cn('text-sm', !yearly ? 'text-ink' : 'text-ink/50')}>Monthly</span>
          <button
            onClick={() => setYearly((v) => !v)}
            className="relative h-7 w-12 rounded-pill bg-white/10 transition-colors"
            aria-label="Toggle billing period"
          >
            <span
              className={cn(
                'absolute top-0.5 h-6 w-6 rounded-full bg-gold shadow-glow-crimson transition-transform',
                yearly ? 'translate-x-[22px]' : 'translate-x-0.5'
              )}
            />
          </button>
          <span className={cn('text-sm', yearly ? 'text-ink' : 'text-ink/50')}>
            Yearly <span className="text-gold">· save ~30%</span>
          </span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const price = yearly ? tier.yearly : tier.monthly
            return (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col rounded-card border p-8 shadow-depth-md',
                  tier.highlighted
                    ? 'border-gold/40 bg-gradient-to-b from-gold/10 via-white/[0.04] to-transparent shadow-glow-crimson'
                    : 'border-white/10 bg-white/[0.03]'
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-gold px-4 py-1 text-xs font-semibold text-ink">
                    Most popular
                  </span>
                )}

                <h3 className="text-lg font-semibold text-ink">{tier.name}</h3>
                <p className="mt-1 text-sm text-ink/50">{tier.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-ink">
                    {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                  </span>
                  {price !== 0 && (
                    <span className="text-sm text-ink/45">/{yearly ? 'year' : 'month'}</span>
                  )}
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="w-full">
                  <Button
                    variant={tier.highlighted ? 'primary' : 'secondary'}
                    size="default"
                    className="mt-8 w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-card border border-gold/20 bg-gradient-to-br from-gold/20 via-well to-[#45050C]/30 px-8 py-16 text-center shadow-depth-xl md:py-20">
        <GradientOrb className="left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 bg-gold/40" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Your green flag is waiting
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink/60">
            Join millions who've stopped settling for red flags. Verified, safe, and built for
            real connection.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="shadow-glow-crimson">
                Create your profile <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Safety', 'Success stories'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Blog'],
  },
  {
    title: 'Support',
    links: ['Help center', 'Community guidelines', 'Contact us', 'Trust & safety'],
  },
  {
    title: 'Legal',
    links: ['Privacy policy', 'Terms of service', 'Cookie policy'],
  },
]

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-well px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gold flex items-center justify-center">
                <Heart className="h-4 w-4 text-ink fill-ink" />
              </div>
              <span className="text-lg font-semibold text-ink">GreenFlag</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink/50">
              Dating that starts with trust. Verified profiles, real safety, genuine
              connections.
            </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink/50 transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-ink/50 hover:text-ink">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-ink/40">
            © {new Date().getFullYear()} GreenFlag. All rights reserved.
          </p>
          <p className="text-xs text-ink/40">Made with care, for real connections.</p>
        </div>
      </div>
    </footer>
  )
}

export default function GreenFlagLanding() {
  return (
    <div className="min-h-dvh bg-well font-sans text-ink antialiased">
      <Nav />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
