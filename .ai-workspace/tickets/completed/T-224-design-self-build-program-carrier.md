# T-224 - Design The Self-Build Program Carrier

- id: T-224
- title: Design the self-build program carrier
- type: feature
- ticket_category: ordinary
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_course_correction
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- activated_at: 2026-07-11
- goal: abg-5-0-full-product-delivery
- phase: DS-1F
- priority: high
- change_intent: >-
    Define the bounded B5 declaration/data carrier that both the installed
    4.6.0-rc.3 predecessor and the future 5.0 candidate can admit and invoke.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M02 B5 publication and exact I4/I1 public catalog/start compatibility consumed by M03
- dependencies:
  - T-221
  - T-223
  - T-241
- authority_refs:
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - .ai-workspace/tickets/completed/T-221-close-exact-4-6-prior-release-boundary.md
  - .ai-workspace/tickets/completed/T-223-realize-installed-catalog-sdk-cli-steel-thread.md
  - .ai-workspace/tickets/completed/T-241-reprice-exact-i4-bootstrap-compatibility-profile.md

## Target Truth

`B5` is one immutable `self_build_program_manifest`, not a new compiler or
controller. It carries schema version, identity, version, digest, GTL Module
and GraphFunction refs, compatibility with exact P4/I4 and the 5.0 candidate
line, an S5 input-root contract, declared result/equivalence surfaces, and
required plugin/capability refs.

Exact I4 predates the 5.0 contract catalog, `AbiogenesisPublicSdk`, `abg.cli`,
and the DS-1 operation set. The cross-line contract is therefore the unchanged
serialized Module/GraphFunction, StartIntent input/output, runtime-registry,
event, and public callable-start meaning, not a fictional common adapter. I4
uses its released public Module/start contracts. I1 admits the exact same B5
bytes through the 5.0 public catalog and SDK. No compatibility facade may be
added over I4.

## Required Work

1. Define B5 identity, version, digest, compatibility, input, output, and error
   carriers under public contract row `abg.schema.self-build-program-manifest`.
2. Define the exact P4/I4 and future-I1 common contract subset.
3. Inventory the exact immutable I4 exported/public API and prove every
   stage-one B5 operation is reachable there; no new DS-1-only facade may be
   assumed to exist in P4/I4.
4. Define `parse-bind-list-start` precisely: I4 lists the GraphFunction from the
   admitted Module declaration and starts it through its existing public
   callable-start/runtime-registry path; only I1 uses DS-1 catalog list/invoke.
5. Define source isolation: S5 is immutable job input and never executable runtime fallback.
6. Define the bounded fixture action that demonstrates P4/I4 admission before full self-build work.
7. Define how the unchanged B5 identity is proven across both bootstrap stages.
8. Define B5's native/schema locators, authority refs, capability identities,
   version, and digest row in the cumulative public contract catalog.
9. Publish the design/IACS/carrier and feasibility proof contract.

## Closure Law

Close when T-225 can construct the exact B5 manifest and prove P4/I4
parse-bind-list-start feasibility without inventing private runtime shims or
depending on unfinished 5.0 behavior.

## Non-Closure Conditions

- B5 embeds executable ABG runtime or provider code from S5.
- P4/I4 is required to understand the complete future 5.0/G5 product.
- P4/I4 is claimed to expose the 5.0 public catalog, SDK, CLI, or DS-1
  operation identities.
- B5 compatibility does not explicitly cover both runtime lines.
- odd_glc becomes bootstrap compiler substrate.
- Equivalence meaning or deterministic/nondeterministic surfaces remain implicit.

## Proof Surface

- `git diff --check`
- exact carrier and compatibility review
- P4/I4 API reachability walk
- source-isolation threat-to-supported-path review
- phase-end authority/design self-review

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_course_correction
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Designs the B5 self-build packaging carrier, the formal self-host's entry leaf. The certified C1/C2 loop packages frozen S5 and never witnesses authoring (post S3.1); under the campaign model the builder is the campaign itself and needs no B5 carrier.
- Re-entry: None as a carrier. Codex's in-flight untracked carrier design drafts (build_tenants/abiogenesis/typescript/design/M02_M04_SELF_BUILD_PROGRAM_*.md) remain uncommitted working papers; their archive-as-reference disposition is residual R6 on T-242.
- No code, specification, design, or release surface changed by this closure.
