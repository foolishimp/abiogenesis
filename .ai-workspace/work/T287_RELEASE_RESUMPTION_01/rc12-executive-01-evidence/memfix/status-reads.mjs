// 300 in-process Public run_status reads over one closed store holding an
// operator-stopped Run (the t287-readable-stops operator-stop fixture).
import assert from 'node:assert/strict';
const T = process.argv[2];
const { witnessMechanics, nativeWitness } = await import(T + '/test_env/support/witness-reprice-mechanics.mjs');
const h = await witnessMechanics({ operatorRun: true }), status = h.publicStatus(h.handoff.prefix), contract = nativeWitness.WITNESS_CONTENT_CONTRACTS['run-stopped'];
const request = { subjectKind: 'run', subject: status.source, act: 'run-stopped',
  content: { kind: 'typed_reason', contentContract: { ref: contract.ref, digest: contract.digest }, value: { reasonKind: 'operator_stop', reasonDetail: 'memory probe' } },
  context: { kind: 'run', run: status.source, basis: status.projection.executionBasis }, evidence: [h.operatorRun], provenance: [h.historical] };
const result = await h.run(JSON.parse(JSON.stringify(await h.call({ member: 'run-stopped', request }))));
assert.equal(result.exitCode, 0, JSON.stringify(result));
const prefix = result.resources.eventResource.closeHandoff.prefix;
const sample = () => { globalThis.gc(); globalThis.gc(); return +(process.memoryUsage().heapUsed / 1048576).toFixed(2); };
const rows = [{ reads: 0, heapUsedMB: sample() }];
let t0 = performance.now();
for (let i = 1; i <= 300; i += 1) {
  const read = h.publicStatus(prefix);
  if (i === 1) { assert.equal(read.projection.stop.eventKind, 'run_stopped'); assert.equal(read.projection.stop.disposition, 'operator_stop'); }
  if ([1, 100, 200, 300].includes(i)) rows.push({ reads: i, heapUsedMB: sample(), msSinceLast: Math.round(performance.now() - t0) }), t0 = performance.now();
}
console.log(JSON.stringify({ events: prefix.eventCount ?? null, rows }));
