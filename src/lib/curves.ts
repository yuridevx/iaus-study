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
};

export const curveFormulas: Record<CurveType, string> = {
  linear: 'y = mx + b',
  polynomial: 'y = x^n',
  exponential: 'y = (base^x - 1) / (base - 1)',
  logarithmic: 'y = log_base(1 + x(base-1))',
  logistic: 'y = 1 / (1 + e^(-k(x - mid)))',
  logit: 'y = log(x / (1 - x))',
  smoothstep: 'y = 3x² - 2x³',
  smootherstep: 'y = 6x⁵ - 15x⁴ + 10x³',
  sine: 'y = (sin(freq·πx + off) + 1) / 2',
  cosine: 'y = 1 - cos(freq·(π/2)x)',
  gaussian: 'y = e^(-(x-μ)² / 2σ²)',
  step: 'y = x > t ? 1 : 0',
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
};
