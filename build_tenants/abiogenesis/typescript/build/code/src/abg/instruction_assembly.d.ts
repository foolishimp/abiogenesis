import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type SemanticEvidenceInput } from "../product/semantic_stage.js";
import { type SemanticStageNativeBasis } from "./semantic_stage.js";
import type { ProbabilisticWorkerRequest } from "../implementation/contracts.js";
import { type NativeInstructionAssemblyBasis } from "./execution_basis.js";
export interface NativeInstructionAssembly {
    readonly kind: "native_instruction_assembly";
    readonly schemaVersion: "5.0.0";
    readonly planRef: string;
    readonly planDigest: Sha256Digest;
    readonly plan: Readonly<Record<string, JsonValue>>;
    readonly envelope: Readonly<Record<string, JsonValue>>;
    readonly envelopeDigest: Sha256Digest;
    readonly manifest: Readonly<Record<string, JsonValue>>;
    readonly manifestDigest: Sha256Digest;
    readonly request: Readonly<ProbabilisticWorkerRequest>;
}
export interface NativeInstructionAssemblyRefusal {
    readonly kind: "native_instruction_assembly_refusal";
    readonly cause: "unknown_dependency" | "unavailable_required_content" | "stale_basis" | "unsupported_selection" | "declared_bound_overflow";
    readonly policy: string | null;
    readonly role: string | null;
    readonly unresolvedRefs: readonly string[];
}
/** One attempt identity calculation shared with the existing C2 helper owner. */
export declare function worksiteCommandExecutionAttemptRef(occurrence: Readonly<{
    cCallRef: string;
    runId: string;
    graphCallId: string;
    frameId: string;
    taskOrdinal: number | null;
    attempt: number;
}>): string;
/** The same assembly owner extends to the two declared worksite carriers.
 * Base requests are derived from authenticated task values, never supplied
 * prompt overrides. This projection performs no helper or filesystem effect. */
export declare function constructWorksiteNativeInstructionAssembly(basis: NativeInstructionAssemblyBasis, supplied: unknown): Readonly<NativeInstructionAssembly> | null;
export declare function requireWorksiteNativeInstructionAssembly(basis: NativeInstructionAssemblyBasis, supplied: unknown): Readonly<NativeInstructionAssembly>;
/** Deterministic prompt view of the authenticated raw evidence. No truncation,
 * normalization, inferred judgment or replacement of the admitted envelope. */
export declare function renderSemanticEvidenceTextView(evidence: SemanticEvidenceInput | null): Readonly<{
    kind: string;
    rawEvidenceDigest: `sha256:${string}`;
    executionObservation: {
        commandResults: {
            stdout: {
                textView: {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: string;
                } | {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: null;
                };
                kind: "worksite_observed_stream";
                schemaVersion: "5.0.0";
                encoding: "base64";
                byteLength: number;
                digest: Sha256Digest;
            };
            stderr: {
                textView: {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: string;
                } | {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: null;
                };
                kind: "worksite_observed_stream";
                schemaVersion: "5.0.0";
                encoding: "base64";
                byteLength: number;
                digest: Sha256Digest;
            };
            kind: "worksite_command_result";
            schemaVersion: "5.0.0";
            ordinal: number;
            commandId: string;
            executable: string;
            args: readonly string[];
            relativeCwd: string;
            environment: readonly import("../product/worksite_command_execution.js").WorksiteCommandEnvironmentEntry[];
            timeoutMs: number;
            terminationGraceMs: number;
            exitStatus: number;
            timedOut: boolean;
            processSignal: string | null;
            signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
            terminationConfirmed: boolean;
            reports: readonly import("../product/worksite_command_execution.js").WorksiteReportObservation[];
            reportCount: number;
            observationRef: string;
            observationDigest: Sha256Digest;
        }[];
        task: import("../product/worksite_command_execution.js").NativeWorksiteCommandExecutionTask;
        kind: "worksite_command_execution_observation";
        schemaVersion: "5.0.0";
        provenance: import("../product/worksite_command_execution.js").WorksiteCommandExecutionProvenance;
        observationDigest: Sha256Digest;
        snapshotMembers: readonly import("../product/worksite_command_execution.js").WorksiteSnapshotMember[];
        predicateObservations: readonly import("../product/worksite_command_execution.js").WorksitePredicateObservation[];
        worksiteDelta: readonly import("../product/worksite_command_execution.js").WorksitePathDelta[];
        productDelta: readonly import("../product/worksite_command_execution.js").WorksitePathDelta[];
        snapshotRef: string;
        snapshotDigest: Sha256Digest;
        observationRef: string;
        helperArtifactRef: string;
        helperArtifactDigest: Sha256Digest;
    } | {
        commandResults: {
            stdout: {
                textView: {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: string;
                } | {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: null;
                };
                kind: "worksite_observed_stream";
                schemaVersion: "5.0.0";
                encoding: "base64";
                byteLength: number;
                digest: Sha256Digest;
            };
            stderr: {
                textView: {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: string;
                } | {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: null;
                };
                kind: "worksite_observed_stream";
                schemaVersion: "5.0.0";
                encoding: "base64";
                byteLength: number;
                digest: Sha256Digest;
            };
            kind: "worksite_command_result";
            schemaVersion: "5.0.0";
            ordinal: number;
            commandId: string;
            executable: string;
            args: readonly string[];
            relativeCwd: string;
            environment: readonly import("../product/worksite_command_execution.js").WorksiteCommandEnvironmentEntry[];
            timeoutMs: number;
            terminationGraceMs: number;
            exitStatus: number;
            timedOut: boolean;
            processSignal: string | null;
            signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
            terminationConfirmed: boolean;
            reports: readonly import("../product/worksite_command_execution.js").WorksiteReportObservation[];
            reportCount: number;
            observationRef: string;
            observationDigest: Sha256Digest;
        }[];
        kind: "worksite_revision_command_execution_observation";
        task: import("../index.js").WorksiteRevisionCommandExecutionTask;
        snapshotMembers: readonly import("../index.js").WorksiteRevisionSnapshotMember[];
        schemaVersion: "5.0.0";
        provenance: import("../product/worksite_command_execution.js").WorksiteCommandExecutionProvenance;
        observationDigest: Sha256Digest;
        predicateObservations: readonly import("../product/worksite_command_execution.js").WorksitePredicateObservation[];
        worksiteDelta: readonly import("../product/worksite_command_execution.js").WorksitePathDelta[];
        productDelta: readonly import("../product/worksite_command_execution.js").WorksitePathDelta[];
        snapshotRef: string;
        snapshotDigest: Sha256Digest;
        observationRef: string;
        helperArtifactRef: string;
        helperArtifactDigest: Sha256Digest;
    } | {
        commandResults: {
            stdout: {
                textView: {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: string;
                } | {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: null;
                };
                kind: "worksite_observed_stream";
                schemaVersion: "5.0.0";
                encoding: "base64";
                byteLength: number;
                digest: Sha256Digest;
            };
            stderr: {
                textView: {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: string;
                } | {
                    disposition: string;
                    byteLength: number;
                    digest: `sha256:${string}`;
                    text: null;
                };
                kind: "worksite_observed_stream";
                schemaVersion: "5.0.0";
                encoding: "base64";
                byteLength: number;
                digest: Sha256Digest;
            };
            kind: "worksite_command_result";
            schemaVersion: "5.0.0";
            ordinal: number;
            commandId: string;
            executable: string;
            args: readonly string[];
            relativeCwd: string;
            environment: readonly import("../product/worksite_command_execution.js").WorksiteCommandEnvironmentEntry[];
            timeoutMs: number;
            terminationGraceMs: number;
            exitStatus: number;
            timedOut: boolean;
            processSignal: string | null;
            signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
            terminationConfirmed: boolean;
            reports: readonly import("../product/worksite_command_execution.js").WorksiteReportObservation[];
            reportCount: number;
            observationRef: string;
            observationDigest: Sha256Digest;
        }[];
        kind: "worksite_command_execution_observation";
        schemaVersion: "5.0.0";
        observationRef: string;
        observationDigest: Sha256Digest;
        task: import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask;
        provenance: import("../product/worksite_command_execution.js").WorksiteCommandExecutionProvenance;
        helperArtifactRef: string;
        helperArtifactDigest: Sha256Digest;
        predicateObservations: readonly import("../product/worksite_command_execution.js").WorksitePredicateObservation[];
        worksiteDelta: readonly import("../product/worksite_command_execution.js").WorksitePathDelta[];
        productDelta: readonly import("../product/worksite_command_execution.js").WorksitePathDelta[];
        snapshotRef: string;
        snapshotDigest: Sha256Digest;
        snapshotMembers: readonly import("../product/worksite_command_execution.js").WorksiteSnapshotMember[];
    };
    artifacts: {
        textView: {
            disposition: string;
            byteLength: number;
            digest: `sha256:${string}`;
            text: string;
        } | {
            disposition: string;
            byteLength: number;
            digest: `sha256:${string}`;
            text: null;
        };
        subjectRef: string;
        observationRef: string;
        role: "realization" | "verifier_artifact";
    }[];
    constructionResultRef: string;
    constructionResultDigest: Sha256Digest;
    executionResultRef: string;
    executionResultDigest: Sha256Digest;
    constructionResult: Readonly<Record<string, JsonValue>>;
}> | null;
/** Selected work already comes from GTL/HoG; this owner only binds and renders it. */
export declare function evaluateNativeInstructionAssembly(basis: SemanticStageNativeBasis, supplied: unknown, readPhysical?: boolean): Readonly<NativeInstructionAssembly | NativeInstructionAssemblyRefusal>;
/** Pure rederivation for comparison/admission; no current filesystem dependency. */
export declare function constructNativeInstructionAssembly(basis: SemanticStageNativeBasis, supplied: unknown): Readonly<NativeInstructionAssembly> | null;
/** Existing pre-dispatch boundary: a typed cause is never an empty successful prompt. */
export declare function requireNativeInstructionAssembly(basis: SemanticStageNativeBasis, supplied: unknown): Readonly<NativeInstructionAssembly>;
export declare function nativeInstructionRequestMatches(basis: SemanticStageNativeBasis, input: unknown, request: ProbabilisticWorkerRequest): boolean;
/** The wrapper's candidate/source must equal the one actual native transport.
 * Full transport admission remains the existing actor/CCall owner's check. */
export declare function semanticInstructionResultMatches(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
