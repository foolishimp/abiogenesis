import { projectWorksiteRevisionOrigins, worksiteRevisionPhysicalMatches, worksiteRevisionSeedMatches,
  worksiteRevisionEntryBindingDisposition, projectWorksiteRevisionBindingOrigin, worksiteRevisionMeaningMatches,
  retainedWorksitePhysicalMatches, worksiteRevisionOriginSurvives, worksiteExecutionSourcesCurrent, type WorksiteRevisionOriginProof } from "./worksite_revision.js";
import { selectValidatedRuntimeEventPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { WORKSITE_REVISION_IDS, type WorksiteRevisionObservationOrigin } from "../product/worksite_revision.js";
import { constructWorksiteRevisionCommandPreparationInput } from "../product/worksite_preparation.js";
import { isWorksiteRevisionCommandExecutionObservation } from "../product/worksite_command_execution.js";
import { WORKSITE_C0_IDS, isWorksiteFileReplaceOutput } from "../gtl/worksite_c0.js";
import { WORKSITE_COMMAND_EXECUTION_IDS, isWorksiteCommandExecutionObservation } from "../product/worksite_command_execution.js";
import { WORKSITE_CONSTRUCTION_IDS, isWorksiteConstructionResult, constructWorksiteConstructionTask } from "../product/worksite_construction.js";
import { isWorksitePreparationInput, prepareWorksiteCommandTask } from "../product/worksite_preparation.js";
import { selectedSemanticPredecessor } from "./semantic_stage.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { SEMANTIC_REVISION_IDS as ids } from "../gtl/semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { deriveSemanticRevision, deriveRevisionAsset, deriveRevisionAssessment, isSemanticRevisionRequest,
  isSemanticRevisionSelection, isSemanticRevisionSelectionInput, isSemanticRevisionEnvelope, semanticRevisionSelectionInputMatchesRequest, type SemanticRevisionCoordinate,
  type SemanticRevisionEnvelope } from "../product/semantic_revision.js";
import { isSemanticStageEnvelope, type SemanticStageEnvelope, type SemanticWorksiteBasis,
  deriveSemanticWorksiteConstructionConfiguration, projectSemanticWorksiteCoordinates } from "../product/semantic_stage.js";
import { authenticateSemanticStageBasis, projectSemanticPredecessorAtPrefix, semanticInputValueAtBasis,
  type SemanticStageNativeBasis } from "./semantic_stage.js";
import { rehydrateExecutionBasisAtPrefix } from "./execution_basis.js";
import { rehydrateInvocationAdmissionAtPrefix } from "./invocation_admission.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { constructWorksiteObservation, isWorksiteObservation, isWorksitePostPublicationFailure } from "../product/worksite_effect.js";
import { readFileSync, lstatSync, realpathSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { authenticateSemanticJobBasis, semanticJobConstructionSourceAtPrefix } from "./semantic_job.js";
import { projectWorksiteRevisionNativeResult } from "./worksite_revision.js";
import { isSemanticJobEnvelope, deriveSemanticJobPreparation, deriveSemanticJobReadDependencies, projectSemanticJobBindings } from "../product/semantic_job.js";
import { isSemanticJobRevisionEnvelope, deriveSemanticJobRevision, deriveJobRevisionAsset, deriveJobRevisionAssessment,
  type SemanticJobRevisionEnvelope } from "../product/semantic_revision.js";

const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const recordJob = (x: unknown): x is Record<string, JsonValue> => x !== null && typeof x === "object" && !Array.isArray(x);
/** D2's job arm reuses this owner's parent/cause and physical-origin relations. */
export function projectJobRevisionSubject(basis: SemanticStageNativeBasis, input: unknown, readPhysical = false) {
  return isSemanticJobRevisionEnvelope(input) && input.current.evidence !== null
    ? jobRevisionEvidenceSubjectAtBasis(basis, input, readPhysical)
    : jobRevisionSubjectAtBasis(basis, input, readPhysical);
}
function jobRevisionSubjectAtBasis(basis: SemanticStageNativeBasis, input: unknown, readPhysical: boolean,
  historicalBridge?: NonNullable<ReturnType<typeof selectedSemanticPredecessor>>) {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    const request = isSemanticJobRevisionEnvelope(input) ? input.revisionBasis.request : input;
    if (owner === null || (!isSemanticRevisionSelectionInput(request) && !isSemanticRevisionRequest(request)) ||
      hash(owner.inputValue) !== owner.inputDigest) return null;
    if (historicalBridge === undefined ? hash(owner.inputValue) !== hash(input) :
      historicalBridge.previous.cCall.implementationRef !== ids.bridgeImplementationRef ||
      historicalBridge.execution.invocationAdmissionRef !== owner.execution.invocationAdmissionRef ||
      hash(historicalBridge.execution.rawInputValue) !== hash(input)) return null;
    const parent = projectWorksiteRevisionNativeResult(owner.prefix, request.parent);
    const envelope = parent === null ? null : isSemanticJobRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
    if (parent?.result.resultClass !== "success" || parent.judgment.judgment !== "advance" || !isSemanticJobEnvelope(envelope) ||
      hash(envelope.job) !== hash(owner.root.rawInputValue) || envelope.basis.rootExecutionBasisRef !== owner.root.basisRef ||
      hash(envelope.declaration) !== hash(owner.lifecycle)) return null;
    const parentBasis = rehydrateExecutionBasisAtPrefix(owner.prefix, parent.cCall.basisId);
    const construction = semanticJobConstructionSourceAtPrefix(owner.prefix, envelope);
    const priorWorksite = envelope.worksite ?? construction?.worksite ?? null;
    const current = isSemanticJobRevisionEnvelope(input) ? input.current.worksite : request.currentWorksite;
    if (parentBasis === null || construction === null || priorWorksite === null || current === null ||
      !worksiteRevisionMeaningMatches(priorWorksite, current) ||
      hash(owner.environment.workspaceAuthorityBasis) !== hash(current.workspaceAuthorityBasis) ||
      hash(owner.environment.workspaceBinding) !== hash(current.workspaceBinding) || hash(owner.grant) !== hash(current.capabilityGrant) ||
      worksiteRevisionEntryBindingDisposition(owner.prefix,basis.graphFunction,input,current.workspaceBinding) === "basis_fork_detected") return null;
    const causes = request.causes.map(c => projectWorksiteRevisionNativeResult(owner.prefix,c));
    const eligible = new Set([parentBasis.invocationAdmissionRef, construction.seed.invocationAdmissionRef]);
    for (const cause of causes) {
      if (cause === null || cause.cCall.cCallRef === parent.cCall.cCallRef) return null;
      const execution = rehydrateExecutionBasisAtPrefix(owner.prefix,cause.cCall.basisId);
      const invocation = execution === null ? null : rehydrateInvocationAdmissionAtPrefix(owner.prefix,execution.invocationAdmissionRef);
      if (execution === null || (execution.invocationAdmissionRef !== parentBasis.invocationAdmissionRef && invocation?.sourceResultBasis?.sourceResultRef !== parent.result.resultRef) ||
        !(cause.result.resultClass === "failure" || cause.judgment.judgment !== "advance" || isSemanticRevisionCommandCause(cause.result.value) ||
          isSemanticJobEnvelope(cause.result.value) && cause.result.value.assets.some(a => a.assessment !== null && a.assessment.disposition !== "satisfied"))) return null;
      eligible.add(execution.invocationAdmissionRef);
    }
    if (isSemanticJobRevisionEnvelope(parent.result.value)) for (const coordinate of parent.result.value.revisionBasis.request.causes) {
      const cause = projectWorksiteRevisionNativeResult(owner.prefix,coordinate), execution = cause === null ? null : rehydrateExecutionBasisAtPrefix(owner.prefix,cause.cCall.basisId);
      if (execution === null) return null;
      eligible.add(execution.invocationAdmissionRef);
    }
    const originCut = historicalBridge === undefined ? owner.prefix :
      selectValidatedRuntimeEventPrefix(Object.freeze(owner.events.filter(e => e.admissionOrdinal < historicalBridge.event.admissionOrdinal)));
    const origins = projectWorksiteRevisionOrigins(originCut,construction.seed,priorWorksite,current,[...eligible]);
    if (origins === null || readPhysical && !worksiteRevisionPhysicalMatches(current)) return null;
    // Later Evidence assets are context for correction, not a replacement for
    // the initial Design/context authenticated by the construction bridge.
    const readBasis = deriveSemanticJobReadDependencies(construction.original, current);
    if (readPhysical && readBasis !== undefined && !retainedWorksitePhysicalMatches(current.workspaceAuthorityBasis, readBasis.members)) return null;
    return { owner, request, parent, envelope, construction, priorWorksite, currentWorksite: current, origins, eligibleInvocationRefs: [...eligible],
      causes: causes.filter((c): c is NonNullable<typeof c> => c !== null) };
  } catch { return null; }
}
/** The saved revision input remains historical after its selected effects.
 * Current observations come only from the exact admitted C1/C2/Evidence join;
 * later assets never select a different construction or evidence producer. */
function jobRevisionEvidenceSubjectAtBasis(basis: SemanticStageNativeBasis, input: SemanticJobRevisionEnvelope,
  readPhysical: boolean): ReturnType<typeof jobRevisionSubjectAtBasis> {
  try {
    if (!semanticJobRevisionInputMatchesBasis(basis, input) || input.current.evidence === null) return null;
    const evidence = input.current.evidence, observation = evidence.executionObservation;
    if (!isWorksiteRevisionCommandExecutionObservation(observation)) return null;
    const parts = revisionEvidenceComponentsAtBasis(basis, observation);
    if (parts === null || parts.subject === null || !isSemanticJobRevisionEnvelope(parts.original)) return null;
    const { original, subject, construction, execution } = parts, owner = subject.owner;
    const { assets: _assets, bindingVersions: _versions, ...currentCoordinates } = input.current;
    const { assets: _oldAssets, bindingVersions: _oldVersions, ...originalCoordinates } = original.current;
    if (hash(input.revisionBasis) !== hash(original.revisionBasis) ||
      hash(currentCoordinates) !== hash({ ...originalCoordinates, evidence }) ||
      evidence.constructionResultRef !== construction.previous.result.resultRef ||
      evidence.constructionResultDigest !== construction.previous.result.resultDigest ||
      evidence.executionResultRef !== execution.previous.result.resultRef ||
      evidence.executionResultDigest !== execution.previous.result.resultDigest ||
      hash(evidence.constructionResult) !== hash(observation.task.sourceConstructionResult)) return null;
    const originalWithEvidence = { ...original, current: { ...original.current, evidence } };
    const admittedEvidence = selectedSemanticPredecessor(basis, ids.evidenceInputImplementationRef, originalWithEvidence);
    if (admittedEvidence === null || admittedEvidence.event.admissionOrdinal <= execution.event.admissionOrdinal ||
      hash(admittedEvidence.execution.rawInputValue) !== hash(observation) ||
      !worksiteExecutionSourcesCurrent(owner.prefix, observation.task)) return null;
    // The existing Evidence owner admitted these exact snapshot bodies. Cold
    // reconstruction validates their content identities without rereading I/O.
    if (evidence.artifacts.length !== observation.snapshotMembers.length ||
      !observation.snapshotMembers.every((member, ordinal) => {
        const source = observation.task.snapshotSources[ordinal], artifact = evidence.artifacts[ordinal];
        if (source === undefined || artifact === undefined) return false;
        const bytes = Buffer.from(artifact.base64, "base64");
        return artifact.subjectRef === source.subject.subjectRef && artifact.observationRef === member.sourceObservationRef &&
          source.observation.observationRef === member.sourceObservationRef && source.designTargetRef === member.designTargetRef &&
          hash(source.source) === hash(member.source) && bytes.toString("base64") === artifact.base64 &&
          bytes.length === member.byteLength && sha256Bytes(bytes) === member.digest;
      })) return null;
    const historical = subject.currentWorksite;
    const targets = historical.targets.map(row => {
      const ordinal = observation.task.snapshotSources.findIndex(source => hash(source.subject) === hash(row.target.subject));
      const source = observation.task.snapshotSources[ordinal], artifact = evidence.artifacts[ordinal];
      if (source === undefined || artifact === undefined) throw new TypeError("revision target has no admitted snapshot source");
      const task = constructWorksiteConstructionTask({ workspaceAuthorityBasis: historical.workspaceAuthorityBasis,
        workspaceBinding: historical.workspaceBinding, capabilityGrant: historical.capabilityGrant,
        prompt: "Current admitted revision evidence", targets: [{ subject: source.subject,
          territory: row.target.territory, predecessorObservation: source.observation }] });
      return { target: task.targets[0]!, role: row.role, base64: artifact.base64 };
    });
    const currentWorksite = deepFreeze({ ...historical, targets });
    const origins = projectWorksiteRevisionOrigins(owner.prefix, subject.construction.seed, subject.priorWorksite,
      currentWorksite, [...subject.eligibleInvocationRefs, owner.execution.invocationAdmissionRef]);
    if (origins === null || readPhysical && (!worksiteRevisionPhysicalMatches(currentWorksite) ||
      !retainedWorksitePhysicalMatches(currentWorksite.workspaceAuthorityBasis, observation.task.snapshotSources))) return null;
    return { ...subject, currentWorksite, origins };
  } catch { return null; }
}
export function jobRevisionSelectionMatchesBasis(basis: SemanticStageNativeBasis,input: unknown,output: unknown): boolean {
  const subject = projectJobRevisionSubject(basis,input);
  if (subject === null || !isSemanticRevisionSelectionInput(input) || !isSemanticRevisionSelection(output) ||
    subject.owner.call.implementationRef !== ids.selectionImplementationRef || basis.graphFunction.declarations["abg.semantic_revision_selection"] !== subject.owner.lifecycle.declarationRef ||
    hash(input.parent) !== hash(output.parent) || hash(input.causes) !== hash(output.causes)) return false;
  const active = projectSemanticJobBindings(subject.envelope);
  return active !== null && output.selectedObligationRefs.every(r => active.some(v => v.binding.obligationRef === r)) &&
    output.selectedTargetRefs.every(r => subject.priorWorksite.targets.some(t => t.target.targetRef === r)) &&
    (output.selectedStageRef === null || subject.owner.lifecycle.stages.some(s => s.declarationRef === output.selectedStageRef));
}
export function projectSemanticJobRevision(basis: SemanticStageNativeBasis,input: unknown,readPhysical = true) {
  const subject = projectJobRevisionSubject(basis,input,readPhysical);
  if (subject === null || !isSemanticRevisionRequest(input) || subject.owner.call.implementationRef !== ids.projectionImplementationRef) return null;
  const decision = projectWorksiteRevisionNativeResult(subject.owner.prefix,input.selection);
  const execution = decision === null ? null : rehydrateExecutionBasisAtPrefix(subject.owner.prefix,decision.cCall.basisId);
  if (decision?.result.resultClass !== "success" || decision.judgment.judgment !== "advance" ||
    decision.cCall.implementationRef !== ids.selectionImplementationRef || !isSemanticRevisionSelection(decision.result.value) || execution === null ||
    !semanticRevisionSelectionInputMatchesRequest(execution.rawInputValue,input) ||
    !basis.declarationGraphFunctions.some(g => g.name === decision.cCall.graphFunctionRef && g.declarations["abg.semantic_revision_selection"] === subject.owner.lifecycle.declarationRef)) return null;
  const parent = subject.parent.result.value;
  return isSemanticJobEnvelope(parent) || isSemanticJobRevisionEnvelope(parent)
    ? deriveSemanticJobRevision(parent,input,decision.result.value,subject.currentWorksite,subject.priorWorksite) : null;
}
export function semanticJobRevisionInputMatchesBasis(basis: SemanticStageNativeBasis,input: unknown): input is SemanticJobRevisionEnvelope {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner === null || !isSemanticJobRevisionEnvelope(input) || hash(input) !== owner.inputDigest || hash(owner.inputValue) !== hash(input) ||
      hash(input.current.job) !== hash(owner.root.rawInputValue) || hash(input.current.declaration) !== hash(owner.lifecycle)) return false;
    const sources = owner.events.filter(e => e.kind === "c_call_result_admitted" && recordJob(e.payload) && hash(e.payload.value) === hash(input)).flatMap(event => {
      const judgment = owner.events.find(e => e.kind === "c_call_judged" && e.aggregateId === event.aggregateId);
      if (judgment === undefined || !recordJob(event.payload)) return [];
      const result = projectWorksiteRevisionNativeResult(owner.prefix,{cCallRef:event.aggregateId,resultRef:event.payload.resultRef as string,
        resultDigest:event.payload.resultDigest as `sha256:${string}`,resultAdmissionEventRef:event.eventId,judgmentEventRef:judgment.eventId});
      const execution = result === null ? null : rehydrateExecutionBasisAtPrefix(owner.prefix,result.cCall.basisId);
      return result?.result.resultClass === "success" && result.judgment.judgment === "advance" &&
        [ids.projectionImplementationRef,ids.authorImplementationRef,ids.assessorImplementationRef,ids.evidenceInputImplementationRef].some(r => r === result.cCall.implementationRef) &&
        execution?.invocationAdmissionRef === owner.execution.invocationAdmissionRef ? [result] : [];
    });
    return sources.length === 1;
  } catch { return false; }
}
export function projectJobRevisionPreparation(basis: SemanticStageNativeBasis,input: unknown,readPhysical = true) {
  try {
    if (!semanticJobRevisionInputMatchesBasis(basis,input)) return null;
    const subject = projectJobRevisionSubject(basis,input,readPhysical);
    return subject === null ? null : jobRevisionPreparationFromSubject(subject, input);
  } catch { return null; }
}
function jobRevisionPreparationFromSubject(subject: NonNullable<ReturnType<typeof projectJobRevisionSubject>>, input: SemanticJobRevisionEnvelope) {
  try {
    const current = subject.currentWorksite, prior = subject.priorWorksite;
    const selectedPaths = input.revisionBasis.selection.selectedTargetRefs.map(ref => prior.targets.find(t => t.target.targetRef === ref)?.target.subject.relativePath);
    if (selectedPaths.length === 0 || selectedPaths.some(p => p === undefined)) return null;
    const configuration = deriveSemanticJobPreparation(input.current,current,{selectedPaths:selectedPaths as string[],
      feedback:{selection:input.revisionBasis.selection,causes:subject.causes,historicalAssets:input.revisionBasis.historicalAssets} as unknown as JsonValue});
    if (configuration === null) return null;
    const snapshotTargetRefs = prior.targets.map(t => t.target.targetRef);
    const dependencyObservations = prior.targets.filter(t => !input.revisionBasis.selection.selectedTargetRefs.includes(t.target.targetRef)).map(t => {
      const ordinal = current.targets.findIndex(r => r.target.subject.relativePath === t.target.subject.relativePath), row = current.targets[ordinal], proof = subject.origins[ordinal];
      if (row === undefined || row.target.predecessorObservation.state !== "file" || proof === undefined) throw new TypeError("missing current dependency");
      const origin = proof.kind === "pending_binding_correspondence" ? projectWorksiteRevisionBindingOrigin(subject.owner.prefix,input) : proof;
      if (origin === null) throw new TypeError("unadmitted binding projection");
      return {designTargetRef:t.target.targetRef,subject:row.target.subject,observation:row.target.predecessorObservation,origin};
    });
    const { kind: _kind, schemaVersion: _schemaVersion, readDependencyBasis, ...constructionConfiguration } = configuration;
    if (readDependencyBasis !== undefined) {
      const event = subject.owner.events.find(event => event.kind === "c_call_result_admitted" && recordJob(event.payload) &&
        event.payload.resultRef === subject.construction.result.resultRef);
      const judgment = event === undefined ? undefined : subject.owner.events.find(row => row.kind === "c_call_judged" && row.aggregateId === event.aggregateId);
      if (event === undefined || judgment === undefined) return null;
      for (const member of readDependencyBasis.members) {
        const row = { designTargetRef: member.sourceMemberRef, subject: member.subject, observation: member.observation,
          origin: { kind: "admitted_initial_job_bridge" as const, resultAdmissionEventRef: event.eventId, judgmentEventRef: judgment.eventId } };
        if (!worksiteRevisionOriginSurvives(subject.owner.prefix, row)) return null;
        snapshotTargetRefs.push(member.sourceMemberRef); dependencyObservations.push(row);
      }
    }
    return constructWorksiteRevisionCommandPreparationInput({...constructionConfiguration,revisionBasisRef:input.revisionBasis.basisRef,
      revisionBasisDigest:input.revisionBasis.basisDigest,snapshotTargetRefs,dependencyObservations});
  } catch { return null; }
}
export function semanticJobRevisionResultMatchesBasis(basis: SemanticStageNativeBasis,input: unknown,output: unknown): boolean {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null) return false;
  if (owner.call.implementationRef === ids.selectionImplementationRef) return jobRevisionSelectionMatchesBasis(basis,input,output);
  if (owner.call.implementationRef === ids.projectionImplementationRef) { const value=projectSemanticJobRevision(basis,input);return value!==null&&hash(value)===hash(output); }
  if (owner.call.implementationRef === ids.bridgeImplementationRef) { const value=projectJobRevisionPreparation(basis,input);return value!==null&&hash(value)===hash(output); }
  if (owner.call.implementationRef === ids.evidenceInputImplementationRef) { const value=projectRevisionEvidenceInput(basis,input);return value!==null&&hash(value)===hash(output); }
  if (!semanticJobRevisionInputMatchesBasis(basis,input)) return false;
  if (owner.call.implementationRef === ids.terminalImplementationRef) return hash(input)===hash(output);
  if (!isSemanticJobRevisionEnvelope(output) || owner.stage===undefined) return false;
  const asset=output.current.assets.at(-1),source=owner.role==="author"?asset?.source:asset?.assessment?.source;
  if(source===undefined||source.cCallRef!==owner.call.cCallRef||source.inputDigest!==owner.inputDigest)return false;
  const value=owner.role==="author"?deriveJobRevisionAsset(input,owner.stage.declarationRef,asset!.candidate,source):deriveJobRevisionAssessment(input,owner.stage.declarationRef,asset!.assessment?.candidate,source);
  return value!==null&&hash(value)===hash(output);
}
export function isSemanticRevisionCommandCause(value: unknown): boolean {
  return isWorksiteCommandExecutionObservation(value) || isWorksiteRevisionCommandExecutionObservation(value);
}
function admitted(basis: SemanticStageNativeBasis, c: SemanticRevisionCoordinate) {
  const owner = authenticateSemanticStageBasis(basis);
  if (owner === null) return null;
  const result = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, c.cCallRef, basis.declarationGraphFunctions);
  return result !== null && result.result.resultRef === c.resultRef && result.result.resultDigest === c.resultDigest &&
    result.result.admissionEventRef === c.resultAdmissionEventRef && result.judgment.admissionEventRef === c.judgmentEventRef ? result : null;
}
function revisionWorksiteProjection(basis: SemanticStageNativeBasis, parentCoordinate: SemanticRevisionCoordinate,
  prior: SemanticWorksiteBasis | null, current: SemanticWorksiteBasis | null,
  readPhysical: boolean, causes: readonly SemanticRevisionCoordinate[], cut?: ValidatedRuntimeEventPrefix): readonly WorksiteRevisionOriginProof[] | null {
  if (prior === null || current === null) return prior === current ? [] : null;
  const owner = authenticateSemanticStageBasis(basis), parent = admitted(basis, parentCoordinate);
  if (owner === null || parent === null || !worksiteRevisionMeaningMatches(prior,current)) return null;
  const env = projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix,
    { ref: owner.execution.workspaceBindingId, digest: owner.execution.workspaceBindingDigest });
  const invocation = rehydrateInvocationAdmissionAtPrefix(owner.prefix, owner.execution.invocationAdmissionRef);
  if (env.kind !== "exact_prefix_workspace_environment" || hash(env.workspaceBinding) !== hash(current.workspaceBinding) ||
    hash(env.workspaceAuthorityBasis) !== hash(current.workspaceAuthorityBasis) || invocation?.capabilityGrants.length !== 1 ||
    hash(invocation.capabilityGrants[0]) !== hash(current.capabilityGrant)) return null;
  if(worksiteRevisionEntryBindingDisposition(cut??owner.prefix,basis.graphFunction,semanticInputValueAtBasis(basis),current.workspaceBinding)==="basis_fork_detected")return null;
  const parentExecution = rehydrateExecutionBasisAtPrefix(owner.prefix, parent.cCall.basisId);
  if (parentExecution === null) return null;
  const eligible = new Set([parentExecution.invocationAdmissionRef]);
  for (const coordinate of causes) {
    const cause = admitted(basis, coordinate);
    const execution = cause === null ? null : rehydrateExecutionBasisAtPrefix(owner.prefix, cause.cCall.basisId);
    if (execution === null) return null;
    eligible.add(execution.invocationAdmissionRef);
  }
  // Conserved earlier revision history remains a source; never substitute "latest C1".
  let ancestor = parent;
  let seedBasis = parentExecution;
  const visited = new Set<string>();
  while (isSemanticRevisionEnvelope(ancestor.result.value)) {
    const revision = ancestor.result.value;
    if (visited.has(revision.revisionBasis.basisRef) || hash(revision.current.lifecycle) !== hash(owner.lifecycle) ||
      hash(revision.current.sourceHandoff.declaration) !== hash(owner.source) || revision.current.worksite === null ||
      hash(revision.current.worksite.workspaceAuthorityBasis) !== hash(current.workspaceAuthorityBasis) ||
      projectSemanticWorksiteCoordinates(revision.current.worksite,current)===null) return null;
    visited.add(revision.revisionBasis.basisRef);
    const ancestorOrdinal = owner.events.find(event => event.eventId === ancestor.result.admissionEventRef)?.admissionOrdinal;
    for (const coordinate of [revision.revisionBasis.request.parent, ...revision.revisionBasis.request.causes]) {
      const previous = admitted(basis, coordinate);
      const execution = previous === null ? null : rehydrateExecutionBasisAtPrefix(owner.prefix, previous.cCall.basisId);
      const previousOrdinal = owner.events.find(event => event.eventId === previous?.judgment.admissionEventRef)?.admissionOrdinal;
      if (execution === null || previousOrdinal === undefined || ancestorOrdinal === undefined || previousOrdinal >= ancestorOrdinal) return null;
      eligible.add(execution.invocationAdmissionRef);
    }
    const previous = admitted(basis, revision.revisionBasis.request.parent);
    const execution = previous === null ? null : rehydrateExecutionBasisAtPrefix(owner.prefix, previous.cCall.basisId);
    if (previous === null || execution === null || previous.result.resultClass !== "success" || previous.judgment.judgment !== "advance") return null;
    ancestor = previous;
    seedBasis = execution;
  }
  if (!isSemanticStageEnvelope(ancestor.result.value) || hash(ancestor.result.value.lifecycle) !== hash(owner.lifecycle) ||
    hash(ancestor.result.value.sourceHandoff.declaration) !== hash(owner.source) ||
    ancestor.result.value.worksite===null||
    !worksiteRevisionSeedMatches(seedBasis, ancestor.result.value, ancestor.result.value.worksite)) return null;
  const origins = projectWorksiteRevisionOrigins(cut ?? owner.prefix, seedBasis, prior, current, [...eligible]);
  return origins !== null && (!readPhysical || worksiteRevisionPhysicalMatches(current)) ? origins : null;
}
/** Resolves the actual failed result separately from valid advancing history. */
export function projectSemanticRevision(basis: SemanticStageNativeBasis, input: unknown,
  readPhysical = true): Readonly<SemanticRevisionEnvelope> | null {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || !isSemanticRevisionRequest(input) || hash(semanticInputValueAtBasis(basis)) !== hash(input) ||
      owner.call.implementationRef !== ids.projectionImplementationRef) return null;
    const parent = admitted(basis, input.parent), decision = admitted(basis, input.selection);
    if (parent === null || decision === null || parent.result.resultClass !== "success" || parent.judgment.judgment !== "advance" ||
      (!isSemanticStageEnvelope(parent.result.value) && !isSemanticRevisionEnvelope(parent.result.value)) ||
      decision.result.resultClass !== "success" || decision.judgment.judgment !== "advance" ||
      !["F_P", "F_H"].includes(decision.cCall.regime) || decision.cCall.outputContractRef !== ids.selectionContractRef ||
      !isSemanticRevisionSelection(decision.result.value)) return null;
    const selection = decision.result.value;
    const prior = isSemanticRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
    if (hash(prior.lifecycle) !== hash(owner.lifecycle) || hash(prior.sourceHandoff.declaration) !== hash(owner.source)) return null;
    const decisionExecution = rehydrateExecutionBasisAtPrefix(owner.prefix, decision.cCall.basisId);
    const decisionGraph = basis.declarationGraphFunctions.find(g => g.name === decision.cCall.graphFunctionRef &&
      g.declarations["abg.semantic_revision_selection"] === owner.lifecycle.declarationRef);
    if (decisionExecution === null || decisionGraph === undefined ||
      !semanticRevisionSelectionInputMatchesRequest(decisionExecution.rawInputValue, input)) return null;
    const parentExecution = rehydrateExecutionBasisAtPrefix(owner.prefix, parent.cCall.basisId);
    if (parentExecution === null) return null;
    for (const c of input.causes) {
      const cause = admitted(basis, c);
      if (cause === null) return null;
      const execution = rehydrateExecutionBasisAtPrefix(owner.prefix, cause.cCall.basisId);
      if (execution === null) return null;
      const invocation = rehydrateInvocationAdmissionAtPrefix(owner.prefix, execution.invocationAdmissionRef);
      const linked = execution.invocationAdmissionRef === parentExecution.invocationAdmissionRef ||
        invocation?.sourceResultBasis?.sourceResultRef === parent.result.resultRef;
      if (!linked || cause.cCall.cCallRef === parent.cCall.cCallRef ||
        !(cause.result.resultClass === "failure" || cause.judgment.judgment !== "advance" ||
          (isSemanticStageEnvelope(cause.result.value) && cause.result.value.assets.some(a => a.assessment?.disposition !== "satisfied")) ||
          isSemanticRevisionCommandCause(cause.result.value))) return null;
    }
    if (revisionWorksiteProjection(basis, input.parent, prior.worksite, input.currentWorksite, readPhysical, input.causes) === null) return null;
    return deriveSemanticRevision(parent.result.value, input, selection);
  } catch { return null; }
}
/** The wrapper is admitted only as a whole native projection/author/assessor result. */
export function semanticRevisionInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticRevisionEnvelope {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || !isSemanticRevisionEnvelope(input) || hash(semanticInputValueAtBasis(basis)) !== hash(input) ||
      hash(input.current.lifecycle) !== hash(owner.lifecycle) || hash(input.current.sourceHandoff.declaration) !== hash(owner.source)) return false;
    const sources = owner.events.filter(e => e.kind === "c_call_result_admitted" && hash((e.payload as { value?: unknown }).value) === hash(input)).filter(event => {
      const source = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, event.aggregateId, basis.declarationGraphFunctions);
      return source !== null && source.result.resultClass === "success" && source.judgment.judgment === "advance" &&
        [ids.projectionImplementationRef, ids.authorImplementationRef, ids.assessorImplementationRef, ids.evidenceInputImplementationRef].some(r => r === source.cCall.implementationRef);
    });
    return sources.length === 1;
  } catch { return false; }
}
export function semanticRevisionResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean {
  const owner = authenticateSemanticStageBasis(basis);
  if (owner === null) return false;
  if (owner.call.implementationRef === ids.selectionImplementationRef) return semanticRevisionSelectionMatchesBasis(basis, input, output);
  if (owner.call.implementationRef === ids.projectionImplementationRef) {
    const expected = projectSemanticRevision(basis, input);
    return expected !== null && hash(expected) === hash(output);
  }
  if (owner.call.implementationRef === ids.evidenceInputImplementationRef) { const expected = projectRevisionEvidenceInput(basis, input); return expected !== null && hash(expected) === hash(output); }
  if (!semanticRevisionInputMatchesBasis(basis, input)) return false;
  if (owner.call.implementationRef === ids.bridgeImplementationRef) { const expected = projectRevisionWorksitePreparation(basis, input); return expected !== null && hash(expected) === hash(output); }
  if (owner.call.implementationRef === ids.terminalImplementationRef) return hash(input) === hash(output);
  if (!isSemanticRevisionEnvelope(output) || owner.stage === undefined) return false;
  const asset = output.current.assets.at(-1), role = owner.role;
  const source = role === "author" ? asset?.source : asset?.assessment?.source;
  if (asset === undefined || source === undefined || source.cCallRef !== owner.call.cCallRef || source.inputDigest !== owner.inputDigest) return false;
  const expected = role === "author" ? deriveRevisionAsset(input, owner.stage.declarationRef, asset.candidate, source)
    : role === "assessor" ? deriveRevisionAssessment(input, owner.stage.declarationRef, asset.assessment?.candidate, source) : null;
  return expected !== null && hash(expected) === hash(output);
}
/** Pure mapping is reconstructed from the native parent, never caller currentness. */
export function projectRevisionHistoricalContext(basis: SemanticStageNativeBasis, input: SemanticRevisionEnvelope) {
  const rows: { parent: SemanticRevisionCoordinate; status: "historical_invalidated_or_preserved"; assets: SemanticStageEnvelope["assets"] }[] = [];
  const visited = new Set<string>();
  let coordinate = input.revisionBasis.request.parent;
  for (;;) {
    const parent = admitted(basis, coordinate);
    if (parent === null || visited.has(parent.result.resultRef)) return null;
    visited.add(parent.result.resultRef);
    const envelope = isSemanticRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
    if (!isSemanticStageEnvelope(envelope)) return null;
    rows.push({ parent: coordinate, status: "historical_invalidated_or_preserved", assets: envelope.assets });
    if (!isSemanticRevisionEnvelope(parent.result.value)) break;
    coordinate = parent.result.value.revisionBasis.request.parent;
  }
  return deepFreeze(rows);
}
/** The retained Design names its author's worksite, not the latest observation.
 * This read-only join supplies no currentness; the existing origin projection
 * and whole revision-input admission remain required by preparation. */
export function projectRevisionDesignCoordinates(basis: SemanticStageNativeBasis, input: SemanticRevisionEnvelope) {
  try {
    const owner = authenticateSemanticStageBasis(basis);
    if (owner === null || !isSemanticRevisionEnvelope(input) || input.current.worksite === null) return null;
    const parent = admitted(basis, input.revisionBasis.request.parent);
    const prior = parent === null ? null : isSemanticRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
    if (parent?.result.resultClass !== "success" || parent.judgment.judgment !== "advance" ||
      !isSemanticStageEnvelope(prior) || prior.worksite === null) return null;
    const asset = input.current.assets.at(-1), design = asset?.candidate.worksiteDesign;
    if (asset === undefined || asset.assessment?.disposition !== "satisfied" || design === null || design === undefined) return null;
    const author = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication,
      asset.source.cCallRef, basis.declarationGraphFunctions);
    if (author === null || author.result.resultClass !== "success" || author.judgment.judgment !== "advance" ||
      ![SEMANTIC_STAGE_IDS.authorImplementationRef, ids.authorImplementationRef].some(ref => ref === author.cCall.implementationRef)) return null;
    const authored = isSemanticRevisionEnvelope(author.result.value) ? author.result.value.current : author.result.value;
    if (!isSemanticStageEnvelope(authored) || authored.worksite === null ||
      hash(authored.assets.at(-1)) !== hash({ ...asset, assessment: null }) ||
      hash(authored.lifecycle) !== hash(owner.lifecycle) || hash(authored.lifecycle) !== hash(input.current.lifecycle) ||
      hash(authored.sourceHandoff) !== hash(input.current.sourceHandoff) || hash(authored.sourceHandoff.declaration) !== hash(owner.source) ||
      hash(authored.worksite.workspaceAuthorityBasis) !== hash(input.current.worksite.workspaceAuthorityBasis)) return null;
    const history = authored.worksite, current = input.current.worksite;
    const crosses=hash(history.workspaceBinding)!==hash(current.workspaceBinding);
    if(crosses&&projectWorksiteRevisionBindingOrigin(owner.prefix,input)===null)return null;
    const projectedHistory=crosses?projectSemanticWorksiteCoordinates(history,current):history;
    const projectedPrior=hash(prior.worksite!.workspaceBinding)!==hash(current.workspaceBinding)?projectSemanticWorksiteCoordinates(prior.worksite!,current):prior.worksite!;
    if(projectedHistory===null||projectedPrior===null)return null;
    const inventory = new Set([...design.targets.map(t => t.targetRef), ...design.dependencyTargetRefs]);
    const rows = history.targets.filter(row => inventory.has(row.target.targetRef));
    if (rows.length !== inventory.size || new Set(rows.map(row => row.target.targetRef)).size !== rows.length) return null;
    const sameSubject = (a: SemanticWorksiteBasis["targets"][number], b: SemanticWorksiteBasis["targets"][number]) => {
      const source=history.targets.indexOf(a),previous=prior.worksite!.targets.indexOf(b);
      const left=source<0?a:projectedHistory.targets[source]!,right=previous<0?b:projectedPrior.targets[previous]!;
      return hash(left.target.subject)===hash(right.target.subject)&&hash(left.target.territory)===hash(right.target.territory)&&left.role===right.role;
    };
    if (rows.some(row => prior.worksite!.targets.filter(t => sameSubject(row, t)).length !== 1 ||
      current.targets.filter(t => sameSubject(row, t)).length !== 1)) return null;
    const selected = input.revisionBasis.selection.selectedTargetRefs.map(ref => {
      const selectedRows = prior.worksite!.targets.filter(row => row.target.targetRef === ref);
      return selectedRows.length === 1 ? rows.filter(row => sameSubject(row, selectedRows[0]!)) : [];
    });
    if (selected.length === 0 || selected.some(rows => rows.length !== 1)) return null;
    const selectedSet = new Set(selected.map(rows => rows[0]!.target.targetRef));
    if (selectedSet.size !== selected.length) return null;
    return deepFreeze({ historicalWorksite: history, snapshotTargetRefs: rows.map(row => row.target.targetRef),
      selectedTargetRefs: rows.filter(row => selectedSet.has(row.target.targetRef)).map(row => row.target.targetRef) });
  } catch { return null; }
}
function revisionPreparationAtBasis(basis: SemanticStageNativeBasis, input: SemanticRevisionEnvelope, readPhysical: boolean, cut?: ValidatedRuntimeEventPrefix) {
  const owner=authenticateSemanticStageBasis(basis);
  if(owner===null)return null;
  const parent = admitted(basis, input.revisionBasis.request.parent);
  if (parent === null) return null;
  const prior = isSemanticRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
  if (!isSemanticStageEnvelope(prior) || prior.worksite === null || input.current.worksite === null) return null;
  const origins = revisionWorksiteProjection(basis, input.revisionBasis.request.parent, prior.worksite, input.current.worksite,
    readPhysical, input.revisionBasis.request.causes, cut);
  const historicalContext = projectRevisionHistoricalContext(basis, input);
  if (origins === null || historicalContext === null) return null;
  const coordinates = projectRevisionDesignCoordinates(basis, input);
  if (coordinates === null) return null;
  const { historicalWorksite: history, snapshotTargetRefs, selectedTargetRefs } = coordinates;
  const configuration = deriveSemanticWorksiteConstructionConfiguration(input.current, undefined, { historicalWorksite: history,
    selectedTargetRefs, retainedBindings: input.revisionBasis.retainedBindings,
    feedback: { selection: input.revisionBasis.selection, causes: input.revisionBasis.request.causes,
      historicalContext } as unknown as JsonValue });
  if (configuration === null) return null;
  // Every pending dependency uses this invocation's identical prefix and input.
  // Stay lazy so earlier refusals and non-pending histories do no extra work.
  let bindingOrigin: WorksiteRevisionObservationOrigin | null | undefined;
  const pendingBindingOrigin = () => {
    if (bindingOrigin === undefined) bindingOrigin = projectWorksiteRevisionBindingOrigin(cut ?? owner.prefix, input);
    return bindingOrigin;
  };
  const dependencyObservations = snapshotTargetRefs.filter(ref => !selectedTargetRefs.includes(ref)).map(designTargetRef => {
    const historical = history.targets.find(row => row.target.targetRef === designTargetRef)!;
    const ordinal = input.current.worksite!.targets.findIndex(row => row.target.subject.relativePath === historical.target.subject.relativePath);
    const row = input.current.worksite!.targets[ordinal];
    if (row === undefined || row.target.predecessorObservation.state !== "file" || origins[ordinal] === undefined) throw new TypeError("revision dependency is not an authenticated current regular file");
    const proof=origins[ordinal]!,origin=proof.kind==="pending_binding_correspondence"?pendingBindingOrigin():proof;
    if(origin===null)throw new TypeError("binding correspondence has no earlier admitted projection");
    return { designTargetRef, subject: row.target.subject, observation: row.target.predecessorObservation, origin };
  });
  return constructWorksiteRevisionCommandPreparationInput({ ...configuration, revisionBasisRef: input.revisionBasis.basisRef,
    revisionBasisDigest: input.revisionBasis.basisDigest, snapshotTargetRefs, dependencyObservations });
}
export function projectRevisionWorksitePreparation(basis: SemanticStageNativeBasis, input: unknown) {
  try { return semanticRevisionInputMatchesBasis(basis, input) ? revisionPreparationAtBasis(basis, input, true) : null; }
  catch { return null; }
}
export function projectRevisionEvidenceInput(basis: SemanticStageNativeBasis, input: unknown): Readonly<SemanticRevisionEnvelope | SemanticJobRevisionEnvelope> | null {
  try {
    const job = (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined;
    const owner = job ? authenticateSemanticJobBasis(basis) : authenticateSemanticStageBasis(basis);
    if (owner === null || owner.call.implementationRef !== ids.evidenceInputImplementationRef ||
      !isWorksiteRevisionCommandExecutionObservation(input) || hash(input) !== owner.inputDigest || hash(semanticInputValueAtBasis(basis)) !== hash(input)) return null;
    const parts = revisionEvidenceComponentsAtBasis(basis, input);
    if (parts === null) return null;
    const { original, construction, execution } = parts;
    const root = input.provenance.helperPlan.sandboxRoot;
    if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return null;
    const artifacts = input.snapshotMembers.map(member => {
      const path = resolve(root, member.relativePath), rel = relative(root, path);
      if (!rel || rel.startsWith("..") || isAbsolute(rel) || realpathSync(path) !== path) throw new TypeError("snapshot crossed native locus");
      const stat = lstatSync(path), bytes = readFileSync(path);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || bytes.length !== member.byteLength || sha256Bytes(bytes) !== member.digest) throw new TypeError("snapshot differs from admitted C2");
      const source = input.task.snapshotSources[member.ordinal];
      const row = original.current.worksite!.targets.find(t => t.target.subject.relativePath === source?.subject.relativePath);
      const read = isSemanticJobRevisionEnvelope(original) ? original.current.context?.entries.find(entry =>
        entry.relativePath === source?.subject.relativePath && entry.state === "file") : undefined;
      const expectedBytes = row?.base64 ?? (read?.state === "file" ? read.bytes : null);
      if (source === undefined || expectedBytes === null || source.designTargetRef !== member.designTargetRef ||
        hash(source.source) !== hash(member.source) || (source.source.kind === "retained_dependency" && expectedBytes !== bytes.toString("base64"))) throw new TypeError("snapshot dependency or source tag changed");
      return { subjectRef: source.subject.subjectRef, observationRef: member.sourceObservationRef, base64: bytes.toString("base64"), role: row?.role === "verifier" ? "verifier_artifact" as const : "realization" as const };
    });
    const result = { ...original, current: { ...original.current, evidence: { kind: "semantic_worksite_evidence" as const,
      constructionResultRef: construction.previous.result.resultRef, constructionResultDigest: construction.previous.result.resultDigest,
      executionResultRef: execution.previous.result.resultRef, executionResultDigest: execution.previous.result.resultDigest,
      constructionResult: input.task.sourceConstructionResult as unknown as Readonly<Record<string, JsonValue>>,
      executionObservation: input as unknown as Readonly<Record<string, JsonValue>>, artifacts } } };
    return isSemanticRevisionEnvelope(result) || isSemanticJobRevisionEnvelope(result) ? deepFreeze(result) : null;
  } catch { return null; }
}
/** Shared exact admitted producer join; role/input authentication remains in
 * each caller, and historical reconstruction never dispatches or reads files. */
function revisionEvidenceComponentsAtBasis(basis: SemanticStageNativeBasis,
  input: import("../product/worksite_revision.js").WorksiteRevisionCommandExecutionObservation) {
  try {
    const owner = (basis.lifecyclePublication ?? basis.publication).semanticJobLifecycle !== undefined
      ? authenticateSemanticJobBasis(basis) : authenticateSemanticStageBasis(basis);
    if (owner === null) return null;
    const execution = selectedSemanticPredecessor(basis, WORKSITE_REVISION_IDS.implementationRef, input);
    const construction = selectedSemanticPredecessor(basis, WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef, input.task.sourceConstructionResult);
    if (execution === null || construction === null || !isWorksiteConstructionResult(construction.previous.result.value)) return null;
    const candidates = owner.events.filter(e => e.kind === "c_call_result_admitted").map(event => {
      const value = (event.payload as { value?: unknown }).value;
      if (!isWorksitePreparationInput(value) || value.kind !== "worksite_revision_command_preparation_input") return null;
      const bridge = selectedSemanticPredecessor(basis, ids.bridgeImplementationRef, value);
      if (bridge === null || bridge.event.eventId !== event.eventId ||
        bridge.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;
      const original = bridge.execution.rawInputValue;
      if (!isSemanticRevisionEnvelope(original) && !isSemanticJobRevisionEnvelope(original)) return null;
      const subject = isSemanticJobRevisionEnvelope(original) ? jobRevisionSubjectAtBasis(basis, original, false, bridge) : null;
      const expected = isSemanticJobRevisionEnvelope(original) ? subject === null ? null : jobRevisionPreparationFromSubject(subject, original)
        : revisionPreparationAtBasis(basis, original, false,
          selectValidatedRuntimeEventPrefix(Object.freeze(owner.events.filter(e => e.admissionOrdinal < bridge.event.admissionOrdinal))));
      if (expected === null || hash(expected) !== hash(value)) return null;
      return { original, expected, subject };
    }).filter((v): v is NonNullable<typeof v> => v !== null);
    if (candidates.length !== 1) return null;
    const { original, expected, subject } = candidates[0]!;
    const prepared = prepareWorksiteCommandTask({ kind: "worksite_revision_command_preparation_bound_input", schemaVersion: "5.0.0", entry: expected, source: input.task.sourceConstructionResult });
    if (hash(prepared) !== hash(input.task)) return null;
    if (original.current.worksite === null) return null;
    if (!isSemanticJobRevisionEnvelope(original)) {
      const parent = admitted(basis, original.revisionBasis.request.parent);
      const prior = parent === null ? null : isSemanticRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
      if (!isSemanticStageEnvelope(prior) || prior.worksite === null) return null;
    }
    return { original, expected, subject, construction, execution };
  } catch { return null; }
}

export function projectRevisionSelectionSubject(basis: SemanticStageNativeBasis, input: unknown, readPhysical = false) {
  const owner = authenticateSemanticStageBasis(basis);
  if (owner === null || owner.call.implementationRef !== ids.selectionImplementationRef || !isSemanticRevisionSelectionInput(input) ||
    hash(semanticInputValueAtBasis(basis)) !== hash(input) || basis.graphFunction.declarations["abg.semantic_revision_selection"] !== owner.lifecycle.declarationRef) return null;
  const parent = admitted(basis, input.parent), causes = input.causes.map(c => admitted(basis, c));
  if (parent === null || parent.result.resultClass !== "success" || parent.judgment.judgment !== "advance" || causes.some(c => c === null)) return null;
  const parentExecution = rehydrateExecutionBasisAtPrefix(owner.prefix, parent.cCall.basisId);
  if (parentExecution === null) return null;
  for (const cause of causes) {
    if (cause === null || cause.cCall.cCallRef === parent.cCall.cCallRef) return null;
    const execution = rehydrateExecutionBasisAtPrefix(owner.prefix, cause.cCall.basisId);
    if (execution === null) return null;
    const invocation = rehydrateInvocationAdmissionAtPrefix(owner.prefix, execution.invocationAdmissionRef);
    if (execution.invocationAdmissionRef !== parentExecution.invocationAdmissionRef && invocation?.sourceResultBasis?.sourceResultRef !== parent.result.resultRef) return null;
    if (!(cause.result.resultClass === "failure" || cause.judgment.judgment !== "advance" || isSemanticRevisionCommandCause(cause.result.value) ||
      (isSemanticStageEnvelope(cause.result.value) && cause.result.value.assets.some(a => a.assessment !== null && a.assessment.disposition !== "satisfied")))) return null;
  }
  const envelope = isSemanticRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
  if (!isSemanticStageEnvelope(envelope) || hash(envelope.lifecycle) !== hash(owner.lifecycle) || hash(envelope.sourceHandoff.declaration) !== hash(owner.source)) return null;
  const environment=projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix,{ref:owner.execution.workspaceBindingId,digest:owner.execution.workspaceBindingDigest});
  if(environment.kind!=="exact_prefix_workspace_environment"||worksiteRevisionEntryBindingDisposition(owner.prefix,basis.graphFunction,input,environment.workspaceBinding)==="basis_fork_detected")return null;
  const origins = revisionWorksiteProjection(basis, input.parent, envelope.worksite, input.currentWorksite, readPhysical, input.causes);
  if (origins === null) return null;
  return { owner, envelope, parent, currentWorksite: input.currentWorksite, origins,
    causes: causes.filter((c): c is NonNullable<typeof c> => c !== null) };
}
export function semanticRevisionSelectionMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean {
  const subject = projectRevisionSelectionSubject(basis, input);
  if (subject === null || !isSemanticRevisionSelectionInput(input) || !isSemanticRevisionSelection(output) ||
    hash(input.parent) !== hash(output.parent) || hash(input.causes) !== hash(output.causes)) return false;
  const bindings = [...subject.envelope.sourceHandoff.declaration.fulfillmentBindings, ...subject.envelope.assets.flatMap(a => a.discoveredBindings), ...(isSemanticRevisionEnvelope(subject.parent.result.value) ? subject.parent.result.value.revisionBasis.retainedBindings : [])];
  return output.selectedObligationRefs.every(r => bindings.some(b => b.obligationRef === r)) &&
    output.selectedTargetRefs.every(r => subject.envelope.worksite?.targets.some(t => t.target.targetRef === r)) &&
    (output.selectedStageRef === null || subject.owner.lifecycle.stages.some(s => s.declarationRef === output.selectedStageRef));
}
