// Implements: T-139
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type { RuntimeEvent } from "./carriers.js";
import { assertRuntimeEvent } from "./event_admission.js";
import { assertNonEmptyString } from "./runtime_support.js";
import type { ConstructionRuntimeEvent } from "./construction_runtime_events.js";

export function isConstructionRuntimeEvent(
  event: RuntimeEvent
): event is ConstructionRuntimeEvent {
  return (
    "constructionEventRef" in event &&
    "episodeId" in event &&
    "iterationOrdinal" in event &&
    "eventSequence" in event
  );
}

function compareConstructionRuntimeEvents(
  left: ConstructionRuntimeEvent,
  right: ConstructionRuntimeEvent
): number {
  if (left.eventSequence !== right.eventSequence) {
    return left.eventSequence - right.eventSequence;
  }
  if (left.iterationOrdinal !== right.iterationOrdinal) {
    return left.iterationOrdinal - right.iterationOrdinal;
  }
  const kindComparison = left.kind.localeCompare(right.kind);
  return kindComparison !== 0
    ? kindComparison
    : left.constructionEventRef.localeCompare(right.constructionEventRef);
}

function validateConstructionRuntimeEventCausality(
  events: readonly ConstructionRuntimeEvent[]
): void {
  let episodeStarted = false;
  let evaluatorAwaitingOutcome = false;
  const returnedCandidateRefs = new Set<string>();
  const admittedIntentRefs = new Map<string, string>();
  const selectedIntentRefs = new Map<
    string,
    {
      readonly selectedActionRef: string;
      readonly selectedBindingRef: string;
    }
  >();
  const inFlightIntentRefs = new Map<
    string,
    {
      readonly graphCallId: string;
      readonly frameId: string;
      readonly continuationId: string | null;
      readonly selectedActionRef: string;
    }
  >();

  for (const event of events) {
    switch (event.kind) {
      case "construction_episode_started":
        if (episodeStarted) {
          throw new TypeError("Construction event replay has duplicate episode start");
        }
        episodeStarted = true;
        break;
      case "construction_observation_snapshot_materialized":
      case "construction_action_catalog_projected":
        if (!episodeStarted) {
          throw new TypeError(
            `${event.kind} requires prior construction_episode_started`
          );
        }
        break;
      case "construction_evaluator_invoked":
        if (!episodeStarted) {
          throw new TypeError(
            "construction_evaluator_invoked requires prior construction_episode_started"
          );
        }
        evaluatorAwaitingOutcome = true;
        break;
      case "construction_intent_candidate_returned":
        if (!evaluatorAwaitingOutcome) {
          throw new TypeError(
            "construction_intent_candidate_returned requires prior construction_evaluator_invoked"
          );
        }
        evaluatorAwaitingOutcome = false;
        for (const candidateRef of event.candidateRefs) {
          returnedCandidateRefs.add(candidateRef);
        }
        break;
      case "construction_intent_candidate_admitted":
        if (!returnedCandidateRefs.has(event.candidateId)) {
          throw new TypeError(
            "construction_intent_candidate_admitted requires prior returned candidate"
          );
        }
        admittedIntentRefs.set(event.intentId, event.candidateId);
        break;
      case "construction_intent_candidate_rejected":
        if (!returnedCandidateRefs.has(event.candidateId)) {
          throw new TypeError(
            "construction_intent_candidate_rejected requires prior returned candidate"
          );
        }
        break;
      case "construction_intent_selected":
        if (!admittedIntentRefs.has(event.intentId)) {
          throw new TypeError(
            "construction_intent_selected requires prior admitted construction intent"
          );
        }
        selectedIntentRefs.set(event.intentId, {
          selectedActionRef: event.selectedActionRef,
          selectedBindingRef: event.selectedBindingRef
        });
        break;
      case "construction_pressure_package_materialized": {
        const selection = selectedIntentRefs.get(event.selectedIntentId);
        if (selection === undefined) {
          throw new TypeError(
            "construction_pressure_package_materialized requires prior selected construction intent"
          );
        }
        if (selection.selectedActionRef !== event.selectedActionRef) {
          throw new TypeError(
            "construction_pressure_package_materialized selected action contradicts selected intent"
          );
        }
        break;
      }
      case "construction_graph_action_invoked": {
        const selection = selectedIntentRefs.get(event.intentId);
        if (selection === undefined) {
          throw new TypeError(
            "construction_graph_action_invoked requires prior selected construction intent"
          );
        }
        if (selection.selectedActionRef !== event.selectedActionRef) {
          throw new TypeError(
            "construction_graph_action_invoked selected action contradicts selected intent"
          );
        }
        inFlightIntentRefs.set(event.intentId, {
          graphCallId: event.graphCallId,
          frameId: event.frameId,
          continuationId: event.continuationId,
          selectedActionRef: event.selectedActionRef
        });
        break;
      }
      case "construction_delta_observed": {
        const inFlight = inFlightIntentRefs.get(event.intentId);
        if (inFlight === undefined) {
          throw new TypeError(
            "construction_delta_observed requires prior in-flight graph action invocation"
          );
        }
        if (
          inFlight.graphCallId !== event.graphCallId ||
          inFlight.frameId !== event.frameId ||
          inFlight.continuationId !== event.continuationId
        ) {
          throw new TypeError(
            "construction_delta_observed runtime scope contradicts in-flight graph action"
          );
        }
        inFlightIntentRefs.delete(event.intentId);
        break;
      }
      case "construction_terminal_disposition_projected": {
        if (!episodeStarted) {
          throw new TypeError(
            "construction_terminal_disposition_projected requires prior construction_episode_started"
          );
        }
        if (event.selectedIntentId !== null) {
          const selection = selectedIntentRefs.get(event.selectedIntentId);
          if (selection === undefined) {
            throw new TypeError(
              "construction_terminal_disposition_projected selected intent was not admitted and selected"
            );
          }
          if (
            event.selectedActionRef !== null &&
            selection.selectedActionRef !== event.selectedActionRef
          ) {
            throw new TypeError(
              "construction_terminal_disposition_projected selected action contradicts selected intent"
            );
          }
        }
        break;
      }
    }
  }
}

export function admitConstructionRuntimeEvents(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): readonly ConstructionRuntimeEvent[] {
  assertNonEmptyString(input.episodeId, "ConstructionRuntimeEvents.episodeId");
  const admitted: ConstructionRuntimeEvent[] = [];
  const seenRefs = new Set<string>();
  for (const event of input.events) {
    assertRuntimeEvent(event);
    if (!isConstructionRuntimeEvent(event)) {
      throw new TypeError(
        `Construction event replay received non-construction event ${JSON.stringify(event.kind)}`
      );
    }
    if (event.episodeId !== input.episodeId) {
      throw new TypeError(
        `Construction event ${JSON.stringify(event.constructionEventRef)} belongs to ${JSON.stringify(event.episodeId)}, not ${JSON.stringify(input.episodeId)}`
      );
    }
    if (seenRefs.has(event.constructionEventRef)) {
      throw new TypeError(
        `Duplicate constructionEventRef ${JSON.stringify(event.constructionEventRef)}`
      );
    }
    seenRefs.add(event.constructionEventRef);
    admitted.push(event);
  }
  const ordered = admitted.sort(compareConstructionRuntimeEvents);
  validateConstructionRuntimeEventCausality(ordered);
  return Object.freeze(ordered);
}
