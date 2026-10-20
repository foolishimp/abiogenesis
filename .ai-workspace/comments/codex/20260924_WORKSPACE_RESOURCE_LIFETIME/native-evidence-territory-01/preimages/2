// Sandbox setup and one public lifecycle invocation. ABI owns all traversal,
// instruction assembly, effects, command execution, admission and replay.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, mkdtemp, readFile, realpath, writeFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, basename, isAbsolute, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { definitionCall, publicReadDefinition } from "./generic-live-workflow-support.mjs";
import { materializeD1Publication } from "./d1-lifecycle-declarations.mjs";
import { constructFullHelloInputs, constructOrdinaryJobInput, constructFullSandboxPackage, FULL_SANDBOX_IDS,
  nativeFullSandboxPublications, constructFullSandboxManagementEnvironment,
  FULL_SANDBOX_MANAGEMENT_PATHS, FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS, FULL_SANDBOX_MANAGEMENT_SOURCE_MANIFEST } from "./full-sandbox-declarations.mjs";

const exec = promisify(execFile);
const tenantRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(tenantRoot, "../../..");
const schemaVersion = "5.0.0";
const actorRef = "actor://odd-glc/generic-lifecycle/owner@5";
// Preparation configuration, not a transport implementation. ABI still owns
// argv admission, worker dispatch, supervision and native evidence.
export function constructFullSandboxTransportConfiguration(value, abg) {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), "explicit transport configuration required");
  assert.deepEqual(Object.keys(value).sort(), ["command", "expectedVersion", "model", "effort", "extraArgs",
    "inactivityMs", "absoluteMs", "terminationGraceMs", "wholeRunMs"].sort(), "closed transport configuration");
  assert.ok(typeof value.command === "string" && isAbsolute(value.command), "absolute selected transport executable");
  for (const key of ["expectedVersion", "model"]) assert.ok(typeof value[key] === "string" && value[key].trim().length > 0, key);
  assert.equal(value.effort, "xhigh", "this sandbox activation selects xhigh");
  for (const key of ["inactivityMs", "absoluteMs", "terminationGraceMs", "wholeRunMs"]) {
    assert.ok(Number.isSafeInteger(value[key]) && value[key] > 0 && value[key] <= 2147483647, "finite positive " + key);
  }
  assert.ok(value.inactivityMs <= value.absoluteMs, "inactivity cannot exceed the actor absolute bound");
  assert.ok(value.absoluteMs + value.terminationGraceMs < value.wholeRunMs, "whole-run bound must include actor termination grace");
  assert.ok(Array.isArray(value.extraArgs) && value.extraArgs.every(arg => typeof arg === "string"), "declared extra argv");
  assert.ok(value.extraArgs.every(arg => !["--model", "--effort"].includes(arg.split("=", 1)[0])), "extra argv cannot override the selected model or effort");
  abg.admitTransportAppendArgs({ agentKey: "claude", environment: {}, explicitArgs: ["--model", value.model, ...value.extraArgs] });
  return Object.freeze({ ...value, extraArgs: Object.freeze([...value.extraArgs]) });
}

// Thin Public setup caller shared by initial setup and its finite conformance tail.
export function fullSandboxSetupCalls({ scratch, abiArtifact, abiRequest, hash, coord, calls, state }) {
  const slotsFor = (definition, supplied = {}) => ({ workspace_binding: null, product_set: null, dependency_lock: null, catalog_scope: null,
    execution_program: null, graph_function: null, input_contract: null, session_policy: null, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [] },
    actor: null, transport_steering: null, verification_references: null, execution_basis: null, ...supplied });
  const call = (packet, request, slots, resources) => definitionCall({ publicApi: state.installedPublic, product: state.product, verified: abiArtifact,
    ...packet.definitionKey, ordinal: ++state.ordinal, request, slots, resources });
  async function authorized(packet, request, resources, supplied = {}) {
    const { product, installedPublic } = state;
    const definition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d => d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === packet.definitionKey.memberKey);
    const slots = slotsFor(definition, supplied);
    const data = { kind: "admission_capability_data", schemaVersion,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
        owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } }, ownerArtifact: { request: abiRequest, verified: abiArtifact }, request,
      resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null
        : product.admissionEnvironmentSelection(state.closeHandoff.prefix, slots.workspace_binding) };
    const authorityValue = { actorRef, authorityMode: "trusted_developer" }, approvalValue = { decision: "allow", actorRef,
      definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(data).digest };
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef, authorityMode: "trusted_developer",
      authority: { ...coord("authority://odd-glc/full-sandbox", authorityValue), value: authorityValue },
      approval: { ...coord("approval://odd-glc/full-sandbox/" + state.ordinal, approvalValue), value: approvalValue } };
    const grants = await Promise.all(definition.capabilityRefs.map(cap => product.constructCapabilityGrant(authority, actorRef,
      definition.definitionKey.operationId, cap, { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data })));
    return call(packet, request, { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) } },
      { ...resources, admissionAuthority: { basis: data, authority, grants } });
  }
  const reopen = () => ({ kind: "reopen_abg_event_resource", schemaVersion, closeHandoff: state.closeHandoff, handoffDigest: hash(state.closeHandoff) });
  async function invoke(prepared, label) {
    const path = await save(scratch, `calls/${String(calls.length + (state.retainedFailures ?? 0)).padStart(2, "0")}-${label}.jsonl`, transportPacket(prepared));
    // Prepare-only may invoke only deterministic Programs. A transport command
    // is deliberately unavailable even if a malformed setup tried to dispatch.
    let result;
    try {
      result = await exec(process.execPath, [state.cliPath, "--jsonl", path], { cwd: scratch,
        env: { ...process.env, NODE_OPTIONS: "", ABG_TS_CLAUDE_COMMAND: "/unavailable/prepare-only-no-actors" }, timeout: 180000, maxBuffer: 128 * 1024 * 1024 });
    } catch (error) {
      await save(scratch, `receipts/${String(calls.length + (state.retainedFailures ?? 0)).padStart(2, "0")}-${label}.process-failure.json`,
        { code: error.code ?? null, signal: error.signal ?? null, killed: error.killed ?? false, message: error.message });
      result = { stdout: error.stdout ?? "", stderr: error.stderr ?? String(error) };
    }
    await save(scratch, `receipts/${String(calls.length + (state.retainedFailures ?? 0)).padStart(2, "0")}-${label}.json`, result.stdout);
    await save(scratch, `receipts/${String(calls.length + (state.retainedFailures ?? 0)).padStart(2, "0")}-${label}.stderr`, result.stderr);
    assert.ok(result.stdout.trim(), "prepare CLI produced no receipt; inspect retained process failure");
    const outcome = JSON.parse(result.stdout); assert.equal(outcome.kind, "installed_definition_call_transport_result", result.stdout);
    const receipt = outcome.receipt; assert.equal(receipt.ownerOutput?.outcomeKind, "result", JSON.stringify(receipt)); assert.equal(receipt.exitCode, 0);
    if (receipt.resources?.eventResource?.closeHandoff) state.closeHandoff = receipt.resources.eventResource.closeHandoff;
    calls.push({ label, definitionKey: prepared.invocation.definitionKey, invocationRef: prepared.invocation.invocationRef });
    console.error(JSON.stringify({ phase: "full_sandbox_public_setup", ordinal: calls.length, label }));
    return receipt;
  }
  return { call, authorized, reopen, invoke };
}

export async function completeFullSandboxJob({ product, gtl, abg, validator, configuration, runEnvironment, environment, publication, catalog, catalogView, boundSlots, catalogScope, lock, ordinary, input, roots, jobRoot, workspaceRoot, allowlist, hash, coord, authorized, invoke }) {
    const binding = environment.workspaceBinding;
    const programRef = FULL_SANDBOX_IDS.programRef;
    const program = publication.programs.find(p => p.programRef === programRef), law = coord("law://abiogenesis/validator/gtl-program@5");
    const checked = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      { program: coord(programRef, program), conformanceLaw: law, inventoryBasis: { kind: "declared_inventory", inventory: catalog.boundPublications.map(p => coord(p.moduleRef, p)).sort((a, b) => a.ref.localeCompare(b.ref)) } },
      { kind: "conformance_evaluation_resource_assertion", schemaVersion, packet: { kind: "conformance_evaluate_packet", schemaVersion, memberKey: "gtl_program", publication, program },
        conformanceLaw: law, declaredInventory: catalog.boundPublications, declarationCatalog: { catalog, catalogView } }, boundSlots), ordinary.key + "-lifecycle-conformance");
    assert.equal(checked.ownerOutput.value.disposition, "passed");
    const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView, admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install), programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
    const packet = product.RUN_OPERATION_CONTRACTS.invoke.start;
    const regimes = new Set([...resolution.programValidation.executableLeafRows, ...resolution.programValidation.interactionLeafRows].map(row => row.fibre));
    const policy = product.constructRootInvocationPolicy(binding, program, [], ["F_D", "F_P", "F_H"].filter(r => regimes.has(r)), []);
    const grantBasis = { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: packet };
    const grants = [product.constructCapabilityGrant(policy, actorRef, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis)];
    const authority = product.constructInvocationAuthority(actorRef, binding, catalogView, programRef, resolution.selectedCatalogEntry, policy, grants, grantBasis);
    let runEnvironmentResources;
    if (runEnvironment !== undefined) {
      const temporaryRoot = join(roots.archiveRoot, "run-environment-access");
      await mkdir(temporaryRoot, { recursive: true });
      runEnvironmentResources = constructFullSandboxEnvironmentResources({ product, declaration: runEnvironment,
        configuration: configuration.runEnvironmentResources, authority, program, temporaryRoot });
    }
    assert.equal(resolution.resolution.inputContract.contractRef, gtl.SEMANTIC_STAGE_IDS.jobInputContractRef);
    const carrier = { contract: { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest },
      valueRef: "value://odd-glc/full-sandbox/" + ordinary.key, valueDigest: hash(input), value: input };
    const slots = { graph_function: null, verification_references: null, execution_basis: null, workspace_binding: boundSlots.workspace_binding,
      product_set: environment.productInstalls.map(i => ({ ref: i.installId, digest: i.productContentDigest })), dependency_lock: lock, catalog_scope: catalogScope,
      execution_program: { ref: programRef, digest: resolution.resolution.programDigest }, input_contract: carrier, session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) },
      actor: { actor: coord(actorRef, { actorRef }), attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } }, transport_steering: null };
    return { ordinary, jobRoot, workspaceRoot, input, environment, boundSlots, resolution, slots,
      request: { program: slots.execution_program, scope: "program", target: { kind: "next" }, until: "converged", catalogView: catalogScope.view,
        allowlist, input: carrier, fhMode: "direct", rootMode: "direct", sourceBasis: { kind: "none" } },
      resources: { kind: "run_invocation_resource_assertion", schemaVersion, catalog, catalogView, applications: [], applicationResources: [], source: { kind: "none" },
        ...(runEnvironmentResources === undefined ? {} : { runEnvironmentResources }) } };
}

export async function publishFullSandboxPreparation({ product, hash, call, reopen, callerState, pin, abiArtifact, built, lock, publication, abiRoot, consumerRoot, cliPath, lifecycle, transport, runEnvironment, freshNative, scratch, installed, jobs }) {
  const records = [];
  for (const job of jobs) {
    const eventResource = reopen(), steeringDigest = hash(eventResource);
    const prepared = call(product.RUN_OPERATION_CONTRACTS.invoke.start, job.request,
      { ...job.slots, transport_steering: { ref: "transport-steering://abiogenesis/" + steeringDigest.slice(7), digest: steeringDigest } },
      { ...job.resources, eventResource });
    const { ordinal, closeHandoff } = callerState;
    const launchPath = join(job.jobRoot, "lifecycle-start.jsonl"), launchBytes = transportPacket(prepared);
    try { await save(job.jobRoot, "lifecycle-start.jsonl", launchBytes); }
    catch (error) { if (error.code !== "EEXIST") throw error;
      assert.equal(await product.sha256File(launchPath), product.sha256Bytes(Buffer.from(launchBytes)), "retained prepared launch must be byte-identical"); }
    await save(job.jobRoot, "readback-basis.json", { abiRoot, abiArtifact, environment: job.environment, boundSlots: job.boundSlots,
      lock, actorRef, ordinal, closeHandoff, declaration: lifecycle, publication });
    const record = { kind: "odd_glc_full_sandbox_prepared", schemaVersion: "3", key: job.ordinary.key, scenarioId: job.ordinary.scenarioId,
      status: "prepared_not_live_qualified", scratch: job.jobRoot, setupRoot: scratch, workspaceRoot: job.workspaceRoot,
      ...(freshNative ? { freshNative: true, maximumActorOccurrences: 12 } : {}),
      abiRoot, consumerRoot, cliPath, launchPath, launchDigest: await product.sha256File(launchPath), ordinal,
      inputDigest: hash(job.input), setupPrefix: closeHandoff.prefix, abiArtifact: pin, oddGlcArtifact: built.basis,
      lifecycle: { declarationRef: lifecycle.declarationRef, declarationDigest: hash(lifecycle), stageRefs: lifecycle.stages.map(s => s.declarationRef),
        programRef: FULL_SANDBOX_IDS.programRef, programDigest: job.resolution.resolution.programDigest,
        actorLeafCount: job.resolution.programValidation.executableLeafRows.filter(r => r.fibre === "F_P").length },
      transport, runEnvironment: runEnvironment === undefined ? null : { declarationRef: runEnvironment.declarationRef,
        declarationDigest: hash(runEnvironment), resourcesDigest: hash(job.resources.runEnvironmentResources) },
      noSubjectExecution: true, noLiveActors: true,
      boundary: "One native start for this ordinary job. Shared installs, separate workspace. If the shared prefix advanced, supply its explicit close receipt. No host stage sequence or automatic retry." };
    records.push({ key: record.key, preparedPath: await save(job.jobRoot, "prepared.json", record), inputDigest: record.inputDigest,
      workspaceRoot: record.workspaceRoot, programDigest: record.lifecycle.programDigest });
  }
  assert.equal(new Set(records.map(row => row.programDigest)).size, 1, "both jobs select the same immutable Program");
  const summary = { kind: "odd_glc_generic_two_job_setup", status: "prepared_not_live_qualified", scratch,
    abiArtifact: pin, oddGlcArtifact: built.basis, installedProducts: installed.map(row => row.install), jobs: records,
    calls: callerState.calls, noSubjectExecution: true, noLiveActors: true,
    boundary: "One builder install set, two explicit ordinary jobs; no intake or full lifecycle has executed." };
  await save(scratch, "prepared.json", summary);
  return summary;
}

export async function prepareFullSandboxTransport(value, { product, abg }) {
  const configuration = constructFullSandboxTransportConfiguration(value, abg);
  const resolvedCommand = await realpath(configuration.command);
  const executableDigest = await product.sha256File(resolvedCommand);
  // Version-only local process; no prompt or provider request is permitted here.
  const reported = await exec(resolvedCommand, ["--version"], { timeout: 10000, maxBuffer: 1048576,
    env: { ...process.env, NODE_OPTIONS: "" } });
  const reportedVersion = reported.stdout.trim();
  assert.equal(reportedVersion, configuration.expectedVersion, "selected transport version");
  assert.equal(await realpath(configuration.command), resolvedCommand, "stable selected executable locator");
  assert.equal(await product.sha256File(resolvedCommand), executableDigest, "stable selected executable bytes");
  const body = { kind: "odd_glc_full_sandbox_transport", schemaVersion: "1", configuration,
    resolvedCommand, executableDigest, reportedVersion };
  return Object.freeze({ ...body, transportDigest: product.sha256Canonical(body) });
}

export async function assertFullSandboxTransportUnchanged(frozen, { product, abg }) {
  assert.equal(frozen?.kind, "odd_glc_full_sandbox_transport");
  assert.equal(frozen.schemaVersion, "1");
  const { transportDigest, ...body } = frozen;
  assert.equal(product.sha256Canonical(body), transportDigest, "frozen preparation transport identity");
  constructFullSandboxTransportConfiguration(frozen.configuration, abg);
  assert.equal(frozen.reportedVersion, frozen.configuration.expectedVersion);
  assert.equal(await realpath(frozen.configuration.command), frozen.resolvedCommand, "selected executable resolution changed");
  assert.equal(await product.sha256File(frozen.resolvedCommand), frozen.executableDigest, "selected executable bytes changed");
  return frozen;
}

export function fullSandboxTransportEnvironment(frozen, environment = {}) {
  const selected = frozen.configuration;
  return { ...environment, NODE_OPTIONS: "", ABG_TS_CLAUDE_COMMAND: frozen.resolvedCommand,
    ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", selected.model, ...selected.extraArgs]), CLAUDE_CODE_EFFORT_LEVEL: selected.effort,
    ABG_TS_FP_TIMEOUT_MS: String(selected.inactivityMs), ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: String(selected.absoluteMs),
    ABG_TS_FP_TERMINATION_GRACE_MS: String(selected.terminationGraceMs) };
}

// The locators and permitted operations are prospective setup configuration.
// Authority comes from the existing native invocation owner after binding;
// the native resource constructor and observation owner validate the assertion.
export function constructFullSandboxEnvironmentResources({ product, declaration, configuration, authority, program, temporaryRoot }) {
  assert.deepEqual(Object.keys(configuration).sort(), ["dependencies", "pythonPath", "operations"].sort(), "physical environment setup configuration only");
  const coordinates = { dependencies: structuredClone(configuration.dependencies), pythonPath: configuration.pythonPath, temporaryRoot };
  return product.constructRunEnvironmentResources({ kind: "run_environment_resources", schemaVersion, ...coordinates,
    permission: { authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest, actorRef: authority.actorRef,
      programRef: program.programRef, environmentRef: declaration.declarationRef, environmentDigest: product.sha256Canonical(declaration),
      operations: [...configuration.operations], ...structuredClone(coordinates) } });
}
const expected = b => ({ expectedArtifactDigest: b.artifactDigest, expectedProductContentDigest: b.productContentDigest,
  expectedManifestDigest: b.manifestDigest, expectedProductId: b.productId,
  expectedPackageName: b.packageName, expectedPackageVersion: b.packageVersion });
async function save(root, name, value) {
  const path = join(root, name); await mkdir(dirname(path), { recursive: true });
  await writeFile(path, typeof value === "string" || ArrayBuffer.isView(value) ? value : JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
  return path;
}
export async function installedFullSandboxApis(packageRoot) {
  const pkg = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  return Object.fromEntries(await Promise.all(["product", "gtl", "abg", "validator", "public"].map(async surface => {
    const selected = pkg.exports["./" + surface]; const relative = typeof selected === "string" ? selected : selected.import;
    assert.ok(relative.startsWith("./build/") && !relative.includes(".."));
    return [surface === "public" ? "installedPublic" : surface, await import(pathToFileURL(join(packageRoot, relative)).href)];
  })));
}
export async function readFullSandboxPin() {
  const pin = JSON.parse(await readFile(join(tenantRoot, "abi5.development-pin.json"), "utf8"));
  assert.equal(pin.artifactDigest, "sha256:0fb7492d197ed51aa2f8583f11b4d565ef4df8498399b41f7fc7d146d895778e");
  assert.equal(pin.productContentDigest, "sha256:b473ee7d84d49c9d3cba1f56a518593307d3d03139236df2b010d80b992114cb");
  return { ...pin, artifactPath: join(repoRoot, pin.artifactPath),
    installedRoot: join(repoRoot, pin.materializationRoot, "node_modules/@abiogenesis/typescript-tenant") };
}
// The accepted default dependency lacks this successor contract. Selecting an
// independently frozen candidate is explicit; this helper never repins it.
export async function readFullSandboxCandidate(candidatePath) {
  assert.ok(candidatePath, "an explicit frozen successor candidate basis is required; no default-pin fallback");
  const candidate = JSON.parse(await readFile(candidatePath, "utf8"));
  assert.equal(candidate.kind, "odd_glc_abi5_candidate_basis");
  assert.equal(candidate.status, "development_candidate_not_release");
  for (const key of ["artifactPath", "installedRoot", "freezePath"]) assert.ok(isAbsolute(candidate[key]), "absolute " + key);
  for (const key of ["artifactDigest", "productContentDigest", "manifestDigest", "freezeDigest"]) assert.match(candidate[key], /^sha256:[a-f0-9]{64}$/u, key);
  const apis = await installedFullSandboxApis(candidate.installedRoot);
  assert.equal(await apis.product.sha256File(candidate.freezePath), candidate.freezeDigest, "exact native freeze record");
  assert.equal(await apis.product.sha256File(candidate.artifactPath), candidate.artifactDigest, "exact candidate archive");
  for (const [owner, names] of [[apis.product, ["constructSemanticJobInput", "isSemanticJobEnvelope"]],
    [apis.gtl, ["constructSemanticJobLifecycleDeclaration", "constructSemanticJobGraphFunction"]]]) {
    for (const name of names) assert.equal(typeof owner[name], "function", "candidate public export " + name);
  }
  return candidate;
}
export async function fullHelloInputs(product) {
  const originalSourceBytes = await readFile(join(tenantRoot, "test/glc-software-build-overlay-live.test.mjs"));
  const oracle = JSON.parse(await readFile(join(tenantRoot, "test/fixtures/generic-job/basic-cli.oracle.json"), "utf8"));
  return constructFullHelloInputs({ product, originalSourceBytes, oracle });
}
export async function ordinarySandboxInputs(product) {
  const path = "build_tenants/odd_glc/typescript/test/fixtures/generic-job/integer-addition.md";
  const bytes = await readFile(join(repoRoot, path));
  const oracle = JSON.parse(await readFile(join(tenantRoot, "test/fixtures/generic-job/integer-addition.oracle.json"), "utf8"));
  return [await fullHelloInputs(product), { key: "integer-addition", scenarioId: oracle.scenarioId,
    members: [{ memberRef: "urn:" + product.sha256Bytes(bytes), path: "integer-addition.md", sourceLocator: "repo://odd_glc/" + path, base64: bytes.toString("base64") }],
    taskData: { scenarioId: oracle.scenarioId, request: "Implement the complete ordinary request. Derive and assess its requirements and design through the native lifecycle; preserve unresolved meaning." },
    evaluationData: oracle }];
}

/** Optional preparation data authoring, never runtime observation. Each cohort
 * row supplies native dependency identity fields plus its physical resource;
 * native record decoding supplies the inventories. The full records and
 * immutable installed dependencies are subsequently observed by ABI itself.
 */
export async function prepareFullSandboxManagementEnvironment({ root, product, gtl, abiArtifact, cohort, pythonPath, pythonVersion, accessBounds }) {
  const configurationRoot = await realpath(root);
  const permitted = "/Users/jim/Library/Application Support/ABIogenesis/candidates/T287-MGMT03-ODD-";
  assert.ok(configurationRoot.startsWith(permitted) && configurationRoot.length > permitted.length && !configurationRoot.slice(permitted.length).includes("/"), "new private MGMT03 odd_glc configuration root");
  assert.ok(isAbsolute(pythonPath), "explicit Python executable, no PATH discovery");
  assert.equal(await realpath(pythonPath), pythonPath, "canonical Python executable");
  const python = await exec(pythonPath, ["--version"], { timeout: 10000, maxBuffer: 1048576 });
  assert.equal(python.stdout.trim(), pythonVersion, "exact tested Python version");
  assert.match(pythonVersion, /^Python 3\./u);
  const dependencies = [], resources = [], contextContents = {}, contexts = [];
  for (const name of ["source", "representation", "axiom"]) {
    const { dependency, resource } = cohort[name];
    assert.equal(resource.dependencyRef, dependency.dependencyRef);
    assert.equal(await realpath(resource.root), resource.root, "canonical exact cohort root");
    assert.equal(await realpath(resource.recordPath), resource.recordPath, "canonical exact cohort record");
    const bytes = await readFile(resource.recordPath);
    assert.equal(product.sha256Bytes(bytes), dependency.recordDigest, "prospectively selected " + name + " record");
    const members = product.runEnvironmentRecordMembers(dependency.recordFormat, bytes);
    dependencies.push({ ...dependency, inventoryDigest: gtl.stdoInventoryDigest(members), members });
    resources.push(structuredClone(resource));
  }
  assert.equal(dependencies[0].basisRef, FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS, "RC7 runtime basis; source-development RC4 is unchanged");
  assert.equal(dependencies[0].recordDigest, FULL_SANDBOX_MANAGEMENT_SOURCE_MANIFEST, "exact accepted RC7 source manifest");
  const sourceMembers = [];
  for (const path of FULL_SANDBOX_MANAGEMENT_PATHS.slice(0, 3)) {
    const bytes = await readFile(join(cohort.source.resource.root, path));
    const member = { memberRef: "member://odd-glc/runtime-management/" + path, path, byteCount: bytes.length, digest: product.sha256Bytes(bytes) };
    assert.ok(dependencies[0].members.some(row => row.path === path && row.digest === member.digest), "declared source inventory member");
    sourceMembers.push(member); contextContents[member.memberRef] = bytes;
  }
  contexts.push({ contextRef: "context://odd-glc/runtime-management/rc7@5", sourceLocator: dependencies[0].basisRef,
    inventoryDigest: product.sha256Canonical(sourceMembers), members: sourceMembers });
  const localRoot = join(configurationRoot, "odd-glc-context"), localMembers = [], localInventory = [];
  await mkdir(localRoot);
  for (const path of FULL_SANDBOX_MANAGEMENT_PATHS.slice(3)) {
    const bytes = await readFile(join(repoRoot, path));
    await save(localRoot, path, bytes);
    const digest = product.sha256Bytes(bytes), memberRef = "member://odd-glc/runtime-management/" + path;
    localMembers.push({ memberRef, path, byteCount: bytes.length, digest });
    localInventory.push({ path, type: "file", digest, target: null }); contextContents[memberRef] = bytes;
  }
  localInventory.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const record = { kind: "run_environment_member_inventory", schemaVersion, members: localInventory };
  const recordPath = await save(configurationRoot, "odd-glc-context-inventory.json", product.canonicalJson(record) + "\n");
  const localDigest = product.sha256Canonical(localInventory), localBasis = "basis://odd-glc/runtime-management/" + localDigest.slice(7);
  const localDependency = { dependencyRef: "dependency://odd-glc/runtime-management/local-meaning@5", basisRef: localBasis,
    recordRef: "record://odd-glc/runtime-management/" + localDigest.slice(7), recordDigest: await product.sha256File(recordPath),
    recordFormat: "member_inventory@1", inventoryDigest: gtl.stdoInventoryDigest(localInventory), members: localInventory };
  dependencies.push(localDependency); resources.push({ dependencyRef: localDependency.dependencyRef, root: localRoot, recordPath });
  contexts.push({ contextRef: "context://odd-glc/runtime-management/local-meaning@5", sourceLocator: localBasis,
    inventoryDigest: product.sha256Canonical(localMembers), members: localMembers });
  const artifact = async (path, uri) => {
    const bytes = await readFile(join(cohort.representation.resource.root, path)), value = JSON.parse(bytes);
    return { path, uri: uri ?? value.uri, byteDigest: product.sha256Bytes(bytes),
      canonicalDigest: path.endsWith("logical-constraint-map.json") ? value.map_sha256 : product.sha256Canonical(value) };
  };
  const representationPath = "build_tenants/axiom_indexer/representation/stdo-v2.5.0-rc.7/";
  const environmentBasis = { kind: "run_environment_declaration", schemaVersion,
    declarationRef: "environment://odd-glc/generic-lifecycle/runtime-management-rc7@5", dependencies, contexts,
    corpusAccess: { kind: "axiom_indexer", sourceDependencyRef: dependencies[0].dependencyRef,
      representationDependencyRef: dependencies[1].dependencyRef, axiomDependencyRef: dependencies[2].dependencyRef,
      program: await artifact(representationPath + "axiomatic-program.json"),
      map: await artifact(representationPath + "logical-constraint-map.json", "urn:stdo-representation:map:stdo-v2.5.0-rc.7"),
      executablePath: "build_tenants/core/code/ac.py", outputContractPath: "skills/axiomatize-corpus/references/output-contract.md",
      pythonExecutableDigest: await product.sha256File(pythonPath), pythonVersion },
    accesses: [{ accessRef: "access://odd-glc/runtime-management/exact-corpus@5", operation: "validate", mode: "validation",
      frameIndexRefs: [], maxOutputBytes: accessBounds.maxOutputBytes, timeoutMs: accessBounds.timeoutMs }] };
  const runEnvironment = constructFullSandboxManagementEnvironment({ product, gtl, abiArtifact, environmentBasis, contextContents });
  const runEnvironmentResources = { dependencies: resources, pythonPath, operations: ["read_context", "validate"] };
  await save(configurationRoot, "run-environment.json", runEnvironment);
  await save(configurationRoot, "run-environment-resources.json", runEnvironmentResources);
  return { runEnvironment, runEnvironmentResources, contextSnapshot: { root: localRoot, recordPath,
    recordDigest: localDependency.recordDigest }, noAccessOperationExecuted: true, noLiveActors: true };
}

export async function buildFullSandboxProduct({ product, gtl, abiArtifact, root, runEnvironment, freshNative = false, ids = FULL_SANDBOX_IDS }) {
  const built = constructFullSandboxPackage({ product, gtl, abiArtifact, runEnvironment, freshNative, ids });
  const packageRoot = join(root, "development-product"); await mkdir(packageRoot);
  for (const [path, bytes] of Object.entries(built.files)) await save(packageRoot, path, bytes);
  const artifacts = join(root, "artifacts"); await mkdir(artifacts);
  const packed = await exec("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: packageRoot, maxBuffer: 10000000 });
  const artifactPath = join(artifacts, JSON.parse(packed.stdout)[0].filename);
  const basis = { ...ids, artifactDigest: await product.sha256File(artifactPath),
    productContentDigest: built.productContentDigest, manifestDigest: product.sha256Canonical(built.manifest) };
  await save(root, "package-basis.json", { ...basis, artifactPath, packageRoot, payloadInventory: built.payloadInventory });
  return { ...built, basis, artifactPath, packageRoot };
}

export async function prepareFullSandbox({ runRoot, candidatePath, configurationPath } = {}) {
  assert.ok(configurationPath && isAbsolute(configurationPath), "explicit absolute preparation configuration path required");
  const configuration = JSON.parse(await readFile(configurationPath, "utf8"));
  const freshNative = configuration.freshNative === true, ids = configuration.consumerIdentity ?? FULL_SANDBOX_IDS;
  assert.deepEqual(Object.keys(configuration).sort(), [...(configuration.runEnvironment === undefined ? ["transport"] : ["transport", "runEnvironment", "runEnvironmentResources"]),
    ...(freshNative ? ["freshNative", "consumerIdentity", "selectedJobKeys"] : [])].sort(), "closed preparation configuration");
  if (freshNative) {
    assert.ok(configuration.runEnvironment && configuration.runEnvironmentResources, "fresh native assessors require an explicitly selected role environment and physical resources");
    assert.equal(ids.programRef, FULL_SANDBOX_IDS.programRef);
    assert.ok(Array.isArray(configuration.selectedJobKeys) && configuration.selectedJobKeys.length > 0 && new Set(configuration.selectedJobKeys).size === configuration.selectedJobKeys.length);
  }
  const pin = await readFullSandboxCandidate(candidatePath);
  let { product, gtl, abg, validator, installedPublic } = await installedFullSandboxApis(pin.installedRoot);
  const runEnvironment = configuration.runEnvironment === undefined ? undefined
    : gtl.constructRunEnvironmentDeclaration(configuration.runEnvironment);
  const transport = await prepareFullSandboxTransport(configuration.transport, { product, abg });
  const scratch = await realpath(runRoot ?? await mkdtemp(join(tmpdir(), "odd-glc-full-sandbox-")));
  assert.deepEqual(await readdir(scratch), [], "prepare requires a fresh empty sandbox resource root");
  console.error(JSON.stringify({ phase: "full_sandbox_prepare", scratch }));
  await save(scratch, "preparation-configuration.json", configuration);
  await save(scratch, "transport-basis.json", transport);
  const abiRequest = { artifactPath: pin.artifactPath, artifactRef: basename(pin.artifactPath), ...expected(pin) };
  const abiVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: abiRequest });
  assert.equal(abiVerification.kind, "product_verification_success", JSON.stringify(abiVerification));
  const abiArtifact = abiVerification.verifiedArtifact;
  const built = await buildFullSandboxProduct({ product, gtl, abiArtifact, root: scratch, runEnvironment, freshNative, ids });
  const consumerRequest = { artifactPath: built.artifactPath, artifactRef: basename(built.artifactPath), ...expected(built.basis) };
  const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
  assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));
  const hash = product.sha256Canonical, coord = (ref, value = { ref }) => ({ ref, digest: hash(value) });
  let ordinal = 0, closeHandoff = null, environment = null;
  let cliPath = join(pin.installedRoot, "build/code/src/public/cli.js");
  const calls = [], actor = { actor: coord(actorRef), attribution: coord("attribution://odd-glc/full-sandbox") };
  const callerState = { calls,
    get ordinal() { return ordinal; }, set ordinal(value) { ordinal = value; },
    get closeHandoff() { return closeHandoff; }, set closeHandoff(value) { closeHandoff = value; },
    get cliPath() { return cliPath; }, get product() { return product; }, get installedPublic() { return installedPublic; } };
  const { call, authorized, reopen, invoke } = fullSandboxSetupCalls({ scratch, abiArtifact, abiRequest, hash, coord, calls, state: callerState });
  const products = [{ verification: abiVerification, request: abiRequest }, { verification: consumerVerification, request: consumerRequest }];
  for (const [i, item] of products.entries()) {
    const v = item.verification.verifiedArtifact;
    item.packed = { kind: "product_verification_artifact_resource", schemaVersion, artifactPath: item.request.artifactPath,
      artifact: { ref: v.artifactRef, digest: v.artifactDigest }, productContent: { ref: "product-content://abiogenesis/" + v.productContentDigest.slice(7), digest: v.productContentDigest },
      descriptor: item.verification.coordinates.descriptor, contributionManifest: { ref: v.contributionManifestRef, digest: v.contributionManifestDigest },
      manifestDigest: v.manifestDigest, productId: v.productId, packageName: v.packageName, packageVersion: v.packageVersion };
    const request = await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
      { targetKind: "packed_artifact", artifact: item.packed.artifact, productContent: item.packed.productContent, descriptor: item.packed.descriptor,
        contributionManifest: item.packed.contributionManifest, declaredDependencies: v.declaredDependencies,
        compatibilityInputs: v.compatibilityRefs.map(compatibilityRef => ({ compatibilityRef, subjectRef: item.packed.productContent.ref })) },
      { kind: "product_verification_resources", schemaVersion, targetKind: "packed_artifact", packedArtifact: item.packed });
    item.receipt = await invoke(request, "verify-" + i);
    item.reference = { invocation: { ref: request.invocation.invocationRef, digest: request.invocation.invocationDigest }, outcome: item.receipt.ownerOutput.value.verifiedArtifact };
  }
  const verifiedProducts = products.map(p => p.verification.verifiedArtifact);
  const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion, memberKey: "resolve", verifiedArtifacts: verifiedProducts });
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
  const lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
  await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    { requirements: verifiedProducts.map(p => ({ productId: p.productId, packageVersion: p.packageVersion, requiredContractRefs: [], requiredCapabilityRefs: [] })), verifiedCandidates: products.map(p => p.reference) },
    { kind: "product_resolution_resource_assertion", schemaVersion, verifiedPreimages: products.map(p => ({ verification: p.reference, verifiedArtifact: p.verification.verifiedArtifact, verificationOutput: p.receipt.ownerOutput })),
      nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] } }, { verification_references: products.map(p => p.reference) }), "resolve");
  const eventLogPath = join(scratch, "events/runtime.events.jsonl"); await mkdir(dirname(eventLogPath));
  const installed = [], installTargets = products.map((_, i) => join(scratch, "products", i === 0 ? "abiogenesis" : "odd_glc"));
  for (const [i, item] of products.entries()) {
    const request = await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
      { verifiedArtifact: item.verification.coordinates.verifiedArtifact, descriptor: item.packed.descriptor, contributionManifest: item.packed.contributionManifest,
        resolvedLock: lock, targetRoot: installTargets[i], installPolicy: "clean" },
      { kind: "product_install_resource_assertion", schemaVersion, eventResource: closeHandoff === null
        ? { kind: "new_abg_event_resource", schemaVersion, eventLogPath, locatorDigest: hash({ kind: "abg_event_log_locator", eventLogPath }) } : reopen(),
        packedArtifact: item.packed, verifiedArtifact: item.verification.verifiedArtifact, resolvedLock },
      { dependency_lock: lock, verification_references: [item.reference], actor });
    await invoke(request, "install-" + i);
    const row = abg.projectAdmittedProductInstallByInvocationRef(abg.projectExactPrefixArtifactTruth(closeHandoff.prefix), request.invocation.invocationRef);
    assert.ok(row); installed.push(row);
  }
  const abiRoot = installed[0].install.installedRoot;
  ({ product, gtl, abg, validator, installedPublic } = await installedFullSandboxApis(abiRoot));
  cliPath = join(abiRoot, "build/code/src/public/cli.js");
  const consumerRoot = installed[1].install.installedRoot;
  const publicationBytes = await readFile(join(consumerRoot, "build/publication.json"));
  assert.equal(product.sha256Bytes(publicationBytes), built.payloadInventory.find(row => row.path === "build/publication.json").sha256);
  const publication = materializeD1Publication({ gtl, identity: built.basis, publicationData: JSON.parse(publicationBytes) });
  const publications = [...nativeFullSandboxPublications(gtl, abiArtifact, freshNative), publication];
  const lifecycle = publication.semanticJobLifecycle;
  assert.ok(lifecycle && !publication.semanticLifecycle && !publication.requirementHandoffs);
  const availableInputs = await ordinarySandboxInputs(product), executable = await realpath(process.execPath);
  const inputs = freshNative ? configuration.selectedJobKeys.map(key => { const rows = availableInputs.filter(row => row.key === key); assert.equal(rows.length, 1, "exact selected ordinary job"); return rows[0]; }) : availableInputs;
  const jobs = [];
  // Static workspace/install/catalog/conformance setup only. This loop does
  // not run intake, a semantic stage, C0, C1 or C2.
  for (const ordinary of inputs) {
    const jobRoot = join(scratch, "jobs", ordinary.key), workspaceRoot = join(scratch, "subject-" + ordinary.key);
    const input = constructOrdinaryJobInput({ product, gtl, input: ordinary, executable, ...(freshNative ? { lifecycle } : {}) });
    await save(jobRoot, "ordinary-input.json", input);
    const created = await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
      { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" },
      { kind: "workspace_resource_assertion", schemaVersion, targetRoot: workspaceRoot, targetRootDigest: hash({ kind: "workspace_target", targetRoot: workspaceRoot }) }, { actor }), ordinary.key + "-workspace");
    if (freshNative) {
      for (const member of input.members) await save(workspaceRoot, member.path, Buffer.from(member.base64, "base64"));
      await save(workspaceRoot, input.taskData.nativeLifecycle.rubricPath, product.canonicalJson(lifecycle) + "\n");
    }
    const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
    const authorityManifest = { workspaceId: workspaceManifest.workspaceRef, canonicalRoot: workspaceManifest.canonicalRoot, authorityMode: "trusted_developer", authorizedActorRef: actorRef };
    const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ ...authorityManifest,
      authorityManifestRef: "manifest://odd-glc/full-sandbox/" + ordinary.key, authorityManifestDigest: hash(authorityManifest) });
    // Operational roots stay outside the application subject. Context "."
    // cannot contain the builder, event log or preparation resources.
    const roots = { toolchainRoot: installTargets[0], productRoot: consumerRoot, eventLogRoot: dirname(eventLogPath),
      runtimeStateRoot: join(jobRoot, "runtime"), projectionRoot: join(jobRoot, "projections"), archiveRoot: join(jobRoot, "archives") };
    const rootFields = { toolchain: "toolchainRoot", product: "productRoot", event_log: "eventLogRoot", runtime_state: "runtimeStateRoot", projection: "projectionRoot", archive: "archiveRoot" };
    const bound = await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
      { workspaceAuthority: { ref: workspaceAuthority.authorityBasisId, digest: workspaceAuthority.authorityBasisDigest }, installedSet: installed.map(row => product.productInstallCoordinate(row.install)), resolvedLock: lock,
        declaredRoots: Object.entries(rootFields).map(([rootKind, field]) => ({ rootKind, path: roots[field] })) },
      { kind: "product_workspace_binding_resource_assertion", schemaVersion, eventResource: reopen(), workspaceAuthority, workspaceManifest,
        admittedInstalls: installed.map(row => row.install), resolvedLock, declaredRoots: roots },
      { product_set: installed.map(row => product.productInstallCoordinate(row.install)), dependency_lock: lock, actor }), ordinary.key + "-bind");
    environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, bound.ownerOutput.value.binding);
    assert.equal(environment.kind, "exact_prefix_workspace_environment");
    const boundSlots = { workspace_binding: bound.ownerOutput.value.binding, product_set: environment.productInstalls.map(product.productInstallCoordinate), dependency_lock: lock, actor };
    const catalogReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      { workspaceBinding: boundSlots.workspace_binding, descriptors: products.map(p => p.packed.descriptor), contributionManifests: products.map(p => p.packed.contributionManifest), resolvedLock: lock },
      { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopen(), workspaceBinding: environment.workspaceBinding, resolvedLock, verifiedProducts,
        admittedInstalls: environment.productInstalls, publications }, boundSlots), ordinary.key + "-catalog");
    const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit", readinessBasis: {
      workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts, installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
    const allowlist = catalog.entries.filter(r => r.programMembershipRefs.includes(FULL_SANDBOX_IDS.programRef)).map(r => r.handle).sort();
    const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist }, { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), ordinary.key + "-view");
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist), binding = environment.workspaceBinding;
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist: catalogView.allowlist };
    jobs.push(await completeFullSandboxJob({ product, gtl, abg, validator, configuration, runEnvironment, environment, publication, catalog, catalogView, boundSlots, catalogScope, lock, ordinary, input, roots, jobRoot, workspaceRoot, allowlist, hash, coord, authorized, invoke }));
  }
  return publishFullSandboxPreparation({ product, hash, call, reopen, callerState, pin, abiArtifact, built, lock, publication, abiRoot, consumerRoot, cliPath, lifecycle, transport, runEnvironment, freshNative, scratch, installed, jobs });
}

/** Continue only the uncompleted setup tail after an eventless conformance
 * refusal. Retained receipts select prior facts; Public calls authenticate the
 * current prefix. No prior setup operation, package, install or job is rerun. */
export async function continueFullSandboxPreparation({ runRoot, candidatePath, configurationPath }) {
  const scratch = await realpath(runRoot), read = async path => JSON.parse(await readFile(path, "utf8"));
  const configurationBytes = await readFile(configurationPath);
  assert.deepEqual(configurationBytes, await readFile(join(scratch, "preparation-configuration.json")), "same selected preparation configuration");
  const configuration = JSON.parse(configurationBytes.toString("utf8"));
  assert.equal(configuration.freshNative, true); assert.equal(configuration.selectedJobKeys.length, 1, "one selected unfinished job");
  const key = configuration.selectedJobKeys[0], pin = await readFullSandboxCandidate(candidatePath);
  const { product, gtl, abg, validator, installedPublic } = await installedFullSandboxApis(pin.installedRoot);
  const hash = product.sha256Canonical, coord = (ref, value = { ref }) => ({ ref, digest: hash(value) });
  const labels = ["verify-0", "verify-1", "resolve", "install-0", "install-1", key + "-workspace", key + "-bind", key + "-catalog", key + "-view"];
  const receipts = [], calls = []; let closeHandoff = null;
  for (const [i, label] of labels.entries()) {
    const value = await read(join(scratch, `receipts/${String(i).padStart(2, "0")}-${label}.json`));
    assert.equal(value.kind, "installed_definition_call_transport_result");
    assert.equal(value.receipt.exitCode, 0); assert.equal(value.receipt.ownerOutput?.outcomeKind, "result");
    const receipt = value.receipt; receipts.push(receipt);
    calls.push({ label, definitionKey: receipt.definitionKey, invocationRef: receipt.invocationRef });
    if (receipt.resources?.eventResource?.closeHandoff) closeHandoff = receipt.resources.eventResource.closeHandoff;
  }
  assert.equal(abg.validateDurablePrefixCoordinate(closeHandoff?.prefix), true);
  const failedPath = join(scratch, `receipts/09-${key}-lifecycle-conformance.json`), failed = await read(failedPath);
  assert.equal(failed.acquisitionKind, "eventless"); assert.equal(failed.receipt.resources, null);
  assert.equal(failed.receipt.failure?.fault?.code, "invalid_resource_assertion");
  assert.deepEqual(failed.receipt.definitionKey, { memberKey: "gtl_program", operationId: "abg.operation.conformance.evaluate" });
  const bound = receipts[6], environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, bound.ownerOutput.value.binding);
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const installed = receipts.slice(3, 5).map(receipt => abg.projectAdmittedProductInstallByInvocationRef(environment.artifactTruth, receipt.invocationRef));
  assert.ok(installed.every(Boolean));
  const abiRoot = installed[0].install.installedRoot, consumerRoot = installed[1].install.installedRoot;
  assert.equal(installed[0].install.productId, pin.productId);
  await assertInstalledBuilderUnchanged(product, { environment });
  const builtBasis = await read(join(scratch, "package-basis.json")), built = { basis: builtBasis, payloadInventory: builtBasis.payloadInventory };
  assert.equal(builtBasis.productId, configuration.consumerIdentity.productId);
  const abiRequest = { artifactPath: pin.artifactPath, artifactRef: basename(pin.artifactPath), ...expected(pin) };
  // Actual in-process Product ownership, not rehydrated verification authority.
  const verify = async request => {
    const value = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request });
    assert.equal(value.kind, "product_verification_success", JSON.stringify(value)); return value.verifiedArtifact;
  };
  const abiArtifact = await verify(abiRequest), consumerArtifact = await verify({ artifactPath: builtBasis.artifactPath, artifactRef: basename(builtBasis.artifactPath), ...expected(builtBasis) });
  const verifiedProducts = [abiArtifact, consumerArtifact];
  const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion, memberKey: "resolve", verifiedArtifacts: verifiedProducts });
  assert.equal(resolvedLock.kind, "resolved_product_lock");
  assert.equal(resolvedLock.lockId, bound.resources.resolvedLock.ref); assert.equal(resolvedLock.lockDigest, bound.resources.resolvedLock.digest);
  const lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
  const publicationBytes = await readFile(join(consumerRoot, "build/publication.json"));
  assert.equal(product.sha256Bytes(publicationBytes), built.payloadInventory.find(row => row.path === "build/publication.json").sha256);
  const publication = materializeD1Publication({ gtl, identity: builtBasis, publicationData: JSON.parse(publicationBytes) });
  const lifecycle = publication.semanticJobLifecycle, publications = [...nativeFullSandboxPublications(gtl, abiArtifact, true), publication];
  const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit", readinessBasis: {
    workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts, installedProducts: installed.map(row => row.candidate), publications } });
  assert.equal(catalog.kind, "graph_function_catalog");
  const allowlist = catalog.entries.filter(row => row.programMembershipRefs.includes(FULL_SANDBOX_IDS.programRef)).map(row => row.handle).sort();
  const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist), catalogReceipt = receipts[7], viewReceipt = receipts[8];
  const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist: catalogView.allowlist };
  const actor = { actor: coord(actorRef), attribution: coord("attribution://odd-glc/full-sandbox") };
  const boundSlots = { workspace_binding: bound.ownerOutput.value.binding, product_set: environment.productInstalls.map(product.productInstallCoordinate), dependency_lock: lock, actor };
  const jobRoot = join(scratch, "jobs", key), workspaceRoot = environment.workspaceAuthorityBasis.canonicalRoot, roots = environment.workspaceBinding.roots;
  const ordinary = (await ordinarySandboxInputs(product)).find(input => input.key === key); assert.ok(ordinary);
  const input = await read(join(jobRoot, "ordinary-input.json"));
  assert.deepEqual(input, constructOrdinaryJobInput({ product, gtl, input: ordinary, executable: await realpath(process.execPath), lifecycle }));
  for (const member of input.members) assert.deepEqual(await readFile(join(workspaceRoot, member.path)), Buffer.from(member.base64, "base64"));
  assert.equal(await readFile(join(workspaceRoot, input.taskData.nativeLifecycle.rubricPath), "utf8"), product.canonicalJson(lifecycle) + "\n");
  const runEnvironment = gtl.constructRunEnvironmentDeclaration(configuration.runEnvironment);
  assert.deepEqual(publication.runEnvironments, [runEnvironment]);
  const transport = await assertFullSandboxTransportUnchanged(await read(join(scratch, "transport-basis.json")), { product, abg });
  const cliPath = join(abiRoot, "build/code/src/public/cli.js");
  const callerState = { ordinal: 10, closeHandoff, calls, cliPath, product, installedPublic, retainedFailures: 1 };
  const setup = fullSandboxSetupCalls({ scratch, abiArtifact, abiRequest, hash, coord, calls, state: callerState });
  const { call, authorized, reopen } = setup;
  let retainedConformance = null;
  try { retainedConformance = await read(join(scratch, `receipts/10-${key}-lifecycle-conformance.json`)); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const invoke = async (prepared, label) => {
    if (retainedConformance === null) return setup.invoke(prepared, label);
    assert.equal(label, key + "-lifecycle-conformance");
    assert.equal(retainedConformance.receipt.exitCode, 0);
    assert.equal(retainedConformance.receipt.ownerOutput?.value?.disposition, "passed");
    const retainedCall = await read(join(scratch, `calls/10-${label}.jsonl`));
    assert.equal(hash(retainedCall.invocation), hash(prepared), "exact retained conformance call; no reexecution");
    calls.push({ label, definitionKey: prepared.invocation.definitionKey, invocationRef: prepared.invocation.invocationRef });
    return retainedConformance.receipt;
  };
  if (retainedConformance !== null) {
    const retained = await read(join(scratch, "setup-continuation.json"));
    assert.equal(retained.closeHandoff.prefix.coordinateDigest, closeHandoff.prefix.coordinateDigest);
    assert.equal(retained.consumerArtifact.artifactDigest, builtBasis.artifactDigest);
  }
  if (retainedConformance === null) await save(scratch, "setup-continuation.json", { failedPath, failedDigest: await product.sha256File(failedPath), priorSuccessfulCalls: calls,
    closeHandoff, abiRoot, consumerRoot, abiArtifact: pin, consumerArtifact: builtBasis, inputDigest: hash(input),
    retainedInstalledProducts: environment.productInstalls.map(product.productInstallCoordinate), noPriorCallReexecution: true, noActorDispatch: true });
  const job = await completeFullSandboxJob({ product, gtl, abg, validator, configuration, runEnvironment, environment, publication, catalog, catalogView,
    boundSlots, catalogScope, lock, ordinary, input, roots, jobRoot, workspaceRoot, allowlist, hash, coord, authorized, invoke });
  return publishFullSandboxPreparation({ product, hash, call, reopen, callerState, pin, abiArtifact, built, lock, publication, abiRoot, consumerRoot, cliPath, lifecycle, transport,
    runEnvironment, freshNative: true, scratch, installed, jobs: [job] });
}

function transportPacket(prepared) {
  const resource = prepared.resources.eventResource;
  const acquisition = resource === undefined ? { kind: "eventless" } : resource.kind === "new_abg_event_resource"
    ? { kind: "new", eventLogPath: resource.eventLogPath } : { kind: "reopen", closeHandoff: resource.closeHandoff };
  return JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion, acquisition, invocation: prepared }) + "\n";
}


async function assertInstalledBuilderUnchanged(product, basis) {
  const rows = [];
  for (const install of basis.environment.productInstalls) {
    assert.equal(await product.installedProductContentMatches(install), true, "native installed Product inventory remains exact: " + install.productId);
    rows.push({ installId: install.installId, productId: install.productId, productContentDigest: install.productContentDigest });
  }
  return rows;
}

export async function executeFullSandbox(recordPath, environment = process.env, { afterReceiptPath } = {}) {
  assert.equal(environment.ODD_GLC_ALLOW_FULL_SANDBOX_LIVE, "1", "a separate explicit live activation is required");
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  assert.equal(record.kind, "odd_glc_full_sandbox_prepared"); assert.equal(record.schemaVersion, "3", "fresh preparation with explicit frozen transport required");
  const { product, abg, installedPublic } = await installedFullSandboxApis(record.abiRoot);
  const transport = await assertFullSandboxTransportUnchanged(record.transport, { product, abg });
  const basis = JSON.parse(await readFile(join(record.scratch, "readback-basis.json"), "utf8"));
  assert.equal(await product.sha256File(record.launchPath), record.launchDigest);
  const packet = JSON.parse(await readFile(record.launchPath, "utf8"));
  let prepared = packet.invocation;
  assert.equal(product.sha256Canonical(prepared.invocation.request.input.value), record.inputDigest);
  if (afterReceiptPath !== undefined) {
    // An explicit external job start may reopen the preceding job's resource.
    // This is not lifecycle continuation or a controller: exactly one start
    // follows, with unchanged job/Program and no host dispatch decisions.
    const after = JSON.parse(await readFile(afterReceiptPath, "utf8"));
    assert.equal(after.kind, "installed_definition_call_transport_result");
    const closeHandoff = after.receipt.resources.eventResource.closeHandoff;
    assert.equal(abg.validateDurablePrefixCoordinate(closeHandoff.prefix), true);
    assert.equal(closeHandoff.prefix.eventLogRef, record.setupPrefix.eventLogRef);
    assert.deepEqual(closeHandoff.prefix.storeIdentity, record.setupPrefix.storeIdentity);
    assert.ok(closeHandoff.prefix.prefixLength >= record.setupPrefix.prefixLength);
    abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix));
    const eventResource = { kind: "reopen_abg_event_resource", schemaVersion, closeHandoff, handoffDigest: product.sha256Canonical(closeHandoff) };
    const digest = product.sha256Canonical(eventResource);
    prepared = definitionCall({ publicApi: installedPublic, product, verified: basis.abiArtifact,
      ...prepared.invocation.definitionKey, ordinal: record.ordinal + 1, request: prepared.invocation.request,
      slots: { ...prepared.invocation.invocationAuthority.slots, transport_steering: { ref: "transport-steering://abiogenesis/" + digest.slice(7), digest } },
      resources: { ...prepared.resources, eventResource } });
  }
  const installedBefore = await assertInstalledBuilderUnchanged(product, basis);
  const launchPath = await save(record.scratch, "live-start.jsonl", transportPacket(prepared));
  const launchClaim = join(record.scratch, "live-attempt.json");
  await save(record.scratch, "live-attempt.json", { startedAt: new Date().toISOString(), launchDigest: await product.sha256File(launchPath),
    preparedLaunchDigest: record.launchDigest, afterReceiptPath: afterReceiptPath ?? null, installedBefore, transport });
  let result;
  try {
    result = await exec(process.execPath, [record.cliPath, "--jsonl", launchPath], { cwd: record.scratch,
      env: fullSandboxTransportEnvironment(transport, environment),
      timeout: transport.configuration.wholeRunMs, maxBuffer: 128 * 1024 * 1024 });
  } catch (error) {
    await save(record.scratch, "live-process-failure.json", { code: error.code ?? null, signal: error.signal ?? null, killed: error.killed ?? false, message: error.message, launchClaim });
    result = { stdout: error.stdout ?? "", stderr: error.stderr ?? String(error) };
  }
  await save(record.scratch, "live-receipt.json", result.stdout); await save(record.scratch, "live-stderr.log", result.stderr);
  assert.ok(result.stdout.trim(), "native CLI returned no receipt; preserve process failure and prefix, do not retry");
  const outcome = JSON.parse(result.stdout); assert.equal(outcome.kind, "installed_definition_call_transport_result");
  assert.equal(outcome.receipt.ownerOutput.outcomeKind, "result", result.stdout);
  if (record.freshNative !== true) assert.equal(outcome.receipt.ownerOutput.value.disposition, "completed", result.stdout);
  // The fresh declared graph may lawfully reject; retain its genuine receipt
  // for the existing status/result/replay route without implying completion.
  return outcome.receipt;
}

// Observational classification only. Unmatched independent probes are not
// executed here and are not application failures. Design never receives them.
export function evaluateOrdinaryJobObservation({ output, input, workspaceRoot }) {
  const oracle = input.evaluationData, commands = output.evidence?.executionObservation?.commandResults ?? [];
  const targets = output.worksite?.targets ?? [], artifacts = output.evidence?.artifacts ?? [];
  const text = stream => Buffer.from(stream.payload, "base64").toString("utf8");
  const normal = command => !command.timedOut && command.processSignal === null && command.terminationConfirmed;
  const resolvedArgument = (command, value) => relative(workspaceRoot, resolve(workspaceRoot, command.relativeCwd, value));
  const implementations = targets.filter(row => row.role === "implementation").map(row => row.target.subject.relativePath);
  const executables = input.worksiteScope.executableCapabilities.map(row => row.executable);
  // Recognize only direct observations whose program and arguments are known.
  // Other lawful vectors, including probes within tests, remain review evidence.
  const direct = commands.filter(command => executables.includes(command.executable) && command.args.length > 0 &&
    !command.args[0].startsWith("-") && implementations.includes(resolvedArgument(command, command.args[0])));
  const cases = oracle.cases.map((wanted, ordinal) => {
    const observed = direct.filter(command => JSON.stringify(command.args.slice(1)) === JSON.stringify(wanted.arguments));
    const observations = observed.map(command => {
      const failures = [];
      if (!normal(command)) failures.push("execution_incomplete");
      if (wanted.exitStatus !== undefined && command.exitStatus !== wanted.exitStatus) failures.push("exit_status_mismatch");
      if (wanted.nonzeroExit && command.exitStatus === 0) failures.push("expected_nonzero_exit");
      if (wanted.stdout !== undefined && text(command.stdout) !== wanted.stdout) failures.push("stdout_mismatch");
      if (wanted.nonemptyStderr && text(command.stderr).length === 0) failures.push("expected_nonempty_stderr");
      return { observationRef: command.observationRef, failures };
    });
    return { ordinal, arguments: wanted.arguments,
      disposition: observations.length === 0 ? "unexecuted_probe" : observations.some(row => row.failures.length > 0) ? "observed_fail" : "observed_pass",
      observations };
  });
  const testCommands = commands.filter(command => executables.includes(command.executable) && command.args.includes("--test")).map(command => {
    const stdout = text(command.stdout), pass = stdout.match(/^# pass (\d+)$/mu), fail = stdout.match(/^# fail (\d+)$/mu);
    return { observationRef: command.observationRef, args: command.args, relativeCwd: command.relativeCwd,
      disposition: !normal(command) || command.exitStatus !== 0 || fail !== null && Number(fail[1]) > 0 ? "observed_fail" : "observed_pass",
      testPasses: pass === null ? null : Number(pass[1]), testFailures: fail === null ? null : Number(fail[1]) };
  });
  const countsKnown = testCommands.length > 0 && testCommands.every(row => row.testPasses !== null && row.testFailures !== null);
  const testPasses = countsKnown ? testCommands.reduce((sum, row) => sum + row.testPasses, 0) : null;
  const verifierArtifacts = targets.filter(row => row.role === "verifier").flatMap(row => {
    const artifact = artifacts.find(a => a.subjectRef === row.target.subject.subjectRef && a.role === "verifier_artifact");
    return artifact === undefined ? [] : [{ relativePath: row.target.subject.relativePath, ...artifact }];
  });
  const artifactCoverage = (oracle.requiredArtifacts ?? []).map(relativePath => {
    const target = targets.find(row => row.target.subject.relativePath === relativePath);
    return { relativePath, disposition: target && artifacts.some(a => a.subjectRef === target.target.subject.subjectRef)
      ? "present_in_admitted_evidence" : "not_in_admitted_evidence" };
  });
  const requiredTestFiles = (oracle.requiredTestFiles ?? []).map(relativePath => ({ relativePath,
    disposition: verifierArtifacts.some(a => a.relativePath === relativePath) ? "present_in_admitted_evidence" : "not_in_admitted_evidence" }));
  const minimumTestPasses = { required: oracle.minimumTestPasses, observed: testPasses,
    disposition: testPasses === null ? "unobserved" : testPasses >= oracle.minimumTestPasses ? "met" : "not_met" };
  const hasFailure = cases.some(row => row.disposition === "observed_fail") || testCommands.some(row => row.disposition === "observed_fail");
  const hasGap = cases.some(row => row.disposition === "unexecuted_probe") || minimumTestPasses.disposition !== "met" ||
    artifactCoverage.some(row => row.disposition === "not_in_admitted_evidence") ||
    requiredTestFiles.some(row => row.disposition === "not_in_admitted_evidence") || verifierArtifacts.length === 0;
  return { kind: "ordinary_job_observation_check", disposition: hasFailure ? "observed_fail" : hasGap ? "unqualified" : "observed_pass",
    applicationQualification: hasFailure ? "unqualified_observed_failure" : hasGap ? "unqualified_missing_independent_coverage" : "unqualified_pending_independent_semantic_review",
    cases, testCommands, minimumTestPasses, artifactCoverage, requiredTestFiles, verifierArtifacts,
    semanticReview: { disposition: "required", requiredTestRoles: oracle.requiredTestRoles ?? ["component", "user_acceptance"],
      commandObservationRefs: commands.map(command => command.observationRef),
      questions: ["Do the protected verifier artifacts actually exercise the application and required behaviors?",
        "Did the admitted execution select and execute the required component/UAT verification, including lawful discovery?",
        "Do governing/design artifacts preserve all original obligations, and which independent probes remain absent?"] },
    boundary: "Unexecuted_probe means no independently recognizable same-input observation, not proof the application failed or a probe never ran inside a verifier. Discovery and other valid vectors remain admitted evidence for semantic review. Counts, artifact presence and observed_pass do not accept the application; missing probes require separate authorized qualification." };
}

export async function freshFullSandboxReadback(recordPath) {
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  const basis = JSON.parse(await readFile(join(record.scratch, "readback-basis.json"), "utf8"));
  const receipt = JSON.parse(await readFile(join(record.scratch, "live-receipt.json"), "utf8")).receipt;
  const { product, abg, installedPublic } = await installedFullSandboxApis(record.abiRoot);
  const closeHandoff = receipt.resources.eventResource.closeHandoff, prefix = closeHandoff.prefix;
  const savedStart = JSON.parse(await readFile(join(record.scratch, "live-start.jsonl"), "utf8"));
  const originalInput = savedStart.invocation.invocation.request.input.value;
  assert.equal(product.sha256Canonical(originalInput), record.inputDigest);
  const validated = abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(prefix));
  const installedAfter = await assertInstalledBuilderUnchanged(product, basis);
  // Retain both fresh native reads before interpreting application coverage.
  // A failure of either read does not prevent attempting the other once.
  const publicReads = [];
  for (const memberKey of ["run_result", "run_replay"]) {
    try {
      const call = publicReadDefinition({ product, abg, installedPublic,
        workspaceAuthorityBasis: basis.environment.workspaceAuthorityBasis,
        workspaceBinding: basis.environment.workspaceBinding,
        admittedInstalls: basis.environment.productInstalls, install: { verified: basis.abiArtifact } },
      { closeHandoff, receipt }, memberKey);
      const path = await save(record.scratch, `read-${memberKey}.jsonl`, transportPacket(call));
      let result;
      try {
        result = await exec(process.execPath, [record.cliPath, "--jsonl", path], { cwd: record.scratch,
          env: { ...process.env, NODE_OPTIONS: "", ABG_TS_CLAUDE_COMMAND: "/unavailable/observational-read-no-actors" }, timeout: 300000, maxBuffer: 128 * 1024 * 1024 });
      } catch (error) {
        result = { stdout: error.stdout ?? "", stderr: error.stderr ?? String(error) };
        await save(record.scratch, `read-${memberKey}.process-failure.json`,
          { code: error.code ?? null, signal: error.signal ?? null, message: error.message });
      }
      const resultPath = await save(record.scratch, `read-${memberKey}.json`, result.stdout);
      await save(record.scratch, `read-${memberKey}.stderr`, result.stderr);
      const read = JSON.parse(result.stdout).receipt;
      assert.deepEqual(read.resources.eventResource.closeHandoff.prefix, prefix);
      const expectedAbsentResult = memberKey === "run_result" && receipt.ownerOutput.value.result === null &&
        ["blocked", "runtime_failed"].includes(receipt.ownerOutput.value.disposition);
      if (expectedAbsentResult) {
        assert.equal(read.ownerOutput.outcomeKind, "refusal");
        assert.equal(read.ownerOutput.value.code, "not_found");
        assert.equal(read.exitCode, 1);
      } else {
        assert.equal(read.ownerOutput.outcomeKind, "result", result.stdout); assert.equal(read.exitCode, 0);
      }
      if (memberKey === "run_result" && !expectedAbsentResult) assert.deepEqual(read.ownerOutput.value.projection.result, receipt.ownerOutput.value.result);
      else if (memberKey === "run_replay") {
        const replay = abg.projectRunSemanticReplayProjection(validated, receipt.ownerOutput.value.run.ref);
        assert.deepEqual(read.ownerOutput.value.projection.replay,
          { ref: replay.physicalCoordinates.scopedReplayRef, digest: replay.physicalCoordinates.scopedReplayDigest });
      }
      publicReads.push({ memberKey, disposition: "preserved_and_checked", resultPath, resultDigest: await product.sha256File(resultPath),
        ...(expectedAbsentResult ? { observation: "result_absent_not_found" } : {}) });
    } catch (error) {
      publicReads.push({ memberKey, disposition: "read_failed", message: error.message });
    }
  }
  await save(record.scratch, "public-readback.json", { prefix, publicReads });
  // Preserve the existing native SDK's detailed same-prefix projection, not
  // just the CLI summary coordinate. Environment/context joins remain native
  // evidence; the host does not reconstruct them from corpus or prompt files.
  const semanticReplay = abg.projectRunSemanticReplayProjection(validated, receipt.ownerOutput.value.run.ref);
  const semanticReplayPath = await save(record.scratch, "native-semantic-replay.json", semanticReplay);
  const semanticReplayEvidence = { path: semanticReplayPath, digest: await product.sha256File(semanticReplayPath), prefix,
    replay: { ref: semanticReplay.physicalCoordinates.scopedReplayRef, digest: semanticReplay.physicalCoordinates.scopedReplayDigest } };
  assert.ok(publicReads.every(row => row.disposition === "preserved_and_checked"), "native read failure; both attempts are retained, not an application-failure judgment");
  const run = receipt.ownerOutput.value.run, result = receipt.ownerOutput.value.result ?? null;
  if (receipt.ownerOutput.value.disposition !== "completed" || result === null) {
    const proof = { kind: "odd_glc_full_sandbox_observed_proof", status: "unqualified_no_completed_result",
      run, result, prefix, publicReads, semanticReplayEvidence, installedAfter, inputDigest: record.inputDigest,
      boundary: "Native result/replay retained. No completed lifecycle result exists for application qualification; this does not establish an application failure." };
    await save(record.scratch, "full-result-proof.json", proof);
    return proof;
  }
  const admission = abg.rehydrateInvocationAdmissionAtPrefix(validated, receipt.resources.invocationAdmission.ref);
  const admittedResult = abg.deriveInvocationSourceResultBasisAtPrefix(validated, {
    publicAuthorityDigest: savedStart.invocation.invocation.invocationDigest,
    runtimeInvocationRef: admission.invocationRef, invocationAdmissionRef: receipt.resources.invocationAdmission.ref,
    runId: run.ref, resultRef: result.ref,
  });
  assert.ok(admittedResult, "native owner must reconstruct the exact result");
  const output = admittedResult.sourceResultValue;
  assert.equal(product.isSemanticJobEnvelope(output), true, "native pure saved-envelope validation");
  assert.deepEqual(output.job, originalInput, "result belongs to this exact ordinary job, not the other input");
  assert.equal(output.basis.rootInputDigest, record.inputDigest);
  assert.equal(output.basis.invocationAdmissionRef, receipt.resources.invocationAdmission.ref);
  assert.deepEqual(output.declaration, basis.declaration);
  assert.equal(product.sha256Canonical(output.declaration), record.lifecycle.declarationDigest);
  assert.deepEqual(output.assets.map(a => a.stageRef), record.lifecycle.stageRefs);
  assert.ok(output.assets.every(a => a.assessment?.disposition === "satisfied"));
  assert.equal(output.applicationCoverage, "non_closing");
  assert.ok(output.bindingVersions.length > 0, "Requirements must instantiate assessed binding versions");
  const interpreted = evaluateOrdinaryJobObservation({ output, input: originalInput, workspaceRoot: record.workspaceRoot });
  const currentArtifactPaths = [];
  for (const target of output.worksite.targets) {
    const relativePath = target.target.subject.relativePath;
    const artifact = output.evidence.artifacts.find(row => row.subjectRef === target.target.subject.subjectRef);
    assert.ok(artifact, "admitted current artifact " + relativePath);
    const bytes = await readFile(join(record.workspaceRoot, relativePath));
    assert.equal(bytes.toString("base64"), artifact.base64, "physical bytes equal C2's admitted protected snapshot");
    currentArtifactPaths.push(relativePath);
  }
  const proof = { kind: "odd_glc_full_sandbox_observed_proof", status: interpreted.applicationQualification,
    run, result, prefix, publicReads, semanticReplayEvidence, sourceResultRef: admittedResult.sourceResultRef,
    jobRef: output.basis.jobRef, jobDigest: output.basis.jobDigest, inputDigest: record.inputDigest,
    assessedStageRefs: output.assets.map(a => a.stageRef), currentArtifactPaths, installedAfter,
    interpreted, applicationCoverage: output.applicationCoverage,
    boundary: "Native reads, identity and observed checks are retained independently of missing qualification probes. Independent semantic/UAT judgment and Executive acceptance remain separate." };
  await save(record.scratch, "full-result-proof.json", proof);
  return proof;
}
