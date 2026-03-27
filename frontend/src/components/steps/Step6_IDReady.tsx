import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface Props {
  displayName:  string;
  username:     string;
  afroId:       string;
  capturedImage: string | null;
}

const CONFETTI = [
  '🎉','✨','🌟','🎊','💫','🔥','👑','🎈','🌍','💎','🥂','🏆',
];

export default function Step6_IDReady({ displayName, username, afroId, capturedImage }: Props) {
  const navigate    = useNavigate();
  const [countdown, setCountdown] = useState(6);
  const [copied,    setCopied]    = useState(false);
  const spokeRef    = useRef(false);

  // Confetti positions (stable)
  const confetti = useRef(
    CONFETTI.map((emoji, i) => ({
      emoji,
      left:  `${5 + (i * 8) % 90}%`,
      top:   `${3  + (i * 13) % 45}%`,
      delay: `${i * 0.12}s`,
      size:  i % 3 === 0 ? '1.6rem' : '1.2rem',
    }))
  ).current;

  // Voice announcement
  useEffect(() => {
    if (spokeRef.current || !window.speechSynthesis) return;
    spokeRef.current = true;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(
        `Congratulations ${displayName}! Your Afro ID is ready. ` +
        `You're being taken to your homepage in a few seconds.`
      );
      u.rate  = 0.9;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }, 500);
  }, [displayName]);

  // Countdown → /home
  useEffect(() => {
    if (countdown <= 0) { navigate('/home'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  function copyId() {
    navigator.clipboard.writeText(afroId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function goNow() {
    window.speechSynthesis?.cancel();
    navigate('/home');
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden animate-fade-in"
         style={{ background: 'linear-gradient(160deg,#05050f 0%,#0a0a1a 50%,#0d0d20 100%)' }}>

      {/* Confetti */}
      {confetti.map((c, i) => (
        <span
          key={i}
          className="absolute pointer-events-none animate-bounce-slow"
          style={{ left: c.left, top: c.top, animationDelay: c.delay, fontSize: c.size, opacity: 0.7 }}
        >
          {c.emoji}
        </span>
      ))}

      {/* Avatar */}
      <div className="relative mb-6 animate-scale-in">
        <div
          className="w-28 h-28 rounded-full overflow-hidden"
          style={{
            border: '3px solid #d4a017',
            boxShadow: '0 0 0 6px rgba(212,160,23,0.12), 0 0 40px rgba(212,160,23,0.3)',
          }}
        >
          {capturedImage ? (
            <img src={capturedImage} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg,#d4a017,#8b6508)' }}
            >
              ✊🏿
            </div>
          )}
        </div>
        {/* Verified badge */}
        <div
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ background: '#10b981', border: '2px solid #05050f' }}
        >
          ✓
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white text-center mb-1 animate-slide-up">
        Welcome, {displayName}! 🎉
      </h2>
      <p className="text-white/45 text-sm mb-8">@{username}</p>

      {/* Afro-ID card */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden mb-5 animate-slide-up"
        style={{
          animationDelay: '0.1s',
          background: 'linear-gradient(135deg,#1a1a3e 0%,#252550 60%,#1a1a3e 100%)',
          border: '1px solid rgba(212,160,23,0.35)',
          boxShadow: '0 0 40px rgba(212,160,23,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Card pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(60deg,#d4a017 0,#d4a017 1px,transparent 0,transparent 50%)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="relative px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Afro Social · Member ID
              </p>
            </div>
            <span className="text-2xl">✊🏿</span>
          </div>

          <p
            className="text-2xl font-bold tracking-[0.15em] mb-1"
            style={{ color: '#d4a017', fontFamily: 'monospace' }}
          >
            {afroId}
          </p>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-white/30">
              {displayName} · @{username}
            </p>
            <button
              onClick={copyId}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(212,160,23,0.12)',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.5)' : 'rgba(212,160,23,0.3)'}`,
                color: copied ? '#6ee7b7' : '#d4a017',
              }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Countdown ring */}
      <div
        className="flex flex-col items-center gap-2 mb-6 animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
            <circle
              cx="26" cy="26" r="22"
              fill="none"
              stroke="#d4a017"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (countdown / 6)}`}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-afro-gold">
            {countdown}
          </span>
        </div>
        <p className="text-xs text-white/35">Redirecting to your homepage…</p>
      </div>

      <Button size="xl" fullWidth onClick={goNow} className="max-w-sm animate-slide-up"
              style={{ animationDelay: '0.3s' }}>
        Go to Homepage →
      </Button>
    </div>
  );
}
