import { REQUIREMENT_HANDOFF_IDS } from "../gtl/requirement_handoff.js";
import { isNativeWorkspaceWorkTask, nativeWorkspaceWorkGraphFunctionRef, NATIVE_WORKSPACE_WORK_IDS as nativeIds, NATIVE_WORKSPACE_WORK_HANDLER_DIGEST } from "../product/native_workspace_work.js";
import { WORKSITE_COMMAND_FORWARD_IDS as forwardIds } from "../product/worksite_command_forward_identity.js";
import { semanticLifecycleRefForProgram } from "../gtl/semantic_stage.js";
import { SEMANTIC_IMPLEMENTATION_REFS } from "../gtl/semantic_stage_identity.js";
import { runEnvironmentForProgram, nativeContextLeafFamily } from "../gtl/stdo_run_environment.js";
import { cLeafTerms } from "../gtl/c_algebra.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction_identity.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import * as Effect from "effect/Effect";

import * as Abg from "../abg/index.js";
import { hasNoCompletedRetryExit } from "../abg/retry.js";
import type {
  AbgEventStore,
  ActorRuntimeBinding,
  AdmittedImplementationSet,
  BlockedCCallOutcomeReceipt,
  ExecutableCCallLocusCandidate,
  ExecutionBasis,
  JudgedCCallOutcomeReceipt,
  OpenedTraversalScope,
  RetryCCallOutcomeReceipt,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import { WORKSITE_C0_IDS, WORKSITE_FILE_PARENTS_IDS } from "../gtl/worksite_c0.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
} from "../implementation/contracts.js";
import { constructLeafExecutionAuthority } from "../implementation/leaf_invocation_port.js";
import { unadmittedPhysicalCommit, WORKSITE_FILE_PARENTS_IMPLEMENTATION } from "../implementation/worksite_file_replace.js";
import { WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS } from "../product/worksite_construction_recovery.js";
import {
  isWorksiteFileReplaceRequest,
  isWorksiteFileParentsRequest, WORKSITE_FILE_PARENTS_EFFECT_URI, WORKSITE_FILE_PARENTS_HANDLER_REF, WORKSITE_FILE_PARENTS_HANDLER_DIGEST,
  WORKSITE_FILE_REPLACE_EFFECT_URI,
  WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
  WORKSITE_FILE_REPLACE_HANDLER_REF,
} from "../product/worksite_effect.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { GraphValidation } from "../validator/graph.js";
import { proposeJudgmentCandidate } from "./judgment.js";
import {
  admissionBasis,
  type ExecutionClock,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import { planSuccessfulRetryExit } from "./retry_lifecycle.js";
import {
  applyAdmittedRoute,
  deriveCompletedTraversalCursor,
  type TraversalCursor,
} from "./traversal.js";
import { failTraversal } from "./traversal_failure.js";
import {
  projectExecutableTraversalCompletion,
  type ExecutableTraversalCompletion,
} from "./traversal_completion.js";

export interface ExecutableCCallContext {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly programPublication?: Readonly<ModulePublication>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly stop: ExecutableCCallLocusCandidate;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly scopeClass: "root" | "child";
  readonly deferToApplication?: true;
  readonly clock: ExecutionClock;
  readonly ordinal: number;
}

export interface CCallLifecycleEvaluation {
  readonly kind: "c_call_evaluation";
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

export interface CCallRetryRequest {
  readonly kind: "c_call_retry";
  readonly context: ExecutableCCallContext;
  readonly outcome: RetryCCallOutcomeReceipt;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

export type CCallLifecycleStep =
  | CCallLifecycleEvaluation
  | CCallRetryRequest;

function worksiteLeafAuthority(
  input: ExecutableCCallContext,
  resolution: Abg.AdmittedImplementationResolutionRow,
  cCall: Abg.CCall,
  openedPrefix: DurablePrefixCoordinate,
): ReturnType<typeof constructLeafExecutionAuthority> | null {
  const parents = isWorksiteFileParentsRequest(input.input);
  const native = isNativeWorkspaceWorkTask(input.input);
  const ownerIds = native ? { ...nativeIds, graphFunctionRef: nativeWorkspaceWorkGraphFunctionRef(input.input) } : parents ? WORKSITE_FILE_PARENTS_IDS : WORKSITE_C0_IDS;
  const effectUri = native ? nativeIds.effectUri : parents ? WORKSITE_FILE_PARENTS_EFFECT_URI : WORKSITE_FILE_REPLACE_EFFECT_URI;
  if (
    (!isWorksiteFileReplaceRequest(input.input) && !parents && !native) ||
    input.programPublication === undefined ||
    cCall.graphFunctionRef !== ownerIds.graphFunctionRef ||
    resolution.graphFunctionRef !== ownerIds.graphFunctionRef ||
    resolution.implementationBindingRef !==
      (native ? nativeIds.implementationBindingRef : parents ? WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationBindingRef : "implementation-binding://abiogenesis/worksite/file-replace-fd@5") ||
    resolution.implementationRef !==
      (native ? nativeIds.implementationRef : parents ? WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationRef : "implementation://abiogenesis/worksite/file-replace-fd@5") ||
    resolution.inputContractRef !== ownerIds.inputContractRef ||
    resolution.outputContractRef !== ownerIds.outputContractRef ||
    input.graphFunction.effects.includes(effectUri) === false ||
    resolution.computeRegime !== (native ? "F_P" : "F_D") ||
    input.executionBasis.workspaceBindingId !==
      input.actorRuntimeBinding.workspaceBinding.bindingId ||
    input.executionBasis.workspaceBindingDigest !==
      input.actorRuntimeBinding.workspaceBinding.bindingDigest ||
    input.executionBasis.actorRef !== input.actorRuntimeBinding.workspaceBinding.authorizedActorRef ||
    (native ? input.input.workspaceBinding.bindingId : input.input.workspaceBindingIdentity) !== input.executionBasis.workspaceBindingId ||
    (native ? input.input.workspaceBinding.bindingDigest : input.input.workspaceBindingDigest) !== input.executionBasis.workspaceBindingDigest ||
    input.input.capabilityGrant.actorRef !== input.executionBasis.actorRef ||
    input.input.capabilityGrant.scopeRef !== input.executionBasis.workspaceBindingId ||
    input.input.capabilityGrant.scopeDigest !== input.executionBasis.workspaceBindingDigest
  ) return null;
  Abg.assertHeldEventStoreAtDurablePrefix(input.store, openedPrefix);
  const current = Abg.projectRuntimePrefixesAtDurablePrefix(
    openedPrefix,
    cCall.runId,
  );
  const calculus = Abg.deriveRuntimeEventCalculusProjection(
    current.runtimePrefix,
  );
  if (!parents && isWorksiteFileReplaceRequest(input.input) &&
    !Abg.holdsAt(
      calculus,
      Abg.constructWorksiteObservationCurrentFluent(
        input.input.predecessorObservation.observationRef,
      ),
    )
  ) return null;
  return constructLeafExecutionAuthority({
    actorRef: input.executionBasis.actorRef,
    workspaceBinding: input.actorRuntimeBinding.workspaceBinding,
    workspaceBindingIdentity: input.executionBasis.workspaceBindingId,
    workspaceBindingDigest: input.executionBasis.workspaceBindingDigest,
    executionBasis: input.executionBasis,
    executionBasisRef: input.executionBasis.basisRef,
    executionBasisDigest: input.executionBasis.basisDigest,
    programRef: input.executionBasis.programRef,
    programDigest: input.executionBasis.programDigest,
    programPublication: input.programPublication,
    graphFunctionRef: input.executionBasis.graphFunctionRef,
    graphFunctionDigest: input.executionBasis.graphFunctionDigest,
    cCall,
    cCallRef: cCall.cCallRef,
    cCallDigest: cCall.cCallDigest,
    predecessorPrefix: openedPrefix,
    implementationSet: input.implementationSet,
    implementationSetRef: input.implementationSet.implementationSetRef,
    implementationSetDigest: input.implementationSet.implementationSetDigest,
    leafResolutionCandidateRef: resolution.leafResolutionCandidateRef,
    leafResolutionCandidateDigest: resolution.leafResolutionCandidateDigest,
    implementationResolutionRef: `implementation-resolution://abiogenesis/${sha256Canonical(resolution as unknown as JsonValue).slice("sha256:".length)}`,
    implementationResolutionDigest: sha256Canonical(resolution as unknown as JsonValue),
    implementationResolution: resolution,
    implementationBindingRef: resolution.implementationBindingRef,
    implementationBindingDigest: resolution.implementationBindingDigest,
    implementationRef: resolution.implementationRef,
    implementationOwnerRef: resolution.implementationOwnerProductId,
    effectUri,
    handlerRef: native ? nativeIds.handlerRef : parents ? WORKSITE_FILE_PARENTS_HANDLER_REF : WORKSITE_FILE_REPLACE_HANDLER_REF,
    handlerDigest: native ? NATIVE_WORKSPACE_WORK_HANDLER_DIGEST : parents ? WORKSITE_FILE_PARENTS_HANDLER_DIGEST : WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
    capabilityGrantRef: input.input.capabilityGrant.grantRef,
    capabilityGrantDigest: input.input.capabilityGrant.grantDigest,
  });
}

function failCCall(
  input: ExecutableCCallContext,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  return failTraversal({
    store: input.store,
    predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    eventTime: input.clock.eventTime,
    correlationId: input.clock.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

function projectBlockedCCallCompletion(
  replayState: Abg.ReplayState,
  successorPrefix: DurablePrefixCoordinate,
  cCall: Abg.CCall,
  resultRef: string,
  judgmentRef: string,
  reasonRef: string,
  resultValue: JsonValue,
): ExecutableTraversalCompletion {
  return projectExecutableTraversalCompletion(
    "blocked",
    replayState,
    successorPrefix,
    {
      cCallRef: cCall.cCallRef,
      resultRef,
      judgmentRef,
      resultValue,
      diagnosticRef: reasonRef,
    },
  );
}

export function projectCCallCompletion(
  source: TraversalCursor,
  admitted: Abg.CCallCompletionAdmission,
  target: TraversalCursor | null,
): ExecutableTraversalCompletion {
  if (admitted.disposition === "blocked") {
    const outcome = admitted.outcome;
    const cCall = outcome.disposition === "blocked"
      ? outcome.cCall
      : outcome.admitted.cCall;
    const result = outcome.disposition === "blocked"
      ? outcome.result
      : outcome.admitted.result;
    return projectBlockedCCallCompletion(
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      cCall,
      result.resultRef,
      outcome.disposition === "blocked"
        ? outcome.completion.rejectionJudgmentRef
        : outcome.admitted.judgment.judgmentRef,
      outcome.disposition === "blocked"
        ? outcome.diagnosticRef
        : outcome.admitted.judgment.reasonRef,
      result.value,
    );
  }
  const { cCall, result, judgment } = admitted.outcome.admitted;
  if (admitted.disposition === "failed") {
    return projectExecutableTraversalCompletion(
      "failed",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef: judgment.reasonRef,
      },
    );
  }
  if (admitted.disposition === "application_ready") {
    return projectExecutableTraversalCompletion(
      "application_ready",
      admitted.replayState,
      admitted.outcome.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
      },
    );
  }
  if (admitted.disposition === "gap_stop") {
    return projectExecutableTraversalCompletion(
      "gap_stop", admitted.transition.replayState, admitted.transition.successorPrefix,
      { cCallRef: cCall.cCallRef, resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef, resultValue: result.value },
    );
  }
  if (admitted.disposition === "advanced") {
    if (target === null) {
      return projectExecutableTraversalCompletion(
        "refused",
        admitted.transition.replayState,
        admitted.transition.successorPrefix,
        {
          cCallRef: cCall.cCallRef,
          resultRef: result.resultRef,
          judgmentRef: judgment.judgmentRef,
          resultValue: result.value,
          diagnosticRef:
            "diagnostic://abiogenesis/hog/advanced-target-absent@5",
        },
      );
    }
    const { runtimePrefix, authorityPrefix } =
      Abg.projectRuntimePrefixesAtDurablePrefix(
        admitted.transition.successorPrefix,
        source.runId,
      );
    const route = admitted.transition.route;
    const continuationKind = route.routeKind === "re_enter" ? "re_enter" : "advance";
    const nextCursor = applyAdmittedRoute(
      runtimePrefix,
      source,
      target,
      continuationKind,
      route,
      authorityPrefix,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return projectExecutableTraversalCompletion(
        "refused",
        admitted.transition.replayState,
        admitted.transition.successorPrefix,
        {
          cCallRef: cCall.cCallRef,
          resultRef: result.resultRef,
          judgmentRef: judgment.judgmentRef,
          resultValue: result.value,
          diagnosticRef: `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        },
      );
    }
    return projectExecutableTraversalCompletion(
      "advanced",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: continuationKind === "re_enter"
          ? route.graphSpanReentryProjection!.targetInput
          : route.boundInput?.value ?? result.value,
        continuationKind,
        nextInputContractRef: continuationKind === "re_enter"
          ? admitted.reentryInputContractRef!
          : route.boundInput?.contractRef ?? cCall.outputContractRef,
      },
    );
  }
  return projectExecutableTraversalCompletion(
    "closed",
    admitted.closure.replayState,
    admitted.transition.successorPrefix,
    {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: admitted.closure.closureRef,
      resultValue: result.value,
    },
  );
}

export function evaluateExecutableCCall(
  input: ExecutableCCallContext,
): Effect.Effect<CCallLifecycleStep> {
  return Effect.gen(function* () {
    const resolution = Abg.selectAdmittedImplementationResolution(
      input.implementationSet,
      {
        graphFunctionRef: input.graph.graphFunctionRef,
        nodeRef: input.stop.nodeRef,
        programLocusRef: input.stop.programLocusRef,
        implementationBindingRef: input.stop.implementationBindingRef,
      },
    );
    const outputValueKind = input.leafPort.contractValueKind(
      input.stop.outputContractRef,
      "output",
    );
    const failureValueKind = input.leafPort.contractValueKind(
      input.stop.failureContractRef,
      "failure",
    );
    if (
      resolution === null || outputValueKind === null ||
      failureValueKind === null
    ) {
      return failCCall(
        input,
        input.predecessorPrefix,
        `leaf-resolution-${input.ordinal}`,
        "diagnostic://abiogenesis/implementation/admitted-row-absent@5",
        input.stop as unknown as JsonValue,
      );
    }
    const opened = Abg.openCCall({
      locusClass: "implementation",
      store: input.store,
      predecessorPrefix: input.predecessorPrefix,
      executionBasis: input.executionBasis,
      scope: input.openedTraversalScope,
      program: input.program,
      graphFunction: input.graphFunction,
      graph: input.graph,
      stop: input.stop,
      implementationSet: input.implementationSet,
      resolution,
      basis: admissionBasis(input.clock, "open"),
    });
    if (opened.kind !== "c_call_admission") {
      return failCCall(
        input,
        input.predecessorPrefix,
        `leaf-open-${input.ordinal}`,
        `diagnostic://abiogenesis/c-call/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const requirementHandoffBasis = resolution.implementationRef === REQUIREMENT_HANDOFF_IDS.implementationRef && input.programPublication !== undefined
      ? Abg.constructRequirementHandoffDeclarationBasis({ publication: input.programPublication, graph: input.graph,
          graphFunction: input.graphFunction, executionBasis: input.executionBasis, cCall: opened.cCall, predecessorPrefix: opened.successorPrefix })
      : null;
    const lifecycleRef = input.programPublication === undefined ? undefined : semanticLifecycleRefForProgram(input.programPublication, input.program);
    const lifecyclePublication = lifecycleRef === undefined ? null : input.leafPort.semanticPublicationByDeclarationRef?.(lifecycleRef) ?? null;
    const semanticSourcePublication = lifecyclePublication === null ? null : lifecyclePublication.semanticJobLifecycle !== undefined ? lifecyclePublication : input.leafPort.sourcePublicationByDeclarationRef?.(lifecyclePublication.semanticLifecycle!.sourceDeclarationRef) ?? null;
    const semanticStageBasis = SEMANTIC_IMPLEMENTATION_REFS.includes(resolution.implementationRef) && input.programPublication !== undefined && lifecyclePublication !== null && semanticSourcePublication !== null
      ? Abg.constructSemanticStageNativeBasis({ publication: input.programPublication,
          lifecyclePublication,
          sourcePublication: semanticSourcePublication, graph: input.graph,
          graphFunction: input.graphFunction, executionBasis: input.executionBasis, cCall: opened.cCall,
          cursor: input.stop.cursor, predecessorPrefix: opened.successorPrefix,
          declarationGraphFunctions: input.leafPort.declarationGraphFunctions?.() ?? [] }) : null;
    const worksitePreservedResultBasis = WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS.includes(resolution.implementationRef) && input.programPublication !== undefined
      ? Abg.constructWorksitePreservedResultNativeBasis({ publication: input.programPublication, graph: input.graph, graphFunction: input.graphFunction,
          executionBasis: input.executionBasis, cCall: opened.cCall, cursor: input.stop.cursor, predecessorPrefix: opened.successorPrefix }) : null;
    const worksiteCommandForwardBasis = ([forwardIds.prepareImplementationRef,forwardIds.implementationRef] as readonly string[]).includes(resolution.implementationRef) && input.programPublication !== undefined
      ? Abg.constructWorksiteCommandForwardNativeBasis({publication:input.programPublication,graph:input.graph,graphFunction:input.graphFunction,
          executionBasis:input.executionBasis,cCall:opened.cCall,cursor:input.stop.cursor,predecessorPrefix:opened.successorPrefix}) : null;
    const selectedContextFamily = input.graphFunction.template.nodes.flatMap(node => cLeafTerms(node.term))
      .filter(leaf => leaf.programLocusRef === opened.cCall.programLocusRef)
      .map(leaf => nativeContextLeafFamily(input.graphFunction, leaf));
    const worksiteAssemblyRequired = input.programPublication !== undefined &&
      (resolution.implementationRef === nativeIds.implementationRef ||
        runEnvironmentForProgram(input.programPublication, input.program) !== null &&
        selectedContextFamily.length === 1 && ["constructor", "command_executor"].includes(selectedContextFamily[0] ?? ""));
    const nativeInstructionAssemblyBasis = worksiteAssemblyRequired && input.programPublication !== undefined
      ? Abg.constructNativeInstructionAssemblyBasis({ publication: input.programPublication, graph: input.graph,
          graphFunction: input.graphFunction, declarationGraphFunctions: input.leafPort.declarationGraphFunctions?.() ?? [],
          executionBasis: input.executionBasis, cCall: opened.cCall, cursor: input.stop.cursor,
          predecessorPrefix: opened.successorPrefix }) : null;
    if (worksiteAssemblyRequired && nativeInstructionAssemblyBasis === null) return failCCall(input,
      opened.successorPrefix, `leaf-assembly-${input.ordinal}`,
      "diagnostic://abiogenesis/instruction-assembly/stale-worksite-basis@5", input.stop as unknown as JsonValue);
    const occurrence = Object.freeze({
      ...(nativeInstructionAssemblyBasis === null ? {} : { nativeInstructionAssemblyBasis }),
      ...(worksiteCommandForwardBasis === null ? {} : {worksiteCommandForwardBasis}),
      ...(worksitePreservedResultBasis === null ? {} : { worksitePreservedResultBasis }),
      ...(semanticStageBasis === null ? {} : { semanticStageBasis }),
      ...(requirementHandoffBasis === null ? {} : { requirementHandoffBasis }),
      cCallRef: opened.cCall.cCallRef,
      runId: opened.cCall.runId,
      graphCallId: opened.cCall.graphCallId,
      frameId: opened.cCall.frameId,
      programLocusRef: opened.cCall.programLocusRef,
      taskOrdinal: opened.cCall.taskOrdinal,
      attempt: opened.cCall.attempt,
      executionAuthority: worksiteLeafAuthority(
        input,
        resolution,
        opened.cCall,
        opened.successorPrefix,
      ),
    });
    const invocation = yield* Effect.promise(() =>
      input.leafPort.invoke({
        resolution,
        input: input.input,
        inputDigest: input.stop.cursor.inputDigest,
        failureContractRef: input.stop.failureContractRef,
        occurrence,
        predecessorPrefix: opened.successorPrefix,
      }));
    if (invocation.kind === "leaf_invocation_owner_refusal") {
      return failCCall(
        input,
        opened.successorPrefix,
        `leaf-owner-${input.ordinal}`,
        invocation.diagnosticRef,
        invocation as unknown as JsonValue,
      );
    }
    let completedOwner: Readonly<ClosedLeafOwnerReceipt>;
    let outcomePredecessor = opened.successorPrefix;
    if (invocation.kind === "prepared_probabilistic_leaf_owner_invocation") {
      const effectResult = yield* Effect.promise(() =>
        invocation.invokeActorProcess({
          store: input.store,
          predecessorPrefix: opened.successorPrefix,
          executionBasis: input.executionBasis,
          scope: input.openedTraversalScope,
          cCall: opened.cCall,
          expectedInputDigest: input.stop.cursor.inputDigest,
          occurrence,
          workerContracts: invocation.workerContracts,
          rawResultOwner: { port: input.leafPort, resolution, input: input.input },
          runtime: input.actorRuntimeBinding,
          request: invocation.workerRequest,
          dispatchOrdinal: 1,
          basis: admissionBasis(input.clock, "actor-process"),
        }));
      if (effectResult.kind === "actor_process_effect_refusal") {
        return failCCall(
          input,
          effectResult.successorPrefix,
          `leaf-effect-${input.ordinal}`,
          effectResult.diagnosticRef,
          effectResult as unknown as JsonValue,
        );
      }
      const effectReceipt = effectResult;
      try {
        completedOwner = yield* Effect.promise(async () =>
          await invocation.complete(effectReceipt.exchange));
      } catch {
        return failCCall(
          input,
          effectReceipt.successorPrefix,
          `leaf-completion-${input.ordinal}`,
          "diagnostic://abiogenesis/implementation/owner-boundary-exception@5",
          effectReceipt as unknown as JsonValue,
        );
      }
      outcomePredecessor = effectReceipt.successorPrefix;
    } else {
      completedOwner = invocation;
    }
    const outcomeInput = {
      outcomeClass: "leaf",
      store: input.store,
      predecessorPrefix: outcomePredecessor,
      executionBasis: input.executionBasis,
      implementationSet: input.implementationSet,
      graph: input.graph,
      graphFunction: input.graphFunction,
      cursor: input.stop.cursor,
      cCall: opened.cCall,
      resolution,
      leafPort: input.leafPort,
      input: input.input,
      inputDigest: input.stop.cursor.inputDigest,
      ownerReceipt: completedOwner,
      ...(input.programPublication === undefined ? {} : { programPublication: input.programPublication }),
      outputValueKind,
      failureValueKind,
      basis: admissionBasis(input.clock, "outcome"),
    } as const;
    let resultOutcome: ReturnType<typeof Abg.admitCCallResult>;
    try {
      resultOutcome = input.stop.computeRegime === "F_P"
        ? Abg.admitCCallResult({
            ...outcomeInput,
            regime: "F_P",
            actorRuntimeBinding: input.actorRuntimeBinding,
          })
        : Abg.admitCCallResult({ ...outcomeInput, regime: "F_D" });
    } catch (error) {
      const residue = unadmittedPhysicalCommit(
        opened.cCall.cCallRef,
        completedOwner.candidate.resultCandidate,
        outcomePredecessor,
      );
      if (residue === null) throw error;
      const replayState = Abg.projectRuntimeTruthAtDurablePrefix(
        outcomePredecessor,
        opened.cCall.runId,
      ).replayState;
      return {
        kind: "c_call_evaluation" as const,
        outputValueKind,
        outputContractRef: input.stop.outputContractRef,
        completion: projectExecutableTraversalCompletion(
          "refused",
          replayState,
          outcomePredecessor,
          {
            cCallRef: opened.cCall.cCallRef,
            resultValue: residue as unknown as JsonValue,
            diagnosticRef: residue.diagnosticRef,
          },
        ),
      };
    }
    const admitted = resultOutcome.disposition !== "result"
      ? resultOutcome
      : (() => {
          const relation = input.leafPort.resolveJudgmentRelation(
            resultOutcome.cCall.judgmentPredicateRef,
          );
          if (relation === null) {
            return failCCall(
              input,
              resultOutcome.successorPrefix,
              `leaf-judgment-relation-${input.ordinal}`,
              "diagnostic://abiogenesis/hog/judgment-relation-absent@5",
              resultOutcome.cCall as unknown as JsonValue,
            );
          }
          const candidate = proposeJudgmentCandidate({
            cCall: resultOutcome.cCall,
            result: resultOutcome.result,
            replayState: resultOutcome.replayState,
            contractRef: resultOutcome.cCall.judgmentContractRef,
            currentOwnerPrefix: resultOutcome.successorPrefix,
            decision: completedOwner.candidate.disposition === "success"
              ? { decisionClass: "evaluate", input: input.input, relation }
              : {
                  decisionClass: "refuse",
                  predicateRef: resultOutcome.cCall.judgmentPredicateRef,
                  reasonRef: completedOwner.candidate.diagnosticRef,
                },
          });
          return Abg.admitCCallJudgment({
            store: input.store,
            graph: input.graph,
            graphFunction: input.graphFunction,
            cursor: input.stop.cursor,
            outcome: resultOutcome,
            candidate,
            basis: admissionBasis(input.clock, "judgment"),
          });
        })();
    if (admitted.disposition === "retry") {
      return {
        kind: "c_call_retry" as const,
        context: input,
        outcome: admitted,
        outputValueKind,
        outputContractRef: input.stop.outputContractRef,
      };
    }
    const selectedTarget = input.deferToApplication === true ? undefined
      : Routes.deriveSelectedCCallOutcomeTarget(input.graph, input.stop.cursor, admitted);
    if (selectedTarget?.kind === "traversal_route_proposal_refusal") {
      return failCCall(input, admitted.successorPrefix, `leaf-continuation-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${selectedTarget.code}@5`, selectedTarget as unknown as JsonValue);
    }
    let retained: ReturnType<typeof Abg.deriveRetainedCCallInputAtPrefix> = null;
    if (admitted.disposition === "judged" && admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance" && input.deferToApplication !== true &&
      selectedTarget === undefined) {
      try {
        const truth = Abg.projectRuntimePrefixesAtDurablePrefix(admitted.successorPrefix, input.stop.cursor.runId);
        retained = Abg.deriveRetainedCCallInputAtPrefix(truth.authorityPrefix, input.executionBasis,
          input.graph, input.stop.cursor, admitted.admitted.cCall, admitted.admitted.result, admitted.admitted.judgment);
      } catch {
        return failCCall(input, admitted.successorPrefix, `leaf-retention-${input.ordinal}`,
          "diagnostic://abiogenesis/hog/retention-binding-invalid@5", { stage: "retention" });
      }
    }
    let target: TraversalCursor | null = selectedTarget ?? null;
    if (
      admitted.disposition === "judged" &&
      admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance" &&
      input.deferToApplication !== true && selectedTarget === undefined
    ) {
      const derived = deriveCompletedTraversalCursor(
        input.graph,
        input.stop.cursor,
        {
          inputRef: retained?.input.admissionRef ?? admitted.admitted.result.resultRef,
          inputDigest: retained?.input.subjectDigest ?? admitted.admitted.result.valueDigest,
        },
      );
      if (derived?.kind === "traversal_refusal") {
        return failCCall(
          input,
          admitted.successorPrefix,
          `leaf-continuation-${input.ordinal}`,
          `diagnostic://abiogenesis/hog/${derived.code}@5`,
          derived as unknown as JsonValue,
        );
      }
      target = derived;
    }
    const applicationReady = admitted.disposition === "judged" &&
      input.deferToApplication === true &&
      admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance";
    const retryProgressBasis = admissionBasis(input.clock, "retry-progress");
    // Selected nonordinary targets are not ordinary successful continuations.
    // Only actual unchanged rooted retry topology makes progress inapplicable;
    // all other cases retain the existing planner and its exact refusal/guards.
    const noSelectedRetryExit = selectedTarget !== undefined &&
      hasNoCompletedRetryExit(input.graph, input.stop.cursor, target);
    const retryExit = admitted.disposition === "judged" &&
        !applicationReady &&
        !noSelectedRetryExit &&
        admitted.admitted.result.resultClass === "success" &&
        admitted.admitted.judgment.judgment === "advance"
      ? planSuccessfulRetryExit({
          predecessorPrefix: admitted.successorPrefix,
          graph: input.graph,
          graphFunction: input.graphFunction,
          source: input.stop.cursor,
          target,
          completion: {
            completionClass: "judged_success",
            cCall: admitted.admitted.cCall,
            result: admitted.admitted.result,
            judgment: admitted.admitted.judgment,
          },
          basis: retryProgressBasis,
        })
      : null;
    if (retryExit?.kind === "successful_retry_exit_plan_refusal") {
      return failCCall(
        input,
        admitted.successorPrefix,
        `leaf-retry-progress-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${retryExit.code}@5`,
        retryExit as unknown as JsonValue,
      );
    }
    const proposedTransition = applicationReady
      ? null
      : Routes.proposeCCallOutcomeTransition({
          ...(retained === null ? {} : { boundInput: retained.input }),
        graph: input.graph,
          graphFunction: input.graphFunction,
          sourceCursor: input.stop.cursor,
          targetCursor: admitted.disposition === "blocked" ? null : target,
          outcome: admitted,
          ...(retryExit?.kind === "successful_retry_exit_plan"
            ? { completedRetryProgress: retryExit.plan }
            : {}),
          terminalizeNonAdvance: input.scopeClass === "root",
        });
    if (
      proposedTransition !== null &&
      proposedTransition.kind !== "traversal_transition_candidate"
    ) {
      return failCCall(
        input,
        admitted.successorPrefix,
        `leaf-route-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${proposedTransition.code}@5`,
        proposedTransition as unknown as JsonValue,
      );
    }
    const completionAdmission = Abg.admitCCallCompletion({
      store: input.store,
      predecessorPrefix: admitted.successorPrefix,
      executionBasis: input.executionBasis,
      graph: input.graph,
      graphFunction: input.graphFunction,
      source: input.stop.cursor,
      target: admitted.disposition === "blocked" ? null : target,
      outcome: admitted as JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
      candidate: proposedTransition,
      openedTraversalScope: input.openedTraversalScope,
      closureContract: input.closureContract,
      basis: admissionBasis(input.clock, "completion"),
      ...(retryExit?.kind === "successful_retry_exit_plan"
        ? { completedRetryProgress: retryExit }
        : {}),
      ...(input.deferToApplication === true
        ? { deferToApplication: true as const }
        : {}),
    });
    if (completionAdmission.kind !== "c_call_completion_admission") {
      return failCCall(
        input,
        admitted.successorPrefix,
        `leaf-completion-${input.ordinal}`,
        `diagnostic://abiogenesis/hog/${completionAdmission.code}@5`,
        completionAdmission as unknown as JsonValue,
      );
    }
    return {
      kind: "c_call_evaluation" as const,
      completion: projectCCallCompletion(
        input.stop.cursor,
        completionAdmission,
        target,
      ),
      outputValueKind,
      outputContractRef: input.stop.outputContractRef,
    };
  });
}
