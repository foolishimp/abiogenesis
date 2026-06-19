// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-042
// Implements: REQ-F-ODDSDLC-043

import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructConstructionActionCatalogProjection,
  constructConstructionActionRefForTraversalTarget,
  constructConstructionActionRow,
  constructConstructionObservationSnapshot,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  constructObservationPressureRow,
  deriveAdvancementTransition,
  deriveConstructionObservationAssetRefsFromRuntimeTruth,
  deriveConstructionPriorityProjection,
  deriveIterationAdvanceDecision,
  deriveObservationToActionBindingProjection,
  deriveRuntimeAggregateProjection,
  deriveTraversalStructureProbe,
  edge,
  graphFunctionForVector,
  runtimeEventsForIterationDecision,
  runtimeEventsForTransition,
  TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES,
  TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS,
  type AdvancementTransition,
  type ConstructionActionCatalogProjection,
  type ConstructionActionKind,
  type ConstructionObservationSnapshot,
  type ConstructionPressureKind,
  type ConstructionPriorityProjection,
  type ConstructionPriorityScheme,
  type ConstructionPriorityRow,
  type ExecutionBasis,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type IterationAdvanceDecision,
  type Module,
  type RuntimeAggregateProjection,
  type RuntimeEvent,
  type RuntimeRegime,
  type ObservationToActionBindingProjection,
  type TraversalStructureProbe
} from "@abiogenesis/typescript-tenant";

export const ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT = Object.freeze({
  packageName: "@abiogenesis/typescript-tenant",
  packageVersion: "4.1.0-rc.2",
  boundary: "consumed_substrate",
  runtimeTruthAuthority: "abiogenesis",
  temporalTruthAuthority: "abiogenesis",
  eventCalculusTruthAuthority: "abiogenesis_replay_projection",
  constructionEvaluatorTruthAuthority:
    "abiogenesis_construction_priority_projection",
  livenessObserverTruthAuthority:
    "abiogenesis_runtime_liveness_observer_projection",
  localRuntimeEventFamilies: Object.freeze([]),
  localTemporalAuthority: false,
  choosesNextVectorLocally: false,
  localConstructionRankingAuthority: false,
  localLivenessAuthority: false,
  temporalConstraintVectorAttrKeys: TEMPORAL_CONSTRAINT_VECTOR_ATTR_KEYS,
  temporalConstraintConfigKeys: TEMPORAL_CONSTRAINT_CONFIG_KEY_VALUES,
  sourceAssumptions: Object.freeze([
    "ABIogenesis T-060 no_compute_basis fails closed",
    "ABIogenesis T-065 traversal probe is complete for structural diagnostics",
    "ABIogenesis T-066 internal control loop owns iteration sufficiency",
    "ABIogenesis T-107 traversal attempt envelopes are ABG-derived from GTL qualifiers",
    "ABIogenesis T-119 temporal GTL algebra is admitted through ABG runtime events",
    "ABIogenesis T-120 Event Calculus replay derives HoldsAt truth from admitted events",
    "ABIogenesis T-122 deadline pressure is replay-derived temporal projection truth",
    "ABIogenesis T-125 temporal and non-temporal GTL live lanes remain regression inputs carried by 4.1.0-rc.2",
    "ABIogenesis T-127 publishes the F_P construction evaluator and read-only public gaps ranking substrate carried by 4.1.0-rc.2",
    "ABIogenesis T-129 publishes the runtime system probe observer liveness substrate carried by 4.1.0-rc.2",
    "ABIogenesis T-144/T-145/T-146 publish the staged compute substrate for transform.C, evaluate.C, consequence.C, evaluation sets, and composed stage tasks carried by 4.1.0-rc.2",
    "ABIogenesis T-147 publishes replay-derived retry context, output authority projection, and target-carrier output admission before closure carried by 4.1.0-rc.2",
    "ABIogenesis T-148 publishes the runtime continuation-transition projection carried by 4.1.0-rc.2",
    "ABIogenesis T-149 publishes the primitive iteration-outcome projection carried by 4.1.0-rc.2",
    "ABIogenesis T-151 publishes segment-scoped evaluation redispatch metadata carried by 4.1.0-rc.2",
    "ABIogenesis T-152 publishes the static GTL program conformance gate, compute-stage binding rows, ABG runtime binding rows, repair-surface triage binding, and graph-vector reentry application carried by 4.1.0-rc.2",
    "ABIogenesis T-154 publishes runtime authorship routes for explicit graph-vector resume cursor and graph-span reentry consumption carried by 4.1.0-rc.2",
    "ABIogenesis T-155 publishes GTL graph-function zoom planning and application carried by 4.1.0-rc.2",
    "ABIogenesis T-156 publishes the consequence allowed traversal catalog, runtime catalog gate, and static GTL annotation validation carried by 4.1.0-rc.2",
    "ABIogenesis T-157 publishes runtime start traversal selection for run-scoped dependency windows carried by 4.1.0-rc.2",
    "ABIogenesis T-158 publishes static GTL plugin result-interface validation, the compiler-admitted result-interface catalog, and runner/replay-visible result-envelope ingress for compute-stage outputs carried by 4.1.0-rc.2",
    "ABIogenesis T-159 publishes TraversalUnit<A, B> projection and ratifies consequence as the bind boundary carried by 4.1.0-rc.2"
  ])
} as const);

export interface OddSdlcAbiogenesisExecutionBasisInput {
  readonly workspaceRoot: string;
  readonly defaultRegime: RuntimeRegime;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
}

export interface OddSdlcAbiogenesisSubstrateReport {
  readonly contract: typeof ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT;
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly iterationDecision: IterationAdvanceDecision;
  readonly transition: AdvancementTransition;
  readonly probe: TraversalStructureProbe;
  readonly iterationEventKinds: readonly RuntimeEvent["kind"][];
  readonly transitionEventKinds: readonly RuntimeEvent["kind"][];
}

export interface OddSdlcEvaluateNextPressureInput {
  readonly pressureRef: string;
  readonly pressureKind: ConstructionPressureKind;
  readonly sourceRef: string;
  readonly affectedAssetRefs?: readonly string[];
  readonly targetOutcomeRefs: readonly string[];
  readonly evidenceRefs?: readonly string[];
  readonly severity?: number;
}

export interface OddSdlcEvaluateNextActionInput {
  readonly actionRef?: string;
  readonly actionKind: ConstructionActionKind;
  readonly graphFunctionRef?: string | null;
  readonly graphVectorRef?: string | null;
  readonly publishedTraversalTargetRef?: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs?: readonly string[];
  readonly expectedOutputAssetRefs?: readonly string[];
  readonly requiredAuthorityRefs?: readonly string[];
  readonly eligibleReasonRefs?: readonly string[];
  readonly ineligibleReasonRefs?: readonly string[];
}

export type OddSdlcNextActionBasisKind =
  | "initial_selection"
  | "post_yield_resume"
  | "post_close_graph_continuation"
  | "post_retry"
  | "post_repair"
  | "post_reenter"
  | "post_reprice"
  | "post_block";

export interface OddSdlcEvaluateNextPolicyCarrier {
  readonly kind: "odd_sdlc_evaluate_next_policy_carrier";
  readonly carrierRef: string;
  readonly sourceKind: "source_default";
  readonly visibility: "visible_source_default_when_no_runtime_policy";
  readonly hookResolutionRef: string;
  readonly sourceDefaultConfigDigest: string;
  readonly authorityDigest: string;
  readonly priorityScheme: ConstructionPriorityScheme;
}

export interface OddSdlcEvaluateNextInput {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
  readonly nextActionBasisKind?: OddSdlcNextActionBasisKind;
  readonly intentEventRefs?: readonly string[];
  readonly productAssetModelRef?: string;
  readonly episodeId?: string;
  readonly observationId?: string;
  readonly actionCatalogRef?: string;
  readonly hookResolutionRef?: string;
  readonly fallbackConfigDigest?: string;
  readonly authorityDigest?: string;
  readonly policyCarrier?: OddSdlcEvaluateNextPolicyCarrier;
  readonly priorityScheme?: ConstructionPriorityScheme;
  readonly pressures: readonly OddSdlcEvaluateNextPressureInput[];
  readonly actions: readonly OddSdlcEvaluateNextActionInput[];
}

export interface OddSdlcEvaluateNextReport {
  readonly kind: "odd_sdlc_evaluate_next_report";
  readonly evaluationFunction: "evaluate_next";
  readonly nextActionBasisKind: OddSdlcNextActionBasisKind;
  readonly intentEventRefs: readonly string[];
  readonly productAssetModelRef: string;
  readonly gapPressureRefs: readonly string[];
  readonly targetBindingRefs: readonly string[];
  readonly actionCatalogRefs: readonly string[];
  readonly gapEvaluationAuthority: false;
  readonly actionClosureEvaluationAuthority: false;
  readonly rankingAuthority: "abiogenesis_construction_priority_projection";
  readonly localRankingAuthority: false;
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityProjection: ConstructionPriorityProjection;
  readonly policyCarrierRef: string;
  readonly policyVisibility: OddSdlcEvaluateNextPolicyCarrier["visibility"];
  readonly selectedPriorityRow: ConstructionPriorityRow | null;
  readonly nextLawfulActionRefs: readonly string[];
  readonly bestGraphFunctionRef: string | null;
  readonly bestGraphVectorRef: string | null;
}

export const ODD_SDLC_SOURCE_DEFAULT_EVALUATE_NEXT_POLICY =
  Object.freeze({
    kind: "odd_sdlc_evaluate_next_policy_carrier",
    carrierRef: "policy-carrier://odd-sdlc/evaluate-next/source-default",
    sourceKind: "source_default",
    visibility: "visible_source_default_when_no_runtime_policy",
    hookResolutionRef: "hook-resolution://odd-sdlc/source-default",
    sourceDefaultConfigDigest: "sha256:odd-sdlc-source-default-evaluate-next",
    authorityDigest: "sha256:odd-sdlc-evaluator-adapter",
    priorityScheme: constructConstructionPriorityScheme({
    schemeRef: "priority-scheme://odd-sdlc/default",
    sourcePolicyRef: "policy://odd-sdlc/default-evaluate-next",
    rules: Object.freeze([
      constructConstructionPriorityRule({
        priorityRuleRef: "priority-rule://odd-sdlc/default/gap-repair",
        axis: "gap_repair",
        weight: 1,
        appliesToActionKinds: Object.freeze([]),
        appliesToOutcomeRefs: Object.freeze([]),
        sourcePolicyRef: "policy://odd-sdlc/default-evaluate-next",
        strategyLabel: "odd_sdlc_evaluate_next_default_gap_repair"
      })
    ])
  })
  }) satisfies OddSdlcEvaluateNextPolicyCarrier;

export const ODD_SDLC_DEFAULT_EVALUATE_NEXT_PRIORITY_SCHEME =
  ODD_SDLC_SOURCE_DEFAULT_EVALUATE_NEXT_POLICY.priorityScheme;

function typedSdlcNode(id: string, name: string, typeName: string) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `schema://odd_sdlc/${typeName}` },
    markov: [],
    assetSurface: {
      kind: typeName,
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["odd_sdlc", "substrate_probe", `type:${typeName}`]
  });
}

function firstVector(graph: Graph): GraphVector {
  const vector = graph.vectors[0];
  if (vector === undefined) {
    throw new TypeError("odd_sdlc ABIogenesis substrate probe requires one vector");
  }
  return vector;
}

export function constructOddSdlcSubstrateGraphFunction(): GraphFunction {
  const source = typedSdlcNode(
    "node-odd-sdlc-t028-worksite",
    "SdlcWorksite",
    "SdlcWorksite"
  );
  const target = typedSdlcNode(
    "node-odd-sdlc-t028-work-report",
    "SdlcWorkReport",
    "SdlcWorkReport"
  );
  const graph = edge([source], target, {
    id: "graph-odd-sdlc-t028-substrate-probe",
    name: "SdlcWorksite->SdlcWorkReport",
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: { entries: [] },
    tags: ["odd_sdlc", "substrate_probe"]
  });

  return graphFunctionForVector(firstVector(graph), {
    name: "ODD_SDLC_SUBSTRATE_PROBE",
    declarations: { entries: [] },
    tags: ["odd_sdlc", "substrate_probe"]
  });
}

export function constructOddSdlcSubstrateModule(): Module {
  const graphFunction = constructOddSdlcSubstrateGraphFunction();
  return admitModule({
    name: "odd_sdlc_typescript_substrate_probe",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-odd-sdlc-t028-substrate-probe",
        name: "ODD_SDLC_SUBSTRATE_PROBE_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["odd_sdlc", "substrate_probe"]
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

export function constructOddSdlcAbiogenesisExecutionBasis(
  input: OddSdlcAbiogenesisExecutionBasisInput = {
    workspaceRoot: "/workspace/odd-sdlc-typescript-substrate-probe",
    defaultRegime: "F_D",
    runId: "run://odd-sdlc/t028/substrate-probe",
    workKey: "wk://odd-sdlc/t028/substrate-probe",
    frameId: null,
    frameLineageId: null
  }
): ExecutionBasis {
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: input.workspaceRoot,
        moduleName: "odd_sdlc_typescript_substrate_probe"
      },
      target: {
        kind: "graph_function",
        handle: "ODD_SDLC_SUBSTRATE_PROBE"
      },
      until: "converged"
    }),
    module: constructOddSdlcSubstrateModule(),
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: `policy://odd-sdlc/t028/${input.defaultRegime}`,
      defaultRegime: input.defaultRegime,
      dispatchRef:
        input.defaultRegime === "F_P" ? "dispatch://odd-sdlc/t028" : null,
      approvalSubjectRef:
        input.defaultRegime === "F_H" ? "approval://odd-sdlc/t028" : null
    }),
    runId: input.runId,
    workKey: input.workKey,
    frameId: input.frameId,
    frameLineageId: input.frameLineageId
  });
}

function eventKinds(events: readonly RuntimeEvent[]): readonly RuntimeEvent["kind"][] {
  return Object.freeze(events.map((event) => event.kind));
}

function defaultConstructionEpisodeId(basis: ExecutionBasis): string {
  return `construction-episode://odd-sdlc/${basis.runId ?? basis.workKey ?? basis.graphFunction.id}`;
}

function defaultConstructionObservationId(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
}): string {
  return [
    "construction-observation://odd-sdlc",
    input.basis.graphFunction.id,
    String(input.events.length)
  ].join("/");
}

function actionRefFor(input: OddSdlcEvaluateNextActionInput): string {
  if (input.actionRef !== undefined) {
    return input.actionRef;
  }
  if (
    input.graphFunctionRef !== undefined &&
    input.graphFunctionRef !== null &&
    input.graphVectorRef !== undefined &&
    input.graphVectorRef !== null
  ) {
    return constructConstructionActionRefForTraversalTarget({
      graphFunctionRef: input.graphFunctionRef,
      graphVectorRef: input.graphVectorRef
    });
  }
  return `construction-action://odd-sdlc/${input.targetOutcomeRef}`;
}

export function deriveOddSdlcAbiogenesisSubstrateReport(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
}): OddSdlcAbiogenesisSubstrateReport {
  const projection = deriveRuntimeAggregateProjection(input.basis, input.events);
  const iterationDecision = deriveIterationAdvanceDecision(input.basis, projection);
  const transition = deriveAdvancementTransition(input.basis, input.events);
  const probe = deriveTraversalStructureProbe(input.basis, input.events);

  return Object.freeze({
    contract: ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT,
    basis: input.basis,
    projection,
    iterationDecision,
    transition,
    probe,
    iterationEventKinds: eventKinds(
      runtimeEventsForIterationDecision(iterationDecision)
    ),
    transitionEventKinds: eventKinds(
      runtimeEventsForTransition(input.basis, transition)
    )
  });
}

export function deriveOddSdlcEvaluateNextReport(
  input: OddSdlcEvaluateNextInput
): OddSdlcEvaluateNextReport {
  const projection = deriveRuntimeAggregateProjection(input.basis, input.events);
  const policyCarrier =
    input.policyCarrier ?? ODD_SDLC_SOURCE_DEFAULT_EVALUATE_NEXT_POLICY;
  const assetRefs = deriveConstructionObservationAssetRefsFromRuntimeTruth({
    basis: input.basis,
    projection
  });
  const episodeId = input.episodeId ?? defaultConstructionEpisodeId(input.basis);
  const observationId =
    input.observationId ??
    defaultConstructionObservationId({
      basis: input.basis,
      events: input.events
    });
  const actionCatalogRef =
    input.actionCatalogRef ?? `construction-action-catalog://odd-sdlc/${episodeId}`;
  const pressureRows = Object.freeze(
    input.pressures.map((pressure) =>
      constructObservationPressureRow({
        pressureRef: pressure.pressureRef,
        pressureKind: pressure.pressureKind,
        sourceRef: pressure.sourceRef,
        affectedAssetRefs: pressure.affectedAssetRefs ?? Object.freeze([]),
        targetOutcomeRefs: pressure.targetOutcomeRefs,
        evidenceRefs: pressure.evidenceRefs ?? Object.freeze([]),
        severity: pressure.severity ?? 1
      })
    )
  );
  const actionRows = Object.freeze(
    input.actions.map((action) =>
      constructConstructionActionRow({
        actionRef: actionRefFor(action),
        actionKind: action.actionKind,
        graphFunctionRef: action.graphFunctionRef ?? null,
        graphVectorRef: action.graphVectorRef ?? null,
        publishedTraversalTargetRef: action.publishedTraversalTargetRef ?? null,
        targetOutcomeRef: action.targetOutcomeRef,
        inputAssetRefs: action.inputAssetRefs ?? Object.freeze([]),
        expectedOutputAssetRefs: action.expectedOutputAssetRefs ?? Object.freeze([]),
        requiredAuthorityRefs: action.requiredAuthorityRefs ?? Object.freeze([]),
        eligibleReasonRefs: action.eligibleReasonRefs ?? Object.freeze([]),
        ineligibleReasonRefs: action.ineligibleReasonRefs ?? Object.freeze([])
      })
    )
  );
  const actionCatalog = constructConstructionActionCatalogProjection({
    catalogRef: actionCatalogRef,
    episodeId,
    hookResolutionRef: input.hookResolutionRef ?? policyCarrier.hookResolutionRef,
    fallbackConfigDigest:
      input.fallbackConfigDigest ?? policyCarrier.sourceDefaultConfigDigest,
    rows: actionRows
  });
  const observation = constructConstructionObservationSnapshot({
    episodeId,
    observationId,
    basisRef: `execution-basis://odd-sdlc/${input.basis.graphFunction.id}`,
    currentProjectionRef: `runtime-aggregate://odd-sdlc/${input.basis.graphFunction.id}/${input.events.length}`,
    iterationOrdinal: projection.closedVectorIndexes.length,
    basisProjectionRef: `basis-projection://odd-sdlc/${input.basis.graphFunction.id}`,
    priorIntentId: null,
    causationRef: `causation://odd-sdlc/${input.basis.graphFunction.id}`,
    correlationId: input.basis.runId ?? input.basis.workKey ?? episodeId,
    runtimeAggregateRefs: Object.freeze([
      `runtime-aggregate://odd-sdlc/${input.basis.graphFunction.id}/${input.events.length}`
    ]),
    linkedAssetRefs: assetRefs.linkedAssetRefs,
    passedInputRefs: assetRefs.passedInputRefs,
    gapProjectionRefs: Object.freeze([]),
    actionCatalogRef,
    authorityDigest: input.authorityDigest ?? policyCarrier.authorityDigest,
    pressureRows
  });
  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme:
      input.priorityScheme ?? policyCarrier.priorityScheme
  });
  const selectedPriorityRow = priorityProjection.rows[0] ?? null;
  const selectedAction =
    selectedPriorityRow === null
      ? null
      : actionCatalog.rows.find(
          (action) => action.actionRef === selectedPriorityRow.actionRef
        ) ?? null;

  return Object.freeze({
    kind: "odd_sdlc_evaluate_next_report",
    evaluationFunction: "evaluate_next",
    nextActionBasisKind: input.nextActionBasisKind ?? "initial_selection",
    intentEventRefs: Object.freeze([
      ...(input.intentEventRefs ?? [
        `event://odd-sdlc/intent/${input.basis.graphFunction.id}`
      ])
    ]),
    productAssetModelRef:
      input.productAssetModelRef ??
      `product-asset-model://odd-sdlc/${input.basis.graphFunction.id}`,
    gapPressureRefs: Object.freeze(
      pressureRows.map((pressure) => pressure.pressureRef)
    ),
    targetBindingRefs: Object.freeze(
      bindingProjection.rows.map((binding) => binding.bindingRef)
    ),
    actionCatalogRefs: Object.freeze([actionCatalog.catalogRef]),
    gapEvaluationAuthority: false,
    actionClosureEvaluationAuthority: false,
    rankingAuthority: "abiogenesis_construction_priority_projection",
    localRankingAuthority: false,
    observation,
    actionCatalog,
    bindingProjection,
    priorityProjection,
    policyCarrierRef: policyCarrier.carrierRef,
    policyVisibility: policyCarrier.visibility,
    selectedPriorityRow,
    nextLawfulActionRefs: Object.freeze(
      selectedPriorityRow === null ? [] : [selectedPriorityRow.actionRef]
    ),
    bestGraphFunctionRef: selectedAction?.graphFunctionRef ?? null,
    bestGraphVectorRef: selectedAction?.graphVectorRef ?? null
  });
}
