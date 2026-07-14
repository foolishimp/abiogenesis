// Implements: T-262; REQ-L-GTL3-RECURSE-001..008;
// REQ-R-ABG3-FRAME-001..006; REQ-R-ABG3-LINEAGE-001..005.
// The resolver is a bounded tail loop over admitted recurse event truth.

import type {
  RuntimeEvent,
  TypedRecurseApplicationOpenedEvent,
  TypedRecurseChildDisposition,
  TypedRecurseChildResultAdmittedEvent,
  TypedRecurseFoldbackAdmittedEvent,
  TypedRecurseFoldbackRejectedEvent,
  TypedRecurseParentRebindEvaluatedEvent,
  TypedRecurseTerminationDecision,
  TypedRecurseTerminationEvaluatedEvent
} from "../contracts/carriers.js";
import {
  detachRowSnapshot,
  isPlainRecord
} from "../contracts/admission_hygiene.js";
import { assertRuntimeEvent } from "../contracts/event_admission.js";
import {
  assertAdmittedTypedRecursePolicy,
  assertCompiledTypedRecurseBinding,
  assertCompiledTypedRecursePlan,
  compileTypedRecurseBinding,
  compileTypedRecursePlan,
  type AdmittedTypedRecursePolicy,
  type CompiledTypedRecurseBinding,
  type CompiledTypedRecursePlan
} from "../contracts/typed_recurse.js";
import { compileGraphFunctionApplication } from "../contracts/graph_function_application_compiler.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  resolveSelectedCatalogExecutionBinding
} from "./selected_catalog_execution.js";

export type TypedRecurseRuntimeEvent =
  | TypedRecurseApplicationOpenedEvent
  | TypedRecurseChildResultAdmittedEvent
  | TypedRecurseTerminationEvaluatedEvent
  | TypedRecurseFoldbackAdmittedEvent
  | TypedRecurseFoldbackRejectedEvent
  | TypedRecurseParentRebindEvaluatedEvent;

export interface TypedRecurseChildRequest {
  readonly kind: "typed_recurse_child_request";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly selectedCatalogEntryRef: string;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly wrapperGraphFunctionRef: string;
  readonly operandGraphFunctionRef: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly frameLineageId: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly inputCarrierRef: string;
  readonly inputPayloadRef: string;
  readonly outputCarrierRef: string;
  readonly maxApplications: number;
  readonly priorEvidenceRefs: readonly string[];
}

export interface TypedRecurseChildOutcome {
  readonly kind: "typed_recurse_child_outcome";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly disposition: TypedRecurseChildDisposition;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface TypedRecurseTerminationRequest {
  readonly kind: "typed_recurse_termination_request";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string;
  readonly evaluatorBinding: string;
  readonly evaluatorDigest: `sha256:${string}`;
  readonly consumedFieldRefs: readonly string[];
  readonly policyRef: string;
  readonly policyDigest: `sha256:${string}`;
  readonly maxApplications: number;
  readonly priorEvidenceRefs: readonly string[];
}

export interface TypedRecurseTerminationOutcome {
  readonly kind: "typed_recurse_termination_outcome";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly outputPayloadRef: string;
  readonly evaluatorBinding: string;
  readonly evaluatorDigest: `sha256:${string}`;
  readonly decision: TypedRecurseTerminationDecision;
  readonly reasonRef: string;
  readonly evidenceRefs: readonly string[];
}

export interface TypedRecurseFoldbackRequest {
  readonly kind: "typed_recurse_foldback_request";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly frameLineageId: string;
  readonly foldbackBinding: string;
  readonly foldbackAdditionalDigest: `sha256:${string}`;
  readonly sourceOutputCarrierRef: string;
  readonly sourceOutputPayloadRef: string;
  readonly targetInputCarrierRef: string;
  readonly policyRef: string;
  readonly policyDigest: `sha256:${string}`;
  readonly budgetSourceFieldRef: string;
  readonly maxApplications: number;
  readonly requiredPreservedEvidenceRefs: readonly string[];
}

export interface TypedRecurseFoldbackOutcome {
  readonly kind: "typed_recurse_foldback_outcome";
  readonly planRef: string;
  readonly bindingRef: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly frameLineageId: string;
  readonly foldbackBinding: string;
  readonly sourceOutputCarrierRef: string;
  readonly sourceOutputPayloadRef: string;
  readonly targetInputCarrierRef: string;
  readonly targetInputPayloadRef: string;
  readonly policyRef: string;
  readonly policyDigest: `sha256:${string}`;
  readonly budgetSourceFieldRef: string;
  readonly preservedEvidenceRefs: readonly string[];
  readonly foldbackEvidenceRefs: readonly string[];
}

export interface TypedRecurseParentRebindEvidenceInput {
  readonly planRef: string;
  readonly bindingRef: string;
  readonly applicationOrdinal: number;
  readonly childInvocationRef: string;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly frameLineageId: string;
  readonly foldbackBinding: string;
  readonly foldbackAdditionalDigest: `sha256:${string}`;
  readonly sourceOutputCarrierRef: string;
  readonly sourceOutputPayloadRef: string;
  readonly targetInputCarrierRef: string;
  readonly targetInputPayloadRef: string;
  readonly policyRef: string;
  readonly policyDigest: `sha256:${string}`;
  readonly budgetSourceFieldRef: string;
  readonly maxApplications: number;
  readonly preservedEvidenceRefs: readonly string[];
}

export type TypedRecurseStopReason =
  | "held"
  | "child_blocked"
  | "runtime_failure"
  | "termination_blocked"
  | "budget_exhausted"
  | "foldback_invalid"
  | "parent_rebind_blocked";

export interface TypedRecurseResolution {
  readonly kind: "typed_recurse_resolution";
  readonly status: "completed" | "pending" | "blocked";
  readonly stopReason: TypedRecurseStopReason | null;
  readonly planRef: string;
  readonly bindingRef: string;
  readonly frameLineageId: string;
  readonly applicationsOpened: number;
  readonly currentInputPayloadRef: string;
  readonly outputCarrierRef: string;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly emittedEvents: readonly TypedRecurseRuntimeEvent[];
}

export interface TypedRecurseInvocation {
  readonly kind: "typed_recurse_invocation";
  readonly binding: CompiledTypedRecurseBinding;
  readonly plan: CompiledTypedRecursePlan;
  readonly policy: AdmittedTypedRecursePolicy;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly selectedCatalogEntryRef: string;
  readonly parentBasisId: string;
  readonly parentGraphCallId: string;
  readonly parentFrameId: string;
  readonly inputPayloadRef: string;
  readonly causationEventRefs: readonly string[];
  readonly replayEvents: readonly RuntimeEvent[];
  readonly emit: (events: readonly RuntimeEvent[]) => void;
  readonly invokeChild: (
    request: TypedRecurseChildRequest
  ) => Promise<unknown>;
  readonly evaluateTermination: (
    request: TypedRecurseTerminationRequest
  ) => Promise<unknown>;
  readonly applyFoldback: (
    request: TypedRecurseFoldbackRequest
  ) => Promise<unknown>;
}

const CHILD_OUTCOME_KEYS = Object.freeze([
  "kind",
  "planRef",
  "bindingRef",
  "applicationOrdinal",
  "childInvocationRef",
  "childGraphCallId",
  "childFrameId",
  "disposition",
  "outputCarrierRef",
  "outputPayloadRef",
  "responseContractRef",
  "reasonRef",
  "evidenceRefs"
]);

const TERMINATION_OUTCOME_KEYS = Object.freeze([
  "kind",
  "planRef",
  "bindingRef",
  "applicationOrdinal",
  "childInvocationRef",
  "childGraphCallId",
  "childFrameId",
  "outputPayloadRef",
  "evaluatorBinding",
  "evaluatorDigest",
  "decision",
  "reasonRef",
  "evidenceRefs"
]);

const FOLDBACK_OUTCOME_KEYS = Object.freeze([
  "kind",
  "planRef",
  "bindingRef",
  "applicationOrdinal",
  "childInvocationRef",
  "childGraphCallId",
  "childFrameId",
  "frameLineageId",
  "foldbackBinding",
  "sourceOutputCarrierRef",
  "sourceOutputPayloadRef",
  "targetInputCarrierRef",
  "targetInputPayloadRef",
  "policyRef",
  "policyDigest",
  "budgetSourceFieldRef",
  "preservedEvidenceRefs",
  "foldbackEvidenceRefs"
]);

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  return nonEmpty(value, label);
}

function isSha256Digest(value: string): value is `sha256:${string}` {
  return /^sha256:[0-9a-f]{64}$/u.test(value);
}

function sha256Digest(value: unknown, label: string): `sha256:${string}` {
  const digest = nonEmpty(value, label);
  if (!isSha256Digest(digest)) {
    throw new TypeError(`${label} must be a lowercase sha256 digest`);
  }
  return digest;
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return value;
}

function strings(
  value: unknown,
  label: string,
  options: { readonly nonEmpty?: boolean } = {}
): readonly string[] {
  if (
    !Array.isArray(value) ||
    (options.nonEmpty === true && value.length === 0) ||
    !value.every(
      (entry): entry is string =>
        typeof entry === "string" && entry.length > 0
    ) ||
    new Set(value).size !== value.length
  ) {
    throw new TypeError(`${label} must contain unique non-empty strings`);
  }
  return Object.freeze([...value]);
}

function exactKeys(
  row: Readonly<Record<string, unknown>>,
  expected: readonly string[],
  label: string
): void {
  const actual = Object.keys(row).sort();
  if (!stableJsonEquals(actual, [...expected].sort())) {
    throw new TypeError(
      `${label} has a non-canonical key set: ${JSON.stringify(actual)}`
    );
  }
}

function childDisposition(value: unknown): TypedRecurseChildDisposition {
  if (
    value === "completed" ||
    value === "held" ||
    value === "blocked" ||
    value === "runtime_failed"
  ) {
    return value;
  }
  throw new TypeError("typed recurse child disposition is invalid");
}

function terminationDecision(value: unknown): TypedRecurseTerminationDecision {
  if (
    value === "terminate" ||
    value === "foldback" ||
    value === "blocked"
  ) {
    return value;
  }
  throw new TypeError("typed recurse termination decision is invalid");
}

function containsEvery(
  values: readonly string[],
  required: readonly string[]
): boolean {
  const set = new Set(values);
  return required.every((value) => set.has(value));
}

function stableUnion(groups: readonly (readonly string[])[]): readonly string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const group of groups) {
    for (const value of group) {
      if (!seen.has(value)) {
        seen.add(value);
        output.push(value);
      }
    }
  }
  return Object.freeze(output);
}

export function deriveTypedRecurseParentRebindEvidenceRef(
  input: TypedRecurseParentRebindEvidenceInput
): string {
  const digest = stableSha256Digest({
    kind: "typed_recurse_parent_rebind_evidence",
    planRef: input.planRef,
    bindingRef: input.bindingRef,
    applicationOrdinal: input.applicationOrdinal,
    childInvocationRef: input.childInvocationRef,
    childGraphCallId: input.childGraphCallId,
    childFrameId: input.childFrameId,
    frameLineageId: input.frameLineageId,
    foldbackBinding: input.foldbackBinding,
    foldbackAdditionalDigest: input.foldbackAdditionalDigest,
    sourceOutputCarrierRef: input.sourceOutputCarrierRef,
    sourceOutputPayloadRef: input.sourceOutputPayloadRef,
    targetInputCarrierRef: input.targetInputCarrierRef,
    targetInputPayloadRef: input.targetInputPayloadRef,
    policyRef: input.policyRef,
    policyDigest: input.policyDigest,
    budgetSourceFieldRef: input.budgetSourceFieldRef,
    maxApplications: input.maxApplications,
    preservedEvidenceRefs: [...input.preservedEvidenceRefs]
  });
  return `evidence://abg/typed-recurse/parent-rebind/${digest.slice("sha256:".length)}`;
}

function parentRebindEvidenceRef(input: {
  readonly invocation: TypedRecurseInvocation;
  readonly foldback: TypedRecurseFoldbackAdmittedEvent;
}): string {
  return deriveTypedRecurseParentRebindEvidenceRef({
    planRef: input.foldback.planRef,
    bindingRef: input.foldback.bindingRef,
    applicationOrdinal: input.foldback.applicationOrdinal,
    childInvocationRef: input.foldback.childInvocationRef,
    childGraphCallId: input.foldback.childGraphCallId,
    childFrameId: input.foldback.childFrameId,
    frameLineageId: input.foldback.frameLineageId,
    foldbackBinding: input.foldback.foldbackBinding,
    foldbackAdditionalDigest: input.invocation.plan.foldbackAdditionalDigest,
    sourceOutputCarrierRef: input.foldback.sourceOutputCarrierRef,
    sourceOutputPayloadRef: input.foldback.sourceOutputPayloadRef,
    targetInputCarrierRef: input.foldback.targetInputCarrierRef,
    targetInputPayloadRef: input.foldback.targetInputPayloadRef,
    policyRef: input.foldback.policyRef,
    policyDigest: input.foldback.policyDigest,
    budgetSourceFieldRef: input.foldback.budgetSourceFieldRef,
    maxApplications: input.invocation.plan.maxApplications,
    preservedEvidenceRefs: input.foldback.preservedEvidenceRefs
  });
}

function selectedModuleAuthority(
  input: TypedRecurseInvocation
): CatalogExecutionBinding {
  const selected = resolveSelectedCatalogExecutionBinding({
    catalogBasis: input.catalogBasis,
    selectedCatalogEntryRef: input.selectedCatalogEntryRef,
    label: "typed recurse"
  });
  const selectedRegistryRows =
    input.catalogBasis.projection.runtimeRegistryProjection.entries.filter(
      (entry) => entry.entryRef === selected.entryRef
    );
  if (
    selectedRegistryRows.length !== 1 ||
    !selectedRegistryRows[0]?.policyRefs.includes(input.policy.policyRef)
  ) {
    throw new TypeError(
      "typed recurse selected catalog entry does not authorize the admitted policy"
    );
  }
  if (
    selected.moduleName !== input.binding.moduleName ||
    selected.moduleDigest !== input.binding.moduleDigest ||
    selected.moduleDigest !== stableSha256Digest(selected.module)
  ) {
    throw new TypeError("typed recurse selected Module authority differs");
  }
  const wrappers = selected.module.graphFunctions.filter(
    (candidate) => candidate.id === input.binding.wrapperGraphFunctionRef
  );
  const wrapper = wrappers[0];
  if (
    wrappers.length !== 1 ||
    wrapper === undefined ||
    stableSha256Digest(wrapper) !==
      input.binding.wrapperGraphFunctionDigest
  ) {
    throw new TypeError("typed recurse selected wrapper authority differs");
  }
  const compilation = compileGraphFunctionApplication({
    graphFunction: wrapper,
    graphFunctions: selected.module.graphFunctions
  });
  if (!compilation.accepted || compilation.recurseRelation === null) {
    throw new TypeError("typed recurse selected relation no longer compiles");
  }
  const binding = compileTypedRecurseBinding({
    module: selected.module,
    graphFunction: wrapper,
    relation: compilation.recurseRelation
  });
  if (!stableJsonEquals(binding, input.binding)) {
    throw new TypeError("typed recurse binding no longer rederives exactly");
  }
  const plan = compileTypedRecursePlan({
    binding,
    policy: input.policy,
    selectedCatalogEntryRef: selected.entryRef
  });
  if (!stableJsonEquals(plan, input.plan)) {
    throw new TypeError("typed recurse plan no longer rederives exactly");
  }
  return selected;
}

function validateInvocation(
  input: TypedRecurseInvocation
): CatalogExecutionBinding {
  if (input.kind !== "typed_recurse_invocation") {
    throw new TypeError("typed recurse invocation kind is invalid");
  }
  assertCompiledTypedRecurseBinding(input.binding);
  assertCompiledTypedRecursePlan(input.plan);
  assertAdmittedTypedRecursePolicy(input.policy);
  nonEmpty(input.selectedCatalogEntryRef, "selectedCatalogEntryRef");
  nonEmpty(input.parentBasisId, "parentBasisId");
  nonEmpty(input.parentGraphCallId, "parentGraphCallId");
  nonEmpty(input.parentFrameId, "parentFrameId");
  nonEmpty(input.inputPayloadRef, "inputPayloadRef");
  strings(input.causationEventRefs, "causationEventRefs");
  if (
    input.selectedCatalogEntryRef !== input.plan.selectedCatalogEntryRef ||
    input.inputPayloadRef !== input.plan.sourceInputPayloadRef ||
    input.inputPayloadRef !== input.policy.sourceInputPayloadRef ||
    input.policy.policyDigest !== input.plan.policyDigest ||
    input.binding.bindingRef !== input.plan.bindingRef
  ) {
    throw new TypeError("typed recurse invocation differs from its sealed plan");
  }
  return selectedModuleAuthority(input);
}

function lineageRef(input: TypedRecurseInvocation): string {
  const digest = stableSha256Digest({
    planRef: input.plan.planRef,
    parentBasisId: input.parentBasisId,
    parentGraphCallId: input.parentGraphCallId,
    parentFrameId: input.parentFrameId,
    inputPayloadRef: input.inputPayloadRef
  });
  return `abg://typed-recurse/frame-lineage/${digest.slice("sha256:".length)}`;
}

function childIdentity(input: {
  readonly invocation: TypedRecurseInvocation;
  readonly frameLineageId: string;
  readonly applicationOrdinal: number;
}) {
  const childInvocationDigest = stableSha256Digest({
    planRef: input.invocation.plan.planRef,
    frameLineageId: input.frameLineageId,
    applicationOrdinal: input.applicationOrdinal
  });
  const childInvocationRef =
    `abg://typed-recurse/child-invocation/${childInvocationDigest.slice("sha256:".length)}`;
  const childGraphCallDigest = stableSha256Digest({
    childInvocationRef,
    operandGraphFunctionRef:
      input.invocation.binding.operandGraphFunctionRef
  });
  const childGraphCallId =
    `graph-call://typed-recurse/${childGraphCallDigest.slice("sha256:".length)}`;
  const childFrameDigest = stableSha256Digest({
    childInvocationRef,
    childGraphCallId,
    frameLineageId: input.frameLineageId,
    applicationOrdinal: input.applicationOrdinal
  });
  return Object.freeze({
    childInvocationRef,
    childGraphCallId,
    childFrameId:
      `frame://typed-recurse/${childFrameDigest.slice("sha256:".length)}`
  });
}

function isTypedRecurseRuntimeEvent(
  event: RuntimeEvent
): event is TypedRecurseRuntimeEvent {
  return (
    event.kind === "typed_recurse_application_opened" ||
    event.kind === "typed_recurse_child_result_admitted" ||
    event.kind === "typed_recurse_termination_evaluated" ||
    event.kind === "typed_recurse_foldback_admitted" ||
    event.kind === "typed_recurse_foldback_rejected" ||
    event.kind === "typed_recurse_parent_rebind_evaluated"
  );
}

function eventRef(event: TypedRecurseRuntimeEvent): string {
  const semanticEvent = Object.fromEntries(
    Object.entries(event).filter(
      ([key]) =>
        key !== "eventId" &&
        key !== "eventTime" &&
        key !== "eventTimeUnixMs" &&
        key !== "eventAdmissionOrdinal"
    )
  );
  const digest = stableSha256Digest(semanticEvent);
  return `event://typed-recurse/${digest.slice("sha256:".length)}`;
}

type ReplayStage =
  | "open"
  | "child"
  | "termination"
  | "foldback"
  | "parent"
  | "terminal";

interface TypedRecurseReplayProjection {
  readonly frameLineageId: string;
  readonly stage: ReplayStage;
  readonly applicationOrdinal: number;
  readonly applicationsOpened: number;
  readonly currentInputPayloadRef: string;
  readonly priorEvidenceRefs: readonly string[];
  readonly opened: TypedRecurseApplicationOpenedEvent | null;
  readonly child: TypedRecurseChildResultAdmittedEvent | null;
  readonly termination: TypedRecurseTerminationEvaluatedEvent | null;
  readonly foldback: TypedRecurseFoldbackAdmittedEvent | null;
  readonly parent: TypedRecurseParentRebindEvaluatedEvent | null;
  readonly status: "completed" | "pending" | "blocked" | null;
  readonly stopReason: TypedRecurseStopReason | null;
  readonly outputPayloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly reasonRef: string | null;
  readonly relevantEvents: readonly TypedRecurseRuntimeEvent[];
}

function eventCommon(input: {
  readonly invocation: TypedRecurseInvocation;
  readonly frameLineageId: string;
  readonly applicationOrdinal: number;
  readonly causationEventRefs: readonly string[];
}) {
  const identity = childIdentity(input);
  return Object.freeze({
    basisId: input.invocation.parentBasisId,
    planRef: input.invocation.plan.planRef,
    bindingRef: input.invocation.binding.bindingRef,
    selectedCatalogEntryRef:
      input.invocation.selectedCatalogEntryRef,
    parentGraphCallId: input.invocation.parentGraphCallId,
    parentFrameId: input.invocation.parentFrameId,
    frameLineageId: input.frameLineageId,
    applicationOrdinal: input.applicationOrdinal,
    ...identity,
    causationEventRefs: Object.freeze([...input.causationEventRefs]),
    correlationId: input.frameLineageId
  });
}

function assertCommon(input: {
  readonly invocation: TypedRecurseInvocation;
  readonly event: TypedRecurseRuntimeEvent;
  readonly frameLineageId: string;
  readonly applicationOrdinal: number;
  readonly causationEventRefs: readonly string[];
}): void {
  const expected = eventCommon(input);
  for (const key of [
    "basisId",
    "planRef",
    "bindingRef",
    "selectedCatalogEntryRef",
    "parentGraphCallId",
    "parentFrameId",
    "frameLineageId",
    "applicationOrdinal",
    "childInvocationRef",
    "childGraphCallId",
    "childFrameId",
    "correlationId"
  ] as const) {
    if (input.event[key] !== expected[key]) {
      throw new TypeError(`typed recurse replay ${key} differs`);
    }
  }
  if (!stableJsonEquals(input.event.causationEventRefs, expected.causationEventRefs)) {
    throw new TypeError("typed recurse replay causation differs");
  }
}

function projectReplay(
  invocation: TypedRecurseInvocation,
  events: readonly RuntimeEvent[]
): TypedRecurseReplayProjection {
  const frameLineageId = lineageRef(invocation);
  const relevant: TypedRecurseRuntimeEvent[] = [];
  for (const event of events) {
    if (!isTypedRecurseRuntimeEvent(event)) continue;
    assertRuntimeEvent(event);
    if (
      event.planRef !== invocation.plan.planRef ||
      event.basisId !== invocation.parentBasisId ||
      event.parentGraphCallId !== invocation.parentGraphCallId ||
      event.parentFrameId !== invocation.parentFrameId
    ) {
      continue;
    }
    relevant.push(event);
  }

  let stage: ReplayStage = "open";
  let applicationOrdinal = 1;
  let applicationsOpened = 0;
  let currentInputPayloadRef = invocation.inputPayloadRef;
  let priorEvidenceRefs: readonly string[] = Object.freeze([
    ...invocation.plan.policyEvidenceRefs
  ]);
  let opened: TypedRecurseApplicationOpenedEvent | null = null;
  let child: TypedRecurseChildResultAdmittedEvent | null = null;
  let termination: TypedRecurseTerminationEvaluatedEvent | null = null;
  let foldback: TypedRecurseFoldbackAdmittedEvent | null = null;
  let parent: TypedRecurseParentRebindEvaluatedEvent | null = null;
  let status: "completed" | "pending" | "blocked" | null = null;
  let stopReason: TypedRecurseStopReason | null = null;
  let outputPayloadRef: string | null = null;
  let responseContractRef: string | null = null;
  let reasonRef: string | null = null;
  let expectedCausationRefs: readonly string[] = Object.freeze([
    ...invocation.causationEventRefs
  ]);

  for (const event of relevant) {
    if (stage === "terminal") {
      throw new TypeError("typed recurse replay contains events after terminal truth");
    }
    assertCommon({
      invocation,
      event,
      frameLineageId,
      applicationOrdinal,
      causationEventRefs: expectedCausationRefs
    });
    if (stage === "open") {
      if (
        event.kind !== "typed_recurse_application_opened" ||
        event.inputCarrierRef !== invocation.plan.inputCarrierRef ||
        event.inputPayloadRef !== currentInputPayloadRef
      ) {
        throw new TypeError("typed recurse replay expected one exact application open");
      }
      opened = event;
      child = null;
      termination = null;
      foldback = null;
      parent = null;
      applicationsOpened += 1;
      stage = "child";
    } else if (stage === "child") {
      if (
        event.kind !== "typed_recurse_child_result_admitted" ||
        event.outputCarrierRef !== invocation.plan.outputCarrierRef
      ) {
        throw new TypeError("typed recurse replay expected one exact child result");
      }
      child = event;
      priorEvidenceRefs = stableUnion([
        priorEvidenceRefs,
        event.evidenceRefs
      ]);
      if (event.disposition === "completed") {
        stage = "termination";
      } else {
        status = event.disposition === "held" ? "pending" : "blocked";
        stopReason =
          event.disposition === "held"
            ? "held"
            : event.disposition === "runtime_failed"
              ? "runtime_failure"
              : "child_blocked";
        reasonRef = event.reasonRef;
        stage = "terminal";
      }
    } else if (stage === "termination") {
      if (
        event.kind !== "typed_recurse_termination_evaluated" ||
        child === null ||
        child.outputPayloadRef === null ||
        event.outputPayloadRef !== child.outputPayloadRef ||
        event.evaluatorBinding !==
          invocation.plan.terminationEvaluatorBinding ||
        event.evaluatorDigest !== invocation.plan.terminationEvaluatorDigest
      ) {
        throw new TypeError("typed recurse replay expected exact termination truth");
      }
      termination = event;
      priorEvidenceRefs = stableUnion([
        priorEvidenceRefs,
        event.evidenceRefs
      ]);
      if (event.decision === "terminate") {
        status = "completed";
        outputPayloadRef = event.outputPayloadRef;
        responseContractRef = child.responseContractRef;
        reasonRef = event.reasonRef;
        stage = "terminal";
      } else if (event.decision === "blocked") {
        status = "blocked";
        stopReason = "termination_blocked";
        reasonRef = event.reasonRef;
        stage = "terminal";
      } else if (applicationOrdinal >= invocation.plan.maxApplications) {
        status = "blocked";
        stopReason = "budget_exhausted";
        reasonRef = "reason://abg/typed-recurse/budget-exhausted";
        stage = "terminal";
      } else {
        stage = "foldback";
      }
    } else if (stage === "foldback") {
      if (event.kind === "typed_recurse_foldback_rejected") {
        if (
          child === null ||
          child.outputPayloadRef === null ||
          event.foldbackBinding !== invocation.plan.foldbackBinding ||
          event.sourceOutputCarrierRef !== invocation.plan.outputCarrierRef ||
          event.sourceOutputPayloadRef !== child.outputPayloadRef ||
          event.targetInputCarrierRef !== invocation.plan.inputCarrierRef ||
          event.policyRef !== invocation.plan.policyRef ||
          event.policyDigest !== invocation.plan.policyDigest ||
          event.budgetSourceFieldRef !== invocation.plan.budgetSourceFieldRef
        ) {
          throw new TypeError("typed recurse replay expected exact foldback rejection");
        }
        priorEvidenceRefs = stableUnion([
          priorEvidenceRefs,
          event.evidenceRefs
        ]);
        status = "blocked";
        stopReason = "foldback_invalid";
        reasonRef = event.reasonRef;
        stage = "terminal";
        expectedCausationRefs = Object.freeze([eventRef(event)]);
        continue;
      }
      if (
        event.kind !== "typed_recurse_foldback_admitted" ||
        child === null ||
        child.outputPayloadRef === null ||
        event.foldbackBinding !== invocation.plan.foldbackBinding ||
        event.sourceOutputCarrierRef !== invocation.plan.outputCarrierRef ||
        event.sourceOutputPayloadRef !== child.outputPayloadRef ||
        event.targetInputCarrierRef !== invocation.plan.inputCarrierRef ||
        event.policyRef !== invocation.plan.policyRef ||
        event.policyDigest !== invocation.plan.policyDigest ||
        event.budgetSourceFieldRef !== invocation.plan.budgetSourceFieldRef ||
        !containsEvery(event.preservedEvidenceRefs, priorEvidenceRefs)
      ) {
        throw new TypeError("typed recurse replay expected exact foldback truth");
      }
      foldback = event;
      priorEvidenceRefs = stableUnion([
        event.preservedEvidenceRefs,
        event.foldbackEvidenceRefs
      ]);
      stage = "parent";
    } else if (stage === "parent") {
      const expectedParentRebindEvidenceRef =
        foldback === null
          ? null
          : parentRebindEvidenceRef({ invocation, foldback });
      const parentRebindAdmitted =
        expectedParentRebindEvidenceRef !== null &&
        foldback !== null &&
        foldback.foldbackEvidenceRefs.includes(
          expectedParentRebindEvidenceRef
        );
      if (
        event.kind !== "typed_recurse_parent_rebind_evaluated" ||
        foldback === null ||
        event.targetInputCarrierRef !== foldback.targetInputCarrierRef ||
        event.targetInputPayloadRef !== foldback.targetInputPayloadRef ||
        event.policyRef !== invocation.plan.policyRef ||
        event.policyDigest !== invocation.plan.policyDigest ||
        event.budgetSourceFieldRef !== invocation.plan.budgetSourceFieldRef ||
        !containsEvery(event.evidenceRefs, priorEvidenceRefs) ||
        (event.decision === "admitted") !== parentRebindAdmitted
      ) {
        throw new TypeError("typed recurse replay expected exact parent rebind truth");
      }
      parent = event;
      if (event.decision === "blocked") {
        status = "blocked";
        stopReason = "parent_rebind_blocked";
        reasonRef = event.reasonRef;
        stage = "terminal";
      } else {
        currentInputPayloadRef = event.targetInputPayloadRef;
        priorEvidenceRefs = stableUnion([
          priorEvidenceRefs,
          event.evidenceRefs
        ]);
        applicationOrdinal += 1;
        stage = "open";
        opened = null;
        child = null;
        termination = null;
        foldback = null;
        parent = null;
      }
    }
    expectedCausationRefs = Object.freeze([eventRef(event)]);
  }

  return Object.freeze({
    frameLineageId,
    stage,
    applicationOrdinal,
    applicationsOpened,
    currentInputPayloadRef,
    priorEvidenceRefs,
    opened,
    child,
    termination,
    foldback,
    parent,
    status,
    stopReason,
    outputPayloadRef,
    responseContractRef,
    reasonRef,
    relevantEvents: Object.freeze(relevant)
  });
}

function childRequest(
  invocation: TypedRecurseInvocation,
  projection: TypedRecurseReplayProjection
): TypedRecurseChildRequest {
  const identity = childIdentity({
    invocation,
    frameLineageId: projection.frameLineageId,
    applicationOrdinal: projection.applicationOrdinal
  });
  return Object.freeze({
    kind: "typed_recurse_child_request" as const,
    planRef: invocation.plan.planRef,
    bindingRef: invocation.binding.bindingRef,
    selectedCatalogEntryRef: invocation.selectedCatalogEntryRef,
    moduleName: invocation.binding.moduleName,
    moduleDigest: invocation.binding.moduleDigest,
    wrapperGraphFunctionRef: invocation.binding.wrapperGraphFunctionRef,
    operandGraphFunctionRef: invocation.binding.operandGraphFunctionRef,
    parentBasisId: invocation.parentBasisId,
    parentGraphCallId: invocation.parentGraphCallId,
    parentFrameId: invocation.parentFrameId,
    frameLineageId: projection.frameLineageId,
    applicationOrdinal: projection.applicationOrdinal,
    ...identity,
    inputCarrierRef: invocation.plan.inputCarrierRef,
    inputPayloadRef: projection.currentInputPayloadRef,
    outputCarrierRef: invocation.plan.outputCarrierRef,
    maxApplications: invocation.plan.maxApplications,
    priorEvidenceRefs: Object.freeze([...projection.priorEvidenceRefs])
  });
}

function admitChildOutcome(input: {
  readonly request: TypedRecurseChildRequest;
  readonly raw: unknown;
}): TypedRecurseChildOutcome {
  const row = detachRowSnapshot(input.raw);
  if (!isPlainRecord(row)) {
    throw new TypeError("typed recurse child outcome must be detached plain data");
  }
  exactKeys(row, CHILD_OUTCOME_KEYS, "typed recurse child outcome");
  if (row["kind"] !== "typed_recurse_child_outcome") {
    throw new TypeError("typed recurse child outcome kind is invalid");
  }
  const outcome = Object.freeze({
    kind: "typed_recurse_child_outcome" as const,
    planRef: nonEmpty(row["planRef"], "planRef"),
    bindingRef: nonEmpty(row["bindingRef"], "bindingRef"),
    applicationOrdinal: positiveInteger(
      row["applicationOrdinal"],
      "applicationOrdinal"
    ),
    childInvocationRef: nonEmpty(
      row["childInvocationRef"],
      "childInvocationRef"
    ),
    childGraphCallId: nonEmpty(row["childGraphCallId"], "childGraphCallId"),
    childFrameId: nonEmpty(row["childFrameId"], "childFrameId"),
    disposition: childDisposition(row["disposition"]),
    outputCarrierRef: nonEmpty(row["outputCarrierRef"], "outputCarrierRef"),
    outputPayloadRef: nullableString(row["outputPayloadRef"], "outputPayloadRef"),
    responseContractRef: nullableString(
      row["responseContractRef"],
      "responseContractRef"
    ),
    reasonRef: nullableString(row["reasonRef"], "reasonRef"),
    evidenceRefs: strings(row["evidenceRefs"], "evidenceRefs", {
      nonEmpty: true
    })
  });
  if (
    outcome.planRef !== input.request.planRef ||
    outcome.bindingRef !== input.request.bindingRef ||
    outcome.applicationOrdinal !== input.request.applicationOrdinal ||
    outcome.childInvocationRef !== input.request.childInvocationRef ||
    outcome.childGraphCallId !== input.request.childGraphCallId ||
    outcome.childFrameId !== input.request.childFrameId ||
    outcome.outputCarrierRef !== input.request.outputCarrierRef
  ) {
    throw new TypeError("typed recurse child outcome identity differs");
  }
  const completed = outcome.disposition === "completed";
  if (
    completed !== (outcome.outputPayloadRef !== null) ||
    completed !== (outcome.responseContractRef !== null) ||
    completed === (outcome.reasonRef !== null)
  ) {
    throw new TypeError("typed recurse child outcome fields are inconsistent");
  }
  return outcome;
}

function admitTerminationOutcome(input: {
  readonly request: TypedRecurseTerminationRequest;
  readonly raw: unknown;
}): TypedRecurseTerminationOutcome {
  const row = detachRowSnapshot(input.raw);
  if (!isPlainRecord(row)) {
    throw new TypeError("typed recurse termination outcome must be detached plain data");
  }
  exactKeys(row, TERMINATION_OUTCOME_KEYS, "typed recurse termination outcome");
  if (row["kind"] !== "typed_recurse_termination_outcome") {
    throw new TypeError("typed recurse termination outcome kind is invalid");
  }
  const outcome = Object.freeze({
    kind: "typed_recurse_termination_outcome" as const,
    planRef: nonEmpty(row["planRef"], "planRef"),
    bindingRef: nonEmpty(row["bindingRef"], "bindingRef"),
    applicationOrdinal: positiveInteger(
      row["applicationOrdinal"],
      "applicationOrdinal"
    ),
    childInvocationRef: nonEmpty(
      row["childInvocationRef"],
      "childInvocationRef"
    ),
    childGraphCallId: nonEmpty(row["childGraphCallId"], "childGraphCallId"),
    childFrameId: nonEmpty(row["childFrameId"], "childFrameId"),
    outputPayloadRef: nonEmpty(row["outputPayloadRef"], "outputPayloadRef"),
    evaluatorBinding: nonEmpty(row["evaluatorBinding"], "evaluatorBinding"),
    evaluatorDigest: sha256Digest(row["evaluatorDigest"], "evaluatorDigest"),
    decision: terminationDecision(row["decision"]),
    reasonRef: nonEmpty(row["reasonRef"], "reasonRef"),
    evidenceRefs: strings(row["evidenceRefs"], "evidenceRefs", {
      nonEmpty: true
    })
  });
  for (const key of [
    "planRef",
    "bindingRef",
    "applicationOrdinal",
    "childInvocationRef",
    "childGraphCallId",
    "childFrameId",
    "outputPayloadRef",
    "evaluatorBinding",
    "evaluatorDigest"
  ] as const) {
    if (outcome[key] !== input.request[key]) {
      throw new TypeError(`typed recurse termination ${key} differs`);
    }
  }
  return outcome;
}

function admitFoldbackOutcome(input: {
  readonly request: TypedRecurseFoldbackRequest;
  readonly raw: unknown;
}): TypedRecurseFoldbackOutcome {
  const row = detachRowSnapshot(input.raw);
  if (!isPlainRecord(row)) {
    throw new TypeError("typed recurse foldback outcome must be detached plain data");
  }
  exactKeys(row, FOLDBACK_OUTCOME_KEYS, "typed recurse foldback outcome");
  if (row["kind"] !== "typed_recurse_foldback_outcome") {
    throw new TypeError("typed recurse foldback outcome kind is invalid");
  }
  const outcome = Object.freeze({
    kind: "typed_recurse_foldback_outcome" as const,
    planRef: nonEmpty(row["planRef"], "planRef"),
    bindingRef: nonEmpty(row["bindingRef"], "bindingRef"),
    applicationOrdinal: positiveInteger(
      row["applicationOrdinal"],
      "applicationOrdinal"
    ),
    childInvocationRef: nonEmpty(
      row["childInvocationRef"],
      "childInvocationRef"
    ),
    childGraphCallId: nonEmpty(row["childGraphCallId"], "childGraphCallId"),
    childFrameId: nonEmpty(row["childFrameId"], "childFrameId"),
    frameLineageId: nonEmpty(row["frameLineageId"], "frameLineageId"),
    foldbackBinding: nonEmpty(row["foldbackBinding"], "foldbackBinding"),
    sourceOutputCarrierRef: nonEmpty(
      row["sourceOutputCarrierRef"],
      "sourceOutputCarrierRef"
    ),
    sourceOutputPayloadRef: nonEmpty(
      row["sourceOutputPayloadRef"],
      "sourceOutputPayloadRef"
    ),
    targetInputCarrierRef: nonEmpty(
      row["targetInputCarrierRef"],
      "targetInputCarrierRef"
    ),
    targetInputPayloadRef: nonEmpty(
      row["targetInputPayloadRef"],
      "targetInputPayloadRef"
    ),
    policyRef: nonEmpty(row["policyRef"], "policyRef"),
    policyDigest: sha256Digest(row["policyDigest"], "policyDigest"),
    budgetSourceFieldRef: nonEmpty(
      row["budgetSourceFieldRef"],
      "budgetSourceFieldRef"
    ),
    preservedEvidenceRefs: strings(
      row["preservedEvidenceRefs"],
      "preservedEvidenceRefs",
      { nonEmpty: true }
    ),
    foldbackEvidenceRefs: strings(
      row["foldbackEvidenceRefs"],
      "foldbackEvidenceRefs",
      { nonEmpty: true }
    )
  });
  for (const key of [
    "planRef",
    "bindingRef",
    "applicationOrdinal",
    "childInvocationRef",
    "childGraphCallId",
    "childFrameId",
    "frameLineageId",
    "foldbackBinding",
    "sourceOutputCarrierRef",
    "sourceOutputPayloadRef",
    "targetInputCarrierRef",
    "policyRef",
    "policyDigest",
    "budgetSourceFieldRef"
  ] as const) {
    if (outcome[key] !== input.request[key]) {
      throw new TypeError(`typed recurse foldback ${key} differs`);
    }
  }
  if (
    !containsEvery(
      outcome.preservedEvidenceRefs,
      input.request.requiredPreservedEvidenceRefs
    )
  ) {
    throw new TypeError("typed recurse foldback dropped prior evidence");
  }
  return outcome;
}

function failureReason(input: {
  readonly surface: string;
  readonly planRef: string;
  readonly applicationOrdinal: number;
  readonly error: unknown;
}): string {
  const message = input.error instanceof Error
    ? input.error.message
    : String(input.error);
  const digest = stableSha256Digest({
    surface: input.surface,
    planRef: input.planRef,
    applicationOrdinal: input.applicationOrdinal,
    message
  });
  return `reason://abg/typed-recurse/${input.surface}/${digest.slice("sha256:".length)}`;
}

function emitEvent(input: {
  readonly invocation: TypedRecurseInvocation;
  readonly emitted: TypedRecurseRuntimeEvent[];
  readonly event: TypedRecurseRuntimeEvent;
}): void {
  assertRuntimeEvent(input.event);
  input.emitted.push(input.event);
  input.invocation.emit(Object.freeze([input.event]));
}

function resolution(input: {
  readonly invocation: TypedRecurseInvocation;
  readonly projection: TypedRecurseReplayProjection;
  readonly emitted: readonly TypedRecurseRuntimeEvent[];
  readonly status?: "completed" | "pending" | "blocked" | undefined;
  readonly stopReason?: TypedRecurseStopReason | null | undefined;
  readonly reasonRef?: string | null | undefined;
}): TypedRecurseResolution {
  const status = input.status ?? input.projection.status;
  if (status === null) {
    throw new TypeError("typed recurse resolution requires terminal status");
  }
  return Object.freeze({
    kind: "typed_recurse_resolution" as const,
    status,
    stopReason: input.stopReason ?? input.projection.stopReason,
    planRef: input.invocation.plan.planRef,
    bindingRef: input.invocation.binding.bindingRef,
    frameLineageId: input.projection.frameLineageId,
    applicationsOpened: input.projection.applicationsOpened,
    currentInputPayloadRef: input.projection.currentInputPayloadRef,
    outputCarrierRef: input.invocation.plan.outputCarrierRef,
    outputPayloadRef: input.projection.outputPayloadRef,
    responseContractRef: input.projection.responseContractRef,
    reasonRef: input.reasonRef ?? input.projection.reasonRef,
    emittedEvents: Object.freeze([...input.emitted])
  });
}

export async function resolveTypedRecurse(
  invocation: TypedRecurseInvocation
): Promise<TypedRecurseResolution> {
  validateInvocation(invocation);
  const emitted: TypedRecurseRuntimeEvent[] = [];

  for (let pass = 0; pass < invocation.plan.maxApplications * 5 + 1; pass += 1) {
    const projection = projectReplay(invocation, [
      ...invocation.replayEvents,
      ...emitted
    ]);
    if (projection.stage === "terminal") {
      return resolution({ invocation, projection, emitted });
    }
    const causationEventRefs =
      projection.relevantEvents.length === 0
        ? invocation.causationEventRefs
        : Object.freeze([
            eventRef(
              projection.relevantEvents[
                projection.relevantEvents.length - 1
              ]!
            )
          ]);
    const common = eventCommon({
      invocation,
      frameLineageId: projection.frameLineageId,
      applicationOrdinal: projection.applicationOrdinal,
      causationEventRefs
    });

    if (projection.stage === "open") {
      if (projection.applicationOrdinal > invocation.plan.maxApplications) {
        return resolution({
          invocation,
          projection,
          emitted,
          status: "blocked",
          stopReason: "budget_exhausted",
          reasonRef: "reason://abg/typed-recurse/budget-exhausted"
        });
      }
      emitEvent({
        invocation,
        emitted,
        event: Object.freeze({
          kind: "typed_recurse_application_opened" as const,
          ...common,
          inputCarrierRef: invocation.plan.inputCarrierRef,
          inputPayloadRef: projection.currentInputPayloadRef
        })
      });
      continue;
    }

    const request = childRequest(invocation, projection);
    if (projection.stage === "child") {
      let outcome: TypedRecurseChildOutcome;
      try {
        outcome = admitChildOutcome({
          request,
          raw: await invocation.invokeChild(request)
        });
      } catch (error: unknown) {
        const reasonRef = failureReason({
          surface: "child",
          planRef: invocation.plan.planRef,
          applicationOrdinal: projection.applicationOrdinal,
          error
        });
        outcome = Object.freeze({
          kind: "typed_recurse_child_outcome" as const,
          planRef: request.planRef,
          bindingRef: request.bindingRef,
          applicationOrdinal: request.applicationOrdinal,
          childInvocationRef: request.childInvocationRef,
          childGraphCallId: request.childGraphCallId,
          childFrameId: request.childFrameId,
          disposition: "runtime_failed" as const,
          outputCarrierRef: request.outputCarrierRef,
          outputPayloadRef: null,
          responseContractRef: null,
          reasonRef,
          evidenceRefs: Object.freeze([
            `evidence://abg/typed-recurse/child-failure/${stableSha256Digest({ reasonRef }).slice("sha256:".length)}`
          ])
        });
      }
      emitEvent({
        invocation,
        emitted,
        event: Object.freeze({
          kind: "typed_recurse_child_result_admitted" as const,
          ...common,
          disposition: outcome.disposition,
          outputCarrierRef: outcome.outputCarrierRef,
          outputPayloadRef: outcome.outputPayloadRef,
          responseContractRef: outcome.responseContractRef,
          reasonRef: outcome.reasonRef,
          evidenceRefs: Object.freeze([...outcome.evidenceRefs])
        })
      });
      continue;
    }

    if (projection.stage === "termination") {
      const child = projection.child;
      if (child?.outputPayloadRef === null || child === null) {
        throw new TypeError("typed recurse termination lacks admitted child output");
      }
      const terminationRequest: TypedRecurseTerminationRequest = Object.freeze({
        kind: "typed_recurse_termination_request" as const,
        planRef: invocation.plan.planRef,
        bindingRef: invocation.binding.bindingRef,
        applicationOrdinal: projection.applicationOrdinal,
        childInvocationRef: common.childInvocationRef,
        childGraphCallId: common.childGraphCallId,
        childFrameId: common.childFrameId,
        outputCarrierRef: invocation.plan.outputCarrierRef,
        outputPayloadRef: child.outputPayloadRef,
        evaluatorBinding: invocation.plan.terminationEvaluatorBinding,
        evaluatorDigest: invocation.plan.terminationEvaluatorDigest,
        consumedFieldRefs: Object.freeze([
          ...invocation.plan.terminationConsumedFieldRefs
        ]),
        policyRef: invocation.plan.policyRef,
        policyDigest: invocation.plan.policyDigest,
        maxApplications: invocation.plan.maxApplications,
        priorEvidenceRefs: Object.freeze([...projection.priorEvidenceRefs])
      });
      let outcome: TypedRecurseTerminationOutcome;
      try {
        outcome = admitTerminationOutcome({
          request: terminationRequest,
          raw: await invocation.evaluateTermination(terminationRequest)
        });
      } catch (error: unknown) {
        const reasonRef = failureReason({
          surface: "termination",
          planRef: invocation.plan.planRef,
          applicationOrdinal: projection.applicationOrdinal,
          error
        });
        outcome = Object.freeze({
          kind: "typed_recurse_termination_outcome" as const,
          planRef: terminationRequest.planRef,
          bindingRef: terminationRequest.bindingRef,
          applicationOrdinal: terminationRequest.applicationOrdinal,
          childInvocationRef: terminationRequest.childInvocationRef,
          childGraphCallId: terminationRequest.childGraphCallId,
          childFrameId: terminationRequest.childFrameId,
          outputPayloadRef: terminationRequest.outputPayloadRef,
          evaluatorBinding: terminationRequest.evaluatorBinding,
          evaluatorDigest: terminationRequest.evaluatorDigest,
          decision: "blocked" as const,
          reasonRef,
          evidenceRefs: Object.freeze([
            `evidence://abg/typed-recurse/termination-failure/${stableSha256Digest({ reasonRef }).slice("sha256:".length)}`
          ])
        });
      }
      emitEvent({
        invocation,
        emitted,
        event: Object.freeze({
          kind: "typed_recurse_termination_evaluated" as const,
          ...common,
          outputPayloadRef: outcome.outputPayloadRef,
          evaluatorBinding: outcome.evaluatorBinding,
          evaluatorDigest: outcome.evaluatorDigest,
          decision: outcome.decision,
          reasonRef: outcome.reasonRef,
          evidenceRefs: Object.freeze([...outcome.evidenceRefs])
        })
      });
      continue;
    }

    if (projection.stage === "foldback") {
      const child = projection.child;
      if (child?.outputPayloadRef === null || child === null) {
        throw new TypeError("typed recurse foldback lacks admitted child output");
      }
      const foldbackRequest: TypedRecurseFoldbackRequest = Object.freeze({
        kind: "typed_recurse_foldback_request" as const,
        planRef: invocation.plan.planRef,
        bindingRef: invocation.binding.bindingRef,
        applicationOrdinal: projection.applicationOrdinal,
        childInvocationRef: common.childInvocationRef,
        childGraphCallId: common.childGraphCallId,
        childFrameId: common.childFrameId,
        frameLineageId: projection.frameLineageId,
        foldbackBinding: invocation.plan.foldbackBinding,
        foldbackAdditionalDigest: invocation.plan.foldbackAdditionalDigest,
        sourceOutputCarrierRef: invocation.plan.outputCarrierRef,
        sourceOutputPayloadRef: child.outputPayloadRef,
        targetInputCarrierRef: invocation.plan.inputCarrierRef,
        policyRef: invocation.plan.policyRef,
        policyDigest: invocation.plan.policyDigest,
        budgetSourceFieldRef: invocation.plan.budgetSourceFieldRef,
        maxApplications: invocation.plan.maxApplications,
        requiredPreservedEvidenceRefs: Object.freeze([
          ...projection.priorEvidenceRefs
        ])
      });
      let outcome: TypedRecurseFoldbackOutcome;
      try {
        outcome = admitFoldbackOutcome({
          request: foldbackRequest,
          raw: await invocation.applyFoldback(foldbackRequest)
        });
      } catch (error: unknown) {
        const reasonRef = failureReason({
          surface: "foldback",
          planRef: invocation.plan.planRef,
          applicationOrdinal: projection.applicationOrdinal,
          error
        });
        const evidenceRefs = Object.freeze([
          `evidence://abg/typed-recurse/foldback-failure/${stableSha256Digest({ reasonRef }).slice("sha256:".length)}`
        ]);
        emitEvent({
          invocation,
          emitted,
          event: Object.freeze({
            kind: "typed_recurse_foldback_rejected" as const,
            ...common,
            foldbackBinding: invocation.plan.foldbackBinding,
            sourceOutputCarrierRef: invocation.plan.outputCarrierRef,
            sourceOutputPayloadRef: child.outputPayloadRef,
            targetInputCarrierRef: invocation.plan.inputCarrierRef,
            policyRef: invocation.plan.policyRef,
            policyDigest: invocation.plan.policyDigest,
            budgetSourceFieldRef: invocation.plan.budgetSourceFieldRef,
            reasonRef,
            evidenceRefs
          })
        });
        continue;
      }
      emitEvent({
        invocation,
        emitted,
        event: Object.freeze({
          kind: "typed_recurse_foldback_admitted" as const,
          ...common,
          foldbackBinding: outcome.foldbackBinding,
          sourceOutputCarrierRef: outcome.sourceOutputCarrierRef,
          sourceOutputPayloadRef: outcome.sourceOutputPayloadRef,
          targetInputCarrierRef: outcome.targetInputCarrierRef,
          targetInputPayloadRef: outcome.targetInputPayloadRef,
          policyRef: outcome.policyRef,
          policyDigest: outcome.policyDigest,
          budgetSourceFieldRef: outcome.budgetSourceFieldRef,
          preservedEvidenceRefs: Object.freeze([
            ...outcome.preservedEvidenceRefs
          ]),
          foldbackEvidenceRefs: Object.freeze([
            ...outcome.foldbackEvidenceRefs
          ])
        })
      });
      continue;
    }

    if (projection.stage === "parent") {
      const foldback = projection.foldback;
      if (foldback === null) {
        throw new TypeError("typed recurse parent evaluation lacks foldback");
      }
      const expectedParentRebindEvidenceRef = parentRebindEvidenceRef({
        invocation,
        foldback
      });
      const admitted = foldback.foldbackEvidenceRefs.includes(
        expectedParentRebindEvidenceRef
      );
      const reasonRef = admitted
        ? null
        : `reason://abg/typed-recurse/parent-rebind-evidence-missing/${stableSha256Digest({
            expectedParentRebindEvidenceRef,
            actualFoldbackEvidenceRefs: foldback.foldbackEvidenceRefs
          }).slice("sha256:".length)}`;
      const evidenceRefs = stableUnion([
        projection.priorEvidenceRefs,
        [eventRef(foldback)],
        reasonRef === null
          ? []
          : [
              `evidence://abg/typed-recurse/parent-rebind-blocked/${stableSha256Digest({ reasonRef }).slice("sha256:".length)}`
            ]
      ]);
      emitEvent({
        invocation,
        emitted,
        event: Object.freeze({
          kind: "typed_recurse_parent_rebind_evaluated" as const,
          ...common,
          targetInputCarrierRef: foldback.targetInputCarrierRef,
          targetInputPayloadRef: foldback.targetInputPayloadRef,
          policyRef: invocation.plan.policyRef,
          policyDigest: invocation.plan.policyDigest,
          budgetSourceFieldRef: invocation.plan.budgetSourceFieldRef,
          decision: admitted ? "admitted" as const : "blocked" as const,
          reasonRef,
          evidenceRefs
        })
      });
      continue;
    }
  }

  throw new TypeError("typed recurse resolver exceeded its bounded stage count");
}
