// Executes result-bearing One Surface authority leaves through the existing
// complete-C interpreter. The admitted program topology supplies stage order;
// implementations supply only each distinct F_D meaning.

import {
  admitOneSurfaceResultForClose,
  type OneSurfaceResultValueByKind
} from "../contracts/one_surface_contract_family.js";
import type {
  AdmittedOneSurfaceAuthorityResult,
  NextActionProjection,
  OneSurfaceAuthorityFunctionKind,
  OneSurfaceAuthorityInputBasis,
  OneSurfaceProgramMemberProjection,
  OneSurfaceRefDigest,
  TargetObligationBinding,
  OneSurfaceTargetObligationInput,
  ProductAssetModel
} from "../contracts/one_surface_authority.js";
import {
  assertOneSurfaceProgramMemberProjection,
  constructNextActionBasis,
  deriveOneSurfaceTargetOutcomeRef,
  deriveNextActionProjection,
  deriveProgramActionCatalog,
  oneSurfaceEvaluateNextInputBasis
} from "../contracts/one_surface_authority.js";
import {
  assertOneSurfaceAuthorityProgramBinding,
  type OneSurfaceAuthorityProgramBinding,
  type OneSurfaceStageAuthority
} from "../contracts/one_surface_program_compiler.js";
import type {
  AdmittedRuntimeCatalogBasis
} from "../contracts/runtime_catalog.js";
import {
  deriveRegistrySessionView
} from "../contracts/runtime_catalog.js";
import {
  deriveRuntimeEventCalculusProjection
} from "../contracts/event_calculus.js";
import {
  deriveObservationToActionBindingProjection
} from "../contracts/construction_action_catalog.js";
import {
  deriveConstructionPriorityProjection,
  type ConstructionPriorityScheme
} from "../contracts/construction_priority.js";
import {
  constructObservationPressureRow
} from "../contracts/construction_observation.js";
import {
  constructConstructionIntentCandidate
} from "../contracts/construction_intent.js";
import {
  constructCurrentObservationMaterializedEvent,
  deriveCurrentObservationBasisProjection
} from "../contracts/current_observation.js";
import {
  admitConstructionRuntimeEvents,
  isConstructionRuntimeEvent
} from "../contracts/construction_event_causality.js";
import {
  constructConstructionDeltaObservedEvent
} from "../contracts/construction_runtime_events.js";
import {
  sourceProjectionRef
} from "../contracts/projection.js";
import {
  payloadLedgerProjectionRef,
  type PayloadLedgerProjection
} from "../contracts/payload_ledger.js";
import {
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding
} from "../../../gtl/m01/contracts/target_carrier_contract.js";
import {
  constructAdmittedInvocationCarrier
} from "../contracts/declared_execution_context.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type {
  CanonicalRuntimeEvent,
  ConstructionGraphActionInvokedEvent,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
  type RuntimeEventEmitterContext,
  type RuntimeEventSink
} from "../events/emit.js";
import {
  admitEvalGapResult,
  admitEvaluateActionResult,
  admitOneSurfaceConstructionIntent,
  admitSynthesizeModelResult,
  oneSurfaceEvalGapInputBasis,
  oneSurfaceEvaluateActionInputBasis,
  oneSurfaceSynthesizeModelInputBasis,
  type OneSurfaceConstructionIntentAdmission
} from "./one_surface_semantic_admission.js";
import {
  admitOneSurfaceArtifactResultPair,
  constructOneSurfaceAuthorityResultRule,
  oneSurfaceAuthoritySnapshotBasis,
  projectOneSurfaceAuthorityResult,
  type OneSurfaceArtifactResultPair
} from "./one_surface_result_projection.js";
import {
  interpretCompleteCProgram,
  type CProgramAtomEvidenceEvent,
  type CProgramAtomInvocationSubmission,
  type CProgramAtomRequest
} from "./complete_c_program_runtime.js";

export interface OneSurfaceFdStageImplementation<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly kind: "one_surface_fd_stage_implementation";
  readonly functionKind: K;
  readonly stageAuthorityRef: string;
  readonly implementationRef: string;
  readonly invoke: (
    input: OneSurfaceAuthorityInputBasis<K>
  ) => OneSurfaceResultValueByKind[K] | Promise<OneSurfaceResultValueByKind[K]>;
}

export interface OneSurfaceAuthorityStageRuntimeResult<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly kind: "one_surface_authority_stage_runtime_result";
  readonly functionKind: K;
  readonly authorityResult: AdmittedOneSurfaceAuthorityResult<K>;
  readonly payloadRef: string;
  readonly lineageRef: string;
  readonly runtimeEvents: readonly CanonicalRuntimeEvent[];
}

export interface OneSurfaceAuthorityStageRuntimeScope {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
}

export interface OneSurfaceSunnySelectionInput {
  readonly episodeId: string;
  readonly intentLineageRef: string;
  readonly admittedProductTruthRefs: readonly string[];
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly invocationAuthority: OneSurfaceRefDigest;
  readonly programMembers?: OneSurfaceProgramMemberProjection;
  readonly replayCursorRef: string;
  readonly runtimeProjectionRef: string;
  readonly allowedEntryRefs: readonly string[];
  readonly priorityScheme: ConstructionPriorityScheme;
  readonly targetObligationRefs: readonly string[];
  readonly targetEvidenceAuthorityRefs: readonly string[];
  readonly gapEvidenceRefs: readonly string[];
  readonly gapAuthorityRefs: readonly string[];
  readonly causationRef: string;
  readonly correlationId: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly runtimeScope: OneSurfaceAuthorityStageRuntimeScope;
}

export interface OneSurfaceSunnySelectionResult {
  readonly kind: "one_surface_sunny_selection_result";
  readonly nextAction: NextActionProjection;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
  readonly targetBinding: TargetObligationBinding;
  readonly selectedIntentEvent: CanonicalRuntimeEvent & {
    readonly kind: "construction_intent_selected";
  };
  readonly model: ProductAssetModel;
  readonly runtimeEvents: readonly CanonicalRuntimeEvent[];
}

export interface OneSurfacePostActionEvaluationResult {
  readonly kind: "one_surface_post_action_evaluation_result";
  readonly authorityResult:
    AdmittedOneSurfaceAuthorityResult<"evaluate_action">;
  readonly evaluation: Exclude<
    ReturnType<typeof admitEvaluateActionResult>,
    { readonly kind: "one_surface_typed_refusal" }
  >;
  readonly runtimeEvents: readonly CanonicalRuntimeEvent[];
}

export interface OneSurfacePostActionConstructionContext {
  readonly priorConstructionEvents: readonly CanonicalRuntimeEvent[];
  readonly af15RuntimeEvents: readonly CanonicalRuntimeEvent[];
  readonly af15RuntimeProjection: RuntimeAggregateProjection;
}

const COMPLETED_ONE_SURFACE_CONSTRUCTION_KINDS = Object.freeze([
  "construction_episode_started",
  "construction_observation_snapshot_materialized",
  "construction_action_catalog_projected",
  "construction_evaluator_invoked",
  "construction_intent_candidate_returned",
  "construction_intent_candidate_admitted",
  "construction_intent_selected",
  "construction_graph_action_invoked",
  "construction_delta_observed",
  "construction_terminal_disposition_projected"
] as const);

function assertCompletedOneSurfaceConstructionChain(input: {
  readonly episodeId: string;
  readonly events: readonly CanonicalRuntimeEvent[];
}): void {
  const admitted = admitConstructionRuntimeEvents({
    episodeId: input.episodeId,
    events: input.events
  });
  const first = admitted[0];
  if (
    admitted.length !== COMPLETED_ONE_SURFACE_CONSTRUCTION_KINDS.length ||
    first === undefined
  ) {
    throw new TypeError("completed One Surface construction requires events 0 through 9");
  }
  for (let index = 0; index < admitted.length; index += 1) {
    const event = admitted[index]!;
    const prior = admitted[index - 1];
    if (
      event.eventSequence !== index ||
      event.kind !== COMPLETED_ONE_SURFACE_CONSTRUCTION_KINDS[index] ||
      event.episodeId !== first.episodeId ||
      event.iterationOrdinal !== first.iterationOrdinal ||
      event.correlationId !== first.correlationId ||
      event.basisId !== first.basisId ||
      event.graphFunctionId !== first.graphFunctionId ||
      event.runId !== first.runId ||
      event.workKey !== first.workKey ||
      (prior !== undefined &&
        !event.causationEventRefs.includes(prior.constructionEventRef))
    ) {
      throw new TypeError("completed One Surface construction chain is not exact");
    }
  }
}

function exactImplementation<K extends OneSurfaceAuthorityFunctionKind>(input: {
  readonly stage: OneSurfaceStageAuthority<K>;
  readonly implementations: readonly OneSurfaceFdStageImplementation<K>[];
}): OneSurfaceFdStageImplementation<K> {
  const matches = input.implementations.filter((row) =>
    row.functionKind === input.stage.functionKind &&
    row.stageAuthorityRef === input.stage.authorityRef
  );
  const selected = matches[0];
  if (
    matches.length !== 1 ||
    selected === undefined ||
    input.implementations.filter(
      (row) => row.implementationRef === selected.implementationRef
    ).length !== 1
  ) {
    throw new TypeError(
      `One Surface ${input.stage.functionKind} requires one distinct declared implementation`
    );
  }
  return selected;
}

function artifactPayload(input: {
  readonly stage: OneSurfaceStageAuthority;
  readonly contract: ReturnType<typeof resolveTargetCarrierContractBinding>;
  readonly value: unknown;
}) {
  return Object.freeze({
    kind: input.contract.outputCarrierKind,
    targetAssetType: input.contract.outputCarrierKind,
    edgeRef: input.stage.targetCarrierContract.edgeRef,
    contractRef: input.contract.contractRef,
    contractDigest: input.contract.configDigest,
    payload: input.value
  });
}

function authorityEvidenceEvents(input: {
  readonly request: CProgramAtomRequest;
  readonly graphEdge: string;
  readonly stage: OneSurfaceStageAuthority;
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly inputBasis: OneSurfaceAuthorityInputBasis;
  readonly pair: OneSurfaceArtifactResultPair;
}): readonly CProgramAtomEvidenceEvent[] {
  const authority = oneSurfaceAuthoritySnapshotBasis({
    application: input.application,
    stage: input.stage
  });
  const suffix = stableSha256Digest({
    cCallRef: input.request.cCallRef,
    inputDigest: input.inputBasis.inputDigest,
    pairRef: input.pair.pairRef
  }).slice("sha256:".length);
  const authoritySnapshotRef =
    `authority-snapshot://abg/one-surface/${suffix}`;
  const validationRef = `validation://abg/one-surface/${suffix}`;
  const ordinaryEvidenceRef = `evidence://abg/one-surface/${suffix}`;
  const scope = Object.freeze({
    basisId: input.request.parentBasisId,
    graphCallId: input.request.parentGraphCallId,
    frameId: input.request.parentFrameId,
    vectorIndex: input.request.vectorIndex,
    edge: input.graphEdge
  });
  const authorityEvent = Object.freeze({
    kind: "authority_snapshot_admitted" as const,
    ...scope,
    authoritySnapshotRef,
    authorityRefs: authority.authorityRefs,
    inputRefs: input.inputBasis.inputRefs,
    authorityDigest: authority.authorityDigest,
    inputDigest: input.inputBasis.inputDigest,
    closureCapable: true,
    contradictoryAuthority: false,
    deferredAuthorityRefs: Object.freeze([]),
    providerRefs: Object.freeze([input.stage.authorityRef]),
    policyRefs: Object.freeze([input.stage.closureContract.ref])
  });
  const observed = Object.freeze({
    kind: "payload_observed" as const,
    ...scope,
    payloadRef: input.pair.payloadRef,
    payloadClass: input.stage.targetCarrierContract.outputCarrierKind,
    schemaRef: input.stage.nativeResultSchema.schemaRef,
    contractRef: input.stage.resultAuthority.selectedResultContractRef,
    digest: input.pair.payloadDigest,
    producerRef: input.stage.authorityRef,
    sourceEventRef: input.request.cCallRef,
    actorInvocationId: null,
    authorityRef: authoritySnapshotRef,
    inputDigest: input.inputBasis.inputDigest,
    policyRefs: Object.freeze([input.stage.closureContract.ref])
  });
  const validated = Object.freeze({
    kind: "payload_validated" as const,
    ...scope,
    payloadRef: input.pair.payloadRef,
    schemaRef: input.stage.nativeResultSchema.schemaRef,
    contractRef: input.stage.resultAuthority.selectedResultContractRef,
    contractDigest:
      input.stage.targetCarrierContract.targetCarrierContractDigest,
    digest: input.pair.payloadDigest,
    validationRef,
    evidenceRef: ordinaryEvidenceRef,
    policyRefs: Object.freeze([input.stage.closureContract.ref])
  });
  const evidenceRefs = Object.freeze([
    ordinaryEvidenceRef,
    input.pair.pairRef,
    input.pair.resultAdmission.admissionRef
  ]);
  const evidence = evidenceRefs.map((evidenceRef) => Object.freeze({
    kind: "evidence_admitted" as const,
    ...scope,
    evidenceRef,
    payloadRef: input.pair.payloadRef,
    authorityRef: authoritySnapshotRef,
    authorityDigest: authority.authorityDigest,
    inputDigest: input.inputBasis.inputDigest,
    providerRefs: Object.freeze([input.stage.authorityRef]),
    policyRefs: Object.freeze([input.stage.closureContract.ref]),
    complete: true,
    shallow: false,
    contradictsAuthority: false,
    deferred: false
  }));
  return Object.freeze([
    authorityEvent,
    observed,
    validated,
    ...evidence
  ]);
}

function payloadLedger(input: {
  readonly stage: OneSurfaceStageAuthority;
  readonly contract: ReturnType<typeof resolveTargetCarrierContractBinding>;
  readonly events: readonly CanonicalRuntimeEvent[];
}): PayloadLedgerProjection {
  const opened = input.events.filter((event) => event.kind === "c_call_opened");
  const first = opened[0];
  if (opened.length !== 1 || first === undefined) {
    throw new TypeError("One Surface stage replay requires one C-call open");
  }
  const partial = Object.freeze({
    kind: "payload_ledger_projection" as const,
    scope: Object.freeze({
      kind: "payload_ledger_scope" as const,
      basisId: first.basisId,
      graphFunctionId: first.graphFunctionId,
      graphCallId: first.graphCallId,
      frameId: first.frameId,
      vectorIndex: first.vectorIndex,
      edge: first.edge
    }),
    targetCarrierContract: input.contract,
    observedPayloads: Object.freeze(input.events.filter(
      (event) => event.kind === "payload_observed"
    )),
    validatedPayloads: Object.freeze(input.events.filter(
      (event) => event.kind === "payload_validated"
    )),
    rejectedPayloads: Object.freeze(input.events.filter(
      (event) => event.kind === "payload_rejected"
    )),
    actorResultArtifacts: Object.freeze(input.events.filter(
      (event) => event.kind === "actor_result_artifact_observed"
    )),
    authoritySnapshots: Object.freeze(input.events.filter(
      (event) => event.kind === "authority_snapshot_admitted"
    )),
    evidenceRows: Object.freeze(input.events.filter(
      (event) => event.kind === "evidence_admitted"
    )),
    ambiguityObservations: Object.freeze(input.events.filter(
      (event) => event.kind === "ambiguity_observation_admitted"
    )),
    closureInputs: Object.freeze(input.events.filter(
      (event) => event.kind === "closure_input_published"
    ))
  });
  return Object.freeze({
    ...partial,
    projectionRef: payloadLedgerProjectionRef({
      ...partial,
      projectionRef: "pending"
    })
  });
}

function exactStage<K extends OneSurfaceAuthorityFunctionKind>(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly functionKind: K;
}): OneSurfaceStageAuthority<K> {
  const stages = input.application.stages.filter(
    (stage) => stage.functionKind === input.functionKind
  );
  const stage = stages[0];
  if (stages.length !== 1 || stage === undefined) {
    throw new TypeError(
      `One Surface program does not contain exactly one ${input.functionKind} stage`
    );
  }
  // The exact discriminant/cardinality check above establishes this relation.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return stage as OneSurfaceStageAuthority<K>;
}

export async function executeOneSurfaceAuthorityStage<
  K extends OneSurfaceAuthorityFunctionKind
>(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly functionKind: K;
  readonly inputBasis: OneSurfaceAuthorityInputBasis<K>;
  readonly implementations: readonly OneSurfaceFdStageImplementation<K>[];
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly runtimeScope: OneSurfaceAuthorityStageRuntimeScope;
  readonly emitterContext: RuntimeEventEmitterContext;
  readonly eventSink: RuntimeEventSink;
}): Promise<OneSurfaceAuthorityStageRuntimeResult<K>> {
  assertOneSurfaceAuthorityProgramBinding(input.application);
  const stage = exactStage({
    application: input.application,
    functionKind: input.functionKind
  });
  const implementation = exactImplementation({
    stage,
    implementations: input.implementations
  });
  const module = input.catalogBasis.executionBindings.find(
    (binding) => binding.entryRef === input.selectedCatalogEntryRef
  )?.module;
  const graphFunction = module?.graphFunctions.find(
    (candidate) => candidate.id === stage.plan.executionGraphFunctionRef
  );
  const graphVector = graphFunction?.template.kind === "inline_graph"
    ? graphFunction.template.graph.vectors.find(
        (candidate) => candidate.id === stage.plan.graphVectorRef
      )
    : undefined;
  if (graphVector === undefined) {
    throw new TypeError(
      "One Surface stage is absent from its selected runtime catalog entry"
    );
  }
  const contract = resolveTargetCarrierContractBinding({
    vector: graphVector,
    defaults: loadGtlTargetCarrierDefaultsBundle()
  });
  const state: {
    pair: OneSurfaceArtifactResultPair<K> | null;
    artifact: unknown;
    cCallRef: string | null;
    atomFailure: unknown;
  } = { pair: null, artifact: null, cCallRef: null, atomFailure: null };
  const outcome = await interpretCompleteCProgram({
    kind: "c_program_interpreter_invocation",
    plan: stage.plan,
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    parentBasisId: input.runtimeScope.basisId,
    parentGraphCallId: input.runtimeScope.graphCallId,
    parentFrameId: input.runtimeScope.frameId,
    vectorIndex: input.application.stages.findIndex(
      (candidate) => candidate.authorityRef === stage.authorityRef
    ),
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    replayReceipts: Object.freeze([]),
    invokeAdmittedAtom: async (
      request
    ): Promise<CProgramAtomInvocationSubmission> => {
      try {
        if (
          request.kind !== "c_program_stage_atom_request" ||
          request.domainStageRole !== stage.functionKind ||
          request.fibre !== "F_D" ||
          request.nodeRef !== stage.resultAuthority.programLocusRef
        ) {
          throw new TypeError(
            "One Surface runtime atom differs from its admitted stage topology"
          );
        }
        const decoded = await implementation.invoke(input.inputBasis);
        const admitted = admitOneSurfaceResultForClose(
          stage.functionKind,
          decoded
        );
        state.artifact = artifactPayload({
          stage,
          contract,
          value: admitted.value
        });
        const admittedPair = admitOneSurfaceArtifactResultPair({
          stageAuthority: stage,
          inputBasis: input.inputBasis,
          admittedResult: admitted,
          targetCarrierContract: contract,
          sourceEventRef: request.cCallRef,
          artifactPayloadDigestBasis: state.artifact
        });
        state.pair = admittedPair;
        state.cCallRef = request.cCallRef;
        const evidenceEvents = authorityEvidenceEvents({
          request,
          graphEdge: graphVector.name,
          stage,
          application: input.application,
          inputBasis: input.inputBasis,
          pair: admittedPair
        });
        const authority = evidenceEvents.find(
          (event) => event.kind === "authority_snapshot_admitted"
        );
        const validated = evidenceEvents.find(
          (event) => event.kind === "payload_validated"
        );
        const ordinary = evidenceEvents.find(
          (event) => event.kind === "evidence_admitted"
        );
        if (
          authority?.kind !== "authority_snapshot_admitted" ||
          validated?.kind !== "payload_validated" ||
          ordinary?.kind !== "evidence_admitted"
        ) {
          throw new TypeError("One Surface stage close evidence is incomplete");
        }
        const admittedTargetCarrier = constructAdmittedInvocationCarrier({
          sourceNodeRef: request.nodeRef,
          schemaRef: stage.nativeResultSchema.schemaRef,
          carrierRef: admittedPair.payloadRef,
          admissionRef: admittedPair.pairRef,
          value: state.artifact
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
            outputPayloadRef: admittedPair.payloadRef,
            responseContractRef: request.outputCarrierRef,
            outputLineageRef: admittedPair.pairRef,
            reasonRef: null,
            failureClass: null,
            evidenceRefs: Object.freeze([
              admittedPair.pairRef,
              admittedPair.resultAdmission.admissionRef
            ]),
            cCallRef: request.cCallRef,
            sourceEventRefs: Object.freeze([request.cCallRef])
          }),
          admittedTargetCarrier,
          interiorEvents: Object.freeze([]),
          evidenceEvents,
          closeBasis: Object.freeze({
            kind: "c_program_atom_close_basis" as const,
            evidenceClass: "one_surface_authority_result",
            evidenceRefs: Object.freeze([
              authority.authoritySnapshotRef,
              validated.validationRef,
              ordinary.evidenceRef,
              admittedPair.pairRef,
              admittedPair.resultAdmission.admissionRef
            ].sort()),
            resultContractRef:
              stage.resultAuthority.selectedResultContractRef
          })
        });
      } catch (error: unknown) {
        state.atomFailure = error;
        throw error;
      }
    }
  });
  const completedPair = state.pair;
  const completedArtifact = state.artifact;
  const completedCCallRef = state.cCallRef;
  if (
    outcome.status !== "completed" ||
    completedPair === null ||
    completedArtifact === null ||
    completedCCallRef === null
  ) {
    throw new TypeError(
      `One Surface authority stage did not complete: ${JSON.stringify({
        status: outcome.status,
        reasonRef: outcome.reasonRef,
        failureClass: outcome.failureClass,
        evidenceRefs: outcome.evidenceRefs,
        pairAdmitted: state.pair !== null,
        cCallBound: state.cCallRef !== null,
        atomFailure: state.atomFailure instanceof Error
          ? state.atomFailure.message
          : null
      })}`,
      ...(state.atomFailure === null ? [] : [{ cause: state.atomFailure }])
    );
  }
  const emitted = emitWithContext(
    input.emitterContext,
    outcome.runtimeEvents,
    input.eventSink
  );
  const calculus = deriveRuntimeEventCalculusProjection({
    events: emitted,
    derivedRules: Object.freeze([
      constructOneSurfaceAuthorityResultRule(input.application)
    ])
  });
  const projection = projectOneSurfaceAuthorityResult({
    application: input.application,
    stageAuthority: stage,
    eventCalculus: calculus,
    payloadLedger: payloadLedger({ stage, contract, events: emitted }),
    artifactPayloadDigestBasis: completedArtifact,
    expectedCCallRef: completedCCallRef,
    expectedFunctionInputBasis: input.inputBasis
  });
  if (projection.status !== "admitted" || projection.result === null) {
    throw new TypeError(
      `One Surface authority result was not replay-admitted: ${projection.diagnostic?.reason ?? "unknown"}`
    );
  }
  return Object.freeze({
    kind: "one_surface_authority_stage_runtime_result" as const,
    functionKind: input.functionKind,
    authorityResult: projection.result,
    payloadRef: completedPair.payloadRef,
    lineageRef: completedPair.pairRef,
    runtimeEvents: emitted
  });
}

export async function executeOneSurfaceSunnySelectionProgram(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly selection: OneSurfaceSunnySelectionInput;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly emitterContext: RuntimeEventEmitterContext;
  readonly eventSink: RuntimeEventSink;
}): Promise<OneSurfaceSunnySelectionResult> {
  assertOneSurfaceAuthorityProgramBinding(input.application);
  const programMembers = input.selection.programMembers;
  if (programMembers === undefined) {
    throw new TypeError(
      "sunny One Surface selection requires exact applied-program members"
    );
  }
  assertOneSurfaceProgramMemberProjection(programMembers);
  if (
    programMembers.admittedProgramRef !==
      input.application.admittedProgramRef ||
    programMembers.admittedProgramDigest !==
      input.application.admittedProgramDigest
  ) {
    throw new TypeError(
      "sunny One Surface program member authority differs from the admitted program"
    );
  }
  if (input.application.recursePlan.maxApplications !== 1) {
    throw new TypeError("sunny One Surface selection requires one bounded application");
  }
  const allowedCatalog =
    input.application.stages[2].allowedConsequenceCatalog;
  const allowedRow = allowedCatalog.rows[0];
  if (
    allowedCatalog.rows.length !== 1 ||
    allowedRow === undefined ||
    allowedRow.allowedActionKinds.length !== 1 ||
    allowedRow.allowedActionKinds[0] !== "invoke_graph_function"
  ) {
    throw new TypeError(
      "sunny One Surface selection requires one declared callable target"
    );
  }
  const targetOutcomeRef = deriveOneSurfaceTargetOutcomeRef({
    allowedRowRef: allowedRow.rowRef,
    actionKind: "invoke_graph_function"
  });

  const coordinate = stableSha256Digest({
    episodeId: input.selection.episodeId,
    allowedRowRef: allowedRow.rowRef,
    workspaceBinding: input.selection.workspaceBinding
  }).slice("sha256:".length);
  const constructionEventRef = (sequence: number, suffix: string) =>
    `construction-event://abiogenesis/system/one-surface/${coordinate}/${String(sequence)}-${suffix}`;
  const constructionScope = (inputScope: {
    readonly eventSequence: number;
    readonly suffix: string;
    readonly causationEventRefs: readonly string[];
  }) => Object.freeze({
    constructionEventRef: constructionEventRef(
      inputScope.eventSequence,
      inputScope.suffix
    ),
    basisId: input.selection.runtimeScope.basisId,
    graphFunctionId: input.application.admittedProgramRef,
    runId: null,
    workKey: null,
    episodeId: input.selection.episodeId,
    iterationOrdinal: 0,
    eventSequence: inputScope.eventSequence,
    basisProjectionRef: input.selection.replayCursorRef,
    priorIntentId: null,
    causationEventRefs: inputScope.causationEventRefs,
    correlationId: input.selection.correlationId
  });

  const emitted: CanonicalRuntimeEvent[] = [];
  const sink: RuntimeEventSink = (event) => {
    emitted.push(event);
    input.eventSink(event);
  };
  const episodeStartedRef = constructionEventRef(0, "episode-started");
  emitWithContext(
    input.emitterContext,
    Object.freeze({
      ...constructionScope({
        eventSequence: 0,
        suffix: "episode-started",
        causationEventRefs: Object.freeze([input.selection.causationRef])
      }),
      kind: "construction_episode_started" as const,
      startProjectionRef: input.selection.runtimeProjectionRef
    }),
    sink
  );
  const synthesizeInput = Object.freeze({
    program: input.application,
    intentLineageRef: input.selection.intentLineageRef,
    priorModel: null,
    admittedProductTruthRefs: input.selection.admittedProductTruthRefs
  });
  const synthesizeBasis = oneSurfaceSynthesizeModelInputBasis(synthesizeInput);
  const synthesizeStage = input.application.stages[0];
  const synthesize = await executeOneSurfaceAuthorityStage({
    application: input.application,
    functionKind: "synthesize_model",
    inputBasis: synthesizeBasis,
    implementations: [Object.freeze({
      kind: "one_surface_fd_stage_implementation" as const,
      functionKind: "synthesize_model" as const,
      stageAuthorityRef: synthesizeStage.authorityRef,
      implementationRef:
        "implementation://abiogenesis/system/one-surface/synthesize-model/v1",
      invoke: () => Object.freeze({
        desiredAssetRefs: allowedRow.expectedOutputAssetRefs,
        knownAssetRefs: allowedRow.inputAssetRefs
      })
    })],
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    inputPayloadRef: input.selection.inputPayloadRef,
    inputLineageRef: input.selection.inputLineageRef,
    runtimeScope: input.selection.runtimeScope,
    emitterContext: input.emitterContext,
    eventSink: sink
  });
  const model = admitSynthesizeModelResult({
    ...synthesizeInput,
    result: synthesize.authorityResult
  });
  if (model.kind === "one_surface_typed_refusal") {
    throw new TypeError(
      `sunny synthesize_model refused: ${model.reasonRefs.join(",")}`
    );
  }

  const pressure = constructObservationPressureRow({
    pressureRef: `pressure://abiogenesis/system/one-surface/${coordinate}`,
    pressureKind: "open_obligation",
    sourceRef: `gap://abiogenesis/system/one-surface/${coordinate}`,
    affectedAssetRefs: allowedRow.expectedOutputAssetRefs,
    targetOutcomeRefs: [targetOutcomeRef],
    evidenceRefs: input.selection.gapEvidenceRefs,
    severity: 1,
    authorityRefs: input.selection.gapAuthorityRefs
  });
  const observationValue = Object.freeze({
    kind: "construction_observation_snapshot" as const,
    episodeId: input.selection.episodeId,
    observationId:
      `observation://abiogenesis/system/one-surface/${coordinate}`,
    basisRef: input.selection.workspaceBinding.ref,
    currentProjectionRef: input.selection.runtimeProjectionRef,
    iterationOrdinal: 0,
    basisProjectionRef: input.selection.replayCursorRef,
    priorIntentId: null,
    causationRef: input.selection.causationRef,
    correlationId: input.selection.correlationId,
    observedStateRefs: Object.freeze([
      model.modelRef,
      ...allowedRow.inputAssetRefs
    ]),
    runtimeAggregateRefs: Object.freeze([
      input.catalogBasis.runtimeCatalogProjectionRef
    ]),
    linkedAssetRefs: allowedRow.inputAssetRefs,
    passedInputRefs: Object.freeze([]),
    gapProjectionRefs: Object.freeze([pressure.sourceRef]),
    foldbackRefs: Object.freeze([]),
    retryFrontierRefs: Object.freeze([]),
    reentryFrontierRefs: Object.freeze([]),
    assuranceRefs: Object.freeze([]),
    fhInputRefs: Object.freeze([]),
    priorIntentRefs: Object.freeze([]),
    priorProgressRefs: Object.freeze([]),
    pressureRows: Object.freeze([pressure]),
    repairSurfaceTriageRows: Object.freeze([])
  });
  const evalGapInput = Object.freeze({
    program: input.application,
    workspaceBinding: input.selection.workspaceBinding,
    model,
    replayCursorRef: input.selection.replayCursorRef,
    runtimeProjectionRef: input.selection.runtimeProjectionRef,
    observationInputRefs: allowedRow.inputAssetRefs
  });
  const evalGapBasis = oneSurfaceEvalGapInputBasis(evalGapInput);
  const evalGapStage = input.application.stages[1];
  const evalGap = await executeOneSurfaceAuthorityStage({
    application: input.application,
    functionKind: "eval_gap",
    inputBasis: evalGapBasis,
    implementations: [Object.freeze({
      kind: "one_surface_fd_stage_implementation" as const,
      functionKind: "eval_gap" as const,
      stageAuthorityRef: evalGapStage.authorityRef,
      implementationRef:
        "implementation://abiogenesis/system/one-surface/eval-gap/v1",
      invoke: () => observationValue
    })],
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    inputPayloadRef: synthesize.payloadRef,
    inputLineageRef: synthesize.lineageRef,
    runtimeScope: input.selection.runtimeScope,
    emitterContext: input.emitterContext,
    eventSink: sink
  });
  const observation = admitEvalGapResult({
    ...evalGapInput,
    result: evalGap.authorityResult
  });
  if (observation.kind === "one_surface_typed_refusal") {
    throw new TypeError(
      `sunny eval_gap refused: ${observation.reasonRefs.join(",")}`
    );
  }

  emitWithContext(
    input.emitterContext,
    constructCurrentObservationMaterializedEvent({
      scope: Object.freeze({
        constructionEventRef: constructionEventRef(
          1,
          "observation-materialized"
        ),
        basisId: input.selection.runtimeScope.basisId,
        graphFunctionId: input.application.admittedProgramRef,
        runId: null,
        workKey: null,
        episodeId: input.selection.episodeId,
        iterationOrdinal: observation.iterationOrdinal,
        eventSequence: 1,
        basisProjectionRef: observation.basisProjectionRef,
        priorIntentId: observation.priorIntentId,
        causationEventRefs: Object.freeze([
          episodeStartedRef,
          observation.causationRef
        ]),
        correlationId: input.selection.correlationId
      }),
      admittedProgram: Object.freeze({
        ref: input.application.admittedProgramRef,
        digest: input.application.admittedProgramDigest
      }),
      workspaceBinding: input.selection.workspaceBinding,
      observation
    }),
    sink
  );
  const observationEventRef = constructionEventRef(
    1,
    "observation-materialized"
  );
  const currentObservation = deriveCurrentObservationBasisProjection({
    episodeId: input.selection.episodeId,
    admittedProgram: Object.freeze({
      ref: input.application.admittedProgramRef,
      digest: input.application.admittedProgramDigest
    }),
    workspaceBinding: input.selection.workspaceBinding,
    observation,
    replayEvents: emitted
  });
  const session = deriveRegistrySessionView({
    basis: input.catalogBasis,
    allowedEntryRefs: input.selection.allowedEntryRefs
  });
  if (!session.accepted || session.view === null) {
    throw new TypeError(
      `sunny One Surface catalog view refused: ${session.residuals.map(
        (row) => `${row.reason}:${row.entryRef}`
      ).join(",")}`
    );
  }
  const actionCatalog = deriveProgramActionCatalog({
    episodeId: input.selection.episodeId,
    allowedCatalog,
    catalogView: session.view,
    programMembers
  });
  if (
    actionCatalog.kind === "one_surface_typed_refusal" ||
    actionCatalog.rows.length !== 1
  ) {
    throw new TypeError(
      "sunny One Surface selection requires one admitted callable action"
    );
  }
  const action = actionCatalog.rows[0]!;
  if (
    action.actionKind !== "invoke_graph_function" ||
    action.graphFunctionRef === null ||
    !programMembers.graphFunctions.some(
      (member) => member.graphFunctionRef === action.graphFunctionRef
    ) ||
    action.targetOutcomeRef !== targetOutcomeRef ||
    action.ineligibleReasonRefs.length !== 0
  ) {
    throw new TypeError("sunny One Surface action is not callable");
  }
  const actionCatalogEventRef = constructionEventRef(
    2,
    "action-catalog-projected"
  );
  emitWithContext(
    input.emitterContext,
    Object.freeze({
      ...constructionScope({
        eventSequence: 2,
        suffix: "action-catalog-projected",
        causationEventRefs: Object.freeze([observationEventRef])
      }),
      kind: "construction_action_catalog_projected" as const,
      catalogRef: actionCatalog.catalogRef,
      hookResolutionRef: actionCatalog.hookResolutionRef,
      fallbackConfigDigest: actionCatalog.fallbackConfigDigest,
      traversalPublicationRefs: Object.freeze([
        ...new Set(actionCatalog.rows.flatMap((row) => [
          row.graphFunctionRef,
          row.graphVectorRef,
          row.refinementBoundaryRef,
          row.candidateFamilyRef,
          row.publishedTraversalTargetRef,
          ...row.hookSourceRefs
        ].filter((ref): ref is string => ref !== null)))
      ].sort())
    }),
    sink
  );
  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme: input.selection.priorityScheme
  });
  const targetObligations: readonly OneSurfaceTargetObligationInput[] =
    Object.freeze([Object.freeze({
      targetOutcomeRef: action.targetOutcomeRef,
      obligationRefs: input.selection.targetObligationRefs,
      requiredEvidenceAuthorityRefs:
        input.selection.targetEvidenceAuthorityRefs
    })]);
  const selectedPriority = priorityProjection.rows.find((row) =>
    row.terminalDisposition === "none"
  );
  const selectedBinding = selectedPriority === undefined
    ? undefined
    : bindingProjection.rows.find(
        (row) => row.bindingRef === selectedPriority.bindingRef
      );
  const targetObligation = targetObligations.find(
    (row) => row.targetOutcomeRef === action.targetOutcomeRef
  );
  if (
    selectedPriority === undefined ||
    selectedBinding === undefined ||
    selectedBinding.ineligibleReasonRefs.length !== 0 ||
    targetObligation === undefined
  ) {
    throw new TypeError(
      "sunny One Surface selection has no exact eligible target obligation"
    );
  }
  const candidate = constructConstructionIntentCandidate({
    candidateId:
      `candidate://abiogenesis/system/one-surface/${coordinate}`,
    episodeId: input.selection.episodeId,
    rank: selectedPriority.rankOrdinal,
    valueScore: selectedPriority.finalScore,
    priorityScore: selectedPriority.priorityScore,
    affectAdjustmentRefs: selectedPriority.affectAdjustmentRefs,
    selectedActionRef: action.actionRef,
    selectedBindingRef: selectedBinding.bindingRef,
    selectedOutcomeRef: selectedBinding.targetOutcomeRef,
    targetGraphFunctionRef: action.graphFunctionRef,
    targetVectorRef: action.graphVectorRef,
    targetReentryRef: selectedBinding.targetReentryRef,
    inputAssetRefs: selectedBinding.requiredInputRefs,
    expectedOutputAssetRefs: selectedBinding.providedOutputRefs,
    gapRefs: [pressure.sourceRef],
    obligationRefs: targetObligation.obligationRefs,
    lawfulBasisRefs: action.requiredAuthorityRefs,
    expectedDelta: `admit ${selectedBinding.targetOutcomeRef}`,
    progressCondition: `observe ${selectedBinding.providedOutputRefs.join(",")}`,
    stopCondition: `close ${targetObligation.obligationRefs.join(",")}`,
    escalationCondition: `block ${selectedBinding.targetOutcomeRef}`,
    rationale: "sole eligible action in the admitted sunny catalog"
  });
  const nextBasis = constructNextActionBasis({
    basisKind: "initial_selection",
    causalRefs: [
      input.application.bindingRef,
      input.application.bindingDigest,
      input.selection.invocationAuthority.ref,
      input.selection.invocationAuthority.digest,
      input.selection.workspaceBinding.ref,
      input.selection.workspaceBinding.digest
    ]
  });
  const evaluateNextInput = Object.freeze({
    nextBasis,
    application: input.application,
    programMembers,
    invocationAuthority: input.selection.invocationAuthority,
    catalogBasis: input.catalogBasis,
    allowedEntryRefs: input.selection.allowedEntryRefs,
    observation,
    currentObservation,
    priorityScheme: input.selection.priorityScheme,
    targetObligations
  });
  const evaluateNextBasis = oneSurfaceEvaluateNextInputBasis(
    evaluateNextInput
  );
  const evaluateNextStage = input.application.stages[2];
  const evaluatorInvokedRef = constructionEventRef(3, "evaluator-invoked");
  const evaluateNextImplementationRef =
    "implementation://abiogenesis/system/one-surface/evaluate-next/v1";
  emitWithContext(
    input.emitterContext,
    Object.freeze({
      ...constructionScope({
        eventSequence: 3,
        suffix: "evaluator-invoked",
        causationEventRefs: Object.freeze([actionCatalogEventRef])
      }),
      kind: "construction_evaluator_invoked" as const,
      observationId: observation.observationId,
      catalogRef: actionCatalog.catalogRef,
      evaluatorPluginRef: evaluateNextImplementationRef,
      inputDigest: evaluateNextBasis.inputDigest
    }),
    sink
  );
  const evaluateNext = await executeOneSurfaceAuthorityStage({
    application: input.application,
    functionKind: "evaluate_next",
    inputBasis: evaluateNextBasis,
    implementations: [Object.freeze({
      kind: "one_surface_fd_stage_implementation" as const,
      functionKind: "evaluate_next" as const,
      stageAuthorityRef: evaluateNextStage.authorityRef,
      implementationRef: evaluateNextImplementationRef,
      invoke: () => Object.freeze({
        selectedActionRef: action.actionRef,
        intentCandidate: candidate
      })
    })],
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    inputPayloadRef: evalGap.payloadRef,
    inputLineageRef: evalGap.lineageRef,
    runtimeScope: input.selection.runtimeScope,
    emitterContext: input.emitterContext,
    eventSink: sink
  });
  const nextAction = deriveNextActionProjection({
    ...evaluateNextInput,
    authorityResult: evaluateNext.authorityResult
  });
  if (nextAction.kind === "one_surface_typed_refusal") {
    throw new TypeError(
      `sunny evaluate_next refused: ${nextAction.reasonRefs.join(",")}`
    );
  }
  const candidateReturnedRef = constructionEventRef(4, "candidate-returned");
  emitWithContext(
    input.emitterContext,
    Object.freeze({
      ...constructionScope({
        eventSequence: 4,
        suffix: "candidate-returned",
        causationEventRefs: Object.freeze([evaluatorInvokedRef])
      }),
      kind: "construction_intent_candidate_returned" as const,
      evaluatorPluginRef: evaluateNextImplementationRef,
      evaluatorOutcomeRef: evaluateNext.authorityResult.resultRef,
      candidateSetDigest: stableSha256Digest([candidate]),
      candidateRefs: Object.freeze([candidate.candidateId])
    }),
    sink
  );
  const intentAdmission = admitOneSurfaceConstructionIntent({
    program: input.application,
    nextAction,
    observation,
    actionCatalog,
    bindingProjection,
    priorityProjection,
    workspaceBinding: input.selection.workspaceBinding,
    invocationAuthority: input.selection.invocationAuthority
  });
  if (intentAdmission.status !== "admitted") {
    throw new TypeError(
      `sunny construction intent refused: ${intentAdmission.reasonRefs.join(",")}`
    );
  }
  const admittedIntent =
    intentAdmission.constructionIntentAdmission.admittedIntent;
  if (admittedIntent === null) {
    throw new TypeError("sunny construction intent admission has no admitted intent");
  }
  const candidateAdmittedRef = constructionEventRef(5, "candidate-admitted");
  emitWithContext(
    input.emitterContext,
    Object.freeze({
      ...constructionScope({
        eventSequence: 5,
        suffix: "candidate-admitted",
        causationEventRefs: Object.freeze([candidateReturnedRef])
      }),
      kind: "construction_intent_candidate_admitted" as const,
      candidateId: candidate.candidateId,
      admissionRef: intentAdmission.constructionIntentAdmission.admissionRef,
      intentId: admittedIntent.intentId,
      authorityRefs: admittedIntent.authorityRefs
    }),
    sink
  );
  const selectedIntentEvents = emitWithContext(
    input.emitterContext,
    Object.freeze({
      ...constructionScope({
        eventSequence: 6,
        suffix: "intent-selected",
        causationEventRefs: Object.freeze([candidateAdmittedRef])
      }),
      kind: "construction_intent_selected" as const,
      intentId: admittedIntent.intentId,
      selectedActionRef: admittedIntent.selectedActionRef,
      selectedBindingRef: admittedIntent.selectedBindingRef,
      selectionPolicyRef: input.selection.priorityScheme.sourcePolicyRef
    }),
    sink
  );
  const selectedIntentEvent = selectedIntentEvents[0];
  if (selectedIntentEvent?.kind !== "construction_intent_selected") {
    throw new TypeError("sunny selected-intent event was not canonically admitted");
  }
  const selectedTargetBindings = nextAction.targetBindings.filter((row) =>
    intentAdmission.targetBindingRefs.includes(row.bindingRef)
  );
  const selectedTargetBinding = selectedTargetBindings[0];
  if (
    selectedTargetBindings.length !== 1 ||
    selectedTargetBinding === undefined
  ) {
    throw new TypeError("sunny selection produced no exact target binding");
  }
  admitConstructionRuntimeEvents({
    episodeId: input.selection.episodeId,
    events: emitted.filter(isConstructionRuntimeEvent)
  });
  return Object.freeze({
    kind: "one_surface_sunny_selection_result" as const,
    nextAction,
    intentAdmission,
    targetBinding: selectedTargetBinding,
    selectedIntentEvent,
    model,
    runtimeEvents: Object.freeze([...emitted])
  });
}

export async function executeOneSurfacePostActionEvaluation(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly evaluationInput: Omit<
    Parameters<typeof oneSurfaceEvaluateActionInputBasis>[0],
    "program"
  >;
  readonly implementation: OneSurfaceFdStageImplementation<"evaluate_action">;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly inputPayloadRef: string;
  readonly inputLineageRef: string;
  readonly runtimeScope: OneSurfaceAuthorityStageRuntimeScope;
  readonly constructionContext?: OneSurfacePostActionConstructionContext | undefined;
  readonly emitterContext: RuntimeEventEmitterContext;
  readonly eventSink: RuntimeEventSink;
}): Promise<OneSurfacePostActionEvaluationResult> {
  assertOneSurfaceAuthorityProgramBinding(input.application);
  const semanticInput = Object.freeze({
    program: input.application,
    ...input.evaluationInput
  });
  const inputBasis = oneSurfaceEvaluateActionInputBasis(semanticInput);
  const runtime = await executeOneSurfaceAuthorityStage({
    application: input.application,
    functionKind: "evaluate_action",
    inputBasis,
    implementations: Object.freeze([input.implementation]),
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    inputPayloadRef: input.inputPayloadRef,
    inputLineageRef: input.inputLineageRef,
    runtimeScope: input.runtimeScope,
    emitterContext: input.emitterContext,
    eventSink: input.eventSink
  });
  const evaluation = admitEvaluateActionResult({
    ...semanticInput,
    result: runtime.authorityResult
  });
  if (evaluation.kind === "one_surface_typed_refusal") {
    throw new TypeError(
      `evaluate_action refused: ${evaluation.reasonRefs.join(",")}`
    );
  }
  const constructionRuntimeEvents = input.constructionContext === undefined
    ? Object.freeze([])
    : emitOneSurfacePostActionConstructionEvents({
        context: input.constructionContext,
        evaluationInput: input.evaluationInput,
        evaluation,
        af16RuntimeEvents: runtime.runtimeEvents,
        emitterContext: input.emitterContext,
        eventSink: input.eventSink
      });
  return Object.freeze({
    kind: "one_surface_post_action_evaluation_result" as const,
    authorityResult: runtime.authorityResult,
    evaluation,
    runtimeEvents: Object.freeze([
      ...runtime.runtimeEvents,
      ...constructionRuntimeEvents
    ])
  });
}

function emitOneSurfacePostActionConstructionEvents(input: {
  readonly context: OneSurfacePostActionConstructionContext;
  readonly evaluationInput: Omit<
    Parameters<typeof oneSurfaceEvaluateActionInputBasis>[0],
    "program"
  >;
  readonly evaluation: OneSurfacePostActionEvaluationResult["evaluation"];
  readonly af16RuntimeEvents: readonly CanonicalRuntimeEvent[];
  readonly emitterContext: RuntimeEventEmitterContext;
  readonly eventSink: RuntimeEventSink;
}): readonly CanonicalRuntimeEvent[] {
  const prior = admitConstructionRuntimeEvents({
    episodeId: input.evaluationInput.invokedEvent.episodeId,
    events: input.context.priorConstructionEvents
  });
  const invokedMatches = prior.filter(
    (event): event is ConstructionGraphActionInvokedEvent & CanonicalRuntimeEvent =>
      event.kind === "construction_graph_action_invoked" &&
      event.constructionEventRef ===
        input.evaluationInput.invokedEvent.constructionEventRef
  );
  const invokedEvent = invokedMatches[0];
  if (
    prior.length !== 8 ||
    invokedMatches.length !== 1 ||
    invokedEvent === undefined ||
    !stableJsonEquals(invokedEvent, input.evaluationInput.invokedEvent)
  ) {
    throw new TypeError(
      "post-action construction requires the exact admitted events 0 through 7"
    );
  }
  const judgedEvents = input.af16RuntimeEvents.filter(
    (event) => event.kind === "c_call_judged"
  );
  const judgedEvent = judgedEvents[0];
  if (judgedEvents.length !== 1 || judgedEvent === undefined) {
    throw new TypeError(
      "post-action construction requires one exact AF16 c_call_judged event"
    );
  }
  const af15ProjectionRef = sourceProjectionRef(
    input.context.af15RuntimeProjection
  );
  const close = input.evaluation.decision.disposition === "close";
  const coordinate = stableSha256Digest({
    episodeId: invokedEvent.episodeId,
    intentId: invokedEvent.intentId,
    decisionRef: input.evaluation.decision.decisionRef
  }).slice("sha256:".length);
  const deltaRef = `construction-delta://abiogenesis/system/one-surface/${coordinate}`;
  const af15RuntimeEventRefs = input.context.af15RuntimeEvents.map(
    (event) => event.eventId
  );
  const af16RuntimeEventRefs = input.af16RuntimeEvents.map(
    (event) => event.eventId
  );
  const delta = constructConstructionDeltaObservedEvent({
    constructionEventRef:
      `construction-event://abiogenesis/system/one-surface/${coordinate}/8-delta-observed`,
    invokedEvent,
    eventSequence: invokedEvent.eventSequence + 1,
    attemptOrdinal: prior.filter(
      (event) =>
        event.kind === "construction_delta_observed" &&
        event.intentId === invokedEvent.intentId
    ).length,
    deltaRef,
    assetDeltaRefs: input.evaluationInput.admittedEvidence.flatMap((row) =>
      row.payloadRef === null ? [] : [row.payloadRef]
    ),
    runtimeEventRefs: Object.freeze([
      ...new Set([...af15RuntimeEventRefs, ...af16RuntimeEventRefs])
    ]),
    beforeProjectionRef: af15ProjectionRef,
    afterProjectionRef: input.evaluation.decision.decisionRef,
    fulfilledObligationRefs: close
      ? input.evaluationInput.targetBinding.obligationRefs
      : Object.freeze([]),
    remainingObligationRefs: close
      ? Object.freeze([])
      : input.evaluationInput.targetBinding.obligationRefs,
    newEvidenceRefs: input.evaluation.evidenceView.evidenceRefs,
    fhDecisionAccepted: false,
    reentryMoved: false,
    closed: close,
    causationEventRefs: Object.freeze([
      invokedEvent.constructionEventRef,
      judgedEvent.eventId
    ])
  });
  const emittedDelta = emitWithContext(
    input.emitterContext,
    delta,
    input.eventSink
  );
  if (!close) {
    return emittedDelta;
  }
  const terminalProjectionDigest = stableSha256Digest({
    episodeId: invokedEvent.episodeId,
    deltaRef,
    decisionRef: input.evaluation.decision.decisionRef
  });
  const terminal = Object.freeze({
    kind: "construction_terminal_disposition_projected" as const,
    constructionEventRef:
      `construction-event://abiogenesis/system/one-surface/${coordinate}/9-terminal-disposition-projected`,
    basisId: delta.basisId,
    graphFunctionId: delta.graphFunctionId,
    runId: delta.runId,
    workKey: delta.workKey,
    episodeId: delta.episodeId,
    iterationOrdinal: delta.iterationOrdinal,
    eventSequence: delta.eventSequence + 1,
    basisProjectionRef: delta.basisProjectionRef,
    priorIntentId: delta.priorIntentId,
    causationEventRefs: Object.freeze([delta.constructionEventRef]),
    correlationId: delta.correlationId,
    terminalProjectionRef:
      `construction-projection://abiogenesis/system/one-surface/${terminalProjectionDigest.slice("sha256:".length)}`,
    publicState: "construction_closed" as const,
    selectedActionRef: invokedEvent.selectedActionRef,
    selectedIntentId: invokedEvent.intentId,
    terminalRouteRefs: Object.freeze([]),
    reviewReasonRefs: Object.freeze([])
  });
  const emittedTerminal = emitWithContext(
    input.emitterContext,
    terminal,
    input.eventSink
  );
  assertCompletedOneSurfaceConstructionChain({
    episodeId: invokedEvent.episodeId,
    events: Object.freeze([
      ...input.context.priorConstructionEvents,
      ...emittedDelta,
      ...emittedTerminal
    ])
  });
  return Object.freeze([...emittedDelta, ...emittedTerminal]);
}

export function createOneSurfaceRuntimeEmitter(
  priorEvents: readonly RuntimeEvent[]
): RuntimeEventEmitterContext {
  return createSeededLiveEmitterContext(priorEvents);
}
