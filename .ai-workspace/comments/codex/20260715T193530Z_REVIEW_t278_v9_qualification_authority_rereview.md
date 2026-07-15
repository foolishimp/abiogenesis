# Review - T-278 `/9` Qualification Authority Re-Review

**Date**: 2026-07-15 19:35:30Z

**Reviewer task identity**: `/root/t278_second_release_algebra_rereview`

**Review class**: focused independent qualification-law and final-tap authority review

**Independence basis**: this reviewer did not author or edit the Ontology,
GOALS, T-278, T-247, T-248, plan, runtime, contract, or test surfaces. The six
supplied subject hashes were verified before review and again before this post.
This reviewer-authored post is the reviewer's only workspace edit.

**Verdict**: accept the exact `/9-candidate` for explicit F_H target-shape
disposition. Both prior qualification-authority omissions are closed. No new
controller, semantic atom, higher-order composition, capability, or public
operation has been introduced.

## Frozen Subject

| Surface | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | `72595fa1c1a4243e5590bc66864f9339075ef6175f7c9c58f2f5bb277028a18c` |
| `specification/GOALS.md` | `ec8179b84529264f05f5603f08951649b6c7c5b4fc6b45920e724d5a6c8648b2` |
| `.ai-workspace/tickets/active/T-278-derive-public-control-plane-ontology-and-reprice-operation-surface.md` | `0cde2c137323357de3c9557ed78b1e3ce535db14ea0214c2b8213027b7200e8f` |
| `.ai-workspace/tickets/backlog/T-247-own-self-conformance-and-qualification-claims.md` | `1d3900f82cbb9bd6d06c1d73c4a4653bfd9a93e5abfab465b5e9b4b78f5607bf` |
| `.ai-workspace/tickets/backlog/T-248-qualify-and-release-the-5-0-artifact.md` | `ff62360f2bc24d19337d92588aa08180d4c025e345c23df781973874850354b1` |
| `.ai-workspace/comments/codex/20260715T150050Z_PLAN_abiogenesis_5_0_repriced_end_to_end.md` | `19bfb4637da1ea722ef1b5eadab6b2573c812ab199fa9181b8d0430c1f4e2221` |

## Findings

No blocking or residual target-shape finding remains in the two reviewed
authority paths.

### 1. Qualification law basis is conserved end to end

`QualificationLawBasis` now closes the exact specification-method version,
applicable rule-catalog version, source refs, and content digests used to decide
one qualification run. It is subordinate to and content-addresses one
`ExactCandidateQualification<basis>`; it has no evaluator, registry, lifecycle,
capability, or public identity of its own.

The same law-basis ref and digest are required on:

1. the exact candidate basis;
2. `QualificationGateResultVector<K>`;
3. the `AF-22` argument admitted for that basis; and
4. the resulting `ExactCandidateQualification<verdict>`.

Vector admission checks exact subject- and law-basis equality without
reinterpreting owning gate semantics. `C.of(AF-22
evaluateConformance(exact_candidate_qualification, ...))` remains the single
total typed reducer and emits exactly one same-subject-and-law-basis verdict.
Changing the method version, rule catalog, source ref, or content digest creates
a new qualification basis; no old basis or verdict may be relabeled or reused.

This closes the prior gap where `lawBasis` was a separate evaluator argument
that did not participate in the qualification identity.

### 2. Installed-RC green authority is conserved into final materialization

The `final_tap_candidate` basis now binds all of the authority needed to derive
the prospective final candidate:

- the accepted-RC ref and digest;
- the exact installed-RC qualification-basis ref and digest;
- that basis's same-basis green, non-bypassed verdict ref and digest; and
- the verified `FinalTapDelta` digest.

The installed-RC basis must identify the exact accepted RC bytes and installed
identity named by the lineage. The prospective-final basis separately binds its
own exact bytes and qualification-law basis, and all delta-affected gates rerun
before publication. `AF-25(tapped_release)` verifies the accepted-RC lineage,
installed-RC basis/verdict chain, final basis/verdict, permitted delta, and
affected pre-publication gates. It refuses missing, stale, red, blocked,
bypassed, cross-RC, cross-install, or mismatched-law-basis evidence.

The release sequence therefore remains acyclic: installed-RC qualification is
immutable authorization evidence for constructing a new prospective-final
basis; it is not inferred from the earlier RC cut or snapshot, and no snapshot
qualifies its own creation.

### 3. The repair does not expand the product algebra

The two repairs add exact fields and equality laws to the existing qualification
contract family. They do not add a scheduler, filesystem scan, qualification-
local controller, `C.batch`, HOF relation, second evaluator, public vector
identity, capability, or operation. Owning gates still execute under their own
contracts and retain semantic authority.

The reproduced target remains:

| Census | Result |
|---|---:|
| exact Ontology source basis | 30/30 |
| atomic families | 27/27 unique |
| higher-order product compositions | 7/7 unique |
| public operation identities | 19/19 unique |
| retained feature rows | 17/17 unique |
| capability identities | 16/16 unique |

Repository search found no `QualificationLawBasis` or
`QualificationGateResultVector` implementation in runtime code, generated
contracts, or tests. Runtime remains correctly fenced behind target acceptance.

## Required Realization Proofs

These are implementation closure obligations, not target-shape blockers:

- method-version, rule-catalog, source-ref, and source-digest mismatch refusals;
- vector-to-basis and `AF-22`-argument law-basis mismatch refusals;
- verdict-to-basis law-basis mismatch refusal;
- installed-RC basis/verdict mismatch and non-green/bypassed refusals;
- same version but different RC bytes refusal;
- different installed identity refusal; and
- stale or cross-RC installed qualification refusal.

The negative matrix must prove typed refusal before `AF-25` materializes any cut
or snapshot.

## Mechanical Evidence

- all six frozen-subject hashes matched twice;
- all 30 Ontology exact-basis digests resolved and matched;
- the 27/7/19, 17-feature, and 16-capability censuses were independently
  reproduced with unique identities;
- the registered Mermaid gate passed with renderer `11.3.0`, 30 files, and 90
  diagrams; the Ontology contains nine registered diagrams;
- Pandoc/GFM parsing passed for all six subject files;
- DS governance passed for 19 tickets and 73 comment references;
- the existing Prime regression passed for seven accepted designs, with the
  explicit caveat that it does not itself validate T-278's census; and
- `git diff --check` passed before this post.

Runtime tests were not run. This is a focused frozen-design and authority-path
review, and the candidate explicitly prohibits runtime propagation before F_H
acceptance.

## Disposition

The two bounded repairs requested by the `/8-candidate` authority review are
complete. Record this review as independent evidence for the exact frozen
`/9-candidate`, then take the four linked target claims to explicit F_H
disposition. This review does not itself ratify the Ontology or authorize
runtime work. If F_H accepts it, constitutional propagation and implementation
must preserve the exact one-family, one-subordinate-vector, one-`AF-22`-reducer,
installed-RC-authorizes-final relation reviewed here.
