// Implements: T-270 graph-private runtime schema admission.
// The callable is process-local. Only its sealed structural basis may enter
// admitted ingress, digests, replay, or publication.

import {
  admitIJsonValue,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function isSha256Digest(value: string): value is `sha256:${string}` {
  return SHA256_PATTERN.test(value);
}

export const RUNTIME_SCHEMA_ADMISSION_METADATA_KEY =
  "abg.runtime_schema_admission_bindings" as const;

export const RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS = Object.freeze([
  "graphFunctionId",
  "nodeRef",
  "symbolicSchemaRef",
  "contractId",
  "contractVersion"
] as const);

export type RuntimeSchemaAdmissionMetadataField =
  (typeof RUNTIME_SCHEMA_ADMISSION_METADATA_FIELDS)[number];

export type RuntimeSchemaAdmissionMetadataRow = Readonly<{
  [Field in RuntimeSchemaAdmissionMetadataField]: string;
}>;

export interface RuntimeSchemaRequirement {
  readonly graphFunctionId: string;
  readonly nodeRef: string;
  readonly symbolicSchemaRef: string;
}

export interface RuntimeSchemaAdmissionExecutionAuthority {
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly resolvedLockRef: string;
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: `sha256:${string}`;
  readonly ownerRef: string;
  readonly version: string;
  readonly moduleRef: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionId: string;
  readonly graphFunctionDigest: `sha256:${string}`;
}

export interface RuntimeSchemaAdmissionCapabilityBasis
  extends RuntimeSchemaAdmissionExecutionAuthority {
  readonly kind: "runtime_schema_admission_capability_basis";
  readonly nodeRef: string;
  readonly symbolicSchemaRef: string;
  readonly nativeSymbol: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly contractDigest: `sha256:${string}`;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaDigest: `sha256:${string}`;
  readonly nativeLocator: IJsonValue | null;
  readonly assetLocator: IJsonValue | null;
  readonly projectionSourceLocator: IJsonValue;
  readonly sourceModuleDigest: `sha256:${string}`;
  readonly sourceBasisDigest: `sha256:${string}`;
  readonly namedCheckSource: IJsonValue;
  readonly projectorRef: string;
  readonly projectorVersion: string;
  readonly projectorBasisDigest: `sha256:${string}`;
  readonly projectionDigest: `sha256:${string}`;
  readonly namedChecks: IJsonValue;
  readonly witnessDigest: `sha256:${string}`;
  readonly basisDigest: `sha256:${string}`;
}

export type RuntimeSchemaAdmissionCapabilityBasisInput = Omit<
  RuntimeSchemaAdmissionCapabilityBasis,
  "basisDigest"
>;

const RUNTIME_SCHEMA_ADMISSION_CAPABILITY = Symbol(
  "RUNTIME_SCHEMA_ADMISSION_CAPABILITY"
);
const RUNTIME_SCHEMA_ADMISSION_CAPABILITY_AUTHORITY = new WeakSet<object>();

export interface RuntimeSchemaAdmissionCapability {
  readonly [RUNTIME_SCHEMA_ADMISSION_CAPABILITY]: true;
  readonly kind: "runtime_schema_admission_capability";
  readonly basis: RuntimeSchemaAdmissionCapabilityBasis;
  readonly admit: (value: IJsonValue) => IJsonValue;
}

export interface RuntimeSchemaAdmissionEngineInput {
  readonly kind: "runtime_schema_admission_engine_input";
  readonly capabilities: readonly RuntimeSchemaAdmissionCapability[];
}

const BASIS_FIELDS = Object.freeze([
  "kind",
  "workspaceId",
  "bindingId",
  "catalogId",
  "resolvedLockRef",
  "entryRef",
  "declarationRef",
  "declarationDigest",
  "ownerRef",
  "version",
  "moduleRef",
  "moduleDigest",
  "graphFunctionId",
  "graphFunctionDigest",
  "nodeRef",
  "symbolicSchemaRef",
  "nativeSymbol",
  "contractId",
  "contractVersion",
  "contractDigest",
  "schemaId",
  "schemaVersion",
  "schemaDigest",
  "nativeLocator",
  "assetLocator",
  "projectionSourceLocator",
  "sourceModuleDigest",
  "sourceBasisDigest",
  "namedCheckSource",
  "projectorRef",
  "projectorVersion",
  "projectorBasisDigest",
  "projectionDigest",
  "namedChecks",
  "witnessDigest",
  "basisDigest"
] as const);
const BASIS_INPUT_FIELDS = Object.freeze(
  BASIS_FIELDS.filter((field) => field !== "basisDigest")
);

const BASIS_TEXT_FIELDS = Object.freeze([
  "workspaceId",
  "bindingId",
  "catalogId",
  "resolvedLockRef",
  "entryRef",
  "declarationRef",
  "ownerRef",
  "version",
  "moduleRef",
  "graphFunctionId",
  "nodeRef",
  "symbolicSchemaRef",
  "nativeSymbol",
  "contractId",
  "contractVersion",
  "schemaId",
  "schemaVersion",
  "projectorRef",
  "projectorVersion"
] as const);

const BASIS_DIGEST_FIELDS = Object.freeze([
  "declarationDigest",
  "moduleDigest",
  "graphFunctionDigest",
  "contractDigest",
  "schemaDigest",
  "sourceModuleDigest",
  "sourceBasisDigest",
  "projectorBasisDigest",
  "projectionDigest",
  "witnessDigest",
  "basisDigest"
] as const);

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

function requireText(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`runtime schema capability basis.${key}: expected text`);
  }
  return value;
}

function requireDigest(
  input: Record<string, unknown>,
  key: string
): `sha256:${string}` {
  const value = requireText(input, key);
  if (!isSha256Digest(value)) {
    throw new TypeError(
      `runtime schema capability basis.${key}: expected sha256 digest`
    );
  }
  return value;
}

function basisWithoutDigest(
  input: RuntimeSchemaAdmissionCapabilityBasisInput
): RuntimeSchemaAdmissionCapabilityBasisInput {
  return Object.freeze({
    kind: input.kind,
    workspaceId: input.workspaceId,
    bindingId: input.bindingId,
    catalogId: input.catalogId,
    resolvedLockRef: input.resolvedLockRef,
    entryRef: input.entryRef,
    declarationRef: input.declarationRef,
    declarationDigest: input.declarationDigest,
    ownerRef: input.ownerRef,
    version: input.version,
    moduleRef: input.moduleRef,
    moduleDigest: input.moduleDigest,
    graphFunctionId: input.graphFunctionId,
    graphFunctionDigest: input.graphFunctionDigest,
    nodeRef: input.nodeRef,
    symbolicSchemaRef: input.symbolicSchemaRef,
    nativeSymbol: input.nativeSymbol,
    contractId: input.contractId,
    contractVersion: input.contractVersion,
    contractDigest: input.contractDigest,
    schemaId: input.schemaId,
    schemaVersion: input.schemaVersion,
    schemaDigest: input.schemaDigest,
    nativeLocator: input.nativeLocator,
    assetLocator: input.assetLocator,
    projectionSourceLocator: input.projectionSourceLocator,
    sourceModuleDigest: input.sourceModuleDigest,
    sourceBasisDigest: input.sourceBasisDigest,
    namedCheckSource: input.namedCheckSource,
    projectorRef: input.projectorRef,
    projectorVersion: input.projectorVersion,
    projectorBasisDigest: input.projectorBasisDigest,
    projectionDigest: input.projectionDigest,
    namedChecks: input.namedChecks,
    witnessDigest: input.witnessDigest
  });
}

export function runtimeSchemaAdmissionCapabilityBasisDigest(
  input: RuntimeSchemaAdmissionCapabilityBasisInput
): `sha256:${string}` {
  return stableSha256Digest(basisWithoutDigest(input));
}

export function constructRuntimeSchemaAdmissionCapabilityBasis(
  input: RuntimeSchemaAdmissionCapabilityBasisInput
): RuntimeSchemaAdmissionCapabilityBasis {
  exactOwnDataFields(
    input,
    BASIS_INPUT_FIELDS,
    "runtime schema capability basis constructor"
  );
  const canonical = basisWithoutDigest(input);
  return admitRuntimeSchemaAdmissionCapabilityBasis({
    ...canonical,
    basisDigest: runtimeSchemaAdmissionCapabilityBasisDigest(canonical)
  });
}

export function admitRuntimeSchemaAdmissionCapabilityBasis(
  input: unknown
): RuntimeSchemaAdmissionCapabilityBasis {
  exactOwnDataFields(input, BASIS_FIELDS, "runtime schema capability basis");
  if (input["kind"] !== "runtime_schema_admission_capability_basis") {
    throw new TypeError("runtime schema capability basis.kind differs");
  }
  for (const field of BASIS_TEXT_FIELDS) {
    requireText(input, field);
  }
  for (const field of BASIS_DIGEST_FIELDS) {
    requireDigest(input, field);
  }
  const canonical = Object.freeze({
    kind: "runtime_schema_admission_capability_basis" as const,
    workspaceId: requireText(input, "workspaceId"),
    bindingId: requireText(input, "bindingId"),
    catalogId: requireText(input, "catalogId"),
    resolvedLockRef: requireText(input, "resolvedLockRef"),
    entryRef: requireText(input, "entryRef"),
    declarationRef: requireText(input, "declarationRef"),
    declarationDigest: requireDigest(input, "declarationDigest"),
    ownerRef: requireText(input, "ownerRef"),
    version: requireText(input, "version"),
    moduleRef: requireText(input, "moduleRef"),
    moduleDigest: requireDigest(input, "moduleDigest"),
    graphFunctionId: requireText(input, "graphFunctionId"),
    graphFunctionDigest: requireDigest(input, "graphFunctionDigest"),
    nodeRef: requireText(input, "nodeRef"),
    symbolicSchemaRef: requireText(input, "symbolicSchemaRef"),
    nativeSymbol: requireText(input, "nativeSymbol"),
    contractId: requireText(input, "contractId"),
    contractVersion: requireText(input, "contractVersion"),
    contractDigest: requireDigest(input, "contractDigest"),
    schemaId: requireText(input, "schemaId"),
    schemaVersion: requireText(input, "schemaVersion"),
    schemaDigest: requireDigest(input, "schemaDigest"),
    nativeLocator: input["nativeLocator"] === null
      ? null
      : admitIJsonValue(input["nativeLocator"], "basis.nativeLocator"),
    assetLocator: input["assetLocator"] === null
      ? null
      : admitIJsonValue(input["assetLocator"], "basis.assetLocator"),
    projectionSourceLocator: admitIJsonValue(
      input["projectionSourceLocator"],
      "basis.projectionSourceLocator"
    ),
    sourceModuleDigest: requireDigest(input, "sourceModuleDigest"),
    sourceBasisDigest: requireDigest(input, "sourceBasisDigest"),
    namedCheckSource: admitIJsonValue(
      input["namedCheckSource"],
      "basis.namedCheckSource"
    ),
    projectorRef: requireText(input, "projectorRef"),
    projectorVersion: requireText(input, "projectorVersion"),
    projectorBasisDigest: requireDigest(input, "projectorBasisDigest"),
    projectionDigest: requireDigest(input, "projectionDigest"),
    namedChecks: admitIJsonValue(input["namedChecks"], "basis.namedChecks"),
    witnessDigest: requireDigest(input, "witnessDigest"),
    basisDigest: requireDigest(input, "basisDigest")
  });
  const { basisDigest, ...unsealed } = canonical;
  if (
    basisDigest !==
    runtimeSchemaAdmissionCapabilityBasisDigest(unsealed)
  ) {
    throw new TypeError("runtime schema capability basis digest differs");
  }
  return canonical;
}

export function constructRuntimeSchemaAdmissionCapability(input: {
  readonly basis: RuntimeSchemaAdmissionCapabilityBasis;
  readonly admit: (value: IJsonValue) => IJsonValue;
}): RuntimeSchemaAdmissionCapability {
  exactOwnDataFields(
    input,
    ["basis", "admit"],
    "runtime schema capability constructor"
  );
  const basis = admitRuntimeSchemaAdmissionCapabilityBasis(input.basis);
  if (typeof input.admit !== "function") {
    throw new TypeError("runtime schema capability constructor.admit differs");
  }
  const capability: RuntimeSchemaAdmissionCapability = Object.freeze({
    [RUNTIME_SCHEMA_ADMISSION_CAPABILITY]: true as const,
    kind: "runtime_schema_admission_capability" as const,
    basis,
    admit: (value: IJsonValue) =>
      admitIJsonValue(
        input.admit(admitIJsonValue(value, "runtime schema candidate")),
        "runtime schema admitted value"
      )
  });
  RUNTIME_SCHEMA_ADMISSION_CAPABILITY_AUTHORITY.add(capability);
  return capability;
}

export function assertRuntimeSchemaAdmissionCapability(
  value: unknown
): asserts value is RuntimeSchemaAdmissionCapability {
  if (
    typeof value !== "object" ||
    value === null ||
    !RUNTIME_SCHEMA_ADMISSION_CAPABILITY_AUTHORITY.has(value) ||
    Reflect.get(value, RUNTIME_SCHEMA_ADMISSION_CAPABILITY) !== true
  ) {
    throw new TypeError("runtime schema capability is unresolved or forged");
  }
}

export function constructRuntimeSchemaAdmissionEngineInput(
  capabilities: readonly RuntimeSchemaAdmissionCapability[]
): RuntimeSchemaAdmissionEngineInput {
  for (const capability of capabilities) {
    assertRuntimeSchemaAdmissionCapability(capability);
  }
  return Object.freeze({
    kind: "runtime_schema_admission_engine_input" as const,
    capabilities: Object.freeze([...capabilities])
  });
}

function requirementKey(input: RuntimeSchemaRequirement): string {
  return `${input.graphFunctionId}\u0000${input.nodeRef}\u0000${input.symbolicSchemaRef}`;
}

function authorityDiffers(
  basis: RuntimeSchemaAdmissionCapabilityBasis,
  authority: RuntimeSchemaAdmissionExecutionAuthority
): boolean {
  return (
    basis.workspaceId !== authority.workspaceId ||
    basis.bindingId !== authority.bindingId ||
    basis.catalogId !== authority.catalogId ||
    basis.resolvedLockRef !== authority.resolvedLockRef ||
    basis.entryRef !== authority.entryRef ||
    basis.declarationRef !== authority.declarationRef ||
    basis.declarationDigest !== authority.declarationDigest ||
    basis.ownerRef !== authority.ownerRef ||
    basis.version !== authority.version ||
    basis.moduleRef !== authority.moduleRef ||
    basis.moduleDigest !== authority.moduleDigest ||
    basis.graphFunctionId !== authority.graphFunctionId ||
    basis.graphFunctionDigest !== authority.graphFunctionDigest
  );
}

export function resolveRuntimeSchemaAdmissionCapabilities(input: {
  readonly requirements: readonly RuntimeSchemaRequirement[];
  readonly authority: RuntimeSchemaAdmissionExecutionAuthority;
  readonly admittedBases: readonly RuntimeSchemaAdmissionCapabilityBasis[];
  readonly engineInput: RuntimeSchemaAdmissionEngineInput;
}): readonly RuntimeSchemaAdmissionCapability[] {
  exactOwnDataFields(
    input,
    ["requirements", "authority", "admittedBases", "engineInput"],
    "runtime schema capability resolution"
  );
  exactOwnDataFields(
    input.engineInput,
    ["kind", "capabilities"],
    "runtime schema capability engine input"
  );
  if (
    input.engineInput.kind !== "runtime_schema_admission_engine_input" ||
    input.requirements.length === 0 ||
    input.requirements.length !== input.admittedBases.length ||
    input.requirements.length !== input.engineInput.capabilities.length
  ) {
    throw new TypeError("runtime schema capability family cardinality differs");
  }
  for (const requirement of input.requirements) {
    exactOwnDataFields(
      requirement,
      ["graphFunctionId", "nodeRef", "symbolicSchemaRef"],
      "runtime schema requirement"
    );
  }
  const requirementKeys = input.requirements.map(requirementKey);
  if (
    new Set(requirementKeys).size !== requirementKeys.length ||
    new Set(input.admittedBases.map((basis) => requirementKey(basis))).size !==
      input.admittedBases.length
  ) {
    throw new TypeError("runtime schema capability requirement is ambiguous");
  }

  const capabilitiesByKey = new Map<
    string,
    RuntimeSchemaAdmissionCapability[]
  >();
  for (const capability of input.engineInput.capabilities) {
    assertRuntimeSchemaAdmissionCapability(capability);
    const key = requirementKey(capability.basis);
    const existing = capabilitiesByKey.get(key) ?? [];
    capabilitiesByKey.set(key, [...existing, capability]);
  }
  const basesByKey = new Map(
    input.admittedBases.map((rawBasis) => {
      const basis = admitRuntimeSchemaAdmissionCapabilityBasis(rawBasis);
      if (authorityDiffers(basis, input.authority)) {
        throw new TypeError("runtime schema capability authority differs");
      }
      return [requirementKey(basis), basis] as const;
    })
  );

  const resolved = input.requirements.map((requirement) => {
    if (
      requirement.graphFunctionId.length === 0 ||
      requirement.nodeRef.length === 0 ||
      requirement.symbolicSchemaRef.length === 0 ||
      requirement.graphFunctionId !== input.authority.graphFunctionId
    ) {
      throw new TypeError("runtime schema capability requirement differs");
    }
    const key = requirementKey(requirement);
    const basis = basesByKey.get(key);
    const capabilities = capabilitiesByKey.get(key) ?? [];
    const capability = capabilities[0];
    if (
      basis === undefined ||
      capabilities.length !== 1 ||
      capability === undefined ||
      !stableJsonEquals(capability.basis, basis)
    ) {
      throw new TypeError("runtime schema capability exact match differs");
    }
    return capability;
  });
  if (
    resolved.length !== basesByKey.size ||
    resolved.length !== capabilitiesByKey.size
  ) {
    throw new TypeError("runtime schema capability family contains extras");
  }
  return Object.freeze(resolved);
}

export function admitGraphPrivateTargetValue(input: {
  readonly capability: RuntimeSchemaAdmissionCapability;
  readonly candidate: IJsonValue;
}): IJsonValue {
  assertRuntimeSchemaAdmissionCapability(input.capability);
  return input.capability.admit(input.candidate);
}
