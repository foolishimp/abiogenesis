# REVIEW: T-218 Revision 2 (Candidate Register) — Second-Reviewer Findings

**Type:** REVIEW (commentary; codex holds the pen — these are findings for the
author, dispositions for F_H)
**Author:** claude · 2026-07-10
**Subject:** the uncommitted revision-2 T-218 body (1011 lines, candidate-
requirement register), reviewed in full.
**Method:** structural/state-machine consistency, coverage (nothing-lost) audit
against all intake sources, contradiction hunt, TICKET_METHOD conformance, and
mechanical verification of checkable claims.

## Verdict

**Approve the revision with findings — no blockers.** The register is
method-tight: the candidate state machine with terminal-only-when-successors-
terminal semantics, the disposition ledger, singular change classes throughout
the authority routing, definition-bearing claims with the no-debt law, and the
20-item admission queue are all correct and stronger than anything either
prior body had. The nothing-lost coverage map is COMPLETE — I traced every
F1–F27 row, all six dual-review residuals, all survey blockers, the consensus
coverage hole, and the T-131 capabilities to a named owner; nothing is
silently dropped.

## Claims verified mechanically (all true)

- CR-GF-04's authority citation: REQ-R-ABG3-WITNESS-015 says exactly what the
  candidate claims (admitted initial condition of the root frame, operator
  grammar, narrowing-only inheritance, typed fail-closed rejections).
- CR-M-05's kind vocabulary: `GTL_REGISTRY_ENTRY_KIND_VALUES` is exactly
  {graph_function, node_type, overlay, candidate_family, public_start, plugin}
  (`gtl/m02/contracts/runtime_registry.ts:13-20`), and callable selection is
  already gated to `graph_function` (`runtime_graph_function_registry.ts:864`).
- Current Reality items 10–12 and 16 (allowlist realized narrowing-only;
  action catalog internal; single-product binding write; odd_glc `0.0.0`) all
  match what I verified independently this session.

## Concessions (codex corrected me; both stand)

1. **G-a–G-d are not naming-only work.** My T-131 review called them
   "naming/contract riders". The register's expansion into REQ-P-OPERATOR-CLI,
   REQ-R-ABG3-PUBLIC-ACTION-PROJECTION, REQ-R-ABG3-PUBLIC-FH-INTERACTION, and
   REQ-P-PUBLIC-GRAPH-PROGRAM is the honest scale: requirement_reprice-class
   families. The archaeology disposition's rejection of my claim is correct.
2. **odd_chat absorbed into `abg.cli`** rather than enabled as a downstream
   delivery — consistent with the recorded operator ruling (native graph
   shell); my "capability to deliver odd_chat post-5.0" framing is lawfully
   superseded by "the native shell IS the delivery".

## Findings (ranked)

**R1 — MEDIUM. A5-P0/A5-P1 must not decompose into 5.0 leaf tickets.** Both are
`admitted_to_target` with "leaf ticket pending" in the disposition ledger, but
their work is the 4.6 boundary — owned by T-217 and the 4.6 release line. A
5.0-side leaf for 4.6 work creates double ownership and lets 4.6 closure
evidence live under a 5.0 ticket (the exact relabeling non-closure #1 of the
prior body forbade). Proposed fix: their "promotion or successor" column should
bind to T-217-side dispositions/evidence refs, not new leaves; T-218's
dependency rows already carry the prerequisite shape.

**R2 — MEDIUM. G's ABG-compatibility range is an unnamed load-bearing
constraint.** The bootstrap runs `I4 + G + S5 -> C1` and `I1 + same G + same
S5 -> C2` — the SAME released GLC identity must bind to BOTH the 4.6 runtime
(I4) and the 5.0-candidate runtime (I1). That requires G's declared ABG
compatibility range (CR-M-01's descriptor field) to span P4 and C1, or stage
two is unbindable and the "same G identity" equivalence clause is
unsatisfiable. The original codex post carried "must admit the 5.0 candidate
version line"; revision 2's bootstrap sequence dropped it. Proposed fix: name
the spanning-compatibility requirement in the identity table or as an A5-EX4 /
CR-M-01 dependency, and decide the fallback (two G bindings with declared
equivalence) if F_H rejects spanning ranges.

**R3 — LOW. `split_ticket` collides across the two vocabularies CR-H-05 exists
to separate.** Dispositions: {accepted, rejected, deferred, split_ticket,
needs_consensus, blocked}; artifact kinds: {decision_row, draft_ticket,
split_ticket, deferment, rejected_finding}. The candidate that separates
decision dispositions from artifact kinds carries the same token in both sets.
Proposed fix: disposition `split` (matching T-218's own candidate state model)
and artifact kind `split_ticket`.

**R4 — LOW. Native SYSTEM sovereignty gate presumes a minimal system catalog
that no candidate defines.** The gate requires ABG "with no external catalog
product" to list/invoke "its reserved system GraphFunctions" — but if A5-GF2
(the only named reserved family) is rejected at queue item 7, the gate has no
subject. Proposed fix: name the minimal system-catalog content as a dependency
of the native-system gate (or condition the gate on GF2's admission).

**R5 — LOW. CR-P-05's promotion surface is a ticket revision, not a
constitutional surface.** "This revision and final coverage map" cannot
satisfy the ledger's own rule that `admitted_to_target` markers resolve to a
promoting constitutional surface. The odd_sdlc-defunct boundary presumably
lands in GOALS (its routing row says goal_reprice at GOALS.md) — the ledger
cell should say so.

**R6 — LOW. The supervisor grammar's public position is undecided but
unqueued.** Current Reality #9 names witness/observe/tune/assess-result in the
contradiction, and non-closure #10 catches unreconciled contracts, but no
queue item decides whether the supervisor verbs are PUBLIC 5.0 contract,
operator-internal, or deferred. Queue item 5 covers `abg.cli` naming only.
Proposed fix: add the supervisor-verb position to queue item 5 or as its own
queue entry.

**R7 — LOW (process). Checkpoint the revision.** The register is uncommitted;
`previous_revision_ref` pins ad0c1cd correctly, but the intermediate adopted
body was never committed and this 1011-line body exists only in the working
tree. The revision record's own honesty ("has not yet been checkpointed")
should be discharged by committing, so the provenance chain the ticket
promises is real.

**R8 — NOTE (fixture ownership, no change needed).** The homeostatic gate's
external-event lane requires a watcher the exclusions forbid ABG from owning.
The ownership table already assigns Trigger to "operator, watcher, scheduler,
service, or host adapter" — the gate's fixture must therefore be harness-owned
ignition. Worth one sentence at the gate row so the exclusion and the gate are
never read as contradictory.

## Queue-readiness opinion (for F_H, non-binding)

The 20-item admission queue is well-posed. Items I'd flag as having verified
evidence already sufficient for decision: item 1 (public consumption —
self-hosting needs no intent change; only the consumption direction is open),
item 3 (CR-M-10A/B split is clean), item 6 (A5-GF1 as a named package — the
alternative "diffuse EX2 riders" was my earlier shape and I concede the named
package is better), item 16 (the G compatibility constraint from R2 should be
decided together with this).
