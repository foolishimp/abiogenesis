---
id: T-170
title: Earn full odd_glc ABI substrate closure after DMM refutation
type: defect
ticket_category: abi_substrate_closure_correction
status: active
goal: >-
  Correct the overclosed GOAL-014 substrate claim before odd_glc parity work
  depends on it. T-167 must prove every retained non-closed disposition branch;
  T-169 must prove recursive span identity on an actual nested traversal rather
  than first-traversal declaration projection; T-160 must run on an ABG runtime
  path, admit live F_P findings through ABG, emit executive pressure facts
  through the runtime event stream, and feed ABG continuation without
  prompt-carried or fixture-injected answers.
change_intent: >-
  STDO/DESIGN_MODULE_METHOD self-review and adversarial review found that
  GOAL-014 was marked complete before the hardest runtime proofs were earned.
  T-168 is substantially earned, T-167 proves continuation_available but not
  every retained non-closed branch, T-169 proves declared first-traversal span
  projection rather than recursive identity, and T-160 is a standalone
  projection/artifact proof rather than an event-sourced runtime feature.
change_class: realization_refactor
re_entry_point: design_reframe
owner: abiogenesis
priority: critical
triaged_at: 2026-06-29
created_at: 2026-06-29
updated_at: 2026-06-29
reopened_at: 2026-06-29
governance_scope: STDO Method, DESIGN_MODULE_METHOD, GTL, ABG, Requirements Algebra, Recursive Runtime, Release
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md
  - .ai-workspace/tickets/completed/T-167-publish-non-closed-requirements-route-replay-artifact.md
  - .ai-workspace/tickets/completed/T-168-ratify-gtl-requirement-graph-and-abg-refinement-route.md
  - .ai-workspace/tickets/active/T-169-ratify-requirement-span-identity-across-recursion.md
  - .ai-workspace/tickets/active/T-160-declare-abg-recursive-executive-observer-graph-for-obligation-pressure.md
  - release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.14/release-snapshot-manifest.json
  - /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/substrate.provenance.json
affected_boundary:
  goals:
    - specification/GOALS.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    - build_tenants/abiogenesis/typescript/code/src/abg/requirements/
    - build_tenants/abiogenesis/typescript/code/src/abg/executive/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t167_non_closed_requirements_route_replay_artifact.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t169_requirement_span_identity_recursion.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t169_requirement_span_identity_recursion_live.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t160_recursive_executive_observer.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t160_recursive_executive_observer_live.test.mjs
target_truth: >-
  ABI/GTL is complete for odd_glc parity only after the retained lifecycle
  disposition outcomes, recursive span identity, and executive pressure
  observer behavior are runtime-real, event-sourced or replay-projected at the
  correct authority boundary, and proven by non-tautological installed and live
  tests.
superseded_truth: >-
  A checksummed RC plus standalone projection tests and first-traversal live
  artifacts are sufficient to claim full odd_glc ABI substrate closure.
closure_law: >-
  Close only when corrected implementation and proof satisfy all non-closure
  gates below, focused and semantic tests pass, the required live F_P lanes pass
  without prompt-carried answers, and a corrected RC plus odd_glc retargeting
  records the final substrate identity.
non_closure_conditions:
  - T-167 retains `reentry_available` or `blocked` without an execution-grounded emitted-event proof, or the branch is dead but remains in the public contract.
  - T-169 span activation relies only on graph-function/vector membership, vector index, source/target equality, missing lineage refs treated as success, or a product-local span map.
  - T-169 live proof stops at `first_traversal` and does not exercise nested traversal/foldback/re-entry lineage.
  - T-160 executive observer has no production/runtime caller.
  - T-160 executive pressure facts are returned only as side arrays or JSON artifacts and are not emitted through ABG runtime truth when they claim runtime pressure authority.
  - T-160 live proof prompts the answer, force-injects classifying refs after the worker returns, or treats a field-name denylist as ABG admission.
  - odd_glc provenance claims a corrected ABI substrate before the corrected RC is cut and installed.
required_work:
  - Correct GOAL-014/GOAL-015 status and open this ticket as active.
  - Add T-167 execution proofs for every retained non-closed disposition branch, or remove/defer unowned branches from the public contract.
  - Make span-lineage activation fail closed when required lineage refs are absent, and prove recursive/nested lineage over actual runtime events.
  - Wire executive observer into an ABG runtime path, emit executive pressure fact events, and keep downstream `abg/executive` projection-only.
  - Rewrite T-160 live proof so the LLM judgment drives disposition without prompt-carried answer or test-side classifying-ref injection.
  - Run focused tests, live tests, full semantic regression, install self-test, odd_glc substrate smoke test, and cut a corrected RC.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - cd build_tenants/abiogenesis/typescript && npm run test:t167
  - cd build_tenants/abiogenesis/typescript && npm run test:t168
  - cd build_tenants/abiogenesis/typescript && npm run test:t169
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t169:live
  - cd build_tenants/abiogenesis/typescript && npm run test:t160
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t160:live
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t168:live
  - cd build_tenants/abiogenesis/typescript && npm run test:t165:hello-world-live
  - cd build_tenants/abiogenesis/typescript && npm run snapshot:release
  - cd /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript && npm test
  - git diff --check
---

# T-170: Full odd_glc ABI Substrate Closure Correction

## STDO Triage

### First Missing Layer

Design/proof realization boundary.

The product direction and requirement families are stable. The defect is that
GOAL-014 closed against proof surfaces that did not yet demonstrate the claimed
runtime behavior.

### Lawful Re-Entry

`design_reframe -> realization_refactor`.

No downstream product may compensate for this gap. The missing behavior belongs
in GTL/ABG.

## Acceptance Checklist

- [x] GOAL-014 is no longer represented as complete closure.
- [x] T-167 proves or removes every retained non-closed disposition branch.
- [ ] T-169 fails closed for absent lineage refs and proves nested traversal
      lineage over emitted/replayed runtime truth.
- [ ] T-160 is invoked on an ABG runtime path.
- [ ] T-160 pressure facts are emitted through runtime truth when used as
      continuation pressure.
- [ ] T-160 F_P findings are admitted through ABG admission and are not trusted
      as raw objects.
- [ ] T-160 live proof does not carry or inject the expected disposition answer.
- [ ] A corrected release candidate is cut and odd_glc is retargeted to it.
- [ ] Focused, live, semantic, install, and odd_glc substrate tests pass.

## Refuted Closure Evidence

2026-06-29 rc.14 review refuted full closure. T-167 and T-168 stand as earned.
T-169 and T-160 remain active because recursive span identity and recursive
executive control were not proven by runtime-real, non-tautological evidence.
The rc.14 release remains a historical release candidate, but it must not be
treated as full odd_glc ABI substrate closure.

- Corrected source commit: `a0f1f7ca7edf2cd6d4d672c4f008792f8d7ea79c`.
- Release snapshot commit: `4c0c20e`.
- Corrected release identity: `4.1.0-rc.14`.
- Release snapshot manifest:
  `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.14/release-snapshot-manifest.json`.
- Tarball SHA256:
  `e1d22bb4f2429bd4a035b424ca5283f7325c1b5e88e65019a206da05ccae8892`.
- Release snapshot manifest reports `sourceDirty: false` for source commit
  `a0f1f7ca7edf2cd6d4d672c4f008792f8d7ea79c`.
- `release_snapshots/abiogenesis-typescript-tenant/latest` points to
  `4.1.0-rc.14`.
- odd_glc retarget commit: `1c25f8d`.
- odd_glc consumed-substrate provenance now records
  `@abiogenesis/typescript-tenant@4.1.0-rc.14`,
  source commit `a0f1f7ca7edf2cd6d4d672c4f008792f8d7ea79c`, snapshot commit
  `4c0c20e`, tarball SHA256
  `e1d22bb4f2429bd4a035b424ca5283f7325c1b5e88e65019a206da05ccae8892`, and
  local product-toolchain manifest digest
  `511b73ac883a6aa2caba0eeefe8e59335411bac1258bcaedade0891496496c3a`.

Verified commands:

- `npm run test:semantic` passed, 947/947.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t164` passed.
- `npm run test:t167` passed, including blocked and re-entry dispositions.
- `npm run test:t168` passed.
- `npm run test:t169` passed.
- `npm run test:t160` passed.
- `npm run test:t168:live` passed.
- `npm run test:t169:live` passed in about 113s for the final run.
- `npm run test:t160:live` passed in about 103s for the final run.
- `npm run test:t165:hello-world-live` passed in about 20s for the final run.
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run --json` produced
  `abiogenesis-typescript-tenant-4.1.0-rc.14.tgz`.
- `sha256sum -c checksums.sha256` passed for the rc.14 snapshot.
- `cd /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript && npm test`
  passed, 17/17.
