# odd_sdlc TypeScript Python Parity RC Blocker Map

**Status**: Retired / historical
**Date**: 2026-04-26
**Owner Ticket**: `.ai-workspace/tickets/completed/T-054-publish-python-to-typescript-operational-rc-blocker-map.md`
**Scope**: TypeScript package RC versus full operational Python-replacement RC.

## Reading Rule

This map separates two claims.

Bounded package RC means the TypeScript tenant is usable as an ODD-native
package surface with semantic, sandbox, and installed-sandbox proof.

Full operational RC means TypeScript can replace the Python tenant as the
operator-facing `odd_sdlc` application over real workspaces.

Python live tests are not TypeScript proof. TypeScript sandbox tests are not
live external `F_P` proof.

## Non-Closure Guardrails

- Python live tests are comparison evidence, not TypeScript proof.
- Sandbox proof is treated as live external `F_P` proof only when a TypeScript
  live lane actually dispatches an external worker and admits the returned
  result.
- Full operational RC blockers must stay visible under `T-041` until each row
  in this map has an owning closure record and proof surface.

## Current Reading

This blocker map is retained as historical evidence for the older T-041
full-operational RC framing. T-041 and B-085 have since moved to completed as
retired/superseded surfaces. The current feature-gap wave is governed by the
test35 uplift sequence in `specification/GOALS.md`, T-004, and T-002.

## Historical Summary

Bounded TypeScript package RC:

- Status: not blocked by the gaps below.
- Current evidence: `npm run test:semantic`, `npm run test:t038`,
  `npm run test:sandbox`, `npm run lint:semantic`.

Full operational Python-replacement RC:

- Status: retired as current control surface.
- Primary historical blocker: `T-041`.
- Closed preconditions: `T-052` ABG-populated installed sandbox proof,
  `T-053` live external `F_P` data_mapper proof, `T-059` install/release
  adapter proof, and `T-063` installer feature-contract governance.

## Blocker Map

### 1. Install And Workspace Normalization

- Python capability: side-effecting install and workspace normalization prepare
  target workspaces and publish runtime/analysis truth.
- TypeScript current status: closed for the current TypeScript operational RC
  slice. T-059 installs `@odd-sdlc/typescript-tenant` and the ABG TypeScript
  runtime into a target workspace, binds `odd-sdlc-ts`, `genesis-ts`, and
  `abiogenesis-ts`, and writes install, normalization, and bootstrap guidance
  surfaces.
- Status class: `closed`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning ticket: `T-059`.
- Current proof surface: `npm run test:t059`, public export `./install`, CLI
  command `odd-sdlc-ts install --target <workspace>`.
- Required proof to close: met for the current package-backed TypeScript
  install adapter.
- Residual risk: install proof must not be overread as live traversal proof or
  Python behavioral equivalence.

### 2. Public CLI Command Grammar

- Python capability: operator commands expose install/start/gaps/release style
  workflows over installed workspaces.
- TypeScript current status: bounded parity for current RC command grammar.
  T-058 publishes catalog, query-domain, gaps, start, and RC-report. T-059 adds
  install and release-cut commands as bounded side-effect adapters.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning ticket: `T-058`, `T-059`.
- Current proof surface: `npm run test:t058`, `npm run test:t059`, package
  export `./cli`, package binary `odd-sdlc-ts`.
- Required proof to close: met for install, start, gaps, query, RC report, and
  release-cut command grammar. Live `F_P` remains a gated test lane, not a
  public command claim.
- Residual risk: command wrappers can accidentally become a second engine
  instead of ABG/GTL adapters.

### 3. Public Start, Gaps, And Release Command Flow

- Python capability: installed-workspace public start, gap review, and release
  preparation are operator-facing workflows.
- TypeScript current status: bounded parity. Public start and query/gap
  projections exist as typed API surfaces and installed command flow is proven
  by T-059.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning ticket: `T-032`, `T-033`, `T-036`, `T-058`, `T-059`.
- Current proof surface: `T-032`, `T-033`, `T-036`, `T-038`, `npm run
  test:t058`, `npm run test:t059`.
- Required proof to close: met for current installed command flow and release
  package evidence.
- Residual risk: API parity can be mistaken for operator workflow parity.

### 4. ABG-Installed Sandbox Population

- Python capability: sandbox proofs run in installed workspaces rather than
  only source-local harnesses.
- TypeScript current status: closed for current sandbox lanes.
- Status class: `closed`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning tickets: `T-052`, `T-063`.
- Current proof surface: `npm run test:sandbox`,
  `test_env/sandbox/abg_installed_workspace.mjs`, public ABG M05 archive
  qualification through `@abiogenesis/typescript-tenant/qualification/m05`.
- Required proof to close: already met for current sandbox scope.
- Residual risk: closed sandbox precondition does not prove live `F_P` or full
  operational install/normalize behavior.

### 5. Live External F_P data_mapper Traversal

- Python capability: live qualification tests attach an external worker and
  attempt real probabilistic traversal.
- TypeScript current status: closed for the first live proof lane. TS now has
  `npm run test:live`, gated by `ODD_SDLC_TS_LIVE_FP=1`, and a local accepted
  `data_mapper` qualification run archive. `data_mapper` is an independent
  sufficiency workload, not part of `odd_sdlc` product scope.
- Status class: `closed`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning ticket: `T-053`.
- Current proof surface: `ODD_SDLC_TS_LIVE_FP=1 npm run test:live`,
  `.ai-workspace/tickets/completed/T-053-build-typescript-live-fp-data-mapper-qualification-lane.md`,
  local archive
  `build_tenants/typescript/test_env/test_runs/t053_live_data_mapper/20260426T183216072Z_pid7194/`.
- Required proof to close: met. The accepted run provisions an ABG-installed
  workspace, attaches a real Codex `F_P` worker, opens public start over
  `bootstrap_release_self_test`, dispatches `derive_code_surface`, admits the
  result, and archives prompt/manifest/install/event/projection/postmortem
  evidence.
- Residual risk: this is one live traversal proof, not full installed
  `odd_sdlc` CLI replacement or Python archive equivalence.

### 6. Graph-Function Program Composition And ABG Handoff

- Python capability: current operational behavior emerged from graph traversal
  programs, including recursive realization and ABG handoff expectations.
- TypeScript current status: bounded library first slice complete. Core
  functions, executive programs, `Fg_single_typed_traversal`, and
  `Fg_ingress_project` are published. B-068 proves outcome iteration in a
  sandbox. Wider reusable closure/routing/projection forms remain future work.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: yes.
- Owning tickets: `T-049` design, `T-055` single typed traversal, `T-056`
  ingress project.
- Current proof surface: `T-030`, `T-033`, `B-068`, `B-069`,
  `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`,
  `build_tenants/typescript/code/src/graph/library.ts`.
- Required proof to close: first library slice is closed. Future reusable
  closure, route binding, projection-coherence, and operational-return forms
  should be ticketed when they become controlling blockers.
- Residual risk: product-specific leaf functions can harden into ad hoc
  orchestration instead of reusable ODD programs.

### 7. Constructor And Evaluator Hook Execution

- Python capability: constructors and deterministic checks create, inspect, and
  close generated assets.
- TypeScript current status: bounded parity. Hook contracts, F_D preflight and
  postflight, F_P work-report admission, generated-asset authority, and
  ambiguity preservation are implemented for package scope. The T-050 hook
  monolith split is complete with Design Module Method review.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning ticket: `T-034`; live worker proof belongs to `T-053`.
- Current proof surface: `npm run test:t034`, `npm run test:semantic`,
  `npm run test:sandbox`,
  `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`.
- Required proof to close: live worker execution over the same hook contracts
  is proved by T-053.
- Residual risk: hook contract proof can be overread as real worker execution.

### 8. Traceability And Requirement Closure

- Python capability: traceability indexes, reports, and requirement closure
  publish closure evidence over generated assets.
- TypeScript current status: bounded parity after forensic closure fixes.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no; live archive proof is closed by T-053.
- Owning ticket: `T-035`; forensic fixes `T-042`.
- Current proof surface: `npm run test:t035`, `npm run test:semantic`.
- Required proof to close: live run archives must feed the same closure
  evidence path before full operational RC.
- Residual risk: trace-only proof must remain insufficient.

### 9. Gap Dossier, Query, And Span Projections

- Python capability: query, gap dossier, and span analysis publish operator read
  models.
- TypeScript current status: bounded parity, with structural drift guards.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no, subject to CLI exposure in T-041.
- Owning ticket: `T-032`; structural hardening `T-039`.
- Current proof surface: `npm run test:t032`, `npm run test:t039`.
- Required proof to close: installed TS command flow exposes these read models
  without bypassing admitted module truth.
- Residual risk: API projection can be mistaken for installed operator command
  proof.

### 10. Triage And Ticket-Routing Proposal

- Python capability: triage/homeostatic logic classifies gaps and routes
  follow-up work.
- TypeScript current status: bounded parity. TS separates observation,
  classification, route binding, repricing proposal, and ticket-route proposal.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no, subject to policy extraction work.
- Owning ticket: `T-036`; policy cleanup `T-051`, `T-057`.
- Current proof surface: `npm run test:t036`, T-051 hook policy extraction,
  T-057 route/start/operational policy extraction.
- Required proof to close: met for current bounded policy surfaces.
- Residual risk: future policy branches must follow the same module-method
  policy-surface review before closure.

### 11. Operational Build, Test, And Runtime-Return Projection

- Python capability: operational dispatch and returned evidence are part of
  release/run qualification.
- TypeScript current status: bounded parity for command/result/projection
  carriers and runtime-return observation.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no, subject to live execution and release-cut
  proof.
- Owning ticket: `T-037`; runtime binding fix `T-043`.
- Current proof surface: `npm run test:t037`, `npm run test:semantic`.
- Required proof to close: live run and release-cut lanes provide real returned
  build/test evidence rather than synthetic carrier evidence.
- Residual risk: governed carrier proof can be overread as actual operational
  execution.

### 12. Release-Cut Packaging And Binary Binding

- Python capability: Python can produce operational release/run evidence inside
  installed workspaces.
- TypeScript current status: closed for release-cut package evidence and binary
  binding. T-059 writes a release-cut manifest, postmortem, npm package
  artifact, and `odd-sdlc-ts` binary-binding proof.
- Status class: `closed`.
- Blocks bounded package RC: no.
- Blocks full operational RC: no.
- Owning ticket: `T-059`.
- Current proof surface: `npm run test:t059`, public export `./release`, CLI
  command `odd-sdlc-ts release-cut --archive-root <dir>`.
- Required proof to close: met for package artifact and binary binding.
- Residual risk: release-cut package evidence is not live deployment or live
  `F_P` proof.

### 13. Python Live Archive Comparison And Postmortem

- Python capability: historical live and sandbox archives provide behavioral
  comparison material.
- TypeScript current status: comparison complete, but the comparison does not
  prove full operational replacement. T-060 compares the current TS live
  `data_mapper` archive against Python's passing live code-edge archive and
  Python's richer `data_mapper` yield-chain baseline.
- Status class: `bounded_parity`.
- Blocks bounded package RC: no.
- Blocks full operational RC: yes, if the full-RC bar includes Python's
  historical multi-edge data_mapper qualification depth.
- Owning ticket: `T-060`; remaining full-RC decision belongs to `T-041`.
- Current proof surface:
  `build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_LIVE_PYTHON_ARCHIVE_COMPARISON.md`.
- Required proof to close: comparison surface is complete. Multi-edge
  data_mapper qualification equivalence remains outside T-060 and must be
  repriced from T-041 if required for RC.
- Residual risk: Python test success can be cited as TS evidence instead of
  comparison context.

## Current Execution Order

1. `T-054` is complete; keep this blocker map active as the control surface.
2. `T-049`, `T-055`, and `T-056` are complete; keep reusable graph-function
   library pressure active during refactor work.
3. `T-053` is complete; use its live archive as the TS side of the future
   Python comparison.
4. `T-059` is complete; install/normalize and release-cut packaging are no
   longer blockers.
5. `T-060` is complete; Python archive comparison is now explicit.
6. T-041 is no longer the active control envelope. Current work continues under
   the test35 uplift sequence in `GOALS.md`.
