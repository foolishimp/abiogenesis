// Implements: REQ-R-ABG3-HANDLERS-001/-002/-005/-006/-009/-010 — the
// handler CONTRACT and the census-bound registry. A handler is the
// FUNCTOR half of a plugin: it realizes ONE selected arm's interior and
// returns interior results only. It never mints spine or truth events
// (-002: the spine has one authority; emission has one choke point).
//
// Binding is admitted configuration data (B1 review round):
//   {programRef, stageRole, armId, regime, handlerRef, handlerClass,
//    handlerConfigRef}
// The registry resolves (program × stage × arm) → handler fail-closed
// (-012): a selected arm with no binding blocks before any interior
// runs. Handlers receive DECLARED config only (-005) and their throw is
// converted to a typed blocked interior by the EXECUTOR wrapper here
// (-006) — a handler error can never kill a run.

import type { CCallRegime } from "../contracts/carriers.js";
import { C_CALL_REGIME_VALUES } from "../contracts/carriers.js";
import type { HogProgramStage } from "../contracts/hog_program.js";

export const C_CALL_HANDLER_CLASS_VALUES = Object.freeze([
  "pipeline",
  "capability"
] as const);
export type CCallHandlerClass = (typeof C_CALL_HANDLER_CLASS_VALUES)[number];

export interface CCallHandlerBinding {
  readonly programRef: string;
  readonly stageRole: string;
  readonly armId: string;
  readonly regime: CCallRegime;
  readonly handlerRef: string;
  readonly handlerClass: CCallHandlerClass;
  readonly handlerConfigRef: string | null;
}

// The interior a handler returns — data only, no events (-002).
export interface CCallHandlerInterior {
  readonly outcomeStatus: string;
  readonly evidenceRefs: readonly string[];
  readonly payloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly failureReason: string | null;
}

export interface CCallHandlerInput {
  readonly stage: HogProgramStage;
  readonly binding: CCallHandlerBinding;
  // declared config resolved by the caller from admitted declarations
  // (-005); handlers never reach into ambient state for parameters.
  readonly declaredConfig: unknown;
  // projection of the work at this locus (source refs, prior results);
  // read model only.
  readonly workProjection: unknown;
}

export type CCallHandler = (input: CCallHandlerInput) => CCallHandlerInterior;

export interface CCallHandlerRegistry {
  readonly bindings: readonly CCallHandlerBinding[];
  readonly handlers: ReadonlyMap<string, CCallHandler>;
}

function bindingKey(programRef: string, stageRole: string, armId: string): string {
  return [programRef, stageRole, armId].join("|");
}

export function admitHandlerRegistry(input: {
  readonly bindings: readonly CCallHandlerBinding[];
  readonly handlers: ReadonlyMap<string, CCallHandler>;
}): { readonly accepted: boolean; readonly issues: readonly string[] } {
  const issues: string[] = [];
  const seen = new Set<string>();
  const nonEmpty = (value: unknown): value is string =>
    typeof value === "string" && value.length > 0;
  for (const [index, binding] of input.bindings.entries()) {
    const at = `bindings[${index}]`;
    // field shapes first (codex probe: empty/invalid fields must reject)
    if (!nonEmpty(binding.programRef)) issues.push(`${at}.programRef must be a non-empty string`);
    if (!nonEmpty(binding.stageRole)) issues.push(`${at}.stageRole must be a non-empty string`);
    if (!nonEmpty(binding.armId)) issues.push(`${at}.armId must be a non-empty string`);
    if (!nonEmpty(binding.handlerRef)) issues.push(`${at}.handlerRef must be a non-empty string`);
    if (!(C_CALL_REGIME_VALUES as readonly string[]).includes(binding.regime as string)) {
      issues.push(`${at}.regime must be one of ${JSON.stringify(C_CALL_REGIME_VALUES)}`);
    }
    if (binding.handlerConfigRef !== null && !nonEmpty(binding.handlerConfigRef)) {
      issues.push(`${at}.handlerConfigRef must be null or a non-empty string`);
    }
    const key = bindingKey(binding.programRef, binding.stageRole, binding.armId);
    if (seen.has(key)) {
      issues.push(`${at}: duplicate binding for ${key}`);
    }
    seen.add(key);
    if (!(C_CALL_HANDLER_CLASS_VALUES as readonly string[]).includes(binding.handlerClass)) {
      issues.push(`${at}: handlerClass must be one of ${JSON.stringify(C_CALL_HANDLER_CLASS_VALUES)}`);
    }
    if (nonEmpty(binding.handlerRef) && !input.handlers.has(binding.handlerRef)) {
      issues.push(`${at}: handlerRef ${binding.handlerRef} has no registered handler`);
    }
  }
  return Object.freeze({
    accepted: issues.length === 0,
    issues: Object.freeze(issues)
  });
}

// Fail-closed resolution (-001/-012): the selected arm must have exactly
// one admitted binding whose regime matches the selection.
export function resolveHandlerForSelection(
  registry: CCallHandlerRegistry,
  selection: {
    readonly programRef: string;
    readonly stageRole: string;
    readonly armId: string;
    readonly regime: CCallRegime;
  }
): { readonly binding: CCallHandlerBinding; readonly handler: CCallHandler } {
  const binding = registry.bindings.find(
    (row) =>
      row.programRef === selection.programRef &&
      row.stageRole === selection.stageRole &&
      row.armId === selection.armId
  );
  if (binding === undefined) {
    throw new TypeError(
      `handler_binding_missing: no admitted binding for ` +
        `${bindingKey(selection.programRef, selection.stageRole, selection.armId)}`
    );
  }
  if (binding.regime !== selection.regime) {
    throw new TypeError(
      `handler_regime_mismatch: binding for ${binding.armId} declares ` +
        `${binding.regime}, selection carries ${selection.regime}`
    );
  }
  const handler = registry.handlers.get(binding.handlerRef);
  if (handler === undefined) {
    throw new TypeError(
      `handler_binding_missing: handlerRef ${binding.handlerRef} is not registered`
    );
  }
  return Object.freeze({ binding, handler });
}

// The executor wrapper (-006): a handler throw IS a typed blocked
// interior carrying the contract_failure class — never a host escape.
export function executeHandler(
  handler: CCallHandler,
  input: CCallHandlerInput
): CCallHandlerInterior {
  try {
    const interior = handler(input);
    return Object.freeze({ ...interior, evidenceRefs: Object.freeze([...interior.evidenceRefs]) });
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error)).slice(0, 200);
    return Object.freeze({
      outcomeStatus: "blocked",
      evidenceRefs: Object.freeze([`handler-error:${input.binding.handlerRef}`]),
      payloadRef: null,
      responseContractRef: null,
      failureReason: `${message} (contract_failure)`
    });
  }
}
