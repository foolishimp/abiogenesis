# T-272 Governed Basis And Replay Closure Candidate

## Disposition

Candidate frozen for exact review. Keep the implementation. Do not accept M05
Section 12 or begin the next S03 slice until review binds this exact candidate.

## Exact Subject

- candidate commit:
  `bc2fb63949dfba5524ccaa3a194b0921f74b0fe9`
- parent:
  `950ccb2caf414113d83c4c6a2afe78d2a83f81fa`
- candidate tree:
  `116c8b43ccdfc810f98c343912b615a0877d2397`
- changed subject: 18 tracked files, `+1987/-414`
- M05 design SHA-256:
  `96724255739b8b3c9e2e472b3b17f8680898e8cd9eddfad1a836ddcd6d3ac4d4`

The seven pre-existing untracked review posts are outside the subject and
remain untouched.

## Repaired Boundary

The external developer Product now supplies and consumes one explicit semantic
chain:

```text
ObservationSnapshot
  -> modeled ObservationSnapshot
  -> NextActionBasis
  -> selected NextActionProjection
  -> admitted ConstructionIntent
  -> F_H hold/read/respond/continue
  -> ABG-derived ActionEvaluationBasis
  -> Product ActionEvaluationProjection
  -> admitted ledger + closure candidate + construction delta
  -> refreshed ObservationSnapshot
  -> converged NextActionBasis
  -> converged NextActionProjection
  -> ordinary terminal closure
```

Product owns the semantic values and projections. ABG admits the workspace,
action-catalog, intent, complete evidence, closure-policy, causal-event, delta,
and closure relations. HoG traverses the declared GTL. Public supplies no
selection, ledger, decision, or terminal truth.

An intent-bearing Run and Frame cannot close from a human response,
`evaluateAction`, or a stage-role string. Replay must contain the matching
construction delta, a later converged basis, and the final converged
projection.

## Installed Falsification

The separately packed mini-product proves:

1. terminal immediately after `evaluateAction` refuses;
2. a complete converged path still closes after its terminal stage role is
   renamed;
3. terminal directly from F_H resume refuses;
4. the old scalar approval input cannot substitute for
   `ActionEvaluationBasis`; and
5. a canonical ledger and decision that omit the admitted evidence refuse.

No compiler, lowering carrier, Public controller, second runtime, new event
family, Product reprice, requirement reprice, or ticket expansion entered the
cut.

## Verification

| Gate | Result |
|---|---|
| `npm run test:m5` | `81/81` |
| `npm run test:m4` | `26/26` |
| external developer Product | `10/10` |
| package reproduction | two byte-identical packs |
| package SHA-256 | `bd639bc2b203ebb7baf92b2f04a0506c7dfd01ac06b93bbef493a3bbde242da2` |
| Product content digest | `sha256:2f550a698e20c16ce3c7c4011cab4121e4541ded339d5bd208bad910f652c3e2` |
| manifest digest | `sha256:145970e141aea03921ba8c06c3d3b66357d362c055ac36f89cea2a0f07e6dc1f` |
| `git diff --check` | pass |

The committed live F_P proof remains retained and was not rerun because the
live command was not selected for this bounded repair.

## Review Contract

Review the exact candidate commit and M05 digest above. Falsify:

- whether either evaluator can omit its admitted semantic basis;
- whether closure can occur without the exact intent, delta, refreshed basis,
  and converged projection in one Run and Frame;
- whether stage-role text carries hidden terminal authority;
- whether ordinary non-construction F_H continuation regressed; and
- whether any installed mutation can create closure after its refusal point.

Review acceptance promotes only the affected Section 12 boundary. S03 remains
open for the next consumer-visible `gap_stop -> public re-entry ->
convergence` path and retained consequence/runtime/public-control behavior.
