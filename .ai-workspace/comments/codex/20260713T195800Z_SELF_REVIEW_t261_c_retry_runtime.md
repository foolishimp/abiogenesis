# T-261 Self-Review: Bounded C.retry Runtime And Policy Join

Date: 2026-07-13
Reviewer: Codex
Disposition: implementation is ready for delegated F_H closure
Implementation checkpoint: `848a0b81`

## Reviewed Boundary

T-261 realizes one direct root `C.retry(C.of(...), budget)` as a generic,
selected-Module-bound runtime family. The compiler preserves the exact stage,
carrier pair, positive maximum-attempt budget, composition, and one shared
retryable-failure policy. The resolver derives attempt identity from replay,
uses one engine-owned C-call spine per attempt, retries only admitted runtime
failures in the shared allowlist, and projects terminal truth from events.

The boundary does not execute nested or mixed retry expressions, mutate the
input between local attempts, create a scheduler or backoff subsystem, absorb
graph-level repair, implement recursion, or remove the T-267/T-268 startup
fences.

## Findings And Repairs

| Finding | Repair | Result |
|---|---|---|
| The first canonical retry lowering exposed stale T-252/T-255 expectations and the older execution-declaration compiler inspected only flat stages | Projected the one retry stage at the declaration boundary and updated only successor-census assertions | repaired; unchanged Consensus body joins its existing handler |
| A negative selected-entry proof failed at the correct identity boundary but reported only a generic locus mismatch | Named selected-entry identity in the rejection diagnostic | repaired |
| Closed replay initially trusted the C-call locus without validating selected fibre/program/composition truth | Replay now validates the exact selected fibre and policy-bearing attempt evidence for every matched spine | repaired and mutation-tested |
| A valid terminal replay could initially hide an earlier ineligible `retry` judgment | Replay now validates every historical transition, output shape, allowlist decision, budget, and stationarity relation before terminal projection | repaired and mutation-tested |
| Synthesized failure evidence embedded raw error text in an evidence ref | Replaced it with the digest-derived governed failure ref | repaired |
| The first normalized-variant diagnostic widened an established workflow/batch string | Preserved the existing diagnostic and scoped the expanded wording to retry-present input | repaired; T-259 remains 9/9 |
| New public retry exports made generated product inventories stale | Regenerated and rechecked the 40 publication assets | repaired |

No remaining closure blocker was found in the compiler, selected authority
join, replay projection, retry eligibility, event spine, package surface, or
canonical T-252 observation.

## Residual Boundaries

- Only a direct root retry around one direct result-bearing `C.of` leaf is
  admitted. Nested and mixed retry shapes retain `gtl-c-unrealized-retry`.
- Local attempts preserve the same admitted input and state basis. Changed
  workspace or input truth must re-enter through the existing graph-level
  repair authority.
- A dangling open denotes an uncertain effect and resumes under the same
  attempt and C-call identity; the effect adapter must honor that stable
  identity at its external boundary, consistent with the existing C-call
  crash-recovery contract.
- Thrown adapter failures are `runtime_failure` and do not retry. Malformed
  returned output is a deterministic `contract_failure` and may retry within
  budget.
- Typed recursion remains owned by T-262. Traversal conservation and canonical
  product startup remain blocked under T-267 and T-268.
- The canonical Consensus body remains unchanged and no product-specific
  retry branch or controller was introduced.

## Observed Proof

| Gate | Observed result |
|---|---|
| `npm run test:t261` | GTL law 82/82; focused and inherited lane 44/44; packed public API 1/1 |
| Retry fixture | 9/9 generic cases covering completion, retry, semantic stop, hold, exhaustion, stationarity, malformed/thrown outcomes, replay, dangling resume, and authority drift |
| `npm run test:semantic:built` | 1669/1669 |
| `npm run test:t223` | 70/70 source-blind package, SDK, CLI, and publication proofs |
| `npm run test:t250` | 13/13 version-basis and documentation-drift proofs |
| `npm run test:t252` | 11/11; body digest unchanged; three successor gap families remain |
| `npm run check:abg-product-publication` | 82 schemas; 40 generated assets over 1103 immutable payload files |
| `npm run check:design-mermaid` | 36 diagrams across 12 files with renderer 11.3.0 |
| `npm run lint:semantic` | passed |
| `git diff --check` | passed |

## Exit Judgment

T-261 is eligible for delegated F_H acceptance and closure. The unchanged
canonical body remains
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
After ticket movement, the T-252 manifest was regenerated at
`sha256:abbee54abc804e9741ace33ad6c7bf1d9bdb233a9abd7bc9e4f761ec0cb26175`.
It reports exactly three active successor gap families and zero unowned,
duplicate, or active-owned-but-unobserved families.
