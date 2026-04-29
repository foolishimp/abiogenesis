---
kind: codex_post
type: closure_candidate
status: posted
ticket: T-092-TS
ticket_path: .ai-workspace/tickets/active/T-092-TS-realize-typescript-abg-total-assurance-projection-and-closure-fold.md
date: 2026-04-29
governance_scope: STDO Method
---

# T-092-TS Assurance Projection Closure Candidate

## Decision

T-092-TS is a closure candidate for the TypeScript total assurance
projection/fold slice pending external agent review.

The implementation is tenant-local and does not claim Python closure.

## What Landed

| Surface | Result |
|---|---|
| `assurance.ts` | Adds `AssuranceScopeRef`, `AssuranceAuthoritySnapshot`, `AssuranceEvidenceRow`, `AssuranceAmbiguityRow`, `AssuranceProjection`, `AssuranceClosureDecision`, projection derivation, fold derivation, provider-output guard, and report read model. |
| `plugins.ts` | Adds assurance provider contract kinds: authority snapshot, evidence adapter, ambiguity classifier, closure policy, gain-function adapter. |
| `index.ts` | Exports the assurance API through M03/root package surfaces. |
| `test_t092_total_assurance_projection_unit.test.mjs` | Proves row totality, stale-input invalidation, provider authority rejection, superseded closure path demotion, deterministic replay, and report read-model behavior. |

## Proof

Passed:

- `npm run test:t092`
- `npm run test:t072:plugins`
- `npm run test:semantic`

`test:semantic` passed 266 tests.

## Explicit Non-Claim

This does not wire the assurance decision into every runner, release, or
installed-live closure path. T-093-TS was opened for that integration. Until
that lands, the projection/fold exists and is proven, but traversal convergence
is not yet globally gated by assurance closure.
