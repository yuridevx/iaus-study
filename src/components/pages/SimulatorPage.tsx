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
import type { Action, Consideration, CurveConfig } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';
import { presetScenarios } from '../../lib/presets';
import { useIAUSStore } from '../../stores/iausStore';

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

// Mini curve preview component
const MiniCurvePreview = ({ curve }: { curve: CurveConfig }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const x = i / 20;
      const y = evaluateCurve(curve.type, x, curve.params, curve.invert);
      pts.push({ x, y: Math.max(0, Math.min(1, y)) });
    }
    return pts;
  }, [curve]);

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
    actions,
    considerations: multiPageConsiderations,
    savedCurves,
    addAction,
    removeAction,
    updateActionName,
    addConsiderationToAction,
    removeConsiderationFromAction,
    updateActionConsiderationInput,
    loadScenario,
    resetScenario,
    setCurrentCurve,
  } = useIAUSStore();

  // Editing states
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showAddCurveFor, setShowAddCurveFor] = useState<string | null>(null);

  // Create synthetic "Multi Page" action from multi page considerations
  const multiPageAction: Action | null = multiPageConsiderations.length > 0
    ? {
        id: 'multi-page-sync',
        name: 'Multi Page',
        considerations: multiPageConsiderations,
      }
    : null;

  // Combine store actions with multi page action
  const allActions = useMemo(() => {
    const result = [...actions];
    if (multiPageAction) result.push(multiPageAction);
    return result;
  }, [actions, multiPageAction]);

  // Graph selection state
  const [sweepActionId, setSweepActionId] = useState<string>(allActions[0]?.id || '');
  const [sweepConsiderationIdx, setSweepConsiderationIdx] = useState(0);
  const [map2dXActionId, setMap2dXActionId] = useState<string>(allActions[0]?.id || '');
  const [map2dXConsiderationIdx, setMap2dXConsiderationIdx] = useState(0);
  const [map2dYActionId, setMap2dYActionId] = useState<string>(allActions[0]?.id || '');
  const [map2dYConsiderationIdx, setMap2dYConsiderationIdx] = useState(
    allActions[0]?.considerations.length > 1 ? 1 : 0
  );

  const handleUpdateInput = (actionId: string, considerationId: string, value: number) => {
    if (actionId === 'multi-page-sync') {
      // Multi page uses different store method
      useIAUSStore.getState().updateConsiderationInput(considerationId, value);
    } else {
      updateActionConsiderationInput(actionId, considerationId, value);
    }
  };

  const handleEditCurve = (actionId: string, consideration: Consideration) => {
    setCurrentCurve({ ...consideration.curve });
    navigate(`/?returnTo=simulator&actionId=${actionId}&considerationId=${consideration.id}`);
  };

  const handleStartEditName = (action: Action) => {
    setEditingActionId(action.id);
    setEditingName(action.name);
  };

  const handleFinishEditName = () => {
    if (editingActionId && editingName.trim()) {
      updateActionName(editingActionId, editingName.trim());
    }
    setEditingActionId(null);
    setEditingName('');
  };

  const handleAddAction = () => {
    const name = `Action ${actions.length + 1}`;
    addAction(name);
  };

  const handleAddCurveFromLibrary = (actionId: string, curve: CurveConfig) => {
    addConsiderationToAction(actionId, curve);
    setShowAddCurveFor(null);
  };

  const scores = useMemo(() =>
    allActions.map(a => ({
      name: a.name,
      id: a.id,
      ...calculateActionScore(a.considerations),
    })),
    [allActions]
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

  const winnerAction = allActions.find(a => a.name === winner);

  const sweepAction = allActions.find(a => a.id === sweepActionId);
  const currentSweepValue = sweepAction?.considerations[sweepConsiderationIdx]?.inputValue ?? 0.5;

  const isMultiPageAction = (actionId: string) => actionId === 'multi-page-sync';

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAction}
            className="p-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Add Action"
          >
            +
          </button>
          <select
            onChange={(e) => {
              const scenario = presetScenarios.find(s => s.id === e.target.value);
              if (scenario) loadScenario(scenario);
              e.target.value = '';
            }}
            className="px-2 py-1.5 text-sm border border-slate-300 rounded"
            defaultValue=""
          >
            <option value="">Presets</option>
            {presetScenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={resetScenario}
            className="p-2 text-sm border border-slate-300 rounded hover:bg-slate-50"
            title="Reset"
          >
            ↺
          </button>
        </div>

        {/* Row 1: Scenario Inputs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500 mb-3">Scenario Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allActions.map((action) => {
              const isMulti = isMultiPageAction(action.id);
              const isWinner = winner === action.name;

              return (
                <div
                  key={action.id}
                  className={`rounded-lg border p-3 ${
                    isWinner ? 'border-green-500 bg-green-50' :
                    isMulti ? 'border-purple-300 bg-purple-50' :
                    'border-slate-200 bg-slate-50'
                  }`}
                >
                  {/* Action Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {editingActionId === action.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleFinishEditName}
                          onKeyDown={(e) => e.key === 'Enter' && handleFinishEditName()}
                          className="text-sm font-medium px-1 border rounded w-24"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-slate-700">{action.name}</span>
                      )}
                      {isMulti && (
                        <span className="text-xs text-purple-600">(live)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isWinner && (
                        <span className="text-xs text-green-600 font-medium mr-1">✓</span>
                      )}
                      {!isMulti && (
                        <>
                          <button
                            onClick={() => handleStartEditName(action)}
                            className="p-1 text-xs text-slate-400 hover:text-slate-600"
                            title="Edit name"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => removeAction(action.id)}
                            className="p-1 text-xs text-slate-400 hover:text-red-500"
                            title="Remove action"
                          >
                            ×
                          </button>
                          <button
                            onClick={() => setShowAddCurveFor(showAddCurveFor === action.id ? null : action.id)}
                            className="p-1 text-xs text-slate-400 hover:text-blue-500"
                            title="Add consideration"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Add curve dropdown */}
                  {showAddCurveFor === action.id && (
                    <div className="mb-2 flex gap-1">
                      <button
                        onClick={() => addConsiderationToAction(action.id)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        New
                      </button>
                      {savedCurves.length > 0 && (
                        <select
                          onChange={(e) => {
                            const curve = savedCurves.find(c => c.id === e.target.value);
                            if (curve) handleAddCurveFromLibrary(action.id, curve);
                          }}
                          className="flex-1 px-2 py-1 text-xs border rounded"
                          defaultValue=""
                        >
                          <option value="">From Library</option>
                          {savedCurves.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Considerations */}
                  <div className="space-y-1.5">
                    {action.considerations.map((c) => {
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
                          {!isMulti && (
                            <button
                              onClick={() => removeConsiderationFromAction(action.id, c.id)}
                              className="text-xs text-slate-300 hover:text-red-500"
                              title="Remove"
                            >
                              ×
                            </button>
                          )}
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={c.inputValue}
                            onChange={(e) => handleUpdateInput(action.id, c.id, parseFloat(e.target.value))}
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">All Actions Breakdown</h3>
            <AllActionsHeatmap actions={allActions} winner={winner} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Sensitivity Analysis</h3>
            <SensitivityGraph actions={allActions} winner={winner} />
          </div>
        </div>

        {/* Row 4: Winner Sweep + 2D Decision Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-500">Winner Over Input Range</h3>
              <select
                value={`${sweepActionId}:${sweepConsiderationIdx}`}
                onChange={(e) => {
                  const [aId, cIdx] = e.target.value.split(':');
                  setSweepActionId(aId);
                  setSweepConsiderationIdx(parseInt(cIdx, 10));
                }}
                className="text-xs border border-slate-200 rounded px-2 py-1"
              >
                {allActions.flatMap((a) =>
                  a.considerations.map((c, idx) => (
                    <option key={`${a.id}:${idx}`} value={`${a.id}:${idx}`}>
                      {a.name} - {c.curve.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <WinnerSweepGraph
              actions={allActions}
              sweepActionId={sweepActionId}
              sweepConsiderationIdx={sweepConsiderationIdx}
              currentValue={currentSweepValue}
            />
          </div>

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
                    {allActions.flatMap((a) =>
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
                    {allActions.flatMap((a) =>
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
              actions={allActions}
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
