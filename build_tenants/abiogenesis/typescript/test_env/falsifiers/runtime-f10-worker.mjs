import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);
const abg = await import(
  `${pathToFileURL(join(
    input.installedPackageRoot,
    "build/code/src/abg/index.js",
  )).href}?fresh=${process.pid}`
);
const eventStore = await import(
  pathToFileURL(join(
    input.installedPackageRoot,
    "build/code/src/abg/event_store.js",
  )).href
);

const store = new abg.AbgEventStore();
for (const expected of input.events) {
  const candidate = structuredClone(expected);
  delete candidate.eventId;
  delete candidate.admissionOrdinal;
  delete candidate.payloadDigest;
  assert.deepEqual(eventStore.admitRuntimeEvent(store, candidate), expected);
}

const state = abg.rehydrateAdmittedCCallState(
  store,
  input.cCall,
  input.result,
  input.judgment,
);
assert.ok(state);
const result = structuredClone(state.result);
const judgment = structuredClone(state.judgment);
const accepted = abg.hasCurrentAdmittedCCallOutcome(
  store,
  state.cCall,
  result,
  judgment,
);
const substituted = structuredClone(judgment);
substituted.reasonRef = "reason://abiogenesis/s06/ax-f10/substituted@5";
const substitutedAccepted = abg.hasCurrentAdmittedCCallOutcome(
  store,
  state.cCall,
  result,
  substituted,
);
const replay = abg.replay(store, { runId: state.cCall.runId });
process.stdout.write(JSON.stringify({
  processId: process.pid,
  accepted,
  substitutedAccepted,
  replayDigest: replay.replayDigest,
  cCallProjection: replay.cCalls.find(
    (candidate) => candidate.cCallRef === state.cCall.cCallRef,
  ),
  routeProjection: replay.routes.find(
    (candidate) => candidate.cCallRef === state.cCall.cCallRef,
  ),
}));
