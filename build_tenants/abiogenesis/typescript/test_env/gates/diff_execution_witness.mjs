// T-217 Phase 1 (absorbing T-214) — the diff-execution witness gate.
// A change is DECLARED by the diff and EARNED by an executed witness:
// this gate fails when changed source lines were never executed by the
// approving suite. Coverage-OF-CHANGE, not coverage-in-general — a
// tree-wide threshold would let the shipped-but-never-executed class
// (T-032 Review B: a rewritten executor with a fatal ReferenceError
// passed a "green" suite that never called it) survive.
//
// Mechanism (no dependencies):
//   1. the approving suite runs with NODE_V8_COVERAGE=<dir>
//   2. v8 coverage JSON -> executed line sets per build .js
//   3. .js.map sourcemaps (VLQ) -> source .ts line -> generated lines
//   4. git diff -U0 <base> -> changed .ts lines under code/src
//   5. a changed line that MAPS to generated lines but has NO executed
//      mapped line is an unwitnessed change -> gate fails
// Lines with no sourcemap presence (types, comments, blanks) are not
// executable and are lawfully unwitnessed.
//
// Usage:
//   NODE_V8_COVERAGE=.v8-coverage npm run test:semantic:built
//   node test_env/gates/diff_execution_witness.mjs --base <ref> \
//     --coverage .v8-coverage
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const args = process.argv.slice(2);
function argValue(flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] !== undefined
    ? args[index + 1]
    : fallback;
}
const baseRef = argValue("--base", "HEAD~1");
const coverageDir = argValue("--coverage", ".v8-coverage");
const tenantRoot = process.cwd();
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: tenantRoot,
  encoding: "utf8"
}).trim();
const tenantPrefix = path.relative(repoRoot, tenantRoot).replaceAll(path.sep, "/");

// ── 1. changed source lines (git diff -U0, added-side line numbers) ──
function changedSourceLines() {
  const diff = execFileSync(
    "git",
    ["diff", "-U0", baseRef, "--", "code/src"],
    { cwd: tenantRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  const changed = new Map(); // repo-relative .ts path -> Set<line>
  let currentFile = null;
  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ b/")) {
      // git emits repo-relative paths; the build tree is tenant-relative
      let file = line.slice("+++ b/".length);
      if (tenantPrefix.length > 0 && file.startsWith(`${tenantPrefix}/`)) {
        file = file.slice(tenantPrefix.length + 1);
      }
      currentFile = file.endsWith(".ts") && file.startsWith("code/src/") ? file : null;
      continue;
    }
    if (currentFile === null || !line.startsWith("@@")) {
      continue;
    }
    const match = /\+(\d+)(?:,(\d+))?/u.exec(line);
    if (!match) {
      continue;
    }
    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    const lines = changed.get(currentFile) ?? new Set();
    for (let index = 0; index < count; index += 1) {
      lines.add(start + index);
    }
    if (count > 0) {
      changed.set(currentFile, lines);
    }
  }
  return changed;
}

// ── 2. executed line sets per generated .js (v8 coverage ranges) ──
function executedLinesPerGeneratedFile() {
  const executed = new Map(); // absolute .js path -> Set<line>
  if (!existsSync(coverageDir)) {
    console.error(
      `diff-execution-witness: coverage directory ${coverageDir} missing — run the approving suite with NODE_V8_COVERAGE first`
    );
    process.exit(2);
  }
  for (const entry of readdirSync(coverageDir)) {
    if (!entry.endsWith(".json")) {
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(path.join(coverageDir, entry), "utf8"));
    } catch {
      continue;
    }
    for (const script of parsed.result ?? []) {
      if (typeof script.url !== "string" || !script.url.startsWith("file://")) {
        continue;
      }
      const filePath = fileURLToPath(script.url);
      if (!filePath.includes(`${path.sep}build${path.sep}semantic${path.sep}`)) {
        continue;
      }
      let offsets = offsetIndexCache.get(filePath);
      if (offsets === undefined) {
        try {
          offsets = buildLineOffsets(readFileSync(filePath, "utf8"));
        } catch {
          continue;
        }
        offsetIndexCache.set(filePath, offsets);
      }
      const lines = executed.get(filePath) ?? new Set();
      for (const fn of script.functions ?? []) {
        for (const range of fn.ranges ?? []) {
          if (range.count > 0) {
            const startLine = lineForOffset(offsets, range.startOffset);
            const endLine = lineForOffset(offsets, Math.max(range.startOffset, range.endOffset - 1));
            for (let line = startLine; line <= endLine; line += 1) {
              lines.add(line);
            }
          }
        }
      }
      executed.set(filePath, lines);
    }
  }
  return executed;
}
const offsetIndexCache = new Map();
function buildLineOffsets(content) {
  const offsets = [0];
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === "\n") {
      offsets.push(index + 1);
    }
  }
  return offsets;
}
function lineForOffset(offsets, offset) {
  let low = 0;
  let high = offsets.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (offsets[mid] <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low + 1;
}

// ── 3. sourcemap: source .ts line -> generated .js lines ──
const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function decodeVlqSegment(segment) {
  const values = [];
  let value = 0;
  let shift = 0;
  for (const char of segment) {
    const digit = BASE64.indexOf(char);
    if (digit === -1) {
      return values;
    }
    const continues = digit & 32;
    value += (digit & 31) << shift;
    if (continues) {
      shift += 5;
    } else {
      const negative = value & 1;
      value >>= 1;
      values.push(negative ? -value : value);
      value = 0;
      shift = 0;
    }
  }
  return values;
}
// returns Map<sourceRepoRelativeTsPath, Map<tsLine, Set<jsLine>>>
function sourceToGeneratedIndex(mapPath) {
  let map;
  try {
    map = JSON.parse(readFileSync(mapPath, "utf8"));
  } catch {
    return null;
  }
  const mapDir = path.dirname(mapPath);
  const sources = (map.sources ?? []).map((source) =>
    path.relative(tenantRoot, path.resolve(mapDir, source))
  );
  const index = new Map();
  let generatedLine = 1;
  let sourceIndex = 0;
  let sourceLine = 0;
  for (const lineChunk of String(map.mappings ?? "").split(";")) {
    if (lineChunk.length > 0) {
      let generatedColumn = 0;
      for (const segment of lineChunk.split(",")) {
        const fields = decodeVlqSegment(segment);
        if (fields.length === 0) {
          continue;
        }
        generatedColumn += fields[0];
        if (fields.length >= 4) {
          sourceIndex += fields[1];
          sourceLine += fields[2];
          const sourcePath = sources[sourceIndex];
          if (sourcePath !== undefined && sourcePath.endsWith(".ts")) {
            const perSource = index.get(sourcePath) ?? new Map();
            const tsLine = sourceLine + 1;
            const generated = perSource.get(tsLine) ?? new Set();
            generated.add(generatedLine);
            perSource.set(tsLine, generated);
            index.set(sourcePath, perSource);
          }
        }
      }
    }
    generatedLine += 1;
  }
  return index;
}

// ── 4+5. the gate ──
const changed = changedSourceLines();
if (changed.size === 0) {
  console.log("diff-execution-witness: no changed code/src .ts lines vs", baseRef);
  process.exit(0);
}
const executed = executedLinesPerGeneratedFile();
const violations = [];
let witnessed = 0;
let nonExecutable = 0;
for (const [sourceFile, lines] of changed) {
  // code/src/foo.ts -> build/semantic/code/src/foo.js(.map)
  const generatedJs = path.join(
    tenantRoot,
    "build",
    "semantic",
    sourceFile.replace(/\.ts$/u, ".js")
  );
  const mapIndex = sourceToGeneratedIndex(`${generatedJs}.map`);
  if (mapIndex === null) {
    violations.push(`${sourceFile}: no sourcemap at ${path.relative(tenantRoot, generatedJs)}.map — build with sourceMap: true`);
    continue;
  }
  const perSource = [...mapIndex.entries()].find(([source]) =>
    source.endsWith(sourceFile.split("/").slice(-1)[0]) && sourceFile.endsWith(source.split("/").slice(-3).join("/"))
  )?.[1] ?? mapIndex.get(sourceFile) ?? null;
  const executedHere = executed.get(generatedJs) ?? new Set();
  for (const line of [...lines].sort((a, b) => a - b)) {
    const generatedLines = perSource?.get(line);
    if (generatedLines === undefined || generatedLines.size === 0) {
      nonExecutable += 1;
      continue;
    }
    const hit = [...generatedLines].some((jsLine) => executedHere.has(jsLine));
    if (hit) {
      witnessed += 1;
    } else {
      violations.push(`${sourceFile}:${line} changed but never executed by the approving suite`);
    }
  }
}
console.log(
  `diff-execution-witness: base=${baseRef} witnessed=${witnessed} non-executable=${nonExecutable} violations=${violations.length}`
);
if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`  UNWITNESSED ${violation}`);
  }
  process.exit(1);
}
