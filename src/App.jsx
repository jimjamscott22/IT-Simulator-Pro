import { useState } from 'react';
import './index.css';
import Dashboard from './components/Dashboard';
import ScenarioPlayer from './components/ScenarioPlayer';

function App() {
  const [activeScenario, setActiveScenario] = useState(null);

  const handleSelectScenario = (scenario) => {
    setActiveScenario(scenario);
  };

  const handleBackToDashboard = () => {
    setActiveScenario(null);
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="logo">IT Simulator Pro</div>
      </header>
      
      <main className="app-main">
        {activeScenario ? (
          <ScenarioPlayer scenario={activeScenario} onBack={handleBackToDashboard} />
        ) : (
          <Dashboard onSelectScenario={handleSelectScenario} />
        )}
      </main>
    </div>
  );
}

export default App;
