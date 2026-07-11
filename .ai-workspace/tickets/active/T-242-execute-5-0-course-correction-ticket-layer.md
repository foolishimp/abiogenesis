# T-242 - Execute The 5.0 Course Correction At The Ticket Layer

- id: T-242
- title: Execute the 5.0 course correction at the ticket layer
- type: reprice
- ticket_category: governance_reprice
- status: active
- goal: abg-5-0-full-product-delivery (retargeted to the campaign model; constitutional text reprice registered as residual R1)
- owner: abiogenesis
- priority: critical
- governance_scope: SPEC_METHOD, TICKET_METHOD
- change_class: goal_reprice
- re_entry_point: specification/GOALS.md
- created_at: 2026-07-12
- updated_at: 2026-07-12
- decision_ref: F_H ruling 2026-07-12 — "run the course correction, redo the tickets, retire anything overblown, then pause and review"
- analysis_ref: .ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md (rev 3)
- implementation_authorization: >-
    Ticket-layer dispositions and successor ticket creation only. No code,
    specification, design, requirement, release, or constitutional surface
    changes are authorized under this ticket. The GOALS/INTENT text reprice is
    residual R1 and follows the announced review pause.

## Intake Triage

1. Substantive: yes. This retargets the 5.0 delivery from the T-218 revision-5
   formal self-host leaf DAG (B5 carrier, C1/C2 packaging fixed point, DS-2
   kernel mega-leaf, front-loaded DS-3/DS-4/DS-7/DS-8 chains) to the campaign
   model (installed 4.6-line + GLC 0.1 discipline authoring GTL 5.* as a
   data-mapper-pattern campaign subject). Not editorial.
2. Boundary: `.ai-workspace/tickets/` only. No code, specification, design,
   or release surface changes in this ticket's execution.
3. Upward-propagation walk to the first missing layer: code (unchanged) →
   design (unchanged; four untracked self-build carrier drafts flagged as
   residual R6, unratified) → requirements (unchanged; T-241's completed
   bootstrap-serving reprice flagged as residual R7) → PRODUCT (unchanged) →
   INTENT (unchanged) → **GOALS: GOAL-034's promoted delivery target no longer
   reflects F_H direction** ⇒ derived change class `goal_reprice` ⇒ re-entry
   point `specification/GOALS.md` ⇒ affected span: the 5.0 leaf DAG (18 ticket
   dispositions) plus the successor set (T-243, T-244, T-245) ⇒ release scope:
   none now; GTL-5 releases are cut per converged artifact later.
4. Ordering rationale: F_H's ruling is the standing authority; this ticket
   executes its ticket-layer consequence first so no agent continues deepening
   dropped leaves under T-218's DAG. The constitutional text reprice (R1) lands
   after the review pause to avoid editing GOALS.md mid-correction.

## Authority

F_H ruled the retarget directly in session on 2026-07-12 after the rev-3
analysis post. The defining findings relied on (post §§):

- §3.1 the T-218 self-host loop is a packaging fixed point over frozen S5 —
  the authoring capability 5.0 targets sits outside the certified loop;
- §0/§3.2 the inversion: codex's plan makes the campaign a test the new
  runtime must pass; F_H's model makes the campaign the builder;
- §6 live evidence: the campaign converges on ABG 4.6 as-is;
- §7 constitutional form: obligations derive from admitted assets (gap event →
  intent → ticket), never static enumeration.

## Disposition Table (executed under this ticket)

| Ticket | Was | Disposition | One-line reason |
|---|---|---|---|
| T-224 | active (codex) | superseded_by_course_correction | B5 packaging-carrier design; the bootstrap's entry leaf |
| T-225 | backlog | superseded_by_course_correction | B5 feasibility realization for the dropped carrier |
| T-226 | backlog | superseded_by_course_correction | up-front DS-2 C-runtime design; content → reference for campaign waves |
| T-227 | backlog | superseded_by_course_correction | DS-2 kernel mega-leaf; work re-enters demand-sized as campaign subject content |
| T-179 | active (queued after T-225) | superseded_by_demand_driven_reentry | node_type/overlay design behind the dropped gate; no demand signal |
| T-228 | backlog | superseded_by_demand_driven_reentry | node_type/overlay realization; no demand signal |
| T-229 | backlog | superseded_by_demand_driven_reentry | complete-operator-contract design; current CLI already drives campaigns |
| T-230 | backlog | superseded_by_demand_driven_reentry | complete-operator-product realization; same |
| T-231 | backlog | superseded_by_course_correction | formal self-conformance/observer proof on the self-host path |
| T-232 | backlog | superseded_by_course_correction | realization half of T-231 |
| T-233 | backlog | superseded_by_course_correction | two-stage self-host + C1/C2 equivalence design (packaging fixed point) |
| T-234 | backlog | superseded_by_course_correction | self-host realization + R5:=C1 freeze; R5 identity dropped |
| T-235 | backlog | superseded_by_course_correction | exact ABG5+G5 pair qualification; pair identities dropped |
| T-236 | backlog | superseded_by_course_correction | final 5.0 tap coupled to the fixed point |
| T-237 | backlog | superseded_by_course_correction | released-pair verification for dropped identities |
| T-238 | backlog | superseded_by_course_correction | A5-R1 verdict framework; ledger evidence is the qualification surface |
| T-239 | backlog | superseded_by_course_correction | DS-4Q pre-freeze enforcement; no freeze exists to gate |
| T-240 | backlog | superseded_by_course_correction | ABG 5 RC publication as self-host candidate |

Kept untouched: T-218/T-220/T-221/T-222/T-223/T-241 (completed history closes
by its stated conditions), T-219 (spec reconciliation, independent), B-010
(aligns with the campaign model — it is the discipline-induction backlog item),
T-110, T-178 (independent backlog).

## Demand-Driven Register

Re-entry mechanism for every entry: typed gap event in admitted campaign
ledgers (e.g. `semantic_not_realized` identities `gtl-c-unrealized-workflow-*`)
→ intent → ticket. Entries are pointers, not obligations; nothing below is
scheduled work.

1. `workflow.C` runtime realization — wave-one subject candidate (from
   T-226/T-227 content; T-226's design is reference input).
2. node_type/overlay catalog kinds — from T-179/T-228; T-218's narrowing law
   (public kinds limited to graph_function/node_type/overlay) survives as the
   scoping constraint for any re-entry.
3. Public operator completions — per-verb, from T-229/T-230, when the campaign
   surface needs an operation the current CLI/SDK lacks.
4. SP campaign subset — F7 suite extraction, F10 generic harness, F11 F_D-leak
   gate — likely pulled early (a language/runtime subject's UAT surface is the
   conformance suite).
5. Packaging-determinism gate — the DS-5 salvage (post §3.3): pack frozen
   source on predecessor and candidate installs, compare release-significant
   digests; one release-discipline assertion.
6. Lightweight self-certifying release snapshot — from T-238's kernel; closes
   the odd_glc 0.1 manifest gap (build:null/lint:null/no test summary).
7. odd_glc T-033 declarations-only demotion — convenient cleanup, odd_glc pen.

## Residual Register (review-pause queue)

- R1: constitutional reprice — GOALS.md GOAL-034 (and any INTENT 5.0 language)
  to the campaign model; folds in the §8.1 substrate/subject immutability rule
  and the §4 provenance-not-reproducibility trade for explicit ratification.
- R2: Python "paused" → "withdrawn" reconciliation — TENANT_REGISTRY.md,
  completed T-096 framing, INTENT/GOALS carrier language (parity tickets
  already withdrawn at `8ea0310`).
- R3: settle the 4.6 predecessor line — carried by T-243 (F_H decision).
- R4: EX + SP-product scope call (in 5.0 vs lift to 5.1) — F_H decision; this
  sizes the release.
- R5: odd_glc cross-repo — T-033/T-037/T-038/T-039 G5-chain coupling to the
  dropped R5/I1 identities needs retargeting in odd_glc's own tree (not edited
  from this repo per workspace rule).
- R6: codex's four untracked self-build carrier drafts
  (`build_tenants/abiogenesis/typescript/design/M02_M04_SELF_BUILD_PROGRAM_*.md`)
  — archive-as-reference or delete; codex/F_H call at review. Not touched here.
- R7: T-241's completed requirement reprice (REQ-P-INSTALL / I4 bootstrap
  compatibility profile, REQ-R-ABG3-SELFHOSTING references) served the dropped
  bootstrap — R1 reviews whether that text stands on its own or re-reprices.

## Successor Set (created under this ticket)

- T-243 — Settle the 4.6 predecessor line (reopen the T-221 fork). Backlog;
  awaits F_H ruling at the review pause.
- T-244 — Author the GTL-5 subject specification seed (wave one: workflow.C).
  Backlog; blocked on this ticket's ratification.
- T-245 — Author the SCN-ABG-SOFTWARE-BUILD campaign scaffold (F25 scenario
  pack + F26 supervisor seat). Backlog; blocked on T-242 + T-244.

## Closure Condition

This ticket closes when F_H's announced review pause ratifies (or amends) the
executed dispositions and the successor set. The residual register items are
successor work, not closure conditions of this ticket. Objective artifacts:
the 18 disposition records committed, the three successor tickets committed,
this register committed.
