# T-270 - Reconcile And Reclose S03

- id: T-270
- title: Reconcile and reclose S03 through the installed external Product path
- type: correction
- ticket_category: design_and_realization_correction
- status: active
- phase_status: m5_s03_repaired_exact_candidate_frozen
- review_status: pending_independent_exact_cut_review
- proof_status: exact_candidate_gates_green
- goal: GOAL-035 M5
- priority: critical
- change_intent: >-
    Preserve the working direct-GTL realization while correcting the exact S03
    continuation, F_H response, direct-control, and design-method defects that
    invalidate its current closure claim.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Section 12 and its realized
    module boundaries
- triaged_at: 2026-07-25
- created_at: 2026-07-14
- updated_at: 2026-07-26
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- implementation_hold: released_for_s03_only
- implementation_hold_effect: >-
    S03 design reconciliation and the exact owned realization repairs may
    proceed; S05, S06, observer/tuner, conservation qualification,
    qualification, and release remain held
- current_product_outcome: ABG5-S03
- retained_behavioral_stock: bcd8769a8163a222e2e59400c904994b3de161fd
- regression_bindings:
  - ABI5-ROOT-001
  - ABI5-M5-EXT-001
- selected_method_release: STDO v2.2.0
- selected_method_commit: 5326562f075d60052806d0d2c79d3db49671a8ea
- selected_method_member_set_digest: ca6dc3d5094fc5473380df45d76da3c52263c5c21c52a3af62f542c97db2f86c
- selected_method_adoption_receipt: .ai-workspace/comments/codex/20260725T060521Z_DECISION_adopt_stdo_2_2_for_abiogenesis_5.md
- superseded_candidate_commit: 19f50c17526517145070ccb2ca3c282fce7de1f2
- superseded_candidate_tree: ccbd9d2de236481be7a282af3780b5dd402393c9
- superseded_candidate_design_digest: f7de6d9f6cd0b1bb27c9ffd2461fcd132b81b4196af101a04d60604169fd81fa
- superseded_candidate_package_digest: de1af9e727842a9e2764f954692f1a47bc6ecbd37e8664e924d5450edd2b2a6a
- superseded_candidate_evidence: .ai-workspace/comments/codex/20260725T090501Z_CHECKPOINT_t270_s03_exact_candidate.md
- earlier_rejected_candidate_commit: 48beb3f38341cc20e4e2d6a2b5a2c4fe0e2e33e2
- earlier_rejected_candidate_tree: b0a58f97739d7ee7f79fecb7ca2d2348f78218e4
- earlier_rejected_candidate_design_digest: bc570436e7cef6a5063cbf83350f599745812e579ff1517be0f23b0239ab1f8c
- earlier_rejected_candidate_package_digest: 86a9f68bd61583bb36222538dcd0feec236b7a7de944d2a2451362008b312daf
- earlier_rejected_candidate_evidence: .ai-workspace/comments/codex/20260725T105928Z_CHECKPOINT_t270_s03_refrozen_exact_candidate.md
- prior_rejected_candidate_commit: 5956d53343597aae8a1d33770cc23bb6468779b7
- prior_rejected_candidate_tree: 1173c98af11576ec32d8cdd81388c325e1e1c2c3
- prior_rejected_candidate_design_digest: cff889b7196b620eb906ce8b1ccc0d0c391de4c42fd75e39bbf09157ea631c71
- prior_rejected_candidate_package_digest: 2b71690d0e1db1a79543334c2ef7192df5adf064a56953fe911e80b78b5f1181
- prior_rejected_candidate_evidence: .ai-workspace/comments/codex/20260725T135632Z_CHECKPOINT_t270_s03_authority_repair_exact_candidate.md
- rejected_candidate_commit: 1d8fd3b0bcbc1fcc39cceb1e9f78c1454e880314
- rejected_candidate_tree: 0dd5fc4be733bacfe66f2144928f8662b4a52445
- rejected_candidate_design_digest: 3056c4e097fda9640bfb3fb8731c99b446e39a2d6274d9672d1faad095da49c0
- rejected_candidate_package_digest: 5c98e1498024721873f0459758b1a7f9e24a865b5242dec881fa41dbce929082
- rejected_candidate_evidence: .ai-workspace/comments/codex/20260725T191047Z_CHECKPOINT_t270_s03_semantics_provenance_exact_candidate.md
- current_candidate_commit: 8865ccff844d06f4f97765f014ae2b59c1e7d84b
- current_candidate_tree: f1a66a2c79f01972f063189bf7668fdb762ce2e6
- current_candidate_parent_design_digest: 39b396c7d58b0e9e2a4c288baedb78462657210d1dac892bcf2a7045c63c1a85
- current_candidate_design_digest: b385ce64745cdb531d8002719d0a3a6f36995c6b8f2418e76eaecdaf46ef15a5
- current_candidate_package_digest: e4345ce38807abd4a988aeff76c3d83274e88ed6e0926adfb635d07fe933732b
- current_candidate_product_content_digest: ee3e31130541b45bc88939279c57ad316e3df95e8f9fc470ae96dec76f99a7ed
- current_candidate_manifest_digest: f6b8682c6bc4d6948017557b8d27133f2579e37fa10eea7feea0e24094d65449
- current_candidate_evidence: .ai-workspace/comments/codex/20260725T200436Z_CHECKPOINT_t270_s03_product_sealed_semantics_exact_candidate.md

## Purpose

T-270 is the sole active M5 execution contract. It owns one selected Product
outcome:

```text
reconcile and reclose ABG5-S03
  -> through the independently packed external Product
  -> while preserving direct GTL -> validator -> HoG -> ABG authority
```

The implementation at `bcd8769a` is retained behavior, not accepted closure.
Completed tickets, decisions, reviews, test counts, and donor branches are
history or evidence. They do not enlarge this ticket.

## Candidate State

Candidates `19f50c17526517145070ccb2ca3c282fce7de1f2`,
`48beb3f38341cc20e4e2d6a2b5a2c4fe0e2e33e2`,
`5956d53343597aae8a1d33770cc23bb6468779b7`, and
`1d8fd3b0bcbc1fcc39cceb1e9f78c1454e880314` received changes requested and
are historical evidence. The bounded repair retains the prior continuation,
grant, and trusted-actor corrections; moves the projection registry and
unexported mint wholly into Product; gives HoG one explicit narrow
Product-owned verifier dependency; and reconciles the actual projection order
and stopped-source-to-distinct-successor relation across M03 and M05. Exact
candidate `8865ccff844d06f4f97765f014ae2b59c1e7d84b` is frozen with S03 unit
4/4, external Product 36/36, M5 127/127, M4 26/26, M03 Mermaid 3/3, M05
Mermaid 7/7, and two byte-identical 176-entry packages. It remains pending
decorrelated independent exact-cut review under the bounded human delegation
recorded at
`.ai-workspace/comments/human/20260725T200503Z_DECISION_delegate_stage_progression_to_independent_review.md`.
This state does not close S03 or authorize S05, S06, qualification, or release
before that review is dispositioned.

## Governing Authority

Read this ticket through:

1. `specification/GOALS.md`;
2. `specification/PRODUCT.md` `ABG5-S03`;
3. `specification/requirements/product/REQ-P-SCENARIOS.md`;
4. `specification/requirements/product/REQ-P-POLICY.md`;
5. applicable ABG continuation, projection, and construction requirements;
6. accepted M03 direct-GTL design; and
7. M05 Sections 1 through 11 plus the provisional Section 12 realization.

If this ticket conflicts with Product or requirements, the higher authority
governs. Commentary and the implementation cannot silently reprice them.

## Exact Defects

This correction owns four defects:

1. public continuation accepts a process-local lookup when the explicit
   durable authority is omitted;
2. an F_H response that differs from the Product-owned pending choice can be
   recorded as succeeded before later continuation refuses to close;
3. direct public control requires `until = first_traversal` in design and code
   while the live requirement requires `until = converged`; and
4. the active S03 boundary closed without reconciled Ontology, atomic-function
   derivation, whole-family Prime contraction, IACS, module ownership, three
   views, axiom evaluation, and module-owned proof.

No other refactor is selected by this ticket.

The current bounded review repair is causally inside defects one and four. It
must:

- derive duplicate and idempotency truth from durable events rather than
  process-local invocation state;
- return refreshed continuation authority after every appended outcome,
  including post-resume refusal;
- admit actor-operation capability grants with the root invocation and require
  the exact grant for F_H public operations;
- preserve the M03 dependency direction by keeping installed Product contract
  and F_H response semantics in `src/product`, admitting the public operation
  before invoking them, and reserving HoG's exact install-bound port for
  F_D/F_P leaf execution;
- disposition the complete changed atomic-function family, contract it against
  the eight accepted M3 Prime families, and project faithful domain, sequence,
  lifecycle, and axiom views;
- distinguish resolved append-authority exhaustion from retained immutable read
  authority; and
- prove both direct and supervised rejection of `until = first_traversal`.

## Design Reconciliation

Design and code may co-evolve. Before S03 reclosure, one boundary-bounded S03
design cut shall:

- identify the active entities, relationships, cardinalities, lifecycle, and
  authority;
- derive or disposition the S03 atomic and composed function families;
- perform whole-family Prime contraction without presuming that fewer
  functions, types, or files is correct;
- identify authoritative, subordinate, effect-edge, and downstream carriers;
- classify public versus module-local visibility;
- reconcile domain, sequence, and lifecycle views;
- evaluate applicable axioms; and
- map the retained implementation and module-owned proof to the accepted cut.

The design pass may retain the current module and function shape. It
authorizes refactoring only where it proves duplicate, ambiguous, or rival
authority.

## Realization Contract

The corrected installed path shall preserve:

```text
public start or invoke
  -> Product-owned One Surface semantics
  -> ABG-admitted hold, gap, correction, re-entry, or terminal truth
  -> explicit durable public authority
  -> fresh-context read | interaction.respond | run.continue
  -> append-only event truth and replay-derived public outcome
```

Required realization changes:

- make process-local continuation state cache-only or remove it;
- require the explicit durable public continuation carrier whenever public
  truth is reopened;
- reject a response that does not match the pending interaction, Product-owned
  choice, actor capability, response contract, and current basis;
- resolve the `root_mode` and `until` contradiction at requirement authority
  before code and design converge on one law; and
- add module-owned proof for the corrected boundary.

## Functional Review Criteria

Review must answer:

1. Can omitting the durable continuation carrier change admissibility?
2. Can process-local state authorize a read, response, continue, or re-entry?
3. Does a mismatched F_H response refuse before satisfying the pending
   interaction?
4. Is the direct-control law identical in requirement, design, validator,
   runtime, SDK, CLI, and installed tests?
5. Does the accepted S03 design derive every changed authority-bearing
   function and carrier?
6. Did any correction introduce another controller, runtime, event writer, or
   semantic authority?
7. Do the existing installed external Product and root regression paths remain
   green?

## Acceptance

S03 closes only when:

- the four exact defects are repaired;
- the boundary-bounded design reconciliation is accepted;
- targeted fresh-context and negative tests pass;
- `npm run test:m5:external` passes serially;
- `npm run test:m5` passes serially;
- `npm run test:m4` passes serially;
- package construction remains source-independent and reproducible;
- no compiler, lowering carrier, Public controller, second runtime, or rival
  event authority is introduced; and
- the exact implementation and evidence subject receives the required review
  and acceptance disposition.

## Non-Closure Conditions

S03 remains open if:

- a WeakMap, registry, process lifetime, or ambient workspace file can change
  public continuation authority;
- invalid F_H input is recorded as a successful response;
- direct-control semantics remain contradictory;
- design evidence merely renames broad authority categories as Prime or IACS;
- installed tests bypass the public path they claim to prove;
- test success is substituted for missing design or module proof; or
- work from S05, S06, observer/tuner, qualification, or release enters the
  promoted subject.

## Exclusions

This ticket does not authorize:

- S05 Consensus repair;
- S06 portability repair;
- observer or tuner implementation;
- complete RC5 conservation reconciliation;
- qualification or release;
- a Product rewrite;
- a new ticket hierarchy;
- a whole-engine Prime census;
- restoration of X or another rebuild; or
- speculative refactoring without a proved S03 authority defect.
