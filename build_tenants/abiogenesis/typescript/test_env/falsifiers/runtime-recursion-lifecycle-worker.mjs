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
  )).href}?recursion-lifecycle=${process.pid}`
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
const afterRouteStore = reopen(input.afterRoutePrefix);
const sourceCoordinates = {
  runId: input.runId,
  frameId: input.frameId,
  sourceCursorRef: input.sourceCursorRef,
};
const sourceCurrentBeforeRoute = abg.isCurrentRecursionRouteSource(
  beforeRouteStore,
  sourceCoordinates,
);
const sourceCurrentAfterRoute = abg.isCurrentRecursionRouteSource(
  afterRouteStore,
  sourceCoordinates,
);
const route = abg.projectAdmittedRecursionRoute(afterRouteStore, {
  runId: input.runId,
  routeRef: input.routeRef,
});
const routeAfterTerminal = input.terminalPrefix === undefined
  ? undefined
  : abg.projectAdmittedRecursionRoute(reopen(input.terminalPrefix), {
      runId: input.runId,
      routeRef: input.routeRef,
    });
const prefix = abg.selectValidatedRuntimeEventPrefix(
  afterRouteStore.readAll(),
  { runId: input.runId },
);
const projection = abg.deriveRuntimeEventCalculusProjection(prefix);
const sourceActiveAfterRoute = abg.holdsAt(
  projection,
  abg.constructRuntimeFluent({
    name: "locus_active",
    identity: input.sourceCursorRef,
  }),
);
const targetActiveAfterRoute = input.targetCursorRef === null
  ? false
  : abg.holdsAt(
      projection,
      abg.constructRuntimeFluent({
        name: "locus_active",
        identity: input.targetCursorRef,
      }),
    );
const runTerminalAfterRoute = abg.holdsAt(
  projection,
  abg.constructRuntimeFluent({
    name: "run_terminal",
    identity: input.runId,
  }),
);
assert.equal(sourceCurrentBeforeRoute, true);
assert.equal(sourceCurrentAfterRoute, false);
assert.equal(sourceActiveAfterRoute, false);
assert.ok(route);
if (input.terminalPrefix !== undefined) assert.equal(routeAfterTerminal, null);
assert.equal(targetActiveAfterRoute, input.routeKind === "advance");
assert.equal(runTerminalAfterRoute, input.routeKind === "blocked");
process.stdout.write(JSON.stringify({
  processId: process.pid,
  route,
  ...(input.terminalPrefix === undefined ? {} : { routeAfterTerminal }),
  sourceCurrentBeforeRoute,
  sourceCurrentAfterRoute,
  sourceActiveAfterRoute,
  targetActiveAfterRoute,
  runTerminalAfterRoute,
}));
