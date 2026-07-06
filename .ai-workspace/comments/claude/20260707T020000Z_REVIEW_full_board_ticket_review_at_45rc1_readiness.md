# Review: Full Board Ticket Review At 4.5.0-rc.1 Readiness

**Status**: review commentary
**Date**: 2026-07-07
**Scope**: every ticket on both boards (ABI: 2 active, 16 backlog,
completed set; odd_glc: 5 active), status honesty, acceptance vs earned
reality, plan-rule consistency. Findings ranked; rulings marked for the
product owner. Mechanical honesty fixes applied; scope decisions left
open.

## Findings (ranked)

### F1 — HIGH (ruling): T-195's acceptance is constitutionally stale
`active/T-195-rc10-review-remediation-wave-toward-4.3.md:8-10` — the
acceptance names "fresh 4.3.0-rc.1 release note … CLEAN data-mapper run
on the 4.3.0-rc.1 substrate". Reality: every C1–C7 cluster landed and
4.3.0-rc.1 SHIPPED; the ticket now serves only as the carrier of the
clean-run closure condition — which GOALS has since redefined (run on
the 4.5 substrate, converging THROUGH upstream re-entry). The ticket
contradicts the pinned 4.5 bar.
RECOMMEND: refresh the acceptance in place (plan rule 1 names T-195 as
a carrying ticket, so keep it): "closes on the clean data-mapper run
per the GOALS 4.5 definition — converged, tests green,
data_mapper_full_sbt ok, THROUGH consequence-routed upstream re-entry,
on the 4.5.0 substrate." Title stays for identity.

### F2 — LOW (applied): T-205 depends-line stale
`active/T-205:` `depends: T-200 strangler step 2 … arrives together` —
T-200 is CLOSED; the dependency is satisfied history. Annotated as
satisfied (applied below). Otherwise T-205 is the board's model
citizen: progress ledger, absorbed-stub rulings, B5 earned map,
readiness state all current.

### F3 — MEDIUM (rulings): seven legacy backlog stubs lack 4.5-lens rulings
- `B-010 induct ABG as conformant odd_sdlc project`: predates the
  odd_sdlc ABANDONMENT; the Four-Recursions post names odd_sdlc a
  witness/deletion target and Goal 4 replaces its role. RECOMMEND:
  close as superseded-by-Goal-4.
- `T-092/T-094/T-095 (Python tenant parity)`: dormant-tenant work; not
  4.5-relevant; no owner activity this arc. RECOMMEND: annotate
  "parked: dormant tenant; revisit at Python reactivation" (keep).
- `T-110 sticky-session agent pool executor`: worker-transport
  performance work; partially adjacent to T-205's handler/transport
  surface but not absorbed by it. RECOMMEND: keep backlog with a
  cross-ref to HANDLERS (-009 F_P transport) so the eventual design
  builds on the handler contract, not beside it.
- `T-178 registry retirement/supersession` + `T-179 non-graph registry
  entry semantics`: REAL design work and likely prerequisites for
  Goal 4 (ticket-lifecycle-as-data needs entry retirement and
  non-graph entries). RECOMMEND: keep; tag goal-4-adjacent.

### F4 — OK: the merged/superseded stubs (T-196/197/198/199/201/202/203b)
carry honest statuses after the 2026-07-06 audit; T-199's corrected
repoint (ladders are selection, not property formulas) stands.

### F5 — LOW (applied): merged/superseded stubs squat in backlog/
backlog/ should hold actionable items only. Applied: moved
merged-into/superseded stubs to completed/ with their annotations
(T-196, T-198, T-199, T-201, T-202, T-203b). T-197 stays (backlog,
ruled not-4.5-blocking but still actionable post-4.5).

### F6 — HIGH (ruling): the odd_glc board fragments Phase C across five actives
Plan RULE 1: no new tickets; odd_glc work lands under T-030. The board
carries FIVE actives:
- `T-030` — the named carrier (run-18 resume spec already on it) ✓
- `T-025 replay scenario ladder as typed GLC declarations` — this IS
  Phase C1's content (binding → declarations)
- `T-026 prove non-closed re-entry and reprice` — this IS the
  odd_glc-side proof of the 4.5 upstream re-entry bar
- `T-027 recursive any-scale lifecycle composition` — post-4.5 scope
  (recursion-at-scale is not on the critical path)
- `T-029 install odd_glc into scenario sandboxes` — its
  non_closure_conditions (install-manifest discipline, no
  source-import) are satisfied by the standing sandbox lanes; likely
  EARNED and closable after a verification pass
RECOMMEND: merge T-025 and T-026 INTO T-030 as Phase C work items
(same annotation pattern as the ABI consolidation); move T-027 to
backlog (post-4.5); run the T-029 closure check and close it if the
lanes satisfy its acceptance.

### F7 — interlock note (applied to T-195 on refresh, pending F1):
whichever ticket carries the clean-run condition must cite the GOALS
iteration bar explicitly, so the closing run cannot be a retry-only
linear pass.

### F8 — observation, no action: frontmatter dialects differ
(ABI lean vs odd_glc rich STDO frontmatter). Both lawful under
TICKET_METHOD; noting so the difference is chosen, not accidental.

## Board state after this review
- ABI active: T-195 (awaiting F1 ruling), T-205 (ready to close at B6).
- ABI backlog (actionable): T-197, T-110, T-178, T-179, T-206, T-207,
  B-010 (awaiting F3 ruling), T-092/094/095 (awaiting F3 annotation).
- ABI completed: + merged stubs relocated (F5).
- odd_glc: awaiting F6 consolidation ruling.

## One-line rule
A ticket is either actionable under the current plan, honestly parked
with a dated ruling, or closed with an earned record — the board never
carries a third state.
