# T-210 Earned-Depth Derivation And Adversarial Admission

- id: T-210
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: abg/m03 carry-through producer + requirements route family (deriveAdmittedStrengthRefSet ledger-resolution pattern; coverage projector gates)
- status: active
- goal: hog-iteration-2-depth
- change_intent: >-
    Realize REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-032/-033/-034/-035/-036
    as kernel machinery: depth completeness DERIVED by ABG from an admitted
    depth-map asset plus executed-report identities, mutation-kill outcomes
    admitted as adversarial evidence, and kill obligations DERIVED from the
    admitted map (topology discovery) — replacing plan-declared
    depthComplete authority.
- change_class: design_reframe
- re_entry_point: design_surface (abg/m03 design + realization)
- intake_source: odd_glc T-032 triage outcome 3a (user depth review of the
  T-031 closure run, 2026-07-08; ratified designs 2026-07-08/09)
- triaged_at: 2026-07-09
- created_at: 2026-07-09
- updated_at: 2026-07-09
- execution_state: break 1 DONE (admitted depth-map carrier + canonical
  event-admission row closure after review HIGH 2026-07-09); break 2 DONE
  (earned-depth derivation, plan-declared authority severed for
  map-bearing targets, mixed-authority law entry-wide); break 3 DONE
  (kill obligations derived from admitted adversarial-class rows via
  contract-declared adversarialDepthClassRefs; unproven obligations gap
  typed through the existing depth gate); break 4 DONE (adversarial refs
  ledger-resolved in the producer — attempts resolve against the admitted
  ledger, admitted mutation-kill evidence is verification, admitted
  survived-mutant evidence is a counterexample and BLOCKS through the
  existing gate; review HIGHs 2026-07-09 closed: event row admission
  carries the ingress well-formedness predicate, and kill/survived
  evidence is requirement-scoped so evidence proves only the obligation
  it names); break 5 NEXT (projections/read models repriced + proof
  last, then rc cut with artifact verification + odd_glc repin)
- dependencies: T-205 (closed; handler law + carry-through family), odd_glc T-032 (consumer)
- links: odd_glc .ai-workspace/tickets/active/T-032-earned-depth-mutation-kill-proof.md

## Intake Triage (the entry)

1. SUBSTANTIVE? Yes: closure-bearing depth truth changes its source of
   authority.
2. AFFECTED BOUNDARY: abg/m03 — carry-through producer, requirements
   route/algebra depth gates, payload/evidence ledger resolution,
   instruction-assembly proof-depth truth authority.
3. UPWARD-PROPAGATION WALK: live requirements EXIST and are explicit —
   `-034` "ABG shall derive depth-policy completeness"; `-033`
   DepthObligationPolicy is an admitted projection, never a product
   checklist; `-035/-036` adversarial verification as admitted evidence,
   F_D-checkable or adversarially verified strength. No design decision
   realizes derivation-from-delivered-evidence: today
   proofDepthInstructionTruth is compiled-plan startup data and
   depthComplete is satisfiable by declaration equality (proven hollow by
   the T-031 closure-run depth review). Requirement present, design
   absent => first missing layer = DESIGN => change_class design_reframe.
   No requirement reprice needed for the mechanism; the
   topology-discovery law's constitutional home is a separate repricing
   item owned by odd_glc T-032 required_work (3c).
4. EXECUTION DISCIPLINE: implementation_migration — an existing
   authoritative truth path is being demoted, so the migration
   declaration below is ticket law, not commentary.
5. RELEASE SCOPE: lands in the next rc cut after realization with
   artifact-content verification (release-state law); odd_glc repins
   before the T-032 campaign resumes.

## Migration Declaration

- old_truth_path: plan-declared depth authority — compiled-plan
  proofDepthInstructionTruth with declaredDepthClassRefs ==
  requiredDepthClassRefs making depthComplete true by construction;
  envelope depth/adversarial refs template-static.
- new_truth_path: ABG-derived earned depth — admitted depth-map carrier
  (worker-declared test -> depth class -> requirement) + executed-report
  identities (mechanical string presence) derive declaredDepthClassRefs /
  typedDepthGapRefs / depthComplete per requirement at the closure-bearing
  target; adversarialAttemptRefs / counterexampleRefs ledger-resolved from
  admitted mutation-kill evidence; kill obligations DERIVED from the
  admitted map (one per negative/invariant row — cardinality discovered,
  never declared).
- producers_old: downstream binding plan compilation (odd_glc)
- producers_new: depth-map admission + earned-depth derivation (abg/m03
  contracts), mutation evidence admission via existing payload ledger
- consumers: carry-through producer envelope/coverage projection, depth
  gates in projectRequirementProofCoverage, requirement folds, -012 audit
  read models, odd_glc canary (read-only)
- derived_surfaces: coverage projections, fold sources, run summaries
- closure_law: plan-declared depthComplete no longer closure-bearing for
  targets with an admitted depth map; absence of a required map row is a
  typed gap, not silence; mixed old/new depth authority is non-closure.

## Migration Checklist

- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] ticket declares library usage and names the governing library or rationale
- [ ] single build tenant lifecycle (typescript) — no sibling tenant duplicate required
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Required Break Order (inside-out)

1. Publish the admitted depth-map carrier (source truth first): shape,
   admission, ledger projection, replay identity.
2. Sever plan-declared depth authority for map-bearing targets: the
   coverage projector consumes DERIVED depth truth; declaration equality
   rejected as closure evidence (negative proof: a hollow declared-equal
   plan with an admitted map missing rows folds residual, never
   satisfied).
3. Derive kill obligations from the admitted map (the Gödel projection);
   absence of kill evidence for a derived obligation is a typed gap.
4. Ledger-resolve adversarial refs in the producer (extend the
   deriveAdmittedStrengthRefSet pattern); survived mutants =>
   counterexampleRefs => existing adversarial_counterexample_found gate.
5. Reprice projections/read models and differentials; only then proof.

## Impacted Interface Review Checklist

- [ ] requirement_proof_carry_through producer consumes derived depth
      truth for map-bearing targets and cannot silently fall back to
      template-static refs
- [ ] projectRequirementProofCoverage's depth issues derive from the
      admitted map, not caller-supplied booleans (-033 law holds)
- [ ] instruction-assembly proofDepthInstructionTruth remains lawful
      startup PLAN data but is demoted from closure authority where a map
      is admitted
- [ ] payload ledger resolves adversarial evidence refs with digest
      identity
- [ ] odd_glc consumes via declarations + read models only (kernel law)
- [ ] negative proofs: hollow declaration fails closed; survived mutant
      blocks; missing map row is a typed gap; restore-digest mismatch
      rejects kill evidence

## Boundary Discipline

Execution stays typed F_P by default (the worker runs suites/mutants and
returns typed results; execution-default law) — this ticket builds NO
kernel execution machinery. Kernel scope: admission, derivation,
obligation projection, gates. F_D never reads test source; it consumes
the admitted map, report identities, and suite exit truth. Semantic
adequacy of the map is F_P evaluator judgment under calibration.
