#!/usr/bin/env node

import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);

const abg = await import(pathToFileURL(join(
  input.installedPackageRoot,
  "build/code/src/abg/index.js",
)).href);
const product = await import(pathToFileURL(join(
  input.installedPackageRoot,
  "build/code/src/product/index.js",
)).href);
// The existing direct replay owner and canonical prefix writer of the same
// installed package; runtime-truth rows leave this child as complete values.
const direct = {
  replay: await import(pathToFileURL(join(input.installedPackageRoot, "build/code/src/abg/replay.js")).href),
  prefixes: await import(pathToFileURL(join(input.installedPackageRoot, "build/code/src/abg/event_prefix.js")).href),
};
function completeRuntimeTruth(truth) {
  const prefix = (value) => {
    let out = "";
    direct.prefixes.writeRuntimeEventPrefixValue(value, (part) => { out += part; });
    return JSON.parse(out);
  };
  return {
    authorityPrefix: prefix(truth.authorityPrefix),
    runtimePrefix: prefix(truth.runtimePrefix),
    replayState: direct.replay.materializeRuntimeReplayGuard(truth.replayState),
  };
}

const reopened = abg.reopenEventStore(input.reopenAuthority);
assert.equal(
  reopened.kind,
  "reopened_event_store_context",
  JSON.stringify(reopened),
);
// The transported coordinate only corresponds; the reopened owner's own
// authenticated prefix is what every durable-prefix projection consumes.
assert.deepEqual(reopened.prefix, input.prefix);

try {
  function invoke(request) {
    const owner = request.owner === "product" ? product
      : request.owner === "replay" ? direct.replay : abg;
    const projector = owner[request.exportName];
    assert.equal(
      typeof projector,
      "function",
      `installed ABG export ${request.exportName} is unavailable`,
    );
    if (request.input === "validated_run_prefix") {
      const prefix = abg.selectValidatedRuntimeEventPrefix(
        reopened.store.readAll(),
        request.prefixScope,
      );
      return projector(prefix, ...(request.args ?? []));
    }
    if (request.input === "durable_prefix") {
      const projection = projector(reopened.prefix, ...(request.args ?? []));
      return request.owner === "replay" ? completeRuntimeTruth(projection) : projection;
    }
    if (request.owner === "product") {
      return projector(...(request.args ?? []));
    }
    return projector(reopened.store, ...(request.args ?? []));
  }

  const rows = [];
  for (const request of input.requests) {
    if (request.availability === "blocked_migration") {
      rows.push({
        rowId: request.rowId,
        availability: "unavailable",
        disposition: "red",
        reason: request.reason,
      });
      continue;
    }

    rows.push({
      rowId: request.rowId,
      availability: "available",
      disposition: "green",
      projection: invoke(request),
    });
  }

  process.stdout.write(JSON.stringify({
    kind: "fresh_process_runtime_projection_observation",
    processId: process.pid,
    eventLogDigest: reopened.eventLogDigest,
    historicalEventCount: reopened.historicalEventCount,
    rows,
  }));
} finally {
  reopened.store.closeDurableLog();
}
