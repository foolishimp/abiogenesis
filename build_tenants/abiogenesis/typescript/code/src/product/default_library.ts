import * as v from "valibot";
import { isDeepStrictEqual } from "node:util";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import type { NativeWorkspaceAssessmentSelection } from "./native_workspace_assessment.js";
import { isWorksiteContextObservation, type WorksiteContextObservation } from "./worksite_effect.js";

import { governanceRef } from "./default_library_identity.js";
export { governanceRef, governanceContract } from "./default_library_identity.js";
export const GOVERNANCE_PURPOSES = ["induction", "specification", "design", "construction", "testing", "uat"] as const;
export type GovernancePurpose = typeof GOVERNANCE_PURPOSES[number];
export const GOVERNANCE_OPERATIONS = ["prepare-selection", "select", "evaluate-parent", "prepare-native", "prepare-testing", "fold", "project-choice"] as const;
export type GovernanceOperation = typeof GOVERNANCE_OPERATIONS[number];
export const GOVERNANCE_IMPLEMENTATION_REFS = GOVERNANCE_OPERATIONS.map(n => governanceRef("implementation", n));
export const DEFAULT_LIBRARY_POLICY = `Ordinary conditional governance capabilities. Preserve the complete original task, source, selected authority, valid work and unresolved outcomes. Reuse sufficient existing artifacts without rerunning their authors. Missing capability or authority remains an explicit gap. Open interpretation, suitability and sufficiency are native F_P judgments; deterministic adapters only project declared data and admitted observations. A completed child or successful measurement does not establish application success. Testing records actual commands, streams and predicates, including failures. UAT independently assesses the original source, exact candidate, rubric and current admitted execution evidence. Only the parent projects the independent verdict into its declared termination rule. No mandatory stage order, caller loop, invented source, claimed execution file or generated runtime graph.\n`;
export const GOVERNANCE_POLICIES: Readonly<Record<GovernancePurpose, string>> = deepFreeze({
  induction: "Establish the task model from complete source: outcome, users, constraints, modality, conflicts, assumptions and unknowns. Preserve unresolved questions; distinguish source statements from interpretation.",
  specification: "State source-grounded behavior, boundaries and testable acceptance criteria. Preserve valid supplied requirements, conflicts and unknowns. Do not require a fresh induction artifact.",
  design: "Describe a realizable bounded change against the actual worksite and existing capabilities. Preserve selected criteria and supply a meaningful executable proof plan; expose missing dependencies or capacity.",
  construction: "Implement only the selected bounded change. Preserve original sources, valid supplied assets and declared effect scope. A report or self-run check is not independent acceptance.",
  testing: "Execute the selected reproducible command plan against the actual files and retain command, stream and predicate observations, including nonzero exits. Reuse files without inventing an author. A missing verifier or command plan is a gap, not permission to fabricate evidence.",
  uat: "Independently assess the full original outcome using the exact candidate, consumer rubric and current admitted execution observations. Preserve unmet and indeterminate criteria. Do not edit files or certify success merely from a report, file presence or stage count.",
});

const text = v.pipe(v.string(), v.minLength(1));
const texts = v.array(text);
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/));
const judgmentSchema = v.strictObject({ interpretation: text,
  contributions: v.array(v.strictObject({ graphFunctionRef: text, contribution: text, reason: text, supportRefs: texts, evidenceRefs: texts, dependsOn: texts })),
  gaps: v.array(v.strictObject({ supportRefs: texts, reason: text, evidenceRefs: texts })),
  nextGraphFunctionRef: v.nullable(text), nextReason: text, nextEvidenceRefs: texts, subjectEvidenceRef: v.nullable(text),
  revisionReason: text, revisionEvidenceRefs: texts });
const synthesisBasisSchema = v.strictObject({ inputRef: text, inputDigest: digest, taskRef: text,
  environmentRef: text, environmentDigest: digest, frameEvidenceDigest: digest, frameRefs: texts,
  contextRef: text, previousResultRef: v.nullable(text) });
const currentSynthesisSchema = v.strictObject({ resultRef: text, resultDigest: digest, basis: synthesisBasisSchema, judgment: judgmentSchema });
const jsonRecord = v.custom<Readonly<Record<string, JsonValue>>>(x => typeof x === "object" && x !== null && !Array.isArray(x));
const workOrder = v.strictObject({ outcome: text, instructions: texts, readFirst: texts, writeRoots: texts, checks: texts });
const source = v.strictObject({ path: text, digest });
const originalSchema = v.strictObject({ taskRef: text, task: text, sources: v.pipe(v.array(source), v.minLength(1)),
  requiredSupportRefs: v.pipe(texts, v.minLength(1)), authorityRefs: texts,
  readRoots: v.pipe(texts, v.minLength(1)), maxContextFiles: v.pipe(v.number(), v.integer(), v.minValue(1)),
  maxContextBytes: v.pipe(v.number(), v.integer(), v.minValue(1)), maxPromptBytes: v.pipe(v.number(), v.integer(), v.minValue(1)),
  workOrders: v.record(text, workOrder),
  testing: v.strictObject({ selectedPaths: v.pipe(texts, v.minLength(1)), commands: v.array(jsonRecord), outcomePredicates: v.array(jsonRecord), allowedWriteTerritories: v.array(jsonRecord) }),
  assessment: v.strictObject({ sources: v.pipe(texts, v.minLength(1)), candidatePath: text, rubricPath: text,
    resultContract: jsonRecord, schemaAsset: jsonRecord, verdictField: text, satisfiedValue: text }) });
const observationSchema = v.strictObject({ purpose: v.picklist(GOVERNANCE_PURPOSES), resultRef: text, resultDigest: digest,
  cCallRef: text, actorInvocationRef: v.nullable(text), synthesisResultRef: text, selectedGraphFunctionRef: text, value: jsonRecord });
const stateSchema = v.strictObject({ kind: v.literal("governance_work_state"), schemaVersion: v.literal("5.0.0"),
  original: originalSchema, synthesis: v.nullable(currentSynthesisSchema), observations: v.array(observationSchema), unresolvedSupportRefs: texts, terminal: v.boolean() });
export type GovernanceWorkState = v.InferOutput<typeof stateSchema>;
export type GovernanceObservation = GovernanceWorkState["observations"][number];
export type GovernanceOriginal = GovernanceWorkState["original"];
export function isGovernanceWorkState(value: unknown): value is GovernanceWorkState {
  return v.is(stateSchema, value) && new Set(value.original.requiredSupportRefs).size === value.original.requiredSupportRefs.length &&
    new Set(value.original.sources.map(s => s.path)).size === value.original.sources.length &&
    (value.terminal ? value.unresolvedSupportRefs.length === 0 : isDeepStrictEqual(value.unresolvedSupportRefs, value.original.requiredSupportRefs));
}
export function constructGovernanceWorkState(original: GovernanceOriginal): Readonly<GovernanceWorkState> {
  const state = { kind: "governance_work_state" as const, schemaVersion: "5.0.0" as const, original,
    synthesis: null, observations: [], unresolvedSupportRefs: [...original.requiredSupportRefs], terminal: false };
  if (!isGovernanceWorkState(state)) throw new TypeError("governance input requires complete original source, scope and declared work contracts");
  return deepFreeze(state);
}
export function governanceTestingConfiguration(state: GovernanceWorkState) {
  const t = state.original.testing;
  return { commands: t.commands as unknown as readonly WorksiteDeclaredCommandInput[],
    outcomePredicates: t.outcomePredicates as unknown as readonly WorksiteOutcomePredicateInput[],
    allowedWriteTerritories: t.allowedWriteTerritories as unknown as readonly WorksiteCommandWriteTerritoryInput[] };
}
export function governanceAssessmentContract(state: GovernanceWorkState) {
  return state.original.assessment as unknown as { sources: readonly string[]; candidatePath: string; rubricPath: string;
    resultContract: NativeWorkspaceAssessmentSelection["resultContract"]; schemaAsset: NativeWorkspaceAssessmentSelection["schemaAsset"];
    verdictField: string; satisfiedValue: string };
}
/** This reads a declared scalar verdict only. The owned parent projection additionally
 * establishes the independent assessment's current producer and causal relation. */
export function governanceVerdict(state: GovernanceWorkState): boolean {
  const last = state.observations.at(-1);
  return last?.purpose === "uat" && last.value[state.original.assessment.verdictField] === state.original.assessment.satisfiedValue;
}

export type FramedSynthesisJudgment = v.InferOutput<typeof judgmentSchema>;
export type FramedSynthesisBasis = v.InferOutput<typeof synthesisBasisSchema>;
export interface FramedSynthesisTarget { readonly graphFunctionRef: string; readonly definitionDigest: `sha256:${string}`; readonly purpose: GovernancePurpose }
export interface FramedSynthesisTask {
  readonly kind: "framed_synthesis_task"; readonly schemaVersion: "5.0.0";
  readonly state: GovernanceWorkState; readonly context: WorksiteContextObservation;
}
export interface FramedSynthesisResult {
  readonly kind: "framed_synthesis_result"; readonly schemaVersion: "5.0.0";
  readonly state: GovernanceWorkState; readonly basis: FramedSynthesisBasis; readonly judgment: FramedSynthesisJudgment;
}
const exactKeys = (value: object, keys: readonly string[]) => Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
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
    state: v.custom<GovernanceWorkState>(isGovernanceWorkState), context: v.custom<WorksiteContextObservation>(isWorksiteContextObservation) }), value) && !value.state.terminal;
}
export function isFramedSynthesisResult(value: unknown): value is FramedSynthesisResult {
  if (typeof value !== "object" || value === null || !exactKeys(value, ["kind", "schemaVersion", "state", "basis", "judgment"])) return false;
  const r = value as FramedSynthesisResult;
  return r.kind === "framed_synthesis_result" && r.schemaVersion === "5.0.0" && isGovernanceWorkState(r.state) &&
    v.is(synthesisBasisSchema, r.basis) && isFramedSynthesisJudgment(r.judgment) && r.basis.taskRef === r.state.original.taskRef &&
    r.basis.previousResultRef === (r.state.synthesis?.resultRef ?? null);
}
export function framedSynthesisEvidenceRefs(task: FramedSynthesisTask): readonly string[] {
  return [task.state.original.taskRef, task.context.observationRef, ...task.state.observations.map(o => o.resultRef),
    ...(task.state.synthesis === null ? [] : [task.state.synthesis.resultRef])];
}
/** One strict binder, shared by raw completion and admission. It transports no
 * provider edits to original state and stores no previous bound Result body. */
export function bindFramedSynthesisResult(task: FramedSynthesisTask, targets: readonly FramedSynthesisTarget[],
  basis: FramedSynthesisBasis, raw: unknown): Readonly<FramedSynthesisResult> | null {
  if (!isFramedSynthesisTask(task) || !isFramedSynthesisJudgment(raw) || !v.is(synthesisBasisSchema, basis) ||
    basis.taskRef !== task.state.original.taskRef || basis.contextRef !== task.context.observationRef ||
    basis.previousResultRef !== (task.state.synthesis?.resultRef ?? null) || !unique(targets.map(t => t.graphFunctionRef))) return null;
  const evidence = framedSynthesisEvidenceRefs(task), supports = task.state.unresolvedSupportRefs;
  const validEvidence = (refs: readonly string[]) => refs.every(ref => evidence.includes(ref));
  if (raw.contributions.some(c => !targets.some(t => t.graphFunctionRef === c.graphFunctionRef) ||
      !c.supportRefs.every(ref => supports.includes(ref)) || !validEvidence(c.evidenceRefs)) ||
    raw.gaps.some(g => !g.supportRefs.every(ref => supports.includes(ref)) || !validEvidence(g.evidenceRefs)) ||
    !validEvidence(raw.nextEvidenceRefs) || !validEvidence(raw.revisionEvidenceRefs)) return null;
  const next = targets.find(t => t.graphFunctionRef === raw.nextGraphFunctionRef);
  if (raw.subjectEvidenceRef !== null && !task.state.observations.some(o => o.resultRef === raw.subjectEvidenceRef) ||
    next?.purpose === "uat" && raw.subjectEvidenceRef === null ||
    raw.subjectEvidenceRef !== null && next?.purpose !== "uat" && next?.purpose !== "testing") return null;
  return deepFreeze({ kind: "framed_synthesis_result", schemaVersion: "5.0.0", state: task.state, basis, judgment: raw });
}
export function framedSynthesisResponseSchema(task: FramedSynthesisTask, targets: readonly FramedSynthesisTarget[]): Readonly<Record<string, JsonValue>> {
  const textSchema = { type: "string", minLength: 1 };
  const reference = (domain: readonly string[]) => domain.length ? { type: "string", enum: [...domain] } : false;
  const array = (domain: readonly string[]) => ({ type: "array", uniqueItems: true, items: reference(domain) });
  const object = (properties: Record<string, unknown>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) });
  const graphs = targets.map(t => t.graphFunctionRef), evidence = framedSynthesisEvidenceRefs(task), support = task.state.unresolvedSupportRefs;
  return deepFreeze(object({ interpretation: textSchema,
    contributions: { type: "array", maxItems: graphs.length, description: "At most one contribution row per graphFunctionRef in this current mapping.", items: object({ graphFunctionRef: reference(graphs), contribution: textSchema, reason: textSchema,
      supportRefs: array(support), evidenceRefs: array(evidence), dependsOn: { ...array(graphs), description: "Every dependency must name a different contribution in THIS response. Prior completed work outside this current mapping belongs in evidenceRefs, not dependsOn. Mapping membership does not require execution; only the explicit next member executes." } }) },
    gaps: { type: "array", items: object({ supportRefs: { ...array(support), minItems: 1 }, reason: textSchema, evidenceRefs: array(evidence) }) },
    nextGraphFunctionRef: { type: ["string", "null"], enum: [...graphs, null], description: "Must name a contribution row in THIS response, explicitly chosen to execute next. If null, gaps must be nonempty and subjectEvidenceRef must be null. Dependencies are semantic judgments, not an automatic schedule." },
    nextReason: textSchema, nextEvidenceRefs: array(evidence),
    subjectEvidenceRef: { type: ["string", "null"], enum: [...task.state.observations.map(o => o.resultRef), null],
      description: "For UAT, select the exact current native-work or C2 measurement Result to assess. For Testing, optionally select a current native-work Result; null observes supplied files. For other work or gap, null." },
    revisionReason: textSchema, revisionEvidenceRefs: array(evidence) }) as unknown as Readonly<Record<string, JsonValue>>);
}
