// Implements: T-116
// Implements: T-117
// Implements: REQ-L-GTL3-HOOKS
// Implements: REQ-R-ABG3-POLICY
// Implements: REQ-R-ABG3-PROVENANCE

import { readFileSync } from "node:fs";
import type {
  GraphFunction,
  GraphVector,
  HookRef,
  SerializedAttrs,
  SerializedAttrValue
} from "../../../gtl/m01/contracts/carriers.js";
import type { Role } from "../../../gtl/m02/contracts/carriers.js";
import {
  parseBoolean,
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import type {
  AbgFallbackBundleRef,
  PluginTraversalKind,
  PluginTraversalObserverBindingSource
} from "./carriers.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import {
  sha256DigestForText,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const PLUGIN_TRAVERSAL_KIND_VALUES = Object.freeze([
  "transform",
  "evaluate",
  "consequence"
] as const);

export const PLUGIN_TRAVERSAL_OBSERVER_DECLARATION_KEYS = Object.freeze({
  transform: "abg.plugin_traversal_observer.transform",
  evaluate: "abg.plugin_traversal_observer.evaluate",
  consequence: "abg.plugin_traversal_observer.consequence"
} as const satisfies Record<PluginTraversalKind, string>);

export interface PluginTraversalObserverBinding {
  readonly kind: "plugin_traversal_observer_binding";
  readonly traversalKind: PluginTraversalKind;
  readonly hookRef: string;
  readonly observerPromptRef: string;
  readonly promptTemplateRef: string;
  readonly promptInputContractRef: string;
  readonly expectedOutputContractRef: string;
  readonly progressSignalRefs: readonly string[];
  readonly continuationRequestRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly configDigest: string;
}

export interface AbgFallbackPluginTraversalObserverBinding {
  readonly absenceLawful: boolean;
  readonly observerPromptRef: string;
  readonly promptTemplateRef: string;
  readonly promptInputContractRef: string;
  readonly expectedOutputContractRef: string;
  readonly progressSignalRefs: readonly string[];
  readonly continuationRequestRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export interface AbgFallbackBundle {
  readonly kind: "abg_fallback_bundle";
  readonly abgDefaultsFamily: "abg_defaults";
  readonly version: number;
  readonly bundleRef: string;
  readonly bundlePath: string | null;
  readonly bundleDigest: string;
  readonly pluginTraversalObserverBindings: Readonly<
    Record<PluginTraversalKind, AbgFallbackPluginTraversalObserverBinding>
  >;
}

export interface PluginTraversalObserverBindingSelection {
  readonly kind: "plugin_traversal_observer_binding_selection";
  readonly selectionRef: string;
  readonly traversalKind: PluginTraversalKind;
  readonly source: PluginTraversalObserverBindingSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly hookRef: string;
  readonly binding: PluginTraversalObserverBinding;
  readonly fallbackBundleRef: AbgFallbackBundleRef | null;
  readonly defaultKey: string | null;
  readonly materializationRef: string;
}

interface HookMatch {
  readonly source: Exclude<PluginTraversalObserverBindingSource, "abg_defaults">;
  readonly sourceRef: string;
  readonly attrKey: string;
  readonly hookRef: HookRef;
}

function assertTraversalKind(
  value: string,
  label: string
): PluginTraversalKind {
  if (
    value === "transform" ||
    value === "evaluate" ||
    value === "consequence"
  ) {
    return value;
  }
  throw new TypeError(`${label}: expected transform, evaluate, or consequence`);
}

function assertPositiveInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new TypeError(`${label}: expected positive integer`);
  }
  return Number(value);
}

function freezeUniqueStringArray(
  values: readonly string[],
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  if (values.length === 0 && options?.allowEmpty !== true) {
    throw new TypeError(`${label}: expected at least one ref`);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    assertNonEmptyString(value, label);
    if (seen.has(value)) {
      throw new TypeError(`${label}: duplicate ref ${JSON.stringify(value)}`);
    }
    seen.add(value);
    result.push(value);
  }
  return freezeStringArray(result);
}

const digestForValue = stableSha256Digest;

function attrValueForKey(
  attrs: SerializedAttrs,
  key: string
): SerializedAttrValue | null {
  const matching = attrs.entries.filter((entry) => entry.key === key);
  if (matching.length > 1) {
    throw new TypeError(`Duplicate GTL attr ${JSON.stringify(key)}`);
  }
  return matching[0]?.value ?? null;
}

function configScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string
): string {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    throw new TypeError(`${label}.${key}: required`);
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(`${label}.${key}: expected scalar string`);
  }
  assertNonEmptyString(value.value, `${label}.${key}`);
  return value.value;
}

function configOptionalScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string
): string | null {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return null;
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(`${label}.${key}: expected scalar string`);
  }
  assertNonEmptyString(value.value, `${label}.${key}`);
  return value.value;
}

function configStringList(
  attrs: SerializedAttrs,
  key: string,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    throw new TypeError(`${label}.${key}: required`);
  }
  if (value.kind !== "string_list") {
    throw new TypeError(`${label}.${key}: expected string_list`);
  }
  return freezeUniqueStringArray(value.value, `${label}.${key}`, options);
}

function configOptionalStringList(
  attrs: SerializedAttrs,
  key: string,
  label: string
): readonly string[] {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return Object.freeze([]);
  }
  if (value.kind !== "string_list") {
    throw new TypeError(`${label}.${key}: expected string_list`);
  }
  return freezeUniqueStringArray(value.value, `${label}.${key}`, {
    allowEmpty: true
  });
}

function hookMatch(input: {
  readonly attrs: SerializedAttrs;
  readonly traversalKind: PluginTraversalKind;
  readonly source: HookMatch["source"];
  readonly sourceRef: string;
}): HookMatch | null {
  const attrKey = PLUGIN_TRAVERSAL_OBSERVER_DECLARATION_KEYS[input.traversalKind];
  const value = attrValueForKey(input.attrs, attrKey);
  if (value === null) {
    return null;
  }
  if (value.kind !== "hook_ref") {
    throw new TypeError(
      `Plugin traversal observer ${input.traversalKind} qualifier must be a hook_ref`
    );
  }
  assertNonEmptyString(value.value.ref, "PluginTraversalObserver.HookRef.ref");
  return Object.freeze({
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey,
    hookRef: value.value
  });
}

function singleRoleHookMatch(input: {
  readonly roles: readonly Role[];
  readonly traversalKind: PluginTraversalKind;
}): HookMatch | null {
  const matches: HookMatch[] = [];
  for (const role of input.roles) {
    const match = hookMatch({
      attrs: role.policyHooks,
      traversalKind: input.traversalKind,
      source: "role_policy_hooks",
      sourceRef: role.id
    });
    if (match !== null) {
      matches.push(match);
    }
  }
  if (matches.length > 1) {
    throw new TypeError(
      "Multiple role plugin traversal observer defaults require explicit resolved-policy choice"
    );
  }
  return matches[0] ?? null;
}

function hookBinding(input: {
  readonly match: HookMatch;
  readonly traversalKind: PluginTraversalKind;
}): PluginTraversalObserverBinding {
  const config = input.match.hookRef.config;
  const declaredTraversalKind = configOptionalScalarString(
    config,
    "traversal_kind",
    "PluginTraversalObserverBinding"
  );
  if (
    declaredTraversalKind !== null &&
    assertTraversalKind(
      declaredTraversalKind,
      "PluginTraversalObserverBinding.traversal_kind"
    ) !== input.traversalKind
  ) {
    throw new TypeError(
      "Plugin traversal observer qualifier traversal_kind does not match declaration key"
    );
  }
  const binding = {
    kind: "plugin_traversal_observer_binding" as const,
    traversalKind: input.traversalKind,
    hookRef: input.match.hookRef.ref,
    observerPromptRef: configScalarString(
      config,
      "observer_prompt_ref",
      "PluginTraversalObserverBinding"
    ),
    promptTemplateRef: configScalarString(
      config,
      "prompt_template_ref",
      "PluginTraversalObserverBinding"
    ),
    promptInputContractRef: configScalarString(
      config,
      "prompt_input_contract_ref",
      "PluginTraversalObserverBinding"
    ),
    expectedOutputContractRef: configScalarString(
      config,
      "expected_output_contract_ref",
      "PluginTraversalObserverBinding"
    ),
    progressSignalRefs: configStringList(
      config,
      "progress_signal_refs",
      "PluginTraversalObserverBinding",
      { allowEmpty: true }
    ),
    continuationRequestRefs: configStringList(
      config,
      "continuation_request_refs",
      "PluginTraversalObserverBinding"
    ),
    policyRefs: configOptionalStringList(
      config,
      "policy_refs",
      "PluginTraversalObserverBinding"
    ),
    configDigest: digestForValue(config)
  } satisfies PluginTraversalObserverBinding;
  return Object.freeze(binding);
}

function fallbackBinding(input: {
  readonly traversalKind: PluginTraversalKind;
  readonly bundle: AbgFallbackBundle;
  readonly entry: AbgFallbackPluginTraversalObserverBinding;
}): PluginTraversalObserverBinding {
  const binding = {
    kind: "plugin_traversal_observer_binding" as const,
    traversalKind: input.traversalKind,
    hookRef: `abg-defaults:${input.bundle.bundleRef}:${input.traversalKind}`,
    observerPromptRef: input.entry.observerPromptRef,
    promptTemplateRef: input.entry.promptTemplateRef,
    promptInputContractRef: input.entry.promptInputContractRef,
    expectedOutputContractRef: input.entry.expectedOutputContractRef,
    progressSignalRefs: input.entry.progressSignalRefs,
    continuationRequestRefs: input.entry.continuationRequestRefs,
    policyRefs: input.entry.policyRefs,
    configDigest: digestForValue({
      bundleRef: input.bundle.bundleRef,
      bundleDigest: input.bundle.bundleDigest,
      traversalKind: input.traversalKind,
      entry: input.entry
    })
  } satisfies PluginTraversalObserverBinding;
  return Object.freeze(binding);
}

function selectionRef(input: {
  readonly traversalKind: PluginTraversalKind;
  readonly source: PluginTraversalObserverBindingSource;
  readonly sourceRef: string;
  readonly hookRef: string;
}): string {
  return `plugin-traversal-observer-selection:${JSON.stringify({
    traversalKind: input.traversalKind,
    source: input.source,
    sourceRef: input.sourceRef,
    hookRef: input.hookRef
  })}`;
}

function bindingSelection(input: {
  readonly traversalKind: PluginTraversalKind;
  readonly source: PluginTraversalObserverBindingSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly binding: PluginTraversalObserverBinding;
  readonly fallbackBundleRef: AbgFallbackBundleRef | null;
  readonly defaultKey: string | null;
}): PluginTraversalObserverBindingSelection {
  const ref = selectionRef({
    traversalKind: input.traversalKind,
    source: input.source,
    sourceRef: input.sourceRef,
    hookRef: input.binding.hookRef
  });
  return Object.freeze({
    kind: "plugin_traversal_observer_binding_selection",
    selectionRef: ref,
    traversalKind: input.traversalKind,
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: input.attrKey,
    hookRef: input.binding.hookRef,
    binding: input.binding,
    fallbackBundleRef: input.fallbackBundleRef,
    defaultKey: input.defaultKey,
    materializationRef: `plugin-traversal-prompt-materialized:${JSON.stringify({
      selectionRef: ref
    })}`
  });
}

function fallbackBundleRef(bundle: AbgFallbackBundle): AbgFallbackBundleRef {
  return Object.freeze({
    bundleRef: bundle.bundleRef,
    bundlePath: bundle.bundlePath,
    bundleDigest: bundle.bundleDigest
  });
}

function parseOptionalStringArrayField(
  input: Readonly<Record<string, unknown>>,
  field: string,
  label: string
): readonly string[] {
  const value = parseOptionalField(input, field);
  if (value === undefined) {
    return Object.freeze([]);
  }
  return freezeUniqueStringArray(parseStringArray(value, `${label}.${field}`), `${label}.${field}`, {
    allowEmpty: true
  });
}

function admitFallbackObserverBinding(
  input: unknown,
  label: string
): AbgFallbackPluginTraversalObserverBinding {
  const value = parsePlainObject(input, label);
  return Object.freeze({
    absenceLawful: parseBoolean(value["absenceLawful"], `${label}.absenceLawful`),
    observerPromptRef: parseNonEmptyString(
      value["observerPromptRef"],
      `${label}.observerPromptRef`
    ),
    promptTemplateRef: parseNonEmptyString(
      value["promptTemplateRef"],
      `${label}.promptTemplateRef`
    ),
    promptInputContractRef: parseNonEmptyString(
      value["promptInputContractRef"],
      `${label}.promptInputContractRef`
    ),
    expectedOutputContractRef: parseNonEmptyString(
      value["expectedOutputContractRef"],
      `${label}.expectedOutputContractRef`
    ),
    progressSignalRefs: freezeUniqueStringArray(
      parseStringArray(value["progressSignalRefs"], `${label}.progressSignalRefs`),
      `${label}.progressSignalRefs`,
      { allowEmpty: true }
    ),
    continuationRequestRefs: freezeUniqueStringArray(
      parseStringArray(
        value["continuationRequestRefs"],
        `${label}.continuationRequestRefs`
      ),
      `${label}.continuationRequestRefs`
    ),
    policyRefs: parseOptionalStringArrayField(value, "policyRefs", label)
  });
}

export function admitAbgFallbackBundle(
  input: unknown,
  options?: {
    readonly bundlePath?: string | null;
    readonly bundleDigest?: string | null;
  }
): AbgFallbackBundle {
  const bundle = parsePlainObject(input, "AbgFallbackBundle");
  const kind = parseString(bundle["kind"], "AbgFallbackBundle.kind");
  if (kind !== "abg_fallback_bundle") {
    throw new TypeError("AbgFallbackBundle.kind: expected abg_fallback_bundle");
  }
  const abgDefaultsFamily = parseString(
    bundle["abgDefaultsFamily"],
    "AbgFallbackBundle.abgDefaultsFamily"
  );
  if (abgDefaultsFamily !== "abg_defaults") {
    throw new TypeError("AbgFallbackBundle.abgDefaultsFamily: expected abg_defaults");
  }
  const bindings = parsePlainObject(
    bundle["pluginTraversalObserverBindings"],
    "AbgFallbackBundle.pluginTraversalObserverBindings"
  );
  const version = assertPositiveInteger(
    bundle["version"],
    "AbgFallbackBundle.version"
  );
  const bundleRef = parseNonEmptyString(
    bundle["bundleRef"],
    "AbgFallbackBundle.bundleRef"
  );
  const normalizedBindings = Object.freeze({
    transform: admitFallbackObserverBinding(
      bindings["transform"],
      "AbgFallbackBundle.pluginTraversalObserverBindings.transform"
    ),
    evaluate: admitFallbackObserverBinding(
      bindings["evaluate"],
      "AbgFallbackBundle.pluginTraversalObserverBindings.evaluate"
    ),
    consequence: admitFallbackObserverBinding(
      bindings["consequence"],
      "AbgFallbackBundle.pluginTraversalObserverBindings.consequence"
    )
  } satisfies Record<
    PluginTraversalKind,
    AbgFallbackPluginTraversalObserverBinding
  >);
  const normalized = {
    kind: "abg_fallback_bundle" as const,
    abgDefaultsFamily,
    version,
    bundleRef,
    bundlePath: options?.bundlePath ?? null,
    bundleDigest:
      options?.bundleDigest ?? digestForValue({
        kind,
        abgDefaultsFamily,
        version,
        bundleRef,
        pluginTraversalObserverBindings: normalizedBindings
      }),
    pluginTraversalObserverBindings: normalizedBindings
  } satisfies AbgFallbackBundle;
  return Object.freeze(normalized);
}

export function loadAbgFallbackBundleFromFile(
  bundlePath: string
): AbgFallbackBundle {
  assertNonEmptyString(bundlePath, "AbgFallbackBundle.bundlePath");
  const raw = readFileSync(bundlePath, "utf8");
  return admitAbgFallbackBundle(JSON.parse(raw), {
    bundlePath,
    bundleDigest: sha256DigestForText(raw)
  });
}

function resolveHookMatch(input: {
  readonly traversalKind: PluginTraversalKind;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): HookMatch | null {
  const vectorMatch = hookMatch({
    attrs: input.vector.declarations,
    traversalKind: input.traversalKind,
    source: "graph_vector_declarations",
    sourceRef: input.vector.id
  });
  const graphFunctionMatch =
    vectorMatch ??
    hookMatch({
      attrs: input.graphFunction.declarations,
      traversalKind: input.traversalKind,
      source: "graph_function_declarations",
      sourceRef: input.graphFunction.id
    });
  return (
    graphFunctionMatch ??
    singleRoleHookMatch({
      roles: input.roles ?? Object.freeze([]),
      traversalKind: input.traversalKind
    })
  );
}

export function tryResolvePluginTraversalObserverBinding(input: {
  readonly traversalKind: PluginTraversalKind;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
  readonly defaultsBundle?: AbgFallbackBundle | null;
  readonly fallbackEnabled?: boolean;
}): PluginTraversalObserverBindingSelection | null {
  const match = resolveHookMatch(input);
  if (match !== null) {
    const binding = hookBinding({
      match,
      traversalKind: input.traversalKind
    });
    return bindingSelection({
      traversalKind: input.traversalKind,
      source: match.source,
      sourceRef: match.sourceRef,
      attrKey: match.attrKey,
      binding,
      fallbackBundleRef: null,
      defaultKey: null
    });
  }
  const bundle = input.defaultsBundle ?? null;
  if (bundle === null) {
    return null;
  }
  if (input.fallbackEnabled !== true) {
    return null;
  }
  const fallback = bundle.pluginTraversalObserverBindings[input.traversalKind];
  if (!fallback.absenceLawful) {
    throw new TypeError(
      `Plugin traversal observer ${input.traversalKind} qualifier absence is not lawful in ${bundle.bundleRef}`
    );
  }
  const binding = fallbackBinding({
    traversalKind: input.traversalKind,
    bundle,
    entry: fallback
  });
  return bindingSelection({
    traversalKind: input.traversalKind,
    source: "abg_defaults",
    sourceRef: bundle.bundleRef,
    attrKey: null,
    binding,
    fallbackBundleRef: fallbackBundleRef(bundle),
    defaultKey: `pluginTraversalObserverBindings.${input.traversalKind}`
  });
}

export function resolvePluginTraversalObserverBinding(input: {
  readonly traversalKind: PluginTraversalKind;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
  readonly defaultsBundle?: AbgFallbackBundle | null;
  readonly fallbackEnabled?: boolean;
}): PluginTraversalObserverBindingSelection {
  const selection = tryResolvePluginTraversalObserverBinding(input);
  if (selection === null) {
    throw new TypeError(
      `Plugin traversal observer ${input.traversalKind} requires a GTL qualifier or visible abg_defaults fallback bundle`
    );
  }
  return selection;
}
