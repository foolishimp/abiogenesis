// Turns the coverage aggregate into "never executed" lists in TypeScript terms.
// Usage: node coverage-report.mjs <stateFile> <buildSrcDir> <mapBuildDir> <censusOutDir>
//
// mapBuildDir is a second compile of the same source with --sourceMap. Its
// JavaScript must equal buildSrcDir's apart from the sourceMappingURL comment;
// the script checks that per file and refuses a file that differs.
//
// Outputs in censusOutDir:
//   coverage-never-executed.json  per source file: functions never called and
//                                 blocks never entered, as TypeScript line spans
//   coverage-by-declaration.json  the census declarations joined with the lines
//                                 of each that no process executed
//   coverage-summary.json         totals by directory, and modules never loaded
// "Never executed" means: by no process of the run this aggregate came from.
// A gated or skipped test executes nothing, so its code shows as unexecuted.
import fs from "node:fs";
import path from "node:path";
import { SourceMap } from "node:module";

const [stateFile, buildSrcDir, mapBuildDir, outDir] = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
const decls = JSON.parse(fs.readFileSync(path.join(outDir, "declarations.json"), "utf8"));

const allJs = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith(".js")) allJs.push(path.relative(buildSrcDir, p)); } };
walk(buildSrcDir);

function lineStarts(text) { const s = [0]; for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) s.push(i + 1); return s; }
function position(starts, offset) { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; } return [lo, offset - starts[lo]]; }

const perFile = {};
const neverLoaded = [];
const refused = [];
for (const rel of allJs.sort()) {
  const ts = rel.replace(/\.js$/, ".ts");
  const s = state.scripts[rel];
  if (!s) { neverLoaded.push(ts); continue; }
  const js = fs.readFileSync(path.join(buildSrcDir, rel), "utf8");
  let mapped; let map;
  try {
    mapped = fs.readFileSync(path.join(mapBuildDir, rel), "utf8").replace(/\n\/\/# sourceMappingURL=.*\n?$/, "\n");
    map = new SourceMap(JSON.parse(fs.readFileSync(path.join(mapBuildDir, `${rel}.map`), "utf8")));
  } catch { refused.push(ts); continue; }
  if (mapped !== js) { refused.push(ts); continue; }
  const starts = lineStarts(js);
  const tsLine = (offset) => { const [l, c] = position(starts, offset); const e = map.findEntry(l, c); return e && e.originalLine !== undefined ? e.originalLine + 1 : null; };
  const span = (key) => { const [a, b] = key.split(":").map(Number); const from = tsLine(a); const to = tsLine(Math.max(a, b - 1)); return from && to ? [Math.min(from, to), Math.max(from, to)] : null; };
  const functions = [];
  const deadRanges = [];
  for (const [key, f] of Object.entries(s.functions)) {
    if (f.count > 0) continue;
    const sp = span(key);
    if (!sp) continue;
    functions.push({ name: f.name || "(anonymous)", from: sp[0], to: sp[1] });
    deadRanges.push(sp);
  }
  const blocks = [];
  for (const [key, count] of Object.entries(s.blocks)) {
    if (count > 0) continue;
    const sp = span(key);
    if (!sp) continue;
    if (deadRanges.some(([a, b]) => a <= sp[0] && sp[1] <= b)) continue; // inside a never-called function
    blocks.push({ from: sp[0], to: sp[1] });
  }
  // merge to distinct unexecuted lines
  const lines = new Set();
  for (const [a, b] of deadRanges) for (let l = a; l <= b; l += 1) lines.add(l);
  for (const b of blocks) for (let l = b.from; l <= b.to; l += 1) lines.add(l);
  perFile[ts] = { loads: s.loads, neverCalledFunctions: functions.sort((x, y) => x.from - y.from),
    neverEnteredBlocks: blocks.filter((b) => b.to - b.from >= 2).sort((x, y) => x.from - y.from), unexecutedLines: [...lines].sort((x, y) => x - y) };
}
fs.writeFileSync(path.join(outDir, "coverage-never-executed.json"), JSON.stringify(
  Object.fromEntries(Object.entries(perFile).map(([f, v]) => [f, { loads: v.loads, neverCalledFunctions: v.neverCalledFunctions, neverEnteredBlocks: v.neverEnteredBlocks }]))));

const joined = decls.map((d) => {
  const f = perFile[d.file];
  let un = 0;
  if (!f) un = neverLoaded.includes(d.file) ? d.lines : 0;
  else { const end = d.line + d.lines - 1; for (const l of f.unexecutedLines) if (l >= d.line && l <= end) un += 1; }
  return { file: d.file, name: d.name, kind: d.kind, line: d.line, lines: d.lines, tier: d.tier, testFiles: d.testFiles, unexecutedLines: un };
});
fs.writeFileSync(path.join(outDir, "coverage-by-declaration.json"), JSON.stringify(joined));

const byDir = {};
for (const d of joined) {
  if (d.kind === "type" || d.kind === "interface") continue; // erased at compile time
  const dir = d.file.includes("/") ? d.file.split("/")[0] : "(root)";
  const b = (byDir[dir] ??= { valueDeclarationLines: 0, unexecutedLines: 0, whollyUnexecutedDeclarations: 0, whollyUnexecutedLines: 0 });
  b.valueDeclarationLines += d.lines; b.unexecutedLines += Math.min(d.unexecutedLines, d.lines);
  if (d.kind === "function" && d.unexecutedLines >= d.lines - 1 && d.lines > 2) { b.whollyUnexecutedDeclarations += 1; b.whollyUnexecutedLines += d.lines; }
}
const summary = { rawFilesFolded: state.files, processesWithProduct: state.processesWithProduct, scriptsSeen: Object.keys(state.scripts).length,
  modulesNeverLoaded: neverLoaded, refused, skippedVariants: state.skippedVariants, byDir };
fs.writeFileSync(path.join(outDir, "coverage-summary.json"), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
