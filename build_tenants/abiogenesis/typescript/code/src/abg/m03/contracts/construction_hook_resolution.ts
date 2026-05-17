// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type {
  GraphFunction,
  GraphVector,
  SerializedAttrs,
  SerializedAttrValue,
  SerializedJsonValue
} from "../../../gtl/m01/contracts/carriers.js";
import type {
  Job,
  Module,
  Role
} from "../../../gtl/m02/contracts/carriers.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import { freezeNonEmptyStrings } from "./construction_validation.js";
import { stableSha256HexDigest as stableDigest } from "../../../shared/runtime_identity.js";

export const CONSTRUCTION_HOOK_KEY = "abg.fp_consciousness";

export const CONSTRUCTION_HOOK_SOURCE_VALUES = Object.freeze([
  "graph_vector",
  "graph_function",
  "job_policy",
  "role_policy",
  "module_policy",
  "installed_fallback"
] as const);

export type ConstructionHookSource =
  (typeof CONSTRUCTION_HOOK_SOURCE_VALUES)[number];

export interface ConstructionHookDeclaration {
  readonly hookRef: string;
  readonly sourceRef: string;
  readonly concerns: readonly string[];
  readonly config: Readonly<Record<string, unknown>>;
}

export interface ConstructionHookResolution {
  readonly kind: "construction_hook_resolution";
  readonly resolutionRef: string;
  readonly hookKey: typeof CONSTRUCTION_HOOK_KEY;
  readonly source: ConstructionHookSource;
  readonly sourceRef: string;
  readonly hookRef: string;
  readonly concerns: readonly string[];
  readonly config: Readonly<Record<string, unknown>>;
  readonly configDigest: string;
  readonly fallbackUsed: boolean;
}

function duplicatedSerializedAttrKeys(attrs: SerializedAttrs): readonly string[] {
  const keys = attrs.entries.map((entry) => entry.key);
  return Object.freeze(
    Array.from(new Set(keys.filter((key, index) => keys.indexOf(key) !== index)))
  );
}

function serializedJsonValueToPlain(value: SerializedJsonValue): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value.kind === "array") {
    return Object.freeze(value.items.map(serializedJsonValueToPlain));
  }
  return Object.freeze(
    Object.fromEntries(
      value.entries.map((entry) => [
        entry.key,
        serializedJsonValueToPlain(entry.value)
      ])
    )
  );
}

function serializedAttrValueToPlain(value: SerializedAttrValue): unknown {
  if (value.kind === "scalar") {
    return value.value;
  }
  if (value.kind === "string_list") {
    return freezeStringArray(value.value);
  }
  if (value.kind === "json_blob") {
    return serializedJsonValueToPlain(value.value);
  }
  return Object.freeze({
    ref: value.value.ref,
    config: serializedAttrsToPlainRecord(value.value.config, "HookRef.config")
  });
}

function serializedAttrsToPlainRecord(
  attrs: SerializedAttrs,
  label: string
): Readonly<Record<string, unknown>> {
  const duplicateKeys = duplicatedSerializedAttrKeys(attrs);
  if (duplicateKeys.length > 0) {
    throw new TypeError(
      `${label} contains duplicate attr keys ${JSON.stringify(duplicateKeys)}`
    );
  }
  return Object.freeze(
    Object.fromEntries(
      attrs.entries.map((entry) => [
        entry.key,
        serializedAttrValueToPlain(entry.value)
      ])
    )
  );
}

function attrValueForConstructionHook(
  attrs: SerializedAttrs,
  label: string
): SerializedAttrValue | null {
  const matches = attrs.entries.filter((entry) => entry.key === CONSTRUCTION_HOOK_KEY);
  if (matches.length > 1) {
    throw new TypeError(
      `${label} contains duplicate ${CONSTRUCTION_HOOK_KEY} hook declarations`
    );
  }
  return matches[0]?.value ?? null;
}

function concernsFromConstructionHookConfig(
  attrs: SerializedAttrs,
  label: string
): readonly string[] {
  const matches = attrs.entries.filter((entry) => entry.key === "concerns");
  if (matches.length > 1) {
    throw new TypeError(`${label}.config contains duplicate concerns declarations`);
  }
  const concerns = matches[0]?.value;
  if (concerns === undefined) {
    return Object.freeze([CONSTRUCTION_HOOK_KEY]);
  }
  if (concerns.kind !== "string_list") {
    throw new TypeError(`${label}.config.concerns must be a string_list attr`);
  }
  return freezeNonEmptyStrings(concerns.value, `${label}.config.concerns`);
}

function constructionHookDeclarationFromAttrs(input: {
  readonly attrs: SerializedAttrs;
  readonly sourceRef: string;
  readonly label: string;
}): ConstructionHookDeclaration | null {
  const attrValue = attrValueForConstructionHook(input.attrs, input.label);
  if (attrValue === null) {
    return null;
  }
  if (attrValue.kind !== "hook_ref") {
    throw new TypeError(`${input.label}.${CONSTRUCTION_HOOK_KEY} must be a hook_ref attr`);
  }
  return Object.freeze({
    hookRef: attrValue.value.ref,
    sourceRef: input.sourceRef,
    concerns: concernsFromConstructionHookConfig(attrValue.value.config, input.label),
    config: serializedAttrsToPlainRecord(attrValue.value.config, `${input.label}.config`)
  });
}

function maybeConstructionHookDeclaration(input: {
  readonly attrs: SerializedAttrs | undefined;
  readonly sourceRef: string | undefined;
  readonly label: string;
}): readonly ConstructionHookDeclaration[] {
  if (input.attrs === undefined || input.sourceRef === undefined) {
    return Object.freeze([]);
  }
  const declaration = constructionHookDeclarationFromAttrs({
    attrs: input.attrs,
    sourceRef: input.sourceRef,
    label: input.label
  });
  return declaration === null ? Object.freeze([]) : Object.freeze([declaration]);
}

function resolveHookSlot(input: {
  readonly source: ConstructionHookSource;
  readonly declarations: readonly ConstructionHookDeclaration[];
}): ConstructionHookDeclaration | null {
  if (input.declarations.length > 1) {
    throw new TypeError(`Duplicate ${input.source} construction hook declarations`);
  }
  const declaration = input.declarations[0];
  if (declaration === undefined) {
    return null;
  }
  assertNonEmptyString(declaration.hookRef, "ConstructionHookDeclaration.hookRef");
  assertNonEmptyString(declaration.sourceRef, "ConstructionHookDeclaration.sourceRef");
  freezeNonEmptyStrings(
    declaration.concerns,
    "ConstructionHookDeclaration.concerns"
  );
  return declaration;
}

export function resolveConstructionHookDeclaration(input: {
  readonly graphVectorDeclarations?: readonly ConstructionHookDeclaration[];
  readonly graphFunctionDeclarations?: readonly ConstructionHookDeclaration[];
  readonly jobPolicyDeclarations?: readonly ConstructionHookDeclaration[];
  readonly rolePolicyDeclarations?: readonly ConstructionHookDeclaration[];
  readonly modulePolicyDeclarations?: readonly ConstructionHookDeclaration[];
  readonly installedFallback: ConstructionHookDeclaration;
}): ConstructionHookResolution {
  const slots: readonly {
    readonly source: ConstructionHookSource;
    readonly declarations: readonly ConstructionHookDeclaration[];
  }[] = Object.freeze([
    {
      source: "graph_vector",
      declarations: input.graphVectorDeclarations ?? []
    },
    {
      source: "graph_function",
      declarations: input.graphFunctionDeclarations ?? []
    },
    {
      source: "job_policy",
      declarations: input.jobPolicyDeclarations ?? []
    },
    {
      source: "role_policy",
      declarations: input.rolePolicyDeclarations ?? []
    },
    {
      source: "module_policy",
      declarations: input.modulePolicyDeclarations ?? []
    },
    {
      source: "installed_fallback",
      declarations: Object.freeze([input.installedFallback])
    }
  ]);
  const slot = slots.find((candidate) => resolveHookSlot(candidate) !== null);
  if (slot !== undefined) {
    const declaration = resolveHookSlot(slot);
    if (declaration !== null) {
      return Object.freeze({
        kind: "construction_hook_resolution",
        resolutionRef: `construction-hook-resolution:${slot.source}:${declaration.sourceRef}:${declaration.hookRef}`,
        hookKey: CONSTRUCTION_HOOK_KEY,
        source: slot.source,
        sourceRef: declaration.sourceRef,
        hookRef: declaration.hookRef,
        concerns: freezeStringArray(declaration.concerns),
        config: declaration.config,
        configDigest: stableDigest(declaration.config),
        fallbackUsed: slot.source === "installed_fallback"
      });
    }
  }
  throw new TypeError("Installed construction hook fallback is required");
}

export function resolveConstructionHookDeclarationFromGtl(input: {
  readonly graphVector?: GraphVector | null;
  readonly graphFunction?: GraphFunction | null;
  readonly job?: Job | null;
  readonly role?: Role | null;
  readonly module?: Module | null;
  readonly installedFallback: ConstructionHookDeclaration;
}): ConstructionHookResolution {
  return resolveConstructionHookDeclaration({
    graphVectorDeclarations: maybeConstructionHookDeclaration({
      attrs: input.graphVector?.declarations,
      sourceRef: input.graphVector?.id,
      label: "GraphVector.declarations"
    }),
    graphFunctionDeclarations: maybeConstructionHookDeclaration({
      attrs: input.graphFunction?.declarations,
      sourceRef: input.graphFunction?.id,
      label: "GraphFunction.declarations"
    }),
    jobPolicyDeclarations: maybeConstructionHookDeclaration({
      attrs: input.job?.policyHooks,
      sourceRef: input.job?.id,
      label: "Job.policyHooks"
    }),
    rolePolicyDeclarations: maybeConstructionHookDeclaration({
      attrs: input.role?.policyHooks,
      sourceRef: input.role?.id,
      label: "Role.policyHooks"
    }),
    modulePolicyDeclarations: maybeConstructionHookDeclaration({
      attrs: input.module?.policyHooks,
      sourceRef:
        input.module === null || input.module === undefined
          ? undefined
          : `module:${input.module.name}`,
      label: "Module.policyHooks"
    }),
    installedFallback: input.installedFallback
  });
}
