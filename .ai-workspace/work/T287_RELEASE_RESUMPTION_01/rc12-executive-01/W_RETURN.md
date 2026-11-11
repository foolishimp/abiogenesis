# RC12 package W Return: amendment witness

Writer: Claude Opus 5.5. Worktree `/private/tmp/abg-rc12-witness-20261111`,
branch `claude/rc12-witness`, base `62fd17271`. Test-side only; no product,
specification, design or contract file changed. No provider call, no network,
no push. The two build-regenerated files stay uncommitted.

## Files (T = `build_tenants/abiogenesis/typescript`, bytes)

- `T/test_env/fixtures/amendment-witness/process-definition.json` 11259:
  stages (intake-triage/induction, impact-assessment/design, construction,
  testing, uat), test plan, limits, acceptance, two reviews with structured
  frames and applicability, declared prerequisites.
- `amendment-approval-threshold.json` 591, `amendment-discount-items.json` 487.
- `seed/` 13 files, 7 KB: order desk with approval threshold 5,000 and a
  10-item 5% discount; trace table in `specification/PRODUCT.md`; three
  rubrics; the assessment result schema.
- `stand-in/` 7 files, 4 KB: the scripted worker outputs, including the
  damaged `order-damaged.mjs` (discount dropped).
- `T/test_env/support/amendment-witness.mjs` 16718: `amendmentWitnessInput`,
  parsers, frames, rubric reader `assessUnderRubric`, `summarizeActorCalls`.
- `T/test_env/support/amendment-witness-actor.mjs` 8662: model-free actor for
  selector, worker, C2 and assessor. `tests/t287-amendment-witness.test.mjs`
  38531: six cases. `uat/amendment-witness-bare-cli.mjs` 5948: not run.

## Sequence run (one installed Public start, scripted actor)

Choices in order: induction, design, review impact, construction, testing,
review preservation, construction, testing, review preservation, uat; then
the parent closes. Twenty actor calls, four on the one native assessor.
Verdicts: impact satisfied (I1-I5); preservation unmet P1, P2 on the damaged
`src/order.mjs` (the first Testing result was green); correction acts
on exactly P1, P2 and restores `src/order.mjs` to seed bytes; preservation
satisfied; UAT satisfied (A1-A3) over the latest Testing result.

Assertions: disposition `completed`, one `run_closed`, no runtime failure;
only the last parent evaluation is terminal; no parent is terminal while a
required review is adverse, missing or stale; impact standing stays satisfied
and current through the correction; preservation is seen adverse-current and
adverse-stale; discount requirement, module and test byte-identical to the
seed; every protected source keeps its digest; every changed path lies in the
write roots (changed: intake triage, impact assessment, `src/approval.mjs`,
`test/approval.test.mjs`); the final tests pass in the Run and on rerun; each
assessor saw the declared frame and a rubric matching its declared digest;
every review or UAT invocation differs from its producer's; every call has an
actor invocation, an actor ref and the reported model.

Other cases: seed tests pass on the seed and the amended boundary tests fail
until `src/approval.mjs` changes; the input is deterministic and leaves the
definition bytes unchanged; the discount amendment yields a valid input with
no definition edit; a wording-only amendment declares preservation not
applicable; the same candidate `src/order.mjs` is satisfied under the
preservation rubric and unmet I1-I5 under the impact rubric; a frame/rubric
mismatch is indeterminate. The live case skips unless
`ABI5_AMENDMENT_WITNESS_LIVE=1`.

## Product-limit findings (not worked around in product code)

1. `original` is strict: prerequisites, applicability and the trace cannot
   enter it. Prerequisites are rendered as instruction lines; applicability
   is applied when the input is built; `required` is fixed at input.
2. Prerequisite order is not enforced. The scripted selector follows it; a
   live selector may not, and the runtime would admit that order.
3. A review subject is one candidate file. Preservation therefore assesses
   the shared `src/order.mjs`, not the whole preserved set.
4. The result contract has satisfied, unmet, indeterminate only: no
   out_of_frame, invalid_basis or not-applicable value.
5. STDO sources enter only as URI text in the frame; `assessment.sources`
   are worksite paths. The assessor cannot read admitted STDO authority.
6. Lawful order is narrower than the owner sequence suggests: impact must run
   directly after design (its subject must be current), and preservation's
   subject must be the latest construction.
7. Scope violations are observed only within read roots.
8. `readFirst` paths must exist when the task is built, so stage outputs that
   do not exist yet are named in instructions instead.
9. Independence is mechanical only: one model family serves every role, which
   EVALUATION section 3 does not count as independent.
10. Zero human interventions holds by construction: 5.0 has no
    human-response path.
11. The runtime creates its archive (`.ai-workspace/archive/`) inside the
    worksite during the Run. The whole-tree check excludes exactly the
    `archiveRoot` that every transport binding declares.

## Evidence (in T, `TMPDIR=/private/tmp/abg-witness-tmp`)

- E1 `npm run build`: exit 0.
- E2 and E3 `node --experimental-vm-modules --test --test-concurrency=1
  test_env/tests/t287-amendment-witness.test.mjs`: `tests 6, pass 5,
  fail 0, skipped 1` (live), 117 s. Commit `12f86d05e`.
- E4 `node --experimental-vm-modules --test --test-concurrency=1
  test_env/tests/t287-default-library-reviews.test.mjs`: E4_RESULT

## What a later package must add

- Runtime enforcement of declared prerequisites and of review applicability.
- Multi-file review subjects, and out_of_frame, invalid_basis and
  not-applicable result values.
- Admitted STDO authority as an assessment source.
- Scope-violation observation outside read roots.
- An assessor from a different model family for review and UAT.
- The live run (owner-authorized provider calls) and the bare-CLI comparison.

## Residual risks

- The stand-in actor parses prompt labels (`Worksite root:`, `Permitted write
  scope:`, `Actual admitted observations:`, `Exact assessment basis:`,
  `Declared review:`). A label rename breaks the scripted case. No prompt
  bytes or library digests are pinned.
- The stand-in assessor is a deterministic rubric reader; a live assessor
  may return other verdicts for the same subject.
- The live case and the bare-CLI script have never run (bare CLI: dry run
  with `/usr/bin/true` only). Cost and token fields assume a Claude Code
  style stream-json `result` row. The scripted Run takes 120-150 s here.
