# Strategy: Prime Assurance, Depth Policy, And Strength Admission

**Status**: strategy commentary, not ratified specification
**Date**: 2026-07-03
**Author**: Codex
**Project**: Abiogenesis
**Responds to**:
`20260703T083818Z_STRATEGY_recursive_llms_recursive_gtl_disambiguation_graphs.md`,
`20260703T132216Z_STRATEGY_recursive_obligation_state_machine.md`, and T-188

## Claim

T-188 and the recursive obligation state machine are enough to enforce coverage
over declared obligations. They are not, by themselves, enough to guarantee
depth.

The missing prime assurance signal is:

```text
declared depth completeness
```

That is a different signal from proof coverage.

Proof coverage asks:

```text
Did admitted evidence cover the declared obligations?
```

Depth-policy completeness asks:

```text
Was the declared obligation set deep enough to be closure-worthy?
```

This is prime because it is not reducible to coverage, residual, prompt
relevance, dependency closure, or worker evaluation. It is a precondition on
the proof policy itself.

## Combined Feedback

The recursive obligation state machine gives ABG the missing enforcement
property:

```text
Given admitted obligation state,
do not close shallowly.
Close, P0-discharge, recurse, tail-retry, re-enter, residualize, or block.
```

That solves the enforcement failure where generated code, tests, summaries, or
worker self-report could close without replay-derived proof coverage.

The remaining depth gap has two sources:

1. the obligation set can be too thin;
2. the strength verdict can be too lenient.

If the proof policy omits negative, boundary, regression, invariant, dependency,
or semantic adequacy obligations, then T(S) can close correctly over a shallow
obligation set. If the evidence-strength verdict is lenient or self-graded, then
T(S) can close correctly over weak proof.

So the full guarantee is:

```text
depth guarantee =
  depth-obligation policy completeness
  + obligation/proof coverage enforcement
  + adversarial or F_D-checkable strength admission
  + assurance fold closure
```

## Prime Signal

The prime signal is a subordinate proof-policy projection:

```text
DepthObligationPolicy
```

or, more operationally:

```text
requiredDepthClassCoverage
```

It answers whether a target's proof policy has declared the required depth
obligation classes or emitted typed non-applicability, residual, or re-entry
rows.

Required classes depend on product policy, but for software lifecycle work the
default class set should include:

| Depth class | Purpose |
| --- | --- |
| positive behavior | prove the intended path works |
| negative / rejection behavior | prove invalid or forbidden cases fail |
| boundary / error behavior | prove edge cases and failure modes are handled |
| regression behavior | prove existing guarantees were not broken |
| invariant / algebraic law | prove structural laws still hold |
| integration / dependency behavior | prove declared dependencies compose |
| semantic adequacy | prove the result satisfies the intended meaning |

If a class does not apply, omission is not enough. The policy must carry a typed
non-applicability or residual explanation:

```text
depth_class_not_applicable {
  classRef
  targetRef
  reasonRef
  evidenceRefs
  admittingPolicyRef
}
```

## Functional Enforcement

The enforcement chain becomes:

```text
1. Depth policy completeness gate
   -> Are all required depth classes declared or lawfully non-applicable?

2. Obligation coverage gate
   -> Are all declared obligations covered by admitted realization/proof witnesses?

3. Strength admission gate
   -> Is proof strength admitted by F_D or adversarial verification?

4. Assurance closure gate
   -> Can this edge, run, or slice close?
```

The state machine shall not treat a covered obligation set as closure-worthy
until the proof policy itself is depth-complete.

In transition-function terms:

```text
if proofPolicy.depthCompleteness != complete:
  residualize | re-enter | block
```

depending on whether the missing class can be supplied locally, requires an
upstream policy/re-entry change, or has no lawful owner.

## Strength Admission

`proofStrengthRefs` must not mean "the worker said it is strong enough."

Strength is closure-bearing truth. It should be admitted through one of two
routes:

```text
F_D-checkable strength criterion
```

or:

```text
adversarial verification result
```

An F_D-checkable strength criterion is a total function over admitted evidence,
declared proof policy, expected evidence shape, and coverage rows.

An adversarial verification result is admitted evidence that attempts to refute
the strength claim. The claim becomes sufficient only when the required
refutation attempts produce no blocking counterexample.

The admissible shape is:

```text
ProofStrengthAdmission {
  strengthRef
  sourceRequirementObligationRefs
  proofObligationRefs
  proofPolicyRefs
  expectedEvidenceShapeRefs
  depthClassRefs
  verifierRefs
  adversarialAttemptRefs
  counterexampleRefs
  disposition: sufficient | insufficient | residual | reentry | blocked
  replayIdentity
}
```

The important rule:

```text
F_P may propose a strength judgment.
ABG admits strength only through F_D criteria or adversarial verification.
```

## T-188 Consequence

T-188 currently gives the coverage enforcement machine:

- source requirement obligation refs;
- proof obligation refs;
- proof policy refs;
- expected positive/negative evidence shape refs;
- proof strength refs;
- plugin output admission;
- dependency sufficiency;
- replay-visible instruction truth;
- proof coverage and assurance foldback.

The prime assurance addition is not a new subsystem. It is a tightening of proof
policy and strength admission:

```text
ProofPolicy
  -> DepthObligationPolicy
      -> required depth classes
      -> typed not-applicable rows
      -> required adversarial checks

ProofStrengthRefs
  -> admitted strength criteria or adversarial verification
```

Then the T-188 machine can enforce depth, because the thing it enforces is no
longer a thin obligation set.

## Failure Modes Prevented

Without prime assurance:

```text
proof policy declares only happy-path test
  -> happy-path test passes
  -> coverage complete
  -> assurance closes
```

The machine is behaving correctly, but the policy is shallow.

With prime assurance:

```text
proof policy lacks required negative/boundary/regression classes
  -> depth_policy_incomplete
  -> no closure
  -> residualize, re-enter, or block
```

Without strength admission:

```text
worker judges weak proof as sufficient
  -> proofStrengthRef accepted as label
  -> closure over weak evidence
```

With strength admission:

```text
worker proposes strength
  -> F_D/adversarial admission checks strength
  -> weak proof becomes residual/re-entry/block
```

## Suggested Issue Kinds

If this becomes ratified implementation work, the useful issue names are:

```text
depth_policy_incomplete
missing_depth_obligation_class
depth_class_not_applicable_unjustified
proof_strength_not_admitted
proof_strength_not_adversarially_verified
adversarial_counterexample_found
```

These names should remain subordinate to the proof policy, proof coverage, and
assurance fold surfaces. They should not create a separate depth ledger or peer
closure truth surface.

## One-Line Rule

```text
Coverage proves declared obligations; prime assurance proves the declared
obligation set is deep enough and the strength verdict is admissible. Closure
requires both.
```

## Non-Goal

This post does not add new law by itself.

It records the combined review conclusion: T-188 enforces coverage over admitted
obligations, while an end-to-end depth guarantee requires proof-policy depth
classes and adversarial or F_D-checkable strength admission.
