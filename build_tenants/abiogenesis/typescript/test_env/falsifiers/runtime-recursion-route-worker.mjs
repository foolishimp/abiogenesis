import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { cloneEventPrefixResource } from "../support/new-empty-append-sink.mjs";

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

async function reopen(events, label) {
  return await cloneEventPrefixResource(abg, eventStore, events, label);
}

const foldbackResource = await reopen(
  input.foldbackPrefix,
  "abi5-recursion-route-worker-foldback-",
);
const foldback = abg.projectCurrentApplicationChildFoldback(
  foldbackResource.store,
  {
    runId: input.runId,
    foldbackRef: input.foldbackRef,
  },
);
const routeResource = await reopen(
  input.routePrefix,
  "abi5-recursion-route-worker-route-",
);
const routeStore = routeResource.store;
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
await Promise.all([foldbackResource.dispose(), routeResource.dispose()]);
process.stdout.write(JSON.stringify({
  processId: process.pid,
  foldback,
  route,
  consumedFoldback,
}));
