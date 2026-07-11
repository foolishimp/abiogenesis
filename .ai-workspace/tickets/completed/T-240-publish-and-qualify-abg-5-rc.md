# T-240 - Publish And Qualify ABG 5 Release Candidate

- id: T-240
- title: Publish and qualify the ABG 5 release candidate
- type: chore
- ticket_category: ordinary
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_course_correction
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- goal: abg-5-0-full-product-delivery
- phase: DS-8
- priority: high
- change_intent: >-
    Open the ABG 5 RC window, publish one immutable versioned RC descended from
    qualified R5, and complete RC qualification and operator review before tap.
- change_class: realization_refactor
- re_entry_point: release_snapshots
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-235
- build_tenant: typescript
- affected_boundary: ABG RC branch/tag/package/snapshot publication and qualification
- dependencies:
  - T-235
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/RELEASE_METHOD.md
- initial_rc_version: 5.0.0-rc.1
- initial_rc_package: '@abiogenesis/typescript-tenant@5.0.0-rc.1'
- accepted_rc_identity: recorded by closure evidence after the final accepted RC cut

## Target Truth

The mutable `rc/5.0.0` window has at least one immutable published RC cut
descended from exact R5. The accepted cut's branch point, annotated tag,
package, product and conformance manifests, snapshot, checksums, notes,
installed identity, selected qualification, and operator review are coherent.
Any bounded fix after an RC publication receives a new RC identity and reruns
affected gates.

## Ordered RC Work

1. Verify T-235 source-candidate verdict and freeze the RC scope and criteria.
2. Open `rc/5.0.0`, assign the next lawful RC version, and reconcile the exact
   version/release-asset delta from R5.
3. Pack, inspect, publish, and fresh-install the RC through public surfaces.
4. Rerun self-conformance, Hello World, operator loop, native/Codex projection,
   self-host evidence validation, deterministic gates, and any affected live gate.
   Bind the frozen G5 source candidate under the RC version/digest and rerun its
   descriptor/catalog compatibility plus the affected installed data-mapper gate.
5. Materialize immutable RC snapshot, checksums, notes, evidence, branch, and tag.
6. Push and verify remote RC objects and artifact identities.
7. Record operator review and either close green for T-236 tap or publish a new
   RC after any separately triaged bounded fix and complete rerun.
8. Perform the phase-end release/code/evidence review.

## Closure Law

Close when at least one immutable ABG 5 RC cut is published and remotely
verified; the latest accepted RC passes the selected complete qualification;
its lineage to R5 and allowed release-asset delta are reconciled; operator
review is recorded; and no behavioral fix remains unqualified in the RC window.

## Non-Closure Conditions

- R5 is called a published RC without versioned RC branch/tag/artifact identity.
- An RC object or artifact is mutated in place.
- A bounded fix enters without a new RC identity and affected-gate rerun.
- A clean external skip substitutes for a claimed gate result.
- Mutable source or a different self-host candidate enters proof.

## Proof Surface

- package dry-run and closed file census
- fresh installed RC identity, Hello World, and operator-loop evidence
- A5-SH0/A5-SH4 and native/Codex RC qualification
- self-host and exact candidate-lineage reconciliation
- frozen G5 descriptor/binding and affected installed campaign compatibility
- RC snapshot/checksums/notes and remote branch/tag verification
- phase-end review against PRODUCT, QUAL, SCENARIOS, T-235, and RELEASE_METHOD

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_course_correction
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Publishes and qualifies the ABG 5 RC as the self-host candidate; superseded with the R5 identity.
- Re-entry: RC publication re-enters per artifact under the release discipline.
- No code, specification, design, or release surface changed by this closure.
