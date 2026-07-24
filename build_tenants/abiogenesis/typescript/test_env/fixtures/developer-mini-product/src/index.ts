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
  graphFunctionRef: "graph-function://developer.example/greeting/render@5",
  graphRef: "graph://developer.example/greeting/render@5",
  nodeRef: "node://developer.example/greeting/render@5",
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
  modelContractRef:
    "contract://developer.example/greeting/product-asset-model@5",
  gapContractRef:
    "contract://developer.example/greeting/gap-pressure@5",
  nextActionContractRef:
    "contract://developer.example/greeting/next-action@5",
  approvalContractRef:
    "contract://developer.example/greeting/human-approval@5",
  actionEvaluationContractRef:
    "contract://developer.example/greeting/action-evaluation@5",
  refreshedModelContractRef:
    "contract://developer.example/greeting/refreshed-product-asset-model@5",
  refreshedGapContractRef:
    "contract://developer.example/greeting/refreshed-gap@5",
  convergenceContractRef:
    "contract://developer.example/greeting/converged-next-action@5",
  oneSurfaceClosureContractRef:
    "contract://developer.example/greeting/one-surface-closure@5",
  targetOutcomeRef:
    "outcome://developer.example/greeting/approved-welcome@5",
  greetingAssetRef:
    "asset://developer.example/greeting/welcome-message@5",
  approvalAssetRef:
    "asset://developer.example/greeting/human-approval@5",
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
  evaluateNextImplementationBindingRef:
    "implementation-binding://developer.example/greeting/evaluate-next@5",
  evaluateNextImplementationRef:
    "implementation://developer.example/greeting/evaluate-next@5",
  evaluateActionImplementationBindingRef:
    "implementation-binding://developer.example/greeting/evaluate-action@5",
  evaluateActionImplementationRef:
    "implementation://developer.example/greeting/evaluate-action@5",
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
    value.assetRefs.length === 1 &&
    value.assetRefs[0] === DEVELOPER_MINI_IDS.greetingAssetRef;
}

function isGapProjection(value: unknown): value is Readonly<{
  kind: "developer_gap_projection";
  schemaVersion: "5.0.0";
  gapRef: string;
  modelRef: string;
  targetOutcomeRef: string;
  pressure: "human_approval_required";
  obligationRefs: readonly string[];
  inputAssetRefs: readonly string[];
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "gapRef",
      "inputAssetRefs",
      "kind",
      "modelRef",
      "obligationRefs",
      "pressure",
      "schemaVersion",
      "targetOutcomeRef",
    ]) &&
    value.kind === "developer_gap_projection" &&
    value.schemaVersion === "5.0.0" &&
    value.pressure === "human_approval_required" &&
    typeof value.gapRef === "string" &&
    typeof value.modelRef === "string" &&
    value.targetOutcomeRef === DEVELOPER_MINI_IDS.targetOutcomeRef &&
    Array.isArray(value.obligationRefs) &&
    value.obligationRefs.length === 1 &&
    value.obligationRefs[0] === DEVELOPER_MINI_IDS.approvalObligationRef &&
    Array.isArray(value.inputAssetRefs) &&
    value.inputAssetRefs.length === 1 &&
    value.inputAssetRefs[0] === DEVELOPER_MINI_IDS.greetingAssetRef;
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
  "outputAssetRefs",
  "programRef",
  "progressConditionRef",
  "projectionDigest",
  "projectionRef",
  "rejectedAlternativeRefs",
  "schemaVersion",
  "selectedActionRef",
  "stopConditionRef",
  "targetObligationRefs",
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
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    value.selectedActionRef !== DEVELOPER_MINI_IDS.approvalActionRef ||
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
    value.lawfulBasisRefs.length !== 2 ||
    value.lawfulBasisRefs[0] !== value.gapRef ||
    value.lawfulBasisRefs[1] !== DEVELOPER_MINI_IDS.oneSurfaceProgramRef ||
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

function isHumanApproval(value: unknown): value is Readonly<{
  kind: "developer_human_approval";
  schemaVersion: "5.0.0";
  approved: true;
  constructionIntentRef: string;
  message: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "approved",
      "constructionIntentRef",
      "kind",
      "message",
      "schemaVersion",
    ]) &&
    value.kind === "developer_human_approval" &&
    value.schemaVersion === "5.0.0" &&
    value.approved === true &&
    typeof value.constructionIntentRef === "string" &&
    value.constructionIntentRef.startsWith("construction-intent://") &&
    typeof value.message === "string" &&
    value.message.length > 0;
}

function isActionEvaluation(value: unknown): value is Readonly<{
  kind: "action_evaluation_projection";
  schemaVersion: "5.0.0";
  actionEvaluationRef: string;
  actionEvaluationDigest: `sha256:${string}`;
  constructionIntentRef: string;
  targetOutcomeRef: string;
  semanticEvidenceAssetRefs: readonly string[];
  edgeFulfillmentLedger: Readonly<Record<string, JsonValue>>;
  edgeClosureDecision: Readonly<Record<string, JsonValue>>;
}> {
  if (
    !isRecord(value) ||
    hasExactKeys(value, [
      "actionEvaluationDigest",
      "actionEvaluationRef",
      "constructionIntentRef",
      "edgeClosureDecision",
      "edgeFulfillmentLedger",
      "kind",
      "schemaVersion",
      "semanticEvidenceAssetRefs",
      "targetOutcomeRef",
    ]) === false ||
    value.kind !== "action_evaluation_projection" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.actionEvaluationRef !== "string" ||
    typeof value.actionEvaluationDigest !== "string" ||
    (
      typeof value.constructionIntentRef !== "string" ||
      !value.constructionIntentRef.startsWith("construction-intent://")
    ) ||
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
    !Array.isArray(value.semanticEvidenceAssetRefs) ||
    value.semanticEvidenceAssetRefs.length !== 1 ||
    value.semanticEvidenceAssetRefs[0] !==
      DEVELOPER_MINI_IDS.approvalAssetRef ||
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
      "evidenceAssetRefs",
      "obligationRef",
    ]) ||
    ledger.rows[0].disposition !== "fulfilled" ||
    ledger.rows[0].obligationRef !==
      DEVELOPER_MINI_IDS.approvalObligationRef ||
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
    decision.disposition !== "close_candidate" ||
    decision.constructionIntentRef !== value.constructionIntentRef ||
    decision.targetOutcomeRef !== value.targetOutcomeRef ||
    decision.ledgerRef !== ledgerRef ||
    typeof decision.decisionRef !== "string" ||
    typeof decision.decisionDigest !== "string"
  ) {
    return false;
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
  pressure: "none";
  fulfilledObligationRefs: readonly string[];
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
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
    value.pressure === "none" &&
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
      "projectionDigest",
      "projectionRef",
      "schemaVersion",
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
    value.targetOutcomeRef !== DEVELOPER_MINI_IDS.targetOutcomeRef ||
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

export const DEVELOPER_SYNTHESIZE_MODEL_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.synthesizeModelImplementationRef,
    "realizeDeveloperSynthesizeModel",
    DEVELOPER_MINI_IDS.inputContractRef,
    DEVELOPER_MINI_IDS.modelContractRef,
  );

export const DEVELOPER_EVAL_GAP_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evalGapImplementationRef,
    "realizeDeveloperEvalGap",
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

export const DEVELOPER_EVALUATE_ACTION_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.evaluateActionImplementationRef,
    "realizeDeveloperEvaluateAction",
    DEVELOPER_MINI_IDS.approvalContractRef,
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

export function realizeDeveloperSynthesizeModel(
  input: unknown,
): Readonly<object> {
  if (!isGreetingInput(input)) {
    throw new TypeError(
      "developer model synthesis requires its exact greeting input",
    );
  }
  const modelBody = {
    kind: "developer_product_asset_model" as const,
    schemaVersion: "5.0.0" as const,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    subjectName: input.name,
    assetRefs: [DEVELOPER_MINI_IDS.greetingAssetRef],
  };
  const modelDigest = sha256Canonical(modelBody);
  return deterministicStageCandidate(
    input,
    deepFreeze({
      ...modelBody,
      modelRef:
        `product-asset-model://developer.example/${modelDigest.slice("sha256:".length)}`,
    }),
    DEVELOPER_MINI_IDS.synthesizeModelImplementationRef,
  );
}

export function realizeDeveloperEvalGap(input: unknown): Readonly<object> {
  if (!isProductAssetModel(input)) {
    throw new TypeError(
      "developer gap evaluation requires its exact Product asset model",
    );
  }
  const gapBody = {
    kind: "developer_gap_projection" as const,
    schemaVersion: "5.0.0" as const,
    modelRef: input.modelRef,
    targetOutcomeRef: input.targetOutcomeRef,
    pressure: "human_approval_required" as const,
    obligationRefs: [DEVELOPER_MINI_IDS.approvalObligationRef],
    inputAssetRefs: input.assetRefs,
  };
  const gapDigest = sha256Canonical(gapBody);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...gapBody,
      gapRef:
        `gap://developer.example/${gapDigest.slice("sha256:".length)}`,
    }),
    DEVELOPER_MINI_IDS.evalGapImplementationRef,
  );
}

export function realizeDeveloperEvaluateNext(input: unknown): Readonly<object> {
  if (!isGapProjection(input)) {
    throw new TypeError(
      "developer next-action evaluation requires its exact admitted gap shape",
    );
  }
  const projectionBody = {
    kind: "next_action_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "selected" as const,
    targetOutcomeRef: input.targetOutcomeRef,
    selectedActionRef: DEVELOPER_MINI_IDS.approvalActionRef,
    actionKind: "request_human_input" as const,
    programRef: DEVELOPER_MINI_IDS.oneSurfaceProgramRef,
    graphFunctionRef: DEVELOPER_MINI_IDS.oneSurfaceGraphFunctionRef,
    targetProgramLocusRef: DEVELOPER_MINI_IDS.interactionLocusRef,
    targetObligationRefs: input.obligationRefs,
    inputAssetRefs: input.inputAssetRefs,
    outputAssetRefs: [DEVELOPER_MINI_IDS.approvalAssetRef],
    gapRef: input.gapRef,
    expectedDeltaRef: DEVELOPER_MINI_IDS.approvalExpectedDeltaRef,
    progressConditionRef: DEVELOPER_MINI_IDS.approvalProgressConditionRef,
    stopConditionRef: DEVELOPER_MINI_IDS.approvalStopConditionRef,
    lawfulBasisRefs: [
      input.gapRef,
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

export function realizeDeveloperEvaluateAction(
  input: unknown,
): Readonly<object> {
  if (!isHumanApproval(input)) {
    throw new TypeError(
      "developer action evaluation requires its exact human approval",
    );
  }
  const ledgerBody = {
    kind: "edge_fulfillment_ledger" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntentRef: input.constructionIntentRef,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    rows: [{
      obligationRef: DEVELOPER_MINI_IDS.approvalObligationRef,
      evidenceAssetRefs: [DEVELOPER_MINI_IDS.approvalAssetRef],
      disposition: "fulfilled" as const,
    }],
  };
  const ledgerDigest = sha256Canonical(ledgerBody);
  const edgeFulfillmentLedger = deepFreeze({
    ...ledgerBody,
    ledgerRef:
      `edge-fulfillment-ledger://product/${ledgerDigest.slice("sha256:".length)}`,
    ledgerDigest,
  });
  const decisionBody = {
    kind: "edge_closure_decision" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntentRef: input.constructionIntentRef,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    ledgerRef: edgeFulfillmentLedger.ledgerRef,
    disposition: "close_candidate" as const,
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
    constructionIntentRef: input.constructionIntentRef,
    targetOutcomeRef: DEVELOPER_MINI_IDS.targetOutcomeRef,
    semanticEvidenceAssetRefs: [DEVELOPER_MINI_IDS.approvalAssetRef],
    edgeFulfillmentLedger,
    edgeClosureDecision,
  };
  const actionEvaluationDigest = sha256Canonical(evaluationBody);
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

export function realizeDeveloperRefreshModel(
  input: unknown,
): Readonly<object> {
  if (!isActionEvaluation(input)) {
    throw new TypeError(
      "developer model refresh requires the exact action evaluation",
    );
  }
  const body = {
    kind: "developer_refreshed_product_asset_model" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntentRef: input.constructionIntentRef,
    targetOutcomeRef: input.targetOutcomeRef,
    edgeClosureDecisionRef: String(
      input.edgeClosureDecision.decisionRef,
    ),
    assetRefs: [
      DEVELOPER_MINI_IDS.greetingAssetRef,
      DEVELOPER_MINI_IDS.approvalAssetRef,
    ],
  };
  const digest = sha256Canonical(body);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...body,
      modelRef:
        `product-asset-model://developer.example/${digest.slice("sha256:".length)}`,
    }),
    DEVELOPER_MINI_IDS.refreshModelImplementationRef,
  );
}

export function realizeDeveloperRefreshGap(
  input: unknown,
): Readonly<object> {
  if (!isRefreshedProductAssetModel(input)) {
    throw new TypeError(
      "developer gap refresh requires the refreshed Product asset model",
    );
  }
  const body = {
    kind: "developer_refreshed_gap_projection" as const,
    schemaVersion: "5.0.0" as const,
    modelRef: input.modelRef,
    constructionIntentRef: input.constructionIntentRef,
    targetOutcomeRef: input.targetOutcomeRef,
    edgeClosureDecisionRef: input.edgeClosureDecisionRef,
    pressure: "none" as const,
    fulfilledObligationRefs: [
      DEVELOPER_MINI_IDS.approvalObligationRef,
    ],
  };
  const digest = sha256Canonical(body);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...body,
      gapRef:
        `gap://developer.example/${digest.slice("sha256:".length)}`,
    }),
    DEVELOPER_MINI_IDS.refreshGapImplementationRef,
  );
}

export function realizeDeveloperRefreshEvaluateNext(
  input: unknown,
): Readonly<object> {
  if (!isRefreshedGapProjection(input)) {
    throw new TypeError(
      "developer next-action refresh requires the refreshed gap",
    );
  }
  const body = {
    kind: "next_action_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "converged" as const,
    constructionIntentRef: input.constructionIntentRef,
    targetOutcomeRef: input.targetOutcomeRef,
    gapRef: input.gapRef,
    edgeClosureDecisionRef: input.edgeClosureDecisionRef,
    lawfulBasisRefs: [
      input.constructionIntentRef,
      input.edgeClosureDecisionRef,
      input.gapRef,
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
      case "developer_product_asset_model":
        return isProductAssetModel(value);
      case "developer_gap_projection":
        return isGapProjection(value);
      case "next_action_projection":
        return isNextActionProjection(value) ||
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
        evaluate: (input: unknown, output: unknown) =>
          (
            isGreetingInput(input) &&
            isProductAssetModel(output) &&
            output.subjectName === input.name &&
            output.targetOutcomeRef === DEVELOPER_MINI_IDS.targetOutcomeRef
          ) ||
          (
            isProductAssetModel(input) &&
            isGapProjection(output) &&
            output.modelRef === input.modelRef &&
            output.targetOutcomeRef === input.targetOutcomeRef
          ) ||
          (
            isGapProjection(input) &&
            isNextActionProjection(output) &&
            output.gapRef === input.gapRef &&
            output.targetOutcomeRef === input.targetOutcomeRef
          ) ||
          (
            isHumanApproval(input) &&
            isActionEvaluation(output) &&
            output.constructionIntentRef === input.constructionIntentRef
          ) ||
          (
            isActionEvaluation(input) &&
            isRefreshedProductAssetModel(output) &&
            output.constructionIntentRef === input.constructionIntentRef &&
            output.edgeClosureDecisionRef ===
              input.edgeClosureDecision.decisionRef
          ) ||
          (
            isRefreshedProductAssetModel(input) &&
            isRefreshedGapProjection(output) &&
            output.modelRef === input.modelRef &&
            output.constructionIntentRef === input.constructionIntentRef
          ) ||
          (
            isRefreshedGapProjection(input) &&
            isConvergedNextActionProjection(output) &&
            output.gapRef === input.gapRef &&
            output.constructionIntentRef === input.constructionIntentRef
          ),
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
      "output",
      DEVELOPER_MINI_IDS.modelContractRef,
      "developer_product_asset_model",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.gapContractRef,
      "developer_gap_projection",
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
      DEVELOPER_MINI_IDS.actionEvaluationContractRef,
      "action_evaluation_projection",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.refreshedModelContractRef,
      "developer_refreshed_product_asset_model",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.refreshedGapContractRef,
      "developer_refreshed_gap_projection",
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
      startRef: "start://developer.example/greeting@5",
      graphFunctionRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.graphFunctionRef],
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
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.convergenceContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.modelContractRef,
        DEVELOPER_MINI_IDS.gapContractRef,
        DEVELOPER_MINI_IDS.nextActionContractRef,
        DEVELOPER_MINI_IDS.approvalContractRef,
        DEVELOPER_MINI_IDS.actionEvaluationContractRef,
        DEVELOPER_MINI_IDS.refreshedModelContractRef,
        DEVELOPER_MINI_IDS.refreshedGapContractRef,
        DEVELOPER_MINI_IDS.convergenceContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
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
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.convergenceContractRef,
          terms: [{
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
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
              inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
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
            outputCarrierRef: DEVELOPER_MINI_IDS.approvalContractRef,
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
            inputCarrierRef: DEVELOPER_MINI_IDS.approvalContractRef,
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
              inputContractRef: DEVELOPER_MINI_IDS.approvalContractRef,
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
      inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
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
      inputContractRef: DEVELOPER_MINI_IDS.approvalContractRef,
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
    }],
    programs: [program, identityProgram, mixedProgram, oneSurfaceProgram],
    graphFunctions: [
      graphFunction,
      identityGraphFunction,
      mixedGraphFunction,
      oneSurfaceGraphFunction,
    ],
    contributions: [
      contribution,
      identityContribution,
      mixedContribution,
      oneSurfaceContribution,
    ],
  }) as Readonly<Record<string, JsonValue>>;
}
