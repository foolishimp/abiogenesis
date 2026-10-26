import {
  hasAdmittedImplementationSetAtPrefix,
  rehydrateExecutionBasisAtPrefix,
  type AdmittedImplementationSet,
  type ExecutionBasis,
} from "../abg/execution_basis.js";
import {
  projectCurrentChildParentCCallAtPrefix,
  rehydrateWorkflowCCallAtPrefix,
} from "../abg/c_call.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import {
  projectOpenedTraversalScopeClassAtPrefix,
  rehydrateOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "../abg/open_call.js";
import type {
  FanOutApplication,
  GtlProgram,
} from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import { sha256Canonical } from "../shared/digests.js";
import { validateGraph } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";
import {
  projectParentSuspensions,
  type WorkflowReturnFrame,
} from "./evaluation_frame.js";
import {
  rehydrateHeldInteractionCursor,
  resolveTraversalTerm,
  traverseFromCursor,
  type TraverseInput,
} from "./traversal.js";
import type {
  HeldParentTraversalSuspension,
  HeldWorkflowSuspension,
} from "./traversal_completion.js";
import { canonicalEquals } from "../shared/value/index.js";

export interface RehydrateParentReturnFramesInput {
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly program: Readonly<GtlProgram>;
  readonly programValidation: ProgramValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly currentChildExecutionBasis: ExecutionBasis;
  readonly currentChildTraversalScope: OpenedTraversalScope;
  readonly suspensions: readonly HeldParentTraversalSuspension[];
}

export interface ParentRehydrationRefusal {
  readonly kind: "parent_rehydration_refusal";
  readonly schemaVersion: "5.0.0";
  readonly stage: string;
  readonly diagnosticRef: string;
}

interface Rehydrated<T> {
  readonly kind: "rehydrated";
  readonly value: T;
}

type RehydrationStep<T> = Rehydrated<T> | ParentRehydrationRefusal;

export type ParentReturnFramesRehydration =
  | Readonly<{
      kind: "rehydrated_parent_return_frames";
      frames: readonly WorkflowReturnFrame[];
    }>
  | ParentRehydrationRefusal;

function rehydrated<T>(value: T): Rehydrated<T> {
  return Object.freeze({ kind: "rehydrated", value });
}

function rehydrationFailure(stage: string): ParentRehydrationRefusal {
  return Object.freeze({
    kind: "parent_rehydration_refusal",
    schemaVersion: "5.0.0",
    stage,
    diagnosticRef:
      `diagnostic://abiogenesis/hog/parent-rehydration-${stage}@5`,
  });
}

function exactParentTraversal(
  input: RehydrateParentReturnFramesInput,
  prefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>,
  suspension: HeldParentTraversalSuspension,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
): RehydrationStep<TraverseInput> {
  const graphFunction = input.leafPort.graphFunctionByRef(
    suspension.parentGraph.graphFunctionRef,
  );
  if (graphFunction === null) return rehydrationFailure("graph-function");
  const graphValidation = validateGraph(
    suspension.parentGraph,
    input.programValidation,
    graphFunction,
    {
      invocationAdmissionRef: suspension.parentGraph.invocationAdmissionRef,
      admittedInputRef: suspension.parentGraph.admittedInputRef,
      admittedInputDigest: suspension.parentGraph.admittedInputDigest,
      admittedInput: suspension.parentGraphInput,
    },
  );
  if (
    graphValidation.kind !== "graph_validation" ||
    graphValidation.validationRef !== executionBasis.graphValidationRef ||
    executionBasis.programRef !== input.program.programRef ||
    executionBasis.graphRef !== suspension.parentGraph.materializationRef ||
    executionBasis.graphDigest !== suspension.parentGraph.materializationDigest ||
    executionBasis.closureContractRef !==
      suspension.parentClosureContract.closureContractRef ||
    executionBasis.closureContractDigest !==
      sha256Canonical(suspension.parentClosureContract) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    suspension.parentGraphInputDigest !==
      suspension.parentGraph.admittedInputDigest ||
    sha256Canonical(
        suspension.parentGraphInput,
      ) !== suspension.parentGraphInputDigest ||
    !hasAdmittedImplementationSetAtPrefix(prefix, input.implementationSet) ||
    input.implementationSet.implementationSetRef !==
      executionBasis.rootImplementationSetRef ||
    input.implementationSet.implementationSetDigest !==
      executionBasis.rootImplementationSetDigest ||
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !==
      input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !==
      input.implementationSet.implementationSetDigest
  ) {
    return rehydrationFailure("parent-runtime");
  }
  return rehydrated(Object.freeze({
    program: input.program,
    graphFunction,
    graph: suspension.parentGraph,
    graphValidation,
    executionBasis,
    openedTraversalScope: scope,
  }));
}

function exactWorkflowReturn(
  input: RehydrateParentReturnFramesInput,
  prefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>,
  suspension: HeldWorkflowSuspension,
  parentExecutionBasis: ExecutionBasis,
  parentScope: OpenedTraversalScope,
  childExecutionBasis: ExecutionBasis,
  childScope: OpenedTraversalScope,
  terminalMode: "close_run" | "return_to_parent",
): RehydrationStep<WorkflowReturnFrame> {
  const traversalResult = exactParentTraversal(
    input,
    prefix,
    suspension,
    parentExecutionBasis,
    parentScope,
  );
  if (traversalResult.kind === "parent_rehydration_refusal") {
    return traversalResult;
  }
  const traversal = traversalResult.value;
  const sourceCursor = rehydrateHeldInteractionCursor(
    prefix,
    suspension.sourceCursor,
  );
  if (sourceCursor === null) return rehydrationFailure("workflow-cursor");
  const atCursor = traverseFromCursor(traversal, sourceCursor);
  const term = atCursor.kind === "traversal_cursor"
    ? resolveTraversalTerm(traversal.graph, atCursor)
    : null;
  const parentCCall = rehydrateWorkflowCCallAtPrefix(
    prefix,
    parentExecutionBasis,
    input.implementationSet,
    parentScope,
    traversal.graphFunction,
    traversal.graph,
    sourceCursor,
    suspension.parentCCall,
  );
  const application = suspension.application === null
    ? null
    : traversal.graph.template.applications.find(
        (candidate): candidate is FanOutApplication =>
          candidate.relationKind === "fan_out" &&
          candidate.applicationRef === suspension.application!.applicationRef &&
          candidate.batchRef === suspension.application!.batchRef,
      ) ?? null;
  if (
    term?.kind !== "c_workflow" ||
    term.graphFunctionRef !== childExecutionBasis.graphFunctionRef ||
    parentCCall === null ||
    parentCCall.cCallRef !== suspension.parentCCall.cCallRef ||
    (suspension.application === null
      ? application !== null || parentCCall.batchRef !== null
      : application === null ||
        !canonicalEquals(application, suspension.application) ||
        parentCCall.batchRef !== application.batchRef) ||
    sha256Canonical(
        suspension.parentInput,
      ) !== suspension.parentInputDigest ||
    suspension.parentInputDigest !== sourceCursor.inputDigest
  ) {
    return rehydrationFailure("workflow-relation");
  }
  return rehydrated(Object.freeze({
    relation: "workflow" as const,
    parent: Object.freeze({
      traversal,
      implementationSet: input.implementationSet,
      leafPort: input.leafPort,
      closureContract: suspension.parentClosureContract,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      cursor: sourceCursor,
      input: suspension.parentInput,
      terminalMode,
    }),
    parentCall: parentCCall,
    application,
    childExecutionBasis,
    childTraversalScope: childScope,
    childInput: suspension.childInput,
    childInputDigest: suspension.childInputDigest,
  }));
}

export function rehydrateParentReturnFrames(
  input: RehydrateParentReturnFramesInput,
): ParentReturnFramesRehydration {
  const prefix = selectValidatedRuntimeEventPrefix(
    readRuntimeEventsAtDurablePrefix(input.predecessorPrefix),
  );
  let childExecutionBasis = rehydrateExecutionBasisAtPrefix(
    prefix,
    input.currentChildExecutionBasis.basisRef,
  );
  let childScope = rehydrateOpenedTraversalScopeAtPrefix(
    prefix,
    input.currentChildTraversalScope,
  );
  if (
    childExecutionBasis === null ||
    childScope === null ||
    !canonicalEquals(
      childExecutionBasis,
      input.currentChildExecutionBasis,
    ) ||
    !canonicalEquals(
      childScope,
      input.currentChildTraversalScope,
    )
  ) {
    return rehydrationFailure("current-child");
  }
  const inward: WorkflowReturnFrame[] = [];
  for (const suspension of input.suspensions) {
    const parentExecutionBasis = rehydrateExecutionBasisAtPrefix(
      prefix,
      suspension.parentExecutionBasisRef,
    );
    const parentScope = rehydrateOpenedTraversalScopeAtPrefix(
      prefix,
      suspension.parentTraversalScope,
    );
    const parentCCallRef = suspension.parentCCall.cCallRef;
    const parentScopeClass = parentScope === null
      ? null
      : projectOpenedTraversalScopeClassAtPrefix(prefix, parentScope);
    const terminalMode = parentScopeClass === "root"
      ? "close_run" as const
      : "return_to_parent" as const;
    if (
      parentExecutionBasis === null ||
      parentScope === null ||
      parentScopeClass === null ||
      suspension.childExecutionBasisRef !== childExecutionBasis.basisRef ||
      suspension.childTraversalScopeRef !== childScope.scopeRef ||
      childExecutionBasis.parentCCallRef !== parentCCallRef ||
      childExecutionBasis.parentExecutionBasisRef !==
        parentExecutionBasis.basisRef ||
      childExecutionBasis.parentTraversalScopeRef !== parentScope.scopeRef ||
      childScope.executionBasisRef !== childExecutionBasis.basisRef ||
      suspension.terminalMode !== terminalMode ||
      sha256Canonical(
          suspension.childInput,
        ) !== suspension.childInputDigest ||
      suspension.childInputDigest !== childExecutionBasis.rawInputDigest
    ) {
      return rehydrationFailure("child-lineage");
    }
    const owner = projectCurrentChildParentCCallAtPrefix(prefix, {
      parentCCallRef,
      parentExecutionBasisRef: parentExecutionBasis.basisRef,
      runId: parentScope.runId,
      graphCallId: parentScope.graphCallId,
      frameId: parentScope.frameId,
      childGraphFunctionRef: childExecutionBasis.graphFunctionRef,
      admittedInputRef: childExecutionBasis.rawInputAdmissionRef,
      admittedInputDigest: childExecutionBasis.rawInputDigest,
    });
    if (
      owner?.cCallRef !== parentCCallRef ||
      owner.disposition !== "workflow_open" ||
      owner.resultRef !== null || owner.judgmentRef !== null
    ) {
      return rehydrationFailure("parent-owner");
    }
    const frame = exactWorkflowReturn(
      input,
      prefix,
      suspension,
      parentExecutionBasis,
      parentScope,
      childExecutionBasis,
      childScope,
      terminalMode,
    );
    if (frame.kind === "parent_rehydration_refusal") return frame;
    inward.push(frame.value);
    childExecutionBasis = parentExecutionBasis;
    childScope = parentScope;
  }
  const returns = Object.freeze(inward.reverse());
  if (
    !canonicalEquals(
      projectParentSuspensions(returns),
      input.suspensions,
    )
  ) {
    return rehydrationFailure("outward-projection");
  }
  return Object.freeze({
    kind: "rehydrated_parent_return_frames" as const,
    frames: returns,
  });
}
