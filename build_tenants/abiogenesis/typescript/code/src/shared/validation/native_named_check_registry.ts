import * as v from "valibot";

import { stableSha256Digest } from "../runtime_identity.js";
import {
  assertKnownFields,
  parseNullableString,
  parsePlainObject,
  parseString
} from "./primitives.js";

const FAMILY_REF_PATTERN = /^(?=\S+$)(?!.*#)[^\u0000-\u0020\u007f]+$/u;
const CHECK_ID_PATTERN = /^[a-z][a-z0-9._-]*$/u;

export interface NativeNamedCheckRegistration {
  readonly checkId: string;
  readonly action: unknown;
  readonly relationRef: string | null;
}

export interface NativeNamedCheckRegistry {
  readonly familyRef: string;
  readonly checks: readonly NativeNamedCheckRegistration[];
}

export interface NativeNamedCheckResolver {
  readonly resolve: (action: unknown) => NativeResolvedNamedCheck | null;
}

export interface NativeResolvedNamedCheck {
  readonly checkRef: string;
  readonly relationRef: string | null;
  readonly registrationDigest: `sha256:${string}`;
}

function requireFrozen(input: object, label: string): void {
  if (!Object.isFrozen(input)) {
    throw new TypeError(`${label}: expected an immutable value`);
  }
}

function admitCheckAction(input: unknown, label: string): object {
  const action = parsePlainObject(input, label);
  if (
    action["kind"] !== "validation" ||
    action["type"] !== "check" ||
    action["reference"] !== v.check ||
    typeof action["requirement"] !== "function" ||
    typeof action["~run"] !== "function"
  ) {
    throw new TypeError(`${label}: expected a Valibot check action`);
  }
  requireFrozen(action, label);
  return action;
}

export function admitNativeNamedCheckRegistry(
  input: unknown
): NativeNamedCheckResolver {
  if (input === undefined) {
    return Object.freeze({ resolve: () => null });
  }

  const registry = parsePlainObject(input, "native check registry");
  requireFrozen(registry, "native check registry");
  assertKnownFields(registry, ["familyRef", "checks"], "native check registry");
  const familyRef = parseString(
    registry["familyRef"],
    "native check registry.familyRef"
  );
  if (!FAMILY_REF_PATTERN.test(familyRef)) {
    throw new TypeError("native check registry.familyRef: invalid family ref");
  }
  if (
    !Array.isArray(registry["checks"]) ||
    registry["checks"].length === 0
  ) {
    throw new TypeError("native check registry.checks: expected a non-empty array");
  }
  requireFrozen(registry["checks"], "native check registry.checks");

  const identities = new Set<string>();
  const byAction = new Map<object, NativeResolvedNamedCheck>();
  for (const [index, rawRegistration] of registry["checks"].entries()) {
    const label = `native check registry.checks[${index}]`;
    const registration = parsePlainObject(rawRegistration, label);
    requireFrozen(registration, label);
    assertKnownFields(
      registration,
      ["checkId", "action", "relationRef"],
      label
    );
    const checkId = parseString(registration["checkId"], `${label}.checkId`);
    if (!CHECK_ID_PATTERN.test(checkId)) {
      throw new TypeError(`${label}.checkId: invalid check id`);
    }
    const identity = `${familyRef}#${checkId}`;
    if (identities.has(identity)) {
      throw new TypeError(`${label}: duplicate check identity ${identity}`);
    }
    const action = admitCheckAction(registration["action"], `${label}.action`);
    const relationRef = parseNullableString(
      registration["relationRef"],
      `${label}.relationRef`
    );
    if (relationRef !== null && !FAMILY_REF_PATTERN.test(relationRef)) {
      throw new TypeError(`${label}.relationRef: invalid relation ref`);
    }
    if (byAction.has(action)) {
      throw new TypeError(`${label}: duplicate check action`);
    }
    identities.add(identity);
    byAction.set(
      action,
      Object.freeze({
        checkRef: identity,
        relationRef,
        registrationDigest: stableSha256Digest({
          familyRef,
          checkId,
          actionKind: "validation",
          actionType: "check",
          actionReference: "valibot.check",
          relationRef
        })
      })
    );
  }

  return Object.freeze({
    resolve: (action: unknown): NativeResolvedNamedCheck | null =>
      typeof action === "object" && action !== null
        ? (byAction.get(action) ?? null)
        : null
  });
}
