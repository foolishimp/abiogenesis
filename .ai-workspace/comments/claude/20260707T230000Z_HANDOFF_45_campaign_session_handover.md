# Handoff: 4.5 Campaign Session Handover

**Status**: handoff commentary
**Date**: 2026-07-07
**Scope**: everything a fresh session needs to continue the 4.5 line
without rediscovery. Read top to bottom before acting.

## 1. Mission state (one paragraph)

The 4.5 outcome bar is a clean data-mapper run: odd_glc's software-build
overlay drives live workers to build the CDME data mapper from
specification through spec → code → test → repair → green. Run 18
CONVERGED (26/26 vectors closed by replay; 8 Scala modules; 24/24
subject tests green) on a dev-refreshed substrate — the outcome exists
but is not citable as release proof. Run 19 (pristine rc.3) proved the
repair loop on a real defect (0 → 14/20 tests after workers fixed their
own Scala bug) and is parked at vector 22. The remaining bar from
GOALS: one clean run that converges THROUGH a live upstream re-entry
(`graph_reentry_applied`), which no run has yet fired. Every known
blocker to that has been fixed and unit-pinned since run 19 parked.

## 2. Immediate next actions, in order

ADJUDICATED 2026-07-07 (do not re-litigate): F5 is PRESENT at repo HEAD
(0b117d4; direct probe through both drivers: threw=false,
typedTruth=true) and ABSENT from the deployed rc.3 toolchain product
(cut at b717486, before F5). A probe against the installed product or
any rc.3-pinned workspace correctly shows the throw escaping. This is
release lag, not a code gap — and it makes step 1 MANDATORY before any
campaign run.

1. **Cut 4.5.0-rc.4** in abiogenesis (bundles the post-rc.3 fixes:
   F4 gate narrowing, F5 consequence-throw guard, F6 typed
   closureFailureClass, F7 batch-safe attempt identity). Battery is
   already 1138/1138 at HEAD. Ritual in §5.
2. **Repin odd_glc** to rc.4 (three files, §5 step 6).
3. **Launch run 20 fresh** on rc.4 (§6). Expected arc: descend → repair
   loop → if repaired execution fails, durable pressure survives into
   the consequence → FIRST LIVE `graph_reentry_applied` → re-descend
   from the code vector → converge → proof json written (P0 fix's
   witness). This one run can close: the citable clean run (T-195),
   the GOALS re-entry bar, and the proof-path witness.
4. **If vector 22 blocks again** with "required prior admitted output is
   missing or stale": that is `payload_ledger.ts:1170`
   (instruction causal context; staleness over required prior admitted
   outputs). Diagnose via the last `instruction_causal_context_bound`
   event's `missingInputRefs` for v22 in the run's events.jsonl. It may
   have been an artifact of run 19's pre-fix churn (v21 closed with
   failing evidence + no re-entry); a clean run that re-enters at 12
   before reaching 22 may never produce it.
5. **After the witness**: T-205 closure record; T-195 close; then the
   user decides the 4.5.0 final cut.

## 3. Repos and authority

- `/Users/jim/src/apps/abiogenesis` — ABI: GTL language + ABG engine.
  TS tenant at `build_tenants/abiogenesis/typescript`. Battery:
  `npm run build:semantic` then `npm run test:semantic` (1138/1138).
- `/Users/jim/src/apps/odd_glc` — downstream lifecycle framework. TS
  tenant at `build_tenants/odd_glc/typescript`. Suite: `npm test`
  (57/0; live rows skip without env).
- Bug-fix law: fix in the OWNING repo. The framework is responsible for
  making the data mapper work — never hand-patch the data-mapper
  workspace or scenario outputs to force a pass.
- Both repos: STDO governance; tickets in `.ai-workspace/tickets/`;
  commentary in `.ai-workspace/comments/claude/`. This work rides
  T-205 (ABI) and T-030 (odd_glc).

## 4. The one big file

`odd_glc/build_tenants/odd_glc/typescript/test/glc-software-build-overlay-live.test.mjs`
is scenario data + the generated-binding TEMPLATE + the live lane + the
binding unit lane, ~4900 lines. Critical structure:

- Lines ~1514–4396 inside `runtimeBindingSource()` are a TEMPLATE
  LITERAL. Everything there is emitted into the workspace binding
  (`instance/.abiogenesis/typescript-runtime.mjs`). ESCAPE DISCIPLINE:
  `\`` and `\${` emit literally; `\\n` in the template emits `\n` in
  the binding; an unescaped `${...}` interpolates at GENERATION time
  (test scope). This class bit four times (#15, #10b, catalog splice,
  P1b newline). The unit lane now catches it: generation-fidelity test
  runs `node --check` on the generated binding + greps mangling
  signatures.
- The binding EXPORTS pure surfaces for the unit lane:
  `normalizeExecutionPlanShape` (#14 plan shape family),
  `attributeCompileErrorLines` (#18b block-level attribution),
  `resolveRepairReentryTargetRow` (name-derived re-entry target),
  `expandEnvTemplates` (#10b env expansion),
  `readRepairReentryState`/`writeRepairReentryState` (P1b durable
  pressure). Extend the lane when touching template logic.
- Scenario stage plan indices (data-mapper-full): 12 derive_code_surface,
  14 derive_component_test_surface, 16 derive_test_execution_result,
  18/19 repair schedule/apply, 20/21 repaired prep/result,
  22 qualify_repaired, 25 prepare_release. 26 vectors total.

## 5. The release ritual (proven 3×: rc.1, rc.2, rc.3)

In `abiogenesis/build_tenants/abiogenesis/typescript`:

1. Bump `package.json` version. Rewrite
   `docs/ABIOGENESIS_RC_RELEASE_NOTE.md` — it is a SINGLE-CURRENT note
   (new version's note atop, prior content follows); note version must
   equal package version (witness-enforced). Sweep docs for the old
   version string (README.md, docs/README.md, docs/*.md, CLAUDE.md,
   AGENTS.md).
2. `npm run build:semantic` (0 errors) → commit (pre-cut commit).
3. `npm run snapshot:release` → produces
   `release_snapshots/abiogenesis-typescript-tenant/<version>/`
   (tarball + release-snapshot-manifest.json; manifest must show
   sourceDirty=false). Copy dir over `latest/`. Commit (cut commit) —
   record tarball sha256 + manifest sha256 in the message.
4. Deploy: extract tarball to scratch; `npm install --omit=dev` inside
   `extract/package`; then
   `installAbiogenesisTypescript({ targetRoot, packageSourceRoot: extract/package, standardsSourceRoot: /Users/jim/src/apps/specification_methodology/specification/standards, docsSourceRoot: abiogenesis/docs, installedPackageName: "@abiogenesis/typescript-tenant", toolchainRoot: /Users/jim/src/apps/.abg-toolchains/abiogenesis-typescript-tenant })`
   via `node --input-type=module` importing from the repo's
   `build/semantic/code/src/app/m04/index.js`.
5. `productToolchainManifestDigest` = sha256 of the deployed
   `products/abiogenesis/<version>/product-toolchain-manifest.json`.
6. Repin odd_glc: swap version + sourceCommit + snapshotCommit +
   tarball sha + manifest sha + toolchain digest in
   `build_tenants/odd_glc/typescript/substrate.provenance.json`,
   `test/route-one-interpretation.test.mjs`,
   `test/glc-hello-world-sandbox-port.test.mjs`. Run suite, commit.

rc.3 reference values (current pins): sourceCommit
`e3e82f343371297cccd4c3de75f7c938b4bb4012`, snapshot `b71748645fa4...`,
tarball `db1289696f37c464...`, manifest `0130ce69d17fc0af...`,
toolchain `bbcfb03806cf9efb...`.

## 6. Running the campaign

Fresh launch (from `odd_glc/build_tenants/odd_glc/typescript`):

```
PATH="$HOME/bin:$PATH" CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=codex \
ABG_TS_CODEX_MODEL=gpt-5.5 ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal \
ODD_GLC_LIVE_SCENARIO=data-mapper-full ABG_TS_LIVE_TIMEOUT_MS=1200000 \
npm test
```

Resume: add `ODD_GLC_LIVE_RESUME=<runRoot>`. Resume regenerates the
binding (carries binding fixes into the run) and now VERIFIES the
workspace's scenarioId matches (F3). Run roots live under
`test_runs/glc_software_build_overlay_live/data-mapper-full/<stamp>/`.

Monitoring a run:
- events: `<runRoot>/instance/.ai-workspace/events/events.jsonl` —
  watch `vector_closed` count, `graph_reentry_applied` (the re-entry
  witness), `terminal_reached` (terminalKind + reason).
- worker artifacts: `<runRoot>/instance/.ai-workspace/glc-software-build-live/data-mapper-full/`
  (`vector-N[-attempt-M]-{artifact,transport,stdout,stderr,output,instruction-manifest}`)
  — frontier = highest vector-N present.
- subject truth: `<runRoot>/instance/build_tenants/scala_spark/` —
  `TEST-*.xml` reports; 8 modules; expectedTestPassCount 20.
- durable re-entry state (P1b):
  `<runRoot>/instance/.ai-workspace/glc-software-build-live/repair-reentry-state.json`
  ({pressure, reentryCount}; budget REPAIR_REENTRY_BUDGET=2).

T-163 law: the workspace's `toolchain-binding.json` pins the run's OWN
toolchain product. SPLIT-SUBSTRATE LESSON: on resume, the lane default
CLI may resolve to the SHARED toolchain while the workspace pins the
run's product. For dev-substrate resumes, align BOTH with env:
`ABG_TYPESCRIPT_TENANT_INSTALL_ROOT=<runRoot>/toolchain/products/abiogenesis/<v>`
and `ABG_TYPESCRIPT_TENANT_ROOT=<that>/lib/node_modules/@abiogenesis/typescript-tenant`,
after rsyncing the repo `build/` into that product's package `build/`.
Prefer clean cuts over dev refreshes for citable runs.

## 7. Architecture laws the fixes encode (do not regress)

- **Strict F_D**: F_D gates judge mechanical envelope truth; truthful
  FAILING evidence is an acceptable derivation; ROUTING owns pass/fail.
  Stage 21's F_D gate and F_P evaluator both accept truthful failure;
  the consequence routes (re-entry to code vector on fail).
- **Stage-14 compile gate attributes errors**: src/main errors =
  upstream evidence (accept; repair stages own main code); src/test or
  unattributable = block (the stage's own obligation). Attribution is
  BLOCK-level (scalac continuation lines inherit the file's
  attribution) and sees ALL error lines (cap only on excerpts).
- **Re-entry**: consequence plugin (in the binding) reads durable
  pressure; emits `consequence_traversal_action` (actionKind
  reenter_graph_span, family depth_traversal, reentryTargetRef
  `graph-reentry-point://realization/<index>`). Engine landing
  validates ONLY reentryTargetRef parse + index-in-basis + function
  match (`parseConsequenceReentryTarget`, engine_runner). Declared
  families: `abg.consequence.allowed_traversal_families` on the
  bootstrap function. A routing plugin must NEVER throw (guarded; and
  ABI F5 converts consequence-plugin throws to typed blocked truth).
- **HoG**: declarations `abg.hog_program_catalog` (lean/deep) +
  `abg.hog_program_ladder` (lean@1, deep@2) govern per-attempt program
  selection; run 18 proved {lean:76, deep:19} live. One seam:
  `hog_program_resolution.ts`.
- **Attempt identity is replay-global** at both layers: spine
  (`nextCCallAttempt`) and invocations (max attemptIndex + 1, F7).
- **Null-basis runtime_failure_observed** (CLI observability) is
  tolerated by projection (#17) — never poison a workspace log.
- **Retry lane**: pre-spawn dispatch failures classify from the TYPED
  `closureFailureClass` (F6; prose parse is fallback); inspect-gate
  exceptions require the pre-spawn signature (F4).

## 8. Standing user constraints (durable)

- ONE agentic writer per repo set — this session writes; codex sessions
  EVALUATE ONLY (findings, never edits). Adjudicate codex findings
  against HEAD before acting (their last round was 40% stale).
- Resolve review findings before continuing the campaign.
- Resume, never restart, unless the substrate change requires a fresh
  run for citability.
- git: stage EXPLICIT paths only (never `git add -A`; a codex session
  once polluted history).
- No time estimates. Sequencing, dependencies, decision points only.
- Writing: plain complete sentences; claim then reason; no filler.
- Commit trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 9. Open items beyond the critical path

- USER'S four board rulings (asked, unanswered): T-195 acceptance
  refresh citing the GOALS 4.5 bar; odd_glc consolidation (T-025/T-026
  → T-030, T-027 → backlog, T-029 closure-check); B-010
  close-as-superseded; Python T-092/094/095 dormant parks.
- T-205: campaign ledger #13–#21b + both review rounds are recorded on
  the ticket; closure record after the run-20 witness.
- Named gaps with phase owners: FpTransportConfig.prompt re-home
  (HANDLERS-015 transitional gap); extra-stage F_H
  escalate→approve→resume differential; live traced-process spawn
  through a handler; live declared-bindings row.
- F8/F9 lows from the self-review (accepted residuals, recorded in
  `.ai-workspace/comments/claude/20260707T210000Z_REVIEW_overnight_campaign_fixes_self_review.md`).
- Disk: ~65GB free after the overnight sweep (odd_sdlc test_runs 54GB,
  ABI t167/t168 replay dirs, old campaign sandboxes removed; the t159
  frozen-live fixture was deliberately LEFT).
- Backlogged by user: intent-generation as higher-order observer
  network; T-206 consciousness/tuner phase D (post-4.5).

## 10. Where the full record lives

- Memory (auto-loaded next session):
  `~/.claude/projects/-Users-jim-src-apps/memory/project_t200_heart_of_gold.md`
  — the campaign ledger, run-by-run.
- Strategy: GOALS.md Current Wave (ABI) — the 4.5 definition, scope
  rulings, iteration bar (upstream re-entry REQUIRED for functional
  4.5), phase plan.
- Reviews: comments/claude/ 20260707T210000Z self-review; this handoff.
- Releases: `docs/ABIOGENESIS_RC_RELEASE_NOTE.md` (single-current);
  `release_snapshots/abiogenesis-typescript-tenant/{4.5.0-rc.3,latest}`.
- Run 18 root (converged, dev-substrate):
  `.../data-mapper-full/20260706T161940470Z_pid14176`.
- Run 19 root (pristine rc.3, parked at v22):
  `.../data-mapper-full/20260706T175931324Z_pid68162`.
