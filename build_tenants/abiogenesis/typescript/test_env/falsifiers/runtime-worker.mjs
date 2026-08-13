#!/usr/bin/env node

import * as abg from "@abiogenesis/typescript-tenant/abg";

async function readInput() {
  let bytes = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) bytes += chunk;
  return JSON.parse(bytes);
}

function deriveSourceResult(input) {
  const reopened = abg.reopenEventStore(input.reopenAuthority);
  if (reopened.kind !== "reopened_event_store_context") {
    throw new TypeError(JSON.stringify(reopened));
  }
  try {
    const prefix = abg.selectValidatedRuntimeEventPrefix(
      abg.readRuntimeEventsAtDurablePrefix(reopened.prefix),
    );
    const basis = abg.deriveInvocationSourceResultBasisAtPrefix(
      prefix,
      input.derivation,
    );
    return {
      action: input.action,
      pid: process.pid,
      basis,
      acceptedByBasisConsumer:
        basis !== null && abg.isInvocationSourceResultBasis(basis),
      replay: abg.replay(reopened.store, {
        runId: input.derivation.runId,
      }),
    };
  } finally {
    reopened.store.closeDurableLog();
  }
}

const input = await readInput();
let output;
switch (input.action) {
  case "derive_source_result":
    output = deriveSourceResult(input);
    break;
  default:
    throw new TypeError(`unknown runtime worker action ${String(input.action)}`);
}
process.stdout.write(`${JSON.stringify(output)}\n`);
