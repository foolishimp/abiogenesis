import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

// Run this file from a source-blind consumer beside the extracted package.
// This roster is the PUBLIC005 oracle, independent of the manifest generator.
const required = [
  ["abg.contract.gtl.m01", "./gtl/m01", "C", "C", "./gtl"],
  ["abg.contract.gtl.m02", "./gtl/m02", "modulePublication", "modulePublication", "./gtl"],
  ["abg.contract.gtl.requirements", "./gtl/requirements", "REQUIREMENT_HANDOFF_DECLARATION_SCHEMA"],
  ["abg.contract.abg.requirements", "./abg/requirements", "authenticateRequirementHandoffBasis"],
  ["abg.contract.abg.m03", "./abg/m03", "RuntimeEvent", "ROOT_EVENT_CONTRACT_DIGEST", "./abg"],
  ["abg.contract.abg.transport", "./abg/m03/transport", "WorkerTransportContract", "WORKER_TRANSPORT_FAILURE_CLASS_VALUES", "./abg"],
  ["abg.contract.app.m04", "./app/m04", "PUBLIC_FUNCTION_DEFINITION_FAMILY"],
  ["abg.contract.qualification.m05", "./qualification/m05", "QualificationLawBasis", "QUALIFICATION_LAW_BASIS_SCHEMA", "./validator"],
];
const packageName = "@abiogenesis/typescript-tenant";
const root = resolve(process.env.ABI5_PUBLIC_GROUPS_PACKAGE_ROOT);
const baseline = JSON.parse(await readFile(process.env.ABI5_PUBLIC_GROUPS_BASELINE, "utf8"));
const metadata = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const manifest = JSON.parse(await readFile(join(root, "product-toolchain-manifest.json"), "utf8"));
const { sha256Canonical } = await import(pathToFileURL(join(root, "build/code/src/shared/digests.js")));
const { resolveNativeDeclarationClosures } = await import(pathToFileURL(join(root, "build/code/src/product/declaration_exports.js")));

async function physicalSources(directory = root, prefix = "") {
  const declarations = [], packages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = prefix + entry.name;
    assert.ok(!entry.isSymbolicLink(), `source-blind package contains a symlink: ${path}`);
    if (entry.isDirectory()) {
      const nested = await physicalSources(join(directory, entry.name), path + "/");
      declarations.push(...nested.declarations); packages.push(...nested.packages);
    } else if (/\.d\.(?:c|m)?ts$/u.test(path)) {
      declarations.push({ path, bytes: await readFile(join(root, path)) });
    } else if (entry.name === "package.json") {
      packages.push({ path, bytes: await readFile(join(root, path)) });
    }
  }
  return { declarations, packages };
}
const sources = await physicalSources();
const closures = await resolveNativeDeclarationClosures({
  packageName: metadata.name,
  packageType: metadata.type,
  packageExports: metadata.exports,
  declarationSources: sources.declarations,
  packageMetadataSources: sources.packages,
  sourceProductContentDigest: manifest.productContentDigest,
});
assert.notEqual(closures, null, "actual packed declaration owner refused the package");
const closureByExport = new Map(closures.map(value => [value.packageExportPath, value]));
const digest = bytes => "sha256:" + createHash("sha256").update(bytes).digest("hex");

function checkRows(rows) {
  for (const [contractId, exportPath, namedSymbol] of required) {
    const matches = rows.filter(row => row.contractId === contractId);
    assert.equal(matches.length, 1, `missing or duplicate PUBLIC005 group: ${contractId}`);
    const row = matches[0], locator = row.nativeTypedLocator;
    const closure = closureByExport.get(exportPath);
    assert.ok(closure, `missing actual export closure: ${exportPath}`);
    assert.equal(row.contractKind, "native_typed_group");
    assert.equal(row.contractVersion, "5.0.0");
    assert.equal(row.owningProduct, manifest.productId);
    assert.equal(locator.packageName, packageName);
    assert.equal(locator.packageExportPath, exportPath);
    assert.equal(locator.namedSymbol, namedSymbol);
    assert.equal(locator.declarationPath, metadata.exports[exportPath].types.slice(2));
    assert.equal(locator.declarationPath, closure.declarationPath);
    assert.ok(closure.exportedSymbols.includes(namedSymbol));
    assert.deepEqual(locator.declarationInventory, closure.declarationInventory);
    assert.equal(row.contractDigest, sha256Canonical(closure.declarationInventory));
    assert.ok(row.requirementAuthorityRefs.includes(
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-005",
    ));
  }
}

test("all eight exact package addresses resolve canonical owner projections", async () => {
  for (const [, exportPath, anchor, witness = anchor, generic] of required) {
    const specifier = packageName + exportPath.slice(1);
    const resolved = import.meta.resolve(specifier);
    assert.equal(resolved, pathToFileURL(join(root, metadata.exports[exportPath].import)).href);
    const facade = await import(specifier);
    assert.ok(Object.hasOwn(facade, witness), `missing runtime witness: ${specifier}:${witness}`);
    if (generic) {
      const owner = await import(packageName + generic.slice(1));
      assert.equal(facade[witness], owner[witness], `divergent owner projection: ${witness}`);
    }
  }
});

test("catalog locates fresh complete declaration closures, retaining every extant identity", async () => {
  checkRows(manifest.publicContractCatalog.rows);
  const expected = [...baseline.contractIds, ...required.map(row => row[0])].sort();
  assert.deepEqual(manifest.publicContractCatalog.rows.map(row => row.contractId).sort(), expected);
  for (const [exportPath, value] of Object.entries(baseline.exports)) {
    assert.deepEqual(metadata.exports[exportPath], value);
  }
  for (const [, exportPath] of required) {
    for (const member of closureByExport.get(exportPath).declarationInventory) {
      assert.equal(digest(await readFile(join(root, member.declarationPath))), member.declarationDigest);
    }
  }
  assert.deepEqual(
    manifest.publicContractCatalog.rows.filter(row => row.assetLocator).map(row => row.contractId).sort(),
    baseline.assetIds,
    "facade wiring must not fabricate missing serialized content",
  );
});

test("missing group and crossed locator are rejected by the same fixed oracle", () => {
  const missing = structuredClone(manifest.publicContractCatalog.rows);
  missing.splice(missing.findIndex(row => row.contractId === required[0][0]), 1);
  assert.throws(() => checkRows(missing), /missing or duplicate PUBLIC005 group/);
  const crossed = structuredClone(manifest.publicContractCatalog.rows);
  crossed.find(row => row.contractId === required[0][0]).nativeTypedLocator.packageExportPath = required[1][1];
  assert.throws(() => checkRows(crossed), { code: "ERR_ASSERTION" });
  const alteredDigest = structuredClone(manifest.publicContractCatalog.rows);
  alteredDigest.find(row => row.contractId === required[0][0]).contractDigest = "sha256:" + "0".repeat(64);
  assert.throws(() => checkRows(alteredDigest), { code: "ERR_ASSERTION" });
});
