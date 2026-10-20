import type { Sha256Digest } from "../shared/digests.js";
import { type ExactPrefixArtifactTruthProjectionRefusalCode } from "./artifact_truth.js";
import { type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
type ExplicitInvocationTruthPrefix = DurablePrefixCoordinate | ValidatedRuntimeEventPrefix;
export interface EffectfulPublicInvocationPriorAdmission {
    readonly operationId: "abg.operation.release.snapshot" | "abg.operation.product.install" | "abg.operation.workspace.bind" | "abg.operation.run.invoke" | "abg.operation.interaction.respond" | "abg.operation.run.continue";
    readonly publicInvocationRef: string;
    readonly ownerInvocationRef: string;
    readonly ownerInvocationDigest: Sha256Digest;
    readonly publicOperationEventRef: string;
    readonly admissionEventRef: string;
}
export type EffectfulPublicInvocationTruth = Readonly<{
    kind: "effectful_public_invocation_truth";
    schemaVersion: "5.0.0";
    disposition: "available";
    invocationRef: string;
    prefix: ExplicitInvocationTruthPrefix;
}> | Readonly<{
    kind: "effectful_public_invocation_truth";
    schemaVersion: "5.0.0";
    disposition: "duplicate";
    invocationRef: string;
    prefix: ExplicitInvocationTruthPrefix;
    priorAdmission: EffectfulPublicInvocationPriorAdmission;
}> | Readonly<{
    kind: "effectful_public_invocation_truth_invalid_history";
    schemaVersion: "5.0.0";
    disposition: "invalid_history";
    code: "artifact_truth_invalid" | "duplicate_outer_invocation" | "invocation_pair_invalid" | "prefix_invalid";
    invocationRef: string;
    prefix: ExplicitInvocationTruthPrefix;
    eventRefs: readonly string[];
    artifactTruthCode: ExactPrefixArtifactTruthProjectionRefusalCode | null;
}>;
export declare function projectEffectfulPublicInvocationTruthAtPrefix(prefix: ExplicitInvocationTruthPrefix, invocationRef: string): EffectfulPublicInvocationTruth;
export {};
