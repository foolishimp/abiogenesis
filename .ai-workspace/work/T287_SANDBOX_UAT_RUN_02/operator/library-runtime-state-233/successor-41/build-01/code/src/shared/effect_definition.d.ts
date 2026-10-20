import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import type { OwnerContractSourceDeclaration, OwnerSemanticOutput, OwnerRequestOf } from "./public_function_contracts.js";
import type { AdmittedPublicInvocation, PublicDefinitionKeyLike } from "./public_invocation.js";
import type { JsonValue } from "./canonical_json.js";
/**
 * Physical or execution-substrate failure at one installed definition
 * boundary. Expected Product/ABG/GTL/HoG/Validator refusals are values in the
 * owner output algebra and never use this carrier.
 */
export interface DefinitionExecutionFault<K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike> {
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
export interface DefinitionCall<TPacket extends OwnerContractSourceDeclaration, TResources> {
    readonly invocation: AdmittedPublicInvocation<TPacket["definitionKey"], OwnerRequestOf<TPacket> & Readonly<Record<string, JsonValue>>>;
    readonly resources: TResources;
}
/** One owner result plus the exact serializable successor resource handoff. */
export interface DefinitionReturn<TPacket extends OwnerContractSourceDeclaration, TResourceReceipt> {
    readonly ownerOutput: OwnerSemanticOutput<TPacket>;
    readonly resources: TResourceReceipt;
}
/**
 * The singular installed definition ABI. Each concrete owner returns one
 * closed Effect program; any physical resource is acquired and released in
 * that program's Scope, so Public receives no runtime environment.
 */
export type ExactDefinitionCallable<TPacket extends OwnerContractSourceDeclaration, TResources, TResourceReceipt> = (call: DefinitionCall<TPacket, TResources>) => Effect.Effect<DefinitionReturn<TPacket, TResourceReceipt>, DefinitionExecutionFault<TPacket["definitionKey"]>, never>;
export interface DefinitionHostFailure<K extends PublicDefinitionKeyLike = PublicDefinitionKeyLike> {
    readonly failureKind: "typed_execution_fault" | "defect_or_interruption";
    readonly fault: DefinitionExecutionFault<K> | null;
    readonly cause: string;
}
export interface DefinitionHostReceipt<TPacket extends OwnerContractSourceDeclaration = OwnerContractSourceDeclaration, TResourceReceipt = unknown> {
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
export declare function runEffectProgram<A, E>(program: Effect.Effect<A, E, never>): Promise<Exit.Exit<A, E>>;
/**
 * The package's sole Effect-to-Promise execution membrane. Callers may
 * project this receipt, but they may not reinterpret an execution failure as
 * an owner refusal.
 */
export declare function runExactDefinition<TPacket extends OwnerContractSourceDeclaration, TResources, TResourceReceipt>(call: DefinitionCall<TPacket, TResources>, program: Effect.Effect<DefinitionReturn<TPacket, TResourceReceipt>, DefinitionExecutionFault<TPacket["definitionKey"]>, never>): Promise<DefinitionHostReceipt<TPacket, TResourceReceipt>>;
