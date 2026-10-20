import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafRealizationCandidate, LeafExecutionOccurrence, NativeLeafProofOperations } from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
export declare const SELF_CONFORMANCE_IMPLEMENTATION_DESCRIPTOR: Readonly<PackagedLeafImplementationDescriptor>;
/** A successfully evaluated non-green gate is an ordinary native result, never a qualification verdict. */
export declare function realizeSelfConformance(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>, _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations): Readonly<LeafRealizationCandidate>;
