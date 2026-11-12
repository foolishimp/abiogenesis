import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { D5_IMPLEMENTATION_PREIMAGE, D5_IMPLEMENTATION_PROPOSAL, D5_PROTOCOL, D5_RECOVERY_IDS, D5_VERIFIER_TEXT,
  admitD5SemanticRun, d5PreservedSelector, executeD5SemanticRun, installD5ControlledTransport, runD5SourceHandoff,
  selectD5ConstructionAttempt, setupD5RecoveryEnvironment, writeD5Worksite } from "../support/d5-authentic-preserved-result-fixture.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const EVENT_LIFECYCLE_COPIES = ["timedOut", "exitObserved", "terminationConfirmed", "signalSequence"];
const ARCHIVE_LIFECYCLE_COPIES = ["timedOut", "exitObserved", "terminationConfirmed"];

function exactEvent(events, predicate, label) {
  const rows = events.filter(predicate);
  assert.equal(rows.length, 1, `${label}: ${rows.length}`);
  return rows[0];
}

/** Owner-issued carriers for one Construction attempt; read-only. */
async function constructionCarriers(environment, attempt) {
  const events = environment.store.readAll();
  const actor = kind => exactEvent(events, e => e.kind === kind && e.aggregateId === attempt.actorInvocationRef, kind);
  const started = actor("actor_invocation_started"), artifact = actor("actor_result_artifact_observed"), failed = actor("actor_invocation_failed");
  const binding = exactEvent(events, e => e.kind === "actor_transport_binding_admitted" &&
    e.aggregateId === started.payload.transportBindingRef, "actor transport binding");
  const result = exactEvent(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === attempt.sourceCCallRef, "Construction Result");
  const judgment = exactEvent(events, e => e.kind === "c_call_judged" && e.aggregateId === attempt.sourceCCallRef, "Construction Judgment");
  const evidence = exactEvent(events, e => e.kind === "c_call_evidenced" && e.aggregateId === attempt.sourceCCallRef &&
    e.payload.evidenceClass === "probabilistic_transport", "Construction transport evidence");
  const processRows = events.filter(e => e.parentAggregateId === attempt.actorInvocationRef && e.aggregateType === "process" &&
    ["actor_process_exited", "actor_process_spawn_failed", "actor_process_termination_unconfirmed", "actor_process_timeout_observed"].includes(e.kind));
  const transport = JSON.parse(await readFile(binding.payload.paths.transport, "utf8"));
  return { started, artifact, failed, binding, result, judgment, evidence, process: processRows, transport };
}

function worksiteBytes(environment) {
  const base = environment.workspaceAuthority.canonicalRoot;
  return Promise.all(["proof/app.mjs", "proof/verify.mjs"].map(path => readFile(join(base, path), "utf8")));
}

const copiesOf = (carriers) => ({
  artifactEvent: EVENT_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.artifact.payload, key)),
  evidenceEvent: EVENT_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.evidence.payload, key)),
  failedEvent: EVENT_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.failed.payload, key)),
  transportArchive: ARCHIVE_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.transport, key)),
});

function decodedReplacement(file) {
  return file.replacementText ?? Buffer.from(file.replacementBase64, "base64").toString("utf8");
}

// The limit comes from measured runs, not from one duration: alone on
// 2026-11-12 the case took 118.4 to 121.5 s, about 40 s of it the install
// setup, and in three whole-suite runs 114.6 to 118.0 s. 180 s is 1.5 times
// the slowest of these.
test("D5 authentic preserved Construction proposal through installed owners; genuine causal negatives refuse", { timeout: 180_000 }, async (t) => {
  const started = Date.now(), timings = {};
  const lap = label => { timings[label] = Date.now() - started; t.diagnostic(`D5_LAP ${label} ${timings[label]}`); };
  const environment = await setupD5RecoveryEnvironment(t, root);
  const { abg, product, store } = environment;
  lap("setup");
  const source = await runD5SourceHandoff(t, root, environment);
  await writeD5Worksite(environment);
  const preimages = await worksiteBytes(environment);
  assert.deepEqual(preimages, [D5_IMPLEMENTATION_PREIMAGE, D5_VERIFIER_TEXT]);
  lap("source");
  const bin = join(environment.scratch, "d5-bin");
  const run = async (label, mode, timers = {}) => {
    const basis = await admitD5SemanticRun(t, root, environment, source.sourceHandoff, label);
    lap(`${label}-admit`);
    const command = await installD5ControlledTransport(bin, mode);
    const executed = await executeD5SemanticRun(environment, basis, label, { ABG_TS_CLAUDE_COMMAND: command, ...timers });
    lap(label);
    return { basis, executed, attempt: selectD5ConstructionAttempt(environment, executed.runId) };
  };
  // A prefix held before any semantic Run: it contains no Construction attempt.
  const beforeRuns = abg.selectHeldEventStoreDurablePrefix(store);

  const positive = await run("positive", "proposal");
  assert.notEqual(positive.executed.completion.disposition, "closed", "blocked Construction cannot close the semantic Run");
  const selector = d5PreservedSelector(environment, positive.attempt);
  const eventCount = store.readAll().length;
  const projected = abg.projectPreservedWorksiteProposal(selector);
  assert.equal(store.readAll().length, eventCount, "the read projection admits no event");
  const carriers = await constructionCarriers(environment, positive.attempt);
  const proof = {
    abiArtifact: { artifactDigest: environment.verified.artifactDigest, productContentDigest: environment.verified.productContentDigest,
      manifestDigest: environment.verified.manifestDigest },
    testProducts: { source: environment.d5.source.basis, lifecycle: environment.d5.lifecycle.basis },
    profile: { eventContractDigest: selector.historicalPrefix.storeIdentity.eventContractDigest,
      currentRootEventContract: selector.historicalPrefix.storeIdentity.eventContractDigest === abg.ROOT_EVENT_CONTRACT_DIGEST,
      artifactEventContractDigest: carriers.artifact.eventContractDigest },
    prefix: { prefixLength: selector.historicalPrefix.prefixLength, prefixDigest: selector.historicalPrefix.prefixDigest,
      coordinateDigest: selector.historicalPrefix.coordinateDigest },
    sourceCCallRef: selector.sourceCCallRef, actorInvocationRef: selector.actorInvocationRef,
    construction: { resultClass: carriers.result.payload.resultClass, judgment: carriers.judgment.payload.judgment,
      completion: positive.executed.completion.disposition, processTerminals: carriers.process.map(e => e.kind) },
    carrierCopies: copiesOf(carriers),
    archive: { transportDigest: carriers.artifact.payload.transportDigest, artifactDigests: carriers.artifact.payload.artifactDigests },
    projected: projected === null ? null : { assessedEnvelopeDigest: projected.proof.assessedEnvelopeDigest,
      artifactDigests: projected.proof.artifactDigests, artifactByteLengths: projected.proof.artifactByteLengths,
      artifactEventRef: projected.proof.artifactEventRef, processRef: projected.proof.processRef,
      originalResultDigest: projected.proof.originalResultDigest, originalJudgmentDigest: projected.proof.originalJudgmentDigest,
      toolUseId: projected.proof.toolUseId, sessionId: projected.proof.sessionId,
      files: projected.workerResult.files.map(file => ({ targetRef: file.targetRef, sha256: product.sha256Bytes(Buffer.from(decodedReplacement(file))) })) },
  };
  t.diagnostic(`D5_FINAL_PROOF ${JSON.stringify(proof)}`);
  assert.notEqual(projected, null, "authentic preserved Construction proposal projects");
  assert.equal(proof.profile.currentRootEventContract, true);
  assert.equal(carriers.artifact.eventContractDigest, abg.ROOT_EVENT_CONTRACT_DIGEST);
  assert.deepEqual(proof.carrierCopies, { artifactEvent: [], evidenceEvent: [], failedEvent: [], transportArchive: [] },
    "the retired artifact, evidence and archive copies are absent");
  assert.equal(carriers.result.payload.resultClass, "failure");
  assert.equal(carriers.judgment.payload.judgment, "blocked");
  assert.equal(projected.proof.toolUseId, D5_PROTOCOL.toolUseId);
  assert.equal(projected.proof.sessionId, D5_PROTOCOL.sessionId);
  assert.equal(projected.proof.artifactEventRef, carriers.artifact.eventId);
  assert.equal(projected.originalTask.targets.length, 2);
  assert.deepEqual(projected.workerResult.files.map(file => file.targetRef), projected.originalTask.targets.map(target => target.targetRef));
  assert.deepEqual(projected.workerResult.files.map(decodedReplacement), [D5_IMPLEMENTATION_PROPOSAL, D5_VERIFIER_TEXT]);
  assert.deepEqual(projected.originalTask.targets.map(target => target.subject.relativePath), ["proof/app.mjs", "proof/verify.mjs"]);
  assert.equal(projected.envelope.sourceHandoff.declaration.declarationRef, D5_RECOVERY_IDS.sourceDeclarationRef);
  assert.equal(projected.proof.assessedEnvelopeDigest, product.sha256Canonical(projected.envelope));
  assert.deepEqual(await worksiteBytes(environment), preimages, "a blocked Construction changes no target");

  // Digest-bound archive bytes: a tampered copy refuses; the exact bytes restore the projection.
  const tamper = {};
  for (const key of ["stdout", "transport"]) {
    const path = carriers.binding.payload.paths[key], original = await readFile(path);
    const changed = Buffer.from(original);
    changed[changed.length >> 1] ^= 0x01;
    await writeFile(path, changed);
    tamper[key] = abg.projectPreservedWorksiteProposal(selector);
    await writeFile(path, original);
    assert.equal(tamper[key], null, `a tampered ${key} archive refuses`);
    assert.deepEqual(abg.projectPreservedWorksiteProposal(selector), projected, `the exact ${key} bytes restore the projection`);
  }

  // Genuine owner-issued negative Runs over the same installs and worksite.
  const negatives = {};
  const negative = async (label, mode, timers, check) => {
    const attempt = await run(label, mode, timers);
    const facts = await constructionCarriers(environment, attempt.attempt);
    const value = abg.projectPreservedWorksiteProposal(d5PreservedSelector(environment, attempt.attempt));
    negatives[label] = { completion: attempt.executed.completion.disposition, resultClass: facts.result.payload.resultClass,
      judgment: facts.judgment.payload.judgment, failureClass: facts.artifact.payload.failureClass,
      processStatus: facts.artifact.payload.processStatus, processSignal: facts.artifact.payload.processSignal,
      timeoutClass: facts.artifact.payload.timeoutClass, processTerminals: facts.process.map(e => e.kind),
      carrierCopies: copiesOf(facts), projected: value !== null };
    check(facts);
    assert.equal(value, null, `${label} refuses`);
    return attempt;
  };
  const nonzero = await negative("nonzero", "nonzero", {}, facts => {
    assert.equal(facts.artifact.payload.processStatus, 7, "the controlled process exits 7");
    assert.ok(facts.process.some(e => e.kind === "actor_process_exited" && e.payload.status === 7));
  });
  // A current-profile lease ends through native supervision; the short
  // absolute cap bounds the controlled process that never exits by itself.
  await negative("timeout", "timeout", { ABG_TS_FP_TIMEOUT_MS: "1000", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: "2500",
    ABG_TS_FP_TERMINATION_GRACE_MS: "250" }, facts => {
    assert.ok(facts.process.some(e => e.kind === "actor_process_timeout_observed"), "the owner observes the timeout");
    assert.notEqual(facts.artifact.payload.timeoutClass, null);
  });
  for (const mode of ["crossed_id", "crossed_session"]) await negative(mode, mode, {}, facts => {
    assert.equal(facts.artifact.payload.processStatus, 0);
    assert.equal(facts.artifact.payload.failureClass, "no_output");
  });

  // Crossed or foreign actual ancestry over admitted coordinates only.
  const events = store.readAll();
  const author = events.find(e => e.kind === "c_call_opened" && e.runId === positive.executed.runId && e.aggregateId !== positive.attempt.sourceCCallRef &&
    events.some(a => a.kind === "actor_invocation_started" && a.parentAggregateId === e.aggregateId));
  const authorActor = events.find(a => a.kind === "actor_invocation_started" && a.parentAggregateId === author.aggregateId);
  const crossed = {
    foreignActor: abg.projectPreservedWorksiteProposal({ ...selector, actorInvocationRef: nonzero.attempt.actorInvocationRef }),
    foreignCall: abg.projectPreservedWorksiteProposal({ ...selector, sourceCCallRef: nonzero.attempt.sourceCCallRef }),
    authorAncestry: abg.projectPreservedWorksiteProposal({ ...selector, sourceCCallRef: author.aggregateId, actorInvocationRef: authorActor.aggregateId }),
    prefixBeforeRuns: abg.projectPreservedWorksiteProposal(d5PreservedSelector(environment, positive.attempt, beforeRuns)),
  };
  for (const [name, value] of Object.entries(crossed)) assert.equal(value, null, `crossed ancestry ${name} refuses`);
  assert.deepEqual(abg.projectPreservedWorksiteProposal(selector), projected, "the authentic positive still projects after every negative");
  assert.deepEqual(await worksiteBytes(environment), preimages, "no negative changes a target");
  lap("negatives");
  t.diagnostic(`D5_NEGATIVE_PROOF ${JSON.stringify({ tamper: Object.fromEntries(Object.entries(tamper).map(([k, v]) => [k, v !== null])),
    runs: negatives, crossed: Object.fromEntries(Object.entries(crossed).map(([k, v]) => [k, v !== null])),
    authorGraphFunctionRef: author.graphFunctionRef, timings })}`);
});
