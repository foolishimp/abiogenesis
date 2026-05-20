// Validates: T-107
// Validates: REQ-L-GTL3-GRAPHVECTOR-005
// Validates: REQ-L-GTL3-HOOKS-001
// Validates: REQ-R-ABG3-CONTINUATION
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitTraversalAttemptProgressRow,
  assertTraversalModulationSummaryAgreement,
  assertRuntimeEvent,
  classifyAgenticBackendProgress,
  constructAgenticBackendProgressProfile,
  constructDispatchRequest,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructTraversalAttemptDispatchedEvent,
  constructTraversalAttemptEnvelopeDerivedEvent,
  constructTraversalAttemptNonProgressClassifiedEvent,
  constructTraversalAttemptProgressObservedEvent,
  constructTraversalForcedReviewProjectedEvent,
  constructTraversalModulationExhaustedEvent,
  constructTraversalModulationResolvedEvent,
  constructTraversalSameEdgeContinuationPlannedEvent,
  deriveTraversalAttemptEnvelope,
  deriveTraversalModulationAssuranceProjection,
  deriveTraversalModulationProfileFromGtl,
  deriveTraversalModulationSummary,
  resolveTraversalStrategyDirectiveFromGtl,
  runEngineIterate,
  runEngineIterateAsync
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function attrs(entries = []) {
  return Object.freeze({ entries: Object.freeze(entries) });
}

function scalarEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function stringListEntry(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: Object.freeze(value)
    })
  });
}

function hookEntry(key, input) {
  const configEntries = [
    scalarEntry("strategy_owner_ref", input.ownerRef ?? "product://odd_sdlc"),
    scalarEntry("strategy_label", input.label),
    stringListEntry("enforcement_primitives", input.primitives)
  ];
  if (input.directiveRef !== undefined) {
    configEntries.push(scalarEntry("directive_ref", input.directiveRef));
  }
  if (input.obligationScheduleRefs !== undefined) {
    configEntries.push(
      stringListEntry("obligation_schedule_refs", input.obligationScheduleRefs)
    );
  }
  if (input.targetItemCount !== undefined) {
    configEntries.push(scalarEntry("target_item_count", input.targetItemCount));
  }
  if (input.maxItemCount !== undefined) {
    configEntries.push(scalarEntry("max_item_count", input.maxItemCount));
  }
  if (input.orderingConstraintRefs !== undefined) {
    configEntries.push(
      stringListEntry("ordering_constraint_refs", input.orderingConstraintRefs)
    );
  }
  if (input.phaseGateRefs !== undefined) {
    configEntries.push(stringListEntry("phase_gate_refs", input.phaseGateRefs));
  }
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: input.ref,
        config: attrs(configEntries)
      })
    })
  });
}

function scalarAttr(key, value) {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function withVectorDeclarations(basis, declarations, vectorIndex = 0) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  return Object.freeze({
    ...vector,
    declarations
  });
}

function withGraphFunctionDeclarations(basis, declarations) {
  return Object.freeze({
    ...basis.graphFunction,
    declarations
  });
}

function roleWithPolicyHooks(id, policyHooks) {
  return Object.freeze({
    id,
    name: id,
    tags: Object.freeze([]),
    policyHooks
  });
}

function backendProfile(backendKind = "generic_process") {
  return constructAgenticBackendProgressProfile({
    backendKind,
    profileRef: `backend-profile://t107/${backendKind}`,
    processProtocolSignals: ["process_started", "ack"],
    streamProgressSignals: ["stdout_chunk"],
    declaredArtifactProgressSignals: ["progress_report"],
    finalOutputMayBeBuffered: backendKind === "codex",
    progressSignalRequiredBeforeInactivityMs: 1000
  });
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function withBasisGraphVectorDeclarations(basis, declarations, vectorIndex = 0) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.ok(vector);
  const vectors = basis.graph.vectors.map((candidate, index) =>
    index === vectorIndex
      ? Object.freeze({
          ...candidate,
          declarations
        })
      : candidate
  );
  return Object.freeze({
    ...basis,
    graph: Object.freeze({
      ...basis.graph,
      vectors: Object.freeze(vectors)
    })
  });
}

function buildProfile(input = {}) {
  const basis = input.basis ?? buildThreeStageBasis();
  const vector = input.vector ?? withVectorDeclarations(basis, input.vectorAttrs ?? attrs());
  const graphFunction =
    input.graphFunction ??
    withGraphFunctionDeclarations(basis, input.graphFunctionAttrs ?? attrs());
  return deriveTraversalModulationProfileFromGtl({
    basis,
    vector,
    graphFunction,
    roles: input.roles ?? [],
    vectorIndex: input.vectorIndex ?? 0,
    backendProfile: input.backendProfile ?? backendProfile(),
    obligationScheduleRefs:
      input.obligationScheduleRefs ?? ["schedule://1", "schedule://2", "schedule://3"],
    batch: input.batch ?? {
      targetItemCount: 2,
      maxItemCount: 2
    },
    progressContract: input.progressContract ?? {
      progressArtifactRequired: true,
      allowedProgressArtifactKinds: ["progress_report"]
    },
    continuation: input.continuation ?? {
      sameEdgeUntil: "foldback_closed",
      maxAttemptsWithoutNewSignal: 1,
      maxTotalAttempts: 3
    }
  });
}

function buildEnvelope(input = {}) {
  const basis = input.basis ?? buildThreeStageBasis();
  const profile = input.profile ?? buildProfile({ ...input, basis });
  return deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: input.actorInvocationId ?? "actor://t107/1",
    retryBudgetRemaining: input.retryBudgetRemaining ?? 2,
    proposedScheduleItemRefs: input.proposedScheduleItemRefs,
    proposedSliceAdmissionEvidenceRefs: input.proposedSliceAdmissionEvidenceRefs,
    gapPressureScheduleItemRefs: input.gapPressureScheduleItemRefs,
    requiredProgressArtifactRefs: input.requiredProgressArtifactRefs
  });
}

function progressRow(envelope, scheduleItemRef, outcome, input = {}) {
  return admitTraversalAttemptProgressRow({
    envelope,
    scheduleItemRef,
    declaredOutcome: outcome,
    artifactRefs: input.artifactRefs ?? [],
    evidenceRefs: input.evidenceRefs ?? [],
    remainingWorkRefs: input.remainingWorkRefs ?? [],
    reviewRequired: input.reviewRequired ?? false,
    rowRef: input.rowRef
  });
}

test("T-107 resolves GraphVector traversal modulation qualifier before defaults", () => {
  const basis = buildThreeStageBasis();
  const vector = withVectorDeclarations(
    basis,
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/waterfall",
        label: "waterfall",
        primitives: ["single_vertical_slice"],
        phaseGateRefs: ["gate://first-slice-review"]
      })
    ])
  );
  const graphFunction = withGraphFunctionDeclarations(
    basis,
    attrs([
      hookEntry("abg.default_traversal_strategy", {
        ref: "strategy://odd_sdlc/default",
        label: "default",
        primitives: ["bounded_batch"]
      })
    ])
  );
  const role = roleWithPolicyHooks(
    "role://t107",
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://role/default",
        label: "role_default",
        primitives: ["ordered_schedule_prefix"]
      })
    ])
  );
  const resolution = resolveTraversalStrategyDirectiveFromGtl({
    vector,
    graphFunction,
    roles: [role]
  });
  const profile = buildProfile({
    basis,
    vector,
    graphFunction,
    roles: [role],
    batch: { targetItemCount: 3, maxItemCount: 3 }
  });
  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: "actor://t107/vector-wins",
    retryBudgetRemaining: 2
  });

  assert.equal(resolution.source, "graph_vector_declarations");
  assert.equal(resolution.hookRef, "strategy://odd_sdlc/waterfall");
  assert.equal(resolution.directive.strategyLabel, "waterfall");
  assert.deepEqual(resolution.directive.enforcementPrimitives, [
    "single_vertical_slice"
  ]);
  assert.deepEqual(envelope.selectedScheduleItemRefs, ["schedule://1"]);
});

test("T-107 resolves GraphFunction default before Role policy hook", () => {
  const basis = buildThreeStageBasis();
  const vector = withVectorDeclarations(basis, attrs());
  const graphFunction = withGraphFunctionDeclarations(
    basis,
    attrs([
      hookEntry("abg.default_traversal_strategy", {
        ref: "strategy://odd_sdlc/ordered-default",
        label: "graph_function_default",
        primitives: ["ordered_schedule_prefix", "bounded_batch"],
        orderingConstraintRefs: ["order://requirements"]
      })
    ])
  );
  const role = roleWithPolicyHooks(
    "role://t107",
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://role/default",
        label: "role_default",
        primitives: ["single_vertical_slice"]
      })
    ])
  );
  const resolution = resolveTraversalStrategyDirectiveFromGtl({
    vector,
    graphFunction,
    roles: [role]
  });
  const profile = buildProfile({ basis, vector, graphFunction, roles: [role] });
  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: "actor://t107/gf-default",
    retryBudgetRemaining: 2
  });

  assert.equal(resolution.source, "graph_function_declarations");
  assert.deepEqual(envelope.selectedScheduleItemRefs, [
    "schedule://1",
    "schedule://2"
  ]);
});

test("T-107 resolves Role policy hook only when edge and graph-function defaults are absent", () => {
  const basis = buildThreeStageBasis();
  const role = roleWithPolicyHooks(
    "role://t107",
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://role/gap-repair",
        label: "role_gap_repair",
        primitives: ["gap_repair_slice", "bounded_batch"]
      })
    ])
  );
  const resolution = resolveTraversalStrategyDirectiveFromGtl({
    vector: withVectorDeclarations(basis, attrs()),
    graphFunction: withGraphFunctionDeclarations(basis, attrs()),
    roles: [role]
  });

  assert.equal(resolution.source, "role_policy_hooks");
  assert.equal(resolution.directive.strategyLabel, "role_gap_repair");
});

test("T-107 GTL qualifier resolution fails closed for malformed, duplicate, or absent hooks", () => {
  const basis = buildThreeStageBasis();
  const graphFunction = withGraphFunctionDeclarations(basis, attrs());

  assert.throws(
    () =>
      resolveTraversalStrategyDirectiveFromGtl({
        vector: withVectorDeclarations(
          basis,
          attrs([scalarAttr("abg.traversal_strategy", "strategy://bad")])
        ),
        graphFunction
      }),
    /hook_ref/
  );

  assert.throws(
    () =>
      resolveTraversalStrategyDirectiveFromGtl({
        vector: withVectorDeclarations(
          basis,
          attrs([
            hookEntry("abg.traversal_strategy", {
              ref: "strategy://one",
              label: "one",
              primitives: ["bounded_batch"]
            }),
            hookEntry("abg.traversal_strategy", {
              ref: "strategy://two",
              label: "two",
              primitives: ["bounded_batch"]
            })
          ])
        ),
        graphFunction
      }),
    /Duplicate traversal modulation qualifier/
  );

  assert.throws(
    () =>
      resolveTraversalStrategyDirectiveFromGtl({
        vector: withVectorDeclarations(basis, attrs()),
        graphFunction
      }),
    /requires a GTL qualifier/
  );
});

test("T-107 strategy labels are descriptive; ABG enforces primitives and schedule refs", () => {
  const basis = buildThreeStageBasis();
  const labels = ["steel_thread", "waterfall"];
  const selections = labels.map((label) => {
    const vector = withVectorDeclarations(
      basis,
      attrs([
        hookEntry("abg.traversal_strategy", {
          ref: `strategy://odd_sdlc/${label}`,
          label,
          primitives: ["bounded_batch", "ordered_schedule_prefix"]
        })
      ])
    );
    const profile = buildProfile({
      basis,
      vector,
      graphFunction: withGraphFunctionDeclarations(basis, attrs())
    });
    return deriveTraversalAttemptEnvelope({
      basis,
      profile,
      actorInvocationId: `actor://t107/${label}`,
      retryBudgetRemaining: 2
    }).selectedScheduleItemRefs;
  });

  assert.deepEqual(selections[0], selections[1]);
  assert.deepEqual(selections[0], ["schedule://1", "schedule://2"]);
});

test("T-107 agent-proposed slices require admission evidence", () => {
  const basis = buildThreeStageBasis();
  const vector = withVectorDeclarations(
    basis,
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/agent-proposed",
        label: "agent_proposed",
        primitives: ["agent_proposed_slice_requires_admission"]
      })
    ])
  );
  const profile = buildProfile({
    basis,
    vector,
    graphFunction: withGraphFunctionDeclarations(basis, attrs())
  });

  assert.throws(
    () =>
      deriveTraversalAttemptEnvelope({
        basis,
        profile,
        actorInvocationId: "actor://t107/proposed-without-evidence",
        retryBudgetRemaining: 2,
        proposedScheduleItemRefs: ["schedule://2"]
      }),
    /admission evidence/
  );

  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: "actor://t107/proposed-with-evidence",
    retryBudgetRemaining: 2,
    proposedScheduleItemRefs: ["schedule://2"],
    proposedSliceAdmissionEvidenceRefs: ["evidence://slice-admitted"]
  });

  assert.deepEqual(envelope.selectedScheduleItemRefs, ["schedule://2"]);
});

test("T-107 assurance blocks private continuation when typed progress rows are incomplete", () => {
  const envelope = buildEnvelope({
    vectorAttrs: attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/bounded",
        label: "bounded",
        primitives: ["bounded_batch"]
      })
    ]),
    batch: { targetItemCount: 3, maxItemCount: 3 }
  });
  const projection = deriveTraversalModulationAssuranceProjection({
    envelope,
    progressRows: [
      progressRow(envelope, "schedule://1", "fulfilled", {
        evidenceRefs: ["evidence://req-1"],
        artifactRefs: ["artifact://req-1"]
      }),
      progressRow(envelope, "schedule://2", "partial", {
        evidenceRefs: ["evidence://req-2"]
      })
    ],
    untypedObservedFileRefs: ["file://generated/module.ts"],
    workerNarrativeRefs: ["report://worker-says-continue"]
  });
  const triggers = projection.forcedReviewGates.map((gate) => gate.trigger);

  assert.equal(projection.action, "forced_review");
  assert.deepEqual(triggers.sort(), [
    "missing_progress_row",
    "partial_without_remaining_work"
  ]);
  assert.deepEqual(projection.missingProgressRowRefs, ["schedule://3"]);
  assert.deepEqual(projection.ignoredInferenceRefs, [
    "file://generated/module.ts",
    "report://worker-says-continue"
  ]);
});

test("T-107 same-edge continuation requires typed remaining schedule truth", () => {
  const envelope = buildEnvelope({
    vectorAttrs: attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/bounded",
        label: "bounded",
        primitives: ["bounded_batch"]
      })
    ]),
    batch: { targetItemCount: 3, maxItemCount: 3 }
  });
  const projection = deriveTraversalModulationAssuranceProjection({
    envelope,
    progressRows: [
      progressRow(envelope, "schedule://1", "fulfilled", {
        evidenceRefs: ["evidence://req-1"],
        artifactRefs: ["artifact://req-1"]
      }),
      progressRow(envelope, "schedule://2", "partial", {
        evidenceRefs: ["evidence://req-2"],
        remainingWorkRefs: ["schedule://2"]
      }),
      progressRow(envelope, "schedule://3", "not_attempted", {
        remainingWorkRefs: ["schedule://3"]
      })
    ]
  });
  const summary = deriveTraversalModulationSummary(projection);

  assert.equal(projection.action, "continue_same_edge");
  assert.deepEqual(projection.forcedReviewGates, []);
  assert.deepEqual(projection.remainingScheduleItemRefs, [
    "schedule://2",
    "schedule://3"
  ]);
  assert.doesNotThrow(() =>
    assertTraversalModulationSummaryAgreement({ projection, summary })
  );
  assert.throws(
    () =>
      assertTraversalModulationSummaryAgreement({
        projection,
        summary: {
          ...summary,
          action: "foldback_ready"
        }
      }),
    /action drift/
  );
});

test("T-107 backend ambiguity projects forced review without semantic closure", () => {
  const envelope = buildEnvelope({
    backendProfile: backendProfile("codex"),
    vectorAttrs: attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/bounded",
        label: "bounded",
        primitives: ["bounded_batch"]
      })
    ]),
    batch: { targetItemCount: 1, maxItemCount: 1 }
  });
  const backendProgressProjection = classifyAgenticBackendProgress({
    profile: backendProfile("codex"),
    observation: {
      elapsedSinceProgressMs: 1000,
      processProtocolSignals: [],
      streamProgressSignals: [],
      declaredArtifactProgressSignals: []
    }
  });
  const projection = deriveTraversalModulationAssuranceProjection({
    envelope,
    backendProgressProjection,
    progressRows: [
      progressRow(envelope, "schedule://1", "fulfilled", {
        evidenceRefs: ["evidence://req-1"],
        artifactRefs: ["artifact://req-1"]
      })
    ]
  });

  assert.equal(backendProgressProjection.classification, "buffered_final_output_possible");
  assert.equal(projection.action, "forced_review");
  assert.deepEqual(
    projection.forcedReviewGates.map((gate) => gate.trigger),
    ["backend_progress_ambiguous"]
  );
});

test("T-107 runtime event family is replay-admitted with lineage", () => {
  const basis = buildThreeStageBasis();
  const vector = withVectorDeclarations(
    basis,
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/event-spine",
        label: "event_spine",
        primitives: ["bounded_batch"]
      })
    ])
  );
  const profile = buildProfile({
    basis,
    vector,
    graphFunction: withGraphFunctionDeclarations(basis, attrs()),
    batch: { targetItemCount: 2, maxItemCount: 2 }
  });
  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: "actor://t107/event-spine",
    retryBudgetRemaining: 1
  });
  const row = progressRow(envelope, "schedule://1", "partial", {
    evidenceRefs: ["evidence://req-1"],
    remainingWorkRefs: ["schedule://1"]
  });
  const projection = deriveTraversalModulationAssuranceProjection({
    envelope,
    progressRows: [
      row,
      progressRow(envelope, "schedule://2", "not_attempted", {
        remainingWorkRefs: ["schedule://2"]
      })
    ]
  });
  const forcedReviewProjection = deriveTraversalModulationAssuranceProjection({
    envelope,
    progressRows: []
  });
  const events = [
    constructTraversalModulationResolvedEvent({ basis, profile }),
    constructTraversalAttemptEnvelopeDerivedEvent({ basis, envelope }),
    constructTraversalAttemptDispatchedEvent({
      basis,
      envelope,
      dispatchRef: "dispatch://t107/event-spine"
    }),
    constructTraversalAttemptProgressObservedEvent({ basis, envelope, row }),
    constructTraversalAttemptNonProgressClassifiedEvent({
      basis,
      envelope,
      sourceCarrierRef: "carrier://t106/no-progress",
      actionProjectionRef: "projection://t106/retry"
    }),
    constructTraversalForcedReviewProjectedEvent({
      basis,
      envelope,
      gate: forcedReviewProjection.forcedReviewGates[0]
    }),
    constructTraversalSameEdgeContinuationPlannedEvent({
      basis,
      envelope,
      projection
    }),
    constructTraversalModulationExhaustedEvent({
      basis,
      envelope,
      reason: "retry budget exhausted",
      evidenceRefs: ["projection://t107/exhausted"]
    })
  ];

  assert.deepEqual(
    events.map((event) => event.kind),
    [
      "traversal_modulation_resolved",
      "traversal_attempt_envelope_derived",
      "traversal_attempt_dispatched",
      "traversal_attempt_progress_observed",
      "traversal_attempt_non_progress_classified",
      "traversal_forced_review_projected",
      "traversal_same_edge_continuation_planned",
      "traversal_modulation_exhausted"
    ]
  );
  for (const event of events) {
    assert.equal(event.runId, basis.runId);
    assert.equal(event.workKey, basis.workKey);
    assert.ok(event.correlationId.length > 0);
    assertRuntimeEvent(event);
  }

  const malformed = { ...events[0] };
  delete malformed.correlationId;
  assert.throws(() => assertRuntimeEvent(malformed), /correlationId/);
});

test("T-107 transport dispatch request can carry attempt envelope primitives", () => {
  const envelope = buildEnvelope({
    vectorAttrs: attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/transport",
        label: "transport",
        primitives: ["bounded_batch"],
        obligationScheduleRefs: ["schedule://1", "schedule://2"]
      })
    ]),
    batch: { targetItemCount: 2, maxItemCount: 2 }
  });
  const request = constructDispatchRequest({
    basisId: envelope.basisId,
    graphFunctionId: envelope.graphFunctionId,
    graphCallId: envelope.graphCallId,
    frameId: envelope.frameId,
    vectorIndex: envelope.vectorIndex,
    jobId: "job://t107",
    dispatchRef: "dispatch://t107/transport",
    workerId: "worker://codex",
    backendId: "backend://codex",
    resultRef: "result://t107/transport",
    expectedEdge: envelope.edge,
    expectedAssessmentIds: ["semantic_quality"],
    traversalAttemptEnvelopeRef: envelope.envelopeRef,
    selectedScheduleItemRefs: envelope.selectedScheduleItemRefs,
    orderingConstraintRefs: envelope.orderingConstraintRefs,
    phaseGateRefs: envelope.phaseGateRefs,
    requiredProgressArtifactRefs: ["artifact://progress-report"],
    gapPressureRefs: envelope.gapPressureRefs,
    affectRefs: envelope.affectRefs,
    transportContract: {
      agentKey: "codex",
      command: "codex",
      argsTemplate: ["exec"],
      sanitizedEnvironmentPolicy: { prefixes: ["CODEX_"] }
    }
  });

  assert.equal(request.traversalAttemptEnvelopeRef, envelope.envelopeRef);
  assert.deepEqual(request.selectedScheduleItemRefs, [
    "schedule://1",
    "schedule://2"
  ]);
  assert.deepEqual(request.requiredProgressArtifactRefs, [
    "artifact://progress-report"
  ]);
});

test("T-107 runner derives envelope from GTL qualifier and passes it to F_P plugin", () => {
  const basis = withBasisGraphVectorDeclarations(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t107-runner"
    }),
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/runner-steel-thread",
        label: "steel_thread",
        primitives: ["bounded_batch", "ordered_schedule_prefix"],
        obligationScheduleRefs: [
          "schedule://req-1",
          "schedule://req-2",
          "schedule://req-3"
        ],
        targetItemCount: 2,
        maxItemCount: 2,
        orderingConstraintRefs: ["order://declared-requirement-order"]
      })
    ])
  );
  const pluginInputs = [];
  const emittedEvents = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t107-runner-envelope"),
    dispatch: (input) => {
      pluginInputs.push(input);
      assert.ok(input.traversalAttemptEnvelope);
      return constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t107-runner/no-output",
        reason: "worker produced no output"
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(pluginInputs.length, 1);
  assert.deepEqual(pluginInputs[0].traversalAttemptEnvelope.selectedScheduleItemRefs, [
    "schedule://req-1",
    "schedule://req-2"
  ]);
  assert.deepEqual(
    emittedEvents
      .filter((event) => event.kind.startsWith("traversal_"))
      .map((event) => event.kind),
    [
      "traversal_modulation_resolved",
      "traversal_attempt_envelope_derived",
      "traversal_attempt_dispatched",
      "traversal_attempt_non_progress_classified"
    ]
  );
  assert.equal(result.transition.kind, "terminal");
});

test("T-107 runner leaves unqualified F_P vectors on the unqualified path", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t107-runner-unqualified"
  });
  const pluginInputs = [];
  const emittedEvents = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t107-runner-unqualified"),
    dispatch: (input) => {
      pluginInputs.push(input);
      return constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t107-runner-unqualified/no-output",
        reason: "worker produced no output"
      });
    }
  });

  runEngineIterate({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(pluginInputs.length, 1);
  assert.equal(pluginInputs[0].traversalAttemptEnvelope, null);
  assert.equal(
    emittedEvents.some((event) => event.kind.startsWith("traversal_attempt")),
    false
  );
  assert.equal(
    emittedEvents.some((event) => event.kind === "traversal_modulation_resolved"),
    false
  );
});

test("T-107 async runner derives the same qualified F_P attempt envelope as sync", async () => {
  const basis = withBasisGraphVectorDeclarations(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t107-async-runner"
    }),
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/async-runner-steel-thread",
        label: "steel_thread",
        primitives: ["bounded_batch", "ordered_schedule_prefix"],
        obligationScheduleRefs: [
          "schedule://async-req-1",
          "schedule://async-req-2",
          "schedule://async-req-3"
        ],
        targetItemCount: 2,
        maxItemCount: 2,
        orderingConstraintRefs: ["order://async-declared-requirement-order"]
      })
    ])
  );
  const pluginInputs = [];
  const emittedEvents = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t107-async-runner-envelope"),
    dispatch: async (input) => {
      pluginInputs.push(input);
      assert.ok(input.traversalAttemptEnvelope);
      return constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t107-async-runner/no-output",
        reason: "worker produced no output"
      });
    }
  });

  const result = await runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(pluginInputs.length, 1);
  assert.deepEqual(pluginInputs[0].traversalAttemptEnvelope.selectedScheduleItemRefs, [
    "schedule://async-req-1",
    "schedule://async-req-2"
  ]);
  assert.deepEqual(
    emittedEvents
      .filter((event) => event.kind.startsWith("traversal_"))
      .map((event) => event.kind),
    [
      "traversal_modulation_resolved",
      "traversal_attempt_envelope_derived",
      "traversal_attempt_dispatched",
      "traversal_attempt_non_progress_classified"
    ]
  );
  assert.equal(result.transition.kind, "terminal");
});

test("T-107 async runner exits without internally retrying blocked attached artifact", async () => {
  const basis = withBasisGraphVectorDeclarations(
    buildThreeStageBasis({
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t107-async-runner-bounded-attached"
    }),
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://odd_sdlc/async-runner-bounded-attached",
        label: "steel_thread",
        primitives: ["bounded_batch", "ordered_schedule_prefix"],
        obligationScheduleRefs: [
          "schedule://bounded-req-1",
          "schedule://bounded-req-2"
        ],
        targetItemCount: 1,
        maxItemCount: 1
      })
    ])
  );
  const pluginInputs = [];
  const emittedEvents = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t107-async-runner-bounded-attached"),
    dispatch: async (input) => {
      pluginInputs.push(input);
      assert.equal(input.traversalAttemptEnvelope.mustExitAfterBoundedAttempt, true);
      return constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t107-async-runner-bounded-attached/runtime-failure",
        reason: "worker process failed after transport retries",
        attachedResultArtifact: {
          kind: "runtime_failure",
          failureClass: "runtime_failure",
          detail: "api_retry_count=10"
        }
      });
    }
  });

  const result = await runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 3
  });

  assert.equal(pluginInputs.length, 1);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason ?? "", /runtime_failure/u);
  assert.match(result.transition.reason ?? "", /api_retry_count=10/u);
  assert.equal(
    emittedEvents.some((event) => event.kind === "retry_repair_planned"),
    false
  );
});

test("T-107 async runner leaves unqualified F_P vectors on the unqualified path", async () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t107-async-runner-unqualified"
  });
  const pluginInputs = [];
  const emittedEvents = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t107-async-runner-unqualified"),
    dispatch: async (input) => {
      pluginInputs.push(input);
      return constructFpDispatchOutcome({
        status: "blocked",
        resultRef: "result://t107-async-runner-unqualified/no-output",
        reason: "worker produced no output"
      });
    }
  });

  await runEngineIterateAsync({
    basis,
    eventSink: (event) => {
      emittedEvents.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(pluginInputs.length, 1);
  assert.equal(pluginInputs[0].traversalAttemptEnvelope, null);
  assert.equal(
    emittedEvents.some((event) => event.kind.startsWith("traversal_attempt")),
    false
  );
  assert.equal(
    emittedEvents.some((event) => event.kind === "traversal_modulation_resolved"),
    false
  );
});
