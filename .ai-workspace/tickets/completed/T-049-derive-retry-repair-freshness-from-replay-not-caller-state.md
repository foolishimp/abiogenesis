# T-049 Derive Retry/Repair Freshness From Replay, Not Caller State

- id: T-049
- title: Derive retry/repair freshness from replay, not caller state
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: T-045
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: repair T045 retry/repair freshness so attempt index, manifest currentness, and retry identity are derived from replay-visible projection truth rather than caller-supplied counters or candidate manifest strings
- change_class: realization_refactor
- re_entry_point: typescript_m03_retry_repair_realization
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-042 completed
  - T-044 completed
  - T-045 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: none
- library_rationale: retry/repair freshness is core M03 runtime authority and must be derived from replay before any helper commonization is considered
- target_truth: retry/repair decisions derive attempt count, stale/current manifest status, fresh run/call identity, and continuation repair linkage from replayed runtime facts and current projection
- superseded_truth: `deriveRetryRepairDecision(...)` accepts caller-supplied `candidateManifestId` and optional `observedAttemptCount`, and projection tracks retry run IDs without enough manifest lineage to prove currentness across prior attempts
- closure_law: this ticket closes only when caller-local retry counters or candidate manifest strings cannot establish freshness, and stale/non-current manifest redispatch fails from replay-derived projection truth
- evaluation_criteria:
  - projection carries per-vector retry attempt facts including manifest identity and source projection/current-state reference
  - attempt index is replay-derived or deterministically checked against replay-derived facts
  - candidate manifest truth is minted/admitted by an M03 manifest-regeneration carrier or validated against current projection
  - stale manifest reuse fails even when the manifest differs from only the immediate prior id
  - negative tests cover caller-supplied counter drift and old manifest replay
- non_closure_conditions:
  - `observedAttemptCount` can override replay truth in normal execution
  - only equality with the immediate prior manifest is checked
  - retry run/call ids are minted from caller-controlled strings without replay currentness
  - proof does not include a multi-attempt stale-manifest case
- proof_surface:
  - unit tests for retry projection and decision derivation
  - integration proof for retry/repair currentness
  - negative stale manifest proof across more than one prior attempt
  - negative caller-counter drift proof
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: retry freshness is partly supplied by caller fields and shallow prior-manifest comparison
- new_truth_path: retry freshness is derived from replayed retry/manifest/continuation facts in M03 projection
- producers_old:
  - `deriveRetryRepairDecision(...)` caller input
  - local candidate manifest id
  - optional caller attempt count
- producers_new:
  - retry attempt runtime events
  - manifest regeneration/admission carrier
  - replay-derived retry projection
- consumers_old:
  - M03 retry constructors
  - tests that supply local retry counters or manifest ids
- consumers_new:
  - M03 retry/repair decision derivation
  - continuation repair event construction
  - M04 stop/projection consumers
  - M05 retry/repair proof lanes
- derived_surfaces:
  - aggregate projection
  - runtime event stream
  - postmortem/archive proof

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] if the work exists in more than one build tenant, this backlog/active ticket carries only one tenant lifecycle and any sibling tenant work lives on its own suffixed ticket
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Functional Review Criteria

1. Can retry freshness be proven from replay without trusting caller-local state?
2. Does stale manifest rejection cover any non-current manifest, not only immediate equality?
3. Does attempt identity encode current projection truth rather than local counter folklore?
4. Does replay disagreement fail closed?

## Required Break Order

1. Inventory retry decision inputs, retry events, projection fields, and tests.
2. Add missing retry/manifest lineage to replay-derived projection.
3. Rebind retry decision to projection-owned attempt and manifest truth.
4. Remove or demote caller-supplied attempt count and candidate freshness authority.
5. Add stale/non-current and counter-drift negative proof.

## Closure Evidence

Completed on 2026-04-25.

- `RuntimeAggregateProjection` now carries retry manifest ids and per-attempt replay refs.
- Retry attempt count is derived from projection facts for the failed vector.
- Caller-supplied `observedAttemptCount` is allowed only when it agrees with replay; drift fails closed.
- Candidate manifest ids are rejected if previously seen in replay, not only when equal to the immediate prior manifest.
- Negative proof covers caller retry-count drift and reused manifest truth.
- Proof: `npm run test:t045`, `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
