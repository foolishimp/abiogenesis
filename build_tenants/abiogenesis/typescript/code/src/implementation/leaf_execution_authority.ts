import { validateDurablePrefixCoordinate } from "../abg/event_store.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import type { LeafExecutionAuthority } from "./contracts.js";

type LeafExecutionAuthorityBody = Omit<
  LeafExecutionAuthority,
  "kind" | "schemaVersion" | "authorityRef" | "authorityDigest"
>;

const LEAF_EXECUTION_AUTHORITY_FIELDS = Object.freeze([
  "actorRef",
  "authorityDigest",
  "authorityRef",
  "cCallDigest",
  "cCallRef",
  "cCall",
  "capabilityGrantDigest",
  "capabilityGrantRef",
  "effectUri",
  "executionBasisDigest",
  "executionBasisRef",
  "graphFunctionDigest",
  "graphFunctionRef",
  "handlerDigest",
  "handlerRef",
  "implementationBindingDigest",
  "implementationBindingRef",
  "implementationOwnerRef",
  "implementationRef",
  "implementationResolution",
  "implementationResolutionDigest",
  "implementationResolutionRef",
  "implementationSetDigest",
  "implementationSetRef",
  "implementationSet",
  "kind",
  "leafResolutionCandidateDigest",
  "leafResolutionCandidateRef",
  "programDigest",
  "programRef",
  "predecessorPrefix",
  "schemaVersion",
  "workspaceBindingDigest",
  "workspaceBindingIdentity",
  "workspaceBinding",
  "executionBasis",
] as const);

const ADMITTED_IMPLEMENTATION_RESOLUTION_FIELDS = Object.freeze([
  "catalogBasisDigest",
  "catalogViewDigest",
  "computeRegime",
  "disposition",
  "failureContractRef",
  "graphFunctionDigest",
  "graphFunctionOwnerProductId",
  "graphFunctionPublicationDigest",
  "graphFunctionRef",
  "implementationBindingDigest",
  "implementationBindingRef",
  "implementationDescriptorDigest",
  "implementationOwnerProductId",
  "implementationPublicationDigest",
  "implementationRef",
  "inputContractRef",
  "kind",
  "leafResolutionCandidateDigest",
  "leafResolutionCandidateRef",
  "modulePath",
  "namedSymbol",
  "nodeRef",
  "outputContractRef",
  "packageName",
  "packageVersion",
  "programLocusRef",
  "programValidationRef",
  "publicationDigest",
  "refusalContractRef",
  "requirementKey",
  "requirementKeyDigest",
  "schemaVersion",
] as const);

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactDataFields(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
): boolean {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string")) return false;
  const actual = (keys as string[]).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]) &&
    actual.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined &&
        Object.hasOwn(descriptor, "value") &&
        descriptor.enumerable === true;
    });
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    !value.includes("\0");
}

function leafExecutionAuthorityBody(
  value: LeafExecutionAuthority,
): LeafExecutionAuthorityBody {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    authorityRef: _authorityRef,
    authorityDigest: _authorityDigest,
    ...body
  } = value;
  return body;
}

function isExactAdmittedImplementationResolution(value: unknown): boolean {
  if (
    !isRecord(value) ||
    !hasExactDataFields(value, ADMITTED_IMPLEMENTATION_RESOLUTION_FIELDS) ||
    value.kind !== "admitted_implementation_resolution_row" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "admitted" ||
    (value.computeRegime !== "F_D" && value.computeRegime !== "F_P")
  ) return false;
  const stringFields = [
    value.leafResolutionCandidateRef,
    value.requirementKey,
    value.catalogBasisDigest,
    value.catalogViewDigest,
    value.programValidationRef,
    value.graphFunctionRef,
    value.graphFunctionOwnerProductId,
    value.nodeRef,
    value.programLocusRef,
    value.implementationBindingRef,
    value.implementationRef,
    value.packageName,
    value.packageVersion,
    value.modulePath,
    value.namedSymbol,
    value.inputContractRef,
    value.outputContractRef,
    value.failureContractRef,
    value.refusalContractRef,
    value.implementationOwnerProductId,
  ];
  const digestFields = [
    value.leafResolutionCandidateDigest,
    value.requirementKeyDigest,
    value.publicationDigest,
    value.graphFunctionDigest,
    value.graphFunctionPublicationDigest,
    value.implementationBindingDigest,
    value.implementationDescriptorDigest,
    value.implementationPublicationDigest,
  ];
  if (
    !stringFields.every(nonEmptyString) ||
    !digestFields.every(isSha256Digest)
  ) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    leafResolutionCandidateRef: _candidateRef,
    leafResolutionCandidateDigest: _candidateDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.leafResolutionCandidateDigest === digest &&
    value.leafResolutionCandidateRef ===
      `leaf-resolution-candidate://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function constructLeafExecutionAuthority(
  body: Readonly<LeafExecutionAuthorityBody>,
): Readonly<LeafExecutionAuthority> {
  const authorityDigest = sha256Canonical(body as unknown as JsonValue);
  const authority = deepFreeze({
    kind: "leaf_execution_authority" as const,
    schemaVersion: "5.0.0" as const,
    authorityRef:
      `leaf-execution-authority://abiogenesis/${authorityDigest.slice("sha256:".length)}`,
    authorityDigest,
    ...body,
  });
  if (!isLeafExecutionAuthority(authority)) {
    throw new TypeError("leaf execution authority is not a closed exact carrier");
  }
  return authority;
}

export function isLeafExecutionAuthority(
  value: unknown,
): value is Readonly<LeafExecutionAuthority> {
  try {
    if (
      !isRecord(value) ||
      !hasExactDataFields(value, LEAF_EXECUTION_AUTHORITY_FIELDS) ||
      value.kind !== "leaf_execution_authority" ||
      value.schemaVersion !== "5.0.0" ||
      !nonEmptyString(value.authorityRef) ||
      !isSha256Digest(value.authorityDigest) ||
      !nonEmptyString(value.actorRef) ||
      !isRecord(value.workspaceBinding) ||
      value.workspaceBinding.kind !== "workspace_binding" ||
      value.workspaceBinding.bindingId !== value.workspaceBindingIdentity ||
      value.workspaceBinding.bindingDigest !== value.workspaceBindingDigest ||
      !nonEmptyString(value.workspaceBindingIdentity) ||
      !isSha256Digest(value.workspaceBindingDigest) ||
      !isRecord(value.executionBasis) ||
      value.executionBasis.kind !== "execution_basis" ||
      value.executionBasis.basisRef !== value.executionBasisRef ||
      value.executionBasis.basisDigest !== value.executionBasisDigest ||
      !nonEmptyString(value.executionBasisRef) ||
      !isSha256Digest(value.executionBasisDigest) ||
      !nonEmptyString(value.programRef) ||
      !isSha256Digest(value.programDigest) ||
      !nonEmptyString(value.graphFunctionRef) ||
      !isSha256Digest(value.graphFunctionDigest) ||
      !nonEmptyString(value.cCallRef) ||
      !isSha256Digest(value.cCallDigest) ||
      !isRecord(value.cCall) ||
      value.cCall.kind !== "c_call" ||
      value.cCall.cCallRef !== value.cCallRef ||
      value.cCall.cCallDigest !== value.cCallDigest ||
      !validateDurablePrefixCoordinate(value.predecessorPrefix) ||
      !nonEmptyString(value.implementationSetRef) ||
      !isSha256Digest(value.implementationSetDigest) ||
      !isRecord(value.implementationSet) ||
      value.implementationSet.kind !== "admitted_implementation_set" ||
      value.implementationSet.implementationSetRef !== value.implementationSetRef ||
      value.implementationSet.implementationSetDigest !== value.implementationSetDigest ||
      !Array.isArray(value.implementationSet.rows) ||
      !nonEmptyString(value.leafResolutionCandidateRef) ||
      !isSha256Digest(value.leafResolutionCandidateDigest) ||
      !nonEmptyString(value.implementationResolutionRef) ||
      !isSha256Digest(value.implementationResolutionDigest) ||
      !isExactAdmittedImplementationResolution(value.implementationResolution) ||
      !nonEmptyString(value.implementationBindingRef) ||
      !isSha256Digest(value.implementationBindingDigest) ||
      !nonEmptyString(value.implementationRef) ||
      !nonEmptyString(value.implementationOwnerRef) ||
      value.effectUri !== "effect://abiogenesis/worksite/file.replace/v1" ||
      value.handlerRef !==
        "handler://abiogenesis/product/worksite/file.replace/v1" ||
      !isSha256Digest(value.handlerDigest) ||
      !nonEmptyString(value.capabilityGrantRef) ||
      !isSha256Digest(value.capabilityGrantDigest)
    ) {
      return false;
    }
    const authority = value as unknown as LeafExecutionAuthority;
    const digest = sha256Canonical(
      leafExecutionAuthorityBody(authority) as unknown as JsonValue,
    );
    const resolutionDigest = sha256Canonical(
      authority.implementationResolution as unknown as JsonValue,
    );
    const resolutionMatches = authority.implementationSet.rows.filter((row) =>
      sha256Canonical(row as unknown as JsonValue) === resolutionDigest
    );
    return authority.authorityDigest === digest &&
      authority.authorityRef ===
        `leaf-execution-authority://abiogenesis/${digest.slice("sha256:".length)}` &&
      authority.implementationResolutionDigest === resolutionDigest &&
      authority.implementationResolutionRef ===
        `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}` &&
      resolutionMatches.length === 1 &&
      authority.implementationResolution.leafResolutionCandidateRef ===
        authority.leafResolutionCandidateRef &&
      authority.implementationResolution.leafResolutionCandidateDigest ===
        authority.leafResolutionCandidateDigest &&
      authority.implementationResolution.implementationBindingRef ===
        authority.implementationBindingRef &&
      authority.implementationResolution.implementationBindingDigest ===
        authority.implementationBindingDigest &&
      authority.implementationResolution.implementationRef ===
        authority.implementationRef &&
      authority.implementationResolution.implementationOwnerProductId ===
        authority.implementationOwnerRef &&
      isDeeplyFrozen(authority);
  } catch {
    return false;
  }
}
