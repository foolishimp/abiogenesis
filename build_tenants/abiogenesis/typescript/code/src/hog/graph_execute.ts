import {
  admitInitialTraversalCursor,
  admitRuntimeFailure,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedImplementationSet,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import {
  isDeclaredConformanceValue,
  resolveConformanceJudgmentRelation,
} from "../gtl/hello_world.js";
import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import { isAdmittedLeafInvocationPort } from "../implementation/invocation_port.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { GraphValidation } from "../validator/graph.js";
import { completeExecutableTraversal, type ExecutableTraversalCompletion } from "./execute.js";
import {
  advanceStructuralTraversal,
  type StructuralTraversalResult,
} from "./structural_execute.js";
import { traverse, traverseFromCursor } from "./traversal.js";

export interface ExecuteGraphTraversalInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly eventTime: string;
  readonly correlationId: string;
}

function fail(
  input: ExecuteGraphTraversalInput,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  );
  throw new TypeError(diagnosticRef);
}

function advanceStructural(
  input: ExecuteGraphTraversalInput,
  value: StructuralTraversalResult,
  ordinal: number,
): StructuralTraversalResult {
  if (value.kind !== "traversal_step") return value;
  return advanceStructuralTraversal({
    store: input.store,
    program: input.program,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    initial: value,
    clock: {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/structural/${ordinal}`,
    },
  });
}

export async function executeGraphTraversal(
  input: ExecuteGraphTraversalInput,
): Promise<ExecutableTraversalCompletion> {
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest
  ) {
    return fail(
      input,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: StructuralTraversalResult;
  try {
    stop = traverse({
      program: input.program,
      graph: input.graph,
      graphValidation: input.graphValidation,
      executionBasis: input.executionBasis,
      openedTraversalScope: input.openedTraversalScope,
    });
  } catch {
    return fail(
      input,
      "initial-traversal",
      "diagnostic://abiogenesis/hog/traversal-exception@5",
      { errorClass: "traversal_exception" },
    );
  }
  if (stop.kind === "traversal_refusal") {
    return fail(
      input,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop.sourceCursor;
  const cursorAdmission = admitInitialTraversalCursor(
    input.store,
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
    return fail(
      input,
      "cursor-refusal",
      `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
      cursorAdmission as unknown as JsonValue,
    );
  }

  stop = advanceStructural(input, stop, 0);
  if (stop.kind !== "traversal_stop_ref") {
    return fail(
      input,
      "structural-step",
      "diagnostic://abiogenesis/hog/structural-step-not-yet-executable@5",
      stop as unknown as JsonValue,
    );
  }

  let currentInput = input.input;
  let completion: ExecutableTraversalCompletion | null = null;
  let leafOrdinal = 0;
  while (stop.kind === "traversal_stop_ref") {
    const exactStop = stop;
    const resolution = selectAdmittedImplementationResolution(
      input.implementationSet,
      {
        graphFunctionRef: input.graph.graphFunctionRef,
        nodeRef: exactStop.nodeRef,
        programLocusRef: exactStop.programLocusRef,
        implementationBindingRef: exactStop.implementationBindingRef,
      },
    );
    if (resolution === null) {
      return fail(
        input,
        `resolution-${leafOrdinal}`,
        "diagnostic://abiogenesis/implementation-resolution/admitted-row-absent@5",
        {
          nodeRef: exactStop.nodeRef,
          programLocusRef: exactStop.programLocusRef,
          implementationBindingRef: exactStop.implementationBindingRef,
        },
      );
    }
    const outputValueKind = input.leafPort.contractValueKind(
      exactStop.outputContractRef,
      "output",
    );
    const failureValueKind = input.leafPort.contractValueKind(
      exactStop.failureContractRef,
      "failure",
    );
    const judgmentRelation = resolveConformanceJudgmentRelation(exactStop.judgmentPredicateRef);
    if (
      outputValueKind === null ||
      failureValueKind === null ||
      judgmentRelation === null
    ) {
      return fail(
        input,
        `contract-${leafOrdinal}`,
        "diagnostic://abiogenesis/implementation/result-contract-absent@5",
        {
          failureContractRef: exactStop.failureContractRef,
          judgmentPredicateRef: exactStop.judgmentPredicateRef,
          outputContractRef: exactStop.outputContractRef,
        },
      );
    }
    completion = await completeExecutableTraversal({
      store: input.store,
      executionBasis: input.executionBasis,
      openedTraversalScope: input.openedTraversalScope,
      program: input.program,
      graph: input.graph,
      traversalStop: exactStop,
      implementationSet: input.implementationSet,
      implementationResolution: resolution,
      input: currentInput,
      inputDigest: exactStop.cursor.inputDigest,
      failureValueKind,
      resultValueKind: outputValueKind,
      validateSuccessCandidate: (value): value is Readonly<Record<string, JsonValue>> =>
        isDeclaredConformanceValue(value, outputValueKind),
      validateSuccessResult: (value): value is Readonly<Record<string, JsonValue>> =>
        isDeclaredConformanceValue(value, outputValueKind) &&
        (exactStop.computeRegime !== "F_P" || judgmentRelation.evaluate(currentInput, value)),
      closureContract: input.closureContract,
      judgmentRelation: {
        predicateRef: judgmentRelation.predicateRef,
        advanceReasonRef: judgmentRelation.advanceReasonRef,
        rejectionReasonRef: judgmentRelation.rejectionReasonRef,
        evaluate: (source, output) => judgmentRelation.evaluate(source, output),
      },
      realize: (value, effects) => input.leafPort.invoke(resolution, value, effects),
      actorRuntimeBinding: input.actorRuntimeBinding,
      clock: {
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/leaf/${leafOrdinal}`,
      },
    });
    if (completion.disposition !== "advanced") break;
    if (
      completion.nextCursor === null ||
      !isDeclaredConformanceValue(completion.resultValue, outputValueKind)
    ) {
      return fail(
        input,
        `advanced-result-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
        { leafOrdinal, completionDisposition: completion.disposition },
      );
    }
    currentInput = completion.resultValue;
    stop = traverseFromCursor(
      {
        program: input.program,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      },
      completion.nextCursor,
    );
    stop = advanceStructural(input, stop, leafOrdinal + 1);
    if (stop.kind !== "traversal_stop_ref") {
      return fail(
        input,
        `continuation-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/continuation-not-executable@5",
        stop as unknown as JsonValue,
      );
    }
    leafOrdinal += 1;
  }
  if (completion === null) {
    return fail(
      input,
      "empty-traversal",
      "diagnostic://abiogenesis/hog/no-executable-completion@5",
      { cursorAdmissionEventRef: traversalCursorAdmissionEventRef(input.store, initialCursor) },
    );
  }
  return completion;
}
