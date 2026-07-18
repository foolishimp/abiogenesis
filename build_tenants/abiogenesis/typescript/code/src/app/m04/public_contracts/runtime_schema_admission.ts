// Implements: T-270 M04 ownership of graph-private native schema delivery.

import type * as v from "valibot";

import {
  canonicalizeRuntimeSchemaAdmissionMetadataRows,
  constructRuntimeSchemaAdmissionCapability,
  constructRuntimeSchemaAdmissionCapabilityBasis,
  constructRuntimeSchemaAdmissionEngineInput,
  RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS,
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
  runtimeSchemaAdmissionMetadataRowKey,
  type RuntimeSchemaAdmissionCapabilityBasis,
  type RuntimeSchemaAdmissionEngineInput,
  type RuntimeSchemaAdmissionMetadataRow
} from "../../../abg/m03/contracts/runtime_schema_admission.js";
import type {
  CatalogExecutionBinding
} from "../../../abg/m03/contracts/runtime_catalog.js";
import {
  serializedJsonValueToPlain
} from "../../../gtl/m01/contracts/constructors.js";
import type {
  Module
} from "../../../gtl/m02/contracts/carriers.js";
import {
  admitIJsonValue,
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type {
  OwnerNativeContractSourceRow
} from "../../../shared/validation/canonical_native_schema_projector.js";
import {
  admitNative,
  assertNativeContractDefinitionCarrier,
  assertNativeContractDefinitionOriginatesFromSourceRow,
  type NativeContractDefinition
} from "./native_contract_phase_a.js";

export interface M04RuntimeSchemaAdmissionProjection {
  readonly kind: "m04_runtime_schema_admission_projection";
  readonly bases: readonly RuntimeSchemaAdmissionCapabilityBasis[];
  readonly engineInput: RuntimeSchemaAdmissionEngineInput;
}

/** @internal */
export interface M04RuntimeSchemaNativeDefinitionSource<
  Schema extends v.GenericSchema = v.GenericSchema
> extends OwnerNativeContractSourceRow<Schema> {
  readonly symbolicSchemaRef: string;
  readonly contractId: string;
  readonly contractVersion: string;
}

/** @internal */
export interface M04RuntimeSchemaNativeDefinitionRelation<
  Schema extends v.GenericSchema = v.GenericSchema
> {
  readonly kind: "m04_runtime_schema_native_definition_relation";
  readonly symbolicSchemaRef: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly definition: NativeContractDefinition<Schema>;
}

const M04_RUNTIME_SCHEMA_NATIVE_DEFINITION_RELATION_AUTHORITY =
  new WeakSet<object>();

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function isSha256Digest(value: string): value is `sha256:${string}` {
  return SHA256_PATTERN.test(value);
}

function sha256Digest(value: string, label: string): `sha256:${string}` {
  if (!isSha256Digest(value)) {
    throw new TypeError(`${label}: expected sha256 digest`);
  }
  return value;
}

function exactOwnDataFields(
  input: unknown,
  expected: readonly string[],
  label: string
): asserts input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const actual = Reflect.ownKeys(input);
  if (
    actual.some((key) => typeof key !== "string") ||
    actual.length !== expected.length ||
    expected.some((key) => !actual.includes(key))
  ) {
    throw new TypeError(`${label}: expected exact ${expected.join("/")} fields`);
  }
  for (const key of expected) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !("value" in descriptor)) {
      throw new TypeError(`${label}.${key}: expected a data property`);
    }
  }
}

function nonEmptyText(
  input: Record<string, unknown>,
  field: string,
  label: string
): string {
  const value = input[field];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${field}: expected text`);
  }
  return value;
}

function contractKey(input: {
  readonly contractId: string;
  readonly contractVersion: string;
}): string {
  return `${input.contractId}@${input.contractVersion}`;
}

function nativeDefinitionRelationKey(input: {
  readonly symbolicSchemaRef: string;
  readonly contractId: string;
  readonly contractVersion: string;
}): string {
  return `${input.symbolicSchemaRef}\u0000${contractKey(input)}`;
}

export function admitM04RuntimeSchemaAdmissionMetadataRows(
  input: unknown
): readonly RuntimeSchemaAdmissionMetadataRow[] {
  if (!Array.isArray(input)) {
    throw new TypeError(
      "runtime schema admission metadata: expected a row array"
    );
  }
  const rows = input.map((raw, index) => {
    const label = `runtime schema admission metadata[${String(index)}]`;
    exactOwnDataFields(
      raw,
      RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS,
      label
    );
    return Object.freeze({
      graphFunctionId: nonEmptyText(raw, "graphFunctionId", label),
      nodeRef: nonEmptyText(raw, "nodeRef", label),
      symbolicSchemaRef: nonEmptyText(raw, "symbolicSchemaRef", label),
      contractId: nonEmptyText(raw, "contractId", label),
      contractVersion: nonEmptyText(raw, "contractVersion", label)
    });
  });
  const rowKeys = rows.map(runtimeSchemaAdmissionMetadataRowKey);
  if (new Set(rowKeys).size !== rows.length) {
    throw new TypeError(
      "runtime schema admission metadata: duplicate row key"
    );
  }
  const expectedOrder = canonicalizeRuntimeSchemaAdmissionMetadataRows(rows);
  if (!stableJsonEquals(rows, expectedOrder)) {
    throw new TypeError(
      "runtime schema admission metadata: rows are not canonical"
    );
  }
  return Object.freeze(rows);
}

export function runtimeSchemaAdmissionMetadataRowsFromModule(
  module: Module
): readonly RuntimeSchemaAdmissionMetadataRow[] {
  const entries = module.metadata.entries.filter(
    (entry) => entry.key === RUNTIME_SCHEMA_ADMISSION_METADATA_KEY
  );
  const entry = entries[0];
  if (
    entries.length !== 1 ||
    entry === undefined ||
    entry.value.kind !== "json_blob"
  ) {
    throw new TypeError(
      "runtime schema admission metadata: one json_blob entry is required"
    );
  }
  return admitM04RuntimeSchemaAdmissionMetadataRows(
    serializedJsonValueToPlain(entry.value.value)
  );
}

function assertMetadataRowsExactlyCoverModule(
  module: Module,
  rows: readonly RuntimeSchemaAdmissionMetadataRow[]
): void {
  const graphFunctionsById = new Map(
    module.graphFunctions.map((graphFunction) => [graphFunction.id, graphFunction])
  );
  if (graphFunctionsById.size !== module.graphFunctions.length) {
    throw new TypeError(
      "runtime schema admission metadata: GraphFunction is outside or ambiguous in Module"
    );
  }
  const nodesByGraphFunctionId = new Map<
    string,
    Map<string, Module["graphFunctions"][number]["inputs"][number]>
  >();
  const expectedTupleKeys = new Set<string>();
  for (const graphFunction of module.graphFunctions) {
    const containedNodes = [
      ...graphFunction.inputs,
      ...graphFunction.outputs,
      ...graphFunction.environment.requires,
      ...graphFunction.environment.provides,
      ...graphFunction.environment.carries,
      ...(graphFunction.template.kind === "inline_graph"
        ? graphFunction.template.graph.nodes
        : [])
    ];
    const nodesById = new Map<string, (typeof containedNodes)[number]>();
    for (const node of containedNodes) {
      const existing = nodesById.get(node.id);
      if (existing !== undefined && !stableJsonEquals(existing, node)) {
        throw new TypeError(
          "runtime schema admission metadata: contained Node identity differs"
        );
      }
      nodesById.set(node.id, node);
    }
    nodesByGraphFunctionId.set(graphFunction.id, nodesById);
    for (const node of nodesById.values()) {
      if (node.schema.kind !== "symbolic") continue;
      expectedTupleKeys.add(runtimeSchemaAdmissionMetadataRowKey({
        graphFunctionId: graphFunction.id,
        nodeRef: node.id,
        symbolicSchemaRef: node.schema.ref
      }));
    }
  }

  for (const row of rows) {
    const graphFunction = graphFunctionsById.get(row.graphFunctionId);
    if (graphFunction === undefined) {
      throw new TypeError(
        "runtime schema admission metadata: GraphFunction is outside or ambiguous in Module"
      );
    }
    const node = nodesByGraphFunctionId.get(graphFunction.id)?.get(row.nodeRef);
    if (node === undefined) {
      throw new TypeError(
        "runtime schema admission metadata: Node is outside GraphFunction containment"
      );
    }
    if (
      node.schema.kind !== "symbolic" ||
      node.schema.ref !== row.symbolicSchemaRef
    ) {
      throw new TypeError(
        "runtime schema admission metadata: symbolic schema ref differs from Node"
      );
    }
  }
  const actualTupleKeys = new Set(
    rows.map(runtimeSchemaAdmissionMetadataRowKey)
  );
  if (
    actualTupleKeys.size !== expectedTupleKeys.size ||
    [...expectedTupleKeys].some((key) => !actualTupleKeys.has(key))
  ) {
    throw new TypeError(
      "runtime schema admission metadata: rows do not exactly cover Module symbolic Node containment"
    );
  }
}

function assertSelectedExecutionBinding(
  binding: CatalogExecutionBinding
): void {
  if (
    binding.kind !== "catalog_execution_binding" ||
    binding.moduleName !== binding.module.name ||
    binding.moduleDigest !== stableSha256Digest(binding.module) ||
    binding.graphFunctionId !== binding.graphFunction.id ||
    binding.graphFunctionDigest !== stableSha256Digest(binding.graphFunction)
  ) {
    throw new TypeError(
      "runtime schema admission: selected execution binding differs"
    );
  }
}

function assertNativeDefinitionWitness(
  definition: NativeContractDefinition<v.GenericSchema>
): void {
  const coordinate = definition.schemaCoordinate;
  const witness = definition.projectionWitness;
  if (
    coordinate.contractDigest !== coordinate.schemaDigest ||
    coordinate.schemaId !== witness.schemaRef ||
    coordinate.schemaVersion !== witness.schemaVersion ||
    coordinate.schemaDigest !== witness.projectionDigest ||
    definition.nativeSymbol !== witness.sourceLocator.exportName ||
    !stableJsonEquals(coordinate.nativeLocator, witness.sourceLocator)
  ) {
    throw new TypeError(
      "runtime schema admission: native definition witness differs"
    );
  }
}

function assertM04RuntimeSchemaNativeDefinitionRelation(
  input: unknown
): asserts input is M04RuntimeSchemaNativeDefinitionRelation {
  if (
    typeof input !== "object" ||
    input === null ||
    !M04_RUNTIME_SCHEMA_NATIVE_DEFINITION_RELATION_AUTHORITY.has(input)
  ) {
    throw new TypeError(
      "runtime schema admission: unresolved or forged native definition relation"
    );
  }
}

/** @internal */
export function bindM04RuntimeSchemaNativeDefinition<
  Schema extends v.GenericSchema
>(input: {
  readonly source: M04RuntimeSchemaNativeDefinitionSource<Schema>;
  readonly definition: NativeContractDefinition<Schema>;
}): M04RuntimeSchemaNativeDefinitionRelation<Schema> {
  exactOwnDataFields(
    input,
    ["source", "definition"],
    "runtime schema native definition relation"
  );
  assertNativeContractDefinitionCarrier(input.definition);
  assertNativeContractDefinitionOriginatesFromSourceRow(
    input.definition,
    input.source
  );
  assertNativeDefinitionWitness(input.definition);
  const coordinate = input.definition.schemaCoordinate;
  const witness = input.definition.projectionWitness;
  if (
    input.source.symbolicSchemaRef.length === 0 ||
    input.source.contractId.length === 0 ||
    input.source.contractVersion.length === 0 ||
    coordinate.contractId !== input.source.contractId ||
    coordinate.contractVersion !== input.source.contractVersion
  ) {
    throw new TypeError(
      "runtime schema native definition relation: source coordinate differs"
    );
  }
  if (input.definition.schema !== input.source.schema) {
    throw new TypeError(
      "runtime schema native definition relation: source schema differs"
    );
  }
  if (
    !stableJsonEquals(witness.sourceLocator, input.source.sourceLocator) ||
    !stableJsonEquals(coordinate.nativeLocator, input.source.sourceLocator) ||
    !stableJsonEquals(witness.namedCheckSource, input.source.namedChecks)
  ) {
    throw new TypeError(
      "runtime schema native definition relation: source witness differs"
    );
  }
  const relation = Object.freeze({
    kind: "m04_runtime_schema_native_definition_relation" as const,
    symbolicSchemaRef: input.source.symbolicSchemaRef,
    contractId: input.source.contractId,
    contractVersion: input.source.contractVersion,
    definition: input.definition
  });
  M04_RUNTIME_SCHEMA_NATIVE_DEFINITION_RELATION_AUTHORITY.add(relation);
  return relation;
}

function capabilityBasis(input: {
  readonly binding: CatalogExecutionBinding;
  readonly row: RuntimeSchemaAdmissionMetadataRow;
  readonly definition: NativeContractDefinition<v.GenericSchema>;
}): RuntimeSchemaAdmissionCapabilityBasis {
  const coordinate = input.definition.schemaCoordinate;
  const witness = input.definition.projectionWitness;
  return constructRuntimeSchemaAdmissionCapabilityBasis({
    kind: "runtime_schema_admission_capability_basis",
    workspaceId: input.binding.workspaceId,
    bindingId: input.binding.bindingId,
    catalogId: input.binding.catalogId,
    resolvedLockRef: input.binding.resolvedLockRef,
    entryRef: input.binding.entryRef,
    declarationRef: input.binding.declarationRef,
    declarationDigest: sha256Digest(
      input.binding.declarationDigest,
      "runtime schema admission declaration digest"
    ),
    ownerRef: input.binding.ownerRef,
    version: input.binding.version,
    moduleRef: input.binding.moduleRef,
    moduleDigest: sha256Digest(
      input.binding.moduleDigest,
      "runtime schema admission module digest"
    ),
    graphFunctionId: input.binding.graphFunctionId,
    graphFunctionDigest: sha256Digest(
      input.binding.graphFunctionDigest,
      "runtime schema admission GraphFunction digest"
    ),
    nodeRef: input.row.nodeRef,
    symbolicSchemaRef: input.row.symbolicSchemaRef,
    nativeSymbol: input.definition.nativeSymbol,
    contractId: coordinate.contractId,
    contractVersion: coordinate.contractVersion,
    contractDigest: sha256Digest(
      coordinate.contractDigest,
      "runtime schema admission contract digest"
    ),
    schemaId: coordinate.schemaId,
    schemaVersion: coordinate.schemaVersion,
    schemaDigest: sha256Digest(
      coordinate.schemaDigest,
      "runtime schema admission schema digest"
    ),
    nativeLocator: coordinate.nativeLocator === null
      ? null
      : admitIJsonValue(coordinate.nativeLocator),
    assetLocator: coordinate.assetLocator === undefined ||
      coordinate.assetLocator === null
      ? null
      : admitIJsonValue(coordinate.assetLocator),
    projectionSourceLocator: admitIJsonValue(witness.sourceLocator),
    sourceModuleDigest: witness.sourceModuleDigest,
    sourceBasisDigest: witness.sourceBasisDigest,
    namedCheckSource: admitIJsonValue(witness.namedCheckSource),
    projectorRef: witness.projectorRef,
    projectorVersion: witness.projectorVersion,
    projectorBasisDigest: witness.projectorBasisDigest,
    projectionDigest: witness.projectionDigest,
    namedChecks: admitIJsonValue(witness.namedChecks),
    witnessDigest: witness.witnessDigest
  });
}

/**
 * M04 is the sole owner of the flat-key/native-definition join. It first
 * admits the complete Module family all-or-nothing, then projects only the
 * selected GraphFunction's capabilities. The returned bases may enter neutral
 * ingress; branded callables remain only in the process-local engine input.
 *
 * @internal
 */
export function projectM04RuntimeSchemaAdmission(input: {
  readonly selectedExecutionBinding: CatalogExecutionBinding;
  readonly nativeDefinitionRelations:
    readonly M04RuntimeSchemaNativeDefinitionRelation<v.GenericSchema>[];
}): M04RuntimeSchemaAdmissionProjection {
  exactOwnDataFields(
    input,
    ["selectedExecutionBinding", "nativeDefinitionRelations"],
    "runtime schema admission projection"
  );
  assertSelectedExecutionBinding(input.selectedExecutionBinding);
  const moduleRows = runtimeSchemaAdmissionMetadataRowsFromModule(
    input.selectedExecutionBinding.module
  );
  assertMetadataRowsExactlyCoverModule(
    input.selectedExecutionBinding.module,
    moduleRows
  );
  const selectedRows = moduleRows.filter(
    (row) =>
      row.graphFunctionId === input.selectedExecutionBinding.graphFunctionId
  );
  const relationsByKey = new Map<
    string,
    M04RuntimeSchemaNativeDefinitionRelation<v.GenericSchema>[]
  >();
  const definitionsByContractKey = new Map<
    string,
    NativeContractDefinition<v.GenericSchema>
  >();
  for (const relation of input.nativeDefinitionRelations) {
    assertM04RuntimeSchemaNativeDefinitionRelation(relation);
    const coordinateKey = contractKey(relation);
    const existingDefinition = definitionsByContractKey.get(coordinateKey);
    if (
      existingDefinition !== undefined &&
      existingDefinition !== relation.definition
    ) {
      throw new TypeError(
        "runtime schema admission: contract key has divergent native definition carrier"
      );
    }
    definitionsByContractKey.set(coordinateKey, relation.definition);
    const key = nativeDefinitionRelationKey(relation);
    const existing = relationsByKey.get(key) ?? [];
    relationsByKey.set(key, [...existing, relation]);
  }
  const requiredRelationKeys = new Set(
    moduleRows.map(nativeDefinitionRelationKey)
  );
  if (
    input.nativeDefinitionRelations.length !== requiredRelationKeys.size ||
    relationsByKey.size !== requiredRelationKeys.size ||
    [...relationsByKey.keys()].some(
      (key) => !requiredRelationKeys.has(key)
    )
  ) {
    throw new TypeError(
      "runtime schema admission: native definition relation family cardinality differs"
    );
  }

  const capabilities = selectedRows.map((row) => {
    const relations =
      relationsByKey.get(nativeDefinitionRelationKey(row)) ?? [];
    const relation = relations[0];
    if (relations.length !== 1 || relation === undefined) {
      throw new TypeError(
        "runtime schema admission: flat symbolic/contract key has no exact definition relation"
      );
    }
    const definition = relation.definition;
    const basis = capabilityBasis({
      binding: input.selectedExecutionBinding,
      row,
      definition
    });
    return constructRuntimeSchemaAdmissionCapability({
      basis,
      admit: (value) =>
        admitIJsonValue(
          admitNative(definition.schema, value),
          `native contract ${contractKey(row)}`
        )
    });
  });
  return Object.freeze({
    kind: "m04_runtime_schema_admission_projection" as const,
    bases: Object.freeze(capabilities.map((capability) => capability.basis)),
    engineInput: constructRuntimeSchemaAdmissionEngineInput(capabilities)
  });
}
