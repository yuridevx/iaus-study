import type { CurveConfig, PresetScenario } from './types';

const generateId = () => Math.random().toString(36).substring(2, 9);

// Preset curves for common use cases
export const presetCurves: CurveConfig[] = [
  {
    id: 'preset-distance',
    name: 'Distance',
    type: 'polynomial',
    params: { exponent: 2, xShift: 0, yShift: 0 },
    invert: true,
  },
  {
    id: 'preset-health-low',
    name: 'Low Health',
    type: 'logistic',
    params: { steepness: 10, midpoint: 0.3, xShift: 0, yShift: 0 },
    invert: true,
  },
  {
    id: 'preset-threat',
    name: 'Threat',
    type: 'linear',
    params: { slope: 1, intercept: 0, xShift: 0, yShift: 0 },
    invert: false,
  },
  {
    id: 'preset-cooldown',
    name: 'Cooldown Ready',
    type: 'step',
    params: { threshold: 0.9, xShift: 0, yShift: 0 },
    invert: false,
  },
];

// Combat AI preset scenario
export const combatScenario: PresetScenario = {
  id: 'combat-ai',
  name: 'Combat AI',
  description: 'Classic game AI decision-making for attack, heal, retreat actions',
  actions: [
    {
      id: 'action-attack',
      name: 'Attack',
      considerations: [
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'Distance',
            type: 'polynomial',
            params: { exponent: 2, xShift: 0, yShift: 0 },
            invert: true,
          },
          inputValue: 0.5,
        },
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'Enemy Health',
            type: 'linear',
            params: { slope: 1, intercept: 0, xShift: 0, yShift: 0 },
            invert: true,
          },
          inputValue: 0.5,
        },
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'Ammo',
            type: 'step',
            params: { threshold: 0.1, xShift: 0, yShift: 0 },
            invert: false,
          },
          inputValue: 0.7,
        },
      ],
    },
    {
      id: 'action-heal',
      name: 'Heal',
      considerations: [
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'My Health',
            type: 'logistic',
            params: { steepness: 10, midpoint: 0.3, xShift: 0, yShift: 0 },
            invert: true,
          },
          inputValue: 0.3,
        },
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'In Combat',
            type: 'step',
            params: { threshold: 0.5, xShift: 0, yShift: 0 },
            invert: true,
          },
          inputValue: 0.8,
        },
      ],
    },
    {
      id: 'action-retreat',
      name: 'Retreat',
      considerations: [
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'My Health',
            type: 'logistic',
            params: { steepness: 15, midpoint: 0.2, xShift: 0, yShift: 0 },
            invert: true,
          },
          inputValue: 0.3,
        },
        {
          id: generateId(),
          curve: {
            id: generateId(),
            name: 'Enemies',
            type: 'polynomial',
            params: { exponent: 1.5, xShift: 0, yShift: 0 },
            invert: false,
          },
          inputValue: 0.6,
        },
      ],
    },
  ],
};

export const presetScenarios: PresetScenario[] = [combatScenario];
