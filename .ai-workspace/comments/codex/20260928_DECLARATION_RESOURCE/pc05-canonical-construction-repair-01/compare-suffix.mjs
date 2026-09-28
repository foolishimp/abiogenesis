import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {canonicalJson as before} from './preimage-3.mjs';

const evidence = import.meta.dirname;
const root = resolve(evidence, '../../../../..');
const build = join(root, 'build_tenants/abiogenesis/typescript/build/code/src');
const {canonicalJson: after} = await import(pathToFileURL(join(build, 'shared/canonical_json.js')));
const {decodeEventBody, inlineEventBody} = await import(pathToFileURL(join(build, 'abg/event_body_encoding.js')));
const suffix = '/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-09/execution/abort-suffix.jsonl';
const sha = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const start = performance.now(), bytes = await readFile(suffix);
assert.equal(bytes.length, 31641323);
assert.equal(sha(bytes), 'sha256:01df16703272453fb69cc55bed211f07e5f59b5a9fc83fdeafa818eb8069d0a6');
assert.equal(bytes.at(-1), 10);
const lines = bytes.toString('utf8').slice(0, -1).split('\n');
const totals = {calls: 0, outputBytes: 0, beforeMs: 0, afterMs: 0};
const byKind = {};
function compare(value, kind) {
  let started = performance.now(); const oldText = before(value); const oldMs = performance.now() - started;
  started = performance.now(); const newText = after(value); const newMs = performance.now() - started;
  assert.equal(newText, oldText, kind);
  const count = byKind[kind] ??= {calls: 0, outputBytes: 0, beforeMs: 0, afterMs: 0};
  for (const c of [count, totals]) {
    c.calls++; c.outputBytes += Buffer.byteLength(oldText); c.beforeMs += oldMs; c.afterMs += newMs;
  }
  return oldText;
}
const inline = new Map(), unresolved = [];
let logicalEvents = 0, bodyReferences = 0, maxPhysicalBytes = 0;
for (const line of lines) {
  maxPhysicalBytes = Math.max(maxPhysicalBytes, Buffer.byteLength(line));
  const physical = JSON.parse(line);
  assert.equal(compare(physical, 'physicalRow'), line);
  if (physical.kind === 'abg_admitted_body_reference_record') {
    bodyReferences++;
    if (!inline.has(physical.bodyReference.sourceEventRef)) {
      unresolved.push({eventRef: physical.event.eventId, sourceEventRef: physical.bodyReference.sourceEventRef});
      continue;
    }
  }
  const {event, physicallyInline} = decodeEventBody(physical, inline);
  compare(event, 'logicalEvent');
  assert.equal(sha(compare(event.payload, 'payload')), event.payloadDigest);
  const {eventId, ...preimage} = event;
  assert.equal('event://abiogenesis/' + sha(compare(preimage, 'eventIdPreimage')).slice(7), eventId);
  logicalEvents++;
  if (physicallyInline) {
    const body = inlineEventBody(event);
    if (body !== null) {
      assert.equal(sha(compare(body.value, 'inlineBody')), body.digest);
      inline.set(event.eventId, body);
    }
  }
}
const result = {
  basis: {suffix, bytes: bytes.length, sha256: sha(bytes), oldModule: 'preimage-3.mjs', newModule: join(build, 'shared/canonical_json.js')},
  physicalRows: lines.length, bodyReferences, logicalEvents, unresolvedBodyReferences: unresolved,
  maxPhysicalBytes, exactBytesEqual: true, exactPayloadAndEventDigestsEqual: true,
  totals, byKind, elapsedMs: performance.now() - start, processMaxRss: process.resourceUsage().maxRSS,
  limits: 'One old/new comparison per value; timings are interleaved, uncalibrated component observations. Peak RSS covers both encoders and the retained corpus. Raw suffix comparisons are not a validated-prefix or whole-history recovery claim. No provider/Run/history acquisition.'
};
await writeFile(join(evidence, 'suffix-comparison.json'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify(result));
