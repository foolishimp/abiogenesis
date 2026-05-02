// Implements: T-102-TS
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROVENANCE
// Implements: REQ-P-QUAL

import type { RuntimeFailureClass, RuntimeRegime } from "./carriers.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  freezeStringArray
} from "./runtime_support.js";

export type EvalSuiteClass = "capability" | "regression";
export type EvalGradeStatus = "pass" | "fail" | "unknown";
export type EvalAggregateVerdict = "passed" | "failed";

export interface EvalSuiteSpec {
  readonly kind: "eval_suite_spec";
  readonly suiteId: string;
  readonly suiteRunRef: string;
  readonly goal: string;
  readonly suiteClass: EvalSuiteClass;
  readonly ownerRef: string;
  readonly sourceRefs: readonly string[];
  readonly taskRefs: readonly string[];
  readonly repeatCount: number;
  readonly passThreshold: number;
  readonly saturationPolicy: string;
}

export interface EvalTask {
  readonly kind: "eval_task";
  readonly taskRef: string;
  readonly suiteId: string;
  readonly graphFunctionRef: string;
  readonly edgeRef: string;
  readonly inputRefs: readonly string[];
  readonly declaredOutputRefs: readonly string[];
  readonly referenceSolutionRefs: readonly string[];
  readonly successCriteriaRefs: readonly string[];
  readonly graderRefs: readonly string[];
}

export interface EvalTrial {
  readonly kind: "eval_trial";
  readonly trialRef: string;
  readonly suiteId: string;
  readonly taskRef: string;
  readonly trialIndex: number;
  readonly workerRef: string;
  readonly policyRef: string;
  readonly outputRootRef: string;
  readonly eventStreamRef: string;
  readonly transcriptRefs: readonly string[];
  readonly startedAt: string;
  readonly completedAt: string | null;
}

export interface EvalOutcome {
  readonly kind: "eval_outcome";
  readonly outcomeRef: string;
  readonly trialRef: string;
  readonly taskRef: string;
  readonly terminalDecision: string;
  readonly passed: boolean;
  readonly materializedOutputRefs: readonly string[];
  readonly projectionRefs: readonly string[];
  readonly foldbackRef: string | null;
  readonly admittedEvidenceRefs: readonly string[];
  readonly failureClass: RuntimeFailureClass | null;
}

export interface EvalGradeRow {
  readonly kind: "eval_grade_row";
  readonly gradeRef: string;
  readonly trialRef: string;
  readonly taskRef: string;
  readonly regime: RuntimeRegime;
  readonly subjectRef: string;
  readonly obligationRef: string | null;
  readonly status: EvalGradeStatus;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}

export interface EvalGradeVector {
  readonly kind: "eval_grade_vector";
  readonly gradeVectorRef: string;
  readonly trialRef: string;
  readonly taskRef: string;
  readonly rows: readonly EvalGradeRow[];
  readonly verdict: EvalGradeStatus;
}

export interface EvalAggregateProjection {
  readonly kind: "eval_aggregate_projection";
  readonly suiteId: string;
  readonly suiteRunRef: string;
  readonly suiteClass: EvalSuiteClass;
  readonly taskRefs: readonly string[];
  readonly trialRefs: readonly string[];
  readonly trialCount: number;
  readonly passedTrialCount: number;
  readonly failedTrialCount: number;
  readonly unknownTrialCount: number;
  readonly passAtK: boolean;
  readonly passAllK: boolean;
  readonly passRate: number;
  readonly passThreshold: number;
  readonly gradeRowCount: number;
  readonly gradePassCount: number;
  readonly gradeFailCount: number;
  readonly gradeUnknownCount: number;
  readonly failureClasses: readonly RuntimeFailureClass[];
  readonly verdict: EvalAggregateVerdict;
}

function assertRate(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new TypeError(`${label} must be a number between 0 and 1`);
  }
}

function assertPositiveInteger(value: number, label: string): void {
  assertNonNegativeInteger(value, label);
  if (value === 0) {
    throw new TypeError(`${label} must be positive`);
  }
}

function freezeGradeRows(rows: readonly EvalGradeRow[]): readonly EvalGradeRow[] {
  return Object.freeze(
    rows.map((row) => {
      assertNonEmptyString(row.gradeRef, "EvalGradeRow.gradeRef");
      assertNonEmptyString(row.trialRef, "EvalGradeRow.trialRef");
      assertNonEmptyString(row.taskRef, "EvalGradeRow.taskRef");
      assertNonEmptyString(row.subjectRef, "EvalGradeRow.subjectRef");
      return Object.freeze({
        kind: "eval_grade_row",
        gradeRef: row.gradeRef,
        trialRef: row.trialRef,
        taskRef: row.taskRef,
        regime: row.regime,
        subjectRef: row.subjectRef,
        obligationRef: row.obligationRef,
        status: row.status,
        detail: row.detail,
        evidenceRefs: freezeStringArray(row.evidenceRefs)
      } as const);
    })
  );
}

export function constructEvalSuiteSpec(input: {
  readonly suiteId: string;
  readonly suiteRunRef: string;
  readonly goal: string;
  readonly suiteClass: EvalSuiteClass;
  readonly ownerRef: string;
  readonly sourceRefs: readonly string[];
  readonly taskRefs: readonly string[];
  readonly repeatCount: number;
  readonly passThreshold: number;
  readonly saturationPolicy: string;
}): EvalSuiteSpec {
  assertNonEmptyString(input.suiteId, "EvalSuiteSpec.suiteId");
  assertNonEmptyString(input.suiteRunRef, "EvalSuiteSpec.suiteRunRef");
  assertNonEmptyString(input.goal, "EvalSuiteSpec.goal");
  assertNonEmptyString(input.ownerRef, "EvalSuiteSpec.ownerRef");
  assertPositiveInteger(input.repeatCount, "EvalSuiteSpec.repeatCount");
  assertRate(input.passThreshold, "EvalSuiteSpec.passThreshold");
  assertNonEmptyString(input.saturationPolicy, "EvalSuiteSpec.saturationPolicy");
  if (input.taskRefs.length === 0) {
    throw new TypeError("EvalSuiteSpec requires at least one task ref");
  }
  return Object.freeze({
    kind: "eval_suite_spec",
    suiteId: input.suiteId,
    suiteRunRef: input.suiteRunRef,
    goal: input.goal,
    suiteClass: input.suiteClass,
    ownerRef: input.ownerRef,
    sourceRefs: freezeStringArray(input.sourceRefs),
    taskRefs: freezeStringArray(input.taskRefs),
    repeatCount: input.repeatCount,
    passThreshold: input.passThreshold,
    saturationPolicy: input.saturationPolicy
  });
}

export function constructEvalTask(input: {
  readonly taskRef: string;
  readonly suiteId: string;
  readonly graphFunctionRef: string;
  readonly edgeRef: string;
  readonly inputRefs: readonly string[];
  readonly declaredOutputRefs: readonly string[];
  readonly referenceSolutionRefs: readonly string[];
  readonly successCriteriaRefs: readonly string[];
  readonly graderRefs: readonly string[];
}): EvalTask {
  assertNonEmptyString(input.taskRef, "EvalTask.taskRef");
  assertNonEmptyString(input.suiteId, "EvalTask.suiteId");
  assertNonEmptyString(input.graphFunctionRef, "EvalTask.graphFunctionRef");
  assertNonEmptyString(input.edgeRef, "EvalTask.edgeRef");
  if (input.inputRefs.length === 0) {
    throw new TypeError("EvalTask requires at least one input ref");
  }
  if (input.declaredOutputRefs.length === 0) {
    throw new TypeError("EvalTask requires at least one declared output ref");
  }
  if (input.successCriteriaRefs.length === 0) {
    throw new TypeError("EvalTask requires at least one success criterion ref");
  }
  if (input.graderRefs.length === 0) {
    throw new TypeError("EvalTask requires at least one grader ref");
  }
  return Object.freeze({
    kind: "eval_task",
    taskRef: input.taskRef,
    suiteId: input.suiteId,
    graphFunctionRef: input.graphFunctionRef,
    edgeRef: input.edgeRef,
    inputRefs: freezeStringArray(input.inputRefs),
    declaredOutputRefs: freezeStringArray(input.declaredOutputRefs),
    referenceSolutionRefs: freezeStringArray(input.referenceSolutionRefs),
    successCriteriaRefs: freezeStringArray(input.successCriteriaRefs),
    graderRefs: freezeStringArray(input.graderRefs)
  });
}

export function constructEvalTrial(input: {
  readonly trialRef: string;
  readonly suiteId: string;
  readonly taskRef: string;
  readonly trialIndex: number;
  readonly workerRef: string;
  readonly policyRef: string;
  readonly outputRootRef: string;
  readonly eventStreamRef: string;
  readonly transcriptRefs: readonly string[];
  readonly startedAt: string;
  readonly completedAt: string | null;
}): EvalTrial {
  assertNonEmptyString(input.trialRef, "EvalTrial.trialRef");
  assertNonEmptyString(input.suiteId, "EvalTrial.suiteId");
  assertNonEmptyString(input.taskRef, "EvalTrial.taskRef");
  assertNonNegativeInteger(input.trialIndex, "EvalTrial.trialIndex");
  assertNonEmptyString(input.workerRef, "EvalTrial.workerRef");
  assertNonEmptyString(input.policyRef, "EvalTrial.policyRef");
  assertNonEmptyString(input.outputRootRef, "EvalTrial.outputRootRef");
  assertNonEmptyString(input.eventStreamRef, "EvalTrial.eventStreamRef");
  assertNonEmptyString(input.startedAt, "EvalTrial.startedAt");
  return Object.freeze({
    kind: "eval_trial",
    trialRef: input.trialRef,
    suiteId: input.suiteId,
    taskRef: input.taskRef,
    trialIndex: input.trialIndex,
    workerRef: input.workerRef,
    policyRef: input.policyRef,
    outputRootRef: input.outputRootRef,
    eventStreamRef: input.eventStreamRef,
    transcriptRefs: freezeStringArray(input.transcriptRefs),
    startedAt: input.startedAt,
    completedAt: input.completedAt
  });
}

export function constructEvalOutcome(input: {
  readonly outcomeRef: string;
  readonly trialRef: string;
  readonly taskRef: string;
  readonly terminalDecision: string;
  readonly passed: boolean;
  readonly materializedOutputRefs: readonly string[];
  readonly projectionRefs: readonly string[];
  readonly foldbackRef: string | null;
  readonly admittedEvidenceRefs: readonly string[];
  readonly failureClass: RuntimeFailureClass | null;
}): EvalOutcome {
  assertNonEmptyString(input.outcomeRef, "EvalOutcome.outcomeRef");
  assertNonEmptyString(input.trialRef, "EvalOutcome.trialRef");
  assertNonEmptyString(input.taskRef, "EvalOutcome.taskRef");
  assertNonEmptyString(input.terminalDecision, "EvalOutcome.terminalDecision");
  return Object.freeze({
    kind: "eval_outcome",
    outcomeRef: input.outcomeRef,
    trialRef: input.trialRef,
    taskRef: input.taskRef,
    terminalDecision: input.terminalDecision,
    passed: input.passed,
    materializedOutputRefs: freezeStringArray(input.materializedOutputRefs),
    projectionRefs: freezeStringArray(input.projectionRefs),
    foldbackRef: input.foldbackRef,
    admittedEvidenceRefs: freezeStringArray(input.admittedEvidenceRefs),
    failureClass: input.failureClass
  });
}

export function constructEvalGradeVector(input: {
  readonly gradeVectorRef: string;
  readonly trialRef: string;
  readonly taskRef: string;
  readonly rows: readonly EvalGradeRow[];
}): EvalGradeVector {
  assertNonEmptyString(input.gradeVectorRef, "EvalGradeVector.gradeVectorRef");
  assertNonEmptyString(input.trialRef, "EvalGradeVector.trialRef");
  assertNonEmptyString(input.taskRef, "EvalGradeVector.taskRef");
  if (input.rows.length === 0) {
    throw new TypeError("EvalGradeVector requires at least one row");
  }
  const rows = freezeGradeRows(input.rows);
  for (const row of rows) {
    if (row.trialRef !== input.trialRef || row.taskRef !== input.taskRef) {
      throw new TypeError(
        "EvalGradeVector rows must share the vector trial and task"
      );
    }
  }
  const verdict: EvalGradeStatus = rows.some((row) => row.status === "fail")
    ? "fail"
    : rows.some((row) => row.status === "unknown")
      ? "unknown"
      : "pass";
  return Object.freeze({
    kind: "eval_grade_vector",
    gradeVectorRef: input.gradeVectorRef,
    trialRef: input.trialRef,
    taskRef: input.taskRef,
    rows,
    verdict
  });
}

export function deriveEvalAggregateProjection(input: {
  readonly suite: EvalSuiteSpec;
  readonly tasks: readonly EvalTask[];
  readonly trials: readonly EvalTrial[];
  readonly outcomes: readonly EvalOutcome[];
  readonly gradeVectors: readonly EvalGradeVector[];
}): EvalAggregateProjection {
  const suiteTaskRefs = new Set(input.suite.taskRefs);
  if (suiteTaskRefs.size !== input.suite.taskRefs.length) {
    throw new TypeError("EvalAggregateProjection suite task refs must be unique");
  }
  const observedTaskRefs = new Set<string>();
  for (const task of input.tasks) {
    if (task.suiteId !== input.suite.suiteId || !suiteTaskRefs.has(task.taskRef)) {
      throw new TypeError("EvalAggregateProjection task must belong to suite");
    }
    if (observedTaskRefs.has(task.taskRef)) {
      throw new TypeError("EvalAggregateProjection task refs must be unique");
    }
    observedTaskRefs.add(task.taskRef);
  }
  for (const taskRef of suiteTaskRefs) {
    if (!observedTaskRefs.has(taskRef)) {
      throw new TypeError("EvalAggregateProjection must include every suite task");
    }
  }

  const trialKeys = new Set<string>();
  for (const trial of input.trials) {
    if (trial.suiteId !== input.suite.suiteId || !suiteTaskRefs.has(trial.taskRef)) {
      throw new TypeError("EvalAggregateProjection trial must belong to suite");
    }
    if (trialKeys.has(trial.trialRef)) {
      throw new TypeError("EvalAggregateProjection trial refs must be unique");
    }
    trialKeys.add(trial.trialRef);
  }

  const outcomeByTrial = new Map<string, EvalOutcome>();
  for (const outcome of input.outcomes) {
    if (!trialKeys.has(outcome.trialRef) || !suiteTaskRefs.has(outcome.taskRef)) {
      throw new TypeError("EvalAggregateProjection outcome must belong to trial");
    }
    if (outcomeByTrial.has(outcome.trialRef)) {
      throw new TypeError("EvalAggregateProjection outcome refs must be unique per trial");
    }
    outcomeByTrial.set(outcome.trialRef, outcome);
  }
  const gradeVectorByTrial = new Map<string, EvalGradeVector>();
  for (const vector of input.gradeVectors) {
    if (!trialKeys.has(vector.trialRef) || !suiteTaskRefs.has(vector.taskRef)) {
      throw new TypeError("EvalAggregateProjection grade vector must belong to trial");
    }
    if (gradeVectorByTrial.has(vector.trialRef)) {
      throw new TypeError(
        "EvalAggregateProjection grade vectors must be unique per trial"
      );
    }
    gradeVectorByTrial.set(vector.trialRef, vector);
  }
  const gradeRows = input.gradeVectors.flatMap((vector) => vector.rows);

  let passedTrialCount = 0;
  let failedTrialCount = 0;
  let unknownTrialCount = 0;
  const failureClasses = new Set<RuntimeFailureClass>();
  for (const trial of input.trials) {
    const outcome = outcomeByTrial.get(trial.trialRef);
    const gradeVector = gradeVectorByTrial.get(trial.trialRef);
    if (outcome === undefined || gradeVector === undefined) {
      unknownTrialCount += 1;
      continue;
    }
    if (outcome.taskRef !== trial.taskRef || gradeVector.taskRef !== trial.taskRef) {
      throw new TypeError("EvalAggregateProjection trial evidence task mismatch");
    }
    if (outcome.passed && gradeVector.verdict === "pass") {
      passedTrialCount += 1;
      continue;
    }
    failedTrialCount += 1;
    if (outcome.failureClass !== null) {
      failureClasses.add(outcome.failureClass);
    }
  }

  const gradePassCount = gradeRows.filter((row) => row.status === "pass").length;
  const gradeFailCount = gradeRows.filter((row) => row.status === "fail").length;
  const gradeUnknownCount = gradeRows.filter(
    (row) => row.status === "unknown"
  ).length;
  const trialCount = input.trials.length;
  const passRate = trialCount === 0 ? 0 : passedTrialCount / trialCount;
  const passAtK = passedTrialCount > 0;
  const passAllK = trialCount > 0 && passedTrialCount === trialCount;
  const verdict: EvalAggregateVerdict =
    passRate >= input.suite.passThreshold && unknownTrialCount === 0
      ? "passed"
      : "failed";

  return Object.freeze({
    kind: "eval_aggregate_projection",
    suiteId: input.suite.suiteId,
    suiteRunRef: input.suite.suiteRunRef,
    suiteClass: input.suite.suiteClass,
    taskRefs: freezeStringArray(input.suite.taskRefs),
    trialRefs: freezeStringArray(input.trials.map((trial) => trial.trialRef)),
    trialCount,
    passedTrialCount,
    failedTrialCount,
    unknownTrialCount,
    passAtK,
    passAllK,
    passRate,
    passThreshold: input.suite.passThreshold,
    gradeRowCount: gradeRows.length,
    gradePassCount,
    gradeFailCount,
    gradeUnknownCount,
    failureClasses: Object.freeze([...failureClasses].sort()),
    verdict
  });
}
