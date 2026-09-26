import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type SemanticEvidenceInput } from "../product/semantic_stage.js";
import { type SemanticStageNativeBasis } from "./semantic_stage.js";
import type { ProbabilisticWorkerRequest } from "../implementation/contracts.js";
import { type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
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
/** Deterministic projection of required admitted evidence. Artifact/log bytes
 * are exact; no truncation, normalization, inferred judgment or raw-envelope
 * replacement occurs. Historical task/inventory bodies are not role material. */
export declare function renderSemanticEvidenceTextView(evidence: SemanticEvidenceInput | null): Readonly<{
    constructionResult: Readonly<Record<string, JsonValue>> | {
        task: {
            kind: "native_workspace_work_task";
            schemaVersion: "5.0.0";
            taskDigest: `sha256:${string}`;
            bodyDisposition: string;
        };
        before: {
            kind: "worksite_context_observation";
            schemaVersion: "5.0.0";
            observationRef: string;
            observationDigest: `sha256:${string}`;
            workspaceAuthorityBasisRef: string;
            workspaceAuthorityBasisDigest: `sha256:${string}`;
            workspaceBindingIdentity: string;
            workspaceBindingDigest: `sha256:${string}`;
            bodyDisposition: string;
        };
        after: {
            kind: "worksite_context_observation";
            schemaVersion: "5.0.0";
            observationRef: string;
            observationDigest: `sha256:${string}`;
            workspaceAuthorityBasisRef: string;
            workspaceAuthorityBasisDigest: `sha256:${string}`;
            workspaceBindingIdentity: string;
            workspaceBindingDigest: `sha256:${string}`;
            bodyDisposition: string;
        };
        kind: "native_workspace_work_observation";
        schemaVersion: "5.0.0";
        observationRef: string;
        observationDigest: Sha256Digest;
        changedPaths: readonly string[];
        report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
        assessment?: Readonly<Record<string, JsonValue>>;
        provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
    };
    executionObservation: {
        task: import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask | import("../index.js").WorksiteRevisionCommandExecutionTask | {
            sourceReacquisition?: import("../product/worksite_command_execution.js").NativeWorksiteCommandReacquisition | {
                request: {
                    sourceNativeWork: {
                        task: {
                            kind: "native_workspace_work_task";
                            schemaVersion: "5.0.0";
                            taskDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        before: {
                            kind: "worksite_context_observation";
                            schemaVersion: "5.0.0";
                            observationRef: string;
                            observationDigest: `sha256:${string}`;
                            workspaceAuthorityBasisRef: string;
                            workspaceAuthorityBasisDigest: `sha256:${string}`;
                            workspaceBindingIdentity: string;
                            workspaceBindingDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        after: {
                            kind: "worksite_context_observation";
                            schemaVersion: "5.0.0";
                            observationRef: string;
                            observationDigest: `sha256:${string}`;
                            workspaceAuthorityBasisRef: string;
                            workspaceAuthorityBasisDigest: `sha256:${string}`;
                            workspaceBindingIdentity: string;
                            workspaceBindingDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        kind: "native_workspace_work_observation";
                        schemaVersion: "5.0.0";
                        observationRef: string;
                        observationDigest: Sha256Digest;
                        changedPaths: readonly string[];
                        report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
                        assessment?: Readonly<Record<string, JsonValue>>;
                        provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
                    };
                    currentContext: {
                        observationRef: string;
                        observationDigest: `sha256:${string}`;
                        workspaceAuthorityBasisRef: string;
                        workspaceAuthorityBasisDigest: `sha256:${string}`;
                        workspaceBindingIdentity: string;
                        workspaceBindingDigest: `sha256:${string}`;
                        bodyDisposition: string;
                    };
                    kind: "native_worksite_command_reacquisition_request";
                    schemaVersion: "5.0.0";
                    requestRef: string;
                    requestDigest: Sha256Digest;
                    source: Readonly<{
                        prefix: import("./event_store.js").DurablePrefixCoordinate;
                        graphCallRef: string;
                        declarationProof: import("./terminal_result_contracts.js").AbgHistoricalDeclarationProof;
                    }>;
                    workspaceBinding: import("../index.js").WorkspaceBinding;
                    capabilityGrant: import("../index.js").CapabilityGrant;
                    commands: readonly import("../product/worksite_command_execution.js").WorksiteDeclaredCommandInput[];
                    outcomePredicates?: readonly import("../product/worksite_command_execution.js").WorksiteOutcomePredicateInput[];
                    allowedWriteTerritories: readonly import("../product/worksite_command_execution.js").WorksiteCommandWriteTerritoryInput[];
                    workspaceAuthorityBasis: import("../index.js").WorkspaceAuthorityBasis;
                    selectedSources: readonly Readonly<{
                        subjectUri: string;
                        relativePath: string;
                    }>[];
                };
                nativeBasis: Readonly<{
                    predecessorPrefix: import("./event_store.js").DurablePrefixCoordinate;
                    cCallRef: string;
                }>;
                bindingCoverEventRefs: readonly string[];
            };
            sourceNativeWork: {
                task: {
                    kind: "native_workspace_work_task";
                    schemaVersion: "5.0.0";
                    taskDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                before: {
                    kind: "worksite_context_observation";
                    schemaVersion: "5.0.0";
                    observationRef: string;
                    observationDigest: `sha256:${string}`;
                    workspaceAuthorityBasisRef: string;
                    workspaceAuthorityBasisDigest: `sha256:${string}`;
                    workspaceBindingIdentity: string;
                    workspaceBindingDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                after: {
                    kind: "worksite_context_observation";
                    schemaVersion: "5.0.0";
                    observationRef: string;
                    observationDigest: `sha256:${string}`;
                    workspaceAuthorityBasisRef: string;
                    workspaceAuthorityBasisDigest: `sha256:${string}`;
                    workspaceBindingIdentity: string;
                    workspaceBindingDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                kind: "native_workspace_work_observation";
                schemaVersion: "5.0.0";
                observationRef: string;
                observationDigest: Sha256Digest;
                changedPaths: readonly string[];
                report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
                assessment?: Readonly<Record<string, JsonValue>>;
                provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
            } | {
                observationRef: string;
                observationDigest: `sha256:${string}`;
                presentationRef: string;
                disposition: string;
            };
            kind: "worksite_command_execution_task";
            workerActorRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef;
            workerBindingRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef;
            rendererRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.rendererRef;
            materializationPlanRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef;
            schemaVersion: "5.0.0";
            resultContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef;
            transportLane: "worker_executes";
            workspaceBinding: import("../index.js").WorkspaceBinding;
            capabilityGrant: import("../index.js").CapabilityGrant;
            taskRef: string;
            taskDigest: Sha256Digest;
            commands: readonly import("../product/worksite_command_execution.js").WorksiteDeclaredCommand[];
            outcomePredicates: readonly import("../product/worksite_command_execution.js").WorksiteOutcomePredicate[];
            allowedWriteTerritories: readonly import("../product/worksite_command_execution.js").WorksiteCommandWriteTerritory[];
            workspaceAuthorityBasis: import("../index.js").WorkspaceAuthorityBasis;
            instructionContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef;
            protectedObservations: readonly import("../product/worksite_command_execution.js").WorksiteProtectedObservation[];
        };
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
        task: import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask | import("../index.js").WorksiteRevisionCommandExecutionTask | {
            sourceReacquisition?: import("../product/worksite_command_execution.js").NativeWorksiteCommandReacquisition | {
                request: {
                    sourceNativeWork: {
                        task: {
                            kind: "native_workspace_work_task";
                            schemaVersion: "5.0.0";
                            taskDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        before: {
                            kind: "worksite_context_observation";
                            schemaVersion: "5.0.0";
                            observationRef: string;
                            observationDigest: `sha256:${string}`;
                            workspaceAuthorityBasisRef: string;
                            workspaceAuthorityBasisDigest: `sha256:${string}`;
                            workspaceBindingIdentity: string;
                            workspaceBindingDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        after: {
                            kind: "worksite_context_observation";
                            schemaVersion: "5.0.0";
                            observationRef: string;
                            observationDigest: `sha256:${string}`;
                            workspaceAuthorityBasisRef: string;
                            workspaceAuthorityBasisDigest: `sha256:${string}`;
                            workspaceBindingIdentity: string;
                            workspaceBindingDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        kind: "native_workspace_work_observation";
                        schemaVersion: "5.0.0";
                        observationRef: string;
                        observationDigest: Sha256Digest;
                        changedPaths: readonly string[];
                        report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
                        assessment?: Readonly<Record<string, JsonValue>>;
                        provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
                    };
                    currentContext: {
                        observationRef: string;
                        observationDigest: `sha256:${string}`;
                        workspaceAuthorityBasisRef: string;
                        workspaceAuthorityBasisDigest: `sha256:${string}`;
                        workspaceBindingIdentity: string;
                        workspaceBindingDigest: `sha256:${string}`;
                        bodyDisposition: string;
                    };
                    kind: "native_worksite_command_reacquisition_request";
                    schemaVersion: "5.0.0";
                    requestRef: string;
                    requestDigest: Sha256Digest;
                    source: Readonly<{
                        prefix: import("./event_store.js").DurablePrefixCoordinate;
                        graphCallRef: string;
                        declarationProof: import("./terminal_result_contracts.js").AbgHistoricalDeclarationProof;
                    }>;
                    workspaceBinding: import("../index.js").WorkspaceBinding;
                    capabilityGrant: import("../index.js").CapabilityGrant;
                    commands: readonly import("../product/worksite_command_execution.js").WorksiteDeclaredCommandInput[];
                    outcomePredicates?: readonly import("../product/worksite_command_execution.js").WorksiteOutcomePredicateInput[];
                    allowedWriteTerritories: readonly import("../product/worksite_command_execution.js").WorksiteCommandWriteTerritoryInput[];
                    workspaceAuthorityBasis: import("../index.js").WorkspaceAuthorityBasis;
                    selectedSources: readonly Readonly<{
                        subjectUri: string;
                        relativePath: string;
                    }>[];
                };
                nativeBasis: Readonly<{
                    predecessorPrefix: import("./event_store.js").DurablePrefixCoordinate;
                    cCallRef: string;
                }>;
                bindingCoverEventRefs: readonly string[];
            };
            sourceNativeWork: {
                task: {
                    kind: "native_workspace_work_task";
                    schemaVersion: "5.0.0";
                    taskDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                before: {
                    kind: "worksite_context_observation";
                    schemaVersion: "5.0.0";
                    observationRef: string;
                    observationDigest: `sha256:${string}`;
                    workspaceAuthorityBasisRef: string;
                    workspaceAuthorityBasisDigest: `sha256:${string}`;
                    workspaceBindingIdentity: string;
                    workspaceBindingDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                after: {
                    kind: "worksite_context_observation";
                    schemaVersion: "5.0.0";
                    observationRef: string;
                    observationDigest: `sha256:${string}`;
                    workspaceAuthorityBasisRef: string;
                    workspaceAuthorityBasisDigest: `sha256:${string}`;
                    workspaceBindingIdentity: string;
                    workspaceBindingDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                kind: "native_workspace_work_observation";
                schemaVersion: "5.0.0";
                observationRef: string;
                observationDigest: Sha256Digest;
                changedPaths: readonly string[];
                report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
                assessment?: Readonly<Record<string, JsonValue>>;
                provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
            } | {
                observationRef: string;
                observationDigest: `sha256:${string}`;
                presentationRef: string;
                disposition: string;
            };
            kind: "worksite_command_execution_task";
            workerActorRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef;
            workerBindingRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef;
            rendererRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.rendererRef;
            materializationPlanRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef;
            schemaVersion: "5.0.0";
            resultContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef;
            transportLane: "worker_executes";
            workspaceBinding: import("../index.js").WorkspaceBinding;
            capabilityGrant: import("../index.js").CapabilityGrant;
            taskRef: string;
            taskDigest: Sha256Digest;
            commands: readonly import("../product/worksite_command_execution.js").WorksiteDeclaredCommand[];
            outcomePredicates: readonly import("../product/worksite_command_execution.js").WorksiteOutcomePredicate[];
            allowedWriteTerritories: readonly import("../product/worksite_command_execution.js").WorksiteCommandWriteTerritory[];
            workspaceAuthorityBasis: import("../index.js").WorkspaceAuthorityBasis;
            instructionContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef;
            protectedObservations: readonly import("../product/worksite_command_execution.js").WorksiteProtectedObservation[];
        };
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
        task: import("../product/worksite_command_execution.js").WorksiteCommandExecutionTask | import("../index.js").WorksiteRevisionCommandExecutionTask | {
            sourceReacquisition?: import("../product/worksite_command_execution.js").NativeWorksiteCommandReacquisition | {
                request: {
                    sourceNativeWork: {
                        task: {
                            kind: "native_workspace_work_task";
                            schemaVersion: "5.0.0";
                            taskDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        before: {
                            kind: "worksite_context_observation";
                            schemaVersion: "5.0.0";
                            observationRef: string;
                            observationDigest: `sha256:${string}`;
                            workspaceAuthorityBasisRef: string;
                            workspaceAuthorityBasisDigest: `sha256:${string}`;
                            workspaceBindingIdentity: string;
                            workspaceBindingDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        after: {
                            kind: "worksite_context_observation";
                            schemaVersion: "5.0.0";
                            observationRef: string;
                            observationDigest: `sha256:${string}`;
                            workspaceAuthorityBasisRef: string;
                            workspaceAuthorityBasisDigest: `sha256:${string}`;
                            workspaceBindingIdentity: string;
                            workspaceBindingDigest: `sha256:${string}`;
                            bodyDisposition: string;
                        };
                        kind: "native_workspace_work_observation";
                        schemaVersion: "5.0.0";
                        observationRef: string;
                        observationDigest: Sha256Digest;
                        changedPaths: readonly string[];
                        report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
                        assessment?: Readonly<Record<string, JsonValue>>;
                        provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
                    };
                    currentContext: {
                        observationRef: string;
                        observationDigest: `sha256:${string}`;
                        workspaceAuthorityBasisRef: string;
                        workspaceAuthorityBasisDigest: `sha256:${string}`;
                        workspaceBindingIdentity: string;
                        workspaceBindingDigest: `sha256:${string}`;
                        bodyDisposition: string;
                    };
                    kind: "native_worksite_command_reacquisition_request";
                    schemaVersion: "5.0.0";
                    requestRef: string;
                    requestDigest: Sha256Digest;
                    source: Readonly<{
                        prefix: import("./event_store.js").DurablePrefixCoordinate;
                        graphCallRef: string;
                        declarationProof: import("./terminal_result_contracts.js").AbgHistoricalDeclarationProof;
                    }>;
                    workspaceBinding: import("../index.js").WorkspaceBinding;
                    capabilityGrant: import("../index.js").CapabilityGrant;
                    commands: readonly import("../product/worksite_command_execution.js").WorksiteDeclaredCommandInput[];
                    outcomePredicates?: readonly import("../product/worksite_command_execution.js").WorksiteOutcomePredicateInput[];
                    allowedWriteTerritories: readonly import("../product/worksite_command_execution.js").WorksiteCommandWriteTerritoryInput[];
                    workspaceAuthorityBasis: import("../index.js").WorkspaceAuthorityBasis;
                    selectedSources: readonly Readonly<{
                        subjectUri: string;
                        relativePath: string;
                    }>[];
                };
                nativeBasis: Readonly<{
                    predecessorPrefix: import("./event_store.js").DurablePrefixCoordinate;
                    cCallRef: string;
                }>;
                bindingCoverEventRefs: readonly string[];
            };
            sourceNativeWork: {
                task: {
                    kind: "native_workspace_work_task";
                    schemaVersion: "5.0.0";
                    taskDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                before: {
                    kind: "worksite_context_observation";
                    schemaVersion: "5.0.0";
                    observationRef: string;
                    observationDigest: `sha256:${string}`;
                    workspaceAuthorityBasisRef: string;
                    workspaceAuthorityBasisDigest: `sha256:${string}`;
                    workspaceBindingIdentity: string;
                    workspaceBindingDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                after: {
                    kind: "worksite_context_observation";
                    schemaVersion: "5.0.0";
                    observationRef: string;
                    observationDigest: `sha256:${string}`;
                    workspaceAuthorityBasisRef: string;
                    workspaceAuthorityBasisDigest: `sha256:${string}`;
                    workspaceBindingIdentity: string;
                    workspaceBindingDigest: `sha256:${string}`;
                    bodyDisposition: string;
                };
                kind: "native_workspace_work_observation";
                schemaVersion: "5.0.0";
                observationRef: string;
                observationDigest: Sha256Digest;
                changedPaths: readonly string[];
                report: import("../product/native_workspace_work.js").NativeWorkspaceWorkReport | null;
                assessment?: Readonly<Record<string, JsonValue>>;
                provenance: import("../product/native_workspace_work.js").NativeWorkspaceWorkProvenance;
            } | {
                observationRef: string;
                observationDigest: `sha256:${string}`;
                presentationRef: string;
                disposition: string;
            };
            kind: "worksite_command_execution_task";
            workerActorRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef;
            workerBindingRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef;
            rendererRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.rendererRef;
            materializationPlanRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef;
            schemaVersion: "5.0.0";
            resultContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef;
            transportLane: "worker_executes";
            workspaceBinding: import("../index.js").WorkspaceBinding;
            capabilityGrant: import("../index.js").CapabilityGrant;
            taskRef: string;
            taskDigest: Sha256Digest;
            commands: readonly import("../product/worksite_command_execution.js").WorksiteDeclaredCommand[];
            outcomePredicates: readonly import("../product/worksite_command_execution.js").WorksiteOutcomePredicate[];
            allowedWriteTerritories: readonly import("../product/worksite_command_execution.js").WorksiteCommandWriteTerritory[];
            workspaceAuthorityBasis: import("../index.js").WorkspaceAuthorityBasis;
            instructionContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef;
            protectedObservations: readonly import("../product/worksite_command_execution.js").WorksiteProtectedObservation[];
        };
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
    historicalCarrierDisposition?: string;
    kind: string;
    rawEvidenceDigest: `sha256:${string}`;
    constructionResultRef: string;
    constructionResultDigest: Sha256Digest;
    executionResultRef: string;
    executionResultDigest: Sha256Digest;
}> | null;
/** Selected work already comes from GTL/HoG; this owner only binds and renders it. */
export declare function evaluateNativeInstructionAssembly(basis: SemanticStageNativeBasis, supplied: unknown, readPhysical?: boolean): Readonly<NativeInstructionAssembly | NativeInstructionAssemblyRefusal>;
/** Pure rederivation for comparison/admission; no current filesystem dependency. */
export declare function constructNativeInstructionAssembly(basis: SemanticStageNativeBasis, supplied: unknown): Readonly<NativeInstructionAssembly> | null;
/** Existing pre-dispatch boundary: a typed cause is never an empty successful prompt. */
export declare function requireNativeInstructionAssembly(basis: SemanticStageNativeBasis, supplied: unknown): Readonly<NativeInstructionAssembly>;
/** A presentation of the already authenticated native selection subject, not
 * an admission entry or a replacement carrier. References are local JSON
 * pointers into this one prompt; all source identities remain the originals. */
export declare function renderNativeRevisionSelectionDecisionView(sections: Readonly<Record<string, JsonValue>>, envelope: import("../product/semantic_job.js").SemanticJobEnvelope): Readonly<Record<string, JsonValue>>;
export declare function nativeInstructionRequestMatches(basis: SemanticStageNativeBasis, input: unknown, request: ProbabilisticWorkerRequest): boolean;
/** The wrapper's candidate/source must equal the one actual native transport.
 * Full transport admission remains the existing actor/CCall owner's check. */
export declare function semanticInstructionResultMatches(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean;
