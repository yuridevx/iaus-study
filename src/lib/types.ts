// Curve types available in the system
export type CurveType =
  | 'linear'
  | 'polynomial'
  | 'exponential'
  | 'logarithmic'
  | 'logistic'
  | 'logit'
  | 'smoothstep'
  | 'smootherstep'
  | 'sine'
  | 'cosine'
  | 'gaussian'
  | 'step';

// Base curve configuration
export interface CurveConfig {
  id: string;
  name: string;
  type: CurveType;
  params: CurveParams;
  invert: boolean;
}

// Parameters for each curve type
export interface CurveParams {
  // Linear: y = mx + b
  slope?: number;
  intercept?: number;
  // Polynomial: y = x^n
  exponent?: number;
  // Exponential: y = base^x
  base?: number;
  // Logistic: y = 1/(1+e^(-k(x-m)))
  steepness?: number;
  midpoint?: number;
  // Gaussian: y = e^(-(x-μ)²/2σ²)
  mean?: number;
  stdDev?: number;
  // Step: y = x > threshold ? 1 : 0
  threshold?: number;
  // Sine/Cosine
  frequency?: number;
  offset?: number;
  // X/Y shift (universal)
  xShift?: number;
  yShift?: number;
}

// Default parameters for each curve type
export const defaultParams: Record<CurveType, CurveParams> = {
  linear: { slope: 1, intercept: 0, xShift: 0, yShift: 0 },
  polynomial: { exponent: 2, xShift: 0, yShift: 0 },
  exponential: { base: 2, xShift: 0, yShift: 0 },
  logarithmic: { base: 10, xShift: 0, yShift: 0 },
  logistic: { steepness: 10, midpoint: 0.5, xShift: 0, yShift: 0 },
  logit: { base: Math.E, xShift: 0, yShift: 0 },
  smoothstep: { xShift: 0, yShift: 0 },
  smootherstep: { xShift: 0, yShift: 0 },
  sine: { frequency: 1, offset: 0, xShift: 0, yShift: 0 },
  cosine: { frequency: 1, offset: 0, xShift: 0, yShift: 0 },
  gaussian: { mean: 0.5, stdDev: 0.2, xShift: 0, yShift: 0 },
  step: { threshold: 0.5, xShift: 0, yShift: 0 },
};

// Consideration in multi-consideration scoring
export interface Consideration {
  id: string;
  curve: CurveConfig;
  inputValue: number;
}

// Action with multiple considerations
export interface Action {
  id: string;
  name: string;
  considerations: Consideration[];
}

// Library export configuration
export interface LibraryConfig {
  numericType: 'float' | 'double';
  mathLibrary: 'system' | 'unity';
  includeXmlDocs: boolean;
  includeInterface: boolean;
}

// Preset scenario
export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  actions: Action[];
}
