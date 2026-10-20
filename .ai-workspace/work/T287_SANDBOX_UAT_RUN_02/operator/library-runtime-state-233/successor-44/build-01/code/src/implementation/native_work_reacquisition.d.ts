import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, NativeLeafProofOperations } from "./contracts.js";
import type { AbgHistoricalGraphCallSourceResource } from "../abg/terminal_result_contracts.js";
export declare const NATIVE_WORK_REACQUISITION_DESCRIPTOR: PackagedLeafImplementationDescriptor;
export declare function prepareNativeWorksiteCommandReacquisition(input: unknown, occurrence: LeafExecutionOccurrence, _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations, historicalSource?: AbgHistoricalGraphCallSourceResource): Promise<Readonly<LeafRealizationCandidate>>;
