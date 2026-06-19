# abiogenesis 4.1.0-rc.2 Release Candidate Note

This checkpoint is the second TypeScript ABG `4.1.0` release candidate. It
follows `4.1.0-rc.1` with the T-159 traversal bind-boundary hardening needed by
the ABI-owned frozen `odd_sdlc` T-132 hello-world proof lane.

It is an RC candidate, not the final tapped `4.1.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC2 keeps
the `4.1.0-rc.1` traversal-unit and consequence-boundary surface, then closes
the observed gap where an SDLC edge could report semantic success while the
next-edge target carrier was not admitted as a closed typed carrier.

RC2 adds:

- fail-fast postflight blocking for design-depth evaluator target-carrier
  pending or invalid states;
- fail-fast postflight blocking for component-depth register target-carrier
  admission failures;
- UAT/component test prompt authority requiring `testClassId`, `relativePath`,
  `shardId`, `testcaseIds`, `componentIds`, and `requirementIds` in
  `componentTestRows`;
- prompt-surface pruning so transform and retry prompts start from the smallest
  governing authority packet instead of global SDLC reconstruction;
- row-level traversal bind-conservation validation for unique conservation refs,
  resolved graph/vector identity, and graph/vector ref coherence before
  projection;
- pressure-package lineage cleanup so `carriedObligationRefs` remains obligation
  identity and pressure identity stays in `pressureRefs`;
- frozen `odd_sdlc` review/evaluation hardening: scoped review prompts fail
  closed without admitted invocation scope, downstream-pressure acceptance no
  longer reports passed beside a blocked assessment artifact, product
  materialization launch blocking covers every required role, and GTL adapter
  wiring keys target carriers and composition rows by graph/vector or host
  identity instead of array position alone;
- an ABI-owned frozen `odd_sdlc` T-132 live fixture that exercises the current
  ABG source package against a downstream hello-world application before RC
  release;
- package version advancement to `4.1.0-rc.2` for downstream consumers that
  need the corrected bind-boundary and target-carrier admission behavior.

## Boundary

The governing execution framing remains:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(system.planTransformSet)
  .bind(plugin.transform.C.task[*])
  .bind(system.admitTransformTaskResult[*])
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.collectTransformSet)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

RC2 does not introduce a new GTL ontology object or move downstream product
meaning into ABG. The change is an ABG/GTL bind-boundary enforcement update:
stage pressure, materialization authority, and target-carrier admission must
agree before closure can advance.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.1.0-rc.2`
- Candidate package version: `4.1.0-rc.2`
- Candidate tag: `v4.1.0-rc.2`

## Verification

Current qualification evidence for this cut:

```text
ABI semantic build:
  npm run build:semantic
  passed

frozen odd_sdlc fixture semantic build:
  npm run build:semantic
  passed

ABI changed-path tests:
  node --test \
    test_env/tests/test_t127_fp_consciousness_loop_unit.test.mjs \
    test_env/tests/test_t139_construction_pressure_package.test.mjs \
    test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs
  passed, 118 tests, 0 failures

frozen odd_sdlc changed-path tests:
  node --test \
    test_t113_component_depth_register_admission.test.mjs \
    test_t143_product_materialization_authority_targets.test.mjs \
    test_t171_component_depth_target_carrier_envelope.test.mjs \
    test_t192_evaluation_grid_prompt_contract.test.mjs \
    test_t194_gtl_program_conformance.test.mjs
  passed, 73 tests, 0 failures

frozen odd_sdlc design-depth admission subset:
  node --test --test-name-pattern \
    'T-181 F_P evaluator register truth ...|T-203 component-code targets ...' \
    test_t181_fp_evaluator_design_register.test.mjs
  passed, 5 tests, 0 failures

frozen odd_sdlc review-scope/status subset:
  node --test --test-name-pattern \
    'T-182 review-grade prompt ...|T-203 scoped review-grade prompt ...|T-200 compact review-grade prompt ...' \
    test_t182_fp_review_grade_edge_fulfillment.test.mjs
  passed, 3 tests, 0 failures
```

The post-review live lane was started and then stopped after the changed launch
path had been exercised, per operator direction to avoid a full live run. Run
archive:
`build_tenants/abiogenesis/typescript/test_env/test_runs/t159_odd_sdlc_t132_frozen_live/20260619T023242421Z`.
It built the frozen fixture, bootstrapped the T-132 workspace, completed Stage 1
`derive_lite_design_adr_surface` worker execution in 1:23.100 with a 13,833
byte prompt, launched the design-depth F_P evaluator with a 26,192 byte prompt,
and was interrupted while postflight still reported the expected
`design_depth_fp_evaluator_pending` state. This archive is launch-path evidence,
not convergence evidence.

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

RC2 is the bind-boundary enforcement candidate. It treats a hello-world failure
as a product bug at the ABG/GTL boundary, not as downstream tolerance. The root
cause was under-bound target-carrier admission across deterministic and
probabilistic phases: review/evaluation could pass while the next-edge carrier
was not admitted strongly enough for traversal. Prompt overbreadth was a
secondary latency bug and has been pruned where it affected this proof lane.
