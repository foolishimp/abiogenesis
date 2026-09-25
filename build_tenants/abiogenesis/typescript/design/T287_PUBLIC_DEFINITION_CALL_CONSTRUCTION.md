# Installed Public DefinitionCall construction

T-287 PUBLICCALL01 refines the existing S06/native SDK realization. Product
`SDK And CLI` and `ABG5-S06`, and REQ-P-PUBLIC-CONTRACTS-009/010 retain semantic
authority. The fifteen Product families and exact operation/definition family
are unchanged.

`@abiogenesis/typescript-tenant/public` exports
`constructInstalledPublicDefinitionCall` and its typed explicit input. It is
deterministic construction of an invocation candidate, not runtime admission
or execution. The implementation moves from test support into the Public owner;
test support re-exports that function by the public package specifier.

The caller supplies the installed Product canonical JSON/hash functions,
installed Public family/projections, verified definition coordinates, exact
contract catalog, operation/member selection, request, authority slots,
resource assertion, refs, event time and provenance. There are no implicit
selection defaults. Product verification remains the source of coordinates;
this helper is not a substitute for verification.

The constructor selects one exact definition/operation/member, checks slot
catalog, operation, version, selector, key, slot and definition ref against the
installed owner projection, then preserves the supplied coordinates. It hashes
the same authority, request and invocation preimages as the predecessor helper
and derives the same invocation ref. Request, slots and resources retain their
identity. Provenance is copied and frozen; construction does not deep-freeze
caller values or acquire resources.

Transport and the exact selected owners retain complete raw contract and
semantic admission. Construction does not admit capabilities, request meaning,
resource assertions, runtime events or outcomes. GTL declares; HoG traverses;
ABG admits. Existing transport and CLI receive the same DefinitionCall envelope.
No Public operation, schema, event, binding, controller or family is introduced.

Compatibility evidence compares the predecessor and exported constructor on
the same existing ordinary envelopes and malformed coordinate cases. It proves
only construction equality and preserved refusal boundaries. Installed native
execution, downstream lifecycle usability and release qualification remain
separate Executive-owned compositions.

For the shared native Run/GraphCall reads, the invocation's catalog and
request/result/refusal coordinates name the current executing Product. The
owner binds that catalog and operation row to its own package-relative
manifest using existing Product parsing and canonical identity. This bounded
immutable metadata read is not package re-verification or a new authority.

The authority slots instead select the historical source WorkspaceBinding,
ProductSet, lock and read grants. The owner obtains them from the authenticated prefix, validates the applicable
admission and operation relations below, and requires the selected source to
have that exact binding. Its original Program/GraphFunction and historical declaration
proof remain unchanged. The source grant's historical catalog need not equal
the current reader's catalog; neither catalog substitutes for the other.
Current exact ingress, supported event/profile/language admission, source
digest/currentness, typed absence/refusal and no-append closure remain binding.

## Admission boundary and established internal values

T287/LIFE-01 selects this `design_reframe` with contained
`realization_refactor` increments under unchanged Product
[Definition, Tool, And Runtime Authority](../../../../specification/PRODUCT.md#definition-tool-and-runtime-authority),
[INSTALL043–057](../../../../specification/requirements/product/REQ-P-INSTALL.md)
and the Public contracts cited above. This HOW owns the reuse boundary; the
[ticket checklist](../../../../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#admission-boundary-execution-checklist)
owns sequencing and acceptance status.

The path is **external/raw input → owning admission → established typed internal
values → additional operation-owned relations/currentness → admitted change**.
An owner establishes only the facts within its contract. Same-process origin,
`F_D`, a TypeScript cast, matching digest or successful construction does not
admit a value or authorize an effect. A structurally admitted wire result does
not thereby satisfy a target contract or substantive judgment.

| Boundary | Checks retained by the existing owner | Work reusable after those checks |
|---|---|---|
| Supplied Product, lock and declarations | Exact bytes, identities, schemas, dependency/contract linkage and provenance; installed physical correspondence where required | The unchanged verified body, resolved linkage and validated lock inside their lawful owner scope; a later operation checks its membership/selection and actual physical currentness rather than rebuilding the same body |
| Raw Public/serialized request | Selected definition/contract, structural schema, supplied authority, request/resource correspondence and permissions | Established immutable constituents across native calls; detach mutable caller input without first copying an unchanged verified body merely to restore it |
| Proposed runtime change | Authentic current predecessor, exact call/Run/binding, authority, additional semantic relation and lawful transition; preserve refusal precedence | Existing live derived state and candidate delta; refusal leaves the accepted predecessor unchanged |
| Raw `F_P` output and subsequent use | Schema and call/attempt/input/contract correspondence; eligible references and evidence; authority/currentness, substantive judgment and lawful transition | The actual checked result and established facts, scoped to the exact result/basis; a downstream owner still judges every additional relation it owns |
| Ordinary query and genuine recovery | Exact requested source/prefix, current read authority, typed absence/refusal and resource ownership | Live projections for queries against that owned state; cold acquisition/recovery reconstructs equivalent facts from the log and immutable inputs |

Reuse follows actual owner-established values and their exact basis, not a new
registry, cache, controller, trust token or required process-local semantic
authority. Serialized/reacquired data crosses its ordinary admission boundary;
a cast cannot replace it. A changed subject, contract, dependency, prefix or
physical observation requires the corresponding owner check. Prior immutable
facts remain historical facts; reuse does not make an old permission, witness
or worksite observation current. Existing physical resource lifetime ownership
continues to govern borrowing, successor selection, append and genuine close.

There is one authoritative event log and one live derived state for its active
owner. Candidate validation consumes that predecessor without discarding its
derivation; append advances the same owner state. Rollback, truncation,
reappend, immutable prior prefixes and refusal isolation remain binding.
Recovery reconstructs; a handoff or query within the live lifetime is not itself
a reason to reconstruct history. No competing persistent state is introduced.

The [catalog owner](T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN.md) continues
to return plain immutable derived construction: equal complete bases produce
equal results, independently of process identity. Catalog reuse grants neither
execution authority nor a runtime lifecycle. The existing
[F_P admission design](M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md) retains wire,
target and judgment separation; checked-result reuse cannot promote unjudged
actor output, broaden evidence eligibility or replace independent assessment.
Public carrier/receipt changes re-enter their exact owning contracts together
with their callers; this model does not silently relax an existing schema.

### Conformance Definition resource receipt

`conformance.evaluate/gtl_program` preserves its complete semantic result and
refusal algebra. Its read-only `DefinitionReturn.resources` is a
`ConformanceEvaluationResourceReceipt`: existing invocation, request and
capability-grant coordinates, not an echo of the packet, declared inventory or
catalog. The admitted grants already bind the exact approved resource scope;
this receipt adds no admission authority. Host exit/failure and invocation
association remain unchanged. Real event-resource completions from effect
owners remain their existing handoffs; this read-only receipt invents none.
Historical full resource receipts retain their original bytes and meaning.

Within this conformance call, the owner reconstructs the declaration basis and
resolves its exact Program closure once. Its internal validation continuation
consumes that actual closure, while preserving packet/publication correspondence,
raw declaration admission and `validateProgram`. The raw catalog/conformance
entries still authenticate a supplied closure against its complete catalog and
view. Equal-body catalog construction, cold/raw readiness and all additional
operation-owned relations remain unchanged; no cross-call catalog authority or
process-identity registry is introduced.
