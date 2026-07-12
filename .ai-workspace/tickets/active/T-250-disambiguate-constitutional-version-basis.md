# T-250 - Disambiguate Constitutional Version Basis

- id: T-250
- title: Disambiguate constitutional version basis across source, published RC, release, product, and install
- type: requirements_realization
- ticket_category: constitutional_drift_detection
- status: blocked
- review_status: pending_fh_design_review
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- priority: high
- owner: abiogenesis
- build_tenant: typescript
- change_intent: >-
    Reprice LAWS-028 so constitutional version drift compares each witnessed
    surface only with the uniquely resolved version fact for the same source
    project, published RC cut, tapped release cut, product, or installed product, preserving the immutable
    4.6.0-rc.3 release truth while the mutable source advances on
    5.0.0-dev.0.
- change_class: requirement_reprice
- re_entry_point: specification/requirements/gtl/REQ-L-GTL3-LAWS.md#REQ-L-GTL3-LAWS-028
- affected_boundary: >-
    LAWS-028 constitutional surface rows and live facts, the M03 semantic
    compiler drift judge, T-193/T-195 witnesses, and role-specific source and
    release documentation labels
- triaged_at: 2026-07-12
- created_at: 2026-07-12
- updated_at: 2026-07-12
- source_ticket: T-242
- dependencies:
  - completed T-193 constitutional drift detection
  - completed T-195 docs and release-note drift gate
  - completed T-243 4.6 predecessor disposition
  - active T-249 stable-first constitutional reprice
- authority_refs:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/product/REQ-P-QUAL.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/RELEASE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - .ai-workspace/tickets/completed/T-193-detect-constitutional-drift-via-conformance-rows.md
  - .ai-workspace/tickets/completed/T-195-rc10-review-remediation-wave-toward-4.3.md
  - .ai-workspace/tickets/completed/T-243-settle-4-6-predecessor-line.md
- design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_CONSTITUTIONAL_VERSION_BASIS_BEHAVIOR_DESIGN.md
- admission_condition: >-
    F_H accepts the requirement direction and the three-view behavior design;
    until then no requirement, compiler, test, documentation, release asset,
    branch, or tag edit is authorized by this ticket.

## Intake Triage

1. **Observed defect**: the T-193 real-tree witness and its embedded T-195
   release-note assertion compare the mutable source package identity
   `5.0.0-dev.0` with release-derived `4.6.0-rc.3` surfaces. Focused execution
   passes five of seven tests and fails those two comparisons. The standalone
   T-195 docs test also misses final versions such as `4.5.1` because it scans
   only `4.x.y-rc.n` text.
2. **Authority defect**: LAWS-028 exposes one `packageVersion` fact for every
   version-bearing constitutional row. That carrier predates the now-explicit
   source-project, published-RC-cut, tapped-release-cut, product, and install
   taxonomy and cannot
   represent lawful cohabitation of more than one version subject.
3. **Smallest lawful re-entry**: `requirement_reprice` at LAWS-028. A test-only
   exception or blind version replacement would preserve the category error.
4. **Preserved truth**: the embedded `AGENTS.md` and `CLAUDE.md` bootloader
   blocks remain byte-identical to `v4.6.0-rc.3`. The current RC note remains
   byte-identical to the tracked rc.3 snapshot note, whose manifest and package
   identify `4.6.0-rc.3`. They are not relabeled as an unpublished 5.0 product.

## Target Truth

Every witnessed version line resolves one separately authorized surface binding
and one version fact for the same exact subject before comparing values.
`source_project`, `published_rc_cut`, `release_cut`, `product`, and
`installed_product` facts never substitute for one another. Missing, duplicate,
or kind-incoherent basis is a typed fail-closed result; unequal values on a
resolved basis remain the existing `version-line-drift` diagnostic.

## Design-Stage Scope

This activation authors only the behavior design required to make the reprice
reviewable. The design must include:

- the existing prime conformance input/result carriers plus the subordinate
  surface-row, surface-binding, version-subject, version-fact, and live-facts
  payload shapes;
- class/domain, sequence, and state-machine Mermaid views;
- loader-versus-compiler ownership and the
  source/published-RC/release/product/install authority split;
- invariant and axiom evaluation;
- exact current-tree subject bindings and preserved rc.3 assets;
- focused positive, mutation, missing-basis, duplicate-basis, and real-tree
  proof cases; and
- explicit non-scope and break order.

## Required Work After F_H Admission

1. Reprice LAWS-028 and its CONTRACT-LAW-API index wording without changing
   the other T-193 drift families.
2. Replace the single constitutional `packageVersion` comparison input with
   separately authorized surface bindings and uniquely keyed typed version
   facts at the existing M03 compiler boundary.
3. Retain `version-line-drift`; add one ratified diagnostic for an unresolved,
   ambiguous, or kind-incoherent version basis and bind each typed internal
   reason to the existing public repair-affordance vocabulary.
4. Rework T-193 constructed and real-tree witnesses to prove mixed source,
   published-RC-cut, tapped-release-cut, product, and installed-product
   subjects without false equivalence.
5. Rework T-195 so constitutional documentation claims are judged by the same
   compiler, while release-note integrity compares the note with its release
   snapshot manifest and digest rather than the mutable source package.
6. Correct only role-specific current documentation labels: published-RC-line
   claims identify rc.3; explicit mutable-source package claims identify
   `5.0.0-dev.0`.
7. Run the focused tests and complete semantic suite, then self-review against
   the accepted design and the immutable-release boundary.

## Non-Closure Conditions

- `AGENTS.md`, `CLAUDE.md`, or the rc.3 note is blindly bumped to
  `5.0.0-dev.0`.
- A source-project fact is accepted as evidence for a published RC cut, tapped
  release cut, product, or installed product, or vice versa.
- A witnessed surface selects a subject without a separate exact
  authority-bearing surface binding.
- The current source workspace is represented as an installed ABIogenesis
  product without an actual install manifest.
- Missing or duplicate basis silently falls back to source `package.json`, any
  inferred "latest" cut/product, or string inference from a surface path.
- T-195 retains a global SemVer regex that treats every version occurrence as
  one current identity.
- A second drift judge is created outside the semantic compiler.
- Requirement or realization work begins before F_H accepts this design.

## Design Review Gate

The ticket remains `blocked` until F_H reviews the exact carrier, diagrams,
axiom matrix, current-tree binding table, proof matrix, and non-scope in
`M03_CONSTITUTIONAL_VERSION_BASIS_BEHAVIOR_DESIGN.md`. Acceptance opens the
requirement edit; it does not itself authorize release publication or any
change to rc.3 history.

## Closure Law

Close only after the requirement reprice is ratified, the accepted carrier is
realized at the one semantic-compiler judge, all source/published-RC/tapped-
release/product/installed-product differentials and real-tree witnesses pass,
role-specific docs are coherent, the semantic suite is green, and no rc.3
snapshot, branch, tag, embedded bootloader block, or release-note content was
rewritten to simulate closure.
