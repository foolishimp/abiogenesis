# Review - T-278 Third Release Authority And Algebra Re-Review

**Date**: 2026-07-15 19:03:36Z

**Reviewer task identity**: `/root/t278_second_release_algebra_rereview`

**Review class**: independent authority-path, C-algebra, release, and Prime review

**Independence basis**: the reviewer made no change to the candidate Ontology,
GOALS, T-278, T-247, T-248, or plan. The supplied hashes were verified before
review and again before this post. Counts and conclusions were reproduced from
the frozen subject. This post is the reviewer's only edit.

**Verdict**: reject the exact `/8-candidate` pending two bounded qualification-
basis authority repairs. Accept the direct
`QualificationGateResultVector<K> -> C.of(AF-22)` algebra and its 27/7/19 Prime
contraction. Neither remaining repair requires another atom, composition, public
operation, controller, or ticket.

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `c669e8d7f5c4591c90edd56a318989f4e9598461a8b2b0d14fe3a16b7108f4d0` |
| `specification/GOALS.md` | `3048889924574e3396226ed4d98788f7aad9f4296bd60766d9b46c9d06c326db` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `94820d345a520d7a67d2b190a8820c77a1414bb46b3e54896d0191dcba33bee0` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `7a7b7b77e8ede5aa52f8bd7815e67b8365e41eea9795071d6fba3181a3761d96` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `25dd786b3692204060c8932f388f2903e9be33397429a58d6aef187de22bd7c4` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `3f4c34ee1896571d9906305af6c4f85de5440c8c52ffb5972378bd2e2f9864ee` |

Governing authority was read directly from upstream `RELEASE_METHOD.md`,
`REQ-P-QUAL-050..070`, `REQ-P-SELF-CONFORMANCE-001..011`, and
`REQ-L-GTL3-C-ALGEBRA-001..007`.

## Findings

### 1. P1 - The final basis does not bind the installed-RC qualification authority

The release sequence correctly requires the latest accepted RC to qualify before
prospective final derivation. The installed-RC basis and verdict are deliberately
separate immutable qualification addenda created after the RC cut and snapshot.
The `final_tap_candidate` basis, however, carries only the accepted-RC ref/lineage
and `FinalTapDelta`. It does not carry the exact installed-RC qualification basis
and green verdict refs/digests that authorize the transition.

Evidence:

- `REQ-P-QUAL-068` requires qualification of the latest accepted RC before the
  final tap and requires the RC record to bind selected qualification evidence.
- `RELEASE_METHOD.md:265-279` requires passed RC qualification before tap.
- `T-248:110-123` creates a distinct immutable installed-RC qualification
  addendum and says its green verdict authorizes prospective final derivation.
- The Ontology basis at `:155`, `:215`, and `:680-688` carries accepted-RC ref
  and final-delta truth but no installed-RC qualification basis or verdict.
- The state transition at `:806-807` therefore depends on prose ordering rather
  than a conserved authority carrier.

An RC cut proves the pre-publication basis/verdict that created that cut. It does
not prove the distinct source-blind installed-RC qualification performed later.
Without an explicit ref, a final basis can be structurally formed from an RC
that was published but did not pass its required installed qualification.

Bounded repair: a `final_tap_candidate` basis must additionally bind the exact
installed-RC qualification basis and green, non-bypassed verdict refs/digests.
Those refs must identify the same RC bytes and installed identity named by the
accepted lineage. `AF-25(tapped_release)` must verify that chain. The final
result vector may then contain only the delta-affected same-basis gate results,
because the unaffected accepted-RC qualification is explicitly conserved rather
than inferred. This extends the existing `ExactCandidateQualification<K>` basis;
it adds no entity or function family.

### 2. P1 - The exact method/rule/source basis is asserted but not carried

The qualification basis carries source, artifact, install, binding, manifest,
and frozen-inventory truth. `AF-22` accepts a separate `lawBasis`, and T-247 says
a changed rule creates a new basis, but the Ontology does not place the exact
method/rule/source basis ref and digest in `ExactCandidateQualification<basis>`,
the result vector, or the verdict.

Evidence:

- `REQ-P-SELF-CONFORMANCE-001` requires one exact subject identity and one exact
  rule basis identifying method version, rule-catalog version, source refs, and
  content digests.
- `REQ-P-SELF-CONFORMANCE-010` and `REQ-P-QUAL-060` require the release-grade
  result to bind that exact method/rule/source basis.
- `T-247:72-76` says a changed rule creates a new qualification basis.
- Ontology `:155`, `:215`, `:680-688`, and lifecycle row `:1156` omit that basis,
  while `AF-22` receives `lawBasis` separately at `:1227`.

As written, the same qualification basis can receive verdicts under two rule
bases without the basis identity changing, contrary to T-247's own change law.
Assessment digests are evidence, but they do not replace a named qualification
law-basis authority.

Bounded repair: add an exact qualification law-basis ref/digest covering method,
rule catalog, and exact source basis to `ExactCandidateQualification<basis>`;
require the result vector and the `AF-22` argument to match it; carry it on the
verdict; and state that any changed law basis creates a new qualification basis.
This is another field-level completion of the existing contract family and does
not change 27/7/19.

### 3. P2 - The candidate verdict names the prior ontology version

The header identifies `/8-candidate`, while `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md:1689`
still calls the current repair `/7-candidate`. Correct the version reference when
the bounded authority fields are added. This is non-blocking by itself.

## Accepted Parts

1. **The algebra repair is lawful.** `QualificationGateResultVector<K>` is one
   typed input carrier to one `C.of(AF-22)` leaf with result cardinality one.
   `C.of` permits an arbitrary declared input/output relation. No heterogeneous
   gate family is forced through `C.batch`, and no undeclared fold remains.
2. **Owning proof authority is conserved.** The vector carries an exact basis,
   frozen inventory, stable ordinal, unique gate identity, owning assessment and
   evidence refs/digests, typed disposition, bypass refs, and its own derived
   digest. Structural admission checks completeness, identity, type, and
   consistency but cannot rerun or reinterpret an owning gate.
3. **There is no hidden qualification controller.** Owning gates run under their
   existing contracts. The qualification boundary consumes already-admitted
   results. It adds no batch-to-vector bridge, HOF dispatcher, scheduler,
   selector, filesystem scan, or second semantic checker.
4. **The release lifecycle remains acyclic.** A pre-RC basis and verdict precede
   `AF-25(published_rc)`. The prospective final basis, permitted `FinalTapDelta`,
   and delta-affected gates precede `AF-25(tapped_release)` and `AF-26`. Snapshot
   output cannot qualify its own creation.
5. **Prime and proportionality hold.** The result vector has no independent
   semantic authority, effect, scheduler, or public identity and is consumed
   once by its owning evaluator. It is a subordinate typed input, not another
   Prime entity. This is proportional to a trusted developer desktop and defends
   malformed or inconsistent qualification input without unrelated hardening.
6. **Workspace-binding cardinality remains coherent.** Each closed operation
   variant fixes binding presence to `forbidden` or `exactly_one`; aggregate
   `0..1` does not create a freely optional field.

## Mechanical Evidence

| Check | Result |
|---|---:|
| supplied frozen subject hashes | 6/6 exact |
| exact Ontology source basis | 30/30 |
| atomic families / authority rows | 27/27 unique and identical sets |
| higher-order product compositions | 7 |
| public operation identities | 19/19 unique |
| retained feature rows | 17/17 unique |
| capability identities | 16/16 unique |
| Ontology Mermaid blocks | 9 |
| registered design Mermaid gate | pass |
| GFM/Pandoc parse | 6/6 subject files pass |
| DS governance regression | 19 tickets and 73 refs, pass |
| existing Prime regression | pass; it does not inspect T-278 and is not used as target evidence |
| `git diff --check` | pass |

Commands included exact `sha256sum`, a separately authored Node census over
the Ontology basis and matrices, `npm run check:design-mermaid`,
`npm run check:ds-governance`, `npm run check:prime-contraction`, six GFM/Pandoc
parses, focused authority searches, and `git diff --check`. Runtime tests were
not run because the exact subject is a frozen design, release-ticket, goal, and
plan change while provisional runtime work remains fenced.

## Disposition

Do not record F_H acceptance of `/8-candidate`. Add the two missing authority
bindings, correct the stale version reference, freeze new hashes, and run one
focused independent authority review. The direct result-vector algebra is
accepted and should not be redesigned. The repair does not reopen One Surface,
workspace binding, the release cycle, FinalTapDelta, or the 27/7/19 target.
