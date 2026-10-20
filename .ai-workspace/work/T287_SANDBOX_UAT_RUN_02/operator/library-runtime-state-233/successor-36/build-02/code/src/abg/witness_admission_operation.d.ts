import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type PublicOperationAdmissionBasis } from "./environment_admission.js";
import { type AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
export declare const WITNESS_ADMISSION_MEMBER_KEYS: readonly ["reprice", "attest", "hygiene-stamp", "intake", "run-resumed", "run-stopped"];
export type WitnessAdmissionMemberKey = (typeof WITNESS_ADMISSION_MEMBER_KEYS)[number];
export interface ReferenceDigest {
    readonly ref: string;
    readonly digest: Sha256Digest;
}
export type WitnessSubjectKind = "authority_basis" | "evidence_claim" | "workspace" | "intake_item" | "run";
export interface WitnessSubject extends ReferenceDigest {
    readonly kind: WitnessSubjectKind;
}
export interface WitnessContent {
    readonly kind: "typed_reason" | "typed_payload";
    readonly contentContract: ReferenceDigest;
    readonly valueRef: string;
    readonly valueDigest: Sha256Digest;
    readonly value: Readonly<Record<string, JsonValue>>;
}
export type WitnessContext = Readonly<{
    readonly kind: "basis";
    readonly basis: ReferenceDigest;
}> | Readonly<{
    readonly kind: "workspace";
    readonly workspace: ReferenceDigest;
}> | Readonly<{
    readonly kind: "segment";
    readonly run: ReferenceDigest;
    readonly segment: ReferenceDigest;
}> | Readonly<{
    readonly kind: "run";
    readonly run: ReferenceDigest;
    readonly basis: ReferenceDigest;
}>;
export interface WitnessAdmitPacket<K extends WitnessAdmissionMemberKey = WitnessAdmissionMemberKey> {
    readonly kind: "witness_admit_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: K;
    readonly prefix: DurablePrefixCoordinate;
    readonly actor: ReferenceDigest;
    readonly subject: WitnessSubject;
    readonly act: K;
    readonly content: WitnessContent;
    readonly context: WitnessContext;
    readonly evidence: readonly ReferenceDigest[];
    readonly provenance: readonly ReferenceDigest[];
}
export interface WitnessAdmissionAuthority {
    readonly kind: "witness_admission_authority";
    readonly schemaVersion: "5.0.0";
    readonly operationBasis: PublicOperationAdmissionBasis & Readonly<{
        readonly operationId: "abg.operation.witness.admit";
    }>;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly workspaceBinding: ReferenceDigest;
    readonly productSet: ReferenceDigest;
    readonly dependencyLock: ReferenceDigest;
    readonly actor: ReferenceDigest;
    readonly capabilityGrant: ReferenceDigest;
    readonly executionBasis: ReferenceDigest | null;
}
export interface WitnessAdmissionDependencies {
    readonly kind: "witness_admission_dependencies";
    readonly schemaVersion: "5.0.0";
    readonly eventStore: AbgEventStore;
}
export type WitnessAdmissionRefusalCode = "actor_missing" | "subject_missing" | "act_forbidden" | "content_invalid" | "context_mismatch" | "evidence_invalid" | "provenance_invalid" | "basis_mismatch" | "duplicate_invocation" | "sink_unavailable";
export interface WitnessAdmissionRefusal<K extends WitnessAdmissionMemberKey = WitnessAdmissionMemberKey> {
    readonly kind: "witness_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly memberKey: K;
    readonly subjectRef: string | null;
    readonly code: WitnessAdmissionRefusalCode;
    readonly message: string;
    readonly successorPrefix: DurablePrefixCoordinate | null;
}
export interface WitnessAdmission<K extends WitnessAdmissionMemberKey = WitnessAdmissionMemberKey> {
    readonly kind: "witness_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly memberKey: K;
    readonly act: K;
    readonly witnessedActRef: string;
    readonly witnessedActDigest: Sha256Digest;
    readonly publicOperationEventRef: string;
    readonly admittedEventRef: string;
    readonly evidence: readonly ReferenceDigest[];
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type WitnessAdmissionResult<K extends WitnessAdmissionMemberKey = WitnessAdmissionMemberKey> = WitnessAdmission<K> | WitnessAdmissionRefusal<K>;
export declare const GRAPH_CHANGE_CLASS_VALUES: readonly ["goal_reprice", "intent_reprice", "product_reprice", "requirement_reprice", "design_reframe", "realization_refactor"];
export declare const GRAPH_REENTRY_POINT_VALUES: readonly ["goals", "intent", "product_definition", "requirements", "design_surface", "realization", "proof"];
export declare const RUN_STOP_REASON_KIND_VALUES: readonly ["operator_stop", "operator_abort", "external_interruption", "campaign_close"];
export declare const RUN_RESUME_REASON_KIND_VALUES: readonly ["operator_resume", "reprice_reentry", "external_recovery", "campaign_continue"];
export declare const WORKSPACE_HYGIENE_CLASSIFICATION_VALUES: readonly ["clean", "foreign_write", "missing", "untracked"];
export declare const WITNESS_CONTENT_CONTRACTS: Readonly<Readonly<Record<"attest" | "hygiene-stamp" | "intake" | "reprice" | "run-resumed" | "run-stopped", ReferenceDigest & Readonly<Record<string, JsonValue>>>>>;
export declare function admitWitnessedAct<K extends WitnessAdmissionMemberKey>(supplied: WitnessAdmitPacket<K>, authority: WitnessAdmissionAuthority, dependencies: WitnessAdmissionDependencies): WitnessAdmissionResult<K>;
export declare const WitnessAdmissionPort: Readonly<{
    admit: typeof admitWitnessedAct;
}>;
export declare const WITNESS_OPERATION_CONTRACTS: Readonly<{
    admit: Readonly<{
        reprice: typeof admitWitnessedAct;
        attest: typeof admitWitnessedAct;
        "hygiene-stamp": typeof admitWitnessedAct;
        intake: typeof admitWitnessedAct;
        "run-resumed": typeof admitWitnessedAct;
        "run-stopped": typeof admitWitnessedAct;
    }>;
}>;
