// Validates: T-223 DS-1 M03 runtime-catalog slice
// Validates: REQ-P-CATALOG-006..008, REQ-P-CATALOG-016..017, REQ-P-CATALOG-023..025

import test from "node:test";
import assert from "node:assert/strict";

import * as m03Public from "../../build/semantic/code/src/abg/m03/index.js";
import {
  RUNTIME_EVENT_KIND_VALUES
} from "../../build/semantic/code/src/abg/m03/contracts/carriers.js";
import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import {
  admitBoundWorkspaceCatalog,
  admitOpaqueCatalogAssetDeclaration,
  deriveRegistrySessionView,
  projectRuntimeCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  RUN_INDEPENDENT_EVENT_SCOPE_CLASSES,
  runtimeEventsForBasis
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_support.js";
import {
  constructNode,
  constructNodeTypeGraphFunction,
  emptySerializedAttrs,
  identity
} from "../../build/semantic/code/src/gtl/m01/index.js";
import {
  constructContractRef,
  constructJob,
  constructGtlLibraryEntryDeclaration,
  constructModule,
  constructProductRegistryStartupConfig
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  deriveRegistrySessionViewRef
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const SHA_A = `sha256:${"a".repeat(64)}`;
const SHA_B = `sha256:${"b".repeat(64)}`;

function assetSurface(kind) {
  return {
    kind,
    requiredContexts: ["context://t223/catalog"],
    standardsRefs: ["specification/requirements/product/REQ-P-CATALOG.md"],
    outputContractRefs: [`contract://t223/${kind}`],
    constructorRefs: [],
    constructorInputAssetKinds: [],
    rendererRefs: [],
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: [],
    clauseKindRefs: [],
    authoritySlots: [],
    proofObligationRefs: [`proof://t223/${kind}`]
  };
}

function catalogNode(name, typeRef = null) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://t223/${name}` },
    typeRef,
    markov: ["catalog:ready"],
    assetSurface: assetSurface(name.toLowerCase()),
    tags: ["t223"]
  });
}

function graphFunction() {
  return identity([catalogNode("HelloWorldInput")], {
    name: "graph-function://t223/hello-world"
  });
}

function nodeTypeGraphFunction() {
  return constructNodeTypeGraphFunction(
    catalogNode("HelloWorldInput", "node-type://t223/HelloWorldInput")
  );
}

function publishedModule(name, graphFunctions) {
  return constructModule({
    name,
    graphs: [],
    graphFunctions,
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: graphFunctions.map((graphFunction, index) =>
      constructJob({
        name: `${name}-job-${String(index)}`,
        contracts: [
          constructContractRef({
            kind: "graph_function",
            targetId: graphFunction.id
          })
        ],
        roles: [],
        tags: ["t223"],
        policyHooks: emptySerializedAttrs()
      })
    ),
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

function runtimeDeclaration(overrides = {}) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t223/system/hello-world",
    entryRef: "catalog-entry://t223/system/hello-world",
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.system",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: graphFunction().id,
    interfaceRef: "interface://t223/hello-world",
    sourceContractRef: "contract://t223/hello-world-input",
    targetContractRef: "contract://t223/hello-world-output",
    contextRefs: ["context://t223/catalog"],
    authorityRefs: ["authority://abg/runtime"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t223/system"],
    readinessRefs: ["readiness://t223/ready"],
    proofRefs: ["proof://t223/system"],
    policyRefs: ["policy://t223/default"],
    declarationSourceRefs: ["gtl-module://t223/system"],
    ...overrides
  });
}

function productConfig() {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t223/fixture",
    productNamespace: "t223.fixture",
    ownerRef: "owner://t223/fixture",
    version: "0.0.1",
    enabledLibraryRefs: [],
    readinessRefs: ["readiness://t223/ready"],
    proofRefs: ["proof://t223/fixture"],
    policyRefs: ["policy://t223/default"],
    configSourceRefs: ["contribution://t223/fixture"]
  });
}

function nodeTypeDeclaration() {
  const nodeType = nodeTypeGraphFunction();
  return {
    nodeType,
    declaration: runtimeDeclaration({
      declarationRef: "declaration://t223/product/hello-world-input-type",
      entryRef: "catalog-entry://t223/product/hello-world-input-type",
      libraryScope: "product",
      entryKind: "node_type",
      namespace: "t223.fixture",
      ownerRef: "owner://t223/fixture",
      version: "0.0.1",
      graphFunctionRef: nodeType.name,
      interfaceRef: "interface://t223/hello-world-input-type",
      sourceContractRef: "contract://t223/hello-world-input",
      targetContractRef: "contract://t223/hello-world-input",
      authorityRefs: ["authority://gtl/typecheck"],
      provenanceRefs: ["provenance://t223/fixture"],
      proofRefs: ["proof://t223/node-type"],
      declarationSourceRefs: ["gtl-module://t223/fixture"]
    })
  };
}

function opaqueAssetRaw(overrides = {}) {
  return {
    kind: "opaque_catalog_asset_declaration",
    workspaceId: "workspace://t223",
    bindingId: "binding://t223",
    catalogId: "catalog://t223",
    entryRef: "catalog-entry://t223/product/default-overlay",
    declarationRef: "declaration://t223/product/default-overlay",
    declarationDigest: SHA_A,
    libraryScope: "product",
    assetKind: "overlay",
    namespace: "t223.fixture",
    ownerRef: "owner://t223/fixture",
    version: "0.0.1",
    descriptorRef: "descriptor://t223/fixture",
    contributionManifestRef: "contribution://t223/fixture",
    resolvedLockRef: "lock://t223",
    assetPath: "catalog/default-overlay.json",
    schemaId: "abg.schema.catalog-overlay-declaration",
    schemaVersion: "1.0.0",
    schemaDigest: SHA_A,
    assetDigest: SHA_B,
    authorityRefs: ["authority://t223/overlay"],
    provenanceRefs: ["provenance://t223/fixture"],
    readinessRefs: ["readiness://t223/ready"],
    proofRefs: ["proof://t223/overlay"],
    policyRefs: ["policy://t223/default"],
    refinementOfEntryRef: null,
    overrideOfEntryRef: null,
    causationEventRefs: ["event://t223/binding-admitted"],
    correlationId: "correlation://t223/catalog-admission",
    ...overrides
  };
}

function productBatch(declarations) {
  return {
    kind: "bound_catalog_product_batch",
    descriptorRef: "descriptor://t223/fixture",
    contributionManifestRef: "contribution://t223/fixture",
    productStartupConfig: productConfig(),
    declarations
  };
}

function catalogBatch(overrides = {}) {
  const gf = graphFunction();
  const { nodeType, declaration } = nodeTypeDeclaration();
  return {
    kind: "bound_catalog_admission_batch",
    workspaceId: "workspace://t223",
    bindingId: "binding://t223",
    catalogId: "catalog://t223",
    resolvedLockRef: "lock://t223",
    systemDeclarations: [
      {
        kind: "runtime_library_entry",
        declaration: runtimeDeclaration({ graphFunctionRef: gf.id }),
        moduleRef: "gtl-module://t223/system",
        module: publishedModule("t223-system", [gf])
      }
    ],
    orderedProductBatches: [
      productBatch([
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: "gtl-module://t223/fixture",
          module: publishedModule("t223-fixture-node-types", [nodeType])
        },
        {
          kind: "opaque_catalog_asset",
          declaration: admitOpaqueCatalogAssetDeclaration(opaqueAssetRaw())
        }
      ])
    ],
    causationEventRefs: ["event://t223/binding-admitted"],
    correlationId: "correlation://t223/catalog-admission",
    ...overrides
  };
}

function captureSink() {
  const events = [];
  return {
    events,
    sink(event) {
      events.push(event);
    }
  };
}

test("T-223 admits the exact opaque overlay carrier and rejects malformed or widened input", () => {
  assert.equal(m03Public.admitBoundWorkspaceCatalog, admitBoundWorkspaceCatalog);
  assert.equal(
    m03Public.admitOpaqueCatalogAssetDeclaration,
    admitOpaqueCatalogAssetDeclaration
  );
  const admitted = admitOpaqueCatalogAssetDeclaration(opaqueAssetRaw());
  assert.equal(admitted.kind, "opaque_catalog_asset_declaration");
  assert.equal(admitted.assetKind, "overlay");
  assert.equal(Object.isFrozen(admitted), true);
  assert.equal(Object.isFrozen(admitted.authorityRefs), true);

  assert.throws(
    () => admitOpaqueCatalogAssetDeclaration({ ...opaqueAssetRaw(), executableRef: "source://no" }),
    /unexpected field "executableRef"/u
  );
  assert.throws(
    () => admitOpaqueCatalogAssetDeclaration(opaqueAssetRaw({ assetPath: "../escape.json" })),
    /normalized product-relative path/u
  );
  assert.throws(
    () => admitOpaqueCatalogAssetDeclaration(opaqueAssetRaw({ assetKind: "plugin" })),
    /assetKind must equal "overlay"/u
  );
  assert.throws(
    () => admitOpaqueCatalogAssetDeclaration(opaqueAssetRaw({ proofRefs: ["proof://same", "proof://same"] })),
    /duplicate value/u
  );
});

test("T-223 admits one projection-threaded catalog and derives an all-kind non-widening session view", () => {
  const captured = captureSink();
  const result = admitBoundWorkspaceCatalog(catalogBatch(), captured.sink);

  assert.equal(result.accepted, true);
  assert.notEqual(result.basis, null);
  assert.equal(result.basis.executionBindings.length, 1);
  assert.equal(
    result.basis.executionBindings[0].graphFunctionId,
    result.basis.executionBindings[0].graphFunction.id
  );
  assert.deepEqual(
    result.admissionEvents.map((event) => event.kind),
    ["registry_entry_admitted", "registry_entry_admitted", "catalog_asset_admitted"]
  );
  assert.deepEqual(
    result.admissionEvents.at(-1).causationEventRefs,
    ["event://t223/binding-admitted"]
  );
  assert.deepEqual(result.admissionEvents, captured.events);
  assert.equal(result.projection.runtimeRegistryProjection.entries.length, 2);
  assert.equal(result.projection.opaqueAssetEntries.length, 1);

  const session = deriveRegistrySessionView({ basis: result.basis });
  assert.equal(session.accepted, true);
  assert.notEqual(session.view, null);
  assert.deepEqual(
    session.view.entries.map((entry) => [entry.entryKind, entry.callable]),
    [
      ["overlay", false],
      ["node_type", false],
      ["graph_function", true]
    ]
  );
  assert.equal(
    session.view.sessionViewRef,
    deriveRegistrySessionViewRef({
      catalogId: result.basis.catalogId,
      catalogProjectionRef: result.basis.runtimeCatalogProjectionRef,
      allowedEntryRefs: session.view.allowedEntryRefs
    })
  );
  const overlay = session.view.entries.find((entry) => entry.entryKind === "overlay");
  assert.notEqual(overlay, undefined);
  assert.equal("graphFunctionRef" in overlay, false);
  assert.equal("interfaceRef" in overlay, false);
  assert.equal("sourceContractRef" in overlay, false);
  assert.equal("targetContractRef" in overlay, false);

  const empty = deriveRegistrySessionView({
    basis: result.basis,
    allowedEntryRefs: []
  });
  assert.equal(empty.accepted, true);
  assert.deepEqual(empty.view.allowedEntryRefs, []);
  assert.deepEqual(empty.view.entries, []);

  const duplicate = deriveRegistrySessionView({
    basis: result.basis,
    allowedEntryRefs: [
      "catalog-entry://t223/system/hello-world",
      "catalog-entry://t223/system/hello-world"
    ]
  });
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.view, null);
  assert.equal(duplicate.residuals[0].reason, "duplicate_handle");

  const unknown = deriveRegistrySessionView({
    basis: result.basis,
    allowedEntryRefs: ["catalog-entry://t223/missing"]
  });
  assert.equal(unknown.accepted, false);
  assert.equal(unknown.residuals[0].reason, "unknown_handle");

  const missingExecutionBinding = deriveRegistrySessionView({
    basis: { ...result.basis, executionBindings: [] },
    allowedEntryRefs: ["catalog-entry://t223/system/hello-world"]
  });
  assert.equal(missingExecutionBinding.accepted, false);
  assert.equal(missingExecutionBinding.residuals[0].reason, "inadmissible");
});

test("T-223 admits one exact catalog invocation assembly and rejects forged view or dual basis", async () => {
  const captured = captureSink();
  const result = admitBoundWorkspaceCatalog(catalogBatch(), captured.sink);
  assert.equal(result.accepted, true);
  assert.notEqual(result.basis, null);
  const session = deriveRegistrySessionView({
    basis: result.basis,
    allowedEntryRefs: ["catalog-entry://t223/system/hello-world"]
  });
  assert.equal(session.accepted, true);
  assert.notEqual(session.view, null);
  const input = {
    basis: result.basis,
    sessionView: session.view,
    entryRef: "catalog-entry://t223/system/hello-world",
    interfaceRef: "interface://t223/hello-world",
    workspaceRoot: "/tmp/t223-runtime-catalog",
    inputBinding: {
      assetRef: "input://t223/hello",
      assetType: "schema://t223/hello",
      uri: "data:application/json,%7B%7D"
    },
    inputSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      additionalProperties: false
    },
    inputValue: {},
    until: "converged",
    runtimeIdentity: {
      workerId: "worker://t223",
      backendId: "backend://t223",
      buildId: "build://t223",
      resolvedRuntimeRef: "runtime://t223"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://t223/default",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    },
    runtimeEvents: captured.events,
    eventSink: () => {},
    standardPluginRefs: [],
    capabilityProvenanceRefs: [],
    actorRef: "actor://t223/operator",
    invocationId: "invocation://t223/catalog",
    requestId: "request://t223/catalog",
    correlationId: "correlation://t223/invoke"
  };
  const admitted = m03Public.assembleCatalogInvocation(input);
  assert.equal(admitted.accepted, true, JSON.stringify(admitted));

  const forged = m03Public.assembleCatalogInvocation({
    ...input,
    sessionView: {
      ...session.view,
      entries: []
    }
  });
  assert.equal(forged.accepted, false);
  assert.equal(forged.code, "view_mismatch");

  await assert.rejects(
    m03Public.runEngineStartAsync({
      ...admitted.assembly.engineStartRequest,
      runtimeRegistryStartup: {
        systemDeclarations: [],
        productDeclarations: [],
        correlationId: "correlation://t223/dual-basis"
      }
    }),
    /mutually exclusive/u
  );
});

test("T-223 validates node-type identity before runtime-registry admission", () => {
  const { nodeType, declaration } = nodeTypeDeclaration();
  const invalidNodeType = Object.freeze({
    ...nodeType,
    effects: Object.freeze(["filesystem"])
  });
  const captured = captureSink();
  const result = admitBoundWorkspaceCatalog(
    catalogBatch({
      systemDeclarations: [],
      orderedProductBatches: [
        productBatch([
          {
            kind: "runtime_library_entry",
            declaration,
            moduleRef: "gtl-module://t223/fixture",
            module: publishedModule("t223-invalid-node-type", [invalidNodeType])
          }
        ])
      ]
    }),
    captured.sink
  );

  assert.equal(result.accepted, false);
  assert.equal(result.admissionEvents[0].kind, "registry_entry_rejected");
  assert.equal(
    result.rowDispositions[0].rejectionReason,
    "node_type_not_identity_graph_function"
  );
  assert.deepEqual(result.projection.runtimeRegistryProjection.entries, []);
});

test("T-223 refuses unresolved and ambiguous published graph functions before registry admission", () => {
  const published = graphFunction();
  const unresolvedSink = captureSink();
  const unresolved = admitBoundWorkspaceCatalog(
    catalogBatch({
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration: runtimeDeclaration({
            graphFunctionRef: "graph-function://t223/missing"
          }),
          moduleRef: "gtl-module://t223/system",
          module: publishedModule("t223-unresolved", [published])
        }
      ],
      orderedProductBatches: []
    }),
    unresolvedSink.sink
  );
  assert.equal(unresolved.accepted, false);
  assert.equal(unresolved.basis, null);
  assert.equal(unresolved.admissionEvents[0].kind, "registry_entry_rejected");
  assert.equal(unresolved.rowDispositions[0].rejectionReason, "unresolved_graph_function");
  assert.deepEqual(unresolved.projection.runtimeRegistryProjection.entries, []);

  const second = identity([catalogNode("OtherInput")], {
    name: "graph-function://t223/other"
  });
  const ambiguousHandle = "graph-function://t223/ambiguous";
  const byId = Object.freeze({
    ...published,
    id: ambiguousHandle,
    name: "graph-function://t223/by-id"
  });
  const byName = Object.freeze({
    ...second,
    id: "graph-function://t223/by-name-id",
    name: ambiguousHandle
  });
  const ambiguousSink = captureSink();
  const ambiguous = admitBoundWorkspaceCatalog(
    catalogBatch({
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration: runtimeDeclaration({ graphFunctionRef: ambiguousHandle }),
          moduleRef: "gtl-module://t223/system",
          module: publishedModule("t223-ambiguous", [byId, byName])
        }
      ],
      orderedProductBatches: []
    }),
    ambiguousSink.sink
  );
  assert.equal(ambiguous.accepted, false);
  assert.equal(ambiguous.basis, null);
  assert.equal(ambiguous.rowDispositions[0].rejectionReason, "ambiguous_graph_function");
  assert.deepEqual(ambiguous.projection.runtimeRegistryProjection.entries, []);
});

test("T-223 preserves cross-arm conflicts, exact idempotence, and ordinal replay truth", () => {
  const firstSink = captureSink();
  const first = admitBoundWorkspaceCatalog(catalogBatch(), firstSink.sink);

  const idempotentSink = captureSink();
  const idempotent = admitBoundWorkspaceCatalog(
    catalogBatch(),
    idempotentSink.sink,
    first.admissionEvents
  );
  assert.equal(idempotent.accepted, true);
  assert.deepEqual(idempotent.admissionEvents, []);
  assert.deepEqual(
    idempotent.rowDispositions.map((row) => row.disposition),
    ["already_admitted_exact", "already_admitted_exact", "already_admitted_exact"]
  );

  const conflictAsset = admitOpaqueCatalogAssetDeclaration(
    opaqueAssetRaw({
      entryRef: "catalog-entry://t223/system/hello-world",
      declarationRef: "declaration://t223/product/colliding-overlay"
    })
  );
  const conflictSink = captureSink();
  const conflict = admitBoundWorkspaceCatalog(
    catalogBatch({
      orderedProductBatches: [
        productBatch([{ kind: "opaque_catalog_asset", declaration: conflictAsset }])
      ]
    }),
    conflictSink.sink
  );
  assert.equal(conflict.accepted, false);
  assert.equal(conflict.admissionEvents.at(-1).kind, "catalog_asset_rejected");
  assert.deepEqual(
    conflict.admissionEvents.at(-1).causationEventRefs,
    ["event://t223/binding-admitted"]
  );
  assert.equal(conflict.rowDispositions.at(-1).rejectionReason, "identity_conflict");
  assert.equal(conflict.projection.opaqueAssetEntries.length, 0);

  const rejectedAsset = admitOpaqueCatalogAssetDeclaration(
    opaqueAssetRaw({
      entryRef: "catalog-entry://t223/product/rejected-overlay",
      declarationRef: "declaration://t223/product/rejected-overlay",
      descriptorRef: "descriptor://t223/wrong"
    })
  );
  const rejectedSink = captureSink();
  const withRejected = admitBoundWorkspaceCatalog(
    catalogBatch({
      systemDeclarations: [],
      orderedProductBatches: [
        productBatch([{ kind: "opaque_catalog_asset", declaration: rejectedAsset }])
      ]
    }),
    rejectedSink.sink,
    first.admissionEvents
  );
  assert.equal(withRejected.accepted, false);
  assert.equal(withRejected.rowDispositions[0].rejectionReason, "descriptor_mismatch");
  assert.equal(withRejected.projection.rejectedOpaqueAssetEntries.length, 1);

  const replayed = projectRuntimeCatalog({
    workspaceId: "workspace://t223",
    bindingId: "binding://t223",
    catalogId: "catalog://t223",
    events: [...withRejected.admissionEvents, ...first.admissionEvents]
  });
  assert.equal(replayed.projectionRef, withRejected.projection.projectionRef);
  assert.deepEqual(replayed.sourceEventRefs, withRejected.projection.sourceEventRefs);
});

test("T-223 routes duplicate product handles through M03 rejection event truth", () => {
  const published = graphFunction();
  const shared = {
    entryRef: "catalog-entry://t223/product/duplicate",
    libraryScope: "product",
    namespace: "t223.fixture",
    ownerRef: "owner://t223/fixture",
    version: "0.0.1",
    graphFunctionRef: published.id,
    interfaceRef: "interface://t223/duplicate",
    sourceContractRef: "contract://t223/duplicate-input",
    targetContractRef: "contract://t223/duplicate-output",
    authorityRefs: ["authority://t223/duplicate"],
    provenanceRefs: ["provenance://t223/fixture"],
    readinessRefs: ["readiness://t223/ready"],
    policyRefs: ["policy://t223/default"],
    declarationSourceRefs: ["gtl-module://t223/duplicate"]
  };
  const first = runtimeDeclaration({
    ...shared,
    declarationRef: "declaration://t223/product/duplicate-a",
    proofRefs: ["proof://t223/duplicate-a"]
  });
  const shadow = runtimeDeclaration({
    ...shared,
    declarationRef: "declaration://t223/product/duplicate-b",
    proofRefs: ["proof://t223/duplicate-b"]
  });
  const row = (declaration) => ({
    kind: "runtime_library_entry",
    declaration,
    moduleRef: "gtl-module://t223/duplicate",
    module: publishedModule("t223-duplicate", [published])
  });
  const captured = captureSink();
  const result = admitBoundWorkspaceCatalog(
    catalogBatch({
      systemDeclarations: [],
      orderedProductBatches: [
        productBatch([row(first)]),
        productBatch([row(shadow)])
      ]
    }),
    captured.sink
  );

  assert.equal(result.accepted, false);
  assert.deepEqual(
    result.admissionEvents.map((event) => event.kind),
    ["registry_entry_admitted", "registry_entry_rejected"]
  );
  assert.equal(result.admissionEvents[1].rejectionReason, "identity_conflict");
  assert.deepEqual(captured.events, result.admissionEvents);
});

test("T-223 publishes and admits both workspace-scoped event kinds", () => {
  assert.equal(RUNTIME_EVENT_KIND_VALUES.includes("catalog_asset_admitted"), true);
  assert.equal(RUNTIME_EVENT_KIND_VALUES.includes("catalog_asset_rejected"), true);
  assert.equal(RUN_INDEPENDENT_EVENT_SCOPE_CLASSES.catalog_asset_admitted, "workspace");
  assert.equal(RUN_INDEPENDENT_EVENT_SCOPE_CLASSES.catalog_asset_rejected, "workspace");

  const firstSink = captureSink();
  const first = admitBoundWorkspaceCatalog(catalogBatch(), firstSink.sink);
  const rejectedAsset = admitOpaqueCatalogAssetDeclaration(
    opaqueAssetRaw({
      entryRef: "catalog-entry://t223/product/rejected-event",
      declarationRef: "declaration://t223/product/rejected-event",
      resolvedLockRef: "lock://t223/wrong"
    })
  );
  const rejectedSink = captureSink();
  const rejected = admitBoundWorkspaceCatalog(
    catalogBatch({
      systemDeclarations: [],
      orderedProductBatches: [
        productBatch([{ kind: "opaque_catalog_asset", declaration: rejectedAsset }])
      ]
    }),
    rejectedSink.sink,
    first.admissionEvents
  );
  const assetEvents = [...first.admissionEvents, ...rejected.admissionEvents].filter(
    (event) => event.kind.startsWith("catalog_asset_")
  );
  assert.deepEqual(
    assetEvents.map((event) => event.kind),
    ["catalog_asset_admitted", "catalog_asset_rejected"]
  );
  for (const event of assetEvents) {
    assert.doesNotThrow(() => assertRuntimeEvent(event));
    assert.doesNotThrow(() => assertRuntimeEvent(JSON.parse(JSON.stringify(event))));
  }
  assert.deepEqual(
    runtimeEventsForBasis({ id: "basis://t223/unrelated" }, assetEvents),
    assetEvents
  );

  assert.throws(
    () =>
      projectRuntimeCatalog({
        workspaceId: "workspace://t223/other",
        bindingId: "binding://t223",
        catalogId: "catalog://t223",
        events: [assetEvents[0]]
      }),
    /different workspace binding or catalog/u
  );

  const canonicalAsset = assetEvents[0];
  const {
    eventId: ignoredEventId,
    eventTime: ignoredEventTime,
    eventTimeUnixMs: ignoredEventTimeUnixMs,
    eventAdmissionOrdinal: ignoredEventAdmissionOrdinal,
    ...rawAsset
  } = canonicalAsset;
  void ignoredEventId;
  void ignoredEventTime;
  void ignoredEventTimeUnixMs;
  void ignoredEventAdmissionOrdinal;
  assert.throws(
    () =>
      projectRuntimeCatalog({
        workspaceId: "workspace://t223",
        bindingId: "binding://t223",
        catalogId: "catalog://t223",
        events: [rawAsset]
      }),
    /eventId|canonical event envelope/u
  );

  const unrelatedSameOrdinal = {
    kind: "workspace_installation_admitted",
    installResult: "installed",
    targetRoot: "/tmp/t223",
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0",
    resolvedRuntimeRef: "package:@abiogenesis/typescript-tenant@5.0.0",
    installManifestPath: "/tmp/t223/.abiogenesis/install-manifest.json",
    installerEcosystem: "abg_typescript",
    causationEventRefs: [],
    correlationId: "correlation://t223/install",
    eventId: "runtime-event://t223/ordinal-collision",
    eventTime: canonicalAsset.eventTime,
    eventTimeUnixMs: canonicalAsset.eventTimeUnixMs,
    eventAdmissionOrdinal: canonicalAsset.eventAdmissionOrdinal
  };
  assert.throws(
    () =>
      projectRuntimeCatalog({
        workspaceId: "workspace://t223",
        bindingId: "binding://t223",
        catalogId: "catalog://t223",
        events: [canonicalAsset, unrelatedSameOrdinal]
      }),
    /ordinal collision/u
  );
});
