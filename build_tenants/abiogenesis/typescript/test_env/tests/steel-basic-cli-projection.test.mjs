import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, lstat, readlink, mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const json = async filename => JSON.parse(await readFile(filename, "utf8"));
const originalResult = "result://abiogenesis/17476774d7614d38bfc48e8127af58369ebf0a75ca9f7a511cbf15b9d2f0cbc2";
const originalBasis = "invocation-source-result://abiogenesis/1a28682d0dea80d72dd5ba5891d2eafabf55291355ad49234f0e93133c53cf74";

async function inventory(root) {
  const rows = [];
  async function visit(relative) {
    const filename = path.join(root, relative);
    const stat = await lstat(filename);
    if (stat.isSymbolicLink()) rows.push([relative, "symlink", await readlink(filename)]);
    else if (stat.isFile()) rows.push([relative, "file", sha256(await readFile(filename))]);
    else if (stat.isDirectory()) {
      for (const name of (await readdir(filename)).sort()) await visit(path.join(relative, name));
    }
  }
  await visit("");
  return { files: rows.length, sha256: sha256(JSON.stringify(rows)) };
}

async function installedSurface(root, surface) {
  const manifest = await json(path.join(root, "package.json"));
  return import(pathToFileURL(path.join(root, manifest.exports[`./${surface}`].import)).href);
}

function readCall({ publicApi, product, abg, originalCall, coordinates, environment,
  closeHandoff, memberKey, source }) {
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(row =>
    row.definitionKey.operationId === "abg.operation.project.read" &&
    row.definitionKey.memberKey === memberKey);
  assert.ok(definition);
  const contracts = coordinates.operations.find(row => row.operationId === definition.definitionKey.operationId)
    .members.find(row => row.memberKey === memberKey).slots;
  const fixedPacket = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
  assert.ok(fixedPacket.requestSchema);
  const { workspaceBinding: binding, workspaceAuthorityBasis: authority, productInstalls } = environment;
  const grants = definition.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
    authority, binding.authorizedActorRef, definition.definitionKey.operationId, capabilityRef,
    { admittedInstalls: productInstalls, workspaceBinding: binding, fixedPacket }));
  const slots = Object.fromEntries(Object.keys(originalCall.invocation.invocationAuthority.slots).map(key => [key, null]));
  Object.assign(slots, {
    workspace_binding: { ref: binding.bindingId, digest: binding.bindingDigest },
    product_set: productInstalls.map(row => ({ ref: row.installId, digest: row.productContentDigest })),
    dependency_lock: { ref: binding.lockId, digest: binding.lockDigest },
    capability_grants: { requiredCapabilityRefs: definition.capabilityRefs,
      grants: grants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) },
  });
  const authorityBody = { kind: "invocation_authority", definitionKey: definition.definitionKey, slots };
  const request = { caseKey: memberKey, source,
    projectionBasis: { projectionBasisRef: closeHandoff.prefix.eventLogRef,
      projectionBasisDigest: closeHandoff.prefix.coordinateDigest },
    selector: { kind: "none" } };
  const { invocationRef: _ref, invocationDigest: _digest, ...originalBody } = originalCall.invocation;
  const body = { ...originalBody,
    definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    invocationAuthority: { ...authorityBody, authorityDigest: product.sha256Canonical(authorityBody) },
    requestContract: contracts.request, expectedResultContract: contracts.result,
    expectedRefusalContract: contracts.refusal, expectedNonTerminalContract: contracts.nonTerminal,
    requestRef: `public-request://abiogenesis/steel-basic-cli/projection/${memberKey}`,
    requestDigest: product.sha256Canonical(request), request,
  };
  const invocationDigest = product.sha256Canonical(body);
  return { invocation: { ...body, invocationDigest,
    invocationRef: `invocation://abiogenesis/${invocationDigest.slice(7)}` },
    resources: { kind: "abg_project_read_resource_assertion", schemaVersion: "5.0.0",
      eventResource: { kind: "reopen_abg_event_resource", schemaVersion: "5.0.0",
        closeHandoff, handoffDigest: product.sha256Canonical(closeHandoff) } } };
}

test("separate installed reader projects retained C1 root among child terminals without changing its authority", async t => {
  const attempt = process.env.ABI5_STEEL_C1_ATTEMPT_PATH;
  const reader = process.env.ABI5_STEEL_READER_INSTALL_ROOT;
  if (!attempt || !reader) {
    t.skip("requires explicit retained C1 attempt and separately installed reader");
    return;
  }
  const [publicApi, product, abg] = await Promise.all(["public", "product", "abg"].map(surface => installedSurface(reader, surface)));
  const originalCall = await json(path.join(attempt, "c1-construction-definition-call.json"));
  const originalReceiptPath = path.join(attempt, "c1-construction-definition-receipt.json");
  const originalReceipt = await json(originalReceiptPath);
  const closeHandoff = originalReceipt.resources.eventResource.closeHandoff;
  const eventPath = fileURLToPath(closeHandoff.prefix.eventLogRef);
  const originalInstall = path.join(attempt, "abi-consumer/node_modules/@abiogenesis/typescript-tenant");
  assert.notEqual(path.resolve(reader), path.resolve(originalInstall));
  const snapshot = async () => ({
    receipt: sha256(await readFile(originalReceiptPath)),
    events: sha256(await readFile(eventPath)),
    consumerInstall: await inventory(originalInstall),
    bootstrapInstall: await inventory(path.join(attempt, "abi-bootstrap/package")),
  });
  const before = await snapshot();
  assert.equal(before.events, "561923b0b3d47b2a8c65612873dc840aa9dd343c79b2bb1efb3e30c275b71419");
  const events = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const run = originalReceipt.ownerOutput.value.run;
  const graphCall = originalReceipt.ownerOutput.value.graphCall;
  const runPrefix = abg.selectValidatedRuntimeEventPrefix(events, { runId: run.ref });
  const replay = abg.replayValidatedRuntimeEventPrefix(runPrefix, prefix);
  assert.equal(replay.routes.filter(row => row.routeKind === "terminal").length, 6);
  const truth = abg.projectRunTruthAtDurablePrefix(closeHandoff.prefix, run.ref);
  assert.equal(truth.kind, "abg_run_truth_projection");
  assert.equal(truth.result.ref, originalResult);
  assert.equal(truth.graphCall.ref, graphCall.ref);
  const environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix,
    originalCall.invocation.invocationAuthority.slots.workspace_binding);
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const verify = await json(path.join(attempt, "setup-1-verify.json"));
  const common = { publicApi, product, abg, originalCall, environment, closeHandoff,
    coordinates: verify.receipt.ownerOutput.value.definitionContractCoordinates };
  const call = readCall({ ...common, memberKey: "run_result",
    source: { sourceKind: "run", sourceRef: run.ref, sourceDigest: run.digest } });
  const outcome = await publicApi.runInstalledDefinitionCallTransport({ kind: "reopen", closeHandoff }, call);
  assert.equal(outcome.kind, "installed_definition_call_transport_result");
  assert.equal(outcome.receipt.exitCode, 0, JSON.stringify(outcome));
  const projection = outcome.receipt.ownerOutput.value.projection;
  assert.equal(projection.kind, "run_result_projection");
  assert.equal(projection.result.ref, originalResult);
  assert.equal(projection.replay.ref, originalReceipt.ownerOutput.value.replay.ref);
  assert.deepEqual(outcome.receipt.resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
  const admission = abg.rehydrateInvocationAdmissionAtPrefix(prefix, originalReceipt.resources.invocationAdmission.ref);
  const sourceBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, {
    publicAuthorityDigest: originalCall.invocation.invocationDigest,
    runtimeInvocationRef: admission.invocationRef,
    invocationAdmissionRef: originalReceipt.resources.invocationAdmission.ref,
    runId: run.ref, resultRef: projection.result.ref,
  });
  assert.equal(sourceBasis.basisRef, originalBasis);
  assert.equal(sourceBasis.sourceResultValue.kind, "worksite_construction_result");
  assert.equal(sourceBasis.sourceResultValue.members.length, 3);
  assert.deepEqual(abg.rehydrateInvocationSourceResultBasisAtDurablePrefix(closeHandoff.prefix, sourceBasis), sourceBasis);

  const semantic = abg.projectRunSemanticReplayProjection(prefix, run.ref);
  const childTerminal = events.find(event => event.kind === "terminal_reached" && event.graphCallId !== graphCall.ref);
  const childOpened = semantic.eventAtoms.find(atom => atom.eventKind === "graph_call_opened" && atom.aggregateId === childTerminal.graphCallId);
  const childCall = readCall({ ...common, memberKey: "graph_call_result",
    source: { sourceKind: "graph_call", sourceRef: childOpened.aggregateId, sourceDigest: childOpened.semanticPayloadDigest } });
  const childRead = await publicApi.runInstalledDefinitionCallTransport({ kind: "reopen", closeHandoff }, childCall);
  assert.equal(childRead.receipt.exitCode, 0, JSON.stringify(childRead));
  assert.equal(childRead.receipt.ownerOutput.value.projection.result.ref, childTerminal.payload.resultRef);

  const originalBytes = await readFile(eventPath);
  const lines = originalBytes.toString("utf8").trimEnd().split("\n");
  const rootRoute = events.find(event => event.kind === "traversal_route_admitted" &&
    event.graphCallId === graphCall.ref && event.payload.routeKind === "terminal");
  assert.ok(rootRoute);
  const rootRouteIndex = events.indexOf(rootRoute);
  const earlyBytes = Buffer.from(`${lines.slice(0, rootRouteIndex).join("\n")}\n`);
  const { coordinateDigest: _coordinateDigest, ...prefixBody } = closeHandoff.prefix;
  const earlyBody = { ...prefixBody, prefixLength: earlyBytes.length,
    prefixDigest: product.sha256Bytes(earlyBytes) };
  const earlyPrefix = { ...earlyBody, coordinateDigest: product.sha256Canonical(earlyBody) };
  const absent = abg.projectRunTruthAtDurablePrefix(earlyPrefix, run.ref);
  assert.equal(absent.kind, "abg_run_truth_projection");
  assert.equal(absent.result, null, "child terminals cannot supply an absent root terminal");

  // Deliberately conflicting fixture only: no event is appended to admitted history.
  const scratch = await mkdtemp(path.join(os.tmpdir(), "abg-root-terminal-conflict-"));
  let ambiguous;
  try {
    const conflict = structuredClone(rootRoute);
    conflict.admissionOrdinal = events.at(-1).admissionOrdinal + 1;
    conflict.eventId = "event://abiogenesis/test-conflicting-root-terminal";
    conflict.payload.routeRef = "traversal-route://abiogenesis/test-conflicting-root-terminal";
    conflict.payload.routeDigest = product.sha256Canonical({ test: "conflicting-root-terminal" });
    conflict.payloadDigest = product.sha256Canonical(conflict.payload);
    const conflictBytes = Buffer.concat([originalBytes, Buffer.from(`${JSON.stringify(conflict)}\n`)]);
    const conflictPath = path.join(scratch, "runtime.events.jsonl");
    await writeFile(conflictPath, conflictBytes, { flag: "wx" });
    const stat = await lstat(conflictPath);
    const body = { ...prefixBody, eventLogRef: pathToFileURL(conflictPath).href,
      prefixLength: conflictBytes.length, prefixDigest: product.sha256Bytes(conflictBytes),
      storeIdentity: { ...prefixBody.storeIdentity, device: stat.dev, inode: stat.ino } };
    ambiguous = abg.projectRunTruthAtDurablePrefix({ ...body, coordinateDigest: product.sha256Canonical(body) }, run.ref);
    assert.ok(ambiguous.kind === "abg_run_truth_refusal" || ambiguous.result === null,
      "conflicting root terminals cannot select a result");
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  const after = await snapshot();
  assert.deepEqual(after, before);
  const evidence = { kind: "steel_basic_cli_original_c1_projection_proof", reader,
    originalAttempt: attempt, originalArtifact: "bdb1793229dd444f10014608f574294999f4061698b831d7f77af46c38db12d9",
    originalPrefix: closeHandoff.prefix, originalRun: run, originalGraphCall: graphCall,
    call, receipt: outcome.receipt, sourceBasis, childRead: childRead.receipt,
    absentRoot: { kind: absent.kind, result: absent.result },
    conflictingRoot: { kind: ambiguous.kind, code: ambiguous.code ?? null, result: ambiguous.result ?? null },
    before, after };
  if (process.env.ABI5_STEEL_PROJECTION_EVIDENCE_PATH) {
    await writeFile(process.env.ABI5_STEEL_PROJECTION_EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`, { flag: "wx" });
  }
});
