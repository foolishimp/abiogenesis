import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);
const abg = await import(
  pathToFileURL(join(
    input.installedPackageRoot,
    "build/code/src/abg/index.js",
  )).href
);
const eventStore = await import(
  pathToFileURL(join(
    input.installedPackageRoot,
    "build/code/src/abg/event_store.js",
  )).href
);

function reopen(events) {
  const store = new abg.AbgEventStore();
  for (const expected of events) {
    const candidate = structuredClone(expected);
    delete candidate.eventId;
    delete candidate.admissionOrdinal;
    delete candidate.payloadDigest;
    assert.deepEqual(eventStore.admitRuntimeEvent(store, candidate), expected);
  }
  return store;
}

const beforeRouteStore = reopen(input.beforeRoutePrefix);
const completion = abg.projectCurrentDeferredApplication(
  beforeRouteStore,
  input.coordinates,
);
const unrelatedWorkspaceEvent = structuredClone(
  input.beforeRoutePrefix.find((event) => event.scopeClass === "workspace"),
);
assert.ok(unrelatedWorkspaceEvent);
delete unrelatedWorkspaceEvent.eventId;
delete unrelatedWorkspaceEvent.admissionOrdinal;
delete unrelatedWorkspaceEvent.payloadDigest;
eventStore.admitRuntimeEvent(beforeRouteStore, unrelatedWorkspaceEvent);
const interleavedCompletion = abg.projectCurrentDeferredApplication(
  beforeRouteStore,
  input.coordinates,
);
const afterRouteStore = reopen(input.afterRoutePrefix);
const consumedCompletion = abg.projectCurrentDeferredApplication(
  afterRouteStore,
  input.coordinates,
);
assert.ok(completion);
assert.deepEqual(interleavedCompletion, completion);
assert.equal(
  abg.isCurrentDeferredApplicationProjection(beforeRouteStore, completion),
  true,
);
assert.equal(consumedCompletion, null);
assert.equal(
  abg.isCurrentDeferredApplicationProjection(afterRouteStore, completion),
  false,
);
process.stdout.write(JSON.stringify({
  processId: process.pid,
  completion,
  interleavedCompletion,
  consumedCompletion,
  currentBeforeRoute: true,
  currentAfterRoute: false,
}));
