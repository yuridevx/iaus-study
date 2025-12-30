import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { Action } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';

interface WinnerSweepGraphProps {
  actions: Action[];
  sweepActionId: string;
  sweepConsiderationIdx: number;
  currentValue: number;
}

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];

export const WinnerSweepGraph = ({
  actions,
  sweepActionId,
  sweepConsiderationIdx,
  currentValue,
}: WinnerSweepGraphProps) => {
  const sweepAction = actions.find((a) => a.id === sweepActionId);
  const sweepConsideration = sweepAction?.considerations[sweepConsiderationIdx];

  const data = useMemo(() => {
    if (!sweepConsideration) return [];

    const points: Array<{ x: number } & Record<string, number>> = [];

    for (let i = 0; i <= 50; i++) {
      const sweepX = i / 50;
      const point: { x: number } & Record<string, number> = { x: sweepX };

      actions.forEach((action) => {
        let score = 1;
        for (let cIdx = 0; cIdx < action.considerations.length; cIdx++) {
          const c = action.considerations[cIdx];
          // Use sweep value for the swept consideration, otherwise use current input
          const inputVal =
            action.id === sweepActionId && cIdx === sweepConsiderationIdx
              ? sweepX
              : c.inputValue;

          const val = evaluateCurve(c.curve.type, inputVal, c.curve.params, c.curve.invert);
          if (val <= 0) {
            score = 0;
            break;
          }
          score *= val;
        }
        point[action.name] = applyCompensation(score, action.considerations.length);
      });

      points.push(point);
    }

    return points;
  }, [actions, sweepActionId, sweepConsiderationIdx, sweepConsideration]);

  if (!sweepConsideration) {
    return <div className="text-sm text-slate-400">Select a consideration to sweep</div>;
  }

  return (
    <div>
      <div className="text-xs text-slate-500 mb-2">
        Sweeping: <span className="font-medium">{sweepConsideration.curve.name}</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              fontSize={10}
              stroke="#64748b"
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              fontSize={10}
              stroke="#64748b"
              width={30}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <ReferenceLine
              x={currentValue}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: '▼', position: 'top', fontSize: 10, fill: '#64748b' }}
            />
            {actions.map((action, idx) => (
              <Line
                key={action.id}
                type="monotone"
                dataKey={action.name}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={action.id === sweepActionId ? 2 : 1}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
