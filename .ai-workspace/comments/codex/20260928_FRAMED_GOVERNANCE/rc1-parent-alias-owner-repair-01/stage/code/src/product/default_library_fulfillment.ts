import * as v from "valibot";
import { toJsonSchema } from "@valibot/to-json-schema";
import { isDeepStrictEqual as same } from "node:util";
import { CONTEXT_DECLARATION_SCHEMA, REQUIREMENT_TERM_SCHEMA, GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA } from "../gtl/requirement_handoff.js";
import { POLICY_SCHEMA, SHAPE_SCHEMA } from "../gtl/semantic_stage.js";
import type { ContractDeclaration, GtlProgram } from "../gtl/contracts.js";
import type { WorksiteContextObservation } from "./worksite_effect.js";
import { sha256Canonical, sha256Bytes } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { groundBoundSourceQuote } from "./requirement_handoff.js";
import { governanceRef } from "./default_library_identity.js";

export const GOVERNANCE_FULFILLMENT_PROFILE = governanceRef("policy", "admitted-fulfillment");
export const GOVERNANCE_FULFILLMENT_STRENGTH = governanceRef("rule", "declared-current-independent-evidence");
export const GOVERNANCE_FULFILLMENT_DISCOVERY = governanceRef("rule", "admitted-requirement-proposals");
const ref = v.pipe(v.string(), v.minLength(1)), refs = v.array(ref), digest = v.pipe(ref, v.regex(/^sha256:[a-f0-9]{64}$/));
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
const judgment = v.picklist(["satisfied", "falsified", "indeterminate"]);
const file = v.strictObject({ path: ref, digest });
const proofRole = v.picklist(["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"]);
const completeness = v.strictObject({ policyRef: ref, semanticCriteria: refs,
  depthClasses: v.array(v.strictObject({ classRef: ref, permitsNonApplicability: v.boolean() })), strengthRuleRef: ref,
  adverseCommands: v.array(v.strictObject({ commandId: ref, disposition: v.picklist(["nonzero", "zero"]) })) });
export const GOVERNANCE_FULFILLMENT_DECLARATION_SCHEMA = v.strictObject({ profileRef: v.literal(GOVERNANCE_FULFILLMENT_PROFILE),
  context: CONTEXT_DECLARATION_SCHEMA, terms: v.pipe(v.array(REQUIREMENT_TERM_SCHEMA), v.minLength(1)),
  bindings: v.pipe(v.array(GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA), v.minLength(1)),
  policies: v.array(POLICY_SCHEMA), shapes: v.array(SHAPE_SCHEMA), completeness: v.array(completeness),
  discoveryClasses: v.array(v.strictObject({ classRef: ref, ruleRef: ref, templatePolicyRef: v.nullable(ref), templateShapeRef: v.nullable(ref) })),
  assessmentContractRef: ref });
export type GovernanceFulfillmentDeclaration = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_DECLARATION_SCHEMA>;
export const GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA = v.strictObject({ candidateRef: ref, classRef: ref, meaning: ref, reason: ref,
  sourceQuotes: v.pipe(v.array(v.strictObject({ memberRef: ref, quote: ref })), v.minLength(1)),
  predecessorRequirementRefs: refs, evidenceRefs: refs });
export type GovernanceRequirementProposal = v.InferOutput<typeof GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA>;
// This static role relation also generates the native response schema. Evidence
// membership and semantic sufficiency remain with the binder and assessment.
const selection = v.union([
  v.strictObject({ role: v.picklist(["realization", "verifier_artifact"]), resultRef: ref,
    artifactPath: v.pipe(ref, v.description("Select the realization or verifier artifact path from this prior Result's files.")),
    commandId: v.pipe(v.null(), v.description("Must be null for realization and verifier_artifact, including artifacts observed by C2.")) }),
  v.strictObject({ role: v.literal("verifier_execution"), resultRef: ref,
    artifactPath: v.pipe(v.null(), v.description("Must be null for verifier_execution; select the command, not an artifact path.")),
    commandId: v.pipe(ref, v.description("Select a command ID from this prior execution Result's commands.")) }),
]);
const assessmentRow = v.strictObject({ obligationRef: ref, policyRef: v.nullable(ref), shapeRef: v.nullable(ref), judgment, reason: ref,
  support: v.array(selection), adverseEvidenceRefs: refs, criteria: v.array(v.strictObject({ criterionRef: ref, judgment, reason: ref })),
  depth: v.array(v.strictObject({ classRef: ref, judgment: v.picklist(["satisfied", "falsified", "indeterminate", "not_applicable"]), reason: ref, evidenceRefs: refs })) });
export const GOVERNANCE_FULFILLMENT_ASSESSMENT_SCHEMA = v.strictObject({ obligations: v.array(assessmentRow),
  discoveries: v.array(v.strictObject({ classRef: ref, judgment, reason: ref, evidenceRefs: refs })) });
export type GovernanceFulfillmentAssessment = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_ASSESSMENT_SCHEMA>;
const addition = v.strictObject({ candidateRef: ref, classRef: ref, meaning: ref, proposalDigest: digest, introducedByResultRef: ref,
  term: REQUIREMENT_TERM_SCHEMA, binding: GTL_CONTRACT_FULFILLMENT_BINDING_SCHEMA,
  policy: v.nullable(POLICY_SCHEMA), shape: v.nullable(SHAPE_SCHEMA), completeness: v.nullable(completeness) });
const coverageRow = v.strictObject({ obligationRef: ref, disposition: v.picklist(["eligible", "open", "stale"]), gaps: refs,
  assessmentResultRef: v.nullable(ref), supportResultRefs: refs, dependencies: v.array(file) });
export const GOVERNANCE_FULFILLMENT_STATE_SCHEMA = v.strictObject({ additions: v.array(addition), coverage: v.array(coverageRow) });
export type GovernanceFulfillmentState = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_STATE_SCHEMA>;
/** Owned at existing retained child fold, never a worker-authored evidence packet. */
export const GOVERNANCE_FULFILLMENT_EVIDENCE_SCHEMA = v.strictObject({ resultRef: ref, resultDigest: digest, contractRef: ref,
  cCallRef: ref, actorInvocationRef: ref, kind: v.picklist(["native", "execution", "assessment"]),
  files: v.array(file), dependencies: v.array(file), commands: v.array(v.strictObject({ commandId: ref, exitStatus: v.nullable(v.number()), timedOut: v.boolean() })),
  assessmentContractRef: v.nullable(ref), producerResultRef: v.nullable(ref), producerActorRef: v.nullable(ref) });
export type GovernanceFulfillmentEvidence = v.InferOutput<typeof GOVERNANCE_FULFILLMENT_EVIDENCE_SCHEMA>;

export function isGovernanceFulfillmentDeclaration(value: unknown): value is GovernanceFulfillmentDeclaration {
  if (!v.is(GOVERNANCE_FULFILLMENT_DECLARATION_SCHEMA, value)) return false;
  const d = value;
  return unique(d.context.members.map(m => m.memberRef)) && unique(d.context.members.map(m => m.path)) &&
    unique(d.terms.map(t => t.requirementRef)) && unique(d.bindings.map(b => b.obligationRef)) && unique(d.bindings.map(b => b.requirementRef)) &&
    same(d.terms.map(t => t.requirementRef), d.bindings.map(b => b.requirementRef)) &&
    unique(d.policies.map(p => p.policyRef)) && unique(d.shapes.map(s => s.proofShapeRef)) && unique(d.completeness.map(p => p.policyRef)) &&
    unique(d.discoveryClasses.map(c => c.classRef)) && d.completeness.every(c => unique(c.semanticCriteria) && unique(c.depthClasses.map(x => x.classRef))) &&
    d.bindings.every(b => {
      const term = d.terms.find(t => t.requirementRef === b.requirementRef)!;
      const p = d.policies.find(p => p.policyRef === b.proofPolicyRef), s = d.shapes.find(s => s.proofShapeRef === b.proofShapeRef);
      return (b.proofPolicyRef === null || p !== undefined && p.obligationRef === b.obligationRef && p.sourceRequirementRef === b.requirementRef && same(p.sourceBindings, term.sourceBindings)) &&
        (b.proofShapeRef === null || s !== undefined && s.obligationRef === b.obligationRef && s.requirementRef === b.requirementRef &&
          s.roleContractRefs.realization === b.realizationContractRef && s.roleContractRefs.proof === b.proofContractRef && unique(s.requiredEvidenceRoles));
    }) && d.terms.every(t => t.sourceBindings.every(b => {
      const m = d.context.members.find(m => m.memberRef === b.memberRef);
      return m !== undefined && b.contextRef === d.context.contextRef && b.memberDigest === m.digest && b.startByte < b.endByte && b.endByte <= m.byteCount;
    }));
}
/** Conditional selection over admitted definitions, with no definition hashing. */
export function governanceFulfillmentSelection(program: Pick<GtlProgram, "policies">, original: { fulfillment?: GovernanceFulfillmentDeclaration | undefined;
  sources: readonly { path: string; digest: string }[]; requiredSupportRefs: readonly string[]; assessment: { resultContract: Readonly<Record<string, JsonValue>> } }): "absent" | "selected" | "invalid" {
  const selected = program.policies["abg.default_library_fulfillment"], d = original.fulfillment;
  if (selected === undefined) return d === undefined ? "absent" : "invalid";
  return selected === GOVERNANCE_FULFILLMENT_PROFILE && d?.profileRef === selected &&
    d.context.members.every(m => original.sources.some(s => s.path === m.path && s.digest === m.digest)) &&
    same(original.requiredSupportRefs, d.bindings.map(b => b.obligationRef)) && original.assessment.resultContract.contractRef === d.assessmentContractRef ? "selected" : "invalid";
}
export function governanceFulfillmentContractsMatch(d: GovernanceFulfillmentDeclaration, contract: (ref: string) => ContractDeclaration | null): boolean {
  return [...new Set(d.bindings.flatMap(b => [b.realizationContractRef, b.proofContractRef]).filter((r): r is string => r !== null))]
    .every(r => contract(r)?.contractKind === "output") && contract(d.assessmentContractRef)?.contractKind === "output";
}
/** First source acquisition only; subsequent internal owners retain this binding. */
export function governanceFulfillmentSourceMatches(d: GovernanceFulfillmentDeclaration, context: WorksiteContextObservation): boolean {
  if (hash(d.context.members) !== d.context.inventoryDigest) return false;
  return d.context.members.every(m => {
    const e = context.entries.find(e => e.relativePath === m.path);
    if (e?.state !== "file" || e.digest !== m.digest || e.byteLength !== m.byteCount) return false;
    const bytes = Buffer.from(e.bytes, "base64");
    return d.terms.every(t => t.sourceBindings.filter(b => b.memberRef === m.memberRef).every(b => sha256Bytes(bytes.subarray(b.startByte, b.endByte)) === b.spanDigest));
  });
}
export function governanceFulfillmentActive(d: GovernanceFulfillmentDeclaration, state: GovernanceFulfillmentState) {
  return [...d.bindings.map((binding, i) => ({ binding, term: d.terms[i]!, policy: d.policies.find(p => p.policyRef === binding.proofPolicyRef) ?? null,
    shape: d.shapes.find(s => s.proofShapeRef === binding.proofShapeRef) ?? null, completeness: d.completeness.find(c => c.policyRef === binding.proofPolicyRef) ?? null })), ...state.additions];
}
export function initialGovernanceFulfillment(d: GovernanceFulfillmentDeclaration): GovernanceFulfillmentState {
  return { additions: [], coverage: d.bindings.map(b => ({ obligationRef: b.obligationRef, disposition: "open", gaps: ["assessment_missing"], assessmentResultRef: null, supportResultRefs: [], dependencies: [] })) };
}
export function governanceFulfillmentStateMatches(d: GovernanceFulfillmentDeclaration, state: GovernanceFulfillmentState): boolean {
  const active = governanceFulfillmentActive(d, state);
  return unique(active.map(r => r.binding.obligationRef)) && unique(active.map(r => r.binding.requirementRef)) && unique(state.additions.map(a => a.candidateRef)) &&
    same(state.coverage.map(r => r.obligationRef), active.map(r => r.binding.obligationRef));
}
export function deriveGovernanceObligations(d: GovernanceFulfillmentDeclaration, prior: GovernanceFulfillmentState,
  proposals: readonly GovernanceRequirementProposal[], taskRef: string, sourceResultRef: string, context: WorksiteContextObservation,
  evidenceRefs: readonly string[]): GovernanceFulfillmentState | null {
  if (!unique(proposals.map(p => p.candidateRef))) return null;
  const additions = [...prior.additions], active = governanceFulfillmentActive(d, prior);
  for (const p of proposals) {
    if (!v.is(GOVERNANCE_REQUIREMENT_PROPOSAL_SCHEMA, p) || !unique(p.evidenceRefs) || !p.evidenceRefs.every(r => evidenceRefs.includes(r)) ||
      !p.predecessorRequirementRefs.every(r => active.some(a => a.term.requirementRef === r))) return null;
    const c = d.discoveryClasses.find(c => c.classRef === p.classRef); if (c === undefined) return null;
    const proposalDigest = hash(p), known = additions.find(a => a.candidateRef === p.candidateRef);
    if (known) { if (known.proposalDigest !== proposalDigest) return null; continue; }
    const sourceBindings = p.sourceQuotes.map(q => {
      const m = d.context.members.find(m => m.memberRef === q.memberRef), e = context.entries.find(e => e.relativePath === m?.path);
      return m !== undefined && e?.state === "file" && e.digest === m.digest
        ? groundBoundSourceQuote(d.context.contextRef, { memberRef: m.memberRef, digest: m.digest, base64: e.bytes }, q.quote) : null;
    });
    if (sourceBindings.some(b => b === null)) return null;
    const id = hash({ taskRef, proposal: p, sourceBindings }).slice(7), requirementRef = governanceRef("requirement", id), obligationRef = governanceRef("obligation", id);
    const term = { requirementRef, sourceBindings: sourceBindings as NonNullable<typeof sourceBindings[number]>[] };
    const templatePolicy = d.policies.find(t => t.policyRef === c.templatePolicyRef), templateShape = d.shapes.find(t => t.proofShapeRef === c.templateShapeRef);
    const policy = templatePolicy === undefined ? null : { ...templatePolicy, policyRef: governanceRef("proof-policy", id), sourceRequirementRef: requirementRef, obligationRef, sourceBindings: term.sourceBindings };
    const shape = templateShape === undefined ? null : { ...templateShape, proofShapeRef: governanceRef("proof-shape", id), requirementRef, obligationRef };
    const policyCompleteness = d.completeness.find(t => t.policyRef === c.templatePolicyRef);
    const binding = { obligationRef, requirementRef, realizationContractRef: shape?.roleContractRefs.realization ?? null,
      proofContractRef: shape?.roleContractRefs.proof ?? null, proofPolicyRef: policy?.policyRef ?? null, proofShapeRef: shape?.proofShapeRef ?? null };
    additions.push({ candidateRef: p.candidateRef, classRef: p.classRef, meaning: p.meaning, proposalDigest, introducedByResultRef: sourceResultRef, term, binding, policy, shape,
      completeness: policy && policyCompleteness ? { ...policyCompleteness, policyRef: policy.policyRef } : null });
  }
  const coverage = [...prior.coverage, ...additions.slice(prior.additions.length).map(a => ({ obligationRef: a.binding.obligationRef, disposition: "open" as const,
    gaps: ["assessment_missing"], assessmentResultRef: null, supportResultRefs: [], dependencies: [] }))];
  return { additions, coverage };
}

/** Structural schema bytes are constant. Current domains are owned task data. */
export function governanceFulfillmentAssessmentJsonSchema(): Readonly<Record<string, JsonValue>> {
  const s = { type: "string", minLength: 1 }, strings = { type: "array", items: s, uniqueItems: true }, nullable = { type: ["string", "null"] };
  const object = (properties: Record<string, unknown>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) });
  const array = (items: unknown) => ({ type: "array", items }), disposition = { type: "string", enum: ["satisfied", "falsified", "indeterminate"] };
  const { $schema: _dialect, ...support } = toJsonSchema(selection, { target: "draft-2020-12" });
  return deepFreeze(object({ obligations: array(object({ obligationRef: s, policyRef: nullable, shapeRef: nullable, judgment: disposition, reason: s,
    support: array(support), adverseEvidenceRefs: strings,
    criteria: array(object({ criterionRef: s, judgment: disposition, reason: s })),
    depth: array(object({ classRef: s, judgment: { type: "string", enum: ["satisfied", "falsified", "indeterminate", "not_applicable"] }, reason: s, evidenceRefs: strings })) })),
    discoveries: array(object({ classRef: s, judgment: disposition, reason: s, evidenceRefs: strings })) }) as Readonly<Record<string, JsonValue>>);
}
export function bindGovernanceFulfillmentAssessment(d: GovernanceFulfillmentDeclaration, state: GovernanceFulfillmentState,
  raw: unknown, evidence: readonly GovernanceFulfillmentEvidence[]): GovernanceFulfillmentAssessment | null {
  if (!v.is(GOVERNANCE_FULFILLMENT_ASSESSMENT_SCHEMA, raw)) return null;
  const active = governanceFulfillmentActive(d, state), refs = evidence.map(e => e.resultRef);
  const domain = (got: readonly string[], expected: readonly string[]) => unique(got) && got.length === expected.length && got.every(x => expected.includes(x));
  if (!domain(raw.obligations.map(r => r.obligationRef), active.map(r => r.binding.obligationRef)) ||
    !domain(raw.discoveries.map(r => r.classRef), d.discoveryClasses.map(c => c.classRef))) return null;
  for (const row of raw.obligations) {
    const a = active.find(a => a.binding.obligationRef === row.obligationRef)!;
    if (row.policyRef !== a.binding.proofPolicyRef || row.shapeRef !== a.binding.proofShapeRef ||
      !domain(row.criteria.map(c => c.criterionRef), a.completeness?.semanticCriteria ?? []) ||
      !domain(row.depth.map(c => c.classRef), a.completeness?.depthClasses.map(c => c.classRef) ?? []) ||
      row.depth.some(c => !c.evidenceRefs.every(r => refs.includes(r))) || !unique(row.support.map(s => JSON.stringify(s))) || !unique(row.adverseEvidenceRefs) ||
      row.adverseEvidenceRefs.some(r => !evidence.some(e => e.resultRef === r && e.kind === "execution"))) return null;
    for (const s of row.support) {
      const e = evidence.find(e => e.resultRef === s.resultRef);
      if (!e || e.kind === "assessment" || (s.role === "verifier_execution"
        ? e.kind !== "execution" || !e.commands.some(c => c.commandId === s.commandId)
        : !e.files.some(f => f.path === s.artifactPath))) return null;
    }
  }
  return raw.discoveries.every(c => c.evidenceRefs.every(r => refs.includes(r))) ? raw : null;
}
export function projectGovernanceFulfillment(d: GovernanceFulfillmentDeclaration, prior: GovernanceFulfillmentState,
  assessment: GovernanceFulfillmentAssessment, current: GovernanceFulfillmentEvidence, evidence: readonly GovernanceFulfillmentEvidence[]): GovernanceFulfillmentState {
  const active = governanceFulfillmentActive(d, prior), currentFiles = current.files;
  return { additions: prior.additions, coverage: active.map(a => {
    const row = assessment.obligations.find(r => r.obligationRef === a.binding.obligationRef)!, gaps: string[] = [], dependencies: v.InferOutput<typeof file>[] = [];
    const support = row.support.map(s => ({ selection: s, fact: evidence.find(e => e.resultRef === s.resultRef)! }));
    const stale = (files: readonly v.InferOutput<typeof file>[]) => files.some(f => !currentFiles.some(c => c.path === f.path && c.digest === f.digest));
    if (!a.policy || !a.shape || !a.completeness || !a.binding.realizationContractRef || !a.binding.proofContractRef) gaps.push("policy_incomplete");
    if (row.judgment !== "satisfied") gaps.push("semantic_" + row.judgment);
    if (current.kind !== "assessment" || current.assessmentContractRef !== d.assessmentContractRef || current.actorInvocationRef === current.producerActorRef) gaps.push("independent_assessment_missing");
    for (const r of a.shape?.requiredEvidenceRoles ?? []) {
      if (r === "semantic_assessment") continue;
      if (!support.some(s => s.selection.role === r)) gaps.push("missing_role:" + r);
    }
    if (!support.some(s => s.selection.role === "realization" && s.fact.contractRef === a.binding.realizationContractRef)) gaps.push("realization_pair_missing");
    if (!(support.some(s => s.selection.role !== "realization" && s.fact.contractRef === a.binding.proofContractRef) ||
      a.shape?.requiredEvidenceRoles.includes("semantic_assessment") && current.contractRef === a.binding.proofContractRef)) gaps.push("proof_pair_missing");
    for (const s of support) {
      const files = s.selection.role === "verifier_execution" ? s.fact.dependencies : s.fact.files.filter(f => f.path === s.selection.artifactPath);
      dependencies.push(...files);
      if (stale(files)) gaps.push("stale_evidence");
      if (s.fact.actorInvocationRef === current.actorInvocationRef) gaps.push("assessor_not_independent");
    }
    const realizedPaths = support.filter(s => s.selection.role === "realization").map(s => s.selection.artifactPath);
    if (support.some(s => s.selection.role === "verifier_artifact" && realizedPaths.includes(s.selection.artifactPath))) gaps.push("roles_not_distinct");
    if (row.criteria.some(c => c.judgment !== "satisfied")) gaps.push("semantic_criterion_incomplete");
    if (row.depth.some(c => c.judgment !== "satisfied" && !(c.judgment === "not_applicable" && a.completeness?.depthClasses.find(x => x.classRef === c.classRef)?.permitsNonApplicability && c.evidenceRefs.length > 0))) gaps.push("depth_policy_incomplete");
    if (a.completeness?.strengthRuleRef !== GOVERNANCE_FULFILLMENT_STRENGTH) gaps.push("unsupported_strength_rule");
    for (const adverse of a.completeness?.adverseCommands ?? []) if (!evidence.some(e => row.adverseEvidenceRefs.includes(e.resultRef) && e.kind === "execution" && e.commands.some(c => c.commandId === adverse.commandId && !c.timedOut && c.exitStatus !== null &&
      (adverse.disposition === "zero" ? c.exitStatus === 0 : c.exitStatus !== 0)))) gaps.push("adverse_evidence_missing");
    for (const c of d.discoveryClasses) if (c.ruleRef !== GOVERNANCE_FULFILLMENT_DISCOVERY || assessment.discoveries.find(r => r.classRef === c.classRef)?.judgment !== "satisfied") gaps.push("discovery_incomplete:" + c.classRef);
    return { obligationRef: a.binding.obligationRef, disposition: gaps.includes("stale_evidence") ? "stale" as const : gaps.length ? "open" as const : "eligible" as const,
      gaps: [...new Set(gaps)], assessmentResultRef: current.resultRef, supportResultRefs: [...new Set([...row.support.map(s => s.resultRef), ...row.adverseEvidenceRefs, current.resultRef])],
      dependencies: [...new Map(dependencies.map(f => [f.path, f])).values()] };
  }) };
}
export function invalidateGovernanceFulfillment(prior: GovernanceFulfillmentState, currentFiles: readonly v.InferOutput<typeof file>[], changedPaths: readonly string[]): GovernanceFulfillmentState {
  return { additions: prior.additions, coverage: prior.coverage.map(row => row.dependencies.some(f => changedPaths.includes(f.path) && !currentFiles.some(c => c.path === f.path && c.digest === f.digest))
    ? { ...row, disposition: "stale", gaps: [...new Set([...row.gaps, "stale_evidence"])] } : row) };
}
