import assert from "node:assert/strict";

import {
  assertCanonicalRuntimeEvent,
  emit
} from "../../../build/semantic/code/src/abg/m03/index.js";

export function canonicalRuntimeEvents(events) {
  return emit(events, () => {});
}

export function canonicalRuntimeEvent(event) {
  return canonicalRuntimeEvents(event)[0];
}

export function canonicalEventBody(event) {
  assertCanonicalRuntimeEvent(event);
  const {
    eventId,
    eventTime,
    eventTimeUnixMs,
    eventAdmissionOrdinal,
    ...body
  } = event;
  assert.notEqual(eventId, "");
  assert.match(
    eventTime,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u
  );
  assert.equal(Date.parse(eventTime), eventTimeUnixMs);
  assert.equal(Number.isInteger(eventAdmissionOrdinal), true);
  return body;
}
