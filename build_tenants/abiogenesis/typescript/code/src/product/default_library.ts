import * as v from "valibot";
import { isDeepStrictEqual } from "node:util";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { sha256Bytes } from "../shared/digests.js";
import { admitJson, hasExactKeys, isRecord } from "../shared/admit/index.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import type { NativeWorkspaceAssessmentSelection } from "./native_workspace_assessment.js";
import { isNativeWorkspaceWorkReport } from "./native_workspace_work.js";
import { inlineWorksiteContextBody, isWorksiteContextObservation, type WorksiteContextBodyReader, type WorksiteContextObservation } from "./worksite_effect.js";
import { GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA, GOVERNANCE_FULFILLMENT_STATE_SCHEMA, GOVERNANCE_FULFILLMENT_EVIDENCE_SCHEMA,
  isGovernanceFulfillmentDeclaration, type GovernanceFulfillmentDeclaration, initialGovernanceFulfillment, governanceFulfillmentStateMatches,
  deriveGovernanceObligations, governanceFulfillmentActive } from "./default_library_fulfillment.js";
export * from "./default_library_fulfillment.js";

import { governanceRef } from "./default_library_identity.js";
export { governanceRef, governanceContract } from "./default_library_identity.js";
export const GOVERNANCE_PURPOSES = ["induction", "specification", "design", "construction", "testing", "review", "uat"] as const;
export type GovernancePurpose = typeof GOVERNANCE_PURPOSES[number];
export const GOVERNANCE_OPERATIONS = ["prepare-selection", "select", "evaluate-parent", "prepare-native", "prepare-testing", "fold", "project-choice"] as const;
export type GovernanceOperation = typeof GOVERNANCE_OPERATIONS[number];
export const GOVERNANCE_IMPLEMENTATION_REFS = GOVERNANCE_OPERATIONS.map(n => governanceRef("implementation", n));
/** The selection leaf's typed refusals: the strict binder refused the response,
 * the proposed next member is not permitted, or the selector's process ended. */
export const GOVERNANCE_SELECTION_REFUSALS = ["response_refused", "target_not_permitted", "selector_process_ended"] as const;
/** The failure classes with which a failed Executive step returns to its parent
 * by default: the native work transport and report contract failures, a native
 * worker that ended normally with empty output, and a typed selection refusal. */
export const GOVERNANCE_RECOVERABLE_FAILURE_CLASSES: readonly string[] = Object.freeze(["diagnostic://abiogenesis/worksite/native-work/transport_failure@5",
  "diagnostic://abiogenesis/worksite/native-work/contract_failure@5", "diagnostic://abiogenesis/worksite/native-work/no_output@5",
  governanceRef("diagnostic", "missing-owned-select")]);
export const DEFAULT_LIBRARY_POLICY = `Ordinary conditional governance capabilities. Preserve the complete original task, source, selected authority, valid work and unresolved outcomes. Reuse sufficient existing artifacts without rerunning their authors. Missing capability or authority remains an explicit gap. Open interpretation, suitability and sufficiency are native F_P judgments; deterministic adapters only project declared data and admitted observations. A completed child or successful measurement does not establish application success. Testing records actual commands, streams and predicates, including failures. UAT independently assesses the original source, exact candidate, rubric and current admitted execution evidence. Only the parent projects the independent verdict into its declared termination rule. No mandatory stage order, caller loop, invented source, claimed execution file or generated runtime graph.\n`;
export const GOVERNANCE_POLICIES: Readonly<Record<GovernancePurpose, string>> = deepFreeze({
  induction: "Establish the task model from complete source: outcome, users, constraints, modality, conflicts, assumptions and unknowns. Preserve unresolved questions; distinguish source statements from interpretation.",
  specification: "State source-grounded behavior, boundaries and testable acceptance criteria. Preserve valid supplied requirements, conflicts and unknowns. Do not require a fresh induction artifact.",
  design: "Describe a realizable bounded change against the actual worksite and existing capabilities. Preserve selected criteria and supply a meaningful executable proof plan; expose missing dependencies or capacity.",
  construction: "Implement only the selected bounded change. Preserve original sources, valid supplied assets and declared effect scope. A report or self-run check is not independent acceptance.",
  testing: "Execute the selected reproducible command plan against the actual files and retain command, stream and predicate observations, including nonzero exits. Reuse files without inventing an author. A missing verifier or command plan is a gap, not permission to fabricate evidence.",
  review: "Independently assess the exact declared subject under the declared reference frame, using its declared sources, rubric and result contract. Preserve unmet and indeterminate criteria. Do not edit files. A review binds only its declared frame; it neither establishes nor replaces full-original acceptance.",
  uat: "Independently assess the full original outcome using the exact candidate, consumer rubric and current admitted execution observations. Preserve unmet and indeterminate criteria. Do not edit files or certify success merely from a report, file presence or stage count.",
});

const text = v.pipe(v.string(), v.minLength(1));
const texts = v.array(text);
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const judgmentSchema = v.strictObject({ interpretation: text,
  contributions: v.array(v.strictObject({ graphFunctionRef: text, contribution: text, reason: text, supportRefs: texts, evidenceRefs: texts, dependsOn: texts })),
  gaps: v.array(v.strictObject({ supportRefs: texts, reason: text, evidenceRefs: texts })),
  nextGraphFunctionRef: v.nullable(text), nextReason: text, nextEvidenceRefs: texts, subjectEvidenceRef: v.nullable(text),
  revisionReason: text, revisionEvidenceRefs: texts,
  requirementProposals: v.exactOptional(v.array(GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA)), reviewRef: v.exactOptional(v.nullable(text)) });
const synthesisBasisSchema = v.strictObject({ inputRef: text, inputDigest: digest, taskRef: text,
  environmentRef: text, environmentDigest: digest, frameEvidenceDigest: digest, frameRefs: texts,
  contextRef: text, previousResultRef: v.nullable(text) });
const currentSynthesisSchema = v.strictObject({ resultRef: text, resultDigest: digest, basis: synthesisBasisSchema, judgment: judgmentSchema });
const jsonRecord = v.custom<Readonly<Record<string, JsonValue>>>(isRecord);
const workOrder = v.strictObject({ outcome: text, instructions: texts, readFirst: texts, writeRoots: texts, checks: texts });
const source = v.strictObject({ path: text, digest });
const assessmentSchema = v.strictObject({ sources: v.pipe(texts, v.minLength(1)), candidatePath: text, rubricPath: text,
  resultContract: jsonRecord, schemaAsset: jsonRecord, verdictField: text, satisfiedValue: text });
// A review's type is its declared frame; its order writes nothing. A review
// declared not required may state why it does not apply.
const reviewSchema = v.strictObject({ reviewRef: text, frame: text, required: v.boolean(), notApplicableReason: v.exactOptional(text),
  order: workOrder, assessment: assessmentSchema });
const originalSchema = v.strictObject({ taskRef: text, task: text, sources: v.pipe(v.array(source), v.minLength(1)),
  requiredSupportRefs: v.pipe(texts, v.minLength(1)), authorityRefs: texts,
  readRoots: v.pipe(texts, v.minLength(1)), maxContextFiles: v.pipe(v.number(), v.integer(), v.minValue(1)),
  maxContextBytes: v.pipe(v.number(), v.integer(), v.minValue(1)), maxPromptBytes: v.pipe(v.number(), v.integer(), v.minValue(1)),
  workOrders: v.record(text, workOrder),
  testing: v.strictObject({ selectedPaths: v.pipe(texts, v.minLength(1)), commands: v.array(jsonRecord), outcomePredicates: v.array(jsonRecord), allowedWriteTerritories: v.array(jsonRecord) }),
  assessment: assessmentSchema,
  fulfillment: v.exactOptional(v.custom<GovernanceFulfillmentDeclaration>(isGovernanceFulfillmentDeclaration)),
  reviews: v.exactOptional(v.pipe(v.array(reviewSchema), v.minLength(1))) });
// A null synthesisResultRef records the RC7 fixed direct Testing/UAT route: no
// selector occurred. The ABG owner alone authenticates that route at fold.
const observationSchema = v.strictObject({ purpose: v.picklist(GOVERNANCE_PURPOSES), resultRef: text, resultDigest: digest,
  cCallRef: text, actorInvocationRef: v.nullable(text), synthesisResultRef: v.nullable(text), selectedGraphFunctionRef: text, value: jsonRecord,
  fulfillmentEvidence: v.exactOptional(GOVERNANCE_FULFILLMENT_EVIDENCE_SCHEMA), reviewRef: v.exactOptional(text) });
const reviewStandingSchema = v.strictObject({ reviewRef: text, required: v.boolean(), resultRef: v.nullable(text), satisfied: v.boolean(), current: v.boolean() });
/** A selector-free row belongs only to the Testing or UAT wrapper of its own purpose. */
const directObservationTyped = (row: v.InferOutput<typeof observationSchema>) => row.synthesisResultRef !== null ||
  (row.purpose === "testing" || row.purpose === "uat") && row.selectedGraphFunctionRef === governanceRef("graph-function", row.purpose);
const stateSchema = v.strictObject({ kind: v.literal("governance_work_state"), schemaVersion: v.literal("5.0.0"),
  original: originalSchema, synthesis: v.nullable(currentSynthesisSchema), observations: v.array(observationSchema), unresolvedSupportRefs: texts, terminal: v.boolean(),
  fulfillment: v.exactOptional(GOVERNANCE_FULFILLMENT_STATE_SCHEMA), reviewStanding: v.exactOptional(v.array(reviewStandingSchema)) });
export type GovernanceWorkState = v.InferOutput<typeof stateSchema>;
export type GovernanceObservation = GovernanceWorkState["observations"][number];
export type GovernanceOriginal = GovernanceWorkState["original"];
export type GovernanceReview = NonNullable<GovernanceOriginal["reviews"]>[number];
export type GovernanceReviewStanding = NonNullable<GovernanceWorkState["reviewStanding"]>[number];
/** The native assessment selection's existing role rule (isNativeWorkspaceAssessmentSelection)
 * over the same path strings, held at intake before any graph work or provider call. */
function governanceAssessmentRolesDistinct(assessment: GovernanceOriginal["assessment"]): boolean {
  const { sources, candidatePath, rubricPath } = assessment;
  return new Set(sources).size === sources.length && !sources.some(path => path === candidatePath || path === rubricPath) &&
    candidatePath !== rubricPath;
}
/** Declared reviews, their rows and the parent-owned standing agree. */
function governanceReviewsMatch(value: GovernanceWorkState): boolean {
  const reviews = value.original.reviews ?? [], standing = value.reviewStanding;
  return new Set(reviews.map(r => r.reviewRef)).size === reviews.length && !Object.hasOwn(value.original.workOrders, "review") &&
    reviews.every(r => r.order.writeRoots.length === 0 && governanceAssessmentRolesDistinct(r.assessment) &&
      (!r.required || r.notApplicableReason === undefined)) &&
    value.observations.every(o => o.purpose === "review" ? reviews.some(r => r.reviewRef === o.reviewRef) : o.reviewRef === undefined) &&
    (value.original.reviews === undefined ? standing === undefined : standing !== undefined && standing.length === reviews.length &&
      standing.every((row, i) => row.reviewRef === reviews[i]!.reviewRef && row.required === reviews[i]!.required &&
        (row.resultRef === null ? !row.satisfied && !row.current
          : value.observations.some(o => o.purpose === "review" && o.reviewRef === row.reviewRef && o.resultRef === row.resultRef)) &&
        (!value.terminal || !row.required || row.satisfied && row.current)));
}
export function isGovernanceWorkState(value: unknown): value is GovernanceWorkState {
  return v.is(stateSchema, value) && new Set(value.original.requiredSupportRefs).size === value.original.requiredSupportRefs.length &&
    new Set(value.original.sources.map(s => s.path)).size === value.original.sources.length && value.observations.every(directObservationTyped) &&
    governanceAssessmentRolesDistinct(value.original.assessment) && governanceReviewsMatch(value) &&
    (value.original.fulfillment === undefined ? value.fulfillment === undefined && value.observations.every(o => o.fulfillmentEvidence === undefined) &&
      (value.terminal ? value.unresolvedSupportRefs.length === 0 : isDeepStrictEqual(value.unresolvedSupportRefs, value.original.requiredSupportRefs)) :
      value.fulfillment !== undefined && governanceFulfillmentStateMatches(value.original.fulfillment, value.fulfillment) &&
      isDeepStrictEqual(value.unresolvedSupportRefs, value.fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef)) &&
      (!value.terminal || value.unresolvedSupportRefs.length === 0));
}
export function constructGovernanceWorkState(original: GovernanceOriginal): Readonly<GovernanceWorkState> {
  const state = { kind: "governance_work_state" as const, schemaVersion: "5.0.0" as const, original,
    synthesis: null, observations: [], unresolvedSupportRefs: [...original.requiredSupportRefs], terminal: false,
    ...(original.fulfillment === undefined ? {} : { fulfillment: initialGovernanceFulfillment(original.fulfillment) }),
    ...(original.reviews === undefined ? {} : { reviewStanding: original.reviews.map(r =>
      ({ reviewRef: r.reviewRef, required: r.required, resultRef: null, satisfied: false, current: false })) }) };
  if (!isGovernanceWorkState(state)) throw new TypeError("governance input requires complete original source, scope and declared work contracts");
  return deepFreeze(state);
}
/** A source-use candidate, not evidence admission. The original state remains
 * immutable; current invocation/observation owners establish applicability. */
export function retainedGovernanceWorkInput(value: unknown): Readonly<GovernanceWorkState> | null {
  if (!isGovernanceWorkState(value) || value.terminal || value.observations.length === 0 ||
    value.unresolvedSupportRefs.length === 0) return null;
  return value;
}
export const GOVERNANCE_DIRECT_PURPOSES = ["testing", "uat"] as const;
export type GovernanceDirectPurpose = typeof GOVERNANCE_DIRECT_PURPOSES[number];
export const GOVERNANCE_DIRECT_WRAPPERS: Readonly<Record<GovernanceDirectPurpose, string>> = deepFreeze({
  testing: governanceRef("graph-function", "testing"), uat: governanceRef("graph-function", "uat") });
/** The fixed direct route's finite state relation. Fresh Testing has source none
 * and no observation. UAT has the admitted direct-Testing state Result as source:
 * exactly its one selector-free Testing observation (its owners separately bind
 * that source to the raw input). Open fulfillment, declared reviews or other
 * declared work is open choice and refuses; there is no latest/eligible search. */
export function governanceDirectFixedState(state: GovernanceWorkState, purpose: GovernanceDirectPurpose,
  source: { readonly sourceGraphFunctionRef: string } | null): boolean {
  const rows = state.observations;
  if (state.synthesis !== null || state.original.fulfillment !== undefined || state.original.reviews !== undefined ||
    !Object.keys(state.original.workOrders).every(p => p === "testing" || p === "uat")) return false;
  if (purpose === "testing") return source === null && rows.length === 0;
  return source !== null && source.sourceGraphFunctionRef === GOVERNANCE_DIRECT_WRAPPERS.testing && rows.length === 1 &&
    rows[0]!.purpose === "testing" && rows[0]!.synthesisResultRef === null && rows[0]!.selectedGraphFunctionRef === GOVERNANCE_DIRECT_WRAPPERS.testing;
}
export function governanceTestingConfiguration(state: GovernanceWorkState) {
  const t = state.original.testing;
  return { commands: t.commands as unknown as readonly WorksiteDeclaredCommandInput[],
    outcomePredicates: t.outcomePredicates as unknown as readonly WorksiteOutcomePredicateInput[],
    allowedWriteTerritories: t.allowedWriteTerritories as unknown as readonly WorksiteCommandWriteTerritoryInput[] };
}
/** The declared review the current selection names for the review wrapper. */
export function governanceSelectedReview(state: GovernanceWorkState): GovernanceReview | null {
  const judgment = state.synthesis?.judgment;
  return judgment?.nextGraphFunctionRef !== governanceRef("graph-function", "review") ? null :
    state.original.reviews?.find(r => r.reviewRef === judgment.reviewRef) ?? null;
}
/** The one owner of which assessment declaration an assessment wrapper applies:
 * full-original acceptance for `uat`, the selected declared review for `review`. */
export function governanceAssessmentContract(state: GovernanceWorkState, purpose: "uat" | "review") {
  const assessment = purpose === "uat" ? state.original.assessment : governanceSelectedReview(state)?.assessment;
  return assessment === undefined ? null : assessment as unknown as { sources: readonly string[]; candidatePath: string; rubricPath: string;
    resultContract: NativeWorkspaceAssessmentSelection["resultContract"]; schemaAsset: NativeWorkspaceAssessmentSelection["schemaAsset"];
    verdictField: string; satisfiedValue: string };
}
/** The one owner of an assessment's material dependency set: every mandatory
 * input its preparation binds as read-first material. The candidate is the
 * subject; the rest are the declared inputs its verdict depends on. The order's
 * readFirst stays as declared (preparation refuses a duplicate there); each
 * assessment input not already present is added once. */
export function governanceAssessmentDependencies(order: { readonly readFirst: readonly string[] },
  assessment: { readonly sources: readonly string[]; readonly candidatePath: string; readonly rubricPath: string }): readonly string[] {
  const dependencies = [...order.readFirst];
  for (const path of [...assessment.sources, assessment.candidatePath, assessment.rubricPath])
    if (!dependencies.includes(path)) dependencies.push(path);
  return dependencies;
}
/** A Program's process declaration on its executive step: for each registered
 * purpose, the declared reviews that must be satisfied and current before it
 * is selected. A review purpose names none: it would gate its own prerequisite. */
export type GovernancePrerequisites = Readonly<Partial<Record<Exclude<GovernancePurpose, "review">, readonly string[]>>>;
export const GOVERNANCE_PREREQUISITES_DECLARATION = "abg.default_library_prerequisites";
const prerequisitesSchema = v.record(v.picklist(GOVERNANCE_PURPOSES.filter(p => p !== "review")), v.pipe(texts, v.minLength(1)));
/** The step's declared prerequisites: undefined when none is declared, null when the declaration is not its canonical form. */
export function governancePrerequisites(declarations: Readonly<Record<string, string>>): GovernancePrerequisites | null | undefined {
  const declared = declarations[GOVERNANCE_PREREQUISITES_DECLARATION];
  if (declared === undefined) return undefined;
  let value: unknown;
  try { value = JSON.parse(declared); } catch { return null; }
  return v.is(prerequisitesSchema, value) && Object.keys(value).length > 0 && Object.values(value).every(refs => unique(refs!)) &&
    canonicalJson(value as JsonValue) === declared ? value : null;
}
/** Intake: the reviews the Program names that the task does not declare as
 * required or, with a non-blank stated reason, as not applicable. */
export function governancePrerequisitesUndeclared(original: GovernanceOriginal, prerequisites: GovernancePrerequisites | undefined): readonly string[] {
  return [...new Set(Object.values(prerequisites ?? {}).flat())].filter(ref => {
    const review = original.reviews?.find(r => r.reviewRef === ref);
    return review === undefined || !review.required && (review.notApplicableReason ?? "").trim().length === 0;
  });
}
/** The one construction of a registered target from its wrapper definition. */
export function governanceTarget(definition: { readonly name: string; readonly declarations: Readonly<Record<string, string>> },
  definitionDigest: `sha256:${string}`, prerequisites: GovernancePrerequisites | undefined): FramedSynthesisTarget | null {
  const purpose = definition.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (!GOVERNANCE_PURPOSES.includes(purpose)) return null;
  return { graphFunctionRef: definition.name, definitionDigest, purpose,
    ...(prerequisites === undefined ? {} : { requiredReviews: purpose === "review" ? [] : prerequisites[purpose] ?? [] }) };
}
/** The one permitted relation over a registered target. `offered`: the target is
 * in the selector's domain (the review wrapper only for a task that declares
 * reviews). `permitted`: it may be the next member: offered, every original
 * selected path is an observed file for Testing, and each review its Program
 * requires that the task declares as required is satisfied and current in the
 * standing the parent computed for this step. An undeclared review is missing. */
export function governanceTargetPermission(task: FramedSynthesisTask, target: Pick<FramedSynthesisTarget, "purpose" | "requiredReviews">) {
  const state = task.state, offered = target.purpose !== "review" || state.original.reviews !== undefined;
  const missingSelectedPaths = target.purpose === "testing" ? framedSynthesisMissingTestingPaths(task) : [];
  const missingReviews = (target.requiredReviews ?? []).flatMap(reviewRef => {
    const row = state.reviewStanding?.find(r => r.reviewRef === reviewRef);
    return row !== undefined && (!row.required || row.satisfied && row.current) ? [] :
      [{ reviewRef, satisfied: row?.satisfied ?? false, current: row?.current ?? false }];
  });
  return { offered, permitted: offered && missingSelectedPaths.length === 0 && missingReviews.length === 0, missingSelectedPaths, missingReviews };
}
/** Declared scalar verdicts only: acceptance is the latest `uat` row that only
 * `review` rows follow; each declared review takes its own latest row. The owned
 * parent projection additionally establishes each producer and causal relation. */
export function governanceVerdicts(state: GovernanceWorkState) {
  const rows = state.observations, verdict = (row: GovernanceObservation | null, a: GovernanceOriginal["assessment"]) =>
    row !== null && row.value[a.verdictField] === a.satisfiedValue;
  let acceptance: GovernanceObservation | null = null;
  for (let i = rows.length - 1; i >= 0 && acceptance === null && (rows[i]!.purpose === "uat" || rows[i]!.purpose === "review"); i--)
    if (rows[i]!.purpose === "uat") acceptance = rows[i]!;
  return { acceptance: { observation: acceptance, satisfied: verdict(acceptance, state.original.assessment) },
    reviews: (state.original.reviews ?? []).map(review => {
      const observation = [...rows].reverse().find(o => o.purpose === "review" && o.reviewRef === review.reviewRef) ?? null;
      return { review, observation, satisfied: verdict(observation, review.assessment) };
    }) };
}

const scalar = v.nullable(v.union([v.string(), v.number(), v.boolean()]));
// One failed step of this Run, folded from the admitted record at selection preparation.
const failedAttemptSchema = v.strictObject({ graphFunctionRef: v.nullable(text), reviewRef: v.exactOptional(text), failureClassRef: text,
  timeoutClass: v.nullable(text), changedPaths: texts, refusal: v.exactOptional(v.strictObject({ relation: text, selectors: v.record(text, scalar) })), resultRef: text });
export type FramedSynthesisFailedAttempt = v.InferOutput<typeof failedAttemptSchema>;
export type FramedSynthesisJudgment = v.InferOutput<typeof judgmentSchema>;
export type FramedSynthesisBasis = v.InferOutput<typeof synthesisBasisSchema>;
export type FramedSynthesisTarget = { readonly graphFunctionRef: string; readonly definitionDigest: `sha256:${string}`; readonly purpose: GovernancePurpose;
  readonly requiredReviews?: readonly string[] };
export type FramedSynthesisTask = {
  readonly kind: "framed_synthesis_task"; readonly schemaVersion: "5.0.0";
  readonly state: GovernanceWorkState; readonly context: WorksiteContextObservation;
  readonly failedAttempts?: readonly FramedSynthesisFailedAttempt[];
};
export type FramedSynthesisResult = {
  readonly kind: "framed_synthesis_result"; readonly schemaVersion: "5.0.0";
  readonly state: GovernanceWorkState; readonly basis: FramedSynthesisBasis; readonly judgment: FramedSynthesisJudgment;
};

const unique = (values: readonly string[]) => new Set(values).size === values.length;
export function isFramedSynthesisJudgment(value: unknown): value is FramedSynthesisJudgment {
  return v.is(judgmentSchema, value) && unique(value.contributions.map(c => c.graphFunctionRef)) &&
    value.contributions.every(c => unique(c.supportRefs) && unique(c.evidenceRefs) && unique(c.dependsOn) &&
      c.dependsOn.every(ref => ref !== c.graphFunctionRef && value.contributions.some(row => row.graphFunctionRef === ref))) &&
    value.gaps.every(g => g.supportRefs.length > 0 && unique(g.supportRefs) && unique(g.evidenceRefs)) &&
    unique(value.nextEvidenceRefs) && unique(value.revisionEvidenceRefs) &&
    (value.nextGraphFunctionRef === null ? value.gaps.length > 0 && value.subjectEvidenceRef === null :
      value.contributions.some(c => c.graphFunctionRef === value.nextGraphFunctionRef));
}
export function isFramedSynthesisTask(value: unknown): value is FramedSynthesisTask {
  return v.is(v.strictObject({ kind: v.literal("framed_synthesis_task"), schemaVersion: v.literal("5.0.0"),
    state: v.custom<GovernanceWorkState>(isGovernanceWorkState), context: v.custom<WorksiteContextObservation>(isWorksiteContextObservation),
    failedAttempts: v.exactOptional(v.pipe(v.array(failedAttemptSchema), v.minLength(1))) }), value) && !value.state.terminal &&
    unique((value.failedAttempts ?? []).map(a => a.resultRef));
}
export function isFramedSynthesisResult(value: unknown): value is FramedSynthesisResult {
  if (typeof value !== "object" || value === null || !hasExactKeys(value, ["kind", "schemaVersion", "state", "basis", "judgment"])) return false;
  const r = value as FramedSynthesisResult;
  return r.kind === "framed_synthesis_result" && r.schemaVersion === "5.0.0" && isGovernanceWorkState(r.state) &&
    v.is(synthesisBasisSchema, r.basis) && isFramedSynthesisJudgment(r.judgment) && r.basis.taskRef === r.state.original.taskRef &&
    r.basis.previousResultRef === (r.state.synthesis?.resultRef ?? null);
}
export function framedSynthesisEvidenceRefs(task: FramedSynthesisTask): readonly string[] {
  return [task.state.original.taskRef, task.context.observationRef, ...task.state.observations.map(o => o.resultRef),
    ...(task.state.synthesis === null ? [] : [task.state.synthesis.resultRef]), ...(task.failedAttempts ?? []).map(a => a.resultRef)];
}
/** Typed source candidates only; native owners still establish Result identity,
 * authority and currentness before consuming the complete producer value. */
export function governanceSubjectEvidenceRefs(state: GovernanceWorkState, purpose: GovernancePurpose | null): readonly (string | null)[] {
  const assessed = (p: GovernancePurpose | null) => p === "uat" || p === "review";
  if (purpose !== "testing" && !assessed(purpose)) return [null];
  const counts = new Map<string, number>();
  for (const row of state.observations) counts.set(row.resultRef, (counts.get(row.resultRef) ?? 0) + 1);
  const eligible = state.observations.filter(row => {
    if (counts.get(row.resultRef) !== 1) return false;
    const native = row.purpose !== "testing" && !assessed(row.purpose) && isNativeWorkspaceWorkReport(row.value.report) &&
      Array.isArray(row.value.changedPaths) && row.value.changedPaths.every(path => typeof path === "string");
    const command = row.purpose === "testing" && Array.isArray(row.value.commandResults) && Array.isArray(row.value.predicateObservations);
    return native || assessed(purpose) && command;
  }).map(row => row.resultRef);
  return purpose === "testing" ? [...eligible, null] : eligible;
}
/** Immediate Testing uses the full original declaration. Context file presence
 * establishes this construction prerequisite, never suitability or completion. */
function framedSynthesisMissingTestingPaths(task: FramedSynthesisTask): readonly string[] {
  const files = new Set(task.context.entries.filter(entry => entry.state === "file").map(entry => entry.relativePath));
  return task.state.original.testing.selectedPaths.filter(path => !files.has(path));
}
/** Private selector display, not a stream parser or evidence admission. */
function planningStream(observation: GovernanceObservation, fieldPath: (string | number)[], value: JsonValue | undefined) {
  const record = (item: JsonValue | undefined): item is Readonly<Record<string, JsonValue>> =>
    item !== null && typeof item === "object" && !Array.isArray(item);
  if (!record(value)) return value;
  let bytes = Buffer.alloc(0), text: string;
  try {
    if (value.encoding === "utf8" && typeof value.text === "string") bytes = Buffer.from(value.text, "utf8");
    else if (value.encoding === "base64" && typeof value.payload === "string") bytes = Buffer.from(value.payload, "base64");
    else return value;
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return { ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== "text" && key !== "payload")),
      rawBody: { resultRef: observation.resultRef, resultDigest: observation.resultDigest, fieldPath, omittedFromPlanningView: true },
      displayOnly: true, excerpts: [], displayUnavailable: "not_utf8", complete: false, omittedByteCount: bytes.length };
  }
  // A short strict UTF-8 stream is its own whole display: one exact range over
  // the cited bytes, BOM and line endings included. Completeness is claimed
  // only when the carried body has a valid declared length and digest and
  // both match it; missing or malformed metadata keeps the bounded display.
  const declaredLength = typeof value.byteLength === "number" && Number.isSafeInteger(value.byteLength) && value.byteLength >= 0;
  const declaredDigest = typeof value.digest === "string" && /^sha256:[0-9a-f]{64}$/u.test(value.digest);
  if (bytes.length <= 8192 && declaredLength && value.byteLength === bytes.length &&
      declaredDigest && value.digest === sha256Bytes(bytes))
    return { ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== "text" && key !== "payload")),
      rawBody: { resultRef: observation.resultRef, resultDigest: observation.resultDigest, fieldPath, omittedFromPlanningView: false },
      displayOnly: true, displayBound: { maxBytes: 8192, maxExcerpts: 32 },
      excerpts: bytes.length === 0 ? [] : [{ startByte: 0, endByte: bytes.length, text }],
      displayedByteCount: bytes.length, omittedCandidates: 0, complete: true, omittedByteCount: 0 };
  let offset = 0;
  const lines = text.split("\n").map((line, index, all) => {
    const startByte = offset; offset += Buffer.byteLength(line + (index < all.length - 1 ? "\n" : ""));
    return { startByte, endByte: offset, text: line };
  }).filter(line => line.endByte > line.startByte);
  const candidates = [...lines.filter(line => line.text.includes("***")),
    ...lines.filter(line => line.text.includes("[error]")), ...lines.slice(0, 1), ...lines.slice(-1)];
  const excerpts: { startByte: number; endByte: number; text: string }[] = [], seen = new Set<number>();
  let displayedByteCount = 0, omittedCandidates = 0;
  for (const line of candidates) {
    if (seen.has(line.startByte)) continue;
    seen.add(line.startByte);
    const allowance = 8192 - displayedByteCount;
    if (allowance === 0 || excerpts.length === 32) { omittedCandidates++; continue; }
    let endByte = Math.min(line.endByte, line.startByte + allowance), literal: string;
    // A clipped display range must not split an encoded Unicode character.
    for (;;) {
      try { literal = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes.subarray(line.startByte, endByte)); break; }
      catch { endByte--; }
    }
    if (endByte === line.startByte) { omittedCandidates++; continue; }
    excerpts.push({ startByte: line.startByte, endByte, text: literal });
    displayedByteCount += endByte - line.startByte;
    if (endByte < line.endByte) omittedCandidates++;
  }
  return { ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== "text" && key !== "payload")),
    rawBody: { resultRef: observation.resultRef, resultDigest: observation.resultDigest, fieldPath, omittedFromPlanningView: true },
    displayOnly: true, displayBound: { maxBytes: 8192, maxExcerpts: 32 }, excerpts, displayedByteCount, omittedCandidates,
    complete: false, omittedByteCount: bytes.length - displayedByteCount };
}
/** Parent-context presentation; full admitted bodies and authority stay in their owners. */
export function projectGovernanceObservationFacts(state: GovernanceWorkState, context: WorksiteContextObservation) {
  const original = state.original;
  const record = (value: JsonValue | undefined): value is Readonly<Record<string, JsonValue>> =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  return deepFreeze(state.observations.map(observation => {
    const value = observation.value;
    const observed = observation.purpose === "testing" && Array.isArray(value.commandResults)
      ? { commandResults: value.commandResults.map((row, index) => record(row) ? { ...row,
          stdout: planningStream(observation, ["commandResults", index, "stdout"], row.stdout),
          stderr: planningStream(observation, ["commandResults", index, "stderr"], row.stderr) } : row),
          predicateObservations: Array.isArray(value.predicateObservations) ? value.predicateObservations.map((row, index) =>
            record(row) && Object.hasOwn(row, "evidence") ? { ...Object.fromEntries(Object.entries(row).filter(([key]) => key !== "evidence")),
              evidenceBody: { resultRef: observation.resultRef, resultDigest: observation.resultDigest,
                fieldPath: ["predicateObservations", index, "evidence"], omittedFromPlanningView: true } } : row) : value.predicateObservations }
      : observation.purpose === "uat" && original.fulfillment !== undefined && record(value.fulfillment)
        ? { ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== "fulfillment")),
            fulfillment: { obligations: Array.isArray(value.fulfillment.obligations) ? value.fulfillment.obligations.filter(record).map(row =>
              ({ obligationRef: row.obligationRef, judgment: row.judgment, reason: row.reason, criteria: row.criteria, depth: row.depth })) : [],
              discoveries: value.fulfillment.discoveries } }
        : value;
    const fact = observation.fulfillmentEvidence;
    return { resultRef: observation.resultRef, purpose: observation.purpose,
      selectedGraphFunctionRef: observation.selectedGraphFunctionRef, synthesisResultRef: observation.synthesisResultRef,
      actorInvocationRef: observation.actorInvocationRef, cCallRef: observation.cCallRef, resultDigest: observation.resultDigest, observed,
      ...(observation.reviewRef === undefined ? {} : { reviewRef: observation.reviewRef }),
      ...(fact === undefined ? {} : { support: { contractRef: fact.contractRef, kind: fact.kind,
        files: fact.files.map(file => ({ path: file.path, currentAtContext: context.entries.some(e =>
          e.state === "file" && e.relativePath === file.path && e.digest === file.digest) })),
        staleDependencies: fact.dependencies.filter(file => !context.entries.some(e => e.state === "file" &&
          e.relativePath === file.path && e.digest === file.digest)).map(file => file.path),
        assessmentContractRef: fact.assessmentContractRef, producerResultRef: fact.producerResultRef,
        producerActorRef: fact.producerActorRef } }) };
  }));
}
/** Presentation over the already-bound task; canonical proof stays in its owner.
 * Declared source bodies are read through the task context's reader; an
 * unavailable body refuses the presentation rather than omitting the source.
 * Offered targets under a process declaration state their permission. */
export function projectFramedSynthesisPromptTask(task: FramedSynthesisTask,
  read: WorksiteContextBodyReader = inlineWorksiteContextBody, offered: readonly FramedSynthesisTarget[] = []): Readonly<Record<string, JsonValue>> {
  const { state, context } = task, original = state.original;
  const declaredSourcePaths = new Set([...original.sources.map(source => source.path),
    ...(original.fulfillment?.context.members.map(member => member.path) ?? [])]);
  const sourceTextsInTask = new Set<string>();
  const sourceText = (entry: Extract<WorksiteContextObservation["entries"][number], { state: "file" }>) => {
    const bytes = read(entry);
    if (bytes === null) throw new TypeError("declared source body is unavailable to this presentation");
    let text: string;
    try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); }
    catch { return { encoding: "base64", content: bytes.toString("base64") }; }
    // Exact containment only. The actor receives the complete text in this
    // same prompt, not a locator that would require a forbidden file read.
    const start = text.length === 0 ? -1 : original.task.indexOf(text);
    if (start >= 0) sourceTextsInTask.add(text);
    return start < 0 ? { encoding: "utf8", content: text } :
      { contentIn: "originalTask", startCharacter: start, endCharacter: start + text.length };
  };
  const evidence = projectGovernanceObservationFacts(state, context);
  const declaration = original.fulfillment;
  const fulfillment = declaration === undefined ? null : {
    obligations: governanceFulfillmentActive(declaration, state.fulfillment!).map(active => ({
      requirementRef: active.binding.requirementRef, obligationRef: active.binding.obligationRef,
      ...( "meaning" in active ? { admittedMeaning: active.meaning } : {}),
      sourceRanges: active.term.sourceBindings.map(binding => ({
        path: declaration.context.members.find(member => member.memberRef === binding.memberRef)!.path,
        memberRef: binding.memberRef, startByte: binding.startByte, endByte: binding.endByte })),
      realizationContractRef: active.binding.realizationContractRef, proofContractRef: active.binding.proofContractRef,
      policy: active.policy === null ? null : { policyRef: active.policy.policyRef, scope: active.policy.scope,
        realizationMeaning: active.policy.realizationMeaning, proofMeaning: active.policy.proofMeaning,
        unprovedScope: active.policy.unprovedScope, closureRule: active.policy.closureRule },
      shape: active.shape === null ? null : { proofShapeRef: active.shape.proofShapeRef,
        requiredEvidenceRoles: active.shape.requiredEvidenceRoles, sharedBasis: active.shape.sharedBasis,
        requiredContent: active.shape.requiredContent, nativeCarrierBoundary: active.shape.nativeCarrierBoundary },
      completeness: active.completeness,
    })), discoveryClasses: declaration.discoveryClasses,
    sourceMembers: declaration.context.members.map(member => ({ memberRef: member.memberRef, path: member.path })),
    coverage: state.fulfillment!.coverage.map(row => ({ obligationRef: row.obligationRef, disposition: row.disposition,
      gaps: row.gaps, assessmentResultRef: row.assessmentResultRef, supportResultRefs: row.supportResultRefs })),
  };
  // The selector view is admitted I-JSON: an absent or non-I-JSON member
  // refuses the view, which the instruction assembly reports as its refusal.
  const view = admitJson({ taskRef: original.taskRef, originalTask: original.task, authorityRefs: original.authorityRefs,
    protectedSources: original.sources.map(source => source.path), requiredSupportRefs: original.requiredSupportRefs,
    worksite: { observationRef: context.observationRef, files: context.entries.map(entry => ({ path: entry.relativePath,
      state: entry.state, ...(entry.state === "file" ? { byteLength: entry.byteLength, digest: entry.digest,
        contentRole: declaredSourcePaths.has(entry.relativePath) ? "declared_source" : "observed_output",
        ...(declaredSourcePaths.has(entry.relativePath) ? sourceText(entry) : {}) } : {}) })),
      interpretation: "Observed output inventory establishes presence and byte identity only. Admitted producer reports remain attributed observations, not independent adequacy judgments. Full output bodies belong to the separately declared native work and assessment contexts." },
    workOrders: Object.fromEntries(Object.entries(original.workOrders).map(([purpose, order]) => [purpose, {
      outcome: order.outcome, originalTaskApplies: true,
      instructions: order.instructions.filter(instruction => !sourceTextsInTask.has(instruction)),
      readFirst: order.readFirst, writeRoots: order.writeRoots, checks: order.checks }])),
    testing: original.testing,
    subjectEvidenceDomains: { testing: governanceSubjectEvidenceRefs(state, "testing"), uat: governanceSubjectEvidenceRefs(state, "uat"),
      ...(original.reviews === undefined ? {} : { review: governanceSubjectEvidenceRefs(state, "review") }) },
    testingPrerequisites: { missingSelectedPaths: governanceTargetPermission(task, { purpose: "testing" }).missingSelectedPaths,
      meaning: "Immediate Testing requires every original selected path to be an observed file. Missing paths are prerequisites; a future Testing contribution remains allowed, but partial-probe prose cannot change the full declared selected-file, command or predicate plan. Presence does not prove adequacy or completion." },
    assessment: { sources: original.assessment.sources, candidatePath: original.assessment.candidatePath,
      rubricPath: original.assessment.rubricPath, resultContract: original.assessment.resultContract,
      verdictField: original.assessment.verdictField, satisfiedValue: original.assessment.satisfiedValue },
    ...(original.reviews === undefined ? {} : { reviews: { declared: original.reviews.map((review, i) => {
      const standing = state.reviewStanding![i]!;
      return { reviewRef: review.reviewRef, frame: review.frame, required: review.required,
        ...(review.notApplicableReason === undefined ? {} : { notApplicableReason: review.notApplicableReason }), outcome: review.order.outcome,
        candidatePath: review.assessment.candidatePath, rubricPath: review.assessment.rubricPath, sources: review.assessment.sources,
        standing: { resultRef: standing.resultRef, satisfied: standing.satisfied, current: standing.current } };
    }), meaning: "Required reviews gate parent completion together with acceptance: each counts only while its admitted verdict is satisfied and no later admitted effect touches its subject or the declared inputs its assessment depends on, binds only its declared frame, never replaces acceptance, and is selected through the review wrapper by its reviewRef with subject evidence from the review domain." } }),
    ...(!offered.some(t => t.requiredReviews !== undefined) ? {} : { prerequisites: { targets: offered.flatMap(target => {
      const permission = governanceTargetPermission(task, target);
      return permission.offered ? [{ graphFunctionRef: target.graphFunctionRef, purpose: target.purpose, requiredReviews: target.requiredReviews ?? [],
        permitted: permission.permitted, missingReviews: permission.missingReviews }] : [];
    }), meaning: "Only permitted work can be selected next: a target is permitted when its declared prerequisites hold, including every review its Program requires that this task declares as required being satisfied and current, while stated dependencies remain advisory planning and a target that is not permitted may still appear as future work." } }),
    fulfillment, observations: evidence, planningEvidenceMeaning: "A strict UTF-8 stream of at most 8192 bytes is shown whole as one exact excerpt marked complete. Longer or non-UTF-8 streams and detailed predicate proof are explicitly omitted from this selector view, with byte counts, and remain in the cited admitted Result. Field paths are relative to that Result value; metadata grants no lookup authority or automatic external read. Excerpts are bounded literal diagnostics at exact UTF-8 byte ranges, not interpreted failure names or verdicts. All original criteria and unresolved outcomes remain governing. C2 success is a measurement observation, never application acceptance.", unresolvedSupportRefs: state.unresolvedSupportRefs,
    priorJudgment: state.synthesis === null ? null : { resultRef: state.synthesis.resultRef, judgment: state.synthesis.judgment },
    ...(task.failedAttempts === undefined ? {} : { failedAttempts: { attempts: task.failedAttempts, meaning: "Each step of this Run that failed and returned here, in order, left the work state unchanged: the graph its selection chose or, when the selection was refused as not permitted, the graph it named (null when it named none), the originating failure class, the timeout class when its process was contained, the worksite paths the failed attempt left changed, the typed refusal when the selection itself was refused, and the failure Result ref, which is admissible evidence." } }),
  });
  if (view.kind !== "ok" || !isRecord(view.value)) throw new TypeError("framed synthesis selector view is not I-JSON");
  return view.value;
}
/** One strict binder, shared by raw completion and admission. It transports no
 * provider edits to original state and stores no previous bound Result body. */
export function bindFramedSynthesisResult(task: FramedSynthesisTask, offered: readonly FramedSynthesisTarget[],
  basis: FramedSynthesisBasis, raw: unknown): Readonly<FramedSynthesisResult> | null {
  if (!isFramedSynthesisTask(task) || !isFramedSynthesisJudgment(raw) || !v.is(synthesisBasisSchema, basis) ||
    basis.taskRef !== task.state.original.taskRef || basis.contextRef !== task.context.observationRef ||
    basis.previousResultRef !== (task.state.synthesis?.resultRef ?? null) || !unique(offered.map(t => t.graphFunctionRef))) return null;
  const targets = offered.filter(t => governanceTargetPermission(task, t).offered), reviews = task.state.original.reviews;
  const evidence = framedSynthesisEvidenceRefs(task), supports = task.state.unresolvedSupportRefs;
  if (task.state.original.fulfillment === undefined ? raw.requirementProposals !== undefined : raw.requirementProposals === undefined ||
    deriveGovernanceObligations(task.state.original.fulfillment, task.state.fulfillment!, raw.requirementProposals,
      task.state.original.taskRef, "pending:admitted-synthesis", task.context, evidence) === null) return null;
  const validEvidence = (refs: readonly string[]) => refs.every(ref => evidence.includes(ref));
  if (raw.contributions.some(c => !targets.some(t => t.graphFunctionRef === c.graphFunctionRef) ||
      !c.supportRefs.every(ref => supports.includes(ref)) || !validEvidence(c.evidenceRefs)) ||
    raw.gaps.some(g => !g.supportRefs.every(ref => supports.includes(ref)) || !validEvidence(g.evidenceRefs)) ||
    !validEvidence(raw.nextEvidenceRefs) || !validEvidence(raw.revisionEvidenceRefs)) return null;
  const next = targets.find(t => t.graphFunctionRef === raw.nextGraphFunctionRef);
  if (reviews === undefined ? raw.reviewRef !== undefined : raw.reviewRef === undefined ||
    (next?.purpose === "review" ? !reviews.some(r => r.reviewRef === raw.reviewRef) : raw.reviewRef !== null)) return null;
  if (next !== undefined && !governanceTargetPermission(task, next).permitted) return null;
  if (!governanceSubjectEvidenceRefs(task.state, next?.purpose ?? null).includes(raw.subjectEvidenceRef)) return null;
  return deepFreeze({ kind: "framed_synthesis_result", schemaVersion: "5.0.0", state: task.state, basis, judgment: raw });
}
export function framedSynthesisResponseSchema(task: FramedSynthesisTask, offered: readonly FramedSynthesisTarget[]): Readonly<Record<string, JsonValue>> {
  const targets = offered.filter(t => governanceTargetPermission(task, t).offered), reviews = task.state.original.reviews?.map(r => r.reviewRef);
  const textSchema = { type: "string", minLength: 1 };
  const reference = (domain: readonly string[]) => domain.length ? { type: "string", enum: [...domain] } : false;
  const array = (domain: readonly string[]) => ({ type: "array", uniqueItems: true, items: reference(domain) });
  const object = (properties: Readonly<Record<string, JsonValue>>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) });
  const graphs = targets.map(t => t.graphFunctionRef), evidence = framedSynthesisEvidenceRefs(task), support = task.state.unresolvedSupportRefs;
  const immediateGraphs = targets.filter(t => governanceTargetPermission(task, t).permitted).map(t => t.graphFunctionRef);
  const subjects = targets.map(target => ({ graphFunctionRef: target.graphFunctionRef, purpose: target.purpose, refs: governanceSubjectEvidenceRefs(task.state, target.purpose) }));
  const response = object({ interpretation: textSchema,
    contributions: { type: "array", maxItems: graphs.length, description: "At most one contribution row per graphFunctionRef in this current mapping.", items: object({ graphFunctionRef: reference(graphs), contribution: textSchema, reason: textSchema,
      supportRefs: array(support), evidenceRefs: array(evidence), dependsOn: { ...array(graphs), description: "Every dependency must name a different contribution in THIS response. Prior completed work outside this current mapping belongs in evidenceRefs, not dependsOn. Mapping membership does not require execution; only the explicit next member executes." } }) },
    gaps: { type: "array", items: object({ supportRefs: { ...array(support), minItems: 1 }, reason: textSchema, evidenceRefs: array(evidence) }) },
    nextGraphFunctionRef: { type: ["string", "null"], enum: [...immediateGraphs, null], description: "Must name a contribution row in THIS response, explicitly chosen to execute next. Testing is available immediately only when every original selected path is an observed file; future Testing contributions remain allowed. If null, gaps must be nonempty and subjectEvidenceRef must be null. Dependencies are semantic judgments, not an automatic schedule." },
    nextReason: textSchema, nextEvidenceRefs: array(evidence),
    subjectEvidenceRef: { type: ["string", "null"], enum: [...new Set(subjects.flatMap(subject => subject.refs)), null].filter((ref, index, all) => all.indexOf(ref) === index),
      description: "For UAT, select the exact current native-work or C2 measurement Result to assess. For Testing, optionally select a current native-work Result; null observes supplied files. For other work or gap, null." },
    ...(reviews === undefined ? {} : { reviewRef: { type: ["string", "null"], enum: [...reviews, null],
      description: "For the review wrapper, name the declared review to run; its subjectEvidenceRef selects the exact current Result it assesses. For other work or gap, null." } }),
    revisionReason: textSchema, revisionEvidenceRefs: array(evidence),
    ...(task.state.original.fulfillment === undefined ? {} : { requirementProposals: { type: "array", description: "Propose only additional source-grounded obligations. Use local candidate refs, never invented admitted identities. Preserve originals; missing policy remains open.", items: object({
      candidateRef: textSchema, classRef: reference(task.state.original.fulfillment.discoveryClasses.map(c => c.classRef)), meaning: textSchema, reason: textSchema,
      sourceQuotes: { type: "array", minItems: 1, items: object({ memberRef: reference(task.state.original.fulfillment.context.members.map(m => m.memberRef)), quote: textSchema }) },
      predecessorRequirementRefs: array([...task.state.original.fulfillment.terms.map(t => t.requirementRef), ...task.state.fulfillment!.additions.map(a => a.term.requirementRef)]), evidenceRefs: array(evidence) }) } })
  });
  const reviewRef = (purpose: GovernancePurpose | null) => reviews === undefined ? {} : { reviewRef: purpose === "review" ? { enum: [...reviews] } : { const: null } };
  return deepFreeze({ ...response, anyOf: [...subjects.map(subject => ({ properties: {
    nextGraphFunctionRef: { const: subject.graphFunctionRef }, subjectEvidenceRef: subject.refs.length === 0 ? false : { enum: [...subject.refs] }, ...reviewRef(subject.purpose) } })),
    { properties: { nextGraphFunctionRef: { const: null }, subjectEvidenceRef: { const: null }, ...reviewRef(null) } }] });
}
