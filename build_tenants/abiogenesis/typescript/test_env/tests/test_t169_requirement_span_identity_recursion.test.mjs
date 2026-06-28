// Validates: T-169 first slice
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-017
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-049

import test from "node:test";
import assert from "node:assert/strict";

import * as publicAbgRequirements from "../../build/semantic/code/src/abg/requirements/index.js";
import * as publicGtlRequirements from "../../build/semantic/code/src/gtl/requirements/index.js";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintRuntimeScopeRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";
import {
  constructRequirementFoldProjection,
  residualizeRequirementFolds
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";

const REQUIREMENT_ID = "REQ-T169-SPAN-LINEAGE";
const SPAN_ID = "span://t169/parent-to-child";
const EDGE = Object.freeze({
  graphFunctionRef: "graph-function://t169/parent",
  graphVectorRef: "graph-vector://t169/parent-to-child",
  vectorIndex: 1,
  edge: "edge://t169/parent-to-child",
  sourceNodeRef: "node://t169/parent",
  targetNodeRef: "node://t169/child",
  frameRefs: ["frame://t169/parent"],
  zoomRefs: ["zoom://t169/child-detail"],
  foldbackRefs: ["foldback://t169/child-to-parent"],
  aliasRefs: ["edge://t169/parent-to-child"]
});

function runtimeScope() {
  return mintRuntimeScopeRef({
    runRef: "run://t169/span-lineage",
    graphCallRef: "graph-call://t169/span-lineage",
    frameRef: "frame://t169/parent",
    continuationRef: "continuation://t169/parent",
    graphFunctionRef: EDGE.graphFunctionRef,
    graphVectorRef: EDGE.graphVectorRef,
    spanRef: SPAN_ID
  });
}

function t169Bundle() {
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md#049",
    sourceDigest: "sha256:t169-span-lineage",
    relationRefs: [],
    spanRefs: [SPAN_ID],
    contextRefs: [],
    evidencePolicyRefs: ["policy://t169/span-lineage"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId: SPAN_ID,
    graphFunctionRef: EDGE.graphFunctionRef,
    graphVectorRefs: [EDGE.graphVectorRef],
    vectorIndexes: [EDGE.vectorIndex],
    sourceNodeRef: EDGE.sourceNodeRef,
    targetNodeRef: EDGE.targetNodeRef,
    frameRefs: EDGE.frameRefs,
    zoomRefs: EDGE.zoomRefs,
    foldbackRefs: EDGE.foldbackRefs,
    aliasRefs: EDGE.aliasRefs
  });
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span]
  });
}

function routeContext(edge = EDGE) {
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle: t169Bundle(),
    runtimeScope: runtimeScope(),
    edges: [edge]
  });
  assert.equal(context.status, "accepted");
  return context.value;
}

test("T-169 admits GTL span lineage refs into ABG TraversalSpan truth", () => {
  const context = routeContext();
  const span = context.ledger.spans[0];
  assert.equal(span.spanId, SPAN_ID);
  assert.deepEqual(span.frameRefs, EDGE.frameRefs);
  assert.deepEqual(span.zoomRefs, EDGE.zoomRefs);
  assert.deepEqual(span.foldbackRefs, EDGE.foldbackRefs);
  assert.deepEqual(span.aliasRefs, EDGE.aliasRefs);

  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: context.ledger,
    edge: EDGE
  });
  assert.equal(environment.activeSpans.length, 1);
  assert.equal(environment.activeTerms.length, 1);

  const lineage = publicAbgRequirements.projectSpanLineage({
    ledger: context.ledger,
    environment
  });
  assert.equal(lineage.length, 1);
  assert.equal(lineage[0].active, true);
  assert.deepEqual(lineage[0].frameRefs, EDGE.frameRefs);
  assert.deepEqual(lineage[0].zoomRefs, EDGE.zoomRefs);
  assert.deepEqual(lineage[0].foldbackRefs, EDGE.foldbackRefs);
  assert.deepEqual(lineage[0].aliasRefs, EDGE.aliasRefs);
});

test("T-169 rejects vector-index-only activation when lineage refs mismatch", () => {
  const context = routeContext();
  const mismatchedEdge = Object.freeze({
    ...EDGE,
    frameRefs: ["frame://t169/wrong-parent"]
  });
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: context.ledger,
    edge: mismatchedEdge
  });
  assert.equal(environment.activeSpans.length, 0);
  assert.equal(environment.activeTerms.length, 0);
  const lineage = publicAbgRequirements.projectSpanLineage({
    ledger: context.ledger,
    environment
  });
  assert.equal(lineage[0].active, false);
});

test("T-169 residual projection preserves admitted span identity", () => {
  const context = routeContext();
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: context.ledger,
    edge: EDGE
  });
  const projections = publicAbgRequirements.projectEdgeObligations({
    ledger: context.ledger,
    environment
  });
  const fold = constructRequirementFoldProjection({
    foldRef: "requirement-fold://t169/partial",
    requirementId: REQUIREMENT_ID,
    projectionRefs: projections.map((projection) => projection.projectionRef),
    state: "partial",
    sourceAbgTruthRefs: ["abg://assurance-closure-decision/retry/sha256:t169/projection"],
    evidenceRefs: ["evidence://t169/span-lineage"],
    residualPressureRefs: ["pressure://t169/span-lineage"],
    reason: "first-slice span identity residual proof"
  });
  const residuals = residualizeRequirementFolds({
    environment,
    folds: [fold]
  });
  assert.equal(residuals.length, 1);
  assert.equal(residuals[0].spanId, SPAN_ID);
  assert.deepEqual(residuals[0].sourceFoldRefs, [fold.foldRef]);
});
