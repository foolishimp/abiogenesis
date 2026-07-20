import type { GraphFunction, GtlProgram } from "../gtl/contracts.js";
import {
  isRawAdmittedValue,
  type RawAdmittedValue,
} from "../validator/raw_admission.js";
import type { JsonValue } from "./canonical_json.js";
import type { CatalogView } from "./catalog.js";
import { sha256Canonical, type Sha256Digest } from "./digests.js";
import type { WorkspaceBinding } from "./environment.js";
import { deepFreeze } from "./immutable.js";

export const DIRECT_INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";

export interface InvocationPolicyBasis {
  readonly kind: "invocation_policy_basis";
  readonly schemaVersion: "5.0.0";
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly allowedComputeRegimes: readonly ["F_D"];
  readonly graphMaterialization: "after_invocation_admission";
}

export interface CapabilityGrant {
  readonly kind: "capability_grant";
  readonly schemaVersion: "5.0.0";
  readonly grantRef: string;
  readonly grantDigest: Sha256Digest;
  readonly actorRef: string;
  readonly operationId: "abg.operation.run.invoke";
  readonly capabilityRef: typeof DIRECT_INVOKE_CAPABILITY;
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
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly capabilityGrantRefs: readonly string[];
}

export interface PublicInvocationCandidate {
  readonly kind: "public_invocation_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "candidate";
  readonly operationId: "abg.operation.run.invoke";
  readonly variant: "direct";
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly publicFunctionDefinitionRef: string;
  readonly publicFunctionDefinitionDigest: Sha256Digest;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
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

const policies = new WeakSet<object>();
const grants = new WeakSet<object>();
const authorities = new WeakSet<object>();
const invocations = new WeakSet<object>();

export function isInvocationPolicyBasis(value: object): boolean {
  return policies.has(value);
}

export function isCapabilityGrant(value: object): boolean {
  return grants.has(value);
}

export function isInvocationAuthority(value: object): boolean {
  return authorities.has(value);
}

export function isPublicInvocationCandidate(value: object): boolean {
  return invocations.has(value);
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

export function constructRootInvocationPolicy(): InvocationPolicyBasis {
  const body = {
    allowedComputeRegimes: ["F_D"] as const,
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
  policies.add(value);
  return value;
}

export function constructCapabilityGrant(actorRef: string): CapabilityGrant {
  const body = {
    actorRef,
    operationId: "abg.operation.run.invoke" as const,
    capabilityRef: DIRECT_INVOKE_CAPABILITY,
  };
  const grantDigest = sha256Canonical(body as unknown as JsonValue);
  const value = deepFreeze({
    kind: "capability_grant" as const,
    schemaVersion: "5.0.0" as const,
    grantRef: identity("capability-grant://abiogenesis", grantDigest),
    grantDigest,
    ...body,
  }) as CapabilityGrant;
  grants.add(value);
  return value;
}

export function constructInvocationAuthority(
  actorRef: string,
  workspaceBinding: WorkspaceBinding,
  catalogView: CatalogView,
  programRef: string,
  graphFunctionRef: string,
  capabilityGrants: readonly CapabilityGrant[],
): InvocationAuthority | InvocationConstructionRefusal {
  if (
    capabilityGrants.length === 0 ||
    capabilityGrants.some((grant) =>
      !isCapabilityGrant(grant) ||
      grant.actorRef !== actorRef ||
      grant.operationId !== "abg.operation.run.invoke")
  ) {
    return refusal("capability_mismatch", "invocation authority requires exact actor-scoped run.invoke grants");
  }
  const body = {
    actorRef,
    operationId: "abg.operation.run.invoke" as const,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    catalogViewId: catalogView.viewId,
    catalogViewDigest: catalogView.viewDigest,
    programRef,
    graphFunctionRef,
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
  authorities.add(value);
  return value;
}

export function constructDirectInvocation(
  workspaceBinding: WorkspaceBinding,
  catalogView: CatalogView,
  program: Readonly<GtlProgram>,
  graphFunction: Readonly<GraphFunction>,
  rawRequest: RawAdmittedValue<unknown>,
  rawInput: RawAdmittedValue<unknown>,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
): PublicInvocationCandidate | InvocationConstructionRefusal {
  if (
    !isInvocationPolicyBasis(policy) ||
    capabilityGrants.some((grant) => !isCapabilityGrant(grant))
  ) {
    return refusal("capability_mismatch", "invocation policy or capability grant is not Product-constructed");
  }
  if (
    !isInvocationAuthority(authority) ||
    authority.workspaceBindingId !== workspaceBinding.bindingId ||
    authority.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
    authority.catalogViewId !== catalogView.viewId ||
    authority.catalogViewDigest !== catalogView.viewDigest ||
    authority.programRef !== program.programRef ||
    authority.graphFunctionRef !== graphFunction.name ||
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
  const publicFunctionDefinition = {
    operationId: "abg.operation.run.invoke",
    variant: "direct",
    schemaVersion: "5.0.0",
  };
  const publicFunctionDefinitionDigest = sha256Canonical(publicFunctionDefinition);
  const body = {
    operationId: "abg.operation.run.invoke" as const,
    variant: "direct" as const,
    publicFunctionDefinitionRef: "public-function://abiogenesis/run.invoke/direct@5",
    publicFunctionDefinitionDigest,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    catalogViewId: catalogView.viewId,
    catalogViewDigest: catalogView.viewDigest,
    programRef: program.programRef,
    programDigest: sha256Canonical(program as unknown as JsonValue),
    graphFunctionRef: graphFunction.name,
    graphFunctionDigest: sha256Canonical(graphFunction as unknown as JsonValue),
    inputContractRef,
    outputContractRef,
    rawInputAdmissionRef: rawInput.admissionRef,
    rawInputDigest: rawInput.subjectDigest,
    publicRequestAdmissionRef: rawRequest.admissionRef,
    publicRequestDigest: rawRequest.subjectDigest,
    publicRequestInvocationRef: request.invocationRef as string,
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
  invocations.add(value);
  return value;
}
