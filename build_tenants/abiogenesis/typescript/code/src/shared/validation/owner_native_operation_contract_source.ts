import type * as v from "valibot";

import { freezeNativeValue } from "./immutable_native_value.js";

type NativeSchema = v.GenericSchema;

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
  Authority = unknown,
  Identity = unknown,
  ModulePath extends string = string,
  ExportName extends string = string,
  MemberPath extends readonly [...string[], "schema"] = readonly [
    ...string[],
    "schema"
  ]
> {
  readonly kind: "owner_native_operation_contract_source";
  readonly authority: Authority;
  readonly identity: Identity;
  readonly sourceLocator: OwnerNativeOperationContractSourceLocator<
    ModulePath,
    ExportName,
    MemberPath
  >;
  readonly schema: S;
}

export function ownerNativeOperationContractSource<
  const S extends NativeSchema,
  const Authority,
  const Identity,
  const ModulePath extends string,
  const ExportName extends string,
  const MemberPath extends readonly [...string[], "schema"]
>(input: OwnerNativeOperationContractSource<
  S,
  Authority,
  Identity,
  ModulePath,
  ExportName,
  MemberPath
>): OwnerNativeOperationContractSource<
  S,
  Authority,
  Identity,
  ModulePath,
  ExportName,
  MemberPath
> {
  return freezeNativeValue(input);
}
