import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  commonCommands,
  knownCommands,
  normalizeCommand,
  resolveCommand,
  listCommands,
  commandSatisfies
} from './commands.js';

describe('normalizeCommand', () => {
  test('trims, collapses whitespace, lowercases', () => {
    assert.equal(normalizeCommand('  PING   Portal.Local  '), 'ping portal.local');
  });
});

describe('resolveCommand', () => {
  const cmds = {
    ipconfig: 'basic',
    'ipconfig /all': 'full',
    'ping *': 'pinging {args}',
    'ping 10.0.0.1': 'gateway',
    'echo *': '{args}'
  };

  test('exact match', () => {
    assert.equal(resolveCommand('ipconfig /all', cmds), 'full');
  });

  test('is case- and whitespace-insensitive', () => {
    assert.equal(resolveCommand('  IPCONFIG   /ALL ', cmds), 'full');
  });

  test('bare key matches when nothing more specific does', () => {
    assert.equal(resolveCommand('ipconfig /release', cmds), 'basic');
  });

  test('wildcard substitutes {args} preserving original case', () => {
    assert.equal(resolveCommand('ping Portal.Local', cmds), 'pinging Portal.Local');
  });

  test('specific exact key beats wildcard', () => {
    assert.equal(resolveCommand('ping 10.0.0.1', cmds), 'gateway');
  });

  test('exact key with extra flags still resolves', () => {
    assert.equal(resolveCommand('ping 10.0.0.1 -t', cmds), 'gateway');
  });

  test('wildcard with multiple args', () => {
    assert.equal(resolveCommand('echo hello   world', cmds), 'hello world');
  });

  test('wildcard alone does not match bare base without a bare key', () => {
    assert.equal(resolveCommand('ping', cmds), null);
  });

  test('unknown or empty input returns null', () => {
    assert.equal(resolveCommand('foobar', cmds), null);
    assert.equal(resolveCommand('   ', cmds), null);
  });

  test('does not match inherited object properties', () => {
    assert.equal(resolveCommand('constructor', {}), null);
    assert.equal(resolveCommand('toString', {}), null);
  });

  test('works with commonCommands', () => {
    assert.equal(resolveCommand('hostname', commonCommands), 'ADMIN-PC');
    assert.equal(resolveCommand('echo hi there', commonCommands), 'hi there');
  });
});

describe('listCommands', () => {
  test('returns unique, sorted base names', () => {
    const out = listCommands({ 'ping *': '', ping: '', 'ipconfig /all': '', arp: '' });
    assert.deepEqual(out, ['arp', 'ipconfig', 'ping']);
  });

  test('empty map yields empty list', () => {
    assert.deepEqual(listCommands({}), []);
  });
});

describe('commandSatisfies', () => {
  test('exact match', () => {
    assert.ok(commandSatisfies('ipconfig /all', 'ipconfig /all'));
  });

  test('normalizes case and whitespace', () => {
    assert.ok(commandSatisfies('  IPCONFIG  /ALL', 'ipconfig /all'));
  });

  test('typed command with extra args satisfies expected', () => {
    assert.ok(commandSatisfies('ping 8.8.8.8 -t', 'ping 8.8.8.8'));
  });

  test('prefix without word boundary does not satisfy', () => {
    assert.ok(!commandSatisfies('ipconfig /allx', 'ipconfig /all'));
    assert.ok(!commandSatisfies('pingg 8.8.8.8', 'ping'));
  });

  test('less specific typed command does not satisfy', () => {
    assert.ok(!commandSatisfies('ipconfig', 'ipconfig /all'));
  });
});

describe('knownCommands', () => {
  test('contains core Windows tools', () => {
    for (const c of ['ping', 'ipconfig', 'nslookup', 'tracert']) {
      assert.ok(knownCommands.has(c));
    }
  });
});
