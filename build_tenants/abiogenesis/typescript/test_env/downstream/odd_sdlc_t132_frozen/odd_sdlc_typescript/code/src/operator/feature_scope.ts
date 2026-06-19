// Implements: T-122

import type {
  SdlcFeatureScope,
  SdlcTraversalObligation,
  SdlcTraversalStrategy
} from "./carriers.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";

export interface SdlcFeatureScopeDerivationInput {
  readonly targetAssetType: string;
  readonly selectedStrategy?: SdlcTraversalStrategy | undefined;
  readonly strategyDirectiveRef: string | null;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly requiredProgressArtifactRefs?: readonly string[];
  readonly declaredModuleNames: readonly string[];
  readonly materializedEntityIds: readonly string[];
  readonly materializedOperationIds: readonly string[];
}

function uniqueInOrder(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (normalized.length === 0 || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    output.push(normalized);
  }
  return Object.freeze(output);
}

function slugPart(input: string): string {
  const value = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return value.length === 0 ? "none" : value;
}

function tokenAppearsInRef(input: {
  readonly token: string;
  readonly refs: readonly string[];
}): boolean {
  const token = input.token.trim();
  if (token.length === 0) {
    return false;
  }
  return input.refs.some((ref) => {
    const decoded = decodeURIComponent(ref);
    return (
      decoded === token ||
      decoded.includes(`/${token}`) ||
      decoded.includes(`${token}/`) ||
      decoded.includes(`:${token}`) ||
      decoded.includes(`${token}:`) ||
      decoded.includes(`=${token}`) ||
      decoded.includes(`${token}?`) ||
      decoded.includes(`${token}#`)
    );
  });
}

function featureScopeTokens(featureScope: SdlcFeatureScope): readonly string[] {
  const tokens: string[] = [];
  for (const requirementRef of featureScope.includedRequirementRefs ?? []) {
    tokens.push(requirementRef);
    tokens.push(decodeURIComponent(requirementRef));
  }
  for (const moduleName of featureScope.includedModuleNames) {
    tokens.push(moduleName);
    const parts = moduleName.split(/[^A-Za-z0-9]+/u).filter(Boolean);
    tokens.push(...parts);
    const suffix = parts[parts.length - 1];
    if (suffix !== undefined) {
      tokens.push(suffix);
      if (suffix === "compiler") {
        tokens.push("compile", "compiled", "compilation");
      }
      if (suffix === "executor") {
        tokens.push("execute", "execution");
      }
      if (suffix === "mapper") {
        tokens.push("map", "mapping");
      }
    }
  }
  tokens.push(
    ...featureScope.includedEntityIds,
    ...featureScope.includedOperationIds
  );
  return uniqueSorted(tokens);
}

function normalizedRequirementKey(value: string): string | null {
  const decoded = decodeURIComponent(value).toLowerCase();
  const normalized = decoded.replace(/[^a-z0-9]+/gu, "_");
  const parts = normalized.split("_").filter((part) => part.length > 0);
  const reqIndex = parts.lastIndexOf("req");
  if (reqIndex < 0 || reqIndex === parts.length - 1) {
    return null;
  }
  return parts
    .slice(reqIndex)
    .map((part) => (/^\d+$/u.test(part) ? String(Number(part)) : part))
    .join(":");
}

function requirementKeyCandidates(input: {
  readonly obligation: Pick<
    SdlcTraversalObligation,
    "obligationId" | "summary"
  >;
}): readonly string[] {
  const candidates: string[] = [];
  const obligationKey = normalizedRequirementKey(input.obligation.obligationId);
  if (obligationKey !== null) {
    candidates.push(obligationKey);
  }
  const summaryMatch = /^Fulfill\s+([^:]+):/iu.exec(input.obligation.summary);
  if (summaryMatch?.[1] !== undefined) {
    const summaryKey = normalizedRequirementKey(summaryMatch[1]);
    if (summaryKey !== null) {
      candidates.push(summaryKey);
    }
  }
  return uniqueSorted(candidates);
}

function requirementObligationMatchesIncludedRefs(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly obligation: Pick<
    SdlcTraversalObligation,
    "obligationId" | "summary"
  >;
}): boolean {
  const includedRequirementRefs =
    input.featureScope.includedRequirementRefs ?? Object.freeze([]);
  const includedKeys = new Set(
    includedRequirementRefs.flatMap((ref) => {
      const key = normalizedRequirementKey(ref);
      return key === null ? [] : [key];
    })
  );
  if (includedKeys.size === 0) {
    return false;
  }
  return requirementKeyCandidates({ obligation: input.obligation }).some((key) =>
    includedKeys.has(key)
  );
}

export function sdlcModuleNameInFeatureScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly moduleName: string;
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (input.featureScope.includedModuleNames.length === 0) {
    return false;
  }
  return input.featureScope.includedModuleNames.includes(input.moduleName);
}

export function sdlcTextMatchesFeatureScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly text: string;
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  const tokens = featureScopeTokens(input.featureScope);
  if (tokens.length === 0) {
    return false;
  }
  const normalized = input.text.toLowerCase();
  return tokens.some((token) =>
    normalized.includes(token.toLowerCase())
  );
}

export function sdlcTraversalObligationInFeatureScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly obligation: Pick<
    SdlcTraversalObligation,
    "obligationId" | "obligationKind" | "summary" | "evidenceRefs" | "payload"
  >;
}): boolean {
  const includedRequirementRefs =
    input.featureScope.includedRequirementRefs ?? Object.freeze([]);
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (
    input.obligation.obligationKind === "target_asset" ||
    input.obligation.obligationKind === "evaluator" ||
    input.obligation.obligationKind === "source_asset" ||
    input.obligation.obligationKind === "runtime_context" ||
    input.obligation.obligationKind === "prior_gap"
  ) {
    return true;
  }
  if (
    input.featureScope.mode === "targeted_repair" &&
    input.obligation.obligationKind === "requirement" &&
    includedRequirementRefs.length === 0
  ) {
    return true;
  }
  if (
    input.obligation.obligationKind === "requirement" &&
    includedRequirementRefs.length > 0
  ) {
    return requirementObligationMatchesIncludedRefs({
      featureScope: input.featureScope,
      obligation: input.obligation
    });
  }
  if (
    input.obligation.obligationKind === "design_or_module" &&
    input.obligation.obligationId.startsWith("module:")
  ) {
    return sdlcModuleNameInFeatureScope({
      featureScope: input.featureScope,
      moduleName: input.obligation.obligationId.slice("module:".length)
    });
  }
  return sdlcTextMatchesFeatureScope({
    featureScope: input.featureScope,
    text: [
      input.obligation.obligationId,
      input.obligation.summary,
      ...input.obligation.evidenceRefs,
      ...input.obligation.payload.sourceRefs,
      ...input.obligation.payload.sourceSnippets,
      input.obligation.payload.coverageExpectation
    ].join("\n")
  });
}

function isSteelThreadDirective(strategyDirectiveRef: string | null): boolean {
  if (strategyDirectiveRef === null) {
    return false;
  }
  return /(?:steel[-_]?thread|single[-_]?vertical[-_]?slice|vertical[-_]?slice)/iu.test(
    strategyDirectiveRef
  );
}

function selectedScopeMode(input: {
  readonly selectedStrategy?: SdlcTraversalStrategy | undefined;
  readonly strategyDirectiveRef: string | null;
}): SdlcFeatureScope["mode"] {
  if (input.selectedStrategy !== undefined) {
    return input.selectedStrategy === "targeted_repair"
      ? "targeted_repair"
      : input.selectedStrategy;
  }
  return isSteelThreadDirective(input.strategyDirectiveRef)
    ? "steel_thread"
    : "full_breadth";
}

function selectedModules(input: {
  readonly declaredModuleNames: readonly string[];
  readonly refs: readonly string[];
}): readonly string[] {
  const declared = uniqueInOrder(input.declaredModuleNames);
  const explicit = declared.filter((moduleName) =>
    tokenAppearsInRef({ token: moduleName, refs: input.refs })
  );
  return uniqueInOrder(explicit);
}

function selectedIds(input: {
  readonly ids: readonly string[];
  readonly refs: readonly string[];
}): readonly string[] {
  return uniqueSorted(
    input.ids.filter((id) => tokenAppearsInRef({ token: id, refs: input.refs }))
  );
}

function selectedRequirementRefs(refs: readonly string[]): readonly string[] {
  return uniqueInOrder(
    refs.filter((ref) => ref.startsWith("requirement://"))
  );
}

export function deriveSdlcFeatureScope(
  input: SdlcFeatureScopeDerivationInput
): SdlcFeatureScope {
  const declaredModuleNames = uniqueInOrder(input.declaredModuleNames);
  const basisRefValues: string[] = [];
  if (input.strategyDirectiveRef !== null) {
    basisRefValues.push(input.strategyDirectiveRef);
  }
  basisRefValues.push(...input.selectedScheduleItemRefs);
  basisRefValues.push(...(input.requiredProgressArtifactRefs ?? []));
  const basisRefs = uniqueSorted(basisRefValues);
  const mode = selectedScopeMode({
    selectedStrategy: input.selectedStrategy,
    strategyDirectiveRef: input.strategyDirectiveRef
  });
  const includedRequirementRefs = selectedRequirementRefs(basisRefs);
  if (mode === "full_breadth") {
    return Object.freeze({
      kind: "sdlc_feature_scope" as const,
      scopeVersion: "ts-scope-v1" as const,
      mode,
      scopeRef: `scope://odd_sdlc/${slugPart(input.targetAssetType)}/full-breadth`,
      basisRefs,
      includedRequirementRefs,
      includedModuleNames: declaredModuleNames,
      includedEntityIds: uniqueSorted(input.materializedEntityIds),
      includedOperationIds: uniqueSorted(input.materializedOperationIds),
      deferredModuleNames: Object.freeze([])
    });
  }

  const includedModuleNames = selectedModules({
    declaredModuleNames,
    refs: basisRefs
  });
  const effectiveIncludedModuleNames =
    includedModuleNames.length === 0 && declaredModuleNames.length === 1
      ? declaredModuleNames
      : includedModuleNames;
  if (
    effectiveIncludedModuleNames.length === 0 &&
    includedRequirementRefs.length === 0
  ) {
    return Object.freeze({
      kind: "sdlc_feature_scope" as const,
      scopeVersion: "ts-scope-v1" as const,
      mode: "full_breadth" as const,
      scopeRef: `scope://odd_sdlc/${slugPart(input.targetAssetType)}/full-breadth`,
      basisRefs,
      includedRequirementRefs,
      includedModuleNames: declaredModuleNames,
      includedEntityIds: uniqueSorted(input.materializedEntityIds),
      includedOperationIds: uniqueSorted(input.materializedOperationIds),
      deferredModuleNames: Object.freeze([])
    });
  }
  return Object.freeze({
    kind: "sdlc_feature_scope" as const,
    scopeVersion: "ts-scope-v1" as const,
    mode,
    scopeRef: `scope://odd_sdlc/${slugPart(input.targetAssetType)}/${mode.replace("_", "-")}/${[
      ...effectiveIncludedModuleNames,
      ...includedRequirementRefs
    ].map(slugPart).join("+") || "unscoped"}`,
    basisRefs,
    includedRequirementRefs,
    includedModuleNames: effectiveIncludedModuleNames,
    includedEntityIds: selectedIds({
      ids: input.materializedEntityIds,
      refs: basisRefs
    }),
    includedOperationIds: selectedIds({
      ids: input.materializedOperationIds,
      refs: basisRefs
    }),
    deferredModuleNames: uniqueInOrder(
      declaredModuleNames.filter((moduleName) =>
        !effectiveIncludedModuleNames.includes(moduleName)
      )
    )
  });
}
