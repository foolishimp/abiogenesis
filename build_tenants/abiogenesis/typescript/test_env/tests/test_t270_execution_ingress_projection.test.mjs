import assert from "node:assert/strict";
import test from "node:test";

import {
  admitBoundWorkspaceCatalog,
  compileOneSurfaceGtlProgramApplication,
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig,
  deriveRegistrySessionView
} from "../../build/semantic/code/src/index.js";
import {
  assertAdmittedRunInvokeExecutionIngress,
  T270_ROOT_PAYLOAD_BODY_GAP,
  T270_RUNTIME_COMPATIBILITY_GAP
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_execution_ingress.js";
import {
  constructCapabilityGrant,
  constructInvocationAuthority,
  constructPublicContractCatalog,
  constructPublicInvocation,
  definitionKeySchemaFor,
  publicContractCatalogCoordinate
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  admitPrivateRunInvokeExecutionIngress
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  constructToolchainWorkspaceBindingV3
} from "../../build/semantic/code/src/app/m04/toolchain_binding/bind.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  digestCanonicalIJson
} from "../../build/semantic/code/src/app/m04/public_sdk/canonical.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

const DIGEST = stableSha256Digest({ fixture: "t270-execution-ingress" });
const WORKSPACE_ROOT = "/tmp/abg-t270-execution-ingress";
const CATALOG_ENTRY_REF = "catalog-entry://t270/execution-ingress";
const CATALOG_COMPANION_ENTRY_REF =
  "catalog-entry://t270/execution-ingress-companion";
const CATALOG_MODULE_REF = "gtl-module://t270/execution-ingress";
const CATALOG_PRODUCT_ID = "fixture.t270.catalog";
const CATALOG_PRODUCT_VERSION = "0.1.0";
const CATALOG_DESCRIPTOR_REF = "descriptor:fixture:t270";
const CATALOG_CONTRIBUTION_REF = "contribution:fixture:t270";
const ROOT_INPUT_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  properties: Object.freeze({
    ticketRef: Object.freeze({ type: "string", minLength: 1 }),
    requestedBy: Object.freeze({ type: "string", minLength: 1 })
  }),
  required: Object.freeze(["ticketRef", "requestedBy"])
});
let programWorldPromise;
let installedAuthoritiesPromise;
let definitionFamilyPromise;

function graphFunctionInputContract(world) {
  const digest = stableSha256Digest(ROOT_INPUT_SCHEMA);
  return Object.freeze({
    contractId: "fixture.contract.t270-root-input",
    contractVersion: CATALOG_PRODUCT_VERSION,
    contractDigest: digest,
    schemaId: "fixture.schema.t270-root-input",
    schemaVersion: "1.0.0",
    schemaDigest: digest,
    nativeLocator: null,
    assetLocator: Object.freeze({
      kind: "canonical_asset",
      relativePath: "contracts/schemas/t270-root-input.schema.json",
      mediaType: "application/schema+json",
      schemaId: "fixture.schema.t270-root-input",
      schemaVersion: "1.0.0",
      digest
    })
  });
}

function sdkContractCatalog(inputContract) {
  const basis = Object.freeze({
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contracts.t270",
    catalogVersion: "5.0.0",
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: DIGEST,
    profile: "catalog-product-v1",
    rows: Object.freeze([Object.freeze({
      contractId: inputContract.contractId,
      contractKind: "schema_asset",
      owningProductId: CATALOG_PRODUCT_ID,
      version: CATALOG_PRODUCT_VERSION,
      digest: inputContract.contractDigest,
      authorityRefs: Object.freeze(["REQ-P-PUBLIC-CONTRACTS"]),
      capabilityRefs: Object.freeze([]),
      nativeLocator: null,
      assetLocator: Object.freeze({
        kind: "asset",
        relativePath: "contracts/schemas/t270-root-input.schema.json",
        schemaId: inputContract.schemaId,
        schemaVersion: inputContract.schemaVersion,
        mediaType: "application/schema+json",
        digest: inputContract.schemaDigest
      }),
      operationContract: null
    })])
  });
  return Object.freeze({
    ...basis,
    catalogDigest: digestCanonicalIJson(basis)
  });
}

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

async function programWorld() {
  if (programWorldPromise === undefined) {
    programWorldPromise = (async () => {
      const fixture = scenario09OneSurfaceProgramFixture({
        subjectRef: "workspace://t270/execution-ingress-program"
      });
      const compilation = await compileOneSurfaceGtlProgramApplication({
        gtlProgram: fixture.gtlProgram,
        stageAuthorities: stageAuthorities(fixture),
        recursePlan: fixture.recursePlan
      });
      assert.notEqual(
        compilation.authorityProgram,
        null,
        JSON.stringify(compilation.diagnostics)
      );
      return Object.freeze({
        fixture,
        authorityProgram: compilation.authorityProgram
      });
    })();
  }
  return programWorldPromise;
}

function runtimeCatalogFor(input) {
  const callable = input.world.fixture.members[2].finalHost;
  const companionCallable = input.world.fixture.members[0].finalHost;
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t270/execution-ingress",
    entryRef: CATALOG_ENTRY_REF,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: CATALOG_PRODUCT_ID,
    ownerRef: "fixture",
    version: CATALOG_PRODUCT_VERSION,
    graphFunctionRef: callable.id,
    interfaceRef: "interface://t270/execution-ingress",
    sourceContractRef: input.inputContract.contractId,
    targetContractRef: callable.outputs[0].schema.ref,
    contextRefs: ["context://t270/execution-ingress"],
    authorityRefs: ["authority://t270/execution-ingress"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t270/execution-ingress"],
    readinessRefs: ["readiness://t270/execution-ingress"],
    proofRefs: ["proof://t270/execution-ingress"],
    policyRefs: ["policy://t270/execution-ingress"],
    declarationSourceRefs: [CATALOG_MODULE_REF]
  });
  const companionDeclaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t270/execution-ingress-companion",
    entryRef: CATALOG_COMPANION_ENTRY_REF,
    libraryScope: "product",
    entryKind: "graph_function",
    namespace: CATALOG_PRODUCT_ID,
    ownerRef: "fixture",
    version: CATALOG_PRODUCT_VERSION,
    graphFunctionRef: companionCallable.id,
    interfaceRef: "interface://t270/execution-ingress-companion",
    sourceContractRef: companionCallable.inputs[0].schema.ref,
    targetContractRef: companionCallable.outputs[0].schema.ref,
    contextRefs: ["context://t270/execution-ingress-companion"],
    authorityRefs: ["authority://t270/execution-ingress-companion"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t270/execution-ingress-companion"],
    readinessRefs: ["readiness://t270/execution-ingress-companion"],
    proofRefs: ["proof://t270/execution-ingress-companion"],
    policyRefs: ["policy://t270/execution-ingress-companion"],
    declarationSourceRefs: [CATALOG_MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: input.binding.workspaceId,
      bindingId: input.binding.bindingId,
      catalogId: "catalog://t270/execution-ingress",
      resolvedLockRef: input.binding.resolvedLockId,
      systemDeclarations: [],
      orderedProductBatches: [{
        kind: "bound_catalog_product_batch",
        descriptorRef: CATALOG_DESCRIPTOR_REF,
        contributionManifestRef: CATALOG_CONTRIBUTION_REF,
        productStartupConfig: constructProductRegistryStartupConfig({
          configRef: "product-registry-startup://t270/catalog-product",
          productNamespace: CATALOG_PRODUCT_ID,
          ownerRef: "fixture",
          version: CATALOG_PRODUCT_VERSION,
          enabledLibraryRefs: [],
          readinessRefs: ["readiness://t270/execution-ingress"],
          proofRefs: ["proof://t270/execution-ingress"],
          policyRefs: ["policy://t270/execution-ingress"],
          configSourceRefs: [CATALOG_CONTRIBUTION_REF]
        }),
        declarations: [declaration, companionDeclaration].map((entry) => ({
          kind: "runtime_library_entry",
          declaration: entry,
          moduleRef: CATALOG_MODULE_REF,
          module: input.world.fixture.aggregateModule
        }))
      }],
      causationEventRefs: ["event://t270/execution-ingress/catalog"],
      correlationId: "correlation://t270/execution-ingress/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  const session = deriveRegistrySessionView({
    basis: admission.basis,
    allowedEntryRefs: [declaration.entryRef, companionDeclaration.entryRef]
  });
  assert.equal(session.accepted, true, JSON.stringify(session.residuals));
  assert.notEqual(session.view, null);
  assert.equal(session.view.entries.length, 2);
  assert.equal(session.view.entries.every((entry) => entry.callable), true);
  const executionBinding = admission.basis.executionBindings.find(
    (binding) => binding.entryRef === declaration.entryRef
  );
  assert.notEqual(executionBinding, undefined);
  return Object.freeze({
    basis: admission.basis,
    sessionView: session.view,
    executionBinding
  });
}

async function installedAuthorities() {
  if (installedAuthoritiesPromise !== undefined) {
    return installedAuthoritiesPromise;
  }
  installedAuthoritiesPromise = (async () => {
  const world = await programWorld();
  const profileBasis = Object.freeze({
    kind: "abg_runtime_system_profile",
    runtimeIdentity: Object.freeze({
      workerId: "worker:t270",
      backendId: "backend:t270",
      buildId: "build:t270",
      resolvedRuntimeRef: "runtime:abg:5.0.0"
    }),
    resolvedPolicy: Object.freeze({
      resolvedPolicyBundleRef: "policy:t270",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    }),
    standardPluginRefs: Object.freeze([])
  });
  const inputContract = graphFunctionInputContract(world);
  const contractCatalog = sdkContractCatalog(inputContract);
  const runtimeWitnessDigest = stableSha256Digest({
    schema: "t270-abg-runtime-witness"
  });
  const abgContractCatalogBasis = Object.freeze({
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contracts.t270.runtime",
    catalogVersion: "5.0.0",
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: DIGEST,
    profile: "abg-5-ds1",
    rows: Object.freeze([Object.freeze({
      contractId: "abg.schema.t270-runtime-witness",
      contractKind: "schema_asset",
      owningProductId: "abiogenesis",
      version: "5.0.0",
      digest: runtimeWitnessDigest,
      authorityRefs: Object.freeze(["REQ-P-PUBLIC-CONTRACTS"]),
      capabilityRefs: Object.freeze([]),
      nativeLocator: null,
      assetLocator: Object.freeze({
        kind: "asset",
        relativePath: "contracts/schemas/t270-runtime-witness.schema.json",
        schemaId: "abg.schema.t270-runtime-witness",
        schemaVersion: "5.0.0",
        mediaType: "application/schema+json",
        digest: runtimeWitnessDigest
      }),
      operationContract: null
    })])
  });
  const abgContractCatalog = Object.freeze({
    ...abgContractCatalogBasis,
    catalogDigest: digestCanonicalIJson(abgContractCatalogBasis)
  });
  const abgManifest = Object.freeze({
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0",
    productContentDigest: DIGEST,
    publicContractCatalogPath: "contracts/public-contract-catalog.json",
    publicContractCatalogDigest: abgContractCatalog.catalogDigest,
    publicContractCatalog: abgContractCatalog,
    runtimeSystemProfile: Object.freeze({
      ...profileBasis,
      profileDigest: stableSha256Digest(profileBasis)
    }),
    productRelativeLocators: Object.freeze([
      "contracts/public-contract-catalog.json",
      "contracts/schemas/t270-runtime-witness.schema.json"
    ])
  });
  const catalogManifest = Object.freeze({
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: "fixture",
    productId: CATALOG_PRODUCT_ID,
    packageName: "@fixture/t270-catalog",
    packageVersion: CATALOG_PRODUCT_VERSION,
    productContentDigest: stableSha256Digest({ product: CATALOG_PRODUCT_ID }),
    publicContractCatalogPath: "contracts/public-contract-catalog.json",
    publicContractCatalogDigest: contractCatalog.catalogDigest,
    publicContractCatalog: contractCatalog,
    runtimeSystemProfile: null,
    productRelativeLocators: Object.freeze([
      "contracts/public-contract-catalog.json",
      "contracts/schemas/t270-root-input.schema.json"
    ])
  });
  const abgProduct = Object.freeze({
    installedProductId: "installed:abiogenesis:t270",
    publisher: abgManifest.publisher,
    productId: abgManifest.productId,
    packageName: abgManifest.packageName,
    version: abgManifest.packageVersion,
    productContentDigest: abgManifest.productContentDigest,
    descriptorId: "descriptor:abiogenesis:t270",
    descriptorDigest: DIGEST,
    contributionId: "contribution:abiogenesis:t270",
    contributionDigest: DIGEST,
    artifactDigest: DIGEST,
    installedRoot: "/tmp/abg-t270-installed",
    productRoot: "/tmp/abg-t270-installed/product",
    packageRoot: "/tmp/abg-t270-installed/package",
    manifestPath: "/tmp/abg-t270-installed/product-toolchain-manifest.json",
    manifestDigest: stableSha256Digest(abgManifest),
    compatibilityRange: "5.0.0",
    compatibility: Object.freeze({
      productId: "abiogenesis",
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze([]),
    publicContractCatalogId: abgContractCatalog.catalogId,
    publicContractCatalogVersion: abgContractCatalog.catalogVersion,
    publicContractCatalogDigest: abgContractCatalog.catalogDigest
  });
  const catalogProduct = Object.freeze({
    installedProductId: "installed:fixture:t270-catalog",
    publisher: catalogManifest.publisher,
    productId: catalogManifest.productId,
    packageName: catalogManifest.packageName,
    version: catalogManifest.packageVersion,
    productContentDigest: catalogManifest.productContentDigest,
    descriptorId: CATALOG_DESCRIPTOR_REF,
    descriptorDigest: DIGEST,
    contributionId: CATALOG_CONTRIBUTION_REF,
    contributionDigest: DIGEST,
    artifactDigest: DIGEST,
    installedRoot: "/tmp/t270-catalog-installed",
    productRoot: "/tmp/t270-catalog-installed/product",
    packageRoot: "/tmp/t270-catalog-installed/package",
    manifestPath: "/tmp/t270-catalog-installed/product-toolchain-manifest.json",
    manifestDigest: stableSha256Digest(catalogManifest),
    compatibilityRange: "5.0.0",
    compatibility: Object.freeze({
      productId: CATALOG_PRODUCT_ID,
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze([]),
    publicContractCatalogId: contractCatalog.catalogId,
    publicContractCatalogVersion: contractCatalog.catalogVersion,
    publicContractCatalogDigest: contractCatalog.catalogDigest
  });
  const binding = constructToolchainWorkspaceBindingV3({
    workspaceId: "workspace:t270",
    workspaceManifestDigest: DIGEST,
    targetRoot: WORKSPACE_ROOT,
    toolchainRoot: "/tmp/abg-t270-toolchain",
    resolvedLockId: "lock:t270",
    resolvedLockDigest: DIGEST,
    products: Object.freeze([abgProduct, catalogProduct]),
    mutableStateRoots: Object.freeze({
      observedWorkspaceRoot: WORKSPACE_ROOT,
      observerStateRoot: `${WORKSPACE_ROOT}/.abg/observer`,
      executorStateRoot: `${WORKSPACE_ROOT}/.abg/executor`,
      eventRoot: `${WORKSPACE_ROOT}/.abg/events`,
      eventLogPath: `${WORKSPACE_ROOT}/.abg/events/events.jsonl`,
      runtimeRoot: `${WORKSPACE_ROOT}/.abg/runtime`,
      projectionRoot: `${WORKSPACE_ROOT}/.abg/projections`,
      archiveRoot: `${WORKSPACE_ROOT}/.abg/archive`
    }),
    provenanceRefs: Object.freeze(["fixture:t270"])
  });
  const runtimeCatalog = runtimeCatalogFor({ binding, world, inputContract });
  return Object.freeze({
    binding,
    manifests: Object.freeze([abgManifest, catalogManifest]),
    runtimeCatalog,
    world,
    inputContract,
    inputSchema: ROOT_INPUT_SCHEMA
  });
  })();
  return installedAuthoritiesPromise;
}

function exactSlot(requirement, value) {
  return requirement === "forbidden" ? { state: "forbidden" } : value;
}

function invocationFixture(input) {
  const { admitted, definition, request, authorities } = input;
  const coordinates = [
    definition.requestContract.contract.schemaCoordinate,
    definition.resultContract.contract.schemaCoordinate,
    definition.refusalContract.contract.schemaCoordinate,
    definition.nonTerminalContract.contract.schemaCoordinate,
    ...(request.variant === "invoke" ? [authorities.inputContract] : [])
  ].sort((left, right) => {
    const leftId = `${left.contractId}@${left.contractVersion}`;
    const rightId = `${right.contractId}@${right.contractVersion}`;
    return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
  });
  const contractCatalog = publicContractCatalogCoordinate(
    constructPublicContractCatalog({
      catalogId: `abg.catalog.t270.${request.variant}`,
      catalogVersion: "5.0.0",
      rows: coordinates
    })
  );
  const keySchema = definitionKeySchemaFor(definition.definitionKey);
  const actorRef = `actor:t270:${request.variant}`;
  const authorityBasisRef = `authority-basis:t270:${request.variant}`;
  const authorityBasisDigest = stableSha256Digest({
    family: admitted.familyDigest,
    variant: request.variant
  });
  const capabilityGrants = definition.capabilityRefs.map(
    (capabilityId, index) => constructCapabilityGrant({
      capabilityId,
      capabilityDefinitionRef: `capability:t270:${index}`,
      capabilityDefinitionDigest: stableSha256Digest({ capabilityId }),
      actorRef,
      approvalRef: `approval:t270:${index}`,
      policyRef: "policy:t270",
      scopeRef: input.grantScopeRef ?? authorities.binding.bindingId,
      scopeDigest: input.grantScopeDigest ?? authorities.binding.bindingDigest,
      authorityBasisRef,
      authorityBasisDigest
    })
  );
  const requirements = definition.authoritySlotRequirements;
  const selectedExecutionProgram =
    request.variant === "invoke" || input.forceSelectedExecutionProgram === true;
  const slots = {
    actor: exactSlot(requirements.actor, {
      state: "admitted_actor",
      actorRef,
      attributionRef: `attribution:t270:${request.variant}`,
      attributionDigest: stableSha256Digest({ actorRef })
    }),
    workspace: exactSlot(requirements.workspace, {
      state: "admitted_workspace",
      bindingRef: authorities.binding.bindingId,
      bindingDigest: authorities.binding.bindingDigest
    }),
    productSet: exactSlot(requirements.productSet, {
      state: "admitted_product_set",
      productSetRef: `product-set:t270:${request.variant}`,
      productSetDigest: authorities.binding.productSetDigest
    }),
    dependencyLock: exactSlot(requirements.dependencyLock, {
      state: "admitted_dependency_lock",
      lockRef: authorities.binding.resolvedLockId,
      lockDigest: authorities.binding.resolvedLockDigest
    }),
    catalogScope: {
      state: "admitted_catalog_scope",
      viewRef: request.catalogViewRef,
      viewDigest: request.catalogViewDigest,
      allowlistRef: `allowlist:t270:${request.variant}`,
      allowlistDigest: stableSha256Digest(request.allowlist)
    },
    executionProgram: {
      state: "admitted_execution_program",
      ...(selectedExecutionProgram
        ? {
            selectionState: "selected_graph_function",
            admittedGtlProgramRef: request.programRef,
            admittedGtlProgramDigest: request.programDigest,
            canonicalHandle: input.canonicalHandle,
            inputContract: input.executionInputContract,
            inputPayloadRef: `input-payload:t270:${request.variant}`,
            inputPayloadDigest: stableSha256Digest(
              request.variant === "invoke" ? request.input : { variant: "start" }
            )
          }
        : {
            selectionState: "program_constraints_only",
            admittedGtlProgramRef: request.programRef,
            admittedGtlProgramDigest: request.programDigest
          })
    },
    invocationPolicy: {
      state: "admitted_invocation_policy",
      policyRef: "policy:t270",
      policyDigest: DIGEST,
      sessionPolicyRef: `session-policy:t270:${request.variant}`,
      sessionPolicyDigest: DIGEST
    },
    transportSteering: {
      state: "declared_transport_steering",
      steeringRef: `steering:t270:${request.variant}`,
      steeringDigest: DIGEST,
      provenanceRefs: ["provenance:t270:steering"]
    }
  };
  const expectedAuthority = {
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    contractCatalog,
    requiredGrantCapabilityIds: definition.capabilityRefs,
    slotStates: Object.fromEntries(
      Object.entries(slots).map(([key, value]) => [key, value.state])
    )
  };
  const authority = constructInvocationAuthority({
    definitionKeySchema: keySchema,
    expected: expectedAuthority,
    basis: {
      authorityBasisRef,
      authorityBasisDigest,
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      contractCatalog,
      capabilityGrants,
      ...slots
    }
  });
  return constructPublicInvocation({
    definitionKeySchema: keySchema,
    requestSchema: definition.requestContract.contract.schema,
    expected: {
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      contractCatalog,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      resultContract: definition.resultContract.contract.schemaCoordinate,
      refusalContract: definition.refusalContract.contract.schemaCoordinate,
      nonTerminalContract:
        definition.nonTerminalContract.contract.schemaCoordinate,
      authority: expectedAuthority
    },
    basis: {
      kind: "public_invocation",
      invocationRef: `public-invocation:t270:${request.variant}`,
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      contractCatalog,
      authority,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      requestRef: `request:t270:${request.variant}`,
      requestDigest: stableSha256Digest(request),
      request,
      expectedResultContract:
        definition.resultContract.contract.schemaCoordinate,
      expectedRefusalContract:
        definition.refusalContract.contract.schemaCoordinate,
      expectedNonTerminalContract:
        definition.nonTerminalContract.contract.schemaCoordinate,
      correlationRef: `correlation:t270:${request.variant}`,
      provenanceRefs: []
    }
  });
}

async function fixture(variant, options = {}) {
  definitionFamilyPromise ??= buildPrivatePublicOperationDefinitionFamily();
  const admitted = await definitionFamilyPromise;
  assert.equal(admitted.kind, "exact_family_admitted");
  const definition = admitted.family["abg.operation.run.invoke"][variant];
  const authorities = await installedAuthorities();
  const selected = authorities.runtimeCatalog.executionBinding;
  const view = authorities.runtimeCatalog.sessionView;
  const programRef = options.programRef ??
    authorities.world.authorityProgram.admittedProgramRef;
  const programDigest = options.programDigest ??
    authorities.world.authorityProgram.admittedProgramDigest;
  const canonicalHandle = options.canonicalHandle ?? selected.entryRef;
  const executionInputContract = options.useRequestEnvelopeContract === true
    ? definition.requestContract.contract.schemaCoordinate
    : authorities.inputContract;
  const common = {
    kind: "run_invoke_request",
    variant,
    programRef,
    programDigest,
    catalogViewRef: options.catalogViewRef ?? view.sessionViewRef,
    catalogViewDigest: options.catalogViewDigest ?? stableSha256Digest(view),
    allowlist: options.allowlist ??
      (options.reverseAllowlist === true
        ? [...view.allowedEntryRefs].reverse()
        : view.allowedEntryRefs)
  };
  const request = variant === "invoke"
    ? {
        ...common,
        canonicalHandle,
        inputContractRef:
          executionInputContract.contractId,
        inputContractDigest:
          executionInputContract.schemaDigest,
        input: options.input ?? {
          ticketRef: "ticket:T-270",
          requestedBy: "test"
        }
      }
    : {
        ...common,
        scope: {
          kind: "workspace",
          scopeRef: options.scopeRef ?? authorities.binding.bindingId,
          scopeDigest: options.scopeDigest ?? authorities.binding.bindingDigest
        },
        target: options.target ?? {
          kind: "graph_function",
          handle: selected.entryRef
        },
        until: "blocked",
        fhMode: "direct",
        rootMode: "supervised"
      };
  const invocation = invocationFixture({
    admitted,
    definition,
    request,
    authorities,
    canonicalHandle,
    executionInputContract,
    forceSelectedExecutionProgram: options.forceSelectedExecutionProgram,
    grantScopeRef: options.grantScopeRef,
    grantScopeDigest: options.grantScopeDigest
  });
  return { admitted, definition, authorities, request, invocation };
}

function admitFixture(
  value,
  runtimeCatalogBasis = value.authorities.runtimeCatalog.basis,
  productToolchainManifests = value.authorities.manifests
) {
  return admitPrivateRunInvokeExecutionIngress({
    family: value.admitted.family,
    definition: value.definition,
    rawInvocation: value.invocation,
    causationEventRefs: [],
    priorEvents: [],
    workspaceBinding: value.authorities.binding,
    productToolchainManifests,
    runtimeCatalogBasis,
    authorityProgram: value.authorities.world.authorityProgram
  });
}

test("run.invoke derives the exact member and keeps serialized contract identity separate from GTL schema identity", async () => {
  const value = await fixture("invoke");
  const ingress = admitFixture(value);
  assertAdmittedRunInvokeExecutionIngress(ingress);
  assert.equal(ingress.authorityClass, "subordinate_rejoin_only");
  assert.equal(ingress.variant, "invoke");
  assert.equal(
    ingress.program.ref,
    value.authorities.world.authorityProgram.admittedProgramRef
  );
  assert.equal(
    ingress.catalog.viewRef,
    value.authorities.runtimeCatalog.sessionView.sessionViewRef
  );
  assert.equal(ingress.constraint.kind, "exact_graph_function_constraint");
  assert.equal(
    ingress.constraint.selectedEntryRef,
    value.authorities.runtimeCatalog.executionBinding.entryRef
  );
  assert.equal(
    ingress.constraint.inputContract.contractId,
    value.authorities.inputContract.contractId
  );
  assert.equal(
    ingress.constraint.graphFunctionRef,
    value.authorities.runtimeCatalog.executionBinding.graphFunctionId
  );
  assert.equal(
    ingress.constraint.graphFunctionDigest,
    value.authorities.runtimeCatalog.executionBinding.graphFunctionDigest
  );
  assert.deepEqual(
    ingress.constraint.inputContract.sourceInterface,
    value.authorities.runtimeCatalog.executionBinding.graphFunction.inputs.map(
      (node) => ({ nodeRef: node.id, schemaRef: node.schema.ref })
    )
  );
  assert.notEqual(
    ingress.constraint.inputContract.contractId,
    ingress.constraint.inputContract.sourceInterface[0].schemaRef
  );
  assert.notEqual(
    ingress.constraint.selectedEntryRef,
    ingress.constraint.graphFunctionRef
  );
  assert.notEqual(
    ingress.constraint.selectedEntryRef,
    value.authorities.runtimeCatalog.executionBinding.declarationRef
  );
  assert.equal(
    ingress.constraint.inputContract.owningProductId,
    CATALOG_PRODUCT_ID
  );
  assert.equal(
    ingress.constraint.inputContract.asset.relativePath,
    "contracts/schemas/t270-root-input.schema.json"
  );
  assert.equal(ingress.constraint.payloadAdmissionState, "pending_af14_rejoin");
  assert.equal(ingress.constraint.payloadAdmissionGapRef, T270_ROOT_PAYLOAD_BODY_GAP);
  assert.equal(Object.hasOwn(ingress.constraint, "body"), false);
  assert.equal(Object.hasOwn(ingress.constraint, "input"), false);
  assert.equal(JSON.stringify(ingress).includes("ticket:T-270"), false);
  assert.equal(
    ingress.invocationAuthority.compatibilityState,
    "pending_af15_rejoin"
  );
  assert.equal(
    ingress.invocationAuthority.compatibilityGapRef,
    T270_RUNTIME_COMPATIBILITY_GAP
  );
  assert.deepEqual(
    ingress.invocationAuthority.capabilityGrants.map((grant) => grant.grantRef),
    value.invocation.authority.capabilityGrants.map((grant) => grant.grantRef)
  );
});

test("run.invoke canonicalizes a lawful unique allowlist without making request order authoritative", async () => {
  const value = await fixture("invoke", { reverseAllowlist: true });
  assert.notDeepEqual(
    value.request.allowlist,
    value.authorities.runtimeCatalog.sessionView.allowedEntryRefs
  );
  const ingress = admitFixture(value);
  assert.deepEqual(
    ingress.catalog.allowedEntryRefs,
    value.authorities.runtimeCatalog.sessionView.allowedEntryRefs
  );
});

test("run.invoke start carries only AF-13/AF-14 constraints for every target kind", async () => {
  const targets = [
    { target: { kind: "next" }, expectedHandle: null },
    {
      target: { kind: "graph_function", handle: "gtl://constraint/selected-later" },
      expectedHandle: "gtl://constraint/selected-later"
    },
    {
      target: { kind: "asset", handle: "asset://constraint/selected-later" },
      expectedHandle: "asset://constraint/selected-later"
    }
  ];
  for (const row of targets) {
    const value = await fixture("start", { target: row.target });
    const ingress = admitFixture(value);
    assertAdmittedRunInvokeExecutionIngress(ingress);
    assert.equal(ingress.constraint.kind, "start_constraints");
    assert.equal(ingress.constraint.targetKind, row.target.kind);
    assert.equal(ingress.constraint.targetHandle, row.expectedHandle);
    assert.equal(Object.hasOwn(ingress.constraint, "selectedEntryRef"), false);
    assert.equal(Object.hasOwn(ingress.constraint, "graphFunctionRef"), false);
    assert.equal(Object.hasOwn(ingress.constraint, "inputContract"), false);
    assert.equal(Object.hasOwn(ingress.constraint, "inputPayloadRef"), false);
  }
});

test("run.invoke start preserves an empty admitted view for truthful AF-13 no-action", async () => {
  const base = await fixture("start");
  const empty = deriveRegistrySessionView({
    basis: base.authorities.runtimeCatalog.basis,
    allowedEntryRefs: []
  });
  assert.equal(empty.accepted, true);
  assert.notEqual(empty.view, null);
  assert.deepEqual(empty.view.entries, []);
  const value = await fixture("start", {
    allowlist: [],
    catalogViewRef: empty.view.sessionViewRef,
    catalogViewDigest: stableSha256Digest(empty.view),
    target: { kind: "next" }
  });
  const ingress = admitFixture(value);
  assertAdmittedRunInvokeExecutionIngress(ingress);
  assert.deepEqual(ingress.catalog.allowedEntryRefs, []);
  assert.equal(ingress.constraint.kind, "start_constraints");
  assert.equal(ingress.constraint.targetKind, "next");
});

test("run.invoke refuses stale program, view, member, contract, and grant scope before effects", async () => {
  const wrongProgram = await fixture("invoke", {
    programRef: "program://other",
    programDigest: stableSha256Digest({ program: "other" })
  });
  assert.throws(
    () => admitFixture(wrongProgram),
    /request and authority join differs/u
  );

  const staleView = await fixture("invoke", {
    catalogViewDigest: stableSha256Digest({ view: "stale" })
  });
  assert.throws(
    () => admitFixture(staleView),
    /exact admitted catalog narrowing/u
  );

  const outsideView = await fixture("invoke", {
    allowlist: ["catalog-entry://t270/not-admitted"]
  });
  assert.throws(
    () => admitFixture(outsideView),
    /exact admitted catalog narrowing/u
  );

  const nonmember = await fixture("invoke", {
    canonicalHandle: "catalog-entry://t270/not-admitted"
  });
  assert.throws(
    () => admitFixture(nonmember),
    /not one exact callable ready catalog member/u
  );

  const requestEnvelopeAsInput = await fixture("invoke", {
    useRequestEnvelopeContract: true
  });
  assert.throws(
    () => admitFixture(requestEnvelopeAsInput),
    /invoke payload authority differs/u
  );

  const staleStartView = await fixture("start", {
    catalogViewDigest: stableSha256Digest({ view: "stale-start" })
  });
  assert.throws(
    () => admitFixture(staleStartView),
    /exact admitted catalog narrowing/u
  );

  const wrongGrantScope = await fixture("invoke", {
    grantScopeRef: "binding://other",
    grantScopeDigest: stableSha256Digest({ binding: "other" })
  });
  assert.throws(
    () => admitFixture(wrongGrantScope),
    /invocation authority rejoin projection differs/u
  );
});

test("run.invoke refuses missing installed product manifests and hidden start selection", async () => {
  const value = await fixture("invoke");
  assert.throws(
    () => admitFixture(value, value.authorities.runtimeCatalog.basis, [
      value.authorities.manifests[0]
    ]),
    /installed product manifest set differs/u
  );

  const driftedCatalogManifest = {
    ...value.authorities.manifests[1],
    publicContractCatalog: {
      ...value.authorities.manifests[1].publicContractCatalog,
      rows: value.authorities.manifests[1].publicContractCatalog.rows.map(
        (row) => ({ ...row, authorityRefs: [...row.authorityRefs, "drift:unsealed"] })
      )
    }
  };
  assert.throws(
    () => admitFixture(value, value.authorities.runtimeCatalog.basis, [
      value.authorities.manifests[0],
      driftedCatalogManifest
    ]),
    /contract catalog digest differs from canonical content/u
  );

  await assert.rejects(
    () => fixture("start", { forceSelectedExecutionProgram: true }),
    /execution-program state differs from operation variant/u
  );
});

test("run.invoke refuses an unready projection derived from an admitted catalog", async () => {
  const value = await fixture("invoke");
  const basis = value.authorities.runtimeCatalog.basis;
  const [entry] = basis.projection.runtimeRegistryProjection.entries;
  const unreadyBasis = Object.freeze({
    ...basis,
    executionBindings: Object.freeze(
      basis.executionBindings.map((binding) => Object.freeze({
        ...binding,
        readinessRefs: Object.freeze([])
      }))
    ),
    projection: Object.freeze({
      ...basis.projection,
      runtimeRegistryProjection: Object.freeze({
        ...basis.projection.runtimeRegistryProjection,
        entries: Object.freeze([Object.freeze({
          ...entry,
          readinessRefs: Object.freeze([])
        })])
      })
    })
  });
  assert.throws(
    () => admitFixture(value, unreadyBasis),
    /runtime registry projection content differs from its projectionRef/u
  );
});

test("run.invoke refuses a runtime catalog basis with any broken canonical identity seal", async () => {
  const value = await fixture("invoke");
  const basis = value.authorities.runtimeCatalog.basis;
  const [selectedBinding] = basis.executionBindings;
  const [registryEntry] =
    basis.projection.runtimeRegistryProjection.entries;
  assert.notEqual(selectedBinding, undefined);
  assert.notEqual(registryEntry, undefined);
  const mutations = [
    Object.freeze({
      basis: Object.freeze({
        ...basis,
        basisRef: "admitted-runtime-catalog-basis:sha256:forged"
      }),
      expected: /basisRef does not match canonical basis identity/u
    }),
    Object.freeze({
      basis: Object.freeze({
        ...basis,
        descriptorRefs: Object.freeze([
          ...basis.descriptorRefs,
          "descriptor://t270/forged"
        ])
      }),
      expected: /basisRef does not match canonical basis identity/u
    }),
    Object.freeze({
      basis: Object.freeze({
        ...basis,
        executionBindings: Object.freeze(
          basis.executionBindings.map((binding) =>
            binding.entryRef === selectedBinding.entryRef
              ? Object.freeze({
                  ...binding,
                  sourceEventRefs: Object.freeze([
                    ...binding.sourceEventRefs,
                    "event://t270/forged-binding-source"
                  ])
                })
              : binding
          )
        )
      }),
      expected: /basisRef does not match canonical basis identity/u
    })
  ];
  for (const mutation of mutations) {
    assert.throws(
      () => admitFixture(value, mutation.basis),
      mutation.expected
    );
  }

  const mutatedRegistryProjection = Object.freeze({
    ...basis,
    projection: Object.freeze({
      ...basis.projection,
      runtimeRegistryProjection: Object.freeze({
        ...basis.projection.runtimeRegistryProjection,
        entries: Object.freeze([
          Object.freeze({
            ...registryEntry,
            namespace: "t270-forged-registry-namespace"
          })
        ])
      })
    })
  });
  assert.throws(
    () => admitFixture(value, mutatedRegistryProjection),
    /runtime registry projection content differs from its projectionRef/u
  );

  const mutatedOpaqueProjection = Object.freeze({
    ...basis,
    projection: Object.freeze({
      ...basis.projection,
      opaqueAssetEntries: Object.freeze([Object.freeze({
        kind: "opaque_catalog_asset_projection",
        workspaceId: basis.workspaceId,
        bindingId: basis.bindingId,
        catalogId: basis.catalogId,
        entryRef: "catalog-entry://t270/forged-overlay",
        declarationRef: "declaration://t270/forged-overlay",
        declarationDigest: DIGEST,
        libraryScope: "product",
        assetKind: "overlay",
        namespace: CATALOG_PRODUCT_ID,
        ownerRef: "fixture",
        version: CATALOG_PRODUCT_VERSION,
        descriptorRef: CATALOG_DESCRIPTOR_REF,
        contributionManifestRef: CATALOG_CONTRIBUTION_REF,
        resolvedLockRef: basis.resolvedLockRef,
        assetPath: "overlays/forged.json",
        schemaId: "schema://t270/forged-overlay",
        schemaVersion: "1.0.0",
        schemaDigest: DIGEST,
        assetDigest: DIGEST,
        authorityRefs: Object.freeze([]),
        provenanceRefs: Object.freeze([]),
        readinessRefs: Object.freeze(["readiness://t270/forged-overlay"]),
        proofRefs: Object.freeze([]),
        policyRefs: Object.freeze([]),
        refinementOfEntryRef: null,
        overrideOfEntryRef: null,
        sourceEventRefs: Object.freeze(["event://t270/forged-overlay"])
      })])
    })
  });
  assert.throws(
    () => admitFixture(value, mutatedOpaqueProjection),
    /runtime catalog projection content differs from its projectionRef/u
  );
});

test("run.invoke ingress seal detects post-admission mutation", async () => {
  const value = await fixture("invoke");
  const ingress = admitFixture(value);
  assert.throws(
    () => assertAdmittedRunInvokeExecutionIngress({
      ...ingress,
      workspace: { ...ingress.workspace, workspaceId: "workspace:other" }
    }),
    /seal differs/u
  );
});
