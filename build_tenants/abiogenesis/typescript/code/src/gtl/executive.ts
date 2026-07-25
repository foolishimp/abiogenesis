import type { JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { C, cCarrier } from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RootModuleArtifactBasis,
} from "./contracts.js";

export const EXECUTIVE_PROPOSAL_KIND_VALUES = Object.freeze([
  "abstract",
  "anneal",
  "calibrate",
  "demote",
  "lay_rail",
  "promote",
  "pull_up",
] as const);

export type ExecutiveProposalKind =
  (typeof EXECUTIVE_PROPOSAL_KIND_VALUES)[number];

export const EXECUTIVE_IDS = Object.freeze({
  ownerRef: "owner://abg/substrate",
  moduleRef: "module://abg/executive@5",
  observerProgramRef: "gtl://abg/observer/default",
  tunerProgramRef: "gtl://abg/tuner/default",
  observerStartRef: "start://abg/observer/default@5",
  tunerStartRef: "start://abg/tuner/default@5",
  observerGraphFunctionRef: "graph-function://abg/observer/default@5",
  tunerGraphFunctionRef: "graph-function://abg/tuner/default@5",
  observerGraphRef: "graph://abg/observer/default@5",
  tunerGraphRef: "graph://abg/tuner/default@5",
  observerNodeRef: "locus://abg/observer/default@5",
  tunerNodeRef: "locus://abg/tuner/default@5",
  replaySnapshotContractRef:
    "contract://abg/executive/replay-snapshot@5",
  observerReportContractRef:
    "contract://abg/executive/observer-report@5",
  tuningSignalContractRef:
    "contract://abg/executive/tuning-signal-basis@5",
  declarationDraftContractRef:
    "contract://abg/executive/declaration-draft@5",
  failureContractRef: "contract://abg/executive/failure@5",
  refusalContractRef: "contract://abg/executive/refusal@5",
  evidenceContractRef: "contract://abg/executive/evidence@5",
  judgmentContractRef: "contract://abg/executive/judgment@5",
  transitionContractRef: "contract://abg/executive/draft-transition@5",
  observerClosureContractRef: "closure://abg/observer/default@5",
  tunerClosureContractRef: "closure://abg/tuner/default@5",
  observerPredicateRef: "predicate://abg/observer/replay-report@5",
  tunerPredicateRef: "predicate://abg/tuner/declaration-draft@5",
  observerImplementationBindingRef:
    "implementation-binding://abg/observer/default@5",
  tunerImplementationBindingRef:
    "implementation-binding://abg/tuner/default@5",
  observerImplementationRef: "implementation://abg/observer/default@5",
  tunerImplementationRef: "implementation://abg/tuner/default@5",
  productSemanticsBindingRef: "product-semantics://abiogenesis/system@5",
});

export interface ExecutiveReplayEventRow {
  readonly admissionOrdinal: number;
  readonly eventRef: string;
  readonly eventKind: string;
  readonly payloadDigest: Sha256Digest;
}

export interface ExecutiveReplaySnapshot {
  readonly kind: "executive_replay_snapshot";
  readonly schemaVersion: "5.0.0";
  readonly snapshotRef: string;
  readonly snapshotDigest: Sha256Digest;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly runId: string | null;
  readonly replayRef: string;
  readonly replayDigest: Sha256Digest;
  readonly eventStoreDigest: Sha256Digest;
  readonly eventRows: readonly ExecutiveReplayEventRow[];
  readonly haltClassification:
    | "active"
    | "blocked"
    | "closed"
    | "failed"
    | "gap_stopped"
    | "held"
    | "refused"
    | "stopped"
    | "workspace";
  readonly evidenceRefs: readonly string[];
  readonly resultRefs: readonly string[];
  readonly routeRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export interface ExecutiveObserverFinding {
  readonly findingRef: string;
  readonly code:
    | "halt_requires_attention"
    | "replay_terminal_contradiction";
  readonly severity: "info" | "warning";
  readonly evidenceEventRefs: readonly string[];
  readonly message: string;
}

export interface ExecutiveObserverReport {
  readonly kind: "executive_observer_report";
  readonly schemaVersion: "5.0.0";
  readonly reportRef: string;
  readonly reportDigest: Sha256Digest;
  readonly observerRef: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly replaySnapshotRef: string;
  readonly replaySnapshotDigest: Sha256Digest;
  readonly eventStoreDigest: Sha256Digest;
  readonly haltClassification: ExecutiveReplaySnapshot["haltClassification"];
  readonly green: boolean;
  readonly findings: readonly ExecutiveObserverFinding[];
  readonly sourceEventRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface ExecutiveTuningSignal {
  readonly kind: "executive_tuning_signal";
  readonly schemaVersion: "5.0.0";
  readonly signalRef: string;
  readonly signalDigest: Sha256Digest;
  readonly signalKind:
    | "adapter_gap_count"
    | "closure_rate"
    | "composition_entropy"
    | "contract_cost"
    | "defect_recurrence"
    | "rail_break"
    | "repeated_path_shape"
    | "retry_density";
  readonly metricValue: number;
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
  readonly sourceEventRefs: readonly string[];
}

export interface ExecutiveTuningInput {
  readonly kind: "executive_tuning_input";
  readonly schemaVersion: "5.0.0";
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly observerReport: ExecutiveObserverReport;
  readonly signals: readonly ExecutiveTuningSignal[];
  readonly proposerRef: string;
  readonly affectedDeclarationRefs: readonly string[];
  readonly proposalKind: ExecutiveProposalKind;
  readonly beforeDigest: Sha256Digest;
  readonly proposedAfterDigest: Sha256Digest;
  readonly equivalenceContractRef: string | null;
}

export interface ExecutiveDeclarationDraft {
  readonly kind: "executive_declaration_draft";
  readonly schemaVersion: "5.0.0";
  readonly draftRef: string;
  readonly draftDigest: Sha256Digest;
  readonly proposerRef: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly observerReportRef: string;
  readonly observerReportDigest: Sha256Digest;
  readonly replaySnapshotRef: string;
  readonly replaySnapshotDigest: Sha256Digest;
  readonly signalRefs: readonly string[];
  readonly signalDigests: readonly Sha256Digest[];
  readonly affectedDeclarationRefs: readonly string[];
  readonly proposalKind: ExecutiveProposalKind;
  readonly beforeDigest: Sha256Digest;
  readonly proposedAfterDigest: Sha256Digest;
  readonly equivalenceContractRef: string | null;
  readonly summary: string;
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  const exact = [...expected].sort();
  return keys.length === exact.length &&
    keys.every((key, index) => key === exact[index]);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isReplayEventRow(value: unknown): value is ExecutiveReplayEventRow {
  return isRecord(value) &&
    hasExactKeys(value, [
      "admissionOrdinal",
      "eventKind",
      "eventRef",
      "payloadDigest",
    ]) &&
    Number.isSafeInteger(value.admissionOrdinal) &&
    Number(value.admissionOrdinal) > 0 &&
    isNonEmptyString(value.eventRef) &&
    isNonEmptyString(value.eventKind) &&
    isSha256Digest(value.payloadDigest);
}

function identity(prefix: string, digest: Sha256Digest): string {
  return `${prefix}/${digest.slice("sha256:".length)}`;
}

export function isExecutiveReplaySnapshot(
  value: unknown,
): value is ExecutiveReplaySnapshot {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "continuationRefs",
      "eventRows",
      "eventStoreDigest",
      "evidenceRefs",
      "haltClassification",
      "kind",
      "policyRefs",
      "replayDigest",
      "replayRef",
      "resultRefs",
      "routeRefs",
      "runId",
      "schemaVersion",
      "snapshotDigest",
      "snapshotRef",
      "subjectDigest",
      "subjectRef",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    value.kind !== "executive_replay_snapshot" ||
    value.schemaVersion !== "5.0.0" ||
    !isNonEmptyString(value.snapshotRef) ||
    !isSha256Digest(value.snapshotDigest) ||
    !isNonEmptyString(value.workspaceBindingId) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !isNonEmptyString(value.subjectRef) ||
    !isSha256Digest(value.subjectDigest) ||
    !(value.runId === null || isNonEmptyString(value.runId)) ||
    !isNonEmptyString(value.replayRef) ||
    !isSha256Digest(value.replayDigest) ||
    !isSha256Digest(value.eventStoreDigest) ||
    !Array.isArray(value.eventRows) ||
    !value.eventRows.every(isReplayEventRow) ||
    ![
      "active",
      "blocked",
      "closed",
      "failed",
      "gap_stopped",
      "held",
      "refused",
      "stopped",
      "workspace",
    ].includes(String(value.haltClassification)) ||
    !isStringArray(value.evidenceRefs) ||
    !isStringArray(value.resultRefs) ||
    !isStringArray(value.routeRefs) ||
    !isStringArray(value.continuationRefs) ||
    !isStringArray(value.policyRefs)
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    snapshotRef: _snapshotRef,
    snapshotDigest: _snapshotDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.snapshotDigest === digest &&
    value.snapshotRef === identity("replay-snapshot://abg", digest) &&
    value.eventRows.every(
      (row, index) =>
        index === 0 ||
        row.admissionOrdinal >
          (value.eventRows[index - 1]?.admissionOrdinal ?? 0),
    );
}

function isObserverFinding(
  value: unknown,
): value is ExecutiveObserverFinding {
  return isRecord(value) &&
    hasExactKeys(value, [
      "code",
      "evidenceEventRefs",
      "findingRef",
      "message",
      "severity",
    ]) &&
    isNonEmptyString(value.findingRef) &&
    (
      value.code === "halt_requires_attention" ||
      value.code === "replay_terminal_contradiction"
    ) &&
    (value.severity === "info" || value.severity === "warning") &&
    isStringArray(value.evidenceEventRefs) &&
    isNonEmptyString(value.message);
}

export function isExecutiveObserverReport(
  value: unknown,
): value is ExecutiveObserverReport {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "eventStoreDigest",
      "evidenceRefs",
      "findings",
      "green",
      "haltClassification",
      "kind",
      "observerRef",
      "provenanceRefs",
      "replaySnapshotDigest",
      "replaySnapshotRef",
      "reportDigest",
      "reportRef",
      "schemaVersion",
      "sourceEventRefs",
      "subjectDigest",
      "subjectRef",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    value.kind !== "executive_observer_report" ||
    value.schemaVersion !== "5.0.0" ||
    !isNonEmptyString(value.reportRef) ||
    !isSha256Digest(value.reportDigest) ||
    value.observerRef !== EXECUTIVE_IDS.observerGraphFunctionRef ||
    !isNonEmptyString(value.workspaceBindingId) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !isNonEmptyString(value.subjectRef) ||
    !isSha256Digest(value.subjectDigest) ||
    !isNonEmptyString(value.replaySnapshotRef) ||
    !isSha256Digest(value.replaySnapshotDigest) ||
    !isSha256Digest(value.eventStoreDigest) ||
    typeof value.green !== "boolean" ||
    !Array.isArray(value.findings) ||
    !value.findings.every(isObserverFinding) ||
    !isStringArray(value.sourceEventRefs) ||
    !isStringArray(value.evidenceRefs) ||
    !isStringArray(value.provenanceRefs)
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    reportRef: _reportRef,
    reportDigest: _reportDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.reportDigest === digest &&
    value.reportRef === identity("observer-report://abg", digest) &&
    value.green === (value.findings.length === 0);
}

export function isExecutiveTuningSignal(
  value: unknown,
): value is ExecutiveTuningSignal {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "metricValue",
      "observationDigest",
      "observationRef",
      "schemaVersion",
      "signalDigest",
      "signalKind",
      "signalRef",
      "sourceEventRefs",
    ]) ||
    value.kind !== "executive_tuning_signal" ||
    value.schemaVersion !== "5.0.0" ||
    !isNonEmptyString(value.signalRef) ||
    !isSha256Digest(value.signalDigest) ||
    ![
      "adapter_gap_count",
      "closure_rate",
      "composition_entropy",
      "contract_cost",
      "defect_recurrence",
      "rail_break",
      "repeated_path_shape",
      "retry_density",
    ].includes(String(value.signalKind)) ||
    typeof value.metricValue !== "number" ||
    !Number.isFinite(value.metricValue) ||
    !isNonEmptyString(value.observationRef) ||
    !isSha256Digest(value.observationDigest) ||
    !isStringArray(value.sourceEventRefs)
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    signalRef: _signalRef,
    signalDigest: _signalDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.signalDigest === digest &&
    value.signalRef === identity("tuning-signal://abg", digest);
}

export function constructExecutiveTuningSignal(input: Readonly<{
  readonly signalKind: ExecutiveTuningSignal["signalKind"];
  readonly metricValue: number;
  readonly observationRef: string;
  readonly observationDigest: Sha256Digest;
  readonly sourceEventRefs: readonly string[];
}>): Readonly<ExecutiveTuningSignal> {
  const body = {
    signalKind: input.signalKind,
    metricValue: input.metricValue,
    observationRef: input.observationRef,
    observationDigest: input.observationDigest,
    sourceEventRefs: [...input.sourceEventRefs],
  };
  const signalDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "executive_tuning_signal" as const,
    schemaVersion: "5.0.0" as const,
    signalRef: identity("tuning-signal://abg", signalDigest),
    signalDigest,
    ...body,
  });
}

export function isExecutiveTuningInput(
  value: unknown,
): value is ExecutiveTuningInput {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "affectedDeclarationRefs",
      "beforeDigest",
      "equivalenceContractRef",
      "inputDigest",
      "inputRef",
      "kind",
      "observerReport",
      "proposalKind",
      "proposedAfterDigest",
      "proposerRef",
      "schemaVersion",
      "signals",
    ]) ||
    value.kind !== "executive_tuning_input" ||
    value.schemaVersion !== "5.0.0" ||
    !isNonEmptyString(value.inputRef) ||
    !isSha256Digest(value.inputDigest) ||
    !isExecutiveObserverReport(value.observerReport) ||
    !Array.isArray(value.signals) ||
    value.signals.length === 0 ||
    !value.signals.every(isExecutiveTuningSignal) ||
    !isNonEmptyString(value.proposerRef) ||
    !isStringArray(value.affectedDeclarationRefs) ||
    value.affectedDeclarationRefs.length === 0 ||
    !EXECUTIVE_PROPOSAL_KIND_VALUES.includes(
      value.proposalKind as ExecutiveProposalKind,
    ) ||
    !isSha256Digest(value.beforeDigest) ||
    !isSha256Digest(value.proposedAfterDigest) ||
    !(
      value.equivalenceContractRef === null ||
      isNonEmptyString(value.equivalenceContractRef)
    ) ||
    (value.proposalKind === "anneal" &&
      value.equivalenceContractRef === null) ||
    value.signals.some(
      (signal) =>
        signal.observationRef !== value.observerReport.reportRef ||
        signal.observationDigest !== value.observerReport.reportDigest,
    )
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    inputRef: _inputRef,
    inputDigest: _inputDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.inputDigest === digest &&
    value.inputRef === identity("tuning-input://abg", digest);
}

export function constructExecutiveTuningInput(input: Readonly<{
  readonly observerReport: ExecutiveObserverReport;
  readonly signals: readonly ExecutiveTuningSignal[];
  readonly proposerRef: string;
  readonly affectedDeclarationRefs: readonly string[];
  readonly proposalKind: ExecutiveProposalKind;
  readonly beforeDigest: Sha256Digest;
  readonly proposedAfterDigest: Sha256Digest;
  readonly equivalenceContractRef: string | null;
}>): Readonly<ExecutiveTuningInput> {
  const body = {
    observerReport: input.observerReport,
    signals: [...input.signals],
    proposerRef: input.proposerRef,
    affectedDeclarationRefs: [...input.affectedDeclarationRefs],
    proposalKind: input.proposalKind,
    beforeDigest: input.beforeDigest,
    proposedAfterDigest: input.proposedAfterDigest,
    equivalenceContractRef: input.equivalenceContractRef,
  };
  const inputDigest = sha256Canonical(body as unknown as JsonValue);
  const value = deepFreeze({
    kind: "executive_tuning_input" as const,
    schemaVersion: "5.0.0" as const,
    inputRef: identity("tuning-input://abg", inputDigest),
    inputDigest,
    ...body,
  });
  if (!isExecutiveTuningInput(value)) {
    throw new TypeError("executive tuning input is not contract-valid");
  }
  return value;
}

export function isExecutiveDeclarationDraft(
  value: unknown,
): value is ExecutiveDeclarationDraft {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "affectedDeclarationRefs",
      "beforeDigest",
      "draftDigest",
      "draftRef",
      "equivalenceContractRef",
      "kind",
      "observerReportDigest",
      "observerReportRef",
      "proposalKind",
      "proposedAfterDigest",
      "proposerRef",
      "replaySnapshotDigest",
      "replaySnapshotRef",
      "schemaVersion",
      "signalDigests",
      "signalRefs",
      "summary",
      "workspaceBindingDigest",
      "workspaceBindingId",
    ]) ||
    value.kind !== "executive_declaration_draft" ||
    value.schemaVersion !== "5.0.0" ||
    !isNonEmptyString(value.draftRef) ||
    !isSha256Digest(value.draftDigest) ||
    !isNonEmptyString(value.proposerRef) ||
    !isNonEmptyString(value.workspaceBindingId) ||
    !isSha256Digest(value.workspaceBindingDigest) ||
    !isNonEmptyString(value.observerReportRef) ||
    !isSha256Digest(value.observerReportDigest) ||
    !isNonEmptyString(value.replaySnapshotRef) ||
    !isSha256Digest(value.replaySnapshotDigest) ||
    !isStringArray(value.signalRefs) ||
    !Array.isArray(value.signalDigests) ||
    !value.signalDigests.every(isSha256Digest) ||
    value.signalRefs.length === 0 ||
    value.signalRefs.length !== value.signalDigests.length ||
    !isStringArray(value.affectedDeclarationRefs) ||
    !EXECUTIVE_PROPOSAL_KIND_VALUES.includes(
      value.proposalKind as ExecutiveProposalKind,
    ) ||
    !isSha256Digest(value.beforeDigest) ||
    !isSha256Digest(value.proposedAfterDigest) ||
    !(
      value.equivalenceContractRef === null ||
      isNonEmptyString(value.equivalenceContractRef)
    ) ||
    (value.proposalKind === "anneal" &&
      value.equivalenceContractRef === null) ||
    !isNonEmptyString(value.summary)
  ) {
    return false;
  }
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    draftRef: _draftRef,
    draftDigest: _draftDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.draftDigest === digest &&
    value.draftRef === identity("declaration-draft://abg", digest);
}

export function projectExecutiveObserverReport(
  snapshot: Readonly<ExecutiveReplaySnapshot>,
): Readonly<ExecutiveObserverReport> {
  if (!isExecutiveReplaySnapshot(snapshot)) {
    throw new TypeError("observer requires one admitted replay snapshot");
  }
  const eventKinds = snapshot.eventRows.map((row) => row.eventKind);
  const terminalContradiction =
    (snapshot.haltClassification === "closed" &&
      !eventKinds.includes("run_closed")) ||
    (snapshot.haltClassification !== "closed" &&
      eventKinds.includes("run_closed"));
  const findings: ExecutiveObserverFinding[] = [];
  if (terminalContradiction) {
    const findingBody = {
      code: "replay_terminal_contradiction" as const,
      severity: "warning" as const,
      evidenceEventRefs: snapshot.eventRows.map((row) => row.eventRef),
      message:
        "Replay halt classification contradicts its admitted terminal event truth.",
    };
    const findingDigest = sha256Canonical(
      findingBody as unknown as JsonValue,
    );
    findings.push({
      findingRef: identity("observer-finding://abg", findingDigest),
      ...findingBody,
    });
  } else if (
    !["closed", "workspace"].includes(snapshot.haltClassification)
  ) {
    const findingBody = {
      code: "halt_requires_attention" as const,
      severity: "info" as const,
      evidenceEventRefs: snapshot.eventRows.map((row) => row.eventRef),
      message:
        `Replay halted with ${snapshot.haltClassification}; follow-up remains external to the observer.`,
    };
    const findingDigest = sha256Canonical(
      findingBody as unknown as JsonValue,
    );
    findings.push({
      findingRef: identity("observer-finding://abg", findingDigest),
      ...findingBody,
    });
  }
  const body = {
    observerRef: EXECUTIVE_IDS.observerGraphFunctionRef,
    workspaceBindingId: snapshot.workspaceBindingId,
    workspaceBindingDigest: snapshot.workspaceBindingDigest,
    subjectRef: snapshot.subjectRef,
    subjectDigest: snapshot.subjectDigest,
    replaySnapshotRef: snapshot.snapshotRef,
    replaySnapshotDigest: snapshot.snapshotDigest,
    eventStoreDigest: snapshot.eventStoreDigest,
    haltClassification: snapshot.haltClassification,
    green: findings.length === 0,
    findings,
    sourceEventRefs: snapshot.eventRows.map((row) => row.eventRef),
    evidenceRefs: snapshot.evidenceRefs,
    provenanceRefs: [
      snapshot.snapshotRef,
      snapshot.replayRef,
      snapshot.workspaceBindingId,
    ],
  };
  const reportDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "executive_observer_report" as const,
    schemaVersion: "5.0.0" as const,
    reportRef: identity("observer-report://abg", reportDigest),
    reportDigest,
    ...body,
  });
}

export function projectExecutiveDeclarationDraft(
  input: Readonly<ExecutiveTuningInput>,
): Readonly<ExecutiveDeclarationDraft> {
  if (!isExecutiveTuningInput(input)) {
    throw new TypeError(
      "tuner requires one admitted observer report and signal basis",
    );
  }
  const body = {
    proposerRef: input.proposerRef,
    workspaceBindingId: input.observerReport.workspaceBindingId,
    workspaceBindingDigest: input.observerReport.workspaceBindingDigest,
    observerReportRef: input.observerReport.reportRef,
    observerReportDigest: input.observerReport.reportDigest,
    replaySnapshotRef: input.observerReport.replaySnapshotRef,
    replaySnapshotDigest: input.observerReport.replaySnapshotDigest,
    signalRefs: input.signals.map((signal) => signal.signalRef),
    signalDigests: input.signals.map((signal) => signal.signalDigest),
    affectedDeclarationRefs: input.affectedDeclarationRefs,
    proposalKind: input.proposalKind,
    beforeDigest: input.beforeDigest,
    proposedAfterDigest: input.proposedAfterDigest,
    equivalenceContractRef: input.equivalenceContractRef,
    summary:
      `${input.proposalKind} proposal grounded in ${input.signals.length} replay-derived signal(s).`,
  };
  const draftDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "executive_declaration_draft" as const,
    schemaVersion: "5.0.0" as const,
    draftRef: identity("declaration-draft://abg", draftDigest),
    draftDigest,
    ...body,
  });
}

export function resolveExecutiveJudgmentRelation(predicateRef: string) {
  if (predicateRef === EXECUTIVE_IDS.observerPredicateRef) {
    return Object.freeze({
      predicateRef,
      advanceReasonRef: "reason://abg/observer/report-valid@5",
      rejectionReasonRef: "reason://abg/observer/report-invalid@5",
      evaluate: (input: unknown, output: unknown) =>
        isExecutiveReplaySnapshot(input) &&
        isExecutiveObserverReport(output) &&
        sha256Canonical(output as unknown as JsonValue) ===
          sha256Canonical(
            projectExecutiveObserverReport(input) as unknown as JsonValue,
          ),
    });
  }
  if (predicateRef === EXECUTIVE_IDS.tunerPredicateRef) {
    return Object.freeze({
      predicateRef,
      advanceReasonRef: "reason://abg/tuner/draft-valid@5",
      rejectionReasonRef: "reason://abg/tuner/draft-invalid@5",
      evaluate: (input: unknown, output: unknown) =>
        isExecutiveTuningInput(input) &&
        isExecutiveDeclarationDraft(output) &&
        sha256Canonical(output as unknown as JsonValue) ===
          sha256Canonical(
            projectExecutiveDeclarationDraft(input) as unknown as JsonValue,
          ),
    });
  }
  return null;
}

function constructLeafGraphFunction(input: Readonly<{
  readonly graphFunctionRef: string;
  readonly graphRef: string;
  readonly nodeRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly implementationBindingRef: string;
  readonly predicateRef: string;
  readonly closureContractRef: string;
}>): GraphFunction {
  return {
    kind: "graph_function",
    name: input.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [input.inputContractRef],
      provides: [input.outputContractRef],
      carries: [input.inputContractRef, input.outputContractRef],
    },
    inputs: [input.inputContractRef],
    outputs: [input.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: input.graphRef,
      startNodeRef: input.nodeRef,
      terminalNodeRefs: [input.nodeRef],
      nodes: [{
        nodeRef: input.nodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: cCarrier(input.inputContractRef),
          output: cCarrier(input.outputContractRef),
          programLocusRef: input.nodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId: `arm://${input.graphFunctionRef.slice("graph-function://".length)}`,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: input.predicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef: input.implementationBindingRef,
            inputContractRef: input.inputContractRef,
            outputContractRef: input.outputContractRef,
            evidenceContractRef: EXECUTIVE_IDS.evidenceContractRef,
            failureContractRef: EXECUTIVE_IDS.failureContractRef,
            refusalContractRef: EXECUTIVE_IDS.refusalContractRef,
            judgmentContractRef: EXECUTIVE_IDS.judgmentContractRef,
          },
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": input.closureContractRef,
      "abg.evidence_contract": EXECUTIVE_IDS.evidenceContractRef,
      "abg.judgment_contract": EXECUTIVE_IDS.judgmentContractRef,
      "abg.judgment_predicate": input.predicateRef,
      "abg.transition_contract": EXECUTIVE_IDS.transitionContractRef,
      "abg.owner": EXECUTIVE_IDS.ownerRef,
    },
    tags: ["abiogenesis", "executive", "direct-gtl"],
  };
}

export function constructExecutiveModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const contracts: readonly ContractDeclaration[] = [
    {
      contractRef: EXECUTIVE_IDS.replaySnapshotContractRef,
      contractVersion: "5.0.0",
      contractKind: "input",
      valueKind: "executive_replay_snapshot",
    },
    {
      contractRef: EXECUTIVE_IDS.observerReportContractRef,
      contractVersion: "5.0.0",
      contractKind: "output",
      valueKind: "executive_observer_report",
    },
    {
      contractRef: EXECUTIVE_IDS.tuningSignalContractRef,
      contractVersion: "5.0.0",
      contractKind: "input",
      valueKind: "executive_tuning_input",
    },
    {
      contractRef: EXECUTIVE_IDS.declarationDraftContractRef,
      contractVersion: "5.0.0",
      contractKind: "output",
      valueKind: "executive_declaration_draft",
    },
    {
      contractRef: EXECUTIVE_IDS.failureContractRef,
      contractVersion: "5.0.0",
      contractKind: "failure",
      valueKind: "executive_failure",
    },
    {
      contractRef: EXECUTIVE_IDS.refusalContractRef,
      contractVersion: "5.0.0",
      contractKind: "refusal",
      valueKind: "executive_refusal",
    },
    {
      contractRef: EXECUTIVE_IDS.evidenceContractRef,
      contractVersion: "5.0.0",
      contractKind: "evidence",
      valueKind: "deterministic_evidence_candidate",
    },
    {
      contractRef: EXECUTIVE_IDS.judgmentContractRef,
      contractVersion: "5.0.0",
      contractKind: "judgment",
      valueKind: "executive_judgment",
    },
    {
      contractRef: EXECUTIVE_IDS.transitionContractRef,
      contractVersion: "5.0.0",
      contractKind: "transition",
      valueKind: "executive_draft_transition",
    },
    {
      contractRef: EXECUTIVE_IDS.observerClosureContractRef,
      contractVersion: "5.0.0",
      contractKind: "closure",
      valueKind: "executive_observer_closure",
    },
    {
      contractRef: EXECUTIVE_IDS.tunerClosureContractRef,
      contractVersion: "5.0.0",
      contractKind: "closure",
      valueKind: "executive_tuner_closure",
    },
  ];
  const implementationBindings: readonly ImplementationBinding[] = [{
    kind: "implementation_binding",
    bindingRef: EXECUTIVE_IDS.observerImplementationBindingRef,
    implementationRef: EXECUTIVE_IDS.observerImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/executive.js",
    namedSymbol: "realizeExecutiveObserver",
    computeRegime: "F_D",
    inputContractRef: EXECUTIVE_IDS.replaySnapshotContractRef,
    outputContractRef: EXECUTIVE_IDS.observerReportContractRef,
    failureContractRef: EXECUTIVE_IDS.failureContractRef,
    refusalContractRef: EXECUTIVE_IDS.refusalContractRef,
  }, {
    kind: "implementation_binding",
    bindingRef: EXECUTIVE_IDS.tunerImplementationBindingRef,
    implementationRef: EXECUTIVE_IDS.tunerImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/executive.js",
    namedSymbol: "realizeExecutiveTuner",
    computeRegime: "F_D",
    inputContractRef: EXECUTIVE_IDS.tuningSignalContractRef,
    outputContractRef: EXECUTIVE_IDS.declarationDraftContractRef,
    failureContractRef: EXECUTIVE_IDS.failureContractRef,
    refusalContractRef: EXECUTIVE_IDS.refusalContractRef,
  }];
  const closure = (
    closureContractRef: string,
    predicateRef: string,
    resultContractRef: string,
  ): ClosureContract => ({
    kind: "closure_contract",
    closureContractRef,
    predicateRef,
    evidenceContractRef: EXECUTIVE_IDS.evidenceContractRef,
    resultContractRef,
    refusalContractRef: EXECUTIVE_IDS.refusalContractRef,
    refusalValueKind: "executive_refusal",
    judgmentContractRef: EXECUTIVE_IDS.judgmentContractRef,
    rejectionContractRef: EXECUTIVE_IDS.refusalContractRef,
    transitionContractRef: EXECUTIVE_IDS.transitionContractRef,
    replayProjectionRef: `projection://${closureContractRef.slice("closure://".length)}`,
    terminalKind: "completed",
    closureScope: "run",
    eventKindRefs: [
      "terminal_reached",
      "frame_closed",
      "graph_call_closed",
      "run_closed",
    ],
  });
  const observerGraphFunction = constructLeafGraphFunction({
    graphFunctionRef: EXECUTIVE_IDS.observerGraphFunctionRef,
    graphRef: EXECUTIVE_IDS.observerGraphRef,
    nodeRef: EXECUTIVE_IDS.observerNodeRef,
    inputContractRef: EXECUTIVE_IDS.replaySnapshotContractRef,
    outputContractRef: EXECUTIVE_IDS.observerReportContractRef,
    implementationBindingRef:
      EXECUTIVE_IDS.observerImplementationBindingRef,
    predicateRef: EXECUTIVE_IDS.observerPredicateRef,
    closureContractRef: EXECUTIVE_IDS.observerClosureContractRef,
  });
  const tunerGraphFunction = constructLeafGraphFunction({
    graphFunctionRef: EXECUTIVE_IDS.tunerGraphFunctionRef,
    graphRef: EXECUTIVE_IDS.tunerGraphRef,
    nodeRef: EXECUTIVE_IDS.tunerNodeRef,
    inputContractRef: EXECUTIVE_IDS.tuningSignalContractRef,
    outputContractRef: EXECUTIVE_IDS.declarationDraftContractRef,
    implementationBindingRef: EXECUTIVE_IDS.tunerImplementationBindingRef,
    predicateRef: EXECUTIVE_IDS.tunerPredicateRef,
    closureContractRef: EXECUTIVE_IDS.tunerClosureContractRef,
  });
  const program = (
    programRef: string,
    startRef: string,
    graphFunctionRef: string,
    closureContractRef: string,
  ): GtlProgram => ({
    kind: "gtl_program",
    programRef,
    version: "5.0.0",
    moduleRef: EXECUTIVE_IDS.moduleRef,
    starts: [{ startRef, graphFunctionRef }],
    callableMembership: [graphFunctionRef],
    closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  });
  const contribution = (
    handle: string,
    programRef: string,
  ): CatalogContribution => ({
    handle,
    kind: "graph_function",
    declarationOrContractRef: handle,
    owningProductId: artifact.productId,
    programMembershipRefs: [programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  });
  return deepFreeze({
    kind: "module_publication",
    moduleRef: EXECUTIVE_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef:
      `descriptor://abiogenesis/executive/${artifact.productContentDigest.slice("sha256:".length)}`,
    contributionManifestRef:
      `contribution-manifest://abiogenesis/executive/${artifact.productContentDigest.slice("sha256:".length)}`,
    productSemanticsBinding: {
      kind: "product_semantics_binding",
      bindingRef: EXECUTIVE_IDS.productSemanticsBindingRef,
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/implementation/product_semantics.js",
      namedSymbol: "ABI5_SYSTEM_PRODUCT_SEMANTICS",
    },
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings,
    closureContracts: [
      closure(
        EXECUTIVE_IDS.observerClosureContractRef,
        EXECUTIVE_IDS.observerPredicateRef,
        EXECUTIVE_IDS.observerReportContractRef,
      ),
      closure(
        EXECUTIVE_IDS.tunerClosureContractRef,
        EXECUTIVE_IDS.tunerPredicateRef,
        EXECUTIVE_IDS.declarationDraftContractRef,
      ),
    ],
    programs: [
      program(
        EXECUTIVE_IDS.observerProgramRef,
        EXECUTIVE_IDS.observerStartRef,
        EXECUTIVE_IDS.observerGraphFunctionRef,
        EXECUTIVE_IDS.observerClosureContractRef,
      ),
      program(
        EXECUTIVE_IDS.tunerProgramRef,
        EXECUTIVE_IDS.tunerStartRef,
        EXECUTIVE_IDS.tunerGraphFunctionRef,
        EXECUTIVE_IDS.tunerClosureContractRef,
      ),
    ],
    graphFunctions: [observerGraphFunction, tunerGraphFunction],
    contributions: [
      contribution(
        EXECUTIVE_IDS.observerGraphFunctionRef,
        EXECUTIVE_IDS.observerProgramRef,
      ),
      contribution(
        EXECUTIVE_IDS.tunerGraphFunctionRef,
        EXECUTIVE_IDS.tunerProgramRef,
      ),
    ],
  }) as Readonly<ModulePublication>;
}
