import { HashRouter, Routes, Route } from 'react-router-dom';
import { CurvesPage } from './components/pages/CurvesPage';
import { MultiPage } from './components/pages/MultiPage';
import { SimulatorPage } from './components/pages/SimulatorPage';
import { LibraryPage } from './components/pages/LibraryPage';
import { PresetsPage } from './components/pages/PresetsPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CurvesPage />} />
        <Route path="/multi" element={<MultiPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/presets" element={<PresetsPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
