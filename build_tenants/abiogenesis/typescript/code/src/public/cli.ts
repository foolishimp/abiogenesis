#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { canonicalJson, type JsonValue } from "../product/index.js";
import {
  applyRootPublicInvocation,
  closeRootOperationContext,
  createRootOperationContext,
} from "./operations.js";
import { parseRootPublicInvocation } from "./contracts.js";

function transportRefusal(code: string, message: string): JsonValue {
  return {
    kind: "public_transport_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== "--jsonl" || args[1] === undefined) {
  process.stdout.write(`${canonicalJson(transportRefusal(
    "invalid_arguments",
    "abg.cli requires exactly --jsonl <explicit-request-file>",
  ))}\n`);
  process.exitCode = 2;
} else {
  try {
    const lines = (await readFile(args[1], "utf8"))
      .split(/\r?\n/u)
      .filter((line) => line.trim().length !== 0);
    if (lines.length === 0) {
      process.stdout.write(`${canonicalJson(transportRefusal(
        "empty_transcript",
        "request file contains no public invocations",
      ))}\n`);
      process.exitCode = 2;
    } else {
      const context = createRootOperationContext();
      try {
        for (const line of lines) {
          let decoded: unknown;
          try {
            decoded = JSON.parse(line);
          } catch {
            process.stdout.write(`${canonicalJson(transportRefusal(
              "invalid_json",
              "request line is not valid JSON",
            ))}\n`);
            process.exitCode = 2;
            break;
          }
          const invocation = parseRootPublicInvocation(decoded);
          if (invocation.kind === "public_invocation_refusal") {
            process.stdout.write(`${canonicalJson(invocation as unknown as JsonValue)}\n`);
            process.exitCode = 2;
            break;
          }
          const outcome = await applyRootPublicInvocation(context, invocation);
          process.stdout.write(`${canonicalJson(outcome as unknown as JsonValue)}\n`);
          if (outcome.disposition !== "succeeded") {
            process.exitCode = 2;
            break;
          }
        }
      } finally {
        closeRootOperationContext(context);
      }
    }
  } catch (error) {
    process.stdout.write(`${canonicalJson(transportRefusal(
      "transport_failure",
      String(error),
    ))}\n`);
    process.exitCode = 2;
  }
}
