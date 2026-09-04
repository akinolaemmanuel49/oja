import { forwardRef } from "react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Slider — custom dual-thumb range (replaces @radix-ui/react-slider)
// ---------------------------------------------------------------------------

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ min = 0, max = 100, step = 1, minStepsBetweenThumbs = 0, value = [min, max], onValueChange, className, disabled }, ref) => {
    const [lo, hi] = value;
    const pct = (v: number) => ((v - min) / (max - min)) * 100;
    const gap = Math.max(step, minStepsBetweenThumbs * step);

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="relative flex h-5 w-full items-center">
          {/* Track */}
          <div className="relative h-1.5 w-full rounded-full bg-muted">
            {/* Active range */}
            <div
              className="absolute h-full rounded-full bg-primary"
              style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
            />
          </div>
          {/* Thumbs */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={lo}
            disabled={disabled}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), hi - gap);
              onValueChange?.([v, hi]);
            }}
            style={{ left: `${pct(lo)}%` }}
            className="pointer-events-none absolute h-5 w-full cursor-pointer opacity-0"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={hi}
            disabled={disabled}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), lo + gap);
              onValueChange?.([lo, v]);
            }}
            style={{ left: `${pct(hi)}%` }}
            className="pointer-events-none absolute h-5 w-full cursor-pointer opacity-0"
          />
          <span
            className="pointer-events-none absolute h-4 w-4 rounded-full border border-white bg-primary shadow transition-transform"
            style={{ left: `calc(${pct(lo)}% - 8px)` }}
          />
          <span
            className="pointer-events-none absolute h-4 w-4 rounded-full border border-white bg-primary shadow transition-transform"
            style={{ left: `calc(${pct(hi)}% - 8px)` }}
          />
        </div>
      </div>
    );
  },
);
Slider.displayName = "Slider";
