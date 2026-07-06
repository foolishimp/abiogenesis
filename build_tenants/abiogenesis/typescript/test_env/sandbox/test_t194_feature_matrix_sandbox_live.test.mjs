// Validates: T-180
// Validates: T-182
// Validates: T-183
// Validates: T-184
// Validates: T-177
// Validates: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Validates: REQ-L-GTL3-NODE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  symlink,
  writeFile
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runtimeBindingSource } from "./support/glc-binding-source.mjs";

import {
  installAbiogenesisTypescript
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  createReleaseSnapshotBundle
} from "../../build/semantic/code/src/qualification/m05/index.js";

const SANDBOX_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(SANDBOX_DIR, "..");
const TENANT_ROOT = path.resolve(SANDBOX_DIR, "..", "..");
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, "..");
const STANDARDS_ROOT = path.join(
  WORKSPACE_ROOT,
  "specification_methodology",
  "specification",
  "standards"
);
const DOCS_ROOT = path.join(REPO_ROOT, "docs");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t194_feature_matrix_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T194_FEATURE_MATRIX_LIVE"] === "1" ||
    process.env["ABG_TS_T184_CANONICAL_HELLO_WORLD_LIVE"] === "1" ||
    process.env["ABG_TS_T182_CAUSAL_CARRY_LIVE"] === "1" ||
    process.env["ABG_TS_T180_GLC_BOOTSTRAP_LIVE"] === "1" ||
    process.env["ABG_TS_T183_INSTRUCTION_ASSEMBLY_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? TENANT_ROOT,
    encoding: "utf8",
    env: options.env ?? process.env
  });
  if (result.status !== 0) {
    throw new Error(
      `${options.label ?? command} failed with ${result.status ?? "null"}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
  return result;
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: TENANT_ROOT,
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeText(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function extractSnapshotPackage(input) {
  const extractRoot = path.join(input.runRoot, "snapshot-extract");
  await mkdir(extractRoot, { recursive: true });
  run("tar", ["-xzf", input.tarballPath, "-C", extractRoot], {
    cwd: input.runRoot,
    label: "extract release snapshot tarball"
  });
  await symlink(
    path.join(TENANT_ROOT, "node_modules"),
    path.join(extractRoot, "node_modules"),
    "dir"
  );
  return path.join(extractRoot, "package");
}

function stableList(values) {
  return `[${[...new Set(values)].sort().map((value) => JSON.stringify(value)).join(", ")}]`;
}


async function writeGlcRuntimeBinding(input) {
  const { workspaceRoot, ...sourceOptions } = input;
  const runtimeBindingPath = path.join(
    workspaceRoot,
    ".abiogenesis",
    "typescript-runtime.mjs"
  );
  await writeText(runtimeBindingPath, runtimeBindingSource(sourceOptions));
  return runtimeBindingPath;
}

function parseJsonLines(text) {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

test("T-194 feature-matrix live: carry-through proves eligible+satisfied from a snapshot-installed sandbox", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T194_FEATURE_MATRIX_LIVE=1 or CODEX_LIVE_FP=1 to run the T-194 feature-matrix live proof");
    return;
  }

  const packageJson = await readJson(path.join(TENANT_ROOT, "package.json"));
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  const workspaceRoot = path.join(runRoot, "instance");
  const toolchainRoot = path.join(runRoot, "toolchain");
  const snapshotRoot = path.join(runRoot, "snapshot", packageJson.version);
  const releaseNotePath = path.join(runRoot, "release-note.md");
  await mkdir(runRoot, { recursive: true });
  await writeText(
    releaseNotePath,
    [
      "# T-180 GLC Hello World Bootstrap Snapshot",
      "",
      "Per-run dirty-source proof snapshot for installed sandbox validation.",
      ""
    ].join("\n")
  );

  const sourceCommit = gitOutput(["rev-parse", "HEAD"]) || "unknown";
  const sourceDirty = gitOutput(["status", "--porcelain", "--untracked-files=normal"]).length > 0;
  const snapshot = await createReleaseSnapshotBundle({
    releaseIdentity: packageJson.version,
    packageSourceRoot: TENANT_ROOT,
    snapshotRoot,
    sourceRef: "t180-glc-bootstrap-live-local",
    sourceCommit,
    sourceDirty,
    allowDirtySource: true,
    rcBranch: "t180/glc-bootstrap-live",
    releaseNotePath,
    expectedPackageName: packageJson.name,
    expectedPackageVersion: packageJson.version,
    runBuild: false,
    npmCacheRoot: path.join(runRoot, ".npm-cache"),
    createdAt: new Date().toISOString()
  });
  assert.equal(snapshot.kind, "created");
  assert.equal(snapshot.manifest.package.packageName, packageJson.name);
  assert.equal(snapshot.manifest.package.packageVersion, packageJson.version);

  const snapshotPackageRoot = await extractSnapshotPackage({
    runRoot,
    tarballPath: snapshot.manifest.tarball.path
  });
  const install = await installAbiogenesisTypescript({
    targetRoot: { rootPath: workspaceRoot },
    packageSourceRoot: snapshotPackageRoot,
    standardsSourceRoot: STANDARDS_ROOT,
    docsSourceRoot: DOCS_ROOT,
    installedPackageName: packageJson.name,
    toolchainRoot
  });
  assert.equal(install.kind, "installed");
  assert.equal(install.packageName, packageJson.name);
  assert.equal(install.packageVersion, packageJson.version);
  assert.equal(install.packageSourceRoot, snapshotPackageRoot);

  const runtimeBindingPath = await writeGlcRuntimeBinding({
    workspaceRoot,
    packageRoot: install.packageRoot,
    packageVersion: packageJson.version,
    includeCarryThrough: true
  });

  const genesisCommand = install.commandPaths.find((commandPath) =>
    path.basename(commandPath) === "genesis-ts"
  );
  assert.equal(typeof genesisCommand, "string");
  const startedAt = Date.now();
  // RELEASE-GRADE MARKING (codex round): the gate ACCEPTS dirty source for
  // development runs, but the artifact is explicitly classified — a release
  // note may cite only a sourceClean run.
  const sourceStatus = spawnSync("git", ["status", "--porcelain"], {
    cwd: TENANT_ROOT,
    encoding: "utf8"
  });
  const sourceClean = sourceStatus.status === 0 && sourceStatus.stdout.trim().length === 0;
  await writeText(
    path.join(runRoot, "t194-gate-classification.json"),
    JSON.stringify(
      {
        kind: "t194_gate_run_classification",
        sourceClean,
        releaseGrade: sourceClean,
        note: sourceClean
          ? "clean-source run: citable as release-grade gate evidence"
          : "dirty-source development run: NOT citable in a release note"
      },
      null,
      2
    ) + "\n"
  );
  console.error(`t194 gate classification: sourceClean=${sourceClean}`);
  const start = run(
    genesisCommand,
    [
      "start",
      "--workspace",
      workspaceRoot,
      "--scope",
      "workspace",
      "--target",
      "next",
      "--until",
      "converged"
    ],
    {
      cwd: workspaceRoot,
      label: "installed genesis-ts start",
      env: {
        ...process.env,
        CODEX_LIVE_FP: "1",
        ABG_TS_T194_FEATURE_MATRIX_LIVE: "1",
        ABG_TS_LIVE_AGENT: process.env["ABG_TS_LIVE_AGENT"] ?? "claude",
        ABG_TS_LIVE_TIMEOUT_MS: process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000"
      }
    }
  );
  const durationMs = Date.now() - startedAt;
  const startOutput = JSON.parse(start.stdout.trim());
  assert.equal(startOutput.command, "start");
  assert.equal(startOutput.stopped_by, "converged");
  assert.equal(startOutput.resolved_target.includes("odd_glc"), true);
  assert.equal(startOutput.event_kinds.includes("graph_function_selected"), true);
  assert.equal(startOutput.event_kinds.includes("graph_call_opened"), true);
  assert.equal(startOutput.event_kinds.includes("instruction_prompt_manifest_projected"), true);
  assert.equal(startOutput.event_kinds.includes("instruction_response_contract_admitted"), true);

  const events = parseJsonLines(await readFile(startOutput.events_path, "utf8"));
  // T-194 rows a3: carry-through eligible chain from the installed sandbox
  const carryEvents = events.filter(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.equal(carryEvents.length > 0, true, "carry-through events must be emitted from the installed sandbox");
  const eligibleCarry = carryEvents.find(
    (event) => event.accepted === true && event.coverageStatuses?.[0] === "eligible"
  );
  assert.ok(eligibleCarry, "at least one accepted+eligible carry-through admission (typed strength via product-declared execution-evidence ref)");
  assert.deepEqual(eligibleCarry.coverageRequirementIds, ["REQ-T194-001"]);
  const foldEvents = events.filter(
    (event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldEvents.length > 0, true, "requirement fold facts must be emitted");
  assert.equal(
    foldEvents.some((event) => event.requirementPayload?.fold?.state === "satisfied"),
    true,
    "REQ-T194-001 must fold satisfied with eligible coverage threaded"
  );

  // T-192 live: the standing temporal gates ran on the installed path —
  // one verdict per gate at the terminal, all satisfied, dispatch gate
  // witnessed (non-vacuous), liveness decided on the completed run.
  const temporalVerdicts = events.filter(
    (event) => event.kind === "temporal_property_verdict_projected"
  );
  assert.equal(temporalVerdicts.length >= 5, true, "standing-gate verdicts must be emitted live");
  const byRef = new Map(temporalVerdicts.map((v) => [v.propertyRef, v]));
  for (const ref of [
    "temporal-property://abg/standing/dispatch-requires-manifest",
    "temporal-property://abg/standing/coverage-requires-payload-admission",
    "temporal-property://abg/standing/invocation-requires-dispatch",
    "temporal-property://abg/standing/selection-requires-registry-admission",
    "temporal-property://abg/standing/selection-eventually-judged"
  ]) {
    const verdict = byRef.get(ref);
    assert.ok(verdict, `missing live verdict for ${ref}`);
    assert.equal(verdict.status, "satisfied", `${ref}: ${verdict?.status}`);
  }
  assert.equal(
    byRef.get("temporal-property://abg/standing/dispatch-requires-manifest").vacuous,
    false,
    "live dispatches happened; G1 must be witnessed"
  );

  // Shared sub-run helper for the negative rows (stub worker, per-row instance).
  const runNegativeRow = async (rowName, bindingOptions) => {
    const rowRoot = path.join(runRoot, `instance-${rowName}`);
    await mkdir(rowRoot, { recursive: true });
    const rowInstall = await installAbiogenesisTypescript({
      targetRoot: { rootPath: rowRoot },
      packageSourceRoot: snapshotPackageRoot,
      standardsSourceRoot: STANDARDS_ROOT,
      docsSourceRoot: DOCS_ROOT,
      installedPackageName: packageJson.name,
      toolchainRoot
    });
    assert.equal(rowInstall.kind, "installed");
    await writeGlcRuntimeBinding({
      workspaceRoot: rowRoot,
      packageRoot: rowInstall.packageRoot,
      packageVersion: packageJson.version,
      includeCarryThrough: true,
      stubDispatch: true,
      ...bindingOptions
    });
    const rowCommand = rowInstall.commandPaths.find((commandPath) =>
      path.basename(commandPath) === "genesis-ts"
    );
    const rowStart = spawnSync(
      rowCommand,
      ["start", "--workspace", rowRoot, "--scope", "workspace", "--target", "next", "--until", "converged"],
      { cwd: rowRoot, encoding: "utf8", env: { ...process.env, ABG_TS_T194_FEATURE_MATRIX_LIVE: "1" } }
    );
    assert.equal([0, 4].includes(rowStart.status), true,
      `row ${rowName} start must converge or block, got ${rowStart.status}\n${rowStart.stdout}\n${rowStart.stderr}`);
    const rowEvents = parseJsonLines(
      await readFile(path.join(rowRoot, ".ai-workspace", "events", "events.jsonl"), "utf8")
    );
    return { rowStart, rowEvents };
  };

  // Row b: shallow depth + stub worker — uncovered obligation shall not
  // close, from the installed public path.
  const b = await runNegativeRow("b", {
    carryDepthClassRefs: ["depth-class://positive"]
  });
  const carryB = b.rowEvents.filter(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.equal(carryB.length > 0, true, "row b must emit carry-through admissions");
  assert.equal(
    carryB.some((event) => event.coverageStatuses?.[0] === "residual"),
    true,
    "shallow depth must classify coverage residual"
  );
  assert.equal(
    carryB.some((event) =>
      (event.coverageIssueKinds ?? []).includes("missing_depth_obligation_class")
    ),
    true,
    "the residual must carry the missing_depth_obligation_class issue kind"
  );
  const foldB = b.rowEvents.filter(
    (event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected"
  );
  assert.equal(foldB.length > 0, true, "row b must project requirement folds");
  assert.equal(
    foldB.some((event) => event.requirementPayload?.fold?.state === "no_close_preserved"),
    true,
    "REQ-T194-001 shall NOT close with residual coverage (uncovered shall not close)"
  );
  assert.equal(
    foldB.some((event) => event.requirementPayload?.fold?.state === "satisfied"),
    false,
    "no satisfied fold may exist for the shallow branch"
  );


  // Row c1: REQ-017 fail-closed — no instruction assembly startup declared
  // => the engine shall block BEFORE any dispatch; nothing reaches a worker.
  const c1 = await runNegativeRow("c1", { omitInstructionAssembly: true });
  assert.equal(c1.rowStart.status, 4, "c1 must block (fail-closed), not converge");
  assert.equal(
    c1.rowEvents.filter((event) => event.kind === "fp_dispatch_requested").length,
    0,
    "c1: no dispatch may be requested without admitted instruction plans"
  );
  assert.equal(
    c1.rowEvents.filter((event) => event.kind === "requirement_proof_carry_through_admitted").length,
    0,
    "c1: no carry-through truth may be minted on the blocked path"
  );
  const c1Terminal = c1.rowEvents.find((event) => event.kind === "terminal_reached");
  assert.ok(c1Terminal, "c1 must reach a typed terminal");
  assert.equal(c1Terminal.terminalKind, "gap_stop");

  // Row c3: rejected-payload no-emission — stub artifact with no
  // fulfillment assessments fails payload admission; the T-188 ordering
  // gate means NO carry-through truth may exist despite dispatch happening.
  const c3 = await runNegativeRow("c3", { stubArtifactVariant: "missing_assessments" });
  assert.equal(
    c3.rowEvents.filter((event) => event.kind === "fp_dispatch_requested").length > 0,
    true,
    "c3: dispatch must happen (the failure is payload admission, not planning)"
  );
  assert.equal(
    c3.rowEvents.filter((event) => event.kind === "requirement_proof_carry_through_admitted").length,
    0,
    "c3: a rejected payload shall not mint coverage truth (T-188 ordering gate)"
  );
  assert.equal(
    c3.rowEvents.some((event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected" &&
      event.requirementPayload?.fold?.state === "satisfied"
    ),
    false,
    "c3: no satisfied requirement fold may exist without admitted coverage"
  );

  // Rows d1-d5 + e: the T-191 authoring-law compiler surface, exercised
  // against the INSTALLED artifact (no engine run, no live cost).
  const installedRoot = await import(
    pathToFileURL(
      path.join(install.packageRoot, "build", "semantic", "code", "src", "index.js")
    ).href
  );
  const { typecheckGtlProgram, assertRatifiedGtlProgramDiagnosticId } = installedRoot;
  assert.equal(typeof typecheckGtlProgram, "function", "installed artifact must export typecheckGtlProgram");

  // d1: every live issue carries a ratified identity + repair field; unknown IDs throw.
  const d1 = typecheckGtlProgram({});
  assert.equal(d1.issues.length > 0, true, "d1: live conformance must surface issues");
  for (const row of d1.issues) {
    assertRatifiedGtlProgramDiagnosticId(row.ruleRef);
    assert.equal(Array.isArray(row.admissibleRepairs), true);
  }
  assert.throws(
    () => assertRatifiedGtlProgramDiagnosticId("abg://gtl-program/bogus/unratified"),
    /ratified/iu,
    "d1: unratified diagnostic identities must be rejected by the installed gate"
  );

  // d2: declaration-source witness law (module_export needs a digest; canonical_data clean).
  const d2Flagged = typecheckGtlProgram({
    declarationSourceRows: [
      { sourceRef: "decl://t194/index.mjs", sourceKind: "module_export", canonicalDigest: "" }
    ]
  });
  const d2Hit = d2Flagged.issues.filter(
    (row) => row.ruleRef === "abg://gtl-program/declaration/module-export-round-trip"
  );
  assert.equal(d2Hit.length, 1, "d2: digestless module_export must flag round-trip law");
  assert.equal(d2Hit[0].admissibleRepairs[0].editClass, "align_digest_or_version");
  const d2Clean = typecheckGtlProgram({
    declarationSourceRows: [
      { sourceRef: "decl://t194/program.gtl.json", sourceKind: "canonical_data", canonicalDigest: "sha256:t194" }
    ]
  });
  assert.equal(
    d2Clean.issues.filter((row) => row.surfaceKind === "declaration_source").length,
    0,
    "d2: witnessed canonical_data must be clean"
  );

  // d3: golden instances require a content digest.
  const d3 = typecheckGtlProgram({
    goldenInstanceBindings: [
      { contractRef: "contract://t194/toy", exampleInstanceRefs: ["payload://t194/good"], counterexampleInstanceRefs: [], instanceSetDigest: "" }
    ]
  });
  assert.equal(
    d3.issues.filter(
      (row) => row.ruleRef === "abg://gtl-program/contract/golden-instance-digest-required"
    ).length,
    1,
    "d3: digestless golden binding must be flagged"
  );

  // d4: declared underdetermination requires a lawful owner route (F_D is not one).
  const d4 = typecheckGtlProgram({
    underdeterminedDeclarations: [
      { scopeRef: "scope://t194/toy", ownerRoute: "F_D", latitudeNote: "" }
    ]
  });
  assert.equal(
    d4.issues.filter(
      (row) => row.ruleRef === "abg://gtl-program/input/underdetermined-owner-route-field"
    ).length,
    1,
    "d4: F_D owner route must fail closed"
  );

  // d5: identity coverage — a differing witness row changes the inventory digest.
  const d5a = typecheckGtlProgram({
    declarationSourceRows: [
      { sourceRef: "decl://t194/a", sourceKind: "canonical_data", canonicalDigest: "sha256:a" }
    ]
  });
  const d5b = typecheckGtlProgram({
    declarationSourceRows: [
      { sourceRef: "decl://t194/b", sourceKind: "canonical_data", canonicalDigest: "sha256:b" }
    ]
  });
  assert.notEqual(d5a.inventoryDigest, d5b.inventoryDigest,
    "d5: witness rows must be covered by the inventory digest");

  // e: corpus-style exact replay — identical input reproduces the identical
  // issue-ID multiset and digest from the installed artifact.
  const e1 = typecheckGtlProgram({});
  const idsOf = (report) => report.issues.map((row) => row.ruleRef).sort().join("|");
  assert.equal(idsOf(e1), idsOf(d1), "e: issue-ID multiset must replay exactly");
  assert.equal(e1.inventoryDigest, d1.inventoryDigest, "e: inventory digest must replay exactly");

  // Row c2a: registry boundary RESOLVES declared ambiguity — a
  // same-interface decoy is admitted, the vector's candidate constraint
  // makes only the lawful entry eligible, selection succeeds, the decoy is
  // never selected, and the run converges with eligible carry-through.
  const c2a = await runNegativeRow("c2a", {
    registryDecoy: true,
    constrainCandidates: true
  });
  assert.equal(c2a.rowStart.status, 0, "c2a: constrained selection must converge");
  const c2aAdmitted = c2a.rowEvents.filter(
    (event) => event.kind === "registry_entry_admitted" && event.entryKind === "graph_function"
  );
  assert.equal(c2aAdmitted.length, 2, "c2a: decoy must be ENUMERATED alongside the lawful entry");
  assert.equal(
    c2aAdmitted.some((event) => event.entryRef.includes("decoy-boundary-test")),
    true,
    "c2a: the admitted set must include the decoy"
  );
  const c2aSelections = c2a.rowEvents.filter(
    (event) => event.kind === "graph_function_selected"
  );
  assert.equal(c2aSelections.length > 0, true, "c2a: selections must occur");
  assert.equal(
    c2aSelections.some((event) => event.selectedEntryRef.includes("decoy-boundary-test")),
    false,
    "c2a: the boundary constraint must exclude the decoy from every selection"
  );
  assert.equal(
    c2a.rowEvents.some(
      (event) =>
        event.kind === "requirement_proof_carry_through_admitted" &&
        event.accepted === true &&
        event.coverageStatuses?.[0] === "eligible"
    ),
    true,
    "c2a: the lawful path still earns eligible coverage under the constraint"
  );

  // Row c2b: UNAUTHORIZED ambiguity fails closed — same decoy, NO declared
  // constraint: the runner asserts no pre-picked candidate, the pick law
  // rejects with replay-visible truth, nothing dispatches, nothing is minted.
  const c2b = await runNegativeRow("c2b", { registryDecoy: true });
  assert.equal(c2b.rowStart.status, 4, "c2b: unauthorized ambiguity must block, not silently pick");
  const c2bRejections = c2b.rowEvents.filter(
    (event) => event.kind === "graph_function_selection_rejected"
  );
  assert.equal(c2bRejections.length > 0, true, "c2b: the rejection must be replay-visible");
  assert.equal(c2bRejections[0].rejectionReason, "no_selected_candidate");
  assert.equal(
    c2b.rowEvents.filter((event) => event.kind === "fp_dispatch_requested").length,
    0,
    "c2b: nothing may dispatch past a rejected selection"
  );
  assert.equal(
    c2b.rowEvents.filter((event) => event.kind === "requirement_proof_carry_through_admitted").length,
    0,
    "c2b: no coverage truth may be minted past a rejected selection"
  );
  const c2bTerminal = c2b.rowEvents.find((event) => event.kind === "terminal_reached");
  assert.equal(c2bTerminal.terminalKind, "gap_stop");
  const registryEvents = events.filter((event) =>
    event.kind === "registry_entry_admitted"
  );
  assert.equal(
    registryEvents.filter((event) => event.entryKind === "node_type").length,
    5
  );
  assert.equal(
    registryEvents.filter((event) => event.entryKind === "graph_function").length,
    1
  );
  const selections = events.filter((event) =>
    event.kind === "graph_function_selected"
  );
  assert.equal(selections.length, 2);
  assert.equal(
    selections.every((event) => event.selectedEntryKind === "graph_function"),
    true
  );
  assert.equal(
    selections.every((event) => event.selectedGraphFunctionRef === startOutput.graph_function_id),
    true
  );
  assert.equal(
    events.some((event) =>
      event.kind === "graph_function_selected" &&
      event.selectedEntryKind === "node_type"
    ),
    false
  );
  const firstSelectionIndex = events.findIndex((event) =>
    event.kind === "graph_function_selected"
  );
  const firstGraphCallIndex = events.findIndex((event) =>
    event.kind === "graph_call_opened"
  );
  assert.ok(firstSelectionIndex >= 0);
  assert.ok(firstGraphCallIndex > firstSelectionIndex);
  const promptManifestEvents = events.filter((event) =>
    event.kind === "instruction_prompt_manifest_projected"
  );
  const responseAdmissionEvents = events.filter((event) =>
    event.kind === "instruction_response_contract_admitted"
  );
  const actorArtifactEvents = events.filter((event) =>
    event.kind === "actor_result_artifact_observed"
  );
  // transform + evaluate stage manifests per vector (T-189 all-arms binding)
  assert.equal(promptManifestEvents.length, 4);
  assert.equal(responseAdmissionEvents.length, 2);
  assert.equal(actorArtifactEvents.length, 2);
  for (const responseEvent of responseAdmissionEvents) {
    const manifestIndex = events.findIndex((event) =>
      event.kind === "instruction_prompt_manifest_projected" &&
      event.manifestRef === responseEvent.manifestRef
    );
    const responseIndex = events.findIndex((event) => event === responseEvent);
    assert.ok(manifestIndex >= 0);
    assert.ok(responseIndex > manifestIndex);
    assert.equal(responseEvent.outputContractRefs.length, 1);
  }
  const causalEvents = events.filter((event) =>
    event.kind === "instruction_causal_context_bound"
  );
  const secondVectorCausalEvent = causalEvents.find((event) =>
    event.vectorIndex === 1
  );
  assert.ok(secondVectorCausalEvent);
  assert.equal(secondVectorCausalEvent.status, "bound");
  assert.deepEqual(secondVectorCausalEvent.contentModes, ["excerpt"]);
  assert.equal(secondVectorCausalEvent.payloadRefs.length > 0, true);
  assert.equal(secondVectorCausalEvent.payloadDigests.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentRefs.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentDigests.length > 0, true);
  assert.equal(secondVectorCausalEvent.contentExcerpts.length > 0, true);
  assert.match(secondVectorCausalEvent.contentExcerpts[0], /Hello, world!/u);
  assert.deepEqual(secondVectorCausalEvent.missingInputRefs, []);
  assert.equal(
    secondVectorCausalEvent.requiredInputRefs.some((ref) =>
      ref.includes("asset_kind=glc_lifecycle_artifact")
    ),
    true
  );

  const programSource = await readFile(
    path.join(workspaceRoot, "generated", "hello-world.mjs"),
    "utf8"
  );
  assert.equal(programSource.includes("Hello, world!"), true);
  const liveRoot = path.join(workspaceRoot, ".ai-workspace", "glc-hello-world-live");
  const firstArtifact = await readJson(
    path.join(liveRoot, "t180-glc-bootstrap-vector-0-artifact.json")
  );
  const secondArtifact = await readJson(
    path.join(liveRoot, "t180-glc-bootstrap-vector-1-artifact.json")
  );
  assert.equal(firstArtifact.execution.stdout, "Hello, world!\n");
  assert.equal(secondArtifact.execution.stdout, "Hello, world!\n");
  assert.equal(firstArtifact.transport.status, 0);
  assert.equal(secondArtifact.transport.status, 0);
  assert.equal(firstArtifact.causalCarry.instructionCausalStatus, "empty");
  assert.equal(secondArtifact.causalCarry.instructionCausalStatus, "bound");
  assert.equal(
    secondArtifact.causalCarry.causalInputContentExcerpts.length > 0,
    true
  );
  assert.deepEqual(
    secondArtifact.causalCarry.causalInputPayloadRefs,
    secondArtifact.assessment.causalInputPayloadRefsSeen
  );
  assert.equal(
    secondArtifact.causalCarry.causalInputContentDigests[0],
    secondArtifact.assessment.causalInputContentDigestSeen
  );
  assert.match(secondArtifact.assessment.causalInputContentSummary, /Hello, world/u);
  assert.deepEqual(
    secondArtifact.causalCarry.causalInputPayloadRefs,
    secondVectorCausalEvent.payloadRefs
  );

  const eventCounts = events.reduce((accumulator, event) => {
    accumulator[event.kind] = (accumulator[event.kind] ?? 0) + 1;
    return accumulator;
  }, {});
  // ── T-200 P6: the -012 audit IS a gate row — spine integrity, enclosure,
  // and external-session parity measured on this run's replay.
  {
    const spineOpened = events.filter((e) => e.kind === "c_call_opened");
    const spineJudged = events.filter((e) => e.kind === "c_call_judged");
    assert.equal(spineOpened.length > 0, true, "-012: spines present on the live run");
    assert.equal(
      spineOpened.length,
      spineJudged.length,
      "-012: every opened C call judged"
    );
    for (const openedEvent of spineOpened) {
      assert.match(openedEvent.cCallRef, /^c-call:sha256:[0-9a-f]{64}$/u, "-004 digest refs");
    }
    const openedRefs = new Set(spineOpened.map((e) => e.cCallRef));
    for (const event of events) {
      if (event.cCallRef !== undefined && event.kind !== "c_call_opened") {
        assert.equal(openedRefs.has(event.cCallRef), true, "-006: no orphan spine rows");
      }
    }
    // external-session parity: worker invocations == transform.F_P spines
    const invocations = events.filter((e) => e.kind === "actor_invocation_started").length;
    const selections = events.filter((e) => e.kind === "c_call_fibre_selected");
    const transformFp = selections.filter((s) => s.regime === "F_P").length -
      selections.filter((s) => s.regime === "F_P" && s.armId.includes("evaluate")).length;
    assert.equal(
      invocations,
      transformFp,
      "-012: external work sessions equal external-work-bearing F_P spines"
    );
  }
  const proof = {
    kind: "t194_feature_matrix_live_proof",
    sourceCommit,
    sourceDirty,
    durationMs,
    installedPackage: {
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      packageRoot: install.packageRoot
    },
    snapshotRoot,
    snapshotTarball: snapshot.manifest.tarball.path,
    snapshotTarballSha256: snapshot.manifest.tarball.sha256,
    workspaceRoot,
    toolchainRoot,
    installedPackageRoot: install.packageRoot,
    runtimeBindingPath,
    genesisCommand,
    startOutput,
    eventDigest: sha256Text(JSON.stringify(events)),
    eventCounts,
    promptManifestCount: promptManifestEvents.length,
    responseAdmissionCount: responseAdmissionEvents.length,
    actorResultArtifactCount: actorArtifactEvents.length,
    registryAdmissionCount: registryEvents.length,
    graphFunctionSelectionCount: selections.length,
    causalCarry: {
      contextRef: secondVectorCausalEvent.contextRef,
      payloadRefs: secondVectorCausalEvent.payloadRefs,
      payloadDigests: secondVectorCausalEvent.payloadDigests,
      contentRefs: secondVectorCausalEvent.contentRefs,
      contentDigests: secondVectorCausalEvent.contentDigests,
      requiredInputRefs: secondVectorCausalEvent.requiredInputRefs
    },
    liveArtifacts: [
      firstArtifact.transport.outputPath,
      secondArtifact.transport.outputPath
    ],
    executionStdout: secondArtifact.execution.stdout
  };
  await writeText(
    path.join(runRoot, "canonical-hello-world-full-stack-live-proof.json"),
    `${JSON.stringify(proof, null, 2)}\n`
  );
});
