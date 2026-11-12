// T-292 TD-79, REQ-P-POLICY-022: the CLI's exit status `2` means that the CLI
// did not submit the call or the transport refused it, so no owning function
// was entered. A failure after the CLI has handed the call to the transport,
// other than the transport's typed refusal, exits `70`.
//
// Each row runs the built CLI (`build/code/src/public/cli.js`, the file the
// package's `abg.cli` bin names) as its own process and pins the exit status,
// the one line it writes, an empty stderr, and the bytes and event count of one
// store that the ABG event store created and closed before the rows run.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const tenant = fileURLToPath(new URL("../..", import.meta.url));
const load = (path) => import(pathToFileURL(join(tenant, "build/code/src", path)).href);
const [publicApi, product, abg, eventStore] = await Promise.all([
  load("public/index.js"), load("product/index.js"), load("abg/index.js"), load("abg/event_store.js"),
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

// One well-formed call of a declared member. The grants are coordinates only:
// no row reaches the owner's grant reconstruction.
function definitionCall(operationId, memberKey, request, slotValues, resources) {
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find((candidate) =>
    candidate.definitionKey.operationId === operationId && candidate.definitionKey.memberKey === memberKey);
  const slots = Object.fromEntries(["workspace_binding", "product_set", "dependency_lock", "catalog_scope",
    "execution_program", "graph_function", "input_contract", "session_policy", "capability_grants", "actor",
    "transport_steering", "verification_references", "execution_basis"].map((name) => [name, null]));
  Object.assign(slots, slotValues, { capability_grants: {
    requiredCapabilityRefs: [...definition.capabilityRefs],
    grants: definition.capabilityRefs.map((_, index) => coordinate(`capability-grant://abiogenesis/td79/${memberKey}/${index}`)),
  } });
  return publicApi.constructInstalledPublicDefinitionCall({
    product, installedPublic: publicApi, definitionContractCoordinates: definitionContractCoordinates(operationId),
    contractCatalog, operationId, memberKey, request, slots, resources,
    requestRef: `public-request://abiogenesis/td79/${memberKey}`, correlationRef: "correlation://abiogenesis/td79",
    eventTime: "2026-11-12T00:00:00.000Z", provenanceRefs: ["provenance://abiogenesis/td79"],
  });
}

const actor = { actor: coordinate("actor://abiogenesis/td79"), attribution: coordinate("attribution://abiogenesis/td79") };
const refusal = (code, message) => ({ kind: "public_transport_refusal", schemaVersion, disposition: "refused", code, message });

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

  // Runs the CLI with its arguments and returns its status and its one line.
  const cli = async (args) => {
    let execution, status = 0;
    try {
      execution = await execFileAsync(process.execPath, [cliPath, ...args],
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
  const row = async (name, args, expectedStatus, expectOutput) => t.test(name, async () => {
    const { status, output } = await cli(await args());
    assert.equal(status, expectedStatus, `${name}: ${JSON.stringify(output)}`);
    expectOutput(output);
    assert.deepEqual(await storeState(), storeBefore, `${name}: the store is unchanged`);
  });

  await row("wrong arguments: none", async () => [], 2, (output) => assert.deepEqual(output,
    refusal("invalid_arguments", "abg.cli requires exactly --jsonl <explicit-transport-request-file>")));
  await row("wrong arguments: one more than the request file", async () =>
    ["--jsonl", await requestFile("{}\n"), "--extra"], 2, (output) => assert.deepEqual(output,
    refusal("invalid_arguments", "abg.cli requires exactly --jsonl <explicit-transport-request-file>")));
  await row("a missing request file", async () => ["--jsonl", join(scratch, "absent.jsonl")], 2, (output) => {
    assert.deepEqual({ ...output, message: null }, refusal("transport_failure", null));
    assert.match(output.message, /^Error: ENOENT: no such file or directory/u);
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

  // A throw out of the transport. The request's JSON-valued member `inputs`
  // nests 2,800 arrays, put in place of a placeholder after the call is built
  // (its digests name the placeholder). The transport detaches the call
  // (structured clone reaches about 3,600 levels at the top of a process); its
  // call admission then overflows the stack in the request schema (about 1,900
  // levels), before it enters any owner.
  const depth = 2_800;
  await row("a throw out of the transport", async () => {
    const call = definitionCall("abg.operation.product.materialize", "configuration",
      { configurationContract: coordinate("contract://abiogenesis/td79/configuration"),
        binding: coordinate("workspace-binding://abiogenesis/td79"), inputs: "td79-nested-inputs" },
      { workspace_binding: coordinate("workspace-binding://abiogenesis/td79"),
        product_set: [coordinate("product-install://abiogenesis/td79")],
        dependency_lock: coordinate("lock://abiogenesis/td79"), actor },
      { kind: "product_materialize_resource_assertion", schemaVersion, eventResource: reopenResource });
    const line = transportLine({ kind: "reopen", closeHandoff }, call);
    assert.equal(line.split("\"td79-nested-inputs\"").length, 2);
    return ["--jsonl", await requestFile(line.replace("\"td79-nested-inputs\"", "[".repeat(depth) + "]".repeat(depth)))];
  }, 70, (output) => assert.deepEqual(output, refusal("transport_failure", "RangeError: Maximum call stack size exceeded")));

  // An outcome that cannot be encoded. The admission authority is one string
  // with a lone surrogate: the owner is entered, its admission schema refuses
  // the string, and the fault message it returns quotes the string. The
  // transport returns that receipt; it is not one I-JSON value.
  const unencodable = workspaceCreate("\ud800");
  const inProcess = await publicApi.runInstalledDefinitionCallTransport({ kind: "eventless" }, unencodable);
  assert.equal(inProcess.kind, "installed_definition_call_transport_result");
  assert.equal(inProcess.receipt.exitCode, 70);
  assert.deepEqual([inProcess.receipt.failure.failureKind, inProcess.receipt.failure.fault.stage,
    inProcess.receipt.failure.fault.code], ["typed_execution_fault", "resource_admission", "resource_relation_mismatch"]);
  assert.ok(inProcess.receipt.failure.fault.message.includes("\ud800"), inProcess.receipt.failure.fault.message);
  await row("an outcome that cannot be encoded", async () => ["--jsonl", await requestFile(transportLine(
    { kind: "eventless" }, unencodable))], 70, (output) =>
    assert.deepEqual(output, refusal("transport_failure", "TypeError: transport outcome is not one I-JSON value")));
  await assert.rejects(lstat(targetRoot), { code: "ENOENT" }, "the refused workspace.create writes no workspace");
});
