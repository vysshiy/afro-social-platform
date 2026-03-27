import { useEffect, useRef, useState, useCallback } from 'react';

export type VoiceCommand =
  | 'smile'
  | 'eyes open'
  | 'eyes closed'
  | 'happy'
  | 'surprised'
  | 'neutral'
  | 'angry'
  | 'capture'
  | 'keep'
  | 'skip'
  | 'next'
  | 'back';

export interface VoiceState {
  listening: boolean;
  supported: boolean;
  lastCommand: VoiceCommand | null;
  transcript: string;
  error: string | null;
}

const COMMAND_MAP: Record<string, VoiceCommand> = {
  smile: 'smile',
  'eyes open': 'eyes open',
  'open eyes': 'eyes open',
  'eyes closed': 'eyes closed',
  'close eyes': 'eyes closed',
  happy: 'happy',
  surprised: 'surprised',
  surprise: 'surprised',
  neutral: 'neutral',
  angry: 'angry',
  capture: 'capture',
  'take photo': 'capture',
  photograph: 'capture',
  keep: 'keep',
  save: 'keep',
  skip: 'skip',
  'skip this': 'skip',
  next: 'next',
  continue: 'next',
  back: 'back',
  previous: 'back',
};

export function useVoiceCommands(
  active: boolean,
  onCommand: (cmd: VoiceCommand) => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const supported = !!SpeechRecognition;
  const recognitionRef = useRef<any>(null);
  const [state, setState] = useState<VoiceState>({
    listening: false,
    supported,
    lastCommand: null,
    transcript: '',
    error: null,
  });

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (!supported || !active) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      setState(prev => ({ ...prev, listening: false }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, listening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results as SpeechRecognitionResultList);
      const latest = results[results.length - 1];
      if (!latest || !latest.isFinal) return;

      const raw = latest[0].transcript.toLowerCase().trim();
      setState(prev => ({ ...prev, transcript: raw }));

      // Match against command map
      for (const [keyword, cmd] of Object.entries(COMMAND_MAP)) {
        if (raw.includes(keyword)) {
          setState(prev => ({ ...prev, lastCommand: cmd }));
          onCommand(cmd);
          return;
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setState(prev => ({ ...prev, error: 'Microphone access denied', listening: false }));
      } else if (event.error !== 'no-speech') {
        setState(prev => ({ ...prev, error: event.error }));
      }
    };

    recognition.onend = () => {
      // Auto-restart if still active
      if (active && recognitionRef.current === recognition) {
        try { recognition.start(); } catch {}
      } else {
        setState(prev => ({ ...prev, listening: false }));
      }
    };

    try {
      recognition.start();
    } catch {}

    return () => {
      try { recognition.stop(); } catch {}
      recognitionRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, supported]);

  return { voiceState: state, speak };
}
