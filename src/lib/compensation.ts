import type { Consideration } from './types';
import { evaluateCurve } from './curves';

// Apply IAUS compensation factor to prevent score collapse
export const applyCompensation = (score: number, considerationCount: number): number => {
  if (considerationCount <= 1) return score;
  const modFactor = 1 - (1 / considerationCount);
  return score + ((1 - score) * modFactor * score);
};

// Score with early termination on zero
export const scoreWithTermination = (currentScore: number, newValue: number): number => {
  if (newValue <= 0) return 0;
  return currentScore * newValue;
};

// Evaluate a single consideration
export const evaluateConsideration = (consideration: Consideration): number => {
  const { curve, inputValue } = consideration;
  return evaluateCurve(curve.type, inputValue, curve.params, curve.invert);
};

// Calculate raw score (product of all consideration outputs)
export const calculateRawScore = (considerations: Consideration[]): number => {
  if (considerations.length === 0) return 0;
  
  let score = 1;
  for (const consideration of considerations) {
    const value = evaluateConsideration(consideration);
    score = scoreWithTermination(score, value);
    if (score === 0) break;
  }
  return score;
};

// Calculate compensated score
export const calculateCompensatedScore = (considerations: Consideration[]): number => {
  const rawScore = calculateRawScore(considerations);
  return applyCompensation(rawScore, considerations.length);
};

// Get individual consideration outputs
export const getConsiderationOutputs = (considerations: Consideration[]): number[] => {
  return considerations.map(evaluateConsideration);
};

// Calculate modification factor for visualization
export const getModificationFactor = (considerationCount: number): number => {
  if (considerationCount <= 1) return 0;
  return 1 - (1 / considerationCount);
};

// Calculate the boost amount from compensation
export const getCompensationBoost = (rawScore: number, considerationCount: number): number => {
  const compensated = applyCompensation(rawScore, considerationCount);
  return compensated - rawScore;
};
