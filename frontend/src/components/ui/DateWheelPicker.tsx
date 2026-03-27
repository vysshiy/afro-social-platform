import React, { useRef, useEffect, useCallback } from 'react';

interface DateWheelPickerProps {
  value: { day: number; month: number; year: number };
  onChange: (val: { day: number; month: number; year: number }) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ITEM_H = 42;
const VISIBLE = 5; // odd number — selected is centre

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export default function DateWheelPicker({ value, onChange }: DateWheelPickerProps) {
  const currentYear = new Date().getFullYear();
  const minYear = 1920;
  const maxYear = currentYear - 13; // must be at least 13

  const days  = Array.from({ length: getDaysInMonth(value.month, value.year) }, (_, i) => i + 1);
  const months = MONTHS.map((m, i) => ({ label: m, val: i + 1 }));
  const years  = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const dayRef   = useRef<HTMLDivElement>(null);
  const monRef   = useRef<HTMLDivElement>(null);
  const yearRef  = useRef<HTMLDivElement>(null);

  // Scroll a column to the selected item
  const scrollTo = useCallback(
    (ref: React.RefObject<HTMLDivElement>, index: number) => {
      if (!ref.current) return;
      const target = (index) * ITEM_H;
      ref.current.scrollTo({ top: target, behavior: 'smooth' });
    },
    []
  );

  // Initialise scroll positions
  useEffect(() => {
    scrollTo(dayRef,  days.indexOf(value.day));
    scrollTo(monRef,  value.month - 1);
    scrollTo(yearRef, years.indexOf(value.year));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clamp day when month/year changes
  useEffect(() => {
    const maxDay = getDaysInMonth(value.month, value.year);
    if (value.day > maxDay) onChange({ ...value, day: maxDay });
  }, [value.month, value.year]);

  function onScroll(
    ref: React.RefObject<HTMLDivElement>,
    items: number[],
    field: 'day' | 'year'
  ) {
    return () => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onChange({ ...value, [field]: items[clamped] });
    };
  }

  function onMonthScroll() {
    if (!monRef.current) return;
    const idx = Math.round(monRef.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, 11));
    onChange({ ...value, month: clamped + 1 });
  }

  const pad = Math.floor(VISIBLE / 2); // 2 phantom items top/bottom

  return (
    <div className="flex gap-2 w-full select-none">
      {/* Day */}
      <WheelColumn
        ref={dayRef}
        items={days.map(d => ({ label: String(d).padStart(2, '0'), val: d }))}
        selected={value.day}
        onSelect={d => { onChange({ ...value, day: d }); }}
        label="Day"
        pad={pad}
        onScroll={onScroll(dayRef, days, 'day')}
        flex={1}
      />
      {/* Month */}
      <WheelColumn
        ref={monRef}
        items={months}
        selected={value.month}
        onSelect={m => onChange({ ...value, month: m })}
        label="Month"
        pad={pad}
        onScroll={onMonthScroll}
        flex={2}
      />
      {/* Year */}
      <WheelColumn
        ref={yearRef}
        items={years.map(y => ({ label: String(y), val: y }))}
        selected={value.year}
        onSelect={y => onChange({ ...value, year: y })}
        label="Year"
        pad={pad}
        onScroll={onScroll(yearRef, years, 'year')}
        flex={1.3}
      />
    </div>
  );
}

interface ColProps {
  items: { label: string; val: number }[];
  selected: number;
  onSelect: (val: number) => void;
  label: string;
  pad: number;
  onScroll: () => void;
  flex: number;
}

const WheelColumn = React.forwardRef<HTMLDivElement, ColProps>(
  ({ items, selected, onSelect, label, pad, onScroll, flex }, ref) => {
    const phantom = Array.from({ length: pad });
    return (
      <div className="flex flex-col items-center" style={{ flex }}>
        <span className="text-xs text-white/40 mb-1 font-medium tracking-wider uppercase">
          {label}
        </span>
        <div className="relative w-full">
          {/* Selection highlight */}
          <div
            className="pointer-events-none absolute left-0 right-0 rounded-xl z-10"
            style={{
              top: pad * ITEM_H,
              height: ITEM_H,
              background: 'rgba(212,160,23,0.15)',
              border: '1px solid rgba(212,160,23,0.4)',
            }}
          />
          {/* Fade top */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-20"
            style={{
              height: pad * ITEM_H,
              background: 'linear-gradient(to bottom, #0f0f2a 0%, transparent 100%)',
            }}
          />
          {/* Fade bottom */}
          <div
            className="pointer-events-none absolute left-0 right-0 bottom-0 z-20"
            style={{
              height: pad * ITEM_H,
              background: 'linear-gradient(to top, #0f0f2a 0%, transparent 100%)',
            }}
          />
          <div
            ref={ref}
            className="wheel-column"
            style={{ height: VISIBLE * ITEM_H }}
            onScroll={onScroll}
          >
            {/* Top padding phantoms */}
            {phantom.map((_, i) => (
              <div key={`t${i}`} style={{ height: ITEM_H }} />
            ))}
            {items.map(item => (
              <div
                key={item.val}
                className={`wheel-item ${item.val === selected ? 'selected' : ''}`}
                onClick={() => onSelect(item.val)}
              >
                {item.label}
              </div>
            ))}
            {/* Bottom padding phantoms */}
            {phantom.map((_, i) => (
              <div key={`b${i}`} style={{ height: ITEM_H }} />
            ))}
          </div>
        </div>
      </div>
    );
  }
);
WheelColumn.displayName = 'WheelColumn';
