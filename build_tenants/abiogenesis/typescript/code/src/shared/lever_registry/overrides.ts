// T-118 lever overrides — a config bundle that overrides `tunable` registry
// levers by their dotted key. Reuses the T-117 fallback-bundle idiom
// (admit / loadFromFile / resolvePath / load) and the registry as the single
// source of allowed keys + allowed values.
//
// Fail-closed at LOAD, never later: every override key must be a LIVE tunable
// lever, and every value is validated against that lever's governed allowed-set
// (sourced from the registry's `enumValues`, which itself comes from
// `governed_enums`). This closes the "passes the bundle gate, fails at request
// admission" hole.

import { readFileSync } from "node:fs";
import {
  parseNonEmptyString,
  parsePlainObject
} from "../validation/primitives.js";
import { stableSha256Digest } from "../runtime_identity.js";
import { loadAbgConfigSections } from "../abg_config/load.js";
import { getLever, leverEntries, type LeverEntry } from "./registry.js";

export type LeverOverrideValue = string | number | boolean;
export type LeverOverrideSource = "request" | "override" | "registry_default";

export interface AbgLeverOverridesBundle {
  readonly kind: "abg_lever_overrides_bundle";
  readonly abgDefaultsFamily: "abg_defaults";
  readonly version: number;
  readonly bundleRef: string;
  readonly bundlePath: string | null;
  readonly bundleDigest: string;
  readonly overrides: Readonly<Record<string, LeverOverrideValue>>;
}

/** Tunable levers whose override + provenance wiring is live (admittable). */
function liveOverridableKeys(): ReadonlySet<string> {
  return new Set(
    leverEntries()
      .filter(
        (entry) => entry.leverClass === "tunable" && entry.wiring === "live"
      )
      .map((entry) => entry.dottedKey)
  );
}

function assertPositiveIntegerVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError(
      "AbgLeverOverridesBundle.version: expected a positive integer"
    );
  }
  return value;
}

function validateOverrideValue(
  lever: LeverEntry,
  raw: unknown
): LeverOverrideValue {
  const label = `AbgLeverOverridesBundle.overrides.${lever.dottedKey}`;
  if (lever.enumValues !== undefined) {
    const value = parseNonEmptyString(raw, label);
    if (!lever.enumValues.includes(value)) {
      throw new TypeError(
        `${label}: expected one of ${JSON.stringify(lever.enumValues)}, got ${JSON.stringify(value)}`
      );
    }
    return value;
  }
  switch (lever.valueKind) {
    case "ms":
    case "count":
      if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0) {
        throw new TypeError(`${label}: expected a non-negative integer`);
      }
      return raw;
    case "flag":
      if (typeof raw !== "boolean") {
        throw new TypeError(`${label}: expected a boolean`);
      }
      return raw;
    default:
      return parseNonEmptyString(raw, label);
  }
}

export function admitAbgLeverOverridesBundle(
  input: unknown,
  options?: {
    readonly bundlePath?: string | null;
    readonly bundleDigest?: string | null;
  }
): AbgLeverOverridesBundle {
  const bundle = parsePlainObject(input, "AbgLeverOverridesBundle");
  const kind = parseNonEmptyString(
    bundle["kind"],
    "AbgLeverOverridesBundle.kind"
  );
  if (kind !== "abg_lever_overrides_bundle") {
    throw new TypeError(
      "AbgLeverOverridesBundle.kind: expected abg_lever_overrides_bundle"
    );
  }
  const abgDefaultsFamily = parseNonEmptyString(
    bundle["abgDefaultsFamily"],
    "AbgLeverOverridesBundle.abgDefaultsFamily"
  );
  if (abgDefaultsFamily !== "abg_defaults") {
    throw new TypeError(
      "AbgLeverOverridesBundle.abgDefaultsFamily: expected abg_defaults"
    );
  }
  const version = assertPositiveIntegerVersion(bundle["version"]);
  const bundleRef = parseNonEmptyString(
    bundle["bundleRef"],
    "AbgLeverOverridesBundle.bundleRef"
  );
  const overridesObject = parsePlainObject(
    bundle["overrides"],
    "AbgLeverOverridesBundle.overrides"
  );
  const live = liveOverridableKeys();
  const overrides: Record<string, LeverOverrideValue> = {};
  for (const key of Object.keys(overridesObject)) {
    if (!live.has(key)) {
      throw new TypeError(
        `AbgLeverOverridesBundle.overrides: ${JSON.stringify(key)} is not a live tunable lever`
      );
    }
    const lever = getLever(key);
    if (lever === undefined) {
      throw new TypeError(
        `AbgLeverOverridesBundle.overrides: unknown lever ${JSON.stringify(key)}`
      );
    }
    overrides[key] = validateOverrideValue(lever, overridesObject[key]);
  }
  const frozenOverrides = Object.freeze(overrides);
  const normalized: AbgLeverOverridesBundle = {
    kind: "abg_lever_overrides_bundle",
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
        overrides: frozenOverrides
      }),
    overrides: frozenOverrides
  };
  return Object.freeze(normalized);
}

export function loadAbgLeverOverridesBundleFromFile(
  bundlePath: string
): AbgLeverOverridesBundle {
  parseNonEmptyString(bundlePath, "AbgLeverOverridesBundle.bundlePath");
  const raw = readFileSync(bundlePath, "utf8");
  return admitAbgLeverOverridesBundle(JSON.parse(raw), {
    bundlePath,
    bundleDigest: stableSha256Digest(raw)
  });
}

export function loadAbgLeverOverridesBundle(
  workspaceRoot: string = process.cwd()
): AbgLeverOverridesBundle | null {
  const sections = loadAbgConfigSections(workspaceRoot);
  if (sections === null || sections.levers === null) {
    return null;
  }
  return admitAbgLeverOverridesBundle(sections.levers.value, {
    bundlePath: sections.levers.bundlePath,
    bundleDigest: sections.levers.bundleDigest
  });
}

export function getLeverOverride(
  bundle: AbgLeverOverridesBundle | null | undefined,
  dottedKey: string
): LeverOverrideValue | undefined {
  if (bundle === null || bundle === undefined) {
    return undefined;
  }
  return Object.hasOwn(bundle.overrides, dottedKey)
    ? bundle.overrides[dottedKey]
    : undefined;
}

// ── M04 request-defaults resolution (the live wired family) ───────────────────

export const M04_UNTIL_KEY = "abg.m04.until";
export const M04_FH_MODE_KEY = "abg.m04.fh_mode";
export const RUNNER_RETRY_MAX_ATTEMPTS_KEY = "abg.runner.retry.max_attempts";
export const M04_REQUEST_DEFAULT_LEVER_KEYS = Object.freeze([
  M04_UNTIL_KEY,
  M04_FH_MODE_KEY
] as const);
export const PUBLIC_START_CONSUMED_LEVER_KEYS = Object.freeze([
  M04_UNTIL_KEY,
  M04_FH_MODE_KEY,
  RUNNER_RETRY_MAX_ATTEMPTS_KEY
] as const);

export interface AbgLeverProvenance {
  readonly bundleRef: string | null;
  readonly bundleDigest: string | null;
  readonly bundlePath: string | null;
  readonly selections: {
    readonly until: LeverOverrideSource;
    readonly fhMode: LeverOverrideSource;
  };
}

export interface M04RequestDefaultsResolution {
  readonly until: string;
  readonly fhMode: string;
  readonly provenance: AbgLeverProvenance;
}

export interface AbgRunnerRetryResolution {
  readonly maxAttempts: number;
  readonly source: LeverOverrideSource;
  readonly bundleRef: string | null;
  readonly bundleDigest: string | null;
  readonly bundlePath: string | null;
}

function registryDefaultString(dottedKey: string): string {
  const lever = getLever(dottedKey);
  if (lever === undefined || typeof lever.value !== "string") {
    throw new TypeError(`lever ${dottedKey} has no string registry default`);
  }
  return lever.value;
}

function registryDefaultNonNegativeInteger(dottedKey: string): number {
  const lever = getLever(dottedKey);
  if (
    lever === undefined ||
    typeof lever.value !== "number" ||
    !Number.isInteger(lever.value) ||
    lever.value < 0
  ) {
    throw new TypeError(`lever ${dottedKey} has no non-negative integer registry default`);
  }
  return lever.value;
}

function resolveField(
  dottedKey: string,
  requestValue: string | undefined,
  bundle: AbgLeverOverridesBundle | null | undefined
): { readonly value: string; readonly source: LeverOverrideSource } {
  if (requestValue !== undefined) {
    return { value: requestValue, source: "request" };
  }
  const override = getLeverOverride(bundle, dottedKey);
  if (override !== undefined) {
    return { value: String(override), source: "override" };
  }
  return { value: registryDefaultString(dottedKey), source: "registry_default" };
}

function resolveCountField(
  dottedKey: string,
  bundle: AbgLeverOverridesBundle | null | undefined
): { readonly value: number; readonly source: LeverOverrideSource } {
  const override = getLeverOverride(bundle, dottedKey);
  if (override !== undefined) {
    if (typeof override !== "number" || !Number.isInteger(override) || override < 0) {
      throw new TypeError(`lever ${dottedKey} override is not a non-negative integer`);
    }
    return { value: override, source: "override" };
  }
  return {
    value: registryDefaultNonNegativeInteger(dottedKey),
    source: "registry_default"
  };
}

export function resolveM04RequestDefaults(input: {
  readonly requestUntil?: string | undefined;
  readonly requestFhMode?: string | undefined;
  readonly bundle?: AbgLeverOverridesBundle | null | undefined;
}): M04RequestDefaultsResolution {
  const bundle = input.bundle ?? null;
  const until = resolveField(M04_UNTIL_KEY, input.requestUntil, bundle);
  const fhMode = resolveField(M04_FH_MODE_KEY, input.requestFhMode, bundle);
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

export function resolveRunnerRetryMaxAttempts(input: {
  readonly bundle?: AbgLeverOverridesBundle | null | undefined;
}): AbgRunnerRetryResolution {
  const bundle = input.bundle ?? null;
  const maxAttempts = resolveCountField(RUNNER_RETRY_MAX_ATTEMPTS_KEY, bundle);
  return Object.freeze({
    maxAttempts: maxAttempts.value,
    source: maxAttempts.source,
    bundleRef: bundle?.bundleRef ?? null,
    bundleDigest: bundle?.bundleDigest ?? null,
    bundlePath: bundle?.bundlePath ?? null
  });
}
