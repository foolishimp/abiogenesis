// Memory instrument: forced GC and memory sample before each top-level test
// and once at the end. Optional heap snapshots at listed sample indexes.
import { beforeEach, after } from "node:test";
import fs from "node:fs";
import v8 from "node:v8";

const out = process.env.MEM_OUT;
const snaps = new Set((process.env.MEM_SNAP ?? "").split(",").filter(Boolean).map(Number));
const snapDir = process.env.MEM_SNAP_DIR;
let index = 0;

async function settle() {
  for (let i = 0; i < 3; i += 1) {
    await new Promise(resolve => setImmediate(resolve));
    globalThis.gc();
  }
}

async function sample(label) {
  await settle();
  const m = process.memoryUsage();
  const h = v8.getHeapStatistics();
  const row = { index, label, heapUsedMB: +(m.heapUsed / 1048576).toFixed(1), externalMB: +(m.external / 1048576).toFixed(1),
    arrayBuffersMB: +(m.arrayBuffers / 1048576).toFixed(1), rssMB: +(m.rss / 1048576).toFixed(1),
    nativeContexts: h.number_of_native_contexts, detachedContexts: h.number_of_detached_contexts, t: Date.now() };
  fs.appendFileSync(out, JSON.stringify(row) + "\n");
  if (snaps.has(index) && snapDir) v8.writeHeapSnapshot(`${snapDir}/s${index}.heapsnapshot`);
}

beforeEach(async () => { await sample("before"); index += 1; });
after(async () => { await sample("end"); });
