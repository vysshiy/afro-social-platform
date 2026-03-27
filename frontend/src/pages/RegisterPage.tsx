import React, { useState, useCallback, useEffect } from 'react';
import Step1_Welcome     from '../components/steps/Step1_Welcome';
import Step2_FaceCapture from '../components/steps/Step2_FaceCapture';
import Step3_BasicInfo   from '../components/steps/Step3_BasicInfo';
import Step4_DateOfBirth from '../components/steps/Step4_DateOfBirth';
import Step5_ProfileType from '../components/steps/Step5_ProfileType';
import Step6_IDReady     from '../components/steps/Step6_IDReady';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  capturedImage: string | null;
  displayName:  string;
  username:     string;
  email:        string;
  password:     string;
  dob:          { day: number; month: number; year: number };
  profileType:  string;
  location:     string;
  afroId:       string;
}

function generateAfroId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand  = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const ts    = Date.now().toString(36).slice(-3).toUpperCase();
  return `AF-${rand}${ts}`;
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    capturedImage: null,
    displayName:  '',
    username:     '',
    email:        '',
    password:     '',
    dob:          { day: 1, month: 1, year: 2000 },
    profileType:  '',
    location:     '',
    afroId:       '',
  });

  const next = useCallback(() => setStep(s => Math.min(s + 1, 6) as Step), []);
  const back = useCallback(() => setStep(s => Math.max(s - 1, 1) as Step), []);

  // Global voice commands on steps 1, 3, 4, 5 (step 2 handles its own)
  const isGlobalVoiceActive = step !== 2 && step !== 6;
  const { voiceState } = useVoiceCommands(isGlobalVoiceActive, cmd => {
    if (cmd === 'next' || cmd === 'capture') next();
    if (cmd === 'back')                      back();
    if (cmd === 'skip' && step === 2)        next();
  });

  // On step change, announce which step we are on
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const msgs: Record<number, string> = {
      3: 'Step 3. Enter your personal details.',
      4: 'Step 4. Set your date of birth using the scroll wheels.',
      5: 'Step 5. Choose your profile type.',
    };
    if (msgs[step]) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(msgs[step]);
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }, 300);
    }
  }, [step]);

  function handleFaceKeep(img: string) {
    setForm(f => ({ ...f, capturedImage: img }));
    next();
  }

  function handleFinish() {
    const id = generateAfroId();
    setForm(f => ({ ...f, afroId: id }));
    setStep(6);
  }

  // Step progress dots (visible on steps 2–5)
  const showDots = step >= 2 && step <= 5;

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(160deg, #05050f 0%, #0a0a1a 40%, #0f0f28 100%)',
      }}
    >
      {/* Progress dots */}
      {showDots && (
        <div className="fixed top-0 left-0 right-0 z-50 pt-safe">
          <div className="flex items-center justify-center gap-2 py-3 px-4">
            {([2, 3, 4, 5] as Step[]).map(s => (
              <div
                key={s}
                className="transition-all duration-300 rounded-full"
                style={{
                  height: 6,
                  width:  s === step ? 28 : 8,
                  background: s < step
                    ? '#10b981'
                    : s === step
                    ? '#d4a017'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
          {/* Thin gold line */}
          <div
            className="h-px w-full transition-all duration-500"
            style={{
              background: `linear-gradient(to right, #d4a017 ${((step - 1) / 5) * 100}%, rgba(255,255,255,0.06) 0%)`,
            }}
          />
        </div>
      )}

      {/* Voice status chip (global, non-intrusive) */}
      {isGlobalVoiceActive && voiceState.listening && step !== 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(212,160,23,0.15)',
              border: '1px solid rgba(212,160,23,0.4)',
              backdropFilter: 'blur(12px)',
              color: '#d4a017',
            }}
          >
            <span className="mic-active rounded-full w-2 h-2 bg-afro-gold inline-block" />
            {voiceState.transcript ? `"${voiceState.transcript}"` : 'Listening…'}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className={showDots ? 'pt-12' : ''}>
        {step === 1 && (
          <Step1_Welcome onNext={next} />
        )}

        {step === 2 && (
          <Step2_FaceCapture
            onKeep={handleFaceKeep}
            onSkip={next}
            onBack={back}
          />
        )}

        {step === 3 && (
          <Step3_BasicInfo
            data={{
              displayName: form.displayName,
              username:    form.username,
              email:       form.email,
              password:    form.password,
            }}
            onChange={d => setForm(f => ({ ...f, ...d }))}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 4 && (
          <Step4_DateOfBirth
            value={form.dob}
            onChange={dob => setForm(f => ({ ...f, dob }))}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 5 && (
          <Step5_ProfileType
            value={form.profileType}
            location={form.location}
            onChange={v => setForm(f => ({ ...f, profileType: v }))}
            onLocationChange={loc => setForm(f => ({ ...f, location: loc }))}
            onNext={handleFinish}
            onBack={back}
          />
        )}

        {step === 6 && (
          <Step6_IDReady
            displayName={form.displayName || 'Friend'}
            username={form.username || 'afro_user'}
            afroId={form.afroId}
            capturedImage={form.capturedImage}
          />
        )}
      </div>
    </div>
  );
}
