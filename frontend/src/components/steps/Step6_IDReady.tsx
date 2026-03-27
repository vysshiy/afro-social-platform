import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  displayName:   string;
  username:      string;
  afroId:        string;
  capturedImage: string | null;
  txHash:        string;
  blockNumber:   number;
}

// Phase:  minting → confirming → revealed
type Phase = 'minting' | 'confirming' | 'revealed';

const MINT_STEPS = [
  { icon: '🔐', label: 'Generating cryptographic identity…',   ms: 900  },
  { icon: '🔗', label: 'Anchoring to the Afro Chain…',         ms: 1000 },
  { icon: '⛏️', label: 'Mining block confirmation…',           ms: 900  },
  { icon: '✅', label: 'Block confirmed!',                      ms: 600  },
];

export default function Step6_IDReady({
  displayName, username, afroId, capturedImage, txHash, blockNumber,
}: Props) {
  const navigate  = useNavigate();
  const spokeRef  = useRef(false);
  const [phase,      setPhase]      = useState<Phase>('minting');
  const [mintStep,   setMintStep]   = useState(0);
  const [countdown,  setCountdown]  = useState(8);
  const [copied,     setCopied]     = useState<'id' | 'hash' | null>(null);

  // ── Minting animation ──────────────────────────────────────────────────────
  useEffect(() => {
    let total = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    MINT_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setMintStep(i), total));
      total += s.ms;
    });

    timers.push(setTimeout(() => setPhase('confirming'), total));
    total += 700;
    timers.push(setTimeout(() => setPhase('revealed'),   total));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Countdown to /home (only once revealed) ────────────────────────────────
  useEffect(() => {
    if (phase !== 'revealed') return;
    if (countdown <= 0) { navigate('/home'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, navigate]);

  // ── Voice announcement ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'revealed' || spokeRef.current || !window.speechSynthesis) return;
    spokeRef.current = true;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(
        `Congratulations ${displayName}! Your Afro ID has been minted on the blockchain. ` +
        `You are being taken to your homepage in a few seconds.`
      );
      u.rate  = 0.9;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }, 400);
  }, [phase, displayName]);

  function copyToClipboard(text: string, type: 'id' | 'hash') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function goNow() {
    window.speechSynthesis?.cancel();
    navigate('/home');
  }

  const shortHash = txHash ? `${txHash.slice(0, 10)}…${txHash.slice(-8)}` : '';
  const formattedBlock = blockNumber.toLocaleString();

  // ── MINTING PHASE ──────────────────────────────────────────────────────────
  if (phase === 'minting' || phase === 'confirming') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
        style={{ background: 'linear-gradient(160deg,#05050f 0%,#0a0a1a 50%,#0d0d20 100%)' }}
      >
        {/* Chain icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{
            background: 'linear-gradient(135deg,#1a1a3e,#252560)',
            border:     '2px solid rgba(212,160,23,0.4)',
            boxShadow:  '0 0 48px rgba(212,160,23,0.2)',
            animation:  'pulse 1.5s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: 40 }}>⛓️</span>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {phase === 'confirming' ? 'Block Confirmed!' : 'Minting Your Afro ID'}
        </h2>
        <p className="text-sm text-center mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {phase === 'confirming'
            ? 'Your identity is secured on the Afro Chain'
            : 'Securing your identity on the blockchain…'}
        </p>

        {/* Mint steps list */}
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border:     '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {MINT_STEPS.map((s, i) => {
            const done    = i < mintStep || phase === 'confirming';
            const active  = i === mintStep && phase === 'minting';
            return (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderBottom: i < MINT_STEPS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  opacity: i > mintStep && phase === 'minting' ? 0.35 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                  style={{
                    background: done
                      ? 'rgba(16,185,129,0.2)'
                      : active
                      ? 'rgba(212,160,23,0.2)'
                      : 'rgba(255,255,255,0.05)',
                    border: done
                      ? '1px solid rgba(16,185,129,0.5)'
                      : active
                      ? '1px solid rgba(212,160,23,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {done ? '✓' : active ? (
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  ) : s.icon}
                </div>
                <p
                  className="text-sm"
                  style={{
                    color: done ? '#6ee7b7' : active ? '#d4a017' : 'rgba(255,255,255,0.4)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Fake hash streaming */}
        <div
          className="w-full max-w-sm rounded-xl px-4 py-3 font-mono text-xs"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border:     '1px solid rgba(212,160,23,0.15)',
            color:      'rgba(212,160,23,0.6)',
            overflowX:  'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {shortHash || 'Computing SHA-256…'}
        </div>
      </div>
    );
  }

  // ── REVEALED PHASE ─────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 py-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#05050f 0%,#0a0a1a 50%,#0d0d20 100%)' }}
    >
      {/* Glow orb behind card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 340, height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
      />

      {/* Avatar */}
      <div className="relative mb-5 animate-scale-in">
        <div
          className="w-24 h-24 rounded-full overflow-hidden"
          style={{
            border:    '3px solid #d4a017',
            boxShadow: '0 0 0 6px rgba(212,160,23,0.1), 0 0 40px rgba(212,160,23,0.25)',
          }}
        >
          {capturedImage ? (
            <img src={capturedImage} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg,#d4a017,#8b6508)' }}
            >
              ✊🏿
            </div>
          )}
        </div>
        {/* Verified badge */}
        <div
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: '#10b981',
            border:     '2px solid #05050f',
            fontSize:   14,
            fontWeight: 700,
            color:      '#fff',
          }}
        >
          ✓
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-0.5 animate-slide-up">
        Welcome, {displayName}! 🎉
      </h2>
      <p className="text-sm mb-6 animate-slide-up" style={{ color: 'rgba(255,255,255,0.4)', animationDelay:'0.05s' }}>
        @{username}
      </p>

      {/* ── ID Card ── */}
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden mb-4 animate-slide-up"
        style={{
          animationDelay: '0.1s',
          background: 'linear-gradient(135deg,#14143a 0%,#1e1e52 40%,#14143a 100%)',
          border:     '1px solid rgba(212,160,23,0.4)',
          boxShadow:  '0 0 60px rgba(212,160,23,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Holographic shimmer strip */}
        <div
          style={{
            height:     4,
            background: 'linear-gradient(90deg, #d4a017, #f59e0b, #10b981, #8b5cf6, #d4a017)',
          }}
        />

        <div className="px-6 py-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Afro Social Platform
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(212,160,23,0.7)', letterSpacing:'0.05em' }}>
                Identity · Member Card
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(212,160,23,0.12)', border:'1px solid rgba(212,160,23,0.25)' }}
            >
              ✊🏿
            </div>
          </div>

          {/* Afro ID */}
          <div className="mb-4">
            <p className="text-xs mb-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Afro ID
            </p>
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-xl font-bold tracking-[0.18em]"
                style={{ color: '#d4a017', fontFamily: 'monospace' }}
              >
                {afroId}
              </p>
              <button
                onClick={() => copyToClipboard(afroId, 'id')}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: copied === 'id' ? 'rgba(16,185,129,0.2)'   : 'rgba(212,160,23,0.12)',
                  border:     copied === 'id' ? '1px solid #10b981'       : '1px solid rgba(212,160,23,0.3)',
                  color:      copied === 'id' ? '#6ee7b7'                 : '#d4a017',
                }}
              >
                {copied === 'id' ? '✓ Copied' : '⎘ Copy'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 14 }} />

          {/* Blockchain details */}
          <div className="space-y-2 mb-4">
            {/* Tx hash */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm flex-shrink-0">🔗</span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Transaction Hash
                  </p>
                  <p
                    className="text-xs font-mono truncate"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {shortHash}
                  </p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(txHash, 'hash')}
                className="flex-shrink-0 text-xs px-2 py-1 rounded-lg"
                style={{
                  background: copied === 'hash' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
                  color:      copied === 'hash' ? '#6ee7b7'                : 'rgba(255,255,255,0.4)',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  fontSize:   10,
                }}
              >
                {copied === 'hash' ? '✓' : '⎘'}
              </button>
            </div>

            {/* Block + Chain */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">⛏️</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Block</p>
                  <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    #{formattedBlock}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🌍</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Network</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>Afro Chain · Mainnet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {displayName} · @{username}
            </p>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(16,185,129,0.12)',
                border:     '1px solid rgba(16,185,129,0.35)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
              <p className="text-[10px] font-semibold" style={{ color: '#6ee7b7' }}>VERIFIED ON-CHAIN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown ring */}
      <div
        className="flex flex-col items-center gap-1.5 mb-5 animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="relative w-12 h-12">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
            <circle
              cx="26" cy="26" r="22"
              fill="none"
              stroke="#d4a017"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (countdown / 8)}`}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center font-bold text-lg"
            style={{ color: '#d4a017' }}
          >
            {countdown}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Taking you to your homepage…</p>
      </div>

      {/* CTA */}
      <button
        onClick={goNow}
        className="w-full max-w-sm py-4 rounded-2xl font-bold text-base transition-all animate-slide-up"
        style={{
          animationDelay: '0.25s',
          background: 'linear-gradient(135deg, #d4a017 0%, #f59e0b 50%, #d4a017 100%)',
          color:      '#05050f',
          boxShadow:  '0 4px 24px rgba(212,160,23,0.4)',
          letterSpacing: '0.03em',
        }}
      >
        Enter Your Homepage →
      </button>
    </div>
  );
}
