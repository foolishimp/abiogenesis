// Private pre-publication bridge from P1 truth to the neutral M03 ingress.

import type * as v from "valibot";

import type { CanonicalRuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import {
  admitRunInvokeExecutionIngress,
  T270_ROOT_PAYLOAD_BODY_GAP,
  T270_RUNTIME_COMPATIBILITY_GAP,
  type AdmittedRunInvokeExecutionIngress
} from "../../../abg/m03/contracts/one_surface_execution_ingress.js";
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
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  admitProductToolchainManifest
} from "../public_sdk/carrier_admission.js";
import type {
  ProductToolchainManifest,
  ToolchainWorkspaceBindingV3
} from "../public_sdk/carriers.js";
import {
  assertToolchainWorkspaceBindingV3Coherence
} from "../toolchain_binding/bind.js";
import { digestCanonicalIJson } from "../public_sdk/canonical.js";
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
type PrivateRunInvokeP1Definition = Extract<
  PrivateEventAdmittingP1Definition,
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
  D extends PrivateEventAdmittingP1Definition
> {
  readonly family: PrivatePublicOperationDefinitionFamily;
  readonly definition: D;
  readonly rawInvocation: unknown;
  readonly causationEventRefs: readonly string[];
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
}

/** @internal */
export interface PrivateRunInvokeExecutionIngressInput<
  D extends PrivateRunInvokeP1Definition
> extends PrivateP1PublicOperationIngressInput<D> {
  readonly workspaceBinding: ToolchainWorkspaceBindingV3;
  readonly productToolchainManifests: readonly ProductToolchainManifest[];
  readonly runtimeCatalogBasis: AdmittedRuntimeCatalogBasis;
  readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
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
  const D extends PrivateEventAdmittingP1Definition
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

  const witness = admitPrivatePublicOperationIngressWitness({
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
  return Object.freeze({ invocation, witness });
}

/** @internal */
export function admitPrivateP1PublicOperationIngress<
  const D extends PrivateEventAdmittingP1Definition
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
  input: ProductToolchainManifest
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

function exactCallableCatalogSelection(input: {
  readonly catalog: AdmittedRuntimeCatalogBasis;
  readonly sessionView: RegistrySessionView;
  readonly canonicalHandle: string;
}): Readonly<{
  readonly binding: CatalogExecutionBinding;
  readonly entry: RegistrySessionGraphFunctionEntry;
}> {
  const entries = input.sessionView.entries.filter(
    (entry): entry is RegistrySessionGraphFunctionEntry =>
      entry.entryKind === "graph_function" &&
      entry.callable &&
      entry.ready &&
      entry.entryRef === input.canonicalHandle
  );
  const entry = entries[0];
  const bindings = entry === undefined
    ? []
    : input.catalog.executionBindings.filter((candidate) =>
        candidate.entryRef === entry.entryRef &&
        candidate.workspaceId === input.catalog.workspaceId &&
        candidate.bindingId === input.catalog.bindingId &&
        candidate.catalogId === input.catalog.catalogId &&
        candidate.resolvedLockRef === input.catalog.resolvedLockRef &&
        candidate.moduleName === candidate.module.name &&
        candidate.moduleDigest === stableSha256Digest(candidate.module) &&
        candidate.graphFunctionDigest ===
          stableSha256Digest(candidate.graphFunction)
      );
  const binding = bindings[0];
  if (
    entries.length !== 1 ||
    entry === undefined ||
    bindings.length !== 1 ||
    binding === undefined
  ) {
    throw new TypeError(
      "run.invoke execution ingress: selected GraphFunction is not one exact callable ready catalog member"
    );
  }
  return Object.freeze({ binding, entry });
}

function exactInstalledGraphFunctionInputContract(input: {
  readonly manifest: ProductToolchainManifest;
  readonly selection: Readonly<{
    readonly binding: CatalogExecutionBinding;
    readonly entry: RegistrySessionGraphFunctionEntry;
  }>;
}): PublicContractCoordinate {
  const matches = input.manifest.publicContractCatalog.rows.filter((row) =>
    row.contractId === input.selection.entry.sourceContractRef &&
    row.owningProductId === input.manifest.productId &&
    row.contractKind === "schema_asset" &&
    row.assetLocator !== null &&
    row.assetLocator.mediaType === "application/schema+json" &&
    row.assetLocator.digest === row.digest &&
    input.manifest.productRelativeLocators.includes(
      row.assetLocator.relativePath
    )
  );
  const row = matches[0];
  if (
    matches.length !== 1 ||
    row === undefined ||
    row.assetLocator === null
  ) {
    throw new TypeError(
      "run.invoke execution ingress: selected GraphFunction input contract is not exactly installed"
    );
  }
  return admitPublicContractCoordinate({
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
  });
}

/**
 * Reduces the already-admitted P1 run.invoke packet and installed runtime
 * authorities to the neutral M03 AF-15 projection. It publishes nothing and
 * carries no request body.
 *
 * @internal
 */
export function admitPrivateRunInvokeExecutionIngress<
  const D extends PrivateRunInvokeP1Definition
>(
  input: PrivateRunInvokeExecutionIngressInput<D>
): AdmittedRunInvokeExecutionIngress {
  const { invocation, witness } =
    admitPrivateP1PublicOperationIngressCore(input);
  const binding = assertToolchainWorkspaceBindingV3Coherence(
    input.workspaceBinding
  );
  const manifests = Object.freeze(
    input.productToolchainManifests.map((manifest) =>
      admitAuthorityBearingProductManifest(manifest)
    )
  );
  const manifestIdentities = manifests.map(
    (manifest) => `${manifest.productId}@${manifest.packageVersion}`
  );
  if (
    manifests.length !== binding.products.length ||
    new Set(manifestIdentities).size !== manifests.length
  ) {
    throw new TypeError(
      "run.invoke execution ingress: installed product manifest set differs"
    );
  }
  const boundManifests = manifests.map((manifest) => Object.freeze({
    manifest,
    product: exactProductBinding({
      binding,
      manifest,
      label: manifest.productId
    })
  }));
  const abgManifests = boundManifests.filter(
    ({ manifest }) =>
      manifest.productId === "abiogenesis" &&
      manifest.runtimeSystemProfile !== null
  );
  const abgManifest = abgManifests[0]?.manifest;
  const abgProduct = abgManifests[0]?.product;
  const runtimeProfile = abgManifest?.runtimeSystemProfile;
  if (
    abgManifests.length !== 1 ||
    abgManifest === undefined ||
    abgProduct === undefined ||
    runtimeProfile === undefined ||
    runtimeProfile === null
  ) {
    throw new TypeError(
      "run.invoke execution ingress: exact installed ABG runtime manifest is missing"
    );
  }
  const catalog = input.runtimeCatalogBasis;
  assertAdmittedRuntimeCatalogBasis(catalog);
  if (
    catalog.kind !== "admitted_runtime_catalog_basis" ||
    catalog.workspaceId !== binding.workspaceId ||
    catalog.bindingId !== binding.bindingId ||
    catalog.resolvedLockRef !== binding.resolvedLockId
  ) {
    throw new TypeError(
      "run.invoke execution ingress: runtime catalog differs from workspace binding"
    );
  }
  assertOneSurfaceAuthorityProgramBinding(input.authorityProgram);

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
      "run.invoke execution ingress: invocation authority is incomplete"
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
      request.programDigest ||
    request.programRef !== input.authorityProgram.admittedProgramRef ||
    request.programDigest !== input.authorityProgram.admittedProgramDigest
  ) {
    throw new TypeError(
      "run.invoke execution ingress: request and authority join differs"
    );
  }

  if (
    request.variant === "start" &&
    (request.scope.scopeRef !== binding.bindingId ||
      request.scope.scopeDigest !== binding.bindingDigest)
  ) {
    throw new TypeError(
      "run.invoke execution ingress: start scope differs from workspace binding"
    );
  }
  const sessionView = exactCatalogNarrowing({
    catalog,
    allowedEntryRefs: request.allowlist,
    viewRef: request.catalogViewRef,
    viewDigest: request.catalogViewDigest
  });
  let selectedEntryRef: string | null = null;
  let constraint;
  if (request.variant === "invoke") {
    if (authority.executionProgram.selectionState !== "selected_graph_function") {
      throw new TypeError(
        "run.invoke execution ingress: invoke authority has no exact function constraint"
      );
    }
    const selectedCatalog = exactCallableCatalogSelection({
      catalog,
      sessionView,
      canonicalHandle: authority.executionProgram.canonicalHandle
    });
    const ownerManifests = boundManifests.filter(({ manifest, product }) =>
      manifest.productId === selectedCatalog.binding.namespace &&
      manifest.packageVersion === selectedCatalog.binding.version &&
      product.publisher === selectedCatalog.binding.ownerRef &&
      (selectedCatalog.binding.descriptorRef === null ||
        product.descriptorId === selectedCatalog.binding.descriptorRef) &&
      (selectedCatalog.binding.contributionManifestRef === null ||
        product.contributionId ===
          selectedCatalog.binding.contributionManifestRef)
    );
    const owner = ownerManifests[0];
    if (ownerManifests.length !== 1 || owner === undefined) {
      throw new TypeError(
        "run.invoke execution ingress: selected catalog owner manifest is not exact"
      );
    }
    const inputContract = exactInstalledGraphFunctionInputContract({
      manifest: owner.manifest,
      selection: selectedCatalog
    });
    if (
      !stableJsonEquals(
        authority.executionProgram.inputContract,
        inputContract
      ) ||
      authority.executionProgram.canonicalHandle !==
        request.canonicalHandle ||
      String(inputContract.contractId) !== String(request.inputContractRef) ||
      inputContract.schemaDigest !== request.inputContractDigest ||
      authority.executionProgram.inputPayloadDigest !==
        stableSha256Digest(request.input) ||
      inputContract.assetLocator === undefined ||
      inputContract.assetLocator === null
    ) {
      throw new TypeError(
        "run.invoke execution ingress: invoke payload authority differs"
      );
    }
    const sourceInterface = selectedCatalog.binding.graphFunction.inputs.map(
      (sourceNode) => Object.freeze({
        nodeRef: sourceNode.id,
        schemaRef: sourceNode.schema.ref
      })
    );
    if (sourceInterface.length === 0) {
      throw new TypeError(
        "run.invoke execution ingress: selected GraphFunction has no public input"
      );
    }
    selectedEntryRef = selectedCatalog.entry.entryRef;
    constraint = Object.freeze({
      kind: "exact_graph_function_constraint" as const,
      graphFunctionRef: selectedCatalog.binding.graphFunctionId,
      graphFunctionDigest: selectedCatalog.binding.graphFunctionDigest,
      selectedEntryRef,
      selectedExecutionBindingDigest: stableSha256Digest(
        selectedCatalog.binding
      ),
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
        sourceInterface: Object.freeze(sourceInterface),
        asset: Object.freeze({ ...inputContract.assetLocator })
      }),
      inputPayloadRef: authority.executionProgram.inputPayloadRef,
      inputPayloadDigest: authority.executionProgram.inputPayloadDigest,
      payloadAdmissionState: "pending_af14_rejoin" as const,
      payloadAdmissionGapRef: T270_ROOT_PAYLOAD_BODY_GAP
    });
  } else {
    if (authority.executionProgram.selectionState !== "program_constraints_only") {
      throw new TypeError(
        "run.invoke execution ingress: start authority contains a hidden function selection"
      );
    }
    constraint = Object.freeze({
      kind: "start_constraints" as const,
      scopeRef: request.scope.scopeRef,
      scopeDigest: request.scope.scopeDigest,
      targetKind: request.target.kind,
      targetHandle: request.target.kind === "next"
        ? null
        : request.target.handle,
      until: request.until,
      fhMode: request.fhMode,
      rootMode: request.rootMode
    });
  }
  return admitRunInvokeExecutionIngress({
    authorityClass: "subordinate_rejoin_only",
    variant: request.variant,
    definitionDigest: invocation.definitionDigest,
    invocation: Object.freeze({
      ref: invocation.invocationRef,
      digest: invocation.invocationDigest,
      authorityRef: authority.authoritySetRef,
      authorityDigest: authority.authoritySetDigest,
      witnessDigest: stableSha256Digest(witness)
    }),
    workspace: Object.freeze({
      bindingRef: binding.bindingId,
      bindingDigest: binding.bindingDigest,
      workspaceId: binding.workspaceId,
      workspaceRoot: binding.targetRoot
    }),
    catalog: Object.freeze({
      basisRef: catalog.basisRef,
      catalogId: catalog.catalogId,
      resolvedLockRef: catalog.resolvedLockRef,
      viewRef: request.catalogViewRef,
      viewDigest: request.catalogViewDigest,
      allowedEntryRefs: sessionView.allowedEntryRefs
    }),
    program: Object.freeze({
      ref: request.programRef,
      digest: request.programDigest
    }),
    constraint,
    invocationAuthority: Object.freeze({
      authorityBasisRef: authority.authorityBasisRef,
      authorityBasisDigest: authority.authorityBasisDigest,
      actor: Object.freeze({
        actorRef: authority.actor.actorRef,
        attributionRef: authority.actor.attributionRef,
        attributionDigest: authority.actor.attributionDigest
      }),
      capabilityGrants: Object.freeze(
        authority.capabilityGrants.map((grant) => Object.freeze({ ...grant }))
      ),
      invocationPolicy: Object.freeze({
        policyRef: authority.invocationPolicy.policyRef,
        policyDigest: authority.invocationPolicy.policyDigest,
        sessionPolicyRef: authority.invocationPolicy.sessionPolicyRef,
        sessionPolicyDigest: authority.invocationPolicy.sessionPolicyDigest
      }),
      transportSteering: Object.freeze({
        steeringRef: authority.transportSteering.steeringRef,
        steeringDigest: authority.transportSteering.steeringDigest,
        provenanceRefs: Object.freeze([
          ...authority.transportSteering.provenanceRefs
        ])
      }),
      compatibilityState: "pending_af15_rejoin",
      compatibilityGapRef: T270_RUNTIME_COMPATIBILITY_GAP
    }),
    runtimeProfile: Object.freeze({
      profileDigest: runtimeProfile.profileDigest,
      runtimeIdentity: runtimeProfile.runtimeIdentity,
      resolvedPolicy: runtimeProfile.resolvedPolicy,
      standardPluginRefs: runtimeProfile.standardPluginRefs
    }),
    sourceWitnessRefs: Object.freeze([...new Set([
      invocation.invocationRef,
      invocation.requestRef,
      authority.authoritySetRef,
      authority.authorityBasisRef,
      authority.actor.attributionRef,
      ...authority.capabilityGrants.map((grant) => grant.grantRef),
      authority.invocationPolicy.policyRef,
      authority.invocationPolicy.sessionPolicyRef,
      authority.transportSteering.steeringRef,
      binding.bindingId,
      abgProduct.installedProductId,
      catalog.basisRef,
      ...(selectedEntryRef === null ? [] : [selectedEntryRef])
    ])])
  });
}

type _RequestSchemaMustRemainNative =
  PrivateP1Definition["requestContract"]["contract"]["schema"] extends
    v.GenericSchema
    ? true
    : never;
const REQUEST_SCHEMA_MUST_REMAIN_NATIVE: _RequestSchemaMustRemainNative = true;
void REQUEST_SCHEMA_MUST_REMAIN_NATIVE;
