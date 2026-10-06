from pathlib import Path
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/qualification.ts');s=p.read_text()
s='import { resolveQualificationAssessment, type QualificationResources, type ResolvedQualificationAssessment } from "./qualification_resources.js";\n'+s
s=s.replace('type QualificationAssessmentInput, type QualificationAssessmentTask,','type QualificationAssessmentInput, type QualificationAssessmentTask, type QualificationEmbeddedTask, type QualificationInternedScope,')
s=s.replace('scope: QualificationScope, catalog: QualificationRuleCatalog, catalogDigest: string)', 'scope: QualificationScope, catalog: QualificationRuleCatalog, catalogDigest: string, normalized?: QualificationInternedScope)')
s=s.replace('check(qualificationIdentity(scope, "scopeRef", "scopeDigest", "qualification-scope://abiogenesis/"), "scope_identity_mismatch");','check(normalized === undefined ? qualificationIdentity(scope, "scopeRef", "scopeDigest", "qualification-scope://abiogenesis/") :\n    qualificationIdentity(normalized, "scopeRef", "scopeDigest", "qualification-scope://abiogenesis/") && normalized.scopeRef === scope.scopeRef && normalized.scopeDigest === scope.scopeDigest, "scope_identity_mismatch");')
s=s.replace('function qualificationTaskScopeMatches(task: QualificationAssessmentTask, catalog: QualificationRuleCatalog, catalogDigest: string)', 'function qualificationTaskScopeMatches(task: QualificationEmbeddedTask, catalog: QualificationRuleCatalog, catalogDigest: string, normalized?: QualificationInternedScope)')
s=s.replace('qualificationScopeCorrespondence(scope, catalog, catalogDigest).length','qualificationScopeCorrespondence(scope, catalog, catalogDigest, normalized).length')
s=s.replace('function qualificationSelectedSubject(task: QualificationAssessmentTask)', 'function qualificationSelectedSubject(task: QualificationEmbeddedTask, normalized?: QualificationInternedScope)')
s=s.replace('qualificationTaskScopeMatches(task, catalog, digest))', 'qualificationTaskScopeMatches(task, catalog, digest, normalized))')
s=s.replace('function qualificationConstructionContext(task: QualificationAssessmentTask)', 'function qualificationConstructionContext(task: QualificationEmbeddedTask)')
s=s.replace('export function qualificationMaterialMatches(task: QualificationAssessmentTask): boolean {','export function qualificationMaterialMatches(task: QualificationEmbeddedTask, normalized?: QualificationInternedScope): boolean {')
s=s.replace('!qualificationPlanMatches(value.plan) || !qualificationMaterialMatches(value.task)', '!qualificationPlanMatches(value.plan) || (!("representation" in value.task) && !qualificationMaterialMatches(value.task))')
s=s.replace('same(task.provenance.subjectInventory, task.inventory);','("representation" in task ? [...task.material, task.provenance, ...(task.scope === undefined ? [] : [task.scope])].every(s => same(s.resource, task.resource))\n      : same(task.provenance.subjectInventory, task.inventory));')
s=s.replace('export function qualificationRawMatches(input: QualificationAssessmentInput, raw: unknown): raw is QualificationRawJudgment {\n  return isQualificationAssessmentInput(input)', '''export function establishQualificationAssessment(input: QualificationAssessmentInput, resources?: QualificationResources): ResolvedQualificationAssessment {
  if (!isQualificationAssessmentInput(input)) throw new TypeError("invalid qualification assessment shape/identity");
  const view = resolveQualificationAssessment(input, resources);
  if (!qualificationMaterialMatches(view.task, view.normalizedScope) || !same(view.task.provenance.subjectInventory, input.task.inventory))
    throw new TypeError("qualification resource material/scope correspondence differs");
  return view;
}
export function qualificationRawMatches(input: QualificationAssessmentInput, raw: unknown, view?: ResolvedQualificationAssessment): raw is QualificationRawJudgment {
  if (view === undefined && "representation" in input.task) return false;
  const task = view?.task ?? input.task as QualificationEmbeddedTask;
  return isQualificationAssessmentInput(input)''')
s=s.replace('c.sourceRefs.every(ref => input.task.material.some(m => m.ref === ref))', 'c.sourceRefs.every(ref => task.material.some(m => m.ref === ref))')
s=s.replace('export function qualificationWorkerRequest(input: QualificationAssessmentInput): Readonly<ProbabilisticWorkerRequest> {\n  if (!isQualificationAssessmentInput(input)) throw new TypeError("invalid qualification assessment input");\n  const task = input.task;', 'export function qualificationWorkerRequest(input: QualificationAssessmentInput, view = establishQualificationAssessment(input)): Readonly<ProbabilisticWorkerRequest> {\n  if (view.input !== input) throw new TypeError("qualification preparation differs from raw input");\n  const task = view.task;')
s=s.replace('selectedSubject: qualificationSelectedSubject(task),','selectedSubject: qualificationSelectedSubject(task, view.normalizedScope),')
s=s.replace('nativeBasis: QualificationNativeBasis, source: QualificationJudgment["source"]):', 'nativeBasis: QualificationNativeBasis, source: QualificationJudgment["source"], view?: ResolvedQualificationAssessment):')
s=s.replace('if (!qualificationRawMatches(input, raw) || source.cCallRef', 'if (!qualificationRawMatches(input, raw, view) || source.cCallRef')
p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/qualification_resources.ts');s=p.read_text().replace('private readonly proofs:', 'private readonly scopeViews = new Map<string, { scope: QualificationScope; normalized: QualificationInternedScope }>();\n  private readonly provenanceViews = new Map<string, QualificationConstructionProvenance>();\n  private readonly proofs:')
s=s.replace('const normalized = this.value<QualificationInternedScope>(selection, "scope"), manifest = this.manifest(selection.resource);','const normalized = this.value<QualificationInternedScope>(selection, "scope"), manifest = this.manifest(selection.resource);\n    const key = manifest.resourceRef + ":" + selection.entry.ref, prior = this.scopeViews.get(key);\n    if (prior !== undefined) return prior;')
s=s.replace('return { scope, normalized };','const view = { scope, normalized }; this.scopeViews.set(key, view); return view;')
s=s.replace('if (p.kind === "native_construction") return p;', 'if (p.kind === "native_construction") return p;\n    const key = selection.resource.ref + ":" + selection.entry.ref, prior = this.provenanceViews.get(key);\n    if (prior !== undefined) return prior;')
s=s.replace('return { ...p, records };','const view = { ...p, records }; this.provenanceViews.set(key, view); return view;')
p.write_text(s)
