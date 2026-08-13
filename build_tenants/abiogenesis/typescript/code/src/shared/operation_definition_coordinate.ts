import type { JsonValue } from "./canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "./digests.js";
import { deepFreeze } from "./immutable.js";

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

export interface ExactOperationInvocationCoordinate
  extends ExactOperationDefinitionCoordinate {
  readonly invocationRef: string;
  readonly invocationPayloadDigest: Sha256Digest;
  readonly invocationDigest: Sha256Digest;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length &&
    actual.every((key, index) => key === canonicalExpected[index]);
}

export function isExactOperationDefinitionCoordinate(
  value: unknown,
): value is ExactOperationDefinitionCoordinate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return hasExactKeys(candidate, [
      "operationId",
      "memberKey",
      "definitionDigest",
    ]) &&
    isNonEmptyString(candidate.operationId) &&
    isNonEmptyString(candidate.memberKey) &&
    isSha256Digest(candidate.definitionDigest);
}

export function matchesExactOperationDefinitionCoordinate(
  value: unknown,
  expected: ExactOperationDefinitionCoordinate,
): value is ExactOperationDefinitionCoordinate {
  return isExactOperationDefinitionCoordinate(value) &&
    value.operationId === expected.operationId &&
    value.memberKey === expected.memberKey &&
    value.definitionDigest === expected.definitionDigest;
}

/**
 * Binds one invocation to the complete selected definition coordinate. This
 * digest cannot make a definition authoritative; it only preserves the
 * already-selected coordinate in the invocation identity.
 */
export function constructExactOperationInvocationCoordinate(
  definition: ExactOperationDefinitionCoordinate,
  invocationRef: string,
  invocationPayloadDigest: Sha256Digest,
): ExactOperationInvocationCoordinate {
  if (
    !isExactOperationDefinitionCoordinate(definition) ||
    !isNonEmptyString(invocationRef) ||
    !isSha256Digest(invocationPayloadDigest)
  ) {
    throw new TypeError(
      "an exact operation invocation requires one selected definition and payload digest",
    );
  }
  const invocationDigest = sha256Canonical({
    operationId: definition.operationId,
    memberKey: definition.memberKey,
    definitionDigest: definition.definitionDigest,
    invocationRef,
    invocationPayloadDigest,
  } as JsonValue);
  return deepFreeze({
    ...definition,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest,
  });
}

export function isExactOperationInvocationCoordinate(
  value: unknown,
): value is ExactOperationInvocationCoordinate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  if (
    !hasExactKeys(candidate, [
      "operationId",
      "memberKey",
      "definitionDigest",
      "invocationRef",
      "invocationPayloadDigest",
      "invocationDigest",
    ]) ||
    !isNonEmptyString(candidate.operationId) ||
    !isNonEmptyString(candidate.memberKey) ||
    !isSha256Digest(candidate.definitionDigest) ||
    !isNonEmptyString(candidate.invocationRef) ||
    !isSha256Digest(candidate.invocationPayloadDigest) ||
    !isSha256Digest(candidate.invocationDigest)
  ) {
    return false;
  }
  return candidate.invocationDigest === sha256Canonical({
    operationId: candidate.operationId,
    memberKey: candidate.memberKey,
    definitionDigest: candidate.definitionDigest,
    invocationRef: candidate.invocationRef,
    invocationPayloadDigest: candidate.invocationPayloadDigest,
  } as JsonValue);
}
