// Implements: REQ-F-ODDSDLC-003
// Implements: REQ-F-ODDSDLC-021
// Implements: REQ-F-ODDSDLC-029

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  admitExecutionBasis,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent,
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  deriveAdvancementTransition,
  type AdvancementTransition,
  type GraphFunction,
  type ExecutionBasis,
  type Module,
  type RuntimeEvent,
  type RuntimeRegime,
  type StartIntent,
  type StartRuntimeTraversalStrategySelection
} from "@abiogenesis/typescript-tenant";
import {
  parseArray,
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import {
  deriveSdlcTargetObligationBinding,
  type SdlcQueryDomainProjection
} from "../projection/index.js";
import {
  constructSdlcOverlayBinding,
  constructSdlcBootstrapPublicStartOptimization,
  constructSdlcTraversalOverlayCatalog,
  FG_BOOTSTRAP_SDLC_ENTRY,
  FG_CONFORM_PROJECT,
	  publicSdlcOverlayStartTargets,
	  resolveSdlcTraversalOverlay,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
	  SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF,
	  SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF,
	  sdlcGraphFunctionBoundaryRef,
	  sdlcPublishedActionRef,
	  sdlcTraversalOverlayForGraphFunction,
  type SdlcOverlayBinding,
  type SdlcBootstrapPublicStartOptimization,
  type SdlcTraversalOverlay,
  type SdlcTraversalOverlayRef
} from "../graph/index.js";
import {
  deriveOddSdlcEvaluateNextReport,
  type OddSdlcEvaluateNextActionInput
} from "../runtime/index.js";
import { assertCurrentSdlcGtlProgramConformance } from "../gtl_conformance/index.js";
import {
  constructSdlcConstructionIntent,
  constructSdlcNextActionProjection,
  type SdlcConstructionIntent,
  type SdlcNextActionProjection
} from "../operator/traversal_consequence.js";
import {
  resolveSdlcTicketExecutionContractForAssetHandle,
  sdlcTicketExecutionContractRefs,
  type SdlcTicketExecutionBlockingReason,
  type SdlcTicketExecutionContract
} from "../tickets/index.js";
import { deriveSdlcPreRuntimePlanningCompositionIdentity } from "../operator/composition_identity.js";
import {
  deriveSdlcDecompositionSummary,
  SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS
} from "../operator/decomposition_admission.js";
import { deriveSdlcTraversalHopSelection } from "../operator/traversal_complexity.js";
import { resolveSdlcTraversalOutcomeClass } from "../contracts/carrier_domain_catalog.js";
import type {
  SdlcDecompositionSummary,
  SdlcTraversalHopSelection,
  SdlcTraversalOutcomeClass
} from "../operator/carriers.js";
import { isRecord } from "../admission/codecs.js";
import type { SdlcConformProjectProfile } from "../workspace/index.js";
import { publicStartTargetPolicyFor } from "./policy.js";

export const SDLC_PUBLIC_START_TARGET_KIND_VALUES = Object.freeze([
  "next",
  "graph_function",
  "asset",
  "overlay"
] as const);

export type SdlcPublicStartTargetKind =
  (typeof SDLC_PUBLIC_START_TARGET_KIND_VALUES)[number];

export const SDLC_PUBLIC_START_UNTIL_VALUES = Object.freeze([
  "first_traversal",
  "blocked",
  "converged"
] as const);

export type SdlcPublicStartUntil =
  (typeof SDLC_PUBLIC_START_UNTIL_VALUES)[number];

export interface SdlcPublicStartRequest {
  readonly kind: "sdlc_public_start_request";
  readonly workspaceRoot: string;
  readonly outputWorkspaceRoot?: string | null;
  readonly target: {
    readonly kind: SdlcPublicStartTargetKind;
    readonly handle: string;
  };
  readonly until: SdlcPublicStartUntil;
  readonly defaultRegime: RuntimeRegime;
  readonly replayNextActionProjectionRef?: string | null;
  readonly replaySelectedActionRef?: string | null;
  readonly replayNextGraphFunctionRef?: string | null;
  readonly replayNextGraphVectorRef?: string | null;
  readonly replayClosureDecisionRef?: string | null;
  readonly replayOverlayRef?: string | null;
  readonly replayOverlayBindingRef?: string | null;
  readonly runtimeTraversalSelections?: readonly StartRuntimeTraversalStrategySelection[];
}

export interface SdlcWorkerAttachment {
  readonly kind: "sdlc_worker_attachment";
  readonly status: "attached" | "unattached";
  readonly transportContract: string | null;
  readonly blockingReason: "fp_worker_unattached" | null;
}

export interface SdlcExecutionContract {
  readonly kind: "sdlc_execution_contract";
  readonly targetGraphFunction: string;
  readonly ticketExecutionContract: SdlcTicketExecutionContract | null;
  readonly overlayRef: string;
  readonly overlayBindingRef: string;
  readonly overlayBinding: SdlcOverlayBinding;
  readonly requestedUntil: SdlcPublicStartUntil;
  readonly conformedProject: SdlcConformProjectProfile;
  readonly basis: ExecutionBasis;
  readonly workerAttachment: SdlcWorkerAttachment;
  readonly nextActionProjection: SdlcNextActionProjection;
  readonly constructionIntent: SdlcConstructionIntent;
  readonly traversalDecompositionSummary: SdlcDecompositionSummary | null;
  readonly traversalHopSelection: SdlcTraversalHopSelection | null;
  readonly bootstrapOptimization: SdlcBootstrapPublicStartOptimization;
  readonly runtimeTraversalSelections?: readonly StartRuntimeTraversalStrategySelection[];
}

export type SdlcPublicStartOutcome =
  | {
      readonly kind: "sdlc_public_start_blocked";
      readonly status: "blocked";
      readonly blockingReason:
        | "fp_worker_unattached"
        | "target_unavailable"
        | "stale_query_domain"
        | "project_conformance_blocked"
        | SdlcTicketExecutionBlockingReason;
      readonly stopPredicate: "worker_attachment_required" | "gap_stop";
      readonly executionContract: SdlcExecutionContract | null;
      readonly emittedRuntimeEventKinds: readonly RuntimeEvent["kind"][];
    }
  | {
      readonly kind: "sdlc_public_start_projected";
      readonly status: "dispatch_required" | "advanced" | "converged";
      readonly executionContract: SdlcExecutionContract;
      readonly transition: AdvancementTransition;
      readonly emittedRuntimeEventKinds: readonly RuntimeEvent["kind"][];
    };

export function admitSdlcPublicStartRequest(
  input: unknown,
  label = "SdlcPublicStartRequest"
): SdlcPublicStartRequest {
  const record = parseClosedRecord(input, label, [
    "workspaceRoot",
    "outputWorkspaceRoot",
    "target",
    "until",
    "defaultRegime",
    "replayNextActionProjectionRef",
    "replaySelectedActionRef",
    "replayNextGraphFunctionRef",
    "replayNextGraphVectorRef",
    "replayClosureDecisionRef",
    "replayOverlayRef",
    "replayOverlayBindingRef",
    "runtimeTraversalSelections"
  ]);
  const target = parseClosedRecord(record["target"], `${label}.target`, [
    "kind",
    "handle"
  ]);
  const runtimeTraversalSelections = admitSdlcRuntimeTraversalSelections(
    record["runtimeTraversalSelections"],
    `${label}.runtimeTraversalSelections`
  );
  return Object.freeze({
    kind: "sdlc_public_start_request",
    workspaceRoot: parseNonEmptyString(record["workspaceRoot"], `${label}.workspaceRoot`),
    outputWorkspaceRoot: record["outputWorkspaceRoot"] === undefined ||
      record["outputWorkspaceRoot"] === null
      ? null
      : parseNonEmptyString(
          record["outputWorkspaceRoot"],
          `${label}.outputWorkspaceRoot`
        ),
    target: Object.freeze({
      kind: parseEnumValue(
        target["kind"],
        `${label}.target.kind`,
        SDLC_PUBLIC_START_TARGET_KIND_VALUES
      ),
      handle: parseNonEmptyString(target["handle"], `${label}.target.handle`)
    }),
    until: parseEnumValue(record["until"], `${label}.until`, SDLC_PUBLIC_START_UNTIL_VALUES),
    defaultRegime: parseEnumValue(
      record["defaultRegime"],
      `${label}.defaultRegime`,
      ["F_D", "F_P", "F_H"]
    ),
    replayNextActionProjectionRef:
      record["replayNextActionProjectionRef"] === undefined ||
      record["replayNextActionProjectionRef"] === null
        ? null
        : parseNonEmptyString(
            record["replayNextActionProjectionRef"],
            `${label}.replayNextActionProjectionRef`
          ),
    replaySelectedActionRef:
      record["replaySelectedActionRef"] === undefined ||
      record["replaySelectedActionRef"] === null
        ? null
        : parseNonEmptyString(
            record["replaySelectedActionRef"],
            `${label}.replaySelectedActionRef`
          ),
    replayNextGraphFunctionRef:
      record["replayNextGraphFunctionRef"] === undefined ||
      record["replayNextGraphFunctionRef"] === null
        ? null
        : parseNonEmptyString(
            record["replayNextGraphFunctionRef"],
            `${label}.replayNextGraphFunctionRef`
          ),
    replayNextGraphVectorRef:
      record["replayNextGraphVectorRef"] === undefined ||
      record["replayNextGraphVectorRef"] === null
        ? null
        : parseNonEmptyString(
            record["replayNextGraphVectorRef"],
            `${label}.replayNextGraphVectorRef`
          ),
    replayClosureDecisionRef:
      record["replayClosureDecisionRef"] === undefined ||
      record["replayClosureDecisionRef"] === null
        ? null
        : parseNonEmptyString(
            record["replayClosureDecisionRef"],
            `${label}.replayClosureDecisionRef`
          ),
    replayOverlayRef:
      record["replayOverlayRef"] === undefined ||
      record["replayOverlayRef"] === null
        ? null
        : parseNonEmptyString(
            record["replayOverlayRef"],
            `${label}.replayOverlayRef`
          ),
    replayOverlayBindingRef:
      record["replayOverlayBindingRef"] === undefined ||
      record["replayOverlayBindingRef"] === null
        ? null
        : parseNonEmptyString(
            record["replayOverlayBindingRef"],
            `${label}.replayOverlayBindingRef`
          ),
    ...(runtimeTraversalSelections === undefined
      ? {}
      : { runtimeTraversalSelections })
  });
}

function parseOptionalNumber(
  input: unknown,
  label: string
): number | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input !== "number" || !Number.isFinite(input)) {
    throw new TypeError(`${label}: expected finite number`);
  }
  return input;
}

function parseOptionalStringList(
  input: unknown,
  label: string
): readonly string[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return parseStringList(input, label);
}

function parseOptionalNumberList(
  input: unknown,
  label: string
): readonly number[] | undefined {
  if (input === undefined) {
    return undefined;
  }
  return parseArray(input, label, (item, itemLabel) => {
    if (typeof item !== "number" || !Number.isInteger(item) || item < 0) {
      throw new TypeError(`${itemLabel}: expected non-negative integer`);
    }
    return item;
  });
}

function parseRuntimeTraversalBatch(
  input: unknown,
  label: string
): StartRuntimeTraversalStrategySelection["batch"] | undefined {
  if (input === undefined) {
    return undefined;
  }
  const record = parseClosedRecord(input, label, [
    "targetItemCount",
    "maxItemCount",
    "maxTokenPressure"
  ]);
  const targetItemCount = parseOptionalNumber(
    record["targetItemCount"],
    `${label}.targetItemCount`
  );
  const maxItemCount = parseOptionalNumber(
    record["maxItemCount"],
    `${label}.maxItemCount`
  );
  const maxTokenPressure = parseOptionalNumber(
    record["maxTokenPressure"],
    `${label}.maxTokenPressure`
  );
  return Object.freeze({
    ...(targetItemCount === undefined ? {} : { targetItemCount }),
    ...(maxItemCount === undefined ? {} : { maxItemCount }),
    ...(maxTokenPressure === undefined ? {} : { maxTokenPressure })
  });
}

function parseRuntimeTraversalContinuation(
  input: unknown,
  label: string
): StartRuntimeTraversalStrategySelection["continuation"] | undefined {
  if (input === undefined) {
    return undefined;
  }
  const record = parseClosedRecord(input, label, [
    "sameEdgeUntil",
    "maxAttemptsWithoutNewSignal",
    "maxTotalAttempts"
  ]);
  const sameEdgeUntil =
    record["sameEdgeUntil"] === undefined
      ? undefined
      : parseEnumValue(
          record["sameEdgeUntil"],
          `${label}.sameEdgeUntil`,
          ["foldback_closed", "retry_budget_exhausted"]
        );
  const maxAttemptsWithoutNewSignal = parseOptionalNumber(
    record["maxAttemptsWithoutNewSignal"],
    `${label}.maxAttemptsWithoutNewSignal`
  );
  const maxTotalAttempts = parseOptionalNumber(
    record["maxTotalAttempts"],
    `${label}.maxTotalAttempts`
  );
  return Object.freeze({
    ...(sameEdgeUntil === undefined ? {} : { sameEdgeUntil }),
    ...(maxAttemptsWithoutNewSignal === undefined
      ? {}
      : { maxAttemptsWithoutNewSignal }),
    ...(maxTotalAttempts === undefined ? {} : { maxTotalAttempts })
  });
}

function parseRuntimeTraversalSelection(
  input: unknown,
  label: string
): StartRuntimeTraversalStrategySelection {
  const record = parseClosedRecord(input, label, [
    "kind",
    "selectionRef",
    "strategyOwnerRef",
    "strategyLabel",
    "enforcementPrimitives",
    "selectedScheduleItemRefs",
    "requiredProgressArtifactRefs",
    "orderingConstraintRefs",
    "phaseGateRefs",
    "basisRefs",
    "vectorIndexes",
    "edgeRefs",
    "batch",
    "continuation"
  ]);
  const batch = parseRuntimeTraversalBatch(record["batch"], `${label}.batch`);
  const continuation = parseRuntimeTraversalContinuation(
    record["continuation"],
    `${label}.continuation`
  );
  const requiredProgressArtifactRefs = parseOptionalStringList(
    record["requiredProgressArtifactRefs"],
    `${label}.requiredProgressArtifactRefs`
  );
  const orderingConstraintRefs = parseOptionalStringList(
    record["orderingConstraintRefs"],
    `${label}.orderingConstraintRefs`
  );
  const phaseGateRefs = parseOptionalStringList(
    record["phaseGateRefs"],
    `${label}.phaseGateRefs`
  );
  const basisRefs = parseOptionalStringList(
    record["basisRefs"],
    `${label}.basisRefs`
  );
  const vectorIndexes = parseOptionalNumberList(
    record["vectorIndexes"],
    `${label}.vectorIndexes`
  );
  const edgeRefs = parseOptionalStringList(
    record["edgeRefs"],
    `${label}.edgeRefs`
  );
  return Object.freeze({
    kind: parseEnumValue(
      record["kind"],
      `${label}.kind`,
      ["start_runtime_traversal_strategy_selection"]
    ),
    selectionRef: parseNonEmptyString(
      record["selectionRef"],
      `${label}.selectionRef`
    ),
    strategyOwnerRef: parseNonEmptyString(
      record["strategyOwnerRef"],
      `${label}.strategyOwnerRef`
    ),
    strategyLabel: parseNonEmptyString(
      record["strategyLabel"],
      `${label}.strategyLabel`
    ),
    enforcementPrimitives: parseStringList(
      record["enforcementPrimitives"],
      `${label}.enforcementPrimitives`
    ),
    selectedScheduleItemRefs: parseStringList(
      record["selectedScheduleItemRefs"],
      `${label}.selectedScheduleItemRefs`
    ),
    ...(requiredProgressArtifactRefs === undefined
      ? {}
      : { requiredProgressArtifactRefs }),
    ...(orderingConstraintRefs === undefined ? {} : { orderingConstraintRefs }),
    ...(phaseGateRefs === undefined ? {} : { phaseGateRefs }),
    ...(basisRefs === undefined ? {} : { basisRefs }),
    ...(vectorIndexes === undefined ? {} : { vectorIndexes }),
    ...(edgeRefs === undefined ? {} : { edgeRefs }),
    ...(batch === undefined ? {} : { batch }),
    ...(continuation === undefined ? {} : { continuation })
  });
}

export function admitSdlcRuntimeTraversalSelections(
  input: unknown,
  label = "SdlcRuntimeTraversalSelections"
): readonly StartRuntimeTraversalStrategySelection[] | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }
  const selections = parseArray(input, label, parseRuntimeTraversalSelection);
  return selections.length === 0 ? undefined : selections;
}

export function projectSdlcWorkerAttachment(input: {
  readonly transportContract?: string | null;
}): SdlcWorkerAttachment {
  const rawTransportContract = input.transportContract ?? null;
  const transportContract =
    rawTransportContract === null
      ? null
      : parseNonEmptyString(
          rawTransportContract.trim(),
          "SdlcWorkerAttachment.transportContract"
        );
  return Object.freeze({
    kind: "sdlc_worker_attachment",
    status: transportContract === null ? "unattached" : "attached",
    transportContract,
    blockingReason: transportContract === null ? "fp_worker_unattached" : null
  });
}

interface PublicStartActionCandidate {
  readonly graphFunctionName: string;
  readonly graphFunctionRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
}

interface PublicStartEvaluation {
  readonly targetGraphFunction: string | null;
  readonly blockingReason:
    | "target_unavailable"
    | "stale_query_domain"
    | SdlcTicketExecutionBlockingReason
    | null;
  readonly ticketExecutionContract: SdlcTicketExecutionContract | null;
  readonly overlayBinding: SdlcOverlayBinding | null;
  readonly nextActionProjection: SdlcNextActionProjection | null;
  readonly constructionIntent: SdlcConstructionIntent | null;
  readonly traversalDecompositionSummary: SdlcDecompositionSummary | null;
  readonly traversalHopSelection: SdlcTraversalHopSelection | null;
  readonly bootstrapOptimization: SdlcBootstrapPublicStartOptimization | null;
}

const SDLC_ROUTE_TICKET_WORK_ITEM_GRAPH_FUNCTION = "route_ticket_work_item" as const;

function statSafe(target: string) {
  try {
    return statSync(target);
  } catch {
    return null;
  }
}

function jsonRecordFromFile(filePath: string): Readonly<Record<string, unknown>> | null {
  const stats = statSafe(filePath);
  if (stats === null || !stats.isFile()) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function stringField(
  record: Readonly<Record<string, unknown>> | null,
  field: string
): string | null {
  const value = record?.[field];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isSdlcTraversalOverlayRef(value: string): value is SdlcTraversalOverlayRef {
  return value.startsWith("overlay://odd-sdlc/") &&
    value.length > "overlay://odd-sdlc/".length;
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function capabilityValue(
  profile: SdlcConformProjectProfile,
  name: string
): string | null {
  return profile.capabilityContracts.find((contract) => contract.name === name)
    ?.value ?? null;
}

function truthyCapability(profile: SdlcConformProjectProfile, name: string): boolean {
  const normalized = capabilityValue(profile, name)?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function traversalOutcomeClassForPublicStart(
  profile: SdlcConformProjectProfile
): SdlcTraversalOutcomeClass {
  return resolveSdlcTraversalOutcomeClass({
    explicitValue: capabilityValue(profile, "sdlc_outcome_class"),
    trivialProduct: truthyCapability(profile, "trivial_product")
  }).outcomeClass;
}

type PublicStartTraversalSelection = {
  readonly summary: SdlcDecompositionSummary;
  readonly selection: SdlcTraversalHopSelection;
};

function triagedEntryOverlayRefForProfile(
  profile: SdlcConformProjectProfile
): SdlcTraversalOverlayRef {
  const profileOverlayRef = isSdlcTraversalOverlayRef(profile.overlayRef)
    ? profile.overlayRef
    : SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF;
  if (
    profile.overlayStrategy === "thread" ||
    profileOverlayRef === SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  ) {
    return SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF;
  }
  if (
    profile.overlayStrategy === "min_fp" ||
    profileOverlayRef === SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF
  ) {
    return SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF;
  }
  if (
    profile.overlayStrategy === "breadth" ||
    traversalOutcomeClassForPublicStart(profile) === "domain_product"
  ) {
    return profileOverlayRef;
  }
  if (profileOverlayRef !== SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF) {
    return profileOverlayRef;
  }
  return SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF;
}

function ticketContractRequestsCurrentFullTraversal(
  contract: SdlcTicketExecutionContract
): boolean {
  return contract.overlayContinuationRows.some(
    (row) =>
      row.selectedStartTargetRef === SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF &&
      row.ruling !== "close" &&
      row.ruling !== "defer"
  );
}

function triagedPublicStartEntryOverlayRef(input: {
  readonly profile: SdlcConformProjectProfile;
  readonly ticketExecutionContract: SdlcTicketExecutionContract | null;
}): SdlcTraversalOverlayRef {
  if (input.ticketExecutionContract !== null) {
    return ticketContractRequestsCurrentFullTraversal(input.ticketExecutionContract)
      ? SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
      : SDLC_TICKET_WORKFLOW_OVERLAY_REF;
  }
  return triagedEntryOverlayRefForProfile(input.profile);
}

function frontDoorTraversalSelection(input: {
  readonly request: SdlcPublicStartRequest;
  readonly profile: SdlcConformProjectProfile;
  readonly overlay: SdlcTraversalOverlay;
}): PublicStartTraversalSelection | null {
  if (input.request.target.kind !== "next") {
    return null;
  }
  return overlayTraversalSelection({
    overlay: input.overlay,
    profile: input.profile
  });
}

function overlayTraversalSelection(input: {
  readonly overlay: SdlcTraversalOverlay;
  readonly profile: SdlcConformProjectProfile;
}): PublicStartTraversalSelection | null {
  if (
    input.overlay.overlayRef !== SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF &&
    input.overlay.overlayRef !== SDLC_LITE_DESIGN_MODULE_IMPLEMENTATION_OVERLAY_REF
  ) {
    return null;
  }
  const outcomeClass = traversalOutcomeClassForPublicStart(input.profile);
  if (outcomeClass === "domain_product") {
    return null;
  }
  const overlaySegment =
    input.overlay.overlayRef === SDLC_FRAMEWORK_SMOKE_MIN_FP_OVERLAY_REF
      ? "framework-smoke-min-fp"
      : "lite-design-module-implementation";
  const upstreamRef =
    `requirement://odd-sdlc/public-start/${input.profile.projectSlug}/${overlaySegment}`;
  const summary = deriveSdlcDecompositionSummary({
    stageId: `public_start_${overlaySegment.replaceAll("-", "_")}`,
    upstreamKind: "requirement",
    downstreamKind: "component",
    thresholds: SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    stageUpstreamUniverseRefs: [upstreamRef],
    requireTrivialDegenerateProduct: true,
    rows: [
      {
        downstreamId: "component://framework-smoke/hello-world",
        parentId: "module://framework-smoke",
        ownedUpstreamRefs: [upstreamRef],
        publicBoundaryRefs: [
          `${input.profile.selectedOutputRoot}/src`
        ],
        substantiveResponsibilityRefs: [
          "behavior://framework-smoke/hello-world"
        ],
        materializationTargetRefs: [
          `${input.profile.selectedOutputRoot}/src`
        ]
      }
    ]
  });
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef:
      `selection://odd-sdlc/public-start/${input.profile.projectSlug}/${overlaySegment}`,
    outcomeClass,
    decompositionSummary: summary,
    bundleEligible: true,
    skippedEdgeRefs: Object.freeze([]),
    evidenceRefs: Object.freeze([
      "capability://odd-sdlc/trivial_product",
      input.overlay.overlayRef
    ])
  });
  return Object.freeze({ summary, selection });
}

function publicStartBootstrapOptimization(input: {
  readonly request: SdlcPublicStartRequest;
  readonly module: Module;
  readonly profile: SdlcConformProjectProfile;
  readonly selectedOverlay: SdlcTraversalOverlay;
  readonly selectedCandidate: PublicStartActionCandidate;
  readonly selectedTraversal: PublicStartTraversalSelection | null;
  readonly sourceRef: string;
}): SdlcBootstrapPublicStartOptimization {
  const outcomeClass = traversalOutcomeClassForPublicStart(input.profile);
  const fallbackCandidate = candidateForGraphFunction({
    module: input.module,
    graphFunctionName: "derive_intent_surface",
    sourceRef: input.sourceRef
  });
  const optimizationAdmitted =
    input.selectedTraversal !== null && outcomeClass !== "domain_product";
  const nonAdmissionReasonRefs = optimizationAdmitted
    ? Object.freeze([] as const)
    : Object.freeze([
        outcomeClass === "domain_product"
          ? "optimization-non-admission://odd-sdlc/bootstrap-entry/domain-product"
          : "optimization-non-admission://odd-sdlc/bootstrap-entry/no-admitted-hop-selection"
      ]);
  return constructSdlcBootstrapPublicStartOptimization({
    workspaceIdentityRef: workspaceIdentityRefFor(input.request),
    projectSlug: input.profile.projectSlug,
    selectedOutputRoot: input.profile.selectedOutputRoot,
    outcomeClass,
    selectedChildOverlayRef: input.selectedOverlay.overlayRef,
    selectedGraphFunctionRef: input.selectedCandidate.graphFunctionRef,
    selectedStartTargetRef: input.selectedCandidate.graphFunctionName,
    fallbackOverlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
    fallbackGraphFunctionRef:
      fallbackCandidate?.graphFunctionRef ?? input.selectedCandidate.graphFunctionRef,
    optimizationAdmitted,
    landscapeFactRefs: Object.freeze([
      `landscape://odd-sdlc/project/${encodeURIComponent(input.profile.projectSlug)}`,
      `landscape://odd-sdlc/active-tenant/${encodeURIComponent(input.profile.activeTenant)}`,
      `landscape://odd-sdlc/outcome-class/${encodeURIComponent(outcomeClass)}`,
      `graph-function://odd-sdlc/${FG_BOOTSTRAP_SDLC_ENTRY}`
    ]),
    capabilityRefs: Object.freeze(
      input.profile.capabilityContracts.map(
        (contract) =>
          `capability://odd-sdlc/${encodeURIComponent(contract.name)}/${encodeURIComponent(contract.value)}`
      )
    ),
    sourceRefs: Object.freeze([
      publicStartIntentRef(input.request),
      publicStartProductModelRef(input.request)
    ]),
    applicabilityEnvelopeRefs: optimizationAdmitted
      ? Object.freeze([
          `applicability://odd-sdlc/bootstrap-entry/${encodeURIComponent(outcomeClass)}`,
          input.selectedOverlay.overlayRef
        ])
      : Object.freeze([]),
    nonAdmissionReasonRefs
  });
}

function workspaceRootsForMaterialObservation(
  request: SdlcPublicStartRequest
): readonly string[] {
  return uniqueStrings([
    ...(request.outputWorkspaceRoot === null ||
    request.outputWorkspaceRoot === undefined
      ? []
      : [request.outputWorkspaceRoot]),
    request.workspaceRoot
  ]);
}

function observedOverlayMaterialAssetRefs(input: {
  readonly request: SdlcPublicStartRequest;
  readonly overlay: SdlcTraversalOverlay;
  readonly observationRef: string;
}): readonly {
  readonly assetType: string;
  readonly assetRef: string;
  readonly relativePath: string;
  readonly evidenceRefs: readonly string[];
}[] {
  const observed: {
    readonly assetType: string;
    readonly assetRef: string;
    readonly relativePath: string;
    readonly evidenceRefs: readonly string[];
  }[] = [];
  for (const template of input.overlay.assetTemplates) {
    for (const root of workspaceRootsForMaterialObservation(input.request)) {
      const absolutePath = path.resolve(root, template.defaultPath);
      const stats = statSafe(absolutePath);
      if (stats === null || (!stats.isFile() && !stats.isDirectory())) {
        continue;
      }
      const assetRef = pathToFileURL(absolutePath).href;
      observed.push(Object.freeze({
        assetType: template.assetType,
        assetRef,
        relativePath: template.defaultPath,
        evidenceRefs: Object.freeze([
          input.observationRef,
          assetRef
        ])
      }));
      break;
    }
  }
  return Object.freeze(observed);
}

function operatorRunRootsNewestFirst(workspaceRoot: string): readonly string[] {
  const root = path.join(
    workspaceRoot,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
  if (!existsSync(root) || statSafe(root)?.isDirectory() !== true) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(root)
      .map((entry) => path.join(root, entry))
      .filter((entryPath) => statSafe(entryPath)?.isDirectory() === true)
      .sort((left, right) =>
        (statSafe(right)?.mtimeMs ?? 0) - (statSafe(left)?.mtimeMs ?? 0)
      )
  );
}

function priorOverlayTruthRefs(input: {
  readonly request: SdlcPublicStartRequest;
  readonly overlay: SdlcTraversalOverlay;
}): {
  readonly priorLedgerRefs: readonly string[];
  readonly priorEventRefs: readonly string[];
} {
  if (input.overlay.predecessorOverlayRefs.length === 0) {
    return Object.freeze({
      priorLedgerRefs: Object.freeze([]),
      priorEventRefs: Object.freeze([])
    });
  }
  const predecessorOverlayRefs = new Set<SdlcTraversalOverlayRef>(
    input.overlay.predecessorOverlayRefs
  );
  const ledgerRefs: string[] = [];
  const eventRefs: string[] = [];
  for (const root of workspaceRootsForMaterialObservation(input.request)) {
    for (const archiveRoot of operatorRunRootsNewestFirst(root)) {
      const ledger = jsonRecordFromFile(
        path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json")
      );
      const closure = jsonRecordFromFile(
        path.join(archiveRoot, "sdlc_edge_closure_decision.json")
      );
      const projection = jsonRecordFromFile(
        path.join(archiveRoot, "sdlc_next_action_projection.json")
      );
      const overlayRef =
        stringField(ledger, "overlayRef") ??
        stringField(closure, "overlayRef") ??
        stringField(projection, "overlayRef");
      if (
        overlayRef === null ||
        !isSdlcTraversalOverlayRef(overlayRef) ||
        !predecessorOverlayRefs.has(overlayRef)
      ) {
        continue;
      }
      if (stringField(closure, "disposition") !== "close") {
        continue;
      }
      const ledgerRef =
        stringField(ledger, "ledgerVersionRef") ?? stringField(ledger, "ledgerRef");
      if (ledgerRef !== null) {
        ledgerRefs.push(ledgerRef);
      }
      const runtimeEventArchive = path.join(archiveRoot, "runtime_events.json");
      if (statSafe(runtimeEventArchive)?.isFile() === true) {
        eventRefs.push(pathToFileURL(runtimeEventArchive).href);
      }
    }
  }
  return Object.freeze({
    priorLedgerRefs: uniqueStrings(ledgerRefs),
    priorEventRefs: uniqueStrings(eventRefs)
  });
}

function graphFunctionByName(
  module: Module,
  graphFunctionName: string
): GraphFunction | null {
  return module.graphFunctions.find(
    (graphFunction) => graphFunction.name === graphFunctionName
  ) ?? null;
}

function candidateForGraphFunction(input: {
  readonly module: Module;
  readonly graphFunctionName: string;
  readonly sourceRef: string;
}): PublicStartActionCandidate | null {
  const graphFunction = graphFunctionByName(
    input.module,
    input.graphFunctionName
  );
  if (graphFunction === null) {
    return null;
  }
  const safeName = input.graphFunctionName.replaceAll("/", "_");
  const graphFunctionRef = sdlcGraphFunctionBoundaryRef(graphFunction);
  return Object.freeze({
    graphFunctionName: input.graphFunctionName,
    graphFunctionRef,
    actionRef:
      `construction-action://odd-sdlc/public-start/${safeName}`,
    targetOutcomeRef:
      `outcome://odd-sdlc/public-start/${input.sourceRef}/${safeName}`
  });
}

function publicStartIntentRef(request: SdlcPublicStartRequest): string {
  return [
    "event://odd-sdlc/public-start-intent",
    request.target.kind,
    request.target.handle
  ].join("/");
}

function publicStartProductModelRef(request: SdlcPublicStartRequest): string {
  return [
    "product-asset-model://odd-sdlc/public-start",
    request.target.kind,
    request.target.handle
  ].join("/");
}

function workspaceIdentityRefFor(request: SdlcPublicStartRequest): string {
  return [
    "workspace://odd-sdlc/public-start",
    encodeURIComponent(request.workspaceRoot)
  ].join("/");
}

function runtimeTraversalSelectionsForStartIntent(
  request: SdlcPublicStartRequest
): Partial<Pick<StartIntent, "runtimeTraversalSelections">> {
  return request.runtimeTraversalSelections === undefined
    ? Object.freeze({})
    : Object.freeze({
        runtimeTraversalSelections: request.runtimeTraversalSelections
      });
}

function workspaceFingerprintRefFor(input: {
  readonly request: SdlcPublicStartRequest;
  readonly observationRef: string;
}): string {
  return [
    "workspace-fingerprint://odd-sdlc/public-start",
    encodeURIComponent(input.request.workspaceRoot),
    encodeURIComponent(input.observationRef)
  ].join("/");
}

function evaluateInitialPublicStartAction(input: {
  readonly request: SdlcPublicStartRequest;
  readonly module: Module;
  readonly queryDomain: SdlcQueryDomainProjection;
  readonly conformedProject: SdlcConformProjectProfile;
}): PublicStartEvaluation {
  const targetPolicy = publicStartTargetPolicyFor(input.request.target.kind);
  let overlayCatalog: ReturnType<typeof constructSdlcTraversalOverlayCatalog> | null = null;
  const getOverlayCatalog = (): ReturnType<typeof constructSdlcTraversalOverlayCatalog> => {
    if (overlayCatalog === null) {
      overlayCatalog = constructSdlcTraversalOverlayCatalog({
        module: input.module
      });
    }
    return overlayCatalog;
  };
  let candidates: readonly PublicStartActionCandidate[] = Object.freeze([]);
  let blockingReason: "target_unavailable" | "stale_query_domain" | null = null;
  let preferredTargetOutcomeRef: string | null = null;
  let requestedOverlay: SdlcTraversalOverlay | null = null;
  let ticketExecutionContract: SdlcTicketExecutionContract | null = null;
  let selectedTraversal: PublicStartTraversalSelection | null = null;
  const sourceRef = `${input.request.target.kind}/${input.request.target.handle}`;
  const replayNextGraphFunctionRef =
    input.request.replayNextGraphFunctionRef ?? null;
  if (input.request.target.kind === "asset") {
    const ticketResolution = resolveSdlcTicketExecutionContractForAssetHandle({
      workflow: input.queryDomain.ticketWorkflow,
      handle: input.request.target.handle
    });
    if (ticketResolution.kind === "blocked") {
      return Object.freeze({
        targetGraphFunction: null,
        blockingReason: ticketResolution.blockingReason,
        ticketExecutionContract: null,
        overlayBinding: null,
        nextActionProjection: null,
        constructionIntent: null,
        traversalDecompositionSummary: null,
        traversalHopSelection: null,
        bootstrapOptimization: null
      });
    }
    if (ticketResolution.kind === "admitted") {
      ticketExecutionContract = ticketResolution.contract;
      const ticketContinuationOverlayRef = triagedPublicStartEntryOverlayRef({
        profile: input.conformedProject,
        ticketExecutionContract
      });
      requestedOverlay = resolveSdlcTraversalOverlay({
        catalog: getOverlayCatalog(),
        overlayRef: ticketContinuationOverlayRef
      });
      if (requestedOverlay === null) {
        return Object.freeze({
          targetGraphFunction: null,
          blockingReason: "stale_query_domain",
          ticketExecutionContract,
          overlayBinding: null,
          nextActionProjection: null,
          constructionIntent: null,
          traversalDecompositionSummary: null,
          traversalHopSelection: null,
          bootstrapOptimization: null
        });
      }
      if (selectedTraversal === null) {
        selectedTraversal = overlayTraversalSelection({
          overlay: requestedOverlay,
          profile: input.conformedProject
        });
      }
      const selectedTicketGraphFunction =
        ticketContinuationOverlayRef === SDLC_TICKET_WORKFLOW_OVERLAY_REF
          ? SDLC_ROUTE_TICKET_WORK_ITEM_GRAPH_FUNCTION
          : requestedOverlay.defaultStartTarget;
      const candidate = candidateForGraphFunction({
        module: input.module,
        graphFunctionName: selectedTicketGraphFunction,
        sourceRef
      });
      candidates = Object.freeze(candidate === null ? [] : [candidate]);
      blockingReason = candidate === null ? "stale_query_domain" : null;
      preferredTargetOutcomeRef = candidate?.targetOutcomeRef ?? null;
    } else if (targetPolicy.resolver === "asset_published_action") {
      const binding = deriveSdlcTargetObligationBinding({
        queryDomain: input.queryDomain,
        targetAssetType: input.request.target.handle,
        evidenceRefs: ["public-start://odd-sdlc/target-request"]
      });
      candidates = Object.freeze(
        binding.admissibleGraphFunctionNames
          .map((name) =>
            candidateForGraphFunction({
              module: input.module,
              graphFunctionName: name,
              sourceRef
            })
          )
          .filter(
            (
              candidate
            ): candidate is PublicStartActionCandidate => candidate !== null
          )
      );
      blockingReason =
        binding.status === "stale_action_publication"
          ? "stale_query_domain"
          : binding.status === "no_published_action"
            ? "target_unavailable"
            : candidates.length === 0
              ? "stale_query_domain"
              : null;
    } else {
      candidates = Object.freeze([]);
      blockingReason = "target_unavailable";
    }
  } else if (targetPolicy.resolver === "published_start_targets") {
    const conformanceStatus = input.queryDomain.projectConformance?.status ?? null;
    if (replayNextGraphFunctionRef !== null) {
      const candidate = candidateForGraphFunction({
        module: input.module,
        graphFunctionName: replayNextGraphFunctionRef,
        sourceRef
      });
      candidates = Object.freeze(candidate === null ? [] : [candidate]);
      blockingReason = candidate === null ? "stale_query_domain" : null;
      preferredTargetOutcomeRef = candidate?.targetOutcomeRef ?? null;
    } else {
      const triagedOverlay =
        conformanceStatus === "blocked"
          ? null
          : resolveSdlcTraversalOverlay({
              catalog: getOverlayCatalog(),
              overlayRef: triagedPublicStartEntryOverlayRef({
                profile: input.conformedProject,
                ticketExecutionContract: null
              })
            });
      if (triagedOverlay !== null) {
        requestedOverlay = triagedOverlay;
        selectedTraversal = frontDoorTraversalSelection({
          request: input.request,
          profile: input.conformedProject,
          overlay: triagedOverlay
        });
        const candidate = candidateForGraphFunction({
          module: input.module,
          graphFunctionName: triagedOverlay.defaultStartTarget,
          sourceRef
        });
        candidates = Object.freeze(candidate === null ? [] : [candidate]);
        blockingReason = candidate === null ? "stale_query_domain" : null;
        preferredTargetOutcomeRef = candidate?.targetOutcomeRef ?? null;
      } else {
        const startTargets = publicSdlcOverlayStartTargets({
          module: input.module,
          catalog: getOverlayCatalog(),
          projectConformanceStatus: conformanceStatus
        });
        candidates = Object.freeze(
          startTargets
            .map((target) =>
              candidateForGraphFunction({
                module: input.module,
                graphFunctionName: target.name,
                sourceRef
              })
            )
            .filter(
              (
                candidate
              ): candidate is PublicStartActionCandidate => candidate !== null
            )
        );
        blockingReason =
          startTargets.length === 0 ? "target_unavailable" : null;
        preferredTargetOutcomeRef = candidates[0]?.targetOutcomeRef ?? null;
      }
    }
	  } else if (targetPolicy.resolver === "named_graph_function") {
	    const published = input.queryDomain.graphFunctions.some(
	      (graphFunction) => graphFunction.name === input.request.target.handle
	    );
	    const namedGraphFunction = graphFunctionByName(
	      input.module,
	      input.request.target.handle
	    );
	    if (selectedTraversal === null && namedGraphFunction !== null) {
	      selectedTraversal = overlayTraversalSelection({
	        overlay: sdlcTraversalOverlayForGraphFunction({
	          catalog: getOverlayCatalog(),
	          graphFunctionRef: sdlcGraphFunctionBoundaryRef(namedGraphFunction)
	        }),
	        profile: input.conformedProject
	      });
	    }
	    const candidate = candidateForGraphFunction({
	      module: input.module,
	      graphFunctionName: input.request.target.handle,
      sourceRef
    });
    if (published && candidate === null) {
      return Object.freeze({
        targetGraphFunction: input.request.target.handle,
        blockingReason: "stale_query_domain",
        ticketExecutionContract: null,
        overlayBinding: null,
        nextActionProjection: null,
        constructionIntent: null,
        traversalDecompositionSummary: null,
        traversalHopSelection: null,
        bootstrapOptimization: null
      });
    }
    candidates = Object.freeze(candidate === null ? [] : [candidate]);
    blockingReason = candidate === null ? "target_unavailable" : null;
  } else if (targetPolicy.resolver === "overlay_catalog_binding") {
    requestedOverlay = resolveSdlcTraversalOverlay({
      catalog: getOverlayCatalog(),
      overlayRef: input.request.target.handle
    });
	    if (requestedOverlay === null) {
	      return Object.freeze({
        targetGraphFunction: null,
        blockingReason: "target_unavailable",
        ticketExecutionContract: null,
        overlayBinding: null,
        nextActionProjection: null,
        constructionIntent: null,
        traversalDecompositionSummary: null,
        traversalHopSelection: null,
        bootstrapOptimization: null
      });
	    }
	    if (selectedTraversal === null) {
	      selectedTraversal = overlayTraversalSelection({
	        overlay: requestedOverlay,
	        profile: input.conformedProject
	      });
	    }
	    let selectedGraphFunctionName = requestedOverlay.defaultStartTarget;
    if (input.queryDomain.projectConformance?.status === "blocked") {
      const conformGraphFunction = graphFunctionByName(input.module, FG_CONFORM_PROJECT);
      const conformGraphFunctionRef =
        conformGraphFunction === null
          ? null
          : sdlcGraphFunctionBoundaryRef(conformGraphFunction);
      if (
        conformGraphFunctionRef !== null &&
        requestedOverlay.graphFunctionRefs.includes(conformGraphFunctionRef)
      ) {
        selectedGraphFunctionName = FG_CONFORM_PROJECT;
      }
    }
    const candidate = candidateForGraphFunction({
      module: input.module,
      graphFunctionName: selectedGraphFunctionName,
      sourceRef
    });
    candidates = Object.freeze(candidate === null ? [] : [candidate]);
    blockingReason = candidate === null ? "stale_query_domain" : null;
    preferredTargetOutcomeRef = candidate?.targetOutcomeRef ?? null;
  }
  if (candidates.length === 0) {
    return Object.freeze({
      targetGraphFunction: null,
      blockingReason: blockingReason ?? "target_unavailable",
      ticketExecutionContract,
      overlayBinding: null,
      nextActionProjection: null,
      constructionIntent: null,
      traversalDecompositionSummary: null,
      traversalHopSelection: null,
      bootstrapOptimization: null
    });
  }
  const targetOutcomeRefs = Object.freeze(
    candidates.map((candidate) => candidate.targetOutcomeRef)
  );
  const actions: readonly OddSdlcEvaluateNextActionInput[] = Object.freeze(
    candidates.map((candidate) =>
        Object.freeze({
          actionRef: candidate.actionRef,
          actionKind: "invoke_graph_function" as const,
          graphFunctionRef: candidate.graphFunctionRef,
          graphVectorRef: null,
          publishedTraversalTargetRef: sdlcPublishedActionRef({
            graphFunctionRef: candidate.graphFunctionRef
          }),
          targetOutcomeRef: candidate.targetOutcomeRef,
          inputAssetRefs: Object.freeze([]),
          expectedOutputAssetRefs: Object.freeze([candidate.targetOutcomeRef]),
          requiredAuthorityRefs: Object.freeze([
            sdlcPublishedActionRef({ graphFunctionRef: candidate.graphFunctionRef })
          ]),
        eligibleReasonRefs: Object.freeze([
          "public_start_evaluate_next_initial_selection"
        ])
      })
    )
  );
  const evaluator = deriveOddSdlcEvaluateNextReport({
    basis: admitExecutionBasis({
      startIntent: admitStartIntent({
        scope: {
          kind: "workspace",
          workspaceRoot: input.request.workspaceRoot,
          moduleName: input.module.name
        },
        target: {
          kind: "graph_function",
          handle: candidates[0]?.graphFunctionName ?? ""
        },
        until: input.request.until,
        ...runtimeTraversalSelectionsForStartIntent(input.request)
      }),
      module: input.module,
      runtimeIdentity: admitResolvedRuntimeIdentity({
        workerId: "worker://odd-sdlc/typescript",
        backendId: "backend://node",
        buildId: "build://odd-sdlc/typescript",
        resolvedRuntimeRef: "runtime://abiogenesis/typescript"
      }),
      resolvedPolicy: admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: `policy://odd-sdlc/public-start/evaluate-next/${input.request.defaultRegime}`,
        defaultRegime: input.request.defaultRegime,
        dispatchRef:
          input.request.defaultRegime === "F_P"
            ? "dispatch://odd-sdlc/public-start/evaluate-next"
            : null,
        approvalSubjectRef:
          input.request.defaultRegime === "F_H"
            ? "approval://odd-sdlc/public-start/evaluate-next"
            : null
      }),
      runId: "run://odd-sdlc/public-start/evaluate-next",
      workKey: "wk://odd-sdlc/public-start/evaluate-next",
      frameId: null,
      frameLineageId: null
    }),
    events: Object.freeze([]),
    nextActionBasisKind: "initial_selection",
    intentEventRefs: Object.freeze([publicStartIntentRef(input.request)]),
    productAssetModelRef: publicStartProductModelRef(input.request),
    episodeId:
      `construction-episode://odd-sdlc/public-start/${sourceRef}`,
    observationId:
      `construction-observation://odd-sdlc/public-start/${sourceRef}`,
    pressures: Object.freeze([
      {
        pressureRef:
          `pressure://odd-sdlc/public-start/${sourceRef}`,
        pressureKind: "gap_row",
        sourceRef: publicStartIntentRef(input.request),
        affectedAssetRefs: targetOutcomeRefs,
        targetOutcomeRefs,
        evidenceRefs: Object.freeze(["public-start://odd-sdlc/target-request"]),
        severity: 1
      }
    ]),
    actions,
    ...(preferredTargetOutcomeRef === null
      ? {}
      : {
          priorityScheme: constructConstructionPriorityScheme({
            schemeRef:
              `priority-scheme://odd-sdlc/public-start/${sourceRef}`,
            sourcePolicyRef: "policy://odd-sdlc/public-start/published-order",
            rules: Object.freeze([
              constructConstructionPriorityRule({
                priorityRuleRef:
                  `priority-rule://odd-sdlc/public-start/${sourceRef}/preferred`,
                axis: "gap_repair",
                weight: 1000,
                appliesToActionKinds: Object.freeze(["invoke_graph_function"]),
                appliesToOutcomeRefs: Object.freeze([preferredTargetOutcomeRef]),
                sourcePolicyRef:
                  "policy://odd-sdlc/public-start/published-order",
                strategyLabel: "public_start_published_target_order"
              })
            ])
          })
        })
  });
  const selected = evaluator.selectedPriorityRow;
  const selectedCandidate =
    selected === null
      ? null
      : candidates.find((candidate) => candidate.actionRef === selected.actionRef) ??
        null;
  if (selected === null || selectedCandidate === null) {
    return Object.freeze({
      targetGraphFunction: null,
      blockingReason: blockingReason ?? "target_unavailable",
      ticketExecutionContract,
      overlayBinding: null,
      nextActionProjection: null,
      constructionIntent: null,
      traversalDecompositionSummary: null,
      traversalHopSelection: null,
      bootstrapOptimization: null
    });
  }
  const selectedActionRef =
    input.request.replaySelectedActionRef ?? selected.actionRef;
  const replayOverlay =
    input.request.replayOverlayRef === null ||
    input.request.replayOverlayRef === undefined
      ? null
      : resolveSdlcTraversalOverlay({
          catalog: getOverlayCatalog(),
          overlayRef: input.request.replayOverlayRef
        });
  const selectedOverlay = requestedOverlay ?? replayOverlay ??
    sdlcTraversalOverlayForGraphFunction({
      catalog: getOverlayCatalog(),
      graphFunctionRef: selectedCandidate.graphFunctionRef
    });
  if (
    (requestedOverlay !== null || replayOverlay !== null) &&
    !selectedOverlay.graphFunctionRefs.includes(selectedCandidate.graphFunctionRef)
  ) {
    return Object.freeze({
      targetGraphFunction: selectedCandidate.graphFunctionName,
      blockingReason: "stale_query_domain",
      ticketExecutionContract,
      overlayBinding: null,
      nextActionProjection: null,
      constructionIntent: null,
      traversalDecompositionSummary: null,
      traversalHopSelection: null,
      bootstrapOptimization: null
    });
  }
  if (selectedTraversal === null) {
    selectedTraversal = overlayTraversalSelection({
      overlay: selectedOverlay,
      profile: input.conformedProject
    });
  }
  const selectedGraphVectorRef = input.request.replayNextGraphVectorRef ?? null;
  const selectedComposition = deriveSdlcPreRuntimePlanningCompositionIdentity({
    graphFunctionRef: selectedCandidate.graphFunctionRef,
    graphVectorRef:
      selectedGraphVectorRef ?? `public-start:${selectedCandidate.graphFunctionRef}`,
    compositionSelectionScopeRef:
      input.request.replayNextActionProjectionRef ??
      evaluator.priorityProjection.projectionRef,
    carrierContextRefs: Object.freeze([
      evaluator.priorityProjection.projectionRef,
      evaluator.observation.observationId
    ]),
    assuranceContextRefs: Object.freeze([selectedOverlay.overlayRef])
  });
  const priorTruthRefs = priorOverlayTruthRefs({
    request: input.request,
    overlay: selectedOverlay
  });
  const ticketExecutionRefs =
    sdlcTicketExecutionContractRefs(ticketExecutionContract);
  const overlayBinding = constructSdlcOverlayBinding({
    catalog: getOverlayCatalog(),
    overlay: selectedOverlay,
    workspaceRootUri: pathToFileURL(input.request.workspaceRoot).href,
    workspaceIdentityRef: workspaceIdentityRefFor(input.request),
    preActionWorkspaceObservationRef: evaluator.observation.observationId,
    preActionWorkspaceFingerprintRef: workspaceFingerprintRefFor({
      request: input.request,
      observationRef: evaluator.observation.observationId
    }),
    selectedGraphFunctionRef: selectedCandidate.graphFunctionRef,
    selectedGraphVectorRef,
    selectedStartTargetRef: selectedCandidate.graphFunctionName,
    requestedBy:
      input.request.replayNextActionProjectionRef === null ||
      input.request.replayNextActionProjectionRef === undefined
        ? "public_start"
        : "archive_replay",
    materialAssetRefs: observedOverlayMaterialAssetRefs({
      request: input.request,
      overlay: selectedOverlay,
      observationRef: evaluator.observation.observationId
    }),
    priorLedgerRefs: priorTruthRefs.priorLedgerRefs,
    priorEventRefs: priorTruthRefs.priorEventRefs
  });
  if (
    input.request.replayOverlayBindingRef !== null &&
    input.request.replayOverlayBindingRef !== undefined &&
    input.request.replayOverlayBindingRef !== overlayBinding.bindingRef
  ) {
    return Object.freeze({
      targetGraphFunction: selectedCandidate.graphFunctionName,
      blockingReason: "stale_query_domain",
      ticketExecutionContract,
      overlayBinding: null,
      nextActionProjection: null,
      constructionIntent: null,
      traversalDecompositionSummary: null,
      traversalHopSelection: null,
      bootstrapOptimization: null
    });
  }
  const replayClosureDecision =
    input.request.replayClosureDecisionRef === undefined ||
    input.request.replayClosureDecisionRef === null
      ? null
      : Object.freeze({
          kind: "sdlc_edge_closure_decision" as const,
          selectedComposition,
          compositionRef: selectedComposition.compositionRef,
          compositionDigest: selectedComposition.compositionDigest,
          compositionSelectionRef: selectedComposition.compositionSelectionRef,
          selectedRegimeBindingRef: selectedComposition.selectedRegimeBindingRef,
          decisionRef: input.request.replayClosureDecisionRef,
          ledgerRef: `ledger://odd-sdlc/public-start/replay/${encodeURIComponent(input.request.replayClosureDecisionRef)}`,
          ledgerVersionRef:
            `ledger-version://odd-sdlc/public-start/replay/${encodeURIComponent(input.request.replayClosureDecisionRef)}`,
          disposition: "close" as const,
          overlayRef: overlayBinding.overlayRef,
          overlayBindingRef: overlayBinding.bindingRef,
          graphCatalogDigestRef: overlayBinding.graphCatalogDigestRef,
          edgeAssuranceContractRef: null,
          edgeAssuranceContractDigest: null,
          targetCarrierContractRef: null,
          targetCarrierContractDigest: null,
          targetCarrierAdmissionStatus: "not_required",
          targetCarrierAdmissionRef: null,
          edgeGainRef: null,
          edgeClosureFunctionRef: null,
          edgeResidualPressureRefs: Object.freeze([]),
          basisRefs: Object.freeze([input.request.replayClosureDecisionRef]),
          reasonRefs: Object.freeze([]),
          yieldResumeBasis: null,
          predecessorRefs: Object.freeze([input.request.replayClosureDecisionRef])
        });
  const nextActionProjection = constructSdlcNextActionProjection({
    selectedComposition,
    nextActionProjectionRef:
      input.request.replayNextActionProjectionRef ??
      evaluator.priorityProjection.projectionRef,
    ...(replayClosureDecision === null
      ? { nextActionBasisKind: "initial_selection" as const }
      : { closureDecision: replayClosureDecision }),
    intentEventRefs: evaluator.intentEventRefs,
    productAssetModelRef: evaluator.productAssetModelRef,
    gapPressureRefs: evaluator.gapPressureRefs,
    targetBindingRefs: evaluator.targetBindingRefs,
    observationRef: evaluator.observation.observationId,
    policyRefs: Object.freeze([
      evaluator.policyCarrierRef,
      evaluator.priorityProjection.prioritySchemeRef,
      ...ticketExecutionRefs
    ]),
    actionCatalogRefs: evaluator.actionCatalogRefs,
    overlayRef: overlayBinding.overlayRef,
    overlayBindingRef: overlayBinding.bindingRef,
    graphCatalogDigestRef: overlayBinding.graphCatalogDigestRef,
    selectedActionRef,
    nextGraphFunctionRef: selectedCandidate.graphFunctionRef,
    // Null means no automatic graph-track replay; current Eval_Action chooses the edge.
    nextGraphVectorRef: selectedGraphVectorRef
  });
  const constructionIntent = constructSdlcConstructionIntent({
    intentRef:
      `construction-intent://odd-sdlc/public-start/${selectedCandidate.graphFunctionName}`,
    intentEventRefs: nextActionProjection.intentEventRefs,
    productAssetModelRef: nextActionProjection.productAssetModelRef,
    selectedPriorityRowRef: selected.rankInputRef,
    nextActionProjectionRef: nextActionProjection.nextActionProjectionRef,
    selectedActionRef,
    basisRefs: Object.freeze([
      overlayBinding.bindingRef,
      ...ticketExecutionRefs,
      ...nextActionProjection.predecessorRefs
    ]),
    predecessorRefs: Object.freeze([
      overlayBinding.bindingRef,
      nextActionProjection.nextActionProjectionRef
    ])
  });
  const bootstrapOptimization = publicStartBootstrapOptimization({
    request: input.request,
    module: input.module,
    profile: input.conformedProject,
    selectedOverlay,
    selectedCandidate,
    selectedTraversal,
    sourceRef
  });
  return Object.freeze({
    targetGraphFunction: selectedCandidate.graphFunctionName,
    blockingReason,
    ticketExecutionContract,
    overlayBinding,
    nextActionProjection,
    constructionIntent,
    traversalDecompositionSummary: selectedTraversal?.summary ?? null,
    traversalHopSelection: selectedTraversal?.selection ?? null,
    bootstrapOptimization
  });
}

function constructExecutionContract(input: {
  readonly request: SdlcPublicStartRequest;
  readonly module: Module;
  readonly targetGraphFunction: string;
  readonly ticketExecutionContract: SdlcTicketExecutionContract | null;
  readonly overlayBinding: SdlcOverlayBinding;
  readonly conformedProject: SdlcConformProjectProfile;
  readonly workerAttachment: SdlcWorkerAttachment;
  readonly nextActionProjection: SdlcNextActionProjection;
  readonly constructionIntent: SdlcConstructionIntent;
  readonly traversalDecompositionSummary: SdlcDecompositionSummary | null;
  readonly traversalHopSelection: SdlcTraversalHopSelection | null;
  readonly bootstrapOptimization: SdlcBootstrapPublicStartOptimization;
}): SdlcExecutionContract {
  const requestedOutputs =
    input.request.outputWorkspaceRoot === undefined ||
    input.request.outputWorkspaceRoot === null
      ? undefined
      : Object.freeze([
          Object.freeze({
            outputName: "conform_project",
            outputAssetType: "constitutional_bootstrap",
            relativePath: "conform_project_report.json",
            outputWorkspace: Object.freeze({
              workspaceRef: "workspace://odd-sdlc/output",
              workspaceRoot: input.request.outputWorkspaceRoot,
              authorityRef: "cli://odd-sdlc-ts/output-workspace"
            })
          })
        ]);
  const basis = admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: input.request.workspaceRoot,
        moduleName: input.module.name
      },
      target: {
        kind: "graph_function",
        handle: input.targetGraphFunction
      },
      until: input.request.until,
      ...runtimeTraversalSelectionsForStartIntent(input.request),
      ...(requestedOutputs === undefined ? {} : { requestedOutputs })
    }),
    module: input.module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://odd-sdlc/typescript",
      backendId: "backend://node",
      buildId: "build://odd-sdlc/typescript",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: `policy://odd-sdlc/start/${input.request.defaultRegime}`,
      defaultRegime: input.request.defaultRegime,
      dispatchRef:
        input.request.defaultRegime === "F_P"
          ? "dispatch://odd-sdlc/public-start"
          : null,
      approvalSubjectRef:
        input.request.defaultRegime === "F_H"
          ? "approval://odd-sdlc/public-start"
          : null
    }),
    runId: "run://odd-sdlc/public-start",
    workKey: "wk://odd-sdlc/public-start",
    frameId: null,
    frameLineageId: input.overlayBinding.bindingRef
  });
  return Object.freeze({
    kind: "sdlc_execution_contract",
    targetGraphFunction: input.targetGraphFunction,
    ticketExecutionContract: input.ticketExecutionContract,
    overlayRef: input.overlayBinding.overlayRef,
    overlayBindingRef: input.overlayBinding.bindingRef,
    overlayBinding: input.overlayBinding,
    requestedUntil: input.request.until,
    conformedProject: input.conformedProject,
    basis,
    workerAttachment: input.workerAttachment,
    nextActionProjection: input.nextActionProjection,
    constructionIntent: input.constructionIntent,
    traversalDecompositionSummary: input.traversalDecompositionSummary,
    traversalHopSelection: input.traversalHopSelection,
    bootstrapOptimization: input.bootstrapOptimization,
    ...(input.request.runtimeTraversalSelections === undefined
      ? {}
      : { runtimeTraversalSelections: input.request.runtimeTraversalSelections })
  });
}

function moduleHasGraphFunction(module: Module, graphFunctionName: string): boolean {
  return module.graphFunctions.some(
    (graphFunction) => graphFunction.name === graphFunctionName
  );
}

function statusFromTransition(
  transition: AdvancementTransition
): "dispatch_required" | "advanced" | "converged" {
  if (transition.kind === "fp_dispatch" || transition.kind === "fh_escalation") {
    return "dispatch_required";
  }
  if (transition.kind === "terminal") {
    return "converged";
  }
  return "advanced";
}

export function publicStartOnce(input: {
  readonly request: SdlcPublicStartRequest;
  readonly module: Module;
  readonly queryDomain: SdlcQueryDomainProjection;
  readonly conformedProject: SdlcConformProjectProfile;
  readonly workerAttachment: SdlcWorkerAttachment;
}): SdlcPublicStartOutcome {
  assertCurrentSdlcGtlProgramConformance();
  const targetResolution = evaluateInitialPublicStartAction({
    request: input.request,
    module: input.module,
    queryDomain: input.queryDomain,
    conformedProject: input.conformedProject
  });
  if (
    targetResolution.targetGraphFunction === null ||
    targetResolution.overlayBinding === null ||
    targetResolution.nextActionProjection === null ||
    targetResolution.constructionIntent === null ||
    targetResolution.bootstrapOptimization === null
  ) {
    return Object.freeze({
      kind: "sdlc_public_start_blocked",
      status: "blocked",
      blockingReason: targetResolution.blockingReason ?? "target_unavailable",
      stopPredicate: "gap_stop",
      executionContract: null,
      emittedRuntimeEventKinds: Object.freeze([])
    });
  }
  if (
    input.queryDomain.projectConformance?.status === "blocked" &&
    targetResolution.targetGraphFunction !== FG_CONFORM_PROJECT
  ) {
    return Object.freeze({
      kind: "sdlc_public_start_blocked",
      status: "blocked",
      blockingReason: "project_conformance_blocked",
      stopPredicate: "gap_stop",
      executionContract: null,
      emittedRuntimeEventKinds: Object.freeze([])
    });
  }
  if (!moduleHasGraphFunction(input.module, targetResolution.targetGraphFunction)) {
    return Object.freeze({
      kind: "sdlc_public_start_blocked",
      status: "blocked",
      blockingReason: "stale_query_domain",
      stopPredicate: "gap_stop",
      executionContract: null,
      emittedRuntimeEventKinds: Object.freeze([])
    });
  }
  const executionContract = constructExecutionContract({
    request: input.request,
    module: input.module,
    targetGraphFunction: targetResolution.targetGraphFunction,
    ticketExecutionContract: targetResolution.ticketExecutionContract,
    overlayBinding: targetResolution.overlayBinding,
    conformedProject: input.conformedProject,
    workerAttachment: input.workerAttachment,
    nextActionProjection: targetResolution.nextActionProjection,
    constructionIntent: targetResolution.constructionIntent,
    traversalDecompositionSummary: targetResolution.traversalDecompositionSummary,
    traversalHopSelection: targetResolution.traversalHopSelection,
    bootstrapOptimization: targetResolution.bootstrapOptimization
  });
  if (
    input.request.defaultRegime === "F_P" &&
    input.workerAttachment.status === "unattached" &&
    targetResolution.targetGraphFunction !== FG_CONFORM_PROJECT
  ) {
    return Object.freeze({
      kind: "sdlc_public_start_blocked",
      status: "blocked",
      blockingReason: "fp_worker_unattached",
      stopPredicate: "worker_attachment_required",
      executionContract,
      emittedRuntimeEventKinds: Object.freeze([])
    });
  }
  const transition = deriveAdvancementTransition(executionContract.basis);
  return Object.freeze({
    kind: "sdlc_public_start_projected",
    status: statusFromTransition(transition),
    executionContract,
    transition,
    emittedRuntimeEventKinds: Object.freeze([])
  });
}
