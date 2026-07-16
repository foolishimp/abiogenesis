import type * as v from "valibot";

import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  ownerNativeOperationContractSource,
  type OwnerNativeOperationContractSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";

type M03OwnerContractSlot = "request" | "result" | "refusal";

interface M03OwnerContractAuthorityIdentity {
  readonly kind: "owner_native_operation_contract_authority";
  readonly owner: {
    readonly product: "abiogenesis";
    readonly module: "abg.m03";
    readonly family: string;
  };
  readonly subject: {
    readonly operationId: string;
    readonly variant: string;
    readonly slot: M03OwnerContractSlot;
  };
  readonly carrierRevision: "5.0.0";
  readonly lawBasis: {
    readonly ref: "design://abg/m04/public-operation-definition-family";
    readonly digest: "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";
  };
}

const DESIGN_LAW_BASIS = freezeNativeValue({
  ref: "design://abg/m04/public-operation-definition-family",
  digest:
    "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281"
} as const);

function source<
  const OperationId extends string,
  const Variant extends string,
  const FamilyKey extends string,
  const Slot extends M03OwnerContractSlot,
  const S extends v.GenericSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly family: string;
  readonly familyKey: FamilyKey;
  readonly slot: Slot;
  readonly modulePath: `code/src/abg/m03/contracts/${string}.js`;
  readonly exportName: string;
  readonly schema: S;
}) {
  const operationSuffix = input.operationId.slice("abg.operation.".length);
  const suffix = `${operationSuffix}.${input.variant}.${input.slot}`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "abg.m03",
        family: input.family
      },
      subject: {
        operationId: input.operationId,
        variant: input.variant,
        slot: input.slot
      },
      carrierRevision: "5.0.0",
      lawBasis: DESIGN_LAW_BASIS
    },
    identity: {
      contractId: `abg.contract.operation.${suffix}`,
      contractVersion: "5.0.0",
      schemaId: `abg.schema.operation.${suffix}`,
      schemaVersion: "5.0.0"
    },
    sourceLocator: {
      kind: "private_source_module",
      sourceRoot: "semantic_build",
      modulePath: input.modulePath,
      exportName: input.exportName,
      memberPath: [input.familyKey, input.variant, input.slot, "schema"]
    },
    schema: input.schema
  } satisfies OwnerNativeOperationContractSource<
    S,
    M03OwnerContractAuthorityIdentity
  >);
}

export function m03OwnerContractSet<
  const OperationId extends string,
  const Variant extends string,
  const FamilyKey extends string,
  const Request extends v.GenericSchema,
  const Result extends v.GenericSchema,
  const Refusal extends v.GenericSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly family: string;
  readonly familyKey: FamilyKey;
  readonly modulePath: `code/src/abg/m03/contracts/${string}.js`;
  readonly exportName: string;
  readonly request: Request;
  readonly result: Result;
  readonly refusal: Refusal;
}) {
  return freezeNativeValue({
    request: source({ ...input, slot: "request", schema: input.request }),
    result: source({ ...input, slot: "result", schema: input.result }),
    refusal: source({ ...input, slot: "refusal", schema: input.refusal })
  });
}
