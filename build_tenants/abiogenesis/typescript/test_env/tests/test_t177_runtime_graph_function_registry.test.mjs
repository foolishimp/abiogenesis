// Validates: T-177
// Validates: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Validates: REQ-L-GTL3-SELECTION-BOUNDARY

import test from "node:test";
import assert from "node:assert/strict";

import * as publicSurface from "../../build/semantic/code/src/index.js";
import { emit } from "../../build/semantic/code/src/abg/m03/events/index.js";
import {
  admitGtlLibraryEntryDeclaration,
  admitRuntimeGraphFunctionRegistryStartup,
  admitProductPluginSelectionAdvice,
  constructRegistryLookupRequest,
  assertGraphFunctionInvocationSelected,
  lookupRuntimeGraphFunctionRegistry,
  projectRuntimeGraphFunctionRegistry,
  selectGraphFunctionFromRegistry
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_graph_function_registry.js";
import {
  constructGtlLibraryEntryDeclaration,
  constructProductPluginSelectionAdvice,
  constructProductRegistryStartupConfig
} from "../../build/semantic/code/src/gtl/m02/contracts/runtime_registry.js";
import { buildThreeStageStartContext } from "./support/m03-iteration-fixtures.mjs";

const REQUIRED_FIELDS = Object.freeze([
  "candidate_identity",
  "entry_kind",
  "interface",
  "source_contract",
  "target_contract",
  "context",
  "authority",
  "overlay",
  "namespace",
  "version",
  "provenance",
  "readiness",
  "proof",
  "policy_constraints"
]);

function captureEmit(events) {
  const captured = [];
  const emitted = emit(events, (event) => {
    captured.push(event);
  });
  assert.deepEqual(emitted, captured);
  return emitted;
}

function libraryDeclaration(overrides = {}) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: "gtl-declaration://t177/system/generic",
    entryRef: "registry-entry://t177/system/generic",
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.system",
    ownerRef: "owner://abg",
    version: "4.1.0-rc.17",
    graphFunctionRef: "graph-function://abg/generic-consequence",
    interfaceRef: "interface://t177/consequence",
    sourceContractRef: "contract://t177/source",
    targetContractRef: "contract://t177/target",
    contextRefs: ["context://t177/project"],
    authorityRefs: ["authority://t177/runtime"],
    overlayRefs: ["overlay://t177/default"],
    provenanceRefs: ["provenance://t177/system"],
    readinessRefs: ["readiness://t177/ready"],
    proofRefs: ["proof://t177/system"],
    policyRefs: ["policy://t177/default"],
    declarationSourceRefs: ["gtl://module/t177/system"],
    ...overrides
  });
}

function productStartupConfig(overrides = {}) {
  return constructProductRegistryStartupConfig({
    configRef: "product-registry-startup://t177/odd-glc",
    productNamespace: "odd_glc",
    ownerRef: "owner://odd_glc",
    version: "4.1.0-rc.17",
    enabledLibraryRefs: [
      "registry-entry://t177/product/glc-consequence",
      "gtl-declaration://t177/product/glc-consequence",
      "gtl://module/t177/odd-glc"
    ],
    overlayRefs: ["overlay://t177/default"],
    pluginRefs: ["plugin://odd_glc/consequence"],
    readinessRefs: ["readiness://t177/ready"],
    proofRefs: ["proof://t177/product"],
    policyRefs: ["policy://t177/default"],
    configSourceRefs: ["config://odd_glc/t177/registry-startup"],
    ...overrides
  });
}

function admitAndEmit(declaration, projection = undefined) {
  const admission = admitGtlLibraryEntryDeclaration({
    declaration,
    projection,
    correlationId: `correlation://${declaration.entryRef}`
  });
  return captureEmit(admission)[0];
}

function registryWithSystemAndProductEntries() {
  const systemEvent = admitAndEmit(libraryDeclaration());
  const systemProjection = projectRuntimeGraphFunctionRegistry([systemEvent]);
  const productEvent = admitAndEmit(
    libraryDeclaration({
      declarationRef: "gtl-declaration://t177/product/glc-consequence",
      entryRef: "registry-entry://t177/product/glc-consequence",
      libraryScope: "product",
      namespace: "odd_glc",
      ownerRef: "owner://odd_glc",
      graphFunctionRef: "graph-function://odd_glc/lifecycle-consequence",
      provenanceRefs: ["provenance://t177/product"],
      proofRefs: ["proof://t177/product"],
      declarationSourceRefs: ["gtl://module/t177/odd-glc"]
    }),
    systemProjection
  );
  return projectRuntimeGraphFunctionRegistry([systemEvent, productEvent]);
}

function baseLookupRequest(overrides = {}) {
  return constructRegistryLookupRequest({
    lookupRef: "registry-lookup://t177/consequence",
    entryKinds: ["graph_function"],
    interfaceRef: "interface://t177/consequence",
    sourceContractRef: "contract://t177/source",
    targetContractRef: "contract://t177/target",
    contextRefs: ["context://t177/project"],
    authorityRefs: ["authority://t177/runtime"],
    overlayRefs: ["overlay://t177/default"],
    namespaceRefs: ["abg.system", "odd_glc"],
    acceptedVersions: ["4.1.0-rc.17"],
    provenanceRefs: [
      "provenance://t177/system",
      "provenance://t177/product"
    ],
    readinessRefs: ["readiness://t177/ready"],
    proofRefs: ["proof://t177/system", "proof://t177/product"],
    policyRefs: ["policy://t177/default"],
    ...overrides
  });
}

test("T-177 admits system and product library entries and projects registry truth from emitted events", () => {
  const projection = registryWithSystemAndProductEntries();
  assert.equal(projection.kind, "runtime_registry_projection");
  assert.deepEqual(
    projection.entries.map((entry) => entry.entryRef),
    [
      "registry-entry://t177/product/glc-consequence",
      "registry-entry://t177/system/generic"
    ]
  );

  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest()
  });
  assert.deepEqual(
    [...lookup.eligibleCandidateRefs].sort(),
    [
      "registry-entry://t177/product/glc-consequence",
      "registry-entry://t177/system/generic"
    ]
  );
  for (const decision of lookup.candidateDecisions) {
    assert.equal(decision.eligible, true);
    assert.deepEqual(
      decision.fieldDecisions.map((fieldDecision) => fieldDecision.field),
      REQUIRED_FIELDS
    );
  }
});

test("T-177 startup admission admits system before product declarations", () => {
  const result = admitRuntimeGraphFunctionRegistryStartup({
    systemDeclarations: [libraryDeclaration()],
    productStartupConfig: productStartupConfig({
      enabledLibraryRefs: ["gtl://module/t177/startup-shadow"]
    }),
    productDeclarations: [
      libraryDeclaration({
        declarationRef: "gtl-declaration://t177/product/startup-shadow",
        entryRef: "registry-entry://t177/product/startup-shadow",
        libraryScope: "product",
        namespace: "odd_glc",
        ownerRef: "owner://odd_glc",
        declarationSourceRefs: ["gtl://module/t177/startup-shadow"]
      })
    ],
    correlationId: "correlation://t177/startup"
  });
  const emitted = captureEmit(result.admissionEvents);
  assert.deepEqual(
    emitted.map((event) => event.kind),
    ["registry_entry_admitted", "registry_entry_rejected"]
  );
  assert.deepEqual(result.admittedEntryRefs, [
    "registry-entry://t177/system/generic"
  ]);
  assert.deepEqual(result.rejectedDeclarationRefs, [
    "gtl-declaration://t177/product/startup-shadow"
  ]);
  assert.deepEqual(
    result.projection.entries.map((entry) => entry.entryRef),
    ["registry-entry://t177/system/generic"]
  );
});

test("T-177 product startup config alone cannot create registry truth", () => {
  const result = admitRuntimeGraphFunctionRegistryStartup({
    systemDeclarations: [],
    productStartupConfig: productStartupConfig(),
    productDeclarations: [],
    correlationId: "correlation://t177/config-alone"
  });
  assert.deepEqual(result.admissionEvents, []);
  assert.deepEqual(result.projection.entries, []);
  assert.equal(result.productStartupConfigRef, "product-registry-startup://t177/odd-glc");
  assert.match(result.productStartupConfigDigest, /^sha256:/u);
  assert.throws(
    () =>
      admitRuntimeGraphFunctionRegistryStartup({
        systemDeclarations: [],
        productDeclarations: [
          libraryDeclaration({
            declarationRef: "gtl-declaration://t177/product/no-config",
            entryRef: "registry-entry://t177/product/no-config",
            libraryScope: "product",
            namespace: "odd_glc",
            ownerRef: "owner://odd_glc",
            declarationSourceRefs: ["gtl://module/t177/no-config"]
          })
        ],
        correlationId: "correlation://t177/no-config"
      }),
    /require product startup config/u
  );
});

test("T-177 ABG start consumes product config and GTL declarations before traversal", () => {
  const { input, context, executive } = buildThreeStageStartContext({
    defaultRegime: "F_D"
  });
  const productDeclaration = libraryDeclaration({
    declarationRef: "gtl-declaration://t177/product/glc-consequence",
    entryRef: "registry-entry://t177/product/glc-consequence",
    libraryScope: "product",
    namespace: "odd_glc",
    ownerRef: "owner://odd_glc",
    graphFunctionRef: executive.id,
    provenanceRefs: ["provenance://t177/product"],
    proofRefs: ["proof://t177/product"],
    declarationSourceRefs: ["gtl://module/t177/odd-glc"]
  });
  const events = [];
  const outcome = publicSurface.start(
    input,
    {
      ...context,
      runtimeRegistryStartup: {
        systemDeclarations: [libraryDeclaration()],
        productStartupConfig: productStartupConfig(),
        productDeclarations: [productDeclaration],
        correlationId: "correlation://t177/public-start-registry"
      }
    },
    (event) => {
      events.push(event);
    }
  );
  assert.equal(outcome.kind, "converged");
  assert.deepEqual(
    events.slice(0, 5).map((event) => event.kind),
    [
      "basis_admitted",
      "registry_entry_admitted",
      "registry_entry_admitted",
      "graph_function_selected",
      "graph_call_opened"
    ]
  );
  const registrySelection = events.find(
    (event) => event.kind === "graph_function_selected"
  );
  assert.equal(registrySelection?.selectedEntryRef, productDeclaration.entryRef);
  assert.equal(registrySelection?.selectedGraphFunctionRef, executive.id);
  assert.ok(
    events.findIndex((event) => event.kind === "graph_function_selected") <
      events.findIndex((event) => event.kind === "graph_call_opened")
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "registry_entry_admitted")
      .map((event) => event.entryRef),
    [
      "registry-entry://t177/system/generic",
      "registry-entry://t177/product/glc-consequence"
    ]
  );
});

test("T-177 ABG start fails closed before traversal when registry has no basis graph function", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_D"
  });
  const events = [];
  assert.throws(
    () =>
      publicSurface.start(
        input,
        {
          ...context,
          runtimeRegistryStartup: {
            systemDeclarations: [libraryDeclaration()],
            productStartupConfig: productStartupConfig({
              enabledLibraryRefs: []
            }),
            productDeclarations: [],
            correlationId: "correlation://t177/public-start-registry/no-match"
          }
        },
        (event) => {
          events.push(event);
        }
      ),
    /requires a registered graph_function entry/u
  );
  assert.deepEqual(
    events.map((event) => event.kind),
    ["basis_admitted", "registry_entry_admitted"]
  );
  assert.equal(
    events.some((event) => event.kind === "graph_call_opened"),
    false
  );
});

test("T-177 eligibility filter rejects each required field independently", () => {
  const projection = registryWithSystemAndProductEntries();
  const cases = [
    ["candidate_identity", { candidateIdentityRefs: ["registry-entry://missing"] }],
    ["entry_kind", { entryKinds: ["overlay"] }],
    ["interface", { interfaceRef: "interface://wrong" }],
    ["source_contract", { sourceContractRef: "contract://wrong-source" }],
    ["target_contract", { targetContractRef: "contract://wrong-target" }],
    ["context", { contextRefs: [] }],
    ["authority", { authorityRefs: [] }],
    ["overlay", { overlayRefs: [] }],
    ["namespace", { namespaceRefs: ["unrelated"] }],
    ["version", { acceptedVersions: ["0.0.0"] }],
    ["provenance", { provenanceRefs: [] }],
    ["readiness", { readinessRefs: [] }],
    ["proof", { proofRefs: [] }],
    ["policy_constraints", { policyRefs: [] }]
  ];

  for (const [field, override] of cases) {
    const lookup = lookupRuntimeGraphFunctionRegistry({
      projection,
      request: baseLookupRequest(override)
    });
    assert.ok(
      lookup.candidateDecisions.every((decision) =>
        decision.fieldDecisions.some((fieldDecision) =>
          fieldDecision.field === field && fieldDecision.accepted === false
        )
      ),
      `expected ${field} to reject every candidate`
    );
  }
});

test("T-177 entry-kind filtering separates graph functions from overlays", () => {
  const graphEvent = admitAndEmit(libraryDeclaration());
  const overlayEvent = admitAndEmit(
    libraryDeclaration({
      declarationRef: "gtl-declaration://t177/system/overlay",
      entryRef: "registry-entry://t177/system/overlay",
      entryKind: "overlay",
      graphFunctionRef: "graph-function://abg/overlay-carrier",
      declarationSourceRefs: ["gtl://module/t177/overlay"]
    }),
    projectRuntimeGraphFunctionRegistry([graphEvent])
  );
  const projection = projectRuntimeGraphFunctionRegistry([graphEvent, overlayEvent]);
  const graphLookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest({ entryKinds: ["graph_function"] })
  });
  assert.deepEqual(graphLookup.eligibleCandidateRefs, [
    "registry-entry://t177/system/generic"
  ]);
  const overlayLookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest({
      entryKinds: ["overlay"],
      proofRefs: ["proof://t177/system"]
    })
  });
  assert.deepEqual(overlayLookup.eligibleCandidateRefs, [
    "registry-entry://t177/system/overlay"
  ]);
});

test("T-177 product plugin advice is admitted before ABG emits graph_function_selected", () => {
  const projection = registryWithSystemAndProductEntries();
  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest()
  });
  const advice = constructProductPluginSelectionAdvice({
    adviceRef: "plugin-advice://t177/glc-consequence",
    pluginRef: "plugin://odd_glc/consequence",
    lookupResultRef: lookup.lookupResultRef,
    preferredCandidateRef: "registry-entry://t177/product/glc-consequence",
    rankedCandidateRefs: [
      "registry-entry://t177/product/glc-consequence",
      "registry-entry://t177/system/generic"
    ],
    rationaleRef: "rationale://t177/glc-prefers-specialized",
    policyRefs: ["policy://t177/default"]
  });
  const adviceAdmission = admitProductPluginSelectionAdvice({
    advice,
    lookupResult: lookup,
    correlationId: "correlation://t177/advice"
  });
  assert.equal(adviceAdmission.kind, "registry_plugin_advice_admitted");
  const selection = selectGraphFunctionFromRegistry({
    projection,
    lookupResult: lookup,
    admittedAdvice: adviceAdmission,
    selectionRef: "selection://t177/glc",
    runtimeBasisRef: "runtime-basis://t177/consequence",
    rationaleRef: "rationale://t177/abg-admitted-advice",
    correlationId: "correlation://t177/selection"
  });
  assert.equal(selection.kind, "graph_function_selected");
  assert.equal(
    selection.selectedEntryRef,
    "registry-entry://t177/product/glc-consequence"
  );
  const emitted = captureEmit([adviceAdmission, selection]);
  assert.deepEqual(
    emitted.map((event) => event.kind),
    ["registry_plugin_advice_admitted", "graph_function_selected"]
  );
  assert.throws(
    () =>
      assertGraphFunctionInvocationSelected({
        events: [adviceAdmission],
        runtimeBasisRef: "runtime-basis://t177/consequence",
        graphFunctionRef: "graph-function://odd_glc/lifecycle-consequence",
        selectionRef: "selection://t177/glc"
      }),
    /requires prior graph_function_selected/u
  );
  assert.equal(
    assertGraphFunctionInvocationSelected({
      events: emitted,
      runtimeBasisRef: "runtime-basis://t177/consequence",
      graphFunctionRef: "graph-function://odd_glc/lifecycle-consequence",
      selectionRef: "selection://t177/glc"
    }).selectedEntryRef,
    "registry-entry://t177/product/glc-consequence"
  );
});

test("T-177 rejects raw or authority-bearing product plugin advice", () => {
  const projection = registryWithSystemAndProductEntries();
  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest()
  });
  const rawAdvice = constructProductPluginSelectionAdvice({
    adviceRef: "plugin-advice://t177/raw",
    pluginRef: "plugin://odd_glc/consequence",
    lookupResultRef: lookup.lookupResultRef,
    preferredCandidateRef: "registry-entry://t177/product/glc-consequence",
    rationaleRef: "rationale://t177/raw"
  });
  assert.throws(
    () =>
      selectGraphFunctionFromRegistry({
        projection,
        lookupResult: lookup,
        admittedAdvice: rawAdvice,
        selectionRef: "selection://t177/raw",
        runtimeBasisRef: "runtime-basis://t177/raw",
        rationaleRef: "rationale://t177/raw",
        correlationId: "correlation://t177/raw"
      }),
    /admitted registry plugin advice/u
  );

  const authorityAdvice = constructProductPluginSelectionAdvice({
    adviceRef: "plugin-advice://t177/authority",
    pluginRef: "plugin://odd_glc/consequence",
    lookupResultRef: lookup.lookupResultRef,
    preferredCandidateRef: "registry-entry://t177/product/glc-consequence",
    rationaleRef: "rationale://t177/authority",
    forbiddenAuthorityRefs: ["graph_call://not-allowed"]
  });
  const rejected = admitProductPluginSelectionAdvice({
    advice: authorityAdvice,
    lookupResult: lookup,
    correlationId: "correlation://t177/authority"
  });
  assert.equal(rejected.kind, "registry_plugin_advice_rejected");
  assert.equal(
    rejected.rejectionReason,
    "plugin_advice_contains_runtime_authority"
  );
});

test("T-177 rejects ineligible advice and unlawful product shadows", () => {
  const systemEvent = admitAndEmit(libraryDeclaration());
  const systemProjection = projectRuntimeGraphFunctionRegistry([systemEvent]);
  const shadowAdmission = admitGtlLibraryEntryDeclaration({
    declaration: libraryDeclaration({
      declarationRef: "gtl-declaration://t177/product/shadow",
      entryRef: "registry-entry://t177/product/shadow",
      libraryScope: "product",
      namespace: "odd_glc",
      ownerRef: "owner://odd_glc",
      declarationSourceRefs: ["gtl://module/t177/shadow"]
    }),
    projection: systemProjection,
    correlationId: "correlation://t177/shadow"
  });
  assert.equal(shadowAdmission.kind, "registry_entry_rejected");
  assert.equal(shadowAdmission.rejectionReason, "unlawful_system_shadow");

  const projection = registryWithSystemAndProductEntries();
  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest({ namespaceRefs: ["abg.system"] })
  });
  const advice = constructProductPluginSelectionAdvice({
    adviceRef: "plugin-advice://t177/ineligible",
    pluginRef: "plugin://odd_glc/consequence",
    lookupResultRef: lookup.lookupResultRef,
    preferredCandidateRef: "registry-entry://t177/product/glc-consequence",
    rationaleRef: "rationale://t177/ineligible"
  });
  const rejectedAdvice = admitProductPluginSelectionAdvice({
    advice,
    lookupResult: lookup,
    correlationId: "correlation://t177/ineligible"
  });
  assert.equal(rejectedAdvice.kind, "registry_plugin_advice_rejected");
  assert.equal(
    rejectedAdvice.rejectionReason,
    "plugin_advice_candidate_not_eligible"
  );
});

test("T-177 admits lawful override and refinement product entries", () => {
  const systemEvent = admitAndEmit(libraryDeclaration());
  const systemProjection = projectRuntimeGraphFunctionRegistry([systemEvent]);
  for (const [field, entryRef] of [
    ["overrideOfEntryRef", "registry-entry://t177/product/override"],
    ["refinementOfEntryRef", "registry-entry://t177/product/refinement"]
  ]) {
    const productEvent = admitAndEmit(
      libraryDeclaration({
        declarationRef: `gtl-declaration://t177/product/${field}`,
        entryRef,
        libraryScope: "product",
        namespace: "odd_glc",
        ownerRef: "owner://odd_glc",
        declarationSourceRefs: [`gtl://module/t177/${field}`],
        [field]: "registry-entry://t177/system/generic"
      }),
      systemProjection
    );
    assert.equal(productEvent.kind, "registry_entry_admitted");
    const projection = projectRuntimeGraphFunctionRegistry([systemEvent, productEvent]);
    const lookup = lookupRuntimeGraphFunctionRegistry({
      projection,
      request: baseLookupRequest()
    });
    assert.ok(
      lookup.eligibleCandidateRefs.includes(entryRef),
      `${field} entry must become eligible after ABG admits override/refinement law`
    );
  }
});

test("T-177 replay roundtrip rebuilds equivalent registry identity", () => {
  const systemEvent = admitAndEmit(libraryDeclaration());
  const productEvent = admitAndEmit(
    libraryDeclaration({
      declarationRef: "gtl-declaration://t177/product/replay",
      entryRef: "registry-entry://t177/product/replay",
      libraryScope: "product",
      namespace: "odd_glc",
      ownerRef: "owner://odd_glc",
      graphFunctionRef: "graph-function://odd_glc/replay-consequence",
      provenanceRefs: ["provenance://t177/product"],
      proofRefs: ["proof://t177/product"],
      declarationSourceRefs: ["gtl://module/t177/replay"],
      refinementOfEntryRef: "registry-entry://t177/system/generic"
    }),
    projectRuntimeGraphFunctionRegistry([systemEvent])
  );
  const replayEvents = captureEmit([systemEvent, productEvent]);
  const firstProjection = projectRuntimeGraphFunctionRegistry(replayEvents);
  const roundtripProjection = projectRuntimeGraphFunctionRegistry([...replayEvents]);
  assert.deepEqual(roundtripProjection, firstProjection);
  assert.deepEqual(
    lookupRuntimeGraphFunctionRegistry({
      projection: roundtripProjection,
      request: baseLookupRequest()
    }),
    lookupRuntimeGraphFunctionRegistry({
      projection: firstProjection,
      request: baseLookupRequest()
    })
  );
});

test("T-177 ABG may decline admitted eligible advice and select a different candidate", () => {
  const projection = registryWithSystemAndProductEntries();
  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest()
  });
  const advice = constructProductPluginSelectionAdvice({
    adviceRef: "plugin-advice://t177/abg-decline",
    pluginRef: "plugin://odd_glc/consequence",
    lookupResultRef: lookup.lookupResultRef,
    preferredCandidateRef: "registry-entry://t177/product/glc-consequence",
    rankedCandidateRefs: [
      "registry-entry://t177/product/glc-consequence",
      "registry-entry://t177/system/generic"
    ],
    rationaleRef: "rationale://t177/product-prefers-specialized"
  });
  const admittedAdvice = admitProductPluginSelectionAdvice({
    advice,
    lookupResult: lookup,
    correlationId: "correlation://t177/abg-decline-advice"
  });
  assert.equal(admittedAdvice.kind, "registry_plugin_advice_admitted");
  const selection = selectGraphFunctionFromRegistry({
    projection,
    lookupResult: lookup,
    admittedAdvice,
    abgSelectedCandidateRef: "registry-entry://t177/system/generic",
    selectionRef: "selection://t177/abg-decline",
    runtimeBasisRef: "runtime-basis://t177/abg-decline",
    rationaleRef: "rationale://t177/abg-selects-system",
    correlationId: "correlation://t177/abg-decline-selection"
  });
  assert.equal(selection.kind, "graph_function_selected");
  assert.equal(selection.selectedEntryRef, "registry-entry://t177/system/generic");
  assert.deepEqual(selection.adviceRefs, ["plugin-advice://t177/abg-decline"]);
});

test("T-177 static inventories and public package surface do not become registry authority", () => {
  assert.throws(
    () =>
      projectRuntimeGraphFunctionRegistry([
        {
          kind: "catalogGraphFunctionRefs",
          refs: ["graph-function://not-runtime-truth"]
        }
      ]),
    /RuntimeEvent.kind/u
  );
  const projection = registryWithSystemAndProductEntries();
  const lookup = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: baseLookupRequest()
  });
  assert.equal(lookup.kind, "registry_lookup_result");
  assert.ok(!("selectionRef" in lookup));
  assert.equal(typeof publicSurface.constructGtlLibraryEntryDeclaration, "function");
  assert.equal(typeof publicSurface.constructProductPluginSelectionAdvice, "function");
  assert.equal(typeof publicSurface.constructProductRegistryStartupConfig, "function");
  for (const forbidden of [
    "admitGtlLibraryEntryDeclaration",
    "admitRuntimeGraphFunctionRegistryStartup",
    "admitProductPluginSelectionAdvice",
    "assertGraphFunctionInvocationSelected",
    "selectGraphFunctionFromRegistry"
  ]) {
    assert.equal(
      Object.hasOwn(publicSurface, forbidden),
      false,
      `${forbidden} must not be on the public package surface`
    );
  }
});

test("T-177 product-local startup shells cannot create registry or invocation truth", () => {
  const productLocalProjection = {
    kind: "product_local_registry_projection",
    entries: [
      {
        entryRef: "registry-entry://odd-glc/local-shell",
        graphFunctionRef: "graph-function://odd_glc/local-shell"
      }
    ]
  };
  assert.throws(
    () => projectRuntimeGraphFunctionRegistry([productLocalProjection]),
    /RuntimeEvent.kind/u
  );
  assert.throws(
    () =>
      assertGraphFunctionInvocationSelected({
        events: [productLocalProjection],
        runtimeBasisRef: "runtime-basis://t177/local-shell",
        graphFunctionRef: "graph-function://odd_glc/local-shell"
      }),
    /RuntimeEvent.kind/u
  );
});
