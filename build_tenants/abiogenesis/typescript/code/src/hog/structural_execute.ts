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
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import * as Effect from "effect/Effect";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import type { DirectCTraversalStep } from "./direct_fold.js";
import { admitSuccessfulRetryExitRoute } from "./retry_exit.js";
import {
  applyAdmittedRoute,
  deriveStructuralTargetCursor,
  type TraversalCursor,
  type TraversalRefusal,
  type TraverseInput,
} from "./traversal.js";
import {
  proposeStructuralRoute,
  type RouteProposalRefusal,
} from "./traversal_route.js";

export interface StructuralTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface AdvanceStructuralTraversalInput extends TraverseInput {
  readonly store: AbgEventStore;
  readonly initial: TraversalCursor;
  readonly step: DirectCTraversalStep;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly inputAuthority: LeafInvocationPort;
  readonly routeOrdinal: number;
  readonly clock: StructuralTraversalClock;
}

export type StructuralTraversalResult =
  | RouteAdmissionRefusal
  | RouteProposalRefusal
  | RetryAdmissionRefusal
  | TraversalRefusal
  | TraversalCursor;

function refusal(
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

function materializedInput(
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
  return Effect.sync(() => {
    if (
      !isAdmittedLeafInvocationPort(input.inputAuthority) ||
      input.inputAuthority.implementationSetRef !==
        input.executionBasis.implementationSetRef ||
      input.inputAuthority.implementationSetDigest !==
        input.executionBasis.implementationSetDigest ||
      input.inputAuthority.publicationDigest !== sha256Canonical(
        input.inputAuthority.publication as unknown as JsonValue,
      )
    ) {
      return refusal(
        "basis_mismatch",
        "structural traversal requires the exact admitted install-bound leaf port",
      );
    }
    const current = input.initial;
    const direct = input.step;
    if (
      direct.stepKind === "open_leaf" ||
      direct.stepKind === "enter_child" ||
      direct.stepKind === "complete_term" ||
      direct.stepKind === "continue_term"
    ) {
      return refusal(
        "basis_mismatch",
        "structural traversal received a derived continuation outside the active C term",
      );
    }
    const targetCursor = deriveStructuralTargetCursor(
      input.graph,
      current,
      direct,
    );
    if (targetCursor === null || targetCursor.kind === "traversal_refusal") {
      return targetCursor ?? current;
    }
    const structuralRetryExit = direct.stepKind === "pass_identity" &&
      targetCursor.retryPath.length < current.retryPath.length;
    const completionWitness = structuralRetryExit
      ? traversalCursorAdmissionEventRef(input.store, current)
      : null;
    if (structuralRetryExit && completionWitness === null) {
      return {
        kind: "traversal_route_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code: "cursor_mismatch",
        message: "structural identity retry exit has no exact source-cursor witness",
      };
    }
    const targetValue = direct.stepKind === "retry"
      ? materializedInput(input, targetCursor) ?? input.inputValue
      : null;
    if (
      direct.stepKind === "retry" &&
      (
        targetValue === null ||
        input.inputAuthority.contractValueKindByRef(direct.inputCarrierRef) === null ||
        targetCursor.inputDigest !== sha256Canonical(targetValue) ||
        !input.inputAuthority.validateContractValueByRef(
          direct.inputCarrierRef,
          targetValue,
        )
      )
    ) {
      return refusal(
        "basis_mismatch",
        "structural retry input lacks its exact admitted typed carrier and preimage",
      );
    }
    const replayState = replay(input.store, {
      runId: input.openedTraversalScope.runId,
    });
    const clock = (suffix: string) => ({
      eventTime: input.clock.eventTime,
      correlationId:
        `${input.clock.correlationId}/route/${input.routeOrdinal}${suffix}`,
      causationEventRefs: [] as readonly string[],
    });
    let route: ReturnType<typeof admitRoute>;
    if (structuralRetryExit) {
      const admitted = admitSuccessfulRetryExitRoute({
        store: input.store,
        executionBasis: input.executionBasis,
        graphFunction: input.graphFunction,
        graph: input.graph,
        sourceCursor: current,
        targetCursor,
        variant: {
          completionClass: "structural_identity_success",
          completionWitnessEventRef: completionWitness!,
        },
        basis: clock("/successful-retry-exit"),
      });
      if (admitted.kind !== "successful_retry_exit_route_admission") {
        return {
          kind: "traversal_route_admission_refusal",
          schemaVersion: "5.0.0",
          disposition: "refused",
          code: "candidate_mismatch",
          message: `structural identity retry exit refused: ${admitted.code}`,
        };
      }
      route = admitted.route;
    } else {
      const proposal = proposeStructuralRoute(
        input.graph,
        current,
        targetCursor,
        direct.stepKind === "retry" ? "retry" : "advance",
        replayState,
      );
      if (proposal.kind !== "traversal_route_candidate") return proposal;
      route = admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        current,
        targetCursor,
        replayState,
        proposal,
        clock(""),
      );
    }
    if (route.kind !== "admitted_traversal_route") return route;
    if (direct.stepKind === "retry") {
      const attempt = admitRetryAttempt(
        input.store,
        input.executionBasis,
        input.graph,
        input.graphFunction,
        targetCursor,
        targetValue!,
        route.admissionEventRef,
        clock("/retry-attempt"),
      );
      if (attempt.kind !== "retry_attempt_admission") return attempt;
    }
    const target = applyAdmittedRoute(
      current,
      targetCursor,
      direct.stepKind === "retry" ? "retry" : "advance",
      route,
    );
    return target;
  });
}
