import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  projectExactPrefixArtifactTruth,
  type ExactPrefixArtifactTruthProjection,
} from "../abg/artifact_truth.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  closeAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
  type AcquiredAbgEventResource,
} from "../abg/definition_event_resource.js";
import {
  hasAdmittedProductInstall,
  projectAdmittedProductInstall,
  projectAdmittedWorkspaceBinding,
  type PublicOperationAdmissionBasis,
} from "../abg/environment_admission.js";
import {
  admitExecutionBasis,
  admitInvocationRefusal,
  hasExactInvocationObservationBasis,
} from "../abg/execution_basis.js";
import {
  type DurablePrefixCoordinate,
  type EventStoreCloseHandoff,
  validateDurablePrefixCoordinate,
  validateEventStoreCloseHandoff,
} from "../abg/event_store.js";
import {
  admitExactInvocation,
  rehydrateInvocationSourceResultBasisAtDurablePrefix,
  type InvocationAdmission,
} from "../abg/invocation_admission.js";
import { openTraversalScope } from "../abg/open_call.js";
import {
  projectRunTruthAtDurablePrefix,
  type AbgRunTruthCoordinate,
  type AbgRunTruthProjection,
} from "../abg/project_read_ports.js";
import { projectRuntimeTruthAtDurablePrefix } from "../abg/replay.js";
import { materializeGraph } from "../gtl/materialize.js";
import { executeGraphTraversal } from "../hog/graph_execute.js";
import { constructAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import type {
  DeclarationApplication,
  GraphFunctionCatalogView,
  ReadyGraphFunctionCatalog,
} from "../product/catalog.js";
import type {
  ProductInstall,
  WorkspaceBinding,
  WorkspaceBindingCandidate,
} from "../product/environment.js";
import {
  ProductRunInvocationPort,
  type PreparedProductRunInvocation,
  type ProductRunInvocationResourceAssertion,
  type ProductRunInvocationSourceAssertion,
  type RunInvocationMemberKey,
} from "../product/run_invocation_operation.js";
import { RUN_OPERATION_CONTRACTS } from
  "../product/run_operation_contracts.js";
import {
  projectInstalledLeafSemantics,
  type ProductInvocationSourceResultBasis,
} from "../product/semantics.js";
import { canonicalJson, type JsonValue } from
  "../shared/canonical_json.js";
import { isRecord } from "../shared/definition_binding_mechanics.js";
import { bindExactPrefixTransition } from
  "../shared/static_definition_bindings.js";
import {
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  absolutePathSchema,
  digestSchema,
  jsonValueSchema,
  nonblankSchema,
  refDigestSchema,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import { validateGraph } from "../validator/graph.js";

type InvokePacket = typeof RUN_OPERATION_CONTRACTS.invoke.invoke;
type StartPacket = typeof RUN_OPERATION_CONTRACTS.invoke.start;
type RunPacket = InvokePacket | StartPacket;

export interface RunInvocationResourceAssertion
  extends ProductRunInvocationResourceAssertion {
  readonly kind: "run_invocation_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
}

export interface RunInvocationResourceReceipt {
  readonly kind: "run_invocation_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
  readonly productExecutionResolution: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }> | null;
  readonly invocationAdmission: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }> | null;
  readonly run: AbgRunTruthCoordinate | null;
  readonly replay: AbgRunTruthCoordinate | null;
}

type RunCallable<TPacket extends RunPacket> = ExactDefinitionCallable<
  TPacket,
  RunInvocationResourceAssertion,
  RunInvocationResourceReceipt
>;

interface AdmittedSetupTruth {
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly admittedInstalls: readonly ProductInstall[];
  readonly workspaceBinding: WorkspaceBinding;
}

function fault<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<TPacket["definitionKey"]> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    stage,
    code,
    message,
    evidence: {},
  });
}

function syncStage<TPacket extends RunPacket, A>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  action: () => A,
): Effect.Effect<A, DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Effect.try({
    try: action,
    catch: (cause) => fault(
      call,
      stage,
      `${stage}_failure`,
      cause instanceof Error ? cause.message : String(cause),
    ),
  });
}

function asyncStage<TPacket extends RunPacket, A>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  stage: string,
  action: () => Promise<A>,
): Effect.Effect<A, DefinitionExecutionFault<TPacket["definitionKey"]>> {
  return Effect.tryPromise({
    try: action,
    catch: (cause) => fault(
      call,
      stage,
      `${stage}_failure`,
      cause instanceof Error ? cause.message : String(cause),
    ),
  });
}

function exactIJson(value: unknown): boolean {
  try {
    canonicalJson(value as JsonValue);
    return true;
  } catch {
    return false;
  }
}

const I_JSON_OBJECT_SCHEMA = v.custom<Readonly<Record<string, JsonValue>>>(
  (value) => isRecord(value) && exactIJson(value),
  "exact_i_json_object",
);

const GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog_entry"),
  handle: nonblankSchema,
  definitionRef: nonblankSchema,
  definitionDigest: digestSchema,
  definition: I_JSON_OBJECT_SCHEMA,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  publicationDigest: digestSchema,
  programMembershipRefs: v.array(nonblankSchema),
  compatibilityRefs: v.array(nonblankSchema),
  provenanceRefs: v.array(nonblankSchema),
  entryDigest: digestSchema,
});

const DECLARATION_CATALOG_ENTRY_SCHEMA = v.strictObject({
  kind: v.literal("declaration_catalog_entry"),
  handle: nonblankSchema,
  declarationKind: v.union([v.literal("node_type"), v.literal("overlay")]),
  declarationOrContractRef: nonblankSchema,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  publicationDigest: digestSchema,
  programMembershipRefs: v.array(nonblankSchema),
  compatibilityRefs: v.array(nonblankSchema),
  provenanceRefs: v.array(nonblankSchema),
  entryDigest: digestSchema,
});

const WORKSPACE_BINDING_CANDIDATE_SCHEMA = v.strictObject({
  kind: v.literal("workspace_binding_candidate"),
  schemaVersion: v.literal("5.0.0"),
  bindingId: nonblankSchema,
  bindingDigest: digestSchema,
  workspaceId: nonblankSchema,
  authorityBasisId: nonblankSchema,
  authorityBasisDigest: digestSchema,
  authorizedActorRef: nonblankSchema,
  productSetId: nonblankSchema,
  productSetDigest: digestSchema,
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  roots: v.strictObject({
    toolchainRoot: absolutePathSchema,
    productRoot: absolutePathSchema,
    eventLogRoot: absolutePathSchema,
    runtimeStateRoot: absolutePathSchema,
    projectionRoot: absolutePathSchema,
    archiveRoot: absolutePathSchema,
  }),
}) as v.GenericSchema<WorkspaceBindingCandidate, WorkspaceBindingCandidate>;

const CATALOG_READINESS_ROW_SCHEMA = v.strictObject({
  handle: nonblankSchema,
  owningProductId: nonblankSchema,
  moduleRef: nonblankSchema,
  disposition: v.picklist([
    "admitted",
    "rejected",
    "incompatible",
    "conflicting",
    "unready",
    "unresolved",
  ]),
  readiness: v.picklist(["ready", "not_ready"]),
  reason: v.nullable(v.string()),
  readinessPrerequisiteRefs: v.array(nonblankSchema),
  rowDigest: digestSchema,
});

const READY_GRAPH_FUNCTION_CATALOG_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog"),
  schemaVersion: v.literal("5.0.0"),
  basisDigest: digestSchema,
  publicationDigests: v.array(digestSchema),
  entries: v.array(GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  byHandle: v.record(v.string(), GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  declarationEntries: v.array(DECLARATION_CATALOG_ENTRY_SCHEMA),
  declarationsByHandle: v.record(
    v.string(),
    DECLARATION_CATALOG_ENTRY_SCHEMA,
  ),
  readinessBasisDigest: digestSchema,
  workspaceBindingId: nonblankSchema,
  workspaceBindingDigest: digestSchema,
  lockId: nonblankSchema,
  lockDigest: digestSchema,
  productSetId: nonblankSchema,
  productSetDigest: digestSchema,
  readinessBasis: v.strictObject({
    workspaceBinding: WORKSPACE_BINDING_CANDIDATE_SCHEMA,
    resolvedLock: I_JSON_OBJECT_SCHEMA,
    verifiedProducts: v.array(I_JSON_OBJECT_SCHEMA),
    installedProducts: v.array(I_JSON_OBJECT_SCHEMA),
    publications: v.array(I_JSON_OBJECT_SCHEMA),
  }),
  boundPublications: v.array(I_JSON_OBJECT_SCHEMA),
  rowDispositions: v.array(CATALOG_READINESS_ROW_SCHEMA),
}) as unknown as v.GenericSchema<
  ReadyGraphFunctionCatalog,
  ReadyGraphFunctionCatalog
>;

const GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA = v.strictObject({
  kind: v.literal("graph_function_catalog_view"),
  catalogBasisDigest: digestSchema,
  allowlist: v.array(nonblankSchema),
  entries: v.array(GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  byHandle: v.record(v.string(), GRAPH_FUNCTION_CATALOG_ENTRY_SCHEMA),
  declarationEntries: v.array(DECLARATION_CATALOG_ENTRY_SCHEMA),
  declarationsByHandle: v.record(
    v.string(),
    DECLARATION_CATALOG_ENTRY_SCHEMA,
  ),
  viewDigest: digestSchema,
}) as unknown as v.GenericSchema<
  GraphFunctionCatalogView,
  GraphFunctionCatalogView
>;

const DECLARATION_APPLICATION_SCHEMA = v.strictObject({
  kind: v.literal("declaration_application"),
  catalogBasisDigest: digestSchema,
  viewDigest: digestSchema,
  declaration: DECLARATION_CATALOG_ENTRY_SCHEMA,
  targetRef: nonblankSchema,
  targetDigest: digestSchema,
  appliedValueRef: nonblankSchema,
  appliedValueDigest: digestSchema,
  applicationRef: nonblankSchema,
  applicationDigest: digestSchema,
}) as v.GenericSchema<DeclarationApplication, DeclarationApplication>;

const EVENT_RESOURCE_ASSERTION_SCHEMA = v.union([
  v.strictObject({
    kind: v.literal("new_abg_event_resource"),
    schemaVersion: v.literal("5.0.0"),
    eventLogPath: absolutePathSchema,
    locatorDigest: digestSchema,
  }),
  v.strictObject({
    kind: v.literal("reopen_abg_event_resource"),
    schemaVersion: v.literal("5.0.0"),
    closeHandoff: v.custom<EventStoreCloseHandoff>(
      validateEventStoreCloseHandoff,
      "event_store_close_handoff",
    ),
    handoffDigest: digestSchema,
  }),
]) as v.GenericSchema<
  AbgEventResourceAssertion,
  AbgEventResourceAssertion
>;

const EVENT_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("abg_event_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  acquisitionKind: v.union([v.literal("new"), v.literal("reopen")]),
  entryPrefix: v.custom<DurablePrefixCoordinate>(
    validateDurablePrefixCoordinate,
    "durable_prefix_coordinate",
  ),
  closeHandoff: v.custom<EventStoreCloseHandoff>(
    validateEventStoreCloseHandoff,
    "event_store_close_handoff",
  ),
  receiptDigest: digestSchema,
}) as v.GenericSchema<AbgEventResourceReceipt, AbgEventResourceReceipt>;

const RUN_TRUTH_COORDINATE_SCHEMA = v.strictObject({
  ref: nonblankSchema,
  digest: digestSchema,
}) as v.GenericSchema<AbgRunTruthCoordinate, AbgRunTruthCoordinate>;

const RUN_INVOCATION_SOURCE_ASSERTION_SCHEMA = v.union([
  v.strictObject({ kind: v.literal("none") }),
  v.strictObject({
    kind: v.literal("admitted_source_result"),
    basis: v.strictObject({
      kind: v.literal("invocation_source_result_basis"),
      schemaVersion: v.literal("5.0.0"),
      basisRef: nonblankSchema,
      basisDigest: digestSchema,
      publicAuthorityDigest: digestSchema,
      sourceInvocationAdmissionRef: nonblankSchema,
      sourceInvocationRef: nonblankSchema,
      sourceRunId: nonblankSchema,
      sourceGraphCallId: nonblankSchema,
      sourceGraphFunctionRef: nonblankSchema,
      sourceCCallRef: nonblankSchema,
      sourceResultAdmissionEventRef: nonblankSchema,
      sourceResultJudgmentEventRef: nonblankSchema,
      sourceResultRef: nonblankSchema,
      sourceResultDigest: digestSchema,
      sourceResultValueDigest: digestSchema,
      sourceResultContractRef: nonblankSchema,
      sourceResultValue: jsonValueSchema,
      sourceReplayRef: nonblankSchema,
      sourceReplayDigest: digestSchema,
      sourceWorkspaceId: nonblankSchema,
      workspaceBindingId: nonblankSchema,
      workspaceBindingDigest: digestSchema,
    }),
  }),
]) as v.GenericSchema<
  ProductRunInvocationSourceAssertion,
  ProductRunInvocationSourceAssertion
>;

const RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
  kind: v.literal("run_invocation_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
  catalog: READY_GRAPH_FUNCTION_CATALOG_SCHEMA,
  catalogView: GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA,
  applications: v.array(DECLARATION_APPLICATION_SCHEMA),
  source: RUN_INVOCATION_SOURCE_ASSERTION_SCHEMA,
}) as v.GenericSchema<
  RunInvocationResourceAssertion,
  RunInvocationResourceAssertion
>;

const RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("run_invocation_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_RECEIPT_SCHEMA,
  productExecutionResolution: v.nullable(refDigestSchema),
  invocationAdmission: v.nullable(refDigestSchema),
  run: v.nullable(RUN_TRUTH_COORDINATE_SCHEMA),
  replay: v.nullable(RUN_TRUTH_COORDINATE_SCHEMA),
}) as v.GenericSchema<
  RunInvocationResourceReceipt,
  RunInvocationResourceReceipt
>;

function projectSetupTruth(
  prefix: DurablePrefixCoordinate,
  catalog: ReadyGraphFunctionCatalog,
): AdmittedSetupTruth | null {
  const artifactTruth = projectExactPrefixArtifactTruth(prefix);
  if (artifactTruth.kind === "exact_prefix_artifact_truth_projection_refusal") {
    return null;
  }
  const admittedInstalls = catalog.readinessBasis.installedProducts.map(
    (candidate) => projectAdmittedProductInstall(artifactTruth, candidate),
  );
  const workspaceBinding = projectAdmittedWorkspaceBinding(
    artifactTruth,
    catalog.readinessBasis.workspaceBinding,
  );
  return admittedInstalls.some((install) => install === null) ||
      workspaceBinding === null
    ? null
    : deepFreeze({
        artifactTruth,
        admittedInstalls: admittedInstalls as readonly ProductInstall[],
        workspaceBinding,
      });
}

function operationBasis<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  binding: WorkspaceBinding,
): PublicOperationAdmissionBasis {
  return {
    operationId: "abg.operation.run.invoke",
    memberKey: call.invocation.definitionKey.memberKey,
    definitionDigest: call.invocation.definitionDigest,
    authorityScopeRef: binding.bindingId,
    authorityScopeDigest: binding.bindingDigest,
    invocationRef: call.invocation.invocationRef,
    invocationPayloadDigest: call.invocation.requestDigest,
    invocationDigest: call.invocation.invocationDigest,
    correlationId: call.invocation.correlationRef,
    eventTime: call.invocation.eventTime,
    causationEventRefs: [],
  };
}

function resourceReceipt(
  eventResource: AbgEventResourceReceipt,
  prepared: PreparedProductRunInvocation<RunInvocationMemberKey> | null,
  admission: InvocationAdmission | null,
  truth: AbgRunTruthProjection | null,
): RunInvocationResourceReceipt {
  return deepFreeze({
    kind: "run_invocation_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    eventResource,
    productExecutionResolution: prepared === null
      ? null
      : {
          ref: prepared.resolution.resolution.resolutionRef,
          digest: prepared.resolution.resolution.resolutionDigest,
        },
    invocationAdmission: admission === null
      ? null
      : {
          ref: admission.invocationAdmissionRef,
          digest: admission.invocationAdmissionDigest,
        },
    run: truth?.run ?? null,
    replay: truth?.replay ?? null,
  });
}

function finish<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  resource: AcquiredAbgEventResource,
  finalPrefix: DurablePrefixCoordinate,
  ownerOutput: OwnerSemanticOutput<TPacket>,
  prepared: PreparedProductRunInvocation<RunInvocationMemberKey> | null,
  admission: InvocationAdmission | null,
  truth: AbgRunTruthProjection | null,
): Effect.Effect<
  DefinitionReturn<TPacket, RunInvocationResourceReceipt>,
  DefinitionExecutionFault<TPacket["definitionKey"]>
> {
  return syncStage(call, "resource_close", () => {
    const eventResource = closeAbgEventResource(resource, finalPrefix);
    return deepFreeze({
      ownerOutput,
      resources: resourceReceipt(eventResource, prepared, admission, truth),
    });
  });
}

function runInvocationOwner<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
): ReturnType<RunCallable<TPacket>> {
  return Effect.scoped(Effect.gen(function* () {
    const resource = yield* Effect.acquireRelease(
      Effect.suspend(() => {
        const acquired = acquireAbgEventResource(call.resources.eventResource);
        return acquired.kind === "acquired_abg_event_resource"
          ? Effect.succeed(acquired.resource)
          : Effect.fail(fault(
              call,
              "resource_acquisition",
              acquired.code,
              acquired.message,
            ));
      }),
      (held) => Effect.sync(() => abandonAbgEventResource(held)),
    );
    const entryPrefix = resource.entryPrefix;
    const setup = yield* syncStage(
      call,
      "setup_truth",
      () => projectSetupTruth(entryPrefix, call.resources.catalog),
    );
    if (setup === null) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "setup", code: "admitted_setup_absent" },
        ) as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const source = call.resources.source.kind === "none"
      ? call.resources.source
      : (() => {
          const basis = rehydrateInvocationSourceResultBasisAtDurablePrefix(
            entryPrefix,
            call.resources.source.basis,
          );
          return basis === null
            ? null
            : deepFreeze({
                kind: "admitted_source_result" as const,
                basis,
              });
        })();
    if (source === null) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "source_result_absent" },
        ) as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const productResources = deepFreeze({
      catalog: call.resources.catalog,
      catalogView: call.resources.catalogView,
      applications: call.resources.applications,
      source,
    });
    const preparedResult = yield* asyncStage(
      call,
      "product_prepare",
      () => ProductRunInvocationPort.prepare({
        memberKey: call.invocation.definitionKey.memberKey,
        invocation: call.invocation as never,
        resources: productResources,
        admittedInstalls: setup.admittedInstalls,
        workspaceBinding: setup.workspaceBinding,
        verifyInstallAdmission: (install) =>
          hasAdmittedProductInstall(setup.artifactTruth, install),
        transportResourceAssertion:
          call.resources.eventResource as unknown as JsonValue,
      }),
    );
    if (preparedResult.kind === "product_run_invocation_preparation_refusal") {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        preparedResult.ownerOutput as OwnerSemanticOutput<TPacket>,
        null,
        null,
        null,
      );
    }
    const prepared = preparedResult as PreparedProductRunInvocation<
      RunInvocationMemberKey
    >;
    if (!hasExactInvocationObservationBasis(
      prepared.admittedInput,
      setup.workspaceBinding.bindingId,
      setup.workspaceBinding.bindingDigest,
      prepared.resolution.program,
    )) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "observation_basis_mismatch" },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        null,
        null,
      );
    }
    const admitted = yield* syncStage(call, "invocation_admission", () =>
      admitExactInvocation(
        resource.store,
        {
          invocation: prepared.candidate,
          publicInvocation: prepared.invocation,
          rawInput: prepared.rawInput,
          programPublication: prepared.resolution.programPublication,
          executionResolution: prepared.resolution.resolution,
          program: prepared.resolution.program,
          graphFunction: prepared.resolution.graphFunction,
          programValidation: prepared.resolution.programValidation,
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
          catalogView: productResources.catalogView,
          catalogApplications: productResources.applications,
          policy: prepared.policy,
          capabilityGrants: prepared.grants,
          authority: prepared.authority,
          ...(prepared.sourceResultBasis === null
            ? {}
            : { sourceResultBasis: prepared.sourceResultBasis }),
        },
        operationBasis(call, setup.workspaceBinding),
      )
    );
    if (admitted.kind !== "invocation_admission_receipt") {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "invocation_admission",
            code: admitted.code,
            ...(admitted.kind === "invocation_admission_refusal" &&
                "priorAdmission" in admitted && admitted.priorAdmission !== null
              ? { evidenceRefs: [admitted.priorAdmission.admissionEventRef] }
              : {}),
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        null,
        null,
      );
    }
    const admission = admitted.admission;
    const graph = yield* syncStage(call, "graph_materialization", () =>
      materializeGraph(prepared.resolution.graphFunction, {
        invocationAdmissionRef: admission.invocationAdmissionRef,
        admittedInputRef: prepared.rawInput.admissionRef,
        admittedInputDigest: prepared.rawInput.subjectDigest,
        admittedInput: prepared.rawInput.value,
      })
    );
    const graphValidation = yield* syncStage(call, "graph_validation", () =>
      validateGraph(
        graph,
        prepared.resolution.programValidation,
        prepared.resolution.graphFunction,
        {
          invocationAdmissionRef: admission.invocationAdmissionRef,
          admittedInputRef: prepared.rawInput.admissionRef,
          admittedInputDigest: prepared.rawInput.subjectDigest,
          admittedInput: prepared.rawInput.value,
        },
      )
    );
    if (graphValidation.kind !== "graph_validation") {
      const diagnosticRefs = graphValidation.diagnostics.map((row) =>
        `diagnostic://abiogenesis/validator/${row.code}@5`
      );
      const refused = yield* syncStage(call, "graph_refusal_admission", () =>
        admitInvocationRefusal(
          resource.store,
          admitted.successorPrefix,
          admission,
          "graph_validation",
          graphValidation.subjectDigest,
          diagnosticRefs,
          {
            eventTime: call.invocation.eventTime,
            correlationId: `${call.invocation.correlationRef}/graph-validation`,
            causationEventRefs: [],
          },
        )
      );
      return yield* finish(
        call,
        resource,
        refused.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "graph_validation",
            code: "validation_refused",
            evidenceRefs: [refused.admission.admissionEventRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const execution = yield* syncStage(call, "execution_basis", () =>
      admitExecutionBasis(
        resource.store,
        admitted.successorPrefix,
        {
          invocationAdmission: admission,
          rawInputValue: prepared.admittedInput,
          program: prepared.resolution.program,
          programValidation: prepared.resolution.programValidation,
          graph,
          graphValidation,
          resolutionSetCandidate:
            prepared.resolution.implementationSetCandidate,
          resolutionSetValidation:
            prepared.resolution.implementationSetValidation,
          closureContract: prepared.resolution.closureContract,
        },
        {
          eventTime: call.invocation.eventTime,
          correlationId: `${call.invocation.correlationRef}/execution-basis`,
          causationEventRefs: [],
        },
      )
    );
    if (execution.kind !== "execution_basis_admission") {
      return yield* finish(
        call,
        resource,
        execution.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "execution_basis", code: execution.admission.stage },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const opened = yield* syncStage(call, "open_call", () =>
      openTraversalScope(
        resource.store,
        execution.successorPrefix,
        { kind: "root", executionBasis: execution.executionBasis },
        {
          eventTime: call.invocation.eventTime,
          correlationId: `${call.invocation.correlationRef}/open`,
          causationEventRefs: [],
        },
      )
    );
    if (opened.kind !== "traversal_scope_open_admission") {
      const refused = yield* syncStage(call, "open_refusal_admission", () =>
        admitInvocationRefusal(
          resource.store,
          execution.successorPrefix,
          admission,
          "open_call",
          sha256Canonical(opened as unknown as JsonValue),
          [`diagnostic://abiogenesis/open-call/${opened.code}@5`],
          {
            eventTime: call.invocation.eventTime,
            correlationId: `${call.invocation.correlationRef}/open-refusal`,
            causationEventRefs: [],
          },
        )
      );
      return yield* finish(
        call,
        resource,
        refused.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "open_call",
            code: opened.code,
            evidenceRefs: [refused.admission.admissionEventRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const authorityPrefix = yield* syncStage(call, "runtime_truth", () =>
      projectRuntimeTruthAtDurablePrefix(
        opened.successorPrefix,
        opened.scope.runId,
      ).authorityPrefix
    );
    const leafPort = yield* asyncStage(call, "leaf_port", () =>
      constructAdmittedLeafInvocationPort({
        prefix: authorityPrefix,
        artifactTruth: setup.artifactTruth,
        implementationSet: execution.implementationSet,
        executionResolution: prepared.resolution,
        semanticsProjection: projectInstalledLeafSemantics(
          prepared.resolution.productSemantics,
        ),
      })
    );
    const traversal = yield* asyncStage(call, "hog_traversal", () =>
      executeGraphTraversal({
        store: resource.store,
        predecessorPrefix: opened.successorPrefix,
        executionBasis: execution.executionBasis,
        openedTraversalScope: opened.scope,
        program: prepared.resolution.program,
        graphFunction: prepared.resolution.graphFunction,
        graph,
        graphValidation,
        programValidation: prepared.resolution.programValidation,
        implementationSet: execution.implementationSet,
        interactionSet: execution.interactionSet,
        continuationProductBasis: {
          install: prepared.resolution.programInstall,
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
          catalogView: productResources.catalogView,
          programValidation: prepared.resolution.programValidation,
          graphValidation,
        },
        leafPort,
        closureContract: prepared.resolution.closureContract,
        actorRuntimeBinding: {
          workspaceBinding: setup.workspaceBinding,
          artifactTruth: setup.artifactTruth,
        },
        input: prepared.admittedInput,
        inputDigest: prepared.rawInput.subjectDigest,
        eventTime: call.invocation.eventTime,
        correlationId: `${call.invocation.correlationRef}/hog`,
      })
    );
    if (traversal.kind === "graph_traversal_entry_refusal") {
      return yield* finish(
        call,
        resource,
        opened.successorPrefix,
        ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          {
            stage: "traversal",
            code: traversal.code,
            evidenceRefs: [traversal.diagnosticRef],
          },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const finalPrefix = traversal.successorPrefix;
    const truth = yield* syncStage(call, "run_truth", () =>
      projectRunTruthAtDurablePrefix(finalPrefix, opened.scope.runId)
    );
    const ownerOutput = ProductRunInvocationPort.projectOutcome(
      call.invocation.definitionKey.memberKey,
      truth,
    ) as OwnerSemanticOutput<TPacket>;
    return yield* finish(
      call,
      resource,
      finalPrefix,
      ownerOutput,
      prepared,
      admission,
      truth.kind === "abg_run_truth_projection" ? truth : null,
    );
  }));
}

const invoke = bindExactPrefixTransition(
  RUN_OPERATION_CONTRACTS.invoke.invoke,
  runInvocationOwner<InvokePacket>,
  RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA,
  RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
);

const start = bindExactPrefixTransition(
  RUN_OPERATION_CONTRACTS.invoke.start,
  runInvocationOwner<StartPacket>,
  RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA,
  RUN_INVOCATION_RESOURCE_RECEIPT_SCHEMA,
);

export const RUN_DEFINITION_BINDINGS = Object.freeze({
  invoke: Object.freeze({ invoke, start }),
});
