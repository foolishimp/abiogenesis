import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { readFile, writeFile, lstat, mkdir, mkdtemp } from "node:fs/promises";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import test from "node:test";
import * as Effect from "effect/Effect";
import { genericRevisionPublicationData, genericRevisionIds, observeGenericJobRevisionWorksite,
  readRetainedGenericRevisionBridge } from "../support/t287-generic-job-revision.mjs";
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

test("saved native revision bridge preserves revision discriminants and selected-retained ownership", {
  skip: !process.env.ABI5_GENERIC_JOB_REVISION_PREFIX_ROOT, timeout: 180000,
}, async () => {
  const [product, gtl, revision, preparation, meaning, origins] = await Promise.all([
    "product/index", "gtl/index", "abg/semantic_revision", "product/worksite_preparation", "product/semantic_job", "abg/worksite_revision",
  ].map(load));
  const saved = await readRetainedGenericRevisionBridge({ scratch: process.env.ABI5_GENERIC_JOB_REVISION_PREFIX_ROOT, packageRoot });
  const { basis, input } = saved, hash = product.sha256Canonical;
  const old = await import(pathToFileURL(join(saved.installedRoot, "build/code/src/abg/semantic_revision.js")).href);
  assert.equal(old.projectJobRevisionPreparation(basis, input), null, "actual installed owner retains the original bridge refusal");
  assert.equal(revision.semanticJobRevisionInputMatchesBasis(basis, input), true);
  const subject = revision.projectJobRevisionSubject(basis, input, true); assert.ok(subject, "all source, authority, origin and physical checks pass");
  const entry = revision.projectJobRevisionPreparation(basis, input); assert.ok(entry);
  assert.equal(entry.kind, "worksite_revision_command_preparation_input"); assert.equal(entry.schemaVersion, "5.0.0");
  assert.equal(Object.hasOwn(entry, "readDependencyBasis"), false, "initial-job read basis becomes authenticated retained origins, not a revision field");
  assert.deepEqual(preparation.admitWorksitePreparationInput(product.WORKSITE_REVISION_IDS.inputContractRef, entry), entry);
  assert.equal(revision.semanticJobRevisionResultMatchesBasis(basis, input, entry), true);
  const selected = preparation.selectWorksiteConstructionTask(entry);
  assert.deepEqual(selected.targets.map(t => t.subject.relativePath), ["app/main.mjs"]);
  assert.equal(product.isWorksiteConstructionTask(selected), true);
  assert.deepEqual(entry.dependencyObservations.map(row => row.subject.relativePath), ["app/check.mjs", "shared/lib.mjs"]);
  assert.deepEqual(entry.dependencyObservations.map(row => row.origin.kind), ["admitted_replacement", "admitted_initial_job_bridge"]);
  for (const row of entry.dependencyObservations) assert.equal(origins.worksiteRevisionOriginSurvives(subject.owner.prefix, row), true);
  const ordinary = meaning.deriveSemanticJobPreparation(input.current, subject.currentWorksite, { selectedPaths: ["app/main.mjs"],
    feedback: { selection: input.revisionBasis.selection, causes: subject.causes, historicalAssets: input.revisionBasis.historicalAssets } });
  assert.ok(ordinary);
  const { kind, schemaVersion, readDependencyBasis, ...configuration } = ordinary;
  const { kind: revisionKind, schemaVersion: revisionSchema, revisionBasisRef, revisionBasisDigest,
    snapshotTargetRefs, dependencyObservations, ...retainedConfiguration } = entry;
  assert.deepEqual(retainedConfiguration, configuration, "every meaningful configuration value survives the projection unchanged");
  assert.throws(() => preparation.constructWorksiteRevisionCommandPreparationInput({ ...configuration, kind, schemaVersion,
    revisionBasisRef, revisionBasisDigest, snapshotTargetRefs, dependencyObservations }), /invalid D2 worksite preparation input/,
    "ordinary carrier discriminant remains illegal at the unchanged strict revision constructor");
  assert.deepEqual(preparation.constructWorksiteRevisionCommandPreparationInput({ ...configuration,
    revisionBasisRef, revisionBasisDigest, snapshotTargetRefs, dependencyObservations }), entry);
  assert.deepEqual(snapshotTargetRefs, [...subject.priorWorksite.targets.map(row => row.target.targetRef),
    ...readDependencyBasis.members.map(row => row.sourceMemberRef)]);
  assert.throws(() => preparation.constructWorksiteRevisionCommandPreparationInput({ ...configuration,
    revisionBasisRef, revisionBasisDigest, snapshotTargetRefs: [...snapshotTargetRefs, snapshotTargetRefs[0]], dependencyObservations }), /invalid D2/);
  for (const mutate of [value => { value.current.job.members[0].base64 = Buffer.from("another ordinary job").toString("base64"); },
    value => { value.revisionBasis.request.selection.resultDigest = hash("crossed-selection"); },
    value => { value.current.worksite.targets[0].target.predecessorObservation.fileDigest = hash("changed-current-file"); }]) {
    const crossed = structuredClone(input); mutate(crossed);
    assert.equal(revision.projectJobRevisionPreparation(basis, crossed), null, "changed job, selection or observation cannot reuse admitted input");
  }
  const crossedOrigin = structuredClone(entry); crossedOrigin.dependencyObservations[1].origin.resultAdmissionEventRef = "event://unadmitted-read-origin";
  assert.equal(revision.semanticJobRevisionResultMatchesBasis(basis, input, crossedOrigin), false);
  const oldConstruction = saved.events.find(e => e.kind === "c_call_result_admitted" && product.isWorksiteConstructionResult(e.payload.value)).payload.value;
  const retention = preparation.constructRetainedWorksiteInput(product.worksiteRevisionRetentionBinding(), entry, oldConstruction);
  assert.throws(() => preparation.prepareWorksiteCommandTask(retention), /construction result does not cover original targets/,
    "an old two-target C1 cannot stand in for the still-unexecuted selected C1");
  assert.equal(revision.projectRevisionEvidenceInput(basis, entry), null, "a preparation is not an admitted revision C2 result");
  const repairWorksite = basis.declarationGraphFunctions.find(g => g.inputs[0] === product.WORKSITE_REVISION_IDS.inputContractRef &&
    g.outputs[0] === product.WORKSITE_REVISION_IDS.observationContractRef && g.template.nodes.length === 4); assert.ok(repairWorksite);
  assert.deepEqual(repairWorksite.template.edges[1].inputBinding, product.worksiteRevisionRetentionBinding());
  assert.ok(basis.declarationGraphFunctions.some(g => g.inputs[0] === product.WORKSITE_REVISION_IDS.observationContractRef &&
    g.outputs[0] === gtl.SEMANTIC_REVISION_IDS.envelopeContractRef), "declared Evidence consumes revision observation, not ordinary C2");
  assert.deepEqual(await readFile(saved.eventLogPath), saved.originalBytes, "all retained event bytes remain unchanged");
  console.log(JSON.stringify({ scope: "saved-prefix owner reconstruction, not admission or execution", selectedOrdinal: saved.selected.admissionOrdinal,
    cut: saved.cut.coordinateDigest, oldRefusal: true, repairedCarrier: revisionKind, selectedPaths: selected.targets.map(t => t.subject.relativePath),
    retainedPaths: dependencyObservations.map(row => row.subject.relativePath), retainedOrigins: dependencyObservations.map(row => row.origin.kind),
    configurationConserved: true, downstreamNativeExecution: "unexecuted", paidCalls: 0 }));
});

test("saved revision Evidence separates historical origins from checked successor state", {
  skip: !process.env.ABI5_GENERIC_JOB_REVISION_EVIDENCE_PREFIX_ROOT, timeout: 600000,
}, async t => {
  const [product, revision, meaning, assembly, implementation, origins] = await Promise.all([
    "product/index", "abg/semantic_revision", "product/semantic_revision", "abg/instruction_assembly",
    "implementation/semantic_revision", "abg/worksite_revision",
  ].map(load));
  const saved = await readRetainedGenericRevisionBridge({ scratch: process.env.ABI5_GENERIC_JOB_REVISION_EVIDENCE_PREFIX_ROOT,
    packageRoot, role: "author" });
  const { basis, input, owner } = saved, hash = product.sha256Canonical;
  const old = await import(pathToFileURL(join(saved.installedRoot, "build/code/src/abg/instruction_assembly.js")).href);
  assert.equal(old.evaluateNativeInstructionAssembly(basis, input).cause, "stale_basis", "the actual frozen owner retains its historical refusal");
  assert.equal(revision.semanticJobRevisionInputMatchesBasis(basis, input), true);
  const subject = revision.projectJobRevisionSubject(basis, input, true); assert.ok(subject);
  const observation = input.current.evidence.executionObservation;
  assert.deepEqual(subject.currentWorksite.targets.map(row => row.target.subject.relativePath), ["app/main.mjs", "app/check.mjs"]);
  assert.notDeepEqual(subject.currentWorksite.targets[0].target.predecessorObservation, input.current.worksite.targets[0].target.predecessorObservation);
  assert.deepEqual(subject.currentWorksite.targets[1], input.current.worksite.targets[1], "retained verifier has no invented successor");
  for (const [ordinal, row] of subject.currentWorksite.targets.entries()) {
    const source = observation.task.snapshotSources.find(s => s.subject.subjectRef === row.target.subject.subjectRef);
    assert.deepEqual(row.target.predecessorObservation, source.observation);
    assert.equal(origins.worksiteRevisionOriginSurvives(owner.prefix, { subject: row.target.subject,
      observation: row.target.predecessorObservation, origin: subject.origins[ordinal] }), true);
  }
  assert.equal(origins.worksiteExecutionSourcesCurrent(owner.prefix, observation.task), true);
  assert.equal(origins.worksiteRevisionPhysicalMatches(input.current.worksite), false, "pre-repair main is genuinely stale");
  const exact = assembly.requireNativeInstructionAssembly(basis, input);
  assert.deepEqual(exact.envelope.sections.worksite.currentRevisionTargets.map(row => row.target.predecessorObservation),
    subject.currentWorksite.targets.map(row => row.target.predecessorObservation));
  assert.equal(exact.envelope.sections.worksite.observationRole, "historical_pre_construction_context");
  assert.deepEqual(exact.envelope.sections.worksite.observation.entries.map(({ textView, ...row }) => row), input.current.context.entries);
  const roots = [subject.currentWorksite.workspaceAuthorityBasis.canonicalRoot, observation.provenance.helperPlan.sandboxRoot];
  const originals = { readFileSync: fs.readFileSync, lstatSync: fs.lstatSync, realpathSync: fs.realpathSync };
  let forbiddenReads = 0;
  try {
    for (const name of Object.keys(originals)) t.mock.method(fs, name, (path, ...args) => {
      if (typeof path === "string" && roots.some(root => path === root || path.startsWith(root + "/"))) {
        forbiddenReads++; throw new Error("cold reconstruction cannot read workspace or C2 snapshot");
      }
      return originals[name](path, ...args);
    });
    syncBuiltinESMExports();
    assert.deepEqual(assembly.constructNativeInstructionAssembly(basis, input), exact);
    assert.equal(forbiddenReads, 0, "cold request rederivation uses admitted artifact bytes only");
  } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
  const disposable = await mkdtemp(join(tmpdir(), "abi-revision-physical-drift-"));
  for (const [ordinal, source] of observation.task.snapshotSources.entries()) {
    const actual = resolve(subject.currentWorksite.workspaceAuthorityBasis.canonicalRoot, source.subject.relativePath);
    const copy = join(disposable, String(ordinal) + ".mjs");
    await writeFile(copy, Buffer.concat([await readFile(actual), Buffer.from("\n// unexplained changed bytes\n")]), { flag: "wx" });
    try {
      t.mock.method(fs, "readFileSync", (path, ...args) => originals.readFileSync(path === actual ? copy : path, ...args));
      syncBuiltinESMExports();
      assert.throws(() => assembly.requireNativeInstructionAssembly(basis, input), /stale_basis/,
        `physical mode refuses ${source.subject.relativePath} drift; only disposable bytes are changed`);
    } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
  }
  for (const mutate of [v => { v.current.evidence.executionResultDigest = hash("crossed-execution"); },
    v => { v.current.evidence.artifacts[0].base64 = Buffer.from("unadmitted successor").toString("base64"); }]) {
    const changed = structuredClone(input); mutate(changed);
    assert.equal(revision.projectJobRevisionSubject(basis, changed, false), null);
  }
  // There is no admitted post-repair actor exchange in this saved prefix.
  // Exercise the existing preparation/completion and Product suffix without
  // pretending that these counterfactual candidates have native admission.
  const previous = input.revisionBasis.historicalAssets.findLast(a => a.stageRef === owner.stage.declarationRef); assert.ok(previous);
  const prepared = implementation.realizeSemanticRevisionAuthor(input, { semanticStageBasis: basis, cCallRef: owner.call.cCallRef });
  assert.deepEqual(prepared.workerRequest, exact.request);
  const candidate = prepared.complete({ request: exact.request, observation: { disposition: "success", toolCallCount: 0,
    promptDigest: exact.manifest.promptDigest, inputDigest: owner.inputDigest, implementationRef: owner.call.implementationRef,
    actorRef: exact.request.actorRef, workerBindingRef: exact.request.workerBindingRef, transportLane: exact.request.transportLane,
    finalOutput: JSON.stringify(previous.candidate), actorInvocationRef: "actor-invocation://counterfactual/revision-author",
    transportDigest: hash("unadmitted diagnostic transport") } });
  assert.equal(candidate.disposition, "success"); const authored = candidate.resultCandidate;
  assert.equal(revision.semanticJobRevisionResultMatchesBasis(basis, input, authored), true, "pure author result relation");
  assert.equal(assembly.semanticInstructionResultMatches(basis, input, authored), false, "no native transport evidence was invented");
  assert.equal(revision.semanticJobRevisionInputMatchesBasis(basis, authored), false, "enriched input cannot borrow the author's admission");
  const raw = { kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0",
    criteria: owner.stage.rubric.map(criterion => ({ criterionRef: criterion.criterionRef, disposition: "satisfied",
      explanation: "Counterfactual Product relation only, not an admitted assessor.",
      sourceQuotes: previous.candidate.asset.statements[0].sourceQuotes,
      statementRefs: authored.current.assets.at(-1).candidate.asset.statements.map(row => row.statementRef) })), pressure: [] };
  const source = { cCallRef: "c-call://counterfactual/revision-assessor", inputDigest: hash(authored),
    actorInvocationRef: "actor-invocation://counterfactual/revision-assessor", promptDigest: hash("unassembled assessor request"),
    transportDigest: hash("unadmitted assessor transport") };
  const assessed = meaning.deriveJobRevisionAssessment(authored, owner.stage.declarationRef, raw, source); assert.ok(assessed);
  assert.equal(assessed.current.assets.at(-1).assessment.disposition, "satisfied");
  assert.deepEqual(assessed.current.assets.slice(0, -1), input.current.assets);
  assert.deepEqual(assessed.current.bindingVersions, input.current.bindingVersions);
  assert.deepEqual(assessed.revisionBasis, input.revisionBasis); assert.deepEqual(assessed.current.evidence, input.current.evidence);
  const wrongDomain = structuredClone(raw);
  wrongDomain.criteria[0].statementRefs = [authored.current.assets[0].candidate.asset.statements[0].statementRef];
  assert.equal(meaning.deriveJobRevisionAssessment(authored, owner.stage.declarationRef, wrongDomain, source), null);
  const selectionOrdinal = saved.events.find(e => e.eventId === input.revisionBasis.request.selection.resultAdmissionEventRef).admissionOrdinal;
  const outputs = saved.events.filter(e => e.admissionOrdinal > selectionOrdinal && e.kind === "c_call_result_admitted" && e.payload.value?.kind === "worksite_file_replace_output");
  assert.equal(outputs.filter(e => saved.events.find(o => o.kind === "c_call_opened" && o.aggregateId === e.aggregateId).payload.callClass === "leaf").length, 1);
  assert.equal(outputs.filter(e => saved.events.find(o => o.kind === "c_call_opened" && o.aggregateId === e.aggregateId).payload.callClass === "workflow").length, 1);
  assert.deepEqual(outputs[0].payload.value, outputs[1].payload.value);
  assert.deepEqual(await readFile(saved.eventLogPath), saved.originalBytes);
  for (const row of observation.task.snapshotSources) {
    const path = resolve(subject.currentWorksite.workspaceAuthorityBasis.canonicalRoot, row.subject.relativePath), stat = await lstat(path);
    assert.equal(product.sha256Bytes(await readFile(path)), row.observation.fileDigest);
    assert.equal(`${stat.dev}:${stat.ino}`, row.observation.fileIdentity, "retained workspaces were never mutated");
  }
});

test("native correction consumes an actual failed verifier and preserves the unselected file", {
  timeout: 7200000, skip: process.env.ABI5_GENERIC_JOB_CORRECTION_NATIVE !== "1" }, async () => {
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
