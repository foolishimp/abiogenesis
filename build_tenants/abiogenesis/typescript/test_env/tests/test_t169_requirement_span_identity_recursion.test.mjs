// Validates: T-169 first slice
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-017
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-049

import test from "node:test";
import assert from "node:assert/strict";

import * as publicAbgRequirements from "../../build/semantic/code/src/abg/requirements/index.js";
import * as publicGtlRequirements from "../../build/semantic/code/src/gtl/requirements/index.js";
import * as publicRoot from "../../build/semantic/code/src/index.js";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintRuntimeScopeRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";
import {
  constructRequirementFoldProjection,
  residualizeRequirementFolds
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_algebra.js";
import {
  assessmentFor,
  buildSchedule,
  constitutionalGapRow,
  constitutionalReentry,
  fulfilledRow,
  materializeEvents,
  spanBySource
} from "./support/t103-graph-span-fixtures.mjs";

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

function t169BundleWithEmptyRecursiveLineage() {
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: REQUIREMENT_ID,
    termKind: "atom",
    stableId: REQUIREMENT_ID,
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md#049",
    sourceDigest: "sha256:t169-empty-recursive-lineage",
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
    frameRefs: [],
    zoomRefs: [],
    foldbackRefs: [],
    aliasRefs: []
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

function emptyLineageRouteContext(edge = EDGE) {
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle: t169BundleWithEmptyRecursiveLineage(),
    runtimeScope: runtimeScope(),
    edges: [edge]
  });
  assert.equal(context.status, "accepted");
  return context.value;
}

function routeEdgeForBasisVector(basis, vectorIndex, runtimeEvents = []) {
  const vector = basis.graph.vectors[vectorIndex];
  const edge = vector.name;
  return Object.freeze({
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    vectorIndex,
    edge,
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id,
    frameRefs: [
      basis.frameId ?? `frame:${basis.id}:root`,
      ...runtimeEvents
        .filter((event) => event.kind === "frame_opened" && event.basisId === basis.id)
        .map((event) => event.frameId)
    ],
    zoomRefs: runtimeEvents.flatMap((event) =>
      event.basisId === basis.id &&
      event.kind === "zoom_frame_opened" &&
      event.vectorIndex === vectorIndex
        ? [event.zoomFrameId]
        : []
    ),
    foldbackRefs: runtimeEvents.flatMap((event) =>
      event.basisId === basis.id &&
      event.kind === "graph_span_foldback_evaluated" &&
      event.terminalVectorIndex >= vectorIndex
        ? [event.foldbackRef, ...event.edgeFoldbackRefs, ...event.causingEdgeFoldbackRefs]
        : []
    ),
    aliasRefs: [edge]
  });
}

function eventDerivedBundle(input) {
  const spanId = "span://t169/event-derived";
  const vectors = input.basis.graph.vectors;
  const edge = routeEdgeForBasisVector(input.basis, 0, input.runtimeEvents);
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: "REQ-T169-EVENT-DERIVED",
    termKind: "atom",
    stableId: "REQ-T169-EVENT-DERIVED",
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md#049",
    sourceDigest: "sha256:t169-event-derived",
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: [],
    evidencePolicyRefs: ["policy://t169/event-derived"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: input.basis.graphFunction.id,
    graphVectorRefs: vectors.map((vector) => vector.id),
    vectorIndexes: [0, 1, 2],
    sourceNodeRef: vectors[0].source[0].id,
    targetNodeRef: vectors[2].target.id,
    frameRefs: edge.frameRefs,
    zoomRefs: edge.zoomRefs,
    foldbackRefs: edge.foldbackRefs,
    aliasRefs: [
      edge.edge,
      ...vectors.flatMap((vector) => [
        ...vector.source.map((node) => node.id),
        vector.target.id
      ])
    ]
  });
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span]
  });
}

test("T-169 activates recursive span identity from ABG-emitted lineage events", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t169/event-derived",
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t169/event-derived",
    frameId: "frame://t169/event-derived/parent",
    frameLineageId: "frame-lineage://t169/event-derived/parent"
  });
  const childFrameEvent = publicRoot.constructFrameOpenedEvent(
    Object.freeze({
      ...basis,
      frameId: "frame://t169/event-derived/child",
      frameLineageId: "frame-lineage://t169/event-derived/child"
    })
  );
  const zoomFrame = Object.freeze({
    kind: "zoom_frame",
    zoomFrameId: "zoom://t169/event-derived/child-detail",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    vectorIndex: 0,
    edge: routeEdgeForBasisVector(basis, 0).edge,
    inputAssetRef: "asset://t169/event-derived/parent",
    outputAssetRef: "asset://t169/event-derived/child",
    ledgerRef: "ledger://t169/event-derived/zoom",
    scheduleRef: "schedule://t169/event-derived/zoom"
  });
  const zoomFrameEvent = publicRoot.constructZoomFrameOpenedEvent({
    basis,
    zoomFrame
  });
  const reentry = constitutionalReentry({
    changeClass: "requirement_reprice",
    reEntryPoint: "requirements",
    routeContractRefs: ["route-contract://t169/event-derived"],
    authorityRefs: ["ticket://T-169", "REQ-T169-EVENT-DERIVED"],
    rationale: "event-derived child lineage keeps the parent span active"
  });
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t169/event-derived/terminal",
      rows: [fulfilledRow("T169-EVENT-DERIVED-TERMINAL")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t169/event-derived/child",
      rows: [fulfilledRow("T169-EVENT-DERIVED-CHILD")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t169/event-derived/parent",
      rows: [constitutionalGapRow("REQ-T169-EVENT-DERIVED")],
      constitutionalReentry: reentry
    })
  ];
  const foldback = publicRoot.foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const runtimeEvents = Object.freeze([
    childFrameEvent,
    zoomFrameEvent,
    ...materializeEvents(basis, schedule, assessments, foldback)
  ]);
  const bundle = eventDerivedBundle({ basis, runtimeEvents });
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle,
    runtimeScope: mintRuntimeScopeRef({
      runRef: basis.id,
      graphCallRef: `graph-call:${basis.id}`,
      frameRef: basis.frameId,
      continuationRef: null,
      graphFunctionRef: basis.graphFunction.id,
      graphVectorRef: basis.graph.vectors[0].id,
      spanRef: "span://t169/event-derived"
    }),
    edges: basis.graph.vectors.map((_, vectorIndex) =>
      routeEdgeForBasisVector(basis, vectorIndex, runtimeEvents)
    )
  });
  assert.equal(context.status, "accepted");
  const edgeWithRuntimeLineage = routeEdgeForBasisVector(basis, 0, runtimeEvents);
  const activeEnvironment =
    publicAbgRequirements.compileEdgeRequirementEnvironment({
      ledger: context.value.ledger,
      edge: edgeWithRuntimeLineage
    });
  assert.equal(activeEnvironment.activeSpans.length, 1);
  assert.equal(activeEnvironment.activeTerms.length, 1);

  const edgeWithoutRuntimeLineage = routeEdgeForBasisVector(basis, 0, []);
  const inactiveEnvironment =
    publicAbgRequirements.compileEdgeRequirementEnvironment({
      ledger: context.value.ledger,
      edge: edgeWithoutRuntimeLineage
    });
  assert.equal(inactiveEnvironment.activeSpans.length, 0);
  assert.equal(inactiveEnvironment.activeTerms.length, 0);
});

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

test("T-169 rejects vector-index-only activation when declared lineage refs are missing", () => {
  const context = routeContext();
  const vectorOnlyEdge = Object.freeze({
    graphFunctionRef: EDGE.graphFunctionRef,
    graphVectorRef: EDGE.graphVectorRef,
    vectorIndex: EDGE.vectorIndex,
    edge: EDGE.edge,
    sourceNodeRef: EDGE.sourceNodeRef,
    targetNodeRef: EDGE.targetNodeRef
  });
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: context.ledger,
    edge: vectorOnlyEdge
  });
  assert.equal(environment.activeSpans.length, 0);
  assert.equal(environment.activeTerms.length, 0);
  const lineage = publicAbgRequirements.projectSpanLineage({
    ledger: context.ledger,
    environment
  });
  assert.equal(lineage[0].active, false);
});

test("T-169 rejects recursive span activation when declared lineage is empty", () => {
  const context = emptyLineageRouteContext();
  const environment = publicAbgRequirements.compileEdgeRequirementEnvironment({
    ledger: context.ledger,
    edge: EDGE
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
