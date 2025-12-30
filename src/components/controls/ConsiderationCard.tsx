import { useMemo, useState } from 'react';
import type { Consideration, CurveType, CurveConfig } from '../../lib/types';
import { curveNames, curveParamConfig, generateCurvePoints, evaluateCurve } from '../../lib/curves';
import { defaultParams } from '../../lib/types';
import { ParameterSlider } from './ParameterSlider';

interface ConsiderationCardProps {
  consideration: Consideration;
  savedCurves: CurveConfig[];
  onInputChange: (value: number) => void;
  onCurveChange: (updates: Partial<CurveConfig>) => void;
  onLoadSavedCurve: (curveId: string) => void;
  onEditInFullEditor: () => void;
  onRemove: () => void;
}

const curveTypes: CurveType[] = [
  'linear', 'polynomial', 'exponential', 'logarithmic',
  'logistic', 'logit', 'smoothstep', 'smootherstep',
  'sine', 'cosine', 'gaussian', 'step',
];

export const ConsiderationCard = ({
  consideration,
  savedCurves,
  onInputChange,
  onCurveChange,
  onLoadSavedCurve,
  onEditInFullEditor,
  onRemove,
}: ConsiderationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const { curve, inputValue } = consideration;

  const outputValue = useMemo(
    () => evaluateCurve(curve.type, inputValue, curve.params, curve.invert),
    [curve.type, inputValue, curve.params, curve.invert]
  );

  const miniPoints = useMemo(
    () => generateCurvePoints(curve.type, curve.params, curve.invert, 20),
    [curve.type, curve.params, curve.invert]
  );

  const pathD = useMemo(() => {
    const width = 50;
    const height = 30;
    return miniPoints
      .map((p, i) => {
        const x = p.x * width;
        const y = height - p.y * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [miniPoints]);

  const paramConfigs = curveParamConfig[curve.type];

  const handleTypeChange = (type: CurveType) => {
    onCurveChange({
      type,
      params: { ...defaultParams[type], xShift: 0, yShift: 0 },
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setExpanded(!expanded)}
      >
        <svg width="50" height="30" className="flex-shrink-0">
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-700 truncate">
            {curve.name}
          </div>
          <div className="text-xs text-slate-500">
            {curveNames[curve.type]} · In: {inputValue.toFixed(2)} → {outputValue.toFixed(2)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-slate-400 hover:text-red-500"
          title="Remove"
        >
          ×
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-200 p-3 space-y-3">
          {/* Curve type & saved curve selector */}
          <div className="flex gap-2">
            <select
              value={curve.type}
              onChange={(e) => handleTypeChange(e.target.value as CurveType)}
              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded"
            >
              {curveTypes.map((type) => (
                <option key={type} value={type}>
                  {curveNames[type]}
                </option>
              ))}
            </select>
            {savedCurves.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) onLoadSavedCurve(e.target.value);
                  e.target.value = '';
                }}
                className="px-2 py-1 text-sm border border-slate-300 rounded"
                defaultValue=""
              >
                <option value="">Load...</option>
                {savedCurves.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Parameters */}
          <div className="space-y-2">
            {paramConfigs.map((config) => (
              <ParameterSlider
                key={config.key}
                label={config.label}
                value={(curve.params[config.key] as number) ?? 0}
                min={config.min}
                max={config.max}
                step={config.step}
                onChange={(v) =>
                  onCurveChange({ params: { ...curve.params, [config.key]: v } })
                }
              />
            ))}
            <ParameterSlider
              label="X"
              value={curve.params.xShift ?? 0}
              min={-1}
              max={1}
              step={0.05}
              onChange={(v) =>
                onCurveChange({ params: { ...curve.params, xShift: v } })
              }
            />
            <ParameterSlider
              label="Y"
              value={curve.params.yShift ?? 0}
              min={-1}
              max={1}
              step={0.05}
              onChange={(v) =>
                onCurveChange({ params: { ...curve.params, yShift: v } })
              }
            />
          </div>

          {/* Invert & Edit link */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={curve.invert}
                onChange={() => onCurveChange({ invert: !curve.invert })}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-slate-600">Invert</span>
            </label>
            <button
              onClick={onEditInFullEditor}
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
            >
              Edit in full editor
            </button>
          </div>

          {/* Input slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Input</span>
              <span>{inputValue.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={inputValue}
              onChange={(e) => onInputChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
