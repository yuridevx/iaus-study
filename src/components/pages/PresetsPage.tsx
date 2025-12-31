import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../layout/PageContainer';
import { useIAUSStore } from '../../stores/iausStore';
import type { CurveType } from '../../lib/types';
import { curveNames, generateCurvePoints } from '../../lib/curves';
import { defaultParams } from '../../lib/types';
import { presetScenarios } from '../../lib/presets';

const curveTypes: CurveType[] = [
  'linear', 'polynomial', 'exponential', 'logarithmic',
  'logistic', 'logit', 'smoothstep', 'smootherstep',
  'sine', 'cosine', 'gaussian', 'step', 'piecewiseLinear',
];

interface CurvePreviewProps {
  type: CurveType;
  onClick: () => void;
}

const CurvePreview = ({ type, onClick }: CurvePreviewProps) => {
  const points = useMemo(
    () => generateCurvePoints(type, defaultParams[type], false, 30),
    [type]
  );

  const pathD = useMemo(() => {
    const width = 80;
    const height = 50;
    return points
      .map((p, idx) => {
        const px = p.x * width;
        const py = height - p.y * height;
        return (idx === 0 ? 'M' : 'L') + ' ' + px + ' ' + py;
      })
      .join(' ');
  }, [points]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
    >
      <svg width="80" height="50" className="mx-auto">
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
      </svg>
      <div className="text-xs text-center text-slate-600 mt-2">
        {curveNames[type]}
      </div>
    </div>
  );
};

export const PresetsPage = () => {
  const navigate = useNavigate();
  const { setCurrentCurve, importPreset } = useIAUSStore();

  const handleSelectCurve = (type: CurveType) => {
    setCurrentCurve({
      id: Math.random().toString(36).substring(2, 9),
      name: curveNames[type],
      type,
      params: { ...defaultParams[type] },
      invert: false,
    });
    navigate('/');
  };

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = presetScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      importPreset(scenario);
      navigate('/multi');
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-4">Curves</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {curveTypes.map((type) => (
              <CurvePreview
                key={type}
                type={type}
                onClick={() => handleSelectCurve(type)}
              />
            ))}
          </div>
        </div>

        {/* Scenario Presets */}
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-4">Scenarios</h2>
          <div className="space-y-4">
            {presetScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-700 mb-1">{scenario.name}</div>
                    <div className="text-xs text-slate-500 mb-3">{scenario.description}</div>
                  </div>
                  <button
                    onClick={() => handleLoadScenario(scenario.id)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Import preset"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scenario.actions.map((action) => (
                    <div
                      key={action.id}
                      className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200"
                    >
                      <div className="text-sm font-medium text-slate-700">{action.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {action.considerations.map((c) => (
                          <span key={c.id} className="text-xs text-slate-500">
                            {c.curve.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-slate-700 mb-1">IAUS Formula</div>
              <code className="text-xs bg-white px-2 py-1 rounded border block">
                score + (1 - score) * modFactor * score
              </code>
              <div className="text-xs text-slate-500 mt-1">
                where modFactor = 1 - (1 / n)
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-700 mb-1">Early Termination</div>
              <div className="text-xs text-slate-600">
                If any consideration outputs 0, the total score becomes 0 immediately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
