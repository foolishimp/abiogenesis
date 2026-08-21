import * as v from "valibot";

import { capabilityRefsForContract } from "../shared/capability_contracts.js";

import {
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  digestSchema,
  type ExactOwnerOperationPort,
  jsonValueSchema,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refSetSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
} from "../shared/public_function_contracts.js";

export type ReleaseSnapshotMember = "published_rc" | "tapped_release";

export interface ReleaseIdentity {
  readonly identityRef: string;
  readonly identityDigest: Sha256Digest;
  readonly productId: string;
  readonly version: string;
}

export interface ReleaseQualificationBasis {
  readonly kind: "release_qualification_basis";
  readonly subjectKind: "pre_rc_candidate" | "final_tap_candidate";
  readonly basisRef: string;
  readonly basisDigest: Sha256Digest;
  readonly prospectiveIdentity: ReleaseIdentity;
  readonly basis: JsonValue;
}

export interface ReleaseLawBasis {
  readonly kind: "release_law_basis";
  readonly lawBasisRef: string;
  readonly lawBasisDigest: Sha256Digest;
  readonly law: JsonValue;
}

export interface ReleaseQualificationVerdict {
  readonly kind: "release_qualification_verdict";
  readonly verdictRef: string;
  readonly verdictDigest: Sha256Digest;
  readonly qualificationBasisRef: string;
  readonly qualificationBasisDigest: Sha256Digest;
  readonly lawBasisRef: string;
  readonly lawBasisDigest: Sha256Digest;
  readonly disposition: "green" | "not_green";
  readonly bypassRefs: readonly string[];
}

export interface ReleaseEvidenceCoordinate {
  readonly ref: string;
  readonly digest: Sha256Digest;
  readonly value: JsonValue;
}

export interface PublishedRcSnapshotRequest {
  readonly qualificationBasis: ReleaseQualificationBasis;
  readonly lawBasis: ReleaseLawBasis;
  readonly verdict: ReleaseQualificationVerdict;
  readonly requestedIdentity: ReleaseIdentity;
}

export interface TappedReleaseSnapshotRequest {
  readonly finalTapBasis: ReleaseQualificationBasis;
  readonly lawBasis: ReleaseLawBasis;
  readonly verdict: ReleaseQualificationVerdict;
  readonly requestedIdentity: ReleaseIdentity;
  readonly acceptedRc: ReleaseEvidenceCoordinate;
  readonly installedRcQualification: ReleaseEvidenceCoordinate;
  readonly finalTapDelta: ReleaseEvidenceCoordinate;
}

export interface ReleaseSnapshotRequestByMember {
  readonly published_rc: PublishedRcSnapshotRequest;
  readonly tapped_release: TappedReleaseSnapshotRequest;
}

export type ReleaseSnapshotRequest<
  M extends ReleaseSnapshotMember = ReleaseSnapshotMember,
> = ReleaseSnapshotRequestByMember[M];

export type ReleaseSnapshotRefusalCode =
  | "wrong_subject_kind"
  | "basis_mismatch"
  | "law_basis_mismatch"
  | "verdict_not_green"
  | "bypass_nonempty"
  | "identity_mismatch"
  | "bytes_mismatch"
  | "publication_failure"
  | "accepted_rc_mismatch"
  | "installed_rc_authorization_missing"
  | "final_delta_incomplete"
  | "affected_gate_failed";

export interface ReleaseSnapshotRefusal {
  readonly kind: "release_snapshot_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly memberKey: ReleaseSnapshotMember;
  readonly code: ReleaseSnapshotRefusalCode;
  readonly message: string;
  readonly requestedIdentity: ReleaseIdentity | null;
  readonly qualificationBasisRef: string | null;
  readonly qualificationBasisDigest: Sha256Digest | null;
  readonly lawBasisRef: string | null;
  readonly lawBasisDigest: Sha256Digest | null;
  readonly verdictRef: string | null;
  readonly verdictDigest: Sha256Digest | null;
}

export type ReleaseSnapshotOperationResult = ReleaseSnapshotRefusal;

const RELEASE_AUTHORITY =
  "authority://abiogenesis/product/release-snapshot@5";

const releaseIdentitySchema = v.strictObject({
  identityRef: nonblankSchema,
  identityDigest: digestSchema,
  productId: nonblankSchema,
  version: nonblankSchema,
});

const releaseQualificationBasisSchema = v.strictObject({
  kind: v.literal("release_qualification_basis"),
  subjectKind: v.picklist(["pre_rc_candidate", "final_tap_candidate"]),
  basisRef: nonblankSchema,
  basisDigest: digestSchema,
  prospectiveIdentity: releaseIdentitySchema,
  basis: jsonValueSchema,
});

const releaseLawBasisSchema = v.strictObject({
  kind: v.literal("release_law_basis"),
  lawBasisRef: nonblankSchema,
  lawBasisDigest: digestSchema,
  law: jsonValueSchema,
});

const releaseQualificationVerdictSchema = v.strictObject({
  kind: v.literal("release_qualification_verdict"),
  verdictRef: nonblankSchema,
  verdictDigest: digestSchema,
  qualificationBasisRef: nonblankSchema,
  qualificationBasisDigest: digestSchema,
  lawBasisRef: nonblankSchema,
  lawBasisDigest: digestSchema,
  disposition: v.picklist(["green", "not_green"]),
  bypassRefs: refSetSchema,
});

const releaseEvidenceCoordinateSchema = v.strictObject({
  ref: nonblankSchema,
  digest: digestSchema,
  value: jsonValueSchema,
});

const publishedRcRequestSchema = v.strictObject({
  qualificationBasis: releaseQualificationBasisSchema,
  lawBasis: releaseLawBasisSchema,
  verdict: releaseQualificationVerdictSchema,
  requestedIdentity: releaseIdentitySchema,
});

const tappedReleaseRequestSchema = v.strictObject({
  finalTapBasis: releaseQualificationBasisSchema,
  lawBasis: releaseLawBasisSchema,
  verdict: releaseQualificationVerdictSchema,
  requestedIdentity: releaseIdentitySchema,
  acceptedRc: releaseEvidenceCoordinateSchema,
  installedRcQualification: releaseEvidenceCoordinateSchema,
  finalTapDelta: releaseEvidenceCoordinateSchema,
});

const releaseSnapshotRefusalSchema = v.strictObject({
  kind: v.literal("release_snapshot_refusal"),
  schemaVersion: v.literal("5.0.0"),
  disposition: v.literal("refused"),
  memberKey: v.picklist(["published_rc", "tapped_release"]),
  code: v.picklist([
    "wrong_subject_kind",
    "basis_mismatch",
    "law_basis_mismatch",
    "verdict_not_green",
    "bypass_nonempty",
    "identity_mismatch",
    "bytes_mismatch",
    "publication_failure",
    "accepted_rc_mismatch",
    "installed_rc_authorization_missing",
    "final_delta_incomplete",
    "affected_gate_failed",
  ] as const satisfies readonly [
    ReleaseSnapshotRefusalCode,
    ...ReleaseSnapshotRefusalCode[],
  ]),
  message: nonblankSchema,
  requestedIdentity: v.nullable(releaseIdentitySchema),
  qualificationBasisRef: v.nullable(nonblankSchema),
  qualificationBasisDigest: v.nullable(digestSchema),
  lawBasisRef: v.nullable(nonblankSchema),
  lawBasisDigest: v.nullable(digestSchema),
  verdictRef: v.nullable(nonblankSchema),
  verdictDigest: v.nullable(digestSchema),
});

function releaseMetadata(snapshotKind: ReleaseSnapshotMember) {
  return ownerMetadata({
    authorityClass: "write",
    effectClass: "immutable_release_publication",
    eventAdmission: "none",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "actor",
    ],
    capabilityRefs: capabilityRefsForContract("abg.operation.release.snapshot"),
    defaults: {},
    closedDomains: { snapshotKind: [snapshotKind] },
    sdkCoordinate: "sdk.release.snapshot",
    cliCoordinate: `release snapshot ${snapshotKind}`,
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  });
}

const publishedRcContract = ownerContractPacket(
  {
    operationId: "abg.operation.release.snapshot",
    memberKey: "published_rc",
  } as const,
  publishedRcRequestSchema,
  v.never(),
  releaseSnapshotRefusalSchema,
  null,
  {
    abstractModule: "Product.ReleaseSnapshot",
    exportName: "RELEASE_OPERATION_CONTRACTS",
    memberPath: ["snapshot", "published_rc"],
    authorityRef: RELEASE_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(RELEASE_AUTHORITY),
  },
  releaseMetadata("published_rc"),
);

const tappedReleaseContract = ownerContractPacket(
  {
    operationId: "abg.operation.release.snapshot",
    memberKey: "tapped_release",
  } as const,
  tappedReleaseRequestSchema,
  v.never(),
  releaseSnapshotRefusalSchema,
  null,
  {
    abstractModule: "Product.ReleaseSnapshot",
    exportName: "RELEASE_OPERATION_CONTRACTS",
    memberPath: ["snapshot", "tapped_release"],
    authorityRef: RELEASE_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(RELEASE_AUTHORITY),
  },
  releaseMetadata("tapped_release"),
);

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: object, keys: readonly string[]): boolean {
  return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
    [...keys].sort(compareUnicodeCodeUnits).join("\0");
}

function digestJson(value: unknown): Sha256Digest | null {
  try {
    return sha256Canonical(value as JsonValue);
  } catch {
    return null;
  }
}

function validIdentity(value: unknown): value is ReleaseIdentity {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "identityDigest",
      "identityRef",
      "productId",
      "version",
    ]) ||
    typeof value.identityRef !== "string" ||
    value.identityRef.length === 0 ||
    !isSha256Digest(value.identityDigest) ||
    typeof value.productId !== "string" ||
    value.productId.length === 0 ||
    typeof value.version !== "string" ||
    value.version.length === 0
  ) return false;
  return true;
}

function validBasis(value: unknown): value is ReleaseQualificationBasis {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "basis",
      "basisDigest",
      "basisRef",
      "kind",
      "prospectiveIdentity",
      "subjectKind",
    ]) ||
    value.kind !== "release_qualification_basis" ||
    (
      value.subjectKind !== "pre_rc_candidate" &&
      value.subjectKind !== "final_tap_candidate"
    ) ||
    typeof value.basisRef !== "string" ||
    value.basisRef.length === 0 ||
    !isSha256Digest(value.basisDigest) ||
    !validIdentity(value.prospectiveIdentity)
  ) return false;
  return digestJson(value.basis) === value.basisDigest;
}

function validLawBasis(value: unknown): value is ReleaseLawBasis {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "law",
      "lawBasisDigest",
      "lawBasisRef",
    ]) &&
    value.kind === "release_law_basis" &&
    typeof value.lawBasisRef === "string" &&
    value.lawBasisRef.length > 0 &&
    isSha256Digest(value.lawBasisDigest) &&
    digestJson(value.law) === value.lawBasisDigest;
}

function validVerdict(value: unknown): value is ReleaseQualificationVerdict {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "bypassRefs",
      "disposition",
      "kind",
      "lawBasisDigest",
      "lawBasisRef",
      "qualificationBasisDigest",
      "qualificationBasisRef",
      "verdictDigest",
      "verdictRef",
    ]) ||
    value.kind !== "release_qualification_verdict" ||
    typeof value.verdictRef !== "string" ||
    value.verdictRef.length === 0 ||
    !isSha256Digest(value.verdictDigest) ||
    typeof value.qualificationBasisRef !== "string" ||
    value.qualificationBasisRef.length === 0 ||
    !isSha256Digest(value.qualificationBasisDigest) ||
    typeof value.lawBasisRef !== "string" ||
    value.lawBasisRef.length === 0 ||
    !isSha256Digest(value.lawBasisDigest) ||
    (value.disposition !== "green" && value.disposition !== "not_green") ||
    !Array.isArray(value.bypassRefs) ||
    value.bypassRefs.some((ref) => typeof ref !== "string" || ref.length === 0) ||
    new Set(value.bypassRefs).size !== value.bypassRefs.length
  ) return false;
  const body = {
    qualificationBasisRef: value.qualificationBasisRef,
    qualificationBasisDigest: value.qualificationBasisDigest,
    lawBasisRef: value.lawBasisRef,
    lawBasisDigest: value.lawBasisDigest,
    disposition: value.disposition,
    bypassRefs: [...value.bypassRefs].sort(compareUnicodeCodeUnits),
  };
  return value.verdictDigest === sha256Canonical(body);
}

function validEvidence(value: unknown): value is ReleaseEvidenceCoordinate {
  return isRecord(value) &&
    hasExactKeys(value, ["digest", "ref", "value"]) &&
    typeof value.ref === "string" &&
    value.ref.length > 0 &&
    isSha256Digest(value.digest) &&
    digestJson(value.value) === value.digest;
}

function refusal(
  memberKey: ReleaseSnapshotMember,
  code: ReleaseSnapshotRefusalCode,
  message: string,
  packet: unknown,
): ReleaseSnapshotRefusal {
  const basis = isRecord(packet)
    ? memberKey === "published_rc"
      ? packet.qualificationBasis
      : packet.finalTapBasis
    : null;
  const lawBasis = isRecord(packet) ? packet.lawBasis : null;
  const verdict = isRecord(packet) ? packet.verdict : null;
  return deepFreeze({
    kind: "release_snapshot_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    memberKey,
    code,
    message,
    requestedIdentity:
      isRecord(packet) && validIdentity(packet.requestedIdentity)
        ? packet.requestedIdentity
        : null,
    qualificationBasisRef:
      isRecord(basis) && typeof basis.basisRef === "string"
        ? basis.basisRef
        : null,
    qualificationBasisDigest:
      isRecord(basis) && isSha256Digest(basis.basisDigest)
        ? basis.basisDigest
        : null,
    lawBasisRef:
      isRecord(lawBasis) && typeof lawBasis.lawBasisRef === "string"
        ? lawBasis.lawBasisRef
        : null,
    lawBasisDigest:
      isRecord(lawBasis) && isSha256Digest(lawBasis.lawBasisDigest)
        ? lawBasis.lawBasisDigest
        : null,
    verdictRef:
      isRecord(verdict) && typeof verdict.verdictRef === "string"
        ? verdict.verdictRef
        : null,
    verdictDigest:
      isRecord(verdict) && isSha256Digest(verdict.verdictDigest)
        ? verdict.verdictDigest
        : null,
  });
}

function commonRefusal(
  memberKey: ReleaseSnapshotMember,
  packet: unknown,
  basis: unknown,
): ReleaseSnapshotRefusal | null {
  if (!validBasis(basis)) {
    return refusal(
      memberKey,
      "basis_mismatch",
      "release snapshot requires one exact qualification basis",
      packet,
    );
  }
  if (!isRecord(packet) || !validLawBasis(packet.lawBasis)) {
    return refusal(
      memberKey,
      "law_basis_mismatch",
      "release snapshot requires one exact qualification-law basis",
      packet,
    );
  }
  if (!validVerdict(packet.verdict)) {
    return refusal(
      memberKey,
      "basis_mismatch",
      "release snapshot requires one exact same-basis verdict",
      packet,
    );
  }
  if (
    packet.verdict.qualificationBasisRef !== basis.basisRef ||
    packet.verdict.qualificationBasisDigest !== basis.basisDigest
  ) {
    return refusal(
      memberKey,
      "basis_mismatch",
      "qualification verdict differs from the requested release basis",
      packet,
    );
  }
  if (
    packet.verdict.lawBasisRef !== packet.lawBasis.lawBasisRef ||
    packet.verdict.lawBasisDigest !== packet.lawBasis.lawBasisDigest
  ) {
    return refusal(
      memberKey,
      "law_basis_mismatch",
      "qualification verdict differs from the requested law basis",
      packet,
    );
  }
  if (packet.verdict.disposition !== "green") {
    return refusal(
      memberKey,
      "verdict_not_green",
      "release snapshot requires one green same-basis verdict",
      packet,
    );
  }
  if (packet.verdict.bypassRefs.length !== 0) {
    return refusal(
      memberKey,
      "bypass_nonempty",
      "release snapshot forbids qualification bypasses",
      packet,
    );
  }
  if (
    !validIdentity(packet.requestedIdentity) ||
    packet.requestedIdentity.identityRef !==
      basis.prospectiveIdentity.identityRef ||
    packet.requestedIdentity.identityDigest !==
      basis.prospectiveIdentity.identityDigest
  ) {
    return refusal(
      memberKey,
      "identity_mismatch",
      "requested release identity differs from its qualification basis",
      packet,
    );
  }
  return null;
}

export function snapshotPublishedRc(
  packet: PublishedRcSnapshotRequest,
): ReleaseSnapshotOperationResult {
  if (
    !isRecord(packet) ||
    !hasExactKeys(packet, [
      "lawBasis",
      "qualificationBasis",
      "requestedIdentity",
      "verdict",
    ])
  ) {
    return refusal(
      "published_rc",
      "basis_mismatch",
      "published RC requires one closed release snapshot packet",
      packet,
    );
  }
  if (
    isRecord(packet.qualificationBasis) &&
    packet.qualificationBasis.subjectKind !== "pre_rc_candidate"
  ) {
    return refusal(
      "published_rc",
      "wrong_subject_kind",
      "published RC requires a pre-RC candidate basis",
      packet,
    );
  }
  const common = commonRefusal(
    "published_rc",
    packet,
    packet.qualificationBasis,
  );
  if (common !== null) return common;
  return refusal(
    "published_rc",
    "basis_mismatch",
    "published RC authority is unavailable until the later qualification owner supplies an admitted same-subject basis",
    packet,
  );
}

export function snapshotTappedRelease(
  packet: TappedReleaseSnapshotRequest,
): ReleaseSnapshotOperationResult {
  if (
    !isRecord(packet) ||
    !hasExactKeys(packet, [
      "acceptedRc",
      "finalTapBasis",
      "finalTapDelta",
      "installedRcQualification",
      "lawBasis",
      "requestedIdentity",
      "verdict",
    ])
  ) {
    return refusal(
      "tapped_release",
      "basis_mismatch",
      "tapped release requires one closed release snapshot packet",
      packet,
    );
  }
  if (
    isRecord(packet.finalTapBasis) &&
    packet.finalTapBasis.subjectKind !== "final_tap_candidate"
  ) {
    return refusal(
      "tapped_release",
      "wrong_subject_kind",
      "tapped release requires a final-tap candidate basis",
      packet,
    );
  }
  const common = commonRefusal(
    "tapped_release",
    packet,
    packet.finalTapBasis,
  );
  if (common !== null) return common;
  if (!validEvidence(packet.acceptedRc)) {
    return refusal(
      "tapped_release",
      "accepted_rc_mismatch",
      "tapped release requires one exact accepted RC carrier",
      packet,
    );
  }
  if (!validEvidence(packet.installedRcQualification)) {
    return refusal(
      "tapped_release",
      "installed_rc_authorization_missing",
      "tapped release requires exact installed-RC qualification authority",
      packet,
    );
  }
  if (!validEvidence(packet.finalTapDelta)) {
    return refusal(
      "tapped_release",
      "final_delta_incomplete",
      "tapped release requires one complete final-tap delta",
      packet,
    );
  }
  return refusal(
    "tapped_release",
    "installed_rc_authorization_missing",
    "final release authority is unavailable until the later qualification owner admits installed-RC authorization",
    packet,
  );
}

export interface ReleaseSnapshotPort {
  readonly published_rc: ExactOwnerOperationPort<typeof publishedRcContract>;
  readonly tapped_release: ExactOwnerOperationPort<typeof tappedReleaseContract>;
}

type PublishedRcInvocation = Parameters<
  ExactOwnerOperationPort<typeof publishedRcContract>
>[0];
type TappedReleaseInvocation = Parameters<
  ExactOwnerOperationPort<typeof tappedReleaseContract>
>[0];

export const ReleaseSnapshotPort: ReleaseSnapshotPort = Object.freeze({
  published_rc: async (invocation: PublishedRcInvocation) => Object.freeze({
    outcomeKind: "refusal" as const,
    value: snapshotPublishedRc(invocation.request),
  }),
  tapped_release: async (invocation: TappedReleaseInvocation) => Object.freeze({
    outcomeKind: "refusal" as const,
    value: snapshotTappedRelease(invocation.request),
  }),
});

export const RELEASE_OPERATION_CONTRACTS = Object.freeze({
  snapshot: Object.freeze({
    published_rc: publishedRcContract,
    tapped_release: tappedReleaseContract,
  }),
});
