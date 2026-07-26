# Scenario Bundle - Governed Probabilistic Runtime

> **T-283 disposition (2026-07-20):** Prior scenario evidence; held and
> non-operative for 5.0 acceptance. The exact current Product scenarios are
> `ABG5-S01` through `ABG5-S07` in `PRODUCT.md` and
> `REQ-P-SCENARIOS.md`. Reuse requires post-closure re-derivation.

**Validates**: REQ-R-ABG3-INTERPRET, REQ-R-ABG3-CONVERGENCE, REQ-R-ABG3-POLICY, REQ-R-ABG3-SELECTION-APPLICATION, REQ-R-ABG3-LEAFTASK, REQ-R-ABG3-TRANSPORT, REQ-M-GTL3-MAPPING, REQ-M-GTL3-PROVENANCE

**Derives from**: [SPEC_METHOD.md](../../.genesis/docs/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ODD_METHOD.md](../../.genesis/docs/standards/ODD_METHOD.md), [PRODUCT.md](../PRODUCT.md), [requirements/abg/README.md](../requirements/abg/README.md)

**Purpose**: Prove that ABG 3 governs probabilistic work declaratively through
policy/default law and post-dispatch fact ownership rather than imperative
controller logic.

## Scenario

Interpret one selected graph function whose active boundary declares custom
hooks for deterministic evaluation and closure, but falls forward to governed
`F_P` transport when deterministic handling remains open, with local transport
contract override and bind-time typed-asset contract truth preserved into
dispatch manifests.

## Significant Paths

- selection path: ABG enumerates candidates, accepts external selection, and
  applies it lawfully without becoming the strategy engine
- policy path: resolved hook refs plus configured default bundle govern
  admissibility, fallback, proof, and closure
- subwork path: bounded subordinate subwork remains governed runtime work and
  does not become a hidden escape hatch around engine truth
- dispatch path: ABG owns readiness, worker invocation, failure
  classification, proof re-entry, and continuation opening after dispatch
- transport-config path: local transport-contract overrides are resolved as
  ordinary policy/config inputs and malformed overrides fail closed as config
  defects rather than silently drifting runtime behavior
- provenance path: bind-time manifests preserve materialization/mapping truth
  plus declared target and carried `asset_surface` contracts surfaced into
  probabilistic work packets, together with the explicit invocation-local merge
  that forms the effective required boundary for that dispatch
- negative path: ABG does not observe or encode internal tactic or
  chain-of-thought inside probabilistic workers

## Expected Outcomes

1. ABG remains governance/observability framework, not prompt choreography
2. broad default bundles provide lawful reference behavior without hidden
   hardcoded policy tables
3. deterministic invalid/erroring paths fail closed rather than silently
   escalating to `F_P`
4. local transport contract overrides remain explicit governed inputs rather
   than hardcoded engine drift
5. bounded subordinate subwork stays schema-driven and replay-visible
6. all post-dispatch fact truth is engine-owned
7. unresolved deterministic observer findings after successful constructive
   work surface as runtime fact truth for downstream handling unless declared
   hard-stop policy or blocker-class closure still applies
8. unresolved non-blocking post-transform observer truth yields to the next
   lawful observer or routing layer rather than failing or immediately
   redispatching the same constructive lane
