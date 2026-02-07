import type { InputHTMLAttributes } from "react";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "min" | "max" | "step"> {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: string) => void;
}

export function Slider({ min, max, step = 1, value, onValueChange, ...rest }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...rest}
    />
  );
}
