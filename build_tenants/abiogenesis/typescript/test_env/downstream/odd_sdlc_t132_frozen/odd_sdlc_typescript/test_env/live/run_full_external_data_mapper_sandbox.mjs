#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  configuredLiveTimeoutMs,
  liveOperatorRuntimePolicy
} from "./operator_runtime_policy.mjs";
import { canonicalDataMapperFixtureRoot } from "../fixtures/data_mapper_fixture.mjs";
import {
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  FG_CONFORM_PROJECT,
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE
} from "../../build/semantic/code/src/index.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "../..");
const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const DEFAULT_TEST_RUN_ROOT = resolve(PACKAGE_ROOT, "test_env/test_runs");
const LANE_NAME =
  process.env["ODD_SDLC_TS_DATA_MAPPER_LANE_NAME"] ??
  "full_external_data_mapper_sandbox";
const DATA_MAPPER_TEMPLATE_ROOT = canonicalDataMapperFixtureRoot();
const DATA_MAPPER_RELEASE_SNAPSHOT_ROOT =
  process.env["ODD_SDLC_TS_DATA_MAPPER_RELEASE_SNAPSHOT_ROOT"] ?? "";
const DATA_MAPPER_PACKAGE_SOURCE_ROOT =
  process.env["ODD_SDLC_TS_DATA_MAPPER_PACKAGE_SOURCE_ROOT"] ?? "";
const WORKER_TRANSPORT =
  cliStringFlag("--worker") ?? RUNTIME_POLICY.liveHarnessDataMapperWorkerTransport;
const DATA_MAPPER_WORKER_MINIMUM_OPERATOR_TIMEOUT_MS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_WORKER_MINIMUM_OPERATOR_TIMEOUT_MS"] ??
  "60000";
const DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS"] ??
  "900000";
const COMMAND_TIMEOUT_MS = configuredLiveTimeoutMs(
  "ODD_SDLC_TS_DATA_MAPPER_COMMAND_TIMEOUT_MS",
  RUNTIME_POLICY.liveHarnessFullCapabilityCommandTimeoutMs
);
const TARGET_GRAPH_FUNCTION =
  process.env["ODD_SDLC_TS_DATA_MAPPER_TARGET_GRAPH_FUNCTION"] ??
  FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE;
const START_TARGET =
  process.env["ODD_SDLC_TS_DATA_MAPPER_START_TARGET"] ??
  `graph_function:${TARGET_GRAPH_FUNCTION}`;
const DATA_MAPPER_MAX_ADVANCES = Number.parseInt(
  process.env["ODD_SDLC_TS_DATA_MAPPER_MAX_ADVANCES"] ?? "80",
  10
);
const DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW = Number.parseInt(
  process.env["ODD_SDLC_TS_DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW"] ?? "10",
  10
);
const DATA_MAPPER_STOP_AFTER_DETAIL_ZOOM =
  process.env["ODD_SDLC_TS_DATA_MAPPER_STOP_AFTER_DETAIL_ZOOM"] !== "false";
const DATA_MAPPER_EXERCISE_TERMINAL_GAP_TICKETS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_EXERCISE_TERMINAL_GAP_TICKETS"] === "true";
const DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY =
  process.env["ODD_SDLC_TS_DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY"] ?? "";
const DATA_MAPPER_RUNTIME_SELECTED_REFS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_RUNTIME_SELECTED_REFS"] ?? "";
const DATA_MAPPER_RUNTIME_EDGE_REFS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_RUNTIME_EDGE_REFS"] ?? "";
const DEFAULT_DATA_MAPPER_STEEL_THREAD_REQUIREMENT_REFS = Object.freeze([
  "requirement://data-mapper/REQ-LDM-01",
  "requirement://data-mapper/REQ-LDM-02",
  "requirement://data-mapper/REQ-LDM-03",
  "requirement://data-mapper/REQ-TYP-06"
]);
const DATA_MAPPER_DETAIL_ZOOM_EDGES = Object.freeze([
  "derive_component_code_surface",
  "qualify_component_realization_surface",
  "derive_code_surface",
  "derive_test_design_surface",
  "derive_component_test_surface",
  "derive_uat_test_source_surface",
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "qualify_component_test_execution_surface",
  "derive_component_repair_schedule_surface",
  "derive_test_run_archive_surface"
]);

function cliStringFlag(flagName) {
  const equalsPrefix = `${flagName}=`;
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === flagName) {
      const value = process.argv[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`${flagName}: expected value`);
      }
      return value;
    }
    if (arg.startsWith(equalsPrefix)) {
      const value = arg.slice(equalsPrefix.length);
      if (value.length === 0) {
        throw new Error(`${flagName}: expected value`);
      }
      return value;
    }
  }
  return null;
}

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function commaSeparatedRefs(value) {
  return Object.freeze(
    value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  );
}

function runtimeTraversalSelectionArgs(startTarget) {
  if (DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY.length === 0) {
    return Object.freeze([]);
  }
  if (DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY !== "steel_thread") {
    throw new Error(
      `unsupported ODD_SDLC_TS_DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY=${DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY}`
    );
  }
  const selectedScheduleItemRefs =
    DATA_MAPPER_RUNTIME_SELECTED_REFS.length === 0
      ? DEFAULT_DATA_MAPPER_STEEL_THREAD_REQUIREMENT_REFS
      : commaSeparatedRefs(DATA_MAPPER_RUNTIME_SELECTED_REFS);
  if (selectedScheduleItemRefs.length === 0) {
    throw new Error("runtime steel_thread selection requires selected refs");
  }
  const edgeRefs = commaSeparatedRefs(DATA_MAPPER_RUNTIME_EDGE_REFS);
  const selection = {
    kind: "start_runtime_traversal_strategy_selection",
    selectionRef:
      `selection://odd-sdlc/data-mapper/runtime-steel-thread/${encodeURIComponent(startTarget)}`,
    strategyOwnerRef: "policy://odd-sdlc/runtime/steel-thread",
    strategyLabel: "steel_thread",
    enforcementPrimitives: [
      "bounded_batch",
      "ordered_schedule_prefix"
    ],
    selectedScheduleItemRefs,
    basisRefs: [
      "ticket://odd-sdlc/T-203",
      startTarget
    ],
    ...(edgeRefs.length === 0 ? {} : { edgeRefs }),
    batch: {
      targetItemCount: selectedScheduleItemRefs.length,
      maxItemCount: selectedScheduleItemRefs.length
    },
    continuation: {
      sameEdgeUntil: "foldback_closed",
      maxAttemptsWithoutNewSignal: 10,
      maxTotalAttempts: 64
    }
  };
  return Object.freeze([
    "--runtime-traversal-selection",
    JSON.stringify(selection)
  ]);
}

function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function assertExists(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`missing ${label}: ${filePath}`);
  }
}

function resolveRunPath(value) {
  if (path.isAbsolute(value)) {
    return value;
  }
  const cwdRelative = resolve(value);
  if (existsSync(cwdRelative)) {
    return cwdRelative;
  }
  return resolve(REPO_ROOT, value);
}

function packageSourceForRun(archiveRoot) {
  if (
    DATA_MAPPER_RELEASE_SNAPSHOT_ROOT.length > 0 &&
    DATA_MAPPER_PACKAGE_SOURCE_ROOT.length > 0
  ) {
    throw new Error(
      "declare only one of ODD_SDLC_TS_DATA_MAPPER_RELEASE_SNAPSHOT_ROOT or ODD_SDLC_TS_DATA_MAPPER_PACKAGE_SOURCE_ROOT"
    );
  }
  if (DATA_MAPPER_PACKAGE_SOURCE_ROOT.length > 0) {
    const packageSourceRoot = resolveRunPath(DATA_MAPPER_PACKAGE_SOURCE_ROOT);
    assertExists(path.join(packageSourceRoot, "package.json"), "override package.json");
    return Object.freeze({
      kind: "package_source_override",
      packageSourceRoot,
      releaseSnapshotRoot: null,
      releaseTarballPath: null
    });
  }
  if (DATA_MAPPER_RELEASE_SNAPSHOT_ROOT.length === 0) {
    return Object.freeze({
      kind: "source_package",
      packageSourceRoot: PACKAGE_ROOT,
      releaseSnapshotRoot: null,
      releaseTarballPath: null
    });
  }

  const releaseSnapshotRoot = resolveRunPath(DATA_MAPPER_RELEASE_SNAPSHOT_ROOT);
  const manifestPath = path.join(releaseSnapshotRoot, "release-snapshot-manifest.json");
  const manifest = readJsonFile(manifestPath);
  const tarballRelativePath = manifest?.tarball?.relativePath;
  if (typeof tarballRelativePath !== "string" || tarballRelativePath.length === 0) {
    throw new Error(`release snapshot manifest does not declare a tarball: ${manifestPath}`);
  }
  const releaseTarballPath = path.join(releaseSnapshotRoot, tarballRelativePath);
  assertExists(releaseTarballPath, "release snapshot tarball");

  const packageSourceRoot = path.join(archiveRoot, "release-package-source");
  rmSync(packageSourceRoot, { recursive: true, force: true });
  mkdirSync(packageSourceRoot, { recursive: true });
  const extract = spawnSync(
    "tar",
    ["-xzf", releaseTarballPath, "-C", packageSourceRoot, "--strip-components=1"],
    {
      encoding: "utf8"
    }
  );
  if (extract.status !== 0) {
    throw new Error(
      `release snapshot package extraction failed: ${extract.stderr || extract.error?.message || extract.status}`
    );
  }
  assertExists(path.join(packageSourceRoot, "package.json"), "extracted release package.json");
  assertExists(
    path.join(packageSourceRoot, "build/semantic/code/src/cli/main.js"),
    "extracted release odd-sdlc-ts CLI"
  );
  return Object.freeze({
    kind: "release_snapshot_package",
    packageSourceRoot,
    releaseSnapshotRoot,
    releaseTarballPath
  });
}

function freshWorkspace(archiveRoot) {
  assertExists(DATA_MAPPER_TEMPLATE_ROOT, "data_mapper template root");
  const workspace = path.join(archiveRoot, "workspace");
  cpSync(DATA_MAPPER_TEMPLATE_ROOT, workspace, { recursive: true });
  for (const relativePath of [
    ".ai-workspace/events",
    ".ai-workspace/runtime",
    ".abiogenesis",
    ".genesis",
    ".npm-cache",
    "node_modules"
  ]) {
    rmSync(path.join(workspace, relativePath), { recursive: true, force: true });
  }
  return workspace;
}

function runCommand(input) {
  const startedAt = new Date().toISOString();
  const processRecordPath = path.join(input.archiveRoot, `${input.label}.process.json`);
  writeJson(processRecordPath, {
    kind: "odd_sdlc_live_sandbox_process_result",
    lifecycleStatus: "started",
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: null,
    signal: null,
    error: null,
    stdoutBytes: 0,
    stderrBytes: 0,
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    startedAt,
    endedAt: null,
    hostPid: process.pid
  });
  const result = spawnSync(input.command, input.args, {
    cwd: input.cwd,
    encoding: "utf8",
    env: input.env,
    maxBuffer: 1024 * 1024 * 100,
    timeout: COMMAND_TIMEOUT_MS
  });
  const endedAt = new Date().toISOString();
  const record = {
    kind: "odd_sdlc_live_sandbox_process_result",
    lifecycleStatus: "completed",
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    stdoutBytes: Buffer.byteLength(result.stdout ?? "", "utf8"),
    stderrBytes: Buffer.byteLength(result.stderr ?? "", "utf8"),
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    startedAt,
    endedAt,
    hostPid: process.pid
  };
  writeJson(processRecordPath, record);
  writeFileSync(
    path.join(input.archiveRoot, `${input.label}.stdout.json`),
    result.stdout ?? "",
    "utf8"
  );
  writeFileSync(
    path.join(input.archiveRoot, `${input.label}.stderr.log`),
    result.stderr ?? "",
    "utf8"
  );
  const acceptedStatuses = input.acceptedStatuses ?? Object.freeze([0]);
  if (!acceptedStatuses.includes(result.status)) {
    throw new Error(
      `${input.label} failed: ${result.stderr || JSON.stringify(record, null, 2)}`
    );
  }
  return result.stdout === "" ? null : JSON.parse(result.stdout);
}

function specPayload(parsed, label) {
  if (parsed?.kind !== "odd_sdlc_spec_method_result" || parsed.status !== "ok") {
    throw new Error(`${label} returned non-ok spec-method result: ${JSON.stringify(parsed, null, 2)}`);
  }
  return parsed.payload;
}

function installedCommandFromInstallPayload(payload, workspace) {
  const commandPath = payload.commandPaths?.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  if (commandPath !== undefined) {
    return commandPath;
  }
  return path.join(workspace, "node_modules/.bin/odd-sdlc-ts");
}

function installedAbgCommandFromInstallPayload(payload, workspace, commandName) {
  const commandPath = payload.commandPaths?.find(
    (candidate) => path.basename(candidate) === commandName
  );
  if (commandPath !== undefined) {
    return commandPath;
  }
  return path.join(workspace, "node_modules/.bin", commandName);
}

function copyCacheSeedIfPresent(input) {
  if (input.source.length === 0 || !existsSync(input.source)) {
    return null;
  }
  mkdirSync(dirname(input.destination), { recursive: true });
  cpSync(input.source, input.destination, {
    recursive: true,
    force: true,
    errorOnExist: false
  });
  return Object.freeze({
    source: input.source,
    destination: input.destination
  });
}

function seedSandboxToolCache(input) {
  const home = process.env["HOME"] ?? "";
  const hostSbtBoot =
    process.env["ODD_SDLC_TS_HOST_SBT_BOOT_CACHE"] ??
    (home.length === 0 ? "" : path.join(home, ".sbt/boot"));
  const hostCoursierV1 =
    process.env["ODD_SDLC_TS_HOST_COURSIER_V1_CACHE"] ??
    (home.length === 0 ? "" : path.join(home, "Library/Caches/Coursier/v1"));
  const seeded = [
    copyCacheSeedIfPresent({
      source: hostSbtBoot,
      destination: input.sbtBootDirectory
    }),
    copyCacheSeedIfPresent({
      source: path.join(hostCoursierV1, "https/repo1.maven.org/maven2/org/scala-sbt"),
      destination: path.join(input.coursierCache, "https/repo1.maven.org/maven2/org/scala-sbt")
    }),
    copyCacheSeedIfPresent({
      source: path.join(hostCoursierV1, "https/repo1.maven.org/maven2/org/scala-lang"),
      destination: path.join(input.coursierCache, "https/repo1.maven.org/maven2/org/scala-lang")
    })
  ].filter((entry) => entry !== null);
  return Object.freeze(seeded);
}

function sandboxToolCache(input) {
  const toolCacheRoot = path.join(
    input.workspace,
    ".ai-workspace/runtime/odd_sdlc/tool-cache"
  );
  const sbtBootDirectory = path.join(toolCacheRoot, "sbt-boot");
  const sbtGlobalBase = path.join(toolCacheRoot, "sbt-global");
  const sbtIvyHome = path.join(toolCacheRoot, "ivy2");
  const coursierCache = path.join(toolCacheRoot, "coursier");
  const archiveToolCacheRoot = path.join(input.archiveRoot, "tool-cache");
  for (const dirPath of [
    toolCacheRoot,
    sbtBootDirectory,
    sbtGlobalBase,
    sbtIvyHome,
    coursierCache
  ]) {
    mkdirSync(dirPath, { recursive: true });
  }
  const seededCacheRefs = seedSandboxToolCache({
    sbtBootDirectory,
    coursierCache
  });
  const sbtProperties = [
    `-Dsbt.boot.directory=${sbtBootDirectory}`,
    `-Dsbt.global.base=${sbtGlobalBase}`,
    `-Dsbt.ivy.home=${sbtIvyHome}`,
    `-Divy.home=${sbtIvyHome}`
  ].join(" ");
  return Object.freeze({
    toolCacheRoot,
    archiveToolCacheRoot,
    sbtBootDirectory,
    sbtGlobalBase,
    sbtIvyHome,
    coursierCache,
    seededCacheRefs,
    env: Object.freeze({
      COURSIER_CACHE: coursierCache,
      IVY_HOME: sbtIvyHome,
      SBT_OPTS: [process.env["SBT_OPTS"] ?? "", sbtProperties].join(" ").trim()
    })
  });
}

function dataMapperWorkerRuntimeEnv() {
  return Object.freeze({
    ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS:
      DATA_MAPPER_WORKER_MINIMUM_OPERATOR_TIMEOUT_MS,
    ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS:
      DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS
  });
}

function findProductMaterializationPackages(workspace) {
  const runsRoot = path.join(workspace, ".ai-workspace/runtime/odd_sdlc/operator-runs");
  if (!existsSync(runsRoot)) {
    return [];
  }
  const packages = [];
  const stack = [runsRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readDirEntries(current)) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
      } else if (entry.isFile() && entry.name === "worker_invocation_package.json") {
        const pkg = readJsonFile(child);
        if (pkg.outputContract?.materializationRequired === true) {
          packages.push({
            path: child,
            edgeName: pkg.edgeName,
            targetAssetType: pkg.targetAssetType,
            declaredProductFileTargets:
              pkg.outputContract?.declaredProductFileTargets ?? [],
            productMaterializationAuthority: pkg.productMaterializationAuthority ?? null
          });
        }
      }
    }
  }
  return packages.sort((left, right) => left.path.localeCompare(right.path));
}

function readDirEntries(dirPath) {
  return existsSync(dirPath)
    ? [...readdirSync(dirPath, { withFileTypes: true })]
    : [];
}

function operatorRunRoots(workspace) {
  const runsRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  if (!existsSync(runsRoot)) {
    return [];
  }
  return readdirSync(runsRoot)
    .map((entry) => path.join(runsRoot, entry))
    .filter((entryPath) => {
      try {
        return statSync(entryPath).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function observedHandoffRecords(workspace) {
  return operatorRunRoots(workspace)
    .map((runRoot) => {
      const manifestPath = path.join(runRoot, "handoff_manifest.json");
      if (!existsSync(manifestPath)) {
        return null;
      }
      const manifest = readJsonFile(manifestPath);
      return Object.freeze({
        runRoot,
        edgeName: manifest.edgeName ?? null,
        overlayRef: manifest.overlayRef ?? null,
        overlayZoomGraphFunctionRefs: Object.freeze([
          ...(Array.isArray(manifest.overlayZoomGraphFunctionRefs)
            ? manifest.overlayZoomGraphFunctionRefs
            : manifest.zoomGraphFunctionRef === undefined ||
                manifest.zoomGraphFunctionRef === null
              ? []
              : [manifest.zoomGraphFunctionRef])
        ])
      });
    })
    .filter((entry) => entry !== null);
}

function observedDetailZoomEdges(workspace) {
  return observedHandoffRecords(workspace)
    .filter((entry) =>
      entry.overlayZoomGraphFunctionRefs.includes(FG_DECOMPOSE_DEPTH_BETWEEN_NODES)
    )
    .map((entry) => entry.edgeName)
    .filter((edgeName) => typeof edgeName === "string" && edgeName.length > 0);
}

function observedHandoffEdgesIncludeInOrder(observed, expected) {
  let cursor = 0;
  for (const edgeName of observed) {
    if (edgeName === expected[cursor]) {
      cursor += 1;
      if (cursor === expected.length) {
        return true;
      }
    }
  }
  return expected.length === 0;
}

function detailZoomStopSatisfied(workspace) {
  return (
    DATA_MAPPER_STOP_AFTER_DETAIL_ZOOM &&
    observedHandoffEdgesIncludeInOrder(
      observedDetailZoomEdges(workspace),
      DATA_MAPPER_DETAIL_ZOOM_EDGES
    )
  );
}

function releaseDepthParityMet(workspace) {
  const releaseDepthParityPath = path.join(
    workspace,
    "build_tenants/scala_spark/design/release_depth_parity_surface.md"
  );
  if (!existsSync(releaseDepthParityPath)) {
    return false;
  }
  let register;
  try {
    register = readJsonFile(releaseDepthParityPath);
  } catch {
    return false;
  }
  return (
    register?.releaseDepthParity?.status === "met" &&
    Array.isArray(register.releaseDepthParity.blockingReasons) &&
    register.releaseDepthParity.blockingReasons.length === 0
  );
}

function releaseSurfacePresent(workspace) {
  const releaseSurfacePath = path.join(
    workspace,
    "build_tenants/scala_spark/design/release_surface.md"
  );
  return (
    existsSync(releaseSurfacePath) &&
    readFileSync(releaseSurfacePath, "utf8").includes("# release_surface")
  );
}

function releaseProofStopSatisfied(workspace) {
  return (
    !DATA_MAPPER_STOP_AFTER_DETAIL_ZOOM &&
    observedHandoffEdgesIncludeInOrder(
      observedDetailZoomEdges(workspace),
      DATA_MAPPER_DETAIL_ZOOM_EDGES
    ) &&
    releaseDepthParityMet(workspace) &&
    releaseSurfacePresent(workspace)
  );
}

function graphFunctionFromStartTarget(startTarget) {
  return startTarget.startsWith("graph_function:")
    ? startTarget.slice("graph_function:".length)
    : null;
}

function isOverlayStartTarget(startTarget) {
  return startTarget.startsWith("overlay:");
}

function graphFunctionStartTargetFromPostCloseOverlayActionRef(actionRef) {
  if (typeof actionRef !== "string" || actionRef.length === 0) {
    return null;
  }
  const marker = "/post_close_overlay_continuation/";
  const markerIndex = actionRef.indexOf(marker);
  if (markerIndex < 0) {
    return null;
  }
  const remainder = actionRef.slice(markerIndex + marker.length);
  const nextGraphFunctionRef = remainder.split("/")[0] ?? "";
  if (nextGraphFunctionRef.length === 0) {
    return null;
  }
  if (nextGraphFunctionRef.startsWith("graph_function:")) {
    return nextGraphFunctionRef;
  }
  return `graph_function:${nextGraphFunctionRef}`;
}

function startNextLawfulAction(start) {
  return start?.summary?.nextLawfulAction ?? start?.nextLawfulAction ?? null;
}

function runtimeTraversalSelectionEnabled() {
  return DATA_MAPPER_RUNTIME_TRAVERSAL_STRATEGY.length > 0;
}

function abgStartArgs(startTarget) {
  return [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    startTarget,
    "--until",
    "converged"
  ];
}

function sdlcStartArgs(startTarget) {
  return [
    "start",
    "--workspace",
    ".",
    "--target",
    startTarget,
    "--until",
    "first_traversal",
    "--worker",
    WORKER_TRANSPORT,
    ...runtimeTraversalSelectionArgs(startTarget)
  ];
}

function startCommandForTarget(input) {
  return isOverlayStartTarget(input.startTarget) ||
    runtimeTraversalSelectionEnabled()
    ? input.installedCommand
    : input.genesisCommand;
}

function startArgsForTarget(startTarget) {
  return isOverlayStartTarget(startTarget) ||
    runtimeTraversalSelectionEnabled()
    ? sdlcStartArgs(startTarget)
    : abgStartArgs(startTarget);
}

function startLabelForTarget(startTarget) {
  return isOverlayStartTarget(startTarget) ||
    runtimeTraversalSelectionEnabled()
    ? "odd-sdlc-start-first-traversal"
    : "abg-start-until-converged";
}

function nextGraphFunctionStartTargetFromStart(start, currentStartTarget) {
  const postCloseOverlayActionStartTarget =
    graphFunctionStartTargetFromPostCloseOverlayActionRef(startNextLawfulAction(start));
  const nextActionProjection =
    start?.traversalConsequence?.nextActionProjection ??
    start?.nextActionProjection ??
    start?.start?.executionContract?.nextActionProjection ??
    null;
  if (nextActionProjection?.choosesNextTraversal !== true) {
    return postCloseOverlayActionStartTarget;
  }
  const selectedPostCloseOverlayStartTarget =
    graphFunctionStartTargetFromPostCloseOverlayActionRef(
      nextActionProjection.selectedActionRef
    );
  if (
    nextActionProjection.overlayStopDisposition === "overlay_segment_complete" &&
    typeof nextActionProjection.selectedActionRef === "string" &&
    nextActionProjection.selectedActionRef.includes(
      "post_close_next_eligible_overlay"
    ) &&
    Array.isArray(nextActionProjection.nextEligibleOverlayRefs)
  ) {
    const nextEligibleOverlayRef = nextActionProjection.nextEligibleOverlayRefs
      .find((ref) => typeof ref === "string" && ref.startsWith("overlay://"));
    if (nextEligibleOverlayRef !== undefined) {
      return nextEligibleOverlayRef;
    }
  }
  const nextGraphFunctionRef = nextActionProjection.nextGraphFunctionRef;
  if (typeof nextGraphFunctionRef !== "string" || nextGraphFunctionRef.length === 0) {
    return selectedPostCloseOverlayStartTarget ?? postCloseOverlayActionStartTarget;
  }
  if (
    nextGraphFunctionRef.startsWith("graph_function:") ||
    nextGraphFunctionRef.startsWith("overlay:") ||
    nextGraphFunctionRef.startsWith("asset:")
  ) {
    return nextGraphFunctionRef;
  }
  if (
    typeof nextActionProjection.selectedActionRef === "string" &&
    nextActionProjection.selectedActionRef.includes(
      "post_close_overlay_continuation"
    )
  ) {
    return selectedPostCloseOverlayStartTarget ?? `graph_function:${nextGraphFunctionRef}`;
  }
  if (
    isOverlayStartTarget(currentStartTarget) ||
    graphFunctionFromStartTarget(currentStartTarget) !== null
  ) {
    return currentStartTarget;
  }
  return null;
}

function unwrapStartPayload(parsed, label) {
  if (parsed?.kind === "odd_sdlc_spec_method_result") {
    if (parsed.status !== "ok") {
      throw new Error(`${label} returned non-ok spec-method result: ${JSON.stringify(parsed, null, 2)}`);
    }
    return parsed.payload;
  }
  return parsed;
}

function summaryStepFromStart(phase, start) {
  const summary = start?.summary ?? null;
  return {
    phase,
    status: start?.status ?? summary?.status ?? null,
    target: start.target ?? null,
    resolvedTarget: start.resolved_target ?? null,
    edge: start.edge ?? summary?.currentEdge ?? null,
    stoppedBy: start.stopped_by ?? null,
    stopClass: start.stop_class ?? null,
    liveStatus: start.live_status ?? null,
    eventKinds: start.event_kinds ?? start.emittedRuntimeEventKinds ?? []
  };
}

function compactStartForSummary(start) {
  const summary = start?.summary ?? null;
  const executionContract = start?.start?.executionContract ?? null;
  const overlaySegmentCompletion =
    start?.traversalConsequence?.overlaySegmentCompletion ?? null;
  return Object.freeze({
    kind: start?.kind ?? null,
    status: start?.status ?? summary?.status ?? null,
    graphFunctionName:
      summary?.graphFunctionName ?? executionContract?.targetGraphFunction ?? null,
    currentEdge: summary?.currentEdge ?? null,
    blockingReason: summary?.blockingReason ?? null,
    nextLawfulAction: summary?.nextLawfulAction ?? null,
    archiveRoot: start?.archiveRoot ?? summary?.archiveRoot ?? null,
    overlayRef: executionContract?.overlayRef ?? overlaySegmentCompletion?.overlayRef ?? null,
    overlayZoomGraphFunctionRefs:
      executionContract?.overlayBinding?.zoomGraphFunctionRefs ?? [],
    overlayZoomTargetGraphFunctionRefs:
      executionContract?.overlayBinding?.zoomTargetGraphFunctionRefs ?? [],
    overlaySegmentCompletion:
      overlaySegmentCompletion === null
        ? null
        : Object.freeze({
            stopDisposition: overlaySegmentCompletion.stopDisposition ?? null,
            productConverged: overlaySegmentCompletion.productConverged ?? null,
            remainingGraphPressureRefs:
              overlaySegmentCompletion.remainingGraphPressureRefs ?? []
          })
  });
}

function isLawfulAbgGapStop(start) {
  return (
    start?.status === "blocked" &&
    start?.stopped_by === "blocked" &&
    start?.control_outcome?.kind === "blocked" &&
    start?.control_outcome?.stopDetail?.kind === "gap_stop" &&
    start?.live_status?.runStatus === "blocked" &&
    start?.live_status?.reason === "gap_stop" &&
    start?.stop_class?.kind === "blocked"
  );
}

function terminalReasonFromStart(start) {
  if (
    start?.kind === "sdlc_installed_operator_start_cli_projection" ||
    start?.kind === "sdlc_installed_operator_start_outcome"
  ) {
    const status = start.status ?? start.summary?.status ?? null;
    if (status === "converged") {
      return "sdlc_reported_converged";
    }
    if (status === "blocked") {
      return "sdlc_reported_blocked";
    }
    throw new Error(
      `SDLC start returned non-terminal status: ${JSON.stringify(start, null, 2)}`
    );
  }
  if (start?.status === "converged") {
    return "abg_reported_converged";
  }
  if (isLawfulAbgGapStop(start)) {
    return "abg_reported_lawful_gap_stop";
  }
  throw new Error(
    `ABG start returned non-lawful terminal: ${JSON.stringify(start, null, 2)}`
  );
}

function startArchiveRoot(start) {
  return start?.archiveRoot ?? start?.summary?.archiveRoot ?? null;
}

function startBlockingReason(start) {
  return start?.summary?.blockingReason ?? start?.blockingReason ?? null;
}

function startBlockingReasons(start) {
  const summaryReasons = start?.summary?.blockingReasons;
  if (Array.isArray(summaryReasons)) {
    return summaryReasons;
  }
  const directReasons = start?.blockingReasons;
  return Array.isArray(directReasons) ? directReasons : [];
}

function startClosureDisposition(start) {
  return (
    start?.summary?.admittedSemantic?.closureDisposition ??
    start?.traversalConsequence?.edgeClosureDecision?.disposition ??
    start?.edgeClosureDecision?.disposition ??
    null
  );
}

function isSameEdgeRetryStart(start) {
  const closureDisposition = startClosureDisposition(start);
  if (closureDisposition !== null) {
    return closureDisposition === "retry";
  }
  return startBlockingReasons(start).some(
    (reason) => reason?.lawfulReentryPoint === "same_edge_retry"
  );
}

function shouldContinueSameEdgeRetry(start) {
  return (
    startBlockingReason(start) !== "retry_budget_exhausted" &&
    isSameEdgeRetryStart(start)
  );
}

function shouldRunTerminalGapTicketWorkflow(start) {
  const blockingReason = startBlockingReason(start);
  if (blockingReason === "retry_budget_exhausted") {
    return true;
  }
  const status = start?.status ?? start?.summary?.status ?? null;
  if (status !== "blocked") {
    return false;
  }
  if (isSameEdgeRetryStart(start)) {
    return false;
  }
  if (
    typeof blockingReason === "string" &&
    (blockingReason.includes("review_grade_assessment_invalid") ||
      blockingReason.includes("evaluation_set_incomplete") ||
      blockingReason.includes("triage_gap"))
  ) {
    return true;
  }
  return startBlockingReasons(start).some((reason) => {
    const code = reason?.code ?? null;
    return (
      reason?.lawfulReentryPoint === "triage_gap" ||
      code === "review_grade_assessment_invalid"
    );
  });
}

function maybeRunTerminalGapTicketWorkflow(input) {
  const operatorRunRoot = startArchiveRoot(input.start);
  if (operatorRunRoot === null || !shouldRunTerminalGapTicketWorkflow(input.start)) {
    return null;
  }
  const requiredTicketIntakeFiles = [
    "operator_summary.json",
    "review_grade_edge_fulfillment_assessment.json",
    "sdlc_edge_closure_decision.json"
  ];
  if (
    requiredTicketIntakeFiles.some(
      (relativePath) => !existsSync(path.join(operatorRunRoot, relativePath))
    )
  ) {
    return null;
  }
  const intake = specPayload(
    runCommand({
      label: "ticket-intake-terminal-gap",
      command: input.installedCommand,
      args: [
        "ticket-intake",
        "--workspace",
        ".",
        "--from-run",
        operatorRunRoot,
        "--kind",
        "code_review_triage"
      ],
      cwd: input.workspace,
      env: input.env,
      archiveRoot: input.archiveRoot
    }),
    "ticket-intake"
  );
  const parentTicketRef = intake?.parentTicket?.ticketRef;
  if (typeof parentTicketRef !== "string" || parentTicketRef.length === 0) {
    throw new Error(
      `ticket-intake did not return a parent ticket ref: ${JSON.stringify(intake, null, 2)}`
    );
  }
  const admitted = specPayload(
    runCommand({
      label: "ticket-admit-terminal-gap",
      command: input.installedCommand,
      args: [
        "ticket-admit",
        "--workspace",
        ".",
        "--target",
        parentTicketRef
      ],
      cwd: input.workspace,
      env: input.env,
      archiveRoot: input.archiveRoot
    }),
    "ticket-admit"
  );
  const ticketStart = unwrapStartPayload(
    runCommand({
      label: "ticket-start-terminal-gap",
      command: input.installedCommand,
      args: [
        "start",
        "--workspace",
        ".",
        "--target",
        parentTicketRef,
        "--until",
        "blocked",
        "--worker",
        WORKER_TRANSPORT
      ],
      cwd: input.workspace,
      env: input.env,
      archiveRoot: input.archiveRoot,
      acceptedStatuses: Object.freeze([0, 4])
    }),
    "ticket-start-terminal-gap"
  );
  return Object.freeze({
    kind: "data_mapper_terminal_gap_ticket_workflow",
    sourceStopKind: intake.sourceStopKind ?? null,
    operatorRunRoot,
    parentTicketRef,
    createdTicketRefs: intake.createdTicketRefs ?? [],
    residualFindingRefs: intake.residualFindingRefs ?? [],
    ticketIntake: intake,
    admittedTicketExecutionContractRef: admitted.executionContractRef ?? null,
    ticketStart: compactStartForSummary(ticketStart)
  });
}

function writeTerminalGapTicketWorkflowExerciseOperatorRun(input) {
  const runRoot = path.join(
    input.workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs/t162-terminal-gap-ticket-workflow-live"
  );
  rmSync(runRoot, { recursive: true, force: true });
  mkdirSync(runRoot, { recursive: true });
  const reviewGradeRef =
    "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/t162-terminal-gap-ticket-workflow-live/review_grade_edge_fulfillment_assessment.json";
  const stdoutRef =
    "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/t162-terminal-gap-ticket-workflow-live/review_grade_edge_fulfillment_stdout.log";
  writeJson(path.join(runRoot, "operator_summary.json"), {
    kind: "sdlc_operator_summary",
    currentEdge: "derive_component_code_surface",
    status: "blocked",
    blockingReason:
      "evaluation_set_incomplete blocked:evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp:review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
    blockingReasons: [
      {
        kind: "sdlc_blocking_reason",
        code: "review_grade_assessment_invalid",
        reasonClass: "assurance",
        lawfulReentryPoint: "triage_gap",
        detail:
          "review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
        evidenceRefs: [reviewGradeRef, stdoutRef]
      }
    ]
  });
  writeJson(path.join(runRoot, "sdlc_edge_closure_decision.json"), {
    kind: "sdlc_edge_closure_decision",
    disposition: "block"
  });
  writeJson(path.join(runRoot, "worker_result_report.json"), {
    kind: "sdlc_worker_result_report",
    edgeName: "derive_component_code_surface",
    status: "completed",
    outputAssetRefs: [
      "workspace://build_tenants/scala_spark/design/component_code_surface.md"
    ]
  });
  writeJson(path.join(runRoot, "review_grade_edge_fulfillment_assessment.json"), {
    kind: "sdlc_review_grade_edge_fulfillment_assessment",
    edgeName: "derive_component_code_surface",
    status: "blocked",
    findings: [
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId:
          "requirement:data_mapper.ai_workspace_context_project_bootstrap.req_ldm_004_a",
        fulfillmentStatus: "blocked",
        failureClass: "trace_missing",
        requiredAction:
          "Repair component code lineage through builder workflow evidence instead of manual sandbox product edits.",
        evidenceRefs: [
          "workspace://.ai-workspace/context/project_bootstrap.md",
          "workspace://build_tenants/scala_spark/design/component_code_surface.md",
          "workspace://.ai-workspace/runtime/odd_sdlc/operator-runs/t162-terminal-gap-ticket-workflow-live/worker_result_report.json"
        ]
      },
      {
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: "requirement:data_mapper.requirements.req_int_006",
        fulfillmentStatus: "blocked",
        failureClass: "semantic_not_realized",
        requiredAction:
          "Create a governed product-gap ticket for versioned lookup lineage instead of patching the generated mapper directly.",
        evidenceRefs: [
          "workspace://specification/REQUIREMENTS.md",
          "workspace://build_tenants/scala_spark/design/component_code_surface.md"
        ]
      }
    ]
  });
  writeFileSync(
    path.join(runRoot, "review_grade_edge_fulfillment_stdout.log"),
    [
      "review grade blocked",
      "review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
      "lawfulReentryPoint=triage_gap"
    ].join("\n"),
    "utf8"
  );
  return Object.freeze({
    runRoot,
    start: Object.freeze({
      kind: "sdlc_installed_operator_start_cli_projection",
      status: "blocked",
      archiveRoot: runRoot,
      summary: Object.freeze({
        status: "blocked",
        archiveRoot: runRoot,
        currentEdge: "derive_component_code_surface",
        blockingReason:
          "evaluation_set_incomplete blocked:evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp:review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
        blockingReasons: Object.freeze([
          Object.freeze({
            kind: "sdlc_blocking_reason",
            code: "review_grade_assessment_invalid",
            reasonClass: "assurance",
            lawfulReentryPoint: "triage_gap",
            detail:
              "review_grade_fulfillment_binding_requirement_mismatch:module:cdme-accounting",
            evidenceRefs: Object.freeze([reviewGradeRef, stdoutRef])
          })
        ])
      })
    })
  });
}

function runTerminalGapTicketWorkflowExercise(input) {
  if (!DATA_MAPPER_EXERCISE_TERMINAL_GAP_TICKETS) {
    return null;
  }
  const exercise = writeTerminalGapTicketWorkflowExerciseOperatorRun({
    workspace: input.workspace
  });
  const workflow = maybeRunTerminalGapTicketWorkflow({
    start: exercise.start,
    installedCommand: input.installedCommand,
    workspace: input.workspace,
    env: input.env,
    archiveRoot: input.archiveRoot
  });
  if (workflow === null) {
    throw new Error("terminal gap ticket workflow exercise did not run");
  }
  if (workflow.sourceStopKind !== "review_grade_triage_gap") {
    throw new Error(
      `terminal gap exercise used wrong source stop kind: ${workflow.sourceStopKind}`
    );
  }
  if (workflow.createdTicketRefs.length < 2) {
    throw new Error(
      `terminal gap exercise did not create parent/split tickets: ${JSON.stringify(workflow, null, 2)}`
    );
  }
  if (workflow.ticketStart.graphFunctionName !== "route_ticket_work_item") {
    throw new Error(
      `terminal gap ticket did not re-enter through route_ticket_work_item: ${JSON.stringify(workflow.ticketStart, null, 2)}`
    );
  }
  return Object.freeze({
    kind: "data_mapper_terminal_gap_ticket_workflow_exercise",
    exerciseOperatorRunRoot: exercise.runRoot,
    workflow
  });
}

function isSuccessfulSdlcTraversalStart(start) {
  const status = start?.status ?? start?.summary?.status ?? null;
  return (
    status === "converged" ||
    (status === "worker_invoked" &&
      start?.summary?.admittedSemantic?.closureDisposition === "close")
  );
}

function sdlcOverlayStartLoop(input) {
  if (!Number.isInteger(DATA_MAPPER_MAX_ADVANCES) || DATA_MAPPER_MAX_ADVANCES < 1) {
    throw new TypeError("ODD_SDLC_TS_DATA_MAPPER_MAX_ADVANCES must be a positive integer");
  }
  if (
    !Number.isInteger(DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW) ||
    DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW < 1
  ) {
    throw new TypeError(
      "ODD_SDLC_TS_DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW must be a positive integer"
    );
  }
  const starts = [];
  let terminalStart = null;
  let terminalReason = "sdlc_overlay_max_advances_reached";
  let lastTraversalProgressKey = null;
  let sameTraversalProgressKeyAfterClose = 0;
  let currentStartTarget = input.startTarget;
  for (let step = 0; step < DATA_MAPPER_MAX_ADVANCES; step += 1) {
    const label = `odd-sdlc-start-first-traversal-${String(step + 1).padStart(3, "0")}`;
    const start = unwrapStartPayload(runCommand({
      label,
      command: input.installedCommand,
      args: sdlcStartArgs(currentStartTarget),
      cwd: input.workspace,
      env: input.env,
      archiveRoot: input.archiveRoot,
      acceptedStatuses: Object.freeze([0, 4])
    }), label);
    starts.push(compactStartForSummary(start));
    input.summary.steps.push(summaryStepFromStart(`sdlc-overlay-start-${step + 1}`, start));
    input.summary.sdlcOverlayStarts = starts;
    input.summary.observedDetailZoomEdges = observedDetailZoomEdges(input.workspace);
    writeJson(path.join(input.archiveRoot, "run_summary.json"), input.summary);
    terminalStart = start;

    const retryContinuation = shouldContinueSameEdgeRetry(start);
    const nextStartTarget = retryContinuation
      ? null
      : nextGraphFunctionStartTargetFromStart(start, currentStartTarget);

    if (detailZoomStopSatisfied(input.workspace)) {
      terminalReason = "sdlc_reported_detail_zoom_edges";
      break;
    }

    if (
      !isSuccessfulSdlcTraversalStart(start) &&
      !retryContinuation &&
      nextStartTarget === null
    ) {
      terminalReason = terminalReasonFromStart(start);
      break;
    }

    if (releaseProofStopSatisfied(input.workspace)) {
      terminalReason = "sdlc_release_proof_converged";
      break;
    }

    const graphFunctionName =
      start?.summary?.graphFunctionName ??
      start?.start?.executionContract?.targetGraphFunction ??
      null;
    const traversalProgressKey = [
      graphFunctionName,
      start?.summary?.currentEdge ?? start?.edge ?? null,
      start?.summary?.nextLawfulAction ?? null
    ]
      .filter((value) => typeof value === "string" && value.length > 0)
      .join(":");
    if (
      traversalProgressKey.length > 0 &&
      traversalProgressKey === lastTraversalProgressKey
    ) {
      sameTraversalProgressKeyAfterClose += 1;
      if (
        sameTraversalProgressKeyAfterClose >=
        DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW
      ) {
        terminalReason = `sdlc_retry_yield_window_exhausted:${traversalProgressKey}`;
        break;
      }
    } else {
      sameTraversalProgressKeyAfterClose = 0;
    }
    lastTraversalProgressKey = traversalProgressKey;

    if (retryContinuation) {
      continue;
    }

    if (nextStartTarget !== null) {
      currentStartTarget = nextStartTarget;
    } else if (isSuccessfulSdlcTraversalStart(start)) {
      terminalReason = "sdlc_overlay_next_action_missing";
      break;
    }
  }
  if (terminalStart === null) {
    throw new Error("overlay start loop produced no starts");
  }
  if (terminalReason === "sdlc_overlay_max_advances_reached") {
    throw new Error(
      `overlay start loop exhausted ${DATA_MAPPER_MAX_ADVANCES} advances before terminal or detail zoom stop`
    );
  }
  return Object.freeze({
    start: terminalStart,
    starts,
    terminalReason
  });
}

function main() {
  const testRunRoot = resolve(
    process.env["ODD_SDLC_TS_TEST_RUN_ROOT"] ?? DEFAULT_TEST_RUN_ROOT
  );
  const archiveRoot = path.join(testRunRoot, LANE_NAME, `${archiveTimestamp()}_pid${process.pid}`);
  mkdirSync(archiveRoot, { recursive: true });
  const workspace = freshWorkspace(archiveRoot);
  const packageSource = packageSourceForRun(archiveRoot);
  const sourceCli = path.join(PACKAGE_ROOT, "build/semantic/code/src/cli/main.js");
  assertExists(sourceCli, "built source odd-sdlc-ts CLI");
  const toolCache = sandboxToolCache({ archiveRoot, workspace });

  const baseEnv = {
    ...process.env,
    ...dataMapperWorkerRuntimeEnv(),
    ...toolCache.env,
    ODD_SDLC_TS_OUTPUT: "json",
    ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal",
    ABG_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal",
    ODD_SDLC_TS_WORKER_TRANSPORT: WORKER_TRANSPORT,
    ODD_SDLC_TS_DATA_MAPPER_WORKER: WORKER_TRANSPORT
  };
  const summary = {
    kind: "odd_sdlc_full_external_data_mapper_sandbox_run",
    commandBinding: isOverlayStartTarget(START_TARGET) ||
      runtimeTraversalSelectionEnabled()
      ? "odd_sdlc_cli_overlay_start_first_traversal"
      : "abg_cli_start_until_converged",
    archiveRoot,
    workspace,
    templateRoot: DATA_MAPPER_TEMPLATE_ROOT,
    packageSource,
    workerTransport: WORKER_TRANSPORT,
    workerRuntimeEnv: dataMapperWorkerRuntimeEnv(),
    sandboxToolCache: {
      toolCacheRoot: toolCache.toolCacheRoot,
      archiveToolCacheRoot: toolCache.archiveToolCacheRoot,
      sbtBootDirectory: toolCache.sbtBootDirectory,
      sbtGlobalBase: toolCache.sbtGlobalBase,
      sbtIvyHome: toolCache.sbtIvyHome,
      coursierCache: toolCache.coursierCache,
      seededCacheRefs: toolCache.seededCacheRefs
    },
    startTarget: START_TARGET,
    targetGraphFunction: TARGET_GRAPH_FUNCTION,
    maxAdvances: DATA_MAPPER_MAX_ADVANCES,
    retryYieldAttemptWindow: DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW,
    stopAfterDetailZoomEdges: DATA_MAPPER_STOP_AFTER_DETAIL_ZOOM,
    exerciseTerminalGapTickets: DATA_MAPPER_EXERCISE_TERMINAL_GAP_TICKETS,
    requiredDetailZoomEdges: DATA_MAPPER_DETAIL_ZOOM_EDGES,
    steps: []
  };
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);

  const installPayload = specPayload(
    runCommand({
      label: "install",
      command: process.execPath,
      args: [
        sourceCli,
        "install",
        "--target",
        ".",
        "--package-source",
        packageSource.packageSourceRoot,
        "--abg-package-source",
        ABG_TYPESCRIPT_ROOT,
        "--installed-package-name",
        "odd-sdlc-full-external-data-mapper-sandbox"
      ],
      cwd: workspace,
      env: baseEnv,
      archiveRoot
    }),
    "install"
  );
  const installedCommand = installedCommandFromInstallPayload(installPayload, workspace);
  assertExists(installedCommand, "installed odd-sdlc-ts command");
  const installManifest =
    installPayload.manifest ??
    (typeof installPayload.installManifestPath === "string"
      ? readJsonFile(installPayload.installManifestPath)
      : null);
  const abgRuntimeBindingPath = installManifest?.abgRuntimeBindingPath ?? null;
  const genesisCommand = installedAbgCommandFromInstallPayload(
    installPayload,
    workspace,
    "genesis-ts"
  );
  assertExists(genesisCommand, "installed genesis-ts command");
  assertExists(abgRuntimeBindingPath, "installed ABG runtime binding");
  summary.installedCommand = installedCommand;
  summary.abgCommand = genesisCommand;
  summary.installManifestPath = installPayload.installManifestPath ?? null;
  summary.abgRuntimeBindingPath = abgRuntimeBindingPath;
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);

  const conformStart = runCommand({
    label: "abg-conform-project-until-converged",
    command: genesisCommand,
    args: abgStartArgs(`graph_function:${FG_CONFORM_PROJECT}`),
    cwd: workspace,
    env: baseEnv,
    archiveRoot
  });
  summary.steps.push(summaryStepFromStart("abg-conform-project", conformStart));
  summary.abgConformProject = conformStart;
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);

  const startResult = isOverlayStartTarget(START_TARGET) ||
    runtimeTraversalSelectionEnabled()
    ? sdlcOverlayStartLoop({
        startTarget: START_TARGET,
        installedCommand,
        genesisCommand,
        workspace,
        env: baseEnv,
        archiveRoot,
        summary
      })
    : Object.freeze({
        start: unwrapStartPayload(runCommand({
          label: startLabelForTarget(START_TARGET),
          command: startCommandForTarget({ startTarget: START_TARGET, genesisCommand, installedCommand }),
          args: startArgsForTarget(START_TARGET),
          cwd: workspace,
          env: baseEnv,
          archiveRoot,
          acceptedStatuses: Object.freeze([0, 4])
        }), startLabelForTarget(START_TARGET)),
        starts: Object.freeze([]),
        terminalReason: null
      });
  const start = startResult.start;
  summary.steps.push(summaryStepFromStart("abg-start", start));
  summary.abgStart = compactStartForSummary(start);
  summary.resolvedStartGraphFunction =
    graphFunctionFromStartTarget(START_TARGET) ?? start.resolved_target ?? null;
  summary.productMaterializationPackages = findProductMaterializationPackages(workspace);
  summary.observedDetailZoomEdges = observedDetailZoomEdges(workspace);
  summary.releaseProofConverged = releaseProofStopSatisfied(workspace);
  summary.terminalReason = startResult.terminalReason ?? terminalReasonFromStart(start);
  summary.terminalGapTicketWorkflow = maybeRunTerminalGapTicketWorkflow({
    start,
    installedCommand,
    workspace,
    env: baseEnv,
    archiveRoot
  });
  summary.retryExhaustionTicketWorkflow =
    summary.terminalGapTicketWorkflow?.sourceStopKind === "retry_exhaustion"
      ? summary.terminalGapTicketWorkflow
      : null;
  summary.terminalGapTicketWorkflowExercise = runTerminalGapTicketWorkflowExercise({
    installedCommand,
    workspace,
    env: baseEnv,
    archiveRoot
  });
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
