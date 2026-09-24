import { NATIVE_SEMANTIC_IMPLEMENTATION_REFS } from "../gtl/semantic_stage_identity.js";
import { isRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { isNativeWorkspaceWorkTask, isNativeWorkspaceWorkObservation, type NativeWorkspaceWorkObservation } from "../product/native_workspace_work.js";
import { isNativeWorksiteCommandExecutionObservation } from "../product/worksite_command_execution.js";
import { constructNativeSemanticTask, constructNativeSemanticConstructionTask, constructNativeSemanticExecutionTask,
  deriveNativeSemanticAsset, deriveNativeSemanticAssessment, nativeSemanticContextMatches, nativeSemanticEvidenceArtifacts,
  nativeSemanticCommandExecutionLimits } from "../product/semantic_job.js";
import { projectNativeWorkspaceWorkSourceAtPrefix, worksiteCommandSourcesInvalidatedAfter } from "./native_worksite_execution.js";
import type { ModulePublication } from "../gtl/contracts.js";
import { SEMANTIC_STAGE_IDS as ids, SEMANTIC_IMPLEMENTATION_REFS } from "../gtl/semantic_stage_identity.js";
import { validSemanticJobProgramOwners } from "../gtl/semantic_job.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { isSemanticJobInput, isSemanticJobEnvelope, constructSemanticJobEnvelope,
  deriveSemanticJobAsset, deriveSemanticJobAssessment, deriveSemanticJobPreparation, deriveSemanticJobReadDependencies, semanticJobDesignMatches,
  semanticJobPathWithin, type SemanticJobEnvelope, type SemanticJobContractIssue } from "../product/semantic_job.js";
import { constructWorksiteSubject, constructWorksiteTerritory, constructWorksiteObservation,
  constructWorksiteFileParentsRequest, isWorksiteFileParentsRequest, isWorksiteFileParentsSuccess,
  isWorksiteContextObservation, type WorksiteFileParentsRequest, type WorksiteContextObservation } from "../product/worksite_effect.js";
import { observeWorksiteContext, observeWorksiteFileParents, observeWorksiteSubject } from "../product/worksite_operations.js";
import { constructWorksiteConstructionTask, WORKSITE_CONSTRUCTION_IDS, isWorksiteConstructionResult } from "../product/worksite_construction.js";
import { isWorksiteCommandExecutionObservation, constructWorksiteCommandConfiguration, isWorksiteReadDependencyBasis,
  type WorksiteReadDependencyBasis, type WorksiteCommandExecutionLimits, WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { isWorksitePreparationInput, prepareWorksiteCommandTask } from "../product/worksite_preparation.js";
import { WORKSITE_FILE_PARENTS_IMPLEMENTATION } from "../implementation/worksite_file_replace.js";
import type { SemanticStageNativeBasis } from "./semantic_stage.js";
import { projectSemanticPredecessorAtPrefix } from "./semantic_stage.js";
import { authenticateNativeInstructionAssemblyBasis, rehydrateExecutionBasisAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { rehydrateInvocationAdmissionAtPrefix } from "./invocation_admission.js";
import { runtimeEventsFromValidatedPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { sha256Canonical, sha256Bytes } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { readFileSync, lstatSync, realpathSync, readdirSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import type { SemanticWorksiteBasis } from "../product/semantic_stage.js";
import { projectWorksiteRevisionNativeResult } from "./worksite_revision.js";
import { SEMANTIC_REVISION_IDS as revisionIds } from "../gtl/semantic_revision_identity.js";
import { isSemanticRevisionRequest, isSemanticRevisionSelectionInput, isSemanticJobRevisionEnvelope, isNativeSemanticRevisionIntake } from "../product/semantic_revision.js";

const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const equal = (a: unknown, b: unknown) => hash(a) === hash(b);
const record = (x: unknown): x is Record<string, JsonValue> => x !== null && typeof x === "object" && !Array.isArray(x);
/** Existing semantic-job ancestry owner; an internal projection, not Public authority. */
export function semanticJobRootAtPrefix(prefix: ValidatedRuntimeEventPrefix, execution: ExecutionBasis): ExecutionBasis | null {
  let root: ExecutionBasis | null = execution;
  const seen = new Set<string>();
  while (root !== null && root.parentExecutionBasisRef !== null) {
    if (seen.has(root.basisRef)) return null;
    seen.add(root.basisRef);
    const next = rehydrateExecutionBasisAtPrefix(prefix, root.parentExecutionBasisRef);
    if (next === null || !sameJobInvocation(execution, next)) return null;
    root = next;
  }
  return root;
}
function sameJobInvocation(a: ExecutionBasis, b: ExecutionBasis): boolean {
  return a.invocationAdmissionRef === b.invocationAdmissionRef && a.invocationRef === b.invocationRef &&
    a.invocationDigest === b.invocationDigest && a.programRef === b.programRef && a.programDigest === b.programDigest &&
    a.rootImplementationSetRef === b.rootImplementationSetRef && a.rootImplementationSetDigest === b.rootImplementationSetDigest &&
    a.workspaceBindingId === b.workspaceBindingId && a.workspaceBindingDigest === b.workspaceBindingDigest;
}
export function authenticateSemanticJobBasis(basis: SemanticStageNativeBasis) {
  try {
    const native = authenticateNativeInstructionAssemblyBasis(basis);
    const publication = basis.lifecyclePublication ?? basis.publication;
    const lifecycle = publication.semanticJobLifecycle;
    if (native === null || lifecycle === undefined || !equal(basis.sourcePublication ?? publication, publication) ||
      !validSemanticJobProgramOwners(basis.publication, native.program, publication) ||
      !SEMANTIC_IMPLEMENTATION_REFS.includes(native.call.implementationRef ?? "")) return null;
    const invocationRoot = semanticJobRootAtPrefix(native.prefix, native.execution);
    if (invocationRoot === null) return null;
    let root = invocationRoot;
    const acquiring = native.call.implementationRef === revisionIds.nativeIntakeImplementationRef && isNativeSemanticRevisionIntake(root.rawInputValue);
    if (!isSemanticJobInput(root.rawInputValue) && !acquiring) {
      // Intake's admitted child input carries the acquired original parent.
      // The revision owner authenticates that child against the intake Result.
      const request = isNativeSemanticRevisionIntake(root.rawInputValue) ? native.execution.rawInputValue : root.rawInputValue;
      if (!isSemanticRevisionRequest(request) && !isSemanticRevisionSelectionInput(request)) return null;
      const parent = projectWorksiteRevisionNativeResult(native.prefix, request.parent);
      const envelope = parent === null ? null : isSemanticJobRevisionEnvelope(parent.result.value) ? parent.result.value.current : parent.result.value;
      if (parent?.result.resultClass !== "success" || parent.judgment.judgment !== "advance" || !isSemanticJobEnvelope(envelope)) return null;
      const initial = rehydrateExecutionBasisAtPrefix(native.prefix, envelope.basis.rootExecutionBasisRef);
      if (initial === null || initial.parentExecutionBasisRef !== null || initial.rawInputAdmissionRef !== envelope.basis.rootInputRef ||
        initial.rawInputDigest !== envelope.basis.rootInputDigest || !equal(initial.rawInputValue, envelope.job) ||
        initial.invocationAdmissionRef !== envelope.basis.invocationAdmissionRef) return null;
      root = initial;
    }
    if ((!acquiring && (!isSemanticJobInput(root.rawInputValue) || root.rawInputValue.lifecycleRef !== lifecycle.declarationRef)) ||
      hash(root.rawInputValue) !== root.rawInputDigest) return null;
    const environment = native.environment;
    const invocation = rehydrateInvocationAdmissionAtPrefix(native.prefix, invocationRoot.invocationAdmissionRef);
    if (environment.kind !== "exact_prefix_workspace_environment" || invocation?.capabilityGrants.length !== 1 ||
      environment.productInstalls.filter(install => install.productId === publication.owningProductId &&
        install.artifactDigest === publication.artifactDigest && install.productContentDigest === publication.productContentDigest &&
        install.manifestDigest === publication.productManifestDigest && install.contributionManifest.publicationBindings.filter(p =>
          p.moduleRef === publication.moduleRef && p.publicationDigest === modulePublicationSemanticDigest(publication)).length === 1).length !== 1) return null;
    const nativeAuthor = [ids.nativeAuthorTaskImplementationRef, ids.nativeAuthorFoldImplementationRef].some(r => r === native.call.implementationRef);
    const nativeAssessor = [ids.nativeAssessorTaskImplementationRef, ids.nativeAssessorFoldImplementationRef].some(r => r === native.call.implementationRef);
    const nativeStage = nativeAuthor || nativeAssessor;
    const role = nativeAuthor ? "author" as const : nativeAssessor ? "assessor" as const : native.call.implementationRef === ids.authorImplementationRef || native.call.implementationRef === revisionIds.authorImplementationRef ? "author" as const :
      native.call.implementationRef === ids.assessorImplementationRef || native.call.implementationRef === revisionIds.assessorImplementationRef ? "assessor" as const : null;
    const preparing = native.call.implementationRef === ids.nativeAuthorTaskImplementationRef || native.call.implementationRef === ids.nativeAssessorTaskImplementationRef;
    const stages = lifecycle.stages.filter(s => (nativeStage
      ? basis.graphFunction.declarations["abg.semantic_native_stage"] === s.declarationRef
      : s.graphFunctionRef === native.call.graphFunctionRef || basis.graphFunction.declarations["abg.semantic_revision_stage"] === s.declarationRef) &&
      (role === "author" ? s.authorLocusRef : s.assessorLocusRef) + (preparing ? "/prepare" : "") === native.call.programLocusRef);
    if (role !== null && (stages.length !== 1 || native.call.regime !== (nativeStage ? "F_D" : "F_P"))) return null;
    return { ...native, publication, lifecycle, root, invocationRoot, environment, grant: invocation.capabilityGrants[0]!, role, stage: stages[0] };
  } catch { return null; }
}
function predecessor(basis: SemanticStageNativeBasis, owner: NonNullable<ReturnType<typeof authenticateSemanticJobBasis>>, value: unknown, implementationRef?: string) {
  const matches = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && equal(e.payload.value, value)).map(event => {
    const previous = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, event.aggregateId, basis.declarationGraphFunctions);
    if (previous === null || previous.result.resultClass !== "success" || previous.judgment.judgment !== "advance" ||
      (implementationRef !== undefined && previous.cCall.implementationRef !== implementationRef)) return null;
    const execution = rehydrateExecutionBasisAtPrefix(owner.prefix, previous.cCall.basisId);
    return execution !== null && sameJobInvocation(owner.execution, execution) ? { previous, execution, event } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  return matches.length === 1 ? matches[0]! : null;
}
export function semanticJobInputMatchesBasis(basis: SemanticStageNativeBasis, input: unknown): input is SemanticJobEnvelope {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner === null || !isSemanticJobEnvelope(input) ||
      !(equal(owner.inputValue, input) && hash(input) === owner.inputDigest ||
        NATIVE_SEMANTIC_IMPLEMENTATION_REFS.some(r => r === owner.call.implementationRef) && isRetainedGraphInput(owner.inputValue) && equal(owner.inputValue.entry, input)) ||
      !equal(input.job, owner.root.rawInputValue) || !equal(input.declaration, owner.lifecycle) ||
      input.basis.rootExecutionBasisRef !== owner.root.basisRef || input.basis.rootInputRef !== owner.root.rawInputAdmissionRef ||
      input.basis.invocationAdmissionRef !== owner.root.invocationAdmissionRef || predecessor(basis, owner, input) === null) return false;
    const intake = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, input.basis.intakeCCallRef, basis.declarationGraphFunctions);
    if (intake === null || intake.cCall.implementationRef !== ids.jobIntakeImplementationRef || intake.result.resultClass !== "success" ||
      intake.judgment.judgment !== "advance" || !isSemanticJobEnvelope(intake.result.value) || !equal(intake.result.value.basis, input.basis)) return false;
    for (const asset of input.assets) {
      const authorSource = asset.source.nativeWork;
      const author = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, authorSource?.adapterCCallRef ?? asset.source.cCallRef, basis.declarationGraphFunctions);
      if (author === null || author.cCall.implementationRef !== (authorSource === undefined ? ids.authorImplementationRef : ids.nativeAuthorFoldImplementationRef) || author.result.resultClass !== "success" ||
        author.judgment.judgment !== "advance" || !isSemanticJobEnvelope(author.result.value) ||
        !equal(author.result.value.basis, input.basis) || !equal(author.result.value.assets.find(a => a.assetRef === asset.assetRef), { ...asset, assessment: null })) return false;
      if (asset.assessment !== null) {
        const assessmentSource = asset.assessment.source.nativeWork;
        const assessed = projectSemanticPredecessorAtPrefix(owner.prefix, owner.events, basis.publication, assessmentSource?.adapterCCallRef ?? asset.assessment.source.cCallRef, basis.declarationGraphFunctions);
        if (assessed === null || assessed.cCall.implementationRef !== (assessmentSource === undefined ? ids.assessorImplementationRef : ids.nativeAssessorFoldImplementationRef) || assessed.result.resultClass !== "success" ||
          assessed.judgment.judgment !== "advance" || !isSemanticJobEnvelope(assessed.result.value) ||
          !equal(assessed.result.value.assets.find(a => a.assetRef === asset.assetRef), asset)) return false;
      }
    }
    return true;
  } catch { return false; }
}
export function projectSemanticJobIntake(basis: SemanticStageNativeBasis, input: unknown) {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner === null || owner.call.implementationRef !== ids.jobIntakeImplementationRef ||
      owner.call.graphFunctionRef !== owner.lifecycle.intakeGraphFunctionRef || !equal(input, owner.inputValue) ||
      !equal(input, owner.root.rawInputValue) || !isSemanticJobInput(input)) return null;
    return constructSemanticJobEnvelope(input, owner.lifecycle, { invocationAdmissionRef: owner.root.invocationAdmissionRef,
      rootExecutionBasisRef: owner.root.basisRef, rootInputRef: owner.root.rawInputAdmissionRef, rootInputDigest: owner.root.rawInputDigest,
      intakeCCallRef: owner.call.cCallRef, intakeCCallDigest: owner.call.cCallDigest, intakeExecutionBasisRef: owner.execution.basisRef });
  } catch { return null; }
}
function operating(owner: NonNullable<ReturnType<typeof authenticateSemanticJobBasis>>) {
  return { workspaceAuthorityBasis: owner.environment.workspaceAuthorityBasis, workspaceBinding: owner.environment.workspaceBinding,
    capabilityGrant: owner.grant, protectedInstallRoots: owner.environment.productInstalls.map(i => i.installedRoot) };
}
export function semanticJobContextMatches(basis: SemanticStageNativeBasis, input: SemanticJobEnvelope, context: WorksiteContextObservation): boolean {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null || !isWorksiteContextObservation(context)) return false;
  const current = operating(owner);
  return context.workspaceAuthorityBasisRef === current.workspaceAuthorityBasis.authorityBasisId &&
    context.workspaceAuthorityBasisDigest === current.workspaceAuthorityBasis.authorityBasisDigest &&
    context.workspaceBindingIdentity === current.workspaceBinding.bindingId && context.workspaceBindingDigest === current.workspaceBinding.bindingDigest &&
    equal(context.readRoots, input.job.worksiteScope.readRoots) && context.maxFiles === input.declaration.bounds.maxContextFiles && context.maxBytes === input.declaration.bounds.maxContextBytes;
}
export function semanticJobContextCurrent(basis: SemanticStageNativeBasis, input: SemanticJobEnvelope): boolean {
  try {
    const owner = authenticateSemanticJobBasis(basis), context = input.context;
    if (owner === null || context === null || !semanticJobContextMatches(basis, input, context)) return false;
    const root = owner.environment.workspaceAuthorityBasis.canonicalRoot;
    return context.entries.every(entry => {
      const path = resolve(root, entry.relativePath);
      try {
        const stat = lstatSync(path);
        if (entry.state === "absent" || stat.isSymbolicLink() || realpathSync(path) !== path || `${stat.dev}:${stat.ino}` !== entry.fileIdentity) return false;
        if (entry.state === "directory") return stat.isDirectory() && equal(readdirSync(path).sort(), entry.members);
        const bytes = readFileSync(path);
        return stat.isFile() && stat.nlink === 1 && bytes.length === entry.byteLength && sha256Bytes(bytes) === entry.digest && bytes.toString("base64") === entry.bytes;
      } catch (error) { return entry.state === "absent" && (error as NodeJS.ErrnoException).code === "ENOENT"; }
    });
  } catch { return false; }
}
export async function projectSemanticJobContext(basis: SemanticStageNativeBasis, input: unknown) {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null || owner.call.implementationRef !== ids.jobContextImplementationRef || !semanticJobInputMatchesBasis(basis, input)) return null;
  const context = await observeWorksiteContext({ ...operating(owner), readRoots: input.job.worksiteScope.readRoots,
    maxFiles: input.declaration.bounds.maxContextFiles, maxBytes: input.declaration.bounds.maxContextBytes });
  return isWorksiteContextObservation(context) && semanticJobContextMatches(basis, input, context) ? deepFreeze({ ...input, context }) : null;
}
function planInput(basis: SemanticStageNativeBasis, input: SemanticJobEnvelope) {
  const owner = authenticateSemanticJobBasis(basis), asset = input.assets.at(-1), design = asset?.candidate.design;
  if (owner === null || asset?.assessment?.disposition !== "satisfied" || design === null || design === undefined ||
    design.dependencyDisposition !== "sufficient" || !semanticJobDesignMatches(input, design)) return null;
  const assessed = predecessor(basis, owner, input, ids.assessorImplementationRef);
  if (assessed === null) return null;
  const current = operating(owner);
  const targets = design.targets.map(target => {
    const root = input.job.worksiteScope.writeRoots.filter(r => semanticJobPathWithin(target.relativePath, [r])).sort((a, b) => b.length - a.length)[0]!;
    const territory = constructWorksiteTerritory({ ...current, relativeRoot: root, territoryUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, root)).href });
    if (territory.kind !== "worksite_territory") throw new TypeError("unavailable Design territory");
    return { relativePath: target.relativePath, territory };
  });
  // Reuse C2's complete pure configuration owner before the first parent
  // effect. Shape-valid Design is not yet an executable command contract.
  const protectedSubjects = targets.map(target => {
    const subject = constructWorksiteSubject({ ...current, relativePath: target.relativePath,
      subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, target.relativePath)).href });
    if (subject.kind !== "worksite_subject") throw new TypeError("unavailable Design subject");
    return subject;
  });
  constructWorksiteCommandConfiguration({ workspaceAuthorityBasis: current.workspaceAuthorityBasis,
    workspaceBinding: current.workspaceBinding, commands: design.commands, outcomePredicates: design.outcomePredicates,
    protectedSubjects: [...protectedSubjects, ...(deriveSemanticJobReadDependencies(input, current)?.members.map(row => row.subject) ?? [])],
    allowedWriteTerritories: input.job.worksiteScope.evidenceWriteRoots.map(relativePath => ({ pathKind: "subtree", relativePath })) });
  // The cursor carries a value digest and may name a workflow result. The
  // parent-effect proof names the actual assessor's admitted result coordinate.
  return { ...current, sourceEnvelopeRef: assessed.previous.result.resultRef, sourceEnvelopeDigest: assessed.previous.result.resultDigest, sourceDesignAssetRef: asset.assetRef,
    sourceDesignAssetDigest: asset.assetDigest, jobRef: input.basis.jobRef, jobDigest: input.basis.jobDigest, targets, parentWriteRoots: input.job.worksiteScope.parentWriteRoots };
}
export async function projectSemanticJobPlan(basis: SemanticStageNativeBasis, input: unknown) {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner?.call.implementationRef !== ids.jobPlanImplementationRef || !semanticJobInputMatchesBasis(basis, input)) return null;
    const value = planInput(basis, input);
    if (value === null) return null;
    const request = await observeWorksiteFileParents(value);
    return isWorksiteFileParentsRequest(request) ? request : null;
  } catch { return null; }
}
/** Existing admitted outcome owner authenticates both ends; no raw-log acceptance. */
export function validateWorksiteFileParentsPlanAtPrefix(prefix: ValidatedRuntimeEventPrefix, request: WorksiteFileParentsRequest,
  publication: Readonly<ModulePublication>): boolean {
  try {
    if (!isWorksiteFileParentsRequest(request) || publication.semanticJobLifecycle === undefined) return false;
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const rows = events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && equal(e.payload.value, request)).map(event =>
      projectSemanticPredecessorAtPrefix(prefix, events, publication, event.aggregateId)).filter(p => p !== null &&
        p.cCall.implementationRef === ids.jobPlanImplementationRef && p.result.resultClass === "success" && p.judgment.judgment === "advance");
    if (rows.length !== 1) return false;
    const designRows = events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
      e.payload.resultRef === request.sourceEnvelopeRef && e.payload.resultDigest === request.sourceEnvelopeDigest);
    if (designRows.length !== 1) return false;
    const source = projectSemanticPredecessorAtPrefix(prefix, events, publication, designRows[0]!.aggregateId);
    if (source === null || source.cCall.implementationRef !== ids.assessorImplementationRef || source.result.resultClass !== "success" ||
      source.judgment.judgment !== "advance" || !isSemanticJobEnvelope(source.result.value)) return false;
    const envelope = source.result.value, asset = envelope.assets.at(-1), design = asset?.candidate.design;
    const planBasis = rehydrateExecutionBasisAtPrefix(prefix, rows[0]!.cCall.basisId), sourceBasis = rehydrateExecutionBasisAtPrefix(prefix, source.cCall.basisId);
    return planBasis !== null && sourceBasis !== null && sameJobInvocation(planBasis, sourceBasis) && equal(planBasis.rawInputValue, envelope) &&
      equal(envelope.declaration, publication.semanticJobLifecycle) && envelope.basis.jobRef === request.jobRef && envelope.basis.jobDigest === request.jobDigest &&
      asset?.assetRef === request.sourceDesignAssetRef && asset.assetDigest === request.sourceDesignAssetDigest && asset.assessment?.disposition === "satisfied" &&
      design !== null && design !== undefined && design.dependencyDisposition === "sufficient" && semanticJobDesignMatches(envelope, design) &&
      equal(design.targets.map(t => t.relativePath), request.targets.map(t => t.relativePath)) &&
      request.targets.every(t => envelope.job.worksiteScope.writeRoots.includes(t.territory.relativeRoot)) &&
      equal(envelope.job.worksiteScope.parentWriteRoots, request.parentWriteRoots);
  } catch { return false; }
}

function originalForParents(basis: SemanticStageNativeBasis, input: unknown) {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null || !isWorksiteFileParentsSuccess(input) || !equal(owner.inputValue, input) ||
    !validateWorksiteFileParentsPlanAtPrefix(owner.prefix, input.request, owner.publication) ||
    predecessor(basis, owner, input, WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationRef) === null) return null;
  const source = owner.events.find(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultRef === input.request.sourceEnvelopeRef);
  const original = record(source?.payload) ? source.payload.value : null;
  return isSemanticJobEnvelope(original) ? { owner, original, request: input.request } : null;
}
async function observeDesignWorksite(basis: SemanticStageNativeBasis, input: unknown): Promise<SemanticWorksiteBasis | null> {
  const source = originalForParents(basis, input);
  if (source === null) return null;
  const { owner, original, request } = source, current = operating(owner), design = original.assets.at(-1)!.candidate.design!;
  const rows: SemanticWorksiteBasis["targets"][number][] = [];
  for (const target of request.targets) {
    const subject = constructWorksiteSubject({ ...current, relativePath: target.relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, target.relativePath)).href });
    if (subject.kind !== "worksite_subject") return null;
    const observation = await observeWorksiteSubject(current.workspaceAuthorityBasis, current.workspaceBinding, subject);
    if (observation.kind !== "worksite_observation") return null;
    const bytes = observation.state === "absent" ? Buffer.alloc(0) : readFileSync(resolve(current.workspaceAuthorityBasis.canonicalRoot, target.relativePath));
    if (observation.state === "file" && (observation.fileDigest !== sha256Bytes(bytes) || observation.byteLength !== bytes.length)) return null;
    const task = constructWorksiteConstructionTask({ ...current, prompt: "Native assessed target identity", targets: [{ subject, territory: target.territory, predecessorObservation: observation }] });
    rows.push({ target: task.targets[0]!, base64: bytes.toString("base64"), role: design.targets.find(t => t.relativePath === target.relativePath)!.role });
  }
  // Read-only members are exact context observations, never replacement targets.
  for (const dependency of deriveSemanticJobReadDependencies(original, current)?.members ?? []) {
    const observed = await observeWorksiteSubject(current.workspaceAuthorityBasis, current.workspaceBinding, dependency.subject);
    if (!equal(observed, dependency.observation)) return null;
  }
  return { workspaceAuthorityBasis: current.workspaceAuthorityBasis, workspaceBinding: current.workspaceBinding, capabilityGrant: current.capabilityGrant,
    targets: rows, commands: design.commands, outcomePredicates: design.outcomePredicates,
    allowedWriteTerritories: original.job.worksiteScope.evidenceWriteRoots.map(relativePath => ({ pathKind: "subtree", relativePath })) };
}
export async function projectSemanticJobBridge(basis: SemanticStageNativeBasis, input: unknown) {
  try {
    const source = originalForParents(basis, input);
    if (source?.owner.call.implementationRef !== ids.jobBridgeImplementationRef) return null;
    const worksite = await observeDesignWorksite(basis, input);
    return worksite === null ? null : deriveSemanticJobPreparation(source.original, worksite);
  } catch { return null; }
}
/** Saved C1 observations plus admitted context rederive the exact pre-effect request. */
export function semanticJobSavedWorksite(original: SemanticJobEnvelope, value: unknown): SemanticWorksiteBasis | null {
  if (!isWorksitePreparationInput(value) || value.kind !== "worksite_command_preparation_input") return null;
  const task = value.constructionTask, design = original.assets.at(-1)?.candidate.design;
  if (design === null || design === undefined) return null;
  try {
    if (!equal(value.readDependencyBasis ?? null, deriveSemanticJobReadDependencies(original, task) ?? null)) return null;
  } catch { return null; }
  const rows = task.targets.map(target => {
    const selected = design.targets.find(t => t.relativePath === target.subject.relativePath);
    const entry = original.context?.entries.find(e => e.relativePath === target.subject.relativePath);
    const base64 = target.predecessorObservation.state === "absent" ? "" : entry?.state === "file" ? entry.bytes : null;
    return selected === undefined || base64 === null || (target.predecessorObservation.state === "file" &&
      (sha256Bytes(Buffer.from(base64, "base64")) !== target.predecessorObservation.fileDigest)) ? null : { target, base64, role: selected.role };
  });
  if (rows.some(r => r === null)) return null;
  return { workspaceAuthorityBasis: task.workspaceAuthorityBasis, workspaceBinding: task.workspaceBinding, capabilityGrant: task.capabilityGrant,
    targets: rows as SemanticWorksiteBasis["targets"], commands: design.commands, outcomePredicates: design.outcomePredicates,
    allowedWriteTerritories: original.job.worksiteScope.evidenceWriteRoots.map(relativePath => ({ pathKind: "subtree", relativePath })) };
}
export function projectSemanticJobEvidence(basis: SemanticStageNativeBasis, input: unknown): SemanticJobEnvelope | null {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner?.call.implementationRef !== ids.evidenceInputImplementationRef || !equal(owner.inputValue, input) || !isWorksiteCommandExecutionObservation(input)) return null;
    const execution = predecessor(basis, owner, input, WORKSITE_COMMAND_EXECUTION_IDS.implementationRef);
    const construction = predecessor(basis, owner, input.task.sourceConstructionResult, WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef);
    if (execution === null || construction === null || !isWorksiteConstructionResult(construction.previous.result.value)) return null;
    const bridges = owner.events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && isWorksitePreparationInput(e.payload.value)).map(event => {
      const value = (event.payload as Record<string, JsonValue>).value;
      const bridge = predecessor(basis, owner, value, ids.jobBridgeImplementationRef);
      if (bridge === null || bridge.event.eventId !== event.eventId || bridge.event.admissionOrdinal >= construction.event.admissionOrdinal ||
        !isWorksiteFileParentsSuccess(bridge.execution.rawInputValue)) return null;
      const request = bridge.execution.rawInputValue.request;
      const row = owner.events.find(e => e.kind === "c_call_result_admitted" && record(e.payload) && e.payload.resultRef === request.sourceEnvelopeRef);
      const original = record(row?.payload) ? row.payload.value : null;
      if (!isSemanticJobEnvelope(original)) return null;
      const worksite = semanticJobSavedWorksite(original, value), expected = worksite === null ? null : deriveSemanticJobPreparation(original, worksite);
      return expected !== null && equal(expected, value) ? { original, worksite: worksite!, expected } : null;
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    if (bridges.length !== 1) return null;
    const { original: savedOriginal, worksite, expected } = bridges[0]!;
    const original = savedOriginal as SemanticJobEnvelope;
    if (!equal(prepareWorksiteCommandTask({ kind: "worksite_command_preparation_bound_input", schemaVersion: "5.0.0", entry: expected, source: input.task.sourceConstructionResult }), input.task)) return null;
    const root = input.provenance.helperPlan.sandboxRoot;
    if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return null;
    const artifacts = input.snapshotMembers.map(member => {
      const path = resolve(root, member.relativePath), rel = relative(root, path);
      if (rel.length === 0 || rel.startsWith("..") || isAbsolute(rel) || realpathSync(path) !== path) throw new TypeError("snapshot locus mismatch");
      const stat = lstatSync(path), bytes = readFileSync(path), target = worksite.targets.find(t => t.target.targetRef === member.sourceMemberRef);
      const protectedRow = input.task.protectedObservations.find(row => row.sourceMemberRef === member.sourceMemberRef);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || bytes.length !== member.byteLength || sha256Bytes(bytes) !== member.digest || protectedRow === undefined) throw new TypeError("snapshot identity mismatch");
      return { subjectRef: protectedRow.subject.subjectRef, observationRef: member.sourceObservationRef, base64: bytes.toString("base64"), role: target?.role === "verifier" ? "verifier_artifact" as const : "realization" as const };
    });
    return deepFreeze({ ...original, worksite, evidence: { kind: "semantic_worksite_evidence", constructionResultRef: construction.previous.result.resultRef,
      constructionResultDigest: construction.previous.result.resultDigest, executionResultRef: execution.previous.result.resultRef,
      executionResultDigest: execution.previous.result.resultDigest, constructionResult: input.task.sourceConstructionResult as unknown as Readonly<Record<string, JsonValue>>,
      executionObservation: input as unknown as Readonly<Record<string, JsonValue>>, artifacts } });
  } catch { return null; }
}
export function semanticJobResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner === null || !equal(owner.inputValue, input)) return false;
    const implementation = owner.call.implementationRef;
    if (NATIVE_SEMANTIC_IMPLEMENTATION_REFS.some(r => r === implementation)) return nativeSemanticResultMatchesBasis(basis, input, output);
    if (implementation === ids.jobIntakeImplementationRef) return equal(projectSemanticJobIntake(basis, input), output);
    if (implementation === ids.evidenceInputImplementationRef) return equal(projectSemanticJobEvidence(basis, input), output);
    if (implementation === ids.jobBridgeImplementationRef) {
      const source = originalForParents(basis, input), worksite = source === null ? null : semanticJobSavedWorksite(source.original, output);
      return source !== null && worksite !== null && equal(deriveSemanticJobPreparation(source.original, worksite), output);
    }
    if (!semanticJobInputMatchesBasis(basis, input)) return false;
    if (implementation === ids.jobPlanImplementationRef) {
      const expected = planInput(basis, input);
      return expected !== null && isWorksiteFileParentsRequest(output) && equal(constructWorksiteFileParentsRequest({ ...expected, ancestorObservations: output.ancestorObservations }), output);
    }
    if (!isSemanticJobEnvelope(output)) return false;
    if (implementation === ids.jobContextImplementationRef) return output.context !== null && semanticJobContextMatches(basis, input, output.context) && equal({ ...input, context: output.context }, output);
    if (implementation === ids.terminalImplementationRef) return equal(input, output);
    const asset = output.assets.at(-1), source = owner.role === "author" ? asset?.source : asset?.assessment?.source;
    if (owner.stage === undefined || source === undefined || source.cCallRef !== owner.call.cCallRef || source.inputDigest !== owner.inputDigest) return false;
    return equal(owner.role === "author" ? deriveSemanticJobAsset(input, owner.stage.declarationRef, asset!.candidate, source) :
      deriveSemanticJobAssessment(input, owner.stage.declarationRef, asset!.assessment?.candidate, source), output);
  } catch { return false; }
}

/** Select the initial Design/context by the authenticated bridge's request,
 * never by uniqueness of later envelopes carrying the same Design asset. */
function semanticJobConstructionSourceMatching(prefix: ValidatedRuntimeEventPrefix,
  matches: (original: SemanticJobEnvelope, request: WorksiteFileParentsRequest) => boolean) {
  try {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const rows = events.flatMap(event => {
      if (event.kind !== "c_call_result_admitted" || !record(event.payload) || !isWorksitePreparationInput(event.payload.value) ||
        event.payload.value.kind !== "worksite_command_preparation_input") return [];
      const judgment = events.find(e => e.kind === "c_call_judged" && e.aggregateId === event.aggregateId);
      if (judgment === undefined) return [];
      const value = event.payload.value;
      const outcome = projectWorksiteRevisionNativeResult(prefix, { cCallRef: event.aggregateId, resultRef: event.payload.resultRef as string,
        resultDigest: event.payload.resultDigest as `sha256:${string}`, resultAdmissionEventRef: event.eventId, judgmentEventRef: judgment.eventId });
      const seed = outcome === null ? null : rehydrateExecutionBasisAtPrefix(prefix, outcome.cCall.basisId);
      if (outcome?.cCall.implementationRef !== ids.jobBridgeImplementationRef || outcome.result.resultClass !== "success" ||
        outcome.judgment.judgment !== "advance" || seed === null || !isWorksiteFileParentsSuccess(seed.rawInputValue)) return [];
      const request = seed.rawInputValue.request, source = events.find(e => e.kind === "c_call_result_admitted" && record(e.payload) &&
        e.payload.resultRef === request.sourceEnvelopeRef && e.payload.resultDigest === request.sourceEnvelopeDigest);
      const original = record(source?.payload) ? source.payload.value : null;
      if (!isSemanticJobEnvelope(original) || original.assets.at(-1)?.assetRef !== request.sourceDesignAssetRef ||
        original.assets.at(-1)?.assetDigest !== request.sourceDesignAssetDigest || !matches(original, request)) return [];
      const worksite = semanticJobSavedWorksite(original, value);
      return worksite !== null && equal(deriveSemanticJobPreparation(original, worksite), value) ? [{ seed, worksite, original, result: outcome.result }] : [];
    });
    return rows.length === 1 ? rows[0]! : null;
  } catch { return null; }
}

/** D2 recovers the actual initial worksite from the admitted bridge, not a caller layout. */
export function semanticJobConstructionSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, envelope: SemanticJobEnvelope) {
  return semanticJobConstructionSourceMatching(prefix, (original, request) => equal(original.basis, envelope.basis) &&
    equal(original.job, envelope.job) && equal(original.bindingVersions, envelope.bindingVersions) &&
    envelope.assets.some(a => a.assetRef === request.sourceDesignAssetRef && a.assetDigest === request.sourceDesignAssetDigest));
}

/** One admitted initial-job bridge and its actual earlier context producer.
 * A matching-looking caller basis is not an origin and never becomes current. */
export function semanticJobReadDependenciesAtPrefix(prefix: ValidatedRuntimeEventPrefix, readBasis: WorksiteReadDependencyBasis) {
  try {
    if (!isWorksiteReadDependencyBasis(readBasis)) return null;
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const source = semanticJobConstructionSourceMatching(prefix, (original, request) => original.basis.jobRef === readBasis.jobRef &&
      original.basis.jobDigest === readBasis.jobDigest && request.sourceDesignAssetRef === readBasis.designAssetRef &&
      request.sourceDesignAssetDigest === readBasis.designAssetDigest && original.assets.at(-1)?.assessment?.disposition === "satisfied" &&
      original.context?.observationRef === readBasis.contextObservationRef && original.context.observationDigest === readBasis.contextObservationDigest);
    if (source === null || !equal(deriveSemanticJobReadDependencies(source.original, source.worksite), readBasis)) return null;
    const original = source.original;
    const contexts = events.flatMap(event => {
      if (event.kind !== "c_call_result_admitted" || !record(event.payload) || !isSemanticJobEnvelope(event.payload.value) ||
        !equal(event.payload.value.context, original.context) || !equal(event.payload.value.basis, original.basis)) return [];
      const judgment = events.find(row => row.kind === "c_call_judged" && row.aggregateId === event.aggregateId);
      if (judgment === undefined) return [];
      const outcome = projectWorksiteRevisionNativeResult(prefix, { cCallRef: event.aggregateId, resultRef: event.payload.resultRef as string,
        resultDigest: event.payload.resultDigest as `sha256:${string}`, resultAdmissionEventRef: event.eventId, judgmentEventRef: judgment.eventId });
      const seed = outcome === null ? null : rehydrateExecutionBasisAtPrefix(prefix, outcome.cCall.basisId);
      return outcome?.cCall.implementationRef === ids.jobContextImplementationRef && outcome.result.resultClass === "success" &&
        outcome.judgment.judgment === "advance" && seed !== null && sameJobInvocation(seed, source.seed)
        ? [{ event, seed }] : [];
    });
    return contexts.length === 1 ? { ...source, contextEvent: contexts[0]!.event } : null;
  } catch { return null; }
}

function nativeStageSource(basis: SemanticStageNativeBasis, envelope: SemanticJobEnvelope, source: NativeWorkspaceWorkObservation) {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null || !semanticJobInputMatchesBasis(basis, envelope)) return null;
  const native = projectNativeWorkspaceWorkSourceAtPrefix(owner.prefix, source);
  if (native === null || native.sourceResult.runId !== owner.call.runId || !sameJobInvocation(owner.execution, native.sourceBasis) ||
    native.sourceClosedEvent.admissionOrdinal >= (owner.events.find(e => e.eventId === owner.call.openedEventRef)?.admissionOrdinal ?? -1) ||
    !equal(source.task.workspaceAuthorityBasis, owner.environment.workspaceAuthorityBasis) ||
    !equal(source.task.workspaceBinding, owner.environment.workspaceBinding) || !equal(source.task.capabilityGrant, owner.grant) ||
    !nativeSemanticContextMatches(envelope, source.after) ||
    worksiteCommandSourcesInvalidatedAfter(owner.prefix, native.sourceResult.admissionOrdinal,
      source.task.workspaceAuthorityBasis.canonicalRoot, [], source.after.readRoots)) return null;
  return { owner, native };
}
export async function projectNativeSemanticTask(basis: SemanticStageNativeBasis, input: unknown, selectedLimits?: WorksiteCommandExecutionLimits) {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null || !semanticJobInputMatchesBasis(basis, input)) return null;
  // Current preparation checks actual controls; source/fold reconstruction
  // remains a pure relation over the selection retained by the admitted job.
  try {
    const retained = nativeSemanticCommandExecutionLimits(input);
    if (retained !== null && (selectedLimits === undefined || !equal(retained, selectedLimits))) return null;
  } catch { return null; }
  const context = await observeWorksiteContext({ ...operating(owner), readRoots: input.job.worksiteScope.readRoots,
    maxFiles: input.declaration.bounds.maxContextFiles, maxBytes: input.declaration.bounds.maxContextBytes });
  if (!isWorksiteContextObservation(context)) return null;
  try {
    if (owner.call.implementationRef === ids.nativeConstructionTaskImplementationRef) return constructNativeSemanticConstructionTask(input, operating(owner), context);
    return owner.stage === undefined || owner.role === null ? null : constructNativeSemanticTask(input, owner.stage.declarationRef, owner.role, operating(owner), context);
  } catch { return null; }
}
export function projectNativeSemanticFold(basis: SemanticStageNativeBasis, input: unknown,
  onContractIssues?: (issues: readonly SemanticJobContractIssue[]) => void) {
  try {
    if (!isRetainedGraphInput(input) || !isSemanticJobEnvelope(input.entry) || !isNativeWorkspaceWorkObservation(input.source)) return null;
    const source = nativeStageSource(basis, input.entry, input.source);
    if (source === null || source.owner.stage === undefined || source.owner.role === null) return null;
    const { owner } = source, stageRef = owner.stage!.declarationRef;
    const expected = constructNativeSemanticTask(input.entry, stageRef, owner.role!, operating(owner), input.source.before);
    if (!equal(expected, input.source.task)) return null;
    const adapter = { cCallRef: owner.call.cCallRef, inputDigest: owner.inputDigest };
    return owner.role === "author" ? deriveNativeSemanticAsset(input.entry, stageRef, input.source, adapter, onContractIssues)
      : deriveNativeSemanticAssessment(input.entry, stageRef, input.source, adapter);
  } catch { return null; }
}
export function projectNativeSemanticExecution(basis: SemanticStageNativeBasis, input: unknown) {
  try {
    if (!isRetainedGraphInput(input) || !isSemanticJobEnvelope(input.entry) || !isNativeWorkspaceWorkObservation(input.source)) return null;
    const source = nativeStageSource(basis, input.entry, input.source);
    return source?.owner.call.implementationRef === ids.nativeExecutionTaskImplementationRef
      ? constructNativeSemanticExecutionTask(input.entry, input.source) : null;
  } catch { return null; }
}
function nativeSemanticResultMatchesBasis(basis: SemanticStageNativeBasis, input: unknown, output: unknown): boolean {
  const owner = authenticateSemanticJobBasis(basis);
  if (owner === null) return false;
  const implementation = owner.call.implementationRef;
  if (implementation === ids.nativeAuthorFoldImplementationRef || implementation === ids.nativeAssessorFoldImplementationRef) return equal(projectNativeSemanticFold(basis, input), output);
  if (implementation === ids.nativeExecutionTaskImplementationRef) return equal(projectNativeSemanticExecution(basis, input), output);
  if (implementation === ids.nativeEvidenceImplementationRef) return equal(projectNativeSemanticEvidence(basis, input), output);
  if (!isSemanticJobEnvelope(input) || !semanticJobInputMatchesBasis(basis, input) || !isNativeWorkspaceWorkTask(output) ||
    !semanticJobContextMatches(basis, input, output.context)) return false;
  try {
    return equal(output, implementation === ids.nativeConstructionTaskImplementationRef
      ? constructNativeSemanticConstructionTask(input, operating(owner), output.context)
      : owner.stage === undefined || owner.role === null ? null : constructNativeSemanticTask(input, owner.stage.declarationRef, owner.role, operating(owner), output.context));
  } catch { return false; }
}

/** Native C2 alternative of the existing semantic evidence owner. Native C2
 * has already authenticated its source, protected snapshot and same-Run edge;
 * this join retains that exact evidence and the current assessed Design. */
export function projectNativeSemanticEvidence(basis: SemanticStageNativeBasis, input: unknown): SemanticJobEnvelope | null {
  try {
    const owner = authenticateSemanticJobBasis(basis);
    if (owner?.call.implementationRef !== ids.nativeEvidenceImplementationRef || !isRetainedGraphInput(input) ||
      !isSemanticJobEnvelope(input.entry) || !semanticJobInputMatchesBasis(basis, input.entry) || !isNativeWorksiteCommandExecutionObservation(input.source)) return null;
    const original = input.entry, execution = input.source, source = execution.task.sourceNativeWork;
    const executionOwner = predecessor(basis, owner, execution, WORKSITE_COMMAND_EXECUTION_IDS.implementationRef);
    const construction = projectNativeWorkspaceWorkSourceAtPrefix(owner.prefix, source);
    if (executionOwner === null || construction === null || construction.sourceResult.runId !== owner.call.runId ||
      !sameJobInvocation(owner.execution, construction.sourceBasis) ||
      construction.sourceClosedEvent.admissionOrdinal >= executionOwner.event.admissionOrdinal) return null;
    const artifacts = nativeSemanticEvidenceArtifacts(original, execution);
    if (artifacts === null) return null;
    const payload = construction.sourceResult.payload;
    if (!record(payload) || typeof payload.resultRef !== "string" || typeof payload.resultDigest !== "string") return null;
    // Native observations carry the current evidence; there is no legacy C1
    // operation basis and no new construction territory to authorize here.
    return deepFreeze({ ...original, context: source.after, worksite: null, evidence: { kind: "semantic_worksite_evidence",
      constructionResultRef: payload.resultRef, constructionResultDigest: payload.resultDigest as `sha256:${string}`,
      executionResultRef: executionOwner.previous.result.resultRef, executionResultDigest: executionOwner.previous.result.resultDigest,
      constructionResult: source as unknown as Readonly<Record<string, JsonValue>>,
      executionObservation: execution as unknown as Readonly<Record<string, JsonValue>>, artifacts } });
  } catch { return null; }
}
