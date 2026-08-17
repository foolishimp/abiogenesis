import * as Effect from "effect/Effect";

import * as abg from "../abg/index.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  closeAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
  type AcquiredAbgEventResource,
} from "../abg/definition_event_resource.js";
import * as gtl from "../gtl/index.js";
import * as hog from "../hog/index.js";
import { constructAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import * as product from "../product/index.js";
import { RUN_OPERATION_CONTRACTS } from
  "../product/run_operation_contracts.js";
import { canonicalJson, type JsonValue } from
  "../shared/canonical_json.js";
import {
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OwnerSemanticOutput } from
  "../shared/public_function_contracts.js";
import * as validator from "../validator/index.js";

type InvokePacket = typeof RUN_OPERATION_CONTRACTS.invoke.invoke;
type StartPacket = typeof RUN_OPERATION_CONTRACTS.invoke.start;
type RunPacket = InvokePacket | StartPacket;

export interface RunInvocationResourceAssertion
  extends product.ProductRunInvocationResourceAssertion {
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
  readonly run: abg.AbgRunTruthCoordinate | null;
  readonly replay: abg.AbgRunTruthCoordinate | null;
}

type RunCallable<TPacket extends RunPacket> = ExactDefinitionCallable<
  TPacket,
  RunInvocationResourceAssertion,
  RunInvocationResourceReceipt
>;

interface AdmittedSetupTruth {
  readonly artifactTruth: abg.ExactPrefixArtifactTruthProjection;
  readonly admittedInstalls: readonly product.ProductInstall[];
  readonly workspaceBinding: product.WorkspaceBinding;
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

function exactResources(resources: RunInvocationResourceAssertion): boolean {
  try {
    return Object.keys(resources).sort().join("\0") === [
      "applications",
      "catalog",
      "catalogView",
      "eventResource",
      "kind",
      "schemaVersion",
      "source",
    ].sort().join("\0") &&
      resources.kind === "run_invocation_resource_assertion" &&
      resources.schemaVersion === "5.0.0" &&
      Array.isArray(resources.applications) &&
      canonicalJson(resources as unknown as JsonValue).length > 0;
  } catch {
    return false;
  }
}

function projectSetupTruth(
  prefix: abg.DurablePrefixCoordinate,
  catalog: product.ReadyGraphFunctionCatalog,
): AdmittedSetupTruth | null {
  const artifactTruth = abg.projectExactPrefixArtifactTruth(prefix);
  if (artifactTruth.kind === "exact_prefix_artifact_truth_projection_refusal") {
    return null;
  }
  const admittedInstalls = catalog.readinessBasis.installedProducts.map(
    (candidate) => abg.projectAdmittedProductInstall(artifactTruth, candidate),
  );
  const workspaceBinding = abg.projectAdmittedWorkspaceBinding(
    artifactTruth,
    catalog.readinessBasis.workspaceBinding,
  );
  return admittedInstalls.some((install) => install === null) ||
      workspaceBinding === null
    ? null
    : deepFreeze({
        artifactTruth,
        admittedInstalls: admittedInstalls as readonly product.ProductInstall[],
        workspaceBinding,
      });
}

function operationBasis<TPacket extends RunPacket>(
  call: DefinitionCall<TPacket, RunInvocationResourceAssertion>,
  binding: product.WorkspaceBinding,
): abg.PublicOperationAdmissionBasis {
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
  prepared: product.PreparedProductRunInvocation<
    product.RunInvocationMemberKey
  > | null,
  admission: abg.InvocationAdmission | null,
  truth: abg.AbgRunTruthProjection | null,
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
  finalPrefix: abg.DurablePrefixCoordinate,
  ownerOutput: OwnerSemanticOutput<TPacket>,
  prepared: product.PreparedProductRunInvocation<
    product.RunInvocationMemberKey
  > | null,
  admission: abg.InvocationAdmission | null,
  truth: abg.AbgRunTruthProjection | null,
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

function binding<TPacket extends RunPacket>(packet: TPacket): RunCallable<TPacket> {
  return (call) => Effect.scoped(Effect.gen(function* () {
    if (!exactResources(call.resources)) {
      return yield* Effect.fail(fault(
        call,
        "resource_admission",
        "invalid_resource_assertion",
        "run invocation requires one exact Product assertion and ABG resource",
      ));
    }
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
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
          const basis = abg.rehydrateInvocationSourceResultBasisAtDurablePrefix(
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
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
      () => product.ProductRunInvocationPort.prepare({
        memberKey: call.invocation.definitionKey.memberKey,
        invocation: call.invocation as never,
        resources: productResources,
        admittedInstalls: setup.admittedInstalls,
        workspaceBinding: setup.workspaceBinding,
        verifyInstallAdmission: (install) =>
          abg.hasAdmittedProductInstall(setup.artifactTruth, install),
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
    const prepared = preparedResult as product.PreparedProductRunInvocation<
      product.RunInvocationMemberKey
    >;
    if (!abg.hasExactInvocationObservationBasis(
      prepared.admittedInput,
      setup.workspaceBinding.bindingId,
      setup.workspaceBinding.bindingDigest,
      prepared.resolution.program,
    )) {
      return yield* finish(
        call,
        resource,
        entryPrefix,
        product.ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "observation", code: "observation_basis_mismatch" },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        null,
        null,
      );
    }
    const admitted = yield* syncStage(call, "invocation_admission", () =>
      abg.admitExactInvocation(
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
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
      gtl.materializeGraph(prepared.resolution.graphFunction, {
        invocationAdmissionRef: admission.invocationAdmissionRef,
        admittedInputRef: prepared.rawInput.admissionRef,
        admittedInputDigest: prepared.rawInput.subjectDigest,
        admittedInput: prepared.rawInput.value,
      })
    );
    const graphValidation = yield* syncStage(call, "graph_validation", () =>
      validator.validateGraph(
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
        abg.admitInvocationRefusal(
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
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
      abg.admitExecutionBasis(
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
          call.invocation.definitionKey.memberKey,
          { stage: "execution_basis", code: execution.admission.stage },
        ) as OwnerSemanticOutput<TPacket>,
        prepared,
        admission,
        null,
      );
    }
    const opened = yield* syncStage(call, "open_call", () =>
      abg.openTraversalScope(
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
        abg.admitInvocationRefusal(
          resource.store,
          execution.successorPrefix,
          admission,
          "open_call",
          product.sha256Canonical(opened as unknown as product.JsonValue),
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
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
      abg.projectRuntimeTruthAtDurablePrefix(
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
        semanticsProjection: product.projectInstalledLeafSemantics(
          prepared.resolution.productSemantics,
        ),
      })
    );
    const traversal = yield* asyncStage(call, "hog_traversal", () =>
      hog.executeGraphTraversal({
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
        product.ProductRunInvocationPort.projectOwnerRefusal(
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
      abg.projectRunTruthAtDurablePrefix(finalPrefix, opened.scope.runId)
    );
    const ownerOutput = product.ProductRunInvocationPort.projectOutcome(
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

export const RUN_INVOCATION_DEFINITION_BINDINGS = Object.freeze({
  invoke: binding(RUN_OPERATION_CONTRACTS.invoke.invoke),
  start: binding(RUN_OPERATION_CONTRACTS.invoke.start),
});
