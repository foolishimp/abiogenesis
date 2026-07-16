// Private P1 owner contracts for AF-25. The exact-candidate values are the
// authorization input; release cuts and snapshots remain output-only.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  SAFE_INTEGER_ACTION,
  semanticVersionSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../shared/validation/native_named_check_registry.js";
import { ownerNativeOperationContractSource } from "../../shared/validation/owner_native_operation_contract_source.js";

type ReleaseVariant = "published_rc" | "tapped_release";
type ReleaseSlot = "request" | "result" | "refusal";

const MODULE_PATH =
  "code/src/qualification/m05/exact_candidate_release_operation_contracts.js";
const EXPORT_NAME = "RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES";
const CONTRACT_SHAPE_BASIS = freezeNativeValue({
  ref: "design://abg/m04/public-operation-definition-family",
  digest:
    "sha256:9ab76163499e0831a3ff87f3dc1b5adba02c19d690b6a953651888f6fe9915b7",
  status: "candidate_integration_pin_pending_final_rebind"
} as const);
const RELEASE_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-059",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const RELEASE_SEMANTIC_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "qualification.m05",
  family: "exact_candidate_release"
} as const);

function releaseSource<
  const Variant extends ReleaseVariant,
  const Slot extends ReleaseSlot,
  const S extends v.GenericSchema
>(input: {
  readonly variant: Variant;
  readonly slot: Slot;
  readonly schema: S;
}) {
  return ownerNativeOperationContractSource({
    owner: RELEASE_SEMANTIC_OWNER,
    operationId: "abg.operation.release.snapshot",
    variant: input.variant,
    slot: input.slot,
    semanticOwnerBasis: RELEASE_SEMANTIC_OWNER_BASIS,
    contractShapeBasis: CONTRACT_SHAPE_BASIS,
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    memberPath: ["release_snapshot", input.variant, input.slot] as const,
    schema: input.schema
  });
}

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1),
  v.readonly()
);

const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);

const refDigestListSchema = v.pipe(
  uniqueByNativeIdentityArray(refDigestSchema),
  v.readonly()
);

const nonEmptyRefDigestListSchema = v.pipe(
  uniqueByNativeIdentityArray(refDigestSchema),
  v.minLength(1),
  v.readonly()
);

export const QUALIFICATION_LAW_BASIS_SCHEMA = freezeNativeValue(
  v.pipe(
    v.strictObject({
      kind: v.literal("qualification_law_basis"),
      ref: refSchema,
      digest: sha256DigestSchema,
      methodVersion: semanticVersionSchema,
      ruleCatalogVersion: semanticVersionSchema,
      sources: nonEmptyRefDigestListSchema
    }),
    v.readonly()
  )
);

const releaseArtifactFields = {
  ref: refSchema,
  digest: sha256DigestSchema
} as const;

const releaseArtifactSchema = v.pipe(
  v.strictObject({
    ...releaseArtifactFields,
    kind: v.picklist([
      "package_tarball",
      "release_note",
      "checksum_file"
    ])
  }),
  v.readonly()
);

function releaseArtifactKindSchema<
  const Kind extends "package_tarball" | "release_note" | "checksum_file"
>(kind: Kind) {
  return v.pipe(
    v.strictObject({
      ...releaseArtifactFields,
      kind: v.literal(kind)
    }),
    v.readonly()
  );
}

const releaseSnapshotArtifactSetCarrierSchema = v.strictObject({
  packageTarball: releaseArtifactKindSchema("package_tarball"),
  checksumFile: releaseArtifactKindSchema("checksum_file"),
  releaseNote: v.nullable(releaseArtifactKindSchema("release_note"))
});

const RELEASE_SNAPSHOT_ARTIFACT_SET_RELATION_ACTION = Object.freeze(
  v.check(
    (
      artifacts: v.InferOutput<
        typeof releaseSnapshotArtifactSetCarrierSchema
      >
    ) => {
      const refs = [
        artifacts.packageTarball.ref,
        artifacts.checksumFile.ref,
        ...(artifacts.releaseNote === null
          ? []
          : [artifacts.releaseNote.ref])
      ];
      return new Set(refs).size === refs.length;
    },
    "snapshot artifact identities must be distinct"
  )
);

const releaseSnapshotArtifactSetSchema = v.pipe(
  releaseSnapshotArtifactSetCarrierSchema,
  RELEASE_SNAPSHOT_ARTIFACT_SET_RELATION_ACTION,
  v.readonly()
);

export const FINAL_TAP_DELTA_SCHEMA = freezeNativeValue(
  v.pipe(
    v.strictObject({
      kind: v.literal("final_tap_delta"),
      ref: refSchema,
      digest: sha256DigestSchema,
      acceptedRcRef: refSchema,
      acceptedRcDigest: sha256DigestSchema,
      assignedFinalVersion: semanticVersionSchema,
      releaseAssets: v.pipe(
        uniqueByNativeIdentityArray(releaseArtifactSchema),
        v.minLength(1),
        v.readonly()
      )
    }),
    v.readonly()
  )
);

const qualificationGateDispositionSchema = v.picklist([
  "green",
  "red",
  "blocked"
]);

const zeroBasedOrdinalSchema = v.pipe(
  v.number(),
  v.integer("expected an integer"),
  SAFE_INTEGER_ACTION,
  v.minValue(0, "expected a zero-based ordinal")
);

const qualificationGateResultCitationSchema = v.pipe(
  v.strictObject({
    ordinal: zeroBasedOrdinalSchema,
    gateRef: refSchema,
    qualificationBasisRef: refSchema,
    qualificationBasisDigest: sha256DigestSchema,
    qualificationLawBasisRef: refSchema,
    qualificationLawBasisDigest: sha256DigestSchema,
    assessmentRef: refSchema,
    assessmentDigest: sha256DigestSchema,
    disposition: qualificationGateDispositionSchema,
    evidence: refDigestListSchema,
    bypassRefs: refListSchema
  }),
  v.readonly()
);

const qualificationGateResultVectorCarrierSchema = v.strictObject({
  kind: v.literal("qualification_gate_result_vector"),
  vectorRef: refSchema,
  vectorDigest: sha256DigestSchema,
  qualificationBasisRef: refSchema,
  qualificationBasisDigest: sha256DigestSchema,
  qualificationLawBasisRef: refSchema,
  qualificationLawBasisDigest: sha256DigestSchema,
  frozenInventoryDigest: sha256DigestSchema,
  mandatoryGateRefs: v.pipe(
    uniqueByNativeIdentityArray(refSchema),
    v.minLength(1),
    v.readonly()
  ),
  results: v.pipe(
    v.array(qualificationGateResultCitationSchema),
    v.minLength(1),
    v.readonly()
  )
});

const QUALIFICATION_GATE_RESULT_VECTOR_RELATION_ACTION = Object.freeze(
  v.check(
    (
      vector: v.InferOutput<
        typeof qualificationGateResultVectorCarrierSchema
      >
    ) =>
      vector.results.length === vector.mandatoryGateRefs.length &&
      vector.results.every(
        (result, index) =>
          result.ordinal === index &&
          result.gateRef === vector.mandatoryGateRefs[index] &&
          result.qualificationBasisRef === vector.qualificationBasisRef &&
          result.qualificationBasisDigest ===
            vector.qualificationBasisDigest &&
          result.qualificationLawBasisRef ===
            vector.qualificationLawBasisRef &&
          result.qualificationLawBasisDigest ===
            vector.qualificationLawBasisDigest &&
          (result.bypassRefs.length > 0
            ? result.disposition !== "green" && result.evidence.length === 0
            : result.evidence.length > 0)
      ),
    "gate results must be complete, ordered, on-basis, and evidence coherent"
  )
);

export const QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA = freezeNativeValue(
  v.pipe(
    qualificationGateResultVectorCarrierSchema,
    QUALIFICATION_GATE_RESULT_VECTOR_RELATION_ACTION,
    v.readonly()
  )
);

function exactCandidateCommonFields() {
  return {
    kind: v.literal("exact_candidate_qualification_basis"),
    basisRef: refSchema,
    basisDigest: sha256DigestSchema,
    sourceRef: refSchema,
    sourceCommit: refSchema,
    artifactRef: refSchema,
    artifactContentDigest: sha256DigestSchema,
    installArtifactDigest: sha256DigestSchema,
    productToolchainManifest: refDigestSchema,
    installedProduct: refDigestSchema,
    installManifest: refDigestSchema,
    workspaceBinding: refDigestSchema,
    tenantConformanceManifest: refDigestSchema,
    frozenInventoryDigest: sha256DigestSchema,
    qualificationLawBasis: QUALIFICATION_LAW_BASIS_SCHEMA
  } as const;
}

const preRcCandidateBasisSchema = v.pipe(
  v.strictObject({
    ...exactCandidateCommonFields(),
    subjectKind: v.literal("pre_rc_candidate"),
    prospectivePublishedRcIdentity: refSchema,
    prospectivePublishedRcVersion: semanticVersionSchema
  }),
  v.readonly()
);

const installedRcCandidateBasisSchema = v.pipe(
  v.strictObject({
    ...exactCandidateCommonFields(),
    subjectKind: v.literal("installed_rc"),
    acceptedRcRef: refSchema,
    acceptedRcDigest: sha256DigestSchema
  }),
  v.readonly()
);

const finalTapCandidateBasisCarrierSchema = v.strictObject({
    ...exactCandidateCommonFields(),
    subjectKind: v.literal("final_tap_candidate"),
    prospectiveFinalIdentity: refSchema,
    prospectiveFinalVersion: semanticVersionSchema,
    acceptedRcRef: refSchema,
    acceptedRcDigest: sha256DigestSchema,
    installedRcQualificationBasisRef: refSchema,
    installedRcQualificationBasisDigest: sha256DigestSchema,
    installedRcGreenVerdictRef: refSchema,
    installedRcGreenVerdictDigest: sha256DigestSchema,
    finalTapDelta: FINAL_TAP_DELTA_SCHEMA
  });

const FINAL_TAP_DELTA_MATCHES_BASIS_ACTION = Object.freeze(
  v.check(
    (
      basis: v.InferOutput<typeof finalTapCandidateBasisCarrierSchema>
    ) =>
      basis.acceptedRcRef === basis.finalTapDelta.acceptedRcRef &&
      basis.acceptedRcDigest === basis.finalTapDelta.acceptedRcDigest &&
      basis.prospectiveFinalVersion ===
        basis.finalTapDelta.assignedFinalVersion,
    "final basis must match its accepted RC and assigned final version"
  )
);

const finalTapCandidateBasisSchema = v.pipe(
  finalTapCandidateBasisCarrierSchema,
  FINAL_TAP_DELTA_MATCHES_BASIS_ACTION,
  v.readonly()
);

export const EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA = freezeNativeValue(
  v.union([
    preRcCandidateBasisSchema,
    installedRcCandidateBasisSchema,
    finalTapCandidateBasisSchema
  ])
);

const exactCandidateQualificationVerdictCarrierSchema = v.strictObject({
  kind: v.literal("exact_candidate_qualification_verdict"),
  verdictRef: refSchema,
  verdictDigest: sha256DigestSchema,
  basisRef: refSchema,
  basisDigest: sha256DigestSchema,
  qualificationLawBasisRef: refSchema,
  qualificationLawBasisDigest: sha256DigestSchema,
  qualificationGateResultVector: QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
  disposition: qualificationGateDispositionSchema,
  bypassRefs: refListSchema
});

const QUALIFICATION_VERDICT_DISPOSITION_RELATION_ACTION = Object.freeze(
  v.check(
    (
      verdict: v.InferOutput<
        typeof exactCandidateQualificationVerdictCarrierSchema
      >
    ) => {
      const vector = verdict.qualificationGateResultVector;
      const expectedBypassRefs = [
        ...new Set(vector.results.flatMap((result) => result.bypassRefs))
      ];
      const expectedDisposition = vector.results.some(
        (result) => result.disposition === "red"
      )
        ? "red"
        : expectedBypassRefs.length > 0 ||
            vector.results.some(
              (result) => result.disposition === "blocked"
            )
          ? "blocked"
          : "green";
      return (
        verdict.basisRef === vector.qualificationBasisRef &&
        verdict.basisDigest === vector.qualificationBasisDigest &&
        verdict.qualificationLawBasisRef ===
          vector.qualificationLawBasisRef &&
        verdict.qualificationLawBasisDigest ===
          vector.qualificationLawBasisDigest &&
        verdict.disposition === expectedDisposition &&
        verdict.bypassRefs.length === expectedBypassRefs.length &&
        verdict.bypassRefs.every(
          (bypassRef, index) => bypassRef === expectedBypassRefs[index]
        )
      );
    },
    "verdict disposition must match all mandatory outcomes and bypass truth"
  )
);

export const EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA = freezeNativeValue(
  v.pipe(
    exactCandidateQualificationVerdictCarrierSchema,
    QUALIFICATION_VERDICT_DISPOSITION_RELATION_ACTION,
    v.readonly()
  )
);

export const EXACT_CANDIDATE_QUALIFICATION_CONTRACT_FAMILY =
  freezeNativeValue({
    qualificationLawBasis: QUALIFICATION_LAW_BASIS_SCHEMA,
    qualificationBasis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
    qualificationGateResultVector: QUALIFICATION_GATE_RESULT_VECTOR_SCHEMA,
    qualificationVerdict: EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA,
    finalTapDelta: FINAL_TAP_DELTA_SCHEMA
  });

const releaseResultFields = {
  releaseCutRef: refSchema,
  releaseCutDigest: sha256DigestSchema,
  packageIdentity: refSchema,
  packageVersion: semanticVersionSchema,
  sourceRef: refSchema,
  sourceCommit: refSchema,
  buildCommand: nonEmptyTextSchema,
  packCommand: nonEmptyTextSchema,
  artifacts: releaseSnapshotArtifactSetSchema,
  snapshotManifestRef: refSchema,
  snapshotManifestDigest: sha256DigestSchema,
  verificationFacts: nonEmptyRefDigestListSchema,
  provenanceRefs: nonEmptyRefListSchema
} as const;

const publishedRcRequestSchema = v.pipe(
  v.strictObject({
    qualificationBasisRef: refSchema,
    qualificationBasisDigest: sha256DigestSchema,
    qualificationLawBasisRef: refSchema,
    qualificationLawBasisDigest: sha256DigestSchema,
    qualificationVerdictRef: refSchema,
    qualificationVerdictDigest: sha256DigestSchema,
    requestedReleaseIdentity: refSchema,
    requestedReleaseVersion: semanticVersionSchema
  }),
  v.readonly()
);

const releaseResultCarrierSchema = v.strictObject({
  ...releaseResultFields,
  qualificationDisposition: v.literal("green"),
  residualRefs: refListSchema
});

const RELEASE_RESULT_ARTIFACT_IDENTITY_RELATION_ACTION = Object.freeze(
  v.check(
    (result: v.InferOutput<typeof releaseResultCarrierSchema>) => {
      const refs = [
        result.artifacts.packageTarball.ref,
        result.artifacts.checksumFile.ref,
        ...(result.artifacts.releaseNote === null
          ? []
          : [result.artifacts.releaseNote.ref]),
        result.snapshotManifestRef
      ];
      return new Set(refs).size === refs.length;
    },
    "release artifact and snapshot manifest identities must be distinct"
  )
);

const releaseResultSchema = v.pipe(
  releaseResultCarrierSchema,
  RELEASE_RESULT_ARTIFACT_IDENTITY_RELATION_ACTION,
  v.readonly()
);

export const EXACT_CANDIDATE_QUALIFICATION_NATIVE_CHECK_REGISTRY =
  freezeNativeValue({
    familyRef: "contract-family://abg/exact-candidate-qualification@5",
    checks: [
      {
        checkId: "qualification-gate-result-vector-relation",
        action: QUALIFICATION_GATE_RESULT_VECTOR_RELATION_ACTION,
        relationRef: "REQ-P-QUAL-064A"
      },
      {
        checkId: "final-tap-delta-matches-basis",
        action: FINAL_TAP_DELTA_MATCHES_BASIS_ACTION,
        relationRef: "REQ-P-QUAL-070"
      },
      {
        checkId: "qualification-verdict-disposition-relation",
        action: QUALIFICATION_VERDICT_DISPOSITION_RELATION_ACTION,
        relationRef: "REQ-P-QUAL-064C"
      },
      {
        checkId: "release-snapshot-artifact-set-relation",
        action: RELEASE_SNAPSHOT_ARTIFACT_SET_RELATION_ACTION,
        relationRef: "REQ-P-QUAL-051"
      },
      {
        checkId: "release-result-artifact-identity-relation",
        action: RELEASE_RESULT_ARTIFACT_IDENTITY_RELATION_ACTION,
        relationRef: "REQ-P-QUAL-051"
      }
    ]
  } satisfies NativeNamedCheckRegistry);

const PUBLISHED_RC_REFUSAL_CODES = Object.freeze([
  "wrong_subject_kind",
  "basis_mismatch",
  "law_basis_mismatch",
  "verdict_not_green",
  "bypass_nonempty",
  "identity_mismatch",
  "bytes_mismatch",
  "publication_failure"
] as const);

const publishedRcRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(PUBLISHED_RC_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

const tappedReleaseRequestSchema = v.pipe(
  v.strictObject({
    qualificationBasisRef: refSchema,
    qualificationBasisDigest: sha256DigestSchema,
    qualificationLawBasisRef: refSchema,
    qualificationLawBasisDigest: sha256DigestSchema,
    qualificationVerdictRef: refSchema,
    qualificationVerdictDigest: sha256DigestSchema,
    requestedReleaseIdentity: refSchema,
    requestedReleaseVersion: semanticVersionSchema,
    acceptedRcRef: refSchema,
    acceptedRcDigest: sha256DigestSchema,
    installedRcQualificationBasisRef: refSchema,
    installedRcQualificationBasisDigest: sha256DigestSchema,
    installedRcGreenVerdictRef: refSchema,
    installedRcGreenVerdictDigest: sha256DigestSchema,
    finalTapDeltaRef: refSchema,
    finalTapDeltaDigest: sha256DigestSchema
  }),
  v.readonly()
);

const TAPPED_RELEASE_REFUSAL_CODES = Object.freeze([
  ...PUBLISHED_RC_REFUSAL_CODES,
  "accepted_rc_mismatch",
  "installed_rc_authorization_missing",
  "final_delta_incomplete",
  "affected_gate_failed"
] as const);

const tappedReleaseRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(TAPPED_RELEASE_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

export const RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  release_snapshot: {
    published_rc: {
      request: releaseSource({
        variant: "published_rc",
        slot: "request",
        schema: publishedRcRequestSchema
      }),
      result: releaseSource({
        variant: "published_rc",
        slot: "result",
        schema: releaseResultSchema
      }),
      refusal: releaseSource({
        variant: "published_rc",
        slot: "refusal",
        schema: publishedRcRefusalSchema
      })
    },
    tapped_release: {
      request: releaseSource({
        variant: "tapped_release",
        slot: "request",
        schema: tappedReleaseRequestSchema
      }),
      result: releaseSource({
        variant: "tapped_release",
        slot: "result",
        schema: releaseResultSchema
      }),
      refusal: releaseSource({
        variant: "tapped_release",
        slot: "refusal",
        schema: tappedReleaseRefusalSchema
      })
    }
  }
});
