import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFaceDetection, Expression } from '../../hooks/useFaceDetection';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import Button from '../ui/Button';

interface Props {
  onKeep: (imageData: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

const EXP_CONFIG: Record<Expression, { emoji: string; label: string; color: string }> = {
  happy:     { emoji: '😄', label: 'Happy',     color: '#f59e0b' },
  surprised: { emoji: '😲', label: 'Surprised', color: '#8b5cf6' },
  neutral:   { emoji: '😐', label: 'Neutral',   color: '#94a3b8' },
  sad:       { emoji: '😢', label: 'Sad',       color: '#3b82f6' },
  angry:     { emoji: '😠', label: 'Angry',     color: '#ef4444' },
  fearful:   { emoji: '😨', label: 'Fearful',   color: '#f97316' },
  disgusted: { emoji: '🤢', label: 'Disgusted', color: '#10b981' },
};

// The guided capture sequence
const SEQ: Expression[] = ['neutral', 'happy', 'surprised'];

export default function Step2_FaceCapture({ onKeep, onSkip, onBack }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [seqIdx, setSeqIdx]           = useState(0);
  const [seqDone, setSeqDone]         = useState<Expression[]>([]);
  const [statusMsg, setStatusMsg]     = useState('Position your face in the frame');

  const { modelsLoaded, faceState, capture } = useFaceDetection(
    videoRef, canvasRef, cameraReady && !capturedImg
  );

  // Stable speak helper
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.93;
    window.speechSynthesis.speak(u);
  }, []);

  // Stable capture handler
  const handleCapture = useCallback(() => {
    const img = capture();
    if (img) {
      setCapturedImg(img);
      setStatusMsg('Photo captured!');
      speak("Perfect! Your photo is captured. Tap Keep to save, or Retake to try again.");
    }
  }, [capture, speak]);

  // Voice command handler — stable with useCallback
  const handleVoiceCmd = useCallback((cmd: string) => {
    const map: Record<string, () => void> = {
      smile:       () => { speak('Now smile for me!'); setStatusMsg('😄 Show me your smile!'); },
      'eyes open': () => { speak('Open your eyes wide!'); setStatusMsg('👁️ Eyes wide open!'); },
      happy:       () => { speak('Show a happy expression!'); setStatusMsg('😄 Be happy!'); },
      surprised:   () => { speak('Look surprised!'); setStatusMsg('😲 Look surprised!'); },
      neutral:     () => { speak('Relax and look neutral.'); setStatusMsg('😐 Neutral face...'); },
      capture:     () => handleCapture(),
      keep:        () => { if (capturedImg) onKeep(capturedImg); },
      skip:        () => onSkip(),
      back:        () => onBack(),
    };
    map[cmd]?.();
  // capturedImg intentionally excluded — we use the ref pattern below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, handleCapture, onKeep, onSkip, onBack]);

  // Keep a ref to capturedImg so voice "keep" always sees latest value
  const capturedImgRef = useRef<string | null>(null);
  capturedImgRef.current = capturedImg;

  const handleVoiceCmdStable = useCallback((cmd: string) => {
    if (cmd === 'keep' && capturedImgRef.current) {
      onKeep(capturedImgRef.current);
      return;
    }
    handleVoiceCmd(cmd);
  }, [handleVoiceCmd, onKeep]);

  const { voiceState } = useVoiceCommands(!capturedImg, handleVoiceCmdStable);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      })
      .catch(err => setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions and reload.'
          : `Camera error: ${err.message}`
      ));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Welcome prompt once camera + models are ready
  const readyAnnounced = useRef(false);
  useEffect(() => {
    if (!cameraReady || !modelsLoaded || readyAnnounced.current) return;
    readyAnnounced.current = true;
    setTimeout(() => {
      speak(
        'Face capture is ready. I will guide you through three expressions: ' +
        'neutral, happy, and surprised. Start with a neutral face.'
      );
      setStatusMsg('😐 Step 1: Show a neutral face');
    }, 500);
  }, [cameraReady, modelsLoaded, speak]);

  // Guided expression sequence — fixed logic
  useEffect(() => {
    if (!faceState.detected || capturedImg || !modelsLoaded) return;
    const target = SEQ[seqIdx];
    if (!target) return;
    const conf = (faceState.expressions[target] ?? 0);
    if (conf < 0.55) return;

    // This expression in the sequence is done
    setSeqDone(prev => {
      if (prev.includes(target)) return prev;
      const next = [...prev, target];
      const nextIdx = seqIdx + 1;
      if (nextIdx < SEQ.length) {
        const cfg = EXP_CONFIG[SEQ[nextIdx]];
        setTimeout(() => {
          speak(`Great ${EXP_CONFIG[target].label}! Now show ${cfg.label}.`);
          setStatusMsg(`${cfg.emoji} Step ${nextIdx + 1}: Show ${cfg.label}`);
        }, 300);
        setSeqIdx(nextIdx);
      } else if (next.length === SEQ.length) {
        setTimeout(() => {
          speak('All expressions captured! Tap Capture to take your photo.');
          setStatusMsg('All done! Tap Capture now 📸');
        }, 300);
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceState.expressions, faceState.detected, seqIdx, capturedImg, modelsLoaded]);

  // Top 4 expressions sorted by confidence
  const topExpressions = (Object.entries(faceState.expressions) as [Expression, number][])
    .filter(([, v]) => v > 0.07)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  function handleRetake() {
    setCapturedImg(null);
    setSeqIdx(0);
    setSeqDone([]);
    setStatusMsg('Position your face in the frame');
    speak("Let's try again.");
  }

  return (
    <div className="flex flex-col items-center min-h-screen pb-6 animate-fade-in"
         style={{ background: 'linear-gradient(180deg, #05050f 0%, #0a0a1a 100%)' }}>

      {/* Header */}
      <div className="w-full px-5 pt-4 pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-white">Face Setup</h2>
          <p className="text-xs text-white/40">
            {!modelsLoaded ? 'Loading AI…' : 'AI active'}
          </p>
        </div>
        <button
          onClick={onSkip}
          className="text-white/40 hover:text-white/80 text-sm transition-colors"
        >
          Skip ⏭
        </button>
      </div>

      {/* Camera viewport */}
      <div
        className="relative w-full"
        style={{ maxWidth: 420, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            aspectRatio: '3/4',
            background: '#050510',
            border: capturedImg
              ? '2px solid #10b981'
              : faceState.detected
              ? '2px solid rgba(212,160,23,0.6)'
              : '2px solid rgba(255,255,255,0.08)',
            boxShadow: faceState.detected && !capturedImg
              ? '0 0 30px rgba(212,160,23,0.2)'
              : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
        >
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
              <span className="text-5xl">📷</span>
              <p className="text-white/60 text-sm leading-relaxed">{cameraError}</p>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          ) : capturedImg ? (
            <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              {/* Video — NOT mirrored so face-api coords match */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}   /* mirror for natural feel */
              />
              {/* Canvas overlay — mirrored to match video display */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
              />
            </>
          )}

          {/* Corner guides */}
          {!capturedImg && !cameraError && (
            <>
              {[['top-3 left-3', 'border-t border-l'],
                ['top-3 right-3', 'border-t border-r'],
                ['bottom-3 left-3', 'border-b border-l'],
                ['bottom-3 right-3', 'border-b border-r'],
              ].map(([pos, border], i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-6 h-6 rounded-sm ${border}`}
                  style={{ borderColor: faceState.detected ? '#d4a017' : 'rgba(255,255,255,0.25)', borderWidth: 2 }}
                />
              ))}
            </>
          )}

          {/* Face detected badge */}
          {!capturedImg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  background: faceState.detected
                    ? 'rgba(16,185,129,0.25)'
                    : 'rgba(0,0,0,0.5)',
                  border: `1px solid ${faceState.detected ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: faceState.detected ? '#6ee7b7' : 'rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {faceState.detected ? '● Face Detected' : '○ Align your face'}
              </span>
            </div>
          )}

          {/* Expression badges (bottom of camera) */}
          {!capturedImg && topExpressions.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              {topExpressions.map(([exp, conf]) => {
                const cfg = EXP_CONFIG[exp];
                if (!cfg) return null;
                return (
                  <span
                    key={exp}
                    className="badge-in flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: `${cfg.color}bb`,
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${cfg.color}66`,
                    }}
                  >
                    {cfg.emoji} {cfg.label} {Math.round(conf * 100)}%
                  </span>
                );
              })}
            </div>
          )}

          {/* Captured success overlay */}
          {capturedImg && (
            <div className="absolute inset-0 flex items-center justify-center"
                 style={{ background: 'rgba(16,185,129,0.15)' }}>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center animate-scale-in"
                style={{ background: 'rgba(16,185,129,0.8)', backdropFilter: 'blur(8px)' }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M10 20l7 7 13-14" stroke="white" strokeWidth="3.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status message */}
      <p className="text-sm font-medium text-white/80 text-center mt-3 px-5 min-h-[1.5rem] animate-fade-in">
        {statusMsg}
      </p>

      {/* Eye / Smile indicators */}
      {!capturedImg && faceState.detected && (
        <div className="flex gap-2 mt-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full border font-medium"
            style={{
              borderColor: faceState.eyesOpen ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.12)',
              background: faceState.eyesOpen ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
              color: faceState.eyesOpen ? '#6ee7b7' : 'rgba(255,255,255,0.35)',
            }}
          >
            👁️ {faceState.eyesOpen ? 'Eyes Open' : 'Eyes Closed'}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full border font-medium"
            style={{
              borderColor: faceState.smiling ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.12)',
              background: faceState.smiling ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
              color: faceState.smiling ? '#fcd34d' : 'rgba(255,255,255,0.35)',
            }}
          >
            😄 {faceState.smiling ? 'Smiling' : 'Not Smiling'}
          </span>
        </div>
      )}

      {/* Expression sequence tracker */}
      {!capturedImg && (
        <div className="flex items-center gap-2 mt-3 px-5">
          {SEQ.map((exp, i) => {
            const cfg  = EXP_CONFIG[exp];
            const done = seqDone.includes(exp);
            const active = i === seqIdx;
            return (
              <div
                key={exp}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  background: done
                    ? 'rgba(16,185,129,0.18)'
                    : active
                    ? 'rgba(212,160,23,0.18)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done ? 'rgba(16,185,129,0.45)' : active ? 'rgba(212,160,23,0.45)' : 'rgba(255,255,255,0.1)'}`,
                  color: done ? '#6ee7b7' : active ? '#fcd34d' : 'rgba(255,255,255,0.3)',
                }}
              >
                {cfg.emoji} {cfg.label}
                {done && ' ✓'}
              </div>
            );
          })}
        </div>
      )}

      {/* Voice status */}
      <div
        className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-xs mx-5"
        style={{
          background: voiceState.listening
            ? 'rgba(212,160,23,0.1)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${voiceState.listening ? 'rgba(212,160,23,0.35)' : 'rgba(255,255,255,0.1)'}`,
          color: voiceState.listening ? '#d4a017' : 'rgba(255,255,255,0.35)',
        }}
      >
        <span className={voiceState.listening ? 'mic-active rounded-full' : ''}>🎙️</span>
        {voiceState.listening
          ? (voiceState.transcript ? `"${voiceState.transcript}"` : 'Say "smile", "eyes open" or "capture"')
          : (voiceState.error || 'Voice inactive')}
      </div>

      {/* AI loading bar */}
      {!modelsLoaded && (
        <div className="w-full px-5 mt-3" style={{ maxWidth: 420 }}>
          <div className="flex justify-between text-xs text-white/35 mb-1">
            <span>Loading face AI models…</span>
            <span>please wait</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full animate-pulse"
              style={{ width: '65%', background: 'linear-gradient(90deg, #d4a017, #f59e0b)' }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-4 px-5 w-full" style={{ maxWidth: 420 }}>
        {capturedImg ? (
          <>
            <Button variant="secondary" size="lg" onClick={handleRetake} fullWidth>
              🔄 Retake
            </Button>
            <Button variant="success" size="lg" onClick={() => onKeep(capturedImg)} fullWidth>
              ✅ Keep Photo
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleCapture}
            disabled={!faceState.detected || !cameraReady || !modelsLoaded}
            fullWidth
            icon={<span>📸</span>}
          >
            {!cameraReady ? 'Starting Camera…' : !modelsLoaded ? 'Loading AI…' : 'Capture Photo'}
          </Button>
        )}
      </div>

      {/* Skip link */}
      {!capturedImg && (
        <button
          onClick={onSkip}
          className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
        >
          Skip face setup
        </button>
      )}
    </div>
  );
}
