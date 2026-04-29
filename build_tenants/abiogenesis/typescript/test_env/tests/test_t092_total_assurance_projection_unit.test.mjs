// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Validates: T-091
// Validates: T-092-TS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitAssuranceProviderOutput,
  admitEnginePluginContract,
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceReportReadModel,
  deriveAssuranceScopeRef,
  deriveRuntimeAggregateProjection,
  enginePluginInventory
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function baseScope() {
  const basis = buildThreeStageBasis();
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex: 0
  });
  return { basis, runtimeProjection, scope };
}

function snapshot(scope, input = {}) {
  return constructAssuranceAuthoritySnapshot({
    scope,
    authorityRefs: input.authorityRefs ?? ["req://assurance/a"],
    inputRefs: input.inputRefs ?? ["input://current"],
    authorityDigest: input.authorityDigest ?? "authority-digest-current",
    inputDigest: input.inputDigest ?? "input-digest-current",
    closureCapable: input.closureCapable,
    contradictoryAuthority: input.contradictoryAuthority,
    deferredAuthorityRefs: input.deferredAuthorityRefs,
    providerRefs: ["provider://authority"],
    policyRefs: ["policy://assurance"]
  });
}

function evidence(scope, input = {}) {
  return constructAssuranceEvidenceRow({
    scope,
    evidenceRef: input.evidenceRef ?? "evidence://current",
    authorityRef:
      Object.hasOwn(input, "authorityRef") ? input.authorityRef : "req://assurance/a",
    authorityDigest: input.authorityDigest ?? "authority-digest-current",
    inputDigest: input.inputDigest ?? "input-digest-current",
    eventRefs: input.eventRefs ?? ["event://evidence"],
    providerRefs: ["provider://evidence"],
    policyRefs: ["policy://assurance"],
    boundToScope: input.boundToScope,
    complete: input.complete,
    shallow: input.shallow,
    contradictsAuthority: input.contradictsAuthority,
    deferred: input.deferred
  });
}

function derive(input) {
  const projection = deriveAssuranceProjection(input);
  return {
    projection,
    decision: deriveAssuranceClosureDecision(projection),
    statuses: new Set(projection.ambiguityRows.map((row) => row.status))
  };
}

const rowMatrix = [
  {
    name: "fulfilled",
    expectedStatus: "fulfilled",
    expectedDecision: "close",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: [evidence(base.scope)]
      };
    }
  },
  {
    name: "partial",
    expectedStatus: "partial",
    expectedDecision: "retry",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: [evidence(base.scope, { shallow: true })]
      };
    }
  },
  {
    name: "missing",
    expectedStatus: "missing",
    expectedDecision: "retry",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: []
      };
    }
  },
  {
    name: "stale_input",
    expectedStatus: "stale_input",
    expectedDecision: "retry",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: [evidence(base.scope)],
        priorClosureSnapshot: {
          authorityDigest: "authority-digest-old",
          inputDigest: "input-digest-current",
          projectionRef: "assurance_projection://old"
        }
      };
    }
  },
  {
    name: "authority_missing",
    expectedStatus: "authority_missing",
    expectedDecision: "reprice",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope, { authorityRefs: [] }),
        evidenceRows: []
      };
    }
  },
  {
    name: "orphan_evidence",
    expectedStatus: "orphan_evidence",
    expectedDecision: "block",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: [evidence(base.scope, { authorityRef: null })]
      };
    }
  },
  {
    name: "contradictory_authority",
    expectedStatus: "contradictory_authority",
    expectedDecision: "reprice",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope, {
          contradictoryAuthority: true
        }),
        evidenceRows: []
      };
    }
  },
  {
    name: "contradictory_evidence",
    expectedStatus: "contradictory_evidence",
    expectedDecision: "block",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: [
          evidence(base.scope, { contradictsAuthority: true })
        ]
      };
    }
  },
  {
    name: "deferred",
    expectedStatus: "deferred",
    expectedDecision: "qualified_defer",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope, {
          deferredAuthorityRefs: ["req://assurance/a"]
        }),
        evidenceRows: []
      };
    }
  },
  {
    name: "event_ledger_invalid",
    expectedStatus: "event_ledger_invalid",
    expectedDecision: "block",
    build: () => {
      const base = baseScope();
      return {
        ...base,
        authoritySnapshot: snapshot(base.scope),
        evidenceRows: [],
        eventLedgerValid: false
      };
    }
  }
];

for (const rowCase of rowMatrix) {
  test(`T-092-TS assurance projection emits ${rowCase.name}`, () => {
    const result = derive(rowCase.build());

    assert.equal(result.statuses.has(rowCase.expectedStatus), true);
    assert.equal(result.decision.decision, rowCase.expectedDecision);
    assert.notEqual(result.projection.projectionRef.length, 0);
  });
}

test("T-092-TS assurance projection: stale input beats fulfilled evidence", () => {
  const base = baseScope();
  const result = derive({
    ...base,
    authoritySnapshot: snapshot(base.scope),
    evidenceRows: [evidence(base.scope)],
    priorClosureSnapshot: {
      authorityDigest: "authority-digest-old",
      inputDigest: "input-digest-old",
      projectionRef: "assurance_projection://old"
    }
  });

  assert.equal(result.statuses.has("fulfilled"), true);
  assert.equal(result.statuses.has("stale_input"), true);
  assert.equal(result.decision.decision, "retry");
  assert.notEqual(result.decision.decision, "close");
});

test("T-092-TS assurance providers cannot smuggle engine authority", () => {
  const assuranceKinds = enginePluginInventory()
    .filter((entry) => entry.runtimeBindingStatus === "assurance_consumed")
    .map((entry) => entry.contract.pluginKind)
    .sort();

  assert.deepStrictEqual(assuranceKinds, [
    "assurance_ambiguity_classifier",
    "assurance_authority_snapshot_provider",
    "assurance_closure_policy_provider",
    "assurance_evidence_adapter",
    "assurance_gain_function_adapter"
  ]);

  assert.throws(
    () =>
      admitAssuranceProviderOutput({
        providerRef: "provider://bad",
        runtimeEvents: []
      }),
    /engine authority/i
  );
  assert.throws(
    () =>
      admitAssuranceProviderOutput({
        providerRef: "provider://bad",
        nextVectorIndex: 1
      }),
    /engine authority/i
  );
  assert.throws(
    () =>
      admitAssuranceProviderOutput({
        providerRef: "provider://bad",
        closureDecision: "close"
      }),
    /engine authority/i
  );
  assert.throws(
    () =>
      admitEnginePluginContract({
        kind: "engine_plugin_contract",
        ref: "plugin://bad/assurance",
        pluginKind: "assurance_evidence_adapter",
        authority: "provider",
        inputCarrier: "TraversalEnvelopeView",
        outputCarrier: "AssuranceEvidenceRow",
        mayCloseTraversal: true
      }),
    /engine authority/i
  );
});

test("T-092-TS superseded closure paths are evidence only", () => {
  const oldPaths = [
    {
      label: "worker exit zero",
      evidenceInput: {
        evidenceRef: "evidence://worker-exit-zero",
        authorityRef: null
      },
      expectedStatus: "orphan_evidence",
      expectedDecision: "block"
    },
    {
      label: "unresolved reasons empty",
      evidenceInput: {
        evidenceRef: "evidence://unresolved-reasons-empty",
        complete: false
      },
      expectedStatus: "partial",
      expectedDecision: "retry"
    },
    {
      label: "passing tests",
      evidenceInput: {
        evidenceRef: "evidence://tests-pass",
        shallow: true
      },
      expectedStatus: "partial",
      expectedDecision: "retry"
    },
    {
      label: "archive shape",
      evidenceInput: {
        evidenceRef: "evidence://archive-shape",
        shallow: true
      },
      expectedStatus: "partial",
      expectedDecision: "retry"
    }
  ];

  for (const oldPath of oldPaths) {
    const base = baseScope();
    const result = derive({
      ...base,
      authoritySnapshot: snapshot(base.scope),
      evidenceRows: [evidence(base.scope, oldPath.evidenceInput)]
    });

    assert.equal(
      result.statuses.has(oldPath.expectedStatus),
      true,
      `${oldPath.label} should emit ${oldPath.expectedStatus}`
    );
    assert.equal(result.decision.decision, oldPath.expectedDecision);
    assert.notEqual(result.decision.decision, "close");
  }
});

test("T-092-TS assurance projection is deterministic and reports are read models", () => {
  const base = baseScope();
  const input = {
    ...base,
    authoritySnapshot: snapshot(base.scope),
    evidenceRows: [evidence(base.scope)]
  };
  const firstProjection = deriveAssuranceProjection(input);
  const secondProjection = deriveAssuranceProjection(input);
  const firstDecision = deriveAssuranceClosureDecision(firstProjection);
  const secondDecision = deriveAssuranceClosureDecision(secondProjection);

  assert.deepStrictEqual(firstProjection, secondProjection);
  assert.deepStrictEqual(firstDecision, secondDecision);

  const report = deriveAssuranceReportReadModel({
    projection: firstProjection,
    decision: firstDecision
  });

  assert.equal(report.projectionRef, firstProjection.projectionRef);
  assert.equal(report.closureDecision, "close");
  assert.deepStrictEqual(report.rowStatuses, ["fulfilled"]);
});
