// Implements: REQ-L-GTL3-C-ALGEBRA-010/-014/-016.
// Handler-binding declaration data is admitted before ExecutionBasis exists;
// runner code receives only this typed carrier.

import {
  C_CALL_REGIME_VALUES,
  type CCallRegime
} from "./carriers.js";
import { isPlainRecord } from "./admission_hygiene.js";

export const C_CALL_HANDLER_CLASS_VALUES = Object.freeze([
  "pipeline",
  "capability"
] as const);

export type CCallHandlerClass =
  (typeof C_CALL_HANDLER_CLASS_VALUES)[number];

export interface CCallHandlerBinding {
  readonly programRef: string;
  readonly stageRole: string;
  readonly armId: string;
  readonly regime: CCallRegime;
  readonly handlerRef: string;
  readonly handlerClass: CCallHandlerClass;
  readonly handlerConfigRef: string | null;
}

const HANDLER_BINDING_KEYS = Object.freeze([
  "programRef",
  "stageRole",
  "armId",
  "regime",
  "handlerRef",
  "handlerClass",
  "handlerConfigRef"
]);

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(
      `${label} must be a non-empty string as authored, got ${JSON.stringify(value)}`
    );
  }
  return value;
}

function admitRegime(value: unknown, label: string): CCallRegime {
  const match = C_CALL_REGIME_VALUES.find(
    (regime): boolean => regime === value
  );
  if (match === undefined) {
    throw new TypeError(
      `${label} must be one of ${JSON.stringify(C_CALL_REGIME_VALUES)}, got ${JSON.stringify(value)}`
    );
  }
  return match;
}

function admitHandlerClass(
  value: unknown,
  label: string
): CCallHandlerClass {
  const match = C_CALL_HANDLER_CLASS_VALUES.find(
    (handlerClass): boolean => handlerClass === value
  );
  if (match === undefined) {
    throw new TypeError(
      `${label} must be one of ${JSON.stringify(C_CALL_HANDLER_CLASS_VALUES)}, got ${JSON.stringify(value)}`
    );
  }
  return match;
}

export function admitHogHandlerBindings(
  rows: readonly unknown[],
  sourceRef: string
): readonly CCallHandlerBinding[] {
  const bindings: CCallHandlerBinding[] = [];
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const at = `${sourceRef} handler binding [${index}]`;
    if (!isPlainRecord(row)) {
      throw new TypeError(`${at} must be an object row`);
    }
    for (const key of Object.keys(row)) {
      if (!HANDLER_BINDING_KEYS.includes(key)) {
        throw new TypeError(
          `${at}: unknown field ${JSON.stringify(key)} (closed key set)`
        );
      }
    }
    const handlerConfigValue = row["handlerConfigRef"];
    const handlerConfigRef =
      handlerConfigValue === undefined || handlerConfigValue === null
        ? null
        : nonEmptyString(handlerConfigValue, `${at}.handlerConfigRef`);
    const binding = Object.freeze({
      programRef: nonEmptyString(row["programRef"], `${at}.programRef`),
      stageRole: nonEmptyString(row["stageRole"], `${at}.stageRole`),
      armId: nonEmptyString(row["armId"], `${at}.armId`),
      regime: admitRegime(row["regime"], `${at}.regime`),
      handlerRef: nonEmptyString(row["handlerRef"], `${at}.handlerRef`),
      handlerClass: admitHandlerClass(
        row["handlerClass"],
        `${at}.handlerClass`
      ),
      handlerConfigRef
    });
    const identity = [
      binding.programRef,
      binding.stageRole,
      binding.armId
    ].join("|");
    if (seen.has(identity)) {
      throw new TypeError(`${at}: duplicate binding for ${identity}`);
    }
    seen.add(identity);
    bindings.push(binding);
  }
  return Object.freeze(bindings);
}
