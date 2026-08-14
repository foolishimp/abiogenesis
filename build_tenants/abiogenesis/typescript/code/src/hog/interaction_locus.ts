import { selectAdmittedInteractionContract } from "../abg/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { completeInteractionTraversal } from "./execute.js";
import type { ExecuteGraphTraversalCommonInput } from "./graph_execute.js";
import {
  terminalLocusEvaluation,
  type TraversalLocusEvaluation,
  type TraversalLocusFailure,
} from "./locus_evaluation.js";
import type { InteractionTraversalStopRef } from "./traversal.js";

export interface EvaluateInteractionLocusInput {
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly stop: InteractionTraversalStopRef;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly ordinal: number;
  readonly fail: TraversalLocusFailure;
}

export function evaluateInteractionLocus(
  input: EvaluateInteractionLocusInput,
): TraversalLocusEvaluation {
  const { runtime, stop } = input;
  if (runtime.continuationProductBasis === undefined) {
    return input.fail(
      `interaction-basis-${input.ordinal}`,
      "diagnostic://abiogenesis/interaction/product-basis-absent@5",
      stop as unknown as JsonValue,
    );
  }
  const interaction = selectAdmittedInteractionContract(
    runtime.interactionSet,
    {
      graphFunctionRef: runtime.graph.graphFunctionRef,
      nodeRef: stop.nodeRef,
      programLocusRef: stop.programLocusRef,
      interactionKind: stop.interactionKind,
      actorCapabilityRef: stop.actorCapabilityRef,
      requestContractRef: stop.requestContractRef,
      responseContractRef: stop.responseContractRef,
      continuationContractRef: stop.continuationContractRef,
    },
  );
  if (interaction === null) {
    return input.fail(
      `interaction-${input.ordinal}`,
      "diagnostic://abiogenesis/interaction/admitted-row-absent@5",
      stop as unknown as JsonValue,
    );
  }
  return terminalLocusEvaluation(completeInteractionTraversal({
    store: runtime.store,
    executionBasis: runtime.executionBasis,
    openedTraversalScope: runtime.openedTraversalScope,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    traversalStop: stop,
    interactionSet: runtime.interactionSet,
    interaction,
    productBasis: runtime.continuationProductBasis,
    input: input.value,
    inputDigest: stop.cursor.inputDigest,
    closureContract: runtime.closureContract,
    clock: {
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/interaction/${input.ordinal}`,
    },
  }));
}
