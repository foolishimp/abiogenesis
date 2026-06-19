// Implements: T-161

import path from "node:path";
import { existsSync, readFileSync, statSync } from "node:fs";

import type { OperatorRunCarriers } from "./carrier_loaders.js";
import type { DiagnosticDraft } from "./diagnostics.js";

const CANONICAL_REQUIREMENT_REGEX = /requirement:[A-Za-z0-9_./\-]+\.[A-Za-z0-9_./\-]+\.req[_A-Za-z0-9]+/gu;
const RAW_DISPLAY_REQUIREMENT_REGEX = /\bREQ-[A-Z0-9_-]+\b/gu;

export interface SdlcFdRunAnalysisLineageScan {
  readonly canonicalRequirementIds: readonly string[];
  readonly rawDisplayIds: readonly string[];
  readonly canonicalRequirementIdCount: number;
  readonly rawDisplayIdRequirementCount: number;
  readonly productFilesScanned: number;
  readonly productFilesWithLineage: number;
  readonly productFilesMissingLineage: readonly string[];
  readonly productFilesUnreadable: readonly string[];
}

function readContent(filePath: string): string | null {
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      return null;
    }
    return readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function uniqueStrings(values: Iterable<string>): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function tenantRootForCarriers(carriers: OperatorRunCarriers): string | null {
  if (carriers.productManifest.status !== "present") {
    return null;
  }
  const tenantRoot = carriers.productManifest.data.contract?.tenantRoot;
  return typeof tenantRoot === "string" && tenantRoot.length > 0 ? tenantRoot : null;
}

function liveWorkspaceRootFromOperatorRun(operatorRunRoot: string): string | null {
  const idx = operatorRunRoot.indexOf(
    "/.ai-workspace/runtime/odd_sdlc/operator-runs/"
  );
  return idx === -1 ? null : operatorRunRoot.slice(0, idx);
}

function liveTenantRootCandidate(input: {
  readonly workspaceRoot: string;
  readonly archivedTenantRoot: string;
}): string | null {
  const match = /\/(build_tenants\/[^/]+)(?:\/|$)/u.exec(input.archivedTenantRoot);
  if (match === null || match[1] === undefined) {
    return null;
  }
  return path.join(input.workspaceRoot, match[1]);
}

function resolveProductFileContent(input: {
  readonly carriers: OperatorRunCarriers;
  readonly absolutePath: string;
  readonly relativePath: string;
}): { readonly content: string | null; readonly resolvedPath: string | null } {
  const direct = readContent(input.absolutePath);
  if (direct !== null) {
    return Object.freeze({ content: direct, resolvedPath: input.absolutePath });
  }
  const liveWorkspaceRoot = liveWorkspaceRootFromOperatorRun(
    input.carriers.operatorRunRoot
  );
  if (liveWorkspaceRoot === null) {
    return Object.freeze({ content: null, resolvedPath: null });
  }
  const archivedTenantRoot = tenantRootForCarriers(input.carriers);
  if (archivedTenantRoot !== null) {
    const liveTenantRoot = liveTenantRootCandidate({
      workspaceRoot: liveWorkspaceRoot,
      archivedTenantRoot
    });
    if (liveTenantRoot !== null) {
      const viaTenant = path.join(liveTenantRoot, input.relativePath);
      const content = readContent(viaTenant);
      if (content !== null) {
        return Object.freeze({ content, resolvedPath: viaTenant });
      }
    }
  }
  const viaWorkspace = path.join(liveWorkspaceRoot, input.relativePath);
  const workspaceContent = readContent(viaWorkspace);
  if (workspaceContent !== null) {
    return Object.freeze({ content: workspaceContent, resolvedPath: viaWorkspace });
  }
  return Object.freeze({ content: null, resolvedPath: null });
}

export function scanProductLineage(input: {
  readonly carriers: readonly OperatorRunCarriers[];
  readonly forbidRawDisplayIds: boolean;
}): {
  readonly scan: SdlcFdRunAnalysisLineageScan;
  readonly diagnostics: readonly DiagnosticDraft[];
} {
  const canonical: string[] = [];
  const raw: string[] = [];
  const missingLineage: string[] = [];
  const unreadable: string[] = [];
  const diagnostics: DiagnosticDraft[] = [];
  let scanned = 0;
  let withLineage = 0;
  for (const carriers of input.carriers) {
    if (carriers.productManifest.status !== "present") {
      continue;
    }
    const files = carriers.productManifest.data.files ?? [];
    for (const file of files) {
      const relativePath = file.relativePath;
      const absolutePath = file.absolutePath;
      if (typeof relativePath !== "string" || typeof absolutePath !== "string") {
        continue;
      }
      scanned += 1;
      const resolved = resolveProductFileContent({
        carriers,
        absolutePath,
        relativePath
      });
      const lineageIds = file.requirementTraceObligationIds ?? [];
      if (lineageIds.length > 0) {
        withLineage += 1;
        canonical.push(...lineageIds);
      }
      if (resolved.content === null) {
        if (lineageIds.length === 0) {
          unreadable.push(relativePath);
          missingLineage.push(relativePath);
          diagnostics.push({
            code: "product_lineage_missing",
            severity: "warn",
            detail: `product file ${relativePath} unreadable in archive and carries no manifest lineage`,
            evidenceRefs: Object.freeze([
              path.join(carriers.operatorRunRoot, "product_materialization_manifest.json")
            ]),
            operatorRunRef: null,
            edgeName: null
          });
        }
        continue;
      }
      const inlineCanonical = resolved.content.match(CANONICAL_REQUIREMENT_REGEX) ?? [];
      const inlineRaw = resolved.content.match(RAW_DISPLAY_REQUIREMENT_REGEX) ?? [];
      canonical.push(...inlineCanonical);
      raw.push(...inlineRaw);
      if (lineageIds.length === 0 && inlineCanonical.length === 0) {
        missingLineage.push(relativePath);
        diagnostics.push({
          code: "product_lineage_missing",
          severity: "warn",
          detail: `product file ${relativePath} carries no canonical requirement lineage`,
          evidenceRefs: Object.freeze([
            path.join(carriers.operatorRunRoot, "product_materialization_manifest.json")
          ]),
          operatorRunRef: null,
          edgeName: null
        });
      }
      if (input.forbidRawDisplayIds && inlineRaw.length > 0 && inlineCanonical.length === 0) {
        diagnostics.push({
          code: "product_lineage_missing",
          severity: "warn",
          detail: `product file ${relativePath} uses raw display-id requirement tags instead of canonical refs`,
          evidenceRefs: Object.freeze([resolved.resolvedPath ?? absolutePath]),
          operatorRunRef: null,
          edgeName: null
        });
      }
    }
  }
  const canonicalUnique = uniqueStrings(canonical);
  return Object.freeze({
    scan: Object.freeze({
      canonicalRequirementIds: canonicalUnique,
      rawDisplayIds: uniqueStrings(raw),
      canonicalRequirementIdCount: canonicalUnique.length,
      rawDisplayIdRequirementCount: uniqueStrings(raw).length,
      productFilesScanned: scanned,
      productFilesWithLineage: withLineage,
      productFilesMissingLineage: Object.freeze(missingLineage),
      productFilesUnreadable: Object.freeze(unreadable)
    }),
    diagnostics: Object.freeze(diagnostics)
  });
}
