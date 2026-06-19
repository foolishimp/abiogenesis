# odd_sdlc TypeScript RC Qualification Report

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-024, REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-041, REQ-F-ODDSDLC-043
**Derives From**: `specification/requirements/13-odd-sdlc-typescript-tenant.md`, `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `.ai-workspace/tickets/completed/T-038-qualify-odd-sdlc-typescript-rc-against-python-functionality-and-odd-scenarios.md`
**Blocker Map**: `build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_PYTHON_PARITY_RC_BLOCKER_MAP.md`
**Archive Comparison**: `build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_LIVE_PYTHON_ARCHIVE_COMPARISON.md`

## Retired RC Blocker Context - 2026-05-10

The earlier bounded package-surface claim remains historical proof. The older
T-041/B-085 full operational RC blocker path is now retired/superseded; current
feature-gap closure is governed by the test35 uplift sequence in
`specification/GOALS.md`, T-004, and T-002.

The historical live `data_mapper` replay stopped at
`derive_release_depth_parity_surface` with vectors `0-30` closed. The current
finding was not PTY, ABG traversal, or parser/runtime truth; it was missing
admitted pass evidence after a generated Scala test compile failure in
`DiagnosticsFinalizeSpec.scala`.

That evidence remains useful historical context, but it no longer controls the
current ticket wave.

Retired control tickets:

- `.ai-workspace/tickets/completed/T-041-realize-typescript-full-operational-python-replacement-rc-lane.md`
- `.ai-workspace/tickets/completed/B-085-consume-component-repair-schedule-for-generated-scala-test-compile-failure.md`

## Verdict

The TypeScript tenant's older full operational RC lane is retired as a current
control surface.

The TypeScript tenant was previously qualified for a bounded ODD-native package
claim.

That claim includes strict build, graph publication, pure workspace ingress,
read/query projections, public ABG handoff, hook contracts, traceability
closure, triage routing, operational command/result projection, and a composed
harnessed scenario proof. T-058 adds a bounded public CLI adapter over those
same surfaces. The current TypeScript sandbox lanes are also populated through
the public ABG TypeScript installer and archive install manifest plus installed
command evidence. T-053 adds one live external `F_P` `data_mapper` traversal
proof over the same public ABG-installed workspace and hook admission path.
T-059 adds package-backed install/normalize and release-cut/binary evidence.
T-064 adds the first installed operator UX proof over the independent
`data_mapper.test46.ts` workspace: installed `gaps`, installed `start`,
Codex worker invocation through `process://codex`, materialized asset/report,
ABG-compatible event ingestion, archive postmortem, and replay-derived advance
to the next graph edge. T-065 adds cold-agent STDO/STDO-UX bootstrap
provenance to installed instruction and manifest surfaces.

That claim does not yet replace the Python tenant as the full side-effecting
`odd_sdlc` CLI/application if that bar includes Python's historical multi-edge
`data_mapper` qualification depth. `data_mapper` is an independent
qualification workload, not `odd_sdlc` product scope.

## Gate Results

- `npm run test:t038`: proves the composed harnessed sandbox path across
  ingress, query/start, hook evidence, requirement closure, triage route, build
  result admission, and runtime-return observation.
- `npm run test:sandbox`: proves current sandbox lanes create ABG-populated
  installed workspaces through the public TypeScript installer, archive install
  manifest evidence, and fail closed if a sandbox omits the installed-workspace
  fixture.
- `npm run test:t058`: proves the bounded `odd-sdlc-ts` public CLI adapter over
  graph catalog, query-domain, gaps, start, and RC-report carriers.
- `npm run test:t059`: proves TypeScript install/normalize, ABG runtime
  installation, installed command execution, and release-cut package/binary
  evidence through public package surfaces.
- `npm run test:t064`: proves installed operator UX from `gaps` through
  `start --worker`, worker report admission, event append, compact CLI output,
  and replay-backed next-edge projection.
- Independent installed live proof over
  `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test46.ts`:
  `node_modules/.bin/odd-sdlc-ts start --workspace . --target next --until blocked --worker process://codex`
  produced archive
  `.ai-workspace/runtime/odd_sdlc/operator-runs/20260427T082235364Z_pid60375/`,
  elapsed `132267.333292 ms`, emitted
  `graph_call_opened -> frame_opened -> vector_traversal_planned -> assessed -> assessed`,
  wrote `intent_surface.md`, and advanced replay to
  `derive_product_surface`.
- Installed bootstrap provenance proof: refreshed `data_mapper.test46.ts`
  contains STDO alias and first-missing-layer governance in `AGENTS.md`,
  `CLAUDE.md`, `.ai-workspace/context/odd_sdlc_typescript_bootstrap.md`,
  `.abiogenesis/odd_sdlc/typescript/install-manifest.json`, and
  `.ai-workspace/runtime/odd_sdlc-typescript-installation.json`.
- `ODD_SDLC_TS_LIVE_FP=1 npm run test:live`: proves a live external Codex
  `F_P` worker dispatch against the real `data_mapper.template`, from an
  ABG-installed workspace, with returned generated asset admission through the
  TypeScript hook contract. Latest accepted local archive:
  `build_tenants/typescript/test_env/test_runs/t053_live_data_mapper/20260426T183216072Z_pid7194/`.
- `npm run test:semantic`: proves the full required TypeScript semantic lane.
- `npm run lint:semantic`: proves the strict lint lane.
- `npm run test:reference:data-mapper`: proves optional local comparison
  against the repo-local `data_mapper.template` reference fixture.
- `ODD_SDLC_TYPESCRIPT_LIVE_PYTHON_ARCHIVE_COMPARISON.md`: compares the current
  TS live data_mapper archive against Python live code-edge and Python
  data_mapper yield-chain archives.

## Python Comparison

Install and normalize:

- Python owns side-effecting install and workspace normalization.
- TypeScript owns pure ingress, source-input admission, project constraints,
  imported requirement authority, bootstrap lineage, ABG-populated installed
  sandbox proof over the public ABG M05 archive API, and a package-backed
  install adapter that writes install, normalization, and bootstrap surfaces
  without overwriting project `WHAT`.
- Status: closed for the current TypeScript package-backed install claim by
  `T-052`, `T-059`, and `T-063`.

Start:

- Python owns installed-workspace public start.
- TypeScript admits one public boundary, resolves graph-function and asset
  targets, constructs an ABG `ExecutionBasis`, requires worker attachment for
  `F_P`, refuses tenant-local continuation, and exposes the bounded adapter
  through `odd-sdlc-ts start`.
- Status: bounded parity with CLI adapter.

Gaps and query:

- Python owns query, gap dossier, and span analysis read models.
- TypeScript publishes read-only query, gap, dossier, span, start-target, and
  ownership surfaces from admitted module and ABG replay truth.
- Status: bounded parity.

Triage:

- Python owns broad triage and homeostatic loop behavior.
- TypeScript splits observation, classification, route binding, repricing
  proposal, ticket work-item route, and loopback retirement. Ticket writing
  remains under `TICKET_METHOD`, not hidden triage code.
- Status: bounded parity.

Constructors and evaluators:

- Python owns real asset generation and deterministic checks.
- TypeScript owns hook contracts, preflight/postflight `F_D`, `F_P` work-report
  admission, generated-asset authority, and ambiguity preservation. T-053 proves
  one live external `F_P` `data_mapper` generated asset admitted through this
  path.
- Status: bounded parity with live `F_P` proof.

Traceability:

- Python owns traceability indexes, reports, and requirement closure.
- TypeScript owns lineage ledger, closure register, and repair frontier.
  Trace-only proof remains partial and unresolved requirements remain active
  pressure.
- Status: bounded parity.

Operational return:

- Python owns cooperative operational dispatch.
- TypeScript owns capability-gated command surfaces, returned result admission,
  operational state projection, and runtime-return observation feeding retrofit
  graph functions.
- Status: bounded parity.

Archive comparison:

- TypeScript owns current passing live `data_mapper` single-edge evidence.
- Python owns historical passing live code-edge evidence and richer harnessed
  `data_mapper` yield-chain evidence.
- Status: bounded parity for current RC preconditions, not full replacement of
  Python's historical multi-edge data_mapper qualification depth.

Release:

- Python can produce operational release and run evidence inside installed
  workspaces.
- TypeScript publishes `prepare_release_surface` and operational graph
  functions, and T-059 proves release-cut package artifact plus `odd-sdlc-ts`
  binary binding.
- Status: closed for package release-cut evidence; live deployment remains out
  of scope for this RC report.

## Retired Gap Ticket

The future full Python-replacement RC claim was tracked by:

- `.ai-workspace/tickets/completed/T-041-realize-typescript-full-operational-python-replacement-rc-lane.md`

That ticket is no longer the active wave driver. The current operational driver
is the test35 uplift sequence recorded in `specification/GOALS.md`.

The installed-workspace sandbox precondition is closed by:

- `.ai-workspace/tickets/completed/T-052-require-abg-populated-installed-workspaces-for-all-typescript-sandboxes.md`
- `.ai-workspace/tickets/completed/T-063-govern-abg-and-odd-sdlc-installer-feature-contract-before-rc.md`

The live external `F_P` data_mapper precondition is closed by:

- `.ai-workspace/tickets/completed/T-053-build-typescript-live-fp-data-mapper-qualification-lane.md`

The TypeScript install/normalize and release-cut precondition is closed by:

- `.ai-workspace/tickets/completed/T-059-realize-typescript-install-normalize-and-release-cut-adapters.md`

The installed operator UX and cold-agent STDO bootstrap preconditions are
closed by:

- `.ai-workspace/tickets/completed/T-064-define-and-realize-test46-installed-operator-ux-for-governed-typescript-sdlc-run.md`
- `.ai-workspace/tickets/completed/T-065-embed-stdo-aliases-and-first-missing-layer-triage-in-installed-bootstrap-provenance.md`

The side-by-side archive comparison precondition is closed by:

- `.ai-workspace/tickets/completed/T-060-publish-typescript-live-vs-python-archive-comparison-postmortem.md`

The full Python-to-TypeScript operational blocker map is maintained in:

- `build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_PYTHON_PARITY_RC_BLOCKER_MAP.md`
