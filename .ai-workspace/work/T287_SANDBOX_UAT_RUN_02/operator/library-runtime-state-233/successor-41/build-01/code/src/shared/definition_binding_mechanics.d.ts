import { isRecord, hasUnicodeNulJoinedKeys as hasExactKeys } from "./admission_predicates.js";
import type { DefinitionCall, DefinitionExecutionFault } from "./effect_definition.js";
import { type OwnerContractSourceDeclaration, type OwnerSemanticOutput } from "./public_function_contracts.js";
import type { PublicDefinitionKeyLike, ReferenceDigest } from "./public_invocation.js";
export declare function sameJson(left: unknown, right: unknown): boolean;
export declare function sameCoordinate(left: ReferenceDigest, right: ReferenceDigest): boolean;
export declare function reference<T = unknown>(ref: string, digest: ReferenceDigest["digest"]): ReferenceDigest<T>;
export declare function definitionFault<K extends PublicDefinitionKeyLike>(definitionKey: K, stage: string, code: string, message: string): DefinitionExecutionFault<K>;
export declare function isDefinitionFault(value: unknown): value is DefinitionExecutionFault;
export declare function validatedOwnerOutput<TPacket extends OwnerContractSourceDeclaration>(packet: TPacket, output: OwnerSemanticOutput<TPacket>, ownerLabel: string): OwnerSemanticOutput<TPacket>;
/** Admits and revalidates the complete call identity at a definition boundary. */
export declare function admitExactDefinitionCall<TPacket extends OwnerContractSourceDeclaration>(call: unknown, packet: TPacket): DefinitionCall<TPacket, never>["invocation"] | null;
/** Revalidates the complete admitted call identity at a definition boundary. */
export declare function exactDefinitionCallMatches(call: Readonly<{
    readonly invocation: unknown;
}>, packet: OwnerContractSourceDeclaration): boolean;
export { isRecord, hasExactKeys };
