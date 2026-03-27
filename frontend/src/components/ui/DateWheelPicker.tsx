import React, { useRef, useEffect, useCallback } from 'react';

interface DateValue { day: number; month: number; year: number }

interface Props {
  value:    DateValue;
  onChange: (val: DateValue) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const ITEM_H   = 44;    // px per item
const VISIBLE  = 5;     // must be odd
const PAD      = Math.floor(VISIBLE / 2);  // = 2

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

// ─────────────────────────────────────────────
// Single scrollable column
// ─────────────────────────────────────────────
interface ColProps {
  label:    string;
  items:    { label: string; val: number }[];
  selected: number;
  onSelect: (val: number) => void;
}

const WheelCol = React.memo(function WheelCol({ label, items, selected, onSelect }: ColProps) {
  const ref       = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout>>();

  // Scroll to correct index
  const scrollToIdx = useCallback((idx: number, smooth = false) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // On mount and when selected changes externally, sync scroll
  useEffect(() => {
    const idx = items.findIndex(i => i.val === selected);
    if (idx >= 0) scrollToIdx(idx, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, items.length]);

  function handleScroll() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const rawIdx = el.scrollTop / ITEM_H;
      const idx    = Math.round(rawIdx);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      // Snap to nearest item
      scrollToIdx(clamped, true);
      if (items[clamped]) onSelect(items[clamped].val);
    }, 80);
  }

  const phantom = Array(PAD).fill(null);

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-1.5">
        {label}
      </span>
      <div className="relative w-full">
        {/* Selection highlight */}
        <div
          className="pointer-events-none absolute left-0 right-0 rounded-xl z-10"
          style={{
            top:    PAD * ITEM_H,
            height: ITEM_H,
            background: 'linear-gradient(135deg,rgba(212,160,23,0.18),rgba(212,160,23,0.08))',
            border: '1px solid rgba(212,160,23,0.35)',
          }}
        />
        {/* Top fade */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-20"
          style={{
            height: PAD * ITEM_H,
            background: 'linear-gradient(to bottom, #0a0a1a 10%, transparent 100%)',
          }}
        />
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 z-20"
          style={{
            height: PAD * ITEM_H,
            background: 'linear-gradient(to top, #0a0a1a 10%, transparent 100%)',
          }}
        />
        <div
          ref={ref}
          className="wheel-column"
          style={{ height: VISIBLE * ITEM_H }}
          onScroll={handleScroll}
        >
          {/* Top padding */}
          {phantom.map((_, i) => <div key={`t${i}`} style={{ height: ITEM_H, flexShrink: 0 }} />)}

          {items.map(item => {
            const isSelected = item.val === selected;
            return (
              <div
                key={item.val}
                onClick={() => {
                  const idx = items.findIndex(i => i.val === item.val);
                  scrollToIdx(idx, true);
                  onSelect(item.val);
                }}
                style={{
                  height:     ITEM_H,
                  flexShrink: 0,
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor:     'pointer',
                  userSelect: 'none',
                  fontSize:   isSelected ? '1.15rem' : '0.875rem',
                  fontWeight: isSelected ? 700 : 400,
                  color:      isSelected ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  transition: 'color 0.15s, font-size 0.15s',
                  scrollSnapAlign: 'center',
                }}
              >
                {item.label}
              </div>
            );
          })}

          {/* Bottom padding */}
          {phantom.map((_, i) => <div key={`b${i}`} style={{ height: ITEM_H, flexShrink: 0 }} />)}
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────
// Main DateWheelPicker
// ─────────────────────────────────────────────
export default function DateWheelPicker({ value, onChange }: Props) {
  const now    = new Date();
  const maxYear = now.getFullYear() - 13;
  const minYear = 1920;

  const maxDay  = daysInMonth(value.month, value.year);
  const days    = Array.from({ length: maxDay },  (_, i) => ({ label: String(i + 1).padStart(2,'0'), val: i + 1 }));
  const months  = MONTHS.map((m, i)  => ({ label: m, val: i + 1 }));
  const years   = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const y = maxYear - i;
    return { label: String(y), val: y };
  });

  // Clamp day when month/year changes
  useEffect(() => {
    const max = daysInMonth(value.month, value.year);
    if (value.day > max) onChange({ ...value, day: max });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.month, value.year]);

  return (
    <div
      className="flex gap-2 w-full"
      style={{ userSelect: 'none' }}
    >
      <WheelCol
        label="Day"
        items={days}
        selected={value.day}
        onSelect={d => onChange({ ...value, day: d })}
      />
      <WheelCol
        label="Month"
        items={months}
        selected={value.month}
        onSelect={m => onChange({ ...value, month: m })}
      />
      <WheelCol
        label="Year"
        items={years}
        selected={value.year}
        onSelect={y => onChange({ ...value, year: y })}
      />
    </div>
  );
}
