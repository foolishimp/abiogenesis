#!/usr/bin/env node
import { isRecord, hasExactKeys } from "../shared/admission_predicates.js";
import { admitJson } from "../shared/admit/index.js";

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
  // Until the call is submitted no owning function is entered: a refusal or a
  // failure here exits 2, and its line carries a code that says the call was
  // not submitted.
  let request: CliTransportRequest | null = null;
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
      request = parseTransportRequest(decoded);
      if (request === null && decoded !== undefined) {
        writeJsonLine(transportRefusal(
          "invalid_transport_request",
          "transport request must declare exact acquisition and one Public invocation",
        ));
        process.exitCode = 2;
      }
    }
  } catch (error) {
    // Reading the file, or decoding or parsing its line, threw: the CLI could
    // not obtain a request from the file.
    writeJsonLine(transportRefusal(
      "invalid_transport_request",
      String(error),
    ));
    process.exitCode = 2;
  }
  // Once the call is submitted, a throw out of the transport or an outcome
  // that cannot be encoded is an execution failure, which may follow owner
  // entry: it exits 70 and writes `transport_failure`, which no other path
  // writes. Only the transport's typed refusal exits 2.
  if (request !== null) {
    try {
      const outcome = await runInstalledDefinitionCallTransport(
        request.acquisition as unknown as Parameters<
          typeof runInstalledDefinitionCallTransport
        >[0],
        request.invocation,
      );
      const admittedOutcome = admitJson(outcome);
      if (admittedOutcome.kind !== "ok") throw new TypeError("transport outcome is not one I-JSON value");
      writeJsonLine(admittedOutcome.value);
      process.exitCode = outcome.kind ===
          "installed_definition_call_transport_refusal"
        ? 2
        : outcome.receipt.exitCode;
    } catch (error) {
      writeJsonLine(transportRefusal(
        "transport_failure",
        String(error),
      ));
      process.exitCode = 70;
    }
  }
}
