// Implements: T-270 AF-15 neutral execution-ingress projection.
// M04 admits native public packets and reduces them to this payload-free M03
// carrier. Selection remains with AF-13/AF-14.

import type { ExecutionBasis } from "./carriers.js";
import {
  admitIJsonValue,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import type { AdmittedInvocationCarrierSet } from "./declared_execution_context.js";
import {
  admitRuntimeSchemaAdmissionCapabilityBasis,
  type RuntimeSchemaAdmissionCapabilityBasis
} from "./runtime_schema_admission.js";

export const T270_RUNTIME_COMPATIBILITY_GAP =
  "gap://abg/t270/runtime-policy-steering-capability-rejoin";

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

const RUN_INVOKE_EXECUTION_INGRESS = Symbol(
  "RUN_INVOKE_EXECUTION_INGRESS"
);

export interface RunInvokeSerializedInputContract {
  readonly owningProductId: string;
  readonly owningProductVersion: string;
  readonly productManifestDigest: string;
  readonly publicContractCatalogId: string;
  readonly publicContractCatalogVersion: string;
  readonly publicContractCatalogDigest: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly contractDigest: string;
  readonly sourceInterface: readonly Readonly<{
    readonly nodeRef: string;
    readonly schemaRef: string;
  }>[];
  readonly asset: Readonly<{
    relativePath: string;
    mediaType: string;
    schemaId: string;
    schemaVersion: string;
    digest: string;
  }>;
}

export interface InstalledPublicSchemaAuthority {
  readonly kind: "installed_public_schema_authority";
  readonly owningProductId: string;
  readonly owningProductVersion: string;
  readonly publicContractCatalogId: string;
  readonly contractId: string;
  readonly contractDigest: `sha256:${string}`;
  readonly publicSchemaId: string;
  readonly publicSchemaVersion: string;
  readonly assetRelativePath: string;
  readonly assetDigest: `sha256:${string}`;
  readonly schema: IJsonValue;
}

export interface InstalledPublicSchemaAuthoritySet {
  readonly kind: "installed_public_schema_authority_set";
  readonly schemas: readonly InstalledPublicSchemaAuthority[];
  readonly schemaSetDigest: `sha256:${string}`;
}

export interface RunInvokeSelectedExecution {
  readonly selectedEntryRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly selectedExecutionBindingDigest: `sha256:${string}`;
  readonly nextActionRef: string;
  readonly nextActionDigest: `sha256:${string}`;
  readonly intentAdmissionRef: string;
  readonly intentAdmissionDigest: `sha256:${string}`;
}

export type RunInvokeConstraint =
  | Readonly<{
      kind: "exact_graph_function_constraint";
      inputContract: RunInvokeSerializedInputContract;
      inputPayloadRef: string;
      inputPayloadDigest: string;
    }>
  | Readonly<{
      kind: "start_constraints";
      scopeRef: string;
      scopeDigest: string;
      targetKind: "next" | "graph_function" | "asset";
      targetHandle: string | null;
      until: "first_traversal" | "blocked" | "converged";
      fhMode: "direct" | "human-proxy";
      rootMode: "direct" | "supervised";
    }>;

export interface RunInvokeExecutionIngressBasis {
  readonly authorityClass: "subordinate_rejoin_only";
  readonly variant: "invoke" | "start";
  readonly definitionDigest: string;
  readonly invocation: Readonly<{
    ref: string;
    digest: string;
    authorityRef: string;
    authorityDigest: string;
    witnessDigest: string;
  }>;
  readonly workspace: Readonly<{
    bindingRef: string;
    bindingDigest: string;
    workspaceId: string;
    workspaceRoot: string;
  }>;
  readonly catalog: Readonly<{
    basisRef: string;
    catalogId: string;
    resolvedLockRef: string;
    viewRef: string;
    viewDigest: string;
    allowedEntryRefs: readonly string[];
  }>;
  readonly program: Readonly<{
    ref: string;
    digest: string;
  }>;
  readonly constraint: RunInvokeConstraint;
  readonly selectedExecution: RunInvokeSelectedExecution;
  readonly admittedInputCarriers: AdmittedInvocationCarrierSet | null;
  readonly installedPublicInputSchemas:
    InstalledPublicSchemaAuthoritySet | null;
  readonly invocationAuthority: Readonly<{
    authorityBasisRef: string;
    authorityBasisDigest: string;
    actor: Readonly<{
      actorRef: string;
      attributionRef: string;
      attributionDigest: string;
    }>;
    capabilityGrants: readonly Readonly<{
      kind: "capability_grant";
      grantRef: string;
      grantDigest: string;
      capabilityId: string;
      capabilityDefinitionRef: string;
      capabilityDefinitionDigest: string;
      actorRef: string;
      approvalRef: string;
      policyRef: string;
      scopeRef: string;
      scopeDigest: string;
      authorityBasisRef: string;
      authorityBasisDigest: string;
    }>[];
    invocationPolicy: Readonly<{
      policyRef: string;
      policyDigest: string;
      sessionPolicyRef: string;
      sessionPolicyDigest: string;
    }>;
    transportSteering: Readonly<{
      steeringRef: string;
      steeringDigest: string;
      provenanceRefs: readonly string[];
    }>;
    compatibilityState: "pending_af15_rejoin";
    compatibilityGapRef: typeof T270_RUNTIME_COMPATIBILITY_GAP;
  }>;
  readonly runtimeProfile: Readonly<{
    profileDigest: string;
    runtimeIdentity: ExecutionBasis["runtimeIdentity"];
    resolvedPolicy: ExecutionBasis["resolvedPolicy"];
    standardPluginRefs: readonly string[];
  }>;
  readonly schemaAdmissionCapabilityBases:
    readonly RuntimeSchemaAdmissionCapabilityBasis[];
  readonly sourceWitnessRefs: readonly string[];
}

export interface AdmittedRunInvokeExecutionIngress
  extends RunInvokeExecutionIngressBasis {
  readonly [RUN_INVOKE_EXECUTION_INGRESS]: true;
  readonly kind: "admitted_run_invoke_execution_ingress";
  readonly ingressRef: string;
  readonly ingressDigest: `sha256:${string}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(`${label}: expected an object`);
  }
  return value;
}

function requireArray(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label}: expected an array`);
  }
  return value;
}

function assertFreezableBasis(
  value: unknown
): asserts value is RunInvokeExecutionIngressBasis {
  const input = requireRecord(value, "run.invoke execution ingress");
  requireRecord(input["invocation"], "run.invoke invocation");
  requireRecord(input["workspace"], "run.invoke workspace");
  const catalog = requireRecord(input["catalog"], "run.invoke catalog");
  requireArray(
    catalog["allowedEntryRefs"],
    "run.invoke catalog.allowedEntryRefs"
  );
  requireRecord(input["program"], "run.invoke program");
  const constraint = requireRecord(
    input["constraint"],
    "run.invoke constraint"
  );
  if (constraint["kind"] === "exact_graph_function_constraint") {
    const contract = requireRecord(
      constraint["inputContract"],
      "run.invoke inputContract"
    );
    const sourceInterface = requireArray(
      contract["sourceInterface"],
      "run.invoke inputContract.sourceInterface"
    );
    sourceInterface.forEach((row, index) =>
      requireRecord(row, `run.invoke sourceInterface[${String(index)}]`)
    );
    requireRecord(contract["asset"], "run.invoke inputContract.asset");
  }
  requireRecord(input["selectedExecution"], "run.invoke selectedExecution");
  const authority = requireRecord(
    input["invocationAuthority"],
    "run.invoke invocationAuthority"
  );
  requireRecord(authority["actor"], "run.invoke invocationAuthority.actor");
  requireArray(
    authority["capabilityGrants"],
    "run.invoke invocationAuthority.capabilityGrants"
  );
  requireRecord(
    authority["invocationPolicy"],
    "run.invoke invocationAuthority.invocationPolicy"
  );
  const steering = requireRecord(
    authority["transportSteering"],
    "run.invoke invocationAuthority.transportSteering"
  );
  requireArray(
    steering["provenanceRefs"],
    "run.invoke invocationAuthority.transportSteering.provenanceRefs"
  );
  const runtimeProfile = requireRecord(
    input["runtimeProfile"],
    "run.invoke runtimeProfile"
  );
  requireRecord(
    runtimeProfile["runtimeIdentity"],
    "run.invoke runtimeProfile.runtimeIdentity"
  );
  requireRecord(
    runtimeProfile["resolvedPolicy"],
    "run.invoke runtimeProfile.resolvedPolicy"
  );
  requireArray(
    runtimeProfile["standardPluginRefs"],
    "run.invoke runtimeProfile.standardPluginRefs"
  );
  requireArray(
    input["schemaAdmissionCapabilityBases"],
    "run.invoke schemaAdmissionCapabilityBases"
  );
  requireArray(input["sourceWitnessRefs"], "run.invoke sourceWitnessRefs");
  if (input["admittedInputCarriers"] !== null) {
    const carrierSet = requireRecord(
      input["admittedInputCarriers"],
      "run.invoke admittedInputCarriers"
    );
    const carriers = requireArray(
      carrierSet["carriers"],
      "run.invoke admittedInputCarriers.carriers"
    );
    carriers.forEach((carrier, index) =>
      requireRecord(carrier, `run.invoke carrier[${String(index)}]`)
    );
  }
  if (input["installedPublicInputSchemas"] !== null) {
    const schemaSet = requireRecord(
      input["installedPublicInputSchemas"],
      "run.invoke installedPublicInputSchemas"
    );
    const schemas = requireArray(
      schemaSet["schemas"],
      "run.invoke installedPublicInputSchemas.schemas"
    );
    schemas.forEach((schema, index) =>
      requireRecord(schema, `run.invoke public schema[${String(index)}]`)
    );
  }
}

function freezeConstraint(input: RunInvokeConstraint): RunInvokeConstraint {
  return input.kind === "exact_graph_function_constraint"
    ? Object.freeze({
        ...input,
        inputContract: Object.freeze({
          ...input.inputContract,
          sourceInterface: Object.freeze(
            input.inputContract.sourceInterface.map((row) =>
              Object.freeze({ ...row })
            )
          ),
          asset: Object.freeze({ ...input.inputContract.asset })
        })
      })
    : Object.freeze({ ...input });
}

function freezeAdmittedInputCarriers(
  input: AdmittedInvocationCarrierSet | null
): AdmittedInvocationCarrierSet | null {
  if (input === null) {
    return null;
  }
  return Object.freeze({
    ...input,
    carriers: Object.freeze(
      input.carriers.map((carrier) =>
        Object.freeze({
          ...carrier,
          value: admitIJsonValue(carrier.value)
        })
      )
    )
  });
}

function freezeInstalledPublicInputSchemas(
  input: InstalledPublicSchemaAuthoritySet | null
): InstalledPublicSchemaAuthoritySet | null {
  if (input === null) {
    return null;
  }
  return Object.freeze({
    ...input,
    schemas: Object.freeze(
      input.schemas.map((schema) =>
        Object.freeze({
          ...schema,
          schema: admitIJsonValue(schema.schema)
        })
      )
    )
  });
}

function freezeBasis(
  input: RunInvokeExecutionIngressBasis
): RunInvokeExecutionIngressBasis {
  return Object.freeze({
    authorityClass: input.authorityClass,
    variant: input.variant,
    definitionDigest: input.definitionDigest,
    invocation: Object.freeze({ ...input.invocation }),
    workspace: Object.freeze({ ...input.workspace }),
    catalog: Object.freeze({
      ...input.catalog,
      allowedEntryRefs: Object.freeze([...input.catalog.allowedEntryRefs])
    }),
    program: Object.freeze({ ...input.program }),
    constraint: freezeConstraint(input.constraint),
    selectedExecution: Object.freeze({ ...input.selectedExecution }),
    admittedInputCarriers: freezeAdmittedInputCarriers(
      input.admittedInputCarriers
    ),
    installedPublicInputSchemas: freezeInstalledPublicInputSchemas(
      input.installedPublicInputSchemas
    ),
    invocationAuthority: Object.freeze({
      ...input.invocationAuthority,
      actor: Object.freeze({ ...input.invocationAuthority.actor }),
      capabilityGrants: Object.freeze(
        input.invocationAuthority.capabilityGrants.map((grant) =>
          Object.freeze({ ...grant })
        )
      ),
      invocationPolicy: Object.freeze({
        ...input.invocationAuthority.invocationPolicy
      }),
      transportSteering: Object.freeze({
        ...input.invocationAuthority.transportSteering,
        provenanceRefs: Object.freeze([
          ...input.invocationAuthority.transportSteering.provenanceRefs
        ])
      })
    }),
    runtimeProfile: Object.freeze({
      ...input.runtimeProfile,
      runtimeIdentity: Object.freeze({ ...input.runtimeProfile.runtimeIdentity }),
      resolvedPolicy: Object.freeze({ ...input.runtimeProfile.resolvedPolicy }),
      standardPluginRefs: Object.freeze([
        ...input.runtimeProfile.standardPluginRefs
      ])
    }),
    schemaAdmissionCapabilityBases: Object.freeze(
      input.schemaAdmissionCapabilityBases.map((basis) =>
        admitRuntimeSchemaAdmissionCapabilityBasis(basis)
      )
    ),
    sourceWitnessRefs: Object.freeze([...input.sourceWitnessRefs])
  });
}

function assertConstraint(input: RunInvokeExecutionIngressBasis): void {
  if (input.variant === "invoke") {
    const sourceInterface = input.constraint.kind ===
      "exact_graph_function_constraint"
      ? input.constraint.inputContract.sourceInterface
      : [];
    if (
      input.constraint.kind !== "exact_graph_function_constraint" ||
      input.catalog.allowedEntryRefs.length === 0 ||
      !isNonEmptyString(input.constraint.inputPayloadRef) ||
      !isSha256Digest(input.constraint.inputPayloadDigest) ||
      sourceInterface.length !== 1 ||
      sourceInterface.some(
        (row) =>
          !isNonEmptyString(row.nodeRef) ||
          !isNonEmptyString(row.schemaRef)
      ) ||
      [
        "graphFunctionRef",
        "graphFunctionDigest",
        "selectedEntryRef",
        "selectedExecutionBindingDigest",
        "payloadAdmissionState",
        "payloadAdmissionGapRef"
      ].some((field) => Object.hasOwn(input.constraint, field))
    ) {
      throw new TypeError("run.invoke exact function constraint is incomplete");
    }
    return;
  }
  if (
    input.constraint.kind !== "start_constraints" ||
    (input.constraint.targetKind === "next" &&
      input.constraint.targetHandle !== null) ||
    (input.constraint.targetKind !== "next" &&
      input.constraint.targetHandle === null)
  ) {
    throw new TypeError("run.invoke start target projection differs");
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isSha256Digest(value: unknown): value is `sha256:${string}` {
  return typeof value === "string" && SHA256_PATTERN.test(value);
}

function assertSelectedExecution(input: RunInvokeSelectedExecution): void {
  const fields = Object.keys(input).sort();
  if (
    !stableJsonEquals(fields, [
      "graphFunctionDigest",
      "graphFunctionRef",
      "intentAdmissionDigest",
      "intentAdmissionRef",
      "nextActionDigest",
      "nextActionRef",
      "selectedEntryRef",
      "selectedExecutionBindingDigest"
    ]) ||
    !isNonEmptyString(input.selectedEntryRef) ||
    !isNonEmptyString(input.graphFunctionRef) ||
    !isSha256Digest(input.graphFunctionDigest) ||
    !isSha256Digest(input.selectedExecutionBindingDigest) ||
    !isNonEmptyString(input.nextActionRef) ||
    !isSha256Digest(input.nextActionDigest) ||
    !isNonEmptyString(input.intentAdmissionRef) ||
    !isSha256Digest(input.intentAdmissionDigest)
  ) {
    throw new TypeError(
      "run.invoke post-AF-14 selected execution basis is incomplete"
    );
  }
}

function assertInvokeRootAdmission(
  input: RunInvokeExecutionIngressBasis
): void {
  if (input.variant === "start") {
    if (
      input.admittedInputCarriers !== null ||
      input.installedPublicInputSchemas !== null
    ) {
      throw new TypeError("run.invoke start carries public root admission");
    }
    return;
  }
  if (
    input.constraint.kind !== "exact_graph_function_constraint" ||
    input.admittedInputCarriers === null ||
    input.installedPublicInputSchemas === null
  ) {
    throw new TypeError("run.invoke root admission is incomplete");
  }
  const carriers = input.admittedInputCarriers;
  const schemas = input.installedPublicInputSchemas;
  const carrier = carriers.carriers[0];
  const schema = schemas.schemas[0];
  const source = input.constraint.inputContract.sourceInterface[0];
  if (
    carriers.kind !== "admitted_invocation_carrier_set" ||
    carriers.carriers.length !== 1 ||
    carrier === undefined ||
    source === undefined ||
    carrier.kind !== "admitted_invocation_carrier" ||
    carrier.sourceNodeRef !== source.nodeRef ||
    carrier.schemaRef !== source.schemaRef ||
    carrier.carrierRef !== input.constraint.inputPayloadRef ||
    carrier.carrierDigest !== input.constraint.inputPayloadDigest ||
    carrier.carrierDigest !== stableSha256Digest(carrier.value) ||
    !isNonEmptyString(carrier.admissionRef) ||
    carriers.carrierSetDigest !== stableSha256Digest(carriers.carriers) ||
    schemas.kind !== "installed_public_schema_authority_set" ||
    schemas.schemas.length !== 1 ||
    schema === undefined ||
    schema.kind !== "installed_public_schema_authority" ||
    schema.owningProductId !==
      input.constraint.inputContract.owningProductId ||
    schema.owningProductVersion !==
      input.constraint.inputContract.owningProductVersion ||
    schema.publicContractCatalogId !==
      input.constraint.inputContract.publicContractCatalogId ||
    schema.contractId !== input.constraint.inputContract.contractId ||
    schema.contractDigest !== input.constraint.inputContract.contractDigest ||
    schema.publicSchemaId !== input.constraint.inputContract.asset.schemaId ||
    schema.publicSchemaVersion !==
      input.constraint.inputContract.asset.schemaVersion ||
    schema.assetRelativePath !==
      input.constraint.inputContract.asset.relativePath ||
    schema.assetDigest !== input.constraint.inputContract.asset.digest ||
    schema.assetDigest !== stableSha256Digest(schema.schema) ||
    schemas.schemaSetDigest !== stableSha256Digest(schemas.schemas)
  ) {
    throw new TypeError("run.invoke root admission differs");
  }
}

function assertBasis(input: RunInvokeExecutionIngressBasis): void {
  const uniqueAllowed = new Set(input.catalog.allowedEntryRefs);
  const uniqueSources = new Set(input.sourceWitnessRefs);
  const schemaCapabilityKeys = input.schemaAdmissionCapabilityBases.map(
    (basis) =>
      `${basis.graphFunctionId}\u0000${basis.nodeRef}\u0000${basis.symbolicSchemaRef}`
  );
  if (
    input.authorityClass !== "subordinate_rejoin_only" ||
    uniqueAllowed.size !== input.catalog.allowedEntryRefs.length ||
    uniqueSources.size !== input.sourceWitnessRefs.length ||
    schemaCapabilityKeys.length === 0 ||
    !stableJsonEquals(schemaCapabilityKeys, [...schemaCapabilityKeys].sort()) ||
    new Set(schemaCapabilityKeys).size !== schemaCapabilityKeys.length
  ) {
    throw new TypeError("run.invoke execution ingress refs are incomplete");
  }
  assertSelectedExecution(input.selectedExecution);
  if (
    !input.catalog.allowedEntryRefs.includes(
      input.selectedExecution.selectedEntryRef
    )
  ) {
    throw new TypeError(
      "run.invoke selected execution is outside the admitted catalog view"
    );
  }
  if (
    input.schemaAdmissionCapabilityBases.some((basis) =>
      basis.workspaceId !== input.workspace.workspaceId ||
      basis.bindingId !== input.workspace.bindingRef ||
      basis.catalogId !== input.catalog.catalogId ||
      basis.resolvedLockRef !== input.catalog.resolvedLockRef ||
      basis.entryRef !== input.selectedExecution.selectedEntryRef ||
      basis.graphFunctionId !== input.selectedExecution.graphFunctionRef ||
      basis.graphFunctionDigest !==
        input.selectedExecution.graphFunctionDigest
    )
  ) {
    throw new TypeError(
      "run.invoke schema capability authority differs from selected execution"
    );
  }
  assertConstraint(input);
  assertInvokeRootAdmission(input);
  const grants = input.invocationAuthority.capabilityGrants;
  const grantRefs = grants.map((grant) => grant.grantRef);
  if (
    input.invocationAuthority.compatibilityState !== "pending_af15_rejoin" ||
    input.invocationAuthority.compatibilityGapRef !==
      T270_RUNTIME_COMPATIBILITY_GAP ||
    grants.length === 0 ||
    new Set(grantRefs).size !== grantRefs.length ||
    new Set(
      input.invocationAuthority.transportSteering.provenanceRefs
    ).size !==
      input.invocationAuthority.transportSteering.provenanceRefs.length ||
    grants.some((grant) =>
      grant.grantDigest !== stableSha256Digest({
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
      }) ||
      grant.grantRef !== `capability-grant:${grant.grantDigest}` ||
      grant.actorRef !== input.invocationAuthority.actor.actorRef ||
      grant.authorityBasisRef !==
        input.invocationAuthority.authorityBasisRef ||
      grant.authorityBasisDigest !==
        input.invocationAuthority.authorityBasisDigest ||
      grant.scopeRef !== input.workspace.bindingRef ||
      grant.scopeDigest !== input.workspace.bindingDigest
    )
  ) {
    throw new TypeError(
      "run.invoke invocation authority rejoin projection differs"
    );
  }
  const runtimeProfileBasis = Object.freeze({
    kind: "abg_runtime_system_profile" as const,
    runtimeIdentity: input.runtimeProfile.runtimeIdentity,
    resolvedPolicy: input.runtimeProfile.resolvedPolicy,
    standardPluginRefs: input.runtimeProfile.standardPluginRefs
  });
  if (
    input.runtimeProfile.profileDigest !==
      stableSha256Digest(runtimeProfileBasis)
  ) {
    throw new TypeError("run.invoke runtime profile digest differs");
  }
}

export function admitRunInvokeExecutionIngress(
  input: RunInvokeExecutionIngressBasis
): AdmittedRunInvokeExecutionIngress {
  assertFreezableBasis(input);
  const basis = freezeBasis(input);
  assertBasis(basis);
  const ingressDigest = stableSha256Digest(basis);
  return Object.freeze({
    [RUN_INVOKE_EXECUTION_INGRESS]: true as const,
    kind: "admitted_run_invoke_execution_ingress" as const,
    ...basis,
    ingressRef:
      `abg://one-surface/execution-ingress/${ingressDigest.slice("sha256:".length)}`,
    ingressDigest
  });
}

export function assertAdmittedRunInvokeExecutionIngress(
  ingress: AdmittedRunInvokeExecutionIngress
): void {
  const expected = admitRunInvokeExecutionIngress(ingress);
  if (
    ingress[RUN_INVOKE_EXECUTION_INGRESS] !== true ||
    !stableJsonEquals(ingress, expected)
  ) {
    throw new TypeError("AdmittedRunInvokeExecutionIngress seal differs");
  }
}
