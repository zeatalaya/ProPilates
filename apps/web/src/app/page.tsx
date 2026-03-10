"use client";

import Link from "next/link";
import {
  Layers,
  Play,
  ShoppingBag,
  ShieldCheck,
  Music,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Class Builder",
    desc: "Drag-and-drop builder with 150+ Pilates exercises across 8 apparatus types.",
  },
  {
    icon: Play,
    title: "Teaching Mode",
    desc: "Live teaching view with timer rings, exercise cues, and block progress tracking.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    desc: "Buy and sell class portfolios as NFTs on XION blockchain.",
  },
  {
    icon: ShieldCheck,
    title: "Credential Verification",
    desc: "Verify BASI, STOTT, or Balanced Body certifications on-chain via ZK proofs.",
  },
  {
    icon: Music,
    title: "Spotify Integration",
    desc: "Connect your Spotify account and control music directly during teaching.",
  },
  {
    icon: Zap,
    title: "Gasless UX",
    desc: "XION account abstraction means no gas fees and no seed phrases.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        {/* Gradient orb */}
        <div className="pointer-events-none absolute top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[128px]" />

        <div className="relative z-10 max-w-3xl">
          <img
            src="/propilates-logo.svg"
            alt="ProPilates"
            className="mx-auto mb-8 h-14 md:h-20"
          />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400">
            <Zap size={14} />
            Powered by XION Blockchain
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl">
            Your Pilates
            <span className="block bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              Studio, On-Chain
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-text-secondary">
            Build classes with 150+ exercises. Teach with live timers and
            Spotify. Monetize your expertise through blockchain-powered
            portfolios.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="btn-primary px-8 py-3 text-lg"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link href="/builder" className="btn-secondary px-8 py-3 text-lg">
              Try Class Builder
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Everything You Need
          </h2>
          <p className="mx-auto mb-16 max-w-lg text-center text-text-secondary">
            A complete platform for modern Pilates instructors who want to
            build, teach, and earn.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="glass-card group p-6 transition-all hover:border-violet-500/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/15 text-violet-400 transition-colors group-hover:bg-violet-600/25">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-border px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-bold">
            Simple Pricing
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="glass-card p-8">
              <div className="mb-2 text-sm font-medium text-text-secondary">
                Free
              </div>
              <div className="mb-6 text-4xl font-bold">$0</div>
              <ul className="mb-8 space-y-3 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  Build unlimited classes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  150+ exercise library
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  Teaching mode
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-text-muted">&#10007;</span>
                  <span className="text-text-muted">Save classes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-text-muted">&#10007;</span>
                  <span className="text-text-muted">Marketplace access</span>
                </li>
              </ul>
              <Link href="/onboarding" className="btn-secondary w-full text-center">
                Start Free
              </Link>
            </div>

            {/* Premium */}
            <div className="glass-card relative overflow-hidden border-violet-500/30 p-8">
              <div className="absolute right-4 top-4 rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">
                Popular
              </div>
              <div className="mb-2 text-sm font-medium text-violet-400">
                Premium
              </div>
              <div className="mb-6 text-4xl font-bold">
                $4.99 <span className="text-lg text-text-secondary">USDC/mo</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  Save unlimited classes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  List on marketplace
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  Spotify integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">&#10003;</span>
                  On-chain credential badges
                </li>
              </ul>
              <Link href="/onboarding" className="btn-primary w-full text-center">
                Go Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-text-muted">
        ProPilates &middot; Built on XION
      </footer>
    </div>
  );
}
