# ANALYSIS: Original Scenario Bundles — Current Implementability

**Type:** ANALYSIS (commentary; changes no law).
**Author:** claude · 2026-07-12 (ideas/review mode)
**Subject:** every bundle under `specification/scenarios/` assessed against the
committed substrate — which are implementable today, and concretely how.
**Baseline:** commit `8689552`. Verified today by rerun: `test:gtl-law` 35/35,
`test:t223` 70/70, `test:t104` 6/6. Verified by count: 13/36 public operations,
7/16 published capabilities, 4/7 C terms executable. Codex's in-flight
uncommitted Consensus realization (`consensus.ts` + three `test_a5_consensus_*`
lanes) is **excluded** from this baseline — it enters at its own review.

---

## 1. The table

Statuses: **PROVEN** = lanes exist in the tenant and the family runs green.
**NOW** = substrate complete; authoring the bundle/lane is the only work.
**PARTIAL** = most paths run today; named paths blocked by a finite gap.

| # | Bundle | Validates | Status | How, today (concrete lanes/path) | Named gaps |
|---|---|---|---|---|---|
| 01 | Language primitives & traversal | REQ-L-GTL3-LANGUAGE/ATTRS/CONTEXT/GRAPH/NODE/GRAPHVECTOR/INTERFACE/IDENTITY | **PROVEN** | `npm run test:gtl-law` (35/35 today); `t009` m01 roundtrip + negative-ingress lanes; semantic build; `test_t180_gtl_node_types_live` for declaration-level node_type | none on declared paths (node_type *application* is catalog work, out of this bundle's scope) |
| 02 | Governed transition surfaces | REQ-L-GTL3-OPERATOR/EVALUATOR/RULE/HOOKS/SUBWORK | **PROVEN** | `test_m03_engine_kernel_integration`; `test_b016_ioc_hook_authority`; leaf-task lanes; hooks exercised live by the campaign | none blocking |
| 03 | Graph-function algebra | REQ-L-GTL3-GRAPHFUNCTION/COMPOSE/SUBSTITUTE/RECURSE/HOF/LAWS/SELECTION-BOUNDARY/SYNTHESIS | **PROVEN** (algebra) / **PARTIAL** (three C-terms) | T-220 typed C algebra + authoring guard (in gtl-law run, 19 type-negatives); `test_t100_five_rule_algebra_live`; `test_m03_graph_function_iteration_*` + `t044/t045` negatives; `test_t155_graph_function_zoom_plan_live` | `workflow.C`/`C.batch`/`C.retry` runtime realization — honest typed `semantic_not_realized` today; = the T-244 wave-one register row |
| 04 | Publication & semantic work | REQ-L-GTL3-MODULE/ROLE/JOB | **PROVEN** | `test_m02_work_publication_integration`; `module.publish@5`/`catalog.contribute@5` published capabilities; every live lane enters `Job -> GraphFunction` | publish as a public **CLI operation** not yet (13/36); publication runs through the build/catalog path |
| 05 | Runtime aggregates & event truth | REQ-R-ABG3-EVENTS/BINDING/WORKER/JOB-WORKER/RUN/GRAPHCALL/FRAME/CONTINUATION | **PROVEN** | m03/m04 integration lanes; `test:t104` cross-workspace allocation (6/6 today); `test:t223` packed steel thread (70/70 today); `test_t223_packed_hello_world_live` | none on declared paths |
| 06 | Replay, lineage & correction | REQ-R-ABG3-PROJECTION/LINEAGE/PROVENANCE/CORRECTION/RETRY | **PROVEN core** | replay-derived projections throughout; `test_m03_retry_repair_unit`; the rc.2 campaign is the at-scale proof (64/64 verified-restore = correction law under mutation, 2 retries with fresh attempt identities) | CR-RL residuals (emitter-context, basis-fork, continuation-projection) — small known bugs, tracked on T-242's KEEP list |
| 07 | Governed probabilistic runtime | REQ-R-ABG3-INTERPRET/CONVERGENCE/POLICY/SELECTION-APPLICATION/LEAFTASK/TRANSPORT + REQ-M mapping/provenance | **PROVEN** | richest family: `test_t113_live_pty_claude_actor_worker`, `test_t087_supervised_actor_invocation_live`, `test_t150_gtl_prompt_asset_surface_live`, `test_t151_segment_scoped_evaluation_redispatch_live`, `t026`/`t072` transport+plugin negatives, S2.3 driver-compat admission boundary | none blocking; policy-bundle breadth grows by demand |
| 08 | Derived artifact governance | REQ-R-ABG3-SELFHOSTING | **NOW** (requirement under T-249 reprice) | LAWS-028 constitutional witness (surface digest drift = typed diagnostic); conformance manifest; the rc.3 + odd_glc 0.1 releases already ARE derived-artifacts-with-digest-chain-drift-checks | the scenario text survives the reprice untouched — **note: even the SELFHOSTING scenario never asked for C1/C2**; self-certifying release snapshot stays on the demand register |
| 09 | Research-lab families (Extract/Synthesis/Transform/Fan-out/Ambiguity/Gap-eval) | REQ-P-SCENARIOS, REQ-P-POLICY, HOF, INTERPRET | **NOW** (families 1–5) / **PARTIAL** (family 6) | families 1–4: the data-mapper campaign is a live at-scale instance (real Scala, typed contracts, per-item lineage in the evidence ledger, mutation-proofed) — authoring per-family bundles is declaration work, no new runtime; family 5 (ambiguity): candidate/evaluator-result vectors + admissible ambiguity observations exist (`test_t127_fp_consciousness_scenarios_live` touches this) — needs its bundle authored | family 6 (gap evaluation): read side BUILT (gap/hold/stop projections, `genesis-ts gaps`, observer drafts 12/12 triage ground truth) but the scenario requires the triage carrier as a **published graph function** — that carrier is exactly the homeostatic middle segment (T-244 `A5-CONSENSUS-01` + the T-245 gap-admissibility bridge) |
| 10 | Total assurance projection UAT | REQ-R-ABG3-ASSURANCE + EVENTS/LINEAGE/PROJECTION/TRANSPORT/CONVERGENCE, REQ-P-SCENARIOS/QUAL | **PROVEN** | the cited live lane exists: `test_env/live/test_t094_assurance_register_two_hop_live.test.mjs` (two-hop Claude register, deepen + `mayConverge:false`); UAT-001..007 map to deterministic tenant lanes + operator-gated live lanes | none on declared cases; live lanes operator-gated by design |
| 11 | Event-sourced payload ledger UAT | REQ-R-ABG3-PAYLOAD + EVENTS/PROJECTION/ASSURANCE, HOOKS | **PROVEN core** | `test_t095_payload_ledger_unit`; payload envelope admission + the classification matrix realized (the rc.2 evidence-ledger machinery: 129 truth rows, verified-restore consuming payload/evidence law); campaign archives per REQ-P-QUAL-018I | a single named harnessed-sandbox full-archive bundle lane could be authored; nothing blocking |
| — | TESTCASE_AUTHORITY matrix | (map) | **CURRENT** | every live requirement family maps to a bundle; REQ-M-GTL3-CAPABILITY correctly noted deferred | matrix should gain per-bundle "current executable lane" pointers — this table is that draft |

## 2. Roll-up

- **PROVEN today:** 01, 02, 04, 05, 07, 10, and the cores of 03, 06, 11 —
  eight-plus of eleven bundles have running lanes in the committed tenant.
- **Implementable now (authoring only, no new runtime):** 08, 09 families 1–5,
  the residual bundle lanes of 06/11.
- **Blocked paths across the ENTIRE catalog reduce to a finite, named list:**
  1. `workflow.C`/`C.batch`/`C.retry` runtime realization (03) — T-244
     wave-one row;
  2. published triage graph function + admitted gap-event bridge (09 family
     6) — the homeostatic middle; T-244 `A5-CONSENSUS-01` + T-245 bridge;
  3. publish/contribute as public CLI operations (04) — the 36-op completion;
  4. CR-RL replay residuals (06) — small independent fixes;
  5. self-certifying release snapshot (08) — demand register.

## 3. The finding that matters

The original scenario catalog **independently re-derives the same
remaining-work set as the T-244 register** — the gaps above map one-to-one
onto the register families already routed. And in the other direction:
**no scenario in the original catalog demands anything the course correction
dropped.** Scenario 08 — the one validating REQ-R-ABG3-SELFHOSTING itself —
asks only for derived-artifact governance and deterministic drift detection
under ordinary law; it never asked for the C1/C2 packaging fixed point. The
original proving surface and the corrected 5.0 target agree with each other.

## 4. Boundary

Commentary. Baseline facts verified as listed in the header; live-lane
existence verified by file inventory; suites cited as green were rerun by me
today, not attested. Codex's in-flight Consensus work is excluded and will be
reviewed on presentation. The writer owns any routing (e.g., adding the
per-bundle lane pointers to `TESTCASE_AUTHORITY.md`).
