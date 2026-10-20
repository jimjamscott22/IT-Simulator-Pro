import { useMemo, useState } from 'react';
import { scenarios, DIFFICULTIES } from '../data/scenarios';

const categories = ['All', ...new Set(scenarios.map((s) => s.category))];

export default function Dashboard({ progress, onSelectScenario }) {
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scenarios.filter((s) =>
      (category === 'All' || s.category === category) &&
      (difficulty === 'All' || s.difficulty === difficulty) &&
      (!q || `${s.title} ${s.description} ${s.category}`.toLowerCase().includes(q))
    );
  }, [category, difficulty, query]);

  const completedCount = scenarios.filter((s) => progress[s.id]?.completed).length;

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <h1 className="dashboard-title">Select a Scenario</h1>
          <p className="dashboard-subtitle">Practice your IT troubleshooting skills in a simulated environment</p>
        </div>
        <div className="progress-summary" aria-label={`${completedCount} of ${scenarios.length} scenarios completed`}>
          <span className="progress-count">{completedCount}<span>/{scenarios.length}</span></span>
          <span className="progress-caption">completed</span>
        </div>
      </div>

      <div className="filters" role="search">
        <div className="chip-group" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filter-controls">
          <label className="visually-hidden" htmlFor="difficulty-filter">Difficulty</label>
          <select id="difficulty-filter" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="All">All difficulties</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="scenario-search">Search scenarios</label>
          <input
            id="scenario-search"
            type="search"
            placeholder="Search scenarios…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">{filtered.length} scenarios shown</p>

      {filtered.length === 0 ? (
        <p className="empty-state">No scenarios match those filters.</p>
      ) : (
        <ul className="scenario-grid" role="list">
          {filtered.map((scenario) => {
            const p = progress[scenario.id];
            return (
              <li key={scenario.id} className="scenario-card glass-panel">
                <div className="scenario-card-header">
                  <span className="category-badge">{scenario.category}</span>
                  <span className={`difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                <h2>{scenario.title}</h2>
                <p>{scenario.description}</p>
                {p?.completed && (
                  <p className="completed-badge">✓ Completed · best {p.bestScore}%</p>
                )}
                {/* The button's ::after stretches over the card so the whole card is clickable,
                    while keyboard users get a single, properly named tab stop. */}
                <button
                  type="button"
                  className="primary start-btn"
                  onClick={() => onSelectScenario(scenario.id)}
                >
                  {p?.completed ? 'Practice Again' : 'Start Scenario'}
                  <span className="visually-hidden">: {scenario.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
