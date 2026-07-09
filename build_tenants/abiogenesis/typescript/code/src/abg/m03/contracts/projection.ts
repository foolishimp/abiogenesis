import type {
  AssessedRuntimeEvent,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import {
  constructRuntimeFluent,
  constructVectorClosedRuntimeFluent,
  eventCalculusEffectInitiates,
  eventCalculusEffectTerminates,
  eventCalculusEffectsForEvent
} from "./event_calculus.js";
import type { RuntimeEventCalculusAxiom } from "./event_calculus.js";
import {
  assertBasisEvent,
  assertVectorIndexInRange,
  freezeNumberArray,
  freezeStringArray,
  sortedNumbers,
  vectorEdge
} from "./runtime_support.js";
import { deriveObservedStateProjection } from "./observed_state.js";
import { deriveOverlayFrameProjection } from "./overlay_frame.js";

type RuntimeProjectionClosureSource = "vector_closed";

export interface RuntimeAggregateProjectionOptions {
  readonly eventCalculusAxioms?:
    | readonly RuntimeEventCalculusAxiom[]
    | undefined;
}

function closeVectorFromReplay(input: {
  readonly basis: ExecutionBasis;
  readonly closed: Set<number>;
  readonly closedBy: Map<number, RuntimeProjectionClosureSource>;
  readonly vectorIndex: number;
  readonly source: RuntimeProjectionClosureSource;
}): void {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  if (input.closed.has(input.vectorIndex)) {
    throw new TypeError(
      `Runtime aggregate projection rejects duplicate vector closure ${input.vectorIndex}`
    );
  }
  for (let index = 0; index < input.vectorIndex; index += 1) {
    if (!input.closed.has(index)) {
      throw new TypeError(
        "Runtime aggregate projection rejects non-replay-derived vector closure order"
      );
    }
  }
  input.closed.add(input.vectorIndex);
  input.closedBy.set(input.vectorIndex, input.source);
}

function assertAssessedEventScope(
  basis: ExecutionBasis,
  event: AssessedRuntimeEvent
): void {
  if (
    basis.runId !== null &&
    event.runId !== null &&
    event.runId !== basis.runId
  ) {
    throw new TypeError(
      `Runtime aggregate projection rejects assessed runId ${JSON.stringify(event.runId)} outside basis run ${JSON.stringify(basis.runId)}`
    );
  }
  if (
    basis.workKey !== null &&
    event.workKey !== null &&
    event.workKey !== basis.workKey
  ) {
    throw new TypeError(
      `Runtime aggregate projection rejects assessed workKey ${JSON.stringify(event.workKey)} outside basis work ${JSON.stringify(basis.workKey)}`
    );
  }
}

function assertAssessedEdgeInGraph(
  basis: ExecutionBasis,
  event: AssessedRuntimeEvent
): void {
  const matchingIndexes: number[] = [];
  for (let index = 0; index < basis.graph.vectors.length; index += 1) {
    if (vectorEdge(basis, index) === event.edge) {
      matchingIndexes.push(index);
    }
  }
  if (matchingIndexes.length === 0) {
    throw new TypeError(
      `Runtime aggregate projection rejects assessed edge ${JSON.stringify(event.edge)} outside graph vectors`
    );
  }
  if (matchingIndexes.length > 1) {
    throw new TypeError(
      `Runtime aggregate projection rejects ambiguous assessed edge ${JSON.stringify(event.edge)}`
    );
  }
}

function retryRepairPlannedRuntimeFluent(
  basis: ExecutionBasis,
  event: Extract<RuntimeEvent, { readonly kind: "retry_repair_planned" }>
) {
  return constructRuntimeFluent({
    name: "retry_repair_planned",
    scope: "vector",
    basisId: event.basisId,
    graphFunctionId: basis.graphFunction.id,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    runId: basis.runId,
    workKey: basis.workKey,
    vectorIndex: event.vectorIndex,
    edge: event.edge
  });
}

function continuationRuntimeFluent(
  basis: ExecutionBasis,
  event:
    | Extract<RuntimeEvent, { readonly kind: "continuation_terminated" }>
    | Extract<RuntimeEvent, { readonly kind: "continuation_reopened" }>,
  name: "continuation_open" | "continuation_terminated",
  continuationId: string
) {
  return constructRuntimeFluent({
    name,
    scope: "continuation",
    basisId: event.basisId,
    graphFunctionId: basis.graphFunction.id,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    runId: basis.runId,
    workKey: basis.workKey,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    continuationId,
    ref: event.causedByRetryRunId
  });
}

export function sourceProjectionRef(projection: RuntimeAggregateProjection): string {
  return [
    "runtime_projection",
    projection.basisId,
    `closed=${projection.closedVectorIndexes.join(",")}`,
    `retry=${projection.retryAttemptRunIds.length}`,
    `leaf=${projection.leafTaskIds.length}`
  ].join(":");
}

export function countRetryAttemptsForVector(
  projection: RuntimeAggregateProjection,
  vectorIndex: number
): number {
  return projection.retryAttemptRefs.filter((attempt) => attempt.vectorIndex === vectorIndex).length;
}

export function manifestSeenInProjection(
  projection: RuntimeAggregateProjection,
  manifestId: string
): boolean {
  return projection.retryAttemptRefs.some(
    (attempt) => attempt.manifestId === manifestId
  );
}

export function deriveRuntimeAggregateProjection(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  options: RuntimeAggregateProjectionOptions = Object.freeze({})
): RuntimeAggregateProjection {
  let graphCallId: string | null = null;
  let frameId: string | null = null;
  const planned = new Set<number>();
  const evaluated = new Set<number>();
  const closed = new Set<number>();
  const closedBy = new Map<number, RuntimeProjectionClosureSource>();
  let resumeCursorVectorIndex: number | null = null;
  const assessedEdges: string[] = [];
  const retryAttemptRunIds = new Set<string>();
  const retryAttemptManifestIds = new Set<string>();
  const retryAttemptRefs: RuntimeAggregateProjection["retryAttemptRefs"][number][] = [];
  const retryProgressRefs: RuntimeAggregateProjection["retryProgressRefs"][number][] = [];
  const actorInvocationRefs: RuntimeAggregateProjection["actorInvocationRefs"][number][] = [];
  const observedActorArtifactRefs: RuntimeAggregateProjection["observedActorArtifactRefs"][number][] = [];
  const actorProcessStarted = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "actor_process_started" }>
  >();
  const actorProcessStartFailed = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "actor_process_start_failed" }>
  >();
  const actorProcessHeartbeats = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "actor_process_heartbeat" }>
  >();
  const actorProcessTimeouts = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "actor_process_timeout" }>
  >();
  const actorProcessSignals = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "actor_process_signal_sent" }>[]
  >();
  const actorProcessExited = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "actor_process_exited" }>
  >();
  const actorProcessStreamRefs: RuntimeAggregateProjection["actorProcessStreamRefs"][number][] = [];
  const pluginTraversalPromptMaterializationRefs: RuntimeAggregateProjection["pluginTraversalPromptMaterializationRefs"][number][] = [];
  const instructionPromptManifestRefs: RuntimeAggregateProjection["instructionPromptManifestRefs"][number][] = [];
  const instructionResponseAdmissionRefs: RuntimeAggregateProjection["instructionResponseAdmissionRefs"][number][] = [];
  const leafTaskIds = new Set<string>();
  const completedLeafTaskIds = new Set<string>();
  const failedLeafTaskIds = new Set<string>();

  for (const event of events) {
    assertBasisEvent(basis, event);
    switch (event.kind) {
      case "graph_call_opened":
        if (
          !eventCalculusEffectInitiates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            constructRuntimeFluent({
              name: "graph_call_open",
              scope: "graph_call",
              basisId: event.basisId,
              graphFunctionId: event.graphFunctionId,
              graphCallId: event.graphCallId,
              runId: event.runId,
              workKey: event.workKey
            })
          )
        ) {
          throw new TypeError(
            "Runtime aggregate projection rejects graph call open without declared Event Calculus law"
          );
        }
        graphCallId = event.graphCallId;
        break;
      case "frame_opened":
        if (
          !eventCalculusEffectInitiates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            constructRuntimeFluent({
              name: "frame_open",
              scope: "frame",
              basisId: event.basisId,
              graphFunctionId: basis.graphFunction.id,
              graphCallId: event.graphCallId,
              frameId: event.frameId,
              runId: basis.runId,
              workKey: basis.workKey
            })
          )
        ) {
          throw new TypeError(
            "Runtime aggregate projection rejects frame open without declared Event Calculus law"
          );
        }
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "vector_traversal_planned":
        assertVectorIndexInRange(basis, event.vectorIndex);
        planned.add(event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "vector_evaluated":
        assertVectorIndexInRange(basis, event.vectorIndex);
        evaluated.add(event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "vector_closed":
        if (
          !eventCalculusEffectInitiates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            constructVectorClosedRuntimeFluent({
              basis,
              vectorIndex: event.vectorIndex,
              graphCallId: event.graphCallId,
              frameId: event.frameId
            })
          )
        ) {
          throw new TypeError(
            "Runtime aggregate projection rejects vector closure without declared Event Calculus law"
          );
        }
        closeVectorFromReplay({
          basis,
          closed,
          closedBy,
          vectorIndex: event.vectorIndex,
          source: "vector_closed"
        });
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_repair_planned":
        if (
          !eventCalculusEffectInitiates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            retryRepairPlannedRuntimeFluent(basis, event)
          )
        ) {
          throw new TypeError(
            "Runtime aggregate projection rejects retry repair without declared Event Calculus law"
          );
        }
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.retryRunId);
        retryAttemptManifestIds.add(event.manifestId);
        retryAttemptRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            retryRunId: event.retryRunId,
            retryCallId: event.retryCallId,
            manifestId: event.manifestId,
            priorManifestId: event.priorManifestId,
            attemptIndex: event.attemptIndex,
            sourceProjectionRef: event.sourceProjectionRef
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_attempt_opened":
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.retryRunId);
        retryAttemptManifestIds.add(event.manifestId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_attempt_stopped":
      case "retry_attempt_escalated":
        assertVectorIndexInRange(basis, event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "retry_progress_recorded":
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.retryRunId);
        retryProgressRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            retryRunId: event.retryRunId,
            progressSignalRefs: freezeStringArray(event.progressSignalRefs),
            stationary: event.stationary
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_invocation_started":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorInvocationRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            actorInvocationId: event.actorInvocationId,
            graphFunctionId: event.graphFunctionId,
            graphCallId: event.graphCallId,
            frameId: event.frameId,
            edge: event.edge,
            runId: event.runId,
            workKey: event.workKey,
            workerId: event.workerId,
            backendId: event.backendId,
            causationEventRefs: freezeStringArray(event.causationEventRefs),
            correlationId: event.correlationId,
            attemptIndex: event.attemptIndex,
            dispatchRef: event.dispatchRef,
            resultRef: event.resultRef,
            closureStatus: null,
            closureDetail: null,
            closureFailureClass: null
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_result_artifact_observed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        observedActorArtifactRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            actorInvocationId: event.actorInvocationId,
            graphFunctionId: event.graphFunctionId,
            graphCallId: event.graphCallId,
            frameId: event.frameId,
            edge: event.edge,
            runId: event.runId,
            workKey: event.workKey,
            workerId: event.workerId,
            backendId: event.backendId,
            causationEventRefs: freezeStringArray(event.causationEventRefs),
            correlationId: event.correlationId,
            resultRef: event.resultRef,
            artifactRef: event.artifactRef
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_invocation_closed": {
        assertVectorIndexInRange(basis, event.vectorIndex);
        // merge onto the LAST unclosed row with this id (defense in
        // depth against id collisions across resume windows)
        let openIndex = -1;
        for (let i = actorInvocationRefs.length - 1; i >= 0; i -= 1) {
          const row = actorInvocationRefs[i];
          if (row !== undefined && row.actorInvocationId === event.actorInvocationId) {
            openIndex = i;
            if (row.closureStatus === null) break;
          }
        }
        if (openIndex !== -1) {
          const open = actorInvocationRefs[openIndex];
          if (open !== undefined) {
            actorInvocationRefs[openIndex] = Object.freeze({
              ...open,
              closureStatus: (event as { closureStatus?: string }).closureStatus ?? null,
              closureDetail: (event as { detail?: string }).detail ?? null,
              closureFailureClass:
                (event as { closureFailureClass?: string }).closureFailureClass ?? null
            });
          }
        }
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      }
      case "actor_process_started":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorProcessStarted.set(event.actorInvocationId, event);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_process_start_failed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorProcessStartFailed.set(event.actorInvocationId, event);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_process_stream_observed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorProcessStreamRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            actorInvocationId: event.actorInvocationId,
            streamName: event.streamName,
            streamRef: event.streamRef,
            chunkIndex: event.chunkIndex,
            byteLength: event.byteLength
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_process_heartbeat":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorProcessHeartbeats.set(event.actorInvocationId, event);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_process_timeout":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorProcessTimeouts.set(event.actorInvocationId, event);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_process_signal_sent":
        assertVectorIndexInRange(basis, event.vectorIndex);
        if (!actorProcessSignals.has(event.actorInvocationId)) {
          actorProcessSignals.set(event.actorInvocationId, []);
        }
        actorProcessSignals.get(event.actorInvocationId)?.push(event);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "actor_process_exited":
        assertVectorIndexInRange(basis, event.vectorIndex);
        actorProcessExited.set(event.actorInvocationId, event);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "runtime_activity_probe_observed":
      case "runtime_external_interruption_observed":
        if (event.vectorIndex !== null) {
          assertVectorIndexInRange(basis, event.vectorIndex);
        }
        graphCallId = event.graphCallId ?? graphCallId;
        frameId = event.frameId ?? frameId;
        break;
      case "plugin_traversal_prompt_materialized":
        assertVectorIndexInRange(basis, event.vectorIndex);
        pluginTraversalPromptMaterializationRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            edge: event.edge,
            traversalKind: event.traversalKind,
            materializationRef: event.materializationRef,
            selectionRef: event.selectionRef,
            selectionSource: event.selectionSource,
            sourceRef: event.sourceRef,
            attrKey: event.attrKey,
            hookRef: event.hookRef,
            actorInvocationId: event.actorInvocationId,
            workerId: event.workerId,
            backendId: event.backendId,
            observerPromptRef: event.observerPromptRef,
            renderedPromptRef: event.renderedPromptRef,
            promptInputDigest: event.promptInputDigest,
            promptTemplateRef: event.promptTemplateRef,
            promptInputContractRef: event.promptInputContractRef,
            expectedOutputContractRef: event.expectedOutputContractRef,
            defaultsBundleRef: event.defaultsBundleRef,
            defaultsBundleDigest: event.defaultsBundleDigest,
            defaultsPath: event.defaultsPath,
            defaultKey: event.defaultKey,
            causationEventRefs: freezeStringArray(event.causationEventRefs),
            correlationId: event.correlationId
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "requirement_proof_carry_through_admitted":
      case "depth_proof_map_admitted":
      case "mutation_outcomes_admitted":
        assertVectorIndexInRange(basis, event.vectorIndex);
        break;
      case "instruction_prompt_manifest_projected":
        assertVectorIndexInRange(basis, event.vectorIndex);
        instructionPromptManifestRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            edge: event.edge,
            actorInvocationId: event.actorInvocationId,
            workerId: event.workerId,
            backendId: event.backendId,
            manifestRef: event.manifestRef,
            manifestDigest: event.manifestDigest,
            planRef: event.planRef,
            planDigest: event.planDigest,
            envelopeRef: event.envelopeRef,
            envelopeDigest: event.envelopeDigest,
            rendererRef: event.rendererRef,
            promptDigest: event.promptDigest,
            includedCarrierRefs: freezeStringArray(event.includedCarrierRefs),
            omittedCarrierRefs: freezeStringArray(event.omittedCarrierRefs),
            refOnlyCarrierRefs: freezeStringArray(event.refOnlyCarrierRefs),
            gapRefs: freezeStringArray(event.gapRefs),
            forbiddenCarrierRefs: freezeStringArray(event.forbiddenCarrierRefs),
            outputContractRefs: freezeStringArray(event.outputContractRefs),
            causationEventRefs: freezeStringArray(event.causationEventRefs),
            correlationId: event.correlationId
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "instruction_response_contract_admitted":
        assertVectorIndexInRange(basis, event.vectorIndex);
        instructionResponseAdmissionRefs.push(
          Object.freeze({
            vectorIndex: event.vectorIndex,
            edge: event.edge,
            actorInvocationId: event.actorInvocationId,
            workerId: event.workerId,
            backendId: event.backendId,
            responseAdmissionRef: event.responseAdmissionRef,
            manifestRef: event.manifestRef,
            manifestDigest: event.manifestDigest,
            planRef: event.planRef,
            envelopeRef: event.envelopeRef,
            resultRef: event.resultRef,
            artifactRef: event.artifactRef,
            artifactContentDigest: event.artifactContentDigest,
            outputContractRefs: freezeStringArray(event.outputContractRefs),
            promptDigest: event.promptDigest,
            causationEventRefs: freezeStringArray(event.causationEventRefs),
            correlationId: event.correlationId
          })
        );
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "continuation_terminated":
        if (
          !eventCalculusEffectInitiates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            continuationRuntimeFluent(
              basis,
              event,
              "continuation_terminated",
              event.continuationId
            )
          ) ||
          !eventCalculusEffectTerminates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            continuationRuntimeFluent(
              basis,
              event,
              "continuation_open",
              event.continuationId
            )
          )
        ) {
          throw new TypeError(
            "Runtime aggregate projection rejects continuation termination without declared Event Calculus law"
          );
        }
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.causedByRetryRunId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "continuation_reopened":
        if (
          !eventCalculusEffectInitiates(
            eventCalculusEffectsForEvent({
              basis,
              event,
              axioms: options.eventCalculusAxioms
            }),
            continuationRuntimeFluent(
              basis,
              event,
              "continuation_open",
              event.continuationId
            )
          )
        ) {
          throw new TypeError(
            "Runtime aggregate projection rejects continuation reopen without declared Event Calculus law"
          );
        }
        assertVectorIndexInRange(basis, event.vectorIndex);
        retryAttemptRunIds.add(event.causedByRetryRunId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "leaf_task_opened":
        assertVectorIndexInRange(basis, event.vectorIndex);
        leafTaskIds.add(event.leafTaskId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "leaf_task_completed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        leafTaskIds.add(event.leafTaskId);
        completedLeafTaskIds.add(event.leafTaskId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "leaf_task_failed":
        assertVectorIndexInRange(basis, event.vectorIndex);
        leafTaskIds.add(event.leafTaskId);
        failedLeafTaskIds.add(event.leafTaskId);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "assessed":
        assertAssessedEventScope(basis, event);
        assertAssessedEdgeInGraph(basis, event);
        assessedEdges.push(event.edge);
        break;
      case "payload_observed":
      case "payload_validated":
      case "payload_rejected":
      case "authority_snapshot_admitted":
      case "evidence_admitted":
      case "ambiguity_observation_admitted":
      case "closure_input_published":
      case "fd_authority_outcome_admitted":
      case "output_instance_allocated":
      case "output_binding_admitted":
      case "output_materialization_observed":
      case "workspace_obligation_ledger_admitted":
      case "workspace_obligation_schedule_derived":
      case "zoom_frame_opened":
      case "scheduled_slice_dispatched":
      case "scheduled_slice_assessed":
      case "zoom_foldback_evaluated":
      case "traversal_modulation_resolved":
      case "traversal_attempt_envelope_derived":
      case "traversal_attempt_dispatched":
      case "traversal_attempt_progress_observed":
      case "traversal_attempt_non_progress_classified":
      case "traversal_forced_review_projected":
      case "traversal_same_edge_continuation_planned":
      case "traversal_modulation_exhausted":
      case "instruction_causal_context_bound":
        assertVectorIndexInRange(basis, event.vectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "graph_span_evaluation_scheduled":
      case "graph_span_assessed":
      case "graph_span_foldback_evaluated":
        assertVectorIndexInRange(basis, event.terminalVectorIndex);
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "graph_reentry_planned":
        if (event.targetVectorIndex !== null) {
          assertVectorIndexInRange(basis, event.targetVectorIndex);
        }
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "graph_reentry_applied":
        if (event.targetVectorIndex !== null) {
          assertVectorIndexInRange(basis, event.targetVectorIndex);
          for (
            let index = event.targetVectorIndex;
            index < basis.graph.vectors.length;
            index += 1
          ) {
            closed.delete(index);
            closedBy.delete(index);
            planned.delete(index);
            evaluated.delete(index);
          }
          resumeCursorVectorIndex = event.targetVectorIndex;
        } else {
          resumeCursorVectorIndex = null;
        }
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "graph_vector_resume_cursor_applied":
        assertVectorIndexInRange(basis, event.targetVectorIndex);
        if (event.targetEdge !== vectorEdge(basis, event.targetVectorIndex)) {
          throw new TypeError(
            "Runtime aggregate projection rejects graph-vector resume cursor edge drift"
          );
        }
        resumeCursorVectorIndex = event.targetVectorIndex;
        graphCallId = event.graphCallId;
        frameId = event.frameId;
        break;
      case "basis_admitted":
      case "lever_resolution_admitted":
      case "fd_advance_ready":
      case "fp_dispatch_requested":
      case "fh_escalated":
      case "terminal_reached":
      case "approved":
      case "revoked":
      case "reset":
      case "timer_intent_admitted":
      case "timer_outcome_admitted":
      case "deadline_breach_admitted":
      case "scheduled_continuation_reopened":
      case "branch_lease_acquired":
      case "branch_lease_released":
      case "branch_lease_superseded":
      case "branch_task_failed":
      case "branch_payload_admitted":
      case "branch_fan_in_projected":
      case "construction_episode_started":
      case "construction_observation_snapshot_materialized":
      case "construction_action_catalog_projected":
      case "construction_evaluator_invoked":
      case "construction_intent_candidate_returned":
      case "construction_intent_candidate_admitted":
      case "construction_intent_candidate_rejected":
      case "construction_intent_selected":
      case "construction_graph_action_invoked":
      case "construction_pressure_package_materialized":
      case "construction_delta_observed":
      case "construction_terminal_disposition_projected":
      case "requirement_route_fact_projected":
      case "executive_pressure_fact_projected":
      case "node_type_satisfaction_projected":
      case "registry_entry_admitted":
      case "registry_entry_rejected":
      case "registry_plugin_advice_admitted":
      case "registry_plugin_advice_rejected":
      case "graph_function_selected":
      case "graph_function_selection_rejected":
      case "workspace_installation_admitted":
      case "observed_state_admitted":
      case "overlay_frame_declared":
      case "overlay_frame_evaluated":
      case "temporal_property_verdict_projected":
      case "declaration_reprice_admitted":
      case "run_segment_opened":
      case "run_resumed":
      case "run_stopped":
      case "workspace_hygiene_stamped":
      case "runtime_failure_observed":
      case "c_call_opened":
      case "c_call_fibre_selected":
      case "c_call_evidenced":
      case "c_call_result_admitted":
      case "c_call_judged":
        break;
      default: {
        const exhaustive: never = event;
        throw new TypeError(
          `Unsupported runtime event for aggregate projection ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }

  let nextVectorIndex: number | null = null;
  const nextSearchStart = resumeCursorVectorIndex ?? 0;
  for (let index = nextSearchStart; index < basis.graph.vectors.length; index += 1) {
    if (!closed.has(index)) {
      nextVectorIndex = index;
      break;
    }
  }

  const plannedVectorIndexes = freezeNumberArray(sortedNumbers(planned));
  const evaluatedVectorIndexes = freezeNumberArray(sortedNumbers(evaluated));
  const closedVectorIndexes = freezeNumberArray(sortedNumbers(closed));
  const frozenAssessedEdges = freezeStringArray(assessedEdges);
  const frozenRetryAttemptRunIds = freezeStringArray([...retryAttemptRunIds].sort());
  const frozenRetryAttemptManifestIds = freezeStringArray([...retryAttemptManifestIds].sort());
  const frozenRetryAttemptRefs = Object.freeze(
    [...retryAttemptRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.attemptIndex - right.attemptIndex;
    })
  );
  const frozenRetryProgressRefs = Object.freeze(
    [...retryProgressRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.retryRunId.localeCompare(right.retryRunId);
    })
  );
  const frozenActorInvocationRefs = Object.freeze(
    [...actorInvocationRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.attemptIndex - right.attemptIndex;
    })
  );
  const frozenObservedActorArtifactRefs = Object.freeze(
    [...observedActorArtifactRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.actorInvocationId.localeCompare(right.actorInvocationId);
    })
  );
  const actorProcessInvocationIds = new Set<string>([
    ...actorProcessStarted.keys(),
    ...actorProcessStartFailed.keys()
  ]);
  const frozenActorProcessRefs = Object.freeze(
    [...actorProcessInvocationIds]
      .map((actorInvocationId) => {
        const started = actorProcessStarted.get(actorInvocationId);
        const startFailed = actorProcessStartFailed.get(actorInvocationId);
        const anchor = started ?? startFailed;
        if (anchor === undefined) {
          throw new TypeError("actor process projection requires replay anchor");
        }
        const exited = actorProcessExited.get(actorInvocationId);
        const latestHeartbeat = actorProcessHeartbeats.get(actorInvocationId);
        const timeout = actorProcessTimeouts.get(actorInvocationId);
        const signalSequence = Object.freeze(
          (actorProcessSignals.get(actorInvocationId) ?? []).map(
            (signalEvent) =>
              Object.freeze({
                signal: signalEvent.signal,
                elapsedMs: signalEvent.elapsedMs
              })
          )
        );
        return Object.freeze({
          vectorIndex: anchor.vectorIndex,
          actorInvocationId,
          graphFunctionId: anchor.graphFunctionId,
          graphCallId: anchor.graphCallId,
          frameId: anchor.frameId,
          edge: anchor.edge,
          runId: anchor.runId,
          workKey: anchor.workKey,
          workerId: anchor.workerId,
          backendId: anchor.backendId,
          causationEventRefs: freezeStringArray(anchor.causationEventRefs),
          correlationId: anchor.correlationId,
          pid: started?.pid ?? null,
          stdoutRef: anchor.stdoutRef,
          stderrRef: anchor.stderrRef,
          startFailed: startFailed !== undefined,
          startFailureKind: startFailed?.failureKind ?? null,
          startFailureDetail: startFailed?.detail ?? null,
          terminalSessionId:
            started?.terminalSessionId ?? startFailed?.terminalSessionId ?? null,
          running: started !== undefined && exited === undefined,
          latestHeartbeatIndex: latestHeartbeat?.heartbeatIndex ?? null,
          latestHeartbeatElapsedMs: latestHeartbeat?.elapsedMs ?? null,
          timeoutObserved: timeout !== undefined,
          timeoutMs: timeout?.timeoutMs ?? null,
          timeoutElapsedMs: timeout?.elapsedMs ?? null,
          signalSequence,
          status: exited?.status ?? null,
          signal: exited?.signal ?? null,
          timedOut: exited?.timedOut ?? false,
          error: exited?.error ?? startFailed?.detail ?? null
        });
      })
      .sort((left, right) => {
        const vectorDelta = left.vectorIndex - right.vectorIndex;
        if (vectorDelta !== 0) {
          return vectorDelta;
        }
        return left.actorInvocationId.localeCompare(right.actorInvocationId);
      })
  );
  const frozenActorProcessStreamRefs = Object.freeze(
    [...actorProcessStreamRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      const invocationDelta = left.actorInvocationId.localeCompare(
        right.actorInvocationId
      );
      if (invocationDelta !== 0) {
        return invocationDelta;
      }
      return left.chunkIndex - right.chunkIndex;
    })
  );
  const frozenPluginTraversalPromptMaterializationRefs = Object.freeze(
    [...pluginTraversalPromptMaterializationRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.materializationRef.localeCompare(right.materializationRef);
    })
  );
  const frozenInstructionPromptManifestRefs = Object.freeze(
    [...instructionPromptManifestRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.manifestRef.localeCompare(right.manifestRef);
    })
  );
  const frozenInstructionResponseAdmissionRefs = Object.freeze(
    [...instructionResponseAdmissionRefs].sort((left, right) => {
      const vectorDelta = left.vectorIndex - right.vectorIndex;
      if (vectorDelta !== 0) {
        return vectorDelta;
      }
      return left.responseAdmissionRef.localeCompare(right.responseAdmissionRef);
    })
  );
  const frozenLeafTaskIds = freezeStringArray([...leafTaskIds].sort());
  const frozenCompletedLeafTaskIds = freezeStringArray([...completedLeafTaskIds].sort());
  const frozenFailedLeafTaskIds = freezeStringArray([...failedLeafTaskIds].sort());
  const observedState = deriveObservedStateProjection(events);
  const overlayFrame = deriveOverlayFrameProjection({
    basis,
    events,
    observedState
  });

  const run = Object.freeze({
    kind: "run_projection",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    vectorCount: basis.graph.vectors.length,
    nextVectorIndex
  } as const);
  const graphCall = Object.freeze({
    kind: "graph_call_projection",
    graphCallId,
    graphFunctionId: basis.graphFunction.id
  } as const);
  const frame = Object.freeze({
    kind: "frame_projection",
    frameId,
    frameLineageId: basis.frameLineageId,
    plannedVectorIndexes,
    evaluatedVectorIndexes,
    closedVectorIndexes,
    assessedEdges: frozenAssessedEdges
  } as const);
  const continuation = Object.freeze({
    kind: "continuation_projection",
    retryAttemptRunIds: frozenRetryAttemptRunIds,
    retryAttemptManifestIds: frozenRetryAttemptManifestIds,
    retryAttemptRefs: frozenRetryAttemptRefs,
    retryProgressRefs: frozenRetryProgressRefs,
    leafTaskIds: frozenLeafTaskIds,
    completedLeafTaskIds: frozenCompletedLeafTaskIds,
    failedLeafTaskIds: frozenFailedLeafTaskIds
  } as const);

  return Object.freeze({
    kind: "runtime_aggregate_projection",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    observedState,
    overlayFrame,
    run,
    graphCall,
    frame,
    continuation,
    graphCallId,
    frameId,
    vectorCount: basis.graph.vectors.length,
    plannedVectorIndexes,
    evaluatedVectorIndexes,
    closedVectorIndexes,
    assessedEdges: frozenAssessedEdges,
    retryAttemptRunIds: frozenRetryAttemptRunIds,
    retryAttemptManifestIds: frozenRetryAttemptManifestIds,
    retryAttemptRefs: frozenRetryAttemptRefs,
    retryProgressRefs: frozenRetryProgressRefs,
    actorInvocationRefs: frozenActorInvocationRefs,
    observedActorArtifactRefs: frozenObservedActorArtifactRefs,
    actorProcessRefs: frozenActorProcessRefs,
    actorProcessStreamRefs: frozenActorProcessStreamRefs,
    pluginTraversalPromptMaterializationRefs:
      frozenPluginTraversalPromptMaterializationRefs,
    instructionPromptManifestRefs: frozenInstructionPromptManifestRefs,
    instructionResponseAdmissionRefs: frozenInstructionResponseAdmissionRefs,
    leafTaskIds: frozenLeafTaskIds,
    completedLeafTaskIds: frozenCompletedLeafTaskIds,
    failedLeafTaskIds: frozenFailedLeafTaskIds,
    nextVectorIndex
  });
}
