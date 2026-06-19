// Validates: T-129
// Validates: temporal-runtime-substrate

import test from "node:test";
import assert from "node:assert/strict";

import {
  TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES,
  TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  assertRuntimeEvent,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  constructDeadlineBreach,
  constructDeadlineBreachAdmittedEvent,
  constructFrameOpenedEvent,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructJob,
  constructModule,
  constructNode,
  constructGraphCallOpenedEvent,
  constructRuntimeActivityProbeObservedEvent,
  constructRuntimeExternalInterruptionObservedEvent,
  constructRuntimeSystemProbeContract,
  constructRuntimeWatchdogPolicy,
  constructScheduledContinuation,
  constructScheduledContinuationReopenedEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveRuntimeAggregateProjection,
  deriveRuntimeLivenessObserverProjection,
  deriveTemporalConstraintFromGtl,
  deriveTemporalHomeostaticProjection,
  deriveTemporalProjection,
  emptySerializedAttrs,
  edge,
  graphFunctionForVector,
  temporalProjectionHoldsEligibility,
  tryDeriveTemporalConstraintFromGtl
} from "@abiogenesis/typescript-tenant";

import {
  constructOddSdlcAbiogenesisExecutionBasis,
  deriveSdlcGapDossier,
  deriveOddSdlcEvaluateNextReport
} from "../../build/semantic/code/src/index.js";

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

function temporalHookEntry(namespace, overrides = {}) {
  const constraintRef =
    overrides.constraintRef ??
    `temporal-constraint://odd-sdlc/t129/${namespace}/edge0`;
  const schedulePolicyRef =
    overrides.schedulePolicyRef ??
    `schedule-policy://odd-sdlc/t129/${namespace}`;
  const timerProviderRef =
    overrides.timerProviderRef ??
    `timer-provider://odd-sdlc/t129/${namespace}`;
  const entries = [
    scalarEntry("constraint_ref", constraintRef),
    scalarEntry("operator", "not_before"),
    scalarEntry(
      "not_before_ref",
      overrides.notBeforeRef ?? "instant://2026-05-07T00:00:00Z"
    ),
    scalarEntry("schedule_policy_ref", schedulePolicyRef),
    scalarEntry("timer_provider_ref", timerProviderRef),
    scalarEntry(
      "deadline_breach_action",
      overrides.deadlineBreachAction ?? "observe_drift"
    )
  ];
  if (overrides.deadlineRef !== undefined) {
    entries.push(scalarEntry("deadline_ref", overrides.deadlineRef));
  }

  return Object.freeze({
    key: "abg.temporal_constraint",
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: constraintRef,
        config: attrs(entries)
      })
    })
  });
}

function typedNode(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `schema://odd_sdlc/t129/${kind}` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`t129:${kind}:standard`],
      outputContractRefs: [`t129:${kind}:contract`]
    },
    tags: ["t129", "odd_sdlc", kind]
  });
}

function buildOddSdlcAbg37Basis(input) {
  const source = typedNode(
    `node:t129/${input.name}/source`,
    `${input.name}_source`,
    "source",
    "declared"
  );
  const target = typedNode(
    `node:t129/${input.name}/target`,
    `${input.name}_target`,
    "target",
    "eligible"
  );
  const graph = edge([source], target, {
    id: `vector:t129/${input.name}/source-to-target`,
    name: `${input.name}_source_to_target`,
    evaluators: [
      {
        name: `${input.name}_target_ready`,
        regime: "F_P",
        description: "target accepted",
        binding: `binding://odd-sdlc/t129/${input.name}`,
        tags: ["t129", input.name]
      }
    ],
    declarations: input.declarations,
    tags: ["t129", "odd_sdlc", input.name]
  });
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const graphFunction = graphFunctionForVector(vector, {
    name: `${input.name}_graph_function`,
    declarations: attrs(),
    tags: ["t129", "odd_sdlc", input.name]
  });
  const module = admitModule({
    name: `${input.name}_module`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: `job:t129/${input.name}`,
        name: `${input.name}_job`,
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t129", "odd_sdlc", input.name]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: attrs()
  });
  const basis = admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: `/workspace/odd-sdlc/t129/${input.name}`,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    },
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: `worker://odd-sdlc/t129/${input.name}`,
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: `policy://odd-sdlc/t129/${input.name}`,
      defaultRegime: "F_P",
      dispatchRef: `dispatch://odd-sdlc/t129/${input.name}`,
      approvalSubjectRef: null
    }),
    runId: `run://odd-sdlc/t129/${input.name}`,
    workKey: `wk://odd-sdlc/t129/${input.name}`,
    frameId: null,
    frameLineageId: null
  });
  const publishedVector = basis.graph.vectors[0];
  assert.notEqual(publishedVector, undefined);
  return Object.freeze({ basis, vector: publishedVector });
}

function graphOpenedEvents(basis) {
  return [constructGraphCallOpenedEvent(basis), constructFrameOpenedEvent(basis)];
}

function firstEdgeName(basis) {
  const vector = basis.graph.vectors[0];
  assert.notEqual(vector, undefined);
  return vector.name;
}

function livenessPolicy(overrides = {}) {
  return constructRuntimeWatchdogPolicy({
    policyRef:
      overrides.policyRef ?? "policy://odd-sdlc/t129/runtime-liveness-test",
    startupSilenceLeaseMs: overrides.startupSilenceLeaseMs ?? 100,
    inactivityLeaseMs: overrides.inactivityLeaseMs ?? 3_000,
    terminationGraceMs: overrides.terminationGraceMs ?? 500,
    hardSafetyCapMs: overrides.hardSafetyCapMs ?? null,
    nowElapsedMs: overrides.nowElapsedMs ?? null,
    retryBudgetRemaining: overrides.retryBudgetRemaining ?? 1
  });
}

function runtimeProbeEvent(input) {
  return constructRuntimeActivityProbeObservedEvent({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: null,
    frameId: null,
    vectorIndex: 0,
    edge: firstEdgeName(input.basis),
    actorInvocationId: null,
    workerId: input.basis.runtimeIdentity.workerId,
    backendId: input.basis.runtimeIdentity.backendId,
    systemRef: "runtime-system://odd-sdlc/t129/liveness",
    probeRef: `runtime-probe://odd-sdlc/t129/${input.source}/${input.suffix}`,
    probeSource: input.source,
    activityRef: `${input.activityBaseRef}/${input.suffix}`,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.elapsedMs,
    evidenceRefs: [`${input.activityBaseRef}/${input.suffix}`],
    detail: input.detail ?? null,
    causationEventRefs: [],
    correlationId: "correlation://odd-sdlc/t129/liveness"
  });
}

function probeContractFor(event) {
  return constructRuntimeSystemProbeContract({
    probeRef: event.probeRef,
    systemRef: event.systemRef,
    source: event.probeSource,
    basisId: event.basisId,
    graphFunctionId: event.graphFunctionId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    actorInvocationId: event.actorInvocationId,
    evidenceRefs: event.evidenceRefs
  });
}

function publicGapNode(id, name, assetType) {
  return constructNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `schema://odd_sdlc/t129/${assetType}` },
    markov: [],
    assetSurface: {
      kind: assetType,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["t129", "public-gap-evaluator"]
  });
}

function publicGapVector(id, name, source, target) {
  return constructGraphVector({
    id,
    name,
    source: [source],
    target,
    operators: [
      {
        name: `${name}_fp_transform`,
        regime: "F_P",
        binding: "plugin://odd-sdlc/t129/public-gap-transform",
        tags: []
      }
    ],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: emptySerializedAttrs(),
    tags: ["t129", "public-gap-evaluator"]
  });
}

function publicGapsMultiCandidateBasis() {
  const inputA = publicGapNode(
    "node:t129/public-gaps/input-a",
    "InputA",
    "input_a"
  );
  const inputB = publicGapNode(
    "node:t129/public-gaps/input-b",
    "InputB",
    "input_b"
  );
  const alpha = publicGapNode(
    "node:t129/public-gaps/alpha",
    "AlphaSurface",
    "alpha_surface"
  );
  const release = publicGapNode(
    "node:t129/public-gaps/release-depth",
    "ReleaseDepthSurface",
    "release_depth_surface"
  );
  const alphaVector = publicGapVector(
    "derive_alpha_surface",
    "derive_alpha_surface",
    inputA,
    alpha
  );
  const releaseVector = publicGapVector(
    "derive_release_depth_surface",
    "derive_release_depth_surface",
    inputB,
    release
  );
  const graph = constructGraph({
    id: "graph:t129/public-gaps/multi-candidate",
    name: "t129_public_gaps_multi_candidate",
    inputs: [inputA, inputB],
    outputs: [alpha, release],
    nodes: [inputA, inputB, alpha, release],
    vectors: [alphaVector, releaseVector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t129", "public-gap-evaluator"]
  });
  const graphFunction = constructGraphFunction({
    id: "graph-function:t129/public-gaps/multi-candidate",
    name: "t129_public_gaps_multi_candidate",
    environment: {
      requires: [inputA, inputB],
      provides: [alpha, release],
      carries: [inputA, inputB, alpha, release]
    },
    inputs: [inputA, inputB],
    outputs: [alpha, release],
    template: {
      kind: "inline_graph",
      ref: "template://odd-sdlc/t129/public-gaps/multi-candidate",
      graph,
      version: null
    },
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: ["t129", "public-gap-evaluator"]
  });
  const job = constructJob({
    id: "job:t129/public-gaps/multi-candidate",
    name: "t129_public_gaps_multi_candidate_job",
    contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
    roles: [],
    tags: ["t129", "public-gap-evaluator"],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const module = constructModule({
    name: "t129_public_gaps_multi_candidate_module",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [job],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  return admitExecutionBasis({
    module,
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/odd-sdlc/t129/public-gaps",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    },
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/t129/public-gaps",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t129/public-gaps",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t129/public-gaps",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t129/public-gaps",
    workKey: "wk://odd-sdlc/t129/public-gaps",
    frameId: null,
    frameLineageId: null
  });
}

function publicGapsLexicalTrapBasis() {
  const inputA = publicGapNode(
    "node:t129/public-gaps/default/input-a",
    "InputA",
    "input_a"
  );
  const inputB = publicGapNode(
    "node:t129/public-gaps/default/input-b",
    "InputB",
    "input_b"
  );
  const zeta = publicGapNode(
    "node:t129/public-gaps/default/zeta",
    "ZetaSurface",
    "zeta_surface"
  );
  const alpha = publicGapNode(
    "node:t129/public-gaps/default/alpha",
    "AlphaSurface",
    "alpha_surface"
  );
  const zetaVector = publicGapVector(
    "derive_zeta_surface",
    "derive_zeta_surface",
    inputA,
    zeta
  );
  const alphaVector = publicGapVector(
    "derive_alpha_surface",
    "derive_alpha_surface",
    inputB,
    alpha
  );
  const graph = constructGraph({
    id: "graph:t129/public-gaps/default-follow",
    name: "t129_public_gaps_default_follow",
    inputs: [inputA, inputB],
    outputs: [zeta, alpha],
    nodes: [inputA, inputB, zeta, alpha],
    vectors: [zetaVector, alphaVector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t129", "public-gap-evaluator", "default-follow"]
  });
  const graphFunction = constructGraphFunction({
    id: "graph-function:t129/public-gaps/default-follow",
    name: "t129_public_gaps_default_follow",
    environment: {
      requires: [inputA, inputB],
      provides: [zeta, alpha],
      carries: [inputA, inputB, zeta, alpha]
    },
    inputs: [inputA, inputB],
    outputs: [zeta, alpha],
    template: {
      kind: "inline_graph",
      ref: "template://odd-sdlc/t129/public-gaps/default-follow",
      graph,
      version: null
    },
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: ["t129", "public-gap-evaluator", "default-follow"]
  });
  const job = constructJob({
    id: "job:t129/public-gaps/default-follow",
    name: "t129_public_gaps_default_follow_job",
    contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
    roles: [],
    tags: ["t129", "public-gap-evaluator", "default-follow"],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const module = constructModule({
    name: "t129_public_gaps_default_follow_module",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [job],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  return admitExecutionBasis({
    module,
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/odd-sdlc/t129/public-gaps-default-follow",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    },
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/t129/public-gaps-default-follow",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://odd-sdlc/t129/public-gaps-default-follow",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://odd-sdlc/t129/public-gaps-default-follow",
      approvalSubjectRef: null
    }),
    runId: "run://odd-sdlc/t129/public-gaps-default-follow",
    workKey: "wk://odd-sdlc/t129/public-gaps-default-follow",
    frameId: null,
    frameLineageId: null
  });
}

test("T-129 substrate boundary consumes ABIogenesis construction evaluator priority truth", () => {
  const basis = constructOddSdlcAbiogenesisExecutionBasis({
    workspaceRoot: "/workspace/odd-sdlc/t129/evaluator",
    defaultRegime: "F_P",
    runId: "run://odd-sdlc/t129/evaluator",
    workKey: "wk://odd-sdlc/t129/evaluator",
    frameId: null,
    frameLineageId: null
  });
  const priorityScheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://odd-sdlc/t129/release-first",
    sourcePolicyRef: "policy://odd-sdlc/t129/release-first",
    rules: Object.freeze([
      constructConstructionPriorityRule({
        priorityRuleRef: "priority-rule://odd-sdlc/t129/release-depth",
        axis: "release_blocking",
        weight: 20,
        appliesToActionKinds: Object.freeze(["continue_graph_call"]),
        appliesToOutcomeRefs: Object.freeze([
          "outcome://odd-sdlc/t129/release-depth"
        ]),
        sourcePolicyRef: "policy://odd-sdlc/t129/release-first",
        strategyLabel: "release_depth_first"
      })
    ])
  });
  const report = deriveOddSdlcEvaluateNextReport({
    basis,
    events: graphOpenedEvents(basis),
    episodeId: "construction-episode://odd-sdlc/t129/evaluator",
    observationId: "construction-observation://odd-sdlc/t129/evaluator/0",
    priorityScheme,
    pressures: Object.freeze([
      {
        pressureRef: "pressure://odd-sdlc/t129/multi-gap",
        pressureKind: "gap_row",
        sourceRef: "gap://odd-sdlc/t129",
        affectedAssetRefs: Object.freeze([
          "asset://odd-sdlc/t129/alpha",
          "asset://odd-sdlc/t129/release-depth"
        ]),
        targetOutcomeRefs: Object.freeze([
          "outcome://odd-sdlc/t129/alpha",
          "outcome://odd-sdlc/t129/release-depth"
        ]),
        evidenceRefs: Object.freeze(["event://odd-sdlc/t129/gap"]),
        severity: 1
      }
    ]),
    actions: Object.freeze([
      {
        actionRef: "construction-action://odd-sdlc/t129/a-alpha",
        actionKind: "continue_graph_call",
        graphFunctionRef: "graph-function://odd-sdlc/t129/alpha",
        graphVectorRef: "vector://odd-sdlc/t129/alpha",
        publishedTraversalTargetRef:
          "published-traversal-target://odd-sdlc/t129/alpha",
        targetOutcomeRef: "outcome://odd-sdlc/t129/alpha",
        expectedOutputAssetRefs: Object.freeze(["asset://odd-sdlc/t129/alpha"])
      },
      {
        actionRef: "construction-action://odd-sdlc/t129/z-release-depth",
        actionKind: "continue_graph_call",
        graphFunctionRef: "graph-function://odd-sdlc/t129/release-depth",
        graphVectorRef: "vector://odd-sdlc/t129/release-depth",
        publishedTraversalTargetRef:
          "published-traversal-target://odd-sdlc/t129/release-depth",
        targetOutcomeRef: "outcome://odd-sdlc/t129/release-depth",
        expectedOutputAssetRefs: Object.freeze([
          "asset://odd-sdlc/t129/release-depth"
        ])
      }
    ])
  });

  assert.equal(report.rankingAuthority, "abiogenesis_construction_priority_projection");
  assert.equal(report.localRankingAuthority, false);
  assert.equal(
    report.policyCarrierRef,
    "policy-carrier://odd-sdlc/evaluate-next/source-default"
  );
  assert.equal(
    report.policyVisibility,
    "visible_source_default_when_no_runtime_policy"
  );
  assert.equal(
    report.priorityProjection.prioritySchemeRef,
    "priority-scheme://odd-sdlc/t129/release-first"
  );
  assert.equal(
    report.selectedPriorityRow.actionRef,
    "construction-action://odd-sdlc/t129/z-release-depth"
  );
  assert.equal(
    report.bestGraphFunctionRef,
    "graph-function://odd-sdlc/t129/release-depth"
  );
  assert.deepEqual(report.nextLawfulActionRefs, [
    "construction-action://odd-sdlc/t129/z-release-depth"
  ]);
  assert(
    report.selectedPriorityRow.rankReasonRefs.includes(
      "priority-rule://odd-sdlc/t129/release-depth"
    )
  );
});

test("T-129 public gap dossier follows graph order by default when no priority action overrides it", () => {
  const basis = publicGapsLexicalTrapBasis();
  const dossier = deriveSdlcGapDossier({
    basis,
    events: graphOpenedEvents(basis),
    triageInput: "t129-public-gap-default-follow",
    evidenceRefs: Object.freeze(["event://odd-sdlc/t129/public-gap-default-follow"])
  });

  assert.equal(dossier.readOnly, true);
  assert.equal(dossier.choosesNextTraversal, false);
  assert.equal(dossier.edge, "derive_zeta_surface");
  assert.equal(
    dossier.rankingAuthority,
    "abiogenesis_construction_priority_projection"
  );
  assert.equal(dossier.localRankingAuthority, false);
  assert.equal(
    dossier.bestGraphVectorRef,
    "derive_zeta_surface"
  );
  assert.notEqual(dossier.bestGraphVectorRef, "derive_alpha_surface");
  assert.deepEqual(dossier.nextLawfulActions, [
    "construction-action:t129_public_gaps_default_follow:derive_zeta_surface"
  ]);
  assert(
    dossier.rankingReasonRefs.some((ref) =>
      ref.includes("domain-defaults://odd-sdlc/ts-domain-defaults-v1")
    )
  );
  assert(
    dossier.rankingReasonRefs.some((ref) =>
      ref.includes("/policy/default-follow-graph/rule/")
    )
  );
});

test("T-129 public gap dossier ranks competing graph actions through the ABG evaluator projection", () => {
  const basis = publicGapsMultiCandidateBasis();
  const priorityScheme = constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://odd-sdlc/t129/public-gaps/release-first",
    sourcePolicyRef: "policy://odd-sdlc/t129/public-gaps/release-first",
    rules: Object.freeze([
      constructConstructionPriorityRule({
        priorityRuleRef:
          "priority-rule://odd-sdlc/t129/public-gaps/release-depth",
        axis: "release_blocking",
        weight: 30,
        appliesToActionKinds: Object.freeze(["continue_graph_call"]),
        appliesToOutcomeRefs: Object.freeze([
          "outcome://odd-sdlc/t129_public_gaps_multi_candidate/node:t129/public-gaps/release-depth"
        ]),
        sourcePolicyRef: "policy://odd-sdlc/t129/public-gaps/release-first",
        strategyLabel: "public_gap_release_depth_first"
      })
    ])
  });
  const dossier = deriveSdlcGapDossier({
    basis,
    events: graphOpenedEvents(basis),
    triageInput: "t129-public-gap-multi-candidate",
    evidenceRefs: Object.freeze(["event://odd-sdlc/t129/public-gap"]),
    priorityScheme
  });

  assert.equal(dossier.readOnly, true);
  assert.equal(dossier.choosesNextTraversal, false);
  assert.equal(dossier.nextActionBasisKind, "initial_selection");
  assert.deepEqual(dossier.intentEventRefs, [
    "event://odd-sdlc/intent/t129-public-gap-multi-candidate"
  ]);
  assert.match(
    dossier.productAssetModelRef,
    /^product-asset-model:\/\/odd-sdlc\//
  );
  assert(dossier.gapPressureRefs.length > 0);
  assert(dossier.targetBindingRefs.length > 0);
  assert(dossier.actionCatalogRefs.length > 0);
  assert.equal(dossier.edge, "derive_alpha_surface");
  assert.equal(
    dossier.rankingAuthority,
    "abiogenesis_construction_priority_projection"
  );
  assert.equal(dossier.localRankingAuthority, false);
  assert.match(
    dossier.nextActionProjectionRef,
    /^construction-priority-projection:/
  );
  assert.equal(
    dossier.bestGraphVectorRef,
    "derive_release_depth_surface"
  );
  assert.notEqual(dossier.bestGraphVectorRef, "derive_alpha_surface");
  assert.deepEqual(dossier.nextLawfulActions, [
    "construction-action:t129_public_gaps_multi_candidate:derive_release_depth_surface"
  ]);
  assert(
    dossier.rankingReasonRefs.includes(
      "priority-rule://odd-sdlc/t129/public-gaps/release-depth"
    )
  );
});

test("T-129 substrate boundary consumes ABIogenesis temporal GTL syntax and event-calculus eligibility", () => {
  const { basis, vector } = buildOddSdlcAbg37Basis({
    name: "temporal_eligibility",
    declarations: attrs([temporalHookEntry("eligibility")])
  });
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector
  });
  const timerIntent = constructTimerIntent({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const intentEvent = constructTimerIntentAdmittedEvent({ basis, timerIntent });
  const providerLocalOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://odd-sdlc/t129/local-only"
  });

  assert.deepEqual(TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS, [
    "abg.temporal_constraint"
  ]);
  assert.deepEqual(TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES, [
    "constraint_ref",
    "operator",
    "not_before_ref",
    "deadline_ref",
    "schedule_policy_ref",
    "timer_provider_ref",
    "deadline_breach_action"
  ]);
  assert.equal(resolution.attrKey, "abg.temporal_constraint");
  assert.equal(resolution.source, "graph_vector");
  assert.equal(providerLocalOutcome.outcome, "timer_fired");
  assert.doesNotThrow(() => assertRuntimeEvent(intentEvent));

  const beforeAdmission = deriveTemporalProjection({
    basis,
    events: [...graphOpenedEvents(basis), intentEvent]
  });
  assert.deepEqual(beforeAdmission.pendingTimerIntentRefs, [
    timerIntent.timerIntentRef
  ]);
  assert.deepEqual(beforeAdmission.eligibleVectorIndexes, []);
  assert.equal(
    beforeAdmission.eventCalculus.holds.some(
      (fluent) => fluent.name === "temporal_timer_pending"
    ),
    true
  );

  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent,
    timerOutcome: providerLocalOutcome
  });
  assert.doesNotThrow(() => assertRuntimeEvent(outcomeEvent));
  const events = [...graphOpenedEvents(basis), intentEvent, outcomeEvent];
  const afterAdmission = deriveTemporalProjection({ basis, events });
  const aggregateAfter = deriveRuntimeAggregateProjection(basis, events);

  assert.deepEqual(afterAdmission.pendingTimerIntentRefs, []);
  assert.deepEqual(afterAdmission.eligibleVectorIndexes, [0]);
  assert.equal(
    temporalProjectionHoldsEligibility({
      projection: afterAdmission,
      basis,
      vectorIndex: 0,
      constraintRef: resolution.constraint.constraintRef,
      timerIntentRef: timerIntent.timerIntentRef,
      schedulePolicyRef: resolution.policy.schedulePolicyRef
    }),
    true
  );
  assert.equal(
    afterAdmission.eventCalculus.holds.some(
      (fluent) => fluent.name === "temporal_eligible"
    ),
    true
  );
  assert.deepEqual(aggregateAfter.closedVectorIndexes, []);
  assert.equal(aggregateAfter.nextVectorIndex, 0);
});

test("T-129 substrate boundary rejects provider receipts and non-temporal GTL as temporal authority", () => {
  const temporal = buildOddSdlcAbg37Basis({
    name: "provider_receipt_only",
    declarations: attrs([temporalHookEntry("provider-receipt-only")])
  });
  const resolution = deriveTemporalConstraintFromGtl({
    basis: temporal.basis,
    vectorIndex: 0,
    vector: temporal.vector
  });
  const timerIntent = constructTimerIntent({
    basis: temporal.basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const providerLocalOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://odd-sdlc/t129/unadmitted"
  });
  assert.equal(providerLocalOutcome.providerRef, resolution.policy.timerProviderRef);

  const providerOnlyProjection = deriveTemporalProjection({
    basis: temporal.basis,
    events: [
      ...graphOpenedEvents(temporal.basis),
      constructTimerIntentAdmittedEvent({
        basis: temporal.basis,
        timerIntent
      })
    ]
  });
  assert.deepEqual(providerOnlyProjection.eligibleVectorIndexes, []);
  assert.deepEqual(providerOnlyProjection.firedTimerOutcomeRefs, []);

  const nonTemporal = buildOddSdlcAbg37Basis({
    name: "non_temporal",
    declarations: attrs()
  });
  assert.equal(
    tryDeriveTemporalConstraintFromGtl({
      basis: nonTemporal.basis,
      vectorIndex: 0,
      vector: nonTemporal.vector
    }),
    null
  );
  const nonTemporalProjection = deriveTemporalProjection({
    basis: nonTemporal.basis,
    events: graphOpenedEvents(nonTemporal.basis)
  });
  assert.deepEqual(nonTemporalProjection.eligibleVectorIndexes, []);
  assert.deepEqual(nonTemporalProjection.pendingTimerIntentRefs, []);
});

test("T-129 substrate boundary keeps scheduled continuation replay out of local iteration control", () => {
  const { basis, vector } = buildOddSdlcAbg37Basis({
    name: "scheduled_continuation",
    declarations: attrs([temporalHookEntry("scheduled-continuation")])
  });
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector
  });
  const timerIntent = constructTimerIntent({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const timerOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://odd-sdlc/t129/scheduled/fired"
  });
  const scheduledContinuation = constructScheduledContinuation({
    basis,
    timerIntent,
    timerOutcome
  });
  const events = [
    ...graphOpenedEvents(basis),
    constructTimerIntentAdmittedEvent({ basis, timerIntent }),
    constructTimerOutcomeAdmittedEvent({
      basis,
      timerIntent,
      timerOutcome
    }),
    constructScheduledContinuationReopenedEvent({
      basis,
      scheduledContinuation
    })
  ];
  assert.doesNotThrow(() => assertRuntimeEvent(events.at(-1)));

  const temporalProjection = deriveTemporalProjection({ basis, events });
  const aggregateProjection = deriveRuntimeAggregateProjection(basis, events);
  const homeostatic = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: aggregateProjection.closedVectorIndexes,
    schedulePolicyRef: resolution.policy.schedulePolicyRef,
    schedulePolicy: resolution.policy
  });

  assert.deepEqual(temporalProjection.scheduledContinuationRefs, [
    scheduledContinuation.scheduledContinuationRef
  ]);
  assert.deepEqual(temporalProjection.eligibleVectorIndexes, [0]);
  assert.deepEqual(aggregateProjection.closedVectorIndexes, []);
  assert.equal(aggregateProjection.nextVectorIndex, 0);
  assert.equal(homeostatic.observations[0].reason, "eligible_not_closed");
  assert.equal(homeostatic.observations[0].requiredRegime, "F_H");
});

test("T-129 substrate boundary projects admitted deadline breach F_H pressure without caller-policy rewrite", () => {
  const { basis, vector } = buildOddSdlcAbg37Basis({
    name: "deadline_pressure",
    declarations: attrs([
      temporalHookEntry("deadline-pressure", {
        deadlineRef: "instant://2026-05-07T01:00:00Z",
        deadlineBreachAction: "human_gate"
      })
    ])
  });
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector
  });
  const deadlineBreach = constructDeadlineBreach({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy,
    providerReceiptRef: "provider-receipt://odd-sdlc/t129/deadline"
  });
  const breachEvent = constructDeadlineBreachAdmittedEvent({
    basis,
    deadlineBreach
  });
  assert.doesNotThrow(() => assertRuntimeEvent(breachEvent));

  const beforeAdmission = deriveTemporalProjection({
    basis,
    events: graphOpenedEvents(basis)
  });
  const temporalProjection = deriveTemporalProjection({
    basis,
    events: [...graphOpenedEvents(basis), breachEvent]
  });
  const aggregateProjection = deriveRuntimeAggregateProjection(basis, [
    ...graphOpenedEvents(basis),
    breachEvent
  ]);
  const callerPolicy = Object.freeze({
    ...resolution.policy,
    deadlineBreachAction: "reprice"
  });
  const homeostatic = deriveTemporalHomeostaticProjection({
    basis,
    temporalProjection,
    closedVectorIndexes: aggregateProjection.closedVectorIndexes,
    schedulePolicyRef: resolution.policy.schedulePolicyRef,
    schedulePolicy: callerPolicy
  });

  assert.deepEqual(beforeAdmission.deadlineBreachRefs, []);
  assert.deepEqual(temporalProjection.deadlineBreachRefs, [
    deadlineBreach.deadlineBreachRef
  ]);
  assert.deepEqual(temporalProjection.deadlineBreachedVectorIndexes, [0]);
  assert.equal(
    temporalProjection.deadlineBreachRows[0].deadlineBreachAction,
    "human_gate"
  );
  assert.equal(
    temporalProjection.eventCalculus.holds.some(
      (fluent) => fluent.name === "temporal_deadline_breached"
    ),
    true
  );
  assert.deepEqual(aggregateProjection.closedVectorIndexes, []);
  assert.equal(aggregateProjection.nextVectorIndex, 0);
  assert.equal(homeostatic.observations[0].reason, "deadline_breached");
  assert.equal(homeostatic.observations[0].deadlineBreachAction, "human_gate");
  assert.equal(homeostatic.observations[0].requiredRegime, "F_H");
});

test("T-129 substrate boundary fails closed without ABG temporal identity fields", () => {
  const { basis, vector } = buildOddSdlcAbg37Basis({
    name: "identity_rejection",
    declarations: attrs([
      temporalHookEntry("identity-rejection", {
        deadlineRef: "instant://2026-05-07T01:00:00Z",
        deadlineBreachAction: "block"
      })
    ])
  });
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector
  });
  const timerIntent = constructTimerIntent({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const timerOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://odd-sdlc/t129/identity"
  });
  const outcomeEvent = constructTimerOutcomeAdmittedEvent({
    basis,
    timerIntent,
    timerOutcome
  });
  const scheduledContinuation = constructScheduledContinuation({
    basis,
    timerIntent,
    timerOutcome
  });
  const continuationEvent = constructScheduledContinuationReopenedEvent({
    basis,
    scheduledContinuation
  });
  const deadlineBreach = constructDeadlineBreach({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy,
    providerReceiptRef: "provider-receipt://odd-sdlc/t129/identity-deadline"
  });
  const deadlineEvent = constructDeadlineBreachAdmittedEvent({
    basis,
    deadlineBreach
  });

  const { schedulePolicyRef: _outcomePolicy, ...outcomeWithoutPolicy } =
    outcomeEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(outcomeWithoutPolicy)),
    /TimerOutcomeAdmittedEvent\.schedulePolicyRef/
  );
  const { providerRef: _outcomeProvider, ...outcomeWithoutProvider } =
    outcomeEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(outcomeWithoutProvider)),
    /TimerOutcomeAdmittedEvent\.providerRef/
  );
  const {
    schedulePolicyRef: _continuationPolicy,
    ...continuationWithoutPolicy
  } = continuationEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(continuationWithoutPolicy)),
    /ScheduledContinuationReopenedEvent\.schedulePolicyRef/
  );
  const { deadlineBreachAction: _deadlineAction, ...deadlineWithoutAction } =
    deadlineEvent;
  assert.throws(
    () => assertRuntimeEvent(Object.freeze(deadlineWithoutAction)),
    /DeadlineBreachAdmittedEvent\.deadlineBreachAction/
  );
});

test("T-129 consumes ABG liveness projection without treating ledger writes as progress", () => {
  const { basis } = buildOddSdlcAbg37Basis({
    name: "liveness_reset",
    declarations: attrs()
  });
  const staleProbe = runtimeProbeEvent({
    basis,
    source: "runtime_ledger_write",
    suffix: "stale",
    activityBaseRef: "ledger://odd-sdlc/t129/liveness-reset",
    elapsedMs: 1_000
  });
  const resetProbe = runtimeProbeEvent({
    basis,
    source: "runtime_ledger_write",
    suffix: "reset",
    activityBaseRef: "ledger://odd-sdlc/t129/liveness-reset",
    elapsedMs: 5_200
  });
  assertRuntimeEvent(staleProbe);
  assertRuntimeEvent(resetProbe);

  const expired = deriveRuntimeLivenessObserverProjection({
    basis,
    events: [staleProbe],
    probeContracts: [probeContractFor(staleProbe)],
    policy: livenessPolicy({ nowElapsedMs: 5_500 })
  });
  const reset = deriveRuntimeLivenessObserverProjection({
    basis,
    events: [staleProbe, resetProbe],
    probeContracts: [probeContractFor(staleProbe), probeContractFor(resetProbe)],
    policy: livenessPolicy({ nowElapsedMs: 5_500 })
  });

  assert.equal(expired.kind, "runtime_liveness_observer_projection");
  assert.equal(expired.leaseState, "inactivity_exceeded");
  assert.equal(expired.disposition.action, "retry");
  assert.equal(reset.leaseState, "inactivity_exceeded");
  assert.equal(reset.disposition.action, "retry");
  assert.equal(
    reset.lastActivity.activityRef,
    "ledger://odd-sdlc/t129/liveness-reset/reset"
  );
  assert.equal(reset.probeCoverageRefs.includes(resetProbe.probeRef), true);
});

test("T-129 consumes ABG liveness projection for typed external interruption", () => {
  const { basis } = buildOddSdlcAbg37Basis({
    name: "liveness_interruption",
    declarations: attrs()
  });
  const interruption = constructRuntimeExternalInterruptionObservedEvent({
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    graphCallId: null,
    frameId: null,
    vectorIndex: 0,
    edge: firstEdgeName(basis),
    actorInvocationId: null,
    workerId: basis.runtimeIdentity.workerId,
    backendId: basis.runtimeIdentity.backendId,
    systemRef: "runtime-system://odd-sdlc/t129/liveness",
    interruptionRef: "interruption://odd-sdlc/t129/harness-safety-cap",
    interruptionSource: "harness_safety_cap",
    signal: "SIGTERM",
    elapsedMs: 6_000,
    observedAtMs: 6_000,
    evidenceRefs: ["process://odd-sdlc/t129/harness-safety-cap"],
    detail: "harness safety cap recorded as ABG interruption truth",
    causationEventRefs: [],
    correlationId: "correlation://odd-sdlc/t129/liveness"
  });
  assertRuntimeEvent(interruption);

  const projection = deriveRuntimeLivenessObserverProjection({
    basis,
    events: [interruption],
    probeContracts: [],
    policy: livenessPolicy({ nowElapsedMs: 6_000 })
  });

  assert.equal(projection.leaseState, "externally_interrupted");
  assert.equal(projection.disposition.action, "block");
  assert.equal(
    projection.disposition.reason,
    "external_interruption_observed"
  );
  assert.deepEqual(projection.interruptedSystemRefs, [
    "runtime-system://odd-sdlc/t129/liveness"
  ]);
});
