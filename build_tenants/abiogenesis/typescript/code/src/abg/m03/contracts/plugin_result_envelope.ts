// Implements: T-158

import { assertNoEngineAuthorityFields } from "../../../shared/engine_authority_fields.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  parseNonEmptyString,
  parsePlainObject,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import type { RuntimeRegime } from "./carriers.js";
import type { GtlProgramPluginResultInterfaceRow } from "./gtl_program_conformance.js";
import { freezeStringArray } from "./runtime_support.js";

export type AdmittedPluginResultStageRole =
  GtlProgramPluginResultInterfaceRow["stageRole"];

export interface AdmittedPluginResultEnvelope {
  readonly kind: "admitted_plugin_result_envelope";
  readonly envelopeRef: string;
  readonly resultRef: string | null;
  readonly resultInterfaceRef: string;
  readonly resultEnvelopeContractRef: string;
  readonly stageBindingRef: string;
  readonly stageRole: AdmittedPluginResultStageRole;
  readonly computeMeans: RuntimeRegime;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly resultCarrierKind: string;
  readonly outputCarrierRefs: readonly string[];
  readonly producedCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly selectorAuthorityRefs: readonly string[];
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function nullableString(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function stringArrayField(
  record: Readonly<Record<string, unknown>>,
  field: string,
  fallback: readonly string[],
  label: string
): readonly string[] {
  if (!Object.hasOwn(record, field)) {
    return freezeStringArray(fallback);
  }
  return parseStringArray(record[field], `${label}.${field}`);
}

function assertFieldMatches(
  actual: unknown,
  expected: string,
  label: string
): void {
  if (actual !== expected) {
    throw new TypeError(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertOptionalSelectedCompositionMatches(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly label: string;
}): void {
  if (!Object.hasOwn(input.record, "selectedComposition")) {
    return;
  }
  const selected = parsePlainObject(
    input.record["selectedComposition"],
    `${input.label}.selectedComposition`
  );
  assertFieldMatches(
    selected["compositionRef"],
    input.compositionRef,
    `${input.label}.selectedComposition.compositionRef`
  );
  assertFieldMatches(
    selected["compositionDigest"],
    input.compositionDigest,
    `${input.label}.selectedComposition.compositionDigest`
  );
  assertFieldMatches(
    selected["compositionSelectionRef"],
    input.compositionSelectionRef,
    `${input.label}.selectedComposition.compositionSelectionRef`
  );
  const selectedRegimeBindingRef = selected["selectedRegimeBindingRef"] ?? null;
  if (selectedRegimeBindingRef !== input.selectedRegimeBindingRef) {
    throw new TypeError(
      `${input.label}.selectedComposition.selectedRegimeBindingRef does not match result`
    );
  }
}

function assertRequiredEnvelopeIdentityFields(input: {
  readonly resultInterface: GtlProgramPluginResultInterfaceRow;
  readonly envelope: AdmittedPluginResultEnvelope;
  readonly label: string;
}): void {
  for (const field of input.resultInterface.requiredIdentityFieldRefs) {
    const value = Reflect.get(input.envelope, field);
    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new TypeError(`${input.label}.${field}: expected non-empty array`);
      }
      continue;
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new TypeError(`${input.label}.${field}: expected non-empty string`);
    }
  }
}

export function admitPluginResultEnvelope(input: {
  readonly resultInterface: GtlProgramPluginResultInterfaceRow;
  readonly result: unknown;
  readonly resultRef?: string | null | undefined;
  readonly label?: string | undefined;
}): AdmittedPluginResultEnvelope {
  const label = input.label ?? "PluginResultEnvelope";
  const resultInterface = input.resultInterface;
  const record = parsePlainObject(input.result, `${label}.result`);
  assertNoEngineAuthorityFields(
    record,
    `${label}.result`,
    "plugin result envelope cannot own engine authority"
  );
  const compositionRef = parseNonEmptyString(
    record["compositionRef"],
    `${label}.result.compositionRef`
  );
  const compositionDigest = parseNonEmptyString(
    record["compositionDigest"],
    `${label}.result.compositionDigest`
  );
  const compositionSelectionRef = parseNonEmptyString(
    record["compositionSelectionRef"],
    `${label}.result.compositionSelectionRef`
  );
  const selectedRegimeBindingRef = nullableString(
    record["selectedRegimeBindingRef"],
    `${label}.result.selectedRegimeBindingRef`
  );
  if (compositionRef !== resultInterface.compositionRef) {
    throw new TypeError(`${label}.compositionRef does not match result interface`);
  }
  if (compositionDigest !== resultInterface.compositionDigest) {
    throw new TypeError(`${label}.compositionDigest does not match result interface`);
  }
  assertFieldMatches(
    record["stage"],
    `${resultInterface.computeMeans}.${resultInterface.stageRole}`,
    `${label}.result.stage`
  );
  assertFieldMatches(
    record["computeNotationStage"],
    `${resultInterface.stageRole}.C`,
    `${label}.result.computeNotationStage`
  );
  assertOptionalSelectedCompositionMatches({
    record,
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    selectedRegimeBindingRef,
    label: `${label}.result`
  });
  const evidenceRefs = stringArrayField(
    record,
    "evidenceRefs",
    resultInterface.evidenceRefs,
    `${label}.result`
  );
  const envelope: AdmittedPluginResultEnvelope = Object.freeze({
    kind: "admitted_plugin_result_envelope" as const,
    envelopeRef: `plugin-result-envelope:${stableSha256Digest({
      resultInterfaceRef: resultInterface.resultInterfaceRef,
      resultRef: input.resultRef ?? null,
      compositionRef,
      compositionDigest,
      compositionSelectionRef,
      stageRole: resultInterface.stageRole,
      computeMeans: resultInterface.computeMeans,
      resultCarrierKind: resultInterface.resultCarrierKind,
      evidenceRefs
    })}`,
    resultRef:
      input.resultRef === undefined || input.resultRef === null
        ? null
        : parseNonEmptyString(input.resultRef, `${label}.resultRef`),
    resultInterfaceRef: resultInterface.resultInterfaceRef,
    resultEnvelopeContractRef: resultInterface.resultEnvelopeContractRef,
    stageBindingRef: resultInterface.stageBindingRef,
    stageRole: resultInterface.stageRole,
    computeMeans: resultInterface.computeMeans,
    compositionRef,
    compositionDigest,
    compositionSelectionRef,
    selectedRegimeBindingRef,
    resultCarrierKind: resultInterface.resultCarrierKind,
    outputCarrierRefs: freezeStringArray(resultInterface.outputCarrierRefs),
    producedCarrierRefs: freezeStringArray(resultInterface.producedCarrierRefs),
    evidenceRefs: uniqueStrings(evidenceRefs),
    selectorAuthorityRefs: freezeStringArray(
      resultInterface.selectorAuthorityRefs
    )
  });
  assertRequiredEnvelopeIdentityFields({
    resultInterface,
    envelope,
    label
  });
  return envelope;
}
