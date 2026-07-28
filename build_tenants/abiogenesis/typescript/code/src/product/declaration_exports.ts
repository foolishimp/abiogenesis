import { posix } from "node:path";

import type * as TypeScript from "typescript";

export interface DeclarationSource {
  readonly path: string;
  readonly bytes: Uint8Array;
}

const VIRTUAL_PACKAGE_ROOT = "/package";

function virtualDeclarationPath(path: string): string | null {
  if (path.length === 0 || posix.isAbsolute(path) || path.includes("\0")) {
    return null;
  }
  const normalized = posix.normalize(path);
  if (normalized === ".." || normalized.startsWith("../")) return null;
  return posix.join(VIRTUAL_PACKAGE_ROOT, normalized);
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

function externalImportSpecifier(
  typescript: typeof TypeScript,
  diagnostic: TypeScript.Diagnostic,
): string | null {
  if (
    diagnostic.code !== 2307 ||
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
    if (typescript.isExportDeclaration(node)) return null;
    if (typescript.isImportDeclaration(node)) {
      return typescript.isStringLiteralLike(node.moduleSpecifier)
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
    node = node.parent;
  }
  return null;
}

function isPermittedExternalImportDiagnostic(
  typescript: typeof TypeScript,
  diagnostic: TypeScript.Diagnostic,
): boolean {
  const specifier = externalImportSpecifier(typescript, diagnostic);
  return specifier !== null &&
    !specifier.startsWith(".") &&
    !specifier.startsWith("/");
}

export async function declarationExportSymbolTable(
  declarationSources: readonly DeclarationSource[],
): Promise<ReadonlyMap<string, ReadonlySet<string>> | null> {
  const sources = new Map<string, string>();
  const relativePaths = new Map<string, string>();
  for (const source of declarationSources) {
    const virtualPath = virtualDeclarationPath(source.path);
    if (virtualPath === null || sources.has(virtualPath)) return null;
    sources.set(virtualPath, new TextDecoder().decode(source.bytes));
    relativePaths.set(virtualPath, posix.normalize(source.path));
  }
  if (sources.size === 0) return new Map();

  const compilerModule = await import(
    new URL("../../../toolchain/typescript.cjs", import.meta.url).href
  );
  const ts = (compilerModule.default ?? compilerModule) as typeof TypeScript;
  const toolchainRoot = posix.dirname(
    ts.getDefaultLibFilePath({}),
  );
  const nodeTypesRoot = posix.join(
    toolchainRoot,
    "node_modules/@types/node",
  );
  const undiciTypesRoot = posix.join(
    toolchainRoot,
    "node_modules/undici-types",
  );
  const options: TypeScript.CompilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: false,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    typeRoots: [posix.join(toolchainRoot, "node_modules/@types")],
    types: ["node"],
  };
  const standardHost = ts.createCompilerHost(options, true);
  const compilerDependencyRoots = [
    posix.dirname(ts.getDefaultLibFilePath(options)),
    nodeTypesRoot,
    undiciTypesRoot,
  ];
  const isCompilerDependencyPath = (fileName: string): boolean => {
    const normalized = posix.normalize(fileName);
    return compilerDependencyRoots.some(
      (root) => normalized === root || normalized.startsWith(`${root}/`),
    );
  };
  const isCompilerDependencyDirectory = (directory: string): boolean => {
    const normalized = posix.normalize(directory);
    return compilerDependencyRoots.some(
      (root) =>
        normalized === root ||
        normalized.startsWith(`${root}/`) ||
        root.startsWith(`${normalized}/`),
    );
  };
  const host: TypeScript.CompilerHost = {
    directoryExists: (directory) =>
      directoryContainsSource(sources, directory) ||
      (
        isCompilerDependencyDirectory(directory) &&
        (standardHost.directoryExists?.(directory) ?? false)
      ),
    fileExists: (fileName) =>
      sources.has(posix.normalize(fileName)) ||
      (
        isCompilerDependencyPath(fileName) &&
        standardHost.fileExists(fileName)
      ),
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => VIRTUAL_PACKAGE_ROOT,
    getDefaultLibFileName: standardHost.getDefaultLibFileName,
    getDirectories: (directory) =>
      isCompilerDependencyDirectory(directory)
        ? (standardHost.getDirectories?.(directory) ?? [])
            .filter(isCompilerDependencyDirectory)
        : [],
    getNewLine: () => "\n",
    getSourceFile: (fileName, languageVersion) => {
      const source = sources.get(posix.normalize(fileName));
      if (source !== undefined) {
        return ts.createSourceFile(
            fileName,
            source,
            languageVersion,
            true,
            ts.ScriptKind.TS,
          );
      }
      return isCompilerDependencyPath(fileName)
        ? standardHost.getSourceFile(fileName, languageVersion)
        : undefined;
    },
    readFile: (fileName) =>
      sources.get(posix.normalize(fileName)) ??
      (
        isCompilerDependencyPath(fileName)
          ? standardHost.readFile(fileName)
          : undefined
      ),
    realpath: (fileName) =>
      isCompilerDependencyPath(fileName)
        ? standardHost.realpath?.(fileName) ?? posix.normalize(fileName)
        : posix.normalize(fileName),
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined,
  };
  const program = ts.createProgram({
    rootNames: [...sources.keys()],
    options,
    host,
  });
  const diagnostics = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ].filter(
    (diagnostic) => !isPermittedExternalImportDiagnostic(ts, diagnostic),
  );
  if (diagnostics.length > 0) return null;

  const checker = program.getTypeChecker();
  const table = new Map<string, ReadonlySet<string>>();
  for (const [virtualPath, relativePath] of relativePaths) {
    const sourceFile = program.getSourceFile(virtualPath);
    if (sourceFile === undefined) return null;
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    table.set(
      relativePath,
      new Set(
        moduleSymbol === undefined
          ? []
          : checker
              .getExportsOfModule(moduleSymbol)
              .map((symbol) => symbol.getName()),
      ),
    );
  }
  return table;
}

export async function declarationExportSymbols(
  rootPath: string,
  declarationSources: readonly DeclarationSource[],
): Promise<ReadonlySet<string> | null> {
  const normalizedRoot = posix.normalize(rootPath);
  if (virtualDeclarationPath(normalizedRoot) === null) return null;
  return (await declarationExportSymbolTable(declarationSources))
    ?.get(normalizedRoot) ?? null;
}
