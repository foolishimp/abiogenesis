#!/usr/bin/env node

import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);

assert.notEqual(process.pid, input.originProcessId);

const publicApi = await import(
  `${pathToFileURL(join(
    input.installedPackageRoot,
    "build/code/src/public/index.js",
  )).href}?t287-setup-authority=${process.pid}-${Date.now()}`
);

function closeContext(context) {
  const handoff = publicApi.projectRootOperationContextAuthority(context);
  return {
    handoff,
    eventCount: context.store.readAll().length,
  };
}

if (input.action === "pure_verify_resolve") {
  const context = publicApi.createRootOperationContext(input.eventLogPath);
  const verifyFirst = await publicApi.applyRootPublicInvocation(
    context,
    input.verifyRequest,
  );
  const verifySecond = await publicApi.applyRootPublicInvocation(
    context,
    input.verifyRequest,
  );
  const resolveFirst = await publicApi.applyRootPublicInvocation(
    context,
    input.resolveRequest,
  );
  const resolveSecond = await publicApi.applyRootPublicInvocation(
    context,
    input.resolveRequest,
  );
  const closed = closeContext(context);
  process.stdout.write(JSON.stringify({
    processId: process.pid,
    verifyFirst,
    verifySecond,
    resolveFirst,
    resolveSecond,
    ...closed,
  }));
} else if (input.action === "apply_at_handoff") {
  const context = publicApi.reopenRootOperationContext(input.handoff);
  const beforeEventCount = context.store.readAll().length;
  const outcome = await publicApi.applyRootPublicInvocation(
    context,
    input.request,
  );
  const closed = closeContext(context);
  process.stdout.write(JSON.stringify({
    processId: process.pid,
    beforeEventCount,
    outcome,
    ...closed,
  }));
} else if (input.action === "apply_transcript_at_handoff") {
  const context = publicApi.reopenRootOperationContext(input.handoff);
  const beforeEventCount = context.store.readAll().length;
  const outcomes = [];
  for (const request of input.requests) {
    outcomes.push(await publicApi.applyRootPublicInvocation(context, request));
  }
  const closed = closeContext(context);
  process.stdout.write(JSON.stringify({
    processId: process.pid,
    beforeEventCount,
    outcomes,
    ...closed,
  }));
} else {
  throw new TypeError(`unknown setup/invocation worker action ${input.action}`);
}
