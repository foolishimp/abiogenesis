// Validates: T-223 DS-1 public native locator completeness
// Validates: REQ-P-PUBLIC-CONTRACTS-003,005,006,007A,009

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import ts from "typescript";

import {
  DS1_NATIVE_CONTRACT_REGISTER,
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";

const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const publishedCatalog = JSON.parse(
  await readFile("contracts/public-contract-catalog.json", "utf8")
);

function packageSubpath(packageExport) {
  if (packageExport === PACKAGE_NAME) {
    return ".";
  }
  assert.equal(packageExport.startsWith(`${PACKAGE_NAME}/`), true);
  return `./${packageExport.slice(PACKAGE_NAME.length + 1)}`;
}

function exportTargets(packageExport) {
  const subpath = packageSubpath(packageExport);
  const target = packageJson.exports[subpath];
  assert.ok(target, `missing package export ${subpath}`);
  assert.equal(typeof target.types, "string");
  assert.equal(typeof target.import, "string");
  return Object.freeze({
    types: path.resolve(target.types),
    runtime: path.resolve(target.import)
  });
}

function resolvedSymbol(checker, symbol) {
  return (symbol.flags & ts.SymbolFlags.Alias) === 0
    ? symbol
    : checker.getAliasedSymbol(symbol);
}

function moduleExports(input) {
  const source = input.program.getSourceFile(input.declarationPath);
  assert.ok(source, `missing emitted declaration ${input.declarationPath}`);
  const moduleSymbol = input.checker.getSymbolAtLocation(source);
  assert.ok(moduleSymbol, `missing module symbol ${input.declarationPath}`);
  return new Map(
    input.checker
      .getExportsOfModule(moduleSymbol)
      .map((symbol) => [symbol.name, symbol])
  );
}

async function assertModuleContract(input) {
  const declarationExports = moduleExports(input);
  const runtimeNamespace = await import(pathToFileURL(input.runtimePath).href);
  for (const symbolName of input.expectedSymbols) {
    const exported = declarationExports.get(symbolName);
    assert.ok(
      exported,
      `${input.packageExport} omits declared symbol ${symbolName} from emitted .d.ts`
    );
    const resolved = resolvedSymbol(input.checker, exported);
    if ((resolved.flags & ts.SymbolFlags.Value) !== 0) {
      assert.equal(
        Object.hasOwn(runtimeNamespace, symbolName),
        true,
        `${input.packageExport} omits runtime symbol ${symbolName}`
      );
    }
  }
}

test("T-223 all native contract locators resolve through package exports", async () => {
  const targets = new Map(
    DS1_NATIVE_CONTRACT_REGISTER.map((definition) => [
      definition.packageExport,
      exportTargets(definition.packageExport)
    ])
  );
  const program = ts.createProgram({
    rootNames: [...targets.values()].map((target) => target.types),
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      skipLibCheck: false
    }
  });
  const checker = program.getTypeChecker();
  assert.deepEqual(
    ts.getPreEmitDiagnostics(program).map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    ),
    []
  );
  for (const definition of DS1_NATIVE_CONTRACT_REGISTER) {
    const target = targets.get(definition.packageExport);
    assert.ok(target);
    await assertModuleContract({
      checker,
      program,
      packageExport: definition.packageExport,
      declarationPath: target.types,
      runtimePath: target.runtime,
      expectedSymbols: definition.symbols
    });
  }
});

test("T-223 all operation locators resolve native and declaration symbols", async () => {
  const packageExport = `${PACKAGE_NAME}/app/m04`;
  const target = exportTargets(packageExport);
  const program = ts.createProgram({
    rootNames: [target.types],
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      skipLibCheck: false
    }
  });
  const checker = program.getTypeChecker();
  assert.deepEqual(
    ts.getPreEmitDiagnostics(program).map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    ),
    []
  );
  for (const definition of DS1_PUBLIC_OPERATION_DEFINITION_REGISTER) {
    const invocationSymbols =
      definition.operationId === "abg.operation.catalog.invoke"
        ? ["PublicOperationInvocationEnvelope", "HostInvocationDescriptor"]
        : ["PublicOperationInvocationEnvelope"];
    await assertModuleContract({
      checker,
      program,
      packageExport,
      declarationPath: target.types,
      runtimePath: target.runtime,
      expectedSymbols: [
        definition.handlerSymbol,
        definition.requestSymbol,
        definition.resultSymbol,
        definition.refusalSymbol,
        ...invocationSymbols
      ]
    });
  }
});

test("T-223 every emitted catalog native locator resolves its exact symbols", async () => {
  const rows = publishedCatalog.rows.filter((row) => row.nativeLocator !== null);
  const packageExports = [...new Set(
    rows.map((row) => row.nativeLocator.packageExport)
  )];
  const targets = new Map(
    packageExports.map((packageExport) => [packageExport, exportTargets(packageExport)])
  );
  const program = ts.createProgram({
    rootNames: [...targets.values()].map((target) => target.types),
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      skipLibCheck: false
    }
  });
  const checker = program.getTypeChecker();
  assert.deepEqual(
    ts.getPreEmitDiagnostics(program).map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    ),
    []
  );
  for (const row of rows) {
    const locator = row.nativeLocator;
    assert.equal(locator.packageName, PACKAGE_NAME);
    const target = targets.get(locator.packageExport);
    assert.ok(target);
    await assertModuleContract({
      checker,
      program,
      packageExport: locator.packageExport,
      declarationPath: target.types,
      runtimePath: target.runtime,
      expectedSymbols: locator.symbols
    });
  }
});
