
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
  displayValue: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step, displayValue }) => {
  return (
    <div className="space-y-1">
      <label className="flex justify-between items-center text-[11px] font-bold text-slate-600 uppercase tracking-tight">
        <span>{label}</span>
        <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{displayValue}</span>
      </label>
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
      />
    </div>
  );
};
