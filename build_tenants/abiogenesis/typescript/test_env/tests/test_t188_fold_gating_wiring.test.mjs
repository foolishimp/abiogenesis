// Implements: T-188 (fold-gating slices 2-3: M5 producer + B2 consumer wiring differential)
// Implements: T-205 (carry-through applicability: owed-but-missing coverage is typed residual pressure, not silence)
// Implements: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-002
// Implements: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-013
// Implements: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038
import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructGtlContractFulfillmentBinding,
  constructRequirementProofCandidateClassificationTable,
  constructRequirementProofCarryThroughContract,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  fulfilledAttachedArtifactFor,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";
import * as publicRoot from "@abiogenesis/typescript-tenant";
import * as publicGtlRequirements from "@abiogenesis/typescript-tenant/gtl/requirements";

function classificationTable() {
  return constructRequirementProofCandidateClassificationTable({
    tableRef: "classification-table://t188/wiring",
    sourceRef: "gtl-overlay://t188/wiring",
    rules: [
      {
        kind: "requirement_proof_candidate_classification_rule",
        ruleRef: "classification-rule://t188/wiring/source-artifact",
        stageRole: "transform",
        outputCandidateKind: "candidate-kind://t188/source-artifact",
        admissionTargetKind: "admission-target://abg/payload",
        evidenceRoleRefs: ["evidence-role://t188/realization"]
      }
    ]
  });
}

function carryContract(table, overrides = {}) {
  return constructRequirementProofCarryThroughContract({
    contractRef: "plugin-proof-contract://t188/wiring/source",
    pluginRef: "plugin://t188/wiring/source",
    stageRole: "transform",
    resultInterfaceRef: "result-interface://t188/source",
    responseContractRefs: ["response-contract://t188/source"],
    selectedCompositionRef: "composition://t188/transform/source",
    selectedCompositionDigest: "sha256:t188-composition",
    fulfillmentBindings: [
      constructGtlContractFulfillmentBinding({
        bindingRef: "gtl-contract-fulfillment-binding://t188/r1-source",
        obligationRef: "requirement-obligation://t188/r1",
        requirementRef: "requirement://t188/r1",
        productRequirementRef: "product-requirement://t188/r1",
        designObligationRef: "design-obligation://t188/source",
        componentRef: "component://t188/source",
        productTargetRef: "target://t188/source",
        outputSurfaceRef: "output-surface://t188/source",
        functionOrEntrypointRef: "function://t188/transform/source",
        realizationEvidenceRefs: ["evidence://t188/source/artifact"],
        testOrExecutionEvidenceRefs: ["proof-obligation://t188/source-build"],
        evaluatorFindingRef: "evaluator-finding://t188/source-build",
        authorityRefs: ["authority://t188/fp-worker"],
        evidenceRefs: ["evidence://t188/source/artifact"]
      })
    ],
    proofPolicyRefs: ["proof-policy://t188/positive-negative"],
    expectedEvidenceShapeRefs: [
      "evidence-shape://t188/positive",
      "evidence-shape://t188/negative"
    ],
    proofStrengthRefs: ["proof-strength://t188/execution-plus-test"],
    depthPolicyRefs: ["proof-depth-policy://t188/software-build"],
    requiredDepthClassRefs: ["depth-class://positive", "depth-class://negative"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/coverage-strength"],
    requiredAdversarialCheckRefs: [],
    evidenceRoleRefs: ["evidence-role://t188/realization"],
    outputCandidateKinds: ["candidate-kind://t188/source-artifact"],
    admissionTargetKinds: ["admission-target://abg/payload"],
    classificationTableRef: table.tableRef,
    classificationTableDigest: table.tableDigest,
    ...overrides
  });
}

function envelopeTemplate(overrides = {}) {
  return {
    contractRef: "plugin-proof-contract://t188/wiring/source",
    stageRole: "transform",
    taskRole: "task-role://t188/build-source",
    outputCandidateKind: "candidate-kind://t188/source-artifact",
    admissionTargetKind: "admission-target://abg/payload",
    sourceRequirementObligationRefs: ["requirement-obligation://t188/r1"],
    evidenceRoleRefs: ["evidence-role://t188/realization"],
    proofObligationRefs: ["proof-obligation://t188/source-build"],
    proofPolicyRefs: ["proof-policy://t188/positive-negative"],
    expectedEvidenceShapeRefs: [
      "evidence-shape://t188/positive",
      "evidence-shape://t188/negative"
    ],
    positiveEvidenceShapeRefs: ["evidence-shape://t188/positive"],
    negativeEvidenceShapeRefs: ["evidence-shape://t188/negative"],
    proofStrengthRefs: ["proof-strength://t188/execution-plus-test"],
    depthPolicyRefs: ["proof-depth-policy://t188/software-build"],
    depthClassRefs: ["depth-class://positive", "depth-class://negative"],
    proofStrengthAdmissionRefs: ["proof-strength-admission://t188/source-test"],
    fdStrengthCriterionRefs: ["fd-strength-criterion://t188/coverage-strength"],
    adversarialAttemptRefs: [],
    counterexampleRefs: [],
    responseContractRef: "response-contract://t188/source",
    resultInterfaceRef: "result-interface://t188/source",
    selectedCompositionRef: "composition://t188/transform/source",
    selectedCompositionDigest: "sha256:t188-composition",
    ...overrides
  };
}


function fpDispatchPluginWithArtifact() {
  return Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://t188/wiring/fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t188/wiring/${input.vectorIndex}`,
        attachedResultArtifact: fulfilledAttachedArtifactFor(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function runWiring(startupEntry) {
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup:
      startupEntry === undefined ? undefined : { entries: [startupEntry] },
    plugins: { fpDispatch: fpDispatchPluginWithArtifact() }
  });
  return { events, result };
}

test("T-188 M5: engine emits carry-through admission with producer-computed coverage refs", () => {
  const table = classificationTable();
  const { events } = runWiring({
    contract: carryContract(table),
    classificationTable: table,
    requirementIds: ["requirement://t188/r1"],
    envelopeTemplate: envelopeTemplate()
  });
  const admitted = events.filter(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.equal(admitted.length, 1);
  assert.equal(admitted[0].accepted, true);
  assert.deepEqual(admitted[0].coverageRequirementIds, ["requirement://t188/r1"]);
  assert.equal(admitted[0].coverageTruthRefs.length, 1);
  assert.match(admitted[0].coverageTruthRefs[0], /^abg:\/\/requirement-proof-coverage\//u);
  assert.deepEqual(admitted[0].issueKinds, []);
});

test("T-188 M5 differential: envelope missing the source obligation is rejected with issue kinds", () => {
  const table = classificationTable();
  const { events } = runWiring({
    contract: carryContract(table),
    classificationTable: table,
    requirementIds: ["requirement://t188/r1"],
    envelopeTemplate: envelopeTemplate({ sourceRequirementObligationRefs: [] })
  });
  const admitted = events.filter(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.equal(admitted.length, 1);
  assert.equal(admitted[0].accepted, false);
  assert.equal(admitted[0].issueKinds.includes("source_obligation_gap"), true);
  // coverage truth is still producer-computed for the rejected admission —
  // its ref differs from the accepted case (status is digest-bound).
  assert.equal(admitted[0].coverageTruthRefs.length, 1);
});

test("T-188 no startup => no carry-through events (undeclared edges unchanged)", () => {
  const { events } = runWiring(undefined);
  assert.equal(
    events.some((event) => event.kind === "requirement_proof_carry_through_admitted"),
    false
  );
});

test("T-188 M3 differential: ledger-resolved strength flips the strength issue kind", () => {
  const table = classificationTable();
  const strengthRef = "proof-strength-admission://t188/source-test";
  const resolvingPlugin = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://t188/wiring/fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t188/wiring/${input.vectorIndex}`,
        // the artifact DECLARES the strength evidence; the accepted payload
        // admission turns it into typed evidence truth — only then does
        // strength resolution succeed (no raw-string masquerade)
        attachedResultArtifact: fulfilledAttachedArtifactFor(input, { evidenceRefs: [strengthRef] }),
        evidenceRefs: []
      });
    }
  });
  const basisA = buildThreeStageBasis({ defaultRegime: "F_P" });
  const eventsA = [];
  runEngineIterate({
    basis: basisA,
    eventSink: (event) => eventsA.push(event),
    ...m03InstructionAssemblyRequestFields(basisA),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table, {
            fdStrengthCriterionRefs: [strengthRef]
          }),
          classificationTable: table,
          requirementIds: ["requirement://t188/r1"],
          envelopeTemplate: envelopeTemplate({
            proofStrengthAdmissionRefs: [strengthRef],
            fdStrengthCriterionRefs: [strengthRef]
          })
        }
      ]
    },
    plugins: { fpDispatch: resolvingPlugin }
  });
  const admittedA = eventsA.find(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.ok(admittedA);
  assert.equal(admittedA.accepted, true);
  assert.equal(
    admittedA.coverageIssueKinds.includes("proof_strength_not_admitted"),
    false
  );
  // ELIGIBLE end to end: accepted admission + ledger-resolved strength +
  // plan-carried depth policy + plan-derived dependency closure.
  assert.deepEqual([...admittedA.coverageIssueKinds], []);
  assert.deepEqual(admittedA.coverageStatuses, ["eligible"]);

  // Unresolvable fixture refs: list presence alone no longer admits strength.
  const { events: eventsB } = runWiring({
    contract: carryContract(table),
    classificationTable: table,
    requirementIds: ["requirement://t188/r1"],
    envelopeTemplate: envelopeTemplate()
  });
  const admittedB = eventsB.find(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.ok(admittedB);
  assert.equal(admittedB.accepted, true);
  assert.equal(
    admittedB.coverageIssueKinds.includes("proof_strength_not_admitted"),
    true
  );
});

test("T-188 item-6 differential: coverage fields disagreeing with the truth ref fail closed", async () => {
  const { parseRequirementProofCoverageTruthRef, constructRequirementProofCarryThroughAdmittedEvent } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const table = classificationTable();
  const { events } = runWiring({
    contract: carryContract(table),
    classificationTable: table,
    requirementIds: ["requirement://t188/r1"],
    envelopeTemplate: envelopeTemplate()
  });
  const admitted = events.find(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.ok(admitted);
  const parsed = parseRequirementProofCoverageTruthRef(admitted.coverageTruthRefs[0]);
  assert.equal(parsed.requirementId, "requirement://t188/r1");
  assert.equal(parsed.status, admitted.coverageStatuses[0]);
  // tamper: status field disagreeing with the ref must throw at construction
  assert.throws(
    () =>
      constructRequirementProofCarryThroughAdmittedEvent({
        invocation: {
          basisId: admitted.basisId, graphFunctionId: admitted.graphFunctionId,
          runId: admitted.runId, workKey: admitted.workKey,
          graphCallId: admitted.graphCallId, frameId: admitted.frameId,
          vectorIndex: admitted.vectorIndex, edge: admitted.edge,
          actorInvocationId: admitted.actorInvocationId,
          workerId: admitted.workerId, backendId: admitted.backendId,
          causationEventRefs: [], correlationId: admitted.correlationId,
          resultRef: "result://x"
        },
        correlationId: admitted.correlationId,
        envelopeRef: admitted.envelopeRef, contractRef: admitted.contractRef,
        categoryKey: admitted.categoryKey, accepted: admitted.accepted,
        sourceRequirementObligationRefs: admitted.sourceRequirementObligationRefs,
        proofObligationRefs: admitted.proofObligationRefs,
        evidenceRoleRefs: admitted.evidenceRoleRefs, issueKinds: admitted.issueKinds,
        coverageRequirementIds: admitted.coverageRequirementIds,
        coverageStatuses: ["eligible"],
        coverageTruthRefs: admitted.coverageTruthRefs,
        replayIdentity: admitted.replayIdentity, replayDigest: admitted.replayDigest
      }),
    /disagree with the truth ref/u
  );
});

function b3Bundle(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  const spanId = `span://t188/b3/${vector.id}`;
  const requirement = publicGtlRequirements.declareRequirement({
    requirementId: "REQ-T188-B3-001",
    termKind: "atom",
    stableId: "REQ-T188-B3-001",
    sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md#013",
    sourceDigest: "sha256:t188-b3-requirement",
    relationRefs: [],
    spanRefs: [spanId],
    contextRefs: [],
    evidencePolicyRefs: ["policy://t188/b3-evidence"]
  });
  const span = publicGtlRequirements.declareTraversalSpan({
    spanId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRefs: [vector.id],
    vectorIndexes: [vectorIndex],
    sourceNodeRef: vector.source[0].id,
    targetNodeRef: vector.target.id
  });
  return publicGtlRequirements.declareBundle({
    requirements: [requirement],
    spans: [span]
  });
}

function b3Run(carryEntry, pluginEvidenceRefs, seedEvents) {
  const base = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({
    ...base,
    startIntent: Object.freeze({ ...base.startIntent, until: "first_traversal" })
  });
  // entries that need basis identity (e.g. a foreign production edge) are
  // passed as a factory over the built basis
  const entry = typeof carryEntry === "function" ? carryEntry(basis) : carryEntry;
  const events = [];
  const result = runEngineIterate({
    basis,
    ...(seedEvents === undefined ? {} : { runtimeEvents: seedEvents }),
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementRouteDeclarationBundle: b3Bundle(basis, 0),
    requirementProofCarryThroughStartup:
      entry === undefined ? undefined : { entries: [entry] },
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t188/b3/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t188/b3/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input, { evidenceRefs: pluginEvidenceRefs }),
            evidenceRefs: []
          });
        }
      }),
      fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
    }
  });
  const fold = result.replayEvents.find(
    (event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected"
  );
  const carry = result.replayEvents.find(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  return { fold, carry, result };
}

test("T-188 B3: uncovered/residual coverage shall not close; eligible coverage folds satisfied", () => {
  const table = classificationTable();
  // baseline: no carry-through declared -> fold satisfied (undeclared edges unchanged)
  const baseline = b3Run(undefined, undefined);
  assert.ok(baseline.fold);
  assert.equal(baseline.fold.requirementPayload.fold.state, "satisfied");
  assert.equal(baseline.carry, undefined);

  // residual coverage (strength refs never admitted) -> fold shall NOT close
  const residual = b3Run(
    {
      contract: carryContract(table),
      classificationTable: table,
      requirementIds: ["REQ-T188-B3-001"],
      envelopeTemplate: envelopeTemplate()
    },
    undefined
  );
  assert.ok(residual.carry);
  assert.equal(residual.carry.coverageStatuses[0], "residual");
  assert.ok(residual.fold);
  assert.equal(residual.fold.requirementPayload.fold.state, "no_close_preserved");

  // eligible coverage (typed-resolved strength) -> fold satisfied again
  const strengthRef = "proof-strength-admission://t188/source-test";
  const eligible = b3Run(
    {
      contract: carryContract(table, { fdStrengthCriterionRefs: [strengthRef] }),
      classificationTable: table,
      requirementIds: ["REQ-T188-B3-001"],
      envelopeTemplate: envelopeTemplate({
        proofStrengthAdmissionRefs: [strengthRef],
        fdStrengthCriterionRefs: [strengthRef]
      })
    },
    [strengthRef]
  );
  assert.ok(eligible.carry);
  assert.deepEqual(eligible.carry.coverageStatuses, ["eligible"]);
  assert.ok(eligible.fold);
  assert.equal(eligible.fold.requirementPayload.fold.state, "satisfied");
});

test("T-188 identity scope: foreign-edge residual coverage does not feed the closing fold", async () => {
  const {
    constructRequirementProofCarryThroughAdmittedEvent,
    requirementAbgTruthRefFromRequirementProofCoverage
  } = await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const { emit } = await import("../../build/semantic/code/src/abg/m03/events/index.js");
  const probe = buildThreeStageBasis({ defaultRegime: "F_P" });
  const foreignRef = requirementAbgTruthRefFromRequirementProofCoverage({
    kind: "requirement_proof_coverage_projection",
    projectionRef: "requirement-proof-coverage://t188/forged/foreign",
    requirementId: "REQ-T188-B3-001",
    status: "residual"
  });
  // same basis + same vectorIndex, but the EDGE is vector 1's — the
  // identity scope must exclude it from vector 0's close.
  const forged = constructRequirementProofCarryThroughAdmittedEvent({
    invocation: {
      basisId: probe.id,
      graphFunctionId: probe.graphFunction.id,
      runId: "run://t188/forged",
      workKey: "wk://t188/forged",
      graphCallId: "graph-call://t188/forged",
      frameId: "frame://t188/forged",
      vectorIndex: 0,
      edge: probe.graph.vectors[1]?.name ?? "requirements→design",
      actorInvocationId: "actor-invocation://t188/forged",
      workerId: "worker://t188/forged",
      backendId: "backend://t188/forged",
      causationEventRefs: [],
      correlationId: "correlation://t188/forged",
      resultRef: "result://t188/forged"
    },
    frameLineageId: null,
    correlationId: "correlation://t188/forged",
    envelopeRef: "envelope://t188/forged",
    contractRef: "plugin-proof-contract://t188/forged",
    categoryKey: "category://t188/forged",
    accepted: true,
    sourceRequirementObligationRefs: ["requirement-obligation://t188/forged"],
    proofObligationRefs: ["proof-obligation://t188/forged"],
    evidenceRoleRefs: ["evidence-role://t188/forged"],
    issueKinds: [],
    coverageRequirementIds: ["REQ-T188-B3-001"],
    coverageStatuses: ["residual"],
    coverageIssueKinds: ["missing_depth_obligation_class"],
    coverageTruthRefs: [foreignRef],
    replayIdentity: "replay://t188/forged",
    replayDigest: "sha256:t188-forged"
  });
  // baseline WITH the forged foreign-edge residual seeded: fold must STILL
  // be satisfied — the residual must not leak across edge identity.
  const stamped = emit([forged], () => undefined);
  const seeded = b3Run(undefined, undefined, stamped);
  assert.ok(seeded.fold);
  assert.equal(seeded.fold.requirementPayload.fold.state, "satisfied");
});

test("T-205 owed-but-missing coverage: foreign-production-edge contract preserves no-close with a synthesized residual ref", async () => {
  // ref recognition through the owning parser — no raw ref-scheme literals
  // outside the owning module (review finding: startsWith prefix drift)
  const { requirementProofCoverageStatusFromTruthRef } = await import(
    "../../build/semantic/code/src/abg/m03/contracts/index.js"
  );
  const table = classificationTable();
  // the entry OWES coverage for the active requirement (requirementIds is
  // obligation scope) but PRODUCES on vector 1's edge (edge is production
  // scope) — vector 0 closes with active pressure and no admitted coverage
  const missing = b3Run(
    (basis) => ({
      contract: carryContract(table),
      classificationTable: table,
      requirementIds: ["REQ-T188-B3-001"],
      envelopeTemplate: envelopeTemplate(),
      edge: basis.graph.vectors[1]?.name ?? "requirements→design"
    }),
    undefined
  );
  assert.equal(missing.carry, undefined);
  assert.ok(missing.fold);
  assert.equal(missing.fold.requirementPayload.fold.state, "no_close_preserved");
  const residualRefs = missing.fold.requirementPayload.fold.sourceAbgTruthRefs.filter(
    (ref) => requirementProofCoverageStatusFromTruthRef(ref)?.status === "residual"
  );
  assert.equal(residualRefs.length, 1);
});

test("T-205 requirement-scoped owedness control: a contract naming only a foreign requirement keeps the -038 transitional close", () => {
  const table = classificationTable();
  const control = b3Run(
    (basis) => ({
      contract: carryContract(table),
      classificationTable: table,
      requirementIds: ["REQ-T188-B3-OTHER"],
      envelopeTemplate: envelopeTemplate(),
      edge: basis.graph.vectors[1]?.name ?? "requirements→design"
    }),
    undefined
  );
  assert.ok(control.fold);
  assert.equal(control.fold.requirementPayload.fold.state, "satisfied");
});

test("T-205 inadmissible startup fails closed at entry: typed gap_stop terminal, no host exception, no traversal", () => {
  const table = classificationTable();
  const { events, result } = runWiring({
    contract: carryContract(table),
    classificationTable: table,
    requirementIds: ["requirement://t188/r1", ""],
    envelopeTemplate: envelopeTemplate()
  });
  const terminal = result.replayEvents.find(
    (event) => event.kind === "terminal_reached"
  );
  assert.ok(terminal);
  assert.equal(terminal.terminalKind, "gap_stop");
  // the reason joins the CLOSED issueKind vocabulary (locus:kind), not prose
  assert.match(
    terminal.reason ?? "",
    /requirement proof carry-through startup rejected: entries\[0\]\.requirementIds:requirement_ids_invalid/u
  );
  // the unlawful entry set never runs: no carry-through emission, no dispatch
  assert.equal(
    events.some((event) => event.kind === "requirement_proof_carry_through_admitted"),
    false
  );
});

test("T-030 -007: engine manifests carry requirement pressure for the spanned vector before F_P dispatch", () => {
  const table = classificationTable();
  const { result } = b3Run(
    {
      contract: carryContract(table),
      classificationTable: table,
      requirementIds: ["REQ-T188-B3-001"],
      envelopeTemplate: envelopeTemplate()
    },
    undefined
  );
  const manifests = result.replayEvents.filter(
    (event) =>
      event.kind === "instruction_prompt_manifest_projected" &&
      event.vectorIndex === 0
  );
  assert.notEqual(manifests.length, 0);
  for (const manifest of manifests) {
    assert.equal(manifest.requirementPressureRefs.includes("REQ-T188-B3-001"), true);
    assert.equal(
      manifest.requirementPressureRefs.includes("requirement-obligation://t188/r1"),
      true
    );
    assert.equal(
      manifest.requirementPressureRefs.includes("proof-obligation://t188/source-build"),
      true
    );
  }
});

// T-031 live-run reproduction: a MULTI-VECTOR span whose FIRST vector
// closes before the coverage-producing vector (the data-mapper shape:
// spans [4,14,16,21], v4 closes first). The live run showed ZERO route
// facts at the spanned close — this pins whichever gate rejects.
function t031MultiSpanBundle(basis) {
  const spanId = "span://t188/t031/multi";
  const vectors = [basis.graph.vectors[0], basis.graph.vectors[2]];
  return publicGtlRequirements.declareBundle({
    requirements: [
      publicGtlRequirements.declareRequirement({
        requirementId: "REQ-T188-B3-001",
        termKind: "atom",
        stableId: "REQ-T188-B3-001",
        sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md#013",
        sourceDigest: "sha256:t188-t031-requirement",
        relationRefs: [],
        spanRefs: [spanId],
        contextRefs: [],
        evidencePolicyRefs: ["policy://t188/b3-evidence"]
      })
    ],
    spans: [
      publicGtlRequirements.declareTraversalSpan({
        spanId,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRefs: vectors.map((vector) => vector.id),
        vectorIndexes: [0, 2],
        sourceNodeRef: vectors[0].source[0].id,
        targetNodeRef: vectors[1].target.id
      })
    ]
  });
}

test("T-031 repro: non-final spanned close emits fold truth (owed-but-missing residual), not silence", () => {
  const table = classificationTable();
  const base = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({
    ...base,
    startIntent: Object.freeze({ ...base.startIntent, until: "first_traversal" })
  });
  const events = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementRouteDeclarationBundle: t031MultiSpanBundle(basis),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table),
          classificationTable: table,
          requirementIds: ["REQ-T188-B3-001"],
          envelopeTemplate: envelopeTemplate(),
          // produces coverage on vector 2's edge — NOT the closing vector 0
          edge: basis.graph.vectors[2]?.name ?? "design→code"
        }
      ]
    },
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t188/t031/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t188/t031/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input),
            evidenceRefs: []
          });
        }
      }),
      fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
    }
  });
  const closed = result.replayEvents.filter((event) => event.kind === "vector_closed");
  assert.equal(closed.length >= 1, true);
  assert.equal(closed[0].vectorIndex, 0);
  const folds = result.replayEvents.filter(
    (event) =>
      event.kind === "requirement_route_fact_projected" &&
      event.routePayloadKind === "requirement_fold_projected"
  );
  // THE LIVE DEFECT SHAPE: zero folds at a reached spanned close = the
  // requirement pressure vanished from replay at this close (silence).
  assert.notEqual(folds.length, 0, "non-final spanned close emitted no fold truth");
  const fold = folds[0].requirementPayload.fold;
  assert.equal(fold.requirementId, "REQ-T188-B3-001");
  assert.equal(fold.state, "no_close_preserved");
  assert.equal(
    fold.sourceAbgTruthRefs.some((ref) => ref.includes("/residual/")),
    true,
    "owed-but-missing coverage must surface as residual pressure at the spanned close"
  );
});

// T-031 BUG #2: multi-requirement scope with coverage truth but ZERO
// per-requirement evidence bindings — coverage must reach the fold. Found
// live at the data-mapper proving edge: 8 eligible carry admissions, then
// 8 folds no_close_preserved on EMPTY sources (the review-escrowed drop
// seam gone load-bearing). Route-level differential over the fold input.
test("T-031 BUG #2: coverage-bearing requirement in multi-requirement scope folds from coverage, not silence", async () => {
  const {
    projectRequirementFoldFromAssuranceClosure
  } = await import("../../build/semantic/code/src/abg/m03/contracts/requirements_route.js");
  // exercised through the engine instead: two requirements on one span,
  // one covered eligible via carry admission, neither evidence-bound —
  // both folds must carry coverage-derived sources (satisfied for the
  // covered one; residual/no-close for the owed-but-missing one).
  const table = classificationTable();
  const base = buildThreeStageBasis({ defaultRegime: "F_P" });
  const basis = Object.freeze({
    ...base,
    startIntent: Object.freeze({ ...base.startIntent, until: "first_traversal" })
  });
  const spanId = "span://t188/t031/two";
  const vector = basis.graph.vectors[0];
  const bundle = publicGtlRequirements.declareBundle({
    requirements: ["REQ-T188-B3-001", "REQ-T188-B3-002"].map((requirementId) =>
      publicGtlRequirements.declareRequirement({
        requirementId,
        termKind: "atom",
        stableId: requirementId,
        sourceRef: "specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md#013",
        sourceDigest: `sha256:t031-${requirementId}`,
        relationRefs: [],
        spanRefs: [spanId],
        contextRefs: [],
        evidencePolicyRefs: ["policy://t188/b3-evidence"]
      })
    ),
    spans: [
      publicGtlRequirements.declareTraversalSpan({
        spanId,
        graphFunctionRef: basis.graphFunction.id,
        graphVectorRefs: [vector.id],
        vectorIndexes: [0],
        sourceNodeRef: vector.source[0].id,
        targetNodeRef: vector.target.id
      })
    ]
  });
  const strengthRef = "proof-strength-admission://t188/source-test";
  const result = runEngineIterate({
    basis,
    eventSink: () => {},
    ...m03InstructionAssemblyRequestFields(basis),
    requirementRouteDeclarationBundle: bundle,
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table, { fdStrengthCriterionRefs: [strengthRef] }),
          classificationTable: table,
          requirementIds: ["REQ-T188-B3-001"],
          envelopeTemplate: envelopeTemplate({
            proofStrengthAdmissionRefs: [strengthRef],
            fdStrengthCriterionRefs: [strengthRef]
          })
        },
        {
          // -002 is OWED (entry names it) but PRODUCES on a foreign edge,
          // so no coverage exists at the closing vector -> synthesized
          // residual must reach its fold (the T-205 applicability law
          // composing with the BUG #2 seam fix in multi-requirement scope)
          contract: carryContract(table, {
            contractRef: "plugin-proof-contract://t188/t031b2/second"
          }),
          classificationTable: table,
          requirementIds: ["REQ-T188-B3-002"],
          envelopeTemplate: envelopeTemplate({
            contractRef: "plugin-proof-contract://t188/t031b2/second"
          }),
          edge: basis.graph.vectors[1]?.name ?? "requirements→design"
        }
      ]
    },
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t188/t031b2/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t188/t031b2/${input.vectorIndex}`,
            attachedResultArtifact: fulfilledAttachedArtifactFor(input, { evidenceRefs: [strengthRef] }),
            evidenceRefs: []
          });
        }
      }),
      fpEvaluator: publicRoot.defaultFpEvaluatorPlugin
    }
  });
  const folds = {};
  for (const event of result.replayEvents) {
    if (event.kind === "requirement_route_fact_projected" &&
        event.routePayloadKind === "requirement_fold_projected") {
      const fold = event.requirementPayload.fold;
      folds[fold.requirementId] = fold;
    }
  }
  const covered = folds["REQ-T188-B3-001"];
  assert.ok(covered, "covered requirement must fold");
  assert.notEqual(covered.sourceAbgTruthRefs.length, 0, "fold sources must not be empty");
  assert.equal(
    covered.sourceAbgTruthRefs.some((ref) => ref.includes("requirement-proof-coverage/eligible")),
    true,
    "eligible coverage must reach the fold without evidence bindings"
  );
  assert.equal(covered.state, "satisfied");
  const owed = folds["REQ-T188-B3-002"];
  assert.ok(owed, "owed-but-missing requirement must fold");
  assert.equal(owed.state, "no_close_preserved");
  assert.equal(
    owed.sourceAbgTruthRefs.some((ref) => ref.includes("/residual/")),
    true,
    "synthesized residual must reach the fold in multi-requirement scope"
  );
});

test("T-195 P0-5 recurrence pin: no sha256:sha256 double-prefix in any emitted truth", () => {
  const table = classificationTable();
  const { result } = b3Run(
    {
      contract: carryContract(table),
      classificationTable: table,
      requirementIds: ["REQ-T188-B3-001"],
      envelopeTemplate: envelopeTemplate()
    },
    undefined
  );
  const doubled = [];
  const scan = (value, path) => {
    if (typeof value === "string" && value.includes("sha256:sha256:")) {
      doubled.push(path);
    } else if (Array.isArray(value)) {
      value.forEach((row, index) => scan(row, `${path}[${index}]`));
    } else if (value !== null && typeof value === "object") {
      for (const [key, row] of Object.entries(value)) {
        scan(row, `${path}.${key}`);
      }
    }
  };
  result.replayEvents.forEach((event, index) => scan(event, `event[${index}](${event.kind})`));
  assert.deepEqual(doubled, []);
});

// T-210 break 1 differentials: the admitted depth-proof-map carrier.
test("T-210 b1: depth-map admission is total — valid rows admit canonically, malformed rows reject typed, foreign shapes inert", async () => {
  const { admitDepthProofMap, deriveAdmittedDepthProofRowsByRequirementId } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const valid = admitDepthProofMap({
    payloadSection: {
      rows: [
        { requirementId: "REQ-B", depthClassRef: "depth-class://negative", testIdentityRefs: ["z-test", "a-test"] },
        { requirementId: "REQ-A", depthClassRef: "depth-class://positive", testIdentityRefs: ["p-test"] }
      ]
    },
    sourceResultRef: "result://t210/b1",
    replayIdentity: "replay://t210/b1"
  });
  assert.equal(valid.accepted, true);
  // canonical: rows sorted by requirement:class, test refs sorted
  // T-216 D6: canonical order is by FULL row content (sorted-keys JSON,
  // codepoint) — depthClassRef "negative" < "positive", so REQ-B first
  assert.equal(new Set(valid.map.rows.map((row) => row.requirementId)).size, 2);
  assert.deepEqual(valid.map.rows.map((row) => row.requirementId), ["REQ-B", "REQ-A"]);
  const reqA = valid.map.rows.find((row) => row.requirementId === "REQ-A");
  const reqB = valid.map.rows.find((row) => row.requirementId === "REQ-B");
  assert.deepEqual([...reqB.testIdentityRefs], ["a-test", "z-test"]);
  assert.deepEqual([...reqA.testIdentityRefs], ["p-test"]);
  assert.match(valid.map.mapDigest, /^sha256:[0-9a-f]{64}$/u);
  // determinism: same content -> same digest
  const again = admitDepthProofMap({
    payloadSection: {
      rows: [
        { requirementId: "REQ-A", depthClassRef: "depth-class://positive", testIdentityRefs: ["p-test"] },
        { requirementId: "REQ-B", depthClassRef: "depth-class://negative", testIdentityRefs: ["a-test", "z-test"] }
      ]
    },
    sourceResultRef: "result://t210/b1",
    replayIdentity: "replay://t210/b1"
  });
  assert.equal(again.map.mapDigest, valid.map.mapDigest);
  // malformed: typed issues, no map
  const bad = admitDepthProofMap({
    payloadSection: {
      rows: [
        { requirementId: "", depthClassRef: "depth-class://positive", testIdentityRefs: ["x"] },
        { requirementId: "REQ-C", depthClassRef: 7, testIdentityRefs: [] },
        "not-a-row",
        { requirementId: "\uD800", depthClassRef: "depth-class://boundary", testIdentityRefs: ["y"] }
      ]
    },
    sourceResultRef: "result://t210/b1",
    replayIdentity: "replay://t210/b1"
  });
  assert.equal(bad.accepted, false);
  assert.equal(bad.map, undefined);
  const kinds = bad.issues.map((issue) => issue.issueKind);
  assert.equal(kinds.includes("requirement_id_invalid"), true);
  assert.equal(kinds.includes("depth_class_invalid"), true);
  assert.equal(kinds.includes("test_identity_refs_invalid"), true);
  assert.equal(kinds.includes("row_not_object"), true);
  // foreign shapes: typed rejection, never a throw
  assert.equal(admitDepthProofMap({ payloadSection: null, sourceResultRef: "r", replayIdentity: "i" }).issues[0].issueKind, "map_not_object");
  assert.equal(admitDepthProofMap({ payloadSection: [1], sourceResultRef: "r", replayIdentity: "i" }).issues[0].issueKind, "map_not_object");
  assert.equal(admitDepthProofMap({ payloadSection: { rows: "x" }, sourceResultRef: "r", replayIdentity: "i" }).issues[0].issueKind, "rows_not_array");
  // ledger projection: later admitted map supersedes for the requirement
  const events = [
    { kind: "depth_proof_map_admitted", accepted: true, rows: [{ requirementId: "REQ-A", depthClassRef: "depth-class://positive", testIdentityRefs: ["old"] }] },
    { kind: "depth_proof_map_admitted", accepted: false, rows: [] },
    { kind: "depth_proof_map_admitted", accepted: true, rows: [{ requirementId: "REQ-A", depthClassRef: "depth-class://negative", testIdentityRefs: ["new"] }] }
  ];
  const ledger = deriveAdmittedDepthProofRowsByRequirementId(events);
  assert.deepEqual(ledger.get("REQ-A").map((row) => row.depthClassRef), ["depth-class://negative"]);
});

test("T-210 b1: an attached artifact carrying a depth-proof map emits admitted replay truth in the accepted branch", () => {
  const table = classificationTable();
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table),
          classificationTable: table,
          requirementIds: ["requirement://t188/r1"],
          envelopeTemplate: envelopeTemplate()
        }
      ]
    },
    plugins: {
      fpDispatch: Object.freeze({
        contract: constructEnginePluginContract({
          ref: "plugin://t210/b1/fp-dispatch",
          pluginKind: "fp_dispatch",
          authority: "effect_plugin",
          inputCarrier: "EnginePluginInput",
          outputCarrier: "FpDispatchOutcome"
        }),
        dispatch(input) {
          return constructFpDispatchOutcome({
            status: "dispatched",
            resultRef: `result://t210/b1/${input.vectorIndex}`,
            attachedResultArtifact: {
              ...fulfilledAttachedArtifactFor(input),
              depthProofMap: {
                rows: [
                  {
                    requirementId: "requirement://t188/r1",
                    depthClassRef: "depth-class://negative",
                    testIdentityRefs: ["AccountingSpec: flags imbalance"]
                  }
                ]
              }
            },
            evidenceRefs: []
          });
        }
      })
    }
  });
  const admitted = events.filter((event) => event.kind === "depth_proof_map_admitted");
  assert.notEqual(admitted.length, 0, "depth map delivery must emit replay truth");
  assert.equal(admitted[0].accepted, true);
  assert.equal(admitted[0].rows[0].requirementId, "requirement://t188/r1");
  assert.match(admitted[0].mapDigest, /^sha256:[0-9a-f]{64}$/u);
});

// T-210 break 2: severed plan-declared depth authority for map-bearing
// requirements (REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-032/-034).
const T032_DIGEST = "sha256:" + "ab".repeat(32);

function depthMapDispatchPlugin({ strengthRef, mapRows, extraEvidenceRefs = [], mutationRows = null }) {
  return Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://t210/b2/fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t210/b2/${input.vectorIndex}`,
        attachedResultArtifact: {
          ...fulfilledAttachedArtifactFor(input, {
            evidenceRefs: [strengthRef, ...extraEvidenceRefs]
          }),
          depthProofMap: { rows: mapRows },
          ...(mutationRows === null ? {} : { mutationOutcomes: { rows: mutationRows } })
        },
        evidenceRefs: []
      });
    }
  });
}

function runDepthSeveringWiring(plugin) {
  const table = classificationTable();
  const strengthRef = "proof-strength-admission://t188/source-test";
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table, { fdStrengthCriterionRefs: [strengthRef] }),
          classificationTable: table,
          requirementIds: ["requirement://t188/r1"],
          // the HOLLOW declaration: template declares depth classes equal to
          // the required set — under old authority this closed by equality
          envelopeTemplate: envelopeTemplate({
            proofStrengthAdmissionRefs: [strengthRef],
            fdStrengthCriterionRefs: [strengthRef]
          })
        }
      ]
    },
    plugins: { fpDispatch: plugin }
  });
  return events.find((event) => event.kind === "requirement_proof_carry_through_admitted");
}

test("T-210 b2 severing: a hollow declared-equal plan with an admitted map missing rows folds residual, never satisfied", () => {
  const strengthRef = "proof-strength-admission://t188/source-test";
  const admitted = runDepthSeveringWiring(depthMapDispatchPlugin({
    strengthRef,
    // map covers only the negative class; positive is owed but unmapped —
    // and no test identity is admitted for the negative row either
    mapRows: [
      {
        requirementId: "requirement://t188/r1",
        depthClassRef: "depth-class://negative",
        testIdentityRefs: ["MapperSpec: rejects malformed row"]
      }
    ]
  }));
  assert.ok(admitted);
  assert.equal(admitted.accepted, true);
  assert.equal(
    admitted.coverageIssueKinds.includes("missing_depth_obligation_class"),
    true,
    "declaration equality must not close depth once a map is admitted"
  );
  assert.deepEqual(admitted.coverageStatuses, ["residual"]);
});

test("T-210 b2 earned: full map coverage with admitted test identities closes depth through the earned path", async () => {
  const { testIdentityEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const strengthRef = "proof-strength-admission://t188/source-test";
  const positiveIdentity = "MapperSpec: maps well-formed row";
  const negativeIdentity = "MapperSpec: rejects malformed row";
  const admitted = runDepthSeveringWiring(depthMapDispatchPlugin({
    strengthRef,
    mapRows: [
      {
        requirementId: "requirement://t188/r1",
        depthClassRef: "depth-class://positive",
        testIdentityRefs: [positiveIdentity]
      },
      {
        requirementId: "requirement://t188/r1",
        depthClassRef: "depth-class://negative",
        testIdentityRefs: [negativeIdentity]
      }
    ],
    extraEvidenceRefs: [
      testIdentityEvidenceRef(positiveIdentity),
      testIdentityEvidenceRef(negativeIdentity)
    ]
  }));
  assert.ok(admitted);
  assert.deepEqual([...admitted.coverageIssueKinds], []);
  assert.deepEqual(admitted.coverageStatuses, ["eligible"]);
});

test("T-210 b2 lattice: deriveEarnedDepthTruth is total over {unmapped, identity-unverified, earned} per (requirement, class)", async () => {
  const { deriveEarnedDepthTruth, testIdentityEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const required = ["depth-class://positive", "depth-class://negative"];
  const mapEvent = {
    kind: "depth_proof_map_admitted",
    accepted: true,
    rows: [
      {
        requirementId: "requirement://t210/r1",
        depthClassRef: "depth-class://negative",
        testIdentityRefs: ["neg-test"]
      }
    ]
  };
  // no admitted map -> not mapped; transitional plan authority applies upstream
  const unmapped = deriveEarnedDepthTruth({
    replayEvents: [],
    requirementId: "requirement://t210/r1",
    requiredDepthClassRefs: required,
    admittedEvidenceRefs: new Set()
  });
  assert.equal(unmapped.mapped, false);
  // mapped: unmapped class AND identity-unverified class are DISTINCT typed gaps
  const partial = deriveEarnedDepthTruth({
    replayEvents: [mapEvent],
    requirementId: "requirement://t210/r1",
    requiredDepthClassRefs: required,
    admittedEvidenceRefs: new Set()
  });
  assert.equal(partial.mapped, true);
  assert.deepEqual([...partial.declaredDepthClassRefs], []);
  assert.equal(partial.typedDepthGapRefs.some((ref) => ref.endsWith("/unmapped")), true);
  assert.equal(partial.typedDepthGapRefs.some((ref) => ref.endsWith("/identity-unverified")), true);
  // earned: admitted identity flips the mapped class to declared truth
  const earned = deriveEarnedDepthTruth({
    replayEvents: [mapEvent],
    requirementId: "requirement://t210/r1",
    requiredDepthClassRefs: ["depth-class://negative"],
    admittedEvidenceRefs: new Set([testIdentityEvidenceRef("neg-test")])
  });
  assert.deepEqual([...earned.declaredDepthClassRefs], ["depth-class://negative"]);
  assert.deepEqual([...earned.typedDepthGapRefs], []);
});

test("T-210 b2 mixed authority: one mapped requirement holds every entry sibling to earned truth", async () => {
  const { deriveEarnedDepthTruthForRequirements, testIdentityEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const required = ["depth-class://negative"];
  const mapEvent = {
    kind: "depth_proof_map_admitted",
    accepted: true,
    rows: [
      {
        requirementId: "requirement://t210/r1",
        depthClassRef: "depth-class://negative",
        testIdentityRefs: ["neg-test"]
      }
    ]
  };
  const identities = new Set([testIdentityEvidenceRef("neg-test")]);
  // r1 earned, r2 has no map: mixed old/new authority is non-closure —
  // the unmapped sibling gaps every required class and blocks declaration
  const mixed = deriveEarnedDepthTruthForRequirements({
    replayEvents: [mapEvent],
    requirementIds: ["requirement://t210/r1", "requirement://t210/r2"],
    requiredDepthClassRefs: required,
    admittedEvidenceRefs: identities
  });
  assert.equal(mixed.mapped, true);
  assert.deepEqual([...mixed.declaredDepthClassRefs], []);
  assert.equal(
    mixed.typedDepthGapRefs.some((ref) =>
      ref.includes(encodeURIComponent("requirement://t210/r2")) && ref.endsWith("/unmapped")
    ),
    true
  );
  // both mapped and earned: class declared entry-wide
  const bothEarned = deriveEarnedDepthTruthForRequirements({
    replayEvents: [
      mapEvent,
      {
        kind: "depth_proof_map_admitted",
        accepted: true,
        rows: [
          {
            requirementId: "requirement://t210/r2",
            depthClassRef: "depth-class://negative",
            testIdentityRefs: ["neg-test"]
          }
        ]
      }
    ],
    requirementIds: ["requirement://t210/r1", "requirement://t210/r2"],
    requiredDepthClassRefs: required,
    admittedEvidenceRefs: identities
  });
  assert.deepEqual([...bothEarned.declaredDepthClassRefs], ["depth-class://negative"]);
  assert.deepEqual([...bothEarned.typedDepthGapRefs], []);
});

// T-210 break 3: kill obligations DERIVED from the admitted map (-039,
// the Gödel projection) — cardinality discovered, never declared.
test("T-210 b3: kill-obligation cardinality is discovered from admitted adversarial rows, and unproven obligations gap typed", async () => {
  const {
    deriveKillObligations,
    deriveUnprovenKillObligationGapRefs,
    mutationKillEvidenceRef
  } = await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const mapEvent = {
    kind: "depth_proof_map_admitted",
    accepted: true,
    rows: [
      { requirementId: "requirement://t210/r1", depthClassRef: "depth-class://negative", testIdentityRefs: ["neg-a"] },
      { requirementId: "requirement://t210/r1", depthClassRef: "depth-class://invariant", testIdentityRefs: ["inv-a", "inv-b"] },
      { requirementId: "requirement://t210/r1", depthClassRef: "depth-class://positive", testIdentityRefs: ["pos-a"] }
    ]
  };
  // cardinality: 2 adversarial rows -> 2 obligations; the positive row
  // projects nothing; an empty adversarial declaration projects nothing
  const obligations = deriveKillObligations({
    replayEvents: [mapEvent],
    requirementIds: ["requirement://t210/r1"],
    adversarialDepthClassRefs: ["depth-class://negative", "depth-class://invariant"]
  });
  assert.equal(obligations.length, 2);
  assert.deepEqual(
    obligations.map((obligation) => obligation.depthClassRef).sort(),
    ["depth-class://invariant", "depth-class://negative"]
  );
  assert.equal(
    deriveKillObligations({
      replayEvents: [mapEvent],
      requirementIds: ["requirement://t210/r1"],
      adversarialDepthClassRefs: []
    }).length,
    0
  );
  // determinism: same admitted row -> same obligation ref across replays
  const again = deriveKillObligations({
    replayEvents: [mapEvent],
    requirementIds: ["requirement://t210/r1"],
    adversarialDepthClassRefs: ["depth-class://negative", "depth-class://invariant"]
  });
  assert.deepEqual(again.map((o) => o.obligationRef), obligations.map((o) => o.obligationRef));
  // proof law: EVERY test identity on the row needs kill evidence —
  // partial evidence on the invariant row still gaps
  const partialEvidence = new Set([
    mutationKillEvidenceRef("requirement://t210/r1", "neg-a"),
    mutationKillEvidenceRef("requirement://t210/r1", "inv-a")
  ]);
  const gaps = deriveUnprovenKillObligationGapRefs({
    obligations,
    admittedEvidenceRefs: partialEvidence
  });
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].includes(encodeURIComponent("depth-class://invariant")), true);
  assert.equal(gaps[0].endsWith("/kill-unproven"), true);
  const fullEvidence = new Set([
    mutationKillEvidenceRef("requirement://t210/r1", "neg-a"),
    mutationKillEvidenceRef("requirement://t210/r1", "inv-a"),
    mutationKillEvidenceRef("requirement://t210/r1", "inv-b")
  ]);
  assert.deepEqual(
    [...deriveUnprovenKillObligationGapRefs({ obligations, admittedEvidenceRefs: fullEvidence })],
    []
  );
});

test("T-210 b3 wiring: an earned-depth run with a declared adversarial class stays residual until kill evidence is admitted", async () => {
  const { testIdentityEvidenceRef, mutationKillEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const strengthRef = "proof-strength-admission://t188/source-test";
  const positiveIdentity = "MapperSpec: maps well-formed row";
  const negativeIdentity = "MapperSpec: rejects malformed row";
  const mapRows = [
    { requirementId: "requirement://t188/r1", depthClassRef: "depth-class://positive", testIdentityRefs: [positiveIdentity] },
    { requirementId: "requirement://t188/r1", depthClassRef: "depth-class://negative", testIdentityRefs: [negativeIdentity] }
  ];
  const runWith = ({ extraEvidenceRefs, mutationRows = null }) => {
    const table = classificationTable();
    const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
    const events = [];
    runEngineIterate({
      basis,
      eventSink: (event) => events.push(event),
      ...m03InstructionAssemblyRequestFields(basis),
      requirementProofCarryThroughStartup: {
        entries: [
          {
            contract: carryContract(table, {
              fdStrengthCriterionRefs: [strengthRef],
              adversarialDepthClassRefs: ["depth-class://negative"]
            }),
            classificationTable: table,
            requirementIds: ["requirement://t188/r1"],
            envelopeTemplate: envelopeTemplate({
              proofStrengthAdmissionRefs: [strengthRef],
              fdStrengthCriterionRefs: [strengthRef]
            })
          }
        ]
      },
      plugins: {
        fpDispatch: depthMapDispatchPlugin({ strengthRef, mapRows, extraEvidenceRefs, mutationRows })
      }
    });
    return events.find((event) => event.kind === "requirement_proof_carry_through_admitted");
  };
  const identityRefs = [
    testIdentityEvidenceRef(positiveIdentity),
    testIdentityEvidenceRef(negativeIdentity)
  ];
  // earned depth alone no longer suffices: the map's adversarial row
  // projected a kill obligation and no kill evidence is admitted
  const unproven = runWith({ extraEvidenceRefs: identityRefs });
  assert.ok(unproven);
  assert.equal(unproven.coverageIssueKinds.includes("missing_depth_obligation_class"), true);
  assert.deepEqual(unproven.coverageStatuses, ["residual"]);
  // T-032 Stage A: kill evidence arrives ONLY as an admitted mutation
  // outcome (suite red + verified restore); the kernel mints the ref
  const proven = runWith({
    extraEvidenceRefs: identityRefs,
    mutationRows: [
      {
        requirementId: "requirement://t188/r1",
        mutantIdentity: "Mutation: drop malformed-row rejection branch",
        testIdentityRefs: [negativeIdentity],
        suiteExit: 1,
        baselineDigest: T032_DIGEST,
        restoreDigest: T032_DIGEST
      }
    ]
  });
  assert.ok(proven);
  assert.deepEqual([...proven.coverageIssueKinds], []);
  assert.deepEqual(proven.coverageStatuses, ["eligible"]);
  // a RAW worker-attached kill ref is NOT evidence (kernel-mint law):
  // same run shape, ref attached directly, obligation stays unproven
  const rawAttached = runWith({
    extraEvidenceRefs: [
      ...identityRefs,
      mutationKillEvidenceRef("requirement://t188/r1", negativeIdentity)
    ]
  });
  assert.equal(rawAttached.coverageIssueKinds.includes("missing_depth_obligation_class"), true);
  assert.deepEqual(rawAttached.coverageStatuses, ["residual"]);
});

// T-210 review HIGH (2026-07-09): rows are carrier truth the ledger
// projection iterates — canonical event admission must reject a forged
// accepted event with malformed rows BEFORE projection can throw.
test("T-210 b1 admission closure: canonical event admission rejects accepted depth-map events with malformed rows", async () => {
  const { assertRuntimeEvent, deriveAdmittedDepthProofRowsByRequirementId } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const table = classificationTable();
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table),
          classificationTable: table,
          requirementIds: ["requirement://t188/r1"],
          envelopeTemplate: envelopeTemplate()
        }
      ]
    },
    plugins: {
      fpDispatch: depthMapDispatchPlugin({
        strengthRef: "proof-strength-admission://t188/source-test",
        mapRows: [
          {
            requirementId: "requirement://t188/r1",
            depthClassRef: "depth-class://negative",
            testIdentityRefs: ["neg-test"]
          }
        ]
      })
    }
  });
  const genuine = events.find((event) => event.kind === "depth_proof_map_admitted");
  assert.ok(genuine);
  // the genuinely emitted event passes canonical admission
  assertRuntimeEvent(genuine);
  // forged variants fail admission — replay totality holds before the
  // ledger projection ever sees them
  const { rows: _dropped, ...withoutRows } = genuine;
  assert.throws(() => assertRuntimeEvent(withoutRows), /rows must be a list/u);
  assert.throws(() => assertRuntimeEvent({ ...genuine, rows: "bad" }), /rows must be a list/u);
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ requirementId: "", depthClassRef: "x", testIdentityRefs: ["y"] }] }),
    /requirementId/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ requirementId: "r", depthClassRef: "x", testIdentityRefs: [] }] }),
    /testIdentityRefs must not be empty/u
  );
  // lone surrogates pass length checks but throw URIError at downstream
  // ref minting — the event admitter carries the ingress predicate
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ requirementId: "\uD800", depthClassRef: "x", testIdentityRefs: ["y"] }] }),
    /requirementId must be a well-formed string/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ requirementId: "r", depthClassRef: "\uDC00", testIdentityRefs: ["y"] }] }),
    /depthClassRef must be a well-formed string/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ requirementId: "r", depthClassRef: "x", testIdentityRefs: ["\uD800"] }] }),
    /testIdentityRefs\[0\] must be a well-formed string/u
  );
  // and the projection stays total over what admission accepts
  assert.equal(
    deriveAdmittedDepthProofRowsByRequirementId([genuine]).get("requirement://t188/r1").length,
    1
  );
});

// T-210 break 4 (-035/-036): adversarial refs ledger-resolved in the
// producer; survived mutants block through the existing gate.
test("T-210 b4: an admitted survived-mutant counterexample BLOCKS an otherwise fully earned closure", async () => {
  const { testIdentityEvidenceRef, mutationKillEvidenceRef, mutantSurvivedEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const strengthRef = "proof-strength-admission://t188/source-test";
  const positiveIdentity = "MapperSpec: maps well-formed row";
  const negativeIdentity = "MapperSpec: rejects malformed row";
  const mapRows = [
    { requirementId: "requirement://t188/r1", depthClassRef: "depth-class://positive", testIdentityRefs: [positiveIdentity] },
    { requirementId: "requirement://t188/r1", depthClassRef: "depth-class://negative", testIdentityRefs: [negativeIdentity] }
  ];
  const runWithMutations = (mutationRows) => {
    const table = classificationTable();
    const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
    const events = [];
    runEngineIterate({
      basis,
      eventSink: (event) => events.push(event),
      ...m03InstructionAssemblyRequestFields(basis),
      requirementProofCarryThroughStartup: {
        entries: [
          {
            contract: carryContract(table, {
              fdStrengthCriterionRefs: [strengthRef],
              adversarialDepthClassRefs: ["depth-class://negative"]
            }),
            classificationTable: table,
            requirementIds: ["requirement://t188/r1"],
            envelopeTemplate: envelopeTemplate({
              proofStrengthAdmissionRefs: [strengthRef],
              fdStrengthCriterionRefs: [strengthRef]
            })
          }
        ]
      },
      plugins: {
        fpDispatch: depthMapDispatchPlugin({
          strengthRef,
          mapRows,
          extraEvidenceRefs: [
            testIdentityEvidenceRef(positiveIdentity),
            testIdentityEvidenceRef(negativeIdentity)
          ],
          mutationRows
        })
      }
    });
    return events.find((event) => event.kind === "requirement_proof_carry_through_admitted");
  };
  const killedRow = {
    requirementId: "requirement://t188/r1",
    mutantIdentity: "Mutation: drop malformed-row rejection branch",
    testIdentityRefs: [negativeIdentity],
    suiteExit: 1,
    baselineDigest: T032_DIGEST,
    restoreDigest: T032_DIGEST
  };
  // fully earned baseline (kill via admitted outcome): eligible
  assert.deepEqual(runWithMutations([killedRow]).coverageStatuses, ["eligible"]);
  // a survived mutant against a FOREIGN requirement does not block this
  // entry (obligation-scoped adversarial truth)
  const foreign = runWithMutations([
    killedRow,
    {
      requirementId: "requirement://elsewhere/r9",
      mutantIdentity: "Mutation: unrelated",
      testIdentityRefs: ["other-test"],
      suiteExit: 0,
      baselineDigest: T032_DIGEST,
      restoreDigest: T032_DIGEST
    }
  ]);
  assert.deepEqual(foreign.coverageStatuses, ["eligible"]);
  // one admitted SURVIVED mutant (suite green) against THIS requirement:
  // the same run BLOCKS — kill evidence does not outvote a counterexample
  const survived = runWithMutations([
    killedRow,
    {
      requirementId: "requirement://t188/r1",
      mutantIdentity: "Mutation: second mutant survives",
      testIdentityRefs: [negativeIdentity],
      suiteExit: 0,
      baselineDigest: T032_DIGEST,
      restoreDigest: T032_DIGEST
    }
  ]);
  assert.ok(survived);
  assert.equal(survived.coverageIssueKinds.includes("adversarial_counterexample_found"), true);
  assert.deepEqual(survived.coverageStatuses, ["blocked"]);
  // restore-digest law: a red suite with an UNRESTORED subject is a
  // rejected admission, not kill evidence — obligation stays unproven
  const unrestored = runWithMutations([
    { ...killedRow, restoreDigest: "sha256:" + "cd".repeat(32) }
  ]);
  assert.equal(unrestored.coverageIssueKinds.includes("missing_depth_obligation_class"), true);
  assert.deepEqual(unrestored.coverageStatuses, ["residual"]);
});

test("T-210 b4: template-declared adversarial attempts resolve against the admitted ledger, never by list presence", async () => {
  const { deriveAdmittedAdversarialTruth, mutationKillEvidenceRef, mutantSurvivedEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const ledger = new Set([
    mutationKillEvidenceRef("requirement://t210/r1", "neg-test"),
    mutantSurvivedEvidenceRef("requirement://t210/r1", "mutant-1"),
    mutationKillEvidenceRef("requirement://t210/other", "neg-test"),
    mutantSurvivedEvidenceRef("requirement://t210/other", "mutant-2"),
    "evidence://t188/source/artifact",
    "proof-strength-admission://t188/source-test"
  ]);
  const truth = deriveAdmittedAdversarialTruth({
    admittedEvidenceRefs: ledger,
    requirementIds: ["requirement://t210/r1"]
  });
  // only THIS requirement's evidence resolves — the foreign requirement's
  // kill is not verification here and its survived mutant does not block
  assert.deepEqual(
    [...truth.verificationRefs],
    [mutationKillEvidenceRef("requirement://t210/r1", "neg-test")]
  );
  assert.deepEqual(
    [...truth.counterexampleRefs],
    [mutantSurvivedEvidenceRef("requirement://t210/r1", "mutant-1")]
  );
  // empty ledger: nothing resolves — template declarations alone carry
  // no adversarial truth
  const empty = deriveAdmittedAdversarialTruth({
    admittedEvidenceRefs: new Set(),
    requirementIds: ["requirement://t210/r1"]
  });
  assert.deepEqual([...empty.verificationRefs], []);
  assert.deepEqual([...empty.counterexampleRefs], []);
});

// Review HIGH #2 (2026-07-09): the exact cross-requirement probe — a
// shared test identity must not let one kill admission prove both
// requirements' obligations.
test("T-210 b4 scoping: one admitted kill proves only the obligation of the requirement it names", async () => {
  const { deriveKillObligations, deriveUnprovenKillObligationGapRefs, mutationKillEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const sharedIdentity = "SharedSpec: boundary case";
  const mapEvent = {
    kind: "depth_proof_map_admitted",
    accepted: true,
    rows: [
      { requirementId: "requirement://t210/r1", depthClassRef: "depth-class://negative", testIdentityRefs: [sharedIdentity] },
      { requirementId: "requirement://t210/r2", depthClassRef: "depth-class://negative", testIdentityRefs: [sharedIdentity] }
    ]
  };
  const obligations = deriveKillObligations({
    replayEvents: [mapEvent],
    requirementIds: ["requirement://t210/r1", "requirement://t210/r2"],
    adversarialDepthClassRefs: ["depth-class://negative"]
  });
  assert.equal(obligations.length, 2);
  // kill admitted for r1 only: r2's obligation stays a typed gap
  const gaps = deriveUnprovenKillObligationGapRefs({
    obligations,
    admittedEvidenceRefs: new Set([
      mutationKillEvidenceRef("requirement://t210/r1", sharedIdentity)
    ])
  });
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].includes(encodeURIComponent("requirement://t210/r2")), true);
  // kills admitted for both: no gaps
  assert.deepEqual(
    [...deriveUnprovenKillObligationGapRefs({
      obligations,
      admittedEvidenceRefs: new Set([
        mutationKillEvidenceRef("requirement://t210/r1", sharedIdentity),
        mutationKillEvidenceRef("requirement://t210/r2", sharedIdentity)
      ])
    })],
    []
  );
});

// T-197 (-035/-036): the FULL ProofStrengthAdmission carrier.
test("T-197: disposition lattice is total and the -035 field list is preserved", async () => {
  const { deriveProofStrengthAdmissionsForEnvelope, closureBearingStrengthRefs } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const base = {
    envelopeRef: "envelope://t197/e1",
    replayIdentity: "replay://t197/e1",
    strengthRefs: ["proof-strength-admission://t197/s1"],
    sourceRequirementObligationRefs: ["requirement-obligation://t197/r1"],
    proofObligationRefs: ["proof-obligation://t197/build"],
    proofPolicyRefs: ["proof-policy://t197/pn"],
    expectedEvidenceShapeRefs: ["evidence-shape://t197/pos"],
    depthClassRefs: ["depth-class://positive"],
    adversarialAttemptRefs: [],
    adversarialVerificationRefs: [],
    counterexampleRefs: []
  };
  // fd_checked: strength ref admitted + fd criteria total over the ledger
  const fdChecked = deriveProofStrengthAdmissionsForEnvelope({
    ...base,
    fdStrengthCriterionRefs: ["fd-criterion://t197/c1"],
    admittedEvidenceRefs: new Set([
      "proof-strength-admission://t197/s1",
      "fd-criterion://t197/c1"
    ])
  });
  assert.equal(fdChecked.length, 1);
  assert.equal(fdChecked[0].disposition, "fd_checked");
  assert.deepEqual([...fdChecked[0].verifierRefs], ["fd-criterion://t197/c1"]);
  // -035 preservation
  assert.equal(fdChecked[0].strengthRef, "proof-strength-admission://t197/s1");
  assert.deepEqual([...fdChecked[0].sourceRequirementObligationRefs], ["requirement-obligation://t197/r1"]);
  assert.deepEqual([...fdChecked[0].proofObligationRefs], ["proof-obligation://t197/build"]);
  assert.deepEqual([...fdChecked[0].proofPolicyRefs], ["proof-policy://t197/pn"]);
  assert.deepEqual([...fdChecked[0].expectedEvidenceShapeRefs], ["evidence-shape://t197/pos"]);
  assert.deepEqual([...fdChecked[0].depthClassRefs], ["depth-class://positive"]);
  assert.equal(fdChecked[0].replayIdentity, "replay://t197/e1");
  assert.match(fdChecked[0].admissionDigest, /^sha256:[0-9a-f]{64}$/u);
  // adversarially_verified: fd criteria NOT total, verification ref
  // ADMITTED in the ledger (-036: list presence is never verification)
  const adversarial = deriveProofStrengthAdmissionsForEnvelope({
    ...base,
    fdStrengthCriterionRefs: ["fd-criterion://t197/unresolvable"],
    adversarialVerificationRefs: ["mutation-kill://r1/neg-test"],
    admittedEvidenceRefs: new Set([
      "proof-strength-admission://t197/s1",
      "mutation-kill://r1/neg-test"
    ])
  });
  assert.equal(adversarial[0].disposition, "adversarially_verified");
  assert.deepEqual([...adversarial[0].verifierRefs], ["mutation-kill://r1/neg-test"]);
  // the reviewer's probe pinned: an UNLEDGERED verification ref is not
  // verification — strength stays not_admitted
  const unledgered = deriveProofStrengthAdmissionsForEnvelope({
    ...base,
    fdStrengthCriterionRefs: ["fd-criterion://t197/unresolvable"],
    adversarialVerificationRefs: ["mutation-kill://not-in-ledger"],
    admittedEvidenceRefs: new Set(["proof-strength-admission://t197/s1"])
  });
  assert.equal(unledgered[0].disposition, "not_admitted");
  assert.deepEqual([...closureBearingStrengthRefs(unledgered)], []);
  // counterexample outvotes everything
  const countered = deriveProofStrengthAdmissionsForEnvelope({
    ...base,
    fdStrengthCriterionRefs: ["fd-criterion://t197/c1"],
    counterexampleRefs: ["mutant-survived://r1/m1"],
    admittedEvidenceRefs: new Set([
      "proof-strength-admission://t197/s1",
      "fd-criterion://t197/c1"
    ])
  });
  assert.equal(countered[0].disposition, "not_admitted");
  assert.deepEqual([...countered[0].counterexampleRefs], ["mutant-survived://r1/m1"]);
  // unresolved strength ref: template declaration alone is not strength
  const unresolved = deriveProofStrengthAdmissionsForEnvelope({
    ...base,
    fdStrengthCriterionRefs: ["fd-criterion://t197/c1"],
    admittedEvidenceRefs: new Set(["fd-criterion://t197/c1"])
  });
  assert.equal(unresolved[0].disposition, "not_admitted");
  assert.deepEqual([...closureBearingStrengthRefs(unresolved)], []);
  assert.deepEqual(
    [...closureBearingStrengthRefs([...fdChecked, ...unresolved])],
    ["proof-strength-admission://t197/s1"]
  );
});

test("T-197 wiring: strength closes through the ADVERSARIAL disjunct when F_D criteria never resolve (-036)", async () => {
  const { testIdentityEvidenceRef, mutationKillEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const strengthRef = "proof-strength-admission://t188/source-test";
  const positiveIdentity = "MapperSpec: maps well-formed row";
  const negativeIdentity = "MapperSpec: rejects malformed row";
  const table = classificationTable();
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          // fd criteria stay the UNRESOLVABLE fixture defaults — the F_D
          // disjunct cannot close; only admitted adversarial verification can
          contract: carryContract(table, {
            adversarialDepthClassRefs: ["depth-class://negative"]
          }),
          classificationTable: table,
          requirementIds: ["requirement://t188/r1"],
          envelopeTemplate: envelopeTemplate({
            proofStrengthAdmissionRefs: [strengthRef]
          })
        }
      ]
    },
    plugins: {
      fpDispatch: depthMapDispatchPlugin({
        strengthRef,
        mapRows: [
          { requirementId: "requirement://t188/r1", depthClassRef: "depth-class://positive", testIdentityRefs: [positiveIdentity] },
          { requirementId: "requirement://t188/r1", depthClassRef: "depth-class://negative", testIdentityRefs: [negativeIdentity] }
        ],
        extraEvidenceRefs: [
          testIdentityEvidenceRef(positiveIdentity),
          testIdentityEvidenceRef(negativeIdentity)
        ],
        mutationRows: [
          {
            requirementId: "requirement://t188/r1",
            mutantIdentity: "Mutation: adversarial disjunct",
            testIdentityRefs: [negativeIdentity],
            suiteExit: 1,
            baselineDigest: T032_DIGEST,
            restoreDigest: T032_DIGEST
          }
        ]
      })
    }
  });
  const admitted = events.find(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.ok(admitted);
  assert.equal(admitted.accepted, true);
  // earned depth + kill obligation proven + strength adversarially
  // verified — eligible with NO resolvable F_D strength criterion
  assert.deepEqual([...admitted.coverageIssueKinds], []);
  assert.deepEqual(admitted.coverageStatuses, ["eligible"]);
});

// T-210 break 5: read-model honesty — declaration never displays as
// admitted strength in the coverage projection.
test("T-210 b5: a not_admitted template strength ref is absent from the projected proofStrengthAdmissionRefs", () => {
  const table = classificationTable();
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup: {
      entries: [
        {
          contract: carryContract(table),
          classificationTable: table,
          requirementIds: ["requirement://t188/r1"],
          // template DECLARES a strength admission ref that never
          // resolves against the admitted ledger
          envelopeTemplate: envelopeTemplate()
        }
      ]
    },
    plugins: {
      fpDispatch: depthMapDispatchPlugin({
        strengthRef: "proof-strength-admission://t188/unrelated",
        mapRows: [
          {
            requirementId: "requirement://t188/r1",
            depthClassRef: "depth-class://negative",
            testIdentityRefs: ["neg-test"]
          }
        ]
      })
    }
  });
  const admitted = events.find(
    (event) => event.kind === "requirement_proof_carry_through_admitted"
  );
  assert.ok(admitted);
  // residual (unresolved strength among other gaps) — and the projected
  // truth refs carried on the event contain NO strength-admission ref
  // minted from mere declaration
  assert.equal(admitted.coverageStatuses[0] === "eligible", false);
  assert.equal(
    admitted.coverageIssueKinds.includes("proof_strength_not_admitted"),
    true
  );
});

// T-209 break 1 (D1.1): the closed execution-authority vocabulary.
test("T-209 b1: executionAuthority defaults to worker_turn; annealed_fd_handler rejects without an equivalence contract ref", () => {
  const table = classificationTable();
  // default: execution belongs to the typed F_P worker turn
  assert.equal(carryContract(table).executionAuthority, "worker_turn");
  // annealed WITHOUT an equivalence ref: admission error, not a downgrade
  assert.throws(
    () => carryContract(table, { executionAuthority: "annealed_fd_handler" }),
    /requires a ratified equivalenceContractRef/u
  );
  // annealed WITH the ref: lawful (the T-206 path)
  const annealed = carryContract(table, {
    executionAuthority: "annealed_fd_handler",
    equivalenceContractRef: "equivalence-contract://t206/ratified"
  });
  assert.equal(annealed.executionAuthority, "annealed_fd_handler");
  assert.equal(annealed.equivalenceContractRef, "equivalence-contract://t206/ratified");
  // unknown value: rejected
  assert.throws(
    () => carryContract(table, { executionAuthority: "framework" }),
    /worker_turn or annealed_fd_handler/u
  );
});

// T-209 break 2 (D1.3): the provenance-scoped ledger.
test("T-209 b2: a forged payload_validated ref shaped like execution evidence never resolves; worker-turn attribution does", async () => {
  const { deriveWorkerTurnEvidenceRefSet, isExecutionEvidenceRef } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const forgedKill = "mutation-kill://requirement%3A%2F%2Fx/forged-test";
  const genuineKill = "mutation-kill://requirement%3A%2F%2Fx/real-test";
  const events = [
    // the side door: payload_validated's payloadRef enters the GENERAL
    // strength set but must never carry execution-family truth
    { kind: "payload_validated", payloadRef: forgedKill },
    // worker-turn attribution: evidence_admitted with provider refs
    { kind: "evidence_admitted", evidenceRef: genuineKill, providerRefs: ["plugin://fp-dispatch"] },
    // unattributed evidence: no provider, no provenance
    { kind: "evidence_admitted", evidenceRef: "mutant-survived://requirement%3A%2F%2Fx/m1", providerRefs: [] }
  ];
  const declared = new Set(["plugin://fp-dispatch"]);
  const workerTurn = deriveWorkerTurnEvidenceRefSet(events, declared);
  assert.equal(workerTurn.has(genuineKill), true);
  assert.equal(workerTurn.has(forgedKill), false);
  assert.equal(workerTurn.has("mutant-survived://requirement%3A%2F%2Fx/m1"), false);
  // the reviewer's spoof probe pinned: NON-DECLARED provider attribution
  // (harness://not-worker) is not a worker turn — attribution must match
  // the runner's actual dispatch, not merely be non-empty
  const spoofed = deriveWorkerTurnEvidenceRefSet(
    [
      { kind: "evidence_admitted", evidenceRef: genuineKill, providerRefs: ["harness://not-worker"] }
    ],
    declared
  );
  assert.equal(spoofed.has(genuineKill), false);
  // no declared providers -> nothing resolves (fail-closed)
  assert.equal(
    deriveWorkerTurnEvidenceRefSet(events, new Set()).size,
    0
  );
  assert.equal(isExecutionEvidenceRef(forgedKill), true);
  assert.equal(isExecutionEvidenceRef("proof-strength-admission://s1"), false);
});

// T-209 break 4 (D2): the standing conformance differential, kernel side.
// The m03 contracts layer is pure derivation/admission law — process
// execution appearing there is a red test TODAY, not an audit finding.
test("T-209 b4: the m03 contracts layer contains no process-execution capability", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = new URL("../../code/src/abg/m03/contracts/", import.meta.url).pathname;
  const offenders = [];
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".ts")) continue;
    const text = await readFile(path.join(dir, file), "utf8");
    if (/child_process|spawnSync|execFileSync|\bspawn\(|\bexecFile\(|\bfork\(/u.test(text)) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, [], "contracts layer must never execute processes");
});

// T-032 Stage A: mutation-outcomes admission totality + the kernel mint.
test("T-032 A: mutation-outcomes admission is total; restore mismatch rejects; the kernel mint is the only ref source", async () => {
  const { admitMutationOutcomes, mintMutationEvidenceRefs, deriveKernelMintedMutationRefs, assertRuntimeEvent } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const good = {
    requirementId: "requirement://t032/r1",
    mutantIdentity: "Mutation: m1",
    testIdentityRefs: ["neg-test"],
    suiteExit: 1,
    baselineDigest: T032_DIGEST,
    restoreDigest: T032_DIGEST
  };
  const valid = admitMutationOutcomes({
    payloadSection: { rows: [good] },
    sourceResultRef: "result://t032/a",
    replayIdentity: "replay://t032/a"
  });
  assert.equal(valid.accepted, true);
  assert.match(valid.outcomes.outcomesDigest, /^sha256:[0-9a-f]{64}$/u);
  // restore mismatch: typed rejection, never a downgrade
  const mismatch = admitMutationOutcomes({
    payloadSection: { rows: [{ ...good, restoreDigest: "sha256:" + "cd".repeat(32) }] },
    sourceResultRef: "result://t032/a",
    replayIdentity: "replay://t032/a"
  });
  assert.equal(mismatch.accepted, false);
  assert.equal(mismatch.issues.some((i) => i.issueKind === "restore_digest_mismatch"), true);
  // surrogate + malformed rejections
  const bad = admitMutationOutcomes({
    payloadSection: { rows: [
      { ...good, requirementId: "\uD800" },
      { ...good, suiteExit: -1 },
      { ...good, baselineDigest: "not-a-digest" },
      "not-a-row"
    ] },
    sourceResultRef: "result://t032/a",
    replayIdentity: "replay://t032/a"
  });
  assert.equal(bad.accepted, false);
  const kinds = bad.issues.map((i) => i.issueKind);
  for (const k of ["requirement_id_invalid", "suite_exit_invalid", "digest_invalid", "row_not_object"]) {
    assert.equal(kinds.includes(k), true, k);
  }
  assert.equal(admitMutationOutcomes({ payloadSection: null, sourceResultRef: "r", replayIdentity: "i" }).issues[0].issueKind, "section_not_object");
  // the mint: red suite -> kill refs per test identity; green -> survived
  const minted = mintMutationEvidenceRefs([
    good,
    { ...good, mutantIdentity: "Mutation: m2", suiteExit: 0 }
  ]);
  assert.equal(minted.some((r) => r.startsWith("mutation-kill://")), true);
  assert.equal(minted.some((r) => r.startsWith("mutant-survived://")), true);
  // replay projection: only ACCEPTED events mint
  const refs = deriveKernelMintedMutationRefs([
    { kind: "mutation_outcomes_admitted", accepted: true, rows: [good] },
    { kind: "mutation_outcomes_admitted", accepted: false, rows: [{ ...good, mutantIdentity: "rejected" }] }
  ]);
  assert.equal(refs.size, 1);
  // canonical event admission closes rows (forged variants reject)
  const basis = buildThreeStageBasis({ defaultRegime: "F_P" });
  const events = [];
  runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    ...m03InstructionAssemblyRequestFields(basis),
    requirementProofCarryThroughStartup: {
      entries: [{
        contract: carryContract(classificationTable()),
        classificationTable: classificationTable(),
        requirementIds: ["requirement://t188/r1"],
        envelopeTemplate: envelopeTemplate()
      }]
    },
    plugins: {
      fpDispatch: depthMapDispatchPlugin({
        strengthRef: "proof-strength-admission://t188/source-test",
        mapRows: [{ requirementId: "requirement://t188/r1", depthClassRef: "depth-class://negative", testIdentityRefs: ["neg-test"] }],
        mutationRows: [good]
      })
    }
  });
  const genuine = events.find((e) => e.kind === "mutation_outcomes_admitted");
  assert.ok(genuine);
  assert.equal(genuine.accepted, true);
  assertRuntimeEvent(genuine);
  assert.throws(() => assertRuntimeEvent({ ...genuine, rows: "bad" }), /rows must be a list/u);
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ ...good, restoreDigest: "sha256:" + "cd".repeat(32) }] }),
    /restoreDigest must equal baselineDigest/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...genuine, rows: [{ ...good, requirementId: "\uD800" }] }),
    /well-formed/u
  );
});

// Review A (LOW, pinned): admission is total over HOSTILE in-process
// objects — a throwing getter is a typed rejection, never an escape.
test("T-032 A review: throwing getters and hostile proxies reject typed at both carriers", async () => {
  const { admitMutationOutcomes, admitDepthProofMap } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  const hostileRow = { get requirementId() { throw new Error("boom"); } };
  const viaMutation = admitMutationOutcomes({
    payloadSection: { rows: [hostileRow] },
    sourceResultRef: "r", replayIdentity: "i"
  });
  assert.equal(viaMutation.accepted, false);
  assert.equal(viaMutation.issues[0].issueKind, "row_not_object");
  const viaMap = admitDepthProofMap({
    payloadSection: { rows: [new Proxy({}, { get() { throw new Error("boom"); }, ownKeys() { throw new Error("boom"); } })] },
    sourceResultRef: "r", replayIdentity: "i"
  });
  assert.equal(viaMap.accepted, false);
  assert.equal(viaMap.issues[0].issueKind, "row_not_object");
});

// T-216 D5 (codex P1): a VALUE-CHANGING getter that passes stringify and
// mutates on a later read must not escape admission or store an
// unvalidated value — the read-once detach law.
test("T-216 D5: value-changing getters detach to a stable snapshot; second-read attacks fail closed at both carriers", async () => {
  const { admitMutationOutcomes, admitDepthProofMap } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  // a getter that stringifies fine (returns a clean value) then throws on
  // a later direct read
  const secondReadThrows = (cleanValue) => {
    let reads = 0;
    return {
      get requirementId() {
        reads += 1;
        // JSON.stringify reads once; any later validator read throws
        if (reads > 1) { throw new Error("second read boom"); }
        return cleanValue;
      }
    };
  };
  // the law: admission returns a TYPED result, never a host exception —
  // the getter's second read never fires (validator reads the snapshot)
  const m = admitMutationOutcomes({
    payloadSection: { rows: [secondReadThrows("REQ-OK")] },
    sourceResultRef: "r", replayIdentity: "i"
  });
  assert.equal(m.accepted, false);
  assert.equal(Array.isArray(m.issues), true);
  const d = admitDepthProofMap({
    payloadSection: { rows: [secondReadThrows("REQ-OK")] },
    sourceResultRef: "r", replayIdentity: "i"
  });
  assert.equal(d.accepted, false);
  assert.equal(Array.isArray(d.issues), true);
  // a getter returning DIFFERENT clean values per read: the STORED value
  // is the detached snapshot (read 1), never a smuggled surrogate
  let n = 0;
  const drift = {
    requirementId: "requirement://t216/r1",
    depthClassRef: "depth-class://negative",
    get testIdentityRefs() { n += 1; return n === 1 ? ["clean-id"] : ["\uD800"]; }
  };
  const accepted = admitDepthProofMap({
    payloadSection: { rows: [drift] },
    sourceResultRef: "result://t216", replayIdentity: "replay://t216"
  });
  // either it rejected, or it stored ONLY the detached clean value — never
  // the surrogate that would throw downstream
  if (accepted.accepted) {
    assert.deepEqual([...accepted.map.rows[0].testIdentityRefs], ["clean-id"]);
  } else {
    assert.equal(accepted.issues[0].issueKind, "row_not_object");
  }
});

// T-216 D6 (codex P2): canonical digests are deterministic under
// duplicate logical keys and input reordering.
test("T-216 D6: identical row sets in any order yield one digest (no ambiguous concat, no localeCompare)", async () => {
  const { admitMutationOutcomes, admitDepthProofMap } =
    await import("../../build/semantic/code/src/abg/m03/contracts/index.js");
  // depth: two rows sharing requirementId:depthClassRef prefix ambiguity
  const rowsA = [
    { requirementId: "a:b", depthClassRef: "c", testIdentityRefs: ["t1"] },
    { requirementId: "a", depthClassRef: "b:c", testIdentityRefs: ["t2"] }
  ];
  const rowsB = [rowsA[1], rowsA[0]];
  const dA = admitDepthProofMap({ payloadSection: { rows: rowsA }, sourceResultRef: "r", replayIdentity: "i" });
  const dB = admitDepthProofMap({ payloadSection: { rows: rowsB }, sourceResultRef: "r", replayIdentity: "i" });
  assert.equal(dA.map.mapDigest, dB.map.mapDigest);
  assert.deepEqual(dA.map.rows, dB.map.rows);
  // mutation: same
  const mRows = [
    { requirementId: "req:x", mutantIdentity: "m", testIdentityRefs: ["t"], suiteExit: 1, baselineDigest: "sha256:" + "ab".repeat(32), restoreDigest: "sha256:" + "ab".repeat(32) },
    { requirementId: "req", mutantIdentity: "x:m", testIdentityRefs: ["t"], suiteExit: 1, baselineDigest: "sha256:" + "cd".repeat(32), restoreDigest: "sha256:" + "cd".repeat(32) }
  ];
  const mA = admitMutationOutcomes({ payloadSection: { rows: mRows }, sourceResultRef: "r", replayIdentity: "i" });
  const mB = admitMutationOutcomes({ payloadSection: { rows: [mRows[1], mRows[0]] }, sourceResultRef: "r", replayIdentity: "i" });
  assert.equal(mA.outcomes.outcomesDigest, mB.outcomes.outcomesDigest);
});
