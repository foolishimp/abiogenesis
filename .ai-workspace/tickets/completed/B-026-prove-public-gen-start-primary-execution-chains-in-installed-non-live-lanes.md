# B-026 Prove Public `gen-start` Primary Execution Chains In Installed Non-Live Lanes

- id: B-026
- title: Prove primary `gen-start` execution chains in installed non-live lanes so operator input perturbations stay traceable across the public contract
- type: feature
- status: completed
- goal: installed-start-chain-proof
- change_intent: Realize missing proof depth for the newly expanded public `gen-start` contract. The contract is now ratified and implemented, but the strongest current proof is still adapter-local. Installed non-live lanes should prove that one operator input perturbation propagates through request normalization, target resolution, job narrowing, traversal/dispatch, event emission, and projection without hidden bridge assumptions.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- intake_source: ABG review 2026-04-19 after public `gen-start` capability expansion
- dependencies: B-018, B-021, B-022, B-023, B-024, B-025
- affected_boundary: installed sandbox proof, `test_sandbox_install.py`, operator qualification lanes, retained install scaffolding
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-24
- authoritative_contract: public `gen-start` primary paths are proved through installed non-live execution chains, not only adapter-local tests
- superseded_surface: iterate-centered install proof and adapter-only proof as the practical evidence for newly added public targeting and control-mode behavior
- closure_law: each primary public `gen-start` family/control seam has at least one installed execution chain showing that a change in operator input changes the downstream manifest/job/events/projection chain lawfully and traceably
- producer_set: `cli_adapter.py`, `services.py`, installed app bootstrap, installed runtime contract, operator asset registry surface, proof-hold policy surface
- consumer_set: installed sandbox qualification, operator docs/examples, downstream installed runtimes, reviewers of the public operator contract
- derived_projections: pending recovery payloads, manifest edge selection, assessed / converged events, `gen-gaps` or live-status follow-on proof where relevant
- old_path_classification: iterate-centered install proof=`temporary scaffolding`; adapter-only proof=`temporary scaffolding`; installed `start` chain proof=`replace`
- governing_design: `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`

## Context

Abiogenesis just increased the public CLI/operator surface substantially:

- `scope + target + until`
- `graph_function:<published_handle>`
- `asset:<published_handle>`
- `fh_mode`
- `root_mode`

Those capabilities are now real product truth. The remaining weakness is proof
depth.

Adapter-local tests prove the mechanics, but they do not yet show enough of the
primary installed execution paths where one operator input visibly changes what
happens a few steps deeper in the runtime.

That is the lane where hidden interface assumptions and embedded bridge debt
usually appear.

## Problem Statement

The current proof stack is too concentrated in adapter/unit-style tests for the
new public `gen-start` surface.

Without installed execution-chain proof:

- a public target family can look correct locally while the installed line
  still routes differently
- control-mode behavior can be adapter-shaped instead of installed-runtime
  truth
- public contract churn can hide behind unit-style proof without proving the
  actual operator journey

## Required Direction

Implement the ADR-defined installed non-live proof categories for the primary
public `gen-start` execution families:

1. graph-function targeting:
   - one installed `gen-start --target graph_function:<handle>` chain where the
     selected handle visibly narrows the downstream manifest/job/events
2. asset targeting:
   - one installed `gen-start --target asset:<handle>` chain where the
     published operator asset registry visibly resolves to the governing
     callable carrier and changes the same downstream chain
3. root supervision:
   - one installed successful `gen-start --root-mode supervised` chain proving
     that root-mode changes orchestration/control-plane behavior without
     changing `StartIntent`
4. proof-hold enablement policy:
   - one direct proof that `proof_hold_policy.enabled = false` disables hold
     even when failure-threshold conditions would otherwise be met

The important law is not exhaustive Cartesian product testing. The important
law is that each primary public family has at least one traceable execution
chain over the installed line or, where install is not the right seam, one
direct proof at the consumed policy seam.

## Acceptance

- installed non-live proof exists for `graph_function:<published_handle>`
- installed non-live proof exists for `asset:<published_handle>` with a
  published operator asset registry
- installed non-live proof exists for successful `root_mode = supervised`
- direct proof exists for `proof_hold_policy.enabled = false`
- the added proof demonstrates a visible chain from operator input to deeper
  runtime effect rather than only asserting parser-local state

## Post-Closure Trace Note

On 2026-04-24, the primary operator loop was restated as a traceable sequence:
define assets, run `gen-start`, receive truthful stop or gap truth, work with
the agent to remove the roadblock, inspect with `gen-gaps`, and run
`gen-start` again.

This completed ticket is the closed source anchor proving that loop through
installed execution chains rather than only adapter-local mechanics:

- one operator input perturbation changes downstream manifest, job, event, and
  projection truth lawfully
- the installed line is the proof seam for the loop, not just parser or help
  text
- the loop stays auditable when the operator changes target or control mode
