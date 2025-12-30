import type { Action } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';

interface BreakdownGraphProps {
  action: Action;
}

export const BreakdownGraph = ({ action }: BreakdownGraphProps) => {
  const outputs = action.considerations.map((c) => ({
    name: c.curve.name,
    value: evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert),
  }));

  let rawScore = 1;
  for (const o of outputs) {
    if (o.value <= 0) {
      rawScore = 0;
      break;
    }
    rawScore *= o.value;
  }

  const compensatedScore = applyCompensation(rawScore, action.considerations.length);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700 mb-2">
        {action.name} <span className="text-green-600">(Winner)</span>
      </div>

      {outputs.map((o, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-20 truncate" title={o.name}>
            {o.name}
          </span>
          <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, o.value * 100))}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-600 w-10 text-right">
            {o.value.toFixed(2)}
          </span>
        </div>
      ))}

      <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-20">Product</span>
          <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, rawScore * 100))}%` }}
            />
          </div>
          <span className="text-xs font-mono text-orange-600 w-10 text-right">
            {rawScore.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-20">+Comp</span>
          <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, compensatedScore * 100))}%` }}
            />
          </div>
          <span className="text-xs font-mono text-green-600 w-10 text-right">
            {compensatedScore.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
