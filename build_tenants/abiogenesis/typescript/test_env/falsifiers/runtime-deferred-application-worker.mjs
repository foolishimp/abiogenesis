import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { cloneEventPrefixResource } from "../support/new-empty-append-sink.mjs";

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

async function reopen(events, label) {
  return await cloneEventPrefixResource(abg, eventStore, events, label);
}

const beforeRouteResource = await reopen(
  input.beforeRoutePrefix,
  "abi5-deferred-application-worker-before-",
);
const beforeRouteHandoff =
  beforeRouteResource.store.projectReopenAuthorityAndClose();
const reopenedBeforeRoute = eventStore.reopenEventStore(
  beforeRouteHandoff.reopenAuthority,
);
assert.equal(
  reopenedBeforeRoute.kind,
  "reopened_event_store_context",
  JSON.stringify(reopenedBeforeRoute),
);
assert.deepEqual(reopenedBeforeRoute.prefix, beforeRouteHandoff.prefix);
const beforeRouteStore = reopenedBeforeRoute.store;
const completion = abg.projectCurrentDeferredApplication(
  beforeRouteStore,
  input.coordinates,
);
const unrelatedWorkspaceEvent = structuredClone(
  input.beforeRoutePrefix.find(
    (event) =>
      event.scopeClass === "workspace" &&
      event.kind !== "public_operation_artifact_admitted",
  ),
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
const afterRouteResource = await reopen(
  input.afterRoutePrefix,
  "abi5-deferred-application-worker-after-",
);
const afterRouteHandoff = afterRouteResource.store.projectReopenAuthorityAndClose();
const reopenedAfterRoute = eventStore.reopenEventStore(
  afterRouteHandoff.reopenAuthority,
);
assert.equal(
  reopenedAfterRoute.kind,
  "reopened_event_store_context",
  JSON.stringify(reopenedAfterRoute),
);
assert.deepEqual(reopenedAfterRoute.prefix, afterRouteHandoff.prefix);
const afterRouteStore = reopenedAfterRoute.store;
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
beforeRouteStore.closeDurableLog();
afterRouteStore.closeDurableLog();
await Promise.all([
  beforeRouteResource.dispose(),
  afterRouteResource.dispose(),
]);
process.stdout.write(JSON.stringify({
  processId: process.pid,
  completion,
  interleavedCompletion,
  consumedCompletion,
  currentBeforeRoute: true,
  currentAfterRoute: false,
  reopenedBeforeRoute: true,
  reopenedAfterRoute: true,
}));
