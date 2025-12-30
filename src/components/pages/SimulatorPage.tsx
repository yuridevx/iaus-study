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
import { BreakdownGraph } from '../graphs/BreakdownGraph';
import { AllActionsHeatmap } from '../graphs/AllActionsHeatmap';
import { WinnerSweepGraph } from '../graphs/WinnerSweepGraph';
import { DecisionMap2D } from '../graphs/DecisionMap2D';
import { SensitivityGraph } from '../graphs/SensitivityGraph';
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
  const [sweepActionId, setSweepActionId] = useState<string>(combatScenario.actions[0]?.id || '');
  const [sweepConsiderationIdx, setSweepConsiderationIdx] = useState(0);
  const [map2dXActionId, setMap2dXActionId] = useState<string>(combatScenario.actions[0]?.id || '');
  const [map2dXConsiderationIdx, setMap2dXConsiderationIdx] = useState(0);
  const [map2dYActionId, setMap2dYActionId] = useState<string>(combatScenario.actions[0]?.id || '');
  const [map2dYConsiderationIdx, setMap2dYConsiderationIdx] = useState(
    combatScenario.actions[0]?.considerations.length > 1 ? 1 : 0
  );

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

  const winnerAction = actions.find(a => a.name === winner);

  // Get current sweep value for the reference line
  const sweepAction = actions.find(a => a.id === sweepActionId);
  const currentSweepValue = sweepAction?.considerations[sweepConsiderationIdx]?.inputValue ?? 0.5;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Row 1: Scenario Inputs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500 mb-3">Scenario Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action) => (
              <div
                key={action.id}
                className={`rounded-lg border p-3 ${
                  winner === action.name ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{action.name}</span>
                  {winner === action.name && (
                    <span className="text-xs text-green-600 font-medium">WINNER</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {action.considerations.map((c, idx) => {
                    const output = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
                    return (
                      <div key={c.id} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16 truncate" title={c.curve.name}>
                          {c.curve.name}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={c.inputValue}
                          onChange={(e) => updateInput(action.id, idx, parseFloat(e.target.value))}
                          className="flex-1 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-xs font-mono text-slate-600 w-8">{output.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Action Scores + Winner Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Scores Bar Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Action Scores</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 1]} fontSize={11} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" fontSize={11} stroke="#64748b" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="raw" name="Raw" fill="#f97316" barSize={10}>
                    {scores.map((entry, index) => (
                      <Cell key={`raw-${index}`} fill={entry.name === winner ? '#ea580c' : '#f97316'} />
                    ))}
                  </Bar>
                  <Bar dataKey="comp" name="Comp" fill="#22c55e" barSize={10}>
                    {scores.map((entry, index) => (
                      <Cell key={`comp-${index}`} fill={entry.name === winner ? '#16a34a' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Winner Breakdown */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Winner Breakdown</h3>
            {winnerAction ? (
              <BreakdownGraph action={winnerAction} />
            ) : (
              <div className="text-sm text-slate-400">No winner</div>
            )}
          </div>
        </div>

        {/* Row 3: All Actions Heatmap + Sensitivity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* All Actions Breakdown */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">All Actions Breakdown</h3>
            <AllActionsHeatmap actions={actions} winner={winner} />
          </div>

          {/* Sensitivity Analysis */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Sensitivity Analysis</h3>
            <SensitivityGraph actions={actions} winner={winner} />
          </div>
        </div>

        {/* Row 4: Winner Sweep + 2D Decision Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Winner Sweep */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Winner Over Input Range</h3>
              <div className="flex gap-2">
                <select
                  value={`${sweepActionId}:${sweepConsiderationIdx}`}
                  onChange={(e) => {
                    const [aId, cIdx] = e.target.value.split(':');
                    setSweepActionId(aId);
                    setSweepConsiderationIdx(parseInt(cIdx, 10));
                  }}
                  className="text-xs border border-slate-200 rounded px-2 py-1"
                >
                  {actions.flatMap((a) =>
                    a.considerations.map((c, idx) => (
                      <option key={`${a.id}:${idx}`} value={`${a.id}:${idx}`}>
                        {a.name} - {c.curve.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <WinnerSweepGraph
              actions={actions}
              sweepActionId={sweepActionId}
              sweepConsiderationIdx={sweepConsiderationIdx}
              currentValue={currentSweepValue}
            />
          </div>

          {/* 2D Decision Map */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">2D Decision Map</h3>
              <div className="flex gap-2 text-xs">
                <label className="flex items-center gap-1">
                  X:
                  <select
                    value={`${map2dXActionId}:${map2dXConsiderationIdx}`}
                    onChange={(e) => {
                      const [aId, cIdx] = e.target.value.split(':');
                      setMap2dXActionId(aId);
                      setMap2dXConsiderationIdx(parseInt(cIdx, 10));
                    }}
                    className="border border-slate-200 rounded px-1 py-0.5"
                  >
                    {actions.flatMap((a) =>
                      a.considerations.map((c, idx) => (
                        <option key={`${a.id}:${idx}`} value={`${a.id}:${idx}`}>
                          {c.curve.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <label className="flex items-center gap-1">
                  Y:
                  <select
                    value={`${map2dYActionId}:${map2dYConsiderationIdx}`}
                    onChange={(e) => {
                      const [aId, cIdx] = e.target.value.split(':');
                      setMap2dYActionId(aId);
                      setMap2dYConsiderationIdx(parseInt(cIdx, 10));
                    }}
                    className="border border-slate-200 rounded px-1 py-0.5"
                  >
                    {actions.flatMap((a) =>
                      a.considerations.map((c, idx) => (
                        <option key={`${a.id}:${idx}`} value={`${a.id}:${idx}`}>
                          {c.curve.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>
            </div>
            <DecisionMap2D
              actions={actions}
              xActionId={map2dXActionId}
              xConsiderationIdx={map2dXConsiderationIdx}
              yActionId={map2dYActionId}
              yConsiderationIdx={map2dYConsiderationIdx}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
