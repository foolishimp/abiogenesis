// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

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
    packageSourceRoot: parseNonEmptyString(
      request["packageSourceRoot"],
      `${label}.packageSourceRoot`
    ),
    installedPackageName: parseNonEmptyString(
      installedPackageName,
      `${label}.installedPackageName`
    )
  });
}
