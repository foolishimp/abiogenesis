#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { canonicalJson, type JsonValue } from
  "../shared/canonical_json.js";
import type { PublicDefinitionKeyLike } from
  "../shared/public_invocation.js";
import type {
  InstalledDefinitionBindingLoadBasis,
  InstalledDefinitionCallFor,
  InstalledDefinitionKey,
} from "../product/installed_module.js";
import { invokeInstalledDefinition } from "./sdk.js";

interface CliTransportRequest {
  readonly kind: "abg_cli_transport_request";
  readonly schemaVersion: "5.0.0";
  readonly bindingBasis: InstalledDefinitionBindingLoadBasis<
    InstalledDefinitionKey
  >;
  readonly call: InstalledDefinitionCallFor<InstalledDefinitionKey>;
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
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

function definitionKey(value: unknown): PublicDefinitionKeyLike | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["memberKey", "operationId"]) ||
    typeof value.operationId !== "string" ||
    value.operationId.trim().length === 0 ||
    typeof value.memberKey !== "string" ||
    value.memberKey.trim().length === 0
  ) return null;
  return Object.freeze({
    operationId: value.operationId,
    memberKey: value.memberKey,
  });
}

function parseTransportRequest(value: unknown): CliTransportRequest | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["bindingBasis", "call", "kind", "schemaVersion"]) ||
    value.kind !== "abg_cli_transport_request" ||
    value.schemaVersion !== "5.0.0" ||
    !isRecord(value.bindingBasis) ||
    !hasExactKeys(value.bindingBasis, [
      "artifactTruth",
      "definitionKey",
      "install",
      "resolvedLock",
      "verifiedProduct",
    ]) ||
    !isRecord(value.call) ||
    !hasExactKeys(value.call, ["invocation", "resources"]) ||
    !isRecord(value.call.invocation)
  ) return null;

  const selectedKey = definitionKey(value.bindingBasis.definitionKey);
  const calledKey = definitionKey(value.call.invocation.definitionKey);
  if (
    selectedKey === null ||
    calledKey === null ||
    selectedKey.operationId !== calledKey.operationId ||
    selectedKey.memberKey !== calledKey.memberKey
  ) return null;

  // The selected owner remains responsible for admitting the concrete call
  // and sibling resources. This membrane admits only their transport shape
  // and exact shared definition coordinate.
  return value as unknown as CliTransportRequest;
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

function writeJsonLine(value: unknown): void {
  process.stdout.write(`${canonicalJson(value as JsonValue)}\n`);
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--jsonl" || args[1] === undefined) {
    writeJsonLine(transportRefusal(
      "invalid_arguments",
      "abg.cli requires exactly --jsonl <explicit-transport-request-file>",
    ));
    return 2;
  }

  let lines: string[];
  try {
    lines = (await readFile(args[1], "utf8"))
      .split(/\r?\n/u)
      .filter((line) => line.trim().length !== 0);
  } catch (error) {
    writeJsonLine(transportRefusal("transport_failure", String(error)));
    return 70;
  }
  if (lines.length !== 1) {
    writeJsonLine(transportRefusal(
      "invalid_transport_request",
      "request file must contain one explicit CLI transport request",
    ));
    return 2;
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(lines[0]!);
  } catch {
    writeJsonLine(transportRefusal(
      "invalid_json",
      "transport request file is not valid JSON",
    ));
    return 2;
  }
  const request = parseTransportRequest(decoded);
  if (request === null) {
    writeJsonLine(transportRefusal(
      "invalid_transport_request",
      "transport request must carry one exact bindingBasis and matching definition call",
    ));
    return 2;
  }

  try {
    const result = await invokeInstalledDefinition(
      request.bindingBasis,
      request.call,
    );
    writeJsonLine(result);
    return result.kind === "definition_host_receipt" ? result.exitCode : 70;
  } catch (error) {
    writeJsonLine(transportRefusal("transport_failure", String(error)));
    return 70;
  }
}

process.exitCode = await main();
