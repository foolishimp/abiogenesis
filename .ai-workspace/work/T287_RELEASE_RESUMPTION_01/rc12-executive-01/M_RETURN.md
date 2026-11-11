# RC12 package M Return: c0 post-publication heap exhaustion

Worker: Claude Opus 5.5. Worktree `/private/tmp/abg-rc12-foldback-20261111`, branch `claude/rc12-memfix` from `9e1172ce0`. T = `build_tenants/abiogenesis/typescript`. No Product change, no push, provider call or network. Scripts and logs are in `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/memfix/`.

**Stop: the growth is at base at the same rate.** No RC12 package introduced it, and there is no Product repair. The Executive accepted this and ruled a test split: commit `1cc747533`. A D11 design sentence was also corrected: commit `48c8c1afb`.

Correction to the failure statement: the file had **31** cases. On the candidate, 30 pass and the process dies about 18 s into the 31st, `B04-C01 close-only` (30 cases took 1263 s; death at 1281 s). `fail 1` is the file.

## Instrument
`mem-preload.mjs` is loaded with `--import` into the file run directly (`node --expose-gc --experimental-vm-modules [--test-name-pattern …]`). Before each case and at the end it runs three `setImmediate`+`gc()` rounds, then records heapUsed, external and RSS. Heap snapshots were diffed by stable node id, with retainers traced from the GC roots. No source changed while measuring.

## Measurement: post-GC heapUsed (MB) after case k
| build | k=1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | per case (8 / 31-case fit) |
|---|---|---|---|---|---|---|---|---|---|
| base `b7cf409fc` | 141.0 | 243.8 | 347.0 | 450.1 | 553.0 | 655.9 | 758.8 | 862.5 | 103.1 / 103.51 |
| candidate `9e1172ce0` | 142.5 | 246.3 | 349.2 | 452.6 | 557.6 | 660.8 | 763.8 | 868.5 | 103.7 / 104.21 |

External memory stays at 2.6–2.7 MB. RSS does not track the heap.

All 31 cases at a 6 GB heap: base enters case 31 at 3139.4 MB and ends at 3242.6 MB; the candidate enters at 3160.8 MB and ends at 3263.1 MB. Both pass 31/31.

**Bisect:** only base and candidate were measured. The six package heads were built but not run, because no head can account for growth the base already has. The candidate's +0.7 MB per case follows code and contract size: built JS is +0.9 %. A snapshot diff of one case gives base +105.65 MB and candidate +106.56 MB. The +0.9 MB is script source +0.33, `.d.ts` text +0.08, contract bytes +0.15 and compiled code for the rest.

## Retaining path (owner: the test harness and Node's ESM loader)
Each case calls `setupInstalledRootCatalog` (`T/test_env/support/root-installed-environment.mjs`). That runs `npm pack`, imports the bootstrap Product from `<scratch>/bootstrap/package` with its `effect`, `ajv` and `valibot` copies (l.219, l.248), and imports the installed Product from `<scratch>/consumer/…?env=<nonce>` (l.343–353).

Node never unloads an ES module. Each case therefore keeps two more complete module graphs, 835 new `ModuleWrap`s, through `Node / Environment → PrincipalRealm → BaseObjectList → ModuleWrap → SourceTextModule → module context`.

Of the ~106 MB new per case, 78 MB is reachable only through those ModuleWraps; the other ~28 MB of compiled code and script strings comes from other roots. By owner:
- ~27 MB of script source;
- 11 MB of `.d.ts` source text, via `product/environment.ts` `resolvedProductEnvironments` → `nativeDeclarationEvidence.sources[].sourceText`;
- 7 MB of contract bytes such as `commonSchemaAsset.bytes`;
- 7 MB of declaration inventories.

The closed store also survives: node:test keeps every `TestHook` in `testResources`, and the after-hook closure captures `durableStore`. The cost is nothing measurable. With `durableStore = null` after close, a scratch copy gives 142.5/246.2/349.4/452.6 MB against 142.5/246.3/349.2/452.6 MB. No store, history, prefix, read or fold value of a case survives at a measurable cost.

## What pushed the candidate over the limit
- `close-only` alone needs a heap between 925 MB (OOM) and 950 MB (pass) at **both** builds. GC traces put the peak in the case's first ~20 s, at 903–935 MB live (setup and traversal). The Executive's OOM stack is in a zlib callback, and `verifyProduct`'s `gunzip` is the Product's only zlib use.
- Entry to case 31 is 3139.4 MB at base and 3160.8 MB at the candidate (+21.4 MB). V8 aborts on "ineffective mark-compacts" before the 4288 MB limit: the candidate died with 4037–4047 MB live.
- Direct test, one run each, side by side under load: base at the default heap passes 31/31. Base with its limit lowered by the same 21 MB (`NODE_OPTIONS=--max-old-space-size=4075`) dies in case 31, as does the candidate at the default heap.

## Long-lived real process
A host that imports the Product once is not affected, whether it makes many reads over one store or opens stores in sequence: the retention is per loaded module graph, and each case's store state is released. A host that imports N installed roots keeps N graphs of about 50 MB each.

The stop reading is not on this file's path. The file never calls `run_status` or `projectRunTruthAtDurablePrefix`; the ended-frame fold may be reached through `closure.ts` → `projectRunQuiescence`. The RC12 code diff adds no cache: no `runtimePrefixComputation`, `checkedRecordAtPrefix`, `WeakMap` or `Map.set`.

**300 `run_status` reads** (`status-reads.mjs`): the `t287-readable-stops` operator-stop fixture (`witnessMechanics({operatorRun:true})`), read in-process over one closed store holding the stopped Run. Post-GC heapUsed:

| reads | 0 | 1 | 100 | 200 | 300 |
|---|---|---|---|---|---|
| heapUsed (MB) | 65.95 | 65.96 | 67.29 | 67.21 | 67.31 |

That is about 0.0002 MB per read after a 1.3 MB warm-up, at about 2.4 ms per read. Limit: an operator stop admits no root Result (`lastRootResult` is `not_admitted`), so the carried-value part of the reviewer's hypothesis was not exercised.

## Why the package tests did not catch it
No package changed retention. The file failed only as a whole, in its last case, once the cumulative graphs plus that case's ~0.93 GB peak passed the abort point. Package runs ran their own files, and no test asserts a heap ceiling. In one run under load, base at a 21 MB lower limit failed.

## Split (`1cc747533`)
- `t287-c0-post-publication-failure.test.mjs` keeps its name and holds B04-06, B04-01, B04-02 and B04-03 (16 cases).
- The new `t287-c0-post-publication-failure-owner-admission-close.test.mjs` holds B04-04, B04-05, B04-07 and B04-C01 (15 cases).
- Helpers and `runCase` moved into `test_env/support/c0-post-publication-failure.mjs`. Against the original lines 1–723, the only diffs are the `./` import paths, the dropped `node:test` import and `export` on `runCase`. Titles, options and order are unchanged.
- No case depends on another: each has its own pack, install, store and scratch root.
- The C0 design (`T287_W2_R3_C0_…_DESIGN.md`, formerly l.658 and l.679) names both files.
- `git diff --stat 9e1172ce0 -- . ':!.ai-workspace'` shows 5 files: the two test files, the support module and the two design files (C0, plus D11 below).
- **The qualification preparation step must update** `test_env/qualification/inventory.json` and `recipe/verification-recipe.json`. Support and design files are members there: `root-installed-environment.mjs` and both design files each appear twice in each file.
  - Add two new members: `test_env/tests/t287-c0-post-publication-failure-owner-admission-close.test.mjs` and `test_env/support/c0-post-publication-failure.mjs`.
  - Refresh three changed members: `test_env/tests/t287-c0-post-publication-failure.test.mjs` (recipe l.3822–3823), `design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md` and `design/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md`.
  - Neither file was touched here, nor was `specification/GOALS.md`.
- Candidate build, default heap, instrument:

| file | result | entry to last case | end | per case |
|---|---|---|---|---|
| first | `tests 16, pass 16, fail 0` | 1592.4 MB | 1695.7 MB | 103.6 MB |
| second | `tests 15, pass 15, fail 0` | 1503.3 MB | 1606.6 MB | 104.6 MB |

  That leaves each file about 1.5 GB below the abort point.
- Suite form, both files under one `node --test --test-concurrency=1` at the default heap: `tests 31, pass 31, fail 0` (1275 s).

## Addition: D11 design sentence (`48c8c1afb`)
`design/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` D11, "Run quiescence": the stale sentence is replaced and the bullet rewrapped at 79 columns; the other sentences are unchanged. Checked against `project_read_ports.ts` at `9e1172ce0`:
- "`run_status` omits an ended frame's probe from `holdsAt`" is exact (l.1086, 1094–1095).
- "The liveness read" is not exact: `ABG_PROJECT_READ_MEMBER_KEYS` has no liveness member. `withoutEndedFrames` (l.1061) filters the top-level `nativeLiveness` that the `*_status`, `*_replay`, `*_gaps` and `run_lawful_actions` reads carry (l.1874–1886), so the sentence names those reads. The replay owner's own `nativeLiveness` (`replay.ts` l.1410) stays unfiltered, consistent with the bullet's unchanged replay digests. It was not checked whether a `*_replay` projection also embeds that unfiltered copy.
- "Graph-call status reads as its stopped disposition" holds only when the graph call is neither closed nor holding `graph_call_active` (l.1071–1076), so the sentence states that condition.

No live mirror exists. The A5 register links the file without a digest; the `.ai-workspace/**/stage|source|preimages` copies are historical snapshots. The qualification inventory and recipe list the file (see Split).

## Open findings (Product side, owners not traced)
- **A setup peak of ~0.93 GB per case**, the same at base and candidate. It falls in a case's first ~20 s (pack, `verifyProduct` gunzip, install, imports).
- **About 50 MB retained per loaded Product graph.** It matters only to hosts that import many installed roots. The largest Product-owned part is the `.d.ts` text in `nativeDeclarationEvidence` (11 MB).

## Evidence (scratch `memfix/`)
- `base8`, `cand8`, `base31`, `cand31`, `candx4` (store dropped), `split1`, `split2`, `split-suite`: `.jsonl` and `.tap`.
- `closeonly-*.tap` (`--trace-gc`), `minheap.txt` with `mh-*.tap`, `diff-cand-s2s3.txt`, `status-reads.mjs`.
- `full-base-default.tap`: `tests 31, pass 31, fail 0`.
- `full-base-4075.tap`: `pass 30, fail 1`, `Mark-Compact 4032.8 -> 4025.0 MB`, "Ineffective mark-compacts near heap limit".
- `full-cand-default.tap`: `pass 30, fail 1`, `Mark-Compact 4055.2 -> 4047.4 MB`, the same fatal error.

## Residual risks
- Per-case growth is unchanged. A half fails again only after about 14 more cases, or after roughly 1.5 GB more total retention or setup peak.
- The setup peak and the per-graph retention are pre-existing and untraced. No test bounds them.
- The `run_status` probe did not carry a root Result value. A stopped Run with a large `lastRootResult` was not measured.
