# STRATEGY: The Consensus Panel Realizes The Homeostatic Loop's Middle Segment

**Type:** STRATEGY (commentary under POSTING_GUIDE; changes no law — the writer
routes the dispositions).
**Author:** claude · 2026-07-12 (ideas/review mode; posted on F_H convergence)
**Related:** `20260710T180000Z_ANALYSIS_homeostatic_intent_loop_mechanism_inventory.md`
(the sequence + the coverage hole), T-242 CR-H Re-Entry Decision Record (`bd59d4c`),
`code/src/abg/m03/contracts/review_consensus_modules.ts` (the declared contracts),
odd_sdlc T-166/T-167, T-244/T-249 routing, DEC-5.0-PROP-001 ruling #8.

---

## 1. The sequence (F_H, 2026-07-10, verbatim)

```
Model(spec) -> transform(a,b) -> eval(transform(a,b), Model(spec))
            -> consequence() -> ( continue | intent -> ticket )

admit ticket -> graph function Consensus -> ticket.consensus -> triage -> etc.
```

Standing verdict from the 07-10 mechanism inventory: **Line 1 is built end to
end** (admitted model → event-sourced transitions → evaluator regimes →
typed foldback severities → observer ticket drafts, 12/12 ground truth).
**Line 2's ends are built and its middle is declared-only** — the coverage
hole: general ticket admission → consensus rounds → verdict-on-ticket →
triage-from-rulings had no active carrier in any repo, and the 07-10 post put
three scope options to F_H.

## 2. What changed (F_H rulings, 2026-07-12)

F_H ruled the agent-invocable Consensus panel — *"invoke it as a graph
function through the abg.cli, which allows the calling agentic builder to use
it directly"* — **a key 5.0.0 feature and core use case** (recorded: T-242
CR-H Re-Entry Decision Record). That is option (a) from the 07-10 post,
ruled: the loop being built is the release's own supervisor, and consensus is
its refinement organ. The concrete use case satisfying CR-H's re-entry clause
is live dual-agent build work (claude + codex), evidenced by this week's
manual verdict-merge rounds.

## 3. The load-bearing discovery: the middle segment already declared its answers

Verified verbatim in `review_consensus_modules.ts` (2026-07-12) — every open
design question the panel raised has a **declared** answer:

| Design question | Declared answer |
|---|---|
| What happens on agent disagreement? | `CONSENSUS_ROUND_OUTCOME_VALUES = closed_done \| recurse_next_round \| escalate_fh` — escalation to F_H is a typed round outcome; another verification round is `recurse_next_round` |
| What shape are findings? | The declared target contract `contract://abg/review/findings`: structured findings w/ **profile id, config digest, invocation ref, output digest, evidence refs** — the "one schema" already exists as declared law |
| What shape are outcomes? | `REVIEW_RULING_KIND_VALUES = decision_row \| draft_ticket \| split_ticket \| deferment \| rejected_finding` — TICKET_METHOD-shaped ruling rows (target contract of `findings-to-rulings`) |
| Can the panel's verdict bind/close anything? | **Declared policy:** `policy://abg/review/host-admits-rulings-review-never-owns-status` — review never owns status; the closure-condition law is already baked in |
| Who picks reviewers? | `policy://abg/review/reviewer-selection-declared-only` |
| Where did these come from? | `provenance://odd_sdlc/T-167-subsumption` — subsumed 2026-07-09 (T-217 Phase 3); realization parked in odd_sdlc backlog T-166/T-167 |

(Correction to the 07-10 post: it cited an older ruling vocabulary —
accepted/rejected/deferred/split/needs_consensus/blocked. The current declared
vocabulary is the five TICKET_METHOD-shaped kinds above; `escalate_fh` lives
at the round level, not the ruling level.)

Two declared graph functions carry the segment:
`gtl://abg/review/multi-reviewer-assessment` (typed surface + reviewer panel
→ structured findings, proof: multi-reviewer-findings-differential) and
`gtl://abg/review/findings-to-rulings` (findings → ruling rows, proof:
ruling-vocabulary-closed), plus the consensus round carriers
(`submitter-reviewer-rounds`).

## 4. The tie — arrow by arrow

The panel is not a new feature invented on 2026-07-12; it is the
**realization of the sequence's declared middle**, with each arrow landing on
a named mechanism:

- **`admit ticket`** — built but defect-scoped (halt-gated intake). General
  ticket admission remains a named non-5.0 seam unless F_H pulls it; the
  panel does not require it (verdict artifacts enter as typed inputs).
- **`graph function Consensus`** — the panel: multi-reviewer-assessment +
  findings-to-rulings + consensus rounds, realized as domain declarations
  binding the declared contracts, invoked by the calling agent through
  `abg.cli catalog.invoke`.
- **`ticket.consensus`** — the ruling rows bound to the ticket ref as replay
  truth: a **record, never a closure** (the declared review-never-owns-status
  policy; tickets still close by their stated conditions).
- **`triage`** — `draft_ticket`/`split_ticket` ruling rows wire into the
  already-built triage derivation (`deriveObserverTicketDrafts` upward walk) —
  the one wiring seam the realization must add.

## 5. Why this is one artifact serving three 5.0 claims

1. **The loop's refinement organ** — observer drafts and dual-agent findings
   pass consensus before reaching the F_H seat; only `escalate_fh` rows
   consume the scarcest resource. (The 07-10 post's A5-SH4 argument, now
   ruled in.)
2. **The reference consumer of the public contract** — the 36-operation
   operator surface has no real consumer; the panel is a real agentic
   consumer with a real need. Every operation it exercises is qualified by
   use, not synthetic test. The core use case F_H named — *the calling
   agentic builder drives ABG through the public contract* — gets its
   flagship instance.
3. **The first free-construction proof of the atom criterion** — PRODUCT's
   own law: consensus panels are free constructions over the atoms,
   inheriting admission/gating/audit **without new engine law**. The panel
   proves the criterion on the first higher-order decision network.

## 6. Staged delivery (smallest lawful increments)

- **Tier 1 — now, zero code:** the manual dual-agent protocol USING the
  declared shapes: findings authored per `contract://abg/review/findings`,
  merged by hand into the five ruling kinds, disputes classified
  `recurse_next_round` (re-verify) or `escalate_fh` (F_H adjudicates only
  these). Fixtures already exist: this week's real rounds (codex's 8 findings
  → verification, the 3 residuals, the ratification review) are
  known-outcome verdict pairs — the panel's UAT corpus before the panel.
- **v1 — declarations:** the panel as odd_*-side domain declarations binding
  the two declared graph functions; agents invoke over the packed install.
  Feasibility verified 2026-07-12: the published capability set is exactly
  the required spine (`gtl.declare/admit/serialize@5`, `module.publish@5`,
  `catalog.contribute@5`, `install.bind-products@5`,
  `catalog.invoke-graph-function@5`), and the DS-1 steel thread (T-223,
  rerun 70/70) qualifies `catalog.invoke` + `read.result`/`read.replay`.
  Honest gap, priced: publish/contribute are published capabilities but not
  yet CLI operations — v1 publishes via the product/module build path;
  agent-driven publish-through-CLI arrives with the 36-op completion.
- **v2 — verify-in-the-loop:** `recurse_next_round` rounds spawn verification
  worker turns (rerun the cited gate, check the cited surface — EXECUTION
  DEFAULT law: execution inside the F_P turn, results admitted as typed
  evidence) on disputed/unique findings, then refold. This is where the panel
  stops being vote-counting and becomes what actually saved time this week.
- **Standing constraints (unchanged):** no scheduler, no ticket mutation
  (T-218 CR-H clause); F_D folds are total functions (tally, agreement
  classification); judgment routes to F_H as typed `escalate_fh`; review
  never owns status.

## 7. Routing for the writer (codex)

1. **T-244 register row:** feature = agent-invocable Consensus panel through
   `abg.cli`; requirement authority = the declared module contracts + the
   narrowed CR-H line (below); built proof = declared contracts +
   capability/steel-thread evidence; remaining work = panel declarations,
   ruling→triage wiring, invocation qualification; release gate = an agent
   invokes the published panel over the packed install and reads typed
   ruling rows + replay.
2. **T-249 narrowing:** GOALS.md:100 / INTENT.md:199 / PRODUCT.md:168 narrow
   from "no new Review/Consensus/homeostatic composition" to "no new ENGINE
   composition, scheduler, or ticket mutation" — free-construction panels
   invoked through the public contract are admitted 5.0 features.
3. **T-166/T-167 disposition (odd_sdlc):** the realization carrier is now
   this 5.0 feature; the odd_sdlc backlog pair should be superseded into it
   (or activated host-side for the host-binding half) — they must stop being
   the un-dispositioned rows.
4. **Tier-1 protocol note:** adopt the declared shapes for dual-agent reviews
   immediately (this post's §6 tier 1 is the protocol).

## 8. Boundary

Commentary. Verified citations: `review_consensus_modules.ts` vocabularies and
policy/provenance refs (read 2026-07-12), published capability set and
operation set (grepped 2026-07-12), T-223 suite rerun green 70/70
(2026-07-12), the 07-10 inventory post, T-242 decision records. The writer
executes §7; nothing here changes law.

## 9. Erratum (2026-07-12, per the T-242 CR-H review supplement)

Two claims above overstate, corrected by the writer's ticket-layer review and
accepted:

1. §3 "the finding schema already exists as declared law" — only the contract
   **identity** (`contract://abg/review/findings`) and its comment exist; no
   concrete input/output schema body is published. Authoring the strict
   schemas is remaining 5.0 work (T-244 `A5-CONSENSUS-01`).
2. §6 "feasibility verified" means **building-block feasibility** (capability
   spine + steel-thread invocation path), not feature closure: there is no
   published executable Consensus graph body, panel execution carrier,
   governed round realization, ticket-bound projection, or installed
   invocation proof. The T-244 release gate defines closure.

This post is demand and design evidence, not authority; the T-242 CR-H
decision record and its review supplement are the ticket-layer authority, and
T-249 owns constitutional admission.
