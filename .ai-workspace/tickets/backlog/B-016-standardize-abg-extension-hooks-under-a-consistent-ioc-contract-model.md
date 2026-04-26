# B-016 Standardize ABG Extension Hooks Under A Consistent IoC Contract Model

- id: B-016
- title: Standardize ABG extension hooks under a consistent IoC contract model so runtime depends on contracts, not concrete implementations
- type: bug
- status: backlog
- goal: ioc-hook-standardization
- change_intent: Refactor ABG extension seams so every hook follows one inversion-of-control model with an explicit contract, reference, and resolver or provider boundary, allowing domains to supply implementations without ABG learning domain semantics or coupling to one storage or transport realization.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: high
- intake_source: operator architecture review 2026-04-18; ABG hook audit 2026-04-18; B-014 and B-015 follow-on architecture consolidation 2026-04-18
- dependencies: B-014
- affected_boundary: runtime bootstrap hooks, policy surfaces, transport, context loading, asset binding, fulfillment truth publication and resolution, runtime certification, live status and reporting resolution
- triaged_at: 2026-04-18
- created_at: 2026-04-18
- updated_at: 2026-04-26
- reopened_at: 2026-04-26
- invalidated_completion_at: 2026-04-26T11:10:02Z
- latest_slice: TypeScript runner-facing plugin slice completed under T-072 and
  corrected by T-074. The broader B-016 hook standardization umbrella remains
  open because classified hook-family rows are not runtime consumer proof.
- completed_prerequisites:
  - B-015 fulfillment-ledger ref/resolver slice completed 2026-04-18

## Context

Abiogenesis already exposes multiple extension seams, but they were introduced
incrementally and now follow different patterns.

Some are already close to a clean IoC model:

- `ContractRef`
- `TemplateRef`
- `EnvRef`
- `RefinementBoundary`
- `CandidateFamily`

Others are only partly inverted:

- `transport_contract`
- `asset_binding_contract`
- policy-surface merge
- context scheme loading
- fulfillment-truth publication and resolution

And some still expose concrete implementation details directly into runtime:

- evaluator-name-coupled runtime certification
- provider-specific policy/config assembly
- asset/context/transport seams that do not yet share one IoC shape

The architectural rule established by recent reviews is:

- ABG must know only generic traversal machinery
- domains must supply meaning and concrete implementations
- any hook ABG consumes should be expressed in IoC terms

This is not just a fulfillment-ledger concern. It is a substrate-wide design
consistency concern.

## Architectural Reading

ABG should depend on:

- contracts
- references
- resolvers or providers

ABG should not depend on:

- one local file layout
- one CLI shape
- one domain vocabulary
- one domain-specific world model
- one evaluator-name coincidence law

Domains should be free to provide implementations behind ABG hook contracts:

- local file projection
- object store
- database row
- service endpoint
- distributed saga projection
- domain-owned world model service

The strong future example is lawful and important:

- a future domain may publish admitted semantic truth through a distributed saga
  pattern
- ABG should be able to consume that through the same hook contract
- no ABG core logic should need to change because the backing implementation
  changed

## Problem Statement

ABG currently exposes hooks, but not one standard hook model.

The result is inconsistent coupling:

1. some hooks are contract-first and publication-safe
2. some hooks are configuration-first and implementation-shaped
3. some hooks still leak concrete realization details into runtime closure
4. some runtime and reporting consumers resolve the same semantic truth through
   different paths

This creates avoidable architectural drift:

- low coupling is not uniformly enforced
- domains cannot rely on one mental model for ABG extension
- runtime closure may depend on implementation details instead of the minimal
  generic contract
- future backend or projection changes require substrate edits where they
  should only require resolver/provider substitution

## Required Direction

Abiogenesis should standardize all extension hooks under one IoC model.

Every ABG hook should be expressed using the same conceptual shape:

- `Ref`
  - opaque handle to a published thing or external capability
- `Contract`
  - minimal engine-facing schema ABG requires
- `Resolver` or `Provider`
  - injected implementation that dereferences the ref or provides the
    capability
- `Consumer`
  - ABG runtime logic that depends only on the contract

Recommended naming standard:

- `*Ref`
- `*Contract`
- `*Resolver`
- `*Provider`

Examples:

- `TruthRef`, `TruthContract`, `TruthResolver`
- `TransportRef`, `TransportContract`, `TransportProvider`
- `ContextRef`, `ContextResolver`
- `AssetBindingProvider`
- `PolicyProvider`
- `AdmissionProvider`
- `CertificationResolver`

## Hook Audit Baseline

The current ABG hooks should be reviewed and migrated against this baseline.

### Full Hook Audit

The following table is intentionally verbose. It is the review baseline this
ticket should be judged against.

| Hook area | Current ABG surface | Current implementation | Coupling | IoC status | Target standard |
|---|---|---|---|---|---|
| Runtime bootstrap | `runtime_contract`, `package`, `worker`, `transport_contract`, `runtime_authority_ref` in `gen-install.py` and `cli_adapter.py` | Flat config fields and bootstrap-time assembly | Medium | Partial | Standardize as a `RuntimeConfigProvider` with typed contract and one runtime identity surface |
| Job binding | `ContractRef(kind="graph_function", target_id=...)` in `gtl.work_model` | GTL contract ref resolved by ABG in `binding.py` | Low | Good | Keep; already the right IoC shape |
| Graph materialization | `TemplateRef.inline_graph` / `TemplateRef.symbolic` in `gtl.function_model` | Inline graph or symbolic reference | Low | Good | Keep; formalize as `TemplateResolver` only if materialization paths widen |
| Environment carriage | `EnvRef` in `gtl.function_model` | Declarative ingress/egress/carry contract | Low | Good | Keep; already contract-first |
| Structural alternatives | `RefinementBoundary`, `CandidateFamily` in `gtl.function_model` | Selection logic in `selection.py`, runtime use in `interpret.py` and `frames.py` | Medium | Good but uneven | Standardize family/boundary selection vocabulary under one `SelectionProvider` model |
| Policy injection | Runtime config, candidate-family policy hints, role policy hooks, graph-function declarations, and graph-vector declarations merged in `policy.py` | Ad hoc multi-surface merge | Medium | Partial | Introduce explicit `PolicyProvider` / `PolicyBundleRef` contract and make all policy sources enter through the same provider shape |
| Context loading | `ContextResolver` in `binding.py` | `workspace://` implemented; `git://`, `event://`, `registry://` declared but not implemented | Medium | Partial | Standardize `ContextRef` + `ContextResolver`; ABG should consume scheme resolvers rather than special-case schemes internally |
| Workspace asset binding | `asset_binding_contract` or `domain_package query-domain` path in `binding.py` | Command execution plus dotted-path JSON extraction | Medium | Partial | Standardize as `AssetBindingProvider` with typed query/output contract |
| F_P transport | `AgentCliContract` and `transport_contract` in `transport.py` | CLI-specific command templates and runtime overrides | Medium | Good but concrete | Standardize as `TransportProvider`; CLI is one provider implementation, not the conceptual hook |
| Leaf subwork | `LeafTask` and `dispatch_leaf(...)` in `subwork.py` | Reuses transport with file-based output protocol | Medium | Partial | Standardize as `SubworkProvider` over the same transport/result contracts rather than a special local protocol |
| F_P result ingest | `assess-result` in `cli_adapter.py` | Reads `result_path`, validates payload, emits events, writes merged published ledger | High | Partial | Standardize as `AssessmentIngestProvider` with typed input/output contract and no file-path assumptions in runtime consumers |
| Published fulfillment truth | `published_ledger_ref`, `resolve_published_fulfillment_ledger(...)`, `latest_fp_assessed_event(...)` in `fulfillment_ledger.py` | `workspace_file` resolver over local JSON under `.ai-workspace/fp_ledgers/` | Medium | Good first slice | Keep as the baseline `TruthRef` + `TruthResolver` pattern and generalize it across other ABG hooks |
| Admission | `fh_admission_state(...)` in `fulfillment_ledger.py`, consumed by `binding.py` | Event replay plus ledger overlay | Medium | Partial | Standardize as `AdmissionProvider` / admitted-truth contract so approval, revocation, and published truth do not diverge |
| Runtime certification | `bind_fp_certified(...)` in `binding.py` | Reads published truth, but still couples obligation identity to evaluator names | High | Weak | Replace with obligation-generic `CertificationResolver`; runtime must certify from resolved truth contract, not evaluator-name coincidence |
| Live status projection | `project_live_run_status(...)` in `live_status.py` | Consumes the same fulfillment-truth resolver family as runtime | Low | Good for fulfillment truth | Reuse this alignment rule for the rest of the hook families |

### Current Good Or Near-Good IoC Hooks

- job-to-graph-function contract binding via `ContractRef`
- graph materialization via `TemplateRef`
- typed cumulative environment via `EnvRef`
- structural selection via `RefinementBoundary` and `CandidateFamily`

### Current Partial IoC Hooks

- runtime bootstrap config
- policy merge surfaces
- context scheme loading
- workspace asset binding
- F_P transport contract
- bounded leaf subwork
- F_P result ingest
- admission projection

### Current Weak Or Overly Concrete Hooks

- runtime certification coupling obligation identity to evaluator names
- runtime bootstrap remaining config-shaped instead of provider-shaped
- policy/context/asset/transport seams that still use mixed hook vocabularies

## Required Migration Targets

### T1. Standardize Fulfillment Truth As A Generic Resolved Hook

`B-015` completed the narrower fulfillment-ledger reference/resolver
abstraction. This ticket widens the principle:

- fulfillment truth must resolve through a generic `TruthRef` and
  `TruthResolver`
- local file-backed ledgers are only one implementation
- ABG must not care whether the truth is backed by a file, object store,
  database, or saga projection

### T2. Standardize Runtime Certification Against Contracts

Runtime closure must consume a resolved generic truth contract.

It must not depend on:

- evaluator-name identity coincidence
- a local file path
- a domain-specific ledger structure beyond the minimal generic contract

### T3. Standardize Reporting Against The Same Resolvers

Runtime and reporting must not resolve the same semantic truth through separate
logic paths.

Live status, projection, certification, and reporting should consume the same
resolver family for the same truth surface.

### T4. Standardize Provider-Based Configuration Hooks

The following should be reviewed and normalized into provider-oriented
contracts:

- transport
- asset binding
- policy
- context loading
- bounded leaf subwork

### T5. Preserve Domain Semantic Independence

This standardization must not:

- move obligation topology into ABG
- move ledger/world-model meaning into ABG
- teach ABG what a requirement, design, or attribute ledger means

Domains remain responsible for:

- semantic topology
- semantic fulfillment meaning
- world-model and ledger realization above the minimal generic truth contract

## Acceptance

- every currently exposed ABG hook is classified into:
  - `Ref`
  - `Contract`
  - `Resolver` or `Provider`
  - `Consumer`
- ABG documents and uses one consistent naming and lifecycle model for hooks
- runtime closure no longer depends on concrete storage paths or evaluator-name
  coincidence where a generic contract should suffice
- runtime and reporting consume the same resolver for the same semantic truth
- local file-backed fulfillment truth remains lawful as one implementation, not
  the architectural essence
- at least one representative hook migration proves backend substitution without
  changing ABG closure logic
- no hook standardization introduces domain semantics into ABG
- future domains can implement world models, ledgers, or distributed saga
  projections behind ABG hook contracts without requiring core ABG changes

## Non-Goals

- replacing domain-specific semantic evaluators with generic substrate logic
- forcing a distributed backend into local development flows
- redesigning domain ledger or world-model semantics inside ABG
- reopening GTL language publication surfaces that already conform to the
  contract-first model unless a real inconsistency is found
- collapsing `B-014` and `B-015` into this ticket; they remain narrower waves

## Suggested Work Plan

1. Produce a definitive ABG hook inventory and classify each hook into the IoC
   model.
2. Define the standard ABG hook vocabulary and contract shape.
3. Select the highest-risk concrete hooks and migrate them first:
   - fulfillment truth resolution
   - runtime certification
   - live-status/reporting truth resolution
4. Normalize configuration-driven seams into explicit provider contracts:
   - transport
   - asset binding
   - policy
   - context resolution
5. Document the standard so future hooks are required to enter through the same
   IoC shape.
6. Prove at least one hook can swap backend implementation without modifying ABG
   runtime closure logic.

## Links

- `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- `/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md`
- `/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-014-persist-and-promote-typed-fp-fulfillment-assessments-into-admitted-ledger-truth.md`
- `/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-015-abstract-fulfillment-ledger-reference-and-resolution-beyond-local-files.md`

## Future Uplift: GTL Syntactic Sugar For Declarative Hooks

This ticket is primarily about IoC standardization inside ABG runtime. It does
not require GTL language uplift in the first wave.

But there is a clear future uplift path: some ABG hooks are domain-authored and
declarative enough that they would benefit from GTL syntactic sugar once the
IoC contracts are stable.

The governing rule is:

- use GTL syntactic sugar for authored contracts
- use providers and resolvers for runtime machinery

### Strong GTL Sugar Candidates

These hooks are already close to domain-authored declarative surfaces and are
good candidates for future GTL uplift:

1. job binding via `ContractRef`
2. graph materialization via `TemplateRef`
3. cumulative environment carriage via `EnvRef`
4. structural selection surfaces via `RefinementBoundary`
5. structural selection families via `CandidateFamily`
6. policy injection surfaces that domains currently express through
   declarations, policy hints, or role policy hooks
7. context references that domains declare and ABG resolves through
   `ContextResolver`
8. admission-policy declarations at the edge or work-contract layer, where the
   domain should be able to declare whether semantic fulfillment requires
   `F_H` admission

These are all close to authored contract language, which means GTL sugar could:

- reduce boilerplate
- improve consistency
- make declarations easier to review
- reduce ad hoc dict-based declaration patterns

### Conditional GTL Sugar Candidates

These may benefit from GTL sugar only if they remain primarily domain-authored
surfaces rather than mostly runtime-owned implementation seams:

1. workspace asset-binding declarations
2. bounded leaf-subwork declarations

If these are mostly authored at the domain layer, sugar is valuable. If they
remain mostly substrate-owned runtime mechanisms, IoC contracts are the more
important standard than GTL syntax.

### Hooks That Should Remain Runtime IoC Surfaces

These hooks should remain resolver/provider-oriented substrate machinery rather
than GTL syntax targets:

1. runtime bootstrap config
2. F_P transport contracts
3. F_P result ingest
4. published fulfillment-truth resolution
5. runtime certification
6. live-status truth resolution

The reason is consistent:

- they are runtime implementation seams
- they are not primarily domain-authored semantic contracts
- GTL sugar would hide mechanism rather than clarify authored meaning

### Uplift Dependency

Any GTL uplift should come only after:

1. the IoC contract model in this ticket is stabilized
2. the concrete hooks are normalized to that model
3. ABG no longer couples those hooks to concrete implementation details

Only then should GTL syntactic sugar be added, so the language surface is
lifting a stable contract rather than fossilizing a transitional runtime shape.

## Reopen Correction 2026-04-26

This ticket is reopened. The prior decomposition closure is not accepted as
closure evidence.

Correction basis:

- ABG must remain the single framework-authoritative engine.
- Domains and downstream products may supply IoC plugins, providers, resolvers,
  policy overlays, and semantic interpretation, but they must not own traversal
  framework authority.
- A set of narrower tickets does not close this umbrella unless those tickets
  prove the full hook inventory and prove every extension seam is either ABG
  engine law or an injected IoC implementation behind a stable contract.
- Product-side orchestration loops, tenant-local runners, or app-specific retry
  controllers are non-closure evidence when they recreate engine authority
  outside ABG.

Current closure bar:

- publish a current ABG hook inventory
- classify each hook as engine-owned framework law or IoC plugin contract
- prove ABG owns start/iterate/traversal/continuation authority exactly once
- prove every downstream extension enters through a provider/resolver/plugin
  contract without moving framework authority downstream
- satisfy `DESIGN_MODULE_METHOD.md` for the plugin boundary: IACS, structural
  carrier diagram, authority matrix, subordinate payload register, module-derived
  unit proof, and design-method closure review
- prove local collapse: duplicate truth, parser re-entry, callback-specific
  result shapes, and rival authority paths are removed inside each plugin seam
- prove global collapse: recurring plugin shapes are commonized into reusable
  contract families or explicitly justified as distinct authority surfaces
- update affected TypeScript ABG tickets so the missing engine-owned iterate
  runner is evaluated against this IoC authority rule

TypeScript first closure gate:

- `T-072` must not close until it publishes the TypeScript plugin inventory and
  tests every runner-facing plugin seam
- each plugin test must prove both lawful substitution and fail-closed rejection
  when the plugin tries to own traversal selection, iteration, closure, or event
  authority outside its admitted contract
- plugin design must pass the `DESIGN_MODULE_METHOD.md` boundary-inflation,
  Prime Law, local optimization, and recurrence/commonization checks before
  `T-072` can claim closure
- `T-072` may close its runner slice before this umbrella closes only if B-016
  compliance is satisfied for every plugin seam touched by that runner slice

## Corrective Reopen 2026-04-26

The TypeScript closure record above was invalidated by STDO review feedback.

Corrected state:

- `T-072` realizes the runner-facing plugin slice: runtime event sink, F_D
  evaluator, F_P dispatch, and F_H admission.
- `T-074` repairs F_P assessed-result re-entry so replayed `assessed` truth
  closes the matching vector and prevents redispatch of the same edge.
- `enginePluginInventory()` now distinguishes `runner_consumed` seams from
  `classified_hook_family` rows.
- classified rows for result assessment, event ingress, continuation repair,
  policy provider, runtime identity provider, operator asset resolver, context
  resolver, projection consumer, and GTL hook reference are classification
  proof only. They do not prove those hook families are fully migrated to
  runtime consumer contracts.
- `publicStart(...)` remains a compatibility adapter over `startFromRequest(...)`
  and does not own lower M03 runtime law.

Current focused proof:

- `npm run test:b016` passed: 13 tests.
- `npm run test:t072` passed: 14 tests.
- `npm run test:t044` passed: 9 tests.
- `npm run test:t066` passed: 1 test.
- `npm run test:semantic` passed: 239 tests.
- `npm run lint:semantic` passed.
- ODD SDLC B-068/B-069 emergent outcome-iteration sandbox passed: 4 tests.
- ODD SDLC `npm run test:sandbox` passed: 5 tests.
- `CODEX_LIVE_FP=1 npm run test:live:uat` passed: 2 tests, 53448.786ms.
- `CODEX_LIVE_FP=1 npm run test:live` passed: 1 test, 153622.118375ms.
- `git diff --check` passed.

Open B-016 closure bar:

- migrate or explicitly retire each classified-only hook-family row through a
  boundary ticket
- prove per-family runtime consumer usage where the family remains executable
- keep projection consumers and declaration refs read-only/declarative
- preserve the rule that no downstream tenant owns traversal selection,
  iteration, event authority, graph-function closure, retry policy, or
  continuation law

Superseded closure comment:

- `.ai-workspace/comments/codex/20260426T111002Z_CLOSURE_b016_typescript_ioc_hook_standardization.md`

## Superseded Completion Record

This ticket closes by decomposition.

The original umbrella concern was real, but it no longer exists as one lawful
undifferentiated refactor. Its high-risk slices were pulled into narrower
completed tickets:

- `B-014` typed fulfillment assessment carrier law
- `B-015` generic fulfillment truth reference and resolution
- `B-017` certification over target truth rather than evaluator-name
  coincidence
- `B-024` published asset registry and ownership surface
- `B-029` continuation-owned public projection truth
- `T-025` TypeScript public asset addressing
- `T-026` TypeScript transport and result-artifact protocol
- `T-027` tenant-local common realization library
- `T-028` tenant-local common delivery library

Current consequence:

- the remaining hook families must now be reviewed and reopened only as
  boundary-local tickets
- no single backlog item should reassert the entire substrate-wide IoC
  standardization problem without a new hook inventory and decomposition pass

Future re-entry rule:

- if a new ABG hook appears without a clear `Ref` / `Contract` / `Resolver` or
  `Provider` / `Consumer` shape, open a new narrow ticket at the owning
  boundary instead of reopening this umbrella
