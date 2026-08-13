import type {
  ComputeRegime,
  GtlProgram,
} from "../gtl/contracts.js";
import {
  isRawAdmittedValue,
  type RawAdmittedValue,
} from "../validator/raw_admission.js";
import {
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import type { AdmittedPublicInvocation } from "../shared/public_invocation.js";
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
import type { WorkspaceBinding } from "./environment.js";
import { deepFreeze } from "../shared/immutable.js";

export const DIRECT_INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";

export type RunInvocationVariant = "direct" | "start";
export type CapabilityOperationId =
  | "abg.operation.interaction.respond"
  | "abg.operation.run.continue"
  | "abg.operation.run.invoke";

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
  readonly actorRef: string;
  readonly operationId: CapabilityOperationId;
  readonly capabilityRef: string;
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly interactionRequirementKeys: readonly string[];
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
      "capabilityRef",
      "grantDigest",
      "grantRef",
      "interactionRequirementKeys",
      "kind",
      "operationId",
      "policyDigest",
      "policyRef",
      "schemaVersion",
    ]) ||
    value.kind !== "capability_grant" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.grantRef) ||
    !isSha256Digest(value.grantDigest) ||
    !nonEmptyString(value.actorRef) ||
    ![
      "abg.operation.interaction.respond",
      "abg.operation.run.continue",
      "abg.operation.run.invoke",
    ].includes(String(value.operationId)) ||
    !nonEmptyString(value.capabilityRef) ||
    !nonEmptyString(value.policyRef) ||
    !isSha256Digest(value.policyDigest) ||
    !uniqueStrings(value.interactionRequirementKeys) ||
    value.interactionRequirementKeys.join("\0") !==
      [...value.interactionRequirementKeys]
        .sort(compareUnicodeCodeUnits)
        .join("\0")
  ) {
    return false;
  }
  const body = {
    actorRef: value.actorRef,
    operationId: value.operationId,
    capabilityRef: value.capabilityRef,
    policyRef: value.policyRef,
    policyDigest: value.policyDigest,
    interactionRequirementKeys: value.interactionRequirementKeys,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return (
    value.grantDigest === digest &&
    value.grantRef === identity("capability-grant://abiogenesis", digest)
  );
}

export function constructCapabilityGrant(
  policy: InvocationPolicyBasis,
  actorRef: string,
  operationId: CapabilityOperationId = "abg.operation.run.invoke",
  capabilityRef: string = DIRECT_INVOKE_CAPABILITY,
): CapabilityGrant {
  const interactionRequirementKeys =
    operationId === "abg.operation.run.invoke"
      ? []
      : policy.interactionCapabilities
          .filter((row) => row.actorCapabilityRef === capabilityRef)
          .map((row) => row.requirementKey);
  if (
    !isInvocationPolicyBasis(policy) ||
    actorRef.length === 0 ||
    actorRef !== policy.authorizedActorRef ||
    capabilityRef.length === 0 ||
    (
      operationId === "abg.operation.run.invoke" &&
      capabilityRef !== DIRECT_INVOKE_CAPABILITY
    ) ||
    (
      operationId !== "abg.operation.run.invoke" &&
      interactionRequirementKeys.length === 0
    )
  ) {
    throw new TypeError(
      "capability grant requires one actor, operation, and exact capability",
    );
  }
  const body = {
    actorRef,
    operationId,
    capabilityRef,
    policyRef: policy.policyRef,
    policyDigest: policy.policyDigest,
    interactionRequirementKeys,
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

export function constructInvocationAuthority(
  actorRef: string,
  workspaceBinding: WorkspaceBinding,
  catalogView: GraphFunctionCatalogView,
  programRef: string,
  selectedRow: GraphFunctionCatalogEntry,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
): InvocationAuthority | InvocationConstructionRefusal {
  const exactSelectedRow = lookupGraphFunction(catalogView, selectedRow.handle);
  if (
    !isInvocationPolicyBasis(policy) ||
    actorRef !== policy.authorizedActorRef ||
    capabilityGrants.length === 0 ||
    new Set(capabilityGrants.map((grant) => grant.grantRef)).size !==
      capabilityGrants.length ||
    capabilityGrants.some((grant) =>
      !isCapabilityGrant(grant) ||
      grant.actorRef !== actorRef ||
      grant.policyRef !== policy.policyRef ||
      grant.policyDigest !== policy.policyDigest) ||
    !capabilityGrants.some(
      (grant) =>
        grant.operationId === "abg.operation.run.invoke" &&
        grant.capabilityRef === DIRECT_INVOKE_CAPABILITY,
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
