import React, { useState } from 'react';
import Button from '../ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: InputRow is defined OUTSIDE Step3_BasicInfo to prevent React from
// treating it as a new component type on every parent render. If defined inside,
// each keystroke causes the input to unmount and remount, losing focus.
// ─────────────────────────────────────────────────────────────────────────────
interface InputRowProps {
  id:          string;
  label:       string;
  placeholder: string;
  value:       string;
  type?:       string;
  hint?:       string;
  error?:      string;
  required?:   boolean;
  rightSlot?:  React.ReactNode;
  onChange:    (v: string) => void;
}

function InputRow({
  id, label, placeholder, value, type = 'text', hint, error, required,
  rightSlot, onChange,
}: InputRowProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'rgba(255,255,255,0.65)' }}
      >
        {label}
        {required && <span className="ml-1" style={{ color: '#d4a017' }}>*</span>}
        {!required && (
          <span className="ml-1.5 text-xs font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
            (optional)
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={
            id === 'email'    ? 'email'         :
            id === 'password' ? 'new-password'  :
            id === 'confirm'  ? 'new-password'  :
            id === 'username' ? 'username'      :
            id === 'phone'    ? 'tel'           : 'name'
          }
          style={{
            width:      '100%',
            padding:    rightSlot ? '12px 52px 12px 16px' : '12px 16px',
            borderRadius: 14,
            fontSize:   14,
            outline:    'none',
            background: focused
              ? 'rgba(212,160,23,0.07)'
              : hasError
              ? 'rgba(239,68,68,0.06)'
              : 'rgba(255,255,255,0.05)',
            border: hasError
              ? '1.5px solid #ef4444'
              : focused
              ? '1.5px solid #d4a017'
              : '1.5px solid rgba(255,255,255,0.1)',
            color:      '#ffffff',
            transition: 'border-color 0.2s, background 0.2s',
            boxShadow:  focused && !hasError
              ? '0 0 0 3px rgba(212,160,23,0.1)'
              : hasError
              ? '0 0 0 3px rgba(239,68,68,0.08)'
              : 'none',
            caretColor: '#d4a017',
          }}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {hint && !hasError && (
        <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{hint}</p>
      )}
      {hasError && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#fca5a5' }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#374151' };
  let score = 0;
  if (pw.length >= 8)                   score++;
  if (pw.length >= 12)                  score++;
  if (/[A-Z]/.test(pw))                 score++;
  if (/[0-9]/.test(pw))                 score++;
  if (/[^A-Za-z0-9]/.test(pw))         score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 3) return { score, label: 'Fair',   color: '#f59e0b' };
  if (score <= 4) return { score, label: 'Strong', color: '#10b981' };
  return           { score, label: 'Very strong',  color: '#06b6d4' };
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface BasicInfo {
  displayName: string;
  username:    string;
  phone:       string;
  email:       string;
  password:    string;
}

interface Props {
  data:     BasicInfo;
  onChange: (d: BasicInfo) => void;
  onNext:   () => void;
  onBack:   () => void;
}

type FieldKey = keyof BasicInfo;

export default function Step3_BasicInfo({ data, onChange, onNext, onBack }: Props) {
  const [errors,      setErrors]      = useState<Partial<Record<FieldKey | 'confirm', string>>>({});
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsOk,     setTermsOk]     = useState(false);

  const strength = passwordStrength(data.password);

  function set(key: FieldKey, val: string) {
    onChange({ ...data, [key]: val });
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<FieldKey | 'confirm', string>> = {};

    if (!data.displayName.trim())
      e.displayName = 'Full name is required';

    if (!data.username.trim() || !/^[a-zA-Z0-9_]{3,30}$/.test(data.username))
      e.username = '3–30 characters · letters, numbers and underscores only';

    if (data.phone && !/^\+?[0-9\s\-()]{7,20}$/.test(data.phone))
      e.phone = 'Enter a valid phone number or leave blank';

    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = 'Enter a valid email address';

    if (!data.password || data.password.length < 8)
      e.password = 'Password must be at least 8 characters';

    if (data.password !== confirmPw)
      e.confirm = 'Passwords do not match';

    if (!termsOk)
      e.confirm = (e.confirm ? e.confirm + ' · ' : '') + 'Please accept the terms to continue';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const pwToggleBtn = (
    <button
      type="button"
      onClick={() => setShowPw(v => !v)}
      className="text-xs transition-colors px-1"
      style={{ color: 'rgba(255,255,255,0.4)' }}
    >
      {showPw ? '🙈 Hide' : '👁 Show'}
    </button>
  );

  const confirmToggleBtn = (
    <button
      type="button"
      onClick={() => setShowConfirm(v => !v)}
      className="text-xs transition-colors px-1"
      style={{ color: 'rgba(255,255,255,0.4)' }}
    >
      {showConfirm ? '🙈 Hide' : '👁 Show'}
    </button>
  );

  return (
    <div
      className="flex flex-col min-h-screen px-5 py-8 animate-fade-in"
      style={{ background: 'linear-gradient(180deg, #05050f 0%, #0a0a1a 100%)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Your Details</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Fill in your information — fields marked <span style={{ color: '#d4a017' }}>*</span> are required
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Full Name */}
        <InputRow
          id="displayName"
          label="Full Name"
          placeholder="e.g. Amara Okonkwo"
          value={data.displayName}
          error={errors.displayName}
          required
          onChange={v => set('displayName', v)}
        />

        {/* Username */}
        <InputRow
          id="username"
          label="Username"
          placeholder="e.g. amara_ok"
          value={data.username}
          error={errors.username}
          hint="Letters, numbers and underscores · 3–30 characters"
          required
          onChange={v => set('username', v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
        />

        {/* Phone */}
        <InputRow
          id="phone"
          label="Phone Number"
          placeholder="+234 800 000 0000"
          value={data.phone}
          type="tel"
          error={errors.phone}
          hint="Include country code, e.g. +234 for Nigeria"
          onChange={v => set('phone', v)}
        />

        {/* Email */}
        <InputRow
          id="email"
          label="Email Address"
          placeholder="amara@example.com"
          value={data.email}
          type="email"
          error={errors.email}
          required
          onChange={v => set('email', v)}
        />

        {/* Password */}
        <div className="space-y-1">
          <InputRow
            id="password"
            label="Password"
            placeholder="Min. 8 characters"
            value={data.password}
            type={showPw ? 'text' : 'password'}
            error={errors.password}
            required
            rightSlot={pwToggleBtn}
            onChange={v => set('password', v)}
          />
          {/* Strength bar */}
          {data.password.length > 0 && (
            <div className="pt-1">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: n <= strength.score
                        ? strength.color
                        : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="text-xs" style={{ color: strength.color }}>
                  {strength.label} password
                </p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <InputRow
          id="confirm"
          label="Confirm Password"
          placeholder="Type your password again"
          value={confirmPw}
          type={showConfirm ? 'text' : 'password'}
          error={errors.confirm}
          required
          rightSlot={confirmToggleBtn}
          onChange={v => {
            setConfirmPw(v);
            if (errors.confirm) setErrors(prev => ({ ...prev, confirm: undefined }));
          }}
        />

        {/* Terms & Conditions */}
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{
            background: termsOk
              ? 'rgba(16,185,129,0.08)'
              : 'rgba(255,255,255,0.03)',
            border: termsOk
              ? '1px solid rgba(16,185,129,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <button
            type="button"
            onClick={() => setTermsOk(v => !v)}
            className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all"
            style={{
              background: termsOk ? '#10b981' : 'rgba(255,255,255,0.08)',
              border:     termsOk ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
            }}
          >
            {termsOk && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            I agree to the{' '}
            <span style={{ color: '#d4a017' }} className="cursor-pointer hover:underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span style={{ color: '#d4a017' }} className="cursor-pointer hover:underline">
              Privacy Policy
            </span>
            . My data is used only to personalise my Afro Social experience.
          </p>
        </div>
      </div>

      {/* Nav */}
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
