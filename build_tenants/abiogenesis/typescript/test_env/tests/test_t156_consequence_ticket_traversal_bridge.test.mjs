// Validates: T-156
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitConsequenceTraversalActionForAllowedCatalog,
  constructAllowedConsequenceTraversalCatalog,
  constructAllowedConsequenceTraversalRow,
  constructConsequenceTraversalAction
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function basis() {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t156/ticket-traversal",
    workKey: "work-key://t156/ticket-traversal"
  });
}

function ticketCatalog(basisValue, vectorIndex) {
  const vector = basisValue.graph.vectors[vectorIndex];
  assert.ok(vector);
  return constructAllowedConsequenceTraversalCatalog({
    catalogRef: "allowed-catalog://t156/ticket",
    graphFunctionRef: basisValue.graphFunction.id,
    graphVectorRef: vector.id,
    vectorIndex,
    edgeRef: vector.name,
    rows: [
      constructAllowedConsequenceTraversalRow({
        rowRef: "allowed-row://t156/ticket",
        traversalFamily: "ticket_traversal",
        edgeRef: vector.name,
        graphFunctionRef: basisValue.graphFunction.id,
        graphVectorRef: vector.id,
        allowedActionKinds: ["invoke_graph_function"],
        allowedTraversalTargetRefs: ["asset:ticket/T-900"],
        requiredAuthorityRefs: ["authority://t156/ticket-route"],
        proportionalityBasisRefs: ["proportionality://t156/ticket-route"],
        declarationSourceRefs: [
          "gtl-declaration://t156/current-edge/ticket-route"
        ]
      })
    ]
  });
}

function ticketAction(basisValue, vectorIndex, selectedTraversalTargetRef) {
  const vector = basisValue.graph.vectors[vectorIndex];
  assert.ok(vector);
  const sourceNode = vector.source[0];
  assert.ok(sourceNode);
  return constructConsequenceTraversalAction({
    actionRef: "action://t156/ticket",
    consequenceRef: "consequence://t156/ticket-pressure",
    strategyDecisionRef: "strategy://t156/ticket-route",
    parentObligationRef: "obligation://t156/ticket",
    actionKind: "invoke_graph_function",
    selectedTraversalFamily: "ticket_traversal",
    selectedGraphFunctionRef: basisValue.graphFunction.id,
    selectedOverlayRef: "overlay://t156/ticket-workflow",
    selectedTraversalTargetRef,
    sourceNodeRef: sourceNode.id,
    targetNodeRef: vector.target.id,
    graphVectorRef: null,
    graphSpanRef: "graph-span://t156/ticket",
    reentryTargetRef: null,
    targetOutcomeRef: "outcome://t156/ticket-route",
    inputAssetRefs: ["asset://t156/source"],
    expectedOutputAssetRefs: ["asset:ticket/T-900"],
    requiredAuthorityRefs: ["authority://t156/ticket-route"],
    proportionalityBasisRefs: ["proportionality://t156/ticket-route"],
    evidencePolicyRef: "evidence-policy://t156/ticket",
    foldbackPolicyRef: "foldback-policy://t156/ticket",
    nonAdmissionReasonRefs: []
  });
}

test("T-156 admits ticket traversal only as a product-declared route", () => {
  const basisValue = basis();
  const catalog = ticketCatalog(basisValue, 1);
  const admission = admitConsequenceTraversalActionForAllowedCatalog({
    catalog,
    action: ticketAction(basisValue, 1, "asset:ticket/T-900")
  });

  assert.equal(admission.traversalFamily, "ticket_traversal");
  assert.equal(admission.actionKind, "invoke_graph_function");
  assert.equal(admission.selectedRowRef, "allowed-row://t156/ticket");
  assert.ok(
    admission.authorityRefs.includes(
      "gtl-declaration://t156/current-edge/ticket-route"
    )
  );
});

test("T-156 rejects ticket traversal that targets downstream ticket storage as ABG law", () => {
  const basisValue = basis();
  const catalog = ticketCatalog(basisValue, 1);

  assert.throws(
    () =>
      admitConsequenceTraversalActionForAllowedCatalog({
        catalog,
        action: ticketAction(
          basisValue,
          1,
          "workspace://.ai-workspace/tickets/active/T-900.md"
        )
      }),
    /ticket_traversal must route through a product-declared graph function/u
  );
});
