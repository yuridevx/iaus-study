import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../layout/PageContainer';
import { CurveGraph } from '../graphs/CurveGraph';
import { InputOutputBars } from '../graphs/InputOutputBars';
import { ParameterSlider } from '../controls/ParameterSlider';
import { CurveTypeSelector } from '../controls/CurveTypeSelector';
import { SavedCurveCard } from '../controls/SavedCurveCard';
import { useIAUSStore } from '../../stores/iausStore';
import { curveParamConfig, curveFormulas, evaluateCurve } from '../../lib/curves';
import { generateSingleCurveCode } from '../../lib/codeGen';
import type { CurveParams } from '../../lib/types';

export const CurvesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get('returnTo');

  const {
    currentCurve,
    testInput,
    savedCurves,
    setTestInput,
    updateCurrentCurveType,
    updateCurrentCurveParams,
    updateCurrentCurveName,
    toggleCurrentCurveInvert,
    saveCurve,
    deleteCurve,
    loadCurve,
    resetCurrentCurve,
    libraryConfig,
  } = useIAUSStore();

  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    if (returnTo === 'multi') {
      navigate('/multi');
    }
  };

  const handleCopyCode = async () => {
    const code = generateSingleCurveCode(currentCurve, libraryConfig);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const outputValue = useMemo(
    () => evaluateCurve(currentCurve.type, testInput, currentCurve.params, currentCurve.invert),
    [currentCurve.type, testInput, currentCurve.params, currentCurve.invert]
  );

  const paramConfigs = curveParamConfig[currentCurve.type];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {returnTo === 'multi' && (
            <button
              onClick={handleBack}
              className="px-3 py-2 text-sm text-blue-500 border border-blue-300 rounded-md hover:bg-blue-50 flex items-center gap-1"
            >
              <span>&larr;</span> Back to Multi
            </button>
          )}
          <input
            type="text"
            value={currentCurve.name}
            onChange={(e) => updateCurrentCurveName(e.target.value)}
            className="flex-1 px-3 py-2 text-lg font-medium bg-transparent border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none"
            placeholder="Curve name..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              title="Copy C# code"
            >
              {copied ? "✓" : "📋 C#"}
            </button>
            <button
              onClick={() => saveCurve(currentCurve)}
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              title="Save"
            >
              Save
            </button>
            <button
              onClick={resetCurrentCurve}
              className="px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
              title="New"
            >
              New
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <CurveGraph
              curve={currentCurve}
              testInput={testInput}
              onTestInputChange={setTestInput}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Curve type */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <CurveTypeSelector
                value={currentCurve.type}
                onChange={updateCurrentCurveType}
              />
              <div className="mt-3 pt-3 border-t border-slate-100">
                <code className="text-sm text-slate-600 font-mono">
                  {curveFormulas[currentCurve.type]}
                </code>
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
              {paramConfigs.map((config) => (
                <ParameterSlider
                  key={config.key}
                  label={config.label}
                  value={(currentCurve.params[config.key] as number) ?? 0}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  onChange={(v) =>
                    updateCurrentCurveParams({ [config.key]: v } as Partial<CurveParams>)
                  }
                />
              ))}

              {/* X/Y Shift */}
              <ParameterSlider
                label="X"
                value={currentCurve.params.xShift ?? 0}
                min={-1}
                max={1}
                step={0.05}
                onChange={(v) => updateCurrentCurveParams({ xShift: v })}
              />
              <ParameterSlider
                label="Y"
                value={currentCurve.params.yShift ?? 0}
                min={-1}
                max={1}
                step={0.05}
                onChange={(v) => updateCurrentCurveParams({ yShift: v })}
              />

              {/* Invert toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentCurve.invert}
                  onChange={toggleCurrentCurveInvert}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-slate-600">Invert</span>
              </label>
            </div>

            {/* Input/Output */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <InputOutputBars
                input={testInput}
                output={outputValue}
                onInputChange={setTestInput}
              />
            </div>
          </div>
        </div>

        {/* Saved curves */}
        {savedCurves.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Saved</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {savedCurves.map((curve) => (
                <SavedCurveCard
                  key={curve.id}
                  curve={curve}
                  isActive={curve.id === currentCurve.id}
                  onLoad={() => loadCurve(curve.id)}
                  onDelete={() => deleteCurve(curve.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
