import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { PageContainer } from '../layout/PageContainer';
import { BreakdownGraph } from '../graphs/BreakdownGraph';
import { AllActionsHeatmap } from '../graphs/AllActionsHeatmap';
import { WinnerSweepGraph } from '../graphs/WinnerSweepGraph';
import { DecisionMap2D } from '../graphs/DecisionMap2D';
import { SensitivityGraph } from '../graphs/SensitivityGraph';
import type { Consideration, CurveConfig } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';
import { useIAUSStore } from '../../stores/iausStore';

// Check if curve is valid
const isValidCurve = (curve: CurveConfig | null | undefined): curve is CurveConfig =>
  !!(curve && curve.type && curve.params);

const calculateActionScore = (considerations: Consideration[]): { raw: number; comp: number } => {
  const validConsiderations = considerations.filter(c => isValidCurve(c?.curve));
  if (validConsiderations.length === 0) return { raw: 0, comp: 0 };

  let raw = 1;
  for (const c of validConsiderations) {
    const val = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
    if (val <= 0) { raw = 0; break; }
    raw *= val;
  }

  return {
    raw,
    comp: applyCompensation(raw, validConsiderations.length),
  };
};

// Mini curve preview component
const MiniCurvePreview = ({ curve }: { curve: CurveConfig | null | undefined }) => {
  const points = useMemo(() => {
    if (!isValidCurve(curve)) return [];
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const x = i / 20;
      const y = evaluateCurve(curve.type, x, curve.params, curve.invert);
      pts.push({ x, y: Math.max(0, Math.min(1, y)) });
    }
    return pts;
  }, [curve]);

  if (!isValidCurve(curve)) {
    return (
      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
        <span className="text-red-400 text-xs">?</span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 bg-slate-100 rounded overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="y"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SimulatorPage = () => {
  const navigate = useNavigate();
  const {
    currentScenario,
    updateConsiderationInput,
    setCurrentCurve,
  } = useIAUSStore();

  const actions = currentScenario?.actions || [];

  // Graph selection state
  const [sweepActionId, setSweepActionId] = useState<string>(actions[0]?.id || '');
  const [sweepConsiderationIdx, setSweepConsiderationIdx] = useState(0);
  const [map2dXActionId, setMap2dXActionId] = useState<string>(actions[0]?.id || '');
  const [map2dXConsiderationIdx, setMap2dXConsiderationIdx] = useState(0);
  const [map2dYActionId, setMap2dYActionId] = useState<string>(actions[0]?.id || '');
  const [map2dYConsiderationIdx, setMap2dYConsiderationIdx] = useState(
    actions[0]?.considerations.length > 1 ? 1 : 0
  );

  const handleEditCurve = (actionId: string, consideration: Consideration) => {
    setCurrentCurve({ ...consideration.curve });
    navigate(`/?returnTo=simulator&actionId=${actionId}&considerationId=${consideration.id}`);
  };

  const scores = useMemo(() =>
    actions.map(a => ({
      name: a.name,
      id: a.id,
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

  const sweepAction = actions.find(a => a.id === sweepActionId);
  const currentSweepValue = sweepAction?.considerations[sweepConsiderationIdx]?.inputValue ?? 0.5;

  // Empty state
  if (!currentScenario || actions.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
          <div className="text-lg mb-4">No scenario to simulate</div>
          <button
            onClick={() => navigate('/multi')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create scenario in Multi
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-slate-700">{currentScenario.name}</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
              {actions.length} actions
            </span>
          </div>
          <button
            onClick={() => navigate('/multi')}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50"
          >
            ✎ Edit
          </button>
        </div>

        {/* Row 1: Scenario Inputs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500 mb-3">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action) => {
              const isWinner = winner === action.name;

              return (
                <div
                  key={action.id}
                  className={`rounded-lg border p-3 ${
                    isWinner ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {/* Action Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{action.name}</span>
                    {isWinner && <span className="text-xs text-green-600 font-medium">✓</span>}
                  </div>

                  {/* Considerations */}
                  <div className="space-y-1.5">
                    {action.considerations.map((c) => {
                      if (!isValidCurve(c?.curve)) {
                        return (
                          <div key={c.id} className="flex items-center gap-1.5 text-red-400 text-xs">
                            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">?</div>
                            <span>Invalid curve</span>
                          </div>
                        );
                      }
                      const output = evaluateCurve(c.curve.type, c.inputValue, c.curve.params, c.curve.invert);
                      return (
                        <div key={c.id} className="flex items-center gap-1.5">
                          <MiniCurvePreview curve={c.curve} />
                          <button
                            onClick={() => handleEditCurve(action.id, c)}
                            className="text-xs text-slate-600 hover:text-blue-600 w-14 truncate text-left"
                            title={`Edit ${c.curve.name}`}
                          >
                            {c.curve.name}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={c.inputValue}
                            onChange={(e) => updateConsiderationInput(c.id, parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-500"
                          />
                          <span className="text-xs font-mono text-slate-600 w-8">{output.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {action.considerations.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-2">No considerations</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Action Scores + Winner Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Scores</h3>
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

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Winner</h3>
            {winnerAction ? (
              <BreakdownGraph action={winnerAction} />
            ) : (
              <div className="text-sm text-slate-400">No winner</div>
            )}
          </div>
        </div>

        {/* Row 3: All Actions Heatmap + Sensitivity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Breakdown</h3>
            <AllActionsHeatmap actions={actions} winner={winner} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Sensitivity</h3>
            <SensitivityGraph actions={actions} winner={winner} />
          </div>
        </div>

        {/* Row 4: Winner Sweep + 2D Decision Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Sweep</h3>
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
            <WinnerSweepGraph
              actions={actions}
              sweepActionId={sweepActionId}
              sweepConsiderationIdx={sweepConsiderationIdx}
              currentValue={currentSweepValue}
            />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">2D Map</h3>
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
