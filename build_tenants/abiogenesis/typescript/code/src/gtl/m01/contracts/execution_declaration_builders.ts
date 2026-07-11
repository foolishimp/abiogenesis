// Implements: REQ-L-GTL3-C-ALGEBRA-011/-012.
// Published TypeScript builders for execution declarations whose nested shape
// is locally decidable before semantic compilation.

import type { SerializedJsonValue } from "./carriers.js";
import {
  constructTypedGtlExecutionDeclarationEntry,
  type TypedGtlExecutionDeclarationEntry
} from "./declaration_law.js";

export const GTL_PLUGIN_SELECTION_SEAM_VALUES = Object.freeze([
  "fdEvaluator",
  "fpEvaluator",
  "fpDispatch",
  "fhAdmission",
  "consequenceProjection"
] as const);

export type GtlPluginSelectionSeam =
  (typeof GTL_PLUGIN_SELECTION_SEAM_VALUES)[number];

export interface GtlHogProgramLadderRung {
  readonly programRef: string;
  readonly fromAttempt: number;
}

export interface GtlHogHandlerBindingDeclaration {
  readonly programRef: string;
  readonly stageRole: string;
  readonly armId: string;
  readonly regime: "F_D" | "F_P" | "F_H";
  readonly handlerRef: string;
  readonly handlerClass: "pipeline" | "capability";
  readonly handlerConfigRef: string | null;
}

function nonEmpty(value: string, label: string): string {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
  return value;
}

function taggedObject(
  entries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[]
): SerializedJsonValue {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      entries.map((entry) =>
        Object.freeze({
          key: nonEmpty(entry.key, "serialized object key"),
          value: entry.value
        })
      )
    )
  });
}

function jsonEntry<
  Key extends
    | "abg.hog_program_ladder"
    | "abg.hog_handler_bindings"
    | "abg.hog_handler_configs"
    | "abg.plugin_selection"
>(
  key: Key,
  value: SerializedJsonValue
): TypedGtlExecutionDeclarationEntry<
  Key,
  { readonly kind: "json_blob"; readonly value: SerializedJsonValue }
> {
  return constructTypedGtlExecutionDeclarationEntry({
    key,
    value: Object.freeze({ kind: "json_blob", value })
  });
}

export function hogProgramRefDeclarationEntry(
  programRef: string
): TypedGtlExecutionDeclarationEntry<
  "abg.hog_program_ref",
  { readonly kind: "scalar"; readonly value: string }
> {
  return constructTypedGtlExecutionDeclarationEntry({
    key: "abg.hog_program_ref",
    value: Object.freeze({
      kind: "scalar",
      value: nonEmpty(programRef, "HoG program ref")
    })
  });
}

export function hogProgramLadderDeclarationEntry(
  rungs: readonly GtlHogProgramLadderRung[]
): ReturnType<typeof jsonEntry<"abg.hog_program_ladder">> {
  if (rungs.length === 0) {
    throw new TypeError("HoG program ladder must be non-empty");
  }
  let prior = 0;
  const items = rungs.map((rung, index) => {
    nonEmpty(rung.programRef, `HoG ladder rung ${index} programRef`);
    if (
      !Number.isInteger(rung.fromAttempt) ||
      rung.fromAttempt < 1 ||
      (index === 0 && rung.fromAttempt !== 1) ||
      (index > 0 && rung.fromAttempt <= prior)
    ) {
      throw new TypeError(
        `HoG ladder rung ${index} must carry a strictly increasing positive fromAttempt and start at 1`
      );
    }
    prior = rung.fromAttempt;
    return taggedObject([
      { key: "programRef", value: rung.programRef },
      { key: "fromAttempt", value: rung.fromAttempt }
    ]);
  });
  return jsonEntry(
    "abg.hog_program_ladder",
    Object.freeze({ kind: "array", items: Object.freeze(items) })
  );
}

export function hogHandlerBindingsDeclarationEntry(
  bindings: readonly GtlHogHandlerBindingDeclaration[]
): ReturnType<typeof jsonEntry<"abg.hog_handler_bindings">> {
  const identities = new Set<string>();
  const items = bindings.map((binding, index) => {
    const identity = [
      nonEmpty(binding.programRef, `handler binding ${index} programRef`),
      nonEmpty(binding.stageRole, `handler binding ${index} stageRole`),
      nonEmpty(binding.armId, `handler binding ${index} armId`)
    ].join("|");
    if (identities.has(identity)) {
      throw new TypeError(`duplicate handler binding ${identity}`);
    }
    identities.add(identity);
    nonEmpty(binding.handlerRef, `handler binding ${index} handlerRef`);
    if (
      binding.handlerConfigRef !== null &&
      binding.handlerConfigRef.length === 0
    ) {
      throw new TypeError(
        `handler binding ${index} handlerConfigRef must be null or non-empty`
      );
    }
    return taggedObject([
      { key: "programRef", value: binding.programRef },
      { key: "stageRole", value: binding.stageRole },
      { key: "armId", value: binding.armId },
      { key: "regime", value: binding.regime },
      { key: "handlerRef", value: binding.handlerRef },
      { key: "handlerClass", value: binding.handlerClass },
      { key: "handlerConfigRef", value: binding.handlerConfigRef }
    ]);
  });
  return jsonEntry(
    "abg.hog_handler_bindings",
    Object.freeze({ kind: "array", items: Object.freeze(items) })
  );
}

export function hogHandlerConfigsDeclarationEntry(
  configs: Readonly<Record<string, SerializedJsonValue>>
): ReturnType<typeof jsonEntry<"abg.hog_handler_configs">> {
  return jsonEntry(
    "abg.hog_handler_configs",
    taggedObject(
      Object.entries(configs).map(([key, value]) => ({
        key: nonEmpty(key, "handler config ref"),
        value
      }))
    )
  );
}

export function pluginSelectionDeclarationEntry(
  selection: Readonly<Partial<Record<GtlPluginSelectionSeam, string>>>
): ReturnType<typeof jsonEntry<"abg.plugin_selection">> {
  return jsonEntry(
    "abg.plugin_selection",
    taggedObject(
      GTL_PLUGIN_SELECTION_SEAM_VALUES.flatMap((seam) => {
        const ref = selection[seam];
        return ref === undefined
          ? []
          : [{ key: seam, value: nonEmpty(ref, `${seam} plugin ref`) }];
      })
    )
  );
}
