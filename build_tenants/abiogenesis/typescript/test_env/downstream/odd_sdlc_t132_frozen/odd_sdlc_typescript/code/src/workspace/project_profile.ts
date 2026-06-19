// Implements: REQ-F-ODDSDLC-026
// Implements: REQ-F-ODDSDLC-027
// Implements: REQ-F-ODDSDLC-028
// Implements: REQ-F-ODDSDLC-032
// Implements: REQ-F-ODDSDLC-053

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
import { FG_CONFORM_PROJECT } from "../graph/library.js";
import {
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString,
  parseString,
  parseStringList
} from "../shared/validation.js";
import { sha256Text } from "../shared/digest.js";
import {
  SDLC_REALIZATION_MODE_VALUES,
  type SdlcCapabilityContract,
  type SdlcConformProjectProfile,
  type SdlcConformProjectReport,
  type SdlcManagedTraversalManifest,
  type SdlcManagedTraversalPhaseContract,
  type SdlcProjectConstraints,
  type SdlcRealizationMode
} from "./carriers.js";
import {
  admitSdlcProfileOverlayStrategy,
  normalizeSdlcTraversalOverlayRef,
  sdlcTraversalOverlayRefForStrategy,
  SDLC_PROFILE_OVERLAY_STRATEGY_VALUES,
  type SdlcProfileOverlayStrategy
} from "../shared/overlay_strategy.js";
import {
  admitSdlcRuntimeLayout,
  standardSdlcRuntimeLayout
} from "./runtime_layout.js";

const PROJECT_CONSTRAINTS_RELATIVE_PATH =
  ".ai-workspace/context/project_constraints.yml" as const;
const INTENT_RELATIVE_PATH = "specification/INTENT.md" as const;
const PRODUCT_RELATIVE_PATH = "specification/PRODUCT.md" as const;
const GOALS_RELATIVE_PATH = "specification/GOALS.md" as const;
const IMPORTED_SOURCES_RELATIVE_PATH =
  "specification/requirements/00-imported-sources.md" as const;
const PROJECT_BOOTSTRAP_RELATIVE_PATH =
  ".ai-workspace/context/project_bootstrap.md" as const;
const TENANT_REGISTRY_RELATIVE_PATH = "build_tenants/TENANT_REGISTRY.md" as const;
const CONFORM_PROJECT_EXPECTED_OUTPUT_RELATIVE_PATHS = Object.freeze([
  PROJECT_BOOTSTRAP_RELATIVE_PATH,
  PROJECT_CONSTRAINTS_RELATIVE_PATH,
  TENANT_REGISTRY_RELATIVE_PATH
] as const);
const CONFORM_PROJECT_PHASE_CONTRACTS: readonly SdlcManagedTraversalPhaseContract[] =
  Object.freeze([
    Object.freeze({
      kind: "sdlc_managed_traversal_phase_contract",
      phase: "prestep",
      contract: "admit unordered source refs and project constraints before materialization"
    }),
    Object.freeze({
      kind: "sdlc_managed_traversal_phase_contract",
      phase: "execute",
      contract: "materialize runtime bootstrap read model, canonical constraints, and tenant registry only"
    }),
    Object.freeze({
      kind: "sdlc_managed_traversal_phase_contract",
      phase: "postprocess",
      contract: "evaluate actual topology against conform project report and expose residual gaps"
    })
  ]);
const IMPORT_SOURCE_EXTENSIONS = Object.freeze([
  ".md",
  ".markdown",
  ".txt",
  ".yml",
  ".yaml"
] as const);
const IMPORT_SOURCE_EXTENSION_SET: ReadonlySet<string> = new Set(
  IMPORT_SOURCE_EXTENSIONS
);
const IMPORT_SOURCE_IGNORED_DIRS = Object.freeze([
  ".abiogenesis",
  ".genesis",
  ".git",
  "build_tenants",
  "node_modules"
] as const);
const DEFAULT_AMBIGUITY_RISK_APPETITE = "medium" as const;
const UNDECLARED_EXECUTION_CONTRACT = "undeclared" as const;
const REALIZATION_SIGNAL_IGNORED_DIR_NAMES = Object.freeze([
  ".ai-workspace",
  ".abiogenesis",
  ".genesis",
  ".git"
] as const);

interface MutableTenant {
  readonly name: string;
  readonly values: Record<string, string>;
  readonly lists: Record<string, string[]>;
  readonly capabilityContracts: Record<string, string>;
}

interface ParsedConstraints {
  readonly values: Record<string, string>;
  readonly buildTenants: readonly MutableTenant[];
  readonly designTenants: readonly MutableTenant[];
}

function stripScalarQuotes(value: string): string {
  const stripped = value.trim();
  if (stripped.length >= 2) {
    const first = stripped[0];
    const last = stripped[stripped.length - 1];
    if ((first === "\"" || first === "'") && first === last) {
      return stripped.slice(1, -1);
    }
  }
  return stripped;
}

function stripInlineComment(value: string): string {
  let inSingle = false;
  let inDouble = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === "\"" && !inSingle) {
      inDouble = !inDouble;
    } else if (char === "#" && !inSingle && !inDouble) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function normalizedScalar(value: string): string {
  return stripScalarQuotes(stripInlineComment(value)).trim();
}

function canonicalTenantName(value: string): string {
  return value.trim();
}

function nonEmpty(value: string | undefined, fallback = ""): string {
  return value === undefined || value.trim().length === 0 ? fallback : value.trim();
}

function tenantRoot(activeTenant: string): string {
  return `build_tenants/${activeTenant}`;
}

function normalizeDeclaredOutputRoot(value: string, activeTenant: string): string {
  const normalized = nonEmpty(value, tenantRoot(activeTenant)).replace(/\\/g, "/");
  const trimmed = normalized.replace(/\/+$/u, "");
  return trimmed.length === 0 ? tenantRoot(activeTenant) : trimmed;
}

function canonicalSelectedOutputRoot(value: string, activeTenant: string): string {
  const declared = normalizeDeclaredOutputRoot(value, activeTenant);
  return declared.startsWith("build_tenants/") ? declared : tenantRoot(activeTenant);
}

function newTenant(name: string): MutableTenant {
  return {
    name: canonicalTenantName(name),
    values: {},
    lists: {},
    capabilityContracts: {}
  };
}

function upsertList(record: Record<string, string[]>, key: string, value: string): void {
  const list = record[key] ?? [];
  if (value.length > 0) {
    list.push(value);
  }
  record[key] = list;
}

function parseConstraintsText(content: string): ParsedConstraints {
  const values: Record<string, string> = {};
  const buildTenants = new Map<string, MutableTenant>();
  const designTenants: MutableTenant[] = [];
  let section = "";
  let inDesignTenants = false;
  let currentDesignTenant: MutableTenant | null = null;
  let currentBuildTenant: MutableTenant | null = null;
  let currentNestedKey = "";

  const flushDesignTenant = (): void => {
    if (currentDesignTenant !== null) {
      designTenants.push(currentDesignTenant);
      currentDesignTenant = null;
    }
  };

  for (const rawLine of content.split("\n")) {
    const stripped = rawLine.trim();
    if (stripped.length === 0 || stripped.startsWith("#")) {
      continue;
    }
    const indent = rawLine.length - rawLine.trimStart().length;

    if (indent === 0 && stripped === "project:") {
      flushDesignTenant();
      section = "project";
      inDesignTenants = false;
      currentBuildTenant = null;
      currentNestedKey = "";
      continue;
    }
    if (indent === 0 && stripped === "structure:") {
      flushDesignTenant();
      section = "structure";
      inDesignTenants = false;
      currentBuildTenant = null;
      currentNestedKey = "";
      continue;
    }
    if (indent === 0 && stripped === "constraints:") {
      flushDesignTenant();
      section = "constraints";
      inDesignTenants = false;
      currentBuildTenant = null;
      currentNestedKey = "";
      continue;
    }
    if (indent === 0 && stripped === "build_tenants:") {
      flushDesignTenant();
      section = "build_tenants";
      inDesignTenants = false;
      currentBuildTenant = null;
      currentNestedKey = "";
      continue;
    }
    if (indent === 0 && stripped === "runtime:") {
      flushDesignTenant();
      section = "runtime";
      inDesignTenants = false;
      currentBuildTenant = null;
      currentNestedKey = "";
      continue;
    }

    if (section === "structure" && stripped === "design_tenants:") {
      inDesignTenants = true;
      currentNestedKey = "";
      continue;
    }
    if (section === "structure" && stripped.startsWith("root_code_policy:")) {
      values["root_code_policy"] = normalizedScalar(splitKeyValue(stripped)[1]);
      inDesignTenants = false;
      flushDesignTenant();
      currentNestedKey = "";
      continue;
    }

    if (inDesignTenants && stripped.startsWith("- name:")) {
      flushDesignTenant();
      currentDesignTenant = newTenant(normalizedScalar(splitKeyValue(stripped)[1]));
      currentNestedKey = "";
      continue;
    }
    if (currentDesignTenant !== null && stripped === "capability_contracts:") {
      currentNestedKey = "capability_contracts";
      continue;
    }
    if (
      currentDesignTenant !== null &&
      currentNestedKey === "capability_contracts" &&
      indent >= 6 &&
      stripped.includes(":")
    ) {
      const [key, value] = splitKeyValue(stripped);
      currentDesignTenant.capabilityContracts[key] = normalizedScalar(value);
      continue;
    }
    if (
      currentDesignTenant !== null &&
      (currentNestedKey === "module_structure" || currentNestedKey === "frameworks") &&
      stripped.startsWith("- ")
    ) {
      upsertList(
        currentDesignTenant.lists,
        currentNestedKey,
        normalizedScalar(stripped.slice(2))
      );
      continue;
    }
    if (currentDesignTenant !== null && stripped.includes(":")) {
      const [key, value] = splitKeyValue(stripped);
      const normalized = normalizedScalar(value);
      if (normalized.length > 0) {
        currentDesignTenant.values[key] = normalized;
        currentNestedKey = "";
      } else {
        currentNestedKey = key;
      }
      continue;
    }

    if (section === "build_tenants" && indent === 2 && stripped.endsWith(":")) {
      const tenant = newTenant(stripped.slice(0, -1));
      buildTenants.set(tenant.name, tenant);
      currentBuildTenant = tenant;
      currentNestedKey = "";
      continue;
    }
    if (section === "build_tenants" && currentBuildTenant !== null && indent === 4 && stripped.includes(":")) {
      const [key, value] = splitKeyValue(stripped);
      const normalized = normalizedScalar(value);
      if (normalized.length > 0) {
        currentBuildTenant.values[key] = normalized;
        currentNestedKey = "";
      } else {
        currentNestedKey = key;
        if (key === "module_structure" || key === "frameworks") {
          currentBuildTenant.lists[key] = [];
        }
      }
      continue;
    }
    if (section === "build_tenants" && currentBuildTenant !== null && indent >= 6) {
      if (
        (currentNestedKey === "module_structure" || currentNestedKey === "frameworks") &&
        stripped.startsWith("- ")
      ) {
        upsertList(
          currentBuildTenant.lists,
          currentNestedKey,
          normalizedScalar(stripped.slice(2))
        );
        continue;
      }
      if (currentNestedKey === "capability_contracts" && stripped.includes(":")) {
        const [key, value] = splitKeyValue(stripped);
        currentBuildTenant.capabilityContracts[key] = normalizedScalar(value);
        continue;
      }
    }

    if (section === "runtime" && indent === 2 && stripped.includes(":")) {
      const [key, value] = splitKeyValue(stripped);
      values[`runtime_${key}`] = normalizedScalar(value);
      continue;
    }

    if ((section === "project" || section === "constraints" || indent === 0) && stripped.includes(":")) {
      const [key, value] = splitKeyValue(stripped);
      values[key] = normalizedScalar(value);
    }
  }
  flushDesignTenant();
  return Object.freeze({
    values,
    buildTenants: Object.freeze([...buildTenants.values()]),
    designTenants: Object.freeze(designTenants)
  });
}

function splitKeyValue(value: string): readonly [string, string] {
  const separatorIndex = value.indexOf(":");
  if (separatorIndex < 0) {
    return Object.freeze([value.trim(), ""]);
  }
  return Object.freeze([
    value.slice(0, separatorIndex).trim(),
    value.slice(separatorIndex + 1)
  ]);
}

function selectTenant(input: ParsedConstraints): MutableTenant {
  const tenantPool =
    input.buildTenants.length > 0 ? input.buildTenants : input.designTenants;
  const active = canonicalTenantName(
    nonEmpty(input.values["active_tenant"], nonEmpty(input.values["tenant_name"], ""))
  );
  const selected =
    tenantPool.find((tenant) => tenant.name === active) ?? tenantPool[0];
  if (selected !== undefined) {
    return selected;
  }
  return newTenant(nonEmpty(active, "typescript"));
}

function stringFrom(
  tenant: MutableTenant,
  values: Record<string, string>,
  tenantKey: string,
  valueKey = tenantKey
): string {
  return nonEmpty(tenant.values[tenantKey], nonEmpty(values[valueKey], ""));
}

function moduleStructureFor(tenant: MutableTenant, values: Record<string, string>): string {
  const tenantModules = tenant.lists["module_structure"];
  if (tenantModules !== undefined && tenantModules.length > 0) {
    return `(${tenantModules.join(", ")})`;
  }
  return nonEmpty(
    tenant.values["module_structure"],
    nonEmpty(values["module_structure"], nonEmpty(values["tenant_module_structure"], ""))
  );
}

export function declaredModuleNamesFromStructure(moduleStructure: string): readonly string[] {
  const raw = moduleStructure.trim();
  const bracketed =
    raw.includes("(") && raw.includes(")")
      ? raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")"))
      : raw;
  const modules = bracketed
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return Object.freeze(modules.length > 0 ? modules : ["app-core"]);
}

function normalizeExecutionContractDeclaration(value: string): string {
  const normalized = normalizedScalar(value);
  return normalized.length > 0 ? normalized : UNDECLARED_EXECUTION_CONTRACT;
}

function capabilityContractsFor(tenant: MutableTenant): readonly SdlcCapabilityContract[] {
  return Object.freeze(
    Object.entries(tenant.capabilityContracts)
      .filter(([name, value]) => name.trim().length > 0 && value.trim().length > 0)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) =>
        Object.freeze({
          kind: "sdlc_capability_contract" as const,
          name,
          value
        })
      )
  );
}

function declaredExecutionContracts(input: {
  readonly testRunner: string;
  readonly buildExecutionContract: string;
  readonly testExecutionContract: string;
  readonly deploymentContract: string;
  readonly runtimeObservationContract: string;
}): {
  readonly buildExecutionContract: string;
  readonly testExecutionContract: string;
  readonly deploymentContract: string;
  readonly runtimeObservationContract: string;
} {
  let buildExecutionContract = normalizeExecutionContractDeclaration(
    input.buildExecutionContract
  );
  let testExecutionContract = normalizeExecutionContractDeclaration(
    input.testExecutionContract
  );
  let deploymentContract = normalizeExecutionContractDeclaration(
    input.deploymentContract
  );
  let runtimeObservationContract = normalizeExecutionContractDeclaration(
    input.runtimeObservationContract
  );

  return Object.freeze({
    buildExecutionContract,
    testExecutionContract,
    deploymentContract,
    runtimeObservationContract
  });
}

function realizationModeFor(workspaceRoot: string, selectedOutputRoot: string, hasConstraints: boolean): {
  readonly realizationMode: SdlcRealizationMode;
  readonly resolutionReason: string;
} {
  if (!hasConstraints) {
    return Object.freeze({
      realizationMode: "generated_proving_subset",
      resolutionReason: "constraints_missing_default_profile"
    });
  }
  const absoluteRoot = path.join(workspaceRoot, selectedOutputRoot);
  if (realizationRootHasSignal(absoluteRoot)) {
    return Object.freeze({
      realizationMode: "selected_output_tree",
      resolutionReason: "selected_tenant_root"
    });
  }
  return Object.freeze({
    realizationMode: "planned_output_tree",
    resolutionReason: "selected_tenant_root_planned"
  });
}

function realizationRootHasSignal(root: string): boolean {
  if (!existsSync(root)) {
    return false;
  }
  const stat = statSync(root);
  if (!stat.isDirectory()) {
    return false;
  }
  return countTenantRealizationFiles(root, 4) > 0;
}

function runtimeLayoutFromValues(values: Record<string, string>) {
  const standard = standardSdlcRuntimeLayout();
  return admitSdlcRuntimeLayout({
    kind: "sdlc_runtime_layout",
    runtimeRoot: nonEmpty(values["runtime_root"], standard.runtimeRoot),
    transformAssetRoot: nonEmpty(
      values["runtime_transform_asset_root"],
      standard.transformAssetRoot
    ),
    operatorRunRoot: nonEmpty(values["runtime_operator_run_root"], standard.operatorRunRoot),
    productMaterializationRootPolicy: nonEmpty(
      values["runtime_product_materialization_root_policy"],
      standard.productMaterializationRootPolicy
    )
  });
}

function defaultOverlayStrategyForProject(): SdlcProfileOverlayStrategy {
  return "full_lifecycle";
}

function overlayStrategyFromValues(input: {
  readonly values: Record<string, string>;
  readonly tenant: MutableTenant;
}): SdlcProfileOverlayStrategy {
  const explicit = nonEmpty(
    input.tenant.values["overlay_strategy"],
    nonEmpty(
      input.values["overlay_strategy"],
      nonEmpty(input.values["traversal_overlay_strategy"], "")
    )
  );
  if (explicit.length > 0) {
    return admitSdlcProfileOverlayStrategy(explicit, "project.overlay_strategy");
  }
  return defaultOverlayStrategyForProject();
}

function overlayRefFromValues(input: {
  readonly values: Record<string, string>;
  readonly tenant: MutableTenant;
  readonly overlayStrategy: SdlcProfileOverlayStrategy;
}): string {
  const explicit = nonEmpty(
    input.tenant.values["overlay_ref"],
    nonEmpty(
      input.values["overlay_ref"],
      nonEmpty(input.values["traversal_overlay_ref"], "")
    )
  );
  return explicit.length > 0
    ? normalizeSdlcTraversalOverlayRef(explicit, "project.overlay_ref")
    : sdlcTraversalOverlayRefForStrategy(input.overlayStrategy);
}

function countTenantRealizationFiles(root: string, limit: number): number {
  let count = 0;
  const ignored = new Set<string>(REALIZATION_SIGNAL_IGNORED_DIR_NAMES);
  const visit = (current: string, depth = 0): void => {
    if (count >= limit || depth > 4) {
      return;
    }
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (count >= limit) {
        return;
      }
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) {
          visit(path.join(current, entry.name), depth + 1);
        }
      } else if (entry.isFile()) {
        count += 1;
      }
    }
  };
  visit(root);
  return count;
}

export function conformProjectProfileFromConstraintsText(input: {
  readonly workspaceRoot: string;
  readonly constraintsText: string;
}): SdlcConformProjectProfile {
  const parsed = parseConstraintsText(input.constraintsText);
  const tenant = selectTenant(parsed);
  const activeTenant = canonicalTenantName(nonEmpty(tenant.name, "typescript"));
  const explicitSelectedOutputRoot = nonEmpty(parsed.values["selected_output_root"], "");
  const declaredTenantOutputRoot = nonEmpty(tenant.values["output_dir"], "");
  const selectedOutputRoot = explicitSelectedOutputRoot.length > 0
    ? normalizeDeclaredOutputRoot(explicitSelectedOutputRoot, activeTenant)
    : canonicalSelectedOutputRoot(declaredTenantOutputRoot, activeTenant);
  const declaredOutputRoot = normalizeDeclaredOutputRoot(
    nonEmpty(declaredTenantOutputRoot, selectedOutputRoot),
    activeTenant
  );
  const ambiguityRiskAppetite = normalizeRiskAppetite(
    nonEmpty(parsed.values["ambiguity_risk_appetite"], DEFAULT_AMBIGUITY_RISK_APPETITE)
  );
  const moduleStructure = moduleStructureFor(tenant, parsed.values);
  const capabilityContracts = capabilityContractsFor(tenant);
  const language = stringFrom(tenant, parsed.values, "language");
  const tool = stringFrom(tenant, parsed.values, "build_tool", "tool");
  const testRunner = stringFrom(tenant, parsed.values, "test_runner");
  const projectSlug = projectSlugFromValues(parsed.values, input.workspaceRoot);
  const projectKind = nonEmpty(parsed.values["kind"], "");
  const declaredModuleNames = declaredModuleNamesFromStructure(moduleStructure);
  const executionContracts = declaredExecutionContracts({
    testRunner,
    buildExecutionContract: stringFrom(
      tenant,
      parsed.values,
      "build_execution_contract",
      "tenant_build_execution_contract"
    ),
    testExecutionContract: stringFrom(
      tenant,
      parsed.values,
      "test_execution_contract",
      "tenant_test_execution_contract"
    ),
    deploymentContract: stringFrom(
      tenant,
      parsed.values,
      "deployment_contract",
      "tenant_deployment_contract"
    ),
    runtimeObservationContract: stringFrom(
      tenant,
      parsed.values,
      "runtime_observation_contract",
      "tenant_runtime_observation_contract"
    )
  });
  const realization = realizationModeFor(
    input.workspaceRoot,
    selectedOutputRoot,
    input.constraintsText.trim().length > 0
  );
  const overlayStrategy = overlayStrategyFromValues({
    values: parsed.values,
    tenant
  });
  const overlayRef = overlayRefFromValues({
    values: parsed.values,
    tenant,
    overlayStrategy
  });
  const runtimeLayout = runtimeLayoutFromValues(parsed.values);
  return Object.freeze({
    kind: "sdlc_conform_project_profile",
    workspaceName: path.basename(input.workspaceRoot),
    projectSlug,
    projectKind,
    language,
    testRunner,
    tool,
    version: nonEmpty(parsed.values["version"], ""),
    moduleStructure,
    declaredModuleNames,
    ambiguityRiskAppetite,
    activeTenant,
    selectedOutputRoot,
    declaredOutputRoot,
    runtimeLayout,
    buildExecutionContract: executionContracts.buildExecutionContract,
    testExecutionContract: executionContracts.testExecutionContract,
    deploymentContract: executionContracts.deploymentContract,
    runtimeObservationContract: executionContracts.runtimeObservationContract,
    capabilityContracts,
    rootCodePolicy: nonEmpty(parsed.values["root_code_policy"], ""),
    realizationMode: realization.realizationMode,
    overlayStrategy,
    overlayRef,
    resolutionReason: realization.resolutionReason,
    sourceConstraintDigest: sha256Text(input.constraintsText)
  });
}

function projectSlugFromValues(values: Record<string, string>, workspaceRoot: string): string {
  const rawName = nonEmpty(values["name"], path.basename(workspaceRoot));
  const slug = rawName.replace(/[^a-zA-Z0-9_]+/gu, "_");
  return slug.length === 0 ? "imported_project" : slug;
}

function normalizeRiskAppetite(value: string): "low" | "medium" | "high" {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  return DEFAULT_AMBIGUITY_RISK_APPETITE;
}

export function deriveSdlcConformProjectProfileFromWorkspace(
  workspaceRoot: string
): SdlcConformProjectProfile {
  const constraintsPath = path.join(workspaceRoot, PROJECT_CONSTRAINTS_RELATIVE_PATH);
  const constraintsText = existsSync(constraintsPath)
    ? readFileSync(constraintsPath, "utf8")
    : "";
  return conformProjectProfileFromConstraintsText({
    workspaceRoot,
    constraintsText
  });
}

export function projectConstraintsFromConformProjectProfile(
  profile: SdlcConformProjectProfile
): SdlcProjectConstraints {
  return Object.freeze({
    kind: "sdlc_project_constraints",
    projectSlug: profile.projectSlug,
    activeTenant: profile.activeTenant,
    selectedOutputRoot: profile.selectedOutputRoot,
    runtimeLayout: profile.runtimeLayout,
    ambiguityRiskAppetite: profile.ambiguityRiskAppetite,
    capabilityContracts: Object.freeze(
      profile.capabilityContracts.map((contract) => contract.name)
    )
  });
}

export function deriveSdlcConformProjectReportFromWorkspace(
  workspaceRoot: string
): SdlcConformProjectReport {
  return deriveSdlcConformProjectReportFromWorkspaces({
    sourceWorkspaceRoot: workspaceRoot,
    outputWorkspaceRoot: workspaceRoot
  });
}

export function deriveSdlcConformProjectReportFromWorkspaces(input: {
  readonly sourceWorkspaceRoot: string;
  readonly outputWorkspaceRoot: string;
}): SdlcConformProjectReport {
  const sourceWorkspaceRoot = input.sourceWorkspaceRoot;
  const outputWorkspaceRoot = input.outputWorkspaceRoot;
  const profile = deriveSdlcConformProjectProfileFromWorkspace(sourceWorkspaceRoot);
  const topologyRelativePaths = CONFORM_PROJECT_EXPECTED_OUTPUT_RELATIVE_PATHS;
  const importedRelativePaths = importedSourceRelativePaths(sourceWorkspaceRoot);
  const sourceRefs: readonly string[] = Object.freeze(
    [...new Set([
      PROJECT_CONSTRAINTS_RELATIVE_PATH,
      ...importedRelativePaths,
      INTENT_RELATIVE_PATH,
      PRODUCT_RELATIVE_PATH,
      GOALS_RELATIVE_PATH,
      IMPORTED_SOURCES_RELATIVE_PATH
    ])].flatMap((relativePath) => {
      const absolutePath = path.join(sourceWorkspaceRoot, relativePath);
      return existsSync(absolutePath) && statSync(absolutePath).isFile()
        ? [pathToFileURL(absolutePath).href]
        : [];
    })
  );
  const materializedTopologyRefs = Object.freeze(
    topologyRelativePaths.flatMap((relativePath) => {
      const absolutePath = path.join(outputWorkspaceRoot, relativePath);
      return existsSync(absolutePath) && statSync(absolutePath).isFile()
        ? [pathToFileURL(absolutePath).href]
        : [];
    })
  );
  const conformanceGaps: string[] = [];
  if (sourceRefs.length === 0) {
    conformanceGaps.push("project_constraints_missing");
  }
  if (!existsSync(path.join(outputWorkspaceRoot, PROJECT_CONSTRAINTS_RELATIVE_PATH))) {
    conformanceGaps.push("project_constraints_missing");
  }
  if (!existsSync(path.join(outputWorkspaceRoot, PROJECT_BOOTSTRAP_RELATIVE_PATH))) {
    conformanceGaps.push("project_bootstrap_missing");
  }
  if (!existsSync(path.join(outputWorkspaceRoot, TENANT_REGISTRY_RELATIVE_PATH))) {
    conformanceGaps.push("tenant_registry_missing");
  }
  if (profile.selectedOutputRoot.startsWith("build_tenants/") === false) {
    conformanceGaps.push("selected_output_root_outside_build_tenants");
  }
  return Object.freeze({
    kind: "sdlc_conform_project_report",
    governingGraphFunction: FG_CONFORM_PROJECT,
    status: conformanceGaps.length === 0 ? "passed" : "blocked",
    workspaceRootUri: pathToFileURL(outputWorkspaceRoot).href,
    sourceRefs,
    materializedTopologyRefs,
    profile,
    conformanceGaps: Object.freeze([...new Set(conformanceGaps)].sort())
  });
}

export function deriveConformProjectManagedTraversalManifest(input: {
  readonly workspaceRoot: string;
  readonly sourceWorkspaceRoot?: string;
}): SdlcManagedTraversalManifest {
  const report = deriveSdlcConformProjectReportFromWorkspaces({
    sourceWorkspaceRoot: input.sourceWorkspaceRoot ?? input.workspaceRoot,
    outputWorkspaceRoot: input.workspaceRoot
  });
  return Object.freeze({
    kind: "sdlc_managed_traversal_manifest",
    graphFunctionName: FG_CONFORM_PROJECT,
    sourceType: "unordered_source_set",
    targetType: "constitutional_bootstrap",
    workspaceRootUri: pathToFileURL(input.workspaceRoot).href,
    sourceRefs: Object.freeze([...report.sourceRefs]),
    expectedOutputRelativePaths: Object.freeze([
      ...CONFORM_PROJECT_EXPECTED_OUTPUT_RELATIVE_PATHS
    ]),
    phaseContracts: Object.freeze([...CONFORM_PROJECT_PHASE_CONTRACTS])
  });
}

function ensureParent(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeIfMissing(filePath: string, content: string): boolean {
  if (existsSync(filePath)) {
    return false;
  }
  ensureParent(filePath);
  writeFileSync(filePath, content, "utf8");
  return true;
}

function writeIfChanged(filePath: string, content: string): boolean {
  if (existsSync(filePath) && readFileSync(filePath, "utf8") === content) {
    return false;
  }
  ensureParent(filePath);
  writeFileSync(filePath, content, "utf8");
  return true;
}

function canonicalProjectConstraints(profile: SdlcConformProjectProfile): string {
  return [
    "project:",
    `  name: ${profile.projectSlug}`,
    profile.projectKind.length > 0 ? `  kind: ${profile.projectKind}` : "  kind: imported_workspace",
    `  overlay_strategy: ${profile.overlayStrategy}`,
    `  overlay_ref: ${profile.overlayRef}`,
    `active_tenant: ${profile.activeTenant}`,
    `selected_output_root: ${profile.selectedOutputRoot}`,
    `ambiguity_risk_appetite: ${profile.ambiguityRiskAppetite}`,
    "runtime:",
    `  root: ${profile.runtimeLayout.runtimeRoot}`,
    `  transform_asset_root: ${profile.runtimeLayout.transformAssetRoot}`,
    `  operator_run_root: ${profile.runtimeLayout.operatorRunRoot}`,
    `  product_materialization_root_policy: ${profile.runtimeLayout.productMaterializationRootPolicy}`,
    "build_tenants:",
    `  ${profile.activeTenant}:`,
    `    output_dir: ${profile.selectedOutputRoot}`,
    profile.language.length > 0 ? `    language: ${profile.language}` : "    language: unknown",
    profile.tool.length > 0 ? `    build_tool: ${profile.tool}` : "    build_tool: undeclared",
    profile.buildExecutionContract !== UNDECLARED_EXECUTION_CONTRACT
      ? `    build_execution_contract: ${profile.buildExecutionContract}`
      : "    build_execution_contract: undeclared",
    profile.testRunner.length > 0 ? `    test_runner: ${profile.testRunner}` : "    test_runner: undeclared",
    profile.testExecutionContract !== UNDECLARED_EXECUTION_CONTRACT
      ? `    test_execution_contract: ${profile.testExecutionContract}`
      : "    test_execution_contract: undeclared",
    "    module_structure:",
    ...profile.declaredModuleNames.map((moduleName) => `      - ${moduleName}`),
    ...(profile.capabilityContracts.length > 0
      ? [
          "    capability_contracts:",
          ...profile.capabilityContracts.map(
            (contract) => `      ${contract.name}: ${contract.value}`
          )
        ]
      : []),
    ""
  ].join("\n");
}

function importedSourceRelativePaths(workspaceRoot: string): readonly string[] {
  const ignored = new Set<string>(IMPORT_SOURCE_IGNORED_DIRS);
  const paths: string[] = [];
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
        IMPORT_SOURCE_EXTENSION_SET.has(path.extname(entry.name).toLowerCase()) &&
        relativePath !== IMPORTED_SOURCES_RELATIVE_PATH
      ) {
        paths.push(relativePath);
      }
    }
  };
  visit(workspaceRoot, "");
  return Object.freeze([...new Set(paths)].sort());
}

function readWorkspaceTextIfFile(input: {
  readonly workspaceRoot: string;
  readonly relativePath: string;
}): string | null {
  const absolutePath = path.join(input.workspaceRoot, input.relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    return null;
  }
  return readFileSync(absolutePath, "utf8");
}

function firstMarkdownTitle(content: string): string | null {
  for (const line of content.split("\n")) {
    const heading = /^#\s+(.+)$/u.exec(line.trim());
    if (heading?.[1] !== undefined && heading[1].trim().length > 0) {
      return heading[1].trim();
    }
  }
  const projectLine = /\*\*Project\*\*:\s*(.+)$/mu.exec(content);
  return projectLine?.[1]?.trim() ?? null;
}

function workspaceAuthorityRelativePaths(workspaceRoot: string): readonly string[] {
  const preferred = Object.freeze([
    "README.md",
    INTENT_RELATIVE_PATH,
    PRODUCT_RELATIVE_PATH,
    GOALS_RELATIVE_PATH,
    "specification/REQUIREMENTS.md"
  ] as const);
  const preferredOrder = new Map<string, number>(
    preferred.map((relativePath, index) => [relativePath, index])
  );
  return Object.freeze([
    ...new Set([
      ...preferred,
      ...importedSourceRelativePaths(workspaceRoot)
    ])
  ].filter((relativePath) => {
    const absolutePath = path.join(workspaceRoot, relativePath);
    return existsSync(absolutePath) && statSync(absolutePath).isFile();
  }).sort((left, right) => {
    const leftIndex = preferredOrder.get(left) ?? -1;
    const rightIndex = preferredOrder.get(right) ?? -1;
    if (leftIndex >= 0 || rightIndex >= 0) {
      return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) -
        (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
    }
    return left.localeCompare(right);
  }));
}

function sourceTitleLines(input: {
  readonly workspaceRoot: string;
  readonly relativePaths: readonly string[];
}): readonly string[] {
  return Object.freeze(input.relativePaths.flatMap((relativePath) => {
    const content = readWorkspaceTextIfFile({
      workspaceRoot: input.workspaceRoot,
      relativePath
    });
    if (content === null) {
      return [];
    }
    return [`- \`${relativePath}\`: ${firstMarkdownTitle(content) ?? path.basename(relativePath)}`];
  }));
}

function ontologyAnchorLines(input: {
  readonly workspaceRoot: string;
  readonly relativePaths: readonly string[];
}): readonly string[] {
  const anchors: string[] = [];
  for (const relativePath of input.relativePaths) {
    const content = readWorkspaceTextIfFile({
      workspaceRoot: input.workspaceRoot,
      relativePath
    });
    if (content === null) {
      continue;
    }
    for (const line of content.split("\n")) {
      const heading = /^(#{1,6})\s+(.+)$/u.exec(line.trim());
      const title = heading?.[2]?.trim();
      if (title === undefined || title.length === 0) {
        continue;
      }
      const authoritative =
        /^INT-\d+/u.test(title) ||
        /^REQ-[A-Z0-9-]+/u.test(title) ||
        /\b(?:requirements?|architecture|execution)\b/iu.test(title);
      if (authoritative) {
        anchors.push(`- \`${relativePath}\` -> ${title}`);
      }
      if (anchors.length >= 32) {
        return Object.freeze(anchors);
      }
    }
  }
  return Object.freeze(anchors);
}

function readOrderLines(input: {
  readonly workspaceRoot: string;
  readonly sourceRelativePaths: readonly string[];
}): readonly string[] {
  const existsFile = (relativePath: string): boolean => {
    const absolutePath = path.join(input.workspaceRoot, relativePath);
    return existsSync(absolutePath) && statSync(absolutePath).isFile();
  };
  const primary = [
    INTENT_RELATIVE_PATH,
    "specification/REQUIREMENTS.md",
    IMPORTED_SOURCES_RELATIVE_PATH
  ].filter((relativePath) => existsFile(relativePath));
  const supplemental = input.sourceRelativePaths.filter(
    (relativePath) =>
      !primary.includes(relativePath) &&
      !relativePath.startsWith("specification/appendices/")
  );
  return Object.freeze([
    ...primary.map((relativePath) => `- \`${relativePath}\``),
    ...supplemental.slice(0, 8).map((relativePath) => `- \`${relativePath}\``),
    `- \`${PRODUCT_RELATIVE_PATH}\` and \`${GOALS_RELATIVE_PATH}\` after imported authority has been read`
  ]);
}

function projectBootstrapReadModelContent(input: {
  readonly sourceWorkspaceRoot: string;
  readonly outputWorkspaceRoot: string;
  readonly profile: SdlcConformProjectProfile;
  readonly before: SdlcConformProjectReport;
}): string {
  const sourceRelativePaths = workspaceAuthorityRelativePaths(input.sourceWorkspaceRoot);
  const intentText = readWorkspaceTextIfFile({
    workspaceRoot: input.sourceWorkspaceRoot,
    relativePath: INTENT_RELATIVE_PATH
  });
  const authoritativeTitle =
    intentText === null
      ? input.profile.projectSlug
      : firstMarkdownTitle(intentText) ?? input.profile.projectSlug;
  const titleLines = sourceTitleLines({
    workspaceRoot: input.sourceWorkspaceRoot,
    relativePaths: sourceRelativePaths
  });
  const anchorLines = ontologyAnchorLines({
    workspaceRoot: input.sourceWorkspaceRoot,
    relativePaths: sourceRelativePaths
  });
  return [
    "# Project Bootstrap",
    "",
    "This generated surface is a deterministic read model over imported project authority.",
    "It is not a replacement for project-owned specification truth.",
    "",
    "## Workspace Identity",
    "",
    `- workspace: \`${path.basename(input.outputWorkspaceRoot)}\``,
    `- project slug: \`${input.profile.projectSlug}\``,
    `- active tenant: \`${input.profile.activeTenant}\``,
    `- selected output root: \`${input.profile.selectedOutputRoot}\``,
    "",
    "## Project Identity",
    "",
    `- authoritative project title: \`${authoritativeTitle}\``,
    `- identity source: \`${intentText === null ? PROJECT_CONSTRAINTS_RELATIVE_PATH : INTENT_RELATIVE_PATH}\``,
    "- workspace/template/bootstrap provenance does not change project identity",
    "",
    "## Source Titles",
    "",
    ...(titleLines.length > 0 ? titleLines : ["- none_observed"]),
    "",
    "## Ontology Anchors",
    "",
    ...(anchorLines.length > 0 ? anchorLines : ["- none_observed"]),
    "",
    "## Source Refs",
    "",
    ...(input.before.sourceRefs.length > 0
      ? input.before.sourceRefs.map((ref) => `- ${ref}`)
      : ["- none_observed"]),
    "",
    "## Read Order",
    "",
    ...readOrderLines({
      workspaceRoot: input.sourceWorkspaceRoot,
      sourceRelativePaths
    }),
    "",
    "## Interpretation Rule",
    "",
    "- use this surface to orient quickly",
    "- use imported project sources as authority",
    "- treat copied template/bootstrap history as provenance rather than live workspace guidance",
    "- if ontology remains incomplete, preserve the gap as residual pressure instead of inferring it from repository context",
    ""
  ].join("\n");
}

export function materializeSdlcProjectConformance(input: {
  readonly workspaceRoot: string;
  readonly sourceWorkspaceRoot?: string;
}): SdlcConformProjectReport {
  const sourceWorkspaceRoot = input.sourceWorkspaceRoot ?? input.workspaceRoot;
  const before = deriveSdlcConformProjectReportFromWorkspaces({
    sourceWorkspaceRoot,
    outputWorkspaceRoot: input.workspaceRoot
  });
  const profile = before.profile;
  const written: string[] = [];
  const write = (relativePath: string, content: string): void => {
    const absolutePath = path.join(input.workspaceRoot, relativePath);
    if (writeIfMissing(absolutePath, content)) {
      written.push(pathToFileURL(absolutePath).href);
    }
  };
  const writeCanonical = (relativePath: string, content: string): void => {
    const absolutePath = path.join(input.workspaceRoot, relativePath);
    if (writeIfChanged(absolutePath, content)) {
      written.push(pathToFileURL(absolutePath).href);
    }
  };

  mkdirSync(path.join(input.workspaceRoot, "build_tenants"), { recursive: true });

  writeCanonical(PROJECT_BOOTSTRAP_RELATIVE_PATH, projectBootstrapReadModelContent({
    sourceWorkspaceRoot,
    outputWorkspaceRoot: input.workspaceRoot,
    profile,
    before
  }));

  writeCanonical(PROJECT_CONSTRAINTS_RELATIVE_PATH, canonicalProjectConstraints(profile));

  write(TENANT_REGISTRY_RELATIVE_PATH, [
    "# Tenant Registry",
    "",
    `- tenant: ${profile.activeTenant}`,
    `  root: ${profile.selectedOutputRoot}`,
    `  status: selected`,
    ""
  ].join("\n"));

  const after = deriveSdlcConformProjectReportFromWorkspaces({
    sourceWorkspaceRoot,
    outputWorkspaceRoot: input.workspaceRoot
  });
  return Object.freeze({
    ...after,
    materializedTopologyRefs: Object.freeze([
      ...new Set([...after.materializedTopologyRefs, ...written])
    ].sort())
  });
}

function admitCapabilityContract(
  input: unknown,
  label: string
): SdlcCapabilityContract {
  const record = parseClosedRecord(input, label, ["kind", "name", "value"]);
  parseKind(record["kind"], "sdlc_capability_contract", `${label}.kind`);
  return Object.freeze({
    kind: "sdlc_capability_contract",
    name: parseNonEmptyString(record["name"], `${label}.name`),
    value: parseNonEmptyString(record["value"], `${label}.value`)
  });
}

function parseCapabilityContractList(
  input: unknown,
  label: string
): readonly SdlcCapabilityContract[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label}: expected array`);
  }
  return Object.freeze(
    input.map((item, index) => admitCapabilityContract(item, `${label}[${index}]`))
  );
}

export function admitSdlcConformProjectProfile(
  input: unknown,
  label = "SdlcConformProjectProfile"
): SdlcConformProjectProfile {
  const record = parseClosedRecord(input, label, [
    "kind",
    "workspaceName",
    "projectSlug",
    "projectKind",
    "language",
    "testRunner",
    "tool",
    "version",
    "moduleStructure",
    "declaredModuleNames",
    "ambiguityRiskAppetite",
    "activeTenant",
    "selectedOutputRoot",
    "declaredOutputRoot",
    "runtimeLayout",
    "buildExecutionContract",
    "testExecutionContract",
    "deploymentContract",
    "runtimeObservationContract",
    "capabilityContracts",
    "rootCodePolicy",
    "realizationMode",
    "overlayStrategy",
    "overlayRef",
    "resolutionReason",
    "sourceConstraintDigest"
  ]);
  parseKind(record["kind"], "sdlc_conform_project_profile", `${label}.kind`);
  const selectedOutputRoot = parseNonEmptyString(
    record["selectedOutputRoot"],
    `${label}.selectedOutputRoot`
  );
  if (!selectedOutputRoot.startsWith("build_tenants/")) {
    throw new TypeError(`${label}.selectedOutputRoot: expected build_tenants/*`);
  }
  return Object.freeze({
    kind: "sdlc_conform_project_profile",
    workspaceName: parseNonEmptyString(record["workspaceName"], `${label}.workspaceName`),
    projectSlug: parseNonEmptyString(record["projectSlug"], `${label}.projectSlug`),
    projectKind: parseString(record["projectKind"], `${label}.projectKind`),
    language: parseString(record["language"], `${label}.language`),
    testRunner: parseString(record["testRunner"], `${label}.testRunner`),
    tool: parseString(record["tool"], `${label}.tool`),
    version: parseString(record["version"], `${label}.version`),
    moduleStructure: parseString(record["moduleStructure"], `${label}.moduleStructure`),
    declaredModuleNames: parseStringList(
      record["declaredModuleNames"],
      `${label}.declaredModuleNames`
    ),
    ambiguityRiskAppetite: parseEnumValue(
      record["ambiguityRiskAppetite"],
      `${label}.ambiguityRiskAppetite`,
      ["low", "medium", "high"]
    ),
    activeTenant: parseNonEmptyString(record["activeTenant"], `${label}.activeTenant`),
    selectedOutputRoot,
    declaredOutputRoot: parseNonEmptyString(
      record["declaredOutputRoot"],
      `${label}.declaredOutputRoot`
    ),
    runtimeLayout:
      record["runtimeLayout"] === undefined
        ? standardSdlcRuntimeLayout()
        : admitSdlcRuntimeLayout(record["runtimeLayout"], `${label}.runtimeLayout`),
    buildExecutionContract: parseNonEmptyString(
      record["buildExecutionContract"],
      `${label}.buildExecutionContract`
    ),
    testExecutionContract: parseNonEmptyString(
      record["testExecutionContract"],
      `${label}.testExecutionContract`
    ),
    deploymentContract: parseNonEmptyString(
      record["deploymentContract"],
      `${label}.deploymentContract`
    ),
    runtimeObservationContract: parseNonEmptyString(
      record["runtimeObservationContract"],
      `${label}.runtimeObservationContract`
    ),
    capabilityContracts: parseCapabilityContractList(
      record["capabilityContracts"],
      `${label}.capabilityContracts`
    ),
    rootCodePolicy: parseString(record["rootCodePolicy"], `${label}.rootCodePolicy`),
    realizationMode: parseEnumValue(
      record["realizationMode"],
      `${label}.realizationMode`,
      SDLC_REALIZATION_MODE_VALUES
    ),
    overlayStrategy: parseEnumValue(
      record["overlayStrategy"],
      `${label}.overlayStrategy`,
      SDLC_PROFILE_OVERLAY_STRATEGY_VALUES
    ),
    overlayRef: normalizeSdlcTraversalOverlayRef(
      parseNonEmptyString(record["overlayRef"], `${label}.overlayRef`),
      `${label}.overlayRef`
    ),
    resolutionReason: parseNonEmptyString(
      record["resolutionReason"],
      `${label}.resolutionReason`
    ),
    sourceConstraintDigest: parseNonEmptyString(
      record["sourceConstraintDigest"],
      `${label}.sourceConstraintDigest`
    )
  });
}
