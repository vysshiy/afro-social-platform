import React, { useEffect, useRef } from 'react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import Button from '../ui/Button';

interface Props {
  onNext: () => void;
}

const STATS = [
  { value: '2M+',  label: 'Members'  },
  { value: '54',   label: 'Countries' },
  { value: '180K', label: 'Creators'  },
];

const FEATURES = [
  {
    icon:  '🎙️',
    title: 'Voice Commands',
    desc:  'Say "next", "back", "skip" to navigate hands-free',
    color: '#d4a017',
  },
  {
    icon:  '🤳',
    title: 'Face Recognition',
    desc:  'AI reads your smile, eyes & expressions live',
    color: '#8b5cf6',
  },
  {
    icon:  '🌍',
    title: 'Afro Community',
    desc:  'Connect with creators & culture-lovers worldwide',
    color: '#10b981',
  },
];

export default function Step1_Welcome({ onNext }: Props) {
  const spokeRef = useRef(false);

  useVoiceCommands(true, cmd => {
    if (cmd === 'next' || cmd === 'capture') onNext();
  });

  useEffect(() => {
    if (spokeRef.current || !window.speechSynthesis) return;
    spokeRef.current = true;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(
        "Welcome to Afro Social Platform. Let's set up your account. " +
        'Say "next" to continue, or tap the button below.'
      );
      u.rate  = 0.92;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    }, 700);
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen overflow-hidden animate-fade-in"
      style={{ background: 'linear-gradient(160deg, #05050f 0%, #0a0a1a 55%, #0d0d22 100%)' }}
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-14 pb-6 px-6 text-center">
        {/* Logo */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-5 animate-glow"
          style={{
            background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 60%, #8b6508 100%)',
            boxShadow:  '0 0 0 8px rgba(212,160,23,0.1), 0 0 60px rgba(212,160,23,0.35)',
          }}
        >
          <span style={{ fontSize: 52 }}>✊🏿</span>
        </div>

        {/* Brand name */}
        <h1
          className="text-5xl font-bold tracking-tight leading-none mb-2"
          style={{
            background: 'linear-gradient(135deg, #d4a017 0%, #f59e0b 50%, #fffbe8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Afro Social
        </h1>
        <p
          className="text-xs font-semibold tracking-[0.3em] uppercase mb-1"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Connect · Create · Celebrate
        </p>
        <p className="text-sm mt-2 leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          The home of African culture, identity and community — powered by AI.
        </p>
      </div>

      {/* ── Stats bar ──────────────────────────────────────── */}
      <div className="mx-5 mb-6">
        <div
          className="flex items-center justify-around py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(212,160,23,0.08), rgba(212,160,23,0.04))',
            border:     '1px solid rgba(212,160,23,0.2)',
          }}
        >
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />
              )}
              <div className="text-center">
                <p
                  className="text-xl font-bold"
                  style={{ color: '#d4a017' }}
                >
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {s.label}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Feature cards ──────────────────────────────────── */}
      <div className="px-5 space-y-2.5 mb-7">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl animate-slide-up"
            style={{
              animationDelay: `${i * 0.08}s`,
              background: `rgba(255,255,255,0.03)`,
              border:     `1px solid ${f.color}28`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${f.color}18` }}
            >
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Voice hint ─────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div
          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl"
          style={{
            background: 'rgba(212,160,23,0.08)',
            border:     '1px solid rgba(212,160,23,0.22)',
          }}
        >
          <span className="mic-active rounded-full w-2 h-2 bg-afro-gold inline-block" />
          <span className="text-xs" style={{ color: 'rgba(212,160,23,0.85)' }}>
            🎙️ Say <strong className="text-afro-gold">"next"</strong> to begin with your voice
          </span>
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────── */}
      <div className="px-5 mt-auto pb-8">
        <Button size="xl" fullWidth onClick={onNext}>
          Get Started →
        </Button>

        <p className="mt-4 text-xs text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#d4a017' }} className="hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
