#!/usr/bin/env node

import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);

assert.notEqual(process.pid, input.originProcessId);

const installedModule = (relativePath) => pathToFileURL(join(
  input.installedPackageRoot,
  "build/code/src",
  relativePath,
)).href;

if (input.action === "continue") {
  const publicApi = await import(installedModule("public/index.js"));
  const context = publicApi.reopenRootOperationContext({
    prefix: input.authority.prefix,
    reopenAuthority: input.authority.reopenAuthority,
  });
  const entryPrefix = structuredClone(context.prefix);
  let outcome;
  let closeHandoff;
  try {
    outcome = await publicApi.applyRootPublicInvocation(
      context,
      input.invocation,
    );
    assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    assert.notEqual(outcome.continuationAuthority?.prefix, undefined);
    assert.notEqual(outcome.continuationAuthority?.reopenAuthority, undefined);
    closeHandoff = {
      prefix: outcome.continuationAuthority.prefix,
      reopenAuthority: outcome.continuationAuthority.reopenAuthority,
    };
  } finally {
    publicApi.closeRootOperationContext(context);
  }
  process.stdout.write(JSON.stringify({
    kind: "fresh_process_public_fh_continue",
    processId: process.pid,
    entryPrefix,
    outcome,
    closeHandoff,
  }));
} else if (input.action === "terminal") {
  const abg = await import(installedModule("abg/index.js"));
  const reopened = abg.reopenEventStore(
    input.closeHandoff.reopenAuthority,
    input.closeHandoff.prefix,
  );
  assert.equal(
    reopened.kind,
    "reopened_event_store_context",
    JSON.stringify(reopened),
  );
  assert.deepEqual(reopened.prefix, input.closeHandoff.prefix);
  try {
    const events = Object.freeze([...reopened.store.readAll()]);
    const authorityPrefix = abg.selectValidatedRuntimeEventPrefix(events);
    const runPrefix = abg.selectValidatedRuntimeEventPrefix(events, {
      runId: input.runId,
    });
    const eventCalculusFluents = abg
      .deriveRuntimeEventCalculusProjection(runPrefix)
      .holds
      .map(abg.runtimeFluentKey);
    const replay = abg.replayValidatedRuntimeEventPrefix(
      runPrefix,
      authorityPrefix,
    );
    assert.deepEqual(replay.activeFluents, eventCalculusFluents);
    const quiescence = abg.projectRunQuiescence(runPrefix);
    assert.equal(quiescence.disposition, "quiescent_for_close");
    assert.deepEqual(quiescence.blockingFluents, []);
    assert.equal(replay.runtimeStatus, "closed");
    assert.deepEqual(replay.cCalls.at(-1)?.resultValue, input.expectedResult);
    assert.equal(events.at(-1)?.kind, "run_closed");
    assert.equal(
      events.filter((event) =>
        event.runId === input.runId && event.kind === "run_closed"
      ).length,
      1,
    );
    process.stdout.write(JSON.stringify({
      kind: "fresh_process_public_fh_terminal",
      processId: process.pid,
      eventLogDigest: reopened.eventLogDigest,
      historicalEventCount: reopened.historicalEventCount,
      replayDigest: replay.replayDigest,
      replayRef: replay.replayRef,
      runtimeStatus: replay.runtimeStatus,
      resultValue: replay.cCalls.at(-1)?.resultValue ?? null,
      eventCalculusFluents,
      replayActiveFluents: replay.activeFluents,
      quiescenceDisposition: quiescence.disposition,
      blockingFluents: quiescence.blockingFluents,
      terminalReachedEventRef: replay.terminalReachedEventRef,
      frameClosedEventRef: replay.frameClosedEventRef,
      graphCallClosedEventRef: replay.graphCallClosedEventRef,
      runClosedEventRef: replay.runClosedEventRef,
    }));
  } finally {
    reopened.store.closeDurableLog();
  }
} else {
  throw new TypeError(`unknown runtime Public F_H worker action ${input.action}`);
}
