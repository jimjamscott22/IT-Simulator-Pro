import { useState, useRef, useEffect, useMemo } from 'react';
import { commonCommands, knownCommands, listCommands, normalizeCommand, resolveCommand } from '../lib/commands';

const PROMPT = 'C:\\Users\\Admin>';
const WELCOME = { type: 'system', text: 'Terminal ready. Type "help" for available commands. Use ↑/↓ for history and Tab to complete.' };

export default function Terminal({ commands = {}, onCommand }) {
  const [history, setHistory] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [past, setPast] = useState([]);
  const [pastIndex, setPastIndex] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const merged = useMemo(() => ({ ...commonCommands, ...commands }), [commands]);
  const available = useMemo(() => listCommands(merged), [merged]);

  // Keep the newest output in view without scrolling the rest of the page.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [history]);

  const run = (raw) => {
    const cmd = normalizeCommand(raw);
    const base = cmd.split(' ')[0];
    const echo = { type: 'input', text: `${PROMPT} ${raw.trim()}` };

    if (cmd === 'clear' || cmd === 'cls') {
      setHistory([]);
      return;
    }

    let line;
    if (cmd === 'help') {
      line = { type: 'output', text: `Available commands: ${[...available, 'help', 'cls'].join(', ')}` };
    } else {
      const result = resolveCommand(raw, merged);
      if (result !== null) {
        line = { type: 'output', text: result };
      } else if (knownCommands.has(base)) {
        line = { type: 'system', text: `"${base}" is a real command, but this usage isn't simulated in this scenario. Type "help" to see what is.` };
      } else {
        line = { type: 'error', text: `'${raw.trim().split(/\s+/)[0]}' is not recognized as an internal or external command,\noperable program or batch file.` };
      }
    }

    setHistory((h) => [...h, echo, line]);
    onCommand?.(cmd);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const raw = input;
      setInput('');
      setPastIndex(-1);
      if (!raw.trim()) return;
      setPast((p) => [raw.trim(), ...p.filter((c) => c !== raw.trim())].slice(0, 50));
      run(raw);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!past.length) return;
      const next = Math.min(pastIndex + 1, past.length - 1);
      setPastIndex(next);
      setInput(past[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = pastIndex - 1;
      setPastIndex(Math.max(next, -1));
      setInput(next >= 0 ? past[next] : '');
    } else if (e.key === 'Tab') {
      // Complete the first word only; keep focus in the terminal.
      if (input.includes(' ')) return;
      e.preventDefault();
      const prefix = input.toLowerCase();
      const matches = [...available, 'help', 'cls'].filter((c) => c.startsWith(prefix));
      if (matches.length === 1) {
        setInput(`${matches[0]} `);
      } else if (matches.length > 1 && prefix) {
        setHistory((h) => [...h, { type: 'system', text: matches.join('  ') }]);
      }
    }
  };

  // Focus the input when clicking the terminal, unless the user is selecting text to copy.
  const handleBodyClick = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  return (
    <section className="terminal-container" aria-label="Simulated command prompt">
      <div className="terminal-header" aria-hidden="true">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
        <span className="title">Command Prompt</span>
      </div>
      <div className="terminal-body" ref={bodyRef} onClick={handleBodyClick}>
        <div role="log" aria-live="polite" aria-label="Terminal output">
          {history.map((line, i) => (
            <div key={i} className={`terminal-line ${line.type}`}>
              {line.text}
            </div>
          ))}
        </div>
        <div className="terminal-input-line">
          <span className="prompt" aria-hidden="true">{PROMPT}</span>
          <input
            id="term-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal command"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>
    </section>
  );
}
