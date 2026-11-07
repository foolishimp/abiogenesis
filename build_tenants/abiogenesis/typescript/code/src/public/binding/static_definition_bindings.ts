import { types } from "node:util";

import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  admitExactDefinitionCall,
  countDefinitionResourceGate,
  definitionFault,
  validatedOwnerOutput,
} from "./definition_binding_mechanics.js";
import type {
  DefinitionCall,
  DefinitionReturn,
  EstablishedResourceMembers,
  ExactDefinitionCallable,
} from "../../shared/effect_definition.js";
import { admitContract, isRecord } from "../../shared/admit/index.js";
import { ok, type Outcome } from "../../shared/refusal.js";
import { deepFreeze } from "../../shared/immutable.js";
import type { OwnerContractSourceDeclaration } from
  "../../shared/public_function_contracts.js";

type StrictObjectSchema = Readonly<{
  type: "strict_object";
  entries: Readonly<Record<string, v.GenericSchema>>;
}>;

function strictObjectSchema(schema: unknown): StrictObjectSchema | null {
  // A piped strict object keeps its type and adds whole-object actions; it
  // takes the whole-object path.
  return isRecord(schema) && schema.type === "strict_object" && isRecord(schema.entries) &&
    schema.pipe === undefined
    ? schema as unknown as StrictObjectSchema : null;
}

function wholeResources<TResources>(
  schema: v.GenericSchema<TResources, TResources>,
  raw: unknown,
  keys: readonly string[],
): Outcome<TResources> {
  countDefinitionResourceGate(keys, 0);
  return admitContract(schema, raw);
}

/**
 * Resource admission (§10.11 X4). A member whose owner predicate accepts its
 * exact value is passed by identity, before any I-JSON copy, schema run or
 * frozen walk; the remaining members are admitted together under the same
 * strict key law and I-JSON gate, and the output keeps the schema's entry
 * order, transforms and defaults. Anything else takes whole-object
 * `admitContract` exactly as before.
 */
function admitResources<TResources>(
  schema: v.GenericSchema<TResources, TResources>,
  established: EstablishedResourceMembers<TResources> | undefined,
  ownerMembers: readonly string[],
  raw: unknown,
): Outcome<TResources> {
  const strict = ownerMembers.length === 0 ? null : strictObjectSchema(schema);
  if (strict === null || !isRecord(raw) || types.isProxy(raw) ||
      Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) {
    return wholeResources(schema, raw, isRecord(raw) && !types.isProxy(raw) ? Object.keys(raw) : []);
  }
  const members = new Map<string, unknown>();
  for (const key of Reflect.ownKeys(raw)) {
    const descriptor = Object.getOwnPropertyDescriptor(raw, key);
    // The canonical gate refuses a symbol, accessor or non-enumerable member;
    // an unknown key fails the strict key law. Each keeps that whole path.
    if (typeof key !== "string" || descriptor === undefined || !Object.hasOwn(descriptor, "value") ||
        descriptor.enumerable !== true || !Object.hasOwn(strict.entries, key)) {
      return wholeResources(schema, raw, Reflect.ownKeys(raw).filter((k): k is string => typeof k === "string"));
    }
    members.set(key, descriptor.value);
  }
  const accepted = ownerMembers.filter((key) => members.has(key) &&
    (established as Readonly<Record<string, (value: unknown) => boolean>>)[key]!(members.get(key)) === true);
  if (accepted.length === 0) return wholeResources(schema, raw, [...members.keys()]);
  const fresh = [...members].filter(([key]) => !accepted.includes(key));
  countDefinitionResourceGate(fresh.map(([key]) => key), accepted.length);
  const admitted = admitContract(
    v.strictObject(Object.fromEntries(Object.entries(strict.entries)
      .filter(([key]) => !accepted.includes(key)))) as unknown as v.GenericSchema,
    Object.fromEntries(fresh),
  );
  if (admitted.kind !== "ok") return admitted;
  const output = admitted.value as Readonly<Record<string, unknown>>;
  return ok(Object.fromEntries(Object.keys(strict.entries).flatMap((key): [string, unknown][] =>
    accepted.includes(key) ? [[key, members.get(key)]]
      : Object.hasOwn(output, key) ? [[key, output[key]]] : [])) as unknown as TResources);
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
  establishedResourceMembers?: EstablishedResourceMembers<TResources>,
): ExactDefinitionCallable<TPacket, TResources, TResourceReceipt> {
  const ownerMembers = Object.freeze(establishedResourceMembers === undefined ? [] : Object.keys(establishedResourceMembers));
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

    const admittedResources = admitResources(
      resourceAssertionSchema,
      establishedResourceMembers,
      ownerMembers,
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
