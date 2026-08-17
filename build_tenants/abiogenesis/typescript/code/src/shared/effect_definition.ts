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

/**
 * Physical or execution-substrate failure at one installed definition
 * boundary. Expected Product/ABG/GTL/HoG/Validator refusals are values in the
 * owner output algebra and never use this carrier.
 */
export interface DefinitionExecutionFault<
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
  DefinitionExecutionFault<TPacket["definitionKey"]>,
  never
>;

export interface DefinitionHostFailure<
  K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike,
> {
  readonly failureKind: "typed_execution_fault" | "defect_or_interruption";
  readonly fault: DefinitionExecutionFault<K> | null;
  readonly cause: string;
}

export interface DefinitionHostReceipt<
  TPacket extends OwnerContractSourceDeclaration = OwnerContractSourceDeclaration,
  TResourceReceipt = unknown,
> {
  readonly kind: "definition_host_receipt";
  readonly schemaVersion: "5.0.0";
  readonly definitionKey: TPacket["definitionKey"];
  readonly invocationRef: string;
  readonly exitCode: 0 | 1 | 3 | 70;
  readonly ownerOutput: OwnerSemanticOutput<TPacket> | null;
  readonly resources: TResourceReceipt | null;
  readonly failure: DefinitionHostFailure<TPacket["definitionKey"]> | null;
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
    DefinitionExecutionFault<TPacket["definitionKey"]>,
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
    resources: null,
    failure: Object.freeze({
      failureKind: typedFault === null
        ? "defect_or_interruption" as const
        : "typed_execution_fault" as const,
      fault: typedFault,
      cause: Cause.pretty(exit.cause),
    }),
  });
}
