import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurveConfig, CurveType, Consideration, Action, LibraryConfig } from '../lib/types';
import { defaultParams } from '../lib/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultCurve = (name?: string): CurveConfig => ({
  id: generateId(),
  name: name || 'Untitled Curve',
  type: 'polynomial',
  params: { ...defaultParams.polynomial },
  invert: false,
});

const createDefaultConsideration = (curve?: CurveConfig): Consideration => ({
  id: generateId(),
  curve: curve || createDefaultCurve(),
  inputValue: 0.5,
});

interface IAUSState {
  currentCurve: CurveConfig;
  testInput: number;
  savedCurves: CurveConfig[];
  considerations: Consideration[];
  actions: Action[];
  scenarioInputs: Record<string, number>;
  libraryConfig: LibraryConfig;
  
  setCurrentCurve: (curve: CurveConfig) => void;
  updateCurrentCurveType: (type: CurveType) => void;
  updateCurrentCurveParams: (params: Partial<CurveConfig['params']>) => void;
  updateCurrentCurveName: (name: string) => void;
  toggleCurrentCurveInvert: () => void;
  setTestInput: (value: number) => void;
  saveCurve: (curve: CurveConfig) => void;
  deleteCurve: (id: string) => void;
  loadCurve: (id: string) => void;
  addConsideration: (curve?: CurveConfig) => void;
  removeConsideration: (id: string) => void;
  updateConsiderationInput: (id: string, value: number) => void;
  updateConsiderationCurve: (id: string, updates: Partial<CurveConfig>) => void;
  loadSavedCurveToConsideration: (considerationId: string, curveId: string) => void;
  setConsiderations: (considerations: Consideration[]) => void;
  updateLibraryConfig: (config: Partial<LibraryConfig>) => void;
  resetCurrentCurve: () => void;
}

export const useIAUSStore = create<IAUSState>()(
  persist(
    (set) => ({
      currentCurve: createDefaultCurve('New Curve'),
      testInput: 0.5,
      savedCurves: [],
      considerations: [createDefaultConsideration()],
      actions: [],
      scenarioInputs: {},
      libraryConfig: {
        numericType: 'float',
        mathLibrary: 'system',
        includeXmlDocs: true,
        includeInterface: true,
      },
      
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
      
      addConsideration: (curve) => set((state) => ({
        considerations: [
          ...state.considerations,
          createDefaultConsideration(curve),
        ],
      })),
      
      removeConsideration: (id) => set((state) => ({
        considerations: state.considerations.filter(c => c.id !== id),
      })),
      
      updateConsiderationInput: (id, value) => set((state) => ({
        considerations: state.considerations.map(c =>
          c.id === id ? { ...c, inputValue: value } : c
        ),
      })),
      
      updateConsiderationCurve: (id, updates) => set((state) => ({
        considerations: state.considerations.map(c =>
          c.id === id ? { ...c, curve: { ...c.curve, ...updates } } : c
        ),
      })),
      
      loadSavedCurveToConsideration: (considerationId, curveId) => set((state) => {
        const savedCurve = state.savedCurves.find(c => c.id === curveId);
        if (!savedCurve) return {};
        return {
          considerations: state.considerations.map(c =>
            c.id === considerationId
              ? { ...c, curve: { ...savedCurve, id: generateId() } }
              : c
          ),
        };
      }),

      setConsiderations: (considerations) => set({ considerations }),

      updateLibraryConfig: (config) => set((state) => ({
        libraryConfig: { ...state.libraryConfig, ...config },
      })),
      
      resetCurrentCurve: () => set({
        currentCurve: createDefaultCurve('New Curve'),
        testInput: 0.5,
      }),
    }),
    {
      name: 'iaus-storage',
      partialize: (state) => ({
        savedCurves: state.savedCurves,
        libraryConfig: state.libraryConfig,
      }),
    }
  )
);
