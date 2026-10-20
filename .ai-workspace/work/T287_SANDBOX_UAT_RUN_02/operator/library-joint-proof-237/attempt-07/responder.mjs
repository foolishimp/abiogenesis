#!/usr/bin/env node
import { lstat, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMAND, CANDIDATE, SUPPORT, STAGE, REPAIR, STAGED_REPORT, REPAIRED_REPORT } from './workload.mjs';

function section(prompt, name) {
  const marker = '## ' + name + '\n', start = prompt.indexOf(marker);
  if (start < 0 || prompt.indexOf(marker, start + marker.length) >= 0) throw new TypeError('Missing or repeated fixture prompt section: ' + name);
  const end = prompt.indexOf('\n\n## ', start + marker.length);
  return JSON.parse(prompt.slice(start + marker.length, end < 0 ? undefined : end));
}
function diagnostic(stream) {
  if (stream?.encoding === 'utf8' && typeof stream.text === 'string') return stream.text;
  if (Array.isArray(stream?.excerpts)) return stream.excerpts.map(row => row.text).join('');
  throw new TypeError('Actual literal diagnostic is unavailable');
}
function measurement(observation) {
  const rows = observation?.observed?.commandResults;
  if (observation?.purpose !== 'testing' || !Array.isArray(rows) || rows.length !== 1 || rows[0].commandId !== COMMAND || rows[0].timedOut !== false || rows[0].processSignal !== null) throw new TypeError('Fixture requires the actual single declared C2 measurement');
  return {row:rows[0], text:diagnostic(rows[0].stdout)};
}

// Mechanical fixture decisions over the actual owner-rendered task, not runtime
// event authorship. The native canonical binder still checks every reference.
export function fixtureJudgment(prompt, schema, mode) {
  if (!['basis', 'audit'].includes(mode)) throw new TypeError('Explicit fixture mode required');
  const task = section(prompt, 'task');
  if (task.taskRef !== 'task://abi5-tests/library-joint-proof-237/original' ||
      JSON.stringify(task.unresolvedSupportRefs) !== JSON.stringify([SUPPORT]) || !Array.isArray(task.observations)) throw new TypeError('Wrong or completed fixture task');
  const last = task.observations.at(-1);
  let purpose = null, contribution = null, subject = null, reason;
  if (!last) {purpose='construction'; contribution=STAGE; reason='Stage the explicitly declared controlled defect.';}
  else if (last.purpose === 'construction' && last.observed?.report?.summary === STAGED_REPORT) {
    if (mode === 'basis') reason='The finite Construction specimen is complete; C2 and independent assessment remain unresolved.';
    else {purpose='testing'; contribution='Execute the unchanged declared checker through C2; retain its actual nonzero result and literal diagnostic.'; reason='The candidate exists; measure the actual Construction output.'; subject=last.resultRef;}
  } else if (last.purpose === 'construction' && last.observed?.report?.summary === REPAIRED_REPORT) {
    purpose='testing'; contribution='Remeasure the repaired candidate using exactly the same checker, command and predicates; preserve the earlier failure.';
    reason='The native repair is reported; only actual C2 remeasurement establishes its command behavior.'; subject=last.resultRef;
  } else if (last.purpose === 'testing') {
    const measured = measurement(last);
    if (measured.row.exitStatus === 1 && measured.text.startsWith('FIXTURE_VALUE_BAD expected=fixed actual=')) {
      purpose='construction'; contribution=REPAIR;
      reason='Actual C2 exit 1 and FIXTURE_VALUE_BAD identify the intentionally injected candidate-value defect. Restore only the candidate before retrying the same checker.';
    } else if (measured.row.exitStatus === 0 && measured.text === 'FIXTURE_VALUE_FIXED\n') {
      reason='The actual C2 remeasurement passed; independent semantic assessment remains unresolved. Reuse the completed work and explicitly gap.';
    } else throw new TypeError('Unexpected actual C2 failure; fixture cannot select a repair or retry');
  } else throw new TypeError('Unexpected actual fixture observation; no retry selected');
  const graph = purpose === null ? null : schema.properties.nextGraphFunctionRef.enum.find(ref => typeof ref === 'string' && ref.endsWith('/' + purpose + '@5'));
  if (purpose !== null && !graph) throw new TypeError('Selected contribution is ineligible in the actual response carrier');
  if (subject !== null && (!task.subjectEvidenceDomains.testing.includes(subject) || !schema.properties.subjectEvidenceRef.enum.includes(subject))) throw new TypeError('Actual Construction Result is outside the Testing source domain');
  const evidence = last ? [last.resultRef] : [];
  if (!evidence.every(ref => schema.properties.nextEvidenceRefs.items.enum.includes(ref))) throw new TypeError('Actual observation is outside the response evidence domain');
  return {interpretation:'Controlled mechanical fixture; runtime facts remain installed-owner results, and the original support obligation remains unresolved.',
    contributions:graph === null ? [] : [{graphFunctionRef:graph, contribution, reason, supportRefs:[SUPPORT], evidenceRefs:evidence, dependsOn:[]}],
    gaps:[{supportRefs:[SUPPORT], reason:'Independent semantic assessment and qualification are outside this component specimen.', evidenceRefs:evidence}],
    nextGraphFunctionRef:graph, nextReason:reason, nextEvidenceRefs:evidence, subjectEvidenceRef:subject,
    revisionReason:last ? 'Use the actual latest admitted observation while retaining prior work and failures.' : 'Initial controlled contribution.', revisionEvidenceRefs:evidence};
}

async function nativeWork(prompt, expectedRoot) {
  const line = name => {
    const matches = prompt.split('\n').filter(value => value.startsWith(name + ': '));
    if (matches.length !== 1) throw new TypeError('Missing or repeated native fixture field: ' + name);
    return matches[0].slice(name.length + 2);
  };
  const root = await realpath(line('Worksite root'));
  if (typeof expectedRoot !== 'string' || root !== await realpath(expectedRoot) || root !== await realpath(process.cwd())) throw new TypeError('Native effect is not in the exact selected scratch worksite');
  if (JSON.stringify(JSON.parse(line('Permitted write scope'))) !== JSON.stringify([CANDIDATE])) throw new TypeError('Native fixture write scope differs');
  const required = ['fixture/source.md', 'fixture/checker.mjs', 'fixture/rubric.md'];
  const first = JSON.parse(line('Read first'));
  if (!required.every(path => first.includes(path))) throw new TypeError('Mandatory fixture source reads missing');
  for (const path of required) await readFile(join(root, path), 'utf8');
  const candidate = join(root, CANDIDATE);
  if (await realpath(dirname(candidate)) !== join(root, 'fixture')) throw new TypeError('Fixture candidate parent is not the literal selected directory');
  const outcome = line('Outcome');
  if (outcome === STAGE) {
    await writeFile(candidate, 'broken\n', {flag:'wx'});
    return {summary:STAGED_REPORT, gaps:['The controlled bad value still requires actual C2 diagnosis, native repair and remeasurement; independent assessment is unresolved.']};
  }
  if (outcome !== REPAIR) throw new TypeError('Native fixture received an unselected outcome');
  const node = await lstat(candidate);
  if (!node.isFile() || node.isSymbolicLink() || node.nlink !== 1 || await readFile(candidate, 'utf8') !== 'broken\n') throw new TypeError('The selected injected defect is not the actual candidate');
  const observedLine = line('Actual admitted observations');
  const observations = JSON.parse(observedLine);
  const red = measurement(observations.at(-1));
  if (red.row.exitStatus !== 1 || !red.text.startsWith('FIXTURE_VALUE_BAD expected=fixed actual=')) throw new TypeError('Native repair lacks the actual known diagnostic');
  await writeFile(candidate, 'fixed\n');
  return {summary:REPAIRED_REPORT, gaps:['The same C2 command must remeasure this repair; independent semantic assessment remains unresolved.']};
}

async function main() {
  let prompt='';
  for await (const chunk of process.stdin) prompt += chunk;
  const indexes = process.argv.flatMap((arg,index) => arg === '--json-schema' ? [index] : []);
  if (indexes.length !== 1) throw new TypeError('Exact structured response schema argument required');
  const schema = JSON.parse(process.argv[indexes[0] + 1]);
  const result = schema.properties?.interpretation
    ? fixtureJudgment(prompt, schema, process.env.ABI5_JOINT_PROOF_MODE)
    : schema.properties?.summary && schema.properties?.gaps
      ? await nativeWork(prompt, process.env.ABI5_JOINT_PROOF_ROOT)
      : (() => {throw new TypeError('Unexpected native response schema; assessment is not selected');})();
  // Real worker-transport parser/observer admits this stream. No model or
  // framework admission is simulated by the responder.
  process.stdout.write(JSON.stringify({type:'system',subtype:'init'}) + '\n');
  process.stdout.write(JSON.stringify({type:'result',subtype:'success',is_error:false,
    result:JSON.stringify(result),structured_output:result}) + '\n');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {process.stderr.write(String(error.stack ?? error) + '\n'); process.exitCode=1;});
}
