interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const ParameterSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: ParameterSliderProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-mono text-slate-600 w-12">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <span className="text-sm font-mono text-slate-800 w-14 text-right">
        {value.toFixed(2)}
      </span>
    </div>
  );
};
