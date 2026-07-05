// Validates: T-146
// Validates: REQ-L-GTL3-COMPUTE-NOTATION
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-R-ABG3-PAYLOAD

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructComposedStageSetPlan,
  constructComposedStageTaskDeclaration,
  constructComposedStageTaskOutcome,
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  runEngineIterate,
  runEngineIterateAsync
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

function stagePurpose(stageRole) {
  switch (stageRole) {
    case "transform":
      return "candidate_construction";
    case "evaluate":
      return "candidate_evaluation";
    case "consequence":
      return "consequence_projection";
    default:
      throw new Error(`unsupported stage role ${stageRole}`);
  }
}

function stageContract(stageRole, computeMeans, ref, outputCarrier = "ComposedStageTaskOutcome") {
  return constructEnginePluginContract({
    ref,
    pluginKind: "hook_ref",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier,
    computeStageRole: stageRole,
    computeMeans,
    computeStagePurpose: stagePurpose(stageRole)
  });
}

function pluginContract(pluginKind, ref, outputCarrier) {
  return constructEnginePluginContract({
    ref,
    pluginKind,
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier
  });
}

function firstFpBasis() {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_P", "F_D", "F_D"],
    dispatchRef: "dispatch://t146"
  });
}

function firstFdBasis() {
  return buildThreeStageBasis({
    defaultRegime: "F_D",
    vectorRegimes: ["F_D", "F_D", "F_D"],
    dispatchRef: null
  });
}

function fdEvaluatorPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: pluginContract("fd_evaluator", "plugin://t146/fd", "FdEvaluationOutcome"),
    evaluate(input) {
      observe(input);
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function fpDispatchPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: pluginContract("fp_dispatch", "plugin://t146/fp-dispatch", "FpDispatchOutcome"),
    dispatch(input) {
      observe(input);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t146/${input.vectorIndex}`,
        attachedResultArtifact: {
          edge: input.expectedEdge ?? input.edge,
          actor: "codex",
          fulfillment_assessments: input.expectedAssessmentIds.map((id) => ({
            id,
            evaluator: id,
            fulfillment_status: "fulfilled",
            fulfillment_detail: "T-146 transform output accepted",
            blocking_reasons: [],
            evidence_refs: [`proof://t146/${id}`]
          })),
          selected_worker_id: "worker://t146",
          selected_backend: "backend://node",
          role_id: "role://t146",
          assignment_source: "policy_resolution",
          resolved_runtime_ref: "runtime://typescript/node"
        },
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function findingForInput(input) {
  return constructFpEvaluationFinding({
    findingRef: `finding://t146/${input.vectorIndex}`,
    evaluatorRef: input.contract.ref,
    closeDisposition: "close",
    evidenceRefs: [`evidence://t146/fp/${input.vectorIndex}`],
    authorityRefs: Object.freeze([
      ...new Set([
        ...input.expectedAssessmentIds,
        `authority://t146/fp/${input.vectorIndex}`
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
    contract: pluginContract("fp_evaluator", "plugin://t146/fp-evaluator", "FpEvaluationOutcome"),
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

function consequenceProjectionPlugin(observe = () => undefined) {
  return Object.freeze({
    contract: pluginContract(
      "consequence_projection",
      "plugin://t146/consequence",
      "ConsequenceProjectionOutcome"
    ),
    project(input) {
      observe(input);
      return {
        kind: "consequence_projection",
        status: "projected",
        consequenceRef: `consequence://t146/${input.vectorIndex}`,
        domainReadModelRefs: [`read-model://t146/${input.vectorIndex}`],
        evidenceRefs: [input.sourceProjectionRef],
        reason: null
      };
    }
  });
}

function stageTaskPlugin(input) {
  const computeMeans = input.computeMeans ?? "F_D";
  return Object.freeze({
    contract: stageContract(
      input.stageRole,
      computeMeans,
      input.contractRef ?? `plugin://t146/${input.stageRole}/${input.taskRef}`
    ),
    taskRef: input.taskRef,
    taskRole: input.taskRole,
    required: input.required ?? true,
    parallelGroupRef: input.parallelGroupRef ?? null,
    dependencyRefs: input.dependencyRefs ?? [],
    outputCarrierRefs: ["ComposedStageTaskOutcome"],
    run(pluginInput) {
      input.observe?.(pluginInput);
      if (input.delayMs !== undefined) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              constructComposedStageTaskOutcome({
                status: input.status ?? "accepted",
                taskRef: input.taskRef,
                stageRole: input.stageRole,
                taskRole: input.taskRole,
                computeMeans,
                candidateRefs:
                  input.stageRole === "transform" && input.status !== "blocked"
                    ? [`candidate://t146/${input.taskRef}`]
                    : [],
                projectionRefs:
                  input.stageRole === "consequence" && input.status !== "blocked"
                    ? [`projection://t146/${input.taskRef}`]
                    : [],
                evidenceRefs:
                  input.status === "blocked"
                    ? []
                    : [`evidence://t146/${input.taskRef}`],
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
              })
            );
          }, input.delayMs);
        });
      }
      return constructComposedStageTaskOutcome({
        status: input.status ?? "accepted",
        taskRef: input.taskRef,
        stageRole: input.stageRole,
        taskRole: input.taskRole,
        computeMeans,
        candidateRefs:
          input.stageRole === "transform" && input.status !== "blocked"
            ? [`candidate://t146/${input.taskRef}`]
            : [],
        projectionRefs:
          input.stageRole === "consequence" && input.status !== "blocked"
            ? [`projection://t146/${input.taskRef}`]
            : [],
        evidenceRefs:
          input.status === "blocked"
            ? []
            : [`evidence://t146/${input.taskRef}`],
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

test("T-146 scalar transform, evaluate, and consequence are stage-set reductions", () => {
  const basis = firstFpBasis();
  const events = [];
  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      consequenceProjection: consequenceProjectionPlugin()
    }
  });

  const stageTaskRefs = events
    .filter(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "composed_stage_task_outcome"
    )
    .map((event) => event.authorityRef);

  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(stageTaskRefs.some((ref) => ref.startsWith("stage-task:transform:")), true);
  assert.equal(stageTaskRefs.some((ref) => ref.startsWith("stage-task:consequence:")), true);
  assert.equal(
    events.some(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "evaluation_rule_outcome"
    ),
    true
  );
});

test("T-146 transform.C.F_D tasks run before scalar transform.C.F_P dispatch", () => {
  const observed = [];
  let dispatchInput = null;
  const prepTaskRef = "stage-task://t146/transform/fd-prep";
  const basis = firstFpBasis();
  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin((input) => {
        dispatchInput = input;
        observed.push(`dispatch:${input.vectorIndex}`);
      }),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      transformTasks: [
        stageTaskPlugin({
          stageRole: "transform",
          taskRole: "candidate",
          taskRef: prepTaskRef,
          observe: (input) => observed.push(`prep:${input.vectorIndex}`)
        })
      ]
    }
  });

  assert.equal(result.transition.terminalKind, "converged");
  assert.deepEqual(observed.slice(0, 2), ["prep:0", "dispatch:0"]);
  assert.notEqual(dispatchInput, null);
  assert.equal(
    dispatchInput.stageSetDependencyRefs.some((ref) => ref.includes(prepTaskRef)),
    true
  );
  assert.equal(
    dispatchInput.computeStageBinding.predecessorRefs.some((ref) =>
      ref.includes(prepTaskRef)
    ),
    true
  );
});

test("T-146 scalar transform replay identity includes predecessor refs", () => {
  const digestForPrepTask = (prepTaskRef) => {
    const basis = firstFpBasis();
    const events = [];
    const result = runEngineIterate({
      basis,
      ...m03InstructionAssemblyRequestFields(basis),
      eventSink: (event) => events.push(event),
      plugins: {
        fpDispatch: fpDispatchPlugin(),
        fdEvaluator: fdEvaluatorPlugin(),
        fpEvaluator: fpEvaluatorPlugin(),
        transformTasks: [
          stageTaskPlugin({
            stageRole: "transform",
            taskRole: "candidate",
            taskRef: prepTaskRef
          })
        ]
      }
    });
    const observed = events.find(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "composed_stage_task_outcome" &&
        event.authorityRef.startsWith("stage-task:transform:fp-dispatch:")
    );

    assert.equal(result.transition.terminalKind, "converged");
    assert.notEqual(observed, undefined);
    return observed.inputDigest;
  };

  assert.notEqual(
    digestForPrepTask("stage-task://t146/scalar-transform-identity/prep-a"),
    digestForPrepTask("stage-task://t146/scalar-transform-identity/prep-b")
  );
});

test("T-146 parallel transform tasks invoke concurrently and admit by task ref", async () => {
  const basis = firstFpBasis();
  const events = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const tasks = [30, 10, 20].map((delayMs, index) =>
    stageTaskPlugin({
      stageRole: "transform",
      taskRole: "candidate",
      taskRef: `stage-task://t146/parallel/${String(2 - index).padStart(2, "0")}`,
      parallelGroupRef: "stage-task-group://t146/parallel-transform",
      delayMs,
      observe: () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        setTimeout(() => {
          inFlight -= 1;
        }, delayMs);
      }
    })
  );

  const result = await runEngineIterateAsync({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      transformTasks: tasks
    }
  });
  const admittedTransformTaskRefs = events
    .filter(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "composed_stage_task_outcome" &&
        event.authorityRef.startsWith("stage-task://t146/parallel/")
    )
    .map((event) => event.authorityRef);

  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(maxInFlight > 1, true);
  assert.deepEqual(
    admittedTransformTaskRefs,
    [...admittedTransformTaskRefs].sort((left, right) => left.localeCompare(right))
  );
});

test("T-146 dependent transform tasks can read admitted predecessor refs", () => {
  const firstTaskRef = "stage-task://t146/dependent-transform/first";
  const secondTaskRef = "stage-task://t146/dependent-transform/second";
  const basis = firstFpBasis();
  let secondInput = null;
  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      transformTasks: [
        stageTaskPlugin({
          stageRole: "transform",
          taskRole: "candidate",
          taskRef: firstTaskRef
        }),
        stageTaskPlugin({
          stageRole: "transform",
          taskRole: "candidate",
          taskRef: secondTaskRef,
          dependencyRefs: [firstTaskRef],
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
    secondInput.stageSetDependencyRefs.some((ref) => ref.includes(firstTaskRef)),
    true
  );
});

test("T-146 missing required transform task blocks before F_P dispatch", () => {
  const basis = firstFpBasis();
  let dispatchCount = 0;
  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin(() => {
        dispatchCount += 1;
      }),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin(),
      requiredTransformTaskRefs: ["stage-task://t146/transform/missing"]
    }
  });

  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(result.transition.reason, /missing:stage-task:\/\/t146\/transform\/missing/u);
  assert.equal(dispatchCount, 0);
});

test("T-146 transform and evaluation projections feed later stage inputs", () => {
  const basis = firstFpBasis();
  let fpEvaluationInput = null;
  let consequenceInput = null;
  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => undefined,
    plugins: {
      fpDispatch: fpDispatchPlugin(),
      fdEvaluator: fdEvaluatorPlugin(),
      fpEvaluator: fpEvaluatorPlugin((input) => {
        fpEvaluationInput = input;
      }),
      consequenceProjection: consequenceProjectionPlugin((input) => {
        consequenceInput = input;
      })
    }
  });

  assert.equal(result.transition.terminalKind, "converged");
  assert.notEqual(fpEvaluationInput, null);
  assert.notEqual(consequenceInput, null);
  assert.equal(
    fpEvaluationInput.priorStageProjectionRefs.some((ref) =>
      ref.startsWith("composed-stage-projection:")
    ),
    true
  );
  assert.equal(
    consequenceInput.priorStageProjectionRefs.some((ref) =>
      ref.startsWith("evaluation-set-projection:")
    ),
    true
  );
});

test("T-146 consequence.C tasks run before scalar consequence projection", () => {
  const observed = [];
  const projectionInputs = [];
  const taskRef = "stage-task://t146/consequence/project-register";
  const result = runEngineIterate({
    basis: firstFdBasis(),
    eventSink: () => undefined,
    plugins: {
      fdEvaluator: fdEvaluatorPlugin(),
      consequenceProjection: consequenceProjectionPlugin((input) => {
        projectionInputs.push(input);
        observed.push(`projection:${input.vectorIndex}`);
      }),
      consequenceTasks: [
        stageTaskPlugin({
          stageRole: "consequence",
          taskRole: "projection",
          taskRef,
          observe: (input) => observed.push(`task:${input.vectorIndex}`)
        })
      ]
    }
  });

  assert.equal(result.transition.terminalKind, "converged");
  for (const vectorIndex of [0, 1, 2]) {
    assert.equal(
      observed.indexOf(`task:${vectorIndex}`) <
        observed.indexOf(`projection:${vectorIndex}`),
      true
    );
  }
  assert.equal(
    projectionInputs.every((input) =>
      input.stageSetDependencyRefs.some((ref) => ref.includes(taskRef))
    ),
    true
  );
  assert.equal(
    projectionInputs.every((input) =>
      input.computeStageBinding.predecessorRefs.some((ref) => ref.includes(taskRef))
    ),
    true
  );
});

test("T-146 scalar consequence replay identity includes predecessor refs", () => {
  const digestForConsequenceTask = (taskRef) => {
    const events = [];
    const result = runEngineIterate({
      basis: firstFdBasis(),
      eventSink: (event) => events.push(event),
      plugins: {
        fdEvaluator: fdEvaluatorPlugin(),
        consequenceProjection: consequenceProjectionPlugin(),
        consequenceTasks: [
          stageTaskPlugin({
            stageRole: "consequence",
            taskRole: "projection",
            taskRef
          })
        ]
      }
    });
    const observed = events.find(
      (event) =>
        event.kind === "payload_observed" &&
        event.payloadClass === "composed_stage_task_outcome" &&
        event.authorityRef.startsWith("stage-task:consequence:projection:")
    );

    assert.equal(result.transition.terminalKind, "converged");
    assert.notEqual(observed, undefined);
    return observed.inputDigest;
  };

  assert.notEqual(
    digestForConsequenceTask("stage-task://t146/scalar-consequence-identity/task-a"),
    digestForConsequenceTask("stage-task://t146/scalar-consequence-identity/task-b")
  );
});

test("T-146 dependent consequence tasks can read admitted predecessor refs", () => {
  const firstTaskRef = "stage-task://t146/dependent-consequence/first";
  const secondTaskRef = "stage-task://t146/dependent-consequence/second";
  let secondInput = null;
  const result = runEngineIterate({
    basis: firstFdBasis(),
    eventSink: () => undefined,
    plugins: {
      fdEvaluator: fdEvaluatorPlugin(),
      consequenceProjection: consequenceProjectionPlugin(),
      consequenceTasks: [
        stageTaskPlugin({
          stageRole: "consequence",
          taskRole: "projection",
          taskRef: firstTaskRef
        }),
        stageTaskPlugin({
          stageRole: "consequence",
          taskRole: "projection",
          taskRef: secondTaskRef,
          dependencyRefs: [firstTaskRef],
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
    secondInput.stageSetDependencyRefs.some((ref) => ref.includes(firstTaskRef)),
    true
  );
});

test("T-146 consequence projection feeds replay continuation inputs", () => {
  const fdInputs = [];
  const result = runEngineIterate({
    basis: firstFdBasis(),
    eventSink: () => undefined,
    plugins: {
      fdEvaluator: fdEvaluatorPlugin((input) => {
        fdInputs.push(input);
      }),
      consequenceProjection: consequenceProjectionPlugin()
    }
  });
  const vectorOneInput = fdInputs.find((input) => input.vectorIndex === 1);

  assert.equal(result.transition.terminalKind, "converged");
  assert.notEqual(vectorOneInput, undefined);
  assert.equal(
    vectorOneInput.priorStageProjectionRefs.some((ref) =>
      ref.startsWith("composed-stage-projection:")
    ),
    true
  );
  assert.equal(
    vectorOneInput.priorStageFoldInputRefs.includes("consequence://t146/0"),
    true
  );
});

test("T-146 missing required consequence task blocks before projection", () => {
  let consequenceCount = 0;
  const result = runEngineIterate({
    basis: firstFdBasis(),
    eventSink: () => undefined,
    plugins: {
      fdEvaluator: fdEvaluatorPlugin(),
      consequenceProjection: consequenceProjectionPlugin(() => {
        consequenceCount += 1;
      }),
      requiredConsequenceTaskRefs: ["stage-task://t146/consequence/missing"]
    }
  });

  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.match(
    result.transition.reason,
    /missing:stage-task:\/\/t146\/consequence\/missing/u
  );
  assert.equal(consequenceCount, 0);
});

test("T-146 composed stage task outcomes cannot smuggle ABG authority", () => {
  const basis = firstFpBasis();
  const badTask = {
    ...stageTaskPlugin({
      stageRole: "transform",
      taskRole: "candidate",
      taskRef: "stage-task://t146/malicious"
    }),
    run(input) {
      return {
        kind: "composed_stage_task_outcome",
        status: "accepted",
        taskRef: "stage-task://t146/malicious",
        stageRole: "transform",
        taskRole: "candidate",
        computeMeans: "F_D",
        candidateRefs: ["candidate://t146/malicious"],
        registerRefs: [],
        evidenceRefs: ["evidence://t146/malicious"],
        findingRefs: [],
        projectionRefs: [],
        humanResponseRefs: [],
        residualPressureRefs: [],
        continuationRefs: [],
        diagnosticRefs: [],
        selectedCompositionRef: input.selectedCompositionRef,
        selectedCompositionDigest: input.selectedCompositionDigest,
        selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: input.selectedRegimeBindingRef,
        compositionContributionRef:
          input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
        reason: null,
        runtimeEvents: []
      };
    }
  };

  assert.throws(
    () =>
      runEngineIterate({
        basis,
        ...m03InstructionAssemblyRequestFields(basis),
        eventSink: () => undefined,
        plugins: {
          fpDispatch: fpDispatchPlugin(),
          fdEvaluator: fdEvaluatorPlugin(),
          fpEvaluator: fpEvaluatorPlugin(),
          transformTasks: [badTask]
        }
      }),
    /cannot own engine authority/u
  );
});

test("T-146 generic stage-set carriers reject dependency and composition drift", () => {
  const base = Object.freeze({
    stageRole: "transform",
    selectedCompositionRef: "composition://t146/carrier",
    selectedCompositionDigest: "sha256:t146-carrier",
    selectedCompositionSelectionRef: "composition-selection://t146/carrier",
    selectedRegimeBindingRef: "regime-binding://t146/transform/fd",
    computeMeans: "F_D"
  });
  const first = constructComposedStageTaskDeclaration({
    ...base,
    taskRef: "stage-task://t146/carrier/first",
    taskRole: "candidate"
  });
  const second = constructComposedStageTaskDeclaration({
    ...base,
    taskRef: "stage-task://t146/carrier/second",
    taskRole: "candidate",
    dependencyRefs: [first.taskRef]
  });
  const drifted = constructComposedStageTaskDeclaration({
    ...base,
    taskRef: "stage-task://t146/carrier/drifted",
    taskRole: "candidate",
    selectedCompositionDigest: "sha256:t146-drifted"
  });

  assert.doesNotThrow(() =>
    constructComposedStageSetPlan({
      basisId: "basis://t146/carrier",
      graphFunctionId: "graph-function://t146/carrier",
      vectorIndex: 0,
      edge: "input->output",
      stageRole: "transform",
      selectedCompositionRef: base.selectedCompositionRef,
      selectedCompositionDigest: base.selectedCompositionDigest,
      selectedCompositionSelectionRef: base.selectedCompositionSelectionRef,
      taskBatches: [[first], [second]]
    })
  );
  assert.throws(
    () =>
      constructComposedStageSetPlan({
        basisId: "basis://t146/carrier",
        graphFunctionId: "graph-function://t146/carrier",
        vectorIndex: 0,
        edge: "input->output",
        stageRole: "transform",
        selectedCompositionRef: base.selectedCompositionRef,
        selectedCompositionDigest: base.selectedCompositionDigest,
        selectedCompositionSelectionRef: base.selectedCompositionSelectionRef,
        taskBatches: [[first, second]]
      }),
    /must reference an earlier stage-set batch/u
  );
  assert.throws(
    () =>
      constructComposedStageSetPlan({
        basisId: "basis://t146/carrier",
        graphFunctionId: "graph-function://t146/carrier",
        vectorIndex: 0,
        edge: "input->output",
        stageRole: "transform",
        selectedCompositionRef: base.selectedCompositionRef,
        selectedCompositionDigest: base.selectedCompositionDigest,
        selectedCompositionSelectionRef: base.selectedCompositionSelectionRef,
        taskBatches: [[drifted]]
      }),
    /selectedCompositionDigest does not match/u
  );
});
