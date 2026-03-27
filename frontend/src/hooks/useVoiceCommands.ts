import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────
export type VoiceCommand =
  | 'smile' | 'eyes open' | 'eyes closed'
  | 'happy' | 'surprised' | 'neutral' | 'angry'
  | 'capture' | 'keep' | 'skip' | 'next' | 'back';

export interface VoiceState {
  listening:   boolean;
  supported:   boolean;
  lastCommand: VoiceCommand | null;
  transcript:  string;
  error:       string | null;
}

// Longer keywords first so "eyes open" matches before "open"
const COMMAND_MAP: [string, VoiceCommand][] = [
  ['eyes open',   'eyes open'],
  ['open eyes',   'eyes open'],
  ['eyes closed', 'eyes closed'],
  ['close eyes',  'eyes closed'],
  ['skip this',   'skip'],
  ['take photo',  'capture'],
  ['photograph',  'capture'],
  ['surprised',   'surprised'],
  ['surprise',    'surprised'],
  ['previous',    'back'],
  ['continue',    'next'],
  ['neutral',     'neutral'],
  ['capture',     'capture'],
  ['angry',       'angry'],
  ['smile',       'smile'],
  ['happy',       'happy'],
  ['keep',        'keep'],
  ['save',        'keep'],
  ['skip',        'skip'],
  ['next',        'next'],
  ['back',        'back'],
];

// ─── Hook ─────────────────────────────────────────────────────
export function useVoiceCommands(
  active:    boolean,
  onCommand: (cmd: VoiceCommand) => void,
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  const supported      = !!SpeechRecognition;
  const recognitionRef = useRef<any>(null);

  // ── KEY FIX: always call the LATEST onCommand, never a stale one ──
  // The recognition's onresult handler is set up once but needs to
  // dispatch to whatever callback the parent passed on the current render.
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const [state, setState] = useState<VoiceState>({
    listening:   false,
    supported,
    lastCommand: null,
    transcript:  '',
    error:       null,
  });

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u     = new SpeechSynthesisUtterance(text);
    u.rate      = 0.95;
    u.pitch     = 1;
    u.volume    = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    // ── Stop recognition when deactivated ───────────────────
    if (!supported || !active) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      setState(prev => ({ ...prev, listening: false }));
      return;
    }

    const recognition: any = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = false;
    recognition.lang           = 'en-US';
    recognitionRef.current     = recognition;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, listening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results as SpeechRecognitionResultList);
      const latest  = results[results.length - 1];
      if (!latest || !latest.isFinal) return;

      const raw = (latest[0] as SpeechRecognitionAlternative).transcript
        .toLowerCase()
        .trim();
      setState(prev => ({ ...prev, transcript: raw }));

      // Match longest keyword first — use the ref so we always call
      // the freshest callback even if the parent re-rendered
      for (const [keyword, cmd] of COMMAND_MAP) {
        if (raw.includes(keyword)) {
          setState(prev => ({ ...prev, lastCommand: cmd }));
          onCommandRef.current(cmd);   // ← always latest, never stale
          return;
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setState(prev => ({
          ...prev,
          error:     'Microphone access denied',
          listening: false,
        }));
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setState(prev => ({ ...prev, error: String(event.error) }));
      }
    };

    recognition.onend = () => {
      // Auto-restart only if still active and this is the current instance
      if (active && recognitionRef.current === recognition) {
        try { recognition.start(); } catch {}
      } else {
        setState(prev => ({ ...prev, listening: false }));
      }
    };

    try { recognition.start(); } catch {}

    return () => {
      try { recognition.stop(); } catch {}
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };
  // Only restart recognition when active flag or supported changes.
  // onCommand updates are handled via the ref above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, supported]);

  return { voiceState: state, speak };
}
