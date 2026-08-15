import {
  hasAdmittedImplementationSetAtPrefix,
  rehydrateExecutionBasisAtPrefix,
  type AdmittedImplementationSet,
  type ExecutionBasis,
} from "../abg/execution_basis.js";
import {
  projectAdmittedCCallOutcomeAtPrefix,
  projectCurrentChildParentCCallAtPrefix,
  rehydrateWorkflowCCallAtPrefix,
} from "../abg/c_call.js";
import { projectCCallOutcomeReceiptAtPrefix } from "../abg/c_call_outcome.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import {
  rehydrateOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "../abg/open_call.js";
import type { GtlProgram, RecurseApplication } from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { validateGraph } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";
import {
  projectParentSuspensions,
  type HogReturnFrame,
} from "./evaluator.js";
import {
  rehydrateHeldInteractionCursor,
  resolveTraversalTerm,
  traverseFromCursor,
  type TraverseInput,
} from "./traversal.js";
import type {
  HeldParentTraversalSuspension,
  HeldRecursionSuspension,
  HeldWorkflowSuspension,
} from "./traversal_completion.js";

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

function sameCanonical(left: object, right: object): boolean {
  return sha256Canonical(left as unknown as JsonValue) ===
    sha256Canonical(right as unknown as JsonValue);
}

function rehydrationFailure(stage: string): never {
  throw new TypeError(
    `diagnostic://abiogenesis/hog/parent-rehydration-${stage}@5`,
  );
}

function exactParentTraversal(
  input: RehydrateParentReturnFramesInput,
  prefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>,
  suspension: HeldParentTraversalSuspension,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
): TraverseInput {
  const graphFunctions = input.leafPort.publication.graphFunctions.filter(
    (candidate) => candidate.name === suspension.parentGraph.graphFunctionRef,
  );
  if (graphFunctions.length !== 1) return rehydrationFailure("graph-function");
  const graphFunction = graphFunctions[0]!;
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
    scope.executionBasisRef !== executionBasis.basisRef ||
    suspension.parentGraphInputDigest !==
      suspension.parentGraph.admittedInputDigest ||
    sha256Canonical(
        suspension.parentGraphInput as unknown as JsonValue,
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
  return Object.freeze({
    program: input.program,
    graphFunction,
    graph: suspension.parentGraph,
    graphValidation,
    executionBasis,
    openedTraversalScope: scope,
  });
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
): HogReturnFrame {
  const traversal = exactParentTraversal(
    input,
    prefix,
    suspension,
    parentExecutionBasis,
    parentScope,
  );
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
    suspension.parentCCall as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (
    term?.kind !== "c_workflow" ||
    term.graphFunctionRef !== childExecutionBasis.graphFunctionRef ||
    parentCCall === null ||
    parentCCall.cCallRef !== suspension.parentCCall.cCallRef ||
    sha256Canonical(
        suspension.parentInput as unknown as JsonValue,
      ) !== suspension.parentInputDigest ||
    suspension.parentInputDigest !== sourceCursor.inputDigest
  ) {
    return rehydrationFailure("workflow-relation");
  }
  return Object.freeze({
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
    childExecutionBasis,
    childTraversalScope: childScope,
    childInput: suspension.childInput,
    childInputDigest: suspension.childInputDigest,
  });
}

function exactRecursionReturn(
  input: RehydrateParentReturnFramesInput,
  prefix: ReturnType<typeof selectValidatedRuntimeEventPrefix>,
  suspension: HeldRecursionSuspension,
  parentExecutionBasis: ExecutionBasis,
  parentScope: OpenedTraversalScope,
  childExecutionBasis: ExecutionBasis,
  childScope: OpenedTraversalScope,
  terminalMode: "close_run" | "return_to_parent",
): HogReturnFrame {
  const traversal = exactParentTraversal(
    input,
    prefix,
    suspension,
    parentExecutionBasis,
    parentScope,
  );
  const sourceCursor = rehydrateHeldInteractionCursor(
    prefix,
    suspension.sourceCursor,
  );
  const application = traversal.graph.template.applications.find(
    (candidate): candidate is RecurseApplication =>
      candidate.relationKind === "recurse" &&
      candidate.applicationRef === suspension.application.applicationRef,
  );
  const admitted = projectAdmittedCCallOutcomeAtPrefix(
    prefix,
    suspension.evaluatorCCall,
    suspension.evaluatorResult,
    suspension.evaluatorJudgment,
  );
  const outcome = admitted === null
    ? null
    : projectCCallOutcomeReceiptAtPrefix(input.predecessorPrefix, {
        disposition: "judged",
        admitted,
      });
  if (
    sourceCursor === null ||
    application === undefined ||
    !sameCanonical(application, suspension.application) ||
    outcome?.disposition !== "judged" ||
    outcome.admitted.cCall.cCallRef !== suspension.evaluatorCCall.cCallRef ||
    recursionTerminationDecision(
        application,
        suspension.evaluatorResult.value,
      ) !== false ||
    sha256Canonical(
        suspension.evaluatorInput as unknown as JsonValue,
      ) !== suspension.evaluatorInputDigest ||
    suspension.evaluatorInputDigest !== sourceCursor.inputDigest ||
    application.graphFunctionRef !== childExecutionBasis.graphFunctionRef
  ) {
    return rehydrationFailure("recursion-relation");
  }
  return Object.freeze({
    relation: "recursion" as const,
    parent: Object.freeze({
      traversal,
      implementationSet: input.implementationSet,
      leafPort: input.leafPort,
      closureContract: suspension.parentClosureContract,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      cursor: sourceCursor,
      input: suspension.evaluatorInput,
      terminalMode,
    }),
    parentOutcome: outcome,
    application,
    childExecutionBasis,
    childTraversalScope: childScope,
    childInput: suspension.childInput,
    childInputDigest: suspension.childInputDigest,
  });
}

export function rehydrateParentReturnFrames(
  input: RehydrateParentReturnFramesInput,
): readonly HogReturnFrame[] {
  const prefix = selectValidatedRuntimeEventPrefix(
    readRuntimeEventsAtDurablePrefix(input.predecessorPrefix),
  );
  let childExecutionBasis = rehydrateExecutionBasisAtPrefix(
    prefix,
    input.currentChildExecutionBasis.basisRef,
  );
  let childScope = rehydrateOpenedTraversalScopeAtPrefix(
    prefix,
    input.currentChildTraversalScope as unknown as Readonly<
      Record<string, JsonValue>
    >,
  );
  if (
    childExecutionBasis === null ||
    childScope === null ||
    !sameCanonical(childExecutionBasis, input.currentChildExecutionBasis) ||
    !sameCanonical(childScope, input.currentChildTraversalScope)
  ) {
    return rehydrationFailure("current-child");
  }
  const inward: HogReturnFrame[] = [];
  for (const [index, suspension] of input.suspensions.entries()) {
    const parentExecutionBasis = rehydrateExecutionBasisAtPrefix(
      prefix,
      suspension.parentExecutionBasisRef,
    );
    const parentScope = rehydrateOpenedTraversalScopeAtPrefix(
      prefix,
      suspension.parentTraversalScope as unknown as Readonly<
        Record<string, JsonValue>
      >,
    );
    const parentCCallRef = suspension.kind === "held_workflow_suspension"
      ? suspension.parentCCall.cCallRef
      : suspension.evaluatorCCall.cCallRef;
    const terminalMode = index === input.suspensions.length - 1
      ? "close_run" as const
      : "return_to_parent" as const;
    if (
      parentExecutionBasis === null ||
      parentScope === null ||
      suspension.childExecutionBasisRef !== childExecutionBasis.basisRef ||
      suspension.childTraversalScopeRef !== childScope.scopeRef ||
      childExecutionBasis.parentCCallRef !== parentCCallRef ||
      childExecutionBasis.parentExecutionBasisRef !==
        parentExecutionBasis.basisRef ||
      childExecutionBasis.parentTraversalScopeRef !== parentScope.scopeRef ||
      childScope.executionBasisRef !== childExecutionBasis.basisRef ||
      suspension.terminalMode !== terminalMode ||
      sha256Canonical(
          suspension.childInput as unknown as JsonValue,
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
      (suspension.kind === "held_workflow_suspension"
        ? owner.disposition !== "workflow_open" ||
          owner.resultRef !== null || owner.judgmentRef !== null
        : owner.disposition !== "deferred_application_ready" ||
          owner.resultRef !== suspension.evaluatorResult.resultRef ||
          owner.judgmentRef !== suspension.evaluatorJudgment.judgmentRef)
    ) {
      return rehydrationFailure("parent-owner");
    }
    inward.push(
      suspension.kind === "held_workflow_suspension"
        ? exactWorkflowReturn(
            input,
            prefix,
            suspension,
            parentExecutionBasis,
            parentScope,
            childExecutionBasis,
            childScope,
            terminalMode,
          )
        : exactRecursionReturn(
            input,
            prefix,
            suspension,
            parentExecutionBasis,
            parentScope,
            childExecutionBasis,
            childScope,
            terminalMode,
          ),
    );
    childExecutionBasis = parentExecutionBasis;
    childScope = parentScope;
  }
  const returns = Object.freeze(inward.reverse());
  if (
    sha256Canonical(
        projectParentSuspensions(returns) as unknown as JsonValue,
      ) !== sha256Canonical(input.suspensions as unknown as JsonValue)
  ) {
    return rehydrationFailure("outward-projection");
  }
  return returns;
}
