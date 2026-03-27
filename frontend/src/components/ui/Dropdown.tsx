import React from 'react';

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
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-white/70">
          {label}
          {required && <span className="text-afro-gold ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Custom select wrapper — ensures dark bg on all browsers */}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          style={{
            backgroundColor: '#1a1a3e',
            color: value ? '#ffffff' : 'rgba(255,255,255,0.4)',
            border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.18)',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
          className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all
            focus:border-afro-gold focus:shadow-[0_0_0_2px_rgba(212,160,23,0.25)]"
        >
          {placeholder && (
            <option value="" disabled style={{ color: 'rgba(255,255,255,0.4)', background: '#1a1a3e' }}>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: '#1a1a3e', color: '#ffffff' }}
            >
              {opt.icon ? `${opt.icon} ` : ''}{opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
