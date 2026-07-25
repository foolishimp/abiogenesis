import type {
  ComputeRegime,
  GraphFunction,
  GtlProgram,
} from "../gtl/contracts.js";
import {
  isRawAdmittedValue,
  type RawAdmittedValue,
} from "../validator/raw_admission.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { CatalogView } from "./catalog.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
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
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly allowedComputeRegimes: readonly ComputeRegime[];
  readonly interactionCapabilities: readonly InvocationInteractionCapability[];
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
  readonly catalogViewId: string;
  readonly catalogViewDigest: Sha256Digest;
  readonly programRef: string;
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
  return grants.has(value) && isCapabilityGrantValue(value);
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

export function constructRootInvocationPolicy(
  workspaceBinding: WorkspaceBinding,
  program: Readonly<GtlProgram>,
  interactionCapabilities: readonly InvocationInteractionCapability[],
  allowedComputeRegimes: readonly ComputeRegime[] = ["F_D"],
): InvocationPolicyBasis {
  const canonicalOrder: readonly ComputeRegime[] = ["F_D", "F_P", "F_H"];
  const canonicalRegimes = canonicalOrder.filter((regime) =>
    allowedComputeRegimes.includes(regime)
  );
  const canonicalInteractions = [...interactionCapabilities].sort((left, right) =>
    left.requirementKey.localeCompare(right.requirementKey)
  );
  if (
    canonicalRegimes.length === 0 ||
    canonicalRegimes.length !== allowedComputeRegimes.length ||
    canonicalRegimes.some((regime, index) => regime !== allowedComputeRegimes[index]) ||
    workspaceBinding.authorityBasisId.length === 0 ||
    workspaceBinding.authorityBasisDigest.length === 0 ||
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
    )
  ) {
    throw new TypeError(
      "invocation policy requires one exact workspace, Program, compute-regime set, and interaction requirement set",
    );
  }
  const body = {
    authorityMode: "trusted_developer" as const,
    authorityBasisId: workspaceBinding.authorityBasisId,
    authorityBasisDigest: workspaceBinding.authorityBasisDigest,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    programRef: program.programRef,
    programDigest: sha256Canonical(program as unknown as JsonValue),
    allowedComputeRegimes: canonicalRegimes,
    interactionCapabilities: canonicalInteractions,
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

export function isCapabilityGrantValue(value: unknown): value is CapabilityGrant {
  if (
    !isRecord(value) ||
    value.kind !== "capability_grant" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.grantRef !== "string" ||
    typeof value.grantDigest !== "string" ||
    typeof value.actorRef !== "string" ||
    value.actorRef.length === 0 ||
    ![
      "abg.operation.interaction.respond",
      "abg.operation.run.continue",
      "abg.operation.run.invoke",
    ].includes(String(value.operationId)) ||
    typeof value.capabilityRef !== "string" ||
    value.capabilityRef.length === 0 ||
    typeof value.policyRef !== "string" ||
    value.policyRef.length === 0 ||
    typeof value.policyDigest !== "string" ||
    !Array.isArray(value.interactionRequirementKeys) ||
    value.interactionRequirementKeys.some(
      (key) => typeof key !== "string" || key.length === 0,
    ) ||
    new Set(value.interactionRequirementKeys).size !==
      value.interactionRequirementKeys.length
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
  grants.add(value);
  return value;
}

export function constructInvocationAuthority(
  actorRef: string,
  workspaceBinding: WorkspaceBinding,
  catalogView: CatalogView,
  programRef: string,
  graphFunctionRef: string,
  policy: InvocationPolicyBasis,
  capabilityGrants: readonly CapabilityGrant[],
): InvocationAuthority | InvocationConstructionRefusal {
  if (
    !isInvocationPolicyBasis(policy) ||
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
  const body = {
    actorRef,
    operationId: "abg.operation.run.invoke" as const,
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    catalogViewId: catalogView.viewId,
    catalogViewDigest: catalogView.viewDigest,
    programRef,
    graphFunctionRef,
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
  authorities.add(value);
  return value;
}

function constructInvocation(
  variant: RunInvocationVariant,
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
  const request = rawRequest.value;
  if (
    !isRawAdmittedValue(rawRequest) ||
    rawRequest.subjectKind !== "public_operation_request" ||
    rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5" ||
    !isRecord(request) ||
    request.operationId !== "abg.operation.run.invoke" ||
    request.variant !== variant ||
    typeof request.invocationRef !== "string" ||
    request.invocationRef.length === 0
  ) {
    return refusal(
      "authority_mismatch",
      `${variant} invocation requires one exact raw public request admission`,
    );
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
  return constructInvocation(
    "direct",
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    capabilityGrants,
    authority,
  );
}

export function constructStartInvocation(
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
  return constructInvocation(
    "start",
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    capabilityGrants,
    authority,
  );
}
