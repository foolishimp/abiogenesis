import { WORKSITE_PRESERVED_RESULT_IDS, constructWorksitePreservedResultSource, isWorksitePreservedResultSource,
  type WorksitePreservedResultSource } from "../gtl/worksite_construction_recovery.js";
export { WORKSITE_PRESERVED_RESULT_IDS, WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS, constructWorksitePreservedResultSource,
  isWorksitePreservedResultSource, type WorksitePreservedResultSource } from "../gtl/worksite_construction_recovery.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSITE_CONSTRUCTION_IDS, constructWorksiteCandidateBundle, constructWorksiteConstructionWorkerResult,
  isWorksiteConstructionTask, type WorksiteConstructionTask, type WorksiteConstructionWorkerResult } from "./worksite_construction.js";

const scope = "abiogenesis/worksite/preserved-result";
export interface PreservedProtocolRecord {
  readonly line: number;
  readonly startByte: number;
  readonly endByte: number;
  readonly digest: Sha256Digest;
}
export interface WorksitePreservedSourceProof {
  readonly sourceExecutionBasisRef: string;
  readonly sourceExecutionBasisDigest: Sha256Digest;
  readonly sourceRunId: string;
  readonly sourceAttempt: number;
  readonly requestDigest: Sha256Digest;
  readonly transportBindingRef: string;
  readonly transportBindingDigest: Sha256Digest;
  readonly processRef: string;
  readonly artifactEventRef: string;
  readonly originalResultRef: string;
  readonly originalResultDigest: Sha256Digest;
  readonly originalJudgmentRef: string;
  readonly originalJudgmentDigest: Sha256Digest;
  readonly assessedEnvelopeDigest: Sha256Digest;
  readonly artifactDigests: Readonly<Record<"output" | "prompt" | "stderr" | "stdout" | "transport", Sha256Digest>>;
  readonly artifactByteLengths: Readonly<Record<"output" | "prompt" | "stderr" | "stdout" | "transport", number>>;
  readonly stdoutChunkEventRefs: readonly string[];
  readonly proposal: Readonly<PreservedProtocolRecord>;
  readonly acknowledgment: Readonly<PreservedProtocolRecord>;
  readonly toolUseId: string;
  readonly sessionId: string;
}
export interface WorksitePreservedResultArtifactBody {
  readonly source: Readonly<WorksitePreservedResultSource>;
  readonly proof: Readonly<WorksitePreservedSourceProof>;
  readonly originalTask: Readonly<WorksiteConstructionTask>;
  readonly currentTask: Readonly<WorksiteConstructionTask>;
  readonly workerResult: Readonly<WorksiteConstructionWorkerResult>;
  readonly owner: Readonly<{ graphFunctionRef: string; executionBasisRef: string; executionBasisDigest: Sha256Digest; cCallRef: string }>;
}
export interface WorksitePreservedResultArtifact extends WorksitePreservedResultArtifactBody {
  readonly kind: "worksite_preserved_result_artifact";
  readonly schemaVersion: "5.0.0";
  readonly artifactRef: string;
  readonly artifactDigest: Sha256Digest;
  readonly targetJoin: readonly Readonly<{ originalTargetRef: string; currentTargetRef: string }>[];
}
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
const same = (a: unknown, b: unknown) => canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
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
/** This relation changes coordinates only; native bridge admission supplies meaning and authority. */
export function preservedWorksiteTargetJoin(original: WorksiteConstructionTask, current: WorksiteConstructionTask) {
  if (!isWorksiteConstructionTask(original) || !isWorksiteConstructionTask(current) ||
    !same(original.workspaceAuthorityBasis, current.workspaceAuthorityBasis) || original.targets.length !== current.targets.length ||
    original.workspaceBinding.workspaceId !== current.workspaceBinding.workspaceId) throw new TypeError("preserved source crosses worksite");
  const physical = (target: WorksiteConstructionTask["targets"][number]) => {
    const observation = target.predecessorObservation;
    return { uri: target.subject.subjectUri, path: target.subject.relativePath,
      territoryUri: target.territory.territoryUri, territoryRoot: target.territory.relativeRoot, operations: target.territory.operations,
      state: observation.state, ...(observation.state === "file" ? { fileIdentity: observation.fileIdentity,
        fileDigest: observation.fileDigest, byteLength: observation.byteLength } : {}) };
  };
  const used = new Set<string>();
  const rows = original.targets.map(target => {
    const matches = current.targets.filter(other => same(physical(target), physical(other)));
    if (matches.length !== 1 || used.has(matches[0]!.targetRef)) throw new TypeError("preserved targets require a physical bijection");
    used.add(matches[0]!.targetRef);
    return { originalTargetRef: target.targetRef, currentTargetRef: matches[0]!.targetRef };
  });
  return deepFreeze(rows);
}
const proofFields = ["sourceExecutionBasisRef", "sourceExecutionBasisDigest", "sourceRunId", "sourceAttempt", "requestDigest",
  "transportBindingRef", "transportBindingDigest", "processRef", "artifactEventRef", "originalResultRef", "originalResultDigest",
  "originalJudgmentRef", "originalJudgmentDigest", "assessedEnvelopeDigest", "artifactDigests", "artifactByteLengths",
  "stdoutChunkEventRefs", "proposal", "acknowledgment", "toolUseId", "sessionId"];
function validProof(value: unknown): value is WorksitePreservedSourceProof {
  if (!exact(value, proofFields)) return false;
  if (!["sourceExecutionBasisRef", "sourceRunId", "transportBindingRef", "processRef", "artifactEventRef", "originalResultRef",
    "originalJudgmentRef", "toolUseId", "sessionId"].every(k => ref(value[k])) ||
    !["sourceExecutionBasisDigest", "requestDigest", "transportBindingDigest", "originalResultDigest", "originalJudgmentDigest",
      "assessedEnvelopeDigest"].every(k => isSha256Digest(value[k])) || !Number.isSafeInteger(value.sourceAttempt) || Number(value.sourceAttempt) < 0 ||
    !exact(value.artifactDigests, ["output", "prompt", "stderr", "stdout", "transport"]) ||
    !Object.values(value.artifactDigests).every(isSha256Digest) ||
    !exact(value.artifactByteLengths, ["output", "prompt", "stderr", "stdout", "transport"]) ||
    !Object.values(value.artifactByteLengths).every(x => Number.isSafeInteger(x) && Number(x) >= 0) ||
    !Array.isArray(value.stdoutChunkEventRefs) || value.stdoutChunkEventRefs.length === 0 ||
    !value.stdoutChunkEventRefs.every(ref) || new Set(value.stdoutChunkEventRefs).size !== value.stdoutChunkEventRefs.length) return false;
  for (const row of [value.proposal, value.acknowledgment]) if (!exact(row, ["line", "startByte", "endByte", "digest"]) ||
    ![row.line, row.startByte, row.endByte].every(Number.isSafeInteger) || Number(row.line) < 1 || Number(row.startByte) < 0 ||
    Number(row.endByte) <= Number(row.startByte) || !isSha256Digest(row.digest)) return false;
  const p = value.proposal as unknown as PreservedProtocolRecord, a = value.acknowledgment as unknown as PreservedProtocolRecord;
  return p.endByte <= a.startByte && p.line < a.line && a.endByte <= Number(value.artifactByteLengths.stdout);
}
export function constructWorksitePreservedResultArtifact(body: WorksitePreservedResultArtifactBody): Readonly<WorksitePreservedResultArtifact> {
  if (!exact(body, ["source", "proof", "originalTask", "currentTask", "workerResult", "owner"]) ||
    !isWorksitePreservedResultSource(body.source) || !validProof(body.proof) ||
    !exact(body.owner, ["graphFunctionRef", "executionBasisRef", "executionBasisDigest", "cCallRef"]) ||
    !ref(body.owner.graphFunctionRef) || !ref(body.owner.executionBasisRef) || !ref(body.owner.cCallRef) || !isSha256Digest(body.owner.executionBasisDigest)) {
    throw new TypeError("preserved artifact requires exact source, proof and current native-owner coordinates");
  }
  const workerResult = constructWorksiteConstructionWorkerResult(body.originalTask, body.workerResult);
  const targetJoin = preservedWorksiteTargetJoin(body.originalTask, body.currentTask);
  const content = { ...body, workerResult, targetJoin };
  const artifactDigest = hash(content);
  return deepFreeze({ kind: "worksite_preserved_result_artifact" as const, schemaVersion: "5.0.0" as const,
    artifactRef: `worksite-preserved-result://abiogenesis/${artifactDigest.slice(7)}`, artifactDigest, ...content });
}
export function isWorksitePreservedResultArtifact(value: unknown): value is WorksitePreservedResultArtifact {
  try {
    if (!exact(value, ["kind", "schemaVersion", "artifactRef", "artifactDigest", "source", "proof", "originalTask", "currentTask", "workerResult", "owner", "targetJoin"]) ||
      value.kind !== "worksite_preserved_result_artifact" || value.schemaVersion !== "5.0.0") return false;
    const { kind: _kind, schemaVersion: _version, artifactRef: _ref, artifactDigest: _digest, targetJoin: _join, ...body } = value;
    return same(constructWorksitePreservedResultArtifact(body as unknown as WorksitePreservedResultArtifactBody), value);
  } catch { return false; }
}
export function derivePreservedWorksiteCandidateBundle(artifact: WorksitePreservedResultArtifact) {
  if (!isWorksitePreservedResultArtifact(artifact)) throw new TypeError("current bundle requires an exact preserved artifact");
  const files = artifact.currentTask.targets.map(target => {
    const joins = artifact.targetJoin.filter(row => row.currentTargetRef === target.targetRef);
    if (joins.length !== 1) throw new TypeError("current target mapping is not unique");
    const source = artifact.workerResult.files.filter(file => file.targetRef === joins[0]!.originalTargetRef);
    if (source.length !== 1) throw new TypeError("original proposal member is not unique");
    return { ...source[0]!, targetRef: target.targetRef };
  });
  return constructWorksiteCandidateBundle(artifact.currentTask, constructWorksiteConstructionWorkerResult(artifact.currentTask, {
    kind: "worksite_construction_worker_result", schemaVersion: "5.0.0", files }));
}
export function resolveWorksitePreservedResultJudgmentRelation(predicateRef: string) {
  const reasons = { predicateRef, advanceReasonRef: `reason://${scope}/valid@5`, rejectionReasonRef: `reason://${scope}/invalid@5` };
  if (predicateRef === WORKSITE_PRESERVED_RESULT_IDS.authenticatePredicateRef) return Object.freeze({
    ...reasons,
    inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef, outputContractRef: WORKSITE_PRESERVED_RESULT_IDS.artifactContractRef,
    evaluate: (input: unknown, output: unknown) => isWorksiteConstructionTask(input) && isWorksitePreservedResultArtifact(output) && same(input, output.currentTask) });
  if (predicateRef === WORKSITE_PRESERVED_RESULT_IDS.derivePredicateRef) return Object.freeze({
    ...reasons,
    inputContractRef: WORKSITE_PRESERVED_RESULT_IDS.artifactContractRef, outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
    evaluate: (input: unknown, output: unknown) => { try { return isWorksitePreservedResultArtifact(input) && same(derivePreservedWorksiteCandidateBundle(input), output); } catch { return false; } } });
  return null;
}
