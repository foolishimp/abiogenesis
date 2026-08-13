#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import {
  validateEventStoreCloseHandoff,
  type EventStoreCloseHandoff,
} from "../abg/event_store.js";
import { canonicalJson, type JsonValue } from "../product/index.js";
import { parseRootPublicInvocation } from "./contracts.js";
import {
  applyRootPublicInvocation,
  closeRootOperationContext,
  createRootOperationContext,
  projectRootOperationContextAuthority,
  reopenRootOperationContext,
} from "./operations.js";

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

function handoffCandidate(value: unknown): EventStoreCloseHandoff | null {
  if (!isRecord(value) || !("prefix" in value) || !("reopenAuthority" in value)) {
    return null;
  }
  const candidate = {
    prefix: value.prefix,
    reopenAuthority: value.reopenAuthority,
  };
  return validateEventStoreCloseHandoff(candidate) ? candidate : null;
}

function ownerIssuedCloseHandoff(value: unknown): EventStoreCloseHandoff | null {
  if (!isRecord(value)) return null;
  const result = isRecord(value.result) ? value.result : null;
  const candidates = [
    value.projectionAuthority,
    value.continuationAuthority,
    value.gapAuthority,
    result?.projectionAuthority,
    result?.continuationAuthority,
    result?.gapAuthority,
  ].map(handoffCandidate).filter(
    (candidate): candidate is EventStoreCloseHandoff => candidate !== null,
  );
  if (candidates.length === 0) return null;
  const canonical = canonicalJson(candidates[0] as unknown as JsonValue);
  if (candidates.some((candidate) =>
    canonicalJson(candidate as unknown as JsonValue) !== canonical
  )) {
    throw new TypeError("Public outcome carries conflicting close handoffs");
  }
  return candidates[0]!;
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
        const context = request.acquisition.kind === "new"
          ? createRootOperationContext(request.acquisition.eventLogPath)
          : reopenRootOperationContext(request.acquisition.closeHandoff);
        const entryPrefix = context.prefix;
        let closeHandoff: EventStoreCloseHandoff | null = null;
        try {
          const parsed = parseRootPublicInvocation(request.invocation);
          let outcome: JsonValue;
          if (parsed.kind === "public_invocation_refusal") {
            outcome = parsed as unknown as JsonValue;
            process.exitCode = 2;
          } else {
            const publicOutcome = await applyRootPublicInvocation(context, parsed);
            outcome = publicOutcome as unknown as JsonValue;
            closeHandoff = ownerIssuedCloseHandoff(publicOutcome);
            if (
              publicOutcome.disposition !== "succeeded" &&
              publicOutcome.disposition !== "held"
            ) {
              process.exitCode = 2;
            }
          }
          if (closeHandoff === null) {
            closeHandoff = projectRootOperationContextAuthority(context);
          }
          const completed = isRecord(outcome) &&
            (outcome.disposition === "succeeded" ||
              outcome.disposition === "held");
          writeJsonLine({
            kind: "abg_cli_transport_result",
            schemaVersion: "5.0.0",
            disposition: completed ? "completed" : "refused",
            acquisitionKind: request.acquisition.kind,
            entryPrefix: entryPrefix as unknown as JsonValue,
            outcome,
            closeHandoff: closeHandoff as unknown as JsonValue,
          });
        } finally {
          closeRootOperationContext(context);
        }
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
