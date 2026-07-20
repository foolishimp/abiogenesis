// Implements: T-280. One native schema family realizes the four declared
// One Surface result contracts; schema identity remains program-owned.

import * as v from "valibot";

import {
  CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
  CONSTRUCTION_AMBIGUITY_CLASS_VALUES,
  CONSTRUCTION_PRESSURE_KIND_VALUES,
  CONSTRUCTION_REPAIR_SURFACE_DISPOSITION_VALUES
} from "./construction_observation.js";
import {
  AFFECT_PRIORITY_ADJUSTMENT_VALUES,
  CONSTRUCTION_TERMINAL_DISPOSITION_VALUES
} from "./construction_priority.js";
import { GRAPH_REENTRY_POINT_VALUES } from "./carriers.js";
import type { OneSurfaceAuthorityFunctionKind } from "./one_surface_authority.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from "../../../shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";

export const ONE_SURFACE_REFUSAL_JUDGMENT_VALUES = Object.freeze([
  "retry",
  "pending",
  "blocked",
  "escalated"
] as const);

export type OneSurfaceRefusalJudgment =
  (typeof ONE_SURFACE_REFUSAL_JUDGMENT_VALUES)[number];

const sha256DigestSchema = v.pipe(
  v.string(),
  v.regex(/^sha256:[a-f0-9]{64}$/u, "expected sha256 digest"),
  v.brand("OneSurfaceSha256Digest")
);
type OneSurfaceSha256Digest = v.InferOutput<typeof sha256DigestSchema>;

export interface OneSurfaceTypedRefusal<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly kind: "one_surface_typed_refusal";
  readonly functionKind: K;
  readonly refusalRef: string;
  readonly refusalDigest: OneSurfaceSha256Digest;
  readonly judgment: OneSurfaceRefusalJudgment;
  readonly reasonRefs: readonly string[];
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneSurfaceFunctionKind(
  value: unknown
): value is OneSurfaceAuthorityFunctionKind {
  return value === "synthesize_model" ||
    value === "eval_gap" ||
    value === "evaluate_next" ||
    value === "evaluate_action";
}

function isOneSurfaceRefusalJudgment(
  value: unknown
): value is OneSurfaceRefusalJudgment {
  return value === "retry" ||
    value === "pending" ||
    value === "blocked" ||
    value === "escalated";
}

const nonEmptyString = v.pipe(v.string(), v.minLength(1));
const UNIQUE_STRING_VALUES_ACTION = Object.freeze(v.check(
  (values: string[]) => new Set(values).size === values.length,
  "string values must be unique"
));
const uniqueStrings = v.pipe(
  v.array(nonEmptyString),
  UNIQUE_STRING_VALUES_ACTION,
  v.readonly()
);
const requiredUniqueStrings = v.pipe(
  uniqueStrings,
  v.minLength(1, "expected at least one string")
);
const nonNegativeInteger = v.pipe(v.number(), v.integer(), v.minValue(0));
const nonNegativeNumber = v.pipe(v.number(), v.minValue(0));

function uniqueNonEmptyStrings(values: readonly string[]): readonly string[] {
  if (
    values.length === 0 ||
    values.some((value) => value.length === 0) ||
    new Set(values).size !== values.length
  ) {
    throw new TypeError("One Surface refusal reasons must be unique non-empty strings");
  }
  return Object.freeze([...values]);
}

function refusalBasis(input: {
  readonly functionKind: OneSurfaceAuthorityFunctionKind;
  readonly judgment: OneSurfaceRefusalJudgment;
  readonly reasonRefs: readonly string[];
}) {
  return Object.freeze({
    functionKind: input.functionKind,
    judgment: input.judgment,
    reasonRefs: input.reasonRefs
  });
}

export function constructOneSurfaceTypedRefusal<
  K extends OneSurfaceAuthorityFunctionKind
>(input: {
  readonly functionKind: K;
  readonly judgment: OneSurfaceRefusalJudgment;
  readonly reasonRefs: readonly string[];
}): OneSurfaceTypedRefusal<K> {
  const reasonRefs = uniqueNonEmptyStrings(input.reasonRefs);
  const basis = refusalBasis({ ...input, reasonRefs });
  const refusalDigest = v.parse(sha256DigestSchema, stableSha256Digest(basis));
  return Object.freeze({
    kind: "one_surface_typed_refusal",
    ...basis,
    functionKind: input.functionKind,
    refusalRef:
      `abg://one-surface/refusal/${input.functionKind}/` +
      refusalDigest.slice("sha256:".length),
    refusalDigest
  });
}

export function assertOneSurfaceTypedRefusal(
  refusal: unknown
): asserts refusal is OneSurfaceTypedRefusal {
  if (
    !isRecord(refusal) ||
    refusal["kind"] !== "one_surface_typed_refusal" ||
    !isOneSurfaceFunctionKind(refusal["functionKind"]) ||
    !isOneSurfaceRefusalJudgment(refusal["judgment"]) ||
    !Array.isArray(refusal["reasonRefs"]) ||
    refusal["reasonRefs"].some((value) => typeof value !== "string") ||
    typeof refusal["refusalRef"] !== "string" ||
    typeof refusal["refusalDigest"] !== "string"
  ) {
    throw new TypeError("One Surface refusal shape differs");
  }
  const expected = constructOneSurfaceTypedRefusal({
    functionKind: refusal["functionKind"],
    judgment: refusal["judgment"],
    reasonRefs: refusal["reasonRefs"]
  });
  if (
    refusal["refusalRef"] !== expected.refusalRef ||
    refusal["refusalDigest"] !== expected.refusalDigest
  ) {
    throw new TypeError("One Surface refusal seal differs");
  }
}

function isSealedOneSurfaceTypedRefusal(
  value: unknown
): value is OneSurfaceTypedRefusal {
  if (
    typeof value !== "object" ||
    value === null ||
    !("kind" in value) ||
    value.kind !== "one_surface_typed_refusal"
  ) {
    return false;
  }
  try {
    assertOneSurfaceTypedRefusal(value);
    return true;
  } catch {
    return false;
  }
}

function exactObject<const Entries extends v.ObjectEntries>(entries: Entries) {
  return v.pipe(v.strictObject(entries, "expected exact keys"), v.readonly());
}

const pressureRow = exactObject({
  kind: v.literal("observation_pressure_row"),
  pressureRef: nonEmptyString,
  pressureKind: v.picklist(CONSTRUCTION_PRESSURE_KIND_VALUES),
  sourceRef: nonEmptyString,
  affectedAssetRefs: uniqueStrings,
  targetOutcomeRefs: uniqueStrings,
  evidenceRefs: uniqueStrings,
  severity: nonNegativeNumber,
  ambiguityClass: v.picklist(CONSTRUCTION_AMBIGUITY_CLASS_VALUES),
  authorityRefs: uniqueStrings,
  affectSignalKind: v.nullable(v.picklist(CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES))
});

const repairSurfaceTriageRow = exactObject({
  kind: v.literal("construction_repair_surface_triage_row"),
  triageRef: nonEmptyString,
  pressureRef: nonEmptyString,
  repairSurfaceDisposition:
    v.picklist(CONSTRUCTION_REPAIR_SURFACE_DISPOSITION_VALUES),
  graphReentryPoint: v.picklist(GRAPH_REENTRY_POINT_VALUES),
  repairGraphFunctionRef: nonEmptyString,
  repairGraphVectorRef: nonEmptyString,
  reentryTargetVectorIndex: nonNegativeInteger,
  repairAssetRef: nonEmptyString,
  targetOutcomeRef: nonEmptyString,
  evidenceRefs: uniqueStrings,
  authorityRefs: uniqueStrings
});

const synthesizeModelResult = exactObject({
  desiredAssetRefs: uniqueStrings,
  knownAssetRefs: uniqueStrings
});

const evalGapResult = exactObject({
  kind: v.literal("construction_observation_snapshot"),
  episodeId: nonEmptyString,
  observationId: nonEmptyString,
  basisRef: nonEmptyString,
  currentProjectionRef: nonEmptyString,
  iterationOrdinal: nonNegativeInteger,
  basisProjectionRef: nonEmptyString,
  priorIntentId: v.nullable(nonEmptyString),
  causationRef: nonEmptyString,
  correlationId: nonEmptyString,
  observedStateRefs: uniqueStrings,
  runtimeAggregateRefs: uniqueStrings,
  linkedAssetRefs: uniqueStrings,
  passedInputRefs: uniqueStrings,
  gapProjectionRefs: uniqueStrings,
  foldbackRefs: uniqueStrings,
  retryFrontierRefs: uniqueStrings,
  reentryFrontierRefs: uniqueStrings,
  assuranceRefs: uniqueStrings,
  fhInputRefs: uniqueStrings,
  priorIntentRefs: uniqueStrings,
  priorProgressRefs: uniqueStrings,
  pressureRows: v.pipe(v.array(pressureRow), v.readonly()),
  repairSurfaceTriageRows: v.pipe(
    v.array(repairSurfaceTriageRow),
    v.readonly()
  )
});

const constructionIntentCandidate = exactObject({
  kind: v.literal("construction_intent_candidate"),
  candidateId: nonEmptyString,
  episodeId: nonEmptyString,
  rank: nonNegativeInteger,
  valueScore: nonNegativeNumber,
  priorityScore: nonNegativeNumber,
  affectAdjustmentRefs: uniqueStrings,
  selectedActionRef: nonEmptyString,
  selectedBindingRef: nonEmptyString,
  selectedOutcomeRef: nonEmptyString,
  targetGraphFunctionRef: v.nullable(nonEmptyString),
  targetVectorRef: v.nullable(nonEmptyString),
  targetReentryRef: v.nullable(nonEmptyString),
  inputAssetRefs: uniqueStrings,
  expectedOutputAssetRefs: uniqueStrings,
  gapRefs: uniqueStrings,
  obligationRefs: uniqueStrings,
  lawfulBasisRefs: uniqueStrings,
  expectedDelta: nonEmptyString,
  progressCondition: nonEmptyString,
  stopCondition: nonEmptyString,
  escalationCondition: nonEmptyString,
  rejectedAlternativeRefs: uniqueStrings,
  rationale: nonEmptyString,
  hiddenConfigRefs: uniqueStrings,
  runtimeEventPayloadRefs: uniqueStrings,
  fdSemanticCanonicalizationRequired: v.boolean()
});

const targetObligationBinding = exactObject({
  kind: v.literal("target_obligation_binding"),
  bindingRef: nonEmptyString,
  bindingDigest: sha256DigestSchema,
  snapshotRef: nonEmptyString,
  snapshotDigest: sha256DigestSchema,
  sourceBindingRef: nonEmptyString,
  pressureRef: nonEmptyString,
  actionRef: nonEmptyString,
  targetOutcomeRef: nonEmptyString,
  obligationRefs: requiredUniqueStrings,
  requiredEvidenceAuthorityRefs: requiredUniqueStrings
});

const affectPriorityAdjustment = exactObject({
  kind: v.literal("affect_priority_adjustment"),
  affectRef: nonEmptyString,
  bindingRef: nonEmptyString,
  signalKind: v.picklist(CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES),
  sourceRef: nonEmptyString,
  targetOutcomeRefs: uniqueStrings,
  affectedActionRefs: uniqueStrings,
  intensity: nonNegativeNumber,
  adjustment: v.picklist(AFFECT_PRIORITY_ADJUSTMENT_VALUES),
  weightDelta: v.number(),
  policyRef: nonEmptyString,
  reviewReasonRefs: uniqueStrings,
  terminalRouteRef: v.nullable(nonEmptyString),
  escalationRequired: v.boolean(),
  evidenceRefs: uniqueStrings
});

const constructionPriorityRow = exactObject({
  kind: v.literal("construction_priority_row"),
  rankInputRef: nonEmptyString,
  bindingRef: nonEmptyString,
  pressureRef: nonEmptyString,
  actionRef: nonEmptyString,
  targetOutcomeRef: nonEmptyString,
  sourcePolicyRef: nonEmptyString,
  rankOrdinal: nonNegativeInteger,
  baseScore: v.number(),
  priorityScore: v.number(),
  affectAdjustmentRefs: uniqueStrings,
  finalScore: v.number(),
  rankReasonRefs: uniqueStrings,
  forcedReview: v.boolean(),
  fhInputRequired: v.boolean(),
  escalationRequired: v.boolean(),
  terminalRouteRef: v.nullable(nonEmptyString),
  reviewReasonRefs: uniqueStrings,
  terminalDisposition: v.picklist(CONSTRUCTION_TERMINAL_DISPOSITION_VALUES),
  tieBreakKey: nonEmptyString
});

const constructionPriorityProjection = exactObject({
  kind: v.literal("construction_priority_projection"),
  projectionRef: nonEmptyString,
  episodeId: nonEmptyString,
  bindingProjectionRef: nonEmptyString,
  prioritySchemeRef: nonEmptyString,
  affectPolicyRefs: uniqueStrings,
  affectAdjustments: v.pipe(v.array(affectPriorityAdjustment), v.readonly()),
  rows: v.pipe(v.array(constructionPriorityRow), v.readonly())
});

const nextActionBasis = exactObject({
  kind: v.literal("next_action_basis"),
  basisKind: v.picklist([
    "initial_selection",
    "post_yield_resume",
    "post_close_graph_continuation",
    "post_retry",
    "post_repair",
    "post_reenter",
    "post_reprice",
    "post_block"
  ]),
  causalRefs: requiredUniqueStrings,
  basisDigest: sha256DigestSchema
});

const refDigest = exactObject({
  ref: nonEmptyString,
  digest: nonEmptyString
});

const nextActionDisposition = v.union([
  exactObject({
    variant: v.literal("callable_member_action"),
    actionKind: v.literal("invoke_graph_function"),
    actionRef: nonEmptyString,
    targetRef: nonEmptyString
  }),
  exactObject({
    variant: v.literal("internal_vector_action"),
    actionKind: v.picklist(["invoke_prior_vector", "invoke_later_vector"]),
    actionRef: nonEmptyString,
    targetRef: nonEmptyString
  }),
  exactObject({
    variant: v.literal("refinement_reentry_action"),
    actionKind: v.literal("reenter_graph_span"),
    actionRef: nonEmptyString,
    targetRef: nonEmptyString
  }),
  exactObject({
    variant: v.literal("repair_action"),
    actionKind: v.literal("repair_same_edge"),
    actionRef: nonEmptyString,
    targetRef: v.null()
  }),
  exactObject({
    variant: v.literal("continue_current_intent"),
    actionKind: v.literal("continue_graph_call"),
    actionRef: nonEmptyString,
    targetRef: v.null()
  }),
  exactObject({
    variant: v.literal("fh_outcome"),
    actionKind: v.literal("open_fh_gate"),
    actionRef: nonEmptyString,
    targetRef: v.null()
  }),
  exactObject({
    variant: v.literal("ticket_outcome"),
    actionKind: v.literal("create_ticket"),
    actionRef: nonEmptyString,
    targetRef: v.null()
  }),
  exactObject({
    variant: v.literal("reprice_outcome"),
    actionKind: v.literal("propose_reprice"),
    actionRef: nonEmptyString,
    targetRef: v.null()
  }),
  exactObject({
    variant: v.literal("terminal_outcome"),
    actionKind: v.picklist(["yield_progress", "close_episode", "block_episode"]),
    actionRef: nonEmptyString,
    targetRef: v.null()
  }),
  exactObject({
    variant: v.literal("no_action"),
    actionKind: v.null(),
    actionRef: v.null(),
    targetRef: v.null()
  })
]);

const nextActionProjectionValue = exactObject({
  nextBasis: nextActionBasis,
  admittedProgram: refDigest,
  catalogView: refDigest,
  observationRef: nonEmptyString,
  currentObservationRef: nonEmptyString,
  currentObservationDigest: sha256DigestSchema,
  actionCatalogRef: nonEmptyString,
  bindingProjectionRef: nonEmptyString,
  priorityProjectionRef: nonEmptyString,
  selectedBindingRef: v.nullable(nonEmptyString),
  selectedOutcomeRef: v.nullable(nonEmptyString),
  intentCandidate: v.nullable(constructionIntentCandidate),
  disposition: nextActionDisposition
});

// The evaluator owns this semantic value. ABG adds only its admitted-result
// reference and projection seal after exact-input corroboration.
const evaluateNextCarrier = exactObject({
  targetBindings: v.pipe(v.array(targetObligationBinding), v.readonly()),
  priorityProjection: constructionPriorityProjection,
  nextActionProjection: nextActionProjectionValue
});
const EVALUATE_NEXT_CANDIDATE_MATCH_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof evaluateNextCarrier>) =>
    value.nextActionProjection.intentCandidate === null ||
      value.nextActionProjection.disposition.actionRef ===
        value.nextActionProjection.intentCandidate.selectedActionRef,
  "intentCandidate must identify the selected disposition action"
));
const EVALUATE_NEXT_TOTALITY_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof evaluateNextCarrier>) => {
    const projection = value.nextActionProjection;
    const noSelection = projection.selectedBindingRef === null;
    return projection.priorityProjectionRef ===
        value.priorityProjection.projectionRef &&
      noSelection === (projection.selectedOutcomeRef === null) &&
      noSelection === (projection.disposition.actionRef === null) &&
      (projection.intentCandidate === null ||
        (projection.selectedBindingRef ===
          projection.intentCandidate.selectedBindingRef &&
          projection.selectedOutcomeRef ===
            projection.intentCandidate.selectedOutcomeRef)) &&
      (projection.selectedBindingRef === null ||
        value.targetBindings.filter(
          (binding) =>
            binding.sourceBindingRef === projection.selectedBindingRef
        ).length === 1);
  },
  "nextActionProjection must be total over its binding and priority truth"
));
const evaluateNextResult = v.pipe(
  evaluateNextCarrier,
  EVALUATE_NEXT_CANDIDATE_MATCH_ACTION,
  EVALUATE_NEXT_TOTALITY_ACTION
);

const evaluateActionResult = exactObject({
  closureContractRef: nonEmptyString,
  evidenceRefs: uniqueStrings,
  disposition: v.picklist([
    "close",
    "yield",
    "retry",
    "repair",
    "re-enter",
    "reprice",
    "block"
  ]),
  reasonRefs: uniqueStrings
});

function buildRefusalSchema<K extends OneSurfaceAuthorityFunctionKind>(
  functionKind: K
) {
  const carrier = exactObject({
    kind: v.literal("one_surface_typed_refusal"),
    functionKind: v.literal(functionKind),
    refusalRef: nonEmptyString,
    refusalDigest: sha256DigestSchema,
    judgment: v.picklist(ONE_SURFACE_REFUSAL_JUDGMENT_VALUES),
    reasonRefs: uniqueStrings
  });
  const action = Object.freeze(v.check(
    (value: v.InferOutput<typeof carrier>) =>
      isSealedOneSurfaceTypedRefusal(value),
    "refusal seal must match its typed basis"
  ));
  return Object.freeze({ schema: v.pipe(carrier, action), action });
}

const SYNTHESIZE_MODEL_REFUSAL = buildRefusalSchema("synthesize_model");
const EVAL_GAP_REFUSAL = buildRefusalSchema("eval_gap");
const EVALUATE_NEXT_REFUSAL = buildRefusalSchema("evaluate_next");
const EVALUATE_ACTION_REFUSAL = buildRefusalSchema("evaluate_action");

/** @internal */
export const ONE_SURFACE_NATIVE_CHECK_REGISTRY = Object.freeze({
  familyRef: "abg.one-surface.result-contract-family",
  checks: Object.freeze([
    Object.freeze({
      checkId: "unique_string_values",
      action: UNIQUE_STRING_VALUES_ACTION,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-011E"
    }),
    Object.freeze({
      checkId: "evaluate_next_candidate_match",
      action: EVALUATE_NEXT_CANDIDATE_MATCH_ACTION,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-005"
    }),
    Object.freeze({
      checkId: "evaluate_next_totality",
      action: EVALUATE_NEXT_TOTALITY_ACTION,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-005"
    }),
    Object.freeze({
      checkId: "sealed_synthesize_model_refusal",
      action: SYNTHESIZE_MODEL_REFUSAL.action,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-011E"
    }),
    Object.freeze({
      checkId: "sealed_eval_gap_refusal",
      action: EVAL_GAP_REFUSAL.action,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-011E"
    }),
    Object.freeze({
      checkId: "sealed_evaluate_next_refusal",
      action: EVALUATE_NEXT_REFUSAL.action,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-011E"
    }),
    Object.freeze({
      checkId: "sealed_evaluate_action_refusal",
      action: EVALUATE_ACTION_REFUSAL.action,
      relationRef: "REQ-R-ABG3-FP-CONSCIOUSNESS-011E"
    })
  ])
});

export const ONE_SURFACE_RESULT_CONTRACT_FAMILY = Object.freeze({
  synthesize_model: Object.freeze({
    schemaRef: "abg.schema.one-surface.synthesize-model-result",
    schema: v.union([synthesizeModelResult, SYNTHESIZE_MODEL_REFUSAL.schema])
  }),
  eval_gap: Object.freeze({
    schemaRef: "abg.schema.one-surface.eval-gap-result",
    schema: v.union([evalGapResult, EVAL_GAP_REFUSAL.schema])
  }),
  evaluate_next: Object.freeze({
    schemaRef: "abg.schema.one-surface.evaluate-next-result",
    schema: v.union([evaluateNextResult, EVALUATE_NEXT_REFUSAL.schema])
  }),
  evaluate_action: Object.freeze({
    schemaRef: "abg.schema.one-surface.evaluate-action-result",
    schema: v.union([evaluateActionResult, EVALUATE_ACTION_REFUSAL.schema])
  })
} as const);

function oneSurfaceResultContractSource<
  const Kind extends keyof typeof ONE_SURFACE_RESULT_CONTRACT_FAMILY
>(functionKind: Kind) {
  const definition = ONE_SURFACE_RESULT_CONTRACT_FAMILY[functionKind];
  return freezeNativeValue({
    sourceLocator: {
      kind: "private_source_module" as const,
      sourceRoot: "semantic_build" as const,
      modulePath:
        "code/src/abg/m03/contracts/one_surface_contract_family.js",
      exportName: "ONE_SURFACE_RESULT_CONTRACT_SOURCES",
      memberPath: [functionKind, "schema"] as const
    },
    namedChecks: {
      kind: "family_registry" as const,
      exportName: "ONE_SURFACE_NATIVE_CHECK_REGISTRY",
      memberPath: [] as const
    },
    schema: definition.schema
  });
}

/** @internal Owner-native schemas resolved through the opaque projector boundary. */
export const ONE_SURFACE_RESULT_CONTRACT_SOURCES = freezeNativeValue({
  synthesize_model: oneSurfaceResultContractSource("synthesize_model"),
  eval_gap: oneSurfaceResultContractSource("eval_gap"),
  evaluate_next: oneSurfaceResultContractSource("evaluate_next"),
  evaluate_action: oneSurfaceResultContractSource("evaluate_action")
} as const);

export type OneSurfaceResultValueByKind = {
  readonly [Kind in OneSurfaceAuthorityFunctionKind]: v.InferOutput<
    (typeof ONE_SURFACE_RESULT_CONTRACT_FAMILY)[Kind]["schema"]
  >;
};

const ADMITTED_ONE_SURFACE_RESULT_VALUE = Symbol(
  "ADMITTED_ONE_SURFACE_RESULT_VALUE"
);

export interface AdmittedOneSurfaceResultValue<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly [ADMITTED_ONE_SURFACE_RESULT_VALUE]: true;
  readonly kind: "admitted_one_surface_result_value";
  readonly functionKind: K;
  readonly schemaRef: string;
  readonly admissionRef: string;
  readonly valueDigest: `sha256:${string}`;
  readonly value: v.InferOutput<
    (typeof ONE_SURFACE_RESULT_CONTRACT_FAMILY)[K]["schema"]
  >;
}

export function isOneSurfaceTypedRefusal<
  K extends OneSurfaceAuthorityFunctionKind
>(
  value: OneSurfaceResultValueByKind[K]
): value is Extract<
  OneSurfaceResultValueByKind[K],
  { readonly kind: "one_surface_typed_refusal" }
> {
  return isSealedOneSurfaceTypedRefusal(value);
}

export interface OneSurfaceNativeResultSchema {
  readonly kind: "one_surface_native_result_schema";
  readonly functionKind: OneSurfaceAuthorityFunctionKind;
  readonly schemaRef: string;
  readonly schemaDigest: `sha256:${string}`;
}

export async function oneSurfaceNativeResultSchema<
  const Kind extends OneSurfaceAuthorityFunctionKind
>(functionKind: Kind): Promise<
  OneSurfaceNativeResultSchema & { readonly functionKind: Kind }
> {
  const definition = ONE_SURFACE_RESULT_CONTRACT_FAMILY[functionKind];
  const source = await resolveSemanticBuildNativeSchemaSource(
    ONE_SURFACE_RESULT_CONTRACT_SOURCES[functionKind]
  );
  const projection = deriveCanonicalNativeSchemaProjection({
    source,
    schemaRef: definition.schemaRef,
    schemaVersion: "5.0.0"
  });
  return freezeNativeValue({
    kind: "one_surface_native_result_schema" as const,
    functionKind,
    schemaRef: definition.schemaRef,
    schemaDigest: projection.witness.projectionDigest
  });
}

export function admitOneSurfaceResultValue<
  const Kind extends OneSurfaceAuthorityFunctionKind
>(
  functionKind: Kind,
  value: unknown
): OneSurfaceResultValueByKind[Kind];
export function admitOneSurfaceResultValue(
  functionKind: OneSurfaceAuthorityFunctionKind,
  value: unknown
): OneSurfaceResultValueByKind[OneSurfaceAuthorityFunctionKind] {
  try {
    switch (functionKind) {
      case "synthesize_model":
        return v.parse(ONE_SURFACE_RESULT_CONTRACT_FAMILY.synthesize_model.schema, value);
      case "eval_gap":
        return v.parse(ONE_SURFACE_RESULT_CONTRACT_FAMILY.eval_gap.schema, value);
      case "evaluate_next":
        return v.parse(ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_next.schema, value);
      case "evaluate_action":
        return v.parse(ONE_SURFACE_RESULT_CONTRACT_FAMILY.evaluate_action.schema, value);
    }
  } catch (error: unknown) {
    throw new TypeError(
      `OneSurfaceResult.${functionKind}: ${
        error instanceof Error ? error.message : "validation failed"
      }`,
      { cause: error }
    );
  }
}

export function admitOneSurfaceResultForClose<
  const Kind extends OneSurfaceAuthorityFunctionKind
>(
  functionKind: Kind,
  value: unknown
): AdmittedOneSurfaceResultValue<Kind> {
  const admitted = admitOneSurfaceResultValue(functionKind, value);
  const schemaRef = ONE_SURFACE_RESULT_CONTRACT_FAMILY[functionKind].schemaRef;
  const valueDigest = stableSha256Digest(admitted);
  const result: AdmittedOneSurfaceResultValue<Kind> = {
    [ADMITTED_ONE_SURFACE_RESULT_VALUE]: true,
    kind: "admitted_one_surface_result_value",
    functionKind,
    schemaRef,
    admissionRef:
      `abg://one-surface/result-admission/${functionKind}/` +
      valueDigest.slice("sha256:".length),
    valueDigest,
    value: admitted
  };
  return Object.freeze(result);
}

export function assertAdmittedOneSurfaceResultValue(
  admitted: AdmittedOneSurfaceResultValue
): void {
  if (
    admitted[ADMITTED_ONE_SURFACE_RESULT_VALUE] !== true ||
    admitted.kind !== "admitted_one_surface_result_value" ||
    admitted.schemaRef !==
      ONE_SURFACE_RESULT_CONTRACT_FAMILY[admitted.functionKind].schemaRef ||
    stableSha256Digest(admitted.value) !== admitted.valueDigest ||
    admitted.admissionRef !==
      `abg://one-surface/result-admission/${admitted.functionKind}/` +
        admitted.valueDigest.slice("sha256:".length)
  ) {
    throw new TypeError("admitted One Surface result value seal differs");
  }
  admitOneSurfaceResultValue(admitted.functionKind, admitted.value);
}
