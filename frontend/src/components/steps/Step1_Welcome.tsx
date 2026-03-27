import React, { useEffect, useRef } from 'react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import Button from '../ui/Button';

interface Props {
  onNext: () => void;
}

const FEATURES = [
  {
    icon: '🎙️',
    title: 'Voice Commands',
    desc: 'Say "next", "back", "skip" — your voice drives the flow',
    color: '#d4a017',
  },
  {
    icon: '🤳',
    title: 'Face Recognition',
    desc: 'AI detects your smile, eyes, and expressions',
    color: '#8b5cf6',
  },
  {
    icon: '🌍',
    title: 'Afro Community',
    desc: 'Millions of creators, thinkers & culture lovers',
    color: '#10b981',
  },
];

export default function Step1_Welcome({ onNext }: Props) {
  const spokeRef = useRef(false);

  // Wire voice commands — "next" / "continue" will call onNext
  useVoiceCommands(true, cmd => {
    if (cmd === 'next' || cmd === 'capture') onNext();
  });

  useEffect(() => {
    if (spokeRef.current) return;
    spokeRef.current = true;
    if (!window.speechSynthesis) return;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(
        "Welcome to Afro Social Platform. Let's set up your account. " +
        'You can use voice commands throughout registration. ' +
        'Say "next" to continue, or tap the button below.'
      );
      u.rate  = 0.92;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    }, 600);
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 animate-fade-in">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-5 animate-glow"
          style={{
            background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 60%, #8b6508 100%)',
            boxShadow: '0 0 40px rgba(212,160,23,0.4)',
          }}
        >
          <span className="text-5xl">✊🏿</span>
        </div>

        <h1
          className="text-5xl font-bold mb-2 tracking-tight leading-none"
          style={{
            background: 'linear-gradient(135deg, #d4a017, #f59e0b, #fffbe8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Afro Social
        </h1>
        <p className="text-white/40 text-xs tracking-[0.25em] uppercase mt-2">
          Connect · Create · Celebrate
        </p>
      </div>

      {/* Feature cards */}
      <div className="w-full max-w-sm space-y-2.5 mb-10">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="animate-slide-up flex items-center gap-4 px-4 py-3.5 rounded-2xl"
            style={{
              animationDelay: `${i * 0.1}s`,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${f.color}30`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${f.color}18` }}
            >
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-white/45 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Voice hint */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs"
        style={{
          background: 'rgba(212,160,23,0.1)',
          border: '1px solid rgba(212,160,23,0.25)',
          color: 'rgba(212,160,23,0.85)',
        }}
      >
        <span>🎙️</span>
        Say <strong className="mx-1">"next"</strong> to begin
      </div>

      <Button size="xl" fullWidth onClick={onNext} className="max-w-sm">
        Get Started →
      </Button>

      <p className="mt-6 text-xs text-white/25">
        Already have an account?{' '}
        <a href="/login" className="text-afro-gold hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
