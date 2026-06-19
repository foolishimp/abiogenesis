import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";import path, {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve
} from "node:path";import {
  fileURLToPath,
  pathToFileURL
} from "node:url";import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
} from "../../../graph/index.js";import {
  parseArray,
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseStringList
} from "../../../shared/validation.js";import {
  uniqueSorted
} from "../../../shared/collections.js";import {
  sha256Text
} from "../../../shared/digest.js";import {
  pathIsInside
} from "../../../shared/path.js";import {
  admitExactContractEnum
} from "../../../shared/fd_admission.js";import {
  sdlcOperatorRuntimePolicy
} from "../../runtime_policy.js";import {
  sdlcEdgeOutputPolicyForTargetAssetType
} from "../../edge_output_policy.js";import {
  existingEvidencePaths
} from "../consequence/repair_reentry.js";import {
  admitImplementationDesignRegisterForManifest,
  admitImplementationDesignRegisterForRuntimeEvaluation
} from "../evaluate/design_depth_register.js";import {
  admitSdlcDependencyTraversalSelectedMethodCarrier,
  deriveSdlcStagedImplementationTopologyAuthority,
  deriveSdlcStagedTestTopologyAuthority,
  selectSdlcDependencyMapTraversal
} from "../../decomposition_admission.js";import {
  admitTestExecutionSurfaceRegisterFromArtifact
} from "../../test_execution_surface_register.js";import {
  admitComponentDepthRegisterFromArtifact
} from "../../component_depth_register.js";import {
  makeSdlcBlockingReason,
  type SdlcBlockingReason,
  type SdlcBlockingReasonCode
} from "../../../shared/blocking_reason.js";import {
  admitTestDesignRegisterFromArtifact
} from "../../test_design_register.js";import {
  deriveSdlcConformProjectProfileFromWorkspace
} from "../../../workspace/index.js";import {
  isPlaceholderRequirementMarker
} from "../../../workspace/source_input.js";import type {
  SdlcMaterializedProductFile,
  SdlcMaterializedProductFileRole,
  SdlcPostflightGapDossier,
  SdlcDesignDepthRegister,
  SdlcTestDesignRegister,
  SdlcTestExecutionSurfaceRegister,
  SdlcProductMaterializationContract,
  SdlcTraversalObligation,
  SdlcProductMaterializationAuthorityTarget,
  SdlcWorkerHandoffManifest,
  SdlcWorkerExecutionEvidence,
  SdlcWorkerExecutionShardEvidence,
  SdlcWorkerResultReport,
  SdlcDecompositionSummary
} from "../../carriers.js";import {
  declaredBuildConfigRoleForObservedFile,
  effectiveProductMaterializationRequiredRoles,
  productAuthorityTargetCoversRelativePath,
  reconcileSdlcProductMaterializationAuthority,
  tenantRelativeOutputArtifactPath
} from "../../product_materialization/authority.js";import {
  tenantLocalSdlcSurfaceRelativePath
} from "../../product_materialization/surface_paths.js";

const REPORT_FIELDS = Object.freeze([
  "kind",
  "projectionRole",
  "authoritativeStageResultRef",
  "graphFunctionName",
  "edgeName",
  "targetAssetType",
  "outputFile",
  "digest",
  "summary",
  "unresolvedReasons",
  "materializedFiles",
  "materializationDiagnostics",
  "executionEvidence",
  "executionEvidenceErrors",
  "obligationAssessments",
  "subworkstreamManifest",
  "fpTransformRequestRef",
  "fpTransformResultRef",
  "fpTransformStatusSnapshot",
  "fpEvaluateResultRef"
] as const);

const REQUIREMENT_MARKER_EXPRESSION =
  /\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/g;


const MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS = 80;

const LIVE_FP_PARALLEL_MATERIALIZATION_FRONTIER_FILE =
  "sdlc_live_fp_parallel_materialization_frontier.json";

const CODE_BUILDER_VALIDATION_LOG_NAME_PATTERN =
  /(?:^|[-_])(?:test|validation|verify|check)(?:[-_]|$).*\.log$/iu;

const CODE_BUILDER_VALIDATION_FAILURE_PATTERN =
  /(?:^|\n)\[error\]|\b(?:compilation failed|build failed|command failed|tests unsuccessful)\b|(?:exit(?:ed)?(?:\s+with)?\s+code\s+[1-9][0-9]*)/iu;



function tenantOutputArtifactIsAdr(manifest: SdlcWorkerHandoffManifest): boolean {
  const tenantRelativePath = tenantRelativeOutputArtifactPath(manifest);
  return tenantRelativePath !== null && tenantRelativePath.startsWith("design/adrs/");
}



function targetAdmitsTestExecutionEvidence(targetAssetType: string): boolean {
  return sdlcEdgeOutputPolicyForTargetAssetType(targetAssetType)
    .admitsTestExecutionEvidence;
}



function declaredExecutionContract(input: string): boolean {
  const contract = input.trim().toLowerCase();
  return (
    contract.length > 0 &&
    contract !== "undeclared" &&
    contract !== "none" &&
    contract !== "n/a" &&
    contract !== "not_applicable"
  );
}



function productMaterializationRequiresTestExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return productMaterializationHasExecutionRepairScope({
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    productMaterialization: manifest.productMaterialization
  });
}



function productMaterializationHasExecutionRepairScope(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly productMaterialization: SdlcProductMaterializationContract;
}): boolean {
  if (
    input.targetAssetType === "test_execution_result_surface" &&
    declaredExecutionContract(input.productMaterialization.testExecutionContract)
  ) {
    return true;
  }
  return (
    input.edgeName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET &&
    input.targetAssetType === "component_code_surface" &&
    input.productMaterialization.required &&
    declaredExecutionContract(input.productMaterialization.testExecutionContract)
  );
}



function manifestAdmitsTestExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return targetAdmitsTestExecutionEvidence(manifest.targetAssetType);
}



function executionCommandMatchesContract(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly command: string;
}): boolean {
  const observedCommand = normalizeExecutionCommand(input.command);
  const declaredCommand =
    normalizeExecutionCommand(
      input.manifest.productMaterialization.testExecutionContract
    );
  if (
    executionCommandMatchesDeclaredRunner({
      declaredCommand,
      observedCommand
    })
  ) {
    return true;
  }
  const shards = installedOperatorExecutionShards(input.manifest);
  return (
    shards.length === 1 &&
    executionCommandMatchesDeclaredRunner({
      declaredCommand: normalizeExecutionCommand(shards[0]?.command ?? ""),
      observedCommand
    })
  );
}



function normalizeExecutionCommand(command: string): string {
  return command.trim().replace(/\s+/gu, " ");
}



function executionCommandMatchesDeclaredRunner(input: {
  readonly declaredCommand: string;
  readonly observedCommand: string;
}): boolean {
  const declaredCommand = input.declaredCommand.trim();
  const observedCommand = input.observedCommand.trim();
  if (observedCommand === declaredCommand) {
    return true;
  }
  if (declaredCommand === "undeclared" || declaredCommand.length === 0) {
    return false;
  }
  return shellCommandSegments(observedCommand).some((segment) =>
    shellCommandSegmentMatchesDeclaredRunner({
      declaredCommand,
      segment
    })
  );
}



function shellCommandSegments(command: string): readonly string[] {
  return Object.freeze(
    command
      .split(/\s*(?:&&|\|\||;|\s&\s)\s*/u)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
  );
}



function shellCommandSegmentMatchesDeclaredRunner(input: {
  readonly declaredCommand: string;
  readonly segment: string;
}): boolean {
  const segment = stripLeadingEnvironmentAssignments(input.segment);
  if (segment === input.declaredCommand) {
    return true;
  }
  return (
    /^\S+$/u.test(input.declaredCommand) &&
    segment.startsWith(`${input.declaredCommand} `)
  );
}



function stripLeadingEnvironmentAssignments(command: string): string {
  const parts = command.trim().split(/\s+/u);
  let index = parts[0] === "env" ? 1 : 0;
  while (
    index < parts.length &&
    /^[A-Za-z_][A-Za-z0-9_]*=.+/u.test(parts[index] ?? "")
  ) {
    index += 1;
  }
  return parts.slice(index).join(" ");
}



function tenantStackSpecFilesForSelectedOutputRoot(input: {
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
}): readonly string[] {
  const specRoot = join(input.workspaceRoot, input.selectedOutputRoot, "spec");
  if (!existsSync(specRoot)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(specRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(specRoot, entry.name))
      .filter((filePath) =>
        /(?:^|\/)(?:TECH_STACK|tech_stack|TESTING_TECH_STACK|testing_tech_stack|PRODUCT_TARGETS|product_targets|EXECUTION_CONTRACT|execution_contract)\.(?:json|md|markdown)$/u.test(
          filePath.split(path.sep).join("/")
        )
      )
      .sort()
  );
}



function stringListFromUnknown(value: unknown): readonly string[] {
  if (Array.isArray(value)) {
    return Object.freeze(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    );
  }
  if (typeof value !== "string") {
    return Object.freeze([]);
  }
  return Object.freeze(
    value
      .split(/[,\n]/u)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  );
}



function objectFieldsStringList(
  record: Record<string, unknown>,
  keys: readonly string[]
): readonly string[] {
  return Object.freeze(keys.flatMap((key) => stringListFromUnknown(record[key])));
}



function tenantToolByproductRulesFromUnknown(value: unknown): readonly string[] {
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze([]);
  }
  const nestedKeys = [
    "executionEnvironment",
    "execution_environment",
    "toolEnvironment",
    "tool_environment",
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack"
  ];
  const nested = nestedKeys.flatMap((key) =>
    tenantToolByproductRulesFromUnknown(record[key])
  );
  return uniqueSorted([
    ...objectFieldsStringList(record, [
      "cleanupRules",
      "cleanup_rules",
      "byproductRules",
      "byproduct_rules",
      "workspaceLocalDirectories",
      "workspace_local_directories",
      "localDirectories",
      "local_directories",
      "cacheDirectories",
      "cache_directories",
      "createdDirectories",
      "created_directories"
    ]),
    ...nested
  ]);
}



function declaredTenantToolByproductRulesFromSpecFiles(
  specFiles: readonly string[]
): readonly string[] {
  return uniqueSorted(
    specFiles.flatMap((filePath) => {
      const source = textIfFile(filePath);
      if (source === null) {
        return [];
      }
      try {
        return tenantToolByproductRulesFromUnknown(JSON.parse(source));
      } catch {
        return [];
      }
    })
  );
}

type TenantModuleSystem = "esm" | "commonjs";

interface TenantModuleSystemAuthority {
  readonly moduleSystems: readonly TenantModuleSystem[];
  readonly evidenceRefs: readonly string[];
}

function normalizedTenantModuleSystem(
  value: unknown
): TenantModuleSystem | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "");
  if (
    normalized === "esm" ||
    normalized === "esmodule" ||
    normalized === "esmodules" ||
    normalized === "ecmascriptmodule" ||
    normalized === "ecmascriptmodules" ||
    normalized === "module" ||
    normalized === "typemodule" ||
    normalized === "nodeesm"
  ) {
    return "esm";
  }
  if (
    normalized === "commonjs" ||
    normalized === "cjs" ||
    normalized === "commonjssyntax"
  ) {
    return "commonjs";
  }
  return null;
}

function tenantModuleSystemsFromUnknown(
  value: unknown
): readonly TenantModuleSystem[] {
  const direct = normalizedTenantModuleSystem(value);
  if (direct !== null) {
    return Object.freeze([direct]);
  }
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze([]);
  }
  const directKeys = [
    "moduleSystem",
    "module_system",
    "sourceModuleSystem",
    "source_module_system",
    "testModuleSystem",
    "test_module_system",
    "javascriptModuleSystem",
    "javascript_module_system"
  ];
  const nestedKeys = [
    "runtime",
    "executionRuntime",
    "execution_runtime",
    "executionEnvironment",
    "execution_environment",
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack"
  ];
  return uniqueSorted([
    ...directKeys.flatMap((key) =>
      tenantModuleSystemsFromUnknown(record[key])
    ),
    ...nestedKeys.flatMap((key) =>
      tenantModuleSystemsFromUnknown(record[key])
    )
  ]) as readonly TenantModuleSystem[];
}

function declaredTenantModuleSystemAuthorityForManifest(
  manifest: SdlcWorkerHandoffManifest
): TenantModuleSystemAuthority {
  const specFiles = tenantStackSpecFilesForSelectedOutputRoot({
    workspaceRoot: manifest.workspaceRoot,
    selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
  });
  const moduleSystems = uniqueSorted(
    specFiles.flatMap((filePath) => {
      const source = textIfFile(filePath);
      if (source === null) {
        return [];
      }
      try {
        return tenantModuleSystemsFromUnknown(JSON.parse(source));
      } catch {
        return [];
      }
    })
  ) as readonly TenantModuleSystem[];
  return Object.freeze({
    moduleSystems,
    evidenceRefs: Object.freeze(specFiles.map((filePath) => pathToFileURL(filePath).href))
  });
}

function materializedJavascriptFileUsesCommonJs(content: string): boolean {
  return (
    /(^|[^\w$])require\s*\(/u.test(content) ||
    /(^|[^\w$])module\.exports\b/u.test(content) ||
    /(^|[^\w$])exports\.[A-Za-z_$]/u.test(content) ||
    /(^|[^\w$])exports\s*=/u.test(content)
  );
}

function evaluateMaterializedProductModuleSystem(input: {
  readonly moduleSystemAuthority: TenantModuleSystemAuthority;
  readonly file: SdlcMaterializedProductFile;
  readonly content: string;
  readonly evidenceRefs: readonly string[];
}): SdlcBlockingReason | null {
  if (!input.moduleSystemAuthority.moduleSystems.includes("esm")) {
    return null;
  }
  const extension = path.extname(input.file.relativePath).toLowerCase();
  if (
    extension !== ".js" &&
    extension !== ".mjs" &&
    extension !== ".jsx"
  ) {
    return null;
  }
  if (!materializedJavascriptFileUsesCommonJs(input.content)) {
    return null;
  }
  return makeSdlcBlockingReason({
    code: "materialized_product_module_system_mismatch",
    detail: `${input.file.relativePath}: commonjs syntax under esm module system`,
    evidenceRefs: [
      ...input.evidenceRefs,
      ...input.moduleSystemAuthority.evidenceRefs
    ]
  });
}



function normalizeTenantToolByproductRuleForRoot(input: {
  readonly rule: string;
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
}): string | null {
  const expanded = input.rule
    .replaceAll("${workspaceRoot}", input.workspaceRoot)
    .replaceAll("{{workspaceRoot}}", input.workspaceRoot)
    .replaceAll("${selectedOutputRoot}", input.selectedOutputRoot)
    .replaceAll("{{selectedOutputRoot}}", input.selectedOutputRoot)
    .replaceAll("${tenantRoot}", input.tenantRoot)
    .replaceAll("{{tenantRoot}}", input.tenantRoot)
    .trim();
  if (expanded.length === 0) {
    return null;
  }
  let normalized = expanded.split(path.sep).join("/");
  const tenantRoot = resolve(input.tenantRoot);
  if (isAbsolute(expanded)) {
    const relativeToTenant = relative(tenantRoot, resolve(expanded));
    if (
      relativeToTenant === "" ||
      relativeToTenant.startsWith("..") ||
      isAbsolute(relativeToTenant)
    ) {
      return null;
    }
    normalized = relativeToTenant.split(path.sep).join("/");
  }
  const selectedOutputRoot = normalizedRelativePath(input.selectedOutputRoot).replace(/\/+$/u, "");
  normalized = normalized
    .replace(/^\.\//u, "")
    .replace(/\/\*\*\/\*$/u, "")
    .replace(/\/\*\*$/u, "")
    .replace(/\/\*$/u, "")
    .replace(/\/+$/u, "");
  if (selectedOutputRoot.length > 0) {
    if (normalized === selectedOutputRoot) {
      return null;
    }
    if (normalized.startsWith(`${selectedOutputRoot}/`)) {
      normalized = normalized.slice(selectedOutputRoot.length + 1);
    }
  }
  return normalized.length > 0 ? normalized : null;
}



function executionByproductGlobForNormalizedRule(rule: string): string {
  const normalized = rule
    .replace(/\\/gu, "/")
    .replace(/^\.\//u, "")
    .replace(/\/+$/u, "");
  return normalized.endsWith("/**") ? normalized : `${normalized}/**`;
}



function declaredTenantToolByproductGlobsForProductMaterialization(input: {
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
}): readonly string[] {
  const specFiles = tenantStackSpecFilesForSelectedOutputRoot({
    workspaceRoot: input.workspaceRoot,
    selectedOutputRoot: input.selectedOutputRoot
  });
  const declaredGlobs = declaredTenantToolByproductRulesFromSpecFiles(specFiles)
    .map((rule) =>
      normalizeTenantToolByproductRuleForRoot({
        rule,
        workspaceRoot: input.workspaceRoot,
        selectedOutputRoot: input.selectedOutputRoot,
        tenantRoot: input.tenantRoot
      })
    )
    .filter((rule): rule is string => rule !== null)
    .map(executionByproductGlobForNormalizedRule);
  return uniqueSorted(declaredGlobs);
}



function allowedExecutionByproductGlobsForManifest(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return declaredTenantToolByproductGlobsForProductMaterialization({
    workspaceRoot: manifest.workspaceRoot,
    selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot,
    tenantRoot: manifest.productMaterialization.tenantRoot
  });
}



function shardIdPart(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return normalized.length === 0 ? "unnamed" : normalized;
}



function coverageRefAliases(ref: string): readonly string[] {
  const aliases = new Set<string>([ref]);
  try {
    const parsed = new URL(ref);
    if (parsed.protocol === "file:") {
      aliases.add(fileURLToPath(parsed));
    }
    parsed.hash = "";
    parsed.search = "";
    aliases.add(parsed.href);
    if (parsed.protocol === "file:") {
      aliases.add(fileURLToPath(parsed));
    }
    return Object.freeze([...aliases]);
  } catch {
    const bareRef = ref.replace(/[?#].*$/u, "");
    if (bareRef.length > 0 && bareRef !== ref) {
      aliases.add(bareRef);
    }
    if (isAbsolute(bareRef)) {
      aliases.add(pathToFileURL(bareRef).href);
    }
    return Object.freeze([...aliases]);
  }
}



function assetCoverageRef(input: {
  readonly workspaceRoot: string;
  readonly targetAssetType: string;
  readonly outputFile: string;
}): string | null {
  const relativePath = relative(input.workspaceRoot, input.outputFile);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    return null;
  }
  return `asset://${input.targetAssetType}@${relativePath
    .split(path.sep)
    .join("/")}`;
}



function normalizeRequirementId(requirementId: string): string {
  const parts = requirementId.toUpperCase().split("-");
  const head = parts[0] === "RF" ? "REQ" : parts[0];
  const tail = parts.slice(1).map((part) =>
    /^\d+$/.test(part) && part.length < 3 ? part.padStart(3, "0") : part
  );
  return [head, ...tail].join("-");
}



function decodedScopeRef(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}



function textIfFile(filePath: string): string | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  return readFileSync(filePath, "utf8");
}



function requirementTraceObligationIdsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const ids = new Set<string>();
  const latestDossier =
    manifest.retryContext.priorGapDossiers[manifest.retryContext.priorGapDossiers.length - 1];
  if (latestDossier !== undefined) {
    for (const id of currentEvaluatedGapRequirementIds(manifest, latestDossier)) {
      ids.add(id);
    }
  }
  for (const obligation of canonicalRequirementTraceObligationsForPrompt(manifest)) {
    ids.add(obligation.obligationId);
  }
  return Object.freeze([...ids].slice(0, MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS));
}



function requirementTraceObligationIdsForProductLineage(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return Object.freeze(
    canonicalRequirementTraceObligationsForPrompt(manifest).map(
      (obligation) => obligation.obligationId
    )
  );
}



function currentEvaluatedGapAssessmentRequirementIds(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dossier: SdlcPostflightGapDossier;
}): readonly string[] {
  const evidencePaths = existingEvidencePaths({
    workspaceRoot: input.manifest.workspaceRoot,
    refs: uniqueSorted([
      ...input.dossier.evidenceRefs,
      ...input.dossier.reasons.flatMap((reason) => reason.blockingReason.evidenceRefs)
    ])
  }).filter((filePath) => path.basename(filePath) === "review_grade_edge_fulfillment_assessment.json");
  const ids = new Set<string>();
  for (const filePath of evidencePaths) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      continue;
    }
    const record = objectRecord(parsed);
    if (
      record === null ||
      record["kind"] !== "sdlc_review_grade_edge_fulfillment_assessment" ||
      !Array.isArray(record["findings"])
    ) {
      continue;
    }
    for (const candidateFinding of record["findings"]) {
      const finding = objectRecord(candidateFinding);
      if (
        finding === null ||
        typeof finding["obligationId"] !== "string" ||
        !finding["obligationId"].startsWith("requirement:") ||
        (finding["fulfillmentStatus"] !== "blocked" &&
          finding["fulfillmentStatus"] !== "unassessed")
      ) {
        continue;
      }
      ids.add(finding["obligationId"]);
    }
  }
  return uniqueSorted([...ids]);
}



function currentEvaluatedGapRequirementIds(
  manifest: SdlcWorkerHandoffManifest,
  dossier: SdlcPostflightGapDossier
): readonly string[] {
  const activeRequirementObligationIds = new Set(
    manifest.traversalObligationContext.obligations
      .filter((obligation) => obligation.obligationKind === "requirement")
      .map((obligation) => obligation.obligationId)
  );
  const assessmentIds = currentEvaluatedGapAssessmentRequirementIds({
    manifest,
    dossier
  }).filter((obligationId) =>
    currentEvaluatedGapRequirementIdIsAdmissible({
      activeRequirementObligationIds,
      obligationId
    })
  );
  if (assessmentIds.length > 0) {
    return assessmentIds;
  }
  const ids = new Set<string>();
  const candidateTexts = uniqueSorted(
    dossier.reasons
      .flatMap((reason) => [
        reason.reason,
        reason.blockingReason.message,
        reason.blockingReason.detail ?? ""
      ])
      .map((candidate) => decodedScopeRef(candidate))
  );
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const authorityRef = requirementIdForObligation(obligation.obligationId);
    const displayId = displayIdForRequirementObligation(obligation);
    const variants = uniqueSorted([
      obligation.obligationId,
      ...(authorityRef === null ? [] : [authorityRef]),
      ...(displayId === null ? [] : [displayId])
    ]).filter((variant) => variant.length > 0);
    if (
      variants.some((variant) =>
        candidateTexts.some((candidate) => candidate.includes(variant))
      )
    ) {
      ids.add(obligation.obligationId);
    }
  }
  const fallbackPattern =
    /(?:requirement:)?[A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+){2,}/gu;
  for (const candidate of candidateTexts) {
    for (const match of candidate.matchAll(fallbackPattern)) {
      const raw = match[0];
      const obligationId = raw.startsWith("requirement:")
        ? raw
        : `requirement:${raw}`;
      if (
        currentEvaluatedGapRequirementIdIsAdmissible({
          activeRequirementObligationIds,
          obligationId
        })
      ) {
        ids.add(obligationId);
      }
    }
  }
  return uniqueSorted([...ids]);
}



function currentEvaluatedGapRequirementIdIsAdmissible(input: {
  readonly activeRequirementObligationIds: ReadonlySet<string>;
  readonly obligationId: string;
}): boolean {
  if (input.activeRequirementObligationIds.has(input.obligationId)) {
    return true;
  }
  if (!input.obligationId.startsWith("requirement:")) {
    return false;
  }
  const raw = input.obligationId.slice("requirement:".length).toLowerCase();
  if (
    raw.includes("/") ||
    raw.includes("://") ||
    raw.includes(".json") ||
    raw.includes(".jsonl") ||
    raw.endsWith(".trace") ||
    raw.includes(".trace.")
  ) {
    return false;
  }
  return raw.includes("requirement") || /(?:^|[._-])req[._-]/u.test(raw);
}



function parseNonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer`);
  }
  return input;
}



function expectedArchivedFpEvaluateResultRef(reportFile: string): string {
  return pathToFileURL(join(dirname(reportFile), "fp_evaluate_result.json")).href;
}



function readArchivedWorkerResultReportRecord(input: {
  readonly filePath: string;
  readonly label: string;
}): Record<string, unknown> {
  const record = parseClosedRecord(
    JSON.parse(readFileSync(input.filePath, "utf8")),
    input.label,
    REPORT_FIELDS
  );
  const kind = parseNonEmptyString(record["kind"], `${input.label}.kind`);
  if (kind !== "odd_sdlc.worker_result_report") {
    throw new TypeError(`${input.label}.kind: unexpected report kind`);
  }
  const projectionRole = parseNonEmptyString(
    record["projectionRole"],
    `${input.label}.projectionRole`
  );
  if (projectionRole !== "typed_fp_stage_projection") {
    throw new TypeError(
      `${input.label}.projectionRole: expected typed_fp_stage_projection`
    );
  }
  const authoritativeStageResultRef = parseNonEmptyString(
    record["authoritativeStageResultRef"],
    `${input.label}.authoritativeStageResultRef`
  );
  if (authoritativeStageResultRef !== expectedArchivedFpEvaluateResultRef(input.filePath)) {
    throw new TypeError(
      `${input.label}.authoritativeStageResultRef: expected same-archive fp_evaluate_result.json`
    );
  }
  return record;
}



function parseNullableNonNegativeInteger(input: unknown, label: string): number | null {
  if (input === null) {
    return null;
  }
  return parseNonNegativeInteger(input, label);
}



function parseOptionalArray<T>(
  input: unknown,
  label: string,
  parseItem: (item: unknown, itemLabel: string) => T
): readonly T[] {
  if (input === undefined) {
    return Object.freeze([]);
  }
  return parseArray(input, label, parseItem);
}



function executionEvidenceStatus(input: unknown, label: string) {
  return admitExactContractEnum({
    value: input,
    label,
    values: ["succeeded", "failed", "pending"] as const
  });
}



function admitWorkerExecutionShardEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionShardEvidence {
  const record = parseClosedRecord(input, label, [
    "kind",
    "shardId",
    "moduleName",
    "lane",
    "command",
    "status",
    "reportRefs",
    "testsObserved",
    "passedCount",
    "failedCount"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_execution_shard_evidence") {
    throw new TypeError(`${label}.kind: unexpected execution shard evidence kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_execution_shard_evidence" as const,
    shardId: parseNonEmptyString(record["shardId"], `${label}.shardId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    lane: parseEnumValue(record["lane"], `${label}.lane`, ["test"]),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    status: executionEvidenceStatus(record["status"], `${label}.status`),
    reportRefs: parseStringList(record["reportRefs"], `${label}.reportRefs`),
    testsObserved: parseNullableNonNegativeInteger(
      record["testsObserved"],
      `${label}.testsObserved`
    ),
    passedCount: parseNullableNonNegativeInteger(
      record["passedCount"],
      `${label}.passedCount`
    ),
    failedCount: parseNullableNonNegativeInteger(
      record["failedCount"],
      `${label}.failedCount`
    )
  });
}



function admitWorkerExecutionEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionEvidence {
  const record = parseClosedRecord(input, label, [
    "kind",
    "lane",
    "command",
    "status",
    "reportRefs",
    "testsObserved",
    "passedCount",
    "failedCount",
    "shardEvidence"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_worker_execution_evidence") {
    throw new TypeError(`${label}.kind: unexpected execution evidence kind`);
  }
  return Object.freeze({
    kind: "sdlc_worker_execution_evidence" as const,
    lane: parseEnumValue(record["lane"], `${label}.lane`, ["build", "test"]),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    status: executionEvidenceStatus(record["status"], `${label}.status`),
    reportRefs: parseStringList(record["reportRefs"], `${label}.reportRefs`),
    testsObserved: parseNullableNonNegativeInteger(
      record["testsObserved"],
      `${label}.testsObserved`
    ),
    passedCount: parseNullableNonNegativeInteger(
      record["passedCount"],
      `${label}.passedCount`
    ),
    failedCount: parseNullableNonNegativeInteger(
      record["failedCount"],
      `${label}.failedCount`
    ),
    shardEvidence: parseOptionalArray(
      record["shardEvidence"],
      `${label}.shardEvidence`,
      admitWorkerExecutionShardEvidence
    )
  });
}



function admitOptionalWorkerExecutionEvidence(
  input: unknown,
  label: string
): SdlcWorkerExecutionEvidence | null {
  if (input === undefined || input === null) {
    return null;
  }
  return admitWorkerExecutionEvidence(input, label);
}




const WORKER_AUTHORITY_READ_LOG_FILES = Object.freeze([
  "worker_stdout.log",
  "worker_process_events.jsonl"
] as const);



const WORKER_AUTHORITY_PATH_KEYS = new Set([
  "command",
  "cwd",
  "directory",
  "filepath",
  "filenames",
  "glob",
  "path",
  "paths",
  "pattern",
  "root",
  "workspaceroot"
]);



const WORKER_AUTHORITY_RUNTIME_METADATA_PATH_KEYS = new Set([
  "persistedoutputpath"
]);



interface WorkerAuthorityBoundaryViolation {
  readonly sourceFile: string;
  readonly fieldPath: string;
  readonly path: string;
  readonly violationClass: "outside_workspace" | "runtime_source";
}



interface WorkerAuthorityRuntimeMetadataContext {
  readonly executorSessionIds: ReadonlySet<string>;
}



function normalizedAuthorityPathKey(input: string): string {
  return input.replace(/[-_]/gu, "").toLowerCase();
}



function workerAuthorityPathKeyCarriesFilesystemRef(input: string): boolean {
  const normalized = normalizedAuthorityPathKey(input);
  if (WORKER_AUTHORITY_RUNTIME_METADATA_PATH_KEYS.has(normalized)) {
    return false;
  }
  return (
    WORKER_AUTHORITY_PATH_KEYS.has(normalized) ||
    normalized.endsWith("path") ||
    normalized.endsWith("paths")
  );
}



function trimmedFilesystemPathCandidate(input: string): string {
  return input.replace(/[),.;\]}]+$/u, "");
}



function looksLikeAnchoredFilesystemPath(input: string): boolean {
  return /^(?:\/Users|\/private|\/tmp|\/var|\/opt|\/Volumes|\/home)(?:\/|$)/u.test(
    input
  );
}



function normalizedWorkerRuntimePath(input: string): string {
  return resolve(input).split(path.sep).join("/");
}



function collectExecutorSessionIdsFromWorkerEvent(
  input: unknown,
  sessionIds: Set<string>
): void {
  if (Array.isArray(input)) {
    for (const item of input) {
      collectExecutorSessionIdsFromWorkerEvent(item, sessionIds);
    }
    return;
  }
  const record = objectRecord(input);
  if (record === null) {
    return;
  }
  for (const [key, value] of Object.entries(record)) {
    if (
      normalizedAuthorityPathKey(key) === "sessionid" &&
      typeof value === "string" &&
      value.length > 0
    ) {
      sessionIds.add(value);
    }
    collectExecutorSessionIdsFromWorkerEvent(value, sessionIds);
  }
}



function workerAuthorityRuntimeMetadataContextFromEvents(
  events: readonly unknown[]
): WorkerAuthorityRuntimeMetadataContext {
  const executorSessionIds = new Set<string>();
  for (const event of events) {
    collectExecutorSessionIdsFromWorkerEvent(event, executorSessionIds);
  }
  return Object.freeze({
    executorSessionIds
  });
}



function isWorkerRuntimeMetadataPath(input: {
  readonly candidate: string;
  readonly context: WorkerAuthorityRuntimeMetadataContext;
}): boolean {
  const normalized = normalizedWorkerRuntimePath(input.candidate);
  if (!normalized.includes("/tool-results/")) {
    return false;
  }
  for (const sessionId of input.context.executorSessionIds) {
    if (normalized.includes(`/${sessionId}/tool-results/`)) {
      return true;
    }
  }
  return false;
}



function isInstalledRuntimeSourcePath(input: {
  readonly candidate: string;
  readonly workspaceRoot: string;
}): boolean {
  if (!pathIsInside(input.candidate, input.workspaceRoot)) {
    return false;
  }
  const relativePath = relative(input.workspaceRoot, input.candidate)
    .split(path.sep)
    .join("/");
  return /^(?:\.abiogenesis|\.genesis)\/odd_sdlc\/[^/]+\/(?:package-extract|code\/src|build\/semantic\/code\/src)\//u.test(
    relativePath
  );
}



function candidateFilesystemPathsFromWorkerField(input: string): readonly string[] {
  const candidates = new Set<string>();
  const trimmed = trimmedFilesystemPathCandidate(input.trim());
  if (trimmed.startsWith("file://")) {
    try {
      candidates.add(resolve(fileURLToPath(trimmed)));
    } catch {
      // Ignore malformed file refs; postflight has separate admission checks.
    }
  }
  if (isAbsolute(trimmed) && looksLikeAnchoredFilesystemPath(trimmed)) {
    candidates.add(resolve(trimmed));
  }
  const fileUrlExpression = /file:\/\/[^\s"'`<>)]*/gu;
  for (const match of input.matchAll(fileUrlExpression)) {
    const candidate = trimmedFilesystemPathCandidate(match[0] ?? "");
    try {
      candidates.add(resolve(fileURLToPath(candidate)));
    } catch {
      // Ignore malformed file refs; postflight has separate admission checks.
    }
  }
  const absolutePathExpression =
    /(?:^|[\s"'`([{,=])((?:\/Users|\/private|\/tmp|\/var|\/opt|\/Volumes|\/home)\/[^\s"'`<>)]*)/gu;
  for (const match of input.matchAll(absolutePathExpression)) {
    const candidate = trimmedFilesystemPathCandidate(match[1] ?? "");
    if (isAbsolute(candidate)) {
      candidates.add(resolve(candidate));
    }
  }
  return Object.freeze([...candidates]);
}



function collectWorkerAuthorityPathViolations(input: {
  readonly value: unknown;
  readonly sourceFile: string;
  readonly fieldPath: string;
  readonly workspaceRoot: string;
  readonly pathKeyContext: boolean;
  readonly runtimeMetadataContext: WorkerAuthorityRuntimeMetadataContext;
  readonly violations: WorkerAuthorityBoundaryViolation[];
}): void {
  if (typeof input.value === "string") {
    if (!input.pathKeyContext) {
      return;
    }
    for (const candidate of candidateFilesystemPathsFromWorkerField(input.value)) {
      if (isInstalledRuntimeSourcePath({
        candidate,
        workspaceRoot: input.workspaceRoot
      })) {
        input.violations.push(
          Object.freeze({
            sourceFile: input.sourceFile,
            fieldPath: input.fieldPath,
            path: candidate,
            violationClass: "runtime_source" as const
          })
        );
        continue;
      }
      if (
        !pathIsInside(candidate, input.workspaceRoot) &&
        !isWorkerRuntimeMetadataPath({
          candidate,
          context: input.runtimeMetadataContext
        })
      ) {
        input.violations.push(
          Object.freeze({
            sourceFile: input.sourceFile,
            fieldPath: input.fieldPath,
            path: candidate,
            violationClass: "outside_workspace" as const
          })
        );
      }
    }
    return;
  }
  if (Array.isArray(input.value)) {
    input.value.forEach((item, index) =>
      collectWorkerAuthorityPathViolations({
        value: item,
        sourceFile: input.sourceFile,
        fieldPath: `${input.fieldPath}[${index}]`,
        workspaceRoot: input.workspaceRoot,
        pathKeyContext: input.pathKeyContext,
        runtimeMetadataContext: input.runtimeMetadataContext,
        violations: input.violations
      })
    );
    return;
  }
  const record = objectRecord(input.value);
  if (record === null) {
    return;
  }
  for (const [key, value] of Object.entries(record)) {
    collectWorkerAuthorityPathViolations({
      value,
      sourceFile: input.sourceFile,
      fieldPath: `${input.fieldPath}.${key}`,
      workspaceRoot: input.workspaceRoot,
      pathKeyContext:
        input.pathKeyContext ||
        workerAuthorityPathKeyCarriesFilesystemRef(key),
      runtimeMetadataContext: input.runtimeMetadataContext,
      violations: input.violations
    });
  }
}



function workerAuthorityPayloadsFromEvent(input: unknown): readonly {
  readonly fieldPath: string;
  readonly value: unknown;
}[] {
  const record = objectRecord(input);
  if (record === null) {
    return Object.freeze([]);
  }
  const payloads: { fieldPath: string; value: unknown }[] = [];
  if (record["tool_use_result"] !== undefined) {
    payloads.push({
      fieldPath: "tool_use_result",
      value: record["tool_use_result"]
    });
  }
  if (record["input"] !== undefined && record["type"] === "tool_use") {
    payloads.push({
      fieldPath: "input",
      value: record["input"]
    });
  }
  const message = objectRecord(record["message"]);
  const content = Array.isArray(message?.["content"])
    ? message["content"]
    : [];
  content.forEach((item, index) => {
    const itemRecord = objectRecord(item);
    if (itemRecord?.["type"] === "tool_use" && itemRecord["input"] !== undefined) {
      payloads.push({
        fieldPath: `message.content[${index}].input`,
        value: itemRecord["input"]
      });
    }
  });
  return Object.freeze(payloads);
}



export function evaluateWorkerAuthorityReadBoundary(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  const workspaceRoot = resolve(input.manifest.workspaceRoot);
  const violationsByKey = new Map<string, WorkerAuthorityBoundaryViolation>();
  const evidenceRefs = new Set<string>();
  for (const fileName of WORKER_AUTHORITY_READ_LOG_FILES) {
    const logFile = join(input.manifest.archiveRoot, fileName);
    if (!existsSync(logFile) || !statSync(logFile).isFile()) {
      continue;
    }
    evidenceRefs.add(pathToFileURL(logFile).href);
    const lines = readFileSync(logFile, "utf8").split(/\r?\n/u);
    const parsedEvents: { readonly lineIndex: number; readonly value: unknown }[] = [];
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        return;
      }
      const parsed = parseJsonCandidate(trimmed);
      if (!parsed.ok) {
        return;
      }
      parsedEvents.push({ lineIndex, value: parsed.value });
    });
    const runtimeMetadataContext = workerAuthorityRuntimeMetadataContextFromEvents(
      parsedEvents.map((event) => event.value)
    );
    for (const parsedEvent of parsedEvents) {
      for (const payload of workerAuthorityPayloadsFromEvent(parsedEvent.value)) {
        const violations: WorkerAuthorityBoundaryViolation[] = [];
        collectWorkerAuthorityPathViolations({
          value: payload.value,
          sourceFile: logFile,
          fieldPath: `${fileName}:${parsedEvent.lineIndex + 1}.${payload.fieldPath}`,
          workspaceRoot,
          pathKeyContext: false,
          runtimeMetadataContext,
          violations
        });
        for (const violation of violations) {
          violationsByKey.set(
            `${violation.sourceFile}\n${violation.fieldPath}\n${violation.path}`,
            violation
          );
        }
      }
    }
  }
  const violations = [...violationsByKey.values()];
  if (violations.length === 0) {
    return;
  }
  const pushReason = (
    code: "worker_authority_read_outside_workspace" | "worker_runtime_source_read",
    selected: readonly WorkerAuthorityBoundaryViolation[]
  ) => {
    if (selected.length === 0) {
      return;
    }
    const displayed = selected
      .slice(0, 5)
      .map((violation) => `${violation.fieldPath}=${violation.path}`);
    const omitted = selected.length - displayed.length;
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code,
        detail: omitted > 0
          ? `${displayed.join("; ")}; omitted=${omitted}`
          : displayed.join("; "),
        evidenceRefs: Object.freeze([...evidenceRefs])
      })
    );
  };
  pushReason(
    "worker_authority_read_outside_workspace",
    violations.filter((violation) => violation.violationClass === "outside_workspace")
  );
  pushReason(
    "worker_runtime_source_read",
    violations.filter((violation) => violation.violationClass === "runtime_source")
  );
}



function filePathFromEvidenceRef(ref: string): string | null {
  if (ref.startsWith("file://")) {
    try {
      return fileURLToPath(ref);
    } catch {
      return null;
    }
  }
  return isAbsolute(ref) ? ref : null;
}



function isSdlcWorkerHandoffManifest(
  value: unknown
): value is SdlcWorkerHandoffManifest {
  const record = objectRecord(value);
  return (
    record !== null &&
    record["kind"] === "sdlc_worker_handoff_manifest" &&
    typeof record["reportFile"] === "string" &&
    typeof record["targetAssetType"] === "string" &&
    objectRecord(record["productMaterialization"]) !== null
  );
}



function readArchivedWorkerHandoffManifestForReport(input: {
  readonly reportFile: string;
  readonly label: string;
}): SdlcWorkerHandoffManifest {
  const manifestPath = join(dirname(input.reportFile), "handoff_manifest.json");
  if (!existsSync(manifestPath) || !statSync(manifestPath).isFile()) {
    throw new TypeError(`${input.label}.handoffManifest: missing sibling handoff_manifest.json`);
  }
  const parsed = parseJsonCandidate(readFileSync(manifestPath, "utf8"));
  if (!parsed.ok) {
    throw new TypeError(`${input.label}.handoffManifest: invalid JSON`);
  }
  const record = objectRecord(parsed.value);
  if (record === null) {
    throw new TypeError(`${input.label}.handoffManifest: expected object`);
  }
  if (!isSdlcWorkerHandoffManifest(parsed.value)) {
    throw new TypeError(
      `${input.label}.handoffManifest: expected sdlc worker handoff manifest shape`
    );
  }
  const kind = parseNonEmptyString(
    record["kind"],
    `${input.label}.handoffManifest.kind`
  );
  if (kind !== "sdlc_worker_handoff_manifest") {
    throw new TypeError(
      `${input.label}.handoffManifest.kind: expected sdlc_worker_handoff_manifest`
    );
  }
  const reportFile = parseNonEmptyString(
    record["reportFile"],
    `${input.label}.handoffManifest.reportFile`
  );
  if (resolve(reportFile) !== resolve(input.reportFile)) {
    throw new TypeError(
      `${input.label}.handoffManifest.reportFile: expected same-archive worker_result_report.json`
    );
  }
  return parsed.value;
}



function readExecutionResultEvidenceFromReportRef(ref: string): {
  readonly executionEvidence: SdlcWorkerExecutionEvidence | null;
  readonly sourceManifest: SdlcWorkerHandoffManifest | null;
  readonly error: string | null;
} {
  const filePath = filePathFromEvidenceRef(ref);
  if (filePath === null || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return Object.freeze({
      executionEvidence: null,
      sourceManifest: null,
      error: "not a readable file evidence ref"
    });
  }
  try {
    const record = readArchivedWorkerResultReportRecord({
      filePath,
      label: "SourceWorkerResultReport"
    });
    const targetAssetType = parseNonEmptyString(
      record["targetAssetType"],
      "SourceWorkerResultReport.targetAssetType"
    );
    if (targetAssetType !== "test_execution_result_surface") {
      return Object.freeze({
        executionEvidence: null,
        sourceManifest: null,
        error: `unexpected source target ${targetAssetType}`
      });
    }
    const sourceManifest = readArchivedWorkerHandoffManifestForReport({
      reportFile: filePath,
      label: "SourceWorkerResultReport"
    });
    if (sourceManifest.targetAssetType !== "test_execution_result_surface") {
      return Object.freeze({
        executionEvidence: null,
        sourceManifest: null,
        error: `source manifest target mismatch ${sourceManifest.targetAssetType}`
      });
    }
    const executionEvidence = admitOptionalWorkerExecutionEvidence(
      record["executionEvidence"],
      "SourceWorkerResultReport.executionEvidence"
    );
    if (executionEvidence === null) {
      const executionEvidenceErrors = parseStringList(
        record["executionEvidenceErrors"] ?? [],
        "SourceWorkerResultReport.executionEvidenceErrors"
      );
      const outputFile = parseNonEmptyString(
        record["outputFile"],
        "SourceWorkerResultReport.outputFile"
      );
      let outputArtifactError: string | null = null;
      if (
        resolve(outputFile) === resolve(sourceManifest.outputFile) &&
        existsSync(outputFile) &&
        statSync(outputFile).isFile()
      ) {
        try {
          return Object.freeze({
            executionEvidence: admitWorkerExecutionEvidence(
              JSON.parse(readFileSync(outputFile, "utf8")),
              "SourceWorkerResultReport.outputFile.executionEvidence"
            ),
            sourceManifest,
            error: null
          });
        } catch (error) {
          outputArtifactError = error instanceof Error ? error.message : String(error);
        }
      }
      return Object.freeze({
        executionEvidence: null,
        sourceManifest: null,
        error: executionEvidenceErrors.length > 0
          ? `execution evidence invalid: ${executionEvidenceErrors.join("; ")}`
          : outputArtifactError !== null
            ? `execution evidence output invalid: ${outputArtifactError}`
          : "execution evidence missing"
      });
    }
    return Object.freeze({ executionEvidence, sourceManifest, error: null });
  } catch (error) {
    return Object.freeze({
      executionEvidence: null,
      sourceManifest: null,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}



function archiveSourceExecutionResultDependencyError(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly evidenceRefs: readonly string[];
}): string | null {
  const attempts: string[] = [];
  for (const ref of input.evidenceRefs) {
    const readResult = readExecutionResultEvidenceFromReportRef(ref);
    if (readResult.executionEvidence === null) {
      if (readResult.error !== null) {
        attempts.push(`${ref}: ${readResult.error}`);
      }
      continue;
    }
    const executionEvidence = readResult.executionEvidence;
    const sourceManifest = readResult.sourceManifest;
    if (sourceManifest === null) {
      attempts.push(`${ref}: source handoff manifest missing`);
      continue;
    }
    const blockers: SdlcBlockingReason[] = [];
    const evidenceRefs: string[] = [];
    if (executionEvidence.lane !== "test") {
      blockers.push(
        makeSdlcBlockingReason({
          code: "test_execution_lane_mismatch",
          detail: executionEvidence.lane,
          evidenceRefs: executionEvidence.reportRefs
        })
      );
    }
    if (
      !executionCommandMatchesContract({
        manifest: sourceManifest,
        command: executionEvidence.command
      })
    ) {
      blockers.push(
        makeSdlcBlockingReason({
          code: "test_execution_command_mismatch",
          detail: executionEvidence.command,
          evidenceRefs: executionEvidence.reportRefs
        })
      );
    }
    if (executionEvidence.status === "pending") {
      blockers.push(
        makeSdlcBlockingReason({
          code: "test_execution_not_succeeded",
          detail: executionEvidence.status,
          evidenceRefs: executionEvidence.reportRefs
        })
      );
    }
    if (
      executionEvidence.status !== "failed" &&
      (executionEvidence.testsObserved ?? 0) <= 0
    ) {
      blockers.push(
        makeSdlcBlockingReason({
          code: "test_execution_zero_tests_observed",
          evidenceRefs: executionEvidence.reportRefs
        })
      );
    }
    if (executionEvidence.reportRefs.length === 0) {
      blockers.push(
        makeSdlcBlockingReason({
          code: "test_execution_report_refs_missing",
          evidenceRefs: [ref]
        })
      );
    }
    evaluateExecutionShardEvidence({
      manifest: sourceManifest,
      executionEvidence,
      blockingReasonCarriers: blockers,
      evidenceRefs
    });
    if (blockers.length === 0) {
      return null;
    }
    attempts.push(
      `${ref}: ${blockers.map((blocker) =>
        blocker.detail === null ? blocker.code : `${blocker.code}:${blocker.detail}`
      ).join(", ")}`
    );
  }
  const detail = attempts.length > 0 ? attempts.join("; ") : "no evidence refs";
  return `admitted execution-result report missing or invalid: ${detail}`;
}



function normalizedRelativePath(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}



function isLikelyDesignMaterialization(input: {
  readonly relativePath: string;
  readonly absolutePath: string;
}): boolean {
  const normalized = normalizedRelativePath(input.relativePath).toLowerCase();
  if (
    normalized === "design" ||
    (!normalized.startsWith("design/") && !normalized.startsWith("design\\"))
  ) {
    return false;
  }
  if (!/\.(?:md|markdown|json|ya?ml)$/u.test(normalized)) {
    return false;
  }
  const content = textIfFile(input.absolutePath);
  return content !== null && content.trim().length > 0;
}



function manifestRequiresStagedAuthority(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly authorityRef: string;
}): boolean {
  return (
    input.manifest.targetCarrierProjection?.requiredStagedAuthorityRefs.includes(
      input.authorityRef
    ) ?? false
  );
}



function stagedSurfaceEvidenceRefs(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly targetAssetType: string;
}): readonly string[] {
  const outputFile = componentDepthSurfaceFile(
    input.manifest,
    input.targetAssetType
  );
  return Object.freeze(
    outputFile === null
      ? [pathToFileURL(input.manifest.workspaceRoot).href]
      : [pathToFileURL(outputFile).href]
  );
}

function stagedParallelTraversalSelectedMethodCarrier(
  evidenceRefs: readonly string[]
) {
  return admitSdlcDependencyTraversalSelectedMethodCarrier({
    selectedMethod: "parallel",
    evidenceRefs: Object.freeze([
      "selection-policy://odd-sdlc/staged-topology/parallel",
      ...evidenceRefs
    ])
  });
}



function manifestCapabilityValue(
  manifest: SdlcWorkerHandoffManifest,
  name: string
): string | null {
  return (
    manifest.conformedProject.capabilityContracts?.find(
      (contract) => contract.name === name
    )?.value ?? null
  );
}



function truthyCapabilityValue(value: string | null): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}



function manifestRequiresTrivialDegenerateProduct(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return truthyCapabilityValue(manifestCapabilityValue(manifest, "trivial_product"));
}



function pushStagedTopologyBlockingReason(input: {
  readonly blockingReasonCarriers: SdlcBlockingReason[];
  readonly code: SdlcBlockingReasonCode;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}): void {
  input.blockingReasonCarriers.push(
    makeSdlcBlockingReason({
      code: input.code,
      detail: input.detail,
      evidenceRefs: input.evidenceRefs
    })
  );
}



function stagedSummaryRefs(refs: readonly string[]): string {
  return refs.length === 0 ? "none" : refs.join("|");
}



function stagedSummaryRowCountDetail(
  summary: SdlcDecompositionSummary,
  downstreamId: string
): string {
  const row = summary.rows.find((candidate) => candidate.downstreamId === downstreamId);
  if (row === undefined) {
    return `${downstreamId}:ownedUpstreamCount=unknown`;
  }
  return [
    `${downstreamId}:ownedUpstreamCount=${row.ownedUpstreamCount}`,
    `maxOwnedUpstreamPerDownstream=${summary.maxOwnedUpstreamPerDownstream}`,
    `ownedUpstreamRefs=${stagedSummaryRefs(row.ownedUpstreamRefs)}`
  ].join(" ");
}



function stagedDecompositionBlockingDetail(
  summary: SdlcDecompositionSummary
): string {
  const details = [...summary.blockingReasons];
  if (summary.overloadedDownstreamIds.length > 0) {
    details.push(
      `overloadedDownstreamRows=${summary.overloadedDownstreamIds
        .map((downstreamId) => stagedSummaryRowCountDetail(summary, downstreamId))
        .join("; ")}`
    );
  }
  if (
    summary.blockingReasons.includes(
      "decomposition_compression_ratio_exceeds_threshold"
    )
  ) {
    details.push(
      `upstreamPerDownstreamRatio=${summary.upstreamPerDownstreamRatio}`,
      `maxUpstreamPerDownstreamRatio=${summary.maxUpstreamPerDownstreamRatio}`
    );
  }
  if (summary.explosionUpstreamRefs.length > 0) {
    details.push(
      `explosionUpstreamRefs=${stagedSummaryRefs(summary.explosionUpstreamRefs)}`,
      `maxDownstreamPerUpstream=${summary.maxDownstreamPerUpstream}`
    );
  }
  if (summary.unownedDownstreamIds.length > 0) {
    details.push(
      `unownedDownstreamRows=${stagedSummaryRefs(summary.unownedDownstreamIds)}`
    );
  }
  if (summary.facadeDownstreamIds.length > 0) {
    details.push(
      `facadeDownstreamRows=${stagedSummaryRefs(summary.facadeDownstreamIds)}`
    );
  }
  if (summary.underDecomposedParentIds.length > 0) {
    details.push(
      `underDecomposedParentRows=${stagedSummaryRefs(summary.underDecomposedParentIds)}`
    );
  }
  if (summary.residualOutsideSubsurfaceRefs.length > 0) {
    details.push(
      `residualOutsideSubsurfaceRefs=${stagedSummaryRefs(summary.residualOutsideSubsurfaceRefs)}`
    );
  }
  if (summary.invalidReferenceFields.length > 0) {
    details.push(
      `invalidReferenceFields=${stagedSummaryRefs(summary.invalidReferenceFields)}`
    );
  }
  return details.join("; ");
}



function evaluateImplementationDesignProducerAuthority(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
  readonly fpEvaluatorAdmissionEvidenceRefs: readonly string[];
}): void {
  if (input.manifest.targetAssetType !== "implementation_design_surface") {
    return;
  }
  const evidenceRefs = stagedSurfaceEvidenceRefs({
    manifest: input.manifest,
    targetAssetType: "implementation_design_surface"
  });
  const outputFile = componentDepthSurfaceFile(
    input.manifest,
    "implementation_design_surface"
  );
  if (outputFile === null || !existsSync(outputFile)) {
    pushStagedTopologyBlockingReason({
      blockingReasonCarriers: input.blockingReasonCarriers,
      code: "staged_authority_missing",
      detail: "implementation_design_surface",
      evidenceRefs
    });
    return;
  }
  const admission =
    input.fpEvaluatorAdmissionEvidenceRefs.length > 0
      ? admitImplementationDesignRegisterForRuntimeEvaluation({
          manifest: input.manifest,
          fpEvaluatorAdmissionEvidenceRefs: input.fpEvaluatorAdmissionEvidenceRefs
        })
      : admitImplementationDesignRegisterForManifest({
          manifest: input.manifest
        });
  if (admission.status !== "admitted" || admission.register === null) {
    pushStagedTopologyBlockingReason({
      blockingReasonCarriers: input.blockingReasonCarriers,
      code: "staged_authority_admission_invalid",
      detail:
        admission.blockingReasons.length === 0
          ? "implementation_design_surface_admission_rejected"
          : admission.blockingReasons.join("; "),
      evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs])
    });
    return;
  }
  const register = admission.register;
  const authority = deriveSdlcStagedImplementationTopologyAuthority({
    register,
    requireTrivialDegenerateProduct:
      manifestRequiresTrivialDegenerateProduct(input.manifest)
  });
  if (authority.summary.admissionDecision === "reject") {
    pushStagedTopologyBlockingReason({
      blockingReasonCarriers: input.blockingReasonCarriers,
      code: "staged_decomposition_rejected",
      detail: stagedDecompositionBlockingDetail(authority.summary),
      evidenceRefs: [
        ...evidenceRefs,
        "surface://implementation-decomposition-summary"
      ]
    });
  }
}



function evaluateTestDesignProducerAuthority(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  if (input.manifest.targetAssetType !== "test_design_surface") {
    return;
  }
  const evidenceRefs = stagedSurfaceEvidenceRefs({
    manifest: input.manifest,
    targetAssetType: "test_design_surface"
  });
  const outputFile = componentDepthSurfaceFile(
    input.manifest,
    "test_design_surface"
  );
  if (outputFile === null || !existsSync(outputFile)) {
    pushStagedTopologyBlockingReason({
      blockingReasonCarriers: input.blockingReasonCarriers,
      code: "staged_authority_missing",
      detail: "test_design_surface",
      evidenceRefs
    });
    return;
  }
  const admission = admitTestDesignRegisterFromArtifact({
    targetAssetType: "test_design_surface",
    outputFile
  });
  if (admission.status !== "admitted" || admission.register === null) {
    pushStagedTopologyBlockingReason({
      blockingReasonCarriers: input.blockingReasonCarriers,
      code: "staged_authority_admission_invalid",
      detail:
        admission.blockingReasons.length === 0
          ? "test_design_surface_admission_rejected"
          : admission.blockingReasons.join("; "),
      evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs])
    });
    return;
  }
  const register = admission.register;
  const authority = deriveSdlcStagedTestTopologyAuthority({
    register,
    requireTrivialDegenerateProduct:
      manifestRequiresTrivialDegenerateProduct(input.manifest)
  });
  if (authority.summary.admissionDecision === "reject") {
    pushStagedTopologyBlockingReason({
      blockingReasonCarriers: input.blockingReasonCarriers,
      code: "staged_decomposition_rejected",
      detail: stagedDecompositionBlockingDetail(authority.summary),
      evidenceRefs: [...evidenceRefs, "surface://test-decomposition-summary"]
    });
  }
}



export function evaluateStagedConstructionAuthority(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
  readonly fpEvaluatorAdmissionEvidenceRefs: readonly string[];
}): void {
  evaluateImplementationDesignProducerAuthority(input);
  evaluateTestDesignProducerAuthority(input);
  if (
    input.manifest.targetAssetType === "component_code_surface" &&
    manifestRequiresStagedAuthority({
      manifest: input.manifest,
      authorityRef: "surface://implementation-decomposition-summary"
    })
  ) {
    const evidenceRefs = stagedSurfaceEvidenceRefs({
      manifest: input.manifest,
      targetAssetType: "implementation_design_surface"
    });
    const register = readAdmittedImplementationDesign(
      input.manifest,
      input.fpEvaluatorAdmissionEvidenceRefs
    );
    if (register === null) {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_authority_missing",
        detail: "implementation_design_surface",
        evidenceRefs
      });
      return;
    }
    const authority = deriveSdlcStagedImplementationTopologyAuthority({
      register,
      requireTrivialDegenerateProduct:
        manifestRequiresTrivialDegenerateProduct(input.manifest)
    });
    if (authority.summary.admissionDecision === "reject") {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_decomposition_rejected",
        detail: stagedDecompositionBlockingDetail(authority.summary),
        evidenceRefs: [
          ...evidenceRefs,
          "surface://implementation-decomposition-summary"
        ]
      });
    }
    if (authority.dependencyMap.nodes.length === 0) {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_dependency_map_missing",
        detail: "module-dependency-map",
        evidenceRefs: [...evidenceRefs, "surface://module-dependency-map"]
      });
      return;
    }
    const traversal = selectSdlcDependencyMapTraversal({
      selectionRef: "selection://odd-sdlc/component-code/staged-topology",
      dependencyMap: authority.dependencyMap,
      selectedMethodCarrier: stagedParallelTraversalSelectedMethodCarrier(
        Object.freeze([
          ...evidenceRefs,
          "surface://implementation-decomposition-summary",
          "surface://module-dependency-map"
        ])
      ),
      policy: "parallel_when_partitioned",
      basisRefs: evidenceRefs
    });
    if (traversal.selectedMethod === "blocked") {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_dependency_traversal_blocked",
        detail: traversal.blockingReasons.join(", "),
        evidenceRefs: [
          ...evidenceRefs,
          "surface://module-dependency-map",
          traversal.selectionRef
        ]
      });
    }
    return;
  }
  if (
    (input.manifest.targetAssetType === "component_test_surface" ||
      input.manifest.targetAssetType === "uat_test_source_surface") &&
    manifestRequiresStagedAuthority({
      manifest: input.manifest,
      authorityRef: "surface://test-decomposition-summary"
    })
  ) {
    const evidenceRefs = stagedSurfaceEvidenceRefs({
      manifest: input.manifest,
      targetAssetType: "test_design_surface"
    });
    const register = readAdmittedTestDesign(input.manifest);
    if (register === null) {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_authority_missing",
        detail: "test_design_surface",
        evidenceRefs
      });
      return;
    }
    const authority = deriveSdlcStagedTestTopologyAuthority({
      register,
      requireTrivialDegenerateProduct:
        manifestRequiresTrivialDegenerateProduct(input.manifest)
    });
    if (authority.summary.admissionDecision === "reject") {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_decomposition_rejected",
        detail: stagedDecompositionBlockingDetail(authority.summary),
        evidenceRefs: [...evidenceRefs, "surface://test-decomposition-summary"]
      });
    }
    if (authority.dependencyMap.nodes.length === 0) {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_dependency_map_missing",
        detail: "test-dependency-map",
        evidenceRefs: [...evidenceRefs, "surface://test-dependency-map"]
      });
      return;
    }
    const traversal = selectSdlcDependencyMapTraversal({
      selectionRef: "selection://odd-sdlc/component-test/staged-topology",
      dependencyMap: authority.dependencyMap,
      selectedMethodCarrier: stagedParallelTraversalSelectedMethodCarrier(
        Object.freeze([
          ...evidenceRefs,
          "surface://test-decomposition-summary",
          "surface://test-dependency-map"
        ])
      ),
      policy: "parallel_when_partitioned",
      basisRefs: evidenceRefs
    });
    if (traversal.selectedMethod === "blocked") {
      pushStagedTopologyBlockingReason({
        blockingReasonCarriers: input.blockingReasonCarriers,
        code: "staged_dependency_traversal_blocked",
        detail: traversal.blockingReasons.join(", "),
        evidenceRefs: [
          ...evidenceRefs,
          "surface://test-dependency-map",
          traversal.selectionRef
        ]
      });
    }
  }
}



function targetContractForMaterializedFile(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): SdlcProductMaterializationAuthorityTarget | null {
  const normalized = input.relativePath.split(path.sep).join("/");
  const authority = reconcileSdlcProductMaterializationAuthority(input.manifest);
  return (
    authority.declaredProductTargetContracts.find((candidate) =>
      productAuthorityTargetCoversRelativePath({
        manifest: input.manifest,
        target: candidate,
        normalizedRelativePath: normalized
      })
    ) ?? null
  );
}



function isAdmissibleAuxiliaryBuildConfig(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
}): boolean {
  return (
    input.file.role === "build_config" &&
    declaredBuildConfigRoleForObservedFile({
      manifest: input.manifest,
      normalizedRelativePath: normalizedRelativePath(input.file.relativePath)
    }) === "build_config"
  );
}



function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}



interface ParsedJsonCandidate {
  readonly ok: boolean;
  readonly value: unknown;
}



function parseJsonCandidate(input: string): ParsedJsonCandidate {
  try {
    const parsed: unknown = JSON.parse(input);
    return Object.freeze({ ok: true, value: parsed });
  } catch {
    return Object.freeze({ ok: false, value: null });
  }
}



function componentDepthSurfaceFile(
  manifest: SdlcWorkerHandoffManifest,
  targetAssetType: string
): string | null {
  const relativePath = tenantLocalSdlcSurfaceRelativePath(targetAssetType);
  if (relativePath === null) {
    return null;
  }
  return join(manifest.productMaterialization.tenantRoot, relativePath);
}



function readAdmittedImplementationDesign(
  manifest: SdlcWorkerHandoffManifest,
  fpEvaluatorAdmissionEvidenceRefs: readonly string[] = Object.freeze([])
): SdlcDesignDepthRegister | null {
  const admission =
    fpEvaluatorAdmissionEvidenceRefs.length > 0
      ? admitImplementationDesignRegisterForRuntimeEvaluation({
          manifest,
          fpEvaluatorAdmissionEvidenceRefs
        })
      : admitImplementationDesignRegisterForManifest({
          manifest
        });
  return admission.status === "admitted" ? admission.register : null;
}



function readAdmittedTestDesign(
  manifest: SdlcWorkerHandoffManifest
): SdlcTestDesignRegister | null {
  const outputFile = componentDepthSurfaceFile(manifest, "test_design_surface");
  if (outputFile === null || !existsSync(outputFile)) {
    return null;
  }
  const admission = admitTestDesignRegisterFromArtifact({
    targetAssetType: "test_design_surface",
    outputFile
  });
  return admission.status === "admitted" ? admission.register : null;
}



function latestAdmittedTestExecutionSurfaceRegister(
  manifest: SdlcWorkerHandoffManifest
): SdlcTestExecutionSurfaceRegister | null {
  const operatorRunsRoot = join(
    manifest.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(manifest.workspaceRoot)
      .runtimeLayout.operatorRunRoot
  );
  if (!existsSync(operatorRunsRoot) || !statSync(operatorRunsRoot).isDirectory()) {
    return null;
  }
  const reports: { readonly filePath: string; readonly mtimeMs: number }[] = [];
  for (const runId of readdirSync(operatorRunsRoot)) {
    const filePath = join(operatorRunsRoot, runId, "worker_result_report.json");
    if (
      resolve(filePath) === resolve(manifest.reportFile) ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      continue;
    }
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath,
        label: "PriorTestExecutionSurfaceReport"
      });
      if (record["targetAssetType"] === "test_execution_surface") {
        reports.push(Object.freeze({ filePath, mtimeMs: statSync(filePath).mtimeMs }));
      }
    } catch {
      continue;
    }
  }
  for (const report of reports.sort((left, right) => right.mtimeMs - left.mtimeMs)) {
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath: report.filePath,
        label: "PriorTestExecutionSurfaceReport"
      });
      const outputFile = parseNonEmptyString(
        record["outputFile"],
        "PriorTestExecutionSurfaceReport.outputFile"
      );
      const admission = admitTestExecutionSurfaceRegisterFromArtifact({
        targetAssetType: "test_execution_surface",
        outputFile
      });
      if (admission.status === "admitted") {
        return admission.register;
      }
    } catch {
      continue;
    }
  }
  return null;
}



function resolvePreparedExecutionWorkingDirectory(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly workingDirectory: string;
}): string {
  if (isAbsolute(input.workingDirectory)) {
    return input.workingDirectory;
  }
  return resolve(input.manifest.workspaceRoot, input.workingDirectory);
}



function installedOperatorExecutionShards(
  manifest: SdlcWorkerHandoffManifest
): SdlcProductMaterializationContract["executionShards"] {
  if (manifest.targetAssetType !== "test_execution_result_surface") {
    return manifest.productMaterialization.executionShards;
  }
  const register = latestAdmittedTestExecutionSurfaceRegister(manifest);
  const preparedRows =
    register?.testExecutionPreparationRows.filter((row) => row.status === "prepared") ??
    Object.freeze([]);
  if (preparedRows.length === 0) {
    return manifest.productMaterialization.executionShards;
  }
  const runtimePolicy = sdlcOperatorRuntimePolicy();
  return Object.freeze(
    preparedRows.map((row, index) =>
      Object.freeze({
        kind: "sdlc_execution_shard" as const,
        shardId:
          row.shardId ??
          `test-shard-${String(index + 1).padStart(2, "0")}-${shardIdPart(row.moduleName)}`,
        lane: "test" as const,
        moduleName: row.moduleName,
        command: row.command,
        workingDirectory: resolvePreparedExecutionWorkingDirectory({
          manifest,
          workingDirectory: row.workingDirectory
        }),
        timeoutMs: runtimePolicy.executionShardTimeoutMs,
        inactivityTimeoutMs: runtimePolicy.executionShardInactivityTimeoutMs,
        expectedReportRefs: Object.freeze([row.scheduleRef]),
        allowedByproductGlobs: Object.freeze([
          ...allowedExecutionByproductGlobsForManifest(manifest)
        ]),
        requiredEvidenceKind: "sdlc_worker_execution_evidence" as const,
        retryPolicy: "same_shard_then_triage" as const
      })
    )
  );
}



function requirementIdForObligation(obligationId: string): string | null {
  if (!obligationId.startsWith("requirement:")) {
    return null;
  }
  const rawRef = obligationId.slice("requirement:".length);
  return /^(?:REQ|RF|R)-/iu.test(rawRef) ? normalizeRequirementId(rawRef) : rawRef;
}



function displayIdForRequirementObligation(
  obligation: SdlcTraversalObligation
): string | null {
  const concreteMatch = /^Fulfill ([^:]+):/u.exec(obligation.summary);
  if (concreteMatch?.[1] !== undefined) {
    return normalizeRequirementId(concreteMatch[1]);
  }
  const referenceMatch = /^Fulfill live requirement ([^.]+)\./u.exec(
    obligation.summary
  );
  if (referenceMatch?.[1] !== undefined) {
    return normalizeRequirementId(referenceMatch[1]);
  }
  return null;
}



function requirementLineageAuthorityRank(obligation: SdlcTraversalObligation): number {
  const refs = obligation.payload.sourceRefs;
  if (
    refs.some(
      (ref) =>
        ref.includes("/specification/requirements/") &&
        !ref.endsWith("/specification/requirements/README.md") &&
        !ref.endsWith("/specification/requirements/00-imported-sources.md")
    )
  ) {
    return 0;
  }
  if (
    refs.some(
      (ref) =>
        ref.endsWith("/specification/REQUIREMENTS.md")
    )
  ) {
    return 1;
  }
  if (
    refs.some((ref) =>
      ref.endsWith("/specification/requirements/00-imported-sources.md")
    )
  ) {
    return 2;
  }
  if (refs.some((ref) => ref.endsWith("/README.md"))) {
    return 4;
  }
  return 3;
}



function canonicalRequirementTraceObligationsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcTraversalObligation[] {
  const byDisplayId = new Map<string, SdlcTraversalObligation>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    const existing = byDisplayId.get(displayId);
    if (
      existing === undefined ||
      requirementLineageAuthorityRank(obligation) <
        requirementLineageAuthorityRank(existing) ||
      (requirementLineageAuthorityRank(obligation) ===
        requirementLineageAuthorityRank(existing) &&
        obligation.obligationId.localeCompare(existing.obligationId) < 0)
    ) {
      byDisplayId.set(displayId, obligation);
    }
  }
  return Object.freeze([...byDisplayId.values()]);
}



function canonicalRequirementLineageMap(
  manifest: SdlcWorkerHandoffManifest
): ReadonlyMap<string, string> {
  const canonicalByDisplayId = new Map<string, string>();
  for (const obligation of canonicalRequirementTraceObligationsForPrompt(manifest)) {
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    canonicalByDisplayId.set(displayId, obligation.obligationId);
  }
  const byObligationId = new Map<string, string>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    const canonicalId = canonicalByDisplayId.get(displayId);
    if (canonicalId !== undefined) {
      byObligationId.set(obligation.obligationId, canonicalId);
    }
  }
  return byObligationId;
}



function equivalentRequirementLineageIdsByCanonical(
  manifest: SdlcWorkerHandoffManifest
): ReadonlyMap<string, readonly string[]> {
  const canonicalByObligationId = canonicalRequirementLineageMap(manifest);
  const byCanonical = new Map<string, Set<string>>();
  for (const [obligationId, canonicalId] of canonicalByObligationId.entries()) {
    const existing = byCanonical.get(canonicalId) ?? new Set<string>();
    existing.add(obligationId);
    byCanonical.set(canonicalId, existing);
  }
  return new Map(
    [...byCanonical.entries()].map(([canonicalId, equivalentIds]) => [
      canonicalId,
      uniqueSorted([...equivalentIds])
    ])
  );
}



function canonicalizeRequirementLineageIds(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly obligationIds: readonly string[];
}): readonly string[] {
  const canonicalByObligationId = canonicalRequirementLineageMap(input.manifest);
  return uniqueSorted(
    input.obligationIds.map(
      (obligationId) => canonicalByObligationId.get(obligationId) ?? obligationId
    )
  );
}



function observedRequirementIds(input: {
  readonly outputFile: string;
  readonly materializedFiles: readonly SdlcMaterializedProductFile[];
}): ReadonlySet<string> {
  const ids = new Set<string>();
  const candidatePaths = [
    input.outputFile,
    ...input.materializedFiles.map((file) => file.absolutePath)
  ];
  for (const filePath of candidatePaths) {
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      continue;
    }
    const content = readFileSync(filePath, "utf8");
    for (const marker of content.match(REQUIREMENT_MARKER_EXPRESSION) ?? []) {
      if (isPlaceholderRequirementMarker(marker)) {
        continue;
      }
      ids.add(normalizeRequirementId(marker));
    }
  }
  return ids;
}



function requirementDisplayIdByObligationId(
  manifest: SdlcWorkerHandoffManifest
): ReadonlyMap<string, string> {
  const byObligationId = new Map<string, string>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId = displayIdForRequirementObligation(obligation);
    if (displayId !== null) {
      byObligationId.set(obligation.obligationId, displayId);
    }
  }
  return byObligationId;
}



function contentCarriesRequirementObligation(input: {
  readonly content: string;
  readonly obligationId: string;
  readonly displayId: string | null;
}): boolean {
  if (input.content.includes(input.obligationId)) {
    return true;
  }
  if (input.obligationId.startsWith("requirement:")) {
    const authorityRef = input.obligationId.slice("requirement:".length);
    if (authorityRef.length > 0 && input.content.includes(authorityRef)) {
      return true;
    }
  }
  if (input.displayId === null) {
    return false;
  }
  const normalizedDisplayId = normalizeRequirementId(input.displayId);
  return (input.content.match(REQUIREMENT_MARKER_EXPRESSION) ?? []).some((marker) => {
    if (isPlaceholderRequirementMarker(marker)) {
      return false;
    }
    return normalizeRequirementId(marker) === normalizedDisplayId;
  });
}



function productMaterializationRequirementLineageRequired(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return (
    manifest.productMaterialization.required &&
    requirementTraceObligationIdsForPrompt(manifest).length > 0 &&
    (manifest.targetAssetType === "component_code_surface" ||
      manifest.targetAssetType === "component_test_surface" ||
      manifest.targetAssetType === "uat_test_source_surface" ||
      manifest.targetAssetType === "code_surface")
  );
}



function materializedFileRequiresRequirementLineage(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
  readonly requiredProductRoles: ReadonlySet<SdlcMaterializedProductFileRole>;
}): boolean {
  if (!productMaterializationRequirementLineageRequired(input.manifest)) {
    return false;
  }
  if (!input.requiredProductRoles.has(input.file.role)) {
    return false;
  }
  if (
    isAdmissibleAuxiliaryBuildConfig({
      manifest: input.manifest,
      file: input.file
    })
  ) {
    return false;
  }
  return true;
}



function materializedFileLineageCanBeCarrierOnly(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
}): boolean {
  if (input.file.role !== "build_config") {
    return false;
  }
  return (
    targetContractForMaterializedFile({
      manifest: input.manifest,
      relativePath: input.file.relativePath
    }) !== null
  );
}



function materializedProductFileSatisfiesDeclaredTarget(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly file: SdlcMaterializedProductFile;
  readonly target: SdlcProductMaterializationAuthorityTarget;
}): boolean {
  return (
    input.file.role === input.target.requiredRole &&
    productAuthorityTargetCoversRelativePath({
      manifest: input.manifest,
      target: input.target,
      normalizedRelativePath: input.file.relativePath.split(path.sep).join("/")
    })
  );
}

function fullComponentCodeBuilderEdge(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return (
    manifest.graphFunctionName === "derive_component_code_surface" &&
    manifest.edgeName === "derive_component_code_surface" &&
    manifest.targetAssetType === "component_code_surface" &&
    manifest.productMaterialization.required
  );
}



function frontierNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}



export function evaluateCodeBuilderSourceTestFrontier(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  if (!fullComponentCodeBuilderEdge(input.manifest)) {
    return;
  }
  const frontierPath = join(
    input.manifest.archiveRoot,
    LIVE_FP_PARALLEL_MATERIALIZATION_FRONTIER_FILE
  );
  const frontierRef = pathToFileURL(frontierPath).href;
  if (!existsSync(frontierPath) || !statSync(frontierPath).isFile()) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "code_builder_parallel_frontier_missing",
        detail: LIVE_FP_PARALLEL_MATERIALIZATION_FRONTIER_FILE,
        evidenceRefs: [frontierRef]
      })
    );
    return;
  }
  let record: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(readFileSync(frontierPath, "utf8"));
    const parsedRecord = objectRecord(parsed);
    if (parsedRecord === null) {
      throw new TypeError("frontier is not an object");
    }
    record = parsedRecord;
  } catch (error) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "code_builder_parallel_frontier_missing",
        detail: error instanceof Error ? error.message : "frontier_parse_failed",
        evidenceRefs: [frontierRef]
      })
    );
    return;
  }
  const devLaneCount = frontierNumber(record, "devLaneCount") ?? 0;
  const componentTestLaneCount =
    frontierNumber(record, "componentTestLaneCount") ?? 0;
  const uatTestLaneCount = frontierNumber(record, "uatTestLaneCount") ?? 0;
  if (
    devLaneCount <= 0 ||
    componentTestLaneCount <= 0 ||
    uatTestLaneCount <= 0
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "code_builder_parallel_test_lanes_missing",
        detail:
          `dev=${devLaneCount}; componentTest=${componentTestLaneCount}; uatTest=${uatTestLaneCount}`,
        evidenceRefs: [frontierRef]
      })
    );
  }
}



export function evaluateCodeBuilderValidationLogs(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  if (!fullComponentCodeBuilderEdge(input.manifest)) {
    return;
  }
  let logNames: readonly string[] = Object.freeze([]);
  try {
    logNames = Object.freeze(
      readdirSync(input.manifest.archiveRoot).filter((name) =>
        CODE_BUILDER_VALIDATION_LOG_NAME_PATTERN.test(name)
      )
    );
  } catch {
    return;
  }
  for (const logName of logNames) {
    const logPath = join(input.manifest.archiveRoot, logName);
    if (!statSync(logPath).isFile()) {
      continue;
    }
    const content = readFileSync(logPath, "utf8");
    if (!CODE_BUILDER_VALIDATION_FAILURE_PATTERN.test(content)) {
      continue;
    }
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "code_builder_validation_command_failed",
        detail: logName,
        evidenceRefs: [pathToFileURL(logPath).href]
      })
    );
  }
}



export function evaluateMaterializedProductFiles(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  const contract = input.manifest.productMaterialization;
  const materializationAuthority =
    reconcileSdlcProductMaterializationAuthority(input.manifest);
  const reportedProductFiles = input.report.materializedFiles.filter(
    (file) => resolve(file.absolutePath) !== resolve(input.manifest.outputFile)
  );
  const currentAttemptReportedProductFiles = reportedProductFiles.filter(
    (file) => file.materializationSource !== "replay"
  );
  for (const file of input.report.materializedFiles) {
    const absolutePath = resolve(file.absolutePath);
    if (absolutePath === resolve(input.manifest.outputFile)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_file_is_output_artifact",
          evidenceRefs: [pathToFileURL(absolutePath).href]
        })
      );
    }
  }
  const executionRepairMaterializationAllowed =
    productMaterializationRequiresTestExecutionEvidence(input.manifest);
  const tenantRoot = resolve(contract.tenantRoot);
  if (
    !contract.required &&
    currentAttemptReportedProductFiles.length > 0 &&
    !executionRepairMaterializationAllowed
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "unexpected_product_materialization_for_surface_edge",
        evidenceRefs: [pathToFileURL(contract.tenantRoot).href]
      })
    );
  }
  if (!contract.required) {
    if (executionRepairMaterializationAllowed) {
      for (const file of currentAttemptReportedProductFiles) {
        const absolutePath = resolve(file.absolutePath);
        if (!pathIsInside(absolutePath, tenantRoot)) {
          input.blockingReasonCarriers.push(
            makeSdlcBlockingReason({
              code: "materialized_product_file_outside_tenant_root",
              evidenceRefs: [pathToFileURL(absolutePath).href]
            })
          );
        }
      }
    }
    return;
  }
  if (
    materializationAuthority.contextExpectedFileTargets.length > 0 &&
    materializationAuthority.declaredProductTargetContracts.length === 0
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "context_expected_files_not_materialization_authority",
        evidenceRefs: materializationAuthority.sourceRefs
      })
    );
  }
  if (reportedProductFiles.length === 0) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "materialized_product_files_missing",
        evidenceRefs: [pathToFileURL(contract.tenantRoot).href]
      })
    );
  }
  for (const requiredRole of effectiveProductMaterializationRequiredRoles(input.manifest)) {
    if (!reportedProductFiles.some((file) => file.role === requiredRole)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_role_missing",
          detail: requiredRole,
          evidenceRefs: [pathToFileURL(contract.tenantRoot).href]
        })
      );
    }
  }
  for (const target of materializationAuthority.declaredProductTargetContracts) {
    if (
      !reportedProductFiles.some((file) =>
        materializedProductFileSatisfiesDeclaredTarget({
          manifest: input.manifest,
          file,
          target
        })
      )
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_files_missing",
          detail: `declared_target:${target.path}`,
          evidenceRefs: [target.sourceRef]
        })
      );
    }
  }
  const requirementDisplayIds =
    requirementDisplayIdByObligationId(input.manifest);
  const equivalentRequirementIdsByCanonical =
    equivalentRequirementLineageIdsByCanonical(input.manifest);
  const requirementLineageRequired =
    productMaterializationRequirementLineageRequired(input.manifest);
  const requiredProductRoles = new Set(
    effectiveProductMaterializationRequiredRoles(input.manifest)
  );
  const moduleSystemAuthority =
    declaredTenantModuleSystemAuthorityForManifest(input.manifest);
  const validRequirementLineageIds = new Set(
    requirementTraceObligationIdsForProductLineage(input.manifest)
  );
  for (const file of input.report.materializedFiles) {
    const absolutePath = resolve(file.absolutePath);
    const fileEvidenceRef = pathToFileURL(absolutePath).href;
    if (absolutePath === resolve(input.manifest.outputFile)) {
      continue;
    }
    const targetContract = targetContractForMaterializedFile({
      manifest: input.manifest,
      relativePath: file.relativePath
    });
    if (
      file.materializationSource === "replay" &&
      file.rolePolicyRef === undefined
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_replay_role_policy_missing",
          detail: file.relativePath,
          evidenceRefs: [fileEvidenceRef, ...(file.sourceManifestRef === undefined ? [] : [file.sourceManifestRef])]
        })
      );
    }
    if (targetContract !== null && file.role !== targetContract.requiredRole) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_role_policy_mismatch",
          detail: `${file.relativePath}: ${file.role} != ${targetContract.requiredRole}`,
          evidenceRefs: [fileEvidenceRef, targetContract.sourceRef]
        })
      );
    }
    if (
      targetContract !== null &&
      file.rolePolicyRef !== undefined &&
      file.rolePolicyRef !== targetContract.policyRef
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_role_policy_ref_mismatch",
          detail: `${file.relativePath}: ${file.rolePolicyRef} != ${targetContract.policyRef}`,
          evidenceRefs: [fileEvidenceRef, targetContract.sourceRef]
        })
      );
    }
    if (!pathIsInside(absolutePath, tenantRoot)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_file_outside_tenant_root",
          evidenceRefs: [fileEvidenceRef]
        })
      );
      continue;
    }
    if (isAbsolute(file.relativePath)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_relative_path_absolute",
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
    const expectedRelativePath = relative(tenantRoot, absolutePath);
    if (file.relativePath !== expectedRelativePath) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_relative_path_mismatch",
          detail: `${file.relativePath} != ${expectedRelativePath}`,
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
    if (!existsSync(absolutePath)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_file_missing",
          evidenceRefs: [fileEvidenceRef]
        })
      );
      continue;
    }
    if (!statSync(absolutePath).isFile()) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_path_not_file",
          evidenceRefs: [fileEvidenceRef]
        })
      );
      continue;
    }
    if (file.role === "design" && !isLikelyDesignMaterialization(file)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_design_file_outside_design_root",
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
    const content = readFileSync(absolutePath, "utf8");
    if (content.trim().length === 0) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_file_empty",
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
    const moduleSystemMismatch = evaluateMaterializedProductModuleSystem({
      moduleSystemAuthority,
      file,
      content,
      evidenceRefs: [fileEvidenceRef]
    });
    if (moduleSystemMismatch !== null) {
      input.blockingReasonCarriers.push(moduleSystemMismatch);
    }
    const requirementTraceObligationIds = canonicalizeRequirementLineageIds({
      manifest: input.manifest,
      obligationIds: file.requirementTraceObligationIds ?? []
    });
    const requirementLineageRequiredForFile =
      requirementLineageRequired &&
      materializedFileRequiresRequirementLineage({
        manifest: input.manifest,
        file,
        requiredProductRoles
      });
    const unrelatedRequirementLineage = requirementTraceObligationIds.filter(
      (obligationId) => !validRequirementLineageIds.has(obligationId)
    );
    const missingRequirementLineage =
      requirementLineageRequiredForFile && unrelatedRequirementLineage.length > 0
          ? unrelatedRequirementLineage.map(
              (obligationId) => `unrelated:${obligationId}`
            )
          : requirementLineageRequiredForFile &&
              !materializedFileLineageCanBeCarrierOnly({
                manifest: input.manifest,
                file
              })
	          ? requirementTraceObligationIds.filter(
	              (obligationId) =>
	                !(
	                  equivalentRequirementIdsByCanonical
	                    .get(obligationId)
	                    ?.some((equivalentId) =>
	                      contentCarriesRequirementObligation({
	                        content,
	                        obligationId: equivalentId,
	                        displayId:
	                          requirementDisplayIds.get(equivalentId) ??
	                          requirementDisplayIds.get(obligationId) ??
	                          null
	                      })
	                    ) ??
	                  contentCarriesRequirementObligation({
	                    content,
	                    obligationId,
	                    displayId: requirementDisplayIds.get(obligationId) ?? null
	                  })
	                )
	            )
	          : [];
    if (missingRequirementLineage.length > 0) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_requirement_lineage_missing",
          detail: `${file.relativePath}: ${missingRequirementLineage.join(", ")}`,
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
    if (Buffer.byteLength(content, "utf8") !== file.byteCount) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_byte_count_mismatch",
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
    if (sha256Text(content) !== file.digest) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "materialized_product_digest_mismatch",
          evidenceRefs: [fileEvidenceRef]
        })
      );
    }
  }
}



export function evaluateComponentDepthTargetCarrier(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: input.manifest.targetAssetType,
    outputFile: input.manifest.outputFile
  });
  if (admission.status === "not_required" || admission.status === "admitted") {
    return;
  }
  input.blockingReasonCarriers.push(
    makeSdlcBlockingReason({
      code: "component_depth_register_admission_invalid",
      detail:
        admission.blockingReasons.length === 0
          ? `component_depth_register_admission_${admission.status}`
          : admission.blockingReasons.join("; "),
      evidenceRefs: admission.evidenceRefs
    })
  );
}



export function evaluateExecutionEvidence(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
  readonly evidenceRefs: string[];
}): void {
  if (!manifestAdmitsTestExecutionEvidence(input.manifest)) {
    const executionEvidenceErrors = input.report.executionEvidenceErrors ?? [];
    if (
      input.report.executionEvidence !== null ||
      executionEvidenceErrors.length > 0
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "worker_execution_evidence_for_non_execution_edge",
          detail:
            executionEvidenceErrors.join("; ") ||
            "typed execution evidence is not admitted for this target asset type",
          evidenceRefs: input.evidenceRefs
        })
      );
    }
    return;
  }
  const executionEvidence = input.report.executionEvidence;
  if (executionEvidence === null) {
    const executionEvidenceErrors = input.report.executionEvidenceErrors ?? [];
    if (executionEvidenceErrors.length > 0) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_evidence_invalid",
          detail: executionEvidenceErrors.join("; "),
          evidenceRefs: input.evidenceRefs
        })
      );
      return;
    }
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_evidence_missing",
        detail:
          "No sdlc_worker_execution_evidence block was admitted from the worker result or transform artifact.",
        evidenceRefs: input.evidenceRefs
      })
    );
    return;
  }
  const executableProductMaterialization =
    input.manifest.productMaterialization.required &&
    productMaterializationRequiresTestExecutionEvidence(input.manifest);
  input.evidenceRefs.push(...executionEvidence.reportRefs);
  if (executionEvidence.lane !== "test") {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_lane_mismatch",
        detail: executionEvidence.lane,
        evidenceRefs: executionEvidence.reportRefs
      })
    );
  }
  if (
    !executionCommandMatchesContract({
      manifest: input.manifest,
      command: executionEvidence.command
    })
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_command_mismatch",
        detail: executionEvidence.command,
        evidenceRefs: executionEvidence.reportRefs
      })
    );
  }
  evaluateExecutionShardEvidence({
    manifest: input.manifest,
    executionEvidence,
    blockingReasonCarriers: input.blockingReasonCarriers,
    evidenceRefs: input.evidenceRefs
  });
  const contradiction = executionEvidenceContradiction(executionEvidence);
  if (contradiction !== null) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_evidence_contradiction",
        detail: contradiction,
        evidenceRefs: executionEvidence.reportRefs
      })
    );
    if (executionEvidence.reportRefs.length === 0) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_report_refs_missing",
          evidenceRefs: input.evidenceRefs
        })
      );
    }
    return;
  }
  if (executionEvidence.status === "pending") {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_not_succeeded",
        detail: executionEvidence.status,
        evidenceRefs: executionEvidence.reportRefs,
        lawfulReentryPoint: "triage_gap",
        message:
          "Governed test execution is pending; closure requires triage or repricing rather than same-edge retry."
      })
    );
    if (executionEvidence.reportRefs.length === 0) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_report_refs_missing",
          evidenceRefs: input.evidenceRefs
        })
      );
    }
    return;
  }
  if (
    executableProductMaterialization &&
    executionEvidence.status !== "succeeded"
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_failures_present",
        detail: executionEvidence.status,
        evidenceRefs: executionEvidence.reportRefs,
        message:
          "Executable product materialization did not pass its declared test execution contract."
      })
    );
  }
  // Failed-but-structurally-valid execution evidence is admitted here.
  // T-115 maps failed rows to component_test_qualification_surface and
  // component_repair_schedule_surface instead of retrying this edge.
  if (
    executionEvidence.status !== "failed" &&
    (executionEvidence.testsObserved ?? 0) <= 0
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_zero_tests_observed",
        evidenceRefs: executionEvidence.reportRefs
      })
    );
  }
  if (executionEvidence.reportRefs.length === 0) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_report_refs_missing",
        evidenceRefs: input.evidenceRefs
      })
    );
  }
}



export function evaluateAdrOutputArtifact(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly outputFile: string;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  if (!tenantOutputArtifactIsAdr(input.manifest)) {
    return;
  }
  const evidenceRefs = [pathToFileURL(input.outputFile).href];
  const filename = path.basename(input.outputFile);
  if (!/^ADR-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\.md$/u.test(filename)) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "adr_output_filename_invalid",
        detail: filename,
        evidenceRefs
      })
    );
  }
}



function evaluateExecutionShardEvidence(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly executionEvidence: SdlcWorkerExecutionEvidence;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
  readonly evidenceRefs: string[];
}): void {
  const expectedShards = installedOperatorExecutionShards(input.manifest);
  if (expectedShards.length === 0) {
    return;
  }
  const evidenceByShard = new Map<string, SdlcWorkerExecutionShardEvidence>();
  for (const shardEvidence of input.executionEvidence.shardEvidence) {
    input.evidenceRefs.push(...shardEvidence.reportRefs);
    if (evidenceByShard.has(shardEvidence.shardId)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_shard_evidence_mismatch",
          detail: `duplicate shard evidence for ${shardEvidence.shardId}`,
          evidenceRefs: shardEvidence.reportRefs
        })
      );
      continue;
    }
    evidenceByShard.set(shardEvidence.shardId, shardEvidence);
  }
  const expectedShardIds = new Set(expectedShards.map((shard) => shard.shardId));
  for (const shardEvidence of input.executionEvidence.shardEvidence) {
    if (!expectedShardIds.has(shardEvidence.shardId)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_shard_evidence_mismatch",
          detail: `unknown shardId ${shardEvidence.shardId}`,
          evidenceRefs: shardEvidence.reportRefs
        })
      );
    }
  }
  for (const expectedShard of expectedShards) {
    const shardEvidence = evidenceByShard.get(expectedShard.shardId);
    if (shardEvidence === undefined) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_shard_evidence_missing",
          detail: expectedShard.shardId,
          evidenceRefs: input.executionEvidence.reportRefs
        })
      );
      continue;
    }
    if (shardEvidence.moduleName !== expectedShard.moduleName) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_shard_evidence_mismatch",
          detail: `${expectedShard.shardId}: moduleName ${shardEvidence.moduleName}`,
          evidenceRefs: shardEvidence.reportRefs
        })
      );
    }
    if (
      !executionCommandMatchesDeclaredRunner({
        declaredCommand: normalizeExecutionCommand(expectedShard.command),
        observedCommand: normalizeExecutionCommand(shardEvidence.command)
      })
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_command_mismatch",
          detail: `${expectedShard.shardId}: ${shardEvidence.command}`,
          evidenceRefs: shardEvidence.reportRefs
        })
      );
    }
    const contradiction = executionEvidenceContradiction(shardEvidence);
    if (contradiction !== null) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_evidence_contradiction",
          detail: `${expectedShard.shardId}: ${contradiction}`,
          evidenceRefs: shardEvidence.reportRefs
        })
      );
      continue;
    }
    if (shardEvidence.status === "pending") {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_not_succeeded",
          detail: `${expectedShard.shardId}: ${shardEvidence.status}`,
          evidenceRefs: shardEvidence.reportRefs,
          lawfulReentryPoint:
            shardEvidence.status === "pending" ? "triage_gap" : undefined,
          message:
            shardEvidence.status === "pending"
              ? "Governed shard execution is pending; closure requires triage or repricing rather than same-edge retry."
              : undefined
        })
      );
      continue;
    }
    // Failed shards are repair inputs, not postflight blockers, when their
    // evidence is otherwise structurally valid.
    if (
      shardEvidence.status !== "failed" &&
      (shardEvidence.testsObserved ?? 0) <= 0
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_zero_tests_observed",
          detail: expectedShard.shardId,
          evidenceRefs: shardEvidence.reportRefs
        })
      );
    }
    if (shardEvidence.reportRefs.length === 0) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "test_execution_report_refs_missing",
          detail: expectedShard.shardId,
          evidenceRefs: input.executionEvidence.reportRefs
        })
      );
    }
  }
  const expectedComplete = expectedShards.every((shard) =>
    evidenceByShard.has(shard.shardId)
  );
  if (!expectedComplete) {
    return;
  }
  const shardTotals = aggregateShardExecutionEvidence(
    input.executionEvidence.shardEvidence
  );
  if (shardTotals === null) {
    return;
  }
  if (
    input.executionEvidence.testsObserved !== null &&
    input.executionEvidence.testsObserved !== shardTotals.testsObserved
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_evidence_contradiction",
        detail: `aggregate testsObserved ${input.executionEvidence.testsObserved} does not equal shard total ${shardTotals.testsObserved}`,
        evidenceRefs: input.executionEvidence.reportRefs
      })
    );
  }
  if (
    input.executionEvidence.passedCount !== null &&
    input.executionEvidence.passedCount !== shardTotals.passedCount
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_evidence_contradiction",
        detail: `aggregate passedCount ${input.executionEvidence.passedCount} does not equal shard total ${shardTotals.passedCount}`,
        evidenceRefs: input.executionEvidence.reportRefs
      })
    );
  }
  if (
    input.executionEvidence.failedCount !== null &&
    input.executionEvidence.failedCount !== shardTotals.failedCount
  ) {
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "test_execution_evidence_contradiction",
        detail: `aggregate failedCount ${input.executionEvidence.failedCount} does not equal shard total ${shardTotals.failedCount}`,
        evidenceRefs: input.executionEvidence.reportRefs
      })
    );
  }
}



function aggregateShardExecutionEvidence(
  shardEvidence: readonly SdlcWorkerExecutionShardEvidence[]
): { readonly testsObserved: number; readonly passedCount: number; readonly failedCount: number } | null {
  let testsObserved = 0;
  let passedCount = 0;
  let failedCount = 0;
  for (const shard of shardEvidence) {
    if (
      shard.testsObserved === null ||
      shard.passedCount === null ||
      shard.failedCount === null
    ) {
      return null;
    }
    testsObserved += shard.testsObserved;
    passedCount += shard.passedCount;
    failedCount += shard.failedCount;
  }
  return Object.freeze({ testsObserved, passedCount, failedCount });
}



function executionEvidenceContradiction(
  executionEvidence: SdlcWorkerExecutionEvidence | SdlcWorkerExecutionShardEvidence
): string | null {
  const observed = executionEvidence.testsObserved;
  const passed = executionEvidence.passedCount;
  const failed = executionEvidence.failedCount;
  if (observed !== null && passed !== null && failed !== null) {
    if (passed + failed !== observed) {
      return `passedCount + failedCount (${passed + failed}) does not equal testsObserved (${observed})`;
    }
  }
  if (executionEvidence.status === "succeeded" && (failed ?? 0) > 0) {
    return `status succeeded but failedCount is ${failed}`;
  }
  if (
    executionEvidence.status === "failed" &&
    observed !== null &&
    observed > 0 &&
    (failed ?? 0) === 0
  ) {
    return `status failed but failedCount is 0 for ${observed} observed tests`;
  }
  return null;
}



export function evaluateObligationAssessments(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
}): void {
  const declaredById = new Map(
    input.manifest.traversalObligationContext.obligations.map((obligation) => [
      obligation.obligationId,
      obligation
    ])
  );
  const assessedById = new Map(
    input.report.obligationAssessments.map((assessment) => [
      assessment.obligationId,
      assessment
    ])
  );
  const reportRef = pathToFileURL(input.manifest.reportFile).href;
  const outputAssetRef = assetCoverageRef({
    workspaceRoot: input.manifest.workspaceRoot,
    targetAssetType: input.manifest.targetAssetType,
    outputFile: input.report.outputFile
  });
  const outputContent =
    existsSync(input.report.outputFile) && statSync(input.report.outputFile).isFile()
      ? readFileSync(input.report.outputFile, "utf8")
      : "";
  const outputCoverageRefs = new Set<string>([
    ...coverageRefAliases(input.report.outputFile),
    ...coverageRefAliases(pathToFileURL(input.report.outputFile).href),
    ...(outputAssetRef === null ? [] : coverageRefAliases(outputAssetRef)),
    ...input.report.materializedFiles.flatMap((file) => [
      ...coverageRefAliases(file.absolutePath),
      ...coverageRefAliases(pathToFileURL(file.absolutePath).href)
    ]),
    ...(input.report.executionEvidence?.reportRefs.flatMap((ref) =>
      coverageRefAliases(ref)
    ) ?? []),
    ...(input.report.executionEvidence?.shardEvidence.flatMap((shard) =>
      shard.reportRefs.flatMap((ref) => coverageRefAliases(ref))
    ) ?? [])
  ]);
  const inducedAuthorityRequirementIds =
    input.manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY &&
    !input.manifest.productMaterialization.required
      ? observedRequirementIds({
          outputFile: input.report.outputFile,
          materializedFiles: input.report.materializedFiles
        })
      : new Set<string>();
  for (const obligation of declaredById.values()) {
    if (
      obligation.obligationKind === "requirement" &&
      obligation.payload.status !== "concrete"
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "obligation_payload_insufficient",
          detail: obligation.obligationId,
          evidenceRefs: obligation.evidenceRefs.length > 0
            ? obligation.evidenceRefs
            : [reportRef]
        })
      );
    }
    if (!assessedById.has(obligation.obligationId)) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "obligation_unassessed",
          detail: obligation.obligationId,
          evidenceRefs: obligation.evidenceRefs.length > 0
            ? obligation.evidenceRefs
            : [reportRef]
        })
      );
    }
  }
  for (const assessment of input.report.obligationAssessments) {
    const declared = declaredById.get(assessment.obligationId);
    if (declared === undefined) {
      const requirementId = requirementIdForObligation(assessment.obligationId);
      const admittedAuthorityRequirement =
        requirementId !== null &&
        inducedAuthorityRequirementIds.has(requirementId);
      if (!admittedAuthorityRequirement) {
        input.blockingReasonCarriers.push(
          makeSdlcBlockingReason({
            code: "obligation_assessment_extra",
            detail: assessment.obligationId,
            evidenceRefs: assessment.evidenceRefs.length > 0
              ? assessment.evidenceRefs
              : [reportRef]
          })
        );
      }
    }
    if (
      input.manifest.targetAssetType === "test_run_archive_surface" &&
      declared?.obligationKind === "source_asset" &&
      assessment.fulfillmentStatus === "fulfilled"
    ) {
      const sourceAssetType = declared.obligationId.slice("source_asset:".length);
      const archiveDependencyError =
        sourceAssetType === "test_execution_result_surface"
          ? archiveSourceExecutionResultDependencyError({
              manifest: input.manifest,
              evidenceRefs: assessment.evidenceRefs
            })
          : null;
      if (!outputContent.includes(sourceAssetType) || archiveDependencyError !== null) {
        input.blockingReasonCarriers.push(
          makeSdlcBlockingReason({
            code: "source_asset_dependency_missing",
            detail: archiveDependencyError === null
              ? sourceAssetType
              : `${sourceAssetType}: ${archiveDependencyError}`,
            evidenceRefs: assessment.evidenceRefs.length > 0
              ? assessment.evidenceRefs
              : [reportRef]
          })
        );
      }
    }
    if (
      declared?.obligationKind === "requirement" &&
      assessment.fulfillmentStatus === "fulfilled" &&
      !assessment.evidenceRefs.some((ref) =>
        coverageRefAliases(ref).some((alias) => outputCoverageRefs.has(alias))
      )
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "obligation_fulfilled_without_output_coverage",
          detail: assessment.obligationId,
          evidenceRefs: assessment.evidenceRefs.length > 0
            ? assessment.evidenceRefs
            : [reportRef]
        })
      );
    }
    if (assessment.fulfillmentStatus === "unassessed") {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "obligation_status_unassessed",
          detail: assessment.obligationId,
          evidenceRefs: assessment.evidenceRefs.length > 0
            ? assessment.evidenceRefs
            : [reportRef]
        })
      );
    }
    if (
      assessment.fulfillmentStatus === "blocked" &&
      assessment.evidenceRefs.length === 0
    ) {
      input.blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "obligation_blocked_without_evidence",
          detail: assessment.obligationId,
          evidenceRefs: [reportRef]
        })
      );
    }
  }
}
