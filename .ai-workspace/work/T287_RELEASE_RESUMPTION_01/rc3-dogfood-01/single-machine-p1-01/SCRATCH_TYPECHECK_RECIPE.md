# Construction compiler recipe: fresh host-only copy

Root selected this finite host scratch effect under AMENDMENT_02. It is a mechanical self-check, never admitted C2 or a semantic acceptance verdict. The actual baseline at97406077 passed using precisely code/src, tenant package.json and tsconfig.json plus the pinned offline dependencies. No contract seeds, generation scripts, dependency installation or loader shim were needed. All292 copied regular candidate inputs are already within the selected963/readRoots, as checked by the setup analyst.

Use a NEW exclusive host TMPDIR directory after the actual Product edits; copy the current candidate sources there. Do not run scratch-typecheck.py as the author's post-edit harness: it intentionally asserts clean97406077 baseline and preserves its one receipt. The native Worker uses the command recipe below and reports its own actual path/commands/output/status. No stale baseline copy may stand in for the edited candidate.

```sh
p1_tenant='/Users/jim/src/apps/abiogenesis-single-machine-p1/build_tenants/abiogenesis/typescript'
p1_deps='/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules'
p1_node='/opt/homebrew/Cellar/node/24.7.0/bin/node'
# Verify the existing pinned source dependency inventory; no recording/install:
/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -I -B '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/increment-a-01/toolchain-census.py' --verify
p1_scratch=$(mktemp -d "${TMPDIR%/}/abi5-p1-author-typecheck.XXXXXXXX")
mkdir "$p1_scratch/code"
cp -R "$p1_tenant/code/src" "$p1_scratch/code/src"
cp "$p1_tenant/package.json" "$p1_tenant/tsconfig.json" "$p1_scratch/"
cp -R "$p1_deps" "$p1_scratch/node_modules"
# --noEmit overrides declaration/outDir; tsconfig has no incremental option.
# Retain the complete stdout/stderr/exit even when nonzero; do not run under a
# shell pattern that hides a failing tsc behind a successful later command.
NODE_OPTIONS=--max-old-space-size=8192 "$p1_node" "$p1_scratch/node_modules/typescript/bin/tsc" --noEmit -p "$p1_scratch/tsconfig.json"
```

If TMPDIR is unavailable, obtain a fresh exclusive directory from the host's normal temporary-directory API; never reuse an old directory or use the Product tree for generated output. This command only typechecks code/src/**/*.ts. A changed test.mjs may separately receive node --check; focused runtime tests need the existing build/fixture support and are optional scratch diagnostics, not a license for a broad campaign. Do not invent a new compiler/transpiler/test harness or install missing dependencies. Fix in-scope compiler errors in the actual46-path candidate, then refresh code/src in a NEW scratch copy and rerun the same compiler. Report any actual missing input/authority instead of probing unrelated loaders. Return native Work promptly once the selected repair and compiler feedback are handled; full native C2 remains mandatory.

The actual baseline record/outputs are SCRATCH_TYPECHECK_BASELINE_01.json/.stdout.txt/.stderr.txt. Their empty output and exit0 establish this recipe works on the exact baseline only; they do not validate future edits. scratch-typecheck.py pins Node/Python/census and verifies both copied source/dependency digests, source unchanged and no Product output. The retained baseline scratch directory is custody, not an author workspace to modify.
