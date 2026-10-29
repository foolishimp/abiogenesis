// T-287 Phase D, D5-c item 5: the dispatch path of the native qualification of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1, and its dry mode.
//   live  (authored, not run in D5-c) the observed C2 of the recipe (run.invoke start of
//         program://abiogenesis/worksite/command-execution@5 over the observed task, provider lane); the C2 Result's
//         two compact entries (its execution entry and its verification material entry, RP-1 P1); the assessment plan
//         over the re-packed slots with its gates; assess@5 per slot in plan
//         order, sequentially (the durable event sink holds one exclusive append lock, abg/event_store.ts:1594-1597);
//         each judgment's construction attribution checked; for an insufficient attribution, the owner's acknowledgment
//         requested through ruling@5 (F_H), one request per provenance view, and the run stopped until the owner
//         responds (the resume over the owner's responses is not authored in D5-c); the self-conformance leaf (F11)
//         over the plan, the judgment, execution and ruling selections and the verification selection; the sole AF22
//         verdict over the F11 Result; the cold reads in a fresh process (the driver's cold-reads mode).
//   dry   the same inputs rendered and admitted in process before any provider spawn: every slot rendered by the
//         installed renderer, every C call's start call admitted by the installed run invocation preparation
//         (ProductRunInvocationPort.prepare) and its input by the Program's input contract (admitInstalledProductInput);
//         the inputs that exist only after a dispatch (the C2 Result, the judgments, the F11 Result) carry the item 3
//         stand-in or placeholder coordinates, marked as such; ends undispatched.
// Calls that carry the qualification resources are dispatched in process (installed-qualification-conservation.mjs
// invoke): the CLI transport would serialize the whole resource assertion into every request file.
import { existsSync } from 'node:fs';
import { mkdir, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { emptyAuthoritySlots } from '../uat/public-setup.mjs';
import { RECIPE_PATH, commandInput } from './build-resources.mjs';

const version = '5.0.0';
export const PROGRAMS = Object.freeze({
  c2: { programRef: 'program://abiogenesis/worksite/command-execution@5', graphFunctionRef: 'graph-function://abiogenesis/worksite/command-execution@5' },
  assess: { programRef: 'program://abiogenesis/qualification/assess@5', graphFunctionRef: 'graph-function://abiogenesis/qualification/assess@5' },
  ruling: { programRef: 'program://abiogenesis/qualification/ruling@5', graphFunctionRef: 'graph-function://abiogenesis/qualification/ruling@5' },
  selfConformance: { programRef: 'program://abiogenesis/qualification/self-conformance@5', graphFunctionRef: 'graph-function://abiogenesis/qualification/self-conformance@5' },
  verdict: { programRef: 'program://abiogenesis/qualification/exact-candidate@5', graphFunctionRef: 'graph-function://abiogenesis/qualification/exact-candidate@5' },
});
export const SELECTION_PREFIX = 'selection://abiogenesis/t287/qualification/';

/** The root invocation authority of one Program's graph function over the current environment
 * (installed-qualification-conservation.mjs constructStart; public-setup.mjs constructLifecycleCall). */
export async function rootAuthority(caller, { programRef, graphFunctionRef }, cache) {
  const { product, abg } = caller.runtime, state = caller.state;
  // A cache is valid only while the prefix is unchanged (the dry mode); the live mode passes none.
  const key = programRef + '\n' + product.sha256Canonical(state.closeHandoff);
  if (cache?.has(key)) return cache.get(key);
  const environment = caller.refresh(), admittedInstalls = environment.productInstalls, workspaceBinding = environment.workspaceBinding;
  const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog: state.catalog, catalogView: state.catalogView, admittedInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install), programRef,
    selection: { kind: 'start', scope: 'program', target: 'graph_function', graphFunctionHandle: graphFunctionRef, until: 'converged', rootMode: 'direct' } });
  if (resolution.kind !== 'loaded_product_execution_resolution') throw new TypeError('resolution of ' + programRef + ': ' + (resolution.code ?? resolution.kind));
  // The policy the run invocation preparation constructs (product/run_invocation_operation.ts prepareProductRunInvocation):
  // the interaction leaves' requirement rows (the ruling Program's F_H leaf) and every declared leaf's fibre.
  const validation = resolution.programValidation;
  const regimes = new Set([...validation.executableLeafRows.map(row => row.fibre), ...validation.interactionLeafRows.map(row => row.fibre)]);
  const interactions = validation.interactionLeafRows.map(row => ({ requirementKey: row.requirementKey, requirementKeyDigest: row.requirementKeyDigest,
    actorCapabilityRef: row.requirement.actorCapabilityRef }));
  const policy = product.constructRootInvocationPolicy(workspaceBinding, resolution.program, interactions, ['F_D', 'F_P', 'F_H'].filter(r => regimes.has(r)), []);
  const fixedPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
  const grants = [product.constructCapabilityGrant(policy, caller.actorRef, fixedPacket.definitionKey.operationId, product.DIRECT_INVOKE_CAPABILITY,
    { admittedInstalls, workspaceBinding, fixedPacket })];
  const authority = product.constructInvocationAuthority(caller.actorRef, workspaceBinding, state.catalogView, programRef, resolution.selectedCatalogEntry,
    policy, grants, { admittedInstalls, workspaceBinding, fixedPacket });
  const value = { environment, admittedInstalls, workspaceBinding, resolution, policy, fixedPacket, grants, authority, regimes: [...regimes].sort() };
  cache?.set(key, value);
  return value;
}

/** The input admitted by the Program's declared input contract (the admission returns the admitted value, or null on
 * refusal: product/semantics.ts admitInstalledProductInput). */
export function admitsInput(caller, resolution, input) {
  return caller.runtime.product.admitInstalledProductInput(resolution.productSemantics, resolution.resolution.inputContract.contractRef, input) !== null;
}

/** The installed record of each run environment a started Program declares, relative to the package root: the C2
 * declares its renderer context (gtl/worksite_command_execution.ts:43-62); the qualification Programs declare none. */
const ENVIRONMENT_RECORDS = gtl => ({ 'environment://abiogenesis/worksite/command-execution@5': gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path });
export const RUN_ENVIRONMENT_SUPPORT = 'run-environment-support';

/** The run environment resources of a Program that declares one (product/stdo_environment.ts observeRunEnvironment
 * refuses a root start without them): the installed package as the dependency root, a temporary root under the
 * binding's archive root, and the permission over the root invocation authority (public-setup.mjs constructLifecycleCall;
 * t287-c2-core-environment.test.mjs). Undefined for a Program without a run environment. */
export async function runEnvironmentResources(caller, root) {
  const { product, gtl } = caller.runtime, { resolution, authority, workspaceBinding } = root, program = resolution.program;
  const ref = program.policies[gtl.RUN_ENVIRONMENT_POLICY];
  if (ref === undefined) return undefined;
  const declarations = (resolution.programPublication.runEnvironments ?? []).filter(d => d.declarationRef === ref), record = ENVIRONMENT_RECORDS(gtl)[ref];
  if (declarations.length !== 1 || record === undefined) throw new TypeError('run environment of ' + program.programRef + ' has no installed record: ' + ref);
  const declaration = declarations[0], installed = caller.installedRoot;
  const packageRoot = await realpath(existsSync(join(installed, 'package.json')) ? installed : join(installed, 'node_modules/@abiogenesis/typescript-tenant'));
  const support = join(workspaceBinding.roots.archiveRoot, RUN_ENVIRONMENT_SUPPORT);
  await mkdir(support, { recursive: true });
  const temporaryRoot = await realpath(support);
  const dependencies = declaration.dependencies.map(d => ({ dependencyRef: d.dependencyRef, root: packageRoot, recordPath: join(packageRoot, record) }));
  const coordinates = { dependencies, pythonPath: null, temporaryRoot };
  return product.constructRunEnvironmentResources({ kind: 'run_environment_resources', schemaVersion: version, ...coordinates,
    permission: { authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest, actorRef: caller.actorRef, programRef: program.programRef,
      environmentRef: declaration.declarationRef, environmentDigest: product.sha256Canonical(declaration),
      operations: [...new Set(['read_context', ...declaration.accesses.map(a => a.operation)])].sort(), ...coordinates } });
}

/** The run.invoke start call of one Program's graph function over one input. */
export async function startCall(caller, program, input, { qualificationResources, label, cache }) {
  const { product, api } = caller.runtime, state = caller.state, hash = product.sha256Canonical;
  const root = await rootAuthority(caller, program, cache), { resolution, policy, fixedPacket, grants, authority, admittedInstalls, workspaceBinding } = root;
  const inputAdmitted = admitsInput(caller, resolution, input);
  if (!inputAdmitted) return { root, inputAdmitted, call: null };
  const boundInput = { contract: { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest },
    valueRef: 'input://abiogenesis/t287/qualification/' + hash(input).slice(7), valueDigest: hash(input), value: input };
  const programCoordinate = { ref: resolution.resolution.programRef, digest: resolution.resolution.programDigest };
  const view = { ref: 'graph-function-catalog-view://abiogenesis/' + state.catalogView.viewDigest.slice(7), digest: state.catalogView.viewDigest };
  const eventResource = caller.reopen(), steering = hash(eventResource);
  const request = { program: programCoordinate, scope: 'program', target: { kind: 'graph_function', handle: program.graphFunctionRef }, until: 'converged',
    catalogView: view, allowlist: [...state.catalogView.allowlist], input: boundInput, fhMode: 'direct', rootMode: 'direct', sourceBasis: { kind: 'none' } };
  const slots = { ...emptyAuthoritySlots(), workspace_binding: state.binding, product_set: admittedInstalls.map(product.productInstallCoordinate),
    dependency_lock: { ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest },
    catalog_scope: { catalog: { ref: 'graph-function-catalog://abiogenesis/' + state.catalog.basisDigest.slice(7), digest: state.catalog.basisDigest },
      view, allowlist: request.allowlist }, execution_program: programCoordinate,
    graph_function: { graphFunction: { ref: resolution.resolution.graphFunctionRef, digest: resolution.resolution.graphFunctionDigest },
      membership: resolution.resolution.programGraphFunctionMembership }, input_contract: boundInput,
    session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
    capability_grants: { requiredCapabilityRefs: [...fixedPacket.metadata.capabilityRefs], grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) },
    actor: { actor: { ref: caller.actorRef, digest: hash({ actorRef: caller.actorRef }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
    transport_steering: { ref: 'transport-steering://abiogenesis/' + steering.slice(7), digest: steering } };
  const contractCatalog = caller.native.verified.definitionContractCoordinates.operations.find(value => value.operationId === fixedPacket.definitionKey.operationId)
    .members.find(value => value.memberKey === 'start').slots.request.contractCatalog;
  const environment = await runEnvironmentResources(caller, root);
  const call = api.constructInstalledPublicDefinitionCall({ product, installedPublic: api,
    definitionContractCoordinates: caller.native.verified.definitionContractCoordinates, contractCatalog, ...fixedPacket.definitionKey, request, slots,
    resources: { kind: 'run_invocation_resource_assertion', schemaVersion: version, eventResource, catalog: state.catalog, catalogView: state.catalogView,
      applications: [], applicationResources: [], ...(qualificationResources === undefined ? {} : { qualificationResources }), source: { kind: 'none' },
      ...(environment === undefined ? {} : { runEnvironmentResources: environment }) },
    requestRef: 'request://abiogenesis/t287/qualification/' + caller.config.runId + '/' + label, correlationRef: 'correlation://abiogenesis/t287/qualification/' + caller.config.runId,
    eventTime: new Date().toISOString(), provenanceRefs: [pathToFileURL(join(caller.root, 'run.json')).href] });
  return { root, inputAdmitted, call };
}

/** The in-process admission of one start call by the installed run invocation preparation (no dispatch, no event). */
export async function admitCall(caller, call) {
  const { product, abg } = caller.runtime, env = caller.refresh();
  const started = performance.now();
  const owner = await product.ProductRunInvocationPort.prepare({ memberKey: 'start', invocation: call.invocation,
    resources: { catalog: call.resources.catalog, catalogView: call.resources.catalogView, applications: [], source: { kind: 'none' },
      ...(call.resources.qualificationResources === undefined ? {} : { qualificationResources: call.resources.qualificationResources }),
      ...(call.resources.runEnvironmentResources === undefined ? {} : { runEnvironmentResources: call.resources.runEnvironmentResources }) },
    admittedInstalls: env.productInstalls, workspaceBinding: env.workspaceBinding,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(env.artifactTruth, install), transportResourceAssertion: call.resources.eventResource });
  const refused = owner.ownerOutput?.value ?? null;
  return { owner, kind: owner.kind, code: refused?.code ?? null, issuePaths: refused?.issuePaths ?? null, ms: Math.round(performance.now() - started),
    admitted: owner.kind === 'prepared_product_run_invocation' };
}

/** The observed C2 task over the prepared worksite: the protected inputs as observed by the installed owner, the bound
 * commands, predicates and write territories, and the C2 Program's root invocation grant. */
export async function observedC2Task(caller, q, c2, declared, ambient) {
  const root = await rootAuthority(caller, PROGRAMS.c2);
  const task = q.product.constructObservedWorksiteCommandExecutionTask({ workspaceAuthorityBasis: root.environment.workspaceAuthorityBasis,
    workspaceBinding: root.workspaceBinding, capabilityGrant: root.grants[0], observedFiles: c2.subjects.map((subject, n) => ({ subject, observation: c2.observations[n] })),
    commands: commandInput(declared), outcomePredicates: declared.outcomePredicates, allowedWriteTerritories: declared.allowedWriteTerritories }, ambient);
  return { task, root, observed: q.deep.c2.isObservedWorksiteCommandExecutionTask(task) };
}

/** One call dispatched in process through the installed transport; the receipt and the handoff recorded. */
export async function invokeInProcess(caller, label, call, { record, guard }) {
  guard?.(label);
  const { api, product } = caller.runtime, hash = product.sha256Canonical, eventResource = call.resources.eventResource;
  const acquisition = !eventResource ? { kind: 'eventless' } : eventResource.kind === 'new_abg_event_resource'
    ? { kind: 'new', eventLogPath: eventResource.eventLogPath } : { kind: 'reopen', closeHandoff: eventResource.closeHandoff };
  const started = Date.now(), outcome = await api.runInstalledDefinitionCallTransport(acquisition, call), receipt = outcome.receipt;
  const handoff = receipt?.resources?.eventResource?.closeHandoff;
  if (handoff) { caller.state.closeHandoff = handoff; await record('calls/' + label + '.close.json', handoff); }
  await record('calls/' + label + '.outcome.json', { kind: outcome.kind, code: outcome.code ?? null, exitCode: receipt?.exitCode ?? null,
    outcomeKind: receipt?.ownerOutput?.outcomeKind ?? null, valueDigest: receipt?.ownerOutput?.value === undefined ? null : hash(receipt.ownerOutput.value),
    invocation: { ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest }, elapsedMs: Date.now() - started });
  caller.state.calls.push({ label, definitionKey: call.invocation.definitionKey, outcomeKind: receipt?.ownerOutput?.outcomeKind ?? outcome.kind });
  if (outcome.kind !== 'installed_definition_call_transport_result' || receipt?.ownerOutput?.outcomeKind !== 'result' || receipt.exitCode !== 0)
    throw new TypeError(label + ' did not return a result: ' + JSON.stringify(receipt?.ownerOutput ?? outcome).slice(0, 2000));
  return { call, receipt, outcome };
}

/** The typed terminal Result of a completed run (installed-qualification-conservation.mjs terminal). */
export function terminalResult(caller, observation, valueKind) {
  const { abg, product } = caller.runtime, value = observation.receipt.ownerOutput.value, result = value.terminalResult;
  if (value.disposition !== 'completed' || value.stop !== null || !abg.isAbgTypedTerminalResult(result) || result.valueKind !== valueKind ||
      result.producer.runRef !== value.run.ref || result.valueDigest !== product.sha256Canonical(result.value))
    throw new TypeError('the run did not complete with one ' + valueKind + ' Result');
  return result;
}

/** The resource selection of the plan's manifest. */
const selectionOf = (resource, entryKind, entry) => ({ kind: 'qualification_resource_selection', schemaVersion: '1', resource, entryKind, entry });
const coord = (ref, digest) => ({ ref, digest });

/** The self-conformance input (reference form) over the plan, a proof's selections and the verification selection. */
export function selfConformanceInput(q, built, { plan, proof, executionSelectionRef }) {
  const { resource, basis, inventory, law, tenant, normalized, recipe, applications, authority } = { ...built, basis: built.basisValue };
  return { kind: 'self_conformance_input', schemaVersion: version, representation: 'resource_refs_v1', resource, basis,
    law: selectionOf(resource, 'law', law.lawBasis), inventory: selectionOf(resource, 'inventory', coord(inventory.inventoryRef, inventory.inventoryDigest)),
    tenantManifest: selectionOf(resource, 'tenant_manifest', coord(tenant.manifestRef, tenant.manifestDigest)),
    scope: selectionOf(resource, 'scope', coord(normalized.scopeRef, normalized.scopeDigest)),
    authorityMembers: authority.map(m => selectionOf(resource, 'material', coord(m.ref, m.digest))), applications, evidenceCitations: [],
    qualification: { plan, proof, sourceMembers: built.members.map(m => selectionOf(resource, 'material', coord(m.ref, m.digest))),
      coverageCatalog: selectionOf(resource, 'coverage_catalog', law.coverageCatalog),
      verification: { executionSelectionRef, recipe: selectionOf(resource, 'verification_recipe', coord(recipe.ref, recipe.digest)), recipePath: RECIPE_PATH } } };
}

/** The proof resource (reference form) at a prefix over selections. */
export const proofResource = (built, prefix, selections) => ({ kind: 'qualification_proof_resource', schemaVersion: version, representation: 'resource_refs_v1',
  resource: built.resource, prefix, declarations: [built.declarationSelection], selections });

/** The owner's acknowledgment request for one slot's insufficient attribution (validator/qualification_contracts.ts:246-254;
 * abg/qualification_proof.ts:659-672: its record set and attributed identities are the provenance's). */
export function acknowledgmentRequest(q, plan, slotRef, provenance) {
  const identity = q.preparation.constructQualificationIdentity;
  return identity({ kind: 'qualification_ruling_request', schemaVersion: version, slotRef, subjectBasis: plan.subjectBasis, lawBasis: plan.lawBasis,
    authorityRef: plan.ownerAuthorityRef, actorRef: plan.ownerActorRef, decision: 'external_attribution', declarations: [],
    scopeRefs: [...new Set(provenance.chains.flatMap(c => c.scopeRefs))], recordSet: provenance.recordSet,
    attributedIdentities: provenance.chains.map(c => ({ authorRef: c.authorRef, actorIdentityRef: c.actorIdentityRef })), retainedObligationRefs: [] },
    'requestRef', 'requestDigest', 'qualification-ruling-request://abiogenesis/');
}

/** The live dispatch (authored; not run in D5-c). ctx: { caller, q, config, record, built, plan, inputs, slots, c2Task,
 * executionMaterialOf, applyProviderEnvironment, guard }. Returns the selections, the F11 and AF22 Results, or a stop. */
export async function dispatchLive(ctx) {
  const { caller, q, record } = ctx, product = caller.runtime.product, hash = product.sha256Canonical;
  ctx.applyProviderEnvironment();
  // 1. The observed C2 of the recipe.
  const c2Start = await startCall(caller, PROGRAMS.c2, ctx.c2Task, { label: 'c2' });
  if (!c2Start.inputAdmitted || !(await admitCall(caller, c2Start.call)).admitted) return { status: 'stopped', reason: 'the observed C2 start was not admitted' };
  const c2Run = await invokeInProcess(caller, 'c2', c2Start.call, { record, guard: ctx.guard });
  const c2Result = terminalResult(caller, c2Run, 'worksite_command_execution_observation');
  const executionSelection = { kind: 'execution_selection', selectionRef: SELECTION_PREFIX + 'execution/c2', slotRef: product.WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,
    programRef: c2Result.producer.program.ref, invocationAdmissionRef: c2Result.producer.invocationAdmissionRef, result: c2Result.result };
  await record('selections/execution.json', executionSelection);
  // 2. The plan over the C2 Result's two entries, with its gates.
  const planned = await ctx.planOver(await ctx.executionMaterialOf(c2Result, executionSelection.selectionRef));
  if (planned.stop) return { status: 'stopped', reason: planned.reason, gates: planned.gates };
  const { built, plan, inputs } = planned, invoking = { ...built.assertion, declarationProofs: [] };
  // 3. assess@5 per slot, in plan order, sequentially.
  const judgments = [];
  for (const [n, input] of inputs.entries()) {
    const label = 'assess-' + String(n).padStart(4, '0');
    // No separate in-process admission per slot: the transport's own preparation (the same ProductRunInvocationPort
    // preparation, about 11 s over the whole resource assertion) refuses before any provider spawn, and
    // invokeInProcess stops the run on that refusal. The dry mode admits every slot in process.
    const start = await startCall(caller, PROGRAMS.assess, input, { qualificationResources: invoking, label });
    if (!start.inputAdmitted) return { status: 'stopped', reason: 'slot ' + input.task.slotRef + ' refused by its input contract' };
    const run = await invokeInProcess(caller, label, start.call, { record, guard: ctx.guard }), judgment = terminalResult(caller, run, 'qualification_judgment');
    const selection = { kind: 'judgment_selection', selectionRef: SELECTION_PREFIX + 'judgment/' + n, slotRef: plan.slots[n].slotRef,
      task: coord(input.task.taskRef, input.task.taskDigest), programRef: judgment.producer.program.ref, invocationAdmissionRef: judgment.producer.invocationAdmissionRef, result: judgment.result };
    const provenance = q.deep.qualificationResources.resolveQualificationAssessment(input, built.acquired).task.provenance;
    const attribution = q.deep.qualification.projectExternalConstructionAttribution(judgment.value, plan, provenance);
    judgments.push({ selection, attribution: attribution.status, provenance });
    await record('selections/judgment-' + String(n).padStart(4, '0') + '.json', { selection, attribution: attribution.status });
  }
  // 4. The owner's acknowledgment for every insufficient attribution (F_H; the owner responds; the run resumes after).
  const insufficient = judgments.filter(j => j.attribution === 'insufficient'), invalid = judgments.filter(j => j.attribution === 'invalid');
  if (invalid.length > 0) return { status: 'stopped', reason: invalid.length + ' judgments with an invalid construction attribution' };
  if (insufficient.length > 0) {
    // One request per acknowledgment selection (F11 selects exactly one ruling_selection per provenance view). The
    // owner's response arrives through the F_H continuation of each ruling run; the resume that turns each response
    // into a ruling_selection (with its continuationRef) and then runs steps 5 and 6 is not authored in D5-c.
    const requested = [], seen = new Set();
    for (const j of insufficient) {
      if (seen.has(j.provenance.acknowledgmentSelectionRef)) continue;
      seen.add(j.provenance.acknowledgmentSelectionRef);
      const n = seen.size - 1;
      const request = acknowledgmentRequest(q, plan, j.selection.slotRef, j.provenance), label = 'ruling-' + String(n).padStart(4, '0');
      const start = await startCall(caller, PROGRAMS.ruling, request, { label });
      if (!start.inputAdmitted || !(await admitCall(caller, start.call)).admitted) return { status: 'stopped', reason: 'ruling request not admitted for ' + j.selection.slotRef };
      const run = await invokeInProcess(caller, label, start.call, { record, guard: ctx.guard });
      requested.push({ slotRef: j.selection.slotRef, acknowledgmentSelectionRef: j.provenance.acknowledgmentSelectionRef,
        request: coord(request.requestRef, request.requestDigest), run: run.receipt.ownerOutput.value.run ?? null, stop: run.receipt.ownerOutput.value.stop ?? null });
    }
    await record('rulings-requested.json', { kind: 'qualification_owner_rulings_requested', requested });
    return { status: 'awaiting_owner_rulings', reason: insufficient.length + ' slots need the owner\'s acknowledgment of their construction attribution', requested };
  }
  // 5. The self-conformance leaf over the plan and the proof's selections.
  const selections = [...judgments.map(j => j.selection), executionSelection];
  const proof = proofResource(built, caller.state.closeHandoff.prefix, selections);
  const selfInput = selfConformanceInput(q, built, { plan, proof, executionSelectionRef: executionSelection.selectionRef });
  const selfStart = await startCall(caller, PROGRAMS.selfConformance, selfInput, { qualificationResources: invoking, label: 'f11' });
  const selfOwner = selfStart.inputAdmitted ? await admitCall(caller, selfStart.call) : null;
  if (selfOwner?.admitted !== true) return { status: 'stopped', reason: 'the self-conformance start was not admitted' };
  const f11 = terminalResult(caller, await invokeInProcess(caller, 'f11', selfStart.call, { record, guard: ctx.guard }), 'self_conformance_result');
  const selfSelection = { kind: 'self_conformance_selection', selectionRef: SELECTION_PREFIX + 'self-conformance', slotRef: 'node://abiogenesis/qualification/self-conformance@5',
    programRef: f11.producer.program.ref, invocationAdmissionRef: f11.producer.invocationAdmissionRef, result: f11.result };
  // 6. The sole AF22 verdict over the F11 Result.
  const verdictProof = proofResource(built, caller.state.closeHandoff.prefix, [selfSelection]);
  const summary = caller.runtime.abg.projectQualificationSelfConformance(verdictProof, selfSelection, built.basisValue, selfOwner.owner.qualificationResources);
  if (summary === null) return { status: 'stopped', reason: 'the F11 Result does not authenticate for AF22' };
  const verdictInput = { kind: 'qualification_verdict_input', schemaVersion: version, slotRef: 'node://abiogenesis/qualification/exact-candidate@5',
    basis: built.basisValue, coverage: built.law.coverage, selectionRef: selfSelection.selectionRef, selfConformance: summary, proof: verdictProof };
  const verdictStart = await startCall(caller, PROGRAMS.verdict, verdictInput, { qualificationResources: invoking, label: 'af22' });
  if (!verdictStart.inputAdmitted || !(await admitCall(caller, verdictStart.call)).admitted) return { status: 'stopped', reason: 'the AF22 start was not admitted' };
  const verdict = terminalResult(caller, await invokeInProcess(caller, 'af22', verdictStart.call, { record, guard: ctx.guard }), 'exact_candidate_qualification');
  await record('verdict.json', { kind: 'qualification_verdict_record', disposition: verdict.value.disposition, result: verdict.result, producer: verdict.producer,
    selfConformance: { result: f11.result, disposition: f11.value.disposition, findings: f11.value.findings.length }, valueDigest: hash(verdict.value) });
  return { status: 'qualified', verdict: verdict.value.disposition, selections, selfSelection, verdictResult: verdict.result };
}
