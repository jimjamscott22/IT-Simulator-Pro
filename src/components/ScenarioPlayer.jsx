import { useState } from 'react';
import Terminal from './Terminal';

export default function ScenarioPlayer({ scenario, onBack }) {
  const [completed, setCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    setShowFeedback(true);
  };

  return (
    <div className="scenario-player">
      <div className="scenario-sidebar glass-panel">
        <button className="back-btn" onClick={onBack}>&larr; Back to Dashboard</button>
        <h2>{scenario.title}</h2>
        <div className="scenario-details">
          <p><strong>Initial State:</strong> {scenario.initialState}</p>
          <p><strong>Task:</strong> {scenario.description}</p>
        </div>
        
        {!completed ? (
          <button className="primary complete-btn" onClick={handleComplete}>
            Mark as Resolved
          </button>
        ) : (
          <div className="feedback-section glass-panel">
            <h3>Evaluation</h3>
            <p><strong>Solution:</strong> {scenario.solution}</p>
            <p><strong>Interview Tip:</strong> {scenario.feedback}</p>
          </div>
        )}
      </div>

      <div className="scenario-content">
        {scenario.type === 'terminal' && (
          <Terminal expectedCommands={scenario.expectedCommands} />
        )}
      </div>
    </div>
  );
}
