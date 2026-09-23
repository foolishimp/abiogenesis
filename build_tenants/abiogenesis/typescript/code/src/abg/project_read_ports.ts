import { isRecord } from "../shared/admission_predicates.js";
import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from "../shared/canonical_json.js";
import { projectNativeLivenessRead } from "./runtime_liveness.js";
import { projectRuntimeFailureEvidenceAtPrefix } from "./runtime_failure.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { reconstructHistoricalDeclarationCatalog, resolveExecutionDeclarationClosure, selectExactClosureContract } from "../product/declaration_closure.js";
import { projectExactPrefixWorkspaceEnvironment, projectAdmittedProductInstallByAdmissionEventRef } from "./environment_admission.js";
import { projectAdmittedCCallStateAtPrefix, projectCurrentChildParentCCallAtPrefix } from "./c_call.js";
import { rehydrateAdmittedImplementationSetAtPrefix, rehydrateAdmittedInteractionSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { rehydrateOpenedTraversalScopeAtPrefix, projectOpenedTraversalScopeClassAtPrefix, type OpenedTraversalScope } from "./open_call.js";
import { projectHistoricalTraversalRouteAtPrefix } from "./traversal_route.js";
import { isAbgTypedTerminalResult, isAbgHistoricalDeclarationProof, type AbgTypedTerminalResult, type AbgHistoricalDeclarationProof } from "./terminal_result_contracts.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  readRuntimeEventsAtDurablePrefix,
  captureDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from
  "./invocation_execution_truth.js";
import {
  projectRunQuiescence,
  projectRunSemanticReplayProjection,
  projectRunReplayContext,
  type ReplayCCallState,
  type ReplayRouteState,
  type ReplayState,
  type RunSemanticReplayProjection,
} from "./replay.js";

export const ABG_PROJECT_READ_MEMBER_KEYS = Object.freeze([
  "run_status",
  "graph_call_status",
  "run_result",
  "graph_call_result",
  "run_evidence",
  "graph_call_evidence",
  "result_evidence",
  "assessment_evidence",
  "witness_evidence",
  "workspace_replay",
  "run_replay",
  "graph_call_replay",
  "interaction_replay",
  "continuation_replay",
  "c_call_replay",
  "workspace_gaps",
  "run_gaps",
  "run_lawful_actions",
] as const);

export type AbgProjectReadMemberKey =
  (typeof ABG_PROJECT_READ_MEMBER_KEYS)[number];

/**
 * The durable coordinate is the JSON carrier. The owner validates its bytes
 * and constructs the nominal immutable prefix before any projection runs.
 */
export interface AbgProjectReadPacket<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> {
  readonly kind: "abg_project_read_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: K;
  readonly prefix: DurablePrefixCoordinate;
  readonly targetRef: string;
  readonly declarationProof?: AbgHistoricalDeclarationProof;
}

export type ProjectReadRefusalCode =
  | "invalid_history"
  | "invalid_packet"
  | "target_not_ready"
  | "target_absent";

export interface AbgProjectReadRefusal<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> {
  readonly kind: "abg_project_read_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly memberKey: K;
  readonly targetRef: string | null;
  readonly code: ProjectReadRefusalCode;
  readonly message: string;
}

export interface AbgProjectReadProjection<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> {
  readonly kind: "abg_project_read_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "projected";
  readonly memberKey: K;
  readonly targetRef: string;
  readonly prefixCoordinateDigest: Sha256Digest;
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly value: JsonValue;
}

export type AbgProjectReadResult<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> = AbgProjectReadProjection<K> | AbgProjectReadRefusal<K>;

interface PreparedRead<K extends AbgProjectReadMemberKey> {
  readonly packet: AbgProjectReadPacket<K>;
  readonly events: readonly RuntimeEvent[];
  readonly fullPrefix: ValidatedRuntimeEventPrefix;
  readonly fullCalculus: RuntimeEventCalculusProjection;
}

interface RunReadContext {
  readonly prefix: ValidatedRuntimeEventPrefix;
  readonly calculus: RuntimeEventCalculusProjection;
  readonly replay: ReplayState;
  readonly semanticReplay: RunSemanticReplayProjection;
}

export interface AbgRunTruthCoordinate {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

/**
 * Canonical typed ABG truth for one Run. Product owners consume this carrier;
 * it contains no Product result/nonterminal/refusal meaning.
 */
export interface AbgRunTruthProjection {
  readonly kind: "abg_run_truth_projection";
  readonly schemaVersion: "5.0.0";
  readonly prefixCoordinateDigest: Sha256Digest;
  readonly runtimeStatus: ReplayState["runtimeStatus"];
  readonly run: AbgRunTruthCoordinate;
  readonly workspaceBinding: AbgRunTruthCoordinate;
  readonly graphCall: AbgRunTruthCoordinate | null;
  readonly result: AbgRunTruthCoordinate | null;
  readonly terminalResult: AbgTypedTerminalResult | null;
  readonly stop: AbgRunTruthCoordinate | null;
  readonly gap: AbgRunTruthCoordinate | null;
  readonly interaction: AbgRunTruthCoordinate | null;
  readonly evidence: readonly AbgRunTruthCoordinate[];
  readonly replay: AbgRunTruthCoordinate;
}

export interface AbgRunTruthRefusal {
  readonly kind: "abg_run_truth_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code: ProjectReadRefusalCode;
  readonly targetRef: string;
  readonly message: string;
}

export type AbgRunTruthResult = AbgRunTruthProjection | AbgRunTruthRefusal;

interface CanonicalRunReadContext extends RunReadContext {
  readonly truth: AbgRunTruthProjection;
  readonly terminal: ReturnType<typeof terminalResult>;
}

interface GraphCallReadContext extends RunReadContext {
  readonly graphCallId: string;
  readonly eventAtoms: RunSemanticReplayProjection["eventAtoms"];
  readonly cCalls: readonly ReplayCCallState[];
  readonly routes: readonly ReplayRouteState[];
}

const ABSENT = Symbol("abg_project_read_target_absent");
const NOT_READY = Symbol("abg_project_read_target_not_ready");
type ProjectedValue = JsonValue | typeof ABSENT | typeof NOT_READY;

function hasExactDataFields(value: object, fields: readonly string[]): boolean {
  const actual = Reflect.ownKeys(value);
  if (actual.some((key) => typeof key !== "string")) return false;
  const actualStrings = (actual as string[]).sort();
  const expected = [...fields].sort();
  if (
    actualStrings.length !== expected.length ||
    actualStrings.some((field, index) => field !== expected[index])
  ) return false;
  return actualStrings.every((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    return descriptor !== undefined &&
      Object.hasOwn(descriptor, "value") &&
      !Object.hasOwn(descriptor, "get") &&
      !Object.hasOwn(descriptor, "set") &&
      descriptor.enumerable === true;
  });
}

function sameJson(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function one<T>(rows: readonly T[], label: string): T {
  if (rows.length !== 1) throw new TypeError(`terminal projection requires one exact ${label}`);
  return rows[0]!;
}

function eventRecord(event: RuntimeEvent): Readonly<Record<string, JsonValue>> {
  if (!isRecord(event.payload)) throw new TypeError("terminal event payload is not a record");
  return event.payload as Readonly<Record<string, JsonValue>>;
}

/** Reconstruct the existing scope carrier, then ask its native owner to verify
 * it. No current active-parent assumption is made at read time. */
function scopeForBasis(prefix: ValidatedRuntimeEventPrefix, basis: ExecutionBasis): OpenedTraversalScope {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const graph = one(events.filter((event) => event.kind === "graph_call_opened" &&
    event.basisId === basis.basisRef), "basis GraphCall");
  const frame = one(events.filter((event) => event.kind === "frame_opened" &&
    event.basisId === basis.basisRef && event.graphCallId === graph.graphCallId), "basis Frame");
  const run = one(events.filter((event) => event.kind === "run_segment_opened" &&
    event.runId === graph.runId), "Run opening");
  const g = eventRecord(graph), f = eventRecord(frame), r = eventRecord(run);
  if (g.graphFunctionRef !== basis.graphFunctionRef || g.graphFunctionDigest !== basis.graphFunctionDigest ||
      g.graphRef !== basis.graphRef || g.graphDigest !== basis.graphDigest ||
      g.executionBasisRef !== basis.basisRef || f.executionBasisRef !== basis.basisRef ||
      g.invocationRef !== basis.invocationRef || f.invocationRef !== basis.invocationRef) {
    throw new TypeError("scope differs from its admitted execution basis");
  }
  const body = {
    executionBasisRef: basis.basisRef, executionBasisDigest: basis.basisDigest,
    invocationAdmissionRef: basis.invocationAdmissionRef, invocationRef: basis.invocationRef,
    programRef: basis.programRef, graphFunctionRef: basis.graphFunctionRef, graphRef: basis.graphRef,
    runId: graph.runId!, runDigest: r.runDigest!, runOpenEventRef: run.eventId,
    graphCallId: graph.graphCallId!, graphCallDigest: g.graphCallDigest!, graphCallOpenEventRef: graph.eventId,
    frameId: frame.frameId!, frameDigest: f.frameDigest!, frameLineageId: f.frameLineageId!, frameOpenEventRef: frame.eventId,
  };
  const digest = sha256Canonical(body);
  const scope = rehydrateOpenedTraversalScopeAtPrefix(prefix, {
    ...body, scopeRef: `traversal-scope://abiogenesis/${digest.slice(7)}`, scopeDigest: digest,
  });
  if (scope === null || projectOpenedTraversalScopeClassAtPrefix(prefix, scope) !== basis.basisClass) {
    throw new TypeError("scope has no exact native root/child identity");
  }
  return scope;
}

/** The child proof is data. Admission history selects all authority, including
 * the historical parent frontier and the original root declaration closure. */
function terminalContract(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  basis: ExecutionBasis,
  scope: OpenedTraversalScope,
): AbgRunTruthCoordinate {
  const prefix = prepared.fullPrefix;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, basis.invocationAdmissionRef);
  if (invocation === null) throw new TypeError("terminal result lacks its exact invocation");
  const inherited = ["invocationAdmissionRef", "invocationRef", "workspaceBindingId", "workspaceBindingDigest",
    "catalogBasisRef", "catalogBasisDigest", "catalogViewId", "catalogViewDigest", "programRef", "programDigest"] as const;
  let root = basis;
  const chain: ExecutionBasis[] = [];
  const seen = new Set<string>();
  while (true) {
    if (seen.has(root.basisRef) || inherited.some((key) => root[key] !== invocation[key])) {
      throw new TypeError("terminal basis ancestry crosses the admitted invocation");
    }
    seen.add(root.basisRef);
    chain.push(root);
    if (root.basisClass === "root") break;
    if (root.basisClass !== "child" || root.parentExecutionBasisRef === null) {
      throw new TypeError("terminal child lacks an admitted root ancestry");
    }
    const parent = projectExactExecutionBasisAtPrefix(prefix, root.parentExecutionBasisRef);
    if (parent === null) throw new TypeError("terminal child parent basis is absent");
    const parentScope = scopeForBasis(prefix, parent);
    const admission = one(events.filter((event) => event.eventId === root.admissionEventRef), "child basis admission");
    const previous = events.find((event) => event.admissionOrdinal === admission.admissionOrdinal - 1);
    if (previous === undefined || root.parentCCallRef === null ||
        root.parentTraversalScopeRef !== parentScope.scopeRef || parentScope.runId !== scope.runId) {
      throw new TypeError("terminal child scope crosses the admitted parent");
    }
    const historical = validatedRuntimeEventPrefixThroughEvent(prefix, previous.eventId);
    const parentTruth = projectCurrentChildParentCCallAtPrefix(historical, {
      parentCCallRef: root.parentCCallRef, parentExecutionBasisRef: parent.basisRef,
      runId: parentScope.runId, graphCallId: parentScope.graphCallId, frameId: parentScope.frameId,
      childGraphFunctionRef: root.graphFunctionRef, admittedInputRef: root.rawInputAdmissionRef,
      admittedInputDigest: root.rawInputDigest,
    });
    if (parentTruth === null || !admission.causationEventRefs.includes(parentTruth.causationEventRef) ||
        !admission.causationEventRefs.includes(parentScope.frameOpenEventRef)) {
      throw new TypeError("terminal child was not selected at its historical parent frontier");
    }
    root = parent;
  }
  if (root.graphFunctionRef !== invocation.graphFunctionRef || root.graphFunctionDigest !== invocation.graphFunctionDigest ||
      root.parentExecutionBasisRef !== null || root.parentTraversalScopeRef !== null || root.parentCCallRef !== null ||
      root.resultContractRef !== invocation.outputContractRef || scopeForBasis(prefix, root).runId !== scope.runId) {
    throw new TypeError("terminal root differs from its admitted invocation contract");
  }
  if (basis.basisClass === "root") return truthCoordinate(invocation.outputContractRef, invocation.outputContractDigest);

  const proof = prepared.packet.declarationProof;
  if (proof === undefined || proof.kind !== "abg_historical_declaration_proof" || proof.schemaVersion !== "5.0.0" ||
      !hasExactDataFields(proof, ["kind", "schemaVersion", "catalog", "catalogView"])) {
    throw new TypeError("closed child requires exact historical declaration evidence");
  }
  const environment = projectExactPrefixWorkspaceEnvironment(prepared.packet.prefix,
    truthCoordinate(root.workspaceBindingId, root.workspaceBindingDigest));
  if (environment.kind !== "exact_prefix_workspace_environment") throw new TypeError("historical environment is absent");
  const invocationEvent = one(events.filter((event) => event.eventId === invocation.admissionEventRef), "invocation event");
  const installs = environment.productInstalls.map((install) =>
    projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth, install.admissionEventRef));
  const environmentEventRefs = [...environment.productInstalls.map((row) => row.admissionEventRef),
    environment.workspaceBinding.admissionEventRef];
  if (installs.some((install) => install === null) || environmentEventRefs.some((ref) =>
    events.filter((event) => event.eventId === ref && event.admissionOrdinal < invocationEvent.admissionOrdinal).length !== 1)) {
    throw new TypeError("declaration proof environment is not historical to the original invocation");
  }
  const { catalog, catalogView } = reconstructHistoricalDeclarationCatalog(proof, {
    workspaceBinding: environment.workspaceBindingCandidate, resolvedLock: environment.resolvedProductLock,
    installedProducts: installs.map((install) => install!.candidate),
  });
  if (catalog.basisDigest !== root.catalogBasisDigest ||
      `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice(7)}` !== root.catalogBasisRef ||
      `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice(7)}` !== root.catalogViewId ||
      catalogView.viewDigest !== root.catalogViewDigest) throw new TypeError("historical Catalog/View differs from the root basis");
  const closure = resolveExecutionDeclarationClosure(catalog, catalogView, root.programRef, root.graphFunctionRef);
  if (closure.kind !== "resolved_execution_declaration_closure") throw new TypeError("historical root declaration closure is absent");
  const program = one(closure.programPublication.programs.filter((row) => row.programRef === root.programRef), "root Program");
  if (sha256Canonical(program as unknown as JsonValue) !== root.programDigest) throw new TypeError("historical Program digest differs");
  const rootOutput = selectExactClosureContract(closure, root.resultContractRef);
  if (rootOutput === null || sha256Canonical(rootOutput.contract as unknown as JsonValue) !== invocation.outputContractDigest ||
      !sameJson(rootOutput.owner, invocation.outputContractOwner)) {
    throw new TypeError("historical declaration proof crosses the admitted root output owner");
  }
  const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, root.rootImplementationSetRef);
  const interactionSet = rehydrateAdmittedInteractionSetAtPrefix(prefix, root.rootInteractionSetRef);
  if (implementationSet === null || interactionSet === null ||
      implementationSet.implementationSetDigest !== root.rootImplementationSetDigest ||
      interactionSet.interactionSetDigest !== root.rootInteractionSetDigest ||
      implementationSet.invocationAdmissionRef !== invocation.invocationAdmissionRef ||
      interactionSet.invocationAdmissionRef !== invocation.invocationAdmissionRef ||
      implementationSet.programValidationRef !== root.programValidationRef ||
      implementationSet.catalogViewId !== invocation.catalogViewId || implementationSet.catalogViewDigest !== invocation.catalogViewDigest) {
    throw new TypeError("historical root sets are absent or cross the admitted invocation");
  }
  for (const child of chain) {
    const owner = one(closure.graphFunctionOwners.filter((row) => row.declarationRef === child.graphFunctionRef), "ancestral GraphFunction owner");
    const publication = one(closure.publications.filter((row) => row.moduleRef === owner.moduleRef &&
      row.owningProductId === owner.productId && modulePublicationSemanticDigest(row) === owner.publicationDigest), "GraphFunction publication");
    const graph = one(publication.graphFunctions.filter((row) => row.name === child.graphFunctionRef), "GraphFunction declaration");
    if (sha256Canonical(graph as unknown as JsonValue) !== child.graphFunctionDigest ||
        !program.callableMembership.includes(child.graphFunctionRef) || graph.outputs.length !== 1 ||
        graph.outputs[0] !== child.resultContractRef) throw new TypeError("child output is outside the admitted root declaration closure");
    if (child.basisClass === "root") continue;
    const inheritedSets = ["rootImplementationSetRef", "rootImplementationSetDigest", "rootInteractionSetRef", "rootInteractionSetDigest",
      "implementationSetRef", "implementationSetDigest", "interactionSetRef", "interactionSetDigest", "programValidationRef"] as const;
    const executable = implementationSet.rows.filter((row) => row.graphFunctionRef === child.graphFunctionRef)
      .sort((a, b) => compareUnicodeCodeUnits(a.requirementKey, b.requirementKey));
    const interactions = interactionSet.rows.filter((row) => row.graphFunctionRef === child.graphFunctionRef)
      .sort((a, b) => compareUnicodeCodeUnits(a.requirementKey, b.requirementKey));
    if (inheritedSets.some((key) => child[key] !== root[key]) ||
        !sameJson(child.localExecutableLeafKeys, executable.map((row) => row.requirementKey)) ||
        !sameJson(child.localInteractionLeafKeys, interactions.map((row) => row.requirementKey)) ||
        child.localImplementationSubsetDigest !== sha256Canonical({ rootImplementationSetRef: root.rootImplementationSetRef,
          rootImplementationSetDigest: root.rootImplementationSetDigest, executableLeafKeys: child.localExecutableLeafKeys, rows: executable } as unknown as JsonValue) ||
        child.localInteractionSubsetDigest !== sha256Canonical({ rootInteractionSetRef: root.rootInteractionSetRef,
          rootInteractionSetDigest: root.rootInteractionSetDigest, interactionLeafKeys: child.localInteractionLeafKeys, rows: interactions } as unknown as JsonValue)) {
      throw new TypeError("child subsets differ from their admitted root sets");
    }
    const closureOwner = one(closure.closureContractOwners.filter((row) => row.declarationRef === child.closureContractRef), "child closure owner");
    const closurePublication = one(closure.publications.filter((row) => row.moduleRef === closureOwner.moduleRef &&
      row.owningProductId === closureOwner.productId && modulePublicationSemanticDigest(row) === closureOwner.publicationDigest), "child closure publication");
    const declaration = one(closurePublication.closureContracts.filter((row) => row.closureContractRef === child.closureContractRef), "child closure contract");
    if (sha256Canonical(declaration as unknown as JsonValue) !== child.closureContractDigest ||
        declaration.closureScope !== "graph_call" || declaration.resultContractRef !== child.resultContractRef) {
      throw new TypeError("child closure contract differs from its admitted basis");
    }
  }
  const selected = selectExactClosureContract(closure, basis.resultContractRef);
  if (selected === null) throw new TypeError("child output contract has no unique historical owner");
  return truthCoordinate(selected.contract.contractRef, sha256Canonical(selected.contract as unknown as JsonValue));
}

/** The sole terminal carrier constructor. Inputs are owner-validated native
 * history, never a fixture result, caller-selected result, or ambient schema. */
function typedTerminalResult(
  prepared: PreparedRead<AbgProjectReadMemberKey>, context: RunReadContext,
  graphCallId: string, requireRunClosed: boolean,
): AbgTypedTerminalResult | null {
  const events = runtimeEventsFromValidatedPrefix(context.prefix);
  const closes = events.filter((event) => event.kind === "graph_call_closed" && event.aggregateId === graphCallId);
  if (closes.length === 0 || (requireRunClosed && context.replay.runtimeStatus !== "closed")) return null;
  const closed = one(closes, "GraphCall close"), closeBody = eventRecord(closed);
  const rows = graphCallRows(context, graphCallId);
  const terminal = terminalResult(rows.routes, rows.cCalls);
  if (terminal === null) throw new TypeError("closed scope lacks one exact terminal producer");
  const route = projectHistoricalTraversalRouteAtPrefix(context.prefix, terminal.route.admissionEventRef, prepared.fullPrefix);
  if (route === null || route.routeKind !== "terminal" || route.cCallRef === null || route.judgmentRef === null) {
    throw new TypeError("terminal route has no authenticated native owner");
  }
  const open = one(events.filter((event) => event.kind === "c_call_opened" && event.aggregateId === route.cCallRef), "terminal CCall opening");
  const fibre = one(events.filter((event) => event.kind === "c_call_fibre_selected" && event.aggregateId === route.cCallRef), "terminal CCall fibre");
  const resultEvent = one(events.filter((event) => event.kind === "c_call_result_admitted" && event.aggregateId === route.cCallRef), "terminal result admission");
  const judgmentEvent = one(events.filter((event) => event.kind === "c_call_judged" && event.aggregateId === route.cCallRef), "terminal judgment admission");
  const basis = open.basisId === undefined ? null : projectExactExecutionBasisAtPrefix(prepared.fullPrefix, open.basisId);
  if (basis === null || open.graphCallId !== graphCallId || open.runId !== context.replay.runId) throw new TypeError("terminal producer crosses scope or basis");
  const scope = scopeForBasis(prepared.fullPrefix, basis);
  if (scope.graphCallId !== graphCallId || scope.frameId !== open.frameId) throw new TypeError("terminal producer crosses native scope");
  const o = eventRecord(open), f = eventRecord(fibre);
  if (o.graphFunctionRef !== basis.graphFunctionRef || f.implementationSetRef !== basis.implementationSetRef) {
    throw new TypeError("terminal fibre differs from its admitted basis");
  }
  const outcome = projectAdmittedCCallStateAtPrefix(context.prefix, {
    ...o, ...f, kind: "c_call", schemaVersion: "5.0.0", runId: open.runId!,
    childGraphFunctionRef: o.childGraphFunctionRef ?? null, failureContractRef: o.failureContractRef ?? "",
    openedEventRef: open.eventId, fibreSelectedEventRef: fibre.eventId,
  }, { ...eventRecord(resultEvent), kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: resultEvent.eventId },
  { ...eventRecord(judgmentEvent), kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: judgmentEvent.eventId });
  if (outcome === null || outcome.result.resultClass !== "success" || outcome.judgment.judgment !== "advance" ||
      outcome.judgment.judgmentRef !== route.judgmentRef || outcome.result.contractRef !== basis.resultContractRef ||
      route.declarationRef !== basis.graphRef || route.declarationDigest !== basis.graphDigest ||
      route.sourceCursorRef !== o.cursorRef || route.sourceCursorDigest !== o.cursorDigest ||
      route.contractRef !== basis.transitionContractRef) throw new TypeError("terminal result, judgment and route do not join");
  const reached = one(events.filter((event) => event.kind === "terminal_reached" && event.graphCallId === graphCallId), "scope terminal fact");
  const routeEvent = one(events.filter((event) => event.eventId === route.admissionEventRef), "terminal route event");
  const body = eventRecord(reached);
  const { closureRef, closureDigest, ...closureBody } = body;
  const frameClosed = one(events.filter((event) => event.kind === "frame_closed" && event.eventId === closeBody.frameClosedEventRef), "terminal Frame close");
  if (sha256Canonical(closureBody) !== closureDigest || closureRef !== `closure://abiogenesis/${String(closureDigest).slice(7)}` ||
      body.cCallRef !== route.cCallRef || body.resultRef !== outcome.result.resultRef || body.judgmentRef !== route.judgmentRef ||
      body.routeRef !== route.routeRef || body.closureContractRef !== basis.closureContractRef ||
      body.closureContractDigest !== basis.closureContractDigest || body.terminalKind !== "completed" ||
      reached.basisId !== basis.basisRef || reached.frameId !== scope.frameId ||
      routeEvent.basisId !== basis.basisRef || routeEvent.graphCallId !== graphCallId || routeEvent.frameId !== scope.frameId ||
      !routeEvent.causationEventRefs.includes(judgmentEvent.eventId) ||
      !reached.causationEventRefs.includes(route.admissionEventRef) ||
      frameClosed.basisId !== basis.basisRef || frameClosed.frameId !== scope.frameId || frameClosed.graphCallId !== graphCallId ||
      eventRecord(frameClosed).closureContractRef !== basis.closureContractRef ||
      eventRecord(frameClosed).terminalReachedEventRef !== reached.eventId || !frameClosed.causationEventRefs.includes(reached.eventId) ||
      closed.basisId !== basis.basisRef || closeBody.closureContractRef !== basis.closureContractRef ||
      !closed.causationEventRefs.includes(frameClosed.eventId)) throw new TypeError("terminal closure facts do not join the selected producer");
  if (requireRunClosed) {
    const runClosed = one(events.filter((event) => event.kind === "run_closed"), "Run close");
    if (runClosed.basisId !== basis.basisRef || eventRecord(runClosed).graphCallClosedEventRef !== closed.eventId ||
        !runClosed.causationEventRefs.includes(closed.eventId)) throw new TypeError("Run close does not join its root terminal");
  }
  const contract = terminalContract(prepared, basis, scope);
  const value = deepFreeze({
    kind: "abg_typed_terminal_result" as const, schemaVersion: "5.0.0" as const,
    result: truthCoordinate(outcome.result.resultRef, outcome.result.resultDigest), contract,
    valueKind: outcome.result.valueKind, valueDigest: outcome.result.valueDigest, value: outcome.result.value,
    producer: { runRef: scope.runId, graphCallRef: scope.graphCallId, invocationAdmissionRef: basis.invocationAdmissionRef,
      program: truthCoordinate(basis.programRef, basis.programDigest), graphFunction: truthCoordinate(basis.graphFunctionRef, basis.graphFunctionDigest),
      executionBasis: truthCoordinate(basis.basisRef, basis.basisDigest), cCallRef: outcome.cCall.cCallRef,
      resultAdmissionEventRef: resultEvent.eventId, judgmentRef: outcome.judgment.judgmentRef,
      judgmentAdmissionEventRef: judgmentEvent.eventId, terminalRoute: truthCoordinate(route.routeRef, route.routeDigest) },
    projectionBasis: truthCoordinate(prepared.packet.prefix.eventLogRef, prepared.packet.prefix.coordinateDigest),
  });
  if (!isAbgTypedTerminalResult(value)) throw new TypeError("native terminal carrier differs from its closed schema");
  return value;
}

/** Internal reuse of the same R10 owner. No Public invocation or store acquisition. */
export function projectClosedGraphCallTerminalAtDurablePrefix(
  prefix: DurablePrefixCoordinate, graphCallId: string, declarationProof: AbgHistoricalDeclarationProof,
): AbgTypedTerminalResult | null {
  try {
    const prepared = prepareRead("graph_call_result", {kind:"abg_project_read_packet",schemaVersion:"5.0.0",
      memberKey:"graph_call_result",prefix,targetRef:graphCallId,declarationProof}, captureDurablePrefixCoordinate(prefix));
    if ("disposition" in prepared) return null;
    const runId = runIdForGraphCall(prepared,graphCallId);
    const context = runId === null ? null : runContext(prepared,runId);
    return context === null ? null : typedTerminalResult(prepared,context,graphCallId,false);
  } catch { return null; }
}

function refusal<K extends AbgProjectReadMemberKey>(
  memberKey: K,
  targetRef: string | null,
  code: ProjectReadRefusalCode,
  message: string,
): AbgProjectReadRefusal<K> {
  return deepFreeze({
    kind: "abg_project_read_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    memberKey,
    targetRef,
    code,
    message,
  });
}

function admitReadPacket<K extends AbgProjectReadMemberKey>(
  expectedMemberKey: K,
  supplied: AbgProjectReadPacket<K>,
): AbgProjectReadPacket<K> | AbgProjectReadRefusal<K> {
  let admitted: JsonValue;
  try {
    admitted = admitIJsonValue(supplied, "ABG project read packet");
  } catch {
    return refusal(
      expectedMemberKey,
      null,
      "invalid_packet",
      "ABG project read requires one exact I-JSON packet",
    );
  }
  if (
    !isRecord(admitted) ||
    !hasExactDataFields(admitted, [
      "kind",
      "memberKey",
      "prefix",
      "schemaVersion",
      "targetRef",
      ...(Object.hasOwn(admitted, "declarationProof") &&
          (expectedMemberKey === "graph_call_result" || expectedMemberKey === "graph_call_replay")
        ? ["declarationProof"] : []),
    ]) ||
    admitted.kind !== "abg_project_read_packet" ||
    admitted.schemaVersion !== "5.0.0" ||
    admitted.memberKey !== expectedMemberKey ||
    typeof admitted.targetRef !== "string" ||
    admitted.targetRef.length === 0 ||
    admitted.targetRef.trim() !== admitted.targetRef ||
    !isRecord(admitted.prefix) ||
    (Object.hasOwn(admitted, "declarationProof") && !isAbgHistoricalDeclarationProof(admitted.declarationProof))
  ) {
    return refusal(
      expectedMemberKey,
      null,
      "invalid_packet",
      "ABG project read packet differs from its exact owner contract",
    );
  }

  return admitted as unknown as AbgProjectReadPacket<K>;
}

function prepareRead<K extends AbgProjectReadMemberKey>(
  expectedMemberKey: K,
  supplied: AbgProjectReadPacket<K>,
  retainedPrefix?: DurablePrefixCoordinate,
): PreparedRead<K> | AbgProjectReadRefusal<K> {
  const admitted = admitReadPacket(expectedMemberKey, supplied);
  if ("code" in admitted) return admitted;
  let packet = admitted;
  try {
    // Only the internal owner may retain its exact immutable coordinate. Raw
    // packet admission and byte equality remain mandatory; copies stay cold.
    if (retainedPrefix !== undefined) {
      if (canonicalJson(retainedPrefix as unknown as JsonValue) !== canonicalJson(admitted.prefix as unknown as JsonValue))
        throw new TypeError("retained prefix differs from admitted read packet");
      packet = deepFreeze({ ...admitted, prefix: retainedPrefix });
    }
    const events = readRuntimeEventsAtDurablePrefix(packet.prefix);
    const fullPrefix = selectValidatedRuntimeEventPrefix(events);
    return deepFreeze({
      packet,
      events,
      fullPrefix,
      fullCalculus: deriveRuntimeEventCalculusProjection(fullPrefix),
    });
  } catch {
    return refusal(
      expectedMemberKey,
      packet.targetRef,
      "invalid_history",
      "ABG project read requires one valid immutable durable event prefix",
    );
  }
}

function runIds(prepared: PreparedRead<AbgProjectReadMemberKey>): readonly string[] {
  return Object.freeze([
    ...new Set(
      runtimeEventsFromValidatedPrefix(prepared.fullPrefix).flatMap((event) =>
        event.runId === undefined ? [] : [event.runId]
      ),
    ),
  ].sort());
}

function runContext(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  runId: string,
): RunReadContext | null {
  return projectRunReplayContext(prepared.fullPrefix, runId, prepared.packet.prefix);
}

function runIdForGraphCall(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  graphCallId: string,
): string | null {
  const candidates = new Set(
    runtimeEventsFromValidatedPrefix(prepared.fullPrefix).flatMap((event) =>
      event.graphCallId === graphCallId && event.runId !== undefined
        ? [event.runId]
        : []
    ),
  );
  return candidates.size === 1 ? [...candidates][0]! : null;
}

function graphCallRows(
  context: RunReadContext,
  graphCallId: string,
) {
  const eventAtoms = context.semanticReplay.eventAtoms.filter((event) =>
    event.graphCallId === graphCallId
  );
  const cCallRefs = new Set(
    eventAtoms.flatMap((event) =>
      event.aggregateType === "c_call" ? [event.aggregateId] : []
    ),
  );
  return deepFreeze({
    eventAtoms: Object.freeze(eventAtoms),
    cCalls: Object.freeze(
      context.replay.cCalls.filter((row) => cCallRefs.has(row.cCallRef)),
    ),
    routes: Object.freeze(
      context.replay.routes.filter((row) =>
        row.cCallRef !== null && cCallRefs.has(row.cCallRef)
      ),
    ),
  });
}

function graphCallContext(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  graphCallId: string,
): GraphCallReadContext | null {
  const runId = runIdForGraphCall(prepared, graphCallId);
  if (runId === null) return null;
  const context = canonicalRunContext(prepared, runId);
  if (context === null) return null;
  const rows = graphCallRows(context, graphCallId);
  if (!rows.eventAtoms.some((event) =>
    event.eventKind === "graph_call_opened" && event.aggregateId === graphCallId
  )) return null;
  return deepFreeze({ ...context, graphCallId, ...rows });
}

function terminalResult(
  routes: readonly ReplayRouteState[],
  cCalls: readonly ReplayCCallState[],
): Readonly<{ readonly route: ReplayRouteState; readonly result: ReplayCCallState }> | null {
  const terminalRoutes = routes.filter((route) => route.routeKind === "terminal");
  if (terminalRoutes.length !== 1 || terminalRoutes[0]!.cCallRef === null) return null;
  const results = cCalls.filter((row) =>
    row.cCallRef === terminalRoutes[0]!.cCallRef &&
    row.resultRef !== null &&
    row.resultDigest !== null
  );
  return results.length === 1
    ? deepFreeze({ route: terminalRoutes[0]!, result: results[0]! })
    : null;
}

function truthCoordinate(
  ref: string,
  digest: Sha256Digest,
): AbgRunTruthCoordinate {
  return deepFreeze({ ref, digest });
}

function physicalEventCoordinate(
  context: RunReadContext,
  eventId: string | null,
): AbgRunTruthCoordinate | null {
  if (eventId === null) return null;
  const physical = context.semanticReplay.physicalCoordinates.events.find(
    (event) => event.eventId === eventId,
  );
  return physical === undefined
    ? null
    : truthCoordinate(physical.eventId, physical.payloadDigest);
}

function canonicalRunContext(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): CanonicalRunReadContext | null {
  const context = runContext(prepared, targetRef);
  if (context === null) return null;
  const runAtoms = context.semanticReplay.eventAtoms.filter((atom) =>
    atom.eventKind === "run_segment_opened" &&
    atom.aggregateType === "run" && atom.aggregateId === targetRef
  );
  if (runAtoms.length !== 1) return null;
  const runAtom = runAtoms[0]!;
  const executionBasis = runAtom.basisId === null
    ? null
    : projectExactExecutionBasisAtPrefix(
        prepared.fullPrefix,
        runAtom.basisId,
      );
  if (
    executionBasis === null || executionBasis.basisClass !== "root" ||
    runAtom.parentAggregateId !== executionBasis.workspaceBindingId
  ) return null;
  const graphCallAtoms = context.replay.graphCallId === null
    ? []
    : context.semanticReplay.eventAtoms.filter((atom) =>
        atom.eventKind === "graph_call_opened" &&
        atom.aggregateType === "graph_call" &&
        atom.aggregateId === context.replay.graphCallId
      );
  if (context.replay.graphCallId !== null && graphCallAtoms.length !== 1) {
    return null;
  }
  const rootRows = context.replay.graphCallId === null
    ? null
    : graphCallRows(context, context.replay.graphCallId);
  const terminal = rootRows === null
    ? null
    : terminalResult(rootRows.routes, rootRows.cCalls);
  const typed = context.replay.graphCallId === null ? null
    : typedTerminalResult(prepared, context, context.replay.graphCallId, true);
  const gapRoute = [...context.replay.routes].reverse().find((route) =>
    route.routeKind === "gap_stop" &&
    route.nextActionProjectionRef !== undefined &&
    route.nextActionProjectionDigest !== undefined
  );
  const continuation = [...context.replay.continuations].reverse().find((row) =>
    row.status === "open" || row.status === "responded"
  );
  const evidence = context.semanticReplay.physicalCoordinates.events.map((event) =>
    truthCoordinate(event.eventId, event.payloadDigest)
  );
  if (evidence.length === 0) return null;
  const truth = deepFreeze({
    kind: "abg_run_truth_projection" as const,
    schemaVersion: "5.0.0" as const,
    prefixCoordinateDigest: prepared.packet.prefix.coordinateDigest,
    runtimeStatus: context.replay.runtimeStatus,
    run: truthCoordinate(targetRef, runAtoms[0]!.semanticPayloadDigest),
    workspaceBinding: truthCoordinate(
      executionBasis.workspaceBindingId,
      executionBasis.workspaceBindingDigest,
    ),
    graphCall: context.replay.graphCallId === null
      ? null
      : truthCoordinate(
          context.replay.graphCallId,
          graphCallAtoms[0]!.semanticPayloadDigest,
        ),
    result: typed?.result ?? null,
    terminalResult: typed,
    stop: physicalEventCoordinate(
      context,
      context.replay.runStoppedEventRef ??
        context.replay.runtimeFailureEventRef,
    ),
    gap: gapRoute?.nextActionProjectionRef === undefined ||
        gapRoute.nextActionProjectionDigest === undefined
      ? null
      : truthCoordinate(
          gapRoute.nextActionProjectionRef,
          gapRoute.nextActionProjectionDigest,
        ),
    interaction: continuation === undefined
      ? null
      : truthCoordinate(continuation.requestRef, continuation.requestDigest),
    evidence,
    replay: truthCoordinate(
      context.replay.replayRef,
      context.replay.replayDigest,
    ),
  });
  return deepFreeze({ ...context, truth, terminal });
}

/**
 * Direct owner entry to the same canonical Run atom used by run project-read
 * members. The durable packet is admitted by the existing read path first.
 */
export function projectRunTruthAtDurablePrefix(
  prefix: DurablePrefixCoordinate,
  runId: string,
): AbgRunTruthResult {
  const prepared = prepareRead("run_replay", {
    kind: "abg_project_read_packet",
    schemaVersion: "5.0.0",
    memberKey: "run_replay",
    prefix,
    targetRef: runId,
  }, captureDurablePrefixCoordinate(prefix));
  if ("code" in prepared) {
    return deepFreeze({
      kind: "abg_run_truth_refusal" as const,
      schemaVersion: "5.0.0" as const,
      code: prepared.code,
      targetRef: runId,
      message: prepared.message,
    });
  }
  try {
    const context = canonicalRunContext(
      prepared as PreparedRead<AbgProjectReadMemberKey>, runId,
    );
    return context === null
    ? deepFreeze({
        kind: "abg_run_truth_refusal" as const,
        schemaVersion: "5.0.0" as const,
        code: "target_absent" as const,
        targetRef: runId,
        message: "ABG Run truth is absent from the selected admitted history",
      })
      : context.truth;
  } catch {
    return deepFreeze({ kind: "abg_run_truth_refusal" as const, schemaVersion: "5.0.0" as const,
      code: "invalid_history" as const, targetRef: runId,
      message: "ABG Run truth has no exact joined terminal history" });
  }
}

/** Source identity for the two GraphCall companions of the existing Run read
 * kernel. This does not evaluate or trust the optional child declaration proof. */
export function projectGraphCallSourceAtDurablePrefix(prefix: DurablePrefixCoordinate, graphCallId: string):
  Readonly<{ source: AbgRunTruthCoordinate; workspaceBinding: AbgRunTruthCoordinate }> | null {
  const prepared = prepareRead("graph_call_replay", { kind: "abg_project_read_packet", schemaVersion: "5.0.0",
    memberKey: "graph_call_replay", prefix, targetRef: graphCallId });
  if ("code" in prepared) return null;
  try {
    const context = graphCallContext(prepared, graphCallId);
    if (context === null) return null;
    return graphCallSource(prepared, context);
  } catch { return null; }
}

function graphCallSource(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  context: GraphCallReadContext,
) {
  const atom = one(context.eventAtoms.filter((row) => row.eventKind === "graph_call_opened" &&
    row.aggregateId === context.graphCallId), "GraphCall source");
  const basis = atom.basisId === null ? null : projectExactExecutionBasisAtPrefix(prepared.fullPrefix, atom.basisId);
  return basis === null ? null : deepFreeze({
    source: truthCoordinate(context.graphCallId, atom.semanticPayloadDigest),
    workspaceBinding: truthCoordinate(basis.workspaceBindingId, basis.workspaceBindingDigest),
  });
}

/** Retain the read owner's exact context across source authentication and
 * projection. The closure accepts only optional declaration proof, never a
 * caller-asserted context or another prefix. Source identity is proof-independent. */
export function prepareRunReadAtDurablePrefix(
  prefix: DurablePrefixCoordinate,
  memberKey: "run_status" | "run_result" | "run_replay" | "graph_call_result" | "graph_call_replay",
  targetRef: string,
) {
  const graphRead = memberKey === "graph_call_result" || memberKey === "graph_call_replay";
  const sourceMember = graphRead ? "graph_call_replay" : "run_replay";
  const prepared = prepareRead(sourceMember, {
    kind: "abg_project_read_packet", schemaVersion: "5.0.0", memberKey: sourceMember, prefix, targetRef,
  }, captureDurablePrefixCoordinate(prefix));
  if ("code" in prepared) return null;
  try {
    const run = graphRead ? null : canonicalRunContext(prepared, targetRef);
    const graph = graphRead ? graphCallContext(prepared, targetRef) : null;
    const source = graph !== null ? graphCallSource(prepared, graph)
      : run === null ? null : { source: run.truth.run, workspaceBinding: run.truth.workspaceBinding };
    if (source === null) return null;
    return Object.freeze({ ...source,
      project: (declarationProof?: AbgHistoricalDeclarationProof) => {
        const packet = admitReadPacket(memberKey, {
          ...prepared.packet, memberKey,
          ...(declarationProof === undefined ? {} : { declarationProof }),
        });
        if ("code" in packet) return packet;
        const selected = { ...prepared, packet };
        return projectPreparedRead(selected, () => {
          switch (memberKey) {
            case "run_status": return projectRunStatus(selected, targetRef, run);
            case "run_result": return projectRunResult(selected, targetRef, run);
            case "run_replay": return projectRunReplay(selected, targetRef, run);
            case "graph_call_result": return projectGraphCallResult(selected, targetRef, graph);
            case "graph_call_replay": return projectGraphCallReplay(selected, targetRef, graph);
          }
        });
      },
    });
  } catch { return null; }
}

function graphCallStatus(context: GraphCallReadContext): ReplayState["runtimeStatus"] {
  if (context.eventAtoms.some((event) => event.eventKind === "graph_call_closed" && event.aggregateId === context.graphCallId)) return "closed";
  return holdsAt(context.calculus, constructRuntimeFluent({ name: "graph_call_active", identity: context.graphCallId }))
    ? "active" : context.replay.runtimeStatus;
}

function projectRunStatus(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
  context: CanonicalRunReadContext | null = canonicalRunContext(prepared, targetRef),
): ProjectedValue {
  if (context === null) return ABSENT;
  return {
    runId: targetRef,
    runtimeStatus: context.truth.runtimeStatus,
    replayRef: context.truth.replay.ref,
    replayDigest: context.truth.replay.digest,
    quiescence: projectRunQuiescence(context.prefix),
    holdsAt: context.calculus.holds,
  } as unknown as JsonValue;
}

function projectGraphCallStatus(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = graphCallContext(prepared, targetRef);
  if (context === null) return ABSENT;
  const closed = context.eventAtoms.some((event) =>
    event.eventKind === "graph_call_closed" && event.aggregateId === targetRef
  );
  const active = holdsAt(
    context.calculus,
    constructRuntimeFluent({ name: "graph_call_active", identity: targetRef }),
  );
  return {
    graphCallId: targetRef,
    runId: context.replay.runId,
    status: closed
      ? "closed"
      : active
        ? "active"
        : context.replay.runtimeStatus,
    replayRef: context.replay.replayRef,
    replayDigest: context.replay.replayDigest,
    eventAtoms: context.eventAtoms,
  } as unknown as JsonValue;
}

function projectRunResult(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
  context: CanonicalRunReadContext | null = canonicalRunContext(prepared, targetRef),
): ProjectedValue {
  if (context === null) return ABSENT;
  return context.truth.terminalResult === null
    ? ["active", "held", "gap_stopped"].includes(context.truth.runtimeStatus) ? NOT_READY : ABSENT
    : {
        runId: targetRef,
        runtimeStatus: context.truth.runtimeStatus,
        terminalRoute: context.terminal!.route,
        admittedResult: context.terminal!.result,
        terminalResult: context.truth.terminalResult,
        replayRef: context.truth.replay.ref,
        replayDigest: context.truth.replay.digest,
      } as unknown as JsonValue;
}

function projectGraphCallResult(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
  context: GraphCallReadContext | null = graphCallContext(prepared, targetRef),
): ProjectedValue {
  if (context === null) return ABSENT;
  const terminal = terminalResult(context.routes, context.cCalls);
  const typed = typedTerminalResult(prepared, context, targetRef, false);
  return typed === null
    ? ["active", "held", "gap_stopped"].includes(graphCallStatus(context)) ? NOT_READY : ABSENT
    : {
        graphCallId: targetRef,
        runId: context.replay.runId,
        terminalRoute: terminal!.route,
        admittedResult: terminal!.result,
        terminalResult: typed,
        replayRef: context.replay.replayRef,
        replayDigest: context.replay.replayDigest,
      } as unknown as JsonValue;
}

function evidenceProjection(
  context: RunReadContext,
  cCalls: readonly ReplayCCallState[],
): JsonValue {
  const cCallRefs = new Set(cCalls.map((row) => row.cCallRef));
  const evidenceRefs = [...new Set(cCalls.flatMap((row) => row.evidenceRefs))].sort();
  const eventAtoms = context.semanticReplay.eventAtoms.filter((event) =>
    event.aggregateType === "c_call" &&
    cCallRefs.has(event.aggregateId) &&
    ["c_call_evidenced", "c_call_judged", "c_call_result_admitted"].includes(
      event.eventKind,
    )
  );
  return {
    runId: context.replay.runId,
    evidenceRefs,
    cCalls,
    eventAtoms,
    physicalCoordinates: context.semanticReplay.physicalCoordinates,
    replayRef: context.replay.replayRef,
    replayDigest: context.replay.replayDigest,
  } as unknown as JsonValue;
}

function projectRunEvidence(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  return context === null
    ? ABSENT
    : {
        ...evidenceProjection(context, context.replay.cCalls) as Readonly<Record<string, JsonValue>>,
        runtimeFailures: projectRuntimeFailureEvidenceAtPrefix(context.prefix),
      };
}

function projectGraphCallEvidence(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = graphCallContext(prepared, targetRef);
  return context === null
    ? ABSENT
    : evidenceProjection(context, context.cCalls);
}

function projectResultEvidence(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    const cCalls = context.replay.cCalls.filter((row) => row.resultRef === targetRef);
    return cCalls.length === 0 ? [] : [{ context, cCalls }];
  });
  return matches.length === 1
    ? evidenceProjection(matches[0]!.context, matches[0]!.cCalls)
    : ABSENT;
}

function projectWorkspaceReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const workspaceEvents = runtimeEventsFromValidatedPrefix(prepared.fullPrefix).filter(
    (event) => event.scopeClass === "workspace" && event.aggregateId === targetRef,
  );
  if (workspaceEvents.length === 0) return ABSENT;
  const replays = runIds(prepared).map((runId) =>
    projectRunSemanticReplayProjection(prepared.fullPrefix, runId, prepared.packet.prefix)
  );
  return {
    workspaceRef: targetRef,
    eventContractProjection: prepared.fullCalculus,
    workspaceEventRefs: workspaceEvents.map((event) => event.eventId),
    runReplays: replays,
  } as unknown as JsonValue;
}

function projectRunReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
  context: CanonicalRunReadContext | null = canonicalRunContext(prepared, targetRef),
): ProjectedValue {
  return context === null
    ? ABSENT
    : { ...context.semanticReplay, runtimeStatus: context.truth.runtimeStatus,
        terminalResult: context.truth.terminalResult } as unknown as JsonValue;
}

function projectGraphCallReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
  context: GraphCallReadContext | null = graphCallContext(prepared, targetRef),
): ProjectedValue {
  if (context === null) return ABSENT;
  const atomRefs = new Set(context.eventAtoms.map((event) => event.atomRef));
  return {
    graphCallId: targetRef,
    runId: context.replay.runId,
    runtimeStatus: graphCallStatus(context),
    terminalResult: typedTerminalResult(prepared, context, targetRef, false),
    eventAtoms: context.eventAtoms,
    relations: context.semanticReplay.relations.filter((edge) =>
      atomRefs.has(edge.sourceAtom) && atomRefs.has(edge.targetAtom)
    ),
    cCalls: context.cCalls,
    routes: context.routes,
    continuations: context.replay.continuations.filter((row) =>
      row.graphCallId === targetRef
    ),
    replayRef: context.replay.replayRef,
    replayDigest: context.replay.replayDigest,
  } as unknown as JsonValue;
}

function projectInteractionReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    return context.replay.continuations
      .filter((row) => row.requestRef === targetRef)
      .map((continuation) => ({ context, continuation }));
  });
  return matches.length === 1
    ? {
        interactionRef: targetRef,
        continuation: matches[0]!.continuation,
        replayRef: matches[0]!.context.replay.replayRef,
        replayDigest: matches[0]!.context.replay.replayDigest,
      } as unknown as JsonValue
    : ABSENT;
}

function projectContinuationReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    return context.replay.continuations
      .filter((row) => row.continuationRef === targetRef)
      .map((continuation) => ({ context, continuation }));
  });
  return matches.length === 1
    ? {
        continuationRef: targetRef,
        continuation: matches[0]!.continuation,
        replayRef: matches[0]!.context.replay.replayRef,
        replayDigest: matches[0]!.context.replay.replayDigest,
      } as unknown as JsonValue
    : ABSENT;
}

function projectCCallReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    return context.replay.cCalls
      .filter((row) => row.cCallRef === targetRef)
      .map((cCall) => ({ context, cCall }));
  });
  if (matches.length !== 1) return ABSENT;
  return {
    cCallRef: targetRef,
    cCall: matches[0]!.cCall,
    eventAtoms: matches[0]!.context.semanticReplay.eventAtoms.filter((event) =>
      event.aggregateType === "c_call" && event.aggregateId === targetRef
    ),
    replayRef: matches[0]!.context.replay.replayRef,
    replayDigest: matches[0]!.context.replay.replayDigest,
  } as unknown as JsonValue;
}

function gapRows(context: RunReadContext): readonly ReplayRouteState[] {
  return Object.freeze(context.replay.routes.filter((route) =>
    route.routeKind === "gap_stop" &&
    route.nextActionProjection?.disposition === "no_action"
  ));
}

function projectWorkspaceGaps(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const workspaceEvents = runtimeEventsFromValidatedPrefix(prepared.fullPrefix).filter(
    (event) => event.scopeClass === "workspace" && event.aggregateId === targetRef,
  );
  if (workspaceEvents.length === 0) return ABSENT;
  return {
    workspaceRef: targetRef,
    runs: runIds(prepared).flatMap((runId) => {
      const context = canonicalRunContext(prepared, runId);
      return context === null ? [] : [{ runId, gaps: gapRows(context) }];
    }),
  } as unknown as JsonValue;
}

function projectRunGaps(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  return context === null
    ? ABSENT
    : { runId: targetRef, gaps: gapRows(context) } as unknown as JsonValue;
}

function projectRunLawfulActions(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  if (context === null) return ABSENT;
  return {
    runId: targetRef,
    lawfulActions: context.replay.routes.flatMap((route) =>
      route.nextActionProjection?.disposition === "selected"
        ? [{
            routeRef: route.routeRef,
            projectionRef: route.nextActionProjectionRef!,
            projectionDigest: route.nextActionProjectionDigest!,
            action: route.nextActionProjection,
          }]
        : []
    ),
  } as unknown as JsonValue;
}

function projectValue(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  memberKey: AbgProjectReadMemberKey,
  targetRef: string,
): ProjectedValue {
  switch (memberKey) {
    case "run_status":
      return projectRunStatus(prepared, targetRef);
    case "graph_call_status":
      return projectGraphCallStatus(prepared, targetRef);
    case "run_result":
      return projectRunResult(prepared, targetRef);
    case "graph_call_result":
      return projectGraphCallResult(prepared, targetRef);
    case "run_evidence":
      return projectRunEvidence(prepared, targetRef);
    case "graph_call_evidence":
      return projectGraphCallEvidence(prepared, targetRef);
    case "result_evidence":
      return projectResultEvidence(prepared, targetRef);
    case "assessment_evidence":
    case "witness_evidence":
      // D11/D12 have no admitted owner event in the frozen Wave 2 basis.
      return ABSENT;
    case "workspace_replay":
      return projectWorkspaceReplay(prepared, targetRef);
    case "run_replay":
      return projectRunReplay(prepared, targetRef);
    case "graph_call_replay":
      return projectGraphCallReplay(prepared, targetRef);
    case "interaction_replay":
      return projectInteractionReplay(prepared, targetRef);
    case "continuation_replay":
      return projectContinuationReplay(prepared, targetRef);
    case "c_call_replay":
      return projectCCallReplay(prepared, targetRef);
    case "workspace_gaps":
      return projectWorkspaceGaps(prepared, targetRef);
    case "run_gaps":
      return projectRunGaps(prepared, targetRef);
    case "run_lawful_actions":
      return projectRunLawfulActions(prepared, targetRef);
  }
}

function project<K extends AbgProjectReadMemberKey>(
  expectedMemberKey: K,
  packet: AbgProjectReadPacket<K>,
): AbgProjectReadResult<K> {
  const prepared = prepareRead(expectedMemberKey, packet);
  if ("code" in prepared) return prepared;
  return projectPreparedRead(prepared, () => projectValue(
    prepared as PreparedRead<AbgProjectReadMemberKey>, expectedMemberKey, prepared.packet.targetRef,
  ));
}

function projectPreparedRead<K extends AbgProjectReadMemberKey>(
  prepared: PreparedRead<K>,
  projection: () => ProjectedValue,
): AbgProjectReadResult<K> {
  const expectedMemberKey = prepared.packet.memberKey;
  let projected: ProjectedValue;
  try {
    projected = projection();
  } catch {
    return refusal(
      expectedMemberKey,
      prepared.packet.targetRef,
      "invalid_history",
      "ABG project read owner projectors refused the durable event history",
    );
  }
  if (projected === ABSENT) {
    return refusal(
      expectedMemberKey,
      prepared.packet.targetRef,
      "target_absent",
      "ABG project read target is absent from the selected admitted history",
    );
  }
  if (projected === NOT_READY) return refusal(expectedMemberKey, prepared.packet.targetRef,
    "target_not_ready", "selected scope has no terminal result at this prefix");
  const livenessMember = expectedMemberKey.endsWith("_status") || expectedMemberKey.endsWith("_replay") ||
    expectedMemberKey.endsWith("_gaps") || expectedMemberKey === "run_lawful_actions";
  const nativeLiveness = livenessMember ? projectNativeLivenessRead(prepared.fullPrefix,
    expectedMemberKey.startsWith("run_") ? prepared.packet.targetRef :
      expectedMemberKey.startsWith("graph_call_") ? runtimeEventsFromValidatedPrefix(prepared.fullPrefix)
        .find(event => event.kind === "graph_call_opened" && event.aggregateId === prepared.packet.targetRef)?.runId ?? null : null,
    expectedMemberKey.startsWith("graph_call_") ? prepared.packet.targetRef : undefined) : null;
  const value = admitIJsonValue(nativeLiveness === null ? projected :
    { ...(projected as Readonly<Record<string, JsonValue>>), nativeLiveness }, "ABG project read projection");
  const body = {
    memberKey: expectedMemberKey,
    targetRef: prepared.packet.targetRef,
    prefixCoordinateDigest: prepared.packet.prefix.coordinateDigest,
    value,
  };
  const projectionDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "abg_project_read_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    ...body,
    projectionRef:
      `project-read://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  });
}

export const RunProjectionPort = Object.freeze({
  run_status: (packet: AbgProjectReadPacket<"run_status">) =>
    project("run_status", packet),
  run_result: (packet: AbgProjectReadPacket<"run_result">) =>
    project("run_result", packet),
  run_evidence: (packet: AbgProjectReadPacket<"run_evidence">) =>
    project("run_evidence", packet),
  run_replay: (packet: AbgProjectReadPacket<"run_replay">) =>
    project("run_replay", packet),
  run_gaps: (packet: AbgProjectReadPacket<"run_gaps">) =>
    project("run_gaps", packet),
  run_lawful_actions: (
    packet: AbgProjectReadPacket<"run_lawful_actions">,
  ) => project("run_lawful_actions", packet),
});

export const GraphCallProjectionPort = Object.freeze({
  graph_call_status: (packet: AbgProjectReadPacket<"graph_call_status">) =>
    project("graph_call_status", packet),
  graph_call_result: (packet: AbgProjectReadPacket<"graph_call_result">) =>
    project("graph_call_result", packet),
  graph_call_evidence: (
    packet: AbgProjectReadPacket<"graph_call_evidence">,
  ) => project("graph_call_evidence", packet),
  graph_call_replay: (packet: AbgProjectReadPacket<"graph_call_replay">) =>
    project("graph_call_replay", packet),
});

export const ResultProjectionPort = Object.freeze({
  evidence: (packet: AbgProjectReadPacket<"result_evidence">) =>
    project("result_evidence", packet),
});

export const AssessmentProjectionPort = Object.freeze({
  evidence: (packet: AbgProjectReadPacket<"assessment_evidence">) =>
    project("assessment_evidence", packet),
});

export const WitnessProjectionPort = Object.freeze({
  evidence: (packet: AbgProjectReadPacket<"witness_evidence">) =>
    project("witness_evidence", packet),
});

export const WorkspaceProjectionPort = Object.freeze({
  workspace_replay: (packet: AbgProjectReadPacket<"workspace_replay">) =>
    project("workspace_replay", packet),
  workspace_gaps: (packet: AbgProjectReadPacket<"workspace_gaps">) =>
    project("workspace_gaps", packet),
});

export const InteractionProjectionPort = Object.freeze({
  replay: (packet: AbgProjectReadPacket<"interaction_replay">) =>
    project("interaction_replay", packet),
});

export const ContinuationProjectionPort = Object.freeze({
  replay: (packet: AbgProjectReadPacket<"continuation_replay">) =>
    project("continuation_replay", packet),
});

export const CCallProjectionPort = Object.freeze({
  replay: (packet: AbgProjectReadPacket<"c_call_replay">) =>
    project("c_call_replay", packet),
});

export const ABG_PROJECT_READ_OWNER_PORTS = Object.freeze({
  run_status: Object.freeze({ project: RunProjectionPort.run_status }),
  graph_call_status: Object.freeze({
    project: GraphCallProjectionPort.graph_call_status,
  }),
  run_result: Object.freeze({ project: RunProjectionPort.run_result }),
  graph_call_result: Object.freeze({
    project: GraphCallProjectionPort.graph_call_result,
  }),
  run_evidence: Object.freeze({ project: RunProjectionPort.run_evidence }),
  graph_call_evidence: Object.freeze({
    project: GraphCallProjectionPort.graph_call_evidence,
  }),
  result_evidence: Object.freeze({ project: ResultProjectionPort.evidence }),
  assessment_evidence: Object.freeze({
    project: AssessmentProjectionPort.evidence,
  }),
  witness_evidence: Object.freeze({ project: WitnessProjectionPort.evidence }),
  workspace_replay: Object.freeze({
    project: WorkspaceProjectionPort.workspace_replay,
  }),
  run_replay: Object.freeze({ project: RunProjectionPort.run_replay }),
  graph_call_replay: Object.freeze({
    project: GraphCallProjectionPort.graph_call_replay,
  }),
  interaction_replay: Object.freeze({
    project: InteractionProjectionPort.replay,
  }),
  continuation_replay: Object.freeze({
    project: ContinuationProjectionPort.replay,
  }),
  c_call_replay: Object.freeze({ project: CCallProjectionPort.replay }),
  workspace_gaps: Object.freeze({
    project: WorkspaceProjectionPort.workspace_gaps,
  }),
  run_gaps: Object.freeze({ project: RunProjectionPort.run_gaps }),
  run_lawful_actions: Object.freeze({
    project: RunProjectionPort.run_lawful_actions,
  }),
});

export const ABG_PROJECT_READ_CONTRACTS = Object.freeze({
  run_status: RunProjectionPort.run_status,
  graph_call_status: GraphCallProjectionPort.graph_call_status,
  run_result: RunProjectionPort.run_result,
  graph_call_result: GraphCallProjectionPort.graph_call_result,
  run_evidence: RunProjectionPort.run_evidence,
  graph_call_evidence: GraphCallProjectionPort.graph_call_evidence,
  result_evidence: ResultProjectionPort.evidence,
  assessment_evidence: AssessmentProjectionPort.evidence,
  witness_evidence: WitnessProjectionPort.evidence,
  workspace_replay: WorkspaceProjectionPort.workspace_replay,
  run_replay: RunProjectionPort.run_replay,
  graph_call_replay: GraphCallProjectionPort.graph_call_replay,
  interaction_replay: InteractionProjectionPort.replay,
  continuation_replay: ContinuationProjectionPort.replay,
  c_call_replay: CCallProjectionPort.replay,
  workspace_gaps: WorkspaceProjectionPort.workspace_gaps,
  run_gaps: RunProjectionPort.run_gaps,
  run_lawful_actions: RunProjectionPort.run_lawful_actions,
});
