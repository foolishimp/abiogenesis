import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  admitExactDefinitionCall,
  definitionFault,
  validatedOwnerOutput,
} from "./definition_binding_mechanics.js";
import type {
  DefinitionCall,
  DefinitionReturn,
  ExactDefinitionCallable,
} from "../../shared/effect_definition.js";
import { admitContract } from "../../shared/admit/index.js";
import { deepFreeze } from "../../shared/immutable.js";
import type { OwnerContractSourceDeclaration } from
  "../../shared/public_function_contracts.js";

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
    const admittedInvocation = admitExactDefinitionCall(call, packet);
    if (admittedInvocation === null) {
      return Effect.fail(definitionFault(
        packet.definitionKey,
        "call_admission",
        "call_identity_mismatch",
        "definition call differs from its fixed module-static coordinate",
      ));
    }

    const admittedResources = admitContract(
      resourceAssertionSchema,
      call.resources,
    );
    if (admittedResources.kind !== "ok") {
      return Effect.fail(definitionFault(
        packet.definitionKey,
        "resource_admission",
        "invalid_resource_assertion",
        "definition resources differ from the owner-authored structural contract",
      ));
    }

    const admittedCall: DefinitionCall<TPacket, TResources> = deepFreeze({
      invocation: admittedInvocation,
      resources: admittedResources.value,
    });
    return Effect.suspend(() => owner(admittedCall)).pipe(
      Effect.flatMap((result) => {
        const admittedReceipt = admitContract(
          resourceReceiptSchema,
          result.resources,
        );
        if (admittedReceipt.kind !== "ok") {
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
            resources: admittedReceipt.value,
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
