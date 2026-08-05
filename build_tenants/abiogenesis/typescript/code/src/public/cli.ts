#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { canonicalJson, type JsonValue } from "../product/index.js";
import { parseRootPublicInvocation } from "./contracts.js";
import {
  applyRootPublicInvocation,
  closeRootOperationContext,
  createRootOperationContext,
  reopenRootOperationContext,
} from "./operations.js";

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
      const decodedLines: unknown[] = [];
      for (const line of lines) {
        try {
          decodedLines.push(JSON.parse(line));
        } catch {
          process.stdout.write(`${canonicalJson(transportRefusal(
            "invalid_json",
            "request line is not valid JSON",
          ))}\n`);
          process.exitCode = 2;
          break;
        }
      }
      const first = decodedLines[0] as Record<string, unknown> | undefined;
      const firstPayload = first?.payload as Record<string, unknown> | undefined;
      const invalid = decodedLines
        .map((value) => parseRootPublicInvocation(value))
        .find((value) => value.kind === "public_invocation_refusal");
      if (invalid !== undefined) {
        process.stdout.write(`${canonicalJson(invalid as unknown as JsonValue)}\n`);
        process.exitCode = 2;
        decodedLines.length = 0;
      }
      const runRow = decodedLines.find((value) =>
        typeof value === "object" && value !== null &&
        (value as Record<string, unknown>).operationId === "abg.operation.run.invoke"
      ) as Record<string, unknown> | undefined;
      const runPayload = runRow?.payload as Record<string, unknown> | undefined;
      const firstOperationId = first?.operationId;
      const reopensRuntimePrefix = firstOperationId === "abg.operation.run.invoke" ||
        firstOperationId === "abg.operation.catalog.admit" ||
        firstOperationId === "abg.operation.catalog.view" ||
        firstOperationId === "abg.operation.catalog.apply" ||
        firstOperationId === "abg.operation.project.read" ||
        firstOperationId === "abg.operation.interaction.respond" ||
        firstOperationId === "abg.operation.run.continue";
      const projectionAuthority = firstPayload?.projectionAuthority as
        Record<string, unknown> | undefined;
      const continuationAuthority = firstPayload?.continuationAuthority as
        Record<string, unknown> | undefined;
      const explicitReopenAuthority = runPayload?.runtimePrefixAuthority ??
        projectionAuthority?.reopenAuthority ??
        continuationAuthority?.reopenAuthority;
      const context = decodedLines.length === 0
        ? null
        : reopensRuntimePrefix
        ? reopenRootOperationContext(
            explicitReopenAuthority as never,
          )
        : createRootOperationContext(String(runPayload?.eventLogPath ?? ""));
      try {
        for (const decoded of decodedLines) {
          const outcome = await applyRootPublicInvocation(context!, decoded);
          process.stdout.write(`${canonicalJson(outcome as unknown as JsonValue)}\n`);
          if (
            outcome.disposition !== "succeeded" &&
            outcome.disposition !== "held"
          ) {
            process.exitCode = 2;
            break;
          }
        }
      } finally {
        if (context !== null) closeRootOperationContext(context);
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
