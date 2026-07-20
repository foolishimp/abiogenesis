import type {
  GraphFunction,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import {
  DIRECT_INVOKE_CAPABILITY,
  type CapabilityGrant,
  type CatalogView,
  type InvocationAuthority,
  type InvocationPolicyBasis,
  type JsonValue,
  type PublicInvocationCandidate,
  type Sha256Digest,
  type WorkspaceBinding,
} from "../product/index.js";
import {
  isCapabilityGrant,
  isInvocationAuthority,
  isInvocationPolicyBasis,
  isPublicInvocationCandidate,
} from "../product/invocation.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import {
  isProgramValidation,
  type ProgramValidation,
} from "../validator/validation.js";
import {
  isRawAdmittedValue,
  type RawAdmittedValue,
} from "../validator/raw_admission.js";
import { hasAdmittedCatalogView } from "./catalog_admission.js";
import {
  hasAdmittedWorkspaceBinding,
  validatePublicOperationBasis,
  type AbgAdmissionRefusal,
  type PublicOperationAdmissionBasis,
} from "./environment_admission.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";

export interface InvocationAdmissionInput {
  readonly invocation: PublicInvocationCandidate;
  readonly rawInput: RawAdmittedValue<unknown>;
  readonly modulePublication: Readonly<ModulePublication>;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly programValidation: ProgramValidation;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalogView: CatalogView;
  readonly policy: InvocationPolicyBasis;
  readonly capabilityGrants: readonly CapabilityGrant[];
  readonly authority: InvocationAuthority;
}

export interface InvocationAdmission {
  readonly kind: "invocation_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly invocationAdmissionRef: string;
  readonly invocationAdmissionDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly rawInputAdmissionRef: string;
  readonly rawInputDigest: Sha256Digest;
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
  readonly programValidationRef: string;
  readonly programValidationDigest: Sha256Digest;
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly capabilityGrantRefs: readonly string[];
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
  readonly actorRef: string;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
}

export interface InvocationAdmissionRefusal {
  readonly kind: "invocation_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "authority_mismatch"
    | "capability_mismatch"
    | "catalog_view_not_admitted"
    | "contract_mismatch"
    | "invocation_not_constructed"
    | "selection_mismatch"
    | "validation_mismatch"
    | "workspace_not_admitted";
  readonly message: string;
}

export type InvocationAdmissionResult =
  | InvocationAdmission
  | InvocationAdmissionRefusal
  | AbgAdmissionRefusal;

function refusal(
  code: InvocationAdmissionRefusal["code"],
  message: string,
): InvocationAdmissionRefusal {
  return {
    kind: "invocation_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function admitInvocation(
  store: AbgEventStore,
  input: InvocationAdmissionInput,
  basis: PublicOperationAdmissionBasis,
): InvocationAdmissionResult {
  const invalidBasis = validatePublicOperationBasis(basis, "abg.operation.run.invoke");
  if (invalidBasis !== null) return invalidBasis;
  if (!isPublicInvocationCandidate(input.invocation)) {
    return refusal("invocation_not_constructed", "invocation was not constructed by the Product boundary");
  }
  if (
    basis.invocationRef !== input.invocation.invocationRef ||
    basis.authorityScopeRef !== input.workspaceBinding.bindingId ||
    basis.authorityScopeDigest !== input.workspaceBinding.bindingDigest
  ) {
    return refusal("authority_mismatch", "public operation basis differs from invocation or workspace authority");
  }
  if (!hasAdmittedWorkspaceBinding(store, input.workspaceBinding)) {
    return refusal("workspace_not_admitted", "invocation workspace binding lacks ABG admission truth");
  }
  if (!hasAdmittedCatalogView(store, input.catalogView)) {
    return refusal("catalog_view_not_admitted", "invocation CatalogView lacks ABG admission truth");
  }
  if (
    !isProgramValidation(input.programValidation) ||
    input.programValidation.programRef !== input.program.programRef ||
    input.programValidation.programDigest !== input.invocation.programDigest ||
    input.programValidation.publicationDigest !== sha256Canonical(input.modulePublication as unknown as JsonValue) ||
    !input.programValidation.graphFunctionDigests.includes(input.invocation.graphFunctionDigest)
  ) {
    return refusal("validation_mismatch", "Invocation requires the exact non-lowering ProgramValidation");
  }
  const selectedRow = input.catalogView.selectedRows.find(
    (row) => row.handle === input.graphFunction.name,
  );
  if (
    input.invocation.programRef !== input.program.programRef ||
    input.invocation.programDigest !== sha256Canonical(input.program as unknown as JsonValue) ||
    input.invocation.graphFunctionRef !== input.graphFunction.name ||
    input.invocation.graphFunctionDigest !== sha256Canonical(input.graphFunction as unknown as JsonValue) ||
    !input.program.callableMembership.includes(input.graphFunction.name) ||
    selectedRow?.kind !== "graph_function" ||
    selectedRow.disposition !== "admitted" ||
    !selectedRow.programMembershipRefs.includes(input.program.programRef)
  ) {
    return refusal("selection_mismatch", "selected Program and GraphFunction lack exact admitted membership");
  }
  const inputContract = input.modulePublication.contracts.find(
    (contract) => contract.contractRef === input.invocation.inputContractRef,
  );
  const outputContract = input.modulePublication.contracts.find(
    (contract) => contract.contractRef === input.invocation.outputContractRef,
  );
  if (
    !isRawAdmittedValue(input.rawInput) ||
    input.rawInput.subjectKind !== "invocation_input" ||
    input.rawInput.admissionRef !== input.invocation.rawInputAdmissionRef ||
    input.rawInput.subjectDigest !== input.invocation.rawInputDigest ||
    input.rawInput.contractRef !== input.invocation.inputContractRef ||
    inputContract?.contractKind !== "input" ||
    outputContract?.contractKind !== "output" ||
    !isRecord(input.rawInput.value) ||
    input.rawInput.value.kind !== inputContract.valueKind
  ) {
    return refusal("contract_mismatch", "raw input or declared input/output contract differs from invocation");
  }
  if (
    !isInvocationPolicyBasis(input.policy) ||
    input.policy.policyRef !== input.invocation.sessionPolicyRef ||
    input.policy.policyDigest !== input.invocation.sessionPolicyDigest ||
    input.policy.allowedComputeRegimes.length !== 1 ||
    input.policy.allowedComputeRegimes[0] !== "F_D" ||
    input.policy.graphMaterialization !== "after_invocation_admission"
  ) {
    return refusal("capability_mismatch", "root invocation requires the exact all-F_D policy basis");
  }
  if (
    input.capabilityGrants.length === 0 ||
    new Set(input.capabilityGrants.map((grant) => grant.grantRef)).size !== input.capabilityGrants.length ||
    input.capabilityGrants.some((grant) =>
      !isCapabilityGrant(grant) ||
      grant.capabilityRef !== DIRECT_INVOKE_CAPABILITY ||
      grant.actorRef !== input.invocation.actorAttributionRef) ||
    input.invocation.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0") ||
    input.invocation.capabilityGrantDigests.join("\0") !== input.capabilityGrants.map((grant) => grant.grantDigest).join("\0")
  ) {
    return refusal("capability_mismatch", "invocation capability grants are absent, reordered, or inconsistent");
  }
  if (
    !isInvocationAuthority(input.authority) ||
    input.authority.actorRef.length === 0 ||
    input.authority.authorityRef !== input.invocation.invocationAuthorityRef ||
    input.authority.authorityDigest !== input.invocation.invocationAuthorityDigest ||
    input.authority.actorRef !== input.invocation.actorAttributionRef ||
    input.authority.workspaceBindingId !== input.workspaceBinding.bindingId ||
    input.authority.catalogViewId !== input.catalogView.viewId ||
    input.authority.programRef !== input.program.programRef ||
    input.authority.graphFunctionRef !== input.graphFunction.name ||
    input.authority.capabilityGrantRefs.join("\0") !== input.capabilityGrants.map((grant) => grant.grantRef).join("\0")
  ) {
    return refusal("authority_mismatch", "invocation authority does not cover the exact actor, environment, and target");
  }

  const programValidationDigest = sha256Canonical(input.programValidation as unknown as JsonValue);
  const admissionBody = {
    invocationRef: input.invocation.invocationRef,
    invocationDigest: input.invocation.invocationDigest,
    rawInputAdmissionRef: input.rawInput.admissionRef,
    rawInputDigest: input.rawInput.subjectDigest,
    workspaceBindingId: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    catalogViewId: input.catalogView.viewId,
    catalogViewDigest: input.catalogView.viewDigest,
    programRef: input.program.programRef,
    programDigest: input.invocation.programDigest,
    graphFunctionRef: input.graphFunction.name,
    graphFunctionDigest: input.invocation.graphFunctionDigest,
    inputContractRef: input.invocation.inputContractRef,
    outputContractRef: input.invocation.outputContractRef,
    programValidationRef: input.programValidation.validationRef,
    programValidationDigest,
    policyRef: input.policy.policyRef,
    policyDigest: input.policy.policyDigest,
    capabilityGrantRefs: input.capabilityGrants.map((grant) => grant.grantRef),
    authorityRef: input.authority.authorityRef,
    authorityDigest: input.authority.authorityDigest,
    actorRef: input.authority.actorRef,
  };
  const invocationAdmissionDigest = sha256Canonical(admissionBody as unknown as JsonValue);
  const invocationAdmissionRef = `invocation-admission://abiogenesis/${invocationAdmissionDigest.slice("sha256:".length)}`;
  const publicOperationEvent = admitRuntimeEvent(store, {
    kind: "public_operation_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: input.workspaceBinding.bindingId,
    parentAggregateId: input.invocation.invocationRef,
    causationEventRefs: basis.causationEventRefs,
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: input.authority.authorityRef,
    payload: {
      operationId: "abg.operation.run.invoke",
      definitionKey: basis.definitionKey,
      definitionDigest: basis.definitionDigest,
      variant: "direct",
      invocationRef: input.invocation.invocationRef,
      invocationDigest: input.invocation.invocationDigest,
      actorRef: input.authority.actorRef,
      authorityRef: input.authority.authorityRef,
      authorityDigest: input.authority.authorityDigest,
      capabilityGrantRefs: input.capabilityGrants.map((grant) => grant.grantRef),
      policyRef: input.policy.policyRef,
      policyDigest: input.policy.policyDigest,
      workspaceBindingId: input.workspaceBinding.bindingId,
      catalogViewId: input.catalogView.viewId,
      programRef: input.program.programRef,
      graphFunctionRef: input.graphFunction.name,
    },
  });
  const admissionEvent = admitRuntimeEvent(store, {
    kind: "invocation_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: input.workspaceBinding.bindingId,
    parentAggregateId: input.invocation.invocationRef,
    causationEventRefs: [publicOperationEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: invocationAdmissionRef,
    payload: {
      invocationAdmissionRef,
      invocationAdmissionDigest,
      ...admissionBody,
    },
  });
  return deepFreeze({
    kind: "invocation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    invocationAdmissionRef,
    invocationAdmissionDigest,
    ...admissionBody,
    publicOperationEventRef: publicOperationEvent.eventId,
    admissionEventRef: admissionEvent.eventId,
  }) as InvocationAdmission;
}
