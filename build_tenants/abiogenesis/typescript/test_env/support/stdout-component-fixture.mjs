// Test-only premise for HOW §10.10 E-C/E-E current-profile stdout windows in
// component fixtures. The actual installed runtime_liveness module stages each
// closed window row and its probes; only its event_store/event_prefix imports
// resolve to the one fixture-owned transaction, recorder and committed prefix
// that the same fixture supplies to ActorProcess. This holds premise and loading
// composition only: no native held-store, rollback, flush or durable-admission
// coverage is claimed.
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';

async function component(path, overrides) {
  const module = new SourceTextModule(await readFile(path, 'utf8'), { identifier: path });
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(path), specifier)).href);
    const values = { ...actual, ...overrides[specifier] };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate(); return module.namespace;
}

/**
 * `rows`/`append` are the fixture recorder, `durable()` its committed prefix and
 * `commit()` advances and returns that prefix. `ownerRoot` is the compiled
 * `code/src` root whose modules the fixture components already load.
 */
export async function composeStdoutComponentPremise({ ownerRoot, store, rows, append, durable, commit }) {
  const owner = name => join(ownerRoot, name);
  const prefixes = await import(pathToFileURL(owner('abg/event_prefix.js')).href);
  const { deepFreeze } = await import(pathToFileURL(owner('shared/immutable.js')).href);
  let transaction = null;
  const held = candidate => { if (candidate !== store) throw new TypeError('fixture premise serves only its own store'); };
  const active = candidate => {
    held(candidate);
    if (transaction === null) throw new TypeError('fixture premise has no active transaction');
  };
  const eventStore = {
    isRuntimeEventTransactionActive: candidate => { held(candidate); return transaction !== null; },
    assertRuntimeEventTransactionActive: active,
    selectHeldEventStoreDurablePrefix: candidate => { held(candidate); return transaction?.predecessor ?? durable(); },
    selectActiveRuntimeTransactionHistoryAtDurablePrefix: (candidate, predecessor, { durableOnly = false } = {}) => {
      active(candidate);
      if (predecessor !== transaction.predecessor) throw new TypeError('fixture history requires its transaction predecessor');
      return deepFreeze(rows.slice(0, durableOnly ? transaction.start : rows.length));
    },
    admitRuntimeEvent: (candidate, event) => { held(candidate); return append(event); },
    admitNativeRuntimeLivenessEvent: (candidate, event) => { held(candidate); return append(event); },
    admitNonEmptyRuntimeEventTransactionAtDurablePrefix: (candidate, _predecessor, action) => {
      held(candidate);
      if (transaction !== null) throw new TypeError('fixture transactions cannot nest');
      transaction = { predecessor: durable(), start: rows.length };
      try { const value = action(); return { value, successorPrefix: commit() }; } finally { transaction = null; }
    },
  };
  const liveness = await component(owner('abg/runtime_liveness.js'), {
    './event_store.js': eventStore,
    './event_prefix.js': { selectOwnedRuntimeEventPrefix: (history, scope) => prefixes.selectValidatedRuntimeEventPrefix(history, scope) },
  });
  return { eventStore, liveness };
}
