# Independent witness proof triage

Reviewer: `/root/rc5_scope_review`, max, returned to Root 2026-11-03.
This preserves the closed Reviewer result; Root disposition is separate.

Product Frame: unchanged ABIogenesis5/GOAL-035/T-287 and STDO3.0.4. This is an
in-scope witness proof reconciliation under selection03, not source acceptance
or another qualification review.

Verified subject SHA256
`fe52743667dad4c06c929fd14cbb5b4ac4b28b1d6c19eb826a61e8f4a6f84c39`, all four
frozen files and the author TAP in `witness-triage-001`.

## Finding and contract

The extra reads are not required by the governing contract. Frozen
`T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md:64` requires complete cold
authentication followed by authenticated selection of required bodies. Line66
explicitly says complete historical populations do not become compulsory at
later internal handoffs. Neither requires reading every closed-prefix body again.

`witness-reprice-definition-binding.test.mjs:135–140` interprets that law as
acquisition reads plus every closed row, with bytes equal to the entry plus
complete closed log. Line219 repeats that interpretation. Those equalities
encode the former complete-array sweep.

**S2 proof/proportionality defect, high confidence.** Product-bound scale:
`ABI5_PROJECT_REFERENCE_FRAME_BASIS.md:376–377`, a material proof defect with a
bounded workaround. The assertions reject a potentially lawful reduction and
encourage restoration of redundant work. Impact is bounded to these witness
proof oracles and the selected migration; no runtime semantic regression is
established. Repair complexity is low for the assertions, but regression risk
lies in accidentally weakening cold/profile checks.

The existing owner relation remains:

- `witness_definition_bindings.ts:154–162`: authenticate ancestry; preserve
  ordinary profile identity or exact authorized L→P boundary, final event
  identity, declaration and content.
- Lines308–323: resolve the unique admitted event, check its member-specific
  kind and derive its complete event-body digest.
- Lines327–341: check the transition while held, complete the resource, and
  require the receipt's exact checked successor.
- `witness_admission_operation.ts:1158–1185`: retain the profile-upgrade owner
  or atomic ordinary pair admission and genuine durable successor.
- Recovery HOW60/64/66: retained immutable evidence and portable handoffs do not
  replace fresh physical authentication after ownership ends.

## Evidence limits

The withdrawn migration's correctness remains indeterminate. The frozen TAP
establishes successful material-history witness output before failure at139,
and successful profile output, L/P identities, exact boundary and three rows
before failure219. Failure139 prevented controls142–148: standalone cold
correspondence, forged receipt and changed physical bytes. Failure219 prevented
controls220–229: copied/raw correspondence, changed content/boundary,
unauthorized upgrade and repeated upgrade.

The retained material-case observation records321 acquisition reads/20,972,406B
plus two body reads/20,975,747B:323 reads,41,948,153B and one acquisition decoder
parse. These are observations, not proof that the omitted read was semantically
unnecessary. Reported22/22 after restoring the reads does not qualify the
withdrawn migration.

## Owning re-entry and minimal proof

Test reconciliation under unchanged HOW suffices. Correct the count assertions
and their misleading comments; do not merely hardcode323/3 or accept any smaller
count. No new library, authority or Product/HOW reprice is required.

Minimal discriminating proof on the repaired frozen successor:

1. Execute existing semantic and cold/negative controls before an obsolete
   count assertion can abort them.
2. Preserve exact output, pair admission, profile boundary/content, close
   successor and close-failure behavior.
3. Preserve copied/foreign/wrong-prefix and post-close changed-byte refusals.
4. Separate acquisition decoding from selected-body reads and show the avoided
   sweep without imposing a minimum full-log traversal.

The original witness migration remains selected and open. It cannot be deferred
as a separate owner's task. No moving source, edits, tests, builds or provider
calls were used in this diagnosis.
