// Implements: T-270 M04 ownership of graph-private native schema delivery.

import type * as v from "valibot";

import {
  constructRuntimeSchemaAdmissionCapability,
  constructRuntimeSchemaAdmissionCapabilityBasis,
  constructRuntimeSchemaAdmissionEngineInput,
  RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS,
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
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
import {
  admitNative,
  assertNativeContractDefinitionCarrier,
  type NativeContractDefinition
} from "./native_contract_phase_a.js";

export interface M04RuntimeSchemaAdmissionProjection {
  readonly kind: "m04_runtime_schema_admission_projection";
  readonly bases: readonly RuntimeSchemaAdmissionCapabilityBasis[];
  readonly engineInput: RuntimeSchemaAdmissionEngineInput;
}

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

function metadataRowKey(input: RuntimeSchemaAdmissionMetadataRow): string {
  return `${input.graphFunctionId}\u0000${input.nodeRef}\u0000${input.symbolicSchemaRef}`;
}

function contractKey(input: {
  readonly contractId: string;
  readonly contractVersion: string;
}): string {
  return `${input.contractId}@${input.contractVersion}`;
}

export function admitM04RuntimeSchemaAdmissionMetadataRows(
  input: unknown
): readonly RuntimeSchemaAdmissionMetadataRow[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new TypeError(
      "runtime schema admission metadata: expected a nonempty row array"
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
  const rowKeys = rows.map(metadataRowKey);
  if (new Set(rowKeys).size !== rows.length) {
    throw new TypeError(
      "runtime schema admission metadata: duplicate row key"
    );
  }
  const expectedOrder = [...rowKeys].sort();
  if (!stableJsonEquals(rowKeys, expectedOrder)) {
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

function assertMetadataRowsBelongToModule(
  module: Module,
  rows: readonly RuntimeSchemaAdmissionMetadataRow[]
): void {
  for (const row of rows) {
    const graphFunctions = module.graphFunctions.filter(
      (graphFunction) => graphFunction.id === row.graphFunctionId
    );
    const graphFunction = graphFunctions[0];
    if (graphFunctions.length !== 1 || graphFunction === undefined) {
      throw new TypeError(
        "runtime schema admission metadata: GraphFunction is outside or ambiguous in Module"
      );
    }
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
    const nodesById = new Map<
      string,
      (typeof containedNodes)[number]
    >();
    for (const node of containedNodes) {
      const existing = nodesById.get(node.id);
      if (existing !== undefined && !stableJsonEquals(existing, node)) {
        throw new TypeError(
          "runtime schema admission metadata: contained Node identity differs"
        );
      }
      nodesById.set(node.id, node);
    }
    const node = nodesById.get(row.nodeRef);
    if (node === undefined) {
      throw new TypeError(
        "runtime schema admission metadata: Node is outside GraphFunction containment"
      );
    }
    if (node.schema.ref !== row.symbolicSchemaRef) {
      throw new TypeError(
        "runtime schema admission metadata: symbolic schema ref differs from Node"
      );
    }
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
  readonly nativeDefinitions:
    readonly NativeContractDefinition<v.GenericSchema>[];
}): M04RuntimeSchemaAdmissionProjection {
  exactOwnDataFields(
    input,
    ["selectedExecutionBinding", "nativeDefinitions"],
    "runtime schema admission projection"
  );
  assertSelectedExecutionBinding(input.selectedExecutionBinding);
  const moduleRows = runtimeSchemaAdmissionMetadataRowsFromModule(
    input.selectedExecutionBinding.module
  );
  assertMetadataRowsBelongToModule(
    input.selectedExecutionBinding.module,
    moduleRows
  );
  const selectedRows = moduleRows.filter(
    (row) => row.graphFunctionId === input.selectedExecutionBinding.graphFunctionId
  );
  if (selectedRows.length === 0) {
    throw new TypeError(
      "runtime schema admission: selected GraphFunction has no metadata rows"
    );
  }
  const definitionsByKey = new Map<
    string,
    NativeContractDefinition<v.GenericSchema>[]
  >();
  for (const definition of input.nativeDefinitions) {
    assertNativeContractDefinitionCarrier(definition);
    assertNativeDefinitionWitness(definition);
    const key = contractKey(definition.schemaCoordinate);
    const existing = definitionsByKey.get(key) ?? [];
    definitionsByKey.set(key, [...existing, definition]);
  }
  const requiredContractKeys = new Set(moduleRows.map(contractKey));
  if (
    input.nativeDefinitions.length !== requiredContractKeys.size ||
    definitionsByKey.size !== requiredContractKeys.size ||
    [...definitionsByKey.keys()].some(
      (key) => !requiredContractKeys.has(key)
    )
  ) {
    throw new TypeError(
      "runtime schema admission: native definition family cardinality differs"
    );
  }

  const capabilities = selectedRows.map((row) => {
    const definitions = definitionsByKey.get(contractKey(row)) ?? [];
    const definition = definitions[0];
    if (definitions.length !== 1 || definition === undefined) {
      throw new TypeError(
        "runtime schema admission: flat contract key has no exact definition"
      );
    }
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
