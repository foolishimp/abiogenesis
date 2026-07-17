import {
  constructCurrentObservationMaterializedEvent,
  deriveCurrentObservationBasisProjection
} from "../../../build/semantic/code/src/abg/m03/contracts/current_observation.js";

export function materializedObservationEvent({
  observation,
  program,
  workspaceBinding,
  ordinal,
  eventSuffix = String(ordinal),
  causationEventRefs = Object.freeze([observation.causationRef])
}) {
  const eventTimeUnixMs = Date.parse("2026-07-18T00:00:00.000Z") + ordinal;
  const eventId = `event://t270/observation/${eventSuffix}`;
  const event = constructCurrentObservationMaterializedEvent({
    scope: Object.freeze({
      constructionEventRef:
        `construction-event://t270/observation/${eventSuffix}`,
      basisId: workspaceBinding.ref,
      graphFunctionId: program.ref,
      runId: null,
      workKey: null,
      episodeId: observation.episodeId,
      iterationOrdinal: observation.iterationOrdinal,
      eventSequence: observation.iterationOrdinal,
      basisProjectionRef: observation.basisProjectionRef,
      priorIntentId: observation.priorIntentId,
      causationEventRefs,
      correlationId: observation.correlationId
    }),
    admittedProgram: program,
    workspaceBinding,
    observation
  });
  return Object.freeze({
    ...event,
    eventId,
    eventTime: new Date(eventTimeUnixMs).toISOString(),
    eventTimeUnixMs,
    eventAdmissionOrdinal: ordinal
  });
}

export function currentObservationFixture({
  observation,
  program,
  workspaceBinding,
  ordinal,
  replayEvents = []
}) {
  const event = materializedObservationEvent({
    observation,
    program,
    workspaceBinding,
    ordinal
  });
  const replay = Object.freeze([...replayEvents, event]);
  return Object.freeze({
    event,
    replay,
    projection: deriveCurrentObservationBasisProjection({
      episodeId: observation.episodeId,
      admittedProgram: program,
      workspaceBinding,
      observation,
      replayEvents: replay
    })
  });
}
