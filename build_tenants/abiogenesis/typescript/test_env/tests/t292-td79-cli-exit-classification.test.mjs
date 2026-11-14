// T-292 TD-79, REQ-P-POLICY-022: the CLI's exit status `2` means that the CLI
// did not submit the call or the transport refused it, so no owning function
// was entered. A failure after the CLI has handed the call to the transport,
// other than the transport's typed refusal, exits `70`: an owner's typed
// execution fault, written as the transport result whose receipt carries it,
// or `transport_failure`, written only when carrying the call or encoding its
// outcome fails. The line's code tells the refusals apart as well: a request
// the CLI cannot read or decode is written as `invalid_transport_request`, and
// `transport_failure` is written only with `70`, after the call is submitted.
//
// T-293 B12 (RC14): the two historical inputs that once reached that fallback
// now meet their owners. A deeply nested cold call refuses as
// `invalid_definition_call` before any owner (2); a malformed admission
// authority string remains its typed `resource_admission` fault (70), now in a
// receipt that encodes. Otherwise valid cold calls with correct digests witness
// the existing 512-container bound, and a valid call that omits a defaulted
// member still reaches its owner. The fallback itself is proved by component
// substitution of the emitted CLI's transport import, labelled below.
//
// Each row runs the built CLI (`build/code/src/public/cli.js`, the file the
// package's `abg.cli` bin names) as its own process and pins the exit status,
// the one line it writes, an empty stderr, and the bytes and event count of one
// store that the ABG event store created and closed before the rows run. Each
// SDK check calls the same built transport in this process.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const tenant = fileURLToPath(new URL("../..", import.meta.url));
const load = (path) => import(pathToFileURL(join(tenant, "build/code/src", path)).href);
const [publicApi, product, abg, eventStore, admit, diagnostics] = await Promise.all([
  load("public/index.js"), load("product/index.js"), load("abg/index.js"), load("abg/event_store.js"),
  load("shared/admit/index.js"), load("shared/diagnostic_text.js"),
]);
const cliPath = join(tenant, "build/code/src/public/cli.js");
const manifest = JSON.parse(await readFile(join(tenant, "product-toolchain-manifest.json"), "utf8"));
const schemaVersion = "5.0.0";
const hash = product.sha256Canonical;
const coordinate = (ref) => ({ ref, digest: hash({ ref }) });

// The built Product's published contract catalog supplies every coordinate.
const contractCatalog = {
  productId: manifest.productId,
  productContentDigest: manifest.productContentDigest,
  catalogId: manifest.publicContractCatalog.catalogId,
  catalogVersion: schemaVersion,
  catalogDigest: manifest.publicContractCatalog.catalogDigest,
};

function definitionContractCoordinates(operationId) {
  const row = manifest.publicContractCatalog.rows.find((candidate) => candidate.contractId === operationId);
  const projection = publicApi.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find((candidate) => candidate.operationId === operationId);
  const slot = (member, name, contract) => contract === null ? null : {
    contractCatalog,
    flatRow: { contractId: operationId, contractVersion: schemaVersion, contractDigest: row.contractDigest },
    nestedSelector: { selectorKind: "operation_definition_slot", definitionKey: member.definitionKey, slot: name,
      definitionRef: contract.definitionRef },
  };
  return { operations: [{ operationId, members: projection.definitions.map((member) => ({
    memberKey: member.definitionKey.memberKey,
    slots: {
      request: slot(member, "request", member.requestContract),
      result: slot(member, "result", member.resultContract),
      refusal: slot(member, "refusal", member.refusalContract),
      nonTerminal: slot(member, "non_terminal", member.nonTerminalContract),
    },
  })) }] };
}

const definitionOf = (operationId, memberKey) => publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find((candidate) =>
  candidate.definitionKey.operationId === operationId && candidate.definitionKey.memberKey === memberKey);

// One well-formed call of a declared member. The grants are coordinates only:
// no row reaches the owner's grant reconstruction. A supplied slot value,
// capability grants included, replaces its default.
function definitionCall(operationId, memberKey, request, slotValues, resources) {
  const definition = definitionOf(operationId, memberKey);
  const slots = Object.fromEntries(["workspace_binding", "product_set", "dependency_lock", "catalog_scope",
    "execution_program", "graph_function", "input_contract", "session_policy", "capability_grants", "actor",
    "transport_steering", "verification_references", "execution_basis"].map((name) => [name, null]));
  Object.assign(slots, { capability_grants: {
    requiredCapabilityRefs: [...definition.capabilityRefs],
    grants: definition.capabilityRefs.map((_, index) => coordinate(`capability-grant://abiogenesis/td79/${memberKey}/${index}`)),
  } }, slotValues);
  return publicApi.constructInstalledPublicDefinitionCall({
    product, installedPublic: publicApi, definitionContractCoordinates: definitionContractCoordinates(operationId),
    contractCatalog, operationId, memberKey, request, slots, resources,
    requestRef: `public-request://abiogenesis/td79/${memberKey}`, correlationRef: "correlation://abiogenesis/td79",
    eventTime: "2026-11-12T00:00:00.000Z", provenanceRefs: ["provenance://abiogenesis/td79"],
  });
}

// `count` arrays, each but the innermost holding the next.
function nestedArrays(count) {
  let value = [];
  for (let level = 1; level < count; level += 1) value = [value];
  return value;
}

// Structurally valid unadmitted Run setup: the actual Run owner refuses it.
function absentSetupCatalog(root) {
  const digest = hash("unadmitted setup");
  const workspaceBinding = { kind: "workspace_binding_candidate", schemaVersion,
    bindingId: "binding://absent", bindingDigest: digest, workspaceId: "workspace://absent",
    authorityBasisId: "authority://absent", authorityBasisDigest: digest, authorizedActorRef: "actor://absent",
    productSetId: "products://absent", productSetDigest: digest, lockId: "lock://absent", lockDigest: digest,
    roots: Object.fromEntries(["toolchainRoot", "productRoot", "eventLogRoot", "runtimeStateRoot", "projectionRoot",
      "archiveRoot"].map((key) => [key, root])) };
  const resolvedLock = { kind: "resolved_product_lock", schemaVersion, lockId: workspaceBinding.lockId,
    lockDigest: digest, nativeContractClosureDigest: digest, rows: [], dependencyEdges: [] };
  return { kind: "graph_function_catalog", schemaVersion, basisDigest: digest, publicationDigests: [], entries: [],
    byHandle: {}, declarationEntries: [], declarationsByHandle: {}, readinessBasisDigest: digest,
    workspaceBindingId: workspaceBinding.bindingId, workspaceBindingDigest: digest, lockId: resolvedLock.lockId,
    lockDigest: digest, productSetId: workspaceBinding.productSetId, productSetDigest: digest,
    readinessBasis: { workspaceBinding, resolvedLock, verifiedProducts: [], installedProducts: [], publications: [] },
    boundPublications: [], rowDispositions: [] };
}

const actor = { actor: coordinate("actor://abiogenesis/td79"), attribution: coordinate("attribution://abiogenesis/td79") };
const refusal = (code, message) => ({ kind: "public_transport_refusal", schemaVersion, disposition: "refused", code, message });
const callRefusal = { kind: "installed_definition_call_transport_refusal", schemaVersion, disposition: "refused",
  code: "invalid_definition_call", message: "DefinitionCall differs from its exact installed invocation contract" };

test("TD-79 the CLI exits 2 only when no owning function is entered, and 70 for a failure after it submits the call", async (t) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-td79-"));
  t.after(() => rm(scratch, { recursive: true, force: true }));

  // One store, created and closed by the ABG event store. Every request that
  // names a store names this one.
  const eventLogPath = join(scratch, "store", "events.jsonl");
  await mkdir(join(scratch, "store"));
  const sink = abg.createNewEmptyAppendSink({ kind: "new_empty_append_sink_request", schemaVersion, eventLogPath });
  assert.ok("store" in sink, JSON.stringify(sink));
  const closeHandoff = eventStore.closeHeldEventStoreAtDurablePrefix(sink.store, sink.prefix);
  const reopenResource = { kind: "reopen_abg_event_resource", schemaVersion, closeHandoff, handoffDigest: hash(closeHandoff) };
  const storeState = async () => ({ bytes: await readFile(eventLogPath),
    events: abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix).length });
  const storeBefore = await storeState();
  assert.equal(storeBefore.events, 0, "the store holds no event");

  let ordinal = 0;
  const requestFile = async (text) => {
    const path = join(scratch, `request-${++ordinal}.jsonl`);
    await writeFile(path, text);
    return path;
  };
  const transportLine = (acquisition, invocation) =>
    `${JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion, acquisition, invocation })}\n`;

  // Runs the CLI with its arguments, after any node options, and returns its
  // status and its one line.
  const cli = async (args, nodeOptions = []) => {
    let execution, status = 0;
    try {
      execution = await execFileAsync(process.execPath, [...nodeOptions, cliPath, ...args],
        { cwd: scratch, env: {}, maxBuffer: 64 * 1024 * 1024 });
    } catch (error) {
      if (typeof error.code !== "number") throw error;
      execution = error;
      status = error.code;
    }
    assert.equal(execution.stderr, "", "the CLI writes nothing to stderr");
    const lines = execution.stdout.split("\n");
    assert.deepEqual([lines.length, lines.at(-1)], [2, ""], "the CLI writes one line");
    return { status, output: JSON.parse(lines[0]) };
  };
  // The status and line class each row observed, recorded before the row's
  // own assertions so that a failing row is still counted.
  const observed = [];
  const row = async (name, args, expectedStatus, expectOutput, nodeOptions = []) => t.test(name, async () => {
    const { status, output } = await cli(await args(), nodeOptions);
    observed.push({ name, status, code: output.code ?? null, kind: output.kind ?? null,
      receiptExit: output.receipt?.exitCode ?? null });
    assert.equal(status, expectedStatus, `${name}: ${JSON.stringify(output).slice(0, 3000)}`);
    expectOutput(output);
    assert.deepEqual(await storeState(), storeBefore, `${name}: the store is unchanged`);
  });
  // One SDK check: the built transport in this process, then the same store.
  const sdk = async (name, acquisition, call, expectOutcome) => t.test(`SDK: ${name}`, async () => {
    const outcome = await publicApi.runInstalledDefinitionCallTransport(acquisition, call);
    expectOutcome(outcome);
    assert.deepEqual(await storeState(), storeBefore, `SDK ${name}: the store is unchanged`);
    return outcome;
  });

  await row("wrong arguments: none", async () => [], 2, (output) => assert.deepEqual(output,
    refusal("invalid_arguments", "abg.cli requires exactly --jsonl <explicit-transport-request-file>")));
  await row("wrong arguments: one more than the request file", async () =>
    ["--jsonl", await requestFile("{}\n"), "--extra"], 2, (output) => assert.deepEqual(output,
    refusal("invalid_arguments", "abg.cli requires exactly --jsonl <explicit-transport-request-file>")));
  await row("a missing request file", async () => ["--jsonl", join(scratch, "absent.jsonl")], 2, (output) => {
    assert.deepEqual({ ...output, message: null }, refusal("invalid_transport_request", null));
    assert.match(output.message, /^Error: ENOENT: no such file or directory/u);
  });
  await row("an unreadable request file: a directory", async () => ["--jsonl", scratch], 2, (output) => {
    assert.deepEqual({ ...output, message: null }, refusal("invalid_transport_request", null));
    assert.match(output.message, /^Error: EISDIR: illegal operation on a directory/u);
  });
  await row("a file with no line", async () => ["--jsonl", await requestFile(" \n\n")], 2, (output) => assert.deepEqual(output,
    refusal("invalid_transport_request", "request file must contain one explicit CLI transport request")));
  await row("a file with two lines", async () => {
    const line = transportLine({ kind: "eventless" }, {});
    return ["--jsonl", await requestFile(line + line)];
  }, 2, (output) => assert.deepEqual(output,
    refusal("invalid_transport_request", "request file must contain one explicit CLI transport request")));
  await row("a line that is not JSON", async () => ["--jsonl", await requestFile("{\"kind\":\n")], 2, (output) =>
    assert.deepEqual(output, refusal("invalid_json", "transport request file is not valid JSON")));
  await row("a line that is not a transport request", async () => ["--jsonl", await requestFile(`${JSON.stringify({
    kind: "abg_cli_transport_request", schemaVersion, acquisition: { kind: "reopen", closeHandoff } })}\n`)], 2, (output) =>
    assert.deepEqual(output, refusal("invalid_transport_request",
      "transport request must declare exact acquisition and one Public invocation")));

  // An eventless workspace.create call; the acquisition names the store.
  const targetRoot = join(scratch, "workspace");
  const workspaceCreate = (admissionAuthority) => definitionCall("abg.operation.workspace.create", "clean",
    { targetRoot, createPolicy: "clean", scaffoldPolicy: "none" }, { actor },
    { kind: "workspace_resource_assertion", schemaVersion, targetRoot,
      targetRootDigest: hash({ kind: "workspace_target", targetRoot }), admissionAuthority });
  await row("a transport refusal", async () => ["--jsonl", await requestFile(transportLine(
    { kind: "reopen", closeHandoff }, workspaceCreate(null)))], 2, (output) => assert.deepEqual(output, {
    kind: "installed_definition_call_transport_refusal", schemaVersion, disposition: "refused",
    code: "acquisition_mismatch", message: "top-level acquisition differs from the DefinitionCall event resource" }));

  // A product.materialize call whose JSON-valued request member `inputs` is
  // supplied. It carries no admission authority, so a call that passes call
  // admission meets the owner binder's resource refusal before any effect.
  const materializeCall = (inputs) => definitionCall("abg.operation.product.materialize", "configuration",
    { configurationContract: coordinate("contract://abiogenesis/td79/configuration"),
      binding: coordinate("workspace-binding://abiogenesis/td79"), inputs },
    { workspace_binding: coordinate("workspace-binding://abiogenesis/td79"),
      product_set: [coordinate("product-install://abiogenesis/td79")],
      dependency_lock: coordinate("lock://abiogenesis/td79"), actor },
    { kind: "product_materialize_resource_assertion", schemaVersion, eventResource: reopenResource });

  // Historical input 1, the deep cold call. `inputs` nests 2,800 arrays, put in
  // place of a placeholder after the call is built (its digests name the
  // placeholder). It once overflowed the stack in the request schema and wrote
  // `transport_failure` (70). Call admission now admits the raw invocation as
  // I-JSON before any recursive schema or digest work, and the existing
  // 512-container bound refuses it as an invalid call before any owner (2).
  const historicalDepth = 2_800;
  const historicalLine = (() => {
    const line = transportLine({ kind: "reopen", closeHandoff }, materializeCall("td79-nested-inputs"));
    assert.equal(line.split("\"td79-nested-inputs\"").length, 2);
    return line.replace("\"td79-nested-inputs\"", "[".repeat(historicalDepth) + "]".repeat(historicalDepth));
  })();
  // In this process the transport may refuse the detached copy of so deep a
  // call by its other invalid_definition_call refusal; either refusal precedes
  // every owner, and the exact admission refusal is pinned by the CLI row and
  // the bound witnesses below.
  await sdk("the historical deep cold call refuses as an invalid call before any owner",
    { kind: "reopen", closeHandoff }, JSON.parse(historicalLine).invocation, (outcome) =>
      assert.deepEqual([outcome.kind, outcome.code], [callRefusal.kind, callRefusal.code], JSON.stringify(outcome)));
  await row("the historical deep cold call", async () => ["--jsonl", await requestFile(historicalLine)], 2,
    (output) => assert.deepEqual(output, callRefusal));

  // The bound itself, witnessed by otherwise valid cold calls whose digests
  // name their own request. `inputs` is the invocation's third container, so
  // `n` nested arrays reach depth n + 2: at 512 containers the call passes call
  // admission and the owner binder refuses only its resources (70); one more
  // container and the same construction refuses as an invalid call (2).
  const atBound = materializeCall(nestedArrays(510));
  const beyondBound = materializeCall(nestedArrays(511));
  for (const witness of [atBound, beyondBound]) {
    assert.equal(witness.invocation.requestDigest, hash(witness.invocation.request), "the digests name the request");
  }
  await sdk("a cold call 513 containers deep with correct digests refuses as an invalid call",
    { kind: "reopen", closeHandoff }, beyondBound, (outcome) => assert.deepEqual(outcome, callRefusal));
  await row("a cold call 513 containers deep with correct digests", async () => ["--jsonl",
    await requestFile(transportLine({ kind: "reopen", closeHandoff }, beyondBound))], 2,
    (output) => assert.deepEqual(output, callRefusal));
  const boundFault = { failureKind: "typed_execution_fault", stage: "resource_admission", code: "invalid_resource_assertion" };
  const faultClass = (receipt) => ({ failureKind: receipt.failure?.failureKind, stage: receipt.failure?.fault?.stage,
    code: receipt.failure?.fault?.code });
  let atBoundSdk = null;
  await sdk("a cold call 512 containers deep with correct digests passes call admission",
    { kind: "reopen", closeHandoff }, atBound, (outcome) => {
      atBoundSdk = outcome;
      assert.equal(outcome.kind, "installed_definition_call_transport_result", JSON.stringify(outcome).slice(0, 3000));
      assert.equal(outcome.receipt.exitCode, 70);
      assert.deepEqual(faultClass(outcome.receipt), boundFault);
    });
  await row("a cold call 512 containers deep with correct digests", async () => ["--jsonl",
    await requestFile(transportLine({ kind: "reopen", closeHandoff }, atBound))], 70, (output) => {
    assert.equal(output.kind, "installed_definition_call_transport_result");
    assert.equal(output.receipt.exitCode, 70);
    assert.deepEqual(faultClass(output.receipt), boundFault);
    assert.deepEqual(output.receipt.failure.fault, atBoundSdk?.receipt.failure.fault, "the CLI writes the SDK's fault");
  });

  // Historical input 2, the malformed admission authority: one string with a
  // lone surrogate. The owner is entered, its admission schema refuses the
  // string, and the fault message it returns quotes the string. That fault
  // remains the typed resource_admission fault (70); its message is diagnostic
  // text, so the lone surrogate is written as its escape and the receipt is
  // one I-JSON value that the CLI writes instead of `transport_failure`.
  const malformedAuthority = workspaceCreate("\ud800");
  const authorityFault = { failureKind: "typed_execution_fault", stage: "resource_admission", code: "resource_relation_mismatch" };
  let authoritySdk = null;
  await sdk("a malformed admission authority remains its typed fault in an encodable receipt",
    { kind: "eventless" }, malformedAuthority, (outcome) => {
      authoritySdk = outcome;
      assert.equal(outcome.kind, "installed_definition_call_transport_result");
      assert.equal(outcome.receipt.exitCode, 70);
      assert.deepEqual(faultClass(outcome.receipt), authorityFault);
      const message = outcome.receipt.failure.fault.message;
      assert.equal(message.includes("\ud800"), false, "no lone surrogate remains in the message");
      assert.ok(message.includes("\\ud800"), `the message keeps the offending code unit as its escape: ${message}`);
      assert.equal(admit.admitJson(outcome).kind, "ok", "the transport outcome is one I-JSON value");
    });
  await row("a malformed admission authority", async () => ["--jsonl", await requestFile(transportLine(
    { kind: "eventless" }, malformedAuthority))], 70, (output) => {
    assert.equal(output.kind, "installed_definition_call_transport_result");
    assert.equal(output.receipt.exitCode, 70);
    assert.deepEqual(faultClass(output.receipt), authorityFault);
    assert.deepEqual(output.receipt.failure.fault, authoritySdk?.receipt.failure.fault, "the CLI writes the SDK's fault");
  });
  await assert.rejects(lstat(targetRoot), { code: "ENOENT" }, "the refused workspace.create writes no workspace");

  // Valid defaulted control: a Run start whose raw request omits the defaulted
  // `fhMode` and whose digests name the default-applied request. Cold call
  // admission passes its I-JSON gate, applies the schema default and matches
  // the digests, so the actual Run owner is entered; that owner refuses this
  // structurally valid but unadmitted setup as its typed refusal (1) and
  // appends nothing. The same raw request hashed without its default is an
  // invalid call (2).
  const program = coordinate("program://abiogenesis/td79");
  const catalogView = coordinate("catalog-view://abiogenesis/td79");
  const inputValue = { value: "admitted" };
  const inputAuthority = { contract: coordinate("contract://abiogenesis/td79/input"),
    valueRef: "value://abiogenesis/td79/input", valueDigest: hash(inputValue), value: inputValue };
  const startRequest = { program, scope: "program", target: { kind: "next" }, until: "converged", catalogView,
    allowlist: [], input: inputAuthority, fhMode: "direct", rootMode: "supervised", sourceBasis: { kind: "none" } };
  const { fhMode: _fhMode, ...rawStartRequest } = startRequest;
  const startSlots = {
    workspace_binding: coordinate("workspace-binding://abiogenesis/td79"),
    product_set: [coordinate("product-set://abiogenesis/td79")],
    dependency_lock: coordinate("product-lock://abiogenesis/td79"),
    catalog_scope: { catalog: coordinate("catalog://abiogenesis/td79"), view: catalogView, allowlist: [] },
    execution_program: program,
    input_contract: inputAuthority,
    session_policy: coordinate("session-policy://abiogenesis/td79"),
    capability_grants: { requiredCapabilityRefs: [...definitionOf("abg.operation.run.invoke", "start").capabilityRefs],
      grants: [coordinate("capability-grant://abiogenesis/td79/start")] },
    actor,
    transport_steering: coordinate("transport-steering://abiogenesis/td79"),
  };
  const setupCatalog = absentSetupCatalog(scratch);
  const runResources = { kind: "run_invocation_resource_assertion", schemaVersion, eventResource: reopenResource,
    catalog: setupCatalog, catalogView: { kind: "graph_function_catalog_view", catalogBasisDigest: setupCatalog.basisDigest,
      allowlist: [], entries: [], byHandle: {}, declarationEntries: [], declarationsByHandle: {},
      viewDigest: setupCatalog.basisDigest },
    applications: [], source: { kind: "none" } };
  const defaultedBase = definitionCall("abg.operation.run.invoke", "start", startRequest, startSlots, runResources);
  const defaulted = { invocation: { ...defaultedBase.invocation, request: rawStartRequest }, resources: defaultedBase.resources };
  assert.equal(Object.hasOwn(defaulted.invocation.request, "fhMode"), false);
  assert.equal(defaulted.invocation.requestDigest, hash(startRequest), "the digests name the default-applied request");
  let defaultedSdk = null;
  await sdk("a valid defaulted cold call reaches its owner", { kind: "reopen", closeHandoff }, defaulted, (outcome) => {
    defaultedSdk = outcome;
    assert.equal(outcome.kind, "installed_definition_call_transport_result", JSON.stringify(outcome).slice(0, 3000));
    assert.equal(outcome.receipt.failure, null, JSON.stringify(outcome.receipt.failure));
    assert.equal(outcome.receipt.exitCode, 1);
    assert.equal(outcome.receipt.ownerOutput.outcomeKind, "refusal");
    assert.equal(admit.admitJson(outcome).kind, "ok", "the transport outcome is one I-JSON value");
  });
  await row("a valid defaulted Run start", async () => ["--jsonl", await requestFile(transportLine(
    { kind: "reopen", closeHandoff }, defaulted))], 1, (output) => {
    assert.equal(output.kind, "installed_definition_call_transport_result");
    assert.equal(output.receipt.failure, null);
    assert.equal(output.receipt.exitCode, 1);
    assert.deepEqual(output.receipt.ownerOutput, defaultedSdk?.receipt.ownerOutput, "the CLI writes the SDK's owner output");
  });
  const rawIdentity = definitionCall("abg.operation.run.invoke", "start", rawStartRequest, startSlots, runResources);
  await sdk("a raw call hashed without its default refuses as an invalid call", { kind: "reopen", closeHandoff },
    rawIdentity, (outcome) => assert.deepEqual(outcome, callRefusal));
  await row("a raw Run start hashed without its default", async () => ["--jsonl", await requestFile(transportLine(
    { kind: "reopen", closeHandoff }, rawIdentity))], 2, (output) => assert.deepEqual(output, callRefusal));

  // Emitted-CLI component substitutions. Component scope only, not installed
  // owner integration: the actual built CLI runs as its own process, and one
  // module customization hook replaces only that CLI's import of its transport
  // module with a stub; `--no-warnings` keeps node's own warnings off stderr.
  // No production fault switch exists. The rows prove the CLI's own fallback
  // after it submits a call: `transport_failure`, exit 70 and one I-JSON line.
  const cliUrl = pathToFileURL(await realpath(cliPath)).href;
  const dataUrl = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
  const substitutedTransport = (stubBody) => {
    const stub = dataUrl(`export async function runInstalledDefinitionCallTransport() {\n${stubBody}\n}\n`);
    const hooks = dataUrl([
      `export async function resolve(specifier, context, next) {`,
      `  if (specifier === "./installed_definition_call_transport.js" && context.parentURL === ${JSON.stringify(cliUrl)}) {`,
      `    return { url: ${JSON.stringify(stub)}, format: "module", shortCircuit: true };`,
      `  }`,
      `  return next(specifier, context);`,
      `}`,
    ].join("\n"));
    return ["--no-warnings", "--import", dataUrl(`import { register } from "node:module"; register(${JSON.stringify(hooks)});`)];
  };
  const submittedLine = transportLine({ kind: "eventless" }, workspaceCreate(null));
  // The stub throws after the CLI submits the call; its message carries a lone
  // surrogate, which the fallback writes as its escape.
  await row("component: a throw out of the substituted transport after submission", async () =>
    ["--jsonl", await requestFile(submittedLine)], 70, (output) => assert.deepEqual(output, refusal("transport_failure",
    "TypeError: substituted transport failed after submission: \\ud800")), substitutedTransport(
    "throw new TypeError(\"substituted transport failed after submission: \\ud800\");"));
  // The stub returns an outcome whose receipt claims exit 0 but holds an
  // unsafe integer, which is not I-JSON: the CLI cannot encode it.
  await row("component: a non-I-JSON outcome from the substituted transport", async () =>
    ["--jsonl", await requestFile(submittedLine)], 70, (output) => assert.deepEqual(output, refusal("transport_failure",
    "TypeError: transport outcome is not one I-JSON value")), substitutedTransport([
    "return { kind: \"installed_definition_call_transport_result\", schemaVersion: \"5.0.0\", acquisitionKind: \"eventless\",",
    "  receipt: { kind: \"definition_host_receipt\", schemaVersion: \"5.0.0\",",
    "    definitionKey: { operationId: \"abg.operation.workspace.create\", memberKey: \"clean\" },",
    "    invocationRef: \"invocation://abiogenesis/td79/substituted\", exitCode: 0,",
    "    ownerOutput: { outcomeKind: \"result\", value: { count: 2 ** 53 } }, resources: null, failure: null } };",
  ].join("\n")));
  await assert.rejects(lstat(targetRoot), { code: "ENOENT" }, "no row writes a workspace");

  // Over the lines the rows observed: no line written with 2 carries
  // `transport_failure`; every line written with 70 is `transport_failure` or
  // a transport result whose receipt carries exit 70; every line written with
  // 1 is a transport result whose receipt carries exit 1.
  await t.test("no line written with 2 carries transport_failure, and every line written with 70 or 1 is classified", () => {
    const withStatus = (status) => observed.filter((entry) => entry.status === status);
    const receiptWith = (status) => (entry) => entry.kind === "installed_definition_call_transport_result" &&
      entry.receiptExit === status;
    assert.deepEqual({
      rows: observed.length,
      exit1: withStatus(1).length,
      exit2: withStatus(2).length,
      exit70: withStatus(70).length,
      exit2TransportFailure: withStatus(2).filter((entry) => entry.code === "transport_failure").map((entry) => entry.name),
      exit70TransportFailure: withStatus(70).filter((entry) => entry.code === "transport_failure").map((entry) => entry.name),
      exit70Unclassified: withStatus(70).filter((entry) => entry.code !== "transport_failure" && !receiptWith(70)(entry))
        .map((entry) => entry.name),
      exit1Unclassified: withStatus(1).filter((entry) => !receiptWith(1)(entry)).map((entry) => entry.name),
    }, {
      rows: 17, exit1: 1, exit2: 12, exit70: 4, exit2TransportFailure: [],
      exit70TransportFailure: ["component: a throw out of the substituted transport after submission",
        "component: a non-I-JSON outcome from the substituted transport"],
      exit70Unclassified: [], exit1Unclassified: [],
    });
  });
});

// T-293 B12: the shared diagnostic renderer. Valid text, supplementary
// characters included, is the same string; each lone UTF-16 code unit is its
// literal escape, so the offending value stays readable and the text is I-JSON.
test("T-293 B12 diagnostic text escapes only lone UTF-16 code units and keeps valid Unicode", () => {
  const render = diagnostics.renderDiagnosticText;
  for (const valid of ["", "ordinary message", "TypeError: definition call differs from its fixed owner",
    "caf\u00e9 \u{1F600} \ud83d\ude00 \\ud800 literal"]) {
    assert.equal(render(valid), valid, JSON.stringify(valid));
  }
  for (const [text, rendered] of [
    ["\ud800", "\\ud800"],
    ["\udc00", "\\udc00"],
    ["a\ud800b", "a\\ud800b"],
    ["x\udbff", "x\\udbff"],
    ["\udc00\ud800", "\\udc00\\ud800"],
    ["\ud83d\ud83d\ude00", "\\ud83d\ud83d\ude00"],
    ["\ud83d\ude00\ude00", "\ud83d\ude00\\ude00"],
  ]) {
    assert.equal(render(text), rendered, JSON.stringify(text));
    assert.equal(render(rendered), rendered, "rendering is idempotent");
    assert.equal(admit.admitJson(rendered).kind, "ok", "rendered text is I-JSON");
  }
});
