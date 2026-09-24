import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type AbgHistoricalDeclarationProof } from "../abg/terminal_result_contracts.js";
import { type WorksiteContextObservation } from "./worksite_effect.js";
import type { ActorProcessObservation } from "../abg/actor_process.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type CapabilityGrant } from "./invocation.js";
import { type WorksiteConstructionResult } from "./worksite_construction.js";
import { type FileWorksiteObservation, type WorksiteObservation, type WorksiteSubject } from "./worksite_effect.js";
import { type WorksiteRevisionCommandExecutionTask, type WorksiteRevisionCommandExecutionObservation, type WorksiteRevisionCommandHelperArtifact, type WorksiteRevisionSnapshotMember } from "./worksite_revision.js";
import { type ExecutableWorksiteCommandTask as WorksiteExecutionTask, type ExecutableWorksiteCommandObservation as WorksiteExecutionObservation, type ExecutableWorksiteCommandArtifact as WorksiteExecutionHelperArtifact, type ExecutableWorksiteSnapshotMember as WorksiteExecutionSnapshotMember, type WorksiteCommandForwardObservation } from "./worksite_command_forward.js";
import { type NativeWorkspaceWorkObservation } from "./native_workspace_work.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution_identity.js";
export { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution_identity.js";
export interface WorksiteCommandEnvironmentEntry {
    readonly kind: "worksite_command_environment_entry";
    readonly schemaVersion: "5.0.0";
    readonly name: string;
    readonly value: string;
}
export interface WorksiteDeclaredCommand {
    readonly kind: "worksite_declared_command";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly commandId: string;
    readonly executable: string;
    readonly args: readonly string[];
    readonly relativeCwd: string;
    readonly environment: readonly WorksiteCommandEnvironmentEntry[];
    readonly timeoutMs: number;
    readonly terminationGraceMs: number;
    readonly expectedReports: readonly WorksiteExpectedReport[];
}
export interface WorksiteExpectedReport {
    readonly kind: "worksite_expected_report";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly reportIdentity: string;
    readonly relativePath: string;
}
export interface WorksiteExpectedReportInput {
    readonly reportIdentity: string;
    readonly relativePath: string;
}
export interface WorksiteDeclaredCommandInput {
    readonly commandId: string;
    readonly executable: string;
    readonly args: readonly string[];
    readonly relativeCwd: string;
    readonly environment?: Readonly<Record<string, string>> | readonly WorksiteCommandEnvironmentEntry[];
    readonly timeoutMs: number;
    readonly terminationGraceMs: number;
    readonly expectedReports: readonly WorksiteExpectedReportInput[];
}
export interface WorksiteOutcomePredicate {
    readonly kind: "worksite_outcome_predicate";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly predicateId: string;
    readonly predicateKind: string;
    readonly declaration: JsonValue;
}
export interface WorksiteOutcomePredicateInput {
    readonly predicateId: string;
    readonly predicateKind: string;
    readonly declaration: JsonValue;
}
export interface WorksiteCommandExecutionLimits {
    readonly inactivityTimeoutMs: number;
    readonly absoluteTimeoutMs: number;
}
export declare function projectWorksiteCommandExecutionBudget(task: Readonly<{
    commands: readonly Pick<WorksiteDeclaredCommandInput, "timeoutMs" | "terminationGraceMs">[];
    outcomePredicates: readonly Pick<WorksiteOutcomePredicateInput, "predicateKind" | "declaration">[];
}>): Readonly<{
    rule: Readonly<{
        aggregation: "sum";
        commandFields: readonly ["timeoutMs", "terminationGraceMs"];
        httpResponseFields: {
            readonly launch: readonly ["timeoutMs", "terminationGraceMs"];
            readonly request: readonly ["timeoutMs"];
        };
        ownerAllowanceMs: number;
        limitComparison: "required_budget_strictly_less_than_each_limit";
        limitOrdering: "absolute_strictly_greater_than_inactivity";
    }>;
    commandBudgetMs: number;
    httpProbeBudgetMs: number;
    requiredExecutionBudgetMs: number;
}>;
export declare function worksiteCommandExecutionBudgetFits(requiredBudget: number, limits: WorksiteCommandExecutionLimits): boolean;
export interface WorksiteProtectedObservation {
    readonly kind: "worksite_protected_observation";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly sourceMemberRef: string;
    readonly subject: WorksiteSubject;
    readonly observation: FileWorksiteObservation;
}
export interface WorksiteProtectedObservationInput {
    readonly sourceMemberRef: string;
    readonly subject: WorksiteSubject;
    readonly observation: FileWorksiteObservation;
}
/** Initial-job read evidence, not a construction member or a revision grant.
 * ABG authenticates these coordinates against the same native bridge. */
export interface WorksiteReadDependencyBasis {
    readonly kind: "semantic_job_read_dependencies";
    readonly schemaVersion: "5.0.0";
    readonly jobRef: string;
    readonly jobDigest: Sha256Digest;
    readonly designAssetRef: string;
    readonly designAssetDigest: Sha256Digest;
    readonly contextObservationRef: string;
    readonly contextObservationDigest: Sha256Digest;
    readonly members: readonly WorksiteProtectedObservationInput[];
}
type ReadDependencyInput = Omit<WorksiteReadDependencyBasis, "kind" | "schemaVersion" | "members"> & {
    readonly members: readonly Omit<WorksiteProtectedObservationInput, "sourceMemberRef">[];
};
export declare function constructWorksiteReadDependencyBasis(input: ReadDependencyInput): WorksiteReadDependencyBasis;
export declare function isWorksiteReadDependencyBasis(value: unknown): value is WorksiteReadDependencyBasis;
export interface WorksiteCommandWriteTerritory {
    readonly kind: "worksite_command_write_territory";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly territoryRef: string;
    readonly territoryDigest: Sha256Digest;
    readonly pathKind: "file" | "subtree";
    readonly relativePath: string;
    readonly purpose: "execution_evidence";
}
export interface WorksiteCommandWriteTerritoryInput {
    readonly pathKind: "file" | "subtree";
    readonly relativePath: string;
}
export interface WorksiteCommandExecutionTask {
    readonly kind: "worksite_command_execution_task";
    readonly schemaVersion: "5.0.0";
    readonly taskRef: string;
    readonly taskDigest: Sha256Digest;
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly sourceConstructionResultRef: string;
    readonly sourceConstructionResultDigest: Sha256Digest;
    readonly sourceConstructionResult: WorksiteConstructionResult;
    readonly materializationPlanRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef;
    readonly rendererRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.rendererRef;
    readonly instructionContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef;
    readonly resultContractRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef;
    readonly workerActorRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef;
    readonly workerBindingRef: typeof WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef;
    readonly transportLane: "worker_executes";
    readonly commands: readonly WorksiteDeclaredCommand[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicate[];
    readonly protectedObservations: readonly WorksiteProtectedObservation[];
    readonly readDependencyBasis?: WorksiteReadDependencyBasis;
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritory[];
}
export interface WorksiteCommandExecutionTaskInput {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly sourceConstructionResultRef: string;
    readonly sourceConstructionResultDigest: Sha256Digest;
    readonly sourceConstructionResult: WorksiteConstructionResult;
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates?: readonly WorksiteOutcomePredicateInput[];
    readonly protectedObservations: readonly WorksiteProtectedObservationInput[];
    readonly readDependencyBasis?: WorksiteReadDependencyBasis;
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
}
/** Native source is an alternative, never a fabricated construction result. */
export interface NativeWorksiteCommandExecutionTask extends Omit<WorksiteCommandExecutionTask, "sourceConstructionResultRef" | "sourceConstructionResultDigest" | "sourceConstructionResult" | "readDependencyBasis"> {
    readonly sourceNativeWork: NativeWorkspaceWorkObservation;
    readonly sourceReacquisition?: NativeWorksiteCommandReacquisition;
}
/** An observed input identifies existing files; it asserts no author or prior Result. */
export interface ObservedWorksiteCommandExecutionTask extends Omit<WorksiteCommandExecutionTask, "sourceConstructionResultRef" | "sourceConstructionResultDigest" | "sourceConstructionResult" | "readDependencyBasis"> {
    readonly sourceObservedInput: Readonly<{
        kind: "observed_worksite_input";
        sourceSetRef: string;
        sourceSetDigest: Sha256Digest;
    }>;
}
export interface ObservedWorksiteCommandExecutionTaskInput extends Omit<WorksiteCommandExecutionTaskInput, "sourceConstructionResultRef" | "sourceConstructionResultDigest" | "sourceConstructionResult" | "protectedObservations" | "readDependencyBasis"> {
    readonly observedFiles: readonly Readonly<{
        subject: WorksiteSubject;
        observation: FileWorksiteObservation;
    }>[];
}
export interface ObservedWorksiteCommandExecutionObservation extends Omit<WorksiteCommandExecutionObservation, "task"> {
    readonly task: ObservedWorksiteCommandExecutionTask;
}
export type C2WorksiteCommandExecutionTask = WorksiteCommandExecutionTask | NativeWorksiteCommandExecutionTask | ObservedWorksiteCommandExecutionTask;
export interface NativeWorksiteCommandExecutionTaskInput extends Omit<WorksiteCommandExecutionTaskInput, "sourceConstructionResultRef" | "sourceConstructionResultDigest" | "sourceConstructionResult" | "protectedObservations" | "readDependencyBasis"> {
    readonly sourceNativeWork: NativeWorkspaceWorkObservation;
    readonly sourceReacquisition?: NativeWorksiteCommandReacquisition;
    /** Complete explicit snapshot selection, including retained unchanged files. */
    readonly selectedSources: readonly Readonly<{
        subjectUri: string;
        relativePath: string;
    }>[];
}
export interface NativeWorksiteCommandExecutionObservation extends Omit<WorksiteCommandExecutionObservation, "task"> {
    readonly task: NativeWorksiteCommandExecutionTask;
}
export declare const NATIVE_WORK_REACQUISITION_IDS: Readonly<{
    graphFunctionRef: "graph-function://abiogenesis/worksite/native-command-reacquisition@5";
    programRef: "program://abiogenesis/worksite/native-command-reacquisition@5";
    nodeRef: "node://abiogenesis/worksite/native-command-reacquisition@5";
    requestContractRef: "contract://abiogenesis/worksite/native-command-reacquisition-request@5";
    implementationRef: "implementation://abiogenesis/worksite/native-command-reacquisition-fd@5";
    implementationBindingRef: "implementation-binding://abiogenesis/worksite/native-command-reacquisition-fd@5";
    predicateRef: "predicate://abiogenesis/worksite/native-command-reacquisition@5";
    closureContractRef: "closure://abiogenesis/worksite/native-command-reacquisition@5";
    childClosureContractRef: "closure://abiogenesis/worksite/native-command-reacquisition-child@5";
}>;
export interface NativeWorksiteCommandReacquisitionRequest extends Omit<NativeWorksiteCommandExecutionTaskInput, "sourceReacquisition"> {
    readonly kind: "native_worksite_command_reacquisition_request";
    readonly schemaVersion: "5.0.0";
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly source: Readonly<{
        prefix: DurablePrefixCoordinate;
        graphCallRef: string;
        declarationProof: AbgHistoricalDeclarationProof;
    }>;
    /** Full existing read scope, not only the selected C2 snapshot sources. */
    readonly currentContext: WorksiteContextObservation;
}
export interface NativeWorksiteCommandReacquisition {
    readonly request: NativeWorksiteCommandReacquisitionRequest;
    readonly nativeBasis: Readonly<{
        predecessorPrefix: DurablePrefixCoordinate;
        cCallRef: string;
    }>;
    readonly bindingCoverEventRefs: readonly string[];
}
export declare function constructNativeWorksiteCommandReacquisitionRequest(input: Omit<NativeWorksiteCommandReacquisitionRequest, "kind" | "schemaVersion" | "requestRef" | "requestDigest">): NativeWorksiteCommandReacquisitionRequest;
export declare function isNativeWorksiteCommandReacquisitionRequest(value: unknown): value is NativeWorksiteCommandReacquisitionRequest;
export declare function constructNativeWorksiteCommandExecutionTask(input: NativeWorksiteCommandExecutionTaskInput): NativeWorksiteCommandExecutionTask;
export declare function isNativeWorksiteCommandExecutionTask(value: unknown): value is NativeWorksiteCommandExecutionTask;
/** Pure construction only. ABG binds these file claims to the current admitted
 * root input; the existing physical owner re-observes them before effects. */
export declare function constructObservedWorksiteCommandExecutionTask(input: ObservedWorksiteCommandExecutionTaskInput): ObservedWorksiteCommandExecutionTask;
export declare function isObservedWorksiteCommandExecutionTask(value: unknown): value is ObservedWorksiteCommandExecutionTask;
export declare function isC2WorksiteCommandExecutionTask(value: unknown): value is C2WorksiteCommandExecutionTask;
export interface WorksiteObservedStream {
    readonly kind: "worksite_observed_stream";
    readonly schemaVersion: "5.0.0";
    readonly encoding: "base64";
    readonly payload: string;
    readonly byteLength: number;
    readonly digest: Sha256Digest;
}
export interface WorksiteCommandResult {
    readonly kind: "worksite_command_result";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly commandId: string;
    readonly executable: string;
    readonly args: readonly string[];
    readonly relativeCwd: string;
    readonly environment: readonly WorksiteCommandEnvironmentEntry[];
    readonly timeoutMs: number;
    readonly terminationGraceMs: number;
    readonly exitStatus: number;
    readonly timedOut: boolean;
    readonly processSignal: string | null;
    readonly signalSequence: readonly ("SIGTERM" | "SIGKILL")[];
    readonly terminationConfirmed: boolean;
    readonly stdout: WorksiteObservedStream;
    readonly stderr: WorksiteObservedStream;
    readonly reports: readonly WorksiteReportObservation[];
    readonly reportCount: number;
    readonly observationRef: string;
    readonly observationDigest: Sha256Digest;
}
export interface WorksiteReportObservation {
    readonly kind: "worksite_report_observation";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly commandOrdinal: number;
    readonly commandId: string;
    readonly expectedReportIdentity: string;
    readonly relativePath: string;
    readonly state: "absent" | "file";
    readonly byteLength: number | null;
    readonly digest: Sha256Digest | null;
    readonly observationRef: string;
    readonly observationDigest: Sha256Digest;
}
export interface WorksitePredicateObservation {
    readonly kind: "worksite_predicate_observation";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly predicateId: string;
    readonly predicateKind: string;
    readonly observedValue: JsonValue;
    readonly evidence: readonly JsonValue[];
    readonly evidenceRefs: readonly string[];
}
export interface WorksitePathObservation {
    readonly kind: "worksite_path_observation";
    readonly schemaVersion: "5.0.0";
    readonly relativePath: string;
    readonly nodeKind: "directory" | "file" | "symlink";
    readonly digest: Sha256Digest;
    readonly byteLength: number | null;
    readonly symlinkTarget: string | null;
}
export interface WorksitePathDelta {
    readonly kind: "worksite_path_delta";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly changeKind: "changed" | "created" | "deleted";
    readonly relativePath: string;
    readonly before: WorksitePathObservation | null;
    readonly after: WorksitePathObservation | null;
    readonly matchedTerritoryRef: string | null;
}
export interface WorksiteCommandExecutionWorkerResult {
    readonly kind: "worksite_command_execution_worker_result";
    readonly schemaVersion: "5.0.0";
    readonly taskRef: string;
    readonly taskDigest: Sha256Digest;
    readonly attemptRef: string;
    readonly helperArtifactRef: string;
    readonly helperArtifactDigest: Sha256Digest;
}
export interface WorksiteCommandExecutionProvenance {
    readonly kind: "worksite_command_execution_provenance";
    readonly schemaVersion: "5.0.0";
    readonly actorInvocationRef: string;
    readonly actorRef: string;
    readonly workerBindingRef: string;
    readonly actorProcessRef: string;
    readonly transportBindingRef: string;
    readonly transportBindingDigest: Sha256Digest;
    readonly transportDigest: Sha256Digest;
    readonly toolCallCount: number;
    readonly helperArtifactPath: string;
    readonly helperArtifactRef: string;
    readonly helperArtifactDigest: Sha256Digest;
    readonly helperArtifactByteLength: number;
    readonly helperToolInvocation: Readonly<{
        readonly kind: "worker_tool_invocation_evidence";
        readonly schemaVersion: "5.0.0";
        readonly ordinal: number;
        readonly toolUseRef: string;
        readonly toolName: string;
        readonly inputDigest: Sha256Digest;
        readonly inputByteLength: number;
    }>;
    readonly helperPlan: WorksiteCommandExecutionHelperPlan;
}
export interface WorksiteCommandHelperArtifact {
    readonly kind: "worksite_command_helper_artifact";
    readonly schemaVersion: "5.0.0";
    readonly artifactRef: string;
    readonly artifactDigest: Sha256Digest;
    readonly taskRef: string;
    readonly taskDigest: Sha256Digest;
    readonly disposition: "product_mismatch" | "protected_mismatch" | "success" | "territory_mismatch";
    readonly commandResults: readonly WorksiteCommandResult[];
    readonly predicateObservations: readonly WorksitePredicateObservation[];
    readonly worksiteDelta: readonly WorksitePathDelta[];
    readonly productDelta: readonly WorksitePathDelta[];
    readonly snapshotRoot: string;
    readonly snapshotRef: string;
    readonly snapshotDigest: Sha256Digest;
    readonly snapshotMembers: readonly WorksiteSnapshotMember[];
    readonly protectedBefore: readonly WorksiteObservation[];
    readonly protectedAfter: readonly WorksiteObservation[];
}
export interface WorksiteSnapshotMember {
    readonly kind: "worksite_snapshot_member";
    readonly schemaVersion: "5.0.0";
    readonly ordinal: number;
    readonly sourceMemberRef: string;
    readonly sourceObservationRef: string;
    readonly sourceObservationDigest: Sha256Digest;
    readonly relativePath: string;
    readonly byteLength: number;
    readonly digest: Sha256Digest;
}
export interface WorksiteCommandExecutionHelperPlan {
    readonly kind: "worksite_command_execution_helper_plan";
    readonly schemaVersion: "5.0.0";
    readonly attemptRef: string;
    readonly helperModulePath: string;
    readonly taskManifestPath: string;
    readonly taskManifestDigest: Sha256Digest;
    readonly taskManifestByteLength: number;
    readonly artifactPath: string;
    readonly sandboxRoot: string;
    readonly toolCommand: string;
    readonly toolInputDigest: Sha256Digest;
    readonly toolInputByteLength: number;
}
export interface WorksiteCommandExecutionObservation {
    readonly kind: "worksite_command_execution_observation";
    readonly schemaVersion: "5.0.0";
    readonly observationRef: string;
    readonly observationDigest: Sha256Digest;
    readonly task: WorksiteCommandExecutionTask;
    readonly provenance: WorksiteCommandExecutionProvenance;
    readonly helperArtifactRef: string;
    readonly helperArtifactDigest: Sha256Digest;
    readonly commandResults: readonly WorksiteCommandResult[];
    readonly predicateObservations: readonly WorksitePredicateObservation[];
    readonly worksiteDelta: readonly WorksitePathDelta[];
    readonly productDelta: readonly WorksitePathDelta[];
    readonly snapshotRef: string;
    readonly snapshotDigest: Sha256Digest;
    readonly snapshotMembers: readonly WorksiteSnapshotMember[];
}
export interface WorksiteCommandExecutionFailure {
    readonly kind: "worksite_command_execution_failure";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: string;
    readonly diagnosticRef: string;
}
export declare function worksiteCommandExecutionHelperPlan(task: WorksiteExecutionTask, attemptRef: string): WorksiteCommandExecutionHelperPlan;
export declare function isWorksiteCommandExecutionHelperPlan(task: WorksiteExecutionTask, value: unknown): value is WorksiteCommandExecutionHelperPlan;
export declare function worksitePathIsAllowed(path: string, territories: readonly WorksiteCommandWriteTerritory[]): boolean;
export declare function matchingWorksiteTerritoryRef(path: string, territories: readonly WorksiteCommandWriteTerritory[]): string | null;
export interface WorksiteCommandConfigurationInput {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
    readonly protectedSubjects: readonly WorksiteSubject[];
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
}
/** Prospective, unbound JSON input view for existing C2 configuration producers.
 * Environment uses its ordinary object form, not the owner's bound rows.
 * This view is not validation: constructWorksiteCommandConfiguration retains
 * all relational, workspace, territory and normalization checks below. */
export declare function worksiteCommandConfigurationInputSchema(): Readonly<{
    commands: Readonly<Record<string, JsonValue>>;
    outcomePredicates: Readonly<Record<string, JsonValue>>;
}>;
/** Pure pre-construction checks; no source result or observation is fabricated. */
export declare function constructWorksiteCommandConfiguration(input: WorksiteCommandConfigurationInput): Readonly<{
    commands: readonly WorksiteDeclaredCommand[];
    predicates: readonly WorksiteOutcomePredicate[];
    allowedWriteTerritories: readonly WorksiteCommandWriteTerritory[];
}>;
export declare function constructWorksiteCommandExecutionTask(input: WorksiteCommandExecutionTaskInput): WorksiteCommandExecutionTask;
export declare function isWorksiteCommandExecutionTask(value: unknown): value is WorksiteCommandExecutionTask;
export interface WorksiteExecutionHelperArtifactInput {
    task: WorksiteExecutionTask;
    disposition: "product_mismatch" | "protected_mismatch" | "success" | "territory_mismatch";
    commandResults: readonly WorksiteCommandResult[];
    predicateObservations: readonly WorksitePredicateObservation[];
    worksiteDelta: readonly WorksitePathDelta[];
    productDelta: readonly WorksitePathDelta[];
    snapshotRoot: string;
    snapshotRef: string;
    snapshotDigest: Sha256Digest;
    snapshotMembers: readonly WorksiteExecutionSnapshotMember[];
    protectedBefore: readonly WorksiteObservation[];
    protectedAfter: readonly WorksiteObservation[];
}
export declare function constructWorksiteExecutionHelperArtifact(input: Readonly<WorksiteExecutionHelperArtifactInput>): WorksiteExecutionHelperArtifact;
export declare function isWorksiteExecutionHelperArtifact(task: WorksiteExecutionTask, value: unknown): value is WorksiteExecutionHelperArtifact;
export declare function helperArtifactPreservesProtectedObservations(task: WorksiteExecutionTask, artifact: WorksiteExecutionHelperArtifact): boolean;
export declare function isWorksiteCommandExecutionWorkerResult(value: unknown): value is WorksiteCommandExecutionWorkerResult;
export declare function constructWorksiteCommandExecutionWorkerResult(task: WorksiteExecutionTask, rawValue: unknown, helperPlan: WorksiteCommandExecutionHelperPlan): WorksiteCommandExecutionWorkerResult;
/** Same compact carrier shape, distinct closed revision artifact namespace. */
export declare function isWorksiteRevisionCommandExecutionWorkerResult(value: unknown): value is WorksiteCommandExecutionWorkerResult;
export declare function constructWorksiteExecutionObservation(task: WorksiteExecutionTask, workerResult: WorksiteCommandExecutionWorkerResult, actorObservation: ActorProcessObservation, helperArtifact: WorksiteExecutionHelperArtifact, helperPlan: WorksiteCommandExecutionHelperPlan): WorksiteExecutionObservation;
export declare function isWorksiteExecutionObservation(value: unknown): value is WorksiteExecutionObservation;
export declare function isWorksiteCommandExecutionFailure(value: unknown): value is WorksiteCommandExecutionFailure;
/** Product-owned rendering of exact task commands and outcome predicates. */
export declare function renderWorksiteCommandExecutionPrompt(task: WorksiteExecutionTask, helperPlan: WorksiteCommandExecutionHelperPlan): string;
export declare function worksiteCommandExecutionWorkerResultSchema(task: WorksiteExecutionTask, helperPlan: WorksiteCommandExecutionHelperPlan): Readonly<Record<string, JsonValue>>;
/** F_D admission checks carrier identity only; it never judges domain success. */
export declare function resolveWorksiteCommandExecutionJudgmentRelation(predicateRef: string): Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null;
export declare function constructWorksiteCommandHelperArtifact(input: Readonly<WorksiteExecutionHelperArtifactInput> & {
    task: WorksiteCommandExecutionTask;
    snapshotMembers: readonly WorksiteSnapshotMember[];
}): WorksiteCommandHelperArtifact;
export declare function constructWorksiteRevisionCommandHelperArtifact(input: Readonly<WorksiteExecutionHelperArtifactInput> & {
    task: WorksiteRevisionCommandExecutionTask;
    snapshotMembers: readonly WorksiteRevisionSnapshotMember[];
}): WorksiteRevisionCommandHelperArtifact;
export declare function isWorksiteCommandHelperArtifact(task: WorksiteCommandExecutionTask, value: unknown): value is WorksiteCommandHelperArtifact;
export declare function isWorksiteRevisionCommandHelperArtifact(task: WorksiteRevisionCommandExecutionTask, value: unknown): value is WorksiteRevisionCommandHelperArtifact;
export declare function constructWorksiteCommandExecutionObservation(task: WorksiteCommandExecutionTask, workerResult: WorksiteCommandExecutionWorkerResult, actorObservation: ActorProcessObservation, helperArtifact: WorksiteCommandHelperArtifact, helperPlan: WorksiteCommandExecutionHelperPlan): WorksiteCommandExecutionObservation;
export declare function constructWorksiteRevisionCommandExecutionObservation(task: WorksiteRevisionCommandExecutionTask, workerResult: WorksiteCommandExecutionWorkerResult, actorObservation: ActorProcessObservation, helperArtifact: WorksiteRevisionCommandHelperArtifact, helperPlan: WorksiteCommandExecutionHelperPlan): WorksiteRevisionCommandExecutionObservation;
export declare function isWorksiteCommandExecutionObservation(value: unknown): value is WorksiteCommandExecutionObservation;
export declare function isWorksiteRevisionCommandExecutionObservation(value: unknown): value is WorksiteRevisionCommandExecutionObservation;
export declare function isWorksiteCommandForwardObservation(value: unknown): value is WorksiteCommandForwardObservation;
export declare function isNativeWorksiteCommandExecutionObservation(value: unknown): value is NativeWorksiteCommandExecutionObservation;
export declare function isObservedWorksiteCommandExecutionObservation(value: unknown): value is ObservedWorksiteCommandExecutionObservation;
