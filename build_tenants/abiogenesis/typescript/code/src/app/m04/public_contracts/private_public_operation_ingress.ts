// Private pre-publication bridge from P1 truth to the neutral M03 ingress.

import { join } from "node:path";
import type * as v from "valibot";

import type { CanonicalRuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import {
  admitRunInvokeExecutionIngress,
  T270_RUNTIME_COMPATIBILITY_GAP,
  type AdmittedRunInvokeExecutionIngress,
  type InstalledPublicSchemaAuthoritySet,
  type RunInvokeConstraint
} from "../../../abg/m03/contracts/one_surface_execution_ingress.js";
import {
  constructAdmittedInvocationCarrier,
  constructAdmittedInvocationCarrierSet,
  type AdmittedInvocationCarrierSet
} from "../../../abg/m03/contracts/declared_execution_context.js";
import {
  assertNextActionProjection,
  type NextActionProjection
} from "../../../abg/m03/contracts/one_surface_authority.js";
import {
  assertOneSurfaceAuthorityProgramBinding,
  type OneSurfaceAuthorityProgramBinding
} from "../../../abg/m03/contracts/one_surface_program_compiler.js";
import {
  RUN_INVOKE_NATIVE_CONTRACT_SOURCES
} from "../../../abg/m03/contracts/one_surface_operation_contracts.js";
import type {
  PrivatePublicOperationIngressAdmissionWitness
} from "../../../abg/m03/contracts/private_public_operation_ingress.js";
import type {
  AdmittedRuntimeCatalogBasis
} from "../../../abg/m03/contracts/runtime_catalog.js";
import {
  assertAdmittedRuntimeCatalogBasis,
  deriveRegistrySessionView,
  type CatalogExecutionBinding,
  type RegistrySessionGraphFunctionEntry,
  type RegistrySessionView
} from "../../../abg/m03/contracts/runtime_catalog.js";
import {
  admitPrivatePublicOperationIngressWitness
} from "../../../abg/m03/runner/public_operation_admission.js";
import {
  admitCatalogGraphFunctionInput
} from "../../../abg/m03/runner/catalog_input_admission.js";
import {
  assertOneSurfaceConstructionIntentAdmission,
  type OneSurfaceConstructionIntentAdmission
} from "../../../abg/m03/runner/one_surface_semantic_admission.js";
import {
  resolveSelectedCatalogExecutionFromSessionView
} from "../../../abg/m03/runner/selected_catalog_execution.js";
import {
  admitIJsonValue,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  admitProductToolchainManifest
} from "../public_sdk/carrier_admission.js";
import type {
  BoundWorkspaceContext,
  ProductToolchainManifest,
  ToolchainProductBindingV3,
  ToolchainWorkspaceBindingV3
} from "../public_sdk/carriers.js";
import { relativePath } from "../public_sdk/admission_primitives.js";
import {
  assertToolchainWorkspaceBindingV3Coherence
} from "../toolchain_binding/bind.js";
import { digestCanonicalIJson } from "../public_sdk/canonical.js";
import {
  admitNative,
  admitPublicContractCoordinate,
  admitPublicInvocation,
  definitionKeySchemaFor,
  projectPublicInvocationContractIdentity,
  publicInvocationSchema,
  type DefinitionKey,
  type PublicContractCoordinate
} from "./native_contract_phase_a.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "./operation_publication.js";
import {
  inspectPrivatePublicOperationDefinitionFamily,
  type PrivatePublicOperationDefinitionFamily
} from "./public_operation_definition_family.js";
import {
  projectM04RuntimeSchemaAdmission,
  type M04RuntimeSchemaNativeDefinitionRelation
} from "./runtime_schema_admission.js";

type ValueOf<T> = T[keyof T];
/** @internal */
export type PrivateP1Definition = ValueOf<{
  [Operation in keyof PrivatePublicOperationDefinitionFamily]: ValueOf<
    PrivatePublicOperationDefinitionFamily[Operation]
  >;
}>;
type PrivateRunInvokeP1Definition = Extract<
  PrivateP1Definition,
  { readonly definitionKey: {
    readonly operationId: "abg.operation.run.invoke";
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
  D extends PrivateP1Definition
> {
  readonly family: PrivatePublicOperationDefinitionFamily;
  readonly definition: D;
  readonly rawInvocation: unknown;
  readonly causationEventRefs: readonly string[];
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
}

/** @internal */
export interface PrivateRunInvokeExecutionPreparationInput<
  D extends PrivateRunInvokeP1Definition
> extends PrivateP1PublicOperationIngressInput<D> {
  readonly context: BoundWorkspaceContext;
  readonly runtimeCatalogBasis: AdmittedRuntimeCatalogBasis;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
}

/** @internal */
export interface AdmittedPrivateRunInvokeExecutionPreparationInput<
  D extends PrivateRunInvokeP1Definition
> {
  readonly definition: D;
  readonly packet: AdmittedPrivateP1PublicOperationPacket<D>;
  readonly context: BoundWorkspaceContext;
  readonly runtimeCatalogBasis: AdmittedRuntimeCatalogBasis;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
}

/** @internal */
export type AdmittedPrivateRunInvokeConstraintPreparationInput<
  D extends PrivateRunInvokeP1Definition
> = Omit<
  AdmittedPrivateRunInvokeExecutionPreparationInput<D>,
  "authorityProgram"
>;

type PrivateP1AdmittedInvocation<D extends PrivateP1Definition> =
  v.InferOutput<ReturnType<typeof publicInvocationSchema>> & Readonly<{
    readonly definitionKey: D["definitionKey"];
    readonly definitionDigest: string;
    readonly request: v.InferOutput<
      D["requestContract"]["contract"]["schema"]
    >;
  }>;

/**
 * One opaque join between exact P1 admission and semantic owner execution.
 * Handlers consume only the request retained by this packet.
 *
 * @internal
 */
export interface AdmittedPrivateP1PublicOperationPacket<
  D extends PrivateP1Definition = PrivateP1Definition
> {
  readonly kind: "admitted_private_p1_public_operation_packet";
  readonly invocation: PrivateP1AdmittedInvocation<D>;
  readonly witness: PrivatePublicOperationIngressAdmissionWitness<
    D["definitionKey"]
  >;
}

const ADMITTED_PRIVATE_P1_PACKET_AUTHORITY = new WeakSet<object>();
const ADMITTED_PRIVATE_P1_PACKET_STATE = new WeakMap<object, Readonly<{
  readonly definition: PrivateP1Definition;
  readonly requestRef: string;
  readonly requestDigest: string;
}>>();

/** @internal */
export function assertAdmittedPrivateP1PublicOperationPacket<
  const D extends PrivateP1Definition
>(
  packet: AdmittedPrivateP1PublicOperationPacket<D>,
  definition: D
): void {
  if (!ADMITTED_PRIVATE_P1_PACKET_AUTHORITY.has(packet)) {
    throw new TypeError(
      "private P1 owner execution requires an ingress-admitted packet"
    );
  }
  const state = ADMITTED_PRIVATE_P1_PACKET_STATE.get(packet);
  const invocation = packet.invocation;
  const witness = packet.witness;
  const publishedDefinitionDigest =
    projectPublishedPublicOperationDefinitionFromPrivate(definition)
      .definitionDigest;
  if (
    state === undefined ||
    state.definition !== definition ||
    state.requestRef !== invocation.requestRef ||
    state.requestDigest !== invocation.requestDigest ||
    packet.kind !== "admitted_private_p1_public_operation_packet" ||
    !stableJsonEquals(invocation.definitionKey, definition.definitionKey) ||
    invocation.definitionDigest !== publishedDefinitionDigest ||
    invocation.requestDigest !== stableSha256Digest(invocation.request) ||
    !stableJsonEquals(witness.definitionKey, definition.definitionKey) ||
    witness.definitionDigest !== publishedDefinitionDigest ||
    witness.invocationRef !== invocation.invocationRef ||
    witness.invocationDigest !== invocation.invocationDigest
  ) {
    throw new TypeError(
      "private P1 owner packet differs from its exact definition or request seal"
    );
  }
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
function admitPrivateP1PublicOperationIngressCore<
  const D extends PrivateP1Definition
>(
  input: PrivateP1PublicOperationIngressInput<D>
) {
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
  const requestSchema = input.definition.requestContract.contract.schema;
  const publishedDefinition =
    projectPublishedPublicOperationDefinitionFromPrivate(input.definition);
  const candidate = admitNative(
    publicInvocationSchema(definitionKeySchema, requestSchema),
    input.rawInvocation
  );
  const requirements = input.definition.authoritySlotRequirements;
  const expectedAuthority = {
    definitionKey: input.definition.definitionKey,
    definitionDigest: publishedDefinition.definitionDigest,
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
  const nonTerminalCoordinate = contractCoordinateFromBinding(
    input.definition.nonTerminalContract,
    "nonterminal"
  );
  const invocation = admitPublicInvocation({
    definitionKeySchema,
    requestSchema,
    raw: input.rawInvocation,
    expected: {
      definitionKey: input.definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog: candidate.contractCatalog,
      requestContract: projectPublicInvocationContractIdentity(
        input.definition.requestContract.contract.schemaCoordinate
      ),
      resultContract: projectPublicInvocationContractIdentity(
        input.definition.resultContract.contract.schemaCoordinate
      ),
      refusalContract: projectPublicInvocationContractIdentity(
        input.definition.refusalContract.contract.schemaCoordinate
      ),
      nonTerminalContract: nonTerminalCoordinate === null
        ? null
        : projectPublicInvocationContractIdentity(
            nonTerminalCoordinate
          ),
      authority: expectedAuthority
    }
  });

  const witness = admitPrivatePublicOperationIngressWitness({
    definitionKey: input.definition.definitionKey,
    definitionDigest: invocation.definitionDigest,
    eventAdmission: input.definition.eventAdmission,
    invocationRef: invocation.invocationRef,
    invocationDigest: invocation.invocationDigest,
    invocationAuthorityRef: invocation.authority.authoritySetRef,
    invocationAuthorityDigest: invocation.authority.authoritySetDigest,
    authorityBasisRef: invocation.authority.authorityBasisRef,
    authorityBasisDigest: invocation.authority.authorityBasisDigest,
    actorAttribution: invocation.authority.actor,
    workspaceBindingRequirement:
      input.definition.workspaceBindingRequirement,
    workspaceBindingWitness: invocation.authority.workspace,
    causationEventRefs: input.causationEventRefs,
    correlationId: invocation.correlationRef,
    priorEvents: input.priorEvents
  });
  const packet = Object.freeze({
    kind: "admitted_private_p1_public_operation_packet" as const,
    invocation,
    witness
  });
  ADMITTED_PRIVATE_P1_PACKET_AUTHORITY.add(packet);
  ADMITTED_PRIVATE_P1_PACKET_STATE.set(packet, Object.freeze({
    definition: input.definition,
    requestRef: invocation.requestRef,
    requestDigest: invocation.requestDigest
  }));
  return packet;
}

/** @internal */
export function admitPrivateP1PublicOperationPacket<
  const D extends PrivateP1Definition
>(
  input: PrivateP1PublicOperationIngressInput<D>
): AdmittedPrivateP1PublicOperationPacket<D> {
  return admitPrivateP1PublicOperationIngressCore(input);
}

/** @internal */
export function admitPrivateP1PublicOperationIngress<
  const D extends PrivateP1Definition
>(
  input: PrivateP1PublicOperationIngressInput<D>
): PrivatePublicOperationIngressAdmissionWitness<D["definitionKey"]> {
  return admitPrivateP1PublicOperationIngressCore(input).witness;
}

function exactProductBinding(input: {
  readonly binding: ToolchainWorkspaceBindingV3;
  readonly manifest: ProductToolchainManifest;
  readonly label: string;
}) {
  const manifestDigest = stableSha256Digest(input.manifest);
  const matches = input.binding.products.filter((product) =>
    product.publisher === input.manifest.publisher &&
    product.productId === input.manifest.productId &&
    product.packageName === input.manifest.packageName &&
    product.version === input.manifest.packageVersion &&
    product.productContentDigest === input.manifest.productContentDigest &&
    product.manifestDigest === manifestDigest &&
    product.publicContractCatalogId ===
      input.manifest.publicContractCatalog.catalogId &&
    product.publicContractCatalogVersion ===
      input.manifest.publicContractCatalog.catalogVersion &&
    product.publicContractCatalogDigest ===
      input.manifest.publicContractCatalogDigest
  );
  const product = matches[0];
  if (matches.length !== 1 || product === undefined) {
    throw new TypeError(
      `run.invoke execution ingress: ${input.label} manifest is not the exact installed product`
    );
  }
  return product;
}

function admitAuthorityBearingProductManifest(
  input: unknown
): ProductToolchainManifest {
  const manifest = admitProductToolchainManifest(input);
  const { catalogDigest, ...catalogBasis } = manifest.publicContractCatalog;
  if (catalogDigest !== digestCanonicalIJson(catalogBasis)) {
    throw new TypeError(
      "run.invoke execution ingress: product contract catalog digest differs from canonical content"
    );
  }
  return manifest;
}

function exactCatalogNarrowing(input: {
  readonly catalog: AdmittedRuntimeCatalogBasis;
  readonly allowedEntryRefs: readonly string[];
  readonly viewRef: string;
  readonly viewDigest: string;
}) {
  const derived = deriveRegistrySessionView({
    basis: input.catalog,
    allowedEntryRefs: input.allowedEntryRefs
  });
  if (
    !derived.accepted ||
    derived.view === null ||
    derived.view.sessionViewRef !== input.viewRef ||
    stableSha256Digest(derived.view) !== input.viewDigest
  ) {
    throw new TypeError(
      "run.invoke execution ingress: request view is not the exact admitted catalog narrowing"
    );
  }
  return derived.view;
}

function exactCandidateCatalogEntry(input: {
  readonly sessionView: RegistrySessionView;
  readonly canonicalHandle: string;
}): RegistrySessionGraphFunctionEntry {
  const entries = input.sessionView.entries.filter(
    (entry): entry is RegistrySessionGraphFunctionEntry =>
      entry.entryKind === "graph_function" &&
      entry.callable &&
      entry.ready &&
      entry.entryRef === input.canonicalHandle
  );
  const entry = entries[0];
  if (
    entries.length !== 1 ||
    entry === undefined
  ) {
    throw new TypeError(
      "run.invoke execution preparation: candidate is not one exact callable ready catalog member"
    );
  }
  return entry;
}

/** @internal */
export function exactInstalledGraphFunctionInputContract(input: {
  readonly manifest: ProductToolchainManifest;
  readonly entry: RegistrySessionGraphFunctionEntry;
}): Readonly<{
  readonly coordinate: PublicContractCoordinate;
  readonly assetRelativePath: string;
}> {
  const topLevel = input.manifest.publicContractCatalog.rows.flatMap((row) => {
    if (
      row.contractId !== input.entry.sourceContractRef ||
      row.owningProductId !== input.manifest.productId ||
      row.contractKind !== "schema_asset" ||
      row.assetLocator === null ||
      row.assetLocator.mediaType !== "application/schema+json" ||
      row.assetLocator.digest !== row.digest ||
      !input.manifest.productRelativeLocators.includes(
        row.assetLocator.relativePath
      )
    ) {
      return [];
    }
    return [Object.freeze({
      coordinate: admitPublicContractCoordinate({
        contractId: row.contractId,
        contractVersion: row.version,
        contractDigest: row.digest,
        schemaId: row.assetLocator.schemaId,
        schemaVersion: row.assetLocator.schemaVersion,
        schemaDigest: row.assetLocator.digest,
        nativeLocator: null,
        assetLocator: {
          kind: "canonical_asset",
          relativePath: row.assetLocator.relativePath,
          mediaType: row.assetLocator.mediaType,
          schemaId: row.assetLocator.schemaId,
          schemaVersion: row.assetLocator.schemaVersion,
          digest: row.assetLocator.digest
        }
      }),
      assetRelativePath: row.assetLocator.relativePath
    })];
  });
  const nestedRequests = input.manifest.publicContractCatalog.rows.flatMap((row) => {
    if (
      row.owningProductId !== input.manifest.productId ||
      row.contractKind !== "operation" ||
      row.operationContract === null ||
      !("definitions" in row.operationContract)
    ) {
      return [];
    }
    return row.operationContract.definitions.flatMap((definition) => {
      const coordinate = definition.schemaCoordinates.request;
      const asset = coordinate.assetLocator;
      if (
        coordinate.contractId !== input.entry.sourceContractRef ||
        coordinate.contractDigest !== coordinate.schemaDigest ||
        asset.mediaType !== "application/schema+json" ||
        asset.digest !== coordinate.contractDigest ||
        asset.schemaId !== coordinate.schemaId ||
        asset.schemaVersion !== coordinate.schemaVersion ||
        !input.manifest.productRelativeLocators.includes(asset.relativePath)
      ) {
        return [];
      }
      return [Object.freeze({
        coordinate: admitPublicContractCoordinate({
          contractId: coordinate.contractId,
          contractVersion: coordinate.contractVersion,
          contractDigest: coordinate.contractDigest,
          schemaId: coordinate.schemaId,
          schemaVersion: coordinate.schemaVersion,
          schemaDigest: coordinate.schemaDigest,
          nativeLocator: null,
          assetLocator: {
            kind: "canonical_asset",
            relativePath: asset.relativePath,
            mediaType: asset.mediaType,
            schemaId: asset.schemaId,
            schemaVersion: asset.schemaVersion,
            digest: asset.digest
          }
        }),
        assetRelativePath: asset.relativePath
      })];
    });
  });
  const matches = Object.freeze([...topLevel, ...nestedRequests]);
  const selected = matches[0];
  if (matches.length !== 1 || selected === undefined) {
    throw new TypeError(
      "run.invoke execution ingress: selected GraphFunction input contract is not exactly installed"
    );
  }
  return selected;
}

type FinalInvokeConstraint = Extract<
  RunInvokeConstraint,
  { readonly kind: "exact_graph_function_constraint" }
>;
type PreparedInvokeInputContract = Omit<
  FinalInvokeConstraint["inputContract"],
  "sourceInterface"
>;

/** @internal */
export const T270_MULTI_SOURCE_ROOT_INPUT_MAPPING_GAP =
  "gap://abg/t270/multi-source-root-input-mapping";
/** @internal */
export const T270_START_ASSET_OWNERSHIP_GAP =
  "gap://abg/t270/start-asset-ownership-projection";

/** @internal */
export type RunInvokeAf13Constraint =
  | Readonly<{
      kind: "invoke_exact_member_constraint";
      allowedEntryRefs: readonly string[];
      candidateEntryRef: string;
      inputContract: PreparedInvokeInputContract;
      inputPayloadRef: string;
      inputPayloadDigest: string;
    }>
  | Readonly<{
      kind: "start_constraints";
      allowedEntryRefs: readonly string[];
      scopeRef: string;
      scopeDigest: string;
      targetKind: "next" | "graph_function";
      targetHandle: string | null;
      until: "first_traversal" | "blocked" | "converged";
      fhMode: "direct" | "human-proxy";
      rootMode: "direct" | "supervised";
    }>;

/** @internal */
export interface PreparedRunInvokeExecution<
  D extends PrivateRunInvokeP1Definition = PrivateRunInvokeP1Definition
> {
  readonly kind: "prepared_run_invoke_execution";
  readonly variant: "invoke" | "start";
  readonly definition: D;
  readonly packet: AdmittedPrivateP1PublicOperationPacket<D>;
  readonly workspaceBinding: ToolchainWorkspaceBindingV3;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly sessionView: RegistrySessionView;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
  readonly af13Constraint: RunInvokeAf13Constraint;
  readonly installedPublicSchemaAuthoritySet:
    InstalledPublicSchemaAuthoritySet | null;
  readonly admittedInvokeValue: IJsonValue | null;
  readonly runtimeProfile: NonNullable<
    ProductToolchainManifest["runtimeSystemProfile"]
  >;
  readonly abgInstalledProductId: string;
}

/** @internal */
export type PreparedRunInvokeConstraintExecution<
  D extends PrivateRunInvokeP1Definition = PrivateRunInvokeP1Definition
> = Omit<PreparedRunInvokeExecution<D>, "kind" | "authorityProgram"> &
  Readonly<{
    readonly kind: "prepared_run_invoke_constraint_execution";
  }>;

/** @internal */
export interface FinalizedRunInvokeExecution {
  readonly ingress: AdmittedRunInvokeExecutionIngress;
  readonly selectedExecutionBinding: CatalogExecutionBinding;
  readonly schemaAdmissionEngineInput: ReturnType<
    typeof projectM04RuntimeSchemaAdmission
  >["engineInput"];
}

/**
 * Resolves the single invoke member already constrained by the admitted public
 * request. This is a compiler input, not an AF-13 selection result.
 *
 * @internal
 */
export function resolvePreparedRunInvokeConstrainedExecution(
  prepared:
    | PreparedRunInvokeConstraintExecution
    | PreparedRunInvokeExecution
): CatalogExecutionBinding {
  if (prepared.af13Constraint.kind !== "invoke_exact_member_constraint") {
    throw new TypeError(
      "run.invoke constrained compilation requires the invoke variant"
    );
  }
  const constraint = prepared.af13Constraint;
  const candidates = prepared.sessionView.entries.filter(
    (entry): entry is RegistrySessionGraphFunctionEntry =>
      entry.entryKind === "graph_function" &&
      entry.callable &&
      entry.ready &&
      entry.entryRef === constraint.candidateEntryRef
  );
  const candidate = candidates[0];
  if (candidates.length !== 1 || candidate === undefined) {
    throw new TypeError(
      "run.invoke constrained compilation requires one exact callable session member"
    );
  }
  const selected = resolveSelectedCatalogExecutionFromSessionView({
    catalogBasis: prepared.catalogBasis,
    sessionView: prepared.sessionView,
    selectedGraphFunctionRef: candidate.graphFunctionRef,
    label: "run.invoke constrained compilation"
  });
  if (selected.entryRef !== constraint.candidateEntryRef) {
    throw new TypeError(
      "run.invoke constrained compiler member differs from the admitted request"
    );
  }
  return selected;
}

async function exactBoundProductManifests(input: {
  readonly context: BoundWorkspaceContext;
  readonly binding: ToolchainWorkspaceBindingV3;
}): Promise<readonly Readonly<{
  readonly manifest: ProductToolchainManifest;
  readonly product: ToolchainProductBindingV3;
}>[]> {
  const rows = await Promise.all(input.binding.products.map(async (product) => {
    const raw = await input.context.effects.readRecord(product.manifestPath);
    if (raw === null) {
      throw new TypeError(
        `run.invoke execution preparation: bound manifest is missing for ${product.productId}`
      );
    }
    const manifest = admitAuthorityBearingProductManifest(raw);
    return Object.freeze({
      manifest,
      product: exactProductBinding({
        binding: input.binding,
        manifest,
        label: manifest.productId
      })
    });
  }));
  const identities = rows.map(
    ({ manifest }) => `${manifest.productId}@${manifest.packageVersion}`
  );
  if (
    rows.length !== input.binding.products.length ||
    new Set(identities).size !== rows.length
  ) {
    throw new TypeError(
      "run.invoke execution preparation: installed product manifest set differs"
    );
  }
  return Object.freeze(rows);
}

function installedPublicSchemaAuthoritySet(input: {
  readonly owner: Readonly<{
    readonly manifest: ProductToolchainManifest;
    readonly product: ToolchainProductBindingV3;
  }>;
  readonly contract: PublicContractCoordinate;
  readonly schema: IJsonValue;
}): InstalledPublicSchemaAuthoritySet {
  const asset = input.contract.assetLocator;
  if (asset === undefined || asset === null) {
    throw new TypeError(
      "run.invoke execution preparation: public input contract has no schema asset"
    );
  }
  const contractDigest = exactSha256Digest(
    input.contract.contractDigest,
    "run.invoke public input contract digest"
  );
  const assetDigest = exactSha256Digest(
    asset.digest,
    "run.invoke public input schema asset digest"
  );
  const schemas: InstalledPublicSchemaAuthoritySet["schemas"] = Object.freeze([Object.freeze({
    kind: "installed_public_schema_authority" as const,
    owningProductId: input.owner.manifest.productId,
    owningProductVersion: input.owner.manifest.packageVersion,
    publicContractCatalogId:
      input.owner.manifest.publicContractCatalog.catalogId,
    contractId: input.contract.contractId,
    contractDigest,
    publicSchemaId: asset.schemaId,
    publicSchemaVersion: asset.schemaVersion,
    assetRelativePath: asset.relativePath,
    assetDigest,
    schema: input.schema
  })]);
  return Object.freeze({
    kind: "installed_public_schema_authority_set" as const,
    schemas,
    schemaSetDigest: stableSha256Digest(schemas)
  });
}

function exactSha256Digest(
  value: string,
  label: string
): `sha256:${string}` {
  assertSha256Digest(value, label);
  return value;
}

function assertSha256Digest(
  value: string,
  label: string
): asserts value is `sha256:${string}` {
  if (!/^sha256:[0-9a-f]{64}$/u.test(value)) {
    throw new TypeError(`${label} is not a canonical SHA-256 digest`);
  }
}

/** @internal */
export async function preparePrivateRunInvokeExecution<
  const D extends PrivateRunInvokeP1Definition
>(
  input: PrivateRunInvokeExecutionPreparationInput<D>
): Promise<PreparedRunInvokeExecution<D>> {
  const packet = admitPrivateP1PublicOperationPacket(input);
  return preparePrivateRunInvokeExecutionFromPacket({
    definition: input.definition,
    packet,
    context: input.context,
    runtimeCatalogBasis: input.runtimeCatalogBasis,
    authorityProgram: input.authorityProgram
  });
}

/**
 * Continues preparation from the one ingress-admitted packet used by public
 * operation admission. This prevents catalog reconstruction from requiring a
 * second packet authority for the same invocation.
 *
 * @internal
 */
export async function preparePrivateRunInvokeConstraintFromPacket<
  const D extends PrivateRunInvokeP1Definition
>(
  input: AdmittedPrivateRunInvokeConstraintPreparationInput<D>
): Promise<PreparedRunInvokeConstraintExecution<D>> {
  const packet = input.packet;
  assertAdmittedPrivateP1PublicOperationPacket(packet, input.definition);
  const { invocation } = packet;
  if (input.context.kind !== "bound_workspace") {
    throw new TypeError(
      "run.invoke execution preparation: bound workspace context is required"
    );
  }
  const binding = assertToolchainWorkspaceBindingV3Coherence(
    input.context.binding
  );
  if (
    input.context.workspaceManifest.workspaceId !== binding.workspaceId ||
    input.context.workspaceManifest.root !== binding.targetRoot ||
    stableSha256Digest(input.context.workspaceManifest) !==
      binding.workspaceManifestDigest
  ) {
    throw new TypeError(
      "run.invoke execution preparation: workspace manifest differs from binding"
    );
  }
  const boundManifests = await exactBoundProductManifests({
    context: input.context,
    binding
  });
  const abgRows = boundManifests.filter(
    ({ manifest }) =>
      manifest.productId === "abiogenesis" &&
      manifest.runtimeSystemProfile !== null
  );
  const abg = abgRows[0];
  if (
    abgRows.length !== 1 ||
    abg === undefined ||
    abg.manifest.runtimeSystemProfile === null
  ) {
    throw new TypeError(
      "run.invoke execution preparation: exact installed ABG runtime manifest is missing"
    );
  }
  const catalog = input.runtimeCatalogBasis;
  assertAdmittedRuntimeCatalogBasis(catalog);
  if (
    catalog.workspaceId !== binding.workspaceId ||
    catalog.bindingId !== binding.bindingId ||
    catalog.resolvedLockRef !== binding.resolvedLockId
  ) {
    throw new TypeError(
      "run.invoke execution preparation: runtime catalog differs from workspace binding"
    );
  }
  const authority = invocation.authority;
  if (
    authority.actor.state !== "admitted_actor" ||
    authority.workspace.state !== "admitted_workspace" ||
    authority.productSet.state !== "admitted_product_set" ||
    authority.dependencyLock.state !== "admitted_dependency_lock" ||
    authority.catalogScope.state !== "admitted_catalog_scope" ||
    authority.executionProgram.state !== "admitted_execution_program" ||
    authority.invocationPolicy.state !== "admitted_invocation_policy" ||
    authority.transportSteering.state !== "declared_transport_steering"
  ) {
    throw new TypeError(
      "run.invoke execution preparation: invocation authority is incomplete"
    );
  }
  const request = input.definition.definitionKey.variant === "invoke"
    ? admitNative(
        RUN_INVOKE_NATIVE_CONTRACT_SOURCES.invoke.request.schema,
        invocation.request
      )
    : admitNative(
        RUN_INVOKE_NATIVE_CONTRACT_SOURCES.start.request.schema,
        invocation.request
      );
  if (
    input.definition.definitionKey.variant !== request.variant ||
    authority.workspace.bindingRef !== binding.bindingId ||
    authority.workspace.bindingDigest !== binding.bindingDigest ||
    authority.productSet.productSetDigest !== binding.productSetDigest ||
    authority.dependencyLock.lockRef !== binding.resolvedLockId ||
    authority.dependencyLock.lockDigest !== binding.resolvedLockDigest ||
    authority.catalogScope.viewRef !== request.catalogViewRef ||
    authority.catalogScope.viewDigest !== request.catalogViewDigest ||
    authority.catalogScope.allowlistDigest !==
      stableSha256Digest(request.allowlist) ||
    authority.executionProgram.admittedGtlProgramRef !== request.programRef ||
    authority.executionProgram.admittedGtlProgramDigest !==
      request.programDigest
  ) {
    throw new TypeError(
      "run.invoke execution preparation: request and authority join differs"
    );
  }
  const sessionView = exactCatalogNarrowing({
    catalog,
    allowedEntryRefs: request.allowlist,
    viewRef: request.catalogViewRef,
    viewDigest: request.catalogViewDigest
  });

  let af13Constraint: RunInvokeAf13Constraint;
  let installedSchemas: InstalledPublicSchemaAuthoritySet | null = null;
  let admittedInvokeValue: IJsonValue | null = null;
  if (request.variant === "invoke") {
    if (authority.executionProgram.selectionState !== "selected_graph_function") {
      throw new TypeError(
        "run.invoke execution preparation: invoke authority has no exact member constraint"
      );
    }
    const entry = exactCandidateCatalogEntry({
      sessionView,
      canonicalHandle: authority.executionProgram.canonicalHandle
    });
    const owners = boundManifests.filter(({ manifest, product }) =>
      manifest.productId === entry.namespace &&
      manifest.packageVersion === entry.version &&
      product.publisher === entry.ownerRef
    );
    const owner = owners[0];
    if (owners.length !== 1 || owner === undefined) {
      throw new TypeError(
        "run.invoke execution preparation: candidate catalog owner is not exact"
      );
    }
    const installed = exactInstalledGraphFunctionInputContract({
      manifest: owner.manifest,
      entry
    });
    const inputContract = installed.coordinate;
    if (
      !stableJsonEquals(authority.executionProgram.inputContract, inputContract) ||
      authority.executionProgram.canonicalHandle !== request.canonicalHandle ||
      String(inputContract.contractId) !== String(request.inputContractRef) ||
      inputContract.schemaDigest !== request.inputContractDigest ||
      authority.executionProgram.inputPayloadDigest !==
        stableSha256Digest(request.input) ||
      inputContract.assetLocator === undefined ||
      inputContract.assetLocator === null
    ) {
      throw new TypeError(
        "run.invoke execution preparation: invoke payload authority differs"
      );
    }
    const schemaPath = join(
      owner.product.productRoot,
      relativePath(
        installed.assetRelativePath,
        "run.invoke public input schema path"
      )
    );
    const rawSchema = await input.context.effects.readRecord(schemaPath);
    if (
      rawSchema === null ||
      stableSha256Digest(rawSchema) !== inputContract.schemaDigest
    ) {
      throw new TypeError(
        "run.invoke execution preparation: installed public input schema body differs"
      );
    }
    const canonicalValue = admitIJsonValue(request.input);
    const inputAdmission = admitCatalogGraphFunctionInput({
      schema: rawSchema,
      value: canonicalValue
    });
    if (!inputAdmission.accepted) {
      throw new TypeError(
        `run.invoke execution preparation: public input refused: ${inputAdmission.issues.map((issue) => issue.message).join("; ")}`
      );
    }
    installedSchemas = installedPublicSchemaAuthoritySet({
      owner,
      contract: inputContract,
      schema: rawSchema
    });
    admittedInvokeValue = canonicalValue;
    const asset = inputContract.assetLocator;
    af13Constraint = Object.freeze({
      kind: "invoke_exact_member_constraint",
      allowedEntryRefs: Object.freeze([entry.entryRef]),
      candidateEntryRef: entry.entryRef,
      inputContract: Object.freeze({
        owningProductId: owner.manifest.productId,
        owningProductVersion: owner.manifest.packageVersion,
        productManifestDigest: stableSha256Digest(owner.manifest),
        publicContractCatalogId:
          owner.manifest.publicContractCatalog.catalogId,
        publicContractCatalogVersion:
          owner.manifest.publicContractCatalog.catalogVersion,
        publicContractCatalogDigest:
          owner.manifest.publicContractCatalog.catalogDigest,
        contractId: inputContract.contractId,
        contractVersion: inputContract.contractVersion,
        contractDigest: inputContract.contractDigest,
        asset: Object.freeze({
          relativePath: asset.relativePath,
          mediaType: asset.mediaType,
          schemaId: asset.schemaId,
          schemaVersion: asset.schemaVersion,
          digest: asset.digest
        })
      }),
      inputPayloadRef: authority.executionProgram.inputPayloadRef,
      inputPayloadDigest: authority.executionProgram.inputPayloadDigest
    });
  } else {
    if (
      authority.executionProgram.selectionState !== "program_constraints_only" ||
      request.scope.scopeRef !== binding.bindingId ||
      request.scope.scopeDigest !== binding.bindingDigest
    ) {
      throw new TypeError(
        "run.invoke execution preparation: start authority or scope differs"
      );
    }
    if (request.target.kind === "asset") {
      throw new TypeError(
        `semantic_not_realized:${T270_START_ASSET_OWNERSHIP_GAP}`
      );
    }
    const target = request.target;
    const allowedEntryRefs = target.kind === "next"
      ? sessionView.allowedEntryRefs
      : sessionView.entries
          .filter(
            (entry) => entry.entryKind === "graph_function" &&
              (entry.entryRef === target.handle ||
                entry.graphFunctionRef === target.handle)
          )
          .map((entry) => entry.entryRef);
    af13Constraint = Object.freeze({
      kind: "start_constraints",
      allowedEntryRefs: Object.freeze([...allowedEntryRefs]),
      scopeRef: request.scope.scopeRef,
      scopeDigest: request.scope.scopeDigest,
      targetKind: target.kind,
      targetHandle: target.kind === "next"
        ? null
        : target.handle,
      until: request.until,
      fhMode: request.fhMode,
      rootMode: request.rootMode
    });
  }
  return Object.freeze({
    kind: "prepared_run_invoke_constraint_execution" as const,
    variant: request.variant,
    definition: input.definition,
    packet,
    workspaceBinding: binding,
    catalogBasis: catalog,
    sessionView,
    af13Constraint,
    installedPublicSchemaAuthoritySet: installedSchemas,
    admittedInvokeValue,
    runtimeProfile: abg.manifest.runtimeSystemProfile,
    abgInstalledProductId: abg.product.installedProductId
  });
}

/**
 * Binds one compiler-admitted program to the already-admitted public request
 * and constraint preparation. No catalog member is selected here.
 *
 * @internal
 */
export function bindPreparedRunInvokeAuthorityProgram<
  const D extends PrivateRunInvokeP1Definition
>(input: {
  readonly prepared: PreparedRunInvokeConstraintExecution<D>;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
}): PreparedRunInvokeExecution<D> {
  assertOneSurfaceAuthorityProgramBinding(input.authorityProgram);
  const executionProgram = input.prepared.packet.invocation.authority
    .executionProgram;
  if (
    executionProgram.state !== "admitted_execution_program" ||
    executionProgram.admittedGtlProgramRef !==
      input.authorityProgram.admittedProgramRef ||
    executionProgram.admittedGtlProgramDigest !==
      input.authorityProgram.admittedProgramDigest
  ) {
    throw new TypeError(
      "run.invoke execution preparation: admitted program authority differs"
    );
  }
  return Object.freeze({
    ...input.prepared,
    kind: "prepared_run_invoke_execution" as const,
    authorityProgram: input.authorityProgram
  });
}

/**
 * Compatibility composition for callers that already hold the exact admitted
 * authority program. The public SDK uses the two explicit phases so compiler
 * proof precedes AF-13.
 *
 * @internal
 */
export async function preparePrivateRunInvokeExecutionFromPacket<
  const D extends PrivateRunInvokeP1Definition
>(
  input: AdmittedPrivateRunInvokeExecutionPreparationInput<D>
): Promise<PreparedRunInvokeExecution<D>> {
  const prepared = await preparePrivateRunInvokeConstraintFromPacket({
    definition: input.definition,
    packet: input.packet,
    context: input.context,
    runtimeCatalogBasis: input.runtimeCatalogBasis
  });
  return bindPreparedRunInvokeAuthorityProgram({
    prepared,
    authorityProgram: input.authorityProgram
  });
}

function resolveFinalRunInvokeSelectedExecution<
  const D extends PrivateRunInvokeP1Definition
>(input: {
  readonly prepared: PreparedRunInvokeExecution<D>;
  readonly nextAction: NextActionProjection;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
}): Readonly<{
  invocation: PreparedRunInvokeExecution<D>["packet"]["invocation"];
  witness: PreparedRunInvokeExecution<D>["packet"]["witness"];
  selectedSessionView: RegistrySessionView;
  selectedExecutionBinding: CatalogExecutionBinding;
}> {
  assertNextActionProjection(input.nextAction);
  assertOneSurfaceConstructionIntentAdmission(input.intentAdmission);
  const prepared = input.prepared;
  assertAdmittedPrivateP1PublicOperationPacket(
    prepared.packet,
    prepared.definition
  );
  const { invocation, witness } = prepared.packet;
  const authority = invocation.authority;
  const actor = authority.actor;
  const invocationPolicy = authority.invocationPolicy;
  const transportSteering = authority.transportSteering;
  if (
    actor.state !== "admitted_actor" ||
    invocationPolicy.state !== "admitted_invocation_policy" ||
    transportSteering.state !== "declared_transport_steering"
  ) {
    throw new TypeError(
      "run.invoke execution finalization: invocation authority is incomplete"
    );
  }
  const admittedIntent =
    input.intentAdmission.constructionIntentAdmission.admittedIntent;
  const selectedGraphFunctionRef = input.nextAction.disposition.targetRef;
  if (selectedGraphFunctionRef === null) {
    throw new TypeError(
      "run.invoke execution finalization: AF-13/AF-14 authority join differs (selected_graph_function)"
    );
  }
  const selectedSession = deriveRegistrySessionView({
    basis: prepared.catalogBasis,
    allowedEntryRefs: prepared.af13Constraint.allowedEntryRefs
  });
  if (!selectedSession.accepted || selectedSession.view === null) {
    throw new TypeError(
      "run.invoke execution finalization: AF-13 selected catalog view is not admitted"
    );
  }
  const selectedSessionView = selectedSession.view;
  const sessionViewDigest = stableSha256Digest(selectedSessionView);
  const authorityJoinMismatch = Object.freeze([
    [input.nextAction.disposition.variant === "callable_member_action", "disposition"],
    [
      input.nextAction.intentCandidate?.targetGraphFunctionRef ===
        selectedGraphFunctionRef,
      "next_action_intent"
    ],
    [
      admittedIntent?.selectedGraphFunctionRef === selectedGraphFunctionRef,
      "admitted_intent"
    ],
    [
      input.nextAction.admittedProgram.ref ===
        prepared.authorityProgram.admittedProgramRef &&
        input.nextAction.admittedProgram.digest ===
          prepared.authorityProgram.admittedProgramDigest,
      "next_action_program"
    ],
    [
      input.nextAction.catalogView.ref === selectedSessionView.sessionViewRef &&
        input.nextAction.catalogView.digest === sessionViewDigest,
      "next_action_catalog_view"
    ],
    [
      input.intentAdmission.program.ref ===
        prepared.authorityProgram.admittedProgramRef &&
        input.intentAdmission.program.digest ===
          prepared.authorityProgram.admittedProgramDigest,
      "intent_program"
    ],
    [
      input.intentAdmission.nextAction.ref === input.nextAction.projectionRef &&
        input.intentAdmission.nextAction.digest ===
          input.nextAction.projectionDigest,
      "intent_next_action"
    ],
    [
      input.intentAdmission.catalogView.ref ===
        selectedSessionView.sessionViewRef &&
        input.intentAdmission.catalogView.digest === sessionViewDigest,
      "intent_catalog_view"
    ],
    [
      input.intentAdmission.workspaceBinding.ref ===
        prepared.workspaceBinding.bindingId &&
        input.intentAdmission.workspaceBinding.digest ===
          prepared.workspaceBinding.bindingDigest,
      "intent_workspace_binding"
    ],
    [
      input.intentAdmission.invocationAuthority.ref === authority.authoritySetRef &&
        input.intentAdmission.invocationAuthority.digest ===
          authority.authoritySetDigest,
      "intent_invocation_authority"
    ]
  ] as const).find(([matches]) => !matches)?.[1] ?? null;
  if (authorityJoinMismatch !== null) {
    throw new TypeError(
      `run.invoke execution finalization: AF-13/AF-14 authority join differs (${authorityJoinMismatch})`
    );
  }
  const selectedExecutionBinding =
    resolveSelectedCatalogExecutionFromSessionView({
      catalogBasis: prepared.catalogBasis,
      sessionView: selectedSessionView,
      selectedGraphFunctionRef,
      label: "run.invoke execution finalization"
    });
  if (
    !prepared.af13Constraint.allowedEntryRefs.includes(
      selectedExecutionBinding.entryRef
    )
  ) {
    throw new TypeError(
      "run.invoke execution finalization: selected entry is outside the AF-13 request constraint"
    );
  }
  return Object.freeze({
    invocation,
    witness,
    selectedSessionView,
    selectedExecutionBinding
  });
}

/** @internal */
export function finalizePrivateRunInvokeExecutionIngress<
  const D extends PrivateRunInvokeP1Definition
>(input: {
  readonly prepared: PreparedRunInvokeExecution<D>;
  readonly nextAction: NextActionProjection;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
  readonly nativeDefinitionRelations:
    readonly M04RuntimeSchemaNativeDefinitionRelation[];
}): FinalizedRunInvokeExecution {
  const resolved = resolveFinalRunInvokeSelectedExecution(input);
  const prepared = input.prepared;
  const {
    invocation,
    witness,
    selectedSessionView,
    selectedExecutionBinding
  } = resolved;
  const authority = invocation.authority;
  const actor = authority.actor;
  const invocationPolicy = authority.invocationPolicy;
  const transportSteering = authority.transportSteering;
  if (
    actor.state !== "admitted_actor" ||
    invocationPolicy.state !== "admitted_invocation_policy" ||
    transportSteering.state !== "declared_transport_steering"
  ) {
    throw new TypeError(
      "run.invoke execution finalization: invocation authority is incomplete"
    );
  }

  let constraint: RunInvokeConstraint;
  let admittedInputCarriers: AdmittedInvocationCarrierSet | null = null;
  if (prepared.af13Constraint.kind === "invoke_exact_member_constraint") {
    if (
      selectedExecutionBinding.entryRef !==
        prepared.af13Constraint.candidateEntryRef ||
      prepared.admittedInvokeValue === null ||
      prepared.installedPublicSchemaAuthoritySet === null
    ) {
      throw new TypeError(
        "run.invoke execution finalization: selected invoke member differs from prepared constraint"
      );
    }
    const sources = selectedExecutionBinding.graphFunction.inputs;
    const source = sources[0];
    if (sources.length === 0 || source === undefined) {
      throw new TypeError(
        "run.invoke execution finalization: selected GraphFunction has no source Node"
      );
    }
    if (sources.length !== 1) {
      throw new TypeError(
        `semantic_not_realized:${T270_MULTI_SOURCE_ROOT_INPUT_MAPPING_GAP}`
      );
    }
    const carrier = constructAdmittedInvocationCarrier({
      sourceNodeRef: source.id,
      schemaRef: source.schema.ref,
      carrierRef: prepared.af13Constraint.inputPayloadRef,
      admissionRef:
        `catalog-input-admission:${invocation.invocationRef}`,
      value: prepared.admittedInvokeValue
    });
    admittedInputCarriers = constructAdmittedInvocationCarrierSet([carrier]);
    constraint = Object.freeze({
      kind: "exact_graph_function_constraint",
      inputContract: Object.freeze({
        ...prepared.af13Constraint.inputContract,
        sourceInterface: Object.freeze([Object.freeze({
          nodeRef: source.id,
          schemaRef: source.schema.ref
        })])
      }),
      inputPayloadRef: prepared.af13Constraint.inputPayloadRef,
      inputPayloadDigest: prepared.af13Constraint.inputPayloadDigest
    });
  } else {
    constraint = Object.freeze({
      kind: "start_constraints",
      scopeRef: prepared.af13Constraint.scopeRef,
      scopeDigest: prepared.af13Constraint.scopeDigest,
      targetKind: prepared.af13Constraint.targetKind,
      targetHandle: prepared.af13Constraint.targetHandle,
      until: prepared.af13Constraint.until,
      fhMode: prepared.af13Constraint.fhMode,
      rootMode: prepared.af13Constraint.rootMode
    });
  }
  const schemaProjection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding,
    nativeDefinitionRelations: input.nativeDefinitionRelations
  });
  const ingress = admitRunInvokeExecutionIngress({
    authorityClass: "subordinate_rejoin_only",
    variant: prepared.variant,
    definitionDigest: invocation.definitionDigest,
    invocation: Object.freeze({
      ref: invocation.invocationRef,
      digest: invocation.invocationDigest,
      authorityRef: authority.authoritySetRef,
      authorityDigest: authority.authoritySetDigest,
      witnessDigest: stableSha256Digest(witness)
    }),
    workspace: Object.freeze({
      bindingRef: prepared.workspaceBinding.bindingId,
      bindingDigest: prepared.workspaceBinding.bindingDigest,
      workspaceId: prepared.workspaceBinding.workspaceId,
      workspaceRoot: prepared.workspaceBinding.targetRoot
    }),
    catalog: Object.freeze({
      basisRef: prepared.catalogBasis.basisRef,
      catalogId: prepared.catalogBasis.catalogId,
      resolvedLockRef: prepared.catalogBasis.resolvedLockRef,
      viewRef: selectedSessionView.sessionViewRef,
      viewDigest: stableSha256Digest(selectedSessionView),
      allowedEntryRefs: selectedSessionView.allowedEntryRefs
    }),
    program: Object.freeze({
      ref: prepared.authorityProgram.admittedProgramRef,
      digest: prepared.authorityProgram.admittedProgramDigest
    }),
    constraint,
    selectedExecution: Object.freeze({
      selectedEntryRef: selectedExecutionBinding.entryRef,
      graphFunctionRef: selectedExecutionBinding.graphFunctionId,
      graphFunctionDigest: stableSha256Digest(
        selectedExecutionBinding.graphFunction
      ),
      selectedExecutionBindingDigest:
        stableSha256Digest(selectedExecutionBinding),
      nextActionRef: input.nextAction.projectionRef,
      nextActionDigest: input.nextAction.projectionDigest,
      intentAdmissionRef: input.intentAdmission.admissionRef,
      intentAdmissionDigest: input.intentAdmission.admissionDigest
    }),
    admittedInputCarriers,
    installedPublicInputSchemas:
      prepared.installedPublicSchemaAuthoritySet,
    invocationAuthority: Object.freeze({
      authorityBasisRef: authority.authorityBasisRef,
      authorityBasisDigest: authority.authorityBasisDigest,
      actor: Object.freeze({
        actorRef: actor.actorRef,
        attributionRef: actor.attributionRef,
        attributionDigest: actor.attributionDigest
      }),
      capabilityGrants: Object.freeze(
        authority.capabilityGrants.map((grant) => Object.freeze({ ...grant }))
      ),
      invocationPolicy: Object.freeze({
        policyRef: invocationPolicy.policyRef,
        policyDigest: invocationPolicy.policyDigest,
        sessionPolicyRef: invocationPolicy.sessionPolicyRef,
        sessionPolicyDigest: invocationPolicy.sessionPolicyDigest
      }),
      transportSteering: Object.freeze({
        steeringRef: transportSteering.steeringRef,
        steeringDigest: transportSteering.steeringDigest,
        provenanceRefs: Object.freeze([
          ...transportSteering.provenanceRefs
        ])
      }),
      compatibilityState: "pending_af15_rejoin",
      compatibilityGapRef: T270_RUNTIME_COMPATIBILITY_GAP
    }),
    runtimeProfile: Object.freeze({
      profileDigest: prepared.runtimeProfile.profileDigest,
      runtimeIdentity: prepared.runtimeProfile.runtimeIdentity,
      resolvedPolicy: prepared.runtimeProfile.resolvedPolicy,
      standardPluginRefs: prepared.runtimeProfile.standardPluginRefs
    }),
    schemaAdmissionCapabilityBases: schemaProjection.bases,
    sourceWitnessRefs: Object.freeze([...new Set([
      invocation.invocationRef,
      invocation.requestRef,
      authority.authoritySetRef,
      authority.authorityBasisRef,
      actor.attributionRef,
      ...authority.capabilityGrants.map((grant) => grant.grantRef),
      invocationPolicy.policyRef,
      invocationPolicy.sessionPolicyRef,
      transportSteering.steeringRef,
      prepared.workspaceBinding.bindingId,
      prepared.abgInstalledProductId,
      prepared.catalogBasis.basisRef,
      selectedExecutionBinding.entryRef,
      input.nextAction.projectionRef,
      input.intentAdmission.admissionRef
    ])])
  });
  return Object.freeze({
    ingress,
    selectedExecutionBinding,
    schemaAdmissionEngineInput: schemaProjection.engineInput
  });
}

type _RequestSchemaMustRemainNative =
  PrivateP1Definition["requestContract"]["contract"]["schema"] extends
    v.GenericSchema
    ? true
    : never;
const REQUEST_SCHEMA_MUST_REMAIN_NATIVE: _RequestSchemaMustRemainNative = true;
void REQUEST_SCHEMA_MUST_REMAIN_NATIVE;
