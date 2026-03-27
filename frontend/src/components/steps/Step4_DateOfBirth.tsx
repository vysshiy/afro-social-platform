import React, { useState } from 'react';
import DateWheelPicker from '../ui/DateWheelPicker';
import Button from '../ui/Button';

interface Props {
  value: { day: number; month: number; year: number };
  onChange: (v: { day: number; month: number; year: number }) => void;
  onNext: () => void;
  onBack: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getAge(day: number, month: number, year: number): number {
  const today = new Date();
  const dob = new Date(year, month - 1, day);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function Step4_DateOfBirth({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  function handleNext() {
    const age = getAge(value.day, value.month, value.year);
    if (age < 13) {
      setError('You must be at least 13 years old to join.');
      return;
    }
    if (age > 120) {
      setError('Please enter a valid date of birth.');
      return;
    }
    setError('');
    onNext();
  }

  const age = getAge(value.day, value.month, value.year);
  const formattedDate = `${String(value.day).padStart(2, '0')} ${MONTHS[value.month - 1]} ${value.year}`;

  return (
    <div className="flex flex-col px-5 py-8 min-h-screen animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Date of Birth</h2>
        <p className="text-sm text-white/50">
          Scroll the wheels to set your birthday
        </p>
      </div>

      {/* Selected date display */}
      <div className="glass-card px-5 py-4 mb-6 text-center">
        <p className="text-2xl font-bold text-afro-gold">{formattedDate}</p>
        {age >= 0 && age <= 120 && (
          <p className="text-sm text-white/50 mt-1">
            {age >= 13 ? `Age: ${age}` : (
              <span className="text-red-400">Must be at least 13 years old</span>
            )}
          </p>
        )}
      </div>

      {/* Wheel picker */}
      <div
        className="glass-card px-4 pt-5 pb-3 mb-4"
        style={{
          background: 'rgba(15,15,42,0.9)',
          border: '1px solid rgba(212,160,23,0.2)',
        }}
      >
        <DateWheelPicker value={value} onChange={v => { onChange(v); setError(''); }} />
      </div>

      {/* How to use hint */}
      <div className="flex items-start gap-2 px-1 mb-2">
        <span className="text-lg mt-0.5">💡</span>
        <p className="text-xs text-white/40">
          Scroll each column up or down to change the day, month, or year.
          The highlighted row is your selection.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center mt-1 mb-2">{error}</p>
      )}

      <div className="flex gap-3 mt-auto pt-4">
        <Button variant="ghost" size="lg" onClick={onBack} className="border border-white/15 flex-shrink-0">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={handleNext} disabled={age < 13}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
