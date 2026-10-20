import { useState } from 'react';
import Terminal from './Terminal';
import { commandSatisfies } from '../lib/commands';

export default function ScenarioPlayer({ scenario, progress, onComplete, onBack }) {
  const [attempt, setAttempt] = useState(0);
  const [ran, setRan] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [completed, setCompleted] = useState(false);

  const expected = scenario.expectedCommands ?? [];
  const isDone = (exp) => ran.some((cmd) => commandSatisfies(cmd, exp));
  const doneCount = expected.filter(isDone).length;
  const score = expected.length ? Math.round((doneCount / expected.length) * 100) : 100;

  const handleCommand = (cmd) => setRan((r) => [...r, cmd]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setCompleted(true);
    onComplete?.(scenario.id, score);
  };

  const handleRetry = () => {
    setRan([]);
    setDiagnosis('');
    setCompleted(false);
    setAttempt((a) => a + 1);
  };

  return (
    <div className="scenario-player">
      <aside className="scenario-sidebar glass-panel" aria-labelledby="scenario-title">
        <button type="button" className="back-btn" onClick={onBack}>&larr; Back to Dashboard</button>

        <div className="scenario-card-header">
          <span className="category-badge">{scenario.category}</span>
          <span className={`difficulty-badge ${scenario.difficulty.toLowerCase()}`}>{scenario.difficulty}</span>
        </div>
        <h1 id="scenario-title" className="scenario-title">{scenario.title}</h1>
        {progress?.completed && !completed && (
          <p className="previous-best">Previously completed · best score {progress.bestScore}%</p>
        )}

        <div className="scenario-details">
          <p><strong>Initial State:</strong> {scenario.initialState}</p>
          <p><strong>Task:</strong> {scenario.description}</p>
        </div>

        <div className="checklist-progress" aria-live="polite">
          <div className="checklist-label">
            <span>Key diagnostics run</span>
            <span>{doneCount} / {expected.length}</span>
          </div>
          <progress max={expected.length || 1} value={doneCount} aria-label="Key diagnostic commands run" />
        </div>

        {!completed ? (
          <form className="diagnosis-form" onSubmit={handleSubmit}>
            <label htmlFor="diagnosis">Your diagnosis</label>
            <p id="diagnosis-hint" className="hint">Explain the root cause and fix, as you would to an interviewer.</p>
            <textarea
              id="diagnosis"
              aria-describedby="diagnosis-hint"
              rows={4}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <button type="submit" className="primary complete-btn">
              Submit &amp; Reveal Solution
            </button>
          </form>
        ) : (
          <section className="feedback-section" aria-labelledby="evaluation-title">
            <h2 id="evaluation-title">Evaluation · {score}%</h2>

            <h3>Diagnostic checklist</h3>
            <ul className="checklist">
              {expected.map((exp) => (
                <li key={exp} className={isDone(exp) ? 'done' : 'missed'}>
                  <span aria-hidden="true">{isDone(exp) ? '✓' : '✗'}</span>
                  <code>{exp}</code>
                  <span className="visually-hidden">{isDone(exp) ? '(run)' : '(not run)'}</span>
                </li>
              ))}
            </ul>

            {diagnosis.trim() && (
              <>
                <h3>Your diagnosis</h3>
                <p className="your-diagnosis">{diagnosis}</p>
              </>
            )}

            <h3>Solution</h3>
            <p>{scenario.solution}</p>
            <h3>Interview Tip</h3>
            <p>{scenario.feedback}</p>

            <button type="button" className="secondary" onClick={handleRetry}>Try Again</button>
          </section>
        )}
      </aside>

      <div className="scenario-content">
        {scenario.type === 'terminal' && (
          <Terminal key={`${scenario.id}-${attempt}`} commands={scenario.commands} onCommand={handleCommand} />
        )}
      </div>
    </div>
  );
}
