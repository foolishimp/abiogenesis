# T292 runner preparation return

Activation `T292-COMPOSED-RUNNER-PREP-01`. This is scratch construction and mechanical inspection only, under the already verified Product Definition/STDO 3.0.4/frame and T-292 amendment. No test, build, history owner, provider, install, repository mutation or Git mutation ran. The host is shared; no isolation or independence is claimed.

`run-composed.py` is the bounded executable route. It reuses the existing serial Node test command, RC11 process/stream receipt pattern, and unchanged pinned P5 replay/artifact-truth probes. It does not install dependencies, build, choose a source/model, repair a failure, or retry. `config.template.json` is deliberately inactive and incomplete.

## Root supplies the final binding

Copy the template separately for `broad` and `history`. For each, supply:

1. `status=ROOT_ACTIVATED_T292_COMPOSED_PROOF`, an exact `activationRef`, matching `phase`, and the frozen runner SHA from `RUNNER_FREEZE.json`.
2. The explicit final detached worktree, full commit and tree; immutable RC13 artifact path/bytes/SHA; the pinned Root artifact/source correspondence receipt; final build pins including its manifest. Build pins must lie in the final tenant. These are explicit source/artifact bindings, not an independent qualification judgment by this runner.
3. A pinned Node executable and explicit PATH. Provision **physical cloned/copied** `node_modules`; supply its inventory with `rows` of relative `{path,kind:"file",bytes,sha256,executable?}` or `{path,kind:"symlink",target}`. The runner checks exact membership, bytes and internal link targets. A symlinked `node_modules` root and escaping internal links refuse. No `--preserve-symlinks` option is admitted.
4. The final population file: `{sourceCommit,sourceTree,files:[{path,bytes,sha256},...]}`. It must equal sorted immediate `test_env/tests/*.test.mjs`, followed by `test_env/uat/harness.test.mjs`, on that exact worktree. Changed members or bytes refuse; nothing is silently added/dropped. The current 225-file audit is **not** the final population.
5. A fresh static timeout audit on the final source, and the complete finite `fileTimeoutMs` map keyed by that population. Set `timeoutPopulationSha256` to the exact population-file digest. Preserve the eight historical floors. Root explicitly resolves any changed dynamic timeout expressions and records the decision in `limitsRuling`.
6. Root has selected one combined six-hour ceiling: `limits.overallMs=21600000`. Supply finite `boundaryMs`, `historyProbeMs`, new separate absolute `outputRoot` and `tmpRoot`, and the other explicit limits. Both mode configs must carry the **same** `campaign` file pin and `campaignId`, created once as below. Preflight and gaps between modes consume this shared budget. The runner refuses to start a child when less than its full selected allowance remains; it never shortens an override to fit.
7. Only genuinely selected read-only fixture variables in `perFileEnvironment`. Its allowlist covers the recorded-only expectation and the existing HS03/HC1/consolidation/public-groups inputs. Set `ABI5_TD77_EXPECT_RECORDED_ONLY=1` only for the actual post-P7 cases that require it. Do not simulate a register change.

A repeatable **static** audit command after C_final is supplied is:

```sh
node /private/tmp/abg-t292-composed-proof-prep/audit-timeouts.mjs \
  "$FINAL_WORKTREE/build_tenants/abiogenesis/typescript" \
  /private/tmp/abg-t292-composed-proof-prep/preserved-timeout-map.json \
  "$NEW_FINAL_TIMEOUT_AUDIT"
```

It parses JavaScript through the pinned tenant's TypeScript parser; it imports no test. The output is create-once. Its `rows` already supply `{path,bytes,sha256}` for the population above. Bind the supplied full commit/tree separately; the tool does not select them. Dynamic formulas are explicit unknowns, not zero-valued conclusions.

## Timeout findings

The current audit has 225 files and three files with dynamic formulas. `timeout-proposal-current.json` resolves those formulas by source inspection and binds each relevant file hash:

- `m5-worker-transport`: six extra ceilings total 159,000 ms; total explicit allowance169,000 ms, retained outer floor600,000 ms.
- `t287-owned-process-lifetime`: physical HTTP62,000 and capture51,000 ms; total explicit123,000 ms, retained outer floor600,000 ms.
- `t287-worksite-command-execution`: ordinary unset-config arm180,000 plus five180,000 cases; total1,080,000 ms, proposed outer1,200,000 ms.

Other notable conservative totals: readable stops3,600,000 ms → outer3,720,000; readable foldback1,800,000 →1,920,000; recoverable failure3,600,000 →3,720,000; default-library reviews1,200,000 →1,320,000. The amendment-witness proposal is11,820,000 ms because it sums declared allowances, including its live-gated case. Live-gated ceilings are retained conservatively in these proposals, **not activated**. These are ceilings, not timing estimates. Untimed tests still require the independent finite outer policy. Root can settle more precise ceilings from the selected gates; old historical overrides cannot be lowered by this runner.

## Exact later invocation

Complete the source/artifact/population/limits bindings first. Immediately before actual composed execution, Root creates the one campaign clock at a new absolute path whose parent already exists:

```sh
python3 -B /private/tmp/abg-t292-composed-proof-prep/run-composed.py campaign-start \
  --campaign-path "$CAMPAIGN_CLOCK" --campaign-id "$CAMPAIGN_ID" \
  --root-ruling "Root: T292 one 21600000ms combined suite/history/physical-read ceiling; no extension or retry"
```

This create-once command emits the clock's exact `{path,bytes,sha256}` pin and campaign ID. Copy those same values into both inactive configs, then freeze/authorize each completed config hash. No campaign clock has been created during preparation. Never recreate or replace it after failure, delay or restart.

The clock records `startMonotonicNs`, `deadlineMonotonicNs=start+21600000*1000000`, and the same-host Darwin boot-session UUID, hostname and clock implementation. Each phase checks the pinned bytes, exact interval, current host/boot/clock, and `start <= now < deadline`. UTC is receipt time only. Both phase invocations consume the stored absolute monotonic deadline; neither computes a fresh six-hour interval. The baseline pins are validated before either phase launches any production command. The full per-file allowance check and eight preserved floors remain unchanged.

After Root authorizes each exact completed config hash, run serially, stopping after the first failure:

```sh
python3 -B /private/tmp/abg-t292-composed-proof-prep/run-composed.py broad \
  --config "$BROAD_CONFIG" --config-sha256 "$BROAD_CONFIG_SHA256"
python3 -B /private/tmp/abg-t292-composed-proof-prep/run-composed.py history \
  --config "$HISTORY_CONFIG" --config-sha256 "$HISTORY_CONFIG_SHA256"
```

Use distinct output/TMPDIR paths and one owning driver at a time. Launch through a background/PTY tool; it reports progress at most every30s while a child is running. Observe/poll at no more than60s between Root updates. The template refuses before any source/process work until its activation fields are supplied. No command above was invoked for production proof in this preparation.

## What runs and what the result means

**Broad:** the exact import, lifecycle and calculus scripts, then every frozen file once using `node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap`. The explicit8GiB heap allowance changes no module resolution. Each file has complete stdout/stderr bytes, hashes, selected command/environment/timeout, PID/PGID observations, UTC start/end, exit/signal, and parsed TAP counts/skip lines. A missing TAP frame/count, failure/cancellation/todo, nonzero exit, signal, timeout, output overrun or required cleanup stops before the next file. Skips remain distinct from passes. Lint source remains pinned by the final Git source; no bare recipe-less `npm run lint` is added.

**History:** exact pinned139-path inputs are verified, then byte-only input copies are staged outside source.20 replay byte subjects and114 artifact-truth byte subjects each receive matched e709/final owner probes, one pair at a time. Existing probes take filename only to load bytes/name output; runtime owners receive in-memory event values. Original path memberships remain in the output. A zero process exit is not owner success. Comparisons distinguish equal owner results, equal prior refusals, specific realized-retirement refusals, and unexpected differences. The latter stops immediately. The preliminary22/92 classes are not expected-green counts. Retired messages must correspond to actual event realizations; inactive Catalog fields never establish retirement. Unexpected owner shapes/errors require Root triage, not a broadened whitelist.

**External outstanding physical owner reads:** the existing four witnesses are not covered by the byte-only history mode or its `FINAL.json`. Their path/device/inode inputs prevent byte deduplication. Root must run the existing command below under its owned-process command recorder, joining the **same pinned campaign clock and absolute deadline**, after validating its clock/host/boot and the baseline/route/input pins. Select a finite physical-read allowance and require the full allowance to remain before launch. Enforce the same absolute deadline, preserve raw streams and owner results, and perform bounded cleanup only for observed owned processes. No separate six-hour timer or automatic extension is permitted. If no time remains, record the four witnesses unperformed.

Exact existing probe argument selection (zsh; this is the command for that external supervisor, not an unsupervised launch instruction):

```sh
physical_logs=("${(@f)$(</private/tmp/abg-td26p5-work/codex-resume/bounded-logs.txt)}")
env -i HOME="$HOME" PATH="$PROOF_PATH" TMPDIR="$PHYSICAL_TMPDIR" \
  ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace \
  "$PINNED_NODE" /private/tmp/abg-td26p5-work/codex-resume/kept-reads-pair.mjs \
  /private/tmp/abg-td26p5-work/codex-resume/base-tenant \
  "$FINAL_WORKTREE/build_tenants/abiogenesis/typescript" "${physical_logs[@]}"
```

`route-pins.json` binds the corrected probe and four-path list; retain all four physical subjects. That digest-summary probe cannot itself verify the exact allowed blocked-RC7 field deletion, so a differing status digest still requires Root's owner-field comparison. Do not claim139 physical owner reads. Live TD67 UAT is also outside these mode results and remains separately activated after Root's provider/budget disposition.

**Process boundary:** children start in a fresh process group. The runner samples PID/start-time/PPID/PGID ownership and logs observed descendants. Cleanup signals only observed owned identities, children before parent, with finite TERM/KILL grace. It stops if observation/cleanup is unresolved. Polling can miss an immediately detached/reparented child; the receipt states this limitation and never equates direct-child exit with universal physical absence. No broad process-name kill is used.

`FINAL.json` means only that phase's selected mechanical population completed within the shared clock; it explicitly leaves the four external physical witnesses outstanding. `HALT.json` preserves completed results and leaves the remainder unperformed. Neither means live UAT, semantic acceptance or qualification. RC13 remains local/unqualified; B21 still blocks reliable-operation/5.0 qualification claims.
