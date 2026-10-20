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

function deepFreezeJson(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreezeJson(child);
  return Object.freeze(value);
}

const routeEvents = deepFreezeJson([...input.routePrefix]);
const routeAuthorityPrefix = abg.selectValidatedRuntimeEventPrefix(routeEvents);
const routeRunPrefix = abg.selectValidatedRuntimeEventPrefix(routeEvents, {
  runId: input.runId,
});
const route = abg.projectAdmittedRouteAtPrefix(
  routeRunPrefix,
  input.routeAdmissionEventRef,
  routeAuthorityPrefix,
);
assert.ok(route);

const terminalEvents = deepFreezeJson([...input.terminalPrefix]);
const terminalAuthorityPrefix = abg.selectValidatedRuntimeEventPrefix(
  terminalEvents,
);
const terminalRunPrefix = abg.selectValidatedRuntimeEventPrefix(
  terminalEvents,
  { runId: input.runId },
);
const eventCalculusFluents = abg
  .deriveRuntimeEventCalculusProjection(terminalRunPrefix)
  .holds
  .map(abg.runtimeFluentKey);
const replay = abg.replayValidatedRuntimeEventPrefix(
  terminalRunPrefix,
  terminalAuthorityPrefix,
);
assert.deepEqual(replay.activeFluents, eventCalculusFluents);
const activeLifecycleFluents = eventCalculusFluents.filter((fluent) =>
  [
    "run_active(",
    "graph_call_active(",
    "frame_active(",
    "frame_blocked(",
    "frame_failed(",
    "locus_active(",
    "c_call_active(",
    "parent_waiting_on_child(",
    "child_foldback_available(",
    "terminal_route_available(",
  ].some((prefix) => fluent.startsWith(prefix))
);

process.stdout.write(JSON.stringify({
  processId: process.pid,
  route,
  terminal: {
    eventCalculusFluents,
    replayActiveFluents: replay.activeFluents,
    activeLifecycleFluents,
    replayDigest: replay.replayDigest,
    eventStoreDigest: replay.eventStoreDigest,
    eventCount: replay.eventCount,
    runtimeStatus: replay.runtimeStatus,
    terminalReachedEventRef: replay.terminalReachedEventRef,
    frameClosedEventRef: replay.frameClosedEventRef,
    graphCallClosedEventRef: replay.graphCallClosedEventRef,
    runClosedEventRef: replay.runClosedEventRef,
  },
}));
