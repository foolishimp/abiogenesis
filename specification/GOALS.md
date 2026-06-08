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

This wave does not treat alias spellings or mixed operator stories as
acceptable closure.

The current completed wave is ABG construction-substrate. It turns the T-127
first-slice construction carriers into an installed mixed-regime runner with
composition grammar, vector-local regimes, observed-state admission, overlay
frames, F_D authority placement, construction pressure packaging, and
dependency-ready saga-frontier realization transparency.
Downstream product migration follows after this substrate proves by deleting
product-local loop/controller authority rather than rebuilding it.

## Current Goals

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status | Tracking |
| --- | --- | --- | --- | --- | --- | --- |
| `GOAL-003` | `Product` + `Policy` + `Design` | Replace the split human operator surface with one public advancement/observation contract: `gen-start` and `gen-gaps` as named composition truth, with literal CLI or service spellings treated as adapter/build bindings rather than rival public law. | Intent, product, policy, docs, adapter help, and tests all describe one operator model; `gen-iterate` and `run-status` no longer stand as co-equal public human commands. | `B-021`, `B-022`, `B-025`, `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`, `test_cli_adapter_auto.py` | Completed | `B-021`, `B-022`, `B-025` |
| `GOAL-004` | `Product` + `Policy` + `Projection` | Make repeated proof failure become authoritative control-plane hold truth instead of loop-local behavior. | One resolved hold policy source governs enablement and threshold; `gen-start`, `gen-gaps`, and live status project the same replay-derived held truth; the clear path is authoritative event truth, not controller memory. | `B-018`, `REQ-P-POLICY`, `test_abg3_runtime_envelope.py`, `test_cli_adapter_auto.py`, `test_m03_engine_kernel_integration.py` | Completed | `B-018` |
| `GOAL-005` | `Product` + `Design` | Make public targeting identity-backed and fail closed before downstream domains build higher-order traversal over it. | Public graph-function targeting resolves through a published target catalog to canonical callable-carrier identity, ambiguity fails closed, and `asset:<published_handle>` resolves only through one published operator asset registry and ownership surface to one governing callable boundary. | `B-023`, `B-024`, GTL identity law, target-resolution tests | Completed | `B-023`, `B-024`, `B-026` |
| `GOAL-006` | `Run` + `Convergence` + `Policy` + `Projection` | Make continuation-owned retry/repair/review outcomes project as yielded public truth instead of failure-shaped status whenever a lawful next step exists. | `gen-start`, runtime return payloads, run projection, and live-status agree on yielded continuation truth; downstream products no longer need semantic repair over ABG status. | `B-029`, `REQ-R-ABG3-RUN`, `REQ-R-ABG3-CONVERGENCE`, `REQ-R-ABG3-EVENTS`, `REQ-P-POLICY`, `test_abg3_runtime_envelope.py`, `test_cli_adapter_auto.py` | Completed | `B-029` |
| `GOAL-007` | `Requirements` + `Projection` + `Convergence` | Make ABG closure derive from total assurance projection over current authority and admitted runtime events, so bounded compute cannot close by worker success, report shape, test success, or absent closure rows. | ABG has requirement authority for exhaustive ambiguity rows and event-sourced payload ledgers, GTL can declare assurance and payload hook refs without side-door runtime config, TS tenant proof owns the primary release gate, Python evidence is retained only as paused reference material, and ABG owns process actor truth, typed F_P stage carriers, and full retry frontier projection before downstream products consume them. | `T-088`, `T-089`, `T-090`, `T-091`, `T-092-TS`, `T-093-TS`, `T-094`, `T-095`, `T-096`, `T-097`, `T-098`, `T-099`, `REQ-R-ABG3-ASSURANCE`, `REQ-R-ABG3-PAYLOAD`, `REQ-L-GTL3-HOOKS` | Completed | `T-088`, `T-089`, `T-086`, `T-090`, `T-091`, `T-092-TS`, `T-093-TS`, `T-094`, `T-095`, `T-096`, `T-097`, `T-098`, `T-099` |
| `GOAL-008` | `GTL` + `ABG Runtime` + `Construction` + `Projection` | Realize the generic mixed-regime construction substrate that replaces downstream product outer loops. | ABG owns an installed construction runner over admitted construction intent; vector-local regimes drive mixed F_P/F_D/F_H traversal; observed workspace/register state is admitted and replay-visible; overlay frames are GTL-bound runtime contracts; F_D outcomes route by authority placement; construction pressure packages reproduce the load-bearing test35 behavior; dependency-ready fan-out is an admitted traversal opportunity that ABG may realize serially or bounded-parallel without product-local loop control; system parallelism keeps immutable semantic carriers over the shared workspace effect boundary. | `T-134`, `T-128`, `T-135`, `T-136`, `T-137`, `T-138`, `T-139`, `T-141`, `REQ-R-ABG3-FP-CONSCIOUSNESS`, `REQ-R-ABG3-SAGA-FRONTIER`, `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-PROJECTION`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-EVALUATOR` | Completed | `T-134`, `T-128`, `T-135`, `T-136`, `T-137`, `T-138`, `T-139`, `T-141` |

## Wave Boundary

The completed ABG operator/control-plane wave covered:

1. `B-018`
2. `B-021`
3. `B-022`
4. `B-025`
5. `B-023`
6. `B-024`
7. `B-029`
8. `T-088`
9. `T-089`
10. `T-090`
11. `T-091`
12. `T-092-TS`
13. `T-093-TS`
14. `T-094`
15. `T-095`
16. `T-096`
17. `T-097`
18. `T-098`
19. `T-099`

Python tenant work from this wave is paused by the tenant registry. Existing
Python evidence remains reference material, but Python parity is not an active
RC gate while the release line is TS-primary.

The completed construction-substrate wave covers:

1. `T-134` completed requirements/design grammar
2. `T-128` completed installed construction runner
3. `T-135` completed vector-local regime resolution
4. `T-136` completed observed-state admission
5. `T-137` completed overlay-frame contract
6. `T-138` completed F_D authority placement
7. `T-139` completed construction pressure package substrate
8. `T-141` completed dependency-ready saga frontier substrate

`T-134` supplies the completed requirements/design grammar that all
implementation tickets bind to; it does not own parser/runtime/export
implementation before the runner shape is proven. `T-135` now supplies
vector-local regime resolution for mixed F_P/F_D/F_H traversal. `T-136` now
supplies replay-visible observed-state admission for workspace, register,
projection, event-watermark, and policy observations. `T-128` now supplies the
runner-owned construction step over admitted construction intent and mixed
F_P/F_D graph invocation. `T-138` now supplies severity-classified F_D
authority placement and pressure routing. `T-137` now supplies the generic
overlay-frame contract and projection. `T-139` now supplies the construction
pressure package substrate. `T-141` supplies dependency-ready saga frontier
truth and runtime-realization transparency so downstream dependency fan-out can
be admitted without forcing downstream async controller authority.

Downstream product follow-on work starts after this ABG wave lands and proves.
Immediate downstream consumer work is expected to consume ABG construction
runner truth, vector-local regime truth, observed-state refs, overlay-frame
truth, construction pressure packages, and dependency-frontier truth rather
than rebuilding those surfaces in product-local controller code.
