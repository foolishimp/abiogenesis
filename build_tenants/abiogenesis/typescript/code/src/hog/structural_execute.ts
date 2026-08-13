import {
  admitRoute,
  replay,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type RetryAdmissionRefusal,
  type RouteAdmissionRefusal,
} from "../abg/index.js";
import { admitRetryAttempt } from "../abg/retry.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import {
  applyAdmittedRoute,
  deriveStructuralTargetCursor,
  resolveTraversalTerm,
  traverseFromCursor,
  type TraversalRefusal,
  type TraversalCursor,
  type TraversalStopRef,
  type TraverseInput,
} from "./traversal.js";
import {
  proposeStructuralRoute,
  type RouteProposalRefusal,
} from "./traversal_route.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { admitSuccessfulRetryExitRoute } from "./retry_exit.js";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import { Effect } from "effect";
import type { CProgramNode } from "../gtl/c_algebra.js";

export interface StructuralTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface AdvanceStructuralTraversalInput extends TraverseInput {
  readonly store: AbgEventStore;
  readonly initial: TraversalCursor;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly inputAuthority: LeafInvocationPort;
  readonly clock: StructuralTraversalClock;
}

export type StructuralTraversalResult =
  | RouteAdmissionRefusal
  | RouteProposalRefusal
  | RetryAdmissionRefusal
  | TraversalRefusal
  | TraversalCursor
  | TraversalStopRef;

function isDescendingStructuralTerm(term: CProgramNode): boolean {
  return term.kind === "c_compose" ||
    term.kind === "c_edge" ||
    term.kind === "c_batch" ||
    term.kind === "c_retry" ||
    term.kind === "c_identity";
}

function retryRefusal(
  code: RetryAdmissionRefusal["code"],
  message: string,
): RetryAdmissionRefusal {
  return {
    kind: "retry_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function materializedInputAtCursor(
  input: AdvanceStructuralTraversalInput,
  cursor: TraversalCursor,
): Readonly<Record<string, JsonValue>> | null {
  for (const materialization of input.graph.fanOutMaterializations) {
    const member = materialization.members.find((candidate) =>
      candidate.ordinal === cursor.taskOrdinal &&
      candidate.memberRef === cursor.inputRef &&
      candidate.memberDigest === cursor.inputDigest
    );
    if (member !== undefined) return member.value;
  }
  return null;
}

export function advanceStructuralTraversal(
  input: AdvanceStructuralTraversalInput,
): Effect.Effect<StructuralTraversalResult> {
  return Effect.suspend(() => Effect.gen(function* () {
  if (
    !isAdmittedLeafInvocationPort(input.inputAuthority) ||
    input.inputAuthority.implementationSetRef !==
      input.executionBasis.implementationSetRef ||
    input.inputAuthority.implementationSetDigest !==
      input.executionBasis.implementationSetDigest ||
    input.inputAuthority.publicationDigest !==
      sha256Canonical(input.inputAuthority.publication as unknown as JsonValue)
  ) {
    return retryRefusal(
      "basis_mismatch",
      "structural traversal requires the exact admitted install-bound leaf port",
    );
  }
  const advance = (
    current: StructuralTraversalResult,
    routeOrdinal: number,
  ): Effect.Effect<StructuralTraversalResult> =>
    Effect.suspend(() => Effect.gen(function* () {
    if (current.kind !== "traversal_cursor") {
      return current;
    }
    const term = resolveTraversalTerm(input.graph, current);
    if (term.kind === "traversal_refusal") return term;
    if (!isDescendingStructuralTerm(term)) {
      return term.kind === "c_of" ? traverseFromCursor(input, current) : current;
    }
    const targetCursor = deriveStructuralTargetCursor(input.graph, current);
    if (targetCursor === null) return current;
    if (targetCursor.kind === "traversal_refusal") return targetCursor;
    const structuralIdentityRetryExit =
      term.kind === "c_identity" &&
      targetCursor.retryPath.length < current.retryPath.length;
    const completionWitnessEventRef = structuralIdentityRetryExit
      ? traversalCursorAdmissionEventRef(input.store, current)
      : null;
    if (structuralIdentityRetryExit && completionWitnessEventRef === null) {
      return {
        kind: "traversal_route_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code: "cursor_mismatch",
        message: "structural identity retry exit has no exact source-cursor witness",
      };
    }
    let retryInputPlan: Readonly<{
      inputRef: string;
      inputDigest: `sha256:${string}`;
      inputContractRef: string;
      inputValueKind: string;
      inputValue: Readonly<Record<string, JsonValue>>;
    }> | null = null;
    if (term.kind === "c_retry") {
      const targetValue = materializedInputAtCursor(
        input,
        targetCursor,
      ) ?? input.inputValue;
      const inputValueKind = input.inputAuthority.contractValueKindByRef(
        term.inputCarrierRef,
      );
      const targetDigest = sha256Canonical(
        targetValue as unknown as JsonValue,
      );
      const targetValid = input.inputAuthority.validateContractValueByRef(
        term.inputCarrierRef,
        targetValue,
      );
      if (
        targetCursor.inputDigest !== targetDigest ||
        inputValueKind === null ||
        !targetValid
      ) {
        return retryRefusal(
          "basis_mismatch",
          "structural retry input lacks its exact admitted typed carrier and preimage",
        );
      }
      retryInputPlan = {
        inputRef: targetCursor.inputRef,
        inputDigest: targetCursor.inputDigest,
        inputContractRef: term.inputCarrierRef,
        inputValueKind,
        inputValue: targetValue,
      };
    }
    const replayState = replay(input.store, {
      runId: input.openedTraversalScope.runId,
    });
    let route: ReturnType<typeof admitRoute>;
    if (structuralIdentityRetryExit) {
      const successfulRoute = admitSuccessfulRetryExitRoute({
        store: input.store,
        executionBasis: input.executionBasis,
        graphFunction: input.graphFunction,
        graph: input.graph,
        sourceCursor: current,
        targetCursor,
        variant: {
          completionClass: "structural_identity_success",
          completionWitnessEventRef: completionWitnessEventRef!,
        },
        basis: {
          eventTime: input.clock.eventTime,
          correlationId:
            `${input.clock.correlationId}/route/${routeOrdinal}/successful-retry-exit`,
          causationEventRefs: [],
        },
      });
      if (successfulRoute.kind !== "successful_retry_exit_route_admission") {
        return {
          kind: "traversal_route_admission_refusal",
          schemaVersion: "5.0.0",
          disposition: "refused",
          code: "candidate_mismatch",
          message:
            `structural identity retry exit refused: ${successfulRoute.code}`,
        };
      }
      route = successfulRoute.route;
    } else {
      const candidate = proposeStructuralRoute(
        input.graph,
        current,
        targetCursor,
        term.kind === "c_retry" ? "retry" : "advance",
        replayState,
      );
      if (candidate.kind !== "traversal_route_candidate") return candidate;
      route = admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        current,
        targetCursor,
        replayState,
        candidate,
        {
          eventTime: input.clock.eventTime,
          correlationId: `${input.clock.correlationId}/route/${routeOrdinal}`,
          causationEventRefs: [],
        },
      );
    }
    if (route.kind !== "admitted_traversal_route") return route;
    if (term.kind === "c_retry") {
      if (retryInputPlan === null) {
        return retryRefusal(
          "cursor_mismatch",
          "structural retry step lost its exact pre-effect input plan",
        );
      }
      const attempt = admitRetryAttempt(
        input.store,
        input.executionBasis,
        input.graph,
        input.graphFunction,
        targetCursor,
        retryInputPlan.inputValue,
        route.admissionEventRef,
        {
          eventTime: input.clock.eventTime,
          correlationId:
            `${input.clock.correlationId}/route/${routeOrdinal}/retry-attempt`,
          causationEventRefs: [],
        },
      );
      if (attempt.kind !== "retry_attempt_admission") return attempt;
    }
    const target = applyAdmittedRoute(
      current,
      targetCursor,
      term.kind === "c_retry" ? "retry" : "advance",
      route,
    );
    if (target.kind === "traversal_refusal") return target;
    const next = traverseFromCursor(input, target);
    return yield* advance(next, routeOrdinal + 1);
  }));
  return yield* advance(input.initial, 0);
  }));
}
