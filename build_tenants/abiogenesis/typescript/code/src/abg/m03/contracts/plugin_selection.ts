// Implements: the S2.3/T-209 DECLARED PLUGIN SELECTION seam — PRODUCT.md's
// "hook and plugin boundary declarations" law realized at the engine plugin
// seams (T-217 closure campaign, F_H-approved 2026-07-10): a binding DECLARES
// which governed plugin serves each seam by ref; ABG resolves the refs
// against the substrate's standard catalog fail-closed. This is the kernel
// prerequisite for the odd_glc declarations-only adoption — custom plugin
// BODIES retire in favor of declared refs over substrate implementations.
//
// Laws:
// - the declaration is `abg.plugin_selection` (json_blob): an object whose
//   keys are the FIVE effect seams and whose values are catalog refs;
// - unknown seam keys, non-string refs, unknown refs, and a ref admitted
//   for a DIFFERENT seam all fail closed as typed rejections;
// - a declared seam and a caller-supplied plugin for the SAME seam are two
//   authorities — the engine entry fails closed (checked in the runner,
//   which sees the raw caller set);
// - selection selects among GOVERNED substrate plugins only; it is not a
//   path for product code to inject bodies (that remains the explicit
//   plugin/handler seam with its own admission).

import type { SerializedAttrs } from "../../../gtl/m01/contracts/carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import { isPlainRecord } from "./admission_hygiene.js";
import type {
  ConsequenceProjectionPlugin,
  FdEvaluatorPlugin,
  FhAdmissionPlugin,
  FpDispatchPlugin,
  FpEvaluatorPlugin
} from "./plugins.js";
import {
  defaultConsequenceProjectionPlugin,
  defaultFdEvaluatorPlugin,
  defaultFhAdmissionPlugin,
  defaultFpDispatchPlugin,
  defaultFpEvaluatorPlugin
} from "./plugins.js";

export const PLUGIN_SELECTION_DECLARATION_KEY = "abg.plugin_selection";

export const PLUGIN_SELECTION_SEAM_VALUES = Object.freeze([
  "fdEvaluator",
  "fpEvaluator",
  "fpDispatch",
  "fhAdmission",
  "consequenceProjection"
] as const);
export type PluginSelectionSeam = (typeof PLUGIN_SELECTION_SEAM_VALUES)[number];

export interface ResolvedPluginSelection {
  readonly fdEvaluator?: FdEvaluatorPlugin;
  readonly fpEvaluator?: FpEvaluatorPlugin;
  readonly fpDispatch?: FpDispatchPlugin;
  readonly fhAdmission?: FhAdmissionPlugin;
  readonly consequenceProjection?: ConsequenceProjectionPlugin;
}

// Discriminated by seam so resolution narrows structurally — no casts.
export type StandardCatalogRow =
  | { readonly seam: "fdEvaluator"; readonly plugin: FdEvaluatorPlugin }
  | { readonly seam: "fpEvaluator"; readonly plugin: FpEvaluatorPlugin }
  | { readonly seam: "fpDispatch"; readonly plugin: FpDispatchPlugin }
  | { readonly seam: "fhAdmission"; readonly plugin: FhAdmissionPlugin }
  | {
      readonly seam: "consequenceProjection";
      readonly plugin: ConsequenceProjectionPlugin;
    };

// The substrate's standard, governed, selectable implementations. Every row's
// ref is the plugin's own declared contract ref — selection can never bind a
// plugin to a seam its contract does not claim.
export const STANDARD_ENGINE_PLUGIN_CATALOG: Readonly<
  Record<string, StandardCatalogRow>
> = Object.freeze({
  "plugin://abg/fd-evaluator": Object.freeze({
    seam: "fdEvaluator" as const,
    plugin: defaultFdEvaluatorPlugin
  }),
  "plugin://abg/fp-evaluator": Object.freeze({
    seam: "fpEvaluator" as const,
    plugin: defaultFpEvaluatorPlugin
  }),
  "plugin://abg/fp-dispatch": Object.freeze({
    seam: "fpDispatch" as const,
    plugin: defaultFpDispatchPlugin
  }),
  "plugin://abg/fh-admission": Object.freeze({
    seam: "fhAdmission" as const,
    plugin: defaultFhAdmissionPlugin
  }),
  "plugin://abg/consequence-projection": Object.freeze({
    seam: "consequenceProjection" as const,
    plugin: defaultConsequenceProjectionPlugin
  })
});

const SEAM_PLUGIN_KINDS: Readonly<Record<PluginSelectionSeam, string>> =
  Object.freeze({
    fdEvaluator: "fd_evaluator",
    fpEvaluator: "fp_evaluator",
    fpDispatch: "fp_dispatch",
    fhAdmission: "fh_admission",
    consequenceProjection: "consequence_projection"
  });

function isPluginSelectionSeam(value: string): value is PluginSelectionSeam {
  return PLUGIN_SELECTION_SEAM_VALUES.some((seam): boolean => seam === value);
}

// Parse the declaration attrs: absent -> null (no selection); present ->
// a validated {seam -> ref} record, fail-closed on shape.
export function pluginSelectionFromDeclarationAttrs(
  attrs: SerializedAttrs,
  sourceRef: string
): Readonly<Partial<Record<PluginSelectionSeam, string>>> | null {
  // codex round F5: duplicate declaration entries are TWO AUTHORITIES —
  // declaration order must never select which one wins.
  const entries = attrs.entries.filter(
    (row) => row.key === PLUGIN_SELECTION_DECLARATION_KEY
  );
  if (entries.length === 0) {
    return null;
  }
  if (entries.length > 1) {
    throw new TypeError(
      `plugin_selection_declaration_invalid: ${PLUGIN_SELECTION_DECLARATION_KEY} on ${sourceRef} is declared ${String(entries.length)} times — duplicate selection authorities fail closed`
    );
  }
  const entry = entries[0];
  if (entry === undefined || entry.value.kind !== "json_blob") {
    throw new TypeError(
      `plugin_selection_declaration_invalid: ${PLUGIN_SELECTION_DECLARATION_KEY} on ${sourceRef} must be a json_blob declaration`
    );
  }
  // codex round F5: duplicate seam keys INSIDE the tagged object would
  // collapse last-wins at plainification — inspect the tagged entries
  // before decoding.
  const tagged: unknown = entry.value.value;
  if (isPlainRecord(tagged) && tagged["kind"] === "object") {
    const taggedEntries: unknown = tagged["entries"];
    if (Array.isArray(taggedEntries)) {
      const seen = new Set<string>();
      for (const row of taggedEntries) {
        if (isPlainRecord(row) && typeof row["key"] === "string") {
          if (seen.has(row["key"])) {
            throw new TypeError(
              `plugin_selection_declaration_invalid: ${PLUGIN_SELECTION_DECLARATION_KEY} on ${sourceRef}: seam ${JSON.stringify(row["key"])} is declared twice — duplicate seam authorities fail closed`
            );
          }
          seen.add(row["key"]);
        }
      }
    }
  }
  const plain: unknown = serializedJsonValueToPlain(entry.value.value);
  if (!isPlainRecord(plain)) {
    throw new TypeError(
      `plugin_selection_declaration_invalid: ${PLUGIN_SELECTION_DECLARATION_KEY} on ${sourceRef} must be an object of {seam: pluginRef}`
    );
  }
  const selection: Partial<Record<PluginSelectionSeam, string>> = {};
  for (const [key, value] of Object.entries(plain)) {
    if (!isPluginSelectionSeam(key)) {
      throw new TypeError(
        `plugin_selection_declaration_invalid: ${PLUGIN_SELECTION_DECLARATION_KEY} on ${sourceRef}: unknown seam ${JSON.stringify(key)} (closed seam set: ${PLUGIN_SELECTION_SEAM_VALUES.join(", ")})`
      );
    }
    if (typeof value !== "string" || value.length === 0) {
      throw new TypeError(
        `plugin_selection_declaration_invalid: ${PLUGIN_SELECTION_DECLARATION_KEY} on ${sourceRef}: seam ${key} must name a plugin ref as a non-empty string`
      );
    }
    selection[key] = value;
  }
  return Object.freeze(selection);
}

// Resolve a parsed selection against the standard catalog. Unknown refs and
// seam mismatches fail closed.
export function resolveDeclaredPluginSelection(input: {
  readonly selection: Readonly<Partial<Record<PluginSelectionSeam, string>>>;
  readonly sourceRef: string;
  // capability-extended catalog (runner-composed): live rows exist only
  // when the operator injected their capability; the default is the
  // mechanical standard catalog.
  readonly catalog?: Readonly<Record<string, StandardCatalogRow>> | undefined;
}): ResolvedPluginSelection {
  const catalog = input.catalog ?? STANDARD_ENGINE_PLUGIN_CATALOG;
  const resolved: {
    fdEvaluator?: FdEvaluatorPlugin;
    fpEvaluator?: FpEvaluatorPlugin;
    fpDispatch?: FpDispatchPlugin;
    fhAdmission?: FhAdmissionPlugin;
    consequenceProjection?: ConsequenceProjectionPlugin;
  } = {};
  for (const seam of PLUGIN_SELECTION_SEAM_VALUES) {
    const ref = input.selection[seam];
    if (ref === undefined) {
      continue;
    }
    const row = Object.hasOwn(catalog, ref) ? catalog[ref] : undefined;
    if (row === undefined) {
      throw new TypeError(
        `plugin_selection_unresolvable: ${input.sourceRef} selects ${JSON.stringify(ref)} for seam ${seam}, which is not in the standard plugin catalog`
      );
    }
    if (row.seam !== seam) {
      throw new TypeError(
        `plugin_selection_seam_mismatch: ${input.sourceRef} selects ${JSON.stringify(ref)} for seam ${seam}, but that plugin's contract claims seam ${row.seam}`
      );
    }
    // codex round F8: catalog identity is CONTRACT identity, not row
    // metadata — an alias key or a row whose plugin contract disagrees
    // with its catalog position fails closed.
    if (row.plugin.contract.ref !== ref) {
      throw new TypeError(
        `plugin_selection_identity_mismatch: catalog key ${JSON.stringify(ref)} resolves a plugin whose contract ref is ${JSON.stringify(row.plugin.contract.ref)}`
      );
    }
    // codex round 4 R4-6: the plugin's contract KIND must match the seam
    // it serves — a mislabeled row cannot resolve.
    const expectedKind = SEAM_PLUGIN_KINDS[seam];
    if (row.plugin.contract.pluginKind !== expectedKind) {
      throw new TypeError(
        `plugin_selection_kind_mismatch: catalog key ${JSON.stringify(ref)} on seam ${seam} carries pluginKind ${JSON.stringify(row.plugin.contract.pluginKind)}, expected ${JSON.stringify(expectedKind)}`
      );
    }
    switch (row.seam) {
      case "fdEvaluator":
        resolved.fdEvaluator = row.plugin;
        break;
      case "fpEvaluator":
        resolved.fpEvaluator = row.plugin;
        break;
      case "fpDispatch":
        resolved.fpDispatch = row.plugin;
        break;
      case "fhAdmission":
        resolved.fhAdmission = row.plugin;
        break;
      case "consequenceProjection":
        resolved.consequenceProjection = row.plugin;
        break;
    }
  }
  return Object.freeze(resolved);
}
