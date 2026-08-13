import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { cloneEventPrefixResource } from "../support/new-empty-append-sink.mjs";

let bytes = "";
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);
const moduleRoot = join(input.installedPackageRoot, "build/code/src/abg");
const abg = await import(
  `${pathToFileURL(join(moduleRoot, "index.js")).href}?stale-owner=${process.pid}`
);
const cCallModule = await import(
  `${pathToFileURL(join(moduleRoot, "c_call.js")).href}?stale=${process.pid}`
);
const eventStoreModule = await import(
  pathToFileURL(join(moduleRoot, "event_store.js")).href
);

function deeplyFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deeplyFreeze(child);
  return Object.freeze(value);
}

const storeResource = await cloneEventPrefixResource(
  abg,
  eventStoreModule,
  input.events,
  "abi5-stale-rehydrate-worker-",
);
const store = storeResource.store;

const opened = input.events.find(
  (event) =>
    event.kind === "c_call_opened" &&
    event.payload.cCallRef === input.coordinates.cCallRef,
);
const fibre = input.events.find(
  (event) =>
    event.kind === "c_call_fibre_selected" &&
    event.payload.cCallRef === input.coordinates.cCallRef,
);
const resultEvent = input.events.find(
  (event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.resultRef === input.coordinates.resultRef,
);
const judgmentEvent = input.events.find(
  (event) =>
    event.kind === "c_call_judged" &&
    event.payload.judgmentRef === input.coordinates.judgmentRef,
);
assert.ok(opened && fibre && resultEvent && judgmentEvent);

const cCall = deeplyFreeze({
  kind: "c_call",
  schemaVersion: "5.0.0",
  ...opened.payload,
  runId: opened.runId,
  ...fibre.payload,
  openedEventRef: opened.eventId,
  fibreSelectedEventRef: fibre.eventId,
});
const result = deeplyFreeze({
  ...resultEvent.payload,
  kind: "admitted_c_call_result",
  schemaVersion: "5.0.0",
  disposition: "admitted",
  admissionEventRef: resultEvent.eventId,
});
const judgment = deeplyFreeze({
  ...judgmentEvent.payload,
  kind: "admitted_c_call_judgment",
  schemaVersion: "5.0.0",
  disposition: "admitted",
  admissionEventRef: judgmentEvent.eventId,
});

const state = cCallModule.rehydrateAdmittedCCallState(
  store,
  cCall,
  result,
  judgment,
);
const output = {
  processId: process.pid,
  state,
  sameCCallBranded: cCallModule.isCCall(cCall),
  sameResultBranded: cCallModule.isAdmittedCCallResult(result),
  sameJudgmentBranded: cCallModule.isAdmittedCCallJudgment(judgment),
  currentOutcome: cCallModule.projectAdmittedCCallOutcomeAtPrefix(
    abg.selectValidatedRuntimeEventPrefix(store.readAll(), {
      runId: cCall.runId,
    }),
    cCall,
    result,
    judgment,
  ) !== null,
};
await storeResource.dispose();
process.stdout.write(JSON.stringify({
  ...output,
}));
