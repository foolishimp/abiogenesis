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
- selected_slice: invocation_reentry_projection
- selected_slice_stage: code_assessment_and_implementation
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
- [ ] migrate catalog truth to one event/replay projection
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

Next, replace invocation re-entry's direct source-route/source-stop scans with
the already accepted scoped replay projection. Preserve its separate
duplicate-consumption admission guard for the later Invocation entity slice.

Accepted immediately before this slice:

```text
one admitted run_stopped
  -> HoldsAt(run_terminal(runId))
  -> replay validates exact Run, route, causation, disposition, and uniqueness
  -> Public gap reopen consumes replay without scanning raw events
```

Expected production scope:

- `code/src/abg/invocation_admission.ts`
- existing replay projection types only if the required route provenance is
  not already exposed

Expected proof scope:

- existing invocation re-entry and installed external scenarios
- deterministic candidate and R10 proof regeneration

Acceptance:

- invocation re-entry consumes one scoped replay projection
- no direct source-route or source-stop raw-event scan remains on that path
- exact Run, route, stop, causation, disposition, and authority remain enforced
- duplicate-consumption admission remains unchanged
- build, focused Event Calculus, installed external, R10, standing falsifiers,
  full M5, and `git diff --check` pass

## Hard Invariants

- ABG-admitted events are the sole runtime transformation truth.
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
