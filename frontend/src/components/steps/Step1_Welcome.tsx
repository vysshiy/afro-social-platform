import React, { useEffect, useRef } from 'react';
import Button from '../ui/Button';

interface Props {
  onNext: () => void;
}

const FEATURES = [
  { icon: '🎙️', title: 'Voice Commands', desc: 'Control registration with your voice' },
  { icon: '🤳', title: 'Face Recognition', desc: 'Secure biometric identity capture' },
  { icon: '🌍', title: 'Afro Community', desc: 'Connect with culture & creativity' },
];

export default function Step1_Welcome({ onNext }: Props) {
  const hasSpokeRef = useRef(false);

  useEffect(() => {
    if (hasSpokeRef.current) return;
    hasSpokeRef.current = true;
    // Welcome voice greeting
    if (window.speechSynthesis) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(
          "Welcome to Afro Social Platform. Let's set up your account. " +
          'You can use voice commands throughout this process. ' +
          'Say "next" to continue, or tap the button below.'
        );
        u.rate = 0.92;
        u.pitch = 1.05;
        window.speechSynthesis.speak(u);
      }, 600);
    }
    return () => window.speechSynthesis?.cancel();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 animate-fade-in">
      {/* Logo / Hero */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 50%, #8b6508 100%)',
          }}
        >
          <span className="text-4xl">✊🏿</span>
        </div>
        <h1
          className="text-4xl font-bold mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #d4a017, #f59e0b, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Afro Social
        </h1>
        <p className="text-white/50 text-sm tracking-widest uppercase">
          Connect · Create · Celebrate
        </p>
      </div>

      {/* Feature cards */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="glass-card flex items-center gap-4 px-5 py-4 animate-slide-up"
          >
            <span className="text-2xl flex-shrink-0">{f.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-white/50">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Voice hint */}
      <p className="text-xs text-white/30 mb-6 text-center">
        Say <span className="text-afro-gold font-semibold">"next"</span> or tap below to begin
      </p>

      <Button size="lg" fullWidth onClick={onNext} className="max-w-sm">
        Get Started →
      </Button>

      <p className="mt-6 text-xs text-white/25 text-center">
        Already have an account?{' '}
        <a href="/login" className="text-afro-gold hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
