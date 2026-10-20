import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ScenarioPlayer from './components/ScenarioPlayer';
import { scenarios } from './data/scenarios';

const STORAGE_KEY = 'it-simulator-pro:progress';
const APP_TITLE = 'IT Simulator Pro';

const loadProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};

// Routes: "#/" (dashboard) and "#/scenario/<id>". Hash routing keeps the
// browser back button working without a server or router dependency.
const scenarioIdFromHash = () => {
  const match = window.location.hash.match(/^#\/scenario\/([\w-]+)/);
  return match ? match[1] : null;
};

function App() {
  const [activeId, setActiveId] = useState(scenarioIdFromHash);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    const onHashChange = () => setActiveId(scenarioIdFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage may be unavailable (private mode); progress just won't persist.
    }
  }, [progress]);

  const activeScenario = scenarios.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    document.title = activeScenario ? `${activeScenario.title} | ${APP_TITLE}` : `Interview Practice Scenarios | ${APP_TITLE}`;
    window.scrollTo(0, 0);
  }, [activeScenario]);

  const handleSelectScenario = (id) => {
    window.location.hash = `#/scenario/${id}`;
  };

  const handleBackToDashboard = () => {
    window.location.hash = '#/';
  };

  const handleComplete = useCallback((id, score) => {
    setProgress((prev) => ({
      ...prev,
      [id]: { completed: true, bestScore: Math.max(score, prev[id]?.bestScore ?? 0) }
    }));
  }, []);

  return (
    <div className="app-container">
      <a
        href="#content"
        className="skip-link visually-hidden"
        onClick={(e) => {
          // The hash drives routing, so focus <main> directly instead of navigating.
          e.preventDefault();
          document.getElementById('content')?.focus();
        }}
      >
        Skip to main content
      </a>
      <header className="app-header glass-panel">
        <a href="#/" className="logo">IT Simulator Pro</a>
      </header>

      <main id="content" className="app-main" tabIndex={-1}>
        {activeScenario ? (
          <ScenarioPlayer
            key={activeScenario.id}
            scenario={activeScenario}
            progress={progress[activeScenario.id]}
            onComplete={handleComplete}
            onBack={handleBackToDashboard}
          />
        ) : (
          <Dashboard progress={progress} onSelectScenario={handleSelectScenario} />
        )}
      </main>
    </div>
  );
}

export default App;
