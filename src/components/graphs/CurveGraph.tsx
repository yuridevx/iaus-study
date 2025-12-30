import { useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import type { CurveConfig } from '../../lib/types';
import { generateCurvePoints, evaluateCurve } from '../../lib/curves';

interface CurveGraphProps {
  curve: CurveConfig;
  testInput: number;
  onTestInputChange?: (value: number) => void;
}

export const CurveGraph = ({ curve, testInput, onTestInputChange }: CurveGraphProps) => {
  const points = useMemo(
    () => generateCurvePoints(curve.type, curve.params, curve.invert),
    [curve.type, curve.params, curve.invert]
  );

  const outputValue = useMemo(
    () => evaluateCurve(curve.type, testInput, curve.params, curve.invert),
    [curve.type, testInput, curve.params, curve.invert]
  );

  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (e?.activePayload?.[0]?.payload && onTestInputChange) {
        onTestInputChange(e.activePayload[0].payload.x);
      }
    },
    [onTestInputChange]
  );

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          onClick={handleClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v) => v.toFixed(2)}
            fontSize={12}
            stroke="#64748b"
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v) => v.toFixed(2)}
            fontSize={12}
            stroke="#64748b"
          />
          <ReferenceLine x={testInput} stroke="#94a3b8" strokeDasharray="5 5" />
          <ReferenceLine y={outputValue} stroke="#94a3b8" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot
            x={testInput}
            y={outputValue}
            r={6}
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
