from pathlib import Path
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/qualification.ts');s=p.read_text();anchor='/** F_H candidate relation; actual authority and response admission stay native. */'
new='''/** One native preparation operation borrows the resolved dependency throughout completion and admission. */
export interface PreparedQualificationAssessment {
  readonly input: QualificationAssessmentInput;
  readonly view: ResolvedQualificationAssessment;
  readonly request: Readonly<ProbabilisticWorkerRequest>;
  readonly complete: (raw: unknown, basis: QualificationNativeBasis, source: QualificationJudgment["source"]) => Readonly<QualificationJudgment>;
  readonly matches: (input: unknown, output: unknown) => boolean;
}
export function prepareQualificationAssessment(input: QualificationAssessmentInput, resources?: QualificationResources): PreparedQualificationAssessment {
  const view = establishQualificationAssessment(input, resources), request = qualificationWorkerRequest(input, view);
  let completed: Readonly<QualificationJudgment> | undefined;
  return Object.freeze({ input, view, request,
    complete(raw, basis, source) {
      if (source.requestDigest !== hash(request) || source.promptDigest !== hash(request.prompt)) throw new TypeError("qualification completion crosses owning request");
      completed = constructQualificationJudgment(input, raw, basis, source, view); return completed;
    },
    matches(supplied, output) { return supplied === input && completed !== undefined && same(completed, output); },
  });
}
'''
s=s.replace(anchor,new+anchor,1);p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/implementation/contracts.ts');s=p.read_text()
s=s.replace('export interface NativeLeafProofOperations {','export interface NativeLeafProofOperations {\n  readonly qualificationPreparation?: (input: unknown, occurrence: LeafExecutionOccurrence) => import("../validator/qualification.js").PreparedQualificationAssessment | null;')
s=s.replace('export interface NativeJudgmentProofOperations {','export interface NativeJudgmentProofOperations {\n  readonly qualificationJudgment?: () => boolean;\n  readonly qualificationRequest?: () => Readonly<ProbabilisticWorkerRequest> | null;\n  readonly qualificationSelfConformance?: () => ReturnType<typeof import("../validator/self_conformance.js").evaluateSelfConformance> | null;')
p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/implementation/qualification.ts');s=p.read_text()
s=s.replace('constructQualificationJudgment,','constructQualificationJudgment, prepareQualificationAssessment,')
s=s.replace('export function realizeQualificationAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence):','export function realizeQualificationAssessment(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,\n  _resolution?: unknown, _inputDigest?: unknown, nativeProof?: NativeLeafProofOperations):')
s=s.replace('if (!isQualificationAssessmentInput(input) || occurrence.qualificationOwnerBasis === undefined ||\n      projectQualificationConsumer(occurrence.qualificationOwnerBasis, input, true) === null)', 'if (!isQualificationAssessmentInput(input) || occurrence.qualificationOwnerBasis === undefined ||\n      (nativeProof?.qualificationPreparation === undefined && projectQualificationConsumer(occurrence.qualificationOwnerBasis, input, true) === null))')
s=s.replace('const nativeBasis = occurrence.qualificationOwnerBasis, workerRequest = qualificationWorkerRequest(input);','const nativeBasis = occurrence.qualificationOwnerBasis, preparation = nativeProof?.qualificationPreparation?.(input, occurrence) ?? prepareQualificationAssessment(input), workerRequest = preparation.request;')
s=s.replace('const value = constructQualificationJudgment(input, raw, nativeBasis, source);','const value = preparation.complete(raw, nativeBasis, source);')
p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/product/semantics.ts');s=p.read_text();needle='readonly admittedEvidence: readonly Readonly<';s=s.replace(needle,'readonly nativeProof?: import("../implementation/contracts.js").NativeJudgmentProofOperations;\n      '+needle,1);p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/self_conformance_semantics.ts');s=p.read_text()
s=s.replace('const owner = resolveSelfConformanceOwner(output.owner.nativeBasis as QualificationOwnerBasis, input);','if (nativeProof?.qualificationSelfConformance !== undefined) return same(nativeProof.qualificationSelfConformance(), output);\n      const owner = resolveSelfConformanceOwner(output.owner.nativeBasis as QualificationOwnerBasis, input);')
s=s.replace('if (!isQualificationAssessmentInput(input) || !isQualificationJudgment(output) ||', 'if (nativeProof?.qualificationJudgment !== undefined) return nativeProof.qualificationJudgment();\n      if (!isQualificationAssessmentInput(input) || !isQualificationJudgment(output) ||')
s=s.replace('const request = qualificationWorkerRequest({ kind: "qualification_assessment_input", schemaVersion: "5.0.0", task: value.task, plan: value.plan });','const request = basis.nativeProof?.qualificationRequest?.() ?? ("representation" in value.task ? null : qualificationWorkerRequest({ kind: "qualification_assessment_input", schemaVersion: "5.0.0", task: value.task, plan: value.plan }));\n    if (request === null) return false;')
p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/self_conformance_basis.ts');s=p.read_text();s='import type { QualificationResources } from "./qualification_resources.js";\n'+s
s=s.replace('input: unknown, requireCurrent = false):', 'input: unknown, requireCurrent = false, resources?: QualificationResources):')
s=s.replace('resolveQualificationSelfConformanceOwner(basis, input, requireCurrent)', 'resolveQualificationSelfConformanceOwner(basis, input, requireCurrent, resources)');p.write_text(s)
