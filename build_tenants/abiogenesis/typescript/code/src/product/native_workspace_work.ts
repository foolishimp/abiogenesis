import { isNativeWorkspaceAssessmentSelection, nativeWorkspaceAssessmentSubjectMatches, nativeWorkspaceAssessmentSchema, parseNativeWorkspaceAssessmentResult, type NativeWorkspaceAssessmentSelection } from "./native_workspace_assessment.js";
import * as v from "valibot";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitIJsonText } from "../shared/i_json.js";
import { isWorkspaceAuthorityBasis, type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { isCapabilityGrantValue, type CapabilityGrant } from "./invocation.js";
import { exactWorkspaceBinding, isWorksiteContextObservation, normalizeWorksiteRelativePath, type WorksiteContextObservation,
  type WorksiteEffectRefusal } from "./worksite_effect.js";
import type { ActorProcessCarrierValidation } from "../abg/actor_process.js";
import type { LeafExecutionAuthority } from "../implementation/contracts.js";

import { NATIVE_WORKSPACE_WORK_IDS, NATIVE_WORKSPACE_WORK_HANDLER_DIGEST } from "./native_workspace_work_identity.js";
export { NATIVE_WORKSPACE_WORK_IDS, NATIVE_WORKSPACE_WORK_HANDLER_DIGEST } from "./native_workspace_work_identity.js";
const scope = "abiogenesis/worksite/native-work";
const ref = v.pipe(v.string(), v.minLength(1), v.check(x => !x.includes("\0")));
const paths = v.array(v.pipe(ref, v.check(x => normalizeWorksiteRelativePath(x, true) === x)));
const same = (a: unknown, b: unknown) => canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
export const nativeWorkspacePathWithin = (path: string, roots: readonly string[]) =>
  roots.some(root => root === "." || root === path || path.startsWith(root + "/"));
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
export interface NativeWorkspaceWorkTask {
  readonly kind: "native_workspace_work_task"; readonly schemaVersion: "5.0.0";
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis; readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant; readonly context: WorksiteContextObservation;
  readonly outcome: string; readonly instructions: readonly string[]; readonly readFirst: readonly string[];
  readonly writeRoots: readonly string[]; readonly checks: readonly string[];
  readonly assessment?: NativeWorkspaceAssessmentSelection;
}
const taskSchema = v.strictObject({ kind: v.literal("native_workspace_work_task"), schemaVersion: v.literal("5.0.0"),
  workspaceAuthorityBasis: v.custom<WorkspaceAuthorityBasis>(isWorkspaceAuthorityBasis),
  workspaceBinding: v.custom<WorkspaceBinding>(x => x !== null && typeof x === "object" && exactWorkspaceBinding(x as WorkspaceBinding)), capabilityGrant: v.custom<CapabilityGrant>(isCapabilityGrantValue),
  context: v.custom<WorksiteContextObservation>(isWorksiteContextObservation), outcome: ref,
  instructions: v.array(ref), readFirst: paths, writeRoots: paths, checks: v.array(ref), assessment: v.optional(v.custom<NativeWorkspaceAssessmentSelection>(isNativeWorkspaceAssessmentSelection)) });
export function isNativeWorkspaceWorkTask(value: unknown): value is NativeWorkspaceWorkTask {
  if (!v.is(taskSchema, value)) return false;
  const t = value, w = t.workspaceBinding, a = t.workspaceAuthorityBasis, c = t.context, g = t.capabilityGrant;
  return w.authorityBasisId === a.authorityBasisId && w.authorityBasisDigest === a.authorityBasisDigest &&
    w.authorizedActorRef === a.authorizedActorRef && g.actorRef === a.authorizedActorRef &&
    g.operationId === "abg.operation.run.invoke" && g.scopeRef === w.bindingId && g.scopeDigest === w.bindingDigest &&
    c.workspaceAuthorityBasisRef === a.authorityBasisId && c.workspaceAuthorityBasisDigest === a.authorityBasisDigest &&
    c.workspaceBindingIdentity === w.bindingId && c.workspaceBindingDigest === w.bindingDigest &&
    unique(t.readFirst) && unique(t.writeRoots) && t.writeRoots.every(p => nativeWorkspacePathWithin(p, c.readRoots)) &&
    t.readFirst.every(p => c.entries.some(e => e.relativePath === p && e.state !== "absent")) &&
    (t.assessment === undefined || (t.writeRoots.length === 0 && nativeWorkspaceAssessmentSubjectMatches(t.assessment, c) &&
      [...t.assessment.sources, t.assessment.candidate, t.assessment.rubric].every(asset => t.readFirst.includes(asset.path))));
}
export function constructNativeWorkspaceWorkTask(input: Omit<NativeWorkspaceWorkTask, "kind" | "schemaVersion">): Readonly<NativeWorkspaceWorkTask> {
  const task = { kind: "native_workspace_work_task" as const, schemaVersion: "5.0.0" as const, ...input };
  if (!isNativeWorkspaceWorkTask(task)) throw new TypeError("native workspace task requires one bound worksite, context and declared scope");
  return deepFreeze(task);
}
export interface NativeWorkspaceWorkReport { readonly summary: string; readonly gaps: readonly string[] }
export const nativeWorkspaceWorkReportSchema = deepFreeze({ type: "object" as const, additionalProperties: false as const,
  required: ["summary", "gaps"], properties: { summary: { type: "string" }, gaps: { type: "array", items: { type: "string" } } } });
export function isNativeWorkspaceWorkReport(value: unknown): value is NativeWorkspaceWorkReport {
  return v.is(v.strictObject({ summary: v.string(), gaps: v.array(v.string()) }), value);
}
export function parseNativeWorkspaceWorkReport(text: string): NativeWorkspaceWorkReport | null {
  try { const value = admitIJsonText(text, "native workspace report"); return isNativeWorkspaceWorkReport(value) ? value : null; }
  catch { return null; }
}
export function nativeWorkspaceWorkGraphFunctionRef(task: NativeWorkspaceWorkTask): string {
  return task.assessment === undefined ? NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef : NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef;
}
export function nativeWorkspaceAssessmentBasisDigest(task: NativeWorkspaceWorkTask): Sha256Digest {
  if (task.assessment === undefined) throw new TypeError("assessment selection is required");
  return sha256Canonical({ assessment: task.assessment, contextDigest: task.context.observationDigest } as unknown as JsonValue);
}
export function nativeWorkspaceWorkResponseSchema(task: NativeWorkspaceWorkTask): Readonly<Record<string, JsonValue>> {
  const schema = task.assessment === undefined ? nativeWorkspaceWorkReportSchema : nativeWorkspaceAssessmentSchema(task.assessment);
  if (schema === null) throw new TypeError("invalid native assessment schema");
  return schema;
}
export function nativeWorkspaceWorkResultContractRef(task: NativeWorkspaceWorkTask): string {
  return task.assessment?.resultContract.contractRef ?? NATIVE_WORKSPACE_WORK_IDS.workerReportContractRef;
}
export function renderNativeWorkspaceWorkOrder(task: NativeWorkspaceWorkTask): string {
  if (task.assessment !== undefined) {
    const { schemaAsset, ...selectedBasis } = task.assessment;
    const schemaIdentity = { productId: schemaAsset.productId, contractId: schemaAsset.contractId,
      digest: sha256Bytes(Buffer.from(schemaAsset.bytesBase64, "base64")) };
    return [
    "Independently assess the exact declared subject using native read/search tools. Do not edit any worksite file or create an assessment artifact.",
    `Outcome: ${task.outcome}`, `Worksite root: ${task.workspaceAuthorityBasis.canonicalRoot}`,
    `Read first: ${JSON.stringify(task.readFirst)}`, `Readable worksite scope: ${JSON.stringify(task.context.readRoots)}`,
    `Exact assessment basis: ${canonicalJson({ ...selectedBasis, schemaAsset: schemaIdentity } as unknown as JsonValue)}`,
    `Exact declared response JSON Schema: ${canonicalJson(nativeWorkspaceWorkResponseSchema(task))}`,
    "Instructions:", ...task.instructions, "Permitted read-only checks:", ...task.checks,
    "Reacquire full source, actual candidate and rubric independently. Author claims, structural checks and prior reports are not a semantic verdict.",
    "Use no network, dependency installation, other graph work or worksite changes. Return one JSON object matching the exact declared schema as your final result text, without markdown fences or surrounding prose. Do not grant admission, acceptance, scope changes or graph continuation.",
  ].join("\n");
  }
  return ["Perform the declared work using the native coding host's ordinary read, edit and test tools.",
    `Outcome: ${task.outcome}`, `Worksite root: ${task.workspaceAuthorityBasis.canonicalRoot}`,
    `Read first: ${JSON.stringify(task.readFirst)}`, `Readable worksite scope: ${JSON.stringify(task.context.readRoots)}`,
    `Permitted write scope: ${JSON.stringify(task.writeRoots)}`, "Instructions:", ...task.instructions,
    "Permitted checks:", ...task.checks,
    "Read the selected assets in the worksite. They remain the source of their content; do not substitute a summary for a mandatory input.",
    "Use local reads, edits and checks within the declared scope. Do not change installed Product/runtime resources or launch other graph work.",
    "Do not change files outside the declared write scope. Do not use network access, publish, or install dependencies. Instructions and checks do not widen that scope.",
    "Keep useful partial changes if work cannot finish. Report the work performed and remaining gaps; do not claim acceptance or choose graph continuation.",
    "Return the short JSON report {summary, gaps}. The runtime separately observes actual assets and the declared evaluator judges the outcome.",
  ].join("\n");
}
export function nativeWorkspaceWorkAuthorityMatches(task: NativeWorkspaceWorkTask, a: LeafExecutionAuthority): boolean {
  const ids = NATIVE_WORKSPACE_WORK_IDS, c = a.cCall, e = a.executionBasis, r = a.implementationResolution;
  return a.effectUri === ids.effectUri && a.handlerRef === ids.handlerRef && a.handlerDigest === NATIVE_WORKSPACE_WORK_HANDLER_DIGEST &&
    a.implementationRef === ids.implementationRef && a.implementationBindingRef === ids.implementationBindingRef &&
    r.computeRegime === "F_P" && r.inputContractRef === ids.taskContractRef && r.outputContractRef === ids.observationContractRef &&
    c.regime === "F_P" && c.callClass === "leaf" && c.graphFunctionRef === nativeWorkspaceWorkGraphFunctionRef(task) &&
    c.inputContractRef === ids.taskContractRef && c.outputContractRef === ids.observationContractRef &&
    c.failureContractRef === ids.failureContractRef && c.refusalContractRef === ids.refusalContractRef &&
    c.implementationRef === a.implementationRef && c.implementationBindingRef === a.implementationBindingRef &&
    c.implementationSetRef === a.implementationSetRef && c.basisId === a.executionBasisRef &&
    a.graphFunctionRef === c.graphFunctionRef && a.graphFunctionDigest === e.graphFunctionDigest &&
    a.programRef === e.programRef && a.programDigest === e.programDigest &&
    a.cCallRef === c.cCallRef && a.cCallDigest === c.cCallDigest &&
    a.workspaceBindingIdentity === e.workspaceBindingId && a.workspaceBindingDigest === e.workspaceBindingDigest &&
    same(task.workspaceBinding, a.workspaceBinding) && task.workspaceBinding.bindingId === a.workspaceBindingIdentity &&
    task.workspaceBinding.bindingDigest === a.workspaceBindingDigest && task.capabilityGrant.actorRef === a.actorRef &&
    a.actorRef === e.actorRef && a.capabilityGrantRef === task.capabilityGrant.grantRef &&
    a.capabilityGrantDigest === task.capabilityGrant.grantDigest && same(task, e.rawInputValue);
}
export function nativeWorkspaceChangedPaths(before: WorksiteContextObservation, after: WorksiteContextObservation): readonly string[] {
  const rows = (context: WorksiteContextObservation) => new Map(context.entries.map(e => [e.relativePath, e]));
  const a = rows(before), b = rows(after);
  return [...new Set([...a.keys(), ...b.keys()])].sort().filter(path => !same(a.get(path) ?? null, b.get(path) ?? null));
}
export function nativeWorkspaceScopeViolations(task: NativeWorkspaceWorkTask, after: WorksiteContextObservation): readonly string[] {
  return nativeWorkspaceChangedPaths(task.context, after).filter(path => {
    if (nativeWorkspacePathWithin(path, task.writeRoots)) return false;
    const entry = after.entries.find(e => e.relativePath === path) ?? task.context.entries.find(e => e.relativePath === path);
    return !(entry?.state === "directory" && task.writeRoots.some(root => path === "." || root.startsWith(path + "/")));
  });
}
export interface NativeWorkspaceWorkObservation {
  readonly kind: "native_workspace_work_observation"; readonly schemaVersion: "5.0.0";
  readonly observationRef: string; readonly observationDigest: Sha256Digest;
  readonly task: NativeWorkspaceWorkTask; readonly before: WorksiteContextObservation; readonly after: WorksiteContextObservation;
  readonly changedPaths: readonly string[]; readonly report: NativeWorkspaceWorkReport | null;
  readonly assessment?: Readonly<Record<string, JsonValue>>;
  readonly provenance: NativeWorkspaceWorkProvenance;
}
export interface NativeWorkspaceWorkProvenance {
  readonly cCallRef: string; readonly executionAuthorityRef: string; readonly executionAuthorityDigest: Sha256Digest;
  readonly actorInvocationRef: string; readonly transportBindingRef: string; readonly transportBindingDigest: Sha256Digest;
  readonly promptDigest: Sha256Digest; readonly transportDigest: Sha256Digest;
}
const digest = v.pipe(v.string(), v.regex(/^sha256:[a-f0-9]{64}$/u));
const provenanceSchema = v.strictObject({ cCallRef: ref, executionAuthorityRef: ref, executionAuthorityDigest: digest,
  actorInvocationRef: ref, transportBindingRef: ref, transportBindingDigest: digest, promptDigest: digest, transportDigest: digest });
export interface NativeWorkspaceWorkFailure {
  readonly kind: "native_workspace_work_failure"; readonly schemaVersion: "5.0.0";
  readonly failureClass: string; readonly diagnosticRef: string; readonly task: NativeWorkspaceWorkTask;
  readonly before: WorksiteContextObservation; readonly after: WorksiteContextObservation | null;
  readonly changedPaths: readonly string[] | null; readonly observationFailure: WorksiteEffectRefusal | null;
  readonly report: NativeWorkspaceWorkReport | null; readonly provenance: NativeWorkspaceWorkProvenance;
}
export function nativeWorkspaceWorkProvenance(authority: LeafExecutionAuthority, exchange: ActorProcessCarrierValidation): NativeWorkspaceWorkProvenance {
  const o = exchange.observation;
  return { cCallRef: authority.cCallRef, executionAuthorityRef: authority.authorityRef, executionAuthorityDigest: authority.authorityDigest,
    actorInvocationRef: o.actorInvocationRef, transportBindingRef: o.transportBindingRef, transportBindingDigest: o.transportBindingDigest,
    promptDigest: o.promptDigest, transportDigest: o.transportDigest };
}
export function constructNativeWorkspaceWorkObservation(task: NativeWorkspaceWorkTask, after: WorksiteContextObservation,
  report: NativeWorkspaceWorkReport | null, provenance: NativeWorkspaceWorkProvenance, assessment?: Readonly<Record<string, JsonValue>>): Readonly<NativeWorkspaceWorkObservation> {
  const body = { kind: "native_workspace_work_observation" as const, schemaVersion: "5.0.0" as const,
    task, before: task.context, after, changedPaths: nativeWorkspaceChangedPaths(task.context, after), report, provenance,
    ...(assessment === undefined ? {} : { assessment }) };
  const observationDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({ ...body, observationDigest, observationRef: `native-work-observation://abiogenesis/${observationDigest.slice(7)}` });
}
export function isNativeWorkspaceWorkObservation(value: unknown): value is NativeWorkspaceWorkObservation {
  try {
    const o = value as NativeWorkspaceWorkObservation;
    if (o?.kind !== "native_workspace_work_observation" || !isNativeWorkspaceWorkTask(o.task) ||
      !isWorksiteContextObservation(o.after) ||
      (o.task.assessment === undefined ? (!isNativeWorkspaceWorkReport(o.report) || o.assessment !== undefined) :
        (o.report !== null || o.assessment === undefined || parseNativeWorkspaceAssessmentResult(nativeWorkspaceWorkResponseSchema(o.task), canonicalJson(o.assessment)) === null ||
          o.provenance.cCallRef === o.task.assessment.producer.cCallRef || o.provenance.actorInvocationRef === o.task.assessment.producer.actorInvocationRef)) ||
      !v.is(provenanceSchema, o.provenance) ||
      !same(o.before, o.task.context) || o.after.workspaceBindingIdentity !== o.before.workspaceBindingIdentity ||
      o.after.workspaceBindingDigest !== o.before.workspaceBindingDigest || !same(o.after.readRoots, o.before.readRoots) ||
      o.after.workspaceAuthorityBasisRef !== o.before.workspaceAuthorityBasisRef ||
      o.after.workspaceAuthorityBasisDigest !== o.before.workspaceAuthorityBasisDigest ||
      o.after.maxFiles !== o.before.maxFiles || o.after.maxBytes !== o.before.maxBytes ||
      nativeWorkspaceScopeViolations(o.task, o.after).length !== 0) return false;
    return same(o, constructNativeWorkspaceWorkObservation(o.task, o.after, o.report, o.provenance, o.assessment));
  } catch { return false; }
}
export function isNativeWorkspaceWorkFailure(value: unknown): value is NativeWorkspaceWorkFailure {
  try { const f = value as NativeWorkspaceWorkFailure;
    return f?.kind === "native_workspace_work_failure" && f.schemaVersion === "5.0.0" &&
      typeof f.failureClass === "string" && typeof f.diagnosticRef === "string" && isNativeWorkspaceWorkTask(f.task) &&
      v.is(provenanceSchema, f.provenance) &&
      same(f.before, f.task.context) && (f.after === null ? f.changedPaths === null && f.observationFailure !== null :
        isWorksiteContextObservation(f.after) && same(f.changedPaths, nativeWorkspaceChangedPaths(f.before, f.after))) &&
      (f.report === null || isNativeWorkspaceWorkReport(f.report));
  } catch { return false; }
}
export function nativeWorkspaceWorkResultMatches(input: unknown, output: unknown, cCallRef: string,
  observation: ActorProcessCarrierValidation["observation"] | null): boolean {
  if (!isNativeWorkspaceWorkTask(input) || observation === null ||
    !(isNativeWorkspaceWorkObservation(output) || isNativeWorkspaceWorkFailure(output)) || !same(input, output.task)) return false;
  const p = output.provenance;
  if (p.cCallRef !== cCallRef || p.actorInvocationRef !== observation.actorInvocationRef ||
    p.transportBindingRef !== observation.transportBindingRef || p.transportBindingDigest !== observation.transportBindingDigest ||
    p.promptDigest !== observation.promptDigest || p.transportDigest !== observation.transportDigest ||
    observation.implementationRef !== NATIVE_WORKSPACE_WORK_IDS.implementationRef ||
    observation.inputDigest !== sha256Canonical(input as unknown as JsonValue) || observation.transportLane !== "worker_executes") return false;
  return (input.assessment === undefined ? same(output.report, parseNativeWorkspaceWorkReport(observation.finalOutput)) :
    output.report === null && (output.kind === "native_workspace_work_failure" || same(output.assessment ?? null,
      parseNativeWorkspaceAssessmentResult(nativeWorkspaceWorkResponseSchema(input), observation.finalOutput)))) &&
    (output.kind === "native_workspace_work_failure" || observation.disposition === "success");
}
export function resolveNativeWorkspaceWorkJudgmentRelation(predicateRef: string) {
  return predicateRef !== NATIVE_WORKSPACE_WORK_IDS.judgmentPredicateRef ? null : Object.freeze({ predicateRef,
    advanceReasonRef: `reason://${scope}/observed@5`, rejectionReasonRef: `reason://${scope}/not-observed@5`,
    evaluate: (input: unknown, output: unknown) => isNativeWorkspaceWorkTask(input) &&
      isNativeWorkspaceWorkObservation(output) && same(input, output.task),
  });
}

/** Pure current-subject check over admitted observations; never a semantic verdict or admission. */
export function nativeWorkspaceAssessmentMatchesContext(value: unknown, context: WorksiteContextObservation): boolean {
  if (!isNativeWorkspaceWorkObservation(value) || value.task.assessment === undefined || value.assessment === undefined || !isWorksiteContextObservation(context)) return false;
  return value.after.workspaceBindingIdentity === context.workspaceBindingIdentity && value.after.workspaceBindingDigest === context.workspaceBindingDigest &&
    nativeWorkspaceAssessmentSubjectMatches(value.task.assessment, context);
}
