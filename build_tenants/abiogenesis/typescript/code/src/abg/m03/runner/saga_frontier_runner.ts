// Implements: T-141
// Implements: REQ-R-ABG3-SAGA-FRONTIER

import type {
  BranchFanInProjectedEvent,
  BranchLeaseAcquiredEvent,
  BranchLeaseReleasedEvent,
  BranchPayloadAdmittedEvent,
  BranchTaskFailedEvent,
  ExecutionBasis,
  RuntimeEvent,
  RuntimeFailureClass
} from "../contracts/carriers.js";
import type {
  BranchAttemptRef,
  BranchExecutionPolicy,
  BranchSelectionProjection,
  DependencyFrontierDeclaration
} from "../contracts/saga_frontier.js";
import {
  constructBranchAttemptRef,
  constructBranchFanInInputRow,
  constructBranchFanInProjectedEvent,
  constructBranchLeaseAcquiredEvent,
  constructBranchLeaseReleasedEvent,
  constructBranchPayloadAdmittedEvent,
  constructBranchTaskFailedEvent,
  deriveDependencyFrontierProjection,
  deriveBranchFanInProjection,
  deriveBranchIdempotencyKey,
  selectDisjointReadyBranches
} from "../contracts/saga_frontier.js";
import { emit, type RuntimeEventSink } from "../events/index.js";
import { stableSha256HexDigest } from "../../../shared/runtime_identity.js";

export interface NativeBranchTaskResult {
  readonly kind: "native_branch_task_result";
  readonly branchRef: string;
  readonly payloadDigest: string;
  readonly evidenceRefs: readonly string[];
}

interface NativeBranchTaskFailure {
  readonly kind: "native_branch_task_failure";
  readonly branchRef: string;
  readonly failureClass: RuntimeFailureClass;
  readonly failureDigest: string;
  readonly evidenceRefs: readonly string[];
}

type NativeBranchTaskSettlement =
  | {
      readonly status: "fulfilled";
      readonly result: NativeBranchTaskResult;
    }
  | {
      readonly status: "rejected";
      readonly failure: NativeBranchTaskFailure;
    };

export interface NativeBranchTask {
  readonly kind: "native_branch_task";
  readonly branchRef: string;
  readonly run: () => Promise<NativeBranchTaskResult>;
}

export interface NativeSagaFrontierBatchResult {
  readonly kind: "native_saga_frontier_batch_result";
  readonly batchOrdinal: number;
  readonly selection: BranchSelectionProjection;
  readonly results: readonly NativeBranchTaskResult[];
}

export interface NativeSagaFrontierRunResult {
  readonly kind: "native_saga_frontier_run_result";
  readonly frontierRef: string;
  readonly policyRef: string;
  readonly batchCount: number;
  readonly completedBranchRefs: readonly string[];
  readonly deferredBranchRefs: readonly string[];
  readonly batches: readonly NativeSagaFrontierBatchResult[];
  readonly results: readonly NativeBranchTaskResult[];
}

export interface EventedNativeSagaFrontierBatchResult {
  readonly kind: "evented_native_saga_frontier_batch_result";
  readonly batchOrdinal: number;
  readonly selection: BranchSelectionProjection;
  readonly leaseAcquiredEvents: readonly BranchLeaseAcquiredEvent[];
  readonly taskResults: readonly NativeBranchTaskResult[];
  readonly taskFailureEvents: readonly BranchTaskFailedEvent[];
  readonly payloadAdmittedEvents: readonly BranchPayloadAdmittedEvent[];
  readonly leaseReleasedEvents: readonly BranchLeaseReleasedEvent[];
  readonly fanInProjectedEvent: BranchFanInProjectedEvent | null;
  readonly emittedEvents: readonly RuntimeEvent[];
}

export interface EventedNativeSagaFrontierRunResult {
  readonly kind: "evented_native_saga_frontier_run_result";
  readonly frontierRef: string;
  readonly policyRef: string;
  readonly batchCount: number;
  readonly completedBranchRefs: readonly string[];
  readonly deferredBranchRefs: readonly string[];
  readonly failedBranchRefs: readonly string[];
  readonly batches: readonly EventedNativeSagaFrontierBatchResult[];
  readonly results: readonly NativeBranchTaskResult[];
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
}

interface NativeSagaFrontierRunState {
  readonly batchOrdinal: number;
  readonly completedBranchRefs: readonly string[];
  readonly batches: readonly NativeSagaFrontierBatchResult[];
  readonly results: readonly NativeBranchTaskResult[];
}

interface EventedNativeSagaFrontierRunState {
  readonly batchOrdinal: number;
  readonly completedBranchRefs: readonly string[];
  readonly failedBranchRefs: readonly string[];
  readonly batches: readonly EventedNativeSagaFrontierBatchResult[];
  readonly results: readonly NativeBranchTaskResult[];
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
}

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeUniqueSortedStrings(values: readonly string[]): readonly string[] {
  return freezeStringArray([...new Set(values)].sort());
}

function taskMap(tasks: readonly NativeBranchTask[]): ReadonlyMap<string, NativeBranchTask> {
  const map = new Map<string, NativeBranchTask>();
  for (const task of tasks) {
    if (map.has(task.branchRef)) {
      throw new TypeError(
        `Native saga frontier runner rejects duplicate task for ${JSON.stringify(task.branchRef)}`
      );
    }
    map.set(task.branchRef, task);
  }
  return map;
}

async function runSelectedTasks(input: {
  readonly selection: BranchSelectionProjection;
  readonly tasksByBranchRef: ReadonlyMap<string, NativeBranchTask>;
}): Promise<readonly NativeBranchTaskResult[]> {
  const selectedTasks = input.selection.selectedBranchRefs.map((branchRef) => {
    const task = input.tasksByBranchRef.get(branchRef);
    if (task === undefined) {
      throw new TypeError(
        `Native saga frontier runner has no task for selected branch ${JSON.stringify(branchRef)}`
      );
    }
    return task;
  });
  const results = await Promise.all(
    selectedTasks.map(async (task) => {
      const result = await task.run();
      if (result.branchRef !== task.branchRef) {
        throw new TypeError(
          "Native saga frontier runner rejects result for a different branch"
        );
      }
      return Object.freeze({
        kind: "native_branch_task_result",
        branchRef: result.branchRef,
        payloadDigest: result.payloadDigest,
        evidenceRefs: freezeStringArray(result.evidenceRefs)
      } satisfies NativeBranchTaskResult);
    })
  );
  return Object.freeze(results);
}

function failureDigestForTask(input: {
  readonly branchRef: string;
  readonly reason: unknown;
}): string {
  const reason =
    input.reason instanceof Error
      ? `${input.reason.name}:${input.reason.message}`
      : String(input.reason);
  return `branch-task-failure:${stableSha256HexDigest({
    branchRef: input.branchRef,
    reason
  })}`;
}

function failureClassForTaskRejection(reason: unknown): RuntimeFailureClass {
  if (
    reason instanceof TypeError &&
    reason.message ===
      "Native saga frontier runner rejects result for a different branch"
  ) {
    return "contract_failure";
  }
  return "runtime_failure";
}

async function runSelectedTasksSettled(input: {
  readonly selection: BranchSelectionProjection;
  readonly tasksByBranchRef: ReadonlyMap<string, NativeBranchTask>;
}): Promise<readonly NativeBranchTaskSettlement[]> {
  const selectedTasks = input.selection.selectedBranchRefs.map((branchRef) => {
    const task = input.tasksByBranchRef.get(branchRef);
    if (task === undefined) {
      throw new TypeError(
        `Native saga frontier runner has no task for selected branch ${JSON.stringify(branchRef)}`
      );
    }
    return task;
  });
  const settlements = await Promise.all(
    selectedTasks.map(async (task) => {
      try {
        const result = await task.run();
        if (result.branchRef !== task.branchRef) {
          throw new TypeError(
            "Native saga frontier runner rejects result for a different branch"
          );
        }
        return Object.freeze({
          status: "fulfilled",
          result: Object.freeze({
            kind: "native_branch_task_result",
            branchRef: result.branchRef,
            payloadDigest: result.payloadDigest,
            evidenceRefs: freezeStringArray(result.evidenceRefs)
          } satisfies NativeBranchTaskResult)
        } satisfies NativeBranchTaskSettlement);
      } catch (reason) {
        return Object.freeze({
          status: "rejected",
          failure: Object.freeze({
            kind: "native_branch_task_failure",
            branchRef: task.branchRef,
            failureClass: failureClassForTaskRejection(reason),
            failureDigest: failureDigestForTask({
              branchRef: task.branchRef,
              reason
            }),
            evidenceRefs: Object.freeze([])
          } satisfies NativeBranchTaskFailure)
        } satisfies NativeBranchTaskSettlement);
      }
    })
  );
  return Object.freeze(settlements);
}

function declarationMap(
  declarations: readonly DependencyFrontierDeclaration[]
): ReadonlyMap<string, DependencyFrontierDeclaration> {
  const map = new Map<string, DependencyFrontierDeclaration>();
  for (const declaration of declarations) {
    const branchRef = declaration.branchRef.branchRef;
    if (map.has(branchRef)) {
      throw new TypeError(
        `Native saga frontier runner rejects duplicate declaration for ${JSON.stringify(branchRef)}`
      );
    }
    map.set(branchRef, declaration);
  }
  return map;
}

function appendBatchState(input: {
  readonly state: NativeSagaFrontierRunState;
  readonly batch: NativeSagaFrontierBatchResult;
  readonly batchResults: readonly NativeBranchTaskResult[];
}): NativeSagaFrontierRunState {
  return Object.freeze({
    batchOrdinal: input.state.batchOrdinal + 1,
    completedBranchRefs: freezeUniqueSortedStrings([
      ...input.state.completedBranchRefs,
      ...input.batchResults.map((result) => result.branchRef)
    ]),
    batches: Object.freeze([...input.state.batches, input.batch]),
    results: Object.freeze([...input.state.results, ...input.batchResults])
  } satisfies NativeSagaFrontierRunState);
}

function runResult(input: {
  readonly frontierRef: string;
  readonly policy: BranchExecutionPolicy;
  readonly state: NativeSagaFrontierRunState;
  readonly deferredBranchRefs: readonly string[];
}): NativeSagaFrontierRunResult {
  return Object.freeze({
    kind: "native_saga_frontier_run_result",
    frontierRef: input.frontierRef,
    policyRef: input.policy.policyRef,
    batchCount: input.state.batches.length,
    completedBranchRefs: input.state.completedBranchRefs,
    deferredBranchRefs: freezeStringArray(input.deferredBranchRefs),
    batches: input.state.batches,
    results: input.state.results
  });
}

async function runNativeSagaFrontierBatches(input: {
  readonly frontierRef: string;
  readonly declarations: readonly DependencyFrontierDeclaration[];
  readonly policy: BranchExecutionPolicy;
  readonly staleObservedStateRefs?: readonly string[] | undefined;
  readonly admittedIdempotencyKeys?: readonly string[] | undefined;
  readonly activeLeaseBranchRefs?: readonly string[] | undefined;
  readonly maxBatches: number;
  readonly tasksByBranchRef: ReadonlyMap<string, NativeBranchTask>;
  readonly state: NativeSagaFrontierRunState;
}): Promise<NativeSagaFrontierRunResult> {
  if (input.state.batchOrdinal >= input.maxBatches) {
    return runResult({
      frontierRef: input.frontierRef,
      policy: input.policy,
      state: input.state,
      deferredBranchRefs: Object.freeze([])
    });
  }
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: input.frontierRef,
    declarations: input.declarations,
    closedBranchRefs: input.state.completedBranchRefs,
    staleObservedStateRefs: input.staleObservedStateRefs,
    admittedIdempotencyKeys: input.admittedIdempotencyKeys,
    activeLeaseBranchRefs: input.activeLeaseBranchRefs
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: `${input.frontierRef}:selection:${input.state.batchOrdinal}`,
    frontier,
    policy: input.policy
  });
  if (selection.selectedBranchRefs.length === 0) {
    return runResult({
      frontierRef: input.frontierRef,
      policy: input.policy,
      state: input.state,
      deferredBranchRefs: selection.deferredReadyBranchRefs
    });
  }
  const batchResults = await runSelectedTasks({
    selection,
    tasksByBranchRef: input.tasksByBranchRef
  });
  const batch = Object.freeze({
    kind: "native_saga_frontier_batch_result",
    batchOrdinal: input.state.batchOrdinal,
    selection,
    results: batchResults
  } satisfies NativeSagaFrontierBatchResult);
  return runNativeSagaFrontierBatches({
    ...input,
    state: appendBatchState({
      state: input.state,
      batch,
      batchResults
    })
  });
}

export async function runNativeSagaFrontier(input: {
  readonly frontierRef: string;
  readonly declarations: readonly DependencyFrontierDeclaration[];
  readonly policy: BranchExecutionPolicy;
  readonly tasks: readonly NativeBranchTask[];
  readonly initialClosedBranchRefs?: readonly string[] | undefined;
  readonly staleObservedStateRefs?: readonly string[] | undefined;
  readonly admittedIdempotencyKeys?: readonly string[] | undefined;
  readonly activeLeaseBranchRefs?: readonly string[] | undefined;
  readonly maxBatches?: number | undefined;
}): Promise<NativeSagaFrontierRunResult> {
  const tasksByBranchRef = taskMap(input.tasks);
  const maxBatches = input.maxBatches ?? input.declarations.length;
  return runNativeSagaFrontierBatches({
    frontierRef: input.frontierRef,
    declarations: input.declarations,
    policy: input.policy,
    staleObservedStateRefs: input.staleObservedStateRefs,
    admittedIdempotencyKeys: input.admittedIdempotencyKeys,
    activeLeaseBranchRefs: input.activeLeaseBranchRefs,
    maxBatches,
    tasksByBranchRef,
    state: Object.freeze({
      batchOrdinal: 0,
      completedBranchRefs: freezeUniqueSortedStrings(
        input.initialClosedBranchRefs ?? Object.freeze([])
      ),
      batches: Object.freeze([]),
      results: Object.freeze([])
    })
  });
}

function appendEventedBatchState(input: {
  readonly state: EventedNativeSagaFrontierRunState;
  readonly batch: EventedNativeSagaFrontierBatchResult;
}): EventedNativeSagaFrontierRunState {
  return Object.freeze({
    batchOrdinal: input.state.batchOrdinal + 1,
    completedBranchRefs: freezeUniqueSortedStrings([
      ...input.state.completedBranchRefs,
      ...input.batch.taskResults.map((result) => result.branchRef)
    ]),
    failedBranchRefs: freezeUniqueSortedStrings([
      ...input.state.failedBranchRefs,
      ...input.batch.taskFailureEvents.map((event) => event.branchRef)
    ]),
    batches: Object.freeze([...input.state.batches, input.batch]),
    results: Object.freeze([...input.state.results, ...input.batch.taskResults]),
    emittedEvents: Object.freeze([
      ...input.state.emittedEvents,
      ...input.batch.emittedEvents
    ]),
    replayEvents: Object.freeze([
      ...input.state.replayEvents,
      ...input.batch.emittedEvents
    ])
  } satisfies EventedNativeSagaFrontierRunState);
}

function eventedRunResult(input: {
  readonly frontierRef: string;
  readonly policy: BranchExecutionPolicy;
  readonly state: EventedNativeSagaFrontierRunState;
  readonly deferredBranchRefs: readonly string[];
}): EventedNativeSagaFrontierRunResult {
  return Object.freeze({
    kind: "evented_native_saga_frontier_run_result",
    frontierRef: input.frontierRef,
    policyRef: input.policy.policyRef,
    batchCount: input.state.batches.length,
    completedBranchRefs: input.state.completedBranchRefs,
    deferredBranchRefs: freezeStringArray(input.deferredBranchRefs),
    failedBranchRefs: input.state.failedBranchRefs,
    batches: input.state.batches,
    results: input.state.results,
    emittedEvents: input.state.emittedEvents,
    replayEvents: input.state.replayEvents
  });
}

function attemptRefForDeclaration(input: {
  readonly declaration: DependencyFrontierDeclaration;
  readonly attemptOrdinal: number;
}): BranchAttemptRef {
  return constructBranchAttemptRef({
    branchRef: input.declaration.branchRef,
    attemptOrdinal: input.attemptOrdinal
  });
}

function batchLeaseEvents(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly selection: BranchSelectionProjection;
  readonly declarationsByBranchRef: ReadonlyMap<string, DependencyFrontierDeclaration>;
  readonly attemptOrdinal: number;
  readonly leasedAtMs: number;
  readonly leaseTtlMs: number | null;
  readonly correlationId: string;
}): readonly BranchLeaseAcquiredEvent[] {
  return Object.freeze(
    input.selection.selectedBranchRefs.map((branchRef, index) => {
      const declaration = input.declarationsByBranchRef.get(branchRef);
      if (declaration === undefined) {
        throw new TypeError(
          `Native saga frontier event runner has no declaration for selected branch ${JSON.stringify(branchRef)}`
        );
      }
      const attempt = attemptRefForDeclaration({
        declaration,
        attemptOrdinal: input.attemptOrdinal
      });
      const leasedAtMs = input.leasedAtMs + index;
      return constructBranchLeaseAcquiredEvent({
        basis: input.basis,
        frontierRef: input.frontierRef,
        branchRef: declaration.branchRef,
        branchAttemptRef: attempt,
        leasedWriteTerritoryRefs: declaration.writeTerritoryRefs,
        leasedOutputAllocationRefs: declaration.outputAllocationRefs,
        leasedAtMs,
        expiresAtMs:
          input.leaseTtlMs === null ? null : leasedAtMs + input.leaseTtlMs,
        causationEventRefs: [input.selection.selectionRef],
        correlationId: input.correlationId
      });
    })
  );
}

function payloadEventsForBatch(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly declarationsByBranchRef: ReadonlyMap<string, DependencyFrontierDeclaration>;
  readonly leaseEvents: readonly BranchLeaseAcquiredEvent[];
  readonly taskResults: readonly NativeBranchTaskResult[];
  readonly correlationId: string;
}): readonly BranchPayloadAdmittedEvent[] {
  const leaseByBranchRef = new Map(
    input.leaseEvents.map((event) => [event.branchRef, event])
  );
  return Object.freeze(
    input.taskResults.map((result) => {
      const declaration = input.declarationsByBranchRef.get(result.branchRef);
      const lease = leaseByBranchRef.get(result.branchRef);
      if (declaration === undefined || lease === undefined) {
        throw new TypeError(
          `Native saga frontier event runner cannot admit payload for ${JSON.stringify(result.branchRef)}`
        );
      }
      const key = deriveBranchIdempotencyKey({
        commandKind: "admit_branch_result",
        branchRef: declaration.branchRef,
        branchAttemptRef: lease.branchAttemptRef,
        observedStateRefs: declaration.observedStateRefs,
        outputAllocationRefs: declaration.outputAllocationRefs,
        writeTerritoryRefs: declaration.writeTerritoryRefs
      });
      return constructBranchPayloadAdmittedEvent({
        basis: input.basis,
        frontierRef: input.frontierRef,
        fanInScopeRef: declaration.fanInScopeRef,
        key,
        payloadDigest: result.payloadDigest,
        evidenceRefs: result.evidenceRefs,
        causationEventRefs: [lease.leaseRef],
        correlationId: input.correlationId
      });
    })
  );
}

function releaseEventsForBatch(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly leaseEvents: readonly BranchLeaseAcquiredEvent[];
  readonly payloadEvents: readonly BranchPayloadAdmittedEvent[];
  readonly taskFailureEvents?: readonly BranchTaskFailedEvent[] | undefined;
  readonly releasedAtMs: number;
  readonly correlationId: string;
}): readonly BranchLeaseReleasedEvent[] {
  const payloadByBranchRef = new Map(
    input.payloadEvents.map((event) => [event.branchRef, event])
  );
  const failureByBranchRef = new Map(
    (input.taskFailureEvents ?? Object.freeze([])).map((event) => [
      event.branchRef,
      event
    ])
  );
  return Object.freeze(
    input.leaseEvents.map((leaseEvent, index) => {
      const payloadEvent = payloadByBranchRef.get(leaseEvent.branchRef);
      const failureEvent = failureByBranchRef.get(leaseEvent.branchRef);
      return constructBranchLeaseReleasedEvent({
        basis: input.basis,
        frontierRef: input.frontierRef,
        branchRef: leaseEvent.branchRef,
        branchAttemptRef: leaseEvent.branchAttemptRef,
        leaseRef: leaseEvent.leaseRef,
        releasedAtMs: input.releasedAtMs + index,
        causationEventRefs:
          payloadEvent === undefined
            ? failureEvent === undefined
              ? [leaseEvent.leaseRef]
              : [leaseEvent.leaseRef, failureEvent.failureRef]
            : [leaseEvent.leaseRef, payloadEvent.idempotencyKey],
        correlationId: input.correlationId
      });
    })
  );
}

function dispositionForFailure(input: {
  readonly policy: BranchExecutionPolicy;
  readonly failure: NativeBranchTaskFailure;
}) {
  if (
    !input.policy.retryableFailureClasses.some(
      (failureClass) => failureClass === input.failure.failureClass
    )
  ) {
    return "block";
  }
  if (input.policy.maxRetryAttempts === 0) {
    return input.policy.retryBudgetExhaustedDisposition;
  }
  return "reenter";
}

function taskFailureEventsForBatch(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly policy: BranchExecutionPolicy;
  readonly leaseEvents: readonly BranchLeaseAcquiredEvent[];
  readonly taskFailures: readonly NativeBranchTaskFailure[];
  readonly correlationId: string;
}): readonly BranchTaskFailedEvent[] {
  const leaseByBranchRef = new Map(
    input.leaseEvents.map((event) => [event.branchRef, event])
  );
  return Object.freeze(
    input.taskFailures.map((failure) => {
      const lease = leaseByBranchRef.get(failure.branchRef);
      if (lease === undefined) {
        throw new TypeError(
          `Native saga frontier event runner cannot admit failure for ${JSON.stringify(failure.branchRef)}`
        );
      }
      return constructBranchTaskFailedEvent({
        basis: input.basis,
        frontierRef: input.frontierRef,
        branchRef: lease.branchRef,
        branchAttemptRef: lease.branchAttemptRef,
        leaseRef: lease.leaseRef,
        failureClass: failure.failureClass,
        failureDigest: failure.failureDigest,
        disposition: dispositionForFailure({
          policy: input.policy,
          failure
        }),
        preserveEvidence: input.policy.preserveEvidenceOnCancellation,
        evidenceRefs: failure.evidenceRefs,
        causationEventRefs: [lease.leaseRef],
        correlationId: input.correlationId
      });
    })
  );
}

function fanInEventForBatch(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly batchOrdinal: number;
  readonly payloadEvents: readonly BranchPayloadAdmittedEvent[];
  readonly taskResults: readonly NativeBranchTaskResult[];
  readonly selection: BranchSelectionProjection;
  readonly correlationId: string;
}): BranchFanInProjectedEvent {
  const payloadByBranchRef = new Map(
    input.payloadEvents.map((event) => [event.branchRef, event])
  );
  const fanIn = deriveBranchFanInProjection({
    fanInRef: `${input.frontierRef}:fan-in:${input.batchOrdinal}`,
    rows: input.taskResults.map((result) => {
      const payloadEvent = payloadByBranchRef.get(result.branchRef);
      return constructBranchFanInInputRow({
        branchRef: result.branchRef,
        payloadDigest: result.payloadDigest,
        evidenceRefs: result.evidenceRefs,
        declaredOrder:
          payloadEvent === undefined
            ? null
            : input.selection.selectedBranchRefs.indexOf(payloadEvent.branchRef)
      });
    }),
    declaredOrderBranchRefs: input.selection.selectedBranchRefs
  });
  return constructBranchFanInProjectedEvent({
    basis: input.basis,
    frontierRef: input.frontierRef,
    fanIn,
    causationEventRefs: input.payloadEvents.map((event) => event.idempotencyKey),
    correlationId: input.correlationId
  });
}

async function runEventedNativeSagaFrontierBatches(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly declarations: readonly DependencyFrontierDeclaration[];
  readonly policy: BranchExecutionPolicy;
  readonly staleObservedStateRefs?: readonly string[] | undefined;
  readonly admittedIdempotencyKeys?: readonly string[] | undefined;
  readonly activeLeaseBranchRefs?: readonly string[] | undefined;
  readonly maxBatches: number;
  readonly tasksByBranchRef: ReadonlyMap<string, NativeBranchTask>;
  readonly declarationsByBranchRef: ReadonlyMap<string, DependencyFrontierDeclaration>;
  readonly eventSink: RuntimeEventSink;
  readonly correlationId: string;
  readonly leaseStartMs: number;
  readonly releaseStartMs: number;
  readonly leaseTtlMs: number | null;
  readonly state: EventedNativeSagaFrontierRunState;
}): Promise<EventedNativeSagaFrontierRunResult> {
  if (input.state.batchOrdinal >= input.maxBatches) {
    return eventedRunResult({
      frontierRef: input.frontierRef,
      policy: input.policy,
      state: input.state,
      deferredBranchRefs: Object.freeze([])
    });
  }
  const frontier = deriveDependencyFrontierProjection({
    frontierRef: input.frontierRef,
    declarations: input.declarations,
    closedBranchRefs: input.state.completedBranchRefs,
    staleObservedStateRefs: input.staleObservedStateRefs,
    admittedIdempotencyKeys: input.admittedIdempotencyKeys,
    activeLeaseBranchRefs: input.activeLeaseBranchRefs
  });
  const selection = selectDisjointReadyBranches({
    selectionRef: `${input.frontierRef}:selection:${input.state.batchOrdinal}`,
    frontier,
    policy: input.policy
  });
  if (selection.selectedBranchRefs.length === 0) {
    return eventedRunResult({
      frontierRef: input.frontierRef,
      policy: input.policy,
      state: input.state,
      deferredBranchRefs: selection.deferredReadyBranchRefs
    });
  }
  const leaseAcquiredEvents = batchLeaseEvents({
    basis: input.basis,
    frontierRef: input.frontierRef,
    selection,
    declarationsByBranchRef: input.declarationsByBranchRef,
    attemptOrdinal: 0,
    leasedAtMs: input.leaseStartMs + input.state.batchOrdinal * 1_000,
    leaseTtlMs: input.leaseTtlMs,
    correlationId: input.correlationId
  });
  const emittedLeaseEvents = emit(leaseAcquiredEvents, input.eventSink);
  const settlements = await runSelectedTasksSettled({
    selection,
    tasksByBranchRef: input.tasksByBranchRef
  });
  const taskResults = Object.freeze(
    settlements
      .filter((settlement) => settlement.status === "fulfilled")
      .map((settlement) => settlement.result)
  );
  const taskFailures = Object.freeze(
    settlements
      .filter((settlement) => settlement.status === "rejected")
      .map((settlement) => settlement.failure)
  );
  const payloadAdmittedEvents = payloadEventsForBatch({
    basis: input.basis,
    frontierRef: input.frontierRef,
    declarationsByBranchRef: input.declarationsByBranchRef,
    leaseEvents: leaseAcquiredEvents,
    taskResults,
    correlationId: input.correlationId
  });
  const taskFailureEvents = taskFailureEventsForBatch({
    basis: input.basis,
    frontierRef: input.frontierRef,
    policy: input.policy,
    leaseEvents: leaseAcquiredEvents,
    taskFailures,
    correlationId: input.correlationId
  });
  const leaseReleasedEvents = releaseEventsForBatch({
    basis: input.basis,
    frontierRef: input.frontierRef,
    leaseEvents: leaseAcquiredEvents,
    payloadEvents: payloadAdmittedEvents,
    taskFailureEvents,
    releasedAtMs: input.releaseStartMs + input.state.batchOrdinal * 1_000,
    correlationId: input.correlationId
  });
  const fanInProjectedEvent =
    taskResults.length === 0
      ? null
      : fanInEventForBatch({
          basis: input.basis,
          frontierRef: input.frontierRef,
          batchOrdinal: input.state.batchOrdinal,
          payloadEvents: payloadAdmittedEvents,
          taskResults,
          selection,
          correlationId: input.correlationId
        });
  const afterTaskEvents = emit(
    [
      ...payloadAdmittedEvents,
      ...taskFailureEvents,
      ...leaseReleasedEvents,
      ...(fanInProjectedEvent === null ? Object.freeze([]) : [fanInProjectedEvent])
    ],
    input.eventSink
  );
  const batch = Object.freeze({
    kind: "evented_native_saga_frontier_batch_result",
    batchOrdinal: input.state.batchOrdinal,
    selection,
    leaseAcquiredEvents,
    taskResults,
    taskFailureEvents,
    payloadAdmittedEvents,
    leaseReleasedEvents,
    fanInProjectedEvent,
    emittedEvents: Object.freeze([
      ...emittedLeaseEvents,
      ...afterTaskEvents
    ])
  } satisfies EventedNativeSagaFrontierBatchResult);
  if (taskFailures.length > 0) {
    return eventedRunResult({
      frontierRef: input.frontierRef,
      policy: input.policy,
      state: appendEventedBatchState({
        state: input.state,
        batch
      }),
      deferredBranchRefs: Object.freeze([])
    });
  }
  return runEventedNativeSagaFrontierBatches({
    ...input,
    state: appendEventedBatchState({
      state: input.state,
      batch
    })
  });
}

export async function runEventedNativeSagaFrontier(input: {
  readonly basis: ExecutionBasis;
  readonly frontierRef: string;
  readonly declarations: readonly DependencyFrontierDeclaration[];
  readonly policy: BranchExecutionPolicy;
  readonly tasks: readonly NativeBranchTask[];
  readonly eventSink: RuntimeEventSink;
  readonly initialClosedBranchRefs?: readonly string[] | undefined;
  readonly staleObservedStateRefs?: readonly string[] | undefined;
  readonly admittedIdempotencyKeys?: readonly string[] | undefined;
  readonly activeLeaseBranchRefs?: readonly string[] | undefined;
  readonly maxBatches?: number | undefined;
  readonly correlationId?: string | undefined;
  readonly leaseStartMs?: number | undefined;
  readonly releaseStartMs?: number | undefined;
  readonly leaseTtlMs?: number | null | undefined;
}): Promise<EventedNativeSagaFrontierRunResult> {
  const tasksByBranchRef = taskMap(input.tasks);
  const declarationsByBranchRef = declarationMap(input.declarations);
  const maxBatches = input.maxBatches ?? input.declarations.length;
  return runEventedNativeSagaFrontierBatches({
    basis: input.basis,
    frontierRef: input.frontierRef,
    declarations: input.declarations,
    policy: input.policy,
    staleObservedStateRefs: input.staleObservedStateRefs,
    admittedIdempotencyKeys: input.admittedIdempotencyKeys,
    activeLeaseBranchRefs: input.activeLeaseBranchRefs,
    maxBatches,
    tasksByBranchRef,
    declarationsByBranchRef,
    eventSink: input.eventSink,
    correlationId: input.correlationId ?? `${input.frontierRef}:correlation`,
    leaseStartMs: input.leaseStartMs ?? 0,
    releaseStartMs: input.releaseStartMs ?? 500,
    leaseTtlMs:
      input.leaseTtlMs === undefined ? input.policy.leaseTtlMs : input.leaseTtlMs,
    state: Object.freeze({
      batchOrdinal: 0,
      completedBranchRefs: freezeUniqueSortedStrings(
        input.initialClosedBranchRefs ?? Object.freeze([])
      ),
      failedBranchRefs: Object.freeze([]),
      batches: Object.freeze([]),
      results: Object.freeze([]),
      emittedEvents: Object.freeze([]),
      replayEvents: Object.freeze([])
    })
  });
}
