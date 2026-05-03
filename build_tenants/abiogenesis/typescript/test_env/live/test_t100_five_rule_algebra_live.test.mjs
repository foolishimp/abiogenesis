// Validates: T-100
// Validates: REQ-R-ABG3-FRAME
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROVENANCE
//
// These tests assert the corrected algebra per test35 parity (R1-R5).
// See .ai-workspace/comments/claude/20260502T025410Z_REVIEW_T-082-T-100-implementation-stdo.md
//
// Each case evaluates A.req_i -> B.result_i through a domain/F_P quality
// assessment over the materialized artifact. Deterministic code may read files
// and structure the fixture, but it is not the semantic judge. F_P is live
// (real Claude worker callout) for the happy-path R1 case when CODEX_LIVE_FP=1
// is set; otherwise R1 falls back to a controlled deterministic F_P fixture so
// the test still loads, runs, and asserts. R2-R5 require deterministic
// trajectories that real workers cannot reliably reproduce, so they always use
// controlled F_P.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitPublicStartRequest,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitScheduledSliceAssessment,
  admitWorkspaceAssetBinding,
  constructOutputBindingAdmittedEvent,
  constructOutputInstanceAllocatedEvent,
  constructOutputMaterializationObservedEvent,
  constructOutputPluginHandoffManifest,
  constructScheduledSliceAssessedEvent,
  constructWorkspaceObligationLedgerAdmittedEvent,
  constructWorkspaceObligationScheduleDerivedEvent,
  constructZoomFoldbackEvaluatedEvent,
  constructZoomFrameOpenedEvent,
  deriveObligationLedgerAsset,
  deriveObligationSchedule,
  deriveOuterTraversalEvaluation,
  deriveOutputInstanceAllocation,
  deriveScheduledSliceAssessmentsFromEvents,
  deriveZoomFoldbackEvaluationFromEvents,
  edge,
  emit,
  graphFunctionForVector,
  openZoomFrame
} from "../../build/semantic/code/src/index.js";
import {
  contractForKnownAgent,
  runAgentTransport
} from "../../build/semantic/code/src/shared/abg_library/index.js";
import { executorProfileFields } from "./support/executor_profile.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t100_five_rule_algebra"
);

// Python parity allowlist: continuation.py:10-14.
// TS RuntimeFailureClass vocabulary differs (runtime_unavailable,
// capability_missing, runtime_failure, payload_contract_failure) and there
// is no allowlist gate — see review §3 R3.
const PYTHON_RETRY_ALLOWLIST = Object.freeze([
  "transport_failure",
  "no_output",
  "contract_failure"
]);

// Python parity finding-class taxonomy: gtl_module.py:536-540.
// TS ScheduledSliceAssessment has only generic status enum, no finding-class
// split — see review §3 R5.
const FINDING_CLASS_VALUES = Object.freeze([
  "fulfilled",
  "semantic_fulfillment_gap",
  "traceability_reference_gap"
]);

// Smaller obligation set than the sandbox (3 obligations is enough to surface
// the algebra gaps). Each obligation has both a marker (lexical surface) and
// a behavioral expectation (numeric content shape) so the domain/F_P quality
// assessment can distinguish material fulfillment from placeholder mention.
const OBLIGATIONS = Object.freeze([
  Object.freeze({
    id: "REQ-FIVE-001",
    title: "Specify at least 3 named data fields",
    marker: "REQ-FIVE-001",
    minFields: 3
  }),
  Object.freeze({
    id: "REQ-FIVE-002",
    title: "Specify at least 2 normalization rules",
    marker: "REQ-FIVE-002",
    minRules: 2
  }),
  Object.freeze({
    id: "REQ-FIVE-003",
    title: "Specify at least 1 acceptance scenario",
    marker: "REQ-FIVE-003",
    minScenarios: 1
  })
]);

const REQUESTED_OUTPUTS = Object.freeze([
  Object.freeze({
    output_name: "design_surface",
    output_asset_type: "Workspace.design_surface",
    relative_path: "design/five_rule_design.md",
    vectorIndex: 0
  })
]);

function liveEnabled() {
  return process.env["CODEX_LIVE_FP"] === "1" ||
    process.env["ABG_TS_T100_LIVE"] === "1";
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
}

function transportTimeoutMs() {
  const parsed = Number.parseInt(
    process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "120000",
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120000;
}

function sha256(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function stableTimestamp() {
  return new Date().toISOString().replace(/[-:.]/gu, "");
}

async function writeText(targetPath, content) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
  return targetPath;
}

async function writeJson(targetPath, value) {
  return writeText(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

function assertOk(result) {
  assert.equal(result.ok, true, result.detail ?? result.reason ?? "ok=false");
  return result;
}

function node(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `Workspace.${kind}` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`five-rule:${kind}:standard`],
      outputContractRefs: [`five-rule:${kind}:contract`]
    },
    tags: ["t100", "five-rule", kind]
  });
}

function fiveRuleModule() {
  const bootstrap = node(
    "node:t100-five-rule/bootstrap",
    "BootstrapInputSet",
    "bootstrap_input_set",
    "bootstrapped"
  );
  const design = node(
    "node:t100-five-rule/design",
    "DesignSurface",
    "design_surface",
    "designed"
  );
  const vector = edge([bootstrap], design, {
    id: "vector:t100-five-rule/bootstrap-to-design",
    name: "bootstrap_to_design",
    evaluators: [
      {
        name: "design_ready",
        regime: "F_P",
        description: "design accepted",
        binding: "binding://t100-five-rule/design",
        tags: ["t100", "five-rule"]
      }
    ],
    declarations: { entries: [] },
    tags: ["t100", "five-rule"]
  }).vectors[0];
  const lifecycle = graphFunctionForVector(vector, {
    name: "t100_five_rule_design_function",
    declarations: { entries: [] },
    tags: ["t100", "five-rule"]
  });
  const module = admitModule({
    name: "t100_five_rule_algebra_module",
    graphs: [],
    graphFunctions: [lifecycle],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job:t100/five-rule",
        name: "t100_five_rule_job",
        contracts: [{ kind: "graph_function", targetId: lifecycle.id }],
        roles: [],
        tags: ["t100", "five-rule"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
  return Object.freeze({ module, lifecycle });
}

function obligationsRequirementsMarkdown() {
  return [
    "# Five Rule Algebra — Bootstrap Requirements",
    "",
    ...OBLIGATIONS.flatMap((obligation) => [
      `## ${obligation.id}: ${obligation.title}`,
      "",
      `Acceptance: design must materially satisfy ${obligation.id}.`,
      ""
    ])
  ].join("\n");
}

// Domain/F_P quality assessment fixture: parses the design markdown into headed
// sections, finds the section addressing each obligation, then checks substantive content
// (no placeholder markers, satisfies the obligation's behavioral expectation).
// Returns a finding with one of three kinds (Rule 5):
//   "fulfilled"                  — both lexical reference AND material content
//   "traceability_reference_gap" — marker present but no material evidence
//   "semantic_fulfillment_gap"   — neither marker nor material evidence
function parseMarkdownSections(text) {
  const lines = text.split(/\r?\n/u);
  const sections = [];
  let current = null;
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/u);
    if (headingMatch !== null) {
      if (current !== null) {
        sections.push(current);
      }
      current = { heading: headingMatch[2].trim(), body: [] };
      continue;
    }
    if (current !== null) {
      current.body.push(line);
    }
  }
  if (current !== null) {
    sections.push(current);
  }
  return sections.map((section) =>
    Object.freeze({ heading: section.heading, body: section.body.join("\n") })
  );
}

function looksLikePlaceholder(body) {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return true;
  }
  if (/\b(TBD|TODO|placeholder|FIXME|to be determined)\b/iu.test(trimmed)) {
    return true;
  }
  if (trimmed.length < 20) {
    return true;
  }
  return false;
}

function countListItems(body) {
  return body.split(/\r?\n/u).filter((line) => /^\s*[-*+]\s+\S/u.test(line)).length;
}

function checkBehavioralExpectation(obligation, section) {
  const body = section.body;
  if (obligation.minFields !== undefined) {
    const count = countListItems(body);
    if (count < obligation.minFields) {
      return {
        passed: false,
        reason: `expected at least ${obligation.minFields} fields, found ${count}`
      };
    }
  }
  if (obligation.minRules !== undefined) {
    const count = countListItems(body);
    if (count < obligation.minRules) {
      return {
        passed: false,
        reason: `expected at least ${obligation.minRules} rules, found ${count}`
      };
    }
  }
  if (obligation.minScenarios !== undefined) {
    const count = countListItems(body);
    if (count < obligation.minScenarios) {
      return {
        passed: false,
        reason: `expected at least ${obligation.minScenarios} scenarios, found ${count}`
      };
    }
  }
  return { passed: true, reason: "behavioral expectation satisfied" };
}

async function assessDesignRequirementWithDomainQuality(input) {
  const designText = await readFile(input.designPath, "utf8");
  const sections = parseMarkdownSections(designText);
  const obligation = OBLIGATIONS.find(
    (candidate) => candidate.id === input.item.obligationId
  );
  assert.notEqual(obligation, undefined, `unknown obligation ${input.item.obligationId}`);
  const markerObserved = designText.includes(obligation.marker);
  const relevantSection = sections.find(
    (section) =>
      section.heading.includes(obligation.marker) ||
      section.body.includes(obligation.marker)
  );
  if (relevantSection === undefined) {
    return Object.freeze({
      kind: "domain_fp_quality_assessment",
      findingClass: "semantic_fulfillment_gap",
      attemptIndex: input.attemptIndex,
      scheduleItemId: input.item.scheduleItemId,
      obligationId: input.item.obligationId,
      designPath: input.designPath,
      status: "blocked",
      markerObserved,
      materialEvidenceObserved: false,
      reason: "no section addresses this obligation",
      evidenceRefs: Object.freeze([])
    });
  }
  if (looksLikePlaceholder(relevantSection.body)) {
    return Object.freeze({
      kind: "domain_fp_quality_assessment",
      findingClass: "traceability_reference_gap",
      attemptIndex: input.attemptIndex,
      scheduleItemId: input.item.scheduleItemId,
      obligationId: input.item.obligationId,
      designPath: input.designPath,
      status: "blocked",
      markerObserved: true,
      materialEvidenceObserved: false,
      reason: "section is a placeholder; lexical marker present, material content absent",
      evidenceRefs: Object.freeze([])
    });
  }
  const behavioral = checkBehavioralExpectation(obligation, relevantSection);
  if (!behavioral.passed) {
    return Object.freeze({
      kind: "domain_fp_quality_assessment",
      findingClass: "semantic_fulfillment_gap",
      attemptIndex: input.attemptIndex,
      scheduleItemId: input.item.scheduleItemId,
      obligationId: input.item.obligationId,
      designPath: input.designPath,
      status: "partial",
      markerObserved: true,
      materialEvidenceObserved: false,
      reason: behavioral.reason,
      evidenceRefs: Object.freeze([])
    });
  }
  return Object.freeze({
    kind: "domain_fp_quality_assessment",
    findingClass: "fulfilled",
    attemptIndex: input.attemptIndex,
    scheduleItemId: input.item.scheduleItemId,
    obligationId: input.item.obligationId,
    designPath: input.designPath,
    status: "fulfilled",
    markerObserved: true,
    materialEvidenceObserved: true,
    reason: "marker present and material content satisfies behavioral expectation",
    evidenceRefs: Object.freeze([
      `file://${input.designPath}#${obligation.id}`
    ])
  });
}

// Controlled F_P fixtures. They produce designs that exercise specific
// trajectories that real workers cannot reliably reproduce.

function fpControlledHappyPathDesign() {
  return [
    "# Five Rule Algebra Design",
    "",
    "## REQ-FIVE-001: Data fields",
    "",
    "The mapper exposes the following named fields:",
    "",
    "- id: stable row identifier",
    "- name: normalized display name",
    "- amount: numeric value (currency)",
    "- created_at: ISO-8601 timestamp",
    "",
    "## REQ-FIVE-002: Normalization rules",
    "",
    "The following normalization rules apply at row admission:",
    "",
    "- trim leading/trailing whitespace from string columns",
    "- coerce empty strings to nulls",
    "- coerce numeric strings to numbers when locale-safe",
    "",
    "## REQ-FIVE-003: Acceptance scenarios",
    "",
    "The following acceptance scenarios are pinned:",
    "",
    "- given a row with a trimmed name, the output normalizedName equals the trimmed value",
    "",
    ""
  ].join("\n");
}

function fpControlledTraceabilityOnlyDesign() {
  // Marker present but section is a placeholder (Rule 5: traceability_reference_gap).
  return [
    "# Five Rule Algebra Design",
    "",
    "## REQ-FIVE-001",
    "",
    "TBD",
    "",
    "## REQ-FIVE-002: Normalization rules",
    "",
    "- trim",
    "- nullify empty",
    "",
    "## REQ-FIVE-003: Acceptance scenarios",
    "",
    "- pinned acceptance: trimmed names normalize",
    "",
    ""
  ].join("\n");
}

function fpControlledNoMentionDesign() {
  // No mention of REQ-FIVE-001 at all (Rule 5: semantic_fulfillment_gap).
  return [
    "# Five Rule Algebra Design",
    "",
    "## REQ-FIVE-002: Normalization rules",
    "",
    "- trim",
    "- nullify empty",
    "",
    "## REQ-FIVE-003: Acceptance scenarios",
    "",
    "- pinned acceptance: trimmed names normalize",
    "",
    ""
  ].join("\n");
}

// Live F_P: invoke real Claude worker to produce the design markdown.
async function liveProduceDesign({ archiveRoot }) {
  const contract = contractForKnownAgent("claude");
  const prompt = [
    "Produce a markdown design document for a small data-mapper feature.",
    "It must address all three obligations below by id, with substantive lists.",
    "",
    ...OBLIGATIONS.map(
      (o) =>
        `- ${o.id}: ${o.title}. Provide bullet items meeting the count guideline.`
    ),
    "",
    "Return ONLY the markdown body, no preamble. Each obligation must appear as a heading containing its id verbatim, followed by a substantive bulleted list.",
    ""
  ].join("\n");
  const outputPath = path.join(archiveRoot, "live-fp-output.md");
  const transport = await runAgentTransport({
    contract,
    prompt,
    cwd: archiveRoot,
    archiveRoot,
    label: "live-fp",
    timeoutMs: transportTimeoutMs(),
    ...executorProfileFields(),
    outputPath,
    promptPath: path.join(archiveRoot, "live-fp-prompt.txt"),
    stdoutPath: path.join(archiveRoot, "live-fp-stdout.log"),
    stderrPath: path.join(archiveRoot, "live-fp-stderr.log")
  });
  if (transport.status !== 0) {
    throw new Error(
      `live F_P transport failed status=${transport.status} signal=${String(
        transport.signal
      )} failureClass=${String(transport.failureClass)} trace=${String(
        transport.traceRoot
      )}`
    );
  }
  return transport.text;
}

// Common harness: builds the workspace, basis, frame, schedule, and emits the
// initial events. Returns the handles needed to admit slice assessments and
// fold back.
async function buildHarness({ runRoot }) {
  const workspaceRoot = path.join(runRoot, "workspace");
  await mkdir(runRoot, { recursive: true });
  await writeText(
    path.join(workspaceRoot, "README.md"),
    "# Five Rule Algebra Sandbox\n"
  );
  const requirementsPath = await writeText(
    path.join(workspaceRoot, "specification", "requirements", "five_rule.md"),
    obligationsRequirementsMarkdown()
  );
  const { module, lifecycle } = fiveRuleModule();
  const request = admitPublicStartRequest({
    scope: { kind: "workspace", workspaceRoot, moduleName: module.name },
    target: { kind: "graph_function", handle: lifecycle.name },
    until: "converged",
    input_bindings: [
      {
        asset_ref: "workspace://t100-five-rule/bootstrap_input_set",
        asset_type: "Workspace.bootstrap_input_set",
        uri: requirementsPath
      }
    ],
    requested_outputs: REQUESTED_OUTPUTS
  });
  const basis = admitExecutionBasis({
    startIntent: request.startIntent,
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t100-five-rule/local",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t100-five-rule",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t100-five-rule",
      approvalSubjectRef: null
    }),
    runId: `run://t100-five-rule/${stableTimestamp()}`,
    workKey: "wk://t100-five-rule",
    frameId: null,
    frameLineageId: null
  });
  const inputBindingRaw = request.startIntent.inputBindings[0];
  const inputBinding = assertOk(
    admitWorkspaceAssetBinding({
      assetRef: inputBindingRaw.assetRef,
      assetType: inputBindingRaw.assetType,
      uri: inputBindingRaw.uri,
      workspaceRoot,
      bindingRole: "input",
      source: "caller"
    })
  ).binding;
  const designAllocation = assertOk(
    deriveOutputInstanceAllocation({
      basis,
      outputName: "design_surface",
      outputAssetType: "Workspace.design_surface",
      relativePath: "design/five_rule_design.md"
    })
  ).allocation;
  const rows = OBLIGATIONS.map((obligation) =>
    Object.freeze({
      kind: "obligation_ledger_row",
      obligationId: obligation.id,
      authorityRef: `workspace://t100-five-rule/req/${obligation.id}`,
      description: obligation.title,
      status: "open",
      requiredOutputRefs: [designAllocation.assetRef]
    })
  );
  const ledger = assertOk(
    deriveObligationLedgerAsset({
      basis,
      sourceAsset: inputBinding,
      authorityDigest: sha256(await readFile(requirementsPath, "utf8")),
      rows
    })
  ).ledger;
  const schedule = assertOk(deriveObligationSchedule(ledger)).schedule;
  const zoomFrame = openZoomFrame({
    basis,
    vectorIndex: 0,
    inputAsset: inputBinding,
    outputAllocation: designAllocation,
    ledger,
    schedule
  });
  const manifest = constructOutputPluginHandoffManifest({
    basis,
    manifestRef: `manifest://t100-five-rule/${stableTimestamp()}`,
    admittedInputRefs: [inputBinding.assetRef],
    allocatedOutputs: [designAllocation],
    proofObligationRefs: OBLIGATIONS.map((o) => o.id)
  });
  const events = [];
  events.push(
    constructOutputInstanceAllocatedEvent({
      basis,
      vectorIndex: 0,
      allocation: designAllocation
    }),
    constructOutputBindingAdmittedEvent({
      basis,
      vectorIndex: 0,
      allocation: designAllocation,
      bindingRef: "binding://t100-five-rule/design"
    }),
    constructWorkspaceObligationLedgerAdmittedEvent({
      basis,
      vectorIndex: 0,
      ledger
    }),
    constructWorkspaceObligationScheduleDerivedEvent({
      basis,
      vectorIndex: 0,
      schedule
    }),
    constructZoomFrameOpenedEvent({ basis, zoomFrame })
  );
  return Object.freeze({
    workspaceRoot,
    basis,
    inputBinding,
    designAllocation,
    ledger,
    schedule,
    zoomFrame,
    manifest,
    events
  });
}

async function materializeAndEmit({ harness, content }) {
  await writeText(harness.designAllocation.materializationUri, content);
  harness.events.push(
    constructOutputMaterializationObservedEvent({
      basis: harness.basis,
      vectorIndex: 0,
      allocation: harness.designAllocation,
      materializedRef: `materialized://t100-five-rule/${stableTimestamp()}`,
      materializedPath: harness.designAllocation.materializationUri,
      digest: sha256(content),
      observerRef: "observer://t100-five-rule/local",
      artifactRefs: [`artifact://t100-five-rule/${harness.designAllocation.outputName}`]
    })
  );
}

function admitAndEmitAssessment({ harness, item, attemptIndex, evaluation, fpStatus }) {
  // Map domain/F_P findingClass to the status enum while carrying the richer
  // finding class directly in the assessment carrier.
  const status =
    fpStatus !== undefined
      ? fpStatus
      : evaluation.findingClass === "fulfilled"
        ? "fulfilled"
        : evaluation.findingClass === "traceability_reference_gap"
          ? "partial"
          : "blocked";
  const assessment = admitScheduledSliceAssessment({
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    assessmentId: `assessment://t100-five-rule/${item.obligationId}/${attemptIndex}`,
    scheduleItemId: item.scheduleItemId,
    obligationId: item.obligationId,
    attemptIndex,
    status,
    assessmentRegime: "F_P",
    findingClass: evaluation.findingClass,
    evidenceRefs:
      status === "fulfilled" ? evaluation.evidenceRefs : Object.freeze([]),
    outputRefs:
      status === "fulfilled"
        ? [harness.designAllocation.assetRef]
        : Object.freeze([]),
    runtimeFailureClass: null,
    detail: evaluation.reason
  });
  harness.events.push(
    constructScheduledSliceAssessedEvent({
      basis: harness.basis,
      zoomFrame: harness.zoomFrame,
      assessment
    })
  );
  return assessment;
}

// =====================================================================
// R1 — Five-term `edge_converged` predicate exposed as named conjuncts
// =====================================================================
// Python: fulfillment_ledger.py:115-124.
test("R1 five-rule algebra: ZoomFoldbackEvaluation exposes the five named conjuncts", async (t) => {
  const runRoot = path.join(TEST_RUNS_ROOT, stableTimestamp(), "r1_named_conjuncts");
  const harness = await buildHarness({ runRoot });
  let designContent;
  if (liveEnabled() && liveAgentKey() === "claude") {
    try {
      designContent = await liveProduceDesign({ archiveRoot: runRoot });
    } catch (error) {
      // Live transport unavailable; fall back to controlled fixture so the
      // algebra assertion still runs. Document in archive.
      await writeJson(path.join(runRoot, "live-fp-fallback.json"), {
        reason: error instanceof Error ? error.message : String(error)
      });
      designContent = fpControlledHappyPathDesign();
    }
  } else {
    t.diagnostic("CODEX_LIVE_FP not set; using controlled F_P fixture for R1");
    designContent = fpControlledHappyPathDesign();
  }
  await materializeAndEmit({ harness, content: designContent });
  for (const item of harness.schedule.items) {
    const evaluation = await assessDesignRequirementWithDomainQuality({
      designPath: harness.designAllocation.materializationUri,
      item,
      attemptIndex: 0
    });
    admitAndEmitAssessment({
      harness,
      item,
      attemptIndex: 0,
      evaluation
    });
  }
  const foldback = deriveZoomFoldbackEvaluationFromEvents({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    events: harness.events
  });
  harness.events.push(
    constructZoomFoldbackEvaluatedEvent({
      basis: harness.basis,
      zoomFrame: harness.zoomFrame,
      foldback
    })
  );
  const outer = deriveOuterTraversalEvaluation({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    foldback
  });
  await writeJson(path.join(runRoot, "foldback.json"), foldback);
  await writeJson(path.join(runRoot, "outer.json"), outer);

  // Assert all five conjuncts are exposed as named ledger fields.
  // Per Python fulfillment_ledger.py:115-124:
  //   edge_converged = carry_converged AND fulfillment_converged AND admitted
  //                    AND target_certification_passed AND fd_recheck_passed
  assert.ok(
    "carryConverged" in foldback,
    "R1 violation: foldback missing named field `carryConverged` " +
      "(fulfillment_ledger.py:115-124). " +
      "ZoomFoldbackEvaluation exposes count fields only — " +
      "see workspace_zoom_foldback.ts:136-154."
  );
  assert.ok(
    "fulfillmentConverged" in foldback,
    "R1 violation: foldback missing named field `fulfillmentConverged`."
  );
  assert.ok(
    "admitted" in foldback,
    "R1 violation: foldback missing named field `admitted`."
  );
  assert.ok(
    "targetCertificationPassed" in foldback,
    "R1 violation: foldback missing named field `targetCertificationPassed`."
  );
  assert.ok(
    "fdRecheckPassed" in foldback,
    "R1 violation: foldback missing named field `fdRecheckPassed`."
  );
  // The closure decision must be the explicit five-term conjunction.
  const expected =
    Boolean(foldback.carryConverged) &&
    Boolean(foldback.fulfillmentConverged) &&
    Boolean(foldback.admitted) &&
    Boolean(foldback.targetCertificationPassed) &&
    Boolean(foldback.fdRecheckPassed);
  assert.equal(
    foldback.decision === "close",
    expected,
    "R1 violation: foldback.decision === 'close' must equal the five-term conjunction " +
      "carryConverged AND fulfillmentConverged AND admitted AND " +
      "targetCertificationPassed AND fdRecheckPassed."
  );
});

// =====================================================================
// R2 — Latest-`assessed{kind:fp}`-per-slice projection
// =====================================================================
// Python: fulfillment_ledger.py:146-258, interpret.py:2074-2076.
// The projection reads latest domain/F_P assessment per slice. Earlier
// assessments remain in event history but do not union into current closure.
test("R2 five-rule algebra: latest-assessed-per-slice projection (recovery overrides prior gap)", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, stableTimestamp(), "r2_latest_per_slice");
  const harness = await buildHarness({ runRoot });

  // Attempt 1: REQ-FIVE-001 missing — design lacks the obligation entirely.
  // Domain/F_P quality assessment classifies it as semantic_fulfillment_gap
  // (status: blocked).
  // REQ-FIVE-002 and REQ-FIVE-003 are fulfilled by the no-mention design.
  await materializeAndEmit({ harness, content: fpControlledNoMentionDesign() });
  for (const item of harness.schedule.items) {
    const evaluation = await assessDesignRequirementWithDomainQuality({
      designPath: harness.designAllocation.materializationUri,
      item,
      attemptIndex: 0
    });
    admitAndEmitAssessment({ harness, item, attemptIndex: 0, evaluation });
  }

  // Attempt 2: full happy-path design — all three obligations now behaviorally
  // fulfilled (a re-run produced a recovered design after the gap on attempt 1).
  await materializeAndEmit({ harness, content: fpControlledHappyPathDesign() });
  for (const item of harness.schedule.items) {
    const evaluation = await assessDesignRequirementWithDomainQuality({
      designPath: harness.designAllocation.materializationUri,
      item,
      attemptIndex: 1
    });
    assert.equal(
      evaluation.findingClass,
      "fulfilled",
      `attempt 2 obligation ${item.obligationId} should be fulfilled; got ${evaluation.findingClass}: ${evaluation.reason}`
    );
    admitAndEmitAssessment({ harness, item, attemptIndex: 1, evaluation });
  }

  const foldback = deriveZoomFoldbackEvaluationFromEvents({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    events: harness.events
  });
  await writeJson(path.join(runRoot, "foldback.json"), foldback);

  // Per Python interpret.py:2074-2076, projection takes the LATEST assessed-fp
  // event per slice. Latest for every obligation = fulfilled → decision=close.
  assert.equal(
    foldback.decision,
    "close",
    "R2 violation: latest-assessed-per-slice projection must close when the " +
      "latest assessment for every slice is fulfilled. Python parity: " +
      "fulfillment_ledger.py:146-258, " +
      "interpret.py:2074-2076 — only the latest assessed{kind:fp} event " +
      "per slice contributes to current projection truth. " +
      "The prior assessment must remain in event history without blocking " +
      "closure when superseded by a later fulfilled assessment."
  );
  // The prior blocked assessment must still be recoverable from event-history.
  const replayed = deriveScheduledSliceAssessmentsFromEvents({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    events: harness.events
  });
  const req001Item = harness.schedule.items.find(
    (s) => s.obligationId === "REQ-FIVE-001"
  );
  const req001Assessments = replayed.filter(
    (a) => a.scheduleItemId === req001Item.scheduleItemId
  );
  assert.ok(
    req001Assessments.some((a) => a.attemptIndex === 0 && a.status !== "fulfilled"),
    "R2: prior non-fulfilled assessment must remain in event-history."
  );
  assert.ok(
    req001Assessments.some((a) => a.attemptIndex === 1 && a.status === "fulfilled"),
    "R2: later fulfilled assessment must be admitted."
  );
});

// =====================================================================
// R3 — Retry allowlist {transport_failure, no_output, contract_failure}
// =====================================================================
// Python: continuation.py:10-14.
test("R3 five-rule algebra: retry allowlist gates worker-runtime failure separately from semantic gap", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, stableTimestamp(), "r3_retry_allowlist");
  const harness = await buildHarness({ runRoot });

  // Materialize a design that's missing REQ-FIVE-001 entirely.
  // This is a SEMANTIC gap, not a runtime failure.
  await materializeAndEmit({ harness, content: fpControlledNoMentionDesign() });
  const semanticEvaluations = [];
  for (const item of harness.schedule.items) {
    const evaluation = await assessDesignRequirementWithDomainQuality({
      designPath: harness.designAllocation.materializationUri,
      item,
      attemptIndex: 0
    });
    semanticEvaluations.push(evaluation);
    admitAndEmitAssessment({ harness, item, attemptIndex: 0, evaluation });
  }

  // Assertion 1 — semantic gaps must NOT carry runtimeFailureClass.
  const replayed = deriveScheduledSliceAssessmentsFromEvents({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    events: harness.events
  });
  for (const assessment of replayed) {
    if (assessment.status !== "fulfilled" && assessment.status !== "runtime_failed") {
      assert.equal(
        assessment.runtimeFailureClass,
        null,
        `R3 violation: semantic-gap assessment for ${assessment.obligationId} ` +
          `must not carry runtimeFailureClass; saw ${assessment.runtimeFailureClass}.`
      );
    }
  }

  // Assertion 2 — when a runtime failure IS admitted with a class, that class
  // must come from the Python allowlist {transport_failure, no_output,
  // contract_failure}. Try admitting `transport_failure`. The current TS
  // vocabulary does not include this string, so admission fails — the
  // allowlist itself is missing.
  let admitFailed = false;
  let admitError = null;
  try {
    admitScheduledSliceAssessment({
      zoomFrame: harness.zoomFrame,
      schedule: harness.schedule,
      assessmentId: `assessment://t100-five-rule/runtime/${stableTimestamp()}`,
      scheduleItemId: harness.schedule.items[0].scheduleItemId,
      obligationId: harness.schedule.items[0].obligationId,
      attemptIndex: 99,
      status: "runtime_failed",
      evidenceRefs: [],
      outputRefs: [],
      runtimeFailureClass: "transport_failure",
      detail: "simulated transport failure for R3 allowlist check"
    });
  } catch (error) {
    admitFailed = true;
    admitError = error instanceof Error ? error.message : String(error);
  }
  assert.equal(
    admitFailed,
    false,
    `R3 violation: 'transport_failure' (Python allowlist member, ` +
      `continuation.py:10-14) must be a lawful runtimeFailureClass value; ` +
      `current admission rejected with: ${admitError ?? "n/a"}. ` +
      `TS vocabulary at carriers.ts:18-23 differs from Python source-of-truth.`
  );

  // Assertion 3 — the retry decision must reference the allowlist explicitly.
  // The foldback carrier exposes the retry allowlist so worker-runtime retry
  // stays separate from semantic gap pressure.
  const foldback = deriveZoomFoldbackEvaluationFromEvents({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    events: harness.events
  });
  await writeJson(path.join(runRoot, "foldback.json"), foldback);
  assert.deepEqual(
    foldback.retryAllowlist,
    PYTHON_RETRY_ALLOWLIST,
    "R3 violation: foldback must expose the typed retry allowlist " +
      `{transport_failure, no_output, contract_failure}. ` +
      "Runtime retry must not be inferred from ledger absence or semantic gap state."
  );
});

// =====================================================================
// R4 — Artifact salvage on transport failure
// =====================================================================
// Python: dispatch_runtime.py:433-440.
test("R4 five-rule algebra: artifact salvage admits valid artifact when transport failed after write", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, stableTimestamp(), "r4_artifact_salvage");
  const harness = await buildHarness({ runRoot });

  // F_P writes a valid materialized artifact, THEN throws transport_failure
  // (e.g. simulated SIGTERM after write). The artifact is independently
  // valid (digest+schema+target match) so it should be salvageable.
  await materializeAndEmit({ harness, content: fpControlledHappyPathDesign() });

  // Domain/F_P quality assessment evaluates the salvaged artifact; all obligations are
  // materially fulfilled.
  const item = harness.schedule.items[0];
  const evaluation = await assessDesignRequirementWithDomainQuality({
    designPath: harness.designAllocation.materializationUri,
    item,
    attemptIndex: 0
  });
  assert.equal(
    evaluation.findingClass,
    "fulfilled",
    `R4 setup: artifact must be behaviorally fulfilled; got ${evaluation.findingClass}.`
  );

  // Admit a salvaged-fulfilled assessment: status === "fulfilled" AND
  // runtimeFailureClass === "transport_failure". Per Python
  // dispatch_runtime.py:433-440 this is the legal salvage path.
  let salvageAccepted = true;
  let salvageError = null;
  try {
    admitScheduledSliceAssessment({
      zoomFrame: harness.zoomFrame,
      schedule: harness.schedule,
      assessmentId: `assessment://t100-five-rule/salvage/${item.obligationId}`,
      scheduleItemId: item.scheduleItemId,
      obligationId: item.obligationId,
      attemptIndex: 0,
      status: "fulfilled",
      evidenceRefs: evaluation.evidenceRefs,
      outputRefs: [harness.designAllocation.assetRef],
      runtimeFailureClass: "transport_failure",
      detail: "salvaged: artifact valid despite transport SIGTERM"
    });
  } catch (error) {
    salvageAccepted = false;
    salvageError = error instanceof Error ? error.message : String(error);
  }
  assert.equal(
    salvageAccepted,
    true,
    `R4 violation: salvage path is structurally inexpressible. ` +
      `admitScheduledSliceAssessment rejected fulfilled+runtimeFailureClass ` +
      `with: ${salvageError ?? "n/a"}. ` +
      `Python parity: dispatch_runtime.py:433-440 — when a transport failure ` +
      `occurs AFTER a valid artifact has been written, the artifact is ` +
      `salvaged; the carrier must support fulfilled status with a typed ` +
      `transport_failure annotation.`
  );
});

// =====================================================================
// R5 — Behavioral-vs-lexical observation finding-class split
// =====================================================================
// Python: gtl_module.py:536-540.
test("R5 five-rule algebra: behavioral vs lexical finding-class split is preserved", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, stableTimestamp(), "r5_finding_class_split");
  const harness = await buildHarness({ runRoot });

  // Phase A: design contains REQ-FIVE-001 marker but section is a placeholder
  // (TBD). Domain/F_P quality assessment returns traceability_reference_gap.
  await materializeAndEmit({
    harness,
    content: fpControlledTraceabilityOnlyDesign()
  });
  const itemA = harness.schedule.items.find(
    (s) => s.obligationId === "REQ-FIVE-001"
  );
  const evalA = await assessDesignRequirementWithDomainQuality({
    designPath: harness.designAllocation.materializationUri,
    item: itemA,
    attemptIndex: 0
  });
  assert.equal(
    evalA.findingClass,
    "traceability_reference_gap",
    `R5 setup: design with marker-only section should be classified as ` +
      `traceability_reference_gap; got ${evalA.findingClass}.`
  );
  const assessmentA = admitAndEmitAssessment({
    harness,
    item: itemA,
    attemptIndex: 0,
    evaluation: evalA
  });

  // Phase B: design contains no mention of REQ-FIVE-001.
  // Domain/F_P quality assessment returns semantic_fulfillment_gap.
  await materializeAndEmit({
    harness,
    content: fpControlledNoMentionDesign()
  });
  const evalB = await assessDesignRequirementWithDomainQuality({
    designPath: harness.designAllocation.materializationUri,
    item: itemA,
    attemptIndex: 1
  });
  assert.equal(
    evalB.findingClass,
    "semantic_fulfillment_gap",
    `R5 setup: design without obligation reference should be classified as ` +
      `semantic_fulfillment_gap; got ${evalB.findingClass}.`
  );
  const assessmentB = admitAndEmitAssessment({
    harness,
    item: itemA,
    attemptIndex: 1,
    evaluation: evalB
  });

  await writeJson(path.join(runRoot, "phase_a_assessment.json"), assessmentA);
  await writeJson(path.join(runRoot, "phase_b_assessment.json"), assessmentB);

  // The carrier must preserve the finding-class split beside the generic
  // status enum.
  assert.ok(
    "findingClass" in assessmentA,
    `R5 violation: assessment carrier missing 'findingClass' field. ` +
      `Python parity: gtl_module.py:536-540 — semantic_fulfillment_gap and ` +
      `traceability_reference_gap are distinct observation classes. ` +
      `ScheduledSliceAssessment must not collapse this into a generic status enum.`
  );
  assert.ok(
    FINDING_CLASS_VALUES.includes(assessmentA.findingClass),
    `R5 violation: assessmentA.findingClass must be one of ` +
      `${FINDING_CLASS_VALUES.join(", ")}; got ${assessmentA.findingClass}.`
  );
  assert.notEqual(
    assessmentA.findingClass,
    assessmentB.findingClass,
    `R5 violation: traceability_reference_gap and semantic_fulfillment_gap ` +
      `must be distinct in the foldback algebra. ` +
      `Phase A findingClass = ${assessmentA.findingClass}; ` +
      `Phase B findingClass = ${assessmentB.findingClass}. ` +
      `Closure decisions must be able to distinguish them per ` +
      `gtl_module.py:536-540.`
  );

  // Foldback must surface the split so closure decisions can act on it.
  const foldback = deriveZoomFoldbackEvaluationFromEvents({
    basis: harness.basis,
    zoomFrame: harness.zoomFrame,
    schedule: harness.schedule,
    events: harness.events
  });
  await writeJson(path.join(runRoot, "foldback.json"), foldback);
  assert.ok(
    "traceabilityReferenceGapCount" in foldback ||
      "findingClassCounts" in foldback,
    `R5 violation: foldback must expose finding-class counts (one of: ` +
      `traceabilityReferenceGapCount, findingClassCounts).`
  );
});

// Emit a final summary archive for cross-test traceability.
test("R0 five-rule algebra: emit run summary across cases", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, "summary");
  await mkdir(runRoot, { recursive: true });
  await writeJson(path.join(runRoot, "summary.json"), {
    scenario: "t100_five_rule_algebra",
    timestamp: stableTimestamp(),
    rulesUnderTest: ["R1", "R2", "R3", "R4", "R5"],
    pythonReferences: {
      R1: "fulfillment_ledger.py:115-124",
      R2: "fulfillment_ledger.py:146-258, interpret.py:2074-2076",
      R3: "continuation.py:10-14",
      R4: "dispatch_runtime.py:433-440",
      R5: "gtl_module.py:536-540"
    },
    pythonRetryAllowlist: PYTHON_RETRY_ALLOWLIST,
    pythonFindingClasses: FINDING_CLASS_VALUES,
    notes: [
      "tests assert corrected algebra for the T-100 closure gate."
    ]
  });
  // Trivial assertion — emit() ensures the test surface registers cleanly.
  emit([], () => {});
  assert.ok(true);
});
