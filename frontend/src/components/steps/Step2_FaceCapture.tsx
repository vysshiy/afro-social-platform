import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFaceDetection, Expression } from '../../hooks/useFaceDetection';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import Button from '../ui/Button';

interface Props {
  onKeep: (imageData: string) => void;
  onSkip: () => void;
}

const EXPRESSION_CONFIG: Record<Expression, { emoji: string; label: string; color: string }> = {
  happy:     { emoji: '😄', label: 'Happy',     color: '#f59e0b' },
  surprised: { emoji: '😲', label: 'Surprised', color: '#8b5cf6' },
  neutral:   { emoji: '😐', label: 'Neutral',   color: '#6b7280' },
  sad:       { emoji: '😢', label: 'Sad',       color: '#3b82f6' },
  angry:     { emoji: '😠', label: 'Angry',     color: '#ef4444' },
  fearful:   { emoji: '😨', label: 'Fearful',   color: '#f97316' },
  disgusted: { emoji: '🤢', label: 'Disgusted', color: '#10b981' },
};

const CAPTURE_SEQUENCE: Expression[] = ['neutral', 'happy', 'surprised'];
const VOICE_PROMPTS: Record<string, string> = {
  smile:       'Great! Now smile for me.',
  'eyes open': 'Please open your eyes wide.',
  happy:       'Show me a happy expression.',
  surprised:   'Look surprised!',
  neutral:     'Relax and look neutral.',
  capture:     'Capturing your photo now.',
  keep:        'Photo saved!',
  skip:        'Skipping face capture.',
};

export default function Step2_FaceCapture({ onKeep, onSkip }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [seqIdx, setSeqIdx] = useState(0);          // which expression we're prompting
  const [expressionLog, setExpressionLog] = useState<Expression[]>([]);
  const [statusMsg, setStatusMsg] = useState('Align your face in the frame');

  const { modelsLoaded, faceState, capture } = useFaceDetection(videoRef, canvasRef, cameraReady && !capturedImg);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.93;
    window.speechSynthesis.speak(u);
  }, []);

  const { voiceState } = useVoiceCommands(!capturedImg, cmd => {
    const msg = VOICE_PROMPTS[cmd];
    if (msg) { speak(msg); setStatusMsg(msg); }
    if (cmd === 'capture') handleCapture();
    if (cmd === 'keep' && capturedImg) onKeep(capturedImg);
    if (cmd === 'skip') onSkip();
    if (cmd === 'smile') {
      setStatusMsg('😄 Now smile big!');
    }
    if (cmd === 'eyes open') {
      setStatusMsg('👁️ Open your eyes wide!');
    }
  });

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      })
      .catch(err => {
        setCameraError(err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : 'Could not access camera: ' + err.message);
      });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Voice welcome prompt
  useEffect(() => {
    if (cameraReady && modelsLoaded) {
      setTimeout(() => {
        speak(
          'Face capture is ready. I can detect your expressions. ' +
          'Try smiling, looking surprised, or saying "eyes open". ' +
          'Say "capture" or tap the capture button when ready.'
        );
        setStatusMsg('Face detected — try different expressions!');
      }, 500);
    }
  }, [cameraReady, modelsLoaded, speak]);

  // Auto-advance expression sequence prompt
  useEffect(() => {
    if (!faceState.detected || capturedImg) return;
    const target = CAPTURE_SEQUENCE[seqIdx];
    if (!target) return;
    const conf = (faceState.expressions[target] ?? 0);
    if (conf > 0.6) {
      setExpressionLog(prev => prev.includes(target) ? prev : [...prev, target]);
      if (seqIdx < CAPTURE_SEQUENCE.length - 1) {
        const next = CAPTURE_SEQUENCE[seqIdx + 1];
        const cfg = EXPRESSION_CONFIG[next];
        speak(`Nice ${EXPRESSION_CONFIG[target].label}! Now show me ${cfg.label}.`);
        setStatusMsg(`${cfg.emoji} Show me ${cfg.label}!`);
        setSeqIdx(i => i + 1);
      } else if (expressionLog.length < CAPTURE_SEQUENCE.length - 1) {
        speak('Excellent! All expressions captured. Say "capture" to take your photo.');
        setStatusMsg('All expressions done! Say "capture" to save.');
      }
    }
  }, [faceState, seqIdx, capturedImg, speak, expressionLog]);

  const handleCapture = useCallback(() => {
    const img = capture();
    if (img) {
      setCapturedImg(img);
      setStatusMsg('Photo captured!');
      speak('Perfect! Your photo has been captured. Say "keep" to save it, or "skip" to retake.');
    }
  }, [capture, speak]);

  const handleRetake = () => {
    setCapturedImg(null);
    setSeqIdx(0);
    setExpressionLog([]);
    setStatusMsg('Align your face and try again');
    speak('Let\'s try again. Align your face in the frame.');
  };

  // Visible expression badges (top 4 by confidence)
  const topExpressions = Object.entries(faceState.expressions)
    .filter(([, v]) => (v as number) > 0.08)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 4) as [Expression, number][];

  return (
    <div className="flex flex-col items-center px-4 py-6 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="text-center mb-4 w-full max-w-sm">
        <h2 className="text-xl font-bold text-white mb-1">Face Capture</h2>
        <p className="text-xs text-white/50">
          {!modelsLoaded ? 'Loading AI models…' : 'AI active — detecting expressions'}
        </p>
      </div>

      {/* Camera / Preview area */}
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden mb-4"
           style={{ aspectRatio: '4/3', background: '#0a0a1a' }}>

        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span className="text-4xl mb-3">📷</span>
            <p className="text-white/70 text-sm">{cameraError}</p>
          </div>
        ) : capturedImg ? (
          <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}   /* mirror view */
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
          </>
        )}

        {/* Capture ring overlay */}
        {!capturedImg && cameraReady && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-4 rounded-full border-2 border-dashed border-afro-gold/40 capture-ring"
              style={{ borderRadius: '50%' }}
            />
          </div>
        )}

        {/* Expression badges overlay */}
        {!capturedImg && topExpressions.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {topExpressions.map(([exp, conf]) => {
              const cfg = EXPRESSION_CONFIG[exp];
              if (!cfg) return null;
              const pct = Math.round((conf as number) * 100);
              return (
                <span
                  key={exp}
                  className="badge-in flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: cfg.color + 'cc', backdropFilter: 'blur(6px)' }}
                >
                  {cfg.emoji} {cfg.label} {pct}%
                </span>
              );
            })}
          </div>
        )}

        {/* Face detected indicator */}
        {!capturedImg && (
          <div className="absolute top-3 right-3">
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                faceState.detected
                  ? 'bg-green-500/80 text-white'
                  : 'bg-black/50 text-white/50'
              }`}
            >
              {faceState.detected ? '● Face detected' : '○ No face'}
            </span>
          </div>
        )}

        {/* Captured checkmark */}
        {capturedImg && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/80 flex items-center justify-center backdrop-blur">
              <span className="text-4xl">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Status message */}
      <p className="text-sm text-white/80 text-center mb-3 px-4 min-h-[1.5rem]">
        {statusMsg}
      </p>

      {/* Expression sequence progress */}
      {!capturedImg && (
        <div className="flex items-center gap-2 mb-4">
          {CAPTURE_SEQUENCE.map((exp, i) => {
            const cfg = EXPRESSION_CONFIG[exp];
            const done = expressionLog.includes(exp);
            const active = i === seqIdx;
            return (
              <div
                key={exp}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                  done
                    ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                    : active
                    ? 'bg-afro-gold/20 text-afro-gold border border-afro-gold/50 animate-pulse'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}
              >
                {cfg.emoji} {cfg.label}
                {done && ' ✓'}
              </div>
            );
          })}
        </div>
      )}

      {/* Voice status chip */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5 ${
          voiceState.listening
            ? 'bg-afro-gold/15 border border-afro-gold/40 text-afro-gold'
            : 'bg-white/5 border border-white/10 text-white/40'
        }`}
      >
        <span className={voiceState.listening ? 'mic-active rounded-full' : ''}>🎙️</span>
        {voiceState.listening
          ? voiceState.transcript
            ? `"${voiceState.transcript}"`
            : 'Listening… say "smile", "eyes open", or "capture"'
          : voiceState.error || 'Voice commands inactive'}
      </div>

      {/* Eye / Smile quick indicators */}
      {!capturedImg && faceState.detected && (
        <div className="flex gap-3 mb-5">
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
            faceState.eyesOpen
              ? 'border-green-500/50 bg-green-500/10 text-green-400'
              : 'border-white/10 bg-white/5 text-white/30'
          }`}>
            👁️ {faceState.eyesOpen ? 'Eyes Open' : 'Eyes Closed'}
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
            faceState.smiling
              ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
              : 'border-white/10 bg-white/5 text-white/30'
          }`}>
            😄 {faceState.smiling ? 'Smiling' : 'No Smile'}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        {capturedImg ? (
          <>
            <Button variant="secondary" size="lg" onClick={handleRetake} fullWidth>
              🔄 Retake
            </Button>
            <Button variant="success" size="lg" onClick={() => onKeep(capturedImg)} fullWidth>
              ✅ Keep
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={onSkip}
              className="border border-white/15 flex-1"
            >
              ⏭️ Skip
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCapture}
              disabled={!faceState.detected || !cameraReady}
              className="flex-2 flex-grow"
              icon={<span>📸</span>}
            >
              Capture
            </Button>
          </>
        )}
      </div>

      {/* Models loading bar */}
      {!modelsLoaded && (
        <div className="mt-4 w-full max-w-sm">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Loading face AI models…</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-afro-gold animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
