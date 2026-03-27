import React, { useState } from 'react';
import Button from '../ui/Button';

interface BasicInfo {
  displayName: string;
  username: string;
  email: string;
  password: string;
}

interface Props {
  data: BasicInfo;
  onChange: (d: BasicInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3_BasicInfo({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Partial<BasicInfo>>({});
  const [showPw, setShowPw] = useState(false);

  function validate(): boolean {
    const e: Partial<BasicInfo> = {};
    if (!data.displayName.trim()) e.displayName = 'Full name is required';
    if (!data.username.trim() || !/^[a-zA-Z0-9_]{3,30}$/.test(data.username))
      e.username = '3–30 chars, letters/numbers/underscore only';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = 'Enter a valid email address';
    if (!data.password || data.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  function field(
    key: keyof BasicInfo,
    label: string,
    placeholder: string,
    type = 'text',
    hint?: string
  ) {
    return (
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          {label} <span className="text-afro-gold">*</span>
        </label>
        <div className="relative">
          <input
            type={key === 'password' ? (showPw ? 'text' : 'password') : type}
            value={data[key]}
            onChange={e => onChange({ ...data, [key]: e.target.value })}
            placeholder={placeholder}
            className="afro-input"
            style={{ borderColor: errors[key] ? '#ef4444' : undefined }}
          />
          {key === 'password' && (
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 text-xs"
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
        {hint && !errors[key] && (
          <p className="text-xs text-white/30 mt-1">{hint}</p>
        )}
        {errors[key] && (
          <p className="text-xs text-red-400 mt-1">{errors[key]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 py-8 min-h-screen animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Your Details</h2>
        <p className="text-sm text-white/50">Tell us about yourself</p>
      </div>

      <div className="space-y-5 flex-1">
        {field('displayName', 'Full Name',     'e.g. Amara Okonkwo')}
        {field('username',    'Username',      'e.g. amara_okonkwo', 'text',
               'Letters, numbers and underscores only')}
        {field('email',       'Email Address', 'amara@example.com', 'email')}
        {field('password',    'Password',      'Min. 8 characters', 'password')}
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="ghost" size="lg" onClick={onBack} className="border border-white/15 flex-shrink-0">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={handleNext}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
