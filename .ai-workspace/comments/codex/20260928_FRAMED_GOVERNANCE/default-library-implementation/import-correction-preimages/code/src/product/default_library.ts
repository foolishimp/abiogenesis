import * as v from "valibot";
import { isDeepStrictEqual } from "node:util";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import type { NativeWorkspaceAssessmentSelection } from "./native_workspace_assessment.js";

export const governanceRef = (kind: string, name: string) => `${kind}://abiogenesis/default-library/${name}@5`;
export const governanceContract = (name: string) => governanceRef("contract", name);
export const GOVERNANCE_PURPOSES = ["induction", "specification", "design", "construction", "testing", "uat"] as const;
export type GovernancePurpose = typeof GOVERNANCE_PURPOSES[number];
export const GOVERNANCE_OPERATIONS = ["prepare-selection", "select", "evaluate-parent", "prepare-native", "prepare-testing", "fold"] as const;
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
  cCallRef: text, actorInvocationRef: v.nullable(text), value: jsonRecord });
const stateSchema = v.strictObject({ kind: v.literal("governance_work_state"), schemaVersion: v.literal("5.0.0"),
  original: originalSchema, observations: v.array(observationSchema), unresolvedSupportRefs: texts, terminal: v.boolean() });
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
    observations: [], unresolvedSupportRefs: [...original.requiredSupportRefs], terminal: false };
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
