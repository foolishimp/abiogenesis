# RC12 live amendment witness: how to run it

Prepared by package X. The live case has not been run. No provider call has been made.

**Subject.** The local unqualified candidate `5.0.0-rc.12`, cut from commit `95da94e725c709b8307b125f20f350861fc1e8a3` (tree `b1586e3c6fb0b553105db7989f10990bb8918f0a`) on `claude/rc12-integration`.
- Archive: `/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.12/abiogenesis-typescript-tenant-5.0.0-rc.12.tgz`, sha256 `db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca`, 11,062,933 bytes, 5,327 members.
- Install host: `/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12`; installed root `node_modules/@abiogenesis/typescript-tenant` below it.
- Records: `CUT_RECORD.json`, `INSTALL_RECORD.json` and `INSTALLED_OWNER_SMOKE.json` in the release directory.

## Variables

```sh
W=/private/tmp/abg-rc12-consensus-20261111
T=$W/build_tenants/abiogenesis/typescript
X=$W/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01
AS="$HOME/Library/Application Support/ABIogenesis"
R="$AS/releases/5.0.0-rc.12"
E=$W/qualification-scratch/rc12-executive-01/demo
mkdir -p /private/tmp/abg-demo-tmp
```

- Build T at the cut commit (`cd $T && npm run build`). The harness imports T's own `build/` for its helpers, and `product.ABI5_PRODUCT_ID` comes from there. The commits after the cut on `claude/rc12-integration` change only `.ai-workspace/`, so T at the branch head is T at the cut commit.
- `qualification-scratch/` is not gitignored. Leave it uncommitted.
- Every evidence file is written with the `wx` flag, so each attempt needs a new directory (`live-01`, `live-02`, …).
- `ANTHROPIC_MODEL` must be unset or equal `claude-opus-5-5`. A different value makes the recorded actor identity `model_environment_conflict`.

## Provider (`demo/provider.json`)

- Executable `/Users/jim/.local/share/claude/versions/2.1.322`, the newest under `versions/`. Version `2.1.322 (Claude Code)`; sha256 `a9d23794…eb180a3450`. The test asserts this digest before it runs.
- `appendArgs` is `--model claude-opus-5-5 --effort high`. `--help` lists both flags, and `--effort` accepts `low|medium|high|xhigh|max`. The model string occurs in the executable.
- The transport already passes `-p --disable-slash-commands --no-session-persistence --output-format stream-json --include-partial-messages --verbose --permission-mode bypassPermissions`. Per lane it may add `--tools …`, `--append-system-prompt …`, `--safe-mode` or `--json-schema …` (`transport_contracts.ts:439-449`, `:532-539`; `actor_process.ts:1059`).
- Neither appended flag is protocol-owned (`TRANSPORT_PROTOCOL_OWNED_FLAGS`). `high` is not selector-shaped. Exactly one `--model` therefore establishes the configured actor identity.

## Which artifact the live case executes

**By default, a fresh pack of T, not the cut archive.** `runWitness` calls `setupInstalledRootCatalog`, which runs `npm pack --ignore-scripts` in T and installs that pack into scratch (`test_env/support/root-installed-environment.mjs:185-207`). At the cut commit, the worktree pack made by `scripts/refresh-candidate-basis.mjs` had the cut archive's digest. Nothing in the default route asserts that equality on a later run.

**Cut archive (frozen route).** The harness supports this route; use it to execute exactly the cut.
- Set `ABI5_WAVE1_FROZEN_ARTIFACT_PATH`, `ABI5_WAVE1_FROZEN_INSTALL_HOST` and `ABI5_WAVE1_FROZEN_ARTIFACT_SHA256` (`root-installed-environment.mjs:30-55`).
- The harness then:
  - imports the bootstrap owners from `<install host>/node_modules/@abiogenesis/typescript-tenant`, which is where `install-local-rc12.mjs` places them (`:102`);
  - asserts that the archive's sha256 equals the given digest (`:223`);
  - installs that archive into its own scratch.
- It writes nothing under the install host.
- **Verified without a provider call** at `95da94e72`. The three variables below were set, the live gate was unset, and `--test-name-pattern '^a task that omits a review its Program names'` selected one scripted case of `t287-amendment-witness.test.mjs`, which uses the stand-in actor.
  - With the cut digest: 1/1/0/0.
  - With an all-zero digest: 1/0/1/0, failing with "frozen artifact digest differs from the authorized subject". That assertion exists only on the frozen route.
  - The install host's file inventory (`c80bfef4…`, 5,330 rows) was identical before and after, and no file under it was newer than a marker set before the runs.

## Live case (from T, frozen to the cut)

```sh
cd $T && \
ABI5_AMENDMENT_WITNESS_LIVE=1 \
ABI5_AMENDMENT_WITNESS_EVIDENCE_ROOT=$E/live-01 \
ABI5_NATIVE_SELECTION_PROVIDER=$X/demo/provider.json \
ABI5_WAVE1_FROZEN_ARTIFACT_PATH="/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.12/abiogenesis-typescript-tenant-5.0.0-rc.12.tgz" \
ABI5_WAVE1_FROZEN_INSTALL_HOST="/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12" \
ABI5_WAVE1_FROZEN_ARTIFACT_SHA256=db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca \
ABG_TS_FP_TIMEOUT_MS=300000 ABG_TS_FP_ABSOLUTE_TIMEOUT_MS=1800000 \
TMPDIR=/private/tmp/abg-demo-tmp \
node --experimental-vm-modules --test --test-concurrency=1 --test-name-pattern '^live:' \
  test_env/tests/t287-amendment-witness.test.mjs
```

- `--test-name-pattern '^live:'` skips the 12 offline cases, about 15 minutes.
- To run the packed worktree instead of the cut, drop the three `ABI5_WAVE1_FROZEN_*` lines. The Run then executes an unidentified pack, not rc.12.
- The CLI child receives `{...process.env, ...actorEnvironment}` (`amendment-witness-run.mjs:58`), so the two `ABG_TS_FP_*` limits reach `selectedWorksiteCommandExecutionLimits` (`actor_process.ts:713`). The actor process keeps the parent environment except the `CLAUDE_CODE_SSE_`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_EXECPATH` and advisor keys, so credentials reach it.
- The test writes the following under `$E/live-01`:
  - `provider.json`, `amendment.json`, `process-definition.json`, `input.json`, `derivation.json`;
  - `events.json`, `receipt.json`, `actor-calls.json`, `measures.json`;
  - `stdo-coverage.md`, `worksite-result/`, `outcome.json`.
- It passes only on a `completed` disposition with every review standing.

## Bare-CLI comparison (from T)

```sh
cd $T && TMPDIR=/private/tmp/abg-demo-tmp \
node test_env/uat/amendment-witness-bare-cli.mjs /Users/jim/.local/share/claude/versions/2.1.322 \
  --out $E/bare-cli-01 -- \
  -p '{prompt}' --output-format stream-json --verbose \
  --permission-mode bypassPermissions --model claude-opus-5-5 --effort high
```

- Arguments after `--` replace the script's defaults (`-p {prompt} --output-format stream-json --verbose`). The command therefore repeats them and adds the model and effort.
- `--permission-mode bypassPermissions` matches the governed transport. Without it, a `-p` run may be refused every write.
- The bare CLI uses no cut artifact. It runs one observation on a copy of the seed, then the same test commands and the deterministic rubric readers, and writes `measures.json` under `--out`.
