import { scenarios } from '../data/scenarios';

export default function Dashboard({ onSelectScenario }) {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Select a Scenario</h1>
      <p className="dashboard-subtitle">Practice your IT skills in a simulated environment</p>
      
      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-card glass-panel" onClick={() => onSelectScenario(scenario)}>
            <div className="scenario-card-header">
              <span className="category-badge">{scenario.category}</span>
              <span className={`difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
                {scenario.difficulty}
              </span>
            </div>
            <h2>{scenario.title}</h2>
            <p>{scenario.description}</p>
            <button className="primary start-btn">Start Scenario</button>
          </div>
        ))}
      </div>
    </div>
  );
}
