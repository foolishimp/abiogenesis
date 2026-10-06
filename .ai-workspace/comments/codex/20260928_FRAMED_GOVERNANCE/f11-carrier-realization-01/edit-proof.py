from pathlib import Path
p=Path('build_tenants/abiogenesis/typescript/code/src/abg/qualification_proof.ts');s=p.read_text()
s='import { isQualificationReferenceForm, resolveQualificationAssessment, resolveQualificationProof, type QualificationResources } from "../validator/qualification_resources.js";\n'+s
s=s.replace('type QualificationProofResource,', 'type QualificationProofResource, type QualificationEmbeddedProofResource,')
s=s.replace('function declarationsOf(input: unknown):','function declarationsOf(input: unknown, resources?: QualificationResources):')
s=s.replace('return declarationsOf(input.input);','return declarationsOf(input.input, resources);')
s=s.replace('if (isQualificationAssessmentInput(input)) return input.task.declarations;', 'if (isQualificationAssessmentInput(input)) return resolveQualificationAssessment(input, resources).task.declarations;\n  if (isQualificationProofResource(input.proof)) return resolveQualificationProof(input.proof, resources).declarations;\n  if (record(input.qualification) && isQualificationProofResource(input.qualification.proof)) return resolveQualificationProof(input.qualification.proof, resources).declarations;')
s=s.replace('environments: Map<string, ReturnType<typeof projectExactPrefixWorkspaceEnvironment>> };','environments: Map<string, ReturnType<typeof projectExactPrefixWorkspaceEnvironment>>; resources?: QualificationResources };')
s=s.replace('const facts = nativeFacts(prefix), known = facts.graphs.get(ref);','const facts = nativeFacts(prefix), known = facts.graphs.get(ref);\n  if (known !== undefined && referenceDependencies(known.root.rawInputValue, source?.resources) === false) return null;')
s=s.replace('const supplied = declarations.length === 0 ? declarationsOf(root.rawInputValue) : declarations;', 'if (!referenceDependencies(root.rawInputValue, source?.resources)) return null;\n  const supplied = declarations.length === 0 ? declarationsOf(root.rawInputValue, source?.resources) : declarations;')
anchor='// Facts belong to the existing immutable-prefix derivation scope.'
new='''function referenceDependencies(input: unknown, resources?: QualificationResources): boolean {
  try {
    if (!record(input)) return true;
    if (isQualificationAssessmentInput(input) && isQualificationReferenceForm(input.task)) { resolveQualificationAssessment(input, resources); return true; }
    const proof = record(input.qualification) ? input.qualification.proof : input.proof;
    if (isQualificationProofResource(proof) && isQualificationReferenceForm(proof)) { resolveQualificationProof(proof, resources); return true; }
    if (isQualificationReferenceForm(input)) { if (resources === undefined || !record(input.resource)) return false; resources.manifest(input.resource as unknown as QualificationCoordinate); }
    return true;
  } catch { return false; }
}
function ownedProof(proof: QualificationProofResource, resources?: QualificationResources): QualificationEmbeddedProofResource {
  const resolved = resolveQualificationProof(proof, resources);
  const facts = executionProofFacts.get(proof);
  if (facts !== undefined || resources !== undefined) executionProofFacts.set(resolved, { ...facts, events: facts?.events ?? readRuntimeEventsAtDurablePrefix(proof.prefix as DurablePrefixCoordinate), environments: facts?.environments ?? new Map(), ...(resources === undefined ? {} : { resources }) });
  return resolved;
}
'''
s=s.replace(anchor,new+anchor,1)
s=s.replace('input: unknown, requireCurrent = false) {','input: unknown, requireCurrent = false, resources?: QualificationResources) {',1)
s=s.replace('const owner = graphOwner(basis.predecessorPrefix as DurablePrefixCoordinate, basis.cCallRef, declarationsOf(input),\n      { events, environments: new Map() });', 'if (!referenceDependencies(input, resources)) return null;\n    const owner = graphOwner(basis.predecessorPrefix as DurablePrefixCoordinate, basis.cCallRef, declarationsOf(input, resources),\n      { events, environments: new Map(), ...(resources === undefined ? {} : { resources }) });')
# Every exported proof consumer resolves explicit reference dependencies before any retained-fact path.
names=['malformedGtlAssessmentHasNativeOwner','nativeRuntimeAssessmentHasNativeOwner','projectQualificationJudgment','projectQualificationOwnerRuling','projectQualificationConstructionAuthors','resolveQualificationAssessments','resolveQualificationExecutionMaterial','projectQualificationSelfConformance']
import re
for name in names:
 start=s.index('export function '+name+'(');end=s.index('  try {',start)
 sig=s[start:end];sig=sig.replace('proof: QualificationProofResource','proof: QualificationProofResource')
 # Insert optional final parameter before final closing parenthesis before return annotation.
 pos=sig.rfind('):');assert pos>=0,name
 sig=sig[:pos]+', resources?: QualificationResources'+sig[pos:]
 s=s[:start]+sig+s[end:]
 trypos=s.index('try {',start)+len('try {');s=s[:trypos]+'\n    proof = ownedProof(proof, resources);'+s[trypos:]
# proof plumbing inside a single operation retains its explicit dependency.
s=s.replace('graphOwner(proof.prefix as DurablePrefixCoordinate, row.cCallRef, proof.declarations)', 'graphOwner(proof.prefix as DurablePrefixCoordinate, row.cCallRef, proof.declarations as readonly AbgHistoricalDeclarationProof[], executionProofFacts.get(proof))')
s=s.replace('graphOwner(proof.prefix as DurablePrefixCoordinate, continuation.cCallRef, proof.declarations)', 'graphOwner(proof.prefix as DurablePrefixCoordinate, continuation.cCallRef, proof.declarations as readonly AbgHistoricalDeclarationProof[], executionProofFacts.get(proof))')
s=s.replace('ref, proof.declarations, executionProofFacts.get(proof)', 'ref, proof.declarations as readonly AbgHistoricalDeclarationProof[], executionProofFacts.get(proof)')
s=s.replace('const currentProof = { ...proof, prefix: consumer.predecessorPrefix };','const currentProof = { ...proof, prefix: consumer.predecessorPrefix };\n    const inherited = executionProofFacts.get(proof);\n    if (inherited !== undefined) executionProofFacts.set(currentProof, { ...inherited, events: readRuntimeEventsAtDurablePrefix(consumer.predecessorPrefix as DurablePrefixCoordinate) });')
s=s.replace('const provenance = judgment.task.provenance;', 'const provenance = resolveQualificationAssessment({ kind: "qualification_assessment_input", schemaVersion: "5.0.0", task: judgment.task, plan: judgment.plan }, resources ?? executionProofFacts.get(proof)?.resources).task.provenance;')
# Replace initial re-render/re-establishment on admitted J with native history joins.
s=s.replace('const request = qualificationWorkerRequest(candidate.owner.input);', '''const view = resolveQualificationAssessment(candidate.owner.input, resources ?? executionProofFacts.get(proof)?.resources);
      const preparation = graphOwner(value.nativeBasis.predecessorPrefix as DurablePrefixCoordinate, value.nativeBasis.cCallRef, view.task.declarations,
        { events: readRuntimeEventsAtDurablePrefix(value.nativeBasis.predecessorPrefix as DurablePrefixCoordinate), environments: new Map(), resources: resources ?? executionProofFacts.get(proof)?.resources });
      const started = one(candidate.owner.events.filter(e => e.kind === "actor_invocation_started" && e.aggregateId === value.source.actorInvocationRef && e.parentAggregateId === candidate.state.cCall.cCallRef));''')
s=s.replace('!qualificationRawMatches(candidate.owner.input, value.raw) || projectQualificationConsumer(value.nativeBasis, candidate.owner.input) === null ||', '''!qualificationRawMatches(candidate.owner.input, value.raw, view) || preparation === null || started === null || !record(started.payload) ||
          preparation.call.cCallRef !== candidate.state.cCall.cCallRef || preparation.execution.basisDigest !== candidate.owner.execution.basisDigest ||
          !sameFact(preparation.input, candidate.owner.input) || projectCCallCarrierPhaseAtPrefix(preparation.prefix, preparation.call)?.phase !== "selected_no_evidence" ||
          started.payload.inputDigest !== value.source.inputDigest || started.payload.requestDigest !== value.source.requestDigest ||
          started.payload.promptDigest !== value.source.promptDigest || started.payload.actorRef !== value.source.actorRef ||
          started.payload.workerBindingRef !== value.source.workerBindingRef || started.payload.transportBindingDigest !== value.source.transportBindingDigest ||''')
s=s.replace('transport.instructionContractRef !== request.instructionContractRef || transport.resultContractRef !== request.resultContractRef ||\n          transport.requestDigest !== hash(request) || transport.promptDigest !== hash(request.prompt) ||', 'transport.instructionContractRef !== "contract://abiogenesis/qualification/assessment-input@5" || transport.resultContractRef !== "contract://abiogenesis/qualification/assessment-raw@5" ||\n          transport.requestDigest !== started.payload.requestDigest || transport.promptDigest !== started.payload.promptDigest ||')
# Add optional resource dependencies to native exact projectors and route before fast paths.
for name in ['projectNativeRuntimeAssessment','projectQualificationRulingForConsumer','projectExactCandidateQualification','resolveQualificationSelfConformanceOwner']:
 start=s.index('export function '+name+'(');end=s.index('  try {',start);sig=s[start:end];sig=sig.replace('requireCurrent = false)', 'requireCurrent = false, resources?: QualificationResources)');s=s[:start]+sig+s[end:]
 trypos=s.index('try {',start)+len('try {');s=s[:trypos]+'\n    if (!referenceDependencies(input, resources)) return null;'+s[trypos:]
s=s.replace('projectQualificationConsumer(basis, input, requireCurrent)', 'projectQualificationConsumer(basis, input, requireCurrent, resources)')
s=s.replace('export function qualificationHasNativeSelfConformance(input: QualificationVerdictInput, consumer: QualificationNativeBasis)', 'export function qualificationHasNativeSelfConformance(input: QualificationVerdictInput, consumer: QualificationNativeBasis, resources?: QualificationResources)')
s=s.replace('selections[0]!, input.basis);', 'selections[0]!, input.basis, resources);')
s=s.replace('!qualificationHasNativeSelfConformance(input as QualificationVerdictInput, basis)', '!qualificationHasNativeSelfConformance(input as QualificationVerdictInput, basis, resources)')
p.write_text(s)
