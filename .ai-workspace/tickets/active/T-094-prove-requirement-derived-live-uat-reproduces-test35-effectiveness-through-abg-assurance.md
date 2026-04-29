---
id: T-094
title: Prove requirement-derived live UAT reproduces test35 effectiveness through ABG assurance
type: feature
ticket_category: ordinary
status: active
review_status: external_review_blockers_resolved_pending_re_review
goal: abg-total-assurance-calculus
goal_status: active
activation_requires: T-086, T-090, T-091, T-092-TS, T-093-TS, and T-096 remain active or review-pending; Claude live lane available or actor-observation failure archived
change_intent: Add requirement-derived UAT scenario authority and live Claude-lane proof showing the ABG assurance wave can build the event-derived register a downstream lifecycle product needs to reproduce the effectiveness qualities that made data_mapper.test35 the product-quality reference, without relying on premature closure, prompt-side self-report, or downstream SDLC-specific ledgers as ABG truth.
change_class: design_reframe
re_entry_point: scenario_proof
affected_boundary: ABG scenario authority, REQ-R-ABG3-ASSURANCE UAT derivation, TypeScript live qualification lane, paused Python reference evidence, assurance projection archives, downstream odd_sdlc test35 reproduction benchmark
priority: high
triaged_at: 2026-04-29T11:21:49Z
created_at: 2026-04-29T11:21:49Z
updated_at: 2026-04-30T00:50:46+10:00
dependencies:
  - T-086 active/awaiting_external_agent_review
  - T-090 active/awaiting_external_agent_review
  - T-091 active/awaiting_external_agent_review
  - T-092-TS active/awaiting_external_agent_review
  - T-093-TS active/awaiting_external_agent_review
  - T-094-PY paused/suspended_by_tenant_registry
  - T-096 active/ts_primary_release_scope
  - REQ-R-ABG3-ASSURANCE active
  - REQ-P-SCENARIOS active
  - REQ-P-QUAL active
governance_scope: STDO Method
library_usage: consume
governing_library:
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md
related_downstream_evidence:
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cx
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cl
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/CODE_QUALITY_AND_TRAVERSAL_11_28_31_32_33_34_35_38_upto_57.md
  - build_tenants/abiogenesis/python/test_env/test_runs/requirements_to_uat/20260429T111818_test_requirements_to_uat_live_qualification/artifacts/claude_actor_probe.json
intake_source: The ABG assurance wave has deterministic tenant proof, but not yet requirement-derived live UAT proving that the framework can reproduce the effectiveness qualities observed in data_mapper.test35. The data_mapper roll-up identifies test35 as the product-quality reference and test57.fp as stronger modern traversal evidence but weaker source-trace/product-quality evidence. The missing ABG proof is not another unit test; it is a requirements-to-UAT scenario bundle plus live Claude-lane evidence that total assurance prevents premature closure while preserving the useful qualities of the best prior run.
target_truth: ABG can derive UAT scenarios from live requirement authority, execute those scenarios through live Claude lanes or fail closed with archived actor observation, project every assurance row from admitted event/evidence truth, and expose sufficient generic event/authority/evidence/assurance facts for a downstream product to build its own lifecycle register. Test35-class effectiveness is reproduced by proving register-buildability and gap visibility, not by making ABG own SDLC domain semantics.
superseded_truth: Passing deterministic assurance unit tests, a green traversal, a run archive, or a worker self-report is enough to claim that the ABG assurance wave reproduces test35-class effectiveness.
benchmark_truth:
  - data_mapper.test35 remains the product-quality reference in the current data_mapper roll-up.
  - test35 benchmark qualities include 71/71 source-visible requirement coverage on its authority basis, 103 main files, 34 test files, 173 passing tests, qualified release, and 20-edge closure.
  - test57.fp.cx is stronger modern installed-framework traversal evidence but has 0/83 source-visible Scala REQ anchors in the roll-up.
  - test57.fp.cl has better source trace anchors than test57.fp.cx but blocks before release quality.
  - A future ABG/SDLC run is not test35-effective unless it proves source authority coverage, execution evidence, scenario-derived UAT, honest gap blocking, and release closure under the assurance fold.
non_goal:
  - Do not move SDLC domain quality semantics into ABG.
  - Do not require ABG to generate a data_mapper implementation itself.
  - Do not claim odd_sdlc closure from ABG unit tests alone.
  - Do not treat source LOC, test count, or REQ-token count as ABG truth by themselves.
  - Do not hard-code an SDLC lifecycle register as an ABG aggregate.
  - Do not create a mutable register that outranks the event log.
  - Do not run Codex live lanes for this ticket unless the user explicitly re-authorizes them.
closure_law: This ticket may not close until requirement-derived scenario authority exists for REQ-R-ABG3-ASSURANCE, live Claude-lane UAT proof is attempted and archived, test35 effectiveness qualities are translated into downstream-register predicates over ABG facts, and an external agent reviews the evidence. If Claude worker transport is unavailable, the actor observation must be archived as failing evidence and the ticket remains active rather than skipped or closed.
evaluation_criteria:
  - `REQ-R-ABG3-ASSURANCE` is mapped in `specification/scenarios/TESTCASE_AUTHORITY.md` to a concrete scenario bundle.
  - The scenario bundle derives UAT cases from requirements, not from implementation habits.
  - Significant paths are declared before implementation: success, shallow worker report, stale input after prior close, orphan evidence, invalid ledger, plugin boundary, actor-observed worker failure, subordinate assurance boundary, and downstream adapter handoff.
  - Each UAT case names source requirement authority, graph-function carrier, expected proof lane, expected assurance rows, closure decision, and non-closure conditions.
  - TypeScript tenant test-surface maps identify the new scenario-derived UAT proof surfaces, and paused Python reference surfaces are not treated as active RC gates.
  - Live Claude-lane tests run only Claude-backed transport and archive stdout/stderr, actor observation, manifests, event logs, assurance projection, closure decision, and failure class.
  - If Claude is unavailable, the live lane fails with archived observer evidence rather than skipping.
  - The ABG assurance projection distinguishes traversal convergence from assurance closure in every UAT scenario.
  - Worker success, transport success, generated report shape, archive presence, passing tests, prompt-side self-assessment, and absent closure-register rows are each proven insufficient for closure.
  - Test35 effectiveness is represented as a benchmark ledger with source-authority coverage, execution evidence, scenario/UAT coverage, gap-blocking behavior, and release-closure evidence.
  - The benchmark ledger is built as a downstream read model over ABG event, authority, evidence, assurance, provenance, and closure-decision facts.
  - The proof identifies whether each benchmark row is buildable from generic ABG facts, requires a GTL hook, requires an IoC plugin fact provider, or remains a downstream odd_sdlc adapter responsibility.
  - Missing facts are represented as explicit `missing`, `partial`, `authority_missing`, or `orphan_evidence` assurance rows rather than hidden gaps.
  - The proof identifies deterministic code changes still needed in ABG, GTL hooks, IoC plugins, or downstream odd_sdlc adapters to make the downstream register reproducible.
proof_surface:
  - specification/scenarios/10-total-assurance-projection-uat.md
  - specification/scenarios/TESTCASE_AUTHORITY.md
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance_register.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t094_assurance_register_two_hop_unit.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/live/test_t094_assurance_register_two_hop_live.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T114404387Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T115446555Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T115932748Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T131259802Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z
  - build_tenants/abiogenesis/typescript/test_env/test_surface_map.md
  - TypeScript Claude-backed live assurance UAT test passed and archived
  - .ai-workspace/comments/codex/20260429T120442Z_T094_external_review_and_python_gap.md
  - .ai-workspace/comments/codex/20260429T123316Z_STDO_ABG_payload_ledger_consolidation.md
  - .ai-workspace/comments/claude/20260429T140000Z_REVIEW_assurance-payload-wave-stdo-and-code-review.md
  - .ai-workspace/comments/codex/ closure candidate post for T-094
non_closure_conditions:
  - no REQ-R-ABG3-ASSURANCE scenario authority exists
  - UAT cases are hand-authored from current implementation rather than derived from requirements
  - live lane skips when Claude is unavailable instead of archiving actor observation
  - test35 is cited as inspiration but no benchmark ledger is created
  - ABG hard-codes the SDLC lifecycle register instead of proving register-buildability
  - the register is manually authored rather than projected from admitted facts
  - benchmark comparison relies only on LOC/test-count/REQ-token metrics without assurance-row projection
  - downstream SDLC closure is claimed before ABG distinguishes assurance closure from traversal convergence
  - Codex live lane evidence is used despite the current Claude-only live-lane instruction
  - Python parity or Python no-gap sufficiency is claimed while the tenant registry marks Python paused
  - external agent review has not accepted the scenario authority and live proof evidence
---

# T-094: Requirement-Derived Live UAT For Test35-Class Assurance

This ticket keeps the ABG assurance wave open until the new substrate behavior is
proved against scenario-derived UAT, not only deterministic unit tests.

The concrete external pressure is `data_mapper.test35`. That run remains the
best product-quality reference in the current data_mapper roll-up because it
combined full source-visible authority coverage, substantial implementation
breadth, a large passing test corpus, and qualified release closure. The test57
pair is stronger modern traversal evidence, but it exposes the exact assurance
gap this ticket must close: framework traversal can look healthy while product
quality, source trace, worker output, or live transport evidence remains
ambiguous.

## Required Work

1. Add written scenario authority for `REQ-R-ABG3-ASSURANCE`.
2. Derive UAT cases from the requirement acceptance criteria and SPEC_METHOD
   significant-path rule.
3. Use the generic `AssuranceLifecycleRegister` skeleton to prove that a
   downstream register can be built from ABG assurance facts.
4. Realize Claude-only live scenario tests that archive actor/worker stdout,
   stderr, manifests, events, assurance rows, and closure decisions.
5. Create a test35 effectiveness benchmark ledger as a downstream read model
   over ABG-owned facts, translating the observed qualities into register rows
   and recording downstream adapter gaps separately.
6. Run the live Claude lane. If Claude times out or fails, archive the observer
   result and keep this ticket active.
7. Post a closure candidate only after another agent can review the scenario
   authority, live evidence, and benchmark comparison.

## Current Register Skeleton

`build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance_register.ts`
defines a generic event-derived register read model over assurance facts. It is
not an SDLC lifecycle aggregate.

The initial proof is
`build_tenants/abiogenesis/typescript/test_env/tests/test_t094_assurance_register_two_hop_unit.test.mjs`.
It proves:

- one closing hop may converge
- adding a second hop with missing downstream evidence projects a `deepen`
  register decision
- the two-hop register sets `mayConverge: false`
  and identifies the blocking hop/row evidence

Verification run:

- `npm run test:t094` passed 2 tests.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed after adding the live two-hop lane.
- `node --test test_env/tests/test_m03_transport_protocol_unit.test.mjs`
  passed 5 tests, including the Claude OAuth preservation regression.
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=60000 npm run test:t094:live`
  failed at hop 1 with archived Claude transport output:
  `Not logged in · Please run /login`.
- The Claude default transport contract was corrected to stop stripping
  `CLAUDE_CODE_OAUTH_TOKEN`; it now strips only nested Claude Code session
  markers.
- The same live lane failed once more under sandbox networking with status
  `143` and `spawnSync claude ETIMEDOUT`, archived at
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T115446555Z`.
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live`
  passed outside sandbox restrictions and archived the two-hop proof at
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T115932748Z`.

The successful live archive proves hop 1 projected `close`, hop 2 projected
`retry` over a `missing` row, and the lifecycle register projected `deepen` with
`mayConverge: false`. The earlier failed archives remain lawful evidence that
the lane fails closed and preserves actor/worker transport output instead of
skipping or claiming closure.

External review received at
`.ai-workspace/comments/codex/20260429T120442Z_T094_external_review_and_python_gap.md`.
The reviewer accepted the ticket as active and review-ready, but not
closure-ready. At that point the remaining blockers were: the live proof was a
UAT/read-model proof rather than a fully admitted ABG event-log-derived semantic
proof; hop 2 was intentionally prompt-shaped; Python parity was recorded as a
gap rather than implemented or explicitly triaged. The admitted-event blocker
is now resolved by the later `20260429T133349413Z` archive; the other two are
addressed below as design clarification and T-094-PY tracking.

STDO consolidation is posted at
`.ai-workspace/comments/codex/20260429T123316Z_STDO_ABG_payload_ledger_consolidation.md`.
That review concludes that most payload truth should pass through ABG as
admitted payload/evidence/authority facts, while payload bodies and domain
semantics may remain external. T-094 should not grow a one-off event helper;
the next implementation step should first define the general ABG payload-ledger
and assurance event topology.

T-095-TS reran the live Claude lane over ABG payload-ledger facts at
`build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T131259802Z`.
That archive includes `event_log.json`, `hop1-payload-ledger.json`,
`hop2-payload-ledger.json`, assurance projections, closure decisions, and the
register. Hop 1 projected `close`; hop 2 projected `retry`; the register
projected `deepen` with `mayConverge: false`.

T-095-TS reran the same Claude live lane after removing direct provider closure
and assessed replay closure. The current archive is
`build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z`.
It preserves the same two-hop result over admitted ABG payload facts: hop 1
`close`, hop 2 `retry`, register `deepen`, and `mayConverge: false`.

After the 2026-04-30 external review blocker response, the Claude-only live lane
was rerun again and passed at
`build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z`.
The fresh archive preserves `event_log.json`, hop payload ledgers, assurance
projections, closure decisions, stdout/stderr logs, and
`assurance-register.json`. It again proves hop 1 `close`, hop 2 `retry` over
`missing`, register `deepen`, and `mayConverge: false`.

## External Review Resolution

Claude's 2026-04-29 STDO/code review accepted that the earlier admitted-event
proof blocker is resolved by archive `20260429T133349413Z`: the live register
now projects from ABG payload-ledger events rather than harness-local rows.

The hop-2 prompt is intentionally shaped. It is the UAT control for the
missing-downstream-evidence path: the worker is instructed not to infer closure
from hop 1 and to return a gap observation so the test can prove that a second
hop without admitted evidence projects `missing`, folds to `retry`, and deepens
the register instead of converging. That is the expected experimental design for
the scenario path that forbids closure from missing downstream evidence; it is
not a semantic shortcut.

Python parity is now suspended explicitly by T-094-PY and T-096. T-094 does not
claim Python tenant closure, Python parity, or Python no-gap sufficiency from
the TypeScript live archive.

## Benchmark Interpretation

ABG does not own the SDLC domain meaning of a generated data_mapper product, and
it should not ship a hard-coded SDLC lifecycle register. ABG does own the generic
assurance law and fact surfaces that allow a downstream product to build that
register from events, authority, evidence, provenance, and closure decisions.

Therefore, reproducing test35 effectiveness means proving that the qualities
which made test35 effective can be represented, projected, and governed through
an event-derived downstream register:

| test35 quality | Register row over ABG facts |
| --- | --- |
| source-visible requirement coverage | authority/evidence binding row coverage |
| large passing test corpus | admitted execution evidence bound to current authority/input digest |
| qualified release closure | assurance fold closes only when rows are fulfilled or lawfully deferred |
| multi-edge traversal closure | graph-call/frame/continuation lineage remains replay-visible |
| gap pressure carried through retries | stale/partial/missing rows reopen or block rather than disappearing |
| reviewable product artifacts | reports and ledgers are read models over event/evidence projection |

The ticket closes only when ABG proves that this register is buildable from
generic facts, or when the remaining missing facts are explicitly posted as GTL
hook, IoC plugin, or downstream adapter tickets.
