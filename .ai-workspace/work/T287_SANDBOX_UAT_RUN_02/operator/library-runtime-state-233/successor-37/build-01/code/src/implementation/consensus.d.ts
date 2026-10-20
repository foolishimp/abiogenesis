import { type ConsensusEscalationDecision, type ConsensusFindingsVector, type ConsensusResolution, type ConsensusInvocation, type ConsensusRoundState, type ConsensusRoleTask, type ConsensusSubmitterResponse } from "../gtl/consensus.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { LeafExecutionOccurrence, PreparedProbabilisticLeafInvocation } from "./contracts.js";
interface ConsensusLeafCandidate {
    readonly kind: "leaf_realization_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "failure" | "success";
    readonly evidenceCandidates: readonly [];
    readonly resultCandidate: Readonly<Record<string, JsonValue>>;
    readonly diagnosticRef?: string;
}
export declare const CONSENSUS_INITIALIZER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_ROUND_EVALUATOR_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_REVIEWER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_SUBMITTER_TASK_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_SUBMITTER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_REDUCER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_FINALIZATION_PREPARATION_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_FINALIZATION_EVALUATOR_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_PROJECTOR_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_ESCALATION_FINALIZER_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_SYNTHESIZE_MODEL_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_EVAL_GAP_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_EVALUATE_ACTION_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_REFRESH_MODEL_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_REFRESH_GAP_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const CONSENSUS_REFRESH_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare function realizeConsensusInitialization(input: Readonly<ConsensusInvocation>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusRoundEvaluation(input: Readonly<ConsensusRoundState>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusSubmitterTaskPreparation(input: Readonly<ConsensusFindingsVector>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusRole(input: Readonly<ConsensusRoleTask>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<PreparedProbabilisticLeafInvocation<ConsensusLeafCandidate>>;
export declare function realizeConsensusReduction(input: Readonly<ConsensusSubmitterResponse>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusFinalizationPreparation(input: Readonly<ConsensusRoundState>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusFinalizationEvaluation(input: Readonly<ConsensusResolution>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusResultProjection(input: Readonly<ConsensusResolution>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusEscalationFinalization(input: Readonly<ConsensusEscalationDecision>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusModelSynthesis(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusGapEvaluation(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusNextActionSelection(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusActionEvaluation(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusModelRefresh(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusGapRefresh(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export declare function realizeConsensusNextActionRefresh(input: Readonly<Record<string, JsonValue>>): Readonly<{
    kind: "leaf_realization_candidate";
    schemaVersion: "5.0.0";
    disposition: "success";
    evidenceCandidates: {
        kind: "deterministic_evidence_candidate";
        schemaVersion: "5.0.0";
        implementationRef: string;
        inputDigest: `sha256:${string}`;
        outputDigest: `sha256:${string}`;
    }[];
    resultCandidate: Readonly<Record<string, JsonValue>>;
}>;
export {};
