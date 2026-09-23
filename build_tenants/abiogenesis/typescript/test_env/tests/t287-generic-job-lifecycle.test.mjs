import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, lstat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as Effect from "effect/Effect";
import test from "node:test";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";
import { nativePublications } from "../support/d2-frame-fixture.mjs";
import { prepareGenericJobIntakeProduct, constructGenericIntakeStart, ordinaryJob } from "../support/t287-generic-job-intake.mjs";
import { installGenericJobTransport } from "../support/t287-generic-job-lifecycle.mjs";
import { genericRevisionPublicationData } from "../support/t287-generic-job-revision.mjs";
import { readGenericJobThroughFreshPublic } from "../support/t287-generic-job-readback.mjs";

const packageRoot = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..");
test("installed ordinary job traverses full native semantic, parent, C1, C2 and Evidence owners", { timeout: 3600000,
  skip: process.env.ABI5_GENERIC_JOB_FULL_NATIVE !== "1" }, async () => {
  const environment = await setupInstalledRootCatalog({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareGenericJobIntakeProduct({ ...basis, declarationFactory: genericRevisionPublicationData })],
  });
  console.log(JSON.stringify({ phase: "generic_full_setup", scratch: environment.scratch }));
  const { product, gtl, abg } = environment, publication = environment.additionalPublications[0];
  environment.catalog = product.admitGraphFunctionCatalog({ workspaceBinding: environment.bindingCandidate, resolvedLock: environment.lock,
    verifiedProducts: environment.verifiedProducts, installedProducts: environment.installCandidates,
    publications: [...nativePublications(gtl, environment.verified), publication] });
  assert.equal(environment.catalog.kind, "graph_function_catalog", JSON.stringify(environment.catalog));
  environment.catalogView = product.narrowGraphFunctionCatalog(environment.catalog, publication.programs[0].callableMembership);
  assert.equal(environment.catalogView.kind, "graph_function_catalog_view", JSON.stringify(environment.catalogView));
  const publicApi = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  const closeHandoff = environment.store.projectReopenAuthorityAndClose();
  const eventResource = { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff, handoffDigest: product.sha256Canonical(closeHandoff) };
  const sharedPath = join(environment.workspaceAuthority.canonicalRoot, "shared/lib.mjs");
  await mkdir(join(environment.workspaceAuthority.canonicalRoot, "shared"));
  const sharedBytes = Buffer.from("export const sharedGreeting = 'Hello World';\n");
  await writeFile(sharedPath, sharedBytes, { flag: "wx" }); const sharedBefore = await lstat(sharedPath);
  const input = ordinaryJob(product, gtl, "Build an application that returns Hello World using the existing read-only shared/lib.mjs and an independent verifier that imports the application and checks that exact greeting. Preserve the existing shared library.", { readRoots: ["app", "shared"] });
  const { call } = await constructGenericIntakeStart({ environment, publicApi, eventResource, input, identity: "full-initial" });
  const command = await installGenericJobTransport(environment.scratch), previous = process.env.ABG_TS_CLAUDE_COMMAND;
  await writeFile(join(environment.scratch, "full-call.json"), JSON.stringify(call, null, 2) + "\n", { flag: "wx" });
  process.env.ABG_TS_CLAUDE_COMMAND = command;
  let outcome;
  try { outcome = await Effect.runPromise(product.RUN_DEFINITION_BINDINGS.invoke.start(call)); }
  finally { if (previous === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND; else process.env.ABG_TS_CLAUDE_COMMAND = previous; }
  await writeFile(join(environment.scratch, "full-outcome.json"), JSON.stringify(outcome, null, 2) + "\n", { flag: "wx" });
  assert.equal(outcome.ownerOutput.outcomeKind, "result", JSON.stringify(outcome));
  assert.equal(outcome.ownerOutput.value.disposition, "completed", `closed native receipt: ${join(environment.scratch, "full-outcome.json")}`);
  const closed = outcome.resources.eventResource.closeHandoff, events = abg.readRuntimeEventsAtDurablePrefix(closed.prefix);
  const resultRows = events.filter(e => e.kind === "c_call_result_admitted"), envelopes = resultRows.filter(e => product.isSemanticJobEnvelope(e.payload.value));
  const final = envelopes.at(-1).payload.value;
  assert.deepEqual(final.assets.map(a => a.stageRef), publication.semanticJobLifecycle.stages.map(s => s.declarationRef));
  assert.ok(final.assets.every(a => a.assessment?.disposition === "satisfied"));
  assert.equal(final.bindingVersions.length, 1);
  assert.ok(final.evidence);
  assert.equal(final.applicationCoverage, "non_closing");
  const parents = resultRows.find(e => e.payload.value?.kind === "worksite_file_parents_result"); assert.ok(parents);
  assert.ok(parents.payload.value.receipt.outcomes.some(o => o.disposition === "created"));
  const construction = resultRows.find(e => e.payload.value?.kind === "worksite_construction_result"); assert.ok(construction);
  const execution = resultRows.find(e => e.payload.value?.kind === "worksite_command_execution_observation"); assert.ok(execution);
  assert.equal(execution.payload.value.commandResults[0].exitStatus, 0);
  assert.equal(construction.payload.value.members.length, 2);
  assert.deepEqual(execution.payload.value.task.readDependencyBasis.members.map(row => row.subject.relativePath), ["shared/lib.mjs"]);
  assert.deepEqual(execution.payload.value.snapshotMembers.map(row => row.relativePath), ["app/main.mjs", "app/check.mjs", "shared/lib.mjs"]);
  assert.deepEqual(await readFile(sharedPath), sharedBytes); const sharedAfter = await lstat(sharedPath);
  assert.equal(sharedAfter.dev, sharedBefore.dev); assert.equal(sharedAfter.ino, sharedBefore.ino);
  const jobOwner = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/abg/semantic_job.js")).href);
  const commandOwner = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/product/worksite_command_execution.js")).href);
  const prefix = abg.selectValidatedRuntimeEventPrefix(Object.freeze(events));
  assert.ok(jobOwner.semanticJobReadDependenciesAtPrefix(prefix, execution.payload.value.task.readDependencyBasis));
  const crossedReads = commandOwner.constructWorksiteReadDependencyBasis({ ...execution.payload.value.task.readDependencyBasis,
    jobRef: "semantic-job://crossed/other", jobDigest: product.sha256Canonical("other ordinary input") });
  assert.equal(jobOwner.semanticJobReadDependenciesAtPrefix(prefix, crossedReads), null, "matching files cannot substitute another job origin");
  assert.equal(final.evidence.constructionResultRef, construction.payload.resultRef);
  assert.equal(final.evidence.executionResultRef, execution.payload.resultRef);
  assert.deepEqual(final.evidence.executionObservation, execution.payload.value);
  assert.equal(events.filter(e => e.kind === "actor_transport_binding_admitted").length, 12);
  const reads = await readGenericJobThroughFreshPublic({ scratch: environment.scratch, installedRoot: environment.installedRoot,
    artifactPath: environment.artifactPath, call, outcome });
  await writeFile(join(environment.scratch, "generic-full-proof.json"), JSON.stringify({ kind: "generic_job_full_mechanical_proof",
    semanticQualification: false, paidCalls: 0, scratch: environment.scratch, abiArtifact: environment.verified.artifactDigest,
    product: environment.additionalProducts[0].basis, closeHandoff: closed, finalResult: envelopes.at(-1), parents, construction, execution,
    readbackRoot: reads.outputRoot }, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ phase: "generic_full_completed", scratch: environment.scratch, events: events.length, paidCalls: 0 }));
});
