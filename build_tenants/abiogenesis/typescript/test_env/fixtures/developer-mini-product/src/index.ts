import { createHash } from "node:crypto";

type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

interface ArtifactBasis {
  readonly productId: string;
  readonly artifactDigest: `sha256:${string}`;
  readonly productContentDigest: `sha256:${string}`;
  readonly productManifestDigest: `sha256:${string}`;
  readonly packageName: string;
  readonly packageVersion: string;
}

const PACKAGE_NAME = "@abiogenesis-fixtures/developer-mini-product";
const PACKAGE_VERSION = "5.0.0";

export const DEVELOPER_MINI_IDS = Object.freeze({
  moduleRef: "module://developer.example/greeting@5",
  programRef: "program://developer.example/greeting@5",
  startRef: "start://developer.example/greeting@5",
  graphFunctionRef: "graph-function://developer.example/greeting/render@5",
  graphRef: "graph://developer.example/greeting/render@5",
  nodeRef: "node://developer.example/greeting/render@5",
  ticketProgramRef: "program://developer.example/ticket/work@5",
  ticketStartRef: "start://developer.example/ticket/work@5",
  ticketGraphFunctionRef: "graph-function://developer.example/ticket/work@5",
  ticketGraphRef: "graph://developer.example/ticket/work@5",
  ticketNodeRef: "node://developer.example/ticket/work@5",
  ticketInputContractRef: "contract://developer.example/ticket/work-input@5",
  ticketOutputContractRef: "contract://developer.example/ticket/work-output@5",
  ticketClosureContractRef: "contract://developer.example/ticket/closure@5",
  ticketJudgmentPredicateRef:
    "predicate://developer.example/ticket/work-completed@5",
  ticketImplementationBindingRef:
    "implementation-binding://developer.example/ticket/work-fd@5",
  ticketImplementationRef:
    "implementation://developer.example/ticket/work-fd@5",
  spanProgramRef: "program://developer.example/greeting/span-reentry@5",
  spanStartRef: "start://developer.example/greeting/span-reentry@5",
  spanGraphFunctionRef:
    "graph-function://developer.example/greeting/span-reentry@5",
  spanGraphRef: "graph://developer.example/greeting/span-reentry@5",
  spanNodeRef: "node://developer.example/greeting/span-reentry@5",
  spanInitializeLocusRef:
    "locus://developer.example/greeting/span-reentry/initialize@5",
  spanTargetLocusRef:
    "locus://developer.example/greeting/span-reentry/target@5",
  spanSelectorLocusRef:
    "locus://developer.example/greeting/span-reentry/select@5",
  spanFinalizeLocusRef:
    "locus://developer.example/greeting/span-reentry/finalize@5",
  spanStateContractRef:
    "contract://developer.example/greeting/span-state@5",
  spanSelectionContractRef:
    "contract://developer.example/greeting/span-selection@5",
  spanJudgmentPredicateRef:
    "predicate://developer.example/greeting/span-valid@5",
  spanInitializeImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-initialize@5",
  spanInitializeImplementationRef:
    "implementation://developer.example/greeting/span-initialize@5",
  spanTargetImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-target@5",
  spanTargetImplementationRef:
    "implementation://developer.example/greeting/span-target@5",
  spanSelectorImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-select@5",
  spanSelectorImplementationRef:
    "implementation://developer.example/greeting/span-select@5",
  spanSelectorRepeatImplementationRef:
    "implementation://developer.example/greeting/span-select-repeat@5",
  spanFinalizeImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-finalize@5",
  spanFinalizeImplementationRef:
    "implementation://developer.example/greeting/span-finalize@5",
  inputContractRef: "contract://developer.example/greeting/input@5",
  outputContractRef: "contract://developer.example/greeting/output@5",
  evidenceContractRef: "contract://developer.example/greeting/evidence@5",
  failureContractRef: "contract://developer.example/greeting/failure@5",
  refusalContractRef: "contract://developer.example/greeting/refusal@5",
  judgmentContractRef: "contract://developer.example/greeting/judgment@5",
  transitionContractRef: "contract://developer.example/greeting/transition@5",
  closureContractRef: "contract://developer.example/greeting/closure@5",
  judgmentPredicateRef: "predicate://developer.example/greeting/satisfied@5",
  implementationBindingRef:
    "implementation-binding://developer.example/greeting/render-fd@5",
  implementationRef: "implementation://developer.example/greeting/render-fd@5",
  identityProgramRef:
    "program://developer.example/greeting/identity-then-render@5",
  identityGraphFunctionRef:
    "graph-function://developer.example/greeting/identity-then-render@5",
  identityGraphRef:
    "graph://developer.example/greeting/identity-then-render@5",
  identityNodeRef:
    "node://developer.example/greeting/identity-then-render/identity@5",
  identityResultNodeRef:
    "node://developer.example/greeting/identity-then-render/result@5",
  mixedProgramRef: "program://developer.example/greeting/mixed-fibres@5",
  mixedGraphFunctionRef:
    "graph-function://developer.example/greeting/mixed-fibres@5",
  mixedGraphRef: "graph://developer.example/greeting/mixed-fibres@5",
  mixedNodeRef: "node://developer.example/greeting/mixed-fibres@5",
  mixedCompositionRef:
    "composition://developer.example/greeting/fd-fp-fh@5",
  deterministicLocusRef:
    "locus://developer.example/greeting/mixed-fibres/fd@5",
  probabilisticLocusRef:
    "locus://developer.example/greeting/mixed-fibres/fp@5",
  interactionLocusRef:
    "locus://developer.example/greeting/mixed-fibres/fh@5",
  probabilisticEvidenceContractRef:
    "contract://developer.example/greeting/probabilistic-evidence@5",
  continuationContractRef:
    "contract://developer.example/greeting/continuation@5",
  mixedClosureContractRef:
    "contract://developer.example/greeting/mixed-closure@5",
  oneSurfaceProgramRef:
    "program://developer.example/greeting/one-surface@5",
  oneSurfaceStartRef:
    "start://developer.example/greeting/one-surface@5",
  oneSurfaceGraphFunctionRef:
    "graph-function://developer.example/greeting/one-surface@5",
  oneSurfaceGraphRef:
    "graph://developer.example/greeting/one-surface@5",
  oneSurfaceNodeRef:
    "node://developer.example/greeting/one-surface@5",
  oneSurfaceCompositionRef:
    "composition://developer.example/greeting/one-surface@5",
  observationContractRef:
    "contract://developer.example/greeting/observation-snapshot@5",
  modelContractRef:
    "contract://developer.example/greeting/modeled-observation-snapshot@5",
  gapContractRef:
    "contract://developer.example/greeting/next-action-basis@5",
  nextActionContractRef:
    "contract://developer.example/greeting/next-action@5",
  approvalContractRef:
    "contract://developer.example/greeting/human-approval@5",
  actionEvaluationBasisContractRef:
    "contract://developer.example/greeting/action-evaluation-basis@5",
  actionEvaluationContractRef:
    "contract://developer.example/greeting/action-evaluation@5",
  refreshedModelContractRef:
    "contract://developer.example/greeting/refreshed-observation-snapshot@5",
  refreshedGapContractRef:
    "contract://developer.example/greeting/refreshed-next-action-basis@5",
  convergenceContractRef:
    "contract://developer.example/greeting/converged-next-action@5",
  oneSurfaceClosureContractRef:
    "contract://developer.example/greeting/one-surface-closure@5",
  targetOutcomeRef:
    "outcome://developer.example/greeting/approved-welcome@5",
  greetingAssetRef:
    "asset://developer.example/greeting/welcome-message@5",
  greetingAssetHandle: "greeting",
  approvalAssetRef:
    "asset://developer.example/greeting/human-approval@5",
  approvalCapabilityAssetRef:
    "asset://developer.example/greeting/human-approval-capability@5",
  approvalObligationRef:
    "obligation://developer.example/greeting/human-approval@5",
  approvalActionRef:
    "action://developer.example/greeting/request-human-approval@5",
  approvalExpectedDeltaRef:
    "delta://developer.example/greeting/human-approval-recorded@5",
  approvalProgressConditionRef:
    "condition://developer.example/greeting/approval-response-admitted@5",
  approvalStopConditionRef:
    "condition://developer.example/greeting/action-evaluated@5",
  gapStopReasonRef:
    "reason://developer.example/greeting/no-admitted-human-action@5",
  prioritySchemeRef:
    "priority-scheme://developer.example/greeting/obligation-first@5",
  closurePolicyRef:
    "closure-policy://developer.example/greeting/complete-evidence-refresh@5",
  synthesizeModelAuthorityRef:
    "semantic-authority://developer.example/greeting/synthesize-model@5",
  evalGapAuthorityRef:
    "semantic-authority://developer.example/greeting/eval-gap@5",
  evaluateNextAuthorityRef:
    "semantic-authority://developer.example/greeting/evaluate-next@5",
  evaluateActionAuthorityRef:
    "semantic-authority://developer.example/greeting/evaluate-action@5",
  synthesizeModelLocusRef:
    "locus://developer.example/greeting/synthesize-model@5",
  evalGapLocusRef:
    "locus://developer.example/greeting/eval-gap@5",
  evaluateNextLocusRef:
    "locus://developer.example/greeting/evaluate-next@5",
  evaluateActionLocusRef:
    "locus://developer.example/greeting/evaluate-action@5",
  refreshModelLocusRef:
    "locus://developer.example/greeting/refresh-model@5",
  refreshGapLocusRef:
    "locus://developer.example/greeting/refresh-gap@5",
  refreshEvaluateNextLocusRef:
    "locus://developer.example/greeting/refresh-evaluate-next@5",
  preservePredicateRef:
    "predicate://developer.example/greeting/preserved@5",
  semanticStagePredicateRef:
    "predicate://developer.example/greeting/semantic-stage-valid@5",
  synthesizeModelImplementationBindingRef:
    "implementation-binding://developer.example/greeting/synthesize-model@5",
  synthesizeModelImplementationRef:
    "implementation://developer.example/greeting/synthesize-model@5",
  probabilisticImplementationBindingRef:
    "implementation-binding://developer.example/greeting/pass-fp@5",
  probabilisticImplementationRef:
    "implementation://developer.example/greeting/pass-fp@5",
  deterministicPassImplementationBindingRef:
    "implementation-binding://developer.example/greeting/pass-fd@5",
  deterministicPassImplementationRef:
    "implementation://developer.example/greeting/pass-fd@5",
  evalGapImplementationBindingRef:
    "implementation-binding://developer.example/greeting/eval-gap@5",
  evalGapImplementationRef:
    "implementation://developer.example/greeting/eval-gap@5",
  evalGapSubstitutedPolicyImplementationRef:
    "implementation://developer.example/greeting/eval-gap-substituted-policy-mutation@5",
  evaluateNextImplementationBindingRef:
    "implementation-binding://developer.example/greeting/evaluate-next@5",
  evaluateNextImplementationRef:
    "implementation://developer.example/greeting/evaluate-next@5",
  evaluateNextMissingActionImplementationRef:
    "implementation://developer.example/greeting/evaluate-next-missing-action-mutation@5",
  evaluateActionImplementationBindingRef:
    "implementation-binding://developer.example/greeting/evaluate-action@5",
  evaluateActionImplementationRef:
    "implementation://developer.example/greeting/evaluate-action@5",
  evaluateActionScalarImplementationRef:
    "implementation://developer.example/greeting/evaluate-action-scalar-mutation@5",
  evaluateActionIncompleteEvidenceImplementationRef:
    "implementation://developer.example/greeting/evaluate-action-incomplete-evidence-mutation@5",
  evaluateActionSubstitutedWorkspaceImplementationRef:
    "implementation://developer.example/greeting/evaluate-action-substituted-workspace-mutation@5",
  evaluateActionSubstitutedArchiveImplementationRef:
    "implementation://developer.example/greeting/evaluate-action-substituted-archive-mutation@5",
  refreshModelImplementationBindingRef:
    "implementation-binding://developer.example/greeting/refresh-model@5",
  refreshModelImplementationRef:
    "implementation://developer.example/greeting/refresh-model@5",
  refreshGapImplementationBindingRef:
    "implementation-binding://developer.example/greeting/refresh-gap@5",
  refreshGapImplementationRef:
    "implementation://developer.example/greeting/refresh-gap@5",
  refreshEvaluateNextImplementationBindingRef:
    "implementation-binding://developer.example/greeting/refresh-evaluate-next@5",
  refreshEvaluateNextImplementationRef:
    "implementation://developer.example/greeting/refresh-evaluate-next@5",
  interactionKind: "developer_greeting_approval",
  actorCapabilityRef:
    "capability://developer.example/greeting/approve@5",
  workerActorRef: "actor://developer.example/greeting/worker@5",
  workerBindingRef: "worker-binding://developer.example/greeting/pass@5",
  materializationPlanRef:
    "prompt-plan://developer.example/greeting/pass@5",
  rendererRef: "renderer://developer.example/greeting/pass@5",
  semanticsBindingRef: "product-semantics://developer.example/greeting@5",
});

function canonicalJson(value: JsonValue): string {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.entries(value)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(",")}}`;
}

function sha256Canonical(value: JsonValue): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function developerConstructionPolicy(): Readonly<Record<string, JsonValue>> {
  return deepFreeze({
    kind: "construction_policy",
    policyRef: DEVELOPER_MINI_IDS.closurePolicyRef,
    requireCompleteEvidence: true,
    requirePostEvidenceRefresh: true,
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isGreetingInput(value: unknown): value is Readonly<{
  kind: "developer_greeting_input";
  schemaVersion: "5.0.0";
  name: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "name", "schemaVersion"]) &&
    value.kind === "developer_greeting_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.name === "string" &&
    value.name.trim().length > 0;
}

function isGreetingOutput(value: unknown): value is Readonly<{
  kind: "developer_greeting_output";
  schemaVersion: "5.0.0";
  message: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "message", "schemaVersion"]) &&
    value.kind === "developer_greeting_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.message === "string" &&
    value.message.length > 0;
}

function isTicketWorkInput(value: unknown): value is Readonly<{
  kind: "developer_ticket_work_input";
  schemaVersion: "5.0.0";
  ticketRef: string;
  requestedOutcome: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "requestedOutcome",
      "schemaVersion",
      "ticketRef",
    ]) &&
    value.kind === "developer_ticket_work_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.ticketRef === "string" &&
    value.ticketRef.length > 0 &&
    typeof value.requestedOutcome === "string" &&
    value.requestedOutcome.length > 0;
}

function isTicketWorkOutput(value: unknown): value is Readonly<{
  kind: "developer_ticket_work_output";
  schemaVersion: "5.0.0";
  ticketRef: string;
  disposition: "completed";
  summary: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "disposition",
      "kind",
      "schemaVersion",
      "summary",
      "ticketRef",
    ]) &&
    value.kind === "developer_ticket_work_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.ticketRef === "string" &&
    value.ticketRef.length > 0 &&
    value.disposition === "completed" &&
    typeof value.summary === "string" &&
    value.summary.length > 0;
}

interface DeveloperSpanState {
  readonly kind: "developer_span_state";
  readonly schemaVersion: "5.0.0";
  readonly name: string;
  readonly targetVisits: number;
  readonly reentryApplications: number;
}

interface DeveloperSpanContinuation {
  readonly kind: "graph_span_selection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "continue";
  readonly state: DeveloperSpanState;
}

interface DeveloperGraphSpanReentryProjection {
  readonly kind: "graph_span_selection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "re_enter";
  readonly projectionRef: string;
  readonly projectionDigest: `sha256:${string}`;
  readonly applicationRef: string;
  readonly graphFunctionRef: string;
  readonly sourceProgramLocusRef: string;
  readonly targetProgramLocusRef: string;
  readonly targetInputRef: string;
  readonly targetInputDigest: `sha256:${string}`;
  readonly targetInput: DeveloperSpanState;
}

function isSpanState(value: unknown): value is Readonly<DeveloperSpanState> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "name",
      "reentryApplications",
      "schemaVersion",
      "targetVisits",
    ]) &&
    value.kind === "developer_span_state" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    Number.isSafeInteger(value.targetVisits) &&
    Number(value.targetVisits) >= 0 &&
    Number.isSafeInteger(value.reentryApplications) &&
    Number(value.reentryApplications) >= 0;
}

function isGraphSpanReentryProjection(
  value: unknown,
): value is Readonly<DeveloperGraphSpanReentryProjection> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "applicationRef",
      "disposition",
      "graphFunctionRef",
      "kind",
      "projectionDigest",
      "projectionRef",
      "schemaVersion",
      "sourceProgramLocusRef",
      "targetInput",
      "targetInputDigest",
      "targetInputRef",
      "targetProgramLocusRef",
    ]) ||
    value.kind !== "graph_span_selection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "re_enter" ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.applicationRef !== "string" ||
    typeof value.graphFunctionRef !== "string" ||
    typeof value.sourceProgramLocusRef !== "string" ||
    typeof value.targetProgramLocusRef !== "string" ||
    typeof value.targetInputRef !== "string" ||
    typeof value.targetInputDigest !== "string" ||
    !isSpanState(value.targetInput)
  ) {
    return false;
  }
  const {
    projectionRef,
    projectionDigest,
    ...body
  } = value;
  const targetInputDigest = sha256Canonical(value.targetInput);
  return projectionDigest === sha256Canonical(body as JsonValue) &&
    projectionRef ===
      `graph-span-reentry-projection://product/${projectionDigest.slice("sha256:".length)}` &&
    value.targetInputDigest === targetInputDigest &&
    value.targetInputRef ===
      `graph-span-input://product/${targetInputDigest.slice("sha256:".length)}`;
}

function isSpanContinuation(
  value: unknown,
): value is Readonly<DeveloperSpanContinuation> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "disposition",
      "kind",
      "schemaVersion",
      "state",
    ]) &&
    value.kind === "graph_span_selection" &&
    value.schemaVersion === "5.0.0" &&
    value.disposition === "continue" &&
    isSpanState(value.state);
}

function isSpanSelection(value: unknown): boolean {
  return isGraphSpanReentryProjection(value) || isSpanContinuation(value);
}

type DeveloperCorrectionDisposition =
  | "repair"
  | "inspect_runtime_archive"
  | "reprice"
  | "escalate";

type DeveloperNoActionDisposition =
  | "gap_stop"
  | "reprice_required"
  | DeveloperCorrectionDisposition;

type DeveloperChangeAuthorityState =
  | "unchanged"
  | "requires_reprice"
  | "repair_required"
  | "runtime_archive_inspection_required"
  | "reprice_authorized"
  | "escalation_required";

function isDeveloperNoActionDisposition(
  value: unknown,
): value is DeveloperNoActionDisposition {
  return value === "gap_stop" ||
    value === "reprice_required" ||
    value === "repair" ||
    value === "inspect_runtime_archive" ||
    value === "reprice" ||
    value === "escalate";
}

function isDeveloperCorrectionDisposition(
  value: unknown,
): value is DeveloperCorrectionDisposition {
  return value === "repair" ||
    value === "inspect_runtime_archive" ||
    value === "reprice" ||
    value === "escalate";
}

function isDeveloperChangeAuthorityState(
  value: unknown,
): value is DeveloperChangeAuthorityState {
  return value === "unchanged" ||
    value === "requires_reprice" ||
    value === "repair_required" ||
    value === "runtime_archive_inspection_required" ||
    value === "reprice_authorized" ||
    value === "escalation_required";
}

function noActionReasonRef(
  disposition: DeveloperNoActionDisposition,
): string {
  switch (disposition) {
    case "gap_stop":
      return DEVELOPER_MINI_IDS.gapStopReasonRef;
    case "reprice_required":
      return "reason://developer.example/greeting/constitutional-reprice-required@5";
    case "repair":
      return "reason://developer.example/greeting/correction-repair-admitted@5";
    case "inspect_runtime_archive":
      return "reason://developer.example/greeting/runtime-archive-inspection-admitted@5";
    case "reprice":
      return "reason://developer.example/greeting/reprice-authorized@5";
    case "escalate":
      return "reason://developer.example/greeting/escalation-admitted@5";
  }
}

function correctionForAuthorityState(
  state: DeveloperChangeAuthorityState,
): DeveloperCorrectionDisposition | null {
  switch (state) {
    case "repair_required":
      return "repair";
    case "runtime_archive_inspection_required":
      return "inspect_runtime_archive";
    case "reprice_authorized":
      return "reprice";
    case "escalation_required":
      return "escalate";
    case "unchanged":
    case "requires_reprice":
      return null;
  }
}

function isProductAssetModel(value: unknown): value is Readonly<{
  kind: "developer_product_asset_model";
  schemaVersion: "5.0.0";
  modelRef: string;
  targetOutcomeRef: string;
  subjectName: string;
  assetRefs: readonly string[];
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "assetRefs",
      "kind",
      "modelRef",
      "schemaVersion",
      "subjectName",
      "targetOutcomeRef",
    ]) &&
    value.kind === "developer_product_asset_model" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.modelRef === "string" &&
    value.targetOutcomeRef === DEVELOPER_MINI_IDS.targetOutcomeRef &&
    typeof value.subjectName === "string" &&
    value.subjectName.length > 0 &&
    Array.isArray(value.assetRefs) &&
    (
      value.assetRefs.join("\0") === DEVELOPER_MINI_IDS.greetingAssetRef ||
      value.assetRefs.join("\0") === [
        DEVELOPER_MINI_IDS.greetingAssetRef,
        DEVELOPER_MINI_IDS.approvalAssetRef,
      ].join("\0")
    );
}

function isGapProjection(value: unknown): value is Readonly<{
  kind: "developer_gap_projection";
  schemaVersion: "5.0.0";
  gapRef: string;
  modelRef: string;
  targetOutcomeRef: string;
  pressure: "constitutional_reprice_required" | "human_approval_required";
  obligationRefs: readonly string[];
  inputAssetRefs: readonly string[];
  missingAssetRefs: readonly string[];
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "gapRef",
      "inputAssetRefs",
      "kind",
      "missingAssetRefs",
      "modelRef",
      "obligationRefs",
      "pressure",
      "schemaVersion",
      "targetOutcomeRef",
    ]) &&
    value.kind === "developer_gap_projection" &&
    value.schemaVersion === "5.0.0" &&
    (
      value.pressure === "human_approval_required" ||
      value.pressure === "constitutional_reprice_required"
    ) &&
    typeof value.gapRef === "string" &&
    typeof value.modelRef === "string" &&
    value.targetOutcomeRef === DEVELOPER_MINI_IDS.targetOutcomeRef &&
    Array.isArray(value.obligationRefs) &&
    value.obligationRefs.length === 1 &&
    value.obligationRefs[0] === DEVELOPER_MINI_IDS.approvalObligationRef &&
    Array.isArray(value.inputAssetRefs) &&
    value.inputAssetRefs.length === 1 &&
    value.inputAssetRefs[0] === DEVELOPER_MINI_IDS.greetingAssetRef &&
    Array.isArray(value.missingAssetRefs) &&
    (
      value.missingAssetRefs.length === 0 ||
      (
        value.missingAssetRefs.length === 1 &&
        value.missingAssetRefs[0] ===
          DEVELOPER_MINI_IDS.approvalCapabilityAssetRef
      )
    );
}

function isDeveloperActionCatalog(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "catalogDigest",
      "catalogRef",
      "kind",
      "rows",
      "schemaVersion",
    ]) ||
    value.kind !== "action_catalog" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.catalogRef !== "string" ||
    typeof value.catalogDigest !== "string" ||
    !Array.isArray(value.rows) ||
    value.rows.length !== 1 ||
    !isRecord(value.rows[0])
  ) {
    return false;
  }
  const row = value.rows[0];
  if (
    !hasExactKeys(row, [
      "actionKind",
      "actionRef",
      "expectedDeltaRef",
      "graphFunctionRef",
      "inputAssetRefs",
      "kind",
      "outputAssetRefs",
      "programRef",
      "progressConditionRef",
      "stopConditionRef",
      "targetObligationRefs",
      "targetProgramLocusRef",
    ]) ||
    row.kind !== "action_catalog_row" ||
    row.actionRef !== DEVELOPER_MINI_IDS.approvalActionRef ||
    row.actionKind !== "request_human_input" ||
    row.programRef !== DEVELOPER_MINI_IDS.oneSurfaceProgramRef ||
    row.graphFunctionRef !== DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef ||
    row.targetProgramLocusRef !== DEVELOPER_MINI_IDS.interactionLocusRef ||
    row.expectedDeltaRef !== DEVELOPER_MINI_IDS.approvalExpectedDeltaRef ||
    row.progressConditionRef !==
      DEVELOPER_MINI_IDS.approvalProgressConditionRef ||
    row.stopConditionRef !== DEVELOPER_MINI_IDS.approvalStopConditionRef ||
    !Array.isArray(row.targetObligationRefs) ||
    row.targetObligationRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(row.inputAssetRefs) ||
    row.inputAssetRefs.join("\0") !== DEVELOPER_MINI_IDS.greetingAssetRef ||
    !Array.isArray(row.outputAssetRefs) ||
    row.outputAssetRefs.join("\0") !== DEVELOPER_MINI_IDS.approvalAssetRef
  ) {
    return false;
  }
  const { catalogRef, catalogDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return catalogDigest === expectedDigest &&
    catalogRef ===
      `action-catalog://product/${expectedDigest.slice("sha256:".length)}`;
}

function isObservationSnapshot(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "actionCatalog",
      "availableActionRefs",
      "changeAuthorityState",
      "constructionState",
      "kind",
      "observedInput",
      "productAssetModel",
      "priorGap",
      "snapshotDigest",
      "snapshotRef",
      "schemaVersion",
      "targetObligationRefs",
      "targetOutcomeRef",
      "workspaceBinding",
    ]) ||
    value.kind !== "observation_snapshot" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.snapshotRef !== "string" ||
    typeof value.snapshotDigest !== "string" ||
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    !isGreetingInput(value.observedInput) ||
    !isDeveloperChangeAuthorityState(value.changeAuthorityState) ||
    !isDeveloperActionCatalog(value.actionCatalog) ||
    !Array.isArray(value.availableActionRefs) ||
    value.availableActionRefs.some(
      (actionRef) =>
        actionRef !== DEVELOPER_MINI_IDS.approvalActionRef,
    ) ||
    !isRecord(value.workspaceBinding) ||
    !hasExactKeys(value.workspaceBinding, [
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    typeof value.workspaceBinding.workspaceBindingId !== "string" ||
    typeof value.workspaceBinding.workspaceBindingDigest !== "string" ||
    !Array.isArray(value.targetObligationRefs) ||
    value.targetObligationRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    (
      value.productAssetModel !== null &&
      !isProductAssetModel(value.productAssetModel)
    ) ||
    (
      value.priorGap !== null &&
      (
        !isRecord(value.priorGap) ||
        !hasExactKeys(value.priorGap, [
          "gapRef",
          "nextActionProjectionDigest",
          "nextActionProjectionRef",
          "sourceRouteRef",
          "sourceRunId",
        ]) ||
        typeof value.priorGap.gapRef !== "string" ||
        typeof value.priorGap.nextActionProjectionDigest !== "string" ||
        typeof value.priorGap.nextActionProjectionRef !== "string" ||
        typeof value.priorGap.sourceRouteRef !== "string" ||
        typeof value.priorGap.sourceRunId !== "string"
      )
    ) ||
    (
      value.constructionState !== null &&
      (
        !isRecord(value.constructionState) ||
        !hasExactKeys(value.constructionState, [
          "actionEvaluationRef",
          "constructionIntentRef",
          "correctionDisposition",
          "edgeClosureDecisionRef",
          "runtimeArchiveInspectionRef",
        ]) ||
        typeof value.constructionState.actionEvaluationRef !== "string" ||
        typeof value.constructionState.constructionIntentRef !== "string" ||
        typeof value.constructionState.edgeClosureDecisionRef !== "string" ||
        (
          value.constructionState.correctionDisposition !== null &&
          !isDeveloperNoActionDisposition(
            value.constructionState.correctionDisposition,
          )
        ) ||
        (
          value.constructionState.runtimeArchiveInspectionRef !== null &&
          typeof value.constructionState.runtimeArchiveInspectionRef !==
            "string"
        )
      )
    )
  ) {
    return false;
  }
  const { snapshotRef, snapshotDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return snapshotDigest === expectedDigest &&
    snapshotRef ===
      `observation-snapshot://product/${expectedDigest.slice("sha256:".length)}`;
}

function observationSnapshot(
  body: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> {
  const snapshotDigest = sha256Canonical(body as JsonValue);
  return deepFreeze({
    ...body,
    snapshotRef:
      `observation-snapshot://product/${snapshotDigest.slice("sha256:".length)}`,
    snapshotDigest,
  });
}

function observationHasAction(
  snapshot: Readonly<Record<string, JsonValue>>,
  actionRef: string,
): boolean {
  return Array.isArray(snapshot.availableActionRefs) &&
    snapshot.availableActionRefs.includes(actionRef);
}

function targetObligationBinding(
  snapshotRef: JsonValue,
  disposition: "bound" | "fulfilled" | "unbound",
  eligibleActionRefs: readonly string[],
  unboundReasonRef: string = DEVELOPER_MINI_IDS.gapStopReasonRef,
): Readonly<Record<string, JsonValue>> {
  return deepFreeze({
    kind: "target_obligation_binding",
    obligationRef: DEVELOPER_MINI_IDS.approvalObligationRef,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    snapshotRef,
    disposition,
    eligibleActionRefs,
    reasonRef: disposition === "bound"
      ? "reason://developer.example/greeting/action-bound@5"
      : disposition === "fulfilled"
        ? "reason://developer.example/greeting/obligation-fulfilled@5"
        : unboundReasonRef,
  });
}

function priorityProjection(
  orderedActionRefs: readonly string[],
): Readonly<Record<string, JsonValue>> {
  return deepFreeze({
    kind: "deterministic_priority_projection",
    schemeRef: DEVELOPER_MINI_IDS.prioritySchemeRef,
    orderedActionRefs,
  });
}

export function constructDeveloperObservationSnapshot(input: Readonly<{
  workspaceBindingId: string;
  workspaceBindingDigest: `sha256:${string}`;
  actionCatalog: Readonly<Record<string, JsonValue>>;
  availableActionRefs?: readonly string[];
  changeAuthorityState?: DeveloperChangeAuthorityState;
  name: string;
  priorGap?: Readonly<{
    gapRef: string;
    nextActionProjectionDigest: string;
    nextActionProjectionRef: string;
    sourceRouteRef: string;
    sourceRunId: string;
  }> | null;
}>): Readonly<Record<string, JsonValue>> {
  const candidate = observationSnapshot({
    kind: "observation_snapshot",
    schemaVersion: "5.0.0",
    workspaceBinding: {
      workspaceBindingId: input.workspaceBindingId,
      workspaceBindingDigest: input.workspaceBindingDigest,
    },
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    targetObligationRefs: [
      DEVELOPER_MINI_IDS.approvalObligationRef,
    ],
    actionCatalog: input.actionCatalog,
    availableActionRefs: input.availableActionRefs ?? [
      DEVELOPER_MINI_IDS.approvalActionRef,
    ],
    changeAuthorityState: input.changeAuthorityState ?? "unchanged",
    constructionState: null,
    observedInput: {
      kind: "developer_greeting_input",
      schemaVersion: "5.0.0",
      name: input.name.trim(),
    },
    priorGap: input.priorGap ?? null,
    productAssetModel: null,
  });
  if (!isObservationSnapshot(candidate)) {
    throw new TypeError(
      "developer observation requires its exact workspace, catalog, and Product input",
    );
  }
  return candidate;
}

function isNextActionBasis(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "admittedActionCatalog",
      "basisDigest",
      "basisRef",
      "declaredPolicy",
      "gapProjection",
      "kind",
      "observationSnapshot",
      "priorityScheme",
      "runtimeFrontier",
      "schemaVersion",
      "targetObligationRefs",
    ]) ||
    value.kind !== "next_action_basis" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.basisRef !== "string" ||
    typeof value.basisDigest !== "string" ||
    !isObservationSnapshot(value.observationSnapshot) ||
    (
      !isGapProjection(value.gapProjection) &&
      !isRefreshedGapProjection(value.gapProjection)
    ) ||
    !isDeveloperActionCatalog(value.admittedActionCatalog) ||
    !isRecord(value.priorityScheme) ||
    !isRecord(value.runtimeFrontier) ||
    !isRecord(value.declaredPolicy) ||
    !Array.isArray(value.targetObligationRefs) ||
    value.targetObligationRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalObligationRef
  ) {
    return false;
  }
  const snapshot = value.observationSnapshot;
  const gap = value.gapProjection;
  if (
    !isRecord(snapshot.productAssetModel) ||
    sha256Canonical(value.admittedActionCatalog as JsonValue) !==
      sha256Canonical(snapshot.actionCatalog as JsonValue) ||
    gap.modelRef !== snapshot.productAssetModel.modelRef ||
    value.priorityScheme.kind !== "construction_priority_scheme" ||
    value.priorityScheme.schemeRef !==
      DEVELOPER_MINI_IDS.prioritySchemeRef ||
    value.runtimeFrontier.kind !== "runtime_frontier" ||
    !["initial", "post_evidence"].includes(
      String(value.runtimeFrontier.phase),
    ) ||
    value.runtimeFrontier.snapshotRef !== snapshot.snapshotRef ||
    !Array.isArray(value.runtimeFrontier.openObligationRefs) ||
    value.declaredPolicy.kind !== "construction_policy" ||
    typeof value.declaredPolicy.policyRef !== "string" ||
    value.declaredPolicy.policyRef.length === 0 ||
    typeof value.declaredPolicy.requireCompleteEvidence !== "boolean" ||
    typeof value.declaredPolicy.requirePostEvidenceRefresh !== "boolean"
  ) {
    return false;
  }
  if (
    (
      value.runtimeFrontier.phase === "initial"
        ? value.runtimeFrontier.openObligationRefs.join("\0") !==
            DEVELOPER_MINI_IDS.approvalObligationRef ||
          !isGapProjection(gap)
        : value.runtimeFrontier.openObligationRefs.length !== 0 ||
          !isRefreshedGapProjection(gap)
    )
  ) {
    return false;
  }
  const { basisRef, basisDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return basisDigest === expectedDigest &&
    basisRef ===
      `next-action-basis://product/${expectedDigest.slice("sha256:".length)}`;
}

function isActionEvaluationBasis(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "actionCatalog",
      "admittedEvidence",
      "basisDigest",
      "basisRef",
      "closurePolicy",
      "constructionIntent",
      "kind",
      "nextActionBasis",
      "runtimeEvidenceEventRefs",
      "schemaVersion",
      "workspaceBinding",
    ]) ||
    value.kind !== "action_evaluation_basis" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.basisRef !== "string" ||
    typeof value.basisDigest !== "string" ||
    !isRecord(value.constructionIntent) ||
    !isNextActionBasis(value.nextActionBasis) ||
    !isRecord(value.workspaceBinding) ||
    !isRecord(value.actionCatalog) ||
    !isRecord(value.closurePolicy) ||
    !Array.isArray(value.admittedEvidence) ||
    value.admittedEvidence.length !== 1 ||
    !isRecord(value.admittedEvidence[0]) ||
    !Array.isArray(value.runtimeEvidenceEventRefs) ||
    value.runtimeEvidenceEventRefs.length !== 4 ||
    new Set(value.runtimeEvidenceEventRefs).size !== 4
  ) {
    return false;
  }
  const intent = value.constructionIntent;
  const evidence = value.admittedEvidence[0];
  if (
    typeof intent.constructionIntentRef !== "string" ||
    typeof intent.constructionIntentDigest !== "string" ||
    intent.nextActionBasisRef !== value.nextActionBasis.basisRef ||
    intent.nextActionBasisDigest !== value.nextActionBasis.basisDigest ||
    evidence.kind !== "admitted_semantic_evidence" ||
    !isHumanApproval(evidence.responseValue) ||
    evidence.responseValue.constructionIntentRef !==
      intent.constructionIntentRef ||
    typeof evidence.responseRef !== "string" ||
    typeof evidence.responseDigest !== "string" ||
    evidence.responseDigest !==
      sha256Canonical(evidence.responseValue as JsonValue) ||
    !Array.isArray(evidence.semanticEvidenceAssetRefs) ||
    evidence.semanticEvidenceAssetRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalAssetRef ||
    value.workspaceBinding.workspaceBindingId !==
      intent.workspaceBindingId ||
    value.workspaceBinding.workspaceBindingDigest !==
      intent.workspaceBindingDigest ||
    value.actionCatalog.actionCatalogRef !== intent.actionCatalogRef ||
    value.actionCatalog.actionCatalogDigest !== intent.actionCatalogDigest ||
    value.actionCatalog.actionCatalogRowDigest !==
      intent.actionCatalogRowDigest ||
    value.closurePolicy.kind !== "construction_policy" ||
    value.closurePolicy.policyRef !== DEVELOPER_MINI_IDS.closurePolicyRef ||
    value.closurePolicy.requireCompleteEvidence !== true ||
    value.closurePolicy.requirePostEvidenceRefresh !== true
  ) {
    return false;
  }
  const { basisRef, basisDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return basisDigest === expectedDigest &&
    basisRef ===
      `action-evaluation-basis://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
}

const NEXT_ACTION_KEYS = Object.freeze([
  "actionKind",
  "disposition",
  "expectedDeltaRef",
  "gapRef",
  "graphFunctionRef",
  "inputAssetRefs",
  "kind",
  "lawfulBasisRefs",
  "nextActionBasisDigest",
  "nextActionBasisRef",
  "outputAssetRefs",
  "programRef",
  "progressConditionRef",
  "priorityProjection",
  "projectionDigest",
  "projectionRef",
  "rejectedAlternativeRefs",
  "schemaVersion",
  "selectedActionRef",
  "stopConditionRef",
  "targetObligationRefs",
  "targetObligationBindings",
  "targetOutcomeRef",
  "targetProgramLocusRef",
]);

function isNextActionProjection(value: unknown): value is Readonly<
  Record<string, JsonValue>
> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, NEXT_ACTION_KEYS) ||
    value.kind !== "next_action_projection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "selected" ||
    value.actionKind !== "request_human_input" ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.nextActionBasisRef !== "string" ||
    typeof value.nextActionBasisDigest !== "string" ||
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    typeof value.selectedActionRef !== "string" ||
    value.selectedActionRef.length === 0 ||
    value.programRef !== DEVELOPER_MINI_IDS.oneSurfaceProgramRef ||
    value.graphFunctionRef !== DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef ||
    value.targetProgramLocusRef !== DEVELOPER_MINI_IDS.interactionLocusRef ||
    typeof value.gapRef !== "string" ||
    value.expectedDeltaRef !==
      DEVELOPER_MINI_IDS.approvalExpectedDeltaRef ||
    value.progressConditionRef !==
      DEVELOPER_MINI_IDS.approvalProgressConditionRef ||
    value.stopConditionRef !==
      DEVELOPER_MINI_IDS.approvalStopConditionRef ||
    !Array.isArray(value.targetObligationBindings) ||
    value.targetObligationBindings.length !== 1 ||
    !isRecord(value.targetObligationBindings[0]) ||
    value.targetObligationBindings[0].kind !==
      "target_obligation_binding" ||
    value.targetObligationBindings[0].disposition !== "bound" ||
    value.targetObligationBindings[0].obligationRef !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(
      value.targetObligationBindings[0].eligibleActionRefs,
    ) ||
    value.targetObligationBindings[0].eligibleActionRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalActionRef ||
    !isRecord(value.priorityProjection) ||
    value.priorityProjection.kind !==
      "deterministic_priority_projection" ||
    value.priorityProjection.schemeRef !==
      DEVELOPER_MINI_IDS.prioritySchemeRef ||
    !Array.isArray(value.priorityProjection.orderedActionRefs) ||
    value.priorityProjection.orderedActionRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalActionRef ||
    !Array.isArray(value.targetObligationRefs) ||
    value.targetObligationRefs.length !== 1 ||
    value.targetObligationRefs[0] !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(value.inputAssetRefs) ||
    value.inputAssetRefs.length !== 1 ||
    value.inputAssetRefs[0] !== DEVELOPER_MINI_IDS.greetingAssetRef ||
    !Array.isArray(value.outputAssetRefs) ||
    value.outputAssetRefs.length !== 1 ||
    value.outputAssetRefs[0] !== DEVELOPER_MINI_IDS.approvalAssetRef ||
    !Array.isArray(value.lawfulBasisRefs) ||
    value.lawfulBasisRefs.length !== 3 ||
    value.lawfulBasisRefs[0] !== value.nextActionBasisRef ||
    value.lawfulBasisRefs[1] !== value.gapRef ||
    value.lawfulBasisRefs[2] !== DEVELOPER_MINI_IDS.oneSurfaceProgramRef ||
    !Array.isArray(value.rejectedAlternativeRefs) ||
    value.rejectedAlternativeRefs.length !== 0
  ) {
    return false;
  }
  const {
    projectionRef,
    projectionDigest,
    ...body
  } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return projectionDigest === expectedDigest &&
    projectionRef ===
      `next-action-projection://product/${expectedDigest.slice("sha256:".length)}`;
}

const NO_ACTION_NEXT_ACTION_KEYS = Object.freeze([
  "disposition",
  "gapRef",
  "kind",
  "lawfulBasisRefs",
  "missingAssetRefs",
  "nextActionBasisDigest",
  "nextActionBasisRef",
  "noActionDisposition",
  "programRef",
  "priorityProjection",
  "projectionDigest",
  "projectionRef",
  "reasonRef",
  "rejectedActionRefs",
  "schemaVersion",
  "targetObligationRefs",
  "targetObligationBindings",
  "targetOutcomeRef",
]);

function isNoActionNextActionProjection(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, NO_ACTION_NEXT_ACTION_KEYS) ||
    value.kind !== "next_action_projection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "no_action" ||
    !isDeveloperNoActionDisposition(value.noActionDisposition) ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.nextActionBasisRef !== "string" ||
    typeof value.nextActionBasisDigest !== "string" ||
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    value.programRef !== DEVELOPER_MINI_IDS.oneSurfaceProgramRef ||
    typeof value.gapRef !== "string" ||
    value.reasonRef !== noActionReasonRef(value.noActionDisposition) ||
    !Array.isArray(value.targetObligationBindings) ||
    value.targetObligationBindings.length !== 1 ||
    !isRecord(value.targetObligationBindings[0]) ||
    value.targetObligationBindings[0].kind !==
      "target_obligation_binding" ||
    value.targetObligationBindings[0].obligationRef !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(
      value.targetObligationBindings[0].eligibleActionRefs,
    ) ||
    value.targetObligationBindings[0].eligibleActionRefs.length !== 0 ||
    !isRecord(value.priorityProjection) ||
    value.priorityProjection.kind !==
      "deterministic_priority_projection" ||
    value.priorityProjection.schemeRef !==
      DEVELOPER_MINI_IDS.prioritySchemeRef ||
    !Array.isArray(value.priorityProjection.orderedActionRefs) ||
    value.priorityProjection.orderedActionRefs.length !== 0 ||
    !Array.isArray(value.targetObligationRefs) ||
    value.targetObligationRefs.join("\0") !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(value.missingAssetRefs) ||
    !Array.isArray(value.lawfulBasisRefs) ||
    value.lawfulBasisRefs.join("\0") !== [
      value.nextActionBasisRef,
      value.gapRef,
      DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
    ].join("\0") ||
    !Array.isArray(value.rejectedActionRefs)
  ) {
    return false;
  }
  const correction = isDeveloperCorrectionDisposition(
    value.noActionDisposition,
  );
  if (
    correction
      ? value.targetObligationBindings[0].disposition !== "fulfilled" ||
        value.missingAssetRefs.length !== 0 ||
        value.rejectedActionRefs.length !== 0
      : value.targetObligationBindings[0].disposition !== "unbound" ||
        value.missingAssetRefs.join("\0") !==
          DEVELOPER_MINI_IDS.approvalCapabilityAssetRef ||
        value.rejectedActionRefs.join("\0") !==
          DEVELOPER_MINI_IDS.approvalActionRef
  ) {
    return false;
  }
  const { projectionRef, projectionDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return projectionDigest === expectedDigest &&
    projectionRef ===
      `next-action-projection://product/${expectedDigest.slice("sha256:".length)}`;
}

function isHumanApproval(value: unknown): value is Readonly<{
  kind: "developer_human_approval";
  schemaVersion: "5.0.0";
  approved: true;
  constructionIntentRef: string;
  message: string;
  semanticEvidenceAssetRefs: readonly string[];
  correctionDisposition?: DeveloperCorrectionDisposition;
}> {
  if (!isRecord(value)) return false;
  const correctionDisposition = value.correctionDisposition;
  const exactKeys = correctionDisposition === undefined
    ? [
        "approved",
        "constructionIntentRef",
        "kind",
        "message",
        "semanticEvidenceAssetRefs",
        "schemaVersion",
      ]
    : [
        "approved",
        "constructionIntentRef",
        "correctionDisposition",
        "kind",
        "message",
        "semanticEvidenceAssetRefs",
        "schemaVersion",
      ];
  return hasExactKeys(value, exactKeys) &&
    value.kind === "developer_human_approval" &&
    value.schemaVersion === "5.0.0" &&
    value.approved === true &&
    typeof value.constructionIntentRef === "string" &&
    value.constructionIntentRef.startsWith("construction-intent://") &&
    typeof value.message === "string" &&
    value.message.length > 0 &&
    Array.isArray(value.semanticEvidenceAssetRefs) &&
    value.semanticEvidenceAssetRefs.every(
      (ref) => typeof ref === "string" && ref.length > 0,
    ) &&
    new Set(value.semanticEvidenceAssetRefs).size ===
      value.semanticEvidenceAssetRefs.length &&
    (
      correctionDisposition === undefined ||
      isDeveloperCorrectionDisposition(correctionDisposition)
    );
}

function isActionEvaluation(value: unknown): value is Readonly<{
  kind: "action_evaluation_projection";
  schemaVersion: "5.0.0";
  actionEvaluationRef: string;
  actionEvaluationDigest: `sha256:${string}`;
  actionEvaluationBasisRef: string;
  actionEvaluationBasisDigest: `sha256:${string}`;
  constructionIntentRef: string;
  targetOutcomeRef: string;
  admittedEvidenceRefs: readonly string[];
  semanticEvidenceAssetRefs: readonly string[];
  observationSnapshot: Readonly<Record<string, JsonValue>>;
  runtimeArchiveInspection: Readonly<Record<string, JsonValue>> | null;
  edgeFulfillmentLedger: Readonly<Record<string, JsonValue>>;
  edgeClosureDecision: Readonly<Record<string, JsonValue>>;
}> {
  if (
    !isRecord(value) ||
    hasExactKeys(value, [
      "actionEvaluationDigest",
      "actionEvaluationRef",
      "actionEvaluationBasisDigest",
      "actionEvaluationBasisRef",
      "admittedEvidenceRefs",
      "constructionIntentRef",
      "edgeClosureDecision",
      "edgeFulfillmentLedger",
      "kind",
      "observationSnapshot",
      "runtimeArchiveInspection",
      "schemaVersion",
      "semanticEvidenceAssetRefs",
      "targetOutcomeRef",
    ]) === false ||
    value.kind !== "action_evaluation_projection" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.actionEvaluationRef !== "string" ||
    typeof value.actionEvaluationDigest !== "string" ||
    typeof value.actionEvaluationBasisRef !== "string" ||
    typeof value.actionEvaluationBasisDigest !== "string" ||
    (
      typeof value.constructionIntentRef !== "string" ||
      !value.constructionIntentRef.startsWith("construction-intent://")
    ) ||
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    !Array.isArray(value.admittedEvidenceRefs) ||
    value.admittedEvidenceRefs.length !== 1 ||
    typeof value.admittedEvidenceRefs[0] !== "string" ||
    !Array.isArray(value.semanticEvidenceAssetRefs) ||
    value.semanticEvidenceAssetRefs.length !== 1 ||
    value.semanticEvidenceAssetRefs[0] !==
      DEVELOPER_MINI_IDS.approvalAssetRef ||
    !isObservationSnapshot(value.observationSnapshot) ||
    !isRecord(value.edgeFulfillmentLedger) ||
    !isRecord(value.edgeClosureDecision)
  ) {
    return false;
  }
  const ledger = value.edgeFulfillmentLedger;
  if (
    !hasExactKeys(ledger, [
      "constructionIntentRef",
      "kind",
      "ledgerDigest",
      "ledgerRef",
      "rows",
      "schemaVersion",
      "targetOutcomeRef",
    ]) ||
    ledger.kind !== "edge_fulfillment_ledger" ||
    ledger.schemaVersion !== "5.0.0" ||
    ledger.constructionIntentRef !== value.constructionIntentRef ||
    ledger.targetOutcomeRef !== value.targetOutcomeRef ||
    typeof ledger.ledgerRef !== "string" ||
    typeof ledger.ledgerDigest !== "string" ||
    !Array.isArray(ledger.rows) ||
    ledger.rows.length !== 1 ||
    !isRecord(ledger.rows[0]) ||
    !hasExactKeys(ledger.rows[0], [
      "disposition",
      "evidenceRefs",
      "evidenceAssetRefs",
      "obligationRef",
    ]) ||
    ledger.rows[0].disposition !== "fulfilled" ||
    ledger.rows[0].obligationRef !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(ledger.rows[0].evidenceRefs) ||
    ledger.rows[0].evidenceRefs.join("\0") !==
      value.admittedEvidenceRefs.join("\0") ||
    !Array.isArray(ledger.rows[0].evidenceAssetRefs) ||
    ledger.rows[0].evidenceAssetRefs.length !== 1 ||
    ledger.rows[0].evidenceAssetRefs[0] !==
      DEVELOPER_MINI_IDS.approvalAssetRef
  ) {
    return false;
  }
  const {
    ledgerRef,
    ledgerDigest,
    ...ledgerBody
  } = ledger;
  if (
    ledgerDigest !== sha256Canonical(ledgerBody as JsonValue) ||
    ledgerRef !==
      `edge-fulfillment-ledger://product/${String(ledgerDigest).slice("sha256:".length)}`
  ) {
    return false;
  }
  const decision = value.edgeClosureDecision;
  if (
    !hasExactKeys(decision, [
      "correctionDisposition",
      "constructionIntentRef",
      "decisionDigest",
      "decisionRef",
      "disposition",
      "kind",
      "ledgerRef",
      "schemaVersion",
      "targetOutcomeRef",
    ]) ||
    decision.kind !== "edge_closure_decision" ||
    decision.schemaVersion !== "5.0.0" ||
    !["close_candidate", "continue_candidate"].includes(
      String(decision.disposition),
    ) ||
    decision.constructionIntentRef !== value.constructionIntentRef ||
    decision.targetOutcomeRef !== value.targetOutcomeRef ||
    decision.ledgerRef !== ledgerRef ||
    typeof decision.decisionRef !== "string" ||
    typeof decision.decisionDigest !== "string"
  ) {
    return false;
  }
  const expectedCorrection = correctionForAuthorityState(
    value.observationSnapshot.changeAuthorityState as
      DeveloperChangeAuthorityState,
  );
  const archive = value.runtimeArchiveInspection;
  if (
    (
      expectedCorrection === null &&
      (
        decision.disposition !== "close_candidate" ||
        decision.correctionDisposition !== null ||
        archive !== null
      )
    ) ||
    (
      expectedCorrection !== null &&
      (
        decision.disposition !== "continue_candidate" ||
        decision.correctionDisposition !== expectedCorrection ||
        !isRecord(archive) ||
        !hasExactKeys(archive, [
          "constructionIntentRef",
          "disposition",
          "inspectionDigest",
          "inspectionRef",
          "kind",
          "runtimeEvidenceEventRefs",
          "schemaVersion",
        ]) ||
        archive.kind !== "runtime_archive_inspection" ||
        archive.schemaVersion !== "5.0.0" ||
        archive.disposition !== "inspected" ||
        archive.constructionIntentRef !== value.constructionIntentRef ||
        typeof archive.inspectionRef !== "string" ||
        typeof archive.inspectionDigest !== "string" ||
        !Array.isArray(archive.runtimeEvidenceEventRefs) ||
        archive.runtimeEvidenceEventRefs.length !== 4 ||
        new Set(archive.runtimeEvidenceEventRefs).size !== 4
      )
    )
  ) {
    return false;
  }
  if (isRecord(archive)) {
    const {
      inspectionRef,
      inspectionDigest,
      ...archiveBody
    } = archive;
    if (
      inspectionDigest !== sha256Canonical(archiveBody as JsonValue) ||
      inspectionRef !==
        `runtime-archive-inspection://product/${String(inspectionDigest).slice("sha256:".length)}`
    ) {
      return false;
    }
  }
  const {
    decisionRef,
    decisionDigest,
    ...decisionBody
  } = decision;
  if (
    decisionDigest !== sha256Canonical(decisionBody as JsonValue) ||
    decisionRef !==
      `edge-closure-decision://product/${String(decisionDigest).slice("sha256:".length)}`
  ) {
    return false;
  }
  const {
    actionEvaluationRef,
    actionEvaluationDigest,
    ...body
  } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return actionEvaluationDigest === expectedDigest &&
    actionEvaluationRef ===
      `action-evaluation://product/${expectedDigest.slice("sha256:".length)}`;
}

function isRefreshedProductAssetModel(value: unknown): value is Readonly<{
  kind: "developer_refreshed_product_asset_model";
  schemaVersion: "5.0.0";
  modelRef: string;
  constructionIntentRef: string;
  targetOutcomeRef: string;
  edgeClosureDecisionRef: string;
  assetRefs: readonly string[];
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "assetRefs",
      "constructionIntentRef",
      "edgeClosureDecisionRef",
      "kind",
      "modelRef",
      "schemaVersion",
      "targetOutcomeRef",
    ]) &&
    value.kind === "developer_refreshed_product_asset_model" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.modelRef === "string" &&
    typeof value.constructionIntentRef === "string" &&
    typeof value.edgeClosureDecisionRef === "string" &&
    value.targetOutcomeRef === DEVELOPER_MINI_IDS.targetOutcomeRef &&
    Array.isArray(value.assetRefs) &&
    value.assetRefs.join("\0") === [
      DEVELOPER_MINI_IDS.greetingAssetRef,
      DEVELOPER_MINI_IDS.approvalAssetRef,
    ].join("\0");
}

function isRefreshedGapProjection(value: unknown): value is Readonly<{
  kind: "developer_refreshed_gap_projection";
  schemaVersion: "5.0.0";
  gapRef: string;
  modelRef: string;
  constructionIntentRef: string;
  targetOutcomeRef: string;
  edgeClosureDecisionRef: string;
  pressure: "none" | "governed_correction";
  correctionDisposition: DeveloperCorrectionDisposition | null;
  fulfilledObligationRefs: readonly string[];
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "correctionDisposition",
      "constructionIntentRef",
      "edgeClosureDecisionRef",
      "fulfilledObligationRefs",
      "gapRef",
      "kind",
      "modelRef",
      "pressure",
      "schemaVersion",
      "targetOutcomeRef",
    ]) &&
    value.kind === "developer_refreshed_gap_projection" &&
    value.schemaVersion === "5.0.0" &&
    (
      (
        value.pressure === "none" &&
        value.correctionDisposition === null
      ) ||
      (
        value.pressure === "governed_correction" &&
        isDeveloperCorrectionDisposition(value.correctionDisposition)
      )
    ) &&
    typeof value.gapRef === "string" &&
    typeof value.modelRef === "string" &&
    typeof value.constructionIntentRef === "string" &&
    typeof value.edgeClosureDecisionRef === "string" &&
    value.targetOutcomeRef === DEVELOPER_MINI_IDS.targetOutcomeRef &&
    Array.isArray(value.fulfilledObligationRefs) &&
    value.fulfilledObligationRefs.length === 1 &&
    value.fulfilledObligationRefs[0] ===
      DEVELOPER_MINI_IDS.approvalObligationRef;
}

function isConvergedNextActionProjection(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "constructionIntentRef",
      "disposition",
      "edgeClosureDecisionRef",
      "gapRef",
      "kind",
      "lawfulBasisRefs",
      "nextActionBasisDigest",
      "nextActionBasisRef",
      "priorityProjection",
      "projectionDigest",
      "projectionRef",
      "schemaVersion",
      "targetObligationBindings",
      "targetOutcomeRef",
    ]) ||
    value.kind !== "next_action_projection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "converged" ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.constructionIntentRef !== "string" ||
    typeof value.edgeClosureDecisionRef !== "string" ||
    typeof value.gapRef !== "string" ||
    typeof value.nextActionBasisRef !== "string" ||
    typeof value.nextActionBasisDigest !== "string" ||
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    !Array.isArray(value.targetObligationBindings) ||
    value.targetObligationBindings.length !== 1 ||
    !isRecord(value.targetObligationBindings[0]) ||
    value.targetObligationBindings[0].kind !==
      "target_obligation_binding" ||
    value.targetObligationBindings[0].disposition !== "fulfilled" ||
    value.targetObligationBindings[0].obligationRef !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
    !Array.isArray(
      value.targetObligationBindings[0].eligibleActionRefs,
    ) ||
    value.targetObligationBindings[0].eligibleActionRefs.length !== 0 ||
    !isRecord(value.priorityProjection) ||
    value.priorityProjection.kind !==
      "deterministic_priority_projection" ||
    value.priorityProjection.schemeRef !==
      DEVELOPER_MINI_IDS.prioritySchemeRef ||
    !Array.isArray(value.priorityProjection.orderedActionRefs) ||
    value.priorityProjection.orderedActionRefs.length !== 0 ||
    !Array.isArray(value.lawfulBasisRefs) ||
    value.lawfulBasisRefs.join("\0") !== [
      value.constructionIntentRef,
      value.edgeClosureDecisionRef,
      value.gapRef,
    ].join("\0")
  ) {
    return false;
  }
  const { projectionRef, projectionDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body as JsonValue);
  return projectionDigest === expectedDigest &&
    projectionRef ===
      `next-action-projection://product/${expectedDigest.slice("sha256:".length)}`;
}

const descriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.implementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperGreeting",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_GREETING_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
});

const ticketDescriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.ticketImplementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperTicketWork",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_TICKET_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(ticketDescriptorBody),
  ...ticketDescriptorBody,
});

const probabilisticDescriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.probabilisticImplementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperProbabilisticPass",
  computeRegime: "F_P",
  inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_PROBABILISTIC_PASS_IMPLEMENTATION_DESCRIPTOR =
  deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(probabilisticDescriptorBody),
    ...probabilisticDescriptorBody,
  });

const deterministicPassDescriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.deterministicPassImplementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperDeterministicPass",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_DETERMINISTIC_PASS_IMPLEMENTATION_DESCRIPTOR =
  deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(deterministicPassDescriptorBody),
    ...deterministicPassDescriptorBody,
  });

function deterministicStageDescriptor(
  implementationRef: string,
  namedSymbol: string,
  inputContractRef: string,
  outputContractRef: string,
): Readonly<object> {
  const body = {
    implementationRef,
    packageName: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    modulePath: "build/index.js",
    namedSymbol,
    computeRegime: "F_D",
    inputContractRef,
    outputContractRef,
    failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
    refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
  };
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(body),
    ...body,
  });
}

const DEVELOPER_SPAN_REENTRY_APPLICATION_BODY = deepFreeze({
  kind: "graph_function_application" as const,
  relationKind: "re_enter" as const,
  inputContractRef: DEVELOPER_MINI_IDS.spanSelectionContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
  graphFunctionRef: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
  sourceProgramLocusRef: DEVELOPER_MINI_IDS.spanSelectorLocusRef,
  targetProgramLocusRef: DEVELOPER_MINI_IDS.spanTargetLocusRef,
  maxApplications: 1,
});
const DEVELOPER_SPAN_REENTRY_APPLICATION = deepFreeze({
  applicationRef:
    `graph-function-application://abiogenesis/${
      sha256Canonical(
        DEVELOPER_SPAN_REENTRY_APPLICATION_BODY,
      ).slice("sha256:".length)
    }`,
  ...DEVELOPER_SPAN_REENTRY_APPLICATION_BODY,
});

export const DEVELOPER_SPAN_INITIALIZE_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanInitializeImplementationRef,
    "realizeDeveloperSpanInitialize",
    DEVELOPER_MINI_IDS.inputContractRef,
    DEVELOPER_MINI_IDS.spanStateContractRef,
  );

export const DEVELOPER_SPAN_TARGET_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanTargetImplementationRef,
    "realizeDeveloperSpanTarget",
    DEVELOPER_MINI_IDS.spanStateContractRef,
    DEVELOPER_MINI_IDS.spanStateContractRef,
  );

export const DEVELOPER_SPAN_SELECTOR_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
    "realizeDeveloperSpanSelector",
    DEVELOPER_MINI_IDS.spanStateContractRef,
    DEVELOPER_MINI_IDS.spanSelectionContractRef,
  );

export const DEVELOPER_SPAN_SELECTOR_REPEAT_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanSelectorRepeatImplementationRef,
    "realizeDeveloperSpanSelectorRepeat",
    DEVELOPER_MINI_IDS.spanStateContractRef,
    DEVELOPER_MINI_IDS.spanSelectionContractRef,
  );

export const DEVELOPER_SPAN_FINALIZE_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanFinalizeImplementationRef,
    "realizeDeveloperSpanFinalize",
    DEVELOPER_MINI_IDS.spanSelectionContractRef,
    DEVELOPER_MINI_IDS.outputContractRef,
  );

export const DEVELOPER_SYNTHESIZE_MODEL_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.synthesizeModelImplementationRef,
    "realizeDeveloperSynthesizeModel",
    DEVELOPER_MINI_IDS.observationContractRef,
    DEVELOPER_MINI_IDS.modelContractRef,
  );

export const DEVELOPER_EVAL_GAP_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evalGapImplementationRef,
    "realizeDeveloperEvalGap",
    DEVELOPER_MINI_IDS.modelContractRef,
    DEVELOPER_MINI_IDS.gapContractRef,
  );

export const DEVELOPER_EVAL_GAP_SUBSTITUTED_POLICY_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evalGapSubstitutedPolicyImplementationRef,
    "realizeDeveloperEvalGapWithSubstitutedPolicy",
    DEVELOPER_MINI_IDS.modelContractRef,
    DEVELOPER_MINI_IDS.gapContractRef,
  );

export const DEVELOPER_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evaluateNextImplementationRef,
    "realizeDeveloperEvaluateNext",
    DEVELOPER_MINI_IDS.gapContractRef,
    DEVELOPER_MINI_IDS.nextActionContractRef,
  );

export const DEVELOPER_EVALUATE_NEXT_MISSING_ACTION_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evaluateNextMissingActionImplementationRef,
    "realizeDeveloperEvaluateNextWithMissingAction",
    DEVELOPER_MINI_IDS.gapContractRef,
    DEVELOPER_MINI_IDS.nextActionContractRef,
  );

export const DEVELOPER_EVALUATE_ACTION_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evaluateActionImplementationRef,
    "realizeDeveloperEvaluateAction",
    DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
    DEVELOPER_MINI_IDS.actionEvaluationContractRef,
  );

export const DEVELOPER_EVALUATE_ACTION_SCALAR_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evaluateActionScalarImplementationRef,
    "realizeDeveloperEvaluateAction",
    DEVELOPER_MINI_IDS.approvalContractRef,
    DEVELOPER_MINI_IDS.actionEvaluationContractRef,
  );

export const
  DEVELOPER_EVALUATE_ACTION_INCOMPLETE_EVIDENCE_IMPLEMENTATION_DESCRIPTOR =
    deterministicStageDescriptor(
      DEVELOPER_MINI_IDS.evaluateActionIncompleteEvidenceImplementationRef,
      "realizeDeveloperEvaluateActionWithoutEvidence",
      DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
      DEVELOPER_MINI_IDS.actionEvaluationContractRef,
    );

export const
  DEVELOPER_EVALUATE_ACTION_SUBSTITUTED_WORKSPACE_IMPLEMENTATION_DESCRIPTOR =
    deterministicStageDescriptor(
      DEVELOPER_MINI_IDS.evaluateActionSubstitutedWorkspaceImplementationRef,
      "realizeDeveloperEvaluateActionWithSubstitutedWorkspace",
      DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
      DEVELOPER_MINI_IDS.actionEvaluationContractRef,
    );

export const
  DEVELOPER_EVALUATE_ACTION_SUBSTITUTED_ARCHIVE_IMPLEMENTATION_DESCRIPTOR =
    deterministicStageDescriptor(
      DEVELOPER_MINI_IDS.evaluateActionSubstitutedArchiveImplementationRef,
      "realizeDeveloperEvaluateActionWithSubstitutedRuntimeArchive",
      DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
      DEVELOPER_MINI_IDS.actionEvaluationContractRef,
    );

export const DEVELOPER_REFRESH_MODEL_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.refreshModelImplementationRef,
    "realizeDeveloperRefreshModel",
    DEVELOPER_MINI_IDS.actionEvaluationContractRef,
    DEVELOPER_MINI_IDS.refreshedModelContractRef,
  );

export const DEVELOPER_REFRESH_GAP_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.refreshGapImplementationRef,
    "realizeDeveloperRefreshGap",
    DEVELOPER_MINI_IDS.refreshedModelContractRef,
    DEVELOPER_MINI_IDS.refreshedGapContractRef,
  );

export const DEVELOPER_REFRESH_EVALUATE_NEXT_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.refreshEvaluateNextImplementationRef,
    "realizeDeveloperRefreshEvaluateNext",
    DEVELOPER_MINI_IDS.refreshedGapContractRef,
    DEVELOPER_MINI_IDS.convergenceContractRef,
  );

export function realizeDeveloperGreeting(input: unknown): Readonly<object> {
  if (!isGreetingInput(input)) {
    throw new TypeError("developer greeting requires its exact input contract");
  }
  const resultCandidate = deepFreeze({
    kind: "developer_greeting_output" as const,
    schemaVersion: "5.0.0" as const,
    message: `Welcome ${input.name}.`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: DEVELOPER_MINI_IDS.implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function realizeDeveloperTicketWork(
  input: unknown,
): Readonly<object> {
  if (!isTicketWorkInput(input)) {
    throw new TypeError("developer ticket work requires its exact input contract");
  }
  const resultCandidate = deepFreeze({
    kind: "developer_ticket_work_output" as const,
    schemaVersion: "5.0.0" as const,
    ticketRef: input.ticketRef,
    disposition: "completed" as const,
    summary: `Completed: ${input.requestedOutcome}`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: DEVELOPER_MINI_IDS.ticketImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

interface ProbabilisticEffectPort {
  readonly invokeWorker: (
    request: Readonly<Record<string, JsonValue>>,
  ) => Promise<Readonly<{
    disposition: "failure" | "success";
    failureClass: string | null;
    finalOutput: string;
  }>>;
}

function parseGreetingCandidate(value: string): Readonly<Record<string, JsonValue>> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (isGreetingOutput(parsed)) return deepFreeze({ ...parsed });
  } catch {
    // The transport artifacts preserve malformed output for ABG admission.
  }
  return deepFreeze({
    kind: "developer_greeting_failure",
    schemaVersion: "5.0.0",
    diagnosticRef: "diagnostic://developer.example/greeting/malformed-worker-output@5",
  });
}

export async function realizeDeveloperProbabilisticPass(
  input: unknown,
  effects: Readonly<ProbabilisticEffectPort>,
): Promise<Readonly<object>> {
  if (!isGreetingOutput(input)) {
    throw new TypeError(
      "developer probabilistic pass requires its exact greeting output input",
    );
  }
  const transport = await effects.invokeWorker({
    actorRef: DEVELOPER_MINI_IDS.workerActorRef,
    workerBindingRef: DEVELOPER_MINI_IDS.workerBindingRef,
    implementationRef: DEVELOPER_MINI_IDS.probabilisticImplementationRef,
    inputDigest: sha256Canonical(input),
    materializationPlanRef: DEVELOPER_MINI_IDS.materializationPlanRef,
    rendererRef: DEVELOPER_MINI_IDS.rendererRef,
    instructionContractRef: DEVELOPER_MINI_IDS.outputContractRef,
    resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
    transportLane: "closed_prompt_proof",
    prompt: [
      "Return the declared developer greeting output unchanged.",
      JSON.stringify(input),
    ].join("\n"),
    responseJsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "schemaVersion", "message"],
      properties: {
        kind: { const: "developer_greeting_output" },
        schemaVersion: { const: "5.0.0" },
        message: { const: input.message },
      },
    },
  });
  const resultCandidate = parseGreetingCandidate(transport.finalOutput);
  const success =
    transport.disposition === "success" &&
    isGreetingOutput(resultCandidate) &&
    resultCandidate.message === input.message;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: success ? "success" as const : "failure" as const,
    evidenceCandidates: [] as const,
    resultCandidate: success
      ? resultCandidate
      : {
          kind: "developer_greeting_failure",
          schemaVersion: "5.0.0",
          diagnosticRef:
            transport.failureClass === null
              ? "diagnostic://developer.example/greeting/worker-output-refused@5"
              : `diagnostic://developer.example/greeting/${transport.failureClass}@5`,
        },
  });
}

export function realizeDeveloperDeterministicPass(
  input: unknown,
): Readonly<object> {
  if (!isGreetingOutput(input)) {
    throw new TypeError(
      "developer deterministic pass requires its exact greeting output input",
    );
  }
  const resultCandidate = deepFreeze({ ...input });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef:
        DEVELOPER_MINI_IDS.deterministicPassImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

function deterministicStageCandidate(
  input: JsonValue,
  resultCandidate: Readonly<Record<string, JsonValue>>,
  implementationRef: string,
): Readonly<object> {
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function realizeDeveloperSpanInitialize(
  input: unknown,
): Readonly<object> {
  if (!isGreetingInput(input)) {
    throw new TypeError("span initialization requires the exact greeting input");
  }
  return deterministicStageCandidate(
    input,
    deepFreeze({
      kind: "developer_span_state",
      schemaVersion: "5.0.0",
      name: input.name,
      targetVisits: 0,
      reentryApplications: 0,
    }),
    DEVELOPER_MINI_IDS.spanInitializeImplementationRef,
  );
}

export function realizeDeveloperSpanTarget(
  input: unknown,
): Readonly<object> {
  if (
    !isSpanState(input) ||
    !(
      (
        input.reentryApplications === 0 &&
        input.targetVisits === 0
      ) ||
      (
        input.reentryApplications === 1 &&
        input.targetVisits === 1
      )
    )
  ) {
    throw new TypeError("span target requires the exact bounded state");
  }
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...input,
      targetVisits: input.targetVisits + 1,
    }),
    DEVELOPER_MINI_IDS.spanTargetImplementationRef,
  );
}

function spanReentryCandidate(
  input: Readonly<DeveloperSpanState>,
  implementationRef: string,
): Readonly<object> {
  const targetInput = deepFreeze({
    ...input,
    reentryApplications: input.reentryApplications + 1,
  });
  const targetInputDigest = sha256Canonical(targetInput);
  const body = deepFreeze({
    kind: "graph_span_selection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "re_enter" as const,
    applicationRef: DEVELOPER_SPAN_REENTRY_APPLICATION.applicationRef,
    graphFunctionRef: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    sourceProgramLocusRef: DEVELOPER_MINI_IDS.spanSelectorLocusRef,
    targetProgramLocusRef: DEVELOPER_MINI_IDS.spanTargetLocusRef,
    targetInputRef:
      `graph-span-input://product/${targetInputDigest.slice("sha256:".length)}`,
    targetInputDigest,
    targetInput,
  });
  const projectionDigest = sha256Canonical(body);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...body,
      projectionRef:
        `graph-span-reentry-projection://product/${projectionDigest.slice("sha256:".length)}`,
      projectionDigest,
    }),
    implementationRef,
  );
}

export function realizeDeveloperSpanSelector(
  input: unknown,
): Readonly<object> {
  if (!isSpanState(input)) {
    throw new TypeError("span selector requires the exact admitted state");
  }
  if (input.reentryApplications === 0 && input.targetVisits === 1) {
    return spanReentryCandidate(
      input,
      DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
    );
  }
  if (input.reentryApplications === 1 && input.targetVisits === 2) {
    return deterministicStageCandidate(
      input as unknown as JsonValue,
      deepFreeze({
        kind: "graph_span_selection",
        schemaVersion: "5.0.0",
        disposition: "continue",
        state: input,
      }),
      DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
    );
  }
  throw new TypeError("span selector refuses an undeclared re-entry state");
}

export function realizeDeveloperSpanSelectorRepeat(
  input: unknown,
): Readonly<object> {
  if (
    !isSpanState(input) ||
    !(
      (
        input.reentryApplications === 0 &&
        input.targetVisits === 1
      ) ||
      (
        input.reentryApplications === 1 &&
        input.targetVisits === 2
      )
    )
  ) {
    throw new TypeError(
      "span repeat selector requires an exact selectable state",
    );
  }
  return spanReentryCandidate(
    input,
    DEVELOPER_MINI_IDS.spanSelectorRepeatImplementationRef,
  );
}

export function realizeDeveloperSpanFinalize(
  input: unknown,
): Readonly<object> {
  if (
    !isSpanContinuation(input) ||
    input.state.reentryApplications !== 1 ||
    input.state.targetVisits !== 2
  ) {
    throw new TypeError(
      "span finalization requires one exact completed re-entry",
    );
  }
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      kind: "developer_greeting_output",
      schemaVersion: "5.0.0",
      message: `Welcome ${input.state.name}.`,
    }),
    DEVELOPER_MINI_IDS.spanFinalizeImplementationRef,
  );
}

export function realizeDeveloperSynthesizeModel(
  input: unknown,
): Readonly<object> {
  if (
    !isObservationSnapshot(input) ||
    input.productAssetModel !== null
  ) {
    throw new TypeError(
      "developer model synthesis requires its exact admitted observation",
    );
  }
  const observedInput = input.observedInput;
  if (!isGreetingInput(observedInput)) {
    throw new TypeError("developer observation lacks its Product input");
  }
  const modelBody = {
    kind: "developer_product_asset_model" as const,
    schemaVersion: "5.0.0" as const,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    subjectName: observedInput.name,
    assetRefs: [DEVELOPER_MINI_IDS.greetingAssetRef],
  };
  const modelDigest = sha256Canonical(modelBody);
  const resultCandidate = observationSnapshot({
    kind: "observation_snapshot",
    schemaVersion: "5.0.0",
    workspaceBinding: input.workspaceBinding,
    targetOutcomeRef: input.targetOutcomeRef,
    targetObligationRefs: input.targetObligationRefs,
    actionCatalog: input.actionCatalog,
    availableActionRefs: input.availableActionRefs,
    changeAuthorityState: input.changeAuthorityState,
    constructionState: input.constructionState,
    observedInput,
    priorGap: input.priorGap,
    productAssetModel: {
      ...modelBody,
      modelRef:
        `product-asset-model://developer.example/${modelDigest.slice("sha256:".length)}`,
    },
  });
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    resultCandidate,
    DEVELOPER_MINI_IDS.synthesizeModelImplementationRef,
  );
}

export function realizeDeveloperEvalGap(input: unknown): Readonly<object> {
  if (
    !isObservationSnapshot(input) ||
    !isRecord(input.productAssetModel) ||
    !isProductAssetModel(input.productAssetModel)
  ) {
    throw new TypeError(
      "developer gap evaluation requires its exact modeled observation",
    );
  }
  const model = input.productAssetModel;
  const approvalAvailable = observationHasAction(
    input,
    DEVELOPER_MINI_IDS.approvalActionRef,
  );
  const gapBody = {
    kind: "developer_gap_projection" as const,
    schemaVersion: "5.0.0" as const,
    modelRef: model.modelRef,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    pressure: input.changeAuthorityState === "requires_reprice"
      ? "constitutional_reprice_required" as const
      : "human_approval_required" as const,
    obligationRefs: [DEVELOPER_MINI_IDS.approvalObligationRef],
    inputAssetRefs: model.assetRefs,
    missingAssetRefs: approvalAvailable
      ? [] as const
      : [DEVELOPER_MINI_IDS.approvalCapabilityAssetRef],
  };
  const gapDigest = sha256Canonical(gapBody);
  const gapProjection = deepFreeze({
    ...gapBody,
    gapRef:
      `gap://developer.example/${gapDigest.slice("sha256:".length)}`,
  });
  const basisBody = {
    kind: "next_action_basis" as const,
    schemaVersion: "5.0.0" as const,
    observationSnapshot: input,
    gapProjection,
    targetObligationRefs: [
      DEVELOPER_MINI_IDS.approvalObligationRef,
    ],
    admittedActionCatalog: input.actionCatalog,
    priorityScheme: {
      kind: "construction_priority_scheme",
      schemeRef: DEVELOPER_MINI_IDS.prioritySchemeRef,
    },
    runtimeFrontier: {
      kind: "runtime_frontier",
      phase: "initial",
      openObligationRefs: [DEVELOPER_MINI_IDS.approvalObligationRef],
      snapshotRef: input.snapshotRef,
    },
    declaredPolicy: developerConstructionPolicy(),
  };
  const basisDigest = sha256Canonical(basisBody as unknown as JsonValue);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...basisBody,
      basisRef:
        `next-action-basis://product/${basisDigest.slice("sha256:".length)}`,
      basisDigest,
    }),
    DEVELOPER_MINI_IDS.evalGapImplementationRef,
  );
}

export function realizeDeveloperEvalGapWithSubstitutedPolicy(
  input: unknown,
): Readonly<object> {
  const admitted = realizeDeveloperEvalGap(input) as Readonly<{
    resultCandidate: Readonly<Record<string, JsonValue>>;
  }>;
  const {
    basisRef: _basisRef,
    basisDigest: _basisDigest,
    ...basisBody
  } = admitted.resultCandidate;
  const substitutedBody = {
    ...basisBody,
    declaredPolicy: {
      kind: "construction_policy",
      policyRef:
        "closure-policy://developer.example/greeting/substituted@5",
      requireCompleteEvidence: false,
      requirePostEvidenceRefresh: false,
    },
  };
  const basisDigest = sha256Canonical(substitutedBody as JsonValue);
  return deterministicStageCandidate(
    input as JsonValue,
    deepFreeze({
      ...substitutedBody,
      basisRef:
        `next-action-basis://product/${basisDigest.slice("sha256:".length)}`,
      basisDigest,
    }),
    DEVELOPER_MINI_IDS.evalGapSubstitutedPolicyImplementationRef,
  );
}

export function realizeDeveloperEvaluateNext(input: unknown): Readonly<object> {
  if (!isNextActionBasis(input)) {
    throw new TypeError(
      "developer next-action evaluation requires its exact admitted basis",
    );
  }
  const gap = input.gapProjection;
  const actionCatalog = input.admittedActionCatalog;
  const snapshot = input.observationSnapshot;
  if (
    !isRecord(gap) ||
    !isRecord(actionCatalog) ||
    !isRecord(snapshot) ||
    !isRecord(input.runtimeFrontier) ||
    !Array.isArray(actionCatalog.rows)
  ) {
    throw new TypeError("developer next-action basis is incomplete");
  }
  const actionAvailable = observationHasAction(
    snapshot,
    DEVELOPER_MINI_IDS.approvalActionRef,
  );
  const noActionDisposition: DeveloperNoActionDisposition =
    gap.pressure === "constitutional_reprice_required"
      ? "reprice_required"
      : "gap_stop";
  const binding = targetObligationBinding(
    snapshot.snapshotRef,
    actionAvailable ? "bound" : "unbound",
    actionAvailable ? [DEVELOPER_MINI_IDS.approvalActionRef] : [],
    noActionReasonRef(noActionDisposition),
  );
  const priority = priorityProjection(
    actionAvailable ? [DEVELOPER_MINI_IDS.approvalActionRef] : [],
  );
  if (!actionAvailable) {
    if (
      !Array.isArray(gap.missingAssetRefs) ||
      gap.missingAssetRefs.length === 0
    ) {
      throw new TypeError("developer gap stop requires one missing Product asset");
    }
    const projectionBody = {
      kind: "next_action_projection" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "no_action" as const,
      noActionDisposition,
      targetOutcomeRef: gap.targetOutcomeRef,
      programRef: DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
      gapRef: gap.gapRef,
      targetObligationRefs: [
        DEVELOPER_MINI_IDS.approvalObligationRef,
      ],
      targetObligationBindings: [binding],
      missingAssetRefs: gap.missingAssetRefs,
      reasonRef: noActionReasonRef(noActionDisposition),
      lawfulBasisRefs: [
        input.basisRef,
        gap.gapRef,
        DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
      ],
      rejectedActionRefs: [DEVELOPER_MINI_IDS.approvalActionRef],
      priorityProjection: priority,
      nextActionBasisRef: input.basisRef,
      nextActionBasisDigest: input.basisDigest,
    };
    const projectionDigest = sha256Canonical(projectionBody);
    return deterministicStageCandidate(
      input as unknown as JsonValue,
      deepFreeze({
        ...projectionBody,
        projectionRef:
          `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
      }),
      DEVELOPER_MINI_IDS.evaluateNextImplementationRef,
    );
  }
  const [selectedAction] = actionCatalog.rows as readonly Readonly<
    Record<string, JsonValue>
  >[];
  if (!isRecord(selectedAction)) {
    throw new TypeError("developer next-action basis is incomplete");
  }
  const projectionBody = {
    kind: "next_action_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "selected" as const,
    targetOutcomeRef: gap.targetOutcomeRef,
    selectedActionRef: selectedAction.actionRef,
    actionKind: selectedAction.actionKind,
    programRef: selectedAction.programRef,
    graphFunctionRef: selectedAction.graphFunctionRef,
    targetProgramLocusRef: selectedAction.targetProgramLocusRef,
    targetObligationRefs: selectedAction.targetObligationRefs,
    targetObligationBindings: [binding],
    inputAssetRefs: selectedAction.inputAssetRefs,
    outputAssetRefs: selectedAction.outputAssetRefs,
    gapRef: gap.gapRef,
    expectedDeltaRef: selectedAction.expectedDeltaRef,
    progressConditionRef: selectedAction.progressConditionRef,
    stopConditionRef: selectedAction.stopConditionRef,
    nextActionBasisRef: input.basisRef,
    nextActionBasisDigest: input.basisDigest,
    priorityProjection: priority,
    lawfulBasisRefs: [
      input.basisRef,
      gap.gapRef,
      DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
    ],
    rejectedAlternativeRefs: [] as const,
  };
  const projectionDigest = sha256Canonical(projectionBody);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...projectionBody,
      projectionRef:
        `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
      projectionDigest,
    }),
    DEVELOPER_MINI_IDS.evaluateNextImplementationRef,
  );
}

export function realizeDeveloperEvaluateNextWithMissingAction(
  input: unknown,
): Readonly<object> {
  const admitted = realizeDeveloperEvaluateNext(input) as Readonly<{
    resultCandidate: Readonly<Record<string, JsonValue>>;
  }>;
  const {
    projectionRef: _projectionRef,
    projectionDigest: _projectionDigest,
    ...projectionBody
  } = admitted.resultCandidate;
  const substitutedBody = {
    ...projectionBody,
    selectedActionRef:
      "action://developer.example/greeting/unpublished-substitute@5",
  };
  const projectionDigest = sha256Canonical(substitutedBody as JsonValue);
  return deterministicStageCandidate(
    input as JsonValue,
    deepFreeze({
      ...substitutedBody,
      projectionRef:
        `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
      projectionDigest,
    }),
    DEVELOPER_MINI_IDS.evaluateNextMissingActionImplementationRef,
  );
}

export function realizeDeveloperEvaluateAction(
  input: unknown,
): Readonly<object> {
  if (!isActionEvaluationBasis(input)) {
    throw new TypeError(
      "developer action evaluation requires its exact admitted evaluation basis",
    );
  }
  const intent = input.constructionIntent;
  const admittedEvidence = input.admittedEvidence;
  const nextActionBasis = input.nextActionBasis;
  if (
    !isRecord(intent) ||
    !Array.isArray(admittedEvidence) ||
    admittedEvidence.length !== 1 ||
    !isRecord(admittedEvidence[0]) ||
    !isNextActionBasis(nextActionBasis) ||
    !Array.isArray(intent.targetObligationRefs) ||
    !Array.isArray(admittedEvidence[0].semanticEvidenceAssetRefs)
  ) {
    throw new TypeError("developer action evaluation basis is incomplete");
  }
  const evidence = admittedEvidence[0];
  const response = evidence.responseValue;
  const observation = nextActionBasis.observationSnapshot;
  if (
    !isHumanApproval(response) ||
    !isRecord(observation) ||
    !isDeveloperChangeAuthorityState(observation.changeAuthorityState)
  ) {
    throw new TypeError(
      "developer action evaluation requires its admitted Product decision",
    );
  }
  const correctionDisposition = correctionForAuthorityState(
    observation.changeAuthorityState,
  );
  if (
    (
      correctionDisposition === null &&
      response.correctionDisposition !== undefined
    ) ||
    (
      correctionDisposition !== null &&
      response.correctionDisposition !== correctionDisposition
    )
  ) {
    throw new TypeError(
      "developer correction response differs from the Product-observed pressure",
    );
  }
  const evidenceRefs = [String(evidence.responseRef)];
  const evidenceAssetRefs = evidence.semanticEvidenceAssetRefs as readonly string[];
  const obligationRefs = intent.targetObligationRefs as readonly string[];
  const ledgerBody = {
    kind: "edge_fulfillment_ledger" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntentRef: intent.constructionIntentRef,
    targetOutcomeRef: intent.targetOutcomeRef,
    rows: obligationRefs.map((obligationRef) => ({
      obligationRef,
      evidenceRefs,
      evidenceAssetRefs,
      disposition: "fulfilled" as const,
    })),
  };
  const ledgerDigest = sha256Canonical(ledgerBody as unknown as JsonValue);
  const edgeFulfillmentLedger = deepFreeze({
    ...ledgerBody,
    ledgerRef:
      `edge-fulfillment-ledger://product/${ledgerDigest.slice("sha256:".length)}`,
    ledgerDigest,
  });
  const runtimeArchiveInspection = correctionDisposition === null
    ? null
    : (() => {
        const archiveBody = {
          kind: "runtime_archive_inspection" as const,
          schemaVersion: "5.0.0" as const,
          disposition: "inspected" as const,
          constructionIntentRef: intent.constructionIntentRef,
          runtimeEvidenceEventRefs: input.runtimeEvidenceEventRefs,
        };
        const inspectionDigest = sha256Canonical(
          archiveBody as unknown as JsonValue,
        );
        return deepFreeze({
          ...archiveBody,
          inspectionRef:
            `runtime-archive-inspection://product/${inspectionDigest.slice("sha256:".length)}`,
          inspectionDigest,
        });
      })();
  const decisionBody = {
    kind: "edge_closure_decision" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntentRef: intent.constructionIntentRef,
    targetOutcomeRef: intent.targetOutcomeRef,
    ledgerRef: edgeFulfillmentLedger.ledgerRef,
    disposition: correctionDisposition === null
      ? "close_candidate" as const
      : "continue_candidate" as const,
    correctionDisposition,
  };
  const decisionDigest = sha256Canonical(decisionBody);
  const edgeClosureDecision = deepFreeze({
    ...decisionBody,
    decisionRef:
      `edge-closure-decision://product/${decisionDigest.slice("sha256:".length)}`,
    decisionDigest,
  });
  const evaluationBody = {
    kind: "action_evaluation_projection" as const,
    schemaVersion: "5.0.0" as const,
    actionEvaluationBasisRef: input.basisRef,
    actionEvaluationBasisDigest: input.basisDigest,
    constructionIntentRef: intent.constructionIntentRef,
    targetOutcomeRef: intent.targetOutcomeRef,
    admittedEvidenceRefs: evidenceRefs,
    semanticEvidenceAssetRefs: evidenceAssetRefs,
    observationSnapshot: nextActionBasis.observationSnapshot,
    runtimeArchiveInspection,
    edgeFulfillmentLedger,
    edgeClosureDecision,
  };
  const actionEvaluationDigest = sha256Canonical(
    evaluationBody as unknown as JsonValue,
  );
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...evaluationBody,
      actionEvaluationRef:
        `action-evaluation://product/${actionEvaluationDigest.slice("sha256:".length)}`,
      actionEvaluationDigest,
    }),
    DEVELOPER_MINI_IDS.evaluateActionImplementationRef,
  );
}

export function realizeDeveloperEvaluateActionWithoutEvidence(
  input: unknown,
): Readonly<object> {
  if (!isActionEvaluationBasis(input)) {
    throw new TypeError(
      "developer incomplete-evidence mutation requires the admitted evaluation basis",
    );
  }
  const admitted = realizeDeveloperEvaluateAction(input) as Readonly<{
    resultCandidate: Readonly<Record<string, JsonValue>>;
  }>;
  const original = admitted.resultCandidate;
  const substitutedEvidenceRefs = [
    "evidence://developer.example/greeting/unadmitted-substitute@5",
  ] as const;
  const originalLedger = original.edgeFulfillmentLedger as Readonly<
    Record<string, JsonValue>
  >;
  const originalRows = originalLedger.rows as readonly Readonly<
    Record<string, JsonValue>
  >[];
  const ledgerBody = {
    kind: originalLedger.kind,
    schemaVersion: originalLedger.schemaVersion,
    constructionIntentRef: originalLedger.constructionIntentRef,
    targetOutcomeRef: originalLedger.targetOutcomeRef,
    rows: originalRows.map((row) => ({
      obligationRef: row.obligationRef,
      evidenceRefs: substitutedEvidenceRefs,
      evidenceAssetRefs: row.evidenceAssetRefs,
      disposition: row.disposition,
    })),
  };
  const ledgerDigest = sha256Canonical(ledgerBody as JsonValue);
  const edgeFulfillmentLedger = deepFreeze({
    ...ledgerBody,
    ledgerRef:
      `edge-fulfillment-ledger://product/${ledgerDigest.slice("sha256:".length)}`,
    ledgerDigest,
  });
  const originalDecision = original.edgeClosureDecision as Readonly<
    Record<string, JsonValue>
  >;
  const decisionBody = {
    kind: originalDecision.kind,
    schemaVersion: originalDecision.schemaVersion,
    constructionIntentRef: originalDecision.constructionIntentRef,
    targetOutcomeRef: originalDecision.targetOutcomeRef,
    ledgerRef: edgeFulfillmentLedger.ledgerRef,
    disposition: originalDecision.disposition,
    correctionDisposition: originalDecision.correctionDisposition,
  };
  const decisionDigest = sha256Canonical(decisionBody as JsonValue);
  const edgeClosureDecision = deepFreeze({
    ...decisionBody,
    decisionRef:
      `edge-closure-decision://product/${decisionDigest.slice("sha256:".length)}`,
    decisionDigest,
  });
  const evaluationBody = {
    kind: original.kind,
    schemaVersion: original.schemaVersion,
    actionEvaluationBasisRef: original.actionEvaluationBasisRef,
    actionEvaluationBasisDigest: original.actionEvaluationBasisDigest,
    constructionIntentRef: original.constructionIntentRef,
    targetOutcomeRef: original.targetOutcomeRef,
    admittedEvidenceRefs: substitutedEvidenceRefs,
    semanticEvidenceAssetRefs: original.semanticEvidenceAssetRefs,
    observationSnapshot: original.observationSnapshot,
    runtimeArchiveInspection: original.runtimeArchiveInspection,
    edgeFulfillmentLedger,
    edgeClosureDecision,
  };
  const actionEvaluationDigest = sha256Canonical(
    evaluationBody as JsonValue,
  );
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...evaluationBody,
      actionEvaluationRef:
        `action-evaluation://product/${actionEvaluationDigest.slice("sha256:".length)}`,
      actionEvaluationDigest,
    }),
    DEVELOPER_MINI_IDS.evaluateActionIncompleteEvidenceImplementationRef,
  );
}

export function realizeDeveloperEvaluateActionWithSubstitutedWorkspace(
  input: unknown,
): Readonly<object> {
  if (!isActionEvaluationBasis(input)) {
    throw new TypeError(
      "developer workspace-substitution mutation requires the admitted evaluation basis",
    );
  }
  const admitted = realizeDeveloperEvaluateAction(input) as Readonly<{
    resultCandidate: Readonly<Record<string, JsonValue>>;
  }>;
  const original = admitted.resultCandidate;
  const originalObservation = original.observationSnapshot;
  if (!isRecord(originalObservation)) {
    throw new TypeError(
      "developer workspace-substitution mutation requires its observation snapshot",
    );
  }
  const workspaceBindingBody = {
    workspaceBindingId:
      "workspace-binding://developer.example/substituted-workspace@5",
  };
  const workspaceBindingDigest = sha256Canonical(workspaceBindingBody);
  const {
    snapshotRef: _snapshotRef,
    snapshotDigest: _snapshotDigest,
    ...snapshotBody
  } = originalObservation;
  const substitutedSnapshotBody = {
    ...snapshotBody,
    workspaceBinding: {
      ...workspaceBindingBody,
      workspaceBindingDigest,
    },
  };
  const substitutedObservation = observationSnapshot(
    substitutedSnapshotBody as Readonly<Record<string, JsonValue>>,
  );
  const {
    actionEvaluationRef: _actionEvaluationRef,
    actionEvaluationDigest: _actionEvaluationDigest,
    ...evaluationBody
  } = original;
  const substitutedEvaluationBody = {
    ...evaluationBody,
    observationSnapshot: substitutedObservation,
  };
  const actionEvaluationDigest = sha256Canonical(
    substitutedEvaluationBody as JsonValue,
  );
  return deterministicStageCandidate(
    input as JsonValue,
    deepFreeze({
      ...substitutedEvaluationBody,
      actionEvaluationRef:
        `action-evaluation://product/${actionEvaluationDigest.slice("sha256:".length)}`,
      actionEvaluationDigest,
    }),
    DEVELOPER_MINI_IDS.evaluateActionSubstitutedWorkspaceImplementationRef,
  );
}

export function realizeDeveloperEvaluateActionWithSubstitutedRuntimeArchive(
  input: unknown,
): Readonly<object> {
  if (!isActionEvaluationBasis(input)) {
    throw new TypeError(
      "developer archive-substitution mutation requires the admitted evaluation basis",
    );
  }
  const admitted = realizeDeveloperEvaluateAction(input) as Readonly<{
    resultCandidate: Readonly<Record<string, JsonValue>>;
  }>;
  const original = admitted.resultCandidate;
  const originalArchive = original.runtimeArchiveInspection;
  if (!isRecord(originalArchive)) {
    throw new TypeError(
      "developer archive-substitution mutation requires correction evidence",
    );
  }
  const archiveBody = {
    kind: originalArchive.kind,
    schemaVersion: originalArchive.schemaVersion,
    disposition: originalArchive.disposition,
    constructionIntentRef: originalArchive.constructionIntentRef,
    runtimeEvidenceEventRefs: [
      ...(originalArchive.runtimeEvidenceEventRefs as readonly JsonValue[])
        .slice(0, -1),
      "event://developer.example/unadmitted-runtime-archive-substitute",
    ],
  };
  const inspectionDigest = sha256Canonical(archiveBody as JsonValue);
  const runtimeArchiveInspection = deepFreeze({
    ...archiveBody,
    inspectionRef:
      `runtime-archive-inspection://product/${inspectionDigest.slice("sha256:".length)}`,
    inspectionDigest,
  });
  const {
    actionEvaluationRef: _actionEvaluationRef,
    actionEvaluationDigest: _actionEvaluationDigest,
    ...evaluationBody
  } = original;
  const substitutedEvaluationBody = {
    ...evaluationBody,
    runtimeArchiveInspection,
  };
  const actionEvaluationDigest = sha256Canonical(
    substitutedEvaluationBody as JsonValue,
  );
  return deterministicStageCandidate(
    input as JsonValue,
    deepFreeze({
      ...substitutedEvaluationBody,
      actionEvaluationRef:
        `action-evaluation://product/${actionEvaluationDigest.slice("sha256:".length)}`,
      actionEvaluationDigest,
    }),
    DEVELOPER_MINI_IDS.evaluateActionSubstitutedArchiveImplementationRef,
  );
}

export function realizeDeveloperRefreshModel(
  input: unknown,
): Readonly<object> {
  if (!isActionEvaluation(input)) {
    throw new TypeError(
      "developer model refresh requires the exact action evaluation",
    );
  }
  const prior = input.observationSnapshot;
  if (
    !isObservationSnapshot(prior) ||
    !isRecord(prior.productAssetModel) ||
    !isProductAssetModel(prior.productAssetModel)
  ) {
    throw new TypeError(
      "developer model refresh requires the evaluated observation basis",
    );
  }
  const body = {
    kind: "developer_product_asset_model" as const,
    schemaVersion: "5.0.0" as const,
    targetOutcomeRef: input.targetOutcomeRef,
    subjectName: prior.productAssetModel.subjectName,
    assetRefs: [
      DEVELOPER_MINI_IDS.greetingAssetRef,
      DEVELOPER_MINI_IDS.approvalAssetRef,
    ],
  };
  const digest = sha256Canonical(body);
  const resultCandidate = observationSnapshot({
    kind: "observation_snapshot",
    schemaVersion: "5.0.0",
    workspaceBinding: prior.workspaceBinding,
    targetOutcomeRef: prior.targetOutcomeRef,
    targetObligationRefs: prior.targetObligationRefs,
    actionCatalog: prior.actionCatalog,
    availableActionRefs: prior.availableActionRefs,
    changeAuthorityState: prior.changeAuthorityState,
    constructionState: {
      actionEvaluationRef: input.actionEvaluationRef,
      constructionIntentRef: input.constructionIntentRef,
      correctionDisposition:
        input.edgeClosureDecision.correctionDisposition,
      edgeClosureDecisionRef: input.edgeClosureDecision.decisionRef,
      runtimeArchiveInspectionRef:
        input.runtimeArchiveInspection === null
          ? null
          : input.runtimeArchiveInspection.inspectionRef,
    },
    observedInput: prior.observedInput,
    priorGap: prior.priorGap,
    productAssetModel: {
      ...body,
      modelRef:
        `product-asset-model://developer.example/${digest.slice("sha256:".length)}`,
    },
  });
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    resultCandidate,
    DEVELOPER_MINI_IDS.refreshModelImplementationRef,
  );
}

export function realizeDeveloperRefreshGap(
  input: unknown,
): Readonly<object> {
  if (
    !isObservationSnapshot(input) ||
    !isRecord(input.productAssetModel) ||
    !isProductAssetModel(input.productAssetModel) ||
    !isRecord(input.constructionState)
  ) {
    throw new TypeError(
      "developer gap refresh requires the refreshed observation snapshot",
    );
  }
  const constructionState = input.constructionState;
  const correctionDisposition =
    isDeveloperCorrectionDisposition(
        constructionState.correctionDisposition,
      )
      ? constructionState.correctionDisposition
      : null;
  const body = {
    kind: "developer_refreshed_gap_projection" as const,
    schemaVersion: "5.0.0" as const,
    modelRef: input.productAssetModel.modelRef,
    constructionIntentRef:
      (input.constructionState as Readonly<Record<string, JsonValue>>)
        .constructionIntentRef,
    targetOutcomeRef: input.targetOutcomeRef,
    edgeClosureDecisionRef:
      constructionState.edgeClosureDecisionRef,
    pressure: correctionDisposition === null
      ? "none" as const
      : "governed_correction" as const,
    correctionDisposition,
    fulfilledObligationRefs: [
      DEVELOPER_MINI_IDS.approvalObligationRef,
    ],
  };
  const digest = sha256Canonical(body);
  const gapProjection = deepFreeze({
    ...body,
    gapRef:
      `gap://developer.example/${digest.slice("sha256:".length)}`,
  });
  const basisBody = {
    kind: "next_action_basis" as const,
    schemaVersion: "5.0.0" as const,
    observationSnapshot: input,
    gapProjection,
    targetObligationRefs: [
      DEVELOPER_MINI_IDS.approvalObligationRef,
    ],
    admittedActionCatalog: input.actionCatalog,
    priorityScheme: {
      kind: "construction_priority_scheme",
      schemeRef: DEVELOPER_MINI_IDS.prioritySchemeRef,
    },
    runtimeFrontier: {
      kind: "runtime_frontier",
      phase: "post_evidence",
      openObligationRefs: [] as const,
      snapshotRef: input.snapshotRef,
    },
    declaredPolicy: developerConstructionPolicy(),
  };
  const basisDigest = sha256Canonical(basisBody as unknown as JsonValue);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...basisBody,
      basisRef:
        `next-action-basis://product/${basisDigest.slice("sha256:".length)}`,
      basisDigest,
    }),
    DEVELOPER_MINI_IDS.refreshGapImplementationRef,
  );
}

export function realizeDeveloperRefreshEvaluateNext(
  input: unknown,
): Readonly<object> {
  if (
    !isNextActionBasis(input) ||
    !isRecord(input.gapProjection) ||
    !isRecord(input.runtimeFrontier) ||
    input.runtimeFrontier.phase !== "post_evidence"
  ) {
    throw new TypeError(
      "developer next-action refresh requires the converged admitted basis",
    );
  }
  const gap = input.gapProjection;
  const snapshot =
    input.observationSnapshot as Readonly<Record<string, JsonValue>>;
  const constructionState = snapshot.constructionState;
  if (!isRecord(constructionState)) {
    throw new TypeError(
      "developer convergence requires the admitted construction state",
    );
  }
  if (
    gap.pressure === "governed_correction" &&
    isDeveloperCorrectionDisposition(gap.correctionDisposition)
  ) {
    const projectionBody = {
      kind: "next_action_projection" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "no_action" as const,
      noActionDisposition: gap.correctionDisposition,
      targetOutcomeRef: gap.targetOutcomeRef,
      programRef: DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
      gapRef: gap.gapRef,
      targetObligationRefs: [
        DEVELOPER_MINI_IDS.approvalObligationRef,
      ],
      targetObligationBindings: [
        targetObligationBinding(
          snapshot.snapshotRef,
          "fulfilled",
          [],
        ),
      ],
      missingAssetRefs: [] as const,
      reasonRef: noActionReasonRef(gap.correctionDisposition),
      lawfulBasisRefs: [
        input.basisRef,
        gap.gapRef,
        DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
      ],
      rejectedActionRefs: [] as const,
      priorityProjection: priorityProjection([]),
      nextActionBasisRef: input.basisRef,
      nextActionBasisDigest: input.basisDigest,
    };
    const projectionDigest = sha256Canonical(projectionBody);
    return deterministicStageCandidate(
      input as unknown as JsonValue,
      deepFreeze({
        ...projectionBody,
        projectionRef:
          `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
      }),
      DEVELOPER_MINI_IDS.refreshEvaluateNextImplementationRef,
    );
  }
  const body = {
    kind: "next_action_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "converged" as const,
    constructionIntentRef: constructionState.constructionIntentRef,
    targetOutcomeRef: gap.targetOutcomeRef,
    gapRef: gap.gapRef,
    edgeClosureDecisionRef: constructionState.edgeClosureDecisionRef,
    nextActionBasisRef: input.basisRef,
    nextActionBasisDigest: input.basisDigest,
    targetObligationBindings: [
      targetObligationBinding(
        snapshot.snapshotRef,
        "fulfilled",
        [],
      ),
    ],
    priorityProjection: priorityProjection([]),
    lawfulBasisRefs: [
      constructionState.constructionIntentRef,
      constructionState.edgeClosureDecisionRef,
      gap.gapRef,
    ],
  };
  const projectionDigest = sha256Canonical(body);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...body,
      projectionRef:
        `next-action-projection://product/${projectionDigest.slice("sha256:".length)}`,
      projectionDigest,
    }),
    DEVELOPER_MINI_IDS.refreshEvaluateNextImplementationRef,
  );
}

function isDeveloperSemanticStageAdvance(
  input: unknown,
  output: unknown,
): boolean {
  if (isObservationSnapshot(input) && isObservationSnapshot(output)) {
    if (
      input.productAssetModel !== null ||
      !isRecord(output.productAssetModel) ||
      !isProductAssetModel(output.productAssetModel) ||
      !isRecord(input.observedInput) ||
      !isRecord(input.workspaceBinding) ||
      !isRecord(output.workspaceBinding)
    ) {
      return false;
    }
    return output.productAssetModel.subjectName === input.observedInput.name &&
      output.workspaceBinding.workspaceBindingDigest ===
        input.workspaceBinding.workspaceBindingDigest;
  }
  if (isObservationSnapshot(input) && isNextActionBasis(output)) {
    if (
      !isRecord(output.observationSnapshot) ||
      !isRecord(output.runtimeFrontier)
    ) {
      return false;
    }
    const expectedPhase = input.constructionState === null
      ? "initial"
      : "post_evidence";
    return output.observationSnapshot.snapshotRef === input.snapshotRef &&
      output.runtimeFrontier.phase === expectedPhase;
  }
  if (
    isNextActionBasis(input) &&
    (
      isNextActionProjection(output) ||
      isNoActionNextActionProjection(output)
    )
  ) {
    return output.nextActionBasisRef === input.basisRef &&
      output.nextActionBasisDigest === input.basisDigest;
  }
  if (isActionEvaluationBasis(input) && isActionEvaluation(output)) {
    return output.actionEvaluationBasisRef === input.basisRef &&
      output.actionEvaluationBasisDigest === input.basisDigest;
  }
  if (isActionEvaluation(input) && isObservationSnapshot(output)) {
    return isRecord(output.constructionState) &&
      output.constructionState.constructionIntentRef ===
        input.constructionIntentRef &&
      output.constructionState.edgeClosureDecisionRef ===
        input.edgeClosureDecision.decisionRef &&
      output.constructionState.correctionDisposition ===
        input.edgeClosureDecision.correctionDisposition &&
      output.constructionState.runtimeArchiveInspectionRef ===
        (
          input.runtimeArchiveInspection === null
            ? null
            : input.runtimeArchiveInspection.inspectionRef
        );
  }
  if (isNextActionBasis(input) && isConvergedNextActionProjection(output)) {
    if (
      !isRecord(input.gapProjection) ||
      !isRecord(input.observationSnapshot) ||
      !isRecord(input.observationSnapshot.constructionState)
    ) {
      return false;
    }
    return output.gapRef === input.gapProjection.gapRef &&
      output.constructionIntentRef ===
        input.observationSnapshot.constructionState.constructionIntentRef;
  }
  return false;
}

export const DEVELOPER_MINI_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: DEVELOPER_MINI_IDS.semanticsBindingRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    if (
      contractRef === DEVELOPER_MINI_IDS.inputContractRef &&
      isGreetingInput(value)
    ) {
      return deepFreeze({
        kind: value.kind,
        schemaVersion: value.schemaVersion,
        name: value.name.trim(),
      });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.outputContractRef &&
      isGreetingOutput(value)
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.ticketInputContractRef &&
      isTicketWorkInput(value)
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.ticketOutputContractRef &&
      isTicketWorkOutput(value)
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.observationContractRef &&
      isObservationSnapshot(value) &&
      value.productAssetModel === null &&
      value.constructionState === null
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.approvalContractRef &&
      isHumanApproval(value)
    ) {
      return deepFreeze({ ...value });
    }
    return null;
  },
  validateContractValue(valueKind: string, value: unknown) {
    switch (valueKind) {
      case "developer_greeting_output":
        return isGreetingOutput(value);
      case "developer_ticket_work_output":
        return isTicketWorkOutput(value);
      case "developer_span_state":
        return isSpanState(value);
      case "graph_span_selection":
        return isSpanSelection(value);
      case "developer_product_asset_model":
        return isProductAssetModel(value);
      case "developer_gap_projection":
        return isGapProjection(value);
      case "observation_snapshot":
        return isObservationSnapshot(value);
      case "next_action_basis":
        return isNextActionBasis(value);
      case "action_evaluation_basis":
        return isActionEvaluationBasis(value);
      case "next_action_projection":
        return isNextActionProjection(value) ||
          isNoActionNextActionProjection(value) ||
          isConvergedNextActionProjection(value);
      case "developer_human_approval":
        return isHumanApproval(value);
      case "action_evaluation_projection":
        return isActionEvaluation(value);
      case "developer_refreshed_product_asset_model":
        return isRefreshedProductAssetModel(value);
      case "developer_refreshed_gap_projection":
        return isRefreshedGapProjection(value);
      default:
        return false;
    }
  },
  resolveJudgmentRelation(predicateRef: string) {
    if (predicateRef === DEVELOPER_MINI_IDS.spanJudgmentPredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/greeting/span-valid@5",
        rejectionReasonRef:
          "reason://developer.example/greeting/span-invalid@5",
        evaluate: (input: unknown, output: unknown) => {
          if (isGreetingInput(input) && isSpanState(output)) {
            return output.name === input.name &&
              output.targetVisits === 0 &&
              output.reentryApplications === 0;
          }
          if (isSpanState(input) && isSpanState(output)) {
            return output.name === input.name &&
              output.targetVisits === input.targetVisits + 1 &&
              output.reentryApplications === input.reentryApplications;
          }
          if (
            isSpanState(input) &&
            isGraphSpanReentryProjection(output)
          ) {
            return output.applicationRef ===
                DEVELOPER_SPAN_REENTRY_APPLICATION.applicationRef &&
              output.graphFunctionRef ===
                DEVELOPER_MINI_IDS.spanGraphFunctionRef &&
              output.sourceProgramLocusRef ===
                DEVELOPER_MINI_IDS.spanSelectorLocusRef &&
              output.targetProgramLocusRef ===
                DEVELOPER_MINI_IDS.spanTargetLocusRef &&
              output.targetInput.name === input.name &&
              output.targetInput.targetVisits === input.targetVisits &&
              output.targetInput.reentryApplications ===
                input.reentryApplications + 1;
          }
          if (isSpanState(input) && isSpanContinuation(output)) {
            return output.state.name === input.name &&
              output.state.targetVisits === input.targetVisits &&
              output.state.reentryApplications ===
                input.reentryApplications;
          }
          return isSpanContinuation(input) &&
            isGreetingOutput(output) &&
            output.message === `Welcome ${input.state.name}.`;
        },
      });
    }
    if (predicateRef === DEVELOPER_MINI_IDS.ticketJudgmentPredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/ticket/work-completed@5",
        rejectionReasonRef:
          "reason://developer.example/ticket/work-incomplete@5",
        evaluate: (input: unknown, output: unknown) =>
          isTicketWorkInput(input) &&
          isTicketWorkOutput(output) &&
          output.ticketRef === input.ticketRef &&
          output.summary === `Completed: ${input.requestedOutcome}`,
      });
    }
    if (predicateRef === DEVELOPER_MINI_IDS.preservePredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/greeting/preserved@5",
        rejectionReasonRef:
          "reason://developer.example/greeting/not-preserved@5",
        evaluate: (input: unknown, output: unknown) =>
          isGreetingOutput(input) &&
          isGreetingOutput(output) &&
          output.message === input.message,
      });
    }
    if (predicateRef === DEVELOPER_MINI_IDS.semanticStagePredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/greeting/semantic-stage-valid@5",
        rejectionReasonRef:
          "reason://developer.example/greeting/semantic-stage-invalid@5",
        evaluate: isDeveloperSemanticStageAdvance,
      });
    }
    if (predicateRef !== DEVELOPER_MINI_IDS.judgmentPredicateRef) return null;
    return Object.freeze({
      predicateRef,
      advanceReasonRef: "reason://developer.example/greeting/satisfied@5",
      rejectionReasonRef: "reason://developer.example/greeting/rejected@5",
      evaluate: (input: unknown, output: unknown) =>
        isGreetingInput(input) &&
        isGreetingOutput(output) &&
        output.message === `Welcome ${input.name}.`,
    });
  },
});

export function constructDeveloperMiniPublication(
  artifact: ArtifactBasis,
): Readonly<Record<string, JsonValue>> {
  if (
    artifact.packageName !== PACKAGE_NAME ||
    artifact.packageVersion !== PACKAGE_VERSION
  ) {
    throw new TypeError("developer mini publication requires its own exact package basis");
  }
  const contracts = [
    ["input", DEVELOPER_MINI_IDS.inputContractRef, "developer_greeting_input"],
    ["output", DEVELOPER_MINI_IDS.outputContractRef, "developer_greeting_output"],
    [
      "input",
      DEVELOPER_MINI_IDS.ticketInputContractRef,
      "developer_ticket_work_input",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.ticketOutputContractRef,
      "developer_ticket_work_output",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.spanStateContractRef,
      "developer_span_state",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.spanSelectionContractRef,
      "graph_span_selection",
    ],
    [
      "input",
      DEVELOPER_MINI_IDS.observationContractRef,
      "observation_snapshot",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.modelContractRef,
      "observation_snapshot",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.gapContractRef,
      "next_action_basis",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.nextActionContractRef,
      "next_action_projection",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.approvalContractRef,
      "developer_human_approval",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
      "action_evaluation_basis",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.actionEvaluationContractRef,
      "action_evaluation_projection",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.refreshedModelContractRef,
      "observation_snapshot",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.refreshedGapContractRef,
      "next_action_basis",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.convergenceContractRef,
      "next_action_projection",
    ],
    ["evidence", DEVELOPER_MINI_IDS.evidenceContractRef, "deterministic_evidence_candidate"],
    ["failure", DEVELOPER_MINI_IDS.failureContractRef, "developer_greeting_failure"],
    ["refusal", DEVELOPER_MINI_IDS.refusalContractRef, "developer_greeting_refusal"],
    ["judgment", DEVELOPER_MINI_IDS.judgmentContractRef, "developer_greeting_judgment"],
    ["transition", DEVELOPER_MINI_IDS.transitionContractRef, "developer_greeting_transition"],
    ["closure", DEVELOPER_MINI_IDS.closureContractRef, "developer_greeting_closure"],
    [
      "evidence",
      DEVELOPER_MINI_IDS.probabilisticEvidenceContractRef,
      "probabilistic_transport_evidence_candidate",
    ],
    [
      "judgment",
      DEVELOPER_MINI_IDS.continuationContractRef,
      "fh_pending_result",
    ],
    [
      "closure",
      DEVELOPER_MINI_IDS.mixedClosureContractRef,
      "developer_mixed_greeting_closure",
    ],
    [
      "closure",
      DEVELOPER_MINI_IDS.oneSurfaceClosureContractRef,
      "developer_one_surface_closure",
    ],
    [
      "closure",
      DEVELOPER_MINI_IDS.ticketClosureContractRef,
      "developer_ticket_work_closure",
    ],
  ].map(([contractKind, contractRef, valueKind]) => ({
    contractRef: contractRef!,
    contractVersion: "5.0.0",
    contractKind: contractKind!,
    valueKind: valueKind!,
  }));
  const graphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.graphRef,
      startNodeRef: DEVELOPER_MINI_IDS.nodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.nodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.nodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.nodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId: "arm://developer.example/greeting/render-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: DEVELOPER_MINI_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.implementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://developer.example/greeting/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate": DEVELOPER_MINI_IDS.judgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: ["developer-authored", "external-product", "all-fd"],
  };
  const program = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.programRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.startRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.graphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": DEVELOPER_MINI_IDS.startRef,
      "abg.root_mode": "direct",
    },
    publicAssetTargets: [{
      kind: "program_public_asset_target",
      handle: DEVELOPER_MINI_IDS.greetingAssetHandle,
      assetRef: DEVELOPER_MINI_IDS.greetingAssetRef,
      startRef: DEVELOPER_MINI_IDS.startRef,
    }],
  };
  const ticketGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.ticketInputContractRef],
      provides: [DEVELOPER_MINI_IDS.ticketOutputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.ticketInputContractRef,
        DEVELOPER_MINI_IDS.ticketOutputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.ticketInputContractRef],
    outputs: [DEVELOPER_MINI_IDS.ticketOutputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.ticketGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.ticketNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.ticketNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.ticketNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.ticketNodeRef,
          stageRole: "ticket-work",
          fibre: "F_D",
          armId: "arm://developer.example/ticket/work-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            DEVELOPER_MINI_IDS.ticketJudgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.ticketImplementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://developer.example/ticket/complete@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.ticketClosureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        DEVELOPER_MINI_IDS.ticketJudgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "ticket-work",
    ],
  };
  const ticketProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.ticketProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.ticketStartRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.ticketGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.ticketClosureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.root_mode": "direct",
    },
  };
  const spanGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.spanStateContractRef,
        DEVELOPER_MINI_IDS.spanSelectionContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.spanGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.spanNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.spanNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.spanNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          terms: [{
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            programLocusRef:
              DEVELOPER_MINI_IDS.spanInitializeLocusRef,
            stageRole: "initialize",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/initialize@5",
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanInitializeImplementationBindingRef,
              inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.spanTargetLocusRef,
            stageRole: "span-target",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/target@5",
            compositionRef: null,
            vectorIndex: 1,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanTargetImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.spanSelectionContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.spanSelectorLocusRef,
            stageRole: "select-span-route",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/select@5",
            compositionRef:
              DEVELOPER_SPAN_REENTRY_APPLICATION.applicationRef,
            vectorIndex: 2,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanSelectorImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.spanSelectionContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef:
              DEVELOPER_MINI_IDS.spanSelectionContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            programLocusRef:
              DEVELOPER_MINI_IDS.spanFinalizeLocusRef,
            stageRole: "result",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/finalize@5",
            compositionRef: null,
            vectorIndex: 3,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: true,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanFinalizeImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.spanSelectionContractRef,
              outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }],
        },
      }],
      edges: [],
      applications: [DEVELOPER_SPAN_REENTRY_APPLICATION],
    },
    effects: [
      "effect://developer.example/greeting/span-reentry@5",
    ],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "graph-span-reentry",
    ],
  };
  const spanProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.spanProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.spanStartRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.spanGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.root_mode": "direct",
    },
  };
  const identityEdgeBody = {
    fromNodeRef: DEVELOPER_MINI_IDS.identityNodeRef,
    toNodeRef: DEVELOPER_MINI_IDS.identityResultNodeRef,
  };
  const identityGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.identityGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.identityNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.identityResultNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.identityNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_identity",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
        },
      }, {
        nodeRef: DEVELOPER_MINI_IDS.identityResultNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.identityResultNodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId:
            "arm://developer.example/greeting/identity-then-render/fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            DEVELOPER_MINI_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.implementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [{
        edgeRef:
          `graph-vector://abiogenesis/${
            sha256Canonical(identityEdgeBody).slice("sha256:".length)
          }`,
        ...identityEdgeBody,
      }],
      applications: [],
    },
    effects: ["effect://developer.example/greeting/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate": DEVELOPER_MINI_IDS.judgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "nonterminal-c-identity",
    ],
  };
  const identityProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.identityProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef:
        "start://developer.example/greeting/identity-then-render@5",
      graphFunctionRef: DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.identityGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.root_mode": "direct",
    },
  };
  const mixedGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.mixedGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.mixedNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.mixedNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.mixedNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          terms: [
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: DEVELOPER_MINI_IDS.deterministicLocusRef,
              stageRole: "transform",
              fibre: "F_D",
              armId: "arm://developer.example/greeting/mixed-fibres/fd@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 0,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.judgmentPredicateRef,
              resultBearing: false,
              requirement: {
                kind: "executable_leaf_requirement",
                implementationBindingRef:
                  DEVELOPER_MINI_IDS.implementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
                outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
                failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
                refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
                judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
              },
            },
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: DEVELOPER_MINI_IDS.probabilisticLocusRef,
              stageRole: "evaluate",
              fibre: "F_P",
              armId: "arm://developer.example/greeting/mixed-fibres/fp@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 1,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.preservePredicateRef,
              resultBearing: false,
              requirement: {
                kind: "executable_leaf_requirement",
                implementationBindingRef:
                  DEVELOPER_MINI_IDS.probabilisticImplementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                evidenceContractRef:
                  DEVELOPER_MINI_IDS.probabilisticEvidenceContractRef,
                failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
                refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
                judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
              },
            },
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: DEVELOPER_MINI_IDS.interactionLocusRef,
              stageRole: "consequence",
              fibre: "F_H",
              armId: "arm://developer.example/greeting/mixed-fibres/fh@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 2,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.preservePredicateRef,
              resultBearing: false,
              requirement: {
                kind: "interaction_leaf_requirement",
                interactionKind: DEVELOPER_MINI_IDS.interactionKind,
                actorCapabilityRef:
                  DEVELOPER_MINI_IDS.actorCapabilityRef,
                requestContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                responseContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                continuationContractRef:
                  DEVELOPER_MINI_IDS.continuationContractRef,
              },
            },
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef:
                "locus://developer.example/greeting/mixed-fibres/post-fh@5",
              stageRole: "result",
              fibre: "F_D",
              armId:
                "arm://developer.example/greeting/mixed-fibres/post-fh@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 3,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.preservePredicateRef,
              resultBearing: true,
              requirement: {
                kind: "executable_leaf_requirement",
                implementationBindingRef:
                  DEVELOPER_MINI_IDS.deterministicPassImplementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
                failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
                refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
                judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
              },
            },
          ],
        },
      }],
      edges: [],
      applications: [],
    },
    effects: [
      "effect://developer.example/greeting/render@5",
      "effect://developer.example/greeting/worker-pass@5",
      "effect://developer.example/greeting/human-approval@5",
    ],
    declarations: {
      "abg.compute_regime": "mixed",
      "abg.closure_contract":
        DEVELOPER_MINI_IDS.mixedClosureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.outputContractRef,
      "abg.judgment_contract":
        DEVELOPER_MINI_IDS.continuationContractRef,
      "abg.judgment_predicate":
        DEVELOPER_MINI_IDS.preservePredicateRef,
      "abg.transition_contract":
        DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "mixed-fd-fp-fh",
    ],
  };
  const mixedProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.mixedProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: "start://developer.example/greeting/mixed-fibres@5",
      graphFunctionRef: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.mixedGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.mixedClosureContractRef,
    policies: {
      "abg.compute_regime": "mixed",
      "abg.root_mode": "direct",
    },
  };
  const oneSurfaceGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.observationContractRef],
      provides: [DEVELOPER_MINI_IDS.convergenceContractRef],
      carries: [
        DEVELOPER_MINI_IDS.observationContractRef,
        DEVELOPER_MINI_IDS.modelContractRef,
        DEVELOPER_MINI_IDS.gapContractRef,
        DEVELOPER_MINI_IDS.nextActionContractRef,
        DEVELOPER_MINI_IDS.approvalContractRef,
        DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
        DEVELOPER_MINI_IDS.actionEvaluationContractRef,
        DEVELOPER_MINI_IDS.refreshedModelContractRef,
        DEVELOPER_MINI_IDS.refreshedGapContractRef,
        DEVELOPER_MINI_IDS.convergenceContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.observationContractRef],
    outputs: [DEVELOPER_MINI_IDS.convergenceContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.oneSurfaceGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.oneSurfaceNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.oneSurfaceNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.oneSurfaceNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: DEVELOPER_MINI_IDS.observationContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.convergenceContractRef,
          terms: [{
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.observationContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.modelContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.synthesizeModelLocusRef,
            stageRole: "synthesizeModel",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/synthesize-model@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 0,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.synthesizeModelImplementationBindingRef,
              inputContractRef: DEVELOPER_MINI_IDS.observationContractRef,
              outputContractRef: DEVELOPER_MINI_IDS.modelContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.modelContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.gapContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.evalGapLocusRef,
            stageRole: "evalGap",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/eval-gap@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 1,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.evalGapImplementationBindingRef,
              inputContractRef: DEVELOPER_MINI_IDS.modelContractRef,
              outputContractRef: DEVELOPER_MINI_IDS.gapContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.gapContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.nextActionContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.evaluateNextLocusRef,
            stageRole: "evaluateNext",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/evaluate-next@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 2,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.evaluateNextImplementationBindingRef,
              inputContractRef: DEVELOPER_MINI_IDS.gapContractRef,
              outputContractRef: DEVELOPER_MINI_IDS.nextActionContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.nextActionContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.interactionLocusRef,
            stageRole: "intent",
            fibre: "F_H",
            armId:
              "arm://developer.example/greeting/one-surface/fh-intent@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 3,
            judgmentPredicateRef: DEVELOPER_MINI_IDS.preservePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "interaction_leaf_requirement",
              interactionKind: DEVELOPER_MINI_IDS.interactionKind,
              actorCapabilityRef: DEVELOPER_MINI_IDS.actorCapabilityRef,
              requestContractRef: DEVELOPER_MINI_IDS.nextActionContractRef,
              responseContractRef: DEVELOPER_MINI_IDS.approvalContractRef,
              continuationContractRef:
                DEVELOPER_MINI_IDS.continuationContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef:
              DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.actionEvaluationContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.evaluateActionLocusRef,
            stageRole: "evaluateAction",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/evaluate-action@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 4,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.evaluateActionImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.actionEvaluationContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef:
              DEVELOPER_MINI_IDS.actionEvaluationContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.refreshedModelContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.refreshModelLocusRef,
            stageRole: "synthesizeModelRefresh",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/refresh-model@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 5,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.refreshModelImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.actionEvaluationContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.refreshedModelContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef:
              DEVELOPER_MINI_IDS.refreshedModelContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.refreshedGapContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.refreshGapLocusRef,
            stageRole: "evalGapRefresh",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/refresh-gap@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 6,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.refreshGapImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.refreshedModelContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.refreshedGapContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef:
              DEVELOPER_MINI_IDS.refreshedGapContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.convergenceContractRef,
            programLocusRef:
              DEVELOPER_MINI_IDS.refreshEvaluateNextLocusRef,
            stageRole: "evaluateNextRefresh",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/one-surface/refresh-evaluate-next@5",
            compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
            vectorIndex: 7,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.semanticStagePredicateRef,
            resultBearing: true,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.refreshEvaluateNextImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.refreshedGapContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.convergenceContractRef,
              evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }],
        },
      }],
      edges: [],
      applications: [],
    },
    effects: [
      "effect://developer.example/greeting/model@5",
      "effect://developer.example/greeting/gap@5",
      "effect://developer.example/greeting/next-action@5",
      "effect://developer.example/greeting/human-approval@5",
      "effect://developer.example/greeting/action-evaluation@5",
      "effect://developer.example/greeting/model-refresh@5",
      "effect://developer.example/greeting/gap-refresh@5",
      "effect://developer.example/greeting/convergence@5",
    ],
    declarations: {
      "abg.compute_regime": "mixed",
      "abg.closure_contract":
        DEVELOPER_MINI_IDS.oneSurfaceClosureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate": DEVELOPER_MINI_IDS.preservePredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "one-surface",
      "supervised",
    ],
  };
  const actionCatalogBody = {
    kind: "action_catalog" as const,
    schemaVersion: "5.0.0" as const,
    rows: [{
      kind: "action_catalog_row" as const,
      actionRef: DEVELOPER_MINI_IDS.approvalActionRef,
      actionKind: "request_human_input",
      programRef: DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
      targetProgramLocusRef: DEVELOPER_MINI_IDS.interactionLocusRef,
      targetObligationRefs: [DEVELOPER_MINI_IDS.approvalObligationRef],
      inputAssetRefs: [DEVELOPER_MINI_IDS.greetingAssetRef],
      outputAssetRefs: [DEVELOPER_MINI_IDS.approvalAssetRef],
      expectedDeltaRef: DEVELOPER_MINI_IDS.approvalExpectedDeltaRef,
      progressConditionRef:
        DEVELOPER_MINI_IDS.approvalProgressConditionRef,
      stopConditionRef: DEVELOPER_MINI_IDS.approvalStopConditionRef,
    }],
  };
  const actionCatalogDigest = sha256Canonical(actionCatalogBody);
  const constructionCompositionBody = {
    kind: "construction_composition" as const,
    schemaVersion: "5.0.0" as const,
    compositionRef: DEVELOPER_MINI_IDS.oneSurfaceCompositionRef,
    graphFunctionRef: DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
    authorities: [{
      kind: "construction_authority_binding" as const,
      semanticAuthority: "synthesizeModel" as const,
      authorityRef: DEVELOPER_MINI_IDS.synthesizeModelAuthorityRef,
      initialProgramLocusRef:
        DEVELOPER_MINI_IDS.synthesizeModelLocusRef,
      refreshProgramLocusRef: DEVELOPER_MINI_IDS.refreshModelLocusRef,
    }, {
      kind: "construction_authority_binding" as const,
      semanticAuthority: "evalGap" as const,
      authorityRef: DEVELOPER_MINI_IDS.evalGapAuthorityRef,
      initialProgramLocusRef: DEVELOPER_MINI_IDS.evalGapLocusRef,
      refreshProgramLocusRef: DEVELOPER_MINI_IDS.refreshGapLocusRef,
    }, {
      kind: "construction_authority_binding" as const,
      semanticAuthority: "evaluateNext" as const,
      authorityRef: DEVELOPER_MINI_IDS.evaluateNextAuthorityRef,
      initialProgramLocusRef:
        DEVELOPER_MINI_IDS.evaluateNextLocusRef,
      refreshProgramLocusRef:
        DEVELOPER_MINI_IDS.refreshEvaluateNextLocusRef,
    }, {
      kind: "construction_authority_binding" as const,
      semanticAuthority: "evaluateAction" as const,
      authorityRef: DEVELOPER_MINI_IDS.evaluateActionAuthorityRef,
      initialProgramLocusRef:
        DEVELOPER_MINI_IDS.evaluateActionLocusRef,
      refreshProgramLocusRef: null,
    }],
    interactionProgramLocusRef: DEVELOPER_MINI_IDS.interactionLocusRef,
    closurePolicy: developerConstructionPolicy(),
  };
  const constructionCompositionDigest = sha256Canonical(
    constructionCompositionBody as unknown as JsonValue,
  );
  const oneSurfaceProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.oneSurfaceStartRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.oneSurfaceClosureContractRef,
    actionCatalog: {
      ...actionCatalogBody,
      catalogRef:
        `action-catalog://product/${actionCatalogDigest.slice("sha256:".length)}`,
      catalogDigest: actionCatalogDigest,
    },
    constructionComposition: {
      ...constructionCompositionBody,
      compositionDigest: constructionCompositionDigest,
    },
    policies: {
      "abg.compute_regime": "mixed",
      "abg.root_mode": "supervised",
    },
  };
  const contribution = {
    handle: DEVELOPER_MINI_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const ticketContribution = {
    handle: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.ticketProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const spanContribution = {
    handle: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef:
      DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.spanProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const mixedContribution = {
    handle: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.mixedProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const oneSurfaceContribution = {
    handle: DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef:
      DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.oneSurfaceProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const identityContribution = {
    handle: DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef:
      DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.identityProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  return deepFreeze({
    kind: "module_publication",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://developer.example/greeting@5",
    contributionManifestRef:
      "contribution-manifest://developer.example/greeting@5",
    productSemanticsBinding: {
      kind: "product_semantics_binding",
      bindingRef: DEVELOPER_MINI_IDS.semanticsBindingRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "DEVELOPER_MINI_PRODUCT_SEMANTICS",
    },
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [{
      kind: "implementation_binding",
      bindingRef: DEVELOPER_MINI_IDS.implementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.implementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperGreeting",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef: DEVELOPER_MINI_IDS.ticketImplementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.ticketImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperTicketWork",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanInitializeImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanInitializeImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanInitialize",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanTargetImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanTargetImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanTarget",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanSelectorImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanSelector",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      outputContractRef:
        DEVELOPER_MINI_IDS.spanSelectionContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanFinalizeImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanFinalizeImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanFinalize",
      computeRegime: "F_D",
      inputContractRef:
        DEVELOPER_MINI_IDS.spanSelectionContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.probabilisticImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.probabilisticImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperProbabilisticPass",
      computeRegime: "F_P",
      inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.deterministicPassImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.deterministicPassImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperDeterministicPass",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.synthesizeModelImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.synthesizeModelImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSynthesizeModel",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.observationContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.modelContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef: DEVELOPER_MINI_IDS.evalGapImplementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.evalGapImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperEvalGap",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.modelContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.gapContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.evaluateNextImplementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.evaluateNextImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperEvaluateNext",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.gapContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.nextActionContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.evaluateActionImplementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.evaluateActionImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperEvaluateAction",
      computeRegime: "F_D",
      inputContractRef:
        DEVELOPER_MINI_IDS.actionEvaluationBasisContractRef,
      outputContractRef:
        DEVELOPER_MINI_IDS.actionEvaluationContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.refreshModelImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.refreshModelImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperRefreshModel",
      computeRegime: "F_D",
      inputContractRef:
        DEVELOPER_MINI_IDS.actionEvaluationContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.refreshedModelContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.refreshGapImplementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.refreshGapImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperRefreshGap",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.refreshedModelContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.refreshedGapContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.refreshEvaluateNextImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.refreshEvaluateNextImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperRefreshEvaluateNext",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.refreshedGapContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.convergenceContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }],
    closureContracts: [{
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
      predicateRef: "predicate://developer.example/greeting/terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef: "projection://developer.example/greeting/replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }, {
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.mixedClosureContractRef,
      predicateRef:
        "predicate://developer.example/greeting/mixed-terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://developer.example/greeting/mixed-replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }, {
      kind: "closure_contract",
      closureContractRef:
        DEVELOPER_MINI_IDS.oneSurfaceClosureContractRef,
      predicateRef:
        "predicate://developer.example/greeting/one-surface-terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef:
        DEVELOPER_MINI_IDS.convergenceContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://developer.example/greeting/one-surface-replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }, {
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.ticketClosureContractRef,
      predicateRef:
        "predicate://developer.example/ticket/terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://developer.example/ticket/replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }],
    programs: [
      program,
      ticketProgram,
      spanProgram,
      identityProgram,
      mixedProgram,
      oneSurfaceProgram,
    ],
    graphFunctions: [
      graphFunction,
      ticketGraphFunction,
      spanGraphFunction,
      identityGraphFunction,
      mixedGraphFunction,
      oneSurfaceGraphFunction,
    ],
    contributions: [
      contribution,
      ticketContribution,
      spanContribution,
      identityContribution,
      mixedContribution,
      oneSurfaceContribution,
    ],
  }) as Readonly<Record<string, JsonValue>>;
}
