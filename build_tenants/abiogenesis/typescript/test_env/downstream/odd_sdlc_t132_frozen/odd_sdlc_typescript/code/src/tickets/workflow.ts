// Implements: T-162

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const SDLC_TICKET_WORKFLOW_DIRECTORIES = Object.freeze([
  "backlog",
  "active",
  "completed"
] as const);

export const SDLC_TICKET_WORKFLOW_FD_RULE_REF =
  "evaluation-rule://odd-sdlc/ticket-workflow/fd" as const;

export type SdlcTicketWorkflowDirectory =
  (typeof SDLC_TICKET_WORKFLOW_DIRECTORIES)[number];

export const SDLC_TICKET_REQUIRED_FIELDS = Object.freeze([
  "id",
  "title",
  "type",
  "ticket_category",
  "status",
  "goal",
  "change_intent",
  "change_class",
  "re_entry_point",
  "triaged_at",
  "created_at",
  "updated_at"
] as const);

export type SdlcTicketRequiredField =
  (typeof SDLC_TICKET_REQUIRED_FIELDS)[number];

export type SdlcTicketDeclaredStatus =
  | "backlog"
  | "active"
  | "blocked"
  | "completed";

export type SdlcTicketWorkflowRowStatus =
  | "valid"
  | "blocked"
  | "malformed"
  | "stale";

export type SdlcTicketExecutionBlockingReason =
  | "ticket_missing"
  | "ticket_malformed"
  | "ticket_not_active"
  | "ticket_stale"
  | "ticket_unadmitted";

export type SdlcTicketReviewDecisionRuling =
  | "accepted"
  | "rejected"
  | "deferred"
  | "split_ticket";

export type SdlcTicketBugFirstMissingLayer =
  | "goal"
  | "intent"
  | "product"
  | "requirement"
  | "design"
  | "realization"
  | "runtime"
  | "proof";

export type SdlcOverlayContinuationRuling =
  | "close"
  | "repair"
  | "split_ticket"
  | "depth_traversal"
  | "defer"
  | "block"
  | "unruled";

export interface SdlcTicketWorkflowDiagnostic {
  readonly kind: "sdlc_ticket_workflow_diagnostic";
  readonly code:
    | "missing_required_field"
    | "invalid_status"
    | "directory_status_mismatch"
    | "duplicate_ticket_id"
    | "invalid_ticket_id"
    | "missing_governing_requirement"
    | "missing_governing_design"
    | "unknown_reviewer_profile"
    | "unavailable_reviewer_profile"
    | "schema_incompatible_reviewer_profile"
    | "missing_review_decision_ruling"
    | "missing_bug_triage_field"
    | "missing_spec_change_field"
    | "missing_overlay_continuation_field";
  readonly field: string | null;
  readonly detail: string;
}

export interface SdlcReviewFindingDecisionRow {
  readonly kind: "sdlc_review_finding_decision_row";
  readonly decisionRef: string;
  readonly findingRef: string;
  readonly reviewerProfileId: string | null;
  readonly reviewerProfileConfigDigest: string | null;
  readonly panelBindingRef: string | null;
  readonly invocationRef: string | null;
  readonly outputDigest: string | null;
  readonly severity: string;
  readonly ruling: SdlcTicketReviewDecisionRuling;
  readonly acceptedChangeScope: string | null;
  readonly proofRequired: string | null;
  readonly splitTicketRef: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface SdlcBugTriageRow {
  readonly kind: "sdlc_bug_triage_row";
  readonly bugRef: string;
  readonly expectedBehavior: string;
  readonly actualBehavior: string;
  readonly reproductionRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly firstMissingLayer: SdlcTicketBugFirstMissingLayer;
  readonly changeClass: string;
  readonly reEntryPoint: string;
  readonly governingRequirementRefs: readonly string[];
  readonly governingDesignRefs: readonly string[];
}

export interface SdlcSpecChangeRow {
  readonly kind: "sdlc_spec_change_row";
  readonly specChangeRef: string;
  readonly targetSpecSurface: string;
  readonly currentTruth: string;
  readonly targetTruth: string;
  readonly sourceDocumentRefs: readonly string[];
  readonly changeClass: string;
  readonly reEntryPoint: string;
  readonly proofSurface: string;
  readonly closureLaw: string;
}

export interface SdlcOverlaySegmentContinuationRow {
  readonly kind: "sdlc_overlay_segment_continuation_row";
  readonly continuationRef: string;
  readonly sourceSegmentCompletionRef: string;
  readonly productConverged: false;
  readonly terminalGraphFunctionRefs: readonly string[];
  readonly terminalAssetRefs: readonly string[];
  readonly remainingGraphPressureRefs: readonly string[];
  readonly remainingRequirementPressureRefs: readonly string[];
  readonly remainingAssetPressureRefs: readonly string[];
  readonly nextEligibleOverlayRefs: readonly string[];
  readonly selectedStartTargetRef: "overlay://odd-sdlc/current-full-traversal";
  readonly ruling: SdlcOverlayContinuationRuling;
  readonly proofExpectation: string;
}

export interface SdlcReviewerProfile {
  readonly kind: "sdlc_reviewer_profile";
  readonly profileId: "codex" | "claude";
  readonly profileRef: string;
  readonly displayName: string;
  readonly available: boolean;
  readonly outputSchemaRef: string;
  readonly configDigest: string;
  readonly evidenceContractRefs: readonly string[];
}

export interface SdlcReviewPanelBinding {
  readonly kind: "sdlc_review_panel_binding";
  readonly panelBindingRef: string;
  readonly ticketId: string;
  readonly requiredReviewerProfileIds: readonly string[];
  readonly optionalReviewerProfileIds: readonly string[];
  readonly reductionPolicy: "all_required" | "single_required" | "manual_ruling";
  readonly fallbackPolicy: "block" | "defer" | "manual_review";
  readonly reviewerProfileRefs: readonly string[];
  readonly reviewerProfileConfigDigests: readonly string[];
  readonly blockingReasons: readonly SdlcTicketExecutionBlockingReason[];
  readonly diagnostics: readonly SdlcTicketWorkflowDiagnostic[];
}

export interface SdlcTicketWorkflowRow {
  readonly kind: "sdlc_ticket_workflow_row";
  readonly rowRef: string;
  readonly ticketId: string;
  readonly title: string | null;
  readonly type: string | null;
  readonly ticketCategory: string | null;
  readonly declaredStatus: string | null;
  readonly directory: SdlcTicketWorkflowDirectory;
  readonly workflowStatus: SdlcTicketWorkflowRowStatus;
  readonly nextLawfulAction:
    | "admit_execution_contract"
    | "resolve_blocking_ticket_truth"
    | "promote_or_reopen_before_execution"
    | "closed_read_only";
  readonly filePath: string;
  readonly fileUri: string;
  readonly ticketDigest: string;
  readonly missingRequiredFields: readonly SdlcTicketRequiredField[];
  readonly diagnostics: readonly SdlcTicketWorkflowDiagnostic[];
  readonly sourceDocuments: readonly string[];
  readonly targetTruth: string | null;
  readonly supersededTruth: string | null;
  readonly closureLaw: string | null;
  readonly evaluationCriteria: readonly string[];
  readonly nonClosureConditions: readonly string[];
  readonly changeClass: string | null;
  readonly reEntryPoint: string | null;
  readonly reviewDecisionRows: readonly SdlcReviewFindingDecisionRow[];
  readonly bugTriageRows: readonly SdlcBugTriageRow[];
  readonly specChangeRows: readonly SdlcSpecChangeRow[];
  readonly overlayContinuationRows: readonly SdlcOverlaySegmentContinuationRow[];
  readonly reviewPanelBinding: SdlcReviewPanelBinding | null;
}

export interface SdlcTicketWorkflowProjection {
  readonly kind: "sdlc_ticket_workflow_projection";
  readonly readOnly: true;
  readonly choosesNextTraversal: false;
  readonly sourceRoot: string;
  readonly sourceRootUri: string;
  readonly sourceDirectories: readonly SdlcTicketWorkflowDirectory[];
  readonly requiredFields: readonly SdlcTicketRequiredField[];
  readonly rows: readonly SdlcTicketWorkflowRow[];
  readonly reviewerProfiles: readonly SdlcReviewerProfile[];
  readonly counts: {
    readonly backlog: number;
    readonly active: number;
    readonly blocked: number;
    readonly completed: number;
    readonly malformed: number;
    readonly stale: number;
  };
  readonly diagnostics: readonly SdlcTicketWorkflowDiagnostic[];
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcTicketExecutionContract {
  readonly kind: "sdlc_ticket_execution_contract";
  readonly executionContractRef: string;
  readonly ticketId: string;
  readonly ticketRef: string;
  readonly ticketPath: string;
  readonly ticketUri: string;
  readonly ticketDigest: string;
  readonly sourceDocuments: readonly string[];
  readonly targetTruth: string;
  readonly supersededTruth: string | null;
  readonly closureLaw: string;
  readonly evaluationCriteria: readonly string[];
  readonly nonClosureConditions: readonly string[];
  readonly changeClass: string;
  readonly reEntryPoint: string;
  readonly reviewPanelBinding: SdlcReviewPanelBinding | null;
  readonly reviewDecisionRows: readonly SdlcReviewFindingDecisionRow[];
  readonly bugTriageRows: readonly SdlcBugTriageRow[];
  readonly specChangeRows: readonly SdlcSpecChangeRow[];
  readonly overlayContinuationRows: readonly SdlcOverlaySegmentContinuationRow[];
  readonly rulingRefs: readonly string[];
  readonly reviewerProfileIds: readonly string[];
  readonly reviewerProfileConfigDigests: readonly string[];
  readonly overlayContinuationRefs: readonly string[];
}

export type SdlcTicketAssetStartResolution =
  | {
      readonly kind: "not_ticket_asset";
    }
  | {
      readonly kind: "admitted";
      readonly contract: SdlcTicketExecutionContract;
    }
  | {
      readonly kind: "blocked";
      readonly blockingReason: SdlcTicketExecutionBlockingReason;
      readonly diagnostics: readonly SdlcTicketWorkflowDiagnostic[];
    };

export interface SdlcTicketIntakeCreatedTicket {
  readonly kind: "sdlc_ticket_intake_created_ticket";
  readonly ticketId: string;
  readonly ticketRef: string;
  readonly ticketPath: string;
  readonly ticketUri: string;
  readonly title: string;
  readonly sourceRunArchiveRoot: string;
  readonly sourceRunRef: string;
}

export type SdlcTerminalGapTicketIntakeSourceStopKind =
  | "retry_exhaustion"
  | "review_grade_triage_gap";

export interface SdlcTerminalGapTicketIntakeResult {
  readonly kind: "sdlc_terminal_gap_ticket_intake_result";
  readonly intakeKind: "code_review_triage";
  readonly sourceStopKind: SdlcTerminalGapTicketIntakeSourceStopKind;
  readonly sourceRunArchiveRoot: string;
  readonly sourceRunRef: string;
  readonly edgeName: string;
  readonly blockingReason: string;
  readonly closureDisposition: string;
  readonly parentTicket: SdlcTicketIntakeCreatedTicket;
  readonly gapTickets: readonly SdlcTicketIntakeCreatedTicket[];
  readonly createdTicketRefs: readonly string[];
  readonly residualFindingRefs: readonly string[];
  readonly governingRequirementRefs: readonly string[];
  readonly governingDesignRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly admittedExecutionContractRefs: readonly string[];
}

type FieldValue = string | readonly string[];

type FieldMap = ReadonlyMap<string, FieldValue>;

const SDLC_TICKET_DECLARED_STATUS_VALUES = Object.freeze([
  "backlog",
  "active",
  "blocked",
  "completed"
] as const);

const SDLC_TICKET_DECLARED_STATUS_SET: ReadonlySet<string> = new Set(
  SDLC_TICKET_DECLARED_STATUS_VALUES
);

const SDLC_TERMINAL_GAP_TICKET_WORKFLOW_REQUIREMENT_REFS = Object.freeze([
  "requirement:REQ-F-ODDSDLC-034",
  "requirement:REQ-F-ODDSDLC-035"
] as const);

function sha256Text(content: string): string {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

function refPart(input: string): string {
  return encodeURIComponent(input.replace(/^sha256:/u, ""));
}

function normalizeTicketId(input: string): string {
  return input.trim().toUpperCase();
}

function isStringList(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === "string")
  );
}

function fieldString(fields: FieldMap, key: string): string | null {
  const value = fields.get(key);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
  if (isStringList(value)) {
    const joined = value.join("\n").trim();
    return joined.length === 0 ? null : joined;
  }
  return null;
}

function fieldList(fields: FieldMap, key: string): readonly string[] {
  const value = fields.get(key);
  if (isStringList(value)) {
    return Object.freeze(value.map((item) => item.trim()).filter(Boolean));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? Object.freeze([]) : Object.freeze([trimmed]);
  }
  return Object.freeze([]);
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseBracketList(value: string): readonly string[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null;
  }
  const body = trimmed.slice(1, -1).trim();
  if (body.length === 0) {
    return Object.freeze([]);
  }
  return Object.freeze(body.split(",").map(stripQuotes).filter(Boolean));
}

function parseTicketFrontMatter(content: string): FieldMap {
  if (!content.startsWith("---")) {
    return new Map();
  }
  const lines = content.split(/\r?\n/u);
  let index = 1;
  const fields = new Map<string, FieldValue>();
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "---") {
      break;
    }
    const match = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/u.exec(line);
    if (match === null) {
      index += 1;
      continue;
    }
    const key = match[1] ?? "";
    const rawValue = match[2] ?? "";
    if (rawValue === "|" || rawValue === ">") {
      const blockLines: string[] = [];
      index += 1;
      while (index < lines.length) {
        const candidate = lines[index] ?? "";
        if (candidate.trim() === "---") {
          break;
        }
        if (/^[A-Za-z0-9_-]+:/u.test(candidate)) {
          index -= 1;
          break;
        }
        blockLines.push(candidate.replace(/^\s{2}/u, ""));
        index += 1;
      }
      fields.set(key, blockLines.join("\n").trim());
    } else if (rawValue.trim().length === 0) {
      const values: string[] = [];
      index += 1;
      while (index < lines.length) {
        const candidate = lines[index] ?? "";
        const listMatch = /^\s*-\s+(.*)$/u.exec(candidate);
        if (listMatch === null) {
          index -= 1;
          break;
        }
        values.push(stripQuotes(listMatch[1] ?? ""));
        index += 1;
      }
      fields.set(key, Object.freeze(values));
    } else {
      fields.set(key, parseBracketList(rawValue) ?? stripQuotes(rawValue));
    }
    index += 1;
  }
  return fields;
}

function parseBulletMetadata(content: string): FieldMap {
  const fields = new Map<string, FieldValue>();
  for (const line of content.split(/\r?\n/u)) {
    const match = /^-\s+([A-Za-z0-9_-]+):\s*(.*)$/u.exec(line);
    if (match === null) {
      continue;
    }
    fields.set(match[1] ?? "", stripQuotes(match[2] ?? ""));
  }
  return fields;
}

function mergeFields(frontMatter: FieldMap, bulletMetadata: FieldMap): FieldMap {
  const fields = new Map<string, FieldValue>(bulletMetadata);
  for (const [key, value] of frontMatter) {
    fields.set(key, value);
  }
  return fields;
}

function fieldsFromContent(content: string): FieldMap {
  return mergeFields(parseTicketFrontMatter(content), parseBulletMetadata(content));
}

function jsonRecord(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.freeze({ ...value })
    : null;
}

function readJsonRecord(filePath: string): Readonly<Record<string, unknown>> {
  const record = jsonRecord(JSON.parse(readFileSync(filePath, "utf8")));
  if (record === null) {
    throw new TypeError(`expected JSON object: ${filePath}`);
  }
  return record;
}

function recordString(
  record: Readonly<Record<string, unknown>>,
  key: string
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function recordBoolean(
  record: Readonly<Record<string, unknown>>,
  key: string
): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function recordArray(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : Object.freeze([]);
}

function recordStringArray(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly string[] {
  return Object.freeze(
    recordArray(record, key)
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function recordObjectArray(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly Readonly<Record<string, unknown>>[] {
  return Object.freeze(recordArray(record, key).map(jsonRecord).filter((value) => value !== null));
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values.filter((value) => value.trim().length > 0))].sort());
}

function oneLine(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function yamlScalar(value: string): string {
  return oneLine(value).replace(/"/gu, "'");
}

function yamlBlockField(key: string, value: string): string {
  const lines = (value.trim().length === 0 ? "unspecified" : value)
    .replace(/\r\n/gu, "\n")
    .split("\n")
    .map((line) => `  ${line}`);
  return `${key}: |\n${lines.join("\n")}`;
}

function yamlListField(key: string, values: readonly string[]): string {
  if (values.length === 0) {
    return `${key}: []`;
  }
  return `${key}:\n${values.map((value) => `  - ${yamlScalar(value)}`).join("\n")}`;
}

function ticketSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  return slug.length === 0 ? "gap-ticket" : slug.slice(0, 80);
}

function existingTicketNumbers(workspaceRoot: string): readonly number[] {
  const numbers: number[] = [];
  for (const directory of SDLC_TICKET_WORKFLOW_DIRECTORIES) {
    const directoryPath = path.join(workspaceRoot, ".ai-workspace", "tickets", directory);
    if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
      continue;
    }
    for (const fileName of readdirSync(directoryPath)) {
      if (!fileName.endsWith(".md")) {
        continue;
      }
      const filePath = path.join(directoryPath, fileName);
      if (!statSync(filePath).isFile()) {
        continue;
      }
      const content = readFileSync(filePath, "utf8");
      const id = fieldString(fieldsFromContent(content), "id") ?? path.basename(fileName, ".md");
      const match = /^T-(\d+)$/u.exec(normalizeTicketId(id));
      if (match !== null) {
        numbers.push(Number.parseInt(match[1] ?? "0", 10));
      }
    }
  }
  return Object.freeze(numbers);
}

function allocateTicketIds(input: {
  readonly workspaceRoot: string;
  readonly count: number;
}): readonly string[] {
  const maxExisting = Math.max(0, ...existingTicketNumbers(input.workspaceRoot));
  const ids: string[] = [];
  for (let index = 0; index < input.count; index += 1) {
    ids.push(`T-${String(maxExisting + index + 1).padStart(3, "0")}`);
  }
  return Object.freeze(ids);
}

function createdTicket(input: {
  readonly ticketId: string;
  readonly ticketPath: string;
  readonly title: string;
  readonly sourceRunArchiveRoot: string;
  readonly sourceRunRef: string;
}): SdlcTicketIntakeCreatedTicket {
  return Object.freeze({
    kind: "sdlc_ticket_intake_created_ticket" as const,
    ticketId: input.ticketId,
    ticketRef: `asset:ticket/${input.ticketId}`,
    ticketPath: input.ticketPath,
    ticketUri: pathToFileURL(input.ticketPath).href,
    title: input.title,
    sourceRunArchiveRoot: input.sourceRunArchiveRoot,
    sourceRunRef: input.sourceRunRef
  });
}

function reviewGradeResidualFindings(
  assessment: Readonly<Record<string, unknown>>
): readonly Readonly<Record<string, unknown>>[] {
  return Object.freeze(
    recordObjectArray(assessment, "findings").filter(
      (finding) => recordString(finding, "fulfillmentStatus") === "blocked"
    )
  );
}

function terminalGapBlockingReasons(
  summary: Readonly<Record<string, unknown>>
): readonly Readonly<Record<string, unknown>>[] {
  return Object.freeze(
    recordObjectArray(summary, "blockingReasons").filter((reason) => {
      const reentryPoint = recordString(reason, "lawfulReentryPoint");
      const code = recordString(reason, "code") ?? "";
      return (
        reentryPoint === "triage_gap" ||
        code === "review_grade_assessment_invalid" ||
        code === "review_grade_edge_fulfillment_blocked"
      );
    })
  );
}

function terminalGapIntakeSourceStopKind(input: {
  readonly summary: Readonly<Record<string, unknown>>;
  readonly closureDisposition: string | null;
}): SdlcTerminalGapTicketIntakeSourceStopKind | null {
  const blockingReason = recordString(input.summary, "blockingReason") ?? "";
  if (blockingReason === "retry_budget_exhausted" && input.closureDisposition === "retry") {
    return "retry_exhaustion";
  }
  const status = recordString(input.summary, "status");
  if (
    status === "blocked" &&
    input.closureDisposition === "block" &&
    (terminalGapBlockingReasons(input.summary).length > 0 ||
      blockingReason.includes("review_grade_assessment_invalid") ||
      blockingReason.includes("evaluation_set_incomplete") ||
      blockingReason.includes("triage_gap"))
  ) {
    return "review_grade_triage_gap";
  }
  return null;
}

function blockingReasonResidualFindings(
  summary: Readonly<Record<string, unknown>>
): readonly Readonly<Record<string, unknown>>[] {
  return Object.freeze(
    terminalGapBlockingReasons(summary).map((reason, index) =>
      Object.freeze({
        kind: "sdlc_review_grade_obligation_finding",
        obligationId: `blocking-reason://odd-sdlc/${recordString(reason, "code") ?? "terminal_gap"}/${index + 1}`,
        fulfillmentStatus: "blocked",
        failureClass:
          recordString(reason, "code") ?? recordString(reason, "reasonClass") ?? "terminal_gap",
        requiredAction: `Triage terminal builder gap: ${recordString(reason, "detail") ?? recordString(reason, "message") ?? recordString(reason, "code") ?? "unknown"}.`,
        evidenceRefs: recordStringArray(reason, "evidenceRefs")
      })
    )
  );
}

function terminalGapResidualFindings(input: {
  readonly summary: Readonly<Record<string, unknown>>;
  readonly assessment: Readonly<Record<string, unknown>>;
}): readonly Readonly<Record<string, unknown>>[] {
  const reviewFindings = reviewGradeResidualFindings(input.assessment);
  return reviewFindings.length > 0
    ? reviewFindings
    : blockingReasonResidualFindings(input.summary);
}

function findingRef(finding: Readonly<Record<string, unknown>>, index: number): string {
  return recordString(finding, "obligationId") ?? `review-finding://odd-sdlc/terminal-gap/${index + 1}`;
}

function findingRequiredAction(finding: Readonly<Record<string, unknown>>): string {
  return recordString(finding, "requiredAction") ??
    `Resolve ${recordString(finding, "failureClass") ?? "blocked"} review-grade finding ${recordString(finding, "obligationId") ?? "unknown"}`;
}

function findingEvidenceRefs(
  finding: Readonly<Record<string, unknown>>
): readonly string[] {
  return recordStringArray(finding, "evidenceRefs");
}

function designEvidenceRefs(values: readonly string[]): readonly string[] {
  return uniqueStrings(
    values.filter(
      (ref) =>
        ref.includes("/design/") ||
        ref.includes("implementation_design_surface") ||
        ref.includes("ADR-")
    )
  );
}

function requirementEvidenceRefs(values: readonly string[]): readonly string[] {
  return uniqueStrings(
    values.filter(
      (ref) =>
        ref.startsWith("requirement:") ||
        ref.includes("/specification/") ||
        ref.includes("specification/")
    )
  );
}

function runEvidenceRefs(input: {
  readonly operatorRunRoot: string;
  readonly summary: Readonly<Record<string, unknown>>;
  readonly findings: readonly Readonly<Record<string, unknown>>[];
}): readonly string[] {
  const blockingEvidence = recordObjectArray(input.summary, "blockingReasons")
    .flatMap((reason) => recordStringArray(reason, "evidenceRefs"));
  return uniqueStrings([
    pathToFileURL(input.operatorRunRoot).href,
    pathToFileURL(path.join(input.operatorRunRoot, "operator_summary.json")).href,
    pathToFileURL(path.join(input.operatorRunRoot, "sdlc_edge_closure_decision.json")).href,
    pathToFileURL(path.join(input.operatorRunRoot, "review_grade_edge_fulfillment_assessment.json")).href,
    ...blockingEvidence,
    ...input.findings.flatMap(findingEvidenceRefs)
  ]);
}

function groupFindingsByAction(
  findings: readonly Readonly<Record<string, unknown>>[]
): readonly {
  readonly requiredAction: string;
  readonly failureClass: string;
  readonly findings: readonly Readonly<Record<string, unknown>>[];
}[] {
  const groups = new Map<string, {
    requiredAction: string;
    failureClass: string;
    findings: Readonly<Record<string, unknown>>[];
  }>();
  for (const finding of findings) {
    const requiredAction = findingRequiredAction(finding);
    const failureClass = recordString(finding, "failureClass") ?? "blocked";
    const key = `${failureClass}\n${requiredAction}`;
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, { requiredAction, failureClass, findings: [finding] });
    } else {
      group.findings.push(finding);
    }
  }
  return Object.freeze(
    [...groups.values()].map((group) => Object.freeze({
      requiredAction: group.requiredAction,
      failureClass: group.failureClass,
      findings: Object.freeze(group.findings)
    }))
  );
}

function writeTicketFile(input: {
  readonly workspaceRoot: string;
  readonly ticketId: string;
  readonly title: string;
  readonly sourceRunArchiveRoot: string;
  readonly sourceRunRef: string;
  readonly body: string;
}): SdlcTicketIntakeCreatedTicket {
  const directoryPath = path.join(input.workspaceRoot, ".ai-workspace", "tickets", "active");
  mkdirSync(directoryPath, { recursive: true });
  const ticketPath = path.join(
    directoryPath,
    `${input.ticketId}-${ticketSlug(input.title)}.md`
  );
  writeFileSync(ticketPath, input.body, "utf8");
  return createdTicket({
    ticketId: input.ticketId,
    ticketPath,
    title: input.title,
    sourceRunArchiveRoot: input.sourceRunArchiveRoot,
    sourceRunRef: input.sourceRunRef
  });
}

function ticketMarkdown(input: {
  readonly ticketId: string;
  readonly title: string;
  readonly category: string;
  readonly goal: string;
  readonly changeIntent: string;
  readonly targetTruth: string;
  readonly supersededTruth: string;
  readonly closureLaw: string;
  readonly evaluationCriteria: readonly string[];
  readonly nonClosureConditions: readonly string[];
  readonly sourceDocuments: readonly string[];
  readonly expectedBehavior: string;
  readonly actualBehavior: string;
  readonly reproductionRefs: readonly string[];
  readonly bugEvidenceRefs: readonly string[];
  readonly firstMissingLayer: SdlcTicketBugFirstMissingLayer;
  readonly governingRequirementRefs: readonly string[];
  readonly governingDesignRefs: readonly string[];
  readonly reviewFindingRefs?: readonly string[] | undefined;
  readonly reviewFindingRulings?: readonly SdlcTicketReviewDecisionRuling[] | undefined;
  readonly reviewFindingSeverities?: readonly string[] | undefined;
  readonly reviewEvidenceRefs?: readonly string[] | undefined;
  readonly splitTicketRefs?: readonly string[] | undefined;
  readonly acceptedChangeScopes?: readonly string[] | undefined;
  readonly reviewProofRequired?: readonly string[] | undefined;
  readonly sourceOperatorRunRef: string;
  readonly sourceRunNarrative: string;
  readonly selectedStartTargetRef: string;
}): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${[
    "---",
    `id: ${input.ticketId}`,
    `title: ${yamlScalar(input.title)}`,
    "type: bug",
    `ticket_category: ${yamlScalar(input.category)}`,
    "status: active",
    `goal: ${yamlScalar(input.goal)}`,
    yamlBlockField("change_intent", input.changeIntent),
    "change_class: realization_refactor",
    "re_entry_point: code",
    `triaged_at: ${today}`,
    `created_at: ${today}`,
    `updated_at: ${today}`,
    yamlBlockField("target_truth", input.targetTruth),
    yamlBlockField("superseded_truth", input.supersededTruth),
    yamlBlockField("closure_law", input.closureLaw),
    yamlListField("evaluation_criteria", input.evaluationCriteria),
    yamlListField("non_closure_conditions", input.nonClosureConditions),
    yamlListField("source_documents", input.sourceDocuments),
    yamlBlockField("expected_behavior", input.expectedBehavior),
    yamlBlockField("actual_behavior", input.actualBehavior),
    yamlListField("reproduction_refs", input.reproductionRefs),
    yamlListField("bug_evidence_refs", input.bugEvidenceRefs),
    `first_missing_layer: ${input.firstMissingLayer}`,
    yamlListField("governing_requirement_refs", input.governingRequirementRefs),
    yamlListField("governing_design_refs", input.governingDesignRefs),
    ...(input.reviewFindingRefs === undefined
      ? []
      : [
          yamlListField("review_finding_refs", input.reviewFindingRefs),
          yamlListField("review_finding_rulings", input.reviewFindingRulings ?? []),
          yamlListField("review_finding_severities", input.reviewFindingSeverities ?? []),
          yamlListField("review_evidence_refs", input.reviewEvidenceRefs ?? []),
          yamlListField("split_ticket_refs", input.splitTicketRefs ?? []),
          yamlListField("accepted_change_scopes", input.acceptedChangeScopes ?? []),
          yamlListField("review_proof_required", input.reviewProofRequired ?? [])
        ]),
    `source_operator_run_ref: ${input.sourceOperatorRunRef}`,
    `selected_start_target_ref: ${input.selectedStartTargetRef}`,
    "---",
    "",
    `# ${input.title}`,
    "",
    `This ticket was emitted by the installed ticket-intake workflow from ${input.sourceRunNarrative}. It is product/worksite pressure, not permission to patch generated source from outside the governed builder lane.`,
    ""
  ].join("\n")}`;
}

export function createSdlcTerminalGapTicketsFromOperatorRun(input: {
  readonly workspaceRoot: string;
  readonly operatorRunRoot: string;
  readonly intakeKind: "code_review_triage";
}): SdlcTerminalGapTicketIntakeResult {
  const summaryPath = path.join(input.operatorRunRoot, "operator_summary.json");
  const assessmentPath = path.join(
    input.operatorRunRoot,
    "review_grade_edge_fulfillment_assessment.json"
  );
  const closurePath = path.join(input.operatorRunRoot, "sdlc_edge_closure_decision.json");
  for (const requiredPath of [summaryPath, assessmentPath, closurePath]) {
    if (!existsSync(requiredPath)) {
      throw new TypeError(`retry-exhaustion ticket intake missing ${requiredPath}`);
    }
  }
  const summary = readJsonRecord(summaryPath);
  const assessment = readJsonRecord(assessmentPath);
  const closure = readJsonRecord(closurePath);
  const blockingReason = recordString(summary, "blockingReason");
  const closureDisposition = recordString(closure, "disposition");
  const sourceStopKind = terminalGapIntakeSourceStopKind({
    summary,
    closureDisposition
  });
  if (sourceStopKind === null || blockingReason === null || closureDisposition === null) {
    throw new TypeError(
      `terminal-gap ticket intake requires retry_budget_exhausted/retry or blocked triage_gap/block, got blockingReason=${blockingReason ?? "null"} disposition=${closureDisposition ?? "null"}`
    );
  }
  const findings = terminalGapResidualFindings({ summary, assessment });
  if (findings.length === 0) {
    throw new TypeError("terminal-gap ticket intake requires blocked review-grade findings or triage-gap blocking reasons");
  }
  const sourceRunNarrative = sourceStopKind === "retry_exhaustion"
    ? "an exhausted same-edge retry run"
    : "a terminal review-grade triage block";
  const edgeName =
    recordString(summary, "currentEdge") ??
    recordString(summary, "edgeName") ??
    recordString(assessment, "edgeName") ??
    "unknown_edge";
  const sourceRunRef = pathToFileURL(input.operatorRunRoot).href;
  const allEvidenceRefs = runEvidenceRefs({
    operatorRunRoot: input.operatorRunRoot,
    summary,
    findings
  });
  const residualFindingRefs = uniqueStrings(
    findings.map((finding, index) => findingRef(finding, index))
  );
  const productGoverningRequirementRefs = uniqueStrings(
    findings
      .map((finding, index) => findingRef(finding, index))
      .filter((ref) => ref.startsWith("requirement:"))
  );
  const governingRequirementRefs = uniqueStrings(
    productGoverningRequirementRefs.length === 0
      ? [...SDLC_TERMINAL_GAP_TICKET_WORKFLOW_REQUIREMENT_REFS]
      : productGoverningRequirementRefs
  );
  const governingDesignRefs = uniqueStrings([
    ...designEvidenceRefs(allEvidenceRefs),
    "source_asset:implementation_design_surface"
  ]);
  const sourceDocuments = uniqueStrings([
    ...governingRequirementRefs,
    ...requirementEvidenceRefs(allEvidenceRefs),
    ...governingDesignRefs
  ]);
  const groups = groupFindingsByAction(findings);
  const ids = allocateTicketIds({
    workspaceRoot: input.workspaceRoot,
    count: groups.length + 1
  });
  const parentTicketId = ids[0] ?? "T-001";
  const childTicketIds = ids.slice(1);
  const childTickets = groups.map((group, index) => {
    const ticketId = childTicketIds[index] ?? `T-${String(index + 2).padStart(3, "0")}`;
    const groupFindingRefs = uniqueStrings(
      group.findings.map((finding, findingIndex) => findingRef(finding, findingIndex))
    );
    const groupRequirementRefs = uniqueStrings(
      groupFindingRefs.filter((ref) => ref.startsWith("requirement:"))
    );
    const admittedGroupRequirementRefs = groupRequirementRefs.length === 0
      ? governingRequirementRefs
      : groupRequirementRefs;
    const groupEvidenceRefs = uniqueStrings([
      ...group.findings.flatMap(findingEvidenceRefs),
      ...allEvidenceRefs
    ]);
    const title = `${group.failureClass}: ${group.requiredAction}`;
    return writeTicketFile({
      workspaceRoot: input.workspaceRoot,
      ticketId,
      title,
      sourceRunArchiveRoot: input.operatorRunRoot,
      sourceRunRef,
      body: ticketMarkdown({
        ticketId,
        title,
        category: "implementation_gap",
        goal: "repair-builder-observed-product-gap",
        changeIntent:
          "Repair a product/worksite gap emitted by the builder after lawful terminal gap intake.",
        targetTruth: group.requiredAction,
        supersededTruth:
          "Builder-observed product gaps can remain only in terminal run summaries or be patched outside the governed SDLC lane.",
        closureLaw:
          "The gap closes only when the generated product source, component code surface, and review-grade assessment prove the listed requirement obligations fulfilled through the builder workflow.",
        evaluationCriteria: [
          "governing requirements remain cited",
          "governing design authority remains cited",
          "component_code_surface carries source evidence for the repaired behavior",
          "review-grade assessment closes the residual finding"
        ],
        nonClosureConditions: [
          "manual outside-in generated source patch",
          "command success without review-grade obligation closure",
          "requirement lineage or design evidence is dropped"
        ],
        sourceDocuments: uniqueStrings([
          ...admittedGroupRequirementRefs,
          ...requirementEvidenceRefs(groupEvidenceRefs),
          ...governingDesignRefs
        ]),
        expectedBehavior: group.requiredAction,
        actualBehavior:
          `The builder stopped on ${edgeName} with ${sourceRunNarrative} and ${groupFindingRefs.length} residual review-grade or triage finding(s).`,
        reproductionRefs: [sourceRunRef],
        bugEvidenceRefs: groupEvidenceRefs,
        firstMissingLayer: "realization",
        governingRequirementRefs: admittedGroupRequirementRefs,
        governingDesignRefs,
        sourceOperatorRunRef: sourceRunRef,
        sourceRunNarrative,
        selectedStartTargetRef: "overlay://odd-sdlc/current-full-traversal"
      })
    });
  });
  const splitTicketRefsByFinding = findings.map((finding) => {
    const requiredAction = findingRequiredAction(finding);
    const failureClass = recordString(finding, "failureClass") ?? "blocked";
    const groupIndex = groups.findIndex(
      (group) => group.requiredAction === requiredAction && group.failureClass === failureClass
    );
    const ticket = childTickets[groupIndex] ?? childTickets[0];
    return ticket?.ticketRef ?? `asset:ticket/${parentTicketId}`;
  });
  const parentTitle = sourceStopKind === "retry_exhaustion"
    ? `Retry budget exhausted for ${edgeName}`
    : `Review-grade triage gap for ${edgeName}`;
  const parentGoal = sourceStopKind === "retry_exhaustion"
    ? "triage-builder-retry-exhaustion"
    : "triage-builder-review-grade-gap";
  const parentChangeIntent = sourceStopKind === "retry_exhaustion"
    ? "Convert a lawful builder retry-exhaustion failure into governed ticket workflow pressure and split product gaps without outside-in generated source repair."
    : "Convert a terminal review-grade triage block into governed ticket workflow pressure and split product gaps without outside-in generated source repair.";
  const parentTargetTruth = sourceStopKind === "retry_exhaustion"
    ? "Retry exhaustion is preserved as active ticket workflow pressure with split product-gap tickets and an admitted current-full traversal entrypoint."
    : "Terminal review-grade triage blocks are preserved as active ticket workflow pressure with split product-gap tickets and an admitted current-full traversal entrypoint.";
  const parentSupersededTruth = sourceStopKind === "retry_exhaustion"
    ? "A data-mapper live run may stop at retry_budget_exhausted with only run_summary evidence and no ticket intake."
    : "A data-mapper live run may stop at a review-grade triage block with only run_summary evidence and no ticket intake.";
  const parentTicket = writeTicketFile({
    workspaceRoot: input.workspaceRoot,
    ticketId: parentTicketId,
    title: parentTitle,
    sourceRunArchiveRoot: input.operatorRunRoot,
    sourceRunRef,
    body: ticketMarkdown({
      ticketId: parentTicketId,
      title: parentTitle,
      category: "code_review_triage",
      goal: parentGoal,
      changeIntent: parentChangeIntent,
      targetTruth: parentTargetTruth,
      supersededTruth: parentSupersededTruth,
      closureLaw:
        "The triage ticket closes only after each split gap ticket has an explicit ruling or proof, and the source operator run remains cited in ticket workflow projection and admission.",
      evaluationCriteria: [
        "source operator run is cited",
        "blocked review-grade findings are preserved",
        "split gap tickets are active and admissible",
        "asset:ticket start remains the only workflow entrypoint"
      ],
      nonClosureConditions: [
        "generated product source is patched outside the builder workflow",
        "review-grade findings are summarized without split tickets",
        "retry exhaustion is treated as product convergence",
        "ticket workflow projection cannot admit the generated tickets"
      ],
      sourceDocuments,
      expectedBehavior:
        "The builder retries or blocks lawfully and emits governed gap tickets instead of hiding or hand-repairing the residual.",
      actualBehavior:
        `The latest run stopped on ${edgeName} with ${sourceRunNarrative} and ${findings.length} blocked review-grade or triage finding(s).`,
      reproductionRefs: [sourceRunRef],
      bugEvidenceRefs: allEvidenceRefs,
      firstMissingLayer: "realization",
      governingRequirementRefs,
      governingDesignRefs,
      reviewFindingRefs: findings.map((finding, index) => findingRef(finding, index)),
      reviewFindingRulings: findings.map(() => "split_ticket" as const),
      reviewFindingSeverities: findings.map(() => "medium"),
      reviewEvidenceRefs: allEvidenceRefs,
      splitTicketRefs: splitTicketRefsByFinding,
      acceptedChangeScopes: findings.map(findingRequiredAction),
      reviewProofRequired: findings.map(
        () => "split ticket must close through builder workflow evidence"
      ),
      sourceOperatorRunRef: sourceRunRef,
      sourceRunNarrative,
      selectedStartTargetRef: "overlay://odd-sdlc/current-full-traversal"
    })
  });
  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: input.workspaceRoot });
  const createdTickets = [parentTicket, ...childTickets];
  const admittedExecutionContractRefs = createdTickets.map((ticket) =>
    admitSdlcTicketExecutionContract({
      workflow,
      ticketId: ticket.ticketId
    }).executionContractRef
  );
  return Object.freeze({
    kind: "sdlc_terminal_gap_ticket_intake_result" as const,
    intakeKind: input.intakeKind,
    sourceStopKind,
    sourceRunArchiveRoot: input.operatorRunRoot,
    sourceRunRef,
    edgeName,
    blockingReason,
    closureDisposition,
    parentTicket,
    gapTickets: Object.freeze(childTickets),
    createdTicketRefs: Object.freeze(createdTickets.map((ticket) => ticket.ticketRef)),
    residualFindingRefs,
    governingRequirementRefs,
    governingDesignRefs,
    evidenceRefs: allEvidenceRefs,
    admittedExecutionContractRefs: Object.freeze(admittedExecutionContractRefs)
  });
}

function diagnostic(input: {
  readonly code: SdlcTicketWorkflowDiagnostic["code"];
  readonly field?: string | null;
  readonly detail: string;
}): SdlcTicketWorkflowDiagnostic {
  return Object.freeze({
    kind: "sdlc_ticket_workflow_diagnostic" as const,
    code: input.code,
    field: input.field ?? null,
    detail: input.detail
  });
}

function requiredFieldDiagnostics(fields: FieldMap): readonly SdlcTicketWorkflowDiagnostic[] {
  return Object.freeze(
    SDLC_TICKET_REQUIRED_FIELDS.flatMap((field) =>
      fieldString(fields, field) === null
        ? [
            diagnostic({
              code: "missing_required_field",
              field,
              detail: `ticket missing required TICKET_METHOD field ${field}`
            })
          ]
        : []
    )
  );
}

function statusDiagnostics(input: {
  readonly fields: FieldMap;
  readonly directory: SdlcTicketWorkflowDirectory;
}): readonly SdlcTicketWorkflowDiagnostic[] {
  const status = fieldString(input.fields, "status");
  if (status === null) {
    return Object.freeze([]);
  }
  if (!SDLC_TICKET_DECLARED_STATUS_SET.has(status)) {
    return Object.freeze([
      diagnostic({
        code: "invalid_status",
        field: "status",
        detail: `ticket declares unsupported status ${status}`
      })
    ]);
  }
  if (status === "blocked" && input.directory !== "active") {
    return Object.freeze([
      diagnostic({
        code: "directory_status_mismatch",
        field: "status",
        detail: "blocked tickets must remain in the active ticket directory"
      })
    ]);
  }
  if (status !== "blocked" && status !== input.directory) {
    return Object.freeze([
      diagnostic({
        code: "directory_status_mismatch",
        field: "status",
        detail: `ticket status ${status} does not match ${input.directory} directory`
      })
    ]);
  }
  return Object.freeze([]);
}

function ticketIdDiagnostics(ticketId: string | null): readonly SdlcTicketWorkflowDiagnostic[] {
  if (ticketId === null) {
    return Object.freeze([]);
  }
  if (/^[A-Z]-\d+$/u.test(normalizeTicketId(ticketId))) {
    return Object.freeze([]);
  }
  return Object.freeze([
    diagnostic({
      code: "invalid_ticket_id",
      field: "id",
      detail: `ticket id ${ticketId} does not match governed ticket id shape`
    })
  ]);
}

function reviewDecisionRows(input: {
  readonly ticketId: string;
  readonly fields: FieldMap;
}): readonly SdlcReviewFindingDecisionRow[] {
  const findingRefs = fieldList(input.fields, "review_finding_refs");
  const rulingValues = fieldList(input.fields, "review_finding_rulings");
  const severities = fieldList(input.fields, "review_finding_severities");
  const evidenceRefs = fieldList(input.fields, "review_evidence_refs");
  const reviewerProfileId = fieldString(input.fields, "reviewer_profile_id");
  const reviewerProfileConfigDigest = fieldString(
    input.fields,
    "reviewer_profile_config_digest"
  );
  const panelBindingRef = fieldString(input.fields, "review_panel_binding_ref");
  const invocationRef = fieldString(input.fields, "reviewer_invocation_ref");
  const outputDigest = fieldString(input.fields, "reviewer_output_digest");
  const acceptedScopes = fieldList(input.fields, "accepted_change_scopes");
  const proofRequired = fieldList(input.fields, "review_proof_required");
  const splitTickets = fieldList(input.fields, "split_ticket_refs");
  return Object.freeze(
    findingRefs.map((findingRef, index) => {
      const ruling = reviewRuling(rulingValues[index] ?? "deferred");
      return Object.freeze({
        kind: "sdlc_review_finding_decision_row" as const,
        decisionRef: `review-decision://odd-sdlc/${input.ticketId}/${index + 1}`,
        findingRef,
        reviewerProfileId,
        reviewerProfileConfigDigest,
        panelBindingRef,
        invocationRef,
        outputDigest,
        severity: severities[index] ?? "unspecified",
        ruling,
        acceptedChangeScope: acceptedScopes[index] ?? null,
        proofRequired: proofRequired[index] ?? null,
        splitTicketRef:
          splitTickets[index] ??
          (ruling === "split_ticket" ? splitTickets[0] ?? null : null),
        evidenceRefs
      });
    })
  );
}

function reviewRuling(input: string): SdlcTicketReviewDecisionRuling {
  if (
    input === "accepted" ||
    input === "rejected" ||
    input === "deferred" ||
    input === "split_ticket"
  ) {
    return input;
  }
  return "deferred";
}

function bugFirstMissingLayer(input: string | null): SdlcTicketBugFirstMissingLayer {
  if (
    input === "goal" ||
    input === "intent" ||
    input === "product" ||
    input === "requirement" ||
    input === "design" ||
    input === "realization" ||
    input === "runtime" ||
    input === "proof"
  ) {
    return input;
  }
  return "proof";
}

function bugTriageRows(input: {
  readonly ticketId: string;
  readonly fields: FieldMap;
}): readonly SdlcBugTriageRow[] {
  const expectedBehavior = fieldString(input.fields, "expected_behavior");
  const actualBehavior = fieldString(input.fields, "actual_behavior");
  const reproductionRefs = fieldList(input.fields, "reproduction_refs");
  const evidenceRefs = fieldList(input.fields, "bug_evidence_refs");
  if (
    expectedBehavior === null &&
    actualBehavior === null &&
    reproductionRefs.length === 0 &&
    evidenceRefs.length === 0
  ) {
    return Object.freeze([]);
  }
  return Object.freeze([
    Object.freeze({
      kind: "sdlc_bug_triage_row" as const,
      bugRef: `bug-triage://odd-sdlc/${input.ticketId}/1`,
      expectedBehavior: expectedBehavior ?? "",
      actualBehavior: actualBehavior ?? "",
      reproductionRefs,
      evidenceRefs,
      firstMissingLayer: bugFirstMissingLayer(
        fieldString(input.fields, "first_missing_layer")
      ),
      changeClass: fieldString(input.fields, "change_class") ?? "",
      reEntryPoint: fieldString(input.fields, "re_entry_point") ?? "",
      governingRequirementRefs: fieldList(input.fields, "governing_requirement_refs"),
      governingDesignRefs: fieldList(input.fields, "governing_design_refs")
    })
  ]);
}

function specChangeRows(input: {
  readonly ticketId: string;
  readonly fields: FieldMap;
}): readonly SdlcSpecChangeRow[] {
  const targetSpecSurface = fieldString(input.fields, "target_spec_surface");
  const currentTruth = fieldString(input.fields, "current_truth");
  const targetTruth = fieldString(input.fields, "target_truth");
  const proofSurface = fieldString(input.fields, "proof_surface");
  if (
    targetSpecSurface === null &&
    currentTruth === null &&
    proofSurface === null
  ) {
    return Object.freeze([]);
  }
  return Object.freeze([
    Object.freeze({
      kind: "sdlc_spec_change_row" as const,
      specChangeRef: `spec-change://odd-sdlc/${input.ticketId}/1`,
      targetSpecSurface: targetSpecSurface ?? "",
      currentTruth: currentTruth ?? "",
      targetTruth: targetTruth ?? "",
      sourceDocumentRefs: fieldList(input.fields, "source_documents"),
      changeClass: fieldString(input.fields, "change_class") ?? "",
      reEntryPoint: fieldString(input.fields, "re_entry_point") ?? "",
      proofSurface: proofSurface ?? "",
      closureLaw: fieldString(input.fields, "closure_law") ?? ""
    })
  ]);
}

function overlayContinuationRuling(input: string | null): SdlcOverlayContinuationRuling {
  if (
    input === "close" ||
    input === "repair" ||
    input === "split_ticket" ||
    input === "depth_traversal" ||
    input === "defer" ||
    input === "block"
  ) {
    return input;
  }
  return "unruled";
}

function overlayContinuationRows(input: {
  readonly ticketId: string;
  readonly fields: FieldMap;
}): readonly SdlcOverlaySegmentContinuationRow[] {
  const sourceSegmentCompletionRef = fieldString(
    input.fields,
    "source_overlay_segment_completion_ref"
  );
  const remainingGraphPressureRefs = fieldList(
    input.fields,
    "remaining_graph_pressure_refs"
  );
  const remainingRequirementPressureRefs = fieldList(
    input.fields,
    "remaining_requirement_pressure_refs"
  );
  const remainingAssetPressureRefs = fieldList(
    input.fields,
    "remaining_asset_pressure_refs"
  );
  const nextEligibleOverlayRefs = fieldList(
    input.fields,
    "next_eligible_overlay_refs"
  );
  if (
    sourceSegmentCompletionRef === null &&
    remainingGraphPressureRefs.length === 0 &&
    remainingRequirementPressureRefs.length === 0 &&
    remainingAssetPressureRefs.length === 0 &&
    nextEligibleOverlayRefs.length === 0
  ) {
    return Object.freeze([]);
  }
  return Object.freeze([
    Object.freeze({
      kind: "sdlc_overlay_segment_continuation_row" as const,
      continuationRef: `overlay-continuation://odd-sdlc/${input.ticketId}/1`,
      sourceSegmentCompletionRef: sourceSegmentCompletionRef ?? "",
      productConverged: false as const,
      terminalGraphFunctionRefs: fieldList(
        input.fields,
        "terminal_graph_function_refs"
      ),
      terminalAssetRefs: fieldList(input.fields, "terminal_asset_refs"),
      remainingGraphPressureRefs,
      remainingRequirementPressureRefs,
      remainingAssetPressureRefs,
      nextEligibleOverlayRefs,
      selectedStartTargetRef:
        "overlay://odd-sdlc/current-full-traversal" as const,
      ruling: overlayContinuationRuling(
        fieldString(input.fields, "overlay_continuation_ruling")
      ),
      proofExpectation:
        fieldString(input.fields, "overlay_continuation_proof_expectation") ??
        "review/triage must rule the continuation before product convergence"
    })
  ]);
}

function defaultReviewerProfiles(): readonly SdlcReviewerProfile[] {
  const profiles = [
    {
      profileId: "codex" as const,
      displayName: "Codex",
      available: true,
      outputSchemaRef: "schema://odd-sdlc/reviewer-output/ticket-review-v1",
      evidenceContractRefs: Object.freeze([
        "evidence-contract://odd-sdlc/reviewer/findings",
        "evidence-contract://odd-sdlc/reviewer/line-citations"
      ])
    },
    {
      profileId: "claude" as const,
      displayName: "Claude",
      available: true,
      outputSchemaRef: "schema://odd-sdlc/reviewer-output/ticket-review-v1",
      evidenceContractRefs: Object.freeze([
        "evidence-contract://odd-sdlc/reviewer/findings",
        "evidence-contract://odd-sdlc/reviewer/line-citations"
      ])
    }
  ];
  return Object.freeze(
    profiles.map((profile) => {
      const digest = sha256Text(JSON.stringify(profile));
      return Object.freeze({
        kind: "sdlc_reviewer_profile" as const,
        profileId: profile.profileId,
        profileRef: `reviewer-profile://odd-sdlc/${profile.profileId}`,
        displayName: profile.displayName,
        available: profile.available,
        outputSchemaRef: profile.outputSchemaRef,
        configDigest: digest,
      evidenceContractRefs: profile.evidenceContractRefs
      });
    })
  );
}

function reviewerProfileFromConfig(input: {
  readonly fallback: SdlcReviewerProfile;
  readonly config: Readonly<Record<string, unknown>>;
}): SdlcReviewerProfile {
  const profile = Object.freeze({
    profileId: input.fallback.profileId,
    displayName:
      recordString(input.config, "displayName") ?? input.fallback.displayName,
    available:
      recordBoolean(input.config, "available") ?? input.fallback.available,
    outputSchemaRef:
      recordString(input.config, "outputSchemaRef") ??
      recordString(input.config, "output_schema_ref") ??
      "",
    evidenceContractRefs: recordStringArray(
      input.config,
      "evidenceContractRefs"
    ).length > 0
      ? recordStringArray(input.config, "evidenceContractRefs")
      : recordStringArray(input.config, "evidence_contract_refs").length > 0
        ? recordStringArray(input.config, "evidence_contract_refs")
        : input.fallback.evidenceContractRefs
  });
  return Object.freeze({
    kind: "sdlc_reviewer_profile" as const,
    profileId: profile.profileId,
    profileRef: `reviewer-profile://odd-sdlc/${profile.profileId}`,
    displayName: profile.displayName,
    available: profile.available,
    outputSchemaRef: profile.outputSchemaRef,
    configDigest: sha256Text(JSON.stringify(profile)),
    evidenceContractRefs: Object.freeze(profile.evidenceContractRefs)
  });
}

function reviewerProfilesFromWorkspace(input: {
  readonly workspaceRoot: string;
}): readonly SdlcReviewerProfile[] {
  const defaults = defaultReviewerProfiles();
  const registryPath = path.join(
    input.workspaceRoot,
    ".ai-workspace",
    "tickets",
    "reviewer_profiles.json"
  );
  if (!existsSync(registryPath)) {
    return defaults;
  }
  const registry = readJsonRecord(registryPath);
  const configById = new Map<string, Readonly<Record<string, unknown>>>();
  for (const profileConfig of recordObjectArray(registry, "profiles")) {
    const profileId = recordString(profileConfig, "profileId") ??
      recordString(profileConfig, "profile_id");
    if (profileId === "codex" || profileId === "claude") {
      configById.set(profileId, profileConfig);
    }
  }
  return Object.freeze(
    defaults.map((fallback) => {
      const config = configById.get(fallback.profileId);
      return config === undefined
        ? fallback
        : reviewerProfileFromConfig({ fallback, config });
    })
  );
}

function reviewPanelBinding(input: {
  readonly ticketId: string;
  readonly fields: FieldMap;
  readonly profiles: readonly SdlcReviewerProfile[];
}): SdlcReviewPanelBinding | null {
  const requiredReviewerProfileIds = fieldList(
    input.fields,
    "required_reviewer_profile_ids"
  );
  const optionalReviewerProfileIds = fieldList(
    input.fields,
    "optional_reviewer_profile_ids"
  );
  if (
    requiredReviewerProfileIds.length === 0 &&
    optionalReviewerProfileIds.length === 0
  ) {
    return null;
  }
  const byId = new Map<string, SdlcReviewerProfile>(
    input.profiles.map((profile) => [profile.profileId, profile])
  );
  const diagnostics: SdlcTicketWorkflowDiagnostic[] = [];
  const selectedProfiles = [...requiredReviewerProfileIds, ...optionalReviewerProfileIds]
    .map((profileId) => {
      const profile = byId.get(profileId) ?? null;
      if (profile === null) {
        diagnostics.push(
          diagnostic({
            code: "unknown_reviewer_profile",
            field: "required_reviewer_profile_ids",
            detail: `unknown reviewer profile ${profileId}`
          })
        );
        return null;
      }
      if (!profile.available) {
        diagnostics.push(
          diagnostic({
            code: "unavailable_reviewer_profile",
            field: "required_reviewer_profile_ids",
            detail: `reviewer profile ${profileId} is unavailable`
          })
        );
      }
      if (profile.outputSchemaRef.length === 0) {
        diagnostics.push(
          diagnostic({
            code: "schema_incompatible_reviewer_profile",
            field: "required_reviewer_profile_ids",
            detail: `reviewer profile ${profileId} has no output schema`
          })
        );
      }
      return profile;
    })
    .filter((profile): profile is SdlcReviewerProfile => profile !== null);
  return Object.freeze({
    kind: "sdlc_review_panel_binding" as const,
    panelBindingRef: `review-panel-binding://odd-sdlc/${input.ticketId}`,
    ticketId: input.ticketId,
    requiredReviewerProfileIds,
    optionalReviewerProfileIds,
    reductionPolicy: "all_required",
    fallbackPolicy: "block",
    reviewerProfileRefs: Object.freeze(
      selectedProfiles.map((profile) => profile.profileRef)
    ),
    reviewerProfileConfigDigests: Object.freeze(
      selectedProfiles.map((profile) => profile.configDigest)
    ),
    blockingReasons: Object.freeze(
      diagnostics.length === 0 ? [] : ["ticket_unadmitted" as const]
    ),
    diagnostics: Object.freeze(diagnostics)
  });
}

function rowStatus(input: {
  readonly declaredStatus: string | null;
  readonly diagnostics: readonly SdlcTicketWorkflowDiagnostic[];
}): SdlcTicketWorkflowRowStatus {
  if (
    input.diagnostics.some(
      (entry) =>
        entry.code === "missing_required_field" ||
        entry.code === "invalid_status" ||
        entry.code === "invalid_ticket_id"
    )
  ) {
    return "malformed";
  }
  if (
    input.diagnostics.some((entry) => entry.code === "directory_status_mismatch")
  ) {
    return "stale";
  }
  if (input.declaredStatus === "blocked") {
    return "blocked";
  }
  return "valid";
}

function nextLawfulAction(input: {
  readonly directory: SdlcTicketWorkflowDirectory;
  readonly workflowStatus: SdlcTicketWorkflowRowStatus;
}): SdlcTicketWorkflowRow["nextLawfulAction"] {
  if (input.workflowStatus === "malformed" || input.workflowStatus === "stale") {
    return "resolve_blocking_ticket_truth";
  }
  if (input.workflowStatus === "blocked") {
    return "resolve_blocking_ticket_truth";
  }
  if (input.directory === "active") {
    return "admit_execution_contract";
  }
  if (input.directory === "completed") {
    return "closed_read_only";
  }
  return "promote_or_reopen_before_execution";
}

function projectTicketFile(input: {
  readonly workspaceRoot: string;
  readonly directory: SdlcTicketWorkflowDirectory;
  readonly filePath: string;
  readonly profiles: readonly SdlcReviewerProfile[];
}): SdlcTicketWorkflowRow {
  const content = readFileSync(input.filePath, "utf8");
  const fields = fieldsFromContent(content);
  const ticketDigest = sha256Text(content);
  const ticketId = normalizeTicketId(
    fieldString(fields, "id") ?? path.basename(input.filePath, ".md")
  );
  const requiredDiagnostics = requiredFieldDiagnostics(fields);
  const diagnostics = [
    ...requiredDiagnostics,
    ...statusDiagnostics({
      fields,
      directory: input.directory
    }),
    ...ticketIdDiagnostics(fieldString(fields, "id"))
  ];
  const panelBinding = reviewPanelBinding({
    ticketId,
    fields,
    profiles: input.profiles
  });
  if (panelBinding !== null) {
    diagnostics.push(...panelBinding.diagnostics);
  }
  const bugs = bugTriageRows({ ticketId, fields });
  for (const bug of bugs) {
    if (bug.expectedBehavior.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_bug_triage_field",
          field: "expected_behavior",
          detail: "bug triage requires expected behavior"
        })
      );
    }
    if (bug.actualBehavior.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_bug_triage_field",
          field: "actual_behavior",
          detail: "bug triage requires actual behavior"
        })
      );
    }
    if (bug.reproductionRefs.length === 0 && bug.evidenceRefs.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_bug_triage_field",
          field: "reproduction_refs",
          detail: "bug triage requires reproduction or evidence refs"
        })
      );
    }
    if (bug.changeClass === "realization_refactor") {
      if (bug.governingRequirementRefs.length === 0) {
        diagnostics.push(
          diagnostic({
            code: "missing_governing_requirement",
            field: "governing_requirement_refs",
            detail: "realization_refactor bug admission requires requirement authority"
          })
        );
      }
      if (bug.governingDesignRefs.length === 0) {
        diagnostics.push(
          diagnostic({
            code: "missing_governing_design",
            field: "governing_design_refs",
            detail: "realization_refactor bug admission requires design authority"
          })
        );
      }
    }
  }
  const specs = specChangeRows({ ticketId, fields });
  for (const spec of specs) {
    if (spec.targetSpecSurface.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_spec_change_field",
          field: "target_spec_surface",
          detail: "spec-change row requires target specification surface"
        })
      );
    }
    if (spec.currentTruth.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_spec_change_field",
          field: "current_truth",
          detail: "spec-change row requires current truth"
        })
      );
    }
    if (spec.targetTruth.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_spec_change_field",
          field: "target_truth",
          detail: "spec-change row requires target truth"
        })
      );
    }
    if (spec.sourceDocumentRefs.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_spec_change_field",
          field: "source_documents",
          detail: "spec-change row requires source documents"
        })
      );
    }
    if (spec.proofSurface.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_spec_change_field",
          field: "proof_surface",
          detail: "spec-change row requires proof surface"
        })
      );
    }
  }
  const continuations = overlayContinuationRows({ ticketId, fields });
  for (const continuation of continuations) {
    if (continuation.sourceSegmentCompletionRef.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_overlay_continuation_field",
          field: "source_overlay_segment_completion_ref",
          detail: "overlay continuation requires source segment completion ref"
        })
      );
    }
    if (
      continuation.remainingGraphPressureRefs.length === 0 &&
      continuation.remainingRequirementPressureRefs.length === 0 &&
      continuation.remainingAssetPressureRefs.length === 0
    ) {
      diagnostics.push(
        diagnostic({
          code: "missing_overlay_continuation_field",
          field: "remaining_graph_pressure_refs",
          detail: "overlay continuation requires remaining pressure refs"
        })
      );
    }
    if (continuation.nextEligibleOverlayRefs.length === 0) {
      diagnostics.push(
        diagnostic({
          code: "missing_overlay_continuation_field",
          field: "next_eligible_overlay_refs",
          detail: "overlay continuation requires next eligible overlay refs"
        })
      );
    }
    if (continuation.ruling === "unruled") {
      diagnostics.push(
        diagnostic({
          code: "missing_overlay_continuation_field",
          field: "overlay_continuation_ruling",
          detail:
            "overlay continuation requires a close, repair, split_ticket, depth_traversal, defer, or block ruling"
        })
      );
    }
  }
  const declaredStatus = fieldString(fields, "status");
  const workflowStatus = rowStatus({ declaredStatus, diagnostics });
  const sourceDocuments = fieldList(fields, "source_documents");
  const evaluationCriteria = fieldList(fields, "evaluation_criteria");
  const nonClosureConditions = fieldList(fields, "non_closure_conditions");
  return Object.freeze({
    kind: "sdlc_ticket_workflow_row" as const,
    rowRef: `ticket-workflow-row://odd-sdlc/${ticketId}/${refPart(ticketDigest)}`,
    ticketId,
    title: fieldString(fields, "title"),
    type: fieldString(fields, "type"),
    ticketCategory: fieldString(fields, "ticket_category"),
    declaredStatus,
    directory: input.directory,
    workflowStatus,
    nextLawfulAction: nextLawfulAction({
      directory: input.directory,
      workflowStatus
    }),
    filePath: input.filePath,
    fileUri: pathToFileURL(input.filePath).href,
    ticketDigest,
    missingRequiredFields: Object.freeze(
      SDLC_TICKET_REQUIRED_FIELDS.filter((field) => fieldString(fields, field) === null)
    ),
    diagnostics: Object.freeze(diagnostics),
    sourceDocuments,
    targetTruth: fieldString(fields, "target_truth"),
    supersededTruth: fieldString(fields, "superseded_truth"),
    closureLaw: fieldString(fields, "closure_law"),
    evaluationCriteria,
    nonClosureConditions,
    changeClass: fieldString(fields, "change_class"),
    reEntryPoint: fieldString(fields, "re_entry_point"),
    reviewDecisionRows: reviewDecisionRows({ ticketId, fields }),
    bugTriageRows: bugs,
    specChangeRows: specs,
    overlayContinuationRows: continuations,
    reviewPanelBinding: panelBinding
  });
}

function ticketFiles(input: {
  readonly workspaceRoot: string;
  readonly directory: SdlcTicketWorkflowDirectory;
}): readonly string[] {
  const directoryPath = path.join(
    input.workspaceRoot,
    ".ai-workspace",
    "tickets",
    input.directory
  );
  if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(directoryPath)
      .filter((entry) => entry.endsWith(".md"))
      .map((entry) => path.join(directoryPath, entry))
      .filter((entryPath) => statSync(entryPath).isFile())
      .sort((left, right) => left.localeCompare(right))
  );
}

function duplicateIdDiagnostics(
  rows: readonly SdlcTicketWorkflowRow[]
): readonly SdlcTicketWorkflowDiagnostic[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.ticketId, (counts.get(row.ticketId) ?? 0) + 1);
  }
  return Object.freeze(
    [...counts.entries()].flatMap(([ticketId, count]) =>
      count > 1
        ? [
            diagnostic({
              code: "duplicate_ticket_id",
              field: "id",
              detail: `${ticketId} appears in ${count} ticket workflow rows`
            })
          ]
        : []
    )
  );
}

export function projectSdlcTicketWorkflow(input: {
  readonly workspaceRoot: string;
}): SdlcTicketWorkflowProjection {
  const profiles = reviewerProfilesFromWorkspace({
    workspaceRoot: input.workspaceRoot
  });
  const rows = Object.freeze(
    SDLC_TICKET_WORKFLOW_DIRECTORIES.flatMap((directory) =>
      ticketFiles({ workspaceRoot: input.workspaceRoot, directory }).map((filePath) =>
        projectTicketFile({
          workspaceRoot: input.workspaceRoot,
          directory,
          filePath,
          profiles
        })
      )
    )
  );
  const diagnostics = duplicateIdDiagnostics(rows);
  return Object.freeze({
    kind: "sdlc_ticket_workflow_projection" as const,
    readOnly: true as const,
    choosesNextTraversal: false as const,
    sourceRoot: path.join(input.workspaceRoot, ".ai-workspace", "tickets"),
    sourceRootUri: pathToFileURL(
      path.join(input.workspaceRoot, ".ai-workspace", "tickets")
    ).href,
    sourceDirectories: SDLC_TICKET_WORKFLOW_DIRECTORIES,
    requiredFields: SDLC_TICKET_REQUIRED_FIELDS,
    rows,
    reviewerProfiles: profiles,
    counts: Object.freeze({
      backlog: rows.filter((row) => row.directory === "backlog").length,
      active: rows.filter((row) => row.directory === "active").length,
      blocked: rows.filter((row) => row.workflowStatus === "blocked").length,
      completed: rows.filter((row) => row.directory === "completed").length,
      malformed: rows.filter((row) => row.workflowStatus === "malformed").length,
      stale: rows.filter((row) => row.workflowStatus === "stale").length
    }),
    diagnostics,
    emittedRuntimeEventKinds: Object.freeze([] as const)
  });
}

function admittedTicketRow(input: {
  readonly workflow: SdlcTicketWorkflowProjection;
  readonly ticketId: string;
}): SdlcTicketWorkflowRow {
  const ticketId = normalizeTicketId(input.ticketId);
  const row = input.workflow.rows.find((candidate) => candidate.ticketId === ticketId);
  if (row === undefined) {
    throw new TypeError(`ticket ${ticketId}: missing`);
  }
  if (row.workflowStatus === "malformed") {
    throw new TypeError(`ticket ${ticketId}: malformed`);
  }
  if (row.workflowStatus === "stale") {
    throw new TypeError(`ticket ${ticketId}: stale`);
  }
  if (row.directory !== "active" || row.declaredStatus !== "active") {
    throw new TypeError(`ticket ${ticketId}: not active`);
  }
  if (
    row.targetTruth === null ||
    row.closureLaw === null ||
    row.changeClass === null ||
    row.reEntryPoint === null
  ) {
    throw new TypeError(`ticket ${ticketId}: unadmitted`);
  }
  if (row.reviewPanelBinding?.diagnostics.length) {
    throw new TypeError(`ticket ${ticketId}: reviewer profile admission failed`);
  }
  if (
    row.diagnostics.some(
      (entry) =>
        entry.code === "missing_governing_requirement" ||
        entry.code === "missing_governing_design" ||
        entry.code === "missing_bug_triage_field" ||
        entry.code === "missing_spec_change_field" ||
        entry.code === "missing_overlay_continuation_field" ||
        entry.code === "unknown_reviewer_profile" ||
        entry.code === "unavailable_reviewer_profile" ||
        entry.code === "schema_incompatible_reviewer_profile"
    )
  ) {
    throw new TypeError(`ticket ${ticketId}: unadmitted`);
  }
  return row;
}

export function constructSdlcTicketExecutionContract(input: {
  readonly row: SdlcTicketWorkflowRow;
}): SdlcTicketExecutionContract {
  if (
    input.row.targetTruth === null ||
    input.row.closureLaw === null ||
    input.row.changeClass === null ||
    input.row.reEntryPoint === null
  ) {
    throw new TypeError(`${input.row.ticketId}: cannot admit incomplete ticket`);
  }
  const ticketDigestPart = refPart(input.row.ticketDigest);
  const reviewerProfileIds =
    input.row.reviewPanelBinding?.requiredReviewerProfileIds ?? Object.freeze([]);
  const reviewerProfileConfigDigests =
    input.row.reviewPanelBinding?.reviewerProfileConfigDigests ?? Object.freeze([]);
  return Object.freeze({
    kind: "sdlc_ticket_execution_contract" as const,
    executionContractRef:
      `ticket-execution-contract://odd-sdlc/${input.row.ticketId}/${ticketDigestPart}`,
    ticketId: input.row.ticketId,
    ticketRef: `asset:ticket/${input.row.ticketId}`,
    ticketPath: input.row.filePath,
    ticketUri: input.row.fileUri,
    ticketDigest: input.row.ticketDigest,
    sourceDocuments: input.row.sourceDocuments,
    targetTruth: input.row.targetTruth,
    supersededTruth: input.row.supersededTruth,
    closureLaw: input.row.closureLaw,
    evaluationCriteria: input.row.evaluationCriteria,
    nonClosureConditions: input.row.nonClosureConditions,
    changeClass: input.row.changeClass,
    reEntryPoint: input.row.reEntryPoint,
    reviewPanelBinding: input.row.reviewPanelBinding,
    reviewDecisionRows: input.row.reviewDecisionRows,
    bugTriageRows: input.row.bugTriageRows,
    specChangeRows: input.row.specChangeRows,
    overlayContinuationRows: input.row.overlayContinuationRows,
    rulingRefs: Object.freeze([
      ...input.row.reviewDecisionRows.map((row) => row.decisionRef),
      ...input.row.overlayContinuationRows.map((row) => row.continuationRef)
    ]),
    reviewerProfileIds,
    reviewerProfileConfigDigests,
    overlayContinuationRefs: Object.freeze(
      input.row.overlayContinuationRows.map((row) => row.continuationRef)
    )
  });
}

export function admitSdlcTicketExecutionContract(input: {
  readonly workflow: SdlcTicketWorkflowProjection;
  readonly ticketId: string;
}): SdlcTicketExecutionContract {
  return constructSdlcTicketExecutionContract({
    row: admittedTicketRow(input)
  });
}

export function acceptedSdlcReviewDecisionRows(input: {
  readonly contract: SdlcTicketExecutionContract;
}): readonly SdlcReviewFindingDecisionRow[] {
  return Object.freeze(
    input.contract.reviewDecisionRows.filter((row) => row.ruling === "accepted")
  );
}

export function sdlcTicketExecutionContractRefs(
  contract: SdlcTicketExecutionContract | null | undefined
): readonly string[] {
  if (contract === null || contract === undefined) {
    return Object.freeze([]);
  }
  return Object.freeze([
    ...new Set([
      contract.executionContractRef,
      contract.ticketRef,
      contract.ticketUri,
      contract.ticketDigest,
      ...(contract.reviewPanelBinding === null
        ? []
        : [contract.reviewPanelBinding.panelBindingRef]),
      ...contract.rulingRefs,
      ...contract.reviewDecisionRows.flatMap((row) => [
        ...(row.panelBindingRef === null ? [] : [row.panelBindingRef]),
        ...(row.invocationRef === null ? [] : [row.invocationRef]),
        ...(row.outputDigest === null ? [] : [row.outputDigest]),
        ...row.evidenceRefs
      ]),
      ...contract.reviewerProfileIds.map(
        (profileId) => `reviewer-profile://odd-sdlc/${profileId}`
      ),
      ...contract.reviewerProfileConfigDigests,
      ...contract.overlayContinuationRefs
    ])
  ]);
}

export function isSdlcTicketAssetHandle(handle: string): boolean {
  return handle.startsWith("ticket/");
}

function ticketIdFromAssetHandle(handle: string): string {
  return normalizeTicketId(handle.slice("ticket/".length));
}

export function resolveSdlcTicketExecutionContractForAssetHandle(input: {
  readonly workflow: SdlcTicketWorkflowProjection;
  readonly handle: string;
}): SdlcTicketAssetStartResolution {
  if (!isSdlcTicketAssetHandle(input.handle)) {
    return Object.freeze({ kind: "not_ticket_asset" as const });
  }
  const ticketId = ticketIdFromAssetHandle(input.handle);
  const row = input.workflow.rows.find((candidate) => candidate.ticketId === ticketId);
  if (row === undefined) {
    return Object.freeze({
      kind: "blocked" as const,
      blockingReason: "ticket_missing" as const,
      diagnostics: Object.freeze([
        diagnostic({
          code: "missing_required_field",
          field: "id",
          detail: `ticket ${ticketId} is not present under .ai-workspace/tickets`
        })
      ])
    });
  }
  if (row.workflowStatus === "malformed") {
    return Object.freeze({
      kind: "blocked" as const,
      blockingReason: "ticket_malformed" as const,
      diagnostics: row.diagnostics
    });
  }
  if (row.workflowStatus === "stale") {
    return Object.freeze({
      kind: "blocked" as const,
      blockingReason: "ticket_stale" as const,
      diagnostics: row.diagnostics
    });
  }
  if (row.directory !== "active" || row.declaredStatus !== "active") {
    return Object.freeze({
      kind: "blocked" as const,
      blockingReason: "ticket_not_active" as const,
      diagnostics: row.diagnostics
    });
  }
  try {
    return Object.freeze({
      kind: "admitted" as const,
      contract: constructSdlcTicketExecutionContract({ row })
    });
  } catch {
    return Object.freeze({
      kind: "blocked" as const,
      blockingReason: "ticket_unadmitted" as const,
      diagnostics: row.diagnostics
    });
  }
}
