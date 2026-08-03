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
  )).href}?preparation-refusal=${process.pid}`
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

const refusalStore = reopen(input.refusalPrefix);
const refusal = abg.projectCurrentApplicationChildPreparationRefusal(
  refusalStore,
  {
    runId: input.runId,
    refusalRef: input.refusalRef,
  },
);
const consumedStore = reopen(input.consumedPrefix);
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
process.stdout.write(JSON.stringify({
  processId: process.pid,
  refusal,
  consumedRefusal,
  currentBeforeRoute: true,
  currentAfterRoute: false,
}));
