import { readFileSync } from "node:fs";
import { posix } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import type * as TypeScript from "typescript";

import type { JsonValue } from "../shared/canonical_json.js";
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

export type NativeExternalSelectorKind =
  | "all"
  | "module"
  | "name"
  | "namespace";

export interface NativeExternalOccurrence {
  readonly occurrenceRef: string;
  readonly packageExportPath: string;
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceOffset: number;
  readonly sourceEnd: number;
  readonly moduleSpecifier: string;
  readonly selectorKind: NativeExternalSelectorKind;
  readonly selectedName: string | null;
  readonly visibleName: string | null;
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
  readonly exportedSymbolOccurrenceRefs: Readonly<
    Record<string, readonly string[]>
  >;
  readonly declarationInventory:
    readonly ProductNativeDeclarationInventoryRow[];
  readonly externalOccurrences: readonly NativeExternalOccurrence[];
  readonly moduleAugmentations: readonly NativeModuleAugmentation[];
  readonly contributesGlobals: boolean;
}

export interface NativeDeclarationClosureRequest {
  readonly packageName: string;
  readonly packageExports: Readonly<Record<string, unknown>>;
  readonly declarationSources: readonly DeclarationSource[];
}

export interface NativeDeclarationEvidenceSource {
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceText: string;
}

export interface NativeContractEvidence {
  readonly contractId: string;
  readonly packageExportPath: string;
  readonly namedSymbol: string;
  readonly localDisposition: "local" | "pending_external";
  readonly occurrenceRefs: readonly string[];
}

export interface NativeProductDeclarationEvidence {
  readonly productId: string;
  readonly productContentDigest: Sha256Digest;
  readonly packageName: string;
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

export interface NativeContractBinding {
  readonly kind: "external_binding";
  readonly sourceProductContentDigest: Sha256Digest;
  readonly sourceContractRef: string;
  readonly sourcePackageExportPath: string;
  readonly sourceDeclarationPath: string;
  readonly sourceDeclarationDigest: Sha256Digest;
  readonly occurrenceRef: string;
  readonly moduleSpecifier: string;
  readonly selectorKind: NativeExternalSelectorKind;
  readonly selectedName: string;
  readonly targetProductContentDigest: Sha256Digest;
  readonly targetContractRef: string;
  readonly targetPackageExportPath: string;
  readonly targetNamedSymbol: string;
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

function diagnosticModuleSpecifier(
  typescript: typeof TypeScript,
  diagnostic: TypeScript.Diagnostic,
): string | null {
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
        ? node.moduleSpecifier.text
        : null;
    }
    if (
      typescript.isImportEqualsDeclaration(node) &&
      typescript.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression !== undefined &&
      typescript.isStringLiteralLike(node.moduleReference.expression)
    ) {
      return node.moduleReference.expression.text;
    }
    if (
      typescript.isImportTypeNode(node) &&
      typescript.isLiteralTypeNode(node.argument) &&
      typescript.isStringLiteralLike(node.argument.literal)
    ) {
      return node.argument.literal.text;
    }
    if (
      typescript.isModuleDeclaration(node) &&
      typescript.isStringLiteralLike(node.name)
    ) {
      return node.name.text;
    }
    node = node.parent;
  }
  return null;
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
        return ts.createSourceFile(
          normalized,
          source,
          languageVersion,
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

function occurrence(
  basis: Omit<NativeExternalOccurrence, "occurrenceRef">,
): NativeExternalOccurrence {
  return {
    occurrenceRef: `native-occurrence://${sha256Canonical(
      basis as unknown as JsonValue,
    ).slice("sha256:".length)}`,
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
): Readonly<{
  occurrences: readonly NativeExternalOccurrence[];
  augmentations: readonly NativeModuleAugmentation[];
  contributesGlobals: boolean;
}> {
  const occurrences: NativeExternalOccurrence[] = [];
  const augmentations: NativeModuleAugmentation[] = [];
  const add = (
    moduleSpecifier: TypeScript.StringLiteralLike,
    selectorKind: NativeExternalSelectorKind,
    selectedName: string | null,
    visibleName: string | null,
  ): void => {
    const specifier = moduleSpecifier.text;
    if (
      isPlatformSpecifier(specifier) ||
      selfPackageExportPath(packageName, specifier) !== null ||
      packageImportCoordinate(specifier) === null
    ) {
      return;
    }
    occurrences.push(occurrence({
      packageExportPath,
      declarationPath,
      declarationDigest,
      sourceOffset: moduleSpecifier.getStart(sourceFile),
      sourceEnd: moduleSpecifier.getEnd(),
      moduleSpecifier: specifier,
      selectorKind,
      selectedName,
      visibleName,
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
        add(node.moduleSpecifier, "module", null, null);
      } else {
        if (clause.name !== undefined) {
          add(node.moduleSpecifier, "name", "default", clause.name.text);
        }
        const bindings = clause.namedBindings;
        if (bindings !== undefined && ts.isNamespaceImport(bindings)) {
          add(node.moduleSpecifier, "namespace", null, bindings.name.text);
        } else if (bindings !== undefined) {
          for (const element of bindings.elements) {
            add(
              node.moduleSpecifier,
              "name",
              (element.propertyName ?? element.name).text,
              element.name.text,
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
        add(node.moduleSpecifier, "all", null, null);
      } else if (ts.isNamespaceExport(node.exportClause)) {
        add(
          node.moduleSpecifier,
          "namespace",
          null,
          node.exportClause.name.text,
        );
      } else {
        for (const element of node.exportClause.elements) {
          add(
            node.moduleSpecifier,
            "name",
            (element.propertyName ?? element.name).text,
            element.name.text,
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
        "namespace",
        null,
        node.name.text,
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
        selectedName === null ? "namespace" : "name",
        selectedName,
        selectedName,
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
      occurrences.push(occurrence({
        packageExportPath,
        declarationPath,
        declarationDigest,
        sourceOffset: directive.pos,
        sourceEnd: directive.end,
        moduleSpecifier: directive.fileName,
        selectorKind: "all",
        selectedName: null,
        visibleName: null,
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
  occurrences.sort((left, right) =>
    compareText(
      `${left.declarationPath}\0${left.sourceOffset.toString().padStart(12, "0")}\0${left.selectorKind}\0${left.selectedName ?? ""}`,
      `${right.declarationPath}\0${right.sourceOffset.toString().padStart(12, "0")}\0${right.selectorKind}\0${right.selectedName ?? ""}`,
    )
  );
  augmentations.sort((left, right) =>
    compareText(
      `${left.declarationPath}\0${left.sourceOffset.toString().padStart(12, "0")}`,
      `${right.declarationPath}\0${right.sourceOffset.toString().padStart(12, "0")}`,
    )
  );
  return { occurrences, augmentations, contributesGlobals };
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

function relationOccurrenceRefs(
  ts: typeof TypeScript,
  node: TypeScript.Node,
  declarationPath: string,
  occurrences: readonly NativeExternalOccurrence[],
): readonly string[] {
  let moduleSpecifier: TypeScript.StringLiteralLike | null = null;
  let selectorKind: NativeExternalSelectorKind | null = null;
  let visibleName: string | null = null;

  if (ts.isImportSpecifier(node)) {
    const declaration = ancestorOfKind(node, ts.isImportDeclaration);
    if (
      declaration !== null &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectorKind = "name";
      visibleName = node.name.text;
    }
  } else if (ts.isNamespaceImport(node)) {
    const declaration = ancestorOfKind(node, ts.isImportDeclaration);
    if (
      declaration !== null &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectorKind = "namespace";
      visibleName = node.name.text;
    }
  } else if (ts.isImportClause(node) && node.name !== undefined) {
    const declaration = ancestorOfKind(node, ts.isImportDeclaration);
    if (
      declaration !== null &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectorKind = "name";
      visibleName = node.name.text;
    }
  } else if (ts.isExportSpecifier(node)) {
    const declaration = ancestorOfKind(node, ts.isExportDeclaration);
    if (
      declaration !== null &&
      declaration.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectorKind = "name";
      visibleName = node.name.text;
    }
  } else if (ts.isNamespaceExport(node)) {
    const declaration = ancestorOfKind(node, ts.isExportDeclaration);
    if (
      declaration !== null &&
      declaration.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(declaration.moduleSpecifier)
    ) {
      moduleSpecifier = declaration.moduleSpecifier;
      selectorKind = "namespace";
      visibleName = node.name.text;
    }
  } else if (ts.isImportEqualsDeclaration(node)) {
    if (
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression !== undefined &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      moduleSpecifier = node.moduleReference.expression;
      selectorKind = "namespace";
      visibleName = node.name.text;
    }
  } else if (
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteralLike(node.argument.literal)
  ) {
    moduleSpecifier = node.argument.literal;
    selectorKind = node.qualifier === undefined ? "namespace" : "name";
    if (node.qualifier !== undefined) {
      let qualifier: TypeScript.EntityName = node.qualifier;
      while (ts.isQualifiedName(qualifier)) qualifier = qualifier.left;
      visibleName = qualifier.text;
    }
  }

  if (moduleSpecifier === null || selectorKind === null) return [];
  const sourceOffset = moduleSpecifier.getStart(moduleSpecifier.getSourceFile());
  return occurrences
    .filter(
      (candidate) =>
        candidate.declarationPath === declarationPath &&
        candidate.sourceOffset === sourceOffset &&
        candidate.selectorKind === selectorKind &&
        (
          visibleName === null ||
          candidate.visibleName === visibleName
        ),
    )
    .map((candidate) => candidate.occurrenceRef);
}

function exportedSymbolOccurrenceRefs(
  ts: typeof TypeScript,
  checker: TypeScript.TypeChecker,
  moduleSymbol: TypeScript.Symbol | undefined,
  reachable: ReadonlySet<string>,
  relativePaths: ReadonlyMap<string, string>,
  occurrences: readonly NativeExternalOccurrence[],
): Readonly<Record<string, readonly string[]>> {
  if (moduleSymbol === undefined) return {};
  const relationByDeclarationPath = new Map<string, NativeExternalOccurrence[]>();
  for (const occurrence of occurrences) {
    const existing = relationByDeclarationPath.get(occurrence.declarationPath);
    if (existing === undefined) {
      relationByDeclarationPath.set(occurrence.declarationPath, [occurrence]);
    } else {
      existing.push(occurrence);
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
        const sourceOccurrences =
          relationByDeclarationPath.get(declarationPath) ?? [];
        for (const occurrence of sourceOccurrences) {
          if (
            occurrence.selectorKind === "all" &&
            ancestorOfKind(
              nodeAtPosition(
                declaration.getSourceFile(),
                occurrence.sourceOffset,
              ),
              (candidate): candidate is TypeScript.ImportDeclaration |
                TypeScript.ExportDeclaration |
                TypeScript.ImportTypeNode =>
                ts.isImportDeclaration(candidate) ||
                ts.isExportDeclaration(candidate) ||
                ts.isImportTypeNode(candidate),
            ) === null
          ) {
            refs.add(occurrence.occurrenceRef);
          }
        }
        const visit = (node: TypeScript.Node): void => {
          for (
            const occurrenceRef of relationOccurrenceRefs(
              ts,
              node,
              declarationPath,
              sourceOccurrences,
            )
          ) {
            refs.add(occurrenceRef);
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
  if (!isNonblank(request.packageName)) return null;
  const roots = nativeDeclarationRoots(request.packageExports);
  if (roots === null) return null;

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
  const standardHost = createClosedHost(ts, basis, compilerSourceText);
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

    const occurrences: NativeExternalOccurrence[] = [];
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
      );
      occurrences.push(...relations.occurrences);
      augmentations.push(...relations.augmentations);
      contributesGlobals ||= relations.contributesGlobals;
    }
    occurrences.sort((left, right) =>
      compareText(left.occurrenceRef, right.occurrenceRef)
    );
    augmentations.sort((left, right) =>
      compareText(
        `${left.declarationPath}\0${left.sourceOffset.toString().padStart(12, "0")}`,
        `${right.declarationPath}\0${right.sourceOffset.toString().padStart(12, "0")}`,
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
      exportedSymbolOccurrenceRefs: exportedSymbolOccurrenceRefs(
        ts,
        checker,
        moduleSymbol,
        reachable,
        relativePaths,
        occurrences,
      ),
      declarationInventory:
        declarationInventory as ProductNativeDeclarationInventoryRow[],
      externalOccurrences: occurrences,
      moduleAugmentations: augmentations,
      contributesGlobals,
    });
  }
  return closures;
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
        `${product.productId}\0${source.declarationPath}`,
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
          `${product.productId}\0${closure.packageExportPath}`,
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
      const occurrenceRefs = new Set(
        closure.externalOccurrences.map((occurrence) => occurrence.occurrenceRef),
      );
      if (occurrenceRefs.size !== closure.externalOccurrences.length) {
        return linkedRefusal(
          "incompatible_dependency",
          `${product.productId} contains duplicate external occurrence identity`,
        );
      }
      for (
        const contract of product.evidence.contracts.filter(
          (candidate) =>
            candidate.packageExportPath === closure.packageExportPath,
        )
      ) {
        if (
          new Set(contract.occurrenceRefs).size !==
            contract.occurrenceRefs.length ||
          contract.occurrenceRefs.some(
            (occurrenceRef) => !occurrenceRefs.has(occurrenceRef),
          ) ||
          (
            contract.localDisposition === "local" &&
            contract.occurrenceRefs.length !== 0
          ) ||
          (
            contract.localDisposition === "pending_external" &&
            contract.occurrenceRefs.length === 0
          )
        ) {
          return linkedRefusal(
            "incompatible_dependency",
            `${contract.contractId} has invalid local or pending occurrence evidence`,
          );
        }
      }
      if (
        closure.externalOccurrences.some(
          (candidate) => candidate.selectorKind === "module",
        )
      ) {
        return linkedRefusal(
          "incompatible_dependency",
          `${product.productId} contains an external side-effect-only declaration import`,
        );
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
      for (const external of closure.externalOccurrences) {
        const coordinate = packageImportCoordinate(external.moduleSpecifier);
        if (coordinate === null) {
          return linkedRefusal(
            "incompatible_dependency",
            `external declaration coordinate ${external.moduleSpecifier} is invalid`,
          );
        }
        const selected = directTarget(product, coordinate.packageName);
        if ("kind" in selected) return selected;
        if (
          contractRoot(selected.target, coordinate.packageExportPath) === null
        ) {
          return linkedRefusal(
            "unresolved_dependency",
            `${external.moduleSpecifier} has no exact target declaration root`,
          );
        }
      }
    }
  }

  const standardHost = createClosedHost(ts, basis, sourceText);
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
            `${owner.productId}\0${selfExport}`,
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
            `${selected.target.productId}\0${coordinate.packageExportPath}`,
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
            `${owner.productId}\0${selfExport}`,
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
            `${selected.target.productId}\0${coordinate.packageExportPath}`,
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
  const program = ts.createProgram({
    rootNames: [...rootPath.values()].sort(),
    options: basis.options,
    host,
  });
  const diagnostics = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ];
  if (diagnostics.length > 0) {
    return linkedRefusal(
      "incompatible_dependency",
      "linked native declaration closure has a compiler diagnostic",
    );
  }
  const checker = program.getTypeChecker();
  const exportSymbolsFor = (
    product: NativeLinkProduct,
    packageExportPath: string,
  ): ReadonlyMap<string, TypeScript.Symbol> | null => {
    const path = rootPath.get(`${product.productId}\0${packageExportPath}`);
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
    external: NativeExternalOccurrence,
  ): TypeScript.Node | null => {
    const path = sourcePath.get(
      `${product.productId}\0${external.declarationPath}`,
    );
    const source = path === undefined ? undefined : program.getSourceFile(path);
    if (source === undefined) return null;
    return ancestorOfKind(
      nodeAtPosition(source, external.sourceOffset),
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
    external: NativeExternalOccurrence,
  ): boolean => {
    if (relation === null) return external.selectorKind === "all";
    if (ts.isImportTypeNode(relation)) return !relation.isTypeOf;
    if (ts.isImportEqualsDeclaration(relation)) return false;
    if (ts.isImportDeclaration(relation)) {
      const clause = relation.importClause;
      if (clause?.isTypeOnly === true) return true;
      if (
        clause?.namedBindings !== undefined &&
        ts.isNamedImports(clause.namedBindings)
      ) {
        return clause.namedBindings.elements.some(
          (element) =>
            element.name.text === external.visibleName &&
            element.isTypeOnly,
        );
      }
      return false;
    }
    if (!ts.isExportDeclaration(relation)) return false;
    if (relation.isTypeOnly) return true;
    return relation.exportClause !== undefined &&
        ts.isNamedExports(relation.exportClause)
      ? relation.exportClause.elements.some(
        (element) =>
          element.name.text === external.visibleName &&
          element.isTypeOnly,
      )
      : false;
  };

  const bindings: NativeContractClosureRow[] = [];
  for (const source of products) {
    for (const closure of source.evidence.closures) {
      for (const external of closure.externalOccurrences) {
        const sourceContracts = source.evidence.contracts.filter(
          (contract) =>
            contract.packageExportPath === closure.packageExportPath &&
            contract.occurrenceRefs.includes(external.occurrenceRef),
        );
        const coordinate = packageImportCoordinate(external.moduleSpecifier);
        if (coordinate === null) {
          return linkedRefusal(
            "incompatible_dependency",
            `external declaration coordinate ${external.moduleSpecifier} is invalid`,
          );
        }
        const selected = directTarget(source, coordinate.packageName);
        if ("kind" in selected) return selected;
        const { dependency, target } = selected;
        const targetRoot = contractRoot(
          target,
          coordinate.packageExportPath,
        );
        if (targetRoot === null) {
          return linkedRefusal(
            "unresolved_dependency",
            `${external.moduleSpecifier} has no exact target declaration root`,
          );
        }
        const targetSymbols = exportSymbolsFor(
          target,
          coordinate.packageExportPath,
        );
        if (targetSymbols === null) {
          return linkedRefusal(
            "unresolved_dependency",
            `${external.moduleSpecifier} exposes no checker-visible module`,
          );
        }
        const relation = relationFor(source, external);
        const typeOnly = isTypeOnlyRelation(relation, external);
        let visibleSymbols: readonly [string, TypeScript.Symbol][];
        if (external.selectorKind === "name") {
          const selectedName = external.selectedName!;
          const selectedSymbol = targetSymbols.get(selectedName);
          visibleSymbols = selectedSymbol === undefined
            ? []
            : [[selectedName, selectedSymbol]];
        } else {
          visibleSymbols = [...targetSymbols.entries()].filter(
            ([name, symbol]) =>
              (external.selectorKind !== "all" || name !== "default") &&
              (
                !typeOnly ||
                (unaliasedSymbol(symbol).flags & ts.SymbolFlags.Type) !== 0
              ),
          );
          if (
            external.selectorKind === "all" &&
            relation !== null &&
            ts.isExportDeclaration(relation)
          ) {
            const sourceSymbols = exportSymbolsFor(
              source,
              closure.packageExportPath,
            );
            visibleSymbols = sourceSymbols === null
              ? []
              : visibleSymbols.filter(([name, targetSymbol]) => {
                const sourceSymbol = sourceSymbols.get(name);
                return sourceSymbol !== undefined &&
                  unaliasedSymbol(sourceSymbol) ===
                    unaliasedSymbol(targetSymbol);
              });
          }
        }
        if (typeOnly) {
          visibleSymbols = visibleSymbols.filter(
            ([, symbol]) =>
              (unaliasedSymbol(symbol).flags & ts.SymbolFlags.Type) !== 0,
          );
        }
        const visibleNames = visibleSymbols.map(([name]) => name).sort(
          compareText,
        );
        if (visibleNames.length === 0) {
          return linkedRefusal(
            "unresolved_dependency",
            `${external.moduleSpecifier} exposes no checker-visible symbol`,
          );
        }
        for (const selectedName of visibleNames) {
          const targetContracts = target.publicContracts.filter(
            (contract) =>
              dependency.requiredContractRefs.includes(contract.contractId) &&
              contract.nativeTypedLocator?.packageName ===
                coordinate.packageName &&
              contract.nativeTypedLocator.packageExportPath ===
                coordinate.packageExportPath &&
              contract.nativeTypedLocator.namedSymbol === selectedName,
          );
          if (targetContracts.length === 0) {
            return linkedRefusal(
              "unresolved_dependency",
              `${external.moduleSpecifier} symbol ${selectedName} lacks direct required-contract coverage`,
            );
          }
          if (targetContracts.length > 1) {
            return linkedRefusal(
              "ambiguous_dependency",
              `${external.moduleSpecifier} symbol ${selectedName} has ambiguous required-contract coverage`,
            );
          }
          if (
            !targetSymbols.has(selectedName)
          ) {
            return linkedRefusal(
              "incompatible_dependency",
              `${external.moduleSpecifier} contract names a missing checker symbol ${selectedName}`,
            );
          }
          for (const sourceContract of sourceContracts) {
            bindings.push({
              kind: "external_binding",
              sourceProductContentDigest: source.productContentDigest,
              sourceContractRef: sourceContract.contractId,
              sourcePackageExportPath: closure.packageExportPath,
              sourceDeclarationPath: external.declarationPath,
              sourceDeclarationDigest: external.declarationDigest,
              occurrenceRef: external.occurrenceRef,
              moduleSpecifier: external.moduleSpecifier,
              selectorKind: external.selectorKind,
              selectedName,
              targetProductContentDigest: target.productContentDigest,
              targetContractRef: targetContracts[0]!.contractId,
              targetPackageExportPath: coordinate.packageExportPath,
              targetNamedSymbol: selectedName,
            });
          }
        }
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
    compareText(
      left.kind === "external_binding"
        ? `external\0${left.sourceProductContentDigest}\0${left.sourceContractRef}\0${left.occurrenceRef}\0${left.targetContractRef}\0${left.targetNamedSymbol}`
        : `symbol\0${left.productContentDigest}\0${left.contractRef}\0${left.packageExportPath}\0${left.namedSymbol}`,
      right.kind === "external_binding"
        ? `external\0${right.sourceProductContentDigest}\0${right.sourceContractRef}\0${right.occurrenceRef}\0${right.targetContractRef}\0${right.targetNamedSymbol}`
        : `symbol\0${right.productContentDigest}\0${right.contractRef}\0${right.packageExportPath}\0${right.namedSymbol}`,
    )
  );
  return {
    kind: "linked",
    bindings,
    nativeContractClosureDigest: sha256Canonical({
      toolchainProductContentDigest,
      bindings,
    } as unknown as JsonValue),
  };
}

export async function declarationExportSymbols(
  rootPath: string,
  declarationSources: readonly DeclarationSource[],
): Promise<ReadonlySet<string> | null> {
  const closures = await resolveNativeDeclarationClosures({
    packageName: "@abiogenesis/declaration-probe",
    packageExports: { ".": { types: `./${rootPath}` } },
    declarationSources,
  });
  return closures === null || closures.length !== 1
    ? null
    : new Set(closures[0]!.exportedSymbols);
}
