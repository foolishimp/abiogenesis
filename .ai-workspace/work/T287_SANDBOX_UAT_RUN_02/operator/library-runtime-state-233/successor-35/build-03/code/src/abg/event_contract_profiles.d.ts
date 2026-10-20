import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
/** Exact retained profile. New native truth must never be stamped with L. */
export declare const LEGACY_ROOT_EVENT_CONTRACT_DIGEST: "sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c";
export declare const ROOT_CURRENT_EVENT_PROFILE_REF: "abg.event-contract.root/p5-run-environment-role-context@1";
export declare const ROOT_EVENT_PROFILE_DECLARATION_REF: "declaration://abiogenesis/runtime/root-event-contract-profile@1";
export declare const ROOT_EVENT_PROFILE_UPGRADE_REASON: "admit-current-native-event-contract-profile";
export declare const UNDISPATCHED_OWNER_STAGE_VALUES: readonly ["authority_verification", "worker_contract_resolution", "implementation_load", "preparation"];
export declare const UNDISPATCHED_OWNER_REASON_VALUES: readonly ["refused", "missing_contracts", "missing_export", "thrown", "malformed_preparation"];
export type UndispatchedOwnerStage = typeof UNDISPATCHED_OWNER_STAGE_VALUES[number];
export type UndispatchedOwnerReason = typeof UNDISPATCHED_OWNER_REASON_VALUES[number];
export interface UndispatchedOwnerObservation {
    readonly kind: "undispatched_owner_observation";
    readonly schemaVersion: "5.0.0";
    readonly cCallRef: string;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly programLocusRef: string;
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly implementationRef: string;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly inputDigest: Sha256Digest;
    readonly stage: UndispatchedOwnerStage;
    readonly reason: UndispatchedOwnerReason;
    readonly errorClass: string | null;
    readonly errorCode: string | null;
    readonly diagnosticRef: string;
}
export declare function undispatchedOwnerDiagnosticRef(stage: UndispatchedOwnerStage, reason: UndispatchedOwnerReason, error?: unknown): string;
/** Class/code classification never evaluates arbitrary thrown-object getters. */
export declare function sanitizeUndispatchedOwnerError(error: unknown): Readonly<{
    errorClass: string | null;
    errorCode: string | null;
}>;
export declare function isUndispatchedOwnerObservation(value: unknown): value is UndispatchedOwnerObservation;
export declare function constructRootCurrentEventContractDescriptor(input: Readonly<{
    aggregateTypes: readonly string[];
    eventKinds: readonly string[];
    eventContracts: JsonValue;
}>): Readonly<{
    descriptor: JsonValue;
    digest: Sha256Digest;
}>;
