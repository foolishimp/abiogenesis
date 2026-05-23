// Validates: T-145
// Validates: REQ-L-GTL3-COMPUTE-NOTATION
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructEvaluationRuleDeclaration,
  constructEvaluationRuleOutcome,
  constructEvaluationSetAdmission,
  constructEvaluationSetPlan,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  defaultFpEvaluatorPlugin,
  runEngineIterate,
  runEngineIterateAsync
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function pluginContract(pluginKind, ref, outputCarrier) {
  return constructEnginePluginContract({
    ref,
    pluginKind,
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier
  });
}

function attachedArtifact(input) {
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
      fulfillment_detail: "T-145 transform output accepted",
      blocking_reasons: [],
      evidence_refs: [`proof://t145/${assessmentId}`]
    })),
    selected_worker_id: "worker://t145",
    selected_backend: "backend://node",
    role_id: "role://t145",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function fpDispatchPlugin(ref = "plugin://t145/fp-dispatch") {
  return Object.freeze({
    contract: pluginContract("fp_dispatch", ref, "FpDispatchOutcome"),
    dispatch(input) {
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t145/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function fdEvaluatorPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: pluginContract("fd_evaluator", "plugin://t145/fd", "FdEvaluationOutcome"),
    evaluate(input) {
      observe(input);
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function findingForInput(input, findingRef = "finding://t145/fp") {
  return constructFpEvaluationFinding({
    findingRef: `${findingRef}/${input.vectorIndex}`,
    evaluatorRef: input.contract.ref,
    gainReportRef: `gain://t145/${input.vectorIndex}`,
    metricRefs: [`metric://t145/${input.vectorIndex}`],
    closeDisposition: "close",
    evidenceRefs: [`evidence://t145/fp/${input.vectorIndex}`],
    authorityRefs: Object.freeze([
      ...new Set([
        ...input.expectedAssessmentIds,
        `authority://t145/fp/${input.vectorIndex}`
      ])
    ]),
    compositionContributionRef:
      input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
    compositionRef: input.selectedCompositionRef,
    compositionDigest: input.selectedCompositionDigest
  });
}

function fpEvaluatorPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: pluginContract("fp_evaluator", "plugin://t145/fp-evaluator", "FpEvaluationOutcome"),
    evaluate(input) {
      observe(input);
      return constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [findingForInput(input)],
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function registerRulePlugin(input) {
  const contract = pluginContract(
    "fd_evaluator",
    input.contractRef ?? `plugin://t145/register/${input.ruleRef}`,
    "EvaluationRuleOutcome"
  );
  return Object.freeze({
    contract,
    ruleRef: input.ruleRef,
    ruleRole: "register",
    required: input.required ?? true,
    parallelGroupRef: input.parallelGroupRef ?? null,
    dependencyRefs: input.dependencyRefs ?? [],
    outputCarrierRefs: ["EvaluationRuleOutcome"],
    evaluate(pluginInput) {
      input.observe?.(pluginInput);
      return constructEvaluationRuleOutcome({
        status: input.status ?? "accepted",
        ruleRef: input.ruleRef,
        ruleRole: "register",
        computeMeans: "F_D",
        producedRegisterRefs:
          input.status === "blocked"
            ? []
            : [`register://t145/${input.ruleRef}`],
        evidenceRefs:
          input.status === "blocked"
            ? []
            : [`evidence://t145/${input.ruleRef}`],
        diagnosticRefs: input.diagnosticRefs ?? [],
        selectedCompositionRef: pluginInput.selectedCompositionRef,
        selectedCompositionDigest: pluginInput.selectedCompositionDigest,
        selectedCompositionSelectionRef:
          pluginInput.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
        compositionContributionRef:
          pluginInput.selectedRegimeBindingRef ??
          pluginInput.selectedCompositionRef,
        reason: input.reason ?? null
      });
    }
  });
}

function firstFpBasis() {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    dispatchRef: "dispatch://t145"
  });
}

function firstFdBasis() {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_D", "F_D", "F_D"],
    dispatchRef: null
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test("T-145 scalar F_P evaluator remains a one-rule evaluation-set reduction", () => {
  const basis = firstFpBasis();
  const events = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fpEvaluator: defaultFpEvaluatorPlugin,
      fdEvaluator: fdEvaluatorPlugin()
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "evaluation_rule_outcome" &&
        event.vectorIndex === 0
    ).length,
    1
  );
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "fp_evaluation_finding" &&
        event.vectorIndex === 0
    ).length,
    1
  );
});

test("T-145 F_D register rules are admitted before final F_P semantic judgment", () => {
  const basis = firstFpBasis();
  const events = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      evaluationRules: [
        registerRulePlugin({ ruleRef: "evaluation-rule://t145/register/a" }),
        registerRulePlugin({ ruleRef: "evaluation-rule://t145/register/b" })
      ]
    }
  });

  const observedPayloadClasses = events
    .filter((event) => event.kind === "payload_observed" && event.vectorIndex === 0)
    .map((event) => event.payloadClass);
  const evaluationRuleIndexes = observedPayloadClasses.flatMap(
    (payloadClass, index) =>
      payloadClass === "evaluation_rule_outcome" ? [index] : []
  );
  const fpEvaluationFindingIndex = observedPayloadClasses.indexOf(
    "fp_evaluation_finding"
  );
  const closureInput = events.find(
    (event) => event.kind === "closure_input_published"
  );

  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(evaluationRuleIndexes.length, 3);
  assert.notEqual(fpEvaluationFindingIndex, -1);
  assert.equal(
    evaluationRuleIndexes.every((index) => index < fpEvaluationFindingIndex),
    true
  );
  assert.equal(
    closureInput.sourceProjectionRefs.some((ref) =>
      ref.startsWith("evaluation-set-projection:")
    ),
    true
  );
});

test("T-145 F_D advance uses evaluation-set register phase before scalar F_D authority", () => {
  const basis = firstFdBasis();
  const events = [];
  const observedOrder = [];
  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fdEvaluator: fdEvaluatorPlugin((input) =>
        observedOrder.push(`fd:${input.vectorIndex}`)
      ),
      evaluationRules: [
        registerRulePlugin({
          ruleRef: "evaluation-rule://t145/fd-register",
          observe: (input) =>
            observedOrder.push(`register:${input.vectorIndex}`)
        })
      ]
    }
  });

  assert.equal(result.transition.terminalKind, "converged");
  for (const vectorIndex of [0, 1, 2]) {
    assert.equal(
      observedOrder.indexOf(`register:${vectorIndex}`) <
        observedOrder.indexOf(`fd:${vectorIndex}`),
      true
    );
  }
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "evaluation_rule_outcome" &&
        event.vectorIndex === 0
    ).length,
    2
  );
});

test("T-145 dependent evaluation rules can read admitted predecessor refs", () => {
  const firstRuleRef = "evaluation-rule://t145/dependent-input/first";
  const secondRuleRef = "evaluation-rule://t145/dependent-input/second";
  let secondInput = null;
  const result = runEngineIterate({
    basis: firstFpBasis(),
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      evaluationRules: [
        registerRulePlugin({ ruleRef: firstRuleRef }),
        registerRulePlugin({
          ruleRef: secondRuleRef,
          dependencyRefs: [firstRuleRef],
          observe: (input) => {
            secondInput = input;
          }
        })
      ]
    }
  });

  assert.equal(result.transition.terminalKind, "converged");
  assert.notEqual(secondInput, null);
  assert.equal(
    secondInput.stageSetDependencyRefs.some((ref) => ref.includes(firstRuleRef)),
    true
  );
});

test("T-145 parallel register batches replay in stable rule-ref order", () => {
  const basis = firstFpBasis();
  const observedRuleRefs = [];
  const rules = Array.from({ length: 128 }, (_, index) => {
    const padded = String(127 - index).padStart(3, "0");
    const ruleRef = `evaluation-rule://t145/parallel/${padded}`;
    return registerRulePlugin({
      ruleRef,
      parallelGroupRef: "evaluation-rule-group://t145/read-only-registers",
      observe: (input) =>
        observedRuleRefs.push(
          Object.freeze({ vectorIndex: input.vectorIndex, ruleRef })
        )
    });
  });

  const result = runEngineIterate({
    basis,
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      evaluationRules: rules
    }
  });

  assert.equal(result.transition.terminalKind, "converged");
  for (const vectorIndex of new Set(observedRuleRefs.map((row) => row.vectorIndex))) {
    const ruleRefs = observedRuleRefs
      .filter((row) => row.vectorIndex === vectorIndex)
      .map((row) => row.ruleRef);
    assert.deepEqual(
      ruleRefs,
      [...ruleRefs].sort((left, right) => left.localeCompare(right))
    );
  }
});

test("T-145 async parallel register batches invoke concurrently and admit stably", async () => {
  const basis = firstFpBasis();
  const events = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const rules = [30, 10, 20].map((delayMs, index) => {
    const ruleRef = `evaluation-rule://t145/async/${String(2 - index).padStart(2, "0")}`;
    return Object.freeze({
      contract: pluginContract(
        "fd_evaluator",
        `plugin://t145/async-register/${index}`,
        "EvaluationRuleOutcome"
      ),
      ruleRef,
      ruleRole: "register",
      required: true,
      parallelGroupRef: "evaluation-rule-group://t145/async-registers",
      outputCarrierRefs: ["EvaluationRuleOutcome"],
      async evaluate(pluginInput) {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await delay(delayMs);
        inFlight -= 1;
        return constructEvaluationRuleOutcome({
          status: "accepted",
          ruleRef,
          ruleRole: "register",
          computeMeans: "F_D",
          producedRegisterRefs: [`register://t145/${ruleRef}`],
          evidenceRefs: [`evidence://t145/${ruleRef}`],
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef
        });
      }
    });
  });

  const result = await runEngineIterateAsync({
    basis,
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      evaluationRules: rules
    }
  });
  const admittedRuleRefs = events
    .filter(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "evaluation_rule_outcome" &&
        event.producerRef.startsWith("plugin://t145/async-register/")
    )
    .map((event) =>
      Object.freeze({ vectorIndex: event.vectorIndex, ruleRef: event.authorityRef })
    );

  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(maxInFlight > 1, true);
  for (const vectorIndex of new Set(admittedRuleRefs.map((row) => row.vectorIndex))) {
    const ruleRefs = admittedRuleRefs
      .filter((row) => row.vectorIndex === vectorIndex)
      .map((row) => row.ruleRef);
    assert.deepEqual(
      ruleRefs,
      [...ruleRefs].sort((left, right) => left.localeCompare(right))
    );
  }
});

test("T-145 missing required evaluation rule blocks closure", () => {
  const basis = firstFpBasis();
  let fpEvaluateCount = 0;
  const result = runEngineIterate({
    basis,
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(() => {
        fpEvaluateCount += 1;
      }),
      requiredEvaluationRuleRefs: [
        "evaluation-rule://t145/missing-required-register"
      ]
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(
    result.transition.reason,
    /missing:evaluation-rule:\/\/t145\/missing-required-register/u
  );
  assert.equal(fpEvaluateCount, 0);
});

test("T-145 missing required evaluation rule blocks scalar F_D authority", () => {
  const basis = firstFdBasis();
  let fdEvaluateCount = 0;
  const result = runEngineIterate({
    basis,
    eventSink: () => undefined,
    plugins: {
      fdEvaluator: fdEvaluatorPlugin(() => {
        fdEvaluateCount += 1;
      }),
      requiredEvaluationRuleRefs: [
        "evaluation-rule://t145/missing-fd-required-register"
      ]
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(
    result.transition.reason,
    /missing:evaluation-rule:\/\/t145\/missing-fd-required-register/u
  );
  assert.equal(fdEvaluateCount, 0);
});

test("T-145 evaluation-set dependency refs must be declared in earlier batches", () => {
  const base = Object.freeze({
    selectedCompositionRef: "composition://t145/dependency",
    selectedCompositionDigest: "sha256:t145-dependency",
    selectedCompositionSelectionRef: "composition-selection://t145/dependency",
    selectedRegimeBindingRef: "regime-binding://t145/dependency/fd",
    computeMeans: "F_D"
  });
  const first = constructEvaluationRuleDeclaration({
    ...base,
    ruleRef: "evaluation-rule://t145/dependency/first"
  });
  const second = constructEvaluationRuleDeclaration({
    ...base,
    ruleRef: "evaluation-rule://t145/dependency/second",
    dependencyRefs: [first.ruleRef]
  });
  const sameBatchDependent = constructEvaluationRuleDeclaration({
    ...base,
    ruleRef: "evaluation-rule://t145/dependency/same-batch",
    dependencyRefs: [first.ruleRef]
  });
  const unknownDependent = constructEvaluationRuleDeclaration({
    ...base,
    ruleRef: "evaluation-rule://t145/dependency/unknown",
    dependencyRefs: ["evaluation-rule://t145/dependency/missing"]
  });

  assert.doesNotThrow(() =>
    constructEvaluationSetPlan({
      basisId: "basis://t145/dependency",
      graphFunctionId: "graph-function://t145/dependency",
      vectorIndex: 0,
      edge: "input→output",
      selectedCompositionRef: base.selectedCompositionRef,
      selectedCompositionDigest: base.selectedCompositionDigest,
      selectedCompositionSelectionRef: base.selectedCompositionSelectionRef,
      ruleBatches: [[first], [second]]
    })
  );
  assert.throws(
    () =>
      constructEvaluationSetPlan({
        basisId: "basis://t145/dependency",
        graphFunctionId: "graph-function://t145/dependency",
        vectorIndex: 0,
        edge: "input→output",
        selectedCompositionRef: base.selectedCompositionRef,
        selectedCompositionDigest: base.selectedCompositionDigest,
        selectedCompositionSelectionRef: base.selectedCompositionSelectionRef,
        ruleBatches: [[first, sameBatchDependent]]
      }),
    /must reference an earlier evaluation-set batch/u
  );
  assert.throws(
    () =>
      constructEvaluationSetPlan({
        basisId: "basis://t145/dependency",
        graphFunctionId: "graph-function://t145/dependency",
        vectorIndex: 0,
        edge: "input→output",
        selectedCompositionRef: base.selectedCompositionRef,
        selectedCompositionDigest: base.selectedCompositionDigest,
        selectedCompositionSelectionRef: base.selectedCompositionSelectionRef,
        ruleBatches: [[unknownDependent]]
      }),
    /contains unknown rule/u
  );
});

test("T-145 evaluation-set carriers reject undeclared and mismatched truth", () => {
  const declaration = constructEvaluationRuleDeclaration({
    ruleRef: "evaluation-rule://t145/carrier/register",
    ruleRole: "register",
    selectedCompositionRef: "composition://t145/carrier",
    selectedCompositionDigest: "sha256:t145-carrier",
    selectedCompositionSelectionRef: "composition-selection://t145/carrier",
    selectedRegimeBindingRef: "regime-binding://t145/carrier/fd",
    computeMeans: "F_D",
    outputCarrierRefs: ["EvaluationRuleOutcome"]
  });

  assert.throws(
    () =>
      constructEvaluationSetPlan({
        basisId: "basis://t145/carrier",
        graphFunctionId: "graph-function://t145/carrier",
        vectorIndex: 0,
        edge: "input→output",
        selectedCompositionRef: "composition://t145/wrong",
        selectedCompositionDigest: "sha256:t145-carrier",
        selectedCompositionSelectionRef: "composition-selection://t145/carrier",
        ruleBatches: [[declaration]]
      }),
    /selectedCompositionRef does not match evaluation set plan/u
  );

  const plan = constructEvaluationSetPlan({
    basisId: "basis://t145/carrier",
    graphFunctionId: "graph-function://t145/carrier",
    vectorIndex: 0,
    edge: "input→output",
    selectedCompositionRef: declaration.selectedCompositionRef,
    selectedCompositionDigest: declaration.selectedCompositionDigest,
    selectedCompositionSelectionRef: declaration.selectedCompositionSelectionRef,
    ruleBatches: [[declaration]]
  });
  const validOutcome = constructEvaluationRuleOutcome({
    status: "accepted",
    ruleRef: declaration.ruleRef,
    ruleRole: declaration.ruleRole,
    computeMeans: declaration.computeMeans,
    producedRegisterRefs: ["register://t145/carrier"],
    evidenceRefs: ["evidence://t145/carrier"],
    selectedCompositionRef: declaration.selectedCompositionRef,
    selectedCompositionDigest: declaration.selectedCompositionDigest,
    selectedCompositionSelectionRef: declaration.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: declaration.selectedRegimeBindingRef,
    compositionContributionRef: declaration.selectedRegimeBindingRef
  });

  assert.throws(
    () =>
      constructEvaluationSetAdmission({
        plan,
        outcomes: [
          {
            ...validOutcome,
            ruleRef: "evaluation-rule://t145/carrier/unknown"
          }
        ]
      }),
    /is not declared by evaluation set plan/u
  );
  assert.throws(
    () =>
      constructEvaluationSetAdmission({
        plan,
        outcomes: [
          {
            ...validOutcome,
            selectedCompositionDigest: "sha256:t145-wrong"
          }
        ]
      }),
    /selectedCompositionDigest does not match/u
  );
  assert.throws(
    () =>
      constructEvaluationSetAdmission({
        plan,
        outcomes: [validOutcome, validOutcome]
      }),
    /Duplicate evaluation rule outcome/u
  );

  const admission = constructEvaluationSetAdmission({
    plan,
    outcomes: [validOutcome]
  });
  assert.equal(admission.admittedRuleOutcomes.length, 1);
});

test("T-145 evaluation rule outcomes cannot smuggle ABG authority", () => {
  const basis = firstFpBasis();
  const maliciousRule = registerRulePlugin({
    ruleRef: "evaluation-rule://t145/malicious"
  });
  const badRule = Object.freeze({
    ...maliciousRule,
    evaluate(input) {
      return {
        kind: "evaluation_rule_outcome",
        status: "accepted",
        ruleRef: "evaluation-rule://t145/malicious",
        ruleRole: "register",
        computeMeans: "F_D",
        producedRegisterRefs: ["register://t145/malicious"],
        evidenceRefs: ["evidence://t145/malicious"],
        selectedCompositionRef: input.selectedCompositionRef,
        selectedCompositionDigest: input.selectedCompositionDigest,
        selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: input.selectedRegimeBindingRef,
        compositionContributionRef:
          input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
        runtimeEvents: []
      };
    }
  });

  assert.throws(
    () =>
      runEngineIterate({
        basis,
        eventSink: () => undefined,
        plugins: {
          fpDispatch: fpDispatchPlugin(),
          fdEvaluator: fdEvaluatorPlugin(),
          fpEvaluator: fpEvaluatorPlugin(),
          evaluationRules: [badRule]
        }
      }),
    /cannot own engine authority/u
  );
});
