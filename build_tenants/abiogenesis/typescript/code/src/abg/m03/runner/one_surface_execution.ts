// Implements the bounded T-270 AF-15 sunny path. The admitted GTL structure
// selects the existing complete-C interpreter; only ExecutionBasis admission
// permits the declared F_D implementation to run.

import type { Operator } from "../../../gtl/m01/contracts/carriers.js";
import type { AdmittedTenantConformanceManifest } from "../../../shared/abg_library/tenant_conformance_manifest.js";
import {
  admitIJsonValue,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import { admitExecutionBasis } from "../admission/carriers.js";
import type {
  ActorInvocation,
  CanonicalRuntimeEvent,
  ExecutionBasis,
  FpDispatchTransition,
  RuntimeFailureClass,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  assertTargetObligationBinding,
  type TargetObligationBinding
} from "../contracts/one_surface_authority.js";
import {
  admitConstructionRuntimeEvents,
  isConstructionRuntimeEvent
} from "../contracts/construction_event_causality.js";
import {
  constructConstructionGraphActionInvokedEvent
} from "../contracts/construction_runtime_events.js";
import {
  constructAdmittedInvocationCarrier,
  constructAdmittedInvocationCarrierSet,
  type AdmittedInvocationCarrier,
  type AdmittedInvocationCarrierSet
} from "../contracts/declared_execution_context.js";
import {
  deriveRuntimeAggregateProjection
} from "../contracts/projection.js";
import {
  deriveAdmittedOutputAuthorityProjection,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  derivePayloadLedgerProjection
} from "../contracts/payload_ledger.js";
import {
  deriveAssuranceProjection,
  deriveAssuranceScopeRef
} from "../contracts/assurance.js";
import {
  constructActorInvocationClosedEvent,
  constructActorInvocationStartedEvent,
  constructActorResultArtifactObservedEvent,
  constructBasisAdmittedEvent,
  constructFrameOpenedEvent,
  constructFpDispatchRequestedEvent,
  constructGraphCallOpenedEvent,
  constructInstructionPromptManifestProjectedEvent,
  constructInstructionResponseContractAdmittedEvent,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  constructVectorTraversalPlannedEvent
} from "../contracts/event_factories.js";
import type { AdmittedRunInvokeExecutionIngress } from "../contracts/one_surface_execution_ingress.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import {
  admitGraphPrivateTargetValue,
  resolveRuntimeSchemaAdmissionCapabilities,
  type RuntimeSchemaAdmissionCapability,
  type RuntimeSchemaAdmissionEngineInput,
  type RuntimeSchemaAdmissionExecutionAuthority
} from "../contracts/runtime_schema_admission.js";
import {
  assertCompiledTraversalExecutionFamily,
  compileTraversalExecutionFamilyForRuntime,
  type CompiledTraversalExecutionFamily,
  type TraversalExecutionFamilyOperatorProjection,
  type TraversalExecutionFamilyRuntimeLocusProjection,
  type TraversalExecutionFamilyRuntimeProjection,
  type TraversalExecutionFamilyRuntimeVectorProjection
} from "../contracts/traversal_execution_family.js";
import type { GraphVectorExecutionHandoffPublished } from "../contracts/graph_vector_execution_handoff.js";
import type { ProjectSelectedTraversalContractSourceInput } from "../contracts/traversal_execution_contract.js";
import {
  constructDeclaredCStageInvocationBasis,
  joinDeclaredExecutionContext
} from "../contracts/declared_execution_context.js";
import { renderPromptManifest } from "../contracts/instruction_assembly.js";
import {
  projectFpResultLocusContract,
  requireFpResultContractEnvelope
} from "../contracts/fp_result_contract_admission.js";
import {
  resolveDeclaredPluginSelection
} from "../contracts/plugin_selection.js";
import {
  admitFpDispatchOutcome,
  constructEnginePluginInput
} from "../contracts/plugins.js";
import { deriveEffectiveVectorRegime } from "../contracts/regime_resolution.js";
import {
  frameIdForBasis,
  graphCallIdForBasis,
  vectorEdge
} from "../contracts/runtime_support.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
  type RuntimeEventSink
} from "../events/emit.js";
import {
  assertPrivatePublicOperationAdmissionReceipt,
  type PublicOperationAdmissionReceipt
} from "./public_operation_admission.js";
import {
  assertOneSurfaceConstructionIntentAdmission,
  type OneSurfaceConstructionIntentAdmission
} from "./one_surface_semantic_admission.js";
import {
  interpretCompleteCProgram,
  type CProgramAtomCloseBasis,
  type CProgramAtomEvidenceEvent,
  type CProgramAtomInvocationSubmission,
  type CProgramExecutionOutcome,
  type CProgramStageAtomRequest
} from "./complete_c_program_runtime.js";
import {
  LIVE_FP_DISPATCH_PLUGIN_REF,
  LIVE_FP_EVALUATOR_PLUGIN_REF,
  standardPluginCatalogWithCapabilities,
  type EnginePluginCapabilities
} from "./standard_live_plugins.js";
import { dispatchRequestsForTransition } from "../transport/index.js";
import {
  loadGtlTargetCarrierDefaultsBundle,
  type TargetCarrierContractBinding
} from "../../../gtl/m01/contracts/target_carrier_contract.js";

export const T270_DIRECT_RUNTIME_GAP =
  "gap://abg/t270/structure-derived-program-router" as const;

export type T270DirectExecutionErrorCode =
  | "authority_mismatch"
  | "implementation_unavailable"
  | "semantic_not_realized";

export class T270DirectExecutionError extends TypeError {
  public readonly code: T270DirectExecutionErrorCode;
  public readonly gapRef: string | null;

  public constructor(input: {
    readonly code: T270DirectExecutionErrorCode;
    readonly message: string;
    readonly gapRef?: string;
  }) {
    super(input.message);
    this.name = "T270DirectExecutionError";
    this.code = input.code;
    this.gapRef = input.gapRef ?? null;
  }
}

// Process-local executable bodies remain subordinate to the admitted M04
// steering projection. The projection is authoritative and hashed upstream;
// this neutral join carrier deliberately introduces no second digest.
export interface T270LiveCapabilityJoin {
  readonly kind: "t270_live_capability_join";
  readonly steeringRef: string;
  readonly steeringDigest: `sha256:${string}`;
  readonly workerProfile: Readonly<{
    readonly selectionRef: string;
    readonly selectionDigest: `sha256:${string}`;
    readonly configurationDigest: `sha256:${string}`;
  }>;
  readonly availableLivePluginRefs: readonly string[];
  readonly pluginCapabilities: EnginePluginCapabilities;
}

export interface T270CompileInvocationAuthority {
  readonly capabilityGrants: readonly Readonly<{
    readonly capabilityId: string;
  }>[];
  readonly transportSteering: Readonly<{
    readonly steeringRef: string;
    readonly steeringDigest: string;
    readonly provenanceRefs: readonly string[];
  }>;
}

export interface T270CompiledDirectExecution {
  readonly kind: "t270_compiled_direct_execution";
  readonly catalogBasisRef: string;
  readonly selectedEntryRef: string;
  readonly selectedExecutionBindingDigest: `sha256:${string}`;
  readonly runtimeProjectionDigest: `sha256:${string}`;
  readonly compiled: Readonly<{
    readonly family: CompiledTraversalExecutionFamily;
    readonly runtimeProjection: TraversalExecutionFamilyRuntimeProjection;
  }>;
  readonly workerProfile: T270LiveCapabilityJoin["workerProfile"] | undefined;
  readonly pluginCapabilities: EnginePluginCapabilities | undefined;
}

export interface T270StartAdmissionWitness {
  readonly kind: "t270_start_admission_witness";
  readonly ingressRef: string;
  readonly ingressDigest: `sha256:${string}`;
  readonly nextActionRef: string;
  readonly nextActionDigest: `sha256:${string}`;
  readonly intentAdmissionRef: string;
  readonly intentAdmissionDigest: `sha256:${string}`;
  readonly executionBindingDigest: `sha256:${string}`;
  readonly runtimeProjectionDigest: `sha256:${string}`;
  readonly schemaCapabilityBasisDigests: readonly `sha256:${string}`[];
  readonly joinDigest: `sha256:${string}`;
  readonly effectsPermitted: false;
}

export interface AdmittedRuntimeValueEnvironmentProjection {
  readonly kind: "admitted_runtime_value_environment_projection";
  readonly executionBasisId: string;
  readonly environmentDigest: `sha256:${string}`;
  readonly entries: readonly Readonly<{
    readonly nodeRef: string;
    readonly carrierRef: string;
    readonly carrier: AdmittedInvocationCarrier;
  }>[];
}

export interface FdOperatorImplementationBinding {
  readonly kind: "fd_operator_implementation_binding";
  readonly operatorBindingRef: Operator["binding"];
  readonly implementationRef: string;
  readonly regime: "F_D";
  readonly programRef: string;
  readonly stageRole: string;
  readonly fibre: "F_D";
  readonly armId: string;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly inputSchemaRefs: readonly string[];
  readonly outputSchemaRef: string;
  readonly invoke: (input: Readonly<AdmittedInvocationCarrierSet>) => IJsonValue;
}

export interface T270DirectExecutionResult {
  readonly kind: "t270_direct_execution_result";
  readonly witness: T270StartAdmissionWitness;
  readonly executionBasis: ExecutionBasis;
  readonly basisAdmittedEvent: CanonicalRuntimeEvent & {
    readonly kind: "basis_admitted";
  };
  readonly constructionInvokedEvent:
    | (CanonicalRuntimeEvent & {
        readonly kind: "construction_graph_action_invoked";
      })
    | null;
  readonly runtimeProjection: TraversalExecutionFamilyRuntimeProjection;
  readonly runtimeAggregateProjection: ReturnType<
    typeof deriveRuntimeAggregateProjection
  >;
  readonly payloadLedger: ReturnType<typeof derivePayloadLedgerProjection>;
  readonly admittedOutputAuthority: ReturnType<
    typeof deriveAdmittedOutputAuthorityProjection
  >;
  readonly assuranceProjection: ReturnType<typeof deriveAssuranceProjection> | null;
  readonly deterministicClosurePolicy: TargetCarrierContractBinding;
  readonly outcome: CProgramExecutionOutcome;
  readonly values: AdmittedRuntimeValueEnvironmentProjection;
  readonly runtimeEvents: readonly CanonicalRuntimeEvent[];
}

function assertSha256(
  value: string,
  label: string
): asserts value is `sha256:${string}` {
  if (!/^sha256:[0-9a-f]{64}$/u.test(value)) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: `${label} must be a sha256 digest`
    });
  }
}

function asSha256(value: string, label: string): `sha256:${string}` {
  assertSha256(value, label);
  return value;
}

function selectedExecutionAuthority(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly binding: CatalogExecutionBinding;
}): RuntimeSchemaAdmissionExecutionAuthority {
  return Object.freeze({
    workspaceId: input.catalogBasis.workspaceId,
    bindingId: input.catalogBasis.bindingId,
    catalogId: input.catalogBasis.catalogId,
    resolvedLockRef: input.catalogBasis.resolvedLockRef,
    entryRef: input.binding.entryRef,
    declarationRef: input.binding.declarationRef,
    declarationDigest: asSha256(
      input.binding.declarationDigest,
      "selected execution declaration digest"
    ),
    ownerRef: input.binding.ownerRef,
    version: input.binding.version,
    moduleRef: input.binding.moduleRef,
    moduleDigest: asSha256(
      input.binding.moduleDigest,
      "selected execution Module digest"
    ),
    graphFunctionId: input.binding.graphFunctionId,
    graphFunctionDigest: asSha256(
      input.binding.graphFunctionDigest,
      "selected execution GraphFunction digest"
    )
  });
}

const T270_START_ADMISSION_WITNESS_AUTHORITY = new WeakSet<object>();

export function deriveT270StartAdmissionWitness(input: {
  readonly ingress: AdmittedRunInvokeExecutionIngress;
  readonly executionBinding: CatalogExecutionBinding;
  readonly runtimeProjection: TraversalExecutionFamilyRuntimeProjection;
}): T270StartAdmissionWitness {
  const basis = Object.freeze({
    kind: "t270_start_admission_witness" as const,
    ingressRef: input.ingress.ingressRef,
    ingressDigest: input.ingress.ingressDigest,
    nextActionRef: input.ingress.selectedExecution.nextActionRef,
    nextActionDigest: input.ingress.selectedExecution.nextActionDigest,
    intentAdmissionRef: input.ingress.selectedExecution.intentAdmissionRef,
    intentAdmissionDigest:
      input.ingress.selectedExecution.intentAdmissionDigest,
    executionBindingDigest: stableSha256Digest(input.executionBinding),
    runtimeProjectionDigest: input.runtimeProjection.projectionDigest,
    schemaCapabilityBasisDigests: Object.freeze(
      input.ingress.schemaAdmissionCapabilityBases.map((row) => row.basisDigest)
    ),
    effectsPermitted: false as const
  });
  const witness = Object.freeze({
    ...basis,
    joinDigest: stableSha256Digest(basis)
  });
  T270_START_ADMISSION_WITNESS_AUTHORITY.add(witness);
  return witness;
}

function assertT270StartAdmissionWitness(
  value: unknown
): asserts value is T270StartAdmissionWitness {
  if (
    typeof value !== "object" ||
    value === null ||
    !T270_START_ADMISSION_WITNESS_AUTHORITY.has(value)
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "ExecutionBasis admission requires the exact derived T-270 start witness"
    });
  }
}

export function admitT270ExecutionBasis(input: {
  readonly ingress: AdmittedRunInvokeExecutionIngress;
  readonly executionBinding: CatalogExecutionBinding;
  readonly runtimeProjection: TraversalExecutionFamilyRuntimeProjection;
  readonly startAdmissionWitness: unknown;
}): ExecutionBasis {
  assertT270StartAdmissionWitness(input.startAdmissionWitness);
  if (
    input.ingress.selectedExecution.selectedEntryRef !==
      input.executionBinding.entryRef ||
    input.ingress.selectedExecution.graphFunctionRef !==
      input.executionBinding.graphFunctionId ||
    input.ingress.selectedExecution.graphFunctionDigest !==
      input.executionBinding.graphFunctionDigest ||
    input.ingress.selectedExecution.selectedExecutionBindingDigest !==
      stableSha256Digest(input.executionBinding)
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "ExecutionBasis admission differs from selected execution authority"
    });
  }
  const expectedWitness = deriveT270StartAdmissionWitness({
    ingress: input.ingress,
    executionBinding: input.executionBinding,
    runtimeProjection: input.runtimeProjection
  });
  if (!stableJsonEquals(input.startAdmissionWitness, expectedWitness)) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "ExecutionBasis admission start witness differs from current AF-15 authority"
    });
  }
  return admitExecutionBasis({
    module: input.executionBinding.module,
    startIntent: Object.freeze({
      scope: Object.freeze({
        kind: "workspace" as const,
        workspaceRoot: input.ingress.workspace.workspaceRoot,
        moduleName: input.executionBinding.moduleName
      }),
      target: Object.freeze({
        kind: "graph_function" as const,
        handle: input.executionBinding.graphFunctionHandle
      }),
      until: "first_traversal" as const
    }),
    runtimeIdentity: input.ingress.runtimeProfile.runtimeIdentity,
    resolvedPolicy: input.ingress.runtimeProfile.resolvedPolicy,
    runId: input.ingress.invocation.ref,
    workKey: input.ingress.selectedExecution.nextActionRef,
    startAdmissionWitnessDigest: expectedWitness.joinDigest
  });
}

function environment(input: {
  readonly executionBasisId: string;
  readonly carriers: readonly AdmittedInvocationCarrier[];
}): AdmittedRuntimeValueEnvironmentProjection {
  const entries = Object.freeze(input.carriers.map((carrier) => Object.freeze({
    nodeRef: carrier.sourceNodeRef,
    carrierRef: carrier.carrierRef,
    carrier
  })));
  const uniqueNodes = new Set(entries.map((row) => row.nodeRef));
  const uniqueRefs = new Set(entries.map((row) => row.carrierRef));
  if (
    entries.length === 0 ||
    uniqueNodes.size !== entries.length ||
    uniqueRefs.size !== entries.length
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "runtime value environment requires unique admitted carriers"
    });
  }
  const basis = Object.freeze({
    kind: "admitted_runtime_value_environment_projection" as const,
    executionBasisId: input.executionBasisId,
    entries
  });
  return Object.freeze({
    ...basis,
    environmentDigest: stableSha256Digest(basis)
  });
}

export function extendAdmittedRuntimeValueEnvironment(input: {
  readonly current: AdmittedRuntimeValueEnvironmentProjection;
  readonly admittedOutput: AdmittedInvocationCarrier;
}): AdmittedRuntimeValueEnvironmentProjection {
  const retained = input.current.entries
    .filter((row) => row.nodeRef !== input.admittedOutput.sourceNodeRef)
    .map((row) => row.carrier);
  return environment({
    executionBasisId: input.current.executionBasisId,
    carriers: Object.freeze([...retained, input.admittedOutput])
  });
}

export function resolveFdOperatorImplementation(input: {
  readonly operator: TraversalExecutionFamilyOperatorProjection & {
    readonly regime: "F_D";
  };
  readonly locus: TraversalExecutionFamilyRuntimeLocusProjection & {
    readonly node: TraversalExecutionFamilyRuntimeLocusProjection["node"] & {
      readonly kind: "compiled_c_stage_leaf";
    };
  };
  readonly programRef: string;
  readonly implementations: readonly FdOperatorImplementationBinding[];
}): FdOperatorImplementationBinding {
  const bindingMatches = input.implementations.filter(
    (candidate) => candidate.operatorBindingRef === input.operator.binding
  );
  const matches = bindingMatches.filter((candidate) =>
    candidate.kind === "fd_operator_implementation_binding" &&
    candidate.implementationRef.length > 0 &&
    typeof candidate.invoke === "function" &&
    candidate.regime === "F_D" &&
    candidate.fibre === input.locus.node.fibre &&
    candidate.programRef === input.programRef &&
    candidate.stageRole === input.locus.node.domainStageRole &&
    candidate.armId === input.locus.node.armId &&
    stableJsonEquals(candidate.inputCarrierRefs, [input.locus.node.inputCarrierRef]) &&
    stableJsonEquals(candidate.outputCarrierRefs, [input.locus.node.outputCarrierRef]) &&
    candidate.inputSchemaRefs.length > 0 &&
    candidate.outputSchemaRef.length > 0
  );
  const selected = matches[0];
  if (bindingMatches.length === 0 || matches.length !== 1 || selected === undefined) {
    throw new T270DirectExecutionError({
      code: "implementation_unavailable",
      message:
        `F_D Operator ${JSON.stringify(input.operator.binding)} requires one exact implementation; got ${String(matches.length)}`
    });
  }
  return selected;
}

type T270DirectStageLocus = TraversalExecutionFamilyRuntimeLocusProjection & {
  readonly node: TraversalExecutionFamilyRuntimeLocusProjection["node"] & {
    readonly kind: "compiled_c_stage_leaf";
    readonly fibre: "F_D" | "F_P";
  };
  readonly operator: TraversalExecutionFamilyOperatorProjection & {
    readonly regime: "F_D" | "F_P";
  };
};

type T270DirectStageVector = TraversalExecutionFamilyRuntimeVectorProjection & {
  readonly sourceInput: ProjectSelectedTraversalContractSourceInput & {
    readonly outcome: GraphVectorExecutionHandoffPublished;
  };
  readonly loci: readonly [T270DirectStageLocus];
};

function assertDirectSunnyProjection(
  runtimeProjection: TraversalExecutionFamilyRuntimeProjection
): asserts runtimeProjection is TraversalExecutionFamilyRuntimeProjection & {
  readonly vectors: readonly [T270DirectStageVector];
} {
  const vector = runtimeProjection.vectors[0];
  const locus = vector?.loci[0];
  if (
    runtimeProjection.vectors.length !== 1 ||
    vector === undefined ||
    vector.source.sourceKind !== "selected_program_handoff" ||
    vector.sourceInput.kind !== "selected_program_handoff" ||
    vector.sourceInput.outcome.status !== "published_startup_blocked" ||
    vector.source.applicationKind !== "direct" ||
    vector.loci.length !== 1 ||
    locus === undefined ||
    locus.node.kind !== "compiled_c_stage_leaf" ||
    (locus.node.fibre !== "F_D" && locus.node.fibre !== "F_P") ||
    locus.operator === null ||
    locus.operator.regime !== locus.node.fibre ||
    vector.graphVector.source.length !== 1 ||
    !locus.node.resultBearing
  ) {
    throw new T270DirectExecutionError({
      code: "semantic_not_realized",
      gapRef: T270_DIRECT_RUNTIME_GAP,
      message:
        "the bounded T-270 sunny executor currently admits one direct result-bearing single-stage F_D or F_P vector"
    });
  }
}

function exactCarrierSet(input: {
  readonly values: AdmittedRuntimeValueEnvironmentProjection;
  readonly schemaRefs: readonly string[];
}): AdmittedInvocationCarrierSet {
  const carriers = input.schemaRefs.map((schemaRef) => {
    const matches = input.values.entries.filter(
      (row) => row.carrier.schemaRef === schemaRef
    );
    const selected = matches[0]?.carrier;
    if (matches.length !== 1 || selected === undefined) {
      throw new T270DirectExecutionError({
        code: "authority_mismatch",
        message:
          `input schema ${JSON.stringify(schemaRef)} must resolve one admitted value; got ${String(matches.length)}`
      });
    }
    return selected;
  });
  return constructAdmittedInvocationCarrierSet(Object.freeze(carriers));
}

function capabilityForTarget(input: {
  readonly capabilities: readonly RuntimeSchemaAdmissionCapability[];
  readonly graphFunctionId: string;
  readonly nodeRef: string;
  readonly symbolicSchemaRef: string;
}): RuntimeSchemaAdmissionCapability {
  const matches = input.capabilities.filter((capability) =>
    capability.basis.graphFunctionId === input.graphFunctionId &&
    capability.basis.nodeRef === input.nodeRef &&
    capability.basis.symbolicSchemaRef === input.symbolicSchemaRef
  );
  const selected = matches[0];
  if (matches.length !== 1 || selected === undefined) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "target schema capability is not exact"
    });
  }
  return selected;
}

interface T270AdmittedTargetSubmission {
  readonly output: AdmittedInvocationCarrier;
  readonly evidenceRef: string;
  readonly evidenceEvents: readonly CProgramAtomEvidenceEvent[];
  readonly closeBasis: CProgramAtomCloseBasis;
}

function admitTargetCandidateForAtom(input: {
  readonly request: CProgramStageAtomRequest;
  readonly graphEdge: string;
  readonly candidate: unknown;
  readonly target: TraversalExecutionFamilyRuntimeVectorProjection["graphVector"]["target"];
  readonly targetCarrier: TraversalExecutionFamilyRuntimeVectorProjection["source"]["targetCarrierProjection"];
  readonly capabilities: readonly RuntimeSchemaAdmissionCapability[];
  readonly graphFunctionId: string;
  readonly selectedExecutionBinding: CatalogExecutionBinding;
  readonly selectedExecutionBindingDigest: `sha256:${string}`;
  readonly inputCarriers: readonly AdmittedInvocationCarrier[];
  readonly producerRef: string;
  readonly actorInvocationId: string | null;
  readonly evidenceNamespace: "fd-value" | "fp-value";
  readonly evidenceClass: string;
}): T270AdmittedTargetSubmission {
  const capability = capabilityForTarget({
    capabilities: input.capabilities,
    graphFunctionId: input.graphFunctionId,
    nodeRef: input.target.id,
    symbolicSchemaRef: input.target.schema.ref
  });
  const admittedValue = admitGraphPrivateTargetValue({
    capability,
    candidate: admitIJsonValue(input.candidate)
  });
  const payloadDigest = stableSha256Digest(admittedValue);
  const output = constructAdmittedInvocationCarrier({
    sourceNodeRef: input.target.id,
    schemaRef: input.target.schema.ref,
    carrierRef: `payload://abg/t270/${payloadDigest.slice("sha256:".length)}`,
    admissionRef:
      `admission://abg/t270/${capability.basis.basisDigest.slice("sha256:".length)}/${payloadDigest.slice("sha256:".length)}`,
    value: admittedValue
  });
  const inputDigest = input.inputCarriers.length === 1
    ? stableSha256Digest({
        cCallRef: input.request.cCallRef,
        carrierRef: input.inputCarriers[0]!.carrierRef,
        carrierDigest: input.inputCarriers[0]!.carrierDigest,
        admissionRef: input.inputCarriers[0]!.admissionRef
      })
    : stableSha256Digest({
        cCallRef: input.request.cCallRef,
        carriers: input.inputCarriers.map((carrier) => Object.freeze({
          carrierRef: carrier.carrierRef,
          carrierDigest: carrier.carrierDigest,
          admissionRef: carrier.admissionRef
        }))
      });
  const evidenceAuthorityRefs = Object.freeze([
    ...new Set(input.target.assetSurface.proofObligationRefs)
  ]);
  const evidenceAuthorityRef = evidenceAuthorityRefs[0];
  if (
    evidenceAuthorityRefs.length !== 1 ||
    evidenceAuthorityRef === undefined
  ) {
    throw new T270DirectExecutionError({
      code: "implementation_unavailable",
      message:
        "T-270 sunny execution requires one exact target proof-obligation authority"
    });
  }
  const authorityDigest = stableSha256Digest({
    executionBindingDigest: input.selectedExecutionBindingDigest,
    schemaCapabilityBasisDigest: capability.basis.basisDigest,
    inputDigest,
    cCallRef: input.request.cCallRef,
    evidenceAuthorityRef
  });
  const evidenceBasisDigest = stableSha256Digest({
    authorityDigest,
    cCallRef: input.request.cCallRef,
    payloadRef: output.carrierRef,
    payloadDigest,
    outputAdmissionRef: output.admissionRef,
    targetCarrierContractRef: input.targetCarrier.targetCarrierContractRef,
    targetCarrierContractDigest:
      input.targetCarrier.targetCarrierContractDigest,
    evidenceAuthorityRef
  });
  const evidenceSuffix = evidenceBasisDigest.slice("sha256:".length);
  const authoritySnapshotRef =
    `authority-snapshot://abg/t270/${input.evidenceNamespace}/${evidenceSuffix}`;
  const validationRef =
    `validation://abg/t270/${input.evidenceNamespace}/${evidenceSuffix}`;
  const evidenceRef =
    `evidence://abg/t270/${input.evidenceNamespace}/${evidenceSuffix}`;
  const providerRefs = Object.freeze([
    ...new Set([
      input.selectedExecutionBinding.ownerRef,
      input.producerRef,
      capability.basis.projectorRef
    ])
  ]);
  const inputRefs = Object.freeze([
    ...new Set(
      input.inputCarriers.flatMap((carrier) => [
        carrier.carrierRef,
        carrier.admissionRef
      ])
    )
  ]);
  const policyRefs = Object.freeze([
    input.targetCarrier.replayDigestPolicyRef,
    input.targetCarrier.closurePreconditionRef
  ]);
  const scope = Object.freeze({
    basisId: input.request.parentBasisId,
    graphCallId: input.request.parentGraphCallId,
    frameId: input.request.parentFrameId,
    vectorIndex: input.request.vectorIndex,
    edge: input.graphEdge
  });
  const evidenceEvents = Object.freeze([
    Object.freeze({
      kind: "authority_snapshot_admitted" as const,
      ...scope,
      authoritySnapshotRef,
      authorityRefs: Object.freeze([evidenceAuthorityRef]),
      inputRefs,
      authorityDigest,
      inputDigest,
      closureCapable: true,
      contradictoryAuthority: false,
      deferredAuthorityRefs: Object.freeze([]),
      providerRefs,
      policyRefs
    }),
    Object.freeze({
      kind: "payload_observed" as const,
      ...scope,
      payloadRef: output.carrierRef,
      payloadClass: input.targetCarrier.outputCarrierKind,
      schemaRef: input.target.schema.ref,
      contractRef: input.targetCarrier.targetCarrierContractRef,
      digest: payloadDigest,
      producerRef: input.producerRef,
      sourceEventRef: input.request.cCallRef,
      actorInvocationId: input.actorInvocationId,
      authorityRef: authoritySnapshotRef,
      inputDigest,
      policyRefs
    }),
    Object.freeze({
      kind: "payload_validated" as const,
      ...scope,
      payloadRef: output.carrierRef,
      schemaRef: input.target.schema.ref,
      contractRef: input.targetCarrier.targetCarrierContractRef,
      contractDigest: input.targetCarrier.targetCarrierContractDigest,
      digest: payloadDigest,
      validationRef,
      evidenceRef,
      policyRefs
    }),
    Object.freeze({
      kind: "evidence_admitted" as const,
      ...scope,
      evidenceRef,
      payloadRef: output.carrierRef,
      authorityRef: authoritySnapshotRef,
      authorityDigest,
      inputDigest,
      providerRefs,
      policyRefs,
      complete: true,
      shallow: false,
      contradictsAuthority: false,
      deferred: false
    })
  ] satisfies readonly CProgramAtomEvidenceEvent[]);
  return Object.freeze({
    output,
    evidenceRef,
    evidenceEvents,
    closeBasis: Object.freeze({
      kind: "c_program_atom_close_basis" as const,
      evidenceClass: input.evidenceClass,
      evidenceRefs: Object.freeze([
        authoritySnapshotRef,
        validationRef,
        evidenceRef
      ]),
      resultContractRef: input.targetCarrier.targetCarrierContractRef
    })
  });
}

function actorInvocationForAtom(input: {
  readonly basis: ExecutionBasis;
  readonly request: CProgramStageAtomRequest;
  readonly transition: FpDispatchTransition;
  readonly selectedResultContractRef: string;
}): ActorInvocation {
  const dispatchRequest = dispatchRequestsForTransition(
    input.transition,
    input.selectedResultContractRef
  )[0];
  if (dispatchRequest === undefined) {
    throw new T270DirectExecutionError({
      code: "implementation_unavailable",
      message: "compiler-selected F_P locus did not derive one dispatch request"
    });
  }
  const identityDigest = stableSha256Digest({
    cCallRef: input.request.cCallRef,
    dispatchRef: dispatchRequest.dispatchRef,
    resultRef: dispatchRequest.resultRef
  });
  return Object.freeze({
    kind: "actor_invocation" as const,
    actorInvocationId:
      `actor-invocation://abg/t270/${identityDigest.slice("sha256:".length)}`,
    basisId: input.request.parentBasisId,
    graphFunctionId: input.request.executionGraphFunctionRef,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: input.request.parentGraphCallId,
    frameId: input.request.parentFrameId,
    vectorIndex: input.request.vectorIndex,
    edge: input.transition.edge,
    attemptIndex: 1,
    dispatchRef: dispatchRequest.dispatchRef,
    workerId: dispatchRequest.workerId,
    backendId: dispatchRequest.backendId,
    resultRef: dispatchRequest.resultRef,
    causationEventRefs: Object.freeze([
      input.request.cCallRef,
      dispatchRequest.dispatchRef
    ]),
    correlationId:
      `actor-correlation://abg/t270/${identityDigest.slice("sha256:".length)}`
  });
}

function failedAtomSubmission(input: {
  readonly request: CProgramStageAtomRequest;
  readonly reason: string;
  readonly failureClass: RuntimeFailureClass;
  readonly interiorEvents: CProgramAtomInvocationSubmission["interiorEvents"];
  readonly evidenceRefs?: readonly string[] | undefined;
}): CProgramAtomInvocationSubmission {
  return Object.freeze({
    kind: "c_program_atom_invocation_submission" as const,
    result: Object.freeze({
      kind: "c_program_atom_result" as const,
      planRef: input.request.planRef,
      nodeRef: input.request.nodeRef,
      cursorRef: input.request.cursorRef,
      status: "runtime_failed" as const,
      outputCarrierRef: input.request.outputCarrierRef,
      outputPayloadRef: null,
      responseContractRef: null,
      outputLineageRef: null,
      reasonRef: input.reason,
      failureClass: input.failureClass,
      evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
      cCallRef: input.request.cCallRef,
      sourceEventRefs: Object.freeze([input.request.cCallRef])
    }),
    admittedTargetCarrier: null,
    interiorEvents: input.interiorEvents,
    evidenceEvents: Object.freeze([]),
    closeBasis: null
  });
}

function blockedAtomSubmission(input: {
  readonly request: CProgramStageAtomRequest;
  readonly reason: string;
  readonly interiorEvents: CProgramAtomInvocationSubmission["interiorEvents"];
  readonly evidenceRefs?: readonly string[] | undefined;
}): CProgramAtomInvocationSubmission {
  return Object.freeze({
    kind: "c_program_atom_invocation_submission" as const,
    result: Object.freeze({
      kind: "c_program_atom_result" as const,
      planRef: input.request.planRef,
      nodeRef: input.request.nodeRef,
      cursorRef: input.request.cursorRef,
      status: "blocked" as const,
      outputCarrierRef: input.request.outputCarrierRef,
      outputPayloadRef: null,
      responseContractRef: null,
      outputLineageRef: null,
      reasonRef: input.reason,
      failureClass: null,
      evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
      cCallRef: input.request.cCallRef,
      sourceEventRefs: Object.freeze([input.request.cCallRef])
    }),
    admittedTargetCarrier: null,
    interiorEvents: input.interiorEvents,
    evidenceEvents: Object.freeze([]),
    closeBasis: null
  });
}

function admitT270LiveCapabilityJoin(input: {
  readonly invocationAuthority: T270CompileInvocationAuthority;
  readonly runtimeProfile: AdmittedRunInvokeExecutionIngress["runtimeProfile"];
  readonly join: T270LiveCapabilityJoin | undefined;
}): Readonly<{
  readonly workerProfile: T270LiveCapabilityJoin["workerProfile"];
  readonly pluginCapabilities: EnginePluginCapabilities;
}> | undefined {
  if (input.join === undefined) {
    return undefined;
  }
  const join = input.join;
  const steering = input.invocationAuthority.transportSteering;
  const bodyRefs = Object.freeze([
    ...(join.pluginCapabilities.liveFpDispatch === undefined
      ? []
      : [LIVE_FP_DISPATCH_PLUGIN_REF]),
    ...(join.pluginCapabilities.liveFpEvaluator === undefined
      ? []
      : [LIVE_FP_EVALUATOR_PLUGIN_REF])
  ]);
  const availableRefs = Object.freeze([...join.availableLivePluginRefs]);
  const sortedAvailableRefs = Object.freeze([...availableRefs].sort());
  const provenanceRefs = new Set(steering.provenanceRefs);
  const workerProfile = join.workerProfile;
  const capabilityIds = new Set(
    input.invocationAuthority.capabilityGrants.map(
      (grant) => grant.capabilityId
    )
  );
  if (
    join.kind !== "t270_live_capability_join" ||
    join.steeringRef !== steering.steeringRef ||
    join.steeringDigest !== steering.steeringDigest ||
    workerProfile === undefined ||
    workerProfile.selectionRef.length === 0 ||
    !/^sha256:[0-9a-f]{64}$/u.test(workerProfile.selectionDigest) ||
    !/^sha256:[0-9a-f]{64}$/u.test(workerProfile.configurationDigest) ||
    availableRefs.length === 0 ||
    new Set(availableRefs).size !== availableRefs.length ||
    !stableJsonEquals(availableRefs, sortedAvailableRefs) ||
    !stableJsonEquals(bodyRefs, availableRefs) ||
    !availableRefs.every((ref) =>
      input.runtimeProfile.standardPluginRefs.includes(ref)
    ) ||
    !capabilityIds.has(
      "abg.capability.catalog.invoke-graph-function@5"
    ) ||
    !capabilityIds.has(
      "abg.capability.runtime.execute-seven-term-c@5"
    ) ||
    !provenanceRefs.has(join.steeringRef) ||
    !provenanceRefs.has(join.steeringDigest) ||
    !provenanceRefs.has(workerProfile.selectionRef) ||
    !provenanceRefs.has(workerProfile.selectionDigest) ||
    !provenanceRefs.has(workerProfile.configurationDigest)
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message:
        "T-270 live capability body differs from admitted transport steering or runtime profile"
    });
  }
  return Object.freeze({
    workerProfile,
    pluginCapabilities: join.pluginCapabilities
  });
}

/**
 * Compiles the caller-constrained catalog member before AF-13. This proves
 * constructability only: AF-13 remains the sole selector, and the returned
 * compiler result is reused unchanged after AF-14.
 */
export function compileSelectedCatalogDirectProgram(input: {
  readonly invocationAuthority: T270CompileInvocationAuthority;
  readonly runtimeProfile: AdmittedRunInvokeExecutionIngress["runtimeProfile"];
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedExecutionBinding: CatalogExecutionBinding;
  readonly admittedTenantConformanceManifest: AdmittedTenantConformanceManifest;
  readonly liveCapabilityJoin?: T270LiveCapabilityJoin | undefined;
}): T270CompiledDirectExecution {
  const selectedExecutionBindingDigest = stableSha256Digest(
    input.selectedExecutionBinding
  );
  const admittedLiveCapability = admitT270LiveCapabilityJoin({
    invocationAuthority: input.invocationAuthority,
    runtimeProfile: input.runtimeProfile,
    join: input.liveCapabilityJoin
  });
  const compiled = compileTraversalExecutionFamilyForRuntime({
    catalogBasis: input.catalogBasis,
    executionBinding: input.selectedExecutionBinding,
    admittedTenantConformanceManifest:
      input.admittedTenantConformanceManifest,
    pluginCatalog: standardPluginCatalogWithCapabilities(
      admittedLiveCapability?.pluginCapabilities
    )
  });
  assertCompiledTraversalExecutionFamily(compiled.family);
  if (
    compiled.family.catalogBasisRef !== input.catalogBasis.basisRef ||
    compiled.family.selectedCatalogEntryRef !==
      input.selectedExecutionBinding.entryRef ||
    compiled.family.executionBindingDigest !==
      selectedExecutionBindingDigest ||
    compiled.runtimeProjection.compactFamily.familyDigest !==
      compiled.family.familyDigest ||
    compiled.runtimeProjection.effectsPermitted !== false
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message:
        "T-270 compiler result differs from the constrained catalog authority"
    });
  }
  return Object.freeze({
    kind: "t270_compiled_direct_execution" as const,
    catalogBasisRef: input.catalogBasis.basisRef,
    selectedEntryRef: input.selectedExecutionBinding.entryRef,
    selectedExecutionBindingDigest,
    runtimeProjectionDigest: compiled.runtimeProjection.projectionDigest,
    compiled,
    workerProfile: admittedLiveCapability?.workerProfile,
    pluginCapabilities: admittedLiveCapability?.pluginCapabilities
  });
}

export async function executeSelectedCatalogDirectProgram(input: {
  readonly ingress: AdmittedRunInvokeExecutionIngress;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
  readonly targetBinding: TargetObligationBinding;
  readonly selectedIntentEvent: CanonicalRuntimeEvent & {
    readonly kind: "construction_intent_selected";
  };
  readonly publicOperationAdmission: PublicOperationAdmissionReceipt;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedExecutionBinding: CatalogExecutionBinding;
  readonly schemaAdmissionEngineInput: RuntimeSchemaAdmissionEngineInput;
  readonly implementations: readonly FdOperatorImplementationBinding[];
  readonly compiledExecution: T270CompiledDirectExecution;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
}): Promise<T270DirectExecutionResult> {
  if (typeof input.eventSink !== "function") {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "T-270 execution requires one canonical runtime event sink"
    });
  }
  assertPrivatePublicOperationAdmissionReceipt(input.publicOperationAdmission);
  assertOneSurfaceConstructionIntentAdmission(input.intentAdmission);
  assertTargetObligationBinding(input.targetBinding);
  const publicAdmission = input.publicOperationAdmission.event;
  const matchingAdmissionEvents = input.priorEvents.filter((event) =>
    event.eventId === publicAdmission.eventId &&
    stableJsonEquals(event, publicAdmission)
  );
  if (
    publicAdmission.definitionKey.operationId !== "abg.operation.run.invoke" ||
    publicAdmission.definitionKey.memberKind !== "variant" ||
    publicAdmission.definitionKey.variant !== input.ingress.variant ||
    publicAdmission.definitionDigest !== input.ingress.definitionDigest ||
    publicAdmission.invocationRef !== input.ingress.invocation.ref ||
    publicAdmission.invocationDigest !== input.ingress.invocation.digest ||
    matchingAdmissionEvents.length !== 1
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message:
        "T-270 execution requires its exact public-operation admission in prior replay"
    });
  }
  const selectedDigest = stableSha256Digest(input.selectedExecutionBinding);
  if (
    input.ingress.variant !== "invoke" ||
    input.ingress.admittedInputCarriers === null ||
    input.ingress.catalog.basisRef !== input.catalogBasis.basisRef ||
    input.ingress.selectedExecution.selectedEntryRef !==
      input.selectedExecutionBinding.entryRef ||
    input.ingress.selectedExecution.graphFunctionRef !==
      input.selectedExecutionBinding.graphFunctionId ||
    input.ingress.selectedExecution.graphFunctionDigest !==
      input.selectedExecutionBinding.graphFunctionDigest ||
    input.ingress.selectedExecution.selectedExecutionBindingDigest !==
      selectedDigest
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "T-270 final ingress and selected catalog authority differ"
    });
  }

  const compiledExecution = input.compiledExecution;
  const compiled = compiledExecution.compiled;
  assertCompiledTraversalExecutionFamily(compiled.family);
  if (
    compiledExecution.kind !== "t270_compiled_direct_execution" ||
    compiledExecution.catalogBasisRef !== input.catalogBasis.basisRef ||
    compiledExecution.selectedEntryRef !== input.selectedExecutionBinding.entryRef ||
    compiledExecution.selectedExecutionBindingDigest !== selectedDigest ||
    compiledExecution.runtimeProjectionDigest !==
      compiled.runtimeProjection.projectionDigest ||
    compiled.family.catalogBasisRef !== input.catalogBasis.basisRef ||
    compiled.family.selectedCatalogEntryRef !==
      input.selectedExecutionBinding.entryRef ||
    compiled.family.executionBindingDigest !== selectedDigest ||
    compiled.runtimeProjection.compactFamily.familyDigest !==
      compiled.family.familyDigest
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message:
        "T-270 execution requires the exact pre-AF-13 compiler result"
    });
  }
  const pluginCapabilities = compiledExecution.pluginCapabilities;
  const pluginCatalog = standardPluginCatalogWithCapabilities(
    pluginCapabilities
  );
  assertDirectSunnyProjection(compiled.runtimeProjection);
  const vector = compiled.runtimeProjection.vectors[0];
  const locus = vector.loci[0];
  const admittedIntent =
    input.intentAdmission.constructionIntentAdmission.admittedIntent;
  if (
    admittedIntent === null ||
      input.intentAdmission.admissionRef !==
        input.ingress.selectedExecution.intentAdmissionRef ||
      input.intentAdmission.admissionDigest !==
        input.ingress.selectedExecution.intentAdmissionDigest ||
      input.intentAdmission.targetBindingRefs.length !== 1 ||
      input.intentAdmission.targetBindingRefs[0] !==
        input.targetBinding.bindingRef ||
      input.targetBinding.sourceBindingRef !==
        admittedIntent.selectedBindingRef ||
      input.targetBinding.actionRef !== admittedIntent.selectedActionRef ||
      input.targetBinding.targetOutcomeRef !== admittedIntent.selectedOutcomeRef ||
      input.selectedIntentEvent.intentId !== admittedIntent.intentId ||
      input.selectedIntentEvent.selectedActionRef !==
        admittedIntent.selectedActionRef ||
      input.selectedIntentEvent.selectedBindingRef !==
        admittedIntent.selectedBindingRef ||
      !input.priorEvents.some((event) =>
        event.eventId === input.selectedIntentEvent.eventId &&
        stableJsonEquals(event, input.selectedIntentEvent)
      ) ||
      admittedIntent.selectedGraphFunctionRef !==
        input.selectedExecutionBinding.graphFunctionId ||
      admittedIntent.selectedVectorRef !== null
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message:
        "T-270 direct execution requires the exact admitted intent target binding"
    });
  }
  const authority = selectedExecutionAuthority({
    catalogBasis: input.catalogBasis,
    binding: input.selectedExecutionBinding
  });
  const capabilities = resolveRuntimeSchemaAdmissionCapabilities({
    requirements: compiled.runtimeProjection.requiredSchemas,
    authority,
    admittedBases: input.ingress.schemaAdmissionCapabilityBases,
    engineInput: input.schemaAdmissionEngineInput
  });
  const implementation = locus.node.fibre === "F_D"
    ? (() => {
        if (locus.operator.regime !== "F_D") {
          throw new T270DirectExecutionError({
            code: "authority_mismatch",
            message: "compiler-projected F_D locus and Operator regime differ"
          });
        }
        return resolveFdOperatorImplementation({
          operator: Object.freeze({
            ...locus.operator,
            regime: "F_D" as const
          }),
          locus: {
            ...locus,
            node: { ...locus.node, fibre: "F_D" as const }
          },
          programRef: vector.source.selectedProgramRef,
          implementations: input.implementations
        });
      })()
    : null;
  const target = vector.graphVector.target;
  if (
    implementation !== null &&
    (
    implementation.inputSchemaRefs.length !==
      vector.graphVector.source.length ||
    !stableJsonEquals(
      implementation.inputSchemaRefs,
      vector.graphVector.source.map((node) => node.schema.ref)
    ) ||
    implementation.outputSchemaRef !== target.schema.ref)
  ) {
    throw new T270DirectExecutionError({
      code: "implementation_unavailable",
      message: "F_D implementation schema relation differs from its GraphVector"
    });
  }
  const witness = deriveT270StartAdmissionWitness({
    ingress: input.ingress,
    executionBinding: input.selectedExecutionBinding,
    runtimeProjection: compiled.runtimeProjection
  });
  const executionBasis = admitT270ExecutionBasis({
    ingress: input.ingress,
    executionBinding: input.selectedExecutionBinding,
    runtimeProjection: compiled.runtimeProjection,
    startAdmissionWitness: witness
  });
  const rawBasisAdmittedEvent = constructBasisAdmittedEvent(executionBasis);
  const lifecyclePrelude = Object.freeze([
    rawBasisAdmittedEvent,
    constructGraphCallOpenedEvent(executionBasis),
    constructFrameOpenedEvent(executionBasis),
    constructVectorTraversalPlannedEvent({
      basis: executionBasis,
      vectorIndex: vector.compact.vectorIndex
    })
  ] satisfies readonly RuntimeEvent[]);
  const emitterContext = createSeededLiveEmitterContext(input.priorEvents);
  const emittedPrelude = emitWithContext(
    emitterContext,
    lifecyclePrelude,
    input.eventSink
  );
  const basisAdmittedEvent = emittedPrelude[0];
  if (basisAdmittedEvent?.kind !== "basis_admitted") {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "canonical lifecycle emission did not preserve basis admission first"
    });
  }
  const emittedInvocation = emitWithContext(
        emitterContext,
        constructConstructionGraphActionInvokedEvent({
          constructionEventRef:
            `construction-event://abiogenesis/system/one-surface/${stableSha256Digest({
              intentId: admittedIntent.intentId,
              executionBasisId: executionBasis.id
            }).slice("sha256:".length)}/7-graph-action-invoked`,
          admittedIntent,
          basisId: input.selectedIntentEvent.basisId,
          graphFunctionId: input.selectedIntentEvent.graphFunctionId,
          runId: input.selectedIntentEvent.runId,
          workKey: input.selectedIntentEvent.workKey,
          eventSequence: 7,
          graphCallId: graphCallIdForBasis(executionBasis),
          frameId: frameIdForBasis(executionBasis),
          continuationId: null,
          causationEventRefs: Object.freeze([
            input.selectedIntentEvent.constructionEventRef
          ])
        }),
        input.eventSink
      );
  const constructionInvokedEvent = emittedInvocation[0] ?? null;
  if (
    constructionInvokedEvent !== null &&
    constructionInvokedEvent.kind !== "construction_graph_action_invoked"
  ) {
    throw new T270DirectExecutionError({
      code: "authority_mismatch",
      message: "canonical construction invocation event was not preserved"
    });
  }
  if (constructionInvokedEvent !== null && admittedIntent !== null) {
    admitConstructionRuntimeEvents({
      episodeId: admittedIntent.episodeId,
      events: Object.freeze([
        ...input.priorEvents.filter(isConstructionRuntimeEvent),
        constructionInvokedEvent
      ])
    });
  }

  let values = environment({
    executionBasisId: executionBasis.id,
    carriers: input.ingress.admittedInputCarriers.carriers
  });
  const initialInputCarriers = input.ingress.admittedInputCarriers;
  const outcome = await interpretCompleteCProgram({
    kind: "c_program_interpreter_invocation",
    plan: vector.source.completeProgramPlan,
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedExecutionBinding.entryRef,
    parentBasisId: executionBasis.id,
    parentGraphCallId: graphCallIdForBasis(executionBasis),
    parentFrameId: frameIdForBasis(executionBasis),
    vectorIndex: vector.compact.vectorIndex,
    inputPayloadRef: input.ingress.admittedInputCarriers.carriers[0]!.carrierRef,
    inputLineageRef:
      input.ingress.admittedInputCarriers.carriers[0]!.admissionRef,
    replayReceipts: Object.freeze([]),
    invokeAdmittedAtom: async (
      request
    ): Promise<CProgramAtomInvocationSubmission> => {
      if (
        request.kind !== "c_program_stage_atom_request" ||
        !sameStageRequest(request, locus.node)
      ) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "T-271 atom request differs from the exact compiler-projected locus"
        });
      }
      if (request.fibre === "F_D") {
        if (implementation === null) {
          throw new T270DirectExecutionError({
            code: "implementation_unavailable",
            message: "compiler-selected F_D locus lacks its exact implementation"
          });
        }
        const carrierSet = exactCarrierSet({
          values,
          schemaRefs: implementation.inputSchemaRefs
        });
        const admitted = admitTargetCandidateForAtom({
          request,
          graphEdge: vectorEdge(executionBasis, request.vectorIndex),
          candidate: implementation.invoke(carrierSet),
          target,
          targetCarrier: vector.source.targetCarrierProjection,
          capabilities,
          graphFunctionId: input.selectedExecutionBinding.graphFunctionId,
          selectedExecutionBinding: input.selectedExecutionBinding,
          selectedExecutionBindingDigest: selectedDigest,
          inputCarriers: carrierSet.carriers,
          producerRef: implementation.implementationRef,
          actorInvocationId: null,
          evidenceNamespace: "fd-value",
          evidenceClass: "schema_admitted_deterministic_output"
        });
        values = extendAdmittedRuntimeValueEnvironment({
          current: values,
          admittedOutput: admitted.output
        });
        return Object.freeze({
          kind: "c_program_atom_invocation_submission" as const,
          result: Object.freeze({
            kind: "c_program_atom_result" as const,
            planRef: request.planRef,
            nodeRef: request.nodeRef,
            cursorRef: request.cursorRef,
            status: "completed" as const,
            outputCarrierRef: request.outputCarrierRef,
            outputPayloadRef: admitted.output.carrierRef,
            responseContractRef: request.outputCarrierRef,
            outputLineageRef: admitted.output.admissionRef,
            reasonRef: null,
            failureClass: null,
            evidenceRefs: Object.freeze([admitted.evidenceRef]),
            cCallRef: request.cCallRef,
            sourceEventRefs: Object.freeze([admitted.evidenceRef])
          }),
          admittedTargetCarrier: admitted.output,
          interiorEvents: Object.freeze([]),
          evidenceEvents: admitted.evidenceEvents,
          closeBasis: admitted.closeBasis
        });
      }

      if (locus.stage.compositionStageRole !== "transform") {
        throw new T270DirectExecutionError({
          code: "semantic_not_realized",
          gapRef: T270_DIRECT_RUNTIME_GAP,
          message:
            "the bounded T-270 sunny executor has not yet admitted the F_P evaluate atom"
        });
      }
      const contextContract = locus.compiledExecutionContext;
      if (
        contextContract === null ||
        contextContract.selectedRegime !== "F_P"
      ) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "compiler-selected F_P locus lacks its compiled execution context"
        });
      }
      const joined = joinDeclaredExecutionContext({
        sourceOutcome: vector.sourceInput.outcome,
        stageBasis: constructDeclaredCStageInvocationBasis({
          programBindingDigest:
            contextContract.selectedProgramBinding.bindingDigest,
          stageIndex: contextContract.selectedStageIndex,
          stageRole: contextContract.selectedStageRole,
          regime: "F_P",
          termDigest: contextContract.selectedStageDigest,
          instructionCategoryRefs: request.instructionCategoryRefs
        }),
        selectedCatalogEntryRef: input.selectedExecutionBinding.entryRef,
        catalogBasis: input.catalogBasis,
        invocationCarriers: initialInputCarriers
      });
      if (joined.status !== "request_constructed") {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            `T-256 execution-context join did not construct a request: ${joined.status}: ${joined.diagnostics
              .map((diagnostic) => diagnostic.actualRelation)
              .join("; ")}`
        });
      }
      if (joined.request.regime !== "F_P" || joined.instructionAssembly === null) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "T-256 execution-context join did not produce an F_P instruction assembly"
        });
      }
      if (
        joined.compiledContract.contractRef !== contextContract.contractRef ||
        joined.compiledContract.contractDigest !== contextContract.contractDigest
      ) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "T-256 execution-context join differs from the compiler-selected context contract"
        });
      }
      if (joined.request.stageRole !== request.domainStageRole) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "T-256 execution-context join differs from the compiler-selected stage role"
        });
      }
      if (
        joined.request.resultContractRef !==
          locus.resultAuthority.selectedResultContractRef
      ) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "T-256 execution-context join differs from the compiler-selected result contract"
        });
      }
      const declarationOwner = vector.sourceInput.declarationOwnerGraphFunction;
      const pluginSelection = executionBasis.compiledExecutionDeclarations
        .pluginSelection;
      if (
        executionBasis.compiledExecutionDeclarations.sourceRef !==
          declarationOwner.name ||
        pluginSelection === null
      ) {
        throw new T270DirectExecutionError({
          code: "implementation_unavailable",
          message:
            "compiler-selected F_P locus has no exact compiled plugin selection"
        });
      }
      const resultLocus = projectFpResultLocusContract({
        compositionStageRole: locus.stage.compositionStageRole,
        pluginSelection,
        sourceRef: locus.node.nodeRef
      });
      if (
        resultLocus.requiredPluginSeam !== "fpDispatch" ||
        resultLocus.wireProfile !== "attached_transform_result" ||
        locus.resultAuthority.resultEnvelopeContractRef !==
          joined.request.resultContractRef ||
        !locus.resultAuthority.selectorAuthorityRefs.includes(
          `fp-result-wire-profile:${resultLocus.wireProfile}`
        )
      ) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "compiler-selected F_P transform locus differs from its T-257 result contract"
        });
      }
      const selectedPlugin = resolveDeclaredPluginSelection({
        selection: pluginSelection,
        sourceRef: declarationOwner.id,
        catalog: pluginCatalog
      }).fpDispatch;
      if (
        selectedPlugin === undefined ||
        selectedPlugin.contract.ref !== resultLocus.pluginRef
      ) {
        throw new T270DirectExecutionError({
          code: "implementation_unavailable",
          message:
            "compiler-selected F_P transform locus did not resolve its declared fpDispatch plugin"
        });
      }
      const rendered = renderPromptManifest({
        manifestRef:
          `prompt-manifest://abg/t270/${request.cCallRef.replace(/[^A-Za-z0-9._~-]/gu, "_")}`,
        plan: joined.instructionAssembly.plan,
        envelope: joined.instructionAssembly.envelope,
        rendererRef: "renderer://abg/instruction-assembly/default"
      });
      if (
        !rendered.accepted ||
        rendered.manifest.selectedOutputContractRef !==
          joined.request.resultContractRef
      ) {
        throw new T270DirectExecutionError({
          code: "implementation_unavailable",
          message:
            "T-256 instruction assembly did not render the selected F_P result contract"
        });
      }
      const effectiveRegime = deriveEffectiveVectorRegime({
        basis: executionBasis,
        vectorIndex: request.vectorIndex
      });
      if (effectiveRegime.regime !== "F_P") {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message: "effective runtime regime differs from the selected F_P locus"
        });
      }
      const transition = Object.freeze({
        kind: "fp_dispatch" as const,
        basis: executionBasis,
        vectorIndex: request.vectorIndex,
        edge: vectorEdge(executionBasis, request.vectorIndex),
        effectiveRegime,
        dispatchRef:
          `dispatch://abg/t270/${stableSha256Digest({ cCallRef: request.cCallRef, pluginRef: resultLocus.pluginRef }).slice("sha256:".length)}`
      });
      const actorInvocation = actorInvocationForAtom({
        basis: executionBasis,
        request,
        transition,
        selectedResultContractRef: joined.request.resultContractRef
      });
      const pluginProjection = deriveRuntimeAggregateProjection(
        executionBasis,
        emittedPrelude
      );
      const pluginInput = constructEnginePluginInput({
        contract: selectedPlugin.contract,
        basis: executionBasis,
        projection: pluginProjection,
        replayEvents: emittedPrelude,
        vectorIndex: request.vectorIndex,
        edge: transition.edge,
        regime: "F_P",
        actorInvocationRef: Object.freeze({
          actorInvocationId: actorInvocation.actorInvocationId,
          attemptIndex: actorInvocation.attemptIndex,
          dispatchRef: actorInvocation.dispatchRef,
          resultRef: actorInvocation.resultRef
        }),
        cCallRef: request.cCallRef,
        targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle(),
        instructionPromptManifest: rendered.manifest
      });
      if (
        pluginInput.fpTransformRequest === null ||
        pluginInput.fpTransformRequest.selectedResultContractRef !==
          joined.request.resultContractRef
      ) {
        throw new T270DirectExecutionError({
          code: "authority_mismatch",
          message:
            "selected fpDispatch plugin input lacks its T-256 result-contract binding"
        });
      }
      const promptEvent = constructInstructionPromptManifestProjectedEvent({
        invocation: actorInvocation,
        manifest: rendered.manifest,
        causationEventRefs: Object.freeze([request.cCallRef]),
        correlationId: actorInvocation.correlationId
      });
      const dispatchEvent = constructFpDispatchRequestedEvent(transition);
      const startedEvent = constructActorInvocationStartedEvent(actorInvocation);
      const startEvents = Object.freeze([
        promptEvent,
        dispatchEvent,
        startedEvent
      ]);
      let rawOutcome;
      try {
        rawOutcome = await selectedPlugin.dispatch(pluginInput);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        const closedEvent = constructActorInvocationClosedEvent({
          invocation: actorInvocation,
          closureStatus: "blocked",
          resultRef: null,
          detail: `${reason} (transport_failure)`
        });
        return failedAtomSubmission({
          request,
          reason: `T-270 F_P dispatch failed: ${reason}`,
          failureClass: "runtime_failure",
          interiorEvents: Object.freeze([...startEvents, closedEvent])
        });
      }
      let admittedOutcome;
      try {
        admittedOutcome = admitFpDispatchOutcome(
          rawOutcome,
          "T270.compilerSelectedFpDispatchOutcome"
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        const closedEvent = constructActorInvocationClosedEvent({
          invocation: actorInvocation,
          closureStatus: "blocked",
          resultRef: null,
          detail: `${reason} (contract_failure)`
        });
        return failedAtomSubmission({
          request,
          reason,
          failureClass: "contract_failure",
          interiorEvents: Object.freeze([...startEvents, closedEvent])
        });
      }
      if (admittedOutcome.status === "blocked") {
        const closedEvent = constructActorInvocationClosedEvent({
          invocation: actorInvocation,
          closureStatus: "blocked",
          resultRef: null,
          detail: admittedOutcome.reason
        });
        return admittedOutcome.failureClass === null
          ? blockedAtomSubmission({
              request,
              reason: admittedOutcome.reason,
              evidenceRefs: admittedOutcome.evidenceRefs,
              interiorEvents: Object.freeze([...startEvents, closedEvent])
            })
          : failedAtomSubmission({
              request,
              reason: admittedOutcome.reason,
              failureClass: admittedOutcome.failureClass,
              evidenceRefs: admittedOutcome.evidenceRefs,
              interiorEvents: Object.freeze([...startEvents, closedEvent])
            });
      }
      if (admittedOutcome.resultRef !== actorInvocation.resultRef) {
        const closedEvent = constructActorInvocationClosedEvent({
          invocation: actorInvocation,
          closureStatus: "blocked_with_artifact",
          resultRef: admittedOutcome.resultRef,
          detail: "F_P result identity differs from its dispatch request (contract_failure)"
        });
        return failedAtomSubmission({
          request,
          reason: "F_P result identity differs from its dispatch request",
          failureClass: "contract_failure",
          evidenceRefs: admittedOutcome.evidenceRefs,
          interiorEvents: Object.freeze([...startEvents, closedEvent])
        });
      }
      let envelope;
      try {
        envelope = requireFpResultContractEnvelope({
          profile: "attached_transform_result",
          selectedResultContractRef: joined.request.resultContractRef,
          rawResult: {
            ...admittedOutcome.resultArtifactCandidate,
            target_value: admittedOutcome.targetValueCandidate
          },
          label: "T270.compilerSelectedFpTransformResult"
        });
        if (
          envelope.profile !== "attached_transform_result" ||
          envelope.resultArtifactCandidate["edge"] !== transition.edge
        ) {
          throw new TypeError(
            "F_P transform result edge differs from the compiler-selected GraphVector edge"
          );
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        const artifactEvent = constructActorResultArtifactObservedEvent({
          invocation: actorInvocation,
          artifactRef: admittedOutcome.resultRef,
          artifactPayload: admittedOutcome.resultArtifactCandidate
        });
        const closedEvent = constructActorInvocationClosedEvent({
          invocation: actorInvocation,
          closureStatus: "blocked_with_artifact",
          resultRef: admittedOutcome.resultRef,
          detail: `${reason} (contract_failure)`
        });
        return failedAtomSubmission({
          request,
          reason,
          failureClass: "contract_failure",
          evidenceRefs: admittedOutcome.evidenceRefs,
          interiorEvents: Object.freeze([
            ...startEvents,
            artifactEvent,
            closedEvent
          ])
        });
      }
      const artifactEvent = constructActorResultArtifactObservedEvent({
        invocation: actorInvocation,
        artifactRef: admittedOutcome.resultRef,
        artifactPayload: envelope.resultArtifactCandidate
      });
      const responseEvent =
        constructInstructionResponseContractAdmittedEvent({
          invocation: actorInvocation,
          manifest: rendered.manifest,
          artifactEvent,
          causationEventRefs: Object.freeze([
            rendered.manifest.manifestRef,
            artifactEvent.artifactRef
          ]),
          correlationId: actorInvocation.correlationId
        });
      const closedEvent = constructActorInvocationClosedEvent({
        invocation: actorInvocation,
        closureStatus: "completed",
        resultRef: admittedOutcome.resultRef,
        detail: null
      });
      const admitted = admitTargetCandidateForAtom({
        request,
        graphEdge: vectorEdge(executionBasis, request.vectorIndex),
        candidate: envelope.targetValueCandidate,
        target,
        targetCarrier: vector.source.targetCarrierProjection,
        capabilities,
        graphFunctionId: input.selectedExecutionBinding.graphFunctionId,
        selectedExecutionBinding: input.selectedExecutionBinding,
        selectedExecutionBindingDigest: selectedDigest,
        inputCarriers: initialInputCarriers.carriers,
        producerRef: selectedPlugin.contract.ref,
        actorInvocationId: actorInvocation.actorInvocationId,
        evidenceNamespace: "fp-value",
        evidenceClass: "schema_admitted_probabilistic_output"
      });
      values = extendAdmittedRuntimeValueEnvironment({
        current: values,
        admittedOutput: admitted.output
      });
      const evidenceRefs = Object.freeze([
        ...new Set([
          ...admittedOutcome.evidenceRefs,
          admittedOutcome.resultRef,
          admitted.evidenceRef
        ])
      ]);
      return Object.freeze({
        kind: "c_program_atom_invocation_submission" as const,
        result: Object.freeze({
          kind: "c_program_atom_result" as const,
          planRef: request.planRef,
          nodeRef: request.nodeRef,
          cursorRef: request.cursorRef,
          status: "completed" as const,
          outputCarrierRef: request.outputCarrierRef,
          outputPayloadRef: admitted.output.carrierRef,
          responseContractRef: request.outputCarrierRef,
          outputLineageRef: admitted.output.admissionRef,
          reasonRef: null,
          failureClass: null,
          evidenceRefs,
          cCallRef: request.cCallRef,
          sourceEventRefs: Object.freeze([
            request.cCallRef,
            admittedOutcome.resultRef,
            admitted.evidenceRef
          ])
        }),
        admittedTargetCarrier: admitted.output,
        interiorEvents: Object.freeze([
          ...startEvents,
          artifactEvent,
          responseEvent,
          closedEvent
        ]),
        evidenceEvents: admitted.evidenceEvents,
        closeBasis: admitted.closeBasis
      });
    }
  });
  const lifecycleConclusion = outcome.status === "completed"
    ? Object.freeze([
        constructVectorEvaluatedEvent({
          basis: executionBasis,
          vectorIndex: vector.compact.vectorIndex,
          status: "accepted"
        }),
        constructVectorClosedEvent({
          basis: executionBasis,
          vectorIndex: vector.compact.vectorIndex,
          closureKind: "advanced"
        })
      ] satisfies readonly RuntimeEvent[])
    : Object.freeze([
        constructVectorEvaluatedEvent({
          basis: executionBasis,
          vectorIndex: vector.compact.vectorIndex,
          status: "blocked"
        })
      ] satisfies readonly RuntimeEvent[]);
  const emittedCCallEvents = emitWithContext(
    emitterContext,
    outcome.runtimeEvents,
    input.eventSink
  );
  const emittedConclusion = emitWithContext(
    emitterContext,
    lifecycleConclusion,
    input.eventSink
  );
  const executionRuntimeEvents = Object.freeze([
    ...emittedPrelude,
    ...emittedCCallEvents,
    ...emittedConclusion
  ]);
  const runtimeEvents = Object.freeze([
    ...emittedPrelude,
    ...emittedInvocation,
    ...emittedCCallEvents,
    ...emittedConclusion
  ]);
  const runtimeAggregateProjection = deriveRuntimeAggregateProjection(
    executionBasis,
    executionRuntimeEvents
  );
  const payloadLedger = derivePayloadLedgerProjection({
    basis: executionBasis,
    runtimeProjection: runtimeAggregateProjection,
    events: executionRuntimeEvents,
    vectorIndex: vector.compact.vectorIndex,
    targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle()
  });
  const admittedOutputAuthority = deriveAdmittedOutputAuthorityProjection({
    ledger: payloadLedger
  });
  const assuranceProjection = outcome.status === "completed"
    ? (() => {
        const assuranceScope = deriveAssuranceScopeRef({
          basis: executionBasis,
          projection: runtimeAggregateProjection,
          vectorIndex: vector.compact.vectorIndex
        });
        return deriveAssuranceProjection({
          basis: executionBasis,
          runtimeProjection: runtimeAggregateProjection,
          authoritySnapshot: deriveAssuranceAuthoritySnapshotFromPayloadLedger({
            assuranceScope,
            ledger: payloadLedger
          }),
          evidenceRows: deriveAssuranceEvidenceRowsFromPayloadLedger({
            assuranceScope,
            ledger: payloadLedger
          })
        });
      })()
    : null;
  const deterministicClosurePolicy =
    vector.sourceInput.outcome.handoff.targetCarrierBinding;
  return Object.freeze({
    kind: "t270_direct_execution_result",
    witness,
    executionBasis,
    basisAdmittedEvent,
    constructionInvokedEvent,
    runtimeProjection: compiled.runtimeProjection,
    runtimeAggregateProjection,
    payloadLedger,
    admittedOutputAuthority,
    assuranceProjection,
    deterministicClosurePolicy,
    outcome,
    values,
    runtimeEvents
  });
}

function sameStageRequest(
  request: CProgramStageAtomRequest,
  node: TraversalExecutionFamilyRuntimeLocusProjection["node"] & {
    readonly kind: "compiled_c_stage_leaf";
  }
): boolean {
  return request.planRef.length > 0 &&
    request.nodeRef === node.nodeRef &&
    request.nodeDigest === node.nodeDigest &&
    request.sourcePath === node.sourcePath &&
    request.inputCarrierRef === node.inputCarrierRef &&
    request.outputCarrierRef === node.outputCarrierRef &&
    request.domainStageRole === node.domainStageRole &&
    request.fibre === node.fibre &&
    request.armId === node.armId &&
    request.resultBearing === node.resultBearing &&
    stableJsonEquals(
      request.instructionCategoryRefs,
      node.instructionCategoryRefs
    );
}
