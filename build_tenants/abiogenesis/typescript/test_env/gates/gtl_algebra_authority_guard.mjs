import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tenantRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = path.join(tenantRoot, "code", "src");
const runnerRoot = path.join(sourceRoot, "abg", "m03", "runner");
const declarationLawPath = path.join(
  sourceRoot,
  "gtl",
  "m01",
  "contracts",
  "declaration_law.ts"
);

function filesBelow(root, suffix) {
  const files = [];
  for (const name of readdirSync(root)) {
    const candidate = path.join(root, name);
    if (statSync(candidate).isDirectory()) {
      files.push(...filesBelow(candidate, suffix));
    } else if (candidate.endsWith(suffix)) {
      files.push(candidate);
    }
  }
  return files;
}

const runnerViolations = [];
for (const file of filesBelow(runnerRoot, ".ts")) {
  const source = readFileSync(file, "utf8");
  for (const pattern of [
    /\.declarations\.entries/u,
    /\.graphFunction\.declarations/u,
    /\bSerializedAttrs\b/u,
    /\bSerializedJsonValue\b/u,
    /\bhogProgram(?:From|CatalogFrom|LadderFrom)DeclarationAttrs\b/u,
    /\bhogHandler(?:Bindings|Configs)FromDeclarationAttrs\b/u,
    /\bpluginSelectionFromDeclarationAttrs\b/u,
    /\bcompileHogProgram(?:Syntax|Catalog|Ladder)\b/u
  ]) {
    if (pattern.test(source)) {
      runnerViolations.push(`${path.relative(tenantRoot, file)} matches ${String(pattern)}`);
    }
  }
}
assert.deepEqual(
  runnerViolations,
  [],
  `runner code must consume typed declaration APIs, not raw authored data:\n${runnerViolations.join("\n")}`
);

const declarationLawSource = readFileSync(declarationLawPath, "utf8");
const registeredReservedKeys = new Set(
  [...declarationLawSource.matchAll(/key:\s*"((?:abg|gtl)\.[^"]+)"/gu)].map(
    (match) => match[1]
  )
);
const unregisteredKeyLiterals = [];
for (const file of filesBelow(sourceRoot, ".ts")) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/key:\s*"((?:abg|gtl)\.[^"]+)"/gu)) {
    const key = match[1];
    if (!registeredReservedKeys.has(key)) {
      unregisteredKeyLiterals.push(`${path.relative(tenantRoot, file)}: ${key}`);
    }
  }
}
assert.deepEqual(
  unregisteredKeyLiterals,
  [],
  `reserved declaration-key literals require declaration-law registration:\n${unregisteredKeyLiterals.join("\n")}`
);

const cAlgebraSource = readFileSync(
  path.join(sourceRoot, "gtl", "m01", "algebra", "c_algebra.ts"),
  "utf8"
);
for (const discriminant of [
  "c_of",
  "c_identity",
  "c_compose",
  "c_edge",
  "c_workflow",
  "c_batch",
  "c_retry"
]) {
  assert.match(
    cAlgebraSource,
    new RegExp(`kind: [\"']${discriminant}[\"']`, "u"),
    `typed C algebra must carry ${discriminant}`
  );
}

const packageJson = JSON.parse(
  readFileSync(path.join(tenantRoot, "package.json"), "utf8")
);
assert.match(packageJson.scripts["build:semantic"] ?? "", /test:gtl-law/u);
assert.match(packageJson.scripts["build:semantic"] ?? "", /guard:gtl-law/u);
assert.match(packageJson.scripts["lint:semantic"] ?? "", /guard:gtl-law/u);

process.stdout.write(
  `${JSON.stringify({
    status: "passed",
    registeredReservedDeclarationKeys: registeredReservedKeys.size,
    runnerFilesChecked: filesBelow(runnerRoot, ".ts").length,
    cAlgebraConstructors: 7
  })}\n`
);
