# T-170 Root Cause Review: Late-Stage Algebraic Violations

## Verdict

The reopened T-160/T-169 failures were not incidental red/green test drift.
They were late-stage algebraic violations that crossed authority boundaries
without a typed, admitted, replay-visible witness.

The framework is working only if these defects become obvious at design,
compiler/API, runtime-causality, proof, and release-publication boundaries.
The corrected rc16 closure therefore treats the root-cause categories below as
part of the proof surface, not as after-the-fact commentary.

## Root-Cause Taxonomy

| Category | Failed invariant | How it appeared | Why it escaped late | Required detector |
| --- | --- | --- | --- | --- |
| Design failure | One carrier role must not mean two incompatible algebraic things. | `TraversalSpan` served both vector-local edge coverage and recursive cross-frame identity. Empty lineage was legal for one role and illegal for the other. | The design did not discriminate vector-local span coverage from recursive lineage-bearing span identity. | DMM/IACS must force carrier-role disambiguation and fail closed when a recursive claim lacks traversal-derived lineage refs. |
| Compiler/API failure | Live proof code must compile against the same public API it claims to exercise. | The live `.mjs` harness read `evaluationInput.attachedResultArtifact` before `EnginePluginInput` declared that field. | JavaScript proof files bypassed TypeScript shape checking, so the impossible API access reached the live worker path. | Typed live helpers or runtime schema assertions must reject absent/unknown plugin input fields before F_P invocation. |
| Runtime algebra integration failure | A projected algebraic fact is not authority until a downstream ABG edge consumes it. | T-160 computed `continuationInput`, but no ABG continuation/routing edge consumed it. | Tests asserted the projection existed, not that it causally changed continuation. | Runtime proof must show emitted pressure facts alter admitted continuation transition truth. |
| Authority encoding failure | Authority cannot be encoded by free-string/ref substring semantics. | Executive re-entry classification keyed on refs containing strings like `reentry`. | The proof supplied classifying refs, so the classifier looked deterministic even though the authority was untyped. | Disposition must be a closed enum/ref resolved through admission, never substring-derived. |
| Proof-oracle failure | A proof must have one expected algebraic outcome and fail for incompatible outcomes. | T-169 live proof was loosened to accept several non-closed dispositions. | The assertion stopped distinguishing the property being proved from any acceptable non-closed result. | Live tests must use strict expected dispositions plus negative checks for wrong disposition classes. |
| Activation-boundary failure | A runtime feature is not complete if only a test-only request field activates it. | T-160 ran only when `request.executiveObserver` was supplied by the test. | The production `start -> iterate` path was not required to bind the observer. | Proof must show default activation from admitted runtime state, not only explicit test injection. |
| Release/provenance failure | A downstream substrate claim must name the exact released install that carries the corrected algebra. | Earlier closure claims depended on rc labels and local state before latest/install/provenance were aligned. | A checksummed package can still be the wrong package for the consumer if latest, manifest, and downstream pin disagree. | Release proof must include source commit, snapshot commit, tarball digest, latest pointer, install manifest digest, and downstream retarget commit. |

## Framework Lesson

The failure mode is always the same shape:

```text
semantic/algebraic truth appears at one surface
-> no typed/admitted/replay-visible witness carries it across the next boundary
-> a later test or release artifact treats the appearance as closure
```

The prevention rule is also the same shape:

```text
design discriminates carrier roles
compiler/API rejects impossible calls
runtime emits and consumes admitted facts
authority uses closed typed refs
proof has a strict oracle and negative cases
release pins the exact install consumed downstream
```

That is the purpose of the GTL/ABG/ODD framework for this class of failure: not
to make algebraic violations impossible on first authoring, but to force them
to surface at the earliest lawful boundary before downstream products build on
them.
