# T-287 - Deliver ABIogenesis 5.0 Feature Waves

- id: T-287
- type: feature
- ticket_category: implementation_migration
- status: active
- goal: GOAL-035
- priority: critical
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- change_class: goal_reprice
- migration_strategy: 4_6_structural_adoption_then_feature_composition
- library_usage: extend
- selected_method: STDO v2.2.2
- selected_method_commit: 0519129d63de10822ae6353fa0c5ce05d56f13e9
- immutable_reference_product: v4.6.0-rc.3
- selected_wave: W1
- selected_feature: A5-F10
- selected_slice: graph_catalog_contraction_and_runtime_recovery
- selected_slice_stage: implementation
- accepted_checkpoint: 1f6a86074bf995763b4caff286422b5b1501374b
- deferred_feature: A5-F12

## Outcome

Deliver the fixed ABIogenesis 5.0 Product through five installed feature waves.
Conserve working 4.6 behavior, correct only demonstrated 5.0 deltas, reuse one
common implementation for recurring information-technology structures and
algorithms, and expose one installed Product path.

This ticket is the detailed delivery backlog beneath GOAL-035. Product,
requirements, and accepted design define meaning. The local realization
constitution defines the reusable implementation constraints. This ticket
does not restate either.

## Authority

1. `specification/GOALS.md`
2. `specification/INTENT.md`
3. `specification/PRODUCT.md`
4. applicable `specification/requirements/`
5. accepted design selected by
   `build_tenants/abiogenesis/typescript/design/README.md`
6. `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`
7. this delivery backlog

T-270 and T-281 are superseded. Commentary and rejected branches are evidence,
not active instruction.

## Mandatory Review Preamble

Every worker handoff and independent review starts by stating this Product
frame before discussing design or code:

```text
fixed 5.0 features:
  A5-F01..A5-F11 and A5-F13..A5-F17
active wave:
  W1 = A5-F10, A5-F02, A5-F03, A5-F04
selected feature and slice:
  A5-F10 / graph_catalog_contraction_and_runtime_recovery
  = pure catalog readiness and construction + event-authoritative runtime
    recovery + installed terminal quiescence
Product outcome:
  exact GTL definitions drive HoG execution; ABG events and Event Calculus
  explain execution and workspace transformation
source/tool/runtime split:
  GTL definition = semantic source
  catalog.admit = pure exact-basis readiness validation and construction
  GraphFunctionCatalog = reconstructible HoG tool/result
  HoG = traversal and selection
  ABG event = admitted execution/transformation fact
  Event Calculus/replay = derived execution state and explanation
prohibited in this slice:
  catalog lifecycle/event/fluent/replay authority, rival registry or ledger,
  RootOperationState catalog authority, object-identity semantic admission,
  generated/lowered Program, controller, or compatibility dual path
```

The reviewer then cites the exact Product and requirement clauses that grant or
forbid each semantic relation under review. A design receipt does not satisfy
that obligation and cannot override an upstream contradiction.

### 5.0 Review Proportionality

Block 5.0 for:

- two reachable paths deciding the same semantic authority;
- process-local state changing admission, identity, currentness, replay, or
  fresh-process results;
- any 5.0 registry, ledger, store, runtime, controller, or equivalent algorithm
  redundancy beyond the conserved 4.6 baseline;
- code that cannot explain an admitted workspace mutation through its exact
  GTL definition and owning execution facts; or
- a missing selected 5.0 capability or installed proof.

Do not block 5.0 solely for deeper contraction of pure helpers, internal
validator placement, test-runner mechanics, non-semantic caches, or module
layout after one authority and behavior are proven. Record those items as 5.1
realization compression without adding a compatibility path or weakening a
5.0 negative test.

## Product Path

```text
GTL.TypeScript
  -> whole-Program validation and canonical admission
  -> exact Product/install/workspace/catalog basis
  -> direct HoG traversal through F_D | F_P | F_H
  -> ABG-admitted events
  -> Event Calculus and deterministic replay
  -> one 18-operation/56-key Public family
  -> installed SDK, CLI, qualification, and release
```

## Wave Backlog

| Wave | Feature families | Exit | State |
|---:|---|---|---|
| W1 | A5-F10, A5-F02, A5-F03, A5-F04 | One event-authoritative installed runtime kernel | Active |
| W2 | A5-F01, A5-F09, A5-F05, A5-F06 | One exact 18-operation/56-key Public family | Pending W1 |
| W3 | A5-F14, A5-F07, A5-F08 | Packed Hello World, probabilistic proof, One Surface, and Consensus on the same path | Pending W2 |
| W4 | A5-F13, A5-F17, A5-F11 | Native/host projections, downstream Product, and self-conformance | Pending W3 |
| W5 | A5-F15, A5-F16 | Qualified immutable 5.0 release | Pending W4 |

## Wave 1 Delivery

### A5-F10 - Event-sourced runtime truth

- [x] retain the append-only ABG event log and exact durable reopen
- [x] admit a nominal validated immutable event prefix
- [x] install one typed Event Calculus fold and `HoldsAt`
- [x] derive replay active/closed truth through that fold
- [x] route admitted leaf failure through failed route and `run_stopped(failed)`
- [x] remove affected copied fluent folds
- [x] derive stopped-Run truth and provenance through replay only
- [x] remove Public gap-reopen raw-event projection
- [ ] bind runtime use to exact GTL definitions selected through one reconstructible HoG GraphFunction catalog
- [ ] migrate artifact truth to one event/replay projection
- [ ] migrate invocation, continuation, and retry truth
- [ ] migrate result, judgment, route, and closure truth
- [ ] prove deterministic fresh-process equality for all retained projections

### A5-F02 - Complete GTL authoring and validation

- [ ] raw Program admission
- [ ] whole-Program topology validation before effects
- [ ] canonical order-independent Program identity
- [ ] GraphFunction publication
- [ ] complete C algebra and exact operation coverage

### A5-F03 - Complete Graph, C, and direct HoG traversal

- [ ] admitted Program selection and graph materialization
- [ ] direct structural traversal without compiled or controller authority
- [ ] implementation and interaction resolution
- [ ] invocation admission
- [ ] retry and continuation reconstruction

### A5-F04 - Probabilistic result integrity

- [ ] raw result admission
- [ ] contract and identity validation
- [ ] evidence and actor attribution
- [ ] retry classification
- [ ] consequential outcome projection

### Installed Wave 1 composition

- [ ] one exact installed candidate
- [ ] one Program identity and direct HoG path
- [ ] one ABG event authority and Event Calculus truth path
- [ ] deterministic fresh-process replay
- [ ] fail-closed probabilistic outcomes
- [ ] no rival controller, registry, ledger, fold, runtime, or source-tree dependency

## Current Slice

Recover directly from accepted checkpoint
`1f6a86074bf995763b4caff286422b5b1501374b`. The current dirty lineage and
rejected 42-file candidate are donor evidence only. Implement the accepted
[Graph Catalog Contraction](../../../build_tenants/abiogenesis/typescript/design/T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN.md)
without another design cycle.

```text
exact published GTL GraphFunctions
  -> one deterministic HoG GraphFunctionCatalog dictionary
  -> pure lookup, narrowing, refresh, and application
  -> HoG selects exact definition, fibre, and plan
  -> owning ABG invocation records that exact basis
  -> admitted effects explain workspace transformation
```

Implementation must:

- replace catalog candidate/admission/view/application lifecycles with one
  reconstructible handle-keyed GraphFunction dictionary returned by the one
  pure `catalog.admit` readiness operation;
- require that operation to validate the exact workspace binding, resolved
  lock, installed/verified Product set, descriptors, contribution manifests,
  direct dependency edges, compatibility, provenance, and publication basis;
- delete catalog and view event/EC/replay authority, registry-entry membership
  truth, catalog semantic WeakMaps/WeakSets, and RootOperationState catalog,
  view, and application maps;
- preserve deterministic collision refusal, canonical ordering, dynamic
  refresh from an exact changed publication set, pure views, and pure
  declaration application;
- bind invocation to the exact catalog basis, GTL definition, selected fibre,
  selected plan, and application refs/digests;
- retain ABG/Event Calculus only for execution, observation, evidence, and
  workspace transformation;
- recover terminal, CCall, actor/process, retry, traversal, continuation,
  result, closure, durable-prefix, and fresh-process code only where it remains
  valid after this contraction;
- leave no compatibility adapter or reachable old registry/catalog authority.

Proof must cover shuffled-order equality, dynamic add/refresh, equal duplicate
idempotence, unequal collision refusal, cache-loss reconstruction, pure view
and application, cross-workspace and unrelated-basis refusal, missing direct-
dependency and incompatibility refusal, exact row provenance, exact invocation
basis, execution replay, workspace-delta
explanation, zero catalog lifecycle events/fluents, and zero reachable
RootOperationState or object-identity catalog authority. Then run build,
conservation, R1-R10, full M5, installed package, and `git diff --check` before
freezing one exact candidate.

Scope guard: finish this catalog hard break, remove every stale executable and
proof consumer of its deleted authority, and return to the Wave 1 feature
sequence. Other audit findings enter this slice only when they are competing
semantic authority, fresh-process correctness defects, or redundancy beyond
the 4.6 baseline. Purely structural deeper compression is recorded for 5.1 and
does not extend this implementation cut.

## Hard Invariants

- ABG-admitted events are the sole runtime transformation truth.
- Published GTL definitions are the sole GraphFunction semantic truth.
- The GraphFunction catalog is one reconstructible HoG tool, not an admitted
  runtime entity, registry authority, event family, or replay projection.
- Event Calculus over an explicit validated immutable prefix is the sole
  runtime-currentness relation.
- Replay and Public are reconstructive projections; they do not author truth.
- Every domain entity keeps one identity, lifecycle, admission owner, and
  competing-path disposition.
- Reuse common data structures and algorithms through typed domain adapters;
  a common component does not acquire domain authority.
- No compiled Program, feature controller, second runtime, rival store, raw
  currentness scan, process-local semantic authority, compatibility facade, or
  source-tree dependency may enter the installed path.
- Local defects are fixed locally after global law is settled. Re-enter design
  only for a material contradiction in Product, requirements, or accepted
  design.

## Closure

Wave 1 closes only when every Wave 1 checkbox is evidenced on one clean
installed candidate. T-287 closes only when all five waves and the immutable
5.0 release close.
