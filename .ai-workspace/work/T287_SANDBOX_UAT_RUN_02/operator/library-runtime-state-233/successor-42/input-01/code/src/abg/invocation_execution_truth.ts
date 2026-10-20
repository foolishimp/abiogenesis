import { isOwnedRuntimeEventPrefix, runtimeEventsFromValidatedPrefix } from "./event_prefix.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import type { RuntimeEventPrefix } from "./event_prefix.js";
import { isJsonRecordShape as isRecord } from "../shared/admission_predicates.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isExactOperationDefinitionCoordinate } from "../shared/operation_definition_coordinate.js";
import type { ExecutionBasis } from "./execution_basis.js";
import {
  runtimeEventBodiesAtPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { InvocationAdmission } from "./invocation_admission.js";
import { isInvocationSourceResultBasis } from "./invocation_admission.js";
import type { RuntimeEvent } from "./event_store.js";
import { governanceContract, governanceRef, isGovernanceWorkState, type GovernanceWorkState } from "../product/default_library.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { compareGovernanceDeclarationPublications, type GovernanceCoveredSourceUse,
  type ProductInvocationSourceResultBasis } from "../product/semantics.js";
import type { WorkspaceBinding } from "../product/environment.js";
import type { GtlProgram, GraphFunction } from "../gtl/contracts.js";
import { constructAbgHistoricalDeclarationReference, type AbgHistoricalDeclarationProof,
  type AbgHistoricalDeclarationReference } from "./terminal_result_contracts.js";
import { reconstructHistoricalDeclarationCatalog, resolveProgramDeclarationClosure,
  resolveExecutionDeclarationClosure, selectExactClosureContract } from "../product/declaration_closure.js";
import { projectWorkspaceEnvironmentFromArtifactTruth, projectAdmittedProductInstallByAdmissionEventRef } from "./environment_admission.js";
import { projectOwnedPrefixArtifactTruth } from "./artifact_truth.js";
import { projectAdmittedWorkspaceBindingAtCoordinate, projectWorksiteRevisionBindingCover } from "./worksite_revision.js";
import { validatedRuntimeEventPrefixBeforeEvent } from "./event_prefix.js";
import { runtimeEventPhysicalPrefix, type DurablePrefixCoordinate } from "./event_store.js";

const same = (a: unknown, b: unknown) => canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);

/** @internal Existing Catalog reconstruction binds each complete preimage to
 * its actual admitted install/lock/W. No copied Catalog grants applicability. */
export function projectGovernanceCoveredSourceUse(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
  predecessorPrefix: DurablePrefixCoordinate; source: ProductInvocationSourceResultBasis;
  workspaceBinding: WorkspaceBinding; program: Readonly<GtlProgram>; graphFunction: Readonly<GraphFunction>;
  currentDeclaration: AbgHistoricalDeclarationProof; historicalDeclarations: readonly AbgHistoricalDeclarationProof[];
}>): GovernanceCoveredSourceUse | null;
/** @internal */
export function projectGovernanceCoveredSourceUse(prefix: RuntimeEventPrefix, input: Readonly<{
  predecessorPrefix: DurablePrefixCoordinate; source: ProductInvocationSourceResultBasis;
  workspaceBinding: WorkspaceBinding; program: Readonly<GtlProgram>; graphFunction: Readonly<GraphFunction>;
  currentDeclaration: AbgHistoricalDeclarationProof; historicalDeclarations: readonly AbgHistoricalDeclarationProof[];
}>): GovernanceCoveredSourceUse | null;
export function projectGovernanceCoveredSourceUse(prefix: RuntimeEventPrefix, input: Readonly<{
  predecessorPrefix: DurablePrefixCoordinate; source: ProductInvocationSourceResultBasis;
  workspaceBinding: WorkspaceBinding; program: Readonly<GtlProgram>; graphFunction: Readonly<GraphFunction>;
  currentDeclaration: AbgHistoricalDeclarationProof; historicalDeclarations: readonly AbgHistoricalDeclarationProof[];
}>): GovernanceCoveredSourceUse | null {
  try {
    const { source, predecessorPrefix, workspaceBinding, program, graphFunction, currentDeclaration } = input;
    if (prefix.kind === "runtime_validation_event_prefix") return null;
    const events = runtimeEventBodiesAtPrefix(prefix), physical = runtimeEventPhysicalPrefix(isOwnedRuntimeEventPrefix(prefix) ? prefix.selection : runtimeEventsFromValidatedPrefix(prefix));
    if (physical.byteLength !== predecessorPrefix.prefixLength || physical.digest !== predecessorPrefix.prefixDigest ||
        source.sourceResultContractRef !== governanceContract("state")) return null;
    const invocation = projectExactInvocationAdmissionAtPrefix(prefix, source.sourceInvocationAdmissionRef);
    const result = indexedRuntimeEvents(prefix, "id:" + source.sourceResultAdmissionEventRef).filter(e => e.eventId === source.sourceResultAdmissionEventRef && e.kind === "c_call_result_admitted");
    if (invocation === null || result.length !== 1 || !isRecord(result[0]!.payload) ||
        result[0]!.payload.resultRef !== source.sourceResultRef || result[0]!.payload.resultDigest !== source.sourceResultDigest ||
        result[0]!.payload.valueDigest !== source.sourceResultValueDigest || !same(result[0]!.payload.value, source.sourceResultValue) ||
        result[0]!.aggregateId !== source.sourceCCallRef || result[0]!.runId !== source.sourceRunId ||
        invocation.workspaceBindingId !== source.workspaceBindingId || invocation.workspaceBindingDigest !== source.workspaceBindingDigest ||
        invocation.workspaceId !== workspaceBinding.workspaceId || invocation.actorRef !== workspaceBinding.authorizedActorRef ||
        invocation.programRef !== program.programRef || invocation.programDigest !== sha256Canonical(program as unknown as JsonValue) ||
        invocation.graphFunctionRef !== graphFunction.name || invocation.graphFunctionDigest !== sha256Canonical(graphFunction as unknown as JsonValue)) return null;
    const historical = input.historicalDeclarations.filter(p => p.catalog.basisDigest === invocation.catalogBasisDigest &&
      p.catalogView.viewDigest === invocation.catalogViewDigest);
    if (historical.length !== 1) return null;
    const artifactTruth = projectOwnedPrefixArtifactTruth(predecessorPrefix);
    if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection") return null;
    const oldEnvironment = projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth,
      { ref: source.workspaceBindingId, digest: source.workspaceBindingDigest });
    const currentEnvironment = projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth,
      { ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest });
    if (oldEnvironment.kind !== "exact_prefix_workspace_environment" || currentEnvironment.kind !== "exact_prefix_workspace_environment" ||
        !same(currentEnvironment.workspaceBinding, workspaceBinding)) return null;
    const reconstruct = (proof: AbgHistoricalDeclarationProof, env: typeof oldEnvironment) => reconstructHistoricalDeclarationCatalog(proof, {
      workspaceBinding: env.workspaceBindingCandidate, resolvedLock: env.resolvedProductLock,
      installedProducts: env.productInstalls.map(i => {
        const actual = projectAdmittedProductInstallByAdmissionEventRef(env.artifactTruth, i.admissionEventRef);
        if (actual === null) throw new TypeError("historical installed declaration owner missing");
        return actual.candidate;
      }),
    });
    const old = reconstruct(historical[0]!, oldEnvironment), current = reconstruct(currentDeclaration, currentEnvironment);
    if (!same(old.catalogView.allowlist, current.catalogView.allowlist)) return null;
    const oldClosure = resolveProgramDeclarationClosure(old.catalog, old.catalogView, program.programRef);
    const newClosure = resolveProgramDeclarationClosure(current.catalog, current.catalogView, program.programRef);
    const selected = resolveExecutionDeclarationClosure(old.catalog, old.catalogView, program.programRef, graphFunction.name);
    if (oldClosure.kind !== "resolved_program_declaration_closure" || newClosure.kind !== "resolved_program_declaration_closure" ||
        selected.kind !== "resolved_execution_declaration_closure" ||
        oldClosure.programPublication.programs.filter(p => same(p, program)).length !== 1 ||
        newClosure.programPublication.programs.filter(p => same(p, program)).length !== 1) return null;
    const inputContract = selectExactClosureContract(selected, invocation.inputContractRef);
    const outputContract = selectExactClosureContract(selected, invocation.outputContractRef);
    if (inputContract === null || outputContract === null ||
        sha256Canonical(inputContract.contract as unknown as JsonValue) !== invocation.inputContractDigest || !same(inputContract.owner, invocation.inputContractOwner) ||
        sha256Canonical(outputContract.contract as unknown as JsonValue) !== invocation.outputContractDigest || !same(outputContract.owner, invocation.outputContractOwner)) return null;
    const compared = compareGovernanceDeclarationPublications(oldClosure.publications, newClosure.publications);
    const basis = result[0]!.basisId === null ? null : projectExactExecutionBasisAtPrefix(prefix, result[0]!.basisId);
    const covers = basis === null ? null : projectWorksiteRevisionBindingCover(prefix, oldEnvironment.workspaceBinding, workspaceBinding, [basis]);
    if (compared === null || covers === null) return null;
    const body = { kind: "governance_covered_source_use" as const, schemaVersion: "5.0.0" as const,
      predecessorPrefix, sourceBasisRef: source.basisRef, sourceBasisDigest: source.basisDigest,
      currentWorkspaceBindingId: workspaceBinding.bindingId, currentWorkspaceBindingDigest: workspaceBinding.bindingDigest,
      currentCatalogBasisDigest: current.catalog.basisDigest, currentCatalogViewDigest: current.catalogView.viewDigest,
      programRef: program.programRef, programDigest: invocation.programDigest,
      graphFunctionRef: graphFunction.name, graphFunctionDigest: invocation.graphFunctionDigest,
      historicalClosureDigest: oldClosure.closureDigest, currentClosureDigest: newClosure.closureDigest,
      historicalDeclaration: constructAbgHistoricalDeclarationReference(historical[0]!),
      currentDeclaration: constructAbgHistoricalDeclarationReference(currentDeclaration),
      declarationMeaningDigest: compared.meaningDigest, declarationOwners: compared.owners, bindingCoverEventRefs: covers };
    return deepFreeze({ ...body, useDigest: sha256Canonical(body as unknown as JsonValue) });
  } catch { return null; }
}

/** The ordinary invocation admission attests the complete pre-effect installed
 * declaration comparison. Reconstruct its exact source and witnessed crossing;
 * a cover or copied comparison result cannot replace that admitted record. */
function coveredGovernancePredecessor(prefix: RuntimeEventPrefix,
  invocation: InvocationAdmission): InvocationAdmission | null {
  const actual = projectExactInvocationAdmissionAtPrefix(prefix, invocation.invocationAdmissionRef);
  const source = actual?.sourceResultBasis;
  if (actual === null || !same(actual, invocation) || source === null || source === undefined ||
      !isInvocationSourceResultBasis(source) || source.sourceResultContractRef !== governanceContract("state") ||
      !isGovernanceWorkState(source.sourceResultValue) || source.sourceResultValue.terminal ||
      actual.rawInputDigest !== source.sourceResultValueDigest) return null;
  const before = validatedRuntimeEventPrefixBeforeEvent(prefix, actual.publicOperationEventRef);
  const events = runtimeEventBodiesAtPrefix(before);
  const predecessor = projectExactInvocationAdmissionAtPrefix(before, source.sourceInvocationAdmissionRef);
  const result = indexedRuntimeEvents(before, "id:" + source.sourceResultAdmissionEventRef).find(e => e.eventId === source.sourceResultAdmissionEventRef && e.kind === "c_call_result_admitted");
  const judgment = indexedRuntimeEvents(before, "id:" + source.sourceResultJudgmentEventRef).find(e => e.eventId === source.sourceResultJudgmentEventRef && e.kind === "c_call_judged");
  const basis = result?.basisId == null ? null : projectExactExecutionBasisAtPrefix(before, result.basisId);
  const selected = indexedRuntimeEvents(before, "related:" + source.sourceCCallRef).filter(e => e.kind === "c_call_fibre_selected" && e.aggregateId === source.sourceCCallRef);
  if (predecessor === null || basis === null || result === undefined || judgment === undefined ||
      !isRecord(result.payload) || !isRecord(judgment.payload) || selected.length !== 1 || !isRecord(selected[0]!.payload) ||
      selected[0]!.payload.regime !== "F_D" || ![governanceRef("implementation", "fold"), governanceRef("implementation", "evaluate-parent")]
        .includes(selected[0]!.payload.implementationRef as string) ||
      predecessor.invocationRef !== source.sourceInvocationRef || predecessor.workspaceId !== source.sourceWorkspaceId ||
      predecessor.workspaceId !== actual.workspaceId || predecessor.actorRef !== actual.actorRef ||
      predecessor.workspaceBindingId !== source.workspaceBindingId || predecessor.workspaceBindingDigest !== source.workspaceBindingDigest ||
      predecessor.programRef !== actual.programRef || predecessor.programDigest !== actual.programDigest ||
      predecessor.graphFunctionRef !== actual.graphFunctionRef || predecessor.graphFunctionDigest !== actual.graphFunctionDigest ||
      basis.invocationAdmissionRef !== predecessor.invocationAdmissionRef || basis.workspaceBindingId !== predecessor.workspaceBindingId ||
      basis.workspaceBindingDigest !== predecessor.workspaceBindingDigest || basis.graphFunctionRef !== source.sourceGraphFunctionRef ||
      !hasExactInvocationRunBindingAtPrefix(before, predecessor, source.sourceRunId) ||
      result.aggregateId !== source.sourceCCallRef || result.runId !== source.sourceRunId || result.graphCallId !== source.sourceGraphCallId ||
      result.payload.resultClass !== "success" || result.payload.contractRef !== source.sourceResultContractRef ||
      result.payload.resultRef !== source.sourceResultRef || result.payload.resultDigest !== source.sourceResultDigest ||
      result.payload.valueDigest !== source.sourceResultValueDigest || !same(result.payload.value, source.sourceResultValue) ||
      judgment.aggregateId !== result.aggregateId || judgment.basisId !== result.basisId || judgment.runId !== result.runId ||
      judgment.graphCallId !== result.graphCallId || judgment.frameId !== result.frameId ||
      judgment.payload.judgment !== "advance" || judgment.payload.resultRef !== source.sourceResultRef ||
      judgment.payload.resultDigest !== source.sourceResultDigest || judgment.admissionOrdinal <= result.admissionOrdinal ||
      !judgment.causationEventRefs.includes(result.eventId)) return null;
  const old = projectAdmittedWorkspaceBindingAtCoordinate(before, predecessor.workspaceBindingId, predecessor.workspaceBindingDigest);
  const current = projectAdmittedWorkspaceBindingAtCoordinate(before, actual.workspaceBindingId, actual.workspaceBindingDigest);
  return old !== null && current !== null && old.workspaceId === current.workspaceId &&
      old.authorizedActorRef === current.authorizedActorRef &&
      projectWorksiteRevisionBindingCover(before, old, current, [basis]) !== null
    ? predecessor : null;
}

/** Selector only: the historical resource/closed-child owner authenticates the
 * complete matching Catalog. Catalog admission equates basis/readiness digests. */
export function governanceHistoricalDeclarationReferenceAtPrefix(prefix: ValidatedRuntimeEventPrefix,
  invocation: InvocationAdmission, sourceBasis: ExecutionBasis): AbgHistoricalDeclarationReference | null;
/** @internal */
export function governanceHistoricalDeclarationReferenceAtPrefix(prefix: RuntimeEventPrefix,
  invocation: InvocationAdmission, sourceBasis: ExecutionBasis): AbgHistoricalDeclarationReference | null;
export function governanceHistoricalDeclarationReferenceAtPrefix(prefix: RuntimeEventPrefix,
  invocation: InvocationAdmission, sourceBasis: ExecutionBasis): AbgHistoricalDeclarationReference | null {
  try {
    const seen = new Set<string>();
    let current: InvocationAdmission | null = invocation;
    while (current !== null && !seen.has(current.invocationAdmissionRef)) {
      seen.add(current.invocationAdmissionRef);
      const actual = projectExactInvocationAdmissionAtPrefix(prefix, current.invocationAdmissionRef);
      if (actual === null || !same(actual, current)) return null;
      if (actual.invocationAdmissionRef === sourceBasis.invocationAdmissionRef) {
        return actual.workspaceBindingId === sourceBasis.workspaceBindingId && actual.workspaceBindingDigest === sourceBasis.workspaceBindingDigest &&
            actual.catalogBasisDigest === sourceBasis.catalogBasisDigest && actual.catalogViewDigest === sourceBasis.catalogViewDigest
          ? deepFreeze({ kind: "abg_historical_declaration_reference" as const, schemaVersion: "5.0.0" as const,
              catalogBasisDigest: actual.catalogBasisDigest, readinessBasisDigest: actual.catalogBasisDigest, viewDigest: actual.catalogViewDigest })
          : null;
      }
      current = coveredGovernancePredecessor(prefix, actual);
    }
    return null;
  } catch { return null; }
}

/** Current consumer applicability derives from existing admitted coordinates.
 * Complete declaration meaning was validated before invocation admission;
 * current source membership, ancestry and per-observation cover remain exact. */
export function hasAdmittedGovernanceCoveredSourceUse(prefix: ValidatedRuntimeEventPrefix, invocation: InvocationAdmission,
  sourceBasis?: ExecutionBasis): boolean;
/** @internal */
export function hasAdmittedGovernanceCoveredSourceUse(prefix: RuntimeEventPrefix, invocation: InvocationAdmission,
  sourceBasis?: ExecutionBasis): boolean;
export function hasAdmittedGovernanceCoveredSourceUse(prefix: RuntimeEventPrefix, invocation: InvocationAdmission,
  sourceBasis?: ExecutionBasis): boolean {
  try {
    if (coveredGovernancePredecessor(prefix, invocation) === null) return false;
    if (sourceBasis === undefined) return true;
    if (governanceHistoricalDeclarationReferenceAtPrefix(prefix, invocation, sourceBasis) === null) return false;
    const before = validatedRuntimeEventPrefixBeforeEvent(prefix, invocation.publicOperationEventRef);
    const old = projectAdmittedWorkspaceBindingAtCoordinate(before, sourceBasis.workspaceBindingId, sourceBasis.workspaceBindingDigest);
    const current = projectAdmittedWorkspaceBindingAtCoordinate(before, invocation.workspaceBindingId, invocation.workspaceBindingDigest);
    return old !== null && current !== null && projectWorksiteRevisionBindingCover(before, old, current, [sourceBasis]) !== null;
  } catch { return false; }
}

/** The invocation/source admission already checked this immutable relation.
 * Internal consumers transport exact Result identity, without cold derivation
 * or a new grant. This does not establish mutable currentness/independence. */
export function hasAdmittedGovernanceSourceUse(invocation: InvocationAdmission, event: RuntimeEvent): boolean {
  const basis = invocation.sourceResultBasis;
  if (basis === null || basis === undefined || basis.sourceResultContractRef !== governanceContract("state") ||
    !isRecord(basis.sourceResultValue) || basis.sourceResultValue.kind !== "governance_work_state" ||
    event.kind !== "c_call_result_admitted" || !isRecord(event.payload) || event.payload.resultClass !== "success") return false;
  const state = basis.sourceResultValue as unknown as GovernanceWorkState;
  const payload = event.payload, synthesis = state.synthesis;
  return state.observations.some(row => row.resultRef === payload.resultRef && row.resultDigest === payload.resultDigest &&
    row.cCallRef === event.aggregateId) || synthesis !== null && synthesis.resultRef === payload.resultRef &&
    synthesis.resultDigest === payload.resultDigest;
}

function canonicalRecordDigest(value: unknown): Sha256Digest | null {
  if (!isRecord(value)) return null;
  try {
    return sha256Canonical(value);
  } catch {
    return null;
  }
}

function sameStringArray(
  value: unknown,
  expected: readonly string[],
): boolean {
  return Array.isArray(value) &&
    value.length === expected.length &&
    value.every((entry, index) =>
      typeof entry === "string" && entry === expected[index]
    );
}

export function projectExactInvocationAdmissionAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  invocationAdmissionRef: string,
): InvocationAdmission | null;
/** @internal */
export function projectExactInvocationAdmissionAtPrefix(
  prefix: RuntimeEventPrefix,
  invocationAdmissionRef: string,
): InvocationAdmission | null;
export function projectExactInvocationAdmissionAtPrefix(
  prefix: RuntimeEventPrefix,
  invocationAdmissionRef: string,
): InvocationAdmission | null {
  const events = runtimeEventBodiesAtPrefix(prefix);
  const matches = indexedRuntimeEvents(prefix, "payload:invocationAdmissionRef:" + invocationAdmissionRef).filter(
    (event) =>
      event.kind === "invocation_admitted" &&
      isRecord(event.payload) &&
      event.payload.invocationAdmissionRef === invocationAdmissionRef,
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  if (event.causationEventRefs.length !== 1 || !isRecord(event.payload)) {
    return null;
  }
  const publicEvent = indexedRuntimeEvents(prefix, "id:" + event.causationEventRefs[0]).find((candidate) =>
    candidate.eventId === event.causationEventRefs[0] &&
    candidate.kind === "public_operation_admitted"
  );
  if (publicEvent === undefined || !isRecord(publicEvent.payload)) return null;
  const carriesCatalogApplications =
    Array.isArray(event.payload.catalogApplicationRefs) &&
    Array.isArray(event.payload.catalogApplicationDigests);
  const admission = deepFreeze({
    kind: "invocation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    ...event.payload,
    catalogApplicationRefs: carriesCatalogApplications
      ? event.payload.catalogApplicationRefs
      : [],
    catalogApplicationDigests: carriesCatalogApplications
      ? event.payload.catalogApplicationDigests
      : [],
    publicOperationEventRef: publicEvent.eventId,
    admissionEventRef: event.eventId,
  }) as unknown as InvocationAdmission;
  const body = {
    invocationRef: admission.invocationRef,
    invocationDigest: admission.invocationDigest,
    invocationVariant: admission.invocationVariant,
    rawInputAdmissionRef: admission.rawInputAdmissionRef,
    rawInputDigest: admission.rawInputDigest,
    publicRequestAdmissionRef: admission.publicRequestAdmissionRef,
    publicRequestDigest: admission.publicRequestDigest,
    publicRequestInvocationRef: admission.publicRequestInvocationRef,
    workspaceId: admission.workspaceId,
    workspaceBindingId: admission.workspaceBindingId,
    workspaceBindingDigest: admission.workspaceBindingDigest,
    catalogBasisRef: admission.catalogBasisRef,
    catalogBasisDigest: admission.catalogBasisDigest,
    catalogViewId: admission.catalogViewId,
    catalogViewDigest: admission.catalogViewDigest,
    ...(carriesCatalogApplications
      ? {
          catalogApplicationRefs: admission.catalogApplicationRefs,
          catalogApplicationDigests: admission.catalogApplicationDigests,
        }
      : {}),
    programRef: admission.programRef,
    programDigest: admission.programDigest,
    catalogHandle: admission.catalogHandle,
    graphFunctionRef: admission.graphFunctionRef,
    graphFunctionDigest: admission.graphFunctionDigest,
    selectedDefinitionRef: admission.selectedDefinitionRef,
    selectedDefinitionDigest: admission.selectedDefinitionDigest,
    gtlEntryCoordinate: admission.gtlEntryCoordinate,
    gtlEntryTerm: admission.gtlEntryTerm,
    inputContractRef: admission.inputContractRef,
    inputContractDigest: admission.inputContractDigest,
    inputContractOwner: admission.inputContractOwner,
    outputContractRef: admission.outputContractRef,
    outputContractDigest: admission.outputContractDigest,
    outputContractOwner: admission.outputContractOwner,
    productExecutionResolutionRef:
      admission.productExecutionResolutionRef,
    productExecutionResolutionDigest:
      admission.productExecutionResolutionDigest,
    programValidationRef: admission.programValidationRef,
    programValidationDigest: admission.programValidationDigest,
    policyRef: admission.policyRef,
    policyDigest: admission.policyDigest,
    capabilityGrants: admission.capabilityGrants,
    capabilityGrantRefs: admission.capabilityGrantRefs,
    authorityRef: admission.authorityRef,
    authorityDigest: admission.authorityDigest,
    actorRef: admission.actorRef,
    publicStart: admission.publicStart,
    reentryBasis: admission.reentryBasis,
    sourceResultBasis: admission.sourceResultBasis,
    ...(admission.runEnvironment === undefined ? {} : { runEnvironment: admission.runEnvironment }),
  };
  const operationId = "abg.operation.run.invoke";
  return sha256Canonical(body as unknown as JsonValue) ===
        admission.invocationAdmissionDigest &&
      typeof admission.publicRequestInvocationRef === "string" &&
      admission.publicRequestInvocationRef.length > 0 &&
      admission.invocationAdmissionRef ===
        `invocation-admission://abiogenesis/${admission.invocationAdmissionDigest.slice("sha256:".length)}` &&
      publicEvent.aggregateType === "workspace" &&
      publicEvent.aggregateId === admission.workspaceBindingId &&
      publicEvent.parentAggregateId === admission.invocationRef &&
      publicEvent.workflowVersion === "5.0.0" &&
      publicEvent.scopeClass === "workspace" &&
      publicEvent.basisId === admission.authorityRef &&
      event.aggregateType === "workspace" &&
      event.aggregateId === admission.workspaceBindingId &&
      event.parentAggregateId === admission.invocationRef &&
      event.workflowVersion === "5.0.0" &&
      event.scopeClass === "workspace" &&
      event.basisId === admission.invocationAdmissionRef &&
      event.eventTime === publicEvent.eventTime &&
      event.correlationId === publicEvent.correlationId &&
      event.causationEventRefs[0] === publicEvent.eventId &&
      publicEvent.payload.operationId === operationId &&
      isExactOperationDefinitionCoordinate({
        operationId: publicEvent.payload.operationId,
        memberKey: publicEvent.payload.memberKey,
        definitionDigest: publicEvent.payload.definitionDigest,
      }) &&
      publicEvent.payload.memberKey ===
        (admission.invocationVariant === "direct"
          ? "invoke"
          : admission.invocationVariant) &&
      publicEvent.payload.variant === admission.invocationVariant &&
      publicEvent.payload.invocationRef === admission.invocationRef &&
      publicEvent.payload.invocationDigest === admission.invocationDigest &&
      publicEvent.payload.actorRef === admission.actorRef &&
      publicEvent.payload.authorityRef === admission.authorityRef &&
      publicEvent.payload.authorityDigest === admission.authorityDigest &&
      sameStringArray(
        publicEvent.payload.capabilityGrantRefs,
        admission.capabilityGrantRefs,
      ) &&
      carriesCatalogApplications &&
      sameStringArray(
        publicEvent.payload.catalogApplicationRefs,
        admission.catalogApplicationRefs,
      ) &&
      sameStringArray(
        publicEvent.payload.catalogApplicationDigests,
        admission.catalogApplicationDigests,
      ) &&
      publicEvent.payload.catalogBasisRef === admission.catalogBasisRef &&
      publicEvent.payload.catalogBasisDigest === admission.catalogBasisDigest &&
      publicEvent.payload.catalogViewId === admission.catalogViewId &&
      publicEvent.payload.policyRef === admission.policyRef &&
      publicEvent.payload.policyDigest === admission.policyDigest &&
      publicEvent.payload.workspaceBindingId ===
        admission.workspaceBindingId &&
      publicEvent.payload.programRef === admission.programRef &&
      publicEvent.payload.catalogHandle === admission.catalogHandle &&
      publicEvent.payload.graphFunctionRef === admission.graphFunctionRef &&
      publicEvent.payload.selectedDefinitionRef ===
        admission.selectedDefinitionRef &&
      publicEvent.payload.selectedDefinitionDigest ===
        admission.selectedDefinitionDigest &&
      publicEvent.payload.programValidationRef ===
        admission.programValidationRef &&
      publicEvent.payload.programValidationDigest ===
        admission.programValidationDigest &&
      isRecord(publicEvent.payload.gtlEntryCoordinate) &&
      isRecord(publicEvent.payload.gtlEntryTerm) &&
      sha256Canonical(publicEvent.payload.gtlEntryCoordinate) ===
        sha256Canonical(
          admission.gtlEntryCoordinate as unknown as JsonValue,
        ) &&
      sha256Canonical(publicEvent.payload.gtlEntryTerm) ===
        sha256Canonical(admission.gtlEntryTerm as unknown as JsonValue) &&
      event.payload.invocationAdmissionRef === admission.invocationAdmissionRef &&
      event.payload.invocationAdmissionDigest ===
        admission.invocationAdmissionDigest
    ? admission
    : null;
}

export interface ExactRunInvocationFact {
  readonly operationId: "abg.operation.run.invoke";
  readonly publicInvocationRef: string;
  readonly ownerInvocationRef: string;
  readonly ownerInvocationDigest: Sha256Digest;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
}

export type ExactRunInvocationFacts =
  | Readonly<{
      disposition: "valid";
      facts: readonly ExactRunInvocationFact[];
    }>
  | Readonly<{
      disposition: "invalid_history";
      eventRefs: readonly string[];
    }>;

export function projectExactRunInvocationFactsAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
): ExactRunInvocationFacts;
/** @internal */
export function projectExactRunInvocationFactsAtPrefix(
  prefix: RuntimeEventPrefix,
): ExactRunInvocationFacts;
export function projectExactRunInvocationFactsAtPrefix(
  prefix: RuntimeEventPrefix,
): ExactRunInvocationFacts {
  const events = runtimeEventBodiesAtPrefix(prefix);
  const ownerEvents = indexedRuntimeEvents(prefix, "kind:" + "invocation_admitted").filter((event) =>
    event.kind === "invocation_admitted"
  );
  const facts: ExactRunInvocationFact[] = [];
  const invalidEventRefs = new Set<string>();
  for (const ownerEvent of ownerEvents) {
    const invocationAdmissionRef = isRecord(ownerEvent.payload) &&
        typeof ownerEvent.payload.invocationAdmissionRef === "string"
      ? ownerEvent.payload.invocationAdmissionRef
      : null;
    const admission = invocationAdmissionRef === null
      ? null
      : projectExactInvocationAdmissionAtPrefix(
          prefix,
          invocationAdmissionRef,
        );
    if (
      admission === null ||
      admission.admissionEventRef !== ownerEvent.eventId ||
      ownerEvent.causationEventRefs.length !== 1 ||
      admission.publicOperationEventRef !== ownerEvent.causationEventRefs[0]
    ) {
      invalidEventRefs.add(ownerEvent.eventId);
      for (const eventRef of ownerEvent.causationEventRefs) {
        invalidEventRefs.add(eventRef);
      }
      continue;
    }
    facts.push(deepFreeze({
      operationId: "abg.operation.run.invoke" as const,
      publicInvocationRef: admission.publicRequestInvocationRef,
      ownerInvocationRef: admission.invocationRef,
      ownerInvocationDigest: admission.invocationDigest,
      publicOperationEventRef: admission.publicOperationEventRef,
      admissionEventRef: admission.admissionEventRef,
    }));
  }
  const publicRunEventRefs = indexedRuntimeEvents(prefix, "kind:" + "public_operation_admitted")
    .filter((event) =>
      event.kind === "public_operation_admitted" &&
      isRecord(event.payload) &&
      event.payload.operationId === "abg.operation.run.invoke"
    )
    .map((event) => event.eventId);
  const heldPublicEventRefs = facts.map((fact) =>
    fact.publicOperationEventRef
  );
  const publicRefCounts = new Map<string, number>();
  for (const eventRef of heldPublicEventRefs) {
    publicRefCounts.set(eventRef, (publicRefCounts.get(eventRef) ?? 0) + 1);
  }
  const publicRunEventRefSet = new Set(publicRunEventRefs);
  const heldPublicEventRefSet = new Set(heldPublicEventRefs);
  for (const eventRef of publicRunEventRefs) {
    if (!heldPublicEventRefSet.has(eventRef)) invalidEventRefs.add(eventRef);
  }
  for (const eventRef of heldPublicEventRefs) {
    if (
      !publicRunEventRefSet.has(eventRef) ||
      publicRefCounts.get(eventRef) !== 1
    ) {
      invalidEventRefs.add(eventRef);
    }
  }
  return invalidEventRefs.size === 0 &&
      publicRunEventRefs.length === facts.length
    ? deepFreeze({
        disposition: "valid" as const,
        facts,
      })
    : deepFreeze({
        disposition: "invalid_history" as const,
        eventRefs: [...invalidEventRefs].sort(),
      });
}

export function hasExactInvocationAdmissionAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admission: InvocationAdmission,
): boolean;
/** @internal */
export function hasExactInvocationAdmissionAtPrefix(
  prefix: RuntimeEventPrefix,
  admission: InvocationAdmission,
): boolean;
export function hasExactInvocationAdmissionAtPrefix(
  prefix: RuntimeEventPrefix,
  admission: InvocationAdmission,
): boolean {
  const projected = projectExactInvocationAdmissionAtPrefix(
    prefix,
    admission.invocationAdmissionRef,
  );
  return projected !== null &&
    sha256Canonical(projected as unknown as JsonValue) ===
      sha256Canonical(admission as unknown as JsonValue);
}

export function hasExactInvocationRunBindingAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admission: InvocationAdmission,
  runId: string,
): boolean;
/** @internal */
export function hasExactInvocationRunBindingAtPrefix(
  prefix: RuntimeEventPrefix,
  admission: InvocationAdmission,
  runId: string,
): boolean;
export function hasExactInvocationRunBindingAtPrefix(
  prefix: RuntimeEventPrefix,
  admission: InvocationAdmission,
  runId: string,
): boolean {
  if (!hasExactInvocationAdmissionAtPrefix(prefix, admission)) return false;
  const runOpenEvents = indexedRuntimeEvents(prefix, "related:" + runId).filter(
    (event) =>
      event.kind === "run_segment_opened" &&
      event.aggregateType === "run" &&
      event.aggregateId === runId &&
      event.runId === runId,
  );
  if (runOpenEvents.length !== 1) return false;
  const runOpen = runOpenEvents[0]!;
  const payload = runOpen.payload;
  return isRecord(payload) &&
    runOpen.parentAggregateId === admission.workspaceBindingId &&
    runOpen.graphFunctionRef === admission.graphFunctionRef &&
    payload.runId === runId &&
    payload.invocationAdmissionRef === admission.invocationAdmissionRef &&
    payload.invocationRef === admission.invocationRef &&
    payload.workspaceBindingId === admission.workspaceBindingId &&
    payload.programRef === admission.programRef &&
    payload.graphFunctionRef === admission.graphFunctionRef;
}

export function projectExactExecutionBasisAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  basisRef: string,
): ExecutionBasis | null;
/** @internal */
export function projectExactExecutionBasisAtPrefix(
  prefix: RuntimeEventPrefix,
  basisRef: string,
): ExecutionBasis | null;
export function projectExactExecutionBasisAtPrefix(
  prefix: RuntimeEventPrefix,
  basisRef: string,
): ExecutionBasis | null {
  const matches = indexedRuntimeEvents(prefix, "payload:basisRef:" + basisRef).filter(
    (event) =>
      event.kind === "basis_admitted" &&
      event.basisId === basisRef &&
      isRecord(event.payload) &&
      event.payload.basisRef === basisRef,
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  if (
    !isRecord(event.payload) ||
    canonicalRecordDigest(event.payload.rawInputValue) !==
      event.payload.rawInputDigest
  ) return null;
  const basis = deepFreeze({
    kind: "execution_basis" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    ...event.payload,
    admissionEventRef: event.eventId,
  }) as unknown as ExecutionBasis;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    basisRef: _basisRef,
    basisDigest: _basisDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = basis;
  // The immutable admitted payload's raw input digest was checked above.
  return sha256Canonical(body as unknown as JsonValue) === basis.basisDigest &&
      basis.basisRef ===
        `execution-basis://abiogenesis/${basis.basisDigest.slice("sha256:".length)}` &&
      event.payload.basisRef === basis.basisRef &&
      event.payload.basisDigest === basis.basisDigest &&
      event.payload.invocationAdmissionRef === basis.invocationAdmissionRef &&
      event.payload.implementationSetRef === basis.implementationSetRef &&
      event.payload.implementationSetDigest === basis.implementationSetDigest &&
      event.payload.interactionSetRef === basis.interactionSetRef &&
      event.payload.interactionSetDigest === basis.interactionSetDigest &&
      event.payload.implementationResolutionRef ===
        basis.implementationResolutionRef
    ? basis
    : null;
}
