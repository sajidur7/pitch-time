'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { TEAMS } from '@/lib/teams-data';
import { ArrowRight, Bell, Clock, ShieldCheck, Zap } from 'lucide-react';
import { formatMatchKickoff, getDetectedTimezone } from '@/lib/timezone';
import { getMockMatches } from '@/lib/matches-data';

export function LandingView() {
  const { loginWithGoogle } = useUser();
  const [demoEmail, setDemoEmail] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const detectedTz = getDetectedTimezone();
  const sampleMatches = getMockMatches().slice(0, 3);

  const handleGoogleSignIn = () => {
    loginWithGoogle(demoEmail || undefined);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Editorial Index Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-xs tracking-wider uppercase text-neutral-600 font-mono">
          <span className="status-dot" />
          <span>INDEX NO. 2026-FTBL</span>
          <span>•</span>
          <span>UCL • PREMIER LEAGUE • LA LIGA</span>
        </div>

        <div className="hairline-b pb-8 pt-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[-0.04em] uppercase leading-[1.05] text-black">
            Never Miss <br />
            <span className="font-normal italic">Kickoff</span> Again.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-700 max-w-2xl font-light tracking-tight leading-relaxed">
            Matches auto-converted to your local time + instant 10-minute alerts.
            A monumental typographic football ledger designed for passionate supporters.
          </p>
        </div>
      </div>

      {/* Hero Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-8">
        {/* Left Column: Sign-in CTA & Features */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                className="w-full group flex items-center justify-between px-6 py-4 bg-black text-white hover:bg-neutral-900 transition-all hairline-all font-mono text-sm tracking-tight"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(!showCustomEmailInput)}
                  className="text-xs text-neutral-600 hover:text-black font-mono underline underline-offset-4"
                >
                  {showCustomEmailInput ? 'Cancel custom email' : 'Sign in with custom email / test account'}
                </button>
              </div>

              {showCustomEmailInput && (
                <div className="p-4 bg-neutral-50 hairline-all space-y-3">
                  <label className="block text-xs uppercase font-mono text-neutral-600">
                    Enter Email Address
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      placeholder="supporter@example.com"
                      className="flex-1 px-3 py-2 text-sm bg-white hairline-all focus:outline-none focus:ring-1 focus:ring-black font-mono"
                    />
                    <button
                      onClick={handleGoogleSignIn}
                      className="px-4 py-2 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800"
                    >
                      Enter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Micro value props */}
            <div className="space-y-3 pt-4 hairline-t">
              <div className="flex items-start space-x-3 text-xs font-mono text-neutral-700">
                <Clock className="w-4 h-4 mt-0.5 text-black shrink-0" />
                <span>Auto-detected timezone: <strong className="text-black font-semibold">{detectedTz}</strong></span>
              </div>
              <div className="flex items-start space-x-3 text-xs font-mono text-neutral-700">
                <Bell className="w-4 h-4 mt-0.5 text-black shrink-0" />
                <span>Web Push alerts: 10 mins before kickoff + live match start</span>
              </div>
              <div className="flex items-start space-x-3 text-xs font-mono text-neutral-700">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-black shrink-0" />
                <span>Select up to 5 favorite clubs from UCL, EPL, and La Liga</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            SECURE ACCESS • WEB PUSH V2 COMPLIANT • ZERO NOISE
          </div>
        </div>

        {/* Right Column: Marquee Live Ledger Teaser */}
        <div className="lg:col-span-7">
          <div className="hairline-all bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-4 hairline-b">
              <div className="flex items-center space-x-2 font-mono text-xs text-neutral-600">
                <span className="status-dot status-dot-pulse" />
                <span className="font-medium text-black">UPCOMING FIXTURES LEDGER</span>
              </div>
              <span className="font-mono text-xs text-neutral-500">
                CONVERTED TO {detectedTz.split('/')[1] || detectedTz}
              </span>
            </div>

            {/* Mini preview rows */}
            <div className="divide-y divide-black/10">
              {sampleMatches.map((m, idx) => {
                const kickoffInfo = formatMatchKickoff(m.utcKickoff, detectedTz);
                return (
                  <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-black text-white uppercase">
                          {m.competition}
                        </span>
                        <span className="text-xs font-mono text-neutral-500">{kickoffInfo.fullStr}</span>
                      </div>
                      <div className="text-base font-light tracking-tight text-black flex items-center space-x-2">
                        <span className="font-normal">{m.homeTeam.name}</span>
                        <span className="text-neutral-400 font-mono text-xs">vs</span>
                        <span className="font-normal">{m.awayTeam.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 text-xs font-mono hairline-all bg-neutral-50">
                        {kickoffInfo.relativeBadge}
                      </span>
                      <Bell className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-2 hairline-t text-right">
              <span className="text-xs font-mono text-neutral-600">
                Sign in to customize clubs, receive real-time push notifications & access all fixtures →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="hairline-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
        <div>19–86 ARCHITECTURAL LEDGER • PITCH TIME © 2026</div>
        <div>ENGLISH PREMIER LEAGUE • LA LIGA • UEFA CHAMPIONS LEAGUE</div>
      </div>
    </div>
  );
}
