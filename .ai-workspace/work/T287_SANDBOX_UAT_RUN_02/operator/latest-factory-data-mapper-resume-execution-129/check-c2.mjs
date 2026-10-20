import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {parseScalaTestReport} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/fixtures/sandbox-uat/independent-oracle.mjs';
const phase = path.dirname(new URL(import.meta.url).pathname);
const archive = '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T17-40-42-399Z-9331fc68-b309-49fb-a8f1-9a544450add9';
const store = path.join(archive, 'resources/events/runtime.events.jsonl');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function event(offset, byteCount) {
  const fd = fs.openSync(store, 'r');
  try { const bytes = Buffer.alloc(byteCount); if (fs.readSync(fd, bytes, 0, byteCount, offset) !== byteCount) throw Error('Incomplete selected event');
    return {event: JSON.parse(bytes), offset, byteCount, sha256: sha(bytes)};
  } finally {fs.closeSync(fd);}
}
const [c2Offset,c2Length,authorOffset,authorLength,parentOffset,parentLength,priorOffset,priorLength] = process.argv.slice(2).map(Number);
const selected = event(c2Offset,c2Length), c2 = selected.event.payload.value;
const baseline = event(11269437,1791918).event.payload.value;
const authored = event(authorOffset,authorLength).event.payload.value;
const parent = event(parentOffset,parentLength).event.payload.value;
const prior = event(priorOffset,priorLength).event.payload.value;
const sourceRows = new Map(authored.after.entries.map(row => [row.relativePath,row]));
const sourceEquality = c2.snapshotMembers.every(row => {
  const expected = sourceRows.get(row.relativePath);
  return expected?.state === 'file' && row.digest === expected.digest && row.byteLength === expected.byteLength;
});
const root = c2.provenance.helperPlan.sandboxRoot;
const reports = c2.commandResults.flatMap(command => command.reports).map(report => {
  const file = path.join(root,report.relativePath), stat = fs.lstatSync(file), bytes = fs.readFileSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || fs.realpathSync(file) !== file || !file.startsWith(root+'/')) throw Error('Nonliteral report path');
  if (report.state !== 'file' || bytes.length !== report.byteLength || 'sha256:'+sha(bytes) !== report.digest) throw Error('Report bytes differ from admitted observation');
  const parsed = parseScalaTestReport(bytes);
  return {path:report.relativePath, identity:report.expectedReportIdentity, sha256:sha(bytes), byteCount:bytes.length,
    tests:parsed.tests, failures:parsed.failures, errors:parsed.errors, skipped:parsed.skipped, passes:parsed.passes, failedNames:parsed.failedNames};
});
const inventory = c2.predicateObservations.find(row => row.predicateKind === 'test_report_set_exact');
const declaration = c2.task.outcomePredicates.find(row => row.predicateKind === 'test_report_set_exact');
const observedPaths = inventory?.observedValue;
const declaredPaths = declaration?.declaration?.equals;
const inventoryEqual = Array.isArray(observedPaths) && Array.isArray(declaredPaths) && observedPaths.length === new Set(observedPaths).size &&
  observedPaths.length === declaredPaths.length && isDeepStrictEqual([...observedPaths].sort(),[...declaredPaths].sort());
const row = {observedAt:new Date().toISOString(), kind:'operator_c2_correspondence', ordinal:selected.event.admissionOrdinal,
  offset:c2Offset,byteCount:c2Length,sha256:selected.sha256,resultRef:selected.event.payload.resultRef,
  sourceCount:c2.snapshotMembers.length,sourceEquality,commandsEqualBaseline:isDeepStrictEqual(c2.task.commands,baseline.task.commands),
  predicatesEqualBaseline:isDeepStrictEqual(c2.task.outcomePredicates,baseline.task.outcomePredicates),
  parentOriginalConserved:isDeepStrictEqual(parent.original,prior.original),parentObservations:parent.observations.length,parentTerminal:parent.terminal,
  commandStatuses:c2.commandResults.map(c => ({exitStatus:c.exitStatus,timedOut:c.timedOut,signal:c.processSignal,terminationConfirmed:c.terminationConfirmed})),
  totals:reports.reduce((a,r)=>({tests:a.tests+r.tests,failures:a.failures+r.failures,errors:a.errors+r.errors,skipped:a.skipped+r.skipped,passes:a.passes+r.passes}),{tests:0,failures:0,errors:0,skipped:0,passes:0}),
  inventoryEqual,productDeltaCount:c2.productDelta.length,reports};
fs.appendFileSync(path.join(phase,'milestones.jsonl'),JSON.stringify(row)+'\n');
console.log(JSON.stringify(row));
