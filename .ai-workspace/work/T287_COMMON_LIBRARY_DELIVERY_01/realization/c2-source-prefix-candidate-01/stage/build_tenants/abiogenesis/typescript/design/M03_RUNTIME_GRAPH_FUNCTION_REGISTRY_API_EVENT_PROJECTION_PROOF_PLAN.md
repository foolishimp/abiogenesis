# M03 Runtime Graph Function Registry API, Event, Projection, And Proof Plan

**Ticket**: T-177
**Status**: Active design
**Date**: 2026-06-30

## API Boundary

| API family | Visibility | Purpose | Authority |
| --- | --- | --- | --- |
| GTL library declaration constructors | downstream-public declaration | Declare system/product library entries, plugin contracts, candidate families, public starts, and override/refinement claims | No runtime authority |
| Product registry startup config | downstream-authored input consumed by ABG startup | Name enabled product libraries, namespace/owner/version pins, overlays, plugins, proof/readiness refs, and policy refs for ABG consideration | No runtime authority |
| ABG registry startup admission | ABG-runtime-internal start extension | Consume system library declarations, product GTL declarations, and product startup config during `runEngineStart` / `start -> iterate` startup | Emits registry-entry events and seeds replay projection |
| Registry admission | ABG-runtime-internal | Admit or reject GTL library entries into registry truth | Emits registry-entry events |
| Registry projection | ABG projection with public query facade | Replay registry admission truth into lookup-ready state | Read-only |
| Registry lookup | downstream-public read-only query | Return lawful candidates and exclusion diagnostics for a situation | No selection authority |
| Plugin advice invocation | ABG-runtime-internal | Invoke declared plugin over immutable candidate view when policy calls for advice | Produces raw proposed payload |
| Plugin advice admission | ABG-runtime-internal | Admit or reject plugin advice under result-interface and payload law | Emits/adopts admitted advice fact |
| Registry selection | ABG-runtime-internal | Choose traversal-affecting candidate after F_D eligibility and admitted advice | Emits selection event |
| Graph-function invocation | ABG-runtime-internal runner path | Invoke selected graph function | Requires prior selection event when registry-driven |

## Public Facade Rule

Downstream-public surfaces may:

- declare library entries through GTL;
- provide product-authored startup config as ABG startup input;
- query registry projection;
- read selection/projection facts;
- interpret admitted facts in product read models.

Downstream-public surfaces shall not expose:

- startup registry admission authority;
- registry admission emitters;
- plugin advice admission;
- registry selection emitters;
- graph-function invocation over raw plugin advice;
- product-local startup shells, registry loaders, event appenders, replay
  projections, or selected-function dispatchers;
- mutable registry state.

## Event Families

| Event family | Emitted by | Required fields |
| --- | --- | --- |
| `registry_entry_admitted` | ABG admission | entry ref, declaration digest, library scope, namespace, owner, version, entry kind, outer contract, provenance, proof readiness, source event ref |
| `registry_entry_rejected` | ABG admission | declaration digest, rejection reason, conflicting entry refs when present, missing proof or authority refs |
| `registry_plugin_advice_admitted` | ABG payload/advice admission | advice ref, plugin ref, selected composition ref, lookup result ref, candidate refs, rationale payload ref, digest |
| `registry_plugin_advice_rejected` | ABG payload/advice admission | plugin ref, lookup result ref, rejection reason, invalid candidate refs, authority violation flags |
| `graph_function_selected` | ABG selector | selected entry ref, lookup result ref, eligibility decision refs, admitted advice refs when present, F_H response refs when present, selection rationale, runtime basis |
| `graph_function_selection_rejected` | ABG selector | lookup result ref, rejection reason, rejected candidate refs, pressure or block disposition refs |

Exact event spellings are HOW binding details. The semantic split is fixed:
admission events create registry truth; lookup is read-only; selection events
create traversal-affecting truth.

## Projection Rules

1. `RuntimeRegistryProjection` replays only registry admission/rejection events.
2. Replaced, stale, revoked, or superseded entries are target lifecycle states
   that require future event-sourced retirement/revocation/supersession truth.
   Slice 1 records this as a lifecycle gap and shall not claim active
   retirement semantics.
3. Product entries are indexed under product namespace and owner.
4. System entries are indexed under GTL/ABG namespace and cannot be shadowed by
   product entries without accepted override/refinement law.
5. Lookup joins current traversal situation with registry projection, policy
   refs, proof readiness, interface compatibility, and source/target contracts.
6. Lookup may return zero, one, or many eligible candidates.
7. Query results do not create events unless an explicit audit path is added.
8. Selection projection replays selection events and admitted advice facts; it
   does not recompute a different selected candidate.

## Eligibility Filter

F_D eligibility shall check at least:

- candidate identity;
- entry kind;
- interface;
- source contract;
- target contract;
- context;
- authority;
- overlay;
- namespace;
- version;
- provenance;
- readiness;
- proof;
- policy constraints.

These fields bind directly to
`REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-020`. The TypeScript HOW may add
subordinate checks such as entry kind, current status, graph-function or
graph-vector boundary, candidate-family membership, public-start binding,
selected composition compatibility, override/refinement law, and
product/system shadow constraints. Those subordinate checks do not replace the
13 required eligibility fields.

| Required field | First-slice check |
| --- | --- |
| candidate identity | candidate ref exists in `RuntimeRegistryProjection` and is current |
| entry kind | candidate registry entry kind matches the lookup kind, so graph-function selection cannot accidentally consume overlay, public-start, candidate-family, or plugin entries |
| interface | candidate outer interface matches the lookup interface contract |
| source contract | candidate source carrier contract accepts the lookup source contract |
| target contract | candidate target carrier contract satisfies the lookup target contract |
| context | candidate context requirements are satisfied by lookup context refs |
| authority | candidate authority regime is allowed by lookup authority refs |
| overlay | candidate overlay requirements match lookup overlay refs |
| namespace | candidate namespace is system-owned or product-owned as declared |
| version | candidate version is current or accepted by lookup version policy |
| provenance | candidate provenance refs and declaration digest are admitted |
| readiness | candidate readiness state is eligible for runtime selection |
| proof | candidate proof refs meet the lookup proof gate |
| policy constraints | candidate policy refs satisfy deterministic policy filters |

F_P or F_H advice may rank or choose only inside the eligible set.

## Product-Plugin Advice Contract

A product plugin receives an immutable candidate view. It may return:

- preferred candidate ref;
- ranked candidate refs;
- exclusion advice;
- lifecycle, consequence, or policy rationale;
- confidence or ambiguity notes;
- product namespace and policy refs.

It shall not return authority fields for:

- event emission;
- registry mutation;
- graph-call invocation;
- vector selection;
- traversal transition;
- continuation;
- re-entry;
- closure.

ABG admission rejects advice that contains authority fields or names a
candidate outside the eligible set.

## Proof Plan

### Positive Proofs

1. Admit a system-library graph-function entry and project it into the registry.
2. Admit a product-library graph-function entry and project it under product
   namespace.
3. Startup admission admits system declarations before product declarations so
   product shadow checks run against already-admitted system truth.
4. Startup admission is ABG-driven: product config and product GTL definitions
   are consumed by ABG startup and cannot admit, project, select, or invoke by
   themselves.
5. Lookup returns both entries when both are lawful for a situation.
6. Entry-kind filtering keeps graph-function, overlay, public-start,
   candidate-family, and plugin entries disambiguated before selection.
7. Public-start / `runEngineStart` consumes registry startup input, replay
   projects registry entries, emits `graph_function_selected`, and only then
   emits traversal effects such as `graph_call_opened`.
8. Product-plugin-assisted selection changes the selected candidate only after
   ABG admits plugin advice and validates the advised candidate.
9. Invocation requires a matching `graph_function_selected` event for the
   runtime basis and graph function; invocation without selection truth shall
   fail closed.
10. Registry-enabled public start fails closed before `graph_call_opened` when
    no admitted graph-function entry matches the execution basis.
11. Replay-roundtrip identity: tear down the registry projection, rebuild it
   from the event log, and assert identity-equivalent lookup results.
12. ABG may decline admitted eligible advice and select a different eligible
   candidate under deterministic guard.
13. Accept-branch override proof: a lawful `overrideOfEntryRef` product entry
   admits and becomes eligible.
14. Accept-branch refinement proof: a lawful `refinementOfEntryRef` product
    entry admits and becomes eligible.

### Negative Proofs

1. `catalogGraphFunctionRefs` cannot satisfy registry projection input.
2. A product-local JSON/file list cannot become registry truth.
3. Public lookup cannot emit selection truth.
4. A product plugin cannot call the next graph function.
5. A product plugin cannot select a candidate by raw return value.
6. Advice naming an unknown, stale, wrong-interface, proof-not-ready, or
   ineligible candidate is rejected.
7. A product entry shadowing a system entry is rejected without explicit
   refinement/override law and accepted eligibility proof.
8. F_P or F_H advice cannot bypass F_D eligibility.
9. Downstream facades do not export admission or selection emitters.
10. Eligibility proof covers each required field independently:
    candidate identity, entry kind, interface, source contract, target
    contract, context, authority, overlay, namespace, version, provenance,
    readiness, proof, and policy constraints.
11. Downstream shell proof: a product-authored startup shell, file scanner,
    registry loader, local replay projection, event appender, or direct
    dispatcher cannot make graph functions, overlays, or GTL bindings visible
    as registry truth.

## Module Lifecycle Checklist

The checklist is a local T-177 design gate conforming to `SPEC_METHOD.md`
operational lifecycle chain and DMM module lifecycle confirmation. Each
surface either answers the phase or records a named `Gap:` / `Unanswered:`
item. A phase list without answers is not design evidence.

| Surface | Intent | Requirement | Build | Assurance | Release | Deployment | Live usage | Observed telemetry | Retirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GTL library declaration | Publish lawful system/product capability declarations. | REQ-L-GTL3 language capability and selection boundary. | Public GTL constructor and type. | Typecheck plus ABG admission proof. | Ships on GTL public package surface. | Loaded during startup admission. | Source input only; no runtime authority. | Admission/rejection facts expose declaration outcome. | Gap: no entry retirement event in slice 1. |
| Product registry startup config | Provide product-authored config for ABG startup consideration. | Product config is input, not authority. | Downstream-authored config carrier consumed by ABG. | Negative proof that config alone cannot create registry truth or selection. | Ships with downstream product/install. | ABG startup reads it with GTL declarations. | Constrains what ABG considers; never admits or invokes. | ABG admission/selection events reveal accepted effects. | N-A-with-reason: config is replaced by release/install updates, not retired as runtime truth. |
| Registry admission | Convert declarations into admitted or rejected registry truth. | ABG owns admission and event truth. | ABG internal command. | Positive admit and shadow rejection proofs. | Internal runtime surface only. | Runs during startup admission and governed updates. | Emits registry-entry facts. | Replay projection reports accepted/rejected entries. | Gap: no registry_entry_retired / registry_entry_revoked / registry_entry_superseded path. |
| Registry projection and lookup | Provide lawful candidates and diagnostics. | Projection is replay-derived; lookup is read-only. | Runtime projection plus query input/result. | Replay-roundtrip identity and 13-field eligibility proofs. | Query facade may be public; emitters stay internal. | Available after startup replay. | Returns candidates; creates no selection truth. | Lookup diagnostics show exclusion causes. | Gap: stale/superseded status requires future event truth. |
| Product plugin advice | Let product policy advise over immutable candidate view. | Advice is payload, not authority. | Public proposal constructor plus ABG admission. | Authority-bearing and ineligible advice rejection proofs. | Proposal shape is public; admission is internal. | ABG invokes plugin when policy calls for advice. | Produces proposed ranking/rationale only. | Advice admission/rejection events record result. | N-A-with-reason: plugin advice is per-lookup payload, not durable registry entry. |
| Registry selection and invocation | Create traversal-affecting selection truth and gate invocation. | ABG emits selection before invocation. | ABG internal selector and invocation guard. | graph_function_selected gating, advice-decline, and rejection proofs. | Internal runtime surface only. | Runner consumes emitted selection truth. | Selection truth gates invocation. | Selection/rejection events expose basis and rationale. | N-A-with-reason: selection events remain historical runtime facts. |

## Lifecycle Checklist Finding

The first checklist finding is a real gap: T-177 defines admission, rejection,
lookup, advice admission, and selection, but it does not yet define
`registry_entry_retired`, `registry_entry_revoked`, or
`registry_entry_superseded`. Gap: registry entry retirement/supersession needs
an event-sourced path before the registry can claim active replacement,
revocation, stale-entry exclusion, or supersession behavior as live semantics.

## First Implementation Cut

The first implementation cut should target a small, non-domain-specific proof:

```text
system library entry: generic ABG graph function
product library entry: product-specialized graph function with distinct outer contract
product plugin: consequence advice plugin over immutable candidate view
ABG selector: validates advice, emits selection, then invokes selected entry
```

The scenario may use odd_glc as the downstream witness, but the registry design
shall not encode lifecycle, SDLC, test, build, release, JavaScript, Rust, HTTP,
or service semantics as ABG-owned policy.
