// Implements the pre-P1 T-270/T-272 neutral owner-contract milestone.
// These schemas own payload meaning only. Public packets and handlers remain
// outside this module and are not published by this milestone.

import * as v from "valibot";

import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  capabilityIdSchema,
  canonicalIJsonSchema,
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import {
  ownerNativeDefinitionContractSource,
  ownerNativeOperationContractSource,
  ownerProjectionRelationSource,
  type OwnerNativeAuthorityBasis,
  type OwnerNativeOperationContractSlot,
  type OwnerProjectionRelationAction
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { CONSTRUCTION_ACTION_KIND_VALUES } from "./construction_action_kinds.js";

type NativeSchema = v.GenericSchema;

export type OneSurfaceOwnerOperationId =
  | "abg.operation.run.invoke"
  | "abg.operation.run.continue"
  | "abg.operation.interaction.respond";

export type OneSurfaceOwnerContractSlot =
  OwnerNativeOperationContractSlot;

export type OneSurfaceOwnerContractFamilyKey =
  | "run_invoke"
  | "run_continue"
  | "interaction_respond";

type OneSurfaceSemanticOwnerFamily =
  | "run_invoke"
  | "fh_runtime_continuation";

interface OneSurfaceOwnerAuthority {
  readonly owner: {
    readonly product: "abiogenesis";
    readonly module: "abg.m03";
    readonly family: OneSurfaceSemanticOwnerFamily;
  };
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
}

function familyKeyForOperation(
  operationId: OneSurfaceOwnerOperationId
): OneSurfaceOwnerContractFamilyKey {
  switch (operationId) {
    case "abg.operation.run.invoke":
      return "run_invoke";
    case "abg.operation.run.continue":
      return "run_continue";
    case "abg.operation.interaction.respond":
      return "interaction_respond";
  }
}

const T270_AUTHORITY = Object.freeze({
  owner: Object.freeze({
    product: "abiogenesis",
    module: "abg.m03",
    family: "run_invoke"
  }),
  semanticOwnerBasis: Object.freeze({
    ref: "design://abg/m03/public-catalog-invocation-authority",
    digest:
      "sha256:71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430"
  })
} as const satisfies OneSurfaceOwnerAuthority);

const T272_AUTHORITY = Object.freeze({
  owner: Object.freeze({
    product: "abiogenesis",
    module: "abg.m03",
    family: "fh_runtime_continuation"
  }),
  semanticOwnerBasis: Object.freeze({
    ref: "design://abg/m03/fh-runtime-continuation",
    digest:
      "sha256:1b879535201080f5ed7da4bc781bd447fa46c72ad5f500c71e73e0b0ed62b0b2"
  })
} as const satisfies OneSurfaceOwnerAuthority);

const refListSchema = uniqueByNativeIdentityArray(refSchema);
const readonlyRefListSchema = v.pipe(refListSchema, v.readonly());
const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);

const lawfulActionTargetSchema = v.union([
  v.pipe(
    v.strictObject({
      kind: v.literal("public_target"),
      target: refDigestSchema
    }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({
      kind: v.literal("pending_interaction"),
      interaction: refDigestSchema
    }),
    v.readonly()
  )
]);
const lawfulActionRequiredInputSchema = v.union([
  v.pipe(
    v.strictObject({ kind: v.literal("none") }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({
      kind: v.literal("contract_bound"),
      inputContract: refDigestSchema
    }),
    v.readonly()
  )
]);
const capabilityListSchema = v.pipe(
  uniqueByNativeIdentityArray(capabilityIdSchema),
  v.readonly()
);

function nativeSource<
  const OperationId extends OneSurfaceOwnerOperationId,
  const Variant extends string,
  const Slot extends OneSurfaceOwnerContractSlot,
  const S extends NativeSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly slot: Slot;
  readonly owner: typeof T270_AUTHORITY | typeof T272_AUTHORITY;
  readonly schema: S;
}) {
  return ownerNativeOperationContractSource({
    owner: input.owner.owner,
    operationId: input.operationId,
    variant: input.variant,
    slot: input.slot,
    semanticOwnerBasis: input.owner.semanticOwnerBasis,
    modulePath:
      "code/src/abg/m03/contracts/one_surface_operation_contracts.js",
    exportName: "ONE_SURFACE_NATIVE_CONTRACT_SOURCES",
    memberPath: [
      familyKeyForOperation(input.operationId),
      input.variant,
      input.slot
    ],
    namedChecks: { kind: "none" },
    schema: input.schema
  });
}

const startScopeSchema = v.strictObject({
  kind: v.literal("workspace"),
  scopeRef: refSchema,
  scopeDigest: sha256DigestSchema
});

const startTargetSchema = v.union([
  v.strictObject({ kind: v.literal("next") }),
  v.strictObject({ kind: v.literal("graph_function"), handle: refSchema }),
  v.strictObject({ kind: v.literal("asset"), handle: refSchema })
]);

const runInvokeInvokeRequestSchema = v.strictObject({
  kind: v.literal("run_invoke_request"),
  variant: v.literal("invoke"),
  programRef: refSchema,
  programDigest: sha256DigestSchema,
  canonicalHandle: refSchema,
  inputContractRef: refSchema,
  inputContractDigest: sha256DigestSchema,
  input: canonicalIJsonSchema,
  catalogViewRef: refSchema,
  catalogViewDigest: sha256DigestSchema,
  allowlist: refListSchema
});

function runInvokeStartRequestSchema<
  const Until extends NativeSchema,
  const FhMode extends NativeSchema,
  const RootMode extends NativeSchema
>(input: {
  readonly until: Until;
  readonly fhMode: FhMode;
  readonly rootMode: RootMode;
}) {
  return v.strictObject({
    kind: v.literal("run_invoke_request"),
    variant: v.literal("start"),
    programRef: refSchema,
    programDigest: sha256DigestSchema,
    scope: startScopeSchema,
    target: startTargetSchema,
    until: input.until,
    catalogViewRef: refSchema,
    catalogViewDigest: sha256DigestSchema,
    allowlist: refListSchema,
    fhMode: input.fhMode,
    rootMode: input.rootMode
  });
}

const runInvokeStartRequest = v.union([
  runInvokeStartRequestSchema({
    until: v.picklist(["first_traversal", "blocked"]),
    fhMode: v.literal("direct"),
    rootMode: v.literal("supervised")
  }),
  runInvokeStartRequestSchema({
    until: v.literal("converged"),
    fhMode: v.picklist(["direct", "human-proxy"]),
    rootMode: v.picklist(["direct", "supervised"])
  })
]);

function runInvokePostEffectResultSchema<
  const Variant extends "invoke" | "start",
  const Disposition extends "completed" | "blocked" | "runtime_failed",
  const ResultRef extends NativeSchema,
  const StopRef extends NativeSchema,
  const FailureRef extends NativeSchema
>(variant: Variant, input: {
  readonly disposition: Disposition;
  readonly resultRef: ResultRef;
  readonly stopRef: StopRef;
  readonly failureRef: FailureRef;
}) {
  return v.strictObject({
    kind: v.literal("run_invoke_result"),
    variant: v.literal(variant),
    disposition: v.literal(input.disposition),
    phase: v.literal("post_effect"),
    runRef: refSchema,
    graphCallRef: refSchema,
    resultRef: input.resultRef,
    stopRef: input.stopRef,
    failureRef: input.failureRef,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

function runInvokePostEffectResultSchemas<
  const Variant extends "invoke" | "start"
>(
  variant: Variant
) {
  return [
    runInvokePostEffectResultSchema(variant, {
      disposition: "completed",
      resultRef: refSchema,
      stopRef: v.null(),
      failureRef: v.null()
    }),
    runInvokePostEffectResultSchema(variant, {
      disposition: "blocked",
      resultRef: v.null(),
      stopRef: refSchema,
      failureRef: v.null()
    }),
    runInvokePostEffectResultSchema(variant, {
      disposition: "runtime_failed",
      resultRef: v.null(),
      stopRef: v.null(),
      failureRef: refSchema
    })
  ] as const;
}

const runInvokeInvokeResult = v.union(
  runInvokePostEffectResultSchemas("invoke")
);

const runInvokeStartResult = v.union([
  ...runInvokePostEffectResultSchemas("start"),
  v.strictObject({
    kind: v.literal("run_invoke_result"),
    variant: v.literal("start"),
    disposition: v.literal("blocked"),
    phase: v.literal("pre_invocation_stop"),
    runRef: refSchema,
    graphCallRef: v.null(),
    resultRef: v.null(),
    stopRef: refSchema,
    failureRef: v.null(),
    evidenceRefs: refListSchema,
    replayRef: refSchema
  })
]);

const RUN_INVOKE_INVOKE_REFUSAL_CODES = Object.freeze([
  "program_invalid",
  "function_nonmember",
  "outside_view",
  "noncallable",
  "next_action_mismatch",
  "intent_missing",
  "input_invalid",
  "capability_missing",
  "runtime_failed"
] as const);

const RUN_INVOKE_START_REFUSAL_CODES = Object.freeze([
  ...RUN_INVOKE_INVOKE_REFUSAL_CODES,
  "target_invalid",
  "mode_invalid",
  "until_invalid"
] as const);

function runInvokeRefusalSchema<
  const Variant extends "invoke" | "start",
  const Codes extends readonly [string, ...string[]]
>(variant: Variant, codes: Codes) {
  return v.strictObject({
    kind: v.literal("run_invoke_refusal"),
    variant: v.literal(variant),
    phase: v.literal("pre_effect"),
    code: v.picklist(codes),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  });
}

function runInvokeNonterminalSchema<const Variant extends "invoke" | "start">(
  variant: Variant
) {
  return v.union([
    v.strictObject({
      kind: v.literal("run_invoke_nonterminal"),
      variant: v.literal(variant),
      disposition: v.literal("held"),
      phase: v.literal("post_effect"),
      runRef: refSchema,
      graphCallRef: refSchema,
      interactionRef: refSchema,
      gapProjectionRef: v.null(),
      evidenceRefs: refListSchema,
      replayRef: refSchema
    }),
    v.strictObject({
      kind: v.literal("run_invoke_nonterminal"),
      variant: v.literal(variant),
      disposition: v.literal("gap_stop"),
      phase: v.literal("pre_invocation_stop"),
      runRef: refSchema,
      graphCallRef: v.null(),
      interactionRef: v.null(),
      gapProjectionRef: refSchema,
      evidenceRefs: refListSchema,
      replayRef: refSchema
    }),
    v.strictObject({
      kind: v.literal("run_invoke_nonterminal"),
      variant: v.literal(variant),
      disposition: v.literal("gap_stop"),
      phase: v.literal("post_effect"),
      runRef: refSchema,
      graphCallRef: refSchema,
      interactionRef: v.null(),
      gapProjectionRef: refSchema,
      evidenceRefs: refListSchema,
      replayRef: refSchema
    })
  ]);
}

const basisRelationSchema = v.union([
  v.strictObject({ kind: v.literal("same_basis") }),
  v.strictObject({
    kind: v.literal("authority_changed"),
    coveringRepriceRef: refSchema,
    coveringRepriceDigest: sha256DigestSchema
  })
]);

const runContinueCurrentIntentRequestSchema = v.strictObject({
  kind: v.literal("run_continue_request"),
  variant: v.literal("current_intent"),
  runRef: refSchema,
  continuationRef: refSchema,
  continuationDigest: sha256DigestSchema,
  currentIntentRef: refSchema,
  currentIntentDigest: sha256DigestSchema,
  continuationInputRef: refSchema,
  continuationInputDigest: sha256DigestSchema,
  expectedExecutionBasisRef: refSchema,
  expectedExecutionBasisDigest: sha256DigestSchema
});

const runContinueSelectedActionRequestSchema = v.strictObject({
  kind: v.literal("run_continue_request"),
  variant: v.literal("selected_action"),
  runRef: refSchema,
  continuationRef: refSchema,
  continuationDigest: sha256DigestSchema,
  nextActionProjectionRef: refSchema,
  nextActionProjectionDigest: sha256DigestSchema,
  basisRelation: basisRelationSchema
});

function runContinueCurrentIntentResultSchema<
  const Disposition extends "completed" | "blocked" | "runtime_failed",
  const SuccessorReceiptRef extends NativeSchema,
  const StopRef extends NativeSchema,
  const FailureRef extends NativeSchema
>(input: {
  readonly disposition: Disposition;
  readonly successorReceiptRef: SuccessorReceiptRef;
  readonly stopRef: StopRef;
  readonly failureRef: FailureRef;
}) {
  return v.strictObject({
    kind: v.literal("run_continue_result"),
    variant: v.literal("current_intent"),
    disposition: v.literal(input.disposition),
    phase: v.literal("post_effect"),
    runRef: refSchema,
    currentIntentRef: refSchema,
    successorReceiptRef: input.successorReceiptRef,
    stopRef: input.stopRef,
    failureRef: input.failureRef,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

const runContinueCurrentIntentResult = v.union([
  runContinueCurrentIntentResultSchema({
    disposition: "completed",
    successorReceiptRef: refSchema,
    stopRef: v.null(),
    failureRef: v.null()
  }),
  runContinueCurrentIntentResultSchema({
    disposition: "blocked",
    successorReceiptRef: refSchema,
    stopRef: refSchema,
    failureRef: v.null()
  }),
  runContinueCurrentIntentResultSchema({
    disposition: "runtime_failed",
    successorReceiptRef: v.null(),
    stopRef: v.null(),
    failureRef: refSchema
  })
]);

function runContinueSelectedActionResultSchema<
  const Disposition extends "completed" | "blocked" | "runtime_failed",
  const StopRef extends NativeSchema,
  const FailureRef extends NativeSchema
>(input: {
  readonly disposition: Disposition;
  readonly stopRef: StopRef;
  readonly failureRef: FailureRef;
}) {
  return v.strictObject({
    kind: v.literal("run_continue_result"),
    variant: v.literal("selected_action"),
    disposition: v.literal(input.disposition),
    phase: v.literal("post_effect"),
    runRef: refSchema,
    constructionIntentRef: refSchema,
    graphCallRef: refSchema,
    stopRef: input.stopRef,
    failureRef: input.failureRef,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

const runContinueSelectedActionResult = v.union([
  runContinueSelectedActionResultSchema({
    disposition: "completed",
    stopRef: v.null(),
    failureRef: v.null()
  }),
  runContinueSelectedActionResultSchema({
    disposition: "blocked",
    stopRef: refSchema,
    failureRef: v.null()
  }),
  runContinueSelectedActionResultSchema({
    disposition: "runtime_failed",
    stopRef: v.null(),
    failureRef: refSchema
  })
]);

const RUN_CONTINUE_CURRENT_INTENT_REFUSAL_CODES = Object.freeze([
  "continuation_missing",
  "continuation_resolved",
  "intent_mismatch",
  "response_missing",
  "stale_replay",
  "basis_fork_detected",
  "runtime_failed"
] as const);

const RUN_CONTINUE_SELECTED_ACTION_REFUSAL_CODES = Object.freeze([
  "next_action_stale",
  "action_mismatch",
  "intent_admission_refused",
  "covering_reprice_missing",
  "basis_fork_detected",
  "runtime_failed"
] as const);

function runContinueRefusalSchema<
  const Variant extends "current_intent" | "selected_action",
  const Codes extends readonly [string, ...string[]]
>(variant: Variant, codes: Codes) {
  return v.strictObject({
    kind: v.literal("run_continue_refusal"),
    variant: v.literal(variant),
    phase: v.literal("pre_effect"),
    code: v.picklist(codes),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  });
}

function runContinueCurrentIntentNonterminalSchema<
  const Disposition extends "held" | "gap_stop",
  const InteractionRef extends NativeSchema,
  const GapProjectionRef extends NativeSchema
>(input: {
  readonly disposition: Disposition;
  readonly interactionRef: InteractionRef;
  readonly gapProjectionRef: GapProjectionRef;
}) {
  return v.strictObject({
    kind: v.literal("run_continue_nonterminal"),
    variant: v.literal("current_intent"),
    phase: v.literal("post_effect"),
    runRef: refSchema,
    continuationRef: refSchema,
    successorReceiptRef: refSchema,
    disposition: v.literal(input.disposition),
    interactionRef: input.interactionRef,
    gapProjectionRef: input.gapProjectionRef,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

const runContinueCurrentIntentNonterminal = v.union([
  runContinueCurrentIntentNonterminalSchema({
    disposition: "held",
    interactionRef: refSchema,
    gapProjectionRef: v.null()
  }),
  runContinueCurrentIntentNonterminalSchema({
    disposition: "gap_stop",
    interactionRef: v.null(),
    gapProjectionRef: refSchema
  })
]);

function runContinueSelectedActionNonterminalSchema<
  const Disposition extends "held" | "gap_stop",
  const InteractionRef extends NativeSchema,
  const GapProjectionRef extends NativeSchema
>(input: {
  readonly disposition: Disposition;
  readonly interactionRef: InteractionRef;
  readonly gapProjectionRef: GapProjectionRef;
}) {
  return v.strictObject({
    kind: v.literal("run_continue_nonterminal"),
    variant: v.literal("selected_action"),
    phase: v.literal("post_effect"),
    runRef: refSchema,
    continuationRef: refSchema,
    constructionIntentRef: refSchema,
    graphCallRef: refSchema,
    disposition: v.literal(input.disposition),
    interactionRef: input.interactionRef,
    gapProjectionRef: input.gapProjectionRef,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

const runContinueSelectedActionNonterminal = v.union([
  runContinueSelectedActionNonterminalSchema({
    disposition: "held",
    interactionRef: refSchema,
    gapProjectionRef: v.null()
  }),
  runContinueSelectedActionNonterminalSchema({
    disposition: "gap_stop",
    interactionRef: v.null(),
    gapProjectionRef: refSchema
  })
]);

export const INTERACTION_RESPONSE_KIND_VALUES = Object.freeze([
  "select",
  "approve",
  "reject",
  "assess",
  "answer_escalation"
] as const);

type InteractionResponseKind =
  (typeof INTERACTION_RESPONSE_KIND_VALUES)[number];

function interactionRespondRequestSchema<
  const Kind extends InteractionResponseKind,
  const ChoiceRef extends NativeSchema
>(responseKind: Kind, choiceRef: ChoiceRef) {
  return v.strictObject({
    kind: v.literal("interaction_respond_request"),
    responseKind: v.literal(responseKind),
    interactionRef: refSchema,
    interactionBasisDigest: sha256DigestSchema,
    responseContractRef: refSchema,
    responseContractDigest: sha256DigestSchema,
    choiceRef,
    value: canonicalIJsonSchema,
    evidenceRefs: refListSchema,
    capabilityProvenanceRefs: refListSchema
  });
}

function interactionRespondResultSchema<const Kind extends InteractionResponseKind>(
  responseKind: Kind
) {
  return v.strictObject({
    kind: v.literal("interaction_respond_result"),
    responseKind: v.literal(responseKind),
    interactionRef: refSchema,
    responseRef: refSchema,
    respondedEventRef: refSchema,
    interactionProjectionRef: refSchema,
    interactionProjectionDigest: sha256DigestSchema,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

const INTERACTION_RESPOND_REFUSAL_CODES = Object.freeze([
  "interaction_missing",
  "interaction_resolved",
  "response_kind_forbidden",
  "response_contract_mismatch",
  "choice_invalid",
  "value_invalid",
  "actor_capability_missing",
  "basis_mismatch"
] as const);

function interactionRespondRefusalSchema<const Kind extends InteractionResponseKind>(
  responseKind: Kind
) {
  return v.strictObject({
    kind: v.literal("interaction_respond_refusal"),
    responseKind: v.literal(responseKind),
    code: v.picklist(INTERACTION_RESPOND_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  });
}

function interactionRespondNonterminalSchema<
  const Kind extends InteractionResponseKind
>(responseKind: Kind) {
  return v.strictObject({
    kind: v.literal("interaction_respond_nonterminal"),
    responseKind: v.literal(responseKind),
    disposition: v.literal("responded"),
    interactionRef: refSchema,
    responseRef: refSchema,
    continuationRef: refSchema,
    interactionProjectionRef: refSchema,
    interactionProjectionDigest: sha256DigestSchema,
    evidenceRefs: refListSchema,
    replayRef: refSchema
  });
}

function contractSet<
  const OperationId extends OneSurfaceOwnerOperationId,
  const Variant extends string,
  const Request extends NativeSchema,
  const Result extends NativeSchema,
  const Refusal extends NativeSchema,
  const Nonterminal extends NativeSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly owner: typeof T270_AUTHORITY | typeof T272_AUTHORITY;
  readonly request: Request;
  readonly result: Result;
  readonly refusal: Refusal;
  readonly nonterminal: Nonterminal;
}) {
  return Object.freeze({
    request: nativeSource({ ...input, slot: "request", schema: input.request }),
    result: nativeSource({ ...input, slot: "result", schema: input.result }),
    refusal: nativeSource({ ...input, slot: "refusal", schema: input.refusal }),
    nonterminal: nativeSource({
      ...input,
      slot: "nonterminal",
      schema: input.nonterminal
    })
  });
}

export const RUN_INVOKE_NATIVE_CONTRACT_SOURCES = Object.freeze({
  invoke: contractSet({
    operationId: "abg.operation.run.invoke",
    variant: "invoke",
    owner: T270_AUTHORITY,
    request: runInvokeInvokeRequestSchema,
    result: runInvokeInvokeResult,
    refusal: runInvokeRefusalSchema(
      "invoke",
      RUN_INVOKE_INVOKE_REFUSAL_CODES
    ),
    nonterminal: runInvokeNonterminalSchema("invoke")
  }),
  start: contractSet({
    operationId: "abg.operation.run.invoke",
    variant: "start",
    owner: T270_AUTHORITY,
    request: runInvokeStartRequest,
    result: runInvokeStartResult,
    refusal: runInvokeRefusalSchema("start", RUN_INVOKE_START_REFUSAL_CODES),
    nonterminal: runInvokeNonterminalSchema("start")
  })
});

export const RUN_CONTINUE_NATIVE_CONTRACT_SOURCES = Object.freeze({
  current_intent: contractSet({
    operationId: "abg.operation.run.continue",
    variant: "current_intent",
    owner: T272_AUTHORITY,
    request: runContinueCurrentIntentRequestSchema,
    result: runContinueCurrentIntentResult,
    refusal: runContinueRefusalSchema(
      "current_intent",
      RUN_CONTINUE_CURRENT_INTENT_REFUSAL_CODES
    ),
    nonterminal: runContinueCurrentIntentNonterminal
  }),
  selected_action: contractSet({
    operationId: "abg.operation.run.continue",
    variant: "selected_action",
    owner: T272_AUTHORITY,
    request: runContinueSelectedActionRequestSchema,
    result: runContinueSelectedActionResult,
    refusal: runContinueRefusalSchema(
      "selected_action",
      RUN_CONTINUE_SELECTED_ACTION_REFUSAL_CODES
    ),
    nonterminal: runContinueSelectedActionNonterminal
  })
});

function interactionContractSet<
  const Kind extends InteractionResponseKind,
  const ChoiceRef extends NativeSchema
>(
  responseKind: Kind,
  choiceRef: ChoiceRef
) {
  return contractSet({
    operationId: "abg.operation.interaction.respond",
    variant: responseKind,
    owner: T272_AUTHORITY,
    request: interactionRespondRequestSchema(responseKind, choiceRef),
    result: interactionRespondResultSchema(responseKind),
    refusal: interactionRespondRefusalSchema(responseKind),
    nonterminal: interactionRespondNonterminalSchema(responseKind)
  });
}

export const INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES = Object.freeze({
  select: interactionContractSet("select", refSchema),
  approve: interactionContractSet("approve", v.nullable(refSchema)),
  reject: interactionContractSet("reject", v.nullable(refSchema)),
  assess: interactionContractSet("assess", v.nullable(refSchema)),
  answer_escalation: interactionContractSet(
    "answer_escalation",
    v.nullable(refSchema)
  )
});

const lawfulActionRowSchema = v.pipe(
  v.strictObject({
    actionRef: refSchema,
    actionKind: v.picklist(CONSTRUCTION_ACTION_KIND_VALUES),
    target: lawfulActionTargetSchema,
    eligibility: v.picklist(["eligible", "blocked"]),
    blockerRefs: readonlyRefListSchema,
    requiredInput: lawfulActionRequiredInputSchema,
    requiredCapabilityRefs: capabilityListSchema,
    provenanceRefs: readonlyRefListSchema
  }),
  v.readonly()
);
const lawfulActionProjectionCarrierSchema = v.strictObject({
  kind: v.literal("lawful_action_projection"),
  projection: refDigestSchema,
  run: refDigestSchema,
  frontier: refDigestSchema,
  nextActionProjection: refDigestSchema,
  replayBasis: refDigestSchema,
  rows: v.pipe(v.array(lawfulActionRowSchema), v.readonly())
});
const LAWFUL_ACTION_RELATION_ACTION = Object.freeze(
  v.check(
    (projection: v.InferOutput<
      typeof lawfulActionProjectionCarrierSchema
    >) => {
      const actionRefs = projection.rows.map((row) => row.actionRef);
      return (
        new Set(actionRefs).size === actionRefs.length &&
        projection.rows.every((row) => {
          return (
            (row.eligibility === "eligible") ===
              (row.blockerRefs.length === 0) &&
            (row.actionKind === "open_fh_gate") ===
              (row.target.kind === "pending_interaction")
          );
        })
      );
    },
    "lawful action rows must be unique and preserve target and eligibility truth"
  )
);
const LAWFUL_ACTIONS_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-030",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const lawfulActionProjectionSchema = v.pipe(
  lawfulActionProjectionCarrierSchema,
  LAWFUL_ACTION_RELATION_ACTION,
  v.readonly()
);

export const ONE_SURFACE_OPERATION_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/one-surface-operation@5",
  checks: [
    {
      checkId: "lawful-action-relation",
      action: LAWFUL_ACTION_RELATION_ACTION,
      relationRef: "REQ-P-POLICY-030"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const lawfulActionsResult = ownerNativeDefinitionContractSource({
  owner: {
    product: "abiogenesis",
    module: "abg.m03",
    family: "one_surface_lawful_actions"
  },
  definitionKey: {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "run_lawful_actions"
  },
  slot: "result",
  semanticOwnerBasis: LAWFUL_ACTIONS_SEMANTIC_OWNER_BASIS,
  modulePath:
    "code/src/abg/m03/contracts/one_surface_operation_contracts.js",
  exportName: "ONE_SURFACE_NATIVE_CONTRACT_SOURCES",
  memberPath: ["project_read", "run_lawful_actions", "result"],
  namedChecks: {
    kind: "family_registry",
    exportName: "ONE_SURFACE_OPERATION_NATIVE_CHECK_REGISTRY",
    memberPath: []
  },
  schema: lawfulActionProjectionSchema
});

export const ONE_SURFACE_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    run_lawful_actions: {
      result: lawfulActionsResult
    }
  },
  run_invoke: RUN_INVOKE_NATIVE_CONTRACT_SOURCES,
  run_continue: RUN_CONTINUE_NATIVE_CONTRACT_SOURCES,
  interaction_respond: INTERACTION_RESPOND_NATIVE_CONTRACT_SOURCES
});

type LawfulActionsDefinitionKey = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: "run_lawful_actions";
}>;
type LawfulActionsReadRequest = Readonly<{
  source: Readonly<{
    kind: "Run";
    sourceRef: string;
    sourceDigest: string;
  }>;
  selector: Readonly<{
    nextActionProjection: Readonly<{
      ref: string;
      digest: string;
    }>;
  }>;
}>;
type LawfulActionsProjection = v.InferOutput<
  typeof lawfulActionProjectionSchema
>;

const LAWFUL_ACTIONS_PROJECT_READ_RELATION: OwnerProjectionRelationAction<
  LawfulActionsDefinitionKey,
  LawfulActionsReadRequest,
  LawfulActionsProjection
> = ({ admittedRequest, candidateProjection }) => {
  const issuePaths: string[] = [];
  if (
    admittedRequest.source.sourceRef !== candidateProjection.run.ref ||
    admittedRequest.source.sourceDigest !== candidateProjection.run.digest
  ) {
    issuePaths.push("candidateProjection.run");
  }
  if (
    admittedRequest.selector.nextActionProjection.ref !==
      candidateProjection.nextActionProjection.ref ||
    admittedRequest.selector.nextActionProjection.digest !==
      candidateProjection.nextActionProjection.digest
  ) {
    issuePaths.push("candidateProjection.nextActionProjection");
  }
  const [first, ...remaining] = issuePaths;
  return first === undefined
    ? { kind: "projection_related" }
    : {
        kind: "projection_relation_mismatch",
        issuePaths: [first, ...remaining]
      };
};

export const ONE_SURFACE_PROJECT_READ_RELATION_SOURCES = freezeNativeValue({
  run_lawful_actions: ownerProjectionRelationSource({
    relationIdentity: "relation://abg/project-read/run-lawful-actions@5",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "run_lawful_actions"
    },
    semanticOwnerBasis: LAWFUL_ACTIONS_SEMANTIC_OWNER_BASIS,
    modulePath:
      "code/src/abg/m03/contracts/one_surface_operation_contracts.js",
    exportName: "ONE_SURFACE_PROJECT_READ_RELATION_SOURCES",
    memberPath: ["run_lawful_actions"],
    relation: LAWFUL_ACTIONS_PROJECT_READ_RELATION
  })
});
