import React, { useState } from 'react';
import Button from '../ui/Button';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROFILE_TYPES = [
  {
    value: 'PERSONAL',
    icon: '👤',
    title: 'Personal',
    desc: 'Share moments, connect with friends & family',
    color: '#3b82f6',
  },
  {
    value: 'CREATOR',
    icon: '🎨',
    title: 'Creator',
    desc: 'Build an audience & monetise your content',
    color: '#8b5cf6',
  },
  {
    value: 'BUSINESS',
    icon: '🏢',
    title: 'Business',
    desc: 'Promote products, services & your brand',
    color: '#d4a017',
  },
];

const LOCATIONS = [
  { value: '', label: 'Select your country' },
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'GH', label: '🇬🇭 Ghana' },
  { value: 'KE', label: '🇰🇪 Kenya' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
  { value: 'ET', label: '🇪🇹 Ethiopia' },
  { value: 'TZ', label: '🇹🇿 Tanzania' },
  { value: 'EG', label: '🇪🇬 Egypt' },
  { value: 'CM', label: '🇨🇲 Cameroon' },
  { value: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
  { value: 'SN', label: '🇸🇳 Senegal' },
  { value: 'OTHER', label: '🌍 Other (Diaspora)' },
];

export default function Step5_ProfileType({ value, onChange, onNext, onBack }: Props) {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  function handleNext() {
    if (!value) { setError('Please choose a profile type'); return; }
    setError('');
    onNext();
  }

  return (
    <div className="flex flex-col px-5 py-8 min-h-screen animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Profile Type</h2>
        <p className="text-sm text-white/50">How will you mainly use Afro Social?</p>
      </div>

      {/* Card selector */}
      <div className="space-y-3 mb-7">
        {PROFILE_TYPES.map(pt => (
          <button
            key={pt.value}
            type="button"
            onClick={() => { onChange(pt.value); setError(''); }}
            className="w-full text-left transition-all duration-200 rounded-2xl overflow-hidden"
            style={{
              border: value === pt.value
                ? `2px solid ${pt.color}`
                : '2px solid rgba(255,255,255,0.08)',
              background: value === pt.value
                ? `${pt.color}18`
                : 'rgba(255,255,255,0.03)',
            }}
          >
            <div className="flex items-center gap-4 px-5 py-4">
              <span
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${pt.color}22` }}
              >
                {pt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{pt.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{pt.desc}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: value === pt.value ? pt.color : 'rgba(255,255,255,0.2)' }}
              >
                {value === pt.value && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: pt.color }} />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Location dropdown — dark styled, no white-on-white */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          Location <span className="text-white/30 text-xs">(optional)</span>
        </label>
        <div className="relative">
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            style={{
              backgroundColor: '#1a1a3e',
              color: location ? '#ffffff' : 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.18)',
              appearance: 'none',
              WebkitAppearance: 'none',
              width: '100%',
              padding: '12px 40px 12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            {LOCATIONS.map(l => (
              <option
                key={l.value}
                value={l.value}
                style={{ background: '#1a1a3e', color: l.value ? '#ffffff' : 'rgba(255,255,255,0.4)' }}
                disabled={!l.value}
              >
                {l.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      <div className="flex gap-3 mt-auto pt-6">
        <Button variant="ghost" size="lg" onClick={onBack} className="border border-white/15 flex-shrink-0">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={handleNext} disabled={!value}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
