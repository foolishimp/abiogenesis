import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { WorksiteConstructionTask, WorksiteCandidateBundle, WorksiteFileReplaceVector, WorksiteConstructionResult } from "../product/worksite_construction.js";
import type { WorksitePreservedResultArtifact } from "../product/worksite_construction_recovery.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction_identity.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import { canonicalizeAuthoredGtlCarrier } from "./canonicalization.js";
import type { GraphFunction } from "./contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export const WORKSITE_CONSTRUCTION_GTL_IDS = Object.freeze({
  graphRef: "graph://abiogenesis/worksite/construction@5",
  nodeRef: "node://abiogenesis/worksite/construction/root@5",
  candidateLocusRef:
    "locus://abiogenesis/worksite/construction/candidate@5",
  candidateArmId: "arm://abiogenesis/worksite/construction/candidate-fp@5",
  joinLocusRef:
    "locus://abiogenesis/worksite/construction/authority-join@5",
  joinArmId:
    "arm://abiogenesis/worksite/construction/authority-join-fd@5",
  vectorApplicationGraphRef:
    "graph://abiogenesis/worksite/construction/vector-application@5",
  vectorApplicationNodeRef:
    "node://abiogenesis/worksite/construction/vector-application@5",
  reducerGraphRef:
    "graph://abiogenesis/worksite/construction/reduce@5",
  reducerNodeRef:
    "node://abiogenesis/worksite/construction/reduce@5",
  reducerLocusRef:
    "locus://abiogenesis/worksite/construction/reduce@5",
  reducerArmId:
    "arm://abiogenesis/worksite/construction/reduce-fd@5",
  batchRef: WORKSITE_CONSTRUCTION_IDS.batchRef,
});


const scope = "abiogenesis/worksite/preserved-result";
export const WORKSITE_PRESERVED_RESULT_IDS = Object.freeze({
  artifactContractRef: `contract://${scope}/artifact@5`,
  authenticateImplementationRef: `implementation://${scope}/authenticate@5`,
  authenticateBindingRef: `implementation-binding://${scope}/authenticate@5`,
  deriveImplementationRef: `implementation://${scope}/derive@5`,
  deriveBindingRef: `implementation-binding://${scope}/derive@5`,
  authenticatePredicateRef: `predicate://${scope}/authenticated@5`,
  derivePredicateRef: `predicate://${scope}/derived@5`,
  authenticateLocusRef: `locus://${scope}/authenticate@5`,
  deriveLocusRef: `locus://${scope}/derive@5`,
});
export const WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS: readonly string[] = Object.freeze([
  WORKSITE_PRESERVED_RESULT_IDS.authenticateImplementationRef, WORKSITE_PRESERVED_RESULT_IDS.deriveImplementationRef,
]);
export interface WorksitePreservedResultSource {
  readonly kind: "worksite_preserved_result_source";
  readonly schemaVersion: "5.0.0";
  readonly historicalPrefix: Readonly<DurablePrefixCoordinate>;
  readonly sourceCCallRef: string;
  readonly actorInvocationRef: string;
}
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exact(value: unknown, fields: readonly string[]): value is Record<string, unknown> {
  if (!record(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  const keys = Reflect.ownKeys(value);
  return keys.length === fields.length && keys.every(k => typeof k === "string" && fields.includes(k) &&
    Object.getOwnPropertyDescriptor(value, k)?.enumerable === true && "value" in Object.getOwnPropertyDescriptor(value, k)!);
}
const ref = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.trim() === x;
function prefixValid(value: unknown): value is DurablePrefixCoordinate {
  if (!exact(value, ["kind", "schemaVersion", "eventLogRef", "prefixLength", "prefixDigest", "storeIdentity", "coordinateDigest"]) ||
    value.kind !== "durable_prefix_coordinate" || value.schemaVersion !== "5.0.0" || !ref(value.eventLogRef) ||
    !value.eventLogRef.startsWith("file://") || !Number.isSafeInteger(value.prefixLength) || Number(value.prefixLength) <= 0 ||
    !isSha256Digest(value.prefixDigest) || !isSha256Digest(value.coordinateDigest) ||
    !exact(value.storeIdentity, ["device", "inode", "eventContractDigest"]) ||
    !Number.isSafeInteger(value.storeIdentity.device) || !Number.isSafeInteger(value.storeIdentity.inode) ||
    !isSha256Digest(value.storeIdentity.eventContractDigest)) return false;
  const { coordinateDigest, ...body } = value;
  return hash(body) === coordinateDigest;
}
export function constructWorksitePreservedResultSource(value: unknown): Readonly<WorksitePreservedResultSource> {
  if (!exact(value, ["kind", "schemaVersion", "historicalPrefix", "sourceCCallRef", "actorInvocationRef"]) ||
    value.kind !== "worksite_preserved_result_source" || value.schemaVersion !== "5.0.0" ||
    !prefixValid(value.historicalPrefix) || !ref(value.sourceCCallRef) || !ref(value.actorInvocationRef)) {
    throw new TypeError("preserved result requires one closed historical source selector");
  }
  return deepFreeze(value) as unknown as Readonly<WorksitePreservedResultSource>;
}
export function isWorksitePreservedResultSource(value: unknown): value is WorksitePreservedResultSource {
  try { constructWorksitePreservedResultSource(value); return true; } catch { return false; }
}


const recoveryIds = WORKSITE_PRESERVED_RESULT_IDS;

/** Caller-owned declaration; its closed selector is data, never a runtime grant. */
export function constructWorksitePreservedResultRecoveryGraphFunction(input: Readonly<{
  graphFunctionRef: string; source: WorksitePreservedResultSource;
}>): Readonly<GraphFunction> {
  if (!input.graphFunctionRef.startsWith("graph-function://") || input.graphFunctionRef.trim() !== input.graphFunctionRef ||
    [WORKSITE_CONSTRUCTION_IDS.graphFunctionRef, WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef,
      WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef, WORKSITE_CONSTRUCTION_IDS.fileReplaceGraphFunctionRef].some(ref => ref === input.graphFunctionRef)) {
    throw new TypeError("preserved recovery requires a distinct caller-owned GraphFunction identity");
  }
  const source = constructWorksitePreservedResultSource(input.source);
  const suffix = sha256Canonical({ graphFunctionRef: input.graphFunctionRef, source } as unknown as JsonValue).slice(7);
  const task = cCarrier<WorksiteConstructionTask>(WORKSITE_CONSTRUCTION_IDS.taskContractRef);
  const artifact = cCarrier<WorksitePreservedResultArtifact>(recoveryIds.artifactContractRef);
  const candidate = cCarrier<WorksiteCandidateBundle>(WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef);
  const vector = cCarrier<WorksiteFileReplaceVector>(WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef);
  const result = cCarrier<WorksiteConstructionResult>(WORKSITE_CONSTRUCTION_IDS.resultContractRef);
  const requirement = (bindingRef: string, inputContractRef: string, outputContractRef: string) => ({
    kind: "executable_leaf_requirement" as const, implementationBindingRef: bindingRef, inputContractRef, outputContractRef,
    evidenceContractRef: WORKSITE_CONSTRUCTION_IDS.evidenceContractRef, failureContractRef: WORKSITE_CONSTRUCTION_IDS.failureContractRef,
    refusalContractRef: WORKSITE_CONSTRUCTION_IDS.refusalContractRef, judgmentContractRef: WORKSITE_CONSTRUCTION_IDS.judgmentContractRef });
  const auth = C.of({ input: task, output: artifact, programLocusRef: recoveryIds.authenticateLocusRef, stageRole: "authenticate_preserved_result",
    fibre: "F_D", armId: "arm://abiogenesis/worksite/preserved-result/authenticate@5", compositionRef: null, vectorIndex: 0,
    judgmentPredicateRef: recoveryIds.authenticatePredicateRef, resultBearing: false,
    requirement: requirement(recoveryIds.authenticateBindingRef, WORKSITE_CONSTRUCTION_IDS.taskContractRef, recoveryIds.artifactContractRef) });
  const derive = C.of({ input: artifact, output: candidate, programLocusRef: recoveryIds.deriveLocusRef, stageRole: "derive_preserved_candidate",
    fibre: "F_D", armId: "arm://abiogenesis/worksite/preserved-result/derive@5", compositionRef: null, vectorIndex: 1,
    judgmentPredicateRef: recoveryIds.derivePredicateRef, resultBearing: false,
    requirement: requirement(recoveryIds.deriveBindingRef, recoveryIds.artifactContractRef, WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef) });
  const join = C.of({ input: candidate, output: vector, programLocusRef: WORKSITE_CONSTRUCTION_GTL_IDS.joinLocusRef, stageRole: "authority_join",
    fibre: "F_D", armId: WORKSITE_CONSTRUCTION_GTL_IDS.joinArmId, compositionRef: null, vectorIndex: 2,
    judgmentPredicateRef: WORKSITE_CONSTRUCTION_IDS.joinJudgmentPredicateRef, resultBearing: false,
    requirement: requirement(WORKSITE_CONSTRUCTION_IDS.joinImplementationBindingRef, WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
      WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef) });
  const graphRef = `graph://abiogenesis/worksite/preserved-result/${suffix}`;
  const nodeRef = `node://abiogenesis/worksite/preserved-result/${suffix}`;
  return canonicalizeAuthoredGtlCarrier({ kind: "graph_function", name: input.graphFunctionRef, version: "5.0.0",
    environment: { requires: [WORKSITE_CONSTRUCTION_IDS.taskContractRef], provides: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
      carries: [recoveryIds.artifactContractRef, WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef, WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef] },
    inputs: [WORKSITE_CONSTRUCTION_IDS.taskContractRef], outputs: [WORKSITE_CONSTRUCTION_IDS.resultContractRef],
    template: { kind: "inline_graph", graphRef, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef], nodes: [{ nodeRef, nodeKind: "c_locus",
      term: C.compose(auth, C.compose(derive, C.compose(join, workflow.C(cGraphFunctionRef({
        graphFunctionRef: WORKSITE_CONSTRUCTION_IDS.vectorApplicationGraphFunctionRef, input: vector, output: result }))))) }], edges: [], applications: [] },
    effects: ["effect://abiogenesis/worksite/file.replace/v1"], declarations: {
      "abg.compute_regime": "F_D", "abg.preserved_result_source": canonicalJson(source as unknown as JsonValue),
      "abg.closure_contract": WORKSITE_CONSTRUCTION_IDS.closureContractRef,
      "abg.child_closure_contract": WORKSITE_CONSTRUCTION_IDS.childClosureContractRef,
      "abg.evidence_contract": WORKSITE_CONSTRUCTION_IDS.evidenceContractRef,
      "abg.failure_contract": WORKSITE_CONSTRUCTION_IDS.failureContractRef,
      "abg.judgment_contract": WORKSITE_CONSTRUCTION_IDS.judgmentContractRef,
      "abg.judgment_predicate": WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef,
      "abg.transition_contract": WORKSITE_CONSTRUCTION_IDS.transitionContractRef },
    tags: ["abiogenesis", "worksite", "construction", "preserved-result", "fd"] }, "graph_function");
}
export function worksitePreservedResultSourceOfGraphFunction(graphFunction: GraphFunction): Readonly<WorksitePreservedResultSource> | null {
  try {
    const source = constructWorksitePreservedResultSource(JSON.parse(graphFunction.declarations["abg.preserved_result_source"] ?? "null"));
    const expected = constructWorksitePreservedResultRecoveryGraphFunction({ graphFunctionRef: graphFunction.name, source });
    return canonicalJson(expected as unknown as JsonValue) === canonicalJson(graphFunction as unknown as JsonValue) ? source : null;
  } catch { return null; }
}
