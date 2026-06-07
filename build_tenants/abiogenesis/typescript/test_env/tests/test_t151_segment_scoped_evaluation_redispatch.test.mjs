// Validates: T-151
// Validates: REQ-R-ABG3-ITERATION
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-L-GTL3-EVALUATOR

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  admitFpEvaluationOutcome,
  admitGtlEvaluationScopeRef,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructGtlEvaluationScopeRef,
  constructVectorTraversalPlannedEvent,
  deriveIterationOutcomeProjection,
  deriveRuntimeAggregateProjection,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function sourceFile(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

function vectorEdge(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.notEqual(vector, undefined);
  return vector.name;
}

function runtimeFixture({ vectorIndex = 1 } = {}) {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t151"
  });
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({
      basis,
      vectorIndex
    })
  ];
  const projection = deriveRuntimeAggregateProjection(basis, events);
  return {
    basis,
    vectorIndex,
    graphCallRef: projection.graphCallId,
    frameRef: projection.frameId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: vectorEdge(basis, vectorIndex),
    compositionRef: "composition://t151/direct",
    compositionDigest: "digest://t151/direct",
    projection
  };
}

function scope(runtime, overrides = {}) {
  return constructGtlEvaluationScopeRef({
    graphCallRef: runtime.graphCallRef,
    frameRef: runtime.frameRef,
    graphFunctionRef: runtime.graphFunctionRef,
    graphVectorRef: runtime.graphVectorRef,
    vectorIndex: runtime.vectorIndex,
    compositionRef: runtime.compositionRef,
    compositionDigest: runtime.compositionDigest,
    scopeTopologyRef: "scope-topology://t151/grid",
    scopeKind: "dimension_cell",
    segmentRef: "segment://t151/a",
    dimensionRef: "dimension://t151/depth",
    ...overrides
  });
}

function satisfaction(input) {
  return Object.freeze({
    authorityRef: input.authorityRef,
    status: input.status,
    reason: input.reason ?? null,
    lifecycle: input.lifecycle ?? "active",
    evidenceRefs: input.evidenceRefs ?? [`evidence://${input.authorityRef}`],
    reEntryPoint: input.reEntryPoint ?? null,
    evaluationScopeRef: input.evaluationScopeRef ?? null
  });
}

function derive(runtime, extra) {
  return deriveIterationOutcomeProjection({
    basis: runtime.basis,
    runtimeProjection: runtime.projection,
    vectorIndex: runtime.vectorIndex,
    ...extra
  });
}

function pluginContract(pluginKind, ref, outputCarrier) {
  return constructEnginePluginContract({
    ref,
    pluginKind,
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier
  });
}

function fpDispatchPlugin() {
  return Object.freeze({
    contract: pluginContract(
      "fp_dispatch",
      "plugin://t151/fp-dispatch",
      "FpDispatchOutcome"
    ),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t151/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: {
          edge: input.expectedEdge ?? input.edge,
          actor: "codex",
          fulfillment_assessments: input.expectedAssessmentIds.map(
            (assessmentId) => ({
              id: assessmentId,
              evaluator: assessmentId,
              fulfillment_status: "fulfilled",
              fulfillment_detail: "T-151 scoped dispatch output accepted",
              blocking_reasons: [],
              evidence_refs: [`proof://t151/${assessmentId}`]
            })
          ),
          selected_worker_id: "worker://t151",
          selected_backend: "backend://node",
          role_id: "role://t151",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function fdEvaluatorPlugin() {
  return Object.freeze({
    contract: pluginContract(
      "fd_evaluator",
      "plugin://t151/fd",
      "FdEvaluationOutcome"
    ),
    evaluate(input) {
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function scopeForPluginInput(input, overrides = {}) {
  return constructGtlEvaluationScopeRef({
    graphCallRef: input.graphCallId,
    frameRef: input.frameId,
    graphFunctionRef: input.graphFunctionId,
    graphVectorRef: input.edge,
    vectorIndex: input.vectorIndex,
    compositionRef: input.selectedCompositionRef,
    compositionDigest: input.selectedCompositionDigest,
    scopeTopologyRef: "scope-topology://t151/runner-grid",
    scopeKind: "dimension_cell",
    segmentRef: "segment://t151/runner/a",
    dimensionRef: "dimension://t151/runner/depth",
    ...overrides
  });
}

function fpEvaluatorPlugin({ mutateScope } = {}) {
  return Object.freeze({
    contract: pluginContract(
      "fp_evaluator",
      "plugin://t151/fp-evaluator",
      "FpEvaluationOutcome"
    ),
    evaluate(input) {
      const evaluationScopeRef = mutateScope?.(input) ?? scopeForPluginInput(input);
      return constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding://t151/fp/${input.vectorIndex}`,
            evaluatorRef: input.contract.ref,
            gainReportRef: `gain://t151/${input.vectorIndex}`,
            metricRefs: [`metric://t151/${input.vectorIndex}`],
            closeDisposition: "close",
            evidenceRefs: [`evidence://t151/fp/${input.vectorIndex}`],
            authorityRefs: [
              ...new Set([
                ...input.expectedAssessmentIds,
                `authority://t151/fp/${input.vectorIndex}`
              ])
            ],
            compositionContributionRef:
              input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
            compositionRef: input.selectedCompositionRef,
            compositionDigest: input.selectedCompositionDigest,
            evaluationScopeRef
          })
        ],
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function firstFpBasis() {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    dispatchRef: "dispatch://t151"
  });
}

test("T-151 admits all generic evaluation scope shapes and rejects unbound shape drift", () => {
  const runtime = runtimeFixture();
  const edge = scope(runtime, { scopeKind: "edge", segmentRef: null, dimensionRef: null });
  const segment = scope(runtime, { scopeKind: "segment", dimensionRef: null });
  const cell = scope(runtime);
  const fold = scope(runtime, { scopeKind: "fold", segmentRef: null });
  const relation = scope(runtime, {
    scopeKind: "relation",
    segmentRef: null,
    dimensionRef: null,
    relationRef: "relation://t151/cross-segment"
  });

  assert.equal(admitGtlEvaluationScopeRef(edge).scopeKind, "edge");
  assert.equal(admitGtlEvaluationScopeRef(segment).segmentRef, "segment://t151/a");
  assert.equal(admitGtlEvaluationScopeRef(cell).dimensionRef, "dimension://t151/depth");
  assert.equal(admitGtlEvaluationScopeRef(fold).scopeKind, "fold");
  assert.equal(admitGtlEvaluationScopeRef(relation).relationRef, "relation://t151/cross-segment");

  assert.throws(
    () => scope(runtime, { scopeKind: "dimension_cell", dimensionRef: null }),
    /dimensionRef is required/u
  );
  assert.throws(
    () => scope(runtime, { scopeKind: "edge", segmentRef: "segment://illegal" }),
    /segmentRef must be null/u
  );
  assert.throws(
    () => scope(runtime, { vectorIndex: -1 }),
    /vectorIndex must be a non-negative integer/u
  );
});

test("T-151 F_P findings carry admitted evaluation scope refs without granting outcome authority", () => {
  const runtime = runtimeFixture();
  const evaluationScopeRef = scope(runtime);
  const finding = constructFpEvaluationFinding({
    findingRef: "finding://t151/scoped",
    evaluatorRef: "evaluator://t151",
    closeDisposition: "retry",
    residualPressureRefs: ["pressure://t151/local-cell"],
    evidenceRefs: ["evidence://t151/scoped"],
    authorityRefs: ["authority://t151/scoped"],
    compositionContributionRef: "composition-contribution://t151",
    compositionRef: runtime.compositionRef,
    compositionDigest: runtime.compositionDigest,
    evaluationScopeRef
  });

  const admitted = admitFpEvaluationOutcome({
    kind: "fp_evaluation",
    status: "evaluated",
    findings: [finding],
    ambiguityStatus: "partial",
    evidenceRefs: ["evidence://t151/outcome"]
  });

  assert.equal(admitted.findings[0].evaluationScopeRef.scopeRef, evaluationScopeRef.scopeRef);
  assert.equal(admitted.findings[0].closeDisposition, "retry");
  assert.throws(
    () =>
      admitFpEvaluationOutcome({
        kind: "fp_evaluation",
        status: "evaluated",
        findings: [
          {
            ...finding,
            evaluationScopeRef: {
              ...evaluationScopeRef,
              dimensionRef: null
            }
          }
        ]
      }),
    /dimensionRef is required/u
  );
  assert.throws(
    () =>
      admitFpEvaluationOutcome({
        kind: "fp_evaluation",
        status: "evaluated",
        findings: [
          {
            ...finding,
            nextVectorIndex: 2
          }
        ]
      }),
    /plugin outcome cannot own engine authority/u
  );
});

test("T-151 n>1 scoped grid redispatches one failed cell and preserves admitted siblings", () => {
  const runtime = runtimeFixture();
  const cellA = scope(runtime, {
    segmentRef: "segment://t151/a",
    dimensionRef: "dimension://t151/depth"
  });
  const cellB = scope(runtime, {
    segmentRef: "segment://t151/b",
    dimensionRef: "dimension://t151/depth"
  });
  const cellC = scope(runtime, {
    segmentRef: "segment://t151/c",
    dimensionRef: "dimension://t151/authority"
  });
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://t151/a/depth",
        status: "satisfied",
        evaluationScopeRef: cellA
      }),
      satisfaction({
        authorityRef: "authority://t151/b/depth",
        status: "satisfied",
        evaluationScopeRef: cellB
      }),
      satisfaction({
        authorityRef: "authority://t151/c/authority",
        status: "unsatisfied",
        reason: "partial_evidence",
        evaluationScopeRef: cellC
      })
    ]
  });

  assert.equal(projection.outcome.kind, "redispatch");
  assert.equal(projection.outcome.target.targetVectorIndex, runtime.vectorIndex);
  assert.equal(projection.outcome.target.evaluationScopeRef.scopeRef, cellC.scopeRef);
  assert.equal(
    projection.satisfactionRows.filter((row) => row.status === "satisfied").length,
    2
  );
  assert.deepEqual(
    projection.satisfactionRows
      .filter((row) => row.status === "satisfied")
      .map((row) => row.evaluationScopeRef.scopeRef),
    [cellA.scopeRef, cellB.scopeRef]
  );
});

test("T-151 scoped evaluator failure redispatches proof for only the failed scope", () => {
  const runtime = runtimeFixture();
  const failedCell = scope(runtime, {
    segmentRef: "segment://t151/d",
    dimensionRef: "dimension://t151/proof"
  });
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://t151/d/proof",
        status: "satisfied",
        evaluationScopeRef: failedCell
      })
    ],
    runtimeRows: [
      {
        boundary: "evaluator",
        status: "failed",
        reason: "evaluator_failure",
        retryable: true,
        evidenceRefs: ["evidence://t151/evaluator-529"],
        evaluationScopeRef: failedCell
      }
    ]
  });

  assert.equal(projection.outcome.kind, "redispatch");
  assert.equal(projection.outcome.target.reEntryPoint, "proof");
  assert.equal(projection.outcome.target.evaluationScopeRef.scopeRef, failedCell.scopeRef);
});

test("T-151 scoped orphan and stale evidence stay distinct before closure", () => {
  const runtime = runtimeFixture();
  const staleCell = scope(runtime, {
    segmentRef: "segment://t151/stale",
    dimensionRef: "dimension://t151/depth"
  });
  const orphanCell = scope(runtime, {
    segmentRef: "segment://t151/orphan",
    dimensionRef: "dimension://t151/depth"
  });

  const stale = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://t151/stale",
        status: "unsatisfied",
        reason: "stale_input",
        evaluationScopeRef: staleCell
      })
    ]
  });
  assert.equal(stale.outcome.kind, "redispatch");
  assert.equal(stale.outcome.target.evaluationScopeRef.scopeRef, staleCell.scopeRef);

  const orphan = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://t151/orphan/sibling",
        status: "satisfied",
        evaluationScopeRef: scope(runtime, {
          segmentRef: "segment://t151/sibling",
          dimensionRef: "dimension://t151/depth"
        })
      })
    ],
    bindingGuardRows: [
      {
        status: "orphan",
        authorityRef: "authority://t151/orphan",
        evidenceRef: "evidence://t151/orphan",
        failedCondition: "scope_has_no_declared_topology_binding",
        evaluationScopeRef: orphanCell
      }
    ]
  });
  assert.equal(orphan.outcome.kind, "terminate");
  assert.equal(orphan.outcome.disposition, "blocked");
  assert.equal(orphan.bindingGuardRows[0].evaluationScopeRef.scopeRef, orphanCell.scopeRef);
});

test("T-151 superseded failed scoped rows are replay-visible but cannot invalidate current sibling closure", () => {
  const runtime = runtimeFixture();
  const oldCell = scope(runtime, {
    segmentRef: "segment://t151/old",
    dimensionRef: "dimension://t151/depth"
  });
  const currentCell = scope(runtime, {
    segmentRef: "segment://t151/current",
    dimensionRef: "dimension://t151/depth"
  });
  const projection = derive(runtime, {
    satisfactionRows: [
      satisfaction({
        authorityRef: "authority://t151/old",
        status: "unsatisfied",
        reason: "missing_evidence",
        lifecycle: "superseded",
        evaluationScopeRef: oldCell
      }),
      satisfaction({
        authorityRef: "authority://t151/current",
        status: "satisfied",
        lifecycle: "active",
        evaluationScopeRef: currentCell
      })
    ],
    terminalFallbackRefs: ["terminal-retry://t151/old-cell"]
  });

  assert.equal(projection.satisfactionRows.length, 2);
  assert.deepEqual(projection.outcome, {
    kind: "terminate",
    disposition: "converged",
    reason: null,
    reEntryPoint: null
  });
});

test("T-151 rejects scoped iteration rows that do not bind the current boundary", () => {
  const runtime = runtimeFixture();
  assert.throws(
    () =>
      derive(runtime, {
        satisfactionRows: [
          satisfaction({
            authorityRef: "authority://t151/wrong-vector",
            status: "unsatisfied",
            reason: "partial_evidence",
            evaluationScopeRef: scope(runtime, { vectorIndex: runtime.vectorIndex + 1 })
          })
        ]
      }),
    /vectorIndex does not match iteration vector/u
  );
  assert.throws(
    () =>
      derive(runtime, {
        redispatchTargetRows: [
          {
            target: {
              reEntryPoint: "realization",
              targetVectorIndex: null,
              evaluationScopeRef: scope(runtime)
            },
            reason: "partial_evidence",
            retryable: true,
            provenanceChangeClass: "realization_refactor"
          }
        ]
      }),
    /requires targetVectorIndex/u
  );
});

test("T-151 runner path admits scoped F_P findings and rejects mismatched scope identity", () => {
  const basis = firstFpBasis();
  const events = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      fdEvaluator: fdEvaluatorPlugin()
    }
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(
    events.some(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "fp_evaluation_finding"
    ),
    true
  );

  assert.throws(
    () =>
      runEngineIterate({
        basis,
        eventSink: () => undefined,
        plugins: {
          fpDispatch: fpDispatchPlugin(),
          fpEvaluator: fpEvaluatorPlugin({
            mutateScope: (input) =>
              scopeForPluginInput(input, {
                compositionDigest: "digest://t151/wrong-composition"
              })
          }),
          fdEvaluator: fdEvaluatorPlugin()
        }
      }),
    /evaluationScopeRef\.compositionDigest does not match selected abg\.fn_composition/u
  );
});

test("T-151 structural guard keeps scoped redispatch inside the existing primitive outcome algebra", () => {
  const source = sourceFile("code/src/abg/m03/contracts/iteration_state_action.ts");
  assert.match(source, /readonly kind: "terminate"/u);
  assert.match(source, /readonly kind: "redispatch"/u);
  assert.match(source, /readonly kind: "suspend"/u);
  assert.doesNotMatch(source, /scoped_redispatch|segment_redispatch|cell_redispatch/u);
  assert.match(source, /evaluationScopeRef\?: GtlEvaluationScopeRef/u);
});
