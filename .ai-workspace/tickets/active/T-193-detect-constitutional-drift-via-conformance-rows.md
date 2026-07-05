---
id: T-193
title: Detect constitutional drift via conformance rows (INT-002 generalized)
type: requirements_realization
ticket_category: constitutional_drift_detection
status: active
goal: >-
  Pull the asymmetric residues into the checked regime: the semantic
  compiler admits witnessed constitutional-surface rows (INTENT, PRODUCT,
  GOALS, installed bootstrap, release records) and rejects drift between
  the declared model and live telemetry about it — generalizing the T-187
  installed-context conformance mechanism, realizing INT-002's original
  intent, and operationalizing intent-as-gap at the constitutional level.
change_class: requirement_reprice
re_entry_point: constitutional_drift_conformance
owner: abiogenesis
priority: medium
created_at: 2026-07-05
updated_at: 2026-07-05
governance_scope: STDO Method, SPEC_METHOD, Semantic Compiler / Conformance, Constitutional Surfaces
build_tenant: typescript
source_documents:
  - .ai-workspace/comments/claude/20260705T073323Z_STRATEGY_four_recursions_and_ticket_lifecycle_migration.md
  - specification/INTENT.md
review_status: pending
proof_status: pending
target_truth: >-
  Constitutional surfaces are the model half of a live gap computation:
  loader-witnessed rows (surface ref, digest, declared-version markers)
  enter conformance input; the compiler emits typed drift diagnostics
  (with default repair affordances) when a surface contradicts live truth
  it declares — stale version lines, dead axioms, release claims naming
  active tickets, frozen intent set-points. Drift is delta > 0, not a
  review catch.
non_closure_conditions:
  - A second checker outside the semantic compiler (the compiler is the
    judge; loaders witness — T-187/T-191 pattern).
  - Drift rules encoded as prose review checklists rather than typed
    diagnostics in the ratified vocabulary with repair affordances.
  - Release-claim checking omitted (the RC4-races-active-ticket class must
    be a typed diagnostic: a release paragraph citing a ticket in
    tickets/active/ is drift).
  - Constitutional surfaces repriced without the same-wave propagation the
    T-191 non_closure established.
required_work:
  - "Phase 0 - Residue inventory pin: verify the four-recursions post section 3 table against the tree (bootstrap doc, GOALS release forensics, provenance JSONs, INTENT staleness)."
  - "Phase 1 - Ratify: constitutional-drift row family + diagnostic IDs (deliberate vocabulary extension) + repair mappings; clause in the conformance/LAWS family naming drift as typed conformance failure."
  - "Phase 2 - Realize: witnessed constitutional-surface rows (mirror declaration-source rows) + drift rules: version-line staleness (generalize T-187), release-claim-vs-active-ticket, dead-axiom text fragments (generalize the installed-context required/stale abstraction rows)."
  - "Phase 3 - Differentials: a stale bootstrap axiom -> diagnostic; a release paragraph citing an active ticket -> diagnostic; corrected surfaces -> clean."
  - "Phase 4 - Wire into a standing gate (test lane) + constitutional propagation."
acceptance_criteria:
  - The INT-002 failure mode (stale installed axiom) is mechanically
    detected by a differential.
  - The RC4 failure mode (release claim racing an active ticket) is
    mechanically detected by a differential.
  - All drift diagnostics carry ratified IDs and repair affordances.
notes:
  - Descends from resolutions 3b + intent-as-gap in the four-recursions
    post; INT-002 (2026-03-21) predicted the failure mode and is realized
    here in generalized form.
---

# T-193: Constitutional Drift Detection

The factory checks its own constitution: surfaces become the model half of
a live gap computation, and drift becomes delta, not a review catch.

## Activation + Phase 0 Residue Pin (2026-07-06)

Activated as T-192's completion proof (user directive). CARRIER PIN: the
row families, vocabulary gate, repair carriers, and inventory-digest
identity coverage in gtl_program_conformance are the promote-don't-re-mint
homes; T-187 witness/judge split governs (loaders witness surfaces, the
compiler judges); no new checker outside the semantic compiler.

RESIDUE PIN (live drift verified in-tree at activation):
- CLAUDE.md:57 and AGENTS.md:49 declare bootstrap Version 4.0.0-rc.6
  while the package is 4.2.0-rc.7 — INT-002's stale-installed-axiom class,
  LIVE. The real-tree witness test must catch exactly this before the tree
  is fixed (the detector proves itself on real drift, then the fix lands,
  then clean).
- GOALS release records cite tickets by ref; the RC4 class
  (release-claim-cites-active-ticket) has no live instance today (rc.7
  cites closed tickets only) — the differential covers it constructed.
- Seam parity (ENGINE_START_PASSTHROUGH_KEYS vs public seams) is code-law
  since F1; the parity ROW makes drift a typed diagnostic.

## Phases 1-4 COMPLETE (2026-07-06)

P1 RATIFIED: REQ-L-GTL3-LAWS-028 (witnessed surfaces + live facts; the
compiler judges the gap); four drift diagnostics in the ratified
vocabulary with default repairs (version-line-drift =>
align_digest_or_version; release-claim-cites-active-ticket =>
constitutional_reprice; surface-digest-missing =>
align_digest_or_version; seam-parity-drift => correct_reference) plus the
constitutional-surface-row input diagnostic.

P2 REALIZED in the ONE compiler (carrier pin honored): witnessed
GtlProgramConstitutionalSurfaceRow + GtlProgramConstitutionalLiveFacts
inputs on typecheckGtlProgram; checkConstitutionalDrift judge; digestless
witnesses fail closed; identity coverage (rows + live facts in the
inventory digest — the T-191 lesson applied at birth).

P3 DIFFERENTIALS: version drift flagged + clean-on-agreement; THE RC4
CLASS (release claim citing an active ticket) mechanically detected with
constitutional_reprice affordance; seam-parity drift (the F1 class)
detected per seam; digestless rejection; identity-digest divergence.

P4 REAL-TREE WITNESS (the detector proved itself on live drift, day one):
the standing test witnesses the ACTUAL tree — CLAUDE.md bootstrap version
line, the rc.7 release record's cited tickets vs tickets/active/, the
live ENGINE_START_PASSTHROUGH_KEYS — and on first run found exactly the
pinned drift (bootstrap 4.0.0-rc.6 vs package 4.2.0-rc.7) and NOTHING
else (rc.7's record judged clean, validating the RC4 rule against
reality). Drift fixed at the authored home (CLAUDE.md + AGENTS.md
version lines); detector green; the test now stands as the drift gate in
the semantic suite — any future rc bump without bootstrap propagation is
a red suite, not a review catch.

Acceptance criteria: INT-002 failure mode mechanically detected ✓ (live,
then fixed); RC4 failure mode mechanically detected ✓ (constructed +
real-record validated clean); ratified IDs + repairs on all drift
diagnostics ✓. Gates: t193 5/5; semantic 1092/1092.

## Gödel Checkpoint 3 (post-realization review-react)

REACTED: CONTRACT-LAW-API index extended to -028. NAMED (successors, not
closure blockers): (a) the real-tree release-record witness window runs
from the rc.7 marker to EOF — deliberately strict (future GOALS appends
mentioning active tickets go red and force review) but over-broad as
prose-vs-claim discrimination; paragraph-scoped witnessing is the
successor. (b) seamKeySets are structurally true post-F1 (every seam
consumes ENGINE_START_PASSTHROUGH_KEYS by construction) but not yet
witnessed from live introspection — the parity RULE is proven by
constructed differential; live seam witnessing is the successor. (c) the
witness loader lives in the test lane; a product-grade loader (installer/
CLI emitting witnessed rows) is the successor that takes drift detection
beyond the dev tree.
