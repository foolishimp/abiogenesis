// Implements: T-188 (fold-gating slices 2-3: M5 producer + B2 consumer wiring differential)
// Implements: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-013
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
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

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

function fulfilledArtifact(input, evidenceRefs) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "attached worker result accepted",
      blocking_reasons: [],
      evidence_refs: evidenceRefs ?? [`proof://${assessmentId}`]
    })),
    selected_worker_id: input.workerId,
    selected_backend: input.backendId,
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: input.resolvedRuntimeRef
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
        attachedResultArtifact: fulfilledArtifact(input),
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
        attachedResultArtifact: fulfilledArtifact(input, [strengthRef]),
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
