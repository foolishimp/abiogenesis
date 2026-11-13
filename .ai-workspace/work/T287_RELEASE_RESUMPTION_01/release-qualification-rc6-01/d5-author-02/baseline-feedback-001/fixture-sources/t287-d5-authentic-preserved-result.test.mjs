import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  const transport = JSON.parse(await readFile(binding.payload.paths.transport, "utf8"));
  return { started, artifact, failed, binding, result, judgment, transport };
}

function worksiteBytes(environment) {
  const base = environment.workspaceAuthority.canonicalRoot;
  return Promise.all(["proof/app.mjs", "proof/verify.mjs"].map(path => readFile(join(base, path), "utf8")));
}

function decodedReplacement(file) {
  return file.replacementText ?? Buffer.from(file.replacementBase64, "base64").toString("utf8");
}

test("D5 authentic preserved Construction proposal through installed owners", { timeout: 115_000 }, async (t) => {
  const environment = await setupD5RecoveryEnvironment(t, root);
  const { abg, product, store } = environment;
  const source = await runD5SourceHandoff(t, root, environment);
  await writeD5Worksite(environment);
  const preimages = await worksiteBytes(environment);
  assert.deepEqual(preimages, [D5_IMPLEMENTATION_PREIMAGE, D5_VERIFIER_TEXT]);
  const bin = join(environment.scratch, "d5-bin");
  const run = async (label, mode, timers = {}) => {
    const basis = await admitD5SemanticRun(t, root, environment, source.sourceHandoff, label);
    const command = await installD5ControlledTransport(bin, mode);
    const executed = await executeD5SemanticRun(environment, basis, label, { ABG_TS_CLAUDE_COMMAND: command, ...timers });
    return { basis, executed, attempt: selectD5ConstructionAttempt(environment, executed.runId) };
  };

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
      currentRootEventContract: selector.historicalPrefix.storeIdentity.eventContractDigest === abg.ROOT_EVENT_CONTRACT_DIGEST },
    prefix: { prefixLength: selector.historicalPrefix.prefixLength, prefixDigest: selector.historicalPrefix.prefixDigest,
      coordinateDigest: selector.historicalPrefix.coordinateDigest },
    sourceCCallRef: selector.sourceCCallRef, actorInvocationRef: selector.actorInvocationRef,
    construction: { resultClass: carriers.result.payload.resultClass, judgment: carriers.judgment.payload.judgment,
      completion: positive.executed.completion.disposition },
    carrierCopies: { artifactEvent: EVENT_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.artifact.payload, key)),
      failedEvent: EVENT_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.failed.payload, key)),
      transportArchive: ARCHIVE_LIFECYCLE_COPIES.filter(key => Object.hasOwn(carriers.transport, key)) },
    projected: projected === null ? null : { assessedEnvelopeDigest: projected.proof.assessedEnvelopeDigest,
      artifactDigests: projected.proof.artifactDigests, artifactByteLengths: projected.proof.artifactByteLengths,
      artifactEventRef: projected.proof.artifactEventRef, processRef: projected.proof.processRef,
      originalResultDigest: projected.proof.originalResultDigest, originalJudgmentDigest: projected.proof.originalJudgmentDigest,
      toolUseId: projected.proof.toolUseId, sessionId: projected.proof.sessionId,
      files: projected.workerResult.files.map(file => ({ targetRef: file.targetRef, sha256: product.sha256Bytes(Buffer.from(decodedReplacement(file))) })) },
  };
  t.diagnostic(`D5_BASELINE_PROOF ${JSON.stringify(proof)}`);
  assert.notEqual(projected, null, "authentic preserved Construction proposal projects");
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
});
