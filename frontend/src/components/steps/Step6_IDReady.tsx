import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface Props {
  displayName: string;
  username: string;
  afroId: string;
  capturedImage: string | null;
}

export default function Step6_IDReady({ displayName, username, afroId, capturedImage }: Props) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const spokeRef = useRef(false);

  // Confetti particles
  useEffect(() => {
    const emojis = ['🎉', '✨', '🌟', '🎊', '💫', '🔥', '👑'];
    const pts = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      emoji: emojis[i % emojis.length],
    }));
    setParticles(pts);
  }, []);

  // Voice announcement
  useEffect(() => {
    if (spokeRef.current) return;
    spokeRef.current = true;
    if (window.speechSynthesis) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(
          `Welcome to Afro Social, ${displayName}! ` +
          `Your Afro ID is ready. You will be taken to your homepage in 5 seconds.`
        );
        u.rate = 0.9;
        u.pitch = 1.1;
        window.speechSynthesis.speak(u);
      }, 400);
    }
  }, [displayName]);

  // Countdown → redirect to /home (NOT /login)
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/home');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  function goNow() {
    window.speechSynthesis?.cancel();
    navigate('/home');
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12 overflow-hidden animate-fade-in">
      {/* Floating particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute pointer-events-none text-2xl animate-bounce"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.id * 0.15}s` }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Avatar */}
      <div
        className="relative w-28 h-28 rounded-full mb-6 shadow-2xl overflow-hidden border-4"
        style={{ borderColor: '#d4a017' }}
      >
        {capturedImage ? (
          <img src={capturedImage} alt="Your face" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: 'linear-gradient(135deg, #d4a017, #8b6508)' }}
          >
            ✊🏿
          </div>
        )}
        {/* Gold ring */}
        <div className="absolute inset-0 rounded-full border-4 border-afro-gold/30" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-1 text-center">
        Welcome, {displayName}! 🎉
      </h2>
      <p className="text-white/50 text-sm mb-8">@{username}</p>

      {/* Afro ID card */}
      <div
        className="w-full max-w-sm rounded-2xl px-6 py-5 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a3e 0%, #252550 50%, #1a1a3e 100%)',
          border: '1px solid rgba(212,160,23,0.4)',
          boxShadow: '0 0 40px rgba(212,160,23,0.15)',
        }}
      >
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #d4a017 0, #d4a017 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
              Afro-ID
            </span>
            <span className="text-xl">✊🏿</span>
          </div>
          <p
            className="text-xl font-mono font-bold tracking-wider"
            style={{ color: '#d4a017', letterSpacing: '0.12em' }}
          >
            {afroId}
          </p>
          <p className="text-xs text-white/30 mt-2">
            This is your unique identity on Afro Social Platform
          </p>
        </div>
      </div>

      {/* Countdown ring */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="#d4a017"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - countdown / 5)}`}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-afro-gold">
            {countdown}
          </span>
        </div>
        <p className="text-xs text-white/40">Redirecting to your homepage…</p>
      </div>

      <Button size="lg" fullWidth onClick={goNow} className="max-w-sm">
        Go to Homepage →
      </Button>
    </div>
  );
}
