// Private P1 owner contracts for AF-25. The exact-candidate values are the
// authorization input; release cuts and snapshots remain output-only.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  semanticVersionSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../shared/validation/immutable_native_value.js";
import { ownerNativeOperationContractSource } from "../../shared/validation/owner_native_operation_contract_source.js";

type ReleaseVariant = "published_rc" | "tapped_release";
type ReleaseSlot = "request" | "result" | "refusal";

const MODULE_PATH =
  "code/src/qualification/m05/exact_candidate_release_operation_contracts.js";
const EXPORT_NAME = "RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES";
const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";

function releaseSource<
  const Variant extends ReleaseVariant,
  const Slot extends ReleaseSlot,
  const S extends v.GenericSchema
>(input: {
  readonly variant: Variant;
  readonly slot: Slot;
  readonly schema: S;
}) {
  const suffix = `release.snapshot.${input.variant}.${input.slot}`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "qualification.m05",
        family: "exact_candidate_release"
      },
      subject: {
        operationId: "abg.operation.release.snapshot",
        variant: input.variant,
        slot: input.slot
      },
      carrierRevision: "5.0.0",
      lawBasis: {
        ref: "design://abg/m04/public-operation-definition-family",
        digest: DESIGN_DIGEST
      }
    },
    identity: {
      contractId: `abg.contract.operation.${suffix}`,
      contractVersion: "5.0.0",
      schemaId: `abg.schema.operation.${suffix}`,
      schemaVersion: "5.0.0"
    },
    sourceLocator: {
      kind: "private_source_module",
      sourceRoot: "semantic_build",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      memberPath: ["release_snapshot", input.variant, input.slot, "schema"]
    },
    schema: input.schema
  });
}

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
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

const releaseArtifactSchema = v.pipe(
  v.strictObject({
    ref: refSchema,
    digest: sha256DigestSchema,
    kind: v.picklist([
      "package_tarball",
      "release_note",
      "checksum_file"
    ])
  }),
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

const finalTapCandidateBasisSchema = v.pipe(
  v.strictObject({
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
  }),
  v.readonly()
);

export const EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA = freezeNativeValue(
  v.union([
    preRcCandidateBasisSchema,
    installedRcCandidateBasisSchema,
    finalTapCandidateBasisSchema
  ])
);

const assessmentCitationSchema = v.pipe(
  v.strictObject({
    ref: refSchema,
    digest: sha256DigestSchema,
    disposition: v.picklist(["green", "red", "blocked"])
  }),
  v.readonly()
);

export const EXACT_CANDIDATE_QUALIFICATION_VERDICT_SCHEMA = freezeNativeValue(
  v.pipe(
    v.strictObject({
      kind: v.literal("exact_candidate_qualification_verdict"),
      verdictRef: refSchema,
      verdictDigest: sha256DigestSchema,
      basisRef: refSchema,
      basisDigest: sha256DigestSchema,
      qualificationLawBasisRef: refSchema,
      qualificationLawBasisDigest: sha256DigestSchema,
      assessments: v.pipe(
        uniqueByNativeIdentityArray(assessmentCitationSchema),
        v.minLength(1),
        v.readonly()
      ),
      disposition: v.picklist(["green", "red", "blocked"]),
      bypassRefs: refListSchema
    }),
    v.readonly()
  )
);

const releaseResultFields = {
  releaseCutRef: refSchema,
  releaseCutDigest: sha256DigestSchema,
  artifacts: v.pipe(
    uniqueByNativeIdentityArray(releaseArtifactSchema),
    v.minLength(1),
    v.readonly()
  ),
  snapshotManifestRef: refSchema,
  snapshotManifestDigest: sha256DigestSchema,
  provenanceRefs: refListSchema
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

const releaseResultSchema = v.pipe(
  v.strictObject({
    ...releaseResultFields
  }),
  v.readonly()
);

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
