import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import Ajv from "ajv";
import test from "node:test";
import { genericLifecyclePublicationData, installGenericJobTransport } from "../support/t287-generic-job-lifecycle.mjs";
import { ordinaryJob } from "../support/t287-generic-job-intake.mjs";
const root = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..");
const load = name => import(pathToFileURL(join(root, "build/code/src", name + ".js")).href);
const [product, gtl, meaning] = await Promise.all(["product/index", "gtl/index", "product/semantic_job"].map(load));
const hash = product.sha256Canonical, zeros = "sha256:" + "0".repeat(64);
const artifact = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: zeros, productContentDigest: zeros, productManifestDigest: zeros };
const abiPublication = gtl.constructSemanticStageModulePublication(artifact);
const declaration = genericLifecyclePublicationData({ product, gtl, abiPublication }).semanticJobLifecycle;
const text = "Build an application that prints Hello World. Preserve the independent verifier.";
const job = ordinaryJob(product, gtl, text);
const coordinate = { invocationAdmissionRef: "component-only:invocation", rootExecutionBasisRef: "component-only:root",
  rootInputRef: "component-only:input", rootInputDigest: hash(job), intakeCCallRef: "component-only:intake", intakeCCallDigest: hash("intake"),
  intakeExecutionBasisRef: "component-only:child" };
const empty = () => product.constructSemanticJobEnvelope(job, declaration, coordinate);
const source = (name, input) => ({ cCallRef: "component-only:" + name, inputDigest: hash(input), actorInvocationRef: "component-only:" + name,
  promptDigest: hash("prompt:" + name), transportDigest: hash("transport:" + name) });
function candidate(envelope, stage, proposal) {
  const q = { memberRef: job.members[0].memberRef, quote: text };
  return { kind: "semantic_job_asset_candidate", schemaVersion: "5.0.0", asset: { kind: "semantic_stage_asset_candidate", schemaVersion: "5.0.0",
    statements: [{ statementRef: stage.declarationRef + "/s", text, modality: "supporting", sourceQuotes: [q], requirementRefs: [], obligationRefs: [],
      predecessorStatementRefs: envelope.assets.flatMap(a => a.candidate.asset.statements.map(s => s.statementRef)) }],
    requirementCandidates: proposal === undefined ? [] : [{ candidateRef: "candidate://greeting", meaning: text, parentRequirementRefs: [], sourceQuotes: [q] }],
    worksiteDesign: null, pressure: [] }, bindings: proposal === undefined ? [] : [proposal], design: null };
}
function assessment(authored, stage) {
  return { kind: "semantic_stage_assessment_candidate", schemaVersion: "5.0.0", criteria: stage.rubric.map(r => ({ criterionRef: r.criterionRef,
    disposition: "satisfied", explanation: "Mechanical owner test, not semantic acceptance", sourceQuotes: [{ memberRef: job.members[0].memberRef, quote: text }],
    statementRefs: authored.assets.at(-1).candidate.asset.statements.map(s => s.statementRef) })), pressure: [] };
}
function beforeRequirements() {
  let envelope = empty();
  for (const [i, stage] of declaration.stages.slice(0, 2).entries()) {
    const authored = product.deriveSemanticJobAsset(envelope, stage.declarationRef, candidate(envelope, stage), source("author" + i, envelope)); assert.ok(authored);
    envelope = product.deriveSemanticJobAssessment(authored, stage.declarationRef, assessment(authored, stage), source("assessor" + i, authored)); assert.ok(envelope);
  }
  return envelope;
}
const proposal = { requirement: { kind: "candidate", ref: "candidate://greeting" }, previousVersionRef: null,
  templateRef: declaration.proofTemplates[0].templateRef, scope: "Current ordinary source", realizationMeaning: ["Actual application"],
  proofMeaning: ["Actual verifier and observed command"], unprovedScope: ["Semantic acceptance"], closureRule: "Non-closing", requiredContent: ["Actual bytes"] };

test("generic declaration bytes stay fixed while ordinary job identities and source spans differ", () => {
  const second = ordinaryJob(product, gtl, "Build an integer-addition command-line application.");
  assert.notEqual(hash(job), hash(second));
  assert.deepEqual(genericLifecyclePublicationData({ product, gtl, abiPublication }).semanticJobLifecycle, declaration);
  const envelope = empty(); assert.equal(envelope.kind, abiPublication.contracts.find(c => c.contractRef === gtl.SEMANTIC_STAGE_IDS.envelopeContractRef).valueKind);
  assert.equal(product.isSemanticStageEnvelope(envelope), false, "closed job arm does not relax legacy fixed shape");
  assert.equal(meaning.groundSemanticJobQuote(envelope, { memberRef: job.members[0].memberRef, quote: text }).startByte, 0);
  assert.equal(meaning.groundSemanticJobQuote(envelope, { memberRef: job.members[0].memberRef, quote: "invented" }), null);
  assert.equal(product.isSemanticJobEnvelope({ ...envelope, job: second }), false);
});

test("saved native Design-to-plan counterexample uses the assessor result coordinate, not a cursor value digest", {
  skip: !process.env.ABI5_GENERIC_JOB_FAILED_PARENT_ROOT }, async () => {
  const scratch = process.env.ABI5_GENERIC_JOB_FAILED_PARENT_ROOT;
  const [outcome, invocation] = await Promise.all(["full-outcome.json", "full-call.json"].map(async name => JSON.parse(await readFile(join(scratch, name), "utf8"))));
  const [store, prefixes, executions, calls, cursors, traversal, jobs] = await Promise.all([
    "abg/event_store", "abg/event_prefix", "abg/execution_basis", "abg/c_call", "abg/traversal_cursor", "hog/traversal", "abg/semantic_job"].map(load));
  const full = outcome.resources.eventResource.closeHandoff.prefix, events = store.readRuntimeEventsAtDurablePrefix(full);
  const selected = events.find(e => e.kind === "c_call_fibre_selected" && e.payload.implementationRef === gtl.SEMANTIC_STAGE_IDS.jobPlanImplementationRef);
  assert.ok(selected);
  const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === selected.aggregateId); assert.ok(opened);
  const lines = (await readFile(fileURLToPath(full.eventLogRef))).subarray(0, full.prefixLength).toString("utf8").split("\n");
  const bytes = Buffer.from(lines.slice(0, selected.admissionOrdinal).join("\n") + "\n");
  const coordinate = { kind: "durable_prefix_coordinate", schemaVersion: "5.0.0", eventLogRef: full.eventLogRef,
    prefixLength: bytes.length, prefixDigest: product.sha256Bytes(bytes), storeIdentity: full.storeIdentity };
  const durable = { ...coordinate, coordinateDigest: hash(coordinate) }, before = store.readRuntimeEventsAtDurablePrefix(durable);
  const prefix = prefixes.selectValidatedRuntimeEventPrefix(before), execution = executions.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(execution);
  const publications = invocation.resources.catalog.boundPublications, publication = publications.find(p => p.programs.some(p => p.programRef === execution.programRef));
  const declarationGraphFunctions = publications.flatMap(p => p.graphFunctions), graphFunction = declarationGraphFunctions.find(g => g.name === execution.graphFunctionRef);
  const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
    admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
  const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
  const entered = before.find(e => e.kind === "traversal_cursor_entered" && e.basisId === opened.basisId && e.graphCallId === opened.graphCallId), cp = entered.payload;
  let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
    traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
    graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
    position: "at_term", termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
  if (cursor.cursorDigest !== opened.payload.cursorDigest) cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  const basis = { publication, lifecyclePublication: publication, sourcePublication: publication, graph, graphFunction,
    declarationGraphFunctions, executionBasis: execution, cCall, cursor, predecessorPrefix: durable };
  const authenticated = jobs.authenticateSemanticJobBasis(basis); assert.ok(authenticated);
  const oldRequest = events.find(e => e.kind === "c_call_result_admitted" && e.aggregateId === opened.aggregateId).payload.value;
  const previous = await import(pathToFileURL(join(scratch, "consumer/node_modules/@abiogenesis/typescript-tenant/build/code/src/abg/semantic_job.js")).href);
  assert.deepEqual(await previous.projectSemanticJobPlan(basis, execution.rawInputValue), oldRequest, "actual previous owner reproduces its exact faulty request");
  const repaired = await jobs.projectSemanticJobPlan(basis, execution.rawInputValue); assert.ok(repaired);
  const assessor = before.find(e => e.kind === "c_call_result_admitted" && e.payload.resultRef === repaired.sourceEnvelopeRef);
  assert.ok(assessor); assert.equal(repaired.sourceEnvelopeDigest, assessor.payload.resultDigest);
  assert.ok(before.some(e => e.kind === "c_call_fibre_selected" && e.aggregateId === assessor.aggregateId &&
    e.payload.implementationRef === gtl.SEMANTIC_STAGE_IDS.assessorImplementationRef));
  assert.equal(hash(assessor.payload.value), hash(execution.rawInputValue));
  assert.notEqual(repaired.sourceEnvelopeRef, oldRequest.sourceEnvelopeRef);
  assert.notEqual(repaired.sourceEnvelopeDigest, oldRequest.sourceEnvelopeDigest);
  assert.deepEqual(repaired.targets, oldRequest.targets); assert.deepEqual(repaired.ancestorObservations, oldRequest.ancestorObservations);
  assert.equal(jobs.validateWorksiteFileParentsPlanAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(events), oldRequest, publication), false);
  assert.equal(jobs.validateWorksiteFileParentsPlanAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(events), repaired, publication), false,
    "a counterfactual repaired plan has not been admitted into the frozen failed history");

  // This existing C2 owner is the native plan's pure pre-effect guard. The
  // actual saved Design supplies its A/W and subjects; changed configurations
  // below are counterexamples, not fabricated admitted Design occurrences.
  const c2 = await load("product/worksite_command_execution"), design = execution.rawInputValue.assets.at(-1).candidate.design;
  const config = { workspaceAuthorityBasis: repaired.workspaceAuthorityBasis, workspaceBinding: authenticated.environment.workspaceBinding,
    commands: design.commands, outcomePredicates: design.outcomePredicates,
    protectedSubjects: repaired.targets.map(target => {
      const value = product.constructWorksiteSubject({ workspaceAuthorityBasis: repaired.workspaceAuthorityBasis,
        workspaceBinding: authenticated.environment.workspaceBinding, relativePath: target.relativePath,
        subjectUri: pathToFileURL(resolve(repaired.workspaceAuthorityBasis.canonicalRoot, target.relativePath)).href });
      assert.equal(value.kind, "worksite_subject"); return value;
    }), allowedWriteTerritories: execution.rawInputValue.job.worksiteScope.evidenceWriteRoots.map(relativePath => ({ pathKind: "subtree", relativePath })) };
  assert.doesNotThrow(() => c2.constructWorksiteCommandConfiguration(config));
  const view = c2.worksiteCommandConfigurationInputSchema();
  const designView = meaning.semanticJobWorkerResultSchema("author", ["worksite_design"]).properties.design.anyOf[0].properties;
  assert.deepEqual(designView.commands, view.commands); assert.deepEqual(designView.outcomePredicates, view.outcomePredicates);
  const validate = new Ajv({ strict: false }).compile({ type: "object", additionalProperties: false,
    required: ["commands", "outcomePredicates"], properties: view });
  assert.equal(validate({ commands: config.commands, outcomePredicates: config.outcomePredicates }), true);
  const validPredicates = [{ predicateId: "component:exit", predicateKind: "process_exit",
    declaration: { validationCommandId: config.commands[0].commandId, equals: 0 } }];
  assert.equal(validate({ commands: config.commands, outcomePredicates: validPredicates }), true);
  assert.doesNotThrow(() => c2.constructWorksiteCommandConfiguration({ ...config, outcomePredicates: validPredicates }));
  const command = config.commands[0], http = { predicateId: "component:http", predicateKind: "http_response_exact",
    declaration: { validationCommandId: command.commandId, body: "component-only", status: 200,
      launch: { executable: command.executable, relativeCwd: command.relativeCwd, environment: command.environment,
        args: [c2.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],
        portFile: { relativePath: config.allowedWriteTerritories[0].relativePath + "/port.txt" },
        timeoutMs: command.timeoutMs, terminationGraceMs: command.terminationGraceMs },
      request: { hostname: "127.0.0.1", method: "GET", path: "/", timeoutMs: 100 } } };
  const httpDesign = { ...design, outcomePredicates: [http] };
  assert.equal(validate({ commands: config.commands, outcomePredicates: [http] }), true);
  assert.doesNotThrow(() => c2.constructWorksiteCommandConfiguration({ ...config, outcomePredicates: [http] }));
  assert.equal(meaning.semanticJobDesignMatches(execution.rawInputValue, httpDesign), true);
  const capability = execution.rawInputValue.job.worksiteScope.executableCapabilities.find(c => c.executable === command.executable);
  for (const [label, mutate] of [
    ["nested executable", launch => launch.executable = "ungranted-executable"],
    ["nested working directory", launch => launch.relativeCwd = "../outside"],
    ["nested timeout", launch => launch.timeoutMs = capability.maxTimeoutMs + 1],
    ["nested grace", launch => launch.terminationGraceMs = capability.maxTerminationGraceMs + 1],
    ["nested environment", launch => launch.environment = { UNGRANTED: "value" }],
  ]) {
    const changed = structuredClone(httpDesign); mutate(changed.outcomePredicates[0].declaration.launch);
    assert.equal(meaning.semanticJobDesignMatches(execution.rawInputValue, changed), false, label);
  }
  for (const [label, mutate, schemaRefuses] of [
    ["zero grace", c => c.commands[0].terminationGraceMs = 0, true],
    ["grace equals timeout", c => c.commands[0].terminationGraceMs = c.commands[0].timeoutMs, false],
    ["unknown predicate", c => c.outcomePredicates[0].predicateKind = "invented", true],
    ["wrong predicate shape", c => c.outcomePredicates[0].declaration = {}, true],
    ["unknown command reference", c => c.outcomePredicates[0].declaration.validationCommandId = "unselected", false],
    ["unprotected module", c => c.outcomePredicates[0] = { predicateId: "component:module", predicateKind: "module_export_return_exact",
      declaration: { path: "outside.mjs", export: "answer", equals: null } }, false],
  ]) {
    const changed = structuredClone({ ...config, outcomePredicates: validPredicates }); mutate(changed);
    assert.throws(() => c2.constructWorksiteCommandConfiguration(changed), TypeError, label);
    if (schemaRefuses) assert.equal(validate({ commands: changed.commands, outcomePredicates: changed.outcomePredicates }), false, label);
  }
});

test("binding activation follows independent assessment; strict quote/domain/identity refusals remain", () => {
  const input = beforeRequirements(), stage = declaration.stages[2], raw = candidate(input, stage, proposal);
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("requirements-author", input)); assert.ok(authored);
  assert.equal(authored.bindingVersions.length, 0, "an author proposal is not active binding truth");
  const good = assessment(authored, stage), assessor = source("requirements-assessor", authored);
  const assessed = product.deriveSemanticJobAssessment(authored, stage.declarationRef, good, assessor); assert.ok(assessed);
  const version = assessed.bindingVersions[0]; assert.equal(version.introducingAssetRef, authored.assets.at(-1).assetRef);
  assert.deepEqual(version.assessmentSource, assessor); assert.equal(version.ordinal, 0);
  assert.deepEqual(product.projectSemanticJobBindings(assessed), [version]);
  for (const mutate of [x => x.criteria[0].statementRefs.push(input.assets[0].candidate.asset.statements[0].statementRef),
    x => x.criteria[0].sourceQuotes[0].quote = "invented", x => x.criteria[0].criterionRef = "wrong"]) {
    const changed = structuredClone(good); mutate(changed);
    assert.equal(product.deriveSemanticJobAssessment(authored, stage.declarationRef, changed, assessor), null);
  }
  assert.equal(product.deriveSemanticJobAssessment(authored, stage.declarationRef, good, authored.assets.at(-1).source), null);
  const unknown = structuredClone(good); unknown.criteria[0].disposition = "indeterminate";
  assert.equal(product.deriveSemanticJobAssessment(authored, stage.declarationRef, unknown, assessor).bindingVersions.length, 0);
  assert.deepEqual(product.projectSemanticJobBindings({ ...assessed, bindingVersions: [version, structuredClone(version)] }), [version]);
  const conflict = structuredClone(version); conflict.policy.scope = "changed";
  assert.equal(product.projectSemanticJobBindings({ ...assessed, bindingVersions: [version, conflict] }), null);
});

test("assessed explicit supersession selects one current version and preserves old binding bytes", () => {
  const input = beforeRequirements(), stage = declaration.stages[2];
  const authored = product.deriveSemanticJobAsset(input, stage.declarationRef, candidate(input, stage, proposal), source("old-author", input));
  const assessed = product.deriveSemanticJobAssessment(authored, stage.declarationRef, assessment(authored, stage), source("old-assessor", authored));
  const old = assessed.bindingVersions[0], retained = assessed.assets.at(-1).groundedTerms;
  // Component projection of D2's retained history; no ABG/current-workspace claim.
  const revisedInput = { ...assessed, assets: input.assets };
  const raw = candidate(revisedInput, stage); raw.bindings = [{ ...proposal, requirement: { kind: "existing", ref: old.binding.requirementRef },
    previousVersionRef: old.versionRef, scope: "Refined proof of the same ordinary source" }];
  const revised = product.deriveSemanticJobAsset(revisedInput, stage.declarationRef, raw, source("new-author", revisedInput), retained); assert.ok(revised);
  const final = product.deriveSemanticJobAssessment(revised, stage.declarationRef, assessment(revised, stage), source("new-assessor", revised), retained); assert.ok(final);
  assert.deepEqual(final.bindingVersions[0], old); assert.equal(final.bindingVersions.length, 2);
  assert.deepEqual(product.projectSemanticJobBindings(final), [final.bindingVersions[1]]);
  assert.equal(final.bindingVersions[1].previousVersionRef, old.versionRef);
  assert.equal(final.bindingVersions[1].binding.obligationRef, old.binding.obligationRef);
  const fork = structuredClone(raw); fork.bindings[0].previousVersionRef = "stale";
  const forked = product.deriveSemanticJobAsset(revisedInput, stage.declarationRef, fork, source("fork-author", revisedInput), retained); assert.ok(forked);
  assert.equal(product.deriveSemanticJobAssessment(forked, stage.declarationRef, assessment(forked, stage), source("fork-assessor", forked), retained), null);
});

test("corrected disclosed double satisfies retained Requirements and downstream component response contracts", {
  skip: !process.env.ABI5_GENERIC_JOB_FAILED_FULL_ROOT }, async () => {
  const scratch = process.env.ABI5_GENERIC_JOB_FAILED_FULL_ROOT;
  const outcome = JSON.parse(await readFile(join(scratch, "full-outcome.json"), "utf8"));
  const store = await load("abg/event_store"), events = store.readRuntimeEventsAtDurablePrefix(outcome.resources.eventResource.closeHandoff.prefix);
  const binding = events.findLast(e => e.kind === "actor_transport_binding_admitted"); assert.ok(binding);
  const saved = binding.payload.instructionAssembly, failed = events.find(e => e.kind === "actor_result_artifact_observed" && e.payload.transportBindingRef === binding.payload.transportBindingRef);
  assert.equal(failed.payload.failureClass, "contract_failure");
  assert.equal(meaning.isSemanticJobAssetCandidate(JSON.parse(failed.payload.finalOutput)), false, "original malformed candidate stays refused");
  const basis = events.find(e => e.kind === "basis_admitted" && e.payload.basisRef === saved.envelope.executionBasisRef);
  assert.ok(basis); const input = basis.payload.rawInputValue;
  assert.ok(product.isSemanticJobEnvelope(input));
  const stage = input.declaration.stages.find(s => s.declarationRef === saved.envelope.sections.task.stageRef); assert.ok(stage);
  const temporary = await mkdtemp(join(tmpdir(), "generic-job-double-contract-")), command = await installGenericJobTransport(temporary);
  const output = spawnSync(process.execPath, [command, "--json-schema", JSON.stringify(saved.request.responseJsonSchema)],
    { input: saved.request.prompt, encoding: "utf8", maxBuffer: 1048576 });
  assert.equal(output.status, 0, output.stderr);
  const raw = JSON.parse(JSON.parse(output.stdout.trim().split("\n").at(-1)).result);
  assert.ok(meaning.isSemanticJobAssetCandidate(raw));
  const result = product.deriveSemanticJobAsset(input, stage.declarationRef, raw, source("retained-component-only", input));
  assert.ok(result, "existing Product owner accepts corrected candidate with this actual incoming value");
  assert.equal(result.bindingVersions.length, 0);
  assert.equal(result.assets.at(-1).groundedTerms.length, 1);

  // Component response-shape preflight only: these sections do not stand in
  // for native assembly, event admission, observation or semantic acceptance.
  const respond = (sections, role, selectedStage) => {
    const schema = meaning.semanticJobWorkerResultSchema(role, selectedStage.bodyCapabilities);
    const prompt = Object.entries(sections).map(([name, value]) => `## ${name}\n${JSON.stringify(value)}`).join("\n\n");
    const response = spawnSync(process.execPath, [command, "--json-schema", JSON.stringify(schema)],
      { input: prompt, encoding: "utf8", maxBuffer: 1048576 });
    assert.equal(response.status, 0, response.stderr);
    return JSON.parse(JSON.parse(response.stdout.trim().split("\n").at(-1)).result);
  };
  const sectionsFor = (envelope, selectedStage) => ({ ...saved.envelope.sections,
    predecessors: envelope.assets,
    obligations: { ...saved.envelope.sections.obligations, activeBindings: product.projectSemanticJobBindings(envelope) },
    task: { ...saved.envelope.sections.task, stageRef: selectedStage.declarationRef, bodyCapabilities: selectedStage.bodyCapabilities,
      rubric: selectedStage.rubric } });
  const requirements = product.deriveSemanticJobAssessment(result, stage.declarationRef,
    respond(sectionsFor(result, stage), "assessor", stage), source("component-req-assessor", result));
  assert.ok(requirements); assert.equal(requirements.bindingVersions.length, 1);
  const designStage = requirements.declaration.stages.find(s => s.bodyCapabilities.includes("worksite_design"));
  const designRaw = respond(sectionsFor(requirements, designStage), "author", designStage);
  const design = product.deriveSemanticJobAsset(requirements, designStage.declarationRef, designRaw, source("component-design-author", requirements));
  assert.ok(design, "actual Design owner accepts the double's complete target/command shape");
  const assessed = product.deriveSemanticJobAssessment(design, designStage.declarationRef,
    respond(sectionsFor(design, designStage), "assessor", designStage), source("component-design-assessor", design));
  assert.ok(assessed); assert.equal(assessed.assets.at(-1).assessment.disposition, "satisfied");
  const environmentOwner = await load("abg/environment_admission");
  const environment = environmentOwner.projectExactPrefixWorkspaceEnvironment(saved.envelope.predecessorPrefix,
    { ref: basis.payload.workspaceBindingId, digest: basis.payload.workspaceBindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const capabilityGrant = events.find(e => e.kind === "invocation_admitted" && e.payload.invocationAdmissionRef === basis.payload.invocationAdmissionRef)
    .payload.capabilityGrants[0];
  const operating = { workspaceAuthorityBasis: environment.workspaceAuthorityBasis, workspaceBinding: environment.workspaceBinding, capabilityGrant };
  const worksiteEffects = await load("product/worksite_effect");
  const targets = designRaw.design.targets.map(row => {
    const subject = product.constructWorksiteSubject({ ...operating, relativePath: row.relativePath,
      subjectUri: pathToFileURL(resolve(operating.workspaceAuthorityBasis.canonicalRoot, row.relativePath)).href });
    assert.equal(subject.kind, "worksite_subject");
    const territory = product.constructWorksiteTerritory({ ...operating, relativeRoot: "app",
      territoryUri: pathToFileURL(resolve(operating.workspaceAuthorityBasis.canonicalRoot, "app")).href });
    assert.equal(territory.kind, "worksite_territory");
    const predecessorObservation = worksiteEffects.constructWorksiteObservation({ subject, state: "absent" });
    const task = product.constructWorksiteConstructionTask({ ...operating, prompt: "component shape only", targets: [{ subject, territory, predecessorObservation }] });
    return { target: task.targets[0], base64: "", role: row.role };
  });
  const preparation = product.deriveSemanticJobPreparation(assessed, { ...operating, targets,
    commands: designRaw.design.commands, outcomePredicates: designRaw.design.outcomePredicates,
    allowedWriteTerritories: assessed.job.worksiteScope.evidenceWriteRoots.map(relativePath => ({ pathKind: "subtree", relativePath })) });
  assert.ok(preparation, "existing preparation owner forms the C1 task from these bounded component coordinates");
  const task = preparation.constructionTask;
  const c1 = spawnSync(process.execPath, [command, "--json-schema", JSON.stringify(product.worksiteConstructionWorkerResultSchema(task))],
    { input: task.prompt, encoding: "utf8", maxBuffer: 1048576 });
  assert.equal(c1.status, 0, c1.stderr);
  const c1Raw = JSON.parse(JSON.parse(c1.stdout.trim().split("\n").at(-1)).result);
  assert.ok(product.constructWorksiteConstructionWorkerResult(task, c1Raw));
  assert.equal(c1Raw.files.length, 2);
});
