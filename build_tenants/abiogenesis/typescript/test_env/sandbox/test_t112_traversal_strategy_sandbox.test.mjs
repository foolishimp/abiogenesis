// Validates: T-112
// Validates: T-124
// Validates: REQ-L-GTL3-GRAPHVECTOR-010
// Validates: REQ-R-ABG3-EVENTS-020
// Validates: REQ-R-ABG3-PROJECTION-012

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  admitModule,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  admitStartIntent
} from "../../build/semantic/code/src/index.js";
import {
  constructAgenticBackendProgressProfile,
  deriveTraversalAttemptEnvelope,
  deriveTraversalModulationProfileFromGtl,
  resolveTraversalStrategyDirectiveFromGtl
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  EDGE_DEFS,
  buildMiniDmReduxModule
} from "./mini_dm_redux/module.mjs";

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
    scalarEntry("strategy_owner_ref", input.ownerRef ?? "product://data-mapper"),
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

function roleWithPolicyHooks(id, policyHooks) {
  return Object.freeze({
    id,
    name: id,
    tags: Object.freeze([]),
    policyHooks
  });
}

function withDeclarations(carrier, declarations) {
  return Object.freeze({
    ...carrier,
    declarations
  });
}

function edgeDefByName(name) {
  const edgeDef = EDGE_DEFS.find((entry) => entry.name === name);
  assert.notEqual(edgeDef, undefined, `unknown mini data-mapper edge ${name}`);
  return edgeDef;
}

function scheduleRefsFor(edgeDef) {
  return edgeDef.obligationIds.map(
    (obligationId) => `schedule://t112-mini-dm/${edgeDef.name}/${obligationId}`
  );
}

function moduleForEdge(edgeDef, graphFunction) {
  return admitModule({
    name: `t112_mini_dm_${edgeDef.name}_module`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: `job:t112-mini-dm/${edgeDef.name}`,
        name: `t112_mini_dm_${edgeDef.name}_job`,
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t112", "mini-dm-redux", "traversal-strategy-sandbox"]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: { entries: [] }
  });
}

function basisForEdge(edgeDef) {
  const built = buildMiniDmReduxModule();
  const graphFunction = built.perEdgeGraphFunctions[edgeDef.name];
  assert.notEqual(graphFunction, undefined);
  const module = moduleForEdge(edgeDef, graphFunction);
  return admitExecutionBasis({
    startIntent: admitStartIntent({
      scope: {
        kind: "workspace",
        workspaceRoot: `/workspace/t112-mini-dm/${edgeDef.name}`,
        moduleName: module.name
      },
      target: {
        kind: "graph_function",
        handle: graphFunction.name
      },
      until: "converged"
    }),
    module,
    runtimeIdentity: admitResolvedRuntimeIdentity({
      workerId: "worker://t112-mini-dm/sandbox",
      backendId: "backend://t112-mini-dm/sandbox",
      buildId: "build://abiogenesis/typescript/t112",
      resolvedRuntimeRef: "runtime://abiogenesis/typescript/t112-sandbox"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://t112-mini-dm/sandbox",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t112-mini-dm/sandbox",
      approvalSubjectRef: null
    }),
    runId: `run://t112-mini-dm/${edgeDef.name}`,
    workKey: `wk://t112-mini-dm/${edgeDef.name}`,
    frameId: null,
    frameLineageId: null
  });
}

function schemeFor(edgeName) {
  const edgeDef = edgeDefByName(edgeName);
  const scheduleRefs = scheduleRefsFor(edgeDef);
  if (edgeName === "derive_field_spec") {
    return Object.freeze({
      qualifierSource: "graph_vector_declarations",
      selectedScheduleItemRefs: [scheduleRefs[0]],
      vectorDeclarations: attrs([
        hookEntry("abg.traversal_strategy", {
          ref: "strategy://data-mapper/single-field-steel-thread",
          label: "single_field_steel_thread",
          primitives: ["single_vertical_slice"],
          obligationScheduleRefs: scheduleRefs,
          phaseGateRefs: ["gate://data-mapper/field-spec-first-slice-review"]
        })
      ]),
      graphFunctionDeclarations: attrs([
        hookEntry("abg.default_traversal_strategy", {
          ref: "strategy://data-mapper/default-batch",
          label: "default_batch",
          primitives: ["bounded_batch"],
          obligationScheduleRefs: scheduleRefs,
          targetItemCount: 2,
          maxItemCount: 2
        })
      ]),
      roles: Object.freeze([]),
      batch: { targetItemCount: 3, maxItemCount: 3 }
    });
  }
  if (edgeName === "derive_implementation") {
    return Object.freeze({
      qualifierSource: "graph_function_declarations",
      selectedScheduleItemRefs: [scheduleRefs[0], scheduleRefs[1]],
      vectorDeclarations: attrs(),
      graphFunctionDeclarations: attrs([
        hookEntry("abg.default_traversal_strategy", {
          ref: "strategy://data-mapper/implementation-bounded-batch",
          label: "implementation_bounded_batch",
          primitives: ["bounded_batch", "ordered_schedule_prefix"],
          obligationScheduleRefs: scheduleRefs,
          targetItemCount: 2,
          maxItemCount: 2,
          orderingConstraintRefs: ["order://data-mapper/field-obligation-order"]
        })
      ]),
      roles: Object.freeze([]),
      batch: { targetItemCount: 2, maxItemCount: 2 }
    });
  }
  return Object.freeze({
    qualifierSource: "role_policy_hooks",
    selectedScheduleItemRefs: [scheduleRefs[scheduleRefs.length - 1]],
    vectorDeclarations: attrs(),
    graphFunctionDeclarations: attrs(),
    roles: Object.freeze([
      roleWithPolicyHooks(
        "role://data-mapper/validation-reviewer",
        attrs([
          hookEntry("abg.traversal_strategy", {
            ref: "strategy://data-mapper/agent-proposed-validation-slice",
            label: "agent_proposed_validation_slice",
            primitives: ["agent_proposed_slice_requires_admission"],
            obligationScheduleRefs: scheduleRefs
          })
        ])
      )
    ]),
    proposedScheduleItemRefs: [scheduleRefs[scheduleRefs.length - 1]],
    proposedSliceAdmissionEvidenceRefs: [
      "evidence://data-mapper/validation-slice-admitted"
    ],
    batch: { targetItemCount: 1, maxItemCount: 1 }
  });
}

function backendProfile() {
  return constructAgenticBackendProgressProfile({
    backendKind: "generic_process",
    profileRef: "backend-profile://t112-mini-dm/sandbox",
    processProtocolSignals: ["process_started", "ack"],
    streamProgressSignals: ["stdout_chunk"],
    declaredArtifactProgressSignals: ["progress_report"],
    finalOutputMayBeBuffered: false,
    progressSignalRequiredBeforeInactivityMs: 1000
  });
}

function deriveCarrierSet(edgeName) {
  const edgeDef = edgeDefByName(edgeName);
  const basis = basisForEdge(edgeDef);
  const scheme = schemeFor(edgeName);
  const vector = withDeclarations(basis.graph.vectors[0], scheme.vectorDeclarations);
  const graphFunction = withDeclarations(
    basis.graphFunction,
    scheme.graphFunctionDeclarations
  );
  const resolution = resolveTraversalStrategyDirectiveFromGtl({
    vector,
    graphFunction,
    roles: scheme.roles
  });
  const profile = deriveTraversalModulationProfileFromGtl({
    basis,
    vector,
    graphFunction,
    roles: scheme.roles,
    vectorIndex: 0,
    backendProfile: backendProfile(),
    obligationScheduleRefs: scheduleRefsFor(edgeDef),
    batch: scheme.batch
  });
  const envelope = deriveTraversalAttemptEnvelope({
    basis,
    profile,
    actorInvocationId: `actor://t112-mini-dm/${edgeName}/sandbox`,
    retryBudgetRemaining: 2,
    proposedScheduleItemRefs: scheme.proposedScheduleItemRefs,
    proposedSliceAdmissionEvidenceRefs: scheme.proposedSliceAdmissionEvidenceRefs
  });
  return { edgeName, scheme, resolution, profile, envelope };
}

test("T-112 sandbox: mini data-mapper edge schemes use the canonical traversal strategy syntax", () => {
  for (const edgeName of [
    "derive_field_spec",
    "derive_implementation",
    "derive_validation"
  ]) {
    const carriers = deriveCarrierSet(edgeName);
    assert.equal(carriers.resolution.source, carriers.scheme.qualifierSource);
    assert.deepEqual(
      carriers.envelope.selectedScheduleItemRefs,
      carriers.scheme.selectedScheduleItemRefs
    );
    assert.equal(
      carriers.profile.strategySelectionRef,
      carriers.envelope.strategySelectionRef
    );
    assert.match(carriers.profile.strategyConfigDigest, /^sha256:/);
  }
});
