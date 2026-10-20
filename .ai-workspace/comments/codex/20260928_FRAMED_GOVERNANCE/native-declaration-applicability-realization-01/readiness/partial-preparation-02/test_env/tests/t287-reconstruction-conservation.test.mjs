import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { readRuntimeEventsAtDurablePrefix } from '../../build/code/src/abg/event_store.js';
import { selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent } from '../../build/code/src/abg/event_prefix.js';
import { replayValidatedRuntimeEventPrefix, projectRuntimePrefixesAtDurablePrefix } from '../../build/code/src/abg/replay.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { sha256Bytes, sha256Canonical } from '../../build/code/src/shared/digests.js';
import { projectExactPrefixArtifactTruth, validateExactPrefixArtifactTruthProjection } from '../../build/code/src/abg/artifact_truth.js';

const retainedBasis = { skip: !process.env.ABI5_PREFIX_REUSE_OBSERVATIONS };

test('owner derivation is exact-value bound, disposable, and cannot be copied or forged', retainedBasis, async () => {
  assert.ok(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS, 'explicit retained read-only basis');
  const observation = JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS));
  const rows = readRuntimeEventsAtDurablePrefix(observation.observedPrefix, { requireCurrent: true });
  const full = selectValidatedRuntimeEventPrefix(rows);
  const authority = validatedRuntimeEventPrefixThroughEvent(full, rows[2851].eventId);
  const run = selectValidatedRuntimeEventPrefix(authority.events, { runId: observation.runId });
  const state = replayValidatedRuntimeEventPrefix(run, authority);
  assert.equal(replayValidatedRuntimeEventPrefix(run, authority, state), state);
  const copiedHistory = deepFreeze(structuredClone(authority.events));
  assert.equal(replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(copiedHistory, { runId: observation.runId }),
    selectValidatedRuntimeEventPrefix(copiedHistory), state), state, 'complete immutable value equality authenticates a rehydrated prefix');

  const clone = deepFreeze(structuredClone(state));
  assert.notEqual(replayValidatedRuntimeEventPrefix(run, authority, clone), clone, 'deserialized state takes the owner cold path');
  const symbols = Object.getOwnPropertySymbols(state);
  assert.equal(symbols.length, 1);
  const stolen = { ...state, replayDigest: 'sha256:' + '0'.repeat(64) };
  Object.defineProperty(stolen, symbols[0], Object.getOwnPropertyDescriptor(state, symbols[0]));
  deepFreeze(stolen);
  assert.deepEqual(replayValidatedRuntimeEventPrefix(run, authority, stolen), state, 'a copied derivation receipt cannot authenticate another result');
  const prototypeForgery = { ...state, replayDigest: stolen.replayDigest };
  Object.defineProperty(prototypeForgery, symbols[0], { value: Object.freeze(Object.create(Object.getPrototypeOf(state[symbols[0]]))) });
  deepFreeze(prototypeForgery);
  assert.deepEqual(replayValidatedRuntimeEventPrefix(run, authority, prototypeForgery), state, 'prototype imitation has no owner private brand');

  const laterAuthority = validatedRuntimeEventPrefixThroughEvent(full, rows[2898].eventId);
  const laterRun = selectValidatedRuntimeEventPrefix(laterAuthority.events, { runId: observation.runId });
  const later = replayValidatedRuntimeEventPrefix(laterRun, laterAuthority, state);
  assert.notEqual(later, state, 'changed admitted truth invalidates the earlier derivation');
  assert.deepEqual(later, replayValidatedRuntimeEventPrefix(laterRun, laterAuthority));
  assert.notEqual(replayValidatedRuntimeEventPrefix(run, laterAuthority, state), state, 'authority scope cannot borrow an earlier derivation');
  const selected = projectRuntimePrefixesAtDurablePrefix(observation.observedPrefix, observation.runId);
  assert.deepEqual(Object.keys(selected).sort(), ['authorityPrefix', 'runtimePrefix']);
  assert.deepEqual(selected.authorityPrefix.events, rows);
});

test('artifact derivation removes repeated history reconstruction while every physical byte check remains operative', retainedBasis, async () => {
  const observation = JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS));
  const original = await readFile(new URL(observation.observedPrefix.eventLogRef));
  const bytes = Buffer.from(original.toString().split('\n').slice(0,4).join('\n') + '\n');
  const scratch = await mkdtemp(join(tmpdir(), 'p0-artifact-derivation-'));
  try {
    const path = join(scratch, 'events.jsonl'); await writeFile(path, bytes);
    const node = await stat(path), last = JSON.parse(bytes.toString().trimEnd().split('\n').at(-1));
    const body = { kind:'durable_prefix_coordinate', schemaVersion:'5.0.0', eventLogRef:pathToFileURL(path).href,
      prefixLength:bytes.length, prefixDigest:sha256Bytes(bytes), storeIdentity:{device:node.dev,inode:node.ino,eventContractDigest:last.eventContractDigest} };
    const coordinate = { ...body, coordinateDigest:sha256Canonical(body) };
    const projected = projectExactPrefixArtifactTruth(coordinate);
    assert.equal(projected.kind, 'exact_prefix_artifact_truth_projection');
    assert.equal(validateExactPrefixArtifactTruthProjection(projected), true);
    assert.equal(validateExactPrefixArtifactTruthProjection(structuredClone(projected)), true, 'cold fallback remains available in a fresh process');
    const symbol = Object.getOwnPropertySymbols(projected)[0]; assert.ok(symbol);
    const stolen = { ...projected, rows:[] }; Object.defineProperty(stolen,symbol,Object.getOwnPropertyDescriptor(projected,symbol)); deepFreeze(stolen);
    assert.equal(validateExactPrefixArtifactTruthProjection(stolen), false, 'copied proof cannot bless altered rows');
    const changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
    assert.equal(validateExactPrefixArtifactTruthProjection(projected), false, 'nominal derivation does not excuse same-length physical drift');
    await writeFile(path,bytes);
    assert.equal(validateExactPrefixArtifactTruthProjection(projected), true);
    await writeFile(path,bytes.subarray(0,bytes.length-1));
    assert.equal(validateExactPrefixArtifactTruthProjection(projected), false, 'truncation is still refused');
  } finally { await rm(scratch,{recursive:true,force:true}); }
});
