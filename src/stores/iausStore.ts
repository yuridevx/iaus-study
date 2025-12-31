import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurveConfig, CurveType, Consideration, Action, LibraryConfig, PresetScenario, Scenario } from '../lib/types';
import { defaultParams } from '../lib/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultCurve = (name?: string): CurveConfig => ({
  id: generateId(),
  name: name || 'Curve',
  type: 'polynomial',
  params: { ...defaultParams.polynomial },
  invert: false,
});

// Validate and filter out invalid considerations
const validateConsiderations = (considerations: Consideration[]): Consideration[] =>
  considerations.filter(c => c && c.curve && c.curve.type && c.curve.params);

// Validate actions (filter out considerations with null curves)
const validateActions = (actions: Action[]): Action[] =>
  actions.map(a => ({
    ...a,
    considerations: validateConsiderations(a.considerations || []),
  })).filter(a => a && a.id);

const createDefaultConsideration = (curve?: CurveConfig): Consideration => ({
  id: generateId(),
  curve: curve ? { ...curve, id: generateId() } : createDefaultCurve(),
  inputValue: 0.5,
});

const createDefaultAction = (name?: string): Action => ({
  id: generateId(),
  name: name || 'Action',
  considerations: [createDefaultConsideration()],
});

const createEmptyScenario = (name?: string): Scenario => ({
  id: generateId(),
  name: name || 'Untitled',
  actions: [createDefaultAction('Action 1')],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

interface IAUSState {
  // Curve editor
  currentCurve: CurveConfig;
  testInput: number;
  savedCurves: CurveConfig[];
  libraryConfig: LibraryConfig;

  // Scenario management
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  activeActionId: string | null;

  // Current curve methods
  setCurrentCurve: (curve: CurveConfig) => void;
  updateCurrentCurveType: (type: CurveType) => void;
  updateCurrentCurveParams: (params: Partial<CurveConfig['params']>) => void;
  updateCurrentCurveName: (name: string) => void;
  toggleCurrentCurveInvert: () => void;
  setTestInput: (value: number) => void;
  resetCurrentCurve: () => void;

  // Saved curves methods
  saveCurve: (curve: CurveConfig) => void;
  deleteCurve: (id: string) => void;
  loadCurve: (id: string) => void;

  // Scenario CRUD
  newScenario: () => void;
  saveScenario: () => void;
  saveScenarioAs: (name: string) => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  renameScenario: (name: string) => void;
  duplicateScenario: () => void;
  importPreset: (preset: PresetScenario) => void;
  importFromJSON: (json: string) => boolean;
  exportToJSON: () => string;

  // Action CRUD (within current scenario)
  addAction: (name?: string) => void;
  removeAction: (id: string) => void;
  renameAction: (id: string, name: string) => void;
  setActiveAction: (id: string | null) => void;

  // Consideration CRUD (within active action)
  addConsideration: (curve?: CurveConfig) => void;
  removeConsideration: (id: string) => void;
  updateConsiderationInput: (id: string, value: number) => void;
  updateConsiderationCurve: (id: string, curve: CurveConfig) => void;

  // Library config
  updateLibraryConfig: (config: Partial<LibraryConfig>) => void;
}

// Deep clone to avoid mutation
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Auto-save helper: updates currentScenario and syncs to scenarios list
const autoSave = (state: IAUSState, updates: Partial<Scenario>): Partial<IAUSState> => {
  if (!state.currentScenario) return {};
  const updated = { ...state.currentScenario, ...updates, updatedAt: Date.now() };
  const existingIdx = state.scenarios.findIndex(s => s.id === updated.id);
  const scenarios = existingIdx >= 0
    ? state.scenarios.map((s, i) => i === existingIdx ? updated : s)
    : [...state.scenarios, updated];
  return { scenarios, currentScenario: updated };
};

export const useIAUSStore = create<IAUSState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCurve: createDefaultCurve('New Curve'),
      testInput: 0.5,
      savedCurves: [],
      libraryConfig: {
        numericType: 'float',
        mathLibrary: 'system',
        includeXmlDocs: true,
        includeInterface: true,
      },
      scenarios: [],
      currentScenario: null,
      activeActionId: null,

      // Current curve methods
      setCurrentCurve: (curve) => set({ currentCurve: curve }),

      updateCurrentCurveType: (type) => set((state) => ({
        currentCurve: {
          ...state.currentCurve,
          type,
          params: { ...defaultParams[type], xShift: 0, yShift: 0 },
        },
      })),

      updateCurrentCurveParams: (params) => set((state) => ({
        currentCurve: {
          ...state.currentCurve,
          params: { ...state.currentCurve.params, ...params },
        },
      })),

      updateCurrentCurveName: (name) => set((state) => {
        const updatedCurve = { ...state.currentCurve, name };
        const existingIndex = state.savedCurves.findIndex(c => c.id === updatedCurve.id);
        const savedCurves = existingIndex >= 0
          ? state.savedCurves.map((c, i) => i === existingIndex ? updatedCurve : c)
          : [...state.savedCurves, updatedCurve];
        return { currentCurve: updatedCurve, savedCurves };
      }),

      toggleCurrentCurveInvert: () => set((state) => ({
        currentCurve: {
          ...state.currentCurve,
          invert: !state.currentCurve.invert,
        },
      })),

      setTestInput: (value) => set({ testInput: value }),

      resetCurrentCurve: () => set({
        currentCurve: createDefaultCurve('New Curve'),
        testInput: 0.5,
      }),

      // Saved curves
      saveCurve: (curve) => set((state) => {
        const existingIndex = state.savedCurves.findIndex(c => c.id === curve.id);
        if (existingIndex >= 0) {
          return {
            savedCurves: state.savedCurves.map((c, i) =>
              i === existingIndex ? curve : c
            ),
          };
        }
        return { savedCurves: [...state.savedCurves, curve] };
      }),

      deleteCurve: (id) => set((state) => ({
        savedCurves: state.savedCurves.filter(c => c.id !== id),
        currentCurve: state.currentCurve.id === id
          ? createDefaultCurve('New Curve')
          : state.currentCurve,
      })),

      loadCurve: (id) => set((state) => {
        const curve = state.savedCurves.find(c => c.id === id);
        if (curve) return { currentCurve: { ...curve } };
        return {};
      }),

      // Scenario CRUD (all methods auto-save)
      newScenario: () => {
        const scenario = createEmptyScenario();
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
          currentScenario: scenario,
          activeActionId: scenario.actions[0]?.id || null,
        }));
      },

      saveScenario: () => set((state) => autoSave(state, {})),

      saveScenarioAs: (name) => set((state) => {
        if (!state.currentScenario) return {};
        const newScenario: Scenario = {
          ...clone(state.currentScenario),
          id: generateId(),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return {
          scenarios: [...state.scenarios, newScenario],
          currentScenario: newScenario,
        };
      }),

      loadScenario: (id) => set((state) => {
        const scenario = state.scenarios.find(s => s.id === id);
        if (!scenario) return {};
        const loaded = clone(scenario);
        return {
          currentScenario: loaded,
          activeActionId: loaded.actions[0]?.id || null,
        };
      }),

      deleteScenario: (id) => set((state) => {
        const scenarios = state.scenarios.filter(s => s.id !== id);
        const isCurrent = state.currentScenario?.id === id;
        return {
          scenarios,
          currentScenario: isCurrent ? null : state.currentScenario,
          activeActionId: isCurrent ? null : state.activeActionId,
        };
      }),

      renameScenario: (name) => set((state) => autoSave(state, { name })),

      duplicateScenario: () => set((state) => {
        if (!state.currentScenario) return {};
        const dup: Scenario = {
          ...clone(state.currentScenario),
          id: generateId(),
          name: `${state.currentScenario.name} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return {
          scenarios: [...state.scenarios, dup],
          currentScenario: dup,
          activeActionId: dup.actions[0]?.id || null,
        };
      }),

      importPreset: (preset) => {
        const scenario: Scenario = {
          id: generateId(),
          name: preset.name,
          actions: clone(preset.actions).map(a => ({
            ...a,
            id: generateId(),
            considerations: a.considerations.map(c => ({
              ...c,
              id: generateId(),
              curve: { ...c.curve, id: generateId() },
            })),
          })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          scenarios: [...state.scenarios, scenario],
          currentScenario: scenario,
          activeActionId: scenario.actions[0]?.id || null,
        }));
      },

      importFromJSON: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.name || !Array.isArray(data.actions)) return false;
          const actions = data.actions.map((a: Action) => ({
            id: generateId(),
            name: a.name || 'Action',
            considerations: (a.considerations || [])
              .filter((c: Consideration) => c && c.curve && c.curve.type)
              .map((c: Consideration) => ({
                id: generateId(),
                inputValue: c.inputValue ?? 0.5,
                curve: {
                  id: generateId(),
                  name: c.curve.name || 'Curve',
                  type: c.curve.type,
                  params: c.curve.params || { ...defaultParams[c.curve.type] },
                  invert: c.curve.invert ?? false,
                },
              })),
          })).filter((a: Action) => a.considerations.length > 0 || data.actions.length === 1);

          if (actions.length === 0) return false;

          const scenario: Scenario = {
            id: generateId(),
            name: data.name,
            actions,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            scenarios: [...state.scenarios, scenario],
            currentScenario: scenario,
            activeActionId: scenario.actions[0]?.id || null,
          }));
          return true;
        } catch {
          return false;
        }
      },

      exportToJSON: () => {
        const { currentScenario } = get();
        if (!currentScenario) return '';
        const exportData = {
          name: currentScenario.name,
          actions: currentScenario.actions,
        };
        return JSON.stringify(exportData, null, 2);
      },

      // Action CRUD (auto-saves)
      addAction: (name) => set((state) => {
        if (!state.currentScenario) return {};
        const newAction = createDefaultAction(name || `Action ${state.currentScenario.actions.length + 1}`);
        const actions = [...state.currentScenario.actions, newAction];
        return {
          ...autoSave(state, { actions }),
          activeActionId: newAction.id,
        };
      }),

      removeAction: (id) => set((state) => {
        if (!state.currentScenario) return {};
        const actions = state.currentScenario.actions.filter(a => a.id !== id);
        const needNewActive = state.activeActionId === id;
        return {
          ...autoSave(state, { actions }),
          activeActionId: needNewActive ? (actions[0]?.id || null) : state.activeActionId,
        };
      }),

      renameAction: (id, name) => set((state) => {
        if (!state.currentScenario) return {};
        const actions = state.currentScenario.actions.map(a =>
          a.id === id ? { ...a, name } : a
        );
        return autoSave(state, { actions });
      }),

      setActiveAction: (id) => set({ activeActionId: id }),

      // Consideration CRUD (auto-saves)
      addConsideration: (curve) => set((state) => {
        if (!state.currentScenario || !state.activeActionId) return {};
        const consideration = createDefaultConsideration(curve);
        const actions = state.currentScenario.actions.map(a =>
          a.id === state.activeActionId
            ? { ...a, considerations: [...a.considerations, consideration] }
            : a
        );
        return autoSave(state, { actions });
      }),

      removeConsideration: (id) => set((state) => {
        if (!state.currentScenario || !state.activeActionId) return {};
        const actions = state.currentScenario.actions.map(a =>
          a.id === state.activeActionId
            ? { ...a, considerations: a.considerations.filter(c => c.id !== id) }
            : a
        );
        return autoSave(state, { actions });
      }),

      updateConsiderationInput: (id, value) => set((state) => {
        if (!state.currentScenario) return {};
        const actions = state.currentScenario.actions.map(a => ({
          ...a,
          considerations: a.considerations.map(c =>
            c.id === id ? { ...c, inputValue: value } : c
          ),
        }));
        return autoSave(state, { actions });
      }),

      updateConsiderationCurve: (id, curve) => set((state) => {
        if (!state.currentScenario) return {};
        const actions = state.currentScenario.actions.map(a => ({
          ...a,
          considerations: a.considerations.map(c =>
            c.id === id ? { ...c, curve } : c
          ),
        }));
        return autoSave(state, { actions });
      }),

      // Library config
      updateLibraryConfig: (config) => set((state) => ({
        libraryConfig: { ...state.libraryConfig, ...config },
      })),
    }),
    {
      name: 'iaus-storage',
      partialize: (state) => ({
        savedCurves: state.savedCurves,
        libraryConfig: state.libraryConfig,
        scenarios: state.scenarios,
        currentScenario: state.currentScenario,
        activeActionId: state.activeActionId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Validate scenarios on load
        if (state.scenarios) {
          state.scenarios = state.scenarios
            .filter(s => s && s.id && s.name)
            .map(s => ({
              ...s,
              actions: validateActions(s.actions || []),
            }));
        }
        // Validate current scenario
        if (state.currentScenario) {
          if (!state.currentScenario.id || !state.currentScenario.name) {
            state.currentScenario = null;
            state.activeActionId = null;
          } else {
            state.currentScenario.actions = validateActions(state.currentScenario.actions || []);
            // Validate activeActionId
            if (state.activeActionId && !state.currentScenario.actions.find(a => a.id === state.activeActionId)) {
              state.activeActionId = state.currentScenario.actions[0]?.id || null;
            }
          }
        }
        // Validate saved curves
        if (state.savedCurves) {
          state.savedCurves = state.savedCurves.filter(c => c && c.id && c.type && c.params);
        }
      },
    }
  )
);
