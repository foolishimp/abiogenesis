# 5.0 Mining Consolidated: Forgotten Opportunities × Current Base × Proposed Cut

**Type:** ANALYSIS (commentary, not law — cut adjudication is F_H's)
**Author:** claude · 2026-07-10
**Inputs:** three completed survey agents (2026-07-10): abiogenesis comment miner (250 files: claude 61, codex 173, gemini 8, grok 6, jim 2), odd_sdlc comment miner (239 files: claude 64, codex 167, grok 7, jim 1), externalization gap survey (spec/tickets/tarball/docs). Every row cross-checked against ticket BODIES in both repos (257 abiogenesis + 288 odd_sdlc, active/backlog/completed) — "forgotten" is verified, not vibes.
**Current base for all "relation" columns:** 4.6.0-rc.2 (sourceCommit 5c312df), T-217 wave functionally complete, campaign-proven.

**Chains:** SH self-hosting · SP spec-as-product+conformance-suite · EX externalization · TM tenant-multiplication · OT observer-tuner.
**Cut calls (proposed):** MAKE = 5.0 feature set · DEFER = named for 5.1+/tenant wave · PARK = not a build chain, F_H disposition.

---

## 1. The headline the survey forces

**"5.0 = externalization" is net-new direction.** Zero `5.0`/npm-publish/"stranger can install" language exists in specification/, tickets, or READMEs. The pervasive "publish/public" vocabulary is the GTL domain concept (modules publish graph functions), not software release. Local-only distribution is a *deliberate ratified choice* (T-142: "Do not publish to npm or a remote artifact store"). **Therefore the 5.0 plan lawfully enters via `goal_reprice` + `intent_reprice`** — it inverts a ratified stance, it does not extend the 4.6 wave.

## 2. Meta-finding (the defect that forgets things)

The reason 39 opportunities sat unmined **is itself row S2**: POSTING_GUIDE says a post becomes consequential "only when explicitly adopted" but never says by whom, under which change class, with what evidence. There is no comment→specification ratification lifecycle, so high-merit commentary decays instead of graduating. This mining exercise is the manual execution of the missing lifecycle. Proposed: S2 MAKES the cut as method work — otherwise the next 239 posts decay the same way.

---

## 3. Abiogenesis-mined rows (A1–A18)

Source root: `abiogenesis/.ai-workspace/comments/`

| ID | Date | Source (author · file) | Opportunity | Relation to current base (rc.2) | Chain | Cut (proposed) |
|----|------|------------------------|-------------|--------------------------------|-------|----------------|
| A1 | 2026-03-21 | codex · `SCHEMA_gtl-as-portable-orchestration-ir` + HANDOFF twin | Compile one GTL graph to many backends (Step Functions/Temporal/Prefect/local) preserving semantics | **No ticket** — drafted as `BL-001`, never written; nothing compiles GTL to an external backend | TM,EX | DEFER — 5.0's portability story is spec+conformance suite; compile-to-backends is the tenant wave |
| A2 | 2026-03-22 | codex · `HANDOFF_backlog-item-abg-ioc-sdk-entrypoint` | ABG as embeddable IoC **SDK**, not framework/installer-owner; drop `.genesis` filesystem-territory assumptions | **Partial** — same dropped `BL-001`; B-016 took only the hook-contract sliver; entrypoint/packaging reshape residual | EX | **MAKE (partial)** — the packaging/entrypoint reshape a stranger install needs; full IoC inversion defers |
| A3 | 2026-06-30 | claude · `DESIGN_gtl_complete_language_catalog_verified` | Runtime-discoverable, queryable published-function catalog consumers can enumerate/compose over | **Partial** — T-152 built the typecheck gate; discovery surface unbuilt ("a design gap, not implemented") | SP | **MAKE** — released GLC over released ABG needs consumer enumeration, not source-tree reading |
| A4 | 2026-03-25 | codex · `STRATEGY_job-role-worker-requirement-cascade` + competition matrix | Multi-tenant policy / RBAC / authN / authority resolution for hosted installs | **No ticket** | EX,TM | DEFER — hosted-product wave; 5.0 is single-operator externalization |
| A5 | 2026-05-02 | claude · `DESIGN_eval-framework-from-anthropic` (G2) | F_P worker reliability characterization (pass@k / pass^k); sandbox runs each edge once today | **No ticket** — T-102/T-194 don't characterize it | SP,OT | **MAKE** — tenant certification needs a reliability measure, not one-shot green |
| A6 | 2026-03-25/06-07 | codex · BPM-sourced-workflows + competition matrix | Importer/bridge from Airflow/Step-Functions/BPMN so strangers arrive with existing assets | **No ticket** | EX,TM | DEFER — on-ramp tooling after the door exists |
| A7 | 2026-03-26 | codex · `STRATEGY_ceo-to-gtl-to-abg-crosswalk` | **Self-hosting closure as a named, checkable semantic invariant** ("ABG builds ABG under conformance") | **No ticket** — B-010 silently assumes it; exactly B-010's missing prerequisite | SH | **MAKE** — this IS the 5.0 defining goal's predicate; pairs with S1 |
| A8 | 2026-03-31→06-05 | claude+codex · cloud-native strategy trio | Event-log ↔ Temporal-history isomorphism; Bedrock as primary F_P; "use Temporal" adopted in commentary | **No ticket** — adopted, never opened | TM | DEFER — the post-5.0 cloud-native tenant Jim named; 5.0 sets it up, doesn't build it |
| A9 | 2026-05-02 | claude · eval-framework (G1,G3,G5–G7) | Eval maturity cluster: enforced taxonomy, layered/human eval, LLM-judge calibration, eval ownership | **No ticket** — T-101/T-102 built the sandbox, not the disciplines | SP | DEFER (partial) — suite v2; 5.0 takes only what certification needs (A5) |
| A10 | 2026-05-03 | claude · mindforge risk mapping | Operational KRI/model-risk projections (latency, drift, hallucination rate per use case) over payload ledger | **No ticket** — t193 is constitutional drift only | OT,SP | DEFER — OT line; ledger already carries the data |
| A11 | 2026-03-27 + jim design_0502 | codex+jim | F_H real approval infrastructure (CLI/email/web gates, interaction methods) | **No ticket** — F_H architectural only, "deferred from 1.0" | EX,TM | DEFER — S19's spec-only work rides 5.0; infra after |
| A12 | 2026-05-20 | codex · saga/dependency/parallel runtime | Saga runner → distributed substrate; compensation when an admitted branch is superseded | **Partial** — T-141 declared the frontier; distribution+compensation residual | TM | DEFER |
| A13 | 2026-06-26 | codex · requirements-algebra edge spans | ReqIF/DOORS/Jama import-export; stable GUID identities for round-trip | **Partial** — T-162/164/168/169 built algebra+span identity; interchange residual | EX,SP | DEFER — externalization v2 |
| A14 | 2026-03-26 | codex · os-cloud equivalence gaps | Trigger/Window/KPI/SLA as first-class orchestration surface | **Partial** — Schedule done (T-119–126 temporal algebra); rest residual | TM,OT | DEFER |
| A15 | 2026-05-03 | claude · mindforge post | RecurrenceProfile on Module — recertification cadence as graph function | **No ticket** | OT,TM | DEFER |
| A16 | 2026-03-27/06-07 | codex · temporal crosswalk + matrix | Operator console: queryable runs/timers/traces/evidence/approvals | **No ticket** — `gaps` CLI is the current answer | OT,EX | DEFER — 5.0 ships CLI-grade visibility only |
| A17 | 2026-03-26 | codex · best-of-breed reference classes | GTL → CrewAI/agent-team projection with capability provenance | **No ticket** | TM | DEFER |
| A18 | 2026-03-26 | codex · os-cloud gaps | Worker identity vs capability separation (pools/leases need it) | **No ticket** | TM | DEFER — revisit when a distributed tenant needs pools |

## 4. odd_sdlc-mined rows (S1–S21)

Source root: `odd_sdlc/.ai-workspace/comments/`

| ID | Date | Source (author · file) | Opportunity | Relation to current base (rc.2) | Chain | Cut (proposed) |
|----|------|------------------------|-------------|--------------------------------|-------|----------------|
| S1 | 2026-04-20 | claude · `REVIEW_methodology-body-of-work-critical-assessment` | **Maturity Method**: staged self-hosting model (Stage 0 no-method → Stage 4 self-hosting), each stage with enforcement regime + exit closure_law | **No ticket** — the literal genealogy of "5.0 = ABG builds ABG under SPEC_METHOD" | SH,SP | **MAKE** — gives the 5.0 conformance audit its ruler; pairs with A7 |
| S2 | 2026-04-20 | claude · same post | **Comment→spec ratification lifecycle**: post → F_H ratification review → spec edit under named change class → post superseded | **No ticket** — the meta-finding; POSTING_GUIDE never says who adopts, under what class | SP | **MAKE** — method work; operationalizes this whole exercise |
| S3 | 2026-04-06 (orig 03-31) | claude · cross-project idea inventory F4 | ABG cloud-native distributed engine (DynamoDB/Step Functions/Bedrock/Lambda; GTL as JVM/Scala SDK) | **No ticket** — scala_spark in tickets is the data-mapper *target stack*, not ABG itself | TM,EX | DEFER — same disposition as A8 (one item, two repos) |
| S4 | 2026-04-07/08 | codex+claude · odd-service carveout + session-controller | odd_service/odd_manager orchestration plane: session lifecycle, worker registry, SSH transport, MCP+HTTP/SSE, browser client | **Parked as debt only** (odd_sdlc B-004); T-110/T-117 cover session pooling sliver | EX,TM,OT | DEFER — standalone line after 5.0 |
| S5 | 2026-05-11 | claude · `ANALYSIS_recurring-themes-in-closed-tickets` P4 | **Typed path carriers**: SourceTreePath/InstallRoot/TenantLane/SandboxPath/BuilderSubstrate mutually non-assignable, fail-closed at install/materialization/sandbox admission | **No ticket** — named as ontology in CLAUDE.md, never a typed boundary; backs the largest defect cluster in corpus (topology blur, 177 tickets) | SH,TM | **MAKE** — self-hosting's central drift risk is source-vs-builder confusion; this is its type-level fence |
| S6 | 2026-04-06 | claude · idea inventory H3 | Self-extending verifier hierarchy: onboarding a new stack triggers sub-development producing the missing evaluator | **No ticket** | SP,TM | DEFER — suite v2, after the suite exists |
| S7 | 2026-04-11 | codex · `STRATEGY_testing-graph-functions-and-test-assets` | `generic_test_harness` reusable qualification family (generic carrier, stack-specialized binding); planning vs realized traceability; uat vs dev qualification split | **Partial** — T-073/T-100/T-104 touched execution; the reusable library + splits unbuilt | SP,TM | **MAKE (partial)** — the tenant-independent conformance suite needs the harness carrier; splits can lag |
| S8 | 2026-05-17 | claude · `STRATEGY_promise_graph_parallel_execution` | Promise-graph parallel executor: each edge awaits its parents; the await graph IS the scheduler (~100–200 LOC) | **No ticket** — distinct from T-171/T-173; T-174 is a parallel proof, not the executor | SH,TM | DEFER — revisit ONLY if ABG-builds-ABG wall-time proves unaffordable |
| S9 | 2026-05-11 | claude · recurring-themes P1 | `make-carrier` scaffold + ODD-shape lint (flag controller-owned semantic centers, prompt-prose routing) | **No ticket** | EX,SH | DEFER — DX for downstream authors, 5.x |
| S10 | 2026-04-06 | claude · idea inventory G6 | Multivector design marketplace: agents propose/critique/reprice confidence; comments dirs already ARE this | **No ticket** — T-166/167 consensus is structured voting, not market reprice | OT | DEFER — research line |
| S11 | 2026-05-24 | codex · `STRATEGY_layered_assurance_for_fallible_workers` | Per-stage agentic F_P evaluator sidecars across all 22 edges (design-depth generalized to code/test/repair/release) | **Partial** — T-181 one evaluator, T-182 strengthened fulfillment; full rollout unbuilt | SP,OT | DEFER — assurance depth v2 |
| S12 | 2026-04-21 | codex · `STRATEGY_job-bound-materialization-boundary-gap` | **Typed materialization plan per job**: owned write roots, allowed delete roots, protected siblings; effect shell validates pre-disk | **No ticket** — narrow constructor workaround shipped after a destructive re-entry deleted a sibling design/ surface; full model deferred | SH,TM | **MAKE** — ABG-builds-ABG must be structurally unable to eat its own governance surfaces |
| S13 | 2026-04-06 | codex · world-bearing-asset semantics + F6 | GTL4 ratification-pressure loop: ODD proves which type semantics are universal → graduates into GTL core | **No ticket** as governance loop | SP | DEFER — adopt the principle inside S2's lifecycle; machinery later |
| S14 | 2026-05-09 | jim · `graphfunctions_odd` (+claude/codex replies) | Node subtype/is-a dispatch: evaluate_next as type-directed dispatch; CandidateFamily as published choice set; FrameClosureEvidence lift rule | **Partial** — T-180 adjacent; CandidateFamily exists as carrier; subtype-directed dispatch unformalized | SP,SH | DEFER — GTL spec evolution, post-5.0 |
| S15 | 2026-05-10 | claude · requirements-lineage SCHEMA (quoting INTENT.md:275) | OpenLineage projection layer | **No ticket** — explicit constitutional deferral "when external lineage consumers exist" | EX | DEFER — condition not yet true; 5.0 creates the consumers |
| S16 | 2026-05-11 | claude · recurring-themes P7 | `abg_defaults` strongly-typed config carrier + anti-`??` lint; record when a default participated in selection | **Partial** — T-117/T-118 externalized the bundle; typed API + lint residual | EX,SP | DEFER |
| S17 | 2026-05-11 + 06-25 | claude P3 + codex anti-F_D-drift | **Behavioral-F_D-leakage fail-closed gate**: closure-fold refuses when a deterministic check sits between F_P assessment and closure unless registered as F_D-mechanics-class | **Partial** — T-183/T-187 delete leaks *reactively*; the 06-25 post proves the leak recurs because no typed gate exists | SP | **MAKE** — a conformance-suite core law; recurring defect class with proof of recurrence |
| S18 | 2026-05-11 | claude · recurring-themes P2 | **A13a causal-predecessor-ref admission gate**: any carrier schema lacking causal-predecessor refs fails admission | **Partial** — T-188/T-196/T-197 enforce carry-through + proof-strength; the universal any-carrier gate residual | SP,SH | **MAKE** — completes the carry-through wave into a universal law |
| S19 | 2026-04-20 | claude · critical-assessment | F_H review-surface specification: what the human is GIVEN, format, closure contract (+ unnamed `requirement_retire` change class) | **No ticket** — T-022 dossier adjacent; abiogenesis T-178 is the runtime-side neighbor | SP,OT | **MAKE (spec-only)** — 5.0 is SPEC_METHOD conformance; the method's heaviest-used regime deserves a specified surface; realization may lag |
| S20 | 2026-05-27 | codex · T184 event-source strategy | **ABG public ingress for all six tenant-authored runtime-transition classes** — no downstream tenant emits runtime events locally; tenant supplies evidence refs, ABG emits | **Partial** — T-148/T-154 touch continuation/span-reentry; consolidated tenant-facing ingress unbuilt | EX,SH | **MAKE** — the clean public API line external tenants certify against; three-layer ownership made structural |
| S21 | 2026-04-06 | claude · idea inventory H4 | Patent/IP: 5 defensible clusters (convergence gradient, contract-preserving refinement, evaluator escalation, provenance-carrying selection, operator/evaluator separation) | **No ticket** | EX | **PARK** — F_H/legal disposition, not a build chain; also flagged abiogenesis-side (patent-landscape post 2026-03-31) |

## 5. Candidate production tenants (the column 5.0 sets up, not builds)

| ID | Date | Source | Candidate | Relation to current base | Cut (proposed) |
|----|------|--------|-----------|--------------------------|----------------|
| T1 | 2026-05-19 | claude · odd_sdlc `RESEARCH_pnl_explain_forensic_attribution` | PnL-Explain forensic attribution (derivatives+coal): F_D→F_P→F_H cascading attribution over typed Trade/Cargo/Desk/RiskFactor carriers; Appendix B sketches the GTL shaping | **No ticket** — "filed for future retrieval"; first non-toy domain beyond data_mapper | DEFER — first-wave tenant candidate against the 5.0 conformance suite |
| T2 | 2026-04-14 | codex · odd_sdlc `STRATEGY_domain-builder-as-pre-mapping-bounded-context-construction` | `domain_builder`: constructs an org's bounded context (concept inventory, authority, lifecycle, adjacency) that data_mapper then consumes | **No ticket** | DEFER — natural data_mapper sibling; cheap second certification domain |

Plus Jim's named endgame tenants (not mined — directive): **production-hardened Scala implementation** and **cloud-native (A8/S3)** — both certify against the 5.0 spec+conformance suite rather than porting the TS code.

## 6. Externalization survey blockers (B1–B8) — all MAKE by definition

Between "works for odd_glc on Jim's machine" and "a stranger can npm-install it":

| # | Blocker | Evidence |
|---|---------|----------|
| B1 | `"private": true` in the tenant package AND stamped onto every installed consumer | package.json:4; install.ts:48 |
| B2 | No LICENSE anywhere; no repository/author/description/homepage metadata | verified absent repo-wide |
| B3 | No registry path: `npm pack` → `.abg-toolchains` local store → `file:` dep into a `pack-p09k3t` hash dir | odd_glc/package.json:9; T-142's ratified no-npm stance must be repriced |
| B4 | Agent CLIs (`claude`, `codex` with gpt-5.5 default) assumed on PATH + authenticated — undeclared prerequisite | transport_contracts.ts:64–93 |
| B5 | Builder guide hardcodes `/Users/jim/...` install commands | LLM_GTL_APP_BUILDER_GUIDE.md:3696,3700 (USER_GUIDE.md is clean) |
| B6 | Perpetual `-rc` identity; consumers pin tarball hash dirs, no semver/stable-tag discipline | 97 local snapshots, no stable tag |
| B7 | Entire internal tree is public API: 8-line wildcard root barrel → ~1053 identifiers (~372 zero-consumer) + shipped sourcemaps | C-6 census; this is where C-6 pays off as a curated public surface |
| B8 | No portable consumer test gate: live/UAT need agent CLIs + env fixtures; one sandbox test hardcodes a path | only `test:semantic` is machine-portable today |

Good news verified: shipped source is path-clean (zero `/Users/jim`), secret-clean, one runtime dep (valibot), exports map intact, tarball 1.12MB/771 entries.

## 7. Proposed 5.0 cut — one screen

**MAKE (13 mined + 8 blockers):**
- **SH spine:** A7+S1 (closure invariant + Maturity Method), S5 (typed path carriers), S12 (materialization plan), S18 (causal-predecessor gate)
- **SP suite:** A3 (discoverable catalog), A5 (pass@k), S7-partial (generic harness), S17 (anti-F_D-leak gate), S2 (ratification lifecycle), S19 spec-only (F_H surface)
- **EX core:** A2-partial (SDK entrypoint reshape), S20 (public ingress), B1–B8
- Plus already-parked 4.6 hygiene that 5.0 inherits: C-2 splits, C-6 barrel prune (B7 is its payoff).

**DEFER (named, not dead):** A1, A4, A6, A8/S3, A9, A10, A11, A12, A13, A14, A15, A16, A17, A18, S4, S6, S8, S9, S10, S11, S13, S14, S15, S16, T1, T2.
**PARK (F_H):** S21 patents (+abiogenesis patent-landscape twin).
**Dead:** none — every mined row either makes, defers with a named trigger, or parks.

## 8. Anything-else flags

1. **Dedup map:** A8≈S3 (same cloud-native idea, both repos); A7↔S1 (same invariant: predicate vs staging); A2↔S20 (complementary halves of the public API story); S2↔S13 (lifecycle family); A1↔A17 (projection family).
2. **Patent flag** appears independently in both corpora (S21 + abiogenesis 2026-03-31 patent-landscape post). Not a build chain; wants a one-time F_H disposition so it stops resurfacing.
3. **Observer-tuner chain mined nearly empty — a finding, not a gap:** T-206/T-207/T-217/T-165 already ticketed that line; the forgotten value concentrates in EX and TM exactly where 5.0 points.
4. **Genealogy:** S3/S6/S10/S13/S21 originate in grandparent repos (genesis_sdlc/odd_method era) and survived via the 2026-04-06 cross-project inventory — re-verified unticketed against TODAY's ticket sets.
5. **Verified non-forgotten (hard filter applied):** consensus/review families (T-166/167), Min(F_P) (T-173), temporal algebra (T-119–126), prompt assets (T-150), sticky sessions (T-110), zoom/fold (T-070/155), idempotent instances (T-069) — the miners excluded ~30 candidate items as already-ticketed.
6. **Dropped after verification:** E6 upstream-reentry primitive (grok flagged 06-11; codex 06-25 confirms addressed).
7. **Raw agent reports** preserved verbatim in session scratchpad (`miner_abiogenesis.md`, `miner_odd_sdlc.md`, `survey_externalization.md`); this document is the consolidation of record. Agent effort: 96.9k + 288.6k + 86.3k tokens.
