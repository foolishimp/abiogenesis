// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS
// Implements: REQ-P-INSTALL

import { isAbsolute } from "node:path";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { constructInstallTargetRoot } from "./constructors.js";
import { constructAbgTypescriptInstallerRequest } from "./typescript_installer_constructors.js";
import type { ToolchainMutableStateRootInput } from "../toolchain_binding/index.js";
import type { AbgTypescriptInstallerRequest } from "./typescript_installer_carriers.js";

function admitInstallerTargetRoot(input: unknown, label: string) {
  const root = parsePlainObject(input, label);
  const rootPath = parseNonEmptyString(root["rootPath"], `${label}.rootPath`);
  if (!rootPath.startsWith("/")) {
    throw new TypeError(`${label}.rootPath: expected an absolute path`);
  }
  return constructInstallTargetRoot(rootPath);
}

function admitPackageSourceRoot(input: unknown, label: string): string {
  const rootPath = parseNonEmptyString(input, label);
  if (!isAbsolute(rootPath)) {
    throw new TypeError(`${label}: expected an absolute path`);
  }
  return rootPath;
}

function admitOptionalAbsoluteRoot(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  const rootPath = parseNonEmptyString(input, label);
  if (!isAbsolute(rootPath)) {
    throw new TypeError(`${label}: expected an absolute path`);
  }
  return rootPath;
}

function admitOptionalMutableStateRoots(
  input: unknown,
  label: string
): ToolchainMutableStateRootInput | null {
  if (input === undefined || input === null) {
    return null;
  }
  const roots = parsePlainObject(input, label);
  const admitted: {
    observedWorkspaceRoot?: string | null;
    observerStateRoot?: string | null;
    executorStateRoot?: string | null;
    eventRoot?: string | null;
    eventLogPath?: string | null;
    runtimeRoot?: string | null;
    projectionRoot?: string | null;
    archiveRoot?: string | null;
  } = {};
  for (const key of [
    "observedWorkspaceRoot",
    "observerStateRoot",
    "executorStateRoot",
    "eventRoot",
    "eventLogPath",
    "runtimeRoot",
    "projectionRoot",
    "archiveRoot"
  ] as const) {
    const value = roots[key];
    if (value === undefined || value === null) {
      continue;
    }
    admitted[key] = admitOptionalAbsoluteRoot(value, `${label}.${key}`);
  }
  return Object.freeze(admitted);
}

function admitCleanTargetPolicy(input: unknown, label: string): "no_scaffold" {
  if (input === undefined || input === null) {
    return "no_scaffold";
  }
  const policy = parseNonEmptyString(input, label);
  if (policy !== "no_scaffold") {
    throw new TypeError(`${label}: expected no_scaffold`);
  }
  return "no_scaffold";
}

export function admitAbgTypescriptInstallerRequest(
  input: unknown,
  label = "abgTypescriptInstallerRequest"
): AbgTypescriptInstallerRequest {
  const request = parsePlainObject(input, label);
  const installedPackageName =
    parseOptionalField(request, "installedPackageName") ??
    "abiogenesis-typescript-installed-runtime";
  return constructAbgTypescriptInstallerRequest({
    targetRoot: admitInstallerTargetRoot(
      request["targetRoot"],
      `${label}.targetRoot`
    ),
    packageSourceRoot: admitPackageSourceRoot(
      request["packageSourceRoot"],
      `${label}.packageSourceRoot`
    ),
    standardsSourceRoot: admitOptionalAbsoluteRoot(
      request["standardsSourceRoot"],
      `${label}.standardsSourceRoot`
    ),
    docsSourceRoot: admitOptionalAbsoluteRoot(
      request["docsSourceRoot"],
      `${label}.docsSourceRoot`
    ),
    installedPackageName: parseNonEmptyString(
      installedPackageName,
      `${label}.installedPackageName`
    ),
    cleanTargetPolicy: admitCleanTargetPolicy(
      request["cleanTargetPolicy"],
      `${label}.cleanTargetPolicy`
    ),
    toolchainRoot: admitOptionalAbsoluteRoot(
      request["toolchainRoot"],
      `${label}.toolchainRoot`
    ),
    mutableStateRoots: admitOptionalMutableStateRoots(
      request["mutableStateRoots"],
      `${label}.mutableStateRoots`
    )
  });
}
