---
id: T-195
title: rc.10 full-review remediation wave toward 4.3.0
status: completed
class: requirement_reprice + realization_refactor
opened: 2026-07-06
review: .ai-workspace/comments/claude/20260706T090000Z_REVIEW_gtl_abg_full_product_review_rc10.md
acceptance: all P0+P1 closed, P2 seam pass done or ticketed, fresh 4.3.0-rc.1
  release note (authored, not sed-bumped), standing gate sourceClean, and a
  CLEAN odd_glc data-mapper-full live run on the 4.3.0-rc.1 substrate.
---

# T-195: rc.10 review remediation → 4.3.0

Scope = the five-dimension review's findings, P0-1..P0-6, P1-7..P1-12,
P2 seam-consolidation pass. Work clusters, gates between:

- C1 vocabularies/digests: retry allowlist single home (P0-6);
  sha256 double-prefix (P0-5); governed enums derive (P1-11);
  admission message derives (P2).
- C2 intake integrity: replay read ENOENT-discriminating + per-line
  admission (P1-10); pre-stamped emit rejection (P1-10); supplied-digest
  verify-or-reject (P1-9); coerceRuntimeBinding structural admission (P1-12).
- C3 fail-closed defaults: fpDispatch/fdEvaluator/consequenceProjection
  defaults return blocked (P0-2); test fixtures supply explicit plugins.
- C4 truth perimeter: sink allowlist per sink_receive_only (P0-3);
  CLI append-in-finally + typed runtime-failure event + stack (P0-4,
  realizes CLI-error-as-event).
- C5 lane closure: construction/consequence lane consumes the passthrough
  authority + terminal through the choke point (P0-1).
- C6 seam pass: truncation transform, target-carrier mint, envelope
  predicate, stableJson forks, stall classification, transport ID minters,
  PublicTerminalKind, transport trio tie (P2).
- C7 paperwork-with-teeth: rc.10 note corrected; self-reference drift
  check in the real-tree witness; TEMPORAL Status header; FPC-011 citation;
  PRODUCT.md temporal scope note; successor tickets (P1-8).

Non-closure: any weakened test; any fabricated-success default surviving;
sub-runs without temporal law; release note describing another cut's delta.


## Intake Triage re-run (2026-07-09): STALENESS DISPOSITION REQUIRED

1. The acceptance is VERSION-STALE: it pins "4.3.0-rc.1" while the line
   stands at 4.5.0-rc.10 — the same historical-RC pinning defect T-030's
   law correction removed ("active ticket law shall not pin behavior to
   a historical RC"). The acceptance's substantive content has been
   OVERTAKEN by events: the standing gate is sourceClean (holds at every
   cut through rc.10) and a CLEAN odd_glc data-mapper-full live run
   exists (T-031 closure run, 4.5.0-rc.10, 26/26, folds satisfied).
2. Cluster evidence suggests substantial absorption into the 4.4/4.5
   waves (C4's CLI-error-as-event and live replay-log append shipped in
   4.5.0-rc.5; C7's successor tickets exist — T-197 traces to P1-8;
   T-205's codex rounds closed P1-a/P1-b-class items) — but ABSORPTION
   IS NOT CLOSURE EVIDENCE. Per TICKET_METHOD, a forensic close review
   must classify every cluster item C1-C7 / P0-1..P1-12 against the
   CURRENT tree: accepted (with evidence ref), still-open (reprice into
   a fresh ticket at the current line), or superseded (with the
   superseding surface named).
3. DISPOSITION: this ticket may not remain active in its stale form and
   may not be silently closed. Next lawful act = the close review above;
   outcome is either completed-with-evidence or a successor ticket
   scoped to the surviving items on the 4.5 line.

## CLOSED BY FORENSIC CLOSE REVIEW (2026-07-09)

Full item-by-item verification against the 4.5.0-rc.10 tree (agent
review, evidence refs per item): 21 of 25 items ACCEPTED or SUPERSEDED
with file:line evidence — P0-1 (choke point + passthrough), P0-3 (kind-
restricted sink), P0-4 (CLI stacks + typed failure events), P0-6 (one
retry-allowlist home), P1-7/-8/-9/-10/-11, the full C6 seam pass (eight
seams, each one home), and C7 paperwork (drift witness, TEMPORAL status,
FPC-011). P0-2 was adjudicated in-tree (replay-visible defaults halting
at dispatch_required) rather than fixed as proposed — recorded in
successor T-211 item 4.

FIXED IN THIS REVIEW: P0-5 had RECURRED — evaluation_set.ts minted
sha256:sha256:<hex> into live EvaluationSetPlan.planDigest, and
default_instruction_startup.ts minted prefixed non-digest strings. Both
fixed; a sweep differential now scans every emitted event for the
double-prefix class (suite 1153/1153).

REPRICED TO T-211: P1-12 residue (unstamped-eventId fallback + five
ingress casts), P1-10's pre-stamp authentication refinement, and the
PRODUCT.md temporal scope note.

ACCEPTANCE RECONCILIATION: the clauses were version-stale (pinned
4.3.0); their substance HOLDS on the current line — standing gate
sourceClean (rc.10 manifest sourceDirty:false) and a CLEAN odd_glc
data-mapper-full live run (T-031 closure run, 4.5.0-rc.10, 26/26
converged, folds satisfied). The 4.3.0 release-identity clause is
superseded by the release line's actual history (4.4, 4.5 cuts each
authored, each sourceClean).
