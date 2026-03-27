import React, { useRef, useEffect, useCallback, memo } from 'react';

// ─── Constants ────────────────────────────────────────────────
const ITEM_H  = 44;   // must match .wheel-item height in index.css
const VISIBLE = 5;    // must be odd so selection sits in the centre
const PAD     = Math.floor(VISIBLE / 2);   // phantom rows top + bottom

// ─── Types ────────────────────────────────────────────────────
interface DateValue { day: number; month: number; year: number }
interface Item      { label: string; val: number }
interface Props     { value: DateValue; onChange: (v: DateValue) => void }

// ─── Helpers ──────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

// ─── Single column ────────────────────────────────────────────
interface ColProps {
  label:    string;
  items:    Item[];
  selected: number;
  onSelect: (val: number) => void;
}

const WheelCol = memo(function WheelCol({ label, items, selected, onSelect }: ColProps) {
  const ref           = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  // Track whether the user is currently touching/dragging so we
  // don't fight their scroll with an external sync effect.
  const userScrolling = useRef(false);
  const touchTimer    = useRef<ReturnType<typeof setTimeout>>();

  // ── Scroll to a given index ──────────────────────────────────
  const scrollTo = useCallback((idx: number, smooth = false) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // ── Sync from external `selected` prop ──────────────────────
  // Only fires when the value changed from OUTSIDE (parent navigation,
  // month/year clamp, etc.) — never while user is scrolling.
  useEffect(() => {
    if (userScrolling.current) return;
    const idx = items.findIndex(i => i.val === selected);
    if (idx >= 0) scrollTo(idx, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, items.length]);

  // ── User interaction: mark as scrolling ─────────────────────
  function markScrolling() {
    userScrolling.current = true;
    clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => { userScrolling.current = false; }, 300);
  }

  // ── Debounced scroll-end handler ────────────────────────────
  function handleScroll() {
    markScrolling();
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const rawIdx  = el.scrollTop / ITEM_H;
      const idx     = Math.round(rawIdx);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      // Snap to exact position
      scrollTo(clamped, true);
      // Notify parent
      if (items[clamped]) onSelect(items[clamped].val);
      // Allow external sync again after a short delay
      setTimeout(() => { userScrolling.current = false; }, 350);
    }, 80);
  }

  const phantom = Array<null>(PAD).fill(null);

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Column label */}
      <span
        className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: 'rgba(255,255,255,0.38)' }}
      >
        {label}
      </span>

      <div className="relative w-full">
        {/* ── Selection highlight bar ── */}
        <div
          className="pointer-events-none absolute left-0 right-0 rounded-xl z-10"
          style={{
            top:        PAD * ITEM_H,
            height:     ITEM_H,
            background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.08))',
            border:     '1px solid rgba(212,160,23,0.4)',
          }}
        />
        {/* ── Top fade ── */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-20"
          style={{
            height:     PAD * ITEM_H,
            background: 'linear-gradient(to bottom, #05050f 15%, transparent 100%)',
          }}
        />
        {/* ── Bottom fade ── */}
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 z-20"
          style={{
            height:     PAD * ITEM_H,
            background: 'linear-gradient(to top, #05050f 15%, transparent 100%)',
          }}
        />

        {/* ── Scrollable list ── */}
        <div
          ref={ref}
          className="wheel-column"
          onScroll={handleScroll}
          onTouchStart={markScrolling}
          onMouseDown={markScrolling}
        >
          {/* Top phantom rows (padding) */}
          {phantom.map((_, i) => (
            <div key={`t${i}`} style={{ height: ITEM_H, flexShrink: 0 }} />
          ))}

          {items.map(item => {
            const isSelected = item.val === selected;
            return (
              <div
                key={item.val}
                className={`wheel-item${isSelected ? ' selected' : ''}`}
                onClick={() => {
                  const idx = items.findIndex(i => i.val === item.val);
                  scrollTo(idx, true);
                  onSelect(item.val);
                }}
              >
                {item.label}
              </div>
            );
          })}

          {/* Bottom phantom rows (padding) */}
          {phantom.map((_, i) => (
            <div key={`b${i}`} style={{ height: ITEM_H, flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Main DateWheelPicker ─────────────────────────────────────
export default function DateWheelPicker({ value, onChange }: Props) {
  const now     = new Date();
  const maxYear = now.getFullYear() - 13;
  const minYear = 1920;

  const maxDay = daysInMonth(value.month, value.year);
  const days   = Array.from({ length: maxDay }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    val:   i + 1,
  }));
  const months = MONTHS.map((m, i) => ({ label: m, val: i + 1 }));
  const years  = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const y = maxYear - i;
    return { label: String(y), val: y };
  });

  // Clamp day when month/year changes (e.g. from 31 Jan → 28 Feb)
  useEffect(() => {
    const max = daysInMonth(value.month, value.year);
    if (value.day > max) onChange({ ...value, day: max });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.month, value.year]);

  return (
    <div className="flex gap-2 w-full" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
