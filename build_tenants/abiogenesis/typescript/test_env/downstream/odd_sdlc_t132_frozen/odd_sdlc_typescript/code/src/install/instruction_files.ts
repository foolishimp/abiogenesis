// Implements: REQ-F-ODDSDLC-007

import { deliverBootloader, type BootloaderWriter } from "@abiogenesis/typescript-tenant/app/m04/bootloader";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import type { OddSdlcBootstrapGovernance, OddSdlcInstructionFileWrite } from "./carriers.js";
import { FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE } from "../graph/catalog.js";

const ODD_SDLC_BOOTLOADER_START = "<!-- ODD_SDLC_BOOTLOADER_START -->";
const ODD_SDLC_BOOTLOADER_END = "<!-- ODD_SDLC_BOOTLOADER_END -->";
const STDO_METHOD_REFS = Object.freeze([
  "workspace://.abiogenesis/docs/standards/SPEC_METHOD.md",
  "workspace://.abiogenesis/docs/standards/TICKET_METHOD.md",
  "workspace://.abiogenesis/docs/standards/DESIGN_MODULE_METHOD.md",
  "workspace://.abiogenesis/docs/standards/ODD_METHOD.md"
] as const);
const STDO_ALIASES = Object.freeze([
  "STDO law",
  "STDO governance",
  "STDO Constitution",
  "STDO Method",
  "STDO-UX"
] as const);
const FIRST_MISSING_LAYER_ORDER = Object.freeze([
  "Goals",
  "Intent",
  "Product",
  "Requirements",
  "Design",
  "Code",
  "Tests/Proof",
  "Release"
] as const);

export function oddSdlcBootstrapGovernance(): OddSdlcBootstrapGovernance {
  return Object.freeze({
    kind: "odd_sdlc_bootstrap_governance",
    aliases: STDO_ALIASES,
    methodRefs: STDO_METHOD_REFS,
    firstMissingLayerOrder: FIRST_MISSING_LAYER_ORDER,
    uiAlias: "STDO-UX",
    executionContractRule:
      "Before substantive ticket execution, triage the first missing layer and fix the ticket execution contract before implementation."
  });
}

export interface OddSdlcInstructionFilesInput {
  readonly targetRoot: string;
  readonly productInstallRoot: string;
  readonly oddSdlcCommandPath: string;
  readonly genesisCommandPath: string | null;
  readonly abiogenesisCommandPath: string | null;
  readonly bootstrapGuidePath: string;
  readonly normalizationPath: string;
  readonly installManifestPath: string;
  readonly abgInstallManifestPath: string;
}

function projectSlugFromTarget(targetRoot: string): string {
  const stem = basename(targetRoot).split(".", 1)[0] ?? "project";
  const normalized = stem.replace(/[^A-Za-z0-9_]+/gu, "_").replace(/^_+|_+$/gu, "");
  return normalized.length > 0 ? normalized : "project";
}

function relativeWorkspacePath(targetRoot: string, absolutePath: string): string {
  const prefix = `${targetRoot}/`;
  return absolutePath.startsWith(prefix) ? absolutePath.slice(prefix.length) : absolutePath;
}

function workspaceUri(relativePath: string): string {
  return `workspace://${relativePath}`;
}

function relativeInstructionPath(filename: "AGENTS.md" | "CLAUDE.md"): string {
  return filename;
}

function buildInstructionContent(input: OddSdlcInstructionFilesInput): string {
  const workspaceName = basename(input.targetRoot);
  const projectSlug = projectSlugFromTarget(input.targetRoot);
  const productInstallRootRelative = relativeWorkspacePath(input.targetRoot, input.productInstallRoot);
  const bootstrapGuideRelative = relativeWorkspacePath(input.targetRoot, input.bootstrapGuidePath);
  const normalizationRelative = relativeWorkspacePath(input.targetRoot, input.normalizationPath);
  const installManifestRelative = relativeWorkspacePath(input.targetRoot, input.installManifestPath);
  const abgInstallManifestRelative = relativeWorkspacePath(input.targetRoot, input.abgInstallManifestPath);
  const oddSdlcCommand = relativeWorkspacePath(input.targetRoot, input.oddSdlcCommandPath);
  const genesisCommand = input.genesisCommandPath === null
    ? "node_modules/.bin/genesis-ts"
    : relativeWorkspacePath(input.targetRoot, input.genesisCommandPath);
  const abiogenesisCommand = input.abiogenesisCommandPath === null
    ? "node_modules/.bin/abiogenesis-ts"
    : relativeWorkspacePath(input.targetRoot, input.abiogenesisCommandPath);
  const bootstrapGovernance = oddSdlcBootstrapGovernance();

  return [
    "# odd_sdlc TypeScript Workspace Governance Surface",
    "",
    "This workspace contains a target project governed by `odd_sdlc.TS`.",
    "GTL/ABG are substrate. `odd_sdlc` is the governance and domain package.",
    "Imported project authority defines what the project is.",
    "",
    "## Workspace Identity",
    `- workspace: \`${workspaceName}\``,
    `- project slug: \`${projectSlug}\``,
    "- product: `odd_sdlc`",
    "- build tenant: `typescript`",
    `- installed product root: \`${workspaceUri(productInstallRootRelative)}\``,
    `- install manifest: \`${workspaceUri(installManifestRelative)}\``,
    `- ABG install manifest: \`${workspaceUri(abgInstallManifestRelative)}\``,
    `- normalization projection: \`${workspaceUri(normalizationRelative)}\``,
    `- bootstrap guide: \`${workspaceUri(bootstrapGuideRelative)}\``,
    "",
    "## Agent Operating Rule",
    "- start from project truth, not substrate ontology",
    "- treat `odd_sdlc` as governance over the target project",
    "- do not describe the project itself as a GTL/ABG app unless project authority says so",
    "- `specification/` is project-owned `WHAT`",
    "- `build_tenants/` is project-owned realization `HOW`",
    "- `.ai-workspace/runtime/odd_sdlc/assets` is the default transform-asset archive root",
    "- product files materialize under the conformed `selected_output_root`, normally `build_tenants/<tenant>`",
    "- `.abiogenesis/*` is installed substrate or installed product payload, not mutable project source",
    "- ABG owns traversal, continuation, events, runtime facts, and projection mechanics",
    "- `C` means the selected `abg.fn_composition`; it is notation over GTL/ABG carriers, not a product-local execution carrier",
    "- `transform.C` may produce candidate artifacts; it does not write ledgers, events, projections, traversal, or closure truth",
    "- `evaluate.C` produces finding refs with selected composition identity; ABG admission and fold decide runtime truth",
    "- `consequence.C` is a projection over ABG-admitted facts and must preserve composition ref, digest, and selection ref",
    "",
    "## STDO Bootstrap Provenance",
    "- `STDO law`, `STDO governance`, `STDO Constitution`, and `STDO Method` are aliases for the same governance stack",
    "- `STDO-UX` is the UI/operator-surface application of that same governance stack",
    "- STDO expands to:",
    ...bootstrapGovernance.methodRefs.map((methodRef) => `  - \`${methodRef}\``),
    "- before substantive ticket execution, triage the first missing layer:",
    `  - \`${bootstrapGovernance.firstMissingLayerOrder.join(" -> ")}\``,
    "- the symptom layer is not the re-entry authority",
    "- if triage finds a higher missing layer, fix the ticket execution contract before implementation",
    "- for UI/operator tickets under `STDO-UX`, preserve the Agentic Coder CLI as the user interface over installed product truth, not as a rival runtime or hidden worker controller",
    "",
    "## Read First",
    `- \`${workspaceUri(bootstrapGuideRelative)}\``,
    `- \`${workspaceUri(normalizationRelative)}\``,
    `- \`${workspaceUri(installManifestRelative)}\``,
    `- \`${workspaceUri(abgInstallManifestRelative)}\``,
    "- `workspace://specification/INTENT.md` when present",
    "- `workspace://specification/PRODUCT.md` when present",
    "- `workspace://specification/requirements/` when present",
    "",
    "## Start Here",
    `- when the operator says \`gaps\`, run \`${oddSdlcCommand} gaps --workspace .\``,
    "- `start` is an operator shell over ABG-owned graph execution; do not treat odd_sdlc as a second traversal runtime",
    `- when the operator says \`start\`, resolve the SDLC domain boundary with \`${oddSdlcCommand} start --workspace . --target next --until blocked --worker process://claude\` or \`${oddSdlcCommand} start --workspace . --target next --until blocked --worker process://codex\`, matching the active worker`,
    `- for layered execution to convergence, hand control to the ABG command binding \`${genesisCommand} start --workspace . --scope workspace --target graph_function:${FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE} --until converged\`; do not create an odd_sdlc-local start/retry loop`,
    `- inspect the RC surface with \`${oddSdlcCommand} rc-report\``,
    `- ABG command binding: \`${genesisCommand}\``,
    `- ABIogenesis command binding: \`${abiogenesisCommand}\``,
    "- if `start` returns `fp_worker_unattached`, the traversal stopped lawfully because no live worker transport was attached; that is not completion",
    "- do not add ad hoc traversal loops or scripts when answering operator `start` requests",
    "",
    "## Interpretation Rule",
    "- substrate truth explains how work is executed",
    "- governance truth explains how this project is operated",
    "- imported project sources explain what the project is",
    "- copied template history is provenance unless imported authority makes it project-defining",
    "",
    "If those layers disagree, imported project authority wins for project identity,",
    "and GTL/ABG plus `odd_sdlc` govern how work proceeds over that authority."
  ].join("\n");
}

async function readExisting(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error["code"] === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

function instructionAction(existing: string | null): "created" | "prepended" | "updated" {
  if (existing === null) {
    return "created";
  }
  if (
    existing.includes(ODD_SDLC_BOOTLOADER_START) &&
    existing.includes(ODD_SDLC_BOOTLOADER_END)
  ) {
    return "updated";
  }
  return "prepended";
}

function nodeBootloaderWriter(): BootloaderWriter {
  return {
    async ensureDirectory(path: string): Promise<void> {
      await mkdir(path, { recursive: true });
    },
    async writeTextFile(path: string, content: string): Promise<void> {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, "utf8");
    },
    async readTextFile(path: string): Promise<string | null> {
      return readExisting(path);
    },
    async isDirectory(path: string): Promise<boolean> {
      try {
        return (await stat(path)).isDirectory();
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error["code"] === "ENOENT"
        ) {
          return false;
        }
        throw error;
      }
    },
    async isFile(path: string): Promise<boolean> {
      try {
        return (await stat(path)).isFile();
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error["code"] === "ENOENT"
        ) {
          return false;
        }
        throw error;
      }
    }
  };
}

export async function writeOddSdlcInstructionFiles(
  input: OddSdlcInstructionFilesInput
): Promise<readonly OddSdlcInstructionFileWrite[]> {
  const filenames = Object.freeze(["AGENTS.md", "CLAUDE.md"] as const);
  const priorState = new Map<"AGENTS.md" | "CLAUDE.md", string | null>();
  for (const filename of filenames) {
    priorState.set(filename, await readExisting(join(input.targetRoot, filename)));
  }
  const bootstrapGuideRelative = relativeWorkspacePath(input.targetRoot, input.bootstrapGuidePath);
  const outcome = await deliverBootloader(
    {
      targetRoot: {
        rootPath: input.targetRoot
      },
      bootloaderDocument: {
        relativePath: bootstrapGuideRelative,
        content: buildInstructionContent(input),
        markers: {
          startMarker: ODD_SDLC_BOOTLOADER_START,
          endMarker: ODD_SDLC_BOOTLOADER_END
        }
      },
      instructionTargets: filenames.map((filename) => ({
        relativePath: relativeInstructionPath(filename)
      }))
    },
    nodeBootloaderWriter()
  );
  if (outcome.kind === "rejected") {
    throw new Error(`odd_sdlc instruction bootloader rejected: ${outcome.reason}`);
  }
  return Object.freeze(
    filenames.map((filename) => {
      const verified =
        outcome.verification.instructionTargets.find(
          (entry) => entry.relativePath === relativeInstructionPath(filename)
        )?.verified ?? false;
      return Object.freeze({
        kind: "odd_sdlc_instruction_file_write",
        filename,
        path: join(input.targetRoot, filename),
        action: instructionAction(priorState.get(filename) ?? null),
        verified
      });
    })
  );
}
