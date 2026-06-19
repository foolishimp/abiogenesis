// Investigates: T-202

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  admitConsequenceTraversalActionAgainstAllowedCatalog,
  constructAllowedConsequenceTraversalCatalog,
  deriveAllowedConsequenceTraversalCatalogFromGtl,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";

import {
  assertCurrentSdlcGtlProgramConformance,
  constructSdlcGtlModule,
  constructSdlcTraversalOverlayCatalog,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  sdlcPublishedTraversalTargetRef,
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

function graphFunction(module, name) {
  const graphFunction = module.graphFunctions.find((candidate) => candidate.name === name);
  assert.ok(graphFunction, `${name} graph function must be published`);
  return graphFunction;
}

function catalogFor(module, graphFunctionName, vectorName) {
  const published = graphFunction(module, graphFunctionName);
  const graph = materializeGraphFunction(published);
  const vectorIndex = graph.vectors.findIndex((vector) => vector.name === vectorName);
  assert.notEqual(vectorIndex, -1, `${graphFunctionName}/${vectorName} vector must exist`);
  const vector = graph.vectors[vectorIndex];
  assert.ok(vector);
  return {
    graphFunction: published,
    graph,
    vector,
    vectorIndex,
    catalog: deriveAllowedConsequenceTraversalCatalogFromGtl({
      graphFunction: published,
      graphVector: vector,
      vectorIndex,
      edgeRef: vector.name
    })
  };
}

function overlayScopedCatalog(catalog, overlayRef) {
  const segment = `/${encodeURIComponent(overlayRef)}/`;
  return constructAllowedConsequenceTraversalCatalog({
    catalogRef: `${catalog.catalogRef}:test:${encodeURIComponent(overlayRef)}`,
    graphFunctionRef: catalog.graphFunctionRef,
    graphVectorRef: catalog.graphVectorRef,
    vectorIndex: catalog.vectorIndex,
    edgeRef: catalog.edgeRef,
    rows: catalog.rows.filter((row) => row.rowRef.includes(segment))
  });
}

test("T-202 overlay catalog exposes allowed traversal families as read-only rows", () => {
  const module = constructSdlcGtlModule();
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({ module });
  const overlays = new Map(
    overlayCatalog.overlays.map((overlay) => [overlay.overlayRef, overlay])
  );
  const currentFull = overlays.get(SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF);
  const deep = overlays.get(SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF);
  const ticketWorkflow = overlays.get(SDLC_TICKET_WORKFLOW_OVERLAY_REF);
  assert.ok(currentFull);
  assert.ok(deep);
  assert.ok(ticketWorkflow);

  const currentFamilies = new Set(
    currentFull.allowedConsequenceTraversalDeclarations.map((row) => row.traversalFamily)
  );
  const deepFamilies = new Set(
    deep.allowedConsequenceTraversalDeclarations.map((row) => row.traversalFamily)
  );
  const ticketFamilies = new Set(
    ticketWorkflow.allowedConsequenceTraversalDeclarations.map((row) => row.traversalFamily)
  );

  assert.equal(currentFamilies.has("same_edge_retry"), true);
  assert.equal(currentFamilies.has("gap_stop"), true);
  assert.equal(currentFamilies.has("non_admit"), true);
  assert.equal(currentFamilies.has("ticket_traversal"), true);
  assert.equal(currentFamilies.has("depth_traversal"), false);

  assert.equal(deepFamilies.has("depth_traversal"), true);
  assert.equal(deepFamilies.has("ticket_traversal"), true);
  assert.equal(deepFamilies.has("same_edge_retry"), true);

  assert.equal(ticketFamilies.has("public_start_reentry"), true);
  assert.equal(ticketFamilies.has("ticket_traversal"), false);
});

test("T-202 GTL declarations derive ABG catalog rows on intended code/test edges", () => {
  const module = constructSdlcGtlModule();
  const code = catalogFor(
    module,
    "bootstrap_release_self_test",
    "derive_component_code_surface"
  );
  const tests = catalogFor(
    module,
    "bootstrap_release_self_test",
    "derive_component_test_surface"
  );
  const intent = catalogFor(
    module,
    "bootstrap_release_self_test",
    "derive_intent_surface"
  );
  const publishedCodeTarget = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: code.graphFunction.name,
    graphVectorRef: code.vector.name
  });
  const deepRows = overlayScopedCatalog(
    code.catalog,
    SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  ).rows;
  const depthRow = deepRows.find((row) => row.traversalFamily === "depth_traversal");
  assert.ok(depthRow, "deep overlay code edge must declare depth traversal");
  assert.deepStrictEqual(depthRow.allowedActionKinds, ["reenter_graph_span"]);
  assert.deepStrictEqual(depthRow.allowedTraversalTargetRefs, [publishedCodeTarget]);
  assert(depthRow.requiredAuthorityRefs.includes(FG_DECOMPOSE_DEPTH_BETWEEN_NODES));
  assert(depthRow.requiredAuthorityRefs.includes(publishedCodeTarget));

  const publishedTestTarget = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: tests.graphFunction.name,
    graphVectorRef: tests.vector.name
  });
  const deepTestRows = overlayScopedCatalog(
    tests.catalog,
    SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  ).rows;
  const testDepthRow = deepTestRows.find(
    (row) => row.traversalFamily === "depth_traversal"
  );
  assert.ok(
    testDepthRow,
    "deep overlay component-test edge must declare depth traversal"
  );
  assert.deepStrictEqual(
    testDepthRow.allowedTraversalTargetRefs,
    [publishedTestTarget]
  );
  assert(testDepthRow.requiredAuthorityRefs.includes(FG_DECOMPOSE_DEPTH_BETWEEN_NODES));
  assert(testDepthRow.requiredAuthorityRefs.includes(publishedTestTarget));

  const currentFullRows = overlayScopedCatalog(
    code.catalog,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  ).rows;
  assert.equal(
    currentFullRows.some((row) => row.traversalFamily === "depth_traversal"),
    false
  );
  assert.equal(
    currentFullRows.some((row) => row.traversalFamily === "ticket_traversal"),
    true
  );

  const deepIntentRows = overlayScopedCatalog(
    intent.catalog,
    SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  ).rows;
  assert.equal(
    deepIntentRows.some((row) => row.traversalFamily === "depth_traversal"),
    false,
    "deep overlay must not turn every edge into a depth candidate"
  );
});

test("T-202 consequence depth selection admits only against the deep overlay catalog", () => {
  const module = constructSdlcGtlModule();
  const { graphFunction, vector, catalog } = catalogFor(
    module,
    "bootstrap_release_self_test",
    "derive_component_code_surface"
  );
  const selectedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: graphFunction.name,
    graphVectorRef: vector.name
  });
  const action = Object.freeze({
    actionRef: "action://odd-sdlc/t202/depth",
    actionKind: "reenter_graph_span",
    selectedTraversalFamily: "depth_traversal",
    selectedGraphFunctionRef: graphFunction.name,
    selectedRefinementBoundaryRef:
      `${SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF}/annotation/deep_sdlc_traversal_candidate`,
    selectedCandidateFamilyRef: null,
    selectedTraversalTargetRef,
    graphVectorRef: vector.name,
    requiredAuthorityRefs: [
      `${SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF}/annotation/deep_sdlc_traversal_candidate`,
      FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
      selectedTraversalTargetRef
    ],
    proportionalityBasisRefs: [
      "proportionality://odd-sdlc/deep-sdlc-traversal/depth"
    ]
  });

  assert.equal(
    admitConsequenceTraversalActionAgainstAllowedCatalog({
      catalog: overlayScopedCatalog(catalog, SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF),
      action
    }).traversalFamily,
    "depth_traversal"
  );
  assert.throws(
    () =>
      admitConsequenceTraversalActionAgainstAllowedCatalog({
        catalog: overlayScopedCatalog(
          catalog,
          SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
        ),
        action
      }),
    /no matching allowed consequence traversal catalog row/u
  );
});

test("T-202 rejects annotation-only depth, bare vector, and direct ticket storage selections", () => {
  const module = constructSdlcGtlModule();
  const { graphFunction, vector, catalog } = catalogFor(
    module,
    "bootstrap_release_self_test",
    "derive_component_code_surface"
  );
  const selectedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: graphFunction.name,
    graphVectorRef: vector.name
  });
  const deepCatalog = overlayScopedCatalog(
    catalog,
    SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF
  );
  const currentFullCatalog = overlayScopedCatalog(
    catalog,
    SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF
  );
  const depthAnnotationRef =
    `${SDLC_DEEP_SDLC_TRAVERSAL_OVERLAY_REF}/annotation/deep_sdlc_traversal_candidate`;
  const depthAction = Object.freeze({
    actionRef: "action://odd-sdlc/t202/depth-negative",
    actionKind: "reenter_graph_span",
    selectedTraversalFamily: "depth_traversal",
    selectedGraphFunctionRef: graphFunction.name,
    selectedRefinementBoundaryRef: depthAnnotationRef,
    selectedCandidateFamilyRef: null,
    selectedTraversalTargetRef,
    graphVectorRef: vector.name,
    requiredAuthorityRefs: [
      depthAnnotationRef,
      FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
      selectedTraversalTargetRef
    ],
    proportionalityBasisRefs: [
      "proportionality://odd-sdlc/deep-sdlc-traversal/depth"
    ]
  });

  assert.throws(
    () =>
      admitConsequenceTraversalActionAgainstAllowedCatalog({
        catalog: deepCatalog,
        action: {
          ...depthAction,
          actionRef: "action://odd-sdlc/t202/annotation-only-depth",
          selectedTraversalTargetRef: null,
          requiredAuthorityRefs: [depthAnnotationRef]
        }
      }),
    /no matching allowed consequence traversal catalog row/u
  );

  assert.throws(
    () =>
      admitConsequenceTraversalActionAgainstAllowedCatalog({
        catalog: deepCatalog,
        action: {
          ...depthAction,
          actionRef: "action://odd-sdlc/t202/bare-vector-depth",
          selectedTraversalTargetRef: vector.name,
          requiredAuthorityRefs: [
            depthAnnotationRef,
            FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
            vector.name
          ]
        }
      }),
    /no matching allowed consequence traversal catalog row/u
  );

  assert.throws(
    () =>
      admitConsequenceTraversalActionAgainstAllowedCatalog({
        catalog: currentFullCatalog,
        action: Object.freeze({
          actionRef: "action://odd-sdlc/t202/direct-ticket-storage",
          actionKind: "create_ticket",
          selectedTraversalFamily: "ticket_traversal",
          selectedGraphFunctionRef: "route_ticket_work_item",
          selectedTraversalTargetRef:
            "workspace://.ai-workspace/tickets/active/T-900.md",
          requiredAuthorityRefs: ["ticket-route://odd-sdlc/T-900"],
          proportionalityBasisRefs: [
            "proportionality://odd-sdlc/ticket-workflow"
          ]
        })
      }),
    /ticket_traversal must route through a product-declared graph function/u
  );
});

test("T-202 installed consequence source remains catalog-bounded and non-executing", () => {
  const traversalConsequenceSource = readFileSync(
    path.join(
      PACKAGE_ROOT,
      "code/src/operator/traversal_consequence.ts"
    ),
    "utf8"
  );
  const installedOperatorSource = readFileSync(
    path.join(PACKAGE_ROOT, "code/src/operator/installed_operator.ts"),
    "utf8"
  );

  assert.match(
    traversalConsequenceSource,
    /allowedConsequenceTraversalCatalog/u
  );
  assert.match(
    traversalConsequenceSource,
    /admitConsequenceTraversalActionForAllowedCatalog/u
  );
  assert.match(
    installedOperatorSource,
    /overlayScopedAllowedConsequenceTraversalCatalog/u
  );
  assert.doesNotMatch(
    traversalConsequenceSource,
    /writeFileSync\([^)]*\.ai-workspace\/tickets|mkdirSync\([^)]*\.ai-workspace\/tickets|runEngineIterate|emitRuntime|constructRuntimeEvent/u
  );
});

test("T-202 current SDLC GTL program typechecks with overlay declarations", () => {
  assert.doesNotThrow(() => {
    assertCurrentSdlcGtlProgramConformance();
  });
});
