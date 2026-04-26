// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS

import { isAbsolute } from "node:path";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { constructInstallTargetRoot } from "./constructors.js";
import { constructAbgTypescriptInstallerRequest } from "./typescript_installer_constructors.js";
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
    installedPackageName: parseNonEmptyString(
      installedPackageName,
      `${label}.installedPackageName`
    )
  });
}
