import { type WorksitePreservedResultSource } from "../gtl/worksite_construction_recovery.js";
export { WORKSITE_PRESERVED_RESULT_IDS, WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS, constructWorksitePreservedResultSource, isWorksitePreservedResultSource, type WorksitePreservedResultSource } from "../gtl/worksite_construction_recovery.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type WorksiteConstructionTask, type WorksiteConstructionWorkerResult } from "./worksite_construction.js";
export interface PreservedProtocolRecord {
    readonly line: number;
    readonly startByte: number;
    readonly endByte: number;
    readonly digest: Sha256Digest;
}
export interface WorksitePreservedSourceProof {
    readonly sourceExecutionBasisRef: string;
    readonly sourceExecutionBasisDigest: Sha256Digest;
    readonly sourceRunId: string;
    readonly sourceAttempt: number;
    readonly requestDigest: Sha256Digest;
    readonly transportBindingRef: string;
    readonly transportBindingDigest: Sha256Digest;
    readonly processRef: string;
    readonly artifactEventRef: string;
    readonly originalResultRef: string;
    readonly originalResultDigest: Sha256Digest;
    readonly originalJudgmentRef: string;
    readonly originalJudgmentDigest: Sha256Digest;
    readonly assessedEnvelopeDigest: Sha256Digest;
    readonly artifactDigests: Readonly<Record<"output" | "prompt" | "stderr" | "stdout" | "transport", Sha256Digest>>;
    readonly artifactByteLengths: Readonly<Record<"output" | "prompt" | "stderr" | "stdout" | "transport", number>>;
    readonly stdoutChunkEventRefs: readonly string[];
    readonly proposal: Readonly<PreservedProtocolRecord>;
    readonly acknowledgment: Readonly<PreservedProtocolRecord>;
    readonly toolUseId: string;
    readonly sessionId: string;
}
export interface WorksitePreservedResultArtifactBody {
    readonly source: Readonly<WorksitePreservedResultSource>;
    readonly proof: Readonly<WorksitePreservedSourceProof>;
    readonly originalTask: Readonly<WorksiteConstructionTask>;
    readonly currentTask: Readonly<WorksiteConstructionTask>;
    readonly workerResult: Readonly<WorksiteConstructionWorkerResult>;
    readonly owner: Readonly<{
        graphFunctionRef: string;
        executionBasisRef: string;
        executionBasisDigest: Sha256Digest;
        cCallRef: string;
    }>;
}
export interface WorksitePreservedResultArtifact extends WorksitePreservedResultArtifactBody {
    readonly kind: "worksite_preserved_result_artifact";
    readonly schemaVersion: "5.0.0";
    readonly artifactRef: string;
    readonly artifactDigest: Sha256Digest;
    readonly targetJoin: readonly Readonly<{
        originalTargetRef: string;
        currentTargetRef: string;
    }>[];
}
/** This relation changes coordinates only; native bridge admission supplies meaning and authority. */
export declare function preservedWorksiteTargetJoin(original: WorksiteConstructionTask, current: WorksiteConstructionTask): readonly {
    originalTargetRef: string;
    currentTargetRef: string;
}[];
export declare function constructWorksitePreservedResultArtifact(body: WorksitePreservedResultArtifactBody): Readonly<WorksitePreservedResultArtifact>;
export declare function isWorksitePreservedResultArtifact(value: unknown): value is WorksitePreservedResultArtifact;
export declare function derivePreservedWorksiteCandidateBundle(artifact: WorksitePreservedResultArtifact): import("./worksite_construction.js").WorksiteCandidateBundle;
export declare function resolveWorksitePreservedResultJudgmentRelation(predicateRef: string): Readonly<{
    inputContractRef: "contract://abiogenesis/worksite/construction-task@5";
    outputContractRef: "contract://abiogenesis/worksite/preserved-result/artifact@5";
    evaluate: (input: unknown, output: unknown) => boolean;
    predicateRef: string;
    advanceReasonRef: string;
    rejectionReasonRef: string;
}> | Readonly<{
    inputContractRef: "contract://abiogenesis/worksite/preserved-result/artifact@5";
    outputContractRef: "contract://abiogenesis/worksite/construction-candidate-bundle@5";
    evaluate: (input: unknown, output: unknown) => boolean;
    predicateRef: string;
    advanceReasonRef: string;
    rejectionReasonRef: string;
}> | null;
