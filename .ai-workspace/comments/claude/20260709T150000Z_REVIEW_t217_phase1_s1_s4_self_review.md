# T-217 Phase 1 S1-S4 self-review (2026-07-09, commentary — not law)

Scope: the four delivered slices (`8945b04`..`f7591bc`) plus their two
absorbed hostile-review rounds, reviewed against WITNESS-001..-014 and
the cross-slice seams. Method: same lens codex used — probe for
coverage lies, identity forgery, order dependence, silent forks.

## Findings (severity-ranked)

**SR-1 HIGH (WITNESS-007 coverage gap): materialized outputs are
tamper-invisible to the taint law.** `latestAdmittedArtifactDigests`
folds only `actor_result_artifact_observed`. `output_materialization_
observed` (carriers.ts:1797) carries digest-bearing evidence surfaces
(`digest`, `materializedRef`, `assetRef`) the baseline ignores, so an
observation of a tampered materialized output classifies UNTRACKED —
and untracked never taints. Failure: kernel materializes an output at
digest D; the file is rewritten; the instrument measures X; the row is
untracked (admittedDigest null); hygieneClean stays true; citability
passes. FIX (small): extend the baseline fold to
`output_materialization_observed` digests; align the ref vocabulary
(materializedRef/assetRef vs artifactRef) explicitly.

**SR-2 HIGH (WITNESS-003 partial): policy/binding drift does not block
— it silently FORKS the basis.** basis.id is content-derived over
resolvedPolicy + runtimeIdentity (probe-confirmed), so resuming with a
changed policy bundle mints a NEW basisId: `hasBasisAdmittedEvent` is
false, the run enters the fresh-start path, the reprice guard (which
compares registry digests only) never fires, and two spines coexist in
one store with no reprice owed. The mixed-law probe T-215 row 3 was
born from is covered for DECLARATION digests only. FIX DIRECTION
(S5-class, needs adjudication): a basis-fork witness at startup — a
replay carrying basis_admitted rows with the same runId/workKey but a
different basisId requires an admitted covering reprice (policy/
binding change class) or fail-closes, mirroring the S1 guard shape.

**SR-3 MEDIUM (record honesty): the WITNESS-003 remainder drifted
through the ticket unowned.** The S1 record routed "binding, or policy
truth" to S2; the S2 record routed it to "S3+"; neither delivered it
(it is exactly SR-2). Corrected in the ticket this pass: the remainder
is OPEN, named, and gates Phase 1 exit.

**SR-4 LOW: duplicate reprices duplicate refs in the frozen-law
predicate.** The same digest-pair reprice admitted twice (idempotent
coverage, lawful) yields the same content-derived repriceRef twice in
`FrozenLawPredicate.repriceRefs`. Dedupe in the predicate. Trivial.

**SR-5 LOW (contract documentation): every S1-S4 predicate assumes
basis-scoped replay input.** `deriveFrozenLawPredicate`,
`deriveCitabilityPredicate` (last-terminal converged), and
`deriveHaltDiagnosis` (last-terminal halted) blend spines if handed a
multi-basis store. Routes scope via `runtimeEventsForBasis`; the pure
functions do not. Document the input contract on the module headers
(or grow optional basisId params later).

**SR-6 LOW (cleanup rider): helper duplication.** `codepointCompare`
now has four private copies (declaration_reprice, run_segments,
workspace_hygiene, halt_diagnosis) while `admission_hygiene.ts:46`
already exports it; `eventAdmissionOrdinalOf` has two. Same-seam
pressure the T-208 commonization rider exists for — fold into the
Phase 2 cleanup slice.

**SR-7 NOTE: WITNESS-012 (role-separation audit) is implicit.** The
drift guard + hygiene taint make out-of-band constructive acts visible
in principle; no differential asserts the requirement's claim
directly. A targeted test belongs with the Phase 1 exit gate.

**SR-8 NOTE: intake.haltDiagnosisRef is route-bound, not
admission-recomputable.** Stateless admission cannot re-derive a
replay fold; verifiers re-derive and compare (mint pattern, consistent
with mutation-outcome minting). One sentence added value in the module
header at most.

## What holds

Self-certified identities everywhere (reprice, segment, hygiene,
intake) with the F2 lesson applied from birth on every post-S1 kind;
fail-closed ordering proven against laundering (S1 b1-runner) and
against impossible windows (S2 e3); the governing set is replay-derived
latest-per-ref truth (S2 e1/e2); the copy-out rule and digest-pair
classification are admission law, not convention (S3 d1); the full
sense-to-intent loop runs on kernel law alone (S4 f5). Grammar binding
(WITNESS-009..-011, -013 tail) and closure-gating over the taint set
are Phase-2-bound by design and recorded as such.

## Recommended dispositions

- SR-1, SR-4: fix now (small, unambiguous, differential-pinnable).
- SR-2: S5 slice under this ticket after adjudication of the
  fork-witness shape.
- SR-3: done (ticket corrected this pass).
- SR-5, SR-8: module-header contract notes, ride the next touch.
- SR-6, SR-7: riders on the Phase 2 cleanup / Phase 1 exit gate.
