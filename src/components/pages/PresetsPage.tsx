import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../layout/PageContainer';
import { useIAUSStore } from '../../stores/iausStore';
import type { CurveType } from '../../lib/types';
import { curveNames, generateCurvePoints } from '../../lib/curves';
import { defaultParams } from '../../lib/types';

const curveTypes: CurveType[] = [
  'linear', 'polynomial', 'exponential', 'logarithmic',
  'logistic', 'logit', 'smoothstep', 'smootherstep',
  'sine', 'cosine', 'gaussian', 'step',
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
  const { setCurrentCurve } = useIAUSStore();

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

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-4">Curve Types</h2>
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
