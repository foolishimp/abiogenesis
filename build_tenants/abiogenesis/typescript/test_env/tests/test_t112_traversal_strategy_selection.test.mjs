// Validates: T-112
// Validates: REQ-L-GTL3-GRAPHVECTOR-010
// Validates: REQ-R-ABG3-EVENTS-020
// Validates: REQ-R-ABG3-PROJECTION-012

import test from "node:test";
import assert from "node:assert/strict";

import * as m03 from "../../build/semantic/code/src/abg/m03/index.js";
import {
  TRAVERSAL_STRATEGY_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS,
  TRAVERSAL_STRATEGY_ROLE_ATTR_KEYS,
  TRAVERSAL_STRATEGY_VECTOR_ATTR_KEYS,
  admitStartIntent,
  constructAgenticBackendProgressProfile,
  constructEnginePluginContract,
  constructEnginePluginInput,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  deriveRuntimeAggregateProjection,
  deriveTraversalAttemptEnvelope,
  deriveTraversalModulationProfile,
  deriveTraversalStrategySelectionFromGtl,
  resolveTraversalStrategyDirectiveFromGtl,
  tryDeriveTraversalStrategySelectionFromRuntimeStart
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
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: input.ref,
        config: attrs([
          scalarEntry("strategy_owner_ref", input.ownerRef ?? "product://odd_sdlc"),
          scalarEntry("strategy_label", input.label),
          stringListEntry("enforcement_primitives", input.primitives),
          ...(input.directiveRef === undefined
            ? []
            : [scalarEntry("directive_ref", input.directiveRef)]),
          ...(input.obligationScheduleRefs === undefined
            ? []
            : [
                stringListEntry(
                  "obligation_schedule_refs",
                  input.obligationScheduleRefs
                )
              ])
        ])
      })
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

function backendProfile() {
  return constructAgenticBackendProgressProfile({
    backendKind: "generic_process",
    profileRef: "backend-profile://t112",
    processProtocolSignals: ["process_started"],
    streamProgressSignals: ["stdout_chunk"],
    declaredArtifactProgressSignals: ["progress_report"],
    finalOutputMayBeBuffered: false,
    progressSignalRequiredBeforeInactivityMs: 1000
  });
}

function directiveFromSelection(selection) {
  return Object.freeze({
    kind: "traversal_strategy_directive",
    directiveRef: selection.directiveRef,
    strategyOwnerRef: selection.strategyOwnerRef,
    strategyLabel: selection.strategyLabel,
    enforcementPrimitives: selection.enforcementPrimitives,
    obligationScheduleRefs: selection.obligationScheduleRefs,
    orderingConstraintRefs: selection.orderingConstraintRefs,
    phaseGateRefs: selection.phaseGateRefs,
    batch: selection.batch,
    continuation: selection.continuation
  });
}

function pluginContract() {
  return constructEnginePluginContract({
    ref: "plugin://t112/fp",
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

test("T-112 exposes one canonical GTL traversal strategy surface", () => {
  assert.deepEqual(TRAVERSAL_STRATEGY_VECTOR_ATTR_KEYS, ["abg.traversal_strategy"]);
  assert.deepEqual(TRAVERSAL_STRATEGY_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS, [
    "abg.default_traversal_strategy"
  ]);
  assert.deepEqual(TRAVERSAL_STRATEGY_ROLE_ATTR_KEYS, ["abg.traversal_strategy"]);
  assert.equal("TRAVERSAL_MODULATION_VECTOR_ATTR_KEYS" in m03, false);
  assert.equal(
    "TRAVERSAL_MODULATION_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS" in m03,
    false
  );
  assert.equal("TRAVERSAL_MODULATION_ROLE_ATTR_KEYS" in m03, false);
});

test("T-112 derives a replay-visible strategy selection with GTL precedence", () => {
  const basis = buildThreeStageBasis();
  const vector = withVectorDeclarations(
    basis,
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://vector",
        directiveRef: "directive://vector",
        label: "steel_thread",
        primitives: ["single_vertical_slice"],
        obligationScheduleRefs: ["schedule://edge/1"]
      })
    ])
  );
  const graphFunction = withGraphFunctionDeclarations(
    basis,
    attrs([
      hookEntry("abg.default_traversal_strategy", {
        ref: "strategy://graph/default",
        directiveRef: "directive://graph",
        label: "full_breadth",
        primitives: ["bounded_batch"],
        obligationScheduleRefs: ["schedule://graph/1"]
      })
    ])
  );
  const roles = [
    roleWithPolicyHooks(
      "role://default",
      attrs([
        hookEntry("abg.traversal_strategy", {
          ref: "strategy://role",
          directiveRef: "directive://role",
          label: "role_default",
          primitives: ["atomic_attempt"],
          obligationScheduleRefs: ["schedule://role/1"]
        })
      ])
    )
  ];

  const selection = deriveTraversalStrategySelectionFromGtl({
    basis,
    vectorIndex: 0,
    vector,
    graphFunction,
    roles
  });

  assert.equal(selection.kind, "traversal_strategy_selection");
  assert.equal(selection.source, "graph_vector");
  assert.equal(selection.attrKey, "abg.traversal_strategy");
  assert.equal(selection.hookRef, "strategy://vector");
  assert.equal(selection.directiveRef, "directive://vector");
  assert.equal(selection.strategyLabel, "steel_thread");
  assert.equal(selection.enforcementPrimitives[0], "single_vertical_slice");
  assert.match(selection.configDigest, /^sha256:/);
});

test("T-112 does not accept the old traversal modulation declaration key", () => {
  const basis = buildThreeStageBasis();
  assert.throws(
    () =>
      resolveTraversalStrategyDirectiveFromGtl({
        vector: withVectorDeclarations(
          basis,
          attrs([
            hookEntry("abg.traversal_modulation", {
              ref: "strategy://old-key",
              label: "old_key",
              primitives: ["bounded_batch"],
              obligationScheduleRefs: ["schedule://old/1"]
            })
          ])
        ),
        graphFunction: basis.graphFunction
      }),
    /requires a GTL qualifier/
  );
});

test("T-112 carries selected strategy to profile, envelope, and plugin input", () => {
  const basis = buildThreeStageBasis();
  const vector = withVectorDeclarations(
    basis,
    attrs([
      hookEntry("abg.traversal_strategy", {
        ref: "strategy://edge",
        directiveRef: "directive://edge",
        label: "full_breadth",
        primitives: ["bounded_batch"],
        obligationScheduleRefs: ["schedule://1", "schedule://2"]
      })
    ])
  );
  const selection = deriveTraversalStrategySelectionFromGtl({
    basis,
    vectorIndex: 0,
    vector,
    graphFunction: basis.graphFunction
  });
  const profile = deriveTraversalModulationProfile({
    basis,
    vectorIndex: 0,
    directive: directiveFromSelection(selection),
    strategySelection: selection,
    backendProfile: backendProfile()
  });
  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: "actor://t112/1",
    retryBudgetRemaining: 1
  });
  const projection = deriveRuntimeAggregateProjection(basis, [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis)
  ]);
  const pluginInput = constructEnginePluginInput({
    contract: pluginContract(),
    basis,
    projection,
    vectorIndex: 0,
    edge: basis.graph.vectors[0].name,
    regime: "F_P",
    traversalStrategySelection: selection,
    traversalAttemptEnvelope: envelope
  });

  assert.equal(profile.strategySelectionRef, selection.selectionRef);
  assert.equal(envelope.strategySelectionRef, selection.selectionRef);
  assert.equal(pluginInput.traversalStrategySelection.selectionRef, selection.selectionRef);
  assert.equal(
    pluginInput.traversalAttemptEnvelope.strategyConfigDigest,
    selection.configDigest
  );
});

test("T-112 admits runtime start traversal selection as run-scoped strategy truth", () => {
  const basis = buildThreeStageBasis();
  const runtimeStartIntent = admitStartIntent({
    ...basis.startIntent,
    runtimeTraversalSelections: [
      {
        kind: "start_runtime_traversal_strategy_selection",
        selectionRef: "runtime-traversal-selection://t112/req-04",
        strategyOwnerRef: "product://odd-sdlc",
        strategyLabel: "steel_thread",
        enforcementPrimitives: ["bounded_batch", "ordered_schedule_prefix"],
        selectedScheduleItemRefs: [
          "requirement://odd-sdlc/req-04",
          "requirement://odd-sdlc/req-04/dep-a"
        ],
        vectorIndexes: [0],
        batch: {
          targetItemCount: 2,
          maxItemCount: 2
        },
        basisRefs: ["dependency-map://odd-sdlc/requirements/req-04"]
      }
    ]
  });
  const runtimeBasis = Object.freeze({
    ...basis,
    startIntent: runtimeStartIntent
  });

  const selection = tryDeriveTraversalStrategySelectionFromRuntimeStart({
    basis: runtimeBasis,
    vectorIndex: 0
  });

  assert.ok(selection);
  assert.equal(selection.source, "runtime_start");
  assert.equal(
    selection.selectionRef,
    "runtime-traversal-selection://t112/req-04"
  );
  assert.deepEqual(selection.obligationScheduleRefs, [
    "requirement://odd-sdlc/req-04",
    "requirement://odd-sdlc/req-04/dep-a"
  ]);
});

test("T-112 carries labels without making ABG branch on downstream label meaning", () => {
  const basis = buildThreeStageBasis();
  const makeEnvelope = (label) => {
    const selection = deriveTraversalStrategySelectionFromGtl({
      basis,
      vectorIndex: 0,
      vector: withVectorDeclarations(
        basis,
        attrs([
          hookEntry("abg.traversal_strategy", {
            ref: `strategy://${label}`,
            label,
            primitives: ["bounded_batch"],
            obligationScheduleRefs: ["schedule://1", "schedule://2"]
          })
        ])
      ),
      graphFunction: basis.graphFunction
    });
    const profile = deriveTraversalModulationProfile({
      basis,
      vectorIndex: 0,
      directive: directiveFromSelection(selection),
      strategySelection: selection,
      backendProfile: backendProfile()
    });
    return deriveTraversalAttemptEnvelope({
      basis,
      profile,
      actorInvocationId: `actor://t112/${label}`,
      retryBudgetRemaining: 1
    });
  };

  assert.deepEqual(
    makeEnvelope("steel_thread").selectedScheduleItemRefs,
    makeEnvelope("full_breadth").selectedScheduleItemRefs
  );
});
