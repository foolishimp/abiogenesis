// Validates: T-147
// Validates: REQ-R-ABG3-CORRECTION
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitComposedStageTaskOutcome,
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  assertFullRetryFrontierProjection,
  constructEnginePluginContract,
  constructAuthoritySnapshotAdmittedEvent,
  constructEvidenceAdmittedEvent,
  constructFpDispatchOutcome,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  constructRetryProgressRecordedEvent,
  defaultFpEvaluatorPlugin,
  deriveAdmittedOutputAuthorityProjection,
  deriveFreshRetryContextProjection,
  derivePayloadLedgerProjection,
  deriveRetryFrontierProjection,
  deriveRetryRepairDecision,
  deriveRuntimeAggregateProjection,
  edge,
  evaluateAssuranceGate,
  graphFunctionForVector,
  loadGtlTargetCarrierDefaultsBundle,
  runEngineIterate,
  runtimeEventsForRetryRepairDecision
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

function genericNode(id, name, kind) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `schema://t147/${kind}` },
    markov: [kind],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`standard://t147/${kind}`],
      outputContractRefs: [`contract://t147/${kind}`]
    },
    tags: ["t147", kind]
  });
}

function singleHopBasis() {
  const input = genericNode("node-t147-input", "Input", "input");
  const output = genericNode("node-t147-output", "Output", "output");
  const vector = edge([input], output, {
    id: "graph-t147-single-hop",
    name: "input→output",
    evaluators: [
      {
        name: "output_ready",
        regime: "F_P",
        description: "output accepted",
        binding: "binding://t147/output-ready",
        tags: ["fulfillment"]
      }
    ],
    declarations: { entries: [] },
    tags: ["t147"]
  }).vectors[0];
  const graphFunction = graphFunctionForVector(vector, {
    id: "graph-function-t147-single-hop",
    name: "t147_single_hop",
    declarations: { entries: [] },
    tags: ["t147"]
  });
  const module = admitModule({
    name: "t147_runtime_authority_module",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: "job-t147-single-hop",
        name: "t147_single_hop_job",
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t147"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });

  return admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: "/workspace/t147-runtime-authority",
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    },
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t147",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t147",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t147",
      approvalSubjectRef: null
    }),
    runId: "run://t147",
    workKey: "wk://t147",
    frameId: null,
    frameLineageId: null
  });
}

function appendRetryAttempt(input) {
  const projection = deriveRuntimeAggregateProjection(input.basis, input.events);
  const decision = deriveRetryRepairDecision({
    basis: input.basis,
    projection,
    failedVectorIndex: 0,
    priorManifestId: input.priorManifestId,
    candidateManifestId: input.candidateManifestId,
    maxAttempts: 8,
    stationary: false
  });
  return Object.freeze([
    ...input.events,
    ...runtimeEventsForRetryRepairDecision(decision),
    constructRetryProgressRecordedEvent({
      decision,
      progressSignalRefs: input.progressSignalRefs,
      stationary: false
    })
  ]);
}

function authorityEvent(basis) {
  return constructAuthoritySnapshotAdmittedEvent({
    basis,
    vectorIndex: 0,
    authoritySnapshotRef: "authority-snapshot://t147/output",
    authorityRefs: ["authority://t147/output"],
    inputRefs: ["input://t147"],
    authorityDigest: "authority-digest://t147/output",
    inputDigest: "input-digest://t147"
  });
}

function ledgerFor(input) {
  return derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: deriveRuntimeAggregateProjection(input.basis, input.events),
    events: input.events,
    vectorIndex: 0,
    targetCarrierDefaults: input.defaults
  });
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function attachedArtifact(input, options = {}) {
  const fulfillmentStatus = options.fulfillmentStatus ?? "fulfilled";
  const assessmentIds =
    input.expectedAssessmentIds.length === 0
      ? ["runtime_fulfilled"]
      : input.expectedAssessmentIds;
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: fulfillmentStatus,
      fulfillment_detail:
        fulfillmentStatus === "fulfilled"
          ? "runtime output accepted"
          : "runtime output blocked",
      blocking_reasons:
        fulfillmentStatus === "fulfilled" ? [] : ["runtime output blocked"],
      evidence_refs: [`evidence://t147/runtime/${assessmentId}`]
    })),
    selected_worker_id: "worker://t147",
    selected_backend: "backend://node",
    role_id: "role://t147",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

test("T-147 retry context selection ignores stale supplied frontier aliases", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const firstAttemptEvents = appendRetryAttempt({
    basis,
    events: [],
    priorManifestId: "manifest://t147/initial",
    candidateManifestId: "manifest://t147/retry-1",
    progressSignalRefs: ["blocking_reason:first-real-gap"]
  });
  const firstProjection = deriveRuntimeAggregateProjection(
    basis,
    firstAttemptEvents
  );
  const staleSuppliedFrontier = deriveRetryFrontierProjection({
    basis,
    runtimeProjection: firstProjection,
    events: firstAttemptEvents,
    vectorIndex: 0
  });
  assertFullRetryFrontierProjection({ projection: staleSuppliedFrontier });

  const currentEvents = appendRetryAttempt({
    basis,
    events: firstAttemptEvents,
    priorManifestId: "manifest://t147/retry-1",
    candidateManifestId: "manifest://t147/retry-2",
    progressSignalRefs: ["blocking_reason:second-real-gap"]
  });
  const currentProjection = deriveRuntimeAggregateProjection(basis, currentEvents);
  const context = deriveFreshRetryContextProjection({
    basis,
    runtimeProjection: currentProjection,
    events: currentEvents,
    vectorIndex: 0,
    suppliedProjection: staleSuppliedFrontier
  });

  assert.equal(context.status, "stale_supplied_projection");
  assert.equal(context.frontier.attemptCount, 2);
  assert.equal(context.replayFrontierRef, context.frontier.frontierRef);
  assert.deepEqual(
    context.selectedRows
      .filter((row) => row.reasonClass === "blocking_reason")
      .map((row) => row.detail),
    ["blocking_reason:first-real-gap", "blocking_reason:second-real-gap"]
  );
  assert.equal(
    context.selectedEvidenceRefs.includes("blocking_reason:first-real-gap"),
    true
  );
  assert.equal(
    context.selectedEvidenceRefs.includes("blocking_reason:second-real-gap"),
    true
  );
});

test("T-147 runtime plugin inputs carry fresh retry context on retry", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const inputs = [];
  const attemptByEdge = new Map();
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t147/runtime-retry-context"),
    dispatch: (input) => {
      inputs.push(input);
      const nextAttempt = (attemptByEdge.get(input.edge) ?? 0) + 1;
      attemptByEdge.set(input.edge, nextAttempt);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t147/retry-context/${encodeURIComponent(input.edge)}/${nextAttempt}`,
        attachedResultArtifact: attachedArtifact(input, {
          fulfillmentStatus:
            input.edge === "input_set→requirements" && nextAttempt === 1
              ? "blocked"
              : "fulfilled"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => undefined,
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });
  const retryInput = inputs.filter(
    (input) => input.edge === "input_set→requirements"
  )[1];

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(retryInput.retryContext.kind, "fresh_retry_context_projection");
  assert.equal(retryInput.retryContext.status, "fresh");
  assert.equal(retryInput.retryContext.frontier.attemptCount, 1);
  assert.equal(
    retryInput.retryContext.selectedRows.some((row) =>
      row.detail.includes("runtime output blocked")
    ),
    true
  );
});

test("T-147 runtime admits target output before closure and carries it downstream", () => {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  const inputs = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://t147/runtime-output-authority"),
    dispatch: (input) => {
      inputs.push(input);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t147/output-authority/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => events.push(event),
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });
  const downstreamInput = inputs.find(
    (input) => input.edge === "requirements→design"
  );
  const admittedPriorOutput =
    downstreamInput.outputAuthorityProjections.find(
      (projection) =>
        projection.scope.vectorIndex === 0 && projection.status === "admitted"
    );
  const targetObservedIndex = events.findIndex(
    (event) =>
      event.kind === "payload_observed" &&
      event.vectorIndex === 0 &&
      event.contractRef?.startsWith("gtl://target-carrier-contract/")
  );
  const targetValidatedIndex = events.findIndex(
    (event) =>
      event.kind === "payload_validated" &&
      event.vectorIndex === 0 &&
      event.contractRef?.startsWith("gtl://target-carrier-contract/")
  );
  const closureInputIndex = events.findIndex(
    (event) => event.kind === "closure_input_published" && event.vectorIndex === 0
  );
  const vectorClosedIndex = events.findIndex(
    (event) => event.kind === "vector_closed" && event.vectorIndex === 0
  );

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.notEqual(admittedPriorOutput, undefined);
  assert.equal(admittedPriorOutput.payloadRef.startsWith("payload:target_carrier:"), true);
  assert.equal(admittedPriorOutput.payloadContractRef, admittedPriorOutput.targetCarrierContractRef);
  assert.equal(targetObservedIndex >= 0, true);
  assert.equal(targetValidatedIndex > targetObservedIndex, true);
  assert.equal(closureInputIndex > targetValidatedIndex, true);
  assert.equal(vectorClosedIndex > closureInputIndex, true);
});

test("T-147 latest-only retry dossiers still fail full-frontier admission", () => {
  assert.throws(
    () =>
      assertFullRetryFrontierProjection({
        projection: {
          kind: "retry_frontier_projection",
          basisId: "basis://t147/spoof",
          graphFunctionId: "graph-function://t147/spoof",
          graphCallId: "graph-call://t147/spoof",
          frameId: "frame://t147/spoof",
          vectorIndex: 0,
          edge: "input→output",
          frontierRef:
            'retry-frontier:{"basisId":"basis://t147/spoof","vectorIndex":0,"rows":[]}',
          isFullFrontier: true,
          rows: [],
          reasonClasses: ["blocking_reason"],
          attemptCount: 1,
          latestAttemptIndex: 1
        }
      }),
    /reason classes|attempt 1/i
  );
});

test("T-147 report-shaped payloads do not satisfy output authority or closure", () => {
  const basis = singleHopBasis();
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const reportRef = "payload://t147/report-only";
  const events = Object.freeze([
    authorityEvent(basis),
    constructPayloadObservedEvent({
      basis,
      vectorIndex: 0,
      payloadRef: reportRef,
      payloadClass: "report",
      contractRef: "contract://t147/report",
      digest: "digest://t147/report",
      producerRef: "producer://t147/report",
      authorityRef: "authority://t147/output",
      inputDigest: "input-digest://t147"
    }),
    constructPayloadValidatedEvent({
      basis,
      vectorIndex: 0,
      payloadRef: reportRef,
      contractRef: "contract://t147/report",
      contractDigest: "contract-digest://t147/report",
      digest: "digest://t147/report",
      validationRef: "validation://t147/report",
      evidenceRef: "evidence://t147/report"
    }),
    constructEvidenceAdmittedEvent({
      basis,
      vectorIndex: 0,
      evidenceRef: "evidence://t147/report",
      payloadRef: reportRef,
      authorityRef: "authority://t147/output",
      authorityDigest: "authority-digest://t147/output",
      inputDigest: "input-digest://t147"
    })
  ]);
  const ledger = ledgerFor({ basis, defaults, events });
  const outputAuthority = deriveAdmittedOutputAuthorityProjection({ ledger });

  assert.equal(outputAuthority.status, "missing");
  assert.equal(outputAuthority.payloadRef, null);
  assert.deepEqual(outputAuthority.relatedPayloadRefs, [reportRef]);

  const gate = evaluateAssuranceGate({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, events),
    replayEvents: events,
    targetCarrierDefaults: defaults,
    provider: {
      authoritySnapshot: () => null
    }
  });

  assert.equal(gate.kind, "assurance_blocked");
  assert.match(gate.reason, /Target carrier contract/i);
});

test("T-147 admitted target-carrier output closes only with authority-bound evidence", () => {
  const basis = singleHopBasis();
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const emptyLedger = ledgerFor({ basis, defaults, events: [] });
  const targetCarrier = emptyLedger.targetCarrierContract;
  const payloadRef = "payload://t147/target-output";
  const events = Object.freeze([
    authorityEvent(basis),
    constructPayloadObservedEvent({
      basis,
      vectorIndex: 0,
      payloadRef,
      payloadClass: targetCarrier.outputCarrierKind,
      contractRef: targetCarrier.contractRef,
      digest: "digest://t147/target-output",
      producerRef: "producer://t147/target-output",
      sourceEventRef: "event://t147/fp-output",
      authorityRef: "authority://t147/output",
      inputDigest: "input-digest://t147"
    }),
    constructPayloadValidatedEvent({
      basis,
      vectorIndex: 0,
      payloadRef,
      contractRef: targetCarrier.contractRef,
      contractDigest: targetCarrier.configDigest,
      digest: "digest://t147/target-output",
      validationRef: "validation://t147/target-output",
      evidenceRef: "evidence://t147/target-output"
    }),
    constructEvidenceAdmittedEvent({
      basis,
      vectorIndex: 0,
      evidenceRef: "evidence://t147/target-output",
      payloadRef,
      authorityRef: "authority://t147/output",
      authorityDigest: "authority-digest://t147/output",
      inputDigest: "input-digest://t147"
    })
  ]);
  const ledger = ledgerFor({ basis, defaults, events });
  const outputAuthority = deriveAdmittedOutputAuthorityProjection({ ledger });

  assert.equal(outputAuthority.status, "admitted");
  assert.equal(outputAuthority.payloadRef, payloadRef);
  assert.equal(outputAuthority.payloadContractRef, targetCarrier.contractRef);
  assert.equal(outputAuthority.payloadDigest, "digest://t147/target-output");
  assert.deepEqual(outputAuthority.validationRefs, [
    "validation://t147/target-output"
  ]);
  assert.deepEqual(outputAuthority.evidenceRefs, [
    "evidence://t147/target-output",
    "validation://t147/target-output"
  ]);

  const gate = evaluateAssuranceGate({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, events),
    replayEvents: events,
    targetCarrierDefaults: defaults,
    provider: {
      authoritySnapshot: () => null
    }
  });

  assert.equal(gate.kind, "assurance_closed");
  assert.deepEqual(gate.closureDecisions, ["close"]);
});

test("T-147 composed stage task outcomes cannot smuggle runtime authority", () => {
  assert.throws(
    () =>
      admitComposedStageTaskOutcome({
        kind: "composed_stage_task_outcome",
        status: "accepted",
        taskRef: "task://t147/smuggle",
        stageRole: "consequence",
        taskRole: "projection",
        computeMeans: "F_D",
        projectionRefs: ["projection://t147/read-model"],
        evidenceRefs: ["evidence://t147/read-model"],
        runtimeEvents: [{ kind: "vector_closed" }],
        closeTraversal: true,
        selectedCompositionRef: "composition://t147",
        selectedCompositionDigest: "sha256:t147",
        selectedCompositionSelectionRef: "selection://t147",
        selectedRegimeBindingRef: null,
        compositionContributionRef: "composition://t147",
        reason: null
      }),
    /cannot own engine authority/i
  );
});
