// Private pre-publication bridge from P1 truth to the neutral M03 ingress.

import type * as v from "valibot";

import type { CanonicalRuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import type {
  PrivatePublicOperationIngressAdmissionWitness
} from "../../../abg/m03/contracts/private_public_operation_ingress.js";
import {
  admitPrivatePublicOperationIngressWitness
} from "../../../abg/m03/runner/public_operation_admission.js";
import { stableJsonEquals } from "../../../shared/runtime_identity.js";
import {
  admitNative,
  admitPublicContractCoordinate,
  admitPublicInvocation,
  definitionKeySchemaFor,
  publicInvocationSchema,
  type DefinitionKey,
  type PublicContractCoordinate
} from "./native_contract_phase_a.js";
import {
  METADATA_BASIS_BY_OPERATION,
  inspectPrivatePublicOperationDefinitionFamily,
  type PrivatePublicOperationDefinitionFamily
} from "./public_operation_definition_family.js";

type ValueOf<T> = T[keyof T];
type PrivateP1Definition = ValueOf<{
  [Operation in keyof PrivatePublicOperationDefinitionFamily]: ValueOf<
    PrivatePublicOperationDefinitionFamily[Operation]
  >;
}>;
type PrivateEventAdmittingOperationId = {
  [Operation in keyof typeof METADATA_BASIS_BY_OPERATION]:
    (typeof METADATA_BASIS_BY_OPERATION)[Operation]["eventAdmission"] extends
      "owning_semantic_authority"
      ? Operation
      : never;
}[keyof typeof METADATA_BASIS_BY_OPERATION];
type PrivateEventAdmittingP1Definition = Extract<
  PrivateP1Definition,
  { readonly definitionKey: {
    readonly operationId: PrivateEventAdmittingOperationId;
  } }
>;

type AuthoritySlotState =
  | "forbidden"
  | "admitted_actor"
  | "admitted_workspace"
  | "admitted_product_set"
  | "admitted_dependency_lock"
  | "admitted_catalog_scope"
  | "admitted_execution_program"
  | "admitted_invocation_policy"
  | "declared_transport_steering";

interface FixedCatalogScopeRequirement {
  readonly kind: "fixed";
  readonly requirement: "forbidden" | "exactly_one";
}

interface VisibilityCatalogScopeRequirement {
  readonly kind: "by_visibility_basis";
  readonly workspace_catalog: "forbidden";
  readonly session_view: "exactly_one_matching_selector";
}

type CatalogScopeRequirement =
  | FixedCatalogScopeRequirement
  | VisibilityCatalogScopeRequirement;

/** @internal */
export interface PrivateP1PublicOperationIngressInput<
  D extends PrivateEventAdmittingP1Definition
> {
  readonly family: PrivatePublicOperationDefinitionFamily;
  readonly definition: D;
  readonly rawInvocation: unknown;
  readonly causationEventRefs: readonly string[];
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
}

function ownValue(input: unknown, key: string): unknown {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor !== undefined && "value" in descriptor
    ? descriptor.value
    : undefined;
}

function familyMember(
  family: PrivatePublicOperationDefinitionFamily,
  key: DefinitionKey
): unknown {
  const operation = ownValue(family, key.operationId);
  const member = key.memberKind === "variant" ? key.variant : key.caseKey;
  return ownValue(operation, member);
}

function actorRequirementState(
  requirement: "forbidden" | "required"
): "forbidden" | "admitted_actor" {
  return requirement === "forbidden" ? "forbidden" : "admitted_actor";
}

function requirementState<const Admitted extends AuthoritySlotState>(
  requirement: "forbidden" | "exactly_one",
  admitted: Admitted
): "forbidden" | Admitted {
  return requirement === "forbidden" ? "forbidden" : admitted;
}

function contractCoordinateFromBinding(
  binding: unknown,
  label: string
): PublicContractCoordinate | null {
  if (binding === null) {
    return null;
  }
  const contract = ownValue(binding, "contract");
  const coordinate = ownValue(contract, "schemaCoordinate");
  try {
    return admitPublicContractCoordinate(coordinate);
  } catch {
    throw new TypeError(
      `private P1 public ingress: ${label} contract binding is invalid`
    );
  }
}

function catalogVisibilityBasis(request: unknown): unknown {
  return ownValue(ownValue(request, "selector"), "visibilityBasis");
}

function catalogScopeState(input: {
  readonly requirement: CatalogScopeRequirement;
  readonly request: unknown;
  readonly authorityCatalogScope: unknown;
}): "forbidden" | "admitted_catalog_scope" {
  if (input.requirement.kind === "fixed") {
    return input.requirement.requirement === "forbidden"
      ? "forbidden"
      : "admitted_catalog_scope";
  }
  const visibility = catalogVisibilityBasis(input.request);
  if (visibility === "workspace_catalog") {
    return "forbidden";
  }
  if (
    typeof visibility !== "object" ||
    visibility === null ||
    ownValue(visibility, "kind") !== "session_view"
  ) {
    throw new TypeError(
      "private P1 public ingress: catalog visibility basis is invalid"
    );
  }
  const selectedView = ownValue(visibility, "view");
  const authorityView = input.authorityCatalogScope;
  if (
    ownValue(authorityView, "state") !== "admitted_catalog_scope" ||
    !stableJsonEquals(
      {
        ref: ownValue(authorityView, "viewRef"),
        digest: ownValue(authorityView, "viewDigest")
      },
      selectedView
    )
  ) {
    throw new TypeError(
      "private P1 public ingress: catalog view does not match the request selector"
    );
  }
  return "admitted_catalog_scope";
}

/**
 * Admits one event-bearing P1 invocation into a private neutral witness. The
 * exact family remains the sole identity, eligibility, and variant authority.
 * Atomic P2 alone may later turn this witness into a canonical runtime event.
 *
 * @internal
 */
export function admitPrivateP1PublicOperationIngress<
  const D extends PrivateEventAdmittingP1Definition
>(
  input: PrivateP1PublicOperationIngressInput<D>
): PrivatePublicOperationIngressAdmissionWitness<D["definitionKey"]> {
  const familyAdmission = inspectPrivatePublicOperationDefinitionFamily(
    input.family
  );
  if (familyAdmission.kind !== "exact_family_admitted") {
    throw new TypeError(
      "private P1 public ingress: operation family is not exactly admitted"
    );
  }
  const definitionKeySchema = definitionKeySchemaFor(
    input.definition.definitionKey
  );
  if (
    familyMember(input.family, input.definition.definitionKey) !==
      input.definition
  ) {
    throw new TypeError(
      "private P1 public ingress: definition is not owned by the admitted family"
    );
  }
  if (input.definition.eventAdmission !== "owning_semantic_authority") {
    throw new TypeError(
      "private P1 public ingress: definition declares no event admission"
    );
  }

  const requestSchema = input.definition.requestContract.contract.schema;
  const candidate = admitNative(
    publicInvocationSchema(definitionKeySchema, requestSchema),
    input.rawInvocation
  );
  const requirements = input.definition.authoritySlotRequirements;
  const expectedAuthority = {
    definitionKey: input.definition.definitionKey,
    definitionDigest: input.definition.definitionDigest,
    contractCatalog: candidate.contractCatalog,
    requiredGrantCapabilityIds: input.definition.capabilityRefs,
    slotStates: {
      actor: actorRequirementState(requirements.actor),
      workspace: requirementState(
        requirements.workspace,
        "admitted_workspace"
      ),
      productSet: requirementState(
        requirements.productSet,
        "admitted_product_set"
      ),
      dependencyLock: requirementState(
        requirements.dependencyLock,
        "admitted_dependency_lock"
      ),
      catalogScope: catalogScopeState({
        requirement: requirements.catalogScope,
        request: candidate.request,
        authorityCatalogScope: candidate.authority.catalogScope
      }),
      executionProgram: requirementState(
        requirements.executionProgram,
        "admitted_execution_program"
      ),
      invocationPolicy: requirementState(
        requirements.invocationPolicy,
        "admitted_invocation_policy"
      ),
      transportSteering: requirementState(
        requirements.transportSteering,
        "declared_transport_steering"
      )
    }
  } as const;
  const invocation = admitPublicInvocation({
    definitionKeySchema,
    requestSchema,
    raw: input.rawInvocation,
    expected: {
      definitionKey: input.definition.definitionKey,
      definitionDigest: input.definition.definitionDigest,
      contractCatalog: candidate.contractCatalog,
      requestContract: input.definition.requestContract.contract.schemaCoordinate,
      resultContract: input.definition.resultContract.contract.schemaCoordinate,
      refusalContract: input.definition.refusalContract.contract.schemaCoordinate,
      nonTerminalContract: contractCoordinateFromBinding(
        input.definition.nonTerminalContract,
        "nonterminal"
      ),
      authority: expectedAuthority
    }
  });

  return admitPrivatePublicOperationIngressWitness({
    definitionKey: input.definition.definitionKey,
    definitionDigest: invocation.definitionDigest,
    eventAdmission: input.definition.eventAdmission,
    invocationRef: invocation.invocationRef,
    invocationDigest: invocation.invocationDigest,
    invocationAuthorityRef: invocation.authority.authoritySetRef,
    invocationAuthorityDigest: invocation.authority.authoritySetDigest,
    actorAttribution: invocation.authority.actor,
    workspaceBindingRequirement:
      input.definition.workspaceBindingRequirement,
    workspaceBindingWitness: invocation.authority.workspace,
    causationEventRefs: input.causationEventRefs,
    correlationId: invocation.correlationRef,
    priorEvents: input.priorEvents
  });
}

type _RequestSchemaMustRemainNative =
  PrivateP1Definition["requestContract"]["contract"]["schema"] extends
    v.GenericSchema
    ? true
    : never;
const REQUEST_SCHEMA_MUST_REMAIN_NATIVE: _RequestSchemaMustRemainNative = true;
void REQUEST_SCHEMA_MUST_REMAIN_NATIVE;
