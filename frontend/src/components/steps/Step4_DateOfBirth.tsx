import React, { useState, useMemo } from 'react';
import DateWheelPicker from '../ui/DateWheelPicker';
import Button from '../ui/Button';

interface Props {
  value:    { day: number; month: number; year: number };
  onChange: (v: { day: number; month: number; year: number }) => void;
  onNext:   () => void;
  onBack:   () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function calcAge(day: number, month: number, year: number): number {
  const today = new Date();
  const dob   = new Date(year, month - 1, day);
  let age     = today.getFullYear() - dob.getFullYear();
  const m     = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function Step4_DateOfBirth({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  const age           = useMemo(() => calcAge(value.day, value.month, value.year), [value]);
  const isValidAge    = age >= 13 && age <= 120;
  const formattedDate = `${String(value.day).padStart(2, '0')} ${MONTH_NAMES[value.month - 1]} ${value.year}`;

  function handleNext() {
    if (age < 13)  { setError('You must be at least 13 years old to join.'); return; }
    if (age > 120) { setError('Please enter a valid date of birth.'); return; }
    setError('');
    onNext();
  }

  // Age display text + colour
  let ageColor = '#10b981';
  let ageText  = `${age} years old`;
  if (age < 13)  { ageColor = '#ef4444'; ageText = 'Too young (must be 13+)'; }
  if (age > 120) { ageColor = '#ef4444'; ageText = 'Invalid date'; }

  return (
    <div
      className="flex flex-col min-h-screen px-5 py-8 animate-fade-in"
      style={{ background: 'linear-gradient(180deg, #05050f 0%, #0a0a1a 100%)' }}
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white">Date of Birth</h2>
        <p className="text-sm text-white/45 mt-1">
          Scroll the wheels — the highlighted row is your selection
        </p>
      </div>

      {/* Selected date card */}
      <div
        className="rounded-2xl px-5 py-4 mb-5 text-center"
        style={{
          background: 'linear-gradient(135deg,rgba(212,160,23,0.1),rgba(212,160,23,0.04))',
          border: '1px solid rgba(212,160,23,0.25)',
        }}
      >
        <p
          className="text-2xl font-bold tracking-wide"
          style={{ color: '#d4a017' }}
        >
          {formattedDate}
        </p>
        <p className="text-sm mt-1 font-medium" style={{ color: ageColor }}>
          {ageText}
        </p>
      </div>

      {/* Wheel picker container */}
      <div
        className="rounded-2xl px-3 pt-4 pb-2 mb-4 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <DateWheelPicker
          value={value}
          onChange={v => { onChange(v); setError(''); }}
        />
      </div>

      {/* Instruction */}
      <div className="flex items-start gap-2.5 px-1 mb-3">
        <span className="text-base mt-0.5 flex-shrink-0">💡</span>
        <p className="text-xs text-white/35 leading-relaxed">
          Scroll up or down in each column to change Day, Month, or Year.
          The bright row in the centre is selected. Tap any item to jump directly.
        </p>
      </div>

      {error && (
        <div
          className="text-sm text-center px-4 py-2.5 rounded-xl mb-3"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-4">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-shrink-0 px-5">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={handleNext} disabled={!isValidAge}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
