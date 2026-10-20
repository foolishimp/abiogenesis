import { type Sha256Digest } from "./digests.js";
/**
 * The exact coordinate selected from the one intrinsic Public definition
 * family. The digest is supplied by that selected definition; this module
 * deliberately does not mint it from the operation or member names.
 */
export interface ExactOperationDefinitionCoordinate {
    readonly operationId: string;
    readonly memberKey: string;
    readonly definitionDigest: Sha256Digest;
}
export interface ExactOperationInvocationCoordinate extends ExactOperationDefinitionCoordinate {
    readonly invocationRef: string;
    readonly invocationPayloadDigest: Sha256Digest;
    readonly invocationDigest: Sha256Digest;
}
export declare function isExactOperationDefinitionCoordinate(value: unknown): value is ExactOperationDefinitionCoordinate;
export declare function matchesExactOperationDefinitionCoordinate(value: unknown, expected: ExactOperationDefinitionCoordinate): value is ExactOperationDefinitionCoordinate;
/**
 * Binds one invocation to the complete selected definition coordinate. This
 * digest cannot make a definition authoritative; it only preserves the
 * already-selected coordinate in the invocation identity.
 */
export declare function constructExactOperationInvocationCoordinate(definition: ExactOperationDefinitionCoordinate, invocationRef: string, invocationPayloadDigest: Sha256Digest): ExactOperationInvocationCoordinate;
export declare function isExactOperationInvocationCoordinate(value: unknown): value is ExactOperationInvocationCoordinate;
