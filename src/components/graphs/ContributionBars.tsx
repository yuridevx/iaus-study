import type { Consideration } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';

interface ContributionBarsProps {
  considerations: Consideration[];
  rawScore: number;
  compensatedScore: number;
}

export const ContributionBars = ({
  considerations,
  rawScore,
  compensatedScore,
}: ContributionBarsProps) => {
  return (
    <div className="space-y-2">
      {considerations.map((c) => {
        const output = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
        return (
          <div key={c.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 truncate max-w-[120px]">{c.curve.name}</span>
              <span className="font-mono text-slate-800">{output.toFixed(2)}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${output * 100}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="border-t border-slate-200 pt-2 mt-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Product</span>
            <span className="font-mono text-slate-800">{rawScore.toFixed(3)}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
            <div
              className="h-full bg-orange-400 transition-all"
              style={{ width: `${rawScore * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">+Comp</span>
            <span className="font-mono text-green-600 font-medium">{compensatedScore.toFixed(3)}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${compensatedScore * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
