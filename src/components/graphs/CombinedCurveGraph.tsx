import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Consideration } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({
  active,
  payload,
  label,
  considerations,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
  considerations: Consideration[];
}) => {
  if (!active || !payload?.length) return null;

  const getName = (dataKey: string) => {
    if (dataKey === 'raw') return 'Raw';
    if (dataKey === 'comp') return 'Compensated';
    const idx = parseInt(dataKey.slice(1));
    return considerations[idx]?.curve.name || dataKey;
  };

  // Sort: comp and raw first, then considerations
  const sorted = [...payload].sort((a, b) => {
    const order = { comp: 0, raw: 1 };
    const aOrder = order[a.dataKey as keyof typeof order] ?? 2;
    const bOrder = order[b.dataKey as keyof typeof order] ?? 2;
    return aOrder - bOrder;
  });

  return (
    <div className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded shadow-lg">
      <div className="text-slate-400 mb-1">x: {label?.toFixed(3)}</div>
      {sorted.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color }}>
          {entry.value.toFixed(3)} — {getName(entry.dataKey)}
        </div>
      ))}
    </div>
  );
};

interface CombinedCurveGraphProps {
  considerations: Consideration[];
}

export const CombinedCurveGraph = ({ considerations }: CombinedCurveGraphProps) => {
  const data = useMemo(() => {
    const points: Record<string, number>[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const point: Record<string, number> = { x };

      // Individual curves at current input values (for reference lines)
      considerations.forEach((c, idx) => {
        const y = evaluateCurve(c.curve.type, x, c.curve.params, c.curve.invert);
        point[`c${idx}`] = y;
      });

      // Calculate raw and compensated score at this x
      let rawProduct = 1;
      considerations.forEach((c) => {
        const y = evaluateCurve(c.curve.type, x, c.curve.params, c.curve.invert);
        if (y <= 0) rawProduct = 0;
        else rawProduct *= y;
      });
      point.raw = rawProduct;
      point.comp = applyCompensation(rawProduct, considerations.length);

      points.push(point);
    }
    return points;
  }, [considerations]);

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v) => v.toFixed(1)}
            fontSize={12}
            stroke="#64748b"
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v) => v.toFixed(1)}
            fontSize={12}
            stroke="#64748b"
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => {
              if (value === 'raw') return 'Raw';
              if (value === 'comp') return 'Comp';
              const idx = parseInt(value.slice(1));
              return considerations[idx]?.curve.name || value;
            }}
          />
          <Tooltip
            content={<CustomTooltip considerations={considerations} />}
            cursor={{ stroke: '#64748b', strokeDasharray: '3 3' }}
          />

          {/* Individual curves */}
          {considerations.map((c, idx) => (
            <Line
              key={c.id}
              type="monotone"
              dataKey={`c${idx}`}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={1}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1 }}
              isAnimationActive={false}
            />
          ))}

          {/* Raw product */}
          <Line
            type="monotone"
            dataKey="raw"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* Compensated */}
          <Line
            type="monotone"
            dataKey="comp"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
