# T-263 Strict Raw Module Admission Self-Review

> **Evidence only; closure retracted.** The implementation remains reviewable,
> but its admission depended on the invalid T-252 F_H inference. See
> `20260713T041830Z_REVIEW_GATE_t252_t263_t264_authority_correction.md`.

**Date**: 2026-07-13
**Verdict**: `clean_after_proof_repairs`

## Scope Reviewed

- M01 and M02 exact serialized-shape profiles;
- recursive carrier admission and existing I-JSON composition;
- canonical serializers and packed M02 barrel;
- T-252 mutation/probe behavior;
- generated publication projection; and
- focused, standing-law, and full semantic tests.

## Findings And Repairs

1. The first focused proof did not exercise malformed/non-I-JSON values through
   the new composed text/object ingress. Added malformed syntax, comments,
   trailing comma, lone surrogate, accessor, and sparse-array refusals.
2. The first focused proof imported the text ingress from its implementation
   file but did not prove reachability through the existing M02 public barrel.
   Added exact barrel-identity proof.
3. Publication checks correctly rejected stale native inventory digests after
   the new exported admission function. Regenerated the existing three
   publication projections and re-ran the full suite.

No implementation blocker remains after these repairs.

The final T-252 recompile retains body digest
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`,
records path-bearing refusal for the unknown mutation, and emits manifest
digest
`sha256:f3c57a89eb7b1917a7d20c387bbb4ad34d3dffc9d2175d868be99e2df899e4e1`
with 20 active, exactly-owned families.

## Boundary Review

- One parser: `admitIJsonText` remains the sole duplicate-preserving JSON
  parser.
- One prime carrier: all successful paths return the existing immutable
  `Module`.
- One shape vocabulary per carrier family: internal profiles are consumed by
  admission and checked against maximal serializer output.
- No fabricated proof: parsed objects make no duplicate-property claim;
  duplicate text names are refused only before collapse.
- No semantic migration: optional defaults, known-field validation, identity,
  semantic duplicates, and M03 whole-program checks retain their owners.
- No effect expansion: source closure remains inside deterministic
  GTL/shared admission and construction.

## Proportionality

The implementation defends malformed serialized GTL on the trusted developer
desktop. It does not add a schema validator, hostile-process defense,
cryptographic integrity, post-admission comparison carrier, or one diagnostic
algebra per nested type.
