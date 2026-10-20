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
  )).href}?preparation-refusal=${process.pid}`
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

const refusalResource = await reopen(
  input.refusalPrefix,
  "abi5-preparation-refusal-worker-before-",
);
const refusalStore = refusalResource.store;
const refusal = abg.projectCurrentApplicationChildPreparationRefusal(
  refusalStore,
  {
    runId: input.runId,
    refusalRef: input.refusalRef,
  },
);
const consumedResource = await reopen(
  input.consumedPrefix,
  "abi5-preparation-refusal-worker-after-",
);
const consumedStore = consumedResource.store;
const consumedRefusal = abg.projectCurrentApplicationChildPreparationRefusal(
  consumedStore,
  {
    runId: input.runId,
    refusalRef: input.refusalRef,
  },
);
assert.ok(refusal);
assert.equal(consumedRefusal, null);
assert.equal(
  abg.isAdmittedApplicationChildPreparationRefusal(refusalStore, refusal),
  true,
);
assert.equal(
  abg.isAdmittedApplicationChildPreparationRefusal(consumedStore, refusal),
  false,
);
await Promise.all([
  refusalResource.dispose(),
  consumedResource.dispose(),
]);
process.stdout.write(JSON.stringify({
  processId: process.pid,
  refusal,
  consumedRefusal,
  currentBeforeRoute: true,
  currentAfterRoute: false,
}));
