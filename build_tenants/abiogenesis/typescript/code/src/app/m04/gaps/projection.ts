// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-016
// Implements: REQ-P-POLICY-017

import { createHash } from "node:crypto";
import {
  admitExecutionBasis,
  constructConstructionActionCatalogProjection,
  constructConstructionActionRefForTraversalTarget,
  constructConstructionActionRow,
  constructConstructionObservationSnapshot,
  constructObservationPressureRow,
  deriveAdvancementTransition,
  deriveConstructionObservationAssetRefsFromRuntimeTruth,
  deriveConstructionPriorityProjection,
  deriveConstructionPrioritySchemeFromHookResolutions,
  deriveObservationToActionBindingProjection,
  resolveConstructionHookDeclarationFromGtl,
  deriveRuntimeAggregateProjection
} from "../../../abg/m03/index.js";
import type {
  AdvancementTransition,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "../../../abg/m03/contracts/carriers.js";
import type {
  ConstructionActionCatalogProjection,
  ConstructionActionRow,
  ConstructionHookDeclaration,
  ConstructionHookResolution,
  ConstructionObservationSnapshot,
  ConstructionPriorityProjection,
  ConstructionPriorityRow,
  ConstructionPriorityScheme,
  ObservationPressureRow,
  ObservationToActionBindingProjection
} from "../../../abg/m03/contracts/index.js";
import type { GraphFunction, GraphVector } from "../../../gtl/m01/contracts/carriers.js";
import type { Job } from "../../../gtl/m02/contracts/carriers.js";
import { constructModuleLookupAuthority } from "../../../gtl/m02/contracts/lookup.js";
import { admitPublicGapsRequest } from "./admission.js";
import {
  constructPublicGapsDeltaSummary,
  constructPublicGapsEntry,
  constructPublicGapsProjection
} from "./constructors.js";
import type {
  PublicGapsContext,
  PublicGapsEntry,
  PublicGapsEntryStatus,
  PublicGapsNextStep,
  PublicGapsProjection,
  PublicGapsRequest,
  PublicGapsStatus,
  PublicTypedAssetGapProjectionRow
} from "./carriers.js";

interface GapsJobBinding {
  readonly graphFunction: GraphFunction;
  readonly job: Job;
  readonly role: Job["roles"][number] | null;
}

interface GapsRuntimeSubject {
  readonly binding: GapsJobBinding;
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly transition: AdvancementTransition;
  readonly events: readonly RuntimeEvent[];
  readonly status: PublicGapsEntryStatus;
  readonly vectorIndex: number | null;
  readonly vector: GraphVector | null;
  readonly edge: string | null;
  readonly failing: readonly string[];
  readonly stopDetail: Pick<
    PublicGapsEntry,
    "stopPredicate" | "dispatchRef" | "approvalSubjectRef" | "terminalKind"
  >;
}

interface ConstructionGapSubject {
  readonly runtimeSubject: GapsRuntimeSubject;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly missingTruthRefs: readonly string[];
  readonly blockingReasonRefs: readonly string[];
  readonly admissionBlockerRefs: readonly string[];
  readonly runtimeProjectionRef: string;
  readonly hookResolution: ConstructionHookResolution;
}

interface PublicGapsConstructionEvaluatorProjection {
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityProjection: ConstructionPriorityProjection;
  readonly gapSubjects: readonly ConstructionGapSubject[];
}

const PUBLIC_GAPS_CONSTRUCTION_HOOK_FALLBACK: ConstructionHookDeclaration =
  Object.freeze({
    hookRef: "hook://abg/public-gaps/fp-consciousness",
    sourceRef: "source-default://abg/public-gaps/fp-consciousness",
    concerns: Object.freeze(["priority_scheme"]),
    config: Object.freeze({
      readOnly: true,
      surface: "public_gaps",
      fallbackVisibility: "source_default_when_no_installed_bundle"
    })
  });

function installedConstructionHookFallback(
  context: PublicGapsContext
): ConstructionHookDeclaration {
  const fallbackBundle = context.abgFallbackBundle ?? null;
  if (fallbackBundle === null) {
    return PUBLIC_GAPS_CONSTRUCTION_HOOK_FALLBACK;
  }
  return Object.freeze({
    hookRef: "hook://abg/installed-fallback/fp-consciousness",
    sourceRef: `${fallbackBundle.bundleRef}#${fallbackBundle.bundleDigest}`,
    concerns: Object.freeze(["priority_scheme"]),
    config: Object.freeze({
      readOnly: true,
      surface: "public_gaps",
      fallbackBundleRef: fallbackBundle.bundleRef,
      fallbackBundleDigest: fallbackBundle.bundleDigest,
      fallbackBundlePath: fallbackBundle.bundlePath,
      resolvedPolicyBundleRef: context.resolvedPolicy.resolvedPolicyBundleRef
    })
  });
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function stableDigest(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function runtimeIdentityProjection(
  context: PublicGapsContext
): PublicGapsProjection["scope"]["runtimeIdentity"] {
  return Object.freeze({
    workerId: context.runtimeIdentity.workerId,
    backendId: context.runtimeIdentity.backendId,
    buildId: context.runtimeIdentity.buildId,
    resolvedRuntimeRef: context.runtimeIdentity.resolvedRuntimeRef
  });
}

function graphFunctionForId(
  context: PublicGapsContext,
  graphFunctionId: string
): GraphFunction {
  const graphFunction = context.module.graphFunctions.find(
    (candidate) => candidate.id === graphFunctionId
  );
  if (graphFunction === undefined) {
    throw new TypeError(
      `Public gaps projection found job for unknown graph function ${JSON.stringify(graphFunctionId)}`
    );
  }
  return graphFunction;
}

function roleForJob(job: Job): Job["roles"][number] | null {
  if (job.roles.length === 0) {
    return null;
  }
  if (job.roles.length > 1) {
    throw new TypeError(
      `Public gaps projection rejects ambiguous roles for job ${JSON.stringify(job.id)}`
    );
  }
  return job.roles[0] ?? null;
}

function collectGapsJobBindings(
  context: PublicGapsContext
): readonly GapsJobBinding[] {
  const authority = constructModuleLookupAuthority(context.module);
  const bindings: GapsJobBinding[] = [];

  for (const semantic of authority.semanticJobs) {
    if (semantic.jobs.length === 0) {
      continue;
    }
    if (semantic.jobs.length > 1) {
      throw new TypeError(
        `Public gaps projection rejects multiple semantic jobs for graph function ${JSON.stringify(semantic.graphFunctionId)}`
      );
    }
    const job = semantic.jobs[0];
    if (job === undefined) {
      continue;
    }
    bindings.push(
      Object.freeze({
        graphFunction: graphFunctionForId(context, semantic.graphFunctionId),
        job,
        role: roleForJob(job)
      })
    );
  }

  return Object.freeze(
    bindings.sort((left, right) => left.job.id.localeCompare(right.job.id))
  );
}

function executionBasisForBinding(
  request: PublicGapsRequest,
  context: PublicGapsContext,
  binding: GapsJobBinding
): ExecutionBasis {
  return admitExecutionBasis({
    startIntent: {
      scope: request.scope,
      target: {
        kind: "graph_function",
        handle: binding.graphFunction.id
      },
      until: "converged"
    },
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId ?? null,
    workKey: context.workKey ?? null,
    frameId: context.frameId ?? null,
    frameLineageId: context.frameLineageId ?? null
  });
}

function eventBasisId(event: RuntimeEvent): string | null {
  if ("basisId" in event) {
    return event.basisId;
  }
  return null;
}

function eventsForBasis(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  return Object.freeze(
    events.filter((event) => eventBasisId(event) === basis.id)
  );
}

function assessedObligationIdsForEdge(
  events: readonly RuntimeEvent[],
  edge: string | null
): readonly string[] {
  if (edge === null) {
    return Object.freeze([]);
  }
  const ids = events.flatMap((event) =>
    event.kind === "assessed" && event.edge === edge
      ? [event.obligationId]
      : []
  );
  return Object.freeze([...new Set(ids)].sort());
}

function transitionStatus(
  transition: AdvancementTransition,
  projection: RuntimeAggregateProjection
): PublicGapsEntryStatus {
  if (transition.kind === "terminal") {
    if (transition.terminalKind === "nothing_to_do") {
      return "nothing_to_do";
    }
    return "converged";
  }
  if (projection.nextVectorIndex === null) {
    return projection.vectorCount === 0 ? "nothing_to_do" : "converged";
  }
  if (transition.kind === "fp_dispatch") {
    return "dispatch_required";
  }
  if (transition.kind === "fh_escalation") {
    return "human_gate_required";
  }
  return "open";
}

function dispatchAlreadyRequested(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): boolean {
  return events.some(
    (event) =>
      event.kind === "fp_dispatch_requested" && event.basisId === basis.id
  );
}

function nextStepForEntry(input: {
  readonly status: PublicGapsEntryStatus;
  readonly dispatchRequested: boolean;
}): PublicGapsNextStep {
  switch (input.status) {
    case "dispatch_required":
      return input.dispatchRequested ? "assess-result" : "start";
    case "human_gate_required":
      return "human-decision";
    case "open":
      return "start";
    case "converged":
    case "nothing_to_do":
      return "none";
    default: {
      const exhaustive: never = input.status;
      throw new TypeError(`Unsupported gaps entry status ${JSON.stringify(exhaustive)}`);
    }
  }
}

function publicRuntimeProjectionRef(
  projection: RuntimeAggregateProjection
): string {
  return `public-gaps-runtime-aggregate:${projection.basisId}:${projection.closedVectorIndexes.join(".")}:${projection.assessedEdges.join(".")}`;
}

function constructionEpisodeId(context: PublicGapsContext): string {
  return [
    "construction-episode",
    "public-gaps",
    context.module.name,
    context.runId ?? "runless",
    context.workKey ?? "workspace"
  ].join(":");
}

function constructionObservationId(
  context: PublicGapsContext,
  events: readonly RuntimeEvent[]
): string {
  return [
    "construction-observation",
    "public-gaps",
    context.module.name,
    String(events.length),
    context.runId ?? "runless",
    context.workKey ?? "workspace"
  ].join(":");
}

function constructionActionCatalogRef(context: PublicGapsContext): string {
  return [
    "construction-action-catalog",
    "public-gaps",
    context.module.name,
    context.runId ?? "runless",
    context.workKey ?? "workspace"
  ].join(":");
}

function constructionPriorityScheme(
  context: PublicGapsContext,
  hookResolutions: readonly ConstructionHookResolution[]
): ConstructionPriorityScheme {
  if (context.constructionPriorityScheme !== undefined) {
    return context.constructionPriorityScheme;
  }
  return deriveConstructionPrioritySchemeFromHookResolutions({
    schemeRef: [
      "construction-priority-scheme",
      "public-gaps",
      context.module.name,
      context.runId ?? "runless",
      context.workKey ?? "workspace",
      stableDigest(
        hookResolutions.map((resolution) => ({
          source: resolution.source,
          sourceRef: resolution.sourceRef,
          hookRef: resolution.hookRef,
          configDigest: resolution.configDigest
        }))
      )
    ].join(":"),
    sourcePolicyRef: context.resolvedPolicy.resolvedPolicyBundleRef,
    hookResolutions
  });
}

function constructionTargetOutcomeRef(vector: GraphVector): string {
  return `typed-asset-outcome:${vector.target.id}`;
}

function constructionActionRef(input: {
  readonly basis: ExecutionBasis;
  readonly vector: GraphVector;
}): string {
  return constructConstructionActionRefForTraversalTarget({
    graphFunctionRef: input.basis.graphFunction.id,
    graphVectorRef: input.vector.id
  });
}

function constructionPressureRef(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly vector: GraphVector;
}): string {
  return [
    "construction-pressure",
    input.projection.basisId,
    input.vector.id,
    input.vector.target.id
  ].join(":");
}

function missingTruthRefsFor(failing: readonly string[]): readonly string[] {
  return Object.freeze(failing.map((id) => `evaluator-obligation:${id}`));
}

function blockingReasonRefsFor(subject: GapsRuntimeSubject): readonly string[] {
  return Object.freeze(
    [
      `public-gaps-status:${subject.status}`,
      subject.stopDetail.stopPredicate === null
        ? null
        : `stop-predicate:${subject.stopDetail.stopPredicate}`
    ].filter((value): value is string => value !== null)
  );
}

function admissionBlockerRefsFor(
  projection: RuntimeAggregateProjection
): readonly string[] {
  return Object.freeze([
    ...projection.failedLeafTaskIds.map((id) => `failed-leaf-task:${id}`)
  ]);
}

function transitionStopDetail(transition: AdvancementTransition): Pick<
  PublicGapsEntry,
  "stopPredicate" | "dispatchRef" | "approvalSubjectRef" | "terminalKind"
> {
  switch (transition.kind) {
    case "fp_dispatch":
      return Object.freeze({
        stopPredicate: "dispatch_required",
        dispatchRef: transition.dispatchRef,
        approvalSubjectRef: null,
        terminalKind: null
      });
    case "fh_escalation":
      return Object.freeze({
        stopPredicate: "human_gate_required",
        dispatchRef: null,
        approvalSubjectRef: transition.approvalSubjectRef,
        terminalKind: null
      });
    case "terminal":
      return Object.freeze({
        stopPredicate: null,
        dispatchRef: null,
        approvalSubjectRef: null,
        terminalKind: transition.terminalKind
      });
    case "fd_advance":
      return Object.freeze({
        stopPredicate: null,
        dispatchRef: null,
        approvalSubjectRef: null,
        terminalKind: null
      });
    default: {
      const exhaustive: never = transition;
      throw new TypeError(`Unsupported gaps transition ${JSON.stringify(exhaustive)}`);
    }
  }
}

function constructRuntimeSubject(input: {
  readonly binding: GapsJobBinding;
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly transition: AdvancementTransition;
  readonly events: readonly RuntimeEvent[];
}): GapsRuntimeSubject {
  const vectorIndex = input.projection.nextVectorIndex;
  const vector =
    vectorIndex === null ? null : input.basis.graph.vectors[vectorIndex] ?? null;
  const edge = vector?.name ?? null;
  const expectedEvaluatorIds = Object.freeze(
    vector?.evaluators.map((evaluator) => evaluator.name) ?? []
  );
  const assessedIds = assessedObligationIdsForEdge(input.events, edge);
  const assessed = new Set(assessedIds);
  const failing = Object.freeze(
    expectedEvaluatorIds.filter((id) => !assessed.has(id))
  );
  return Object.freeze({
    binding: input.binding,
    basis: input.basis,
    projection: input.projection,
    transition: input.transition,
    events: input.events,
    status: transitionStatus(input.transition, input.projection),
    vectorIndex,
    vector,
    edge,
    failing,
    stopDetail: transitionStopDetail(input.transition)
  });
}

function hookResolutionForRuntimeSubject(input: {
  readonly context: PublicGapsContext;
  readonly subject: GapsRuntimeSubject;
}): ConstructionHookResolution {
  return resolveConstructionHookDeclarationFromGtl({
    graphVector: input.subject.vector,
    graphFunction: input.subject.binding.graphFunction,
    job: input.subject.binding.job,
    role: input.subject.binding.role,
    module: input.context.module,
    installedFallback: installedConstructionHookFallback(input.context)
  });
}

function constructionGapSubjects(
  context: PublicGapsContext,
  subjects: readonly GapsRuntimeSubject[]
): readonly ConstructionGapSubject[] {
  return Object.freeze(
    subjects.flatMap((subject) => {
      if (
        subject.vector === null ||
        subject.status === "converged" ||
        subject.status === "nothing_to_do"
      ) {
        return [];
      }
      const pressureRef = constructionPressureRef({
        projection: subject.projection,
        vector: subject.vector
      });
      const actionRef = constructionActionRef({
        basis: subject.basis,
        vector: subject.vector
      });
      return [
        Object.freeze({
          runtimeSubject: subject,
          pressureRef,
          actionRef,
          targetOutcomeRef: constructionTargetOutcomeRef(subject.vector),
          missingTruthRefs: missingTruthRefsFor(subject.failing),
          blockingReasonRefs: blockingReasonRefsFor(subject),
          admissionBlockerRefs: admissionBlockerRefsFor(subject.projection),
          runtimeProjectionRef: publicRuntimeProjectionRef(subject.projection),
          hookResolution: hookResolutionForRuntimeSubject({
            context,
            subject
          })
        })
      ];
    })
  );
}

function actionKindForSubject(subject: GapsRuntimeSubject): ConstructionActionRow["actionKind"] {
  return subject.status === "human_gate_required"
    ? "open_fh_gate"
    : "invoke_graph_function";
}

function actionRowsForGapSubjects(
  gapSubjects: readonly ConstructionGapSubject[]
): readonly ConstructionActionRow[] {
  return Object.freeze(
    gapSubjects.map((gapSubject) => {
      const vector = gapSubject.runtimeSubject.vector;
      if (vector === null) {
        throw new TypeError("Construction gap subject requires a graph vector");
      }
      return constructConstructionActionRow({
        actionRef: gapSubject.actionRef,
        actionKind: actionKindForSubject(gapSubject.runtimeSubject),
        graphFunctionRef: gapSubject.runtimeSubject.basis.graphFunction.id,
        graphVectorRef: vector.id,
        publishedTraversalTargetRef:
          gapSubject.runtimeSubject.basis.graphFunction.id,
        targetOutcomeRef: gapSubject.targetOutcomeRef,
        inputAssetRefs: vector.source.map((node) => node.id),
        expectedOutputAssetRefs: [vector.target.id],
        requiredAuthorityRefs: [
          gapSubject.runtimeSubject.basis.graphFunction.id,
          gapSubject.runtimeSubject.basis.job.id,
          vector.id
        ],
        eligibleReasonRefs: [
          `published-graph-function:${gapSubject.runtimeSubject.basis.graphFunction.id}`,
          `graph-vector:${vector.id}`,
          ...gapSubject.blockingReasonRefs
        ],
        ineligibleReasonRefs: gapSubject.admissionBlockerRefs,
        hookSourceRefs: [
          [
            gapSubject.hookResolution.source,
            gapSubject.hookResolution.sourceRef,
            gapSubject.hookResolution.hookRef
          ].join(":")
        ],
        defaultPolicyRefs: [
          gapSubject.hookResolution.fallbackUsed
            ? gapSubject.hookResolution.sourceRef
            : gapSubject.hookResolution.configDigest
        ]
      });
    })
  );
}

function pressureRowsForGapSubjects(
  gapSubjects: readonly ConstructionGapSubject[]
): readonly ObservationPressureRow[] {
  return Object.freeze(
    gapSubjects.map((gapSubject) => {
      const vector = gapSubject.runtimeSubject.vector;
      if (vector === null) {
        throw new TypeError("Construction gap subject requires a graph vector");
      }
      return constructObservationPressureRow({
        pressureRef: gapSubject.pressureRef,
        pressureKind: "gap_row",
        sourceRef: gapSubject.runtimeProjectionRef,
        affectedAssetRefs: [vector.target.id],
        targetOutcomeRefs: [gapSubject.targetOutcomeRef],
        evidenceRefs: [
          ...gapSubject.missingTruthRefs,
          ...gapSubject.blockingReasonRefs
        ],
        severity: Math.max(
          1,
          gapSubject.runtimeSubject.projection.vectorCount -
            gapSubject.runtimeSubject.projection.closedVectorIndexes.length
        ),
        ambiguityClass: "none",
        authorityRefs: [
          gapSubject.runtimeSubject.basis.graphFunction.id,
          gapSubject.runtimeSubject.basis.job.id,
          vector.id
        ],
        affectSignalKind: null
      });
    })
  );
}

function constructionObservationAssetRefsForSubjects(
  subjects: readonly GapsRuntimeSubject[]
): {
  readonly linkedAssetRefs: readonly string[];
  readonly passedInputRefs: readonly string[];
} {
  const perSubject = subjects.map((subject) =>
    deriveConstructionObservationAssetRefsFromRuntimeTruth({
      basis: subject.basis,
      projection: subject.projection
    })
  );
  const passedInputRefs = Object.freeze(
    [
      ...new Set(perSubject.flatMap((refs) => refs.passedInputRefs))
    ].sort()
  );
  const passed = new Set(passedInputRefs);
  const linkedAssetRefs = Object.freeze(
    [
      ...new Set(perSubject.flatMap((refs) => refs.linkedAssetRefs))
    ]
      .filter((ref) => !passed.has(ref))
      .sort()
  );
  return Object.freeze({
    linkedAssetRefs,
    passedInputRefs
  });
}

function derivePublicGapsConstructionEvaluatorProjection(input: {
  readonly context: PublicGapsContext;
  readonly runtimeEvents: readonly RuntimeEvent[];
  readonly subjects: readonly GapsRuntimeSubject[];
}): PublicGapsConstructionEvaluatorProjection {
  const episodeId = constructionEpisodeId(input.context);
  const observationId = constructionObservationId(
    input.context,
    input.runtimeEvents
  );
  const gapSubjects = constructionGapSubjects(input.context, input.subjects);
  const hookResolutions = gapSubjects.map((subject) => subject.hookResolution);
  const observationAssetRefs = constructionObservationAssetRefsForSubjects(
    input.subjects
  );
  const hookResolutionDigest = stableDigest(
    hookResolutions.map((resolution) => ({
      resolutionRef: resolution.resolutionRef,
      source: resolution.source,
      sourceRef: resolution.sourceRef,
      hookRef: resolution.hookRef,
      configDigest: resolution.configDigest
    }))
  );
  const actionCatalog = constructConstructionActionCatalogProjection({
    catalogRef: `${constructionActionCatalogRef(input.context)}:${hookResolutionDigest}`,
    episodeId,
    hookResolutionRef: `construction-hook-resolution-set:${hookResolutionDigest}`,
    fallbackConfigDigest: hookResolutionDigest,
    rows: actionRowsForGapSubjects(gapSubjects)
  });
  const observation = constructConstructionObservationSnapshot({
    episodeId,
    observationId,
    basisRef: `public-gaps-basis:${input.context.module.name}`,
    currentProjectionRef: [
      "public-gaps-current-projection",
      input.context.module.name,
      String(input.runtimeEvents.length)
    ].join(":"),
    iterationOrdinal: 0,
    basisProjectionRef: `public-gaps-basis-projection:${input.context.module.name}`,
    priorIntentId: null,
    causationRef: "public-gaps-read-only-evaluator",
    correlationId: [
      "public-gaps",
      input.context.module.name,
      input.context.runId ?? "runless",
      input.context.workKey ?? "workspace"
    ].join(":"),
    runtimeAggregateRefs: input.subjects.map((subject) =>
      publicRuntimeProjectionRef(subject.projection)
    ),
    linkedAssetRefs: observationAssetRefs.linkedAssetRefs,
    passedInputRefs: observationAssetRefs.passedInputRefs,
    gapProjectionRefs: gapSubjects.map((subject) => subject.pressureRef),
    actionCatalogRef: actionCatalog.catalogRef,
    authorityDigest: [
      "public-gaps-authority",
      input.context.module.name,
      input.context.resolvedPolicy.resolvedPolicyBundleRef
    ].join(":"),
    pressureRows: pressureRowsForGapSubjects(gapSubjects)
  });
  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme: constructionPriorityScheme(input.context, hookResolutions),
    affectPolicies: input.context.constructionAffectPolicies ?? []
  });
  return Object.freeze({
    observation,
    actionCatalog,
    bindingProjection,
    priorityProjection,
    gapSubjects
  });
}

function constructEntry(input: {
  readonly subject: GapsRuntimeSubject;
  readonly typedAssetGaps: readonly PublicTypedAssetGapProjectionRow[];
}): PublicGapsEntry {
  const assessedIds = assessedObligationIdsForEdge(
    input.subject.events,
    input.subject.edge
  );
  const assessed = new Set(assessedIds);
  const expectedEvaluatorIds = Object.freeze(
    input.subject.vector?.evaluators.map((evaluator) => evaluator.name) ?? []
  );
  const passing = expectedEvaluatorIds.filter((id) => assessed.has(id));
  const closedVectorCount = input.subject.projection.closedVectorIndexes.length;
  const openVectorCount =
    input.subject.projection.vectorCount - closedVectorCount;
  const dispatchRequested = dispatchAlreadyRequested(
    input.subject.basis,
    input.subject.events
  );

  return constructPublicGapsEntry({
    graphFunctionId: input.subject.basis.graphFunction.id,
    graphFunctionHandle: input.subject.basis.graphFunction.name,
    jobId: input.subject.basis.job.id,
    jobName: input.subject.basis.job.name,
    edge: input.subject.edge,
    vectorIndex: input.subject.vectorIndex,
    vectorCount: input.subject.projection.vectorCount,
    closedVectorCount,
    openVectorCount,
    delta:
      input.subject.projection.vectorCount === 0
        ? 0
        : openVectorCount / input.subject.projection.vectorCount,
    failing: input.subject.failing,
    passing,
    deltaSummary: constructPublicGapsDeltaSummary({
      vectorCount: input.subject.projection.vectorCount,
      closedVectorCount,
      openVectorCount,
      plannedVectorIndexes: input.subject.projection.plannedVectorIndexes,
      evaluatedVectorIndexes: input.subject.projection.evaluatedVectorIndexes,
      closedVectorIndexes: input.subject.projection.closedVectorIndexes,
      assessedEdges: input.subject.projection.assessedEdges
    }),
    environmentReady: input.subject.projection.failedLeafTaskIds.length === 0,
    status: input.subject.status,
    stopPredicate: input.subject.stopDetail.stopPredicate,
    dispatchRef: input.subject.stopDetail.dispatchRef,
    approvalSubjectRef: input.subject.stopDetail.approvalSubjectRef,
    terminalKind: input.subject.stopDetail.terminalKind,
    nextStep: nextStepForEntry({
      status: input.subject.status,
      dispatchRequested
    }),
    dispatchRequested,
    typedAssetGaps: input.typedAssetGaps,
    projection: input.subject.projection
  });
}

function gapSubjectForRuntimeSubject(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  subject: GapsRuntimeSubject
): ConstructionGapSubject | null {
  return (
    evaluator.gapSubjects.find(
      (candidate) => candidate.runtimeSubject.projection.basisId === subject.projection.basisId
    ) ?? null
  );
}

function priorityRowForGapSubject(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  gapSubject: ConstructionGapSubject
): ConstructionPriorityRow | null {
  return (
    evaluator.priorityProjection.rows.find(
      (row) =>
        row.actionRef === gapSubject.actionRef &&
        row.pressureRef === gapSubject.pressureRef
    ) ?? null
  );
}

function bindingRowForPriorityRow(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  priorityRow: ConstructionPriorityRow
) {
  return (
    evaluator.bindingProjection.rows.find(
      (row) => row.bindingRef === priorityRow.bindingRef
    ) ?? null
  );
}

function priorityRowIsEligible(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  priorityRow: ConstructionPriorityRow
): boolean {
  const bindingRow = bindingRowForPriorityRow(evaluator, priorityRow);
  return (
    bindingRow !== null &&
    bindingRow.missingInputRefs.length === 0 &&
    bindingRow.ineligibleReasonRefs.length === 0
  );
}

function bestEligiblePriorityRowForGapSubject(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  gapSubject: ConstructionGapSubject
): ConstructionPriorityRow | null {
  return (
    evaluator.priorityProjection.rows.find(
      (row) =>
        row.actionRef === gapSubject.actionRef &&
        row.pressureRef === gapSubject.pressureRef &&
        priorityRowIsEligible(evaluator, row)
    ) ?? null
  );
}

function admissionBlockerRefsForPriorityRow(input: {
  readonly evaluator: PublicGapsConstructionEvaluatorProjection;
  readonly priorityRow: ConstructionPriorityRow;
  readonly gapSubject: ConstructionGapSubject;
}): readonly string[] {
  const bindingRow = bindingRowForPriorityRow(
    input.evaluator,
    input.priorityRow
  );
  return Object.freeze([
    ...input.gapSubject.admissionBlockerRefs,
    ...(bindingRow?.missingInputRefs.map((ref) => `missing-input:${ref}`) ?? []),
    ...(bindingRow?.ineligibleReasonRefs ?? [])
  ]);
}

function actionRowForGapSubject(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  gapSubject: ConstructionGapSubject
): ConstructionActionRow | null {
  return (
    evaluator.actionCatalog.rows.find(
      (row) => row.actionRef === gapSubject.actionRef
    ) ?? null
  );
}

function eligibleActionRefsForGapSubject(
  evaluator: PublicGapsConstructionEvaluatorProjection,
  gapSubject: ConstructionGapSubject
): readonly string[] {
  return Object.freeze(
    evaluator.bindingProjection.rows
      .filter(
        (row) =>
          row.pressureRef === gapSubject.pressureRef &&
          row.missingInputRefs.length === 0 &&
          row.ineligibleReasonRefs.length === 0
      )
      .map((row) => row.actionRef)
  );
}

function admissionBlockerRefsForGapSubject(input: {
  readonly evaluator: PublicGapsConstructionEvaluatorProjection;
  readonly gapSubject: ConstructionGapSubject;
}): readonly string[] {
  return Object.freeze([
    ...input.gapSubject.admissionBlockerRefs,
    ...input.evaluator.bindingProjection.rows
      .filter((row) => row.pressureRef === input.gapSubject.pressureRef)
      .flatMap((row) => [
        ...row.missingInputRefs.map((ref) => `missing-input:${ref}`),
        ...row.ineligibleReasonRefs
      ])
  ]);
}

function typedAssetGapRowsForSubject(input: {
  readonly subject: GapsRuntimeSubject;
  readonly evaluator: PublicGapsConstructionEvaluatorProjection;
}): readonly PublicTypedAssetGapProjectionRow[] {
  if (
    input.subject.vector === null ||
    input.subject.status === "converged" ||
    input.subject.status === "nothing_to_do"
  ) {
    return Object.freeze([]);
  }
  const gapSubject = gapSubjectForRuntimeSubject(
    input.evaluator,
    input.subject
  );
  if (gapSubject === null) {
    return Object.freeze([]);
  }
  const priorityRow = priorityRowForGapSubject(input.evaluator, gapSubject);
  const bestEligiblePriorityRow = bestEligiblePriorityRowForGapSubject(
    input.evaluator,
    gapSubject
  );
  const actionRow =
    bestEligiblePriorityRow === null
      ? null
      : actionRowForGapSubject(input.evaluator, gapSubject);
  return Object.freeze([
    Object.freeze({
      gapRef: `typed-asset-gap:${input.subject.projection.basisId}:${input.subject.vector.id}:${input.subject.vector.target.id}`,
      observationId: input.evaluator.observation.observationId,
      assetRef: input.subject.vector.target.id,
      assetKind: input.subject.vector.target.assetSurface.kind,
      requiredByRef: input.subject.vector.id,
      missingTruthRefs: gapSubject.missingTruthRefs,
      blockingReasonRefs: gapSubject.blockingReasonRefs,
      eligibleActionRefs: eligibleActionRefsForGapSubject(
        input.evaluator,
        gapSubject
      ),
      bestActionRef: bestEligiblePriorityRow?.actionRef ?? null,
      bestGraphFunctionRef: actionRow?.graphFunctionRef ?? null,
      bestGraphVectorRef: actionRow?.graphVectorRef ?? null,
      terminalRouteRef:
        bestEligiblePriorityRow?.terminalRouteRef ??
        input.subject.stopDetail.approvalSubjectRef,
      admissionBlockerRefs: admissionBlockerRefsForGapSubject({
        evaluator: input.evaluator,
        gapSubject
      }),
      priorityRank: priorityRow?.rankOrdinal ?? Number.MAX_SAFE_INTEGER,
      rankingReasonRefs:
        (bestEligiblePriorityRow ?? priorityRow)?.rankReasonRefs ??
        gapSubject.blockingReasonRefs,
      sourceProjectionRefs: Object.freeze([
        gapSubject.runtimeProjectionRef,
        input.evaluator.observation.observationId,
        input.evaluator.actionCatalog.catalogRef,
        input.evaluator.bindingProjection.projectionRef,
        input.evaluator.priorityProjection.projectionRef
      ]),
      actionCatalogRef: input.evaluator.actionCatalog.catalogRef,
      priorityProjectionRef: input.evaluator.priorityProjection.projectionRef
    })
  ]);
}

function readOnlyEvaluatorProjection(
  evaluator: PublicGapsConstructionEvaluatorProjection
): PublicGapsProjection["readOnlyEvaluator"] {
  const highestPriorityRow = evaluator.priorityProjection.rows[0] ?? null;
  const bestPriorityRow =
    evaluator.priorityProjection.rows.find((row) =>
      priorityRowIsEligible(evaluator, row)
    ) ?? null;
  const displayedPriorityRow = bestPriorityRow ?? highestPriorityRow;
  const bestGapSubject =
    displayedPriorityRow === null
      ? null
      : evaluator.gapSubjects.find(
          (gapSubject) =>
            gapSubject.actionRef === displayedPriorityRow.actionRef &&
            gapSubject.pressureRef === displayedPriorityRow.pressureRef
        ) ?? null;
  const bestAction =
    bestPriorityRow === null || bestGapSubject === null
      ? null
      : actionRowForGapSubject(evaluator, bestGapSubject);
  const bestVector = bestGapSubject?.runtimeSubject.vector ?? null;
  return Object.freeze({
    kind: "public_gaps_read_only_evaluator_projection",
    evaluatorRef: evaluator.priorityProjection.projectionRef,
    mutationAllowed: false,
    bestGapRef:
      bestGapSubject === null || bestVector === null
        ? null
        : `typed-asset-gap:${bestGapSubject.runtimeSubject.projection.basisId}:${bestVector.id}:${bestVector.target.id}`,
    bestAssetRef: bestVector?.target.id ?? null,
    bestActionRef: bestPriorityRow?.actionRef ?? null,
    bestGraphFunctionRef: bestAction?.graphFunctionRef ?? null,
    bestGraphVectorRef: bestAction?.graphVectorRef ?? null,
    admissionBlockerRefs:
      bestGapSubject === null || displayedPriorityRow === null
        ? Object.freeze([])
        : admissionBlockerRefsForPriorityRow({
            evaluator,
            priorityRow: displayedPriorityRow,
            gapSubject: bestGapSubject
          }),
    rankingReasonRefs:
      displayedPriorityRow?.rankReasonRefs ?? Object.freeze([]),
    sourceProjectionRefs:
      bestGapSubject === null
        ? Object.freeze([evaluator.priorityProjection.projectionRef])
        : Object.freeze([
            bestGapSubject.runtimeProjectionRef,
            evaluator.observation.observationId,
            evaluator.actionCatalog.catalogRef,
            evaluator.bindingProjection.projectionRef,
            evaluator.priorityProjection.projectionRef
          ])
  });
}

function overallStatus(entries: readonly PublicGapsEntry[]): PublicGapsStatus {
  if (entries.length === 0) {
    throw new TypeError(
      "Public gaps projection requires at least one semantic job in scope"
    );
  }
  if (entries.every((entry) => entry.status === "nothing_to_do")) {
    return "nothing_to_do";
  }
  if (
    entries.every(
      (entry) => entry.status === "converged" || entry.status === "nothing_to_do"
    )
  ) {
    return "converged";
  }
  if (
    entries.some(
      (entry) =>
        entry.status === "dispatch_required" ||
        entry.status === "human_gate_required"
    )
  ) {
    return "blocked";
  }
  return "open";
}

export function projectPublicGapsFromRequest(
  request: PublicGapsRequest,
  context: PublicGapsContext
): PublicGapsProjection {
  if (request.scope.moduleName !== context.module.name) {
    throw new TypeError(
      `Public gaps scope moduleName ${JSON.stringify(request.scope.moduleName)} does not match context module ${JSON.stringify(context.module.name)}`
    );
  }

  const runtimeEvents = context.runtimeEvents ?? Object.freeze([]);
  const subjects = collectGapsJobBindings(context).map((binding) => {
    const basis = executionBasisForBinding(request, context, binding);
    const scopedEvents = eventsForBasis(basis, runtimeEvents);
    const projection = deriveRuntimeAggregateProjection(basis, scopedEvents);
    const transition = deriveAdvancementTransition(basis, scopedEvents);
    return constructRuntimeSubject({
      binding,
      basis,
      projection,
      transition,
      events: scopedEvents
    });
  });
  const constructionEvaluator = derivePublicGapsConstructionEvaluatorProjection({
    context,
    runtimeEvents,
    subjects
  });
  const entries = subjects.map((subject) =>
    constructEntry({
      subject,
      typedAssetGaps: typedAssetGapRowsForSubject({
        subject,
        evaluator: constructionEvaluator
      })
    })
  );
  const status = overallStatus(entries);
  const totalDelta = entries.reduce((total, entry) => total + entry.delta, 0);
  const openFrames = entries.filter(
    (entry) => entry.projection.frameId !== null && entry.status !== "converged"
  ).length;

  return constructPublicGapsProjection({
    kind: "public_gaps_projection",
    status,
    scope: {
      package: context.module.name,
      selector: {
        kind: "workspace",
        workKey: context.workKey ?? null
      },
      build: context.runtimeIdentity.buildId,
      runtimeIdentity: runtimeIdentityProjection(context)
    },
    jobsConsidered: entries.length,
    totalDelta,
    openFrames,
    converged: status === "converged" || status === "nothing_to_do",
    eventCount: runtimeEvents.length,
    readOnlyEvaluator: readOnlyEvaluatorProjection(constructionEvaluator),
    gaps: entries
  });
}

export function publicGaps(
  input: unknown,
  context: PublicGapsContext
): PublicGapsProjection {
  return projectPublicGapsFromRequest(admitPublicGapsRequest(input), context);
}
