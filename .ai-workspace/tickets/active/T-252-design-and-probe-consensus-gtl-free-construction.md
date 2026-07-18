# T-252 - Repair Canonical Consensus GTL Free Construction

- id: T-252
- title: Correct canonical Consensus F_H targets, recurse law, and reachable schema ownership
- type: bug
- ticket_category: ordinary
- status: active
- phase_status: repaired_body_implemented_pending_independent_review
- review_status: independent_implementation_review_pending
- implementation_admission: repaired_body_implemented
- proof_status: focused_green_full_suite_rerun_pending
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Preserve one lawful canonical Consensus GTL free construction while making
    both F_H leaves declare their actual round-disposition result and making
    bounded recurse total over the three admitted outcomes, with one closed
    native source/key family and exact flat Module metadata for every reachable
    symbolic Node schema.
- delivery_phase: DS-1
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md
- triaged_at: 2026-07-14
- created_at: 2026-07-12
- updated_at: 2026-07-18
- prior_completed_at: 2026-07-14
- prior_implementation_commit: abed6a0a
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- reopened_at: 2026-07-18
- closure_invalidated_by:
  - both F_H vectors target runtime pending-interaction data instead of their declared ConsensusRoundDisposition result
  - bounded recurse terminates only closed_done instead of closed_done or escalate_fh
  - foldback and terminal result projection do not yet encode the exhaustive three-outcome law
  - the canonical Module does not yet declare a neutral versioned owner key for each reachable symbolic Node schema
  - T-270 cannot lawfully copy T-274A-generated coordinates, digests, locators, or witnesses into the synchronous T-252 Module
  - the two reachable Vector schemas have decoder witnesses but no closed native schema sources
- prior_decision_ref: .ai-workspace/comments/codex/20260713T044119Z_DECISION_fh_accept_t252_t263_t264_corrected_checkpoint.md
- prior_correction_ref: .ai-workspace/comments/codex/20260713T041830Z_REVIEW_GATE_t252_t263_t264_authority_correction.md
- prior_proof_ref: .ai-workspace/comments/codex/20260713T043615Z_PROOF_t252_t263_t264_clean_correction_gates.md
- prior_closure_proof_ref: .ai-workspace/comments/codex/20260713T044638Z_PROOF_t252_t263_t264_post_acceptance_closure.md
- prior_authority_repair_ref: .ai-workspace/comments/codex/20260713T053229Z_PROOF_t255_round2_t252_authority_repair.md
- design_ref: build_tenants/abiogenesis/typescript/design/M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md
- repaired_design_digest: f1e119d5f38209409310c7f3631c3b3ee10663c02464b218cdae80e2e8e25444
- accepted_repaired_design_digest: f1e119d5f38209409310c7f3631c3b3ee10663c02464b218cdae80e2e8e25444
- repaired_design_review_and_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260718T022245Z_REVIEW_DECISION_t252_t272_constructability_repair.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260718T001835Z_SELF_REVIEW_t272_event_basis_and_lifecycle_repair.md

## Boundary

T-252 owns one result: a canonical Consensus GTL body built only from public
GTL atoms, plus an independently derived first compiler-gap census. It does not
realize a reported gap, introduce a Consensus runtime, or infer catalog-owner,
capability, execution, event, replay, or closure truth.

The bounded 2026-07-18 re-entry changes only canonical graph declarations:

- `fh-initial` and `fh-post-submitter` target
  `ConsensusRoundDisposition`;
- `FhPendingInteraction` leaves the GTL node/value graph and remains ABG
  event/projection truth;
- bounded recurse terminates on `closed_done | escalate_fh` and folds only
  `recurse_next_round`; and
- the outer result path accepts the declared terminal outcomes, never a held
  interaction;
- one closed M03 source/key family owns all fifteen repaired reachable schema
  boundaries: thirteen direct schemas plus two native Vector schemas;
- the Module owns exactly one
  `abg.runtime_schema_admission_bindings` metadata entry with strict flat rows
  `{graphFunctionId,nodeRef,symbolicSchemaRef,contractId,contractVersion}`; and
- each reachable tuple has one row, while repeated rows may lawfully reference
  the same versioned contract key.

T-272 owns response and same-locus continuation. T-275 supplies the interaction
subject, policy, response shape, and result binding. It owns no schema identity,
native definition, or metadata row. No T-252 runtime, controller, store, event,
or interaction identity is permitted.

T-252 metadata contains no M04 coordinate, projected `schemaId`,
`schemaVersion`, or digest, locator, native symbol, projection witness,
callable, or admission result. The existing
Module digest is the only metadata seal. T-274A remains closed over nine public
schema assets and two vocabularies. T-274B later derives and delivers asserted
native definitions for every distinct public or engine-private key named by
the repaired Module as an exact fifteen-definition runtime join input, while
publishing only the existing nine public assets. The other six public assets
remain outside the runtime join. M04 performs the total functional key join and
seals full definition facts in the runtime-schema capability basis; generated
facts never flow back into the T-252 Module. T-274B's own ticket and design must
adopt this private delivery boundary before implementation starts.

No code may change until the amended three-view design receives independent F_H
acceptance. The prior body digest remains historical evidence, not repaired-body
closure.

## T-252 Census Gap Ownership

- gap_family: consensus_fh_recurse_and_reachable_schema_ownership

## Superseded Closed State

The prior closed state below is retained as superseded evidence. It is not the
current disposition. External review reproduced non-zero whole-program
conformance errors while the sealed census exposed only the T-268 capability
gap. T-252 is reopened until topology and census truth agree.

The canonical body is implemented at
`build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consensus_gtl_body.ts`.
Its serialized body digest is
`sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`.
The body is pure GTL data and its static source-import closure reaches none of
the fenced runner, transport, events, app, qualification, or bin implementation
directories. Pure contract modules remain visible in that closure.

The prior checkpoint was not lawfully closed. Commit `ebe0eea` inferred F_H
acceptance from a generic instruction to continue. That inference is void. The
corrected design, body, and proof were subsequently accepted explicitly at the
decision record above.

The corrected probe:

1. derives gap observations from focused compiler outcomes, full-conformance
   issues, and explicit structural predicates before reading ticket ownership;
2. joins the independently observed families to singular active owners;
3. reports active owned families no longer observed as closure candidates
   rather than fabricating them back into the census; and
4. limits the no-execution statement to static source reachability. It records
   that runtime calls were not observed rather than emitting literal zero call
   counts.

## Authority Split

- T-252 owns the pure-data construction, the closed public/private native
  source-key family for every reachable symbolic schema, the exact flat Module
  metadata projection, and the observed compiler frontier. The source-key
  family extends and projects the existing `CONSENSUS_DOMAIN_SCHEMAS`; it does
  not re-author a schema or decoder family.
- T-263 owns strict raw Module admission.
- T-264 projects exact effect requirements and proportional structural
  conformance inventory.
- T-274A remains closed over nine public schema assets and two vocabularies.
- T-274B derives and delivers asserted native definitions for every distinct
  T-252 key as the exact runtime join input, packages the exact Module, and
  publishes only the standing nine public assets. Its accepted design must be
  amended to carry that private delivery before implementation.
- T-275 owns profile/panel/policy binding, result admission, and ticket-result
  projection; it owns no schema source, key, definition, or metadata row.
- M04 admits the canonical tenant-conformance manifest; T-255 derives its
  basis-preserving capability coverage and performs compatibility admission.
- DS-4 supplies ABG 5.0 tenant-conformance-manifest coverage including
  Consensus.
- ABG runtime owners retain traversal, effects, events, replay, and closure.

## Repaired Candidate Exit

After explicit design acceptance, the bounded implementation must:

1. repair both F_H targets and the exhaustive recurse partition;
2. remove `FhPendingInteraction` from the GTL value graph and reachable schema
   roster;
3. define the exact fifteen-source runtime-schema family, including native
   schemas for both Vector boundaries;
4. derive one canonical strict flat metadata row for every reachable
   GraphFunction/Node/symbolic-ref tuple;
5. reject duplicate, missing, extra, divergent, generated-fact, and unknown-
   field rows through strict Module admission and the T-252 probe;
6. prove three reachable keys reuse existing public identities while twelve
   engine-private keys create no public catalog row;
7. regenerate the repaired Module/body digest and observation-first census;
8. demonstrate that T-274B can derive one asserted native definition for every
   distinct referenced key, with every metadata row resolving exactly one
   definition and no unused runtime-join definition, while six other public
   assets remain outside that join; and
9. rerun focused, GTL, strict Module, Prime, governance, publication-boundary,
   and full semantic gates before closure review.

## Closure Evidence

- body digest after the topology correction is
  `sha256:dc4686b3acd145181ffa58c9377bc33f5324914139b38f052aec53060a21c1c8`;
- the sealed manifest authority is regenerated from this ticket's live path;
- final manifest digest is
  `sha256:45f01671798cb9aa6c836ae0d857f1b327626b35225086c3ac5ba99341ee1110`;
- canonical serialization round-trips through strict M02 admission;
- structural invalidity count is zero;
- all five remaining full-conformance issues are mapped to
  `complete_c_program_interpreter` before ticket ownership is loaded;
- all normalized compiler diagnostics are also enumerated before ownership is
  loaded; the current normalized semantic count is zero after the T-255
  vector-program-selection repair;
- fourteen program-conservation failures are separately observed and assigned
  to T-267;
- tenant-manifest coverage remains assigned to T-268;
- every observed gap has compiler or structural observation evidence before
  ownership is joined;
- every observed gap has exactly one active successor owner;
- active implemented families may appear as not observed pending their own
  closure decisions;
- static source reachability is reported without runtime-call claims;
- focused GTL, body, manifest, strict TypeScript, and diff gates pass; and
- the explicit standing F_H delegation authorized this bounded closure pending
  the owner's return review.

Post-review census reconciliation checkpoint: `a644b8eb`. It removes the 34
superseded vector-selection diagnostics and makes normalized semantic
diagnostics independently exhaustive before ownership is joined.

## Non-Closure

Hard-coded successor expectations presented as compiler output, ticket status
shaping the observed census, literal zero call counts without instrumentation,
declaration counts presented as execution evidence, a local Consensus runtime,
inferred F_H acceptance, generated M04 contract facts in Module metadata, an ad
hoc vector decoder used as native admission, a T-274B-manufactured schema
identity, a private schema key in the public catalog, or T-275-owned schema
truth.
