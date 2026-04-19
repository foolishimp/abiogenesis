# abiogenesis Goals

## Position

`GOALS.md` holds the current work-wave focus above intent, product definition,
requirements, and design.

In this wave, abiogenesis is following the strict inside-out migration rule
from `SPEC_METHOD.md`:

- reprice the public contract first
- remove superseded bridge authority
- migrate producer and consumer surfaces to the new contract
- prove only after the old contract is no longer authoritative

This wave does not treat compatibility aliases or mixed operator stories as
acceptable closure.

The active wave is ABG-first. Downstream `odd_sdlc` migration follows after the
ABG operator/control-plane substrate is singular again.

## Current Goals

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status | Tracking |
| --- | --- | --- | --- | --- | --- | --- |
| `GOAL-003` | `Product` + `Policy` + `Design` | Replace the split human operator surface with one public advancement/observation contract: `gen-start` and `gen-gaps` as named composition truth, with literal CLI or service spellings treated as adapter/build bindings rather than rival public law. | Intent, product, policy, docs, adapter help, and tests all describe one operator model; `gen-iterate` and `run-status` no longer stand as co-equal public human commands. | `B-021`, `B-022`, `B-025`, `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`, `test_cli_adapter_auto.py` | Active | `B-021`, `B-022`, `B-025` |
| `GOAL-004` | `Product` + `Policy` + `Projection` | Make repeated proof failure become authoritative control-plane hold truth instead of loop-local behavior. | One resolved hold policy source governs threshold and clear path; `gen-start`, `gen-gaps`, and live status project the same replay-derived held truth; the clear path is authoritative event truth, not controller memory. | `B-018`, `REQ-P-POLICY`, `test_abg3_runtime_envelope.py`, `test_cli_adapter_auto.py`, `test_m03_engine_kernel_integration.py` | Active | `B-018` |
| `GOAL-005` | `Product` + `Design` | Make public targeting identity-backed and fail closed before downstream domains build higher-order traversal over it. | Public graph-function targeting resolves through a published target catalog to canonical callable-carrier identity, ambiguity fails closed, and asset addressing remains a separately ratified product capability until a published registry/ownership surface exists. | `B-023`, `B-024`, GTL identity law, target-resolution tests still to be added | Active | `B-023`, `B-024` |

## Wave Boundary

This goals wave covers the ABG implementation sequence:

1. `B-018`
2. `B-021`
3. `B-022`
4. `B-025`
5. `B-023`
6. `B-024`

`odd_sdlc` follow-on work starts after this ABG wave lands and proves.
