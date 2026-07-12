# T-249 Phase 1 Stable-First Candidate Self-Review

**Date**: 2026-07-12
**Change class**: `intent_reprice`
**Verdict**: READY FOR F_H REVIEW; NOT CLOSED

## Reviewed Boundary

Phase 1 propagates the approved stable-first direction through T-242/T-249,
GOAL-035, INTENT, PRODUCT, the affected requirement and scenario families, the
Python tenant status, and the successor/release tickets. It changes no product
code or accepted design.

The binding product statement is:

1. ABIogenesis 5.0 is the complete stable, source-independent,
   specification-method-compliant product for one trusted developer desktop.
2. Manual STDO, accepted three-view designs, GTL admission, the semantic
   compiler, and ordinary in-tree implementation govern 5.0 construction.
3. 5.0 retains the full runtime, public operator loop, Consensus,
   self-conformance, observer/tuner, native/Codex, compatibility,
   qualification, and release feature set.
4. 5.0 does not claim self-hosting and does not depend on 4.6, odd_glc, or a
   campaign to build, qualify, or release it.
5. After stable 5.0, odd_glc may mature to 1.0 over exact installed 5.0;
   installed 5.0 plus odd_glc 1.0 may then act as the development product for
   the distinct 5.0.1 dogfood successor.

## Authority Review

- GOALS, INTENT, PRODUCT, and requirements own constitutional scope.
- T-244 is a derived traceability and closure register; it neither defines nor
  widens product behavior.
- T-244 and T-249 lawfully remain active candidates. T-249 candidate drafting
  is admitted while T-244 is active; both require the same F_H confirmation
  before closure.
- T-243 is terminal predecessor evidence. T-245/T-246 and B-010 are explicit
  post-5.0 work. T-247 owns retained compliance realization and T-248 owns the
  direct RC/final release.
- No current 5.0 gate requires P4/I4/B5/S5/C1/C2/R5, odd_glc 1.0, a
  data-mapper campaign, released-pair proof, or the obsolete self-host
  capability.

## Product-Shape Review

- Consensus is a mandatory SYSTEM-owned executable GTL GraphFunction and free
  construction over ordinary atoms. A declaration-only nameplate, engine
  plugin, service loop, prompt shell, or CLI orchestration does not close it.
- Consensus uses the existing workspace, `catalog.invoke`, `read.result`, and
  `read.replay` contracts across existing, alternate explicit, and
  caller-created temporary workspace applications.
- The full interactive operator loop remains mandatory; no continuation, F_H,
  lawful-action, or resume surface was deferred with dogfood.
- Product self-conformance binds the exact source/candidate subject and its
  complete constitutional, design, realization, ticket/execution-contract,
  public, proof, qualification, and release inventory. No `builder` or
  self-host implication remains.
- The supported threat boundary remains one trusted developer desktop.
  Malformed GTL and likely malformed F_P output receive strong boundary checks;
  hostile-local tamper work remains excluded.

## Mechanical Evidence

- `npm run test:t220`: 35/35 passed.
- `npm run test:t223`: 70/70 passed.
- Public operation roster: exactly 36 unique identities.
- Mandatory capability roster: exactly 16 unique identities.
- Requirement definitions: 1,235; duplicates: 0.
- Changed-document links: 71; missing: 0.
- `git diff --check`: passed.
- Ticket path/status census: T-242/T-244/T-249 active, T-243 completed,
  T-245 through T-248 backlog; each has one carrier.

## Drift Findings Repaired During Self-Review

1. Removed an alternate reading in GOALS that allowed installed 5.0 alone to
   become the 5.0.1 development product.
2. Replaced remaining `builder` self-conformance language with exact
   source/candidate product terminology.
3. Removed residual T-244 authority inversions and stale INTENT item numbers.
4. Reconciled Python as Withdrawn in both the tenant registry and requirement
   guidance.
5. Rebound the last superseded T-230 plugin-seam owner.
6. Reworded scenario 08 as ordinary derived-artifact governance and recorded
   `TESTCASE_AUTHORITY.md` as an explicit no-change.
7. Distinguished the exact 36-operation roster from the 16 mandatory
   capability identities.

## Open Gates

- F_H must confirm the T-244 register and ratify the load-bearing T-249 diff.
- T-193/T-195 is 5/7: `CLAUDE.md` and the release note still name
  `4.6.0-rc.3` while the source package is `5.0.0-dev.0`.
- `lint:test-harness` has ten pre-existing unused-variable errors: seven in
  T-188 live, two in T-180 sandbox, and one in T-194 sandbox.
- Stable-plan amendment A6 still requires one committed reproducible Mermaid
  render/parse checker. The existing 27/27 attestation alone is insufficient.

Those residuals require bounded entry-gate work. They do not authorize product
code, weaken the retained product, or reopen the discarded self-host/campaign
ladder.
