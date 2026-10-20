// No-provider configuration tests. These do not qualify an installed lifecycle.
import assert from "node:assert/strict";
import { readFile, realpath } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { installedFullSandboxApis, readFullSandboxPin, constructFullSandboxTransportConfiguration,
  prepareFullSandboxTransport, assertFullSandboxTransportUnchanged, fullSandboxTransportEnvironment,
  prepareFullSandbox, constructFullSandboxEnvironmentResources } from "./full-sandbox-support.mjs";
import { fullSandboxExactSection, fullSandboxManagementSourceSelections, FULL_SANDBOX_MANAGEMENT_PATHS,
  FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS } from "./full-sandbox-declarations.mjs";
import { constructNativeLifecycleEnvironmentRoles } from "../src/native-lifecycle-declarations.mjs";

// Only existing public digest/argv owners are read from the unchanged default.
// Successor environment/package tests require their explicit frozen candidate.
const { product, abg } = await installedFullSandboxApis((await readFullSandboxPin()).installedRoot);
const root = dirname(fileURLToPath(import.meta.url));
const selection = () => ({ command: process.execPath, expectedVersion: process.version,
  model: "claude-fable-5-1", effort: "xhigh", extraArgs: ["--max-budget-usd", "3"],
  inactivityMs: 120000, absoluteMs: 600000, terminationGraceMs: 1000, wholeRunMs: 1800000 });

test("transport requires prospective finite bounds and exact selection; no defaults", () => {
  assert.throws(() => constructFullSandboxTransportConfiguration(undefined, abg), /explicit transport/u);
  const configured = constructFullSandboxTransportConfiguration(selection(), abg);
  assert.ok(Object.isFrozen(configured) && Object.isFrozen(configured.extraArgs));
  for (const key of ["inactivityMs", "absoluteMs", "terminationGraceMs", "wholeRunMs"]) {
    for (const invalid of [0, -1, Infinity, NaN, 0.5]) {
      assert.throws(() => constructFullSandboxTransportConfiguration({ ...selection(), [key]: invalid }, abg), /finite positive/u);
    }
    const missing = selection(); delete missing[key];
    assert.throws(() => constructFullSandboxTransportConfiguration(missing, abg), /closed transport/u);
  }
  assert.throws(() => constructFullSandboxTransportConfiguration({ ...selection(), wholeRunMs: 600000 }, abg), /termination grace/u);
  assert.throws(() => constructFullSandboxTransportConfiguration({ ...selection(), command: "claude" }, abg), /absolute selected/u);
  assert.throws(() => constructFullSandboxTransportConfiguration({ ...selection(), effort: "ultra" }, abg), /xhigh/u);
});

test("native argv owner admits explicit budget and refuses protocol overrides", () => {
  assert.deepEqual(constructFullSandboxTransportConfiguration(selection(), abg).extraArgs, ["--max-budget-usd", "3"]);
  for (const extraArgs of [["--tools", "Bash"], ["--permission-mode=acceptEdits"], ["{prompt}"], [""]]) {
    assert.throws(() => constructFullSandboxTransportConfiguration({ ...selection(), extraArgs }, abg));
  }
  for (const extraArgs of [["--model", "other"], ["--model=other"], ["--effort", "low"]]) {
    assert.throws(() => constructFullSandboxTransportConfiguration({ ...selection(), extraArgs }, abg), /cannot override/u);
  }
});

test("preparation freezes exact executable and version; later identity drift refuses", async () => {
  // Node's version-only process is a local structural fixture, not Claude or a provider.
  const frozen = await prepareFullSandboxTransport(selection(), { product, abg });
  assert.equal(frozen.resolvedCommand, await realpath(process.execPath));
  assert.equal(frozen.reportedVersion, process.version);
  assert.match(frozen.executableDigest, /^sha256:[a-f0-9]{64}$/u);
  await assertFullSandboxTransportUnchanged(frozen, { product, abg });
  await assert.rejects(prepareFullSandboxTransport({ ...selection(), expectedVersion: "not-this-version" }, { product, abg }), /selected transport version/u);
  await assert.rejects(assertFullSandboxTransportUnchanged({ ...frozen, reportedVersion: "changed" }, { product, abg }), /transport identity/u);
  const { transportDigest: _old, ...different } = { ...frozen, executableDigest: "sha256:" + "0".repeat(64) };
  await assert.rejects(assertFullSandboxTransportUnchanged({ ...different, transportDigest: product.sha256Canonical(different) }, { product, abg }), /executable bytes changed/u);
});

test("execution environment consumes only the frozen transport selection", () => {
  const frozen = { configuration: selection(), resolvedCommand: "/exact/frozen/claude" };
  const env = fullSandboxTransportEnvironment(frozen, { ABG_TS_CLAUDE_COMMAND: "/ambient/claude",
    ABG_TS_CLAUDE_APPEND_ARGS: "ambient", CLAUDE_CODE_EFFORT_LEVEL: "low", ABG_TS_FP_TIMEOUT_MS: "1", AUTH_TOKEN: "preserved" });
  assert.equal(env.ABG_TS_CLAUDE_COMMAND, frozen.resolvedCommand);
  assert.deepEqual(JSON.parse(env.ABG_TS_CLAUDE_APPEND_ARGS), ["--model", "claude-fable-5-1", "--max-budget-usd", "3"]);
  assert.equal(env.CLAUDE_CODE_EFFORT_LEVEL, "xhigh");
  assert.equal(env.ABG_TS_FP_TIMEOUT_MS, "120000");
  assert.equal(env.AUTH_TOKEN, "preserved");
});

test("preparation refuses missing explicit configuration before candidate/setup effects", async () => {
  await assert.rejects(prepareFullSandbox(), /explicit absolute preparation configuration/u);
  const source = await readFile(join(root, "full-sandbox-support.mjs"), "utf8");
  assert.doesNotMatch(source, /timeout: 7200000|versions\/2\.1\.263|FULL_SANDBOX_TRANSPORT/u);
  assert.match(source, /timeout: transport\.configuration\.wholeRunMs/u);
});

test("complete section selection is byte-exact across Unicode and nested headings", () => {
  const text = "# Source\n\né\n## Owning section\nrule α\n### Supporting condition\nwhole body\n## Next\nother\n";
  const bytes = Buffer.from(text), span = fullSandboxExactSection(bytes, "Owning section");
  assert.equal(bytes.subarray(span.startByte, span.endByte).toString(), "## Owning section\nrule α\n### Supporting condition\nwhole body\n");
  assert.throws(() => fullSandboxExactSection(bytes, "Absent"), /one complete owning/u);
  assert.throws(() => fullSandboxExactSection(Buffer.from(text + "## Owning section\nagain\n"), "Owning section"), /one complete owning/u);
});

async function sourceSelectionFixture() {
  const contexts = [], contextContents = {};
  for (const [index, paths] of [FULL_SANDBOX_MANAGEMENT_PATHS.slice(0, 3), FULL_SANDBOX_MANAGEMENT_PATHS.slice(3)].entries()) {
    const members = [];
    for (const path of paths) {
      const bytes = await readFile(index === 0 ? join("/Users/jim/Library/Application Support/STDO/releases/v2.5.0-rc.7", path)
        : join(root, "../../../..", path));
      const memberRef = "member://structural-source-selection/" + index + "/" + path;
      members.push({ memberRef, path, byteCount: bytes.length, digest: product.sha256Bytes(bytes) });
      contextContents[memberRef] = bytes;
    }
    contexts.push({ contextRef: "context://structural-source-selection/" + index,
      sourceLocator: index === 0 ? FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS : "basis://structural-local-context",
      inventoryDigest: product.sha256Canonical(members), members });
  }
  return { contexts, contextContents, sourceBasisRef: FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS };
}

test("actual selected source spans carry role laws and generic clauses, excluding illustrative solutions", async () => {
  const fixture = await sourceSelectionFixture();
  const selected = fullSandboxManagementSourceSelections({ product, ...fixture });
  const content = bindings => bindings.map(row => fixture.contextContents[row.memberRef].subarray(row.startByte, row.endByte).toString()).join("\n");
  assert.match(content(selected.worker), /## Derived Worker Frame/u);
  assert.match(content(selected.reviewer), /## Derived Reviewer Frame/u);
  assert.match(content(selected.requirements), /## Requirement Categories/u);
  assert.match(content(selected.design), /Decision-Complete Symbolic Design/u);
  assert.match(content(selected.execution), /\*\*Effect\*\*|STDO-UP-001/u);
  assert.doesNotMatch(content(selected.common), /Illustrative Hello World binding|Bound System Functions And Carriers|Hello, world!/u);
  for (const rows of Object.values(selected)) for (const row of rows) {
    assert.equal(row.spanDigest, product.sha256Bytes(fixture.contextContents[row.memberRef].subarray(row.startByte, row.endByte)));
  }
  const unrelated = { ...fixture, contextContents: { ...fixture.contextContents, "member://unrelated": Buffer.from("unrelated body") } };
  assert.deepEqual(fullSandboxManagementSourceSelections({ product, ...unrelated }), selected);
  const missing = { ...fixture, contextContents: { ...fixture.contextContents } };
  delete missing.contextContents[fixture.contexts[0].members[0].memberRef];
  assert.throws(() => fullSandboxManagementSourceSelections({ product, ...missing }), /complete source bytes/u);
});

test("configuration projects exactly twelve native actors and no deterministic actor frame", () => {
  // Identified structural family fixture only; native owner conformance is a
  // separate successor-package check, not replaced by this tiny graph fixture.
  const stages = ["intent", "product", "requirements", "design", "evidence"].map(name => ({
    declarationRef: `stage://odd-glc/generic-lifecycle/${name}@5`, graphFunctionRef: "graph://" + name }));
  const graph = (name, roles) => ({ name, template: { nodes: roles.map(role => ({ term: { fibre: role === "deterministic" ? "F_D" : "F_P",
    programLocusRef: name + "/" + role, role } })) } });
  const graphFunctions = stages.map(stage => graph(stage.graphFunctionRef, ["author", "assessor"]));
  const borrowed = [graph("graph://native-construction", ["constructor", "deterministic"]), graph("graph://native-command", ["command_executor"])];
  const publication = { programs: [{ callableMembership: [...graphFunctions, ...borrowed].map(row => row.name) }], graphFunctions,
    semanticJobLifecycle: { stages } };
  const sourceSelections = Object.fromEntries(["common", "worker", "reviewer", "intent", "product", "requirements", "design", "evidence", "construction", "execution"]
    .map(name => [name, [{ contextRef: name }]]));
  let familyCalls = 0;
  const gtl = { cLeafTerms: term => [term], nativeContextLeafFamily: (_graph, leaf) => { familyCalls++; return leaf.role; } };
  const rows = constructNativeLifecycleEnvironmentRoles({ gtl, product, publication, nativePublications: [{ graphFunctions: borrowed }],
    sourceSelections, accessRefs: ["access://structural-fixture"], sourceBasisRef: FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS });
  assert.equal(familyCalls, 12); assert.equal(rows.length, 12);
  assert.equal(rows.filter(row => row.contextPolicy.selectors.includes("assessor_evaluation_data")).length, 1);
  assert.ok(rows.find(row => row.graphFunctionRef === "graph://evidence" && row.role === "assessor").contextPolicy.selectors.includes("assessor_evaluation_data"));
  assert.ok(rows.filter(row => row.role === "author").every(row => !row.contextPolicy.selectors.includes("current_candidate")));
  assert.ok(rows.filter(row => row.graphFunctionRef === "graph://design").every(row => row.contextPolicy.selectors.includes("current_worksite")));
  assert.ok(rows.every(row => row.sourceBindings[0].contextRef === "common"));
  assert.throws(() => constructNativeLifecycleEnvironmentRoles({ gtl: { ...gtl, nativeContextLeafFamily: () => null }, product,
    publication, nativePublications: [{ graphFunctions: borrowed }], sourceSelections, accessRefs: [], sourceBasisRef: FULL_SANDBOX_MANAGEMENT_SOURCE_BASIS }), /unsupported native context leaf/u);
});

test("resource configuration binds actual invocation authority via the native constructor", () => {
  const declaration = { declarationRef: "environment://structural-fixture" }, authority = { authorityRef: "authority://actual-native-invocation",
    authorityDigest: "sha256:" + "a".repeat(64), actorRef: "actor://actual-native-invocation" };
  const configuration = { dependencies: [{ dependencyRef: "dependency://fixture", root: "/frozen/context", recordPath: "/frozen/record.json" }],
    pythonPath: "/exact/python", operations: ["read_context", "validate"] };
  let received;
  const nativeStub = { ...product, constructRunEnvironmentResources(value) { received = value; return value; } };
  const resources = constructFullSandboxEnvironmentResources({ product: nativeStub, declaration, configuration, authority,
    program: { programRef: "program://actual-native-program" }, temporaryRoot: "/exact/archive/access" });
  assert.equal(resources, received, "the native constructor owns the assertion result");
  assert.equal(resources.permission.authorityDigest, authority.authorityDigest);
  assert.equal(resources.permission.environmentDigest, product.sha256Canonical(declaration));
  assert.deepEqual(resources.permission.dependencies, resources.dependencies);
  assert.equal(resources.permission.temporaryRoot, resources.temporaryRoot);
  assert.throws(() => constructFullSandboxEnvironmentResources({ product: nativeStub, declaration,
    configuration: { ...configuration, authorityRef: "authority://pre-authored" }, authority,
    program: { programRef: "program://actual-native-program" }, temporaryRoot: "/exact/archive/access" }), /physical environment setup/u);
});
