import * as Effect from "effect/Effect";
import * as v from "valibot";

import type {
  AbgEventResourceAssertion,
  AbgEventResourceReceipt,
} from "../abg/definition_event_resource.js";
import {
  definitionFault,
  exactDefinitionCallMatches,
  validatedOwnerOutput,
} from "./definition_binding_mechanics.js";
import type {
  DefinitionCall,
  DefinitionReturn,
  ExactDefinitionCallable,
} from "./effect_definition.js";
import { deepFreeze } from "./immutable.js";
import type { OwnerContractSourceDeclaration } from
  "./public_function_contracts.js";

/**
 * Constructs one module-static definition closure over an exact owner and its
 * owner-authored structural resource contracts.
 */
export function bindStaticOwner<
  TPacket extends OwnerContractSourceDeclaration,
  TResources,
  TResourceReceipt,
>(
  packet: TPacket,
  owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>,
  resourceAssertionSchema: v.GenericSchema<TResources, TResources>,
  resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>,
): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt> {
  const callable: ExactDefinitionCallable<
    TPacket,
    TResources,
    TResourceReceipt
  > = (call) => {
    if (!exactDefinitionCallMatches(call, packet)) {
      return Effect.fail(definitionFault(
        packet.definitionKey,
        "call_admission",
        "call_identity_mismatch",
        "definition call differs from its fixed module-static coordinate",
      ));
    }

    const admittedResources = v.safeParse(
      resourceAssertionSchema,
      call.resources,
    );
    if (!admittedResources.success) {
      return Effect.fail(definitionFault(
        packet.definitionKey,
        "resource_admission",
        "invalid_resource_assertion",
        "definition resources differ from the owner-authored structural contract",
      ));
    }

    const admittedCall: DefinitionCall<TPacket, TResources> = deepFreeze({
      invocation: call.invocation,
      resources: admittedResources.output,
    });
    return Effect.suspend(() => owner(admittedCall)).pipe(
      Effect.flatMap((result) => {
        const admittedReceipt = v.safeParse(
          resourceReceiptSchema,
          result.resources,
        );
        if (!admittedReceipt.success) {
          return Effect.fail(definitionFault(
            packet.definitionKey,
            "receipt_admission",
            "invalid_resource_receipt",
            "owner receipt differs from its module-static structural contract",
          ));
        }
        return Effect.try({
          try: (): DefinitionReturn<TPacket, TResourceReceipt> => deepFreeze({
            ownerOutput: validatedOwnerOutput(
              packet,
              result.ownerOutput,
              "module-static definition owner",
            ),
            resources: admittedReceipt.output,
          }),
          catch: () => definitionFault(
            packet.definitionKey,
            "owner_output_admission",
            "invalid_owner_output",
            "owner output differs from its exact fixed-packet contract",
          ),
        });
      }),
    );
  };
  return Object.freeze(callable);
}

/** Module-static specialization for an unchanged exact-prefix owner read. */
export function bindExactPrefixRead<
  TPacket extends OwnerContractSourceDeclaration,
  TResources extends Readonly<{
    readonly eventResource: AbgEventResourceAssertion;
  }>,
  TResourceReceipt extends Readonly<{
    readonly eventResource: AbgEventResourceReceipt;
  }>,
>(
  packet: TPacket,
  owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>,
  resourceAssertionSchema: v.GenericSchema<TResources, TResources>,
  resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>,
): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt> {
  return bindStaticOwner(
    packet,
    owner,
    resourceAssertionSchema,
    resourceReceiptSchema,
  );
}

/** Module-static specialization for an owner-admitted prefix transition. */
export function bindExactPrefixTransition<
  TPacket extends OwnerContractSourceDeclaration,
  TResources extends Readonly<{
    readonly eventResource: AbgEventResourceAssertion;
  }>,
  TResourceReceipt extends Readonly<{
    readonly eventResource: AbgEventResourceReceipt;
  }>,
>(
  packet: TPacket,
  owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>,
  resourceAssertionSchema: v.GenericSchema<TResources, TResources>,
  resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>,
): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt> {
  return bindStaticOwner(
    packet,
    owner,
    resourceAssertionSchema,
    resourceReceiptSchema,
  );
}
