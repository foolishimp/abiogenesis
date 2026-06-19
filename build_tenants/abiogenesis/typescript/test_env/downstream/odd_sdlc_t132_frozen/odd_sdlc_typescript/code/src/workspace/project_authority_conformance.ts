// Implements: T-134

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FG_CONFORM_PROJECT_AUTHORITY } from "../graph/library.js";
import { sha256Text } from "../shared/digest.js";
import type { SdlcTargetObligationBinding } from "../projection/query_domain.js";
import type { SdlcConformProjectReport } from "./carriers.js";

const SHARED_TEMPLATE_ROOT =
  "standards-template://specification_methodology/specification/standards/templates";
const GENERATED_AUTHORITY_SECTION_HEADING = "## Conformed Authority";
const GENERATED_BOOTSTRAP_MARKER =
  "This generated surface is a deterministic read model over conformed";

export type SdlcProjectAuthoritySurfaceRole =
  | "project_bootstrap"
  | "intent"
  | "product"
  | "goals"
  | "requirements_readme";

export type SdlcProjectAuthoritySupport =
  | "supportable"
  | "deferred"
  | "blocked";

export type SdlcProjectAuthorityInputKind =
  | "specification_folder"
  | "source_file"
  | "source_folder";

export type SdlcProjectAuthorityInputBlockReason =
  | "authority_input_required"
  | "authority_input_not_found"
  | "authority_input_ambiguous";

export interface SdlcProjectAuthorityInput {
  readonly kind: SdlcProjectAuthorityInputKind;
  readonly path: string;
}

export interface SdlcProjectAuthorityInputAdmission {
  readonly kind: "sdlc_project_authority_input_admission";
  readonly status: "admitted" | "blocked";
  readonly inputKind: SdlcProjectAuthorityInputKind | null;
  readonly relativePath: string | null;
  readonly absolutePath: string | null;
  readonly inputRef: string | null;
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly SdlcProjectAuthorityInputBlockReason[];
}

export interface SdlcProjectAuthoritySurfaceRow {
  readonly kind: "sdlc_project_authority_surface_row";
  readonly role: SdlcProjectAuthoritySurfaceRole;
  readonly relativePath: string;
  readonly templateRef: string;
  readonly support: SdlcProjectAuthoritySupport;
  readonly evidenceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface SdlcProjectAuthorityEvaluateNextActionRow {
  readonly kind: "sdlc_project_authority_evaluate_next_action_row";
  readonly evaluationFunction: "evaluate_next";
  readonly actionRef: string;
  readonly source:
    | "authority_input"
    | "authority_clarification"
    | "conformance"
    | "target_binding"
    | "target_binding_required";
  readonly graphFunctionName: string | null;
  readonly targetAssetType: string;
  readonly disposition: "candidate" | "blocked" | "no_action";
  readonly bindingRef: string | null;
  readonly publishedActionRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface SdlcProjectAuthorityConformanceProjection {
  readonly kind: "sdlc_project_authority_conformance_projection";
  readonly graphFunctionName: typeof FG_CONFORM_PROJECT_AUTHORITY;
  readonly readOnly: true;
  readonly gapEvaluationFunction: null;
  readonly nextActionEvaluationFunction: "evaluate_next";
  readonly actionClosureEvaluationFunction: null;
  readonly emittedRuntimeEventKinds: readonly string[];
  readonly conformanceStatus: SdlcConformProjectReport["status"];
  readonly projectSlug: string;
  readonly activeTenant: string;
  readonly authorityInputAdmission: SdlcProjectAuthorityInputAdmission | null;
  readonly authoritySurfaceRows: readonly SdlcProjectAuthoritySurfaceRow[];
  readonly requirementGeneration: "deferred_to_evaluator";
  readonly constructsReleaseGraph: false;
  readonly constructsProductFiles: false;
  readonly nextActionRows: readonly SdlcProjectAuthorityEvaluateNextActionRow[];
}

export interface SdlcProjectAuthorityMaterializedFile {
  readonly kind: "sdlc_project_authority_materialized_file";
  readonly role: SdlcProjectAuthoritySurfaceRole;
  readonly relativePath: string;
  readonly templateRef: string;
  readonly absolutePath: string;
  readonly fileRef: string;
  readonly digest: string;
  readonly byteCount: number;
  readonly writeDisposition: "created" | "updated";
}

export interface SdlcProjectAuthoritySkippedExistingFile {
  readonly kind: "sdlc_project_authority_skipped_existing_file";
  readonly role: SdlcProjectAuthoritySurfaceRole;
  readonly relativePath: string;
  readonly templateRef: string;
  readonly absolutePath: string;
  readonly fileRef: string;
  readonly digest: string;
  readonly byteCount: number;
  readonly reasonRef: "existing_project_authority_without_generated_marker";
}

export interface SdlcProjectAuthorityMaterializationReport {
  readonly kind: "sdlc_project_authority_materialization_report";
  readonly graphFunctionName: typeof FG_CONFORM_PROJECT_AUTHORITY;
  readonly projection: SdlcProjectAuthorityConformanceProjection;
  readonly materializedFiles: readonly SdlcProjectAuthorityMaterializedFile[];
  readonly skippedExistingFiles: readonly SdlcProjectAuthoritySkippedExistingFile[];
  readonly emittedRuntimeEventKinds: readonly string[];
  readonly constructsReleaseGraph: false;
  readonly constructsProductFiles: false;
}

function templateRef(path: string): string {
  return `${SHARED_TEMPLATE_ROOT}/${path}`;
}

function surfaceRow(input: {
  readonly role: SdlcProjectAuthoritySurfaceRole;
  readonly relativePath: string;
  readonly templatePath: string;
  readonly support: SdlcProjectAuthoritySupport;
  readonly evidenceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}): SdlcProjectAuthoritySurfaceRow {
  return Object.freeze({
    kind: "sdlc_project_authority_surface_row",
    role: input.role,
    relativePath: input.relativePath,
    templateRef: templateRef(input.templatePath),
    support: input.support,
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    reasonRefs: Object.freeze([...input.reasonRefs])
  });
}

function nextAction(input: {
  readonly source: SdlcProjectAuthorityEvaluateNextActionRow["source"];
  readonly graphFunctionName: string | null;
  readonly targetAssetType: string;
  readonly disposition: SdlcProjectAuthorityEvaluateNextActionRow["disposition"];
  readonly bindingRef?: string | null;
  readonly publishedActionRefs?: readonly string[];
  readonly reasonRefs: readonly string[];
}): SdlcProjectAuthorityEvaluateNextActionRow {
  const actionName = input.graphFunctionName ?? input.disposition;
  return Object.freeze({
    kind: "sdlc_project_authority_evaluate_next_action_row",
    evaluationFunction: "evaluate_next",
    actionRef:
      `action://odd-sdlc/Fg_conform_project_authority/${input.source}/${actionName}/${input.targetAssetType}`,
    source: input.source,
    graphFunctionName: input.graphFunctionName,
    targetAssetType: input.targetAssetType,
    disposition: input.disposition,
    bindingRef: input.bindingRef ?? null,
    publishedActionRefs: Object.freeze([...(input.publishedActionRefs ?? [])]),
    reasonRefs: Object.freeze([...input.reasonRefs])
  });
}

function sortNextActionRows(
  rows: readonly SdlcProjectAuthorityEvaluateNextActionRow[]
): readonly SdlcProjectAuthorityEvaluateNextActionRow[] {
  return Object.freeze(
    [...rows].sort((left, right) =>
      [
        left.targetAssetType.localeCompare(right.targetAssetType),
        (left.graphFunctionName ?? "").localeCompare(right.graphFunctionName ?? ""),
        left.disposition.localeCompare(right.disposition),
        left.actionRef.localeCompare(right.actionRef)
      ].find((comparison) => comparison !== 0) ?? 0
    )
  );
}

function targetBindingNextActionRows(
  targetBindings: readonly SdlcTargetObligationBinding[]
): readonly SdlcProjectAuthorityEvaluateNextActionRow[] {
  return sortNextActionRows(
    targetBindings.flatMap((binding) => {
      if (binding.status === "eligible") {
        return binding.admissibleGraphFunctionNames.map((graphFunctionName) =>
          nextAction({
            source: "target_binding",
            graphFunctionName,
            targetAssetType: binding.declaredTargetAssetType,
            disposition: "candidate",
            bindingRef: binding.bindingRef,
            publishedActionRefs: binding.publishedActionRefs,
            reasonRefs: binding.reasonRefs
          })
        );
      }
      return [
        nextAction({
          source: "target_binding",
          graphFunctionName: null,
          targetAssetType: binding.declaredTargetAssetType,
          disposition: "no_action",
          bindingRef: binding.bindingRef,
          publishedActionRefs: binding.publishedActionRefs,
          reasonRefs: binding.reasonRefs
        })
      ];
    })
  );
}

function blockedAuthorityInputAdmission(input: {
  readonly reason: SdlcProjectAuthorityInputBlockReason;
  readonly authorityInput?: SdlcProjectAuthorityInput;
  readonly relativePath?: string | null;
  readonly absolutePath?: string | null;
}): SdlcProjectAuthorityInputAdmission {
  const absolutePath = input.absolutePath ?? null;
  return Object.freeze({
    kind: "sdlc_project_authority_input_admission" as const,
    status: "blocked" as const,
    inputKind: input.authorityInput?.kind ?? null,
    relativePath: input.relativePath ?? input.authorityInput?.path ?? null,
    absolutePath,
    inputRef: absolutePath === null ? null : pathToFileURL(absolutePath).href,
    sourceRefs: Object.freeze([]),
    reasonRefs: Object.freeze([input.reason])
  });
}

function normalizeAuthorityInputPath(
  authorityInput: SdlcProjectAuthorityInput
): string | null {
  const relativePath = authorityInput.path.trim();
  if (relativePath.length === 0) {
    return null;
  }
  if (path.isAbsolute(relativePath)) {
    return null;
  }
  const normalized = path.normalize(relativePath);
  if (normalized === "." || normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    return null;
  }
  return normalized;
}

function fileRefsUnderDirectory(absoluteRoot: string): readonly string[] {
  const refs: string[] = [];
  const visit = (directory: string): void => {
    const entries = readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name)
    );
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (entry.isFile()) {
        refs.push(pathToFileURL(absolutePath).href);
      }
    }
  };
  visit(absoluteRoot);
  return Object.freeze(refs);
}

export function admitSdlcProjectAuthorityInput(input: {
  readonly workspaceRoot: string;
  readonly authorityInput?: SdlcProjectAuthorityInput | null;
}): SdlcProjectAuthorityInputAdmission {
  if (input.authorityInput === undefined || input.authorityInput === null) {
    return blockedAuthorityInputAdmission({
      reason: "authority_input_required"
    });
  }
  const relativePath = normalizeAuthorityInputPath(input.authorityInput);
  if (relativePath === null) {
    return blockedAuthorityInputAdmission({
      reason: "authority_input_ambiguous",
      authorityInput: input.authorityInput
    });
  }
  const absolutePath = path.join(input.workspaceRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return blockedAuthorityInputAdmission({
      reason: "authority_input_not_found",
      authorityInput: input.authorityInput,
      relativePath,
      absolutePath
    });
  }
  const stat = statSync(absolutePath);
  const expectsFile = input.authorityInput.kind === "source_file";
  const shapeMatches = expectsFile ? stat.isFile() : stat.isDirectory();
  if (!shapeMatches) {
    return blockedAuthorityInputAdmission({
      reason: "authority_input_ambiguous",
      authorityInput: input.authorityInput,
      relativePath,
      absolutePath
    });
  }
  const sourceRefs = stat.isFile()
    ? Object.freeze([pathToFileURL(absolutePath).href])
    : fileRefsUnderDirectory(absolutePath);
  return Object.freeze({
    kind: "sdlc_project_authority_input_admission" as const,
    status: "admitted" as const,
    inputKind: input.authorityInput.kind,
    relativePath,
    absolutePath,
    inputRef: pathToFileURL(absolutePath).href,
    sourceRefs,
    reasonRefs: Object.freeze([])
  });
}

function resolveAuthorityInputAdmission(input: {
  readonly workspaceRoot?: string;
  readonly authorityInput?: SdlcProjectAuthorityInput;
  readonly authorityInputAdmission?: SdlcProjectAuthorityInputAdmission;
  readonly requireDeclaredAuthorityInput?: boolean;
}): SdlcProjectAuthorityInputAdmission | null {
  if (input.authorityInputAdmission !== undefined) {
    return input.authorityInputAdmission;
  }
  if (input.authorityInput !== undefined) {
    if (input.workspaceRoot === undefined) {
      throw new TypeError(
        "workspaceRoot is required when admitting project authority input"
      );
    }
    return admitSdlcProjectAuthorityInput({
      workspaceRoot: input.workspaceRoot,
      authorityInput: input.authorityInput
    });
  }
  if (input.requireDeclaredAuthorityInput === true) {
    return blockedAuthorityInputAdmission({
      reason: "authority_input_required"
    });
  }
  return null;
}

function supportForAuthority(input: {
  readonly report: SdlcConformProjectReport;
  readonly evidenceRefs: readonly string[];
  readonly authorityInputAdmission: SdlcProjectAuthorityInputAdmission | null;
}): SdlcProjectAuthoritySupport {
  if (
    input.report.status === "blocked" ||
    input.authorityInputAdmission?.status === "blocked"
  ) {
    return "blocked";
  }
  return input.evidenceRefs.length === 0 ? "deferred" : "supportable";
}

export function deriveSdlcProjectAuthorityConformanceProjection(input: {
  readonly conformanceReport: SdlcConformProjectReport;
  readonly operatorSeedRefs?: readonly string[];
  readonly targetBindings?: readonly SdlcTargetObligationBinding[];
  readonly authorityInputAdmission?: SdlcProjectAuthorityInputAdmission;
  readonly requireDeclaredAuthorityInput?: boolean;
}): SdlcProjectAuthorityConformanceProjection {
  const authorityInputAdmission = resolveAuthorityInputAdmission({
    ...(input.authorityInputAdmission === undefined
      ? {}
      : { authorityInputAdmission: input.authorityInputAdmission }),
    ...(input.requireDeclaredAuthorityInput === undefined
      ? {}
      : { requireDeclaredAuthorityInput: input.requireDeclaredAuthorityInput })
  });
  const authorityInputSourceRefs =
    authorityInputAdmission?.status === "admitted"
      ? authorityInputAdmission.sourceRefs
      : Object.freeze([]);
  const evidenceRefs = Object.freeze([...new Set([
    ...input.conformanceReport.sourceRefs,
    ...authorityInputSourceRefs,
    ...(input.operatorSeedRefs ?? [])
  ])]);
  const authoritySupport = supportForAuthority({
    report: input.conformanceReport,
    evidenceRefs,
    authorityInputAdmission
  });
  const authorityInputBlockedReasonRefs =
    authorityInputAdmission?.status === "blocked"
      ? authorityInputAdmission.reasonRefs
      : Object.freeze([]);
  const blockedReasonRefs = Object.freeze([
    ...(input.conformanceReport.status === "blocked"
      ? [
          "project_authority_requires_defined_conformed_workspace",
          ...input.conformanceReport.conformanceGaps
        ]
      : []),
    ...authorityInputBlockedReasonRefs
  ]);
  const deferredReasonRefs =
    authoritySupport === "deferred"
      ? Object.freeze(["project_authority_not_observed"])
      : Object.freeze([]);
  const rows = Object.freeze([
    surfaceRow({
      role: "project_bootstrap",
      relativePath: ".ai-workspace/context/project_bootstrap.md",
      templatePath: "AGENTS_TEMPLATE.md",
      support:
        input.conformanceReport.status === "passed" &&
        authorityInputAdmission?.status !== "blocked"
          ? "supportable"
          : "blocked",
      evidenceRefs,
      reasonRefs: blockedReasonRefs
    }),
    surfaceRow({
      role: "intent",
      relativePath: "specification/INTENT.md",
      templatePath: "INTENT_TEMPLATE.md",
      support: authoritySupport,
      evidenceRefs,
      reasonRefs: Object.freeze([...blockedReasonRefs, ...deferredReasonRefs])
    }),
    surfaceRow({
      role: "product",
      relativePath: "specification/PRODUCT.md",
      templatePath: "PRODUCT_TEMPLATE.md",
      support: authoritySupport,
      evidenceRefs,
      reasonRefs: Object.freeze([...blockedReasonRefs, ...deferredReasonRefs])
    }),
    surfaceRow({
      role: "goals",
      relativePath: "specification/GOALS.md",
      templatePath: "GOALS_TEMPLATE.md",
      support: authoritySupport,
      evidenceRefs,
      reasonRefs: Object.freeze([...blockedReasonRefs, ...deferredReasonRefs])
    }),
    surfaceRow({
      role: "requirements_readme",
      relativePath: "specification/requirements/README.md",
      templatePath: "requirements/README_TEMPLATE.md",
      support:
        input.conformanceReport.status === "passed" &&
        authorityInputAdmission?.status !== "blocked"
          ? "deferred"
          : "blocked",
      evidenceRefs: Object.freeze([]),
      reasonRefs:
        input.conformanceReport.status === "passed" &&
        authorityInputAdmission?.status !== "blocked"
          ? Object.freeze(["requirement_generation_deferred_to_evaluator"])
          : blockedReasonRefs
    })
  ]);
  const bindingRows = targetBindingNextActionRows(input.targetBindings ?? []);
  const nextActionRows =
    authorityInputAdmission?.status === "blocked"
      ? Object.freeze([
          nextAction({
            source: "authority_input",
            graphFunctionName: null,
            targetAssetType: "declared_authority_input",
            disposition: "blocked",
            bindingRef: null,
            reasonRefs: authorityInputAdmission.reasonRefs
          })
        ])
      : input.conformanceReport.status === "blocked"
      ? Object.freeze([
          nextAction({
            source: "conformance",
            graphFunctionName: "Fg_conform_project",
            targetAssetType: "conform_project_profile",
            disposition: "blocked",
            bindingRef: null,
            reasonRefs: blockedReasonRefs
          })
        ])
      : bindingRows.length > 0
        ? bindingRows
        : authoritySupport === "supportable"
        ? Object.freeze([
            nextAction({
              source: "target_binding_required",
              graphFunctionName: null,
              targetAssetType: "project_authority_next_action_projection",
              disposition: "no_action",
              reasonRefs: Object.freeze([
                "target_binding_required_before_next_action"
              ])
            })
          ])
        : Object.freeze([
            nextAction({
              source: "authority_clarification",
              graphFunctionName: "clarify_project_authority",
              targetAssetType: "intent_surface",
              disposition: "candidate",
              reasonRefs: deferredReasonRefs
            })
          ]);
  return Object.freeze({
    kind: "sdlc_project_authority_conformance_projection",
    graphFunctionName: FG_CONFORM_PROJECT_AUTHORITY,
    readOnly: true,
    gapEvaluationFunction: null,
    nextActionEvaluationFunction: "evaluate_next",
    actionClosureEvaluationFunction: null,
    emittedRuntimeEventKinds: Object.freeze([]),
    conformanceStatus: input.conformanceReport.status,
    projectSlug: input.conformanceReport.profile.projectSlug,
    activeTenant: input.conformanceReport.profile.activeTenant,
    authorityInputAdmission,
    authoritySurfaceRows: rows,
    requirementGeneration: "deferred_to_evaluator",
    constructsReleaseGraph: false,
    constructsProductFiles: false,
    nextActionRows
  });
}

function requireWorkspaceRelativePath(relativePath: string): string {
  if (relativePath.trim().length === 0) {
    throw new TypeError("authority materialization relativePath must be non-empty");
  }
  if (path.isAbsolute(relativePath) || relativePath.includes("..")) {
    throw new TypeError(
      `authority materialization path must remain workspace-relative: ${relativePath}`
    );
  }
  return relativePath;
}

function templatePathFromRef(input: {
  readonly templateRoot: string;
  readonly templateRef: string;
}): string {
  const prefix = `${SHARED_TEMPLATE_ROOT}/`;
  if (!input.templateRef.startsWith(prefix)) {
    throw new TypeError(`Unsupported authority template ref: ${input.templateRef}`);
  }
  return path.join(input.templateRoot, input.templateRef.slice(prefix.length));
}

function sourceRefLines(sourceRefs: readonly string[]): readonly string[] {
  return sourceRefs.length === 0
    ? Object.freeze(["- none_observed"])
    : Object.freeze(sourceRefs.map((ref) => `- ${ref}`));
}

function authorityInputLines(
  admission: SdlcProjectAuthorityInputAdmission | null
): readonly string[] {
  if (admission === null) {
    return Object.freeze([
      "- authority_input_status: legacy_implicit",
      "- authority_input_kind: none",
      "- authority_input_path: none"
    ]);
  }
  return Object.freeze([
    `- authority_input_status: ${admission.status}`,
    `- authority_input_kind: ${admission.inputKind ?? "none"}`,
    `- authority_input_path: ${admission.relativePath ?? "none"}`,
    `- authority_input_ref: ${admission.inputRef ?? "none"}`
  ]);
}

function conformedTemplateContent(input: {
  readonly row: SdlcProjectAuthoritySurfaceRow;
  readonly templateContent: string;
  readonly report: SdlcConformProjectReport;
}): string {
  const content = input.templateContent.endsWith("\n")
    ? input.templateContent.trimEnd()
    : input.templateContent;
  return [
    content,
    "",
    "## Conformed Authority",
    "",
    `- graph_function: ${FG_CONFORM_PROJECT_AUTHORITY}`,
    `- project_slug: ${input.report.profile.projectSlug}`,
    `- active_tenant: ${input.report.profile.activeTenant}`,
    `- selected_output_root: ${input.report.profile.selectedOutputRoot}`,
    `- authority_role: ${input.row.role}`,
    `- authority_support: ${input.row.support}`,
    `- template_ref: ${input.row.templateRef}`,
    "",
    "## Evidence Refs",
    "",
    ...sourceRefLines(input.row.evidenceRefs),
    "",
    "## Reason Refs",
    "",
    ...(input.row.reasonRefs.length === 0
      ? ["- none"]
      : input.row.reasonRefs.map((ref) => `- ${ref}`)),
    ""
  ].join("\n");
}

function projectBootstrapContent(input: {
  readonly row: SdlcProjectAuthoritySurfaceRow;
  readonly report: SdlcConformProjectReport;
  readonly projection: SdlcProjectAuthorityConformanceProjection;
}): string {
  return [
    "# Project Bootstrap",
    "",
    "This generated surface is a deterministic read model over conformed",
    "project authority. It is not a replacement for project-owned",
    "specification truth.",
    "",
    "## Workspace Authority",
    "",
    `- graph_function: ${FG_CONFORM_PROJECT_AUTHORITY}`,
    `- project_slug: ${input.report.profile.projectSlug}`,
    `- active_tenant: ${input.report.profile.activeTenant}`,
    `- selected_output_root: ${input.report.profile.selectedOutputRoot}`,
    `- conformance_status: ${input.report.status}`,
    `- authority_support: ${input.row.support}`,
    ...authorityInputLines(input.projection.authorityInputAdmission),
    "",
    "## Source Refs",
    "",
    ...sourceRefLines(input.row.evidenceRefs),
    "",
    "## Next Action View",
    "",
    ...input.projection.nextActionRows.map((row) =>
      `- ${row.disposition}: ${row.graphFunctionName ?? "no_graph_function"} -> ${row.targetAssetType}`
    ),
    ""
  ].join("\n");
}

function shouldMaterializeAuthorityRow(row: SdlcProjectAuthoritySurfaceRow): boolean {
  if (row.support === "supportable") {
    return true;
  }
  return row.role === "requirements_readme" && row.support === "deferred";
}

function authorityFileIdentity(input: {
  readonly workspaceRoot: string;
  readonly row: SdlcProjectAuthoritySurfaceRow;
}): {
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly fileRef: string;
} {
  const relativePath = requireWorkspaceRelativePath(input.row.relativePath);
  const absolutePath = path.join(input.workspaceRoot, relativePath);
  return Object.freeze({
    relativePath,
    absolutePath,
    fileRef: pathToFileURL(absolutePath).href
  });
}

function existingGeneratedMarkerForRole(
  role: SdlcProjectAuthoritySurfaceRole,
  content: string
): boolean {
  if (role === "project_bootstrap") {
    return content.includes(GENERATED_BOOTSTRAP_MARKER);
  }
  return content.includes(GENERATED_AUTHORITY_SECTION_HEADING);
}

function mergeGeneratedAuthoritySection(input: {
  readonly row: SdlcProjectAuthoritySurfaceRow;
  readonly existingContent: string;
  readonly generatedContent: string;
}): string {
  if (input.row.role === "project_bootstrap") {
    return input.generatedContent;
  }
  const existingMarkerIndex = input.existingContent.indexOf(
    GENERATED_AUTHORITY_SECTION_HEADING
  );
  const generatedMarkerIndex = input.generatedContent.indexOf(
    GENERATED_AUTHORITY_SECTION_HEADING
  );
  if (existingMarkerIndex < 0 || generatedMarkerIndex < 0) {
    return input.generatedContent;
  }
  const preservedPrefix = input.existingContent.slice(0, existingMarkerIndex);
  const generatedSection = input.generatedContent.slice(generatedMarkerIndex);
  return `${preservedPrefix.trimEnd()}\n\n${generatedSection}`;
}

function materializedFile(input: {
  readonly workspaceRoot: string;
  readonly row: SdlcProjectAuthoritySurfaceRow;
  readonly content: string;
  readonly writeDisposition: SdlcProjectAuthorityMaterializedFile["writeDisposition"];
}): SdlcProjectAuthorityMaterializedFile {
  const identity = authorityFileIdentity({
    workspaceRoot: input.workspaceRoot,
    row: input.row
  });
  const digest = sha256Text(input.content);
  return Object.freeze({
    kind: "sdlc_project_authority_materialized_file" as const,
    role: input.row.role,
    relativePath: identity.relativePath,
    templateRef: input.row.templateRef,
    absolutePath: identity.absolutePath,
    fileRef: identity.fileRef,
    digest,
    byteCount: Buffer.byteLength(input.content, "utf8"),
    writeDisposition: input.writeDisposition
  });
}

function skippedExistingFile(input: {
  readonly workspaceRoot: string;
  readonly row: SdlcProjectAuthoritySurfaceRow;
  readonly content: string;
}): SdlcProjectAuthoritySkippedExistingFile {
  const identity = authorityFileIdentity({
    workspaceRoot: input.workspaceRoot,
    row: input.row
  });
  return Object.freeze({
    kind: "sdlc_project_authority_skipped_existing_file" as const,
    role: input.row.role,
    relativePath: identity.relativePath,
    templateRef: input.row.templateRef,
    absolutePath: identity.absolutePath,
    fileRef: identity.fileRef,
    digest: sha256Text(input.content),
    byteCount: Buffer.byteLength(input.content, "utf8"),
    reasonRef: "existing_project_authority_without_generated_marker" as const
  });
}

function writeAuthorityFile(input: {
  readonly workspaceRoot: string;
  readonly row: SdlcProjectAuthoritySurfaceRow;
  readonly content: string;
}): {
  readonly materializedFile: SdlcProjectAuthorityMaterializedFile | null;
  readonly skippedExistingFile: SdlcProjectAuthoritySkippedExistingFile | null;
} {
  const identity = authorityFileIdentity({
    workspaceRoot: input.workspaceRoot,
    row: input.row
  });
  if (existsSync(identity.absolutePath)) {
    const existingContent = readFileSync(identity.absolutePath, "utf8");
    if (!existingGeneratedMarkerForRole(input.row.role, existingContent)) {
      return Object.freeze({
        materializedFile: null,
        skippedExistingFile: skippedExistingFile({
          workspaceRoot: input.workspaceRoot,
          row: input.row,
          content: existingContent
        })
      });
    }
    const mergedContent = mergeGeneratedAuthoritySection({
      row: input.row,
      existingContent,
      generatedContent: input.content
    });
    const file = materializedFile({
      workspaceRoot: input.workspaceRoot,
      row: input.row,
      content: mergedContent,
      writeDisposition: "updated"
    });
    mkdirSync(path.dirname(file.absolutePath), { recursive: true });
    writeFileSync(file.absolutePath, mergedContent, "utf8");
    return Object.freeze({
      materializedFile: file,
      skippedExistingFile: null
    });
  }
  const file = materializedFile({
    workspaceRoot: input.workspaceRoot,
    row: input.row,
    content: input.content,
    writeDisposition: "created"
  });
  mkdirSync(path.dirname(file.absolutePath), { recursive: true });
  writeFileSync(file.absolutePath, input.content, "utf8");
  return Object.freeze({
    materializedFile: file,
    skippedExistingFile: null
  });
}

export function materializeSdlcProjectAuthorityConformance(input: {
  readonly workspaceRoot: string;
  readonly templateRoot: string;
  readonly conformanceReport: SdlcConformProjectReport;
  readonly operatorSeedRefs?: readonly string[];
  readonly targetBindings?: readonly SdlcTargetObligationBinding[];
  readonly authorityInput?: SdlcProjectAuthorityInput;
  readonly authorityInputAdmission?: SdlcProjectAuthorityInputAdmission;
  readonly requireDeclaredAuthorityInput?: boolean;
}): SdlcProjectAuthorityMaterializationReport {
  if (!existsSync(input.templateRoot)) {
    throw new TypeError(`authority template root not found: ${input.templateRoot}`);
  }
  const authorityInputAdmission = resolveAuthorityInputAdmission({
    workspaceRoot: input.workspaceRoot,
    ...(input.authorityInput === undefined
      ? {}
      : { authorityInput: input.authorityInput }),
    ...(input.authorityInputAdmission === undefined
      ? {}
      : { authorityInputAdmission: input.authorityInputAdmission }),
    ...(input.requireDeclaredAuthorityInput === undefined
      ? {}
      : { requireDeclaredAuthorityInput: input.requireDeclaredAuthorityInput })
  });
  const projection = deriveSdlcProjectAuthorityConformanceProjection({
    conformanceReport: input.conformanceReport,
    ...(input.operatorSeedRefs === undefined
      ? {}
      : { operatorSeedRefs: input.operatorSeedRefs }),
    ...(input.targetBindings === undefined
      ? {}
      : { targetBindings: input.targetBindings }),
    ...(authorityInputAdmission === null
      ? {}
      : { authorityInputAdmission }),
    ...(input.requireDeclaredAuthorityInput === undefined
      ? {}
      : { requireDeclaredAuthorityInput: input.requireDeclaredAuthorityInput })
  });
  const materializedFiles: SdlcProjectAuthorityMaterializedFile[] = [];
  const skippedExistingFiles: SdlcProjectAuthoritySkippedExistingFile[] = [];
  for (const row of projection.authoritySurfaceRows) {
    if (!shouldMaterializeAuthorityRow(row)) {
      continue;
    }
    const content =
      row.role === "project_bootstrap"
        ? projectBootstrapContent({
            row,
            report: input.conformanceReport,
            projection
          })
        : conformedTemplateContent({
            row,
            templateContent: readFileSync(
              templatePathFromRef({
                templateRoot: input.templateRoot,
                templateRef: row.templateRef
              }),
              "utf8"
            ),
            report: input.conformanceReport
          });
    const writeOutcome = writeAuthorityFile({
      workspaceRoot: input.workspaceRoot,
      row,
      content
    });
    if (writeOutcome.materializedFile !== null) {
      materializedFiles.push(writeOutcome.materializedFile);
    }
    if (writeOutcome.skippedExistingFile !== null) {
      skippedExistingFiles.push(writeOutcome.skippedExistingFile);
    }
  }
  return Object.freeze({
    kind: "sdlc_project_authority_materialization_report" as const,
    graphFunctionName: FG_CONFORM_PROJECT_AUTHORITY,
    projection,
    materializedFiles: Object.freeze(materializedFiles),
    skippedExistingFiles: Object.freeze(skippedExistingFiles),
    emittedRuntimeEventKinds: Object.freeze([]),
    constructsReleaseGraph: false,
    constructsProductFiles: false
  });
}
