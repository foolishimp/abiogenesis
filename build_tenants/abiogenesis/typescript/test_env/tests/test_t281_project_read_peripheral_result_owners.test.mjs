import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import {
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/observer_operation_contracts.js";
import {
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_operation_contracts.js";
import {
  TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/tuner_operation_contracts.js";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const D = "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const refDigest = (ref) => Object.freeze({ ref, digest: D });

const SOURCES = Object.freeze({
  witness_evidence:
    RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.project_read
      .witness_evidence.result,
  run_lawful_actions:
    ONE_SURFACE_NATIVE_CONTRACT_SOURCES.project_read.run_lawful_actions.result,
  observer_report:
    OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.observer_report
      .result,
  observer_drafts:
    OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.observer_drafts
      .result,
  tuning_report:
    TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.tuning_report.result
});

test("T-281 peripheral project.read results resolve through owner-local registries", async () => {
  assert.deepEqual(Object.keys(SOURCES), [
    "witness_evidence",
    "run_lawful_actions",
    "observer_report",
    "observer_drafts",
    "tuning_report"
  ]);
  for (const [caseKey, source] of Object.entries(SOURCES)) {
    assert.deepEqual(source.authority.subject, {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey,
      slot: "result"
    });
    assert.deepEqual(source.sourceLocator.memberPath, [
      "project_read",
      caseKey,
      "result",
      "schema"
    ]);
    assert.equal(source.namedChecks.kind, "family_registry");
    assert.deepEqual(source.namedChecks.memberPath, []);

    const resolved = await resolveSemanticBuildNativeSchemaSource(source);
    const projection = deriveCanonicalNativeSchemaProjection({
      source: resolved,
      schemaRef: source.identity.schemaId,
      schemaVersion: source.identity.schemaVersion
    });
    assert.deepEqual(projection.witness.sourceLocator, source.sourceLocator);
    assert.deepEqual(projection.witness.namedCheckSource, source.namedChecks);
    assert.ok(projection.witness.namedChecks.length > 0);
  }
});

test("T-281 WitnessedAct evidence preserves its exact subject", () => {
  const schema = SOURCES.witness_evidence.schema;
  const subject = Object.freeze({
    kind: "WitnessedAct",
    ref: "witnessed-act:one",
    digest: D
  });
  const value = {
    kind: "evidence_projection",
    projection: refDigest("projection:witness-evidence"),
    subject,
    rows: [
      {
        evidence: refDigest("evidence:witness-one"),
        evidenceContract: refDigest("contract:evidence"),
        admittedValue: { admitted: true },
        subject,
        material: {
          kind: "artifact",
          artifact: refDigest("artifact:witness")
        },
        producer: refDigest("actor:reviewer"),
        basis: refDigest("basis:witness"),
        provenanceRefs: ["provenance:witness"],
        replay: refDigest("replay:witness")
      }
    ]
  };
  assert.equal(v.parse(schema, value).subject.kind, "WitnessedAct");
  assert.throws(() =>
    v.parse(schema, {
      ...value,
      rows: [
        {
          ...value.rows[0],
          subject: { ...subject, ref: "witnessed-act:other" }
        }
      ]
    })
  );
});

test("T-281 lawful actions preserve target and eligibility truth", () => {
  const schema = SOURCES.run_lawful_actions.schema;
  const value = {
    kind: "lawful_action_projection",
    projection: refDigest("projection:lawful-actions"),
    run: refDigest("run:one"),
    frontier: refDigest("frontier:one"),
    nextActionProjection: refDigest("projection:next-action"),
    replayBasis: refDigest("replay-basis:next-action"),
    rows: [
      {
        actionRef: "action:invoke",
        actionKind: "invoke_graph_function",
        target: {
          kind: "public_target",
          target: refDigest("graph-function:one")
        },
        eligibility: "eligible",
        blockerRefs: [],
        requiredInput: {
          kind: "contract_bound",
          inputContract: refDigest("contract:input")
        },
        requiredCapabilityRefs: [
          "abg.capability.runtime.replay-continuation@5"
        ],
        provenanceRefs: ["provenance:next-action"]
      }
    ]
  };
  assert.equal(v.parse(schema, value).rows[0].eligibility, "eligible");
  assert.throws(() =>
    v.parse(schema, {
      ...value,
      rows: [{ ...value.rows[0], eligibility: "blocked" }]
    })
  );
  assert.throws(() =>
    v.parse(schema, {
      ...value,
      rows: [
        {
          ...value.rows[0],
          actionKind: "open_fh_gate"
        }
      ]
    })
  );
});

test("T-281 observer report and drafts preserve source, evidence, and triage lineage", () => {
  const reportSchema = SOURCES.observer_report.schema;
  const report = {
    kind: "observer_report_projection",
    projection: refDigest("projection:observer-report"),
    workspaceBinding: refDigest("workspace-binding:one"),
    observationBasis: refDigest("observer-observables:one"),
    sourceRefs: ["projection:halt"],
    findings: [
      {
        finding: refDigest("observer-finding:halt"),
        findingContract: refDigest("contract:halt-diagnosis"),
        admittedValue: { halted: true },
        sourceRefs: ["projection:halt"],
        evidenceRefs: ["evidence:halt"]
      }
    ],
    evidenceRefs: ["evidence:halt"],
    provenanceRefs: ["provenance:observer"]
  };
  assert.equal(v.parse(reportSchema, report).findings.length, 1);
  assert.throws(() =>
    v.parse(reportSchema, {
      ...report,
      findings: [
        {
          ...report.findings[0],
          sourceRefs: ["projection:unadmitted"]
        }
      ]
    })
  );

  const draftSchema = SOURCES.observer_drafts.schema;
  const drafts = {
    kind: "observer_draft_projection",
    projection: refDigest("projection:observer-drafts"),
    workspaceBinding: refDigest("workspace-binding:one"),
    observerObservables: refDigest("observer-observables:one"),
    drafts: [
      {
        kind: "observer_ticket_draft",
        draftRef: "observer-draft:one",
        actionKind: "ticket_draft",
        owner: "runtime projection owner",
        changeClass: "realization_refactor",
        reEntryPoint: "realization",
        summary: "repair an admitted runtime projection",
        triageReason: "the first missing truth is in realization",
        evidenceRefs: ["evidence:draft"]
      }
    ],
    evidenceRefs: ["evidence:draft"],
    provenanceRefs: ["provenance:observer-draft"]
  };
  assert.equal(v.parse(draftSchema, drafts).drafts[0].actionKind, "ticket_draft");
  assert.throws(() =>
    v.parse(draftSchema, {
      ...drafts,
      drafts: [
        {
          ...drafts.drafts[0],
          changeClass: null,
          reEntryPoint: null
        }
      ]
    })
  );
  assert.throws(() =>
    v.parse(draftSchema, {
      ...drafts,
      drafts: [
        {
          ...drafts.drafts[0],
          actionKind: "fh_input",
          changeClass: "realization_refactor",
          reEntryPoint: null
        }
      ]
    })
  );
  assert.throws(() =>
    v.parse(draftSchema, {
      ...drafts,
      drafts: [
        {
          ...drafts.drafts[0],
          changeClass: null,
          reEntryPoint: "realization"
        }
      ]
    })
  );
});

test("T-281 tuning report preserves replay-derived draft and signal relations", () => {
  const schema = SOURCES.tuning_report.schema;
  const value = {
    kind: "tuning_report_projection",
    projection: refDigest("projection:tuning-report"),
    workspaceBinding: refDigest("workspace-binding:one"),
    telemetryBasis: refDigest("tuning-telemetry:one"),
    draftStates: [
      {
        draftRef: "tuner-draft:one",
        state: "ratified",
        proposalKind: "annealing",
        proposer: "actor:tuner",
        summary: "promote the stable declared route",
        decidedBy: "actor:operator"
      }
    ],
    signals: [
      {
        signalRef: "tuner-signal:route",
        signalKind: "route_variance",
        subjectRef: "graph-function:one",
        value: 1,
        evidenceRefs: ["evidence:route"]
      }
    ],
    costs: [
      {
        configurationRef: "configuration:one",
        invocationCount: 1,
        totalDurationMs: 10
      }
    ],
    divergenceObligations: [
      {
        draftRef: "tuner-draft:one",
        equivalenceContractRef: "contract:equivalence",
        divergenceEvidenceRef: "evidence:divergence",
        demotionRequired: true,
        intakeRequired: true
      }
    ],
    evidenceRefs: ["evidence:route", "evidence:divergence"],
    provenanceRefs: ["provenance:tuner"]
  };
  assert.equal(v.parse(schema, value).draftStates[0].state, "ratified");
  assert.throws(() =>
    v.parse(schema, {
      ...value,
      draftStates: [{ ...value.draftStates[0], decidedBy: null }]
    })
  );
  assert.throws(() => v.parse(schema, { ...value, unexpected: true }));
});
