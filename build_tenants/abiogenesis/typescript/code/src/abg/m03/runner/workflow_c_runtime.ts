// Implements: T-259; REQ-L-GTL3-C-ALGEBRA-006/-016;
// REQ-R-ABG3-CCALL-001/-004/-006/-008/-013. One direct workflow.C lift is
// one transparent parent C call around one ABG-owned child traversal.

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
  assertCompiledWorkflowLiftBinding,
  compileWorkflowLiftBinding,
  type CompiledWorkflowLiftBinding
} from "../contracts/workflow_c.js";
import {
  compileCAlgebraToHog
} from "../contracts/c_algebra_hog_compiler.js";
import {
  resolveAbgFnCompositionSelection
} from "../contracts/fn_composition.js";
import {
  compileGraphVectorCProgramSelection
} from "../contracts/graph_vector_c_program_compiler.js";
import { isHogWorkflowProgram } from "../contracts/hog_program.js";
import {
  admitCProgramSyntax
} from "../../../gtl/m01/algebra/c_algebra.js";
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

export type WorkflowChildTraversalDisposition =
  | "completed"
  | "blocked"
  | "held";

export interface WorkflowChildTraversalRequest {
  readonly kind: "workflow_child_traversal_request";
  readonly workflowInvocationRef: string;
  readonly workflowBindingRef: string;
  readonly parentCCallRef: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly childGraphFunctionRef: string;
  readonly childGraphFunctionDigest: `sha256:${string}`;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly lineageRef: string;
}

export interface WorkflowChildTraversalOutcome {
  readonly kind: "workflow_child_traversal_outcome";
  readonly workflowInvocationRef: string;
  readonly workflowBindingRef: string;
  readonly parentCCallRef: string;
  readonly childGraphFunctionRef: string;
  readonly childBasisId: string;
  readonly childRunRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly terminalRef: string;
  readonly disposition: WorkflowChildTraversalDisposition;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface WorkflowCInvocation {
  readonly kind: "workflow_c_invocation";
  readonly binding: CompiledWorkflowLiftBinding;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly parentBasisId: string;
  readonly parentGraphFunctionRef: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly attempt: number;
  readonly inputPayloadRef: string;
  readonly emit: (events: readonly RuntimeEvent[]) => void;
  readonly invokeChild: (
    request: WorkflowChildTraversalRequest
  ) => Promise<WorkflowChildTraversalOutcome>;
}

export type WorkflowCResolutionStatus =
  | "completed"
  | "blocked"
  | "pending"
  | "runtime_failed";

export interface WorkflowCResolution {
  readonly kind: "workflow_c_resolution";
  readonly status: WorkflowCResolutionStatus;
  readonly workflowInvocationRef: string;
  readonly workflowBindingRef: string;
  readonly cCallRef: string;
  readonly judgment: CCallJudgment;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly childOutcome: WorkflowChildTraversalOutcome | null;
  readonly emittedEvents: readonly RuntimeEvent[];
}

const WORKFLOW_CHILD_OUTCOME_KEYS = Object.freeze([
  "kind",
  "workflowInvocationRef",
  "workflowBindingRef",
  "parentCCallRef",
  "childGraphFunctionRef",
  "childBasisId",
  "childRunRef",
  "childGraphCallId",
  "childFrameId",
  "terminalRef",
  "disposition",
  "outputCarrierRef",
  "outputPayloadRef",
  "responseContractRef",
  "reasonRef",
  "evidenceRefs"
]);

function nonEmpty(value: string, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function selectedModuleAuthority(input: WorkflowCInvocation): CatalogExecutionBinding {
  const basis = input.catalogBasis;
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: basis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    label: "workflow.C"
  });
  if (
    selected.workspaceId !== basis.workspaceId ||
    selected.bindingId !== basis.bindingId ||
    selected.catalogId !== basis.catalogId ||
    selected.moduleName !== input.binding.moduleName ||
    selected.moduleDigest !== input.binding.moduleDigest ||
    selected.moduleDigest !== stableSha256Digest(selected.module)
  ) {
    throw new TypeError(
      "workflow.C selected catalog binding does not preserve the compiled Module authority"
    );
  }
  const parentMatches = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === input.binding.parentGraphFunctionRef
  );
  const childMatches = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === input.binding.childGraphFunctionRef
  );
  if (
    parentMatches.length !== 1 ||
    childMatches.length !== 1 ||
    stableSha256Digest(parentMatches[0]) !==
      input.binding.parentGraphFunctionDigest ||
    stableSha256Digest(childMatches[0]) !== input.binding.childGraphFunctionDigest
  ) {
    throw new TypeError(
      "workflow.C parent or child identity differs inside the selected Module"
    );
  }
  const parent = parentMatches[0]!;
  if (parent.template.kind !== "inline_graph") {
    throw new TypeError("workflow.C selected parent must contain an inline Graph");
  }
  const vectors = parent.template.graph.vectors.filter(
    (candidate) => candidate.id === input.binding.parentGraphVectorRef
  );
  const vector = vectors[0];
  if (vectors.length !== 1 || vector === undefined) {
    throw new TypeError(
      "workflow.C selected parent does not retain one exact bound GraphVector"
    );
  }
  const owners = selected.module.graphFunctions.filter(
    (candidate) =>
      candidate.id === input.binding.compositionOwnerGraphFunctionRef
  );
  const owner = owners[0];
  if (
    owners.length !== 1 ||
    owner === undefined ||
    stableSha256Digest(owner) !==
      input.binding.compositionOwnerGraphFunctionDigest ||
    owner.template.kind !== "inline_graph"
  ) {
    throw new TypeError(
      "workflow.C composition owner differs inside the selected Module"
    );
  }
  const ownerVectors = owner.template.graph.vectors.filter(
    (candidate) => candidate.id === vector.id
  );
  const ownerVector = ownerVectors[0];
  if (
    ownerVectors.length !== 1 ||
    ownerVector === undefined ||
    !stableJsonEquals(ownerVector, vector)
  ) {
    throw new TypeError(
      "workflow.C composition owner does not retain the exact parent GraphVector"
    );
  }
  const programSelection = compileGraphVectorCProgramSelection({
    graphFunction: parent,
    graphVector: vector
  });
  const selectedProgram = programSelection.selectedCandidates[0]?.candidate;
  if (
    programSelection.binding === null ||
    programSelection.selectedCandidates.length !== 1 ||
    selectedProgram === undefined
  ) {
    throw new TypeError(
      "workflow.C selected program no longer resolves exactly from the selected parent"
    );
  }
  const admittedProgram = admitCProgramSyntax(selectedProgram);
  if (!admittedProgram.accepted || admittedProgram.program === null) {
    throw new TypeError(
      "workflow.C selected program no longer admits from the selected parent"
    );
  }
  const lowered = compileCAlgebraToHog(admittedProgram.program);
  if (
    !lowered.accepted ||
    lowered.program === null ||
    !isHogWorkflowProgram(lowered.program)
  ) {
    throw new TypeError(
      "workflow.C selected program no longer lowers from the selected parent"
    );
  }
  const composition = resolveAbgFnCompositionSelection({
    vector: ownerVector,
    graphFunction: owner
  });
  const rederived = compileWorkflowLiftBinding({
    module: selected.module,
    parentGraphFunction: parent,
    compositionOwnerGraphFunction: owner,
    parentGraphVector: vector,
    programBinding: programSelection.binding,
    program: lowered.program,
    composition
  });
  if (!stableJsonEquals(rederived, input.binding)) {
    throw new TypeError(
      "workflow.C compiled binding differs from selected Module declaration truth"
    );
  }
  return selected;
}

function validateInvocation(input: WorkflowCInvocation): CatalogExecutionBinding {
  if (input.kind !== "workflow_c_invocation") {
    throw new TypeError("workflow.C invocation kind is invalid");
  }
  assertCompiledWorkflowLiftBinding(input.binding);
  nonEmpty(input.selectedCatalogEntryRef, "selectedCatalogEntryRef");
  nonEmpty(input.parentBasisId, "parentBasisId");
  nonEmpty(input.parentGraphCallId, "parentGraphCallId");
  nonEmpty(input.parentFrameId, "parentFrameId");
  nonEmpty(input.edge, "edge");
  nonEmpty(input.inputPayloadRef, "inputPayloadRef");
  if (
    input.parentGraphFunctionRef !== input.binding.parentGraphFunctionRef ||
    !Number.isInteger(input.vectorIndex) ||
    input.vectorIndex < 0 ||
    !Number.isInteger(input.attempt) ||
    input.attempt < 1
  ) {
    throw new TypeError("workflow.C invocation locus does not match its compiled binding");
  }
  return selectedModuleAuthority(input);
}

function validateChildOutcome(input: {
  readonly request: WorkflowChildTraversalRequest;
  readonly outcome: WorkflowChildTraversalOutcome;
}): void {
  const { request, outcome } = input;
  if (
    outcome.kind !== "workflow_child_traversal_outcome" ||
    outcome.workflowInvocationRef !== request.workflowInvocationRef ||
    outcome.workflowBindingRef !== request.workflowBindingRef ||
    outcome.parentCCallRef !== request.parentCCallRef ||
    outcome.childGraphFunctionRef !== request.childGraphFunctionRef ||
    outcome.outputCarrierRef !== request.outputCarrierRef
  ) {
    throw new TypeError("workflow.C child outcome identity or carrier pair differs");
  }
  if (
    outcome.responseContractRef !== null &&
    (typeof outcome.responseContractRef !== "string" ||
      outcome.responseContractRef.length === 0)
  ) {
    throw new TypeError(
      "workflow.C child responseContractRef must be null or non-empty"
    );
  }
  for (const [value, label] of [
    [outcome.childBasisId, "childBasisId"],
    [outcome.childRunRef, "childRunRef"],
    [outcome.childGraphCallId, "childGraphCallId"],
    [outcome.childFrameId, "childFrameId"],
    [outcome.terminalRef, "terminalRef"]
  ] as const) {
    nonEmpty(value, label);
  }
  if (
    outcome.childGraphCallId === request.parentGraphCallId ||
    outcome.childFrameId === request.parentFrameId
  ) {
    throw new TypeError("workflow.C child traversal must open its own GraphCall and frame");
  }
  if (
    !Array.isArray(outcome.evidenceRefs) ||
    outcome.evidenceRefs.length === 0 ||
    !outcome.evidenceRefs.every(
      (value) => typeof value === "string" && value.length > 0
    )
  ) {
    throw new TypeError("workflow.C child outcome requires admitted evidence refs");
  }
  if (outcome.disposition === "completed") {
    if (outcome.outputPayloadRef === null || outcome.reasonRef !== null) {
      throw new TypeError(
        "workflow.C completed child requires output payload and no reason"
      );
    }
    nonEmpty(outcome.outputPayloadRef, "outputPayloadRef");
    return;
  }
  if (outcome.disposition === "blocked" || outcome.disposition === "held") {
    if (outcome.outputPayloadRef !== null || outcome.reasonRef === null) {
      throw new TypeError(
        `workflow.C ${outcome.disposition} child requires reason and no output payload`
      );
    }
    nonEmpty(outcome.reasonRef, "reasonRef");
    return;
  }
  throw new TypeError("workflow.C child disposition is invalid");
}

function requiredOutcomeString(
  row: Readonly<Record<string, unknown>>,
  key: string
): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`workflow.C child ${key} must be a non-empty string`);
  }
  return value;
}

function nullableOutcomeString(
  row: Readonly<Record<string, unknown>>,
  key: string
): string | null {
  const value = row[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`workflow.C child ${key} must be null or non-empty`);
  }
  return value;
}

function admittedChildDisposition(
  row: Readonly<Record<string, unknown>>
): WorkflowChildTraversalDisposition {
  const value = row["disposition"];
  if (value === "completed" || value === "blocked" || value === "held") {
    return value;
  }
  throw new TypeError("workflow.C child disposition is invalid");
}

function admittedEvidenceRefs(
  row: Readonly<Record<string, unknown>>
): readonly string[] {
  const values = row["evidenceRefs"];
  if (
    !isUnknownArray(values) ||
    values.length === 0 ||
    !values.every(
      (value): value is string => typeof value === "string" && value.length > 0
    )
  ) {
    throw new TypeError("workflow.C child outcome requires admitted evidence refs");
  }
  return Object.freeze([...values]);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function admitChildOutcome(input: {
  readonly request: WorkflowChildTraversalRequest;
  readonly raw: unknown;
}): WorkflowChildTraversalOutcome {
  const detached = detachRowSnapshot(input.raw);
  if (!isPlainRecord(detached)) {
    throw new TypeError("workflow.C child outcome must be detached plain data");
  }
  const actualKeys = Object.keys(detached).sort();
  const expectedKeys = [...WORKFLOW_CHILD_OUTCOME_KEYS].sort();
  if (!stableJsonEquals(actualKeys, expectedKeys)) {
    throw new TypeError(
      `workflow.C child outcome has a non-canonical key set: ${JSON.stringify(actualKeys)}`
    );
  }
  const kind = detached["kind"];
  if (kind !== "workflow_child_traversal_outcome") {
    throw new TypeError("workflow.C child outcome kind is invalid");
  }
  const outcome: WorkflowChildTraversalOutcome = {
    kind,
    workflowInvocationRef: requiredOutcomeString(detached, "workflowInvocationRef"),
    workflowBindingRef: requiredOutcomeString(detached, "workflowBindingRef"),
    parentCCallRef: requiredOutcomeString(detached, "parentCCallRef"),
    childGraphFunctionRef: requiredOutcomeString(detached, "childGraphFunctionRef"),
    childBasisId: requiredOutcomeString(detached, "childBasisId"),
    childRunRef: requiredOutcomeString(detached, "childRunRef"),
    childGraphCallId: requiredOutcomeString(detached, "childGraphCallId"),
    childFrameId: requiredOutcomeString(detached, "childFrameId"),
    terminalRef: requiredOutcomeString(detached, "terminalRef"),
    disposition: admittedChildDisposition(detached),
    outputCarrierRef: requiredOutcomeString(detached, "outputCarrierRef"),
    outputPayloadRef: nullableOutcomeString(detached, "outputPayloadRef"),
    responseContractRef: nullableOutcomeString(detached, "responseContractRef"),
    reasonRef: nullableOutcomeString(detached, "reasonRef"),
    evidenceRefs: admittedEvidenceRefs(detached)
  };
  validateChildOutcome({ request: input.request, outcome });
  return Object.freeze({
    kind: outcome.kind,
    workflowInvocationRef: outcome.workflowInvocationRef,
    workflowBindingRef: outcome.workflowBindingRef,
    parentCCallRef: outcome.parentCCallRef,
    childGraphFunctionRef: outcome.childGraphFunctionRef,
    childBasisId: outcome.childBasisId,
    childRunRef: outcome.childRunRef,
    childGraphCallId: outcome.childGraphCallId,
    childFrameId: outcome.childFrameId,
    terminalRef: outcome.terminalRef,
    disposition: outcome.disposition,
    outputCarrierRef: outcome.outputCarrierRef,
    outputPayloadRef: outcome.outputPayloadRef,
    responseContractRef: outcome.responseContractRef,
    reasonRef: outcome.reasonRef,
    evidenceRefs: Object.freeze([...outcome.evidenceRefs])
  });
}

function failureReasonRef(input: {
  readonly workflowInvocationRef: string;
  readonly error: unknown;
}): string {
  const message = input.error instanceof Error
    ? input.error.message
    : String(input.error);
  return `abg://workflow-c-runtime-failure/${stableSha256Digest({
    workflowInvocationRef: input.workflowInvocationRef,
    message
  }).slice("sha256:".length)}`;
}

export async function resolveWorkflowC(
  input: WorkflowCInvocation
): Promise<WorkflowCResolution> {
  const selected = validateInvocation(input);
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
    programRef: input.binding.programRef,
    compositionRef: input.binding.compositionRef
  });
  const workflowInvocationRef =
    `abg://workflow-c-invocation/${stableSha256Digest({
      bindingRef: input.binding.bindingRef,
      selectedCatalogEntryRef: selected.entryRef,
      parentBasisId: input.parentBasisId,
      parentGraphCallId: input.parentGraphCallId,
      parentFrameId: input.parentFrameId,
      vectorIndex: input.vectorIndex,
      attempt: input.attempt,
      inputPayloadRef: input.inputPayloadRef,
      cCallRef: spine.cCallRef
    }).slice("sha256:".length)}`;
  const lineageRef =
    `abg://workflow-c-lineage/${stableSha256Digest({
      workflowInvocationRef,
      parentCCallRef: spine.cCallRef,
      childGraphFunctionRef: input.binding.childGraphFunctionRef
    }).slice("sha256:".length)}`;
  const request: WorkflowChildTraversalRequest = Object.freeze({
    kind: "workflow_child_traversal_request" as const,
    workflowInvocationRef,
    workflowBindingRef: input.binding.bindingRef,
    parentCCallRef: spine.cCallRef,
    parentBasisId: input.parentBasisId,
    parentGraphCallId: input.parentGraphCallId,
    parentFrameId: input.parentFrameId,
    selectedCatalogEntryRef: selected.entryRef,
    moduleName: selected.moduleName,
    moduleDigest: input.binding.moduleDigest,
    childGraphFunctionRef: input.binding.childGraphFunctionRef,
    childGraphFunctionDigest: input.binding.childGraphFunctionDigest,
    inputCarrierRef: input.binding.inputCarrierRef,
    outputCarrierRef: input.binding.outputCarrierRef,
    inputPayloadRef: input.inputPayloadRef,
    lineageRef
  });
  const emittedEvents: RuntimeEvent[] = [...spine.events];
  input.emit(spine.events);

  let outcome: WorkflowChildTraversalOutcome;
  try {
    const rawOutcome = await input.invokeChild(request);
    outcome = admitChildOutcome({ request, raw: rawOutcome });
  } catch (error: unknown) {
    const reasonRef = failureReasonRef({ workflowInvocationRef, error });
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
      kind: "workflow_c_resolution" as const,
      status: "runtime_failed" as const,
      workflowInvocationRef,
      workflowBindingRef: input.binding.bindingRef,
      cCallRef: spine.cCallRef,
      judgment: "blocked" as const,
      outputCarrierRef: input.binding.outputCarrierRef,
      outputPayloadRef: null,
      responseContractRef: null,
      reasonRef,
      childOutcome: null,
      emittedEvents: Object.freeze([...emittedEvents])
    });
  }

  const judgment: CCallJudgment = outcome.disposition === "completed"
    ? "advance"
    : outcome.disposition === "held"
      ? "pending"
      : "blocked";
  const status: WorkflowCResolutionStatus = outcome.disposition === "held"
    ? "pending"
    : outcome.disposition;
  const tail = buildCCallSpineClose({
    cCallRef: spine.cCallRef,
    basisId: input.parentBasisId,
    evidenceClass: "sub_traversal",
    evidenceRefs: Object.freeze([
      `child-basis:${outcome.childBasisId}`,
      `child-run:${outcome.childRunRef}`,
      `child-graph-call:${outcome.childGraphCallId}`,
      `child-frame:${outcome.childFrameId}`,
      `child-terminal:${outcome.terminalRef}`,
      `output-carrier:${outcome.outputCarrierRef}`,
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
  return Object.freeze({
    kind: "workflow_c_resolution" as const,
    status,
    workflowInvocationRef,
    workflowBindingRef: input.binding.bindingRef,
    cCallRef: spine.cCallRef,
    judgment,
    outputCarrierRef: input.binding.outputCarrierRef,
    outputPayloadRef: outcome.outputPayloadRef,
    responseContractRef: outcome.responseContractRef,
    reasonRef: outcome.reasonRef,
    childOutcome: outcome,
    emittedEvents: Object.freeze([...emittedEvents])
  });
}
