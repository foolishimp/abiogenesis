import {
  projectRuntimeTruthAtDurablePrefix,
  type ExecutionBasis,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { GraphValidation } from "../validator/graph.js";
import type {
  CCallLocusCandidate,
} from "../abg/c_call.js";
import type { TraversalCursor, TraverseInput } from "./traversal.js";

export interface ExecutionClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export function sameCanonical(left: unknown, right: unknown): boolean {
  try {
    return sha256Canonical(left as JsonValue) ===
      sha256Canonical(right as JsonValue);
  } catch {
    return false;
  }
}

export function canonicalDigest(
  value: unknown,
): `sha256:${string}` | null {
  try {
    return sha256Canonical(value as JsonValue);
  } catch {
    return null;
  }
}

export function runtimePrefixAtDurable(
  prefix: DurablePrefixCoordinate,
  runId: string,
) {
  return projectRuntimeTruthAtDurablePrefix(prefix, runId).runtimePrefix;
}

export function replayAtDurable(
  prefix: DurablePrefixCoordinate,
  runId: string,
): ReplayState {
  return projectRuntimeTruthAtDurablePrefix(prefix, runId).replayState;
}

export function admissionBasis(
  clock: ExecutionClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

export function isExactLocusStep(
  stop: CCallLocusCandidate | TraversalCursor,
  term: Readonly<CProgramNode>,
): boolean {
  if (stop.kind === "traversal_cursor") return term.kind === "c_workflow";
  if (
    term.kind !== "c_of" ||
    term.fibre !== stop.computeRegime ||
    term.programLocusRef !== stop.programLocusRef ||
    term.armId !== stop.armId ||
    term.compositionRef !== stop.compositionRef
  ) return false;
  if (stop.stopClass === "executable") {
    return term.requirement.kind === "executable_leaf_requirement" &&
      term.inputCarrierRef === stop.inputContractRef &&
      term.outputCarrierRef === stop.outputContractRef &&
      term.requirement.implementationBindingRef ===
        stop.implementationBindingRef &&
      term.requirement.inputContractRef === stop.inputContractRef &&
      term.requirement.outputContractRef === stop.outputContractRef &&
      term.requirement.evidenceContractRef === stop.evidenceContractRef &&
      term.requirement.failureContractRef === stop.failureContractRef &&
      term.requirement.refusalContractRef === stop.refusalContractRef &&
      term.requirement.judgmentContractRef === stop.judgmentContractRef;
  }
  return term.requirement.kind === "interaction_leaf_requirement" &&
    term.inputCarrierRef === stop.requestContractRef &&
    term.requirement.interactionKind === stop.interactionKind &&
    term.requirement.actorCapabilityRef === stop.actorCapabilityRef &&
    term.requirement.requestContractRef === stop.requestContractRef &&
    term.requirement.responseContractRef === stop.responseContractRef &&
    term.requirement.continuationContractRef ===
      stop.continuationContractRef;
}

export function materializedInputAtCursor(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor | null,
): Readonly<{
  inputContractRef: string;
  value: Readonly<Record<string, JsonValue>>;
}> | null {
  if (cursor === null) return null;
  for (const materialization of graph.fanOutMaterializations) {
    const member = materialization.members.find(
      (candidate) =>
        candidate.ordinal === cursor.taskOrdinal &&
        candidate.memberRef === cursor.inputRef &&
        candidate.memberDigest === cursor.inputDigest,
    );
    if (member !== undefined) {
      return {
        inputContractRef: materialization.inputMemberContractRef,
        value: member.value,
      };
    }
  }
  return null;
}

export function traversalBasis(input: Readonly<{
  program: TraverseInput["program"];
  graphFunction: TraverseInput["graphFunction"];
  graph: TraverseInput["graph"];
  graphValidation: GraphValidation;
  executionBasis: ExecutionBasis;
  openedTraversalScope: OpenedTraversalScope;
}>): TraverseInput {
  return {
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
  };
}
