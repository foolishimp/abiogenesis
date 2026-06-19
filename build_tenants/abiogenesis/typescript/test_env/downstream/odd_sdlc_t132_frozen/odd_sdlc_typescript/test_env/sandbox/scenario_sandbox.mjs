// Generic scenario sandbox harness.
//
// Takes a scenario descriptor and runs the six-step recipe established by the
// internal data_mapper induction lane:
//
//   1. mint run root under archiveRoot/<scenarioId>/<timestamp>_pid<pid>/
//   2. provision an ABG installed sandbox (provisionAbgInstalledSandbox)
//   3. assert ABG sandbox evidence
//   4. copy the scenario fixture into the workspace
//   5. install odd_sdlc TS into the workspace (installOddSdlcTypescript)
//   6. loop gaps -> start until a lawful stop, maxAdvances, or error
//
// A scenario descriptor is data. New app-building sandboxes plug in by
// authoring a descriptor and a fixture directory; no harness changes required.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import { spawnSync } from "node:child_process";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand,
  normalizeSdlcRequirementDisplayId
} from "../../build/semantic/code/src/index.js";
import {
  assertAbgInstalledSandboxEvidence,
  provisionAbgInstalledSandbox
} from "./abg_installed_workspace.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const DEFAULT_ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);

const DEFAULT_STOP_STATUSES = Object.freeze([
  "converged",
  "fp_worker_unattached",
  "blocked",
  "yielded"
]);

const MULTI_ADVANCE_STOP_STATUSES = Object.freeze([
  "fp_worker_unattached",
  "blocked",
  "yielded"
]);

const EDGE_ASSURANCE_ARCHIVE_ARTIFACTS = Object.freeze([
  "handoff_manifest.json",
  "worker_construction_brief.json",
  "sdlc_edge_gain.json",
  "sdlc_edge_residual_pressure.json",
  "sdlc_edge_fulfillment_ledger.json",
  "sdlc_edge_closure_decision.json",
  "sdlc_next_action_projection.json"
]);

export function mintRunId() {
  return `${new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "")}_pid${process.pid}`;
}

export function assertFixtureFiles(fixtureRoot, sourceFiles) {
  for (const rel of sourceFiles) {
    const abs = path.join(fixtureRoot, rel);
    if (!existsSync(abs)) {
      throw new Error(`scenario fixture missing ${rel} at ${fixtureRoot}`);
    }
  }
}

export function copyFixture(fixtureRoot, targetRoot) {
  mkdirSync(targetRoot, { recursive: true });
  cpSync(fixtureRoot, targetRoot, { recursive: true });
  return targetRoot;
}

export function copyFixtureSourceFiles(fixtureRoot, targetRoot, sourceFiles) {
  mkdirSync(targetRoot, { recursive: true });
  for (const rel of sourceFiles) {
    const source = path.join(fixtureRoot, rel);
    const target = path.join(targetRoot, rel);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(source, target, { recursive: true });
  }
  return targetRoot;
}

export function scenarioStartTargetForStep(scenario, step) {
  if (Array.isArray(scenario.startTargetSequence) && step < scenario.startTargetSequence.length) {
    return scenario.startTargetSequence[step];
  }
  if (
    step > 0 &&
    scenario.continueOnEdgeConverge === true &&
    typeof scenario.startTarget === "string" &&
    scenario.startTarget.startsWith("overlay:")
  ) {
    return "next";
  }
  return scenario.startTarget;
}

export function scenarioStartUntilForStep(scenario, step) {
  if (Array.isArray(scenario.startUntilSequence) && step < scenario.startUntilSequence.length) {
    return scenario.startUntilSequence[step];
  }
  return scenario.startUntil;
}

function buildStartArgs(workspace, scenario, step) {
  const args = ["start", "--workspace", workspace];
  if (scenario.liveWorker !== undefined && scenario.liveWorker !== null) {
    args.push("--worker", scenario.liveWorker);
  }
  const startTarget = scenarioStartTargetForStep(scenario, step);
  if (typeof startTarget === "string" && startTarget.length > 0) {
    args.push("--target", startTarget);
  }
  const startUntil = scenarioStartUntilForStep(scenario, step);
  if (typeof startUntil === "string" && startUntil.length > 0) {
    args.push("--until", startUntil);
  }
  return args;
}

function isStopStatus(status, stopStatuses) {
  return stopStatuses.includes(status);
}

function workspaceFilesExist(workspace, files) {
  if (!Array.isArray(files) || files.length === 0) return false;
  return files.every((rel) => existsSync(path.join(workspace, rel)));
}

function readJsonFile(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readRequiredJsonFile(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} missing at ${filePath}`);
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON at ${filePath}: ${error.message}`);
  }
}

function archiveClosedCleanly(archiveRoot) {
  if (typeof archiveRoot !== "string" || archiveRoot.length === 0) {
    return false;
  }
  const closure = readJsonFile(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json")
  );
  const fpEvaluate = readJsonFile(
    path.join(archiveRoot, "fp_evaluate_result.json")
  );
  return (
    closure?.disposition === "close" &&
    fpEvaluate?.status === "passed" &&
    fpEvaluate?.postflightStatus === "passed"
  );
}

export function scenarioWorkspaceFileStopSatisfied(input) {
  return (
    workspaceFilesExist(input.workspace, input.files) &&
    archiveClosedCleanly(input.archiveRoot)
  );
}

export function scenarioGraphCloseStopSatisfied(workspace) {
  const archiveRoot = latestOperatorRunRoot(workspace);
  if (archiveRoot === null) return false;
  const summary = readJsonFile(path.join(archiveRoot, "operator_summary.json"));
  const nextAction = readJsonFile(
    path.join(archiveRoot, "sdlc_next_action_projection.json")
  );
  const closure = readJsonFile(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json")
  );
  return (
    summary?.currentEdge === null &&
    summary?.nextLawfulAction === "disposition://close" &&
    nextAction?.selectedActionRef === null &&
    nextAction?.choosesNextTraversal === false &&
    closure?.disposition === "close"
  );
}

function operatorRunRoots(workspace) {
  const runsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  if (!existsSync(runsRoot)) return [];
  return readdirSync(runsRoot)
    .map((entry) => path.join(runsRoot, entry))
    .filter((entry) => {
      try {
        return statSync(entry).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function observedHandoffEdgeSequence(workspace) {
  return operatorRunRoots(workspace)
    .flatMap((archiveRoot) => {
      const manifestPath = path.join(archiveRoot, "handoff_manifest.json");
      if (!existsSync(manifestPath)) return [];
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        return typeof manifest.edgeName === "string" ? [manifest.edgeName] : [];
      } catch {
        return [];
      }
    });
}

function observedHandoffEdgesIncludeInOrder(observed, expected) {
  let cursor = 0;
  for (const edge of observed) {
    if (edge === expected[cursor]) {
      cursor += 1;
      if (cursor === expected.length) {
        return true;
      }
    }
  }
  return expected.length === 0;
}

function handoffArchiveGroups(workspace) {
  const groups = [];
  for (const archiveRoot of operatorRunRoots(workspace)) {
    const manifest = readJsonFile(path.join(archiveRoot, "handoff_manifest.json"));
    const edgeName = typeof manifest?.edgeName === "string" ? manifest.edgeName : null;
    if (edgeName === null) continue;
    const record = { archiveRoot, edgeName };
    const last = groups.at(-1);
    if (last?.edgeName === edgeName) {
      last.records.push(record);
    } else {
      groups.push({ edgeName, records: [record] });
    }
  }
  return groups;
}

function firstHandoffManifest(workspace) {
  for (const archiveRoot of operatorRunRoots(workspace)) {
    const manifest = readJsonFile(path.join(archiveRoot, "handoff_manifest.json"));
    if (typeof manifest?.edgeName === "string") {
      return manifest;
    }
  }
  return null;
}

function latestOperatorRunRoot(workspace) {
  const entries = operatorRunRoots(workspace);
  return entries.at(-1) ?? null;
}

function compressConsecutiveValues(values) {
  const compressed = [];
  for (const value of values) {
    if (compressed[compressed.length - 1] !== value) {
      compressed.push(value);
    }
  }
  return compressed;
}

function workspaceRelativePath(workspace, candidate) {
  if (typeof candidate !== "string" || candidate.length === 0) return null;
  let absolutePath = candidate;
  if (candidate.startsWith("file://")) {
    try {
      absolutePath = fileURLToPath(candidate);
    } catch {
      return null;
    }
  }
  if (!path.isAbsolute(absolutePath)) return null;
  const rel = path.relative(workspace, absolutePath);
  if (rel.length === 0 || rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return rel.split(path.sep).join("/");
}

function materializedWorkspaceFilesFromArchive(workspace, archiveRoot) {
  const observed = new Set();
  const manifest = readJsonFile(
    path.join(archiveRoot, "product_materialization_manifest.json")
  );
  const selectedOutputRoot = manifest?.contract?.selectedOutputRoot;
  if (Array.isArray(manifest?.files)) {
    for (const file of manifest.files) {
      const fromAbsolute = workspaceRelativePath(workspace, file?.absolutePath);
      if (fromAbsolute !== null) {
        observed.add(fromAbsolute);
        continue;
      }
      if (
        typeof selectedOutputRoot === "string" &&
        typeof file?.relativePath === "string"
      ) {
        observed.add(
          path.posix.join(selectedOutputRoot, file.relativePath)
        );
      }
    }
  }

  const ledger = readJsonFile(
    path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json")
  );
  if (Array.isArray(ledger?.materializationRefs)) {
    for (const ref of ledger.materializationRefs) {
      const rel = workspaceRelativePath(workspace, ref);
      if (rel !== null) observed.add(rel);
    }
  }
  return observed;
}

function materializedWorkspaceFiles(workspace) {
  const observed = new Set();
  for (const archiveRoot of operatorRunRoots(workspace)) {
    for (const rel of materializedWorkspaceFilesFromArchive(
      workspace,
      archiveRoot
    )) {
      observed.add(rel);
    }
  }
  return observed;
}

function archiveHasArtifacts(archiveRoot, artifacts) {
  return artifacts.every((rel) => existsSync(path.join(archiveRoot, rel)));
}

function selectedEdgeAssuranceArchive(records) {
  const complete = records.filter((record) =>
    archiveHasArtifacts(record.archiveRoot, EDGE_ASSURANCE_ARCHIVE_ARTIFACTS)
  );
  const closed = complete.filter((record) => {
    const closure = readJsonFile(
      path.join(record.archiveRoot, "sdlc_edge_closure_decision.json")
    );
    return closure?.disposition === "close";
  });
  return closed.at(-1) ?? complete.at(-1) ?? records.at(-1) ?? null;
}

function filePathFromRef(ref) {
  if (typeof ref !== "string" || ref.length === 0) return null;
  if (ref.startsWith("file://")) {
    try {
      return fileURLToPath(ref);
    } catch {
      return null;
    }
  }
  return path.isAbsolute(ref) ? ref : null;
}

function assertScenarioExecutionEvidence(result, scenario, expectation) {
  if (expectation === null || typeof expectation !== "object") {
    throw new Error(`${scenario.scenarioId}: executionEvidence expectation must be an object`);
  }
  const edgeName =
    typeof expectation.edgeName === "string" && expectation.edgeName.length > 0
      ? expectation.edgeName
      : "derive_test_execution_result_surface";
  const group = handoffArchiveGroups(result.workspace).find(
    (candidate) => candidate.edgeName === edgeName
  );
  if (group === undefined) {
    throw new Error(`${scenario.scenarioId}: execution evidence edge ${edgeName} not observed`);
  }
  const archive = selectedEdgeAssuranceArchive(group.records);
  if (archive === null) {
    throw new Error(`${scenario.scenarioId}: execution evidence edge ${edgeName} has no archive`);
  }
  const report = readRequiredJsonFile(
    path.join(archive.archiveRoot, "worker_result_report.json"),
    `${scenario.scenarioId}: ${edgeName} worker_result_report.json`
  );
  const outputFile = filePathFromRef(report.outputFile);
  if (outputFile === null) {
    throw new Error(`${scenario.scenarioId}: ${edgeName} report outputFile is not a file ref`);
  }
  const evidence = readRequiredJsonFile(
    outputFile,
    `${scenario.scenarioId}: ${edgeName} execution evidence output`
  );
  if (evidence.kind !== "sdlc_worker_execution_evidence") {
    throw new Error(
      `${scenario.scenarioId}: ${edgeName} output is ${evidence.kind}, expected sdlc_worker_execution_evidence`
    );
  }
  if (typeof expectation.status === "string" && evidence.status !== expectation.status) {
    throw new Error(
      `${scenario.scenarioId}: ${edgeName} execution status ${evidence.status}, expected ${expectation.status}`
    );
  }
  if (
    typeof expectation.commandIncludes === "string" &&
    !String(evidence.command ?? "").includes(expectation.commandIncludes)
  ) {
    throw new Error(
      `${scenario.scenarioId}: ${edgeName} execution command does not include ${expectation.commandIncludes}`
    );
  }
  for (const field of ["testsObserved", "passedCount", "failedCount"]) {
    if (
      typeof expectation[field] === "number" &&
      evidence[field] !== expectation[field]
    ) {
      throw new Error(
        `${scenario.scenarioId}: ${edgeName} execution ${field} ${evidence[field]}, expected ${expectation[field]}`
      );
    }
  }
  if (typeof expectation.stdoutIncludes === "string") {
    const stdoutText = (Array.isArray(evidence.shardEvidence)
      ? evidence.shardEvidence
      : []
    )
      .flatMap((shard) => Array.isArray(shard.reportRefs) ? shard.reportRefs : [])
      .map(filePathFromRef)
      .filter((ref) => ref !== null && ref.endsWith(".stdout.log"))
      .map((filePath) => existsSync(filePath) ? readFileSync(filePath, "utf8") : "")
      .join("\n");
    if (!stdoutText.includes(expectation.stdoutIncludes)) {
      throw new Error(
        `${scenario.scenarioId}: ${edgeName} execution stdout does not include ${expectation.stdoutIncludes}`
      );
    }
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function assertArrayEquals(observed, expected, label) {
  if (!Array.isArray(observed) || !Array.isArray(expected)) {
    throw new Error(`${label} must compare arrays`);
  }
  if (JSON.stringify(observed) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} mismatch — expected ${JSON.stringify(expected)}, saw ${JSON.stringify(observed)}`
    );
  }
}

function assertArrayContainsAll(observed, expected, label) {
  if (!Array.isArray(observed) || !Array.isArray(expected)) {
    throw new Error(`${label} must compare arrays`);
  }
  const missing = expected.filter((value) => !observed.includes(value));
  if (missing.length > 0) {
    throw new Error(
      `${label} missing ${JSON.stringify(missing)} from ${JSON.stringify(observed)}`
    );
  }
}

function valueAtDottedPath(payload, dottedPath) {
  return dottedPath.split(".").reduce((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return current[segment];
  }, payload);
}

function assertJsonFieldEquals(input) {
  const observed = valueAtDottedPath(input.payload, input.field);
  if (JSON.stringify(observed) !== JSON.stringify(input.expected)) {
    throw new Error(
      `${input.label} ${input.field} mismatch — expected ${JSON.stringify(input.expected)}, saw ${JSON.stringify(observed)}`
    );
  }
}

function assertJsonFieldAtLeast(input) {
  const observed = valueAtDottedPath(input.payload, input.field);
  if (
    typeof observed !== "number" ||
    typeof input.expected !== "number" ||
    observed < input.expected
  ) {
    throw new Error(
      `${input.label} ${input.field} below minimum — expected at least ${JSON.stringify(input.expected)}, saw ${JSON.stringify(observed)}`
    );
  }
}

function assertEdgeAssuranceArchive(scenarioId, edgeName, archiveRoot) {
  for (const rel of EDGE_ASSURANCE_ARCHIVE_ARTIFACTS) {
    const abs = path.join(archiveRoot, rel);
    if (!existsSync(abs)) {
      throw new Error(
        `${scenarioId}: edge ${edgeName} assurance archive missing ${rel} at ${archiveRoot}`
      );
    }
  }

  const manifest = readRequiredJsonFile(
    path.join(archiveRoot, "handoff_manifest.json"),
    `${scenarioId}: edge ${edgeName} handoff manifest`
  );
  const gain = readRequiredJsonFile(
    path.join(archiveRoot, "sdlc_edge_gain.json"),
    `${scenarioId}: edge ${edgeName} gain`
  );
  const residualPressure = readRequiredJsonFile(
    path.join(archiveRoot, "sdlc_edge_residual_pressure.json"),
    `${scenarioId}: edge ${edgeName} residual pressure`
  );
  const ledger = readRequiredJsonFile(
    path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json"),
    `${scenarioId}: edge ${edgeName} fulfillment ledger`
  );
  const closureDecision = readRequiredJsonFile(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json"),
    `${scenarioId}: edge ${edgeName} closure decision`
  );
  const nextAction = readRequiredJsonFile(
    path.join(archiveRoot, "sdlc_next_action_projection.json"),
    `${scenarioId}: edge ${edgeName} next action projection`
  );

  if (manifest.edgeName !== edgeName) {
    throw new Error(
      `${scenarioId}: edge assurance archive ${archiveRoot} has manifest edge ${manifest.edgeName}, expected ${edgeName}`
    );
  }
  const contractRef = assertNonEmptyString(
    gain.contractRef,
    `${scenarioId}: edge ${edgeName} gain.contractRef`
  );
  const contractDigest = assertNonEmptyString(
    gain.contractDigest,
    `${scenarioId}: edge ${edgeName} gain.contractDigest`
  );
  const edgeGainRef = assertNonEmptyString(
    gain.gainRef,
    `${scenarioId}: edge ${edgeName} gain.gainRef`
  );
  if (manifest.edgeAssuranceContractRef !== contractRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} manifest contract ref ${manifest.edgeAssuranceContractRef}, expected ${contractRef}`
    );
  }
  if (manifest.edgeAssuranceContractDigest !== contractDigest) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} manifest contract digest ${manifest.edgeAssuranceContractDigest}, expected ${contractDigest}`
    );
  }
  if (residualPressure.contractRef !== contractRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} residual pressure contract ref ${residualPressure.contractRef}, expected ${contractRef}`
    );
  }
  if (residualPressure.contractDigest !== contractDigest) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} residual pressure contract digest ${residualPressure.contractDigest}, expected ${contractDigest}`
    );
  }
  if (ledger.edgeAssuranceContractRef !== contractRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} ledger contract ref ${ledger.edgeAssuranceContractRef}, expected ${contractRef}`
    );
  }
  if (ledger.edgeAssuranceContractDigest !== contractDigest) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} ledger contract digest ${ledger.edgeAssuranceContractDigest}, expected ${contractDigest}`
    );
  }
  if (ledger.edgeGainRef !== edgeGainRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} ledger gain ref ${ledger.edgeGainRef}, expected ${edgeGainRef}`
    );
  }
  assertArrayEquals(
    ledger.edgeResidualPressureRefs,
    residualPressure.requiredPressureRefs,
    `${scenarioId}: edge ${edgeName} ledger residual pressure refs`
  );
  if (closureDecision.disposition !== "close") {
    throw new Error(
      `${scenarioId}: edge ${edgeName} closure disposition ${closureDecision.disposition}, expected close`
    );
  }
  if (closureDecision.edgeGainRef !== edgeGainRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} closure gain ref ${closureDecision.edgeGainRef}, expected ${edgeGainRef}`
    );
  }
  assertNonEmptyString(
    closureDecision.edgeAssuranceDecisionRef,
    `${scenarioId}: edge ${edgeName} closure edgeAssuranceDecisionRef`
  );
  if (nextAction.edgeAssuranceContractRef !== contractRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} next action contract ref ${nextAction.edgeAssuranceContractRef}, expected ${contractRef}`
    );
  }
  if (nextAction.edgeGainRef !== edgeGainRef) {
    throw new Error(
      `${scenarioId}: edge ${edgeName} next action gain ref ${nextAction.edgeGainRef}, expected ${edgeGainRef}`
    );
  }
  assertArrayEquals(
    nextAction.edgeResidualPressureRefs,
    residualPressure.requiredPressureRefs,
    `${scenarioId}: edge ${edgeName} next action residual pressure refs`
  );
}

function assertEdgeAssuranceArchiveSequencePrefix(result, expected) {
  const groups = handoffArchiveGroups(result.workspace);
  if (groups.length < expected.length) {
    throw new Error(
      `${result.scenarioId}: edge assurance archive sequence too short — expected prefix ${expected.join(" -> ")}, saw ${groups.map((group) => group.edgeName).join(" -> ")}`
    );
  }
  expected.forEach((edgeName, index) => {
    const group = groups[index];
    if (group?.edgeName !== edgeName) {
      throw new Error(
        `${result.scenarioId}: edge assurance archive sequence mismatch at ${index} — expected ${edgeName}, saw ${group?.edgeName}; observed=${groups.map((entry) => entry.edgeName).join(" -> ")}`
      );
    }
    const selected = selectedEdgeAssuranceArchive(group.records);
    if (selected === null) {
      throw new Error(
        `${result.scenarioId}: edge ${edgeName} has no operator archive record`
      );
    }
    assertEdgeAssuranceArchive(result.scenarioId, edgeName, selected.archiveRoot);
  });
}

function assertLiveFpParallelMaterializationFrontier(result, expectation) {
  if (expectation === undefined || expectation === null) return;
  const edgeName = assertNonEmptyString(
    expectation.edgeName,
    `${result.scenarioId}: live F_P parallel materialization edgeName`
  );
  const artifact =
    typeof expectation.artifact === "string" && expectation.artifact.length > 0
      ? expectation.artifact
      : "sdlc_live_fp_parallel_materialization_frontier.json";
  const candidates = operatorRunRoots(result.workspace)
    .filter((archiveRoot) => {
      const manifest = readJsonFile(path.join(archiveRoot, "handoff_manifest.json"));
      return manifest?.edgeName === edgeName;
    })
    .filter((archiveRoot) => existsSync(path.join(archiveRoot, artifact)));
  if (candidates.length === 0) {
    throw new Error(
      `${result.scenarioId}: expected live F_P parallel materialization frontier ${artifact} for edge ${edgeName}; standalone ABG process checks or single-worker materialization do not satisfy this proof`
    );
  }
  const archiveRoot = candidates.at(-1);
  const payload = readRequiredJsonFile(
    path.join(archiveRoot, artifact),
    `${result.scenarioId}: live F_P parallel materialization frontier ${artifact}`
  );
  const equals = expectation.equals;
  if (equals !== null && typeof equals === "object" && !Array.isArray(equals)) {
    for (const [field, expected] of Object.entries(equals)) {
      assertJsonFieldEquals({
        payload,
        field,
        expected,
        label: `${result.scenarioId}: live F_P parallel materialization frontier ${artifact}`
      });
    }
  }
  const atLeast = expectation.atLeast;
  if (atLeast !== null && typeof atLeast === "object" && !Array.isArray(atLeast)) {
    for (const [field, expected] of Object.entries(atLeast)) {
      assertJsonFieldAtLeast({
        payload,
        field,
        expected,
        label: `${result.scenarioId}: live F_P parallel materialization frontier ${artifact}`
      });
    }
  }
  const branchRows = Array.isArray(payload.branchRows) ? payload.branchRows : [];
  const requiredBranchRefs = Array.isArray(expectation.requiredBranchRefs)
    ? expectation.requiredBranchRefs
    : [];
  if (requiredBranchRefs.length > 0) {
    assertArrayContainsAll(
      branchRows.map((row) => row?.branchRef).filter((value) => typeof value === "string"),
      requiredBranchRefs,
      `${result.scenarioId}: live F_P parallel materialization branch refs`
    );
  }
  const selectedBranchRows =
    requiredBranchRefs.length > 0
      ? branchRows.filter((row) => requiredBranchRefs.includes(row?.branchRef))
      : branchRows;
  if (expectation.requireBranchWorkerProcessRefs === true) {
    for (const branchRef of requiredBranchRefs) {
      const row = selectedBranchRows.find((candidate) => candidate?.branchRef === branchRef);
      const workerProcessRef = row?.workerProcessRef;
      if (typeof workerProcessRef !== "string" || workerProcessRef.length === 0) {
        throw new Error(
          `${result.scenarioId}: live F_P branch ${branchRef} missing workerProcessRef`
        );
      }
    }
  }
  if (expectation.requireDisjointWriteTerritories === true) {
    const ownersByTerritory = new Map();
    for (const row of selectedBranchRows) {
      const branchRef = row?.branchRef;
      const territories = Array.isArray(row?.writeTerritoryRefs)
        ? row.writeTerritoryRefs.filter((value) => typeof value === "string")
        : [];
      if (typeof branchRef !== "string" || territories.length === 0) {
        throw new Error(
          `${result.scenarioId}: live F_P branch ${branchRef} missing writeTerritoryRefs`
        );
      }
      for (const territory of territories) {
        const prior = ownersByTerritory.get(territory);
        if (prior !== undefined && prior !== branchRef) {
          throw new Error(
            `${result.scenarioId}: write territory ${territory} is shared by ${prior} and ${branchRef}`
          );
        }
        ownersByTerritory.set(territory, branchRef);
      }
    }
  }
  if (Array.isArray(expectation.requiredEventKinds)) {
    const eventKinds = Array.isArray(payload.emittedEventKinds)
      ? payload.emittedEventKinds
      : [];
    assertArrayContainsAll(
      eventKinds,
      expectation.requiredEventKinds,
      `${result.scenarioId}: live F_P parallel materialization event kinds`
    );
  }
  if (typeof expectation.requiredFanInPayloadDigest === "string") {
    const fanInRows = Array.isArray(payload.fanInRows) ? payload.fanInRows : [];
    const payloadDigests = fanInRows
      .map((row) => row?.payloadDigest)
      .filter((value) => typeof value === "string");
    if (!payloadDigests.includes(expectation.requiredFanInPayloadDigest)) {
      throw new Error(
        `${result.scenarioId}: live F_P parallel materialization fan-in missing payload ${expectation.requiredFanInPayloadDigest}`
      );
    }
  }
}

function assertProcessStdoutJson(input) {
  const expectation = input.check.stdoutJson;
  if (expectation === undefined || expectation === null) return;
  let parsed;
  try {
    parsed = JSON.parse(input.stdout);
  } catch (error) {
    throw new Error(
      `${input.scenarioId}: process check ${input.command} stdout was not JSON: ${error.message}`
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      `${input.scenarioId}: process check ${input.command} stdout JSON must be an object`
    );
  }
  if (Array.isArray(expectation.hasKeys)) {
    for (const key of expectation.hasKeys) {
      if (typeof key !== "string" || !Object.hasOwn(parsed, key)) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON missing key ${key}`
        );
      }
    }
  }
  if (expectation.equals !== null && typeof expectation.equals === "object") {
    for (const [key, expected] of Object.entries(expectation.equals)) {
      const observed = parsed[key];
      if (JSON.stringify(observed) !== JSON.stringify(expected)) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} ${JSON.stringify(observed)}, expected ${JSON.stringify(expected)}`
        );
      }
    }
  }
  if (
    expectation.arrayIncludes !== null &&
    typeof expectation.arrayIncludes === "object"
  ) {
    for (const [key, expectedValues] of Object.entries(expectation.arrayIncludes)) {
      const observed = parsed[key];
      if (!Array.isArray(observed) || !Array.isArray(expectedValues)) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} must be an array`
        );
      }
      for (const expected of expectedValues) {
        if (!observed.includes(expected)) {
          throw new Error(
            `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} missing ${JSON.stringify(expected)}`
          );
        }
      }
    }
  }
  if (
    expectation.arrayEquals !== null &&
    typeof expectation.arrayEquals === "object"
  ) {
    for (const [key, expectedValues] of Object.entries(expectation.arrayEquals)) {
      const observed = parsed[key];
      if (!Array.isArray(observed) || !Array.isArray(expectedValues)) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} must be an array`
        );
      }
      if (JSON.stringify(observed) !== JSON.stringify(expectedValues)) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} ${JSON.stringify(observed)}, expected ${JSON.stringify(expectedValues)}`
        );
      }
    }
  }
  if (
    expectation.arrayMembers !== null &&
    typeof expectation.arrayMembers === "object"
  ) {
    for (const [key, expectedValues] of Object.entries(expectation.arrayMembers)) {
      const observed = parsed[key];
      if (!Array.isArray(observed) || !Array.isArray(expectedValues)) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} must be an array`
        );
      }
      const missing = expectedValues.filter(
        (expected) => !observed.includes(expected)
      );
      const extra = observed.filter((value) => !expectedValues.includes(value));
      if (missing.length > 0 || extra.length > 0) {
        throw new Error(
          `${input.scenarioId}: process check ${input.command} stdout JSON field ${key} members ${JSON.stringify(observed)}, expected ${JSON.stringify(expectedValues)}`
        );
      }
    }
  }
}

export async function runScenarioSandbox(scenario, options = {}) {
  if (scenario === null || typeof scenario !== "object") {
    throw new Error("scenario descriptor is required");
  }
  if (typeof scenario.scenarioId !== "string" || scenario.scenarioId.length === 0) {
    throw new Error("scenario.scenarioId is required");
  }
  if (scenario.fixture === undefined || typeof scenario.fixture.root !== "string") {
    throw new Error("scenario.fixture.root is required");
  }

  const archiveRoot = options.archiveRoot ?? resolve(
    PACKAGE_ROOT,
    `test_env/test_runs/${scenario.scenarioId}`
  );
  const abgPackageSourceRoot = options.abgPackageSourceRoot ?? DEFAULT_ABG_TYPESCRIPT_ROOT;
  const packageSourceRoot = options.packageSourceRoot ?? PACKAGE_ROOT;
  const maxAdvances = scenario.maxAdvances ?? 1;
  const continueOnEdgeConverge = scenario.continueOnEdgeConverge === true;
  const defaultStopStatuses = continueOnEdgeConverge
    ? MULTI_ADVANCE_STOP_STATUSES
    : DEFAULT_STOP_STATUSES;
  const stopStatuses = scenario.stopOnLawful ?? defaultStopStatuses;

  mkdirSync(archiveRoot, { recursive: true });
  const runRoot = path.join(archiveRoot, mintRunId());
  const workspace = path.join(runRoot, "workspace");

  assertFixtureFiles(scenario.fixture.root, scenario.fixture.sourceFiles ?? []);

  const installedWorkspace = await provisionAbgInstalledSandbox({
    archiveRoot: runRoot,
    scenarioId: scenario.scenarioId,
    packageSourceRoot: abgPackageSourceRoot
  });
  assertAbgInstalledSandboxEvidence(installedWorkspace);

  if (scenario.fixture.copySourceFilesOnly === true) {
    copyFixtureSourceFiles(
      scenario.fixture.root,
      workspace,
      scenario.fixture.sourceFiles ?? []
    );
  } else {
    copyFixture(scenario.fixture.root, workspace);
  }

  const install = await installOddSdlcTypescript({
    targetRoot: workspace,
    packageSourceRoot,
    abgPackageSourceRoot,
    installedPackageName: scenario.installedPackageName ?? `odd-sdlc-${scenario.scenarioId}`
  });
  if (install.kind !== "installed") {
    throw new Error(`odd_sdlc install did not complete: ${JSON.stringify(install)}`);
  }

  const advances = [];
  let lastStatus = null;
  let lastGapsEdge = null;
  let consecutiveSameEdgeAfterConverge = 0;
  let noProgressReason = null;
  const expectCommandFailure = scenario.expectCommandFailure === true;
  for (let step = 0; step < maxAdvances; step += 1) {
    const gaps = await invokeOddSdlcSpecMethodCommand([
      "gaps",
      "--workspace",
      workspace
    ]);
    if (gaps.status !== "ok" && !expectCommandFailure) {
      throw new Error(
        `${scenario.scenarioId}: gaps command failed at step ${step}: ${JSON.stringify(gaps)}`
      );
    }
    const currentGapsEdge =
      gaps?.payload?.start?.executionContract?.targetGraphFunction ?? null;
    if (
      continueOnEdgeConverge &&
      lastGapsEdge !== null &&
      currentGapsEdge !== null &&
      currentGapsEdge === lastGapsEdge &&
      lastStatus === "converged"
    ) {
      consecutiveSameEdgeAfterConverge += 1;
      if (consecutiveSameEdgeAfterConverge >= 2) {
        noProgressReason = `same_edge_after_converge_twice:${currentGapsEdge}`;
        break;
      }
    } else {
      consecutiveSameEdgeAfterConverge = 0;
    }
    const start = await invokeOddSdlcSpecMethodCommand(buildStartArgs(workspace, scenario, step));
    advances.push({ step, gaps, start });
    lastStatus = start?.payload?.status ?? null;
    lastGapsEdge = currentGapsEdge;
    if (start.status !== "ok") {
      if (expectCommandFailure) break;
      throw new Error(
        `${scenario.scenarioId}: start command failed at step ${step}: ${JSON.stringify(start)}`
      );
    }
    if (
      scenario.stopAfterWorkspaceFilesExist === true &&
      scenarioWorkspaceFileStopSatisfied({
        workspace,
        files: scenario.expectations?.workspaceFiles,
        archiveRoot: start?.payload?.archiveRoot
      })
    ) {
      break;
    }
    if (
      scenario.stopAfterRequiredHandoffEdges === true &&
      Array.isArray(scenario.expectations?.requiredHandoffEdges) &&
      observedHandoffEdgesIncludeInOrder(
        compressConsecutiveValues(observedHandoffEdgeSequence(workspace)),
        scenario.expectations.requiredHandoffEdges
      )
    ) {
      break;
    }
    if (isStopStatus(lastStatus, stopStatuses)) break;
    if (
      scenario.stopAfterGraphClose === true &&
      scenarioGraphCloseStopSatisfied(workspace)
    ) {
      break;
    }
  }

  return {
    scenarioId: scenario.scenarioId,
    runRoot,
    workspace,
    installedWorkspace,
    install,
    advances,
    lastStatus,
    noProgressReason
  };
}

function markdownFilesUnder(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .sort()
    .flatMap((entry) => {
      const absolutePath = path.join(root, entry);
      const stat = statSync(absolutePath);
      if (stat.isDirectory()) {
        return markdownFilesUnder(absolutePath);
      }
      return stat.isFile() && /\.(?:md|markdown)$/iu.test(entry)
        ? [absolutePath]
        : [];
    });
}

function sourceAuthorityMarkdownFiles(workspace) {
  const reportFiles = operatorRunRoots(workspace)
    .map((runRoot) => path.join(runRoot, "conform_project_report.json"))
    .filter((filePath) => existsSync(filePath));
  const sourceRefFiles = reportFiles.flatMap((filePath) => {
    const report = readJsonFile(filePath);
    const sourceRefs = Array.isArray(report?.sourceRefs) ? report.sourceRefs : [];
    return sourceRefs.flatMap((ref) => {
      if (typeof ref !== "string" || !ref.startsWith("file://")) return [];
      try {
        const sourcePath = fileURLToPath(ref);
        return existsSync(sourcePath) && /\.(?:md|markdown)$/iu.test(sourcePath)
          ? [sourcePath]
          : [];
      } catch {
        return [];
      }
    });
  });
  if (sourceRefFiles.length > 0) {
    return [...new Set(sourceRefFiles)].sort();
  }
  return markdownFilesUnder(workspace).filter((filePath) => {
    const rel = path.relative(workspace, filePath).replace(/\\/gu, "/");
    return (
      !rel.startsWith("node_modules/") &&
      !rel.startsWith(".npm-cache/") &&
      !rel.startsWith(".abiogenesis/") &&
      !rel.startsWith(".ai-workspace/runtime/")
    );
  });
}

function findRequirementIds(workspace) {
  return [
    ...new Set(
      sourceAuthorityMarkdownFiles(workspace).flatMap((filePath) => {
        const content = readFileSync(filePath, "utf8");
        return [...content.matchAll(/\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/gmu)]
          .map((match) => normalizeSdlcRequirementDisplayId(match[0]));
      })
    )
  ].sort();
}

export function assertScenarioExpectations(result, scenario) {
  const expectations = scenario.expectations ?? {};
  const firstAdvance = result.advances[0];
  if (firstAdvance === undefined) {
    throw new Error(`${scenario.scenarioId}: no advances were attempted`);
  }
  const firstGapsPayload = firstAdvance.gaps?.payload;
  const firstStartPayload = firstAdvance.start?.payload;
  const firstStartExecutionContract =
    firstStartPayload?.executionContract ??
    firstStartPayload?.start?.executionContract;

  if (expectations.firstEdge !== undefined) {
    const target = firstGapsPayload?.start?.executionContract?.targetGraphFunction;
    if (target !== expectations.firstEdge) {
      throw new Error(
        `${scenario.scenarioId}: first edge mismatch — expected ${expectations.firstEdge}, saw ${target}`
      );
    }
  }
  if (expectations.firstStartStatus !== undefined) {
    const status = firstStartPayload?.status;
    if (status !== expectations.firstStartStatus) {
      throw new Error(
        `${scenario.scenarioId}: first start status mismatch — expected ${expectations.firstStartStatus}, saw ${status}`
      );
    }
  }
  if (expectations.firstStartTargetGraphFunction !== undefined) {
    const target = firstStartExecutionContract?.targetGraphFunction;
    if (target !== expectations.firstStartTargetGraphFunction) {
      throw new Error(
        `${scenario.scenarioId}: first start target mismatch — expected ${expectations.firstStartTargetGraphFunction}, saw ${target}`
      );
    }
  }
  if (expectations.firstStartOverlayRef !== undefined) {
    const overlayRef = firstStartExecutionContract?.overlayRef;
    if (overlayRef !== expectations.firstStartOverlayRef) {
      throw new Error(
        `${scenario.scenarioId}: first start overlay mismatch — expected ${expectations.firstStartOverlayRef}, saw ${overlayRef}`
      );
    }
  }
  if (Array.isArray(expectations.firstEventKinds)) {
    const observed = firstStartPayload?.emittedRuntimeEventKinds ?? [];
    for (const kind of expectations.firstEventKinds) {
      if (!observed.includes(kind)) {
        throw new Error(
          `${scenario.scenarioId}: first start missing emitted event kind ${kind}`
        );
      }
    }
  }
  if (Array.isArray(expectations.requirementIds) && expectations.requirementIds.length > 0) {
    const observed = findRequirementIds(result.workspace);
    for (const id of expectations.requirementIds) {
      if (!observed.includes(id)) {
        throw new Error(
          `${scenario.scenarioId}: requirement ${id} not derivable from workspace source authority`
        );
      }
    }
  }
  if (Array.isArray(expectations.workspaceFiles)) {
    for (const rel of expectations.workspaceFiles) {
      const abs = path.join(result.workspace, rel);
      if (!existsSync(abs)) {
        throw new Error(`${scenario.scenarioId}: expected workspace file ${rel} missing`);
      }
    }
  }
  if (Array.isArray(expectations.materializationEvidenceWorkspaceFiles)) {
    const observed = materializedWorkspaceFiles(result.workspace);
    for (const rel of expectations.materializationEvidenceWorkspaceFiles) {
      if (!observed.has(rel)) {
        throw new Error(
          `${scenario.scenarioId}: expected workspace file ${rel} has no materialization ledger evidence`
        );
      }
    }
  }
  if (Array.isArray(expectations.handoffEdgeSequencePrefix)) {
    const observed = compressConsecutiveValues(
      observedHandoffEdgeSequence(result.workspace)
    );
    const expected = expectations.handoffEdgeSequencePrefix;
    if (observed.length < expected.length) {
      throw new Error(
        `${scenario.scenarioId}: strict handoff edge sequence too short — expected prefix ${expected.join(" -> ")}, saw ${observed.join(" -> ")}`
      );
    }
    expected.forEach((edge, index) => {
      if (observed[index] !== edge) {
        throw new Error(
          `${scenario.scenarioId}: strict handoff edge sequence mismatch at ${index} — expected ${edge}, saw ${observed[index]}; observed=${observed.join(" -> ")}`
        );
      }
    });
  }
  if (Array.isArray(expectations.exactHandoffEdgeSequence)) {
    const observed = compressConsecutiveValues(
      observedHandoffEdgeSequence(result.workspace)
    );
    const expected = expectations.exactHandoffEdgeSequence;
    if (JSON.stringify(observed) !== JSON.stringify(expected)) {
      throw new Error(
        `${scenario.scenarioId}: exact handoff edge sequence mismatch — expected ${expected.join(" -> ")}, saw ${observed.join(" -> ")}`
      );
    }
  }
  if (Array.isArray(expectations.requiredHandoffEdges)) {
    const observed = compressConsecutiveValues(
      observedHandoffEdgeSequence(result.workspace)
    );
    if (!observedHandoffEdgesIncludeInOrder(observed, expectations.requiredHandoffEdges)) {
      throw new Error(
        `${scenario.scenarioId}: required handoff edges missing — expected ${expectations.requiredHandoffEdges.join(" -> ")} in order, saw ${observed.join(" -> ")}`
      );
    }
  }
  if (expectations.firstHandoffOverlayRef !== undefined) {
    const manifest = firstHandoffManifest(result.workspace);
    const overlayRef = manifest?.overlayRef;
    if (overlayRef !== expectations.firstHandoffOverlayRef) {
      throw new Error(
        `${scenario.scenarioId}: first handoff overlay mismatch — expected ${expectations.firstHandoffOverlayRef}, saw ${overlayRef}`
      );
    }
  }
  if (Array.isArray(expectations.edgeAssuranceArchiveSequencePrefix)) {
    assertEdgeAssuranceArchiveSequencePrefix(
      result,
      expectations.edgeAssuranceArchiveSequencePrefix
    );
  }
  assertLiveFpParallelMaterializationFrontier(
    result,
    expectations.liveFpParallelMaterializationFrontier
  );
  if (expectations.executionEvidence !== undefined) {
    assertScenarioExecutionEvidence(result, scenario, expectations.executionEvidence);
  }
  if (Array.isArray(expectations.processChecks)) {
    for (const check of expectations.processChecks) {
      const command = check?.command;
      if (typeof command !== "string" || command.length === 0) {
        throw new Error(`${scenario.scenarioId}: process check missing command`);
      }
      const args = Array.isArray(check.args) ? check.args : [];
      const cwd = path.join(
        result.workspace,
        typeof check.cwd === "string" ? check.cwd : "."
      );
      const executed = spawnSync(command, args, {
        cwd,
        encoding: "utf8"
      });
      if (executed.error !== undefined) {
        throw new Error(
          `${scenario.scenarioId}: process check ${command} failed to start: ${executed.error.message}`
        );
      }
      const expectedExitCode =
        typeof check.exitCode === "number" ? check.exitCode : 0;
      if (executed.status !== expectedExitCode) {
        throw new Error(
          `${scenario.scenarioId}: process check ${command} exit ${executed.status}, expected ${expectedExitCode}; stderr=${executed.stderr}`
        );
      }
      if (typeof check.stdout === "string") {
        const stdout = executed.stdout.trim();
        if (stdout !== check.stdout) {
          throw new Error(
            `${scenario.scenarioId}: process check ${command} stdout ${JSON.stringify(stdout)}, expected ${JSON.stringify(check.stdout)}`
          );
        }
      }
      assertProcessStdoutJson({
        scenarioId: scenario.scenarioId,
        command,
        check,
        stdout: executed.stdout.trim()
      });
    }
  }
  if (expectations.terminalStatus !== undefined) {
    if (result.lastStatus !== expectations.terminalStatus) {
      throw new Error(
        `${scenario.scenarioId}: terminal status mismatch — expected ${expectations.terminalStatus}, saw ${result.lastStatus}`
      );
    }
  }
  if (Array.isArray(expectations.archiveArtifacts)) {
    const archiveRoot = firstStartPayload?.archiveRoot;
    if (typeof archiveRoot !== "string") {
      throw new Error(`${scenario.scenarioId}: no archiveRoot in first start payload`);
    }
    for (const rel of expectations.archiveArtifacts) {
      const abs = path.join(archiveRoot, rel);
      if (!existsSync(abs)) {
        throw new Error(`${scenario.scenarioId}: expected archive artifact ${rel} missing`);
      }
    }
  }
  if (Array.isArray(expectations.latestArchiveArtifacts)) {
    const archiveRoot = latestOperatorRunRoot(result.workspace);
    if (archiveRoot === null) {
      throw new Error(`${scenario.scenarioId}: no operator archive root observed`);
    }
    for (const rel of expectations.latestArchiveArtifacts) {
      const abs = path.join(archiveRoot, rel);
      if (!existsSync(abs)) {
        throw new Error(`${scenario.scenarioId}: expected latest archive artifact ${rel} missing`);
      }
    }
  }
  if (Array.isArray(expectations.latestArchiveJsonAssertions)) {
    const archiveRoot = latestOperatorRunRoot(result.workspace);
    if (archiveRoot === null) {
      throw new Error(`${scenario.scenarioId}: no operator archive root observed`);
    }
    for (const assertion of expectations.latestArchiveJsonAssertions) {
      const rel = assertion?.file;
      if (typeof rel !== "string" || rel.length === 0) {
        throw new Error(`${scenario.scenarioId}: latest archive JSON assertion missing file`);
      }
      const abs = path.join(archiveRoot, rel);
      const payload = readRequiredJsonFile(
        abs,
        `${scenario.scenarioId}: latest archive JSON assertion ${rel}`
      );
      const equals = assertion.equals;
      if (equals === null || typeof equals !== "object" || Array.isArray(equals)) {
        throw new Error(`${scenario.scenarioId}: latest archive JSON assertion ${rel} missing equals object`);
      }
      for (const [field, expected] of Object.entries(equals)) {
        assertJsonFieldEquals({
          payload,
          field,
          expected,
          label: `${scenario.scenarioId}: latest archive JSON assertion ${rel}`
        });
      }
      const atLeast = assertion.atLeast;
      if (atLeast !== undefined) {
        if (
          atLeast === null ||
          typeof atLeast !== "object" ||
          Array.isArray(atLeast)
        ) {
          throw new Error(`${scenario.scenarioId}: latest archive JSON assertion ${rel} has invalid atLeast object`);
        }
        for (const [field, expected] of Object.entries(atLeast)) {
          assertJsonFieldAtLeast({
            payload,
            field,
            expected,
            label: `${scenario.scenarioId}: latest archive JSON assertion ${rel}`
          });
        }
      }
    }
  }
}
