import React, { useState, useCallback, useRef } from 'react';
import Button from '../ui/Button';

interface Props {
  value:    { day: number; month: number; year: number };
  onChange: (v: { day: number; month: number; year: number }) => void;
  onNext:   () => void;
  onBack:   () => void;
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(m: number, y: number) { return new Date(y, m, 0).getDate(); }

function calcAge(day: number, month: number, year: number): number {
  if (!day || !month || !year || year < 1000) return -1;
  const today = new Date();
  const dob   = new Date(year, month - 1, day);
  if (isNaN(dob.getTime())) return -1;
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ── NumField accepts an inputRef so the parent can focus it programmatically ──
// NOTE: This is a module-level function to avoid recreation on each render.
interface NumFieldProps {
  id:          string;
  label:       string;
  value:       string;
  placeholder: string;
  min:         number;
  max:         number;
  maxLen:      number;
  onChange:    (v: string) => void;
  onAdvance?:  () => void;          // called when field is complete — moves focus
  inputRef?:   React.RefObject<HTMLInputElement>;
}

function NumField({
  id, label, value, placeholder, min, max, maxLen,
  onChange, onAdvance, inputRef,
}: NumFieldProps) {
  const [focused, setFocused] = useState(false);

  function handle(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, maxLen);
    onChange(digits);
    if (digits.length === maxLen && onAdvance) {
      const num = parseInt(digits, 10);
      if (num >= min && num <= max) onAdvance();
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        placeholder={placeholder}
        maxLength={maxLen}
        onChange={e => handle(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          textAlign:     'center',
          fontSize:      '1.6rem',
          fontWeight:    700,
          letterSpacing: '0.05em',
          color:         '#ffffff',
          background:    focused ? 'rgba(212,160,23,0.1)' : 'rgba(255,255,255,0.05)',
          border:        focused
            ? '2px solid #d4a017'
            : '2px solid rgba(255,255,255,0.1)',
          borderRadius:  16,
          padding:       '18px 8px',
          outline:       'none',
          width:         '100%',
          transition:    'border-color 0.2s, background 0.2s',
          boxShadow:     focused ? '0 0 0 4px rgba(212,160,23,0.12)' : 'none',
          caretColor:    '#d4a017',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Step4_DateOfBirth({ value, onChange, onNext, onBack }: Props) {
  const [dd,    setDd]    = useState(value.day   ? String(value.day).padStart(2, '0')   : '');
  const [mm,    setMm]    = useState(value.month ? String(value.month).padStart(2, '0') : '');
  const [yyyy,  setYyyy]  = useState(value.year  > 1000 ? String(value.year)            : '');
  const [error, setError] = useState('');

  // ── Real refs that point directly to the NumField <input> elements ──
  const mmRef   = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  const sync = useCallback((d: string, m: string, y: string) => {
    const day   = parseInt(d, 10) || 0;
    const month = parseInt(m, 10) || 0;
    const year  = parseInt(y, 10) || 0;
    if (day && month && year >= 1000) onChange({ day, month, year });
  }, [onChange]);

  function handleDd(v: string) {
    setDd(v);
    sync(v, mm, yyyy);
    // advance to MM when DD is fully typed and valid
    if (v.length === 2) mmRef.current?.focus();
  }
  function handleMm(v: string) {
    setMm(v);
    sync(dd, v, yyyy);
    // advance to YYYY when MM is fully typed and valid
    if (v.length === 2) yyyyRef.current?.focus();
  }
  function handleYyyy(v: string) {
    setYyyy(v);
    sync(dd, mm, v);
  }

  const day   = parseInt(dd,   10) || 0;
  const month = parseInt(mm,   10) || 0;
  const year  = parseInt(yyyy, 10) || 0;
  const age   = calcAge(day, month, year);

  const monthName = month >= 1 && month <= 12 ? MONTH_NAMES[month] : '';
  const maxDay    = (month && year > 1000) ? daysInMonth(month, year) : 31;
  const dateReady = dd.length === 2 && mm.length === 2 && yyyy.length === 4;

  let ageColor = '#10b981';
  let ageText  = age >= 0 ? `${age} years old` : '';
  if (age >= 0 && age < 13)  { ageColor = '#ef4444'; ageText = 'You must be at least 13 years old'; }
  if (age > 120)             { ageColor = '#ef4444'; ageText = 'Please enter a valid birth year'; }

  function handleNext() {
    if (!dateReady) { setError('Please fill in day, month and year.'); return; }
    if (day < 1 || day > maxDay) { setError(`Day must be between 1 and ${maxDay}.`); return; }
    if (month < 1 || month > 12) { setError('Month must be between 1 and 12.'); return; }
    if (year < 1900 || year > new Date().getFullYear() - 13)
      { setError('Please enter a valid birth year.'); return; }
    if (age < 13) { setError('You must be at least 13 years old to join.'); return; }
    setError('');
    onNext();
  }

  return (
    <div
      className="flex flex-col min-h-screen px-5 py-8 animate-fade-in"
      style={{ background: 'linear-gradient(180deg, #05050f 0%, #0a0a1a 100%)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Date of Birth</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Type your birthday — cursor jumps automatically
        </p>
      </div>

      {/* Three fields */}
      <div className="flex gap-3 mb-5">
        <NumField
          id="dob-dd"
          label="Day"
          value={dd}
          placeholder="DD"
          min={1} max={31} maxLen={2}
          onChange={handleDd}
        />
        <div className="flex items-center pb-1 pt-8 select-none" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 24 }}>
          /
        </div>
        <NumField
          id="dob-mm"
          label="Month"
          value={mm}
          placeholder="MM"
          min={1} max={12} maxLen={2}
          onChange={handleMm}
          inputRef={mmRef}
        />
        <div className="flex items-center pb-1 pt-8 select-none" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 24 }}>
          /
        </div>
        <NumField
          id="dob-yyyy"
          label="Year"
          value={yyyy}
          placeholder="YYYY"
          min={1900} max={new Date().getFullYear() - 13} maxLen={4}
          onChange={handleYyyy}
          inputRef={yyyyRef}
        />
      </div>

      {/* Live date summary */}
      {(dd || mm || yyyy) && (
        <div
          className="rounded-2xl px-5 py-4 mb-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(212,160,23,0.1), rgba(212,160,23,0.04))',
            border:     '1px solid rgba(212,160,23,0.2)',
          }}
        >
          <p className="text-lg font-bold" style={{ color: '#d4a017' }}>
            {dd || '—'} {monthName || (mm ? `Month ${mm}` : '—')} {yyyy || '—'}
          </p>
          {ageText && (
            <p className="text-sm mt-1 font-medium" style={{ color: ageColor }}>
              {ageText}
            </p>
          )}
        </div>
      )}

      {/* Hint */}
      <div className="flex items-start gap-2.5 px-1 mb-4">
        <span className="text-base mt-0.5 flex-shrink-0">💡</span>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Example: Day <strong className="text-white/55">15</strong> · Month{' '}
          <strong className="text-white/55">08</strong> · Year{' '}
          <strong className="text-white/55">1995</strong> — the cursor moves
          automatically as you finish each field.
        </p>
      </div>

      {error && (
        <div
          className="text-sm text-center px-4 py-3 rounded-xl mb-4"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border:     '1px solid rgba(239,68,68,0.3)',
            color:      '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-2">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-shrink-0 px-5">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={handleNext} disabled={!dateReady}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
