# B-030 Publish one complete `gen-start` interface and clear stop taxonomy

- id: B-030
- title: Publish one complete `gen-start` interface and clear stop taxonomy
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: complete-public-start-interface-with-explicit-terminal-classes
- change_intent: Keep one upstream source/product/design authority for the already-ratified primary operator loop, then let tenant-local duplicates realize it independently. The loop is not a fresh UX invention; it is the reaffirmed operator expectation shaped by prior Python work: define or refine assets with the agent, run `gen-start`, receive one truthful stop or gap seam, work with the agent to remove the ambiguity or roadblock, run `gen-gaps`, and run `gen-start` again. This upstream ticket owns that operator truth and the remaining substrate gap around one functionally complete `gen-start` interface and one clear stop taxonomy. Convenience/autonomy bundles may exist in agent guidance, but they are not product-owned substrate truth.
- change_class: product_reprice
- re_entry_point: product
- priority: critical
- dependencies:
  - B-025 completed
  - B-026 completed
  - B-029 completed
- intake_source: operator UX review 2026-04-24 after the odd_sdlc test38/test39 closure wave; downstream domain surface wants bare `start` to mean "run this project as far as lawfully possible" without local runtime replacement
- affected_boundary: `specification/INTENT.md`, `specification/PRODUCT.md`, `specification/requirements/product/REQ-P-POLICY.md`, upstream ABG operator-control design truth, and tenant-local duplicate tickets derived from this source work item
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- authoritative_contract: `gen-start` owns the substrate public start contract. ABG must publish one functionally complete `gen-start` interface and one replay-derived stop-class family over existing runtime truth so downstream products and wrappers bind substrate truth directly instead of relying on folklore bundles or a local replacement loop.
- target_truth: ABG publishes one functionally complete `gen-start` interface for the current cut and one small stop taxonomy that distinguishes at least convergence, human-decision-required, worker/runtime-unavailable, capability-missing, proof-hold, and true runtime failure. Downstream products, CLI bindings, MCP bindings, and agent guidance consume that substrate truth instead of reconstructing it locally from hidden control folklore.
- superseded_truth: public operation still depends on remembered convenience bundles or wrapper folklore, and downstream products must infer meaningful stop class from low-level public result detail such as yield, continuation, or missing capability projections.
- closure_law: this upstream source/product/design authority ticket closes when the operator truth is ratified in live specification/product surfaces and the tenant-local duplicate tickets exist with independent lifecycle ownership for the remaining execution work.
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

This ticket is now the upstream authority surface for that work item.

Tenant execution lines are intentionally split so lifecycle stays independent:

- [B-030-PY](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-030-PY-clean-up-python-gen-start-interface-bootstrap-default-and-clear-stop-taxonomy.md)
- [B-030-TS](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md)

This unsuffixed ticket remains the source/product/design authority for the
shared operator truth. It is not the place to collapse Python and TypeScript
execution closure into one lifecycle.

The operator concept is still `start`.

Wrappers are allowed to lower that concept into a multi-parameter call on the
actual callable surface as long as they consume substrate truth rather than
inventing a second control model.

The complete interface belongs in the substrate/CLI surface.

The convenience/autonomy wrapper belongs in agent guidance and may evolve
without becoming constitutional or ticket-owned substrate truth.

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

## Completion Note

This unsuffixed upstream ticket is now closed as a shared authority surface.

Its tenant execution work is intentionally split by tenant:

- [B-030-PY](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-030-PY-clean-up-python-gen-start-interface-bootstrap-default-and-clear-stop-taxonomy.md)
- [B-030-TS](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md)

The Python and TypeScript lines are now closed independently under those
tenant-local tickets.
