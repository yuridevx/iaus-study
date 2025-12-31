import type { CurveType, CurveParams } from './types';

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

const applyTransforms = (
  _x: number,
  result: number,
  params: CurveParams,
  invert: boolean
): number => {
  result = result + (params.yShift ?? 0);
  result = clamp(result);
  return invert ? 1 - result : result;
};

const shiftInput = (x: number, params: CurveParams): number => {
  return x - (params.xShift ?? 0);
};

export const linear = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = shiftInput(x, params);
  const slope = params.slope ?? 1;
  const intercept = params.intercept ?? 0;
  const result = slope * shifted + intercept;
  return applyTransforms(x, result, params, invert);
};

export const polynomial = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const exponent = params.exponent ?? 2;
  const result = Math.pow(shifted, exponent);
  return applyTransforms(x, result, params, invert);
};

export const exponential = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const base = params.base ?? 2;
  if (base === 1) return applyTransforms(x, shifted, params, invert);
  const result = (Math.pow(base, shifted) - 1) / (base - 1);
  return applyTransforms(x, result, params, invert);
};

export const logarithmic = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const base = params.base ?? 10;
  if (base <= 1) return applyTransforms(x, shifted, params, invert);
  const result = Math.log(1 + shifted * (base - 1)) / Math.log(base);
  return applyTransforms(x, result, params, invert);
};

export const logistic = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = shiftInput(x, params);
  const steepness = params.steepness ?? 10;
  const midpoint = params.midpoint ?? 0.5;
  const result = 1 / (1 + Math.exp(-steepness * (shifted - midpoint)));
  return applyTransforms(x, result, params, invert);
};

export const logit = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const safeX = Math.max(0.001, Math.min(0.999, shifted));
  const base = params.base ?? Math.E;
  const raw = Math.log(safeX / (1 - safeX)) / Math.log(base);
  const result = (raw + 6) / 12;
  return applyTransforms(x, clamp(result), params, invert);
};

export const smoothstep = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const result = shifted * shifted * (3 - 2 * shifted);
  return applyTransforms(x, result, params, invert);
};

export const smootherstep = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const result = shifted * shifted * shifted * (shifted * (shifted * 6 - 15) + 10);
  return applyTransforms(x, result, params, invert);
};

export const sine = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = shiftInput(x, params);
  const frequency = params.frequency ?? 1;
  const offset = params.offset ?? 0;
  const result = (Math.sin(frequency * Math.PI * shifted + offset) + 1) / 2;
  return applyTransforms(x, result, params, invert);
};

export const cosine = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = clamp(shiftInput(x, params));
  const frequency = params.frequency ?? 1;
  const result = 1 - Math.cos(frequency * (Math.PI / 2) * shifted);
  return applyTransforms(x, clamp(result), params, invert);
};

export const gaussian = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = shiftInput(x, params);
  const mean = params.mean ?? 0.5;
  const stdDev = params.stdDev ?? 0.2;
  const diff = shifted - mean;
  const result = Math.exp(-(diff * diff) / (2 * stdDev * stdDev));
  return applyTransforms(x, result, params, invert);
};

export const step = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = shiftInput(x, params);
  const threshold = params.threshold ?? 0.5;
  const result = shifted > threshold ? 1 : 0;
  return applyTransforms(x, result, params, invert);
};

export const piecewiseLinear = (x: number, params: CurveParams, invert: boolean): number => {
  const shifted = shiftInput(x, params);
  const points = params.points ?? [{ x: 0, y: 0 }, { x: 1, y: 1 }];

  if (points.length === 0) return applyTransforms(x, 0, params, invert);
  if (points.length === 1) return applyTransforms(x, points[0].y, params, invert);

  // Sort points by x
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Handle x outside range
  if (shifted <= sorted[0].x) return applyTransforms(x, sorted[0].y, params, invert);
  if (shifted >= sorted[sorted.length - 1].x) return applyTransforms(x, sorted[sorted.length - 1].y, params, invert);

  // Find segment and interpolate
  for (let i = 0; i < sorted.length - 1; i++) {
    if (shifted >= sorted[i].x && shifted <= sorted[i + 1].x) {
      const t = (shifted - sorted[i].x) / (sorted[i + 1].x - sorted[i].x);
      const result = sorted[i].y + t * (sorted[i + 1].y - sorted[i].y);
      return applyTransforms(x, result, params, invert);
    }
  }

  return applyTransforms(x, 0, params, invert);
};

export const evaluateCurve = (
  type: CurveType,
  x: number,
  params: CurveParams,
  invert: boolean
): number => {
  switch (type) {
    case 'linear': return linear(x, params, invert);
    case 'polynomial': return polynomial(x, params, invert);
    case 'exponential': return exponential(x, params, invert);
    case 'logarithmic': return logarithmic(x, params, invert);
    case 'logistic': return logistic(x, params, invert);
    case 'logit': return logit(x, params, invert);
    case 'smoothstep': return smoothstep(x, params, invert);
    case 'smootherstep': return smootherstep(x, params, invert);
    case 'sine': return sine(x, params, invert);
    case 'cosine': return cosine(x, params, invert);
    case 'gaussian': return gaussian(x, params, invert);
    case 'step': return step(x, params, invert);
    case 'piecewiseLinear': return piecewiseLinear(x, params, invert);
    default: return x;
  }
};

export const generateCurvePoints = (
  type: CurveType,
  params: CurveParams,
  invert: boolean,
  numPoints: number = 100
): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = i / numPoints;
    const y = evaluateCurve(type, x, params, invert);
    points.push({ x, y });
  }
  return points;
};

export const curveNames: Record<CurveType, string> = {
  linear: 'Linear',
  polynomial: 'Polynomial',
  exponential: 'Exponential',
  logarithmic: 'Logarithmic',
  logistic: 'Logistic',
  logit: 'Logit',
  smoothstep: 'Smoothstep',
  smootherstep: 'Smootherstep',
  sine: 'Sine',
  cosine: 'Cosine',
  gaussian: 'Gaussian',
  step: 'Step',
  piecewiseLinear: 'Piecewise',
};

export const curveFormulas: Record<CurveType, string> = {
  linear: 'y = mx + b',
  polynomial: 'y = x^n',
  exponential: 'y = \\frac{base^x - 1}{base - 1}',
  logarithmic: 'y = \\log_{base}(1 + x(base-1))',
  logistic: 'y = \\frac{1}{1 + e^{-k(x - mid)}}',
  logit: 'y = \\log\\left(\\frac{x}{1 - x}\\right)',
  smoothstep: 'y = 3x^2 - 2x^3',
  smootherstep: 'y = 6x^5 - 15x^4 + 10x^3',
  sine: 'y = \\frac{\\sin(freq \\cdot \\pi x + off) + 1}{2}',
  cosine: 'y = 1 - \\cos\\left(freq \\cdot \\frac{\\pi}{2} x\\right)',
  gaussian: 'y = e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
  step: 'y = \\begin{cases} 1 & x > t \\\\ 0 & x \\leq t \\end{cases}',
  piecewiseLinear: 'y = \\text{lerp}(p_i, p_{i+1})',
};

const fmt = (n: number): string => {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2).replace(/\.?0+$/, '');
};

// Format x variable with shift applied
const fmtX = (xShift: number): string => {
  if (xShift === 0) return 'x';
  if (xShift > 0) return `(x - ${fmt(xShift)})`;
  return `(x + ${fmt(Math.abs(xShift))})`;
};

// Wrap formula with transformations (yShift, invert)
const wrapFormula = (core: string, yShift: number, invert: boolean): string => {
  let result = core;

  // Add yShift
  if (yShift !== 0) {
    if (yShift > 0) {
      result = `${result} + ${fmt(yShift)}`;
    } else {
      result = `${result} - ${fmt(Math.abs(yShift))}`;
    }
  }

  // Wrap with invert
  if (invert) {
    // Use parentheses if there's a yShift or complex expression
    if (yShift !== 0) {
      result = `1 - (${result})`;
    } else {
      result = `1 - ${result}`;
    }
  }

  return `y = ${result}`;
};

export const getFormulaWithValues = (type: CurveType, params: CurveParams, invert: boolean = false): string => {
  const xShift = params.xShift ?? 0;
  const yShift = params.yShift ?? 0;
  const x = fmtX(xShift);

  let core: string;

  switch (type) {
    case 'linear': {
      const m = params.slope ?? 1;
      const b = params.intercept ?? 0;
      if (b === 0) {
        core = `${fmt(m)}${x}`;
      } else if (b > 0) {
        core = `${fmt(m)}${x} + ${fmt(b)}`;
      } else {
        core = `${fmt(m)}${x} - ${fmt(Math.abs(b))}`;
      }
      break;
    }
    case 'polynomial':
      core = `${x}^{${fmt(params.exponent ?? 2)}}`;
      break;
    case 'exponential': {
      const base = params.base ?? 2;
      core = `\\frac{${fmt(base)}^{${x}} - 1}{${fmt(base - 1)}}`;
      break;
    }
    case 'logarithmic': {
      const base = params.base ?? 10;
      core = `\\log_{${fmt(base)}}(1 + ${x} \\cdot ${fmt(base - 1)})`;
      break;
    }
    case 'logistic': {
      const k = params.steepness ?? 10;
      const mid = params.midpoint ?? 0.5;
      core = `\\frac{1}{1 + e^{-${fmt(k)}(${x} - ${fmt(mid)})}}`;
      break;
    }
    case 'logit':
      core = `\\log\\left(\\frac{${x}}{1 - ${x}}\\right)`;
      break;
    case 'smoothstep':
      core = `3${x}^2 - 2${x}^3`;
      break;
    case 'smootherstep':
      core = `6${x}^5 - 15${x}^4 + 10${x}^3`;
      break;
    case 'sine': {
      const freq = params.frequency ?? 1;
      const off = params.offset ?? 0;
      if (off === 0) {
        core = `\\frac{\\sin(${fmt(freq)}\\pi ${x}) + 1}{2}`;
      } else if (off > 0) {
        core = `\\frac{\\sin(${fmt(freq)}\\pi ${x} + ${fmt(off)}) + 1}{2}`;
      } else {
        core = `\\frac{\\sin(${fmt(freq)}\\pi ${x} - ${fmt(Math.abs(off))}) + 1}{2}`;
      }
      break;
    }
    case 'cosine':
      core = `1 - \\cos\\left(${fmt(params.frequency ?? 1)} \\cdot \\frac{\\pi}{2} ${x}\\right)`;
      break;
    case 'gaussian': {
      const mean = params.mean ?? 0.5;
      const std = params.stdDev ?? 0.2;
      core = `e^{-\\frac{(${x}-${fmt(mean)})^2}{${fmt(2 * std * std)}}}`;
      break;
    }
    case 'step':
      // Step function has special formatting
      if (invert) {
        const threshold = params.threshold ?? 0.5;
        let formula = `\\begin{cases} 0 & ${x} > ${fmt(threshold)} \\\\ 1 & ${x} \\leq ${fmt(threshold)} \\end{cases}`;
        if (yShift !== 0) {
          if (yShift > 0) formula += ` + ${fmt(yShift)}`;
          else formula += ` - ${fmt(Math.abs(yShift))}`;
        }
        return `y = ${formula}`;
      }
      {
        const threshold = params.threshold ?? 0.5;
        let formula = `\\begin{cases} 1 & ${x} > ${fmt(threshold)} \\\\ 0 & ${x} \\leq ${fmt(threshold)} \\end{cases}`;
        if (yShift !== 0) {
          if (yShift > 0) formula += ` + ${fmt(yShift)}`;
          else formula += ` - ${fmt(Math.abs(yShift))}`;
        }
        return `y = ${formula}`;
      }
    case 'piecewiseLinear': {
      const pts = params.points ?? [{ x: 0, y: 0 }, { x: 1, y: 1 }];
      const ptsStr = pts.map(p => `(${fmt(p.x)},${fmt(p.y)})`).join(' \\to ');
      let result = ptsStr;
      if (xShift !== 0) result = `x \\mapsto ${fmtX(xShift)}, ${result}`;
      if (yShift !== 0) {
        if (yShift > 0) result += ` + ${fmt(yShift)}`;
        else result += ` - ${fmt(Math.abs(yShift))}`;
      }
      if (invert) result = `1 - (${result})`;
      return `y: ${result}`;
    }
    default:
      core = x;
  }

  return wrapFormula(core, yShift, invert);
};

export const curveParamConfig: Record<CurveType, { key: keyof CurveParams; label: string; min: number; max: number; step: number }[]> = {
  linear: [
    { key: 'slope', label: 'm', min: -5, max: 5, step: 0.1 },
    { key: 'intercept', label: 'b', min: -1, max: 1, step: 0.1 },
  ],
  polynomial: [{ key: 'exponent', label: 'n', min: 0.1, max: 10, step: 0.1 }],
  exponential: [{ key: 'base', label: 'base', min: 0.1, max: 10, step: 0.1 }],
  logarithmic: [{ key: 'base', label: 'base', min: 1.1, max: 100, step: 0.1 }],
  logistic: [
    { key: 'steepness', label: 'k', min: 1, max: 50, step: 1 },
    { key: 'midpoint', label: 'mid', min: 0, max: 1, step: 0.05 },
  ],
  logit: [{ key: 'base', label: 'base', min: 1.1, max: 10, step: 0.1 }],
  smoothstep: [],
  smootherstep: [],
  sine: [
    { key: 'frequency', label: 'freq', min: 0.5, max: 4, step: 0.1 },
    { key: 'offset', label: 'off', min: -3.14, max: 3.14, step: 0.1 },
  ],
  cosine: [{ key: 'frequency', label: 'freq', min: 0.5, max: 4, step: 0.1 }],
  gaussian: [
    { key: 'mean', label: 'mean', min: 0, max: 1, step: 0.05 },
    { key: 'stdDev', label: 'std', min: 0.05, max: 0.5, step: 0.01 },
  ],
  step: [{ key: 'threshold', label: 't', min: 0, max: 1, step: 0.05 }],
  piecewiseLinear: [], // Points are handled separately in UI
};
