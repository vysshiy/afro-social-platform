import React, { useState } from 'react';
import Step1_Welcome     from '../components/steps/Step1_Welcome';
import Step2_FaceCapture from '../components/steps/Step2_FaceCapture';
import Step3_BasicInfo   from '../components/steps/Step3_BasicInfo';
import Step4_DateOfBirth from '../components/steps/Step4_DateOfBirth';
import Step5_ProfileType from '../components/steps/Step5_ProfileType';
import Step6_IDReady     from '../components/steps/Step6_IDReady';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  capturedImage: string | null;
  displayName: string;
  username: string;
  email: string;
  password: string;
  dob: { day: number; month: number; year: number };
  profileType: string;
  afroId: string;
}

function generateAfroId(username: string): string {
  const prefix = 'AFRO';
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const suffix = Date.now().toString(36).substring(-4).toUpperCase();
  return `${prefix}-${rand}${suffix}`;
}

const TOTAL_STEPS = 6;

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    capturedImage: null,
    displayName: '',
    username: '',
    email: '',
    password: '',
    dob: { day: 1, month: 1, year: 2000 },
    profileType: '',
    afroId: '',
  });

  function next() { setStep(s => Math.min(s + 1, TOTAL_STEPS) as Step); }
  function back() { setStep(s => Math.max(s - 1, 1) as Step); }

  function handleFaceKeep(img: string) {
    setForm(f => ({ ...f, capturedImage: img }));
    next();
  }

  function handleFaceSkip() {
    setForm(f => ({ ...f, capturedImage: null }));
    next();
  }

  function handleFinish() {
    const id = generateAfroId(form.username);
    setForm(f => ({ ...f, afroId: id }));
    next();
  }

  // Step progress dots (1–5, step 6 is the success screen)
  function ProgressDots() {
    if (step === 1 || step === 6) return null;
    return (
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center gap-2 pointer-events-none">
        {[2, 3, 4, 5].map(s => (
          <div
            key={s}
            className={`step-dot ${
              s < step ? 'done' : s === step ? 'active' : ''
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)',
      }}
    >
      <ProgressDots />

      {step === 1 && <Step1_Welcome onNext={next} />}

      {step === 2 && (
        <Step2_FaceCapture
          onKeep={handleFaceKeep}
          onSkip={handleFaceSkip}
        />
      )}

      {step === 3 && (
        <Step3_BasicInfo
          data={{
            displayName: form.displayName,
            username: form.username,
            email: form.email,
            password: form.password,
          }}
          onChange={d =>
            setForm(f => ({
              ...f,
              displayName: d.displayName,
              username: d.username,
              email: d.email,
              password: d.password,
            }))
          }
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
          onChange={v => setForm(f => ({ ...f, profileType: v }))}
          onNext={handleFinish}
          onBack={back}
        />
      )}

      {step === 6 && (
        <Step6_IDReady
          displayName={form.displayName}
          username={form.username}
          afroId={form.afroId}
          capturedImage={form.capturedImage}
        />
      )}
    </div>
  );
}
