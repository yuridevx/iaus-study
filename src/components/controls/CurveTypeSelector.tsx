import type { CurveType } from '../../lib/types';
import { curveNames } from '../../lib/curves';

interface CurveTypeSelectorProps {
  value: CurveType;
  onChange: (type: CurveType) => void;
}

const curveTypes: CurveType[] = [
  'linear',
  'polynomial',
  'exponential',
  'logarithmic',
  'logistic',
  'logit',
  'smoothstep',
  'smootherstep',
  'sine',
  'cosine',
  'gaussian',
  'step',
];

export const CurveTypeSelector = ({ value, onChange }: CurveTypeSelectorProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CurveType)}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {curveTypes.map((type) => (
        <option key={type} value={type}>
          {curveNames[type]}
        </option>
      ))}
    </select>
  );
};
