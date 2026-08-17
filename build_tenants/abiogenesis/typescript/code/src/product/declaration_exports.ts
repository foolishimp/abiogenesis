import { readFileSync } from "node:fs";
import { posix } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import type * as TypeScript from "typescript";

import {
  canonicalJson,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { ABI5_PRODUCT_ID } from "./contracts.js";
import type {
  ProductDeclaredDependency,
  ProductNativeDeclarationInventoryRow,
  ProductPublicContract,
} from "./contracts.js";

export interface DeclarationSource {
  readonly path: string;
  readonly bytes: Uint8Array;
}

export interface NativeDeclarationRoot {
  readonly packageExportPath: string;
  readonly declarationPath: string;
}

export type NativePackageType = "commonjs" | "module";

export type ExternalRelationOrigin =
  | Readonly<{
    readonly kind: "import_declaration";
    readonly clause: "side_effect" | "default" | "named" | "namespace";
    readonly declarationTypeOnly: boolean;
    readonly specifierTypeOnly: boolean;
  }>
  | Readonly<{
    readonly kind: "export_declaration";
    readonly clause: "named" | "star" | "namespace";
    readonly declarationTypeOnly: boolean;
    readonly specifierTypeOnly: boolean;
  }>
  | Readonly<{
    readonly kind: "import_type_expression";
    readonly operator: "type" | "typeof";
  }>
  | Readonly<{ readonly kind: "import_equals_declaration" }>
  | Readonly<{ readonly kind: "type_reference_directive" }>
  | Readonly<{ readonly kind: "module_augmentation" }>;

export type ExternalSelection =
  | Readonly<{ readonly kind: "module" }>
  | Readonly<{
    readonly kind: "name";
    readonly targetName: string;
    readonly exposedName: string;
  }>
  | Readonly<{
    readonly kind: "namespace";
    readonly exposedName: string;
  }>
  | Readonly<{ readonly kind: "all" }>;

export interface PhysicalDeclarationRelation {
  readonly physicalRelationRef: string;
  readonly physicalRelationDigest: Sha256Digest;
  readonly sourceProductContentDigest: Sha256Digest;
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceStart: number;
  readonly sourceEnd: number;
  readonly moduleSpecifier: string;
  readonly origin: ExternalRelationOrigin;
  readonly selection: ExternalSelection;
}

export interface ContractIndexedPendingExternalSelector {
  readonly selectorRef: Sha256Digest;
  readonly sourceProductContentDigest: Sha256Digest;
  readonly sourceContractRef: string;
  readonly sourceContractDigest: Sha256Digest;
  readonly sourcePackageExportPath: string;
  readonly sourceNamedSymbol: string;
  readonly physicalRelationRef: string;
  readonly externalPackageName: string;
  readonly externalModuleSpecifier: string;
  readonly origin: ExternalRelationOrigin;
  readonly selection: ExternalSelection;
  readonly localAccessPath: readonly string[];
}

export interface NativeModuleAugmentation {
  readonly packageExportPath: string;
  readonly declarationPath: string;
  readonly sourceOffset: number;
  readonly sourceEnd: number;
  readonly moduleSpecifier: string;
}

export interface NativeDeclarationClosure {
  readonly packageExportPath: string;
  readonly declarationPath: string;
  readonly exportedSymbols: readonly string[];
  readonly exportedSymbolPhysicalRelationRefs: Readonly<
    Record<string, readonly string[]>
  >;
  readonly declarationInventory:
    readonly ProductNativeDeclarationInventoryRow[];
  readonly physicalRelations: readonly PhysicalDeclarationRelation[];
  readonly moduleAugmentations: readonly NativeModuleAugmentation[];
  readonly contributesGlobals: boolean;
}

export interface NativeDeclarationClosureRequest {
  readonly packageName: string;
  readonly packageType: NativePackageType;
  readonly packageExports: Readonly<Record<string, unknown>>;
  readonly declarationSources: readonly DeclarationSource[];
  readonly sourceProductContentDigest: Sha256Digest;
}

export interface NativeDeclarationEvidenceSource {
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceText: string;
}

export interface NativeContractEvidence {
  readonly contractId: string;
  readonly contractDigest: Sha256Digest;
  readonly packageExportPath: string;
  readonly namedSymbol: string;
  readonly localDisposition: "local" | "pending_external";
  readonly pendingSelectors: readonly ContractIndexedPendingExternalSelector[];
}

export interface NativeProductDeclarationEvidence {
  readonly productId: string;
  readonly productContentDigest: Sha256Digest;
  readonly packageName: string;
  readonly packageType: NativePackageType;
  readonly sources: readonly NativeDeclarationEvidenceSource[];
  readonly closures: readonly NativeDeclarationClosure[];
  readonly contracts: readonly NativeContractEvidence[];
}

export interface NativeLinkProduct {
  readonly productId: string;
  readonly productContentDigest: Sha256Digest;
  readonly packageName: string;
  readonly declaredDependencies: readonly ProductDeclaredDependency[];
  readonly publicContracts: readonly ProductPublicContract[];
  readonly evidence: NativeProductDeclarationEvidence;
}

export interface CanonicalSourceWitness {
  readonly witnessDigest: Sha256Digest;
  readonly selectorRef: string;
  readonly physicalRelationRef: string;
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceStart: number;
  readonly sourceEnd: number;
  readonly origin: ExternalRelationOrigin;
  readonly selection: ExternalSelection;
}

export interface ResolvedSemanticSelection {
  readonly derivation:
    | "named"
    | "namespace_member"
    | "star_member"
    | "import_equals_member"
    | "import_type_member";
  readonly targetExportedSymbol: string;
  readonly exposedMemberPath: readonly string[];
  readonly semanticUse:
    | "type_reference"
    | "value_reference"
    | "type_query"
    | "namespace_reference";
  readonly requiredSymbolSpace: "type" | "value" | "namespace";
}

export interface CanonicalCheckerTargetIdentity {
  readonly targetProductContentDigest: Sha256Digest;
  readonly targetPackageName: string;
  readonly targetPackageExportPath: string;
  readonly targetExportedSymbol: string;
  readonly requiredSymbolSpace: "type" | "value" | "namespace";
  readonly boundaryDeclarationWitnesses: readonly Readonly<{
    readonly declarationPath: string;
    readonly declarationDigest: Sha256Digest;
    readonly declarationKind: string;
    readonly exportedName: string;
  }>[];
  readonly targetIdentityDigest: Sha256Digest;
}

export interface ContractExternalOccurrence {
  readonly occurrenceRef: string;
  readonly sourceProductContentDigest: Sha256Digest;
  readonly sourceContractRef: string;
  readonly sourceContractDigest: Sha256Digest;
  readonly sourcePackageExportPath: string;
  readonly sourceNamedSymbol: string;
  readonly sourceWitnesses: readonly CanonicalSourceWitness[];
  readonly semanticSelection: ResolvedSemanticSelection;
  readonly checkerTarget: CanonicalCheckerTargetIdentity;
}

export type PendingSelectorDisposition =
  | Readonly<{
    readonly kind: "semantic_occurrences";
    readonly selectorRef: string;
    readonly occurrenceRefs: readonly string[];
  }>
  | Readonly<{
    readonly kind: "no_external_contribution";
    readonly selectorRef: string;
    readonly reason: "locally_shadowed" | "not_in_source_contract_meaning";
    readonly checkerWitnessDigest: Sha256Digest;
  }>;

export interface NativeContractBinding {
  readonly kind: "external_binding";
  readonly sourceOccurrenceRef: string;
  readonly directDependencyEdge: ProductDeclaredDependency;
  readonly targetProductContentDigest: Sha256Digest;
  readonly targetContractRef: string;
  readonly targetContractDigest: Sha256Digest;
  readonly targetPackageExportPath: string;
  readonly targetNamedSymbol: string;
  readonly checkerTarget: CanonicalCheckerTargetIdentity;
}

export interface NativeContractSymbolAdmission {
  readonly kind: "symbol_admission";
  readonly productContentDigest: Sha256Digest;
  readonly contractRef: string;
  readonly contractDigest: Sha256Digest;
  readonly packageExportPath: string;
  readonly namedSymbol: string;
}

export type NativeContractClosureRow =
  | NativeContractBinding
  | NativeContractSymbolAdmission;

export type NativeContractLinkResult =
  | Readonly<{
    kind: "linked";
    bindings: readonly NativeContractClosureRow[];
    selectorDispositions: readonly PendingSelectorDisposition[];
    occurrences: readonly ContractExternalOccurrence[];
    nativeContractClosureDigest: Sha256Digest;
  }>
  | Readonly<{
    kind: "refused";
    code:
      | "ambiguous_dependency"
      | "incompatible_dependency"
      | "unresolved_dependency";
    message: string;
  }>;

const VIRTUAL_PACKAGE_ROOT = "/package";

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareStructuredFields(
  left: readonly (string | number | null)[],
  right: readonly (string | number | null)[],
): number {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index]!;
    const rightValue = right[index]!;
    const comparison = typeof leftValue === "number" &&
        typeof rightValue === "number"
      ? leftValue - rightValue
      : compareText(String(leftValue ?? ""), String(rightValue ?? ""));
    if (comparison !== 0) return comparison;
  }
  return left.length - right.length;
}

function structuredKey(
  fields: readonly (string | number | null)[],
): string {
  return canonicalJson(fields);
}

function isNonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSafeDeclarationPath(path: string): boolean {
  if (
    path.length === 0 ||
    posix.isAbsolute(path) ||
    path.includes("\0") ||
    path.includes("\\")
  ) {
    return false;
  }
  const normalized = posix.normalize(path);
  return normalized === path &&
    normalized !== ".." &&
    !normalized.startsWith("../") &&
    /\.d\.(?:c|m)?ts$/u.test(normalized);
}

function virtualDeclarationPath(
  root: string,
  path: string,
): string | null {
  return isSafeDeclarationPath(path) ? posix.join(root, path) : null;
}

function packageExportDeclarationPath(value: unknown): string | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }
  const types = (value as Readonly<Record<string, unknown>>).types;
  if (typeof types !== "string" || !types.startsWith("./")) return null;
  const declarationPath = posix.normalize(types.slice(2));
  return isSafeDeclarationPath(declarationPath) ? declarationPath : null;
}

export function nativeDeclarationRoots(
  packageExports: Readonly<Record<string, unknown>>,
): readonly NativeDeclarationRoot[] | null {
  const roots: NativeDeclarationRoot[] = [];
  for (const [packageExportPath, value] of Object.entries(packageExports)) {
    if (
      packageExportPath !== "." &&
      (
        !packageExportPath.startsWith("./") ||
        packageExportPath.includes("\0") ||
        packageExportPath.includes("\\") ||
        posix.normalize(packageExportPath.slice(2)) !==
          packageExportPath.slice(2)
      )
    ) {
      return null;
    }
    const declarationPath = packageExportDeclarationPath(value);
    if (declarationPath !== null) {
      roots.push({ packageExportPath, declarationPath });
    }
  }
  roots.sort((left, right) =>
    compareText(left.packageExportPath, right.packageExportPath)
  );
  return roots.length > 0 ? roots : null;
}

function directoryContainsSource(
  sources: ReadonlyMap<string, string>,
  directory: string,
): boolean {
  const normalized = posix.normalize(directory);
  const prefix = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return [...sources.keys()].some((path) => path.startsWith(prefix));
}

function nodeAtPosition(
  sourceFile: TypeScript.SourceFile,
  position: number,
): TypeScript.Node {
  let match: TypeScript.Node = sourceFile;
  const visit = (node: TypeScript.Node): void => {
    if (position < node.getFullStart() || position >= node.getEnd()) return;
    match = node;
    node.forEachChild(visit);
  };
  sourceFile.forEachChild(visit);
  return match;
}

function diagnosticModuleSpecifierNode(
  typescript: typeof TypeScript,
  diagnostic: TypeScript.Diagnostic,
): TypeScript.StringLiteralLike | null {
  if (
    diagnostic.file === undefined ||
    diagnostic.start === undefined
  ) {
    return null;
  }
  let node: TypeScript.Node | undefined = nodeAtPosition(
    diagnostic.file,
    diagnostic.start,
  );
  while (node !== undefined) {
    if (
      typescript.isImportDeclaration(node) ||
      typescript.isExportDeclaration(node)
    ) {
      return node.moduleSpecifier !== undefined &&
          typescript.isStringLiteralLike(node.moduleSpecifier)
        ? node.moduleSpecifier
        : null;
    }
    if (
      typescript.isImportEqualsDeclaration(node) &&
      typescript.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression !== undefined &&
      typescript.isStringLiteralLike(node.moduleReference.expression)
    ) {
      return node.moduleReference.expression;
    }
    if (
      typescript.isImportTypeNode(node) &&
      typescript.isLiteralTypeNode(node.argument) &&
      typescript.isStringLiteralLike(node.argument.literal)
    ) {
      return node.argument.literal;
    }
    if (
      typescript.isModuleDeclaration(node) &&
      typescript.isStringLiteralLike(node.name)
    ) {
      return node.name;
    }
    node = node.parent;
  }
  return null;
}

function diagnosticModuleSpecifier(
  typescript: typeof TypeScript,
  diagnostic: TypeScript.Diagnostic,
): string | null {
  return diagnosticModuleSpecifierNode(typescript, diagnostic)?.text ?? null;
}

export function packageImportCoordinate(
  specifier: string,
): Readonly<{ packageName: string; packageExportPath: string }> | null {
  if (
    !isNonblank(specifier) ||
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("node:") ||
    specifier.includes("\\") ||
    specifier.includes("\0")
  ) {
    return null;
  }
  const parts = specifier.split("/");
  const packageName = specifier.startsWith("@")
    ? parts.length >= 2
      ? `${parts[0]}/${parts[1]}`
      : null
    : parts[0] ?? null;
  if (packageName === null || !isNonblank(packageName)) return null;
  const subpath = specifier.slice(packageName.length);
  return {
    packageName,
    packageExportPath: subpath.length === 0 ? "." : `.${subpath}`,
  };
}

function isPlatformSpecifier(specifier: string): boolean {
  return specifier === "node" || specifier.startsWith("node:");
}

function selfPackageExportPath(
  packageName: string,
  specifier: string,
): string | null {
  if (specifier === packageName) return ".";
  return specifier.startsWith(`${packageName}/`)
    ? `.${specifier.slice(packageName.length)}`
    : null;
}

function loadTypeScript(): typeof TypeScript {
  const compilerModule = createRequire(import.meta.url)(
    fileURLToPath(
      new URL("../../../toolchain/typescript.cjs", import.meta.url),
    ),
  ) as { readonly default?: typeof TypeScript } | typeof TypeScript;
  return (compilerModule.default ?? compilerModule) as typeof TypeScript;
}

function installedToolchainProductContentDigest(): Sha256Digest | null {
  try {
    const manifest = JSON.parse(
      readFileSync(
        new URL(
          "../../../../product-toolchain-manifest.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ) as Readonly<Record<string, unknown>>;
    return manifest.productId === ABI5_PRODUCT_ID &&
        isSha256Digest(manifest.productContentDigest)
      ? manifest.productContentDigest
      : null;
  } catch {
    return null;
  }
}

interface CompilerBasis {
  readonly options: TypeScript.CompilerOptions;
  readonly standardHost: TypeScript.CompilerHost;
  readonly compilerDependencyRoots: readonly string[];
}

function compilerBasis(ts: typeof TypeScript): CompilerBasis {
  const options: TypeScript.CompilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: false,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    typeRoots: [],
    types: [],
  };
  const standardHost = ts.createCompilerHost(options, true);
  const toolchainRoot = posix.dirname(ts.getDefaultLibFilePath(options));
  return {
    options: {
      ...options,
      typeRoots: [posix.join(toolchainRoot, "node_modules/@types")],
      types: ["node"],
    },
    standardHost,
    compilerDependencyRoots: [
      toolchainRoot,
      posix.join(toolchainRoot, "node_modules/@types/node"),
      posix.join(toolchainRoot, "node_modules/undici-types"),
    ],
  };
}

function typeDirectiveName(
  value: string | TypeScript.FileReference,
): string {
  return typeof value === "string" ? value : value.fileName;
}

function isInsideAny(path: string, roots: readonly string[]): boolean {
  const normalized = posix.normalize(path);
  return roots.some(
    (root) => normalized === root || normalized.startsWith(`${root}/`),
  );
}

function canReachAnyDirectory(
  directory: string,
  roots: readonly string[],
): boolean {
  const normalized = posix.normalize(directory);
  return roots.some(
    (root) =>
      normalized === root ||
      normalized.startsWith(`${root}/`) ||
      root.startsWith(`${normalized}/`),
  );
}

function createClosedHost(
  ts: typeof TypeScript,
  basis: CompilerBasis,
  sourceText: ReadonlyMap<string, string>,
  impliedNodeFormatFor: (
    fileName: string,
  ) => TypeScript.ResolutionMode | undefined = () => undefined,
): TypeScript.CompilerHost {
  const { options, standardHost, compilerDependencyRoots } = basis;
  return {
    directoryExists: (directory) =>
      directoryContainsSource(sourceText, directory) ||
      (
        canReachAnyDirectory(directory, compilerDependencyRoots) &&
        (standardHost.directoryExists?.(directory) ?? false)
      ),
    fileExists: (fileName) =>
      sourceText.has(posix.normalize(fileName)) ||
      (
        isInsideAny(fileName, compilerDependencyRoots) &&
        standardHost.fileExists(fileName)
      ),
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => VIRTUAL_PACKAGE_ROOT,
    getDefaultLibFileName: standardHost.getDefaultLibFileName,
    getDirectories: (directory) =>
      canReachAnyDirectory(directory, compilerDependencyRoots)
        ? (standardHost.getDirectories?.(directory) ?? [])
            .filter((entry) =>
              canReachAnyDirectory(entry, compilerDependencyRoots)
            )
        : [],
    getNewLine: () => "\n",
    getSourceFile: (fileName, languageVersion) => {
      const normalized = posix.normalize(fileName);
      const source = sourceText.get(normalized);
      if (source !== undefined) {
        const impliedNodeFormat = impliedNodeFormatFor(normalized);
        const target = typeof languageVersion === "number"
          ? languageVersion
          : languageVersion.languageVersion;
        return ts.createSourceFile(
          normalized,
          source,
          impliedNodeFormat === undefined
            ? target
            : { languageVersion: target, impliedNodeFormat },
          true,
          ts.ScriptKind.TS,
        );
      }
      return isInsideAny(normalized, compilerDependencyRoots)
        ? standardHost.getSourceFile(normalized, languageVersion)
        : undefined;
    },
    readFile: (fileName) =>
      sourceText.get(posix.normalize(fileName)) ??
      (
        isInsideAny(fileName, compilerDependencyRoots)
          ? standardHost.readFile(fileName)
          : undefined
      ),
    realpath: (fileName) =>
      isInsideAny(fileName, compilerDependencyRoots)
        ? standardHost.realpath?.(fileName) ?? posix.normalize(fileName)
        : posix.normalize(fileName),
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined,
  };
}

function productDeclarationFormat(
  ts: typeof TypeScript,
  packageType: NativePackageType,
  fileName: string,
): TypeScript.ResolutionMode {
  if (/\.d\.mts$/u.test(fileName)) return ts.ModuleKind.ESNext;
  if (/\.d\.cts$/u.test(fileName)) return ts.ModuleKind.CommonJS;
  return packageType === "module"
    ? ts.ModuleKind.ESNext
    : ts.ModuleKind.CommonJS;
}

function physicalRelation(
  basis: Omit<
    PhysicalDeclarationRelation,
    "physicalRelationRef" | "physicalRelationDigest"
  >,
): PhysicalDeclarationRelation {
  const physicalRelationDigest = sha256Canonical(
    basis as unknown as JsonValue,
  );
  const physicalRelationRef =
    `ts-relation://${physicalRelationDigest.slice("sha256:".length)}`;
  return {
    physicalRelationRef,
    physicalRelationDigest,
    ...basis,
  };
}

function externalRelations(
  ts: typeof TypeScript,
  sourceFile: TypeScript.SourceFile,
  packageName: string,
  packageExportPath: string,
  declarationPath: string,
  declarationDigest: Sha256Digest,
  sourceProductContentDigest: Sha256Digest,
): Readonly<{
  relations: readonly PhysicalDeclarationRelation[];
  augmentations: readonly NativeModuleAugmentation[];
  contributesGlobals: boolean;
}> {
  const relations: PhysicalDeclarationRelation[] = [];
  const augmentations: NativeModuleAugmentation[] = [];
  const add = (
    moduleSpecifier: TypeScript.StringLiteralLike,
    origin: ExternalRelationOrigin,
    selection: ExternalSelection,
  ): void => {
    const specifier = moduleSpecifier.text;
    if (
      isPlatformSpecifier(specifier) ||
      selfPackageExportPath(packageName, specifier) !== null ||
      packageImportCoordinate(specifier) === null
    ) {
      return;
    }
    relations.push(physicalRelation({
      sourceProductContentDigest,
      declarationPath,
      declarationDigest,
      sourceStart: moduleSpecifier.getStart(sourceFile),
      sourceEnd: moduleSpecifier.getEnd(),
      moduleSpecifier: specifier,
      origin,
      selection,
    }));
  };
  const visit = (node: TypeScript.Node): void => {
    if (
      ts.isModuleDeclaration(node) &&
      ts.isStringLiteralLike(node.name)
    ) {
      augmentations.push({
        packageExportPath,
        declarationPath,
        sourceOffset: node.name.getStart(sourceFile),
        sourceEnd: node.name.getEnd(),
        moduleSpecifier: node.name.text,
      });
    }
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      const clause = node.importClause;
      if (clause === undefined) {
        add(node.moduleSpecifier, {
          kind: "import_declaration",
          clause: "side_effect",
          declarationTypeOnly: false,
          specifierTypeOnly: false,
        }, { kind: "module" });
      } else {
        if (clause.name !== undefined) {
          add(node.moduleSpecifier, {
            kind: "import_declaration",
            clause: "default",
            declarationTypeOnly: clause.isTypeOnly,
            specifierTypeOnly: false,
          }, {
            kind: "name",
            targetName: "default",
            exposedName: clause.name.text,
          });
        }
        const bindings = clause.namedBindings;
        if (bindings !== undefined && ts.isNamespaceImport(bindings)) {
          add(node.moduleSpecifier, {
            kind: "import_declaration",
            clause: "namespace",
            declarationTypeOnly: clause.isTypeOnly,
            specifierTypeOnly: false,
          }, {
            kind: "namespace",
            exposedName: bindings.name.text,
          });
        } else if (bindings !== undefined) {
          for (const element of bindings.elements) {
            add(
              node.moduleSpecifier,
              {
                kind: "import_declaration",
                clause: "named",
                declarationTypeOnly: clause.isTypeOnly,
                specifierTypeOnly: element.isTypeOnly,
              },
              {
                kind: "name",
                targetName: (element.propertyName ?? element.name).text,
                exposedName: element.name.text,
              },
            );
          }
        }
      }
      return;
    }
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      if (node.exportClause === undefined) {
        add(node.moduleSpecifier, {
          kind: "export_declaration",
          clause: "star",
          declarationTypeOnly: node.isTypeOnly,
          specifierTypeOnly: false,
        }, { kind: "all" });
      } else if (ts.isNamespaceExport(node.exportClause)) {
        add(
          node.moduleSpecifier,
          {
            kind: "export_declaration",
            clause: "namespace",
            declarationTypeOnly: node.isTypeOnly,
            specifierTypeOnly: false,
          },
          {
            kind: "namespace",
            exposedName: node.exportClause.name.text,
          },
        );
      } else {
        for (const element of node.exportClause.elements) {
          add(
            node.moduleSpecifier,
            {
              kind: "export_declaration",
              clause: "named",
              declarationTypeOnly: node.isTypeOnly,
              specifierTypeOnly: element.isTypeOnly,
            },
            {
              kind: "name",
              targetName: (element.propertyName ?? element.name).text,
              exposedName: element.name.text,
            },
          );
        }
      }
      return;
    }
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression !== undefined &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      add(
        node.moduleReference.expression,
        { kind: "import_equals_declaration" },
        { kind: "namespace", exposedName: node.name.text },
      );
      return;
    }
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      let selectedName: string | null = null;
      if (node.qualifier !== undefined) {
        let qualifier: TypeScript.EntityName = node.qualifier;
        while (ts.isQualifiedName(qualifier)) qualifier = qualifier.left;
        selectedName = qualifier.text;
      }
      add(
        node.argument.literal,
        {
          kind: "import_type_expression",
          operator: node.isTypeOf ? "typeof" : "type",
        },
        selectedName === null
          ? { kind: "module" }
          : {
            kind: "name",
            targetName: selectedName,
            exposedName: selectedName,
          },
      );
      return;
    }
    node.forEachChild(visit);
  };
  sourceFile.forEachChild(visit);
  const preprocessed = ts.preProcessFile(sourceFile.text, true, true);
  for (const directive of preprocessed.typeReferenceDirectives) {
    if (
      directive.fileName !== "node" &&
      packageImportCoordinate(directive.fileName) !== null &&
      selfPackageExportPath(packageName, directive.fileName) === null
    ) {
      relations.push(physicalRelation({
        sourceProductContentDigest,
        declarationPath,
        declarationDigest,
        sourceStart: directive.pos,
        sourceEnd: directive.end,
        moduleSpecifier: directive.fileName,
        origin: { kind: "type_reference_directive" },
        selection: { kind: "module" },
      }));
    }
  }
  const contributesGlobals =
    !ts.isExternalModule(sourceFile) ||
    sourceFile.statements.some(
      (statement) =>
        ts.isNamespaceExportDeclaration(statement) ||
        (
          ts.isModuleDeclaration(statement) &&
          (
            (statement.flags & ts.NodeFlags.GlobalAugmentation) !== 0 ||
            (
              ts.isIdentifier(statement.name) &&
              statement.name.text === "global"
            )
          )
        ),
    );
  relations.sort((left, right) =>
    compareStructuredFields(
      [
        left.declarationPath,
        left.sourceStart,
        left.sourceEnd,
        left.physicalRelationRef,
      ],
      [
        right.declarationPath,
        right.sourceStart,
        right.sourceEnd,
        right.physicalRelationRef,
      ],
    )
  );
  augmentations.sort((left, right) =>
    compareStructuredFields(
      [left.declarationPath, left.sourceOffset],
      [right.declarationPath, right.sourceOffset],
    )
  );
  return { relations, augmentations, contributesGlobals };
}

function ancestorOfKind<T extends TypeScript.Node>(
  node: TypeScript.Node,
  predicate: (candidate: TypeScript.Node) => candidate is T,
): T | null {
  let candidate: TypeScript.Node | undefined = node;
  while (candidate !== undefined) {
    if (predicate(candidate)) return candidate;
    candidate = candidate.parent;
  }
  return null;
}

function physicalRelationRefsForNode(
  ts: typeof TypeScript,
  node: TypeScript.Node,
  declarationPath: string,
  relations: readonly PhysicalDeclarationRelation[],
): readonly string[] {
  let moduleSpecifier: TypeScript.StringLiteralLike | null = null;
  let selectionKind: ExternalSelection["kind"] | null = null;
  let exposedName: string | null = null;

  if (ts.isImportSpecifier(node)) {
    const declaration = ancestorOfKind(node, ts.isImportDeclaration);
    if (
      declaration !== null &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectionKind = "name";
      exposedName = node.name.text;
    }
  } else if (ts.isNamespaceImport(node)) {
    const declaration = ancestorOfKind(node, ts.isImportDeclaration);
    if (
      declaration !== null &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectionKind = "namespace";
      exposedName = node.name.text;
    }
  } else if (ts.isImportClause(node) && node.name !== undefined) {
    const declaration = ancestorOfKind(node, ts.isImportDeclaration);
    if (
      declaration !== null &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectionKind = "name";
      exposedName = node.name.text;
    }
  } else if (ts.isExportSpecifier(node)) {
    const declaration = ancestorOfKind(node, ts.isExportDeclaration);
    if (
      declaration !== null &&
      declaration.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectionKind = "name";
      exposedName = node.name.text;
    }
  } else if (ts.isNamespaceExport(node)) {
    const declaration = ancestorOfKind(node, ts.isExportDeclaration);
    if (
      declaration !== null &&
      declaration.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectionKind = "namespace";
      exposedName = node.name.text;
    }
  } else if (ts.isImportEqualsDeclaration(node)) {
    if (
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression !== undefined &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      moduleSpecifier = node.moduleReference.expression;
      selectionKind = "namespace";
      exposedName = node.name.text;
    }
  } else if (
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteralLike(node.argument.literal)
  ) {
    moduleSpecifier = node.argument.literal;
    selectionKind = node.qualifier === undefined ? "module" : "name";
    if (node.qualifier !== undefined) {
      let qualifier: TypeScript.EntityName = node.qualifier;
      while (ts.isQualifiedName(qualifier)) qualifier = qualifier.left;
      exposedName = qualifier.text;
    }
  }

  if (moduleSpecifier === null || selectionKind === null) return [];
  const sourceStart = moduleSpecifier.getStart(moduleSpecifier.getSourceFile());
  const sourceEnd = moduleSpecifier.getEnd();
  return relations
    .filter(
      (candidate) =>
        candidate.declarationPath === declarationPath &&
        candidate.sourceStart === sourceStart &&
        candidate.sourceEnd === sourceEnd &&
        candidate.moduleSpecifier === moduleSpecifier.text &&
        candidate.selection.kind === selectionKind &&
        (
          exposedName === null ||
          (
            (candidate.selection.kind === "name" ||
              candidate.selection.kind === "namespace") &&
            candidate.selection.exposedName === exposedName
          )
        ),
    )
    .map((candidate) => candidate.physicalRelationRef);
}

function exportedSymbolPhysicalRelationRefs(
  ts: typeof TypeScript,
  checker: TypeScript.TypeChecker,
  moduleSymbol: TypeScript.Symbol | undefined,
  reachable: ReadonlySet<string>,
  relativePaths: ReadonlyMap<string, string>,
  relations: readonly PhysicalDeclarationRelation[],
): Readonly<Record<string, readonly string[]>> {
  if (moduleSymbol === undefined) return {};
  const relationByDeclarationPath = new Map<
    string,
    PhysicalDeclarationRelation[]
  >();
  for (const relation of relations) {
    const existing = relationByDeclarationPath.get(relation.declarationPath);
    if (existing === undefined) {
      relationByDeclarationPath.set(relation.declarationPath, [relation]);
    } else {
      existing.push(relation);
    }
  }
  const result: Record<string, readonly string[]> = {};
  for (const exportedSymbol of checker.getExportsOfModule(moduleSymbol)) {
    const refs = new Set<string>();
    const pending: TypeScript.Symbol[] = [exportedSymbol];
    const visited = new Set<TypeScript.Symbol>();
    while (pending.length > 0) {
      const symbol = pending.pop()!;
      if (visited.has(symbol)) continue;
      visited.add(symbol);
      if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        const target = checker.getAliasedSymbol(symbol);
        if (target !== symbol) pending.push(target);
      }
      for (const declaration of symbol.declarations ?? []) {
        const sourcePath = posix.normalize(
          declaration.getSourceFile().fileName,
        );
        if (!reachable.has(sourcePath)) continue;
        const declarationPath = relativePaths.get(sourcePath);
        if (declarationPath === undefined) continue;
        const sourceRelations =
          relationByDeclarationPath.get(declarationPath) ?? [];
        for (const relation of sourceRelations) {
          if (
            relation.selection.kind === "all" &&
            ancestorOfKind(
              nodeAtPosition(
                declaration.getSourceFile(),
                relation.sourceStart,
              ),
              (candidate): candidate is TypeScript.ImportDeclaration |
                TypeScript.ExportDeclaration |
                TypeScript.ImportTypeNode =>
                ts.isImportDeclaration(candidate) ||
                ts.isExportDeclaration(candidate) ||
                ts.isImportTypeNode(candidate),
            ) === null
          ) {
            refs.add(relation.physicalRelationRef);
          }
        }
        const visit = (node: TypeScript.Node): void => {
          for (
            const physicalRelationRef of physicalRelationRefsForNode(
              ts,
              node,
              declarationPath,
              sourceRelations,
            )
          ) {
            refs.add(physicalRelationRef);
          }
          if (ts.isIdentifier(node)) {
            const referenced = checker.getSymbolAtLocation(node);
            if (
              referenced !== undefined &&
              referenced !== symbol &&
              (referenced.declarations ?? []).some((candidate) =>
                reachable.has(
                  posix.normalize(candidate.getSourceFile().fileName),
                )
              )
            ) {
              pending.push(referenced);
            }
          }
          node.forEachChild(visit);
        };
        visit(declaration);
      }
    }
    result[exportedSymbol.getName()] = [...refs].sort(compareText);
  }
  return result;
}

export async function resolveNativeDeclarationClosures(
  request: NativeDeclarationClosureRequest,
): Promise<readonly NativeDeclarationClosure[] | null> {
  if (
    !isNonblank(request.packageName) ||
    !isSha256Digest(request.sourceProductContentDigest)
  ) {
    return null;
  }
  const roots = nativeDeclarationRoots(request.packageExports);
  if (roots === null) return null;
  const sourceProductContentDigest = request.sourceProductContentDigest;

  const sourceText = new Map<string, string>();
  const sourceBytes = new Map<string, Uint8Array>();
  const relativePaths = new Map<string, string>();
  for (const source of request.declarationSources) {
    const virtualPath = virtualDeclarationPath(
      VIRTUAL_PACKAGE_ROOT,
      source.path,
    );
    if (virtualPath === null || sourceText.has(virtualPath)) return null;
    sourceText.set(virtualPath, new TextDecoder().decode(source.bytes));
    sourceBytes.set(virtualPath, source.bytes);
    relativePaths.set(virtualPath, posix.normalize(source.path));
  }
  const rootVirtualPaths = new Map(
    roots.map((root) => [
      root.packageExportPath,
      virtualDeclarationPath(VIRTUAL_PACKAGE_ROOT, root.declarationPath),
    ]),
  );
  if (
    [...rootVirtualPaths.values()].some(
      (path) => path === null || !sourceText.has(path),
    )
  ) {
    return null;
  }

  const ts = loadTypeScript();
  const basis = compilerBasis(ts);
  const externalTypeDirectiveStubs = new Map<string, string>();
  for (const source of sourceText.values()) {
    const preprocessed = ts.preProcessFile(source, true, true);
    for (const directive of preprocessed.typeReferenceDirectives) {
      if (
        directive.fileName !== "node" &&
        packageImportCoordinate(directive.fileName) !== null &&
        selfPackageExportPath(request.packageName, directive.fileName) === null
      ) {
        externalTypeDirectiveStubs.set(
          directive.fileName,
          posix.join(
            VIRTUAL_PACKAGE_ROOT,
            "__pending_types__",
            `${sha256Canonical(directive.fileName).slice("sha256:".length)}.d.ts`,
          ),
        );
      }
    }
  }
  const compilerSourceText = new Map(sourceText);
  for (const path of externalTypeDirectiveStubs.values()) {
    compilerSourceText.set(path, "export {};\n");
  }
  const standardHost = createClosedHost(
    ts,
    basis,
    compilerSourceText,
    (fileName) =>
      sourceText.has(fileName)
        ? productDeclarationFormat(ts, request.packageType, fileName)
        : undefined,
  );
  const host: TypeScript.CompilerHost = {
    ...standardHost,
    resolveModuleNames: (moduleNames, containingFile) =>
      moduleNames.map((specifier) => {
        if (
          isInsideAny(containingFile, basis.compilerDependencyRoots)
        ) {
          return ts.resolveModuleName(
            specifier,
            containingFile,
            basis.options,
            standardHost,
          ).resolvedModule;
        }
        const selfExport = selfPackageExportPath(
          request.packageName,
          specifier,
        );
        if (selfExport !== null) {
          const resolvedFileName = rootVirtualPaths.get(selfExport);
          return resolvedFileName === null || resolvedFileName === undefined
            ? undefined
            : {
              resolvedFileName,
              extension: ts.Extension.Dts,
              isExternalLibraryImport: false,
            };
        }
        if (packageImportCoordinate(specifier) !== null) return undefined;
        return ts.resolveModuleName(
          specifier,
          containingFile,
          basis.options,
          standardHost,
        ).resolvedModule;
      }),
    resolveTypeReferenceDirectives: (typeDirectiveNames, containingFile) =>
      typeDirectiveNames.map((directive) => {
        const specifier = typeDirectiveName(directive);
        if (specifier === "node") {
          return ts.resolveTypeReferenceDirective(
            specifier,
            containingFile,
            basis.options,
            standardHost,
          ).resolvedTypeReferenceDirective;
        }
        const selfExport = selfPackageExportPath(
          request.packageName,
          specifier,
        );
        if (selfExport !== null) {
          const resolvedFileName = rootVirtualPaths.get(selfExport);
          return resolvedFileName === null || resolvedFileName === undefined
            ? undefined
            : {
              resolvedFileName,
              primary: true,
              isExternalLibraryImport: false,
            };
        }
        const pendingPath = externalTypeDirectiveStubs.get(specifier);
        if (pendingPath !== undefined) {
          return {
            resolvedFileName: pendingPath,
            primary: true,
            isExternalLibraryImport: true,
          };
        }
        return packageImportCoordinate(specifier) === null
          ? ts.resolveTypeReferenceDirective(
            specifier,
            containingFile,
            basis.options,
            standardHost,
          ).resolvedTypeReferenceDirective
          : undefined;
      }),
  };
  const externalSpecifiers = new Set<string>();
  for (const source of sourceText.values()) {
    const preprocessed = ts.preProcessFile(source, true, true);
    for (const imported of preprocessed.importedFiles) {
      if (
        packageImportCoordinate(imported.fileName) !== null &&
        selfPackageExportPath(request.packageName, imported.fileName) === null
      ) {
        externalSpecifiers.add(imported.fileName);
      }
    }
    for (const directive of preprocessed.typeReferenceDirectives) {
      if (
        directive.fileName !== "node" &&
        packageImportCoordinate(directive.fileName) !== null &&
        selfPackageExportPath(request.packageName, directive.fileName) === null
      ) {
        externalSpecifiers.add(directive.fileName);
      }
    }
    const sourceFile = ts.createSourceFile(
      "external-scan.d.ts",
      source,
      ts.ScriptTarget.ES2022,
      true,
      ts.ScriptKind.TS,
    );
    const visit = (node: TypeScript.Node): void => {
      if (
        ts.isModuleDeclaration(node) &&
        ts.isStringLiteralLike(node.name) &&
        packageImportCoordinate(node.name.text) !== null &&
        selfPackageExportPath(request.packageName, node.name.text) === null
      ) {
        externalSpecifiers.add(node.name.text);
      }
      node.forEachChild(visit);
    };
    sourceFile.forEachChild(visit);
  }
  const program = ts.createProgram({
    rootNames: [...rootVirtualPaths.values()] as string[],
    options: basis.options,
    host,
  });
  const diagnostics = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics().filter((diagnostic) => {
      const specifier = diagnosticModuleSpecifier(ts, diagnostic);
      return !(
        (diagnostic.code === 2307 ||
          diagnostic.code === 2664 ||
          diagnostic.code === 2792) &&
        specifier !== null &&
        externalSpecifiers.has(specifier)
      );
    }),
  ];
  if (diagnostics.length > 0) return null;

  const checker = program.getTypeChecker();
  const closures: NativeDeclarationClosure[] = [];
  for (const root of roots) {
    const rootVirtualPath = rootVirtualPaths.get(root.packageExportPath);
    if (rootVirtualPath === null || rootVirtualPath === undefined) return null;
    const rootSource = program.getSourceFile(rootVirtualPath);
    if (rootSource === undefined) return null;
    const moduleSymbol = checker.getSymbolAtLocation(rootSource);
    const reachable = new Set<string>();
    const pending = [rootVirtualPath];
    while (pending.length > 0) {
      const sourcePath = pending.pop()!;
      if (reachable.has(sourcePath)) continue;
      const source = sourceText.get(sourcePath);
      if (source === undefined) return null;
      reachable.add(sourcePath);
      const preprocessed = ts.preProcessFile(source, true, true);
      for (const imported of preprocessed.importedFiles) {
        const specifier = imported.fileName;
        if (isPlatformSpecifier(specifier)) continue;
        const selfExportPath = selfPackageExportPath(
          request.packageName,
          specifier,
        );
        if (selfExportPath !== null) {
          const selfRoot = rootVirtualPaths.get(selfExportPath);
          if (selfRoot === null || selfRoot === undefined) return null;
          pending.push(selfRoot);
          continue;
        }
        if (packageImportCoordinate(specifier) !== null) continue;
        if (!specifier.startsWith(".")) return null;
        const resolved = ts.resolveModuleName(
          specifier,
          sourcePath,
          basis.options,
          host,
        ).resolvedModule;
        if (resolved === undefined) return null;
        const resolvedPath = posix.normalize(resolved.resolvedFileName);
        if (!sourceText.has(resolvedPath)) return null;
        pending.push(resolvedPath);
      }
      for (const reference of preprocessed.referencedFiles) {
        const referencedPath = posix.normalize(
          posix.resolve(posix.dirname(sourcePath), reference.fileName),
        );
        if (!sourceText.has(referencedPath)) return null;
        pending.push(referencedPath);
      }
      for (const directive of preprocessed.typeReferenceDirectives) {
        if (directive.fileName === "node") continue;
        const selfExportPath = selfPackageExportPath(
          request.packageName,
          directive.fileName,
        );
        if (selfExportPath !== null) {
          const selfRoot = rootVirtualPaths.get(selfExportPath);
          if (selfRoot === null || selfRoot === undefined) return null;
          pending.push(selfRoot);
          continue;
        }
        if (packageImportCoordinate(directive.fileName) === null) return null;
      }
    }
    const declarationInventory =
      [...reachable].map((virtualPath) => {
        const declarationPath = relativePaths.get(virtualPath);
        const bytes = sourceBytes.get(virtualPath);
        if (declarationPath === undefined || bytes === undefined) return null;
        return {
          packageExportPath: root.packageExportPath,
          declarationPath,
          declarationDigest: sha256Bytes(bytes),
        };
      }).sort((left, right) =>
        compareText(
          left?.declarationPath ?? "",
          right?.declarationPath ?? "",
        )
      );
    if (declarationInventory.some((entry) => entry === null)) return null;

    const physicalRelations: PhysicalDeclarationRelation[] = [];
    const augmentations: NativeModuleAugmentation[] = [];
    let contributesGlobals = false;
    for (const virtualPath of reachable) {
      const sourceFile = program.getSourceFile(virtualPath);
      const declarationPath = relativePaths.get(virtualPath);
      const bytes = sourceBytes.get(virtualPath);
      if (
        sourceFile === undefined ||
        declarationPath === undefined ||
        bytes === undefined
      ) {
        return null;
      }
      const relations = externalRelations(
        ts,
        sourceFile,
        request.packageName,
        root.packageExportPath,
        declarationPath,
        sha256Bytes(bytes),
        sourceProductContentDigest,
      );
      physicalRelations.push(...relations.relations);
      augmentations.push(...relations.augmentations);
      contributesGlobals ||= relations.contributesGlobals;
    }
    physicalRelations.sort((left, right) =>
      compareText(left.physicalRelationRef, right.physicalRelationRef)
    );
    augmentations.sort((left, right) =>
      compareStructuredFields(
        [left.declarationPath, left.sourceOffset],
        [right.declarationPath, right.sourceOffset],
      )
    );
    const exportedSymbols = moduleSymbol === undefined
      ? []
      : checker.getExportsOfModule(moduleSymbol)
          .map((symbol) => symbol.getName())
          .sort();
    closures.push({
      packageExportPath: root.packageExportPath,
      declarationPath: root.declarationPath,
      exportedSymbols,
      exportedSymbolPhysicalRelationRefs:
        exportedSymbolPhysicalRelationRefs(
        ts,
        checker,
        moduleSymbol,
        reachable,
        relativePaths,
        physicalRelations,
      ),
      declarationInventory:
        declarationInventory as ProductNativeDeclarationInventoryRow[],
      physicalRelations,
      moduleAugmentations: augmentations,
      contributesGlobals,
    });
  }
  return closures;
}

export function contractIndexedPendingSelectors(
  productContentDigest: Sha256Digest,
  contract: ProductPublicContract,
  closure: NativeDeclarationClosure,
): readonly ContractIndexedPendingExternalSelector[] | null {
  const locator = contract.nativeTypedLocator;
  if (
    !isSha256Digest(productContentDigest) ||
    !isSha256Digest(contract.contractDigest) ||
    locator === undefined ||
    locator.packageExportPath !== closure.packageExportPath
  ) {
    return null;
  }
  const physicalByRef = new Map(
    closure.physicalRelations.map((relation) => [
      relation.physicalRelationRef,
      relation,
    ]),
  );
  if (physicalByRef.size !== closure.physicalRelations.length) return null;
  const checkerDerivedRefs =
    closure.exportedSymbolPhysicalRelationRefs[locator.namedSymbol];
  const relationRefs = checkerDerivedRefs ??
    closure.physicalRelations
      .filter((relation) =>
        relation.selection.kind === "all" ||
        (
          relation.selection.kind === "name" &&
          relation.selection.exposedName === locator.namedSymbol
        )
      )
      .map((relation) => relation.physicalRelationRef);

  const selectors: ContractIndexedPendingExternalSelector[] = [];
  for (
    const physicalRelationRef of
      [...new Set(relationRefs)].sort(compareText)
  ) {
    const relation = physicalByRef.get(physicalRelationRef);
    if (
      relation === undefined ||
      relation.sourceProductContentDigest !== productContentDigest
    ) {
      return null;
    }
    const coordinate = packageImportCoordinate(relation.moduleSpecifier);
    if (coordinate === null) return null;
    const body = {
      sourceProductContentDigest: productContentDigest,
      sourceContractRef: contract.contractId,
      sourceContractDigest: contract.contractDigest,
      sourcePackageExportPath: locator.packageExportPath,
      sourceNamedSymbol: locator.namedSymbol,
      physicalRelationRef,
      externalPackageName: coordinate.packageName,
      externalModuleSpecifier: relation.moduleSpecifier,
      origin: relation.origin,
      selection: relation.selection,
      localAccessPath: [locator.namedSymbol],
    } as const;
    selectors.push({
      selectorRef: sha256Canonical(body as unknown as JsonValue),
      ...body,
    });
  }
  return selectors;
}

function linkedRefusal(
  code:
    | "ambiguous_dependency"
    | "incompatible_dependency"
    | "unresolved_dependency",
  message: string,
): NativeContractLinkResult {
  return { kind: "refused", code, message };
}

function contractRoot(
  product: NativeLinkProduct,
  packageExportPath: string,
): NativeDeclarationClosure | null {
  const matches = product.evidence.closures.filter(
    (closure) => closure.packageExportPath === packageExportPath,
  );
  return matches.length === 1 ? matches[0]! : null;
}

export function linkNativeContractSet(
  products: readonly NativeLinkProduct[],
  toolchainProductContentDigest: Sha256Digest,
): NativeContractLinkResult {
  if (
    installedToolchainProductContentDigest() !==
      toolchainProductContentDigest
  ) {
    return linkedRefusal(
      "incompatible_dependency",
      "selected ABIogenesis Product does not match the installed compiler basis",
    );
  }
  const ts = loadTypeScript();
  const basis = compilerBasis(ts);
  const sourceText = new Map<string, string>();
  const sourceOwner = new Map<string, NativeLinkProduct>();
  const sourcePath = new Map<string, string>();
  const rootPath = new Map<string, string>();

  products.forEach((product, index) => {
    const root = `/products/${index.toString().padStart(6, "0")}`;
    for (const source of product.evidence.sources) {
      const virtualPath = virtualDeclarationPath(root, source.declarationPath);
      if (virtualPath === null || sourceText.has(virtualPath)) continue;
      sourceText.set(virtualPath, source.sourceText);
      sourceOwner.set(virtualPath, product);
      sourcePath.set(
        structuredKey([product.productId, source.declarationPath]),
        virtualPath,
      );
    }
    for (const closure of product.evidence.closures) {
      const virtualPath = virtualDeclarationPath(
        root,
        closure.declarationPath,
      );
      if (virtualPath !== null) {
        rootPath.set(
          structuredKey([product.productId, closure.packageExportPath]),
          virtualPath,
        );
      }
    }
  });

  const directTarget = (
    source: NativeLinkProduct,
    packageName: string,
  ):
    | Readonly<{
      dependency: ProductDeclaredDependency;
      target: NativeLinkProduct;
    }>
    | NativeContractLinkResult => {
    const matches = source.declaredDependencies.flatMap((dependency) =>
      products
        .filter(
          (candidate) =>
            candidate.productId === dependency.productId &&
            candidate.packageName === packageName,
        )
        .map((target) => ({ dependency, target }))
    );
    if (matches.length === 0) {
      return linkedRefusal(
        "unresolved_dependency",
        `${source.productId} has no direct dependency for ${packageName}`,
      );
    }
    if (matches.length > 1) {
      return linkedRefusal(
        "ambiguous_dependency",
        `${source.productId} has ambiguous direct dependencies for ${packageName}`,
      );
    }
    return matches[0]!;
  };

  for (const product of products) {
    if (
      products.length > 1 &&
      product.evidence.closures.some(
        (closure) => closure.contributesGlobals,
      )
    ) {
      return linkedRefusal(
        "incompatible_dependency",
        `${product.productId} contributes Product-owned global declarations in a multi-Product closure`,
      );
    }
    for (const closure of product.evidence.closures) {
      const physicalRelationRefs = new Set(
        closure.physicalRelations.map(
          (relation) => relation.physicalRelationRef,
        ),
      );
      if (
        closure.physicalRelations.some(
          (relation) =>
            relation.origin.kind === "import_declaration" &&
            relation.origin.clause === "side_effect",
        )
      ) {
        return linkedRefusal(
          "incompatible_dependency",
          `${product.productId} reaches an external side-effect-only declaration import`,
        );
      }
      if (physicalRelationRefs.size !== closure.physicalRelations.length) {
        return linkedRefusal(
          "incompatible_dependency",
          `${product.productId} contains duplicate physical declaration relation identity`,
        );
      }
      for (
        const contract of product.evidence.contracts.filter(
          (candidate) =>
            candidate.packageExportPath === closure.packageExportPath,
        )
      ) {
        const selectorRefs = contract.pendingSelectors.map(
          (selector) => selector.selectorRef,
        );
        if (
          new Set(selectorRefs).size !== selectorRefs.length ||
          contract.pendingSelectors.some(
            (selector) =>
              selector.sourceProductContentDigest !==
                product.productContentDigest ||
              selector.sourceContractRef !== contract.contractId ||
              selector.sourceContractDigest !== contract.contractDigest ||
              selector.sourcePackageExportPath !==
                contract.packageExportPath ||
              selector.sourceNamedSymbol !== contract.namedSymbol ||
              !physicalRelationRefs.has(selector.physicalRelationRef),
          ) ||
          (
            contract.localDisposition === "local" &&
            contract.pendingSelectors.length !== 0
          ) ||
          (
            contract.localDisposition === "pending_external" &&
            contract.pendingSelectors.length === 0
          )
        ) {
          return linkedRefusal(
            "incompatible_dependency",
            `${contract.contractId} has invalid local or pending selector evidence`,
          );
        }
        for (const selector of contract.pendingSelectors) {
          if (
            selector.origin.kind === "import_declaration" &&
            selector.origin.clause === "side_effect"
          ) {
            return linkedRefusal(
              "incompatible_dependency",
              `${contract.contractId} reaches an external side-effect-only declaration import`,
            );
          }
          const coordinate = packageImportCoordinate(
            selector.externalModuleSpecifier,
          );
          if (
            coordinate === null ||
            coordinate.packageName !== selector.externalPackageName
          ) {
            return linkedRefusal(
              "incompatible_dependency",
              `external declaration coordinate ${selector.externalModuleSpecifier} is invalid`,
            );
          }
          const selected = directTarget(product, coordinate.packageName);
          if ("kind" in selected) return selected;
          if (
            contractRoot(selected.target, coordinate.packageExportPath) ===
              null
          ) {
            return linkedRefusal(
              "unresolved_dependency",
              `${selector.externalModuleSpecifier} has no exact target declaration root`,
            );
          }
        }
      }
      for (const augmentation of closure.moduleAugmentations) {
        const target = augmentation.moduleSpecifier;
        if (isPlatformSpecifier(target)) {
          return linkedRefusal(
            "incompatible_dependency",
            `${product.productId} augments the platform declaration basis`,
          );
        }
        const self = selfPackageExportPath(product.packageName, target);
        if (
          self === null &&
          !target.startsWith(".") &&
          packageImportCoordinate(target) !== null
        ) {
          return linkedRefusal(
            "incompatible_dependency",
            `${product.productId} augments another Product declaration`,
          );
        }
      }
    }
  }

  const standardHost = createClosedHost(
    ts,
    basis,
    sourceText,
    (fileName) => {
      const owner = sourceOwner.get(posix.normalize(fileName));
      return owner === undefined
        ? undefined
        : productDeclarationFormat(
          ts,
          owner.evidence.packageType,
          fileName,
        );
    },
  );
  const host: TypeScript.CompilerHost = {
    ...standardHost,
    getCurrentDirectory: () => "/products",
    resolveModuleNames: (moduleNames, containingFile) =>
      moduleNames.map((specifier) => {
        const normalizedContaining = posix.normalize(containingFile);
        const owner = sourceOwner.get(normalizedContaining);
        if (owner === undefined) {
          return ts.resolveModuleName(
            specifier,
            containingFile,
            basis.options,
            standardHost,
          ).resolvedModule;
        }
        const selfExport = selfPackageExportPath(owner.packageName, specifier);
        if (selfExport !== null) {
          const resolvedFileName = rootPath.get(
            structuredKey([owner.productId, selfExport]),
          );
          return resolvedFileName === undefined
            ? undefined
            : {
              resolvedFileName,
              extension: ts.Extension.Dts,
              isExternalLibraryImport: false,
            };
        }
        const coordinate = packageImportCoordinate(specifier);
        if (coordinate !== null) {
          const selected = directTarget(owner, coordinate.packageName);
          if ("kind" in selected) return undefined;
          const resolvedFileName = rootPath.get(
            structuredKey([
              selected.target.productId,
              coordinate.packageExportPath,
            ]),
          );
          return resolvedFileName === undefined
            ? undefined
            : {
              resolvedFileName,
              extension: ts.Extension.Dts,
              isExternalLibraryImport: true,
            };
        }
        return ts.resolveModuleName(
          specifier,
          containingFile,
          basis.options,
          standardHost,
        ).resolvedModule;
      }),
    resolveTypeReferenceDirectives: (typeDirectiveNames, containingFile) =>
      typeDirectiveNames.map((directive) => {
        const specifier = typeDirectiveName(directive);
        const normalizedContaining = posix.normalize(containingFile);
        const owner = sourceOwner.get(normalizedContaining);
        if (owner === undefined || specifier === "node") {
          return ts.resolveTypeReferenceDirective(
            specifier,
            containingFile,
            basis.options,
            standardHost,
          ).resolvedTypeReferenceDirective;
        }
        const selfExport = selfPackageExportPath(owner.packageName, specifier);
        if (selfExport !== null) {
          const resolvedFileName = rootPath.get(
            structuredKey([owner.productId, selfExport]),
          );
          return resolvedFileName === undefined
            ? undefined
            : {
              resolvedFileName,
              primary: true,
              isExternalLibraryImport: false,
            };
        }
        const coordinate = packageImportCoordinate(specifier);
        if (coordinate !== null) {
          const selected = directTarget(owner, coordinate.packageName);
          if ("kind" in selected) return undefined;
          const resolvedFileName = rootPath.get(
            structuredKey([
              selected.target.productId,
              coordinate.packageExportPath,
            ]),
          );
          return resolvedFileName === undefined
            ? undefined
            : {
              resolvedFileName,
              primary: true,
              isExternalLibraryImport: true,
            };
        }
        return ts.resolveTypeReferenceDirective(
          specifier,
          containingFile,
          basis.options,
          standardHost,
        ).resolvedTypeReferenceDirective;
      }),
  };
  const selectorPhysicalRelationRefs = new Set(
    products.flatMap((product) =>
      product.evidence.contracts.flatMap((contract) =>
        contract.pendingSelectors.map(
          (selector) => selector.physicalRelationRef,
        )
      )
    ),
  );
  const physicalRelationsBySource = new Map<
    string,
    PhysicalDeclarationRelation[]
  >();
  for (const product of products) {
    for (const closure of product.evidence.closures) {
      for (const relation of closure.physicalRelations) {
        const path = sourcePath.get(
          structuredKey([product.productId, relation.declarationPath]),
        );
        if (path === undefined) continue;
        const relations = physicalRelationsBySource.get(path) ?? [];
        relations.push(relation);
        physicalRelationsBySource.set(path, relations);
      }
    }
  }
  const isZeroOwnerPhysicalRelationDiagnostic = (
    diagnostic: TypeScript.Diagnostic,
  ): boolean => {
    if (
      diagnostic.file === undefined ||
      diagnostic.start === undefined
    ) {
      return false;
    }
    const specifierNode = diagnosticModuleSpecifierNode(ts, diagnostic);
    if (specifierNode === null) return false;
    const sourceStart = specifierNode.getStart(diagnostic.file);
    const sourceEnd = specifierNode.getEnd();
    const matches = (
      physicalRelationsBySource.get(
        posix.normalize(diagnostic.file.fileName),
      ) ?? []
    ).filter((relation) =>
      relation.moduleSpecifier === specifierNode.text &&
      relation.sourceStart === sourceStart &&
      relation.sourceEnd === sourceEnd
    );
    return matches.length > 0 && matches.every((relation) =>
      !selectorPhysicalRelationRefs.has(relation.physicalRelationRef)
    );
  };
  const program = ts.createProgram({
    rootNames: [...rootPath.values()].sort(),
    options: basis.options,
    host,
  });
  const diagnostics = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics().filter(
      (diagnostic) => !isZeroOwnerPhysicalRelationDiagnostic(diagnostic),
    ),
  ];
  if (diagnostics.length > 0) {
    const diagnostic = diagnostics[0]!;
    const location = diagnostic.file !== undefined && diagnostic.start !== undefined
      ? (() => {
          const position = diagnostic.file!.getLineAndCharacterOfPosition(
            diagnostic.start!,
          );
          return `${diagnostic.file!.fileName}:${position.line + 1}:${position.character + 1} `;
        })()
      : "";
    return linkedRefusal(
      "incompatible_dependency",
      `linked native declaration closure has ${location}TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      )}`,
    );
  }
  const checker = program.getTypeChecker();
  const exportSymbolsFor = (
    product: NativeLinkProduct,
    packageExportPath: string,
  ): ReadonlyMap<string, TypeScript.Symbol> | null => {
    const path = rootPath.get(
      structuredKey([product.productId, packageExportPath]),
    );
    if (path === undefined) return null;
    const source = program.getSourceFile(path);
    const symbol = source === undefined
      ? undefined
      : checker.getSymbolAtLocation(source);
    return symbol === undefined
      ? null
      : new Map(
        checker.getExportsOfModule(symbol)
          .map((candidate) => [candidate.getName(), candidate]),
      );
  };
  const unaliasedSymbol = (
    symbol: TypeScript.Symbol,
  ): TypeScript.Symbol => {
    let current = symbol;
    const visited = new Set<TypeScript.Symbol>();
    while (
      (current.flags & ts.SymbolFlags.Alias) !== 0 &&
      !visited.has(current)
    ) {
      visited.add(current);
      const target = checker.getAliasedSymbol(current);
      if (target === current) break;
      current = target;
    }
    return current;
  };
  const relationFor = (
    product: NativeLinkProduct,
    external: PhysicalDeclarationRelation,
  ): TypeScript.Node | null => {
    const path = sourcePath.get(
      structuredKey([product.productId, external.declarationPath]),
    );
    const source = path === undefined ? undefined : program.getSourceFile(path);
    if (source === undefined) return null;
    return ancestorOfKind(
      nodeAtPosition(source, external.sourceStart),
      (candidate): candidate is TypeScript.ImportDeclaration |
        TypeScript.ExportDeclaration |
        TypeScript.ImportEqualsDeclaration |
        TypeScript.ImportTypeNode =>
        ts.isImportDeclaration(candidate) ||
        ts.isExportDeclaration(candidate) ||
        ts.isImportEqualsDeclaration(candidate) ||
        ts.isImportTypeNode(candidate),
    );
  };
  const isTypeOnlyRelation = (
    relation: TypeScript.Node | null,
    external: PhysicalDeclarationRelation,
  ): boolean => {
    const exposedName = external.selection.kind === "name"
      ? external.selection.exposedName
      : null;
    if (relation === null) {
      if (external.origin.kind === "import_type_expression") {
        return external.origin.operator === "type";
      }
      if (
        external.origin.kind === "import_declaration" ||
        external.origin.kind === "export_declaration"
      ) {
        return external.origin.declarationTypeOnly ||
          external.origin.specifierTypeOnly;
      }
      return external.origin.kind === "type_reference_directive";
    }
    if (ts.isImportTypeNode(relation)) return !relation.isTypeOf;
    if (ts.isImportEqualsDeclaration(relation)) return false;
    if (ts.isImportDeclaration(relation)) {
      const clause = relation.importClause;
      if (clause?.isTypeOnly === true) return true;
      if (
        clause?.namedBindings !== undefined &&
        ts.isNamedImports(clause.namedBindings) &&
        exposedName !== null
      ) {
        return clause.namedBindings.elements.some(
          (element) =>
            element.name.text === exposedName &&
            element.isTypeOnly,
        );
      }
      return false;
    }
    if (!ts.isExportDeclaration(relation)) return false;
    if (relation.isTypeOnly) return true;
    return relation.exportClause !== undefined &&
        ts.isNamedExports(relation.exportClause) &&
        exposedName !== null
      ? relation.exportClause.elements.some(
        (element) =>
          element.name.text === exposedName &&
          element.isTypeOnly,
      )
      : false;
  };

  const sourceWitnessFor = (
    selector: ContractIndexedPendingExternalSelector,
    relation: PhysicalDeclarationRelation,
  ): CanonicalSourceWitness => {
    const body = {
      selectorRef: selector.selectorRef,
      physicalRelationRef: relation.physicalRelationRef,
      declarationPath: relation.declarationPath,
      declarationDigest: relation.declarationDigest,
      sourceStart: relation.sourceStart,
      sourceEnd: relation.sourceEnd,
      origin: relation.origin,
      selection: relation.selection,
    } as const;
    return {
      witnessDigest: sha256Canonical(body as unknown as JsonValue),
      ...body,
    };
  };
  const semanticUseAt = (
    node: TypeScript.Node,
  ): ResolvedSemanticSelection["semanticUse"] => {
    let current: TypeScript.Node | undefined = node;
    while (current !== undefined && !ts.isSourceFile(current)) {
      if (ts.isTypeQueryNode(current)) return "type_query";
      if (ts.isImportTypeNode(current)) {
        return current.isTypeOf ? "type_query" : "type_reference";
      }
      if (ts.isTypeNode(current)) return "type_reference";
      current = current.parent;
    }
    return "value_reference";
  };
  const relationBindingIdentifier = (
    relation: TypeScript.Node | null,
    selector: ContractIndexedPendingExternalSelector,
  ): TypeScript.Node | null => {
    if (relation === null) return null;
    const exposedName = selector.selection.kind === "name" ||
        selector.selection.kind === "namespace"
      ? selector.selection.exposedName
      : null;
    if (exposedName === null) return null;
    if (ts.isImportDeclaration(relation)) {
      const clause = relation.importClause;
      if (clause?.name?.text === exposedName) return clause.name;
      const bindings = clause?.namedBindings;
      if (bindings !== undefined && ts.isNamespaceImport(bindings)) {
        return bindings.name.text === exposedName ? bindings.name : null;
      }
      if (bindings !== undefined && ts.isNamedImports(bindings)) {
        return bindings.elements.find(
          (element) => element.name.text === exposedName,
        )?.name ?? null;
      }
    }
    if (ts.isExportDeclaration(relation)) {
      const clause = relation.exportClause;
      if (clause !== undefined && ts.isNamespaceExport(clause)) {
        return clause.name.text === exposedName ? clause.name : null;
      }
      if (clause !== undefined && ts.isNamedExports(clause)) {
        return clause.elements.find(
          (element) => element.name.text === exposedName,
        )?.name ?? null;
      }
    }
    if (ts.isImportEqualsDeclaration(relation)) {
      return relation.name.text === exposedName ? relation.name : null;
    }
    return null;
  };
  const accessPath = (
    node: TypeScript.Node,
  ): readonly TypeScript.Identifier[] | null => {
    if (ts.isIdentifier(node)) return [node];
    if (ts.isQualifiedName(node)) {
      const left = accessPath(node.left);
      return left === null || !ts.isIdentifier(node.right)
        ? null
        : [...left, node.right];
    }
    if (ts.isPropertyAccessExpression(node)) {
      const left = accessPath(node.expression);
      return left === null || !ts.isIdentifier(node.name)
        ? null
        : [...left, node.name];
    }
    return null;
  };
  const semanticUsesFor = (
    sourceSymbol: TypeScript.Symbol,
    targetSymbol: TypeScript.Symbol,
    targetName: string,
    relation: TypeScript.Node | null,
    relationEvidence: PhysicalDeclarationRelation,
    selector: ContractIndexedPendingExternalSelector,
  ): readonly ResolvedSemanticSelection["semanticUse"][] => {
    if (
      selector.origin.kind === "import_type_expression" &&
      selector.origin.operator === "typeof"
    ) {
      return ["type_query"];
    }
    if (selector.origin.kind === "import_type_expression") {
      return ["type_reference"];
    }
    const bindingIdentifier = relationBindingIdentifier(relation, selector);
    const bindingSymbol = bindingIdentifier === null
      ? undefined
      : checker.getSymbolAtLocation(bindingIdentifier);
    const uses = new Set<ResolvedSemanticSelection["semanticUse"]>();
    for (const declaration of sourceSymbol.declarations ?? []) {
      const visit = (node: TypeScript.Node): void => {
        if (ts.isIdentifier(node) && bindingSymbol !== undefined) {
          const referenced = checker.getSymbolAtLocation(node);
          if (referenced === bindingSymbol) uses.add(semanticUseAt(node));
        }
        if (
          selector.selection.kind === "namespace" ||
          selector.origin.kind === "import_equals_declaration"
        ) {
          const path = accessPath(node);
          if (
            path !== null &&
            path.length >= 2 &&
            path[1]!.text === targetName &&
            bindingSymbol !== undefined &&
            checker.getSymbolAtLocation(path[0]!) === bindingSymbol
          ) {
            uses.add(semanticUseAt(node));
          }
        }
        node.forEachChild(visit);
      };
      visit(declaration);
    }
    if (uses.size === 0) {
      if (
        selector.selection.kind === "namespace" ||
        selector.origin.kind === "import_equals_declaration"
      ) {
        uses.add("namespace_reference");
      } else if (isTypeOnlyRelation(relation, relationEvidence)) {
        uses.add("type_reference");
      } else {
        const target = unaliasedSymbol(targetSymbol);
        uses.add(
          (target.flags & ts.SymbolFlags.Value) !== 0
            ? "value_reference"
            : "type_reference",
        );
      }
    }
    return [...uses].sort(compareText);
  };
  const relationDerivation = (
    selector: ContractIndexedPendingExternalSelector,
  ): ResolvedSemanticSelection["derivation"] => {
    if (selector.origin.kind === "import_equals_declaration") {
      return "import_equals_member";
    }
    if (selector.origin.kind === "import_type_expression") {
      return "import_type_member";
    }
    if (selector.selection.kind === "namespace") return "namespace_member";
    if (selector.selection.kind === "all") return "star_member";
    return "named";
  };
  const boundaryWitnessesFor = (
    target: NativeLinkProduct,
    symbol: TypeScript.Symbol,
    exportedName: string,
  ): CanonicalCheckerTargetIdentity["boundaryDeclarationWitnesses"] => {
    const inventory = new Map(
      target.evidence.closures.flatMap((closure) =>
        closure.declarationInventory.map((entry) => [
          entry.declarationPath,
          entry.declarationDigest,
        ] as const)
      ),
    );
    const rows = (symbol.declarations ?? []).flatMap((declaration) => {
      const virtualPath = posix.normalize(declaration.getSourceFile().fileName);
      if (sourceOwner.get(virtualPath) !== target) return [];
      const declarationPath = target.evidence.sources.find(
        (source) =>
          sourcePath.get(
            structuredKey([target.productId, source.declarationPath]),
          ) === virtualPath,
      )?.declarationPath;
      if (declarationPath === undefined) return [];
      const source = target.evidence.sources.find(
        (candidate) => candidate.declarationPath === declarationPath,
      );
      if (
        source === undefined ||
        inventory.get(declarationPath) !== source.declarationDigest
      ) {
        return [];
      }
      return [{
        declarationPath,
        declarationDigest: source.declarationDigest,
        declarationKind: ts.SyntaxKind[declaration.kind] ?? "Unknown",
        exportedName,
      }];
    });
    const unique = new Map(
      rows.map((row) => [
        sha256Canonical(row as unknown as JsonValue),
        row,
      ]),
    );
    return [...unique.values()].sort((left, right) =>
      compareStructuredFields(
        [
          left.declarationPath,
          left.exportedName,
          left.declarationKind,
        ],
        [
          right.declarationPath,
          right.exportedName,
          right.declarationKind,
        ],
      )
    );
  };
  type OccurrenceCandidate = Readonly<{
    source: NativeLinkProduct;
    sourceContract: NativeContractEvidence;
    selector: ContractIndexedPendingExternalSelector;
    witness: CanonicalSourceWitness;
    semanticSelection: ResolvedSemanticSelection;
    checkerTarget: CanonicalCheckerTargetIdentity;
    targetContract: ProductPublicContract;
    dependency: ProductDeclaredDependency;
    occurrenceKey: Sha256Digest;
  }>;
  const occurrenceCandidates: OccurrenceCandidate[] = [];
  const selectorOccurrenceKeys = new Map<string, Set<Sha256Digest>>();
  const selectorDispositions: PendingSelectorDisposition[] = [];
  const bindings: NativeContractClosureRow[] = [];
  for (const source of products) {
    for (const sourceContract of source.evidence.contracts) {
      const closure = contractRoot(source, sourceContract.packageExportPath);
      const sourceSymbols = exportSymbolsFor(
        source,
        sourceContract.packageExportPath,
      );
      const sourceSymbol = sourceSymbols?.get(sourceContract.namedSymbol);
      if (
        closure === null ||
        sourceSymbols === null ||
        sourceSymbol === undefined
      ) {
        return linkedRefusal(
          "incompatible_dependency",
          `${sourceContract.contractId} does not resolve its exact named symbol`,
        );
      }
      const physicalByRef = new Map(
        closure.physicalRelations.map((relation) => [
          relation.physicalRelationRef,
          relation,
        ]),
      );
      for (const selector of sourceContract.pendingSelectors) {
        const relationEvidence = physicalByRef.get(selector.physicalRelationRef);
        if (relationEvidence === undefined) {
          return linkedRefusal(
            "incompatible_dependency",
            `${selector.selectorRef} has no exact physical relation`,
          );
        }
        const coordinate = packageImportCoordinate(
          selector.externalModuleSpecifier,
        );
        if (coordinate === null) {
          return linkedRefusal(
            "incompatible_dependency",
            `${selector.externalModuleSpecifier} is not a package coordinate`,
          );
        }
        const selected = directTarget(source, coordinate.packageName);
        if ("kind" in selected) return selected;
        const { dependency, target } = selected;
        const targetRoot = contractRoot(
          target,
          coordinate.packageExportPath,
        );
        const targetSymbols = exportSymbolsFor(
          target,
          coordinate.packageExportPath,
        );
        if (targetRoot === null || targetSymbols === null) {
          return linkedRefusal(
            "unresolved_dependency",
            `${selector.externalModuleSpecifier} has no exact linked declaration root`,
          );
        }
        const relation = relationFor(source, relationEvidence);
        let selectedSymbols: readonly [string, TypeScript.Symbol][] = [];
        if (selector.selection.kind === "name") {
          const symbol = targetSymbols.get(selector.selection.targetName);
          selectedSymbols = symbol === undefined
            ? []
            : [[selector.selection.targetName, symbol]];
        } else if (selector.selection.kind === "all") {
          const symbol = targetSymbols.get(sourceContract.namedSymbol);
          const sourceExport = sourceSymbols.get(sourceContract.namedSymbol);
          selectedSymbols =
            symbol !== undefined &&
              sourceExport !== undefined &&
              unaliasedSymbol(sourceExport) === unaliasedSymbol(symbol)
              ? [[sourceContract.namedSymbol, symbol]]
              : [];
        } else {
          const names = new Set<string>();
          const exposedName = selector.selection.kind === "namespace"
            ? selector.selection.exposedName
            : null;
          for (const declaration of sourceSymbol.declarations ?? []) {
            const visit = (node: TypeScript.Node): void => {
              if (
                exposedName !== null &&
                (
                  ts.isQualifiedName(node) ||
                  ts.isPropertyAccessExpression(node)
                )
              ) {
                const left = ts.isQualifiedName(node) ? node.left : node.expression;
                const right = ts.isQualifiedName(node) ? node.right : node.name;
                if (
                  ts.isIdentifier(left) &&
                  left.text === exposedName
                ) {
                  names.add(right.text);
                }
              }
              node.forEachChild(visit);
            };
            visit(declaration);
          }
          if (
            names.size === 0 &&
            unaliasedSymbol(sourceSymbol).flags & ts.SymbolFlags.Module
          ) {
            for (const name of targetSymbols.keys()) names.add(name);
          }
          selectedSymbols = [...names].sort(compareText).flatMap((name) => {
            const symbol = targetSymbols.get(name);
            return symbol === undefined ? [] : [[name, symbol] as const];
          });
        }
        if (selectedSymbols.length === 0) {
          selectorDispositions.push({
            kind: "no_external_contribution",
            selectorRef: selector.selectorRef,
            reason: selector.selection.kind === "all"
              ? "locally_shadowed"
              : "not_in_source_contract_meaning",
            checkerWitnessDigest: sha256Canonical({
              selectorRef: selector.selectorRef,
              sourceContractRef: sourceContract.contractId,
              disposition: "no_external_contribution",
            }),
          });
          continue;
        }
        const occurrenceKeys = new Set<Sha256Digest>();
        for (const [targetName, targetSymbol] of selectedSymbols) {
          const targetContracts = target.publicContracts.filter(
            (contract) =>
              dependency.requiredContractRefs.includes(contract.contractId) &&
              contract.nativeTypedLocator?.packageName ===
                coordinate.packageName &&
              contract.nativeTypedLocator.packageExportPath ===
                coordinate.packageExportPath &&
              contract.nativeTypedLocator.namedSymbol === targetName,
          );
          if (targetContracts.length !== 1) {
            return linkedRefusal(
              targetContracts.length === 0
                ? "unresolved_dependency"
                : "ambiguous_dependency",
              `${selector.externalModuleSpecifier} symbol ${targetName} requires one direct target contract`,
            );
          }
          const semanticUses = semanticUsesFor(
            sourceSymbol,
            targetSymbol,
            targetName,
            relation,
            relationEvidence,
            selector,
          );
          const boundaryDeclarationWitnesses = boundaryWitnessesFor(
            target,
            targetSymbol,
            targetName,
          );
          if (boundaryDeclarationWitnesses.length === 0) {
            return linkedRefusal(
              "unresolved_dependency",
              `${selector.externalModuleSpecifier} symbol ${targetName} has no target-owned boundary declaration`,
            );
          }
          for (const semanticUse of semanticUses) {
            const requiredSymbolSpace =
              semanticUse === "type_query" ||
                semanticUse === "value_reference"
                ? "value"
                : semanticUse === "namespace_reference"
                ? "namespace"
                : "type";
            const semanticSelection: ResolvedSemanticSelection = {
              derivation: relationDerivation(selector),
              targetExportedSymbol: targetName,
              exposedMemberPath: selector.selection.kind === "namespace"
                ? [selector.selection.exposedName, targetName]
                : [selector.selection.kind === "name"
                  ? selector.selection.exposedName
                  : targetName],
              semanticUse,
              requiredSymbolSpace,
            };
            const checkerTargetBody = {
              targetProductContentDigest: target.productContentDigest,
              targetPackageName: coordinate.packageName,
              targetPackageExportPath: coordinate.packageExportPath,
              targetExportedSymbol: targetName,
              requiredSymbolSpace,
              boundaryDeclarationWitnesses,
            } as const;
            const checkerTarget: CanonicalCheckerTargetIdentity = {
              ...checkerTargetBody,
              targetIdentityDigest: sha256Canonical(
                checkerTargetBody as unknown as JsonValue,
              ),
            };
            const occurrenceKey = sha256Canonical({
              sourceProductContentDigest: source.productContentDigest,
              sourceContractRef: sourceContract.contractId,
              sourceContractDigest: sourceContract.contractDigest,
              sourcePackageExportPath: sourceContract.packageExportPath,
              sourceNamedSymbol: sourceContract.namedSymbol,
              semanticSelection,
              checkerTarget,
            } as unknown as JsonValue);
            occurrenceKeys.add(occurrenceKey);
            occurrenceCandidates.push({
              source,
              sourceContract,
              selector,
              witness: sourceWitnessFor(selector, relationEvidence),
              semanticSelection,
              checkerTarget,
              targetContract: targetContracts[0]!,
              dependency,
              occurrenceKey,
            });
          }
        }
        selectorOccurrenceKeys.set(selector.selectorRef, occurrenceKeys);
      }
    }
    for (const contract of source.evidence.contracts) {
      const symbols = exportSymbolsFor(source, contract.packageExportPath);
      if (symbols === null || !symbols.has(contract.namedSymbol)) {
        return linkedRefusal(
          "incompatible_dependency",
          `${contract.contractId} does not resolve its exact named symbol`,
        );
      }
      const publicContracts = source.publicContracts.filter(
        (candidate) =>
          candidate.contractId === contract.contractId &&
          candidate.nativeTypedLocator?.packageName === source.packageName &&
          candidate.nativeTypedLocator.packageExportPath ===
            contract.packageExportPath &&
          candidate.nativeTypedLocator.namedSymbol === contract.namedSymbol,
      );
      if (publicContracts.length !== 1) {
        return linkedRefusal(
          publicContracts.length === 0
            ? "unresolved_dependency"
            : "ambiguous_dependency",
          `${contract.contractId} does not have one exact Product contract row`,
        );
      }
      bindings.push({
        kind: "symbol_admission",
        productContentDigest: source.productContentDigest,
        contractRef: contract.contractId,
        contractDigest: publicContracts[0]!.contractDigest,
        packageExportPath: contract.packageExportPath,
        namedSymbol: contract.namedSymbol,
      });
    }
  }

  const occurrenceGroups = new Map<Sha256Digest, OccurrenceCandidate[]>();
  for (const candidate of occurrenceCandidates) {
    const group = occurrenceGroups.get(candidate.occurrenceKey) ?? [];
    group.push(candidate);
    occurrenceGroups.set(candidate.occurrenceKey, group);
  }
  const occurrences: ContractExternalOccurrence[] = [];
  const occurrenceRefByKey = new Map<Sha256Digest, string>();
  for (
    const [occurrenceKey, candidates] of
      [...occurrenceGroups.entries()].sort(([left], [right]) =>
        compareText(left, right)
      )
  ) {
    const representative = candidates[0]!;
    const sourceWitnesses = [...new Map(
      candidates.map((candidate) => [
        candidate.witness.witnessDigest,
        candidate.witness,
      ]),
    ).values()].sort((left, right) =>
      compareText(left.witnessDigest, right.witnessDigest)
    );
    const occurrenceBody = {
      sourceProductContentDigest:
        representative.source.productContentDigest,
      sourceContractRef: representative.sourceContract.contractId,
      sourceContractDigest: representative.sourceContract.contractDigest,
      sourcePackageExportPath:
        representative.sourceContract.packageExportPath,
      sourceNamedSymbol: representative.sourceContract.namedSymbol,
      sourceWitnesses,
      semanticSelection: representative.semanticSelection,
      checkerTarget: representative.checkerTarget,
    } as const;
    const occurrenceRef = sha256Canonical(
      occurrenceBody as unknown as JsonValue,
    );
    const targetCoordinates = new Set(
      candidates.map((candidate) =>
        structuredKey([
          candidate.targetContract.contractId,
          candidate.targetContract.contractDigest,
          sha256Canonical(candidate.dependency as unknown as JsonValue),
        ])
      ),
    );
    if (targetCoordinates.size !== 1) {
      return linkedRefusal(
        "ambiguous_dependency",
        `${occurrenceRef} has multiple direct target contracts`,
      );
    }
    occurrences.push({ occurrenceRef, ...occurrenceBody });
    occurrenceRefByKey.set(occurrenceKey, occurrenceRef);
    bindings.push({
      kind: "external_binding",
      sourceOccurrenceRef: occurrenceRef,
      directDependencyEdge: representative.dependency,
      targetProductContentDigest:
        representative.checkerTarget.targetProductContentDigest,
      targetContractRef: representative.targetContract.contractId,
      targetContractDigest: representative.targetContract.contractDigest,
      targetPackageExportPath:
        representative.targetContract.nativeTypedLocator!.packageExportPath,
      targetNamedSymbol:
        representative.targetContract.nativeTypedLocator!.namedSymbol,
      checkerTarget: representative.checkerTarget,
    });
  }

  for (
    const [selectorRef, occurrenceKeys] of
      [...selectorOccurrenceKeys.entries()].sort(([left], [right]) =>
        compareText(left, right)
      )
  ) {
    const occurrenceRefs = [...occurrenceKeys]
      .map((key) => occurrenceRefByKey.get(key))
      .filter((value): value is string => value !== undefined)
      .sort(compareText);
    if (occurrenceRefs.length !== occurrenceKeys.size) {
      return linkedRefusal(
        "incompatible_dependency",
        `${selectorRef} does not resolve its complete occurrence set`,
      );
    }
    selectorDispositions.push({
      kind: "semantic_occurrences",
      selectorRef,
      occurrenceRefs,
    });
  }
  selectorDispositions.sort((left, right) =>
    compareText(left.selectorRef, right.selectorRef)
  );
  occurrences.sort((left, right) =>
    compareText(left.occurrenceRef, right.occurrenceRef)
  );
  const pendingSelectorRefs = products.flatMap((product) =>
    product.evidence.contracts.flatMap((contract) =>
      contract.pendingSelectors.map((selector) => selector.selectorRef)
    )
  );
  if (
    new Set(pendingSelectorRefs).size !== pendingSelectorRefs.length ||
    selectorDispositions.length !== pendingSelectorRefs.length ||
    new Set(selectorDispositions.map((row) => row.selectorRef)).size !==
      selectorDispositions.length ||
    occurrences.length !==
      bindings.filter((row) => row.kind === "external_binding").length ||
    new Set(occurrences.map((row) => row.occurrenceRef)).size !==
      occurrences.length ||
    new Set(
      bindings.flatMap((row) =>
        row.kind === "external_binding" ? [row.sourceOccurrenceRef] : []
      ),
    ).size !== occurrences.length
  ) {
    return linkedRefusal(
      "incompatible_dependency",
      "native selector, occurrence, and binding conservation failed",
    );
  }

  for (const sourceFile of program.getSourceFiles()) {
    const owner = sourceOwner.get(posix.normalize(sourceFile.fileName));
    if (owner === undefined) continue;
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (moduleSymbol === undefined) continue;
    const symbols = [moduleSymbol, ...checker.getExportsOfModule(moduleSymbol)];
    for (const symbol of symbols) {
      const owners = new Set(
        (symbol.declarations ?? [])
          .map((declaration) =>
            sourceOwner.get(posix.normalize(declaration.getSourceFile().fileName))
          )
          .filter(
            (candidate): candidate is NativeLinkProduct =>
              candidate !== undefined,
          )
          .map((candidate) => candidate.productContentDigest),
      );
      if (owners.size > 1) {
        return linkedRefusal(
          "incompatible_dependency",
          "linked declaration symbol contains multiple Product owners",
        );
      }
    }
  }

  bindings.sort((left, right) =>
    compareStructuredFields(
      left.kind === "external_binding"
        ? [
            "external",
            left.sourceOccurrenceRef,
            left.targetContractRef,
            left.targetNamedSymbol,
          ]
        : [
            "symbol",
            left.productContentDigest,
            left.contractRef,
            left.packageExportPath,
            left.namedSymbol,
          ],
      right.kind === "external_binding"
        ? [
            "external",
            right.sourceOccurrenceRef,
            right.targetContractRef,
            right.targetNamedSymbol,
          ]
        : [
            "symbol",
            right.productContentDigest,
            right.contractRef,
            right.packageExportPath,
            right.namedSymbol,
          ],
    )
  );
  return {
    kind: "linked",
    bindings,
    selectorDispositions,
    occurrences,
    nativeContractClosureDigest: sha256Canonical({
      toolchainProductContentDigest,
      selectorDispositions,
      occurrences,
      bindings,
    } as unknown as JsonValue),
  };
}

export async function declarationExportSymbols(
  rootPath: string,
  declarationSources: readonly DeclarationSource[],
  sourceProductContentDigest: Sha256Digest,
): Promise<ReadonlySet<string> | null> {
  const closures = await resolveNativeDeclarationClosures({
    packageName: "@abiogenesis/declaration-probe",
    packageType: "commonjs",
    packageExports: { ".": { types: `./${rootPath}` } },
    declarationSources,
    sourceProductContentDigest,
  });
  return closures === null || closures.length !== 1
    ? null
    : new Set(closures[0]!.exportedSymbols);
}
