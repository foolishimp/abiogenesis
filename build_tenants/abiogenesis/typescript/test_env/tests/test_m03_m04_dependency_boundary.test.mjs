// Validates: M03-engine-kernel and M04-app-bootstrap module ownership.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = resolve(HERE, "../..");
const M03_ROOT = resolve(TENANT_ROOT, "code/src/abg/m03");
const M04_ROOT = resolve(TENANT_ROOT, "code/src/app/m04");

function sourceFiles(root) {
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const path = resolve(root, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return entry.isFile() && path.endsWith(".ts") ? [path] : [];
    })
    .sort();
}

function importedSpecifiers(source) {
  return ts.preProcessFile(source, true, true).importedFiles.map(
    (entry) => entry.fileName
  );
}

function isWithin(root, path) {
  const local = relative(root, path);
  return local === "" || (
    local !== ".." &&
    !local.startsWith(`..${sep}`) &&
    !isAbsolute(local)
  );
}

function relativeTarget(sourcePath, specifier) {
  if (!specifier.startsWith(".")) return null;
  return resolve(dirname(sourcePath), specifier);
}

function forbiddenM04Dependencies(sourcePath, source) {
  return importedSpecifiers(source).filter((specifier) => {
    if (/(?:^|\/)app\/m04(?:\/|$)/u.test(specifier)) return true;
    const target = relativeTarget(sourcePath, specifier);
    return target !== null && isWithin(M04_ROOT, target);
  });
}

test("M03 has no source dependency on M04 public carriers", () => {
  const violations = sourceFiles(M03_ROOT).flatMap((path) =>
    forbiddenM04Dependencies(path, readFileSync(path, "utf8")).map(
      (specifier) => `${relative(TENANT_ROOT, path)} -> ${specifier}`
    )
  );
  assert.deepEqual(
    violations,
    [],
    "M03 must consume a neutral admitted runtime projection, not M04 public-contract or SDK code"
  );
});

test("M03/M04 dependency guard recognizes every TypeScript import form", () => {
  const syntheticPath = resolve(M03_ROOT, "contracts/fixture.ts");
  const source = `
    import type { A } from "../../../app/m04/public_contracts/foundation.js";
    export { B } from "../../../app/m04/public_sdk/carriers.js";
    import C = require("../../../app/m04/contracts/constructors.js");
    const d = import("../../../app/m04/public_sdk/runtime_operations.js");
    const e = require("../../../app/m04/public_contracts/operations.js");
    type F = import("../../../app/m04/public_sdk/carriers.js").F;
  `;
  assert.equal(forbiddenM04Dependencies(syntheticPath, source).length, 6);
});
