// Implements: REQ-P-POLICY (T-118 abg_defaults — M04 request-defaults steel thread)
//
// Externalizes the M04 callable-start request defaults (`until`, `fh_mode`) as a
// configurable `abg_defaults` bundle member, following the T-117 fallback-bundle
// and target-carrier-defaults pattern. The in-code constants remain as the
// absence-law default used when no bundle/config is present (precedence:
// explicit request value > admitted bundle value > absence-law constant).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseNonEmptyString,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export const ABG_M04_REQUEST_DEFAULTS_ABSENCE_LAW = Object.freeze({
  until: "converged",
  fhMode: "direct"
});

const INSTALLED_M04_REQUEST_DEFAULTS_RELATIVE_PATH = join(
  ".abiogenesis",
  "config",
  "abg.m04-request-defaults.json"
);

const PACKAGE_M04_REQUEST_DEFAULTS_RELATIVE_PATH = join(
  "config",
  "abg.m04-request-defaults.json"
);

export interface AbgM04RequestDefaults {
  readonly until: string;
  readonly fhMode: string;
}

export interface AbgM04RequestDefaultsBundle {
  readonly kind: "abg_m04_request_defaults_bundle";
  readonly abgDefaultsFamily: "abg_defaults";
  readonly version: number;
  readonly bundleRef: string;
  readonly bundlePath: string | null;
  readonly bundleDigest: string;
  readonly m04RequestDefaults: AbgM04RequestDefaults;
}

function assertPositiveIntegerVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError(
      "AbgM04RequestDefaultsBundle.version: expected a positive integer"
    );
  }
  return value;
}

export function admitAbgM04RequestDefaultsBundle(
  input: unknown,
  options?: {
    readonly bundlePath?: string | null;
    readonly bundleDigest?: string | null;
  }
): AbgM04RequestDefaultsBundle {
  const bundle = parsePlainObject(input, "AbgM04RequestDefaultsBundle");
  const kind = parseNonEmptyString(
    bundle["kind"],
    "AbgM04RequestDefaultsBundle.kind"
  );
  if (kind !== "abg_m04_request_defaults_bundle") {
    throw new TypeError(
      "AbgM04RequestDefaultsBundle.kind: expected abg_m04_request_defaults_bundle"
    );
  }
  const abgDefaultsFamily = parseNonEmptyString(
    bundle["abgDefaultsFamily"],
    "AbgM04RequestDefaultsBundle.abgDefaultsFamily"
  );
  if (abgDefaultsFamily !== "abg_defaults") {
    throw new TypeError(
      "AbgM04RequestDefaultsBundle.abgDefaultsFamily: expected abg_defaults"
    );
  }
  const version = assertPositiveIntegerVersion(bundle["version"]);
  const bundleRef = parseNonEmptyString(
    bundle["bundleRef"],
    "AbgM04RequestDefaultsBundle.bundleRef"
  );
  const defaultsObject = parsePlainObject(
    bundle["m04RequestDefaults"],
    "AbgM04RequestDefaultsBundle.m04RequestDefaults"
  );
  const m04RequestDefaults: AbgM04RequestDefaults = Object.freeze({
    until: parseNonEmptyString(
      defaultsObject["until"],
      "AbgM04RequestDefaultsBundle.m04RequestDefaults.until"
    ),
    fhMode: parseNonEmptyString(
      defaultsObject["fhMode"],
      "AbgM04RequestDefaultsBundle.m04RequestDefaults.fhMode"
    )
  });
  const normalized: AbgM04RequestDefaultsBundle = {
    kind: "abg_m04_request_defaults_bundle",
    abgDefaultsFamily: "abg_defaults",
    version,
    bundleRef,
    bundlePath: options?.bundlePath ?? null,
    bundleDigest:
      options?.bundleDigest ??
      stableSha256Digest({
        kind,
        abgDefaultsFamily,
        version,
        bundleRef,
        m04RequestDefaults
      }),
    m04RequestDefaults
  };
  return Object.freeze(normalized);
}

export function loadAbgM04RequestDefaultsBundleFromFile(
  bundlePath: string
): AbgM04RequestDefaultsBundle {
  parseNonEmptyString(bundlePath, "AbgM04RequestDefaultsBundle.bundlePath");
  const raw = readFileSync(bundlePath, "utf8");
  return admitAbgM04RequestDefaultsBundle(JSON.parse(raw), {
    bundlePath,
    bundleDigest: stableSha256Digest(raw)
  });
}

export function resolveAbgM04RequestDefaultsPath(
  workspaceRoot: string = process.cwd()
): string | null {
  const installedPath = join(
    workspaceRoot,
    INSTALLED_M04_REQUEST_DEFAULTS_RELATIVE_PATH
  );
  if (existsSync(installedPath)) {
    return installedPath;
  }
  const packagePath = join(
    workspaceRoot,
    PACKAGE_M04_REQUEST_DEFAULTS_RELATIVE_PATH
  );
  if (existsSync(packagePath)) {
    return packagePath;
  }
  let current = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const modulePackagePath = join(
      current,
      PACKAGE_M04_REQUEST_DEFAULTS_RELATIVE_PATH
    );
    if (existsSync(modulePackagePath)) {
      return modulePackagePath;
    }
    const parent = dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

export function loadAbgM04RequestDefaultsBundle(
  workspaceRoot: string = process.cwd()
): AbgM04RequestDefaultsBundle | null {
  const resolvedPath = resolveAbgM04RequestDefaultsPath(workspaceRoot);
  if (resolvedPath === null) {
    return null;
  }
  return loadAbgM04RequestDefaultsBundleFromFile(resolvedPath);
}

export type AbgM04RequestDefaultOriginSource =
  | "request"
  | "bundle"
  | "absence_law";

export interface AbgM04RequestDefaultsResolution {
  readonly until: string;
  readonly fhMode: string;
  readonly provenance: {
    readonly bundleRef: string | null;
    readonly bundleDigest: string | null;
    readonly bundlePath: string | null;
    readonly selections: {
      readonly until: AbgM04RequestDefaultOriginSource;
      readonly fhMode: AbgM04RequestDefaultOriginSource;
    };
  };
}

function resolveField(
  requestValue: string | undefined,
  bundleValue: string | undefined,
  absenceLaw: string
): { readonly value: string; readonly source: AbgM04RequestDefaultOriginSource } {
  if (requestValue !== undefined) {
    return { value: requestValue, source: "request" };
  }
  if (bundleValue !== undefined) {
    return { value: bundleValue, source: "bundle" };
  }
  return { value: absenceLaw, source: "absence_law" };
}

export function resolveAbgM04RequestDefaults(input: {
  readonly requestUntil?: string | undefined;
  readonly requestFhMode?: string | undefined;
  readonly bundle?: AbgM04RequestDefaultsBundle | null | undefined;
}): AbgM04RequestDefaultsResolution {
  const bundle = input.bundle ?? null;
  const until = resolveField(
    input.requestUntil,
    bundle?.m04RequestDefaults.until,
    ABG_M04_REQUEST_DEFAULTS_ABSENCE_LAW.until
  );
  const fhMode = resolveField(
    input.requestFhMode,
    bundle?.m04RequestDefaults.fhMode,
    ABG_M04_REQUEST_DEFAULTS_ABSENCE_LAW.fhMode
  );
  return Object.freeze({
    until: until.value,
    fhMode: fhMode.value,
    provenance: Object.freeze({
      bundleRef: bundle?.bundleRef ?? null,
      bundleDigest: bundle?.bundleDigest ?? null,
      bundlePath: bundle?.bundlePath ?? null,
      selections: Object.freeze({
        until: until.source,
        fhMode: fhMode.source
      })
    })
  });
}
