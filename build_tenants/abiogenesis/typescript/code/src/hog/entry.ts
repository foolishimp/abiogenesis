import {
  admitInitialTraversalCursor,
  hasAdmittedTraversalCursorAtPrefix,
  isExecutionBasis,
  isTraversalCursorCandidate,
  projectOpenedTraversalScopeClassAtDurablePrefix,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import {
  assertHeldEventStoreAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import * as AbgRetry from "../abg/retry.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import { validateGraph } from "../validator/graph.js";
import type { ChildTraversalBasis } from "./child_traversal.js";
import { isAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import type {
  ExecuteGraphTraversalCommonInput,
  ExecuteGraphTraversalInput,
  InitialOrNonRetryExecuteGraphTraversalInput,
  GraphTraversalEntryRefusal,
  InteractionResumeTraversalEntryInput,
} from "./traversal_contract.js";
import type { MachineEvaluationFrame } from "./evaluation_frame.js";
import {
  canonicalDigest,
  materializedInputAtCursor,
  runtimePrefixAtDurable,
  sameCanonical,
  traversalBasis,
} from "./operator_support.js";
import {
  traverse,
  traverseFromCursor,
  type TraversalCursor,
  type TraverseResult,
} from "./traversal.js";
import {
  failTraversal,
  refuseTraversalEntry,
} from "./traversal_failure.js";

export function prepareInteractionResumeTraversalEntry(
  input: InteractionResumeTraversalEntryInput,
): InitialOrNonRetryExecuteGraphTraversalInput | GraphTraversalEntryRefusal {
  const graphFunctions = input.leafPort.publication.graphFunctions.filter(
    (candidate) => candidate.name === input.graph.graphFunctionRef,
  );
  if (graphFunctions.length !== 1) {
    return refuseTraversalEntry({
      code: "owner_refusal",
      message:
        "continued run could not reproduce an admitted Graph boundary",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/resume-entry-graph-function@5",
      candidate: { graphFunctionRef: input.graph.graphFunctionRef },
    });
  }
  const graphFunction = graphFunctions[0]!;
  const graphValidation = validateGraph(
    input.graph,
    input.programValidation,
    graphFunction,
    {
      invocationAdmissionRef: input.graph.invocationAdmissionRef,
      admittedInputRef: input.graph.admittedInputRef,
      admittedInputDigest: input.graph.admittedInputDigest,
      admittedInput: input.graphInput,
    },
  );
  if (
    graphValidation.kind !== "graph_validation" ||
    graphValidation.validationRef !== input.executionBasis.graphValidationRef ||
    input.executionBasis.graphRef !== input.graph.materializationRef ||
    input.executionBasis.graphDigest !== input.graph.materializationDigest ||
    input.executionBasis.closureContractRef !==
      input.closureContract.closureContractRef ||
    sha256Canonical(input.graphInput as JsonValue) !==
      input.graph.admittedInputDigest
  ) {
    return refuseTraversalEntry({
      code: "owner_refusal",
      message:
        "continued run could not reproduce an admitted Graph boundary",
      diagnosticRef:
        "diagnostic://abiogenesis/hog/resume-entry-graph-mismatch@5",
      candidate: { graphRef: input.graph.materializationRef },
    });
  }
  return deepFreeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    graphFunction,
    graph: input.graph,
    graphValidation,
    programValidation: input.programValidation,
    implementationSet: input.implementationSet,
    interactionSet: input.interactionSet,
    continuationProductBasis: {
      ...input.continuationProductBasis,
      programValidation: input.programValidation,
      graphValidation,
    },
    leafPort: input.leafPort,
    closureContract: input.closureContract,
    actorRuntimeBinding: input.actorRuntimeBinding,
    input: input.graphInput,
    inputDigest: input.graph.admittedInputDigest,
    eventTime: input.eventTime,
    correlationId: input.correlationId,
  });
}

function failEntry(
  input: ExecuteGraphTraversalCommonInput,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  return failTraversal({
    store: input.store,
    predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    eventTime: input.eventTime,
    correlationId: input.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

export function enterTraversal(
  input: ExecuteGraphTraversalInput,
): MachineEvaluationFrame {
  let projectedRetryResume: AbgRetry.ProjectedRetryResumeSuccess | null = null;
  if (Object.hasOwn(input, "projectedRetryResume")) {
    const candidate = (input as unknown as Readonly<Record<string, unknown>>)
      .projectedRetryResume;
    if (
      Object.hasOwn(input, "input") ||
      Object.hasOwn(input, "inputDigest") ||
      Object.hasOwn(input, "resume") ||
      !AbgRetry.isProjectedRetryResumeCarrier(candidate)
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    if (!sameCanonical(input.predecessorPrefix, candidate.successorPrefix)) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
      );
    }
    projectedRetryResume = candidate;
  }
  const scopeClass = projectOpenedTraversalScopeClassAtDurablePrefix(
    input.predecessorPrefix,
    input.openedTraversalScope,
  );
  if (scopeClass === null) {
    return failEntry(
      input,
      input.predecessorPrefix,
      "scope-class",
      "diagnostic://abiogenesis/hog/scope-class-absent@5",
      { scopeRef: input.openedTraversalScope.scopeRef },
    );
  }
  const projectedBranch = projectedRetryResume !== null;
  const initialInput = projectedBranch
    ? null
    : input as InitialOrNonRetryExecuteGraphTraversalInput;
  if (
    initialInput !== null &&
    (
      !isExecutionBasis(input.executionBasis) ||
      input.graph.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graph.admittedInputDigest !== input.executionBasis.rawInputDigest ||
      input.graphValidation.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graphValidation.admittedInputDigest !==
        input.executionBasis.rawInputDigest ||
      initialInput.inputDigest !== input.executionBasis.rawInputDigest ||
      canonicalDigest(initialInput.input) !== initialInput.inputDigest ||
      canonicalDigest(input.executionBasis.rawInputValue) !==
        input.executionBasis.rawInputDigest ||
      !sameCanonical(initialInput.input, input.executionBasis.rawInputValue)
    )
  ) {
    throw new TypeError(
      "diagnostic://abiogenesis/hog/execution-basis-input-mismatch@5",
    );
  }
  let projectedStop: TraverseResult | null = null;
  let projectedInput: Readonly<Record<string, JsonValue>> | null = null;
  let projectedCursor: TraversalCursor | null = null;
  let projectedExecutionBasis: ExecutionBasis | null = null;
  if (projectedRetryResume !== null) {
    const candidate = projectedRetryResume;
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, candidate.successorPrefix);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
      );
    }
    const reprojected = AbgRetry.projectRetryResumeAtDurablePrefix(
      candidate,
      input.executionBasis,
      input.graph,
      input.graphFunction,
    );
    if (reprojected === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
      );
    }
    let traversal;
    try {
      traversal = traverseFromCursor(traversalBasis(input), candidate.nextCursor);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    if (
      traversal.kind !== "traversal_stop_ref" ||
      traversal.stopClass !== "executable" ||
      !sameCanonical(traversal.cursor, candidate.nextCursor) ||
      !sameCanonical(reprojected.cursor, candidate.nextCursor) ||
      traversal.cursor.inputRef !== candidate.inputRef ||
      traversal.cursor.inputDigest !== candidate.inputDigest ||
      traversal.inputContractRef !== candidate.inputContractRef ||
      sha256Canonical(candidate.inputValue as unknown as JsonValue) !==
        candidate.inputDigest
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    projectedStop = traversal;
    projectedInput = candidate.inputValue;
    projectedCursor = candidate.nextCursor;
    projectedExecutionBasis = reprojected.executionBasis;
  }
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !==
      input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !==
      input.implementationSet.implementationSetDigest
  ) {
    return failEntry(
      input,
      input.predecessorPrefix,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: TraverseResult;
  let resumedCursor: TraversalCursor | undefined = projectedCursor ?? undefined;
  let fallbackInput: Readonly<Record<string, JsonValue>>;
  if (projectedStop !== null && projectedInput !== null) {
    stop = projectedStop;
    fallbackInput = projectedInput;
  } else if (initialInput?.resume !== undefined) {
    resumedCursor = initialInput.resume.cursor;
    if (
      !hasAdmittedTraversalCursorAtPrefix(
        runtimePrefixAtDurable(
          input.predecessorPrefix,
          initialInput.resume.cursor.runId,
        ),
        initialInput.resume.cursor,
      ) ||
      initialInput.resume.cursor.executionBasisRef !== input.executionBasis.basisRef ||
      initialInput.resume.cursor.traversalScopeRef !==
        input.openedTraversalScope.scopeRef ||
      initialInput.resume.cursor.graphRef !== input.graph.materializationRef ||
      initialInput.resume.cursor.inputDigest !== initialInput.resume.inputDigest ||
      initialInput.resume.cursor.retryPath.length !== 0 ||
      sha256Canonical(initialInput.resume.input as unknown as JsonValue) !==
        initialInput.resume.inputDigest
    ) {
      return failEntry(
        input,
        input.predecessorPrefix,
        "resume-basis",
        "diagnostic://abiogenesis/hog/resume-basis-mismatch@5",
        {
          cursorRef: initialInput.resume.cursor.cursorRef,
          inputDigest: initialInput.resume.inputDigest,
        },
      );
    }
    stop = traverseFromCursor(traversalBasis(input), initialInput.resume.cursor);
    fallbackInput = initialInput.resume.input;
  } else {
    if (initialInput === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    try {
      stop = traverse(traversalBasis(input));
    } catch {
      return failEntry(
        input,
        input.predecessorPrefix,
        "initial-traversal",
        "diagnostic://abiogenesis/hog/traversal-exception@5",
        { errorClass: "traversal_exception" },
      );
    }
    fallbackInput = initialInput.input;
  }
  const active = stop.kind === "traversal_stop_ref"
    ? stop.cursor
    : stop.kind === "traversal_cursor" && isTraversalCursorCandidate(stop)
      ? stop
      : null;
  const currentInput = materializedInputAtCursor(input.graph, active)?.value ??
    fallbackInput;
  const graphEntryBasis = projectedExecutionBasis ?? input.executionBasis;
  const graphEntryInput = graphEntryBasis.rawInputValue;
  const graphEntryInputDigest = graphEntryBasis.rawInputDigest;
  if (stop.kind === "traversal_refusal") {
    return failEntry(
      input,
      input.predecessorPrefix,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop;
  const commonRuntime: ExecuteGraphTraversalCommonInput = Object.freeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    programValidation: input.programValidation,
    implementationSet: input.implementationSet,
    interactionSet: input.interactionSet,
    ...(input.continuationProductBasis === undefined
      ? {}
      : { continuationProductBasis: input.continuationProductBasis }),
    leafPort: input.leafPort,
    closureContract: input.closureContract,
    actorRuntimeBinding: input.actorRuntimeBinding,
    ...(input.deferFailedRunStop === undefined
      ? {}
      : { deferFailedRunStop: input.deferFailedRunStop }),
    eventTime: input.eventTime,
    correlationId: input.correlationId,
  });
  let activeRuntime = commonRuntime;
  if (resumedCursor === undefined) {
    const cursorAdmission = admitInitialTraversalCursor(
      input.store,
      input.predecessorPrefix,
      input.executionBasis,
      input.openedTraversalScope,
      input.graph,
      input.graphValidation,
      initialCursor,
      {
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/cursor`,
        causationEventRefs: [],
      },
    );
    if (cursorAdmission.kind !== "traversal_cursor_admission") {
      return failEntry(
        input,
        input.predecessorPrefix,
        "cursor-refusal",
        `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
        cursorAdmission as unknown as JsonValue,
      );
    }
    activeRuntime = Object.freeze({
      ...commonRuntime,
      predecessorPrefix: cursorAdmission.successorPrefix,
    });
  }
  return {
    runtime: activeRuntime,
    scopeClass,
    graphEntryInput,
    graphEntryInputDigest,
    cursor: initialCursor,
    input: currentInput,
    ordinal: 0,
    structuralOrdinal: 0,
  };
}
