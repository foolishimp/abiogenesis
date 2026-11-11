# Technical debt walk-through: brief for area reviewers

Commentary, not law. Written by the Executive (Claude Fable 5.2), 2026-11-12.

## Purpose

The owner has selected consolidation and clean-up as the next major effort, ahead of any new feature: "consolidate and clean the code base of tech debt, failed and redundant features, and performance improvements", with dead code tracked down. This walk-through produces the second edition of `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`. You review one area and return candidate register entries. You change nothing else.

## Where things are

- Repository: `/Users/jim/src/apps/abiogenesis`, branch `main`. T = `build_tenants/abiogenesis/typescript`.
- Source `T/code/src` (291 files, 171,563 lines). Tests `T/test_env`. Design notes `T/design`. Generated contracts `T/contracts`. Product and requirements `specification/`.
- The existing register (TD-01 to TD-24, almost all closed) shows the entry format. Read its section "Closures and intentional retention that must not become new debt" before you call anything redundant.
- `main`'s `T/build` output is stale. Do not run tests or builds unless your area brief says so.

## Census (already run; read it, do not redo it)

`.ai-workspace/work/TECH_DEBT_REGISTER_02/census/out/`, produced by the three scripts beside it:

| File | What it holds |
|---|---|
| `declarations.json` | Every top-level declaration: `file`, `name`, `kind`, `line`, `lines`, `exported`, `usedByFiles` (other source files), `usedBySameFile`, `tier`, `testFiles` |
| `summary.json`, `modules.json` | Totals, entry points, the module graph, modules the runtime never loads |
| `compiler-unused.json` | Unused locals, imports and parameters reported by the compiler |
| `kinds.json`, `kinds-never-produced.json`, `kinds-never-read.json` | snake_case string literals by position: in a type, in a test (`===`, `case`), or produced |
| `clones.json`, `clones-by-file-pair.json` | Duplicated blocks of ten or more normalized lines |
| `tests.json`, `tests-not-in-any-npm-script.json`, `suite-slow-tests.json` | Test files, gates, slow tests |
| `design.json` | Each design note: last commit, where it is mentioned, dangling path references |
| `markers.json`, `env.json`, `scripts.json`, `npm-scripts.json` | Comment markers, environment variables, scripts |

**Tiers.** `runtime`: reachable from what the product executes (CLI start-up, the fourteen `*_DEFINITION_BINDINGS` the Public calls resolve to, modules loaded by a `build/code/src/….js` string, the two spawned process modules). `package`: reachable only because a package export barrel exports it. `none`: reachable from no entry point. `testFiles` counts test-side files that contain the name as a whole word: a hit can be a coincidence, zero is real.

**Limits you must respect.** Reachability is by top-level declaration. It cannot see a dead branch inside a live function, a registry entry nothing selects, or a value read through a computed key. A `runtime` tier is not proof of use; a `none` tier with `testFiles` 0 is strong evidence of dead code but still needs one check for use by string.

Filter for your area, for example:

```
python3 - <<'EOF'
import json
rows = json.load(open('.ai-workspace/work/TECH_DEBT_REGISTER_02/census/out/declarations.json'))
for r in rows:
    if r['file'].startswith('hog/') and r['tier'] != 'runtime':
        print(r['tier'], r['testFiles'], r['lines'], f"{r['file']}:{r['line']}", r['name'])
EOF
```

## Named checks

Run each check over your whole area. Report what you found and, where you found nothing, say so in one line.

1. **Dead declarations.** Confirm or refute each `none` and `package` tier declaration in your area. Refute by showing the use (a string lookup, a generated contract, a documented consumer contract). Group the confirmed ones by the feature they belonged to.
2. **Compiler-unused.** List the entries in your area. They are one register entry per area, not one each.
3. **Kinds handled but never produced, and produced but never read.** For each in your area decide: dead branch, external input, or residue of a feature that was reserved or never finished. Name the feature.
4. **Second owners.** Two functions or modules that compute the same rule, schema or key. Name both sites and say which one should own it. Use the clone census, then read.
5. **Failed, unfinished or superseded features.** Something declared, validated or typed that nothing executes, produces or proves. Compatibility paths for old shapes. Modules named after milestones (`m01` to `m05`) or tickets. State what the feature was and what remains of it.
6. **Structure.** Files that hold several responsibilities, functions over about 200 lines, type blocks repeated in one file, parameter lists that carry the same bundle everywhere. Only where it blocks consolidation; do not list style.
7. **Performance.** Whole-log passes, repeated decode or fold of the same prefix, repeated canonical JSON and hashing of one value, quadratic scans, repeated file reads and digests, deep copies of large values, caches defeated by copies. Give the code path and what scales it. Mark each as measured (cite the measurement) or structural (by reading).
8. **Coverage of your area.** End with a table of every file in your area: lines, how you read it (full, outline, census only), and findings or "none".

## What a candidate entry looks like

```
### <short title: what to retire or consolidate>
- Category: dead code | second owner | failed or superseded feature | performance | structure | test debt | design and specification | repository
- Evidence: file:line references and how each was established (census, read, or the command you ran)
- Retire: what is deleted, or what is consolidated into which owner
- Size: S | M | L, and the approximate lines removed or moved
- Risk: none | replay digests of recorded Runs | Public contract | manifest or digest pins | qualification mirrors; one sentence on why
- Change class: realization_refactor | design_reframe | requirement_reprice | product_reprice
- Confidence: verified | likely | investigate, and what would settle it
```

Sizes: S is one owner or site; M is a mechanism with its consumers and proofs; L needs a design or contract decision or spans several owners.

## Rules

- Read-only. Write exactly one file: `.ai-workspace/work/TECH_DEBT_REGISTER_02/findings/<your-area>.md`. Do not commit, do not touch any other file, do not run git commands that change state.
- No provider or model calls, no network.
- State what you checked and what you did not. Mark anything you inferred without reading or running as inferred.
- Prefer one entry that names an owner and everything it absorbs over ten entries that list symptoms.
- Do not count. A total of unused exports is not a finding; the feature they belonged to is.
- Do not propose deleting admitted history, changing historical digests or weakening a check to make code removable. If removal changes the bytes of recorded Runs' replay, say so under Risk.
- Write plain sentences. Define any label you introduce.

Your final message to the Executive: at most 12 lines, naming your five most valuable entries and anything that surprised you.
