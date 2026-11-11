# M03 Runtime Graph Function Registry First-Slice IACS

**Ticket**: T-177
**Status**: Active design
**Date**: 2026-06-30

## Irreducible Architectural Carrier Set

| Carrier family | Owner | Prime status | Admission/write path | Consumers |
| --- | --- | --- | --- | --- |
| `GtlLibraryEntryDeclaration` | GTL | Prime declaration | Declared in system or product library inventory | registry admission |
| `ProductRegistryStartupConfig` | downstream product/install, consumed by ABG | Subordinate input | Authored as product startup config, never emitted as registry truth | ABG startup admission |
| `RegistryEntryAdmission` | ABG runtime | Prime runtime fact | ABG admission emits accepted or rejected registry-entry truth | registry projection |
| `RuntimeRegistryProjection` | ABG projection | Prime read model | Replay over registry admission events | lookup, selection, proof |
| `RegistryLookupRequest` | ABG query/API | Subordinate input | Parsed at lookup ingress | lookup transform |
| `RegistryLookupResult` | ABG query/API | Prime query result | Pure transform over registry projection and current context | consumers, selector |
| `CandidateEligibilityDecision` | ABG F_D | Subordinate row | Derived during lookup/selection | lookup result, diagnostics |
| `PluginSelectionAdvice` | plugin provider, admitted by ABG | Subordinate payload | Product/system plugin returns proposed advice; ABG admits payload | selector |
| `GraphFunctionSelectedEvent` | ABG runtime | Prime runtime fact | ABG emits when traversal is affected | runner invocation, replay |
| `RegistrySelectionAuditProjection` | ABG projection | Subordinate read model | Replay over lookup/advice/selection facts | proof, downstream read models |

## Carrier Consolidation

The registry needs one runtime truth stream and one projection. It does not need
a second product-local registry carrier, a mutable service registry object, or a
parallel plugin-owned selection ledger.

`PluginSelectionAdvice` is subordinate because it is not owning truth. It is an
admitted payload that may influence ABG selection only after F_D validation
against `RegistryLookupResult`.

`RegistryLookupRequest` is subordinate because it is ingress shape. It does not
persist as truth unless ABG chooses to emit an audit event. The source of
candidate truth remains `RuntimeRegistryProjection`.

## Boundary Matrix

| Boundary | May do | Shall not do |
| --- | --- | --- |
| GTL declaration | Declare system/product library entries, candidate families, public starts, plugin contracts, refinement/override claims | Admit runtime truth, select traversal, invoke graph functions |
| Product startup config | Name product libraries, overlays, plugins, namespace/version pins, proof/readiness refs, and policy refs for ABG startup consideration | Admit runtime truth, project registry truth, select traversal, invoke graph functions, or bypass GTL declarations |
| ABG startup | Consume system declarations, product GTL declarations, and product startup config through `runEngineStart` / `start -> iterate`; emit registry admission events before registry lookup affects traversal | Let downstream startup code load a product-local registry or preselect the next graph function |
| ABG admission | Validate declarations, provenance, namespace, proof readiness, override law, and emit admission/rejection truth | Infer product domain policy not declared through GTL |
| Registry projection | Replay entry truth into queryable status | Create entries not backed by admission events |
| Lookup query | Return eligible candidates and diagnostics | Emit traversal truth or choose by itself |
| Product plugin | Return advice, ranking, constraints, and rationale over ABG-provided candidate view | Call graph functions, mutate registry, emit events, select traversal, close, continue, re-enter |
| ABG selector | Validate advice, apply F_D eligibility, apply admitted F_P/F_H advice where lawful, emit selection | Trust raw advice or select a candidate absent from registry projection |
| Runner invocation | Invoke selected graph function after emitted selection truth; fail closed before `graph_call_opened` when registry startup has no admitted entry for the execution basis | Invoke from plugin advice alone or from registry startup config without replay-derived selection |

## Product-Plugin-Assisted Selection IACS

Product-plugin-assisted selection is lawful only if the plugin is already a
registered product-library capability and ABG invokes it through an admitted
plugin contract.

The plugin input contains:

- selected composition identity;
- current traversal or consequence basis;
- immutable `RegistryLookupResult`;
- candidate eligibility diagnostics;
- policy refs admitted by ABG;
- downstream product namespace;
- proof-readiness refs.

The plugin output contains:

- candidate advice refs;
- ranked candidate refs when ranking is requested;
- constraints or exclusions;
- rationale payload refs;
- residual or policy notes as non-authoritative data;
- no event-emission, invocation, closure, continuation, re-entry, registry
  mutation, or selection fields.

ABG admits the output before it can affect selection. Advice for an ineligible,
unknown, stale, wrong-interface, unlawful-shadow, or proof-not-ready candidate
is rejected.

## Non-Closure Conditions

- `catalogGraphFunctionRefs` is used as the registry projection.
- Product-library entries are loaded from local files without GTL declaration
  and ABG admission.
- Product startup config creates registry truth, selection truth, or invocation
  authority without ABG startup admission.
- Registry startup is driven by downstream product code instead of ABG
  `runEngineStart` / `start -> iterate`.
- A downstream startup shell, file scanner, registry loader, event appender,
  local replay projection, or selected-function dispatcher makes product graph
  functions, overlays, or GTL bindings visible outside ABG startup admission.
- A product plugin can call the next graph function.
- A plugin advice payload can name a candidate not present in
  `RuntimeRegistryProjection` and still select it.
- Lookup emits selection truth.
- Selection occurs without a `GraphFunctionSelectedEvent`.
- F_P or F_H ranking bypasses deterministic eligibility.
- System-library entries can be shadowed by product libraries without explicit
  refinement or override law and accepted eligibility proof.
- Registry admission or selection introduces odd_glc, odd_sdlc, software test,
  build, release, JavaScript, Rust, HTTP, or service semantics as ABG-owned
  policy.

## First-Slice Proof Expectations

- Positive proof: a system entry and product entry are admitted, projected,
  queried, and selected through ABG.
- Positive proof: product-plugin advice changes the selected candidate only
  after ABG admits the advice and validates the advised candidate.
- Negative proof: product-plugin advice cannot select an ineligible candidate.
- Negative proof: product-plugin advice cannot call or invoke a graph function.
- Negative proof: public query returns candidates without emitting selection.
- Negative proof: product-library shadow of a system entry fails without
  explicit override/refinement law.
