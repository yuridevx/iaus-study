# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## UI Guidelines

- **Auto-save everything** - No manual save buttons; persist changes immediately on every edit
- **In-place editing** - Click/double-click to edit names directly; no separate edit buttons or modals
- **Icons over labels** - Use symbols (⧉ ↑ ↓ ×) instead of text labels; rely on tooltips for clarity
- **Minimize clicks** - Flatten dropdown menus into visible icon buttons when possible
- **No confirmation dialogs** - Trust the user; undo via browser refresh or re-import if needed

## Project Overview

IAUS Study is a web-based tool for designing and visualizing **Utility AI response curves** used in game AI decision-making systems. It implements the Infinite Axis Utility System (IAUS) pattern where AI agents score multiple actions based on weighted considerations.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4 (via @tailwindcss/vite plugin)
- Zustand for state management (persisted to localStorage)
- Recharts for graphs/visualizations
- react-katex for LaTeX math formula rendering
- react-router-dom with HashRouter (for GitHub Pages compatibility)

## Architecture

### Domain Model

The core concepts form a hierarchy:
- **CurveConfig**: A response curve (type + parameters + invert flag) that maps input [0,1] → output [0,1]
- **Consideration**: An input value paired with a curve to evaluate it
- **Action**: A named collection of considerations; final score = product of all consideration outputs with IAUS compensation
- **Scenario**: A collection of actions to compare; the highest-scoring action "wins"

### Key Files

- [src/lib/types.ts](src/lib/types.ts) - All TypeScript interfaces and the 13 supported curve types
- [src/lib/curves.ts](src/lib/curves.ts) - Curve evaluation functions, formula generation, and parameter configs
- [src/lib/compensation.ts](src/lib/compensation.ts) - IAUS compensation factor: `score + (1-score) * modFactor * score`
- [src/lib/codeGen.ts](src/lib/codeGen.ts) - Generates C# code for Unity/System.Math export
- [src/stores/iausStore.ts](src/stores/iausStore.ts) - Single Zustand store; all state changes auto-save scenarios

### Pages

1. **CurvesPage** (`/`) - Single curve editor with parameter sliders and live graph
2. **MultiPage** (`/multi`) - Build scenarios with multiple actions and considerations
3. **SimulatorPage** (`/simulator`) - Interactive testing with visualizations (heatmaps, sweep graphs, 2D decision maps)
4. **LibraryPage** (`/library`) - Export C# code with configurable options (float/double, Unity/System math)
5. **PresetsPage** (`/presets`) - Pre-built scenario templates (e.g., Combat AI)

### State Management Pattern

The store uses auto-save: all action/consideration CRUD operations automatically persist changes to the scenarios list. The `autoSave` helper merges updates into `currentScenario` and syncs to `scenarios[]`.

### Curve Types

13 curve types: linear, polynomial, exponential, logarithmic, logistic, logit, smoothstep, smootherstep, sine, cosine, gaussian, step, piecewiseLinear. All support x/y shift parameters and inversion.
