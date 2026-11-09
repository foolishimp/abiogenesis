import { createHash } from "node:crypto";
import { connect } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Model-free fixtures for the private governed lookup. No provider, network or paid model is used. */
export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const clientPath = resolve(packageRoot, "build/code/src/abg/governed_context_client.js");
export const trackedAdapterPath = resolve(packageRoot, "code/support/governed-context/host_adapter.py");
export const packagedAdapterPath = resolve(packageRoot, "contracts/governed-context/host_adapter.py");
export const loadGovernedContext = () => import(pathToFileURL(resolve(packageRoot, "build/code/src/abg/governed_context.js")).href);
export const sha = bytes => "sha256:" + createHash("sha256").update(bytes).digest("hex");
export const TESTING_FIELD = Object.freeze(["commandResults", 0, "stdout"]);

/** Owner-held fixture state; every authority value is changed only through this mutable owner record. */
export function governedFixture(gc, overrides = {}) {
  const owner = {
    active: true, runId: "run://abiogenesis/rc3/b-01", grantDigest: sha("grant"),
    files: new Map([["rc3/task.md", Buffer.from("# Original task\nPreserve A1–A5.\n")],
      ["rc3/rubric.json", Buffer.from('{"criteria":["A1","B2"]}\n')],
      ["code/src/abg/governed_context.ts", Buffer.from("x".repeat(300))],
      ["code/src/outside.ts", Buffer.from("not granted")]]),
    result: { resultRef: "result://abiogenesis/testing-01", resultDigest: sha("testing-result"), cCallRef: "call://testing-01", actorInvocationRef: "actor://testing-01",
      fields: new Map([[JSON.stringify(TESTING_FIELD), Buffer.from("not ok 1 - ENOENT: no such file or directory\n")]]) },
    hostCalls: [], hostMode: "agree",
  };
  const prefix = () => ({ runId: owner.runId, prefixDigest: sha("prefix:" + owner.runId),
    admittedResult: ref => ref !== owner.result.resultRef ? null : { resultDigest: owner.result.resultDigest, cCallRef: owner.result.cCallRef,
      actorInvocationRef: owner.result.actorInvocationRef, field: path => owner.result.fields.get(JSON.stringify(path)) ?? null } });
  // Captured GC03 host page semantics: the same bounded pager over the owner-current bytes.
  const host = async request => {
    owner.hostCalls.push(request);
    if (owner.hostMode === "refuse") throw new Error("authority_missing: GC03 grant denies this source");
    const bytes = request.source.role === "testing_result_field" ? owner.result.fields.get(JSON.stringify(TESTING_FIELD)) : owner.files.get(request.source.sourceKey);
    const page = bytes.subarray(request.offset, request.offset + request.maxBytes);
    return { offset: request.offset, length: page.length, totalBytes: bytes.length, pageDigest: sha(owner.hostMode === "disagree" ? Buffer.concat([page, Buffer.from("!")]) : page),
      selectedDigest: sha(bytes), publication: "not_performed" };
  };
  const testingKey = owner.result.resultRef + "#" + JSON.stringify(TESTING_FIELD);
  const authority = {
    occurrence: { runId: owner.runId, cCallRef: "call://construction-01", actorInvocationRef: "actor://construction-01", actorRef: "actor://claude", attempt: 1 },
    role: { constructorRole: "construction", policyRef: "policy://abiogenesis/default-library/constructor@5", policyDigest: sha("constructor-policy"),
      contextPolicyRef: "policy://abiogenesis/default-library/constructor/context@5", selectors: [...gc.GOVERNED_CONTEXT_ROLE_SELECTORS] },
    context: { observationRef: "worksite-context-observation://abiogenesis/b-01", readRoots: ["rc3", "code/src"],
      entries: [...owner.files.keys()].map(relativePath => ({ relativePath, state: "file" })) },
    original: { task: { path: "rc3/task.md", digest: sha(owner.files.get("rc3/task.md")) }, rubric: { path: "rc3/rubric.json", digest: sha(owner.files.get("rc3/rubric.json")) } },
    worksiteSources: [{ path: "code/src/abg/governed_context.ts", digest: sha(owner.files.get("code/src/abg/governed_context.ts")) },
      { path: "code/src/outside.ts", digest: sha(owner.files.get("code/src/outside.ts")) }],
    testing: { resultRef: owner.result.resultRef, resultDigest: owner.result.resultDigest, fieldPath: [...TESTING_FIELD],
      producer: { cCallRef: owner.result.cCallRef, actorInvocationRef: owner.result.actorInvocationRef }, provenance: ["event://abiogenesis/testing-01-admitted"] },
    pageBound: 65536,
    grant: { principalId: "principal://abiogenesis/construction", grantId: "grant://gc03/construction-01", grantDigest: owner.grantDigest,
      sourceKeys: ["rc3/task.md", "rc3/rubric.json", "code/src/abg/governed_context.ts", testingKey] },
    release: { identity: gc.GC03_SELECTED_RELEASE.identity, inventorySha256: gc.GC03_SELECTED_RELEASE.inventorySha256, pythonDigest: sha("python"),
      pythonVersion: "3.12.8", adapterDigest: sha("adapter"), policyDigest: sha("gc03-policy") },
    reacquire: { prefix, occurrenceActive: () => owner.active, grantDigest: () => owner.grantDigest, worksiteSource: path => owner.files.get(path) ?? null },
    host,
    ...overrides,
  };
  return { owner, authority, testingKey };
}

/** Captured Claude stream-json protocol rows around fixed-client Bash calls; `command` defaults to the exact owner-named invocation. */
export function capturedStream(rows, invocation, gc) {
  const lines = [{ type: "system", subtype: "init", tools: ["Bash"] }];
  for (const row of rows) {
    if (row.use !== false) lines.push({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id: row.toolUseId, name: row.name ?? "Bash",
      input: { command: row.command ?? gc.governedContextCommand(invocation, row.request) } }] } });
    if (row.result !== undefined) lines.push({ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: row.toolUseId,
      content: row.asArray ? [{ type: "text", text: row.result }] : row.result, ...(row.isError ? { is_error: true } : {}) }] } });
  }
  lines.push({ type: "result", subtype: "success", is_error: false, result: '{"summary":"done","gaps":[]}' });
  return lines.map(line => JSON.stringify(line)).join("\n") + "\n";
}

/** In-process stand-in for the fixed client's wire protocol: exact wire line, exact response bytes. */
export function ask(path, wire) {
  return new Promise((done, fail) => {
    const chunks = [], socket = connect(path);
    socket.on("connect", () => socket.write(wire));
    socket.on("data", chunk => chunks.push(chunk)); socket.on("error", fail); socket.on("end", () => done(Buffer.concat(chunks)));
  });
}

export const loadOwners = async () => ({
  gtl: await import(pathToFileURL(resolve(packageRoot, "build/code/src/gtl/index.js")).href),
  product: await import(pathToFileURL(resolve(packageRoot, "build/code/src/product/index.js")).href),
});
export const CONSTRUCTION_GRAPH_FUNCTION = "graph-function://abiogenesis/default-library/construction@5";
export const NATIVE_IMPLEMENTATION = "implementation://abiogenesis/native-workspace-work@5";
/** Private governed-context policy value naming pinned Python/adapter identities and the one fixed invocation. */
export function governedPolicyValue(gc, { pythonPath = "/opt/python/bin/python3.12", pythonDigest = sha("python"), adapterPath = "/opt/abg/host_adapter.py",
  adapterDigest = sha("adapter"), implementationRef = NATIVE_IMPLEMENTATION, gc03PolicyPath = "/opt/a_c/gc03/policy.json", gc03PolicyDigest = sha("gc03-policy") } = {}) {
  return { kind: gc.GOVERNED_CONTEXT_POLICY_KIND, schemaVersion: "5.0.0",
    release: { identity: gc.GC03_SELECTED_RELEASE.identity, inventorySha256: gc.GC03_SELECTED_RELEASE.inventorySha256,
      installedRoot: "/opt/a_c/gc03", policyPath: gc03PolicyPath, policyDigest: gc03PolicyDigest },
    python: { path: pythonPath, digest: pythonDigest, version: "3.12.8" }, adapter: { path: adapterPath, digest: adapterDigest },
    invocation: { argv: ["-I", "-S", "-B", adapterPath], environment: {}, timeoutMs: 20000 },
    principal: { principalId: "principal://abiogenesis/construction", grantId: "grant://gc03/construction" },
    permission: { role: "constructor", graphFunctionRef: CONSTRUCTION_GRAPH_FUNCTION, implementationRef, execution: gc.GOVERNED_CONTEXT_EXECUTION },
    sources: { task: "rc3/task.md", rubric: "rc3/rubric.json", worksite: ["code/src/abg/governed_context.ts"], testing: { purpose: "testing", fieldPath: [...TESTING_FIELD] } } };
}
/**
 * Authentic owner facts for selection: one generic RunEnvironment declaration
 * built by the real declaration owner, whose member-inventory dependency backs
 * one Context member holding the complete policy bytes, bound by the constructor
 * role's source binding; the Program names it through the private policy key.
 */
export function governedSelectionFacts({ gtl, product, gc, policyBytes, configured = true }) {
  const path = "governed-context/policy.json", digest = product.sha256Bytes(policyBytes);
  const members = [{ path, type: "file", digest, target: null }];
  const basisRef = "support://abiogenesis/governed-context/", contextRef = "context://abiogenesis/governed-context";
  const memberRef = "member://abiogenesis/governed-context/policy.json@5", cm = [{ memberRef, path, byteCount: policyBytes.length, digest }];
  const text = "Construct within the declared grant.";
  const declaration = gtl.constructRunEnvironmentDeclaration({ kind: "run_environment_declaration", schemaVersion: "5.0.0", declarationRef: "declaration://abiogenesis/governed-context",
    dependencies: [{ dependencyRef: "dependency://abiogenesis/governed-context", basisRef, recordRef: basisRef + "inventory.json", recordDigest: product.sha256Canonical(members),
      recordFormat: "member_inventory@1", inventoryDigest: gtl.stdoInventoryDigest(members), members }],
    contexts: [{ contextRef, sourceLocator: basisRef, inventoryDigest: product.sha256Canonical(cm), members: cm }], corpusAccess: null, accesses: [],
    roles: [{ graphFunctionRef: CONSTRUCTION_GRAPH_FUNCTION, programLocusRef: "node://abiogenesis/construct", role: "constructor", frameRefs: [basisRef + path],
      policy: { policyRef: "policy://abiogenesis/default-library/constructor@5", text, digest: product.sha256Bytes(Buffer.from(text)) },
      contextPolicy: { policyRef: "policy://abiogenesis/default-library/constructor/context@5", selectors: ["current_worksite", "admitted_execution_evidence"] }, accessRefs: [],
      sourceBindings: [{ contextRef, memberRef, memberDigest: digest, startByte: 0, endByte: policyBytes.length, spanDigest: digest }] }] });
  const program = { programRef: "program://abiogenesis/governed-context", policies: { "abg.run_environment": declaration.declarationRef,
    ...(configured ? { [gc.GOVERNED_CONTEXT_POLICY_KEY]: memberRef } : {}) } };
  const r = declaration.roles[0];
  const roleEvidence = { role: "constructor", environmentRef: declaration.declarationRef, policy: r.policy, contextPolicy: r.contextPolicy,
    sourceContent: [{ ...r.sourceBindings[0], path, text: policyBytes.toString("utf8") }] };
  return { declaration, program, publication: { programs: [program], runEnvironments: [declaration] }, roleEvidence, memberRef, digest };
}
