// Folds raw V8 coverage files (NODE_V8_COVERAGE) into one aggregate.
// Usage: node coverage-aggregate.mjs <rawDir> <buildSrcDir> <stateFile> [stopFile]
//
// Every process of a test run writes one JSON file at exit. A whole-suite run
// writes thousands, a few megabytes each, so this folds them as they appear
// and deletes each raw file once folded. With a stopFile it keeps polling
// until that file exists and the raw directory is empty.
//
// Only scripts whose URL contains /build/code/src/ are kept, and only when the
// script's module range equals the length of the same file under buildSrcDir:
// a copy with other content (an older installed product) is counted and skipped.
//
// State per file: functions keyed by "start:end" with their name and summed
// call count, and block ranges keyed the same way with their summed count.
import fs from "node:fs";
import path from "node:path";

const [rawDir, buildSrcDir, stateFile, stopFile] = process.argv.slice(2);
const MARK = "/build/code/src/";
const lengths = new Map();
const lengthOf = (rel) => {
  if (!lengths.has(rel)) { let n = -1; try { n = fs.readFileSync(path.join(buildSrcDir, rel), "utf8").length; } catch { /* absent */ } lengths.set(rel, n); }
  return lengths.get(rel);
};
const state = { files: 0, processesWithProduct: 0, skippedVariants: {}, scripts: {} };
if (fs.existsSync(stateFile)) Object.assign(state, JSON.parse(fs.readFileSync(stateFile, "utf8")));

function fold(file) {
  let json;
  try { json = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return false; } // still being written
  let product = false;
  for (const script of json.result ?? []) {
    const at = script.url.indexOf(MARK);
    if (at < 0 || !script.url.endsWith(".js")) continue;
    const rel = script.url.slice(at + MARK.length);
    const top = script.functions[0]?.ranges[0];
    if (!top || top.startOffset !== 0 || top.endOffset !== lengthOf(rel)) { state.skippedVariants[rel] = (state.skippedVariants[rel] ?? 0) + 1; continue; }
    product = true;
    const s = (state.scripts[rel] ??= { loads: 0, functions: {}, blocks: {} });
    s.loads += 1;
    for (const fn of script.functions) {
      const [body, ...blocks] = fn.ranges;
      const key = `${body.startOffset}:${body.endOffset}`;
      const f = (s.functions[key] ??= { name: fn.functionName, count: 0 });
      f.count += body.count;
      if (fn.isBlockCoverage) for (const b of blocks) { const k = `${b.startOffset}:${b.endOffset}`; s.blocks[k] = (s.blocks[k] ?? 0) + b.count; }
    }
  }
  state.files += 1;
  if (product) state.processesWithProduct += 1;
  return true;
}

const settle = 15_000;
for (;;) {
  const now = Date.now();
  let names = [];
  try { names = fs.readdirSync(rawDir).filter((n) => n.startsWith("coverage-") && n.endsWith(".json")); } catch { /* not yet */ }
  let folded = 0;
  for (const n of names) {
    const p = path.join(rawDir, n);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (stopFile && !fs.existsSync(stopFile) && now - st.mtimeMs < settle) continue;
    if (fold(p)) { fs.unlinkSync(p); folded += 1; }
  }
  if (folded > 0) fs.writeFileSync(stateFile, JSON.stringify(state));
  if (!stopFile) break;
  if (fs.existsSync(stopFile) && folded === 0 && names.length === 0) break;
  await new Promise((r) => setTimeout(r, 20_000));
}
fs.writeFileSync(stateFile, JSON.stringify(state));
console.log(JSON.stringify({ files: state.files, processesWithProduct: state.processesWithProduct,
  scripts: Object.keys(state.scripts).length, skippedVariantScripts: Object.keys(state.skippedVariants).length }));
