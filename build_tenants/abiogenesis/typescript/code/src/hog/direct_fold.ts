import type {
  CProgramNode,
  CTermKind,
} from "../gtl/c_algebra.js";
import type { GraphTemplate } from "../gtl/contracts.js";
import { deepFreeze } from "../shared/immutable.js";

export type CSourcePath = readonly string[];

export interface CTraversalCoordinate {
  readonly nodeRef: string;
  readonly termPath: CSourcePath;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
}

interface DirectCTraversalStepBase {
  readonly kind: "direct_c_traversal_step";
  readonly schemaVersion: "5.0.0";
  readonly source: CTraversalCoordinate;
  readonly termKind: CTermKind;
}

export interface OpenLeafStep extends DirectCTraversalStepBase {
  readonly stepKind: "open_leaf";
  readonly termKind: "c_of";
  readonly leafKind: "executable" | "interaction";
  readonly programLocusRef: string;
  readonly stageRole: string;
  readonly fibre: "F_D" | "F_P" | "F_H";
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly vectorIndex: number;
  readonly judgmentPredicateRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
}

export interface PassIdentityStep extends DirectCTraversalStepBase {
  readonly stepKind: "pass_identity";
  readonly termKind: "c_identity";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
}

export interface EnterTermStep extends DirectCTraversalStepBase {
  readonly stepKind: "enter_term";
  readonly termKind: "c_compose" | "c_edge";
  readonly relation: "compose" | "edge";
  readonly target: CTraversalCoordinate;
}

export interface EnterChildStep extends DirectCTraversalStepBase {
  readonly stepKind: "enter_child";
  readonly termKind: "c_workflow";
  readonly graphFunctionRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
}

export interface StartTaskStep extends DirectCTraversalStepBase {
  readonly stepKind: "start_task";
  readonly termKind: "c_batch";
  readonly batchRef: string;
  readonly taskCount: number;
  readonly target: CTraversalCoordinate;
}

export interface EnterRetryStep extends DirectCTraversalStepBase {
  readonly stepKind: "retry";
  readonly termKind: "c_retry";
  readonly budget: number;
  readonly target: CTraversalCoordinate;
}

export type DirectCTraversalStep =
  | OpenLeafStep
  | PassIdentityStep
  | EnterTermStep
  | EnterChildStep
  | StartTaskStep
  | EnterRetryStep;

export interface DirectCTraversalRefusal {
  readonly kind: "direct_c_traversal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "invalid_coordinate" | "term_path_missing";
  readonly message: string;
}

export type DirectCTraversalResult =
  | DirectCTraversalStep
  | DirectCTraversalRefusal;

function freezeCoordinate(
  coordinate: CTraversalCoordinate,
): CTraversalCoordinate {
  return deepFreeze({
    nodeRef: coordinate.nodeRef,
    termPath: [...coordinate.termPath],
    taskOrdinal: coordinate.taskOrdinal,
    attempt: coordinate.attempt,
    retryPath: [...coordinate.retryPath],
  }) as CTraversalCoordinate;
}

function targetCoordinate(
  source: CTraversalCoordinate,
  segments: readonly string[],
  overrides: Partial<Pick<CTraversalCoordinate, "attempt" | "retryPath" | "taskOrdinal">> = {},
): CTraversalCoordinate {
  return freezeCoordinate({
    nodeRef: source.nodeRef,
    termPath: [...source.termPath, ...segments],
    taskOrdinal: overrides.taskOrdinal === undefined
      ? source.taskOrdinal
      : overrides.taskOrdinal,
    attempt: overrides.attempt === undefined ? source.attempt : overrides.attempt,
    retryPath: overrides.retryPath === undefined
      ? source.retryPath
      : overrides.retryPath,
  });
}

function refusal(
  code: DirectCTraversalRefusal["code"],
  message: string,
): DirectCTraversalRefusal {
  return deepFreeze({
    kind: "direct_c_traversal_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

export function rootCSourcePath(nodeRef: string): CSourcePath {
  return deepFreeze(["node", nodeRef, "c"]);
}

export function rootCTraversalCoordinate(
  nodeRef: string,
): CTraversalCoordinate {
  return freezeCoordinate({
    nodeRef,
    termPath: rootCSourcePath(nodeRef),
    taskOrdinal: null,
    attempt: 1,
    retryPath: [],
  });
}

function safeOrdinal(value: string | undefined): number | null {
  if (value === undefined || !/^(0|[1-9][0-9]*)$/.test(value)) return null;
  const ordinal = Number(value);
  return Number.isSafeInteger(ordinal) ? ordinal : null;
}

export function resolveCProgramTermAtPath(
  template: Readonly<GraphTemplate>,
  coordinate: CTraversalCoordinate,
): CProgramNode | DirectCTraversalRefusal {
  if (
    coordinate.nodeRef.length === 0 ||
    coordinate.termPath.length < 3 ||
    coordinate.termPath[0] !== "node" ||
    coordinate.termPath[1] !== coordinate.nodeRef ||
    coordinate.termPath[2] !== "c" ||
    (coordinate.taskOrdinal !== null &&
      (!Number.isSafeInteger(coordinate.taskOrdinal) || coordinate.taskOrdinal < 0)) ||
    !Number.isSafeInteger(coordinate.attempt) ||
    coordinate.attempt < 1 ||
    coordinate.retryPath.some(
      (attempt) => !Number.isSafeInteger(attempt) || attempt < 1,
    )
  ) {
    return refusal(
      "invalid_coordinate",
      "HoG requires one canonical node-rooted term path and positive attempt coordinates",
    );
  }

  const node = template.nodes.find(
    (candidate) => candidate.nodeRef === coordinate.nodeRef,
  );
  if (node === undefined) {
    return refusal(
      "term_path_missing",
      `GTL node ${coordinate.nodeRef} is absent from the original Graph`,
    );
  }

  let term: CProgramNode = node.term;
  let offset = 3;
  while (offset < coordinate.termPath.length) {
    const segment = coordinate.termPath[offset];
    switch (term.kind) {
      case "c_compose": {
        if (segment !== "terms") {
          return refusal("term_path_missing", "C.compose path requires a terms segment");
        }
        const ordinal = safeOrdinal(coordinate.termPath[offset + 1]);
        const child = ordinal === null ? undefined : term.terms[ordinal];
        if (child === undefined) {
          return refusal("term_path_missing", "C.compose term ordinal is absent");
        }
        term = child;
        offset += 2;
        break;
      }
      case "c_edge": {
        if (
          segment !== "transform" &&
          segment !== "evaluate" &&
          segment !== "consequence"
        ) {
          return refusal("term_path_missing", "C.edge path requires a declared role segment");
        }
        term = term[segment];
        offset += 1;
        break;
      }
      case "c_batch": {
        if (segment !== "tasks") {
          return refusal("term_path_missing", "C.batch path requires a tasks segment");
        }
        const ordinal = safeOrdinal(coordinate.termPath[offset + 1]);
        const child = ordinal === null ? undefined : term.tasks[ordinal];
        if (child === undefined) {
          return refusal("term_path_missing", "C.batch task ordinal is absent");
        }
        term = child;
        offset += 2;
        break;
      }
      case "c_retry":
        if (segment !== "term") {
          return refusal("term_path_missing", "C.retry path requires its term segment");
        }
        term = term.term;
        offset += 1;
        break;
      case "c_of":
      case "c_identity":
      case "c_workflow":
        return refusal(
          "term_path_missing",
          `${term.kind} has no nested GTL term at the requested source path`,
        );
    }
  }
  return term;
}

export function deriveDirectCStep(
  term: Readonly<CProgramNode>,
  sourceInput: CTraversalCoordinate,
): DirectCTraversalStep {
  const source = freezeCoordinate(sourceInput);
  switch (term.kind) {
    case "c_of":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "open_leaf" as const,
        source,
        termKind: term.kind,
        leafKind: term.fibre === "F_H" ? "interaction" as const : "executable" as const,
        programLocusRef: term.programLocusRef,
        stageRole: term.stageRole,
        fibre: term.fibre,
        armId: term.armId,
        compositionRef: term.compositionRef,
        vectorIndex: term.vectorIndex,
        judgmentPredicateRef: term.judgmentPredicateRef,
        inputCarrierRef: term.inputCarrierRef,
        outputCarrierRef: term.outputCarrierRef,
      });
    case "c_identity":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "pass_identity" as const,
        source,
        termKind: term.kind,
        inputCarrierRef: term.inputCarrierRef,
        outputCarrierRef: term.outputCarrierRef,
      });
    case "c_compose":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "enter_term" as const,
        source,
        termKind: term.kind,
        relation: "compose" as const,
        target: targetCoordinate(source, ["terms", "0"]),
      });
    case "c_edge":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "enter_term" as const,
        source,
        termKind: term.kind,
        relation: "edge" as const,
        target: targetCoordinate(source, ["transform"]),
      });
    case "c_workflow":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "enter_child" as const,
        source,
        termKind: term.kind,
        graphFunctionRef: term.graphFunctionRef,
        inputCarrierRef: term.inputCarrierRef,
        outputCarrierRef: term.outputCarrierRef,
      });
    case "c_batch":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "start_task" as const,
        source,
        termKind: term.kind,
        batchRef: term.batchRef,
        taskCount: term.tasks.length,
        target: targetCoordinate(source, ["tasks", "0"], { taskOrdinal: 0 }),
      });
    case "c_retry":
      return deepFreeze({
        kind: "direct_c_traversal_step" as const,
        schemaVersion: "5.0.0" as const,
        stepKind: "retry" as const,
        source,
        termKind: term.kind,
        budget: term.budget,
        target: targetCoordinate(source, ["term"], {
          attempt: 1,
          retryPath: [...source.retryPath, 1],
        }),
      });
  }
}

export function deriveDirectCStepFromGraph(
  template: Readonly<GraphTemplate>,
  coordinate: CTraversalCoordinate,
): DirectCTraversalResult {
  const term = resolveCProgramTermAtPath(template, coordinate);
  return term.kind === "direct_c_traversal_refusal"
    ? term
    : deriveDirectCStep(term, coordinate);
}
