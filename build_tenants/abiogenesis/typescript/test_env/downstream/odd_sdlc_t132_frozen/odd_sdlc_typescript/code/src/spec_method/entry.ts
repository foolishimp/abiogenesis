// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-043

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  constructConstructionPriorityRule,
  constructConstructionPriorityScheme,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";
import type {
  ConstructionPriorityScheme,
  ExecutionBasis,
  RuntimeEvent,
  StartRuntimeTraversalStrategySelection
} from "@abiogenesis/typescript-tenant";
import {
  admitSdlcGraphFunctionBoundaryRef,
  admitSdlcGraphVectorBoundaryRef,
  constructSdlcGraphFunctionCatalog,
  constructSdlcGtlModule,
  constructSdlcTraversalOverlayCatalog,
  FG_CONFORM_PROJECT,
  sdlcGraphFunctionBoundaryRef
} from "../graph/index.js";
import { resolveSdlcTraversalOverlay } from "../graph/index.js";
import { SdlcGraphBoundaryRefError } from "../graph/index.js";
import {
  makeSdlcBlockingReason,
  type SdlcBlockingReason
} from "../shared/blocking_reason.js";
import { installOddSdlcTypescript } from "../install/index.js";
import {
  analyzeSdlcFdRunArchive,
  renderSdlcFdRunAnalysisMarkdown,
  SDLC_FD_RUN_ANALYSIS_FORMAT_VALUES,
  type SdlcFdRunAnalysisFormat,
  type SdlcFdRunAnalysisProfile,
  type SdlcFdRunAnalysisResult
} from "../analysis/index.js";
import {
  constructSdlcRequirementFulfillmentArchiveRehydration,
  deriveSdlcGapDossier,
  evalSdlcGapFromReplay,
  projectSdlcQueryDomain,
  projectSdlcRequirementFulfillmentPublicViewFromPriorProjection,
  withSdlcRequirementFulfillmentArchiveRehydration,
  type SdlcRequirementClosureRegister,
  type SdlcRequirementFulfillmentClosureSource,
  type SdlcRequirementFulfillmentEdgeLedgerSource,
  type SdlcRequirementFulfillmentAssessmentPublicInput,
  type SdlcRequirementFulfillmentNextActionSource,
  type SdlcRequirementFulfillmentPublicProjection
} from "../projection/index.js";
import { describeOddSdlcTypescriptRcQualification } from "../qualification/index.js";
import {
  deriveOddSdlcTypescriptReleaseCut,
  deriveOddSdlcTypescriptReleaseSnapshot
} from "../release/index.js";
import {
  deriveSdlcPostCloseOverlayContinuationActionInput,
  executeInstalledOperatorStart,
  readOddSdlcRuntimeEvents,
  readOddSdlcRuntimeEventsSync
} from "../operator/index.js";
import {
  SDLC_PUBLIC_START_UNTIL_VALUES,
  admitSdlcRuntimeTraversalSelections,
  projectSdlcWorkerAttachment,
  publicStartOnce,
  type SdlcPublicStartTargetKind,
  type SdlcPublicStartUntil
} from "../start/index.js";
import {
  bindSdlcRoute,
  classifySdlcGapObservation,
  observeSdlcGapPressure,
  type SdlcGapObservation,
  type SdlcRouteBinding,
  type SdlcTriageClassification
} from "../triage/index.js";
import {
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcConformProjectReportFromWorkspace,
  deriveSdlcConformProjectReportFromWorkspaces,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  type SdlcConformProjectProfile,
  type SdlcConformProjectReport,
  type SdlcProjectConstraints,
  type SdlcSourceInput,
  type SdlcWorkspaceIngressReport
} from "../workspace/index.js";
import { assertCurrentSdlcGtlProgramConformance } from "../gtl_conformance/index.js";
import { isRecord } from "../admission/codecs.js";
import {
  admitSdlcTicketExecutionContract,
  createSdlcTerminalGapTicketsFromOperatorRun
} from "../tickets/index.js";

export const ODD_SDLC_SPEC_METHOD_COMMAND_VALUES = Object.freeze([
  "catalog",
  "query-domain",
  "tickets",
  "reviewers",
  "ticket-intake",
  "ticket-admit",
  "gaps",
  "start",
  "install",
  "release-cut",
  "release-snapshot",
  "rc-report",
  "analyze-run"
] as const);

export type OddSdlcSpecMethodCommand = (typeof ODD_SDLC_SPEC_METHOD_COMMAND_VALUES)[number];

const ODD_SDLC_SPEC_METHOD_COMMAND_SET: ReadonlySet<string> = new Set(
  ODD_SDLC_SPEC_METHOD_COMMAND_VALUES
);
const EMPTY_RUNTIME_EVENTS: readonly RuntimeEvent[] = Object.freeze([]);
const SDLC_FD_RUN_ANALYSIS_FORMAT_VALUE_SET: ReadonlySet<string> = new Set(
  SDLC_FD_RUN_ANALYSIS_FORMAT_VALUES
);

function isSdlcFdRunAnalysisProfile(
  value: string
): value is SdlcFdRunAnalysisProfile {
  return value.trim().length > 0 && !value.startsWith("-");
}

function isSdlcFdRunAnalysisFormat(
  value: string
): value is SdlcFdRunAnalysisFormat {
  return SDLC_FD_RUN_ANALYSIS_FORMAT_VALUE_SET.has(value);
}

export interface OddSdlcSpecMethodTraversalRequest {
  readonly kind: "odd_sdlc_spec_method_request";
  readonly command: Exclude<
    OddSdlcSpecMethodCommand,
    "install" | "release-cut" | "release-snapshot" | "analyze-run" | "ticket-intake"
  >;
  readonly workspaceRoot: string;
  readonly outputWorkspaceRoot: string | null;
  readonly target: {
    readonly kind: SdlcPublicStartTargetKind;
    readonly handle: string;
  };
  readonly until: SdlcPublicStartUntil;
  readonly workerTransport: string | null;
  readonly evaluatorPriorityEdge: string | null;
  readonly runtimeTraversalSelections?: readonly StartRuntimeTraversalStrategySelection[];
}

export interface OddSdlcSpecMethodInstallRequest {
  readonly kind: "odd_sdlc_spec_method_install_request";
  readonly command: "install";
  readonly targetRoot: string;
  readonly packageSourceRoot: string;
  readonly abgPackageSourceRoot: string;
  readonly abgStandardsSourceRoot: string | null;
  readonly abgDocsSourceRoot: string | null;
  readonly installedPackageName: string;
}

export interface OddSdlcSpecMethodReleaseCutRequest {
  readonly kind: "odd_sdlc_spec_method_release_cut_request";
  readonly command: "release-cut";
  readonly archiveRoot: string;
  readonly packageSourceRoot: string;
}

export interface OddSdlcSpecMethodReleaseSnapshotRequest {
  readonly kind: "odd_sdlc_spec_method_release_snapshot_request";
  readonly command: "release-snapshot";
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly packageSourceRoot: string;
  readonly sourceRef: string | null;
  readonly sourceCommit: string | null;
  readonly rcBranch: string | null;
  readonly releaseNotePath: string | null;
  readonly expectedPackageName: string | null;
  readonly expectedPackageVersion: string | null;
  readonly runBuild: boolean;
  readonly allowDirtySource: boolean;
  readonly npmCacheRoot: string | null;
}

export interface OddSdlcSpecMethodAnalyzeRunRequest {
  readonly kind: "odd_sdlc_spec_method_analyze_run_request";
  readonly command: "analyze-run";
  readonly inspectedRoot: string;
  readonly profile: SdlcFdRunAnalysisProfile;
  readonly format: SdlcFdRunAnalysisFormat;
  readonly outputPath: string | null;
  readonly strict: boolean;
}

export interface OddSdlcSpecMethodTicketIntakeRequest {
  readonly kind: "odd_sdlc_spec_method_ticket_intake_request";
  readonly command: "ticket-intake";
  readonly workspaceRoot: string;
  readonly fromRun: string;
  readonly intakeKind: "code_review_triage";
}

export type OddSdlcSpecMethodRequest =
  | OddSdlcSpecMethodTraversalRequest
  | OddSdlcSpecMethodInstallRequest
  | OddSdlcSpecMethodReleaseCutRequest
  | OddSdlcSpecMethodReleaseSnapshotRequest
  | OddSdlcSpecMethodAnalyzeRunRequest
  | OddSdlcSpecMethodTicketIntakeRequest;

export interface OddSdlcSpecMethodResult {
  readonly kind: "odd_sdlc_spec_method_result";
  readonly command: OddSdlcSpecMethodCommand | "unknown";
  readonly status: "ok" | "error";
  readonly exitCode: 0 | 2;
  readonly payload: unknown;
}

interface OddSdlcSpecMethodBlockingPayload {
  readonly kind: "sdlc_spec_method_blocking_result";
  readonly status: "blocked";
  readonly blockingReason: SdlcBlockingReason["code"];
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly evidenceRefs: readonly string[];
  readonly detail: string;
}

interface SpecMethodOptionReadModel {
  readonly workspaceRoot: string;
  readonly outputWorkspaceRoot: string | null;
  readonly target: string;
  readonly until: SdlcPublicStartUntil;
  readonly workerTransport: string | null;
  readonly evaluatorPriorityEdge: string | null;
  readonly runtimeTraversalSelections?: readonly StartRuntimeTraversalStrategySelection[];
}

interface SpecMethodInstallOptionReadModel {
  readonly targetRoot: string;
  readonly packageSourceRoot: string;
  readonly abgPackageSourceRoot: string;
  readonly abgStandardsSourceRoot: string | null;
  readonly abgDocsSourceRoot: string | null;
  readonly installedPackageName: string;
}

interface SpecMethodReleaseCutOptionReadModel {
  readonly archiveRoot: string;
  readonly packageSourceRoot: string;
}

interface SpecMethodReleaseSnapshotOptionReadModel {
  readonly releaseIdentity: string;
  readonly snapshotRoot: string;
  readonly packageSourceRoot: string;
  readonly sourceRef: string | null;
  readonly sourceCommit: string | null;
  readonly rcBranch: string | null;
  readonly releaseNotePath: string | null;
  readonly expectedPackageName: string | null;
  readonly expectedPackageVersion: string | null;
  readonly runBuild: boolean;
  readonly allowDirtySource: boolean;
  readonly npmCacheRoot: string | null;
}

interface SpecMethodAnalyzeRunOptionReadModel {
  readonly inspectedRoot: string;
  readonly profile: SdlcFdRunAnalysisProfile;
  readonly format: SdlcFdRunAnalysisFormat;
  readonly outputPath: string | null;
  readonly strict: boolean;
}

interface SpecMethodTicketIntakeOptionReadModel {
  readonly workspaceRoot: string;
  readonly fromRun: string;
  readonly intakeKind: "code_review_triage";
}

interface SpecMethodWorkspaceContext {
  readonly workspaceRoot: string;
  readonly outputWorkspaceRoot: string;
  readonly ingressReport: SdlcWorkspaceIngressReport;
  readonly conformedProject: SdlcConformProjectProfile;
  readonly conformanceReport: SdlcConformProjectReport;
}

interface SdlcHomeostaticGapTriageSurface {
  readonly kind: "sdlc_homeostatic_gap_triage_surface";
  readonly observation: SdlcGapObservation;
  readonly classification: SdlcTriageClassification;
  readonly routeBinding: SdlcRouteBinding;
  readonly emittedRuntimeEventKinds: readonly [];
}

const DEFAULT_SOURCE_PATHS = Object.freeze([
  "README.md",
  "specification/GOALS.md",
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/REQUIREMENTS.md",
  ".ai-workspace/context/project_constraints.yml"
] as const);

const SOURCE_DISCOVERY_EXTENSIONS = Object.freeze([
  ".md",
  ".markdown",
  ".txt",
  ".yml",
  ".yaml"
] as const);
const SOURCE_DISCOVERY_EXTENSION_SET: ReadonlySet<string> = new Set(
  SOURCE_DISCOVERY_EXTENSIONS
);
const SOURCE_DISCOVERY_IGNORED_DIRS = Object.freeze([
  ".abiogenesis",
  ".genesis",
  ".git",
  "node_modules",
  "build_tenants"
] as const);

const SPEC_METHOD_MODULE_ROOT = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PACKAGE_SOURCE_ROOT = resolve(SPEC_METHOD_MODULE_ROOT, "../../../../..");

function abgSourceCheckoutIsUsable(candidateRoot: string): boolean {
  return (
    existsSync(resolve(candidateRoot, "package.json")) &&
    existsSync(resolve(candidateRoot, "../../..", "docs/LLM_GTL_APP_BUILDER_GUIDE.md"))
  );
}

function abgPackageDependencyIsPresent(candidateRoot: string): boolean {
  return existsSync(resolve(candidateRoot, "package.json"));
}

function abgDocsSourceIsUsable(candidateRoot: string): boolean {
  return (
    existsSync(resolve(candidateRoot, "README.md")) &&
    existsSync(resolve(candidateRoot, "LLM_GTL_APP_BUILDER_GUIDE.md")) &&
    existsSync(resolve(candidateRoot, "USER_GUIDE.md"))
  );
}

function standardsSourceIsUsable(candidateRoot: string): boolean {
  return (
    existsSync(resolve(candidateRoot, "SPEC_METHOD.md")) &&
    existsSync(resolve(candidateRoot, "ODD_METHOD.md")) &&
    existsSync(resolve(candidateRoot, "RELEASE_METHOD.md"))
  );
}

export function resolveDefaultAbgPackageSourceRoot(
  packageSourceRoot: string = DEFAULT_PACKAGE_SOURCE_ROOT
): string {
  const packageLocalDependency = resolve(
    packageSourceRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  if (abgPackageDependencyIsPresent(packageLocalDependency)) {
    return packageLocalDependency;
  }

  const siblingSourceCheckout = resolve(
    packageSourceRoot,
    "../../..",
    "abiogenesis/build_tenants/abiogenesis/typescript"
  );
  if (abgSourceCheckoutIsUsable(siblingSourceCheckout)) {
    return siblingSourceCheckout;
  }

  return resolve(
    packageSourceRoot,
    "../..",
    "@abiogenesis/typescript-tenant"
  );
}

const DEFAULT_ABG_PACKAGE_SOURCE_ROOT = resolveDefaultAbgPackageSourceRoot();

export function resolveDefaultAbgStandardsSourceRoot(
  packageSourceRoot: string = DEFAULT_PACKAGE_SOURCE_ROOT
): string | null {
  const siblingStandards = resolve(
    packageSourceRoot,
    "../../..",
    "specification_methodology/specification/standards"
  );
  if (standardsSourceIsUsable(siblingStandards)) {
    return siblingStandards;
  }
  const installedStandards = resolve(
    packageSourceRoot,
    ".abiogenesis/docs/standards"
  );
  if (standardsSourceIsUsable(installedStandards)) {
    return installedStandards;
  }
  return null;
}

export function resolveDefaultAbgDocsSourceRoot(
  packageSourceRoot: string = DEFAULT_PACKAGE_SOURCE_ROOT
): string | null {
  const siblingDocs = resolve(packageSourceRoot, "../../..", "abiogenesis/docs");
  if (abgDocsSourceIsUsable(siblingDocs)) {
    return siblingDocs;
  }
  const installedDocs = resolve(packageSourceRoot, ".abiogenesis/docs");
  if (abgDocsSourceIsUsable(installedDocs)) {
    return installedDocs;
  }
  return null;
}

const DEFAULT_ABG_STANDARDS_SOURCE_ROOT = resolveDefaultAbgStandardsSourceRoot();
const DEFAULT_ABG_DOCS_SOURCE_ROOT = resolveDefaultAbgDocsSourceRoot();

function isCommand(value: string): value is OddSdlcSpecMethodCommand {
  return ODD_SDLC_SPEC_METHOD_COMMAND_SET.has(value);
}

function fail(command: OddSdlcSpecMethodCommand | "unknown", message: string): OddSdlcSpecMethodResult {
  return Object.freeze({
    kind: "odd_sdlc_spec_method_result",
    command,
    status: "error",
    exitCode: 2,
    payload: Object.freeze({
      error: message
    })
  });
}

function ok(command: OddSdlcSpecMethodCommand, payload: unknown): OddSdlcSpecMethodResult {
  return Object.freeze({
    kind: "odd_sdlc_spec_method_result",
    command,
    status: "ok",
    exitCode: 0,
    payload
  });
}

function requireOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new TypeError(`${option} requires a value`);
  }
  return value;
}

function parseUntil(value: string): SdlcPublicStartUntil {
  if (value === "first_traversal" || value === "blocked" || value === "converged") {
    return value;
  }
  throw new TypeError(`--until expected first_traversal, blocked, or converged`);
}

function parseBooleanOption(value: string, option: string): boolean {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new TypeError(`${option} expected true or false`);
}

function parseNonEmptyOptionValue(
  argv: readonly string[],
  index: number,
  option: string
): string {
  const value = requireOptionValue(argv, index, option).trim();
  if (value.length === 0) {
    throw new TypeError(`${option} requires a non-empty value`);
  }
  return value;
}

function parseJsonOptionValue(
  argv: readonly string[],
  index: number,
  option: string
): unknown {
  const value = requireOptionValue(argv, index, option);
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch (error: unknown) {
    throw new TypeError(
      `${option} requires valid JSON: ${error instanceof Error ? error.message : "parse failed"}`
    );
  }
}

function parseOptions(
  command: OddSdlcSpecMethodCommand,
  argv: readonly string[]
): SpecMethodOptionReadModel {
  let workspaceRoot = ".";
  let outputWorkspaceRoot: string | null = null;
  let target = "next";
  let until: SdlcPublicStartUntil = "blocked";
  let workerTransport: string | null = null;
  let evaluatorPriorityEdge: string | null = null;
  const runtimeTraversalSelectionInputs: unknown[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--workspace") {
      workspaceRoot = requireOptionValue(argv, index, "--workspace");
      index += 1;
    } else if (token === "--output-workspace") {
      outputWorkspaceRoot = requireOptionValue(argv, index, "--output-workspace");
      index += 1;
    } else if (token === "--target") {
      target = requireOptionValue(argv, index, "--target");
      index += 1;
    } else if (token === "--graph-overlay") {
      target = `overlay:${requireOptionValue(argv, index, "--graph-overlay")}`;
      index += 1;
    } else if (token === "--until") {
      until = parseUntil(requireOptionValue(argv, index, "--until"));
      index += 1;
    } else if (token === "--worker") {
      workerTransport = requireOptionValue(argv, index, "--worker");
      index += 1;
    } else if (token === "--evaluator-priority-edge") {
      if (command !== "gaps") {
        throw new TypeError("--evaluator-priority-edge is only valid for gaps");
      }
      if (evaluatorPriorityEdge !== null) {
        throw new TypeError("--evaluator-priority-edge may be declared once");
      }
      evaluatorPriorityEdge = parseNonEmptyOptionValue(
        argv,
        index,
        "--evaluator-priority-edge"
      );
      index += 1;
    } else if (token === "--runtime-traversal-selection") {
      runtimeTraversalSelectionInputs.push(
        parseJsonOptionValue(argv, index, token)
      );
      index += 1;
    } else if (token === "--runtime-traversal-selections") {
      const value = parseJsonOptionValue(argv, index, token);
      if (!isUnknownArray(value)) {
        throw new TypeError("--runtime-traversal-selections requires a JSON array");
      }
      for (const item of value) {
        runtimeTraversalSelectionInputs.push(item);
      }
      index += 1;
    } else {
      throw new TypeError(`unknown option: ${token ?? ""}`);
    }
  }
  const runtimeTraversalSelections = admitSdlcRuntimeTraversalSelections(
    runtimeTraversalSelectionInputs.length === 0
      ? undefined
      : runtimeTraversalSelectionInputs,
    "SpecMethod.runtimeTraversalSelections"
  );
  return Object.freeze({
    workspaceRoot,
    outputWorkspaceRoot,
    target,
    until,
    workerTransport,
    evaluatorPriorityEdge,
    ...(runtimeTraversalSelections === undefined
      ? {}
      : { runtimeTraversalSelections })
  });
}

function parseInstallOptions(argv: readonly string[]): SpecMethodInstallOptionReadModel {
  let targetRoot: string | null = null;
  let packageSourceRoot = DEFAULT_PACKAGE_SOURCE_ROOT;
  let abgPackageSourceRoot = DEFAULT_ABG_PACKAGE_SOURCE_ROOT;
  let abgStandardsSourceRoot = DEFAULT_ABG_STANDARDS_SOURCE_ROOT;
  let abgDocsSourceRoot = DEFAULT_ABG_DOCS_SOURCE_ROOT;
  let installedPackageName = "odd-sdlc-typescript";
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--target") {
      targetRoot = requireOptionValue(argv, index, "--target");
      index += 1;
    } else if (token === "--package-source") {
      packageSourceRoot = requireOptionValue(argv, index, "--package-source");
      index += 1;
    } else if (token === "--abg-package-source") {
      abgPackageSourceRoot = requireOptionValue(argv, index, "--abg-package-source");
      index += 1;
    } else if (token === "--abg-standards-source") {
      abgStandardsSourceRoot = requireOptionValue(argv, index, "--abg-standards-source");
      index += 1;
    } else if (token === "--abg-docs-source") {
      abgDocsSourceRoot = requireOptionValue(argv, index, "--abg-docs-source");
      index += 1;
    } else if (token === "--installed-package-name") {
      installedPackageName = requireOptionValue(argv, index, "--installed-package-name");
      index += 1;
    } else {
      throw new TypeError(`unknown install option: ${token ?? ""}`);
    }
  }
  if (targetRoot === null) {
    throw new TypeError("install requires --target <workspace>");
  }
  return Object.freeze({
    targetRoot,
    packageSourceRoot,
    abgPackageSourceRoot,
    abgStandardsSourceRoot,
    abgDocsSourceRoot,
    installedPackageName
  });
}

function parseReleaseCutOptions(argv: readonly string[]): SpecMethodReleaseCutOptionReadModel {
  let archiveRoot: string | null = null;
  let packageSourceRoot = DEFAULT_PACKAGE_SOURCE_ROOT;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--archive-root") {
      archiveRoot = requireOptionValue(argv, index, "--archive-root");
      index += 1;
    } else if (token === "--package-source") {
      packageSourceRoot = requireOptionValue(argv, index, "--package-source");
      index += 1;
    } else {
      throw new TypeError(`unknown release-cut option: ${token ?? ""}`);
    }
  }
  if (archiveRoot === null) {
    throw new TypeError("release-cut requires --archive-root <directory>");
  }
  return Object.freeze({
    archiveRoot,
    packageSourceRoot
  });
}

function parseReleaseSnapshotOptions(
  argv: readonly string[]
): SpecMethodReleaseSnapshotOptionReadModel {
  let releaseIdentity: string | null = null;
  let snapshotRoot: string | null = null;
  let packageSourceRoot = DEFAULT_PACKAGE_SOURCE_ROOT;
  let sourceRef: string | null = null;
  let sourceCommit: string | null = null;
  let rcBranch: string | null = null;
  let releaseNotePath: string | null = null;
  let expectedPackageName: string | null = null;
  let expectedPackageVersion: string | null = null;
  let runBuild = true;
  let allowDirtySource = false;
  let npmCacheRoot: string | null = null;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--release-identity") {
      releaseIdentity = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--snapshot-root") {
      snapshotRoot = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--package-source") {
      packageSourceRoot = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--source-ref") {
      sourceRef = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--source-commit") {
      sourceCommit = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--rc-branch") {
      rcBranch = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--release-note") {
      releaseNotePath = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--expected-package-name") {
      expectedPackageName = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--expected-package-version") {
      expectedPackageVersion = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--build") {
      runBuild = parseBooleanOption(requireOptionValue(argv, index, token), token);
      index += 1;
    } else if (token === "--allow-dirty-source") {
      allowDirtySource = true;
    } else if (token === "--npm-cache-root") {
      npmCacheRoot = requireOptionValue(argv, index, token);
      index += 1;
    } else {
      throw new TypeError(`unknown release-snapshot option: ${token ?? ""}`);
    }
  }
  if (releaseIdentity === null) {
    throw new TypeError("release-snapshot requires --release-identity <version>");
  }
  if (snapshotRoot === null) {
    throw new TypeError("release-snapshot requires --snapshot-root <directory>");
  }
  return Object.freeze({
    releaseIdentity,
    snapshotRoot,
    packageSourceRoot,
    sourceRef,
    sourceCommit,
    rcBranch,
    releaseNotePath,
    expectedPackageName,
    expectedPackageVersion,
    runBuild,
    allowDirtySource,
    npmCacheRoot
  });
}

function parseAnalyzeRunOptions(argv: readonly string[]): SpecMethodAnalyzeRunOptionReadModel {
  let inspectedRoot: string | null = null;
  let profile: SdlcFdRunAnalysisProfile = "generic";
  let format: SdlcFdRunAnalysisFormat = "markdown";
  let outputPath: string | null = null;
  let strict = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--workspace" || token === "--run-archive" || token === "--operator-run") {
      if (inspectedRoot !== null) {
        throw new TypeError(
          "analyze-run accepts exactly one of --workspace, --run-archive, or --operator-run"
        );
      }
      inspectedRoot = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--profile") {
      const value = requireOptionValue(argv, index, "--profile");
      if (!isSdlcFdRunAnalysisProfile(value)) {
        throw new TypeError("--profile expected a non-empty profile id");
      }
      profile = value;
      index += 1;
    } else if (token === "--format") {
      const value = requireOptionValue(argv, index, "--format");
      if (!isSdlcFdRunAnalysisFormat(value)) {
        throw new TypeError(
          `--format expected one of ${SDLC_FD_RUN_ANALYSIS_FORMAT_VALUES.join(", ")}`
        );
      }
      format = value;
      index += 1;
    } else if (token === "--raw") {
      format = "json";
    } else if (token === "--output") {
      outputPath = requireOptionValue(argv, index, "--output");
      index += 1;
    } else if (token === "--strict") {
      strict = true;
    } else {
      throw new TypeError(`unknown analyze-run option: ${token ?? ""}`);
    }
  }
  if (inspectedRoot === null) {
    throw new TypeError(
      "analyze-run requires exactly one of --workspace, --run-archive, or --operator-run"
    );
  }
  return Object.freeze({
    inspectedRoot,
    profile,
    format,
    outputPath,
    strict
  });
}

function parseTicketIntakeOptions(
  argv: readonly string[]
): SpecMethodTicketIntakeOptionReadModel {
  let workspaceRoot = ".";
  let fromRun: string | null = null;
  let intakeKind: "code_review_triage" | null = null;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--workspace") {
      workspaceRoot = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--from-run" || token === "--operator-run") {
      fromRun = requireOptionValue(argv, index, token);
      index += 1;
    } else if (token === "--kind") {
      const value = requireOptionValue(argv, index, token);
      if (value !== "code_review_triage") {
        throw new TypeError("--kind expected code_review_triage");
      }
      intakeKind = value;
      index += 1;
    } else {
      throw new TypeError(`unknown ticket-intake option: ${token ?? ""}`);
    }
  }
  if (fromRun === null) {
    throw new TypeError("ticket-intake requires --from-run <operator-run-archive>");
  }
  if (intakeKind === null) {
    throw new TypeError("ticket-intake requires --kind code_review_triage");
  }
  return Object.freeze({
    workspaceRoot,
    fromRun,
    intakeKind
  });
}

function parseTarget(rawTarget: string): OddSdlcSpecMethodTraversalRequest["target"] {
  if (rawTarget === "next") {
    return Object.freeze({ kind: "next", handle: "next" });
  }
  if (rawTarget.startsWith("graph_function:")) {
    return Object.freeze({
      kind: "graph_function",
      handle: rawTarget.slice("graph_function:".length)
    });
  }
  if (rawTarget.startsWith("asset:")) {
    return Object.freeze({
      kind: "asset",
      handle: rawTarget.slice("asset:".length)
    });
  }
  if (rawTarget.startsWith("overlay://")) {
    return Object.freeze({
      kind: "overlay",
      handle: rawTarget
    });
  }
  if (rawTarget.startsWith("overlay:")) {
    return Object.freeze({
      kind: "overlay",
      handle: rawTarget.slice("overlay:".length)
    });
  }
  throw new TypeError("--target expected next, graph_function:<handle>, asset:<handle>, or overlay:<handle>");
}

export function admitOddSdlcSpecMethodRequest(argv: readonly string[]): OddSdlcSpecMethodRequest {
  const command = argv[0];
  if (command === undefined || !isCommand(command)) {
    throw new TypeError(
      `command expected one of ${ODD_SDLC_SPEC_METHOD_COMMAND_VALUES.join(", ")}`
    );
  }
  if (command === "install") {
    const options = parseInstallOptions(argv.slice(1));
    return Object.freeze({
      kind: "odd_sdlc_spec_method_install_request",
      command,
      targetRoot: resolve(options.targetRoot),
      packageSourceRoot: resolve(options.packageSourceRoot),
      abgPackageSourceRoot: resolve(options.abgPackageSourceRoot),
      abgStandardsSourceRoot:
        options.abgStandardsSourceRoot === null
          ? null
          : resolve(options.abgStandardsSourceRoot),
      abgDocsSourceRoot:
        options.abgDocsSourceRoot === null
          ? null
          : resolve(options.abgDocsSourceRoot),
      installedPackageName: options.installedPackageName
    });
  }
  if (command === "release-cut") {
    const options = parseReleaseCutOptions(argv.slice(1));
    return Object.freeze({
      kind: "odd_sdlc_spec_method_release_cut_request",
      command,
      archiveRoot: resolve(options.archiveRoot),
      packageSourceRoot: resolve(options.packageSourceRoot)
    });
  }
  if (command === "release-snapshot") {
    const options = parseReleaseSnapshotOptions(argv.slice(1));
    return Object.freeze({
      kind: "odd_sdlc_spec_method_release_snapshot_request",
      command,
      releaseIdentity: options.releaseIdentity,
      snapshotRoot: resolve(options.snapshotRoot),
      packageSourceRoot: resolve(options.packageSourceRoot),
      sourceRef: options.sourceRef,
      sourceCommit: options.sourceCommit,
      rcBranch: options.rcBranch,
      releaseNotePath:
        options.releaseNotePath === null ? null : resolve(options.releaseNotePath),
      expectedPackageName: options.expectedPackageName,
      expectedPackageVersion: options.expectedPackageVersion,
      runBuild: options.runBuild,
      allowDirtySource: options.allowDirtySource,
      npmCacheRoot:
        options.npmCacheRoot === null ? null : resolve(options.npmCacheRoot)
    });
  }
  if (command === "analyze-run") {
    const options = parseAnalyzeRunOptions(argv.slice(1));
    return Object.freeze({
      kind: "odd_sdlc_spec_method_analyze_run_request",
      command,
      inspectedRoot: resolve(options.inspectedRoot),
      profile: options.profile,
      format: options.format,
      outputPath: options.outputPath === null ? null : resolve(options.outputPath),
      strict: options.strict
    });
  }
  if (command === "ticket-intake") {
    const options = parseTicketIntakeOptions(argv.slice(1));
    return Object.freeze({
      kind: "odd_sdlc_spec_method_ticket_intake_request",
      command,
      workspaceRoot: resolve(options.workspaceRoot),
      fromRun: resolve(options.fromRun),
      intakeKind: options.intakeKind
    });
  }
  const traversalCommand: Exclude<
    OddSdlcSpecMethodCommand,
    "install" | "release-cut" | "release-snapshot" | "analyze-run" | "ticket-intake"
  > = command;
  const options = parseOptions(traversalCommand, argv.slice(1));
  return Object.freeze({
    kind: "odd_sdlc_spec_method_request",
    command: traversalCommand,
    workspaceRoot: resolve(options.workspaceRoot),
    outputWorkspaceRoot:
      options.outputWorkspaceRoot === null ? null : resolve(options.outputWorkspaceRoot),
    target: parseTarget(options.target),
    until: options.until,
    workerTransport: options.workerTransport,
    evaluatorPriorityEdge: options.evaluatorPriorityEdge,
    ...(options.runtimeTraversalSelections === undefined
      ? {}
      : { runtimeTraversalSelections: options.runtimeTraversalSelections })
  });
}

function sourceFilePaths(workspaceRoot: string): readonly string[] {
  const paths = new Set<string>();
  for (const relativePath of DEFAULT_SOURCE_PATHS) {
    if (existsSync(path.join(workspaceRoot, relativePath))) {
      paths.add(relativePath);
    }
  }
  const requirementsRoot = path.join(workspaceRoot, "specification/requirements");
  if (existsSync(requirementsRoot)) {
    for (const fileName of readdirSync(requirementsRoot)) {
      const relativePath = `specification/requirements/${fileName}`;
      const absolutePath = path.join(workspaceRoot, relativePath);
      if (statSync(absolutePath).isFile() && fileName.endsWith(".md")) {
        paths.add(relativePath);
      }
    }
  }
  const ignored = new Set<string>(SOURCE_DISCOVERY_IGNORED_DIRS);
  const visit = (absoluteDir: string, relativeDir: string): void => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const relativePath =
        relativeDir.length === 0 ? entry.name : `${relativeDir}/${entry.name}`;
      const absolutePath = path.join(absoluteDir, entry.name);
      if (entry.isDirectory()) {
        if (
          !ignored.has(entry.name) &&
          !relativePath.startsWith(".ai-workspace/runtime") &&
          !relativePath.startsWith(".ai-workspace/events")
        ) {
          visit(absolutePath, relativePath);
        }
      } else if (
        entry.isFile() &&
        SOURCE_DISCOVERY_EXTENSION_SET.has(path.extname(entry.name).toLowerCase())
      ) {
        paths.add(relativePath);
      }
    }
  };
  visit(workspaceRoot, "");
  return Object.freeze([...paths].sort());
}

function readSourceInputs(workspaceRoot: string): readonly SdlcSourceInput[] {
  return Object.freeze(
    sourceFilePaths(workspaceRoot).map((relativePath) => {
      const absolutePath = path.join(workspaceRoot, relativePath);
      return deriveSdlcSourceInput({
        uri: `${pathToFileURL(workspaceRoot).href}/${relativePath}`,
        relativePath,
        content: readFileSync(absolutePath, "utf8")
      });
    })
  );
}

function projectConstraints(workspaceRoot: string): SdlcProjectConstraints {
  return deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot);
}

function outputWorkspaceRootFor(request: OddSdlcSpecMethodTraversalRequest): string {
  return request.outputWorkspaceRoot ?? request.workspaceRoot;
}

function workspaceContext(input: {
  readonly workspaceRoot: string;
  readonly outputWorkspaceRoot?: string | null;
}): SpecMethodWorkspaceContext {
  const root = resolve(input.workspaceRoot);
  const outputRoot = resolve(input.outputWorkspaceRoot ?? root);
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(root).href,
    projectConstraints: projectConstraints(root),
    sourceInputs: readSourceInputs(root)
  });
  return Object.freeze({
    workspaceRoot: root,
    outputWorkspaceRoot: outputRoot,
    ingressReport,
    conformedProject: deriveSdlcConformProjectProfileFromWorkspace(root),
    conformanceReport:
      outputRoot === root
        ? deriveSdlcConformProjectReportFromWorkspace(root)
        : deriveSdlcConformProjectReportFromWorkspaces({
            sourceWorkspaceRoot: root,
            outputWorkspaceRoot: outputRoot
          })
  });
}

function queryDomainFor(context: SpecMethodWorkspaceContext): ReturnType<typeof projectSdlcQueryDomain> {
  return projectSdlcQueryDomain({
    module: constructSdlcGtlModule(),
    ingressReport: context.ingressReport,
    projectConformance: context.conformanceReport
  });
}

function jsonRecordFromFile(filePath: string): Readonly<Record<string, unknown>> | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function operatorRunArchiveRootsNewestFirst(
  context: SpecMethodWorkspaceContext
): readonly string[] {
  const operatorRunRoot = path.join(
    context.outputWorkspaceRoot,
    context.conformedProject.runtimeLayout.operatorRunRoot
  );
  if (!existsSync(operatorRunRoot) || !statSync(operatorRunRoot).isDirectory()) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(operatorRunRoot)
      .map((entry) => path.join(operatorRunRoot, entry))
      .filter((entryPath) => statSync(entryPath).isDirectory())
      .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs)
  );
}

function edgeFulfillmentCountsFromRecord(
  record: Readonly<Record<string, unknown>>
): SdlcRequirementFulfillmentEdgeLedgerSource["counts"] | null {
  const counts = childRecord(record, "counts");
  if (counts === null) {
    return null;
  }
  const expected = numberField(counts, "expected");
  const fulfilled = numberField(counts, "fulfilled");
  const partial = numberField(counts, "partial");
  const blocked = numberField(counts, "blocked");
  const unfulfilled = numberField(counts, "unfulfilled");
  const missing = numberField(counts, "missing");
  const extra = numberField(counts, "extra");
  if (
    expected === null ||
    fulfilled === null ||
    partial === null ||
    blocked === null ||
    unfulfilled === null ||
    missing === null ||
    extra === null
  ) {
    return null;
  }
  return Object.freeze({
    expected,
    fulfilled,
    partial,
    blocked,
    unfulfilled,
    missing,
    extra
  });
}

function edgeFulfillmentLedgerFromArchive(
  archiveRoot: string
): SdlcRequirementFulfillmentEdgeLedgerSource | null {
  const record = jsonRecordFromFile(
    path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json")
  );
  if (record?.["kind"] !== "sdlc_edge_fulfillment_ledger") {
    return null;
  }
  const ledgerRef = stringField(record, "ledgerRef");
  const ledgerVersionRef = stringField(record, "ledgerVersionRef");
  const counts = edgeFulfillmentCountsFromRecord(record);
  if (ledgerRef === null || ledgerVersionRef === null || counts === null) {
    return null;
  }
  return Object.freeze({
    ledgerRef,
    ledgerVersionRef,
    counts
  });
}

function edgeClosureDispositionFromRecord(
  record: Readonly<Record<string, unknown>>
): SdlcRequirementFulfillmentClosureSource["disposition"] | null {
  const disposition = stringField(record, "disposition");
  return disposition === "close" ||
    disposition === "yield" ||
    disposition === "retry" ||
    disposition === "repair" ||
    disposition === "re-enter" ||
    disposition === "reprice" ||
    disposition === "block"
    ? disposition
    : null;
}

function edgeClosureDecisionFromArchive(
  archiveRoot: string
): SdlcRequirementFulfillmentClosureSource | null {
  const record = jsonRecordFromFile(
    path.join(archiveRoot, "sdlc_edge_closure_decision.json")
  );
  if (record?.["kind"] !== "sdlc_edge_closure_decision") {
    return null;
  }
  const decisionRef = stringField(record, "decisionRef");
  const disposition = edgeClosureDispositionFromRecord(record);
  if (decisionRef === null || disposition === null) {
    return null;
  }
  return Object.freeze({
    decisionRef,
    disposition
  });
}

function nextActionProjectionFromArchive(
  archiveRoot: string
): SdlcRequirementFulfillmentNextActionSource | null {
  const record = jsonRecordFromFile(
    path.join(archiveRoot, "sdlc_next_action_projection.json")
  );
  if (record?.["kind"] !== "sdlc_next_action_projection") {
    return null;
  }
  const nextActionProjectionRef = stringField(record, "nextActionProjectionRef");
  const selectedActionRef = stringField(record, "selectedActionRef");
  if (nextActionProjectionRef === null) {
    return null;
  }
  return Object.freeze({
    nextActionProjectionRef,
    selectedActionRef
  });
}

interface SelectedNextGraphFunctionFromArchive {
  readonly completedGraphFunctionName: string | null;
  readonly graphFunctionName: string;
  readonly nextActionProjectionRef: string;
  readonly selectedActionRef: string;
  readonly nextGraphVectorRef: string;
  readonly closureDecisionRef: string;
  readonly overlayRef: string | null;
  readonly overlayBindingRef: string | null;
}

interface SelectedNextGraphFunctionArchiveDiagnostic {
  readonly kind: "diagnostic";
  readonly code: SdlcBlockingReason["code"];
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}

type SelectedNextGraphFunctionFromArchiveResult =
  | SelectedNextGraphFunctionFromArchive
  | SelectedNextGraphFunctionArchiveDiagnostic
  | null;

function isSelectedNextGraphFunctionArchiveDiagnostic(
  input: SelectedNextGraphFunctionFromArchiveResult
): input is SelectedNextGraphFunctionArchiveDiagnostic {
  return input !== null && "kind" in input && input.kind === "diagnostic";
}

function specMethodBlockingPayload(
  diagnostic: SelectedNextGraphFunctionArchiveDiagnostic
): OddSdlcSpecMethodBlockingPayload {
  const blockingReason = makeSdlcBlockingReason({
    code: diagnostic.code,
    detail: diagnostic.detail,
    evidenceRefs: diagnostic.evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_spec_method_blocking_result" as const,
    status: "blocked" as const,
    blockingReason: diagnostic.code,
    blockingReasonCarriers: Object.freeze([blockingReason]),
    evidenceRefs: diagnostic.evidenceRefs,
    detail: diagnostic.detail
  });
}

function completedGraphFunctionNameFromArchive(archiveRoot: string): string | null {
  for (const fileName of ["handoff_manifest.json", "worker_invocation_package.json"]) {
    const record = jsonRecordFromFile(path.join(archiveRoot, fileName));
    const graphFunctionName =
      record === null
        ? null
        : stringField(record, "graphFunctionName") ?? stringField(record, "edgeName");
    if (graphFunctionName !== null) {
      return graphFunctionName;
    }
  }
  return null;
}

function selectedNextGraphFunctionFromOverlayCompletionArchive(input: {
  readonly archiveRoot: string;
  readonly projectionRecord: Readonly<Record<string, unknown>>;
  readonly decision: NonNullable<ReturnType<typeof edgeClosureDecisionFromArchive>>;
  readonly module: ReturnType<typeof constructSdlcGtlModule>;
}): SelectedNextGraphFunctionFromArchive | null {
  const completion = jsonRecordFromFile(
    path.join(input.archiveRoot, "sdlc_overlay_segment_completion.json")
  );
  if (
    completion?.["kind"] !== "sdlc_overlay_segment_completion" ||
    stringField(completion, "stopDisposition") !== "overlay_segment_complete" ||
    stringArrayField(completion, "remainingGraphPressureRefs").length === 0
  ) {
    return null;
  }
  const completedGraphFunctionRef =
    completedGraphFunctionNameFromArchive(input.archiveRoot);
  const overlayRef = stringField(input.projectionRecord, "overlayRef");
  const nextActionProjectionRef = stringField(
    input.projectionRecord,
    "nextActionProjectionRef"
  );
  if (
    completedGraphFunctionRef === null ||
    overlayRef === null ||
    nextActionProjectionRef === null
  ) {
    return null;
  }
  const action = deriveSdlcPostCloseOverlayContinuationActionInput({
    module: input.module,
    overlayRef,
    completedGraphFunctionRef,
    runRef: pathToFileURL(input.archiveRoot).href
  });
  if (
    action === null ||
    action.actionRef === undefined ||
    action.graphFunctionRef === undefined ||
    action.graphFunctionRef === null ||
    action.graphVectorRef === undefined ||
    action.graphVectorRef === null
  ) {
    return null;
  }
  return Object.freeze({
    completedGraphFunctionName: completedGraphFunctionRef,
    graphFunctionName: action.graphFunctionRef,
    nextActionProjectionRef,
    selectedActionRef: action.actionRef,
    nextGraphVectorRef: action.graphVectorRef,
    closureDecisionRef: input.decision.decisionRef,
    overlayRef,
    overlayBindingRef: stringField(input.projectionRecord, "overlayBindingRef")
  });
}

function isSpecMethodBlockingPayload(
  input: unknown
): input is OddSdlcSpecMethodBlockingPayload {
  return isRecord(input) && input["kind"] === "sdlc_spec_method_blocking_result";
}

function selectedNextGraphFunctionFromArchive(input: {
  readonly context: SpecMethodWorkspaceContext;
  readonly module: ReturnType<typeof constructSdlcGtlModule>;
}): SelectedNextGraphFunctionFromArchiveResult {
  const publishedGraphFunctionRefs = Object.freeze(
    input.module.graphFunctions.map((graphFunction) => graphFunction.name)
  );
  for (const archiveRoot of operatorRunArchiveRootsNewestFirst(input.context)) {
    const closurePath = path.join(archiveRoot, "sdlc_edge_closure_decision.json");
    const ledgerPath = path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json");
    const closureRecord = jsonRecordFromFile(closurePath);
    const ledgerRecord = jsonRecordFromFile(ledgerPath);
    const decision = edgeClosureDecisionFromArchive(archiveRoot);
    if (
      decision === null ||
      (decision.disposition !== "close" && decision.disposition !== "repair")
    ) {
      continue;
    }
    const projectionPath = path.join(archiveRoot, "sdlc_next_action_projection.json");
    const record = jsonRecordFromFile(projectionPath);
    if (
      record?.["kind"] !== "sdlc_next_action_projection"
    ) {
      return null;
    }
    if (
      record["choosesNextTraversal"] !== true ||
      stringField(record, "selectedActionRef") === null
    ) {
      const overlayContinuation =
        decision.disposition === "close"
          ? selectedNextGraphFunctionFromOverlayCompletionArchive({
              archiveRoot,
              projectionRecord: record,
              decision,
              module: input.module
            })
          : null;
      if (overlayContinuation !== null) {
        return overlayContinuation;
      }
      return null;
    }
    if (
      !stringArrayField(record, "predecessorRefs").includes(decision.decisionRef)
    ) {
      return null;
    }
    const nextGraphFunctionRef = stringField(record, "nextGraphFunctionRef");
    const nextGraphVectorRef = stringField(record, "nextGraphVectorRef");
    const nextActionProjectionRef = stringField(record, "nextActionProjectionRef");
    const selectedActionRef = stringField(record, "selectedActionRef");
    if (
      nextGraphFunctionRef === null ||
      nextActionProjectionRef === null ||
      selectedActionRef === null
    ) {
      return null;
    }
    const overlayBindingRef = stringField(record, "overlayBindingRef");
    const closureOverlayBindingRef =
      closureRecord === null
        ? null
        : stringField(closureRecord, "overlayBindingRef");
    const ledgerOverlayBindingRef =
      ledgerRecord === null
        ? null
        : stringField(ledgerRecord, "overlayBindingRef");
    const expectedOverlayBindingRef = closureOverlayBindingRef ?? ledgerOverlayBindingRef;
    if (
      overlayBindingRef !== null &&
      expectedOverlayBindingRef !== null &&
      overlayBindingRef !== expectedOverlayBindingRef
    ) {
      return Object.freeze({
        kind: "diagnostic" as const,
        code: "stale_query_domain" as const,
        detail:
          "archived next-action projection overlayBindingRef does not match its admitted closure/ledger binding",
        evidenceRefs: Object.freeze([
          pathToFileURL(projectionPath).href,
          pathToFileURL(closurePath).href,
          pathToFileURL(ledgerPath).href
        ])
      });
    }
    if (nextGraphVectorRef === null) {
      return Object.freeze({
        kind: "diagnostic" as const,
        code: "next_action_projection_graph_vector_missing" as const,
        detail: "choosesNextTraversal=true requires nextGraphVectorRef",
        evidenceRefs: Object.freeze([pathToFileURL(projectionPath).href])
      });
    }
    const completedGraphFunctionName =
      completedGraphFunctionNameFromArchive(archiveRoot);
    let graphFunctionName: string;
    try {
      graphFunctionName = admitSdlcGraphFunctionBoundaryRef({
        value: nextGraphFunctionRef,
        publishedGraphFunctionRefs,
        label: "sdlc_next_action_projection.nextGraphFunctionRef"
      });
    } catch (error) {
      if (error instanceof SdlcGraphBoundaryRefError) {
        return Object.freeze({
          kind: "diagnostic" as const,
          code: error.code,
          detail: error.message,
          evidenceRefs: Object.freeze([pathToFileURL(projectionPath).href])
        });
      }
      throw error;
    }
    const graphFunction = input.module.graphFunctions.find(
      (candidate) => candidate.name === graphFunctionName
    );
    if (graphFunction === undefined) {
      return null;
    }
    let graphVectorRef: string;
    try {
      graphVectorRef = admitSdlcGraphVectorBoundaryRef({
        value: nextGraphVectorRef,
        publishedGraphVectorRefs: materializeGraphFunction(graphFunction).vectors.map(
          (vector) => vector.name
        ),
        label: "sdlc_next_action_projection.nextGraphVectorRef"
      });
    } catch (error) {
      if (error instanceof SdlcGraphBoundaryRefError) {
        return Object.freeze({
          kind: "diagnostic" as const,
          code: error.code,
          detail: error.message,
          evidenceRefs: Object.freeze([pathToFileURL(projectionPath).href])
        });
      }
      throw error;
    }
    return Object.freeze({
      completedGraphFunctionName,
      graphFunctionName,
      nextActionProjectionRef,
      selectedActionRef,
      nextGraphVectorRef: graphVectorRef,
      closureDecisionRef: decision.decisionRef,
      overlayRef: stringField(record, "overlayRef"),
      overlayBindingRef
    });
  }
  return null;
}

function assessmentStatusFromRecord(
  record: Readonly<Record<string, unknown>>
): SdlcRequirementFulfillmentAssessmentPublicInput["fulfillmentStatus"] | null {
  const status = stringField(record, "fulfillmentStatus");
  return status === "fulfilled" ||
    status === "partial" ||
    status === "blocked" ||
    status === "unassessed"
    ? status
    : null;
}

function requirementAssessmentsFromArchive(
  archiveRoot: string
): readonly SdlcRequirementFulfillmentAssessmentPublicInput[] {
  const report = jsonRecordFromFile(path.join(archiveRoot, "worker_result_report.json"));
  const assessments = report?.["obligationAssessments"];
  if (!Array.isArray(assessments)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    assessments.flatMap((assessment): SdlcRequirementFulfillmentAssessmentPublicInput[] => {
      if (!isRecord(assessment)) {
        return [];
      }
      const obligationId = stringField(assessment, "obligationId");
      const fulfillmentStatus = assessmentStatusFromRecord(assessment);
      if (obligationId === null || fulfillmentStatus === null) {
        return [];
      }
      return [
        Object.freeze({
          obligationId,
          fulfillmentStatus,
          evidenceRefs: stringArrayField(assessment, "evidenceRefs"),
          blockingReasons: stringArrayField(assessment, "blockingReasons")
        })
      ];
    })
  );
}

function archiveRefForRoot(archiveRoot: string): string {
  return pathToFileURL(archiveRoot).href;
}

function missingTraversalConsequenceArtifactRefs(input: {
  readonly archiveRoot: string;
  readonly edgeFulfillmentLedger: SdlcRequirementFulfillmentEdgeLedgerSource | null;
  readonly edgeClosureDecision: SdlcRequirementFulfillmentClosureSource | null;
  readonly nextActionProjection: SdlcRequirementFulfillmentNextActionSource | null;
}): readonly string[] {
  const missing: string[] = [];
  if (input.edgeFulfillmentLedger === null) {
    missing.push("sdlc_edge_fulfillment_ledger.json");
  }
  if (input.edgeClosureDecision === null) {
    missing.push("sdlc_edge_closure_decision.json");
  }
  if (input.nextActionProjection === null) {
    missing.push("sdlc_next_action_projection.json");
  }
  return Object.freeze(
    missing.map((fileName) => pathToFileURL(path.join(input.archiveRoot, fileName)).href)
  );
}

function requirementFulfillmentForGaps(input: {
  readonly context: SpecMethodWorkspaceContext;
  readonly sourceProjection: SdlcRequirementFulfillmentPublicProjection;
}): SdlcRequirementFulfillmentPublicProjection {
  const archiveRoots = operatorRunArchiveRootsNewestFirst(input.context);
  if (archiveRoots.length === 0) {
    return withSdlcRequirementFulfillmentArchiveRehydration({
      projection: input.sourceProjection,
      archiveRehydration: constructSdlcRequirementFulfillmentArchiveRehydration({
        status: "no_operator_runs"
      })
    });
  }
  const scannedArchiveRefs = Object.freeze(archiveRoots.map(archiveRefForRoot));
  const missingArtifactRefs: string[] = [];
  for (const archiveRoot of archiveRoots) {
    const edgeFulfillmentLedger = edgeFulfillmentLedgerFromArchive(archiveRoot);
    const edgeClosureDecision = edgeClosureDecisionFromArchive(archiveRoot);
    const nextActionProjection = nextActionProjectionFromArchive(archiveRoot);
    if (
      edgeFulfillmentLedger === null ||
      edgeClosureDecision === null ||
      nextActionProjection === null
    ) {
      missingArtifactRefs.push(
        ...missingTraversalConsequenceArtifactRefs({
          archiveRoot,
          edgeFulfillmentLedger,
          edgeClosureDecision,
          nextActionProjection
        })
      );
      continue;
    }
    return projectSdlcRequirementFulfillmentPublicViewFromPriorProjection({
      sourceProjection: input.sourceProjection,
      assessments: requirementAssessmentsFromArchive(archiveRoot),
      edgeFulfillmentLedger,
      edgeClosureDecision,
      nextActionProjection,
      sourceRegisterRef: `requirement-fulfillment-public://odd-sdlc/${encodeURIComponent(archiveRoot)}`,
      archiveRehydration: constructSdlcRequirementFulfillmentArchiveRehydration({
        status: "rehydrated",
        archiveRef: archiveRefForRoot(archiveRoot),
        scannedArchiveRefs,
        missingArtifactRefs
      })
    });
  }
  return withSdlcRequirementFulfillmentArchiveRehydration({
    projection: input.sourceProjection,
    archiveRehydration: constructSdlcRequirementFulfillmentArchiveRehydration({
      status: "no_archive_with_consequence_triple",
      scannedArchiveRefs,
      missingArtifactRefs
    })
  });
}

function closureRegisterForHomeostaticTriage(
  projection: SdlcRequirementFulfillmentPublicProjection
): SdlcRequirementClosureRegister {
  const entries = Object.freeze(
    projection.rows
      .filter((row) => row.fulfillmentStatus !== "extra")
      .map((row) => {
        const fulfillmentStatus =
          row.fulfillmentStatus === "fulfilled" ||
          row.fulfillmentStatus === "partial" ||
          row.fulfillmentStatus === "planned" ||
          row.fulfillmentStatus === "missing"
            ? row.fulfillmentStatus
            : "missing";
        return Object.freeze({
          kind: "sdlc_requirement_closure_entry" as const,
          requirementId: row.requirementId,
          requirementDisplayId: row.requirementDisplayId,
          requirementAuthorityRef: row.requirementAuthorityRef,
          sourceInputUris: row.sourceInputUris,
          assetIds: Object.freeze([]),
          producedByGraphFunctions: Object.freeze([]),
          proofKinds: Object.freeze([]),
          authorityVerbs: Object.freeze([]),
          evidenceRefs: row.evidenceRefs,
          traceabilityStatus: "absent" as const,
          fulfillmentStatus,
          carryStatus: row.carryStatus,
          openReasons: row.openReasons
        });
      })
  );
  return Object.freeze({
    kind: "sdlc_requirement_closure_register" as const,
    entries,
    fulfilledRequirementIds: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus === "fulfilled")
        .map((entry) => entry.requirementId)
    ),
    carriedForwardRequirementIds: Object.freeze(
      entries
        .filter((entry) => entry.carryStatus === "carried_forward")
        .map((entry) => entry.requirementId)
    ),
    unresolvedRequirementIds: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
        .map((entry) => entry.requirementId)
    ),
    fulfilledRequirementAuthorityRefs: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus === "fulfilled")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    carriedForwardRequirementAuthorityRefs: Object.freeze(
      entries
        .filter((entry) => entry.carryStatus === "carried_forward")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    unresolvedRequirementAuthorityRefs: Object.freeze(
      entries
        .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
        .map((entry) => entry.requirementAuthorityRef)
    ),
    emittedRuntimeEventKinds: Object.freeze([] as const)
  });
}

function homeostaticGapTriageForGaps(input: {
  readonly dossier: ReturnType<typeof deriveSdlcGapDossier>;
  readonly requirementFulfillment: SdlcRequirementFulfillmentPublicProjection;
  readonly ingressReport: SdlcWorkspaceIngressReport;
}): SdlcHomeostaticGapTriageSurface {
  const observation = observeSdlcGapPressure({
    gapDossier: input.dossier,
    closureRegister: closureRegisterForHomeostaticTriage(
      input.requirementFulfillment
    ),
    requirementTransformAuthorities:
      input.ingressReport.requirementTransformAuthorities,
    analysisRef: [
      "analysis://odd-sdlc/spec-method/gaps",
      encodeURIComponent(input.dossier.triageInput),
      encodeURIComponent(input.requirementFulfillment.sourceRegisterRef)
    ].join("/")
  });
  const classification = classifySdlcGapObservation({ observation });
  const routeBinding = bindSdlcRoute({ observation, classification });
  return Object.freeze({
    kind: "sdlc_homeostatic_gap_triage_surface" as const,
    observation,
    classification,
    routeBinding,
    emittedRuntimeEventKinds: Object.freeze([] as const)
  });
}

function defaultRegimeFor(input: {
  readonly request: OddSdlcSpecMethodTraversalRequest;
  readonly queryDomain: ReturnType<typeof projectSdlcQueryDomain>;
}): "F_D" | "F_P" {
  const firstTarget = input.queryDomain.startTargets[0]?.name ?? null;
  if (firstTarget === FG_CONFORM_PROJECT) {
    if (
      input.request.target.kind === "next" ||
      (input.request.target.kind === "graph_function" &&
        input.request.target.handle === FG_CONFORM_PROJECT)
    ) {
      return "F_D";
    }
    if (input.request.target.kind === "overlay") {
      const module = constructSdlcGtlModule();
      const conformGraphFunction = module.graphFunctions.find(
        (graphFunction) => graphFunction.name === FG_CONFORM_PROJECT
      );
      const requestedOverlay = resolveSdlcTraversalOverlay({
        catalog: constructSdlcTraversalOverlayCatalog({ module }),
        overlayRef: input.request.target.handle
      });
      if (
        conformGraphFunction !== undefined &&
        requestedOverlay?.graphFunctionRefs.includes(
          sdlcGraphFunctionBoundaryRef(conformGraphFunction)
        ) === true
      ) {
        return "F_D";
      }
    }
  }
  return "F_P";
}

function startOutcomeFor(
  request: OddSdlcSpecMethodTraversalRequest,
  replayNextAction?: {
    readonly nextActionProjectionRef: string;
    readonly selectedActionRef: string;
    readonly nextGraphFunctionRef: string;
    readonly nextGraphVectorRef: string;
    readonly closureDecisionRef: string;
    readonly overlayRef: string | null;
    readonly overlayBindingRef: string | null;
  }
): ReturnType<typeof publicStartOnce> {
  const context = workspaceContext({
    workspaceRoot: request.workspaceRoot,
    outputWorkspaceRoot: request.outputWorkspaceRoot
  });
  const queryDomain = queryDomainFor(context);
  const target =
    replayNextAction !== undefined && request.target.kind === "graph_function"
      ? ({
          kind: "graph_function",
          handle: replayNextAction.nextGraphFunctionRef
        } as const)
      : request.target;
  return publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot: context.workspaceRoot,
      outputWorkspaceRoot:
        context.outputWorkspaceRoot === context.workspaceRoot
          ? null
          : context.outputWorkspaceRoot,
      target,
      until: request.until,
      defaultRegime: defaultRegimeFor({ request, queryDomain }),
      ...(request.runtimeTraversalSelections === undefined
        ? {}
        : { runtimeTraversalSelections: request.runtimeTraversalSelections }),
      ...(replayNextAction === undefined
        ? {}
        : {
            replayNextActionProjectionRef:
              replayNextAction.nextActionProjectionRef,
            replaySelectedActionRef: replayNextAction.selectedActionRef,
            replayNextGraphFunctionRef:
              replayNextAction.nextGraphFunctionRef,
            replayNextGraphVectorRef: replayNextAction.nextGraphVectorRef,
            replayClosureDecisionRef: replayNextAction.closureDecisionRef,
            // The archive projection's overlayBindingRef belongs to the
            // closed predecessor edge. selectedNextGraphFunctionFromArchive()
            // validates that carrier chain; public start reconstructs the
            // binding for the next edge instead of comparing across edges.
            replayOverlayRef: replayNextAction.overlayRef
          })
    },
    module: constructSdlcGtlModule(),
    queryDomain,
    conformedProject: context.conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: request.workerTransport
    })
  });
}

function selectedActionRequiresFreshTargetTraversal(
  selectedActionRef: string | null
): boolean {
  return (
    selectedActionRef?.includes("/post_repair_reentry/") === true ||
    selectedActionRef?.includes("/post_repair/") === true ||
    selectedActionRef?.includes("/post_close_overlay_continuation/") === true
  );
}

function basisIdValue(event: RuntimeEvent): string | null {
  const value: unknown = Reflect.get(event, "basisId");
  return typeof value === "string" ? value : null;
}

function hasReplayForBasis(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): boolean {
  return events.some((event) => basisIdValue(event) === basis.id);
}

function selectedArchiveMatchesRequestedStart(input: {
  readonly request: OddSdlcSpecMethodTraversalRequest;
  readonly selected: SelectedNextGraphFunctionFromArchive;
  readonly module: ReturnType<typeof constructSdlcGtlModule>;
}): boolean {
  if (input.request.target.kind === "next") {
    return true;
  }
  if (
    input.request.target.kind === "graph_function" &&
    input.request.target.handle === input.selected.graphFunctionName
  ) {
    return true;
  }
  if (
    input.request.target.kind === "graph_function" &&
    input.request.until === "converged" &&
    input.request.target.handle === input.selected.completedGraphFunctionName
  ) {
    return true;
  }
  if (
    input.request.target.kind === "graph_function" &&
    input.request.until === "converged" &&
    input.selected.completedGraphFunctionName !== null &&
    input.selected.overlayRef !== null
  ) {
    const catalog = constructSdlcTraversalOverlayCatalog({
      module: input.module
    });
    const selectedOverlay = resolveSdlcTraversalOverlay({
      catalog,
      overlayRef: input.selected.overlayRef
    });
    if (selectedOverlay !== null) {
      const requestedIndex = selectedOverlay.graphFunctionRefs.indexOf(
        input.request.target.handle
      );
      const completedIndex = selectedOverlay.graphFunctionRefs.indexOf(
        input.selected.completedGraphFunctionName
      );
      const nextIndex = selectedOverlay.graphFunctionRefs.indexOf(
        input.selected.graphFunctionName
      );
      if (
        requestedIndex >= 0 &&
        completedIndex > requestedIndex &&
        nextIndex > completedIndex
      ) {
        return true;
      }
    }
  }
  if (
    input.request.target.kind === "overlay" &&
    input.selected.overlayRef !== null
  ) {
    const catalog = constructSdlcTraversalOverlayCatalog({
      module: input.module
    });
    const requestedOverlay = resolveSdlcTraversalOverlay({
      catalog,
      overlayRef: input.request.target.handle
    });
    return requestedOverlay?.overlayRef === input.selected.overlayRef;
  }
  return false;
}

function startOutcomeForObservedReplay(input: {
  readonly request: OddSdlcSpecMethodTraversalRequest;
  readonly events: readonly RuntimeEvent[];
}): ReturnType<typeof publicStartOnce> | OddSdlcSpecMethodBlockingPayload {
  const context = workspaceContext({
    workspaceRoot: input.request.workspaceRoot,
    outputWorkspaceRoot: input.request.outputWorkspaceRoot
  });
  const module = constructSdlcGtlModule();
  const selectedNextGraphFunction = selectedNextGraphFunctionFromArchive({
    context,
    module
  });
  if (isSelectedNextGraphFunctionArchiveDiagnostic(selectedNextGraphFunction)) {
    return specMethodBlockingPayload(selectedNextGraphFunction);
  }
  if (
    selectedNextGraphFunction !== null &&
    selectedArchiveMatchesRequestedStart({
      request: input.request,
      selected: selectedNextGraphFunction,
      module
    })
  ) {
    const replayNextAction = {
      nextActionProjectionRef: selectedNextGraphFunction.nextActionProjectionRef,
      selectedActionRef: selectedNextGraphFunction.selectedActionRef,
      nextGraphFunctionRef: selectedNextGraphFunction.graphFunctionName,
      nextGraphVectorRef: selectedNextGraphFunction.nextGraphVectorRef,
      closureDecisionRef: selectedNextGraphFunction.closureDecisionRef,
      overlayRef: selectedNextGraphFunction.overlayRef,
      overlayBindingRef: selectedNextGraphFunction.overlayBindingRef
    };
    const selected = startOutcomeFor({
      ...input.request,
      target:
        input.request.target.kind === "next" ||
        input.request.target.kind === "overlay"
          ? input.request.target
          : {
              kind: "graph_function",
              handle: selectedNextGraphFunction.graphFunctionName
            }
    }, replayNextAction);
    if (
      selected.executionContract !== null ||
      (selected.kind === "sdlc_public_start_blocked" &&
        selected.blockingReason === "stale_query_domain")
    ) {
      if (
        input.request.target.kind === "next" &&
        selected.executionContract !== null &&
        !hasReplayForBasis(selected.executionContract.basis, input.events)
      ) {
        const replayMatched = startOutcomeFor({
          ...input.request,
          target: {
            kind: "graph_function",
            handle: selectedNextGraphFunction.graphFunctionName
          }
        }, replayNextAction);
        if (
          replayMatched.executionContract !== null &&
          hasReplayForBasis(replayMatched.executionContract.basis, input.events)
        ) {
          return replayMatched;
        }
      }
      return selected;
    }
  }
  const requested = startOutcomeFor(input.request);
  if (
    requested.executionContract === null ||
    hasReplayForBasis(requested.executionContract.basis, input.events)
  ) {
    return requested;
  }
  for (const until of SDLC_PUBLIC_START_UNTIL_VALUES) {
    const candidate = startOutcomeFor({
      ...input.request,
      until
    });
    if (
      candidate.executionContract !== null &&
      hasReplayForBasis(candidate.executionContract.basis, input.events)
    ) {
      return candidate;
    }
  }
  if (input.request.target.kind === "next") {
    const queryDomain = queryDomainFor(context);
    for (const target of queryDomain.startTargets) {
      for (const until of SDLC_PUBLIC_START_UNTIL_VALUES) {
        const candidate = startOutcomeFor({
          ...input.request,
          target: {
            kind: "graph_function",
            handle: target.name
          },
          until
        });
        if (
          candidate.executionContract !== null &&
          hasReplayForBasis(candidate.executionContract.basis, input.events)
        ) {
          return candidate;
        }
      }
    }
  }
  return requested;
}

function replayEventsForBasis(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  return Object.freeze(
    events.filter((event) => {
      if ("basisId" in event) {
        return basisIdValue(event) === basis.id;
      }
      const runId: unknown = Reflect.get(event, "runId");
      const workKey: unknown = Reflect.get(event, "workKey");
      return (
        typeof runId === "string" &&
        typeof workKey === "string" &&
        runId === basis.runId &&
        workKey === basis.workKey
      );
    })
  );
}

function startOutcomeRequiresFreshTargetTraversal(
  start: ReturnType<typeof publicStartOnce>
): boolean {
  const selectedActionRef =
    start.executionContract?.nextActionProjection.selectedActionRef ?? null;
  return selectedActionRequiresFreshTargetTraversal(selectedActionRef);
}

function constructionPrioritySchemeForSpecMethodGaps(input: {
  readonly request: OddSdlcSpecMethodTraversalRequest;
  readonly basis: ExecutionBasis;
  readonly closedVectorIndexes: readonly number[];
}): ConstructionPriorityScheme | undefined {
  if (input.request.evaluatorPriorityEdge === null) {
    return undefined;
  }
  const matches = input.basis.graph.vectors
    .map((vector, index) => Object.freeze({ vector, index }))
    .filter(({ vector }) => vector.name === input.request.evaluatorPriorityEdge);
  if (matches.length === 0) {
    throw new TypeError(
      `--evaluator-priority-edge does not name a published graph edge: ${input.request.evaluatorPriorityEdge}`
    );
  }
  if (matches.length > 1) {
    throw new TypeError(
      `--evaluator-priority-edge is ambiguous: ${input.request.evaluatorPriorityEdge}`
    );
  }
  const selected = matches[0];
  if (selected === undefined) {
    throw new TypeError("--evaluator-priority-edge did not resolve to a graph edge");
  }
  if (input.closedVectorIndexes.includes(selected.index)) {
    throw new TypeError(
      `--evaluator-priority-edge names an already closed graph edge: ${selected.vector.name}`
    );
  }
  const sourcePolicyRef =
    `spec-method://odd-sdlc/gaps/evaluator-priority-edge/${selected.vector.name}`;
  return constructConstructionPriorityScheme({
    schemeRef:
      `priority-scheme://odd-sdlc/spec-method/gaps/${input.basis.graphFunction.id}/${selected.vector.id}`,
    sourcePolicyRef,
    rules: Object.freeze([
      constructConstructionPriorityRule({
        priorityRuleRef:
          `priority-rule://odd-sdlc/spec-method/gaps/${input.basis.graphFunction.id}/${selected.vector.id}`,
        axis: "gap_repair",
        weight: 1000,
        appliesToActionKinds: Object.freeze(["continue_graph_call"]),
        appliesToOutcomeRefs: Object.freeze([
          `outcome://odd-sdlc/${input.basis.graphFunction.id}/${selected.vector.target.id}`
        ]),
        sourcePolicyRef,
        strategyLabel: "spec_method_evaluator_priority_edge"
      })
    ])
  });
}

async function installedStartPayloadFor(
  request: OddSdlcSpecMethodTraversalRequest
): Promise<unknown> {
  const outputWorkspaceRoot = outputWorkspaceRootFor(request);
  const runtimeEvents = await readOddSdlcRuntimeEvents(outputWorkspaceRoot);
  const start = startOutcomeForObservedReplay({
    request,
    events: runtimeEvents
  });
  if (isSpecMethodBlockingPayload(start)) {
    return start;
  }
  const deterministicTransition =
    start.kind === "sdlc_public_start_projected" &&
    start.transition.kind === "fd_advance";
  if (request.workerTransport === null && !deterministicTransition) {
    return start;
  }
  return executeInstalledOperatorStart({
    workspaceRoot: outputWorkspaceRoot,
    sourceWorkspaceRoot: request.workspaceRoot,
    start,
    workerTransport: request.workerTransport,
    replayEvents:
      start.executionContract === null
        ? Object.freeze([])
        : startOutcomeRequiresFreshTargetTraversal(start)
          ? EMPTY_RUNTIME_EVENTS
        : replayEventsForBasis(start.executionContract.basis, runtimeEvents),
    eventGraphEvents: runtimeEvents,
    requireInstalledTopology: true
  });
}

function gapsPayload(request: OddSdlcSpecMethodTraversalRequest): unknown {
  const outputWorkspaceRoot = outputWorkspaceRootFor(request);
  const context = workspaceContext({
    workspaceRoot: request.workspaceRoot,
    outputWorkspaceRoot: request.outputWorkspaceRoot
  });
  const queryDomain = queryDomainFor(context);
  const allEvents = readOddSdlcRuntimeEventsSync(outputWorkspaceRoot);
  const start = startOutcomeForObservedReplay({
    request,
    events: allEvents
  });
  if (isSpecMethodBlockingPayload(start)) {
    return Object.freeze({
      start,
      projection: null,
      dossier: null,
      requirementFulfillment: null,
      homeostaticTriage: null,
      blockingReason: start.blockingReason,
      blockingReasonCarriers: start.blockingReasonCarriers,
      evidenceRefs: start.evidenceRefs
    });
  }
  if (start.executionContract === null) {
    return Object.freeze({
      start,
      dossier: null
    });
  }
  const events = replayEventsForBasis(
    start.executionContract.basis,
    allEvents
  );
  const projection = evalSdlcGapFromReplay({
    basis: start.executionContract.basis,
    events
  });
  const priorityScheme = constructionPrioritySchemeForSpecMethodGaps({
    request,
    basis: start.executionContract.basis,
    closedVectorIndexes: projection.closedVectorIndexes
  });
  const requirementFulfillment = requirementFulfillmentForGaps({
    context,
    sourceProjection: queryDomain.requirementFulfillment
  });
  const dossier = deriveSdlcGapDossier({
    basis: start.executionContract.basis,
    events,
    triageInput: "spec_method:gaps",
    evidenceRefs: ["spec-method://odd-sdlc-ts/gaps"],
    requirementFulfillment,
    domainDefaults: queryDomain.domainDefaults,
    ...(priorityScheme === undefined ? {} : { priorityScheme })
  });
  const homeostaticTriage = homeostaticGapTriageForGaps({
    dossier,
    requirementFulfillment,
    ingressReport: context.ingressReport
  });
  return Object.freeze({
    start,
    projection,
    dossier,
    requirementFulfillment,
    homeostaticTriage
  });
}

export interface SdlcAnalyzeRunCliEnvelope {
  readonly kind: "sdlc_analyze_run_cli_envelope";
  readonly format: SdlcFdRunAnalysisFormat;
  readonly outputPath: string | null;
  readonly wroteOutputPath: boolean;
  readonly renderedBytes: number;
  readonly strict: boolean;
  readonly strictFailed: boolean;
  readonly rendered: string;
  readonly analysis: SdlcFdRunAnalysisResult;
}

function analyzeRunPayload(
  request: OddSdlcSpecMethodAnalyzeRunRequest
): SdlcAnalyzeRunCliEnvelope {
  if (request.outputPath !== null) {
    const normalisedOutput = path.resolve(request.outputPath);
    const normalisedRoot = path.resolve(request.inspectedRoot);
    if (
      normalisedOutput === normalisedRoot ||
      normalisedOutput.startsWith(`${normalisedRoot}${path.sep}`)
    ) {
      throw new TypeError(
        "analyze-run --output path must live outside the inspected root"
      );
    }
  }
  const analysis = analyzeSdlcFdRunArchive({
    inspectedRoot: request.inspectedRoot,
    profile: request.profile
  });
  const rendered =
    request.format === "markdown"
      ? renderSdlcFdRunAnalysisMarkdown(analysis)
      : JSON.stringify(analysis, null, 2);
  let wroteOutputPath = false;
  if (request.outputPath !== null) {
    writeFileSync(request.outputPath, rendered, "utf8");
    wroteOutputPath = true;
  }
  const strictFailed =
    request.strict &&
    analysis.diagnostics.some(
      (diagnostic) =>
        diagnostic.severity === "error" || diagnostic.severity === "warn"
    );
  return Object.freeze({
    kind: "sdlc_analyze_run_cli_envelope" as const,
    format: request.format,
    outputPath: request.outputPath,
    wroteOutputPath,
    renderedBytes: Buffer.byteLength(rendered, "utf8"),
    strict: request.strict,
    strictFailed,
    rendered,
    analysis
  });
}

function commandPayload(
  request:
    | OddSdlcSpecMethodTraversalRequest
    | OddSdlcSpecMethodAnalyzeRunRequest
    | OddSdlcSpecMethodTicketIntakeRequest
): unknown {
  if (request.command === "analyze-run") {
    return analyzeRunPayload(request);
  }
  if (request.command === "ticket-intake") {
    return createSdlcTerminalGapTicketsFromOperatorRun({
      workspaceRoot: request.workspaceRoot,
      operatorRunRoot: request.fromRun,
      intakeKind: request.intakeKind
    });
  }
  if (request.command === "catalog") {
    return constructSdlcGraphFunctionCatalog();
  }
  if (request.command === "rc-report") {
    return describeOddSdlcTypescriptRcQualification();
  }
  if (request.command === "query-domain") {
    return queryDomainFor(
      workspaceContext({
        workspaceRoot: request.workspaceRoot,
        outputWorkspaceRoot: request.outputWorkspaceRoot
      })
    );
  }
  if (request.command === "tickets" || request.command === "reviewers") {
    const queryDomain = queryDomainFor(
      workspaceContext({
        workspaceRoot: request.workspaceRoot,
        outputWorkspaceRoot: request.outputWorkspaceRoot
      })
    );
    return request.command === "tickets"
      ? queryDomain.ticketWorkflow
      : Object.freeze({
          kind: "sdlc_reviewer_profile_projection" as const,
          readOnly: true as const,
          reviewerProfiles: queryDomain.ticketWorkflow.reviewerProfiles,
          emittedRuntimeEventKinds: Object.freeze([] as const)
        });
  }
  if (request.command === "ticket-admit") {
    if (
      request.target.kind !== "asset" ||
      !request.target.handle.startsWith("ticket/")
    ) {
      throw new TypeError("ticket-admit requires --target asset:ticket/<id>");
    }
    const queryDomain = queryDomainFor(
      workspaceContext({
        workspaceRoot: request.workspaceRoot,
        outputWorkspaceRoot: request.outputWorkspaceRoot
      })
    );
    return admitSdlcTicketExecutionContract({
      workflow: queryDomain.ticketWorkflow,
      ticketId: request.target.handle.slice("ticket/".length)
    });
  }
  if (request.command === "gaps") {
    return gapsPayload(request);
  }
  return startOutcomeFor(request);
}

async function commandPayloadAsync(request: OddSdlcSpecMethodRequest): Promise<unknown> {
  if (request.command === "install") {
    return installOddSdlcTypescript({
      targetRoot: request.targetRoot,
      packageSourceRoot: request.packageSourceRoot,
      abgPackageSourceRoot: request.abgPackageSourceRoot,
      abgStandardsSourceRoot: request.abgStandardsSourceRoot,
      abgDocsSourceRoot: request.abgDocsSourceRoot,
      installedPackageName: request.installedPackageName
    });
  }
  if (request.command === "release-cut") {
    return deriveOddSdlcTypescriptReleaseCut({
      archiveRoot: request.archiveRoot,
      packageSourceRoot: request.packageSourceRoot
    });
  }
  if (request.command === "release-snapshot") {
    return deriveOddSdlcTypescriptReleaseSnapshot({
      releaseIdentity: request.releaseIdentity,
      packageSourceRoot: request.packageSourceRoot,
      snapshotRoot: request.snapshotRoot,
      sourceRef: request.sourceRef,
      sourceCommit: request.sourceCommit,
      rcBranch: request.rcBranch,
      releaseNotePath: request.releaseNotePath,
      expectedPackageName: request.expectedPackageName,
      expectedPackageVersion: request.expectedPackageVersion,
      runBuild: request.runBuild,
      allowDirtySource: request.allowDirtySource,
      npmCacheRoot: request.npmCacheRoot
    });
  }
  if (request.command === "analyze-run") {
    return analyzeRunPayload(request);
  }
  if (request.command === "start") {
    assertCurrentSdlcGtlProgramConformance();
    return installedStartPayloadFor(request);
  }
  return commandPayload(request);
}

export function invokeOddSdlcSpecMethodCommandSync(
  argv: readonly string[]
): OddSdlcSpecMethodResult {
  let command: OddSdlcSpecMethodCommand | "unknown" = "unknown";
  try {
    const request = admitOddSdlcSpecMethodRequest(argv);
    command = request.command;
    if (
      request.command === "install" ||
      request.command === "release-cut" ||
      request.command === "release-snapshot"
    ) {
      throw new TypeError(
        `${request.command} requires invokeOddSdlcSpecMethodCommand`
      );
    }
    if (request.command === "analyze-run") {
      const envelope = analyzeRunPayload(request);
      return analyzeRunResult(request.command, envelope);
    }
    return ok(request.command, commandPayload(request));
  } catch (error) {
    return fail(command, error instanceof Error ? error.message : String(error));
  }
}

export async function invokeOddSdlcSpecMethodCommand(
  argv: readonly string[]
): Promise<OddSdlcSpecMethodResult> {
  let command: OddSdlcSpecMethodCommand | "unknown" = "unknown";
  try {
    const request = admitOddSdlcSpecMethodRequest(argv);
    command = request.command;
    const payload = await commandPayloadAsync(request);
    if (
      request.command === "analyze-run" &&
      isAnalyzeRunCliEnvelope(payload)
    ) {
      return analyzeRunResult(request.command, payload);
    }
    return ok(request.command, payload);
  } catch (error) {
    return fail(command, error instanceof Error ? error.message : String(error));
  }
}

function analyzeRunResult(
  command: OddSdlcSpecMethodCommand,
  envelope: SdlcAnalyzeRunCliEnvelope
): OddSdlcSpecMethodResult {
  return Object.freeze({
    kind: "odd_sdlc_spec_method_result" as const,
    command,
    status: "ok" as const,
    exitCode: envelope.strictFailed ? (2 as const) : (0 as const),
    payload: envelope
  });
}

function isAnalyzeRunCliEnvelope(value: unknown): value is SdlcAnalyzeRunCliEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Reflect.get(value, "kind") === "sdlc_analyze_run_cli_envelope"
  );
}

function isUnknownArray(input: unknown): input is readonly unknown[] {
  return Array.isArray(input);
}

function stringField(
  record: Readonly<Record<string, unknown>>,
  key: string
): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function numberArrayField(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly number[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    value.filter((entry): entry is number => typeof entry === "number")
  );
}

function numberField(
  record: Readonly<Record<string, unknown>>,
  key: string
): number | null {
  const value = record[key];
  return typeof value === "number" ? value : null;
}

function stringArrayField(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly string[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    value.filter((entry): entry is string => typeof entry === "string")
  );
}

function childRecord(
  record: Readonly<Record<string, unknown>>,
  key: string
): Readonly<Record<string, unknown>> | null {
  const value = record[key];
  return isRecord(value) ? value : null;
}

const MAX_CLI_JSON_EVIDENCE_REFS = 25;
const MAX_CLI_JSON_REASON_CARRIERS = 50;

function compactArrayValue(
  value: unknown,
  maxEntries: number,
  omittedLabel: string
): unknown {
  if (!isUnknownArray(value) || value.length <= maxEntries) {
    return value;
  }
  return Object.freeze([
    ...value.slice(0, maxEntries),
    `${omittedLabel}:${value.length - maxEntries}`
  ]);
}

function compactEvidenceRefs(value: unknown): unknown {
  return compactArrayValue(
    value,
    MAX_CLI_JSON_EVIDENCE_REFS,
    "sdlc_cli_json_omitted_evidence_ref_count"
  );
}

function omittedBlockingReasonCarrier(
  omittedLabel: string,
  omittedCount: number
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "sdlc_blocking_reason",
    code: "unknown_blocking_reason",
    reasonClass: "unknown",
    lawfulReentryPoint: "inspect_worker_archive",
    message: "CLI JSON omitted additional carriers; inspect the operator archive.",
    detail: `${omittedLabel}:${omittedCount}`,
    evidenceRefs: Object.freeze([])
  });
}

function compactBlockingReasonCarrierArray(
  value: unknown,
  omittedLabel: string
): unknown {
  if (!Array.isArray(value)) {
    return value;
  }
  const entries = value
    .slice(0, MAX_CLI_JSON_REASON_CARRIERS)
    .map(compactBlockingReasonCarrier);
  if (value.length > MAX_CLI_JSON_REASON_CARRIERS) {
    entries.push(omittedBlockingReasonCarrier(
      omittedLabel,
      value.length - MAX_CLI_JSON_REASON_CARRIERS
    ));
  }
  return Object.freeze(entries);
}

function compactGapReasonArray(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }
  const entries = value
    .slice(0, MAX_CLI_JSON_REASON_CARRIERS)
    .map(compactGapReason);
  if (value.length > MAX_CLI_JSON_REASON_CARRIERS) {
    const omitted = omittedBlockingReasonCarrier(
      "gap_dossier_reason_count",
      value.length - MAX_CLI_JSON_REASON_CARRIERS
    );
    entries.push(Object.freeze({
      kind: "sdlc_postflight_gap_reason",
      reason: stringField(omitted, "detail") ?? "gap_dossier_reason_count",
      reasonClass: "unknown",
      blockingReason: omitted
    }));
  }
  return Object.freeze(entries);
}

function compactBlockingReasonCarrier(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    evidenceRefs: compactEvidenceRefs(value["evidenceRefs"])
  });
}

function compactGapReason(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    evidenceRefs: compactEvidenceRefs(value["evidenceRefs"]),
    blockingReason: compactBlockingReasonCarrier(value["blockingReason"])
  });
}

function compactGapDossier(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    evidenceRefs: compactEvidenceRefs(value["evidenceRefs"]),
    reasons: compactGapReasonArray(value["reasons"])
  });
}

function compactPostflight(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    evidenceRefs: compactEvidenceRefs(value["evidenceRefs"]),
    blockingReasonCarriers: compactBlockingReasonCarrierArray(
      value["blockingReasonCarriers"],
      "postflight_blocking_reason_carrier_count"
    )
  });
}

function compactSummary(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    blockingReasons: compactBlockingReasonCarrierArray(
      value["blockingReasons"],
      "summary_blocking_reason_carrier_count"
    )
  });
}

function compactInlineArchiveCarrier(value: unknown, archiveRef: string | null): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  return Object.freeze({
    kind: "sdlc_cli_compacted_inline_payload",
    originalKind: isRecord(value) ? stringField(value, "kind") : null,
    archiveRef,
    reason: "large_inline_carrier_available_in_operator_archive"
  });
}

function compactRetryContext(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    priorGapDossiers: Array.isArray(value["priorGapDossiers"])
      ? Object.freeze(value["priorGapDossiers"].map(compactGapDossier))
      : value["priorGapDossiers"]
  });
}

function compactManifest(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    fpTransformRequest: compactInlineArchiveCarrier(
      value["fpTransformRequest"],
      stringField(value, "fpTransformRequestFile")
    ),
    retryContext: compactRetryContext(value["retryContext"])
  });
}

function compactInstalledStartJsonPayload(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }
  if (stringField(payload, "kind") !== "sdlc_installed_operator_start_outcome") {
    return payload;
  }
  const summary = childRecord(payload, "summary");
  const archiveRoot =
    stringField(payload, "archiveRoot") ??
    (summary === null ? null : stringField(summary, "archiveRoot"));
  const archiveRootPath = archiveRoot === null ? null : archiveRoot.replace(/\/+$/u, "");
  const archiveFileRef = (relativePath: string): string | null =>
    archiveRootPath === null
      ? null
      : pathToFileURL(path.join(archiveRootPath, relativePath)).href;
  const sourceOutcomeRef = archiveFileRef("run.json");
  return Object.freeze({
    kind: "sdlc_installed_operator_start_cli_projection" as const,
    sourceOutcomeKind: "sdlc_installed_operator_start_outcome" as const,
    sourceOutcomeRef,
    archiveRoot,
    compacted: true,
    omittedCarrierRefs: Object.freeze(
      [
        archiveFileRef("handoff_manifest.json"),
        archiveFileRef("worker_result_report.json"),
        archiveFileRef("postflight.json"),
        archiveFileRef("gap_dossier.json"),
        archiveFileRef("sdlc_edge_fulfillment_ledger.json"),
        archiveFileRef("sdlc_edge_closure_decision.json"),
        archiveFileRef("sdlc_next_action_projection.json")
      ].filter((ref): ref is string => ref !== null)
    ),
    status: stringField(payload, "status"),
    summary: compactSummary(payload["summary"]),
    manifest: compactManifest(payload["manifest"]),
    postflight: compactPostflight(payload["postflight"]),
    gapDossier: compactGapDossier(payload["gapDossier"]),
    traversalConsequence: payload["traversalConsequence"] ?? null,
    loop: payload["loop"] ?? null,
    emittedRuntimeEventKinds: payload["emittedRuntimeEventKinds"] ?? Object.freeze([])
  });
}

function compactPublicStartForGapsJson(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }
  const executionContract = childRecord(payload, "executionContract");
  const nextActionProjection =
    executionContract === null
      ? null
      : childRecord(executionContract, "nextActionProjection");
  const basis =
    executionContract === null ? null : childRecord(executionContract, "basis");
  return Object.freeze({
    kind: stringField(payload, "kind"),
    status: stringField(payload, "status"),
    blockingReason: stringField(payload, "blockingReason"),
    stopPredicate: stringField(payload, "stopPredicate"),
    detail: stringField(payload, "detail"),
    executionContract:
      executionContract === null
        ? null
        : Object.freeze({
            kind: stringField(executionContract, "kind"),
            targetGraphFunction: stringField(executionContract, "targetGraphFunction"),
            requestedUntil: stringField(executionContract, "requestedUntil"),
            overlayRef: stringField(executionContract, "overlayRef"),
            overlayBindingRef: stringField(executionContract, "overlayBindingRef"),
            workerAttachment: executionContract["workerAttachment"],
            nextActionProjection:
              nextActionProjection === null
                ? null
                : Object.freeze({
                    nextGraphVectorRef: stringField(
                      nextActionProjection,
                      "nextGraphVectorRef"
                    ),
                    nextGraphFunctionRef: stringField(
                      nextActionProjection,
                      "nextGraphFunctionRef"
                    ),
                    selectedActionRef: stringField(
                      nextActionProjection,
                      "selectedActionRef"
                    ),
                    targetBindingRefs: stringArrayField(
                      nextActionProjection,
                      "targetBindingRefs"
                    )
                  }),
            basis:
              basis === null
                ? null
                : Object.freeze({
                    id: stringField(basis, "id"),
                    workspaceRoot: stringField(basis, "workspaceRoot"),
                    outputWorkspaceRoot: stringField(basis, "outputWorkspaceRoot"),
                    workKey: stringField(basis, "workKey"),
                    runId: stringField(basis, "runId")
                  })
          })
  });
}

function compactGapsJsonPayload(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }
  const requirementFulfillment = compactRequirementFulfillmentForGapsJson(
    payload["requirementFulfillment"]
  );
  return Object.freeze({
    ...payload,
    start: compactPublicStartForGapsJson(payload["start"]),
    dossier: compactGapDossierForGapsJson(payload["dossier"]),
    requirementFulfillment
  });
}

function compactRequirementFulfillmentRowForGapsJson(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    kind: stringField(value, "kind"),
    requirementId: stringField(value, "requirementId"),
    requirementDisplayId: stringField(value, "requirementDisplayId"),
    requirementAuthorityRef: stringField(value, "requirementAuthorityRef"),
    fulfillmentStatus: stringField(value, "fulfillmentStatus"),
    carryStatus: stringField(value, "carryStatus"),
    openReasons: Array.isArray(value["openReasons"])
      ? Object.freeze(value["openReasons"].filter((entry): entry is string => typeof entry === "string"))
      : Object.freeze([]),
    evidenceRefCount: Array.isArray(value["evidenceRefs"])
      ? value["evidenceRefs"].length
      : 0,
    ledgerRefCount: Array.isArray(value["ledgerRefs"])
      ? value["ledgerRefs"].length
      : 0,
    closureDecisionRefCount: Array.isArray(value["closureDecisionRefs"])
      ? value["closureDecisionRefs"].length
      : 0
  });
}

function compactRequirementFulfillmentForGapsJson(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.freeze({
    ...value,
    rows: Array.isArray(value["rows"])
      ? Object.freeze(value["rows"].map(compactRequirementFulfillmentRowForGapsJson))
      : value["rows"]
  });
}

function compactGapDossierForGapsJson(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  const compacted = compactGapDossier(value);
  if (!isRecord(compacted)) {
    return compacted;
  }
  const requirementFulfillment = childRecord(value, "requirementFulfillment");
  return Object.freeze({
    ...compacted,
    requirementFulfillment:
      requirementFulfillment === null
        ? null
        : Object.freeze({
            kind: stringField(requirementFulfillment, "kind"),
            sourceRegisterRef: stringField(requirementFulfillment, "sourceRegisterRef"),
            counts: requirementFulfillment["counts"] ?? null,
            edgeFulfillmentCounts:
              requirementFulfillment["edgeFulfillmentCounts"] ?? null,
            rowCount: Array.isArray(requirementFulfillment["rows"])
              ? requirementFulfillment["rows"].length
              : 0
          })
  });
}

function jsonPayloadForResult(result: OddSdlcSpecMethodResult): unknown {
  if (result.command === "start") {
    return compactInstalledStartJsonPayload(result.payload);
  }
  if (result.command === "gaps") {
    return compactGapsJsonPayload(result.payload);
  }
  return result.payload;
}

function compactGapsResult(result: OddSdlcSpecMethodResult): string | null {
  if (result.command !== "gaps" || !isRecord(result.payload)) {
    return null;
  }
  const projection = childRecord(result.payload, "projection");
  const dossier = childRecord(result.payload, "dossier");
  if (projection === null) {
    return null;
  }
  const actions = dossier === null ? Object.freeze([]) : stringArrayField(dossier, "nextLawfulActions");
  const requirementFulfillment =
    dossier === null ? null : childRecord(dossier, "requirementFulfillment");
  const requirementCounts =
    requirementFulfillment === null
      ? null
      : childRecord(requirementFulfillment, "counts");
  const homeostaticTriage = childRecord(result.payload, "homeostaticTriage");
  const triageClassification =
    homeostaticTriage === null
      ? null
      : childRecord(homeostaticTriage, "classification");
  const routeBinding =
    homeostaticTriage === null
      ? null
      : childRecord(homeostaticTriage, "routeBinding");
  const totalRequirements =
    requirementCounts === null ? null : numberField(requirementCounts, "total");
  const unresolvedRequirements =
    requirementCounts === null ? null : numberField(requirementCounts, "unresolved");
  const triageLayer =
    triageClassification === null
      ? "inspect_json"
      : stringField(triageClassification, "frameworkLayer") ?? "inspect_json";
  const triageCondition =
    triageClassification === null
      ? "inspect_json"
      : stringField(triageClassification, "frameworkCondition") ?? "inspect_json";
  const reEntryLayer =
    routeBinding === null
      ? "inspect_json"
      : stringField(routeBinding, "reEntryLayer") ?? "inspect_json";
  const targetGraphFunction =
    routeBinding === null
      ? "inspect_json"
      : stringField(routeBinding, "targetGraphFunction") ?? "none";
  return [
    "odd-sdlc-ts gaps",
    `status: ${stringField(projection, "status") ?? result.status}`,
    `graph_function: ${stringField(projection, "graphFunctionName") ?? "n/a"}`,
    `current_edge: ${stringField(projection, "currentEdge") ?? "n/a"}`,
    `closed_vectors: ${numberArrayField(projection, "closedVectorIndexes").join(",") || "none"}`,
    totalRequirements === null
      ? "requirements: inspect_json"
      : `requirements: ${unresolvedRequirements ?? 0}/${totalRequirements} unresolved`,
    `triage: ${triageLayer}/${triageCondition} -> ${reEntryLayer}:${targetGraphFunction}`,
    "read_only: true",
    "chooses_next_traversal: false",
    `next_action: ${actions[0] ?? "inspect_json"}`,
    "json: rerun with ODD_SDLC_TS_OUTPUT=json"
  ].join("\n");
}

function compactInstalledStartResult(result: OddSdlcSpecMethodResult): string | null {
  if (result.command !== "start" || !isRecord(result.payload)) {
    return null;
  }
  const summary = childRecord(result.payload, "summary");
  if (summary === null) {
    return null;
  }
  return [
    "odd-sdlc-ts start",
    `status: ${stringField(summary, "status") ?? result.status}`,
    `graph_function: ${stringField(summary, "graphFunctionName") ?? "n/a"}`,
    `current_edge: ${stringField(summary, "currentEdge") ?? "n/a"}`,
    `blocking_reason: ${stringField(summary, "blockingReason") ?? "none"}`,
    `next_action: ${stringField(summary, "nextLawfulAction") ?? "inspect_json"}`,
    `archive: ${stringField(summary, "archiveRoot") ?? "none"}`,
    "json: rerun with ODD_SDLC_TS_OUTPUT=json"
  ].join("\n");
}

function compactPublicStartResult(result: OddSdlcSpecMethodResult): string | null {
  if (result.command !== "start" || !isRecord(result.payload)) {
    return null;
  }
  const executionContract = childRecord(result.payload, "executionContract");
  return [
    "odd-sdlc-ts start",
    `status: ${stringField(result.payload, "status") ?? result.status}`,
    `graph_function: ${stringField(executionContract ?? {}, "targetGraphFunction") ?? "n/a"}`,
    `blocking_reason: ${stringField(result.payload, "blockingReason") ?? "none"}`,
    `stop: ${stringField(result.payload, "stopPredicate") ?? stringField(result.payload, "kind") ?? "n/a"}`,
    "json: rerun with ODD_SDLC_TS_OUTPUT=json"
  ].join("\n");
}

export function serializeOddSdlcSpecMethodResult(result: OddSdlcSpecMethodResult): string {
  if (
    result.command === "analyze-run" &&
    result.status === "ok" &&
    isAnalyzeRunCliEnvelope(result.payload)
  ) {
    return `${result.payload.rendered}\n`;
  }
  if (process.env["ODD_SDLC_TS_OUTPUT"] !== "json" && result.status === "ok") {
    const compact =
      compactGapsResult(result) ??
      compactInstalledStartResult(result) ??
      compactPublicStartResult(result);
    if (compact !== null) {
      return `${compact}\n`;
    }
  }
  return `${JSON.stringify(
    {
      ...result,
      payload: jsonPayloadForResult(result)
    },
    null,
    2
  )}\n`;
}
