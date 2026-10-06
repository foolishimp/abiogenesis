from pathlib import Path
p=Path('build_tenants/abiogenesis/typescript/code/src/implementation/leaf_invocation_port.ts');s=p.read_text();s='import { isQualificationAssessmentInput, prepareQualificationAssessment, type PreparedQualificationAssessment } from "../validator/qualification.js";\nimport type { QualificationResources } from "../validator/qualification_resources.js";\n'+s
s=s.replace('historicalSource?: AbgHistoricalGraphCallSourceResource,\n): Readonly<NativeLeafProofOperations>', 'historicalSource?: AbgHistoricalGraphCallSourceResource, resources?: QualificationResources, preparation?: PreparedQualificationAssessment,\n): Readonly<NativeLeafProofOperations>')
s=s.replace('return Object.freeze({\n    ...(implementationRef === SELF_CONFORMANCE_IDS', 'return Object.freeze({\n    ...(implementationRef === qualificationIds.assessImplementation && preparation !== undefined ? { qualificationPreparation: (input: unknown, supplied: LeafExecutionOccurrence) => { exact(input, supplied); return preparation; } } : {}),\n    ...(implementationRef === SELF_CONFORMANCE_IDS',1)
s=s.replace('resolveSelfConformanceOwner(basis, value, true)', 'resolveSelfConformanceOwner(basis, value, true, resources)').replace('evaluateSelfConformance(value, owner)', 'evaluateSelfConformance(value, owner, resources)')
s=s.replace('projectExactCandidateQualification(basis, value, true)', 'projectExactCandidateQualification(basis, value, true, resources)').replace('projectNativeRuntimeAssessment(basis, value, true)', 'projectNativeRuntimeAssessment(basis, value, true, resources)')
s=s.replace('historicalSource?: AbgHistoricalGraphCallSourceResource,\n): Readonly<NativeJudgmentProofOperations>', 'historicalSource?: AbgHistoricalGraphCallSourceResource, resources?: QualificationResources, preparation?: PreparedQualificationAssessment,\n): Readonly<NativeJudgmentProofOperations>')
anchor='  if (predicateRef === reacquireIds.predicateRef)'
new='''  if (predicateRef === qualificationIds.assessPredicate) return Object.freeze({ ...historical,
    qualificationJudgment: () => preparation?.matches(input, output) ?? false,
    qualificationRequest: () => preparation?.matches(input, output) ? preparation.request : null,
  });
  if (predicateRef === SELF_CONFORMANCE_IDS.judgmentPredicateRef) return Object.freeze({ ...historical,
    qualificationSelfConformance: () => {
      if (!isSelfConformanceInput(input) || !isSelfConformanceResult(output)) return null;
      const owner = resolveSelfConformanceOwner(output.owner.nativeBasis, input, false, resources);
      return owner === null ? null : evaluateSelfConformance(input, owner, resources);
    },
  });
'''
s=s.replace(anchor,new+anchor,1).replace('projectExactCandidateQualification(basis, input);','projectExactCandidateQualification(basis, input, false, resources);').replace('projectNativeRuntimeAssessment(basis, selected);','projectNativeRuntimeAssessment(basis, selected, false, resources);')
s=s.replace('historicalSource?: AbgHistoricalGraphCallSourceResource;\n  contractByRef?', 'historicalSource?: AbgHistoricalGraphCallSourceResource;\n  qualificationResources?: QualificationResources;\n  qualificationPreparation?: PreparedQualificationAssessment;\n  contractByRef?',1)
s=s.replace('input.value, input.occurrence, input.historicalSource)', 'input.value, input.occurrence, input.historicalSource, input.qualificationResources, input.qualificationPreparation)')
s=s.replace('readonly historicalSource?: AbgHistoricalGraphCallSourceResource;\n  readonly prefix:', 'readonly historicalSource?: AbgHistoricalGraphCallSourceResource;\n  readonly qualificationResources?: QualificationResources;\n  readonly prefix:',1)
s=s.replace('  const port = Object.freeze({','  const qualificationPreparations = new Map<string, PreparedQualificationAssessment>();\n  const preparationOf = (value: unknown) => isRecord(value) && isRecord(value.source) && typeof value.source.cCallRef === "string" ? qualificationPreparations.get(value.source.cCallRef) : undefined;\n  const port = Object.freeze({',1)
s=s.replace('currentOwnerPrefix, authority.historicalSource)),', 'currentOwnerPrefix, authority.historicalSource, authority.qualificationResources, preparationOf(output))),')
s=s.replace('admittedEvidence,\n      });','admittedEvidence,\n        nativeProof: nativeJudgmentProofOperations(qualificationIds.assessPredicate, preparationOf(value)?.input, value, undefined, authority.historicalSource, authority.qualificationResources, preparationOf(value)),\n      });',1)
s=s.replace('resolveSelfConformanceOwner(qualificationOwnerBasis, call.input, true)', 'resolveSelfConformanceOwner(qualificationOwnerBasis, call.input, true, authority.qualificationResources)').replace('projectQualificationConsumer(qualificationOwnerBasis, call.input, true)', 'projectQualificationConsumer(qualificationOwnerBasis, call.input, true, authority.qualificationResources)')
s=s.replace('if (isQualification && qualificationOwner === null) return ownerRefusal("owner_boundary_exception");','if (isQualification && qualificationOwner === null) return ownerRefusal("owner_boundary_exception");\n        const qualificationPreparation = admittedResolution.implementationRef === qualificationIds.assessImplementation && isQualificationAssessmentInput(call.input)\n          ? prepareQualificationAssessment(call.input, authority.qualificationResources) : undefined;\n        if (qualificationPreparation !== undefined) qualificationPreparations.set(call.occurrence.cCallRef, qualificationPreparation);')
s=s.replace('...(authority.historicalSource === undefined ? {} : { historicalSource: authority.historicalSource }),\n          resolution:', '...(authority.historicalSource === undefined ? {} : { historicalSource: authority.historicalSource }),\n          ...(authority.qualificationResources === undefined ? {} : { qualificationResources: authority.qualificationResources }),\n          ...(qualificationPreparation === undefined ? {} : { qualificationPreparation }),\n          resolution:',1)
s=s.replace('call.input, value, call.predecessorPrefix))))', 'call.input, value, call.predecessorPrefix, authority.historicalSource, authority.qualificationResources, qualificationPreparation))))')
p.write_text(s)
# Run raw resource ingress and pre-effect establishment under existing Product prepare.
p=Path('build_tenants/abiogenesis/typescript/code/src/product/run_invocation_operation.ts');s=p.read_text();s='import { acquireQualificationResources, type QualificationResources } from "../validator/qualification_resources.js";\nimport { isQualificationAssessmentInput, establishQualificationAssessment } from "../validator/qualification.js";\nimport { isSelfConformanceInput } from "../validator/self_conformance_contracts.js";\nimport { resolveSelfConformanceInput, isQualificationReferenceForm, resolveQualificationProof } from "../validator/qualification_resources.js";\nimport { readSelfConformanceCatalog } from "../validator/self_conformance.js";\nimport { qualificationScopeCorrespondence } from "../validator/qualification.js";\nimport type { QualificationResourceAssertion } from "../validator/qualification_contracts.js";\n'+s
s=s.replace('readonly historicalSource?: AbgHistoricalGraphCallSourceResource;', 'readonly historicalSource?: AbgHistoricalGraphCallSourceResource;\n  readonly qualificationResources?: QualificationResourceAssertion;',1)
s=s.replace('readonly runEnvironment: RunEnvironmentEvidence | null;', 'readonly runEnvironment: RunEnvironmentEvidence | null;\n  readonly qualificationResources?: QualificationResources;',1)
anchor='  const admittedSource = sourceBasis(request, resources.source);'
new='''  let qualificationResources: QualificationResources | undefined;
  try {
    if (resources.qualificationResources !== undefined) {
      const existing = [{ kind: "abg_historical_declaration_proof" as const, schemaVersion: "5.0.0" as const, catalog: resources.catalog, catalogView: resources.catalogView },
        ...(resources.historicalSource === undefined ? [] : [resources.historicalSource.declarationProof, ...(resources.historicalSource.declarationDependencies ?? [])])];
      // Current/historical proofs are explicit alternate sources. Duplicate exact dependencies refuse.
      const selected = resources.qualificationResources.manifests.flatMap(m => m.declarationSelections);
      const extras = existing.filter(p => selected.some(d => d.catalogBasisDigest === p.catalog.basisDigest && d.readinessBasisDigest === p.catalog.readinessBasisDigest && d.viewDigest === p.catalogView.viewDigest && d.proofDigest === sha256Canonical(p as unknown as JsonValue)));
      qualificationResources = acquireQualificationResources(resources.qualificationResources, extras);
    }
    const establish = (value: unknown): void => {
      if (isQualificationAssessmentInput(value)) { establishQualificationAssessment(value, qualificationResources); return; }
      if (isSelfConformanceInput(value)) {
        const view = resolveSelfConformanceInput(value, qualificationResources), scope = view.input.scope;
        if (scope !== undefined) { const { catalog, bytes } = readSelfConformanceCatalog(); if (qualificationScopeCorrespondence(scope, catalog, sha256Bytes(bytes), view.normalizedScope).length > 0) throw new TypeError("qualification scope differs"); }
        if (view.input.qualification !== undefined) resolveQualificationProof(view.input.qualification.proof, qualificationResources);
        return;
      }
      if (isRecord(value)) {
        if (isQualificationReferenceForm(value.proof)) resolveQualificationProof(value.proof as never, qualificationResources);
        // Declared wrapper/child inputs are finite data; acquisition grants no new call rights.
        for (const [key, child] of Object.entries(value)) if (key !== "task" && key !== "plan" && child !== null && typeof child === "object") establish(child);
      } else if (Array.isArray(value)) for (const child of value) establish(child);
    };
    establish(inputCarrier.value);
  } catch { return preparationRefusal(memberKey, "invalid_input", ["/qualificationResources"]); }
'''
s=s.replace(anchor,new+anchor,1).replace('runEnvironment: environmentObservation.evidence,','runEnvironment: environmentObservation.evidence,\n    ...(qualificationResources === undefined ? {} : { qualificationResources }),',1)
# sha256Bytes may already imported; add only if necessary.
if 'sha256Bytes,' not in s and 'sha256Bytes }' not in s:s=s.replace('import { sha256Canonical', 'import { sha256Bytes, sha256Canonical',1)
p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/owner_bindings/run_invocation.ts');s=p.read_text();s='import { QUALIFICATION_RESOURCE_ASSERTION_SCHEMA } from "../validator/qualification_contracts.js";\n'+s
s=s.replace('historicalSource: v.optional(ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA),','historicalSource: v.optional(ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA),\n  qualificationResources: v.optional(QUALIFICATION_RESOURCE_ASSERTION_SCHEMA),',1)
s=s.replace('...(call.resources.historicalSource === undefined ? {} : { historicalSource: call.resources.historicalSource }),','...(call.resources.historicalSource === undefined ? {} : { historicalSource: call.resources.historicalSource }),\n      ...(call.resources.qualificationResources === undefined ? {} : { qualificationResources: call.resources.qualificationResources }),',1)
s=s.replace('prefix: authorityPrefix,','prefix: authorityPrefix,\n          ...(prepared.qualificationResources === undefined ? {} : { qualificationResources: prepared.qualificationResources }),',1)
p.write_text(s)
