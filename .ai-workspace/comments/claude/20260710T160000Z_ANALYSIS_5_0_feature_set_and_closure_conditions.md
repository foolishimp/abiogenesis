# ABG 5.0 — Feature Set and Closure Conditions (proposed for F_H adjudication)

**Type:** ANALYSIS (commentary; the cut is Jim's ruling — this closes the FIND phase)
**Author:** claude · 2026-07-10
**Sources synthesized:** active ticket T-217; backlog B-010/T-178/T-179; dual-review round-2 residuals (`20260710T150000Z_REVIEW_t217_dual_review_round2_consolidated.md`); mining consolidated cut (`20260710T131500Z_ANALYSIS_...`); externalization survey; the 5.0 direction rulings (self-hosting = "gcc v1.0 builds gcc v2.0"; spec+conformance-suite as product; tenants certify, not port).

**5.0 in one sentence:** the release after which a released GLC runs over a released ABG, ABG builds ABG under SPEC_METHOD conformance, and a stranger (human or tenant team) can consume the substrate without reading Jim's source tree.

---

## Gate 0 — prerequisites (not 5.0 features; 5.0 cannot open until these close)

| ID | Item | Source | Closure condition |
|----|------|--------|-------------------|
| G1 | **4.6.0 final ships** — T-217 Phases 5–6: proving campaign with the human F_H seat; C-2 monolith splits + C-6 barrel prune; the rc.2 P0 fix and review-round fixes ride the next cut | T-217 | T-217 closed by its own non-closure conditions; authored release note; snapshot manifest self-certifies (now mechanical) |
| G2 | **5.0 direction lawfully admitted** — `goal_reprice` + `intent_reprice`: externalization inverts the ratified T-142 no-npm stance; self-hosting becomes a named goal | survey headline | GOALS/INTENT edits ratified under SPEC_METHOD; T-142's stance formally superseded |

## Chain SH — self-hosting (the defining goal)

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F1 | **Self-hosting closure invariant + Maturity Method** — a named, checkable predicate "ABG builds ABG under conformance", staged Stage 0→4 with per-stage enforcement regime and exit closure_law | mining A7+S1 (B-010's missing prerequisite) | Requirement family ratified; an F_D gate evaluates the predicate over the replay of a real ABG-builds-ABG run |
| F2 | **ABG-builds-ABG acceptance campaign** — a software-build scenario whose SUBJECT is the abiogenesis tenant itself, driven over the INSTALLED prior release | direction ruling | Campaign converges on installed substrate; committed evidence ledger (rc.2 pattern); zero scenario patches; F1 predicate green over its replay |
| F3 | **SPEC_METHOD conformance audit of ABG's own surfaces** — the method applied to its builder: specification/, requirements/, design/, tickets | direction ruling | Audit report; every deviation fixed or F_H-accepted as a debt row; t193-class drift gates extended to constitutional-surface conformance |
| F4 | **Typed path carriers** — SourceTreePath / InstallRoot / TenantLane / SandboxPath / BuilderSubstrate mutually non-assignable, fail-closed at install/materialization/sandbox admission | mining S5 (backs the 177-ticket topology-blur cluster) | Carriers + admission gates shipped; differentials prove cross-assignment rejects; self-hosting's source-vs-builder boundary is type-fenced |
| F5 | **Job-bound materialization plan** — typed owned-write/allowed-delete roots + protected siblings; effect shell validates before disk | mining S12 | Carrier + enforcement + differential (attempted sibling-surface delete → typed refusal); ABG-builds-ABG cannot eat its own governance surfaces |
| F6 | **B-010 unblocked and executed** — ABG source development governed by the released substrate | backlog B-010 (blocked on exactly what 5.0 delivers) | B-010's own acceptance rows; no `.genesis` residue; source/install/product boundaries intact |

## Chain SP — spec-as-product + conformance suite

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F7 | **Tenant-independent conformance suite extraction** — partition the 1296 differentials into spec-law vs TS-detail; publish the suite as a versioned artifact | direction ruling (the tenant endgame's certification target) | Suite runs green against the INSTALLED TS tenant from outside the source tree; suite manifest versioned and self-certifying |
| F8 | **Consumer-discoverable published-function catalog** | mining A3 (T-152 residual) | Runtime-queryable catalog API; differential: a consumer with no source access enumerates and composes |
| F9 | **pass@k worker reliability characterization** | mining A5 | Suite measures per-edge first-try vs after-retry close over N runs; report admitted as evidence, consumed by certification |
| F10 | **generic_test_harness qualification family** (partial: the reusable carrier; uat/dev split may lag) | mining S7 | Family published; one non-JS binding certified through it (the Scala data-mapper stack already exercises the shape) |
| F11 | **Behavioral-F_D-leak fail-closed gate** — closure-fold refuses undeclared deterministic checks between F_P assessment and closure | mining S17 (recurrence proven) | Typed gate + differential; existing registers migrated or registered as F_D-mechanics-class |
| F12 | **A13a causal-predecessor admission gate** — any carrier schema lacking causal-predecessor refs fails admission | mining S18 (completes T-188/196/197) | Universal gate + differentials |
| F13 | **Comment→spec ratification lifecycle + F_H review-surface spec** (spec-only for the F_H surface) | mining S2+S19 (the meta-finding) | Method ratified in specification_methodology; POSTING_GUIDE names who/which-change-class/what-evidence; lifecycle exercised once end-to-end on a real post |
| F14 | **Handler-authority Prime** — binding schema carries/derives authority class + equivalence-contract identity; resolution law enforces ratified annealing/equivalence for F_D interiors | codex C7 (review round 2) — `requirement_reprice` class | Reprice ratified; schema + resolution + differentials; the tuner auto-ratify policy-surface rider lands with it |
| F15 | **EVENTS-025 scope-class semantics** — classes consumed by the basis filter or explicitly demoted to documentation; null-runId blending resolved | review round 2 residual | Design ruling recorded; implementation + differential per ruling |

## Chain EX — externalization core

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F16 | **License + publishable metadata** — de-private (package + installer stamp), LICENSE, repository/author/description | survey B1+B2 | `npm pack` publish-lints clean; installer stops stamping `private: true` |
| F17 | **Registry/publish flow + semver discipline** — real publish path (registry or tagged tarball releases); stable-tag policy ends hash-dir pinning | survey B3+B6 (requires G2's T-142 reprice) | A stranger installs by version range from the public path; odd_glc repinned once via that path as the proof |
| F18 | **Curated public API** — explicit export surface (the C-6 payoff), sourcemaps decision, breaking-change policy | survey B7 (~1053 identifiers, ~372 dead today) | Exports map curated; consumer-visible census equals the declared list; policy documented |
| F19 | **Agent-CLI prerequisite declared + decoupled** — transports as operator-supplied capability with typed absence failure | survey B4 (F5.0 seam already explicit in `buildStandardHandlerImplementations`) | Fresh machine without CLIs: typed failure with setup instructions; with CLIs: live path green |
| F20 | **Consumer-portable docs + consumer test gate** | survey B5+B8 | Builder guide de-personalized (no `/Users/jim`); a documented consumer gate (`test:semantic`-class) green on a fresh install |
| F21 | **ABG public ingress for tenant runtime transitions + SDK entrypoint reshape** — all six transition classes enter via public API; drop `.genesis` filesystem-territory assumptions from the entrypoint | mining S20 + A2-partial | odd_glc emits ZERO runtime events locally (repin proves it); entrypoint consumable as an embedded dependency |
| F22 | **Registry lifecycle semantics** — retirement/revocation/supersession + non-graph entry kinds | backlog T-178 + T-179 (a versioned public registry needs both) | Their own ticket acceptances |

## Chain TM — tenant multiplication (5.0 SETS UP, does not build)

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F23 | **Tenant-onboarding pack** — spec + conformance suite + public API + docs sufficient to START a new tenant without reading TS source | direction ruling ("sets us up for genuine build tenants") | Dry-run audit: a scoped fresh-context agent builds a hello-world tenant skeleton from published artifacts ONLY |

Named post-5.0 exits (deferred WITH triggers, not features): production Scala tenant, cloud-native (A8/S3), PnL-Explain (T1), domain_builder (T2), portable orchestration IR (A1) — each begins by certifying against F7.

## Hygiene rider (runtime-law completion from review round 2)

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F24 | **Four named residual pins**: engine-level differential for assembly fail-closed conversion; installed-gate cross-process C-4 pre-stamp rejection; `decisiveByAdmissionOrdinal` equal-ordinal tie fail-closed; C-4 store-scoped context adoption on the engine's own emissions | review round 2 residuals 1/2/4/5 | Each pin/differential green; no silent caps |

## 5.0 release closure conditions (the whole-release gate)

1. Every F-row closed by its stated condition, or carried as an **F_H-accepted debt row** (debt acceptance is Jim's ruling — the gates-run-every-review law).
2. **The self-hosting acceptance (F2) is green over the released 5.0-rc substrate itself** — the release proves itself before it ships.
3. **Released-GLC-over-released-ABG** operating configuration proven: odd_glc pinned through the public path (F17), suite green, campaign evidence committed.
4. The conformance suite (F7) green from an installed-only context; zero source-tree imports on any live proof path (the strengthened conformance pin enforces this mechanically).
5. Snapshot manifest self-certifies build+lint+suite (mechanical since `8b508c2`); no cut from red is possible.
6. Standing rulings hold: dual review before the cut; a clean campaign precedes any RC claim; all live proof on sandbox-style installs.

## Explicitly OUT of 5.0

- Python parity line (T-092/T-094/T-095) — paused by standing ruling.
- Observer/tuner enhancements (mining A9/A10/A15/A16, S10, S11) — the tier shipped in 4.6; enhancements ride their own wave.
- odd_service/odd_manager (S4), RBAC/auth (A4), F_H approval infra (A11), BPMN import (A6), ReqIF interchange (A13), CrewAI projection (A17), worker identity/capability split (A18), promise-graph executor (S8 — revisit only if F2 wall-time demands it), make-carrier scaffold (S9), abg_defaults carrier (S16), subtype dispatch (S14), OpenLineage (S15 — its precondition "external lineage consumers exist" only becomes true AFTER 5.0), GTL4 ratification loop (S13 — principle folded into F13).
- Patents (S21) — parked for one-time F_H disposition.

## Suggested sequencing (three waves inside 5.0)

- **Wave 1 (foundations):** G1→G2, F13 (lifecycle first — everything else then ratifies through it), F14, F15, F4, F5, F24.
- **Wave 2 (suite + surface):** F7–F12, F16–F20, F22.
- **Wave 3 (the proof):** F8/F21 integration, F1→F2 (self-hosting acceptance), F3, F6, F23, release closure conditions 1–6.
