// Component-only measurement over retained CLI input. No ABG owner is invoked.
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
const D = import.meta.dirname;
const P = '/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-11';
const C = join(P, 'products/core52/node_modules/@abiogenesis/typescript-tenant/build/code/src');
const sha = x => 'sha256:' + createHash('sha256').update(x).digest('hex');
const inputBytes = await readFile(join(P, 'start.jsonl'));
assert.equal(sha(inputBytes), 'sha256:d3fe41dc4e258bc45ac6bab338f0c4dd2572919b587dfaf39450b36654a7d363');
const input = JSON.parse(inputBytes), call = input.invocation;
const {canonicalJson} = await import(pathToFileURL(join(C, 'shared/canonical_json.js')));
const source = await readFile(join(C, 'shared/canonical_json.js'), 'utf8');
const {sha256Canonical} = await import(pathToFileURL(join(C, 'shared/digests.js')));
const digestSource = await readFile(join(C, 'shared/digests.js'), 'utf8');
const values = {
  'DefinitionCall': call,
  'invocation': call.invocation,
  'invocation.request': call.invocation.request,
  'invocation.invocationAuthority': call.invocation.invocationAuthority,
  'invocation.request.input.value': call.invocation.request.input.value,
  'resources': call.resources,
  'resources.catalog': call.resources.catalog,
  'resources.catalog.readinessBasis': call.resources.catalog.readinessBasis,
  'resources.historicalSource': call.resources.historicalSource,
  'resources.historicalSource.declarationProof': call.resources.historicalSource.declarationProof,
  'resources.historicalSource.declarationProof.catalog': call.resources.historicalSource.declarationProof.catalog,
};
const sizes = Object.fromEntries(Object.entries(values).map(([k,v]) => [k, Buffer.byteLength(JSON.stringify(v))]));
const value = call.resources.catalog.readinessBasis;
const size = sizes['resources.catalog.readinessBasis'];
const expected = call.resources.catalog.readinessBasisDigest;
assert.equal(sha256Canonical(value), expected);
const memory = () => process.memoryUsage();
global.gc();
const measurements = {baseline: memory()};
// Exact installed encoder with hooks only at its one final join.
const hooked = source.replaceAll('export ', '').replace('return parts.join("");',
  'hooks.beforeJoin(parts); const output = parts.join(""); hooks.afterJoin(output); return output;');
const encode = new Function('hooks', hooked + '\nreturn canonicalJson;')({
  beforeJoin(parts) {
    global.gc(); measurements.beforeJoin = memory();
    measurements.parts = {count: parts.length, totalCodeUnits: 0, totalUtf8Bytes: 0, maximumFragmentBytes: 0};
    for (const part of parts) {
      const bytes = Buffer.byteLength(part);
      measurements.parts.totalCodeUnits += part.length;
      measurements.parts.totalUtf8Bytes += bytes;
      measurements.parts.maximumFragmentBytes = Math.max(measurements.parts.maximumFragmentBytes, bytes);
    }
  },
  afterJoin(output) {
    global.gc(); measurements.afterJoin = memory();
    measurements.joinedCodeUnits = output.length;
  },
});
let flat = encode(value);
assert.equal(Buffer.byteLength(flat), size);
assert.equal(sha(flat), expected);
measurements.afterHash = memory();
flat = null; global.gc(); measurements.releasedFlat = memory();
// A diagnostic sink for the same private emitter, not a production API or repair.
// It tests whether this exact digest can consume tokens without the global join.
const append = new Function(source.replaceAll('export ', '') + '\nreturn appendCanonicalJson;')();
const hash = createHash('sha256'); let fragments = [], units = 0, bytesFed = 0, chunks = 0, maxChunkBytes = 0;
const flush = () => {
  if (fragments.length === 0) return;
  const text = fragments.join(''), count = Buffer.byteLength(text);
  hash.update(text); bytesFed += count; chunks++; maxChunkBytes = Math.max(maxChunkBytes, count);
  fragments = []; units = 0;
};
const started = performance.now();
append(value, {push(...parts) {
  for (const part of parts) {
    if (units > 0 && units + part.length > 65536) flush();
    fragments.push(part); units += part.length;
    if (units >= 65536) flush();
  }
}});
flush();
const streamedDigest = 'sha256:' + hash.digest('hex');
assert.equal(streamedDigest, expected); assert.equal(bytesFed, size);
const streamedMs = performance.now() - started;
global.gc(); measurements.afterTokenHash = memory();
const result = {
  scope: 'Finite component evidence only; exact installed canonical emission reused through an evidence-only sink. No history or ABG owner, no installed invocation.',
  input: {path: join(P,'start.jsonl'), bytes: inputBytes.length, digest: sha(inputBytes)},
  sources: {canonical: sha(source), digests: sha(digestSource)}, sizes,
  duplicateInputEqual: canonicalJson(call.invocation.invocationAuthority.slots.input_contract.value) === canonicalJson(call.invocation.request.input.value),
  subject: 'resources.catalog.readinessBasis', expectedDigest: expected,
  exactCurrentAndTokenDigestEqual: true, measurements,
  tokenSink: {bytesFed, chunks, maxChunkBytes, elapsedMs: streamedMs, finalWholeValueJoin: false},
  limits: 'Forced GC perturbs lifetime and exposes selected live construction, not a native-process peak. Sink prototype proves this finite exact digest and bounded aggregation only; no full-domain or OOM sufficiency claim. Atomic JSON.stringify of each scalar remains unchanged.'
};
await writeFile(join(D,'finite-values.json'), JSON.stringify(result,null,2)+'\n', {flag:'wx'});
console.log(JSON.stringify(result));
