import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { readFile, writeFile, lstat, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import test from "node:test";
import * as Effect from "effect/Effect";
import { genericRevisionPublicationData, genericRevisionIds, observeGenericJobRevisionWorksite } from "../support/t287-generic-job-revision.mjs";
import { nativePublications } from "../support/d2-frame-fixture.mjs";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";
import { prepareGenericJobIntakeProduct, constructGenericIntakeStart, ordinaryJob } from "../support/t287-generic-job-intake.mjs";
import { installGenericJobTransport } from "../support/t287-generic-job-lifecycle.mjs";
import { readGenericJobThroughFreshPublic } from "../support/t287-generic-job-readback.mjs";

const packageRoot = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..");
const load = name => import(pathToFileURL(join(packageRoot, "build/code/src", name + ".js")).href);

test("one generic publication declares native initial, selection and correction Programs", async () => {
  const [product, gtl, validator] = await Promise.all(["product/index", "gtl/index", "validator/index"].map(load));
  const h = n => "sha256:" + String(n).repeat(64), artifact = { productId: product.ABI5_PRODUCT_ID,
    packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
    artifactDigest: h(1), productContentDigest: h(2), manifestDigest: h(3) };
  const natives = nativePublications(gtl, artifact), abiPublication = natives.find(p => p.moduleRef === gtl.SEMANTIC_STAGE_IDS.moduleRef);
  const data = genericRevisionPublicationData({ product, gtl, abiPublication });
  const publication = gtl.modulePublication({ ...data, kind: "module_publication", moduleVersion: "5.0.0",
    artifactDigest: h(4), productContentDigest: h(5), productManifestDigest: h(6),
    contributions: data.contributions.map(c => ({ ...c, provenanceRefs: [h(4), h(6)] })) });
  const publications = [...natives, publication], unique = (rows, key) => [...new Map(rows.map(row => [row[key], row])).values()];
  const raw = (value, kind) => { const r = validator.rawAdmitValue(value, kind, `contract://component/generic/${kind}`);
    assert.equal(r.kind, "raw_admitted_value", JSON.stringify(r)); return r; };
  const admitted = raw(publication, "module_publication");
  for (const program of publication.programs) {
    const result = validator.validateProgram({ declarationBasisDigest: admitted.subjectDigest, programPublication: admitted,
      semanticJobLifecyclePublication: admitted, program: raw(program, "gtl_program"),
      graphFunctions: unique(publications.flatMap(p => p.graphFunctions).filter(g => program.callableMembership.includes(g.name)), "name").map(g => raw(g, "graph_function")),
      contracts: unique(publications.flatMap(p => p.contracts), "contractRef").map(c => raw(c, "contract_declaration")),
      implementationBindings: unique(publications.flatMap(p => p.implementationBindings), "bindingRef").map(b => raw(b, "implementation_binding")),
      closureContracts: unique(publications.flatMap(p => p.closureContracts), "closureContractRef").map(c => raw(c, "closure_contract")),
      rules: [], evaluators: [] });
    assert.equal(result.kind, "program_validation", JSON.stringify(result));
  }
  assert.equal(publication.programs.length, 3);
  assert.deepEqual(genericRevisionPublicationData({ product, gtl, abiPublication }), data);
  assert.equal(Object.hasOwn(data, "requirementHandoffs"), false);
  assert.equal(Object.hasOwn(data, "semanticLifecycle"), false);
});

// Retired (T-292 TD-60): a saved revision bridge preserves its discriminants and retained ownership; input the saved native revision bridge prefix root output of a native Run

// Retired (T-292 TD-60): saved revision Evidence separates historical origins from successor state; input the saved revision Evidence prefix root output of a native Run

test("native correction consumes an actual failed verifier and preserves the unselected file", {
  timeout: 7200000, skip: process.env.ABI5_GENERIC_JOB_CORRECTION_NATIVE !== "1" && "ABI5_GENERIC_JOB_CORRECTION_NATIVE is not '1'; selects the native correction run over an actual failed verifier" }, async () => {
  const environment = await setupInstalledRootCatalog({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", workspaceProductIndex: 1,
    prepareAdditionalProducts: async basis => [await prepareGenericJobIntakeProduct({ ...basis, declarationFactory: genericRevisionPublicationData })],
  });
  const { product, gtl, abg } = environment, publication = environment.additionalPublications[0];
  environment.catalog = product.admitGraphFunctionCatalog({ workspaceBinding: environment.bindingCandidate, resolvedLock: environment.lock,
    verifiedProducts: environment.verifiedProducts, installedProducts: environment.installCandidates,
    publications: [...nativePublications(gtl, environment.verified), publication] });
  assert.equal(environment.catalog.kind, "graph_function_catalog", JSON.stringify(environment.catalog));
  environment.catalogView = product.narrowGraphFunctionCatalog(environment.catalog,
    [...new Set(publication.programs.flatMap(p => p.callableMembership))]);
  assert.equal(environment.catalogView.kind, "graph_function_catalog_view");
  const publicApi = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/public/index.js")).href);
  const jobs = await import(pathToFileURL(join(environment.installedRoot, "build/code/src/abg/semantic_job.js")).href);
  let closed = environment.store.projectReopenAuthorityAndClose();
  const reopen = () => ({ kind: "reopen_abg_event_resource", schemaVersion: "5.0.0", closeHandoff: closed, handoffDigest: product.sha256Canonical(closed) });
  const command = await installGenericJobTransport(environment.scratch, { initialConstruction: "failed_verifier" });
  const previous = process.env.ABG_TS_CLAUDE_COMMAND; process.env.ABG_TS_CLAUDE_COMMAND = command;
  const calls = [];
  async function invoke(name, options) {
    const { call } = await constructGenericIntakeStart({ environment, publicApi, eventResource: reopen(), identity: name, ...options });
    await writeFile(join(environment.scratch, name + "-call.json"), JSON.stringify(call, null, 2) + "\n", { flag: "wx" });
    const outcome = await Effect.runPromise(product.RUN_DEFINITION_BINDINGS.invoke.start(call));
    await writeFile(join(environment.scratch, name + "-outcome.json"), JSON.stringify(outcome, null, 2) + "\n", { flag: "wx" });
    assert.equal(outcome.ownerOutput.outcomeKind, "result", JSON.stringify(outcome));
    closed = outcome.resources.eventResource.closeHandoff;
    const events = abg.readRuntimeEventsAtDurablePrefix(closed.prefix);
    const result = { call, outcome, events }; calls.push(result);
    console.log(JSON.stringify({ phase: name, scratch: environment.scratch, events: events.length, disposition: outcome.ownerOutput.value.disposition }));
    return result;
  }
  try {
    console.log(JSON.stringify({ phase: "generic_correction_setup", scratch: environment.scratch }));
    const sharedPath = join(environment.workspaceAuthority.canonicalRoot, "shared/lib.mjs"), sharedBytes = Buffer.from("export const sharedGreeting = 'Hello World';\n");
    await mkdir(join(environment.workspaceAuthority.canonicalRoot, "shared"));
    await writeFile(sharedPath, sharedBytes, { flag: "wx" }); const sharedBefore = await lstat(sharedPath);
    const initial = await invoke("correction-initial", { input: ordinaryJob(product, gtl,
      "Build an application that returns Hello World using the existing read-only shared/lib.mjs and an independent verifier that imports the application and checks that exact greeting. Preserve the existing shared library.", { readRoots: ["app", "shared"] }) });
    assert.equal(initial.outcome.ownerOutput.value.disposition, "runtime_failed", "the Evidence assessment preserves actual failing checker evidence");
    const kind = (events, name) => events.filter(e => e.kind === "c_call_result_admitted" && e.payload.value?.kind === name);
    const evidenceStage = publication.semanticJobLifecycle.stages.find(s => s.bodyCapabilities.includes("application_assessment")); assert.ok(evidenceStage);
    const parentEvent = kind(initial.events, "semantic_stage_envelope").findLast(e => e.payload.value.evidence !== null &&
      e.payload.value.assets.at(-1)?.stageRef === evidenceStage.declarationRef && e.payload.value.assets.at(-1).assessment === null &&
      initial.events.some(c => c.kind === "c_call_fibre_selected" && c.aggregateId === e.aggregateId &&
        c.payload.implementationRef === gtl.SEMANTIC_STAGE_IDS.authorImplementationRef));
    assert.ok(parentEvent);
    const commandEvent = kind(initial.events, "worksite_command_execution_observation")[0]; assert.ok(commandEvent);
    assert.notEqual(commandEvent.payload.value.commandResults[0].exitStatus, 0, "actual verifier process fails before any correction");
    const coordinate = (event, events) => {
      const judgment = events.find(e => e.kind === "c_call_judged" && e.aggregateId === event.aggregateId); assert.ok(judgment);
      return { cCallRef: event.aggregateId, resultRef: event.payload.resultRef, resultDigest: event.payload.resultDigest,
        resultAdmissionEventRef: event.eventId, judgmentEventRef: judgment.eventId };
    };
    const parent = coordinate(parentEvent, initial.events), causes = [coordinate(commandEvent, initial.events)];
    const source = jobs.semanticJobConstructionSourceAtPrefix(abg.selectValidatedRuntimeEventPrefix(initial.events), parentEvent.payload.value); assert.ok(source);
    const original = source.worksite, operating = { workspaceAuthorityBasis: original.workspaceAuthorityBasis, workspaceBinding: original.workspaceBinding };
    const inspectVerifier = async () => {
      const file = resolve(original.workspaceAuthorityBasis.canonicalRoot, "app/check.mjs"), stat = await lstat(file), bytes = await readFile(file);
      return { digest: product.sha256Bytes(bytes), bytes: bytes.toString("base64"), fileIdentity: `${stat.dev}:${stat.ino}` };
    };
    const before = await inspectVerifier();
    const selection = await invoke("correction-selection", { programRef: genericRevisionIds.selectionProgramRef,
      inputFactory: async ({ grants }) => ({ kind: "semantic_revision_selection_input", schemaVersion: "5.0.0", parent, causes,
        currentWorksite: await observeGenericJobRevisionWorksite({ product, original, ...operating, capabilityGrant: grants[0] }) }) });
    assert.equal(selection.outcome.ownerOutput.value.disposition, "completed");
    const decision = kind(selection.events, "semantic_revision_selection").at(-1); assert.ok(decision);
    assert.deepEqual(decision.payload.value.selectedTargetRefs, [original.targets.find(t => t.target.subject.relativePath === "app/main.mjs").target.targetRef]);
    const repair = await invoke("correction-repair", { programRef: genericRevisionIds.repairProgramRef,
      inputFactory: async ({ grants }) => ({ kind: "semantic_revision_request", schemaVersion: "5.0.0", parent, causes,
        selection: coordinate(decision, selection.events),
        currentWorksite: await observeGenericJobRevisionWorksite({ product, original, ...operating, capabilityGrant: grants[0] }) }) });
    assert.equal(repair.outcome.ownerOutput.value.disposition, "completed");
    assert.deepEqual(repair.events.slice(0, initial.events.length), initial.events, "the failed predecessor is retained exactly");
    const newEvents = repair.events.slice(selection.events.length);
    const replacements = kind(newEvents, "worksite_file_replace_output");
    const physical = replacements.filter(e => repair.events.find(opened => opened.kind === "c_call_opened" &&
      opened.aggregateId === e.aggregateId)?.payload.callClass === "leaf");
    const foldbacks = replacements.filter(e => repair.events.find(opened => opened.kind === "c_call_opened" &&
      opened.aggregateId === e.aggregateId)?.payload.callClass === "workflow");
    assert.equal(physical.length, 1, "exactly one physical owner performs the selected replacement");
    assert.equal(foldbacks.length, 1, "the declared workflow conserves one child receipt");
    assert.equal(replacements.length, physical.length + foldbacks.length);
    assert.deepEqual(foldbacks[0].payload.value, physical[0].payload.value);
    const execution = kind(newEvents, "worksite_revision_command_execution_observation")[0]; assert.ok(execution);
    assert.equal(execution.payload.value.commandResults[0].exitStatus, 0);
    assert.equal(execution.payload.value.snapshotMembers.filter(m => m.source.kind === "retained_dependency").length, 2);
    const sharedMember = execution.payload.value.snapshotMembers.find(m => m.relativePath === "shared/lib.mjs"); assert.ok(sharedMember);
    assert.equal(sharedMember.source.kind, "retained_dependency"); assert.equal(sharedMember.source.origin.kind, "admitted_initial_job_bridge");
    assert.deepEqual(await readFile(sharedPath), sharedBytes); const sharedAfter = await lstat(sharedPath);
    assert.equal(sharedAfter.dev, sharedBefore.dev); assert.equal(sharedAfter.ino, sharedBefore.ino);
    assert.deepEqual(await inspectVerifier(), before, "unselected verifier bytes and physical identity are preserved");
    const final = kind(newEvents, "semantic_revision_envelope").at(-1).payload.value;
    const preserved = parentEvent.payload.value.assets.filter(a => a.stageRef !== evidenceStage.declarationRef);
    assert.deepEqual(final.current.assets.slice(0, preserved.length), preserved);
    assert.ok(final.revisionBasis.historicalAssets.some(a => product.sha256Canonical(a) ===
      product.sha256Canonical(parentEvent.payload.value.assets.at(-1))), "the old Evidence author is retained as history, not silently erased");
    assert.deepEqual(final.current.bindingVersions, parentEvent.payload.value.bindingVersions);
    assert.equal(final.current.assets.at(-1).assessment.disposition, "satisfied");
    assert.deepEqual(final.current.evidence.executionObservation, execution.payload.value);
    const reads = await readGenericJobThroughFreshPublic({ scratch: environment.scratch, installedRoot: environment.installedRoot,
      artifactPath: environment.artifactPath, call: repair.call, outcome: repair.outcome });
    await writeFile(join(environment.scratch, "generic-correction-proof.json"), JSON.stringify({ kind: "generic_job_native_correction_proof",
      paidCalls: 0, semanticQualification: false, scratch: environment.scratch, closeHandoff: closed,
      parent, causes, decision: coordinate(decision, selection.events), before, final, execution, readbackRoot: reads.outputRoot }, null, 2) + "\n", { flag: "wx" });
  } finally {
    if (previous === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND; else process.env.ABG_TS_CLAUDE_COMMAND = previous;
  }
});
