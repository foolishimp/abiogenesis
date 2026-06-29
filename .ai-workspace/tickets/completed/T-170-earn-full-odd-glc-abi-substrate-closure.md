---
id: T-170
title: Earn full odd_glc ABI substrate closure after DMM refutation
type: defect
ticket_category: abi_substrate_closure_correction
status: completed
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
completed_at: 2026-06-29
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
  - .ai-workspace/tickets/completed/T-169-ratify-requirement-span-identity-across-recursion.md
  - .ai-workspace/tickets/completed/T-160-declare-abg-recursive-executive-observer-graph-for-obligation-pressure.md
  - .ai-workspace/comments/codex/20260629T060841Z_REVIEW_t170-root-cause-algebraic-violations.md
  - release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.16/release-snapshot-manifest.json
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
- [x] T-169 fails closed for absent lineage refs and proves nested traversal
      lineage over emitted/replayed runtime truth.
- [x] T-160 is invoked on an ABG runtime path.
- [x] T-160 pressure facts are emitted through runtime truth when used as
      continuation pressure.
- [x] T-160 F_P findings are admitted through ABG admission and are not trusted
      as raw objects.
- [x] T-160 live proof does not carry or inject the expected disposition answer.
- [x] A corrected release candidate is cut and odd_glc is retargeted to it.
- [x] Focused, live, semantic, install, and odd_glc substrate tests pass.

## Refuted Closure Evidence

2026-06-29 rc.14 review refuted full closure. T-167 and T-168 stand as earned.
T-169 and T-160 remain active because recursive span identity and recursive
executive control were not proven by runtime-real, non-tautological evidence.
The rc.14 release remains a historical release candidate, but it must not be
treated as full odd_glc ABI substrate closure.

## Root Cause Classification

2026-06-29 STDO/DESIGN_MODULE_METHOD root-cause review classified the reopened
failures as framework-detectable defects, not incidental red/green test drift:

1. Design failure: T-169 overloaded one `TraversalSpan` shape for both
   vector-local spans and recursive/cross-frame spans. Empty lineage arrays
   therefore meant wildcard authority in one slice and illegal absence in
   another. Closure requires recursive span identity to be discriminated by
   explicit traversal-derived lineage refs or an equivalent fail-closed
   witness.
2. Compiler/API failure: live `.mjs` proof harnesses read
   `evaluationInput.attachedResultArtifact`, a field not present on the
   TypeScript `EnginePluginInput` interface. Because the live proof files were
   JavaScript, the compiler did not catch the impossible API call and the live
   prompts received empty candidates. Closure requires typed live helpers or
   runtime schema assertions that reject absent/unknown plugin input fields
   before F_P invocation.
3. Runtime algebra integration failure: T-160 projected executive
   `continuationInput` without a consuming ABG continuation edge. Closure
   requires the emitted pressure fact and the resulting continuation
   disposition to causally change the runtime transition.
4. Authority encoding failure: executive re-entry was classified through
   substring-shaped refs instead of typed/admitted disposition truth. Closure
   requires closed disposition refs or enums; free-string semantics cannot
   drive authority.
5. Proof design failure: the T-169 live assertion accepted multiple
   incompatible lifecycle dispositions. Closure requires a strict expected
   disposition and negative proof that wrong dispositions fail.
6. Activation boundary failure: T-160 ran only when
   `request.executiveObserver` was supplied. Closure requires a production
   default observer binding derived from admitted runtime state, with test-only
   request injection insufficient for activation proof.

These root causes are part of the closure surface. A corrected RC must prove
that the framework makes each class visible at the algebra/API/proof boundary,
not merely that the specific live tests turn green.

The detailed root-cause review is recorded in
`.ai-workspace/comments/codex/20260629T060841Z_REVIEW_t170-root-cause-algebraic-violations.md`.
It classifies the failures as design, compiler/API, runtime algebra
integration, authority encoding, proof-oracle, activation-boundary, and
release/provenance failures.

## Corrected Implementation Evidence

2026-06-29 remediation after the rc.14 refutation:

- T-169 recursive span activation now fails closed only for true recursive
  lineage gaps. Runtime edges with zoom, foldback, extra frame, or non-edge
  alias lineage require admitted span lineage refs; ordinary vector-local
  route spans remain valid.
- T-160 default executive observation is derived from admitted runtime F_P
  evaluation state on the production runner path, emits
  `executive_pressure_fact_projected` through the event stream, and feeds ABG
  continuation transition projection.
- Live F_P plugin inputs now carry `attachedResultArtifact` through the typed
  `EnginePluginInput` API and the live harness asserts it before invoking the
  worker.
- Executive disposition uses exact disposition refs, not substring matching.
- T-169 live proof restores the strict `continuation_available` assertion.
- F_P `retry` or `no_close` findings with continuation refs are projected into
  admitted runtime continuation transition truth for the requirements route.

Verified commands on the corrected source:

- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t160` passed, 9/9.
- `npm run test:t162` passed, 22/22.
- `npm run test:t167` passed, 4/4.
- `npm run test:t168` passed, 2/2.
- `npm run test:t169` passed, 5/5.
- `npm run test:semantic` passed, 949/949.
- `CODEX_LIVE_FP=1 npm run test:t169:live` passed in about 104.8s.
- `CODEX_LIVE_FP=1 npm run test:t160:live` passed in about 16.8s.
- `CODEX_LIVE_FP=1 npm run test:t168:live` passed in about 8.6s.
- `CODEX_LIVE_FP=1 npm run test:t165:hello-world-live` passed in about 10.7s.
- `git diff --check` passed.
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run --json` produced
  `abiogenesis-typescript-tenant-4.1.0-rc.15.tgz`.

## Refuted rc15 Attempt

2026-06-29 rc15 review refuted full closure after the corrected source and
release cut:

- Corrected source commit:
  `1af67e4dfe52297d4ba9513ddd6b54829debb2f6`
  (`Earn corrected odd_glc ABI substrate source`).
- Corrected release snapshot commit:
  `6c8a799383729b80bcaf1cce8bc709e16adc1a7c`
  (`Cut abiogenesis TypeScript rc15 snapshot`).
- Release snapshot:
  `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.15/`.
- `latest` pointer:
  `release_snapshots/abiogenesis-typescript-tenant/latest -> 4.1.0-rc.15`.
- Tarball sha256:
  `8313b6a82fb6852ebb52bce70ac84a74df8dce57f866aa236b25602a6cff6242`.
- Release snapshot manifest sha256:
  `1a07eed0a845f086a4b82fcbc63984f9c7cb1c63bd8e733606dcffd97ea7e8ad`.
- Checksum verification:
  `sha256sum -c checksums.sha256` passed in the rc15 snapshot.
- odd_glc retarget commit:
  `0997109` (`Retarget odd_glc to abiogenesis rc15 substrate`).
- odd_glc substrate smoke:
  `/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript`
  `npm test` passed, 17/17.

## Corrected rc16 Closure

2026-06-29 rc16 earns full odd_glc ABI substrate closure under this ticket.

Corrected source and release:

- Source commit:
  `eec4090f64f5c95562732d6a67c7a52659feb3d4`
  (`Earn corrected odd_glc ABI substrate rc16 source`).
- Release snapshot commit:
  `534dd3a5488b1603c45e1461d73ced7e0aea5653`
  (`Cut abiogenesis TypeScript rc16 snapshot`).
- Release snapshot:
  `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.16/`.
- `latest` pointer:
  `release_snapshots/abiogenesis-typescript-tenant/latest -> 4.1.0-rc.16`.
- Tarball sha256:
  `2e692cece027fcd43eae82042d4a12729dbd5a92c3077efb92c32cc0ccc8c1bc`.
- Release snapshot manifest sha256:
  `7d13aabee419f6ca8ca76442dbdd1b1e85eabb2b4c2a10c78cb6030807491085`.
- Checksum verification:
  `sha256sum -c checksums.sha256` passed in the rc16 snapshot.
- Installed product manifest digest:
  `6ebe7314243388f3553d256c2df1306a95e0d18cf59c6ab47c125cdb0dccd3de`.
- odd_glc retarget commit:
  `8854735` (`Retarget odd_glc to abiogenesis rc16 substrate`).

Corrected proof evidence:

- T-169 no longer proves recursive span identity by matching proof-authored
  constants. Its focused proof derives child-frame, zoom, and foldback refs
  from ABG-emitted runtime lineage events and proves non-activation when those
  lineage events are absent.
- T-160 no longer derives executive disposition from diagnostic marker refs.
  The admitted F_P finding carries a typed `executiveDisposition`, diagnostic
  refs are inert, pressure facts are emitted through runtime truth, and the
  resulting continuation input feeds ABG continuation.
- T-167 and T-168 remain earned from the prior corrected work: non-closed
  disposition branches are differential-proven through replay events, and
  multi-requirement fold uses per-requirement evidence bindings rather than
  broadcasting one closure decision to every term.

Verified commands on rc16 source:

- `npm run build:semantic` passed.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t160` passed, 10/10.
- `npm run test:t162` passed, 22/22.
- `npm run test:t167` passed, 4/4.
- `npm run test:t168` passed, 2/2.
- `npm run test:t169` passed, 6/6.
- `npm run test:semantic` passed, 951/951.
- `CODEX_LIVE_FP=1 npm run test:t160:live` passed in about 86.2s.
- `CODEX_LIVE_FP=1 npm run test:t169:live` passed in about 109.2s.
- `CODEX_LIVE_FP=1 npm run test:t168:live` passed in about 7.8s.
- `CODEX_LIVE_FP=1 npm run test:t165:hello-world-live` passed in about
  88.3s.
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run --json` produced
  `abiogenesis-typescript-tenant-4.1.0-rc.16.tgz`.
- `npm run snapshot:release` created the rc16 release snapshot with
  `sourceDirty:false`.
- ABI install into `/Users/jim/src/apps/odd_glc` refreshed the shared
  toolchain product to rc16 and verified install topology.
- `/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript` `npm test`
  passed, 17/17.
- `git diff --check` passed.

Closure judgment:

The late-stage algebraic violations are now classified and guarded at the
design/API/runtime/proof/release boundaries named by the root-cause review.
odd_glc may treat ABIogenesis rc16 as the completed substrate for the planned
parity waves, while retaining the rule that downstream products consume GTL/ABG
truth read-only and do not rebuild these surfaces locally.

rc15 remains a useful intermediate release candidate, but it does not close
T-170. T-169 still proves matching over proof-authored lineage refs rather than
ABG-emitted child-frame lineage identity. T-160 still classifies load-bearing
executive dispositions through a diagnostic marker planted by the live harness,
and its activation/proof path does not yet demonstrate a normal production
runtime source for the observer.

## Remaining Closure Work

- T-169 must drive a traversal where ABG emits the child-frame, zoom, foldback,
  and re-entry lineage facts, then derive the span declaration/projection from
  those emitted facts. The live proof must not supply the same literal lineage
  refs on both sides as the proof oracle.
- T-160 must populate executive-observer input from normal runtime state on
  the iterate path and classify executive pressure from an admitted worker
  disposition field, not from `diagnosticRefs` carrying
  `abg.executive.disposition://*` marker refs.
- A successor corrected RC and odd_glc retarget may happen only after those
  proofs pass live and replay-derived.
