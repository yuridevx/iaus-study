import { useMemo } from 'react';
import type { CurveConfig } from '../../lib/types';
import { generateCurvePoints } from '../../lib/curves';

interface SavedCurveCardProps {
  curve: CurveConfig;
  isActive?: boolean;
  onLoad: () => void;
  onDelete: () => void;
}

export const SavedCurveCard = ({ curve, isActive, onLoad, onDelete }: SavedCurveCardProps) => {
  const points = useMemo(
    () => generateCurvePoints(curve.type, curve.params, curve.invert, 20),
    [curve.type, curve.params, curve.invert]
  );

  const pathD = useMemo(() => {
    const width = 60;
    const height = 40;
    return points
      .map((p, i) => {
        const x = p.x * width;
        const y = height - p.y * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [points]);

  return (
    <div
      className={`relative p-2 rounded-lg border-2 cursor-pointer transition-colors ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      onClick={onLoad}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-0.5 right-0.5 w-7 h-7 text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 rounded flex items-center justify-center"
        title="Delete"
      >
        ×
      </button>
      <svg width="60" height="40" className="mx-auto">
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
      </svg>
      <div className="text-xs text-center text-slate-600 truncate mt-1 px-1">
        {curve.name}
      </div>
    </div>
  );
};
