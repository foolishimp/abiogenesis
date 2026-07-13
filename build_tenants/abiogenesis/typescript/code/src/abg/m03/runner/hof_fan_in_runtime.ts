// Implements: T-260; REQ-L-GTL3-HOF-011/-012. Fan-in is a separately
// selected traversal over one complete admitted vector, never an array fold.

import type {
  CCallJudgment,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  detachRowSnapshot,
  isPlainRecord
} from "../contracts/admission_hygiene.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import {
  admitHofVectorCarrier,
  type HofVectorCarrier
} from "../contracts/c_batch.js";
import {
  compileFanInReductionBinding,
  type CompiledFanInReductionBinding,
  type ExecutionHandoffCarrier
} from "../contracts/hof_batch.js";
import type {
  CompiledFanInApplicationRelation
} from "../contracts/graph_function_application_compiler.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  buildCCallSpineClose,
  buildCCallSpineOpen
} from "./c_call_spine.js";
import {
  resolveSelectedCatalogExecutionBinding
} from "./selected_catalog_execution.js";

export type HofFanInDisposition = "completed" | "blocked" | "held";

export interface HofFanInTraversalRequest {
  readonly kind: "hof_fan_in_traversal_request";
  readonly invocationRef: string;
  readonly bindingRef: string;
  readonly cCallRef: string;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly reducerGraphFunctionRef: string;
  readonly reducerGraphFunctionDigest: `sha256:${string}`;
  readonly inputVector: HofVectorCarrier;
  readonly selectedInputVectorBasisRef: string;
  readonly applicationLineageRef: string;
  readonly outputNodeRef: string;
  readonly outputContractKey: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
}

export interface HofFanInTraversalOutcome {
  readonly kind: "hof_fan_in_traversal_outcome";
  readonly invocationRef: string;
  readonly bindingRef: string;
  readonly cCallRef: string;
  readonly reducerGraphFunctionRef: string;
  readonly reducerBasisId: string;
  readonly reducerRunRef: string;
  readonly reducerGraphCallId: string;
  readonly reducerFrameId: string;
  readonly terminalRef: string;
  readonly disposition: HofFanInDisposition;
  readonly outputContractKey: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface HofFanInInvocation {
  readonly kind: "hof_fan_in_invocation";
  readonly binding: CompiledFanInReductionBinding;
  readonly relation: CompiledFanInApplicationRelation;
  readonly executionHandoff: ExecutionHandoffCarrier;
  readonly inputVector: HofVectorCarrier;
  readonly selectedInputVectorBasisRef: string;
  readonly applicationLineageRef: string;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly parentBasisId: string;
  readonly parentGraphFunctionRef: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly attempt: number;
  readonly emit: (events: readonly RuntimeEvent[]) => void;
  readonly invokeReducer: (
    request: HofFanInTraversalRequest
  ) => Promise<HofFanInTraversalOutcome>;
}

interface HofFanInResolutionBasis {
  readonly kind: "hof_fan_in_resolution";
  readonly invocationRef: string;
  readonly bindingRef: string;
  readonly cCallRef: string;
  readonly outputNodeRef: string;
  readonly outputContractKey: string;
  readonly inputVectorRef: string;
  readonly inputVectorDigest: `sha256:${string}`;
  readonly inputVectorBasisRef: string;
  readonly applicationLineageRef: string;
  readonly outcome: HofFanInTraversalOutcome | null;
  readonly emittedEvents: readonly RuntimeEvent[];
}

export interface HofFanInCompletedResolution extends HofFanInResolutionBasis {
  readonly status: "completed";
  readonly judgment: "advance";
  readonly outputPayloadRef: string;
  readonly responseContractRef: string;
  readonly reasonRef: null;
}

export interface HofFanInStoppedResolution extends HofFanInResolutionBasis {
  readonly status: "blocked" | "pending" | "runtime_failed";
  readonly judgment: "blocked" | "pending";
  readonly outputPayloadRef: null;
  readonly responseContractRef: null;
  readonly reasonRef: string;
}

export type HofFanInResolution =
  | HofFanInCompletedResolution
  | HofFanInStoppedResolution;

const OUTCOME_KEYS = Object.freeze([
  "kind",
  "invocationRef",
  "bindingRef",
  "cCallRef",
  "reducerGraphFunctionRef",
  "reducerBasisId",
  "reducerRunRef",
  "reducerGraphCallId",
  "reducerFrameId",
  "terminalRef",
  "disposition",
  "outputContractKey",
  "outputPayloadRef",
  "responseContractRef",
  "reasonRef",
  "evidenceRefs"
]);

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function nullable(value: unknown, label: string): string | null {
  return value === null ? null : nonEmpty(value, label);
}

function outcomeDisposition(value: unknown): HofFanInDisposition {
  if (value === "completed" || value === "blocked" || value === "held") {
    return value;
  }
  throw new TypeError("HOF fan-in outcome disposition is invalid");
}

function admitOutcome(input: {
  readonly request: HofFanInTraversalRequest;
  readonly raw: unknown;
}): HofFanInTraversalOutcome {
  const row = detachRowSnapshot(input.raw);
  if (!isPlainRecord(row)) {
    throw new TypeError("HOF fan-in outcome must be detached plain data");
  }
  if (!stableJsonEquals(Object.keys(row).sort(), [...OUTCOME_KEYS].sort())) {
    throw new TypeError("HOF fan-in outcome has a non-canonical key set");
  }
  if (row["kind"] !== "hof_fan_in_traversal_outcome") {
    throw new TypeError("HOF fan-in outcome kind is invalid");
  }
  const refsRaw = row["evidenceRefs"];
  if (!Array.isArray(refsRaw) || refsRaw.length === 0) {
    throw new TypeError("HOF fan-in outcome requires non-empty evidence refs");
  }
  const refs = Object.freeze(
    refsRaw.map((entry: unknown) => nonEmpty(entry, "evidenceRefs[]"))
  );
  const outcome: HofFanInTraversalOutcome = Object.freeze({
    kind: "hof_fan_in_traversal_outcome" as const,
    invocationRef: nonEmpty(row["invocationRef"], "invocationRef"),
    bindingRef: nonEmpty(row["bindingRef"], "bindingRef"),
    cCallRef: nonEmpty(row["cCallRef"], "cCallRef"),
    reducerGraphFunctionRef: nonEmpty(
      row["reducerGraphFunctionRef"],
      "reducerGraphFunctionRef"
    ),
    reducerBasisId: nonEmpty(row["reducerBasisId"], "reducerBasisId"),
    reducerRunRef: nonEmpty(row["reducerRunRef"], "reducerRunRef"),
    reducerGraphCallId: nonEmpty(
      row["reducerGraphCallId"],
      "reducerGraphCallId"
    ),
    reducerFrameId: nonEmpty(row["reducerFrameId"], "reducerFrameId"),
    terminalRef: nonEmpty(row["terminalRef"], "terminalRef"),
    disposition: outcomeDisposition(row["disposition"]),
    outputContractKey: nonEmpty(row["outputContractKey"], "outputContractKey"),
    outputPayloadRef: nullable(row["outputPayloadRef"], "outputPayloadRef"),
    responseContractRef: nullable(
      row["responseContractRef"],
      "responseContractRef"
    ),
    reasonRef: nullable(row["reasonRef"], "reasonRef"),
    evidenceRefs: refs
  });
  const request = input.request;
  if (
    outcome.invocationRef !== request.invocationRef ||
    outcome.bindingRef !== request.bindingRef ||
    outcome.cCallRef !== request.cCallRef ||
    outcome.reducerGraphFunctionRef !== request.reducerGraphFunctionRef ||
    outcome.outputContractKey !== request.outputContractKey ||
    outcome.reducerGraphCallId === request.parentGraphCallId ||
    outcome.reducerFrameId === request.parentFrameId
  ) {
    throw new TypeError("HOF fan-in outcome identity or contract differs");
  }
  if (outcome.disposition === "completed") {
    if (
      outcome.outputPayloadRef === null ||
      outcome.responseContractRef !== request.outputContractKey ||
      outcome.reasonRef !== null
    ) {
      throw new TypeError("completed HOF fan-in outcome is not exact");
    }
  } else if (
    outcome.outputPayloadRef !== null ||
    outcome.responseContractRef !== null ||
    outcome.reasonRef === null
  ) {
    throw new TypeError("stopped HOF fan-in outcome carries invalid result truth");
  }
  return outcome;
}

function validateInvocation(input: HofFanInInvocation): {
  readonly selected: CatalogExecutionBinding;
  readonly vector: HofVectorCarrier;
} {
  if (input.kind !== "hof_fan_in_invocation") {
    throw new TypeError("HOF fan-in invocation kind is invalid");
  }
  const vector = admitHofVectorCarrier(input.inputVector);
  nonEmpty(input.applicationLineageRef, "applicationLineageRef");
  nonEmpty(input.selectedInputVectorBasisRef, "selectedInputVectorBasisRef");
  nonEmpty(input.parentBasisId, "parentBasisId");
  nonEmpty(input.parentGraphCallId, "parentGraphCallId");
  nonEmpty(input.parentFrameId, "parentFrameId");
  nonEmpty(input.edge, "edge");
  if (
    input.parentGraphFunctionRef !==
      input.binding.executionSubjectGraphFunctionRef ||
    input.applicationLineageRef !== input.binding.applicationLineageRef ||
    input.selectedInputVectorBasisRef !== vector.basisRef ||
    vector.vectorNodeRef !== input.binding.inputVectorNodeRef ||
    vector.vectorContractKey !== input.binding.inputVectorContractKey ||
    !Number.isInteger(input.vectorIndex) ||
    input.vectorIndex < 0 ||
    !Number.isInteger(input.attempt) ||
    input.attempt < 1
  ) {
    throw new TypeError("HOF fan-in invocation basis is invalid");
  }
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    label: "HOF fan-in"
  });
  if (
    selected.graphFunction.id !== input.binding.executionSubjectGraphFunctionRef ||
    selected.moduleName !== input.binding.moduleName ||
    selected.moduleDigest !== input.binding.moduleDigest
  ) {
    throw new TypeError("HOF fan-in selected catalog authority differs");
  }
  const rederived = compileFanInReductionBinding({
    module: selected.module,
    relation: input.relation,
    executionHandoff: input.executionHandoff
  });
  if (!stableJsonEquals(rederived, input.binding)) {
    throw new TypeError("HOF fan-in binding no longer rederives exactly");
  }
  return Object.freeze({ selected, vector });
}

function runtimeFailureReason(input: {
  readonly invocationRef: string;
  readonly error: unknown;
}): string {
  return `abg://hof/fan-in/runtime-failure/${stableSha256Digest({
    invocationRef: input.invocationRef,
    message: input.error instanceof Error ? input.error.message : String(input.error)
  }).slice("sha256:".length)}`;
}

export async function resolveHofFanIn(
  input: HofFanInInvocation
): Promise<HofFanInResolution> {
  const { selected, vector } = validateInvocation(input);
  const spine = buildCCallSpineOpen({
    basisId: input.parentBasisId,
    graphFunctionId: input.parentGraphFunctionRef,
    graphCallId: input.parentGraphCallId,
    frameId: input.parentFrameId,
    edge: input.edge,
    vectorIndex: input.vectorIndex,
    stageRole: input.binding.stageRole,
    taskOrdinal: null,
    attempt: input.attempt,
    batchRef: null,
    regime: input.binding.regime,
    armId: input.binding.armId,
    programRef: input.binding.reducerProgramRef,
    compositionRef: input.binding.compositionRef
  });
  const invocationRef =
    `abg://hof/fan-in/invocation/${stableSha256Digest({
      bindingRef: input.binding.bindingRef,
      selectedCatalogEntryRef: selected.entryRef,
      vectorDigest: vector.vectorDigest,
      applicationLineageRef: input.applicationLineageRef,
      cCallRef: spine.cCallRef
    }).slice("sha256:".length)}`;
  const request: HofFanInTraversalRequest = Object.freeze({
    kind: "hof_fan_in_traversal_request" as const,
    invocationRef,
    bindingRef: input.binding.bindingRef,
    cCallRef: spine.cCallRef,
    selectedCatalogEntryRef: selected.entryRef,
    moduleName: selected.moduleName,
    moduleDigest: input.binding.moduleDigest,
    reducerGraphFunctionRef: input.binding.reducerGraphFunctionRef,
    reducerGraphFunctionDigest: input.binding.reducerGraphFunctionDigest,
    inputVector: vector,
    selectedInputVectorBasisRef: input.selectedInputVectorBasisRef,
    applicationLineageRef: input.applicationLineageRef,
    outputNodeRef: input.binding.outputNodeRef,
    outputContractKey: input.binding.outputContractKey,
    parentBasisId: input.parentBasisId,
    parentGraphCallId: input.parentGraphCallId,
    parentFrameId: input.parentFrameId
  });
  const emittedEvents: RuntimeEvent[] = [...spine.events];
  input.emit(spine.events);

  let outcome: HofFanInTraversalOutcome;
  try {
    outcome = admitOutcome({ request, raw: await input.invokeReducer(request) });
  } catch (error: unknown) {
    const reasonRef = runtimeFailureReason({ invocationRef, error });
    const tail = buildCCallSpineClose({
      cCallRef: spine.cCallRef,
      basisId: input.parentBasisId,
      evidenceClass: "fibre_failure",
      evidenceRefs: Object.freeze([reasonRef]),
      outcomeStatus: "runtime_failed",
      payloadRef: null,
      responseContractRef: null,
      judgment: "blocked",
      reasonRef
    });
    emittedEvents.push(...tail);
    input.emit(tail);
    return Object.freeze({
      kind: "hof_fan_in_resolution" as const,
      status: "runtime_failed" as const,
      judgment: "blocked" as const,
      invocationRef,
      bindingRef: input.binding.bindingRef,
      cCallRef: spine.cCallRef,
      outputNodeRef: input.binding.outputNodeRef,
      outputContractKey: input.binding.outputContractKey,
      inputVectorRef: vector.vectorRef,
      inputVectorDigest: vector.vectorDigest,
      inputVectorBasisRef: vector.basisRef,
      applicationLineageRef: input.applicationLineageRef,
      outputPayloadRef: null,
      responseContractRef: null,
      reasonRef,
      outcome: null,
      emittedEvents: Object.freeze([...emittedEvents])
    });
  }

  const judgment: CCallJudgment = outcome.disposition === "completed"
    ? "advance"
    : outcome.disposition === "held"
      ? "pending"
      : "blocked";
  const tail = buildCCallSpineClose({
    cCallRef: spine.cCallRef,
    basisId: input.parentBasisId,
    evidenceClass: "sub_traversal",
    evidenceRefs: Object.freeze([
      `input-vector:${vector.vectorRef}`,
      `input-vector-basis:${vector.basisRef}`,
      `application-lineage:${input.applicationLineageRef}`,
      `reducer-basis:${outcome.reducerBasisId}`,
      `reducer-run:${outcome.reducerRunRef}`,
      `reducer-graph-call:${outcome.reducerGraphCallId}`,
      `reducer-frame:${outcome.reducerFrameId}`,
      `terminal:${outcome.terminalRef}`,
      ...outcome.evidenceRefs
    ]),
    outcomeStatus: outcome.disposition,
    payloadRef: outcome.outputPayloadRef,
    responseContractRef: outcome.responseContractRef,
    judgment,
    reasonRef: outcome.reasonRef
  });
  emittedEvents.push(...tail);
  input.emit(tail);
  const basis = {
    kind: "hof_fan_in_resolution" as const,
    invocationRef,
    bindingRef: input.binding.bindingRef,
    cCallRef: spine.cCallRef,
    outputNodeRef: input.binding.outputNodeRef,
    outputContractKey: input.binding.outputContractKey,
    inputVectorRef: vector.vectorRef,
    inputVectorDigest: vector.vectorDigest,
    inputVectorBasisRef: vector.basisRef,
    applicationLineageRef: input.applicationLineageRef,
    outcome,
    emittedEvents: Object.freeze([...emittedEvents])
  };
  if (outcome.disposition === "completed") {
    return Object.freeze({
      ...basis,
      status: "completed" as const,
      judgment: "advance" as const,
      outputPayloadRef: outcome.outputPayloadRef!,
      responseContractRef: outcome.responseContractRef!,
      reasonRef: null
    });
  }
  return Object.freeze({
    ...basis,
    status: outcome.disposition === "held" ? "pending" as const : "blocked" as const,
    judgment: outcome.disposition === "held" ? "pending" as const : "blocked" as const,
    outputPayloadRef: null,
    responseContractRef: null,
    reasonRef: outcome.reasonRef!
  });
}
