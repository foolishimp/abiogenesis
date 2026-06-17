// Validates: T-156
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS
// Validates: REQ-R-ABG3-FN-COMPOSITION

import test from "node:test";
import assert from "node:assert/strict";

import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
  admitConsequenceTraversalActionAgainstAllowedCatalog,
  admitConsequenceTraversalActionForAllowedCatalog,
  constructAllowedConsequenceTraversalCatalog,
  constructAllowedConsequenceTraversalRow,
  constructConsequenceTraversalAction,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  deriveAllowedConsequenceTraversalCatalogFromGtl,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function allowedTraversalFamiliesEntry(families) {
  return Object.freeze({
    key: ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze([...families])
    })
  });
}

function basisWithAllowedFamilies(familiesByIndex) {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t156/catalog",
    workKey: "work-key://t156/catalog",
    vectorDeclarationEntriesByIndex: Object.freeze(
      Object.fromEntries(
        Object.entries(familiesByIndex).map(([index, families]) => [
          Number(index),
          Object.freeze([allowedTraversalFamiliesEntry(families)])
        ])
      )
    )
  });
}

function fdEvaluatorContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome"
  });
}

function consequenceContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "consequence_projection",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "ConsequenceProjectionOutcome"
  });
}

function depthAction(basis, targetVectorIndex, extra = {}) {
  const targetVector = basis.graph.vectors[targetVectorIndex];
  assert.ok(targetVector);
  const sourceNode = targetVector.source[0];
  assert.ok(sourceNode);
  return constructConsequenceTraversalAction({
    kind: "consequence_traversal_action",
    actionRef: "action://t156/depth",
    consequenceRef: "consequence://t156/depth",
    strategyDecisionRef: "strategy://t156/simple-then-depth",
    parentObligationRef: "obligation://t156/depth",
    actionKind: "reenter_graph_span",
    selectedTraversalFamily: "depth_traversal",
    selectedGraphFunctionRef: basis.graphFunction.id,
    selectedOverlayRef: "overlay://t156/deep",
    selectedRefinementBoundaryRef: "refinement-boundary://t156/depth",
    sourceNodeRef: sourceNode.id,
    targetNodeRef: targetVector.target.id,
    graphVectorRef: targetVector.id,
    graphSpanRef: `graph-span://t156/${targetVector.name}`,
    reentryTargetRef: `graph-reentry-point://realization/${targetVectorIndex}`,
    targetOutcomeRef: "outcome://t156/depth",
    inputAssetRefs: ["asset://t156/source"],
    expectedOutputAssetRefs: ["asset://t156/output"],
    requiredAuthorityRefs: ["authority://t156/depth"],
    proportionalityBasisRefs: ["proportionality://t156/simple-then-depth"],
    evidencePolicyRef: "evidence-policy://t156/depth",
    foldbackPolicyRef: "foldback-policy://t156/depth",
    nonAdmissionReasonRefs: [],
    ...extra
  });
}

function directCatalogForFamilyProof(basis) {
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  return constructAllowedConsequenceTraversalCatalog({
    catalogRef: "allowed-catalog://t156/family-matrix",
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vector.id,
    vectorIndex: 1,
    edgeRef: vector.name,
    rows: [
      constructAllowedConsequenceTraversalRow({
        rowRef: "allowed-row://t156/same-edge",
        traversalFamily: "same_edge_retry",
        edgeRef: vector.name,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRef: vector.id,
        allowedActionKinds: ["repair_same_edge"],
        requiredAuthorityRefs: ["authority://t156/same-edge"]
      }),
      constructAllowedConsequenceTraversalRow({
        rowRef: "allowed-row://t156/graph-span",
        traversalFamily: "graph_span_reentry",
        edgeRef: vector.name,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRef: vector.id,
        allowedActionKinds: ["reenter_graph_span"],
        requiredAuthorityRefs: ["authority://t156/graph-span"]
      }),
      constructAllowedConsequenceTraversalRow({
        rowRef: "allowed-row://t156/gap-stop",
        traversalFamily: "gap_stop",
        edgeRef: vector.name,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRef: vector.id,
        allowedActionKinds: ["block_episode"],
        requiredAuthorityRefs: ["authority://t156/gap-stop"]
      }),
      constructAllowedConsequenceTraversalRow({
        rowRef: "allowed-row://t156/non-admit",
        traversalFamily: "non_admit",
        edgeRef: vector.name,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRef: vector.id,
        allowedActionKinds: ["non_admit"]
      })
    ]
  });
}

function directSelection(input) {
  return Object.freeze({
    actionRef: `action://t156/${input.family}`,
    actionKind: input.actionKind,
    selectedTraversalFamily: input.family,
    selectedGraphFunctionRef: input.graphFunctionRef,
    graphVectorRef: input.graphVectorRef,
    requiredAuthorityRefs: input.authorityRefs ?? Object.freeze([]),
    proportionalityBasisRefs: input.proportionalityBasisRefs ?? Object.freeze([])
  });
}

test("T-156 derives allowed consequence traversal catalog from GTL vector declarations", () => {
  const basis = basisWithAllowedFamilies({
    1: ["same_edge_retry", "depth_traversal", "ticket_traversal"]
  });
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  const catalog = deriveAllowedConsequenceTraversalCatalogFromGtl({
    graphFunction: basis.graphFunction,
    graphVector: vector,
    vectorIndex: 1,
    edgeRef: vector.name
  });

  assert.equal(catalog.kind, "allowed_consequence_traversal_catalog");
  assert.deepEqual(
    [...new Set(catalog.rows.map((row) => row.traversalFamily))].sort(),
    ["depth_traversal", "same_edge_retry", "ticket_traversal"]
  );
  assert.ok(
    catalog.rows.every((row) =>
      row.declarationSourceRefs.some((ref) =>
        ref.includes(ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY)
      )
    )
  );

  const admission = admitConsequenceTraversalActionForAllowedCatalog({
    catalog,
    action: depthAction(basis, 1)
  });
  assert.equal(admission.traversalFamily, "depth_traversal");
  assert.equal(admission.actionKind, "reenter_graph_span");
});

test("T-156 rejects a consequence action whose family is not declared for the edge", () => {
  const basis = basisWithAllowedFamilies({
    1: ["same_edge_retry"]
  });
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  const catalog = deriveAllowedConsequenceTraversalCatalogFromGtl({
    graphFunction: basis.graphFunction,
    graphVector: vector,
    vectorIndex: 1,
    edgeRef: vector.name
  });

  assert.throws(
    () =>
      admitConsequenceTraversalActionForAllowedCatalog({
        catalog,
        action: depthAction(basis, 1)
      }),
    /no matching allowed consequence traversal catalog row was admitted/u
  );
});

test("T-156 directly admits sibling traversal families through one catalog algebra", () => {
  const basis = basisWithAllowedFamilies({});
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  const catalog = directCatalogForFamilyProof(basis);
  const cases = [
    {
      family: "same_edge_retry",
      actionKind: "repair_same_edge",
      authorityRefs: ["authority://t156/same-edge"]
    },
    {
      family: "graph_span_reentry",
      actionKind: "reenter_graph_span",
      authorityRefs: ["authority://t156/graph-span"]
    },
    {
      family: "gap_stop",
      actionKind: "block_episode",
      authorityRefs: ["authority://t156/gap-stop"]
    },
    {
      family: "non_admit",
      actionKind: "non_admit",
      authorityRefs: []
    }
  ];

  for (const entry of cases) {
    const admission = admitConsequenceTraversalActionAgainstAllowedCatalog({
      catalog,
      action: directSelection({
        ...entry,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRef: vector.id
      })
    });
    assert.equal(admission.traversalFamily, entry.family);
    assert.equal(admission.actionKind, entry.actionKind);
  }
});

test("T-156 rejects catalog selection when required route authority is absent", () => {
  const basis = basisWithAllowedFamilies({});
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  const catalog = directCatalogForFamilyProof(basis);

  assert.throws(
    () =>
      admitConsequenceTraversalActionAgainstAllowedCatalog({
        catalog,
        action: directSelection({
          family: "same_edge_retry",
          actionKind: "repair_same_edge",
          graphFunctionRef: basis.graphFunction.id,
          graphVectorRef: vector.id
        })
      }),
    /no matching allowed consequence traversal catalog row was admitted/u
  );
});

test("T-156 does not accept proportionality refs as route authority", () => {
  const basis = basisWithAllowedFamilies({});
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  const catalog = directCatalogForFamilyProof(basis);

  assert.throws(
    () =>
      admitConsequenceTraversalActionAgainstAllowedCatalog({
        catalog,
        action: directSelection({
          family: "same_edge_retry",
          actionKind: "repair_same_edge",
          graphFunctionRef: basis.graphFunction.id,
          graphVectorRef: vector.id,
          proportionalityBasisRefs: ["authority://t156/same-edge"]
        })
      }),
    /no matching allowed consequence traversal catalog row was admitted/u
  );
});

test("T-156 runner blocks consequence traversal actions without a declared catalog row", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t156/runner-catalog-block",
    workKey: "work-key://t156/runner-catalog-block"
  });

  const outcome = runEngineIterate({
    basis,
    eventSink: () => {},
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t156/runner-catalog-block/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: consequenceContract("plugin://t156/runner-catalog-block/consequence"),
        project: (input) => ({
          kind: "consequence_projection",
          status: "projected",
          consequenceRef: "consequence://t156/runner-catalog-block",
          domainReadModelRefs: [],
          traversalAction:
            input.vectorIndex === 2 ? depthAction(basis, 1) : null,
          evidenceRefs: ["evidence://t156/runner-catalog-block"],
          reason: null
        })
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "gap_stop");
  assert.match(
    outcome.transition.reason,
    /no matching allowed consequence traversal catalog row was admitted/u
  );
});

test("T-159 empty consequence traversal catalog is lawful no-bind truth until a plugin proposes traversal", () => {
  const basis = basisWithAllowedFamilies({});
  const vector = basis.graph.vectors[1];
  assert.ok(vector);
  const catalog = deriveAllowedConsequenceTraversalCatalogFromGtl({
    graphFunction: basis.graphFunction,
    graphVector: vector,
    vectorIndex: 1,
    edgeRef: vector.name
  });

  assert.equal(catalog.rows.length, 0);
  assert.throws(
    () =>
      admitConsequenceTraversalActionForAllowedCatalog({
        catalog,
        action: depthAction(basis, 1)
      }),
    /no matching allowed consequence traversal catalog row was admitted/u
  );

  const emittedEvents = [];
  const runtimeBasis = buildThreeStageBasis({
      defaultRegime: "F_D",
      dispatchRef: null,
      vectorRegimes: ["F_D", "F_D", "F_D"],
      runId: "run://t159/empty-catalog/no-bind",
      workKey: "work-key://t159/empty-catalog/no-bind"
  });
  const outcome = runEngineIterate({
    basis: runtimeBasis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t159/empty-catalog/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: consequenceContract("plugin://t159/empty-catalog/consequence"),
        project: (input) => ({
          kind: "consequence_projection",
          status: "projected",
          consequenceRef: "consequence://t159/empty-catalog",
          domainReadModelRefs: [],
          traversalAction:
            input.vectorIndex === 2 ? depthAction(runtimeBasis, 1) : null,
          evidenceRefs: ["evidence://t159/empty-catalog"],
          reason: null
        })
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "gap_stop");
  assert.match(
    outcome.transition.reason,
    /no matching allowed consequence traversal catalog row was admitted/u
  );
  assert.equal(
    emittedEvents.some((event) => event.kind === "graph_reentry_applied"),
    false
  );
});
