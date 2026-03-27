import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface DropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = options.find(o => o.value === value);
  const displayLabel = selected
    ? (selected.icon ? `${selected.icon} ${selected.label}` : selected.label)
    : placeholder;

  return (
    <div className="w-full space-y-1.5" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
          {required && <span className="ml-1" style={{ color: '#d4a017' }}>*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            width:        '100%',
            padding:      '12px 44px 12px 16px',
            borderRadius: 14,
            fontSize:     14,
            textAlign:    'left',
            outline:      'none',
            cursor:       'pointer',
            background:   open ? 'rgba(212,160,23,0.08)' : '#131330',
            color:        value ? '#ffffff' : 'rgba(255,255,255,0.38)',
            border:       open
              ? '1px solid #d4a017'
              : error
              ? '1px solid #ef4444'
              : '1px solid rgba(255,255,255,0.12)',
            transition:   'border-color 0.2s, background 0.2s',
            boxShadow:    open ? '0 0 0 3px rgba(212,160,23,0.12)' : 'none',
          }}
        >
          {displayLabel}
        </button>

        {/* Chevron */}
        <span
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200"
          style={{
            color: 'rgba(255,255,255,0.45)',
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>

        {/* Options list */}
        {open && (
          <div
            className="absolute left-0 right-0 z-50 overflow-y-auto"
            style={{
              top:          'calc(100% + 6px)',
              background:   '#131330',
              border:       '1px solid rgba(212,160,23,0.35)',
              borderRadius: 14,
              maxHeight:    220,
              boxShadow:    '0 8px 32px rgba(0,0,0,0.55)',
            }}
          >
            {placeholder && (
              <div
                style={{
                  padding:    '10px 16px',
                  color:      'rgba(255,255,255,0.35)',
                  fontSize:   13,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor:     'default',
                }}
              >
                {placeholder}
              </div>
            )}
            {options.filter(o => o.value !== '').map(opt => {
              const isActive = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    padding:    '11px 16px',
                    fontSize:   14,
                    color:      isActive ? '#d4a017' : '#ffffff',
                    background: isActive ? 'rgba(212,160,23,0.12)' : 'transparent',
                    cursor:     'pointer',
                    display:    'flex',
                    alignItems: 'center',
                    gap:        8,
                    transition: 'background 0.15s',
                    borderLeft: isActive ? '3px solid #d4a017' : '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {opt.icon && <span style={{ fontSize: 16 }}>{opt.icon}</span>}
                  <span>{opt.label}</span>
                  {isActive && (
                    <span className="ml-auto" style={{ color: '#d4a017', fontSize: 12 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
