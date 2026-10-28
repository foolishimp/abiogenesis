// T-287 Phase D, D5-c item 3: the real execution material of the observed C2 recipe run, measured before that run.
// The prepared C2 task is realized by the installed leaf (realizeWorksiteCommandExecution: the task and launch
// manifests in the prepared sandbox's archive root, and the helper command the C2 prompt hands its Worker); the
// operator runs that helper command directly from a shell, with the setup environment the driver records (no
// provider); the helper's artifact is admitted by the installed owner, the observation constructed by the installed
// constructor (constructWorksiteExecutionObservation) with a synthetic actor observation in place of the Worker's
// transport (the precedent of test_env/tests/t287-qual056-material.test.mjs), and the verification material by the
// installed constructor (constructQualificationVerificationMaterial). It is a measurement, never an admitted C2: no C
// call, Result or event exists for it.
//
// What verification.execution.ref names (abg/qualification_proof.ts:779-846; validator/qualification.ts:130-243): the
// execution selection's Result coordinate, whose material is the canonical JSON of the C2 Result, its judgment and its
// evidence, the Result value being the whole observation (task, command results with their base64 streams, predicate
// observations, worksite and product deltas, snapshot members). The compact verification material is the fold's own
// reduction, never a task material. The stand-in is that material over the measured observation, under the envelope
// (result, judgment, evidence) of an observed C2 Result of the installed candidate (the D3 sandbox run).
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RECIPE_PATH, sha256 } from './build-resources.mjs';

const MEASUREMENT = 'abiogenesis/t287/d5c/helper-measurement';

/** The authority-free occurrence of the measurement (implementation/worksite_command_execution.ts:139-165). */
export function measurementOccurrence(q, id) {
  return { attempt: 1, cCallRef: 'c-call://' + MEASUREMENT + '/' + id, executionAuthority: null, frameId: 'frame://' + MEASUREMENT + '/' + id,
    graphCallId: 'graph-call://' + MEASUREMENT + '/' + id, programLocusRef: q.product.WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
    runId: 'run://' + MEASUREMENT + '/' + id, taskOrdinal: 0 };
}

/** The installed leaf's preparation of the prepared C2 task: its manifests materialized under the archive root, its
 * Worker request (the prompt with the helper command) and the helper plan. The two actor limits are the provider's. */
export async function realizeForMeasurement(q, task, { inactivityTimeoutMs, absoluteTimeoutMs, id }) {
  const implementation = await import(pathToFileURL(join(q.root, 'build/code/src/implementation/worksite_command_execution.js')).href);
  process.env.ABG_TS_FP_TIMEOUT_MS = String(inactivityTimeoutMs); process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = String(absoluteTimeoutMs);
  const prepared = implementation.realizeWorksiteCommandExecution(task, measurementOccurrence(q, id));
  const taskRoot = join(task.workspaceBinding.roots.archiveRoot, 'worksite-command-execution', task.taskDigest.slice(7));
  const attempts = await readdir(taskRoot);
  if (attempts.length !== 1) throw new TypeError('the prepared C2 task has ' + attempts.length + ' attempt roots');
  const launchPath = join(taskRoot, attempts[0], 'launch.json'), launch = JSON.parse(await readFile(launchPath, 'utf8'));
  const helperPlan = q.product.worksiteCommandExecutionHelperPlan(task, launch.attemptRef);
  if (!prepared.workerRequest.prompt.includes(helperPlan.toolCommand)) throw new TypeError('the C2 prompt does not carry the helper command');
  return { prepared, helperPlan, launch, launchPath, prompt: prepared.workerRequest.prompt };
}

/** The helper artifact admitted by the installed owner, and the observation constructed over it. */
export async function constructMeasuredObservation(q, task, helperPlan) {
  const c2 = q.deep.c2, bytes = await readFile(helperPlan.artifactPath), artifact = JSON.parse(bytes.toString('utf8'));
  if (!c2.isWorksiteExecutionHelperArtifact(task, artifact)) throw new TypeError('the helper artifact is not admitted by the installed owner');
  if (!Buffer.from(q.product.canonicalJson(artifact) + '\n', 'utf8').equals(bytes)) throw new TypeError('the helper artifact bytes are not its canonical JSON');
  const raw = { kind: 'worksite_command_execution_worker_result', schemaVersion: '5.0.0', taskRef: task.taskRef, taskDigest: task.taskDigest,
    attemptRef: helperPlan.attemptRef, helperArtifactRef: artifact.artifactRef, helperArtifactDigest: artifact.artifactDigest };
  const workerResult = c2.constructWorksiteCommandExecutionWorkerResult(task, raw, helperPlan);
  const hash = q.product.sha256Canonical;
  const actor = { actorRef: task.workerActorRef, workerBindingRef: task.workerBindingRef, implementationRef: q.product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    inputDigest: hash(task), transportLane: 'worker_executes', disposition: 'success', toolCallCount: 1,
    toolInvocations: [{ kind: 'worker_tool_invocation_evidence', schemaVersion: '5.0.0', ordinal: 0, toolName: 'Bash', toolUseRef: 'tool://' + MEASUREMENT,
      inputDigest: helperPlan.toolInputDigest, inputByteLength: helperPlan.toolInputByteLength }],
    actorInvocationRef: 'actor-invocation://' + MEASUREMENT, processRef: 'process://' + MEASUREMENT, transportBindingRef: 'transport-binding://' + MEASUREMENT,
    transportBindingDigest: hash('transport-binding://' + MEASUREMENT), transportDigest: hash('transport://' + MEASUREMENT) };
  const observation = c2.constructWorksiteExecutionObservation(task, workerResult, actor, artifact, helperPlan);
  return { artifact, artifactBytes: bytes.length, workerResult, actor, observation };
}

/** The envelope of one observed C2 Result in an event log: its admitted result, judgment and evidence payloads. */
export async function c2Envelope(eventLogPath, cCallRef) {
  const rows = (await readFile(eventLogPath, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line)).filter(r => r.aggregateId === cCallRef);
  const one = kind => { const xs = rows.filter(r => r.kind === kind); if (xs.length !== 1) throw new TypeError(kind + ' is not one event of ' + cCallRef); return xs[0]; };
  const result = one('c_call_result_admitted'), judgment = one('c_call_judged');
  const evidence = rows.filter(r => r.kind === 'c_call_evidenced' && result.payload.evidenceRefs.includes(r.payload.evidenceRef));
  if (result.payload.contractRef !== 'contract://abiogenesis/worksite/command-execution-observation@5') throw new TypeError('not a C2 observation Result: ' + cCallRef);
  return { eventLogPath, cCallRef, result, judgment, evidence,
    observedValueBytes: Buffer.byteLength(JSON.stringify(result.payload.value)) };
}

/** The execution material over a value under an envelope, as the fold resolves it (abg/qualification_proof.ts:832-846: the
 * state's result is the admitted payload with its admission fields, stateAt :242-252). */
export function executionMaterial(q, envelope, value, ref) {
  const hash = q.product.sha256Canonical;
  const result = { ...envelope.result.payload, value, valueDigest: hash(value), kind: 'admitted_c_call_result', schemaVersion: '5.0.0',
    disposition: 'admitted', admissionEventRef: envelope.result.eventId };
  const judgment = { ...envelope.judgment.payload, kind: 'admitted_c_call_judgment', schemaVersion: '5.0.0', disposition: 'admitted',
    admissionEventRef: envelope.judgment.eventId };
  const evidence = envelope.evidence.map(e => ({ ...e.payload, admissionEventRef: e.eventId }));
  const raw = Buffer.from(q.product.canonicalJson({ result, judgment, evidence }));
  const digest = sha256(raw), materialRef = ref ?? 'result://abiogenesis/t287/d5c/measured-stand-in/' + digest.slice(7);
  return { material: { ref: materialRef, path: materialRef, digest, byteCount: raw.length, contentBase64: raw.toString('base64') },
    parts: { valueBytes: Buffer.byteLength(q.product.canonicalJson(value)), resultEnvelopeBytes: Buffer.byteLength(q.product.canonicalJson({ ...result, value: null })),
      judgmentBytes: Buffer.byteLength(q.product.canonicalJson(judgment)), evidenceBytes: Buffer.byteLength(q.product.canonicalJson(evidence)), evidenceRows: evidence.length,
      renderedSourceDataBytes: Buffer.byteLength(JSON.stringify(raw.toString('utf8'))) } };
}

/** The verification material by the installed constructor, over the recipe member and the measured observation. */
export function verificationMaterial(q, { basis, inventory, recipe, execution, cCall, observation, executionSelectionRef }) {
  return q.deep.qualification.constructQualificationVerificationMaterial({ basis, inventory,
    selection: { executionSelectionRef, recipe, recipePath: RECIPE_PATH }, execution, cCall, observation });
}

/** The observation's parts by canonical JSON size. */
export function observationParts(q, observation) {
  const json = v => Buffer.byteLength(q.product.canonicalJson(v));
  return { totalBytes: json(observation), parts: Object.fromEntries(Object.keys(observation).sort().map(k => [k, json(observation[k])])),
    commandResults: observation.commandResults.map(c => ({ commandId: c.commandId, exitStatus: c.exitStatus, timedOut: c.timedOut,
      stdoutBytes: c.stdout.byteLength, stderrBytes: c.stderr.byteLength, resultBytes: json(c) })),
    worksiteDeltaRows: observation.worksiteDelta.length, productDeltaRows: observation.productDelta.length, snapshotMembers: observation.snapshotMembers.length,
    predicateObservations: observation.predicateObservations.length, protectedObservations: observation.task.protectedObservations.length,
    taskBytes: json(observation.task) };
}
