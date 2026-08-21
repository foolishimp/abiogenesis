import * as Effect from "effect/Effect";
import * as v from "valibot";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  validateAbgEventResourceAssertion,
  validateAbgEventResourceReceipt,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "../abg/definition_event_resource.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import {
  admitExactDefinitionCall,
  validatedOwnerOutput,
} from "./definition_binding_mechanics.js";
import {
  admitDefinitionExecutionFault,
  postOwnerValidationDefinitionFault,
  preDefinitionFault,
  type DefinitionCall,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "./effect_definition.js";
import { sha256Bytes } from "./digests.js";
import { deepFreeze } from "./immutable.js";
import type { OwnerContractSourceDeclaration } from
  "./public_function_contracts.js";
import type { PublicDefinitionKeyLike } from "./public_invocation.js";

function samePrefix(
  left: DurablePrefixCoordinate,
  right: DurablePrefixCoordinate,
): boolean {
  return left.coordinateDigest === right.coordinateDigest;
}

function sameStore(
  left: DurablePrefixCoordinate,
  right: DurablePrefixCoordinate,
): boolean {
  return left.eventLogRef === right.eventLogRef &&
    left.storeIdentity.device === right.storeIdentity.device &&
    left.storeIdentity.inode === right.storeIdentity.inode &&
    left.storeIdentity.eventContractDigest ===
      right.storeIdentity.eventContractDigest;
}

type ReopenAbgEventResourceAssertion = Extract<
  AbgEventResourceAssertion,
  { readonly kind: "reopen_abg_event_resource" }
>;

type ReopenAbgEventResourceReceipt = AbgEventResourceReceipt & Readonly<{
  readonly acquisitionKind: "reopen";
}>;

const EMPTY_PREFIX_DIGEST = sha256Bytes(new Uint8Array());

function admittedEventReceipt(value: unknown): AbgEventResourceReceipt | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const eventResource = (value as Readonly<Record<string, unknown>>).eventResource;
  return validateAbgEventResourceReceipt(eventResource) ? eventResource : null;
}

function exactReadReceipt(
  assertion: AbgEventResourceAssertion,
  receipt: AbgEventResourceReceipt,
): boolean {
  return assertion.kind === "reopen_abg_event_resource" &&
    validateAbgEventResourceAssertion(assertion) &&
    validateAbgEventResourceReceipt(receipt) &&
    receipt.acquisitionKind === "reopen" &&
    samePrefix(receipt.entryPrefix, assertion.closeHandoff.prefix) &&
    samePrefix(receipt.closeHandoff.prefix, receipt.entryPrefix);
}

function exactTransitionReceipt(
  assertion: AbgEventResourceAssertion,
  receipt: AbgEventResourceReceipt,
): boolean {
  if (
    !validateAbgEventResourceAssertion(assertion) ||
    !validateAbgEventResourceReceipt(receipt) ||
    receipt.acquisitionKind !==
      (assertion.kind === "new_abg_event_resource" ? "new" : "reopen")
  ) return false;
  if (
    assertion.kind === "new_abg_event_resource"
      ? receipt.entryPrefix.prefixLength !== 0 ||
        receipt.entryPrefix.prefixDigest !== EMPTY_PREFIX_DIGEST ||
        receipt.entryPrefix.eventLogRef !==
          pathToFileURL(resolve(assertion.eventLogPath)).href
      : !samePrefix(receipt.entryPrefix, assertion.closeHandoff.prefix)
  ) return false;
  const successor = receipt.closeHandoff.prefix;
  return sameStore(receipt.entryPrefix, successor) &&
    successor.prefixLength >= receipt.entryPrefix.prefixLength &&
    (successor.prefixLength !== receipt.entryPrefix.prefixLength ||
      samePrefix(receipt.entryPrefix, successor));
}

function admittedOwnerFault<
  K extends PublicDefinitionKeyLike,
  TResourceReceipt,
>(
  fault: unknown,
  expectedDefinitionKey: K,
  resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>,
): ReturnType<typeof admitDefinitionExecutionFault<K, TResourceReceipt>> {
  return admitDefinitionExecutionFault(
    fault,
    expectedDefinitionKey,
    (candidate) => v.is(resourceReceiptSchema, candidate)
      ? { resourceReceipt: candidate }
      : null,
  );
}

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
      return Effect.fail(preDefinitionFault(
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
      return Effect.fail(preDefinitionFault(
        packet.definitionKey,
        "resource_admission",
        "invalid_resource_assertion",
        "definition resources differ from the owner-authored structural contract",
      ));
    }

    const admittedCall: DefinitionCall<TPacket, TResources> = deepFreeze({
      invocation: admittedInvocation,
      resources: admittedResources.output,
    });
    return Effect.suspend(() => owner(admittedCall)).pipe(
      Effect.catchAll((fault) => {
        const admittedFault = admittedOwnerFault(
          fault,
          packet.definitionKey,
          resourceReceiptSchema,
        );
        return admittedFault === null
          ? Effect.die(new TypeError(
              "owner emitted a malformed definition fault envelope or resource receipt",
            ))
          : Effect.fail(admittedFault);
      }),
      Effect.flatMap((result) => {
        const admittedReceipt = v.safeParse(
          resourceReceiptSchema,
          result.resources,
        );
        if (!admittedReceipt.success) {
          return Effect.die(new TypeError(
            "owner returned a malformed resource receipt",
          ));
        }
        return Effect.try({
          try: () => validatedOwnerOutput(
            packet,
            result.ownerOutput,
            "module-static definition owner",
          ),
          catch: () => postOwnerValidationDefinitionFault(
            packet.definitionKey,
            "owner_output_admission",
            "invalid_owner_output",
            "owner output differs from its exact fixed-packet contract",
            result.resources,
          ),
        }).pipe(
          Effect.map((ownerOutput): DefinitionReturn<
            TPacket,
            TResourceReceipt
          > => deepFreeze({
            ownerOutput,
            resources: result.resources,
          })),
        );
      }),
    );
  };
  return Object.freeze(callable);
}

/** Module-static specialization for an unchanged exact-prefix owner read. */
export function bindExactPrefixRead<
  TPacket extends OwnerContractSourceDeclaration,
  TResources extends Readonly<{
    readonly eventResource: ReopenAbgEventResourceAssertion;
  }>,
  TResourceReceipt extends Readonly<{
    readonly eventResource: ReopenAbgEventResourceReceipt;
  }>,
>(
  packet: TPacket,
  owner: ExactDefinitionCallable<TPacket, TResources, TResourceReceipt>,
  resourceAssertionSchema: v.GenericSchema<TResources, TResources>,
  resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>,
): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt> {
  const staticOwner = bindStaticOwner(
    packet,
    owner,
    resourceAssertionSchema,
    resourceReceiptSchema,
  );
  const readCallable: ExactDefinitionCallable<
    TPacket,
    TResources,
    TResourceReceipt
  > = (call) => {
    const admittedResources = v.safeParse(
      resourceAssertionSchema,
      call.resources,
    );
    if (
      !admittedResources.success ||
      admittedResources.output.eventResource.kind !==
        "reopen_abg_event_resource" ||
      !validateAbgEventResourceAssertion(
        admittedResources.output.eventResource,
      )
    ) {
      return Effect.fail(preDefinitionFault(
        packet.definitionKey,
        "resource_admission",
        "invalid_resource_assertion",
        "exact-prefix reads require one exact reopened ABG entry prefix",
      ));
    }
    const eventAssertion = admittedResources.output.eventResource;
    return staticOwner(call).pipe(
      Effect.flatMap((result) => {
        const eventReceipt = admittedEventReceipt(result.resources);
        if (eventReceipt === null) {
          return Effect.fail(postOwnerValidationDefinitionFault(
            packet.definitionKey,
            "receipt_admission",
            "invalid_resource_receipt",
            "exact-prefix reads require one structurally admitted ABG receipt",
            result.resources,
          ));
        }
        return exactReadReceipt(eventAssertion, eventReceipt)
          ? Effect.succeed(result)
          : Effect.fail(postOwnerValidationDefinitionFault(
              packet.definitionKey,
              "receipt_admission",
              "invalid_resource_receipt",
              "exact-prefix reads must return the unchanged owner-issued ABG prefix",
              result.resources,
            ));
      }),
    );
  };
  return Object.freeze(readCallable);
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
  const staticOwner = bindStaticOwner(
    packet,
    owner,
    resourceAssertionSchema,
    resourceReceiptSchema,
  );
  const transitionCallable: ExactDefinitionCallable<
    TPacket,
    TResources,
    TResourceReceipt
  > = (call) => {
    const admittedResources = v.safeParse(
      resourceAssertionSchema,
      call.resources,
    );
    if (
      !admittedResources.success ||
      !validateAbgEventResourceAssertion(
        admittedResources.output.eventResource,
      )
    ) {
      return Effect.fail(preDefinitionFault(
        packet.definitionKey,
        "resource_admission",
        "invalid_resource_assertion",
        "exact-prefix transitions require one exact new or reopened ABG resource",
      ));
    }
    const eventAssertion = admittedResources.output.eventResource;
    return staticOwner(call).pipe(
      Effect.flatMap((result) => {
        const eventReceipt = admittedEventReceipt(result.resources);
        if (eventReceipt === null) {
          return Effect.fail(postOwnerValidationDefinitionFault(
            packet.definitionKey,
            "receipt_admission",
            "invalid_resource_receipt",
            "exact-prefix transitions require one structurally admitted ABG receipt",
            result.resources,
          ));
        }
        return exactTransitionReceipt(eventAssertion, eventReceipt)
          ? Effect.succeed(result)
          : Effect.fail(postOwnerValidationDefinitionFault(
              packet.definitionKey,
              "receipt_admission",
              "invalid_resource_receipt",
              "exact-prefix transitions must return the matching owner-issued ABG successor",
              result.resources,
            ));
      }),
    );
  };
  return Object.freeze(transitionCallable);
}
