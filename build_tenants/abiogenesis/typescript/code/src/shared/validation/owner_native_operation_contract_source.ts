import type * as v from "valibot";

import { freezeNativeValue } from "./immutable_native_value.js";
import { isPlainObject } from "./primitives.js";
import type { OwnerNativeNamedCheckCoordinate } from "./canonical_native_schema_projector.js";

type NativeSchema = v.GenericSchema;
type Sha256Digest = `sha256:${string}`;

export type OwnerNativeOperationContractSlot =
  | "request"
  | "result"
  | "refusal"
  | "nonterminal";

export interface OwnerNativeVariantDefinitionKey<
  OperationId extends string = string,
  Variant extends string = string
> {
  readonly operationId: OperationId;
  readonly memberKind: "variant";
  readonly variant: Variant;
}

export interface OwnerNativeProjectReadCaseDefinitionKey<
  CaseKey extends string = string
> {
  readonly operationId: "abg.operation.project.read";
  readonly memberKind: "project_read_case";
  readonly caseKey: CaseKey;
}

export type OwnerNativeDefinitionKey =
  | OwnerNativeVariantDefinitionKey
  | OwnerNativeProjectReadCaseDefinitionKey;

export type NonProjectReadOperationId<OperationId extends string> =
  string extends OperationId
    ? OperationId
    : OperationId extends "abg.operation.project.read"
      ? never
      : OperationId;

type AdmittedOwnerNativeDefinitionKey<K extends OwnerNativeDefinitionKey> =
  K extends OwnerNativeVariantDefinitionKey<infer OperationId, infer Variant>
    ? OwnerNativeVariantDefinitionKey<
        NonProjectReadOperationId<OperationId>,
        Variant
      >
    : K;

export interface OwnerNativeAuthorityBasis {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface OwnerProjectionRelationInput<
  K,
  Request,
  Projection
> {
  readonly definitionKey: K;
  readonly admittedRequest: Request;
  readonly candidateProjection: Projection;
}

export type OwnerProjectionRelationResult =
  | { readonly kind: "projection_related" }
  | {
      readonly kind: "projection_relation_mismatch";
      readonly issuePaths: readonly [string, ...string[]];
    };

export type OwnerProjectionRelationAction<K, Request, Projection> = (
  input: OwnerProjectionRelationInput<K, Request, Projection>
) => OwnerProjectionRelationResult;

export interface OwnerProjectionRelationSource<
  K = unknown,
  Request = unknown,
  Projection = unknown,
  ModulePath extends string = string,
  ExportName extends string = string,
  MemberPath extends readonly [...string[], "relation"] = readonly [
    ...string[],
    "relation"
  ]
> {
  readonly kind: "owner_projection_relation_source";
  readonly relationIdentity: string;
  readonly definitionKey: K;
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
  readonly sourceLocator: {
    readonly kind: "private_source_module";
    readonly sourceRoot: "semantic_build";
    readonly modulePath: ModulePath;
    readonly exportName: ExportName;
    readonly memberPath: MemberPath;
  };
  readonly relation: OwnerProjectionRelationAction<K, Request, Projection>;
}

export interface OwnerNativeSemanticOwner {
  readonly product: "abiogenesis";
  readonly module: string;
  readonly family: string;
}

export interface OwnerNativeDefinitionContractAuthority<
  Owner extends OwnerNativeSemanticOwner = OwnerNativeSemanticOwner,
  K extends OwnerNativeDefinitionKey = OwnerNativeDefinitionKey,
  Slot extends OwnerNativeOperationContractSlot = OwnerNativeOperationContractSlot
> {
  readonly kind: "owner_native_operation_contract_authority";
  readonly owner: Owner;
  readonly subject: Readonly<K & { readonly slot: Slot }>;
  readonly carrierRevision: "5.0.0";
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
}

export type OwnerNativeOperationContractAuthority<
  Owner extends OwnerNativeSemanticOwner = OwnerNativeSemanticOwner,
  OperationId extends string = string,
  Variant extends string = string,
  Slot extends OwnerNativeOperationContractSlot = OwnerNativeOperationContractSlot
> = OwnerNativeDefinitionContractAuthority<
  Owner,
  OwnerNativeVariantDefinitionKey<OperationId, Variant>,
  Slot
>;

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

export interface OwnerNativeDefinitionContractSource<
  S extends NativeSchema = NativeSchema,
  Owner extends OwnerNativeSemanticOwner = OwnerNativeSemanticOwner,
  K extends OwnerNativeDefinitionKey = OwnerNativeDefinitionKey,
  Slot extends OwnerNativeOperationContractSlot = OwnerNativeOperationContractSlot,
  ModulePath extends string = string,
  ExportName extends string = string,
  MemberPath extends readonly [...string[], "schema"] = readonly [
    ...string[],
    "schema"
  ]
> {
  readonly kind: "owner_native_operation_contract_source";
  readonly authority: OwnerNativeDefinitionContractAuthority<Owner, K, Slot>;
  readonly identity: OwnerNativeOperationContractIdentity;
  readonly sourceLocator: OwnerNativeOperationContractSourceLocator<
    ModulePath,
    ExportName,
    MemberPath
  >;
  readonly namedChecks: OwnerNativeNamedCheckCoordinate;
  readonly schema: S;
}

export type OwnerNativeOperationContractSource<
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
> = OwnerNativeDefinitionContractSource<
  S,
  Owner,
  OwnerNativeVariantDefinitionKey<OperationId, Variant>,
  Slot,
  ModulePath,
  ExportName,
  MemberPath
>;

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

type OwnerNativeDefinitionContractMemberPath<
  K extends OwnerNativeDefinitionKey,
  Slot extends OwnerNativeOperationContractSlot
> = K extends OwnerNativeProjectReadCaseDefinitionKey<infer CaseKey>
  ? readonly [...string[], CaseKey, Slot]
  : readonly [...string[], Slot];

function definitionIdentitySuffix(
  definitionKey: OwnerNativeDefinitionKey,
  slot: OwnerNativeOperationContractSlot
): string {
  const operationSuffix = definitionKey.operationId.slice(
    "abg.operation.".length
  );
  const member =
    definitionKey.memberKind === "variant"
      ? definitionKey.variant
      : definitionKey.caseKey;
  return `${operationSuffix}.${member}.${slot}`;
}

function hasExactOwnKeys(
  input: object,
  expected: readonly string[]
): boolean {
  const actual = Reflect.ownKeys(input);
  return (
    actual.length === expected.length &&
    expected.every((key) => actual.includes(key))
  );
}

export function admitOwnerNativeDefinitionKey<const K extends OwnerNativeDefinitionKey>(
  input: K
): K;
export function admitOwnerNativeDefinitionKey(
  input: unknown
): OwnerNativeDefinitionKey;
export function admitOwnerNativeDefinitionKey(
  input: unknown
): OwnerNativeDefinitionKey {
  if (!isPlainObject(input)) {
    throw new TypeError(
      "owner native contract source: definition key must be an object"
    );
  }
  const memberKind = input["memberKind"];
  if (memberKind === "variant") {
    const operationId = input["operationId"];
    const variant = input["variant"];
    if (
      !hasExactOwnKeys(input, ["operationId", "memberKind", "variant"]) ||
      typeof operationId !== "string" ||
      operationId.length === 0 ||
      typeof variant !== "string" ||
      variant.length === 0
    ) {
      throw new TypeError(
        "owner native contract source: invalid variant definition key"
      );
    }
    if (operationId === "abg.operation.project.read") {
      throw new TypeError(
        "owner native contract source: project.read requires a project_read_case key"
      );
    }
    return { operationId, memberKind, variant };
  }
  const operationId = input["operationId"];
  const caseKey = input["caseKey"];
  if (
    memberKind !== "project_read_case" ||
    !hasExactOwnKeys(input, ["operationId", "memberKind", "caseKey"]) ||
    operationId !== "abg.operation.project.read" ||
    typeof caseKey !== "string" ||
    caseKey.length === 0
  ) {
    throw new TypeError(
      "owner native contract source: invalid project_read_case definition key"
    );
  }
  return { operationId, memberKind, caseKey };
}

function assertMemberPathCorrelation(
  definitionKey: OwnerNativeDefinitionKey,
  slot: OwnerNativeOperationContractSlot,
  memberPath: readonly string[]
): void {
  if (!Array.isArray(memberPath) || memberPath.at(-1) !== slot) {
    throw new TypeError(
      "owner native contract source: locator slot does not match contract slot"
    );
  }
  if (
    definitionKey.memberKind === "project_read_case" &&
    memberPath.at(-2) !== definitionKey.caseKey
  ) {
    throw new TypeError(
      "owner native contract source: locator case does not match project-read key"
    );
  }
}

interface OwnerNativeDefinitionContractSourceInput<
  S extends NativeSchema,
  Owner extends OwnerNativeSemanticOwner,
  K extends OwnerNativeDefinitionKey,
  Slot extends OwnerNativeOperationContractSlot,
  ModulePath extends string,
  ExportName extends string,
  MemberPath extends OwnerNativeDefinitionContractMemberPath<K, Slot>
> {
  readonly owner: Owner;
  readonly definitionKey: K;
  readonly slot: Slot;
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly memberPath: MemberPath;
  readonly namedChecks: OwnerNativeNamedCheckCoordinate;
  readonly schema: S;
}

function constructOwnerNativeDefinitionContractSource<
  const S extends NativeSchema,
  const Owner extends OwnerNativeSemanticOwner,
  const K extends OwnerNativeDefinitionKey,
  const Slot extends OwnerNativeOperationContractSlot,
  const ModulePath extends string,
  const ExportName extends string,
  const MemberPath extends OwnerNativeDefinitionContractMemberPath<K, Slot>
>(input: OwnerNativeDefinitionContractSourceInput<
  S,
  Owner,
  K,
  Slot,
  ModulePath,
  ExportName,
  MemberPath
>): OwnerNativeDefinitionContractSource<
  S,
  Owner,
  K,
  Slot,
  ModulePath,
  ExportName,
  readonly [...MemberPath, "schema"]
> {
  const definitionKey = admitOwnerNativeDefinitionKey(input.definitionKey);
  assertMemberPathCorrelation(definitionKey, input.slot, input.memberPath);
  const suffix = definitionIdentitySuffix(definitionKey, input.slot);
  return freezeNativeValue({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: input.owner,
      subject: {
        ...definitionKey,
        slot: input.slot
      },
      carrierRevision: "5.0.0",
      semanticOwnerBasis: input.semanticOwnerBasis
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
    namedChecks: input.namedChecks,
    schema: input.schema
  });
}

export function ownerNativeDefinitionContractSource<
  const S extends NativeSchema,
  const Owner extends OwnerNativeSemanticOwner,
  const K extends OwnerNativeDefinitionKey,
  const Slot extends OwnerNativeOperationContractSlot,
  const ModulePath extends string,
  const ExportName extends string,
  const MemberPath extends OwnerNativeDefinitionContractMemberPath<K, Slot>
>(input: OwnerNativeDefinitionContractSourceInput<
  S,
  Owner,
  K,
  Slot,
  ModulePath,
  ExportName,
  MemberPath
> & {
  readonly definitionKey: AdmittedOwnerNativeDefinitionKey<K>;
}): OwnerNativeDefinitionContractSource<
  S,
  Owner,
  K,
  Slot,
  ModulePath,
  ExportName,
  readonly [...MemberPath, "schema"]
> {
  return constructOwnerNativeDefinitionContractSource(input);
}

export function ownerNativeOperationContractSource<
  const S extends NativeSchema,
  const Owner extends OwnerNativeSemanticOwner,
  const OperationId extends string,
  const Variant extends string,
  const Slot extends OwnerNativeOperationContractSlot,
  const ModulePath extends string,
  const ExportName extends string,
  const MemberPath extends readonly [...string[], Slot]
>(input: {
  readonly owner: Owner;
  readonly operationId: NonProjectReadOperationId<OperationId>;
  readonly variant: Variant;
  readonly slot: Slot;
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly memberPath: MemberPath;
  readonly namedChecks: OwnerNativeNamedCheckCoordinate;
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
  const {
    operationId,
    variant,
    ...sourceInput
  } = input;
  return constructOwnerNativeDefinitionContractSource({
    ...sourceInput,
    definitionKey: {
      operationId,
      memberKind: "variant",
      variant
    }
  });
}

export function ownerProjectionRelationSource<
  const K,
  Request,
  Projection,
  const ModulePath extends string,
  const ExportName extends string,
  const MemberPath extends readonly string[]
>(input: {
  readonly relationIdentity: string;
  readonly definitionKey: K;
  readonly semanticOwnerBasis: OwnerNativeAuthorityBasis;
  readonly modulePath: ModulePath;
  readonly exportName: ExportName;
  readonly memberPath: MemberPath;
  readonly relation: OwnerProjectionRelationAction<K, Request, Projection>;
}): OwnerProjectionRelationSource<
  K,
  Request,
  Projection,
  ModulePath,
  ExportName,
  readonly [...MemberPath, "relation"]
> {
  if (
    typeof input.relationIdentity !== "string" ||
    input.relationIdentity.length === 0 ||
    /[\u0000-\u0020\u007f]/u.test(input.relationIdentity)
  ) {
    throw new TypeError("owner projection relation: invalid relation identity");
  }
  if (typeof input.relation !== "function") {
    throw new TypeError("owner projection relation: relation must be callable");
  }
  return freezeNativeValue({
    kind: "owner_projection_relation_source" as const,
    relationIdentity: input.relationIdentity,
    definitionKey: input.definitionKey,
    semanticOwnerBasis: input.semanticOwnerBasis,
    sourceLocator: {
      kind: "private_source_module" as const,
      sourceRoot: "semantic_build" as const,
      modulePath: input.modulePath,
      exportName: input.exportName,
      memberPath: [...input.memberPath, "relation"] as const
    },
    relation: input.relation
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
