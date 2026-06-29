// Validates: T-173
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA-014
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA-006

import test from "node:test";
import assert from "node:assert/strict";

import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  mintRuntimeScopeRef
} from "../../build/semantic/code/src/abg/m03/contracts/requirements_route.js";

const edge = Object.freeze({
  graphFunctionRef: "graph-function://t173/generic-proof-evidence",
  graphVectorRef: "graph-vector://t173/generic-proof-evidence/main",
  vectorIndex: 0,
  edge: "edge://t173/generic-proof-evidence/main"
});

function runtimeScope() {
  return mintRuntimeScopeRef({
    runRef: "run://t173/generic-proof-evidence",
    graphCallRef: "graph-call://t173/generic-proof-evidence",
    frameRef: "frame://t173/generic-proof-evidence",
    continuationRef: null,
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRef: edge.graphVectorRef,
    spanRef: "span://t173/generic-proof-evidence"
  });
}

function declarationBundle() {
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId: "span://t173/generic-proof-evidence",
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRefs: [edge.graphVectorRef],
    vectorIndexes: [edge.vectorIndex],
    sourceNodeRef: "node://t173/source",
    targetNodeRef: "node://t173/target"
  });
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: "REQ-T173-GENERIC-PROOF",
    termKind: "atom",
    stableId: "REQ-T173-GENERIC-PROOF",
    sourceRef: "specification://t173/generic-proof-evidence",
    sourceDigest: "sha256:t173-generic-proof-evidence",
    relationRefs: [],
    spanRefs: [span.spanId],
    contextRefs: [],
    evidencePolicyRefs: ["policy://plugin-owned/verifier-policy"]
  });
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span],
    testRelations: [
      Object.freeze({
        kind: "gtl_requirement_test_relation_declaration",
        relationRef: "proof-relation://t173/generic",
        requirementId: requirement.requirementId,
        assetProjectionRef: "projection://t173/subject-artifact",
        testSourceProjectionRef: "projection://t173/verifier-artifact",
        testExecutionProjectionRef: "projection://t173/verifier-execution",
        interpretationProjectionRef: "projection://t173/interpretation",
        componentTestRootRefs: ["proof/verifier"],
        evidencePolicyRef: "policy://plugin-owned/verifier-policy"
      })
    ]
  });
}

function projectionFacts(context) {
  return context.replayFacts
    .filter((fact) => fact.kind === "requirement_projection")
    .map((fact) => fact.payload);
}

test("T-173 derives generic proof-evidence projection roles from declarations", () => {
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle: declarationBundle(),
    runtimeScope: runtimeScope(),
    edges: [edge]
  });
  assert.equal(context.status, "accepted");

  const projections = projectionFacts(context.value);
  const byRef = new Map(projections.map((projection) => [projection.projectionRef, projection]));
  assert.equal(byRef.get("projection://t173/subject-artifact")?.evidenceRole, "asset");
  assert.equal(byRef.get("projection://t173/subject-artifact")?.projectionRole, "materialization_target");
  assert.equal(byRef.get("projection://t173/verifier-artifact")?.evidenceRole, "test_source");
  assert.equal(byRef.get("projection://t173/verifier-artifact")?.projectionRole, "materialization_target");
  assert.equal(byRef.get("projection://t173/verifier-execution")?.evidenceRole, "test_execution");
  assert.equal(byRef.get("projection://t173/verifier-execution")?.projectionRole, "evidence_expectation");
  assert.equal(byRef.get("projection://t173/interpretation")?.evidenceRole, "semantic_interpretation");
  assert.equal(byRef.get("projection://t173/interpretation")?.projectionRole, "evidence_expectation");

  for (const ref of [
    "projection://t173/subject-artifact",
    "projection://t173/verifier-artifact",
    "projection://t173/verifier-execution",
    "projection://t173/interpretation"
  ]) {
    const projection = byRef.get(ref);
    assert.equal(projection?.targetPath, null);
    assert.equal(projection?.command, null);
    assert.equal(projection?.fallbackCommand, null);
    assert.deepEqual(projection?.sourceRefs, [
      "proof-relation://t173/generic",
      "policy://plugin-owned/verifier-policy"
    ]);
  }

  const routeProjectionEvents = context.value.admissionRuntimeEvents
    .filter((event) =>
      event.requirementPayload.kind === "requirement_projection_admitted" &&
      byRef.has(event.requirementPayload.projection.projectionRef)
    );
  assert.equal(routeProjectionEvents.length, 5);
});
