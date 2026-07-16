import type * as v from "valibot";

import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
  ownerNativeOperationContractSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";

type M03OwnerContractSlot = "request" | "result" | "refusal";

function source<
  const OperationId extends string,
  const Variant extends string,
  const Family extends string,
  const FamilyKey extends string,
  const Slot extends M03OwnerContractSlot,
  const ModulePath extends `code/src/abg/m03/contracts/${string}.js`,
  const ExportName extends string,
  const SemanticOwnerRef extends string,
  const SemanticOwnerDigest extends `sha256:${string}`,
  const S extends v.GenericSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly family: Family;
  readonly familyKey: FamilyKey;
  readonly slot: Slot;
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly semanticOwnerBasis: {
    readonly ref: SemanticOwnerRef;
    readonly digest: SemanticOwnerDigest;
  };
  readonly schema: S;
}) {
  return ownerNativeOperationContractSource({
    owner: {
      product: "abiogenesis",
      module: "abg.m03",
      family: input.family
    },
    operationId: input.operationId,
    variant: input.variant,
    slot: input.slot,
    semanticOwnerBasis: input.semanticOwnerBasis,
    contractShapeBasis: OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS,
    modulePath: input.modulePath,
    exportName: input.exportName,
    memberPath: [input.familyKey, input.variant, input.slot] as const,
    schema: input.schema
  });
}

export function m03OwnerContractSet<
  const OperationId extends string,
  const Variant extends string,
  const Family extends string,
  const FamilyKey extends string,
  const ModulePath extends `code/src/abg/m03/contracts/${string}.js`,
  const ExportName extends string,
  const SemanticOwnerRef extends string,
  const SemanticOwnerDigest extends `sha256:${string}`,
  const Request extends v.GenericSchema,
  const Result extends v.GenericSchema,
  const Refusal extends v.GenericSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly family: Family;
  readonly familyKey: FamilyKey;
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly semanticOwnerBasis: {
    readonly ref: SemanticOwnerRef;
    readonly digest: SemanticOwnerDigest;
  };
  readonly request: Request;
  readonly result: Result;
  readonly refusal: Refusal;
}) {
  const common = {
    operationId: input.operationId,
    variant: input.variant,
    family: input.family,
    familyKey: input.familyKey,
    modulePath: input.modulePath,
    exportName: input.exportName,
    semanticOwnerBasis: input.semanticOwnerBasis
  } as const;
  return freezeNativeValue({
    request: source({ ...common, slot: "request", schema: input.request }),
    result: source({ ...common, slot: "result", schema: input.result }),
    refusal: source({ ...common, slot: "refusal", schema: input.refusal })
  });
}
