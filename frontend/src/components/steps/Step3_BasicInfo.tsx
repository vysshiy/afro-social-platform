import React, { useState } from 'react';
import Button from '../ui/Button';

interface BasicInfo {
  displayName: string;
  username:    string;
  email:       string;
  password:    string;
}

interface Props {
  data:     BasicInfo;
  onChange: (d: BasicInfo) => void;
  onNext:   () => void;
  onBack:   () => void;
}

export default function Step3_BasicInfo({ data, onChange, onNext, onBack }: Props) {
  const [errors,  setErrors]  = useState<Partial<BasicInfo>>({});
  const [showPw,  setShowPw]  = useState(false);
  const [focused, setFocused] = useState<keyof BasicInfo | null>(null);

  function validate(): boolean {
    const e: Partial<BasicInfo> = {};
    if (!data.displayName.trim())
      e.displayName = 'Full name is required';
    if (!data.username.trim() || !/^[a-zA-Z0-9_]{3,30}$/.test(data.username))
      e.username = '3–30 chars, letters / numbers / underscore only';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = 'Please enter a valid email address';
    if (!data.password || data.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function set(key: keyof BasicInfo, val: string) {
    onChange({ ...data, [key]: val });
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function Field({
    field, label, placeholder, type = 'text', hint,
  }: {
    field: keyof BasicInfo; label: string; placeholder: string; type?: string; hint?: string;
  }) {
    const isFocused = focused === field;
    const hasError  = !!errors[field];
    return (
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {label} <span style={{ color: '#d4a017' }}>*</span>
        </label>
        <div className="relative">
          <input
            type={field === 'password' ? (showPw ? 'text' : 'password') : type}
            value={data[field]}
            onChange={e => set(field, e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocused(field)}
            onBlur={() => setFocused(null)}
            autoComplete={
              field === 'email' ? 'email' :
              field === 'password' ? 'new-password' :
              field === 'username' ? 'username' : 'name'
            }
            style={{
              width:           '100%',
              padding:         field === 'password' ? '12px 52px 12px 16px' : '12px 16px',
              borderRadius:    14,
              fontSize:        14,
              outline:         'none',
              background:      isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
              border:          hasError
                ? '1.5px solid #ef4444'
                : isFocused
                ? '1.5px solid #d4a017'
                : '1.5px solid rgba(255,255,255,0.1)',
              color:           '#ffffff',
              transition:      'border-color 0.2s, background 0.2s',
              boxShadow:       isFocused && !hasError ? '0 0 0 3px rgba(212,160,23,0.12)' : 'none',
            }}
          />
          {/* Placeholder color handled via CSS */}
          {field === 'password' && (
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors px-1"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {showPw ? '🙈 Hide' : '👁 Show'}
            </button>
          )}
        </div>
        {hint && !hasError && (
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{hint}</p>
        )}
        {hasError && (
          <p className="text-xs mt-1.5" style={{ color: '#fca5a5' }}>{errors[field]}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen px-5 py-8 animate-fade-in"
      style={{ background: 'linear-gradient(180deg,#05050f 0%,#0a0a1a 100%)' }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Your Details</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Tell us a little about yourself
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <Field
          field="displayName"
          label="Full Name"
          placeholder="e.g. Amara Okonkwo"
        />
        <Field
          field="username"
          label="Username"
          placeholder="e.g. amara_okonkwo"
          hint="Letters, numbers and underscores only · 3–30 characters"
        />
        <Field
          field="email"
          label="Email Address"
          placeholder="amara@example.com"
          type="email"
        />
        <Field
          field="password"
          label="Password"
          placeholder="Min. 8 characters"
          type="password"
          hint="At least 8 characters"
        />
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-shrink-0 px-5">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={() => { if (validate()) onNext(); }}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
