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

export type CCallHandlerDriverRequirement =
  | "sync_compatible"
  | "async_required";

export type CCallHandlerResultForDriver<
  D extends CCallHandlerDriverRequirement
> = D extends "sync_compatible"
  ? CCallHandlerInterior
  : Promise<CCallHandlerInterior>;

export type CCallHandler<
  D extends CCallHandlerDriverRequirement = CCallHandlerDriverRequirement
> = {
  readonly driverRequirement: D;
  (input: CCallHandlerInput): CCallHandlerResultForDriver<D>;
};

export function constructCCallHandler<
  const D extends CCallHandlerDriverRequirement
>(input: {
  readonly driverRequirement: D;
  readonly execute: (
    handlerInput: CCallHandlerInput
  ) => CCallHandlerResultForDriver<D>;
}): CCallHandler<D> {
  const handler = Object.assign(
    (handlerInput: CCallHandlerInput): CCallHandlerResultForDriver<D> =>
      input.execute(handlerInput),
    { driverRequirement: input.driverRequirement }
  );
  return Object.freeze(handler);
}

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
  for (const [handlerRef, handler] of input.handlers) {
    if (typeof handler !== "function") {
      issues.push(`handler ${handlerRef} must be callable`);
      continue;
    }
    if (
      handler.driverRequirement !== "sync_compatible" &&
      handler.driverRequirement !== "async_required"
    ) {
      issues.push(
        `handler ${handlerRef}.driverRequirement must be "sync_compatible" or "async_required"`
      );
    }
  }
  for (const [index, binding] of input.bindings.entries()) {
    const at = `bindings[${index}]`;
    // field shapes first (codex probe: empty/invalid fields must reject)
    if (!nonEmpty(binding.programRef)) issues.push(`${at}.programRef must be a non-empty string`);
    if (!nonEmpty(binding.stageRole)) issues.push(`${at}.stageRole must be a non-empty string`);
    if (!nonEmpty(binding.armId)) issues.push(`${at}.armId must be a non-empty string`);
    if (!nonEmpty(binding.handlerRef)) issues.push(`${at}.handlerRef must be a non-empty string`);
    if (!C_CALL_REGIME_VALUES.some((regime): boolean => regime === binding.regime)) {
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
    if (
      !C_CALL_HANDLER_CLASS_VALUES.some(
        (handlerClass): boolean => handlerClass === binding.handlerClass
      )
    ) {
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
  if (handler.driverRequirement !== "sync_compatible") {
    return Object.freeze({
      outcomeStatus: "blocked",
      evidenceRefs: Object.freeze([
        `handler-async-refused:${input.binding.handlerRef}`
      ]),
      payloadRef: null,
      responseContractRef: null,
      failureReason:
        handler.driverRequirement === "async_required"
          ? "handler_requires_async_driver (contract_failure)"
          : "handler_driver_requirement_invalid (contract_failure)"
    });
  }
  try {
    const interior = handler(input);
    if (interior instanceof Promise) {
      // the sync driver cannot await: typed refusal, never a dangling
      // promise (async handlers require the async driver).
      return Object.freeze({
        outcomeStatus: "blocked",
        evidenceRefs: Object.freeze([`handler-async-refused:${input.binding.handlerRef}`]),
        payloadRef: null,
        responseContractRef: null,
        failureReason: "handler_requires_async_driver (contract_failure)"
      });
    }
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

// Registry ASSEMBLY: bindings come from declarations; implementations
// by ref — the supplied map carries both the substrate's standard
// handlers and any product-supplied custom handlers (the plugin seam).
// Assembly is fail-closed via admitHandlerRegistry at the engine entry.
const HANDLER_BINDING_KEYS = Object.freeze([
  "programRef",
  "stageRole",
  "armId",
  "regime",
  "handlerRef",
  "handlerClass",
  "handlerConfigRef"
]);

// FAIL-CLOSED RAW-FIELD ADMISSION (codex P1): declaration rows are
// validated AS AUTHORED — no coercion, closed key set. A numeric
// programRef or boolean stageRole is a typed rejection, never a
// stringified admission.
export function assembleHandlerRegistry(input: {
  readonly declaredBindings: readonly unknown[];
  readonly handlers: ReadonlyMap<string, CCallHandler>;
}): CCallHandlerRegistry {
  const admitRegime = (
    value: string,
    at: string
  ): CCallHandlerBinding["regime"] => {
    const match = C_CALL_REGIME_VALUES.find(
      (regime): boolean => regime === value
    );
    if (match === undefined) {
      throw new TypeError(
        `${at}.regime must be one of ${JSON.stringify(C_CALL_REGIME_VALUES)}, got ${JSON.stringify(value)}`
      );
    }
    return match;
  };
  const admitHandlerClass = (
    value: string,
    at: string
  ): CCallHandlerBinding["handlerClass"] => {
    const match = C_CALL_HANDLER_CLASS_VALUES.find(
      (handlerClass): boolean => handlerClass === value
    );
    if (match === undefined) {
      throw new TypeError(
        `${at}.handlerClass must be one of ${JSON.stringify(C_CALL_HANDLER_CLASS_VALUES)}, got ${JSON.stringify(value)}`
      );
    }
    return match;
  };
  const bindings = input.declaredBindings.map((row, index) => {
    const at = `handler binding [${index}]`;
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw new TypeError(`${at} must be an object row`);
    }
    const record: Readonly<Record<string, unknown>> = { ...row };
    for (const key of Object.keys(record)) {
      if (!HANDLER_BINDING_KEYS.includes(key)) {
        throw new TypeError(`${at}: unknown field ${JSON.stringify(key)} (closed key set)`);
      }
    }
    const rawString = (key: string): string => {
      const value = record[key];
      if (typeof value !== "string" || value.length === 0) {
        throw new TypeError(
          `${at}.${key} must be a non-empty string as AUTHORED, got ${JSON.stringify(value)}`
        );
      }
      return value;
    };
    const configRef = record["handlerConfigRef"];
    if (configRef !== null && configRef !== undefined && typeof configRef !== "string") {
      throw new TypeError(
        `${at}.handlerConfigRef must be null or a string as AUTHORED, got ${JSON.stringify(configRef)}`
      );
    }
    return Object.freeze({
      programRef: rawString("programRef"),
      stageRole: rawString("stageRole"),
      armId: rawString("armId"),
      regime: admitRegime(rawString("regime"), at),
      handlerRef: rawString("handlerRef"),
      handlerClass: admitHandlerClass(rawString("handlerClass"), at),
      handlerConfigRef: configRef === undefined || configRef === null ? null : configRef
    });
  });
  return Object.freeze({ bindings: Object.freeze(bindings), handlers: input.handlers });
}

// Async twin: awaits handler promises; identical throw conversion.
export async function executeHandlerAsync(
  handler: CCallHandler,
  input: CCallHandlerInput
): Promise<CCallHandlerInterior> {
  if (
    handler.driverRequirement !== "sync_compatible" &&
    handler.driverRequirement !== "async_required"
  ) {
    return Object.freeze({
      outcomeStatus: "blocked",
      evidenceRefs: Object.freeze([
        `handler-driver-invalid:${input.binding.handlerRef}`
      ]),
      payloadRef: null,
      responseContractRef: null,
      failureReason: "handler_driver_requirement_invalid (contract_failure)"
    });
  }
  try {
    const interior = await handler(input);
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
