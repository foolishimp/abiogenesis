import { WORKSITE_CONSTRUCTION_IDS } from "./worksite_construction_identity.js";
export { WORKSITE_CONSTRUCTION_IDS, WORKSITE_CONSTRUCTION_RESULT_CONTRACT } from "./worksite_construction_identity.js";
import { isAbsolute } from "node:path";

import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isWorkspaceAuthorityBasis,
  type WorkspaceAuthorityBasis,
  type WorkspaceBinding,
} from "./environment.js";
import {
  isCapabilityGrantValue,
  type CapabilityGrant,
} from "./invocation.js";
import {
  constructWorksiteFileReplaceRequest,
  constructWorksiteSubject,
  constructWorksiteTerritory,
  isWorksiteEffectAuthorization,
  isWorksiteFileReplaceReceipt,
  isWorksiteFileReplaceRequest,
  isWorksiteObservation,
  isWorksiteSubject,
  isWorksiteTerritory,
  worksiteSubjectWithinTerritory,
  type FileWorksiteObservation,
  type WorksiteFileReplaceReceipt,
  type WorksiteFileReplaceRequest,
  type WorksiteObservation,
  type WorksiteSubject,
  type WorksiteTerritory,
} from "./worksite_effect.js";

const SCHEMA_VERSION = "5.0.0" as const;


export interface WorksiteConstructionTarget {
  readonly kind: "worksite_construction_target";
  readonly schemaVersion: "5.0.0";
  readonly targetRef: string;
  readonly subject: WorksiteSubject;
  readonly territory: WorksiteTerritory;
  readonly predecessorObservation: WorksiteObservation;
}

export interface WorksiteConstructionTargetInput {
  readonly subject: WorksiteSubject;
  readonly territory: WorksiteTerritory;
  readonly predecessorObservation: WorksiteObservation;
  readonly targetRef?: string;
}

export interface WorksiteConstructionTask {
  readonly kind: "worksite_construction_task";
  readonly schemaVersion: "5.0.0";
  readonly taskRef: string;
  readonly taskDigest: Sha256Digest;
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly materializationPlanRef:
    typeof WORKSITE_CONSTRUCTION_IDS.materializationPlanRef;
  readonly rendererRef: typeof WORKSITE_CONSTRUCTION_IDS.rendererRef;
  readonly instructionContractRef:
    typeof WORKSITE_CONSTRUCTION_IDS.taskContractRef;
  readonly resultContractRef:
    typeof WORKSITE_CONSTRUCTION_IDS.workerResultContractRef;
  readonly workerActorRef: typeof WORKSITE_CONSTRUCTION_IDS.workerActorRef;
  readonly workerBindingRef: typeof WORKSITE_CONSTRUCTION_IDS.workerBindingRef;
  readonly transportLane: "closed_prompt_proof";
  readonly prompt: string;
  readonly promptDigest: Sha256Digest;
  readonly targets: readonly WorksiteConstructionTarget[];
}

export interface WorksiteConstructionTaskInput {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly prompt: string;
  readonly targets: readonly WorksiteConstructionTargetInput[];
}

export interface WorksiteCandidateFile {
  readonly kind: "worksite_candidate_file";
  readonly schemaVersion: "5.0.0";
  readonly targetRef: string;
  readonly replacementBase64: string;
}

export type WorksiteConstructionWorkerFile =
  | (WorksiteCandidateFile & { readonly replacementText?: never })
  | Readonly<{
    kind: "worksite_candidate_file";
    schemaVersion: "5.0.0";
    targetRef: string;
    replacementText: string;
    replacementBase64?: never;
  }>;

export interface WorksiteConstructionWorkerResult {
  readonly kind: "worksite_construction_worker_result";
  readonly schemaVersion: "5.0.0";
  readonly files: readonly WorksiteConstructionWorkerFile[];
}

export interface WorksiteCandidateBundle {
  readonly kind: "worksite_candidate_bundle";
  readonly schemaVersion: "5.0.0";
  readonly candidateBundleRef: string;
  readonly candidateBundleDigest: Sha256Digest;
  readonly task: WorksiteConstructionTask;
  readonly files: readonly WorksiteCandidateFile[];
}

export interface WorksiteFileReplaceVectorMember {
  readonly ordinal: number;
  readonly memberRef: string;
  readonly value: WorksiteFileReplaceRequest;
}

export interface WorksiteFileReplaceVector {
  readonly kind: "worksite_file_replace_vector";
  readonly schemaVersion: "5.0.0";
  readonly vectorRef: string;
  readonly vectorDigest: Sha256Digest;
  readonly sourceCandidateBundleRef: string;
  readonly sourceCandidateBundleDigest: Sha256Digest;
  readonly members: readonly WorksiteFileReplaceVectorMember[];
}

export interface WorksiteFileReplaceOutput {
  readonly kind: "worksite_file_replace_output";
  readonly schemaVersion: "5.0.0";
  readonly authorization: Readonly<Record<string, unknown>>;
  readonly receipt: WorksiteFileReplaceReceipt;
  readonly successorObservation: FileWorksiteObservation;
}

export interface WorksiteFileReplaceOutputVectorMember {
  readonly ordinal: number;
  readonly inputMemberRef: string;
  readonly outputMemberRef: string;
  readonly value: WorksiteFileReplaceOutput;
}

export interface WorksiteFileReplaceOutputVector {
  readonly kind: "gtl_fan_out_vector";
  readonly schemaVersion: "5.0.0";
  readonly applicationRef: string;
  readonly members: readonly WorksiteFileReplaceOutputVectorMember[];
}

export interface WorksiteConstructionResultMember {
  readonly ordinal: number;
  readonly inputMemberRef: string;
  readonly outputMemberRef: string;
  readonly receipt: WorksiteFileReplaceReceipt;
  readonly successorObservation: FileWorksiteObservation;
}

export interface WorksiteConstructionResult {
  readonly kind: "worksite_construction_result";
  readonly schemaVersion: "5.0.0";
  readonly resultRef: string;
  readonly resultDigest: Sha256Digest;
  readonly sourceApplicationRef: string;
  readonly members: readonly WorksiteConstructionResultMember[];
}

export interface WorksiteConstructionFailure {
  readonly kind: "worksite_construction_failure";
  readonly schemaVersion: "5.0.0";
  readonly failureClass: string;
  readonly diagnosticRef: string;
}

export interface WorksiteConstructionVectorApplicationFailure {
  readonly kind: "worksite_construction_vector_application_failure";
  readonly schemaVersion: "5.0.0";
  readonly failureClass: string;
  readonly diagnosticRef: string;
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    !value.includes("\0");
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

function sameCanonical(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function isExactWorkspaceBinding(
  value: unknown,
): value is WorkspaceBinding {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "admissionEventRef",
      "authorityBasisDigest",
      "authorityBasisId",
      "authorizedActorRef",
      "bindingDigest",
      "bindingId",
      "kind",
      "lockDigest",
      "lockId",
      "productSetDigest",
      "productSetId",
      "roots",
      "schemaVersion",
      "workspaceId",
    ]) ||
    value.kind !== "workspace_binding" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.bindingId) ||
    !isSha256Digest(value.bindingDigest) ||
    !nonEmptyString(value.workspaceId) ||
    !nonEmptyString(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) ||
    !nonEmptyString(value.authorizedActorRef) ||
    !nonEmptyString(value.productSetId) ||
    !isSha256Digest(value.productSetDigest) ||
    !nonEmptyString(value.lockId) ||
    !isSha256Digest(value.lockDigest) ||
    !nonEmptyString(value.admissionEventRef) ||
    !isRecord(value.roots) ||
    !hasExactKeys(value.roots, [
      "archiveRoot",
      "eventLogRoot",
      "productRoot",
      "projectionRoot",
      "runtimeStateRoot",
      "toolchainRoot",
    ]) ||
    Object.values(value.roots).some(
      (root) => !nonEmptyString(root) || !isAbsolute(root),
    )
  ) return false;
  const body = {
    workspaceId: value.workspaceId,
    authorityBasisId: value.authorityBasisId,
    authorityBasisDigest: value.authorityBasisDigest,
    authorizedActorRef: value.authorizedActorRef,
    productSetId: value.productSetId,
    productSetDigest: value.productSetDigest,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
    roots: value.roots,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.bindingDigest === digest &&
    value.bindingId === identity("workspace-binding://abiogenesis", digest);
}

function exactWorkspaceAuthorityJoin(
  authority: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
): boolean {
  return isWorkspaceAuthorityBasis(authority) &&
    isExactWorkspaceBinding(workspace) &&
    authority.workspaceId === workspace.workspaceId &&
    authority.authorityBasisId === workspace.authorityBasisId &&
    authority.authorityBasisDigest === workspace.authorityBasisDigest &&
    authority.authorizedActorRef === workspace.authorizedActorRef;
}

function isExactDirectGrant(
  value: unknown,
  workspaceBinding: WorkspaceBinding,
): value is CapabilityGrant {
  return isCapabilityGrantValue(value) &&
    value.operationId === "abg.operation.run.invoke" &&
    value.definitionKey.operationId === "abg.operation.run.invoke" &&
    (value.definitionKey.memberKey === "invoke" || value.definitionKey.memberKey === "start") &&
    value.actorRef === workspaceBinding.authorizedActorRef &&
    value.scopeRef === workspaceBinding.bindingId &&
    value.scopeDigest === workspaceBinding.bindingDigest;
}

function targetBody(
  value: Pick<
    WorksiteConstructionTarget,
    "predecessorObservation" | "subject" | "territory"
  >,
): JsonValue {
  return {
    subject: value.subject,
    territory: value.territory,
    predecessorObservation: value.predecessorObservation,
  } as unknown as JsonValue;
}

function constructTarget(
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
  input: WorksiteConstructionTargetInput,
): WorksiteConstructionTarget {
  if (
    !isWorksiteSubject(input.subject) ||
    !isWorksiteTerritory(input.territory) ||
    !isWorksiteObservation(input.predecessorObservation) ||
    input.subject.workspaceBindingIdentity !== workspaceBinding.bindingId ||
    input.subject.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
    input.territory.workspaceBindingIdentity !== workspaceBinding.bindingId ||
    input.territory.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
    input.predecessorObservation.workspaceBindingIdentity !==
      workspaceBinding.bindingId ||
    input.predecessorObservation.subjectRef !== input.subject.subjectRef ||
    input.predecessorObservation.subjectDigest !== input.subject.subjectDigest ||
    !worksiteSubjectWithinTerritory(input.subject, input.territory)
  ) {
    throw new TypeError(
      "worksite construction target requires one W-bound subject, territory, and predecessor observation",
    );
  }
  const exactSubject = constructWorksiteSubject({
    workspaceAuthorityBasis,
    workspaceBinding,
    subjectUri: input.subject.subjectUri,
    relativePath: input.subject.relativePath,
  });
  const exactTerritory = constructWorksiteTerritory({
    workspaceAuthorityBasis,
    workspaceBinding,
    territoryUri: input.territory.territoryUri,
    relativeRoot: input.territory.relativeRoot,
  });
  if (exactSubject.kind !== "worksite_subject" ||
    exactTerritory.kind !== "worksite_territory" ||
    !sameCanonical(exactSubject, input.subject) ||
    !sameCanonical(exactTerritory, input.territory)) {
    throw new TypeError(
      "worksite construction target must reproduce under the exact canonical worksite authority",
    );
  }
  const digest = sha256Canonical(targetBody(input));
  const targetRef = identity(
    "worksite-construction-target://abiogenesis",
    digest,
  );
  if (input.targetRef !== undefined && input.targetRef !== targetRef) {
    throw new TypeError(
      "worksite construction target ref must cover its complete canonical body",
    );
  }
  return deepFreeze({
    kind: "worksite_construction_target" as const,
    schemaVersion: SCHEMA_VERSION,
    targetRef,
    subject: input.subject,
    territory: input.territory,
    predecessorObservation: input.predecessorObservation,
  });
}

function isWorksiteConstructionTarget(
  value: unknown,
  workspaceAuthorityBasis: WorkspaceAuthorityBasis,
  workspaceBinding: WorkspaceBinding,
): value is WorksiteConstructionTarget {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "predecessorObservation",
      "schemaVersion",
      "subject",
      "targetRef",
      "territory",
    ]) ||
    value.kind !== "worksite_construction_target" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.targetRef)
  ) return false;
  try {
    const expected = constructTarget(workspaceAuthorityBasis, workspaceBinding, {
      subject: value.subject as WorksiteSubject,
      territory: value.territory as WorksiteTerritory,
      predecessorObservation: value.predecessorObservation as WorksiteObservation,
    });
    return sameCanonical(expected, value);
  } catch {
    return false;
  }
}

function taskBody(
  value: Omit<
    WorksiteConstructionTask,
    "kind" | "schemaVersion" | "taskDigest" | "taskRef"
  >,
): JsonValue {
  return value as unknown as JsonValue;
}

export function constructWorksiteConstructionTask(
  input: WorksiteConstructionTaskInput,
): WorksiteConstructionTask {
  if (
    !exactWorkspaceAuthorityJoin(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
    ) ||
    !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) ||
    typeof input.prompt !== "string" ||
    input.prompt.trim().length === 0 ||
    !Array.isArray(input.targets) ||
    input.targets.length === 0
  ) {
    throw new TypeError(
      "worksite construction task requires one exact W, direct grant, prompt, and non-empty target vector",
    );
  }
  const targets = input.targets.map((target) =>
    constructTarget(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      target,
    )
  );
  if (
    new Set(targets.map((target) => target.targetRef)).size !== targets.length ||
    new Set(targets.map((target) => target.subject.subjectRef)).size !==
      targets.length
  ) {
    throw new TypeError(
      "worksite construction targets require unique refs and subjects",
    );
  }
  const body = {
    workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding,
    capabilityGrant: input.capabilityGrant,
    materializationPlanRef:
      WORKSITE_CONSTRUCTION_IDS.materializationPlanRef,
    rendererRef: WORKSITE_CONSTRUCTION_IDS.rendererRef,
    instructionContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    resultContractRef: WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
    workerActorRef: WORKSITE_CONSTRUCTION_IDS.workerActorRef,
    workerBindingRef: WORKSITE_CONSTRUCTION_IDS.workerBindingRef,
    transportLane: WORKSITE_CONSTRUCTION_IDS.transportLane,
    prompt: input.prompt,
    promptDigest: sha256Canonical(input.prompt),
    targets,
  } as const;
  const taskDigest = sha256Canonical(taskBody(body));
  return deepFreeze({
    kind: "worksite_construction_task" as const,
    schemaVersion: SCHEMA_VERSION,
    taskRef: identity("worksite-construction-task://abiogenesis", taskDigest),
    taskDigest,
    ...body,
  });
}

export function isWorksiteConstructionTask(
  value: unknown,
): value is WorksiteConstructionTask {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "capabilityGrant",
      "instructionContractRef",
      "kind",
      "materializationPlanRef",
      "prompt",
      "promptDigest",
      "rendererRef",
      "resultContractRef",
      "schemaVersion",
      "targets",
      "taskDigest",
      "taskRef",
      "transportLane",
      "workerActorRef",
      "workerBindingRef",
      "workspaceAuthorityBasis",
      "workspaceBinding",
    ]) ||
    value.kind !== "worksite_construction_task" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.taskRef) ||
    !isSha256Digest(value.taskDigest) ||
    !isWorkspaceAuthorityBasis(value.workspaceAuthorityBasis) ||
    !isExactWorkspaceBinding(value.workspaceBinding) ||
    !exactWorkspaceAuthorityJoin(
      value.workspaceAuthorityBasis,
      value.workspaceBinding,
    ) ||
    !isExactDirectGrant(value.capabilityGrant, value.workspaceBinding) ||
    value.materializationPlanRef !==
      WORKSITE_CONSTRUCTION_IDS.materializationPlanRef ||
    value.rendererRef !== WORKSITE_CONSTRUCTION_IDS.rendererRef ||
    value.instructionContractRef !==
      WORKSITE_CONSTRUCTION_IDS.taskContractRef ||
    value.resultContractRef !==
      WORKSITE_CONSTRUCTION_IDS.workerResultContractRef ||
    value.workerActorRef !== WORKSITE_CONSTRUCTION_IDS.workerActorRef ||
    value.workerBindingRef !== WORKSITE_CONSTRUCTION_IDS.workerBindingRef ||
    value.transportLane !== WORKSITE_CONSTRUCTION_IDS.transportLane ||
    typeof value.prompt !== "string" ||
    value.prompt.trim().length === 0 ||
    !isSha256Digest(value.promptDigest) ||
    value.promptDigest !== sha256Canonical(value.prompt) ||
    !Array.isArray(value.targets) ||
    value.targets.length === 0 ||
    !value.targets.every((target) =>
      isWorksiteConstructionTarget(
        target,
        value.workspaceAuthorityBasis as WorkspaceAuthorityBasis,
        value.workspaceBinding as WorkspaceBinding,
      )
    )
  ) return false;
  const targets = value.targets as readonly WorksiteConstructionTarget[];
  if (
    new Set(targets.map((target) => target.targetRef)).size !== targets.length ||
    new Set(targets.map((target) => target.subject.subjectRef)).size !==
      targets.length
  ) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    taskRef: _taskRef,
    taskDigest: _taskDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.taskDigest === digest &&
    value.taskRef === identity("worksite-construction-task://abiogenesis", digest);
}

function canonicalBase64(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const bytes = Buffer.from(value, "base64");
  return bytes.toString("base64") === value;
}

function isWorksiteCandidateFile(value: unknown): value is WorksiteCandidateFile {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "replacementBase64",
      "schemaVersion",
      "targetRef",
    ]) &&
    value.kind === "worksite_candidate_file" &&
    value.schemaVersion === SCHEMA_VERSION &&
    nonEmptyString(value.targetRef) &&
    canonicalBase64(value.replacementBase64);
}

function scalarText(value: unknown): value is string {
  if (typeof value !== "string") return false;
  for (const character of value) {
    const codePoint = character.codePointAt(0)!;
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) return false;
  }
  return true;
}

function isWorksiteConstructionWorkerFile(
  value: unknown,
): value is WorksiteConstructionWorkerFile {
  return isWorksiteCandidateFile(value) ||
    (isRecord(value) &&
      hasExactKeys(value, ["kind", "replacementText", "schemaVersion", "targetRef"]) &&
      value.kind === "worksite_candidate_file" &&
      value.schemaVersion === SCHEMA_VERSION &&
      nonEmptyString(value.targetRef) &&
      scalarText(value.replacementText));
}

export function isWorksiteConstructionWorkerResult(
  value: unknown,
): value is WorksiteConstructionWorkerResult {
  return isRecord(value) &&
    hasExactKeys(value, ["files", "kind", "schemaVersion"]) &&
    value.kind === "worksite_construction_worker_result" &&
    value.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(value.files) &&
    value.files.length > 0 &&
    value.files.every(isWorksiteConstructionWorkerFile) &&
    new Set(value.files.map((file) =>
      (file as WorksiteConstructionWorkerFile).targetRef
    )).size === value.files.length;
}

export function constructWorksiteConstructionWorkerResult(
  task: WorksiteConstructionTask,
  rawValue: unknown,
): WorksiteConstructionWorkerResult {
  if (!isWorksiteConstructionTask(task) ||
    !isWorksiteConstructionWorkerResult(rawValue)) {
    throw new TypeError(
      "worksite construction worker result requires one exact task-derived closed value",
    );
  }
  if (
    rawValue.files.length !== task.targets.length ||
    !rawValue.files.every((file, ordinal) =>
      file.targetRef === task.targets[ordinal]?.targetRef
    )
  ) {
    throw new TypeError(
      "worksite construction worker result must preserve exact target cardinality and order",
    );
  }
  return deepFreeze({
    kind: "worksite_construction_worker_result" as const,
    schemaVersion: SCHEMA_VERSION,
    files: rawValue.files.map((file) => ({ ...file })),
  });
}

export function worksiteConstructionWorkerResultSchema(
  task: WorksiteConstructionTask,
): Readonly<Record<string, JsonValue>> {
  if (!isWorksiteConstructionTask(task)) {
    throw new TypeError(
      "worksite construction response schema requires one exact task",
    );
  }
  const targetRefs = task.targets.map((target) => target.targetRef);
  const fileSchema: JsonValue = {
    type: "object",
    additionalProperties: false,
    required: ["kind", "schemaVersion", "targetRef"],
    properties: {
      kind: { const: "worksite_candidate_file" },
      schemaVersion: { const: SCHEMA_VERSION },
      targetRef: targetRefs.length === 1
        ? { const: targetRefs[0] as string }
        : { enum: targetRefs },
      replacementText: { type: "string" },
      replacementBase64: {
        type: "string",
        pattern:
          "^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
      },
    },
  };
  return deepFreeze({
    type: "object",
    additionalProperties: false,
    required: ["kind", "schemaVersion", "files"],
    properties: {
      kind: { const: "worksite_construction_worker_result" },
      schemaVersion: { const: SCHEMA_VERSION },
      files: {
        type: "array",
        minItems: 1,
        items: fileSchema,
      },
    },
  });
}

export function constructWorksiteCandidateBundle(
  task: WorksiteConstructionTask,
  workerResult: WorksiteConstructionWorkerResult,
): WorksiteCandidateBundle {
  const exactWorkerResult = constructWorksiteConstructionWorkerResult(
    task,
    workerResult,
  );
  const body = {
    task,
    files: exactWorkerResult.files.map((file): WorksiteCandidateFile => ({
      kind: file.kind,
      schemaVersion: file.schemaVersion,
      targetRef: file.targetRef,
      replacementBase64: "replacementText" in file
        ? Buffer.from(file.replacementText, "utf8").toString("base64")
        : file.replacementBase64,
    })),
  };
  const candidateBundleDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "worksite_candidate_bundle" as const,
    schemaVersion: SCHEMA_VERSION,
    candidateBundleRef: identity(
      "worksite-candidate-bundle://abiogenesis",
      candidateBundleDigest,
    ),
    candidateBundleDigest,
    ...body,
  });
}

export function isWorksiteCandidateBundle(
  value: unknown,
): value is WorksiteCandidateBundle {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "candidateBundleDigest",
      "candidateBundleRef",
      "files",
      "kind",
      "schemaVersion",
      "task",
    ]) ||
    value.kind !== "worksite_candidate_bundle" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.candidateBundleRef) ||
    !isSha256Digest(value.candidateBundleDigest) ||
    !isWorksiteConstructionTask(value.task)
  ) return false;
  try {
    const expected = constructWorksiteCandidateBundle(
      value.task,
      {
        kind: "worksite_construction_worker_result",
        schemaVersion: SCHEMA_VERSION,
        files: value.files as readonly WorksiteCandidateFile[],
      },
    );
    return sameCanonical(expected, value);
  } catch {
    return false;
  }
}

export function constructWorksiteFileReplaceVector(
  candidate: WorksiteCandidateBundle,
): WorksiteFileReplaceVector {
  if (!isWorksiteCandidateBundle(candidate)) {
    throw new TypeError(
      "worksite authority join requires one exact Product-wrapped candidate bundle",
    );
  }
  const members = candidate.task.targets.map((target, ordinal) => {
    const file = candidate.files[ordinal]!;
    const request = constructWorksiteFileReplaceRequest({
      workspaceAuthorityBasis: candidate.task.workspaceAuthorityBasis,
      workspaceBinding: candidate.task.workspaceBinding,
      capabilityGrant: candidate.task.capabilityGrant,
      subject: target.subject,
      territory: target.territory,
      predecessorObservation: target.predecessorObservation,
      replacementBytes: Buffer.from(file.replacementBase64, "base64"),
    });
    if (!isWorksiteFileReplaceRequest(request)) {
      throw new TypeError(
        "worksite authority join could not construct one exact C0 request",
      );
    }
    return deepFreeze({
      ordinal,
      memberRef: target.targetRef,
      value: request,
    });
  });
  const body = {
    sourceCandidateBundleRef: candidate.candidateBundleRef,
    sourceCandidateBundleDigest: candidate.candidateBundleDigest,
    members,
  };
  const vectorDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "worksite_file_replace_vector" as const,
    schemaVersion: SCHEMA_VERSION,
    vectorRef: identity(
      "worksite-file-replace-vector://abiogenesis",
      vectorDigest,
    ),
    vectorDigest,
    ...body,
  });
}

export function isWorksiteFileReplaceVector(
  value: unknown,
): value is WorksiteFileReplaceVector {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "members",
      "schemaVersion",
      "sourceCandidateBundleDigest",
      "sourceCandidateBundleRef",
      "vectorDigest",
      "vectorRef",
    ]) ||
    value.kind !== "worksite_file_replace_vector" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.vectorRef) ||
    !isSha256Digest(value.vectorDigest) ||
    !nonEmptyString(value.sourceCandidateBundleRef) ||
    !isSha256Digest(value.sourceCandidateBundleDigest) ||
    !Array.isArray(value.members) ||
    value.members.length === 0 ||
    !value.members.every((member, ordinal) =>
      isRecord(member) &&
      hasExactKeys(member, ["memberRef", "ordinal", "value"]) &&
      member.ordinal === ordinal &&
      nonEmptyString(member.memberRef) &&
      isWorksiteFileReplaceRequest(member.value)
    )
  ) return false;
  const members = value.members as unknown as readonly WorksiteFileReplaceVectorMember[];
  if (
    new Set(members.map((member) => member.memberRef)).size !== members.length ||
    new Set(members.map((member) => member.value.subject.subjectRef)).size !==
      members.length ||
    new Set(members.map((member) => member.value.workspaceBindingIdentity)).size !==
      1 ||
    new Set(members.map((member) => member.value.workspaceBindingDigest)).size !==
      1 ||
    members.some((member) => !sameCanonical(
      member.value.workspaceAuthorityBasis,
      members[0]!.value.workspaceAuthorityBasis,
    )) ||
    new Set(members.map((member) => member.value.capabilityGrant.grantRef)).size !==
      1 ||
    new Set(members.map((member) => member.value.capabilityGrant.grantDigest)).size !==
      1
  ) return false;
  const body = {
    sourceCandidateBundleRef: value.sourceCandidateBundleRef,
    sourceCandidateBundleDigest: value.sourceCandidateBundleDigest,
    members,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.vectorDigest === digest &&
    value.vectorRef ===
      identity("worksite-file-replace-vector://abiogenesis", digest);
}

function isWorksiteFileReplaceOutput(
  value: unknown,
): value is WorksiteFileReplaceOutput {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "authorization",
      "kind",
      "receipt",
      "schemaVersion",
      "successorObservation",
    ]) ||
    value.kind !== "worksite_file_replace_output" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !isWorksiteEffectAuthorization(value.authorization) ||
    !isWorksiteFileReplaceReceipt(value.receipt) ||
    !isWorksiteObservation(value.successorObservation) ||
    value.successorObservation.state !== "file"
  ) return false;
  const authorization = value.authorization;
  const receipt = value.receipt;
  const successor = value.successorObservation;
  return authorization.workspaceBindingIdentity ===
      successor.workspaceBindingIdentity &&
    authorization.subjectRef === successor.subjectRef &&
    authorization.subjectDigest === successor.subjectDigest &&
    receipt.authorizationRef === authorization.authorizationRef &&
    receipt.authorizationDigest === authorization.authorizationDigest &&
    receipt.afterObservationRef === successor.observationRef &&
    receipt.afterObservationDigest === successor.observationDigest &&
    receipt.writtenDigest === successor.fileDigest;
}

export function isWorksiteFileReplaceOutputVector(
  value: unknown,
): value is WorksiteFileReplaceOutputVector {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "applicationRef",
      "kind",
      "members",
      "schemaVersion",
    ]) ||
    value.kind !== "gtl_fan_out_vector" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    value.applicationRef !== WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef ||
    !Array.isArray(value.members) ||
    value.members.length === 0 ||
    !value.members.every((member, ordinal) =>
      isRecord(member) &&
      hasExactKeys(member, [
        "inputMemberRef",
        "ordinal",
        "outputMemberRef",
        "value",
      ]) &&
      member.ordinal === ordinal &&
      nonEmptyString(member.inputMemberRef) &&
      nonEmptyString(member.outputMemberRef) &&
      isWorksiteFileReplaceOutput(member.value)
    )
  ) return false;
  const members = value.members as unknown as readonly WorksiteFileReplaceOutputVectorMember[];
  return new Set(members.map((member) => member.inputMemberRef)).size ===
      members.length &&
    new Set(members.map((member) => member.outputMemberRef)).size ===
      members.length &&
    new Set(members.map((member) =>
      member.value.successorObservation.subjectRef
    )).size === members.length;
}

export function reduceWorksiteFileReplaceResults(
  input: WorksiteFileReplaceOutputVector,
): WorksiteConstructionResult {
  if (!isWorksiteFileReplaceOutputVector(input)) {
    throw new TypeError(
      "worksite construction reducer requires one complete authenticated C0 output vector",
    );
  }
  const body = {
    sourceApplicationRef: input.applicationRef,
    members: input.members.map((member) => ({
      ordinal: member.ordinal,
      inputMemberRef: member.inputMemberRef,
      outputMemberRef: member.outputMemberRef,
      receipt: member.value.receipt,
      successorObservation: member.value.successorObservation,
    })),
  };
  const resultDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "worksite_construction_result" as const,
    schemaVersion: SCHEMA_VERSION,
    resultRef: identity(
      "worksite-construction-result://abiogenesis",
      resultDigest,
    ),
    resultDigest,
    ...body,
  });
}

export function isWorksiteConstructionResult(
  value: unknown,
): value is WorksiteConstructionResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "members",
      "resultDigest",
      "resultRef",
      "schemaVersion",
      "sourceApplicationRef",
    ]) ||
    value.kind !== "worksite_construction_result" ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.resultRef) ||
    !isSha256Digest(value.resultDigest) ||
    value.sourceApplicationRef !== WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef ||
    !Array.isArray(value.members) ||
    value.members.length === 0 ||
    !value.members.every((member, ordinal) =>
      isRecord(member) &&
      hasExactKeys(member, [
        "inputMemberRef",
        "ordinal",
        "outputMemberRef",
        "receipt",
        "successorObservation",
      ]) &&
      member.ordinal === ordinal &&
      nonEmptyString(member.inputMemberRef) &&
      nonEmptyString(member.outputMemberRef) &&
      isWorksiteFileReplaceReceipt(member.receipt) &&
      isWorksiteObservation(member.successorObservation) &&
      member.successorObservation.state === "file" &&
      member.receipt.afterObservationRef ===
        member.successorObservation.observationRef &&
      member.receipt.afterObservationDigest ===
        member.successorObservation.observationDigest
    )
  ) return false;
  const members = value.members as unknown as readonly WorksiteConstructionResultMember[];
  if (
    new Set(members.map((member) => member.inputMemberRef)).size !==
      members.length ||
    new Set(members.map((member) => member.outputMemberRef)).size !==
      members.length
  ) return false;
  const body = {
    sourceApplicationRef: value.sourceApplicationRef,
    members,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.resultDigest === digest &&
    value.resultRef ===
      identity("worksite-construction-result://abiogenesis", digest);
}

export function isWorksiteConstructionFailure(
  value: unknown,
): value is WorksiteConstructionFailure {
  return isRecord(value) &&
    hasExactKeys(value, [
      "diagnosticRef",
      "failureClass",
      "kind",
      "schemaVersion",
    ]) &&
    value.kind === "worksite_construction_failure" &&
    value.schemaVersion === SCHEMA_VERSION &&
    nonEmptyString(value.failureClass) &&
    nonEmptyString(value.diagnosticRef);
}

export function isWorksiteConstructionVectorApplicationFailure(
  value: unknown,
): value is WorksiteConstructionVectorApplicationFailure {
  return isRecord(value) &&
    hasExactKeys(value, [
      "diagnosticRef",
      "failureClass",
      "kind",
      "schemaVersion",
    ]) &&
    value.kind === "worksite_construction_vector_application_failure" &&
    value.schemaVersion === SCHEMA_VERSION &&
    nonEmptyString(value.failureClass) &&
    nonEmptyString(value.diagnosticRef);
}

function exactCandidateRelation(input: unknown, output: unknown): boolean {
  return isWorksiteConstructionTask(input) &&
    isWorksiteCandidateBundle(output) &&
    sameCanonical(output.task, input);
}

function exactJoinRelation(input: unknown, output: unknown): boolean {
  if (!isWorksiteCandidateBundle(input) ||
    !isWorksiteFileReplaceVector(output)) return false;
  try {
    return sameCanonical(constructWorksiteFileReplaceVector(input), output);
  } catch {
    return false;
  }
}

function exactReducerRelation(input: unknown, output: unknown): boolean {
  if (!isWorksiteFileReplaceOutputVector(input) ||
    !isWorksiteConstructionResult(output)) return false;
  try {
    return sameCanonical(reduceWorksiteFileReplaceResults(input), output);
  } catch {
    return false;
  }
}

function exactRootTaskRelation(input: unknown, output: unknown): boolean {
  if (!isWorksiteConstructionTask(input) ||
    !isWorksiteConstructionResult(output) ||
    input.targets.length !== output.members.length) return false;
  return output.members.every((member, ordinal) => {
    const target = input.targets[ordinal];
    return target !== undefined &&
      member.inputMemberRef === target.targetRef &&
      member.successorObservation.workspaceBindingIdentity ===
        input.workspaceBinding.bindingId &&
      member.successorObservation.subjectRef === target.subject.subjectRef &&
      member.successorObservation.subjectDigest === target.subject.subjectDigest;
  });
}

function exactVectorResultRelation(
  input: unknown,
  output: unknown,
): boolean {
  if (
    !isWorksiteFileReplaceVector(input) ||
    !isWorksiteConstructionResult(output) ||
    input.members.length !== output.members.length
  ) return false;
  return output.members.every((member, ordinal) => {
    const inputMember = input.members[ordinal];
    return inputMember !== undefined &&
      member.inputMemberRef === inputMember.memberRef &&
      member.successorObservation.workspaceBindingIdentity ===
        inputMember.value.workspaceBindingIdentity &&
      member.successorObservation.subjectRef ===
        inputMember.value.subject.subjectRef &&
      member.successorObservation.subjectDigest ===
        inputMember.value.subject.subjectDigest;
  });
}

function exactC0ResultRelation(input: unknown, output: unknown): boolean {
  if (
    !isWorksiteFileReplaceRequest(input) ||
    !isWorksiteFileReplaceOutput(output)
  ) return false;
  return output.authorization.predecessorObservationRef ===
      input.predecessorObservation.observationRef &&
    output.authorization.predecessorObservationDigest ===
      input.predecessorObservation.observationDigest &&
    output.authorization.capabilityGrantRef === input.capabilityGrant.grantRef &&
    output.authorization.capabilityGrantDigest ===
      input.capabilityGrant.grantDigest;
}

function exactRootRelation(input: unknown, output: unknown): boolean {
  return exactRootTaskRelation(input, output) ||
    exactVectorResultRelation(input, output);
}

function exactVectorApplicationRelation(
  input: unknown,
  output: unknown,
): boolean {
  return exactC0ResultRelation(input, output) ||
    exactReducerRelation(input, output) ||
    exactVectorResultRelation(input, output);
}

export function resolveWorksiteConstructionJudgmentRelation(
  predicateRef: string,
): Readonly<{
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null {
  const evaluate = predicateRef ===
      WORKSITE_CONSTRUCTION_IDS.candidateJudgmentPredicateRef
    ? exactCandidateRelation
    : predicateRef === WORKSITE_CONSTRUCTION_IDS.joinJudgmentPredicateRef
    ? exactJoinRelation
    : predicateRef === WORKSITE_CONSTRUCTION_IDS.reducerJudgmentPredicateRef
    ? exactReducerRelation
    : predicateRef ===
        WORKSITE_CONSTRUCTION_IDS.vectorApplicationJudgmentPredicateRef
    ? exactVectorApplicationRelation
    : predicateRef === WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef
    ? exactRootRelation
    : null;
  if (evaluate === null) return null;
  return Object.freeze({
    predicateRef,
    advanceReasonRef:
      "reason://abiogenesis/worksite/construction-satisfied@5",
    rejectionReasonRef:
      "reason://abiogenesis/worksite/construction-rejected@5",
    evaluate,
  });
}
