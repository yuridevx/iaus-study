interface InputOutputBarsProps {
  input: number;
  output: number;
  onInputChange?: (value: number) => void;
}

export const InputOutputBars = ({ input, output, onInputChange }: InputOutputBarsProps) => {
  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">In</span>
          <span className="font-mono text-slate-800">{input.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={input}
          onChange={(e) => onInputChange?.(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Out</span>
          <span className="font-mono text-slate-800">{output.toFixed(2)}</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-lg overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-150"
            style={{ width: `${output * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
