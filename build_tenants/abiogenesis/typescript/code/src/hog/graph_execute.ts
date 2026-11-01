import { admitPendingConstructionIntentContinuation, projectPendingExecutionContinuations } from "../abg/construction_continuation.js";
import { projectOpenedCCallCarrierAtPrefix } from "../abg/c_call.js";
import { rehydrateExecutionBasisAtPrefix } from "../abg/execution_basis.js";
import { projectOpenedTraversalScopeForFrameAtPrefix } from "../abg/open_call.js";
import { materializeGraph } from "../gtl/materialize.js";
import { validateGraph } from "../validator/graph.js";
import { isRecord } from "../shared/admit/index.js";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";

import {
  projectOpenedTraversalScopeClassAtDurablePrefix,
  selectAdmittedImplementationResolution,
} from "../abg/index.js";
import { indexedRuntimeEvents, projectOwnedRuntimeEventPrefixAtDurablePrefix } from "../abg/event_prefix.js";
import { projectAdmittedTraversalCursorAtPrefix, projectTraversalInputAtPrefix } from "../abg/traversal_cursor.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import { resolveCProgramTermAtSourcePath } from "../gtl/source_path.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { runEffectProgram } from "../shared/effect_definition.js";
import {
  constructChildTraversalBasis,
  type ChildTraversalBasis,
} from "./child_traversal.js";
import {
  evaluateOwnedExecutableCCall as evaluateExecutableCCall,
  type ExecutableCCallContext,
} from "./ccall_lifecycle.js";
import { enterTraversal } from "./entry.js";
import type {
  EvaluationFrame,
  MachineEvaluationFrame,
  MachineWorkflowReturnFrame,
  WorkflowReturnFrame,
} from "./evaluation_frame.js";
import { holdOwnedInteraction as holdInteraction } from "./interaction_lifecycle.js";
import {
  isExactLocusStep,
  traversalBasis,
} from "./operator_support.js";
import {
  rehydrateParentReturnFrames,
} from "./parent_rehydration.js";
import {
  beginOwnedRecursionApplication as beginRecursionApplication,
  completeOwnedRecursionChild as completeRecursionChild,
  rehydrateOwnedRecursionChildFoldFrame,
  recursionApplication,
  type CompleteExecutableTraversalInput,
} from "./recursion_lifecycle.js";
import {
  advanceOwnedRetryLifecycle as advanceRetryLifecycle,
  resumeProjectedRetry,
  type ProjectedRetryResumeRefusal,
  type ProjectedRetryResumeRefusalCode,
  type ProjectedRetryResumeResult,
  type ResumeProjectedRetryRequest,
  type ResumeProjectedRetryRuntime,
} from "./retry_lifecycle.js";
import { advanceOwnedStructuralTransition as advanceStructuralTransition } from "./structural_transition.js";
import {
  failTraversal,
  GraphTraversalFailure,
  projectGraphTraversalFailure,
  refuseTraversalEntry,
} from "./traversal_failure.js";
import {
  resolveTraversalTerm,
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
  ResumeConstructionIntentInput,
  ResumePendingExecutionInput,
} from "./traversal_contract.js";
import {
  type ExecutableTraversalCompletion,
  type HeldInteractionTraversal,
  type HeldParentTraversalSuspension,
  type HeldWorkflowSuspension,
} from "./traversal_completion.js";
import {
  beginOwnedWorkflowLocus as beginWorkflowLocus,
  completeOwnedWorkflowLocus as completeWorkflowLocus,
  type WorkflowChildFoldFrame,
  type WorkflowLocusAuthority,
} from "./workflow_lifecycle.js";

export { GraphTraversalFailure };
export { resumeProjectedRetry };
export type {
  ExecuteGraphTraversalCommonInput,
  ExecuteGraphTraversalInput,
  ExecuteGraphTraversalRequest,
  GraphTraversalEntryRefusal,
  GraphTraversalFailureResult,
  ExecutableTraversalCompletion,
  HeldInteractionTraversal,
  HeldParentTraversalSuspension,
  HeldWorkflowSuspension,
  InitialOrNonRetryExecuteGraphTraversalInput,
  ProjectedRetryResumeRefusal,
  ProjectedRetryResumeRefusalCode,
  ProjectedRetryResumeResult,
  ResumeProjectedRetryRequest,
  ResumeProjectedRetryRuntime,
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
      evaluation: OwnedTraversalLocusEvaluation;
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
      frame: OwnedRecursionChildFoldFrame;
      prepared: import("./child_traversal.js").PreparedChildTraversal;
      correlationId: string;
      outputValueKind: string;
      outputContractRef: string;
    }>;


import { completePublicOutcome } from "../abg/c_call_outcome.js";
import type { OwnedExecutableTraversalCompletion } from "./traversal_completion.js";
import type { OwnedTraversalMachineState, OwnedMachineReturnFrame } from "./evaluation_frame.js";
import type { OwnedRecursionChildFoldFrame } from "./recursion_lifecycle.js";
import type { OwnedTraversalLocusEvaluation } from "./workflow_lifecycle.js";
/** @internal */
export type ExecuteOwnedGraphTraversalResult = OwnedExecutableTraversalCompletion | GraphTraversalEntryRefusal | GraphTraversalFailureResult;
function childTraversalBasis(
  runtime: ExecuteGraphTraversalCommonInput,
): ChildTraversalBasis {
  return constructChildTraversalBasis({
    graphFunctionByRef: runtime.leafPort.graphFunctionByRef,
    closureContractByRef: runtime.leafPort.closureContractByRef,
    program: runtime.program,
    ...(runtime.programPublication === undefined ? {} : { programPublication: runtime.programPublication }),
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
        term,
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
    ...(runtime.programPublication === undefined ? {} : { programPublication: runtime.programPublication }),
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    graphValidation: runtime.graphValidation,
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
  completion: OwnedExecutableTraversalCompletion,
): CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>> {
  return recursionTraversalInputAt(frame, context, completion.successorPrefix) ?? failFrame(
    frame,
    completion.successorPrefix,
    `recursion-resolution-${frame.ordinal}`,
    "diagnostic://abiogenesis/implementation/admitted-row-absent@5",
    context.stop,
  );
}

/** The one termination-leaf input shape, shared by ordinary descent and the
 * pending-execution restoration of an existing recursion return. */
function recursionTraversalInputAt(
  frame: MachineEvaluationFrame,
  context: ExecutableCCallContext,
  predecessorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
): CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>> | null {
  const resolution = selectAdmittedImplementationResolution(
    context.implementationSet,
    {
      graphFunctionRef: context.graph.graphFunctionRef,
      nodeRef: context.stop.nodeRef,
      programLocusRef: context.stop.programLocusRef,
      implementationBindingRef: context.stop.implementationBindingRef,
    },
  );
  if (resolution === null) return null;
  return Object.freeze({
    store: context.store,
    predecessorPrefix,
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
          frame.cursor,
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
        frame.cursor,
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
        current,
      ));
    }
    if (term.fibre === "F_H") {
      if (current.stopClass !== "interaction") {
        return Effect.sync(() => failFrame(
          frame,
          runtime.predecessorPrefix,
          `interaction-step-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/interaction-step-mismatch@5",
          current,
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
        current,
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
  evaluation: OwnedTraversalLocusEvaluation,
  returns: readonly OwnedMachineReturnFrame[],
): OwnedTraversalMachineState {
  const runtime = frame.runtime;
  const completion = evaluation.completion;
  if (completion.disposition !== "advanced") {
    return Object.freeze({
      stateKind: "return" as const,
      completion,
      returns: Object.freeze([...returns]),
    });
  }
  const selected = completion.nextCursor === null ? null : projectTraversalInputAtPrefix(
    projectOwnedRuntimeEventPrefixAtDurablePrefix(completion.successorPrefix),
    runtime.graph, runtime.executionBasis, completion.nextCursor);
  const targetTerm = completion.nextCursor === null ? null : resolveCProgramTermAtSourcePath(
    runtime.graph.template, completion.nextCursor.currentNodeRef, completion.nextCursor.termPath);
  if (
    completion.nextCursor === null ||
    completion.continuationKind === null ||
    completion.nextInputContractRef === null ||
    evaluation.outputValueKind === null ||
    evaluation.outputContractRef === null ||
    selected === null || typeof selected.value !== "object" || selected.value === null || Array.isArray(selected.value) ||
    targetTerm === null || targetTerm.kind === "c_source_path_refusal" ||
    !runtime.leafPort.validateContractValueByRef(targetTerm.inputCarrierRef, selected.value)
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
      input: selected.value,
      ordinal: frame.ordinal + 1,
      structuralOrdinal: 0,
    }),
    returns: Object.freeze([...returns]),
  });
}

type ActiveTraversalMachineState = Extract<
  OwnedTraversalMachineState,
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
): Effect.Effect<OwnedExecutableTraversalCompletion, GraphTraversalFailure> {
  const program = Effect.iterate<
    OwnedTraversalMachineState,
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
        const evaluation: OwnedTraversalLocusEvaluation =
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
        const selected = projectTraversalInputAtPrefix(
          projectOwnedRuntimeEventPrefixAtDurablePrefix(advanced.successorPrefix),
          frame.runtime.graph, frame.runtime.executionBasis, advanced.cursor);
        if (selected === null || !isRecord(selected.value))
          return Effect.sync(() => failFrame(frame, advanced.successorPrefix, `structural-input-${frame.ordinal}`,
            "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5", advanced.cursor));
        return Effect.succeed(Object.freeze({
          stateKind: "evaluate" as const,
          frame: Object.freeze({
            ...frame,
            runtime: Object.freeze({
              ...frame.runtime,
              predecessorPrefix: advanced.successorPrefix,
            }),
            cursor: advanced.cursor,
            input: selected.value,
            structuralOrdinal: frame.structuralOrdinal + 1,
          }),
          returns: Object.freeze([...state.returns]),
        }));
      }
      return Effect.flatMap(evaluateLocus(frame, term), (owner) => Effect.promise(async () => {
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
          const childLeafPort = await frame.runtime.leafPort.forGraphFunction(prepared.graphFunction.name);
          if (childLeafPort === null) return failFrame(frame, prepared.successorPrefix,
            "child-semantics", "diagnostic://abiogenesis/hog/child-semantics-owner-absent@5",
            { graphFunctionRef: prepared.graphFunction.name });
          const child = enterTraversal({
            ...frame.runtime,
            ...prepared,
            leafPort: childLeafPort,
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
          const returnFrame: OwnedMachineReturnFrame =
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
      }));
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
    ...(base.programPublication === undefined ? {} : { programPublication: base.programPublication }),
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
  frame: WorkflowReturnFrame,
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
      term,
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

interface ParentReturnsPreflight {
  readonly kind: "parent_returns_preflight";
  readonly frames: readonly WorkflowReturnFrame[];
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
  input: Pick<ResumeConstructionIntentInput, "parentSuspensions">,
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
  frames: readonly WorkflowReturnFrame[],
  successorPrefix: ExecuteGraphTraversalCommonInput["predecessorPrefix"],
): readonly OwnedMachineReturnFrame[] {
  return Object.freeze(frames.map((frame, ordinal) =>
    machineWorkflowReturn(
      current,
      frame,
      successorPrefix,
      ordinal,
    )));
}

type PendingExecutionLevel = Readonly<{
  runtime: ExecuteGraphTraversalCommonInput;
  scopeClass: "root" | "child";
}>;

function pendingRestorationRefusal(stage: string, candidate: JsonValue): GraphTraversalEntryRefusal {
  return resumeEntryRefusal("owner_refusal", `pending execution could not be restored: ${stage}`,
    "diagnostic://abiogenesis/hog/pending-execution-restoration-mismatch@5", { stage, candidate });
}

/** The parent position of one open return: the cursor at which its admitted
 * parent call opened, with that cursor's admitted input. */
function pendingParentFrame(
  prefix: ReturnType<typeof projectOwnedRuntimeEventPrefixAtDurablePrefix>,
  level: PendingExecutionLevel,
  parentCCallRef: string,
): MachineEvaluationFrame | string {
  const { runtime } = level;
  const opened = indexedRuntimeEvents(prefix, "related:" + parentCCallRef).filter(event =>
    event.kind === "c_call_opened" && event.aggregateId === parentCCallRef &&
    event.runId === runtime.openedTraversalScope.runId && event.frameId === runtime.openedTraversalScope.frameId &&
    event.basisId === runtime.executionBasis.basisRef && isRecord(event.payload));
  const payload = opened.length === 1 && isRecord(opened[0]!.payload) ? opened[0]!.payload : null;
  if (payload === null || typeof payload.cursorRef !== "string" || typeof payload.cursorDigest !== "string") return "parent-call";
  const cursor = projectAdmittedTraversalCursorAtPrefix(prefix, runtime.graph, {
    cursorRef: payload.cursorRef, cursorDigest: payload.cursorDigest as `sha256:${string}`,
    executionBasisRef: runtime.executionBasis.basisRef, runId: runtime.openedTraversalScope.runId,
    graphCallId: runtime.openedTraversalScope.graphCallId, frameId: runtime.openedTraversalScope.frameId,
  });
  const origin = cursor === null ? null : projectTraversalInputAtPrefix(prefix, runtime.graph, runtime.executionBasis, cursor);
  if (cursor === null) return "parent-cursor";
  if (origin === null || !isRecord(origin.value) || origin.inputDigest !== cursor.inputDigest) return "parent-input";
  return Object.freeze({
    runtime,
    scopeClass: level.scopeClass,
    graphEntryInput: runtime.executionBasis.rawInputValue,
    graphEntryInputDigest: runtime.executionBasis.rawInputDigest,
    cursor: cursor as TraversalCursor,
    input: origin.value,
    ordinal: cursor.taskOrdinal ?? 0,
    structuralOrdinal: 0,
  });
}

/** Restore the exact consumed pending execution of this Run. Each child level
 * is the already admitted basis/scope, rematerialized and checked against its
 * admitted graph; workflow returns use the existing parent rehydration owner;
 * recursion returns use the existing deferred-application restoration. The
 * deepest frame re-enters only its admitted pending cursor and progressed input. */
async function pendingExecutionState(
  input: ResumePendingExecutionInput,
): Promise<Extract<OwnedTraversalMachineState, { stateKind: "evaluate" }> | GraphTraversalEntryRefusal> {
  const root = input.root;
  const prefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(root.predecessorPrefix);
  const pending = projectPendingExecutionContinuations(prefix, input.continuation.runId).find(candidate =>
    candidate.continuationRef === input.continuation.continuationRef &&
    candidate.continuationDigest === input.continuation.continuationDigest);
  const head = pending?.chain[0];
  if (pending === undefined || head === undefined || pending.status !== "consumed" || pending.phase !== "undispatched" ||
    pending.terminalEventRef === null || head.basisRef !== root.executionBasis.basisRef ||
    head.frameId !== root.openedTraversalScope.frameId || root.openedTraversalScope.runId !== pending.runId)
    return pendingRestorationRefusal("occurrence", { continuationRef: input.continuation.continuationRef });
  const levels: PendingExecutionLevel[] = [Object.freeze({ runtime: root, scopeClass: "root" as const })];
  for (const link of pending.chain.slice(1)) {
    const parent = levels.at(-1)!.runtime;
    const basis = rehydrateExecutionBasisAtPrefix(prefix, link.basisRef);
    const scope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, link.frameId);
    const graphFunction = basis === null ? null : root.leafPort.graphFunctionByRef(basis.graphFunctionRef);
    if (basis === null || scope === null || graphFunction === null || basis.basisDigest !== link.basisDigest ||
      basis.basisClass !== "child" || basis.parentCCallRef !== link.parentCCallRef ||
      basis.parentExecutionBasisRef !== parent.executionBasis.basisRef ||
      basis.parentTraversalScopeRef !== parent.openedTraversalScope.scopeRef ||
      scope.executionBasisRef !== basis.basisRef || scope.runId !== pending.runId)
      return pendingRestorationRefusal("child-basis", { basisRef: link.basisRef });
    const coordinates = { invocationAdmissionRef: basis.invocationAdmissionRef, admittedInputRef: basis.rawInputAdmissionRef,
      admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue };
    const graph = materializeGraph(graphFunction, coordinates);
    const graphValidation = validateGraph(graph, root.programValidation, graphFunction, coordinates);
    const closureContractRef = graphFunction.declarations["abg.child_closure_contract"];
    const closureContract = closureContractRef === undefined ? null : root.leafPort.closureContractByRef(closureContractRef);
    const leafPort = await root.leafPort.forGraphFunction(graphFunction.name);
    if (graphValidation.kind !== "graph_validation" || graphValidation.validationRef !== basis.graphValidationRef ||
      graph.materializationRef !== basis.graphRef || graph.materializationDigest !== basis.graphDigest ||
      closureContract === null || leafPort === null)
      return pendingRestorationRefusal("child-graph", { basisRef: link.basisRef });
    // Ordinary descent: a non-fan-out workflow child and a recursion child both
    // inherit the parent's deferFailedRunStop, carried by the spread below.
    levels.push(Object.freeze({ scopeClass: "child" as const, runtime: Object.freeze({
      ...parent,
      executionBasis: basis,
      openedTraversalScope: scope,
      graphFunction,
      graph,
      graphValidation,
      closureContract,
      leafPort,
      ...(parent.continuationProductBasis === undefined ? {} : {
        continuationProductBasis: { ...parent.continuationProductBasis, programValidation: root.programValidation, graphValidation },
      }),
      correlationId: `${root.correlationId}/pending/${levels.length}`,
    }) }));
  }
  const base: InitialOrNonRetryExecuteGraphTraversalInput = Object.freeze({
    ...root, input: root.executionBasis.rawInputValue, inputDigest: root.executionBasis.rawInputDigest });
  const returns: OwnedMachineReturnFrame[] = [];
  for (let depth = 1; depth < levels.length; depth++) {
    const parentLevel = levels[depth - 1]!, child = levels[depth]!.runtime, link = pending.chain[depth]!;
    const parentFrame = link.parentCCallRef === null ? "parent-call" : pendingParentFrame(prefix, parentLevel, link.parentCCallRef);
    if (typeof parentFrame === "string" || link.parentCCallRef === null)
      return pendingRestorationRefusal("parent-position", { basisRef: link.basisRef, reason: String(parentFrame) });
    const parent = parentLevel.runtime;
    if (link.relation === "workflow") {
      const parentCCall = projectOpenedCCallCarrierAtPrefix(prefix, parent.graph, link.parentCCallRef, parentFrame.cursor,
        parent.graphFunction, child.graphFunction, root.programValidation);
      if (parentCCall === null) return pendingRestorationRefusal("workflow-call", { cCallRef: link.parentCCallRef });
      const suspension: HeldWorkflowSuspension = Object.freeze({
        kind: "held_workflow_suspension" as const, schemaVersion: "5.0.0" as const,
        parentExecutionBasisRef: parent.executionBasis.basisRef, parentTraversalScope: parent.openedTraversalScope,
        parentGraph: parent.graph, parentClosureContract: parent.closureContract, parentCCall, application: null,
        sourceCursor: parentFrame.cursor, parentGraphInput: parentFrame.graphEntryInput as Readonly<Record<string, JsonValue>>,
        parentGraphInputDigest: parentFrame.graphEntryInputDigest, parentInput: parentFrame.input as Readonly<Record<string, JsonValue>>,
        parentInputDigest: parentFrame.cursor.inputDigest, childExecutionBasisRef: child.executionBasis.basisRef,
        childTraversalScopeRef: child.openedTraversalScope.scopeRef,
        childInput: child.executionBasis.rawInputValue as Readonly<Record<string, JsonValue>>,
        childInputDigest: child.executionBasis.rawInputDigest,
        terminalMode: parentLevel.scopeClass === "root" ? "close_run" as const : "return_to_parent" as const,
      });
      const exact = rehydrateParentReturnFrames({ predecessorPrefix: root.predecessorPrefix, program: root.program,
        programValidation: root.programValidation, implementationSet: root.implementationSet, leafPort: parent.leafPort,
        currentChildExecutionBasis: child.executionBasis, currentChildTraversalScope: child.openedTraversalScope,
        suspensions: [suspension] });
      if (exact.kind === "parent_rehydration_refusal" || exact.frames.length !== 1)
        return pendingRestorationRefusal("workflow-return", { stage: exact.kind === "parent_rehydration_refusal" ? exact.stage : "frames" });
      returns.push(machineWorkflowReturn({ ...base, ...parent, input: base.input, inputDigest: base.inputDigest },
        exact.frames[0]!, root.predecessorPrefix, depth - 1));
      continue;
    }
    const term = resolveTraversalTerm(parent.graph, parentFrame.cursor);
    const stop = term.kind !== "c_of" ? null : traverseFromCursor(traversalBasis(parent), parentFrame.cursor, term);
    if (stop === null || stop.kind !== "traversal_stop_ref" || stop.stopClass !== "executable")
      return pendingRestorationRefusal("recursion-leaf", { cCallRef: link.parentCCallRef });
    const application = recursionApplication(parent.graph, stop.compositionRef);
    const context = executableContext(parentFrame, stop);
    const traversalInput = recursionTraversalInputAt(parentFrame, context, root.predecessorPrefix);
    const outputValueKind = parent.leafPort.contractValueKind(stop.outputContractRef, "output");
    const recursion = application === null || traversalInput === null ? null : rehydrateOwnedRecursionChildFoldFrame({
      traversalInput, application, parentClock: { eventTime: parent.eventTime, correlationId: parent.correlationId },
      graphEntryInput: parentFrame.graphEntryInput as Readonly<Record<string, JsonValue>>,
      graphEntryInputDigest: parentFrame.graphEntryInputDigest, leafOrdinal: parentFrame.ordinal,
      childExecutionBasis: child.executionBasis, childTraversalScope: child.openedTraversalScope,
    });
    if (recursion === null || outputValueKind === null)
      return pendingRestorationRefusal("recursion-return", { cCallRef: link.parentCCallRef });
    returns.push(Object.freeze({ kind: "recursion_return" as const, parent: parentFrame, recursion, outputValueKind,
      outputContractRef: stop.outputContractRef }));
  }
  const deepest = levels.at(-1)!.runtime;
  const cursor = projectAdmittedTraversalCursorAtPrefix(prefix, deepest.graph, {
    cursorRef: pending.pendingCursorRef, cursorDigest: pending.pendingCursorDigest,
    executionBasisRef: deepest.executionBasis.basisRef, runId: pending.runId,
    graphCallId: deepest.openedTraversalScope.graphCallId, frameId: deepest.openedTraversalScope.frameId,
  });
  const origin = cursor === null ? null : projectTraversalInputAtPrefix(prefix, deepest.graph, deepest.executionBasis, cursor);
  if (cursor === null || origin === null || !isRecord(origin.value) || origin.inputRef !== pending.progressedInputRef ||
    origin.inputDigest !== pending.progressedInputDigest)
    return pendingRestorationRefusal("pending-cursor", { cursorRef: pending.pendingCursorRef });
  return Object.freeze({
    stateKind: "evaluate" as const,
    frame: enterTraversal({
      ...deepest,
      input: deepest.executionBasis.rawInputValue as Readonly<Record<string, JsonValue>>,
      inputDigest: deepest.executionBasis.rawInputDigest,
      resume: { cursor, input: origin.value, inputDigest: origin.inputDigest },
    }),
    returns: Object.freeze(returns),
  });
}

function traversalProgram(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecuteOwnedGraphTraversalResult, GraphTraversalFailure> {
  return liftGraphTraversalFailure(Effect.suspend((): Effect.Effect<
    ExecuteOwnedGraphTraversalResult,
    GraphTraversalFailure
  > => {
    if ("pendingExecutionResume" in input) {
      return Effect.flatMap(Effect.promise(() => pendingExecutionState(input)),
        (state): Effect.Effect<ExecuteOwnedGraphTraversalResult, GraphTraversalFailure> =>
          "kind" in state ? Effect.succeed(state) : evaluateTraversalProgram(state));
    }
    if ("constructionResume" in input) {
      const parents = preflightParentReturns(input, input.current);
      if (parents.kind === "graph_traversal_entry_refusal") return Effect.succeed(parents);
      return evaluateTraversalProgram(Object.freeze({ stateKind: "evaluate" as const,
        frame: enterTraversal(input.current),
        returns: exactParentReturns(input.current, parents.frames, input.current.predecessorPrefix) }));
    }
    return evaluateTraversalProgram(Object.freeze({
      stateKind: "evaluate" as const,
      frame: enterTraversal(input),
      returns: Object.freeze([]),
    }));
  }));
}

/** Effect-native HoG entry used by definition programs before the host membrane. */
/** @internal Ordinary Run execution retains no complete historical replay vector. */
export function executeOwnedGraphTraversalEffect(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecuteOwnedGraphTraversalResult, never> {
  return Effect.catchAll(
    traversalProgram(input),
    (failure) => Effect.succeed(projectGraphTraversalFailure(failure)),
  ).pipe(Effect.map(result => {
    if (!("successorPrefix" in result)) return result;
    const current = "current" in input ? input.current : "pendingExecutionResume" in input ? input.root : input;
    const successorPrefix = admitPendingConstructionIntentContinuation(current.store, result.successorPrefix,
      current.openedTraversalScope.runId, current.eventTime, `${current.correlationId}/pending-construction`);
    return successorPrefix === result.successorPrefix ? result : Object.freeze({ ...result, successorPrefix });
  }));
}


export function executeGraphTraversalEffect(input: ExecuteGraphTraversalRequest): Effect.Effect<ExecuteGraphTraversalResult, never> {
 return Effect.map(executeOwnedGraphTraversalEffect(input), result => completePublicOutcome<ExecuteGraphTraversalResult>(result));
}
export async function executeGraphTraversal(
  input: ExecuteGraphTraversalRequest,
): Promise<ExecuteGraphTraversalResult> {
  const exit = await runEffectProgram(executeGraphTraversalEffect(input));
  if (Exit.isSuccess(exit)) return exit.value;
  const defect = Cause.dieOption(exit.cause);
  if (Option.isSome(defect)) throw defect.value;
  throw exit.cause;
}
