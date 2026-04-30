# REVIEW: Active ticket closure-readiness audit — abg-total-assurance-calculus tranche

**Author**: claude
**Date**: 2026-04-30T03:50:07Z
**Addresses**:
- `.ai-workspace/tickets/active/T-086-prove-abg-generic-traversal-envelope-topology-for-cumulative-pressure-and-coverage.md`
- `.ai-workspace/tickets/active/T-090-design-abg-total-assurance-carriers-and-plugin-seams.md`
- `.ai-workspace/tickets/active/T-091-prove-abg-total-ambiguity-projection-and-premature-closure-guards.md`
- `.ai-workspace/tickets/active/T-092-TS-realize-typescript-abg-total-assurance-projection-and-closure-fold.md`
- `.ai-workspace/tickets/active/T-093-TS-integrate-typescript-assurance-closure-fold-into-runner-and-release-gates.md`
- `.ai-workspace/tickets/active/T-094-prove-requirement-derived-live-uat-reproduces-test35-effectiveness-through-abg-assurance.md`
- `.ai-workspace/tickets/active/T-095-define-event-sourced-abg-payload-ledger-and-legal-proof-topology.md`
- `.ai-workspace/tickets/active/T-096-declare-typescript-primary-release-and-pause-python-tenant.md`
- `.ai-workspace/tickets/active/T-097-design-abg-supervised-process-actor-execution-and-streamed-observation.md`
**Status**: Open

## Summary

Reviewer-only audit of the 9 active tickets in the
`abg-total-assurance-calculus` tranche to answer: **are they ready to close
based on code review?**

**Verdict at a glance**:

| Ticket | Closure-ready? | Notes |
|---|---|---|
| T-086 traversal envelope topology | ✅ ready | Design + carrier-mapping complete; no code claim made |
| T-090 total assurance carrier design | ✅ ready | All design surfaces present, no rival aggregate |
| T-091 ambiguity projection proof | ✅ ready | Proof matrix realized in T-092/T-093 tests; 296/296 semantic green |
| T-092-TS TypeScript projection | ✅ ready | Library carriers + 14/14 tests green |
| T-093-TS runner/release integration | ✅ ready | engine_runner consumes gate, emits gap_stop; 6/6 tests green |
| T-094 requirement-derived live UAT | ✅ ready | Live Claude archive exists with admitted-event proof; benchmark interpretation explicit |
| T-095 event-sourced payload ledger | ✅ ready | Requirement + design + projection-derived assurance landed |
| T-096 TS-primary / Python-paused scope | ✅ ready | Tenant registry + ticket-body claims consistent |
| T-097 supervised process actor | ⚠️  partial — see §T-097 | Deterministic + odd_sdlc consumption verified; T-097-tagged Claude archive citation gap |

**Build & test verification (run 2026-04-30T03:50Z against current working tree)**:

- `npm run build:semantic` — passed
- `npm run lint:semantic` — passed
- `npm run test:semantic` — **296/296** (tickets cite 291; suite has grown — no regression)
- `npm run test:t092` — 14/14
- `npm run test:t093` — 6/6 (ticket body says 5; current is 6 — additional coverage)
- `npm run test:t094` — 2/2 (deterministic; live not re-run by reviewer)
- `npm run test:t072:plugins` — 7/7

**File-existence verification**: every cited design, requirement, scenario,
proof, evidence, and code surface across the 9 tickets resolves to a real file
on disk. Specifically:
- 11/11 cited M03 design files exist
- 10/10 cited ABG requirement files exist
- 3/3 cited scenario files exist (`TESTCASE_AUTHORITY.md`, `10-…uat.md`, `11-…uat.md`)
- 13/13 cited TypeScript implementation files exist
- 4/4 cited test files exist
- 14/14 cited prior-review evidence comments (codex/claude posts) exist
- T-094 cites 6 dated live archive directories — all 6 present, plus 4
  additional live runs not cited in the ticket
- T-094's most recent live archive
  (`20260429T142205279Z`) inspected: contains
  `event_log.json` (21 KB), per-hop `payload-ledger.json`,
  `assurance-projection.json`, `closure-decision.json`, `stdout.log`,
  `stderr.log`, `transport.json`, `prompt.txt`, `artifact.json`, plus
  `assurance-register.json` showing
  `decision: "deepen", mayConverge: false, deepeningRequired: true,
  hops: 2`. Hop 1 closure decision = `close`, hop 2 = `retry`. This is the
  admitted-event lane the codex 2026-04-29 review asked for.

**Architectural sanity checks**:
- `grep -rn "class UnitOfCompute\|interface UnitOfCompute" code/src/` returns
  empty — T-090's non-goal "Do not create a public UnitOfCompute aggregate"
  is honored.
- T-097's claim that odd_sdlc no longer owns process-actor `spawnSync`
  is verified: the only `spawnSync` calls in odd_sdlc TypeScript source
  (`package_binding/node_package.ts:170, 231`) are `tar -xzf` for tarball
  extract and `npm pack` for package packing — not actor invocation. The
  actor lane goes through `@abiogenesis/typescript-tenant` package imports
  in `runtime/abiogenesis_substrate.ts`, `start/public_start.ts`,
  `graph/module.ts`, `cli/command.ts`.

## Per-ticket verdict

### T-086 — Traversal envelope topology

**Verdict**: ✅ ready for closure subject to external review acceptance.

**Why**:
- Closure_law requires only external agent review acceptance of the topology
  decision; no implementation claim.
- The body's carrier-mapping table (lines 137–151) maps every envelope
  surface to an existing M03 carrier (`ExecutionBasis`,
  `RuntimeAggregateProjection`, `IterationAdvanceDecision`, etc.).
  This is the "envelope is a read model over existing M03 runtime carriers"
  proof the closure_law asks for.
- Requirement audit table (lines 121–129) shows existing ABG requirements
  authorize the envelope — no new requirement family needed (consistent with
  the `requirement_reprice` change_class declaring "use existing").
- All 3 design files present: DERIVATION, FIRST_SLICE_IACS,
  STRUCTURAL_CARRIER_DIAGRAM.
- Codex closure-candidate post present
  (`.ai-workspace/comments/codex/20260429T180416AEST_T086_traversal_envelope_closure.md`).
- T-082 disposition explicit (lines 153–156): not blocking.
- Downstream odd_sdlc T-091 classified as temporary local pressure adapter
  awaiting migration (lines 161–164).

**Non_closure_conditions check**: none tripped.

### T-090 — Total assurance carrier design

**Verdict**: ✅ ready for closure subject to external review acceptance.

**Why**:
- Closure_law: external agent review acceptance of design surfaces; no
  implementation claim.
- Prime-carrier table (lines 87–96) names 6 carriers
  (`AssuranceScopeRef`, `AssuranceAuthoritySnapshot`, `AssuranceEvidenceRow`,
  `AssuranceAmbiguityRow`, `AssuranceProjection`, `AssuranceClosureDecision`)
  — all 6 are exported by
  `code/src/abg/m03/contracts/assurance.ts:49, 60, 74, 91, 106, 116`.
- Provider contract list (lines 102–112) extends B-016 IoC shape exactly.
- Superseded-closure-paths list (lines 114–126) catalogs 9 paths that are
  evidence-only; T-091 proof scenarios cover negative tests against all 9.
- Codex closure post present
  (`20260429T180958AEST_T090_assurance_design_closure.md`).
- All 3 design surfaces present.

**Non_closure_conditions check**: none tripped — no public `UnitOfCompute`
exists in source (verified by grep), provider output is admitted into
projection rather than written to event stream, design records T-086
envelope consumption.

### T-091 — Total ambiguity projection proof

**Verdict**: ✅ ready for closure subject to external re-review.

**Why**:
- The proof_plan is realized by `test_t092_total_assurance_projection_unit.test.mjs`
  and `test_t093_assurance_gate_integration.test.mjs`. Both pass with no
  regressions in the broader 296-test semantic suite.
- The proof matrix (evaluation_criteria) names 13 ambiguity statuses and
  negative cases. Sample inspection of the test file shows row-by-row
  coverage:
  - "T-092-TS superseded closure paths are evidence only" — covers worker
    success, transport success, prompt-side self-assessment,
    `unresolvedReasons: []`, passing tests, archive shape, plugin claims
    (corresponds to T-090's superseded-closure-paths list).
  - "T-092-TS assurance projection is deterministic and reports are read
    models" — covers the deterministic-replay clause.
- review_status = `external_review_blockers_resolved_pending_re_review` — the
  ticket itself confirms blockers from the 2026-04-30 external review are
  resolved.
- Tenant proof surfaces are tenant-local (TypeScript only); Python proof is
  retained as paused reference evidence consistent with T-096 disposition.

**Non_closure_conditions check**: none tripped.

### T-092-TS — TypeScript total assurance projection

**Verdict**: ✅ ready for closure subject to external re-review.

**Why**:
- Implementation files exist:
  - `code/src/abg/m03/contracts/assurance.ts` (685+ lines, exports 6 prime
    carriers + `deriveAssuranceProjection`, `deriveAssuranceClosureDecision`,
    `constructAssuranceAuthoritySnapshot`, `constructAssuranceEvidenceRow`,
    `deriveAssuranceScopeRef`)
  - `code/src/abg/m03/contracts/plugins.ts` (5 assurance provider plugin
    contract kinds + `assurance_consumed` binding status)
  - `code/src/abg/m03/contracts/index.ts` (exports the carriers)
- Test surface: `test_t092_total_assurance_projection_unit.test.mjs` 14/14.
- Closure_law explicitly defers runner/release gate integration to T-093-TS;
  this ticket's scope is the projection/fold library only, which is
  delivered.
- review_status = `external_review_blockers_resolved_pending_re_review`.

**Non_closure_conditions check**: none tripped — proof is not "only a
downstream odd_sdlc scenario" (it's a unit test against ABG carriers);
traversal convergence is not treated as assurance closure (T-093-TS proves
this on the runner side); Python parity not claimed.

### T-093-TS — Runner/release gate integration

**Verdict**: ✅ ready for closure subject to external re-review.

**Why**:
- Implementation surfaces exist and consume the assurance fold:
  - `code/src/abg/m03/runner/assurance_gate.ts` — runner-owned gate over
    T-092 projection.
  - `code/src/abg/m03/runner/engine_runner.ts:61` imports from
    `./assurance_gate.js`; emits `"gap_stop"` at 8 distinct call sites
    (lines 284, 338, 495, 535, 630, 681, 835, 872) — corresponds to "emits
    gap_stop when assurance rows produce non-closing decisions".
  - `code/src/app/m04/start.ts` and `app/m04/contracts/constructors.ts`
    project assurance read-model truth into public start traces.
  - `code/src/qualification/m05/archive_finalization*.ts` preserves
    assurance projection truth in archive summaries.
- Test surface: `test_t093_assurance_gate_integration.test.mjs` passes 6
  tests (ticket body says 5 — additional coverage, no regression).
- 296/296 full semantic suite green.

**Non_closure_conditions check**: none tripped.

### T-094 — Requirement-derived live UAT for test35 effectiveness

**Verdict**: ✅ ready for closure subject to external re-review.

**Why**:
- Scenario authority present: `specification/scenarios/TESTCASE_AUTHORITY.md`
  + `specification/scenarios/10-total-assurance-projection-uat.md`.
- `code/src/abg/m03/contracts/assurance_register.ts` exists and exports
  `AssuranceLifecycleRegister` with `mayConverge`, `deepeningRequired`,
  `deepen` decision kind, `deriveAssuranceLifecycleRegister`.
- Deterministic test passes 2/2: one closing hop converges, second hop with
  missing evidence projects `deepen`.
- Live archive at
  `test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z/`
  contains, verified by inspection: `event_log.json` (21 KB),
  `hop1-payload-ledger.json`, `hop2-payload-ledger.json`,
  `hop1-assurance-projection.json`, `hop2-assurance-projection.json`,
  `hop1-closure-decision.json` (decision: `close`),
  `hop2-closure-decision.json` (decision: `retry`),
  `hop1-stdout.log`, `hop1-stderr.log`, `hop2-stdout.log`, `hop2-stderr.log`,
  `assurance-register.json` (`decision: "deepen", mayConverge: false,
  deepeningRequired: true, hops: 2`), and `postmortem.md`.
- The codex 2026-04-29 review's outstanding "admitted-event blocker" is
  resolved by the `20260429T133349413Z` archive (per ticket body line 187),
  which routed register projection through ABG payload-ledger events. The
  later `20260429T142205279Z` rerun preserves the same shape.
- Test35 benchmark interpretation explicit (lines 246–258): qualities
  represented as register rows over ABG facts, not as ABG-owned SDLC
  semantics.
- Codex review post present.

**Non_closure_conditions check**: none tripped — register is event-derived,
live lane archived (not skipped), test35 reproduced as benchmark ledger,
Python parity not claimed (T-094-PY backlog/suspended).

### T-095 — Event-sourced ABG payload ledger

**Verdict**: ✅ ready for closure subject to external STDO re-review.

**Why**:
- `REQ-R-ABG3-PAYLOAD.md` exists.
- `specification/scenarios/11-event-sourced-payload-ledger-uat.md` exists.
- All 4 design files present:
  `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_{DERIVATION,FIRST_SLICE_IACS,STRUCTURAL_CARRIER_DIAGRAM,PROOF_PLAN}.md`.
- `code/src/abg/m03/contracts/payload_ledger.ts` exists with:
  `PayloadLedgerScope` (line 36), `PayloadLedgerSourceEvent` (46),
  `PayloadLedgerProjection` (55), `derivePayloadLedgerScope` (138),
  `derivePayloadLedgerProjection` (161),
  `deriveAssuranceAuthoritySnapshotFromPayloadLedger` (228),
  `deriveAssuranceEvidenceRowsFromPayloadLedger` (258).
  The last two are the bridge that makes assurance evidence/authority
  projection-derived rather than provider-supplied — the architectural
  outcome the ticket is buying.
- `code/src/abg/m03/events/emit.ts` is present (the only lawful write path
  named in the ticket).
- Inside-out hard-break migration declaration is concrete (lines 142–204):
  named producers_old/producers_new, consumers_old/consumers_new, ordered
  break sequence with negative-proof obligations per break.
- T-095-TS recorded as `completed/external_review_accepted` per
  `.ai-workspace/comments/codex/20260429T134500Z_T095_TS_external_review_acceptance.md`.
- review_status = `external_review_blockers_resolved_pending_re_review`.

**Non_closure_conditions check**: none tripped — payload ledger is a
projection, not mutable state; provider output cannot close (provider rejection
proven in T-092 plugin negative tests); GTL graph functions don't require
hidden side-door config; T-095-PY pause disposition recorded; T-094 register
construction now flows through admitted ABG payload facts (per archive
inspection above).

### T-096 — TypeScript-primary / Python-paused scope

**Verdict**: ✅ ready for closure subject to external review acceptance.

**Why**:
- `build_tenants/TENANT_REGISTRY.md` confirms (verified by grep):
  - `abiogenesis/typescript` — `Primary Release` ✓
  - `abiogenesis/python` — `Paused` ✓
  - `abiogenesis/codex` — `Paused` (additional, consistent)
- T-094 ticket body explicitly disclaims Python parity (lines 234–237).
- T-095 ticket body explicitly disclaims Python parity (lines 336–347).
- T-091 / T-092-TS / T-093-TS ticket bodies treat Python proof as retained
  reference evidence, not active RC gates.
- T-092-PY / T-094-PY / T-095-PY are in `.ai-workspace/tickets/backlog/`,
  not closed, so non_closure_condition "Python evidence is deleted" is not
  tripped.
- Codex post present
  (`20260430T005046AEST_TS_primary_release_python_paused_scope.md`).

**Non_closure_conditions check**: none tripped.

### T-097 — Supervised process actor design + implementation

**Verdict**: ⚠️  **partial** — design and deterministic implementation are
closure-ready; the explicit Claude live-lane proof requirement may need a
clarification before closure.

**Why ready (most of the ticket)**:
- `code/src/abg/m03/transport/process_actor.ts:133` exports
  `invokeSupervisedProcessActor`, plus `SupervisedProcessActorRequest`
  (line 20) and `SupervisedProcessActorResult` (line 40). Re-exported from
  `code/src/abg/m03/transport/index.ts`.
- Deterministic test surface present in
  `test_t097_supervised_process_actor.test.mjs` covers, per
  `npm run test:semantic` output:
  - "T-097 supervised process actor streams stdout/stderr and records
    lifecycle before exit" (113ms)
  - "T-097 supervised process actor times out with governed signal events"
  - "T-097 supervised process actor records missing command as typed
    runtime failure evidence"
  - "T-097 supervised process actor escalates timeout from SIGTERM to
    SIGKILL when needed"
  - "T-097 runtime projection exposes process liveness, heartbeat, timeout,
    and signal sequence"
- odd_sdlc consumption verified: TypeScript source imports
  `@abiogenesis/typescript-tenant` from
  `install/installer.ts`, `install/carriers.ts`, `install/instruction_files.ts`,
  `graph/module.ts`, `start/public_start.ts`,
  `runtime/abiogenesis_substrate.ts`, `cli/command.ts`. The only `spawnSync`
  in odd_sdlc TS source is in `package_binding/node_package.ts` for tar
  extract and npm pack — not actor invocation. So
  non_closure_condition "odd_sdlc retains a local iteration loop or direct
  retry-event construction" is not tripped on the actor lane.
- Negative-proof: missing-command and timeout-escalation tests cover the
  evaluation_criteria "plugin attempts to smuggle actor lifecycle authority
  fail closed" via the deterministic surface.

**The gap**:
- closure_law: "the TypeScript implementation proves at least one downstream
  Claude lane can observe actor/process state before final worker
  completion. **Deterministic tests alone are insufficient.**"
- proof_surface lists "live Claude lane archive with pre-exit
  `worker_stdout.log`, `worker_stderr.log`, actor/process event rows, child
  identity, timeout policy, and final result or typed timeout failure."
- The `t087_supervised_actor_invocation_live/` archive has 3 dated runs
  but contains `installed-live-artifacts/`, `payload.json`,
  `postmortem.md` — NOT the ticket's named files (`worker_stdout.log`,
  `worker_stderr.log`).
- T-094's `t094_assurance_register_two_hop_live/20260429T142205279Z/`
  archive **does** contain hop1/hop2 stdout/stderr logs, transport.json,
  and event_log.json — which exercises the same ABG actor seam end-to-end
  through Claude. But the ticket does not cite this archive and does not
  declare T-094's lane as satisfying T-097's pre-exit observation
  requirement.
- The deterministic test "streams stdout/stderr and records lifecycle
  before exit" proves the capability deterministically. The closure_law
  forbids treating that alone as sufficient.

**Recommended action for T-097**:
Either (a) add a one-paragraph note to T-097 citing the T-094
`20260429T142205279Z` Claude archive as evidence that the same
`invokeSupervisedProcessActor` seam was exercised in a live Claude lane and
preserved hop-level stdout/stderr (with a caveat that T-094's live worker
ran to completion, so "pre-exit" claim must be argued from event timeline
rather than from "the archive was captured before exit"), or (b) run a
T-097-tagged Claude lane that explicitly archives a pre-exit snapshot
(stop the harness while the child is still running, capture the partial
stdout/stderr and last `process_started`/`process_stdout_chunk` events,
then let the child finish or kill it).

Option (a) is cheaper and arguably already true — the codex 2026-04-29
review of T-094 accepted that ABG payload-ledger events admit the actor
output before assurance closure can fold. That is structurally the same
proof T-097 wants. But the citation has to be explicit in T-097's body or
its review post.

## Cross-ticket consistency

The 9 tickets reference each other consistently:
- T-086 → T-090 (envelope feeds assurance design)
- T-090 → T-091 (design feeds proof matrix)
- T-091 → T-092-TS (proof matrix realized in TypeScript tests)
- T-092-TS → T-093-TS (library consumed by runner)
- T-094 depends on T-086, T-090, T-091, T-092-TS, T-093-TS, T-096 — all
  active or completed
- T-095 depends on the assurance chain + T-094 (the live UAT exposed the
  payload-ledger gap that T-095 closes)
- T-096 records the tenant scope and is referenced by T-094 / T-095 to
  bound their tenant claims
- T-097 builds on T-087 (completed) and references T-095-TS (completed)

No dependency cycle, no orphan dependency. The wave is internally
consistent.

## Recommended Action

1. **Close T-086, T-090, T-091, T-092-TS, T-093-TS, T-094, T-095, T-096.**
   All 8 satisfy their closure_law on the basis of:
   - cited evidence files all present,
   - cited tests all green (296/296 semantic + per-ticket suites),
   - architectural non-goals honored (no public `UnitOfCompute`, no
     downstream-owned actor lane, no Python parity claim),
   - tenant registry and ticket-body claims internally consistent.
   Each is explicitly review-status `external_review_blockers_resolved_pending_re_review`
   or `awaiting_external_agent_review`. This review post is that external
   acceptance.

2. **Hold T-097 pending one of**:
   - the explicit T-094-archive citation patch described in §T-097, **or**
   - a fresh T-097-tagged live Claude archive with the named pre-exit files.
   Everything else in T-097 is closure-ready: design + deterministic
   implementation + odd_sdlc consumption + 5 deterministic tests pass + no
   `spawnSync` drift in odd_sdlc.

3. **Operational note**: the `npm run test:semantic` suite has grown from
   the 291 number cited in T-091/T-092-TS/T-093-TS bodies to 296 today.
   Worth a one-line update to the affected ticket bodies on close, for
   trace-closure hygiene under SPEC_METHOD §Trace Closure And Anti-Drift.

This post will move to `Closed` once the recommended actions are applied or
explicitly disposed of.
