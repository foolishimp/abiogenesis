import path, {
  isAbsolute,
  join,
  relative,
  resolve
} from "node:path";import type {
  SdlcMaterializedProductFileRole,
  SdlcDesignDepthRegister,
  SdlcTestDesignRegister,
  SdlcProductMaterializationContract,
  SdlcProductMaterializationAuthorityReconciliation,
  SdlcProductMaterializationAuthorityTarget,
  SdlcWorkerHandoffManifest
} from "../carriers.js";import {
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
} from "../../graph/index.js";import {
  admitComponentDepthRegisterFromArtifact
} from "../component_depth_register.js";import {
  admitTestDesignRegisterFromArtifact
} from "../test_design_register.js";import {
  admitImplementationDesignRegisterForManifest,
  admitImplementationDesignRegisterForRuntimeEvaluation
} from "../plugins/evaluate/design_depth_register.js";import {
  constructSdlcTenantTechnologyStackAuthority,
  type SdlcTenantTechnologyStackAuthority
} from "../../authority/tenant_stack_authority.js";import {
  decideSdlcTenantStackAuthorityStatus
} from "../../contracts/blocking_reason_catalog.js";import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";import {
  pathIsInside
} from "../../shared/path.js";import {
  pathToFileURL
} from "node:url";import {
  uniqueSorted
} from "../../shared/collections.js";import {
  MATERIALIZED_PRODUCT_FILE_ROLES,
  tenantLocalSdlcSurfaceRelativePath
} from "./surface_paths.js";

export {
  isTenantLocalSdlcSurfaceRelativePath
} from "./surface_paths.js";

export function isTenantStackAuthoritySpecRelativePath(relativePath: string): boolean {
  const normalized = normalizedRelativePath(relativePath).toLowerCase();
  return /^(?:spec\/)?(?:tech_stack|testing_tech_stack|product_targets|execution_contract)\.(?:json|md|markdown)$/u.test(
    normalized
  );
}

export function tenantRelativeOutputArtifactPath(
  manifest: SdlcWorkerHandoffManifest
): string | null {
  const tenantRoot = resolve(manifest.productMaterialization.tenantRoot);
  const outputFile = resolve(manifest.outputFile);
  if (!pathIsInside(outputFile, tenantRoot)) {
    return null;
  }
  return relative(tenantRoot, outputFile).split(path.sep).join("/");
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

type DeclaredProductTargetSeed = Pick<
  SdlcProductMaterializationAuthorityTarget,
  "path" | "targetKind"
> & {
  readonly requiredRole: SdlcMaterializedProductFileRole | null;
  readonly policyRef: string | null;
};

type TenantStackTargetSeed = DeclaredProductTargetSeed & {
  readonly sourceRef: string;
  readonly stackSection: "implementation" | "testing";
};

function materializedProductFileRoleFromText(
  input: string
): SdlcMaterializedProductFileRole | null {
  const normalized = input.trim().toLowerCase().replace(/[-\s/]+/gu, "_");
  switch (normalized) {
    case "source":
    case "source_implementation":
    case "implementation_source":
    case "source_code":
    case "runtime_source":
      return "source";
    case "test":
    case "unit_test":
    case "component_test":
      return "test";
    case "build_config":
    case "build_plugin":
    case "manifest":
    case "package_manifest":
      return "build_config";
    case "design":
    case "documentation":
    case "other":
      return normalized;
    default:
      return null;
  }
}

function explicitRoleFromTargetText(input: string): {
  readonly value: string;
  readonly requiredRole: SdlcMaterializedProductFileRole | null;
} {
  const roleMatch =
    /\brole\s*[:=]\s*`?(source|test|build[-_\s]config|build[-_\s]plugin|design|documentation|other)\b`?/iu.exec(
      input
    );
  const requiredRole =
    roleMatch?.[1] === undefined
      ? null
      : materializedProductFileRoleFromText(roleMatch[1]);
  const value = input
    .replace(
      /\s*(?:[|;,]\s*)?\(?\s*\brole\s*[:=]\s*`?(?:source|test|build[-_\s]config|build[-_\s]plugin|design|documentation|other)\b`?\s*\)?/iu,
      ""
    )
    .trim();
  return Object.freeze({ value, requiredRole });
}

function declaredProductTargetLooksLikeDirectory(input: string): boolean {
  const normalized = input.replace(/\\/gu, "/").replace(/\/+$/u, "");
  const lower = normalized.toLowerCase();
  const basename = path.posix.basename(lower);
  if (input.endsWith("/")) {
    return true;
  }
  if (lower === "src" || lower.endsWith("/src")) {
    return true;
  }
  if (
    (lower.startsWith("src/") || lower.includes("/src/")) &&
    path.posix.extname(basename).length === 0
  ) {
    return true;
  }
  return false;
}

function normalizeDeclaredProductFileTarget(input: {
  readonly value: string;
  readonly selectedOutputRoot: string;
}): DeclaredProductTargetSeed | null {
  const parsedRole = explicitRoleFromTargetText(input.value);
  const withoutComment = parsedRole.value.replace(/\s+#.*$/u, "");
  const trimmed = withoutComment
    .trim()
    .replace(/^[-*]\s+/u, "")
    .replace(/^["'`]+|["'`]+$/gu, "")
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^\.\//u, "");
  const targetKind = declaredProductTargetLooksLikeDirectory(trimmed)
    ? "directory"
    : "file";
  const cleaned = withoutComment
    .trim()
    .replace(/^[-*]\s+/u, "")
    .replace(/^["'`]+|["'`]+$/gu, "")
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^\.\//u, "")
    .replace(/\/+$/u, "");
  if (cleaned.length === 0) {
    return null;
  }
  const normalized = path.posix.normalize(cleaned).replace(/^\.\//u, "");
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    isAbsolute(normalized)
  ) {
    return null;
  }
  if (
    normalized === input.selectedOutputRoot ||
    normalized.startsWith(`${input.selectedOutputRoot}/`)
  ) {
    return Object.freeze({
      path: normalized,
      targetKind,
      requiredRole: parsedRole.requiredRole,
      policyRef:
        parsedRole.requiredRole === null
          ? null
          : `target-role-policy://odd-sdlc/explicit/${parsedRole.requiredRole}`
    });
  }
  return null;
}

function markdownSectionBodies(input: {
  readonly markdown: string;
  readonly titlePattern: RegExp;
}): readonly string[] {
  const lines = input.markdown.split(/\r?\n/u);
  const bodies: string[] = [];
  let activeDepth: number | null = null;
  let activeLines: string[] = [];
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/u.exec(line);
    if (heading !== null) {
      const marker = heading[1] ?? "";
      const headingTitle = heading[2] ?? "";
      const depth = marker.length;
      const title = headingTitle.trim();
      if (activeDepth !== null && depth <= activeDepth) {
        bodies.push(activeLines.join("\n"));
        activeDepth = null;
        activeLines = [];
      }
      if (activeDepth === null && input.titlePattern.test(title)) {
        activeDepth = depth;
        activeLines = [];
      }
      continue;
    }
    if (activeDepth !== null) {
      activeLines.push(line);
    }
  }
  if (activeDepth !== null) {
    bodies.push(activeLines.join("\n"));
  }
  return Object.freeze(bodies);
}

function targetsFromProductAuthoritySection(input: {
  readonly body: string;
  readonly selectedOutputRoot: string;
}): readonly DeclaredProductTargetSeed[] {
  const targets = new Map<string, DeclaredProductTargetSeed>();
  let fenced = false;
  let sectionTreeRoot: string | null = null;
  const addTarget = (candidate: string): void => {
    const directTarget = normalizeDeclaredProductFileTarget({
      value: candidate,
      selectedOutputRoot: input.selectedOutputRoot
    });
    if (directTarget?.path === input.selectedOutputRoot) {
      sectionTreeRoot = input.selectedOutputRoot;
      return;
    }
    if (directTarget !== null) {
      targets.set(directTarget.path, directTarget);
      return;
    }
    if (sectionTreeRoot === null) {
      return;
    }
    const relativeTarget = normalizeDeclaredProductFileTarget({
      value: `${sectionTreeRoot}/${candidate.trim()}`,
      selectedOutputRoot: input.selectedOutputRoot
    });
    if (
      relativeTarget !== null &&
      relativeTarget.path !== input.selectedOutputRoot
    ) {
      targets.set(relativeTarget.path, relativeTarget);
    }
  };

  for (const line of input.body.split(/\r?\n/u)) {
    if (/^\s*```/u.test(line)) {
      fenced = !fenced;
      continue;
    }
    let addedCodeSpan = false;
    for (const match of line.matchAll(/`([^`]+)`/gu)) {
      const codeSpan = match[1];
      if (codeSpan !== undefined) {
        addTarget(codeSpan);
        addedCodeSpan = true;
      }
    }
    if (!fenced) {
      const bullet = /^\s*[-*]\s+(.+)$/u.exec(line);
      if (bullet !== null && !addedCodeSpan) {
        const bulletTarget = bullet[1];
        if (bulletTarget !== undefined) {
          addTarget(bulletTarget);
        }
      }
      continue;
    }
    addTarget(line);
  }
  return Object.freeze(
    [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

function targetsFromProductAuthorityFields(input: {
  readonly markdown: string;
  readonly selectedOutputRoot: string;
}): readonly DeclaredProductTargetSeed[] {
  const targets = new Map<string, DeclaredProductTargetSeed>();
  const addTarget = (candidate: string): void => {
    let addedCodeSpan = false;
    for (const match of candidate.matchAll(/`([^`]+)`/gu)) {
      const codeSpan = match[1];
      if (codeSpan === undefined) {
        continue;
      }
      const normalized = normalizeDeclaredProductFileTarget({
        value: codeSpan,
        selectedOutputRoot: input.selectedOutputRoot
      });
      if (
        normalized !== null &&
        normalized.path !== input.selectedOutputRoot
      ) {
        targets.set(normalized.path, normalized);
        addedCodeSpan = true;
      }
    }
    if (addedCodeSpan) {
      return;
    }
    const normalized = normalizeDeclaredProductFileTarget({
      value: candidate,
      selectedOutputRoot: input.selectedOutputRoot
    });
    if (
      normalized !== null &&
      normalized.path !== input.selectedOutputRoot
    ) {
      targets.set(normalized.path, normalized);
    }
  };
  const fieldPattern =
    /^(?:(?:declared|expected)\s+)?(?:(?:product|source|test)\s+)?files?$/iu;
  for (const line of input.markdown.split(/\r?\n/u)) {
    const cells = markdownTableCells(line);
    if (cells !== null && cells.length >= 2) {
      const field = cells[0]?.replace(/[*_`]/gu, "").trim() ?? "";
      if (fieldPattern.test(field)) {
        addTarget(cells.slice(1).join(" "));
      }
      continue;
    }
    const fieldMatch =
      /^\s*(?:[-*]\s*)?(?:\*\*)?((?:(?:declared|expected)\s+)?(?:(?:product|source|test)\s+)?files?)(?:\*\*)?\s*:\s*(.+?)\s*$/iu.exec(
        line
      );
    if (fieldMatch === null) {
      continue;
    }
    addTarget(fieldMatch[2] ?? "");
  }
  return Object.freeze(
    [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

function markdownTableCells(input: string): readonly string[] | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }
  const cells = trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
  if (
    cells.length === 0 ||
    cells.every((cell) => /^:?-{3,}:?$/u.test(cell))
  ) {
    return null;
  }
  return Object.freeze(cells);
}

function targetsFromDeclaredModuleTargets(input: {
  readonly body: string;
  readonly selectedOutputRoot: string;
}): readonly DeclaredProductTargetSeed[] {
  const targets = new Map<string, DeclaredProductTargetSeed>();
  const addTarget = (pathValue: string): void => {
    const normalized = normalizeDeclaredProductFileTarget({
      value: pathValue,
      selectedOutputRoot: input.selectedOutputRoot
    });
    if (
      normalized !== null &&
      normalized.path !== input.selectedOutputRoot
    ) {
      targets.set(normalized.path, normalized);
    }
  };

  for (const line of input.body.split(/\r?\n/u)) {
    const cells = markdownTableCells(line);
    if (cells !== null && cells.length >= 2) {
      for (const cell of cells.slice(1)) {
        for (const match of cell.matchAll(/`([^`]+)`/gu)) {
          const codeSpan = match[1];
          if (codeSpan !== undefined) {
            addTarget(codeSpan);
          }
        }
      }
      continue;
    }
    if (!/^\s*[-*]\s+/u.test(line)) {
      continue;
    }
    let addedCodeSpan = false;
    for (const match of line.matchAll(/`([^`]+)`/gu)) {
      const codeSpan = match[1];
      if (codeSpan !== undefined) {
        addTarget(codeSpan);
        addedCodeSpan = true;
      }
    }
    if (!addedCodeSpan && line.includes("/")) {
      addTarget(line.replace(/^[-*]\s+/u, "").trim());
    }
  }

  return Object.freeze(
    [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

function productAuthorityTargetsFor(
  manifest: SdlcWorkerHandoffManifest
): {
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly sourceRefs: readonly string[];
} {
  const productPath = join(manifest.workspaceRoot, "specification/PRODUCT.md");
  if (!existsSync(productPath)) {
    return Object.freeze({
      targets: Object.freeze([]),
      sourceRefs: Object.freeze([])
    });
  }
  const product = readFileSync(productPath, "utf8");
  const sections = markdownSectionBodies({
    markdown: product,
    titlePattern: /^(?:(?:(?:declared|expected)\s+)?product\s+files|(?:declared|expected)\s+files)$/iu
  });
  const declaredModuleSections = markdownSectionBodies({
    markdown: product,
    titlePattern: /^(?:declared\s+module\s+targets|module\s+structure)$/iu
  });
  const sourceRef = pathToFileURL(productPath).href;
  const targets = targetContractsFromSeeds({
    source: "product_authority",
    sourceRef,
    manifest,
    seeds: [
      ...targetsFromProductAuthorityFields({
        markdown: product,
        selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
      }),
      ...sections.flatMap((body) =>
        targetsFromProductAuthoritySection({
          body,
          selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
        })
      ),
      ...declaredModuleSections.flatMap((body) =>
        targetsFromDeclaredModuleTargets({
          body,
          selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
        })
      )
    ]
  });
  return Object.freeze({
    targets,
    sourceRefs: Object.freeze([sourceRef])
  });
}

function requirementAuthorityFiles(root: string): readonly string[] {
  if (!existsSync(root)) {
    return Object.freeze([]);
  }
  const files: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        continue;
      }
      const relativePath = relative(root, absolutePath).split(path.sep).join("/");
      if (
        relativePath === "README.md" ||
        relativePath === "00-imported-sources.md"
      ) {
        continue;
      }
      files.push(absolutePath);
    }
  };
  visit(root);
  return Object.freeze(files.sort());
}

function requirementAuthorityTargetsFor(
  manifest: SdlcWorkerHandoffManifest
): {
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly sourceRefs: readonly string[];
} {
  const requirementRoot = join(manifest.workspaceRoot, "specification/requirements");
  const targets = new Map<string, SdlcProductMaterializationAuthorityTarget>();
  const sourceRefs = new Set<string>();
  for (const requirementPath of requirementAuthorityFiles(requirementRoot)) {
    const markdown = readFileSync(requirementPath, "utf8");
    const sections = markdownSectionBodies({
      markdown,
      titlePattern: /\b(?:declared\s+|expected\s+)?product\s+files?\b/iu
    });
    if (sections.length === 0) {
      continue;
    }
    const sourceRef = pathToFileURL(requirementPath).href;
    const contracts = targetContractsFromSeeds({
      source: "requirement_authority",
      sourceRef,
      manifest,
      seeds: sections.flatMap((body) =>
        targetsFromProductAuthoritySection({
          body,
          selectedOutputRoot:
            manifest.productMaterialization.selectedOutputRoot
        })
      )
    });
    if (contracts.length === 0) {
      continue;
    }
    sourceRefs.add(sourceRef);
    for (const contract of contracts) {
      targets.set(contract.path, contract);
    }
  }
  return Object.freeze({
    targets: Object.freeze(
      [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
    ),
    sourceRefs: Object.freeze([...sourceRefs].sort())
  });
}

function contextExpectedFileTargetsFor(
  manifest: SdlcWorkerHandoffManifest
): {
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
} {
  const contextRoot = join(manifest.workspaceRoot, ".ai-workspace/context");
  if (!existsSync(contextRoot)) {
    return Object.freeze({
      targets: Object.freeze([]),
      sourceRefs: Object.freeze([]),
      reasonRefs: Object.freeze([])
    });
  }
  const targets = new Map<string, SdlcProductMaterializationAuthorityTarget>();
  const sourceRefs = new Set<string>();
  const reasonRefs = new Set<string>();
  for (const entry of readdirSync(contextRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }
    const filePath = join(contextRoot, entry.name);
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      reasonRefs.add(`context_expected_files_parse_failed:${entry.name}`);
      continue;
    }
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      !("expectedFiles" in parsed) ||
      !Array.isArray(parsed.expectedFiles)
    ) {
      continue;
    }
    const sourceRef = pathToFileURL(filePath).href;
    sourceRefs.add(sourceRef);
    for (const value of parsed.expectedFiles) {
      if (typeof value !== "string" || value.trim().length === 0) {
        continue;
      }
      const normalized = normalizeDeclaredProductFileTarget({
        value,
        selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
      });
      if (
        normalized !== null &&
        normalized.path !== manifest.productMaterialization.selectedOutputRoot
      ) {
        targets.set(
          normalized.path,
          Object.freeze({
            kind: "sdlc_product_materialization_authority_target" as const,
            path: normalized.path,
            targetKind: normalized.targetKind,
            ...materializationRolePolicyForTarget({
              manifest,
              seed: normalized
            }),
            source: "context_expected_files" as const,
            sourceRef
          })
        );
      }
    }
  }
  return Object.freeze({
    targets: Object.freeze(
      [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
    ),
    sourceRefs: Object.freeze([...sourceRefs].sort()),
    reasonRefs: Object.freeze([...reasonRefs].sort())
  });
}

function materializationRolePolicyForTarget(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly seed: DeclaredProductTargetSeed;
}): Pick<SdlcProductMaterializationAuthorityTarget, "requiredRole" | "policyRef"> {
  if (input.seed.requiredRole !== null && input.seed.policyRef !== null) {
    return Object.freeze({
      requiredRole: input.seed.requiredRole,
      policyRef: input.seed.policyRef
    });
  }
  const relativeTarget = targetRelativeToSelectedOutputRoot({
    targetPath: input.seed.path,
    selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot
  }).toLowerCase();
  if (
    tenantStackBuildConfigTargetCoversRelativePath({
      manifest: input.manifest,
      relativePath: relativeTarget
    })
  ) {
    return Object.freeze({
      requiredRole: "build_config" as const,
      policyRef: "target-role-policy://odd-sdlc/tenant-stack/build-config"
    });
  }
  if (
    relativeTarget === "test" ||
    relativeTarget === "tests" ||
    relativeTarget.startsWith("src/test/") ||
    relativeTarget.startsWith("test/") ||
    relativeTarget.startsWith("tests/") ||
    relativeTarget.includes("/test/") ||
    relativeTarget.includes("/tests/") ||
    relativeTarget.includes("/src/test/") ||
    relativeTarget.endsWith("/test") ||
    relativeTarget.endsWith("/tests")
  ) {
    return Object.freeze({
      requiredRole: "test" as const,
      policyRef: "target-role-policy://odd-sdlc/product-test-tree"
    });
  }
  if (
    relativeTarget === "src" ||
    relativeTarget.startsWith("src/") ||
    relativeTarget.endsWith("/src") ||
    relativeTarget.includes("/src/")
  ) {
    return Object.freeze({
      requiredRole: "source" as const,
      policyRef: "target-role-policy://odd-sdlc/product-source-tree"
    });
  }
  if (
    relativeTarget === "design" ||
    relativeTarget.startsWith("design/") ||
    relativeTarget.endsWith("/design")
  ) {
    return Object.freeze({
      requiredRole: "design" as const,
      policyRef: "target-role-policy://odd-sdlc/product-design-surface"
    });
  }
  if (/\.(?:md|markdown)$/u.test(relativeTarget)) {
    return Object.freeze({
      requiredRole: "documentation" as const,
      policyRef: "target-role-policy://odd-sdlc/product-documentation"
    });
  }
  return Object.freeze({
    requiredRole: "other" as const,
    policyRef: "target-role-policy://odd-sdlc/declared-other"
  });
}

function targetContractsFromSeeds(input: {
  readonly source: SdlcProductMaterializationAuthorityTarget["source"];
  readonly sourceRef: string;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly seeds: readonly DeclaredProductTargetSeed[];
}): readonly SdlcProductMaterializationAuthorityTarget[] {
  const targets = new Map<string, SdlcProductMaterializationAuthorityTarget>();
  for (const seed of input.seeds) {
    const rolePolicy = materializationRolePolicyForTarget({
      manifest: input.manifest,
      seed
    });
    targets.set(
      seed.path,
      Object.freeze({
        kind: "sdlc_product_materialization_authority_target" as const,
        path: seed.path,
        targetKind: seed.targetKind,
        requiredRole: rolePolicy.requiredRole,
        policyRef: rolePolicy.policyRef,
        source: input.source,
        sourceRef: input.sourceRef
      })
    );
  }
  return Object.freeze(
    [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

interface TenantStackAuthority {
  readonly targetSeeds: readonly TenantStackTargetSeed[];
  readonly buildConfigSeeds: readonly TenantStackTargetSeed[];
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
  readonly carrier: SdlcTenantTechnologyStackAuthority;
}

interface TenantStackSeedReadResult {
  readonly seeds: readonly TenantStackTargetSeed[];
  readonly reasonRefs: readonly string[];
  readonly declaresStackSemantics: boolean;
  readonly declaresExecutionEnvironment: boolean;
}

export function tenantStackSpecRoot(manifest: SdlcWorkerHandoffManifest): string {
  return join(
    manifest.workspaceRoot,
    manifest.productMaterialization.selectedOutputRoot,
    "spec"
  );
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

function tenantStackSpecFiles(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return tenantStackSpecFilesForSelectedOutputRoot({
    workspaceRoot: manifest.workspaceRoot,
    selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
  });
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

function declaredTenantToolByproductRules(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return declaredTenantToolByproductRulesFromSpecFiles(
    tenantStackSpecFiles(manifest)
  );
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

function normalizeTenantToolByproductRule(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly rule: string;
}): string | null {
  return normalizeTenantToolByproductRuleForRoot({
    rule: input.rule,
    workspaceRoot: input.manifest.workspaceRoot,
    selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot,
    tenantRoot: input.manifest.productMaterialization.tenantRoot
  });
}

export function isTenantDeclaredToolByproductRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly normalizedRelativePath: string;
}): boolean {
  const relativePath = input.normalizedRelativePath.replace(/\/+$/u, "");
  return declaredTenantToolByproductRules(input.manifest).some((rule) => {
    const normalizedRule = normalizeTenantToolByproductRule({
      manifest: input.manifest,
      rule
    });
    return (
      normalizedRule !== null &&
      (relativePath === normalizedRule ||
        relativePath.startsWith(`${normalizedRule}/`))
    );
  });
}

function unknownDeclaresTenantStackSemantics(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some((entry) => unknownDeclaresTenantStackSemantics(entry));
  }
  const record = objectRecord(value);
  if (record === null) {
    return false;
  }
  return Object.entries(record).some(([key, entry]) =>
    key === "kind" ? false : unknownDeclaresTenantStackSemantics(entry)
  );
}

function unknownDeclaresTenantExecutionEnvironment(value: unknown): boolean {
  const record = objectRecord(value);
  if (record === null) {
    return false;
  }
  const directKeys = [
    "executionEnvironment",
    "execution_environment",
    "toolEnvironment",
    "tool_environment"
  ];
  if (
    directKeys.some((key) =>
      unknownDeclaresTenantStackSemantics(record[key])
    )
  ) {
    return true;
  }
  const nestedKeys = [
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack"
  ];
  return nestedKeys.some((key) =>
    unknownDeclaresTenantExecutionEnvironment(record[key])
  );
}

function markdownDeclaresTenantStackSemantics(markdown: string): boolean {
  return markdown.split(/\r?\n/u).some((line) => {
    const trimmed = line.trim();
    return (
      trimmed.length > 0 &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("```") &&
      /[A-Za-z0-9]/u.test(trimmed)
    );
  });
}

function markdownDeclaresTenantExecutionEnvironment(markdown: string): boolean {
  return /(?:execution|tool)[-\s_]+environment|environmentVariables|environment_variables|workspaceLocalDirectories|workspace_local_directories/iu.test(
    markdown
  );
}

function tenantStackTargetSeed(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly sourceRef: string;
  readonly stackSection: TenantStackTargetSeed["stackSection"];
  readonly value: string;
  readonly role: SdlcMaterializedProductFileRole;
  readonly targetKind?: SdlcProductMaterializationAuthorityTarget["targetKind"] | undefined;
}): TenantStackTargetSeed | null {
  const selectedOutputRoot = normalizedSelectedOutputRoot(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  const rawValue = input.value.replace(/\\/gu, "/").trim();
  const tenantRelativeValue = rawValue
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^\.\//u, "")
    .trim();
  if (
    tenantRelativeValue.length === 0 ||
    tenantRelativeValue.startsWith("/") ||
    /^[A-Za-z][A-Za-z0-9+.-]*:\/\//u.test(tenantRelativeValue)
  ) {
    return null;
  }
  const candidate = tenantRelativeValue.startsWith(`${selectedOutputRoot}/`)
    ? tenantRelativeValue
    : `${selectedOutputRoot}/${tenantRelativeValue}`;
  const normalized = normalizeDeclaredProductFileTarget({
    value: candidate,
    selectedOutputRoot
  });
  if (normalized === null || normalized.path === selectedOutputRoot) {
    return null;
  }
  return Object.freeze({
    ...normalized,
    targetKind: input.targetKind ?? normalized.targetKind,
    requiredRole: input.role,
    policyRef: `target-role-policy://odd-sdlc/tenant-stack/${input.stackSection}/${input.role}`,
    sourceRef: input.sourceRef,
    stackSection: input.stackSection
  });
}

function tenantStackBuildConfigSeedsFromJson(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly sourceRef: string;
  readonly parsed: unknown;
}): TenantStackSeedReadResult {
  const record = objectRecord(input.parsed);
  if (record === null) {
    return Object.freeze({
      seeds: Object.freeze([]),
      reasonRefs: Object.freeze(["tenant_stack_spec_not_object"]),
      declaresStackSemantics: false,
      declaresExecutionEnvironment: false
    });
  }
  const implementationBuildConfigKeys = [
    "buildConfigTargets",
    "build_config_targets",
    "requiredBuildConfigTargets",
    "required_build_config_targets",
    "buildConfigFiles",
    "build_config_files"
  ];
  const testingBuildConfigKeys = [
    "testBuildConfigTargets",
    "test_build_config_targets",
    "testingBuildConfigTargets",
    "testing_build_config_targets",
    "testBuildConfigFiles",
    "test_build_config_files",
    "testingBuildConfigFiles",
    "testing_build_config_files"
  ];
  const nestedTestingStackKeys = [
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack",
    "testStack",
    "test_stack"
  ];
  const implementationSourceRootKeys = [
    "sourceRoots",
    "source_roots",
    "sourceDirectories",
    "source_directories",
    "moduleRoots",
    "module_roots"
  ];
  const implementationSourceFileKeys = [
    "sourceFiles",
    "source_files",
    "sourceTargets",
    "source_targets"
  ];
  const moduleLayoutKeys = ["moduleLayout", "module_layout"];
  const testingRootKeys = [
    "testRoots",
    "test_roots",
    "testingRoots",
    "testing_roots",
    "testDirectories",
    "test_directories",
    "testingDirectories",
    "testing_directories"
  ];
  const testingFileKeys = [
    "testFiles",
    "test_files",
    "testingFiles",
    "testing_files",
    "testTargets",
    "test_targets",
    "testingTargets",
    "testing_targets"
  ];
  const values = [
    ...objectFieldsStringList(record, implementationBuildConfigKeys).map((value) =>
      Object.freeze({
        value,
        stackSection: "implementation" as const,
        role: "build_config" as const
      })
    ),
    ...objectFieldsStringList(record, testingBuildConfigKeys).map((value) =>
      Object.freeze({
        value,
        stackSection: "testing" as const,
        role: "build_config" as const
      })
    ),
    ...objectFieldsStringList(record, implementationSourceRootKeys).map((value) =>
      Object.freeze({
        value,
        stackSection: "implementation" as const,
        role: "source" as const,
        targetKind: "directory" as const
      })
    ),
    ...objectFieldsStringList(record, implementationSourceFileKeys).map((value) =>
      Object.freeze({
        value,
        stackSection: "implementation" as const,
        role: "source" as const
      })
    ),
    ...moduleLayoutKeys.flatMap((key) => {
      const nested = objectRecord(record[key]);
      return nested === null
        ? Object.freeze<readonly {
            readonly value: string;
            readonly stackSection: TenantStackTargetSeed["stackSection"];
            readonly role: SdlcMaterializedProductFileRole;
            readonly targetKind?: SdlcProductMaterializationAuthorityTarget["targetKind"];
          }[]>([])
        : [
            ...objectFieldsStringList(nested, implementationSourceRootKeys).map(
              (value) =>
                Object.freeze({
                  value,
                  stackSection: "implementation" as const,
                  role: "source" as const,
                  targetKind: "directory" as const
                })
            ),
            ...objectFieldsStringList(nested, implementationSourceFileKeys).map(
              (value) =>
                Object.freeze({
                  value,
                  stackSection: "implementation" as const,
                  role: "source" as const
                })
            )
          ];
    }),
    ...objectFieldsStringList(record, testingRootKeys).map((value) =>
      Object.freeze({
        value,
        stackSection: "testing" as const,
        role: "test" as const,
        targetKind: "directory" as const
      })
    ),
    ...objectFieldsStringList(record, testingFileKeys).map((value) =>
      Object.freeze({
        value,
        stackSection: "testing" as const,
        role: "test" as const
      })
    ),
    ...nestedTestingStackKeys.flatMap((key) => {
      const nested = objectRecord(record[key]);
      return nested === null
        ? Object.freeze<readonly {
            readonly value: string;
            readonly stackSection: TenantStackTargetSeed["stackSection"];
            readonly role: SdlcMaterializedProductFileRole;
            readonly targetKind?: SdlcProductMaterializationAuthorityTarget["targetKind"];
          }[]>([])
        : [
            ...objectFieldsStringList(nested, [
              ...implementationBuildConfigKeys,
              ...testingBuildConfigKeys
            ]).map((value) =>
              Object.freeze({
                value,
                stackSection: "testing" as const,
                role: "build_config" as const
              })
            ),
            ...objectFieldsStringList(nested, testingRootKeys).map((value) =>
              Object.freeze({
                value,
                stackSection: "testing" as const,
                role: "test" as const,
                targetKind: "directory" as const
              })
            ),
            ...objectFieldsStringList(nested, testingFileKeys).map((value) =>
              Object.freeze({
                value,
                stackSection: "testing" as const,
                role: "test" as const
              })
            )
          ];
    })
  ];
  return tenantStackBuildConfigSeedsFromValues({
    manifest: input.manifest,
    sourceRef: input.sourceRef,
    values,
    declaresStackSemantics: unknownDeclaresTenantStackSemantics(record),
    declaresExecutionEnvironment:
      unknownDeclaresTenantExecutionEnvironment(record)
  });
}

function tenantStackBuildConfigSeedsFromMarkdown(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly sourceRef: string;
  readonly markdown: string;
}): TenantStackSeedReadResult {
  const sections = markdownSectionBodies({
    markdown: input.markdown,
    titlePattern:
      /^(?:required\s+)?(?:(?:test(?:ing)?[-\s_]+)?build[-\s_]?config|build\s+configuration|manifest)\s+(?:targets?|files?)$/iu
  });
  const values: string[] = [];
  for (const section of sections) {
    let fenced = false;
    for (const line of section.split(/\r?\n/u)) {
      if (/^\s*```/u.test(line)) {
        fenced = !fenced;
        continue;
      }
      let addedCodeSpan = false;
      for (const match of line.matchAll(/`([^`]+)`/gu)) {
        const codeSpan = match[1];
        if (codeSpan !== undefined) {
          values.push(codeSpan);
          addedCodeSpan = true;
        }
      }
      if (addedCodeSpan) {
        continue;
      }
      if (fenced) {
        values.push(line);
        continue;
      }
      const bullet = /^\s*[-*]\s+(.+)$/u.exec(line);
      if (bullet?.[1] !== undefined) {
        values.push(bullet[1]);
      }
    }
  }
  return tenantStackBuildConfigSeedsFromValues({
    manifest: input.manifest,
    sourceRef: input.sourceRef,
    values: values.map((value) =>
      Object.freeze({
        value,
        stackSection: input.sourceRef.includes("TESTING_TECH_STACK")
          ? "testing" as const
          : "implementation" as const,
        role: "build_config" as const
      })
    ),
    declaresStackSemantics: markdownDeclaresTenantStackSemantics(input.markdown),
    declaresExecutionEnvironment:
      markdownDeclaresTenantExecutionEnvironment(input.markdown)
  });
}

function tenantStackBuildConfigSeedsFromValues(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly sourceRef: string;
  readonly values: readonly {
    readonly value: string;
    readonly stackSection: TenantStackTargetSeed["stackSection"];
    readonly role: SdlcMaterializedProductFileRole;
    readonly targetKind?: SdlcProductMaterializationAuthorityTarget["targetKind"];
  }[];
  readonly declaresStackSemantics: boolean;
  readonly declaresExecutionEnvironment: boolean;
}): TenantStackSeedReadResult {
  const seeds = new Map<string, TenantStackTargetSeed>();
  const reasonRefs = new Set<string>();
  for (const entry of input.values) {
    const seed = tenantStackTargetSeed({
      manifest: input.manifest,
      sourceRef: input.sourceRef,
      stackSection: entry.stackSection,
      value: entry.value,
      role: entry.role,
      targetKind: entry.targetKind
    });
    if (seed === null) {
      reasonRefs.add(
        `tenant_stack_invalid_target:${input.sourceRef}:${entry.value}`
      );
      continue;
    }
    const prior = seeds.get(seed.path);
    if (
      prior?.stackSection === "implementation" &&
      seed.stackSection === "testing"
    ) {
      continue;
    }
    seeds.set(seed.path, seed);
  }
  return Object.freeze({
    seeds: Object.freeze(
      [...seeds.values()].sort((left, right) => left.path.localeCompare(right.path))
    ),
    reasonRefs: Object.freeze([...reasonRefs].sort()),
    declaresStackSemantics: input.declaresStackSemantics,
    declaresExecutionEnvironment: input.declaresExecutionEnvironment
  });
}

function tenantStackAuthorityFor(
  manifest: SdlcWorkerHandoffManifest
): TenantStackAuthority {
  const targetSeeds = new Map<string, TenantStackTargetSeed>();
  const buildConfigSeeds = new Map<string, TenantStackTargetSeed>();
  const sourceRefs = new Set<string>();
  const reasonRefs = new Set<string>();
  let declaresStackSemantics = false;
  let declaresExecutionEnvironment = false;
  for (const filePath of tenantStackSpecFiles(manifest)) {
    const sourceRef = pathToFileURL(filePath).href;
    sourceRefs.add(sourceRef);
    const content = readFileSync(filePath, "utf8");
    const normalizedFile = filePath.toLowerCase();
    let result: TenantStackSeedReadResult = Object.freeze({
      seeds: Object.freeze([]),
      reasonRefs: Object.freeze([]),
      declaresStackSemantics: false,
      declaresExecutionEnvironment: false
    });
    if (normalizedFile.endsWith(".json")) {
      try {
        result = tenantStackBuildConfigSeedsFromJson({
          manifest,
          sourceRef,
          parsed: JSON.parse(content)
        });
      } catch {
        reasonRefs.add(`tenant_stack_spec_parse_failed:${filePath}`);
      }
    } else {
      result = tenantStackBuildConfigSeedsFromMarkdown({
        manifest,
        sourceRef,
        markdown: content
      });
    }
    for (const reasonRef of result.reasonRefs) {
      reasonRefs.add(reasonRef);
    }
    declaresStackSemantics = declaresStackSemantics || result.declaresStackSemantics;
    declaresExecutionEnvironment =
      declaresExecutionEnvironment || result.declaresExecutionEnvironment;
    for (const seed of result.seeds) {
      const prior = targetSeeds.get(seed.path);
      if (
        prior?.stackSection === "implementation" &&
        seed.stackSection === "testing"
      ) {
        continue;
      }
      targetSeeds.set(seed.path, seed);
      if (seed.requiredRole === "build_config") {
        buildConfigSeeds.set(seed.path, seed);
      }
    }
  }
  if (sourceRefs.size > 0 && !declaresStackSemantics) {
    reasonRefs.add("tenant_stack_authority_undefined");
  }
  if (
    sourceRefs.size > 0 &&
    declaresStackSemantics &&
    !declaresExecutionEnvironment &&
    manifest.productMaterialization.required
  ) {
    reasonRefs.add("tenant_stack_execution_environment_missing");
  }
  const orderedTargetSeeds = Object.freeze(
    [...targetSeeds.values()].sort((left, right) =>
      left.path.localeCompare(right.path)
    )
  );
  const orderedBuildConfigSeeds = Object.freeze(
    orderedTargetSeeds.filter((seed) => seed.requiredRole === "build_config")
  );
  const orderedSourceRefs = Object.freeze([...sourceRefs].sort());
  const orderedReasonRefs = Object.freeze([...reasonRefs].sort());
  return Object.freeze({
    targetSeeds: orderedTargetSeeds,
    buildConfigSeeds: orderedBuildConfigSeeds,
    sourceRefs: orderedSourceRefs,
    reasonRefs: orderedReasonRefs,
    carrier: constructSdlcTenantTechnologyStackAuthority({
      required: manifest.productMaterialization.required,
      buildConfigTargets: orderedBuildConfigSeeds.map((seed) =>
        Object.freeze({
          path: seed.path,
          stackSection: seed.stackSection,
          sourceRef: seed.sourceRef
        })
      ),
      sourceRefs: orderedSourceRefs,
      reasonRefs: orderedReasonRefs
    })
  });
}

function tenantStackAuthorityTargetsFor(
  manifest: SdlcWorkerHandoffManifest
): {
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
} {
  const authority = tenantStackAuthorityFor(manifest);
  if (authority.targetSeeds.length === 0) {
    return Object.freeze({
      targets: Object.freeze([]),
      sourceRefs: authority.sourceRefs,
      reasonRefs: authority.reasonRefs
    });
  }
  return Object.freeze({
    targets: tenantStackTargetContractsFromSeeds({ manifest, seeds: authority.targetSeeds }),
    sourceRefs: authority.sourceRefs,
    reasonRefs: authority.reasonRefs
  });
}

function tenantStackTargetContractsFromSeeds(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly seeds: readonly TenantStackTargetSeed[];
}): readonly SdlcProductMaterializationAuthorityTarget[] {
  const targets = new Map<string, SdlcProductMaterializationAuthorityTarget>();
  for (const seed of input.seeds) {
    const prior = targets.get(seed.path);
    if (
      prior?.policyRef?.includes("/tenant-stack/implementation/") &&
      seed.stackSection === "testing"
    ) {
      continue;
    }
    const rolePolicy = materializationRolePolicyForTarget({
      manifest: input.manifest,
      seed
    });
    targets.set(
      seed.path,
      Object.freeze({
        kind: "sdlc_product_materialization_authority_target" as const,
        path: seed.path,
        targetKind: seed.targetKind,
        requiredRole: rolePolicy.requiredRole,
        policyRef: rolePolicy.policyRef,
        source: "tenant_stack_authority" as const,
        sourceRef: seed.sourceRef
      })
    );
  }
  return Object.freeze(
    [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

function tenantStackBuildConfigTargetCoversRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): boolean {
  const relativePath = input.relativePath.replace(/\\/gu, "/").toLowerCase();
  return tenantStackAuthorityFor(input.manifest).buildConfigSeeds.some((seed) => {
    if (!tenantStackTargetAppliesToCurrentMaterialization({ manifest: input.manifest, target: seed })) {
      return false;
    }
    const targetRelative = targetRelativeToSelectedOutputRoot({
      targetPath: seed.path,
      selectedOutputRoot:
        input.manifest.productMaterialization.selectedOutputRoot
    }).toLowerCase();
    return (
      relativePath === targetRelative ||
      relativePath.startsWith(`${targetRelative}/`)
    );
  });
}

export function tenantStackDeclaredMaterializedRoleForRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): SdlcMaterializedProductFileRole | null {
  const relativePath = input.relativePath.replace(/\\/gu, "/").toLowerCase();
  const target = tenantStackAuthorityFor(input.manifest).targetSeeds.find((seed) => {
    if (!tenantStackTargetAppliesToCurrentMaterialization({ manifest: input.manifest, target: seed })) {
      return false;
    }
    const targetRelative = targetRelativeToSelectedOutputRoot({
      targetPath: seed.path,
      selectedOutputRoot:
        input.manifest.productMaterialization.selectedOutputRoot
    }).toLowerCase();
    return seed.targetKind === "file"
      ? relativePath === targetRelative
      : relativePath === targetRelative ||
          relativePath.startsWith(`${targetRelative}/`);
  });
  return target?.requiredRole ?? null;
}

function tenantStackTargetAppliesToCurrentMaterialization(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly target: { readonly policyRef: string | null };
}): boolean {
  if (!input.target.policyRef?.includes("/tenant-stack/testing/")) {
    return true;
  }
  return (
    input.manifest.targetAssetType === "component_test_surface" ||
    productMaterializationRequiresTestExecutionEvidence(input.manifest)
  );
}

function testTargetSeedFromDesignRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): DeclaredProductTargetSeed | null {
  const normalizedRelativePath = input.relativePath
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^\.\//u, "")
    .replace(/^\/+/u, "");
  const selectedOutputRoot = normalizedSelectedOutputRoot(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  const candidate = normalizedRelativePath.startsWith(`${selectedOutputRoot}/`)
    ? normalizedRelativePath
    : `${selectedOutputRoot}/${normalizedRelativePath}`;
  const relativeToOutputRoot = targetRelativeToSelectedOutputRoot({
    targetPath: candidate,
    selectedOutputRoot
  });
  if (
    relativeToOutputRoot === ".ai-workspace" ||
    relativeToOutputRoot.startsWith(".ai-workspace/") ||
    relativeToOutputRoot.includes("/.ai-workspace/")
  ) {
    return null;
  }
  const normalized = normalizeDeclaredProductFileTarget({
    value: candidate,
    selectedOutputRoot
  });
  if (normalized === null) {
    return null;
  }
  return Object.freeze({
    ...normalized,
    requiredRole: "test" as const,
    policyRef: "target-role-policy://odd-sdlc/product-test-tree"
  });
}

function testcaseRefIsUatLane(testcaseId: string): boolean {
  const normalized = testcaseId.trim().toLowerCase();
  return (
    /^tc:\/\/[^/]+\/uat(?:\/|$)/u.test(normalized) ||
    /^test-case:\/\/[^/]+\/uat(?:\/|$)/u.test(normalized)
  );
}

function testcaseRefKey(testcaseId: string): string {
  return testcaseId.trim().toLowerCase();
}

function testCaseRowIsUatLane(row: {
  readonly testCaseRef: string;
  readonly caseKind: string;
  readonly executionLane: string;
}): boolean {
  return (
    row.caseKind.trim().toLowerCase() === "uat" ||
    row.executionLane.trim().toLowerCase() === "uat" ||
    testcaseRefIsUatLane(row.testCaseRef)
  );
}

function testTopologyRowCarriesUatCase(input: {
  readonly testcaseIds: readonly string[];
}): boolean {
  return input.testcaseIds.some((testcaseId) =>
    testcaseRefIsUatLane(testcaseId)
  );
}

function uatLinkedTestcaseRefKeys(
  register: SdlcTestDesignRegister
): ReadonlySet<string> {
  const refs = new Set<string>();
  const uatTestcaseRefs = new Set<string>();
  for (const row of register.uatTestcaseRows) {
    if (!testCaseRowIsUatLane(row)) {
      continue;
    }
    const uatRef = testcaseRefKey(row.testCaseRef);
    uatTestcaseRefs.add(uatRef);
    refs.add(uatRef);
    for (const authorityRef of row.testcaseAuthorityRefs) {
      refs.add(testcaseRefKey(authorityRef));
    }
  }
  for (const binding of register.uatIntegrationBindings) {
    const uatRef = testcaseRefKey(binding.uatTestCaseRef);
    if (
      !uatTestcaseRefs.has(uatRef) &&
      !testcaseRefIsUatLane(binding.uatTestCaseRef)
    ) {
      continue;
    }
    refs.add(uatRef);
    refs.add(testcaseRefKey(binding.integrationTestCaseRef));
  }
  return refs;
}

function testTopologyRowCarriesUatDesignCase(input: {
  readonly testcaseIds: readonly string[];
  readonly uatLinkedTestcaseRefs: ReadonlySet<string>;
}): boolean {
  return input.testcaseIds.some(
    (testcaseId) =>
      testcaseRefIsUatLane(testcaseId) ||
      input.uatLinkedTestcaseRefs.has(testcaseRefKey(testcaseId))
  );
}

function designTargetSeedFromFileTargetRow(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
  readonly role: string;
}): DeclaredProductTargetSeed | null {
  const normalizedRelativePath = input.relativePath
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^\.\//u, "")
    .replace(/^\/+/u, "");
  const selectedOutputRoot = normalizedSelectedOutputRoot(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  const candidate = normalizedRelativePath.startsWith(`${selectedOutputRoot}/`)
    ? normalizedRelativePath
    : `${selectedOutputRoot}/${normalizedRelativePath}`;
  const relativeToOutputRoot = targetRelativeToSelectedOutputRoot({
    targetPath: candidate,
    selectedOutputRoot
  });
  if (
    relativeToOutputRoot === ".ai-workspace" ||
    relativeToOutputRoot.startsWith(".ai-workspace/") ||
    relativeToOutputRoot.includes("/.ai-workspace/")
  ) {
    return null;
  }
  const normalized = normalizeDeclaredProductFileTarget({
    value: candidate,
    selectedOutputRoot
  });
  if (normalized === null) {
    return null;
  }
  const requiredRole = materializedProductFileRoleFromText(input.role);
  return Object.freeze({
    ...normalized,
    requiredRole,
    policyRef:
      requiredRole === null
        ? null
        : `target-role-policy://odd-sdlc/implementation-design/${requiredRole}`
  });
}

function designSourceTargetSeedFromComponentRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly relativePath: string;
}): DeclaredProductTargetSeed | null {
  const normalizedRelativePath = input.relativePath
    .replace(/\\/gu, "/")
    .replace(/^workspace:\/\//u, "")
    .replace(/^\.\//u, "")
    .replace(/^\/+/u, "");
  const selectedOutputRoot = normalizedSelectedOutputRoot(
    input.manifest.productMaterialization.selectedOutputRoot
  );
  const candidate = normalizedRelativePath.startsWith(`${selectedOutputRoot}/`)
    ? normalizedRelativePath
    : `${selectedOutputRoot}/${normalizedRelativePath}`;
  const relativeToOutputRoot = targetRelativeToSelectedOutputRoot({
    targetPath: candidate,
    selectedOutputRoot
  });
  const lowerRelative = relativeToOutputRoot.toLowerCase();
  const declaredRole = tenantStackDeclaredMaterializedRoleForRelativePath({
    manifest: input.manifest,
    relativePath: relativeToOutputRoot
  });
  if (
    lowerRelative.length === 0 ||
    lowerRelative === ".ai-workspace" ||
    lowerRelative.startsWith(".ai-workspace/") ||
    lowerRelative.includes("/.ai-workspace/") ||
    declaredRole === "test"
  ) {
    return null;
  }
  if (declaredRole !== null && declaredRole !== "source") {
    return null;
  }
  const looksLikeSourceFile =
    declaredRole === "source" ||
    lowerRelative.includes(".") ||
    lowerRelative.startsWith("src/") ||
    lowerRelative.startsWith("lib/") ||
    lowerRelative.startsWith("app/") ||
    lowerRelative.startsWith("code/");
  if (!looksLikeSourceFile) {
    return null;
  }
  return designTargetSeedFromFileTargetRow({
    manifest: input.manifest,
    relativePath: candidate,
    role: "source"
  });
}

function mergeTargetSeeds(
  primary: readonly DeclaredProductTargetSeed[],
  additions: readonly DeclaredProductTargetSeed[]
): readonly DeclaredProductTargetSeed[] {
  const seeds = new Map<string, DeclaredProductTargetSeed>();
  for (const seed of primary) {
    seeds.set(seed.path, seed);
  }
  for (const seed of additions) {
    if (!seeds.has(seed.path)) {
      seeds.set(seed.path, seed);
    }
  }
  return Object.freeze(
    [...seeds.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

function componentCodeSurfaceConsumesDesignFileTargetRole(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly role: string;
}): boolean {
  const normalizedRole = materializedProductFileRoleFromText(input.role);
  if (normalizedRole === "source" || normalizedRole === "build_config") {
    return true;
  }
  return false;
}

function designAssetAuthorityTargetsFor(
  manifest: SdlcWorkerHandoffManifest
): {
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly sourceRefs: readonly string[];
} {
  if (manifest.targetAssetType === "component_code_surface") {
    const register = readAdmittedImplementationDesign(manifest);
    if (register === null) {
      return Object.freeze({
        targets: Object.freeze([]),
        sourceRefs: Object.freeze([])
      });
    }
    const sourceFile = componentDepthSurfaceFile(
      manifest,
      "implementation_design_surface"
    );
    const sourceRef =
      sourceFile === null
        ? pathToFileURL(manifest.outputFile).href
        : pathToFileURL(sourceFile).href;
    const fileTargetSeeds = register.fileTargetRows
      .filter((row) =>
        componentCodeSurfaceConsumesDesignFileTargetRole({
          manifest,
          role: row.role
        })
      )
      .map((row) =>
        designTargetSeedFromFileTargetRow({
          manifest,
          relativePath: row.relativePath,
          role: row.role
        })
      )
      .filter((seed): seed is DeclaredProductTargetSeed => seed !== null);
    const componentSourceSeeds = register.componentRealizationRows
      .map((row) =>
        designSourceTargetSeedFromComponentRelativePath({
          manifest,
          relativePath: row.relativePath
        })
      )
      .filter((seed): seed is DeclaredProductTargetSeed => seed !== null);
    const seeds = mergeTargetSeeds(fileTargetSeeds, componentSourceSeeds);
    return Object.freeze({
      targets: targetContractsFromSeeds({
        source: "design_asset_authority",
        sourceRef,
        manifest,
        seeds
      }),
      sourceRefs: Object.freeze([sourceRef])
    });
  }
  if (
    manifest.targetAssetType !== "component_test_surface" &&
    manifest.targetAssetType !== "uat_test_source_surface"
  ) {
    return Object.freeze({
      targets: Object.freeze([]),
      sourceRefs: Object.freeze([])
    });
  }
  const uatOnly = manifest.targetAssetType === "uat_test_source_surface";
  const currentAdmission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile
  });
  const currentOutputSourceRef =
    currentAdmission.evidenceRefs[0] ?? pathToFileURL(manifest.outputFile).href;
  const currentOutputTargets =
    currentAdmission.status === "admitted" && currentAdmission.register !== null
      ? targetContractsFromSeeds({
          source: "design_asset_authority",
          sourceRef: currentOutputSourceRef,
          manifest,
          seeds: currentAdmission.register.componentTestRows
            .filter((row) => !uatOnly || testTopologyRowCarriesUatCase(row))
            .map((row) =>
              testTargetSeedFromDesignRelativePath({
                manifest,
                relativePath: row.relativePath
              })
            )
            .filter((seed): seed is DeclaredProductTargetSeed => seed !== null)
        })
      : Object.freeze([] as const);
  const currentOutputAdmitted =
    currentAdmission.status === "admitted" && currentAdmission.register !== null;
  const testDesign = currentOutputAdmitted
    ? null
    : readAdmittedTestDesign(manifest);
  const uatLinkedTestcaseRefs =
    uatOnly && testDesign !== null
      ? uatLinkedTestcaseRefKeys(testDesign.register)
      : null;
  const testDesignTargets =
    testDesign === null
      ? Object.freeze([] as const)
      : targetContractsFromSeeds({
          source: "design_asset_authority",
          sourceRef: testDesign.sourceRef,
          manifest,
          seeds: testDesign.register.testComponentTopologyRows
            .filter(
              (row) =>
                !uatOnly ||
                (uatLinkedTestcaseRefs !== null &&
                  testTopologyRowCarriesUatDesignCase({
                    ...row,
                    uatLinkedTestcaseRefs
                  }))
            )
            .map((row) =>
              testTargetSeedFromDesignRelativePath({
                manifest,
                relativePath: row.relativePath
              })
            )
            .filter((seed): seed is DeclaredProductTargetSeed => seed !== null)
        });
  const targets = currentOutputAdmitted
    ? currentOutputTargets
    : testDesignTargets;
  return Object.freeze({
    targets,
    sourceRefs: uniqueSorted([
      ...(testDesign === null ? [] : [testDesign.sourceRef]),
      ...(currentAdmission.status === "admitted" ? [currentOutputSourceRef] : [])
    ])
  });
}

function normalizedSelectedOutputRoot(input: string): string {
  return input.replace(/\\/gu, "/").replace(/\/+$/u, "");
}

export function targetRelativeToSelectedOutputRoot(input: {
  readonly targetPath: string;
  readonly selectedOutputRoot: string;
}): string {
  const outputRoot = normalizedSelectedOutputRoot(input.selectedOutputRoot);
  const targetPath = input.targetPath.replace(/\\/gu, "/").replace(/\/+$/u, "");
  if (targetPath === outputRoot) {
    return "";
  }
  if (targetPath.startsWith(`${outputRoot}/`)) {
    return targetPath.slice(outputRoot.length + 1);
  }
  return targetPath;
}

function productAuthorityTargetIsSharedForFeatureScope(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly target: SdlcProductMaterializationAuthorityTarget;
}): boolean {
  const relativeTarget = targetRelativeToSelectedOutputRoot({
    targetPath: input.target.path,
    selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot
  });
  return (
    relativeTarget === "" ||
    tenantStackBuildConfigTargetCoversRelativePath({
      manifest: input.manifest,
      relativePath: relativeTarget
    })
  );
}

function productAuthorityTargetMatchesIncludedModule(input: {
  readonly target: SdlcProductMaterializationAuthorityTarget;
  readonly selectedOutputRoot: string;
  readonly includedModuleNames: readonly string[];
}): boolean {
  const selectedOutputRoot = normalizedSelectedOutputRoot(input.selectedOutputRoot);
  const targetPath = input.target.path.replace(/\\/gu, "/").replace(/\/+$/u, "");
  const selectedOutputRootParts = selectedOutputRoot
    .split("/")
    .filter((part) => part.length > 0);
  const selectedOutputRootModuleName =
    selectedOutputRootParts[selectedOutputRootParts.length - 1] ?? "";
  if (
    selectedOutputRootModuleName.length > 0 &&
    input.includedModuleNames.includes(selectedOutputRootModuleName) &&
    (targetPath === selectedOutputRoot ||
      targetPath.startsWith(`${selectedOutputRoot}/`))
  ) {
    return true;
  }
  const relativeTarget = targetRelativeToSelectedOutputRoot({
    targetPath: input.target.path,
    selectedOutputRoot: input.selectedOutputRoot
  });
  const parts = relativeTarget.split("/").filter((part) => part.length > 0);
  return input.includedModuleNames.some((moduleName) =>
    parts.includes(moduleName)
  );
}

function scopeProductMaterializationAuthorityTargets(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
}): readonly SdlcProductMaterializationAuthorityTarget[] {
  if (
    (input.manifest.featureScope.mode !== "steel_thread" &&
      input.manifest.featureScope.mode !== "targeted_repair") ||
    input.manifest.featureScope.includedModuleNames.length === 0 ||
    !input.manifest.productMaterialization.required
  ) {
    return input.targets;
  }
  const includedAllDeclaredModules =
    input.manifest.productMaterialization.declaredModuleNames.length > 0 &&
    input.manifest.productMaterialization.declaredModuleNames.every((moduleName) =>
      input.manifest.featureScope.includedModuleNames.includes(moduleName)
    );
  return Object.freeze(
    input.targets.filter(
      (target) =>
        (includedAllDeclaredModules &&
          targetRelativeToSelectedOutputRoot({
            targetPath: target.path,
            selectedOutputRoot:
              input.manifest.productMaterialization.selectedOutputRoot
          }) !== "") ||
        productAuthorityTargetIsSharedForFeatureScope({
          manifest: input.manifest,
          target
        }) ||
        productAuthorityTargetMatchesIncludedModule({
          target,
          selectedOutputRoot:
            input.manifest.productMaterialization.selectedOutputRoot,
          includedModuleNames: input.manifest.featureScope.includedModuleNames
        })
    )
  );
}

function sameTargetSet(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function targetsForCurrentMaterializationEdge(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly targets: readonly SdlcProductMaterializationAuthorityTarget[];
}): readonly SdlcProductMaterializationAuthorityTarget[] {
  return Object.freeze(
    input.targets.filter(
      (target) =>
        tenantStackTargetAppliesToCurrentMaterialization({
          manifest: input.manifest,
          target
        }) &&
        (input.manifest.targetAssetType !== "component_code_surface" ||
          target.requiredRole !== "test") &&
        (input.manifest.targetAssetType !== "component_test_surface" ||
          target.requiredRole === "test" ||
          target.requiredRole === "build_config")
    )
  );
}

function mergeAuthorityTargets(
  primary: readonly SdlcProductMaterializationAuthorityTarget[],
  additions: readonly SdlcProductMaterializationAuthorityTarget[]
): readonly SdlcProductMaterializationAuthorityTarget[] {
  const targets = new Map<string, SdlcProductMaterializationAuthorityTarget>();
  for (const target of primary) {
    targets.set(target.path, target);
  }
  for (const target of additions) {
    if (!targets.has(target.path)) {
      targets.set(target.path, target);
    }
  }
  return Object.freeze(
    [...targets.values()].sort((left, right) => left.path.localeCompare(right.path))
  );
}

function tenantStackTargetCanDeclareProductMaterialization(
  target: SdlcProductMaterializationAuthorityTarget
): boolean {
  return !(target.requiredRole === "test" && target.targetKind === "directory");
}

function tenantStackTargetsCanExtendCurrentMaterialization(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly currentDesignTargets: readonly SdlcProductMaterializationAuthorityTarget[];
}): boolean {
  return !(
    input.manifest.edgeName === FG_DERIVE_LITE_COMPONENT_CODE_SURFACE &&
    input.manifest.targetAssetType === "component_code_surface" &&
    input.currentDesignTargets.length > 0
  );
}

export function reconcileSdlcProductMaterializationAuthority(
  manifest: SdlcWorkerHandoffManifest
): SdlcProductMaterializationAuthorityReconciliation {
  const context = contextExpectedFileTargetsFor(manifest);
  const design = designAssetAuthorityTargetsFor(manifest);
  const tenantStack = tenantStackAuthorityTargetsFor(manifest);
  const requirement = requirementAuthorityTargetsFor(manifest);
  const product = productAuthorityTargetsFor(manifest);
  const contextTargets = scopeProductMaterializationAuthorityTargets({
    manifest,
    targets: context.targets
  });
  const designTargets = scopeProductMaterializationAuthorityTargets({
    manifest,
    targets: design.targets
  });
  const tenantStackTargets = scopeProductMaterializationAuthorityTargets({
    manifest,
    targets: tenantStack.targets
  });
  const requirementTargets = scopeProductMaterializationAuthorityTargets({
    manifest,
    targets: requirement.targets
  });
  const productTargets = scopeProductMaterializationAuthorityTargets({
    manifest,
    targets: product.targets
  });
  const currentDesignTargets = targetsForCurrentMaterializationEdge({
    manifest,
    targets: designTargets
  });
  const currentTenantStackTargets = targetsForCurrentMaterializationEdge({
    manifest,
    targets: tenantStackTargets
  });
  const currentTenantStackMaterializationTargets =
    tenantStackTargetsCanExtendCurrentMaterialization({
      manifest,
      currentDesignTargets
    })
      ? currentTenantStackTargets.filter(tenantStackTargetCanDeclareProductMaterialization)
      : Object.freeze([] as const);
  const currentRequirementTargets = targetsForCurrentMaterializationEdge({
    manifest,
    targets: requirementTargets
  });
  const currentProductTargets = targetsForCurrentMaterializationEdge({
    manifest,
    targets: productTargets
  });
  const contextTargetPaths = uniqueSorted(contextTargets.map((target) => target.path));
  const designTargetPaths = uniqueSorted(designTargets.map((target) => target.path));
  const tenantStackTargetPaths = uniqueSorted(
    tenantStackTargets.map((target) => target.path)
  );
  const requirementTargetPaths = uniqueSorted(
    requirementTargets.map((target) => target.path)
  );
  const productTargetPaths = uniqueSorted(productTargets.map((target) => target.path));
  const baseDeclaredProductTargetContracts =
    currentRequirementTargets.length > 0
      ? currentRequirementTargets
      : currentDesignTargets.length > 0
        ? currentDesignTargets
        : currentProductTargets;
  const declaredProductTargetContracts = mergeAuthorityTargets(
    baseDeclaredProductTargetContracts,
    currentTenantStackMaterializationTargets
  );
  const declaredProductFileTargets = uniqueSorted(
    declaredProductTargetContracts.map((target) => target.path)
  );
  const reasonRefs = new Set<string>(context.reasonRefs);
  const tenantStackStatus = decideSdlcTenantStackAuthorityStatus({
    required: manifest.productMaterialization.required,
    sourceRefs: tenantStack.sourceRefs,
    reasonRefs: tenantStack.reasonRefs
  });
  if (tenantStackStatus.status === "missing") {
    reasonRefs.add("tenant_stack_authority_missing");
  }
  if (tenantStackStatus.status === "invalid") {
    reasonRefs.add("tenant_stack_authority_invalid");
  }
  if (contextTargetPaths.length > 0) {
    reasonRefs.add("context_expected_files_observation_only");
  }
  if (
    contextTargets.length !== context.targets.length ||
    designTargets.length !== design.targets.length ||
    tenantStackTargets.length !== tenantStack.targets.length ||
    requirementTargets.length !== requirement.targets.length ||
    productTargets.length !== product.targets.length
  ) {
    reasonRefs.add(
      `product_targets_scoped_by_feature_scope:${manifest.featureScope.includedModuleNames.join(",")}`
    );
  }
  if (designTargetPaths.length > 0) {
    reasonRefs.add("design_asset_materialization_targets");
  }
  if (tenantStackTargetPaths.length > 0) {
    reasonRefs.add("tenant_stack_materialization_targets");
  }
  if (
    requirementTargetPaths.length > 0 &&
    designTargetPaths.length > 0 &&
    !sameTargetSet(requirementTargetPaths, designTargetPaths)
  ) {
    reasonRefs.add("requirement_design_target_mismatch");
  }
  if (
    requirementTargetPaths.length > 0 &&
    productTargetPaths.length > 0 &&
    !sameTargetSet(requirementTargetPaths, productTargetPaths)
  ) {
    reasonRefs.add("requirement_product_target_mismatch");
  }
  if (
    contextTargetPaths.length > 0 &&
    declaredProductFileTargets.length > 0 &&
    !sameTargetSet(contextTargetPaths, declaredProductFileTargets)
  ) {
    reasonRefs.add(
      requirementTargetPaths.length > 0
        ? "declared_context_target_mismatch"
        : "product_context_target_mismatch"
    );
  }
  if (
    manifest.productMaterialization.required &&
    declaredProductFileTargets.length === 0
  ) {
    reasonRefs.add("declared_product_file_targets_missing");
  }
  return Object.freeze({
    kind: "sdlc_product_materialization_authority_reconciliation",
    status: !manifest.productMaterialization.required
      ? "not_required"
      : tenantStackStatus.status === "missing" ||
          tenantStackStatus.status === "invalid"
        ? "ambiguous"
        : declaredProductFileTargets.length > 0
          ? "passed"
          : "missing",
    selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot,
    contextExpectedFileTargets: contextTargetPaths,
    designAssetAuthorityTargets: designTargetPaths,
    tenantStackAuthorityTargets: tenantStackTargetPaths,
    requirementAuthorityTargets: requirementTargetPaths,
    productAuthorityTargets: productTargetPaths,
    declaredProductFileTargets,
    contextExpectedTargetContracts: contextTargets,
    designAssetAuthorityTargetContracts: designTargets,
    tenantStackAuthorityTargetContracts: tenantStackTargets,
    requirementAuthorityTargetContracts: requirementTargets,
    productAuthorityTargetContracts: productTargets,
    declaredProductTargetContracts,
    sourceRefs: uniqueSorted([
      ...context.sourceRefs,
      ...design.sourceRefs,
      ...tenantStack.sourceRefs,
      ...requirement.sourceRefs,
      ...product.sourceRefs
    ]),
    reasonRefs: Object.freeze([...reasonRefs].sort())
  });
}

export function declaredProductFileTargets(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return reconcileSdlcProductMaterializationAuthority(manifest)
    .declaredProductFileTargets;
}

function productMaterializationAuthorityNeedsTenantStackRepair(
  authority: Pick<SdlcProductMaterializationAuthorityReconciliation, "reasonRefs">
): boolean {
  return (
    !authority.reasonRefs.includes("declared_product_file_targets_missing") &&
    (authority.reasonRefs.includes("tenant_stack_authority_missing") ||
      authority.reasonRefs.includes("tenant_stack_authority_invalid"))
  );
}

export function sdlcProductMaterializationLaunchBlocker(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly authority?: SdlcProductMaterializationAuthorityReconciliation | undefined;
}): string | null {
  if (!input.manifest.productMaterialization.required) {
    return null;
  }
  const authority =
    input.authority ??
    reconcileSdlcProductMaterializationAuthority(input.manifest);
  const missingRequiredRoles =
    input.manifest.productMaterialization.requiredRoles.filter(
      (role) =>
        !authority.declaredProductTargetContracts.some(
          (target) => target.requiredRole === role
        )
    );
  if (missingRequiredRoles.length > 0) {
    if (productMaterializationAuthorityNeedsTenantStackRepair(authority)) {
      return null;
    }
    if (
      input.manifest.targetAssetType === "component_code_surface" &&
      missingRequiredRoles.length === 1 &&
      missingRequiredRoles[0] === "source"
    ) {
      return "component_code_source_materialization_targets_missing";
    }
    if (authority.declaredProductFileTargets.length === 0) {
      return `${input.manifest.targetAssetType}_materialization_targets_missing`;
    }
    return `${input.manifest.targetAssetType}_${missingRequiredRoles.join("_")}_materialization_targets_missing`;
  }
  if (authority.declaredProductFileTargets.length === 0) {
    return `${input.manifest.targetAssetType}_materialization_targets_missing`;
  }
  return null;
}

export function assertSdlcProductMaterializationLaunchable(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly authority?: SdlcProductMaterializationAuthorityReconciliation | undefined;
}): void {
  const authority =
    input.authority ??
    reconcileSdlcProductMaterializationAuthority(input.manifest);
  const blocker = sdlcProductMaterializationLaunchBlocker({
    manifest: input.manifest,
    authority
  });
  if (blocker === null) {
    return;
  }
  throw new TypeError(
    [
      `sdlc_product_materialization_launch_blocked:${blocker}`,
      `edge=${input.manifest.edgeName}`,
      `target=${input.manifest.targetAssetType}`,
      `status=${authority.status}`,
      `requiredRoles=${input.manifest.productMaterialization.requiredRoles.join(",") || "none"}`,
      `declaredProductFileTargets=${authority.declaredProductFileTargets.join(",") || "none"}`,
      `reasonRefs=${authority.reasonRefs.join(",") || "none"}`
    ].join("; ")
  );
}

export function effectiveProductMaterializationRequiredRoles(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcMaterializedProductFileRole[] {
  const roles = new Set<SdlcMaterializedProductFileRole>(
    manifest.productMaterialization.requiredRoles
  );
  for (const target of reconcileSdlcProductMaterializationAuthority(manifest)
    .declaredProductTargetContracts) {
    roles.add(target.requiredRole);
  }
  return Object.freeze(
    MATERIALIZED_PRODUCT_FILE_ROLES.filter((role) => roles.has(role))
  );
}

function textIfFile(filePath: string): string | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  return readFileSync(filePath, "utf8");
}

export function declaredBuildConfigRoleForObservedFile(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly normalizedRelativePath: string;
}): SdlcMaterializedProductFileRole | null {
  if (
    tenantStackBuildConfigTargetCoversRelativePath({
      manifest: input.manifest,
      relativePath: input.normalizedRelativePath
    })
  ) {
    return "build_config";
  }
  return null;
}

export function productAuthorityTargetCoversRelativePath(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly target: SdlcProductMaterializationAuthorityTarget;
  readonly normalizedRelativePath: string;
}): boolean {
  const targetRelativePath = targetRelativeToSelectedOutputRoot({
    targetPath: input.target.path,
    selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot
  }).toLowerCase();
  const relativePath = input.normalizedRelativePath.toLowerCase();
  if (input.target.targetKind === "file") {
    return relativePath === targetRelativePath;
  }
  return (
    relativePath === targetRelativePath ||
    relativePath.startsWith(`${targetRelativePath}/`)
  );
}

export function declaredProductAuthorityRoleForObservedFile(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly normalizedRelativePath: string;
}): SdlcMaterializedProductFileRole | null {
  const authority = reconcileSdlcProductMaterializationAuthority(input.manifest);
  const target = authority.declaredProductTargetContracts.find((candidate) =>
    productAuthorityTargetCoversRelativePath({
      manifest: input.manifest,
      target: candidate,
      normalizedRelativePath: input.normalizedRelativePath
    })
  );
  if (target === undefined) {
    return null;
  }
  return target.requiredRole;
}

function normalizedRelativePath(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
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

function readAdmittedTestDesign(
  manifest: SdlcWorkerHandoffManifest
): {
  readonly register: SdlcTestDesignRegister;
  readonly sourceRef: string;
} | null {
  const outputFile = componentDepthSurfaceFile(manifest, "test_design_surface");
  if (outputFile === null || !existsSync(outputFile)) {
    return null;
  }
  const admission = admitTestDesignRegisterFromArtifact({
    targetAssetType: "test_design_surface",
    outputFile
  });
  if (admission.status !== "admitted" || admission.register === null) {
    return null;
  }
  return Object.freeze({
    register: admission.register,
    sourceRef: admission.evidenceRefs[0] ?? pathToFileURL(outputFile).href
  });
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
