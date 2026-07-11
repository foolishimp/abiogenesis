# T-242 - Execute The 5.0 Course Correction At The Ticket Layer

- id: T-242
- title: Execute the 5.0 course correction at the ticket layer
- type: reprice
- ticket_category: governance_reprice
- status: active
- goal: GOAL-035 (ABIogenesis 5.0 full-product delivery — retarget in progress; GOAL-035's closure gate names the retired leaves and is unsatisfiable as written, so the T-249 reprice must rewrite it before any goal-level closure claim)
- owner: abiogenesis
- priority: critical
- governance_scope: SPEC_METHOD, TICKET_METHOD
- change_class: goal_reprice
- re_entry_point: specification/GOALS.md
- created_at: 2026-07-12
- updated_at: 2026-07-12 (revision 3 - Consensus use-case and workspace-binding review supplement)
- decision_ref: F_H ruling 2026-07-12 — "run the course correction, redo the tickets, retire anything overblown, then pause and review"
- analysis_ref: .ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md (rev 4)
- review_ref: codex governance review of commit 34d7f56 (findings 1–8, all confirmed; dispositions below)
- implementation_authorization: >-
    Ticket-layer dispositions and successor ticket creation only. No code,
    specification, design, requirement, release, or constitutional surface
    changes are authorized under this ticket. The constitutional reprice is
    intent-class work carried by successor T-249, not by this ticket.

## Intake Triage (revision 2 — span corrected per review finding 1)

1. Substantive: yes. This retargets the 5.0 delivery from the T-218 revision-5
   formal self-host leaf DAG (B5 carrier, C1/C2 packaging fixed point, DS-2
   kernel mega-leaf, front-loaded DS-3/DS-4/DS-7/DS-8 chains) to the campaign
   model (installed 4.6-line + GLC 0.1 discipline authoring GTL 5.* as a
   data-mapper-pattern campaign subject). Not editorial.
2. Boundary of THIS ticket's execution: `.ai-workspace/tickets/` only.
3. Upward-propagation walk to the first affected layer — **corrected**: the
   original revision claimed INTENT/PRODUCT unchanged and named GOALS (stale
   GOAL-034) as the first affected layer. That understated the span. In fact
   INTENT item 12 mandates the two-stage self-hosting fixed point, PRODUCT
   carries the "ABG Self-Hosting Fixed Point" section (P4/I4/B5/S5/C1/C2), and
   GOAL-035's closure gate names T-179 and T-222 through T-241 with "R5 is
   self-hosted and immutable." **The first affected layer is INTENT** ⇒ the
   constitutional retarget is `intent_reprice`-class work ⇒ carried by
   successor **T-249** (singular change class per method; this ticket stays
   goal-layer/ticket-layer) ⇒ affected span: INTENT items 11–12, PRODUCT
   fixed-point and operator/self-conformance/qualification claims,
   REQ-R-ABG3-SELFHOSTING, REQ-P-SELF-CONFORMANCE, REQ-P-QUAL (incl. its
   documented gap owner pointer), GOAL-035, plus the 18 ticket dispositions
   and successor set ⇒ release scope: none until the reprice and a converged
   artifact exist.
4. Sequencing rationale: F_H's ruling is the standing authority for the
   ticket-layer dispositions; the consistency gate (SPEC_METHOD: "No gate may
   close while the affected active surfaces are internally inconsistent")
   binds this ticket's CLOSURE, not the F_H-directed execution order
   ("redo the tickets ... then pause and review"). Between execution and
   closure the tree is in a declared transitional state: constitutional
   surfaces still carry the superseded mandate and say so via this ticket.

## Authority

F_H ruled the retarget directly in session on 2026-07-12 after the rev-3/4
analysis post. History corrected per review finding 8: the fixed-point target
was NOT unilateral codex drift — codex proposed it, claude reviewed and
explicitly endorsed it (2026-07-10 verdict: "all CONFIRMED as improvements"),
and the constitution was lawfully repriced to mandate it. This correction is a
**changed F_H decision** reversing that jointly-ratified target, on the rev-3
finding that the certified loop is a packaging fixed point over frozen S5 and
never witnesses the authoring capability 5.0 is named for (post §3), plus the
live evidence that the campaign converges on the current line (§6, bounded per
finding 7).

## Disposition Table (executed 34d7f56; amendments per review appended to each record)

| Ticket | Was | Disposition | One-line reason |
|---|---|---|---|
| T-224 | active (codex) | superseded_by_course_correction | B5 packaging-carrier design; the bootstrap's entry leaf; carrier docs archive as reusable reference (R6) |
| T-225 | backlog | superseded_by_course_correction | B5 feasibility realization for the dropped carrier |
| T-226 | backlog | superseded_by_course_correction | up-front DS-2 C-runtime design; content → reference for campaign waves |
| T-227 | backlog | superseded_by_course_correction | DS-2 kernel mega-leaf; work re-enters demand-sized as campaign subject content |
| T-179 | active (queued after T-225) | superseded_by_demand_driven_reentry | node_type/overlay design behind the dropped gate; no demand signal |
| T-228 | backlog | superseded_by_demand_driven_reentry | node_type/overlay realization; no demand signal |
| T-229 | backlog | superseded_by_demand_driven_reentry | operator-contract design ticket shape; the PRODUCT claim itself is disposed at T-249, not here |
| T-230 | backlog | superseded_by_demand_driven_reentry | operator-product realization ticket shape; same claim boundary |
| T-231 | backlog | superseded_by_course_correction | self-conformance ticket shape; REQ-P-SELF-CONFORMANCE claim stays live, interim owner T-247 |
| T-232 | backlog | superseded_by_course_correction | realization half of T-231; same claim boundary |
| T-233 | backlog | superseded_by_course_correction | two-stage self-host + C1/C2 equivalence design (packaging fixed point) |
| T-234 | backlog | superseded_by_course_correction | self-host realization + R5:=C1 freeze; R5 identity dropped |
| T-235 | backlog | superseded_by_course_correction | exact ABG5+G5 pair qualification; pair identities dropped |
| T-236 | backlog | superseded_by_course_correction | final 5.0 tap coupled to the fixed point; release ownership moves to T-248 |
| T-237 | backlog | superseded_by_course_correction | released-pair verification for dropped identities |
| T-238 | backlog | superseded_by_course_correction | A5-R1 framework shape; qualification claims stay live, interim owner T-247 |
| T-239 | backlog | superseded_by_course_correction | DS-4Q ticket shape; its documented REQ-P-QUAL gap ownership transfers to T-247 |
| T-240 | backlog | superseded_by_course_correction | ABG 5 RC publication as self-host candidate; RC ownership moves to T-248 |

Kept untouched: T-218/T-220/T-221/T-222/T-223/T-241 (completed history closes
by its stated conditions), T-219 (spec reconciliation, independent), B-010,
T-110, T-178 (independent backlog).

**Claim/shape boundary (per review findings 2 and 5):** retiring a ticket
retires its WORK SHAPE only. Live constitutional claims the retired tickets
served — the PRODUCT operator contract, REQ-P-SELF-CONFORMANCE (the builder
has no exemption), REQ-P-QUAL including its documented witness-gate gap
(owner pointer currently naming T-239) — remain in force and owned: interim
claim owner T-247 (self-conformance + qualification) and T-248 (release
claims), with retain/narrow/remove decided at the T-249 reprice by F_H. No
requirement claim is deferred by silence.

## Demand-Driven Register

Re-entry mechanism, stated honestly (review finding 4): today the typed
`semantic_not_realized` diagnostics (`gtl-c-unrealized-workflow-*`) exist at
compile/conformance level (`GtlProgramConformanceIssue`, ruleRef
`abg://gtl-program/c-algebra/semantic-not-realized`) — **no producer admits
them as ledger events yet**. The admissibility bridge is a named T-245
scaffold deliverable (scenario declares the conformance run inside worker
turns so diagnostics ride the admitted typed result; code-level producer only
if declaration cannot carry it). Until the bridge lands, the loop runs
supervisor-mediated: diagnostics read from campaign results → intent →
ticket. Entries are pointers, not obligations.

1. `workflow.C` runtime realization — wave-one subject candidate (from
   T-226/T-227 content; T-226's design is reference input).
2. node_type/overlay catalog kinds — from T-179/T-228; T-218's narrowing law
   survives as the scoping constraint.
3. Public operator completions — per-verb, from T-229/T-230, when the campaign
   surface needs an operation the current CLI/SDK lacks (claim disposition at
   T-249 governs whether "complete contract" remains a 5.0 claim).
4. SP campaign subset — F7 suite extraction, F10 generic harness, F11 F_D-leak
   gate — likely pulled early.
5. Packaging-determinism gate — the DS-5 salvage (post §3.3); codex's carrier
   docs (R6) supply reusable equivalence/source-isolation contracts for it.
6. Lightweight self-certifying release snapshot — from T-238's kernel.
7. odd_glc T-033 declarations-only demotion — odd_glc pen.

## Residual Register (review-pause queue)

- R1: constitutional reprice — now carried by **T-249** (intent_reprice):
  INTENT items 11–12, PRODUCT fixed-point/operator/self-conformance/
  qualification claims, REQ-R-ABG3-SELFHOSTING, REQ-P-SELF-CONFORMANCE and
  REQ-P-QUAL dispositions (incl. the T-239 owner pointer), GOAL-035 rewrite;
  folds in the §8.1 substrate/subject rule and the §4 provenance trade.
- R2: Python "paused" → "withdrawn" reconciliation — TENANT_REGISTRY.md,
  T-096 framing, INTENT/GOALS carrier language (tickets withdrawn `8ea0310`);
  folds into T-249's span.
- R3: settle the 4.6 predecessor line — T-243 (F_H decision).
- R4: product identity and scope — **DECIDED 2026-07-12, see R4 Decision
  Record below.** 5.0 = feature-complete ABIogenesis whose feature test is
  odd_glc enablement; release ladder = 5.0 RC released → GLC 1.0 over it →
  5.0.0 final brought as an odd_glc 1.0 project. T-249 is now admissible;
  T-247 claims and T-248 identity resolve against the odd_glc-enablement
  test.
- R5: odd_glc cross-repo — T-033/T-037/T-038/T-039 G5-chain coupling to the
  dropped R5/I1 identities needs retargeting in odd_glc's own tree.
- R6: codex's four untracked self-build carrier drafts — archive as
  **superseded reference** (they contain careful carrier/common-public-surface/
  source-isolation/result-equivalence contracts, reusable for register item 5;
  the feasibility contract explicitly avoids claiming full self-hosting).
  Codex/F_H call at review; not touched here.
- R7: T-241's completed requirement reprice served the dropped bootstrap —
  T-249 reviews whether that text stands or re-reprices.

## Successor Set

- T-243 — Settle the 4.6 predecessor line (F_H ruling at review). [34d7f56]
- T-244 — Author the GTL-5 subject specification seed (wave one: workflow.C).
  [34d7f56]
- T-245 — Author the SCN-ABG-SOFTWARE-BUILD campaign scaffold (F25 pack +
  F26 seat + substrate/subject rule + **gap-admissibility bridge**; wave one
  doubles as the exact-substrate engine pilot). [34d7f56, amended rev 2]
- T-246 — Execute GTL-5 campaign waves to convergence (delivery owner). [rev 2]
- T-247 — Own self-conformance and qualification claims through the retarget
  (interim claim owner; final scope at T-249). [rev 2]
- T-248 — Qualify and release the 5.0 artifact (release/RC/tap owner; identity
  per R4). [rev 2]
- T-249 — Constitutional reprice of the 5.0 target (intent_reprice; gated on
  R4). [rev 2]

## R4 Decision Record (2026-07-12) — F_H product identity and scope

F_H verbatim: *"my intent was for 5.0 to be feature complete vision that
enabled those features within odd_glc, in addition 5.0 the RELEASED version of
5.0 RC + glc 1.0 - would be used to bring 5.0.0 as an odd_glc 1.0 project"* —
adding: *"these definitions are in the odd methodology."*

Interpreted in the methodology's own ratified vocabulary:

1. **Identity**: ABIogenesis 5.0 is the released graph-native ODD product
   (SPEC_METHOD Recursive Product Taxonomy: "Product"). **Feature-complete**
   has the ODD_METHOD §6 meaning: 5.0 owns every installed-product surface —
   method, runtime, carrier, command, and release-managed surfaces — that an
   odd_glc 1.0 target project requires, so odd_glc 1.0 ships domain
   declarations only (three-layer ownership law). The feature register derives
   from the original F1–F27 vision, each feature admitted or excluded by the
   **odd_glc-enablement test**: does the method assign this surface to the
   installed product, and does odd_glc 1.0 or the 5.0.0-as-project run require
   it?
2. **Release ladder** (SPEC_METHOD compiler analogy instantiated:
   `release P0 → install P0 → use P0 to build source for P1 → release P1`):
   - current line (rc.3 predecessor + GLC 0.1) + campaign discipline builds
     the feature-complete source → **release cut: 5.0 RC** (published,
     qualified);
   - **odd_glc matures to 1.0** (declarations-only) over the installed 5.0 RC
     (odd_glc tree, residual R5);
   - **installed released 5.0 RC + GLC 1.0 = the installed released builder**
     (ODD_METHOD §7), used to **bring 5.0.0 final in as an odd_glc 1.0 target
     project** (ODD_METHOD §6 clean-install steps: author the 5.0.0 project's
     constitutional surfaces, traverse to build) → **release P1: 5.0.0**.
3. **Self-host boundary**: the post's §8.1 substrate/subject rule is not new
   law to ratify — it is ODD_METHOD §7 ("the installed product under use
   remains distinct from the product under development; the two must not
   collapse into one mixed authority surface"). T-249 cites it.
4. **What this resolves**: the scope question is NOT increment-vs-milestone —
   5.0 is the feature-complete milestone, delivered by the campaign
   discipline; EX/SP and every T-247 claim resolve per-feature against the
   odd_glc-enablement test at T-244/T-249. The 5.0.0-final-as-project run is
   the operational self-hosting proof ("gcc v1 builds gcc v2") and the
   final's qualification-through-use.

Closure condition 1 is satisfied by this record.

## CR-H Re-Entry Decision Record (2026-07-12) — Consensus admitted as a key 5.0.0 feature

F_H verbatim (in session, during review of the consensus question): the
agent-invocable Consensus panel — *"i want to be able to invoke it as a graph
function through the abg.cli, which allows the calling agentic builder to use
it directly"* — *"this is a key 5.0.0 feature"* *"and hence a core usecase."*

Standing law this re-enters through, all verified this session:

- T-218 CR-H-01..09 deferral clause: "re-enter after 5.0 **when a concrete
  product use case needs them**" — the use case is stated (dual-agent
  claude+codex build work) and evidenced (this week's manual verdict-merge
  rounds).
- PRODUCT atom criterion (PRODUCT.md ~1161): consensus panels are **free
  constructions over the atoms, without new engine law** — so admission does
  NOT reverse the engine-composition exclusion; it instances the atom
  criterion. The core use case is the general pattern: **a calling agentic
  builder invokes published GraphFunctions directly through the public
  abg.cli contract** — Consensus is its flagship instance.
- Feasibility verified in code 2026-07-12: the published capability set is
  exactly the required spine — `gtl.declare@5`, `gtl.admit@5`,
  `gtl.serialize@5`, `module.publish@5`, `catalog.contribute@5`,
  `install.bind-products@5`, `catalog.invoke-graph-function@5` (7/7 of the
  published capabilities) — and the DS-1 steel thread (T-223, rerun green
  70/70 today) already qualifies agent-driven `catalog.invoke` +
  `read.result`/`read.replay` on the packed install.
- Honest gap, priced into the feature: `module.publish`/`catalog.contribute`
  exist as published CAPABILITIES but are not among the 13 published CLI
  OPERATIONS — v1 therefore ships the panel as domain declarations through
  the product/module build path (odd_* side, three-layer law: declarations
  only), agents consume via `catalog.invoke`; agent-driven
  publish-through-CLI arrives with the 36-operation operator-surface
  completion.
- Boundary constraints that STAND: no scheduler, no ticket mutation (T-218
  CR-H clause) — the panel derives a typed consensus/dissent surface over
  admitted agent-verdict artifacts (F_D total functions: tally, agreement
  classification); disputes surface as gaps to F_H; ticket writes stay with
  agents/F_H. F_D/F_P boundary preserved.

Routing (pen-holder executes):

1. **T-244 register**: named must-have row — feature: agent-invocable
   Consensus panel through `abg.cli`; the typed agent-verdict/finding schema
   (the dual-review protocol schema) is the function's input contract;
   qualification gate: an agent invokes the published panel over the packed
   install and reads the typed consensus result + replay.
2. **T-249 span addition**: narrow the blanket exclusions at GOALS.md:100,
   INTENT.md:199, PRODUCT.md:168 (and T-218's CR-H framing as historical
   record) from "no new Review/Consensus/homeostatic composition" to "no new
   ENGINE composition, scheduler, or ticket mutation" — admitting
   free-construction panels invoked through the public contract as 5.0
   features.
3. Interim (before the panel exists): the tier-1 process protocol (typed
   finding schema + confirmed/disputed/unique merge record + F_H adjudicates
   disputes only) is usable immediately and becomes the panel's input schema.

## CR-H Record Review Supplement (2026-07-12) - use-case and workspace binding

This supplement preserves the committed CR-H record above while correcting its
scope, ownership, and proof classification. It is the current ticket-layer
interpretation for the Consensus feature.

### Use-case references

- `.ai-workspace/comments/claude/20260710T180000Z_ANALYSIS_homeostatic_intent_loop_mechanism_inventory.md`
  records the governing sequence and identifies the declared-only middle:
  `admit ticket -> graph function Consensus -> ticket.consensus -> triage`.
- `.ai-workspace/comments/claude/20260712T210000Z_STRATEGY_consensus_panel_realizes_the_homeostatic_loop_middle.md`
  records the concrete dual-agent demand and maps it to the subsumed ABG
  Review/Consensus declarations.

Both posts are commentary and demand evidence. The direct F_H ruling recorded
above is the target authority. Completed T-218 remains historical intake; its
"after 5.0" timing is superseded for this bounded Consensus feature, not for
unrelated Review, homeostatic, scheduling, or mutation work.

### Exact 5.0 feature

A calling agentic builder invokes the published ABG Consensus GraphFunction
through `abg.cli` over a ticket or other typed subject. The function binds a
declared reviewer panel, fans out attributed reviewer work, admits typed
findings, reduces agreement and dissent, permits governed verification rounds,
and returns one typed `closed_done | recurse_next_round | escalate_fh` outcome
with decision evidence, lineage, result, and replay references. Consensus never
owns ticket status or writes a ticket; the calling agent or F_H admits any
subsequent ticket mutation.

For the ticket use case, `ticket.consensus` is the ordinary typed Consensus
result bound to the input ticket ref and digest. It exposes a typed ruling or
next-action surface that the caller can take through normal TICKET_METHOD
triage. It does not require a new runtime ticket entity, automatic triage
invocation, or ticket mutation. F_D validates envelopes and classifies exact
agreement; reviewer findings, disputed semantic judgment, and submitter
response remain F_P, with unresolved judgment routed to F_H.

The same public workspace path must support:

1. an existing explicitly selected bound workspace;
2. another independently bound, explicitly selected workspace root; and
3. a caller-created temporary workspace root.

These are applications of one workspace contract, not three runtime modes.
`abg.cli` already requires `--workspace-root`; public workspace create/open
mints or admits the workspace identity; catalog bind/admit/invoke and
result/replay operate on that explicit bound identity. REQ-R-ABG3-BINDING-015
and completed T-104 additionally provide distinct input/output-workspace
allocation law where a GraphFunction declares it.

Current public `catalog.invoke` does not expose a separate W2 output-workspace
request, and it does not select a different workspace per reviewer. The bounded
5.0 use case therefore requires the caller to select and bind the invocation
workspace, including a temporary root when wanted, and returns Consensus truth
through result/replay. Per-reviewer workspace isolation or W2 artifact
materialization is additional design work only if the Consensus contract
declares that need.

### Built substrate versus missing feature

Built substrate evidence is T-223's packed public `workspace.create/open ->
catalog.bind/admit/invoke -> read.result/replay` steel thread, T-104's
cross-workspace allocation carrier, and T-217's installed ABG SYSTEM-scoped
Review/Consensus declarations and closed vocabularies. A temporary directory is
a lawful explicit workspace root; temporary storage does not waive workspace
identity, binding, event, result, replay, or persistent proof law.

This evidence proves that the required atoms exist. It does **not** prove the
Consensus feature. The current declared entries have no published executable
Consensus graph body, concrete input/output schemas, panel execution carrier,
governed recursive-round realization, typed ticket-bound consensus projection,
or packed installed Consensus invocation proof. The earlier phrase
"Feasibility verified" means **building-block feasibility verified**, not
feature closure.

The reusable functions under reserved `gtl://abg/review/*` and
`gtl://abg/consensus/*` refs are ABG SYSTEM-owned. Downstream catalog products
or hosts may contribute reviewer profiles, subject bindings, policies, and
overlays; they do not own or replace the core function. The old odd_sdlc
T-166/T-167 tickets are mined design evidence only and must not remain delivery
owners for ABIogenesis 5.0.

T-244 must carry the mandatory feature row and split its remaining design and
realization work to singular ABIogenesis-owned leaves. T-249 must admit the
bounded feature constitutionally before release closure.

## Review Amendment (2026-07-12) — codex governance review of 34d7f56

All eight findings verified against the cited surfaces and **confirmed**:

1. Consistency gate (CONFIRMED): GOAL-035/INTENT-12/PRODUCT still mandate the
   retired work. Repair: closure condition strengthened below; T-249 created;
   triage walk corrected (first affected layer is INTENT, not GOALS).
2. Open product decision pre-empted (CONFIRMED): operator/self-conformance/
   qualification/release retirements executed one option de facto. Repair:
   claim/shape boundary declared; interim owners T-247/T-248 created; R4
   sharpened to the product-identity decision; stale GOAL-034 refs fixed.
3. Discovery-law category error (CONFIRMED): the law governs proof-obligation
   instances, not delivery plans. Repair: post §7.1 corrected — the DAG was
   oversized, not unconstitutional.
4. Gap-event pipeline overstated (CONFIRMED in code): diagnostics stop at
   conformance issues; no ledger producer. Repair: register wording corrected;
   bridge scoped into T-245.
5. Independent guarantees (CONFIRMED): campaign observation ≠
   REQ-P-SELF-CONFORMANCE audit; earned depth ≠ REQ-P-QUAL gap closure; T-239
   orphaning was a traceability defect. Repair: T-247 interim ownership;
   explicit retain/remove at T-249; affected closure records amended.
6. No delivery owner (CONFIRMED): T-244/245 end before convergence,
   qualification, release. Repair: T-246/T-247/T-248 created.
7. Engine readiness overstated (CONFIRMED): full-campaign proof is rc.2-era
   (`predecessor_evidence_only` per T-221); rc.3 carries the bounded odd_glc
   0.1 live proof. Repair: post corrected; wave one named the exact-substrate
   pilot.
8. History mischaracterized (CONFIRMED): claude's 2026-07-10 review adopted
   the fixed point as an improvement. Repair: reframed everywhere as a changed
   F_H decision reversing a reviewed adoption; codex drafts marked reusable
   reference.

## Closure Condition (revision 2 — strengthened per findings 1/2/6)

This ticket closes only when ALL of the following hold, restoring the
SPEC_METHOD consistency gate over the affected span:

1. F_H has recorded the product-identity and scope decision (R4).
2. T-249 has executed the constitutional reprice so no active GOALS, INTENT,
   PRODUCT, or requirement surface mandates retired work — each affected
   claim explicitly retained (with owner), narrowed, or removed.
3. The delivery chain has owners: T-246 (waves to convergence), T-247
   (self-conformance/qualification claims), T-248 (release) admitted or
   consciously replaced by F_H.
4. F_H ratifies (or amends) the 18 dispositions and this register.

The dispositions themselves remain in force during the transitional state
under F_H's direct 2026-07-12 ruling; what this gate forbids is CLOSING the
correction while the constitution still contradicts it.
