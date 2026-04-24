// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  parseNonEmptyString,
  parsePlainObject,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  constructInstallTargetRoot,
  constructInstalledRuntimePackageContract,
  constructPublicInstallBootstrapRequest
} from "./constructors.js";
import type {
  InstalledRuntimePackageContract,
  PublicInstallBootstrapRequest
} from "./carriers.js";

function admitInstallTargetRoot(input: unknown, label: string) {
  const root = parsePlainObject(input, label);
  const rootPath = parseNonEmptyString(root["rootPath"], `${label}.rootPath`);
  if (!rootPath.startsWith("/")) {
    throw new TypeError(`${label}.rootPath: expected an absolute path`);
  }
  return constructInstallTargetRoot(rootPath);
}

export function admitInstalledRuntimePackageContract(
  input: unknown,
  label = "runtimePackage"
): InstalledRuntimePackageContract {
  const contract = parsePlainObject(input, label);
  const appExportSubpath = parseNonEmptyString(
    contract["appExportSubpath"],
    `${label}.appExportSubpath`
  );
  if (appExportSubpath !== "./app/m04") {
    throw new TypeError(`${label}.appExportSubpath: expected "./app/m04"`);
  }
  const requiredExports = parseStringArray(
    contract["requiredExports"],
    `${label}.requiredExports`
  );
  if (!requiredExports.includes(".") || !requiredExports.includes("./app/m04")) {
    throw new TypeError(
      `${label}.requiredExports: must include "." and "./app/m04"`
    );
  }
  return constructInstalledRuntimePackageContract({
    packageName: parseNonEmptyString(
      contract["packageName"],
      `${label}.packageName`
    ),
    packageVersion: parseNonEmptyString(
      contract["packageVersion"],
      `${label}.packageVersion`
    ),
    dependencyRef: parseNonEmptyString(
      contract["dependencyRef"],
      `${label}.dependencyRef`
    ),
    appExportSubpath,
    requiredExports
  });
}

export function admitPublicInstallBootstrapRequest(
  input: unknown,
  label = "publicInstallBootstrapRequest"
): PublicInstallBootstrapRequest {
  const request = parsePlainObject(input, label);
  return constructPublicInstallBootstrapRequest({
    targetRoot: admitInstallTargetRoot(
      request["targetRoot"],
      `${label}.targetRoot`
    ),
    installedPackageName: parseNonEmptyString(
      request["installedPackageName"],
      `${label}.installedPackageName`
    ),
    runtimePackage: admitInstalledRuntimePackageContract(
      request["runtimePackage"],
      `${label}.runtimePackage`
    )
  });
}
