// Validates: T-119
// Validates: T-124
// Validates: T-125
// Validates: REQ-L-GTL3-GRAPHVECTOR-011
// Validates: REQ-R-ABG3-EVENTS-019
// Validates: REQ-R-ABG3-PROJECTION-014
//
// Duplicates the existing live-lane shape: build a real published GTL
// graph-function basis, emit ABG runtime events, archive replay evidence, and
// derive live truth from admitted events.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitExecutionBasis,
  admitModule,
  admitNode,
  admitResolvedPolicyIdentity,
  admitResolvedRuntimeIdentity,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructTimerIntent,
  constructTimerIntentAdmittedEvent,
  constructTimerOutcome,
  constructTimerOutcomeAdmittedEvent,
  deriveRuntimeAggregateProjection,
  deriveTemporalConstraintFromGtl,
  deriveTemporalProjection,
  edge,
  emit,
  graphFunctionForVector,
  temporalProjectionHoldsEligibility,
  tryDeriveTemporalConstraintFromGtl
} from "../../build/semantic/code/src/index.js";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t125_temporal_and_non_temporal_gtl_live"
);

function timestampId() {
  return new Date().toISOString().replaceAll(/[-:.]/gu, "");
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

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

function temporalHookEntry(namespace) {
  return Object.freeze({
    key: "abg.temporal_constraint",
    value: Object.freeze({
      kind: "hook_ref",
      value: Object.freeze({
        ref: `temporal-constraint://t125/live/${namespace}/not-before-edge0`,
        config: attrs([
          scalarEntry(
            "constraint_ref",
            `temporal-constraint://t125/live/${namespace}/not-before-edge0`
          ),
          scalarEntry("operator", "not_before"),
          scalarEntry("not_before_ref", "instant://2026-05-07T00:00:00Z"),
          scalarEntry(
            "schedule_policy_ref",
            `schedule-policy://t125/live/${namespace}/not-before`
          ),
          scalarEntry(
            "timer_provider_ref",
            `timer-provider://t125/live/${namespace}/stub`
          ),
          scalarEntry("deadline_breach_action", "observe_drift")
        ])
      })
    })
  });
}

function node(id, name, kind, markov) {
  return admitNode({
    id,
    name,
    schema: { kind: "symbolic", ref: `T125Live.${kind}` },
    markov: [markov],
    assetSurface: {
      kind,
      requiredContexts: ["workspace"],
      standardsRefs: [`t125:${kind}:standard`],
      outputContractRefs: [`t125:${kind}:contract`]
    },
    tags: ["t125", "live", kind]
  });
}

function buildLiveGtlBasis(input) {
  const source = node(
    `node:t125/${input.name}/source`,
    `${input.name}_source`,
    "source",
    "declared"
  );
  const target = node(
    `node:t125/${input.name}/target`,
    `${input.name}_target`,
    "target",
    "eligible"
  );
  const graph = edge([source], target, {
    id: `vector:t125/${input.name}/source-to-target`,
    name: `${input.name}_source_to_target`,
    evaluators: [
      {
        name: `${input.name}_target_ready`,
        regime: "F_P",
        description: "target accepted",
        binding: `binding://t125/live/${input.name}`,
        tags: ["t125", "live"]
      }
    ],
    declarations: input.declarations,
    tags: ["t125", "live", input.name]
  });
  const vector = graph.vectors[0];
  assert.notEqual(vector, undefined);
  const graphFunction = graphFunctionForVector(vector, {
    name: `${input.name}_graph_function`,
    declarations: attrs(),
    tags: ["t125", "live", input.name]
  });
  const module = admitModule({
    name: `${input.name}_module`,
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      {
        id: `job:t125/live/${input.name}`,
        name: `${input.name}_job`,
        contracts: [{ kind: "graph_function", targetId: graphFunction.id }],
        roles: [],
        tags: ["t125", "live", input.name]
      }
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    metadata: attrs()
  });
  const basis = admitExecutionBasis({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: `/workspace/t125/${input.name}`,
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
      workerId: `worker://t125/live/${input.name}`,
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    }),
    resolvedPolicy: admitResolvedPolicyIdentity({
      resolvedPolicyBundleRef: `policy://t125/live/${input.name}`,
      defaultRegime: "F_P",
      dispatchRef: `dispatch://t125/live/${input.name}`,
      approvalSubjectRef: null
    }),
    runId: `run://t125/live/${input.name}/${input.runToken}`,
    workKey: `wk://t125/live/${input.name}`,
    frameId: null,
    frameLineageId: null
  });
  const publishedVector = basis.graph.vectors[0];
  assert.notEqual(publishedVector, undefined);
  return Object.freeze({ basis, vector: publishedVector });
}

test("T-125 live temporal GTL graph function admits eligibility only after ABG timer outcome", async () => {
  const runToken = timestampId();
  const archiveRoot = path.join(TEST_RUNS_ROOT, runToken, "temporal");
  const { basis, vector } = buildLiveGtlBasis({
    name: "temporal",
    runToken,
    declarations: attrs([temporalHookEntry("temporal")])
  });
  const resolution = deriveTemporalConstraintFromGtl({
    basis,
    vectorIndex: 0,
    vector
  });
  const timerIntent = constructTimerIntent({
    basis,
    constraint: resolution.constraint,
    policy: resolution.policy
  });
  const providerOutcome = constructTimerOutcome({
    timerIntent,
    outcome: "timer_fired",
    providerReceiptRef: "provider-receipt://t125/live/temporal/fired"
  });
  await writeJson(path.join(archiveRoot, "provider_receipt.json"), {
    providerRef: providerOutcome.providerRef,
    providerReceiptRef: providerOutcome.providerReceiptRef,
    outcome: providerOutcome.outcome,
    note: "provider payload is archived evidence only; ABG event admission owns temporal truth"
  });

  const emittedEvents = [];
  emit(
    [
      constructGraphCallOpenedEvent(basis),
      constructFrameOpenedEvent(basis),
      constructTimerIntentAdmittedEvent({ basis, timerIntent })
    ],
    (event) => emittedEvents.push(event)
  );
  const temporalBefore = deriveTemporalProjection({
    basis,
    events: emittedEvents
  });
  const aggregateBefore = deriveRuntimeAggregateProjection(basis, emittedEvents);
  await writeJson(path.join(archiveRoot, "projection_before_admission.json"), {
    emittedEventKinds: emittedEvents.map((event) => event.kind),
    temporalBefore,
    aggregateBefore
  });
  assert.deepEqual(temporalBefore.eligibleVectorIndexes, []);
  assert.deepEqual(temporalBefore.pendingTimerIntentRefs, [
    timerIntent.timerIntentRef
  ]);
  assert.deepEqual(aggregateBefore.closedVectorIndexes, []);
  assert.equal(aggregateBefore.nextVectorIndex, 0);

  emit(
    constructTimerOutcomeAdmittedEvent({
      basis,
      timerIntent,
      timerOutcome: providerOutcome
    }),
    (event) => emittedEvents.push(event)
  );
  const temporalAfter = deriveTemporalProjection({
    basis,
    events: emittedEvents
  });
  const aggregateAfter = deriveRuntimeAggregateProjection(basis, emittedEvents);
  await writeJson(path.join(archiveRoot, "projection_after_admission.json"), {
    emittedEventKinds: emittedEvents.map((event) => event.kind),
    temporalAfter,
    aggregateAfter
  });

  assert.equal(resolution.attrKey, "abg.temporal_constraint");
  assert.equal(resolution.source, "graph_vector");
  assert.deepEqual(temporalAfter.pendingTimerIntentRefs, []);
  assert.deepEqual(temporalAfter.eligibleVectorIndexes, [0]);
  assert.equal(
    temporalProjectionHoldsEligibility({
      projection: temporalAfter,
      basis,
      vectorIndex: 0,
      constraintRef: resolution.constraint.constraintRef,
      timerIntentRef: timerIntent.timerIntentRef,
      schedulePolicyRef: resolution.policy.schedulePolicyRef
    }),
    true
  );
  assert.deepEqual(aggregateAfter.closedVectorIndexes, []);
  assert.equal(aggregateAfter.nextVectorIndex, 0);
});

test("T-125 live non-temporal GTL graph function remains admissible without temporal syntax", async () => {
  const runToken = timestampId();
  const archiveRoot = path.join(TEST_RUNS_ROOT, runToken, "non_temporal");
  const { basis, vector } = buildLiveGtlBasis({
    name: "non_temporal",
    runToken,
    declarations: attrs()
  });
  const emittedEvents = [];
  emit(
    [
      constructGraphCallOpenedEvent(basis),
      constructFrameOpenedEvent(basis)
    ],
    (event) => emittedEvents.push(event)
  );
  const temporalProjection = deriveTemporalProjection({
    basis,
    events: emittedEvents
  });
  const aggregateProjection = deriveRuntimeAggregateProjection(
    basis,
    emittedEvents
  );
  await writeJson(path.join(archiveRoot, "projection.json"), {
    emittedEventKinds: emittedEvents.map((event) => event.kind),
    temporalProjection,
    aggregateProjection
  });

  assert.equal(
    tryDeriveTemporalConstraintFromGtl({ basis, vectorIndex: 0, vector }),
    null
  );
  assert.deepEqual(temporalProjection.eligibleVectorIndexes, []);
  assert.deepEqual(temporalProjection.pendingTimerIntentRefs, []);
  assert.notEqual(aggregateProjection.graphCallId, null);
  assert.notEqual(aggregateProjection.frameId, null);
  assert.deepEqual(aggregateProjection.closedVectorIndexes, []);
  assert.equal(aggregateProjection.nextVectorIndex, 0);
});
