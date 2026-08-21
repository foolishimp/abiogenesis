import * as v from "valibot";

import { capabilityRefsForContract } from "../shared/capability_contracts.js";

import type {
  CanonicalCheckerTargetIdentity,
  CanonicalSourceWitness,
  ContractExternalOccurrence,
  NativeContractBinding,
  PendingSelectorDisposition,
  ResolvedSemanticSelection,
} from "./declaration_exports.js";
import type { ProductDeclaredDependency } from "./contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";

import {
  absolutePathSchema,
  admitRuntimeContract,
  digestSchema,
  type ExactOwnerOperationPort,
  nonemptyRefDigestSetSchema,
  nonemptyUniqueArray,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refSetSchema,
  refusalSchema,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  typedResidualSetSchema,
  uniqueArray,
} from "../shared/public_function_contracts.js";

const ENVIRONMENT_AUTHORITY =
  "authority://abiogenesis/product/environment-resolution@5";

const productRequirementSchema = v.strictObject({
  productId: nonblankSchema,
  packageVersion: nonblankSchema,
  requiredContractRefs: refSetSchema,
  requiredCapabilityRefs: refSetSchema,
});

const successfulPackedVerificationReferenceSchema = v.strictObject({
  invocation: refDigestSchema,
  outcome: refDigestSchema,
});

const resolvedProductSelectionSchema = v.strictObject({
  requirement: productRequirementSchema,
  product: refDigestSchema,
  verification: successfulPackedVerificationReferenceSchema,
});

const resolvedDependencyEdgeSchema = v.strictObject({
  kind: v.literal("requires"),
  fromProductId: nonblankSchema,
  toProductId: nonblankSchema,
  packageVersion: nonblankSchema,
  compatibilityRef: nonblankSchema,
  compatibilityDisposition: v.literal("compatible"),
  requiredContractRefs: refSetSchema,
  requiredCapabilityRefs: refSetSchema,
});

const directDependencyEdgeSchema = v.strictObject({
  kind: v.literal("requires"),
  productId: nonblankSchema,
  packageVersion: nonblankSchema,
  compatibilityRef: nonblankSchema,
  requiredContractRefs: refSetSchema,
  requiredCapabilityRefs: refSetSchema,
});

type Assert<T extends true> = T;
type NativeOutputOf<A, B> = [A] extends [B] ? true : false;
type _DirectDependencyEdgeSchemaIsNative = Assert<
  NativeOutputOf<
    v.InferOutput<typeof directDependencyEdgeSchema>,
    ProductDeclaredDependency
  >
>;

const boundaryDeclarationWitnessSchema = v.strictObject({
  declarationPath: nonblankSchema,
  declarationDigest: digestSchema,
  declarationKind: nonblankSchema,
  exportedName: nonblankSchema,
});

export const canonicalCheckerTargetIdentitySchema = v.strictObject({
  targetProductContentDigest: digestSchema,
  targetPackageName: nonblankSchema,
  targetPackageExportPath: nonblankSchema,
  targetExportedSymbol: nonblankSchema,
  requiredSymbolSpace: v.picklist(["type", "value", "namespace"]),
  boundaryDeclarationWitnesses: nonemptyUniqueArray(
    boundaryDeclarationWitnessSchema,
  ),
  targetIdentityDigest: digestSchema,
});

const externalRelationOriginSchema = v.union([
  v.strictObject({
    kind: v.literal("import_declaration"),
    clause: v.picklist(["side_effect", "default", "named", "namespace"]),
    declarationTypeOnly: v.boolean(),
    specifierTypeOnly: v.boolean(),
  }),
  v.strictObject({
    kind: v.literal("export_declaration"),
    clause: v.picklist(["named", "star", "namespace"]),
    declarationTypeOnly: v.boolean(),
    specifierTypeOnly: v.boolean(),
  }),
  v.strictObject({
    kind: v.literal("import_type_expression"),
    operator: v.picklist(["type", "typeof"]),
  }),
  v.strictObject({ kind: v.literal("import_equals_declaration") }),
  v.strictObject({ kind: v.literal("type_reference_directive") }),
  v.strictObject({ kind: v.literal("module_augmentation") }),
]);

const externalSelectionSchema = v.union([
  v.strictObject({ kind: v.literal("module") }),
  v.strictObject({
    kind: v.literal("name"),
    targetName: nonblankSchema,
    exposedName: nonblankSchema,
  }),
  v.strictObject({ kind: v.literal("namespace"), exposedName: nonblankSchema }),
  v.strictObject({ kind: v.literal("all") }),
]);

const canonicalSourceWitnessSchema = v.strictObject({
  witnessDigest: digestSchema,
  selectorRef: digestSchema,
  physicalRelationRef: nonblankSchema,
  declarationPath: nonblankSchema,
  declarationDigest: digestSchema,
  sourceStart: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  sourceEnd: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
  origin: externalRelationOriginSchema,
  selection: externalSelectionSchema,
});

const resolvedSemanticSelectionSchema = v.strictObject({
  derivation: v.picklist([
    "named",
    "namespace_member",
    "star_member",
    "import_equals_member",
    "import_type_member",
  ]),
  targetExportedSymbol: nonblankSchema,
  exposedMemberPath: v.pipe(v.array(nonblankSchema), v.minLength(1)),
  semanticUse: v.picklist([
    "type_reference",
    "value_reference",
    "type_query",
    "namespace_reference",
  ]),
  requiredSymbolSpace: v.picklist(["type", "value", "namespace"]),
});

export const contractExternalOccurrenceSchema = v.strictObject({
  occurrenceRef: digestSchema,
  sourceProductContentDigest: digestSchema,
  sourceContractRef: nonblankSchema,
  sourceContractDigest: digestSchema,
  sourcePackageExportPath: nonblankSchema,
  sourceNamedSymbol: nonblankSchema,
  sourceWitnesses: nonemptyUniqueArray(canonicalSourceWitnessSchema),
  semanticSelection: resolvedSemanticSelectionSchema,
  checkerTarget: canonicalCheckerTargetIdentitySchema,
});

export const pendingSelectorDispositionSchema = v.union([
  v.strictObject({
    kind: v.literal("semantic_occurrences"),
    selectorRef: digestSchema,
    occurrenceRefs: nonemptyUniqueArray(digestSchema),
  }),
  v.strictObject({
    kind: v.literal("no_external_contribution"),
    selectorRef: digestSchema,
    reason: v.picklist(["locally_shadowed", "not_in_source_contract_meaning"]),
    checkerWitnessDigest: digestSchema,
  }),
]);

export const resolvedNativeContractBindingSchema = v.strictObject({
  kind: v.literal("external_binding"),
  sourceOccurrenceRef: digestSchema,
  directDependencyEdge: directDependencyEdgeSchema,
  targetProductContentDigest: digestSchema,
  targetContractRef: nonblankSchema,
  targetContractDigest: digestSchema,
  targetPackageExportPath: nonblankSchema,
  targetNamedSymbol: nonblankSchema,
  checkerTarget: canonicalCheckerTargetIdentitySchema,
});

export const resolvedNativeContractBindingSetSchema = uniqueArray(
  resolvedNativeContractBindingSchema,
);

export const resolvedNativeContractClosureSchema = v.strictObject({
  selectorDispositions: uniqueArray(pendingSelectorDispositionSchema),
  occurrences: uniqueArray(contractExternalOccurrenceSchema),
  nativeBindings: resolvedNativeContractBindingSetSchema,
});

export type ResolvedNativeContractClosure = v.InferOutput<
  typeof resolvedNativeContractClosureSchema
>;

export type ResolvedNativeContractClosureAdmission =
  | Readonly<{
    readonly disposition: "admitted";
    readonly value: ResolvedNativeContractClosure;
  }>
  | Readonly<{
    readonly disposition: "refused";
    readonly issuePaths: readonly string[];
  }>;

/** Product-resolver semantic conservation over its structurally projected row. */
export function admitResolvedNativeContractClosure(
  verifiedPendingSelectorRefs: readonly string[],
  candidate: unknown,
): ResolvedNativeContractClosureAdmission {
  const structural = admitRuntimeContract(
    resolvedNativeContractClosureSchema,
    candidate,
  );
  if (structural.disposition === "refused") return structural;
  const value = structural.value as ResolvedNativeContractClosure;
  const issues = new Set<string>();
  const expectedSelectors = [...verifiedPendingSelectorRefs].sort();
  const dispositionSelectors = value.selectorDispositions
    .map(({ selectorRef }) => selectorRef)
    .sort();
  if (
    expectedSelectors.length !== new Set(expectedSelectors).size ||
    dispositionSelectors.length !== new Set(dispositionSelectors).size ||
    canonicalJson(expectedSelectors) !== canonicalJson(dispositionSelectors)
  ) issues.add("/selectorDispositions");

  const occurrenceRefs = value.occurrences.map(({ occurrenceRef }) => occurrenceRef);
  const bindingRefs = value.nativeBindings.map(
    ({ sourceOccurrenceRef }) => sourceOccurrenceRef,
  );
  if (
    occurrenceRefs.length !== new Set(occurrenceRefs).size ||
    bindingRefs.length !== new Set(bindingRefs).size ||
    canonicalJson([...occurrenceRefs].sort()) !==
      canonicalJson([...bindingRefs].sort())
  ) issues.add("/nativeBindings");
  const dispositionOccurrenceRefs = new Set(
    value.selectorDispositions.flatMap((row) =>
      row.kind === "semantic_occurrences" ? row.occurrenceRefs : []
    ),
  );
  if (
    [...dispositionOccurrenceRefs].some((ref) => !occurrenceRefs.includes(ref)) ||
    occurrenceRefs.some((ref) => !dispositionOccurrenceRefs.has(ref))
  ) issues.add("/selectorDispositions");

  for (const [index, occurrence] of value.occurrences.entries()) {
    for (const witness of occurrence.sourceWitnesses) {
      if (witness.witnessDigest !== sha256Canonical({
        selectorRef: witness.selectorRef,
        physicalRelationRef: witness.physicalRelationRef,
        declarationPath: witness.declarationPath,
        declarationDigest: witness.declarationDigest,
        sourceStart: witness.sourceStart,
        sourceEnd: witness.sourceEnd,
        origin: witness.origin,
        selection: witness.selection,
      } as unknown as JsonValue)) {
        issues.add(`/occurrences/${index}/sourceWitnesses`);
      }
    }
    const target = occurrence.checkerTarget;
    if (target.targetIdentityDigest !== sha256Canonical({
      targetProductContentDigest: target.targetProductContentDigest,
      targetPackageName: target.targetPackageName,
      targetPackageExportPath: target.targetPackageExportPath,
      targetExportedSymbol: target.targetExportedSymbol,
      requiredSymbolSpace: target.requiredSymbolSpace,
      boundaryDeclarationWitnesses: target.boundaryDeclarationWitnesses,
    } as unknown as JsonValue)) {
      issues.add(`/occurrences/${index}/checkerTarget/targetIdentityDigest`);
    }
    if (occurrence.occurrenceRef !== sha256Canonical({
      sourceProductContentDigest: occurrence.sourceProductContentDigest,
      sourceContractRef: occurrence.sourceContractRef,
      sourceContractDigest: occurrence.sourceContractDigest,
      sourcePackageExportPath: occurrence.sourcePackageExportPath,
      sourceNamedSymbol: occurrence.sourceNamedSymbol,
      sourceWitnesses: occurrence.sourceWitnesses,
      semanticSelection: occurrence.semanticSelection,
      checkerTarget: occurrence.checkerTarget,
    } as unknown as JsonValue)) {
      issues.add(`/occurrences/${index}/occurrenceRef`);
    }
  }
  for (const [index, binding] of value.nativeBindings.entries()) {
    const target = binding.checkerTarget;
    if (
      !binding.directDependencyEdge.requiredContractRefs.includes(
        binding.targetContractRef,
      ) ||
      binding.targetProductContentDigest !== target.targetProductContentDigest ||
      binding.targetPackageExportPath !== target.targetPackageExportPath ||
      binding.targetNamedSymbol !== target.targetExportedSymbol
    ) issues.add(`/nativeBindings/${index}`);
    const occurrence = value.occurrences.find(
      ({ occurrenceRef }) => occurrenceRef === binding.sourceOccurrenceRef,
    );
    if (
      occurrence === undefined ||
      canonicalJson(occurrence.checkerTarget as unknown as JsonValue) !==
        canonicalJson(binding.checkerTarget as unknown as JsonValue)
    ) issues.add(`/nativeBindings/${index}/checkerTarget`);
  }

  return issues.size === 0
    ? Object.freeze({ disposition: "admitted" as const, value })
    : Object.freeze({
      disposition: "refused" as const,
      issuePaths: Object.freeze([...issues].sort()),
    });
}

type _CheckerTargetSchemaIsNative = Assert<NativeOutputOf<
  v.InferOutput<typeof canonicalCheckerTargetIdentitySchema>,
  CanonicalCheckerTargetIdentity
>>;
type _SourceWitnessSchemaIsNative = Assert<NativeOutputOf<
  v.InferOutput<typeof canonicalSourceWitnessSchema>,
  CanonicalSourceWitness
>>;
type _SemanticSelectionSchemaIsNative = Assert<NativeOutputOf<
  v.InferOutput<typeof resolvedSemanticSelectionSchema>,
  ResolvedSemanticSelection
>>;
type _ExternalOccurrenceSchemaIsNative = Assert<NativeOutputOf<
  v.InferOutput<typeof contractExternalOccurrenceSchema>,
  ContractExternalOccurrence
>>;
type _SelectorDispositionSchemaIsNative = Assert<NativeOutputOf<
  v.InferOutput<typeof pendingSelectorDispositionSchema>,
  PendingSelectorDisposition
>>;
type _NativeBindingSchemaIsNative = Assert<NativeOutputOf<
  v.InferOutput<typeof resolvedNativeContractBindingSchema>,
  NativeContractBinding
>>;

const resolve = ownerContractPacket(
  { operationId: "abg.operation.product.resolve", memberKey: "resolve" },
  v.strictObject({
    requirements: nonemptyUniqueArray(productRequirementSchema),
    verifiedCandidates: nonemptyUniqueArray(
      successfulPackedVerificationReferenceSchema,
    ),
  }),
  v.strictObject({
    resolvedLock: refDigestSchema,
    selections: nonemptyUniqueArray(resolvedProductSelectionSchema),
    dependencyEdges: uniqueArray(resolvedDependencyEdgeSchema),
    selectorDispositions: uniqueArray(pendingSelectorDispositionSchema),
    occurrences: uniqueArray(contractExternalOccurrenceSchema),
    nativeBindings: resolvedNativeContractBindingSetSchema,
    residuals: typedResidualSetSchema,
    provenance: nonemptyRefDigestSetSchema,
  }),
  refusalSchema([
    "invalid",
    "unverified",
    "unresolved",
    "incompatible",
    "ambiguous",
    "cyclic",
  ]),
  null,
  {
    abstractModule: "Product.EnvironmentResolution",
    exportName: "PRODUCT_ENVIRONMENT_CONTRACTS",
    memberPath: ["resolve"],
    authorityRef: ENVIRONMENT_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(ENVIRONMENT_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "pure",
    effectClass: "deterministic_dependency_resolution",
    eventAdmission: "none",
    actorRequirement: "forbidden",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: [
      "capability_grants",
      "verification_references",
    ],
    capabilityRefs: capabilityRefsForContract("abg.operation.product.resolve"),
    defaults: {},
    closedDomains: {},
    sdkCoordinate: "sdk.product.resolve",
    cliCoordinate: "product resolve",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

const declaredWorkspaceRootSchema = v.strictObject({
  rootKind: v.picklist([
    "toolchain",
    "product",
    "event_log",
    "runtime_state",
    "projection",
    "archive",
  ]),
  path: absolutePathSchema,
});

const bind = ownerContractPacket(
  { operationId: "abg.operation.workspace.bind", memberKey: "bind" },
  v.strictObject({
    workspaceAuthority: refDigestSchema,
    installedSet: nonemptyRefDigestSetSchema,
    resolvedLock: refDigestSchema,
    declaredRoots: nonemptyUniqueArray(declaredWorkspaceRootSchema),
  }),
  v.strictObject({
    binding: refDigestSchema,
    installedSet: nonemptyRefDigestSetSchema,
    resolvedLock: refDigestSchema,
    declaredRoots: nonemptyUniqueArray(declaredWorkspaceRootSchema),
    provenance: nonemptyRefDigestSetSchema,
  }),
  refusalSchema([
    "workspace_mismatch",
    "product_mismatch",
    "lock_mismatch",
    "content_mismatch",
    "root_mismatch",
    "binding_conflict",
    "incompatible",
  ]),
  null,
  {
    abstractModule: "Product.EnvironmentResolution",
    exportName: "PRODUCT_ENVIRONMENT_CONTRACTS",
    memberPath: ["bind"],
    authorityRef: ENVIRONMENT_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(ENVIRONMENT_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "write",
    effectClass: "workspace_binding_persistence",
    eventAdmission: "immutable_artifact_boundary",
    actorRequirement: "required",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: [
      "capability_grants",
      "product_set",
      "dependency_lock",
      "actor",
    ],
    capabilityRefs: capabilityRefsForContract("abg.operation.workspace.bind"),
    defaults: {},
    closedDomains: {
      rootKind: [
        "toolchain",
        "product",
        "event_log",
        "runtime_state",
        "projection",
        "archive",
      ],
    },
    sdkCoordinate: "sdk.workspace.bind",
    cliCoordinate: "workspace bind",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

export const PRODUCT_ENVIRONMENT_CONTRACTS = Object.freeze({ resolve, bind });

export interface ProductEnvironmentPort {
  readonly resolve: ExactOwnerOperationPort<typeof resolve>;
  readonly bindWorkspace: ExactOwnerOperationPort<typeof bind>;
}
