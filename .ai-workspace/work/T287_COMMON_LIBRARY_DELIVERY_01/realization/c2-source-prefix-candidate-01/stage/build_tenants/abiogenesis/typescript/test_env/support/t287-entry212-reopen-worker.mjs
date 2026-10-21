#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);
assert.notEqual(process.pid, input.originProcessId);

const abg = await import(
  `${pathToFileURL(join(
    input.installedRoot,
    "build/code/src/abg/index.js",
  )).href}?entry212=${process.pid}`
);
const reopened = abg.reopenEventStore(
  input.reopenAuthority,
  input.prefix,
);
assert.equal(
  reopened.kind,
  "reopened_event_store_context",
  JSON.stringify(reopened),
);
const store = reopened.store;

try {
  const durableBytes = await readFile(input.reopenAuthority.eventLogPath);
  process.stdout.write(JSON.stringify({
    processId: process.pid,
    events: store.readAll(),
    storeDigest: store.digest(),
    heldPrefix: abg.selectHeldEventStoreDurablePrefix(store),
    artifactTruth: abg.projectExactPrefixArtifactTruth(input.prefix),
    durableByteLength: durableBytes.byteLength,
    durableByteDigest:
      `sha256:${createHash("sha256").update(durableBytes).digest("hex")}`,
  }));
} finally {
  store.closeDurableLog();
}
