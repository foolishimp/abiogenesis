import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate } from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
export declare const SEMANTIC_JOB_INTAKE_IMPLEMENTATION_DESCRIPTOR: Readonly<PackagedLeafImplementationDescriptor>;
export declare const REQUIREMENT_HANDOFF_IMPLEMENTATION_DESCRIPTOR: Readonly<PackagedLeafImplementationDescriptor>;
export declare function realizeRequirementHandoff(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate>;
export declare function realizeSemanticJobIntake(input: Readonly<Record<string, JsonValue>>, occurrence: Readonly<LeafExecutionOccurrence>): Readonly<LeafRealizationCandidate>;
