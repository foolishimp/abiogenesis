import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "../..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

const RUNTIME_SOURCE_ROOTS = [
  "code/src/admission",
  "code/src/authority",
  "code/src/contracts",
  "code/src/effects",
  "code/src/graph",
  "code/src/hooks",
  "code/src/operational",
  "code/src/operator",
  "code/src/postflight",
  "code/src/projection",
  "code/src/runtime",
  "code/src/shared",
  "code/src/start",
  "code/src/triage",
  "code/src/workspace"
];

const FORBIDDEN_DOWNSTREAM_STACK_PATTERNS = [
  { label: "sbt token", pattern: /\bsbt\b/iu },
  { label: "Scala token", pattern: /\bscala\b/iu },
  { label: "Spark token", pattern: /\bspark\b/iu },
  { label: "Monoid compile repair", pattern: /\bMonoid\s*\(/u },
  { label: "pytest default", pattern: /\bpytest\b/u },
  { label: "Python build default", pattern: /\bpython\s+-m\s+build\b/u },
  { label: "Cargo lock byproduct", pattern: /\bCargo\.lock\b/u },
  { label: "SBT build marker", pattern: /\bbuild\.sbt\b/u },
  { label: "Python build marker", pattern: /\bpyproject\.toml\b/u },
  { label: "Python setup marker", pattern: /\bsetup\.py\b/u },
  { label: "Cargo build marker", pattern: /\bCargo\.toml\b/u },
  { label: "Go module marker", pattern: /\bgo\.mod\b/u },
  { label: "Maven build marker", pattern: /\bpom\.xml\b/u },
  { label: "hard-coded target byproduct glob", pattern: /target\/\*\*/u },
  { label: "hard-coded BSP byproduct glob", pattern: /\.bsp\/\*\*/u }
];

function sourceFilesUnder(relativeRoot) {
  const root = path.join(PACKAGE_ROOT, relativeRoot);
  if (!existsSync(root)) {
    return [];
  }
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(absolutePath);
      }
    }
  };
  visit(root);
  return files;
}

function relativePackagePath(absolutePath) {
  return path.relative(PACKAGE_ROOT, absolutePath).split(path.sep).join("/");
}

function firstViolation(filePath, content) {
  for (const { label, pattern } of FORBIDDEN_DOWNSTREAM_STACK_PATTERNS) {
    const match = pattern.exec(content);
    if (match !== null && match.index !== undefined) {
      const lineNumber = content.slice(0, match.index).split("\n").length;
      const line = content.split("\n")[lineNumber - 1]?.trim() ?? "";
      return {
        file: relativePackagePath(filePath),
        label,
        lineNumber,
        line
      };
    }
  }
  return null;
}

test("T-188 SDLC runtime source does not admit downstream tenant stack tokens", () => {
  const violations = RUNTIME_SOURCE_ROOTS.flatMap(sourceFilesUnder)
    .map((filePath) => firstViolation(filePath, readFileSync(filePath, "utf8")))
    .filter((violation) => violation !== null);

  assert.deepStrictEqual(
    violations,
    [],
    violations
      .map(
        (violation) =>
          `${violation.file}:${violation.lineNumber} ${violation.label}: ${violation.line}`
      )
      .join("\n")
  );
});

test("T-188 data_mapper live scripts run the boundary guard before live execution", () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8")
  );
  const guardedScripts = [
    "test:t109:data-mapper-live",
    "test:t115:data-mapper-repair-live",
    "test:t164:data-mapper-full-capability-live",
    "test:t164:data-mapper-full-capability-live:resume",
    "test:t171:data-mapper-lifecycle-live",
    "test:t188:data-mapper-lite-lifecycle-live",
    "test:t199:data-mapper-code-depth-resume-live",
    "live:data-mapper-sandbox"
  ];
  assert.equal(
    packageJson.scripts["guard:data-mapper-boundary"],
    "node --test test_env/tests/test_t188_data_mapper_live_boundary_guard.test.mjs"
  );
  for (const scriptName of guardedScripts) {
    assert.match(
      packageJson.scripts[scriptName],
      /guard:data-mapper-boundary/u,
      `${scriptName} must run guard:data-mapper-boundary before live execution`
    );
  }
});

test("T-188 data_mapper live harness worker binding comes from runtime policy", () => {
  const runtimePolicy = JSON.parse(
    readFileSync(path.join(PACKAGE_ROOT, "config/operator-runtime-policy.json"), "utf8")
  );
  assert.equal(
    runtimePolicy.liveHarness.dataMapperWorkerTransport,
    "process://claude?model=claude-sonnet-4-6&effort=max"
  );

  const runnerSource = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_full_external_data_mapper_sandbox.mjs"),
    "utf8"
  );
  assert.match(
    runnerSource,
    /const WORKER_TRANSPORT =\s+cliStringFlag\("--worker"\) \?\? RUNTIME_POLICY\.liveHarnessDataMapperWorkerTransport/u
  );
  assert.match(runnerSource, /cliStringFlag\("--worker"\)/u);
  assert.doesNotMatch(
    runnerSource,
    /process:\/\/codex(?:[?#/]|$)/u
  );
  assert.match(
    runnerSource,
    /ODD_SDLC_TS_DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS/u
  );
  assert.match(runnerSource, /ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS/u);
  assert.match(runnerSource, /ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS/u);

  for (const relativePath of [
    "test_env/live/run_full_external_data_mapper_sandbox.mjs",
    "test_env/live/test_t109_live_installed_data_mapper_pty.test.mjs",
    "test_env/live/test_t164_data_mapper_full_capability_live.test.mjs",
    "test_env/live/resume_t164_data_mapper_full_capability_live.mjs",
    "test_env/live/run_t199_data_mapper_code_depth_resume.mjs"
  ]) {
    const source = readFileSync(path.join(PACKAGE_ROOT, relativePath), "utf8");
    assert.match(
      source,
      /RUNTIME_POLICY\.liveHarnessDataMapperWorkerTransport/u,
      `${relativePath} must consume the configured data_mapper worker transport`
    );
    if (
      relativePath === "test_env/live/run_full_external_data_mapper_sandbox.mjs" ||
      relativePath === "test_env/live/run_t199_data_mapper_code_depth_resume.mjs"
    ) {
      assert.match(
        source,
        /cliStringFlag\("--worker"\)/u,
        `${relativePath} must expose CLI worker transport override`
      );
    }
    assert.doesNotMatch(
      source,
      /process:\/\/codex(?:[?#/]|$)/u,
      `${relativePath} must not carry a hard-coded Codex data_mapper worker fallback`
    );
  }
  const resumeSource = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_t199_data_mapper_code_depth_resume.mjs"),
    "utf8"
  );
  assert.match(
    resumeSource,
    /ODD_SDLC_TS_DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS/u
  );
  assert.match(resumeSource, /ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS/u);
  assert.match(resumeSource, /ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS/u);
});

test("T-203 data_mapper detail live harness consumes admitted next actions and UAT detail edge", () => {
  const runnerSource = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_full_external_data_mapper_sandbox.mjs"),
    "utf8"
  );
  assert.match(runnerSource, /function nextGraphFunctionStartTargetFromStart/u);
  assert.match(runnerSource, /function runtimeTraversalSelectionEnabled/u);
  assert.match(runnerSource, /function startClosureDisposition/u);
  assert.match(runnerSource, /function isSameEdgeRetryStart/u);
  assert.match(runnerSource, /function shouldContinueSameEdgeRetry/u);
  assert.match(
    runnerSource,
    /function graphFunctionStartTargetFromPostCloseOverlayActionRef/u
  );
  assert.match(runnerSource, /const marker = "\/post_close_overlay_continuation\/"/u);
  assert.match(runnerSource, /startNextLawfulAction\(start\)/u);
  assert.match(runnerSource, /nextActionProjection\.nextGraphFunctionRef/u);
  assert.match(runnerSource, /nextGraphFunctionStartTargetFromStart\(\s*start,\s*currentStartTarget\s*\)/u);
  assert.match(runnerSource, /overlayStopDisposition === "overlay_segment_complete"/u);
  assert.match(runnerSource, /post_close_next_eligible_overlay/u);
  assert.match(runnerSource, /post_close_overlay_continuation/u);
  assert.match(runnerSource, /nextActionProjection\.nextEligibleOverlayRefs/u);
  assert.match(
    runnerSource,
    /return `graph_function:\$\{nextGraphFunctionRef\}`/u
  );
  assert.match(
    runnerSource,
    /return `graph_function:\$\{nextGraphFunctionRef\}`;/
  );
  assert.match(
    runnerSource,
    /selectedPostCloseOverlayStartTarget \?\? `graph_function:\$\{nextGraphFunctionRef\}`/u
  );
  assert.match(runnerSource, /return currentStartTarget;/u);
  assert.match(runnerSource, /currentStartTarget = nextStartTarget/u);
  assert.match(runnerSource, /command: input\.installedCommand/u);
  assert.match(runnerSource, /args: sdlcStartArgs\(currentStartTarget\)/u);
  assert.match(
    runnerSource,
    /isOverlayStartTarget\(START_TARGET\) \|\|\s*runtimeTraversalSelectionEnabled\(\)/u
  );
  assert.match(
    runnerSource,
    /isOverlayStartTarget\(input\.startTarget\) \|\|\s*runtimeTraversalSelectionEnabled\(\)/u
  );
  assert.match(runnerSource, /blockingReason === "retry_budget_exhausted"/u);
  assert.match(runnerSource, /return closureDisposition === "retry";/u);
  assert.match(runnerSource, /reason\?\.lawfulReentryPoint === "same_edge_retry"/u);
  assert.match(runnerSource, /DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW/u);
  assert.match(runnerSource, /const retryContinuation = shouldContinueSameEdgeRetry\(start\);/u);
  assert.match(runnerSource, /const requiredTicketIntakeFiles = \[/u);
  assert.match(runnerSource, /"review_grade_edge_fulfillment_assessment\.json"/u);
  assert.match(
    runnerSource,
    /requiredTicketIntakeFiles\.some\([\s\S]*return null;[\s\S]*ticket-intake-terminal-gap/u
  );
  assert.match(
    runnerSource,
    /const nextStartTarget = retryContinuation\s*\?\s*null\s*:\s*nextGraphFunctionStartTargetFromStart/su
  );
  assert.match(runnerSource, /if \(retryContinuation\) \{\s*continue;\s*\}/u);
  assert.match(runnerSource, /sdlc_overlay_next_action_missing/u);
  assert.match(runnerSource, /derive_uat_test_source_surface/u);
  assert.doesNotMatch(
    runnerSource,
    /code === "review_grade_edge_fulfillment_blocked"/u
  );
  assert.doesNotMatch(
    runnerSource,
    /args: sdlcStartArgs\(input\.startTarget\)/u
  );
  assert.doesNotMatch(
    runnerSource,
    /command: startCommandForTarget\(\{\s*startTarget: currentStartTarget/u
  );
});

test("T-188 data_mapper release proof installs the release snapshot package", () => {
  const runnerSource = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_full_external_data_mapper_sandbox.mjs"),
    "utf8"
  );
  assert.match(
    runnerSource,
    /ODD_SDLC_TS_DATA_MAPPER_RELEASE_SNAPSHOT_ROOT/u
  );
  assert.match(
    runnerSource,
    /ODD_SDLC_TS_DATA_MAPPER_PACKAGE_SOURCE_ROOT/u
  );
  assert.match(runnerSource, /release_snapshot_package/u);
  assert.match(runnerSource, /release-package-source/u);
  assert.match(runnerSource, /function resolveRunPath/u);
  assert.match(runnerSource, /resolve\(REPO_ROOT, value\)/u);
  assert.match(runnerSource, /packageSource\.packageSourceRoot/u);
  assert.doesNotMatch(
    runnerSource,
    /"--package-source",\s*PACKAGE_ROOT/u
  );

  const runbook = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/DATA_MAPPER_LIVE_RUNBOOK.md"),
    "utf8"
  );
  assert.match(runbook, /release proof/u);
  assert.match(runbook, /ODD_SDLC_TS_DATA_MAPPER_RELEASE_SNAPSHOT_ROOT/u);
  assert.match(runbook, /packageSource\.kind =\s*release_snapshot_package/u);
});

test("T-188 data_mapper release proof completion is not reported as overlay no-progress", () => {
  const runnerSource = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_full_external_data_mapper_sandbox.mjs"),
    "utf8"
  );
  assert.match(runnerSource, /function releaseProofStopSatisfied\(workspace\)/u);
  assert.match(runnerSource, /function releaseDepthParityMet\(workspace\)/u);
  assert.match(runnerSource, /releaseDepthParity\?\.status === "met"/u);
  assert.match(runnerSource, /function releaseSurfacePresent\(workspace\)/u);
  assert.match(runnerSource, /sdlc_release_proof_converged/u);
  assert.match(runnerSource, /summary\.releaseProofConverged = releaseProofStopSatisfied\(workspace\)/u);

  const releaseStopCheck = runnerSource.indexOf("releaseProofStopSatisfied(input.workspace)");
  const noProgressCheck = runnerSource.indexOf(
    "sameTraversalProgressKeyAfterClose >=\n        DATA_MAPPER_RETRY_YIELD_ATTEMPT_WINDOW"
  );
  assert.notEqual(releaseStopCheck, -1);
  assert.notEqual(noProgressCheck, -1);
  assert.ok(
    releaseStopCheck < noProgressCheck,
    "completed release proof must be classified before generic overlay no-progress"
  );
});

test("T-188 explicit graph-function resume is not hijacked by overlay replay", () => {
  const source = readFileSync(
    path.join(PACKAGE_ROOT, "code/src/spec_method/entry.ts"),
    "utf8"
  );
  const start = source.indexOf("function selectedArchiveMatchesRequestedStart");
  const end = source.indexOf("function startOutcomeForObservedReplay");
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const body = source.slice(start, end);
  assert.match(
    body,
    /input\.request\.target\.handle === input\.selected\.graphFunctionName/u
  );
  assert.match(
    body,
    /input\.request\.target\.handle === input\.selected\.completedGraphFunctionName/u
  );
  assert.doesNotMatch(
    body,
    /selectedOverlay\.graphFunctionRefs\.includes/u
  );
  assert.doesNotMatch(
    body,
    /requestedGraphFunction/u
  );
});

test("T-188 repo-local agent instructions carry the data_mapper live-run boundary", () => {
  for (const fileName of ["AGENTS.md", "CLAUDE.md"]) {
    const content = readFileSync(path.join(REPO_ROOT, fileName), "utf8");
    assert.match(
      content,
      /the purpose of a data_mapper run is to test whether odd_sdlc can build data_mapper/u,
      `${fileName} must state the data_mapper proof purpose`
    );
    assert.match(
      content,
      /Only patch odd_sdlc when the observed defect is in SDLC framework law|only patch odd_sdlc when the observed defect is in SDLC framework law/u,
      `${fileName} must restrict framework patches to framework defects`
    );
    assert.match(
      content,
      /DATA_MAPPER_LIVE_RUNBOOK\.md/u,
      `${fileName} must point agents to the live-run runbook`
    );
  }
});

test("T-188 data_mapper live runbook declares the framework write lock", () => {
  const content = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/DATA_MAPPER_LIVE_RUNBOOK.md"),
    "utf8"
  );
  assert.match(content, /The data_mapper lane tests whether odd_sdlc can build data_mapper/u);
  assert.match(content, /F_P worksite repair pressure by default/u);
  assert.match(content, /Framework Write Lock/u);
  assert.match(content, /Do not patch odd_sdlc source merely because/u);
  assert.match(content, /resume the failed node instead of starting a new sandbox/u);
});

test("T-188 review-grade prompt forbids single-language public-boundary inspection", () => {
  const content = readFileSync(
    path.join(PACKAGE_ROOT, "code/src/operator/plugins/evaluate/prompts.ts"),
    "utf8"
  );

  assert.match(content, /tenant-declared stack authority/u);
  assert.match(content, /Do not assume a single source language/u);
  assert.match(content, /Never filter public-boundary inspection to one extension family/u);
  assert.match(content, /hard-coded sample product helper names/u);
  assert.match(content, /A review helper that only recognizes one implementation language is evaluator failure/u);
});
