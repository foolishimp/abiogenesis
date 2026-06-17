// Validates: T-152
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS

import test from "node:test";
import assert from "node:assert/strict";

import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
  admitConsequenceProjectionOutcome,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
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

function buildConsequenceCatalogBasis(options = {}) {
  return buildThreeStageBasis({
    ...options,
    vectorDeclarationEntriesByIndex: Object.freeze({
      1: Object.freeze([allowedTraversalFamiliesEntry(["depth_traversal"])]),
      2: Object.freeze([allowedTraversalFamiliesEntry(["depth_traversal"])])
    })
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

function rawTraversalAction(basis, targetVectorIndex, extra = {}) {
  const targetVector = basis.graph.vectors[targetVectorIndex];
  assert.ok(targetVector);
  const sourceNode = targetVector.source[0];
  assert.ok(sourceNode);
  return {
    kind: "consequence_traversal_action",
    actionRef: "action://t152/consequence/depth-reentry",
    consequenceRef: "consequence://t152/depth-pressure",
    strategyDecisionRef: "strategy-decision://t152/simple-then-depth",
    parentObligationRef: "obligation://t152/feature-depth",
    actionKind: "reenter_graph_span",
    selectedTraversalFamily: "depth_traversal",
    selectedGraphFunctionRef: basis.graphFunction.id,
    selectedOverlayRef: "overlay://t152/depth",
    selectedRefinementBoundaryRef: "refinement-boundary://t152/depth-reentry",
    sourceNodeRef: sourceNode.id,
    targetNodeRef: targetVector.target.id,
    graphVectorRef: targetVector.id,
    graphSpanRef: `graph-span://t152/${targetVector.name}`,
    reentryTargetRef: `graph-reentry-point://realization/${targetVectorIndex}`,
    targetOutcomeRef: "outcome://t152/depth-reentry-complete",
    inputAssetRefs: ["asset://t152/source"],
    expectedOutputAssetRefs: ["asset://t152/output"],
    requiredAuthorityRefs: [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B"
    ],
    proportionalityBasisRefs: ["proportionality://t152/simple-then-depth"],
    evidencePolicyRef: "evidence-policy://t152/depth",
    foldbackPolicyRef: "foldback-policy://t152/parent-consolidation",
    nonAdmissionReasonRefs: [],
    ...extra
  };
}

test("T-152 engine consumes consequence traversal action through construction re-entry", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t152/consequence-bridge",
    workKey: "work-key://t152/consequence-bridge"
  });
  const targetVectorIndex = 1;
  const emittedEvents = [];
  const fdEdges = [];
  let traversalActionIssued = false;
  const outcome = runEngineIterate({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t152/consequence-bridge/fd"),
        evaluate: (input) => {
          fdEdges.push(input.edge);
          return constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t152/consequence-bridge/consequence",
          pluginKind: "consequence_projection",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project: (input) => {
          if (input.vectorIndex === 2 && !traversalActionIssued) {
            traversalActionIssued = true;
            return {
              kind: "consequence_projection",
              status: "projected",
              consequenceRef: "consequence://t152/depth-pressure",
              domainReadModelRefs: ["read-model://t152/depth-pressure"],
              traversalAction: rawTraversalAction(basis, targetVectorIndex),
              evidenceRefs: ["evidence://t152/depth-pressure"],
              reason: null
            };
          }
          return {
            kind: "consequence_projection",
            status: "projected",
            consequenceRef: `consequence://t152/no-depth/${input.vectorIndex}`,
            domainReadModelRefs: [],
            traversalAction: null,
            evidenceRefs: [`evidence://t152/no-depth/${input.vectorIndex}`],
            reason: null
          };
        }
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "converged");
  assert.deepEqual(fdEdges, [
    "input_set→requirements",
    "requirements→design",
    "design→code",
    "requirements→design",
    "design→code"
  ]);
  assert.ok(
    emittedEvents.some((event) => event.kind === "construction_intent_selected")
  );
  assert.ok(
    emittedEvents.some((event) => event.kind === "construction_graph_action_invoked")
  );
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "graph_reentry_applied" &&
        event.targetVectorIndex === targetVectorIndex
    )
  );
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "construction_delta_observed" &&
        event.reentryMoved === true
    )
  );
});

test("T-159 consequence bind admits plugin proposal only through ABG replay-visible re-entry", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t159/consequence-bind/replay",
    workKey: "work-key://t159/consequence-bind/replay"
  });
  const targetVectorIndex = 1;
  const emittedEvents = [];
  const pluginProposalRefs = [];
  let traversalActionIssued = false;
  const outcome = runEngineIterate({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t159/consequence-bind/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t159/consequence-bind/consequence",
          pluginKind: "consequence_projection",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project: (input) => {
          const consequenceRef =
            input.vectorIndex === 2
              ? "consequence://t159/bind/reentry"
              : `consequence://t159/bind/noop/${input.vectorIndex}`;
          pluginProposalRefs.push(consequenceRef);
          const shouldIssueTraversalAction =
            input.vectorIndex === 2 && !traversalActionIssued;
          if (shouldIssueTraversalAction) {
            traversalActionIssued = true;
          }
          return {
            kind: "consequence_projection",
            status: "projected",
            consequenceRef,
            domainReadModelRefs: [`read-model://t159/bind/${input.vectorIndex}`],
            traversalAction:
              shouldIssueTraversalAction
                ? rawTraversalAction(basis, targetVectorIndex, {
                    consequenceRef
                  })
                : null,
            evidenceRefs: [`evidence://t159/bind/${input.vectorIndex}`],
            reason: null
          };
        }
      })
    }
  });

  assert.ok(pluginProposalRefs.includes("consequence://t159/bind/reentry"));
  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "converged");
  assert.ok(
    emittedEvents.some((event) => event.kind === "construction_intent_selected")
  );
  assert.ok(
    emittedEvents.some((event) => event.kind === "construction_graph_action_invoked")
  );
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "graph_reentry_applied" &&
        event.targetVectorIndex === targetVectorIndex
    )
  );
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "construction_delta_observed" &&
        event.reentryMoved === true
    )
  );
});

test("T-159 consequence bind admits plugin traversal proposal as data before replay", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t159/consequence-bind/admit-data",
    workKey: "work-key://t159/consequence-bind/admit-data"
  });
  const admitted = admitConsequenceProjectionOutcome({
    kind: "consequence_projection",
    status: "projected",
    consequenceRef: "consequence://t159/admit-data",
    domainReadModelRefs: ["read-model://t159/admit-data"],
    traversalAction: rawTraversalAction(basis, 1, {
      consequenceRef: "consequence://t159/admit-data"
    }),
    evidenceRefs: ["evidence://t159/admit-data"],
    reason: null
  });

  assert.equal(admitted.kind, "consequence_projection");
  assert.equal(admitted.status, "projected");
  assert.equal(admitted.consequenceRef, "consequence://t159/admit-data");
  assert.notEqual(admitted.traversalAction, null);
  assert.equal(
    admitted.traversalAction?.selectedGraphFunctionRef,
    basis.graphFunction.id
  );
  assert.equal(
    admitted.traversalAction?.selectedTraversalFamily,
    "depth_traversal"
  );
  assert.deepEqual(admitted.traversalAction?.proportionalityBasisRefs, [
    "proportionality://t152/simple-then-depth"
  ]);
});

test("T-159 consequence bind rejects engine-authority plugin proposal before replay", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t159/consequence-bind/reject-authority",
    workKey: "work-key://t159/consequence-bind/reject-authority"
  });
  const emittedEvents = [];

  assert.throws(
    () =>
      runEngineIterate({
        basis,
        eventSink: (event) => {
          emittedEvents.push(event);
        },
        plugins: {
          fdEvaluator: Object.freeze({
            contract: fdEvaluatorContract("plugin://t159/consequence-bind/reject/fd"),
            evaluate: (input) =>
              constructFdEvaluationOutcome({
                status: "accepted",
                evidenceRefs: [input.sourceProjectionRef]
              })
          }),
          consequenceProjection: Object.freeze({
            contract: constructEnginePluginContract({
              ref: "plugin://t159/consequence-bind/reject/consequence",
              pluginKind: "consequence_projection",
              authority: "effect_plugin",
              inputCarrier: "EnginePluginInput",
              outputCarrier: "ConsequenceProjectionOutcome"
            }),
            project: () => ({
              kind: "consequence_projection",
              status: "projected",
              consequenceRef: "consequence://t159/reject-authority",
              domainReadModelRefs: ["read-model://t159/reject-authority"],
              traversalAction: rawTraversalAction(basis, 1, {
                mayEmitRuntimeEvents: true
              }),
              evidenceRefs: ["evidence://t159/reject-authority"],
              reason: null
            })
          })
        }
      }),
    /mayEmitRuntimeEvents: consequence traversal action cannot own engine authority/u
  );
  assert.equal(
    emittedEvents.some((event) => event.kind === "graph_reentry_applied"),
    false
  );
});

test("T-152 consequence traversal action admission rejects engine-authority payloads", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t152/consequence-bridge/reject-authority",
    workKey: "work-key://t152/consequence-bridge/reject-authority"
  });
  assert.throws(
    () =>
      admitConsequenceProjectionOutcome({
        kind: "consequence_projection",
        status: "projected",
        consequenceRef: "consequence://t152/reject-authority",
        domainReadModelRefs: ["read-model://t152/reject-authority"],
        traversalAction: rawTraversalAction(basis, 2, {
          mayEmitRuntimeEvents: true
        }),
        evidenceRefs: ["evidence://t152/reject-authority"],
        reason: null
      }),
    /mayEmitRuntimeEvents: consequence traversal action cannot own engine authority/u
  );
});

test("T-152 engine blocks out-of-range consequence re-entry targets without throwing", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t152/consequence-bridge/out-of-range",
    workKey: "work-key://t152/consequence-bridge/out-of-range"
  });
  const outcome = runEngineIterate({
    basis,
    eventSink: () => {},
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t152/consequence-bridge/fd/oob"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t152/consequence-bridge/consequence/oob",
          pluginKind: "consequence_projection",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project: () => ({
          kind: "consequence_projection",
          status: "projected",
          consequenceRef: "consequence://t152/out-of-range-reentry",
          domainReadModelRefs: ["read-model://t152/out-of-range-reentry"],
          traversalAction: rawTraversalAction(basis, 1, {
            reentryTargetRef: "graph-reentry-point://realization/99"
          }),
          evidenceRefs: ["evidence://t152/out-of-range-reentry"],
          reason: null
        })
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "gap_stop");
  assert.equal(
    outcome.transition.reason,
    "consequence traversal action has no admitted graph reentry target"
  );
});
