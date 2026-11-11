import { isRecord } from "../../shared/admission_predicates.js";
import { ABG_PROJECT_READ_CONTRACTS } from "../../abg/project_read_operation_contracts.js";
import { WITNESS_OPERATION_CONTRACTS } from "../../abg/witness_operation_contracts.js";
import { CATALOG_OPERATION_CONTRACTS } from "../../product/catalog_operation_contracts.js";
import { PRODUCT_ENVIRONMENT_CONTRACTS } from "../../product/environment_operation_contracts.js";
import { PRODUCT_INSTALL_CONTRACTS } from "../../product/install_operation_contracts.js";
import {
  INTERACTION_OPERATION_CONTRACTS,
  RESULT_OPERATION_CONTRACTS,
} from "../../product/interaction_operation_contracts.js";
import {
  MATERIALIZATION_OPERATION_CONTRACTS,
} from "../../product/materialization_operation_contracts.js";
import { RELEASE_OPERATION_CONTRACTS } from "../../product/release_snapshot_operations.js";
import { PRODUCT_PROJECT_READ_CONTRACTS } from "../../product/project_read_operation_contracts.js";
import { RUN_OPERATION_CONTRACTS } from "../../product/run_operation_contracts.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "../../product/verification_operation_contracts.js";
import { WORKSPACE_OPERATION_CONTRACTS } from "../../product/workspace_operation_contracts.js";
import { CONFORMANCE_OPERATION_CONTRACTS } from "../../validator/conformance_operation_contracts.js";
import { compareUnicodeCodeUnits } from "../../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../../shared/digests.js";
import { deepFreeze } from "../../shared/immutable.js";
import {
  type OwnerContractSourceDeclaration,
  type OwnerDefinitionMetadata,
  type OwnerRequestOf,
  projectStrictJsonSchema,
  type RuntimeContractSchema,
} from "../../shared/public_function_contracts.js";
import type { PublicDefinitionKeyLike } from "../../shared/public_invocation.js";
import type * as Effect from "effect/Effect";
import type * as AbgOwnerModule from "../../abg/index.js";
import type * as ProductOwnerModule from "../../product/index.js";
import type * as ValidatorOwnerModule from "../../validator/index.js";

export const EXACT_OWNER_CONTRACT_KEY_SET_DIGEST =
  "sha256:08ae1818dcb4c32c4869193881cb995e12c720ad9f94457c338b383bb80e0707" as const;

const OWNER_BINDING_PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const SELECTED_DEFINITION_FRAME =
  "build_tenants/abiogenesis/typescript/design/" +
  "M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md#42-definition-shape";

export type IntrinsicOwnerContractSlot =
  | "request"
  | "result"
  | "refusal"
  | "non_terminal";

export type DefinitionExecutionBindingKind =
  | "direct_owner_primitive"
  | "statically_composed_callable"
  | "owner_projection";

export type ExactOwnerMemberCoordinate = {
  readonly abstractModule: string;
  readonly exportName: string;
  readonly memberPath: readonly string[];
  readonly sourceModuleDigest: Sha256Digest;
  readonly memberDigest: Sha256Digest;
};

export type OwnerNativeSchemaIdentity = {
  readonly schemaRef: string;
  readonly schemaVersion: "5.0.0";
  readonly ownerMember: ExactOwnerMemberCoordinate;
};

export type ExactOwnerContractReference = {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly slot: IntrinsicOwnerContractSlot;
  readonly contractId: string;
  readonly contractVersion: "5.0.0";
  readonly source: ExactOwnerMemberCoordinate;
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly nativeSchemaIdentity: OwnerNativeSchemaIdentity;
};

export interface ExactOwnerMetadataReference {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly source: ExactOwnerMemberCoordinate;
  readonly metadataDigest: Sha256Digest;
}

export type ExactOwnerCallableCoordinate = {
  readonly packageName: typeof OWNER_BINDING_PACKAGE_NAME;
  readonly packageExportPath: string;
  readonly namedExport: string;
  readonly memberPath: readonly string[];
  readonly ownerAuthorityRef: string;
  readonly callableContractDigest: Sha256Digest;
};

export type ExecutionBindingSpecification = {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly kind: DefinitionExecutionBindingKind;
  readonly callable: ExactOwnerCallableCoordinate;
  readonly semanticOwnerRef: string;
  readonly selectedFrameRef: string;
};

/** The accepted exact source-map packet. It is declarative and never callable. */
export interface OwnerContractPacket {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly requestContract: ExactOwnerContractReference;
  readonly resultContract: ExactOwnerContractReference;
  readonly refusalContract: ExactOwnerContractReference;
  readonly nonTerminalContract: ExactOwnerContractReference | null;
  readonly metadata: ExactOwnerMetadataReference;
  readonly executionBindingSpecification: ExecutionBindingSpecification;
  readonly executionBindingSpecificationDigest: Sha256Digest;
}

export interface ResolvedOwnerContractBinding
  extends ExactOwnerContractReference {
  readonly schema: RuntimeContractSchema;
}

export interface OwnerContractModuleSource {
  readonly sourceModulePath: string;
  readonly packageExportPath: "./product" | "./abg" | "./validator";
  readonly definitionBindingExportName: string;
  readonly definitionBindingKind: DefinitionExecutionBindingKind;
  readonly contractRoot: Readonly<Record<string, unknown>>;
}

// This is the one build-time source relation. It names owner modules and their
// eventual concrete binding exports, never operation keys or runtime handlers.
export const OWNER_CONTRACT_MODULE_SOURCES = Object.freeze([
  Object.freeze({
    sourceModulePath: "product/workspace_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "WORKSPACE_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: WORKSPACE_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/project_read_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "PRODUCT_PROJECT_READ_DEFINITION_BINDINGS",
    definitionBindingKind: "owner_projection",
    contractRoot: PRODUCT_PROJECT_READ_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "abg/project_read_operation_contracts.ts",
    packageExportPath: "./abg",
    definitionBindingExportName: "ABG_PROJECT_READ_DEFINITION_BINDINGS",
    definitionBindingKind: "owner_projection",
    contractRoot: ABG_PROJECT_READ_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/verification_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "PRODUCT_VERIFICATION_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: PRODUCT_VERIFICATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/environment_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: PRODUCT_ENVIRONMENT_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/install_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "PRODUCT_INSTALL_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: PRODUCT_INSTALL_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/catalog_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "CATALOG_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: CATALOG_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/run_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "RUN_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: RUN_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/interaction_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "INTERACTION_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: INTERACTION_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/interaction_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "RESULT_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: RESULT_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "abg/witness_operation_contracts.ts",
    packageExportPath: "./abg",
    definitionBindingExportName: "WITNESS_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: WITNESS_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "validator/conformance_operation_contracts.ts",
    packageExportPath: "./validator",
    definitionBindingExportName: "CONFORMANCE_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: CONFORMANCE_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/materialization_operation_contracts.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "MATERIALIZATION_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: MATERIALIZATION_OPERATION_CONTRACTS,
  }),
  Object.freeze({
    sourceModulePath: "product/release_snapshot_operations.ts",
    packageExportPath: "./product",
    definitionBindingExportName: "RELEASE_SNAPSHOT_DEFINITION_BINDINGS",
    definitionBindingKind: "statically_composed_callable",
    contractRoot: RELEASE_OPERATION_CONTRACTS,
  }),
] as const satisfies readonly OwnerContractModuleSource[]);

// The native type family is a type projection of the same source relation:
// each row's contract root supplies the declared packets, and the row's actual
// package-export binding supplies the callable resource and receipt types at
// the same member path. No operation, request or resource roster is restated.
interface InstalledOwnerModuleTypes {
  readonly "./product": typeof ProductOwnerModule;
  readonly "./abg": typeof AbgOwnerModule;
  readonly "./validator": typeof ValidatorOwnerModule;
}

type OwnerContractModuleSourceRow =
  (typeof OWNER_CONTRACT_MODULE_SOURCES)[number];

/** Every declaration leaf of one contract root, with its member path. */
type OwnerContractLeaf<TRoot, TPath extends readonly string[] = readonly []> =
  TRoot extends OwnerContractSourceDeclaration
    ? readonly [TPath, TRoot]
    : TRoot extends object
    ? {
      readonly [K in keyof TRoot & string]: OwnerContractLeaf<
        TRoot[K],
        readonly [...TPath, K]
      >;
    }[keyof TRoot & string]
    : never;

type ExportMemberAt<TValue, TPath extends readonly string[]> = TPath extends
  readonly [infer THead extends string, ...infer TRest extends readonly string[]]
  ? TValue extends object
    ? THead extends keyof TValue ? ExportMemberAt<TValue[THead], TRest> : undefined
    : undefined
  : TValue;

type BindingExportOf<TRow extends OwnerContractModuleSourceRow> =
  TRow["definitionBindingExportName"] extends
    keyof InstalledOwnerModuleTypes[TRow["packageExportPath"]]
    ? InstalledOwnerModuleTypes[TRow["packageExportPath"]][
      TRow["definitionBindingExportName"]
    ]
    : undefined;

/** One actual installed callable: its resource assertion and resource receipt. */
export interface OwnerCallableDefinitionBinding<TResources, TResourceReceipt> {
  readonly kind: "callable";
  readonly resources: TResources;
  readonly resourceReceipt: TResourceReceipt;
}

/** A declared member without an installed callable; transport refuses it. */
export interface OwnerUnavailableDefinitionBinding {
  readonly kind: "installed_binding_unavailable";
}

// An absent leaf is unavailable. A present leaf that is not an exact callable
// for its own packet key is `never`, so the member disappears and the finite
// family proof fails instead of reclassifying the binding.
type OwnerDefinitionBindingOf<
  TCallable,
  TPacket extends OwnerContractSourceDeclaration,
> = [TCallable] extends [undefined] ? OwnerUnavailableDefinitionBinding
  : [TCallable] extends [
    (call: infer TCall) => Effect.Effect<infer TReturn, infer _TFault, never>,
  ]
    ? [TCall, TReturn] extends [
      Readonly<{
        invocation: Readonly<{ definitionKey: infer TKey }>;
        resources: infer TResources;
      }>,
      Readonly<{ resources: infer TResourceReceipt }>,
    ]
      ? [TKey] extends [TPacket["definitionKey"]]
        ? [TPacket["definitionKey"]] extends [TKey]
          ? OwnerCallableDefinitionBinding<TResources, TResourceReceipt>
        : never
      : never
    : never
  : never;

type OwnerDefinitionMembersOf<TRow extends OwnerContractModuleSourceRow> =
  OwnerContractLeaf<TRow["contractRoot"]> extends infer TLeaf
    ? TLeaf extends readonly [
      infer TPath extends readonly string[],
      infer TPacket extends OwnerContractSourceDeclaration,
    ] ? OwnerDefinitionBindingOf<
        ExportMemberAt<BindingExportOf<TRow>, TPath>,
        TPacket
      > extends infer TBinding
      ? [TBinding] extends [never] ? never
      : {
        readonly definitionKey: TPacket["definitionKey"];
        readonly memberPath: TPath;
        readonly packageExportPath: TRow["packageExportPath"];
        readonly definitionBindingExportName:
          TRow["definitionBindingExportName"];
        readonly packet: TPacket;
        readonly binding: TBinding;
      }
      : never
    : never
    : never;

/** The fifty-six declared packet members with their binding leaves. */
export type OwnerDefinitionMember = OwnerContractModuleSourceRow extends
  infer TRow ? TRow extends OwnerContractModuleSourceRow
    ? OwnerDefinitionMembersOf<TRow>
  : never
  : never;

export type OwnerCallableDefinitionMember = Extract<
  OwnerDefinitionMember,
  Readonly<{ binding: Readonly<{ kind: "callable" }> }>
>;

export type OwnerUnavailableDefinitionMember = Extract<
  OwnerDefinitionMember,
  Readonly<{ binding: OwnerUnavailableDefinitionBinding }>
>;

export type OwnerDefinitionKey = OwnerDefinitionMember["definitionKey"];

export type OwnerDefinitionCompositeKey<
  TMember extends OwnerDefinitionMember = OwnerDefinitionMember,
> = TMember extends unknown
  ? `${TMember["definitionKey"]["operationId"]}#${TMember["definitionKey"]["memberKey"]}`
  : never;

/** The declared member one literal key selects; a widened key selects none. */
export type OwnerDefinitionMemberOf<K extends PublicDefinitionKeyLike> =
  string extends K["operationId"] ? never
    : string extends K["memberKey"] ? never
    : Extract<
      OwnerDefinitionMember,
      Readonly<{
        definitionKey: Readonly<{
          operationId: K["operationId"];
          memberKey: K["memberKey"];
        }>;
      }>
    >;

type RequestVariantKeys<TRequest> = TRequest extends unknown ? keyof TRequest
  : never;

/** The owner request alias. Strict-object variants of one request union carry
 * no field of a sibling variant, as their runtime schemas already require. */
export type OwnerDefinitionRequestOf<TMember extends OwnerDefinitionMember> =
  OwnerRequestOf<TMember["packet"]> extends infer TRequest
    ? [RequestVariantKeys<TRequest>] extends [keyof TRequest] ? TRequest
    : TRequest extends unknown ? TRequest & {
        readonly [K in Exclude<RequestVariantKeys<OwnerRequestOf<TMember["packet"]>>, keyof TRequest>]?: never;
      }
    : never
    : never;

export interface ResolvedOwnerContractSource {
  readonly sourceModulePath: string;
  readonly sourceModuleDigest: Sha256Digest;
  readonly memberDigest: Sha256Digest;
  readonly declaration: OwnerContractSourceDeclaration;
  readonly packet: OwnerContractPacket;
  readonly contracts: Readonly<{
    readonly request: ResolvedOwnerContractBinding;
    readonly result: ResolvedOwnerContractBinding;
    readonly refusal: ResolvedOwnerContractBinding;
    readonly nonTerminal: ResolvedOwnerContractBinding | null;
  }>;
  readonly metadata: OwnerDefinitionMetadata;
}

interface UnresolvedOwnerContractSource {
  readonly moduleSource: OwnerContractModuleSource;
  readonly declaration: OwnerContractSourceDeclaration;
  readonly memberDigest: Sha256Digest;
  readonly schemaDigests: Readonly<{
    readonly request: Sha256Digest;
    readonly result: Sha256Digest;
    readonly refusal: Sha256Digest;
    readonly nonTerminal: Sha256Digest | null;
  }>;
}

function isOwnerContractSourceDeclaration(
  value: unknown,
): value is OwnerContractSourceDeclaration {
  return isRecord(value) &&
    isRecord(value.definitionKey) &&
    typeof value.definitionKey.operationId === "string" &&
    typeof value.definitionKey.memberKey === "string" &&
    "requestSchema" in value &&
    "resultSchema" in value &&
    "refusalSchema" in value &&
    "nonTerminalSchema" in value &&
    isRecord(value.owner) &&
    isRecord(value.metadata);
}

function collectDeclarations(
  value: unknown,
): readonly OwnerContractSourceDeclaration[] {
  if (isOwnerContractSourceDeclaration(value)) return Object.freeze([value]);
  if (!isRecord(value)) return Object.freeze([]);
  return Object.freeze(Object.values(value).flatMap(collectDeclarations));
}

function schemaFor(
  declaration: OwnerContractSourceDeclaration,
  slot: IntrinsicOwnerContractSlot,
): RuntimeContractSchema | null {
  switch (slot) {
    case "request":
      return declaration.requestSchema;
    case "result":
      return declaration.resultSchema;
    case "refusal":
      return declaration.refusalSchema;
    case "non_terminal":
      return declaration.nonTerminalSchema;
  }
}

function schemaDigest(
  declaration: OwnerContractSourceDeclaration,
  slot: IntrinsicOwnerContractSlot,
): Sha256Digest | null {
  const schema = schemaFor(declaration, slot);
  if (schema === null) return null;
  return sha256Canonical({
    schemaVersion: "5.0.0",
    definitionKey: declaration.definitionKey,
    slot,
    ownerAuthorityRef: declaration.owner.authorityRef,
    ownerAuthorityDigest: declaration.owner.authorityDigest,
    schema: projectStrictJsonSchema(schema),
  });
}

function unresolvedSource(
  moduleSource: OwnerContractModuleSource,
  declaration: OwnerContractSourceDeclaration,
): UnresolvedOwnerContractSource {
  const schemaDigests = Object.freeze({
    request: schemaDigest(declaration, "request")!,
    result: schemaDigest(declaration, "result")!,
    refusal: schemaDigest(declaration, "refusal")!,
    nonTerminal: schemaDigest(declaration, "non_terminal"),
  });
  const memberDigest = sha256Canonical({
    definitionKey: declaration.definitionKey,
    contractIds: declaration.contractIds,
    owner: declaration.owner,
    metadata: declaration.metadata,
    nativeSchemaDigests: schemaDigests,
  });
  return Object.freeze({
    moduleSource,
    declaration,
    memberDigest,
    schemaDigests,
  });
}

const unresolvedSources = OWNER_CONTRACT_MODULE_SOURCES.flatMap(
  (moduleSource) =>
    collectDeclarations(moduleSource.contractRoot).map((declaration) =>
      unresolvedSource(moduleSource, declaration)
    ),
);

const moduleDigestByAbstractModule = new Map<string, Sha256Digest>();
for (const abstractModule of [...new Set(
  unresolvedSources.map(({ declaration }) => declaration.owner.abstractModule),
)].sort(compareUnicodeCodeUnits)) {
  const members = unresolvedSources
    .filter(({ declaration }) =>
      declaration.owner.abstractModule === abstractModule
    )
    .map(({ declaration, memberDigest }) => ({
      definitionKey: declaration.definitionKey,
      memberDigest,
    }))
    .sort((left, right) => {
      const operation = compareUnicodeCodeUnits(
        left.definitionKey.operationId,
        right.definitionKey.operationId,
      );
      return operation !== 0
        ? operation
        : compareUnicodeCodeUnits(
          left.definitionKey.memberKey,
          right.definitionKey.memberKey,
        );
    });
  moduleDigestByAbstractModule.set(abstractModule, sha256Canonical({
    abstractModule,
    members,
  }));
}

function contractIdFor(
  declaration: OwnerContractSourceDeclaration,
  slot: IntrinsicOwnerContractSlot,
): string | null {
  return slot === "non_terminal"
    ? declaration.contractIds.nonTerminal
    : declaration.contractIds[slot];
}

function resolveSource(
  source: UnresolvedOwnerContractSource,
): ResolvedOwnerContractSource {
  const { declaration, moduleSource, memberDigest, schemaDigests } = source;
  const sourceModuleDigest = moduleDigestByAbstractModule.get(
    declaration.owner.abstractModule,
  )!;
  const ownerMember = deepFreeze({
    abstractModule: declaration.owner.abstractModule,
    exportName: declaration.owner.exportName,
    memberPath: Object.freeze([...declaration.owner.memberPath]),
    sourceModuleDigest,
    memberDigest,
  });
  const contract = (
    slot: IntrinsicOwnerContractSlot,
  ): ResolvedOwnerContractBinding | null => {
    const contractId = contractIdFor(declaration, slot);
    const schema = schemaFor(declaration, slot);
    const digest = slot === "non_terminal"
      ? schemaDigests.nonTerminal
      : schemaDigests[slot];
    if (contractId === null || schema === null || digest === null) return null;
    return deepFreeze({
      definitionKey: declaration.definitionKey,
      slot,
      contractId,
      contractVersion: "5.0.0" as const,
      source: ownerMember,
      ownerAuthorityRef: declaration.owner.authorityRef,
      ownerAuthorityDigest: declaration.owner.authorityDigest,
      schema: deepFreeze(schema),
      nativeSchemaIdentity: deepFreeze({
        schemaRef:
          `native-schema://abiogenesis/${digest.slice("sha256:".length)}`,
        schemaVersion: "5.0.0" as const,
        ownerMember,
      }),
    });
  };
  const contracts = deepFreeze({
    request: contract("request")!,
    result: contract("result")!,
    refusal: contract("refusal")!,
    nonTerminal: contract("non_terminal"),
  });
  const metadata = deepFreeze({
    ...declaration.metadata,
    ownerAuthorityRef: declaration.owner.authorityRef,
    ownerAuthorityDigest: declaration.owner.authorityDigest,
  });
  const metadataDigest = sha256Canonical({
    definitionKey: declaration.definitionKey,
    metadata,
  });
  const callableContractDigest = sha256Canonical({
    kind: "exact_definition_host_callable",
    schemaVersion: "5.0.0",
    definitionKey: declaration.definitionKey,
    requestSchemaRef: contracts.request.nativeSchemaIdentity.schemaRef,
    resultSchemaRef: contracts.result.nativeSchemaIdentity.schemaRef,
    refusalSchemaRef: contracts.refusal.nativeSchemaIdentity.schemaRef,
    nonTerminalSchemaRef:
      contracts.nonTerminal?.nativeSchemaIdentity.schemaRef ?? null,
    resourceRelation: "owner_indexed_sibling_assertion_and_receipt",
  });
  const executionBindingSpecification: ExecutionBindingSpecification = deepFreeze({
    definitionKey: declaration.definitionKey,
    kind: moduleSource.definitionBindingKind,
    callable: deepFreeze({
      packageName: OWNER_BINDING_PACKAGE_NAME,
      packageExportPath: moduleSource.packageExportPath,
      namedExport: moduleSource.definitionBindingExportName,
      memberPath: Object.freeze([...declaration.owner.memberPath]),
      ownerAuthorityRef: declaration.owner.authorityRef,
      callableContractDigest,
    }),
    semanticOwnerRef: declaration.owner.authorityRef,
    selectedFrameRef: SELECTED_DEFINITION_FRAME,
  });
  const executionBindingSpecificationDigest = sha256Canonical(
    executionBindingSpecification,
  );
  const reference = (
    binding: ResolvedOwnerContractBinding | null,
  ): ExactOwnerContractReference | null => binding === null
    ? null
    : deepFreeze({
      definitionKey: binding.definitionKey,
      slot: binding.slot,
      contractId: binding.contractId,
      contractVersion: binding.contractVersion,
      source: binding.source,
      ownerAuthorityRef: binding.ownerAuthorityRef,
      ownerAuthorityDigest: binding.ownerAuthorityDigest,
      nativeSchemaIdentity: binding.nativeSchemaIdentity,
    });
  const packet = deepFreeze({
    definitionKey: declaration.definitionKey,
    requestContract: reference(contracts.request)!,
    resultContract: reference(contracts.result)!,
    refusalContract: reference(contracts.refusal)!,
    nonTerminalContract: reference(contracts.nonTerminal),
    metadata: deepFreeze({
      definitionKey: declaration.definitionKey,
      source: ownerMember,
      metadataDigest,
    }),
    executionBindingSpecification,
    executionBindingSpecificationDigest,
  });
  return Object.freeze({
    sourceModulePath: moduleSource.sourceModulePath,
    sourceModuleDigest,
    memberDigest,
    declaration,
    packet,
    contracts,
    metadata,
  });
}

export const OWNER_CONTRACT_SOURCES = Object.freeze(
  unresolvedSources.map(resolveSource).sort((left, right) => {
    const operation = compareUnicodeCodeUnits(
      left.packet.definitionKey.operationId,
      right.packet.definitionKey.operationId,
    );
    return operation !== 0
      ? operation
      : compareUnicodeCodeUnits(
        left.packet.definitionKey.memberKey,
        right.packet.definitionKey.memberKey,
      );
  }),
);

function compositeKey(packet: OwnerContractPacket): string {
  return `${packet.definitionKey.operationId}#${packet.definitionKey.memberKey}`;
}

export const OWNER_CONTRACT_KEY_SET_DIGEST = sha256Bytes(
  `${OWNER_CONTRACT_SOURCES.map(({ packet }) => compositeKey(packet)).join("\n")}\n`,
);

const operationCount = new Set(
  OWNER_CONTRACT_SOURCES.map(({ packet }) => packet.definitionKey.operationId),
).size;
const distinctKeys = new Set(
  OWNER_CONTRACT_SOURCES.map(({ packet }) => compositeKey(packet)),
);

if (
  operationCount !== 18 ||
  OWNER_CONTRACT_SOURCES.length !== 55 ||
  distinctKeys.size !== 55 ||
  OWNER_CONTRACT_KEY_SET_DIGEST !== EXACT_OWNER_CONTRACT_KEY_SET_DIGEST
) {
  throw new TypeError(
    `owner contract source set mismatch: ${operationCount}/` +
      `${OWNER_CONTRACT_SOURCES.length}/${distinctKeys.size}/` +
      OWNER_CONTRACT_KEY_SET_DIGEST,
  );
}

export const OWNER_CONTRACT_SOURCE_MAP = Object.freeze(
  Object.fromEntries(
    [...new Set(OWNER_CONTRACT_SOURCES.map(({ packet }) =>
      packet.definitionKey.operationId))].map((operationId) => [
      operationId,
      Object.freeze(Object.fromEntries(
        OWNER_CONTRACT_SOURCES.filter(({ packet }) =>
          packet.definitionKey.operationId === operationId
        ).map((source) => [source.packet.definitionKey.memberKey, source]),
      )),
    ]),
  ),
);
