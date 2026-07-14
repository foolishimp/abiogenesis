# T-269 Open-Program Law Repair Self-Review

Date: 2026-07-14
Checkpoint: `1105c391`

## Review Basis

The independent review accepted the declaration/bind-stage direction but
rejected closure because `FN-COMP-015/-021` still imposed a fixed
transform/evaluate/consequence chain and the ticket lacked its declared proof.

## Findings Rechecked

1. `FN-COMP-015` now traverses the exact ordered stages of the admitted C
   program and forbids synthesizing categories or replacing authored stages
   with interpreter binds.
2. `FN-COMP-021` now applies one stage-set law to every authored stage. The
   transform, evaluate, and consequence categories are optional instances of
   that law, not a mandatory chain.
3. The positive proof constructs a C program through the native API,
   serializes it canonically, readmits the raw serialization, and recomputes
   the same content digest.
4. The negative proof varies an ambient-derived declaration input, observes
   divergent canonical digests, and verifies that a module export without one
   stable round-trip witness fails conformance.
5. The law guard proves that authored-stage membership cannot be satisfied by
   call-preparation, result-admission, evidence, or materialization bind rows.

## Scope Check

The repair changed constitutional wording and proof only. It did not modify a
runtime compiler, interpreter, resolver, traversal loop, or public API.

## Verification

- focused T-269: 3/3
- GTL law lane: 82/82
- full semantic lane: 1696/1696
- `git diff --check`: clean before checkpoint

Verdict: T-269 exit conditions are met. T-271 may proceed to design only after
the remaining census and governance blockers are repaired.
