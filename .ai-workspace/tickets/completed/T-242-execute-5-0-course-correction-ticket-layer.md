# T-242 - Execute The 5.0 Course Correction At The Ticket Layer

- id: T-242
- title: Execute the 5.0 course correction at the ticket layer
- type: reprice
- ticket_category: governance_reprice
- status: completed
- goal: GOAL-035 ABIogenesis 5.0 full-product delivery
- owner: abiogenesis
- priority: critical
- governance_scope: SPEC_METHOD, TICKET_METHOD
- change_class: goal_reprice
- re_entry_point: specification/GOALS.md
- created_at: 2026-07-12
- updated_at: 2026-07-13 (revision 4 - stable-first superseding decision and execution-plan alignment)
- closed_at: 2026-07-13
- decision_ref: >-
    F_H rulings 2026-07-12/13 — "5.0 is our stable baseline before dog
    fooding begins" and "ok plan approved, triage and execute - STDO governance"
- analysis_ref: .ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md (rev 4)
- review_ref: >-
    codex governance review of 34d7f56 plus
    .ai-workspace/comments/claude/20260713T060000Z_REVIEW_stable_first_5_0_execution_plan.md
- implementation_authorization: >-
    Ticket-layer dispositions and successor ticket creation only. No code,
    specification, design, requirement, release, or constitutional surface
    changes are authorized under this ticket. The constitutional reprice is
    intent-class work carried by successor T-249, not by this ticket.

## Intake Triage (revision 4 - stable-first)

1. Substantive: yes. Revision 2 replaced T-218's packaging fixed point with an
   installed-4.6/GLC campaign. F_H has now superseded both mechanisms: 5.0 is
   authored directly under STDO and accepted design gates, then released as the
   stable baseline before operational dogfooding begins with 5.0.1.
2. Boundary of THIS ticket's execution remains `.ai-workspace/tickets/` only.
   T-249 owns constitutional propagation; this ticket does not edit
   specification, requirements, design, code, qualification, or release bytes.
3. The committed constitutional baseline at intake required C1/C2 and the old
   release ladder across INTENT item 12, PRODUCT, GOAL-035, and multiple
   requirement/scenario families. T-249 therefore remains the singular
   `intent_reprice` carrier for the candidate propagation now present in the
   working tree. T-244 is the exact feature-register input; T-247 owns retained
   compliance realization; T-248 owns the direct release.
4. Only operational self-use evidence moves to 5.0.1. Runtime, operator,
   Consensus, conformance, compatibility, and release functionality remain in
   the T-244 register unless F_H explicitly reprices a row.
5. SPEC_METHOD consistency still binds CLOSURE. The ticket dispositions may be
   written first under direct F_H authority, but T-242 cannot close until the
   T-249 propagation passes its consistency census and F_H ratification gate.

## Authority

F_H ruled each retarget directly. The fixed-point target was reviewed and
lawfully adopted, then superseded by the 2026-07-12 campaign ruling; the
campaign build mechanism is now superseded by F_H's 2026-07-13 approval of the
stable-first execution plan and the direct statement that "5.0 is our stable
baseline before dog fooding begins." This is changed product/release direction,
not retroactive error attribution. Historical decision records remain below;
the newest explicit supplement controls current routing.

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
| T-231 | backlog | superseded_by_course_correction | self-conformance ticket shape retired; REQ-P-SELF-CONFORMANCE stays live under T-247's realization gate |
| T-232 | backlog | superseded_by_course_correction | realization half of T-231; same claim boundary |
| T-233 | backlog | superseded_by_course_correction | two-stage self-host + C1/C2 equivalence design (packaging fixed point) |
| T-234 | backlog | superseded_by_course_correction | self-host realization + R5:=C1 freeze; R5 identity dropped |
| T-235 | backlog | superseded_by_course_correction | exact ABG5+G5 pair qualification; pair identities dropped |
| T-236 | backlog | superseded_by_course_correction | final 5.0 tap coupled to the fixed point; release ownership moves to T-248 |
| T-237 | backlog | superseded_by_course_correction | released-pair verification for dropped identities |
| T-238 | backlog | superseded_by_course_correction | A5-R1 framework shape retired; bounded qualification/read-model claims stay live under T-247 |
| T-239 | backlog | superseded_by_course_correction | DS-4Q ticket shape; its documented REQ-P-QUAL gap ownership transfers to T-247 |
| T-240 | backlog | superseded_by_course_correction | ABG 5 RC publication as self-host candidate; RC ownership moves to T-248 |

Kept as completed history: T-218/T-219/T-220/T-221/T-222/T-223/T-241. B-010
is retargeted in place to the 5.0.1 dogfood era. T-110 and T-178 remain
independent backlog.

**Claim/shape boundary (per review findings 2 and 5):** retiring a ticket
retires its WORK SHAPE only. Live constitutional claims the retired tickets
served — the PRODUCT operator contract, REQ-P-SELF-CONFORMANCE (the builder
has no exemption), REQ-P-QUAL including its documented witness-gate gap
(owner pointer currently naming T-239) — remain mandatory. T-247 now owns
their realized 5.0 compliance gate and T-248 consumes its exact result. T-249
aligns wording and pointers; no requirement claim is deferred by silence.

## Exact Feature Routing

GOALS, INTENT, PRODUCT, and requirements own constitutional 5.0 scope. T-244
is the sole exact derived traceability and closure register over that scope. It
carries every retained T-218 candidate/package family, T-219 residual,
retrospective design stage, and T-247 claim with authority, built proof,
remaining work, owner, dependency, release gate, risk/hedge, and F_H
disposition.

The typed `semantic_not_realized` compiler diagnostics remain the design oracle
for missing `workflow.C`, `C.batch`, and `C.retry` atoms. A future Consensus
GTL body must expose those gaps before realization. No T-245 campaign or
feature-specific plugin supplies them for 5.0.

Only three categories move to the successor era: operational self-use proof,
odd_glc 1.0/data-mapper/released-pair work, and full installed-product source
governance induction. T-244 records those explicit dispositions; every other
retained product feature closes before T-248.

## Residual Register (review-pause queue)

- R1: constitutional reprice — carried by **T-249** (`intent_reprice`) over
  the exact stable-first span: INTENT, PRODUCT, GOALS, SELFHOSTING, INSTALL,
  PUBLIC-CONTRACTS, SELF-CONFORMANCE, QUAL, SCENARIOS, derived-artifact
  scenario/testcase authority, Python-carrier reconciliation, and Consensus.
- R2: Python "paused" → "withdrawn" reconciliation — TENANT_REGISTRY.md,
  T-096 framing, INTENT/GOALS carrier language (tickets withdrawn `8ea0310`);
  folds into T-249's span.
- R3: settled by T-243 — exact 4.6 rc.3 is terminal predecessor evidence, not
  a 5.0 build/release dependency; no 4.6 successor release opens.
- R4: product identity and scope — the 2026-07-12 record remains historical;
  its feature test and two-rung ladder are superseded by the Stable-First
  Decision Record below. Constitutional requirements define full feature scope,
  T-244 traces it, T-248 releases stable 5.0 directly, and T-245/T-246 own later
  5.0.1 dogfood.
- R5: odd_glc cross-repo — any 1.0 maturation/retarget stays in odd_glc's own
  tree after T-248 and is not a 5.0 closure dependency.
- R6: codex's four untracked self-build carrier drafts — archive as
  **superseded reference** (they contain careful carrier/common-public-surface/
  source-isolation/result-equivalence contracts, reusable for register item 5;
  the feasibility contract explicitly avoids claiming full self-hosting).
  Codex/F_H call at review; not touched here.
- R7: T-241 remains completed history; T-249 removes its active exact-I4/B5
  exception text from SELFHOSTING/INSTALL/PUBLIC-CONTRACTS.

## Successor Set

- T-243 — completed terminal rc.3 predecessor-evidence disposition.
- T-244 — sole exact derived stable-5.0 feature/release-gate traceability
  register; depends on this ruling, not T-242 closure.
- T-247 — retained 5.0 self-conformance and qualification realization gate.
- T-248 — direct stable 5.0 RC/final release owner; no second rung.
- T-249 — constitutional stable-baseline `intent_reprice`.
- T-245 — post-T-248 5.0.1 dogfood campaign scaffold.
- T-246 — post-T-248 5.0.1 dogfood campaign execution.
- B-010 — blocked until the 5.0.1 installed-product governance era.

## R4 Decision Record (2026-07-12) — Historical F_H product identity and scope

This record is preserved as the then-current decision. Its odd_glc-only feature
test and two-rung release ladder are superseded by the 2026-07-13 Stable-First
Decision Record below. Its three-layer ownership distinction remains valid.

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

This historical record no longer satisfies the current product-identity gate by
itself. The superseding record below does.

## Stable-First Superseding Decision Record (2026-07-13)

F_H verbatim authority across the direct rulings and plan approval:

- *"5.0 is our stable baseline before dog fooding begins"*;
- 5.0.0 is *"spec method ready and compliant"*; and
- after receiving the revised stable-first execution plan: *"ok plan approved,
  triage and execute - STDO governance"*.

Current binding interpretation:

1. **Stable 5.0 product**: ABIogenesis 5.0 is the feature-complete,
   source-independent, specification-method-compliant stable product for one
   trusted developer desktop. Constitutional scope lives in GOALS, INTENT,
   PRODUCT, and requirements; T-244 is their exact derived traceability and
   closure register.
2. **5.0 construction**: the mutable 5.0 source project is authored and
   realized directly under STDO, singular tickets, accepted three-view designs,
   GTL admission, semantic compilation, focused proof, and phase self-review.
   No installed 4.6, installed 5.0, odd_glc, or campaign is claimed to build it.
3. **Direct release**: T-248 freezes, qualifies, publishes RCs, and taps stable
   5.0 directly. odd_glc 1.0, T-245/T-246, a data-mapper campaign,
   released-pair proof, or a self-host run cannot gate the final tap.
4. **Successor dogfood**: after T-248, installed released 5.0 plus independently
   released odd_glc 1.0 becomes the development product for the mutable 5.0.1
   source project. T-245/T-246 own that first operational dogfood/self-use
   proof.
5. **Scope preservation**: only operational self-use evidence moves to 5.0.1.
   Runtime atoms, the full operator workflow, Consensus, self-conformance,
   observer/tuner, native/Codex compatibility, qualification, downstream
   catalog capability, and release functionality remain 5.0 work as T-244
   records them.
6. **Predecessor**: T-243 records exact `4.6.0-rc.3` as immutable predecessor
   evidence only. No final 4.6 release or service line is required.
7. **Supersession boundary**: this record supersedes R4's odd_glc-enablement-as-
   sole-feature-test and its `5.0 RC -> GLC 1.0 -> 5.0.0-as-project` release
   ladder. It does not supersede R4's source/install/product distinction, the
   three-layer ownership law, or the bounded Consensus decision below.

### Approved Stable-Plan Amendments A1-A6

F_H's plan approval ratifies the review amendments as follows:

| Amendment | Binding disposition |
|---|---|
| A1 - open alignment items | T-243 records rc.3 evidence; B-010 defers installed governance to 5.0.1; T-249 owns constitutional and gate-reference cleanup. The standing T-193/T-195 document-drift gates and `lint:test-harness` errors must be fixed or explicitly repriced at their lawful boundary before they are used as release evidence. |
| A2 - no new ticket hierarchy | No prebuilt 18-leaf DAG. Ticket-first law still binds: each code-bearing T-244 row starts only through its singular ticket and accepted design. |
| A3 - atom generality | Each `workflow.C`, `C.batch`, and `C.retry` design names at least one non-Consensus consumer/scenario as well as recompiling the same Consensus graph. |
| A4 - one feature register | Constitutional scope remains in GOALS, INTENT, PRODUCT, and requirements. T-244 is their sole exact derived feature/release-gate traceability register; phase prose cannot become a competing list. |
| A5 - optional mechanical guard | A commit/push guard requiring ticket and accepted-design refs remains `pending_fh`. It is not a 5.0 product feature or current blocker. The underlying ticket/design/self-review law is mandatory now. |
| A6 - reproducible diagram check | The design-gate proof shall include a committed reproducible Mermaid render/parse check rather than an attested 27/27 claim alone. This is design/process proof, not product scope. |

The execution order is now:

```text
T-242 stable-first record
  -> T-243 terminal disposition
  -> T-244 exact feature register
  -> T-249 constitutional reprice
  -> retained feature delivery + T-247 compliance
  -> T-248 direct stable release
  -> odd_glc 1.0
  -> T-245/T-246 5.0.1 dogfood
```

This decision satisfies the current product-identity ruling. It does not close
T-242 while active constitutional surfaces still contradict it.

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

## Historical Review Amendment (2026-07-12) — codex governance review of 34d7f56

This records the repair of revision 2. Where its campaign owners or repairs
conflict with the Stable-First Decision Record, the newer record and retargeted
successor tickets control.

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

## Closure Condition (revision 4 - stable-first consistency gate)

This ticket closes only when ALL of the following hold, restoring the
SPEC_METHOD consistency gate over the affected span:

1. The Stable-First Superseding Decision Record and bounded Consensus record
   are present as the current product/scope rulings; historical R4 remains
   identifiable as superseded only where the newer record says so.
2. T-244 contains one complete no-silence feature register and explicit
   exclusions/successor dispositions; no plan or ticket carries a competing
   live 5.0 list.
3. T-249 has executed the constitutional reprice so no active GOALS, INTENT,
   PRODUCT, requirement, scenario, or testcase-authority surface mandates the
   retired fixed point, campaign ladder, GLC release dependency, or self-host
   capability for 5.0.
4. The current delivery chain has owners: retained feature rows enter singular
   leaves, T-247 owns compliance realization, and T-248 owns direct stable
   release. T-245/T-246 and B-010 are explicitly 5.0.1-era work, not closure
   dependencies.
5. T-243 has one terminal predecessor-evidence disposition and no hidden 4.6
   release work.
6. F_H ratifies the resulting load-bearing constitutional diff and any change
   to a T-244 row disposition.

The dispositions themselves remain in force during the transitional state
under F_H's direct rulings; what this gate forbids is CLOSING the correction
while the constitution still contradicts stable-first or the complete 5.0
feature set.

## Closure Record

All six closure conditions are satisfied. T-244 carries the sole exact feature
register and is completed; T-249 propagated and ratified the stable-first
constitution and is completed; T-243 is terminal predecessor evidence;
T-247/T-248 own qualification and direct release; T-245/T-246/B-010 remain
explicit successor-era work. Authority is the direct F_H plan approval,
checkpoint `7107604`, independent review `d5aaa3f`, and the subsequent F_H
instruction to continue. No new ticket or constitutional change is introduced
by this closure bookkeeping.
