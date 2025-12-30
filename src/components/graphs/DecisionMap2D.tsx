import { useMemo } from 'react';
import type { Action } from '../../lib/types';
import { evaluateCurve } from '../../lib/curves';
import { applyCompensation } from '../../lib/compensation';

interface DecisionMap2DProps {
  actions: Action[];
  xActionId: string;
  xConsiderationIdx: number;
  yActionId: string;
  yConsiderationIdx: number;
}

const GRID_SIZE = 20;
const ACTION_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
];

export const DecisionMap2D = ({
  actions,
  xActionId,
  xConsiderationIdx,
  yActionId,
  yConsiderationIdx,
}: DecisionMap2DProps) => {
  const xAction = actions.find((a) => a.id === xActionId);
  const yAction = actions.find((a) => a.id === yActionId);
  const xConsideration = xAction?.considerations[xConsiderationIdx];
  const yConsideration = yAction?.considerations[yConsiderationIdx];

  const grid = useMemo(() => {
    if (!xConsideration || !yConsideration) return [];

    const cells: { x: number; y: number; winner: string; winnerIdx: number }[][] = [];

    for (let yi = 0; yi < GRID_SIZE; yi++) {
      const row: { x: number; y: number; winner: string; winnerIdx: number }[] = [];
      for (let xi = 0; xi < GRID_SIZE; xi++) {
        const xVal = xi / (GRID_SIZE - 1);
        const yVal = 1 - yi / (GRID_SIZE - 1); // Flip y so 0 is at bottom

        let maxScore = -1;
        let winnerName = '';
        let winnerIdx = 0;

        actions.forEach((action, actionIdx) => {
          let score = 1;
          for (let cIdx = 0; cIdx < action.considerations.length; cIdx++) {
            const c = action.considerations[cIdx];
            let inputVal = c.inputValue;

            // Override with x/y sweep values
            if (action.id === xActionId && cIdx === xConsiderationIdx) {
              inputVal = xVal;
            }
            if (action.id === yActionId && cIdx === yConsiderationIdx) {
              inputVal = yVal;
            }

            const val = evaluateCurve(c.curve.type, inputVal, c.curve.params, c.curve.invert);
            if (val <= 0) {
              score = 0;
              break;
            }
            score *= val;
          }

          const compScore = applyCompensation(score, action.considerations.length);
          if (compScore > maxScore) {
            maxScore = compScore;
            winnerName = action.name;
            winnerIdx = actionIdx;
          }
        });

        row.push({ x: xVal, y: yVal, winner: winnerName, winnerIdx });
      }
      cells.push(row);
    }

    return cells;
  }, [actions, xActionId, xConsiderationIdx, yActionId, yConsiderationIdx, xConsideration, yConsideration]);

  if (!xConsideration || !yConsideration) {
    return <div className="text-sm text-slate-400">Select considerations for X and Y axes</div>;
  }

  const cellSize = 12;

  return (
    <div>
      <div className="text-xs text-slate-500 mb-2">
        X: <span className="font-medium">{xConsideration.curve.name}</span>
        {' | '}
        Y: <span className="font-medium">{yConsideration.curve.name}</span>
      </div>

      <div className="relative inline-block">
        {/* Y-axis label */}
        <div
          className="absolute text-xs text-slate-500"
          style={{
            left: -20,
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            transformOrigin: 'center',
          }}
        >
          {yConsideration.curve.name.substring(0, 8)}
        </div>

        {/* Grid */}
        <div className="ml-4">
          {/* Y-axis ticks */}
          <div className="flex">
            <div className="w-6 flex flex-col justify-between text-right pr-1" style={{ height: GRID_SIZE * cellSize }}>
              <span className="text-xs text-slate-400">1</span>
              <span className="text-xs text-slate-400">0.5</span>
              <span className="text-xs text-slate-400">0</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
                gap: '1px',
                backgroundColor: '#e2e8f0',
                padding: '1px',
                borderRadius: '4px',
              }}
            >
              {grid.flat().map((cell, idx) => (
                <div
                  key={idx}
                  className="transition-colors"
                  style={{
                    backgroundColor: ACTION_COLORS[cell.winnerIdx % ACTION_COLORS.length],
                    opacity: 0.8,
                  }}
                  title={`(${cell.x.toFixed(2)}, ${cell.y.toFixed(2)}): ${cell.winner}`}
                />
              ))}
            </div>
          </div>

          {/* X-axis ticks */}
          <div className="flex ml-6" style={{ width: GRID_SIZE * cellSize }}>
            <div className="flex justify-between w-full text-xs text-slate-400 mt-1">
              <span>0</span>
              <span>0.5</span>
              <span>1</span>
            </div>
          </div>

          {/* X-axis label */}
          <div className="text-center text-xs text-slate-500 mt-1 ml-6">
            {xConsideration.curve.name.substring(0, 12)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {actions.map((action, idx) => (
          <div key={action.id} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: ACTION_COLORS[idx % ACTION_COLORS.length] }}
            />
            <span className="text-xs text-slate-600">{action.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
