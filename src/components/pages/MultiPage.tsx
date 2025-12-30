import { useMemo } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { ConsiderationCard } from '../controls/ConsiderationCard';
import { CombinedCurveGraph } from '../graphs/CombinedCurveGraph';
import { ContributionBars } from '../graphs/ContributionBars';
import { useIAUSStore } from '../../stores/iausStore';
import {
  calculateRawScore,
  calculateCompensatedScore,
  getModificationFactor,
  getCompensationBoost,
} from '../../lib/compensation';

export const MultiPage = () => {
  const {
    considerations,
    savedCurves,
    addConsideration,
    removeConsideration,
    updateConsiderationInput,
    updateConsiderationCurve,
    loadSavedCurveToConsideration,
  } = useIAUSStore();

  const rawScore = useMemo(
    () => calculateRawScore(considerations),
    [considerations]
  );

  const compensatedScore = useMemo(
    () => calculateCompensatedScore(considerations),
    [considerations]
  );

  const modFactor = getModificationFactor(considerations.length);
  const boost = getCompensationBoost(rawScore, considerations.length);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Considerations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Considerations</h2>
            <div className="flex gap-2">
              <button
                onClick={() => addConsideration()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + New
              </button>
              {savedCurves.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const curve = savedCurves.find((c) => c.id === e.target.value);
                      if (curve) addConsideration(curve);
                    }
                    e.target.value = '';
                  }}
                  className="px-2 py-1 text-sm border border-slate-300 rounded"
                  defaultValue=""
                >
                  <option value="">+ From Saved</option>
                  {savedCurves.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {considerations.map((c) => (
              <ConsiderationCard
                key={c.id}
                consideration={c}
                savedCurves={savedCurves}
                onInputChange={(v) => updateConsiderationInput(c.id, v)}
                onCurveChange={(updates) => updateConsiderationCurve(c.id, updates)}
                onLoadSavedCurve={(curveId) => loadSavedCurveToConsideration(c.id, curveId)}
                onRemove={() => removeConsideration(c.id)}
              />
            ))}
          </div>

          {considerations.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Add considerations to see combined scoring
            </div>
          )}
        </div>

        {/* Right: Graphs and scores */}
        <div className="space-y-4">
          {/* Combined graph */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Combined Curves</h3>
            <CombinedCurveGraph considerations={considerations} />
          </div>

          {/* Contribution bars */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Contributions</h3>
            <ContributionBars
              considerations={considerations}
              rawScore={rawScore}
              compensatedScore={compensatedScore}
            />
          </div>

          {/* Compensation info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Compensation</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500">n</div>
                <div className="text-lg font-mono">{considerations.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">mod</div>
                <div className="text-lg font-mono">{modFactor.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">boost</div>
                <div className="text-lg font-mono text-green-600">
                  +{boost.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
