// Validates: T-101
// Validates: T-107
// Validates: REQ-L-GTL3-GRAPHVECTOR-005
// Validates: REQ-R-ABG3-CONTINUATION
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-P-QUAL
//
// Mini data-mapper typed traversal schemes live lane.
//
// This is intentionally live-only. Backend readiness, transport failure,
// malformed artifacts, and semantic F_P failure are not skipped or softened
// here. A failure in this lane is release-blocking evidence for the RC7 typed
// traversal carrier path over the existing mini data-mapper lifecycle.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitExecutionBasis,
  admitModule,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "../../build/semantic/code/src/index.js";
import {
  admitTraversalAttemptProgressRow,
  assertTraversalModulationSummaryAgreement,
  constructAgenticBackendProgressProfile,
  deriveTraversalAttemptEnvelope,
  deriveTraversalModulationAssuranceProjection,
  deriveTraversalModulationProfileFromGtl,
  deriveTraversalModulationSummary,
  resolveTraversalStrategyDirectiveFromGtl
} from "../../build/semantic/code/src/abg/m03/index.js";

import {
  EDGE_DEFS,
  buildMiniDmReduxModule
} from "./mini_dm_redux/module.mjs";
import {
  loadOrInitState,
  runEdge,
  workspaceLayout
} from "./mini_dm_redux/run.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t107_mini_dm_traversal_schemes_live"
);

function timestampId() {
  return new Date().toISOString().replaceAll(/[-:.]/gu, "");
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze(value)
    })
  });
}

function hookEntry(key, input) {
  const configEntries = [
    scalarEntry("strategy_owner_ref", input.ownerRef ?? "product://data-mapper"),
    scalarEntry("strategy_label", input.label),
    stringListEntry("enforcement_primitives", input.primitives)
  ];
  if (input.directiveRef !== undefined) {
    configEntries.push(scalarEntry("directive_ref", input.directiveRef));
  }
  if (input.obligationScheduleRefs !== undefined) {
    configEntries.push(
      stringListEntry("obligation_schedule_refs", input.obligationScheduleRefs)
    );
  }
  if (input.targetItemCount !== undefined) {
    configEntries.push(scalarEntry("target_item_count", input.targetItemCount));
  }
  if (input.maxItemCount !== undefined) {
    configEntries.push(scalarEntry("max_item_count", input.maxItemCount));
  }
  if (input.orderingConstraintRefs !== undefined) {
    configEntries.push(
      stringListEntry("ordering_constraint_refs", input.orderingConstraintRefs)
    );
  }
  if (input.phaseGateRefs !== undefined) {
    configEntries.push(stringListEntry("phase_gate_refs", input.phaseGateRefs));
  }
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: input.ref,
        config: attrs(configEntries)
      })
    })
  });
}

function roleWithPolicyHooks(id, policyHooks) {
  return Object.freeze({
    id,
    name: id,
    tags: Object.freeze([]),
    policyHooks
  });
}

function withDeclarations(carrier, declarations) {
  return Object.freeze({
    ...carrier,
    declarations
  });
}

function liveAgentKey() {
  return process.env["ABG_TS_LIVE_AGENT"] ?? "codex";
}

function backendProfile() {
  const agentKey = liveAgentKey();
  return constructAgenticBackendProgressProfile({
    backendKind: agentKey === "codex" ? "codex" : "generic_process",
    profileRef: `backend-profile://t107-mini-dm/${agentKey}`,
    processProtocolSignals: ["process_started", "ack"],
    streamProgressSignals: ["stdout_chunk"],
    declaredArtifactProgressSignals: ["progress_report"],
    finalOutputMayBeBuffered: agentKey === "codex",
    progressSignalRequiredBeforeInactivityMs: 1000
  });
}

function edgeDefByName(name) {
  const edgeDef = EDGE_DEFS.find((entry) => entry.name === name);
  assert.notEqual(edgeDef, undefined, `unknown mini data-mapper edge ${name}`);
  return edgeDef;
}

function scheduleRefsFor(edgeDef) {
  return edgeDef.obligationIds.map(
    (obligationId) => `schedule://t107-mini-dm/${edgeDef.name}/${obligationId}`
  );
}

function moduleForEdge(edgeDef, graphFunction) {
  return admitModule({
    name: `t107_mini_dm_${edgeDef.name}_module`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: `job:t107-mini-dm/${edgeDef.name}`,
        name: `t107_mini_dm_${edgeDef.name}_job`,
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t107", "mini-dm-redux", "traversal-schemes-live"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
}

function basisForEdge(edgeDef) {
  const built = buildMiniDmReduxModule();
  const graphFunction = built.perEdgeGraphFunctions[edgeDef.name];
  assert.notEqual(graphFunction, undefined);
  const module = moduleForEdge(edgeDef, graphFunction);
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: `/workspace/t107-mini-dm/${edgeDef.name}`,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: `worker://t107-mini-dm/${liveAgentKey()}`,
      backendId: `backend://t107-mini-dm/${liveAgentKey()}`,
      buildId: "build://abiogenesis/typescript/rc7",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript/rc7-live"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t107-mini-dm/live-fp",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t107-mini-dm/live-fp",
      approvalSubjectRef: null
    }),
    runId: `run://t107-mini-dm/${edgeDef.name}`,
    workKey: `wk://t107-mini-dm/${edgeDef.name}`,
    frameId: null,
    frameLineageId: null
  });
}

function schemeFor(edgeName) {
  const edgeDef = edgeDefByName(edgeName);
  const scheduleRefs = scheduleRefsFor(edgeDef);
  if (edgeName === "derive_field_spec") {
    return Object.freeze({
      edgeName,
      qualifierSource: "graph_vector_declarations",
      selectedScheduleItemRefs: [scheduleRefs[0]],
      vectorDeclarations: attrs([
        hookEntry("abg.traversal_modulation", {
          ref: "strategy://data-mapper/single-field-steel-thread",
          label: "single_field_steel_thread",
          primitives: ["single_vertical_slice"],
          obligationScheduleRefs: scheduleRefs,
          phaseGateRefs: ["gate://data-mapper/field-spec-first-slice-review"]
        })
      ]),
      graphFunctionDeclarations: attrs([
        hookEntry("abg.default_traversal_modulation", {
          ref: "strategy://data-mapper/default-batch",
          label: "default_batch",
          primitives: ["bounded_batch"],
          obligationScheduleRefs: scheduleRefs,
          targetItemCount: 2,
          maxItemCount: 2
        })
      ]),
      roles: Object.freeze([]),
      batch: { targetItemCount: 3, maxItemCount: 3 }
    });
  }
  if (edgeName === "derive_implementation") {
    return Object.freeze({
      edgeName,
      qualifierSource: "graph_function_declarations",
      selectedScheduleItemRefs: [scheduleRefs[0], scheduleRefs[1]],
      vectorDeclarations: attrs(),
      graphFunctionDeclarations: attrs([
        hookEntry("abg.default_traversal_modulation", {
          ref: "strategy://data-mapper/implementation-bounded-batch",
          label: "implementation_bounded_batch",
          primitives: ["bounded_batch", "ordered_schedule_prefix"],
          obligationScheduleRefs: scheduleRefs,
          targetItemCount: 2,
          maxItemCount: 2,
          orderingConstraintRefs: ["order://data-mapper/field-obligation-order"]
        })
      ]),
      roles: Object.freeze([]),
      batch: { targetItemCount: 2, maxItemCount: 2 }
    });
  }
  return Object.freeze({
    edgeName,
    qualifierSource: "role_policy_hooks",
    selectedScheduleItemRefs: [scheduleRefs.at(-1)],
    vectorDeclarations: attrs(),
    graphFunctionDeclarations: attrs(),
    roles: Object.freeze([
      roleWithPolicyHooks(
        "role://data-mapper/validation-reviewer",
        attrs([
          hookEntry("abg.traversal_modulation", {
            ref: "strategy://data-mapper/agent-proposed-validation-slice",
            label: "agent_proposed_validation_slice",
            primitives: ["agent_proposed_slice_requires_admission"],
            obligationScheduleRefs: scheduleRefs
          })
        ])
      )
    ]),
    proposedScheduleItemRefs: [scheduleRefs.at(-1)],
    proposedSliceAdmissionEvidenceRefs: [
      "evidence://data-mapper/validation-slice-admitted"
    ],
    batch: { targetItemCount: 1, maxItemCount: 1 }
  });
}

function deriveCarrierSet(edgeDef, scheme) {
  const basis = basisForEdge(edgeDef);
  const vector = withDeclarations(basis.graph.vectors[0], scheme.vectorDeclarations);
  const graphFunction = withDeclarations(
    basis.graphFunction,
    scheme.graphFunctionDeclarations
  );
  const resolution = resolveTraversalStrategyDirectiveFromGtl({
    vector,
    graphFunction,
    roles: scheme.roles
  });
  const profile = deriveTraversalModulationProfileFromGtl({
    basis,
    vector,
    graphFunction,
    roles: scheme.roles,
    vectorIndex: 0,
    backendProfile: backendProfile(),
    obligationScheduleRefs: scheduleRefsFor(edgeDef),
    batch: scheme.batch,
    progressContract: {
      progressArtifactRequired: true,
      allowedProgressArtifactKinds: ["progress_report"]
    },
    continuation: {
      sameEdgeUntil: "foldback_closed",
      maxAttemptsWithoutNewSignal: 1,
      maxTotalAttempts: 3
    }
  });
  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: `actor://t107-mini-dm/${edgeDef.name}/${timestampId()}`,
    retryBudgetRemaining: 2,
    proposedScheduleItemRefs: scheme.proposedScheduleItemRefs,
    proposedSliceAdmissionEvidenceRefs: scheme.proposedSliceAdmissionEvidenceRefs,
    requiredProgressArtifactRefs: [
      `artifact://t107-mini-dm/${edgeDef.name}/progress-report`
    ]
  });
  return { basis, vector, graphFunction, resolution, profile, envelope };
}

function rowForStatus(envelope, edgeDef, status) {
  const scheduleItemRef = `schedule://t107-mini-dm/${edgeDef.name}/${status.obligationId}`;
  return admitTraversalAttemptProgressRow({
    envelope,
    scheduleItemRef,
    declaredOutcome: status.status === "fulfilled" ? "fulfilled" : "partial",
    artifactRefs: [`artifact://t107-mini-dm/${edgeDef.name}/${status.obligationId}`],
    evidenceRefs: [`evidence://t107-mini-dm/${edgeDef.name}/${status.obligationId}`],
    remainingWorkRefs:
      status.status === "fulfilled" ? [] : [scheduleItemRef],
    reviewRequired: status.status !== "fulfilled"
  });
}

function selectedStatuses(edgeDef, envelope, runResult) {
  const byScheduleRef = new Map(
    runResult.obligationStatuses.map((status) => [
      `schedule://t107-mini-dm/${edgeDef.name}/${status.obligationId}`,
      status
    ])
  );
  return envelope.selectedScheduleItemRefs.map((scheduleItemRef) => {
    const status = byScheduleRef.get(scheduleItemRef);
    assert.notEqual(
      status,
      undefined,
      `SEV1: missing live data-mapper obligation status for ${scheduleItemRef}`
    );
    return status;
  });
}

async function runLiveEdgeWithScheme(edgeName, layout, state, reportRoot) {
  const edgeDef = edgeDefByName(edgeName);
  const scheme = schemeFor(edgeName);
  const carriers = deriveCarrierSet(edgeDef, scheme);

  assert.equal(carriers.resolution.source, scheme.qualifierSource);
  assert.deepEqual(
    carriers.envelope.selectedScheduleItemRefs,
    scheme.selectedScheduleItemRefs
  );

  await writeJson(path.join(reportRoot, `${edgeName}.preflight_carriers.json`), {
    edgeName,
    scheme,
    resolution: carriers.resolution,
    profile: carriers.profile,
    envelope: carriers.envelope
  });

  const runResult = await runEdge(edgeName, layout, state);
  assert.equal(
    runResult.workerMode,
    "live",
    "SEV1: typed traversal live lane must use a real live F_P worker"
  );
  assert.equal(
    runResult.fdEnvelopeOk,
    true,
    `SEV1: ${edgeName} F_D materialization envelope failed`
  );

  for (const status of runResult.obligationStatuses) {
    assert.equal(
      status.status,
      "fulfilled",
      `SEV1: ${edgeName} live semantic obligation failed: ${JSON.stringify(status)}`
    );
  }

  const progressRows = selectedStatuses(edgeDef, carriers.envelope, runResult).map(
    (status) => rowForStatus(carriers.envelope, edgeDef, status)
  );
  const projection = deriveTraversalModulationAssuranceProjection({
    envelope: carriers.envelope,
    progressRows
  });
  const summary = deriveTraversalModulationSummary(projection);
  assert.doesNotThrow(() =>
    assertTraversalModulationSummaryAgreement({ projection, summary })
  );
  assert.equal(
    projection.action,
    "foldback_ready",
    `SEV1: ${edgeName} typed traversal carrier did not reach foldback_ready`
  );

  await writeJson(path.join(reportRoot, `${edgeName}.postflight_carriers.json`), {
    edgeName,
    obligationStatuses: runResult.obligationStatuses,
    progressRows,
    projection,
    summary
  });
}

test("T-107 mini data-mapper live lane exercises alternate typed traversal schemes", async () => {
  assert.equal(
    process.env["CODEX_LIVE_FP"],
    "1",
    "SEV1: run this lane live with CODEX_LIVE_FP=1; fixture mode is not allowed"
  );

  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  const workspaceRoot = path.join(runRoot, "workspace");
  const reportRoot = path.join(runRoot, "typed_traversal_reports");
  await mkdir(reportRoot, { recursive: true });

  await writeJson(path.join(runRoot, "run.json"), {
    runKind: "t107_mini_data_mapper_traversal_schemes_live",
    liveAgentKey: liveAgentKey(),
    edgeNames: EDGE_DEFS.map((entry) => entry.name),
    startedAt: new Date().toISOString()
  });

  const layout = workspaceLayout(workspaceRoot);
  const state = await loadOrInitState(layout, {
    runId: `t107-mini-dm-traversal-schemes/${timestampId()}`
  });

  await runLiveEdgeWithScheme("derive_field_spec", layout, state, reportRoot);
  await runLiveEdgeWithScheme("derive_implementation", layout, state, reportRoot);
  await runLiveEdgeWithScheme("derive_validation", layout, state, reportRoot);
});
