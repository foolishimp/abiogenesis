# T292 composed proof preparation — no execution

Prepared for Root under the T-292 2026-11-13 amendment. Only read-only source acquisition, static input hashing/classification, and this authorized scratch output occurred. No tests, build, provider call, repository/Git write, cut, install, tag, push, or qualification. Shared filesystem; no isolation or independent semantic review claim.

## Activation and immutable subjects

- Product `urn:stdo:product-definition:abiogenesis`, exact Definition `/Users/jim/src/apps/abiogenesis/stdo_abiogenesis.json`, SHA-256 `b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44`; empty composition.
- STDO `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`. `/Users/jim/.local/bin/stdo status --definition ... --verify` and installed `read_basis.py check` report installed/valid/checked, no failures. Bootstrap member digest `9fb337b2c8462e9d6788f52f11ca75199253a3a66a10774bc05a9798a772e502` verified; acquired Minimal activation binding and Results.
- Project frame is `build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`, Proof + historical identity and the material end-to-end interface relations. The packet's shorthand root `design/` does not exist; the Definition selects the tenant path.
- Root must activate the exact final composed source commit/tree and RC13 artifact SHA/manifest/Product/contribution/catalog/capability identities after P6, actual P7+TD25, B08 and B22. Tracking-only HEAD movement is not a new code subject. No moving main is a suite basis.
- Use a fresh detached suite worktree at that exact commit, its own `TMPDIR`, and a physical cloned/copied pinned `node_modules` tree with unchanged dependency byte/link inventory, as in `/private/tmp/abg-post` and P5. Do not symlink `node_modules` to main: TSC can run while the generator correctly rejects require.resolve outside the lexical package root (`@standard-schema/spec`). Do not add `NODE_OPTIONS=--preserve-symlinks`; final proof uses normal Node resolution. This is build-substrate provisioning, not a Product guard change. Existing `/private/tmp/abg-post` remains Root's post-merge lane; do not take it over. Bind/reuse its completed proof only on matching source, environment and population.
- Keep `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace`. Final version, claim, mirrors and payload precede the composed pass (T-292 lines166–173). No per-file rebuild loop.

## Suite population and existing commands

`T` below is the final detached tenant. `OUT` is a new proof output directory outside mutable source. `PREP=/private/tmp/abg-t292-composed-proof-prep`. At activation enumerate and hash every immediate `T/test_env/tests/*.test.mjs`, sorted, plus `test_env/uat/harness.test.mjs`. `suite-paths-pre-final.txt` is navigation only: 223+1 at preparation, not a final frozen population and not the old 201-file count. Freeze the new list and file hashes before launch.

Use the existing serial-file route in the pinned `suite-run.sh` / `post-run.sh`. They hardcode `/private/tmp/abg-suite` / `/private/tmp/abg-post`, lack outer supervision and return success after `DONE` even when a file failed. Do not run either unmodified as the final pass oracle. Their exact child command is:

```sh
TMPDIR="$OWN_TMP" ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace \
  node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap "$file"
```

Run one file per child, serially, saving raw stdout/stderr and exit/signal per file. Do not replace with bare `npm test`: it selects only a subset. The full file list already includes `hello-product-boundary` and `t287-public-groups`; do not count aliases as extra coverage. `test:public-groups` needs its explicit package/baseline inputs; retain its real gate result if absent. Run the separate harness file once. Existing `scripts/node-test-evidence-reporter.mjs` may supply structured case events alongside raw TAP; it is a serializer, not a pass oracle.

Existing required boundary commands, once on this same final build: `npm run lint:imports`, `npm run lint:lifecycle`, `npm run lint:calculus`. `npm run build` belongs to final-worktree preparation if a verified matching build was not supplied. Bare `npm run lint` needs an explicit recipe input; do not invent a new lint population. Add `lint:evidence`/recipe checks only if Root's selected final delivery route requires them, with their exact inputs and separate outcome.

Ensure final membership contains the integrated cross-consumers: `t292-td32-legacy-store-door`, `t292-td32-current-profile-pin`, `t292-td77-recorded-product-truth` (including witnessAdmission), `witness-run-stopped-definition-binding`, `witness-reprice-definition-binding`, `r10-child-proof`, `t287-historical-source-resource`, `t287-cross-cut-public-read`, and P6/P7 refusal/retention files. No additional repeat of those files merely because they are named here. P7 must retain current-register positive execution and old-recorded-only evidence; `ABI5_TD77_EXPECT_RECORDED_ONLY=1` applies to the actual retired register subject only after verifying those D2/S01 expectations. Never apply an experimental register patch/preload.

## Environment and finite process behavior

Construct a clean allowlisted child environment; record names and harmless selected values, never credentials. Preserve normal PATH/interpreter/runtime requirements, private TMPDIR and evidence root. Do not inherit provider opt-ins. Leave unset `ABG_TS_CLAUDE_COMMAND`, `ABG_TS_CLAUDE_APPEND_ARGS`, `ABG_TS_LIVE_CLAUDE_COMMAND`, `ABI5_NATIVE_SELECTION_PROVIDER`, `ABI5_T287_C1_LIVE`, `ABI5_DEFAULT_LIBRARY_LIVE`, `ABI5_AMENDMENT_WITNESS_LIVE`, `ABI5_STEEL03_RUN_LIVE`, `ABI5_STEEL04_RUN_LIVE`, `ABI5_GENERIC_JOB_FULL_NATIVE`, `ABI5_GENERIC_JOB_CORRECTION_NATIVE`, and live testing budget/actor overrides. Select `ABI5_TESTING_MODE=mechanical`; leave `ABI5_TESTING_ALLOW_LIVE` unset. Tests that install their own scripted actor remain mechanical. `ABG_TS_CLAUDE_COMMAND` alone also enables the declared-testing live transport gate; ambient inheritance is unsafe. Audit remaining final-source provider gates before launch; a newly discovered live requirement becomes an explicit unperformed lane, never an automatic dispatch.

`preserved-timeout-map.json` records the exact prior 8 per-file overrides from `BROAD_BINDINGS.actual003.bound-008.json`: required-operation-bindings and c0-post-publication-failure 2,100,000 ms; calculus-state-transfer, management-supervision, default-library, generator-package-reproducibility and release-snapshot-definition-bindings 900,000 ms; harness 1,200,000 ms. Old default 600,000 ms, 8 GiB node heap, 16 MiB output cap, 10 s polling are historical settings, not a new global deadline.

Before launch reconcile the final per-file timeout map, retaining those overrides. New kept files contain 900,000/1,800,000 ms case allowances (`readable-stops`, `readable-stops-foldback`, `default-library-recoverable-failure`, `default-library-reviews`, `single-address-space-consolidation`, `held-basis-lifetime`, `t289-install-event-bodies`, `t292-td26-ps-default-root-mode`); an inherited 600,000 ms outer default cannot silently preempt them. Root's execution activation must bind a finite whole-pass deadline and resolved outer file ceilings. Do not treat the former 114-minute run or old four-hour envelope as a current estimate. A file timeout is failure/incomplete evidence, not permission to raise limits silently.

Reuse the existing UAT `commandRecorder` for bounded child/stdout/stderr receipt mechanics or the existing RC11 `proof-01/proof.py` supervision pattern; neither establishes absence of newly detached grandchildren by group kill alone. Record PID/PPID/PGID ancestry during the command. On failure/timeout: halt launching new files; preserve TAP and request/result, stop only owned helpers/commands by observed exact launch/ancestry, then provider/parent groups if any. TERM with bounded grace, then KILL if needed, and observe absence. Unknown ownership or surviving processes is explicit unresolved cleanup; never broad `pkill`. A tool timeout or Node timeout alone does not prove physical absence. PTY/background execution and progress polls at most 60 s keep Root available.

Per-file evidence: source/tree + built identities, file hash, complete argv/cwd, selected environment, outer timeout, PID/PGID, UTC start/end + duration, raw byte stream hashes, rc/signal, TAP tests/pass/fail/skip/cancelled/todo, reporter completeness and cleanup observations. Missing TAP summary/end, nonzero rc, signal, timeout, output truncation or remaining processes cannot count as pass. Full-suite completion requires every frozen file accounted for; optional skips stay skips. Save first failure, then Root triages; only one exact isolated rerun for a credible load/timing issue or a matched predecessor attribution, never an automatic broad repeat or source repair.

## Exact history populations and comparison commands

`history-populations.json` pins current immutable bytes, stat identity, all original memberships and aliases. Availability: all 139 paths exist, no JSON parse errors, no file changed while read. This was a static JSON scan; no decoder/replay/artifact owner was executed.

| Selection | List entries | Paths | Byte subjects |
|---|---:|---:|---:|
| P5 `replay/replay-logs.txt` | 23 | 22 | 20 |
| P5 `truth/truth-set.txt` | 25 | 24 | 21 |
| TD77 `logs121.txt` | 121 | 121 | 101 |
| Combined / artifact-truth union | 169 memberships | 139 | 114 |

The replay set is contained in the truth union by bytes. P5 truth/TD77 overlap is 6 exact paths and 8 byte subjects; replay/TD77 overlap is 6 paths and 7 byte subjects. There are 150 unique Run IDs across distinct prefixes; they are not 150 separately selected test cases. Keep the complete 139-path map while executing each byte subject once for a byte-only owner probe. Static classification found 22 retired-realization byte subjects and 92 without a selected retired realization. These are preliminary categories, not expected-green counts: predecessor refusals and missing classifications remain possible. In the replay20 population, 2 byte subjects carry retired realizations.

Classification follows actual top-level construction event kinds; retired continuationKind on the two relevant lifecycle events; gap_stop traversal route; the six retired run_stopped dispositions from the P5 refusal file. Text or inactive `actionCatalog`/`constructionComposition` fields inside a recorded Catalog is not a retired execution. P6's steel03 retained-Catalog case must still reconstruct. Preserve owner-classified baseline decode errors, zero-or-one-stop errors and terminal HoldsAt disagreements honestly.

The TD25M 411-log/397-probed/118-decodable report is the earlier capped census and simulation, not a new 411-log campaign. Root selected TD77's existing 121-store population as owed at group close. Actual P7 register withdrawal supplies the changed register; `TD25M_SIM`, `__TD25M_EXPERIMENT__`, simulated preload and old apply_edit.py are prohibited substitutes.

Baseline `BASE_T=/private/tmp/abg-td26p5-work/codex-resume/base-tenant` is the exact held e709bd24f3db37991b892304f7fa369897bba315 predecessor from the P5 Return/Root binding. `baseline-build-pins.json` pins its manifest and relevant compiled owners. Manifest SHA `9a2a599fdc7d296f52b6503e630faa8cbe1571bf2c0cfeb0e0c0d216bd8b79d1`; Product content `sha256:d70a293d9d046c7883298db69a7d9649adf16446db4dd14d67d7468cdf0b8222`. Do not rebuild or overwrite it. Recheck these pins and every input digest before final execution.

For matched before/after use the same pinned probe and exact argument array on BASE_T and final T. Under zsh, read the prepared newline list into an array (no word-splitting/eval):

```sh
replay_logs=("${(@f)$(<"$PREP/replay-bytes.txt")}")
truth_logs=("${(@f)$(<"$PREP/truth-union-bytes.txt")}")
node /private/tmp/abg-td26p5-work/scripts/replay-log.mjs "$BASE_T" "${replay_logs[@]}"
node /private/tmp/abg-td26p5-work/scripts/replay-log.mjs "$T" "${replay_logs[@]}"
node /private/tmp/abg-td26p5-work/scripts/probe-artifact-truth.mjs "$BASE_T" "${truth_logs[@]}"
node /private/tmp/abg-td26p5-work/scripts/probe-artifact-truth.mjs "$T" "${truth_logs[@]}"
```

Give each command its own finite supervised receipt and raw JSONL. The two probes use filename only to load bytes/name output (all selected paths are JSONL); decode, prefix, replay/F_H and artifact truth receive in-memory event values, so byte deduplication is valid here. Both catch owner errors and can exit 0 with refused rows: compare the JSON outcomes, not rc alone. Replay records whole/per-Run replay/state/F_H facts separately from artifact truth. Compare semantic records by byte-subject mapping; exclude only the output `log` alias, never fields of owner truth.

Saved TD77 base/td77d-final scale outputs are byte-identical at SHA `a316495be8d4a0fc0f589118579f247f20b765351094b2cafcb45ff5a9be02c1`, but they do not pin raw log inputs. Default to the matched e709/final commands above; reuse old output only after Root binds exact same input bytes/source/context. The P5 saved four-subject outputs remain focused evidence, not full-population completion.

For the existing four selected Public-read door witnesses, use `/private/tmp/abg-td26p5-work/codex-resume/kept-reads-pair.mjs` with `bounded-logs.txt`, BASE_T and T. It derives each recorded event profile; the older `scripts/kept-reads-pair.mjs` has a current-profile-first defect. This pair probe gives base/final the same temporary path/device/inode, and therefore has physical inputs: retain separate path subjects, never feed its results through byte-only deduplication or claim all 139 physical read paths were exercised. Do not expand it to 139 paths automatically. `probe-lock.mjs "$T" <rc12 copy>` is diagnostic only: after real withdrawal strict lock false/capability mismatch may be correct while recorded artifact truth stays readable. It is not a kept-history acceptance oracle.

Kept replay and artifact truth must remain byte/semantic equal to matched predecessor results, including prior refusal outcomes. For the blocked RC7 read, P5's explicitly allowed output delta is stop.nextActions, trailing guidance and its derived projection identity only; reason/origin/root Result remain equal. Actual retired histories may refuse intentionally. Any other kept discrepancy stops for Root triangulation; do not weaken an oracle or repair in this activation.

## TD67 live UAT is separate

Three amended cases: `js-tenant-test`, `js-sdlc-bootstrap`, `parallel-js`. Required module checks now execute declared Node commands (one, one and three), with process_exit=0 and stdout_exact; their C2 helper budgets are 265500, 265500 and 526000 ms. `test_env/uat/harness.test.mjs` and scripted refusal cases do not supply a live result.

Existing bounded operator route: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/uat/candidate-fd38e8227/operator-config.json` (and `.qualification.json`): recursion12, process3600000, actor idle900000/absolute1200000, maxTurns24, maxBudgetUsd5, no commandTimeoutOverrides. Its old source/package/provider/model are history only, not selected for RC13. The current config.example has provider disabled, recursion1000 and 5h+30/40/60s actor/driver limits. Never run either stale artifact as RC13. The existing runner requires `provider.agent === "claude"`; Codex cannot silently substitute. Root must dispose the exhausted-Claude/provider-budget condition and bind a current operator config; do not launch/model-select here.

After Root supplies the exact RC13 package/config and separately activates the live lane, the existing commands from T are, for each of the three case keys:

```sh
node scripts/sandbox-uat.mjs preflight --config "$CONFIG" --case "$CASE"
node scripts/sandbox-uat.mjs prepare --config "$CONFIG" --case "$CASE"
node scripts/sandbox-uat.mjs run --config "$CONFIG" --case "$CASE"
```

Preflight and prepare use provider-disabled selection for mechanical preparation; they are separate archives and never UAT success. `run` already prepares its own fresh archive, so prepare is a distinct requested discriminator, not a prerequisite to repeat for each live retry. Freeze current scenario/request/checker pins; do not use --all (would select other workloads). A five-hour tests-command override plus new check commands can exceed the configured actor limit: preserve all command IDs and obligations and reconcile the whole budget before activation. No override is needed for the existing bounded operator example. Record each scenario's provider/model/config/package, fresh runtime event log, original oracle, native UAT, CLI result/replay, summary/SEALED and physical cleanup independently.

## Return boundary

No execution has started. Return this plan and pinned pathlists to Root, then stop until explicit final-subject execution activation. Mechanical completion never becomes live UAT, independent semantic acceptance or qualification. RC13 remains local/unqualified; T-293 B21 S2/P2 firmlink repair still blocks reliable-operation and 5.0 qualification claims. No push/pin/tag/publication/cut/install authority follows from this plan.
