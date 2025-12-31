import { useMemo, useState } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { useIAUSStore } from '../../stores/iausStore';
import { generateLibraryCode } from '../../lib/codeGen';

export const LibraryPage = () => {
  const { libraryConfig, updateLibraryConfig } = useIAUSStore();
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => generateLibraryCode(libraryConfig),
    [libraryConfig]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ResponseCurves.cs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Config */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-medium text-slate-500 mb-4">Config</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Numeric type */}
            <div>
              <div className="text-sm text-slate-500 mb-3">Type</div>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer py-1 px-1">
                  <input
                    type="radio"
                    name="numericType"
                    checked={libraryConfig.numericType === 'float'}
                    onChange={() => updateLibraryConfig({ numericType: 'float' })}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className="text-sm">float</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-1 px-1">
                  <input
                    type="radio"
                    name="numericType"
                    checked={libraryConfig.numericType === 'double'}
                    onChange={() => updateLibraryConfig({ numericType: 'double' })}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className="text-sm">double</span>
                </label>
              </div>
            </div>

            {/* Math library */}
            <div>
              <div className="text-sm text-slate-500 mb-3">Math</div>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer py-1 px-1">
                  <input
                    type="radio"
                    name="mathLibrary"
                    checked={libraryConfig.mathLibrary === 'system'}
                    onChange={() => updateLibraryConfig({ mathLibrary: 'system' })}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className="text-sm">MathF</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-1 px-1">
                  <input
                    type="radio"
                    name="mathLibrary"
                    checked={libraryConfig.mathLibrary === 'unity'}
                    onChange={() => updateLibraryConfig({ mathLibrary: 'unity' })}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className="text-sm">Unity</span>
                </label>
              </div>
            </div>

            {/* Options */}
            <div className="sm:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer py-1 px-1">
                <input
                  type="checkbox"
                  checked={libraryConfig.includeXmlDocs}
                  onChange={() =>
                    updateLibraryConfig({ includeXmlDocs: !libraryConfig.includeXmlDocs })
                  }
                  className="w-5 h-5 accent-blue-500"
                />
                <span className="text-sm">XML Docs</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer py-1 px-1">
                <input
                  type="checkbox"
                  checked={libraryConfig.includeInterface}
                  onChange={() =>
                    updateLibraryConfig({ includeInterface: !libraryConfig.includeInterface })
                  }
                  className="w-5 h-5 accent-blue-500"
                />
                <span className="text-sm">ICurve</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <span className="text-sm text-slate-600 font-mono">ResponseCurves.cs</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {copied ? '✓' : '📋'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                💾
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-700 overflow-x-auto max-h-96 overflow-y-auto">
            {code}
          </pre>
        </div>
      </div>
    </PageContainer>
  );
};
