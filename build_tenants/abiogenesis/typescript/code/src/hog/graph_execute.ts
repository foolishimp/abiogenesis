import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";

import {
  commitFhInteractionResumeAtExpectedPrefix,
  deriveFhResumeSuccessorInputAtPrefix,
  projectOpenedTraversalScopeClassAtDurablePrefix,
  selectAdmittedImplementationResolution,
} from "../abg/index.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { runEffectProgram } from "../shared/effect_definition.js";
import {
  constructChildTraversalBasis,
  type ChildTraversalBasis,
} from "./child_traversal.js";
import {
  evaluateExecutableCCall,
  type CCallLifecycleEvaluation,
  type ExecutableCCallContext,
} from "./ccall_lifecycle.js";
import {
  enterTraversal,
  prepareInteractionResumeTraversalEntry,
} from "./entry.js";
import type {
  EvaluationFrame,
  HogReturnFrame,
  MachineEvaluationFrame,
  MachineRecursionReturnFrame,
  MachineReturnFrame,
  MachineWorkflowReturnFrame,
  TraversalMachineState,
} from "./evaluation_frame.js";
import { holdInteraction } from "./interaction_lifecycle.js";
import {
  completeInteractionResume as resumeInteractionOwner,
  type CompleteInteractionResumeInput,
} from "./interaction_resume.js";
import {
  isExactLocusStep,
  materializedInputAtCursor,
  traversalBasis,
} from "./operator_support.js";
import {
  rehydrateParentReturnFrames,
} from "./parent_rehydration.js";
import {
  beginRecursionApplication,
  completeRecursionChild,
  recursionApplication,
  restoreDeferredRecursion,
  type CompleteExecutableTraversalInput,
  type RecursionChildFoldFrame,
  type RestoreDeferredRecursionInput,
} from "./recursion_lifecycle.js";
import { advanceRetryLifecycle } from "./retry_lifecycle.js";
import { advanceStructuralTransition } from "./structural_transition.js";
import {
  failTraversal,
  GraphTraversalFailure,
  isGraphTraversalEntryRefusal,
  projectGraphTraversalFailure,
  refuseTraversalEntry,
} from "./traversal_failure.js";
import {
  resolveTraversalTerm,
  deriveInteractionResumeCursor,
  deriveInteractionSuccessorInputCarrierRef,
  rehydrateHeldInteractionCursor,
  traverseFromCursor,
  type TraversalCursor,
} from "./traversal.js";
import type {
  ExecuteGraphTraversalCommonInput,
  ExecuteGraphTraversalInput,
  ExecuteGraphTraversalRequest,
  GraphTraversalEntryRefusal,
  GraphTraversalFailureResult,
  InitialOrNonRetryExecuteGraphTraversalInput,
  InteractionResumeTraversalEntryInput,
  ResumeHeldInteractionInput,
} from "./traversal_contract.js";
import {
  type ExecutableTraversalCompletion,
  type HeldInteractionTraversal,
  type HeldParentTraversalSuspension,
  type HeldRecursionSuspension,
  type HeldWorkflowSuspension,
} from "./traversal_completion.js";
import {
  beginWorkflowLocus,
  completeWorkflowLocus,
  type TraversalLocusEvaluation,
  type WorkflowChildFoldFrame,
  type WorkflowLocusAuthority,
} from "./workflow_lifecycle.js";

export { GraphTraversalFailure };
export type {
  ExecuteGraphTraversalCommonInput,
  ExecuteGraphTraversalInput,
  ExecuteGraphTraversalRequest,
  GraphTraversalEntryRefusal,
  GraphTraversalFailureResult,
  ExecutableTraversalCompletion,
  HeldInteractionTraversal,
  HeldParentTraversalSuspension,
  HeldRecursionSuspension,
  HeldWorkflowSuspension,
  InitialOrNonRetryExecuteGraphTraversalInput,
  InteractionResumeTraversalEntryInput,
  ResumeHeldInteractionInput,
};
export type ProjectedRetryResumeSuccess =
  import("../abg/retry.js").ProjectedRetryResumeSuccess;
export type ExecuteGraphTraversalResult =
  | ExecutableTraversalCompletion
  | GraphTraversalEntryRefusal
  | GraphTraversalFailureResult;

type MachineLocusStep =
  | Readonly<{
      kind: "locus_evaluation";
      evaluation: TraversalLocusEvaluation;
    }>
  | Readonly<{
      kind: "retry_request";
      resume: ProjectedRetryResumeSuccess;
      correlationId: string;
    }>
  | Readonly<{
      kind: "workflow_child_request";
      frame: WorkflowChildFoldFrame;
      prepared: import("./child_traversal.js").PreparedChildTraversal;
      correlationId: string;
      deferFailedRunStop: boolean;
    }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: import("./child_traversal.js").PreparedChildTraversal;
      correlationId: string;
      outputValueKind: string;
      outputContractRef: string;
    }>;

function childTraversalBasis(
  runtime: ExecuteGraphTraversalCommonInput,
): ChildTraversalBasis {
  return constructChildTraversalBasis({
    publication: runtime.leafPort.publication,
    program: runtime.program,
    programValidation: runtime.programValidation,
    rootImplementationSet: runtime.implementationSet,
    rootInteractionSet: runtime.interactionSet,
  });
}

function failFrame(
  frame: MachineEvaluationFrame,
  predecessorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  const runtime = frame.runtime;
  return failTraversal({
    store: runtime.store,
    predecessorPrefix,
    executionBasis: runtime.executionBasis,
    openedTraversalScope: runtime.openedTraversalScope,
    eventTime: runtime.eventTime,
    correlationId: runtime.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

function workflowAuthority(
  runtime: ExecuteGraphTraversalCommonInput,
  scopeClass: "root" | "child",
): WorkflowLocusAuthority {
  return Object.freeze({
    store: runtime.store,
    predecessorPrefix: runtime.predecessorPrefix,
    executionBasis: runtime.executionBasis,
    openedTraversalScope: runtime.openedTraversalScope,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    implementationSet: runtime.implementationSet,
    leafPort: runtime.leafPort,
    childTraversalBasis: childTraversalBasis(runtime),
    closureContract: runtime.closureContract,
    ...(runtime.deferFailedRunStop === undefined
      ? {}
      : { deferFailedRunStop: runtime.deferFailedRunStop }),
    eventTime: runtime.eventTime,
    correlationId: runtime.correlationId,
    scopeClass,
  });
}

function termFor(frame: MachineEvaluationFrame): Readonly<CProgramNode> {
  const term = resolveTraversalTerm(frame.runtime.graph, frame.cursor);
  return term.kind === "traversal_refusal"
    ? failFrame(
        frame,
        frame.runtime.predecessorPrefix,
        `term-${frame.ordinal}`,
        `diagnostic://abiogenesis/hog/${term.code}@5`,
        term as unknown as JsonValue,
      )
    : term;
}

function executableContext(
  frame: MachineEvaluationFrame,
  stop: Extract<
    ReturnType<typeof traverseFromCursor>,
    Readonly<{ kind: "traversal_stop_ref"; stopClass: "executable" }>
  >,
): ExecutableCCallContext {
  const runtime = frame.runtime;
  const application = recursionApplication(runtime.graph, stop.compositionRef);
  return Object.freeze({
    store: runtime.store,
    predecessorPrefix: runtime.predecessorPrefix,
    executionBasis: runtime.executionBasis,
    openedTraversalScope: runtime.openedTraversalScope,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    stop,
    implementationSet: runtime.implementationSet,
    leafPort: runtime.leafPort,
    input: frame.input,
    closureContract: runtime.closureContract,
    actorRuntimeBinding: runtime.actorRuntimeBinding,
    scopeClass: frame.scopeClass,
    ...(application === null ? {} : { deferToApplication: true as const }),
    clock: {
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/leaf/${frame.ordinal}`,
    },
    ordinal: frame.ordinal,
  });
}

function recursionTraversalInput(
  frame: MachineEvaluationFrame,
  context: ExecutableCCallContext,
  completion: ExecutableTraversalCompletion,
): CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>> {
  const resolution = selectAdmittedImplementationResolution(
    context.implementationSet,
    {
      graphFunctionRef: context.graph.graphFunctionRef,
      nodeRef: context.stop.nodeRef,
      programLocusRef: context.stop.programLocusRef,
      implementationBindingRef: context.stop.implementationBindingRef,
    },
  );
  if (resolution === null) {
    return failFrame(
      frame,
      completion.successorPrefix,
      `recursion-resolution-${frame.ordinal}`,
      "diagnostic://abiogenesis/implementation/admitted-row-absent@5",
      context.stop as unknown as JsonValue,
    );
  }
  return Object.freeze({
    store: context.store,
    predecessorPrefix: completion.successorPrefix,
    executionBasis: context.executionBasis,
    openedTraversalScope: context.openedTraversalScope,
    program: context.program,
    graphFunction: context.graphFunction,
    graph: context.graph,
    traversalStop: context.stop,
    implementationSet: context.implementationSet,
    implementationResolution: resolution,
    leafPort: context.leafPort,
    input: context.input,
    inputDigest: context.stop.cursor.inputDigest,
    closureContract: context.closureContract,
    actorRuntimeBinding: context.actorRuntimeBinding,
    ...(frame.runtime.deferFailedRunStop === true
      ? { deferFailedRunStop: true }
      : {}),
    deferToApplication: true,
    completionScopeClass: frame.scopeClass,
    clock: context.clock,
  });
}

function evaluateLocus(
  frame: MachineEvaluationFrame,
  term: Readonly<CProgramNode>,
): Effect.Effect<MachineLocusStep> {
  return Effect.suspend(() => {
    const runtime = frame.runtime;
    if (term.kind === "c_workflow") {
      if (!isExactLocusStep(frame.cursor, term)) {
        return Effect.sync(() => failFrame(
          frame,
          runtime.predecessorPrefix,
          `workflow-step-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
          frame.cursor as unknown as JsonValue,
        ));
      }
      return Effect.sync(() => beginWorkflowLocus({
        authority: workflowAuthority(runtime, frame.scopeClass),
        cursor: frame.cursor,
        value: frame.input,
        graphEntryInput: frame.graphEntryInput,
        graphEntryInputDigest: frame.graphEntryInputDigest,
        ordinal: frame.ordinal,
      }));
    }
    if (term.kind !== "c_of") {
      return Effect.sync(() => failFrame(
        frame,
        runtime.predecessorPrefix,
        `direct-step-${frame.ordinal}`,
        "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
        frame.cursor as unknown as JsonValue,
      ));
    }
    const current = traverseFromCursor(
      traversalBasis(runtime),
      frame.cursor,
      term,
    );
    if (current.kind !== "traversal_stop_ref" ||
        !isExactLocusStep(current, term)) {
      return Effect.sync(() => failFrame(
        frame,
        runtime.predecessorPrefix,
        `direct-step-${frame.ordinal}`,
        "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
        current as unknown as JsonValue,
      ));
    }
    if (term.fibre === "F_H") {
      if (current.stopClass !== "interaction") {
        return Effect.sync(() => failFrame(
          frame,
          runtime.predecessorPrefix,
          `interaction-step-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/interaction-step-mismatch@5",
          current as unknown as JsonValue,
        ));
      }
      return Effect.sync(() => ({
        kind: "locus_evaluation" as const,
        evaluation: holdInteraction({
          store: runtime.store,
          predecessorPrefix: runtime.predecessorPrefix,
          executionBasis: runtime.executionBasis,
          openedTraversalScope: runtime.openedTraversalScope,
          program: runtime.program,
          graphFunction: runtime.graphFunction,
          graph: runtime.graph,
          interactionSet: runtime.interactionSet,
          ...(runtime.continuationProductBasis === undefined
            ? {}
            : {
                continuationProductBasis: runtime.continuationProductBasis,
              }),
          closureContract: runtime.closureContract,
          stop: current,
          value: frame.input,
          ordinal: frame.ordinal,
          eventTime: runtime.eventTime,
          correlationId: runtime.correlationId,
        }),
      }));
    }
    if (current.stopClass !== "executable") {
      return Effect.sync(() => failFrame(
        frame,
        runtime.predecessorPrefix,
        `executable-step-${frame.ordinal}`,
        "diagnostic://abiogenesis/hog/executable-step-mismatch@5",
        current as unknown as JsonValue,
      ));
    }
    const context = executableContext(frame, current);
    return Effect.flatMap(
      evaluateExecutableCCall(context),
      (owner): Effect.Effect<MachineLocusStep> => {
      if (owner.kind === "c_call_retry") {
        const retry = advanceRetryLifecycle(owner);
        return Effect.succeed(retry.kind === "retry_resume"
          ? {
              kind: "retry_request" as const,
              resume: retry.resume,
              correlationId: retry.correlationId,
            }
          : {
              kind: "locus_evaluation" as const,
              evaluation: {
                completion: retry.completion,
                outputValueKind: retry.outputValueKind,
                outputContractRef: retry.outputContractRef,
              },
            });
      }
      const application = recursionApplication(
        runtime.graph,
        current.compositionRef,
      );
      if (application === null ||
          owner.completion.disposition !== "application_ready") {
        return Effect.succeed({
          kind: "locus_evaluation" as const,
          evaluation: {
            completion: owner.completion,
            outputValueKind: owner.outputValueKind,
            outputContractRef: owner.outputContractRef,
          },
        });
      }
      const recursion = beginRecursionApplication({
        traversalInput: recursionTraversalInput(
          frame,
          context,
          owner.completion,
        ),
        childTraversalBasis: childTraversalBasis(runtime),
        parentClock: {
          eventTime: runtime.eventTime,
          correlationId: runtime.correlationId,
        },
        application,
        completion: owner.completion,
        graphEntryInput: frame.graphEntryInput,
        graphEntryInputDigest: frame.graphEntryInputDigest,
        leafOrdinal: frame.ordinal,
      });
      return Effect.succeed(recursion.kind === "recursion_child_request"
        ? {
            ...recursion,
            outputValueKind: owner.outputValueKind,
            outputContractRef: owner.outputContractRef,
          }
        : {
            kind: "locus_evaluation" as const,
            evaluation: {
              completion: recursion.completion,
              outputValueKind: owner.outputValueKind,
              outputContractRef: owner.outputContractRef,
            },
          });
      },
    );
  });
}

function nextFromEvaluation(
  frame: MachineEvaluationFrame,
  evaluation: TraversalLocusEvaluation,
  returns: readonly MachineReturnFrame[],
): TraversalMachineState {
  const runtime = frame.runtime;
  const completion = evaluation.completion;
  if (completion.disposition !== "advanced") {
    return Object.freeze({
      stateKind: "return" as const,
      completion,
      returns: Object.freeze([...returns]),
    });
  }
  const materialized = materializedInputAtCursor(
    runtime.graph,
    completion.nextCursor,
  );
  if (
    completion.nextCursor === null ||
    completion.continuationKind === null ||
    completion.nextInputContractRef === null ||
    evaluation.outputValueKind === null ||
    evaluation.outputContractRef === null ||
    (materialized === null &&
      (typeof completion.resultValue !== "object" ||
        completion.resultValue === null ||
        Array.isArray(completion.resultValue))) ||
    (materialized === null &&
      (completion.continuationKind === "retry"
        ? completion.nextCursor.inputRef.length === 0 ||
          completion.nextCursor.inputDigest !==
            sha256Canonical(completion.resultValue)
        : !runtime.leafPort.validateContractValue(
            completion.nextInputContractRef,
            "output",
            completion.resultValue,
          )))
  ) {
    return failFrame(
      frame,
      completion.successorPrefix,
      `advanced-result-${frame.ordinal}`,
      "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
      {
        leafOrdinal: frame.ordinal,
        completionDisposition: completion.disposition,
      },
    );
  }
  return Object.freeze({
    stateKind: "evaluate" as const,
    frame: Object.freeze({
      ...frame,
      runtime: Object.freeze({
        ...runtime,
        predecessorPrefix: completion.successorPrefix,
      }),
      cursor: completion.nextCursor,
      input: materialized?.value ??
        completion.resultValue as Readonly<Record<string, JsonValue>>,
      ordinal: frame.ordinal + 1,
      structuralOrdinal: 0,
    }),
    returns: Object.freeze([...returns]),
  });
}

type ActiveTraversalMachineState = Extract<
  TraversalMachineState,
  Readonly<{ stateKind: "evaluate" | "return" }>
>;

function liftGraphTraversalFailure<A, E>(
  program: Effect.Effect<A, E, never>,
): Effect.Effect<A, E | GraphTraversalFailure, never> {
  return Effect.catchAllCause(program, (
    cause,
  ): Effect.Effect<never, E | GraphTraversalFailure, never> => {
    const failure = Cause.failureOption(cause);
    if (
      Option.isSome(failure) &&
      failure.value instanceof GraphTraversalFailure
    ) {
      return Effect.fail(failure.value);
    }
    const defect = Cause.dieOption(cause);
    return Option.isSome(defect) &&
        defect.value instanceof GraphTraversalFailure
      ? Effect.fail(defect.value)
      : Effect.failCause(cause);
  });
}

function evaluateTraversalProgram(
  initial: ActiveTraversalMachineState,
): Effect.Effect<ExecutableTraversalCompletion, GraphTraversalFailure> {
  const program = Effect.iterate<
    TraversalMachineState,
    ActiveTraversalMachineState,
    never,
    GraphTraversalFailure
  >(Object.freeze(initial), {
    while: (
      state,
    ): state is ActiveTraversalMachineState => state.stateKind !== "done",
    body: (state) => {
      const returnOwner = state.stateKind === "return"
        ? state.returns.at(-1)
        : null;
      if (state.stateKind === "return" && returnOwner === undefined) {
        return Effect.succeed(Object.freeze({
          stateKind: "done" as const,
          completion: state.completion,
        }));
      }
      return liftGraphTraversalFailure(Effect.suspend(() => {
      if (state.stateKind === "return") {
        const owner = returnOwner!;
        const evaluation: TraversalLocusEvaluation =
          owner.kind === "workflow_return"
            ? completeWorkflowLocus(owner.workflow, state.completion)
            : {
                completion: completeRecursionChild(
                  owner.recursion,
                  state.completion,
                ),
                outputValueKind: owner.outputValueKind,
                outputContractRef: owner.outputContractRef,
              };
        return Effect.succeed(nextFromEvaluation(
          Object.freeze({
            ...owner.parent,
            runtime: Object.freeze({
              ...owner.parent.runtime,
              predecessorPrefix: state.completion.successorPrefix,
            }),
          }),
          evaluation,
          state.returns.slice(0, -1),
        ));
      }
      const frame = state.frame;
      const term = termFor(frame);
      if (term.kind !== "c_of" && term.kind !== "c_workflow") {
        const advanced = advanceStructuralTransition({
          store: frame.runtime.store,
          predecessorPrefix: frame.runtime.predecessorPrefix,
          executionBasis: frame.runtime.executionBasis,
          openedTraversalScope: frame.runtime.openedTraversalScope,
          graph: frame.runtime.graph,
          graphFunction: frame.runtime.graphFunction,
          leafPort: frame.runtime.leafPort,
          cursor: frame.cursor,
          input: frame.input,
          term,
          ordinal: frame.ordinal,
          structuralOrdinal: frame.structuralOrdinal,
          eventTime: frame.runtime.eventTime,
          correlationId: frame.runtime.correlationId,
        });
        return Effect.succeed(Object.freeze({
          stateKind: "evaluate" as const,
          frame: Object.freeze({
            ...frame,
            runtime: Object.freeze({
              ...frame.runtime,
              predecessorPrefix: advanced.successorPrefix,
            }),
            cursor: advanced.cursor,
            input: materializedInputAtCursor(
              frame.runtime.graph,
              advanced.cursor,
            )?.value ?? frame.input,
            structuralOrdinal: frame.structuralOrdinal + 1,
          }),
          returns: Object.freeze([...state.returns]),
        }));
      }
      return Effect.map(evaluateLocus(frame, term), (owner) => {
        if (owner.kind === "retry_request") {
          return Object.freeze({
            stateKind: "evaluate" as const,
            frame: enterTraversal({
              ...frame.runtime,
              predecessorPrefix: owner.resume.successorPrefix,
              correlationId: owner.correlationId,
              projectedRetryResume: owner.resume,
            }),
            returns: Object.freeze([...state.returns]),
          });
        }
        if (owner.kind === "workflow_child_request" ||
            owner.kind === "recursion_child_request") {
          const prepared = owner.prepared;
          const deferFailedRunStop =
            owner.kind === "workflow_child_request"
              ? owner.deferFailedRunStop
              : frame.runtime.deferFailedRunStop === true;
          const child = enterTraversal({
            ...frame.runtime,
            ...prepared,
            predecessorPrefix: prepared.successorPrefix,
            ...(frame.runtime.continuationProductBasis === undefined
              ? {}
              : {
                  continuationProductBasis: {
                    ...frame.runtime.continuationProductBasis,
                    programValidation: prepared.programValidation,
                    graphValidation: prepared.graphValidation,
                  },
                }),
            ...(deferFailedRunStop ? { deferFailedRunStop: true } : {}),
            correlationId: owner.correlationId,
          });
          const returnFrame: MachineReturnFrame =
            owner.kind === "workflow_child_request"
              ? {
                  kind: "workflow_return",
                  parent: frame,
                  workflow: owner.frame,
                }
              : {
                  kind: "recursion_return",
                  parent: frame,
                  recursion: owner.frame,
                  outputValueKind: owner.outputValueKind,
                  outputContractRef: owner.outputContractRef,
                };
          return Object.freeze({
            stateKind: "evaluate" as const,
            frame: child,
            returns: Object.freeze([...state.returns, returnFrame]),
          });
        }
        return nextFromEvaluation(frame, owner.evaluation, state.returns);
      });
      }));
    },
  });
  return Effect.map(program, (state) => {
    if (state.stateKind !== "done") {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/fold-final-state-mismatch@5",
      );
    }
    return state.completion;
  });
}

function machineRuntimeFromRehydrated(
  base: InitialOrNonRetryExecuteGraphTraversalInput,
  frame: EvaluationFrame,
  predecessorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
  ordinal: number,
): ExecuteGraphTraversalCommonInput {
  return Object.freeze({
    store: base.store,
    predecessorPrefix,
    executionBasis: frame.traversal.executionBasis,
    openedTraversalScope: frame.traversal.openedTraversalScope,
    program: frame.traversal.program,
    graphFunction: frame.traversal.graphFunction,
    graph: frame.traversal.graph,
    graphValidation: frame.traversal.graphValidation,
    programValidation: base.programValidation,
    implementationSet: frame.implementationSet,
    interactionSet: base.interactionSet,
    ...(base.continuationProductBasis === undefined
      ? {}
      : {
          continuationProductBasis: {
            ...base.continuationProductBasis,
            graphValidation: frame.traversal.graphValidation,
          },
        }),
    leafPort: frame.leafPort,
    closureContract: frame.closureContract,
    actorRuntimeBinding: base.actorRuntimeBinding,
    ...(base.deferFailedRunStop === true
      ? { deferFailedRunStop: true }
      : {}),
    eventTime: base.eventTime,
    correlationId: `${base.correlationId}/parent/${ordinal}`,
  });
}

function machineFrameFromRehydrated(
  base: InitialOrNonRetryExecuteGraphTraversalInput,
  frame: EvaluationFrame,
  predecessorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
  ordinal: number,
): MachineEvaluationFrame {
  const runtime = machineRuntimeFromRehydrated(
      base,
      frame,
      predecessorPrefix,
      ordinal,
    );
  const scopeClass = projectOpenedTraversalScopeClassAtDurablePrefix(
    predecessorPrefix,
    runtime.openedTraversalScope,
  );
  const evidenceClass = frame.terminalMode === "close_run" ? "root" : "child";
  if (scopeClass === null || scopeClass !== evidenceClass) {
    return failTraversal({
      store: runtime.store,
      predecessorPrefix,
      executionBasis: runtime.executionBasis,
      openedTraversalScope: runtime.openedTraversalScope,
      eventTime: runtime.eventTime,
      correlationId: runtime.correlationId,
      stage: "parent-scope-class",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/parent-scope-class-mismatch@5",
      candidate: { scopeRef: runtime.openedTraversalScope.scopeRef },
    });
  }
  return Object.freeze({
    runtime,
    scopeClass,
    graphEntryInput: frame.graphEntryInput,
    graphEntryInputDigest: frame.graphEntryInputDigest,
    cursor: frame.cursor as TraversalCursor,
    input: frame.input,
    ordinal: frame.cursor.taskOrdinal ?? 0,
    structuralOrdinal: 0,
  });
}

function machineWorkflowReturn(
  base: InitialOrNonRetryExecuteGraphTraversalInput,
  frame: Extract<HogReturnFrame, Readonly<{ relation: "workflow" }>>,
  predecessorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
  ordinal: number,
): MachineWorkflowReturnFrame {
  const parent = machineFrameFromRehydrated(
    base,
    frame.parent,
    predecessorPrefix,
    ordinal,
  );
  const term = resolveTraversalTerm(parent.runtime.graph, parent.cursor);
  if (term.kind !== "c_workflow") {
    return failFrame(
      parent,
      predecessorPrefix,
      "workflow-resume-child",
      "diagnostic://abiogenesis/hog/workflow-resume-child-mismatch@5",
      term as unknown as JsonValue,
    );
  }
  return Object.freeze({
    kind: "workflow_return" as const,
    parent,
    workflow: Object.freeze({
      kind: "workflow_child_fold_frame" as const,
      authority: workflowAuthority(parent.runtime, parent.scopeClass),
      cursor: parent.cursor,
      value: parent.input,
      graphEntryInput: parent.graphEntryInput,
      graphEntryInputDigest: parent.graphEntryInputDigest,
      ordinal: parent.ordinal,
      workflowTerm: term,
      parentCCall: frame.parentCall,
      application: frame.application,
      childExecutionBasis: frame.childExecutionBasis,
      childTraversalScope: frame.childTraversalScope,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      foldbackCorrelationId:
        `${parent.runtime.correlationId}/workflow/resume-foldback`,
    }),
  });
}

function machineRecursionReturn(
  base: InitialOrNonRetryExecuteGraphTraversalInput,
  frame: Extract<HogReturnFrame, Readonly<{ relation: "recursion" }>>,
  predecessorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
  ordinal: number,
): MachineRecursionReturnFrame {
  const parent = machineFrameFromRehydrated(
    base,
    frame.parent,
    predecessorPrefix,
    ordinal,
  );
  const stop = traverseFromCursor(
    frame.parent.traversal,
    parent.cursor,
  );
  if (stop.kind !== "traversal_stop_ref" ||
      stop.stopClass !== "executable") {
    return failFrame(
      parent,
      predecessorPrefix,
      "recursion-resume-stop",
      "diagnostic://abiogenesis/hog/recursion-resume-stop-mismatch@5",
      stop as unknown as JsonValue,
    );
  }
  const resolution = selectAdmittedImplementationResolution(
    frame.parent.implementationSet,
    {
      graphFunctionRef: frame.parent.traversal.graph.graphFunctionRef,
      nodeRef: stop.nodeRef,
      programLocusRef: stop.programLocusRef,
      implementationBindingRef: stop.implementationBindingRef,
    },
  );
  const outputValueKind = frame.parent.leafPort.contractValueKind(
    stop.outputContractRef,
    "output",
  );
  if (resolution === null || outputValueKind === null) {
    return failFrame(
      parent,
      predecessorPrefix,
      "recursion-resume-resolution",
      "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5",
      stop as unknown as JsonValue,
    );
  }
  const traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  > = Object.freeze({
    store: parent.runtime.store,
    predecessorPrefix,
    executionBasis: parent.runtime.executionBasis,
    openedTraversalScope: parent.runtime.openedTraversalScope,
    program: parent.runtime.program,
    graphFunction: parent.runtime.graphFunction,
    graph: parent.runtime.graph,
    traversalStop: stop,
    implementationSet: parent.runtime.implementationSet,
    implementationResolution: resolution,
    leafPort: parent.runtime.leafPort,
    input: parent.input,
    inputDigest: parent.cursor.inputDigest,
    closureContract: parent.runtime.closureContract,
    actorRuntimeBinding: parent.runtime.actorRuntimeBinding,
    ...(parent.runtime.deferFailedRunStop === true
      ? { deferFailedRunStop: true }
      : {}),
    deferToApplication: true,
    completionScopeClass: parent.scopeClass,
    clock: {
      eventTime: parent.runtime.eventTime,
      correlationId: `${parent.runtime.correlationId}/recursion/restore`,
    },
  });
  const admitted = frame.parentOutcome.admitted;
  const restoration: RestoreDeferredRecursionInput = {
    traversalInput,
    application: frame.application,
    cCallRef: admitted.cCall.cCallRef,
    resultRef: admitted.result.resultRef,
    judgmentRef: admitted.judgment.judgmentRef,
  };
  const restored = restoreDeferredRecursion(restoration);
  if (restored === null) {
    return failFrame(
      parent,
      predecessorPrefix,
      "recursion-resume-deferred",
      "diagnostic://abiogenesis/hog/recursion-resume-deferred-mismatch@5",
      frame.application as unknown as JsonValue,
    );
  }
  return Object.freeze({
    kind: "recursion_return" as const,
    parent,
    recursion: Object.freeze({
      kind: "recursion_child_fold_frame" as const,
      parentClock: {
        eventTime: parent.runtime.eventTime,
        correlationId: parent.runtime.correlationId,
      },
      parentScopeClass: parent.scopeClass,
      traversalInput,
      application: frame.application,
      restored,
      restoration,
      graphEntryInput: parent.graphEntryInput,
      graphEntryInputDigest: parent.graphEntryInputDigest,
      leafOrdinal: parent.ordinal,
      childExecutionBasis: frame.childExecutionBasis,
      childTraversalScope: frame.childTraversalScope,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
    }),
    outputValueKind,
    outputContractRef: stop.outputContractRef,
  });
}

interface ParentReturnsPreflight {
  readonly kind: "parent_returns_preflight";
  readonly frames: readonly HogReturnFrame[];
}

function resumeEntryRefusal(
  code: GraphTraversalEntryRefusal["code"],
  message: string,
  diagnosticRef: string,
  candidate: JsonValue,
  priorAdmission: GraphTraversalEntryRefusal["priorAdmission"] = null,
): GraphTraversalEntryRefusal {
  return refuseTraversalEntry({
    code,
    message,
    diagnosticRef,
    candidate,
    priorAdmission,
  });
}

function preflightParentReturns(
  input: ResumeHeldInteractionInput,
  current: InitialOrNonRetryExecuteGraphTraversalInput,
): ParentReturnsPreflight | GraphTraversalEntryRefusal {
  const exact = rehydrateParentReturnFrames({
    predecessorPrefix: current.predecessorPrefix,
    program: current.program,
    programValidation: current.programValidation,
    implementationSet: current.implementationSet,
    leafPort: current.leafPort,
    currentChildExecutionBasis: current.executionBasis,
    currentChildTraversalScope: current.openedTraversalScope,
    suspensions: input.parentSuspensions,
  });
  if (exact.kind === "parent_rehydration_refusal") {
    return resumeEntryRefusal(
      "owner_refusal",
      `continued run parent lineage could not be rehydrated: ${exact.stage}`,
      exact.diagnosticRef,
      {
        stage: exact.stage,
        suspensionCount: input.parentSuspensions.length,
      },
    );
  }
  return Object.freeze({
    kind: "parent_returns_preflight" as const,
    frames: exact.frames,
  });
}

function exactParentReturns(
  current: InitialOrNonRetryExecuteGraphTraversalInput,
  frames: readonly HogReturnFrame[],
  successorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
): readonly MachineReturnFrame[] {
  return Object.freeze(frames.map((frame, ordinal) =>
    frame.relation === "workflow"
      ? machineWorkflowReturn(
          current,
          frame,
          successorPrefix,
          ordinal,
        )
      : machineRecursionReturn(
          current,
          frame,
          successorPrefix,
          ordinal,
        )));
}

interface PreparedResumeHeldInteractionInput {
  readonly current: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly interaction: CompleteInteractionResumeInput;
  readonly parentFrames: readonly HogReturnFrame[];
}

function prepareHeldInteractionResume(
  input: ResumeHeldInteractionInput,
): PreparedResumeHeldInteractionInput | GraphTraversalEntryRefusal {
  const held = prepareInteractionResumeTraversalEntry(input.current);
  if (isGraphTraversalEntryRefusal(held)) return held;
  const parentPreflight = preflightParentReturns(input, held);
  if (parentPreflight.kind === "graph_traversal_entry_refusal") {
    return parentPreflight;
  }
  const authority = input.interactionResume;
  const heldCursor = rehydrateHeldInteractionCursor(
    authority.preparedOperation.projectedPrefix,
    authority.heldInteraction.cursor,
  );
  if (heldCursor === null) {
    return resumeEntryRefusal(
      "owner_refusal",
      "run continuation could not rehydrate its exact HoG cursor",
        "diagnostic://abiogenesis/hog/interaction-resume-held-cursor@5",
      authority.heldInteraction.cursor as unknown as JsonValue,
    );
  }
  let successorInputContractRef: string | null;
  try {
    successorInputContractRef = deriveInteractionSuccessorInputCarrierRef(
      held.graph,
      heldCursor,
    );
  } catch (error) {
    return resumeEntryRefusal(
      "owner_refusal",
      `run continuation successor carrier derivation failed: ${String(error)}`,
        "diagnostic://abiogenesis/hog/interaction-resume-successor-carrier@5",
      { error: String(error) },
    );
  }
  const successorInputValueKind = successorInputContractRef === null
    ? null
    : held.leafPort.contractValueKindByRef(successorInputContractRef);
  const continuation = authority.continuation;
  if (
    (successorInputContractRef === null) !==
      (successorInputValueKind === null) ||
    (continuation.constructionIntentRef !== null &&
      (successorInputContractRef === null ||
        successorInputValueKind !== "action_evaluation_basis")) ||
    (continuation.constructionIntentRef === null &&
      successorInputContractRef !== null &&
      (successorInputContractRef !== continuation.responseContractRef ||
        typeof continuation.responseValue !== "object" ||
        continuation.responseValue === null ||
        Array.isArray(continuation.responseValue) ||
        !held.leafPort.validateContractValueByRef(
          successorInputContractRef,
          continuation.responseValue,
        )))
  ) {
    return resumeEntryRefusal(
      "target_mismatch",
      "run continuation target carrier, response contract, or admitted value kind differs",
        "diagnostic://abiogenesis/hog/interaction-resume-successor-contract@5",
      {
        successorInputContractRef,
        successorInputValueKind,
      },
    );
  }
  let successorInput;
  try {
    successorInput = deriveFhResumeSuccessorInputAtPrefix(
      authority.preparedOperation.projectedPrefix,
      continuation,
      authority.preparedOperation.operation,
      held.executionBasis,
      held.closureContract,
      {
        inputContractRef: successorInputContractRef,
        inputValueKind: successorInputValueKind,
      },
    );
  } catch (error) {
    return resumeEntryRefusal(
      "owner_refusal",
      `run continuation successor input derivation failed: ${String(error)}`,
      "diagnostic://abiogenesis/hog/interaction-resume-successor-input@5",
      { error: String(error) },
    );
  }
  if (
    successorInputContractRef !== null &&
    !held.leafPort.validateContractValueByRef(
      successorInputContractRef,
      successorInput.inputValue,
    )
  ) {
    return resumeEntryRefusal(
      "target_mismatch",
      "run continuation successor value fails its exact admitted contract",
        "diagnostic://abiogenesis/hog/interaction-resume-successor-value@5",
      successorInput.inputValue,
    );
  }
  const successorCursor = deriveInteractionResumeCursor(heldCursor, {
    inputRef: successorInput.inputRef,
    inputDigest: successorInput.inputDigest,
  });
  if (successorCursor.kind !== "traversal_cursor") {
    return resumeEntryRefusal(
      "owner_refusal",
      `interaction resume cursor refused: ${successorCursor.message}`,
        "diagnostic://abiogenesis/hog/interaction-resume-successor-cursor@5",
      successorCursor as unknown as JsonValue,
    );
  }
  let committed;
  try {
    committed = commitFhInteractionResumeAtExpectedPrefix(
      held.store,
      held.predecessorPrefix,
      authority.rootInvocation,
      continuation,
      authority.variant,
      authority.actorRef,
      authority.capabilityRef,
      authority.operationBasis,
      held.executionBasis,
      held.closureContract,
      successorInput,
      successorCursor,
      authority.resumeBasis,
    );
  } catch (error) {
    return resumeEntryRefusal(
      "owner_refusal",
      `interaction resume admission failed: ${String(error)}`,
      "diagnostic://abiogenesis/hog/interaction-resume-admission@5",
      { error: String(error) },
    );
  }
  if (!("resume" in committed)) {
    if (committed.disposition === "duplicate") {
      return resumeEntryRefusal(
        "duplicate_invocation",
        `effectful Public invocation ${committed.invocationRef} already has one owning admission`,
        "diagnostic://abiogenesis/hog/interaction-resume-duplicate@5",
        committed as unknown as JsonValue,
        committed.priorAdmission,
      );
    }
    return resumeEntryRefusal(
      "owner_refusal",
      `effectful invocation truth refused: ${committed.code}`,
      "diagnostic://abiogenesis/hog/interaction-resume-invalid-history@5",
      committed as unknown as JsonValue,
    );
  }
  const current = Object.freeze({
    ...held,
    predecessorPrefix: committed.successorPrefix,
  });
  return Object.freeze({
    current,
    interaction: Object.freeze({
      store: current.store,
      predecessorPrefix: current.predecessorPrefix,
      executionBasis: current.executionBasis,
      openedTraversalScope: current.openedTraversalScope,
      graphFunction: current.graphFunction,
      graph: current.graph,
      heldInteraction: Object.freeze({
        ...authority.heldInteraction,
        cursor: heldCursor,
      }),
      successorCursor,
      resume: committed.resume,
      closureContract: current.closureContract,
      clock: Object.freeze({
        eventTime: current.eventTime,
        correlationId: `${current.correlationId}/interaction`,
      }),
    }),
    parentFrames: parentPreflight.frames,
  });
}

function seedParentContinuation(
  parent: InitialOrNonRetryExecuteGraphTraversalInput,
  completion: ExecutableTraversalCompletion,
  returns: readonly MachineReturnFrame[],
): ActiveTraversalMachineState {
  if (completion.disposition !== "advanced") {
    return Object.freeze({
      stateKind: "return" as const,
      completion,
      returns,
    });
  }
  if (completion.nextCursor === null ||
      completion.resultValue === null ||
      typeof completion.resultValue !== "object" ||
      Array.isArray(completion.resultValue)) {
    return failTraversal({
      store: parent.store,
      predecessorPrefix: completion.successorPrefix,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
      eventTime: parent.eventTime,
      correlationId: parent.correlationId,
      stage: "interaction-resume-advance",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/interaction-resume-advance-incomplete@5",
      candidate: { faultClass: "interaction_resume_advance_incomplete" },
    });
  }
  const input = completion.resultValue as Readonly<Record<string, JsonValue>>;
  const inputDigest = sha256Canonical(input);
  if (completion.nextCursor.inputDigest !== inputDigest) {
    return failTraversal({
      store: parent.store,
      predecessorPrefix: completion.successorPrefix,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
      eventTime: parent.eventTime,
      correlationId: parent.correlationId,
      stage: "interaction-resume-advance-digest",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/interaction-resume-advance-digest-mismatch@5",
      candidate: { faultClass: "interaction_resume_advance_digest_mismatch" },
    });
  }
  return Object.freeze({
    stateKind: "evaluate" as const,
    frame: enterTraversal({
      ...parent,
      predecessorPrefix: completion.successorPrefix,
      input: parent.input,
      inputDigest: parent.inputDigest,
      resume: {
        cursor: completion.nextCursor,
        input,
        inputDigest,
      },
    }),
    returns,
  });
}

function traversalProgram(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecuteGraphTraversalResult, GraphTraversalFailure> {
  return liftGraphTraversalFailure(Effect.suspend((): Effect.Effect<
    ExecuteGraphTraversalResult,
    GraphTraversalFailure
  > => {
    if ("interactionResume" in input) {
      const prepared = prepareHeldInteractionResume(input);
      if (isGraphTraversalEntryRefusal(prepared)) {
        return Effect.succeed(prepared);
      }
      const resumed = resumeInteractionOwner(prepared.interaction);
      return evaluateTraversalProgram(seedParentContinuation(
        prepared.current,
        resumed,
        exactParentReturns(
          prepared.current,
          prepared.parentFrames,
          resumed.successorPrefix,
        ),
      ));
    }
    return evaluateTraversalProgram(Object.freeze({
      stateKind: "evaluate" as const,
      frame: enterTraversal(input),
      returns: Object.freeze([]),
    }));
  }));
}

export async function executeGraphTraversal(
  input: ExecuteGraphTraversalRequest,
): Promise<ExecuteGraphTraversalResult> {
  const exit = await runEffectProgram(traversalProgram(input));
  if (Exit.isSuccess(exit)) return exit.value;
  const failure = Cause.failureOption(exit.cause);
  if (
    Option.isSome(failure) &&
    failure.value instanceof GraphTraversalFailure
  ) {
    return projectGraphTraversalFailure(failure.value);
  }
  throw exit.cause;
}
