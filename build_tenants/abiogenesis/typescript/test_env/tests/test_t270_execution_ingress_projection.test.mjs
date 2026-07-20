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
  resolveSelectedCatalogExecutionFromSessionView
} from "../../build/semantic/code/src/abg/m03/runner/selected_catalog_execution.js";
import {
  constructCapabilityGrant,
  constructInvocationAuthority,
  constructPublicContractCatalog,
  constructPublicInvocation,
  definitionKeySchemaFor,
  publicContractCatalogCoordinate
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  admitPrivateP1PublicOperationPacket,
  preparePrivateRunInvokeExecution,
  preparePrivateRunInvokeExecutionFromPacket
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "../../build/semantic/code/src/app/m04/public_contracts/operation_publication.js";
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
  const workspaceManifest = Object.freeze({
    kind: "abg_workspace_manifest",
    schemaVersion: 1,
    workspaceId: "workspace:t270",
    root: WORKSPACE_ROOT,
    authorityMode: "clean_no_project_authority",
    scaffoldState: "none",
    bindingRef: ".abiogenesis/toolchain-binding.json",
    configurationRefs: Object.freeze([]),
    createdAt: "2026-07-18T00:00:00.000Z",
    actorRef: "actor:t270",
    provenanceRefs: Object.freeze(["provenance:t270"])
  });
  const binding = constructToolchainWorkspaceBindingV3({
    workspaceId: workspaceManifest.workspaceId,
    workspaceManifestDigest: stableSha256Digest(workspaceManifest),
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
  const records = new Map([
    [abgProduct.manifestPath, abgManifest],
    [catalogProduct.manifestPath, catalogManifest],
    [`${catalogProduct.productRoot}/contracts/schemas/t270-root-input.schema.json`, ROOT_INPUT_SCHEMA]
  ]);
  const context = Object.freeze({
    kind: "bound_workspace",
    workspaceManifest,
    binding,
    publicContractCatalog: abgContractCatalog,
    effects: Object.freeze({
      readRecord: async (absolutePath) => records.get(absolutePath) ?? null,
      readInputAsset: async () => null,
      readRuntimeEventBytes: async () => new Uint8Array(),
      createRuntimeEventSink: () => () => {},
      operatorCapabilityFactories: Object.freeze({})
    })
  });
  return Object.freeze({
    binding,
    context,
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
  const publishedDefinition =
    projectPublishedPublicOperationDefinitionFromPrivate(definition);
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
    definitionDigest: publishedDefinition.definitionDigest,
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
      definitionDigest: publishedDefinition.definitionDigest,
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
      definitionDigest: publishedDefinition.definitionDigest,
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
      definitionDigest: publishedDefinition.definitionDigest,
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

function prepareFixture(
  value,
  context = value.authorities.context,
  runtimeCatalogBasis = value.authorities.runtimeCatalog.basis
) {
  return preparePrivateRunInvokeExecution({
    family: value.admitted.family,
    definition: value.definition,
    rawInvocation: value.invocation,
    causationEventRefs: [],
    priorEvents: [],
    context,
    runtimeCatalogBasis,
    authorityProgram: value.authorities.world.authorityProgram
  });
}

test("selected session view resolves the one exact ready callable GraphFunction", async () => {
  const authorities = await installedAuthorities();
  const { basis, sessionView, executionBinding } = authorities.runtimeCatalog;
  const selected = resolveSelectedCatalogExecutionFromSessionView({
    catalogBasis: basis,
    sessionView,
    selectedGraphFunctionRef: executionBinding.graphFunctionHandle,
    label: "T-270 selected session view"
  });
  assert.equal(selected, executionBinding);

  const companionEntry = sessionView.entries.find(
    (entry) => entry.entryRef === CATALOG_COMPANION_ENTRY_REF
  );
  assert.notEqual(companionEntry, undefined);
  assert.equal(companionEntry.entryKind, "graph_function");
  const companionBinding = basis.executionBindings.find(
    (binding) => binding.entryRef === CATALOG_COMPANION_ENTRY_REF
  );
  assert.notEqual(companionBinding, undefined);
  const companion = resolveSelectedCatalogExecutionFromSessionView({
    catalogBasis: basis,
    sessionView,
    selectedGraphFunctionRef: companionEntry.graphFunctionRef,
    label: "T-270 companion session view"
  });
  assert.equal(companion, companionBinding);
});

test("selected session view refuses stale view truth and absent GraphFunction refs", async () => {
  const authorities = await installedAuthorities();
  const { basis, sessionView } = authorities.runtimeCatalog;
  const staleView = Object.freeze({
    ...sessionView,
    entries: Object.freeze([...sessionView.entries].reverse())
  });
  assert.throws(
    () => resolveSelectedCatalogExecutionFromSessionView({
      catalogBasis: basis,
      sessionView: staleView,
      selectedGraphFunctionRef: sessionView.entries[0].graphFunctionRef,
      label: "T-270 stale session view"
    }),
    /not the exact narrowing/u
  );
  assert.throws(
    () => resolveSelectedCatalogExecutionFromSessionView({
      catalogBasis: basis,
      sessionView,
      selectedGraphFunctionRef: "graph-function:\/\/t270\/absent",
      label: "T-270 absent GraphFunction"
    }),
    /must identify one ready callable session entry; got 0/u
  );
});

test("run.invoke preparation admits installed input truth without selecting execution authority", async () => {
  const value = await fixture("invoke");
  const prepared = await prepareFixture(value);
  assert.equal(prepared.kind, "prepared_run_invoke_execution");
  assert.equal(prepared.variant, "invoke");
  assert.equal(prepared.af13Constraint.kind, "invoke_exact_member_constraint");
  assert.equal(
    prepared.af13Constraint.candidateEntryRef,
    value.authorities.runtimeCatalog.executionBinding.entryRef
  );
  assert.equal(
    prepared.af13Constraint.inputContract.contractId,
    value.authorities.inputContract.contractId
  );
  assert.equal(
    Object.hasOwn(prepared.af13Constraint, "selectedExecutionBinding"),
    false
  );
  assert.equal(
    stableSha256Digest(prepared.admittedInvokeValue),
    stableSha256Digest(value.request.input)
  );
  assert.equal(prepared.installedPublicSchemaAuthoritySet.schemas.length, 1);
  assert.deepEqual(
    prepared.installedPublicSchemaAuthoritySet.schemas[0].schema,
    ROOT_INPUT_SCHEMA
  );

  const packet = admitPrivateP1PublicOperationPacket({
    family: value.admitted.family,
    definition: value.definition,
    rawInvocation: value.invocation,
    causationEventRefs: [],
    priorEvents: []
  });
  const fromPacket = await preparePrivateRunInvokeExecutionFromPacket({
    definition: value.definition,
    packet,
    context: value.authorities.context,
    runtimeCatalogBasis: value.authorities.runtimeCatalog.basis,
    authorityProgram: value.authorities.world.authorityProgram
  });
  assert.equal(
    fromPacket.packet,
    packet,
    "catalog preparation must continue from the one admitted packet authority"
  );
});

test("run.invoke preparation derives canonical view order and retains start constraints", async () => {
  const invoke = await fixture("invoke", { reverseAllowlist: true });
  const preparedInvoke = await prepareFixture(invoke);
  assert.deepEqual(
    preparedInvoke.sessionView.allowedEntryRefs,
    invoke.authorities.runtimeCatalog.sessionView.allowedEntryRefs
  );

  for (const row of [
    { target: { kind: "next" }, expectedHandle: null },
    {
      target: {
        kind: "graph_function",
        handle: invoke.authorities.runtimeCatalog.executionBinding.entryRef
      },
      expectedHandle: invoke.authorities.runtimeCatalog.executionBinding.entryRef
    }
  ]) {
    const value = await fixture("start", { target: row.target });
    const prepared = await prepareFixture(value);
    assert.equal(prepared.variant, "start");
    assert.equal(prepared.af13Constraint.kind, "start_constraints");
    assert.equal(prepared.af13Constraint.targetKind, row.target.kind);
    assert.equal(prepared.af13Constraint.targetHandle, row.expectedHandle);
    assert.equal(prepared.installedPublicSchemaAuthoritySet, null);
    assert.equal(prepared.admittedInvokeValue, null);
  }
});

test("run.invoke preparation refuses unsupported asset ownership and missing installed truth", async () => {
  const asset = await fixture("start", {
    target: { kind: "asset", handle: "asset://t270/unowned" }
  });
  await assert.rejects(
    () => prepareFixture(asset),
    /semantic_not_realized:gap:\/\/abg\/t270\/start-asset-ownership-projection/u
  );

  const value = await fixture("invoke");
  const missingManifestContext = Object.freeze({
    ...value.authorities.context,
    effects: Object.freeze({
      ...value.authorities.context.effects,
      readRecord: async (absolutePath) =>
        absolutePath === value.authorities.binding.products[1].manifestPath
          ? null
          : value.authorities.context.effects.readRecord(absolutePath)
    })
  });
  await assert.rejects(
    () => prepareFixture(value, missingManifestContext),
    /bound manifest is missing/u
  );
});

test("run.invoke preparation refuses stale program, catalog view, and input contract", async () => {
  const wrongProgram = await fixture("invoke", {
    programRef: "program://other",
    programDigest: stableSha256Digest({ program: "other" })
  });
  await assert.rejects(
    () => prepareFixture(wrongProgram),
    /request and authority join differs/u
  );

  const staleView = await fixture("invoke", {
    catalogViewDigest: stableSha256Digest({ view: "stale" })
  });
  await assert.rejects(
    () => prepareFixture(staleView),
    /exact admitted catalog narrowing/u
  );

  const requestEnvelopeAsInput = await fixture("invoke", {
    useRequestEnvelopeContract: true
  });
  await assert.rejects(
    () => prepareFixture(requestEnvelopeAsInput),
    /invoke payload authority differs/u
  );
});
