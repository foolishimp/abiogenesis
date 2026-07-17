// Private T-281 owner inputs for runtime project.read results. Runtime
// projection handlers and public publication remain outside this module.

import * as v from "valibot";

import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  canonicalIJsonSchema,
  POSITIVE_INTEGER_ACTION,
  refSchema,
  SAFE_INTEGER_ACTION,
  safePositiveIntegerSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { ownerNativeDefinitionContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import { assertCanonicalRuntimeEventSequence } from "./event_admission.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/runtime_projection_operation_contracts.js" as const;
const EXPORT_NAME = "RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES";
const NAMED_CHECK_EXPORT_NAME = "RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY";
const POLICY_DIGEST =
  "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f" as const;
const RUNTIME_PROJECTION_NAMED_CHECKS = freezeNativeValue({
  kind: "family_registry" as const,
  exportName: NAMED_CHECK_EXPORT_NAME,
  memberPath: [] as const
});

type SubjectKind =
  | "WorkspaceBinding"
  | "Run"
  | "GraphCall"
  | "RuntimeResult"
  | "ResultAssessment"
  | "WitnessedAct"
  | "InstalledProduct"
  | "ReleaseCut"
  | "FhInteraction"
  | "Continuation"
  | "CProgramAtomReceipt";

const refDigestSchema = v.pipe(
  v.strictObject({
    ref: refSchema,
    digest: sha256DigestSchema
  }),
  v.readonly()
);
const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1),
  v.readonly()
);
const safeNonNegativeIntegerSchema = v.pipe(
  v.number(),
  POSITIVE_INTEGER_ACTION,
  SAFE_INTEGER_ACTION,
  v.minValue(0)
);

function subjectCoordinateSchema<const Kind extends SubjectKind>(kind: Kind) {
  return v.pipe(
    v.strictObject({
      kind: v.literal(kind),
      ref: refSchema,
      digest: sha256DigestSchema
    }),
    v.readonly()
  );
}

const absentCoordinateSchema = v.pipe(
  v.strictObject({ kind: v.literal("absent") }),
  v.readonly()
);
const presentCoordinateSchema = v.pipe(
  v.strictObject({
    kind: v.literal("present"),
    value: refDigestSchema
  }),
  v.readonly()
);
const optionalCoordinateSchema = v.union([
  absentCoordinateSchema,
  presentCoordinateSchema
]);

const runtimeSubstrateSchema = v.pipe(
  v.strictObject({
    program: refDigestSchema,
    workspaceBinding: refDigestSchema,
    executionBasis: refDigestSchema
  }),
  v.readonly()
);

const runtimeLifecycleSchema = v.union([
  v.pipe(
    v.strictObject({
      kind: v.literal("nonterminal"),
      disposition: v.picklist(["pending", "running"]),
      stop: v.null(),
      terminal: v.null(),
      pendingInteraction: v.null()
    }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({
      kind: v.literal("nonterminal"),
      disposition: v.literal("held"),
      stop: refDigestSchema,
      terminal: v.null(),
      pendingInteraction: refDigestSchema
    }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({
      kind: v.literal("nonterminal"),
      disposition: v.literal("gap_stop"),
      stop: refDigestSchema,
      terminal: v.null(),
      pendingInteraction: v.null()
    }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({
      kind: v.literal("terminal"),
      disposition: v.picklist(["completed", "blocked", "runtime_failed"]),
      stop: v.null(),
      terminal: refDigestSchema,
      pendingInteraction: v.null()
    }),
    v.readonly()
  )
]);

function runtimeStatusProjectionSchema<const Kind extends "Run" | "GraphCall">(
  subjectKind: Kind
) {
  return v.pipe(
    v.strictObject({
      kind: v.literal("runtime_status_projection"),
      projection: refDigestSchema,
      subject: subjectCoordinateSchema(subjectKind),
      substrate: runtimeSubstrateSchema,
      lifecycle: runtimeLifecycleSchema,
      resultRefs: refListSchema,
      gapRefs: refListSchema,
      evidenceRefs: refListSchema,
      replayRefs: refListSchema,
      provenanceRefs: refListSchema
    }),
    v.readonly()
  );
}

const eligibleClosureFields = {
  closureEligible: v.literal(true),
  residualRefs: v.pipe(v.tuple([]), v.readonly())
} as const;
const ineligibleClosureFields = {
  closureEligible: v.literal(false),
  residualRefs: nonEmptyRefListSchema
} as const;

function runtimeResultRowSchema<const Kind extends "Run" | "GraphCall">(
  subjectKind: Kind
) {
  const common = {
    result: refDigestSchema,
    subject: subjectCoordinateSchema(subjectKind),
    graphCall: refDigestSchema,
    declaredContract: refDigestSchema,
    disposition: v.picklist([
      "converged",
      "stopped",
      "yielded",
      "blocked",
      "human_gate_required"
    ]),
    payload: optionalCoordinateSchema,
    artifact: optionalCoordinateSchema,
    assessment: optionalCoordinateSchema,
    evidenceRefs: refListSchema,
    provenanceRefs: refListSchema,
    replay: refDigestSchema
  } as const;
  return v.union([
    v.pipe(
      v.strictObject({ ...common, ...eligibleClosureFields }),
      v.readonly()
    ),
    v.pipe(
      v.strictObject({ ...common, ...ineligibleClosureFields }),
      v.readonly()
    )
  ]);
}

type RuntimeResultRelationValue = {
  readonly kind: "run_result_projection" | "graph_call_result_projection";
  readonly subject: {
    readonly kind: "Run" | "GraphCall";
    readonly ref: string;
    readonly digest: string;
  };
  readonly results?: readonly RuntimeResultRelationRow[];
  readonly result?: RuntimeResultRelationRow;
};

type RuntimeResultRelationRow = {
  readonly result: { readonly ref: string; readonly digest: string };
  readonly subject: {
    readonly kind: "Run" | "GraphCall";
    readonly ref: string;
    readonly digest: string;
  };
  readonly graphCall: { readonly ref: string; readonly digest: string };
};

function sameCoordinate(
  left: { readonly ref: string; readonly digest: string },
  right: { readonly ref: string; readonly digest: string }
): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

function hasConservedRuntimeResultRelation(
  projection: RuntimeResultRelationValue
): boolean {
  const rows = projection.results ??
    (projection.result === undefined ? [] : [projection.result]);
  if (
    rows.some(
      (row) =>
        row.subject.kind !== projection.subject.kind ||
        !sameCoordinate(row.subject, projection.subject)
    ) ||
    new Set(rows.map((row) => row.result.ref)).size !== rows.length ||
    new Set(rows.map((row) => row.graphCall.ref)).size !== rows.length
  ) {
    return false;
  }
  return (
    projection.kind !== "graph_call_result_projection" ||
    (rows.length === 1 &&
      rows[0] !== undefined &&
      sameCoordinate(rows[0].graphCall, projection.subject))
  );
}

function runResultProjectionContract() {
  const baseSchema = v.strictObject({
    kind: v.literal("run_result_projection"),
    projection: refDigestSchema,
    subject: subjectCoordinateSchema("Run"),
    results: v.pipe(
      v.array(runtimeResultRowSchema("Run")),
      v.minLength(1),
      v.readonly()
    )
  });
  const relationAction = Object.freeze(
    v.check(
      (projection: v.InferOutput<typeof baseSchema>) =>
        hasConservedRuntimeResultRelation(projection),
      "result rows must conserve subject and result identity with one GraphCall per row"
    )
  );
  return freezeNativeValue({
    action: relationAction,
    schema: v.pipe(baseSchema, relationAction, v.readonly())
  });
}

function graphCallResultProjectionContract() {
  const baseSchema = v.strictObject({
    kind: v.literal("graph_call_result_projection"),
    projection: refDigestSchema,
    subject: subjectCoordinateSchema("GraphCall"),
    result: runtimeResultRowSchema("GraphCall")
  });
  const relationAction = Object.freeze(
    v.check(
      (projection: v.InferOutput<typeof baseSchema>) =>
        hasConservedRuntimeResultRelation(projection),
      "result rows must conserve subject and result identity with one GraphCall per row"
    )
  );
  return freezeNativeValue({
    action: relationAction,
    schema: v.pipe(baseSchema, relationAction, v.readonly())
  });
}

const RUN_RESULT_PROJECTION_CONTRACT = runResultProjectionContract();
const GRAPH_CALL_RESULT_PROJECTION_CONTRACT =
  graphCallResultProjectionContract();

type EvidenceProjectionSubjectKind =
  | "Run"
  | "GraphCall"
  | "RuntimeResult"
  | "ResultAssessment"
  | "WitnessedAct"
  | "InstalledProduct"
  | "ReleaseCut";
type ReplayProjectionSubjectKind =
  | "WorkspaceBinding"
  | "Run"
  | "GraphCall"
  | "FhInteraction"
  | "Continuation"
  | "CProgramAtomReceipt";

function evidenceRowSchema<const Kind extends EvidenceProjectionSubjectKind>(
  subjectKind: Kind
) {
  return v.pipe(
    v.strictObject({
      evidence: refDigestSchema,
      evidenceContract: refDigestSchema,
      admittedValue: canonicalIJsonSchema,
      subject: subjectCoordinateSchema(subjectKind),
      material: v.union([
        v.pipe(
          v.strictObject({
            kind: v.literal("content"),
            content: refDigestSchema
          }),
          v.readonly()
        ),
        v.pipe(
          v.strictObject({
            kind: v.literal("artifact"),
            artifact: refDigestSchema
          }),
          v.readonly()
        )
      ]),
      producer: refDigestSchema,
      basis: refDigestSchema,
      provenanceRefs: refListSchema,
      replay: refDigestSchema
    }),
    v.readonly()
  );
}

type EvidenceRelationValue = {
  readonly subject: {
    readonly kind: EvidenceProjectionSubjectKind;
    readonly ref: string;
    readonly digest: string;
  };
  readonly rows: readonly {
    readonly evidence: { readonly ref: string; readonly digest: string };
    readonly subject: {
      readonly kind: EvidenceProjectionSubjectKind;
      readonly ref: string;
      readonly digest: string;
    };
  }[];
};

function hasConservedEvidenceRelation(
  projection: EvidenceRelationValue
): boolean {
  return (
    new Set(projection.rows.map((row) => row.evidence.ref)).size ===
      projection.rows.length &&
    projection.rows.every(
      (row) =>
        row.subject.kind === projection.subject.kind &&
        sameCoordinate(row.subject, projection.subject)
    )
  );
}

function evidenceProjectionContract<const Kind extends EvidenceProjectionSubjectKind>(
  subjectKind: Kind
) {
  const baseSchema = v.strictObject({
    kind: v.literal("evidence_projection"),
    projection: refDigestSchema,
    subject: subjectCoordinateSchema(subjectKind),
    rows: v.pipe(
      v.array(evidenceRowSchema(subjectKind)),
      v.minLength(1),
      v.readonly()
    )
  });
  const relationAction = Object.freeze(
    v.check(
      (projection: v.InferOutput<typeof baseSchema>) =>
        hasConservedEvidenceRelation(projection),
      "evidence rows must conserve subject and evidence identity"
    )
  );
  return freezeNativeValue({
    schema: v.pipe(baseSchema, relationAction, v.readonly()),
    subjectConservationAction: relationAction
  });
}

export const RUN_EVIDENCE_PROJECTION_NATIVE_CONTRACT =
  evidenceProjectionContract("Run");
export const GRAPH_CALL_EVIDENCE_PROJECTION_NATIVE_CONTRACT =
  evidenceProjectionContract("GraphCall");
export const RUNTIME_RESULT_EVIDENCE_PROJECTION_NATIVE_CONTRACT =
  evidenceProjectionContract("RuntimeResult");
export function createResultAssessmentEvidenceProjectionNativeContract() {
  return evidenceProjectionContract("ResultAssessment");
}

export function createWitnessedActEvidenceProjectionNativeContract() {
  return evidenceProjectionContract("WitnessedAct");
}

export function createInstalledProductEvidenceProjectionNativeContract() {
  return evidenceProjectionContract("InstalledProduct");
}

export function createReleaseCutEvidenceProjectionNativeContract() {
  return evidenceProjectionContract("ReleaseCut");
}

const replayEventRowSchema = v.pipe(
  v.strictObject({
    ordinal: safeNonNegativeIntegerSchema,
    event: refDigestSchema,
    sourceRefs: nonEmptyRefListSchema,
    admittedEvent: canonicalIJsonSchema
  }),
  v.readonly()
);

type ReplayRelationValue = {
  readonly subject: {
    readonly kind: ReplayProjectionSubjectKind;
    readonly ref: string;
    readonly digest: string;
  };
  readonly fromOrdinal: number;
  readonly limit: number;
  readonly returnedThroughOrdinal: number | null;
  readonly nextOrdinal: number | null;
  readonly rows: readonly {
    readonly ordinal: number;
    readonly event: { readonly ref: string; readonly digest: string };
    readonly sourceRefs: readonly string[];
    readonly admittedEvent: unknown;
  }[];
};

function hasConservedReplayRelation(
  projection: ReplayRelationValue
): boolean {
  if (projection.rows.length > projection.limit) {
    return false;
  }
  const admittedEvents = projection.rows.map((row) => row.admittedEvent);
  try {
    assertCanonicalRuntimeEventSequence(
      admittedEvents,
      "ReplayProjection.rows"
    );
  } catch {
    return false;
  }
  let priorOrdinal: number | null = null;
  for (const [index, row] of projection.rows.entries()) {
    const admittedEvent = admittedEvents[index];
    if (admittedEvent === undefined) {
      return false;
    }
    if (
      row.ordinal < projection.fromOrdinal ||
      (priorOrdinal !== null && row.ordinal <= priorOrdinal) ||
      row.ordinal !== admittedEvent.eventAdmissionOrdinal ||
      row.event.ref !== admittedEvent.eventId ||
      row.event.digest !== stableSha256Digest(admittedEvent) ||
      !row.sourceRefs.includes(projection.subject.ref)
    ) {
      return false;
    }
    priorOrdinal = row.ordinal;
  }
  if (priorOrdinal === null) {
    return (
      projection.returnedThroughOrdinal === null &&
      projection.nextOrdinal === null
    );
  }
  return (
    projection.returnedThroughOrdinal === priorOrdinal &&
    (projection.nextOrdinal === null ||
      projection.nextOrdinal > priorOrdinal) &&
    (projection.rows.length === projection.limit ||
      projection.nextOrdinal === null)
  );
}

function replayProjectionContract<const Kind extends ReplayProjectionSubjectKind>(
  subjectKind: Kind
) {
  const baseSchema = v.strictObject({
    kind: v.literal("replay_projection"),
    projection: refDigestSchema,
    subject: subjectCoordinateSchema(subjectKind),
    basis: refDigestSchema,
    fromOrdinal: safeNonNegativeIntegerSchema,
    limit: safePositiveIntegerSchema,
    returnedThroughOrdinal: v.nullable(safeNonNegativeIntegerSchema),
    nextOrdinal: v.nullable(safeNonNegativeIntegerSchema),
    rows: v.pipe(v.array(replayEventRowSchema), v.readonly())
  });
  const relationAction = Object.freeze(
    v.check(
      (projection: v.InferOutput<typeof baseSchema>) =>
        hasConservedReplayRelation(projection),
      "replay rows must be canonical, subject-bound, and ordinal-consistent"
    )
  );
  return freezeNativeValue({
    action: relationAction,
    schema: v.pipe(baseSchema, relationAction, v.readonly())
  });
}

const WORKSPACE_REPLAY_PROJECTION_CONTRACT =
  replayProjectionContract("WorkspaceBinding");
const RUN_REPLAY_PROJECTION_CONTRACT = replayProjectionContract("Run");
const GRAPH_CALL_REPLAY_PROJECTION_CONTRACT =
  replayProjectionContract("GraphCall");
const INTERACTION_REPLAY_PROJECTION_CONTRACT =
  replayProjectionContract("FhInteraction");
const CONTINUATION_REPLAY_PROJECTION_CONTRACT =
  replayProjectionContract("Continuation");
const C_CALL_REPLAY_PROJECTION_CONTRACT =
  replayProjectionContract("CProgramAtomReceipt");

export const RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/runtime-projection@5",
  checks: [
    {
      checkId: "result-subject-conservation",
      action: RUN_RESULT_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-027"
    },
    {
      checkId: "graph-call-result-subject-conservation",
      action: GRAPH_CALL_RESULT_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-027"
    },
    {
      checkId: "run-evidence-subject-conservation",
      action:
        RUN_EVIDENCE_PROJECTION_NATIVE_CONTRACT.subjectConservationAction,
      relationRef: "REQ-P-POLICY-055"
    },
    {
      checkId: "graph-call-evidence-subject-conservation",
      action:
        GRAPH_CALL_EVIDENCE_PROJECTION_NATIVE_CONTRACT.subjectConservationAction,
      relationRef: "REQ-P-POLICY-055"
    },
    {
      checkId: "result-evidence-subject-conservation",
      action:
        RUNTIME_RESULT_EVIDENCE_PROJECTION_NATIVE_CONTRACT.subjectConservationAction,
      relationRef: "REQ-P-POLICY-055"
    },
    {
      checkId: "workspace-replay-page-conservation",
      action: WORKSPACE_REPLAY_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-028"
    },
    {
      checkId: "run-replay-page-conservation",
      action: RUN_REPLAY_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-028"
    },
    {
      checkId: "graph-call-replay-page-conservation",
      action: GRAPH_CALL_REPLAY_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-028"
    },
    {
      checkId: "interaction-replay-page-conservation",
      action: INTERACTION_REPLAY_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-028"
    },
    {
      checkId: "continuation-replay-page-conservation",
      action: CONTINUATION_REPLAY_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-028"
    },
    {
      checkId: "c-call-replay-page-conservation",
      action: C_CALL_REPLAY_PROJECTION_CONTRACT.action,
      relationRef: "REQ-P-POLICY-028"
    }
  ]
} satisfies NativeNamedCheckRegistry);

function runtimeProjectionResultSourceParameters<
  const CaseKey extends string,
  const Family extends string,
  const SemanticOwnerRef extends string
>(caseKey: CaseKey, family: Family, semanticOwnerRef: SemanticOwnerRef) {
  return {
    owner: {
      product: "abiogenesis",
      module: "abg.m03",
      family
    },
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    },
    slot: "result",
    semanticOwnerBasis: {
      ref: semanticOwnerRef,
      digest: POLICY_DIGEST
    },
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    memberPath: ["project_read", caseKey, "result"],
    namedChecks: RUNTIME_PROJECTION_NAMED_CHECKS
  } as const;
}

export const RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    run_status: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "run_status",
          "runtime_status_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-026"
        ),
        schema: runtimeStatusProjectionSchema("Run")
      })
    },
    graph_call_status: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "graph_call_status",
          "runtime_status_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-026"
        ),
        schema: runtimeStatusProjectionSchema("GraphCall")
      })
    },
    run_result: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "run_result",
          "runtime_result_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-027"
        ),
        schema: RUN_RESULT_PROJECTION_CONTRACT.schema
      })
    },
    graph_call_result: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "graph_call_result",
          "runtime_result_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-027"
        ),
        schema: GRAPH_CALL_RESULT_PROJECTION_CONTRACT.schema
      })
    },
    run_evidence: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "run_evidence",
          "runtime_evidence_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055"
        ),
        schema: RUN_EVIDENCE_PROJECTION_NATIVE_CONTRACT.schema
      })
    },
    graph_call_evidence: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "graph_call_evidence",
          "runtime_evidence_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055"
        ),
        schema: GRAPH_CALL_EVIDENCE_PROJECTION_NATIVE_CONTRACT.schema
      })
    },
    result_evidence: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "result_evidence",
          "runtime_evidence_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055"
        ),
        schema: RUNTIME_RESULT_EVIDENCE_PROJECTION_NATIVE_CONTRACT.schema
      })
    },
    workspace_replay: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "workspace_replay",
          "runtime_replay_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-028"
        ),
        schema: WORKSPACE_REPLAY_PROJECTION_CONTRACT.schema
      })
    },
    run_replay: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "run_replay",
          "runtime_replay_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-028"
        ),
        schema: RUN_REPLAY_PROJECTION_CONTRACT.schema
      })
    },
    graph_call_replay: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "graph_call_replay",
          "runtime_replay_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-028"
        ),
        schema: GRAPH_CALL_REPLAY_PROJECTION_CONTRACT.schema
      })
    },
    interaction_replay: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "interaction_replay",
          "runtime_replay_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-028"
        ),
        schema: INTERACTION_REPLAY_PROJECTION_CONTRACT.schema
      })
    },
    continuation_replay: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "continuation_replay",
          "runtime_replay_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-028"
        ),
        schema: CONTINUATION_REPLAY_PROJECTION_CONTRACT.schema
      })
    },
    c_call_replay: {
      result: ownerNativeDefinitionContractSource({
        ...runtimeProjectionResultSourceParameters(
          "c_call_replay",
          "runtime_replay_projection",
          "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-028"
        ),
        schema: C_CALL_REPLAY_PROJECTION_CONTRACT.schema
      })
    }
  }
});

export type RuntimeProjectionProjectReadCase =
  keyof typeof RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read;
export type RuntimeProjectionProjectReadResult<
  CaseKey extends RuntimeProjectionProjectReadCase
> = v.InferOutput<
  (typeof RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read)[CaseKey]["result"]["schema"]
>;
