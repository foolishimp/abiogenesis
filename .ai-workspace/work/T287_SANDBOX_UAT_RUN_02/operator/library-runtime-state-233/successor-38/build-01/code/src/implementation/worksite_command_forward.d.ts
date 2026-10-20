import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate } from "./contracts.js";
export declare const WORKSITE_COMMAND_FORWARD_PREPARE_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare const WORKSITE_COMMAND_FORWARD_EXECUTE_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare function prepareWorksiteCommandForward(input: unknown, occurrence: LeafExecutionOccurrence): Readonly<LeafRealizationCandidate>;
export declare function realizeWorksiteCommandForward(input: unknown, occurrence: LeafExecutionOccurrence): Readonly<{
    complete(exchange: Parameters<(exchange: Readonly<import("../index.js").ActorProcessCarrierValidation>) => Readonly<LeafRealizationCandidate> | Promise<Readonly<LeafRealizationCandidate>>>[0]): Promise<Readonly<LeafRealizationCandidate>>;
    kind: "prepared_probabilistic_leaf_invocation";
    schemaVersion: "5.0.0";
    workerRequest: Readonly<import("./contracts.js").ProbabilisticWorkerRequest>;
}>;
