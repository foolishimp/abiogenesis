import type {
  ComputeRegime,
  GtlProgram,
} from "../gtl/contracts.js";
import {
  isRawAdmittedValue,
  type RawAdmittedValue,
} from "../validator/raw_admission.js";
import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import type { AdmittedPublicInvocation } from "../shared/public_invocation.js";
import type { ExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import {
  lookupGraphFunction,
  type DeclarationApplication,
  type GraphFunctionCatalogEntry,
  type GraphFunctionCatalogView,
} from "./catalog.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import {
  constructProductSet,
  isWorkspaceAuthorityBasis,
  isProductSet,
  isResolvedProductLock,
  isWorkspaceBindingCandidate,
  type ProductInstall,
  type WorkspaceAuthorityBasis,
  type WorkspaceBinding,
} from "./environment.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admitRuntimeContract,
  publicContractCoordinateSchema,
  type OwnerContractSourceDeclaration,
} from "../shared/public_function_contracts.js";
import {
  selectIntrinsicPublicFunctionDefinition,
  type IntrinsicPublicFunctionDefinition,
} from "../shared/public_function_family.js";

export const DIRECT_INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";

import {
  isCapabilityDefinitionGraph,
  type CapabilityDefinitionGraph,
} from "../shared/capability_contracts.js";
import type {
  PublicContractCoordinate,
  PublicDefinitionKeyLike,
  ReferenceDigest,
} from "../shared/public_invocation.js";

export type RunInvocationVariant = "direct" | "start";
export type CapabilityOperationId = PublicDefinitionKeyLike["operationId"];

export interface InvocationInteractionCapability {
  readonly requirementKey: string;
  readonly requirementKeyDigest: Sha256Digest;
  readonly actorCapabilityRef: string;
}

export interface InvocationPolicyBasis {
  readonly kind: "invocation_policy_basis";
  readonly schemaVersion: "5.0.0";
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly authorityMode: "trusted_developer";
  readonly authorityBasisId: string;
  readonly authorityBasisDigest: Sha256Digest;
  readonly authorizedActorRef: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly allowedComputeRegimes: readonly ComputeRegime[];
  readonly interactionCapabilities: readonly InvocationInteractionCapability[];
  readonly catalogApplicationRefs: readonly string[];
  readonly catalogApplicationDigests: readonly Sha256Digest[];
  readonly graphMaterialization: "after_invocation_admission";
}

export interface CapabilityGrant {
  readonly kind: "capability_grant";
  readonly schemaVersion: "5.0.0";
  readonly grantRef: string;
  readonly grantDigest: Sha256Digest;
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly definitionRef: string;
  readonly definitionDigest: Sha256Digest;
  readonly capabilityDefinition: CapabilityDefinitionCoordinate;
  readonly operationContract: PublicContractCoordinate;
  readonly operationId: CapabilityOperationId;
  readonly capabilityRef: string;
  readonly actorRef: string;
  readonly approvalRef: string;
  readonly approvalDigest: Sha256Digest;
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly scopeRef: string;
  readonly scopeDigest: Sha256Digest;
  readonly authorityBasisRef: string;
  readonly authorityBasisDigest: Sha256Digest;
}

export interface CapabilityDefinitionCoordinate {
  readonly graphId: string;
  readonly graphVersion: "5.0.0";
  readonly graphDigest: Sha256Digest;
  readonly capabilityId: string;
  readonly capabilityDefinitionRef: string;
  readonly capabilityDefinitionDigest: Sha256Digest;
}

export type CapabilityGrantConstructionBasis =
  | {
      readonly kind: "prebinding_development_product_basis";
      readonly fixedPacket: OwnerContractSourceDeclaration;
      readonly predecessorEnvironment: ExactPrefixWorkspaceEnvironment;
      readonly request: ReferenceDigest<unknown>;
    }
  | {
      readonly admittedInstalls: readonly ProductInstall[];
      readonly workspaceBinding: WorkspaceBinding;
      readonly fixedPacket: OwnerContractSourceDeclaration;
    };

export interface DevelopmentSuccessorActorAttribution {
  readonly actor: ReferenceDigest<"Actor">;
  readonly attribution: ReferenceDigest<"ActorAttribution">;
}

export interface InvocationAuthority {
  readonly kind: "invocation_authority";
  readonly schemaVersion: "5.0.0";
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
  readonly actorRef: string;
  readonly operationId: "abg.operation.run.invoke";
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogBasisDigest: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly catalogHandle: string;
  readonly selectedDefinitionRef: string;
  readonly selectedDefinitionDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly capabilityGrantRefs: readonly string[];
}

export interface PublicInvocationCandidate {
  readonly kind: "public_invocation_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly operationId: "abg.operation.run.invoke";
  readonly variant: RunInvocationVariant;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly publicFunctionDefinitionRef: string;
  readonly publicFunctionDefinitionDigest: Sha256Digest;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogBasisDigest: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly catalogHandle: string;
  readonly selectedDefinitionRef: string;
  readonly selectedDefinitionDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly rawInputAdmissionRef: string;
  readonly rawInputDigest: Sha256Digest;
  readonly publicRequestAdmissionRef: string;
  readonly publicRequestDigest: Sha256Digest;
  readonly publicRequestInvocationRef: string;
  readonly sessionPolicyRef: string;
  readonly sessionPolicyDigest: Sha256Digest;
  readonly capabilityGrantRefs: readonly string[];
  readonly capabilityGrantDigests: readonly Sha256Digest[];
  readonly invocationAuthorityRef: string;
  readonly invocationAuthorityDigest: Sha256Digest;
  readonly actorAttributionRef: string;
}

export interface InvocationConstructionRefusal {
  readonly kind: "invocation_construction_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "authority_mismatch" | "capability_mismatch" | "contract_mismatch";
  readonly message: string;
}

export interface ExactDirectRunInvocationRequest
  extends Readonly<Record<string, JsonValue>> {
  readonly program: Readonly<{ readonly ref: string; readonly digest: Sha256Digest }>;
  readonly catalogHandle: string;
  readonly inputContract: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly input: JsonValue;
  readonly catalogView: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly allowlist: readonly string[];
  readonly sourceBasis: Readonly<Record<string, JsonValue>>;
}

export type ExactDirectRunInvocation = AdmittedPublicInvocation<
  Readonly<{
    readonly operationId: "abg.operation.run.invoke";
    readonly memberKey: "invoke";
  }>,
  ExactDirectRunInvocationRequest
>;

export interface ExactStartRunInvocationRequest
  extends Readonly<Record<string, JsonValue>> {
  readonly program: Readonly<{ readonly ref: string; readonly digest: Sha256Digest }>;
  readonly scope: "program";
  readonly target: Readonly<Record<string, JsonValue>>;
  readonly until: "converged";
  readonly catalogView: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly allowlist: readonly string[];
  readonly input: Readonly<{
    readonly contract: Readonly<{
      readonly ref: string;
      readonly digest: Sha256Digest;
    }>;
    readonly valueRef: string;
    readonly valueDigest: Sha256Digest;
    readonly value: JsonValue;
  }>;
  readonly fhMode: "direct" | "human-proxy";
  readonly rootMode: "direct" | "supervised";
  readonly sourceBasis: Readonly<Record<string, JsonValue>>;
}

export type ExactStartRunInvocation = AdmittedPublicInvocation<
  Readonly<{
    readonly operationId: "abg.operation.run.invoke";
    readonly memberKey: "start";
  }>,
  ExactStartRunInvocationRequest
>;

interface PublicRequestAdmissionCoordinates {
  readonly admissionRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly invocationRef: string;
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueStrings(value: unknown): value is readonly string[] {
  return Array.isArray(value) &&
    value.every(nonEmptyString) &&
    new Set(value).size === value.length;
}

export function isInvocationPolicyBasis(
  value: unknown,
): value is InvocationPolicyBasis {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "allowedComputeRegimes",
      "authorityBasisDigest",
      "authorityBasisId",
      "authorityMode",
      "authorizedActorRef",
      "catalogApplicationDigests",
      "catalogApplicationRefs",
      "graphMaterialization",
      "interactionCapabilities",
      "kind",
      "policyDigest",
      "policyRef",
      "programDigest",
      "programRef",
      "schemaVersion",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    value.kind !== "invocation_policy_basis" ||
    value.schemaVersion !== "5.0.0" ||
    value.authorityMode !== "trusted_developer" ||
    !nonEmptyString(value.policyRef) ||
    !isSha256Digest(value.policyDigest) ||
    !nonEmptyString(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) ||
    !nonEmptyString(value.authorizedActorRef) ||
    !nonEmptyString(value.workspaceBindingId) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !nonEmptyString(value.programRef) ||
    !isSha256Digest(value.programDigest) ||
    !Array.isArray(value.allowedComputeRegimes) ||
    value.allowedComputeRegimes.length === 0 ||
    value.allowedComputeRegimes.some(
      (regime) => regime !== "F_D" && regime !== "F_P" && regime !== "F_H",
    ) ||
    value.allowedComputeRegimes.join("\0") !==
      (["F_D", "F_P", "F_H"] as const)
        .filter((regime) =>
          (value.allowedComputeRegimes as readonly unknown[]).includes(regime)
        )
        .join("\0") ||
    !Array.isArray(value.interactionCapabilities) ||
    value.interactionCapabilities.some((row) =>
      !isRecord(row) ||
      !hasExactKeys(row, [
        "actorCapabilityRef",
        "requirementKey",
        "requirementKeyDigest",
      ]) ||
      !nonEmptyString(row.requirementKey) ||
      !isSha256Digest(row.requirementKeyDigest) ||
      !nonEmptyString(row.actorCapabilityRef)
    ) ||
    new Set(value.interactionCapabilities.map((row) =>
      (row as Readonly<Record<string, unknown>>).requirementKey
    )).size !== value.interactionCapabilities.length ||
    value.interactionCapabilities.map((row) =>
      (row as Readonly<Record<string, unknown>>).requirementKey as string
    ).join("\0") !== [...value.interactionCapabilities]
      .map((row) =>
        (row as Readonly<Record<string, unknown>>).requirementKey as string
      )
      .sort(compareUnicodeCodeUnits)
      .join("\0") ||
    !uniqueStrings(value.catalogApplicationRefs) ||
    value.catalogApplicationRefs.join("\0") !==
      [...value.catalogApplicationRefs]
        .sort(compareUnicodeCodeUnits)
        .join("\0") ||
    !Array.isArray(value.catalogApplicationDigests) ||
    value.catalogApplicationDigests.length !==
      value.catalogApplicationRefs.length ||
    value.catalogApplicationDigests.some((digest) => !isSha256Digest(digest)) ||
    value.graphMaterialization !== "after_invocation_admission"
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    policyRef,
    policyDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return policyDigest === digest &&
    policyRef === identity("invocation-policy://abiogenesis/root", digest);
}

export function isCapabilityGrant(value: unknown): value is CapabilityGrant {
  return isCapabilityGrantValue(value);
}

export function isInvocationAuthority(
  value: unknown,
): value is InvocationAuthority {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "actorRef",
      "authorityDigest",
      "authorityRef",
      "capabilityGrantRefs",
      "catalogBasisDigest",
      "catalogHandle",
      "catalogViewDigest",
      "graphFunctionRef",
      "kind",
      "operationId",
      "policyDigest",
      "policyRef",
      "programRef",
      "selectedDefinitionDigest",
      "selectedDefinitionRef",
      "schemaVersion",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    value.kind !== "invocation_authority" ||
    value.schemaVersion !== "5.0.0" ||
    value.operationId !== "abg.operation.run.invoke" ||
    !nonEmptyString(value.authorityRef) ||
    !isSha256Digest(value.authorityDigest) ||
    !nonEmptyString(value.actorRef) ||
    !nonEmptyString(value.workspaceBindingId) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !isSha256Digest(value.catalogBasisDigest) ||
    !isSha256Digest(value.catalogViewDigest) ||
    !nonEmptyString(value.programRef) ||
    !nonEmptyString(value.catalogHandle) ||
    !nonEmptyString(value.selectedDefinitionRef) ||
    !isSha256Digest(value.selectedDefinitionDigest) ||
    !nonEmptyString(value.graphFunctionRef) ||
    !nonEmptyString(value.policyRef) ||
    !isSha256Digest(value.policyDigest) ||
    !uniqueStrings(value.capabilityGrantRefs)
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    authorityRef,
    authorityDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return authorityDigest === digest &&
    authorityRef === identity("invocation-authority://abiogenesis", digest);
}

export function isPublicInvocationCandidate(
  value: unknown,
): value is PublicInvocationCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "actorAttributionRef",
      "capabilityGrantDigests",
      "capabilityGrantRefs",
      "catalogBasisDigest",
      "catalogHandle",
      "catalogViewDigest",
      "disposition",
      "graphFunctionDigest",
      "graphFunctionRef",
      "inputContractRef",
      "invocationAuthorityDigest",
      "invocationAuthorityRef",
      "invocationDigest",
      "invocationRef",
      "kind",
      "operationId",
      "outputContractRef",
      "programDigest",
      "programRef",
      "publicFunctionDefinitionDigest",
      "publicFunctionDefinitionRef",
      "publicRequestAdmissionRef",
      "publicRequestDigest",
      "publicRequestInvocationRef",
      "rawInputAdmissionRef",
      "rawInputDigest",
      "schemaVersion",
      "selectedDefinitionDigest",
      "selectedDefinitionRef",
      "sessionPolicyDigest",
      "sessionPolicyRef",
      "variant",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    value.kind !== "public_invocation_candidate" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "candidate" ||
    value.operationId !== "abg.operation.run.invoke" ||
    (value.variant !== "direct" && value.variant !== "start") ||
    !nonEmptyString(value.invocationRef) ||
    !isSha256Digest(value.invocationDigest) ||
    !nonEmptyString(value.publicFunctionDefinitionRef) ||
    !isSha256Digest(value.publicFunctionDefinitionDigest) ||
    !nonEmptyString(value.workspaceBindingId) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !isSha256Digest(value.catalogBasisDigest) ||
    !isSha256Digest(value.catalogViewDigest) ||
    !nonEmptyString(value.programRef) ||
    !isSha256Digest(value.programDigest) ||
    !nonEmptyString(value.catalogHandle) ||
    !nonEmptyString(value.selectedDefinitionRef) ||
    !isSha256Digest(value.selectedDefinitionDigest) ||
    !nonEmptyString(value.graphFunctionRef) ||
    !isSha256Digest(value.graphFunctionDigest) ||
    !nonEmptyString(value.inputContractRef) ||
    !nonEmptyString(value.outputContractRef) ||
    !nonEmptyString(value.rawInputAdmissionRef) ||
    !isSha256Digest(value.rawInputDigest) ||
    !nonEmptyString(value.publicRequestAdmissionRef) ||
    !isSha256Digest(value.publicRequestDigest) ||
    !nonEmptyString(value.publicRequestInvocationRef) ||
    !nonEmptyString(value.sessionPolicyRef) ||
    !isSha256Digest(value.sessionPolicyDigest) ||
    !uniqueStrings(value.capabilityGrantRefs) ||
    !Array.isArray(value.capabilityGrantDigests) ||
    value.capabilityGrantDigests.length !== value.capabilityGrantRefs.length ||
    value.capabilityGrantDigests.some((digest) => !isSha256Digest(digest)) ||
    !nonEmptyString(value.invocationAuthorityRef) ||
    !isSha256Digest(value.invocationAuthorityDigest) ||
    !nonEmptyString(value.actorAttributionRef)
  ) {
    return false;
  }
  const expectedDefinitionDigest = sha256Canonical({
    operationId: "abg.operation.run.invoke",
    variant: value.variant,
    schemaVersion: "5.0.0",
  });
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    invocationRef,
    invocationDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.publicFunctionDefinitionDigest === expectedDefinitionDigest &&
    value.publicFunctionDefinitionRef ===
      `public-function://abiogenesis/run.invoke/${value.variant}@5` &&
    invocationDigest === digest &&
    invocationRef === identity("invocation://abiogenesis", digest);
}

function refusal(
  code: InvocationConstructionRefusal["code"],
  message: string,
): InvocationConstructionRefusal {
  return {
    kind: "invocation_construction_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

export function constructRootInvocationPolicy(
  workspaceBinding: WorkspaceBinding,
  program: Readonly<GtlProgram>,
  interactionCapabilities: readonly InvocationInteractionCapability[],
  allowedComputeRegimes: readonly ComputeRegime[] = ["F_D"],
  catalogApplications: readonly DeclarationApplication[] = [],
): InvocationPolicyBasis {
  const canonicalOrder: readonly ComputeRegime[] = ["F_D", "F_P", "F_H"];
  const canonicalRegimes = canonicalOrder.filter((regime) =>
    allowedComputeRegimes.includes(regime)
  );
  const canonicalInteractions = [...interactionCapabilities].sort((left, right) =>
    compareUnicodeCodeUnits(left.requirementKey, right.requirementKey)
  );
  const canonicalApplications = [...catalogApplications].sort((left, right) =>
    compareUnicodeCodeUnits(left.applicationRef, right.applicationRef)
  );
  if (
    canonicalRegimes.length === 0 ||
    canonicalRegimes.length !== allowedComputeRegimes.length ||
    canonicalRegimes.some((regime, index) => regime !== allowedComputeRegimes[index]) ||
    workspaceBinding.authorityBasisId.length === 0 ||
    workspaceBinding.authorityBasisDigest.length === 0 ||
    workspaceBinding.authorizedActorRef.length === 0 ||
    workspaceBinding.bindingId.length === 0 ||
    workspaceBinding.bindingDigest.length === 0 ||
    program.programRef.length === 0 ||
    new Set(canonicalInteractions.map((row) => row.requirementKey)).size !==
      canonicalInteractions.length ||
    canonicalInteractions.some(
      (row) =>
        row.requirementKey.length === 0 ||
        row.requirementKeyDigest.length === 0 ||
        row.actorCapabilityRef.length === 0,
    ) ||
    new Set(canonicalApplications.map((row) => row.applicationRef)).size !==
      canonicalApplications.length
  ) {
    throw new TypeError(
      "invocation policy requires one exact workspace, Program, compute-regime set, and interaction requirement set",
    );
  }
  const body = {
    authorityMode: "trusted_developer" as const,
    authorityBasisId: workspaceBinding.authorityBasisId,
    authorityBasisDigest: workspaceBinding.authorityBasisDigest,
    authorizedActorRef: workspaceBinding.authorizedActorRef,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    programRef: program.programRef,
    programDigest: sha256Canonical(program as unknown as JsonValue),
    allowedComputeRegimes: canonicalRegimes,
    interactionCapabilities: canonicalInteractions,
    catalogApplicationRefs: canonicalApplications.map(
      (application) => application.applicationRef,
    ),
    catalogApplicationDigests: canonicalApplications.map(
      (application) => application.applicationDigest,
    ),
    graphMaterialization: "after_invocation_admission" as const,
  };
  const policyDigest = sha256Canonical(body as unknown as JsonValue);
  const value = deepFreeze({
    kind: "invocation_policy_basis" as const,
    schemaVersion: "5.0.0" as const,
    policyRef: identity("invocation-policy://abiogenesis/root", policyDigest),
    policyDigest,
    ...body,
  }) as InvocationPolicyBasis;
  return value;
}

export function isCapabilityGrantValue(value: unknown): value is CapabilityGrant {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "actorRef",
      "approvalDigest",
      "approvalRef",
      "authorityBasisDigest",
      "authorityBasisRef",
      "capabilityDefinition",
      "capabilityRef",
      "definitionDigest",
      "definitionKey",
      "definitionRef",
      "grantDigest",
      "grantRef",
      "kind",
      "operationContract",
      "operationId",
      "policyDigest",
      "policyRef",
      "schemaVersion",
      "scopeDigest",
      "scopeRef",
    ]) ||
    value.kind !== "capability_grant" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.grantRef) ||
    !isSha256Digest(value.grantDigest) ||
    !nonEmptyString(value.actorRef) ||
    !isRecord(value.definitionKey) ||
    !hasExactKeys(value.definitionKey, ["memberKey", "operationId"]) ||
    !nonEmptyString(value.definitionKey.operationId) ||
    !nonEmptyString(value.definitionKey.memberKey) ||
    !nonEmptyString(value.definitionRef) ||
    !isSha256Digest(value.definitionDigest) ||
    !isRecord(value.capabilityDefinition) ||
    !hasExactKeys(value.capabilityDefinition, [
      "capabilityDefinitionDigest",
      "capabilityDefinitionRef",
      "capabilityId",
      "graphDigest",
      "graphId",
      "graphVersion",
    ]) ||
    !nonEmptyString(value.capabilityDefinition.graphId) ||
    value.capabilityDefinition.graphVersion !== "5.0.0" ||
    !isSha256Digest(value.capabilityDefinition.graphDigest) ||
    !nonEmptyString(value.capabilityDefinition.capabilityId) ||
    !nonEmptyString(value.capabilityDefinition.capabilityDefinitionRef) ||
    !isSha256Digest(value.capabilityDefinition.capabilityDefinitionDigest) ||
    !isRecord(value.operationContract) ||
    admitRuntimeContract(publicContractCoordinateSchema, value.operationContract)
        .disposition !== "admitted" ||
    value.operationId !== value.definitionKey.operationId ||
    !nonEmptyString(value.capabilityRef) ||
    !nonEmptyString(value.approvalRef) ||
    !isSha256Digest(value.approvalDigest) ||
    !nonEmptyString(value.policyRef) ||
    !isSha256Digest(value.policyDigest) ||
    !nonEmptyString(value.scopeRef) ||
    !isSha256Digest(value.scopeDigest) ||
    !nonEmptyString(value.authorityBasisRef) ||
    !isSha256Digest(value.authorityBasisDigest)
  ) {
    return false;
  }
  const body = {
    definitionKey: value.definitionKey,
    definitionRef: value.definitionRef,
    definitionDigest: value.definitionDigest,
    capabilityDefinition: value.capabilityDefinition,
    operationContract: value.operationContract,
    operationId: value.operationId,
    capabilityRef: value.capabilityRef,
    actorRef: value.actorRef,
    approvalRef: value.approvalRef,
    approvalDigest: value.approvalDigest,
    policyRef: value.policyRef,
    policyDigest: value.policyDigest,
    scopeRef: value.scopeRef,
    scopeDigest: value.scopeDigest,
    authorityBasisRef: value.authorityBasisRef,
    authorityBasisDigest: value.authorityBasisDigest,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return (
    value.grantDigest === digest &&
    value.grantRef === identity("capability-grant://abiogenesis", digest)
  );
}

function isInvocationRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReferenceDigest(value: unknown): value is ReferenceDigest<unknown> {
  return isInvocationRecord(value) &&
    typeof value.ref === "string" &&
    value.ref.length > 0 &&
    isSha256Digest(value.digest);
}

function isPrebindingBasis(
  value: CapabilityGrantConstructionBasis | undefined,
): value is Extract<
  CapabilityGrantConstructionBasis,
  { readonly kind: "prebinding_development_product_basis" }
> {
  return value !== undefined &&
    "kind" in value &&
    value.kind === "prebinding_development_product_basis";
}

function isExactPrefixArtifactTruthProjection(
  environment: ExactPrefixWorkspaceEnvironment,
): boolean {
  const artifactTruth = environment.artifactTruth as unknown as Record<
    string,
    unknown
  >;
  if (
    artifactTruth.kind !== "exact_prefix_artifact_truth_projection" ||
    artifactTruth.schemaVersion !== "5.0.0" ||
    !isInvocationRecord(artifactTruth.prefix) ||
    !Number.isInteger(artifactTruth.prefixEventCount) ||
    (artifactTruth.prefixEventCount as number) < 0 ||
    !Number.isInteger(artifactTruth.lastAdmissionOrdinal) ||
    (artifactTruth.lastAdmissionOrdinal as number) < 0 ||
    !Array.isArray(artifactTruth.rows) ||
    typeof artifactTruth.projectionRef !== "string" ||
    artifactTruth.projectionRef.length === 0 ||
    !isSha256Digest(artifactTruth.projectionDigest) ||
    canonicalJson(artifactTruth.prefix as JsonValue) !==
      canonicalJson(environment.prefix as unknown as JsonValue)
  ) return false;
  const body = {
    kind: "exact_prefix_artifact_truth_projection" as const,
    schemaVersion: "5.0.0" as const,
    prefix: artifactTruth.prefix,
    prefixEventCount: artifactTruth.prefixEventCount,
    lastAdmissionOrdinal: artifactTruth.lastAdmissionOrdinal,
    rows: artifactTruth.rows,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return artifactTruth.projectionDigest === digest &&
    artifactTruth.projectionRef ===
      `artifact-truth-projection://abiogenesis/${digest.slice("sha256:".length)}`;
}

function isPrebindingEnvironment(
  value: unknown,
): value is ExactPrefixWorkspaceEnvironment {
  if (
    !isInvocationRecord(value) ||
    value.kind !== "exact_prefix_workspace_environment" ||
    value.schemaVersion !== "5.0.0"
  ) return false;
  const environment = value as unknown as ExactPrefixWorkspaceEnvironment;
  const authority = environment.workspaceAuthorityBasis;
  const binding = environment.workspaceBinding;
  const lock = environment.resolvedProductLock;
  const productSet = environment.productSet;
  const installs = environment.productInstalls;
  if (
    !isWorkspaceAuthorityBasis(authority) ||
    !isResolvedProductLock(lock) ||
    !Array.isArray(installs) ||
    installs.length === 0 ||
    installs.some((install) =>
      !isInvocationRecord(install) ||
      install.kind !== "product_install" ||
      install.disposition !== "admitted" ||
      typeof install.installId !== "string" ||
      install.installId.length === 0 ||
      typeof install.admissionEventRef !== "string" ||
      install.admissionEventRef.length === 0
    ) ||
    !isProductSet(productSet, lock) ||
    !isWorkspaceBindingCandidate(
      environment.workspaceBindingCandidate,
      lock,
      productSet,
      authority,
    ) ||
    !isInvocationRecord(binding) ||
    binding.kind !== "workspace_binding" ||
    binding.schemaVersion !== "5.0.0" ||
    typeof binding.admissionEventRef !== "string" ||
    binding.admissionEventRef.length === 0 ||
    binding.workspaceId !== authority.workspaceId ||
    binding.authorityBasisId !== authority.authorityBasisId ||
    binding.authorityBasisDigest !== authority.authorityBasisDigest ||
    binding.authorizedActorRef !== authority.authorizedActorRef
  ) return false;
  try {
    const {
      kind: _bindingKind,
      admissionEventRef: _admissionEventRef,
      ...bindingFields
    } = binding;
    const bindingCandidate = {
      kind: "workspace_binding_candidate" as const,
      ...bindingFields,
    };
    if (
      !isWorkspaceBindingCandidate(bindingCandidate, lock, productSet, authority) ||
      canonicalJson(bindingCandidate as unknown as JsonValue) !==
        canonicalJson(environment.workspaceBindingCandidate as unknown as JsonValue)
    ) return false;
    const reconstructedProductSet = constructProductSet(installs, lock);
    if (
      reconstructedProductSet.kind !== "product_set" ||
      canonicalJson(reconstructedProductSet as unknown as JsonValue) !==
        canonicalJson(productSet as unknown as JsonValue) ||
      !isExactPrefixArtifactTruthProjection(environment)
    ) return false;
    const artifactTruth = environment.artifactTruth;
    const bindingRows = artifactTruth.rows.filter((row) =>
      isInvocationRecord(row) &&
      row.operationId === "abg.operation.workspace.bind" &&
      row.authorityScopeRef === binding.bindingId &&
      row.authorityScopeDigest === binding.bindingDigest &&
      row.artifactRef === binding.bindingId &&
      row.artifactDigest === binding.bindingDigest &&
      canonicalJson(row.workspaceAuthorityBasis as JsonValue) ===
        canonicalJson(authority as unknown as JsonValue)
    );
    return bindingRows.length === 1;
  } catch {
    return false;
  }
}

function exactIntrinsicDefinition(
  fixedPacket: OwnerContractSourceDeclaration,
): IntrinsicPublicFunctionDefinition {
  const definition = selectIntrinsicPublicFunctionDefinition(
    fixedPacket.definitionKey,
  );
  if (
    definition === null ||
    definition.semanticAuthorityRef !== fixedPacket.owner.authorityRef ||
    definition.semanticAuthorityDigest !==
      fixedPacket.owner.authorityDigest ||
    definition.requestContract.contractId !==
      fixedPacket.contractIds.request ||
    definition.resultContract.contractId !==
      fixedPacket.contractIds.result ||
    definition.refusalContract.contractId !==
      fixedPacket.contractIds.refusal ||
    (definition.nonTerminalContract?.contractId ?? null) !==
      fixedPacket.contractIds.nonTerminal
  ) {
    throw new TypeError(
      "capability grant requires the selected intrinsic definition and fixed owner packet",
    );
  }
  return definition;
}

function isEligiblePrebindingDefinition(
  definition: IntrinsicPublicFunctionDefinition,
  fixedPacket: OwnerContractSourceDeclaration,
): boolean {
  return definition.successorDevelopmentPrebindingAuthority === "eligible" &&
    definition.workspaceBindingRequirement === "forbidden" &&
    fixedPacket.metadata.successorDevelopmentPrebindingAuthority ===
      "eligible" &&
    fixedPacket.metadata.workspaceBindingRequirement === "forbidden";
}

export function projectDevelopmentSuccessorActorAttribution(
  predecessorEnvironment: ExactPrefixWorkspaceEnvironment,
  fixedPacket: OwnerContractSourceDeclaration,
  request: ReferenceDigest<unknown>,
): DevelopmentSuccessorActorAttribution | null {
  try {
    if (
      !isPrebindingEnvironment(predecessorEnvironment) ||
      !isReferenceDigest(request)
    ) return null;
    const definition = exactIntrinsicDefinition(fixedPacket);
    if (!isEligiblePrebindingDefinition(definition, fixedPacket)) return null;
    const authorizedActorRef =
      predecessorEnvironment.workspaceAuthorityBasis.authorizedActorRef;
    if (
      authorizedActorRef.length === 0 ||
      predecessorEnvironment.workspaceBinding.authorizedActorRef !==
        authorizedActorRef
    ) return null;
    const actor = deepFreeze({
      ref: authorizedActorRef,
      digest: sha256Canonical({ actorRef: authorizedActorRef }),
    }) as ReferenceDigest<"Actor">;
    const body = {
      kind: "actor_attribution" as const,
      schemaVersion: "5.0.0" as const,
      actor,
      definitionKey: deepFreeze({ ...definition.definitionKey }),
      definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest,
      request: deepFreeze({ ref: request.ref, digest: request.digest }),
      predecessorWorkspaceBinding: deepFreeze({
        ref: predecessorEnvironment.workspaceBinding.bindingId,
        digest: predecessorEnvironment.workspaceBinding.bindingDigest,
      }),
      predecessorWorkspaceAuthority: deepFreeze({
        ref: predecessorEnvironment.workspaceAuthorityBasis.authorityBasisId,
        digest:
          predecessorEnvironment.workspaceAuthorityBasis.authorityBasisDigest,
      }),
    };
    const attributionDigest = sha256Canonical(body as unknown as JsonValue);
    return deepFreeze({
      actor,
      attribution: deepFreeze({
        ref:
          `actor-attribution://abiogenesis/${attributionDigest.slice("sha256:".length)}`,
        digest: attributionDigest,
      }),
    });
  } catch {
    return null;
  }
}

function selectedCapabilityOwner(
  admittedInstalls: readonly ProductInstall[],
  definition: IntrinsicPublicFunctionDefinition,
  capabilityRef: string,
): Readonly<{
  graph: CapabilityDefinitionGraph;
  operationContract: PublicContractCoordinate;
  row: CapabilityDefinitionGraph["rows"][number];
}> {
  const expectedSlots = [
    "request",
    "result",
    "refusal",
    ...(definition.nonTerminalContract === null
      ? []
      : ["non_terminal"]),
  ] as const;
  const owners = admittedInstalls.flatMap((install) => {
    const graph = install.capabilityDefinitionGraph;
    if (!isCapabilityDefinitionGraph(graph)) return [];
    const rows = graph.rows.filter((candidate) =>
      candidate.capabilityId === capabilityRef
    );
    if (rows.length !== 1) return [];
    const row = rows[0]!;
    const exactCatalog = {
      productId: install.productId,
      productContentDigest: install.productContentDigest,
      catalogId: install.catalogId,
      catalogVersion: "5.0.0" as const,
      catalogDigest: install.catalogDigest,
    };
    if (row.owningPublicContracts.some((coordinate) =>
      canonicalJson(coordinate.contractCatalog as unknown as JsonValue) !==
        canonicalJson(exactCatalog as unknown as JsonValue)
    )) return [];
    const coordinates = row.owningPublicContracts;
    const definitionCoordinates = coordinates.filter((coordinate) =>
      coordinate.nestedSelector.selectorKind === "operation_definition_slot" &&
      coordinate.nestedSelector.definitionKey.operationId ===
        definition.definitionKey.operationId &&
      coordinate.nestedSelector.definitionKey.memberKey ===
        definition.definitionKey.memberKey
    );
    const operationContracts = coordinates.filter((coordinate) =>
      coordinate.nestedSelector.selectorKind === "flat_contract" &&
      coordinate.flatRow.contractId === definition.definitionKey.operationId &&
      admitRuntimeContract(publicContractCoordinateSchema, coordinate)
        .disposition === "admitted"
    );
    const exactSlots = expectedSlots.every((slot) =>
      definitionCoordinates.filter((coordinate) =>
        coordinate.nestedSelector.selectorKind ===
          "operation_definition_slot" &&
        coordinate.nestedSelector.slot === slot &&
        operationContracts.length === 1 &&
        canonicalJson(coordinate.flatRow as unknown as JsonValue) ===
          canonicalJson(
            operationContracts[0]!.flatRow as unknown as JsonValue,
          ) &&
        install.publicContracts.some((contract) =>
          contract.contractId === coordinate.flatRow.contractId &&
          contract.contractVersion === coordinate.flatRow.contractVersion &&
          contract.contractDigest === coordinate.flatRow.contractDigest
        ) &&
        admitRuntimeContract(publicContractCoordinateSchema, coordinate)
          .disposition === "admitted"
      ).length === 1
    );
    if (
      definitionCoordinates.length !== expectedSlots.length ||
      !exactSlots ||
      operationContracts.length !== 1 ||
      !install.publicContracts.some((contract) =>
        contract.contractId === operationContracts[0]!.flatRow.contractId &&
        contract.contractVersion ===
          operationContracts[0]!.flatRow.contractVersion &&
        contract.contractDigest === operationContracts[0]!.flatRow.contractDigest
      )
    ) return [];
    return [{ graph, operationContract: operationContracts[0]!, row }];
  });
  if (owners.length !== 1) {
    throw new TypeError(
      "capability grant requires one unambiguous installed Product owner",
    );
  }
  return owners[0]!;
}

export function constructCapabilityGrant(
  policy: InvocationPolicyBasis | WorkspaceAuthorityBasis,
  actorRef: string,
  operationId: CapabilityOperationId = "abg.operation.run.invoke",
  capabilityRef: string = DIRECT_INVOKE_CAPABILITY,
  basis?: CapabilityGrantConstructionBasis,
): CapabilityGrant {
  const prebindingBasis = isPrebindingBasis(basis);
  const predecessorEnvironment = prebindingBasis
    ? basis.predecessorEnvironment
    : null;
  const workspaceBinding = predecessorEnvironment?.workspaceBinding ??
    (prebindingBasis ? undefined : basis?.workspaceBinding);
  const admittedInstalls = predecessorEnvironment?.productInstalls ??
    (prebindingBasis ? undefined : basis?.admittedInstalls);
  const invocationPolicy = isInvocationPolicyBasis(policy) ? policy : null;
  const workspaceAuthority = isWorkspaceAuthorityBasis(policy) ? policy : null;
  const workspaceRead = operationId === "abg.operation.project.read";
  const invocationOperation = [
    "abg.operation.interaction.respond",
    "abg.operation.run.continue",
    "abg.operation.run.invoke",
  ].includes(operationId);
  if (
    (invocationPolicy === null && workspaceAuthority === null) ||
    (!prebindingBasis && !workspaceRead && !invocationOperation) ||
    (!prebindingBasis &&
      (workspaceRead
        ? workspaceAuthority === null
        : invocationPolicy === null)) ||
    basis === undefined ||
    workspaceBinding === undefined ||
    admittedInstalls === undefined ||
    actorRef.length === 0 ||
    actorRef !== policy.authorizedActorRef ||
    actorRef !== workspaceBinding?.authorizedActorRef ||
    policy.authorityBasisId !== workspaceBinding?.authorityBasisId ||
    policy.authorityBasisDigest !== workspaceBinding?.authorityBasisDigest ||
    (prebindingBasis
      ? workspaceAuthority === null ||
        !isPrebindingEnvironment(predecessorEnvironment) ||
        canonicalJson(policy as unknown as JsonValue) !==
          canonicalJson(
            predecessorEnvironment.workspaceAuthorityBasis as unknown as JsonValue,
          ) ||
        workspaceAuthority.workspaceId !== workspaceBinding.workspaceId
      : invocationPolicy !== null
      ? invocationPolicy.workspaceBindingId !== workspaceBinding.bindingId ||
        invocationPolicy.workspaceBindingDigest !== workspaceBinding.bindingDigest
      : workspaceAuthority!.workspaceId !== workspaceBinding.workspaceId) ||
    capabilityRef.length === 0 ||
    operationId !== basis.fixedPacket.definitionKey.operationId
  ) {
    throw new TypeError(
      "capability grant requires exact workspace, policy, actor, and definition authority",
    );
  }
  const definition = exactIntrinsicDefinition(basis.fixedPacket);
  const actorAttribution = prebindingBasis
    ? projectDevelopmentSuccessorActorAttribution(
      predecessorEnvironment!,
      basis.fixedPacket,
      basis.request,
    )
    : null;
  if (
    (prebindingBasis && actorAttribution === null) ||
    (actorAttribution !== null && actorAttribution.actor.ref !== actorRef)
  ) {
    throw new TypeError(
      "capability grant requires the exact successor actor attribution",
    );
  }
  const { graph, operationContract, row: capabilityRow } =
    selectedCapabilityOwner(
      admittedInstalls,
      definition,
      capabilityRef,
    );
  const graphRows = new Map(graph.rows.map((row) => [row.capabilityId, row]));
  const closed = new Set<string>();
  const closeDependencies = (capabilityId: string): void => {
    if (closed.has(capabilityId)) return;
    const row = graphRows.get(capabilityId);
    if (row === undefined) {
      throw new TypeError("capability dependency is absent from installed graph");
    }
    closed.add(capabilityId);
    for (const dependency of row.dependentCapabilities) {
      const installed = graphRows.get(dependency.capabilityId);
      if (
        installed === undefined ||
        installed.capabilityDefinitionRef !== dependency.capabilityDefinitionRef ||
        installed.capabilityDefinitionDigest !== dependency.capabilityDefinitionDigest
      ) {
        throw new TypeError("capability dependency coordinate is crossed");
      }
      closeDependencies(dependency.capabilityId);
    }
  };
  closeDependencies(capabilityRef);
  const capabilityDefinition = deepFreeze({
    graphId: graph.graphId,
    graphVersion: graph.graphVersion,
    graphDigest: graph.graphDigest,
    capabilityId: capabilityRow.capabilityId,
    capabilityDefinitionRef: capabilityRow.capabilityDefinitionRef,
    capabilityDefinitionDigest: capabilityRow.capabilityDefinitionDigest,
  });
  const body = {
    definitionKey: deepFreeze({ ...definition.definitionKey }),
    definitionRef: definition.definitionRef,
    definitionDigest: definition.definitionDigest,
    capabilityDefinition,
    operationContract,
    operationId,
    capabilityRef,
    actorRef,
    approvalRef: prebindingBasis
      ? workspaceBinding.bindingId
      : workspaceBinding.authorityBasisId,
    approvalDigest: prebindingBasis
      ? workspaceBinding.bindingDigest
      : workspaceBinding.authorityBasisDigest,
    policyRef: prebindingBasis
      ? predecessorEnvironment!.workspaceAuthorityBasis.authorityBasisId
      : invocationPolicy?.policyRef ?? workspaceAuthority!.authorityBasisId,
    policyDigest: prebindingBasis
      ? predecessorEnvironment!.workspaceAuthorityBasis.authorityBasisDigest
      : invocationPolicy?.policyDigest ?? workspaceAuthority!.authorityBasisDigest,
    scopeRef: prebindingBasis
      ? basis.request.ref
      : workspaceBinding.bindingId,
    scopeDigest: prebindingBasis
      ? basis.request.digest
      : workspaceBinding.bindingDigest,
    authorityBasisRef: prebindingBasis
      ? predecessorEnvironment!.artifactTruth.projectionRef
      : workspaceBinding.authorityBasisId,
    authorityBasisDigest: prebindingBasis
      ? predecessorEnvironment!.artifactTruth.projectionDigest
      : workspaceBinding.authorityBasisDigest,
  };
  const grantDigest = sha256Canonical(body as unknown as JsonValue);
  const value = deepFreeze({
    kind: "capability_grant" as const,
    schemaVersion: "5.0.0" as const,
    grantRef: identity("capability-grant://abiogenesis", grantDigest),
    grantDigest,
    ...body,
  }) as CapabilityGrant;
  return value;
}

export function validateCapabilityGrantForProductBasis(
  grant: unknown,
  policy: InvocationPolicyBasis | WorkspaceAuthorityBasis,
  actorRef: string,
  capabilityRef: string,
  basis: CapabilityGrantConstructionBasis,
): grant is CapabilityGrant {
  if (!isCapabilityGrantValue(grant)) return false;
  try {
    const expected = constructCapabilityGrant(
      policy,
      actorRef,
      basis.fixedPacket.definitionKey.operationId,
      capabilityRef,
      basis,
    );
    return canonicalJson(grant as unknown as JsonValue) ===
      canonicalJson(expected as unknown as JsonValue);
  } catch {
    return false;
  }
}

export function constructInvocationAuthority(
  actorRef: string,
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  programRef: string,
  selectedRow: GraphFunctionCatalogEntry,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  capabilityGrantBasis?: CapabilityGrantConstructionBasis,
): InvocationAuthority | InvocationConstructionRefusal {
  const exactSelectedRow = lookupGraphFunction(catalogView, selectedRow.handle);
  if (
    !isInvocationPolicyBasis(policy) ||
    actorRef !== policy.authorizedActorRef ||
    capabilityGrants.length === 0 ||
    new Set(capabilityGrants.map((grant) => grant.grantRef)).size !==
      capabilityGrants.length ||
    capabilityGrantBasis === undefined ||
    capabilityGrants.length !== 1 ||
    !validateCapabilityGrantForProductBasis(
      capabilityGrants[0],
      policy,
      actorRef,
      DIRECT_INVOKE_CAPABILITY,
      capabilityGrantBasis,
    )
  ) {
    return refusal(
      "capability_mismatch",
      "invocation authority requires unique actor-scoped grants including run.invoke",
    );
  }
  if (
    exactSelectedRow === null ||
    sha256Canonical(exactSelectedRow as unknown as JsonValue) !==
      sha256Canonical(selectedRow as unknown as JsonValue) ||
    selectedRow.definitionRef !== selectedRow.definition.name ||
    selectedRow.definitionDigest !==
      sha256Canonical(selectedRow.definition as unknown as JsonValue) ||
    !selectedRow.programMembershipRefs.includes(programRef)
  ) {
    return refusal(
      "authority_mismatch",
      "invocation authority requires one exact selected catalog definition in the Program",
    );
  }
  const body = {
    actorRef,
    operationId: "abg.operation.run.invoke" as const,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    catalogBasisDigest: catalogView.catalogBasisDigest,
    catalogViewDigest: catalogView.viewDigest,
    programRef,
    catalogHandle: selectedRow.handle,
    selectedDefinitionRef: selectedRow.definitionRef,
    selectedDefinitionDigest: selectedRow.definitionDigest,
    graphFunctionRef: selectedRow.definitionRef,
    policyRef: policy.policyRef,
    policyDigest: policy.policyDigest,
    capabilityGrantRefs: capabilityGrants.map((grant) => grant.grantRef),
  };
  const authorityDigest = sha256Canonical(body as unknown as JsonValue);
  const value = deepFreeze({
    kind: "invocation_authority" as const,
    schemaVersion: "5.0.0" as const,
    authorityRef: identity("invocation-authority://abiogenesis", authorityDigest),
    authorityDigest,
    ...body,
  }) as InvocationAuthority;
  return value;
}

function constructInvocation(
  variant: RunInvocationVariant,
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  program: Readonly<GtlProgram>,
  selectedRow: GraphFunctionCatalogEntry,
  publicRequest: PublicRequestAdmissionCoordinates,
  rawInput: RawAdmittedValue<unknown>,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
): PublicInvocationCandidate | InvocationConstructionRefusal {
  const exactSelectedRow = lookupGraphFunction(catalogView, selectedRow.handle);
  const graphFunction = selectedRow.definition;
  if (
    !isInvocationPolicyBasis(policy) ||
    capabilityGrants.some((grant) => !isCapabilityGrant(grant))
  ) {
    return refusal("capability_mismatch", "invocation policy or capability grant is not Product-constructed");
  }
  if (
    variant === "direct" &&
    program.policies["abg.root_mode"] === "supervised"
  ) {
    return refusal(
      "authority_mismatch",
      "a supervised Program may be entered only through public start selection",
    );
  }
  if (
    !isInvocationAuthority(authority) ||
    authority.workspaceBindingId !== workspaceBinding.bindingId ||
    authority.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
    authority.catalogBasisDigest !== catalogView.catalogBasisDigest ||
    authority.catalogViewDigest !== catalogView.viewDigest ||
    authority.programRef !== program.programRef ||
    exactSelectedRow === null ||
    sha256Canonical(exactSelectedRow as unknown as JsonValue) !==
      sha256Canonical(selectedRow as unknown as JsonValue) ||
    selectedRow.definitionRef !== graphFunction.name ||
    selectedRow.definitionDigest !==
      sha256Canonical(graphFunction as unknown as JsonValue) ||
    !selectedRow.programMembershipRefs.includes(program.programRef) ||
    !program.callableMembership.includes(selectedRow.definitionRef) ||
    authority.catalogHandle !== selectedRow.handle ||
    authority.selectedDefinitionRef !== selectedRow.definitionRef ||
    authority.selectedDefinitionDigest !== selectedRow.definitionDigest ||
    authority.graphFunctionRef !== selectedRow.definitionRef ||
    authority.policyRef !== policy.policyRef ||
    authority.policyDigest !== policy.policyDigest ||
    authority.capabilityGrantRefs.join("\0") !== capabilityGrants.map((grant) => grant.grantRef).join("\0")
  ) {
    return refusal("authority_mismatch", "invocation authority differs from the selected environment or target");
  }
  const inputContractRef = graphFunction.inputs[0];
  const outputContractRef = graphFunction.outputs[0];
  if (
    graphFunction.inputs.length !== 1 ||
    graphFunction.outputs.length !== 1 ||
    inputContractRef === undefined ||
    outputContractRef === undefined ||
    rawInput.contractRef !== inputContractRef
  ) {
    return refusal("contract_mismatch", "direct root invocation requires one exact input and output contract");
  }
  const publicFunctionDefinition = {
    operationId: "abg.operation.run.invoke",
    variant,
    schemaVersion: "5.0.0",
  };
  const publicFunctionDefinitionDigest = sha256Canonical(publicFunctionDefinition);
  const body = {
    operationId: "abg.operation.run.invoke" as const,
    variant,
    publicFunctionDefinitionRef:
      `public-function://abiogenesis/run.invoke/${variant}@5`,
    publicFunctionDefinitionDigest,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    catalogBasisDigest: catalogView.catalogBasisDigest,
    catalogViewDigest: catalogView.viewDigest,
    programRef: program.programRef,
    programDigest: sha256Canonical(program as unknown as JsonValue),
    catalogHandle: selectedRow.handle,
    selectedDefinitionRef: selectedRow.definitionRef,
    selectedDefinitionDigest: selectedRow.definitionDigest,
    graphFunctionRef: selectedRow.definitionRef,
    graphFunctionDigest: selectedRow.definitionDigest,
    inputContractRef,
    outputContractRef,
    rawInputAdmissionRef: rawInput.admissionRef,
    rawInputDigest: rawInput.subjectDigest,
    publicRequestAdmissionRef: publicRequest.admissionRef,
    publicRequestDigest: publicRequest.subjectDigest,
    publicRequestInvocationRef: publicRequest.invocationRef,
    sessionPolicyRef: policy.policyRef,
    sessionPolicyDigest: policy.policyDigest,
    capabilityGrantRefs: capabilityGrants.map((grant) => grant.grantRef),
    capabilityGrantDigests: capabilityGrants.map((grant) => grant.grantDigest),
    invocationAuthorityRef: authority.authorityRef,
    invocationAuthorityDigest: authority.authorityDigest,
    actorAttributionRef: authority.actorRef,
  };
  const invocationDigest = sha256Canonical(body as unknown as JsonValue);
  const value = deepFreeze({
    kind: "public_invocation_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "candidate" as const,
    invocationRef: identity("invocation://abiogenesis", invocationDigest),
    invocationDigest,
    ...body,
  }) as PublicInvocationCandidate;
  return value;
}

export function constructDirectInvocation(
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  program: Readonly<GtlProgram>,
  selectedRow: GraphFunctionCatalogEntry,
  rawRequest: RawAdmittedValue<unknown>,
  rawInput: RawAdmittedValue<unknown>,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
): PublicInvocationCandidate | InvocationConstructionRefusal {
  const request = rawRequest.value;
  if (
    !isRawAdmittedValue(rawRequest) ||
    rawRequest.subjectKind !== "public_operation_request" ||
    rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5" ||
    !isRecord(request) ||
    request.operationId !== "abg.operation.run.invoke" ||
    request.variant !== "direct" ||
    typeof request.invocationRef !== "string" ||
    request.invocationRef.length === 0
  ) {
    return refusal(
      "authority_mismatch",
      "direct invocation requires one exact raw public request admission",
    );
  }
  return constructInvocation(
    "direct",
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    {
      admissionRef: rawRequest.admissionRef,
      subjectDigest: rawRequest.subjectDigest,
      invocationRef: request.invocationRef,
    },
    rawInput,
    policy,
    capabilityGrants,
    authority,
  );
}

export function constructStartInvocation(
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  program: Readonly<GtlProgram>,
  selectedRow: GraphFunctionCatalogEntry,
  rawRequest: RawAdmittedValue<unknown>,
  rawInput: RawAdmittedValue<unknown>,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
): PublicInvocationCandidate | InvocationConstructionRefusal {
  const request = rawRequest.value;
  if (
    !isRawAdmittedValue(rawRequest) ||
    rawRequest.subjectKind !== "public_operation_request" ||
    rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5" ||
    !isRecord(request) ||
    request.operationId !== "abg.operation.run.invoke" ||
    request.variant !== "start" ||
    typeof request.invocationRef !== "string" ||
    request.invocationRef.length === 0
  ) {
    return refusal(
      "authority_mismatch",
      "start invocation requires one exact raw public request admission",
    );
  }
  return constructInvocation(
    "start",
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    {
      admissionRef: rawRequest.admissionRef,
      subjectDigest: rawRequest.subjectDigest,
      invocationRef: request.invocationRef,
    },
    rawInput,
    policy,
    capabilityGrants,
    authority,
  );
}

/**
 * Native exact-family construction. This consumes the admitted definition
 * invocation directly and shares only Product's semantic construction atom;
 * it does not manufacture or translate a legacy Public request carrier.
 */
export function constructExactDirectInvocation(
  publicInvocation: ExactDirectRunInvocation,
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  program: Readonly<GtlProgram>,
  selectedRow: GraphFunctionCatalogEntry,
  rawInput: RawAdmittedValue<unknown>,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
): PublicInvocationCandidate | InvocationConstructionRefusal {
  const request = publicInvocation.request;
  if (
    publicInvocation.kind !== "public_invocation" ||
    publicInvocation.schemaVersion !== "5.0.0" ||
    publicInvocation.definitionKey.operationId !==
      "abg.operation.run.invoke" ||
    publicInvocation.definitionKey.memberKey !== "invoke" ||
    publicInvocation.requestRef.length === 0 ||
    publicInvocation.invocationRef.length === 0 ||
    !isSha256Digest(publicInvocation.requestDigest) ||
    publicInvocation.requestDigest !==
      sha256Canonical(request as unknown as JsonValue) ||
    !isRecord(request.program) ||
    request.program.ref !== program.programRef ||
    request.catalogHandle !== selectedRow.handle ||
    !isRecord(request.inputContract) ||
    request.inputContract.ref !== rawInput.contractRef
  ) {
    return refusal(
      "authority_mismatch",
      "direct invocation requires one exact admitted definition request",
    );
  }
  return constructInvocation(
    "direct",
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    {
      admissionRef: publicInvocation.requestRef,
      subjectDigest: publicInvocation.requestDigest,
      invocationRef: publicInvocation.invocationRef,
    },
    rawInput,
    policy,
    capabilityGrants,
    authority,
  );
}

/** Native exact-family start construction; no legacy request is manufactured. */
export function constructExactStartInvocation(
  publicInvocation: ExactStartRunInvocation,
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  program: Readonly<GtlProgram>,
  selectedRow: GraphFunctionCatalogEntry,
  rawInput: RawAdmittedValue<unknown>,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
): PublicInvocationCandidate | InvocationConstructionRefusal {
  const request = publicInvocation.request;
  if (
    publicInvocation.kind !== "public_invocation" ||
    publicInvocation.schemaVersion !== "5.0.0" ||
    publicInvocation.definitionKey.operationId !== "abg.operation.run.invoke" ||
    publicInvocation.definitionKey.memberKey !== "start" ||
    publicInvocation.requestRef.length === 0 ||
    publicInvocation.invocationRef.length === 0 ||
    !isSha256Digest(publicInvocation.requestDigest) ||
    publicInvocation.requestDigest !==
      sha256Canonical(request as unknown as JsonValue) ||
    !isRecord(request.program) ||
    request.program.ref !== program.programRef ||
    !isRecord(request.input) ||
    !isRecord(request.input.contract) ||
    request.input.contract.ref !== rawInput.contractRef ||
    selectedRow.definitionRef.length === 0
  ) {
    return refusal(
      "authority_mismatch",
      "start invocation requires one exact admitted definition request",
    );
  }
  return constructInvocation(
    "start",
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    {
      admissionRef: publicInvocation.requestRef,
      subjectDigest: publicInvocation.requestDigest,
      invocationRef: publicInvocation.invocationRef,
    },
    rawInput,
    policy,
    capabilityGrants,
    authority,
  );
}
