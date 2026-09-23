import { isRecord, hasNulJoinedKeys as hasExactKeys, isNonblankNulFreeString as nonEmptyString } from "../shared/admission_predicates.js";
import { isAbsolute, posix, relative, resolve, win32 } from "node:path";
import { pathToFileURL } from "node:url";

import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { CCall } from "../abg/c_call.js";
import type {
  AdmittedImplementationResolutionRow,
  AdmittedImplementationSet,
  ExecutionBasis,
} from "../abg/execution_basis.js";
import {
  isWorkspaceAuthorityBasis,
  type WorkspaceAuthorityBasis,
  type WorkspaceBinding,
} from "./environment.js";
import {
  isCapabilityGrantValue,
  type CapabilityGrant,
} from "./invocation.js";

export const WORKSITE_FILE_REPLACE_EFFECT_URI =
  "effect://abiogenesis/worksite/file.replace/v1" as const;

export const WORKSITE_FILE_REPLACE_HANDLER_REF =
  "handler://abiogenesis/product/worksite/file.replace/v1" as const;

export const WORKSITE_FILE_REPLACE_HANDLER_DIGEST = sha256Canonical({
  effectUri: WORKSITE_FILE_REPLACE_EFFECT_URI,
  handlerRef: WORKSITE_FILE_REPLACE_HANDLER_REF,
  operation: "atomic_replace",
  ownerClass: "selected_implementation",
  schemaVersion: "5.0.0",
});

export interface WorksiteSubject {
  readonly kind: "worksite_subject";
  readonly schemaVersion: "5.0.0";
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly subjectUri: string;
  readonly relativePath: string;
}

export interface WorksiteTerritory {
  readonly kind: "worksite_territory";
  readonly schemaVersion: "5.0.0";
  readonly territoryRef: string;
  readonly territoryDigest: Sha256Digest;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly territoryUri: string;
  readonly relativeRoot: string;
  readonly operations: readonly ["atomic_replace"];
}

interface WorksiteObservationBase {
  readonly kind: "worksite_observation";
  readonly schemaVersion: "5.0.0";
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
  readonly workspaceBindingIdentity: string;
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
}

export interface AbsentWorksiteObservation extends WorksiteObservationBase {
  readonly state: "absent";
}

export interface FileWorksiteObservation extends WorksiteObservationBase {
  readonly state: "file";
  readonly fileIdentity: string;
  readonly fileDigest: Sha256Digest;
  readonly byteLength: number;
}

export type WorksiteObservation =
  | AbsentWorksiteObservation
  | FileWorksiteObservation;

export interface WorksiteEffectAuthorization {
  readonly kind: "worksite_effect_authorization";
  readonly schemaVersion: "5.0.0";
  readonly authorizationRef: string;
  readonly authorizationDigest: Sha256Digest;
  readonly actorRef: string;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly capabilityGrantRef: string;
  readonly capabilityGrantDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly cCallDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  /** The exact admitted set and leaf candidate selected for this owner call. */
  readonly implementationSetRef: string;
  readonly implementationSetDigest: Sha256Digest;
  readonly leafResolutionCandidateRef: string;
  readonly leafResolutionCandidateDigest: Sha256Digest;
  readonly implementationBindingRef: string;
  readonly implementationBindingDigest: Sha256Digest;
  readonly implementationRef: string;
  readonly effectUri: typeof WORKSITE_FILE_REPLACE_EFFECT_URI;
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly territoryRef: string;
  readonly territoryDigest: Sha256Digest;
  readonly implementationOwnerRef: string;
  readonly handlerRef: typeof WORKSITE_FILE_REPLACE_HANDLER_REF;
  readonly handlerDigest: Sha256Digest;
  readonly predecessorObservationRef: string;
  readonly predecessorObservationDigest: Sha256Digest;
}

export interface WorksiteFileReplaceReceipt {
  readonly kind: "worksite_file_replace_receipt";
  readonly schemaVersion: "5.0.0";
  readonly receiptRef: string;
  readonly receiptDigest: Sha256Digest;
  readonly authorizationRef: string;
  readonly authorizationDigest: Sha256Digest;
  readonly beforeObservationRef: string;
  readonly beforeObservationDigest: Sha256Digest;
  readonly afterObservationRef: string;
  readonly afterObservationDigest: Sha256Digest;
  readonly writtenDigest: Sha256Digest;
  readonly committed: true;
}

export interface WorksiteFileReplaceRequest {
  readonly kind: "worksite_file_replace_request";
  readonly schemaVersion: "5.0.0";
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly capabilityGrant: CapabilityGrant;
  readonly subject: WorksiteSubject;
  readonly territory: WorksiteTerritory;
  readonly predecessorObservation: WorksiteObservation;
  readonly replacementEncoding: "base64";
  readonly replacementBytes: string;
  readonly replacementByteLength: number;
  readonly replacementDigest: Sha256Digest;
}

export const WORKSITE_EFFECT_REFUSAL_CODES = [
  "invalid_coordinate",
  "invalid_relative_path",
  "subject_outside_territory",
  "binding_mismatch",
  "authorization_mismatch",
  "invalid_worksite_root",
  "target_parent_missing",
  "target_not_file",
  "aliased_subject",
  "symlink_forbidden",
  "stale_observation",
  "replacement_invalid",
  "filesystem_refused",
  "successor_observation_mismatch",
] as const;

export type WorksiteEffectRefusalCode =
  (typeof WORKSITE_EFFECT_REFUSAL_CODES)[number];

export interface WorksiteEffectRefusal {
  readonly kind: "worksite_effect_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: WorksiteEffectRefusalCode;
  readonly message: string;
  readonly lastObservation: WorksiteObservation | null;
  readonly substrateCode: string | null;
}

/** C0 owner evidence only; publication does not imply an admitted successor. */
export interface WorksitePostPublicationDiagnostic {
  readonly stage: "staging_cleanup" | "target_compensation" | "staging_residue" |
    "successor_observation" | "successor_receipt" | "product_inventory" |
    "owner_reobservation";
  readonly code: WorksiteEffectRefusalCode;
  readonly message: string;
  readonly substrateCode: string | null;
}

export interface CompletedWorksiteOwner {
  readonly authorization: WorksiteEffectAuthorization;
  readonly receipt: WorksiteFileReplaceReceipt;
  readonly successorObservation: FileWorksiteObservation;
}

export interface WorksitePublicationFacts {
  readonly committed: true;
  readonly method: "link" | "rename";
  readonly writtenDigest: Sha256Digest;
  readonly byteLength: number;
  readonly stagingPath: string;
  readonly stagingFileIdentity: string;
}

export type WorksitePhysicalOutcome = Readonly<{
  readonly postPublicationObservation: WorksiteObservation | null;
  readonly diagnostics: readonly WorksitePostPublicationDiagnostic[];
}> & (Readonly<{
  readonly kind: "publication_only";
  readonly authorization: WorksiteEffectAuthorization;
  readonly publication: WorksitePublicationFacts;
  readonly compensation: "not_attempted" | "succeeded" | "failed" |
    "skipped_unverified_identity";
  readonly stagingCleanup: "consumed_by_rename" | "removed" | "failed" |
    "skipped_unverified_identity";
  readonly stagingResidue: Readonly<{
    readonly state: "absent" | "owned_file" | "other_path" | "unknown";
    readonly fileIdentity: string | null;
  }>;
}> | Readonly<{
  readonly kind: "owner_completed";
  readonly completedOwner: CompletedWorksiteOwner;
}>);

export interface WorksitePostPublicationFailure extends WorksiteEffectRefusal {
  readonly phase: "post_publication";
  readonly physicalOutcome: WorksitePhysicalOutcome;
}

export function postPublicationWorksiteFailure(
  firstFailure: WorksiteEffectRefusal,
  physicalOutcome: WorksitePhysicalOutcome,
): WorksitePostPublicationFailure {
  return deepFreeze({
    kind: "worksite_effect_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code: firstFailure.code,
    message: firstFailure.message,
    lastObservation: firstFailure.lastObservation,
    substrateCode: firstFailure.substrateCode,
    phase: "post_publication" as const,
    physicalOutcome,
  });
}

export function worksiteFailureAuthorization(
  value: WorksitePostPublicationFailure,
): WorksiteEffectAuthorization {
  return value.physicalOutcome.kind === "publication_only"
    ? value.physicalOutcome.authorization
    : value.physicalOutcome.completedOwner.authorization;
}

/** Structural closure and intrinsic joins; admission separately authenticates A/W/B/call. */
export function isWorksitePostPublicationFailure(
  value: unknown,
): value is WorksitePostPublicationFailure {
  if (!isRecord(value) || !hasExactKeys(value, [
    "kind", "schemaVersion", "disposition", "code", "message",
    "lastObservation", "substrateCode", "phase", "physicalOutcome",
    ...(value.diagnosticRef === undefined ? [] : ["diagnosticRef"]),
  ]) || value.kind !== "worksite_effect_refusal" ||
    value.schemaVersion !== "5.0.0" || value.disposition !== "refused" ||
    value.phase !== "post_publication" ||
    !WORKSITE_EFFECT_REFUSAL_CODES.some(code => code === value.code) ||
    !nonEmptyString(value.message) ||
    (value.substrateCode !== null && !nonEmptyString(value.substrateCode)) ||
    (value.diagnosticRef !== undefined && !nonEmptyString(value.diagnosticRef)) ||
    (value.lastObservation !== null && !isWorksiteObservation(value.lastObservation)) ||
    !isRecord(value.physicalOutcome)) return false;
  const outcome = value.physicalOutcome;
  if (!hasExactKeys(outcome, ["kind", "postPublicationObservation", "diagnostics",
    ...(outcome.kind === "publication_only"
      ? ["authorization", "publication", "compensation", "stagingCleanup", "stagingResidue"]
      : ["completedOwner"]),
  ]) || (outcome.kind !== "publication_only" && outcome.kind !== "owner_completed") ||
    (outcome.postPublicationObservation !== null &&
      !isWorksiteObservation(outcome.postPublicationObservation)) ||
    !Array.isArray(outcome.diagnostics) || outcome.diagnostics.length < 1 ||
    outcome.diagnostics.length > 8 || !outcome.diagnostics.every(row =>
      isRecord(row) && hasExactKeys(row, ["stage", "code", "message", "substrateCode"]) &&
      ["staging_cleanup", "target_compensation", "staging_residue",
        "successor_observation", "successor_receipt", "product_inventory",
        "owner_reobservation"].includes(row.stage as string) &&
      WORKSITE_EFFECT_REFUSAL_CODES.some(code => code === row.code) &&
      nonEmptyString(row.message) &&
      (row.substrateCode === null || nonEmptyString(row.substrateCode)))) return false;
  const first = outcome.diagnostics[0];
  if (first.code !== value.code || first.message !== value.message ||
    first.substrateCode !== value.substrateCode) return false;
  if (outcome.kind === "owner_completed"
    ? !["product_inventory", "owner_reobservation"].includes(first.stage)
    : !["staging_cleanup", "successor_observation", "successor_receipt"].includes(first.stage)) return false;
  let authorization: WorksiteEffectAuthorization;
  if (outcome.kind === "publication_only") {
    const publication = outcome.publication;
    const residue = outcome.stagingResidue;
    if (!isWorksiteEffectAuthorization(outcome.authorization) ||
      !isRecord(publication) || !hasExactKeys(publication, ["committed", "method",
        "writtenDigest", "byteLength", "stagingPath", "stagingFileIdentity"]) ||
      publication.committed !== true ||
      (publication.method !== "link" && publication.method !== "rename") ||
      !isSha256Digest(publication.writtenDigest) ||
      !Number.isSafeInteger(publication.byteLength) || (publication.byteLength as number) < 0 ||
      !nonEmptyString(publication.stagingPath) || !isAbsolute(publication.stagingPath) ||
      resolve(publication.stagingPath) !== publication.stagingPath ||
      !nonEmptyString(publication.stagingFileIdentity) ||
      !/^[0-9]+:[0-9]+$/u.test(publication.stagingFileIdentity) ||
      !["not_attempted", "succeeded", "failed", "skipped_unverified_identity"].includes(outcome.compensation as string) ||
      !["consumed_by_rename", "removed", "failed", "skipped_unverified_identity"].includes(outcome.stagingCleanup as string) ||
      (publication.method === "rename" && (outcome.compensation !== "not_attempted" || outcome.stagingCleanup !== "consumed_by_rename")) ||
      (publication.method === "link" && outcome.stagingCleanup === "consumed_by_rename") ||
      (outcome.compensation !== "not_attempted" && first.stage !== "staging_cleanup") ||
      !isRecord(residue) || !hasExactKeys(residue, ["state", "fileIdentity"]) ||
      !["absent", "owned_file", "other_path", "unknown"].includes(residue.state as string) ||
      ((residue.state === "absent" || residue.state === "unknown")
        ? residue.fileIdentity !== null
        : !nonEmptyString(residue.fileIdentity)) ||
      (residue.state === "owned_file" && residue.fileIdentity !== publication.stagingFileIdentity)) return false;
    authorization = outcome.authorization;
  } else {
    const completed = outcome.completedOwner;
    if (!isRecord(completed) || !hasExactKeys(completed, ["authorization", "receipt", "successorObservation"]) ||
      !isWorksiteEffectAuthorization(completed.authorization) ||
      !isWorksiteFileReplaceReceipt(completed.receipt) ||
      !isWorksiteObservation(completed.successorObservation) ||
      completed.successorObservation.state !== "file") return false;
    authorization = completed.authorization;
    const receipt = completed.receipt;
    const successor = completed.successorObservation;
    if (receipt.authorizationRef !== authorization.authorizationRef ||
      receipt.authorizationDigest !== authorization.authorizationDigest ||
      receipt.beforeObservationRef !== authorization.predecessorObservationRef ||
      receipt.beforeObservationDigest !== authorization.predecessorObservationDigest ||
      receipt.afterObservationRef !== successor.observationRef ||
      receipt.afterObservationDigest !== successor.observationDigest ||
      receipt.writtenDigest !== successor.fileDigest ||
      successor.subjectRef !== authorization.subjectRef ||
      successor.subjectDigest !== authorization.subjectDigest ||
      successor.workspaceBindingIdentity !== authorization.workspaceBindingIdentity) return false;
  }
  return [value.lastObservation, outcome.postPublicationObservation].every(observation =>
    observation === null || (isWorksiteObservation(observation) &&
      observation.subjectRef === authorization.subjectRef &&
      observation.subjectDigest === authorization.subjectDigest &&
      observation.workspaceBindingIdentity === authorization.workspaceBindingIdentity));
}

export function worksitePostPublicationFailureMatches(
  value: unknown,
  request: WorksiteFileReplaceRequest,
  expectedAuthorization: WorksiteEffectAuthorization,
): value is WorksitePostPublicationFailure {
  if (!isWorksitePostPublicationFailure(value) || !isWorksiteFileReplaceRequest(request) ||
    !isWorksiteEffectAuthorization(expectedAuthorization) ||
    canonicalJson(worksiteFailureAuthorization(value) as unknown as JsonValue) !==
      canonicalJson(expectedAuthorization as unknown as JsonValue)) return false;
  const outcome = value.physicalOutcome;
  if (outcome.kind === "owner_completed") {
    const receipt = constructWorksiteFileReplaceReceipt(expectedAuthorization,
      request.predecessorObservation, outcome.completedOwner.successorObservation,
      request.replacementDigest);
    return receipt.kind === "worksite_file_replace_receipt" &&
      canonicalJson(receipt as unknown as JsonValue) ===
        canonicalJson(outcome.completedOwner.receipt as unknown as JsonValue) &&
      outcome.completedOwner.successorObservation.byteLength === request.replacementByteLength;
  }
  const publication = outcome.publication;
  const target = resolve(request.workspaceAuthorityBasis.canonicalRoot, request.subject.relativePath);
  const stagingName = posix.basename(publication.stagingPath);
  return publication.method === (request.predecessorObservation.state === "absent" ? "link" : "rename") &&
    publication.writtenDigest === request.replacementDigest &&
    publication.byteLength === request.replacementByteLength &&
    resolve(publication.stagingPath, "..") === resolve(target, "..") &&
    stagingName.startsWith(`.abiogenesis-${posix.basename(target)}-`) &&
    stagingName.endsWith(".tmp");
}

export interface WorksiteSubjectInput {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly subjectUri: string;
  readonly relativePath: string;
}

export interface WorksiteTerritoryInput {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly territoryUri: string;
  readonly relativeRoot: string;
}

export interface WorksiteObservationInput {
  readonly subject: WorksiteSubject;
  readonly state: "absent";
}

export interface WorksiteFileObservationInput {
  readonly subject: WorksiteSubject;
  readonly state: "file";
  readonly fileIdentity: string;
  readonly fileDigest: Sha256Digest;
  readonly byteLength: number;
}

export interface WorksiteFileReplaceRequestInput {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly subject: WorksiteSubject;
  readonly territory: WorksiteTerritory;
  readonly predecessorObservation: WorksiteObservation;
  readonly replacementBytes: Uint8Array;
}

export interface WorksiteEffectAuthorizationInput {
  readonly workspaceBinding: WorkspaceBinding;
  readonly request: WorksiteFileReplaceRequest;
  readonly executionBasis: ExecutionBasis;
  readonly cCall: CCall;
  readonly implementationSet: AdmittedImplementationSet;
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

export function exactWorkspaceBinding(value: WorkspaceBinding): boolean {
  if (
    value.kind !== "workspace_binding" ||
    value.schemaVersion !== "5.0.0" ||
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
    Object.values(value.roots).some((root) =>
      !nonEmptyString(root) || !isAbsolute(root)
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
  return isWorkspaceAuthorityBasis(authority) && exactWorkspaceBinding(workspace) &&
    authority.workspaceId === workspace.workspaceId &&
    authority.authorityBasisId === workspace.authorityBasisId &&
    authority.authorityBasisDigest === workspace.authorityBasisDigest &&
    authority.authorizedActorRef === workspace.authorizedActorRef;
}

function containsPath(root: string, candidate: string): boolean {
  const relation = relative(resolve(root), resolve(candidate));
  return relation === "" ||
    (!isAbsolute(relation) && relation !== ".." && !relation.startsWith("../"));
}

function protectedWorksitePath(
  authority: WorkspaceAuthorityBasis,
  workspace: WorkspaceBinding,
  relativePath: string,
): boolean {
  const candidate = resolve(authority.canonicalRoot, ...relativePath.split("/"));
  return Object.values(workspace.roots).some((root) =>
    containsPath(root, candidate)
  );
}

function exactExecutionBasis(value: ExecutionBasis): boolean {
  if (
    value.kind !== "execution_basis" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "admitted" ||
    !nonEmptyString(value.basisRef) ||
    !isSha256Digest(value.basisDigest) ||
    !nonEmptyString(value.admissionEventRef)
  ) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    basisRef: _basisRef,
    basisDigest: _basisDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.basisDigest === digest &&
    value.basisRef === identity("execution-basis://abiogenesis", digest);
}

function exactCCall(value: CCall): boolean {
  if (
    value.kind !== "c_call" ||
    value.schemaVersion !== "5.0.0" ||
    (value.callClass !== "leaf" && value.callClass !== "workflow") ||
    !Array.isArray(value.retryPath) ||
    !nonEmptyString(value.openedEventRef) ||
    !nonEmptyString(value.fibreSelectedEventRef) ||
    !isSha256Digest(value.cCallDigest)
  ) return false;
  const commonIdentity = {
    basisId: value.basisId,
    graphCallId: value.graphCallId,
    frameId: value.frameId,
    vectorIndex: value.vectorIndex,
    stageRole: value.stageRole,
    taskOrdinal: value.taskOrdinal,
    attempt: value.attempt,
    programLocusRef: value.programLocusRef,
    retryPath: value.retryPath,
  };
  const identityBody = value.callClass === "workflow"
    ? {
      ...commonIdentity,
      childGraphFunctionRef: value.childGraphFunctionRef,
      failureContractRef: value.failureContractRef,
    }
    : commonIdentity;
  const digest = sha256Canonical(identityBody as unknown as JsonValue);
  return value.cCallDigest === digest && value.cCallRef === `c-call:${digest}`;
}

function exactImplementationSet(value: AdmittedImplementationSet): boolean {
  if (
    value.kind !== "admitted_implementation_set" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "admitted" ||
    !nonEmptyString(value.implementationSetRef) ||
    !isSha256Digest(value.implementationSetDigest) ||
    !nonEmptyString(value.admissionEventRef) ||
    !Array.isArray(value.rows)
  ) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    implementationSetRef: _implementationSetRef,
    implementationSetDigest: _implementationSetDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.implementationSetDigest === digest &&
    value.implementationSetRef ===
      identity("implementation-set://abiogenesis", digest);
}

function exactAdmittedImplementationRow(
  value: AdmittedImplementationResolutionRow,
): boolean {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "catalogBasisDigest",
      "catalogViewDigest",
      "computeRegime",
      "disposition",
      "failureContractRef",
      "graphFunctionDigest",
      "graphFunctionOwnerProductId",
      "graphFunctionPublicationDigest",
      "graphFunctionRef",
      "implementationBindingDigest",
      "implementationBindingRef",
      "implementationDescriptorDigest",
      "implementationOwnerProductId",
      "implementationPublicationDigest",
      "implementationRef",
      "inputContractRef",
      "kind",
      "leafResolutionCandidateDigest",
      "leafResolutionCandidateRef",
      "modulePath",
      "namedSymbol",
      "nodeRef",
      "outputContractRef",
      "packageName",
      "packageVersion",
      "programLocusRef",
      "programValidationRef",
      "publicationDigest",
      "refusalContractRef",
      "requirementKey",
      "requirementKeyDigest",
      "schemaVersion",
    ]) ||
    value.kind !== "admitted_implementation_resolution_row" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "admitted" ||
    (value.computeRegime !== "F_D" && value.computeRegime !== "F_P")
  ) return false;
  const stringFields = [
    value.leafResolutionCandidateRef,
    value.requirementKey,
    value.catalogBasisDigest,
    value.catalogViewDigest,
    value.programValidationRef,
    value.graphFunctionRef,
    value.graphFunctionOwnerProductId,
    value.nodeRef,
    value.programLocusRef,
    value.implementationBindingRef,
    value.implementationRef,
    value.packageName,
    value.packageVersion,
    value.modulePath,
    value.namedSymbol,
    value.inputContractRef,
    value.outputContractRef,
    value.failureContractRef,
    value.refusalContractRef,
    value.implementationOwnerProductId,
  ];
  if (!stringFields.every(nonEmptyString) || ![
    value.leafResolutionCandidateDigest,
    value.requirementKeyDigest,
    value.publicationDigest,
    value.graphFunctionDigest,
    value.graphFunctionPublicationDigest,
    value.implementationBindingDigest,
    value.implementationDescriptorDigest,
    value.implementationPublicationDigest,
  ].every(isSha256Digest)) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    leafResolutionCandidateRef: _leafResolutionCandidateRef,
    leafResolutionCandidateDigest: _leafResolutionCandidateDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.leafResolutionCandidateDigest === digest &&
    value.leafResolutionCandidateRef ===
      identity("leaf-resolution-candidate://abiogenesis", digest);
}

function selectedImplementation(
  set: AdmittedImplementationSet,
  cCall: CCall,
): AdmittedImplementationResolutionRow | null {
  const rows = set.rows.filter((row) =>
    exactAdmittedImplementationRow(row) &&
    row.graphFunctionRef === cCall.graphFunctionRef &&
    row.programLocusRef === cCall.programLocusRef &&
    row.requirementKey === cCall.implementationRequirementKey &&
    row.implementationBindingRef === cCall.implementationBindingRef &&
    row.implementationRef === cCall.implementationRef &&
    row.computeRegime === cCall.regime &&
    row.inputContractRef === cCall.inputContractRef &&
    row.outputContractRef === cCall.outputContractRef &&
    row.failureContractRef === cCall.failureContractRef &&
    row.refusalContractRef === cCall.refusalContractRef
  );
  return rows.length === 1 ? rows[0] ?? null : null;
}

function expectedFileUri(root: string, relativePath: string): string {
  return pathToFileURL(resolve(root, ...relativePath.split("/"))).href;
}

export function worksiteRefusal(
  code: WorksiteEffectRefusalCode,
  message: string,
  lastObservation: WorksiteObservation | null = null,
  substrateCode: string | null = null,
): WorksiteEffectRefusal {
  return deepFreeze({
    kind: "worksite_effect_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    lastObservation,
    substrateCode,
  });
}

export function normalizeWorksiteRelativePath(
  value: string,
  allowRoot: boolean,
): string | null {
  if (
    typeof value !== "string" ||
    value.includes("\0") ||
    posix.isAbsolute(value) ||
    win32.isAbsolute(value)
  ) return null;

  const slashPath = value.replaceAll("\\", "/");
  const segments = slashPath.split("/");
  if (segments.includes("..")) return null;
  const normalized = posix.normalize(slashPath);
  if (
    slashPath !== value ||
    normalized !== slashPath ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized.endsWith("/..") ||
    (!allowRoot && (normalized === "." || normalized.length === 0))
  ) return null;
  return normalized.length === 0 ? "." : normalized;
}

export function worksiteSubjectWithinTerritory(
  subject: WorksiteSubject,
  territory: WorksiteTerritory,
): boolean {
  if (
    subject.workspaceBindingIdentity !== territory.workspaceBindingIdentity ||
    subject.workspaceBindingDigest !== territory.workspaceBindingDigest
  ) return false;
  if (territory.relativeRoot === ".") return true;
  return subject.relativePath.startsWith(`${territory.relativeRoot}/`);
}

export function constructWorksiteSubject(
  input: WorksiteSubjectInput,
): WorksiteEffectRefusal | WorksiteSubject {
  const relativePath = normalizeWorksiteRelativePath(input.relativePath, false);
  if (relativePath === null) {
    return worksiteRefusal(
      "invalid_relative_path",
      "worksite subject path must be a normalized relative file path without parent traversal",
    );
  }
  if (
    !exactWorkspaceAuthorityJoin(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
    ) ||
    !nonEmptyString(input.subjectUri) ||
    input.subjectUri !== expectedFileUri(
      input.workspaceAuthorityBasis.canonicalRoot,
      relativePath,
    ) ||
    protectedWorksitePath(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      relativePath,
    )
  ) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite subject requires exact binding and subject URI coordinates",
    );
  }
  const body = {
    workspaceBindingIdentity: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    subjectUri: input.subjectUri,
    relativePath,
  };
  const subjectDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "worksite_subject" as const,
    schemaVersion: "5.0.0" as const,
    subjectRef: identity("worksite-subject://abiogenesis", subjectDigest),
    subjectDigest,
    ...body,
  });
}

export function isWorksiteSubject(value: unknown): value is WorksiteSubject {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "relativePath",
      "schemaVersion",
      "subjectDigest",
      "subjectRef",
      "subjectUri",
      "workspaceBindingDigest",
      "workspaceBindingIdentity",
    ]) ||
    value.kind !== "worksite_subject" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.subjectRef) ||
    !isSha256Digest(value.subjectDigest) ||
    !nonEmptyString(value.workspaceBindingIdentity) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !nonEmptyString(value.subjectUri) ||
    typeof value.relativePath !== "string"
  ) return false;
  const relativePath = normalizeWorksiteRelativePath(value.relativePath, false);
  if (relativePath === null || relativePath !== value.relativePath) return false;
  const body = {
    workspaceBindingIdentity: value.workspaceBindingIdentity,
    workspaceBindingDigest: value.workspaceBindingDigest,
    subjectUri: value.subjectUri,
    relativePath,
  };
  const digest = sha256Canonical(body);
  return value.subjectDigest === digest &&
    value.subjectRef === identity("worksite-subject://abiogenesis", digest);
}

export function constructWorksiteTerritory(
  input: WorksiteTerritoryInput,
): WorksiteEffectRefusal | WorksiteTerritory {
  const relativeRoot = normalizeWorksiteRelativePath(input.relativeRoot, true);
  if (relativeRoot === null) {
    return worksiteRefusal(
      "invalid_relative_path",
      "worksite territory root must be normalized and relative without parent traversal",
    );
  }
  if (
    !exactWorkspaceAuthorityJoin(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
    ) ||
    !nonEmptyString(input.territoryUri) ||
    input.territoryUri !== expectedFileUri(
      input.workspaceAuthorityBasis.canonicalRoot,
      relativeRoot,
    ) ||
    protectedWorksitePath(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
      relativeRoot,
    )
  ) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite territory requires exact binding identity and territory URI",
    );
  }
  const body = {
    workspaceBindingIdentity: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    territoryUri: input.territoryUri,
    relativeRoot,
    operations: ["atomic_replace"] as const,
  };
  const territoryDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "worksite_territory" as const,
    schemaVersion: "5.0.0" as const,
    territoryRef: identity("worksite-territory://abiogenesis", territoryDigest),
    territoryDigest,
    ...body,
  });
}

export function isWorksiteTerritory(value: unknown): value is WorksiteTerritory {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "operations",
      "relativeRoot",
      "schemaVersion",
      "territoryDigest",
      "territoryRef",
      "territoryUri",
      "workspaceBindingDigest",
      "workspaceBindingIdentity",
    ]) ||
    value.kind !== "worksite_territory" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.territoryRef) ||
    !isSha256Digest(value.territoryDigest) ||
    !nonEmptyString(value.workspaceBindingIdentity) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !nonEmptyString(value.territoryUri) ||
    typeof value.relativeRoot !== "string" ||
    !Array.isArray(value.operations) ||
    value.operations.length !== 1 ||
    value.operations[0] !== "atomic_replace"
  ) return false;
  const relativeRoot = normalizeWorksiteRelativePath(value.relativeRoot, true);
  if (relativeRoot === null || relativeRoot !== value.relativeRoot) return false;
  const body = {
    workspaceBindingIdentity: value.workspaceBindingIdentity,
    workspaceBindingDigest: value.workspaceBindingDigest,
    territoryUri: value.territoryUri,
    relativeRoot,
    operations: ["atomic_replace"] as const,
  };
  const digest = sha256Canonical(body);
  return value.territoryDigest === digest &&
    value.territoryRef === identity("worksite-territory://abiogenesis", digest);
}

export function constructWorksiteObservation(
  input: WorksiteObservationInput | WorksiteFileObservationInput,
): WorksiteEffectRefusal | WorksiteObservation {
  if (!isWorksiteSubject(input.subject)) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite observation requires one exact worksite subject",
    );
  }
  if (
    input.state === "file" &&
    (!nonEmptyString(input.fileIdentity) ||
      !isSha256Digest(input.fileDigest) ||
      !Number.isSafeInteger(input.byteLength) ||
      input.byteLength < 0)
  ) {
    return worksiteRefusal(
      "invalid_coordinate",
      "file observation requires exact content digest and byte length",
    );
  }
  const common = {
    workspaceBindingIdentity: input.subject.workspaceBindingIdentity,
    subjectRef: input.subject.subjectRef,
    subjectDigest: input.subject.subjectDigest,
  };
  if (input.state === "file") {
    const body = {
      ...common,
      state: "file" as const,
      fileIdentity: input.fileIdentity,
      fileDigest: input.fileDigest,
      byteLength: input.byteLength,
    };
    const observationDigest = sha256Canonical(body);
    return deepFreeze({
      kind: "worksite_observation" as const,
      schemaVersion: "5.0.0" as const,
      observationRef: identity(
        "worksite-observation://abiogenesis",
        observationDigest,
      ),
      observationDigest,
      ...body,
    });
  }
  const body = { ...common, state: "absent" as const };
  const observationDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "worksite_observation" as const,
    schemaVersion: "5.0.0" as const,
    observationRef: identity(
      "worksite-observation://abiogenesis",
      observationDigest,
    ),
    observationDigest,
    ...body,
  });
}

export function isWorksiteObservation(
  value: unknown,
): value is WorksiteObservation {
  if (
    !isRecord(value) ||
    value.kind !== "worksite_observation" ||
    value.schemaVersion !== "5.0.0" ||
    !nonEmptyString(value.observationRef) ||
    !isSha256Digest(value.observationDigest) ||
    !nonEmptyString(value.workspaceBindingIdentity) ||
    !nonEmptyString(value.subjectRef) ||
    !isSha256Digest(value.subjectDigest) ||
    (value.state !== "absent" && value.state !== "file")
  ) return false;
  if (
    value.state === "absent" &&
    !hasExactKeys(value, [
      "kind",
      "observationDigest",
      "observationRef",
      "schemaVersion",
      "state",
      "subjectDigest",
      "subjectRef",
      "workspaceBindingIdentity",
    ])
  ) return false;
  if (
    value.state === "file" &&
    (!hasExactKeys(value, [
      "byteLength",
      "fileIdentity",
      "fileDigest",
      "kind",
      "observationDigest",
      "observationRef",
      "schemaVersion",
      "state",
      "subjectDigest",
      "subjectRef",
      "workspaceBindingIdentity",
    ]) ||
      !nonEmptyString(value.fileIdentity) ||
      !isSha256Digest(value.fileDigest) ||
      !Number.isSafeInteger(value.byteLength) ||
      (value.byteLength as number) < 0)
  ) return false;
  const body = {
    workspaceBindingIdentity: value.workspaceBindingIdentity,
    subjectRef: value.subjectRef,
    subjectDigest: value.subjectDigest,
    state: value.state,
    ...(value.state === "file"
      ? {
        fileIdentity: value.fileIdentity as string,
        fileDigest: value.fileDigest as Sha256Digest,
        byteLength: value.byteLength as number,
      }
      : {}),
  };
  const digest = sha256Canonical(body);
  return value.observationDigest === digest &&
    value.observationRef ===
      identity("worksite-observation://abiogenesis", digest);
}

export function constructWorksiteFileReplaceRequest(
  input: WorksiteFileReplaceRequestInput,
): WorksiteEffectRefusal | WorksiteFileReplaceRequest {
  if (
    !exactWorkspaceAuthorityJoin(
      input.workspaceAuthorityBasis,
      input.workspaceBinding,
    ) ||
    !isWorksiteSubject(input.subject) ||
    !isWorksiteTerritory(input.territory) ||
    !isWorksiteObservation(input.predecessorObservation) ||
    !isCapabilityGrantValue(input.capabilityGrant)
  ) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite file-replace request requires one exact binding, grant, territory, subject, and predecessor observation",
    );
  }
  const exactSubject = constructWorksiteSubject({
    workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding,
    subjectUri: input.subject.subjectUri,
    relativePath: input.subject.relativePath,
  });
  const exactTerritory = constructWorksiteTerritory({
    workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding,
    territoryUri: input.territory.territoryUri,
    relativeRoot: input.territory.relativeRoot,
  });
  if (
    exactSubject.kind !== "worksite_subject" ||
    exactTerritory.kind !== "worksite_territory" ||
    canonicalJson(exactSubject as unknown as JsonValue) !==
      canonicalJson(input.subject as unknown as JsonValue) ||
    canonicalJson(exactTerritory as unknown as JsonValue) !==
      canonicalJson(input.territory as unknown as JsonValue)
  ) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite file-replace request requires one exact binding, grant, territory, subject, and predecessor observation",
    );
  }
  if (!(input.replacementBytes instanceof Uint8Array)) {
    return worksiteRefusal(
      "replacement_invalid",
      "worksite file-replace request requires exact replacement bytes",
    );
  }
  const replacement = Buffer.from(input.replacementBytes);
  const candidate = deepFreeze({
    kind: "worksite_file_replace_request" as const,
    schemaVersion: "5.0.0" as const,
    workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBindingIdentity: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    capabilityGrant: input.capabilityGrant,
    subject: input.subject,
    territory: input.territory,
    predecessorObservation: input.predecessorObservation,
    replacementEncoding: "base64" as const,
    replacementBytes: replacement.toString("base64"),
    replacementByteLength: replacement.byteLength,
    replacementDigest: sha256Bytes(replacement),
  });
  return isWorksiteFileReplaceRequest(candidate)
    ? candidate
    : worksiteRefusal(
        worksiteSubjectWithinTerritory(input.subject, input.territory)
          ? "binding_mismatch"
          : "subject_outside_territory",
        "worksite file-replace request coordinates do not form one closed W-bound carrier",
      );
}

export function isWorksiteFileReplaceRequest(
  value: unknown,
): value is WorksiteFileReplaceRequest {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "capabilityGrant",
      "kind",
      "predecessorObservation",
      "replacementByteLength",
      "replacementBytes",
      "replacementDigest",
      "replacementEncoding",
      "schemaVersion",
      "subject",
      "territory",
      "workspaceAuthorityBasis",
      "workspaceBindingDigest",
      "workspaceBindingIdentity",
    ]) ||
    value.kind !== "worksite_file_replace_request" ||
    value.schemaVersion !== "5.0.0" ||
    !isWorkspaceAuthorityBasis(value.workspaceAuthorityBasis) ||
    !nonEmptyString(value.workspaceBindingIdentity) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !isCapabilityGrantValue(value.capabilityGrant) ||
    !isWorksiteSubject(value.subject) ||
    !isWorksiteTerritory(value.territory) ||
    !isWorksiteObservation(value.predecessorObservation) ||
    value.replacementEncoding !== "base64" ||
    typeof value.replacementBytes !== "string" ||
    !Number.isSafeInteger(value.replacementByteLength) ||
    (value.replacementByteLength as number) < 0 ||
    !isSha256Digest(value.replacementDigest)
  ) return false;
  const replacement = Buffer.from(value.replacementBytes, "base64");
  const authority = value.workspaceAuthorityBasis;
  return replacement.toString("base64") === value.replacementBytes &&
    replacement.byteLength === value.replacementByteLength &&
    sha256Bytes(replacement) === value.replacementDigest &&
    value.workspaceBindingIdentity === value.subject.workspaceBindingIdentity &&
    value.workspaceBindingDigest === value.subject.workspaceBindingDigest &&
    value.workspaceBindingIdentity === value.territory.workspaceBindingIdentity &&
    value.workspaceBindingDigest === value.territory.workspaceBindingDigest &&
    value.workspaceBindingIdentity ===
      value.predecessorObservation.workspaceBindingIdentity &&
    value.predecessorObservation.subjectRef === value.subject.subjectRef &&
    value.predecessorObservation.subjectDigest === value.subject.subjectDigest &&
    value.capabilityGrant.actorRef.length > 0 &&
    value.capabilityGrant.operationId === "abg.operation.run.invoke" &&
    value.capabilityGrant.definitionKey.operationId === "abg.operation.run.invoke" &&
    (value.capabilityGrant.definitionKey.memberKey === "invoke" ||
      value.capabilityGrant.definitionKey.memberKey === "start") &&
    value.capabilityGrant.scopeRef === value.workspaceBindingIdentity &&
    value.capabilityGrant.scopeDigest === value.workspaceBindingDigest &&
    value.capabilityGrant.actorRef === authority.authorizedActorRef &&
    value.subject.subjectUri === expectedFileUri(
      authority.canonicalRoot,
      value.subject.relativePath,
    ) &&
    value.territory.territoryUri === expectedFileUri(
      authority.canonicalRoot,
      value.territory.relativeRoot,
    ) &&
    worksiteSubjectWithinTerritory(value.subject, value.territory);
}

export function constructWorksiteEffectAuthorization(
  input: WorksiteEffectAuthorizationInput,
): WorksiteEffectRefusal | WorksiteEffectAuthorization {
  if (!isWorksiteFileReplaceRequest(input.request)) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite authorization requires one closed pre-basis file-replace request",
    );
  }
  const {
    capabilityGrant,
    predecessorObservation,
    subject,
    territory,
  } = input.request;
  const implementation = exactImplementationSet(input.implementationSet) &&
      exactCCall(input.cCall)
    ? selectedImplementation(input.implementationSet, input.cCall)
    : null;
  const reproducedSubject = constructWorksiteSubject({
    workspaceAuthorityBasis: input.request.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding,
    subjectUri: subject.subjectUri,
    relativePath: subject.relativePath,
  });
  const reproducedTerritory = constructWorksiteTerritory({
    workspaceAuthorityBasis: input.request.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding,
    territoryUri: territory.territoryUri,
    relativeRoot: territory.relativeRoot,
  });
  if (
    !exactWorkspaceBinding(input.workspaceBinding) ||
    !exactExecutionBasis(input.executionBasis) ||
    !isCapabilityGrantValue(capabilityGrant) ||
    !exactCCall(input.cCall) ||
    !exactImplementationSet(input.implementationSet) ||
    implementation === null ||
    !isWorksiteSubject(subject) ||
    !isWorksiteTerritory(territory) ||
    !isWorksiteObservation(predecessorObservation) ||
    reproducedSubject.kind !== "worksite_subject" ||
    reproducedTerritory.kind !== "worksite_territory" ||
    canonicalJson(reproducedSubject as unknown as JsonValue) !==
      canonicalJson(subject as unknown as JsonValue) ||
    canonicalJson(reproducedTerritory as unknown as JsonValue) !==
      canonicalJson(territory as unknown as JsonValue) ||
    !worksiteSubjectWithinTerritory(subject, territory)
  ) {
    return worksiteRefusal(
      "subject_outside_territory",
      "worksite authorization requires one exact subject inside one exact territory",
    );
  }
  if (
    subject.workspaceBindingIdentity !== input.workspaceBinding.bindingId ||
    subject.workspaceBindingDigest !== input.workspaceBinding.bindingDigest ||
    territory.workspaceBindingIdentity !== input.workspaceBinding.bindingId ||
    territory.workspaceBindingDigest !== input.workspaceBinding.bindingDigest ||
    subject.subjectUri !== expectedFileUri(
      input.request.workspaceAuthorityBasis.canonicalRoot,
      subject.relativePath,
    ) ||
    territory.territoryUri !== expectedFileUri(
      input.request.workspaceAuthorityBasis.canonicalRoot,
      territory.relativeRoot,
    ) ||
    !exactWorkspaceAuthorityJoin(
      input.request.workspaceAuthorityBasis,
      input.workspaceBinding,
    ) ||
    predecessorObservation.workspaceBindingIdentity !==
      subject.workspaceBindingIdentity ||
    predecessorObservation.subjectRef !== subject.subjectRef ||
    predecessorObservation.subjectDigest !== subject.subjectDigest ||
    input.executionBasis.workspaceBindingId !==
      subject.workspaceBindingIdentity ||
    input.executionBasis.workspaceBindingDigest !==
      subject.workspaceBindingDigest ||
    input.executionBasis.actorRef !== input.workspaceBinding.authorizedActorRef ||
    capabilityGrant.actorRef !== input.executionBasis.actorRef ||
    capabilityGrant.operationId !== "abg.operation.run.invoke" ||
    capabilityGrant.definitionKey.operationId !== "abg.operation.run.invoke" ||
    (capabilityGrant.definitionKey.memberKey !== "invoke" &&
      capabilityGrant.definitionKey.memberKey !== "start") ||
    capabilityGrant.scopeRef !== input.workspaceBinding.bindingId ||
    capabilityGrant.scopeDigest !== input.workspaceBinding.bindingDigest ||
    input.cCall.basisId !== input.executionBasis.basisRef ||
    input.cCall.graphFunctionRef !== input.executionBasis.graphFunctionRef ||
    input.cCall.implementationSetRef !==
      input.executionBasis.implementationSetRef ||
    input.implementationSet.implementationSetRef !==
      input.executionBasis.implementationSetRef ||
    input.implementationSet.implementationSetDigest !==
      input.executionBasis.implementationSetDigest
  ) {
    return worksiteRefusal(
      "binding_mismatch",
      "grant use, execution basis, observation, subject, and territory must share one workspace binding",
    );
  }
  if (
    input.cCall.callClass !== "leaf" ||
    input.cCall.implementationBindingRef === null ||
    input.cCall.implementationRef === null ||
    !nonEmptyString(implementation.implementationOwnerProductId)
  ) {
    return worksiteRefusal(
      "invalid_coordinate",
      "worksite authorization requires exact grant, execution-basis, and CCall coordinates",
    );
  }
  const body = {
    actorRef: input.executionBasis.actorRef,
    workspaceBindingIdentity: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    capabilityGrantRef: capabilityGrant.grantRef,
    capabilityGrantDigest: capabilityGrant.grantDigest,
    executionBasisRef: input.executionBasis.basisRef,
    executionBasisDigest: input.executionBasis.basisDigest,
    cCallRef: input.cCall.cCallRef,
    cCallDigest: input.cCall.cCallDigest,
    programRef: input.executionBasis.programRef,
    programDigest: input.executionBasis.programDigest,
    graphFunctionRef: input.executionBasis.graphFunctionRef,
    graphFunctionDigest: input.executionBasis.graphFunctionDigest,
    implementationSetRef: input.implementationSet.implementationSetRef,
    implementationSetDigest: input.implementationSet.implementationSetDigest,
    leafResolutionCandidateRef: implementation.leafResolutionCandidateRef,
    leafResolutionCandidateDigest: implementation.leafResolutionCandidateDigest,
    implementationBindingRef: input.cCall.implementationBindingRef,
    implementationBindingDigest: implementation.implementationBindingDigest,
    implementationRef: input.cCall.implementationRef,
    effectUri: WORKSITE_FILE_REPLACE_EFFECT_URI,
    subjectRef: subject.subjectRef,
    subjectDigest: subject.subjectDigest,
    territoryRef: territory.territoryRef,
    territoryDigest: territory.territoryDigest,
    implementationOwnerRef: implementation.implementationOwnerProductId,
    handlerRef: WORKSITE_FILE_REPLACE_HANDLER_REF,
    handlerDigest: WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
    predecessorObservationRef: predecessorObservation.observationRef,
    predecessorObservationDigest: predecessorObservation.observationDigest,
  };
  const authorizationDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "worksite_effect_authorization" as const,
    schemaVersion: "5.0.0" as const,
    authorizationRef: identity(
      "worksite-effect-authorization://abiogenesis",
      authorizationDigest,
    ),
    authorizationDigest,
    ...body,
  });
}

export function isWorksiteEffectAuthorization(
  value: unknown,
): value is WorksiteEffectAuthorization {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "authorizationDigest",
      "authorizationRef",
      "actorRef",
      "cCallRef",
      "cCallDigest",
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
      "implementationSetDigest",
      "implementationSetRef",
      "kind",
      "leafResolutionCandidateDigest",
      "leafResolutionCandidateRef",
      "predecessorObservationDigest",
      "predecessorObservationRef",
      "schemaVersion",
      "programDigest",
      "programRef",
      "subjectDigest",
      "subjectRef",
      "territoryDigest",
      "territoryRef",
      "workspaceBindingDigest",
      "workspaceBindingIdentity",
    ]) ||
    value.kind !== "worksite_effect_authorization" ||
    value.schemaVersion !== "5.0.0" ||
    value.effectUri !== WORKSITE_FILE_REPLACE_EFFECT_URI ||
    value.handlerRef !== WORKSITE_FILE_REPLACE_HANDLER_REF ||
    value.handlerDigest !== WORKSITE_FILE_REPLACE_HANDLER_DIGEST ||
    !nonEmptyString(value.authorizationRef) ||
    !isSha256Digest(value.authorizationDigest) ||
    !nonEmptyString(value.actorRef) ||
    !nonEmptyString(value.workspaceBindingIdentity) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !nonEmptyString(value.capabilityGrantRef) ||
    !isSha256Digest(value.capabilityGrantDigest) ||
    !nonEmptyString(value.executionBasisRef) ||
    !isSha256Digest(value.executionBasisDigest) ||
    !nonEmptyString(value.cCallRef) ||
    !isSha256Digest(value.cCallDigest) ||
    !nonEmptyString(value.programRef) ||
    !isSha256Digest(value.programDigest) ||
    !nonEmptyString(value.graphFunctionRef) ||
    !isSha256Digest(value.graphFunctionDigest) ||
    !nonEmptyString(value.implementationSetRef) ||
    !isSha256Digest(value.implementationSetDigest) ||
    !nonEmptyString(value.leafResolutionCandidateRef) ||
    !isSha256Digest(value.leafResolutionCandidateDigest) ||
    !nonEmptyString(value.implementationBindingRef) ||
    !isSha256Digest(value.implementationBindingDigest) ||
    !nonEmptyString(value.implementationRef) ||
    !nonEmptyString(value.implementationOwnerRef) ||
    !nonEmptyString(value.subjectRef) ||
    !isSha256Digest(value.subjectDigest) ||
    !nonEmptyString(value.territoryRef) ||
    !isSha256Digest(value.territoryDigest) ||
    !nonEmptyString(value.predecessorObservationRef) ||
    !isSha256Digest(value.predecessorObservationDigest)
  ) return false;
  const body = {
    actorRef: value.actorRef,
    workspaceBindingIdentity: value.workspaceBindingIdentity,
    workspaceBindingDigest: value.workspaceBindingDigest,
    capabilityGrantRef: value.capabilityGrantRef,
    capabilityGrantDigest: value.capabilityGrantDigest,
    executionBasisRef: value.executionBasisRef,
    executionBasisDigest: value.executionBasisDigest,
    cCallRef: value.cCallRef,
    cCallDigest: value.cCallDigest,
    programRef: value.programRef,
    programDigest: value.programDigest,
    graphFunctionRef: value.graphFunctionRef,
    graphFunctionDigest: value.graphFunctionDigest,
    implementationSetRef: value.implementationSetRef,
    implementationSetDigest: value.implementationSetDigest,
    leafResolutionCandidateRef: value.leafResolutionCandidateRef,
    leafResolutionCandidateDigest: value.leafResolutionCandidateDigest,
    implementationBindingRef: value.implementationBindingRef,
    implementationBindingDigest: value.implementationBindingDigest,
    implementationRef: value.implementationRef,
    effectUri: value.effectUri,
    subjectRef: value.subjectRef,
    subjectDigest: value.subjectDigest,
    territoryRef: value.territoryRef,
    territoryDigest: value.territoryDigest,
    implementationOwnerRef: value.implementationOwnerRef,
    handlerRef: value.handlerRef,
    handlerDigest: value.handlerDigest,
    predecessorObservationRef: value.predecessorObservationRef,
    predecessorObservationDigest: value.predecessorObservationDigest,
  };
  const digest = sha256Canonical(body);
  return value.authorizationDigest === digest &&
    value.authorizationRef ===
      identity("worksite-effect-authorization://abiogenesis", digest);
}

export function constructWorksiteFileReplaceReceipt(
  authorization: WorksiteEffectAuthorization,
  before: WorksiteObservation,
  after: FileWorksiteObservation,
  writtenDigest: Sha256Digest,
): WorksiteEffectRefusal | WorksiteFileReplaceReceipt {
  if (
    !isWorksiteEffectAuthorization(authorization) ||
    !isWorksiteObservation(before) ||
    !isWorksiteObservation(after) ||
    after.state !== "file" ||
    !isSha256Digest(writtenDigest) ||
    after.fileDigest !== writtenDigest ||
    authorization.predecessorObservationRef !== before.observationRef ||
    authorization.predecessorObservationDigest !== before.observationDigest ||
    before.workspaceBindingIdentity !== after.workspaceBindingIdentity ||
    before.subjectRef !== after.subjectRef ||
    before.subjectDigest !== after.subjectDigest
  ) {
    return worksiteRefusal(
      "successor_observation_mismatch",
      "committed receipt requires matching authorization, predecessor, successor, and written bytes",
    );
  }
  const body = {
    authorizationRef: authorization.authorizationRef,
    authorizationDigest: authorization.authorizationDigest,
    beforeObservationRef: before.observationRef,
    beforeObservationDigest: before.observationDigest,
    afterObservationRef: after.observationRef,
    afterObservationDigest: after.observationDigest,
    writtenDigest,
    committed: true as const,
  };
  const receiptDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "worksite_file_replace_receipt" as const,
    schemaVersion: "5.0.0" as const,
    receiptRef: identity(
      "worksite-file-replace-receipt://abiogenesis",
      receiptDigest,
    ),
    receiptDigest,
    ...body,
  });
}

export function isWorksiteFileReplaceReceipt(
  value: unknown,
): value is WorksiteFileReplaceReceipt {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "afterObservationDigest",
      "afterObservationRef",
      "authorizationDigest",
      "authorizationRef",
      "beforeObservationDigest",
      "beforeObservationRef",
      "committed",
      "kind",
      "receiptDigest",
      "receiptRef",
      "schemaVersion",
      "writtenDigest",
    ]) ||
    value.kind !== "worksite_file_replace_receipt" ||
    value.schemaVersion !== "5.0.0" ||
    value.committed !== true ||
    !nonEmptyString(value.receiptRef) ||
    !isSha256Digest(value.receiptDigest) ||
    !nonEmptyString(value.authorizationRef) ||
    !isSha256Digest(value.authorizationDigest) ||
    !nonEmptyString(value.beforeObservationRef) ||
    !isSha256Digest(value.beforeObservationDigest) ||
    !nonEmptyString(value.afterObservationRef) ||
    !isSha256Digest(value.afterObservationDigest) ||
    !isSha256Digest(value.writtenDigest)
  ) return false;
  const body = {
    authorizationRef: value.authorizationRef,
    authorizationDigest: value.authorizationDigest,
    beforeObservationRef: value.beforeObservationRef,
    beforeObservationDigest: value.beforeObservationDigest,
    afterObservationRef: value.afterObservationRef,
    afterObservationDigest: value.afterObservationDigest,
    writtenDigest: value.writtenDigest,
    committed: true as const,
  };
  const digest = sha256Canonical(body);
  return value.receiptDigest === digest &&
    value.receiptRef ===
      identity("worksite-file-replace-receipt://abiogenesis", digest);
}

/** A separate effect: atomic_replace never grants directory creation. */
export const WORKSITE_FILE_PARENTS_EFFECT_URI = "effect://abiogenesis/worksite/file.parents/v1";
export const WORKSITE_FILE_PARENTS_HANDLER_REF = "handler://abiogenesis/product/worksite/file.parents/v1";
export const WORKSITE_FILE_PARENTS_HANDLER_DIGEST = sha256Canonical({
  effectUri: WORKSITE_FILE_PARENTS_EFFECT_URI,
  handlerRef: WORKSITE_FILE_PARENTS_HANDLER_REF,
  operation: "parents_for_assessed_files", ownerClass: "selected_implementation", schemaVersion: "5.0.0",
});

export interface WorksiteFileParentsSource {
  readonly sourceEnvelopeRef: string;
  readonly sourceEnvelopeDigest: Sha256Digest;
  readonly sourceDesignAssetRef: string;
  readonly sourceDesignAssetDigest: Sha256Digest;
  readonly jobRef: string;
  readonly jobDigest: Sha256Digest;
  readonly targets: readonly Readonly<{ relativePath: string; territory: WorksiteTerritory }>[];
  readonly parentWriteRoots: readonly string[];
}
export interface WorksiteAncestorObservation {
  readonly relativePath: string;
  readonly state: "directory" | "absent";
  readonly fileIdentity: string | null;
}
export interface WorksiteFileParentsRequest extends WorksiteFileParentsSource {
  readonly kind: "worksite_file_parents_request";
  readonly schemaVersion: "5.0.0";
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly planRef: string;
  readonly planDigest: Sha256Digest;
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly capabilityGrant: CapabilityGrant;
  readonly ancestorObservations: readonly WorksiteAncestorObservation[];
}
export interface WorksiteFileParentsRequestInput extends WorksiteFileParentsSource {
  readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
  readonly workspaceBinding: WorkspaceBinding;
  readonly capabilityGrant: CapabilityGrant;
  readonly ancestorObservations: readonly WorksiteAncestorObservation[];
}
export type WorksiteFileParentsAuthorization = Omit<WorksiteEffectAuthorization,
  "kind" | "effectUri" | "handlerRef" | "handlerDigest" | "subjectRef" | "subjectDigest" |
  "territoryRef" | "territoryDigest" | "predecessorObservationRef" | "predecessorObservationDigest"
> & Readonly<{
  kind: "worksite_file_parents_authorization";
  effectUri: typeof WORKSITE_FILE_PARENTS_EFFECT_URI;
  handlerRef: typeof WORKSITE_FILE_PARENTS_HANDLER_REF;
  handlerDigest: Sha256Digest;
  requestRef: string;
  requestDigest: Sha256Digest;
  planRef: string;
  planDigest: Sha256Digest;
  jobRef: string;
  jobDigest: Sha256Digest;
}>;
export interface WorksiteFileParentOutcome {
  readonly relativePath: string;
  readonly disposition: "existing" | "created";
  readonly identityState: "known" | "unknown";
  readonly fileIdentity: string | null;
}
export interface WorksiteFileParentsReceipt {
  readonly kind: "worksite_file_parents_receipt";
  readonly schemaVersion: "5.0.0";
  readonly receiptRef: string;
  readonly receiptDigest: Sha256Digest;
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly authorizationRef: string;
  readonly authorizationDigest: Sha256Digest;
  readonly outcomes: readonly WorksiteFileParentOutcome[];
}
export interface WorksiteFileParentsSuccess {
  readonly kind: "worksite_file_parents_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "committed";
  readonly request: WorksiteFileParentsRequest;
  readonly authorization: WorksiteFileParentsAuthorization;
  readonly receipt: WorksiteFileParentsReceipt;
}
export interface WorksiteFileParentsFailure extends WorksiteEffectRefusal {
  readonly phase: "file_parents";
  readonly physicalOutcome: Readonly<{
    request: WorksiteFileParentsRequest;
    authorization: WorksiteFileParentsAuthorization;
    outcomes: readonly WorksiteFileParentOutcome[];
    diagnostics: readonly WorksiteEffectRefusal[];
  }>;
}
export type WorksiteFileParentsResult = WorksiteEffectRefusal | WorksiteFileParentsFailure | WorksiteFileParentsSuccess;

/** Includes A's root observation; only strict descendants can be created. */
export function worksiteFileParentPaths(targets: readonly Readonly<{ relativePath: string }>[]): readonly string[] {
  const paths = new Set<string>(["."]);
  for (const target of targets) {
    if (normalizeWorksiteRelativePath(target.relativePath, false) !== target.relativePath) return [];
    const segments = target.relativePath.split("/");
    for (let i = 1; i < segments.length; i += 1) paths.add(segments.slice(0, i).join("/"));
  }
  const depth = (path: string): number => path === "." ? 0 : path.split("/").length;
  return Object.freeze([...paths].sort((a, b) => depth(a) - depth(b) || (a < b ? -1 : a > b ? 1 : 0)));
}

function fileParentsSource(value: WorksiteFileParentsSource): WorksiteFileParentsSource {
  return {
    sourceEnvelopeRef: value.sourceEnvelopeRef, sourceEnvelopeDigest: value.sourceEnvelopeDigest,
    sourceDesignAssetRef: value.sourceDesignAssetRef, sourceDesignAssetDigest: value.sourceDesignAssetDigest,
    jobRef: value.jobRef, jobDigest: value.jobDigest, targets: value.targets, parentWriteRoots: value.parentWriteRoots,
  };
}

export function isWorksiteFileParentsRequest(value: unknown): value is WorksiteFileParentsRequest {
  try {
    if (!isRecord(value) || !hasExactKeys(value, [
      "kind", "schemaVersion", "requestRef", "requestDigest", "planRef", "planDigest",
      "workspaceAuthorityBasis", "workspaceBindingIdentity", "workspaceBindingDigest", "capabilityGrant",
      "sourceEnvelopeRef", "sourceEnvelopeDigest", "sourceDesignAssetRef", "sourceDesignAssetDigest",
      "jobRef", "jobDigest", "targets", "parentWriteRoots", "ancestorObservations",
    ]) || value.kind !== "worksite_file_parents_request" || value.schemaVersion !== "5.0.0" ||
      !isWorkspaceAuthorityBasis(value.workspaceAuthorityBasis) || !isCapabilityGrantValue(value.capabilityGrant) ||
      ![value.requestRef, value.planRef, value.workspaceBindingIdentity, value.sourceEnvelopeRef, value.sourceDesignAssetRef, value.jobRef].every(nonEmptyString) ||
      ![value.requestDigest, value.planDigest, value.workspaceBindingDigest, value.sourceEnvelopeDigest, value.sourceDesignAssetDigest, value.jobDigest].every(isSha256Digest) ||
      !Array.isArray(value.targets) || value.targets.length === 0 || !Array.isArray(value.parentWriteRoots) || value.parentWriteRoots.length === 0 ||
      !Array.isArray(value.ancestorObservations)) return false;
    const request = value as unknown as WorksiteFileParentsRequest;
    const grant = request.capabilityGrant;
    if (grant.operationId !== "abg.operation.run.invoke" || grant.definitionKey.operationId !== grant.operationId ||
      !["start", "invoke"].includes(grant.definitionKey.memberKey) || grant.scopeRef !== request.workspaceBindingIdentity ||
      grant.scopeDigest !== request.workspaceBindingDigest || grant.actorRef !== request.workspaceAuthorityBasis.authorizedActorRef ||
      new Set(request.parentWriteRoots).size !== request.parentWriteRoots.length ||
      request.parentWriteRoots.some(root => normalizeWorksiteRelativePath(root, true) !== root) ||
      new Set(request.targets.map(target => target.relativePath)).size !== request.targets.length ||
      request.targets.some(target => !isRecord(target) || !hasExactKeys(target, ["relativePath", "territory"]) ||
        normalizeWorksiteRelativePath(target.relativePath, false) !== target.relativePath || !isWorksiteTerritory(target.territory) ||
        target.territory.workspaceBindingIdentity !== request.workspaceBindingIdentity ||
        target.territory.workspaceBindingDigest !== request.workspaceBindingDigest ||
        target.territory.territoryUri !== expectedFileUri(request.workspaceAuthorityBasis.canonicalRoot, target.territory.relativeRoot) ||
        (target.territory.relativeRoot !== "." && !target.relativePath.startsWith(`${target.territory.relativeRoot}/`)))) return false;
    const paths = worksiteFileParentPaths(request.targets);
    if (paths.length !== request.ancestorObservations.length || request.targets.some(target => paths.includes(target.relativePath))) return false;
    const absent = new Set<string>();
    for (const [index, observation] of request.ancestorObservations.entries()) {
      if (!isRecord(observation) || !hasExactKeys(observation, ["relativePath", "state", "fileIdentity"]) ||
        observation.relativePath !== paths[index] ||
        !(observation.state === "directory" ? nonEmptyString(observation.fileIdentity) : observation.state === "absent" && observation.fileIdentity === null) ||
        (index === 0 && observation.state !== "directory")) return false;
      const path = observation.relativePath;
      if (path !== "." && !request.parentWriteRoots.some(root => root === "." || path === root || path.startsWith(`${root}/`))) return false;
      if (observation.state === "absent") absent.add(path);
      else if ([...absent].some(root => path.startsWith(`${root}/`))) return false;
    }
    const planDigest = sha256Canonical(fileParentsSource(request) as unknown as JsonValue);
    const { kind: _k, schemaVersion: _s, requestRef: _r, requestDigest: _d, ...body } = request;
    return request.planDigest === planDigest && request.planRef === identity("worksite-file-parent-plan://abiogenesis", planDigest) &&
      request.requestDigest === sha256Canonical(body as unknown as JsonValue) &&
      request.requestRef === identity("worksite-file-parents-request://abiogenesis", request.requestDigest);
  } catch { return false; }
}

export function constructWorksiteFileParentsRequest(input: WorksiteFileParentsRequestInput): WorksiteFileParentsRequest | WorksiteEffectRefusal {
  if (!exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding)) {
    return worksiteRefusal("binding_mismatch", "file parents require exact A/W");
  }
  const source = fileParentsSource(input);
  const planDigest = sha256Canonical(source as unknown as JsonValue);
  const body = {
    ...source, planRef: identity("worksite-file-parent-plan://abiogenesis", planDigest), planDigest,
    workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBindingIdentity: input.workspaceBinding.bindingId, workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    capabilityGrant: input.capabilityGrant, ancestorObservations: input.ancestorObservations,
  };
  const requestDigest = sha256Canonical(body as unknown as JsonValue);
  const result = deepFreeze({ kind: "worksite_file_parents_request" as const, schemaVersion: "5.0.0" as const,
    requestRef: identity("worksite-file-parents-request://abiogenesis", requestDigest), requestDigest, ...body });
  return isWorksiteFileParentsRequest(result) && input.targets.every(target => !protectedWorksitePath(input.workspaceAuthorityBasis, input.workspaceBinding, target.relativePath)) &&
    worksiteFileParentPaths(input.targets).filter(path => path !== ".").every(path => !protectedWorksitePath(input.workspaceAuthorityBasis, input.workspaceBinding, path))
    ? result : worksiteRefusal("invalid_coordinate", "file parents require an exact assessed target plan, separate parent bounds and complete ordered ancestor observations");
}

export function constructWorksiteFileParentsAuthorization(input: Omit<WorksiteEffectAuthorizationInput, "request"> & { readonly request: WorksiteFileParentsRequest }): WorksiteFileParentsAuthorization | WorksiteEffectRefusal {
  const { request, workspaceBinding: workspace, executionBasis: basis, cCall, implementationSet } = input;
  const implementation = exactImplementationSet(implementationSet) && exactCCall(cCall) ? selectedImplementation(implementationSet, cCall) : null;
  if (!isWorksiteFileParentsRequest(request) || !exactWorkspaceAuthorityJoin(request.workspaceAuthorityBasis, workspace) ||
    !exactExecutionBasis(basis) || implementation === null || cCall.callClass !== "leaf" || cCall.regime !== "F_D" ||
    cCall.implementationBindingRef === null || cCall.implementationRef === null ||
    request.workspaceBindingIdentity !== workspace.bindingId || request.workspaceBindingDigest !== workspace.bindingDigest ||
    basis.workspaceBindingId !== workspace.bindingId || basis.workspaceBindingDigest !== workspace.bindingDigest ||
    basis.actorRef !== workspace.authorizedActorRef || request.capabilityGrant.actorRef !== basis.actorRef ||
    cCall.basisId !== basis.basisRef || cCall.graphFunctionRef !== basis.graphFunctionRef ||
    cCall.implementationSetRef !== basis.implementationSetRef || implementationSet.implementationSetRef !== basis.implementationSetRef ||
    implementationSet.implementationSetDigest !== basis.implementationSetDigest) return worksiteRefusal("authorization_mismatch", "file-parent effect requires exact selected F_D authority, assessed request, job and grant");
  const body = {
    actorRef: basis.actorRef, workspaceBindingIdentity: workspace.bindingId, workspaceBindingDigest: workspace.bindingDigest,
    capabilityGrantRef: request.capabilityGrant.grantRef, capabilityGrantDigest: request.capabilityGrant.grantDigest,
    executionBasisRef: basis.basisRef, executionBasisDigest: basis.basisDigest, cCallRef: cCall.cCallRef, cCallDigest: cCall.cCallDigest,
    programRef: basis.programRef, programDigest: basis.programDigest, graphFunctionRef: basis.graphFunctionRef, graphFunctionDigest: basis.graphFunctionDigest,
    implementationSetRef: implementationSet.implementationSetRef, implementationSetDigest: implementationSet.implementationSetDigest,
    leafResolutionCandidateRef: implementation.leafResolutionCandidateRef, leafResolutionCandidateDigest: implementation.leafResolutionCandidateDigest,
    implementationBindingRef: cCall.implementationBindingRef, implementationBindingDigest: implementation.implementationBindingDigest,
    implementationRef: cCall.implementationRef, implementationOwnerRef: implementation.implementationOwnerProductId,
    effectUri: WORKSITE_FILE_PARENTS_EFFECT_URI as typeof WORKSITE_FILE_PARENTS_EFFECT_URI,
    handlerRef: WORKSITE_FILE_PARENTS_HANDLER_REF as typeof WORKSITE_FILE_PARENTS_HANDLER_REF, handlerDigest: WORKSITE_FILE_PARENTS_HANDLER_DIGEST,
    requestRef: request.requestRef, requestDigest: request.requestDigest, planRef: request.planRef, planDigest: request.planDigest,
    jobRef: request.jobRef, jobDigest: request.jobDigest,
  };
  const authorizationDigest = sha256Canonical(body);
  return deepFreeze({ kind: "worksite_file_parents_authorization", schemaVersion: "5.0.0", authorizationDigest,
    authorizationRef: identity("worksite-file-parents-authorization://abiogenesis", authorizationDigest), ...body });
}

export function isWorksiteFileParentsAuthorization(value: unknown): value is WorksiteFileParentsAuthorization {
  if (!isRecord(value) || !hasExactKeys(value, ["kind", "schemaVersion", "authorizationRef", "authorizationDigest",
    "actorRef", "workspaceBindingIdentity", "workspaceBindingDigest", "capabilityGrantRef", "capabilityGrantDigest",
    "executionBasisRef", "executionBasisDigest", "cCallRef", "cCallDigest", "programRef", "programDigest", "graphFunctionRef", "graphFunctionDigest",
    "implementationSetRef", "implementationSetDigest", "leafResolutionCandidateRef", "leafResolutionCandidateDigest",
    "implementationBindingRef", "implementationBindingDigest", "implementationRef", "implementationOwnerRef", "effectUri", "handlerRef", "handlerDigest",
    "requestRef", "requestDigest", "planRef", "planDigest", "jobRef", "jobDigest"]) ||
    value.kind !== "worksite_file_parents_authorization" || value.schemaVersion !== "5.0.0" ||
    value.effectUri !== WORKSITE_FILE_PARENTS_EFFECT_URI || value.handlerRef !== WORKSITE_FILE_PARENTS_HANDLER_REF ||
    value.handlerDigest !== WORKSITE_FILE_PARENTS_HANDLER_DIGEST ||
    Object.entries(value).some(([key, field]) => key.endsWith("Digest") ? !isSha256Digest(field) : !nonEmptyString(field))) return false;
  const { kind: _k, schemaVersion: _s, authorizationRef: _r, authorizationDigest: _d, ...body } = value;
  const digest = sha256Canonical(body as JsonValue);
  return value.authorizationDigest === digest && value.authorizationRef === identity("worksite-file-parents-authorization://abiogenesis", digest);
}

function fileParentsOutcomesValid(request: WorksiteFileParentsRequest, outcomes: unknown, complete: boolean): outcomes is readonly WorksiteFileParentOutcome[] {
  return Array.isArray(outcomes) && outcomes.length <= request.ancestorObservations.length &&
    (!complete || outcomes.length === request.ancestorObservations.length) && outcomes.every((outcome, index) => {
      const observed = request.ancestorObservations[index]!;
      return isRecord(outcome) && hasExactKeys(outcome, ["relativePath", "disposition", "identityState", "fileIdentity"]) &&
        outcome.relativePath === observed.relativePath && outcome.disposition === (observed.state === "directory" ? "existing" : "created") &&
        (outcome.identityState === "known" ? nonEmptyString(outcome.fileIdentity) &&
          (outcome.disposition !== "existing" || outcome.fileIdentity === observed.fileIdentity) :
          outcome.identityState === "unknown" && outcome.fileIdentity === null && !complete && outcome.disposition === "created" && index === outcomes.length - 1);
    });
}

function fileParentsAuthorityJoins(request: WorksiteFileParentsRequest, authorization: WorksiteFileParentsAuthorization): boolean {
  return authorization.actorRef === request.workspaceAuthorityBasis.authorizedActorRef &&
    authorization.requestRef === request.requestRef && authorization.requestDigest === request.requestDigest &&
    authorization.planRef === request.planRef && authorization.planDigest === request.planDigest &&
    authorization.jobRef === request.jobRef && authorization.jobDigest === request.jobDigest &&
    authorization.workspaceBindingIdentity === request.workspaceBindingIdentity && authorization.workspaceBindingDigest === request.workspaceBindingDigest &&
    authorization.capabilityGrantRef === request.capabilityGrant.grantRef && authorization.capabilityGrantDigest === request.capabilityGrant.grantDigest;
}

export function constructWorksiteFileParentsSuccess(request: WorksiteFileParentsRequest, authorization: WorksiteFileParentsAuthorization, outcomes: readonly WorksiteFileParentOutcome[]): WorksiteFileParentsSuccess | WorksiteEffectRefusal {
  if (!isWorksiteFileParentsRequest(request) || !isWorksiteFileParentsAuthorization(authorization) ||
    !fileParentsAuthorityJoins(request, authorization) || !fileParentsOutcomesValid(request, outcomes, true)) return worksiteRefusal("invalid_coordinate", "completed file-parent receipt needs the full known ordered chain and exact authority");
  const body = { requestRef: request.requestRef, requestDigest: request.requestDigest, authorizationRef: authorization.authorizationRef, authorizationDigest: authorization.authorizationDigest, outcomes };
  const receiptDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({ kind: "worksite_file_parents_result", schemaVersion: "5.0.0", disposition: "committed", request, authorization,
    receipt: { kind: "worksite_file_parents_receipt" as const, schemaVersion: "5.0.0" as const, receiptRef: identity("worksite-file-parents-receipt://abiogenesis", receiptDigest), receiptDigest, ...body } });
}

export function isWorksiteFileParentsSuccess(value: unknown): value is WorksiteFileParentsSuccess {
  if (!isRecord(value) || !hasExactKeys(value, ["kind", "schemaVersion", "disposition", "request", "authorization", "receipt"]) ||
    value.kind !== "worksite_file_parents_result" || value.schemaVersion !== "5.0.0" || value.disposition !== "committed" ||
    !isWorksiteFileParentsRequest(value.request) || !isWorksiteFileParentsAuthorization(value.authorization) || !isRecord(value.receipt)) return false;
  const outcomes = value.receipt.outcomes;
  if (!fileParentsOutcomesValid(value.request, outcomes, true)) return false;
  return canonicalJson(value as unknown as JsonValue) === canonicalJson(constructWorksiteFileParentsSuccess(value.request, value.authorization, outcomes) as unknown as JsonValue);
}

/** Keep first failure and ordered physical facts; never compensate by deletion. */
export function worksiteFileParentsFailure(request: WorksiteFileParentsRequest, authorization: WorksiteFileParentsAuthorization, outcomes: readonly WorksiteFileParentOutcome[], failure: WorksiteEffectRefusal, diagnostics: readonly WorksiteEffectRefusal[] = []): WorksiteFileParentsFailure {
  return deepFreeze({ ...failure, phase: "file_parents", physicalOutcome: { request, authorization, outcomes: [...outcomes], diagnostics: [...diagnostics] } });
}

export function isWorksiteFileParentsFailure(value: unknown): value is WorksiteFileParentsFailure {
  if (!isRecord(value) || !hasExactKeys(value, ["kind", "schemaVersion", "disposition", "code", "message", "lastObservation", "substrateCode", "phase", "physicalOutcome"]) ||
    value.kind !== "worksite_effect_refusal" || value.schemaVersion !== "5.0.0" || value.disposition !== "refused" || value.phase !== "file_parents" ||
    !isRecord(value.physicalOutcome) || !hasExactKeys(value.physicalOutcome, ["request", "authorization", "outcomes", "diagnostics"])) return false;
  const validRefusal = (item: unknown): boolean => isRecord(item) && hasExactKeys(item, ["kind", "schemaVersion", "disposition", "code", "message", "lastObservation", "substrateCode"]) &&
    item.kind === "worksite_effect_refusal" && item.schemaVersion === "5.0.0" && item.disposition === "refused" &&
    ["invalid_coordinate", "invalid_relative_path", "subject_outside_territory", "binding_mismatch", "authorization_mismatch", "invalid_worksite_root", "target_parent_missing", "target_not_file", "aliased_subject", "symlink_forbidden", "stale_observation", "replacement_invalid", "filesystem_refused", "successor_observation_mismatch"].includes(item.code as string) &&
    nonEmptyString(item.message) && item.lastObservation === null && (item.substrateCode === null || nonEmptyString(item.substrateCode));
  const { phase: _p, physicalOutcome: physical, ...failure } = value;
  return validRefusal(failure) && isWorksiteFileParentsRequest(physical.request) && isWorksiteFileParentsAuthorization(physical.authorization) &&
    fileParentsAuthorityJoins(physical.request, physical.authorization) && fileParentsOutcomesValid(physical.request, physical.outcomes, false) &&
    Array.isArray(physical.diagnostics) && physical.diagnostics.every(validRefusal);
}

export type WorksiteContextEntry = Readonly<{ relativePath: string; state: "directory"; fileIdentity: string; members: readonly string[] }> |
  Readonly<{ relativePath: string; state: "file"; fileIdentity: string; byteLength: number; digest: Sha256Digest; encoding: "base64"; bytes: string }> |
  Readonly<{ relativePath: string; state: "absent" }>;
export interface WorksiteContextObservation {
  readonly kind: "worksite_context_observation";
  readonly schemaVersion: "5.0.0";
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
  readonly workspaceAuthorityBasisRef: string;
  readonly workspaceAuthorityBasisDigest: Sha256Digest;
  readonly workspaceBindingIdentity: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly readRoots: readonly string[];
  readonly maxFiles: number;
  readonly maxBytes: number;
  readonly entries: readonly WorksiteContextEntry[];
}

/** Saved-context validation is pure; it neither refreshes nor reconstructs I/O. */
export function isWorksiteContextObservation(value: unknown): value is WorksiteContextObservation {
  try {
    if (!isRecord(value) || !hasExactKeys(value, ["kind", "schemaVersion", "observationRef", "observationDigest",
      "workspaceAuthorityBasisRef", "workspaceAuthorityBasisDigest", "workspaceBindingIdentity", "workspaceBindingDigest",
      "readRoots", "maxFiles", "maxBytes", "entries"]) || value.kind !== "worksite_context_observation" || value.schemaVersion !== "5.0.0" ||
      ![value.observationRef, value.workspaceAuthorityBasisRef, value.workspaceBindingIdentity].every(nonEmptyString) ||
      ![value.observationDigest, value.workspaceAuthorityBasisDigest, value.workspaceBindingDigest].every(isSha256Digest) ||
      !Number.isSafeInteger(value.maxFiles) || (value.maxFiles as number) < 1 || !Number.isSafeInteger(value.maxBytes) || (value.maxBytes as number) < 0 ||
      !Array.isArray(value.readRoots) || value.readRoots.length === 0 || new Set(value.readRoots).size !== value.readRoots.length ||
      value.readRoots.some(root => normalizeWorksiteRelativePath(root, true) !== root) ||
      !Array.isArray(value.entries) || value.entries.length > (value.maxFiles as number)) return false;
    const observation = value as unknown as WorksiteContextObservation;
    const paths = new Set<string>();
    let bytes = 0;
    let previous: string | null = null;
    for (const entry of observation.entries) {
      if (!isRecord(entry) || normalizeWorksiteRelativePath(entry.relativePath, true) !== entry.relativePath || paths.has(entry.relativePath) ||
        (previous !== null && previous >= entry.relativePath) ||
        !observation.readRoots.some(root => root === "." || entry.relativePath === root || entry.relativePath.startsWith(`${root}/`))) return false;
      paths.add(entry.relativePath);
      previous = entry.relativePath;
      if (entry.state === "absent") {
        if (!hasExactKeys(entry, ["relativePath", "state"]) || !observation.readRoots.includes(entry.relativePath)) return false;
      } else if (entry.state === "directory") {
        if (!hasExactKeys(entry, ["relativePath", "state", "fileIdentity", "members"]) || !nonEmptyString(entry.fileIdentity) || !Array.isArray(entry.members) ||
          entry.members.some((member, index) => !nonEmptyString(member) || member.includes("/") || member.includes("\\") || member === "." || member === ".." ||
            (index > 0 && entry.members[index - 1]! >= member))) return false;
      } else if (entry.state === "file") {
        if (!hasExactKeys(entry, ["relativePath", "state", "fileIdentity", "byteLength", "digest", "encoding", "bytes"]) || !nonEmptyString(entry.fileIdentity) ||
          !Number.isSafeInteger(entry.byteLength) || entry.byteLength < 0 || !isSha256Digest(entry.digest) || entry.encoding !== "base64" || typeof entry.bytes !== "string") return false;
        const actual = Buffer.from(entry.bytes, "base64");
        if (actual.toString("base64") !== entry.bytes || actual.length !== entry.byteLength || sha256Bytes(actual) !== entry.digest) return false;
        bytes += actual.length;
        if (bytes > observation.maxBytes) return false;
      } else return false;
    }
    if (observation.readRoots.some(root => !paths.has(root))) return false;
    for (const entry of observation.entries) {
      if (entry.state === "directory") {
        const childPaths = entry.members.map(member => entry.relativePath === "." ? member : `${entry.relativePath}/${member}`);
        if (childPaths.some(path => !paths.has(path)) || observation.entries.some(child => child.relativePath !== entry.relativePath &&
          posix.dirname(child.relativePath) === entry.relativePath && !childPaths.includes(child.relativePath))) return false;
      }
    }
    const { kind: _k, schemaVersion: _s, observationRef: _r, observationDigest: _d, ...body } = observation;
    const digest = sha256Canonical(body as unknown as JsonValue);
    return observation.observationDigest === digest && observation.observationRef === identity("worksite-context-observation://abiogenesis", digest);
  } catch { return false; }
}
