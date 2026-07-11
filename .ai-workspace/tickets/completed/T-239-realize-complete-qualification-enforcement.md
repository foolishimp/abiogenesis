# T-239 - Realize Complete Qualification Enforcement

- id: T-239
- title: Design and realize complete pre-freeze qualification enforcement
- type: feature
- ticket_category: implementation_migration
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_course_correction
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- goal: abg-5-0-full-product-delivery
- phase: DS-4Q
- priority: high
- change_intent: >-
    Complete the current REQ-P-QUAL enforcement gaps before R5 freezes:
    general executable diff witnessing, removal of legacy repo-tree live-proof
    exemptions, and release-grade bypass/red-refusal admission.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-219
- build_tenant: typescript
- admission_condition: T-232 is completed and its candidate proof surfaces are current
- affected_boundary: M05 executable-census design, diff-execution witness gate, packed-installed live-proof population, and release-grade snapshot admission
- dependencies:
  - T-219 specification reconciliation
  - T-232 self-conformance and observer/tuner realization
- authority_refs:
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - .ai-workspace/tickets/completed/T-219-spec-reconciliation-what-from-realized-how.md
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: existing M05 qualification gates and public packed-product sandbox installer
- old_truth_path: code/src-only diff witness, pinned legacy repo-tree live-test exemptions, and release-grade snapshot requests that honor mandatory-gate bypass flags
- new_truth_path: declared executable census, packed-and-installed substrate for every retained live proof, and release-grade admission that rejects bypass or red mandatory evidence
- old_producer_set: code/src TypeScript diff scanner, legacy live tests importing repo build output, and permissive release-snapshot request admission
- new_producer_set: general executable change census, public installer-created sandbox manifests, and fail-closed release-grade snapshot admission
- old_consumer_set: approving suites, live tests, and snapshot creation accepting partial witness, exempt repo-tree execution, or bypassed release-grade gates
- new_consumer_set: approving suites, exact-cut qualification, RC/final release snapshots, and release read models consuming complete witness/install/non-bypass evidence
- projection_surfaces: changed-file witness report, binding export pin, live-proof substrate census, exemption-list state, install manifests, release-snapshot admission result, qualification verdict

## Target Truth

The approving diff gate witnesses every changed executable surface named by the
released tenant's executable census, independent of language or location. Every
retained live proof runs through a packed-and-installed sandbox via the public
installer. The legacy exemption list is empty and cannot grow. These gates are
ordinary M05 qualification inputs. A release-grade snapshot request cannot
bypass build, lint, test, or exact-cut qualification, and a red mandatory gate
refuses the snapshot. All three corrections finish before the self-host source candidate freezes.

## Required Work

1. Define and admit the complete executable-file census used by the approving suite.
2. Publish the target map, IACS, structural carrier, classifications, typed
   diagnostics, evidence ownership, and proof obligations before realization.
3. Extend witness collection and diagnostics beyond `code/src/**/*.ts` without
   treating prose, fixtures, generated evidence, or non-executable data as code.
4. Preserve the unit-lane export pin and add malformed/stale census differentials.
5. Inventory all pinned legacy live proofs and migrate each to the public
   packed-and-installed sandbox substrate or delete it with owning-proof replacement.
6. Drive the shrink-only exemption list to empty and make any future entry fail.
7. Re-run deterministic and retained live gates and record exact install/witness evidence.
8. Make release-grade request admission reject every build, lint, test, or
   exact-cut bypass before executing or writing snapshot output; keep bypasses
   available only for explicitly non-release diagnostic snapshots with null,
   non-promotable evidence.
9. Add focused release-grade bypass and red-gate refusal differentials.
10. Version and republish `abg.operation.release.snapshot` and
    `abg.schema.release-snapshot` catalog rows, schemas, native locators, and
    digests for the fail-closed request contract; prove installed resolution
    consumes the updated rows rather than stale T-230 metadata.
11. Perform an authority-first phase review before T-233 admission.

## Migration Declaration

Break partial witness and repo-tree live authority first, then rebind each
consumer to general census and public installer evidence. Mixed old/new results
do not qualify a change or candidate. No new harness, package manager, hosted
runner, or hostile-desktop defense is introduced.

## Impacted Interface Review Checklist

- [ ] executable census has one typed public carrier and exact classification law
- [ ] approving gate witnesses changed executable files across supported locations
- [ ] never-committed executable files are witnessed in full
- [ ] all public binding exports remain pinned by unit execution
- [ ] every retained live proof records packed artifact and public install identity
- [ ] no retained live proof imports repo build output as substrate
- [ ] legacy exemption list is empty and additions fail
- [ ] release-grade requests reject build/lint/test/exact-cut bypasses before write
- [ ] red mandatory gates refuse release-grade snapshot creation
- [ ] non-release diagnostic bypasses remain explicit, null-evidence, and non-promotable
- [ ] release-snapshot operation/schema catalog rows and digests match the new admission semantics
- [ ] installed SDK/CLI resolve the updated rows and reject a stale catalog identity
- [ ] exact-cut and release snapshot consumers read the same gate evidence

## Required Break Order

1. Freeze the current executable and legacy-live censuses.
2. Add general witness classification and focused differentials.
3. Rebind approving-gate reporting to the general census.
4. Migrate legacy live proofs in bounded groups through the public installer.
5. Remove each exemption as its proof migrates; reject mixed authority.
6. Replace permissive release-grade snapshot admission and pin bypass/red refusal.
7. Delete the empty-list compatibility path and rerun complete gates.

## Break-To-Closure Map

| Break | Negative proof | Closure evidence |
|---|---|---|
| code/src-only witness | changed executable gate/script outside code/src fails when unwitnessed | complete changed-executable witness report |
| repo-tree live substrate | live proof importing repo build output fails admission | packed artifact plus public install manifest per retained proof |
| exemption authority | adding or retaining an exemption fails | empty-list pin and full live-proof census |
| release-grade bypass | any build/lint/test/exact-cut bypass or red mandatory gate refuses before snapshot output | focused admission negatives and green full-gate snapshot |

## Migration Checklist

- [ ] old and new truth paths are explicit
- [ ] producer, consumer, and projection sets are explicit
- [ ] old truth paths are removed or demoted from authority
- [ ] mixed-state evidence is rejected
- [ ] stale tests are removed or repriced
- [ ] existing M05 and installer libraries are reused
- [ ] ticket wording, PRODUCT/QUAL law, and proof claims are reconciled

## Closure Law

Close only when the design is ratified and the general changed-executable
witness gate is green over its
positive and negative corpus; every retained live proof is packed-and-installed;
the legacy exemption list is empty and fail-closed; release-grade bypass and
red mandatory gates refuse before snapshot creation; the full deterministic and
required live suites pass; the installed public contract catalog resolves the
updated release-snapshot semantics; and phase review finds no second qualification
harness or unsupported hardening scope.

## Non-Closure Conditions

- A changed executable class remains outside the declared census without a lawful exclusion.
- A retained live proof executes against repo build output.
- Any legacy exemption remains or the list can grow.
- A release-grade request can bypass a mandatory gate or record red/null as promotable.
- A test-name assertion substitutes for witnessed execution or install identity.
- The migration widens into remote execution, signing, or hostile-workstation defense.

## Proof Surface

- general diff-witness positive, missing-witness, stale-census, and export-pin tests
- empty legacy-list conformance pin
- per-live-proof packed/install manifest census
- release-grade bypass and red-gate refusal differentials
- public-contract-catalog row/schema/digest and stale-installed-row differentials
- complete deterministic and required live qualification gates
- phase-end code/evidence review against PRODUCT, QUAL, INSTALL, T-219, and T-232

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_course_correction
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: DS-4Q complete pre-freeze qualification enforcement; there is no self-host freeze to gate.
- Re-entry: Executable-census and witness-gate ideas re-enter on demand at release-qualification time.
- No code, specification, design, or release surface changed by this closure.

### Review Amendment (2026-07-12, codex governance review of 34d7f56)

- Correction (review finding 5): REQ-P-QUAL documents a live witness-gate
  gap ("the gate witnesses only .ts files under code/src...") whose owner
  pointer names T-239 — this retirement orphaned it. Ownership of that
  documented gap transfers to T-247 effective this amendment; the requirement
  text's owner pointer updates at the T-249 reprice. Earned-depth campaign
  evidence does not by itself repair the witnessing, live-test-exemption, or
  bypass-acceptance gaps.
