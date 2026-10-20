import * as v from "valibot";
import { type AbgEventResourceAssertion, type AbgEventResourceReceipt, type AbgEventResourceInput, type AbgEventResourceOutcome } from "../abg/definition_event_resource.js";
import type { ExactDefinitionCallable } from "./effect_definition.js";
import type { OwnerContractSourceDeclaration } from "./public_function_contracts.js";
type ReopenAbgEventResourceAssertion = Extract<AbgEventResourceAssertion, {
    readonly kind: "reopen_abg_event_resource";
}>;
type ReopenAbgEventResourceReceipt = AbgEventResourceReceipt & Readonly<{
    readonly acquisitionKind: "reopen";
}>;
/**
 * Constructs one module-static definition closure over an exact owner and its
 * owner-authored structural resource contracts.
 */
export declare function bindStaticOwner<TPacket extends OwnerContractSourceDeclaration, TResources, TResourceReceipt>(packet: TPacket, owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>, resourceAssertionSchema: v.GenericSchema<TResources, TResources>, resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>;
/** Module-static specialization for an unchanged exact-prefix owner read. */
export declare function bindExactPrefixRead<TPacket extends OwnerContractSourceDeclaration, TResources extends Readonly<{
    readonly eventResource: ReopenAbgEventResourceAssertion;
}>, TResourceReceipt extends Readonly<{
    readonly eventResource: ReopenAbgEventResourceReceipt;
}>>(packet: TPacket, owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>, resourceAssertionSchema: v.GenericSchema<TResources, TResources>, resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>;
/** Module-static specialization for an owner-admitted prefix transition. */
export declare function bindExactPrefixTransition<TPacket extends OwnerContractSourceDeclaration, TResources extends Readonly<{
    readonly eventResource: AbgEventResourceInput;
}>, TResourceReceipt extends Readonly<{
    readonly eventResource: AbgEventResourceOutcome;
}>>(packet: TPacket, owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>, resourceAssertionSchema: v.GenericSchema<TResources, TResources>, resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>;
export {};
