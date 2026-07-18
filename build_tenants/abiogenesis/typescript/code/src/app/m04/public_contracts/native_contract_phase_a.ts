// Implements the private T-281 Phase A native-contract proof boundary.

import type { JsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

import {
  admitIJsonValue,
  stableJson,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  absolutePosixPathSchema as sharedAbsolutePosixPathSchema,
  canonicalIJsonSchema as sharedCanonicalIJsonSchema,
  capabilityIdSchema as sharedCapabilityIdSchema,
  contractIdSchema as sharedContractIdSchema,
  nonEmptyTextSchema as sharedNonEmptyTextSchema,
  refSchema as sharedRefSchema,
  refTextSchema,
  safePositiveIntegerSchema as sharedSafePositiveIntegerSchema,
  semanticVersionSchema as sharedSemanticVersionSchema,
  sha256DigestSchema as sharedSha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import {
  applyResolvedOwnerProjectionRelation,
  assertResolvedOwnerNativeContractSourceOriginatesFrom,
  deriveCanonicalNativeSchemaProjection,
  nativeExportNameSchema,
  privateNativeSchemaSourceLocatorSchema,
  projectCanonicalNativeJsonSchema,
  type NativeSchemaProjectionWitness,
  type OwnerNativeContractSourceRow,
  type ResolvedOwnerNativeContractSource,
  type ResolvedOwnerProjectionRelation
} from "../../../shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  type NativeNamedCheckRegistry
} from "../../../shared/validation/native_named_check_registry.js";
import {
  ownerProjectionRelationSource,
  type OwnerProjectionRelationInput
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { relativePath as admitProductRelativePath } from "../public_sdk/admission_primitives.js";

type NativeSchema = v.GenericSchema;

/** @internal */
export type NativeType<S extends NativeSchema> = v.InferOutput<S>;

/** @internal */
export const nonEmptyTextSchema = sharedNonEmptyTextSchema;
/** @internal */
export const refSchema = sharedRefSchema;
/** @internal */
export const contractIdSchema = sharedContractIdSchema;
/** @internal */
export const capabilityIdSchema = sharedCapabilityIdSchema;
/** @internal */
export const sha256DigestSchema = sharedSha256DigestSchema;
/** @internal */
export const semanticVersionSchema = sharedSemanticVersionSchema;
/** @internal */
export const absolutePosixPathSchema = sharedAbsolutePosixPathSchema;
/** @internal */
export const safePositiveIntegerSchema = sharedSafePositiveIntegerSchema;
/** @internal */
export const canonicalIJsonSchema = sharedCanonicalIJsonSchema;

const variantDefinitionKeySchema = v.strictObject({
  operationId: nonEmptyTextSchema,
  memberKind: v.literal("variant"),
  variant: nonEmptyTextSchema
});

const projectReadDefinitionKeySchema = v.strictObject({
  operationId: v.literal("abg.operation.project.read"),
  memberKind: v.literal("project_read_case"),
  caseKey: nonEmptyTextSchema
});

/** @internal */
export const definitionKeySchema = v.pipe(
  v.variant("memberKind", [
    variantDefinitionKeySchema,
    projectReadDefinitionKeySchema
  ]),
  v.readonly()
);

/** @internal */
export type DefinitionKey = v.InferOutput<typeof definitionKeySchema>;

type VariantDefinitionKeyInput<
  OperationId extends string = string,
  Variant extends string = string
> = Readonly<{
  operationId: OperationId;
  memberKind: "variant";
  variant: Variant;
}>;

type ProjectReadDefinitionKeyInput<
  CaseKey extends string = string
> = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: CaseKey;
}>;

const exactDefinitionKeyValue = Symbol("exactDefinitionKeyValue");

function exactVariantDefinitionKeySchema<
  const OperationId extends string,
  const Variant extends string
>(raw: VariantDefinitionKeyInput<OperationId, Variant>) {
  return Object.freeze(
    Object.assign(
      v.pipe(
        v.strictObject({
          operationId: v.literal(raw.operationId),
          memberKind: v.literal("variant"),
          variant: v.literal(raw.variant)
        }),
        v.readonly()
      ),
      { [exactDefinitionKeyValue]: raw }
    )
  );
}

function exactProjectReadDefinitionKeySchema<
  const CaseKey extends string
>(raw: ProjectReadDefinitionKeyInput<CaseKey>) {
  return Object.freeze(
    Object.assign(
      v.pipe(
        v.strictObject({
          operationId: v.literal("abg.operation.project.read"),
          memberKind: v.literal("project_read_case"),
          caseKey: v.literal(raw.caseKey)
        }),
        v.readonly()
      ),
      { [exactDefinitionKeyValue]: raw }
    )
  );
}

type VariantDefinitionKeySchema<
  OperationId extends string = string,
  Variant extends string = string
> = ReturnType<
  typeof exactVariantDefinitionKeySchema<OperationId, Variant>
>;

type ProjectReadDefinitionKeySchema<
  CaseKey extends string = string
> = ReturnType<typeof exactProjectReadDefinitionKeySchema<CaseKey>>;

type DefinitionKeySchemaFor<K extends DefinitionKey> =
  K extends VariantDefinitionKeyInput<
    infer OperationId,
    infer Variant
  >
    ? VariantDefinitionKeySchema<OperationId, Variant>
    : K extends ProjectReadDefinitionKeyInput<infer CaseKey>
      ? ProjectReadDefinitionKeySchema<CaseKey>
      : never;

type DefinitionKeySchema<
  K extends DefinitionKey = DefinitionKey
> = NativeSchema & {
  readonly [exactDefinitionKeyValue]: K;
  readonly "~types"?: {
    readonly output: K;
  } | undefined;
};

/** @internal */
export function definitionKeySchemaFor<const K extends DefinitionKey>(
  raw: K
): DefinitionKeySchemaFor<K>;
/** @internal */
export function definitionKeySchemaFor(
  raw: DefinitionKey
): DefinitionKeySchema {
  const admitted = freezeNativeValue(admitNative(definitionKeySchema, raw));
  if (!stableJsonEquals(admitted, raw)) {
    throw new TypeError("definition key: canonical structural mismatch");
  }
  return admitted.memberKind === "variant"
    ? exactVariantDefinitionKeySchema(admitted)
    : exactProjectReadDefinitionKeySchema(admitted);
}

/** @internal */
function phaseFixtureNativeSchemaSource<S extends NativeSchema>(
  slot: "request" | "result" | "refusal",
  schema: S
) {
  return {
    sourceLocator: {
      kind: "private_source_module" as const,
      sourceRoot: "semantic_build" as const,
      modulePath:
        "code/src/app/m04/public_contracts/native_contract_phase_a.js",
      exportName: "PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES",
      memberPath: ["workspace_create_clean", slot, "schema"] as const
    },
    namedChecks: { kind: "none" as const },
    schema
  };
}

/** @internal */
export const PHASE_A_NATIVE_CONTRACT_FIXTURE_SOURCES = freezeNativeValue({
  workspace_create_clean: Object.freeze({
    request: phaseFixtureNativeSchemaSource(
      "request",
      v.strictObject({
        targetRoot: absolutePosixPathSchema,
        createPolicy: v.literal("clean")
      })
    ),
    result: phaseFixtureNativeSchemaSource(
      "result",
      v.strictObject({
        workspaceRef: refSchema,
        creationManifestRef: refSchema,
        provenanceRefs: uniqueByNativeIdentityArray(refSchema)
      })
    ),
    refusal: phaseFixtureNativeSchemaSource(
      "refusal",
      v.strictObject({
        code: v.picklist([
          "invalid_target",
          "workspace_exists",
          "workspace_identity_conflict",
          "filesystem_failure"
        ]),
        message: nonEmptyTextSchema,
        residualRefs: uniqueByNativeIdentityArray(refSchema)
      })
    )
  })
});

const PHASE_A_PROJECT_READ_RELATION_KEY = freezeNativeValue({
  operationId: "abg.operation.project.read" as const,
  memberKind: "project_read_case" as const,
  caseKey: "phase_a_relation_fixture" as const
});
type PhaseAProjectReadRelationRequest = {
  readonly caseKey: "phase_a_relation_fixture";
  readonly expectedProjectionRef: string;
};
type PhaseAProjectReadRelationProjection = {
  readonly projectionRef: string;
};

/** @internal */
export const PHASE_A_PROJECT_READ_RELATION_SOURCE =
  ownerProjectionRelationSource({
    relationIdentity: "relation://abg/phase-a/project-read-projection",
    definitionKey: PHASE_A_PROJECT_READ_RELATION_KEY,
    semanticOwnerBasis: freezeNativeValue({
      ref: "design://abg/t281/phase-a-project-read-relation",
      digest:
        "sha256:2b5153aedb06dc5c814bf356de45b1ec5bc3b91a766d107002d0f2b3176e6f6e"
    }),
    modulePath:
      "code/src/app/m04/public_contracts/native_contract_phase_a.js",
    exportName: "PHASE_A_PROJECT_READ_RELATION_SOURCE",
    memberPath: [] as const,
    relation: (
      input: OwnerProjectionRelationInput<
        typeof PHASE_A_PROJECT_READ_RELATION_KEY,
        PhaseAProjectReadRelationRequest,
        PhaseAProjectReadRelationProjection
      >
    ) =>
      input.admittedRequest.expectedProjectionRef ===
      input.candidateProjection.projectionRef
        ? freezeNativeValue({ kind: "projection_related" as const })
        : freezeNativeValue({
            kind: "projection_relation_mismatch" as const,
            issuePaths: ["projectionRef"] as const
          })
  });

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** @internal */
export const uniqueByIdentityArray = uniqueByNativeIdentityArray;

/** @internal */
export function projectNativeJsonSchema<S extends NativeSchema>(
  schema: S,
  options: {
    readonly namedCheckRegistry?: NativeNamedCheckRegistry | undefined;
  } = {}
): JsonSchema {
  return projectCanonicalNativeJsonSchema(schema, options);
}

/** @internal */
export function admitNative<S extends NativeSchema>(
  schema: S,
  input: unknown
): NativeType<S> {
  return freezeNativeValue(v.parse(schema, input));
}

const publicPackageExportLocatorSchema = v.strictObject({
  kind: v.literal("public_package_export"),
  packageName: refTextSchema,
  packageExport: refTextSchema,
  exportName: nativeExportNameSchema
});

/** @internal */
export const nativeContractLocatorSchema = v.variant("kind", [
  privateNativeSchemaSourceLocatorSchema,
  publicPackageExportLocatorSchema
]);

const publicContractAssetLocatorSchema = v.strictObject({
  kind: v.literal("canonical_asset"),
  relativePath: refTextSchema,
  mediaType: refTextSchema,
  schemaId: contractIdSchema,
  schemaVersion: semanticVersionSchema,
  digest: sha256DigestSchema
});

/** @internal */
export const publicContractCoordinateSchema = v.strictObject({
  contractId: contractIdSchema,
  contractVersion: semanticVersionSchema,
  contractDigest: sha256DigestSchema,
  schemaId: contractIdSchema,
  schemaVersion: semanticVersionSchema,
  schemaDigest: sha256DigestSchema,
  nativeLocator: v.nullable(nativeContractLocatorSchema),
  assetLocator: v.optional(v.nullable(publicContractAssetLocatorSchema))
});

/** @internal */
export const publicContractCatalogCoordinateSchema = v.strictObject({
  kind: v.literal("public_contract_catalog_coordinate"),
  catalogId: contractIdSchema,
  catalogVersion: semanticVersionSchema,
  catalogDigest: sha256DigestSchema
});

const publicContractCatalogBasisSchema = v.strictObject({
  kind: v.literal("public_contract_catalog"),
  catalogId: contractIdSchema,
  catalogVersion: semanticVersionSchema,
  rows: v.array(publicContractCoordinateSchema)
});

/** @internal */
export const publicContractCatalogSchema = v.strictObject({
  ...publicContractCatalogBasisSchema.entries,
  catalogDigest: sha256DigestSchema
});

/** @internal */
export type PublicContractCoordinate = v.InferOutput<
  typeof publicContractCoordinateSchema
>;
/** @internal */
export type PublicContractCatalogCoordinate = v.InferOutput<
  typeof publicContractCatalogCoordinateSchema
>;
/** @internal */
export type NativePublicContractCatalogPacket = v.InferOutput<
  typeof publicContractCatalogSchema
>;

/** @internal */
export function admitPublicContractCoordinate(
  input: unknown
): PublicContractCoordinate {
  const coordinate = admitNative(publicContractCoordinateSchema, input);
  const assetLocator = coordinate.assetLocator;
  if (assetLocator !== undefined && assetLocator !== null) {
    admitProductRelativePath(
      assetLocator.relativePath,
      "public contract coordinate.assetLocator.relativePath"
    );
  }
  if (
    coordinate.nativeLocator === null &&
    (assetLocator === undefined || assetLocator === null)
  ) {
    throw new TypeError(
      "public contract coordinate: native or canonical asset locator required"
    );
  }
  if (
    coordinate.contractDigest !== coordinate.schemaDigest ||
    (assetLocator !== undefined &&
      assetLocator !== null &&
      (assetLocator.schemaId !== coordinate.schemaId ||
        assetLocator.schemaVersion !== coordinate.schemaVersion ||
        assetLocator.digest !== coordinate.schemaDigest))
  ) {
    throw new TypeError("public contract coordinate: asset digest mismatch");
  }
  return coordinate;
}

function contractCoordinateIdentity(row: PublicContractCoordinate): string {
  return `${row.contractId}@${row.contractVersion}`;
}

function assertCatalogRows(
  rows: readonly PublicContractCoordinate[]
): void {
  const identities = rows.map(contractCoordinateIdentity);
  if (new Set(identities).size !== identities.length) {
    throw new TypeError("public contract catalog: duplicate contract identity");
  }
  const canonicalOrder = [...identities].sort(compareCodePoints);
  if (!stableJsonEquals(identities, canonicalOrder)) {
    throw new TypeError("public contract catalog: noncanonical row order");
  }
}

/** @internal */
export function admitPublicContractCatalog(
  input: unknown
): NativePublicContractCatalogPacket {
  const catalog = admitNative(publicContractCatalogSchema, input);
  for (const row of catalog.rows) {
    admitPublicContractCoordinate(row);
  }
  assertCatalogRows(catalog.rows);
  const basis = admitNative(publicContractCatalogBasisSchema, {
    kind: catalog.kind,
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    rows: catalog.rows
  });
  if (catalog.catalogDigest !== stableSha256Digest(basis)) {
    throw new TypeError("public contract catalog: digest mismatch");
  }
  return catalog;
}

/** @internal */
export function constructPublicContractCatalog(input: {
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly rows: readonly unknown[];
}): NativePublicContractCatalogPacket {
  const rows = input.rows
    .map(admitPublicContractCoordinate)
    .sort((left, right) =>
      compareCodePoints(
        contractCoordinateIdentity(left),
        contractCoordinateIdentity(right)
      )
    );
  assertCatalogRows(rows);
  const basis = admitNative(publicContractCatalogBasisSchema, {
    kind: "public_contract_catalog",
    catalogId: input.catalogId,
    catalogVersion: input.catalogVersion,
    rows
  });
  return admitPublicContractCatalog({
    ...basis,
    catalogDigest: stableSha256Digest(basis)
  });
}

/** @internal */
export function publicContractCatalogCoordinate(
  input: unknown
): PublicContractCatalogCoordinate {
  const catalog = admitPublicContractCatalog(input);
  return admitNative(publicContractCatalogCoordinateSchema, {
    kind: "public_contract_catalog_coordinate",
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest
  });
}

/** @internal */
export interface NativeContractDefinition<S extends NativeSchema> {
  readonly nativeSymbol: string;
  readonly schemaCoordinate: PublicContractCoordinate;
  readonly schema: S;
  readonly projectedSchema: JsonSchema;
  readonly projectionWitness: NativeSchemaProjectionWitness;
}

const NATIVE_CONTRACT_DEFINITION_AUTHORITY = new WeakSet<object>();
const NATIVE_CONTRACT_DEFINITION_SOURCE =
  new WeakMap<object, object>();

/** @internal */
export function assertNativeContractDefinitionCarrier(
  input: unknown
): asserts input is NativeContractDefinition<NativeSchema> {
  if (
    typeof input !== "object" ||
    input === null ||
    !NATIVE_CONTRACT_DEFINITION_AUTHORITY.has(input)
  ) {
    throw new TypeError("native contract: unresolved or forged definition carrier");
  }
}

/** @internal */
export function assertNativeContractDefinitionOriginatesFromSourceRow<
  S extends NativeSchema
>(
  definition: NativeContractDefinition<S>,
  expectedSourceRow: OwnerNativeContractSourceRow<S>
): void {
  assertNativeContractDefinitionCarrier(definition);
  const source = NATIVE_CONTRACT_DEFINITION_SOURCE.get(definition);
  if (source === undefined) {
    throw new TypeError("native contract: definition source is unavailable");
  }
  assertResolvedOwnerNativeContractSourceOriginatesFrom(
    source,
    expectedSourceRow
  );
}

const nativeContractIdentitySchema = v.strictObject({
  contractId: contractIdSchema,
  contractVersion: semanticVersionSchema,
  schemaId: contractIdSchema,
  schemaVersion: semanticVersionSchema
});

/** @internal */
export function defineNativeContract<S extends NativeSchema>(input: {
  readonly identity: v.InferInput<typeof nativeContractIdentitySchema>;
  readonly source: ResolvedOwnerNativeContractSource<S>;
}): NativeContractDefinition<S> {
  const inputKeys = Reflect.ownKeys(input);
  const unexpectedInputKey = inputKeys.find(
    (key) => key !== "identity" && key !== "source"
  );
  if (unexpectedInputKey !== undefined) {
    throw new TypeError(
      `native contract: unexpected input ${String(unexpectedInputKey)}`
    );
  }
  if (
    inputKeys.length !== 2 ||
    !inputKeys.includes("identity") ||
    !inputKeys.includes("source")
  ) {
    throw new TypeError("native contract: expected exact identity/source input");
  }
  const identity = admitNative(nativeContractIdentitySchema, input.identity);
  const { schema, projectedSchema, witness: projectionWitness } =
    deriveCanonicalNativeSchemaProjection({
      source: input.source,
      schemaRef: identity.schemaId,
      schemaVersion: identity.schemaVersion
    });
  if (
    projectedSchema.$schema !==
    "https://json-schema.org/draft/2020-12/schema"
  ) {
    throw new TypeError("native contract: unsupported JSON Schema dialect");
  }
  const schemaCoordinate = admitPublicContractCoordinate({
    ...identity,
    nativeLocator: projectionWitness.sourceLocator,
    contractDigest: projectionWitness.projectionDigest,
    schemaDigest: projectionWitness.projectionDigest
  });
  const definition = freezeNativeValue({
    nativeSymbol: projectionWitness.sourceLocator.exportName,
    schemaCoordinate,
    schema,
    projectedSchema,
    projectionWitness
  });
  NATIVE_CONTRACT_DEFINITION_AUTHORITY.add(definition);
  NATIVE_CONTRACT_DEFINITION_SOURCE.set(definition, input.source);
  return definition;
}

const defaultPolicySchema = v.union([
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({ kind: v.literal("literal"), value: v.unknown() })
]);

/** @internal */
export type NativeDefaultPolicy = v.InferOutput<typeof defaultPolicySchema>;

function rawObject(input: unknown, label: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  return Object.fromEntries(
    Object.keys(input).map((key) => [key, Reflect.get(input, key)])
  );
}

function schemaEntry(
  entries: v.ObjectEntries,
  field: string
): NativeSchema {
  const entry: unknown = Reflect.get(entries, field);
  if (!isNativeSchema(entry)) {
    throw new TypeError(`native defaults.${field}: unknown request field`);
  }
  return entry;
}

function isNativeSchema(input: unknown): input is NativeSchema {
  return (
    typeof input === "object" &&
    input !== null &&
    Reflect.get(input, "kind") === "schema" &&
    typeof Reflect.get(input, "type") === "string" &&
    typeof Reflect.get(input, "reference") === "function" &&
    typeof Reflect.get(input, "~run") === "function"
  );
}

/** @internal */
export function admitStrictRequestWithDefaults<
  const Entries extends v.ObjectEntries,
  const Message extends v.ErrorMessage<v.StrictObjectIssue> | undefined
>(input: {
  readonly schema: v.StrictObjectSchema<Entries, Message>;
  readonly raw: unknown;
  readonly defaults: readonly {
    readonly field: string;
    readonly policy: unknown;
  }[];
}): v.InferOutput<typeof input.schema> {
  const candidate = rawObject(input.raw, "native request");
  const allowed = new Set(Object.keys(input.schema.entries));
  for (const field of Object.keys(candidate)) {
    if (!allowed.has(field)) {
      throw new TypeError(`native request.${field}: unknown field`);
    }
  }
  const defaulted = new Set<string>();
  for (const row of input.defaults) {
    if (defaulted.has(row.field)) {
      throw new TypeError(`native defaults.${row.field}: duplicate row`);
    }
    defaulted.add(row.field);
    const policy = admitNative(defaultPolicySchema, row.policy);
    const fieldSchema = schemaEntry(input.schema.entries, row.field);
    if (Object.hasOwn(candidate, row.field)) {
      admitNative(fieldSchema, candidate[row.field]);
      continue;
    }
    if (policy.kind === "literal") {
      candidate[row.field] = admitNative(fieldSchema, policy.value);
    }
  }
  return admitNative(input.schema, candidate);
}

const capabilityGrantBasisEntries = {
  capabilityId: capabilityIdSchema,
  capabilityDefinitionRef: refSchema,
  capabilityDefinitionDigest: sha256DigestSchema,
  actorRef: refSchema,
  approvalRef: refSchema,
  policyRef: refSchema,
  scopeRef: refSchema,
  scopeDigest: sha256DigestSchema,
  authorityBasisRef: refSchema,
  authorityBasisDigest: sha256DigestSchema
} as const satisfies v.ObjectEntries;

const capabilityGrantBasisSchema = v.strictObject(capabilityGrantBasisEntries);
/** @internal */
export const capabilityGrantCoordinateSchema = v.strictObject({
  kind: v.literal("capability_grant"),
  grantRef: refSchema,
  grantDigest: sha256DigestSchema,
  ...capabilityGrantBasisEntries
});

/** @internal */
export type CapabilityGrantCoordinate = v.InferOutput<
  typeof capabilityGrantCoordinateSchema
>;

/** @internal */
export function constructCapabilityGrant(
  input: v.InferInput<typeof capabilityGrantBasisSchema>
): CapabilityGrantCoordinate {
  const basis = admitNative(capabilityGrantBasisSchema, input);
  const grantDigest = stableSha256Digest(basis);
  return admitCapabilityGrant({
    kind: "capability_grant",
    grantRef: `capability-grant:${grantDigest}`,
    grantDigest,
    ...basis
  });
}

/** @internal */
export function admitCapabilityGrant(input: unknown): CapabilityGrantCoordinate {
  const grant = admitNative(capabilityGrantCoordinateSchema, input);
  const basis = {
    capabilityId: grant.capabilityId,
    capabilityDefinitionRef: grant.capabilityDefinitionRef,
    capabilityDefinitionDigest: grant.capabilityDefinitionDigest,
    actorRef: grant.actorRef,
    approvalRef: grant.approvalRef,
    policyRef: grant.policyRef,
    scopeRef: grant.scopeRef,
    scopeDigest: grant.scopeDigest,
    authorityBasisRef: grant.authorityBasisRef,
    authorityBasisDigest: grant.authorityBasisDigest
  };
  const expectedDigest = stableSha256Digest(basis);
  if (
    grant.grantDigest !== expectedDigest ||
    grant.grantRef !== `capability-grant:${expectedDigest}`
  ) {
    throw new TypeError("capability grant: digest-derived identity mismatch");
  }
  return grant;
}

const forbiddenSlotSchema = v.strictObject({ state: v.literal("forbidden") });
const actorSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_actor"),
    actorRef: refSchema,
    attributionRef: refSchema,
    attributionDigest: sha256DigestSchema
  })
]);
const workspaceSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_workspace"),
    bindingRef: refSchema,
    bindingDigest: sha256DigestSchema
  })
]);
const productSetSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_product_set"),
    productSetRef: refSchema,
    productSetDigest: sha256DigestSchema
  })
]);
const dependencyLockSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_dependency_lock"),
    lockRef: refSchema,
    lockDigest: sha256DigestSchema
  })
]);
const catalogScopeSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_catalog_scope"),
    viewRef: refSchema,
    viewDigest: sha256DigestSchema,
    allowlistRef: refSchema,
    allowlistDigest: sha256DigestSchema
  })
]);
const selectedExecutionProgramSlotSchema = v.strictObject({
  state: v.literal("admitted_execution_program"),
  selectionState: v.literal("selected_graph_function"),
  admittedGtlProgramRef: refSchema,
  admittedGtlProgramDigest: sha256DigestSchema,
  canonicalHandle: refSchema,
  inputContract: publicContractCoordinateSchema,
  inputPayloadRef: refSchema,
  inputPayloadDigest: sha256DigestSchema
});
const constrainedExecutionProgramSlotSchema = v.strictObject({
  state: v.literal("admitted_execution_program"),
  selectionState: v.literal("program_constraints_only"),
  admittedGtlProgramRef: refSchema,
  admittedGtlProgramDigest: sha256DigestSchema
});
const executionProgramSlotSchema = v.union([
  forbiddenSlotSchema,
  selectedExecutionProgramSlotSchema,
  constrainedExecutionProgramSlotSchema
]);
const invocationPolicySlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("admitted_invocation_policy"),
    policyRef: refSchema,
    policyDigest: sha256DigestSchema,
    sessionPolicyRef: refSchema,
    sessionPolicyDigest: sha256DigestSchema
  })
]);
const transportSteeringSlotSchema = v.union([
  forbiddenSlotSchema,
  v.strictObject({
    state: v.literal("declared_transport_steering"),
    steeringRef: refSchema,
    steeringDigest: sha256DigestSchema,
    provenanceRefs: uniqueByIdentityArray(refSchema)
  })
]);

const authorityBasisEntries = {
  authorityBasisRef: refSchema,
  authorityBasisDigest: sha256DigestSchema,
  definitionDigest: sha256DigestSchema,
  contractCatalog: publicContractCatalogCoordinateSchema,
  capabilityGrants: uniqueByIdentityArray(capabilityGrantCoordinateSchema),
  actor: actorSlotSchema,
  workspace: workspaceSlotSchema,
  productSet: productSetSlotSchema,
  dependencyLock: dependencyLockSlotSchema,
  catalogScope: catalogScopeSlotSchema,
  executionProgram: executionProgramSlotSchema,
  invocationPolicy: invocationPolicySlotSchema,
  transportSteering: transportSteeringSlotSchema
} as const satisfies v.ObjectEntries;

function invocationAuthorityBasisSchema<
  KeySchema extends DefinitionKeySchema
>(keySchema: KeySchema) {
  return v.strictObject({
    ...authorityBasisEntries,
    definitionKey: v.nonOptional(keySchema)
  });
}

/** @internal */
export function invocationAuthoritySchema<
  KeySchema extends DefinitionKeySchema
>(keySchema: KeySchema) {
  return v.strictObject({
    kind: v.literal("invocation_authority"),
    authoritySetRef: refSchema,
    authoritySetDigest: sha256DigestSchema,
    ...authorityBasisEntries,
    definitionKey: v.nonOptional(keySchema)
  });
}

/** @internal */
export interface InvocationAuthorityExpectation<K extends DefinitionKey> {
  readonly definitionKey: K;
  readonly definitionDigest: string;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly requiredGrantCapabilityIds: readonly string[];
  readonly slotStates: {
    readonly actor: "forbidden" | "admitted_actor";
    readonly workspace: "forbidden" | "admitted_workspace";
    readonly productSet: "forbidden" | "admitted_product_set";
    readonly dependencyLock: "forbidden" | "admitted_dependency_lock";
    readonly catalogScope: "forbidden" | "admitted_catalog_scope";
    readonly executionProgram: "forbidden" | "admitted_execution_program";
    readonly invocationPolicy: "forbidden" | "admitted_invocation_policy";
    readonly transportSteering: "forbidden" | "declared_transport_steering";
  };
}

function assertSameValue(left: unknown, right: unknown, label: string): void {
  if (!stableJsonEquals(left, right)) {
    throw new TypeError(`${label}: exact value mismatch`);
  }
}

function admitExactDefinitionKey<KeySchema extends DefinitionKeySchema>(input: {
  readonly schema: KeySchema;
  readonly raw: unknown;
  readonly label: string;
}): v.InferOutput<KeySchema> {
  const structural = admitNative(definitionKeySchema, input.raw);
  const exact = admitNative(input.schema, input.raw);
  assertSameValue(
    structural,
    input.schema[exactDefinitionKeyValue],
    `${input.label} schema value`
  );
  assertSameValue(exact, structural, input.label);
  return exact;
}

function assertAuthorityExpectation<
  KeySchema extends DefinitionKeySchema
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly authority: v.InferOutput<
    ReturnType<typeof invocationAuthoritySchema<KeySchema>>
  >;
  readonly expected: InvocationAuthorityExpectation<
    v.InferOutput<KeySchema>
  >;
}): void {
  const authority = input.authority;
  const expectedDefinitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: input.expected.definitionKey,
    label: "invocation authority expected definition key"
  });
  if (
    authority.definitionKey.operationId !== expectedDefinitionKey.operationId ||
    authority.definitionDigest !== input.expected.definitionDigest
  ) {
    throw new TypeError("invocation authority: definition mismatch");
  }
  assertSameValue(
    authority.definitionKey,
    expectedDefinitionKey,
    "invocation authority definition key"
  );
  assertSameValue(
    authority.contractCatalog,
    input.expected.contractCatalog,
    "invocation authority catalog"
  );
  for (const slot of Object.keys(input.expected.slotStates)) {
    const actual: unknown = Reflect.get(authority, slot);
    const expectedState: unknown = Reflect.get(input.expected.slotStates, slot);
    if (
      typeof actual !== "object" ||
      actual === null ||
      Reflect.get(actual, "state") !== expectedState
    ) {
      throw new TypeError(`invocation authority.${slot}: state mismatch`);
    }
  }
  const capabilityIds = authority.capabilityGrants.map(
    (grant) => grant.capabilityId
  );
  assertSameValue(
    [...capabilityIds].sort(),
    [...input.expected.requiredGrantCapabilityIds].sort(),
    "invocation authority capabilities"
  );
  const attributedActorRef =
    authority.actor.state === "admitted_actor"
      ? authority.actor.actorRef
      : null;
  for (const grant of authority.capabilityGrants) {
    admitCapabilityGrant(grant);
    if (
      (attributedActorRef !== null && grant.actorRef !== attributedActorRef) ||
      grant.authorityBasisRef !== authority.authorityBasisRef ||
      grant.authorityBasisDigest !== authority.authorityBasisDigest
    ) {
      throw new TypeError("invocation authority: grant basis mismatch");
    }
  }
  const sortedGrantRefs = authority.capabilityGrants
    .map((grant) => grant.grantRef)
    .slice()
    .sort(compareCodePoints);
  assertSameValue(
    authority.capabilityGrants.map((grant) => grant.grantRef),
    sortedGrantRefs,
    "invocation authority grant order"
  );
}

/** @internal */
export function admitInvocationAuthority<
  KeySchema extends DefinitionKeySchema
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly raw: unknown;
  readonly expected: InvocationAuthorityExpectation<
    v.InferOutput<KeySchema>
  >;
}) {
  const authority = admitNative(
    invocationAuthoritySchema(input.definitionKeySchema),
    input.raw
  );
  if (
    authority.executionProgram.state === "admitted_execution_program" &&
    authority.executionProgram.selectionState === "selected_graph_function"
  ) {
    admitPublicContractCoordinate(authority.executionProgram.inputContract);
  }
  if (
    (authority.definitionKey.operationId === "abg.operation.run.invoke" ||
      authority.definitionKey.operationId === "abg.operation.run.continue") &&
    authority.definitionKey.memberKind === "variant"
  ) {
    const expectedSelectionState =
      authority.definitionKey.operationId === "abg.operation.run.invoke" &&
      authority.definitionKey.variant === "invoke"
        ? "selected_graph_function"
        : "program_constraints_only";
    if (
      authority.executionProgram.state !== "admitted_execution_program" ||
      authority.executionProgram.selectionState !== expectedSelectionState
    ) {
      throw new TypeError(
        "invocation authority: execution-program state differs from operation variant"
      );
    }
  }
  assertAuthorityExpectation({
    definitionKeySchema: input.definitionKeySchema,
    authority,
    expected: input.expected
  });
  const basis = admitNative(
    invocationAuthorityBasisSchema(input.definitionKeySchema),
    {
      authorityBasisRef: authority.authorityBasisRef,
      authorityBasisDigest: authority.authorityBasisDigest,
      definitionDigest: authority.definitionDigest,
      contractCatalog: authority.contractCatalog,
      capabilityGrants: authority.capabilityGrants,
      actor: authority.actor,
      workspace: authority.workspace,
      productSet: authority.productSet,
      dependencyLock: authority.dependencyLock,
      catalogScope: authority.catalogScope,
      executionProgram: authority.executionProgram,
      invocationPolicy: authority.invocationPolicy,
      transportSteering: authority.transportSteering,
      definitionKey: authority.definitionKey
    }
  );
  const expectedDigest = stableSha256Digest(basis);
  if (
    authority.authoritySetDigest !== expectedDigest ||
    authority.authoritySetRef !== `invocation-authority:${expectedDigest}`
  ) {
    throw new TypeError("invocation authority: digest-derived identity mismatch");
  }
  return authority;
}

/** @internal */
export function constructInvocationAuthority<
  KeySchema extends DefinitionKeySchema
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly basis: v.InferInput<
    ReturnType<typeof invocationAuthorityBasisSchema<KeySchema>>
  >;
  readonly expected: InvocationAuthorityExpectation<
    v.InferOutput<KeySchema>
  >;
}) {
  const expectedDefinitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: input.expected.definitionKey,
    label: "invocation authority expected definition key"
  });
  const parsed = admitNative(
    invocationAuthorityBasisSchema(input.definitionKeySchema),
    input.basis
  );
  assertSameValue(
    parsed.definitionKey,
    expectedDefinitionKey,
    "invocation authority basis definition key"
  );
  const sortedGrants = Object.freeze(
    [...parsed.capabilityGrants]
      .map(admitCapabilityGrant)
      .sort((left, right) => compareCodePoints(left.grantRef, right.grantRef))
  );
  const basis = admitNative(
    invocationAuthorityBasisSchema(input.definitionKeySchema),
    { ...parsed, capabilityGrants: sortedGrants }
  );
  const authoritySetDigest = stableSha256Digest(basis);
  return admitInvocationAuthority({
    definitionKeySchema: input.definitionKeySchema,
    expected: input.expected,
    raw: {
      kind: "invocation_authority",
      authoritySetRef: `invocation-authority:${authoritySetDigest}`,
      authoritySetDigest,
      ...basis
    }
  });
}

function publicInvocationBasisSchema<
  KeySchema extends DefinitionKeySchema,
  Request extends NativeSchema
>(keySchema: KeySchema, requestSchema: Request) {
  return v.strictObject({
    kind: v.literal("public_invocation"),
    invocationRef: refSchema,
    definitionKey: v.nonOptional(keySchema),
    definitionDigest: sha256DigestSchema,
    contractCatalog: publicContractCatalogCoordinateSchema,
    authority: invocationAuthoritySchema(keySchema),
    requestContract: publicContractCoordinateSchema,
    requestRef: refSchema,
    requestDigest: sha256DigestSchema,
    request: requestSchema,
    expectedResultContract: publicContractCoordinateSchema,
    expectedRefusalContract: publicContractCoordinateSchema,
    expectedNonTerminalContract: v.nullable(publicContractCoordinateSchema),
    correlationRef: refSchema,
    provenanceRefs: uniqueByIdentityArray(refSchema)
  });
}

/** @internal */
export function publicInvocationSchema<
  KeySchema extends DefinitionKeySchema,
  Request extends NativeSchema
>(keySchema: KeySchema, requestSchema: Request) {
  const basis = publicInvocationBasisSchema(keySchema, requestSchema);
  return v.strictObject({
    ...basis.entries,
    definitionKey: v.nonOptional(keySchema),
    invocationDigest: sha256DigestSchema
  });
}

/** @internal */
export interface PublicInvocationExpectation<K extends DefinitionKey> {
  readonly definitionKey: K;
  readonly definitionDigest: string;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly requestContract: PublicContractCoordinate;
  readonly resultContract: PublicContractCoordinate;
  readonly refusalContract: PublicContractCoordinate;
  readonly nonTerminalContract: PublicContractCoordinate | null;
  readonly authority: InvocationAuthorityExpectation<K>;
}

/** @internal */
export function admitPublicInvocation<
  KeySchema extends DefinitionKeySchema,
  Request extends NativeSchema
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly requestSchema: Request;
  readonly raw: unknown;
  readonly expected: PublicInvocationExpectation<
    v.InferOutput<KeySchema>
  >;
}) {
  const invocation = admitNative(
    publicInvocationSchema(input.definitionKeySchema, input.requestSchema),
    input.raw
  );
  const invocationDefinitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: Reflect.get(invocation, "definitionKey"),
    label: "public invocation definition key"
  });
  for (const coordinate of [
    invocation.requestContract,
    invocation.expectedResultContract,
    invocation.expectedRefusalContract,
    invocation.expectedNonTerminalContract
  ]) {
    if (coordinate !== null) {
      admitPublicContractCoordinate(coordinate);
    }
  }
  const authority = invocation.authority;
  if (authority === undefined) {
    throw new TypeError("public invocation: authority is required");
  }
  admitInvocationAuthority({
    definitionKeySchema: input.definitionKeySchema,
    raw: authority,
    expected: input.expected.authority
  });
  const expectedDefinitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: input.expected.definitionKey,
    label: "public invocation expected definition key"
  });
  if (
    invocationDefinitionKey.operationId !== expectedDefinitionKey.operationId ||
    invocation.definitionDigest !== input.expected.definitionDigest
  ) {
    throw new TypeError("public invocation: definition mismatch");
  }
  assertSameValue(
    invocationDefinitionKey,
    expectedDefinitionKey,
    "public invocation definition key"
  );
  assertSameValue(
    authority.definitionKey,
    expectedDefinitionKey,
    "public invocation authority definition key"
  );
  for (const [label, actual, expected] of [
    ["catalog", invocation.contractCatalog, input.expected.contractCatalog],
    ["authority catalog", authority.contractCatalog, input.expected.contractCatalog],
    ["request contract", invocation.requestContract, input.expected.requestContract],
    ["result contract", invocation.expectedResultContract, input.expected.resultContract],
    ["refusal contract", invocation.expectedRefusalContract, input.expected.refusalContract],
    ["nonterminal contract", invocation.expectedNonTerminalContract, input.expected.nonTerminalContract]
  ] as const) {
    assertSameValue(actual, expected, `public invocation ${label}`);
  }
  if (invocation.requestDigest !== stableSha256Digest(invocation.request)) {
    throw new TypeError("public invocation: request digest mismatch");
  }
  const basis = admitNative(
    publicInvocationBasisSchema(
      input.definitionKeySchema,
      input.requestSchema
    ),
    {
      kind: invocation.kind,
      invocationRef: invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      definitionDigest: invocation.definitionDigest,
      contractCatalog: invocation.contractCatalog,
      authority: invocation.authority,
      requestContract: invocation.requestContract,
      requestRef: invocation.requestRef,
      requestDigest: invocation.requestDigest,
      request: invocation.request,
      expectedResultContract: invocation.expectedResultContract,
      expectedRefusalContract: invocation.expectedRefusalContract,
      expectedNonTerminalContract: invocation.expectedNonTerminalContract,
      correlationRef: invocation.correlationRef,
      provenanceRefs: invocation.provenanceRefs
    }
  );
  if (invocation.invocationDigest !== stableSha256Digest(basis)) {
    throw new TypeError("public invocation: invocation digest mismatch");
  }
  return freezeNativeValue({
    ...invocation,
    definitionKey: invocationDefinitionKey
  });
}

/** @internal */
export function constructPublicInvocation<
  KeySchema extends DefinitionKeySchema,
  Request extends NativeSchema
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly requestSchema: Request;
  readonly basis: v.InferOutput<
    ReturnType<
      typeof publicInvocationBasisSchema<
        KeySchema,
        Request
      >
    >
  >;
  readonly expected: PublicInvocationExpectation<
    v.InferOutput<KeySchema>
  >;
}) {
  const basis = admitNative(
    publicInvocationBasisSchema(
      input.definitionKeySchema,
      input.requestSchema
    ),
    input.basis
  );
  const expectedDefinitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: input.expected.definitionKey,
    label: "public invocation expected definition key"
  });
  assertSameValue(
    basis.definitionKey,
    expectedDefinitionKey,
    "public invocation basis definition key"
  );
  return admitPublicInvocation({
    definitionKeySchema: input.definitionKeySchema,
    requestSchema: input.requestSchema,
    expected: input.expected,
    raw: { ...basis, invocationDigest: stableSha256Digest(basis) }
  });
}

function outcomeCommonEntries<
  KeySchema extends DefinitionKeySchema
>(keySchema: KeySchema) {
  return {
    kind: v.literal("public_outcome"),
    outcomeRef: refSchema,
    outcomeDigest: sha256DigestSchema,
    invocationRef: refSchema,
    invocationDigest: sha256DigestSchema,
    definitionKey: v.nonOptional(keySchema),
    definitionDigest: sha256DigestSchema,
    payloadRef: refSchema,
    payloadDigest: sha256DigestSchema,
    evidenceRefs: uniqueByIdentityArray(refSchema),
    correlationRef: refSchema,
    provenanceRefs: uniqueByIdentityArray(refSchema)
  } as const satisfies v.ObjectEntries;
}

function outcomeSchema<
  KeySchema extends DefinitionKeySchema,
  Result extends NativeSchema,
  Refusal extends NativeSchema,
  NonTerminal extends NativeSchema | null
>(input: {
  readonly keySchema: KeySchema;
  readonly resultSchema: Result;
  readonly refusalSchema: Refusal;
  readonly nonTerminalSchema: NonTerminal;
}) {
  const common = outcomeCommonEntries(input.keySchema);
  const result = v.strictObject({
    ...common,
    outcomeKind: v.literal("result"),
    payloadContract: publicContractCoordinateSchema,
    value: input.resultSchema
  });
  const refusal = v.strictObject({
    ...common,
    outcomeKind: v.literal("refusal"),
    payloadContract: publicContractCoordinateSchema,
    value: input.refusalSchema
  });
  if (input.nonTerminalSchema === null) {
    return v.union([result, refusal]);
  }
  return v.union([
    result,
    refusal,
    v.strictObject({
      ...common,
      outcomeKind: v.literal("nonterminal"),
      payloadContract: publicContractCoordinateSchema,
      value: input.nonTerminalSchema
    })
  ]);
}

/** @internal */
export const OUTCOME_ADMISSION_FAILURE_CLASS_VALUES = Object.freeze([
  "malformed",
  "cross_operation",
  "wrong_contract",
  "digest_mismatch",
  "unexpected_nonterminal",
  "relation_mismatch"
] as const);

/** @internal */
export interface SchemaOnlyPublicOutcomeResultBinding {
  readonly kind: "schema_only";
}

/** @internal */
export interface RequestRelatedPublicOutcomeResultBinding<
  K,
  Request,
  Projection
> {
  readonly kind: "request_related_projection";
  readonly relation: ResolvedOwnerProjectionRelation<K, Request, Projection>;
}

/** @internal */
export type PublicOutcomeResultBinding<K, Request, Projection> =
  K extends {
    readonly operationId: "abg.operation.project.read";
  }
    ? RequestRelatedPublicOutcomeResultBinding<K, Request, Projection>
    : SchemaOnlyPublicOutcomeResultBinding;

type ResultProjectionValue<Result extends NativeSchema> =
  v.InferOutput<Result> extends { readonly projection: infer Projection }
    ? Projection
    : never;

function exactOwnDataFields(
  input: unknown,
  expected: readonly string[]
): input is object {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  const keys = Reflect.ownKeys(input);
  if (
    keys.length !== expected.length ||
    !expected.every((key) => keys.includes(key))
  ) {
    return false;
  }
  return expected.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    return descriptor !== undefined &&
      "value" in descriptor &&
      descriptor.enumerable;
  });
}

function ownDataValue(input: unknown, key: string): unknown {
  if (typeof input !== "object" || input === null) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor !== undefined && "value" in descriptor
    ? descriptor.value
    : undefined;
}

function isSchemaOnlyResultBinding(
  input: unknown
): input is SchemaOnlyPublicOutcomeResultBinding {
  return exactOwnDataFields(input, ["kind"]) &&
    ownDataValue(input, "kind") === "schema_only";
}

function isRequestRelatedResultBinding<K, Request, Projection>(
  input: unknown
): input is RequestRelatedPublicOutcomeResultBinding<K, Request, Projection> {
  const relation = ownDataValue(input, "relation");
  return exactOwnDataFields(input, ["kind", "relation"]) &&
    ownDataValue(input, "kind") === "request_related_projection" &&
    typeof relation === "object" && relation !== null;
}

function hasProjectionValue<Projection>(
  input: unknown
): input is { readonly projection: Projection } {
  if (typeof input !== "object" || input === null) {
    return false;
  }
  const descriptor = Object.getOwnPropertyDescriptor(input, "projection");
  return descriptor !== undefined && "value" in descriptor;
}

function outcomeAdmissionFailureSchema<
  KeySchema extends DefinitionKeySchema
>(keySchema: KeySchema) {
  return v.strictObject({
    kind: v.literal("outcome_admission_failure"),
    failureClass: v.picklist(OUTCOME_ADMISSION_FAILURE_CLASS_VALUES),
    issuePaths: uniqueByIdentityArray(nonEmptyTextSchema),
    invocationRef: refSchema,
    definitionKey: v.nonOptional(keySchema),
    candidateDigest: sha256DigestSchema
  });
}

/** @internal */
export type OutcomeAdmissionFailure<
  K extends DefinitionKey = DefinitionKey
> = v.InferOutput<
  ReturnType<
    typeof outcomeAdmissionFailureSchema<DefinitionKeySchemaFor<K>>
  >
>;

function candidateDigest(input: unknown): `sha256:${string}` {
  try {
    return stableSha256Digest(admitIJsonValue(input));
  } catch {
    return stableSha256Digest({
      kind: "non_ijson_candidate",
      candidateType: input === null ? "null" : typeof input
    });
  }
}

function outcomeFailure<KeySchema extends DefinitionKeySchema>(
  keySchema: KeySchema,
  input: {
  readonly failureClass: OutcomeAdmissionFailure["failureClass"];
  readonly issuePaths: readonly string[];
  readonly invocationRef: string;
  readonly definitionKey: v.InferOutput<KeySchema>;
  readonly candidate: unknown;
  }
) {
  return admitNative(outcomeAdmissionFailureSchema(keySchema), {
    kind: "outcome_admission_failure",
    failureClass: input.failureClass,
    issuePaths: [...new Set(input.issuePaths)].sort(),
    invocationRef: input.invocationRef,
    definitionKey: input.definitionKey,
    candidateDigest: candidateDigest(input.candidate)
  });
}

/** @internal */
export function admitPublicOutcome<
  KeySchema extends DefinitionKeySchema,
  Result extends NativeSchema,
  Refusal extends NativeSchema,
  NonTerminal extends NativeSchema | null,
  Request
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly resultSchema: Result;
  readonly refusalSchema: Refusal;
  readonly nonTerminalSchema: NonTerminal;
  readonly resultBinding: PublicOutcomeResultBinding<
    v.InferOutput<KeySchema>,
    Request,
    ResultProjectionValue<Result>
  >;
  readonly invocation: {
    readonly invocationRef: string;
    readonly invocationDigest: string;
    readonly definitionKey: v.InferOutput<KeySchema>;
    readonly definitionDigest: string;
    readonly correlationRef: string;
    readonly request: Request;
  };
  readonly contracts: {
    readonly result: PublicContractCoordinate;
    readonly refusal: PublicContractCoordinate;
    readonly nonTerminal: PublicContractCoordinate | null;
  };
  readonly raw: unknown;
}) {
  const invocationDefinitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: input.invocation.definitionKey,
    label: "public outcome invocation definition key"
  });
  const operationId = invocationDefinitionKey.operationId;
  const projectReadResultBinding =
    operationId === "abg.operation.project.read";
  const hasRequestRelatedBinding = isRequestRelatedResultBinding<
    v.InferOutput<KeySchema>,
    Request,
    ResultProjectionValue<Result>
  >(input.resultBinding);
  if (
    (projectReadResultBinding && !hasRequestRelatedBinding) ||
    (!projectReadResultBinding && !isSchemaOnlyResultBinding(input.resultBinding))
  ) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "relation_mismatch",
      issuePaths: ["resultBinding"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  if (typeof input.raw === "object" && input.raw !== null) {
    const candidateDefinitionKey: unknown = Reflect.get(
      input.raw,
      "definitionKey"
    );
    const candidateKey = v.safeParse(
      definitionKeySchema,
      candidateDefinitionKey
    );
    if (
      candidateKey.success &&
      (candidateKey.output.operationId !== operationId ||
        !stableJsonEquals(candidateKey.output, invocationDefinitionKey))
    ) {
      return outcomeFailure(input.definitionKeySchema, {
        failureClass: "cross_operation",
        issuePaths: ["definitionKey"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: invocationDefinitionKey,
        candidate: input.raw
      });
    }
    if (
      Reflect.get(input.raw, "outcomeKind") === "nonterminal" &&
      input.nonTerminalSchema === null
    ) {
      return outcomeFailure(input.definitionKeySchema, {
        failureClass: "unexpected_nonterminal",
        issuePaths: ["outcomeKind"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: invocationDefinitionKey,
        candidate: input.raw
      });
    }
  }
  const schema = outcomeSchema({
    keySchema: input.definitionKeySchema,
    resultSchema: input.resultSchema,
    refusalSchema: input.refusalSchema,
    nonTerminalSchema: input.nonTerminalSchema
  });
  const parsed = v.safeParse(schema, input.raw);
  if (!parsed.success) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "malformed",
      issuePaths: parsed.issues.map((issue) => v.getDotPath(issue) ?? "candidate"),
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  const outcome = freezeNativeValue(parsed.output);
  try {
    admitPublicContractCoordinate(outcome.payloadContract);
  } catch {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "digest_mismatch",
      issuePaths: ["payloadContract.contractDigest", "payloadContract.schemaDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  if (!stableJsonEquals(outcome.definitionKey, invocationDefinitionKey)) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "cross_operation",
      issuePaths: ["definitionKey"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  if (
    outcome.invocationRef !== input.invocation.invocationRef ||
    outcome.invocationDigest !== input.invocation.invocationDigest ||
    outcome.definitionDigest !== input.invocation.definitionDigest ||
    outcome.correlationRef !== input.invocation.correlationRef
  ) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "digest_mismatch",
      issuePaths: ["invocationDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  const expectedContract =
    outcome.outcomeKind === "result"
      ? input.contracts.result
      : outcome.outcomeKind === "refusal"
        ? input.contracts.refusal
        : input.contracts.nonTerminal;
  if (expectedContract === null) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "unexpected_nonterminal",
      issuePaths: ["outcomeKind"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  if (!stableJsonEquals(outcome.payloadContract, expectedContract)) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "wrong_contract",
      issuePaths: ["payloadContract"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  if (outcome.outcomeKind === "result" && projectReadResultBinding) {
    if (!hasRequestRelatedBinding || !hasProjectionValue<
      ResultProjectionValue<Result>
    >(outcome.value)) {
      return outcomeFailure(input.definitionKeySchema, {
        failureClass: "relation_mismatch",
        issuePaths: ["value.projection"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: invocationDefinitionKey,
        candidate: input.raw
      });
    }
    const requestProjectionBasis = ownDataValue(
      input.invocation.request,
      "projectionBasis"
    );
    const outcomeProjectionBasis = ownDataValue(
      outcome.value,
      "projectionBasis"
    );
    if (
      (requestProjectionBasis !== undefined ||
        outcomeProjectionBasis !== undefined) &&
      !stableJsonEquals(requestProjectionBasis, outcomeProjectionBasis)
    ) {
      return outcomeFailure(input.definitionKeySchema, {
        failureClass: "relation_mismatch",
        issuePaths: ["value.projectionBasis"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: invocationDefinitionKey,
        candidate: input.raw
      });
    }
    try {
      const relationResult = applyResolvedOwnerProjectionRelation({
        relation: input.resultBinding.relation,
        definitionKey: invocationDefinitionKey,
        admittedRequest: input.invocation.request,
        candidateProjection: outcome.value.projection
      });
      if (relationResult.kind === "projection_relation_mismatch") {
        return outcomeFailure(input.definitionKeySchema, {
          failureClass: "relation_mismatch",
          issuePaths: relationResult.issuePaths.map(
            (path) => {
              const relativePath = path === "candidateProjection"
                ? ""
                : path.startsWith("candidateProjection.")
                  ? path.slice("candidateProjection.".length)
                  : path;
              return relativePath.length === 0
                ? "value.projection"
                : `value.projection.${relativePath}`;
            }
          ),
          invocationRef: input.invocation.invocationRef,
          definitionKey: invocationDefinitionKey,
          candidate: input.raw
        });
      }
    } catch {
      return outcomeFailure(input.definitionKeySchema, {
        failureClass: "relation_mismatch",
        issuePaths: ["value.projection"],
        invocationRef: input.invocation.invocationRef,
        definitionKey: invocationDefinitionKey,
        candidate: input.raw
      });
    }
  }
  if (outcome.payloadDigest !== stableSha256Digest(outcome.value)) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "digest_mismatch",
      issuePaths: ["payloadDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  const outcomeBasis = {
    kind: outcome.kind,
    outcomeRef: outcome.outcomeRef,
    invocationRef: outcome.invocationRef,
    invocationDigest: outcome.invocationDigest,
    definitionKey: outcome.definitionKey,
    definitionDigest: outcome.definitionDigest,
    payloadRef: outcome.payloadRef,
    payloadDigest: outcome.payloadDigest,
    evidenceRefs: outcome.evidenceRefs,
    correlationRef: outcome.correlationRef,
    provenanceRefs: outcome.provenanceRefs,
    outcomeKind: outcome.outcomeKind,
    payloadContract: outcome.payloadContract,
    value: outcome.value
  };
  if (outcome.outcomeDigest !== stableSha256Digest(outcomeBasis)) {
    return outcomeFailure(input.definitionKeySchema, {
      failureClass: "digest_mismatch",
      issuePaths: ["outcomeDigest"],
      invocationRef: input.invocation.invocationRef,
      definitionKey: invocationDefinitionKey,
      candidate: input.raw
    });
  }
  return outcome;
}

/** @internal */
export function constructPublicOutcome<
  KeySchema extends DefinitionKeySchema
>(input: {
  readonly definitionKeySchema: KeySchema;
  readonly outcomeKind: "result" | "refusal" | "nonterminal";
  readonly outcomeRef: string;
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly definitionKey: v.InferOutput<KeySchema>;
  readonly definitionDigest: string;
  readonly payloadRef: string;
  readonly payloadContract: PublicContractCoordinate;
  readonly value: IJsonValue;
  readonly evidenceRefs: readonly string[];
  readonly correlationRef: string;
  readonly provenanceRefs: readonly string[];
}) {
  const definitionKey = admitExactDefinitionKey({
    schema: input.definitionKeySchema,
    raw: input.definitionKey,
    label: "public outcome definition key"
  });
  const basis = freezeNativeValue({
    kind: "public_outcome" as const,
    outcomeRef: input.outcomeRef,
    invocationRef: input.invocationRef,
    invocationDigest: input.invocationDigest,
    definitionKey,
    definitionDigest: input.definitionDigest,
    payloadRef: input.payloadRef,
    payloadDigest: stableSha256Digest(input.value),
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    correlationRef: input.correlationRef,
    provenanceRefs: Object.freeze([...input.provenanceRefs]),
    outcomeKind: input.outcomeKind,
    payloadContract: input.payloadContract,
    value: admitIJsonValue(input.value)
  });
  return freezeNativeValue({
    ...basis,
    outcomeDigest: stableSha256Digest(basis)
  });
}

/** @internal */
export function resolvePublicContractCoordinate(input: {
  readonly admittedCatalog: unknown;
  readonly requestedCatalog: PublicContractCatalogCoordinate;
  readonly requested: PublicContractCoordinate;
}): PublicContractCoordinate {
  const catalog = admitPublicContractCatalog(input.admittedCatalog);
  const requested = admitPublicContractCoordinate(input.requested);
  assertSameValue(
    publicContractCatalogCoordinate(catalog),
    input.requestedCatalog,
    "public contract catalog coordinate"
  );
  const matches = catalog.rows.filter(
    (row) =>
      row.contractId === requested.contractId &&
      row.contractVersion === requested.contractVersion
  );
  const match = matches[0];
  if (matches.length !== 1 || match === undefined) {
    throw new TypeError("public contract catalog: unknown contract coordinate");
  }
  assertSameValue(match, requested, "public contract coordinate");
  return match;
}

/** @internal */
export function canonicalNativeSchemaBytes(schema: JsonSchema): Uint8Array {
  return new TextEncoder().encode(stableJson(schema));
}
