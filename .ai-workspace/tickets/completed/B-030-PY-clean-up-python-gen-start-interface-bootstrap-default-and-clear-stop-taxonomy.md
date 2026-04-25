# B-030-PY Clean up Python `gen-start` interface, bootstrap default, and clear stop taxonomy

- id: B-030-PY
- title: Clean up Python `gen-start` interface, bootstrap default, and clear stop taxonomy
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: B-030
- build_tenant: python
- goal: maximum-autonomy-public-start-with-explicit-terminal-classes
- change_intent: Realize the Python/source-line execution cleanup for `B-030` without inventing a new command, new skill, or second operator story. In Python the CLI should carry the functionally complete `gen-start` interface directly, while bare-start convenience remains only a bootstrap/default concern. This wave therefore cleans up the complete Python `gen-start` interface, the retained bootstrap/default lowering, and the stop taxonomy over the existing Python public control surfaces.
- change_class: product_reprice
- re_entry_point: product
- priority: critical
- dependencies:
  - B-025 completed
  - B-026 completed
  - B-029 completed
- intake_source: operator UX review 2026-04-24 after the odd_sdlc test38/test39 closure wave; downstream domain surface wants bare `start` to mean "run this project as far as lawfully possible" without local runtime replacement
- affected_boundary: `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`, `build_tenants/abiogenesis/python/code/genesis/live_status.py`, `build_tenants/abiogenesis/python/code/genesis/proof_hold.py`, public control carriers, and source/install control-plane proofs
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-25
- completed_at: 2026-04-25
- authoritative_contract: Python `gen-start` owns the substrate public start contract. The Python line must publish one functionally complete CLI/callable `gen-start` interface and one replay-derived stop-class family over existing runtime truth. Any retained bare-start bootstrap/default lowering must sit beneath that interface and must not outrank it.
- target_truth: the Python line publishes one functionally complete `gen-start` interface for the current cut and one small stop taxonomy that distinguishes at least convergence, human-decision-required, worker/runtime-unavailable, capability-missing, proof-hold, and true runtime failure. If bare-start bootstrap/default behavior is retained, it lowers into that interface cleanly.
- superseded_truth: Python public operation still depends on remembered convenience bundles or implicit bootstrap folklore, and still makes operators infer the meaningful stop class from low-level public result detail such as yield, continuation, or missing capability projections.
- closure_law: this ticket closes when the Python line exposes a functionally complete `gen-start` interface, aligns any retained bare-start bootstrap/default lowering beneath it, publishes one clear stop-class projection over runtime truth, proves both positive autonomous advance and negative terminal classes, and keeps agent-side convenience guidance out of substrate authority.
- evaluation_criteria:
  - ABG owns the complete `gen-start` interface; downstream products bind it rather than rebuild it
  - public stop classification distinguishes worker/runtime unavailability from capability gaps, proof hold, human-decision-required, convergence, and true runtime failure
  - the classification is replay-derived over runtime truth, not controller-local folklore
  - explicit request grammar remains available as the lower-level public contract for advanced use
  - the implementation does not reintroduce `--auto`-style ambiguity or a second operator story beside `gen-start`
- non_closure_conditions:
  - closure is claimed while downstream products still must remember a folklore bundle of control flags to get maximum autonomy
  - worker/runtime unavailability is still indistinguishable from ordinary yielded continuation
  - the stop taxonomy is assembled from downstream wrappers rather than ABG public truth
  - a second public command story is introduced beside `gen-start`
- proof_surface:
  - source proof that the complete `gen-start` interface is admitted and projected through the ABG public control surface
  - source proof that worker/runtime-unavailable, capability-missing, proof-hold, human-decision-required, and true runtime failure classify distinctly
  - source proof that advanced explicit control modes still override the interface lawfully
  - install/downstream qualification note that downstream bare-start surfaces consume the new substrate truth instead of local runtime replacement

## Why This Ticket Exists

The downstream operator expectation is reasonable:

- bare `start` means "run the project as far as you lawfully can"
- the runtime should stop with one clear class when it cannot continue

ABG already owns the control plane.

So this should be solved in ABG as substrate truth, not by every downstream
domain app rebuilding its own "automatic" runtime or translating raw stop
detail differently.

For the Python line specifically, this should land as interface cleanup plus
bootstrap/default cleanup. It is not a new command, not a new skill, and not a
rival operator concept beside `gen-start`.

The operator concept is still `gen-start`.

CLI or agent wrappers may lower that concept into a multi-parameter call over
the real Python callable surface. The requirement is not single-argument
purity; it is truthful substrate behavior and one stable stop taxonomy.

The complete interface belongs in the CLI/callable substrate.

Convenience/autonomy bundles belong in agent guidance and bootstrap defaults,
not as a second public interface doctrine.

## Triage Position

Current triage stance:

- this is a public operator-contract defect, not a request to replace ABG with
  a downstream controller
- the current explicit request grammar stays lawful and useful, but it is too
  low-level to be the normal operator story
- if the current product/requirement wording is too weak to ratify one
  functionally complete `gen-start` interface and a small stop taxonomy,
  repricing must be
  explicit in the product/requirement surfaces rather than smuggled in through
  docs or downstream wrappers

## Constitutional / Product Anchors

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/product/REQ-P-POLICY.md`
- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`

## Migration Declaration

- old_truth_path: downstream products bind explicit `scope + target + until` plus control-mode folklore and infer meaningful stop classes locally
- new_truth_path: ABG publishes one functionally complete `gen-start` interface and one small stop taxonomy over runtime truth; downstream products and wrappers bind that substrate truth without local runtime replacement
- producers_old:
  - `cli_adapter` public control defaults
  - downstream wrapper docs and operator memory
- producers_new:
  - one substrate-owned complete public `gen-start` interface
  - one replay-derived stop-class projection over runtime/public truth
- consumers_old:
  - downstream bare-start wrappers
  - operators reading raw low-level stop detail
- consumers_new:
  - downstream bare-start wrappers bound to ABG truth
  - operators reading one stable stop class family

## Functional Review Criteria

1. Does ABG own the complete `gen-start` interface directly?
2. Does the public stop taxonomy separate worker/runtime absence from lawful continuation, capability gaps, proof hold, human gates, and true runtime failure?
3. Can downstream products consume the interface without adding a second control loop?
4. Does the implementation keep `gen-start` as the one operator story rather than reintroducing `--auto` or a rival command surface?

## Required Break Order

1. Ratify the complete `gen-start` interface and stop-class law in product/design surfaces if current wording is insufficient.
2. Add source proof for the interface and stop taxonomy.
3. Add downstream qualification proof that a domain package can bind bare `start` to the new substrate truth.
4. Only then reprice CLI defaults/help and installed docs.

## Closure Evidence

Completed on 2026-04-25.

Canonical realization:

- `build_tenants/abiogenesis/python/code/genesis/runtime_carrier.py` now publishes `public_stop_class_from_result(...)` and `attach_public_stop_class(...)`.
- `build_tenants/abiogenesis/python/code/genesis/services.py` attaches `stop_class` to callable `gen_start(...)` results.
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py` attaches the same public stop-class projection to CLI convergence, blocked, proof-hold, yielded, human-gate, and runtime-failure outcomes.

Stop taxonomy proof:

- `converged`
- `human_decision_required`
- `worker_dispatch_required`
- `proof_hold`
- `runtime_unavailable`
- `capability_missing`
- `runtime_failure`
- `payload_contract_failure`
- `yielded`

Downstream/bootstrap proof:

- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`

Verification:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py -q`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py -q`
