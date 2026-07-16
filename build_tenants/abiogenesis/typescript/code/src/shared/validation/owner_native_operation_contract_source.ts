import type * as v from "valibot";

import { freezeNativeValue } from "./immutable_native_value.js";

type NativeSchema = v.GenericSchema;
type Sha256Digest = `sha256:${string}`;

export type OwnerNativeOperationContractSlot =
  | "request"
  | "result"
  | "refusal"
  | "nonterminal";

export interface OwnerNativeAuthorityBasis {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface OwnerNativeContractShapeBasis
  extends OwnerNativeAuthorityBasis {
  readonly status: "accepted_design_pin";
}

export const OWNER_NATIVE_OPERATION_CONTRACT_SHAPE_BASIS = freezeNativeValue({
  ref: "design://abg/m04/public-operation-definition-family",
  digest:
    "sha256:f4228920cbf91152be569604e9fa7586903feb7b92ef81b456457a3ea2252c8b",
  status: "accepted_design_pin"
} as const satisfies OwnerNativeContractShapeBasis);

export interface OwnerNativeSemanticOwner {
  readonly product: "abiogenesis";
  readonly module: string;
  readonly family: string;
}

export interface OwnerNativeOperationContractAuthority<
  Owner extends OwnerNativeSemanticOwner = OwnerNativeSemanticOwner,
  OperationId extends string = string,
  Variant extends string = string,
  Slot extends OwnerNativeOperationContractSlot = OwnerNativeOperationContractSlot
> {
  readonly kind: "owner_native_operation_contract_authority";
  readonly owner: Owner;
  readonly subject: {
    readonly operationId: OperationId;
    readonly variant: Variant;
    readonly slot: Slot;
  };
  readonly carrierRevision: "5.0.0";
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
  readonly contractShapeBasis: OwnerNativeContractShapeBasis;
}

export interface OwnerNativeOperationContractIdentity {
  readonly contractId: string;
  readonly contractVersion: "5.0.0";
  readonly schemaId: string;
  readonly schemaVersion: "5.0.0";
}

export interface OwnerNativeOperationContractSourceLocator<
  ModulePath extends string = string,
  ExportName extends string = string,
  MemberPath extends readonly [...string[], "schema"] = readonly [
    ...string[],
    "schema"
  ]
> {
  readonly kind: "private_source_module";
  readonly sourceRoot: "semantic_build";
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly memberPath: MemberPath;
}

export interface OwnerNativeOperationContractSource<
  S extends NativeSchema = NativeSchema,
  Owner extends OwnerNativeSemanticOwner = OwnerNativeSemanticOwner,
  OperationId extends string = string,
  Variant extends string = string,
  Slot extends OwnerNativeOperationContractSlot = OwnerNativeOperationContractSlot,
  ModulePath extends string = string,
  ExportName extends string = string,
  MemberPath extends readonly [...string[], "schema"] = readonly [
    ...string[],
    "schema"
  ]
> {
  readonly kind: "owner_native_operation_contract_source";
  readonly authority: OwnerNativeOperationContractAuthority<
    Owner,
    OperationId,
    Variant,
    Slot
  >;
  readonly identity: OwnerNativeOperationContractIdentity;
  readonly sourceLocator: OwnerNativeOperationContractSourceLocator<
    ModulePath,
    ExportName,
    MemberPath
  >;
  readonly schema: S;
}

export interface OwnerNativeOperationContractGap<
  OperationId extends string = string,
  Variant extends string = string,
  Slot extends OwnerNativeOperationContractSlot = OwnerNativeOperationContractSlot
> {
  readonly kind: "semantic_not_realized";
  readonly gapCode: string;
  readonly coordinate: {
    readonly definitionKey: {
      readonly operationId: OperationId;
      readonly memberKind: "variant";
      readonly variant: Variant;
    };
    readonly slot: Slot;
  };
  readonly ownerAuthorityRef: string | null;
  readonly ownerAuthorityDigest: Sha256Digest | null;
  readonly ownerTicket: string | null;
  readonly ownerDesignRef: string | null;
  readonly evidenceRefs: readonly [string, ...string[]];
}

export function ownerNativeOperationContractSource<
  const S extends NativeSchema,
  const Owner extends OwnerNativeSemanticOwner,
  const OperationId extends string,
  const Variant extends string,
  const Slot extends OwnerNativeOperationContractSlot,
  const ModulePath extends string,
  const ExportName extends string,
  const MemberPath extends readonly string[]
>(input: {
  readonly owner: Owner;
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly slot: Slot;
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
  readonly contractShapeBasis: OwnerNativeContractShapeBasis;
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly memberPath: MemberPath;
  readonly schema: S;
}): OwnerNativeOperationContractSource<
  S,
  Owner,
  OperationId,
  Variant,
  Slot,
  ModulePath,
  ExportName,
  readonly [...MemberPath, "schema"]
> {
  const suffix = `${input.operationId.slice("abg.operation.".length)}.${input.variant}.${input.slot}`;
  return freezeNativeValue({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: input.owner,
      subject: {
        operationId: input.operationId,
        variant: input.variant,
        slot: input.slot
      },
      carrierRevision: "5.0.0",
      semanticOwnerBasis: input.semanticOwnerBasis,
      contractShapeBasis: input.contractShapeBasis
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
      memberPath: [...input.memberPath, "schema"]
    },
    schema: input.schema
  });
}

// Opaque locator resolution stays with the shared projector repair. This
// helper deliberately derives no resolver, projection, or public coordinate.

export function ownerNativeOperationContractGap<
  const OperationId extends string,
  const Variant extends string,
  const Slot extends OwnerNativeOperationContractSlot
>(input: OwnerNativeOperationContractGap<
  OperationId,
  Variant,
  Slot
>): OwnerNativeOperationContractGap<OperationId, Variant, Slot> {
  return freezeNativeValue(input);
}
