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
  )).href}?recursion-route=${process.pid}`
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

const foldback = abg.projectCurrentApplicationChildFoldback(
  reopen(input.foldbackPrefix),
  {
    runId: input.runId,
    foldbackRef: input.foldbackRef,
  },
);
const routeStore = reopen(input.routePrefix);
const route = abg.projectAdmittedRecursionRoute(
  routeStore,
  {
    runId: input.runId,
    routeRef: input.routeRef,
  },
);
const consumedFoldback = abg.projectCurrentApplicationChildFoldback(
  routeStore,
  {
    runId: input.runId,
    foldbackRef: input.foldbackRef,
  },
);
assert.ok(foldback);
assert.ok(route);
assert.equal(consumedFoldback, null);
process.stdout.write(JSON.stringify({
  processId: process.pid,
  foldback,
  route,
  consumedFoldback,
}));
