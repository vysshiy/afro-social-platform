import React, { useState } from 'react';
import Button from '../ui/Button';

interface Props {
  value:            string;
  location:         string;
  onChange:         (v: string) => void;
  onLocationChange: (loc: string) => void;
  onNext:           () => void;
  onBack:           () => void;
}

const PROFILE_TYPES = [
  {
    value: 'PERSONAL',
    icon:  '👤',
    title: 'Personal',
    desc:  'Share moments, connect with friends & family',
    color: '#3b82f6',
    bg:    'rgba(59,130,246,0.08)',
  },
  {
    value: 'CREATOR',
    icon:  '🎨',
    title: 'Creator',
    desc:  'Build an audience & share original content',
    color: '#8b5cf6',
    bg:    'rgba(139,92,246,0.08)',
  },
  {
    value: 'BUSINESS',
    icon:  '🏢',
    title: 'Business',
    desc:  'Promote your brand, products & services',
    color: '#d4a017',
    bg:    'rgba(212,160,23,0.08)',
  },
];

const LOCATIONS = [
  { value: '',      label: 'Select your country…' },
  { value: 'NG',    label: '🇳🇬 Nigeria'          },
  { value: 'GH',    label: '🇬🇭 Ghana'            },
  { value: 'KE',    label: '🇰🇪 Kenya'            },
  { value: 'ZA',    label: '🇿🇦 South Africa'     },
  { value: 'ET',    label: '🇪🇹 Ethiopia'         },
  { value: 'TZ',    label: '🇹🇿 Tanzania'         },
  { value: 'EG',    label: '🇪🇬 Egypt'            },
  { value: 'CM',    label: '🇨🇲 Cameroon'         },
  { value: 'CI',    label: "🇨🇮 Côte d'Ivoire"   },
  { value: 'SN',    label: '🇸🇳 Senegal'          },
  { value: 'UG',    label: '🇺🇬 Uganda'           },
  { value: 'RW',    label: '🇷🇼 Rwanda'           },
  { value: 'MA',    label: '🇲🇦 Morocco'          },
  { value: 'OTHER', label: '🌍 Diaspora / Other'  },
];

export default function Step5_ProfileType({
  value, location, onChange, onLocationChange, onNext, onBack,
}: Props) {
  const [error, setError] = useState('');

  function handleNext() {
    if (!value) { setError('Please choose a profile type to continue.'); return; }
    setError('');
    onNext();
  }

  return (
    <div
      className="flex flex-col min-h-screen px-5 py-8 animate-fade-in"
      style={{ background: 'linear-gradient(180deg, #05050f 0%, #0a0a1a 100%)' }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Your Profile</h2>
        <p className="text-sm text-white/45 mt-1">How will you mainly use Afro Social?</p>
      </div>

      {/* Profile type cards */}
      <div className="space-y-3 mb-7">
        {PROFILE_TYPES.map(pt => {
          const isSelected = value === pt.value;
          return (
            <button
              key={pt.value}
              type="button"
              onClick={() => { onChange(pt.value); setError(''); }}
              className="w-full text-left transition-all duration-200 rounded-2xl overflow-hidden"
              style={{
                background: isSelected ? pt.bg : 'rgba(255,255,255,0.03)',
                border:     `2px solid ${isSelected ? pt.color : 'rgba(255,255,255,0.07)'}`,
                boxShadow:  isSelected ? `0 0 20px ${pt.color}22` : 'none',
              }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${pt.color}20` }}
                >
                  {pt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{pt.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{pt.desc}</p>
                </div>
                {/* Radio circle */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: isSelected ? pt.color : 'rgba(255,255,255,0.2)' }}
                >
                  {isSelected && (
                    <div
                      className="w-2.5 h-2.5 rounded-full transition-transform scale-in"
                      style={{ background: pt.color }}
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Location — dark select, fully visible */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Location
          <span className="text-white/30 text-xs font-normal ml-1">(optional)</span>
        </label>
        <div className="relative">
          <select
            value={location}
            onChange={e => onLocationChange(e.target.value)}
            style={{
              width:            '100%',
              padding:          '12px 44px 12px 16px',
              borderRadius:     14,
              fontSize:         14,
              outline:          'none',
              cursor:           'pointer',
              appearance:       'none',
              WebkitAppearance: 'none',
              MozAppearance:    'none',
              /* Dark background — fixes white-on-white visibility */
              backgroundColor:  '#131330',
              color:            location ? '#ffffff' : 'rgba(255,255,255,0.38)',
              border:           '1px solid rgba(255,255,255,0.12)',
              transition:       'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#d4a017'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            {LOCATIONS.map(l => (
              <option
                key={l.value}
                value={l.value}
                disabled={!l.value}
                style={{ background: '#131330', color: l.value ? '#fff' : 'rgba(255,255,255,0.4)' }}
              >
                {l.label}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <span
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>

      {error && (
        <p
          className="text-sm px-4 py-2.5 rounded-xl mt-2"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', color: '#fca5a5' }}
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-auto pt-6">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-shrink-0 px-5">
          ← Back
        </Button>
        <Button size="lg" fullWidth onClick={handleNext} disabled={!value}>
          Create My Account →
        </Button>
      </div>
    </div>
  );
}
