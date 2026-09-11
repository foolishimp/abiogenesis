#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import {
  validateEventStoreCloseHandoff,
  type EventStoreCloseHandoff,
} from "../abg/event_store.js";
import { canonicalJson, type JsonValue } from "../product/index.js";
import {
  runInstalledDefinitionCallTransport,
} from "./installed_definition_call_transport.js";

interface NewCliTransportAcquisition {
  readonly kind: "new";
  readonly eventLogPath: string;
}

interface ReopenCliTransportAcquisition {
  readonly kind: "reopen";
  readonly closeHandoff: EventStoreCloseHandoff;
}

interface CliTransportRequest {
  readonly kind: "abg_cli_transport_request";
  readonly schemaVersion: "5.0.0";
  readonly acquisition:
    | Readonly<{ readonly kind: "eventless" }>
    | NewCliTransportAcquisition
    | ReopenCliTransportAcquisition;
  readonly invocation: unknown;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index]);
}

function parseTransportRequest(value: unknown): CliTransportRequest | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "acquisition",
      "invocation",
      "kind",
      "schemaVersion",
    ]) ||
    value.kind !== "abg_cli_transport_request" ||
    value.schemaVersion !== "5.0.0" ||
    !isRecord(value.acquisition)
  ) return null;
  const acquisition = value.acquisition;
  if (acquisition.kind === "eventless" && hasExactKeys(acquisition, ["kind"])) {
    return value as unknown as CliTransportRequest;
  }
  if (
    acquisition.kind === "new" &&
    hasExactKeys(acquisition, ["eventLogPath", "kind"]) &&
    typeof acquisition.eventLogPath === "string" &&
    acquisition.eventLogPath.length > 0
  ) return value as unknown as CliTransportRequest;
  if (
    acquisition.kind === "reopen" &&
    hasExactKeys(acquisition, ["closeHandoff", "kind"]) &&
    validateEventStoreCloseHandoff(acquisition.closeHandoff)
  ) return value as unknown as CliTransportRequest;
  return null;
}

function transportRefusal(code: string, message: string): JsonValue {
  return {
    kind: "public_transport_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function writeJsonLine(value: JsonValue): void {
  process.stdout.write(`${canonicalJson(value)}\n`);
}

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== "--jsonl" || args[1] === undefined) {
  writeJsonLine(transportRefusal(
    "invalid_arguments",
    "abg.cli requires exactly --jsonl <explicit-transport-request-file>",
  ));
  process.exitCode = 2;
} else {
  try {
    const lines = (await readFile(args[1], "utf8"))
      .split(/\r?\n/u)
      .filter((line) => line.trim().length !== 0);
    if (lines.length !== 1) {
      writeJsonLine(transportRefusal(
        "invalid_transport_request",
        "request file must contain one explicit CLI transport request",
      ));
      process.exitCode = 2;
    } else {
      let decoded: unknown;
      try {
        decoded = JSON.parse(lines[0]!);
      } catch {
        writeJsonLine(transportRefusal(
          "invalid_json",
          "transport request file is not valid JSON",
        ));
        process.exitCode = 2;
      }
      const request = parseTransportRequest(decoded);
      if (request === null) {
        if (decoded !== undefined) {
          writeJsonLine(transportRefusal(
            "invalid_transport_request",
            "transport request must declare exact acquisition and one Public invocation",
          ));
          process.exitCode = 2;
        }
      } else {
        const outcome = await runInstalledDefinitionCallTransport(
          request.acquisition as unknown as Parameters<
            typeof runInstalledDefinitionCallTransport
          >[0],
          request.invocation,
        );
        writeJsonLine(outcome as unknown as JsonValue);
        process.exitCode = outcome.kind ===
            "installed_definition_call_transport_refusal"
          ? 2
          : outcome.receipt.exitCode;
      }
    }
  } catch (error) {
    writeJsonLine(transportRefusal(
      "transport_failure",
      String(error),
    ));
    process.exitCode = 2;
  }
}
