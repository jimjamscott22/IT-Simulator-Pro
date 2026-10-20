// Pure helpers for the simulated terminal. Kept free of React/JSX so they can
// be unit-tested with Node's built-in test runner.

// Commands available in every scenario. Scenario-specific commands override these.
export const commonCommands = {
  ping: 'Usage: ping [-t] [-a] [-n count] [-l size] [-w timeout] target_name\n\nExample: ping 8.8.8.8',
  tracert: 'Usage: tracert [-d] [-h maximum_hops] [-w timeout] target_name',
  nslookup: 'Usage: nslookup [name] [server]',
  hostname: 'ADMIN-PC',
  whoami: 'corp\\helpdesk-admin',
  ver: 'Microsoft Windows [Version 10.0.22631.4317]',
  'echo *': '{args}'
};

// Real Windows commands that are recognized but may not be simulated in every scenario.
export const knownCommands = new Set([
  'arp', 'dir', 'getmac', 'ipconfig', 'net', 'netsh', 'netstat', 'nslookup',
  'pathping', 'ping', 'route', 'systeminfo', 'tasklist', 'tracert', 'type', 'w32tm'
]);

export const normalizeCommand = (raw) => raw.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Resolve a typed command against a map of simulated outputs.
 *
 * Matching is longest-prefix by whole words:
 *   - An exact key ("ping portal.local") matches that command and any extra flags.
 *   - A wildcard key ("ping *") matches the base command with any arguments;
 *     "{args}" in its output is replaced with the arguments the user typed.
 *   - A bare key ("ping") matches when nothing more specific does.
 *
 * Returns the output string, or null if nothing matched.
 */
export function resolveCommand(rawCmd, commands) {
  const original = rawCmd.trim().split(/\s+/);
  const parts = normalizeCommand(rawCmd).split(' ');
  if (!parts[0]) return null;

  for (let i = parts.length; i > 0; i--) {
    const key = parts.slice(0, i).join(' ');
    const rest = original.slice(i).join(' ');
    const has = (k) => Object.prototype.hasOwnProperty.call(commands, k);

    if (has(key) && (i === parts.length || !has(`${key} *`))) {
      return commands[key].replaceAll('{args}', rest);
    }
    if (i < parts.length && has(`${key} *`)) {
      return commands[`${key} *`].replaceAll('{args}', rest);
    }
  }
  return null;
}

/** List the base command names available for a merged command map. */
export function listCommands(commands) {
  const names = Object.keys(commands).map((k) => k.split(' ')[0]);
  return [...new Set(names)].sort();
}

/** Does a typed command satisfy an expected diagnostic command? */
export function commandSatisfies(typed, expected) {
  const t = normalizeCommand(typed);
  const e = normalizeCommand(expected);
  return t === e || t.startsWith(`${e} `);
}
