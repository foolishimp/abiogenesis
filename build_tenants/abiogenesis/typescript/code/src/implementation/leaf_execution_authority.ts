import { isRecord, isNonblankNulFreeString as nonEmptyString } from "../shared/admission_predicates.js";
import { hasExactDataFields } from "../shared/admit/record.js";
import { isExactAdmittedImplementationRow } from "../abg/execution_basis.js";
import { validateDurablePrefixCoordinate } from "../abg/event_store.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import type { LeafExecutionAuthority, LeafExecutionOccurrence, LeafInvocationResolution } from "./contracts.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds, NATIVE_WORKSPACE_WORK_HANDLER_DIGEST } from "../product/native_workspace_work.js";
import { WORKSITE_FILE_REPLACE_EFFECT_URI, WORKSITE_FILE_REPLACE_HANDLER_REF, WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
  WORKSITE_FILE_PARENTS_EFFECT_URI, WORKSITE_FILE_PARENTS_HANDLER_REF, WORKSITE_FILE_PARENTS_HANDLER_DIGEST } from "../product/worksite_effect.js";
import type { WorksiteFileParentsRequest, WorksiteFileReplaceRequest } from "../product/worksite_effect.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { GraphFunction } from "../gtl/contracts.js";
import type { validateWorksiteFileParentsPlanAtPrefix } from "../abg/semantic_job.js";
import type { AdmittedImplementationSet, ExecutionBasis } from "../abg/execution_basis.js";
import { canonicalEquals } from "../shared/value/index.js";
import { constructWorksiteEffectAuthorization, constructWorksiteFileParentsAuthorization } from "../product/worksite_effect.js";
import { rehydrateInvocationAdmissionAtPrefix } from "../abg/invocation_admission.js";
import { projectCCallCarrierPhaseAtPrefix } from "../abg/c_call.js";
import { worksiteSelectedOccurrenceInputCurrent } from "../abg/event_calculus.js";
import { exactProgramOwnerInstall, hasAdmittedExecutionBasisAtPrefix, hasAdmittedImplementationSetAtPrefix,
  rehydrateAdmittedImplementationSetAtPrefix, rehydrateExecutionBasisAtPrefix } from "../abg/execution_basis.js";
import { projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { readOwnedRuntimeEventPrefixAtDurablePrefix, selectRuntimeEventPrefixFromAuthority,
  type RuntimeEventPrefix } from "../abg/event_prefix.js";
import type { JsonValue } from "../shared/canonical_json.js";

type LeafExecutionAuthorityBody = Omit<
  LeafExecutionAuthority,
  "kind" | "schemaVersion" | "authorityRef" | "authorityDigest"
>;

const LEAF_EXECUTION_AUTHORITY_FIELDS = Object.freeze([
  "actorRef",
  "authorityDigest",
  "authorityRef",
  "cCallDigest",
  "cCallRef",
  "cCall",
  "capabilityGrantDigest",
  "capabilityGrantRef",
  "effectUri",
  "executionBasisDigest",
  "executionBasisRef",
  "graphFunctionDigest",
  "graphFunctionRef",
  "handlerDigest",
  "handlerRef",
  "implementationBindingDigest",
  "implementationBindingRef",
  "implementationOwnerRef",
  "implementationRef",
  "implementationResolution",
  "implementationResolutionDigest",
  "implementationResolutionRef",
  "implementationSetDigest",
  "implementationSetRef",
  "implementationSet",
  "kind",
  "leafResolutionCandidateDigest",
  "leafResolutionCandidateRef",
  "programDigest",
  "programPublication",
  "programRef",
  "predecessorPrefix",
  "schemaVersion",
  "workspaceBindingDigest",
  "workspaceBindingIdentity",
  "workspaceBinding",
  "executionBasis",
] as const);

function leafExecutionAuthorityBody(
  value: LeafExecutionAuthority,
): LeafExecutionAuthorityBody {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    authorityRef: _authorityRef,
    authorityDigest: _authorityDigest,
    ...body
  } = value;
  return body;
}

export function constructLeafExecutionAuthority(
  body: Readonly<LeafExecutionAuthorityBody>,
): Readonly<LeafExecutionAuthority> {
  const authorityDigest = sha256Canonical(body);
  const authority = deepFreeze({
    kind: "leaf_execution_authority" as const,
    schemaVersion: "5.0.0" as const,
    authorityRef:
      `leaf-execution-authority://abiogenesis/${authorityDigest.slice("sha256:".length)}`,
    authorityDigest,
    ...body,
  });
  if (!isLeafExecutionAuthority(authority)) {
    throw new TypeError("leaf execution authority is not a closed exact carrier");
  }
  return authority;
}

export function isLeafExecutionAuthority(
  value: unknown,
): value is Readonly<LeafExecutionAuthority> {
  try {
    if (
      !isRecord(value) ||
      !hasExactDataFields(value, LEAF_EXECUTION_AUTHORITY_FIELDS) ||
      value.kind !== "leaf_execution_authority" ||
      value.schemaVersion !== "5.0.0" ||
      !nonEmptyString(value.authorityRef) ||
      !isSha256Digest(value.authorityDigest) ||
      !nonEmptyString(value.actorRef) ||
      !isRecord(value.workspaceBinding) ||
      value.workspaceBinding.kind !== "workspace_binding" ||
      value.workspaceBinding.bindingId !== value.workspaceBindingIdentity ||
      value.workspaceBinding.bindingDigest !== value.workspaceBindingDigest ||
      !nonEmptyString(value.workspaceBindingIdentity) ||
      !isSha256Digest(value.workspaceBindingDigest) ||
      !isRecord(value.executionBasis) ||
      value.executionBasis.kind !== "execution_basis" ||
      value.executionBasis.basisRef !== value.executionBasisRef ||
      value.executionBasis.basisDigest !== value.executionBasisDigest ||
      !nonEmptyString(value.executionBasisRef) ||
      !isSha256Digest(value.executionBasisDigest) ||
      !nonEmptyString(value.programRef) ||
      !isSha256Digest(value.programDigest) ||
      !isRecord(value.programPublication) ||
      !nonEmptyString(value.graphFunctionRef) ||
      !isSha256Digest(value.graphFunctionDigest) ||
      !nonEmptyString(value.cCallRef) ||
      !isSha256Digest(value.cCallDigest) ||
      !isRecord(value.cCall) ||
      value.cCall.kind !== "c_call" ||
      value.cCall.cCallRef !== value.cCallRef ||
      value.cCall.cCallDigest !== value.cCallDigest ||
      !validateDurablePrefixCoordinate(value.predecessorPrefix) ||
      !nonEmptyString(value.implementationSetRef) ||
      !isSha256Digest(value.implementationSetDigest) ||
      !isRecord(value.implementationSet) ||
      value.implementationSet.kind !== "admitted_implementation_set" ||
      value.implementationSet.implementationSetRef !== value.implementationSetRef ||
      value.implementationSet.implementationSetDigest !== value.implementationSetDigest ||
      !Array.isArray(value.implementationSet.rows) ||
      !nonEmptyString(value.leafResolutionCandidateRef) ||
      !isSha256Digest(value.leafResolutionCandidateDigest) ||
      !nonEmptyString(value.implementationResolutionRef) ||
      !isSha256Digest(value.implementationResolutionDigest) ||
      !isExactAdmittedImplementationRow(value.implementationResolution) ||
      !nonEmptyString(value.implementationBindingRef) ||
      !isSha256Digest(value.implementationBindingDigest) ||
      !nonEmptyString(value.implementationRef) ||
      !nonEmptyString(value.implementationOwnerRef) ||
      !((value.effectUri === WORKSITE_FILE_REPLACE_EFFECT_URI && value.handlerRef === WORKSITE_FILE_REPLACE_HANDLER_REF && value.handlerDigest === WORKSITE_FILE_REPLACE_HANDLER_DIGEST) ||
        (value.effectUri === WORKSITE_FILE_PARENTS_EFFECT_URI && value.handlerRef === WORKSITE_FILE_PARENTS_HANDLER_REF && value.handlerDigest === WORKSITE_FILE_PARENTS_HANDLER_DIGEST) ||
        (value.effectUri === nativeIds.effectUri && value.handlerRef === nativeIds.handlerRef && value.handlerDigest === NATIVE_WORKSPACE_WORK_HANDLER_DIGEST)) ||
      !isSha256Digest(value.handlerDigest) ||
      !nonEmptyString(value.capabilityGrantRef) ||
      !isSha256Digest(value.capabilityGrantDigest)
    ) {
      return false;
    }
    const authority = value as unknown as LeafExecutionAuthority;
    const digest = sha256Canonical(
      leafExecutionAuthorityBody(authority),
    );
    const resolutionDigest = sha256Canonical(
      authority.implementationResolution,
    );
    const resolutionMatches = authority.implementationSet.rows.filter((row) =>
      sha256Canonical(row) === resolutionDigest
    );
    return authority.authorityDigest === digest &&
      authority.authorityRef ===
        `leaf-execution-authority://abiogenesis/${digest.slice("sha256:".length)}` &&
      authority.implementationResolutionDigest === resolutionDigest &&
      sha256Canonical(authority.programPublication) ===
        authority.implementationResolution.publicationDigest &&
      authority.implementationResolutionRef ===
        `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}` &&
      resolutionMatches.length === 1 &&
      authority.implementationResolution.leafResolutionCandidateRef ===
        authority.leafResolutionCandidateRef &&
      authority.implementationResolution.leafResolutionCandidateDigest ===
        authority.leafResolutionCandidateDigest &&
      authority.implementationResolution.implementationBindingRef ===
        authority.implementationBindingRef &&
      authority.implementationResolution.implementationBindingDigest ===
        authority.implementationBindingDigest &&
      authority.implementationResolution.implementationRef ===
        authority.implementationRef &&
      authority.implementationResolution.implementationOwnerProductId ===
        authority.implementationOwnerRef &&
      isDeeplyFrozen(authority);
  } catch {
    return false;
  }
}

/** @internal What the leaf port adds to the worksite leaf gate: the admitted
 * row it matched, that row's implementation owner, the graph function it
 * resolved and the port's own implementation set. */
export interface WorksiteLeafPortCoordinates {
  readonly resolution: Readonly<AdmittedImplementationSet["rows"][number]>;
  readonly owner: Readonly<{
    coordinate: Readonly<{ productId: string; publicationDigest: string; declarationKind: string; declarationRef: string }>;
    install: Readonly<{ packageName: string; packageVersion: string }>;
  }>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly implementationSet: Readonly<AdmittedImplementationSet>;
}

/** @internal What a worksite realizer adds: the identity it is published under. */
export interface WorksiteLeafRealizerIdentity {
  readonly graphFunctionRef: string;
  readonly implementationBindingRef: string;
  readonly descriptor: Readonly<PackagedLeafImplementationDescriptor>;
}

/** @internal One evaluation of the worksite leaf gate, by the leaf port
 * (`port`) or by the selected realizer (`realizer`). `digests` carries the
 * request and resolution digests a caller computed before the gate. */
export type WorksiteLeafGate = Readonly<{
  authority: Readonly<LeafExecutionAuthority>;
  occurrence: Readonly<LeafExecutionOccurrence>;
  resolution: Readonly<LeafInvocationResolution>;
  inputDigest: string;
  digests?: Readonly<{ request: string; resolution: string }>;
}> & (
  | Readonly<{ effect: "file_replace"; request: Readonly<Record<string, JsonValue>> & WorksiteFileReplaceRequest }>
  | Readonly<{ effect: "file_parents"; request: Readonly<Record<string, JsonValue>> & WorksiteFileParentsRequest }>
) & (
  | Readonly<{ port: WorksiteLeafPortCoordinates; realizer?: undefined }>
  | Readonly<{ realizer: WorksiteLeafRealizerIdentity; port?: undefined }>
);

/** @internal What a realizer holds once the gate admits its authority. */
export interface WorksiteLeafHold {
  readonly executionBasis: Readonly<ExecutionBasis>;
  readonly implementationSet: Readonly<AdmittedImplementationSet>;
  readonly protectedInstallRoots: readonly string[];
  readonly conservationRoots: readonly string[];
}

/** @internal The file-parents plan check. Its module imports the realizers'
 * module, so the gate takes it from its caller. */
export type WorksiteFileParentsPlanCheck = typeof validateWorksiteFileParentsPlanAtPrefix;

/** @internal The three steps of the worksite leaf gate; `Held` is `true` for
 * the port and the held values for a realizer. */
export interface WorksiteLeafGateSteps<Held> {
  /** The comparisons that need no read: request and resolution digests, the
   * effect and handler, the occurrence, the call class and regime, and a
   * realizer's own identity. */
  readonly coordinates: () => boolean;
  /** Reads the owned runtime prefix with `requireCurrent: true` and checks the
   * phase, the execution basis and implementation set at that prefix and the
   * selected input; a realizer also checks the environment, the root basis
   * and the owner installs. `null` refuses. Only the prefix read is caught. */
  readonly current: (planCheck?: WorksiteFileParentsPlanCheck) => Held | null;
  /** The remaining comparisons between the authority, its basis, the request,
   * the call and the selected row. The file-parents realizer compares these
   * through its own authorization and does not call this step. */
  readonly remaining: () => boolean;
}

/**
 * @internal The worksite leaf gate: before a file-replace or file-parents leaf
 * performs its effect, the authority it was given must still be current. The
 * leaf port runs it as its pre-check and the realizer runs it again, nearest
 * its effect. Each site calls the steps in its own order: the port and the
 * file-replace realizer read first and compare after, so a read that throws
 * is still the port's recorded cause; the file-parents realizer compares
 * before it awaits its plan check's module and reads after.
 */
export function openWorksiteLeafGate(gate: WorksiteLeafGate & { port: WorksiteLeafPortCoordinates }):
  WorksiteLeafGateSteps<true>;
/** @internal */
export function openWorksiteLeafGate(gate: WorksiteLeafGate & { realizer: WorksiteLeafRealizerIdentity }):
  WorksiteLeafGateSteps<WorksiteLeafHold>;
/** @internal */
export function openWorksiteLeafGate(gate: WorksiteLeafGate): WorksiteLeafGateSteps<WorksiteLeafHold | true> {
  const { authority, occurrence, resolution, inputDigest, digests, port, realizer } = gate;
  const parents = gate.effect === "file_parents";
  const effectUri = parents ? WORKSITE_FILE_PARENTS_EFFECT_URI : WORKSITE_FILE_REPLACE_EFFECT_URI;
  const selected = authority.implementationResolution;
  const coordinates = (): boolean =>
    (digests?.request ?? sha256Canonical(gate.request)) === inputDigest &&
    inputDigest === authority.executionBasis.rawInputDigest &&
    sha256Canonical(authority.executionBasis.rawInputValue) === inputDigest &&
    (digests?.resolution ?? sha256Canonical(resolution)) === authority.implementationResolutionDigest &&
    authority.effectUri === effectUri &&
    authority.handlerRef === (parents ? WORKSITE_FILE_PARENTS_HANDLER_REF : WORKSITE_FILE_REPLACE_HANDLER_REF) &&
    authority.handlerDigest === (parents ? WORKSITE_FILE_PARENTS_HANDLER_DIGEST : WORKSITE_FILE_REPLACE_HANDLER_DIGEST) &&
    authority.cCallRef === occurrence.cCallRef && authority.cCall.runId === occurrence.runId &&
    authority.cCall.graphCallId === occurrence.graphCallId && authority.cCall.frameId === occurrence.frameId &&
    authority.cCall.programLocusRef === occurrence.programLocusRef && authority.cCall.taskOrdinal === occurrence.taskOrdinal &&
    authority.cCall.attempt === occurrence.attempt && authority.cCall.callClass === "leaf" && authority.cCall.regime === "F_D" &&
    (realizer === undefined ||
      authority.graphFunctionRef === realizer.graphFunctionRef &&
      selected.implementationRef === realizer.descriptor.implementationRef &&
      selected.implementationBindingRef === realizer.implementationBindingRef &&
      selected.packageName === realizer.descriptor.packageName && selected.packageVersion === realizer.descriptor.packageVersion &&
      selected.modulePath === realizer.descriptor.modulePath && selected.namedSymbol === realizer.descriptor.namedSymbol &&
      selected.implementationDescriptorDigest === realizer.descriptor.descriptorDigest &&
      selected.computeRegime === realizer.descriptor.computeRegime &&
      selected.inputContractRef === realizer.descriptor.inputContractRef &&
      selected.outputContractRef === realizer.descriptor.outputContractRef &&
      selected.failureContractRef === realizer.descriptor.failureContractRef &&
      selected.refusalContractRef === realizer.descriptor.refusalContractRef);
  const current = (planCheck?: WorksiteFileParentsPlanCheck): WorksiteLeafHold | true | null => {
    let prefix: RuntimeEventPrefix;
    let runtimePrefix: RuntimeEventPrefix;
    try {
      // Pre-effect currentness stays explicit; the owned reader borrows only
      // the active owner and authenticates any other coordinate cold.
      prefix = readOwnedRuntimeEventPrefixAtDurablePrefix(authority.predecessorPrefix, { requireCurrent: true });
      runtimePrefix = selectRuntimeEventPrefixFromAuthority(prefix, { runId: authority.cCall.runId });
    } catch {
      return null;
    }
    const observe = () => gate.effect === "file_parents"
      ? planCheck!(prefix, gate.request, authority.programPublication)
      : worksiteSelectedOccurrenceInputCurrent(prefix, authority.cCall, gate.request);
    if (port !== undefined) {
      // The port builds the authorization, projects the phase and checks the
      // selected input before it decides; a throw from any of them is recorded.
      const authorizationKind = gate.effect === "file_parents"
        ? constructWorksiteFileParentsAuthorization({ workspaceBinding: authority.workspaceBinding, request: gate.request,
            executionBasis: authority.executionBasis, cCall: authority.cCall, implementationSet: authority.implementationSet }).kind
        : constructWorksiteEffectAuthorization({ workspaceBinding: authority.workspaceBinding, request: gate.request,
            executionBasis: authority.executionBasis, cCall: authority.cCall, implementationSet: authority.implementationSet }).kind;
      const phase = projectCCallCarrierPhaseAtPrefix(runtimePrefix, authority.cCall);
      const observationCurrent = observe();
      return authorizationKind === (parents ? "worksite_file_parents_authorization" : "worksite_effect_authorization") &&
        phase?.phase === "selected_no_evidence" && observationCurrent &&
        hasAdmittedExecutionBasisAtPrefix(prefix, authority.executionBasis) &&
        hasAdmittedImplementationSetAtPrefix(prefix, authority.implementationSet) ? true : null;
    }
    // A realizer: the file-replace realizer makes every read before it
    // decides; the file-parents realizer stops at its first failing check.
    const basis = rehydrateExecutionBasisAtPrefix(prefix, authority.executionBasisRef);
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, authority.implementationSetRef);
    const environment = projectExactPrefixWorkspaceEnvironment(authority.predecessorPrefix,
      { ref: authority.workspaceBindingIdentity, digest: authority.workspaceBindingDigest });
    const exact = environment.kind === "exact_prefix_workspace_environment" ? environment : null;
    const stateHeld = basis !== null && set !== null && exact !== null &&
      canonicalEquals(basis, authority.executionBasis) && canonicalEquals(set, authority.implementationSet) &&
      canonicalEquals(exact.workspaceBinding, authority.workspaceBinding) &&
      canonicalEquals(exact.workspaceAuthorityBasis, gate.request.workspaceAuthorityBasis);
    if (parents && !stateHeld) return null;
    const phase = projectCCallCarrierPhaseAtPrefix(runtimePrefix, authority.cCall)?.phase ?? null;
    if (parents && phase !== "selected_no_evidence") return null;
    const observationCurrent = observe();
    if (parents && !observationCurrent) return null;
    // The root basis: the walk up the parent bases at this prefix; a cycle refuses.
    let root: Readonly<ExecutionBasis> | null = basis;
    const seen = new Set<string>();
    while (root !== null && root.parentExecutionBasisRef !== null) {
      if (seen.has(root.basisRef)) { root = null; break; }
      seen.add(root.basisRef);
      root = rehydrateExecutionBasisAtPrefix(prefix, root.parentExecutionBasisRef);
    }
    const rootHeld = root !== null && root.programRef === authority.programRef && root.programDigest === authority.programDigest &&
      root.invocationAdmissionRef === authority.executionBasis.invocationAdmissionRef;
    if (parents && !rootHeld) return null;
    // The file-parents realizer reads the root invocation before it derives
    // the owner installs; the file-replace realizer reads it after.
    const readInvocation = () => root === null ? null : rehydrateInvocationAdmissionAtPrefix(prefix, root.invocationAdmissionRef);
    const parentsInvocation = parents ? readInvocation() : null;
    const installs = exact === null ? [] : exact.productInstalls;
    const programOwner = root === null || set === null || exact === null ? null
      : exactProgramOwnerInstall(exact, set.rows, root.graphFunctionRef, authority.programPublication.moduleRef,
          root.programRef, selected.publicationDigest, root.programDigest, authority.programPublication);
    const implementationOwners = installs.filter((install) => install.productId === selected.implementationOwnerProductId &&
      install.packageName === selected.packageName && install.packageVersion === selected.packageVersion &&
      install.contributionManifest.publicationBindings.filter((binding) =>
        binding.publicationDigest === selected.implementationPublicationDigest).length === 1);
    const graphOwners = installs.filter((install) => install.productId === selected.graphFunctionOwnerProductId &&
      install.contributionManifest.rows.filter((row) => row.kind === "graph_function" &&
        row.declarationOrContractRef === selected.graphFunctionRef && row.owningProductId === install.productId &&
        install.contributionManifest.publicationBindings.filter((binding) => binding.moduleRef === row.moduleRef &&
          binding.publicationDigest === selected.graphFunctionPublicationDigest).length === 1).length === 1);
    const invocation = parents ? parentsInvocation : readInvocation();
    const grant = invocation?.capabilityGrants[0];
    if (basis === null || set === null || !stateHeld || phase !== "selected_no_evidence" || !observationCurrent || !rootHeld ||
      invocation === null || invocation.capabilityGrants.length !== 1 || programOwner === null ||
      implementationOwners.length !== 1 || graphOwners.length !== 1 || grant === undefined ||
      !canonicalEquals(grant, gate.request.capabilityGrant) ||
      gate.request.capabilityGrant.definitionKey.memberKey !==
        (invocation.invocationVariant === "direct" ? "invoke" : invocation.invocationVariant)) return null;
    return {
      executionBasis: basis,
      implementationSet: set,
      protectedInstallRoots: installs.map((install) => install.installedRoot),
      conservationRoots: [...new Set([programOwner, ...graphOwners, ...implementationOwners]
        .map((install) => install.installedRoot))].sort(),
    };
  };
  const remaining = (): boolean => {
    const row = port === undefined ? selected : port.resolution;
    return authority.actorRef === authority.workspaceBinding.authorizedActorRef &&
      authority.actorRef === authority.executionBasis.actorRef &&
      (port === undefined ||
        authority.workspaceBindingIdentity === authority.executionBasis.workspaceBindingId &&
        authority.workspaceBindingDigest === authority.executionBasis.workspaceBindingDigest) &&
      authority.programRef === authority.executionBasis.programRef &&
      authority.programDigest === authority.executionBasis.programDigest &&
      authority.graphFunctionRef === authority.executionBasis.graphFunctionRef &&
      authority.graphFunctionDigest === authority.executionBasis.graphFunctionDigest &&
      (port === undefined ||
        port.graphFunction.name === authority.graphFunctionRef &&
        sha256Canonical(port.graphFunction) === authority.graphFunctionDigest &&
        port.graphFunction.effects.includes(effectUri)) &&
      gate.request.workspaceBindingIdentity === authority.workspaceBindingIdentity &&
      gate.request.workspaceBindingDigest === authority.workspaceBindingDigest &&
      gate.request.capabilityGrant.actorRef === authority.actorRef &&
      gate.request.capabilityGrant.grantRef === authority.capabilityGrantRef &&
      gate.request.capabilityGrant.grantDigest === authority.capabilityGrantDigest &&
      gate.request.capabilityGrant.scopeRef === authority.workspaceBindingIdentity &&
      gate.request.capabilityGrant.scopeDigest === authority.workspaceBindingDigest &&
      authority.cCall.basisId === authority.executionBasisRef &&
      authority.cCall.graphFunctionRef === authority.graphFunctionRef &&
      authority.cCall.implementationSetRef === authority.implementationSetRef &&
      authority.cCall.implementationRequirementKey === row.requirementKey &&
      authority.cCall.implementationBindingRef === row.implementationBindingRef &&
      authority.cCall.implementationRef === row.implementationRef &&
      authority.cCall.inputContractRef === row.inputContractRef &&
      authority.cCall.outputContractRef === row.outputContractRef &&
      authority.cCall.failureContractRef === row.failureContractRef &&
      authority.cCall.refusalContractRef === row.refusalContractRef &&
      (port === undefined
        ? authority.cCall.programLocusRef === selected.programLocusRef &&
          authority.graphFunctionRef === selected.graphFunctionRef &&
          authority.graphFunctionDigest === selected.graphFunctionDigest &&
          authority.implementationSetRef === authority.executionBasis.implementationSetRef &&
          authority.implementationSetDigest === authority.executionBasis.implementationSetDigest
        : authority.implementationSetRef === port.implementationSet.implementationSetRef &&
          authority.implementationSetDigest === port.implementationSet.implementationSetDigest &&
          canonicalEquals(authority.implementationSet, port.implementationSet) &&
          authority.implementationResolutionRef === `implementation-resolution://abiogenesis/${
            authority.implementationResolutionDigest.slice("sha256:".length)}` &&
          authority.leafResolutionCandidateRef === row.leafResolutionCandidateRef &&
          authority.leafResolutionCandidateDigest === row.leafResolutionCandidateDigest &&
          authority.implementationBindingRef === row.implementationBindingRef &&
          authority.implementationBindingDigest === row.implementationBindingDigest &&
          authority.implementationRef === row.implementationRef &&
          authority.implementationOwnerRef === row.implementationOwnerProductId &&
          authority.implementationOwnerRef === port.owner.coordinate.productId &&
          row.implementationPublicationDigest === port.owner.coordinate.publicationDigest &&
          row.packageName === port.owner.install.packageName &&
          row.packageVersion === port.owner.install.packageVersion &&
          port.owner.coordinate.declarationKind === "implementation_binding" &&
          port.owner.coordinate.declarationRef === row.implementationBindingRef);
  };
  return { coordinates, current, remaining };
}
