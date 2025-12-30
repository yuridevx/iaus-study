import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { PageContainer } from '../layout/PageContainer';
import type { Action, Consideration } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';
import { combatScenario } from '../../lib/presets';

const calculateActionScore = (considerations: Consideration[]): { raw: number; comp: number } => {
  if (considerations.length === 0) return { raw: 0, comp: 0 };

  let raw = 1;
  for (const c of considerations) {
    const val = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
    if (val <= 0) { raw = 0; break; }
    raw *= val;
  }

  return {
    raw,
    comp: applyCompensation(raw, considerations.length),
  };
};

export const SimulatorPage = () => {
  const [actions, setActions] = useState<Action[]>(combatScenario.actions);

  const updateInput = (actionId: string, considIdx: number, value: number) => {
    setActions(actions.map(a =>
      a.id === actionId
        ? {
            ...a,
            considerations: a.considerations.map((c, i) =>
              i === considIdx ? { ...c, inputValue: value } : c
            ),
          }
        : a
    ));
  };

  const scores = useMemo(() =>
    actions.map(a => ({
      name: a.name,
      ...calculateActionScore(a.considerations),
    })),
    [actions]
  );

  const winner = useMemo(() => {
    let maxScore = -1;
    let winnerName = '';
    scores.forEach(s => {
      if (s.comp > maxScore) {
        maxScore = s.comp;
        winnerName = s.name;
      }
    });
    return winnerName;
  }, [scores]);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Actions with inputs */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-slate-500">Actions</h2>
          {actions.map((action) => (
            <div
              key={action.id}
              className={`bg-white rounded-lg border p-4 ${
                winner === action.name ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-800">{action.name}</span>
                {winner === action.name && (
                  <span className="text-xs text-green-600 font-medium">WINNER</span>
                )}
              </div>
              <div className="space-y-2">
                {action.considerations.map((c, idx) => {
                  const output = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20 truncate">{c.curve.name}</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={c.inputValue}
                        onChange={(e) => updateInput(action.id, idx, parseFloat(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-xs font-mono text-slate-600 w-8">{output.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Score chart */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-slate-500">Scores</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 1]} fontSize={12} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" fontSize={12} stroke="#64748b" />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="raw" name="Raw" fill="#f97316" barSize={12}>
                    {scores.map((entry, index) => (
                      <Cell key={`raw-${index}`} fill={entry.name === winner ? '#ea580c' : '#f97316'} />
                    ))}
                  </Bar>
                  <Bar dataKey="comp" name="Comp" fill="#22c55e" barSize={12}>
                    {scores.map((entry, index) => (
                      <Cell key={`comp-${index}`} fill={entry.name === winner ? '#16a34a' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Breakdown</h3>
            <div className="space-y-2">
              {scores.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className={`text-sm ${s.name === winner ? 'font-medium text-green-600' : 'text-slate-600'}`}>
                    {s.name}
                  </span>
                  <div className="text-sm font-mono">
                    <span className="text-orange-500">{s.raw.toFixed(3)}</span>
                    <span className="text-slate-400 mx-1">-&gt;</span>
                    <span className="text-green-600">{s.comp.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
