import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import {
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES,
  OBSERVER_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/observer_operation_contracts.js";
import {
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_operation_contracts.js";
import {
  TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES,
  TUNER_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/tuner_operation_contracts.js";
import {
  admitConsensusPublicContract,
  CONSENSUS_PROJECT_READ_RELATION_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const D = "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const D2 = `sha256:${"f".repeat(64)}`;
const refDigest = (ref) => Object.freeze({ ref, digest: D });

function projectReadRequest(caseKey, sourceKind, sourceRef, selector) {
  return Object.freeze({
    kind: "project_read_request",
    caseKey,
    source: Object.freeze({
      kind: sourceKind,
      sourceRef,
      sourceDigest: D
    }),
    projectionBasis: refDigest(`project-read-basis:${caseKey}`),
    selector: Object.freeze(selector)
  });
}

function consensusResult() {
  return admitConsensusPublicContract({
    kind: "consensus_result",
    subjectRef: "ticket://T-281",
    subjectDigest: D,
    panelRef: "panel://reviewers",
    policyRef: "policy://consensus/rounds",
    roundRefs: ["round://one"],
    findingSetRefs: ["findings://one"],
    rulings: {
      kind: "review_rulings",
      roundRef: "round://one",
      rows: [{
        rulingRef: "ruling://one",
        rulingKind: "decision_row",
        findingRefs: ["finding://one"],
        rationaleRef: "rationale://one",
        payloadRef: "payload://ruling/one"
      }]
    },
    classification: "unanimous_agreement",
    dissentProfileRefs: [],
    terminalOutcome: {
      kind: "consensus_round_outcome",
      roundRef: "round://one",
      outcome: "closed_done",
      findingSetRefs: ["findings://one"],
      rulingRefs: ["ruling://one"],
      evidenceRefs: ["evidence://round/one"]
    },
    evidenceRefs: ["evidence://round/one"],
    lineageRefs: ["lineage://consensus/one"],
    resultRef: "result://consensus/one",
    replayRef: "replay://consensus/one",
    contractFailureRef: null
  }, "consensus_result");
}

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

test("T-281 observer and tuner relations conserve their request-selected source and bases", () => {
  const reportRelation = OBSERVER_PROJECT_READ_RELATION_SOURCES.observer_report;
  const reportRequest = projectReadRequest(
    "observer_report",
    "WorkspaceBinding",
    "workspace-binding:one",
    {
      observationBasis: refDigest("observer-observables:one"),
      sourceProjectionRefs: ["projection:halt"]
    }
  );
  const reportProjection = {
    kind: "observer_report_projection",
    projection: refDigest("projection:observer-report"),
    workspaceBinding: refDigest("workspace-binding:one"),
    observationBasis: refDigest("observer-observables:one"),
    sourceRefs: ["projection:halt"],
    findings: [],
    evidenceRefs: [],
    provenanceRefs: []
  };
  assert.deepEqual(reportRelation.relation({
    definitionKey: reportRelation.definitionKey,
    admittedRequest: reportRequest,
    candidateProjection: reportProjection
  }), { kind: "projection_related" });
  assert.deepEqual(reportRelation.relation({
    definitionKey: reportRelation.definitionKey,
    admittedRequest: reportRequest,
    candidateProjection: {
      ...reportProjection,
      workspaceBinding: refDigest("workspace-binding:other"),
      observationBasis: refDigest("observer-observables:other"),
      sourceRefs: ["projection:other"]
    }
  }), {
    kind: "projection_relation_mismatch",
    issuePaths: [
      "candidateProjection.workspaceBinding",
      "candidateProjection.observationBasis",
      "candidateProjection.sourceRefs"
    ]
  });

  const draftsRelation = OBSERVER_PROJECT_READ_RELATION_SOURCES.observer_drafts;
  const draftsRequest = projectReadRequest(
    "observer_drafts",
    "WorkspaceBinding",
    "workspace-binding:one",
    { observerObservables: refDigest("observer-observables:one") }
  );
  const draftsProjection = {
    kind: "observer_draft_projection",
    projection: refDigest("projection:observer-drafts"),
    workspaceBinding: refDigest("workspace-binding:one"),
    observerObservables: refDigest("observer-observables:one"),
    drafts: [],
    evidenceRefs: [],
    provenanceRefs: []
  };
  assert.deepEqual(draftsRelation.relation({
    definitionKey: draftsRelation.definitionKey,
    admittedRequest: draftsRequest,
    candidateProjection: draftsProjection
  }), { kind: "projection_related" });
  assert.deepEqual(draftsRelation.relation({
    definitionKey: draftsRelation.definitionKey,
    admittedRequest: draftsRequest,
    candidateProjection: {
      ...draftsProjection,
      workspaceBinding: refDigest("workspace-binding:other"),
      observerObservables: refDigest("observer-observables:other")
    }
  }), {
    kind: "projection_relation_mismatch",
    issuePaths: [
      "candidateProjection.workspaceBinding",
      "candidateProjection.observerObservables"
    ]
  });

  const tuningRelation = TUNER_PROJECT_READ_RELATION_SOURCES.tuning_report;
  const tuningRequest = projectReadRequest(
    "tuning_report",
    "WorkspaceBinding",
    "workspace-binding:one",
    { tuningTelemetryBasis: refDigest("tuning-telemetry:one") }
  );
  const tuningProjection = {
    kind: "tuning_report_projection",
    projection: refDigest("projection:tuning-report"),
    workspaceBinding: refDigest("workspace-binding:one"),
    telemetryBasis: refDigest("tuning-telemetry:one"),
    draftStates: [],
    signals: [],
    costs: [],
    divergenceObligations: [],
    evidenceRefs: [],
    provenanceRefs: []
  };
  assert.deepEqual(tuningRelation.relation({
    definitionKey: tuningRelation.definitionKey,
    admittedRequest: tuningRequest,
    candidateProjection: tuningProjection
  }), { kind: "projection_related" });
  assert.deepEqual(tuningRelation.relation({
    definitionKey: tuningRelation.definitionKey,
    admittedRequest: tuningRequest,
    candidateProjection: {
      ...tuningProjection,
      workspaceBinding: refDigest("workspace-binding:other"),
      telemetryBasis: refDigest("tuning-telemetry:other")
    }
  }), {
    kind: "projection_relation_mismatch",
    issuePaths: [
      "candidateProjection.workspaceBinding",
      "candidateProjection.telemetryBasis"
    ]
  });
});

test("T-281 ticket Consensus relation conserves represented result, ticket, and replay identity", () => {
  const relation = CONSENSUS_PROJECT_READ_RELATION_SOURCES.ticket_consensus;
  const result = consensusResult();
  const projection = admitConsensusPublicContract({
    kind: "ticket_consensus_projection",
    projectionRef: "projection://ticket/T-281/consensus",
    projectionDigest: D,
    ticketRef: result.subjectRef,
    ticketDigest: result.subjectDigest,
    result
  }, "ticket_consensus_projection");
  const request = Object.freeze({
    ...projectReadRequest(
      "ticket_consensus",
      "ConsensusResult",
      result.resultRef,
      {
        ticket: refDigest(result.subjectRef),
        outputAuthority: refDigest("output-authority://consensus/one"),
        replayBasis: refDigest(result.replayRef)
      }
    ),
    source: Object.freeze({
      kind: "ConsensusResult",
      sourceRef: result.resultRef,
      sourceDigest: stableSha256Digest(result)
    })
  });
  assert.deepEqual(relation.relation({
    definitionKey: relation.definitionKey,
    admittedRequest: request,
    candidateProjection: projection
  }), { kind: "projection_related" });

  assert.deepEqual(relation.relation({
    definitionKey: relation.definitionKey,
    admittedRequest: {
      ...request,
      source: {
        ...request.source,
        sourceRef: "result://consensus/other",
        sourceDigest: D
      },
      selector: {
        ...request.selector,
        ticket: Object.freeze({ ref: "ticket://T-OTHER", digest: D2 }),
        replayBasis: refDigest("replay://consensus/other")
      }
    },
    candidateProjection: projection
  }), {
    kind: "projection_relation_mismatch",
    issuePaths: [
      "candidateProjection.result.resultRef",
      "candidateProjection.result",
      "candidateProjection.ticketRef",
      "candidateProjection.ticketDigest",
      "candidateProjection.result.subjectRef",
      "candidateProjection.result.subjectDigest",
      "candidateProjection.result.replayRef"
    ]
  });

  assert.deepEqual(relation.relation({
    definitionKey: relation.definitionKey,
    admittedRequest: {
      ...request,
      selector: {
        ...request.selector,
        outputAuthority: refDigest("output-authority://consensus/other"),
        replayBasis: {
          ...request.selector.replayBasis,
          digest: D2
        }
      }
    },
    candidateProjection: projection
  }), { kind: "projection_related" });
});

test("T-281 special relation sources are immutable owner-local coordinates", () => {
  const sources = [
    ...Object.values(OBSERVER_PROJECT_READ_RELATION_SOURCES),
    ...Object.values(TUNER_PROJECT_READ_RELATION_SOURCES),
    ...Object.values(CONSENSUS_PROJECT_READ_RELATION_SOURCES)
  ];
  assert.equal(sources.length, 4);
  for (const source of sources) {
    assert.equal(Object.isFrozen(source), true);
    assert.equal(source.kind, "owner_projection_relation_source");
    assert.equal(source.sourceLocator.sourceRoot, "semantic_build");
    assert.equal(source.sourceLocator.memberPath.at(-1), "relation");
    assert.equal(typeof source.relation, "function");
  }
});
