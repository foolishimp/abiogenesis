import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";

import type {
  OwnerContractSourceDeclaration,
  OwnerSemanticOutput,
  OwnerRequestOf,
} from "./public_function_contracts.js";
import type {
  AdmittedPublicInvocation,
  PublicDefinitionKeyLike,
} from "./public_invocation.js";
import type { JsonValue } from "./canonical_json.js";
import { admitIJsonValue } from "./i_json.js";
import { deepFreeze } from "./immutable.js";

/**
 * Physical or execution-substrate failure at one installed definition
 * boundary. Expected Product/ABG/GTL/HoG/Validator refusals are values in the
 * owner output algebra and never use this carrier.
 */
interface DefinitionExecutionFaultFields<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> {
  readonly kind: "definition_execution_fault";
  readonly schemaVersion: "5.0.0";
  readonly definitionKey: K;
  readonly stage: string;
  readonly code: string;
  readonly message: string;
  readonly evidence: Readonly<Record<string, JsonValue>>;
}

export type PreDefinitionExecutionFault<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> = DefinitionExecutionFaultFields<K> & Readonly<{
  readonly faultBoundary: "pre_acquisition_or_pre_append";
  readonly resourceReceipt: null;
}>;

export type PostAppendDefinitionExecutionFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
> = DefinitionExecutionFaultFields<K> & Readonly<{
  readonly faultBoundary: "post_append";
  readonly resourceReceipt: TResourceReceipt;
}>;

export type PostOwnerValidationDefinitionExecutionFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
> = DefinitionExecutionFaultFields<K> & Readonly<{
  readonly faultBoundary: "post_owner_output_or_receipt_validation";
  readonly resourceReceipt: TResourceReceipt;
}>;

export type DefinitionExecutionFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
> =
  | PreDefinitionExecutionFault<K>
  | PostAppendDefinitionExecutionFault<K, TResourceReceipt>
  | PostOwnerValidationDefinitionExecutionFault<K, TResourceReceipt>;

export interface AdmittedDefinitionResourceReceipt<TResourceReceipt> {
  readonly resourceReceipt: TResourceReceipt;
}

export type AdmitDefinitionResourceReceipt<TResourceReceipt> = (
  candidate: unknown,
) => AdmittedDefinitionResourceReceipt<TResourceReceipt> | null;

const DEFINITION_FAULT_KEYS = Object.freeze([
  "kind",
  "schemaVersion",
  "definitionKey",
  "stage",
  "code",
  "message",
  "evidence",
  "faultBoundary",
  "resourceReceipt",
]);

const DEFINITION_KEY_KEYS = Object.freeze([
  "operationId",
  "memberKey",
]);

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactOrdinaryDataMembers(
  value: Readonly<Record<string, unknown>>,
  expectedKeys: readonly string[],
): boolean {
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key) => typeof key !== "string" || !expectedKeys.includes(key))
  ) return false;
  return expectedKeys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined &&
      Object.hasOwn(descriptor, "value") &&
      !Object.hasOwn(descriptor, "get") &&
      !Object.hasOwn(descriptor, "set") &&
      descriptor.enumerable === true;
  });
}

function dataMember(
  value: Readonly<Record<string, unknown>>,
  key: string,
): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor !== undefined && Object.hasOwn(descriptor, "value")
    ? descriptor.value
    : undefined;
}

function admittedNonblankText(value: unknown, label: string): string | null {
  try {
    const admitted = admitIJsonValue(value, label);
    return typeof admitted === "string" && /\S/u.test(admitted)
      ? admitted
      : null;
  } catch {
    return null;
  }
}

function admittedDefinitionKey(
  value: unknown,
  expected: PublicDefinitionKeyLike | null,
): PublicDefinitionKeyLike | null {
  let admitted: JsonValue;
  try {
    admitted = admitIJsonValue(value, "DefinitionExecutionFault.definitionKey");
  } catch {
    return null;
  }
  if (
    !isRecord(admitted) ||
    !hasExactOrdinaryDataMembers(admitted, DEFINITION_KEY_KEYS)
  ) return null;
  const operationId = admittedNonblankText(
    dataMember(admitted, "operationId"),
    "DefinitionExecutionFault.definitionKey.operationId",
  );
  const memberKey = admittedNonblankText(
    dataMember(admitted, "memberKey"),
    "DefinitionExecutionFault.definitionKey.memberKey",
  );
  if (operationId === null || memberKey === null) return null;
  if (
    expected !== null &&
    (operationId !== expected.operationId || memberKey !== expected.memberKey)
  ) return null;
  return deepFreeze({ operationId, memberKey });
}

function admittedEvidence(
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  let admitted: JsonValue;
  try {
    admitted = admitIJsonValue(value, "DefinitionExecutionFault.evidence");
  } catch {
    return null;
  }
  return isRecord(admitted) ? admitted : null;
}

function assertConstructorFields<K extends PublicDefinitionKeyLike>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
  evidence: Readonly<Record<string, JsonValue>>,
): Readonly<{
  readonly definitionKey: K;
  readonly stage: string;
  readonly code: string;
  readonly message: string;
  readonly evidence: Readonly<Record<string, JsonValue>>;
}> {
  if (admittedDefinitionKey(definitionKey, null) === null) {
    throw new TypeError("definition fault requires one exact definition key");
  }
  const admittedStage = admittedNonblankText(
    stage,
    "DefinitionExecutionFault.stage",
  );
  const admittedCode = admittedNonblankText(
    code,
    "DefinitionExecutionFault.code",
  );
  const admittedMessage = admittedNonblankText(
    message,
    "DefinitionExecutionFault.message",
  );
  const exactEvidence = admittedEvidence(evidence);
  if (
    admittedStage === null ||
    admittedCode === null ||
    admittedMessage === null ||
    exactEvidence === null
  ) {
    throw new TypeError("definition fault fields must be exact I-JSON values");
  }
  return {
    definitionKey,
    stage: admittedStage,
    code: admittedCode,
    message: admittedMessage,
    evidence: exactEvidence,
  };
}

function definitionFaultFields<K extends PublicDefinitionKeyLike>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
  evidence: Readonly<Record<string, JsonValue>>,
): DefinitionExecutionFaultFields<K> {
  const admitted = assertConstructorFields(
    definitionKey,
    stage,
    code,
    message,
    evidence,
  );
  return {
    kind: "definition_execution_fault",
    schemaVersion: "5.0.0",
    ...admitted,
  };
}

/**
 * Runtime admission for the shared execution-fault ABI. The generic receipt
 * crosses this boundary only through its concrete owner's independent schema;
 * malformed candidates are never asserted into the typed fault carrier.
 */
export function admitDefinitionExecutionFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
>(
  candidate: unknown,
  expectedDefinitionKey: K,
  admitResourceReceipt: AdmitDefinitionResourceReceipt<TResourceReceipt>,
): DefinitionExecutionFault<K, TResourceReceipt> | null {
  if (
    !isRecord(candidate) ||
    !hasExactOrdinaryDataMembers(candidate, DEFINITION_FAULT_KEYS)
  ) return null;
  if (
    dataMember(candidate, "kind") !== "definition_execution_fault" ||
    dataMember(candidate, "schemaVersion") !== "5.0.0" ||
    admittedDefinitionKey(
        dataMember(candidate, "definitionKey"),
        expectedDefinitionKey,
      ) === null
  ) return null;
  const stage = admittedNonblankText(
    dataMember(candidate, "stage"),
    "DefinitionExecutionFault.stage",
  );
  const code = admittedNonblankText(
    dataMember(candidate, "code"),
    "DefinitionExecutionFault.code",
  );
  const message = admittedNonblankText(
    dataMember(candidate, "message"),
    "DefinitionExecutionFault.message",
  );
  const evidence = admittedEvidence(dataMember(candidate, "evidence"));
  if (
    stage === null || code === null || message === null || evidence === null
  ) return null;

  const boundary = dataMember(candidate, "faultBoundary");
  const receiptCandidate = dataMember(candidate, "resourceReceipt");
  if (boundary === "pre_acquisition_or_pre_append") {
    return receiptCandidate === null
      ? preDefinitionFault(
          expectedDefinitionKey,
          stage,
          code,
          message,
          evidence,
        )
      : null;
  }
  if (
    boundary !== "post_append" &&
    boundary !== "post_owner_output_or_receipt_validation"
  ) return null;
  let admittedReceipt: AdmittedDefinitionResourceReceipt<TResourceReceipt> | null;
  try {
    admittedReceipt = admitResourceReceipt(receiptCandidate);
  } catch {
    return null;
  }
  if (admittedReceipt === null) return null;
  return boundary === "post_append"
    ? postAppendDefinitionFault(
        expectedDefinitionKey,
        stage,
        code,
        message,
        admittedReceipt.resourceReceipt,
        evidence,
      )
    : postOwnerValidationDefinitionFault(
        expectedDefinitionKey,
        stage,
        code,
        message,
        admittedReceipt.resourceReceipt,
        evidence,
      );
}

export function preDefinitionFault<K extends PublicDefinitionKeyLike>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
  evidence: Readonly<Record<string, JsonValue>> = {},
): PreDefinitionExecutionFault<K> {
  return deepFreeze({
    ...definitionFaultFields(definitionKey, stage, code, message, evidence),
    faultBoundary: "pre_acquisition_or_pre_append" as const,
    resourceReceipt: null,
  });
}

export function postAppendDefinitionFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
  resourceReceipt: TResourceReceipt,
  evidence: Readonly<Record<string, JsonValue>> = {},
): PostAppendDefinitionExecutionFault<K, TResourceReceipt> {
  return deepFreeze({
    ...definitionFaultFields(definitionKey, stage, code, message, evidence),
    faultBoundary: "post_append" as const,
    resourceReceipt,
  });
}

export function postOwnerValidationDefinitionFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
  resourceReceipt: TResourceReceipt,
  evidence: Readonly<Record<string, JsonValue>> = {},
): PostOwnerValidationDefinitionExecutionFault<K, TResourceReceipt> {
  return deepFreeze({
    ...definitionFaultFields(definitionKey, stage, code, message, evidence),
    faultBoundary: "post_owner_output_or_receipt_validation" as const,
    resourceReceipt,
  });
}

/**
 * The thin host-call carrier. `resources` is a sibling assertion supplied by
 * the transport. It is not part of the semantic request and becomes usable
 * only after the selected concrete owner has validated it.
 */
export interface DefinitionCall<
  TPacket extends OwnerContractSourceDeclaration,
  TResources,
> {
  readonly invocation: AdmittedPublicInvocation<
    TPacket["definitionKey"],
    OwnerRequestOf<TPacket> & Readonly<Record<string, JsonValue>>
  >;
  readonly resources: TResources;
}

/** One owner result plus the exact serializable successor resource handoff. */
export interface DefinitionReturn<
  TPacket extends OwnerContractSourceDeclaration,
  TResourceReceipt,
> {
  readonly ownerOutput: OwnerSemanticOutput<TPacket>;
  readonly resources: TResourceReceipt;
}

/**
 * The singular installed definition ABI. Each concrete owner returns one
 * closed Effect program; any physical resource is acquired and released in
 * that program's Scope, so Public receives no runtime environment.
 */
export type ExactDefinitionCallable<
  TPacket extends OwnerContractSourceDeclaration,
  TResources,
  TResourceReceipt,
> = (
  call: DefinitionCall<TPacket, TResources>,
) => Effect.Effect<
  DefinitionReturn<TPacket, TResourceReceipt>,
  DefinitionExecutionFault<TPacket["definitionKey"], TResourceReceipt>,
  never
>;

export interface DefinitionHostFailure<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
> {
  readonly failureKind: "typed_execution_fault" | "defect_or_interruption";
  readonly fault: DefinitionExecutionFault<K, TResourceReceipt> | null;
  readonly cause: string;
}

export interface DefinitionHostReceipt<
  TPacket extends OwnerContractSourceDeclaration,
  TResourceReceipt,
> {
  readonly kind: "definition_host_receipt";
  readonly schemaVersion: "5.0.0";
  readonly definitionKey: TPacket["definitionKey"];
  readonly invocationRef: string;
  readonly exitCode: 0 | 1 | 3 | 70;
  readonly ownerOutput: OwnerSemanticOutput<TPacket> | null;
  readonly resources: TResourceReceipt | null;
  readonly failure: DefinitionHostFailure<
    TPacket["definitionKey"],
    TResourceReceipt
  > | null;
}

/** Package-internal Effect host membrane shared by every installed program. */
export function runEffectProgram<A, E>(
  program: Effect.Effect<A, E, never>,
): Promise<Exit.Exit<A, E>> {
  return Effect.runPromiseExit(program);
}

/**
 * The package's sole Effect-to-Promise execution membrane. Callers may
 * project this receipt, but they may not reinterpret an execution failure as
 * an owner refusal.
 */
export async function runExactDefinition<
  TPacket extends OwnerContractSourceDeclaration,
  TResources,
  TResourceReceipt,
>(
  call: DefinitionCall<TPacket, TResources>,
  program: Effect.Effect<
    DefinitionReturn<TPacket, TResourceReceipt>,
    DefinitionExecutionFault<TPacket["definitionKey"], TResourceReceipt>,
    never
  >,
): Promise<DefinitionHostReceipt<TPacket, TResourceReceipt>> {
  const exit = await runEffectProgram(program);
  if (Exit.isSuccess(exit)) {
    const { ownerOutput, resources } = exit.value;
    return Object.freeze({
      kind: "definition_host_receipt" as const,
      schemaVersion: "5.0.0" as const,
      definitionKey: call.invocation.definitionKey,
      invocationRef: call.invocation.invocationRef,
      exitCode: ownerOutput.outcomeKind === "result"
        ? 0 as const
        : ownerOutput.outcomeKind === "refusal"
        ? 1 as const
        : 3 as const,
      ownerOutput,
      resources,
      failure: null,
    });
  }

  const failure = Cause.failureOption(exit.cause);
  const typedFault = Option.isSome(failure) ? failure.value : null;
  return Object.freeze({
    kind: "definition_host_receipt" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    invocationRef: call.invocation.invocationRef,
    exitCode: 70 as const,
    ownerOutput: null,
    resources: typedFault?.resourceReceipt ?? null,
    failure: Object.freeze({
      failureKind: typedFault === null
        ? "defect_or_interruption" as const
        : "typed_execution_fault" as const,
      fault: typedFault,
      cause: Cause.pretty(exit.cause),
    }),
  });
}
