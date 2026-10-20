import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
export type ArtifactTruthConflictField = "operationId" | "memberKey" | "definitionDigest" | "invocationRef" | "invocationPayloadDigest" | "invocationDigest" | "authorityScopeRef" | "authorityScopeDigest" | "artifactRef" | "artifactDigest" | "admissionEventDigest";
export interface ArtifactTruthRow {
    readonly operationId: string;
    readonly memberKey: string;
    readonly definitionDigest: string;
    readonly invocationRef: string;
    readonly invocationPayloadDigest: string;
    readonly invocationDigest: string;
    readonly authorityScopeRef: string;
    readonly authorityScopeDigest: string;
    readonly artifactRef: string;
    readonly artifactDigest: string;
    readonly artifact: JsonValue | null;
    readonly resolvedLock: JsonValue | null;
    readonly workspaceAuthorityBasis: JsonValue | null;
    readonly admissionEventRef: string;
    readonly admissionEventDigest: Sha256Digest;
    readonly admissionOrdinal: number;
    readonly causationEventRefs: readonly string[];
}
interface FoldedArtifactTruthRow extends ArtifactTruthRow {
    readonly ownerAdmittedDisposition: "admitted";
}
export interface ArtifactTruthProjection {
    readonly kind: "artifact_truth_projection";
    readonly artifacts: readonly FoldedArtifactTruthRow[];
}
export interface ExactPrefixArtifactTruthProjection {
    readonly kind: "exact_prefix_artifact_truth_projection";
    readonly schemaVersion: "5.0.0";
    readonly prefix: DurablePrefixCoordinate;
    readonly prefixEventCount: number;
    readonly lastAdmissionOrdinal: number;
    readonly rows: readonly ArtifactTruthRow[];
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
}
export type ExactPrefixArtifactTruthProjectionRefusalCode = "file_identity_mismatch" | "prefix_length_mismatch" | "prefix_digest_mismatch" | "event_contract_digest_mismatch" | "event_envelope_invalid" | "admission_ordinal_invalid" | "artifact_truth_history_conflict" | "duplicate_artifact_admission";
export interface ExactPrefixArtifactTruthProjectionRefusal {
    readonly kind: "exact_prefix_artifact_truth_projection_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ExactPrefixArtifactTruthProjectionRefusalCode;
    readonly prefix: DurablePrefixCoordinate;
    readonly eventRefs: readonly string[];
    readonly authorityScopeRef: string | null;
    readonly conflictingFields: readonly ArtifactTruthConflictField[];
}
export type ExactPrefixArtifactTruthProjectionResult = ExactPrefixArtifactTruthProjection | ExactPrefixArtifactTruthProjectionRefusal;
export type AdmittedArtifactTruth = ArtifactTruthRow;
export declare function projectArtifactTruth(prefix: ValidatedRuntimeEventPrefix): ArtifactTruthProjection;
/** Speculation borrows the actual predecessor's checked facts. It never lends
 * candidate rows to the live prefix or creates another history derivation. */
export declare function validateArtifactTruthCandidate(predecessor: ExactPrefixArtifactTruthProjection, event: RuntimeEvent): void;
export declare function projectValidatedPrefixArtifactTruth(prefix: DurablePrefixCoordinate, validatedPrefix: ValidatedRuntimeEventPrefix): ExactPrefixArtifactTruthProjection;
/** Pure consumers borrow the exact owner value; copies still reconstruct cold.
 * Explicit fresh validation below remains the acquisition/effect check. */
export declare function validateArtifactTruthProjectionValue(value: unknown): value is ExactPrefixArtifactTruthProjection;
export declare function runtimePrefixFromArtifactTruth(value: ExactPrefixArtifactTruthProjection): ValidatedRuntimeEventPrefix | null;
export declare function projectExactPrefixArtifactTruth(prefix: DurablePrefixCoordinate): ExactPrefixArtifactTruthProjectionResult;
/** Pure projection from the existing authenticated coordinate receipt. Raw
 * coordinates have no receipt and retain the complete cold acquisition. */
export declare function projectOwnedPrefixArtifactTruth(prefix: DurablePrefixCoordinate): ExactPrefixArtifactTruthProjectionResult;
export declare function validateExactPrefixArtifactTruthProjection(value: unknown, options?: Readonly<{
    requireCurrent?: boolean;
}>): value is ExactPrefixArtifactTruthProjection;
export {};
