import * as v from "valibot";

import { WORKSPACE_NATIVE_CONTRACT_SOURCES } from "../../code/src/app/m04/workspace/operation_contracts.js";
import type { NativeContractDefinition } from "../../code/src/app/m04/public_contracts/native_contract_phase_a.js";

type CleanKey = {
  readonly operationId: "abg.operation.workspace.create";
  readonly memberKind: "variant";
  readonly variant: "clean";
};

type ImportedKey = {
  readonly operationId: "abg.operation.workspace.create";
  readonly memberKind: "variant";
  readonly variant: "imported";
};

type DefinitionKey = CleanKey | ImportedKey;

type OwnerSchemaRowOf<K extends DefinitionKey> =
  K extends CleanKey
    ? {
        readonly request: typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request.schema;
        readonly result: typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.result.schema;
        readonly refusal: typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.refusal.schema;
        readonly nonterminal: null;
      }
    : K extends ImportedKey
      ? {
          readonly request: typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported.request.schema;
          readonly result: typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported.result.schema;
          readonly refusal: typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported.refusal.schema;
          readonly nonterminal: null;
        }
      : never;

type RequestSchemaOf<K extends DefinitionKey> = OwnerSchemaRowOf<K>["request"];
type ResultSchemaOf<K extends DefinitionKey> = OwnerSchemaRowOf<K>["result"];
type RefusalSchemaOf<K extends DefinitionKey> = OwnerSchemaRowOf<K>["refusal"];
type NonterminalSchemaOf<K extends DefinitionKey> =
  OwnerSchemaRowOf<K>["nonterminal"];

type RequestOf<K extends DefinitionKey> = v.InferOutput<RequestSchemaOf<K>>;
type ResultOf<K extends DefinitionKey> = v.InferOutput<ResultSchemaOf<K>>;
type RefusalOf<K extends DefinitionKey> = v.InferOutput<RefusalSchemaOf<K>>;
type NonterminalOf<K extends DefinitionKey> =
  NonterminalSchemaOf<K> extends infer S extends v.GenericSchema
    ? v.InferOutput<S>
    : never;

type P1AcceptedContractShapeBasis = {
  readonly ref: "design://abg/m04/public-operation-definition-family";
  readonly digest: `sha256:${string}`;
  readonly status: "accepted_design_pin";
};

type OwnerNativeContractBinding<S extends v.GenericSchema> = {
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: `sha256:${string}`;
  readonly contractShapeBasisRef: P1AcceptedContractShapeBasis["ref"];
  readonly contractShapeBasisDigest: P1AcceptedContractShapeBasis["digest"];
  readonly contract: NativeContractDefinition<S>;
};

type P1ContractSlot = "request" | "result" | "refusal" | "nonterminal";

type P1ContractSlotCoordinate<
  K extends DefinitionKey,
  Slot extends P1ContractSlot
> = {
  readonly definitionKey: K;
  readonly slot: Slot;
};

type P1ResolvedContractSlot<
  K extends DefinitionKey,
  Slot extends P1ContractSlot,
  S extends v.GenericSchema
> = {
  readonly kind: "owner_contract_slot_resolved";
  readonly coordinate: P1ContractSlotCoordinate<K, Slot>;
} & OwnerNativeContractBinding<S>;

type P1ResolvedOwnerContract<K extends DefinitionKey> = {
  readonly kind: "owner_contract_resolved";
  readonly definitionKey: K;
  readonly request: P1ResolvedContractSlot<K, "request", RequestSchemaOf<K>>;
  readonly result: P1ResolvedContractSlot<K, "result", ResultSchemaOf<K>>;
  readonly refusal: P1ResolvedContractSlot<K, "refusal", RefusalSchemaOf<K>>;
  readonly nonterminal:
    NonterminalSchemaOf<K> extends infer S extends v.GenericSchema
      ? P1ResolvedContractSlot<K, "nonterminal", S>
      : {
          readonly kind: "nonterminal_not_declared";
          readonly coordinate: P1ContractSlotCoordinate<K, "nonterminal">;
        };
};

type P1ResolvedOwnerContractRow<
  K extends DefinitionKey = DefinitionKey
> = K extends DefinitionKey ? P1ResolvedOwnerContract<K> : never;

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

const cleanKey = {
  operationId: "abg.operation.workspace.create",
  memberKind: "variant",
  variant: "clean"
} as const satisfies CleanKey;

declare const acceptedContractShapeBasis: P1AcceptedContractShapeBasis;
declare const cleanRequestContract: NativeContractDefinition<
  RequestSchemaOf<CleanKey>
>;
declare const cleanResultContract: NativeContractDefinition<
  ResultSchemaOf<CleanKey>
>;
declare const cleanRefusalContract: NativeContractDefinition<
  RefusalSchemaOf<CleanKey>
>;

const cleanOwnerAuthority = {
  ref: WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request.authority
    .semanticOwnerBasis.ref,
  digest:
    WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request.authority
      .semanticOwnerBasis.digest
} as const;

export const cleanResolution = {
  kind: "owner_contract_resolved",
  definitionKey: cleanKey,
  request: {
    kind: "owner_contract_slot_resolved",
    coordinate: { definitionKey: cleanKey, slot: "request" },
    ownerAuthorityRef: cleanOwnerAuthority.ref,
    ownerAuthorityDigest: cleanOwnerAuthority.digest,
    contractShapeBasisRef: acceptedContractShapeBasis.ref,
    contractShapeBasisDigest: acceptedContractShapeBasis.digest,
    contract: cleanRequestContract
  },
  result: {
    kind: "owner_contract_slot_resolved",
    coordinate: { definitionKey: cleanKey, slot: "result" },
    ownerAuthorityRef: cleanOwnerAuthority.ref,
    ownerAuthorityDigest: cleanOwnerAuthority.digest,
    contractShapeBasisRef: acceptedContractShapeBasis.ref,
    contractShapeBasisDigest: acceptedContractShapeBasis.digest,
    contract: cleanResultContract
  },
  refusal: {
    kind: "owner_contract_slot_resolved",
    coordinate: { definitionKey: cleanKey, slot: "refusal" },
    ownerAuthorityRef: cleanOwnerAuthority.ref,
    ownerAuthorityDigest: cleanOwnerAuthority.digest,
    contractShapeBasisRef: acceptedContractShapeBasis.ref,
    contractShapeBasisDigest: acceptedContractShapeBasis.digest,
    contract: cleanRefusalContract
  },
  nonterminal: {
    kind: "nonterminal_not_declared",
    coordinate: { definitionKey: cleanKey, slot: "nonterminal" }
  }
} as const satisfies P1ResolvedOwnerContract<CleanKey>;

const sameKeyPermutedRequest: P1ResolvedContractSlot<
  CleanKey,
  "request",
  RequestSchemaOf<CleanKey>
> = {
  kind: "owner_contract_slot_resolved",
  coordinate: {
    definitionKey: cleanKey,
    // @ts-expect-error A result slot cannot occupy this same-key request coordinate.
    slot: "result"
  },
  ownerAuthorityRef: cleanOwnerAuthority.ref,
  ownerAuthorityDigest: cleanOwnerAuthority.digest,
  contractShapeBasisRef: acceptedContractShapeBasis.ref,
  contractShapeBasisDigest: acceptedContractShapeBasis.digest,
  contract: cleanRequestContract
};
void sameKeyPermutedRequest;

const sameKeyFieldPermutation: P1ResolvedOwnerContract<CleanKey> = {
  ...cleanResolution,
  // @ts-expect-error The same-key result slot and schema cannot occupy request.
  request: cleanResolution.result
};
void sameKeyFieldPermutation;

export type ValueCannotBecomeNativeDefinition = NativeContractDefinition<
  // @ts-expect-error An inferred request value is not its Valibot request schema.
  RequestOf<CleanKey>
>;

export type ValueCannotBindAsSchema = OwnerNativeContractBinding<
  // @ts-expect-error Schema-bound bindings cannot be instantiated with payload values.
  RequestOf<CleanKey>
>;

type NeutralCleanRequestAuthority =
  typeof WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request.authority;
type CleanDistributedRow = Extract<
  P1ResolvedOwnerContractRow,
  { readonly definitionKey: CleanKey }
>;

export type P1DefinitionFamilyDesignTypeProof =
  | Expect<RequestSchemaOf<CleanKey> extends v.GenericSchema ? true : false>
  | Expect<Equal<RequestOf<CleanKey>["createPolicy"], "clean">>
  | Expect<ResultSchemaOf<CleanKey> extends v.GenericSchema ? true : false>
  | Expect<ResultOf<CleanKey> extends object ? true : false>
  | Expect<RefusalSchemaOf<CleanKey> extends v.GenericSchema ? true : false>
  | Expect<RefusalOf<CleanKey> extends object ? true : false>
  | Expect<Equal<NonterminalSchemaOf<CleanKey>, null>>
  | Expect<Equal<NonterminalOf<CleanKey>, never>>
  | Expect<
      Equal<
        "contractShapeBasis" extends keyof NeutralCleanRequestAuthority
          ? true
          : false,
        false
      >
    >
  | Expect<Equal<CleanDistributedRow, P1ResolvedOwnerContract<CleanKey>>>
  | Expect<Equal<typeof cleanResolution.request.coordinate.slot, "request">>;
