// Validates: T-102-TS
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROVENANCE
// Validates: REQ-P-QUAL

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEvalGradeVector,
  constructEvalOutcome,
  constructEvalSuiteSpec,
  constructEvalTask,
  constructEvalTrial,
  deriveEvalAggregateProjection
} from "../../build/semantic/code/src/index.js";

function suiteFixture(passThreshold = 1) {
  const task = constructEvalTask({
    taskRef: "eval-task://mini-data-mapper/requirements-to-design",
    suiteId: "mini_data_mapper_eval",
    graphFunctionRef: "graph-function://mini-data-mapper/lifecycle",
    edgeRef: "edge://requirements_to_design",
    inputRefs: ["workspace://mini-data-mapper/requirements"],
    declaredOutputRefs: ["workspace://mini-data-mapper/design"],
    referenceSolutionRefs: ["reference://test35/edge-8-ledger"],
    successCriteriaRefs: ["criterion://per-requirement-semantic-coverage"],
    graderRefs: [
      "fd://mechanical-envelope",
      "fp://domain-requirement-assessor"
    ]
  });
  const suite = constructEvalSuiteSpec({
    suiteId: "mini_data_mapper_eval",
    suiteRunRef: "eval-suite-run://mini-data-mapper/001",
    goal: "Measure repeatable per-requirement semantic transform quality",
    suiteClass: "capability",
    ownerRef: "ticket://T-102",
    sourceRefs: ["comment://anthropic-eval-design-summary"],
    taskRefs: [task.taskRef],
    repeatCount: 2,
    passThreshold,
    saturationPolicy: "promote-to-regression-when-passAllK-stable"
  });
  return { suite, task };
}

function trial(index) {
  return constructEvalTrial({
    trialRef: `eval-trial://mini-data-mapper/${index}`,
    suiteId: "mini_data_mapper_eval",
    taskRef: "eval-task://mini-data-mapper/requirements-to-design",
    trialIndex: index,
    workerRef: "worker://fixture",
    policyRef: "policy://mini-data-mapper",
    outputRootRef: `file:///tmp/mini-data-mapper/trial-${index}`,
    eventStreamRef: `file:///tmp/mini-data-mapper/trial-${index}/events.jsonl`,
    transcriptRefs: [`file:///tmp/mini-data-mapper/trial-${index}/stdout.log`],
    startedAt: "2026-05-02T00:00:00Z",
    completedAt: "2026-05-02T00:00:01Z"
  });
}

function outcome(index, passed) {
  return constructEvalOutcome({
    outcomeRef: `eval-outcome://mini-data-mapper/${index}`,
    trialRef: `eval-trial://mini-data-mapper/${index}`,
    taskRef: "eval-task://mini-data-mapper/requirements-to-design",
    terminalDecision: passed ? "close" : "retry_scheduled_slice",
    passed,
    materializedOutputRefs: passed ? ["workspace://mini-data-mapper/design"] : [],
    projectionRefs: [`projection://mini-data-mapper/${index}`],
    foldbackRef: `foldback://mini-data-mapper/${index}`,
    admittedEvidenceRefs: [`evidence://mini-data-mapper/${index}`],
    failureClass: passed ? null : "contract_failure"
  });
}

function gradeVector(index, fpStatus) {
  return constructEvalGradeVector({
    gradeVectorRef: `eval-grade-vector://mini-data-mapper/${index}`,
    trialRef: `eval-trial://mini-data-mapper/${index}`,
    taskRef: "eval-task://mini-data-mapper/requirements-to-design",
    rows: [
      {
        kind: "eval_grade_row",
        gradeRef: `eval-grade://mini-data-mapper/${index}/fd`,
        trialRef: `eval-trial://mini-data-mapper/${index}`,
        taskRef: "eval-task://mini-data-mapper/requirements-to-design",
        regime: "F_D",
        subjectRef: `fd://mini-data-mapper/${index}`,
        obligationRef: null,
        status: "pass",
        detail: "mechanical envelope passed",
        evidenceRefs: [`fd-evidence://mini-data-mapper/${index}`]
      },
      {
        kind: "eval_grade_row",
        gradeRef: `eval-grade://mini-data-mapper/${index}/fp/REQ-1`,
        trialRef: `eval-trial://mini-data-mapper/${index}`,
        taskRef: "eval-task://mini-data-mapper/requirements-to-design",
        regime: "F_P",
        subjectRef: "workspace://mini-data-mapper/design#REQ-1",
        obligationRef: "REQ-1",
        status: fpStatus,
        detail: "semantic requirement assessment",
        evidenceRefs: [`fp-evidence://mini-data-mapper/${index}/REQ-1`]
      }
    ]
  });
}

test("T-102 eval aggregate computes pass@k/pass^k without treating F_D as semantic authority", () => {
  const { suite, task } = suiteFixture(1);
  const aggregate = deriveEvalAggregateProjection({
    suite,
    tasks: [task],
    trials: [trial(0), trial(1)],
    outcomes: [outcome(0, true), outcome(1, false)],
    gradeVectors: [gradeVector(0, "pass"), gradeVector(1, "fail")]
  });

  assert.equal(aggregate.trialCount, 2);
  assert.equal(aggregate.passedTrialCount, 1);
  assert.equal(aggregate.failedTrialCount, 1);
  assert.equal(aggregate.passAtK, true);
  assert.equal(aggregate.passAllK, false);
  assert.equal(aggregate.verdict, "failed");
  assert.deepEqual(aggregate.failureClasses, ["contract_failure"]);
  assert.equal(aggregate.gradePassCount, 3);
  assert.equal(aggregate.gradeFailCount, 1);
});

test("T-102 all passing regression-shaped trials produce pass^k", () => {
  const { suite, task } = suiteFixture(1);
  const aggregate = deriveEvalAggregateProjection({
    suite,
    tasks: [task],
    trials: [trial(0), trial(1)],
    outcomes: [outcome(0, true), outcome(1, true)],
    gradeVectors: [gradeVector(0, "pass"), gradeVector(1, "pass")]
  });

  assert.equal(aggregate.passAtK, true);
  assert.equal(aggregate.passAllK, true);
  assert.equal(aggregate.passRate, 1);
  assert.equal(aggregate.verdict, "passed");
  assert.equal(aggregate.gradeFailCount, 0);
});

test("T-102 missing trial outcome remains unknown instead of synthetic pass", () => {
  const { suite, task } = suiteFixture(0.5);
  const aggregate = deriveEvalAggregateProjection({
    suite,
    tasks: [task],
    trials: [trial(0), trial(1)],
    outcomes: [outcome(0, true)],
    gradeVectors: [gradeVector(0, "pass")]
  });

  assert.equal(aggregate.passedTrialCount, 1);
  assert.equal(aggregate.unknownTrialCount, 1);
  assert.equal(aggregate.passAtK, true);
  assert.equal(aggregate.passAllK, false);
  assert.equal(aggregate.verdict, "failed");
});

test("T-102 passed outcome with failing F_P grade remains a failed trial", () => {
  const { suite, task } = suiteFixture(1);
  const aggregate = deriveEvalAggregateProjection({
    suite,
    tasks: [task],
    trials: [trial(0)],
    outcomes: [outcome(0, true)],
    gradeVectors: [gradeVector(0, "fail")]
  });

  assert.equal(aggregate.passedTrialCount, 0);
  assert.equal(aggregate.failedTrialCount, 1);
  assert.equal(aggregate.passAtK, false);
  assert.equal(aggregate.passAllK, false);
  assert.equal(aggregate.verdict, "failed");
});

test("T-102 aggregate fails closed on grade-vector lineage mismatch", () => {
  const { suite, task } = suiteFixture(1);
  assert.throws(
    () =>
      constructEvalGradeVector({
        gradeVectorRef: "eval-grade-vector://mini-data-mapper/mismatch",
        trialRef: "eval-trial://mini-data-mapper/0",
        taskRef: task.taskRef,
        rows: [
          {
            kind: "eval_grade_row",
            gradeRef: "eval-grade://mini-data-mapper/mismatch",
            trialRef: "eval-trial://mini-data-mapper/other",
            taskRef: task.taskRef,
            regime: "F_P",
            subjectRef: "workspace://mini-data-mapper/design#REQ-1",
            obligationRef: "REQ-1",
            status: "pass",
            detail: "semantic requirement assessment",
            evidenceRefs: ["fp-evidence://mini-data-mapper/REQ-1"]
          }
        ]
      }),
    /rows must share/
  );
});

test("T-102 aggregate fails closed on duplicate outcome truth", () => {
  const { suite, task } = suiteFixture(1);
  assert.throws(
    () =>
      deriveEvalAggregateProjection({
        suite,
        tasks: [task],
        trials: [trial(0)],
        outcomes: [outcome(0, true), outcome(0, false)],
        gradeVectors: [gradeVector(0, "pass")]
      }),
    /outcome refs must be unique/
  );
});
