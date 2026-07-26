# T-268 - Realize Replay-Grounded Observer And Tuner

> **Current disposition (2026-07-25):** backlog until S06 closes and GOALS
> selects A5-F12/S04 readiness. The rejected observer/tuner draft is preserved
> on remote archive branch
> `archive/abi5-observer-tuner-wip-20260725T035544Z` and has no active
> implementation authority.

- id: T-268
- title: Realize replay-grounded observer and tuner
- type: feature
- ticket_category: implementation_migration
- status: backlog
- implementation_hold: active
- implementation_hold_ref: GOAL-035 current S03 outcome under T-270
- implementation_hold_effect: >-
    preserve historical evidence; no observer/tuner design, code, test, proof,
    publication, or closure promotion until GOALS explicitly selects A5-F12
- phase_status: m5_a5_f12_unselected
- review_status: prior_section_14_design_provisional
- proof_status: rejected_wip_archived_no_current_candidate
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Realize observer and tuner as declared Product content over ABG replay:
    observer emits attributed diagnostic truth; tuner emits attributed
    declaration drafts; ratification or rejection crosses ordinary policy or
    F_H authority and neither path mutates live authority directly.
- delivery_phase: M5_after_s06
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md S06 delta
- triaged_at: 2026-07-25
- created_at: 2026-07-13
- updated_at: 2026-07-25
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- source_ticket: T-252
- dependencies:
  - T-270 M5 parent and installed public path
  - completed T-272 F_H lifecycle integration
  - completed T-274 Consensus publication
  - completed T-275 attributed profiles and projection
  - completed T-276 installed Consensus scenario
- authority_refs:
  - specification/PRODUCT.md A5-F12
  - specification/PRODUCT.md ABG5-S04
  - specification/requirements/abg/REQ-R-ABG3-TUNER.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
- design_input_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Section 14
- accepted_s06_design_commit: 6aaedf8d826f846a11291676413bd35f93df0ef4
- accepted_s06_design_sha256: fb9e71bccf3e98972179df81a7c22ee7dbc266175d6cda1ae8bc5dff875429b3

## Current S06 Reprice

T-268 is subordinate to T-270 and owns one bounded realization boundary:

```text
ABG replay truth
  -> observer attributed diagnostic projection
  -> tuner replay-derived signal projection
  -> attributed declaration draft
  -> ordinary policy or F_H ratify | reject
  -> replay-visible disposition
```

The observer and tuner are Product content using the same admitted GTL, HoG,
ABG, catalog, SDK, and CLI path as other Products. The observer may diagnose
and attribute; the tuner may propose. Neither may mutate specification,
configuration, tickets, declarations, or runtime truth directly. `project.read`
owns read-only observer and tuning reports; `tuning.transition` owns proposal,
ratification, and rejection. An accepted draft re-enters later as ordinary
governed work rather than changing live authority inside the tuner run.

M5 must realize enough of this boundary to make S04 runnable against one exact
candidate: truthful halt classification, replay-grounded attributed findings
and drafts, ratification and rejection, replay-visible acts, and one injected
negative. M6 owns exact-candidate qualification and the final S04 verdict. A
manifest or capability roster is a derived read model and cannot substitute
for the installed behavior.

## Historical X Evidence

Publish the ABG 5.0 `abg.schema.tenant-conformance-manifest` with exact
Consensus coverage required by DS-4. This extends one canonical engine/build-
tenant manifest; it does not create a Consensus-owned manifest or a second
capability-profile authority.

The canonical manifest binds its schema, manifest, engine, and public-contract-
catalog identities and digests; publishes exact capability claims and
dependencies; and maps every Consensus GraphFunction effect ref to one
supported public capability identity. It also publishes the carrier
classifications, applicable conformance-rule identities, causal predecessor
refs, and owning bounded-proof refs required by
`REQ-M-GTL3-CAPABILITY-010..015`.

T-268 publishes canonical manifest truth. M04 admits that manifest against the
existing public contract catalog. T-255 derives a basis-preserving capability-
coverage projection and decides effect compatibility. T-268 does not self-admit
the manifest and does not own handoff publication or runtime admission.

Capability claims, public capability assets, dependency edges, effect
bindings, and manifest rows must derive from the one PC-006 capability
declaration graph. T-268 may add Consensus coverage to that graph; it may not
author a manifest-only capability roster. The local design must reconcile the
current extra `abg.capability.fh.interact@5` identity against the exact required
16-row roster rather than silently publishing a seventeenth identity.

T-268 does not own the Consensus schema bodies, installed Module/catalog row,
reviewer-profile admission, ticket-result projection, or installed workspace
qualification. T-274 owns publication, T-275 owns the domain carriers and
projection, and T-276 owns the three-workspace installed scenario evidence.

## T-252 Census Gap Ownership

- gap_family: tenant_conformance_manifest_consensus_coverage_missing

This family is active because T-255 now emits a typed canonical-manifest block
for each effect-bearing Consensus handoff. T-268 owns publication of the
missing canonical manifest coverage; it does not own M04 admission, T-255
projection, or T-267 traversal authority.

## Entry And Exit

Enter during DS-4 after the Consensus public schemas and public contract catalog
are stable enough to supply exact identity/version/digest rows. Accept a
three-view design before code. Exit requires the published ABG 5.0 manifest to
pass M04 canonical admission, cover every exact T-264 effect requirement through
catalog-resolved capabilities, preserve dependent-capability closure, and make
the otherwise eligible T-252 handoffs publishable without changing body bytes.
T-267 traversal result-interface and bind-conservation authority is closed.
Those handoffs remain runtime-blocked until T-270 admits the exact public
catalog/start authority. Release qualification must resolve the manifest's
required bounded-proof refs; T-268 may not convert their presence into
fabricated proof success.

## Non-Closure

A Consensus-owned manifest, a second tenant capability profile, package
presence, plugin refs, test names, source paths, unversioned feature labels, a
locally minted catalog, a manifest that omits dependency closure, a coverage
projection submitted as authority, a manifest that admits itself, or any claim
that manifest coverage substitutes for T-267 conservation or T-270 runtime
entry authority.
