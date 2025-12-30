import { useMemo } from 'react';
import type { Action } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';

interface SensitivityGraphProps {
  actions: Action[];
  winner: string;
}

interface SensitivityData {
  name: string;
  sensitivity: number;
  level: 'High' | 'Med' | 'Low';
}

export const SensitivityGraph = ({ actions, winner }: SensitivityGraphProps) => {
  const winnerAction = actions.find((a) => a.name === winner);

  const sensitivities = useMemo((): SensitivityData[] => {
    if (!winnerAction) return [];

    const results: SensitivityData[] = [];

    // For each consideration, measure how much the score changes as input varies
    winnerAction.considerations.forEach((c) => {
      // Calculate scores at low (0.1), current, and high (0.9) input values
      const calcScore = (inputVal: number) => {
        let score = 1;
        for (const consideration of winnerAction.considerations) {
          const val = evaluateCurve(
            consideration.curve.type,
            consideration.id === c.id ? inputVal : consideration.inputValue,
            consideration.curve.params,
            consideration.curve.invert
          );
          if (val <= 0) return 0;
          score *= val;
        }
        return applyCompensation(score, winnerAction.considerations.length);
      };

      const scoreLow = calcScore(0.1);
      const scoreHigh = calcScore(0.9);

      // Sensitivity is the range of score change
      const sensitivity = Math.abs(scoreHigh - scoreLow);

      let level: 'High' | 'Med' | 'Low' = 'Low';
      if (sensitivity > 0.4) level = 'High';
      else if (sensitivity > 0.2) level = 'Med';

      results.push({
        name: c.curve.name,
        sensitivity,
        level,
      });
    });

    // Sort by sensitivity descending
    return results.sort((a, b) => b.sensitivity - a.sensitivity);
  }, [winnerAction]);

  // Calculate margin over second place
  const margin = useMemo(() => {
    if (!winnerAction) return 0;

    const scores = actions.map((action) => {
      let score = 1;
      for (const c of action.considerations) {
        const val = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
        if (val <= 0) return { name: action.name, score: 0 };
        score *= val;
      }
      return { name: action.name, score: applyCompensation(score, action.considerations.length) };
    });

    scores.sort((a, b) => b.score - a.score);
    if (scores.length < 2) return scores[0]?.score ?? 0;
    return scores[0].score - scores[1].score;
  }, [actions, winnerAction]);

  if (!winnerAction) {
    return <div className="text-sm text-slate-400">No winner selected</div>;
  }

  const getLevelColor = (level: 'High' | 'Med' | 'Low') => {
    switch (level) {
      case 'High':
        return 'bg-green-500';
      case 'Med':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-red-400';
    }
  };

  const getLevelTextColor = (level: 'High' | 'Med' | 'Low') => {
    switch (level) {
      case 'High':
        return 'text-green-600';
      case 'Med':
        return 'text-yellow-600';
      case 'Low':
        return 'text-red-500';
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 mb-2">
        How much does each input affect the winning action?
      </div>

      <div className="space-y-2">
        {sensitivities.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="text-xs text-slate-600 w-20 truncate" title={item.name}>
              {item.name}
            </span>
            <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
              <div
                className={`h-full ${getLevelColor(item.level)} transition-all`}
                style={{ width: `${Math.min(100, item.sensitivity * 100)}%` }}
              />
            </div>
            <span className={`text-xs font-medium w-8 ${getLevelTextColor(item.level)}`}>
              {item.level}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-2 mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Current winner:</span>
          <span className="font-medium text-green-600">{winner}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Margin over 2nd:</span>
          <span className="font-mono text-slate-700">+{margin.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};
