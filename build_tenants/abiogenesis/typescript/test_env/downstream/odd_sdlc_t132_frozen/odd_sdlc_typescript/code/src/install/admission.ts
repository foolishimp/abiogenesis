// Implements: REQ-F-ODDSDLC-040

import { resolve } from "node:path";
import type { OddSdlcTypescriptInstallRequest } from "./carriers.js";
import { isRecord as isPlainRecord } from "../admission/codecs.js";

function plainRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new TypeError(`${label}: expected object`);
  }
  return value;
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${key}: expected non-empty string`);
  }
  return value.trim();
}

function optionalString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function optionalResolvedString(
  record: Record<string, unknown>,
  key: string
): string | null {
  const value = optionalString(record, key);
  return value === null ? null : resolve(value);
}

export function admitOddSdlcTypescriptInstallRequest(
  input: unknown
): OddSdlcTypescriptInstallRequest {
  const record = plainRecord(input, "odd_sdlc install request");
  return Object.freeze({
    kind: "odd_sdlc_typescript_install_request",
    targetRoot: resolve(requiredString(record, "targetRoot")),
    packageSourceRoot: resolve(requiredString(record, "packageSourceRoot")),
    abgPackageSourceRoot: resolve(requiredString(record, "abgPackageSourceRoot")),
    abgStandardsSourceRoot: optionalResolvedString(record, "abgStandardsSourceRoot"),
    abgDocsSourceRoot: optionalResolvedString(record, "abgDocsSourceRoot"),
    installedPackageName: requiredString(record, "installedPackageName")
  });
}
