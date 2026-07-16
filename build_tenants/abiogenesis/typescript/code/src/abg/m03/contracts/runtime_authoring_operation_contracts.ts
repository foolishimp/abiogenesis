// Private P1 owner contracts for AF-20 and AF-21. These schemas describe
// admitted authoring acts; the existing event factories remain event authority.

import * as v from "valibot";

import {
  canonicalIJsonSchema,
  nonEmptyTextSchema,
  refSchema,
  safePositiveIntegerSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  GRAPH_CHANGE_CLASS_VALUES,
  GRAPH_REENTRY_POINT_VALUES,
  RUN_RESUME_REASON_KIND_VALUES,
  RUN_STOP_REASON_KIND_VALUES,
  TUNER_PROPOSAL_KIND_VALUES
} from "./carriers.js";
import { m03OwnerContractSet } from "./m03_owner_contract_set.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js" as const;
const EXPORT_NAME = "RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES";

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const witnessContextSchema = v.pipe(
  v.strictObject({
    basisRef: refSchema,
    basisDigest: sha256DigestSchema,
    workspaceRef: v.nullable(refSchema),
    runRef: v.nullable(refSchema),
    segmentRef: v.nullable(refSchema)
  }),
  v.readonly()
);

const digestObservationSchema = v.pipe(
  v.strictObject({
    artifactRef: refSchema,
    observedDigest: v.nullable(sha256DigestSchema),
    copyOutRef: v.nullable(refSchema)
  }),
  v.readonly()
);

const WITNESS_PAYLOAD_SCHEMAS = freezeNativeValue({
  reprice: v.pipe(
    v.strictObject({
      declarationRef: refSchema,
      beforeDigest: sha256DigestSchema,
      afterDigest: sha256DigestSchema,
      changeClass: v.picklist(GRAPH_CHANGE_CLASS_VALUES),
      owningTicketRef: refSchema,
      reason: nonEmptyTextSchema
    }),
    v.readonly()
  ),
  attest: v.pipe(
    v.strictObject({ scope: v.literal("replay_chain") }),
    v.readonly()
  ),
  "hygiene-stamp": v.pipe(
    v.strictObject({
      observations: v.pipe(
        v.array(digestObservationSchema),
        v.minLength(1),
        v.readonly()
      )
    }),
    v.readonly()
  ),
  intake: v.pipe(
    v.strictObject({
      haltDiagnosisRef: refSchema,
      owner: nonEmptyTextSchema,
      changeClass: v.picklist(GRAPH_CHANGE_CLASS_VALUES),
      reEntryPoint: v.picklist(GRAPH_REENTRY_POINT_VALUES),
      summary: nonEmptyTextSchema
    }),
    v.readonly()
  ),
  "run-resumed": v.pipe(
    v.strictObject({
      reasonKind: v.picklist(RUN_RESUME_REASON_KIND_VALUES),
      reasonDetail: nonEmptyTextSchema
    }),
    v.readonly()
  ),
  "run-stopped": v.pipe(
    v.strictObject({
      reasonKind: v.picklist(RUN_STOP_REASON_KIND_VALUES),
      reasonDetail: nonEmptyTextSchema
    }),
    v.readonly()
  )
} as const);

type WitnessVariant = keyof typeof WITNESS_PAYLOAD_SCHEMAS;

function witnessRequestSchema<const Variant extends WitnessVariant>(
  variant: Variant
) {
  return v.pipe(
    v.strictObject({
      actorRef: refSchema,
      subjectRef: refSchema,
      subjectDigest: sha256DigestSchema,
      context: witnessContextSchema,
      payload: WITNESS_PAYLOAD_SCHEMAS[variant],
      evidenceRefs: refListSchema,
      provenanceRefs: refListSchema
    }),
    v.readonly()
  );
}

const witnessResultSchema = v.pipe(
  v.strictObject({
    disposition: v.literal("admitted"),
    witnessedActEventRef: refSchema,
    admittedEvidenceRef: refSchema
  }),
  v.readonly()
);

const WITNESS_REFUSAL_CODES = Object.freeze([
  "subject_missing",
  "act_forbidden",
  "evidence_invalid",
  "basis_mismatch"
] as const);

const witnessRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(WITNESS_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

function witnessContractSet<const Variant extends WitnessVariant>(
  variant: Variant
) {
  return m03OwnerContractSet({
    operationId: "abg.operation.witness.admit",
    variant,
    family: "witnessed_act_admission",
    familyKey: "witness_admit",
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    request: witnessRequestSchema(variant),
    result: witnessResultSchema,
    refusal: witnessRefusalSchema
  });
}

const tuningAuthoritySchema = v.union([
  v.pipe(
    v.strictObject({ kind: v.literal("actor"), actorRef: refSchema }),
    v.readonly()
  ),
  v.pipe(
    v.strictObject({ kind: v.literal("policy"), policyRef: refSchema }),
    v.readonly()
  )
]);

const tuningBasisSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);

const tuningProposeRequestSchema = v.pipe(
  v.strictObject({
    draftContentContractRef: refSchema,
    draftContentContractDigest: sha256DigestSchema,
    draftContent: canonicalIJsonSchema,
    proposalKind: v.picklist(TUNER_PROPOSAL_KIND_VALUES),
    authority: tuningAuthoritySchema,
    subjectBasis: tuningBasisSchema,
    rationale: nonEmptyTextSchema,
    evidenceRefs: refListSchema
  }),
  v.readonly()
);

const tuningProposeResultSchema = v.pipe(
  v.strictObject({
    draftRef: refSchema,
    draftVersion: safePositiveIntegerSchema,
    draftDigest: sha256DigestSchema,
    disposition: v.literal("proposed"),
    eventRef: refSchema
  }),
  v.readonly()
);

const tuningProposeRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(["draft_invalid", "subject_mismatch", "basis_mismatch"]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

const tuningDecisionRequestSchema = v.pipe(
  v.strictObject({
    draftRef: refSchema,
    draftVersion: safePositiveIntegerSchema,
    draftDigest: sha256DigestSchema,
    authority: tuningAuthoritySchema,
    subjectBasis: tuningBasisSchema,
    rationale: nonEmptyTextSchema,
    evidenceRefs: refListSchema
  }),
  v.readonly()
);

function tuningDecisionResultSchema<const Variant extends "ratify" | "reject">(
  variant: Variant
) {
  return v.pipe(
    v.strictObject({
      draftRef: refSchema,
      draftVersion: safePositiveIntegerSchema,
      draftDigest: sha256DigestSchema,
      disposition: v.literal(variant === "ratify" ? "ratified" : "rejected"),
      eventRef: refSchema
    }),
    v.readonly()
  );
}

const TUNING_DECISION_REFUSAL_CODES = Object.freeze([
  "draft_missing",
  "draft_stale",
  "transition_forbidden",
  "basis_mismatch"
] as const);

const tuningDecisionRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(TUNING_DECISION_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

function tuningDecisionContractSet<const Variant extends "ratify" | "reject">(
  variant: Variant
) {
  return m03OwnerContractSet({
    operationId: "abg.operation.tuning.transition",
    variant,
    family: "tuning_draft_transition",
    familyKey: "tuning_transition",
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    request: tuningDecisionRequestSchema,
    result: tuningDecisionResultSchema(variant),
    refusal: tuningDecisionRefusalSchema
  });
}

export const RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES =
  freezeNativeValue({
    witness_admit: {
      reprice: witnessContractSet("reprice"),
      attest: witnessContractSet("attest"),
      "hygiene-stamp": witnessContractSet("hygiene-stamp"),
      intake: witnessContractSet("intake"),
      "run-resumed": witnessContractSet("run-resumed"),
      "run-stopped": witnessContractSet("run-stopped")
    },
    tuning_transition: {
      propose: m03OwnerContractSet({
        operationId: "abg.operation.tuning.transition",
        variant: "propose",
        family: "tuning_draft_transition",
        familyKey: "tuning_transition",
        modulePath: MODULE_PATH,
        exportName: EXPORT_NAME,
        request: tuningProposeRequestSchema,
        result: tuningProposeResultSchema,
        refusal: tuningProposeRefusalSchema
      }),
      ratify: tuningDecisionContractSet("ratify"),
      reject: tuningDecisionContractSet("reject")
    }
  });
