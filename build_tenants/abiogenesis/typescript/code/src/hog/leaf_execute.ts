import {
  admitRuntimeFailure,
  openCCall,
  replay,
} from "../abg/index.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtRuntimeEventPrefix,
} from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import { admitLeafOutcome } from "./leaf_admission.js";
import { invokeLeafOwner } from "./leaf_owner.js";
import { completeAdmittedLeaf } from "./leaf_route.js";
import {
  basis,
  completion,
  type CompleteExecutableTraversalInput,
  type CompleteExecutableTraversalResult,
  type ExecutableTraversalCompletion,
} from "./execute.js";

function fail(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "c_call_open",
    candidate,
    diagnosticRef,
    basis(input.clock, stage),
  );
  return completion("failed", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), { diagnosticRef });
}

function consequenceComplete(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  staged: ExecutableTraversalCompletion,
): boolean {
  const current = replay(input.store, { runId: input.openedTraversalScope.runId });
  const call = staged.cCallRef === null
    ? undefined
    : current.cCalls.find((row) => row.cCallRef === staged.cCallRef);
  const route = staged.cCallRef === null || staged.judgmentRef === null
    ? undefined
    : current.routes.find((row) =>
        row.cCallRef === staged.cCallRef && row.judgmentRef === staged.judgmentRef
      );
  const judged = call?.status === "judged" &&
    call.resultRef === staged.resultRef && call.judgmentRef === staged.judgmentRef;
  switch (staged.disposition) {
    case "application_ready":
      return judged && route === undefined;
    case "advanced":
      return judged && route?.routeKind === "advance";
    case "closed":
      return judged && route?.routeKind === "terminal" && staged.closureRef !== null &&
        (input.terminalMode === "return_to_parent" || current.runClosedEventRef !== null);
    case "blocked":
      return judged && route?.routeKind === "blocked" &&
        (input.terminalMode === "return_to_parent" || current.runStoppedEventRef !== null);
    case "failed":
      return judged && route?.routeKind === "failed" &&
        (input.deferFailedRunStop === true || current.runStoppedEventRef !== null);
    case "gap_stop":
      return judged && route?.routeKind === "gap_stop" && current.runStoppedEventRef !== null;
    default:
      return false;
  }
}

export async function executeLeafAtLocus(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
): Promise<CompleteExecutableTraversalResult> {
  if (!isAdmittedLeafInvocationPort(input.leafPort) ||
      input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
      input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest ||
      input.leafPort.publicationDigest !== input.implementationSet.publicationDigest) {
    return fail(
      input,
      "leaf-port-refusal",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  const failureValueKind = input.leafPort.contractValueKind(
    input.traversalStop.failureContractRef,
    "failure",
  );
  const resultValueKind = input.leafPort.contractValueKind(
    input.traversalStop.outputContractRef,
    "output",
  );
  const relation = input.leafPort.resolveJudgmentRelation(
    input.traversalStop.judgmentPredicateRef,
  );
  if (failureValueKind === null || resultValueKind === null || relation === null) {
    return fail(
      input,
      "leaf-contract-refusal",
      "diagnostic://abiogenesis/implementation/result-contract-absent@5",
      {
        failureContractRef: input.traversalStop.failureContractRef,
        outputContractRef: input.traversalStop.outputContractRef,
      },
    );
  }
  if (sha256Canonical(input.input) !== input.inputDigest ||
      input.inputDigest !== input.traversalStop.cursor.inputDigest) {
    return fail(
      input,
      "input-basis-refusal",
      "diagnostic://abiogenesis/hog/input-basis-mismatch@5",
      { suppliedInputDigest: input.inputDigest },
    );
  }
  const opened = openCCall(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    input.program,
    input.graphFunction,
    input.graph,
    input.traversalStop,
    input.implementationSet,
    input.implementationResolution,
    basis(input.clock, "c-call-open"),
  );
  if (opened.kind !== "c_call_admission") {
    return fail(
      input,
      "c-call-open-refusal",
      `diagnostic://abiogenesis/hog/${opened.code}@5`,
      opened as unknown as JsonValue,
    );
  }
  const invocation = await invokeLeafOwner({
    ...input,
    cCall: opened.cCall,
    failureValueKind,
    validateSuccessCandidate: (value): value is Readonly<Record<string, JsonValue>> =>
      input.leafPort.validateContractValue(
        input.traversalStop.outputContractRef,
        "output",
        value,
      ),
  });
  const prefix = selectValidatedRuntimeEventPrefix(input.store.readAll());
  if (input.store.configuredDurableLogPath() !== null) {
    assertHeldEventStoreAtRuntimeEventPrefix(input.store, prefix.events);
  }
  const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
    input.store,
    sha256Canonical(prefix.events as unknown as JsonValue),
    () => {
      const admitted = admitLeafOutcome(
        input,
        opened.cCall,
        invocation,
        failureValueKind,
        resultValueKind,
      );
      if (admitted.kind === "staged_retry_runtime_failure_transition") return admitted;
      const staged = admitted.kind === "admitted_leaf_outcome"
        ? completeAdmittedLeaf(input, admitted, invocation.candidate)
        : admitted;
      if (!consequenceComplete(input, staged)) {
        throw new TypeError("executable transition consequence is incomplete");
      }
      return staged;
    },
  );
  if (transaction.value.kind !== "staged_retry_runtime_failure_transition") {
    return transaction.value;
  }
  const transition = transaction.value.transition;
  const progress = transition.progress;
  if (transaction.successorPrefix === null ||
      transition.disposition !== "retry" ||
      progress.progressClass !== "retry" ||
      transition.stoppedProgresses.length !== 0) {
    throw new TypeError("retry transition produced no exact successor prefix");
  }
  return deepFreeze({
    kind: transition.kind,
    schemaVersion: transition.schemaVersion,
    disposition: "retry" as const,
    close: transition.close,
    progress,
    stoppedProgresses: Object.freeze([]) as readonly [],
    eligibility: transition.eligibility,
    successorPrefix: transaction.successorPrefix,
  });
}
