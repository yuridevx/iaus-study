import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../layout/PageContainer';
import { ConsiderationCard } from '../controls/ConsiderationCard';
import { CombinedCurveGraph } from '../graphs/CombinedCurveGraph';
import { ContributionBars } from '../graphs/ContributionBars';
import { useIAUSStore } from '../../stores/iausStore';
import { presetScenarios } from '../../lib/presets';
import type { CurveConfig } from '../../lib/types';
import {
  calculateRawScore,
  calculateCompensatedScore,
  getModificationFactor,
  getCompensationBoost,
} from '../../lib/compensation';
import { generateSingleCurveCode, generateScorerCode } from '../../lib/codeGen';

export const MultiPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    scenarios,
    currentScenario,
    activeActionId,
    isDirty,
    savedCurves,
    libraryConfig,
    newScenario,
    saveScenario,
    saveScenarioAs,
    loadScenario,
    deleteScenario,
    renameScenario,
    duplicateScenario,
    importPreset,
    importFromJSON,
    exportToJSON,
    addAction,
    removeAction,
    renameAction,
    setActiveAction,
    addConsideration,
    removeConsideration,
    updateConsiderationInput,
    updateConsiderationCurve,
    setCurrentCurve,
  } = useIAUSStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showScenarioList, setShowScenarioList] = useState(false);
  const [editingScenarioName, setEditingScenarioName] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copiedCurves, setCopiedCurves] = useState(false);
  const [copiedScorer, setCopiedScorer] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [showSaveAs, setShowSaveAs] = useState(false);

  const activeAction = currentScenario?.actions.find(a => a.id === activeActionId);
  const considerations = activeAction?.considerations || [];

  const handleEditCurve = (curve: CurveConfig, considerationId: string) => {
    setCurrentCurve({ ...curve });
    navigate(`/?returnTo=multi&considerationId=${considerationId}`);
  };

  const handleCopyCurves = async () => {
    const code = considerations
      .map((c) => generateSingleCurveCode(c.curve, libraryConfig))
      .join('\n\n');
    await navigator.clipboard.writeText(code);
    setCopiedCurves(true);
    setTimeout(() => setCopiedCurves(false), 2000);
  };

  const handleCopyScorer = async () => {
    const code = generateScorerCode(considerations, libraryConfig);
    await navigator.clipboard.writeText(code);
    setCopiedScorer(true);
    setTimeout(() => setCopiedScorer(false), 2000);
  };

  const handleExportJSON = () => {
    const json = exportToJSON();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScenario?.name || 'scenario'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importFromJSON(reader.result as string);
      if (!success) alert('Invalid scenario file');
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowMenu(false);
  };

  const handleSaveAs = () => {
    if (saveAsName.trim()) {
      saveScenarioAs(saveAsName.trim());
      setSaveAsName('');
      setShowSaveAs(false);
    }
  };

  const handleStartEditScenarioName = () => {
    if (currentScenario) {
      setEditName(currentScenario.name);
      setEditingScenarioName(true);
    }
  };

  const handleFinishEditScenarioName = () => {
    if (editName.trim()) {
      renameScenario(editName.trim());
    }
    setEditingScenarioName(false);
    setEditName('');
  };

  const handleStartEditAction = (actionId: string, name: string) => {
    setEditingActionId(actionId);
    setEditName(name);
  };

  const handleFinishEditAction = () => {
    if (editingActionId && editName.trim()) {
      renameAction(editingActionId, editName.trim());
    }
    setEditingActionId(null);
    setEditName('');
  };

  const rawScore = useMemo(() => calculateRawScore(considerations), [considerations]);
  const compensatedScore = useMemo(() => calculateCompensatedScore(considerations), [considerations]);
  const modFactor = getModificationFactor(considerations.length);
  const boost = getCompensationBoost(rawScore, considerations.length);

  // Empty state
  if (!currentScenario) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
          <div className="text-lg mb-6">No scenario loaded</div>
          <div className="flex gap-3">
            <button
              onClick={newScenario}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <span>+</span> New
            </button>
            <div className="relative">
              <button
                onClick={() => setShowScenarioList(!showScenarioList)}
                className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-2"
              >
                <span>↓</span> Preset
              </button>
              {showScenarioList && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-10 min-w-40">
                  {presetScenarios.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { importPreset(p); setShowScenarioList(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {scenarios.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowScenarioList(!showScenarioList)}
                  className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-2"
                >
                  <span>📁</span> Open
                </button>
                {showScenarioList && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-10 min-w-40">
                    {scenarios.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { loadScenario(s.id); setShowScenarioList(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-sm text-blue-500 hover:underline"
          >
            Import from file...
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Scenario Toolbar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        {/* Scenario selector */}
        <div className="relative">
          <button
            onClick={() => setShowScenarioList(!showScenarioList)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50"
          >
            <span className="text-slate-400">📁</span>
            {editingScenarioName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishEditScenarioName}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEditScenarioName()}
                className="w-32 px-1 border rounded text-sm"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm font-medium">{currentScenario.name}</span>
            )}
            {isDirty && <span className="text-orange-500 text-xs">●</span>}
            <span className="text-slate-400 text-xs">▼</span>
          </button>
          {showScenarioList && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-20 min-w-48">
              {scenarios.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs text-slate-400 border-b">Saved</div>
                  {scenarios.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { loadScenario(s.id); setShowScenarioList(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>{s.name}</span>
                      {s.id === currentScenario.id && <span className="text-green-500">✓</span>}
                    </button>
                  ))}
                </>
              )}
              <div className="border-t">
                <button
                  onClick={() => { newScenario(); setShowScenarioList(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  + New
                </button>
              </div>
              <div className="border-t">
                <div className="px-3 py-1.5 text-xs text-slate-400">Presets</div>
                {presetScenarios.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { importPreset(p); setShowScenarioList(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    ↓ {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit name button */}
        <button
          onClick={handleStartEditScenarioName}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
          title="Rename"
        >
          ✎
        </button>

        {/* Save button */}
        <button
          onClick={saveScenario}
          className={`px-3 py-1.5 text-sm rounded ${isDirty ? 'bg-blue-500 text-white hover:bg-blue-600' : 'border border-slate-300 text-slate-500 hover:bg-slate-50'}`}
          title="Save"
        >
          💾
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-2 py-1.5 text-slate-500 border border-slate-300 rounded hover:bg-slate-50"
          >
            ⋯
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-20 min-w-36">
              <button
                onClick={() => { setShowSaveAs(true); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                Save as...
              </button>
              <button
                onClick={() => { duplicateScenario(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                📋 Duplicate
              </button>
              <div className="border-t" />
              <button
                onClick={handleExportJSON}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                ↑ Export JSON
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                ↓ Import JSON
              </button>
              <div className="border-t" />
              <button
                onClick={() => { deleteScenario(currentScenario.id); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                🗑 Delete
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />

        {/* Save As Dialog */}
        {showSaveAs && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-xl min-w-64">
              <div className="text-sm font-medium mb-2">Save as</div>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
                placeholder="Scenario name"
                className="w-full px-3 py-2 border rounded mb-3"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowSaveAs(false); setSaveAsName(''); }}
                  className="px-3 py-1.5 text-sm border rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAs}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Code export buttons */}
        {considerations.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleCopyCurves}
              className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
              title="Copy curves as C#"
            >
              {copiedCurves ? '✓' : '📋 C#'}
            </button>
            <button
              onClick={handleCopyScorer}
              className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
              title="Copy IAUS scorer"
            >
              {copiedScorer ? '✓' : '📋 IAUS'}
            </button>
          </div>
        )}
      </div>

      {/* Action Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
        {currentScenario.actions.map((action) => (
          <div
            key={action.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm cursor-pointer ${
              action.id === activeActionId
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveAction(action.id)}
          >
            {editingActionId === action.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishEditAction}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEditAction()}
                className="w-20 px-1 text-sm rounded text-slate-800"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{action.name}</span>
            )}
            {action.id === activeActionId && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartEditAction(action.id, action.name); }}
                  className="ml-1 opacity-70 hover:opacity-100"
                  title="Rename"
                >
                  ✎
                </button>
                {currentScenario.actions.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAction(action.id); }}
                    className="opacity-70 hover:opacity-100"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </div>
        ))}
        <button
          onClick={() => addAction()}
          className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded"
          title="Add action"
        >
          +
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Considerations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Considerations</h2>
            <div className="flex gap-2">
              <button
                onClick={() => addConsideration()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + New
              </button>
              {savedCurves.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const curve = savedCurves.find((c) => c.id === e.target.value);
                      if (curve) addConsideration(curve);
                    }
                    e.target.value = '';
                  }}
                  className="px-2 py-1 text-sm border border-slate-300 rounded"
                  defaultValue=""
                >
                  <option value="">+ Library</option>
                  {savedCurves.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {considerations.map((c) => (
              <ConsiderationCard
                key={c.id}
                consideration={c}
                savedCurves={savedCurves}
                onInputChange={(v) => updateConsiderationInput(c.id, v)}
                onCurveChange={(updates) => updateConsiderationCurve(c.id, { ...c.curve, ...updates })}
                onLoadSavedCurve={(curveId) => {
                  const curve = savedCurves.find(sc => sc.id === curveId);
                  if (curve) updateConsiderationCurve(c.id, curve);
                }}
                onEditInFullEditor={() => handleEditCurve(c.curve, c.id)}
                onRemove={() => removeConsideration(c.id)}
              />
            ))}
          </div>

          {considerations.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Add considerations to see combined scoring
            </div>
          )}
        </div>

        {/* Right: Graphs and scores */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Combined Curves</h3>
            <CombinedCurveGraph considerations={considerations} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Contributions</h3>
            <ContributionBars
              considerations={considerations}
              rawScore={rawScore}
              compensatedScore={compensatedScore}
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Compensation</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500">n</div>
                <div className="text-lg font-mono">{considerations.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">mod</div>
                <div className="text-lg font-mono">{modFactor.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">boost</div>
                <div className="text-lg font-mono text-green-600">+{boost.toFixed(3)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
