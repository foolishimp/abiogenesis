import type {
  CCall,
} from "../abg/c_call.js";
import type {
  JudgedCCallOutcomeReceipt,
} from "../abg/c_call_outcome.js";
import type {
  AdmittedImplementationSet,
  ExecutionBasis,
} from "../abg/execution_basis.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import type {
  TraversalCursorCandidate,
} from "../abg/traversal_cursor.js";
import type {
  ClosureContract,
  FanOutApplication,
  RecurseApplication,
} from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { TraverseInput } from "./traversal.js";
import type {
  HeldParentTraversalSuspension,
  HeldRecursionSuspension,
  HeldWorkflowSuspension,
} from "./traversal_completion.js";
import type {
  ExecuteGraphTraversalCommonInput,
  GraphTraversalFailureResult,
} from "./traversal_contract.js";
import type { TraversalCursor } from "./traversal.js";
import type {
  RecursionChildFoldFrame,
} from "./recursion_lifecycle.js";
import type {
  TraversalLocusEvaluation,
  WorkflowChildFoldFrame,
} from "./workflow_lifecycle.js";
import type { ExecutableTraversalCompletion } from
  "./traversal_completion.js";

export type TraversalValue = Readonly<Record<string, JsonValue>>;

export interface EvaluationFrame {
  readonly traversal: TraverseInput;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly graphEntryInput: TraversalValue;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly cursor: TraversalCursorCandidate;
  readonly input: TraversalValue;
  readonly terminalMode: "close_run" | "return_to_parent";
}

export interface WorkflowReturnFrame {
  readonly relation: "workflow";
  readonly parent: EvaluationFrame;
  readonly parentCall: CCall;
  readonly application: Readonly<FanOutApplication> | null;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childInput: TraversalValue;
  readonly childInputDigest: `sha256:${string}`;
}

export interface RecursionReturnFrame {
  readonly relation: "recursion";
  readonly parent: EvaluationFrame;
  readonly parentOutcome: JudgedCCallOutcomeReceipt;
  readonly application: Readonly<RecurseApplication>;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childInput: TraversalValue;
  readonly childInputDigest: `sha256:${string}`;
}

export type HogReturnFrame = WorkflowReturnFrame | RecursionReturnFrame;

/** Fold-internal position. Entity operators never receive this carrier. */
export interface MachineEvaluationFrame {
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly scopeClass: "root" | "child";
  readonly graphEntryInput: TraversalValue;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly cursor: TraversalCursor;
  readonly input: TraversalValue;
  readonly ordinal: number;
  readonly structuralOrdinal: number;
}

export interface MachineWorkflowReturnFrame {
  readonly kind: "workflow_return";
  readonly parent: MachineEvaluationFrame;
  readonly workflow: WorkflowChildFoldFrame;
}

export interface MachineRecursionReturnFrame {
  readonly kind: "recursion_return";
  readonly parent: MachineEvaluationFrame;
  readonly recursion: RecursionChildFoldFrame;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

export type MachineReturnFrame =
  | MachineWorkflowReturnFrame
  | MachineRecursionReturnFrame;

export type TraversalMachineState =
  | Readonly<{
      stateKind: "evaluate";
      frame: MachineEvaluationFrame;
      returns: readonly MachineReturnFrame[];
    }>
  | Readonly<{
      stateKind: "return";
      completion: ExecutableTraversalCompletion;
      returns: readonly MachineReturnFrame[];
    }>
  | Readonly<{
      stateKind: "done";
      completion: ExecutableTraversalCompletion;
    }>
  | Readonly<{
      stateKind: "failure";
      failure: GraphTraversalFailureResult;
    }>;

export interface MachineLocusEvaluation extends TraversalLocusEvaluation {}

export function projectParentSuspensions(
  returns: readonly HogReturnFrame[],
): readonly HeldParentTraversalSuspension[] {
  return Object.freeze([...returns].reverse().map((frame) => {
    const parent = frame.parent;
    if (frame.relation === "workflow") {
      const suspension: HeldWorkflowSuspension = Object.freeze({
        kind: "held_workflow_suspension",
        schemaVersion: "5.0.0",
        parentExecutionBasisRef: parent.traversal.executionBasis.basisRef,
        parentTraversalScope: parent.traversal.openedTraversalScope,
        parentGraph: parent.traversal.graph,
        parentClosureContract: parent.closureContract,
        parentCCall: frame.parentCall,
        application: frame.application,
        sourceCursor: parent.cursor,
        parentGraphInput: parent.graphEntryInput,
        parentGraphInputDigest: parent.graphEntryInputDigest,
        parentInput: parent.input,
        parentInputDigest: parent.cursor.inputDigest,
        childExecutionBasisRef: frame.childExecutionBasis.basisRef,
        childTraversalScopeRef: frame.childTraversalScope.scopeRef,
        childInput: frame.childInput,
        childInputDigest: frame.childInputDigest,
        terminalMode: parent.terminalMode,
      });
      return suspension;
    }
    const admitted = frame.parentOutcome.admitted;
    const suspension: HeldRecursionSuspension = Object.freeze({
      kind: "held_recursion_suspension",
      schemaVersion: "5.0.0",
      parentExecutionBasisRef: parent.traversal.executionBasis.basisRef,
      parentTraversalScope: parent.traversal.openedTraversalScope,
      parentGraph: parent.traversal.graph,
      parentClosureContract: parent.closureContract,
      parentGraphInput: parent.graphEntryInput,
      parentGraphInputDigest: parent.graphEntryInputDigest,
      application: frame.application,
      evaluatorCCall: admitted.cCall,
      evaluatorResult: admitted.result,
      evaluatorJudgment: admitted.judgment,
      sourceCursor: parent.cursor,
      evaluatorInput: parent.input,
      evaluatorInputDigest: parent.cursor.inputDigest,
      childExecutionBasisRef: frame.childExecutionBasis.basisRef,
      childTraversalScopeRef: frame.childTraversalScope.scopeRef,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      terminalMode: parent.terminalMode,
    });
    return suspension;
  }));
}
