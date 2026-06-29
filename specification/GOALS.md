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
| `GOAL-009` | `Product` + `Requirements` + `GTL` + `ABG Runtime` + `Projection` | Realize the first ABG/GTL requirements-algebra substrate that preserves WHAT pressure through graph-function traversal, evidence binding, assurance fold projection, residual pressure, and query. | Product and requirement law name requirements as replay-derived algebraic carriers; `RequirementLedger` is a projection over emitted requirement events, not a writable ledger; M03 design passes IACS and ODD execution-authority review; TypeScript first-slice carriers, admission, projection, fold/residual, completeness gates, query, and compatibility wrappers prove the T-204-derived materialization/postflight bug patterns without downstream migration. | `T-162`, `REQ-R-ABG3-REQUIREMENTS-ALGEBRA`, `REQ-L-GTL3-CONTRACT-LAW-API`, `REQ-R-ABG3-ASSURANCE`, `REQ-R-ABG3-PAYLOAD`, `REQ-R-ABG3-PROJECTION`, `M03_REQUIREMENTS_ALGEBRA_DERIVATION`, `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS` | Completed | `T-162` |
| `GOAL-010` | `Product` + `Install` + `Release` + `Runtime` | Make the shared product toolchain the only install and runtime resolution model for ABG and downstream ODD products. | Product, requirements, design, installer, resolver, runtime commands, and tests agree on one canonical selector: `ABG_TOOLCHAIN_ROOT` plus workspace binding truth. Target workspaces carry binding/provenance/config and mutable roots only; immutable package, command, docs, and standards payloads resolve through the selected versioned product manifest. Legacy aliases, target-local package copies, top-level command shims, and implicit target-root defaults fail closed. | `T-163`, `REQ-P-INSTALL`, `M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION`, `M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS`, `M04_SHARED_PRODUCT_TOOLCHAIN_DESIGN_MODULE_REVIEW`, `test:t163` | Completed | `T-163` |
| `GOAL-011` | `Requirements` + `GTL` + `ABG Runtime` + `Projection` + `Interface` | Wire and pin the downstream-consumable requirements-algebra route without turning T-162 symbols into a new carrier/function catalog. | Existing T-162 symbols are exposed through stable GTL/ABG route interfaces; GTL declaration/composition refs do not import ABG runtime code; downstream-public surfaces are declarations and read-only queries; ABG-runtime-internal admission/projection commands emit declaration, projection, evidence, fold, residual, and disposition truth on the traversal path; admitted refs are nominal and replay-verified; F_D cannot infer F_P/F_H semantic meaning; route proof rejects forged refs, boolean evidence, manual truth refs, query-lazy fold/residual/disposition, downstream-public emitters, and caller-supplied route truth. | `T-164`, `REQ-L-GTL3-REQUIREMENTS-ALGEBRA`, `REQ-R-ABG3-REQUIREMENTS-ALGEBRA`, `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN`, `test:t164` | Completed | `T-164` |
| `GOAL-012` | `Live Proof` + `Requirements` + `GTL` + `ABG Runtime` | Prove the completed T-164 requirements route through a Hello World live F_P steel thread. | A gated live test starts from GTL requirement declarations for a Hello World program, invokes a real F_P transport worker, executes the produced Hello World artifact, emits ABG requirement route facts through the runtime event stream, joins disposition over ABG continuation truth, and replays the lifecycle state without product-local ledgers, caller-supplied route truth, or prompt-side preconstruction of the Hello World source. | `T-165`, `test:t165:hello-world-live` | Completed | `T-165` |
| `GOAL-013` | `Proof` + `Projection` + `Downstream Consumption` | Publish the requirements-route replay proof as a downstream-consumable artifact without exposing ABG runtime-internal emitters. | A T-165 or successor proof run writes a digest-pinned route replay artifact and manifest containing serialized `requirement_route_fact_projected` events and replay-derived lifecycle state; downstream consumers can prove read-only consumption from that artifact while ABG keeps emission, admission, fold, residual, and disposition authority internal. | `T-166`, `test:t166`, `test:t166:live` | Completed | `T-166` |
| `GOAL-014` | `GTL` + `ABG Runtime` + `Requirements` + `Projection` | Close the ABI substrate gaps needed for odd_glc beyond route-1 closed-path consumption. | ABI publishes a non-closed requirements-route replay artifact with residual and continuation/re-entry truth; GTL ratifies requirement graph/refinement declarations; ABG admits/projects/folds/residualizes multi-requirement structure; span identity is stable across frame, zoom, recursion, foldback, and re-entry boundaries; recursive executive observation preserves obligation pressure without downstream product-local controllers. | `T-167`, `T-168`, `T-169`, `T-160`, `T-170` | Reopened | `T-170` |
| `GOAL-015` | `GTL` + `ABG Runtime` + `Requirements` + `Projection` + `Release` | Earn the corrected full odd_glc ABI substrate closure under STDO/DMM. | T-167 proves every retained non-closed disposition branch through real emitted route events; T-169 proves recursive span identity across a nested traversal rather than first-traversal declaration projection; T-160 is invoked on a runtime path, admits live F_P findings through ABG, emits executive pressure facts through the event stream, and feeds ABG continuation without prompt-carried or fixture-injected answers; a corrected RC is cut and odd_glc is retargeted only after focused, live, semantic, install, and downstream smoke tests pass. | `T-170`, active `T-169`, active `T-160` | Active | `T-170` |

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

The completed requirements-algebra wave covers:

1. `T-162` product/requirements reprice for ABG/GTL-owned requirements algebra.
2. `T-162` first-slice M03 design pack, including IACS, structural carrier
   diagram, worked trace, ODD execution-authority audit, and gap partition.
3. `T-162` TypeScript first-slice realization for event-sourced requirement
   payloads, replay-derived requirement ledger projection, edge requirement
   environments, evidence binding, fold/residual projection, deterministic
   completeness gates, query/read models, and retained-compatibility wrappers.

This wave does not implement `odd_glc`, T-160 executive observation,
downstream `odd_sdlc` ledger migration, or KAOS/ReqIF/GSN/GRL editor/import
surfaces. Those surfaces may consume the admitted substrate as successor work.

The completed shared product toolchain wave covers:

1. `T-163` product/requirements reprice for one install-resolution model.
2. `T-163` M04 design/IACS clarification for versioned product payload roots,
   workspace binding truth, and mutable state-root separation.
3. `T-163` TypeScript installer and CLI migration from optional shared mode to
   mandatory shared product toolchain resolution.
4. `T-163` regression proof that legacy env aliases, target-local product
   payload fallback, top-level command shims, and missing workspace bindings
   fail closed.

The completed requirements-algebra downstream-readiness wave covers:

1. `T-164` requirements audit and route-interface law for the downstream
   requirements-algebra route.
2. `T-164` public `gtl.requirements` and `abg.requirements` facade design over
   existing T-162 symbols, with no GTL-to-ABG runtime dependency.
3. `T-164` ABG-runtime-internal declaration admission, evidence binding,
   assurance-fold bridge, residual projection, disposition projection, and
   joined lifecycle read model.
4. `T-164` proof that downstream consumers can only declare/query and cannot
   emit fold, residual, or disposition truth.
5. `T-164` installed non-live runner proof that starts from GTL requirement
   declarations, emits requirement route facts through the ABG runtime event
   stream, joins disposition over ABG continuation truth, and projects
   lifecycle state from replayed events.

The completed Hello World requirements-route live-proof wave covers:

1. `T-165` a gated live F_P proof over the completed T-164 route.
2. `T-165` a minimal Hello World program artifact as steel-thread evidence,
   not as the product scope.
3. `T-165` proof that GTL declarations activate the route without a
   caller-supplied `RequirementRouteRuntimeContext`.
4. `T-165` proof that the live worker artifact, local Hello World execution,
   ABG evidence admission, requirement fold/residual/disposition emission, and
   replay query all agree.
5. `T-165` proof that the prompt carries admitted requirement source refs,
   source digests, and active requirement context into F_P without supplying
   the exact program source or prefilled fulfillment answer.

The completed downstream requirements-route proof-publication wave covers:

1. `T-166` a non-live schema and digest contract for serialized
   requirements-route replay artifacts.
2. `T-166` live T-165 artifact publication that records route replay events,
   route payload refs, lifecycle state, source metadata, and manifest digest.
3. `T-166` downstream consumption support for odd_glc Phase 5 without exposing
   ABG runtime-internal route emitters or requiring downstream caller-supplied
   route truth.

The reopened ABI closure wave for downstream lifecycle scale currently stands
as:

1. `T-167` earned non-closed requirements-route replay proof with residual pressure
   and continuation or re-entry disposition emitted by ABG.
2. `T-168` earned GTL requirement graph/refinement declaration law plus ABG
   admission/projection/fold/residual/query over multi-requirement structure.
3. `T-169` active, not earned: requirement span identity must be
   traversal-derived from ABG-emitted frame/zoom/foldback truth, not from
   hand-authored literal lineage refs that the proof supplies on both sides.
4. `T-160` active, not earned: recursive executive observer pressure
   preservation must activate from a production runtime source and classify
   disposition from admitted worker judgment, not from a harness-planted
   diagnostic marker.
5. `T-170` records the root-cause taxonomy for the late-stage algebraic
   violations and remains active until the corrected implementation, live
   proofs, release cut, and odd_glc retarget all name an earned substrate.

This wave explicitly includes GTL. Requirement graph/refinement and lifecycle
composition structure must be declared through GTL contract-law surfaces; ABG
interprets and admits those declarations. Downstream products must not supply
that structure through local requirement compilers or local controller loops.
Span identity across recursion is also GTL/ABG work: GTL declares the stable
span and lineage refs; ABG admits, projects, folds, residualizes, and re-enters
over those refs without product-local span maps.

The refuted corrected-closure attempt is ABI TypeScript rc15:

- source commit `1af67e4dfe52297d4ba9513ddd6b54829debb2f6`;
- release snapshot commit `6c8a799383729b80bcaf1cce8bc709e16adc1a7c`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.15/`;
- `latest -> 4.1.0-rc.15`;
- tarball sha256
  `8313b6a82fb6852ebb52bce70ac84a74df8dce57f866aa236b25602a6cff6242`;
- odd_glc retarget commit `0997109`.

rc15 is cleaner than rc14, but it is not full odd_glc ABI substrate closure:
T-169 still proves matching over proof-authored lineage refs, and T-160 still
uses a marker-driven disposition path. A successor corrected RC must replace
that proof shape before odd_glc parity may treat the recursive substrate as
complete.
