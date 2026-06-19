// Validates: T-197

import test from "node:test";
import assert from "node:assert/strict";
import {
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path from "node:path";
import {
  formatGtlProgramConformanceIssues
} from "@abiogenesis/typescript-tenant";
import {
  assertCurrentSdlcGtlProgramConformance,
  admitSdlcProjectConstraints,
  constructCurrentSdlcGtlProgramConformanceInput,
  deriveSdlcInstalledOperatorStatusFromAbgTerminal,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  typecheckCurrentSdlcGtlProgram,
  typecheckSdlcGtlProgramConformanceInput
} from "../../build/semantic/code/src/index.js";

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

function repoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function repoFileFromFirstExisting(relativePaths) {
  for (const relativePath of relativePaths) {
    const absolutePath = path.join(REPO_ROOT, relativePath);
    if (statSync(absolutePath, { throwIfNoEntry: false })?.isFile() === true) {
      return readFileSync(absolutePath, "utf8");
    }
  }
  assert.fail(`none of the candidate files exist: ${relativePaths.join(", ")}`);
}

function sourceFunction(source, functionName) {
  const nameIndex = source.indexOf(`function ${functionName}`);
  assert.notEqual(nameIndex, -1, `${functionName} must exist`);
  const signatureEnd = source.indexOf("):", nameIndex);
  assert.notEqual(signatureEnd, -1, `${functionName} must have a return type`);
  const bodyStart = source.indexOf("{", signatureEnd);
  assert.notEqual(bodyStart, -1, `${functionName} must have a body`);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(nameIndex, index + 1);
      }
    }
  }
  assert.fail(`${functionName} body was not closed`);
}

function repoFilesUnder(relativePath) {
  const root = path.join(REPO_ROOT, relativePath);
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) {
        if (entry === "build" || entry === "node_modules") {
          continue;
        }
        stack.push(path.join(current, entry));
      }
      continue;
    }
    if (stat.isFile()) {
      files.push(current);
    }
  }
  return files.sort();
}

function assertConformancePassed(report) {
  assert.equal(
    report.passed,
    true,
    formatGtlProgramConformanceIssues(report.issues)
  );
  assert.equal(report.issueCount, 0);
}

function constructEventSites() {
  const sites = [];
  const callPattern = /\b(construct[A-Za-z0-9_]*Event)\s*\(/gu;
  for (const filePath of repoFilesUnder("build_tenants/typescript/code/src")) {
    if (path.extname(filePath) !== ".ts") {
      continue;
    }
    const relativePath = path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
    const source = readFileSync(filePath, "utf8");
    for (const match of source.matchAll(callPattern)) {
      const constructorName = match[1];
      if (constructorName === undefined) {
        continue;
      }
      sites.push(`${relativePath}:${constructorName}`);
    }
  }
  return sites.sort();
}

test("T-197 product gate typechecks the live SDLC graph inventory", () => {
  const input = constructCurrentSdlcGtlProgramConformanceInput();
  const report = typecheckCurrentSdlcGtlProgram();

  assertConformancePassed(report);
  assert.doesNotThrow(() => assertCurrentSdlcGtlProgramConformance());

  assert.ok(input.expectedCoverage.catalogGraphFunctionCount > 0);
  assert.ok(input.expectedCoverage.publishedGraphFunctionCount > 0);
  assert.ok(input.expectedCoverage.graphVectorCount > 0);
  assert.equal(
    input.expectedCoverage.graphVectorCount,
    input.expectedCoverage.targetCarrierContractCount
  );
  assert.equal(
    input.expectedCoverage.graphVectorCount,
    input.expectedCoverage.edgeClosureContractCount
  );
  assert.equal(input.expectedCoverage.promptAssetCount, 3);
  assert.equal(input.expectedCoverage.pluginContractCount, 6);
  assert.ok(input.expectedCoverage.overlayCount > 0);
  assert.ok(input.expectedCoverage.publicStartTargetCount > 0);
  assert.ok(input.expectedCoverage.sourceIdentitySurfaceCount > 0);
  assert.ok(input.featureCoverageManifest.rows.length >= 26);
});

test("T-197 product gate fails closed when target-carrier rows are missing", () => {
  const input = constructCurrentSdlcGtlProgramConformanceInput();
  const report = typecheckSdlcGtlProgramConformanceInput({
    ...input,
    targetCarrierContracts: Object.freeze([]),
    expectedCoverage: Object.freeze({
      ...input.expectedCoverage,
      targetCarrierContractCount: 0
    })
  });

  assert.equal(report.passed, false);
  assert.ok(report.issueCount > 0);
  assert.ok(
    report.issues.some(
      (issue) => issue.surfaceKind === "target_carrier_contract"
    )
  );
});

test("T-197 product entry points call the GTL conformance gate", () => {
  const entrySources = [
    "build_tenants/typescript/code/src/start/public_start.ts",
    "build_tenants/typescript/code/src/spec_method/entry.ts",
    "build_tenants/typescript/code/src/release/release_cut.ts",
    "build_tenants/typescript/code/src/release/release_snapshot.ts"
  ];

  for (const source of entrySources) {
    assert.match(
      repoFile(source),
      /\bassertCurrentSdlcGtlProgramConformance\b/u,
      `${source} must call the product GTL conformance gate`
    );
  }

  const packageJson = JSON.parse(
    repoFile("build_tenants/typescript/package.json")
  );
  assert.match(packageJson.scripts["build:semantic"], /\bpreflight:gtl\b/u);
  assert.match(
    packageJson.scripts["preflight:gtl"],
    /\bassertCurrentSdlcGtlProgramConformance\b/u
  );
});

test("T-197 product gate keeps installed-package source identity nonempty", () => {
  const input = constructCurrentSdlcGtlProgramConformanceInput({
    packageRoot: path.join(REPO_ROOT, "build_tenants/typescript"),
    repoRoot: path.join(REPO_ROOT, "test_env/no-source-checkout"),
    activeScanRoots: ["missing-active-source-root"]
  });
  const report = typecheckSdlcGtlProgramConformanceInput(input);

  assertConformancePassed(report);
  assert.equal(input.expectedCoverage.sourceIdentitySurfaceCount, 1);
  assert.equal(
    input.sourceIdentitySurfaces[0]?.surfaceRef,
    "package://@odd-sdlc/typescript-tenant/current"
  );
});

test("T-197 design ratifies owner partition assets before Wave 1 code", () => {
  const design = repoFile(
    "build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_STAGED_COMPUTE_BOUNDARY.md"
  );

  for (const required of [
    "## T-197 Owner Partition And Decommission Register",
    "### T-197 IACS",
    "### Structural Carrier Diagram",
    "classDiagram",
    "<<prime>>",
    "<<authoritative>>",
    "<<downstream>>",
    "<<subordinate>>",
    "<<effect-edge>>",
    "<<deferred>>",
    "### Reference-To-Target Derivation",
    "### Decommission Register",
    "### W-105 Construct-Site Sufficiency Inventory",
    "ABG route / dependency",
    "ABI 4.1.0-rc.2",
    "runtime continuation transition projection refs",
    "22/22 edge-contract tests and 1/1 Rust-service sandbox proof",
    "must-not-name-governed-target",
    "Horizontal ingress rule:"
  ]) {
    assert.match(design, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  }

  for (const rowId of [
    "A1", "A2", "A3", "A4", "A5",
    "B1", "B2", "B3", "B4a", "B4b",
    "C1a", "C1b", "C2", "C3",
    "D1", "D2", "D3", "D4", "D5", "D6",
    "H1", "H2", "H3", "H4", "H5", "H6",
    "H7", "H8", "H9", "H10", "H11", "H12",
    "E1", "E2", "E3", "E4", "E5", "E6",
    "P1", "P2", "P3"
  ]) {
    assert.match(design, new RegExp(`\\| ${rowId} \\|`, "u"));
  }

  const ticket = repoFile(
    ".ai-workspace/tickets/completed/T-197-reconcile-product-boundary-and-remove-authority-leakage.md"
  );
  assert.match(ticket, /\| W-105 \| Wave 1 pre-realization gate \|/u);
  assert.match(ticket, /\| W-115 \| A2 command\/control hard break \|/u);
  assert.match(ticket, /\| W-116 \| Retire or rehome legacy local re-entry helper \|/u);
  assert.match(ticket, /ABG T-154 filed and completed for explicit resume cursor/u);
  assert.match(ticket, /npm run test:t164` passed 22\/22 edge-contract \+ 1\/1 Rust-service sandbox/u);
});

test("T-197 W-105 classifies every source runtime event constructor site", () => {
  assert.deepEqual(constructEventSites(), [
    "build_tenants/typescript/code/src/qualification/enterprise_core_iteration_sandbox.ts:constructRetryProgressRecordedEvent",
    "build_tenants/typescript/code/src/qualification/enterprise_core_iteration_sandbox.ts:constructVectorClosedEvent",
    "build_tenants/typescript/code/src/qualification/enterprise_core_iteration_sandbox.ts:constructVectorEvaluatedEvent",
    "build_tenants/typescript/code/src/qualification/enterprise_core_iteration_sandbox.ts:constructVectorEvaluatedEvent"
  ]);
});

test("T-197 H1 keeps target-specific requirements filenames out of framework law", () => {
  const forbiddenPath = "specification/mapper_requirements.md";
  const sourceHits = repoFilesUnder("build_tenants/typescript/code/src")
    .filter((filePath) => path.extname(filePath) === ".ts")
    .filter((filePath) => readFileSync(filePath, "utf8").includes(forbiddenPath))
    .map((filePath) => path.relative(REPO_ROOT, filePath).split(path.sep).join("/"));

  assert.deepEqual(sourceHits, []);

  const sourceInput = deriveSdlcSourceInput({
    uri: "file:///workspace/specification/mapper_requirements.md",
    relativePath: forbiddenPath,
    content: "# Target-specific requirements filename\nREQ-X Target-local truth."
  });
  assert.equal(sourceInput.detectedRole, "unstructured");

  const genericRequirement = deriveSdlcSourceInput({
    uri: "file:///workspace/specification/requirements/01-domain.md",
    relativePath: "specification/requirements/01-domain.md",
    content: "# Requirements\nREQ-X Generic requirement truth."
  });
  assert.equal(genericRequirement.detectedRole, "requirement_surface");

  const importedSources = deriveSdlcSourceInput({
    uri: "file:///workspace/specification/requirements/00-imported-sources.md",
    relativePath: "specification/requirements/00-imported-sources.md",
    content: [
      "# Imported Sources",
      "",
      "- `workspace://specification/mapper_requirements.md`"
    ].join("\n")
  });
  const importedRequirement = deriveSdlcSourceInput({
    uri: "file:///workspace/specification/mapper_requirements.md",
    relativePath: forbiddenPath,
    content: "# Target-specific requirements filename\nREQ-X Target-local truth."
  });
  const report = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace",
    projectConstraints: admitSdlcProjectConstraints({
      kind: "sdlc_project_constraints",
      projectSlug: "target_specific_fixture",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: []
    }),
    sourceInputs: [importedSources, importedRequirement]
  });
  assert.equal(importedRequirement.detectedRole, "unstructured");
  assert(
    report.importedRequirementAuthorities.some(
      (authority) => authority.requirementId === "REQ-X"
    )
  );
});

test("T-197 W-110 keeps traversal selection as projection, not SDLC-authored F_D runtime truth", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );

  assert.match(source, /sdlc_traversal_hop_selection\.json/u);
  assert.match(source, /sdlc_frontdoor_traversal_hop_selection\.json/u);
  assert.doesNotMatch(source, /\bconstructFdAuthorityOutcomeAdmittedEvent\b/u);
  assert.doesNotMatch(source, /odd-sdlc-frontdoor-traversal-hop-selection/u);
  assert.doesNotMatch(source, /emitted\.push\(frontDoorTraversalAuditEvent\)/u);
  assert.doesNotMatch(source, /input\.eventSink\(traversalAuditEvent\)/u);
});

test("T-197 W-110 routes conform-project F_D advance through ABG runner ownership", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const conformVectorGuard = sourceFunction(
    source,
    "isConformProjectGraphVectorEdge"
  );

  assert.match(source, /\bappendFdConformanceRuntimeEvents\b/u);
  assert.match(source, /\brunEngineIterateAsync\b/u);
  assert.match(source, /\bconstructFdEvaluationOutcome\b/u);
  assert.match(source, /\bdefaultFdEvaluatorPlugin\.contract\b/u);
  assert.match(source, /until:\s*"first_traversal"/u);
  assert.match(source, /\bisConformProjectGraphVectorEdge\(pluginInput\.edge\)/u);
  assert.match(conformVectorGuard, /\bCONFORM_PROJECT_OUTPUTS\.some\b/u);
  assert.match(conformVectorGuard, /`\$\{FG_CONFORM_PROJECT\}__\$\{targetAssetType\}`/u);
  assert.doesNotMatch(
    source,
    /pluginInput\.edge === FG_CONFORM_PROJECT && pluginInput\.regime === "F_D"/u
  );
  assert.doesNotMatch(source, /\bruntimeEventsForIterationDecision\b/u);
});

test("T-197 W-110 consumes ABI runtime authorship routes for cursor and graph-span reentry", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );

  assert.match(source, /\bapplyExplicitGraphVectorResumeCursor\b/u);
  assert.match(source, /\bapplyGraphSpanReentryRoute\b/u);
  assert.match(source, /reason:\s*"odd_sdlc_post_close_graph_continuation_cursor"/u);
  assert.doesNotMatch(source, /\bconstructVectorTraversalPlannedEvent\b/u);
  assert.doesNotMatch(source, /\bconstructVectorEvaluatedEvent\b/u);
  assert.doesNotMatch(source, /\bconstructVectorClosedEvent\b/u);
  assert.doesNotMatch(source, /\bconstructGraphSpanEvaluationScheduledEvent\b/u);
  assert.doesNotMatch(source, /\bconstructGraphSpanAssessedEvent\b/u);
  assert.doesNotMatch(source, /\bconstructGraphSpanFoldbackEvaluatedEvent\b/u);
  assert.doesNotMatch(source, /\bconstructGraphReentryPlannedEvent\b/u);
  assert.doesNotMatch(source, /\bconstructGraphReentryAppliedEvent\b/u);
});

test("T-197 A3 ratifies live parallel materialization as thin ABG frontier caller", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const frontierCarrier = repoFile(
    "build_tenants/typescript/code/src/operator/live_fp_parallel_materialization_frontier.ts"
  );

  assert.match(source, /\bcompileSdlcFeatureDependencyDagToAbgFrontier\b/u);
  assert.match(source, /\brunEventedNativeSagaFrontier\b/u);
  assert.match(source, /\bconstructBranchExecutionPolicy\b/u);
  assert.match(source, /executionAuthority:\s*"abg_evented_saga_frontier"/u);
  assert.match(source, /parallelismControl:\s*"abg_branch_execution_policy"/u);
  assert.doesNotMatch(source, /\brunNativeSagaFrontier\b/u);
  assert.match(
    frontierCarrier,
    /executionAuthority:\s*oneOf\(\["abg_evented_saga_frontier"\] as const\)/u
  );
  assert.match(
    frontierCarrier,
    /parallelismControl:\s*oneOf\(\["abg_branch_execution_policy"\] as const\)/u
  );
});

test("T-197 A5 gates installed convergence on ABG terminal convergence", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const traversalConsequenceSource = repoFile(
    "build_tenants/typescript/code/src/operator/traversal_consequence.ts"
  );
  const transitionRefBody = sourceFunction(
    source,
    "abgTraversalTransitionProjectionRef"
  );

  assert.equal(
    deriveSdlcInstalledOperatorStatusFromAbgTerminal({
      stateStatus: "worker_invoked",
      closureDisposition: "close",
      terminalKind: "gap_stop"
    }),
    "blocked"
  );
  assert.equal(
    deriveSdlcInstalledOperatorStatusFromAbgTerminal({
      stateStatus: "worker_invoked",
      closureDisposition: "close",
      terminalKind: "converged"
    }),
    "converged"
  );
  assert.equal(
    deriveSdlcInstalledOperatorStatusFromAbgTerminal({
      stateStatus: "worker_invoked",
      closureDisposition: "retry",
      terminalKind: "converged"
    }),
    "worker_invoked"
  );
  assert.equal(
    deriveSdlcInstalledOperatorStatusFromAbgTerminal({
      stateStatus: "worker_invoked",
      closureDisposition: "close",
      terminalKind: null
    }),
    "worker_invoked"
  );

  assert.match(
    source,
    /\bfunction abgTerminalAllowsInstalledConvergence\b/u
  );
  assert.match(
    source,
    /input\.terminalKind === "converged"/u
  );
  assert.match(
    source,
    /input\.terminalKind === "gap_stop"[\s\S]*?return "blocked";/u
  );
  assert.match(
    source,
    /\bderiveRuntimeContinuationTransitionProjectionFromDisposition\b/u
  );
  assert.match(
    source,
    /\bfunction abgTraversalTransitionProjectionRef\b/u
  );
  assert.match(source, /\bruntimeEventsForBasis\b/u);
  assert.doesNotMatch(
    source,
    /deriveRuntimeAggregateProjection\(\s*input\.basis,\s*Object\.freeze\(\[\.\.\.input\.replayEvents,\s*\.\.\.input\.emittedEvents\]\)/u
  );
  assert.match(
    source,
    /const basisScopedProcessEvents\s*=\s*runtimeEventsForBasis\(\s*input\.basis,\s*input\.processResult\.events\s*\)/u
  );
  assert.doesNotMatch(
    source,
    /deriveRuntimeAggregateProjection\(\s*input\.basis,\s*input\.processResult\.events\s*\)/u
  );
  assert.match(source, /events:\s*basisScopedProcessEvents/u);
  assert.match(
    source,
    /traversalTransitionRef\s*=\s*abgTraversalTransitionProjectionRef/u
  );
  assert.match(
    source,
    /closureDisposition:\s*closureDecision\.disposition/u
  );
  const gapStopTransitionIndex = transitionRefBody.indexOf(
    'terminalKind === "gap_stop"'
  );
  const yieldedTransitionIndex = transitionRefBody.indexOf(
    'terminalKind === "yielded"'
  );
  const closeDispositionIndex = transitionRefBody.indexOf(
    'input.closureDisposition === "close"'
  );
  assert.ok(gapStopTransitionIndex >= 0);
  assert.ok(yieldedTransitionIndex >= 0);
  assert.ok(closeDispositionIndex >= 0);
  assert.ok(
    gapStopTransitionIndex < closeDispositionIndex,
    "ABG gap_stop must outrank SDLC close when deriving traversal transition refs"
  );
  assert.ok(
    yieldedTransitionIndex < closeDispositionIndex,
    "ABG yielded terminal must outrank SDLC close when deriving traversal transition refs"
  );
  assert.match(
    transitionRefBody,
    /terminalKind === "gap_stop"[\s\S]*?disposition:\s*"block"[\s\S]*?reason:\s*"runtime_blocked"/u
  );
  assert.match(
    transitionRefBody,
    /input\.closureDisposition === "close"[\s\S]*?disposition:\s*"close"[\s\S]*?reason:\s*"edge_close"/u
  );
  assert.match(
    source,
    /const effectiveTerminalKind\s*=\s*terminal\?\.terminalKind\s*\?\?\s*null/u
  );
  assert.doesNotMatch(
    source,
    /closureDisposition === "close"[\s\S]*?\?\s*"converged"/u
  );
  assert.match(
    source,
    /traversalTransitionRef,\s*\n\s*domainReadModelRefs/u
  );
  assert.doesNotMatch(source, /\bclosedWithoutNextTraversal\b/u);
  assert.doesNotMatch(
    source,
    /traversalTransitionRef:\s*nextActionProjection\.nextActionProjectionRef/u
  );
  assert.match(
    traversalConsequenceSource,
    /abgTraversalTransitionRef:\s*string/u
  );
  assert.match(
    traversalConsequenceSource,
    /const traversalTransitionRef\s*=\s*requireNonEmptyString\(\s*input\.abgTraversalTransitionRef/u
  );
  assert.doesNotMatch(
    traversalConsequenceSource,
    /traversalTransitionRef:\s*nextActionProjection\.nextActionProjectionRef/u
  );
  assert.doesNotMatch(
    source,
    /terminal(?:\?\.terminalKind|Kind) === "gap_stop"[\s\S]{0,120}return "converged";/u
  );
});

test("T-197 A2 keeps SDLC start as shell over one admitted ABG boundary", () => {
  const product = repoFile("specification/PRODUCT.md");
  const entry = repoFile(
    "build_tenants/typescript/code/src/spec_method/entry.ts"
  );
  const operatorIndex = repoFile(
    "build_tenants/typescript/code/src/operator/index.ts"
  );
  const installedOperator = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const carriers = repoFile("build_tenants/typescript/code/src/operator/carriers.ts");
  const runtimePolicy = repoFile(
    "build_tenants/typescript/code/src/operator/runtime_policy.ts"
  );
  const runtimePolicyConfig = repoFile(
    "build_tenants/typescript/config/operator-runtime-policy.json"
  );
  const design = repoFile(
    "build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_STAGED_COMPUTE_BOUNDARY.md"
  );
  const installedStartPayload = sourceFunction(entry, "installedStartPayloadFor");
  const instructions = repoFile(
    "build_tenants/typescript/code/src/install/instruction_files.ts"
  );

  assert.match(product, /control remains in ABG until ABG exits/u);
  assert.match(product, /must not implement a product-local loop/u);
  assert.match(installedStartPayload, /\bexecuteInstalledOperatorStart\(/u);
  assert.doesNotMatch(
    installedStartPayload,
    /\bexecuteInstalledOperatorStartWithReentry\b/u
  );
  assert.doesNotMatch(installedStartPayload, /\brefreshReplayState\b/u);
  assert.doesNotMatch(
    installedStartPayload,
    /\binstalledStartShouldContinueForRequestedUntil\b/u
  );
  assert.doesNotMatch(
    entry,
    /import\s*\{[\s\S]*executeInstalledOperatorStartWithReentry/u
  );
  assert.doesNotMatch(
    installedOperator,
    /\bexecuteInstalledOperatorStartWithReentry\b/u
  );
  assert.doesNotMatch(operatorIndex, /\bexecuteInstalledOperatorStartWithReentry\b/u);
  assert.doesNotMatch(carriers, /\bSdlcInstalledOperatorStartLoop\b/u);
  assert.doesNotMatch(carriers, /\bsdlc_installed_operator_start_loop\b/u);
  assert.doesNotMatch(runtimePolicy, /\binstalledReentry\b/u);
  assert.doesNotMatch(runtimePolicy, /\binstalledRetryReentryAttemptLimits\b/u);
  assert.doesNotMatch(runtimePolicyConfig, /"installedReentry"/u);
  assert.match(design, /A2 \| `executeInstalledOperatorStartWithReentry` formerly owned/u);
  assert.match(design, /SDLC-local loop deleted/u);
  assert.match(design, /one admitted `executeInstalledOperatorStart\(\.\.\.\)` boundary/u);
  assert.doesNotMatch(design, /loop may only call the installed-start boundary/u);
  assert.doesNotMatch(design, /operator-facing retry\/reentry shell/u);
  assert.match(
    instructions,
    /\$\{genesisCommand\} start --workspace \. --scope workspace --target graph_function:\$\{FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE\} --until converged/u
  );
  assert.match(
    instructions,
    /import \{ FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE \} from "\.\.\/graph\/catalog\.js";/u
  );
  assert.doesNotMatch(instructions, /\$\{oddSdlcCommand\}[^`]*--until converged/u);
});

test("T-197 review-grade semantic gaps remain ABG retry pressure, not evaluator stop", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const openFindingsBranch = source.match(
    /if \(admission\.assessment\.status === "blocked" \|\| openFindings\.length > 0\) \{[\s\S]*?return constructEvaluationRuleOutcome\(\{[\s\S]*?\n    \}\);\n  \}/u
  );

  assert.notEqual(openFindingsBranch, null);
  assert.match(openFindingsBranch[0], /code:\s*"review_grade_edge_fulfillment_blocked"/u);
  assert.match(openFindingsBranch[0], /status:\s*"accepted"/u);
  assert.match(openFindingsBranch[0], /\bresidualPressureRefs\b/u);
  assert.doesNotMatch(openFindingsBranch[0], /status:\s*"blocked"/u);
});

test("T-197 B2 keeps component-depth as GTL target-carrier read model", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/component_depth_register.ts"
  );

  assert.match(source, /\bSDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE\b/u);
  assert.match(source, /owner:\s*"downstream_product_read_model"/u);
  assert.match(source, /"REQ-L-GTL3-CONTRACT-LAW-API"/u);
  assert.match(source, /"REQ-L-GTL3-GRAPHVECTOR"/u);
  assert.match(source, /\bsdlcTargetCarrierOutputKind\b/u);
  assert.match(source, /\bsdlcTargetCarrierContractRef\b/u);
  assert.match(
    source,
    /expected:\s*sdlcTargetCarrierContractRef\(\{\s*edgeRef,\s*targetAssetType\s*\}\)/u
  );
  assert.doesNotMatch(source, /export\s+(?:interface|type)\s+Gtl/u);
  assert.doesNotMatch(source, /constructGtlContract/u);
});

test("T-197 B3 keeps prompt assets as GTL AssetSurface rows plus SDLC policy", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/prompt_assets.ts"
  );
  const input = constructCurrentSdlcGtlProgramConformanceInput();

  assert.match(source, /\badmitAssetSurface\b/u);
  assert.match(source, /\bconstructAssetSurface\b/u);
  assert.match(source, /\bconstructNode\b/u);
  assert.match(source, /rendered Markdown is a view over a GTL Node\/AssetSurface/u);
  assert.doesNotMatch(source, /export\s+interface\s+AssetSurface\b/u);

  assert.equal(input.promptAssets.length, 3);
  for (const row of input.promptAssets) {
    assert.match(row.assetSurface.kind, /^gtl\.asset_surface\/odd_sdlc\.prompt\//u);
    assert.equal(row.gtlNode.assetSurface, row.assetSurface);
    assert.match(row.gtlNode.id, /^node:\/\/odd-sdlc\/prompt\//u);
    assert.match(row.renderedViewDigest, /^sha256:/u);
    assert.ok(row.assetSurface.constructorRefs.length > 0);
    assert.ok(row.assetSurface.rendererRefs.length > 0);
    assert.ok(row.assetSurface.proofObligationRefs.length > 0);
    assert.ok(row.assetSurface.authoritySlots.length > 0);
  }
});

test("T-197 B4b keeps review-grade routing off tenant command grammar", () => {
  const source = repoFile(
    "build_tenants/typescript/code/src/operator/review_grade_edge_fulfillment.ts"
  );

  assert.doesNotMatch(source, /action\.includes\("node --test"\)/u);
  assert.doesNotMatch(source, /action\.includes\("npm test"\)/u);
  assert.match(source, /\bfailureClass\s*===\s*"test_overlap_missing"/u);
  assert.match(source, /\bfailureClass\s*===\s*"execution_environment"/u);
  assert.match(source, /action\.includes\("component_test_surface"\)/u);
  assert.match(source, /action\.includes\("execution evidence"\)/u);
});

test("T-197 H2 keeps F_D run analysis profiles open and capability-driven", () => {
  const typesSource = repoFile(
    "build_tenants/typescript/code/src/analysis/types.ts"
  );
  const profilesSource = repoFile(
    "build_tenants/typescript/code/src/analysis/profiles.ts"
  );
  const analyzeSource = repoFile(
    "build_tenants/typescript/code/src/analysis/analyze.ts"
  );

  assert.doesNotMatch(typesSource, /"hello_world",\s*\n\s*"data_mapper"/u);
  assert.doesNotMatch(profilesSource, /\bcase\s+"hello_world"\b/u);
  assert.doesNotMatch(profilesSource, /\bcase\s+"data_mapper"\b/u);
  assert.doesNotMatch(analyzeSource, /profile\s*===\s*"hello_world"/u);
  assert.match(profilesSource, /\btruthyCapability\(/u);
  assert.match(profilesSource, /"trivial_product"/u);
  assert.match(analyzeSource, /\bprofileCapabilityContracts\b/u);
});

test("T-197 H3/H4 contain B-068 enterprise-core fixtures outside product defaults", () => {
  const rootIndexSource = repoFile("build_tenants/typescript/code/src/index.ts");
  const qualificationIndexSource = repoFile(
    "build_tenants/typescript/code/src/qualification/index.ts"
  );
  const inventorySource = repoFile(
    "build_tenants/typescript/code/src/qualification/enterprise_core_inventory.ts"
  );
  const sandboxSource = repoFile(
    "build_tenants/typescript/code/src/qualification/enterprise_core_iteration_sandbox.ts"
  );
  const sandboxTestSource = repoFile(
    "build_tenants/typescript/test_env/sandbox/test_b068_enterprise_core_outcome_iteration.test.mjs"
  );
  const sourceHits = repoFilesUnder("build_tenants/typescript/code/src")
    .filter((filePath) => path.extname(filePath) === ".ts")
    .filter((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return /\bENTERPRISE_CORE_COMPONENTS\b|\bEnterpriseCore\b|enterprise_core_inventory|enterprise_core_iteration_sandbox/u.test(
        source
      );
    })
    .map((filePath) => path.relative(REPO_ROOT, filePath).split(path.sep).join("/"));

  assert.doesNotMatch(rootIndexSource, /enterprise_core_|ENTERPRISE_CORE|EnterpriseCore/u);
  assert.doesNotMatch(
    qualificationIndexSource,
    /enterprise_core_|ENTERPRISE_CORE|EnterpriseCore/u
  );
  assert.deepEqual(sourceHits, [
    "build_tenants/typescript/code/src/qualification/enterprise_core_inventory.ts",
    "build_tenants/typescript/code/src/qualification/enterprise_core_iteration_sandbox.ts"
  ]);
  assert.match(inventorySource, /Investigates: B-068/u);
  assert.match(sandboxSource, /Investigates: B-068/u);
  assert.match(
    sandboxSource,
    /key:\s*"function_kind"[\s\S]*?value:\s*"odd_outcome_iteration_probe"/u
  );
  assert.match(
    sandboxTestSource,
    /code\/src\/qualification\/enterprise_core_inventory\.js/u
  );
  assert.match(
    sandboxTestSource,
    /code\/src\/qualification\/enterprise_core_iteration_sandbox\.js/u
  );
  assert.doesNotMatch(sandboxTestSource, /code\/src\/index\.js/u);
  assert.doesNotMatch(
    [inventorySource, sandboxSource, sandboxTestSource].join("\n"),
    /TypeResolver|TopologicalCompiler|MorphismExecutor|SynthesisEngine|RunManifestManager|ArtifactVersionStore|AssuranceValidator|AccountingVerifier|AdjointCompiler|FidelityVerificationService|CdmeEngine|cdme_|data_mapper_enterprise|morphism|Morphism|fidelity|Fidelity|CDME|Cdme/u
  );
});

test("T-197 H5/H7 keep prompt pressure policy off tenant command grammar", () => {
  const promptPolicySource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/prompt_edge_policy.ts"
  );
  const reviewPromptSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
  );

  assert.doesNotMatch(promptPolicySource, /text\.includes\("npm test"\)/u);
  assert.doesNotMatch(reviewPromptSource, /npm test execution/u);
  assert.match(promptPolicySource, /text\.includes\("component_test_surface"\)/u);
  assert.match(promptPolicySource, /text\.includes\("execution evidence"\)/u);
  assert.match(reviewPromptSource, /declared test-execution-contract proof/u);
});

test("T-197 H6 keeps repair reentry diagnostics tenant-declared", () => {
  const repairReentrySource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/consequence/repair_reentry.ts"
  );

  assert.match(repairReentrySource, /\bfunction diagnosticNeedlesForRepairRow\b/u);
  assert.match(repairReentrySource, /\brow\.failureId\b/u);
  assert.match(repairReentrySource, /\brow\.testRefs\.map\b/u);
  assert.match(repairReentrySource, /\brow\.sourceRefs\.map\b/u);
  assert.match(repairReentrySource, /"\[error\]"/u);
  assert.match(repairReentrySource, /"test_compile_failed"/u);
  assert.match(repairReentrySource, /"blockerDetail"/u);
  assert.doesNotMatch(
    repairReentrySource,
    /"type mismatch"|"Cannot prove"|\bsbt\b|Scala|build\.sbt/u
  );
});

test("T-197 C1 keeps Claude argv grammar in a declared worker capability profile", () => {
  const transportSource = repoFile(
    "build_tenants/typescript/code/src/operator/transport.ts"
  );
  const argsForWorkerBody = sourceFunction(transportSource, "argsForWorker");

  assert.match(transportSource, /\bSDLC_WORKER_CAPABILITY_ARG_PROFILES\b/u);
  assert.match(transportSource, /\binterface SdlcWorkerCapabilityArgProfile\b/u);
  assert.match(transportSource, /\bworkerCapabilityArgsForTransport\b/u);
  assert.match(argsForWorkerBody, /\bworkerCapabilityArgsForTransport\b/u);
  assert.doesNotMatch(transportSource, /\bfunction claudeArgs\b/u);
  assert.doesNotMatch(
    transportSource,
    /\bsessionRegistry\b|\bworkerRegistry\b|\bcreateServer\b|\bodd_service\b/u
  );
});

test("T-197 D2/D3 keep traversal method selection carrier-admitted", () => {
  const decompositionSource = repoFile(
    "build_tenants/typescript/code/src/operator/decomposition_admission.ts"
  );
  const stagedAuthoritySource = repoFile(
    "build_tenants/typescript/code/src/operator/product_materialization/staged_authority.ts"
  );
  const postflightSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight_checks.ts"
  );
  const publicStartSource = repoFile(
    "build_tenants/typescript/code/src/start/public_start.ts"
  );

  assert.match(
    decompositionSource,
    /\binterface SdlcDependencyTraversalSelectedMethodCarrier\b/u
  );
  assert.match(
    decompositionSource,
    /\badmitSdlcDependencyTraversalSelectedMethodCarrier\b/u
  );
  assert.match(decompositionSource, /\bselectedMethodCarrier\b/u);
  assert.doesNotMatch(
    decompositionSource,
    /\bfunction dependencyTraversalMethod\b/u
  );
  assert.match(
    stagedAuthoritySource,
    /\badmitSdlcDependencyTraversalSelectedMethodCarrier\b/u
  );
  assert.match(stagedAuthoritySource, /\bselectedMethodCarrier\b/u);
  assert.match(
    postflightSource,
    /\badmitSdlcDependencyTraversalSelectedMethodCarrier\b/u
  );
  assert.match(postflightSource, /\bselectedMethodCarrier\b/u);
  assert.doesNotMatch(publicStartSource, /\bselectSdlcDependencyMapTraversal\b/u);
  assert.match(publicStartSource, /\bfunction triagedPublicStartEntryOverlayRef\b/u);
  assert.match(publicStartSource, /\bfunction triagedEntryOverlayRefForProfile\b/u);
  assert.match(publicStartSource, /\bfunction frontDoorTraversalSelection\b/u);
  assert.match(publicStartSource, /\bfunction overlayTraversalSelection\b/u);
  assert.match(publicStartSource, /\bevidenceRefs\b/u);
  assert.match(publicStartSource, /capability:\/\/odd-sdlc\/trivial_product/u);
  assert.match(publicStartSource, /\bSDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF\b/u);
  assert.match(publicStartSource, /\bSDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF\b/u);
  assert.match(publicStartSource, /\binput\.overlay\.overlayRef\b/u);
});

test("T-197 D1/D4-D6 keep materialization identity carrier-declared", () => {
  const liveFrontierSource = repoFile(
    "build_tenants/typescript/code/src/operator/live_fp_parallel_materialization_frontier.ts"
  );
  const installedOperatorSource = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const authoritySource = repoFile(
    "build_tenants/typescript/code/src/operator/product_materialization/authority.ts"
  );
  const liveBridge = sourceFunction(
    installedOperatorSource,
    "writeLiveFpParallelMaterializationFrontier"
  );
  const laneClassifier = sourceFunction(
    installedOperatorSource,
    "liveParallelModuleLaneKind"
  );
  const moduleTargets = sourceFunction(
    authoritySource,
    "targetsFromDeclaredModuleTargets"
  );
  const directoryDetector = sourceFunction(
    authoritySource,
    "declaredProductTargetLooksLikeDirectory"
  );
  const designSourceTarget = sourceFunction(
    authoritySource,
    "designSourceTargetSeedFromComponentRelativePath"
  );

  assert.doesNotMatch(liveFrontierSource, /\bclassifySdlcLiveParallelModuleLane\b/u);
  assert.doesNotMatch(installedOperatorSource, /\bclassifySdlcLiveParallelModuleLane\b/u);
  assert.match(laneClassifier, /\btenantStackDeclaredMaterializedRoleForRelativePath\b/u);
  assert.match(laneClassifier, /role === "source"/u);
  assert.doesNotMatch(laneClassifier, /\/src\/|\bindex\./u);
  assert.match(liveBridge, /\bliveParallelFanInTargetRefs\b/u);
  assert.doesNotMatch(liveBridge, /index\.\[cm\]\?\[jt\]sx\?|\^src\\\//u);
  assert.doesNotMatch(moduleTargets, /\$\{input\.selectedOutputRoot\}\/\$\{moduleName\}\/src/u);
  assert.doesNotMatch(designSourceTarget, /\.test\.|\.spec\./u);
  assert.match(designSourceTarget, /\bdeclaredRole === "test"/u);
  assert.doesNotMatch(directoryDetector, /lower === "project"|\/project/u);
  assert.match(authoritySource, /\btenantStackDeclaredMaterializedRoleForRelativePath\b/u);
  assert.match(authoritySource, /\bsourceRoots\b/u);
  assert.match(authoritySource, /\btestRoots\b/u);
});

test("T-197 E/P residual rows stay carrier-bound", () => {
  const edgeProjectionSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/consequence/edge_projection.ts"
  );
  const closureStateSource = repoFile(
    "build_tenants/typescript/code/src/operator/closure_state_machine.ts"
  );
  const carriersSource = repoFile(
    "build_tenants/typescript/code/src/operator/carriers.ts"
  );
  const installedOperatorSource = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const reviewGradeSource = repoFile(
    "build_tenants/typescript/code/src/operator/review_grade_edge_fulfillment.ts"
  );
  const reviewGradePromptSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts"
  );
  const featureDagSource = repoFile(
    "build_tenants/typescript/code/src/operator/feature_dependency_dag.ts"
  );
  const liveFrontierSource = repoFile(
    "build_tenants/typescript/code/src/operator/live_fp_parallel_materialization_frontier.ts"
  );
  const postflightSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight_checks.ts"
  );
  const resultProjectionSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/result_projection.ts"
  );
  const requirementClosureSource = repoFile(
    "build_tenants/typescript/code/src/projection/requirement_closure.ts"
  );
  const shardRunner = sourceFunction(
    edgeProjectionSource,
    "runInstalledOperatorShardCommand"
  );
  const shardProjection = sourceFunction(
    edgeProjectionSource,
    "writeTestExecutionResultProjection"
  );
  const executionShards = sourceFunction(
    edgeProjectionSource,
    "installedOperatorExecutionShards"
  );
  const closureTransition = sourceFunction(
    closureStateSource,
    "deriveSdlcClosureStateTransition"
  );
  const reportReader = sourceFunction(
    postflightSource,
    "readArchivedWorkerResultReportRecord"
  );
  const admittedReport = sourceFunction(
    resultProjectionSource,
    "admitWorkerResultReport"
  );
  const topologicalHits = repoFilesUnder("build_tenants/typescript/code/src")
    .filter((filePath) => path.extname(filePath) === ".ts")
    .filter((filePath) => readFileSync(filePath, "utf8").includes("topologicalOrder"))
    .map((filePath) => path.relative(REPO_ROOT, filePath).split(path.sep).join("/"));

  assert.match(shardProjection, /\binstalledOperatorExecutionShards\(manifest\)/u);
  assert.match(shardProjection, /\brunInstalledOperatorShardCommand\(\{/u);
  assert.match(shardProjection, /command:\s*shard\.command/u);
  assert.match(shardProjection, /cwd:\s*shard\.workingDirectory/u);
  assert.match(executionShards, /\bmanifest\.productMaterialization\.executionShards\b/u);
  assert.match(executionShards, /\blatestAdmittedTestExecutionSurfaceRegister\b/u);
  assert.doesNotMatch(shardRunner, /\bnpm test\b|\bsbt test\b/u);

  assert.match(closureStateSource, /\binterface SdlcClosureResidualPressureCarrier\b/u);
  assert.match(closureStateSource, /\bmakeSdlcClosureResidualPressureCarrier\b/u);
  assert.match(carriersSource, /\bSdlcRepairSurfaceTriageCarrier\b/u);
  assert.match(carriersSource, /\bSDLC_REPAIR_SURFACE_TRIAGE_DISPOSITIONS\b/u);
  assert.match(carriersSource, /"upstream_reentry"/u);
  assert.match(reviewGradeSource, /\breviewGradeEdgeFulfillmentRepairSurfaceTriageRows\b/u);
  assert.match(reviewGradeSource, /\bparseNullableRepairSurfaceTriage\b/u);
  assert.match(reviewGradeSource, /"downstream_deferred"/u);
  assert.match(reviewGradePromptSource, /\brepairSurfaceTriage\b/u);
  assert.match(reviewGradePromptSource, /current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked/u);
  assert.match(closureTransition, /\bresidualPressureCarriers\b/u);
  assert.match(closureTransition, /\bresidualPressureCarrierRefsForBucket\b/u);
  assert.match(closureTransition, /\breenterReasonRefs\b/u);
  assert.match(installedOperatorSource, /\bresidualPressureCarriers:\s*closureResidualPressureCarriers/u);
  assert.match(installedOperatorSource, /\breviewGradeResidualPressureCarriersForState\b/u);
  assert.match(installedOperatorSource, /\bderiveSdlcUpstreamRepairSurfaceYieldResumeBasis\b/u);
  assert.match(installedOperatorSource, /\bselectedEvaluationDefaultResidualPressureRefs\b/u);
  assert.match(
    installedOperatorSource,
    /nonlocal_repair_surface_admitted_upstream_reentry/u
  );

  assert.deepEqual(topologicalHits, [
    "build_tenants/typescript/code/src/operator/carriers.ts",
    "build_tenants/typescript/code/src/operator/feature_dependency_dag.ts"
  ]);
  assert.match(featureDagSource, /\bderiveDependencyFrontierProjection\b/u);
  assert.match(featureDagSource, /\bparentBranchRefs\b/u);
  assert.match(liveFrontierSource, /\bgraphTruthSource:\s*"sdlc_feature_dependency_dag"/u);

  assert.match(reportReader, /\bauthoritativeStageResultRef\b/u);
  assert.match(reportReader, /\bexpectedArchivedFpEvaluateResultRef\b/u);
  assert.match(
    reportReader,
    /expected same-archive fp_evaluate_result\.json/u
  );
  assert.match(admittedReport, /\badmitAuthoritativeStageResultRef\b/u);
  assert.match(installedOperatorSource, /\breviewGradeEdgeFulfillmentAssessmentRequired\b/u);
  assert.match(requirementClosureSource, /selectedBy:\s*"abg_selected_edge"/u);
  assert.match(requirementClosureSource, /\bgeneratedAssetContractSatisfied\b/u);
});

test("T-197 P3 keeps component-depth admission off fenced bridge fixtures", () => {
  const componentDepthSource = repoFile(
    "build_tenants/typescript/code/src/operator/component_depth_register.ts"
  );
  const promptPolicySource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/prompt_edge_policy.ts"
  );
  const t113Source = repoFile(
    "build_tenants/typescript/test_env/tests/test_t113_component_depth_register_admission.test.mjs"
  );

  assert.doesNotMatch(componentDepthSource, /\bmarkdownFencedJsonBlocks\b/u);
  assert.doesNotMatch(componentDepthSource, /markdown_fence_/u);
  assert.doesNotMatch(componentDepthSource, /component_depth_register_body/u);
  assert.doesNotMatch(
    componentDepthSource,
    /\(\?:json\\s\+\)\?component_depth_register/u
  );
  assert.doesNotMatch(
    promptPolicySource,
    /whole-file JSON component_depth_register selected target-carrier envelope/u
  );
  assert.match(
    promptPolicySource,
    /raw JSON component_depth_register selected target-carrier envelope/u
  );
  assert.match(
    promptPolicySource,
    /For Markdown output artifacts, place the raw JSON object under the target-carrier heading/u
  );
  assert.match(
    promptPolicySource,
    /Do not wrap the component_depth_register carrier in Markdown fences/u
  );
  assert.doesNotMatch(
    promptPolicySource,
    /fenced `json component_depth_register`/u
  );
  assert.match(
    t113Source,
    /rejects Markdown-fenced component-depth target carrier payloads/u
  );
  assert.match(
    t113Source,
    /rejects plain-fence labeled component-depth target carrier payloads/u
  );
  assert.doesNotMatch(
    t113Source,
    /admits Markdown-fenced component-depth|admits live plain-fence labeled component-depth/u
  );
});

test("T-197 H8-H12 keep low-priority horizontal literals neutral", () => {
  const analyzeSource = repoFile("build_tenants/typescript/code/src/analysis/analyze.ts");
  const analysisTypesSource = repoFile(
    "build_tenants/typescript/code/src/analysis/types.ts"
  );
  const renderMarkdownSource = repoFile(
    "build_tenants/typescript/code/src/analysis/render_markdown.ts"
  );
  const projectProfileSource = repoFile(
    "build_tenants/typescript/code/src/workspace/project_profile.ts"
  );
  const promptPolicySource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/prompt_edge_policy.ts"
  );

  assert.doesNotMatch(analyzeSource, /\bTEST35_CONCEPTUAL_STAGES\b/u);
  assert.doesNotMatch(analyzeSource, /test35:\/\/stage/u);
  assert.match(analyzeSource, /\bSDLC_CONCEPTUAL_STAGES\b/u);
  assert.match(analyzeSource, /sdlc:\/\/stage\/project-conformance/u);
  assert.doesNotMatch(analysisTypesSource, /\btest35StageRef\b/u);
  assert.match(analysisTypesSource, /\bconceptualStageRef\b/u);
  assert.doesNotMatch(renderMarkdownSource, /Test35 Conceptual Stage Coverage/u);
  assert.doesNotMatch(renderMarkdownSource, /test35 stage/u);
  assert.match(renderMarkdownSource, /Conceptual Stage Coverage/u);
  assert.match(renderMarkdownSource, /conceptual stage/u);
  assert.doesNotMatch(projectProfileSource, /normalized === "spark_scala"/u);
  assert.doesNotMatch(promptPolicySource, /data_mapper\.requirements\.req_dq_001/u);
  assert.match(promptPolicySource, /tenant\.requirements\.req_example_001/u);
  assert.doesNotMatch(
    projectProfileSource,
    /morphisms\?|error domain|fidelity/u
  );
});

test("T-203 keeps tenant test-design technology in typed tenant authority", () => {
  const promptPolicySource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/transform/prompt_edge_policy.ts"
  );

  assert.match(promptPolicySource, /tenant-declared test root/u);
  assert.doesNotMatch(
    promptPolicySource,
    /src\/main\.rs|local_http_service_smoke|\bcurl\b|tests\/<testClassId>\.sh/u
  );
});

test("T-158/T-203 keep plugin result interfaces under GTL/ABG authority", () => {
  const product = repoFile("specification/PRODUCT.md");
  const ticket = repoFileFromFirstExisting([
    ".ai-workspace/tickets/active/T-203-factor-code-builder-graph-function-for-uat-test-generation-and-ticket-reentry.md",
    ".ai-workspace/tickets/completed/T-203-factor-code-builder-graph-function-for-uat-test-generation-and-ticket-reentry.md"
  ]);
  const designDepthSource = repoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/design_depth_register.ts"
  );
  const installedOperatorSource = repoFile(
    "build_tenants/typescript/code/src/operator/installed_operator.ts"
  );
  const input = constructCurrentSdlcGtlProgramConformanceInput();
  const report = typecheckCurrentSdlcGtlProgram();

  assert.match(
    product,
    /compiler-admitted plugin result-interface catalog/u
  );
  assert.match(
    product,
    /runner\/replay-visible result-envelope ingress for compute-stage outputs/u
  );
  assert.match(
    product,
    /Static `pluginResultInterfaces` conformance rows supplied by `odd_sdlc\.TS` are\s+GTL program declarations for ABG to check; they are not a runtime selector/u
  );
  assert.match(product, /pluginResultInterfaceCatalog/u);
  assert.match(
    ticket,
    /Static `pluginResultInterfaces` rows supplied to\s+`typecheckGtlProgram\(\.\.\.\)` are GTL program declarations only/u
  );
  assert.match(
    ticket,
    /Static `pluginResultInterfaces` conformance rows alone are not enough to\s+close this criterion/u
  );

  assert.ok(input.pluginResultInterfaces.length > 0);
  assert.ok(report.pluginResultInterfaceCatalog.interfaces.length > 0);
  for (const row of input.pluginResultInterfaces) {
    assert.equal(row.mayEmitRuntimeEvents, false);
    assert.equal(row.mayOwnIterationLoop, false);
    assert.equal(row.maySelectTraversal, false);
    assert.equal(row.mayCloseTraversal, false);
    assert.ok(row.selectorAuthorityRefs.length > 0);
    assert.equal(
      row.selectorAuthorityRefs.some((ref) =>
        /(?:file:\/\/|fp_evaluate_result\.json|fp_transform_result\.json)/u.test(ref)
      ),
      false
    );
  }

  assert.match(designDepthSource, /admittedPluginResultEnvelopeEvidenceRefsForRegisterPath/u);
  assert.match(designDepthSource, /runtime_events\.json/u);
  assert.match(designDepthSource, /admitted_plugin_result_envelope/u);
  assert.match(designDepthSource, /resultInterfaceContractDigest/u);
  assert.match(designDepthSource, /authorityRef/u);
  assert.match(installedOperatorSource, /pluginResultInterfaceCatalog/u);
  assert.doesNotMatch(
    installedOperatorSource,
    /pluginResultInterfaces:\s*constructCurrentSdlcGtlProgramConformanceInput/u
  );
  assert.doesNotMatch(designDepthSource, /admitPluginResultEnvelope/u);
  assert.doesNotMatch(
    designDepthSource,
    /currentSdlcPluginResultInterfaceForSelection/u
  );
  assert.doesNotMatch(designDepthSource, /latest[-_ ]?run wins/u);
  assert.doesNotMatch(designDepthSource, /compatibility alias/u);
  assert.doesNotMatch(
    designDepthSource,
    /fallback(?:.|\n){0,120}selectedComposition/u
  );
});

test("T-203 keeps SDLC surface path maps single-owner with UAT source path", () => {
  const sharedPath =
    "build_tenants/typescript/code/src/operator/product_materialization/surface_paths.ts";
  const sharedSource = repoFile(sharedPath);
  const sourceFiles = repoFilesUnder("build_tenants/typescript/code/src")
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.relative(REPO_ROOT, file).split(path.sep).join("/"));

  assert.match(
    sharedSource,
    /uat_test_source_surface:\s*"design\/uat_test_source_surface\.md"/u
  );
  assert.match(
    sharedSource,
    /export const TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS/u
  );
  assert.match(
    sharedSource,
    /export const WORKSPACE_LOCAL_SDLC_SURFACE_OUTPUT_PATHS/u
  );
  assert.match(sharedSource, /export const MATERIALIZED_PRODUCT_FILE_ROLES/u);

  for (const constantName of [
    "TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS",
    "WORKSPACE_LOCAL_SDLC_SURFACE_OUTPUT_PATHS",
    "MATERIALIZED_PRODUCT_FILE_ROLES"
  ]) {
    const duplicateOwners = sourceFiles.filter((relativePath) => {
      if (relativePath === sharedPath) {
        return false;
      }
      return new RegExp(`const\\s+${constantName}\\s*=`).test(
        repoFile(relativePath)
      );
    });
    assert.deepEqual(duplicateOwners, [], `${constantName} has duplicate owners`);
  }
});
