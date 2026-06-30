// Implements: T-177
// Implements: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Implements: REQ-L-GTL3-SELECTION-BOUNDARY

export const GTL_REGISTRY_LIBRARY_SCOPE_VALUES = Object.freeze([
  "system",
  "product"
] as const);

export type GtlRegistryLibraryScope =
  (typeof GTL_REGISTRY_LIBRARY_SCOPE_VALUES)[number];

export const GTL_REGISTRY_ENTRY_KIND_VALUES = Object.freeze([
  "graph_function",
  "overlay",
  "candidate_family",
  "public_start",
  "plugin"
] as const);

export type GtlRegistryEntryKind =
  (typeof GTL_REGISTRY_ENTRY_KIND_VALUES)[number];

export interface GtlLibraryEntryDeclaration {
  readonly kind: "gtl_library_entry_declaration";
  readonly declarationRef: string;
  readonly entryRef: string;
  readonly libraryScope: GtlRegistryLibraryScope;
  readonly entryKind: GtlRegistryEntryKind;
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly graphFunctionRef: string;
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
  readonly contextRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly overlayRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly refinementOfEntryRef: string | null;
  readonly overrideOfEntryRef: string | null;
  readonly declarationSourceRefs: readonly string[];
}

export interface ProductPluginSelectionAdvice {
  readonly kind: "product_plugin_selection_advice";
  readonly adviceRef: string;
  readonly pluginRef: string;
  readonly lookupResultRef: string;
  readonly preferredCandidateRef: string | null;
  readonly rankedCandidateRefs: readonly string[];
  readonly constraintRefs: readonly string[];
  readonly rationaleRef: string;
  readonly policyRefs: readonly string[];
  readonly forbiddenAuthorityRefs: readonly string[];
}

export interface ProductRegistryStartupConfig {
  readonly kind: "product_registry_startup_config";
  readonly configRef: string;
  readonly productNamespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly enabledLibraryRefs: readonly string[];
  readonly overlayRefs: readonly string[];
  readonly pluginRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly configSourceRefs: readonly string[];
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
}

function assertAllowedString<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string
): T {
  for (const candidate of allowed) {
    if (candidate === value) {
      return candidate;
    }
  }
  throw new TypeError(`${label} has unsupported value ${JSON.stringify(value)}`);
}

function freezeUniqueStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return Object.freeze([...values]);
}

function nullableRef(value: string | null, label: string): string | null {
  if (value === null) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

export function constructGtlLibraryEntryDeclaration(input: {
  readonly declarationRef: string;
  readonly entryRef: string;
  readonly libraryScope: GtlRegistryLibraryScope;
  readonly entryKind: GtlRegistryEntryKind;
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly graphFunctionRef: string;
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
  readonly contextRefs?: readonly string[];
  readonly authorityRefs?: readonly string[];
  readonly overlayRefs?: readonly string[];
  readonly provenanceRefs?: readonly string[];
  readonly readinessRefs?: readonly string[];
  readonly proofRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
  readonly refinementOfEntryRef?: string | null;
  readonly overrideOfEntryRef?: string | null;
  readonly declarationSourceRefs?: readonly string[];
}): GtlLibraryEntryDeclaration {
  assertNonEmptyString(input.declarationRef, "GtlLibraryEntryDeclaration.declarationRef");
  assertNonEmptyString(input.entryRef, "GtlLibraryEntryDeclaration.entryRef");
  const libraryScope = assertAllowedString(
    input.libraryScope,
    GTL_REGISTRY_LIBRARY_SCOPE_VALUES,
    "GtlLibraryEntryDeclaration.libraryScope"
  );
  const entryKind = assertAllowedString(
    input.entryKind,
    GTL_REGISTRY_ENTRY_KIND_VALUES,
    "GtlLibraryEntryDeclaration.entryKind"
  );
  assertNonEmptyString(input.namespace, "GtlLibraryEntryDeclaration.namespace");
  assertNonEmptyString(input.ownerRef, "GtlLibraryEntryDeclaration.ownerRef");
  assertNonEmptyString(input.version, "GtlLibraryEntryDeclaration.version");
  assertNonEmptyString(input.graphFunctionRef, "GtlLibraryEntryDeclaration.graphFunctionRef");
  assertNonEmptyString(input.interfaceRef, "GtlLibraryEntryDeclaration.interfaceRef");
  assertNonEmptyString(input.sourceContractRef, "GtlLibraryEntryDeclaration.sourceContractRef");
  assertNonEmptyString(input.targetContractRef, "GtlLibraryEntryDeclaration.targetContractRef");
  const declarationSourceRefs = freezeUniqueStrings(
    input.declarationSourceRefs ?? [],
    "GtlLibraryEntryDeclaration.declarationSourceRefs"
  );
  if (declarationSourceRefs.length === 0) {
    throw new TypeError(
      "GtlLibraryEntryDeclaration.declarationSourceRefs must cite GTL declaration truth"
    );
  }
  return Object.freeze({
    kind: "gtl_library_entry_declaration",
    declarationRef: input.declarationRef,
    entryRef: input.entryRef,
    libraryScope,
    entryKind,
    namespace: input.namespace,
    ownerRef: input.ownerRef,
    version: input.version,
    graphFunctionRef: input.graphFunctionRef,
    interfaceRef: input.interfaceRef,
    sourceContractRef: input.sourceContractRef,
    targetContractRef: input.targetContractRef,
    contextRefs: freezeUniqueStrings(
      input.contextRefs ?? [],
      "GtlLibraryEntryDeclaration.contextRefs"
    ),
    authorityRefs: freezeUniqueStrings(
      input.authorityRefs ?? [],
      "GtlLibraryEntryDeclaration.authorityRefs"
    ),
    overlayRefs: freezeUniqueStrings(
      input.overlayRefs ?? [],
      "GtlLibraryEntryDeclaration.overlayRefs"
    ),
    provenanceRefs: freezeUniqueStrings(
      input.provenanceRefs ?? [],
      "GtlLibraryEntryDeclaration.provenanceRefs"
    ),
    readinessRefs: freezeUniqueStrings(
      input.readinessRefs ?? [],
      "GtlLibraryEntryDeclaration.readinessRefs"
    ),
    proofRefs: freezeUniqueStrings(
      input.proofRefs ?? [],
      "GtlLibraryEntryDeclaration.proofRefs"
    ),
    policyRefs: freezeUniqueStrings(
      input.policyRefs ?? [],
      "GtlLibraryEntryDeclaration.policyRefs"
    ),
    refinementOfEntryRef: nullableRef(
      input.refinementOfEntryRef ?? null,
      "GtlLibraryEntryDeclaration.refinementOfEntryRef"
    ),
    overrideOfEntryRef: nullableRef(
      input.overrideOfEntryRef ?? null,
      "GtlLibraryEntryDeclaration.overrideOfEntryRef"
    ),
    declarationSourceRefs
  });
}

export function constructProductPluginSelectionAdvice(input: {
  readonly adviceRef: string;
  readonly pluginRef: string;
  readonly lookupResultRef: string;
  readonly preferredCandidateRef?: string | null;
  readonly rankedCandidateRefs?: readonly string[];
  readonly constraintRefs?: readonly string[];
  readonly rationaleRef: string;
  readonly policyRefs?: readonly string[];
  readonly forbiddenAuthorityRefs?: readonly string[];
}): ProductPluginSelectionAdvice {
  assertNonEmptyString(input.adviceRef, "ProductPluginSelectionAdvice.adviceRef");
  assertNonEmptyString(input.pluginRef, "ProductPluginSelectionAdvice.pluginRef");
  assertNonEmptyString(input.lookupResultRef, "ProductPluginSelectionAdvice.lookupResultRef");
  assertNonEmptyString(input.rationaleRef, "ProductPluginSelectionAdvice.rationaleRef");
  return Object.freeze({
    kind: "product_plugin_selection_advice",
    adviceRef: input.adviceRef,
    pluginRef: input.pluginRef,
    lookupResultRef: input.lookupResultRef,
    preferredCandidateRef: nullableRef(
      input.preferredCandidateRef ?? null,
      "ProductPluginSelectionAdvice.preferredCandidateRef"
    ),
    rankedCandidateRefs: freezeUniqueStrings(
      input.rankedCandidateRefs ?? [],
      "ProductPluginSelectionAdvice.rankedCandidateRefs"
    ),
    constraintRefs: freezeUniqueStrings(
      input.constraintRefs ?? [],
      "ProductPluginSelectionAdvice.constraintRefs"
    ),
    rationaleRef: input.rationaleRef,
    policyRefs: freezeUniqueStrings(
      input.policyRefs ?? [],
      "ProductPluginSelectionAdvice.policyRefs"
    ),
    forbiddenAuthorityRefs: freezeUniqueStrings(
      input.forbiddenAuthorityRefs ?? [],
      "ProductPluginSelectionAdvice.forbiddenAuthorityRefs"
    )
  });
}

export function constructProductRegistryStartupConfig(input: {
  readonly configRef: string;
  readonly productNamespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly enabledLibraryRefs?: readonly string[];
  readonly overlayRefs?: readonly string[];
  readonly pluginRefs?: readonly string[];
  readonly readinessRefs?: readonly string[];
  readonly proofRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
  readonly configSourceRefs?: readonly string[];
}): ProductRegistryStartupConfig {
  assertNonEmptyString(input.configRef, "ProductRegistryStartupConfig.configRef");
  assertNonEmptyString(
    input.productNamespace,
    "ProductRegistryStartupConfig.productNamespace"
  );
  assertNonEmptyString(input.ownerRef, "ProductRegistryStartupConfig.ownerRef");
  assertNonEmptyString(input.version, "ProductRegistryStartupConfig.version");
  const configSourceRefs = freezeUniqueStrings(
    input.configSourceRefs ?? [],
    "ProductRegistryStartupConfig.configSourceRefs"
  );
  if (configSourceRefs.length === 0) {
    throw new TypeError(
      "ProductRegistryStartupConfig.configSourceRefs must cite product startup config truth"
    );
  }
  return Object.freeze({
    kind: "product_registry_startup_config",
    configRef: input.configRef,
    productNamespace: input.productNamespace,
    ownerRef: input.ownerRef,
    version: input.version,
    enabledLibraryRefs: freezeUniqueStrings(
      input.enabledLibraryRefs ?? [],
      "ProductRegistryStartupConfig.enabledLibraryRefs"
    ),
    overlayRefs: freezeUniqueStrings(
      input.overlayRefs ?? [],
      "ProductRegistryStartupConfig.overlayRefs"
    ),
    pluginRefs: freezeUniqueStrings(
      input.pluginRefs ?? [],
      "ProductRegistryStartupConfig.pluginRefs"
    ),
    readinessRefs: freezeUniqueStrings(
      input.readinessRefs ?? [],
      "ProductRegistryStartupConfig.readinessRefs"
    ),
    proofRefs: freezeUniqueStrings(
      input.proofRefs ?? [],
      "ProductRegistryStartupConfig.proofRefs"
    ),
    policyRefs: freezeUniqueStrings(
      input.policyRefs ?? [],
      "ProductRegistryStartupConfig.policyRefs"
    ),
    configSourceRefs
  });
}
