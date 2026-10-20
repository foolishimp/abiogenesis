import type { GraphFunction, GtlGraph } from "../gtl/contracts.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ProgramValidation, type StaticValidationRefusal } from "./validation.js";
export interface GraphValidationBasis {
    readonly invocationAdmissionRef: string;
    readonly admittedInputRef: string;
    readonly admittedInputDigest: Sha256Digest;
    readonly admittedInput: Readonly<Record<string, JsonValue>>;
}
export interface GraphValidation {
    readonly kind: "graph_validation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "valid";
    readonly validationRef: string;
    readonly validationDigest: Sha256Digest;
    readonly graphRef: string;
    readonly graphDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly invocationAdmissionRef: string;
    readonly admittedInputRef: string;
    readonly admittedInputDigest: Sha256Digest;
    readonly diagnostics: readonly [];
}
export type GraphValidationResult = GraphValidation | StaticValidationRefusal;
export declare function isGraphValidation(value: object): boolean;
export declare function validateGraph(graph: Readonly<GtlGraph>, programValidation: ProgramValidation, graphFunction: Readonly<GraphFunction>, basis: GraphValidationBasis): GraphValidationResult;
