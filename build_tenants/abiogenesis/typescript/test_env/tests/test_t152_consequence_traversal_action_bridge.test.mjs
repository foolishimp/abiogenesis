// Validates: T-152
// Validates: REQ-R-ABG3-FP-CONSCIOUSNESS

import test from "node:test";
import assert from "node:assert/strict";

import {
  ABG_ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILIES_DECLARATION_KEY,
  admitConsequenceProjectionOutcome,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  runEngineIterate,
  runEngineIterateAsync
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

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
      0: Object.freeze([allowedTraversalFamiliesEntry(["depth_traversal"])]),
      1: Object.freeze([allowedTraversalFamiliesEntry(["depth_traversal"])]),
      2: Object.freeze([allowedTraversalFamiliesEntry(["depth_traversal"])])
    })
  });
}

function fdEvaluatorContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fd_evaluator",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FdEvaluationOutcome"
  });
}

function attachedFpArtifact(input) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "T-152 async re-entry dispatch output accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://t152/async-reentry/${assessmentId}`]
    })),
    selected_worker_id: "worker://t152",
    selected_backend: "backend://node",
    role_id: "role://t152",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
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
    ...m03InstructionAssemblyRequestFields(basis),
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
          driverRequirement: "sync_compatible",
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
  assert.equal(
    outcome.transition.terminalKind,
    "converged",
    JSON.stringify(outcome.transition)
  );
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

test("T-152 async engine consumes consequence re-entry into async F_P dispatch", async () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: "dispatch://t152/async-reentry",
    vectorRegimes: ["F_D", "F_P", "F_D"],
    runId: "run://t152/consequence-bridge-async",
    workKey: "work-key://t152/consequence-bridge-async"
  });
  const targetVectorIndex = 1;
  const emittedEvents = [];
  const fpDispatchEdges = [];
  let traversalActionIssued = false;
  const outcome = await runEngineIterateAsync({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t152/async-reentry/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          driverRequirement: "sync_compatible",
          ref: "plugin://t152/async-reentry/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch: async (input) => {
          fpDispatchEdges.push(input.edge);
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t152/async-reentry/${input.vectorIndex}`,
            attachedResultArtifact: attachedFpArtifact(input),
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }),
      fpEvaluator: Object.freeze({
        contract: constructEnginePluginContract({
          driverRequirement: "sync_compatible",
          ref: "plugin://t152/async-reentry/fp-evaluator",
          pluginKind: "fp_evaluator",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpEvaluationOutcome"
        }),
        evaluate: (input) =>
          constructFpEvaluationOutcome({
            status: "evaluated",
            findings: [
              constructFpEvaluationFinding({
                findingRef: `finding://t152/async-reentry/${input.vectorIndex}`,
                evaluatorRef: input.contract.ref,
                gainReportRef: `gain://t152/async-reentry/${input.vectorIndex}`,
                metricRefs: [`metric://t152/async-reentry/${input.vectorIndex}`],
                closeDisposition: "close",
                evidenceRefs: [input.sourceProjectionRef],
                authorityRefs: [
                  ...input.expectedAssessmentIds,
                  `authority://t152/async-reentry/${input.vectorIndex}`
                ],
                compositionContributionRef:
                  input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
                compositionRef: input.selectedCompositionRef,
                compositionDigest: input.selectedCompositionDigest
              })
            ],
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          driverRequirement: "sync_compatible",
          ref: "plugin://t152/async-reentry/consequence",
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
              consequenceRef: "consequence://t152/async-reentry",
              domainReadModelRefs: ["read-model://t152/async-reentry"],
              traversalAction: rawTraversalAction(basis, targetVectorIndex),
              evidenceRefs: ["evidence://t152/async-reentry"],
              reason: null
            };
          }
          return {
            kind: "consequence_projection",
            status: "projected",
            consequenceRef: `consequence://t152/async-reentry/no-op/${input.vectorIndex}`,
            domainReadModelRefs: [],
            traversalAction: null,
            evidenceRefs: [`evidence://t152/async-reentry/no-op/${input.vectorIndex}`],
            reason: null
          };
        }
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(
    outcome.transition.terminalKind,
    "converged",
    JSON.stringify(outcome.transition)
  );
  assert.deepEqual(fpDispatchEdges, [
    "requirements→design",
    "requirements→design"
  ]);
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "graph_reentry_applied" &&
        event.targetVectorIndex === targetVectorIndex
    )
  );
});

test("T-159 blocked consequence projection does not close the vector", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t159/consequence-bind/blocked-no-close",
    workKey: "work-key://t159/consequence-bind/blocked-no-close"
  });
  const emittedEvents = [];
  const outcome = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t159/blocked-no-close/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          driverRequirement: "sync_compatible",
          ref: "plugin://t159/blocked-no-close/consequence",
          pluginKind: "consequence_projection",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project: () => ({
          kind: "consequence_projection",
          status: "blocked",
          consequenceRef: "consequence://t159/blocked-no-close",
          domainReadModelRefs: [],
          traversalAction: null,
          evidenceRefs: ["evidence://t159/blocked-no-close"],
          reason: "consequence_bind_blocked"
        })
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "gap_stop");
  assert.match(outcome.transition.reason, /consequence_bind_blocked/u);
  assert.equal(
    emittedEvents.some((event) => event.kind === "vector_closed"),
    false
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
    ...m03InstructionAssemblyRequestFields(basis),
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
          driverRequirement: "sync_compatible",
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

test("T-159 consequence bind accepts graph function name aliases at replay boundary", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t159/consequence-bind/graph-function-name",
    workKey: "work-key://t159/consequence-bind/graph-function-name"
  });
  const targetVectorIndex = 1;
  const emittedEvents = [];
  let traversalActionIssued = false;
  const outcome = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t159/consequence-bind/name/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          driverRequirement: "sync_compatible",
          ref: "plugin://t159/consequence-bind/name/consequence",
          pluginKind: "consequence_projection",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "ConsequenceProjectionOutcome"
        }),
        project: (input) => {
          const shouldIssueTraversalAction =
            input.vectorIndex === 2 && !traversalActionIssued;
          if (shouldIssueTraversalAction) {
            traversalActionIssued = true;
          }
          return {
            kind: "consequence_projection",
            status: "projected",
            consequenceRef: `consequence://t159/name-alias/${input.vectorIndex}`,
            domainReadModelRefs: [`read-model://t159/name-alias/${input.vectorIndex}`],
            traversalAction:
              shouldIssueTraversalAction
                ? rawTraversalAction(basis, targetVectorIndex, {
                    selectedGraphFunctionRef: basis.graphFunction.name
                  })
                : null,
            evidenceRefs: [`evidence://t159/name-alias/${input.vectorIndex}`],
            reason: null
          };
        }
      })
    }
  });

  assert.equal(outcome.transition.kind, "terminal");
  assert.equal(outcome.transition.terminalKind, "converged");
  assert.ok(
    emittedEvents.some(
      (event) =>
        event.kind === "graph_reentry_applied" &&
        event.targetVectorIndex === targetVectorIndex
    )
  );
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

  // F5 upgrade of this differential: the engine-authority rejection is
  // now REPLAY-VISIBLE TYPED TRUTH (a blocked consequence projection
  // carrying the admission message), never a host throw — the same law
  // T-159 named ("admits plugin proposal only through ABG
  // replay-visible re-entry"), with the rejection itself as truth.
  const outcome = runEngineIterate({
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
          driverRequirement: "sync_compatible",
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
  });
  // the rejection is truth, not a crash
  const rejectionVisible = outcome.replayEvents.some((event) =>
    typeof event.reason === "string" &&
    event.reason.includes("consequence projection plugin threw (contract_failure)") &&
    event.reason.includes("cannot own engine authority"));
  assert.equal(rejectionVisible, true, "authority rejection must be replay-visible typed truth");
  // the unlawful proposal was never applied
  assert.equal(
    emittedEvents.some((event) => event.kind === "graph_reentry_applied"),
    false
  );
  // and the affected vector did not close on a blocked consequence
  assert.notEqual(outcome.transition.kind === "terminal" && outcome.transition.terminalKind === "converged", true,
    "a run with a rejected consequence proposal must not converge past it");
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
    ...m03InstructionAssemblyRequestFields(basis),
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
          driverRequirement: "sync_compatible",
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

test("T-205 B5-prep: the spine tells the re-entry story — re-entered vectors carry fresh triple spines with monotone attempts, zero orphans, all judged", () => {
  const basis = buildConsequenceCatalogBasis({
    defaultRegime: "F_D",
    dispatchRef: null,
    vectorRegimes: ["F_D", "F_D", "F_D"],
    runId: "run://t205/reentry-spine",
    workKey: "work-key://t205/reentry-spine"
  });
  const targetVectorIndex = 1;
  let traversalActionIssued = false;
  const outcome = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => {},
    plugins: {
      fdEvaluator: Object.freeze({
        contract: fdEvaluatorContract("plugin://t205/reentry-spine/fd"),
        evaluate: (input) =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.sourceProjectionRef]
          })
      }),
      consequenceProjection: Object.freeze({
        contract: constructEnginePluginContract({
          driverRequirement: "sync_compatible",
          ref: "plugin://t205/reentry-spine/consequence",
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
              consequenceRef: "consequence://t205/reentry",
              domainReadModelRefs: [],
              traversalAction: rawTraversalAction(basis, targetVectorIndex),
              evidenceRefs: ["evidence://t205/reentry"],
              reason: null
            };
          }
          return {
            kind: "consequence_projection",
            status: "projected",
            consequenceRef: `consequence://t205/pass/${input.vectorIndex}`,
            domainReadModelRefs: [],
            traversalAction: null,
            evidenceRefs: [`evidence://t205/pass/${input.vectorIndex}`],
            reason: null
          };
        }
      })
    }
  });
  assert.equal(outcome.transition.terminalKind, "converged");
  assert.equal(
    outcome.replayEvents.some(
      (e) => e.kind === "graph_reentry_applied" && e.targetVectorIndex === targetVectorIndex
    ),
    true,
    "upstream landing taken"
  );
  const spines = outcome.replayEvents.filter((e) => e.kind === "c_call_opened");
  // re-entered vectors (1, 2) ran TWICE: two evaluate spines each,
  // attempts monotone (replay-global identity across the loop, -004)
  for (const vec of [1, 2]) {
    const evalOpens = spines.filter((e) => e.vectorIndex === vec && e.stageRole === "evaluate");
    assert.equal(evalOpens.length, 2, `vector ${vec} evaluate ran twice`);
    assert.deepEqual(evalOpens.map((e) => e.attempt), [1, 2], `vector ${vec} attempts monotone`);
  }
  const vec0Evals = spines.filter((e) => e.vectorIndex === 0 && e.stageRole === "evaluate");
  assert.equal(vec0Evals.length, 1, "vector 0 (before the landing) ran once");
  // enclosure across the loop: every opened judged, zero orphans
  const openedRefs = new Set(spines.map((e) => e.cCallRef));
  assert.equal(new Set(spines.map((e) => e.cCallRef)).size, spines.length, "no ref collision across re-entry");
  const judged = outcome.replayEvents.filter((e) => e.kind === "c_call_judged");
  assert.equal(judged.length, spines.length, "every opened C call judged across the re-entry loop");
  for (const e of outcome.replayEvents) {
    if (e.cCallRef !== undefined && e.kind !== "c_call_opened") {
      assert.equal(openedRefs.has(e.cCallRef), true, "no orphan spine rows");
    }
  }
});
