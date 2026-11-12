import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {validateHistoricalEvents} from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';

// Load-only reader of one readonly T-287 current-owner population
// (../fixtures/t287-current-owner/README.md). The original bytes pass unchanged
// through the current compiled owner decoder, which alone restores admitted
// body references. No store, restamp, re-admission, reindex, fallback,
// generator or setup effect exists here: inconsistent data fail and return to
// Root. The result is a component input, not present store authority.
const root = new URL('../fixtures/t287-current-owner/', import.meta.url);
const hex = bytes => createHash('sha256').update(bytes).digest('hex');
const loaded = new Map();

export function loadCurrentOwnerEvidence(population) {
  if (loaded.has(population)) return loaded.get(population);
  assert(['native-assessment'].includes(population), `unknown population ${population}`);
  const directory = new URL(`${population}/`, root);
  const fixture = deepFreeze(JSON.parse(readFileSync(new URL('fixture.json', directory), 'utf8')));
  assert.equal(fixture.kind, 't287_current_owner_evidence_fixture');
  assert.equal(fixture.schemaVersion, '1');
  assert.equal(fixture.population, population);
  assert.equal(fixture.prefix.file, 'events.jsonl.gz');
  const compressed = readFileSync(new URL(fixture.prefix.file, directory));
  assert.equal(compressed.byteLength, fixture.prefix.compressedBytes, `${population} compressed bytes`);
  assert.equal(hex(compressed), fixture.prefix.compressedSha256, `${population} compressed sha256`);
  const bytes = gunzipSync(compressed);
  assert.equal(bytes.byteLength, fixture.prefix.bytes, `${population} prefix bytes`);
  assert.equal(hex(bytes), fixture.prefix.sha256, `${population} prefix sha256`);
  const events = validateHistoricalEvents(bytes, fixture.eventContractDigest);
  assert.equal(events.length, fixture.eventCount, `${population} decoded event count`);
  const evidence = Object.freeze({fixture, events, prefix: selectValidatedRuntimeEventPrefix(events)});
  loaded.set(population, evidence);
  return evidence;
}
