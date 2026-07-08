# T-212 Installer Bootstrap Constitutional Compression Review

- id: T-212
- type: chore
- ticket_category: ordinary
- library_usage: extend
- governing_library: app/m04 install_bootstrap (typescript_installer.ts precreated bootstrap; AGENTS.md + CLAUDE.md injection)
- status: completed (2026-07-09, rides rc.15 per reschedule)
- goal: GOAL-032 (Foundation Release)
- rescheduled: 2026-07-09 — rides Stage A/rc.15 of the T-032 execution plan (user reprice): the installer-driven odd_glc workspace refresh is the delivery and TEST vehicle; the Phase 4 campaign runs workers under the new context, making it the live gate-zero test. Also corrects the rc.5-stale install-provenance drift (workspace context hand-bumped since rc.7).
- change_intent: >-
    Review the precreated GTL bootloader the installer injects into
    AGENTS.md and CLAUDE.md so the constitutional BOUNDARIES are part of
    the compression, not only the structural/runtime surface. Principle
    (user, 2026-07-09): sometimes the most direct control over an
    agentic worker is the injected prompt surface itself — bootstrap-
    level law is gate zero, acting before any kernel admission can.
- change_class: realization_refactor
- re_entry_point: authored bootstrap surface (install_bootstrap module)
- triaged_at: 2026-07-09
- created_at: 2026-07-09
- updated_at: 2026-07-09
- links: T-209 (governance-failure addendum — mechanical enforcement is
  the backstop this surface complements), GOALS.md Phase 1 (the three
  foundation laws now live in PRODUCT.md), fd-fp-boundary precedent

## Intake Triage (performed)

1. SUBSTANTIVE? Yes. The injected bootstrap is the FIRST constraint
   surface an F_P worker reads in every installed workspace. Today it
   compresses structure (types, algebra, regimes) and runtime truth
   rules, but carries NONE of the foundation laws ratified 2026-07-09:
   three-layer ownership, execution-default, earned depth. A worker
   operating on bootstrap context alone can rebuild framework execution
   in good faith — the exact odd_glc mechanism: the sbt machinery was
   built openly, motivated by laws the worker COULD see (anti-self-
   report) and unconstrained by laws it could NOT (execution-default,
   which did not exist in its context).
2. UPWARD WALK: intent, product, and requirements now carry the laws
   (Phase 1 constitutional repricing, 2026-07-09). The bootstrap is a
   precreated authored READ MODEL over that live surface, injected by
   the installer and versioned with the release. Requirement present,
   product present, read model stale => first missing layer is the
   authored bootstrap => realization_refactor; no upstream reprice.
3. DEFENSE-IN-DEPTH POSITION: this surface is gate ZERO (cheapest,
   earliest, reaches the worker's reasoning before any act); the T-209
   mechanical enforcement (execution-result provenance gate + standing
   conformance differential) is the BACKSTOP. They compose; neither
   substitutes for the other. Prose law without an admission chokepoint
   is advisory (governance ruling) — AND admission gates without
   prompt-level law waste worker turns on acts that were never lawful.
4. SPAN: authored bootstrap text in
   code/src/app/m04/install_bootstrap/typescript_installer.ts ->
   injected AGENTS.md/CLAUDE.md at install -> every installed
   workspace's worker context (including odd_* build tenants) ->
   release artifact (bootstrap version stamps with the cut).
5. RELEASE SCOPE: must land before the Phase 6 Foundation Release cut —
   the released installer stamps the bootstrap, and the release claims
   the foundation laws; an installer that injects a bootstrap silent on
   those laws ships a stale read model of its own release claim. Rides
   any rc after realization.

## Scope

1. Add the constitutional boundaries to the bootstrap compression,
   phrased as operating rules for the READING agent (the audience is
   the worker itself):
   - three-layer ownership: GTL declares syntax; ABG interprets,
     admits, derives, gates (ALL systems functionality); odd_* ships
     domain declarations only and owns no systems functionality
   - execution-default: execution belongs to typed F_P worker turns
     returning typed execution-result nodes; the framework, binding,
     or harness NEVER invokes the toolchain (no spawn of build/test
     commands outside the declared worker turn); F_D consumes admitted
     results, never performs execution — determinism does not
     reclassify execution as F_D
   - earned depth: depth truth derives from admitted intermediate
     assets plus admitted evidence; declaration equality never closes;
     proof obligations are discovered from admitted assets, never
     statically enumerated
   - evidence provenance: execution evidence is closure-bearing only
     with admitted worker-turn provenance; framework-assembled or
     self-reported evidence is inadmissible
2. Compression discipline: the bootstrap is bounded; review what to
   REMOVE or tighten to make room — boundaries outrank enumerations of
   runtime carrier names (a worker that knows the boundary can look up
   the carrier; the reverse fails).
3. Preserve the precedence law unchanged: the bootstrap remains a
   constrained read model; live constitutional/design surfaces win.
4. Both injection targets (AGENTS.md, CLAUDE.md) and any sibling
   bootstrap copies (python tenant GTL_BOOTLOADER.md noted as paused
   reference — update only if the file is touched by release ritual).

## Acceptance

- injected bootstrap carries the four boundary blocks above, agent-
  addressed, within the existing compressed register
- bootstrap version bumps with the rc that carries it; installer test
  (install lane) asserts the boundary text is present in the stamped
  AGENTS.md/CLAUDE.md (content verification, not manifest-only — the
  rc.6 lesson)
- precedence/read-model framing intact
- a compression removal list is recorded in the ticket on closure
  (what was cut to make room and why)

## Non-closure

- appending the laws without the compression review (an unbounded
  bootstrap is a different defect)
- boundary text present in the repo CLAUDE.md but not in the
  INSTALLER-injected bootstrap (the repo copy is not the product
  surface)

## Closure (2026-07-09)

Realized in installedAbgGtlContextContent (app/m04 install_bootstrap):
four constitutional boundary blocks added, AGENT-ADDRESSED ("these
govern YOU, the agent reading this" / "YOU run them inside your turn"):
three-layer ownership, execution default, earned depth, evidence
provenance. Install-lane integration test CONTENT-verifies all four
blocks plus the never-invokes-toolchain sentence in the STAMPED
AGENTS.md/CLAUDE.md (not version lines).

COMPRESSION REMOVAL LIST (what was cut to make room, and why):
- The 15-item "ABG traversal owns ..." enumeration collapsed into the
  three-layer ownership block's 8 anchors — the boundary statement
  subsumes the enumeration; a worker that knows the boundary can look
  up the carrier, the reverse fails.
- The standalone "Downstream products may publish..." axiom merged into
  the ownership block (its prohibition list survives verbatim there).
- The GraphFunction and program-surface axioms merged to one bullet;
  the binding enumeration trimmed of duplicates (starts/security kept
  as roles/policies/contracts).
Net: content grew only by the boundary blocks themselves; structural
enumeration shrank. Precedence/read-model framing untouched.

Live test: the Phase 4 (T-032 Stage D) campaign runs every F_P worker
under this context via the installer-refreshed odd_glc workspace — the
gate-zero claim gets its empirical reading there (delivery shapes
lawful first-attempt vs corrective-guidance cycles).
