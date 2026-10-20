import { isNonEmptyString } from "./admission_predicates.js";
import { isSha256Digest, sha256Canonical, } from "./digests.js";
import { deepFreeze } from "./immutable.js";
function hasExactKeys(value, expected) {
    const actual = Object.keys(value).sort();
    const canonicalExpected = [...expected].sort();
    return actual.length === canonicalExpected.length &&
        actual.every((key, index) => key === canonicalExpected[index]);
}
export function isExactOperationDefinitionCoordinate(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    return hasExactKeys(candidate, [
        "operationId",
        "memberKey",
        "definitionDigest",
    ]) &&
        isNonEmptyString(candidate.operationId) &&
        isNonEmptyString(candidate.memberKey) &&
        isSha256Digest(candidate.definitionDigest);
}
export function matchesExactOperationDefinitionCoordinate(value, expected) {
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
export function constructExactOperationInvocationCoordinate(definition, invocationRef, invocationPayloadDigest) {
    if (!isExactOperationDefinitionCoordinate(definition) ||
        !isNonEmptyString(invocationRef) ||
        !isSha256Digest(invocationPayloadDigest)) {
        throw new TypeError("an exact operation invocation requires one selected definition and payload digest");
    }
    const invocationDigest = sha256Canonical({
        operationId: definition.operationId,
        memberKey: definition.memberKey,
        definitionDigest: definition.definitionDigest,
        invocationRef,
        invocationPayloadDigest,
    });
    return deepFreeze({
        ...definition,
        invocationRef,
        invocationPayloadDigest,
        invocationDigest,
    });
}
export function isExactOperationInvocationCoordinate(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    if (!hasExactKeys(candidate, [
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
        !isSha256Digest(candidate.invocationDigest)) {
        return false;
    }
    return candidate.invocationDigest === sha256Canonical({
        operationId: candidate.operationId,
        memberKey: candidate.memberKey,
        definitionDigest: candidate.definitionDigest,
        invocationRef: candidate.invocationRef,
        invocationPayloadDigest: candidate.invocationPayloadDigest,
    });
}
