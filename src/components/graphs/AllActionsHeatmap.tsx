import { useMemo } from 'react';
import type { Action } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';

interface AllActionsHeatmapProps {
  actions: Action[];
  winner: string;
}

export const AllActionsHeatmap = ({ actions, winner }: AllActionsHeatmapProps) => {
  // Collect all unique consideration names across all actions
  const allFactors = useMemo(() => {
    const factors = new Set<string>();
    actions.forEach((a) => {
      a.considerations.forEach((c) => factors.add(c.curve.name));
    });
    return Array.from(factors);
  }, [actions]);

  // Build a matrix of action -> factor -> value
  const matrix = useMemo(() => {
    return actions.map((action) => {
      const values: Record<string, number | null> = {};
      allFactors.forEach((f) => {
        const consideration = action.considerations.find((c) => c.curve.name === f);
        if (consideration) {
          values[f] = evaluateCurve(
            consideration.curve.type,
            consideration.inputValue,
            consideration.curve.params,
            consideration.curve.invert
          );
        } else {
          values[f] = null;
        }
      });
      return { name: action.name, values };
    });
  }, [actions, allFactors]);

  const getCellColor = (value: number | null): string => {
    if (value === null) return 'bg-slate-100';
    if (value >= 0.8) return 'bg-green-400';
    if (value >= 0.6) return 'bg-green-300';
    if (value >= 0.4) return 'bg-yellow-300';
    if (value >= 0.2) return 'bg-orange-300';
    return 'bg-red-300';
  };

  if (allFactors.length === 0) {
    return <div className="text-sm text-slate-400">No factors to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full">
        <thead>
          <tr>
            <th className="text-left p-1 font-medium text-slate-500"></th>
            {allFactors.map((f) => (
              <th
                key={f}
                className="p-1 font-medium text-slate-500 text-center max-w-16 truncate"
                title={f}
              >
                {f.substring(0, 6)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.name}>
              <td
                className={`p-1 font-medium ${
                  row.name === winner ? 'text-green-600' : 'text-slate-600'
                }`}
              >
                {row.name}
              </td>
              {allFactors.map((f) => {
                const val = row.values[f];
                return (
                  <td key={f} className="p-1 text-center">
                    <div
                      className={`w-8 h-5 rounded ${getCellColor(val)} flex items-center justify-center mx-auto`}
                      title={val !== null ? val.toFixed(3) : 'N/A'}
                    >
                      {val !== null ? (
                        <span className="text-xs text-slate-700 font-mono">
                          {val.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
        <span>Low</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-3 bg-red-300 rounded-sm" />
          <div className="w-4 h-3 bg-orange-300 rounded-sm" />
          <div className="w-4 h-3 bg-yellow-300 rounded-sm" />
          <div className="w-4 h-3 bg-green-300 rounded-sm" />
          <div className="w-4 h-3 bg-green-400 rounded-sm" />
        </div>
        <span>High</span>
      </div>
    </div>
  );
};
