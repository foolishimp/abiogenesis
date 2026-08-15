import * as Abg from "../abg/index.js";
import type {
  AbgEventStore,
  AdmittedInteractionSet,
  ContinuationProductBasis,
  ExecutionBasis,
  InteractionCCallLocusCandidate,
  OpenedTraversalScope,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import * as Routes from "./route_proposal.js";
import {
  admissionBasis,
  replayAtDurable,
} from "./operator_support.js";
import { failTraversal } from "./traversal_failure.js";
import {
  projectExecutableTraversalCompletion,
  type ExecutableTraversalCompletion,
} from "./traversal_completion.js";

export interface InteractionHoldInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis?: ContinuationProductBasis;
  readonly closureContract: Readonly<ClosureContract>;
  readonly stop: InteractionCCallLocusCandidate;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly ordinal: number;
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface InteractionHoldEvaluation {
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: null;
  readonly outputContractRef: null;
}

export function holdInteraction(
  input: InteractionHoldInput,
): InteractionHoldEvaluation {
  const productBasis = input.continuationProductBasis;
  const row = Abg.selectAdmittedInteractionContract(input.interactionSet, {
    graphFunctionRef: input.graph.graphFunctionRef,
    nodeRef: input.stop.nodeRef,
    programLocusRef: input.stop.programLocusRef,
    interactionKind: input.stop.interactionKind,
    actorCapabilityRef: input.stop.actorCapabilityRef,
    requestContractRef: input.stop.requestContractRef,
    responseContractRef: input.stop.responseContractRef,
    continuationContractRef: input.stop.continuationContractRef,
  });
  if (
    productBasis === undefined ||
    row === null ||
    sha256Canonical(input.value) !== input.stop.cursor.inputDigest
  ) {
    return failTraversal({
      ...input,
      stage: `interaction-${input.ordinal}`,
      diagnosticRef:
        "diagnostic://abiogenesis/interaction/admitted-basis-absent@5",
      candidate: input.stop as unknown as JsonValue,
    });
  }
  const clock = {
    eventTime: input.eventTime,
    correlationId: input.correlationId,
  };
  const opened = Abg.openCCall({
    locusClass: "interaction",
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    scope: input.openedTraversalScope,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    stop: input.stop,
    interactionSet: input.interactionSet,
    interaction: row,
    basis: admissionBasis(clock, `interaction/${input.ordinal}/open`),
  });
  if (opened.kind !== "c_call_admission") {
    return failTraversal({
      ...input,
      stage: `interaction-open-${input.ordinal}`,
      diagnosticRef: `diagnostic://abiogenesis/interaction/${opened.code}@5`,
      candidate: opened as unknown as JsonValue,
    });
  }
  const pendingBasis = admissionBasis(
    clock,
    `interaction/${input.ordinal}/pending`,
  );
  const plan = Abg.planPendingInteractionAdmission(
    input.store,
    input.graph,
    input.graphFunction,
    input.stop.cursor,
    opened.cCall,
    input.value,
    input.stop.cursor.inputDigest,
    pendingBasis,
  );
  const proposal = Routes.proposeHoldRoute(
    input.graph,
    input.stop,
    opened.cCall,
    plan.pending.judgment,
    plan.replayState,
    input.stop.continuationContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failTraversal({
      ...input,
      predecessorPrefix: opened.successorPrefix,
      stage: `interaction-hold-route-${input.ordinal}`,
      diagnosticRef: `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      candidate: proposal as unknown as JsonValue,
    });
  }
  const candidate = Abg.completeTraversalTransitionCandidate({
    kind: "traversal_transition_candidate",
    schemaVersion: "5.0.0",
    transitionClass: "route",
    route: proposal,
    evidence: {
      evidenceClass: "hold",
      graphFunction: input.graphFunction,
      cCall: opened.cCall,
      result: plan.pending.result,
      judgment: plan.pending.judgment,
    },
    terminalizeRun: false,
  });
  const admitted = Abg.admitFhInteractionHold({
    predecessorPrefix: opened.successorPrefix,
    store: input.store,
    executionBasis: input.executionBasis,
    scope: input.openedTraversalScope,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    interactionSet: input.interactionSet,
    cursor: input.stop.cursor,
    request: input.value,
    expectedInputDigest: input.stop.cursor.inputDigest,
    pendingPlan: plan,
    routeCandidate: candidate,
    productBasis,
    inputValue: input.value,
    pendingBasis,
    routeBasis: admissionBasis(clock, `interaction/${input.ordinal}/hold`),
    continuationBasis: admissionBasis(
      clock,
      `interaction/${input.ordinal}/continuation`,
    ),
  });
  return {
    completion: projectExecutableTraversalCompletion(
      "held",
      replayAtDurable(
        admitted.successorPrefix,
        input.openedTraversalScope.runId,
      ),
      admitted.successorPrefix,
      {
        cCallRef: opened.cCall.cCallRef,
        resultRef: admitted.pending.result.resultRef,
        judgmentRef: admitted.pending.judgment.judgmentRef,
        resultValue: admitted.pending.result.value,
        continuationRef: admitted.continuation.continuationRef,
        heldCursor: input.stop.cursor,
        heldGraph: input.graph,
        heldClosureContract: input.closureContract,
        heldInteraction: deepFreeze({
          cCall: opened.cCall,
          result: admitted.pending.result,
          judgment: admitted.pending.judgment,
          cursor: input.stop.cursor,
        }),
      },
    ),
    outputValueKind: null,
    outputContractRef: null,
  };
}
