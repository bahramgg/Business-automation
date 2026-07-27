'use client';

// Labeled range slider — the only tool input type (plan §5.1: sliders, no
// typing). Native <input type=range> so it's fully keyboard + AT accessible;
// the visible value is announced via aria and shown with tabular figures.
export function Slider({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted">{label}</span>
        <span className="tnum text-base font-bold text-ink">{displayValue}</span>
      </span>
      <input
        type="range"
        className="range-brand mt-3 w-full"
        value={value}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        aria-valuetext={displayValue}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
