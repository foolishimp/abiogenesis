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
- change_intent: compress_static_definition_bindings_for_whole_family_constructability
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md#562c-operative-static-definition-binding-algebra
- triaged_at: 2026-08-17
- retriaged_at: 2026-08-21
- migration_strategy: inside_out_hard_break
- library_usage: consume
- governing_library: effect@3.22.1
- selected_method: STDO v2.2.2
- selected_method_commit: 0519129d63de10822ae6353fa0c5ce05d56f13e9
- immutable_reference_product: v4.6.0-rc.5
- selected_wave: W2
- selected_feature: A5-F01
- selected_slice: odd_glc_program_only_sentinel
- selected_slice_stage: whole_family_constructability
- selected_increment: w2_05_static_binding_algebra
- selected_increment_stage: bounded_design_reframe
- accepted_checkpoint: 1f6a86074bf995763b4caff286422b5b1501374b
- banked_callable_checkpoint: e7e252ed7c0f950c49f606e1c0fd8d61743af71a
- deferred_feature: A5-F12

## Outcome

Deliver the fixed ABIogenesis 5.0 Product through five installed feature waves.
Conserve working 4.6 behavior, correct only demonstrated 5.0 deltas, reuse one
common implementation for recurring information-technology structures and
algorithms, and expose one installed Product path.

ABIogenesis is a direct reference-frame evaluator and realization system. This
is the joined Product function, not a new named component: it directly
evaluates and realizes admitted recursive GTL frame declarations and material
relations through one HoG algebraic fold, exact owners, ABG admission, and
Event-Calculus/replay projections. It adds no parser, lowering, intermediate
representation, generated program, reference-frame subsystem, runtime,
catalog, or authority.

This ticket is the detailed delivery backlog beneath GOAL-035. Product,
requirements, and accepted design define meaning. The local realization
constitution defines the reusable implementation constraints. This ticket
does not restate either.

The current goal reprice selects a downstream Product outcome as the Wave 2
closure boundary. It changes no Product, requirement, owner, event, or final
18/56-family meaning.

## Current Wave 2 Target — Program-Only odd_glc Hello

`W2-ODD-GLC-PROGRAM-ONLY-HELLO` is the sole current Wave 2 closure target:

```text
odd_glc immutable GTL Program publication data
  -> installed ABIogenesis 5.0 partial Product
  -> verify -> resolve -> install -> bind
  -> eventless catalog admit -> view
  -> Program start selects the odd_glc-owned GraphFunction
  -> HoG traverses its graph topology through one Effect fold
  -> ABI-owned deterministic Hello leaf implementation
  -> ABG events -> Event Calculus -> result -> fresh replay
```

The odd_glc package supplies exactly one immutable GTL Program publication as
data: its Program record, odd_glc-owned GraphFunction definition and topology,
and only the declarative contracts, policies, overlays, and package metadata
that Program requires. It supplies no executable TypeScript Product-semantics
provider, evaluator, implementation binding, leaf implementation, semantic
implementation, lifecycle interpreter, dispatcher, event writer, raw-event
walker, evidence binder, fold, residualizer, controller, or ABI mechanism. Its current
`abi5_program` provider/leaf/`no_disposition` candidate is superseded
diagnostic evidence and is deleted or excluded rather than adapted.

ABIogenesis owns raw admission, validation, Product verification, resolution,
install, workspace, catalog, the standard Hello contracts/evaluators/leaf
implementation, dependency-closure resolution, HoG traversal, ABG admission/
events/Event Calculus, replay, result projection, SDK, and CLI.

### Generic GraphFunction-library resolution

Current code assumes that a Program and every referenced GraphFunction,
contract, evaluator, and Implementation share one publication/install. That
collapses the Catalog into a publication-local table. Wave 2 restores its
generic law:

```text
installed Product/library GraphFunction publications
  -> one deterministic Catalog
  -> exact GraphFunction identities, definitions, and dependency closure
  -> any admitted Program composition
```

Product/Validator resolves the complete GraphFunction closure through the
exact ready Catalog/View, installed ProductSet, resolved dependency lock,
compatibility, provenance, collision, and ambiguity law. The derived immutable
execution projection carries Program, GraphFunction, contract, evaluator,
customization, fibre, and Implementation owners separately with exact
identities, digests, installs, and dependency edges. It is not another catalog
or authored authority. Refusals are typed as absent, ambiguous, missing
dependency, incompatible/provenance, or owner-binding mismatch.

The odd_glc publication may declare external Product-semantics, contract,
evaluator, binding, and Implementation references as data, but it supplies no
provider for them. The `run.invoke#start` installed owner function resolves the
Program/GraphFunction owner independently from every referenced semantic owner
through the exact Catalog/View, ProductSet, lock, compatibility, and provenance
basis and loads each callable from that owner's exact admitted install.
`ModulePublication.productSemanticsBinding` is therefore an external
owner/binding coordinate rather than a claim that the Program install contains
the provider. `loadInstalledProductSemantics` consumes the resolved binding and
owner install. Public does not call `ProductExecutionResolutionPort.resolve`
and then call the selected owner ports; its one exact installed
`ExactDefinitionCallable` is statically closed over that typed owner relation.
Refusals distinguish absent, ambiguous, and wrong-owner semantic bindings after
the common Catalog parse.

The Catalog supports immutable base GraphFunctions and Implementations bundled
by ABIogenesis/ABG, downstream GraphFunction compositions, compatible
owner-local Implementations/fibres at declared extension points, and explicit
customization overlays/policies. A downstream Product never mutates or
silently overrides a base definition. This sentinel publishes an odd_glc-owned
GraphFunction composition over the catalogued base Hello capability and no
custom executable Implementation.

Public structurally admits the exact run request, selects `run.invoke#start`
and its one exact installed binding, calls that binding once, and projects its
indexed outcome. The installed binding is constructed at module initialization
from direct typed Product, Validator, GTL, HoG, ABG, and Implementation owner
imports. Product/Validator resolves and validates the Catalog closure;
GraphFunction owners supply declarative topology; contract, evaluator, and
customization owners supply their declared relations; primitive base
GraphFunctions resolve to owner-local Implementations; HoG traverses the
resolved closure; and ABG revalidates and admits runtime truth. Public neither
calls those owners separately nor sequences their relations. Executable leaves
remain Implementations/owner ports, not another GraphFunction kind. This adds
no catalog, runtime, execution-basis registry, or downstream adapter.

Consensus is the structural falsifier for this shared architecture. Consensus
is one GraphFunction; its rounds, fan-out, aggregation, dispute recursion,
stop, and escalation are declared composition. ABG may only generically admit
and project it, and HoG may only generically traverse it. Removing the
published Consensus GraphFunction must remove Consensus behavior; no
consensus-specific production branch may remain reachable in ABG, HoG, or
Public. Consensus is not added to this sentinel.

The exact final-form consumer map is:

```text
workspace.create#clean
workspace.open#open
product.verify#verify
product.resolve#resolve
product.install#install
workspace.bind#bind
catalog.admit#admit
catalog.view#allowlist
run.invoke#start
project.read#run_status
project.read#run_result
project.read#run_replay
```

The traced path, not its twelve-key count, governs. ABIogenesis 5.0p packages
the one exact 18-operation/56-key Public family. Wave 2 qualifies only these
twelve consumed definitions; the other rows are outside this wave's evidence
claim, not absent, replaced, stubbed, or routed through another roster. No
partial Public family, second API, or second catalog is created.

### Whole-family package constructability

Before the sentinel executes, every one of the 56 static definition exports
must load from packed bytes with a real owner closure. The installed tarball
contains the entire 18/56 family, every owner module and runtime dependency
required by those closures, and every schema and static catalog row required to
admit the exact keys. Exactly three module-static higher-order combinators build
the closures from imported typed owner functions: the static owner shell,
exact-prefix read specialization, and exact-prefix transition specialization.
A stub, interface-only binding, test callback, per-key semantic wrapper,
runtime registry, source import, or legacy fallback does not count. One
installed mechanical exact-set probe loads and resolves all 56 closures. It
does not invoke their semantics and does not enlarge behavioral qualification
beyond the twelve-key sentinel.

The transport subject is one installed CLI episode chain containing exactly
one `run.invoke#start`. SDK, schema, catalog, and CLI projections receive
mechanical exact-set/equality proof against the same 18/56 contracts. They are
not additional semantic executions and must not issue another start.

Closure runs the immutable odd_glc 0.1/ABIogenesis 4.6.0-rc.3 pair and the
odd_glc 0.2 development candidate/ABIogenesis 5.0p pair independently in clean
processes and workspaces. There is no translation or shared runtime. Both raw
observations are persisted unchanged. The 4.6 observation retains its genuine
subject-execution stdout `Hello, world!\n`; the 5.0 observation retains the
existing typed `hello_world_output` with `message: "Hello World"` inside the
canonical JSON CLI receipt. The comparator reduces them only to:
source-independent installed execution; one top-level start; minimal Hello
operation succeeded; one terminal result; expected version-local greeting;
fresh-process replay agreement; no source/private import; and no legacy
fallback. It may not rewrite either raw observation. Each Product internally
validates its own IDs, digests, events, provenance, Program, and GraphFunction
selection. ABIogenesis 4.6 `converged` versus 5.0 `closed_success` are
version-local evidence. The 5.0 run authenticates selection of the odd_glc-owned
GraphFunction plus the ABI-owned Hello leaf binding; those identities,
punctuation, and transport forms are not cross-version equality fields. Hello
World is steel-thread shorthand, not Product parity.

This target does not claim `SCN-GLC-HELLO-WORLD-MINIMAL`. F_P, requirements,
instruction assembly, evidence binding, assurance fold, residuals, lifecycle
disposition, retry, continuation, fan-out, service, data mapper, One Surface,
Consensus, and the remaining Public definitions are excluded. Broader odd_glc
tests become later-wave gap discovery and cannot expand Wave 2 retroactively.

Proportional closure contains one installed sunny path, one fresh-process
replay, package/source/private negative census, and seam negatives only for an
absent or ambiguous catalogued GraphFunction/dependency, missing or wrong dependency or
owner, absent/ambiguous/wrong-owner executable binding, and replay divergence.
One installed owner-load probe proves each selected semantic callable was
loaded from its resolved owner install. No exhaustive matrix or broader odd_glc
scenario enters the gate.

The existing native ABI Hello Program, GraphFunction, leaf, judgment, and
canonical JSON CLI receipt are retained unchanged. No new formatter, base
operator, or output mode is required.

D17/D18 is checkpointed at
`e4a9be06b89fbbc733bff6cd1b08c8fec9cd76ac`. The accepted Wave 2 plan is
checkpointed at `4b9dfabd53f6c58b4a0af7062d4730f3491f5f08`. Neither checkpoint reopens
Wave 1.

### Current construction sequence

Functional story points use the Fibonacci scale `1, 2, 3, 5, 8, 13`. They
estimate relative Product-integration complexity, including the proof required
to accept that function, not duration. A separate evidence, review, or
disposition row carries `0` delivery points so ceremony cannot inflate Product
progress. Points are earned only when the line's exact functional exit is
accepted; work in progress earns zero partial points. Elapsed time, tests, or
percentage estimates cannot substitute for the exit.

| Line | Construction outcome | Story points | State | Started | Accepted/completion boundary |
|---|---|---:|---|---|---|
| `W2-01` | Checkpoint reviewed D17/D18 and the accepted Wave 2 plan without changing their function chains. | 3 | Complete | 2026-08-16 22:03 AEST | D17/D18 `e4a9be06` and plan `4b9dfabd`, completed 2026-08-17 14:45 AEST |
| `W2-02` | Preserve the immutable 4.6.0-rc.3/odd_glc 0.1 observation without synthesizing a fresh receipt when the unchanged historical transports cannot execute. | 0 | Complete | 2026-08-17 14:45 AEST | Immutable observation retained; fresh rerun correctly remained unclaimed on 2026-08-17 |
| `W2-03` | Install one Product execution-resolution relation that resolves the selected Program, GraphFunction, declarations, contracts, semantics, and Implementations through exact admitted owners; remove Public-local joins; prove one cross-owner Hello call. | 8 | Complete | 2026-08-17 15:16 AEST | Frozen at `8e288391`: one installed odd/mini-owned Program and GraphFunction selects the ABI-owned Hello leaf and returns the typed result without a rival selector or runtime |
| `W2-04` | Freeze W2-A and obtain one cold Max code-path review, with at most one bounded repair. | 0 | Complete | 2026-08-17 | The frozen W2-03 boundary cleared entry to bounded W2-05 owner-binding construction; this row makes no W2-05 acceptance claim |
| `W2-05` | Construct the singular 18/56 static export family from the exact three-combinator binding algebra, package every real owner closure and dependency, mechanically load/resolve all 56 from packed bytes, and exclude the packed legacy family atomically. | 8 | In progress — bounded design reframe | 2026-08-18 | Banked legacy/current behavior and callability is 37/56 at `e7e252ed` (35 active plus two refusal-only release snapshots); Section 5.6.2C conformance is 0/56 pending reconciliation or proof; 19/56 remain absent/non-callable; `release_evidence` is held on its authenticated originating-request/owner-outcome/publication-receipt relation and both snapshots are held on separate future result/refusal/resource/receipt contracts; rejected dirty five-interaction attempt excluded; exact base `1e4cbbbd` is invalidated by its receipt-less post-append/post-owner fault carrier; the two continuation definitions are design-closed by Constitution 16.12 but remain non-callable; exit requires the receipt-indexed fault ABI, one shared cross-family definition/grant authority composition with no family-local copies, the one shared `RunContinuation` kernel/two fixed leaves, the separate future-capable `published_rc` and `tapped_release` result/refusal/resource/receipt contracts with refusal-only Wave 2 behavior and Wave-5 publication authority, 56/56 packed loadability, projection equality, and legacy exclusion |
| `W2-06` | Pack odd_glc 0.2 as one immutable data-only GTL Program publication with no executable or ABI authority. | 5 | Pending `W2-05` | - | Package census and installed admission prove data-only ownership |
| `W2-07` | Execute the traced twelve definitions through one installed CLI episode chain with one start, then reopen and replay from a fresh process. | 8 | Pending `W2-06` | - | Typed Hello result, exact owner evidence, prefix continuity, and byte-stable replay projection |
| `W2-08` | Compare the immutable version-local observations, freeze exact artifacts and receipts, obtain cold review, and return the candidate for Executive disposition. | 0 | Pending `W2-07` | - | Exact Wave 2 MVP candidate accepted |

Wave 2 totals 32 functional story points. Accepted work is currently 11/32
points. The active W2-05 eight-point line remains unearned until its complete
installed 56/56 exit passes and freezes.

### Detailed W2-05 subplan

The banked legacy/current behavior ledger at commit `e7e252ed` is evidence, not
acceptance of the new binding algebra. It records callable behavior for 37/56
definitions: 35 active definitions and two release snapshots whose exact Wave
2 owner behavior is intentional qualification refusal. Section 5.6.2C
conformance is 0/56 until every one of those bindings is reconciled, migrated,
or receives exact conformance proof. The two callable release snapshots are
also contract-final held because their current success result schemas are
`v.never()` and their bindings use null resource/receipt contracts. The held
release read separately lacks its authenticated origin/outcome/member-receipt
carrier. The dirty five-member interaction closure experiment is rejected
evidence. It remains outside the ledger and does not authorize a partial
transplant.

Accepted design authority `08595af6918196d8d208dfc0c2ff0e91ec8f3b67`
preserves the three-combinator direction. The exact `bf193b3d` implementation
subject is rejected evidence and does not promote its reported 39/56 state.
The accepted behavior ledger remains 37/56, demonstrated 5.6.2C conformance
remains 0/56, and the W2-05 eight-point line remains wholly unearned.

Cold implementation review of exact base
`1e4cbbbd25d9dfba0cf34d4dddcb28dbc6b5a7ee` found one genuine design carrier
gap. A separately durable `run.invoke` append can precede a later pre-open
fault, and `bindStaticOwner` can receive an exact owner receipt before a wider
output/receipt validation fault, but the receipt-unindexed error branch cannot
return the latest exact receipt. Constitution Sections 5.6.2C and 16.10 now
govern that bounded repair. No behavior/conformance count, story point,
operation/key coordinate, owner relation, or later-wave authority changes.

The absent/non-callable 19/56 definitions partition exactly:

| Group | Count | Disposition |
|---|---:|---|
| `run.invoke` bounded repair | 2 | continue the already-authorized receipt-conserving owner-kernel repair and sentinel proof |
| shared-carrier consumers | 9 | result assess 1, witness admit 6, materialize 2; owner mechanics may proceed independently, but binding waits for the shared carrier |
| ratified run-continuation construction | 2 | design-closed as one branch-neutral ABG frontier, one owner-local kernel, two module-static packets, and two irreducible Product decision leaves; both exports remain non-callable until implementation and earn no conformance or point credit |
| interaction E33 | 5 | implement once from one static kernel and five fixed packets after exact choice/evidence/grant/publication carriers exist |
| held Product read | 1 | implement `project.read#release_evidence` through the accepted pure Product `bindStaticOwner` relation over one authenticated originating snapshot invocation/request, its exact same-member owner outcome, and its owner-issued publication receipt; never use an ABG prefix |

Execute in this order:

1. implement the singular
   `DefinitionExecutionFault<K,TResourceReceipt>` ABI, its three closed fault
   boundaries, owner-authored exact receipt validation, lossless canonical-host
   transport, and latest-receipt currentness law;
2. establish exactly three module-static higher-order combinators over direct
   typed owner imports: `bindStaticOwner`, `bindExactPrefixRead`, and
   `bindExactPrefixTransition`; give the static shell each owner's fixed packet,
   owner-authored strict Valibot resource assertion/admitter, and strict receipt
   schema/validator or equivalent typed static contract object; conserve an
   independently admitted exact receipt through any later enclosing
   validation fault;
3. continue both already-authorized `run.invoke` definitions and prove the exact
   twelve-key sentinel route against the existing HoG/ABG child-append
   boundaries, including a latest-prefix exact receipt after a later fault;
4. extend the sole existing `CapabilityGrant` body across the complete 18-
   operation union; separately constrain the two-factor carrier to its six-
   operation/18-key consumer subset; implement exactly one pure immutable-input
   Product definition/grant exact-set resolver with family/catalog identity,
   one ABG immutable-prefix historical projector, their transient exact-equality/
   refusal composition, and the reused held-store/expected-prefix pre-effect
   guard; pass the complete owner-issued family/catalog/verified-artifact and
   direct environment/install bodies, plus complete ABG invocation/grant/event/
   basis bodies; add only the distinct Product materialization candidate/ingress
   relation, and split existing continuation/respond/witness typed ingress from
   its later semantic append with pending-P1 replay, as fixed in Constitution
   5.6.2C; require
   `grantSet == requiredGrantSubset ==` exact
   `MetadataOf<K>.capabilityRefs`, reject every surplus, and add no family-local
   grant or authority body;
5. implement `result.assess#assess` from the shared carrier through pure Product
   judgment and ABG currentness/candidate/admission, then specialize shared E10
   for `assessment_evidence`;
6. bind the six `witness.admit` packets through their one owner kernel;
7. implement E33 once from the shared carrier plus its family-specific pending
   interaction/response/choice/value/evidence/continuation inputs; the five
   exports contain packet selection only;
8. allow the two materialization owner-mechanics regimes to proceed
   independently, but bind neither export before the shared carrier;
9. implement the ratified owner-local `RunContinuation` kernel through
   `bindExactPrefixTransition`: consume Section 16.11 authority and the one
   branch-neutral ABG frontier; bind `current_intent` and `selected_action` from
   two static packets to two irreducible Product decision leaves; preserve
   Section 16.10 receipts across every separately durable child append; and
   delete the legacy Public continuation controller/carriers when both native
   bindings replace it;
10. implement held `release_evidence` through one pure Product
   `bindStaticOwner` origin/outcome/member-receipt relation, projecting
   `not_ready` only from an authentic same-member refusal plus its exact
   no-publication receipt and never from absence or an ABG prefix;
11. independently migrate the `published_rc` and `tapped_release` member
   result identities from `v.never()` and null resources/receipts to their
   separate exact future result/resource/publication-receipt contracts while
   keeping all success construction and effects unreachable and Wave-5-held;
12. prove all 56 static exports load from the packed artifact with real closures,
   all three indexed fault variants and host projections agree with their exact
   schemas, and the legacy Public family is absent; and
13. advance to W2-06, W2-07, and W2-08 only after the release-contract and
   mechanical exits both close.

#### Ratified release-family design re-entry

Constitution Sections 5.6.5 and 16.13 are the complete local authority for
these three held coordinates. They classify `ReleaseCut` and
`ReleaseSnapshotManifest` as immutable release-owner publication/read-model
truth, the two snapshot members as separate artifact effects, and
`release_evidence` as a pure, eventless Product read. Public only transports one
selected callable once. No ABG event, prefix, replay, Event Calculus, registry,
or “latest release” state participates.

| Coordinate | Exact future carrier and currentness | Wave 2 disposition |
|---|---|---|
| `project.read#release_evidence` | one strict `PublishedRcReleaseEvidenceOrigin | TappedReleaseEvidenceOrigin` resource carrying the authenticated originating snapshot invocation/request ref+digest, exact same-member owner outcome, and exact owner-issued member publication receipt; Product verifies equality with requested `release_cut` and `release_snapshot_manifest` through `bindStaticOwner` | owner refusal plus exact `not_published` receipt may project `not_ready`; absence, null receipt, and success projection are unreachable |
| `release.snapshot#published_rc` | distinct `PublishedRcSnapshotResult`, `PublishedRcSnapshotRefusal`, `PublishedRcPublicationResources`, and `PublishedRcPublicationReceipt`; currentness is exact pre-RC basis, law basis, same-basis green non-bypassed verdict, basis-bound prospective RC identity/version, and unchanged qualified bytes | full refusal algebra is exactly `{wrong_subject_kind, basis_mismatch, law_basis_mismatch, verdict_not_green, bypass_nonempty, identity_mismatch, bytes_mismatch, publication_failure}`; Wave 2 reaches exactly the first six, while byte-currentness `bytes_mismatch`, publication-effect `publication_failure`, success construction, committed receipt, and publication are unreachable and Wave-5-held |
| `release.snapshot#tapped_release` | distinct `TappedReleaseSnapshotResult`, `TappedReleaseSnapshotRefusal`, `TappedReleasePublicationResources`, and `TappedReleasePublicationReceipt`; currentness is exact final-tap basis/law/verdict, accepted RC, installed-RC basis and green non-bypassed verdict, typed `FinalTapDelta`, affected-gate vector, requested stable identity, and prospective final bytes | full refusal algebra is exactly the published eight plus `{accepted_rc_mismatch, installed_rc_authorization_missing, final_delta_incomplete, affected_gate_failed}`; Wave 2 reaches exactly the common first six plus accepted-RC, install-authorization, and delta causes, while byte-currentness `bytes_mismatch`, publication-effect `publication_failure`, gate-authorization `affected_gate_failed`, success construction, committed receipt, and publication are unreachable and Wave-5-held |

Both success results retain their existing member/result-contract identities and
strictly carry member kind, immutable release cut, nonempty exact artifacts,
authoritative snapshot manifest, exact qualification authorization, green
disposition, no residuals, and provenance. The tapped authorization additionally
carries accepted-RC, installed-RC, delta, and affected-gate refs/digests. The
current generic `ReleaseEvidenceCoordinate.value: JsonValue` inputs migrate to
exact typed accepted-RC, installed-RC basis/verdict, and `FinalTapDelta`
coordinates. Shared ref/digest, canonicalization, validation, and low-level
artifact primitives may be reused; the two results, resources, receipts, owner
functions, currentness/effect/commit laws, and deep-review units may not be
collapsed into one release kernel with two packets.

Each member publication receipt is its own discriminated union. The
`not_published` arm binds the exact object-keyed admitted invocation and request,
the narrowed same-member refusal, requested cut/manifest, independently nullable
existing member resource fields, empty-or-nonempty exact residue/compensation,
and provenance; its committed cut and manifest are null and its artifact set is
empty. It does not require success-only authorization, qualification,
accepted-RC, installed-RC, delta, gate, or artifact fields. The `committed` arm
instead narrows the outcome to that exact member success, makes both existing
resource members non-null, and fully binds the member qualification/artifact/
currentness relation and the exact corresponding request/result/receipt cut,
artifact, manifest, target, and provenance relations. The live non-generic
`ReleaseSnapshotRefusal` is narrowed by literal member and code aliases;
`AdmittedPublicInvocation<K,R>` receives the exact
`{operationId, memberKey}` object key and JSON-record-compatible member request.
The release-evidence read conserves either exact member receipt unchanged and
cannot mint another release receipt.

The current shared twelve-code refusal schema, member-parameter refusal
constructor, and broad operation-result type are migration inputs, not the
contract-final member admission. Add separate strict
`publishedRcSnapshotRefusalSchema` and `tappedReleaseSnapshotRefusalSchema`
values over the unchanged thirteen refusal fields, literal member keys, and
their exact eight- and twelve-code picklists. Wire each owner packet's
`refusalSchema` to its member schema; keep the existing packet-selected
`admitRuntimeContract` path; and give construction and port outputs exact
member-dependent types. Shared field mechanics are lawful, but a fallback
schema or any signature whose member and code vary independently is not.

Section 16.10 applies without specialization: before receipt issuance/commit a
substrate fault is `pre_acquisition_or_pre_append` with null receipt; after a
commit it is `post_append` with the exact latest member receipt; after that
receipt is admitted, an enclosing output/receipt/projection validation fault is
`post_owner_output_or_receipt_validation` with the identical receipt. Expected
release refusal stays in `OwnerSemanticOutput` and returns its exact
no-publication receipt. No rollback, store/directory scan, synthesis, generic
receipt, side channel, or refusal/fault relabel is lawful.

The implementation cut replaces each generated `{not:{}}`/`v.never()` result
body independently; replaces the shared broad refusal schema and result inputs
with two exact member refusal schemas, member-dependent construction and port
decisions, and owner-packet schema bindings; replaces the two null
resource/receipt binding forms; and adds the release-evidence carrier/binding.
It then regenerates the affected native result and refusal schemas,
source/member/module digests, packet and definition contract digests, result and
refusal JSON schemas, operation-contract/catalog/toolchain rows,
SDK/CLI/documentation/host outcome and fault projections, packed member/export
coordinates, and the complete 56-family digest. All 56 mechanical exact-set,
type/schema, fault-variant, digest, packed-load/projection-equality, and legacy-
exclusion checks rerun. A shared
fault ABI, host, or `bindStaticOwner` change widens invalidation to every
dependent family; member semantic review remains separate for the pure read,
published-RC effect, and tapped-release effect.

Reject the cut for fabricated refusal/success; one shared or cross-member
refusal set; a tapped-only code admitted to `published_rc`; either member
refusal alias treating non-generic `ReleaseSnapshotRefusal` as generic; a
string-key or one-argument `AdmittedPublicInvocation` in either release receipt
alias; missing or mismatched origin, request, outcome, or receipt; a
`not_published` arm that requires success-only fields; untruthful
acquired-resource/residue facts; null/generic/stale/synthesized receipt; cross-
release source/cut/manifest/basis/result/receipt; loss or replacement of the
exact receipt after commit or output/receipt validation; ABG-prefix currentness;
RC/tap or installed-RC-verdict relabel; incomplete delta; omitted affected-gate
rerun; source/private fallback; `v.never()` cast/fixture/bypass; Wave 2
publication; or another release result, cut, manifest, evidence model, AF-25
owner, registry, ledger, store, service, event fold, runtime, or framework.



Dependency-safe parallel execution is allowed only under this operative law.
Every lane binds the tuple `{exact base commit, exact base tree, digests of every
consumed interface, exactly one equivalence seam, exclusive writable paths}`.
The numbered order above controls dependency, acceptance, and merge priority;
it is not blanket execution serialization. Only lanes with disjoint paths,
seams, dependency edges, and Constitution 5.6.5A invalidation cones may execute
concurrently.

The following are single-writer surfaces: shared fault ABI/validator/canonical
host/all three combinators; the sole `CapabilityGrant`, Product resolver, ABG
historical projector, and transient composition/refusal mapper;
`materializeContextBootstrap`, `materializeConfiguration`, and
`persistManifest`; the `run.invoke` owner kernel and two packets; and every
generated/index/schema/manifest/Public integration, packed-export integration,
and legacy-deletion surface. Overlapping paths, seams, dependencies, or
invalidation cones cannot run concurrently. Before the shared carrier freezes,
run and materialization lanes may change owner-local mechanics only and may not
bind exports or edit shared authority/integration surfaces. Any upstream byte or
interface change stops dependents; they must rebase to the new exact commit/tree
and renew all consumed-interface digests before resuming.

Parallel reviewers use frozen bytes and disjoint equivalence units. A shared-
unit verdict gates its dependents. One final integration review then covers all
joins, the exact 56-coordinate mechanical census, packed resolution/projection
equality, and legacy exclusion. No shared unit has multiple concurrent worker or
verdict owners.

#### W2-05 proportional evidence and review plan

The existing Proof frame owns this plan through Constitution Section 5.6.5A
and activates `SP-05` and `SP-06`. A family shares one deep review only when
every member imports the identical typed owner/kernel callable, uses the same
structural resource/receipt contracts, preserves the same owner output/
nonterminal/refusal algebra, uses the same effect/currentness/commit/handoff/
installed causal-topology regime, preserves the same fault-boundary/exact-
receipt-validation/conservation/host-transport law, contains no member body,
branch, callback, or per-member logic, and differs only in frozen packet
constants. Any failed condition creates another review unit. A review bank
requires byte identity plus unchanged governing contracts.

| Subject | Cold review unit | Exhaustive evidence and invalidation |
|---|---|---|
| exact 18/56 family | no semantic unit by coordinate name | all 56 receive exact-set, type/schema, all-three-fault-variant, digest, manifest/member-coordinate, packed installed-resolution, host-projection-equality, and legacy-exclusion checks; rerun the whole census at freeze |
| singular fault ABI and host transport | once for the common ABI/validator/transport, then once per materially distinct receipt/currentness law | a shared ABI change invalidates every fault producer/consumer, all three combinators, every dependent family seam, and packed SDK/CLI/host schema/projection proof; all 56 mechanical checks rerun |
| three shared combinators | once per changed combinator | verify exact generic/resource/receipt and receipt-conservation law; a change invalidates every dependent family seam |
| shared definition/grant authority | once for the actual Product family/catalog/verified-artifact/PFC-F08A and direct environment/install inputs, complete ABG invocation/grant/event/basis bodies, the distinct materialization candidate/ingress, the pure immutable-input Product exact-set resolver, ABG immutable-prefix historical projector, transient equality/refusal composition, split existing continuation/respond/witness ingress, and reused held-store guard | exercise constructibility without ambient reads, the complete 18-operation grant union, exhaustive 18-key mapping, order permutation, exact no-surplus grant equality, family/catalog/digest binding, source-only P1 replay, cross-prefix history, live held-store mismatch, and closed refusal/fault mapping; a shared change invalidates dependent result, witness, interaction, materialization, and migrated run/continuation seams, but not unchanged combinators or unrelated owner semantics |
| `run.invoke` | one shared owner kernel plus two packets | check both packets and coordinates; a kernel change invalidates the family and touched seams |
| result assessment | one pure Product judgment seam and one ABG currentness/candidate/admission seam; `assessment_evidence` is a separate shared-E10 read seam | invalidate only the result kernel/read specialization, their contracts/exports/projections, and focused falsifiers unless the shared carrier or combinator changed |
| `witness.admit` | one owner kernel plus six packets while the equivalence predicate holds | check all six packets and coordinates; any predicate failure creates a separate unit |
| `run.continue` | one branch-neutral ABG frontier projector and one shared receipt-conserving owner kernel; separate deep review for the irreducible current-intent and selected-action Product leaves; two packet-only mechanical subjects | a frontier/kernel/receipt-contract change invalidates both bindings and their schemas/projections/host receipts; a leaf change invalidates only that branch plus its causal seams; a packet-only change invalidates its coordinate/digest/manifest proof while the other banks remain if byte- and contract-identical |
| `interaction.respond` | one E33 kernel plus five packets | check all five fixed packets and coordinates; a kernel or carrier change invalidates all five seams |
| materializers | shared authority resolution is reviewed once; the two Product packets and physical-effect regimes remain separate where owner, effect, currentness, or commit law is irreducible | keep both artifact effects separate where their actual laws differ; a shared-authority change invalidates both bindings, while an owner/effect/currentness/commit-only change invalidates its corresponding unit |
| `release_evidence` | one pure Product `bindStaticOwner` origin/outcome/member-receipt join | immutable requested cut/manifest currentness, authenticated refusal-to-`not_ready`, no ABG prefix; invalidate its packet/projector/binding/read receipt, both member joins, public projections, and packed equality proof |
| `published_rc` | one pre-RC owner/result/refusal/resource/receipt artifact-effect unit | exact eight-code packet refusal admission, pre-RC basis/law/verdict, prospective identity, and unchanged qualified bytes; invalidate that member's result/refusal/resource/receipt schemas, packet, binding and projections plus release-evidence and downstream RC projections |
| `tapped_release` | one separate final-tap owner/result/refusal/resource/receipt artifact-effect unit | exact twelve-code packet refusal admission, accepted RC, installed-RC basis/green verdict, `FinalTapDelta`, affected gates, and prospective final bytes; invalidate that member's result/refusal/resource/receipt schemas, packet, binding and projections plus release-evidence, final qualification, `ReleasedProduct`, and post-publication proof |
| installed scenarios | once per materially distinct causal topology/effect regime for each frozen W2-05 subject; rerun on that basis at each applicable integrated/final boundary | retain decision-exact local falsifiers for changed seams; never repeat a long test solely because a coordinate name differs |

This is exhaustive mechanical coverage with compressed repeated reasoning. It
is never sampling, reduced assurance, 56 behavioral executions, code
acceptance, or partial story-point acceptance.

No step may introduce a runtime callback, registry, generic controller, mode
selector, universal resource union/topology engine, per-key semantic dispatch,
fourth wrapper/combinator, generic JSON receipt, side channel, rollback,
enclosing transaction, stub, source import, or compatibility fallback. A
missing exact owner or choice/evidence/grant/publication carrier is a bounded
design hold, not permission for Public, a caller, or a fixture to mint
authority. Release work additionally forbids an ABG-prefix read, generic
release result/receipt/kernel, mutable latest pointer, directory/store scan,
early success effect, or duplicate release framework.

### Completed W2-03 function-boundary realization map

This retained map records the completed W2-03 owner chain. It does not override
the operative W2-05 static-binding design below:

1. `product/catalog.ts::admitGraphFunctionCatalog`,
   `buildGraphFunctionCatalog`, `lookupGraphFunctionDefinition`, and
   `narrowGraphFunctionCatalog` construct and select the one ready Catalog/View
   over all installed publications. The repair removes the assumption that a
   Program and every referenced GraphFunction come from one publication.
2. `validator/validation.ts::validateProgram` validates the odd_glc Program and
   its transitive GraphFunction/contract/evaluator dependencies against that
   resolved Catalog closure rather than requiring the raw sets to equal the
   Program publication's local declarations.
3. `product/implementation_resolution.ts::resolveImplementationSet` resolves
   every reachable executable leaf through the selected Catalog row and exact
   owner publication, binding, descriptor, lock edge, compatibility, and
   provenance. It no longer reads GraphFunctions, contracts, or bindings only
   from the Program publication.
4. The planned
   `product/execution_resolution.ts::ProductExecutionResolutionPort.resolve`
   composes those existing pure constructors into the immutable
   owner-separated execution projection. It resolves
   `ModulePublication.productSemanticsBinding` and every other external
   executable reference to an exact owner install before calling
   `product/semantics.ts::loadInstalledProductSemantics`. This is the sole
   Product selection relation; it adds no catalog or registry.
5. The Public `run.invoke#start` path is the thin call: admit the request,
   select its exact installed `ExactDefinitionCallable`, call it once, and
   project the outcome. The static binding closes over the typed Product
   resolution, owner, HoG, and ABG functions and removes same-install threading
   without moving cross-publication selection or owner sequencing into Public.

The deletion boundary is every same-publication lookup and Public-local join
superseded by that Product port, the diagnostic odd_glc provider/evaluator/
binding/leaf candidate, and any packed legacy/fallback path. The native ABI
Hello Program, GraphFunction, leaf, Catalog, HoG fold, ABG event admission,
Event Calculus, replay, and singular 18/56 family are retained.

Stop immediately if the pass requires a second Catalog or roster, a Public
semantic/owner switch, an odd_glc executable, a compatibility adapter, a
source/private import, process-local run/read truth, a stubbed 18/56 binding,
an unresolved or wrong-owner semantic callable, or test-side manufacture of
either raw observation. Missing exact owner meaning or two materially
different lawful architectures returns to F_H.

Structural closure requires the odd_glc package census to contain declarative
GTL publication data only and to contain no executable contract evaluator,
dispatcher, Product-semantics provider, implementation binding, leaf
implementation, event name/writer, raw-event walker, evidence binder, fold,
residualizer, controller, ABI private import, or source-tree dependency. The ABIogenesis
packed path contains no `RootPublicInvocation`, `legacyRequest`, compatibility
translation, fallback, second Public family, or process-local run/read truth.

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

## Mandatory Current Review Preamble

Every Wave 2 worker handoff and review starts from this frame:

```text
Product: fixed ABIogenesis 5.0 scope; Wave 1 complete
Wave 2 sentinel: W2-ODD-GLC-PROGRAM-ONLY-HELLO
odd_glc authority: one immutable GTL Program publication as data, including
  odd_glc-owned GraphFunction topology and required declarative dependencies;
  no executable provider, evaluator, implementation binding, leaf, or interpreter
ABIogenesis authority: all admission, installed Product/catalog mechanics,
  standard Hello implementation, traversal, events, Event Calculus, replay,
  Public, SDK, and CLI
5.0p: source-independent development Product packaging the one exact 18/56
  family; Wave 2 evidence traces only its twelve consumed definitions
prohibited: odd_glc provider or executable implementation, lifecycle
  interpreter, ABI mechanism, legacy fallback, compatibility facade, second
  Public family, source import, or expansion into deferred lifecycle features
```

## Historical C2A Review Preamble

The following preamble governed the prerequisite C2A work. It is retained as
history and does not select the current Wave 2 subject.

Every worker handoff and independent review starts by stating this Product
frame before discussing design or code:

```text
fixed 5.0 features:
  A5-F01..A5-F11 and A5-F13..A5-F17
active wave:
  W2 = A5-F01, A5-F09, A5-F05, A5-F06
selected feature and slice:
  A5-F01 / exact_public_family_construction
  = exact installed Product/catalog basis consumed by one 18-operation/56-key
    Public family, SDK, and CLI
active increment:
  w2_c2a_hog_effect_hard_break
  = directly evaluate admitted CProgramNode through one Effect fold and exact
    owner ports; sever and remove the graph_execute-to-imperative-coordinator
    seam while C1F/D6 carrier work remains held
Product outcome:
  declared recursive GTL frames/material relations
    -> one algebraic HoG evaluation and exact-owner transformation path
    -> ABG-admitted, Event-Calculus/replay-derived truth
    -> exact projections
  admit common envelope -> select exact {operationId, memberKey} definition
    -> call its exact installed direct, statically composed, or projection binding once
    -> project its indexed outcome
source/tool/runtime split:
  Product/Validator = declaration admission and validation
  GTL definition = semantic source
  catalog.admit = pure exact-basis readiness validation and construction
  GraphFunctionCatalog = reconstructible HoG tool/result
  HoG = minimal algebraic evaluator/fold
  Effect 3.22.1 = typed internal composition, suspension, failure/Cause,
    stateless capability provision, and physical resource scope only
  exact Product/GTL/HoG/ABG/Validator/implementation owners = meaning
  ABG event = admitted execution/transformation fact
  Event Calculus/replay = derived execution state and explanation
prohibited in this slice:
  legacy Public carrier/parser/schema, new-to-old translation, Public semantic
  switch, second catalog, process-local runtime truth, string-only executable,
  Public composition, endpoint count treated as primitive count,
  second executable plan/DSL/interpreter/factor registry,
  additive Effect wrapper over an imperative HoG coordinator,
  direct or indirect reachability of completeExecutableTraversal,
  compatibility path, or mutation of accepted Wave 1 interfaces outside the
  explicit D11/D12 additive event-contract re-entry below
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
  -> one Effect fold over the small HoG algebra and exact owner ports
  -> direct F_D | F_P | F_H execution
  -> ABG-admitted events
  -> Event Calculus and deterministic replay
  -> one 18-operation/56-key Public family
  -> installed SDK, CLI, qualification, and release
```

## Wave Backlog

| Wave | Feature families | Exit | State |
|---:|---|---|---|
| W1 | A5-F10, A5-F02, A5-F03, A5-F04 | One event-authoritative installed runtime kernel | Accepted; integrated M5 deferred |
| W2 | Bounded A5-F01/A5-F09/A5-F05/A5-F06 plus an early A5-F17 consumer sentinel | One installed Program-only odd_glc Hello path over exact ABIogenesis 5.0p contracts, owners, events, result, and fresh replay | Active at `W2-ODD-GLC-PROGRAM-ONLY-HELLO` |
| W3 | A5-F14, A5-F07, A5-F08 | Packed Hello World, probabilistic proof, One Surface, and Consensus on the same path | Pending W2 |
| W4 | A5-F13, A5-F17, A5-F11 | Native/host projections, downstream Product, and self-conformance | Pending W3 |
| W5 | A5-F15, A5-F16 | Qualified immutable 5.0 release | Pending W4 |

## Wave 1 Delivery

Wave state separates functional/interface closure from integrated
qualification. A construction row may be implemented and interface-accepted
while its exhaustive scenario or matrix evidence remains qualification-pending.
No pending qualification row may be reported as passed or removed from the
5.0 release obligation. Before `W1-C5`, every Wave 1 row is classified from
live code as `implemented`, `interface_accepted`, or `qualification_pending`;
two sunny-day tests do not infer a row's implementation state.

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

### Wave 1 functional interface closure — historical accepted record

Wave 1 now closes a functional substrate rather than repeating final-product
qualification. The exact interfaces frozen by this boundary are:

- GTL Program, GraphFunction, C-constructor, locus, and validation carriers;
- Product owner ports for deterministic construction, target-result validation,
  and judgment;
- HoG direct-traversal and owner-composition ports;
- ABG actor observation, evidence, result, route, closure, and typed-refusal
  carriers;
- runtime-event identity and payload contracts used by those ports;
- durable-prefix, close/reopen handoff, and expected-prefix transaction
  contracts; and
- Event Calculus, replay, and typed result/currentness projections.

Later work may depend on these interfaces after the frozen candidate is
accepted. It may not change their identity, semantic type, owner, or lifecycle
without an explicit interface re-entry into Wave 1.

The functional proof is exactly two source-blind installed sunny-day
compositions:

```text
S1 scalar
  installed request
    -> exact owner execution
    -> typed scalar result
    -> ABG events
    -> equal fresh-process replay

S2 representative mixed composition
  current typed attached transformation + live F_P
    -> exact F04-A raw-result candidate
    -> Product target validation and judgment
    -> ABG evidence, result, route, and consequence
    -> lawful deferred-application close/reopen where selected
    -> terminal projection and equal fresh-process replay
```

S2 uses the current mixed GTL composition. It does not restore the held-prior
4.6 `attached_transform_result`, `standard_live_review`, parser, or wire-profile
family.

Only three decision-exact negative guards run at this boundary because they
protect defects discovered in the changed coupling code:

1. a same-length durable predecessor mutation refuses before append;
2. a foreign or ambiguous suffix is never truncated as rollback; and
3. substitution of the accepted F04-A candidate or request lineage refuses
   before evidence admission.

Worker readiness is limited to typecheck, syntax and `git diff --check`, one
stable build/package/install, mechanical installed import/load/resolve of the
exact frozen interface set, S1, S2, and the three guards. The worker then
freezes one exact candidate and stops. Independent review checks the frozen
interfaces and only these coupling relations: one semantic owner per seam,
exact identities and provenance, compatible semantic types, reconstructible
handoffs, event/replay authority, and absence of a rival controller or runtime.

The following do not gate Wave 1 functional interface closure:

- full M5;
- transport, retry, refusal, and topology permutation matrices beyond already
  accepted witnesses;
- repeated packaging after each internal stage;
- persisted proof refresh while authored bytes are moving; or
- exhaustive cross-feature and release-condition testing.

Those obligations are retained. They run once against the integrated Waves
1–4 candidate at M5 and against the selected pre-RC/release subjects at M6/M7.
Later waves may begin dependency-safe parallel construction after the Wave 1
interface freeze; they do not thereby earn acceptance or release qualification.

#### Concrete execution and disposition

| Step | Functional work | Evidence/output | State |
|---:|---|---|---|
| `W1-C0` | Preserve accepted F03 terminal propagation and F04-A pure raw-result admission. | Accepted cold-review coordinates remain named in the handoff; no reconstruction or broad rerun. | Complete |
| `W1-C1` | Repair F04-B byte-exact predecessor conservation, non-destructive ambiguous-suffix handling, and exact F04-A candidate/request lineage. | Three direct guards plus typecheck and `git diff --check`. | Complete |
| `W1-C2` | Bind the repaired runtime through the existing scalar and current mixed attached-transform/live-F_P compositions. | Installed S1 and S2; no historical wire family or feature runner. | Complete - S2 includes PID-2 replay equality |
| `W1-C3` | Freeze the consumed interface family and one source-blind installed artifact. | Ordered exact-set interface manifest; installed import/load/resolve receipt for every entry; HEAD/tree or diff identity; artifact and package-manifest digests; S1/S2 and three-guard receipts. | Complete - artifact `ab6dd512...c878`, receipt `c8c26047...a0d7d` |
| `W1-C4` | Cold-review the frozen interface and coupling relations. | One verdict over owner singularity, semantic-type compatibility, exact lineage, durable handoff, replay reconstruction, and forbidden-path absence. | PASS - runtime review plus receipt-integrity delta review |
| `W1-C5` | Accept Wave 1 as a functional substrate and select dependency-safe parallel work. | Frozen-interface handoff consumed by later-wave workers; no M5 or release claim. | Accepted - Wave 2 selected |
| `M5-Q` | Qualify the integrated Waves 1–4 Product candidate. | Full M5, required negatives, conservation, selected scenarios, persisted proof, and exact-candidate package evidence run once. | Deferred to integrated M5 |

The `W1-C3` interface manifest is a receipt derived from the installed package,
not another contract catalog. It records the relevant `package.json` export,
owning module, exported symbol, declaration-file blob, input carrier,
success/refusal carrier, intersecting runtime-event contract digest, and replay
projection. The installed exports and declarations remain the callable truth.
Accepted 40/40 conservation evidence remains retained while the interfaces it
consumes are unchanged. An explicit interface re-entry invalidates and reruns
the affected rows. Integrated M5 reruns all 40 rows once against the combined
candidate.

The C4 review sustained the production architecture and selected one bounded
test/evidence-only repair against the unchanged frozen install:

1. write the exact ordered `./gtl`, `./product`, `./hog`, and `./abg` interface
   receipt, including declaration/carrier/event/replay coordinates and the
   S1/S2/guard outcomes;
2. mark current `./public`, its collapsed operation/definition identity, and
   its incomplete continuation variant gate as harness-only Wave 2 replacement
   subjects, not frozen Wave 1 interfaces;
3. prove S2 replay equality in a distinct Node process using the existing
   fresh-process helper; and
4. add one accepted F04-A carrier plus substituted request-lineage refusal
   before evidence admission.

The repair reuses artifact `ab6dd512678b873d1ef4f4a07c8286ff3621ea86b39627e6061652110238c878`
and its installed host. It may add frozen-artifact test support and receipt
generation only. It may not rebuild, repack, reinstall, change production,
change the frozen four exports, refresh broad proof, or begin Wave 2. After the
focused rerun, C4 independently checks the receipt and exact new proof bytes;
C5 then receives one disposition.

The following post-`W1-C5` parallel-lane table is historical planning evidence.
It is non-operative for the current Program-only sentinel:

| Lane | May start | Must wait | Upstream guard |
|---|---|---|---|
| `P-W2` Public family | Exact 18/56 external definition bindings, schemas, SDK and CLI over a recursively factorized minimal installed primitive basis and frozen Wave 1 interfaces. | Wave 2 integrated acceptance. | May consume but not alter Wave 1 owners, carriers, event contracts, handoffs, or projections. |
| `P-W3` Product scenarios | GTL/Product construction for packed Hello, One Surface, and Consensus using the ordinary frozen runtime. | Final Public transport binding waits for the applicable Wave 2 interface. | No feature runner, substitute runtime, or proof-authored Product meaning. |
| `P-Q` integrated qualification | Maintain the affected-row inventory and assemble the one future M5 command/subject boundary. | Execution and persisted proof wait for the integrated Waves 1–4 candidate. | Cannot block functional work with an unselected edge matrix or mutate production interfaces. |

Disposition is functional:

- a sunny-day failure returns to the owning implementation relation;
- failure of one of the three guards returns only to its changed coupling
  relation;
- a cold-review coupling defect receives at most one bounded repair before a
  new freeze;
- a required change to interface meaning, owner, event lifecycle, or Product
  behavior stops and returns to the Executive as an explicit interface
  re-entry; and
- a general edge condition that does not invalidate the frozen interface is
  recorded for the integrated M5/M6 qualification family, not expanded inside
  Wave 1.

## Operative W2-05 Compressed Static-Binding Design

This section is the authoritative ticket-level execution design under
constitution Sections 5.6.2C, 5.6.5, 5.6.5A, 16.7, 16.10, 16.11, 16.12, and
16.13. Product and requirements
are unchanged. The exact 18 operation identities and 56
`{operationId, memberKey}` definitions are static external coordinates and
exports. They are not implementation atoms, wrapper counts, or runtime dispatch
entries.

Review and proof follow Constitution Section 5.6.5A. The review unit is a
changed irreducible atom, owner seam, common combinator, or materially distinct
effect, currentness, commit, or installed causal topology, never the coordinate
name. Fixed same-kernel packets receive exhaustive mechanical coverage across
all 56 coordinates rather than duplicated semantic review.

The installed relation is singular:

```text
admit one common invocation
  -> select one exact installed ExactDefinitionCallable
  -> call it once
  -> structurally project either its indexed owner output and exact resource
     receipt or its receipt-indexed typed fault
```

`DefinitionCall<TPacket,TResources>` remains the one outer call carrier and the
only sibling join between semantic invocation and exact resource input.
`ExactDefinitionCallable` remains
`DefinitionCall<TPacket,TResources> -> Effect<DefinitionReturn<TPacket,
TResourceReceipt>, DefinitionExecutionFault<TPacket["definitionKey"],
TResourceReceipt>, never>`. No replacement `PublicExecutionCandidate`, topology
arm, provider Layer API, or other outer execution carrier is selected.

The singular fault union has exactly three boundaries:

```text
pre_acquisition_or_pre_append
  -> resourceReceipt: null

post_append
  -> resourceReceipt: TResourceReceipt at the latest durable prefix

post_owner_output_or_receipt_validation
  -> resourceReceipt: the unchanged, independently admitted owner receipt
```

The first variant proves that no exact receipt was issued and no append or
corresponding commit occurred. The second is mandatory after any separately
durable append/commit before a later fault. The third conserves an exact issued
receipt when a wider owner-output, receipt-envelope/equality, or structural
projection validation later fails; it never admits a malformed candidate. The
owner-authored static receipt contract validates the exact receipt, and the
canonical host plus every SDK/CLI/host projection transport the discriminant
and receipt losslessly. Only the latest exact receipt may advance currentness,
and the next owner revalidates it. Expected owner semantic refusal remains an
owner output, distinct from substrate/definition fault. This relation specifies
observable functional Effect behavior, not imperative control flow.

A durable append followed by a receipt-less fault; a pre-append fault carrying
a receipt; a stale, generic, synthesized, or store-tail-derived receipt;
discard or replacement after post-owner validation; rollback or a side channel;
or owner-refusal/fault relabeling falsifies the ABI.

Every binding is constructed at module initialization from direct imported
typed owner functions through exactly three shared higher-order combinators:

| Static combinator | Applies to | Law |
|---|---|---|
| `bindStaticOwner` | pure Product/Validator decisions and owner-local filesystem/artifact compositions | receive the fixed packet, one imported typed owner function, one owner-authored module-static strict Valibot resource assertion schema/admitter, and one owner-authored strict receipt schema/validator or equivalent typed static contract object; structurally admit resources and receipts and close them with indexed owner output and typed substrate fault into one frozen callable; conserve an independently admitted exact receipt through any later enclosing validation fault |
| `bindExactPrefixRead` | ABG reads and projections | specialize the shell over one existing ABG exact-prefix projection plus its fixed strict ABG event-resource assertion and unchanged-read receipt contracts; preserve that exact receipt through later enclosing validation fault; never fold raw events in the binding |
| `bindExactPrefixTransition` | ABG admission and held transitions | specialize the shell over one existing expected-prefix owner transition plus its fixed strict ABG event-resource assertion and successor-receipt contracts; every typed fault after append carries the exact latest successor prefix/handoff and receipt |

The combinator arguments and contracts are module-static imports. They are not
runtime callbacks and do not form a fourth combinator. Exact `TResources` and
`TResourceReceipt` generics remain fixed per binding and are never erased into
`unknown`, a universal union, or an optional resource bag. The shell performs
structural admission only; resource identity, semantic validity, authorization,
currentness, refusal, transition choice, and receipt meaning remain inside the
owner function. Runtime invocation carries data only. No callback, function-
valued resource, handler map, registry, service locator, factory, mode selector,
controller, universal resource union, topology engine, executable factor trace,
or per-key semantic switch is permitted. No fourth generic combinator or
equivalent hidden builder is permitted.

The verified Product manifest and dependency lock must resolve each declared
module, package export, named export, and member coordinate to one callable and
verify its digest before invocation. That exact static installed resolution is
lawful and required for source-independent loading. The prohibition applies to
semantic string dispatch, ambient lookup, or invocation-selected handlers, not
to resolution of the declared installed coordinate.

Each semantic family owns one plain immutable Product decision carrier or
discriminated union. Product semantic leaves are irreducible. The shared shell
contains no policy, fallback, outcome mapping, owner selection, or semantic
default. A family module may statically compose its direct typed leaves and
give the resulting owner function to one combinator. Public does not call the
leaves, call multiple owner ports, or sequence Product, GTL, HoG, ABG,
Validator, and Implementation stages.

Filesystem and held forms are instances/compositions, not common primitives:

- filesystem and artifact owner functions retain owner-local staging,
  exclusive write/idempotence, compensation, and exact immutable receipt law;
- where a completed artifact becomes runtime-consumable authority, ABG
  explicitly admits the existing artifact boundary after the owner-local
  filesystem relation; no common shell mints the event;
- exact runtime reads use the existing ABG event resource and exact-prefix
  projection; and
- recursive `run.invoke` and `run.continue` keep each HoG/ABG child append
  separately durable. Each child consumes and reissues the exact successor
  prefix/handoff. No enclosing Public, Effect, provider, or definition
  transaction groups the child sequence. A later pre-open, traversal, close,
  or enclosing-validation fault carries the latest exact issued receipt; void
  cleanup alone cannot satisfy the outward fault relation.

The independent closed cross-family carrier is:

```text
ProductDefinitionGrantResolution<K>
  × ABGExactAuthorityAtPrefix<K>
  -> owner-local DefinitionInvocationAuthority<K>
```

Product alone resolves the exact direct installed-definition relation, actual
WorkspaceBinding/ProductSet/admitted ProductInstall/ResolvedProductLock bodies,
the accepted `ActorAuthority` coordinate pair, complete family identity,
`PublicContractCatalogCoordinate`, and grants from one immutable direct owner-
output input set and issues the Product resolution ref/digest. The resolver directly
receives the complete actual owner-issued `IntrinsicPublicFunctionFamily` body
and `IntrinsicPublicFunctionFamilyCoordinate`, complete actual
`ProductPublicContractCatalog` body and `PublicContractCatalogCoordinate`, and
the complete existing digest-valid `VerifiedProductArtifact`. The family digest
is the accepted 18-operation/56-member operation/member-to-definition-digest
projection. The catalog digest is the accepted digest of the actual catalog with
only top-level `catalogDigest` omitted. The artifact's existing PFC-F08A-issued
`CompleteDefinitionContractCoordinateMap`, not the catalog body, supplies the
exact 56 definition-contract coordinate sets; it receives no new coordinate.
The resolver selects K directly from that map, retains the definition's accepted
execution-binding specification, and joins it to the verified native declaration
evidence and unique admitted Product. No intermediate installed-definition
snapshot or coordinate exists. Family/catalog coordinates are adjacent resolver
relations, never intrinsic definition fields. `OwnerIssued` is only a transport
pairing, not a generic body-digest law, and no equation hashes a body containing
its own digest. The resolver validates the actual environment/install bodies with their accepted Product verifiers,
derives installed coordinates only through `productInstallCoordinate`,
reconstructs the supplied ProductSet in its declared `orderedInstallRefs` order,
and validates the admitted WorkspaceBinding through its candidate projection
without placing `admissionEventRef` in the binding-digest preimage. Actor and
attribution remain the actual invocation-authority coordinates; no nonexistent
actor body is introduced. Resolution identity uses the accepted family
operation/member projection, actual catalog coordinate/body, verified-artifact
identity, selected definition/specification/contract-slot identity, accepted environment/install
identity projections with each admission-event ref separately carried,
actor/attribution coordinates, and canonical grant identities; it does not
serialize the raw runtime-schema-bearing family body or alter an owner digest
preimage.

ABG's declared projector input carries the complete PFC-F04-admitted invocation
and complete current-K grant bodies, one full `ValidatedRuntimeEventPrefix`, and
the actual non-materialization `PublicOperationAdmissionBasis` body when
applicable. Except for run invoke it also carries the exact event id and returns
the unique full actual `public_operation_admitted` RuntimeEvent selected from
that prefix. It validates the coordinate/body pair with
`validateDurablePrefixCoordinate`, the current root contract digest, and exact
canonical-event-line UTF-8 byte length plus
`durableRuntimeEventPrefixDigest(runtimeEventsFromValidatedPrefix(body))` before
selection; crossed pairs refuse without a file or store read. For run invoke,
the event id and source are null. The projector instead reuses
`projectEffectfulPublicInvocationTruthAtPrefix` on the PFC invocation ref and
returns the complete accepted `available` value. That value is historical only:
L69 plus L38's repeated held-prefix/availability check admits the later actual
Product-owner pair. L35/L37 independently construct the Program/policy root
grant set and Product invocation through the existing transient
`PreparedProductRunInvocation`; their shared-authority repair removes the live
`authorityMatches` equality/subset between that root set and the distinct exact
PFC/L66 current-K set. The domains join only through their actual actor,
WorkspaceBinding, Program, and session-policy relations. L38 retains the full
J03 artifact-truth and J04 CatalogView/application bodies alongside the
prepared output and passes them directly to `admitExactInvocation`; it does not
reconstruct them from a digest. For the two continuation
and five interaction-response keys the projector also receives the complete
accepted root `InvocationAdmission`, projects that exact body from the supplied
prefix by `invocationAdmissionRef`, and carries it unchanged. The root body
joins the distinct current PFC-F04 invocation through workspace and actor while
the basis binds current invocation ref/request digest. Root catalog/program
fields and the Program-declared singleton source grant instead validate against
the accepted root projection and source event. The current-K grant set remains
independently exact under PFC/L66/Metadata and need not contain that root
capability. The continuation/respond source stays in the current PFC basis/request-
digest domain and is never equated to the root Product-owner invocation digest.
Result assessment binds the full PFC invocation digest, while continuation/
respond/witness variants bind the basis digest plus request digest. Those digest
domains are never equated.
That is
historical prefix consistency, not a mutable-tail currentness claim. Composition
requires
exact equality across family, catalog, definition, invocation, actor,
WorkspaceBinding, Product set, lock, direct installed-definition/native-
declaration evidence, prefix, and either run availability or the K-required
source, plus
`grantSet == requiredGrantSubset ==` the exact current-K grant bodies whose capability
projection is `MetadataOf<K>.capabilityRefs`; every surplus grant/body/ref is
rejected. The result is transient owner-kernel input evidence, not a Public/
persisted carrier, entity/event, registry, optional bag, universal resource ABI,
controller, fourth combinator, or authority owner.

`CapabilityOperationId` is the complete 18-operation union: workspace create/
open, project read, product verify/resolve/install, workspace bind, catalog
admit/view/apply, run invoke/continue, interaction respond, result assess,
witness admit, conformance evaluate, product materialize, and release snapshot.
The existing operation-indexed `CapabilityGrant` remains the sole grant body for
that complete union. A separate `DefinitionInvocationAuthorityOperationId`
contains only run invoke/continue, interaction respond, result assess, witness
admit, and product materialize; its exact key census is `2+2+5+1+6+2=18`.

Implement exactly one pure
`ProductDefinitionGrantResolutionPort.resolve(ReadonlyDeep<Input<K>>)` and one
parameterized `ABGExactAuthorityProjectionPort.projectAtPrefix`. The Product
resolver reads no mutable manifest/catalog/store, ambient registry, callback, or
loader. Constitution 5.6.2C defines the Product-owned
`ProposedProductMaterializationAuthorityBasisOf<K>` as the only bounded new
coordinate/body relation here. Actual family, catalog, verified-artifact,
definition/specification, PFC-F08A map, Product environment/install,
RuntimeEvent, invocation, grant, and non-materialization basis types are reused
directly. The ABG projector reads no mutable tail, reconstructs no digest
preimage, and authors no body or event.
Complete-set resolution is order-independent and rejects missing, extra,
duplicate, ambiguous, crossed-digest, wrong-family/catalog/operation/capability/
actor/owner/publication, caller-authored-body, cross-prefix, and crossed
environment/actor/invocation cases. First/singleton selection, more than one
resolver, and family-local grant/authority/projector copies are prohibited.

The K mapping is total with no default or union fallback: invoke/start carry no
source event or future `InvocationAdmission`; they require the exact accepted
`available` truth for the PFC invocation ref plus their invocation/run/start
basis, then L69/L38 admit the Product-owner pair. Current_intent/selected_action and the five
interaction members additionally carry the complete accepted root
`InvocationAdmission`, project it canonically from the same historical prefix,
and otherwise use their exact continuation/selected-action or pending-
interaction execution basis; result assess uses its RuntimeResult execution
basis; reprice/attest/hygiene-stamp/intake use their exact witness subject/
context basis; run-resumed/run-stopped use their exact Run lifecycle/execution
basis. Those 16 non-materialization keys carry the complete actual
`PublicOperationAdmissionBasis` body. The 14 source-bearing keys match it to the
full admitted event; the two run keys match it to the PFC invocation and
availability projection before L38. Their family-specific bases remain outside
the shared carrier.

The two continuation, five interaction, and six witness keys cannot use their
live compound append as that source: today it admits
`public_operation_admitted` and the later owner event in one transaction, so no
durable prefix contains the source before L67. Split only that ABG HOW. For
continuation/respond, reuse `prepareContinuationPublicOperation`, admit its
exact existing event alone through
`admitNonEmptyRuntimeEventTransactionAtDurablePrefix`, require canonical
equality with the actual event and `preparedOperation.projectedPrefix`, then
feed the actual event id and successor through J05/L11/L67. Preparation takes
the complete root `InvocationAdmission`, never the distinct current PFC-F04
invocation; before append its accepted prefix projector must return a canonical-
equal root body. Its complete grant set remains root-owned. Only the event's
single grant must equal the uniquely matching root body; the independently exact
current-K grant set remains bound through PFC/L66 and is never equated to or
derived from the root set. After L68,
reconstitute the prepared operation from the admitted event and prefix, reuse
`prepareFhInteractionResponse` or `prepareFhInteractionResume`, and append only
the semantic event at an L69 guard on that successor. Resume retains the
original predecessor digest and existing adjacency law; E33 retains exact
`L55 -> L69 -> L56` ordering.

For witness, run the existing packet/authority/duplicate checks and
`publicOperationCandidate`, admit only that exact existing candidate at the
packet predecessor, and feed its actual event/successor through J05/L11/L67.
Require the packet to equal the complete PFC-F04 request and every authority
coordinate to equal the L66 owner-body projection, invocation slot, and unique
required complete grant before append.
After L68, reuse `prepareSemanticEvent` with the original predecessor events and
admitted source id, preserving existing subject/replay/lifecycle bytes, then
append only its semantic candidate at the guarded successor. A retry consumes
the conserved ingress receipt and never appends a duplicate source. Extend
`projectFhEffectfulPublicInvocationFacts` only enough to validate an exact
source-only continuation prefix as pending prior admission, using the source
event id for both fact refs, and upgrade it to the existing paired fact when the
adjacent semantic event arrives. This changes no payload variant, root-contract
digest, event kind/fluent, owner meaning, port, combinator, or L leaf.
`result.assess#assess` has no live typed-ingress producer, so its binding adds
one exact nine-key event-candidate projection on the existing
`public_operation_admitted` full-invocation-digest payload variant. It carries
K/definition, full invocation ref/digest, actor ref, canonical grant refs, and
workspace-binding ref; its workspace envelope comes only from the supplied
actual basis and PFC-F04-admitted invocation. Existing non-empty expected-prefix
admission returns the event id and successor consumed by J05/L11/L67. The later
`assessed` event alone carries assessment meaning; this ingress adds no payload
variant, root-contract digest change, event kind, fluent, port, or L leaf. The two
materializers instead carry the complete canonical Product-issued
`ProposedProductMaterializationAuthorityBasisOf<K>`, whose coordinate-free body
is exactly the full admitted invocation plus canonical complete grant bodies.
One closed twelve-key payload variant of the existing
`public_operation_admitted` event embeds that body/ref/digest and fixes exact K,
workspace authority scope, full-invocation digest, and request digest. Its
workspace envelope fixes event time, aggregate/parent/basis identities,
correlation, and empty causation from the candidate. Admission is exactly
`admitNonEmptyRuntimeEventTransactionAtDurablePrefix` composed with
`admitRuntimeEvent`; it supplies the held-store/expected-predecessor check and a
non-null successor. The trace is `L66 + complete PFC-F04 admitted invocation ->
Product candidate -> L69 -> existing non-empty expected-prefix ABG transaction
-> successor prefix -> J05 -> L11 -> L67`; L67 remains pure and adds no L70.
The later materialization result, not this pre-effect candidate, remains
obligated to cross the existing `public_operation_artifact_admitted` carrier.
That later callable is not currently implemented: live artifact admission and
truth are closed to Product install/workspace bind. L62/L63 therefore remain
C2-pending on the bounded ABG HOW extension authorized by EVENTS-032. Before
runtime use it must admit the full owner-returned result against the held
predecessor with `artifactRef = result.manifest.manifestRef` and
`artifactDigest = result.manifest.manifestDigest`. It adds no event kind,
Product meaning, or top-level result coordinate, and it never substitutes for
the pre-effect candidate. This shared-carrier repair claims no post-effect
materialization callability.

The materialization payload addition changes `ROOT_EVENT_CONTRACT_DIGEST`. Its invalidation cone
includes durable-prefix coordinates, reopen authorities and close handoffs,
event-resource receipts/static binding equalities, replay semantic-view
identities, downstream packed Product/catalog identities, and fixtures or
persisted restart/reopen proof carrying the former digest. Existing event bytes,
event ids, payload digests, event-kind roster, and Event Calculus meaning remain
unchanged when their inputs are unchanged; old authorities fail closed and may
not be silently restamped.
The continuation/respond/witness split has a separate non-root-digest cone:
regenerate their compound-transaction shape, independently durable P1 receipt,
pending-prefix replay, retry/duplicate/interleaving/failure proof, packed module
identity, and installed binding proof. It is not family-local because
`projectEffectfulPublicInvocationTruthAtPrefix` folds the changed F_H fact
projection before selecting any queried ref. Regenerate its global available/
duplicate/invalid-history contract and every direct or installed/Public
consumer, including Product-install/workspace-bind E24/L22 and E25/L27 through
`admitArtifact`, run invocation admission, continuation preparation, and cross-
operation pending-P1 available/duplicate/malformed/interleaving falsifiers. An
exact P1 makes its own ref duplicate and an unrelated fresh ref available; a
malformed pending source invalidates every query. This is no pending-state lock
or owner meaning. Those existing payload variants do not change
`ROOT_EVENT_CONTRACT_DIGEST`; for equal inputs without an intervening append,
existing event bytes/ids/ordinals, causal relations, and final raw-log prefix
remain unchanged. Only the exact intermediate prefix/receipt is added, and post-
ingress faults conserve it under Section 16.10.
The exact Table 5.6.3-C E31-E35/E37-E38 trace rows are revised only to expose
that fixed preparation -> first L69 -> typed-ingress transaction -> successor
order before J05/L11/L67. No factor identifier, L01-L69 member, owner leaf, or
result closure changes, and E33 retains its later exact
`L55 -> L69 -> L56` subsequence.
The run shared-authority repair separately invalidates the current
`authorityMatches` grant comparison, Product run preparation/admission grant
proof, L67 availability and L68 join proof, and E29/E30 packed bindings. It does
not change the availability projector implementation, event payloads/ids/order,
the L35/L37/L38 leaf meanings, or the E29/E30 expression order. E29/E30 retain
their complete J03 artifact-truth and J04 CatalogView/application bodies
object-identically across Product preparation into L38; those inputs are not
recovered from the prepared candidate or a digest.
The operative selected factor basis is therefore Constitution `L01..L69`
(69 leaves), not the former 65-leaf basis; `L66-L69` are current basis members.

Product resolution, ABG historical projection, and equality composition have
the three closed discriminated refusal unions fixed by Constitution 5.6.2C.
Before an admitted invocation exists, exact candidate-side failure maps only to
the existing `IndexedInvocationAdmissionRefusal<K>` code. After invocation
admission, construction/invariant failure maps only to the receipt-appropriate
Section 16.10 `DefinitionExecutionFault`. Only successful composition followed
by family-owner judgment may return `RefusalOf<K>` object-identically. No
infrastructure failure becomes owner `basis_mismatch`, and no owner refusal maps
back to ingress or substrate fault. Immediately before the first effect/append,
and before each later child append, the exact held `AbgEventStore` is compared
to the expected predecessor by `assertHeldEventStoreAtDurablePrefix`; stale live
state refuses there, never in the historical projector.

Interaction keeps pending identity, response contract/kind, choice,
value/evidence, and continuation/execution basis outside the shared carrier.
Result keeps admitted RuntimeResult and assessment contract/value/evidence/
disposition outside it. Witness keeps kind, subject, content, context,
evidence/provenance, and kind-specific basis outside it. Run keeps Catalog,
Program/GraphFunction membership, implementation, steering/input, and root
policy outside it. Materialization keeps its two Product packet and physical-
effect regimes outside it and consumes, rather than rebuilds, shared
environment/grant resolution.

The D11 donor contributes only pure Product assessment judgment, ABG
historical projection/candidate/admission, the separate held-store currentness
guard, typed substrate faults under Section 16.10, and `assessment_evidence` as
a shared E10 specialization. Its D11-specific grant and authority bodies are
superseded. The carrier-dependent order is
shared carrier, result assessment, six witness packets, then one E33 kernel and
five packets. Materialization mechanics may proceed independently but binding
waits for the carrier. The already-authorized `run.invoke` repair continues.

E33 is one static interaction kernel plus five fixed packets:

```text
shared L66-L68 exact authority and immutable-prefix consistency
  -> ABG L53 exact historical basis at the validated prefix
  -> exact environment/install/publication join
  -> Product L54({basis,responseKind,choice,value,evidence})
  -> existing ABG L55
  -> exact held-store/expected-prefix guard
  -> existing ABG L56 expected-prefix admission
  -> Product R33
```

L53, the Product/environment join, L54, and L55 are immutable-prefix
projection/decision/candidate construction. L69 occurs exactly after L55 and
immediately before the L56 admission/effect; a stale held store refuses there
before effect.

The binding never receives raw events and never folds them to reconstruct L53.
The five `select | approve | reject | assess | answer_escalation` exports bind
their fixed packet to the same kernel through `bindExactPrefixTransition` and
contain no member logic. Missing exact choice, evidence, capability-grant,
environment, installed-Product, or publication carriers holds this family for
one bounded design reframe. Public, callers, fixtures, and tests cannot mint or
infer them.

Constitution Section 16.12 ratifies the complete local `run.continue` design.
One owner-local `RunContinuation` kernel is fixed at module initialization
behind exactly `RUN_OPERATION_CONTRACTS.continue.current_intent` and
`.selected_action`, their two exact packets, and existing
`bindExactPrefixTransition`. The kernel is not a fourth combinator. Each binding
fixes one leaf statically; the member discriminant is exact contract identity,
not a runtime `mode` or handler selector.

The common kernel consumes the exact transient
`DefinitionInvocationAuthority<K>` constructed under Section 16.11 and one
branch-neutral ABG projection from the same immutable prefix:

```text
ABGRunContinuationFrontierAtPrefix = {
  authorityPrefix, runPrefix, replay,
  exact replay-derived Run and run-local Continuation,
  root InvocationAdmission,
  exact ExecutionBasis,
  run/GraphCall/frame/cursor/current-intent lineage
}
```

The frontier is pure transient readonly data. It has no independent identity,
ref/digest authority, lifecycle, persistence, serialization, Public field,
grant body, raw-event input, or mutable-tail access. Before either leaf runs,
the kernel requires exact equality among the frontier, the Section 16.11
Product/ABG authority product, and the `DefinitionCall` resource prefix for
definition, operation, invocation, actor, WorkspaceBinding, Product set, lock,
publication, complete grant set/subset, source, and prefix. No continuation-
local grant, resolution, projector, or authority body is permitted.

Only `run` and `continuation` are universal semantic request fields. Exact
branch inputs are disjoint:

```text
current_intent = {
  exact replay-derived admitted current intent,
  exact admitted response or post-yield continuation input,
  exact expected ExecutionBasis
}

selected_action = {
  exact admitted SelectedNextActionProjection and its admitted basis,
  same_basis | authority_changed + exact covering reprice,
  exact Product target resolution,
  matching Product-issued ProgramGraphFunctionMembership
}
```

No nullable carrier contains both sets. The current-intent leaf reuses the
existing continuation projection/rehydration, F_H successor derivation and
expected-prefix resume, and HoG interaction-resume traversal. It resumes only
the replay-derived admitted intent through `continueExecution`, admits no new ConstructionIntent, and
returns `admittedIntent: null`.

The selected-action leaf accepts one current admitted
`NextActionProjection` with `disposition: selected`, never `no_action` or a
caller selection. Same-basis authority must agree exactly. An authority crossing
requires the applicable separately admitted binding plus an exact covering
declaration reprice naming the crossed basis pair. Product execution resolution
alone resolves the projection-declared Program/GraphFunction and supplies the
matching `ProgramGraphFunctionMembership`. The kernel factors the existing ABG
selected-action validation/admission relation so ABG admits exactly one new
ConstructionIntent under the existing `construction_intent_selected` meaning;
only then does it invoke the declared target through ordinary GTL/Validator/HoG
execution, realizing only `evaluateNext -> admitConstructionIntent ->
invokeGraphFunction`. It never evaluates another action or accepts caller-authored Program,
GraphFunction, membership, target input, or cursor.

One Product-owned plain immutable `RunContinuationDecisionPort`, distinct from
the interface-only `RunContinuationPort`, has exact `current_intent` and
`selected_action` pure functions over closed readonly branch records. It
constructs only the existing packet-indexed result/nonterminal/refusal union and
has no Effect, resource, store, event writer, callback, lookup, or fallback.
ABG typed `basis_fork_detected` remains the lower truth; the Product decision
maps it explicitly to the existing public `reprice_mismatch` refusal with exact
evidence rather than silently renaming it `basis_mismatch`.

The owner-local causal sequence is fixed:

```text
Section 16.11 authority + exact DefinitionCall
  -> ABG frontier at the same exact prefix
  -> existing ABG public-operation admission
  -> statically fixed current_intent | selected_action leaf
  -> existing separately durable ABG/HoG child transactions
  -> replay at the latest durable prefix
  -> pure Product RunContinuation decision
  -> exact resource close and DefinitionReturn
```

Existing child atomicity and event meaning do not change, including the existing
route-plus-ConstructionIntent batch. Each later child consumes the predecessor's
exact successor and reissues its own successor/handoff. The fixed resource
contract is existing `T9 recursive_abg_prefix_frame`: one provider-scoped ABG
store, exact initial prefix, and reopen/prior-close handoff enter; the same
store, complete ordered child-receipt journal, latest successor prefix, and
owner-issued close handoff return. Section 16.10 governs
without reinterpretation: before acquisition/append a typed substrate fault has
`resourceReceipt: null`; after any public-operation, continuation, intent,
target-open, traversal, or other durable child append it carries the exact
owner-issued receipt at the latest durable prefix; and after wider owner-output
or receipt validation it conserves an already admitted exact receipt unchanged.
Owner refusal stays an owner output. No enclosing transaction, rollback,
store-tail synthesis, generic receipt, side channel, or Public receipt
interpretation is lawful.

When both native bindings replace it in the complete-family swap, delete the
legacy `public/contracts.ts` current-intent-only row and caller
`continuationAuthority`; `public/operations.ts::applyRunContinue` and its root
switch arm; run-continuation use of `PublicContinuationAuthority` and its
construct/parse/update round trip; and any independently authored contract,
schema, SDK, CLI, or compatibility fallback. Public then admits and selects one
exact installed binding, calls it once, and transports its outcome/receipt.

The invalidation cone is proportional. A common frontier projector, kernel,
decision port, equality/currentness law, or continuation resource/receipt-
contract change invalidates both leaves and packets/bindings, their schemas and
projections, legacy-deletion proof, and both installed causal-topology proofs.
A `current_intent` leaf-only change invalidates that branch plus shared
downstream receipt/replay proof. A `selected_action`, action/basis, reprice,
membership, ConstructionIntent-admission, or target-invocation change
invalidates that branch plus shared downstream receipt/replay proof. A packet-
only change invalidates its coordinate/digest/manifest/census proof while the
common review and other branch remain banked if byte- and contract-identical.
Sections 16.10 and 16.11 retain their wider invalidation cones.

Mandatory falsifiers are stale predecessor prefix; crossed run, continuation,
GraphCall, frame, cursor, ref, or digest; wrong current intent/input/basis;
absent, `no_action`, stale, duplicate, crossed, or wrong selected projection,
action, basis, target, or obligation; changed authority under `same_basis`;
missing, wrong, or non-covering reprice; caller-/Public-/binding-/fixture-/test-
authored Program, GraphFunction, membership, grant, binding, target input,
cursor, or topology; zero or multiple new intents; invocation of a target other
than the admitted projection target; a fault after each separately durable
child without the exact latest receipt; duplicate/resolved continuation
producing a second resume, intent, GraphCall, or route; member/key/digest or
`admittedIntent` nullability relabeling; raw-event folding; new event meaning;
or a fourth combinator, registry, controller, runtime, or compatibility path.

Foundation/Technology disposition is closed:

| Classification | Exact selection | FS-18/FS-19 decision |
|---|---|---|
| `catalog_reuse` | `shared/canonical_json.ts::{canonicalJson,compareUnicodeCodeUnits}`, `shared/digests.ts::sha256Canonical`, `shared/immutable.ts::deepFreeze`, and `product/exact_match.ts` | reuse canonicalization, ordering, digest, immutability, and cardinality mechanics |
| `catalog_reuse` | `product/catalog.ts::{admitGraphFunctionCatalog,buildGraphFunctionCatalog,lookupGraphFunctionDefinition,narrowGraphFunctionCatalog}`, `product/implementation_resolution.ts::resolveImplementationSet`, `product/environment.ts::{isResolvedProductLock,isProductInstall,productInstallCoordinate,isProductSet,constructProductSet,isWorkspaceBindingCandidate}`, and `product/semantics.ts::loadInstalledProductSemantics` | reuse exact Product selection/environment/implementation/semantic callables and actual bodies; do not duplicate them or invent actor/install bodies in the resolver |
| `catalog_reuse` | actual `IntrinsicPublicFunctionFamily` constructor/operation-member digest projection and execution-binding specification, actual `ProductPublicContractCatalog` digest/body, `isVerifiedProductArtifact`, native declaration evidence, and PFC-F08A `CompleteDefinitionContractCoordinateMap` output | reuse owner outputs and their domain-specific nonrecursive identities; join the unique definition/contract slot/install directly; no rival family/catalog/56-map, installed-definition snapshot, or repurposed coordinate |
| `catalog_reuse` | `abg/event_prefix.ts::{selectValidatedRuntimeEventPrefix,runtimeEventsFromValidatedPrefix}`, `abg/replay.ts::replayValidatedRuntimeEventPrefix`, `abg/effectful_invocation_truth.ts::projectEffectfulPublicInvocationTruthAtPrefix`, `abg/invocation_execution_truth.ts::projectExactInvocationAdmissionAtPrefix`, actual `RuntimeEvent`, `InvocationAdmission`, and non-materialization `PublicOperationAdmissionBasis`, PFC-F04 invocation admission/self-contained invocation identity equations, accepted grant verification/admission, `product/run_invocation_operation.ts::ProductRunInvocationPort.prepare` and `PreparedProductRunInvocation`, and `abg/event_store.ts::{validateDurablePrefixCoordinate,durableRuntimeEventPrefixDigest,admitNonEmptyRuntimeEventTransactionAtDurablePrefix,admitRuntimeEvent,assertHeldEventStoreAtDurablePrefix}` | reuse full admitted invocation/event/grant bodies, run no-prior-admission truth plus later owner admission, the complete seven-key continuation root admission, exact coordinate/body prefix equality, durable admission, historical projection, and live expected-prefix mechanics; keep current-K and Program/root grant domains distinct without a fictional invocation-only verifier or source/basis identity |
| `catalog_reuse` | `abg/continuation.ts::{prepareContinuationPublicOperation,prepareFhInteractionResponse,prepareFhInteractionResume}`, existing witness `publicOperationCandidate`/`prepareSemanticEvent`, and their exact payload/semantic-event forms | reuse existing constructors on either side of independently durable source admission; add no carrier, payload, event, or owner meaning |
| `catalog_reuse` | exact-pinned Valibot `1.4.2` and Effect `3.22.1` through their existing schema and outer typed execution seams | reuse maintained generic admission/composition; no Product or ABG semantics move into a library |
| `catalog_extension` | the sole existing `CapabilityGrant` constructor/validator/digest and operation index, plus the run preparation `authorityMatches` shared-authority check | extend one body across all 18 operations and remove the false equality/subset between the exact current-K set and the independently constructed Program/root set; no subset carrier or family-local body |
| `catalog_extension` | existing continuation-response, continuation-resume, and witness compound admissions plus `projectFhEffectfulPublicInvocationFacts` | split each source/semantic pair into guarded one-row transactions around L67 and recognize the exact source-only P1 as pending prior admission; preserve payload variants, root-contract digest, event/owner meaning, and final equal-input bytes |
| `catalog_addition_proposal` | one exact nine-key `result.assess` event-candidate projection on the existing full-invocation-digest `public_operation_admitted` variant | close the missing typed-ingress source through the existing expected-prefix transaction; the later `assessed` append retains all owner meaning |
| `catalog_addition_proposal` | `ProposedProductMaterializationAuthorityBasisCandidate<K>`, Product-issued `ProposedProductMaterializationAuthorityBasisOf<K>`, and one closed candidate-bearing payload/event-candidate projection on existing `public_operation_admitted` | carry the complete invocation/grant candidate through the existing non-empty expected-prefix transaction and recover it by prefix replay; no new event kind/entity/registry and no use of the post-effect artifact slot |
| `catalog_addition_proposal` | one Product immutable-input exact-set resolver | minimal composition over reused Product callables |
| `catalog_addition_proposal` | one ABG immutable-prefix historical projector | recheck the PFC-F04-admitted invocation's self-contained identity, validate complete supplied grant bodies, select the actual full event and basis, and replay the embedded materialization candidate without repeating owner-packet/schema admission |
| `catalog_addition_proposal` | one pure transient equality/refusal mapper | no ref, serialization, persistence, registry, or lifecycle |

Native/current owner mechanics plus those exact-pinned libraries cover the
generic work. The bounded carrier additions make Product exact-set resolution,
ABG immutable-prefix projection, the missing result-assessment ingress,
candidate-bearing materialization typed ingress, and pure equality/refusal
mapping constructible; the existing continuation/respond/witness candidates
are split into independently durable ingress and owner-event admissions around
L67, with replay-valid pending P1, at the lowest
migration, proof, package, and lifecycle cost. Add no dependency, duplicated
project/library callable, resource framework, schema/digest engine, grant
family, event kind, registry, persistence layer, Event Calculus fold, store, or
runtime.

Whole-family constructability closes only when the clean packed artifact loads
all 56 static exports with real owner closures and complete dependency closure,
all three fault variants and host projections agree with their exact owner-
authored receipt contracts, and the legacy Public family and all fallbacks are
absent. Stubs,
interface-only bindings, test callbacks, source imports, and refusal values
invented to conceal missing owner meaning do not count. Behavioral
qualification remains the exact twelve-key odd_glc sentinel.

The historical `E01-E40`, `L`, `J`, `R`, `X`, and `T0-T9` maps may still prove
coverage, owner placement, order, or durability. They are not runtime types,
primitive budgets, wrapper budgets, or executable plans.

## Deferred Historical Full 18/56 Plan — Non-Operative

**SUPERSEDED/DEFERRED/HISTORICAL — NON-OPERATIVE.** Every heading, gate, state,
checkbox, construction step, proof condition, and present-tense instruction in
this retained section is evidence only. In particular, the old C1F/D6
`PublicExecutionCandidate`, resource-topology-arm, generic provider/load, and
atomic C2/D6 advancement design is superseded. It may not define current
implementation, stage advancement, or Wave 2 closure and may not enlarge
`W2-ODD-GLC-PROGRAM-ONLY-HELLO`.

Wave 2 delivers `A5-F01`, `A5-F09`, `A5-F05`, and `A5-F06` as one installed
function:

```text
source-blind Product bytes and workspace target
  -> verify -> resolve -> install -> bind
  -> construct exact eventless catalog, view, and application
  -> admit one PublicExecutionCandidate containing the unchanged envelope
     plus one sibling resource-state assertion
  -> select one exact { operationId, memberKey } definition
  -> admit its semantic request and derive one exact closed topology arm
  -> admit the matching resource assertion
  -> call its already loaded direct, statically composed, or projection binding once
  -> structurally project its indexed outcome plus resource receipt/handoff
  -> expose the same family through installed SDK and CLI
```

The exit is functional, not numerical. The exact 18-operation/56-key set is a
no-silence projection of the Product, not evidence for 56 semantic atoms.
Wave 2 closes only when all 56 external definitions load and execute their
exact binding from the clean packed artifact, the recursively factorized
primitive basis closes, the two installed Product paths below work, and the
legacy family is unreachable.

Wave 2 is selected after accepted `W1-C5`, and `W2-C0` is complete. The current
checkpoint reinterprets the frozen join as external contract/endpoint and
deletion evidence, recursively factors each required function, and selects the
minimal installed primitive basis before C2-C4 construction resumes. This does
not mutate the accepted census or C0 receipt in place.

### Accepted basis and bounded reconciliation

The exact Gate 1 subject at commit `3f80ba23`, tree `04906b1c`, remains the
accepted structural construction map:

```text
admit common envelope
  -> select exact operation/member definition
  -> call the already loaded exact definition binding once
  -> project the indexed owner outcome
```

Its operation/key allocation, exact executable-binding law, five common refusal codes,
nested owner-refusal preservation, PFC-F07/PFC-F08 relation, projection graph,
and atomic deletion boundary remain selected. Current Product, requirements,
and the accepted T-287 catalog contraction supersede only these older effect
relations:

- `workspace.create` is a Product-owned filesystem transformation that creates
  no ABG runtime event merely for creating a workspace boundary;
- `workspace.open` is a pure Product read and creates no event;
- `catalog.admit`, `catalog.view`, and `catalog.apply` are deterministic,
  reconstructible Product operations with no catalog event, fluent, registry,
  replay lifecycle, object brand, or process-local admission;
- catalog list and describe read the immutable Product catalog basis; and
- `run.invoke` alone revalidates and records exact catalog, Program,
  GraphFunction, view, and application use in ABG runtime truth.

The Wave 1 interface receipt must not ratify these current legacy Public laws:

- `definitionKey === operationId`;
- `definitionDigest = hash({ operationId, schemaVersion })`; or
- the hard-coded continuation allowlist containing only `approve`,
  `answer_escalation`, and `current_intent`.

Those are Wave 2 replacement loci. The exact durable definition coordinate is
the selected `{ operationId, memberKey }` plus the selected intrinsic
`definitionDigest`. The underlying Wave 1 event-store, expected-prefix,
runtime-event envelope, continuation, Event Calculus, replay, and handoff
mechanics remain frozen. `W1-C3` shall either omit the three legacy relations
from its accepted interface set or name them explicitly as Wave 2 residuals;
it shall not freeze a contract that makes the exact family impossible.

### Exact family endpoints and contract owners

The selected family roster remains the canonical 18/56 set. The prior family
digest `61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f`
is frozen C0 evidence only: the corrected intrinsic definition now includes a
source-independent execution-binding specification, so a new candidate family
digest is frozen only after the factorization map closes. The accepted census
blob `efe88cac` and C0 receipt are not rewritten.

| External contract allocation | Definitions | Exact responsibility |
|---|---:|---|
| `D01` Product workspace | 3 | `workspace.create/{clean,imported}` and `workspace.open/open` |
| `D02` Product reads plus `D03` ABG reads | 24 | exact catalog/workspace/install/release/consensus Product projectors and exact Event-Calculus runtime/evidence/replay/gap/action projectors |
| `D04` Product verification | 1 | `product.verify/verify` |
| `D05` Product environment | 2 | `product.resolve/resolve` and `workspace.bind/bind` |
| `D06` Product installation | 1 | `product.install/install` |
| `D07` Product catalog | 4 | `catalog.admit/admit`, `catalog.view/allowlist`, and `catalog.apply/{node_type,overlay}`, all eventless |
| `D08` Product/ABG invocation | 2 | `run.invoke/{invoke,start}` over the frozen Wave 1 runtime |
| `D09` Product/ABG continuation | 2 | `run.continue/{current_intent,selected_action}` from Event-Calculus frontier truth |
| `D10` Product/ABG interaction | 5 | `interaction.respond/{select,approve,reject,assess,answer_escalation}` |
| `D11` Product/ABG result assessment | 1 | `result.assess/assess` |
| `D12` ABG witness admission | 6 | `witness.admit/{reprice,attest,hygiene-stamp,intake,run-resumed,run-stopped}` |
| `D13` Validator conformance | 1 | `conformance.evaluate/gtl_program` |
| `D14` Product materialization | 2 | `product.materialize/{context_bootstrap,configuration}` |
| `D15` release owner | 2 | `release.snapshot/{published_rc,tapped_release}` |

This table assigns external contracts and semantic responsibility. It is not a
primitive-basis decomposition. Each row retains owner-authored request, result,
refusal, non-terminal, effect, capability, and authority metadata plus one
source-independent binding specification. Recursive factorization classifies
that specification as a direct primitive, owner projection, or ordinary
statically composed installed TypeScript callable. A type interface, symbol string, module locator,
specification, test stub, or Public handler is not executable authority. The
release definitions resolve to real installed bindings in Wave 2, but return
their exact qualification/basis refusal until Wave 5 supplies a same-subject
green non-bypassed release basis. Their two member/result-contract identities
now target separate strict future result/resource/publication-receipt contracts;
they do not share one semantic kernel or currentness law. They may not construct
or publish success early. The distinct Product `release_evidence` read consumes
only an authenticated originating request, exact owner outcome, and matching
owner-issued receipt through `bindStaticOwner`; it is never an ABG-prefix read.

The read family is one projection/composition problem, not 24 independent
runtimes or presumed primitives.
Product supplies six deterministic projectors. ABG supplies the remaining
projectors over one explicit validated prefix and the frozen Event Calculus.
Each key has an exact typed adapter and loaded binding, while common projection
mechanics remain shared in the minimal primitive basis below those definitions.

#### Bounded D11/D12 Wave 1 interface re-entry

Construction exposed one planning error rather than missing Product meaning.
Product requirements and accepted Gate 1 packet grammar already require D11
and D12, while immutable `v4.6.0-rc.5` retains their owner mechanics. A typed
`construction_issue`, generic witness event, or reuse of C-call judgment is not
a realization of those definitions.

The Executive authorizes one additive re-entry into the Wave 1 ABG event
interface, limited to:

- `result.assess/assess` consuming the accepted `RD<RuntimeResult>`, declared
  assessment contract and value, evidence set, and current execution basis;
  Product derives the exact `admitted | rejected | retry | blocked` assessment
  disposition and ABG atomically admits actor-attributed `assessed` truth;
- `witness.admit` using the retained canonical event kinds
  `declaration_reprice_admitted`, `replay_log_attested`,
  `workspace_hygiene_stamped`, `defect_intake_admitted`, `run_resumed`, and
  `run_stopped`; and
- the exact payload validators, expected-prefix append relations, Event
  Calculus effects, replay projections, and affected interface receipts for
  those event variants.

The internal F04 probabilistic-result candidate is not the D11 public request.
The existing runtime-failure `run_stopped` meaning remains valid as a distinct
5.0 payload variant. This re-entry adds no Public operation, generic boundary
event, event store, catalog, controller, compatibility path, or change to any
other Wave 1 identity or semantic relation. C5 reissues the affected event and
projection receipt rows; Wave 1 is not reset or broadly requalified.

### Frozen endpoint census and current factorization disposition

The frozen C0 census is endpoint, contract, and deletion evidence. Its prior
implementation labels do not determine which functions are primitive. The
current factorization input is:

| Definitions | Current disposition |
|---:|---|
| 8 | strong lower Product relations already exist for verify, resolve, install, bind, catalog admit, view, and both application variants |
| 5 | run invoke, current-intent continuation, approve, and answer-escalation semantics substantially exist and require exact external binding specifications |
| 24 | exact read definitions are absent, while underlying Product and ABG projection primitives substantially exist |
| 1 | whole-Program Validator conformance exists and needs one exact contract packet and binding specification |
| 4 | `selected_action`, `select`, `reject`, and interaction `assess` require bounded existing-owner expansion |
| 14 | workspace create/open, result assessment, six witness variants, two materializers, and two release definitions require recursive classification against existing primitives and unavoidable effects |

Approximately 38 rows therefore reuse existing semantic relations. Every row
still requires an exact owner packet, source-independent binding specification,
loaded binding under the admitted lock, installed dependency closure, and
generated projections. The checkpoint must prove closure of the minimal
primitive basis; it may not manufacture a bespoke callable merely to fill a
row. Missing owner meaning is a stop, not permission for Public, SDK, CLI, a
fixture, or a donor to invent it.

### Superseded C1F/D6 execution-carrier and topology-arm repair — historical evidence

This section is retained as rejected design evidence. Constitution Sections
5.6.2C and 16.7 supersede its carrier, topology-arm, provider, and advancement
relations. C1F/D6 is not a current stage or hold gate and authorizes no
implementation.

D6 proved one construction defect in the C1F installed-binding relation. The
unchanged common `PublicInvocation<K>` and owner request packets carry semantic
refs and digests, but they do not and must not implicitly supply a physical
artifact locator or an ABG durable-prefix/reopen carrier. The prior unary
`ExactDefinitionCallable<K>(PublicInvocation<K>)` relation could therefore
close only by inventing an ambient resolver, process-local store, fixture, or
schema-specific compatibility path.

The first correction candidate at commit `5d49d748`, tree `891e3d2a`, was held
by cold review. It correctly selected an explicit resource carrier but falsely
applied `Rnn` before one late generic commit, lacked exact 56-key topology and
PFC-F05 identity joins, generalized content addressing, and under-specified
provider identity, idempotence, residue, and ABG successor threading. F_H
authorized one bounded repair while retaining the common topology relation and
Effect `3.22.1` foundation.

The second candidate at commit `f82805ec`, tree `308aa2ae`, is also held and
rejected as an exact candidate. It retained the selected foundation and leaf-
local durability but left one ingress undefined, optional/conditional topology
outside a closed family, dynamic HoG children inside Public topology, an
under-indexed receipt/grant/load ABI, an exposed provider Layer, and no exact
resource-foundation cost ledger. No implementation authority arose.

Sections 5.6.2A-B, Table 5.6.3-D, foundation ledger 10.1.3, and amendment 16.6
are historical classification/rejection evidence only. Their implementation
algebra is superseded by Sections 5.6.2C and 16.7. The following records the old
C1F/D6 accounting without selecting it:

- all 56 definition keys retain their exact owner, request, indexed outcome,
  effect regime, installed coordinate, and ordered factor trace;
- the existing `5 + 24 + 1 + 4 + 14 = 48` incomplete rows are carrier/binding
  gaps, not another family or a request for 48 wrappers;
- one serializable `PublicExecutionCandidate` used by SDK, CLI JSONL, Codex,
  and the internal host carries the unchanged semantic envelope plus one
  sibling resource-state assertion; it is not another API and never adds
  resource fields to `requestCandidate`;
- after outer admission and K semantic-request admission, a total owner
  selector derives one arm A; `DefinitionCall<K, A, I, O>` and
  `DefinitionReturn<K, A, I, O>` preserve that exact arm and resource relation;
- Table 5.6.3-D projects all 56 exact keys through closed nonempty topology
  families over the existing `E01-E40` classes and shared `T0-T9` forms;
  `E03`, `E04`, `E22`, and `E36` have the only multi-arm families and there is no
  56/48 wrapper roster;
- canonical provider-scoped input/output resource identity topology derives
  read, same-resource mutation, and owner-allocated distinct-output creation;
  no mode flag selects access or commit behavior;
- every fixed physical or ABG resource transition is owned by its exact `L`,
  `J`, or `X` leaf and returns a typed mechanical receipt before dependent
  work; `E29-E32` instead expose one fixed initial-to-final prefix relation
  while HoG/ABG owns and journals the dynamic separately durable children;
- the exact semantic owner consumes committed, no-new-commit idempotent,
  residue/compensation, or substrate-fault evidence and applies the frozen
  `Rnn` only at the lawful post-transition/replay locus; no generic provider
  invents owner meaning;
- intrinsic definition and callable-contract identity bind the complete family,
  every arm, total selector, exact owner binding types, grant-use basis, and
  required stateless provider capabilities; calls, receipts, loaded binding,
  load receipt, and host receipt preserve the exact same relation;
- the installed loader privately constructs/provides the Effect Layer once,
  exposes no `providerLayer`, and returns one callable with `R = never`; and
- logical refs never substitute for canonical locators, expected versions,
  provider identities, complete admitted grants, ABG prefix/reopen
  handoff, object digest/version, or transaction/version tokens.

The exact foundation choice is current Product Node/filesystem atoms plus the
current ABG Event Store, lifted with core Effect `3.22.1` Scope/Layer closure,
plus only the irreducible serialized identity/version/grant/arm/receipt carrier.
Effect `Resource` is not durable truth; `@effect/platform` is not selected on
total cost; Git is not inferred as Product state.

This design correction authorizes no production, schema, generator, test,
Public-family, legacy-deletion, HoG, Event Calculus, replay, or release work.
The D2-D5 checkpoints remain unaccepted conservation and prototype evidence.
The old C1F/D6 hold/advance relation has no current effect. A requirement
conflict or missing owner meaning remains a stop under the operative W2-05
design.

D6 carries two already-observed bounded obligations; neither is implemented in
C1F:

- if a structural retry route is durably admitted and the subsequent retry-
  attempt admission refuses, return the already-admitted route receipt and
  successor prefix instead of erasing the admitted fact; and
- replace the hard-coded
  `/private/tmp/abi5-wave1-freeze.yIRMJu/wave1-interface-receipt-v2.json` in
  `test_env/support/t287-wave2-owner-chain-worker.mjs` with the current exact
  candidate receipt or a deliberately compatible immutable fixture, while
  retaining the incompatible-dependency negative.

### Reuse and library decision

Wave 2 applies the local library ladder per relation:

1. retain current canonical JSON, digest, immutable-carrier, exact-match,
   Event Store, Event Calculus, replay, Product, GTL, HoG, and Validator
   callables;
2. retain conforming immutable 4.6 behavior where the current owner relation
   does not already supersede it;
3. transplant only isolated owner-local contract/schema declarations and
   native-analysis code from donor `935b11dd` after proving no import or runtime
   dependence on its rejected Public family; and
4. use exact-pinned `valibot@1.4.2` and
   `@valibot/to-json-schema@1.7.1` for authority-neutral runtime validation,
   TypeScript inference, and JSON Schema projection; and
5. use exact-pinned Effect `3.22.1` as the selected substrate for typed
   sequencing, stack-safe suspension, typed failure/Cause separation,
   stateless capability provision, physical resource scope, and the one HoG
   fold over exact owner ports.

Valibot supplies schema mechanics only. Owner modules author semantic fields,
closed domains, defaults, effects, refusals, and relations. Owner schemas use
strict objects and JSON-compatible constructs; unsupported transformations or
lossy schema projection are forbidden. JSON Schema conversion fails closed,
and one canonical fixture must validate equivalently through the native schema
and its generated JSON Schema before family generation proceeds. The exact
versions are pinned; dependency drift is not ambient authority.

No local schema engine, validation framework, operation registry, or
hand-written schema roster is built. Donor `definition_family`, dispatcher,
SDK, CLI, and Public aggregation are evidence only and may not be transplanted
as a unit.

Effect cannot own GTL topology, HoG traversal choice, semantic retry/workflow,
Product lifecycle, ABG event admission/currentness/persistence, clock or
scheduler truth, concurrency truth, or replay meaning. Its current direct-HoG
and installed E29 prototypes are conservation evidence and disposable
scaffolding, not production architecture. Effect `3.22.1` is selected; no
further technology decision remains. The resource-specific FS-18/FS-19 ledger
selects the current Node/filesystem and ABG Event Store atoms through core
Effect Scope plus the irreducible local carrier; it rejects Effect `Resource`
as durable truth and does not select `@effect/platform`. The historical C2A
hard break translated the established HoG behavior into the small algebra and one
fold, then deletes or makes unreachable the prototypes and displaced
imperative coordinators. Event Calculus and replay are unchanged and no
reduction redesign is selected. The former C1F/D6 hold is historical only.

The frozen seven-path PoC aggregate
`sha256:18e2a602cbe7000b56aec8e1e92eed52dce5ce4af50bd94bf301cf5dd95df241`
and the installed E29 prototype are conservation evidence for the selected
foundation. They do not change Product behavior or authority and may not be
retained as wrappers around the imperative HoG path.

### Historical W2-C2A HoG Effect hard break - non-operative

#### Migration Declaration

- **Strategy:** `inside_out_hard_break` on the existing TypeScript
  implementation line.
- **Change boundary:** Goals selects this bounded transformation wave; the
  accepted ABI5 Realization Constitution Section 5.6.1A owns its changed
  structural HOW. Intent, Product, and requirements are unchanged.
- **Affected scope:** the one installed HoG traversal interface family from an
  admitted `CProgramNode` plus exact cursor/scope through
  `public/operations.ts`, `hog/index.ts`, `hog/graph_execute.ts`, the HoG
  coordination modules, exact owner ports, ABG event admission, and the tests
  and package exports that can invoke or prove that path.
- **Excluded scope:** Product meaning, the 18-operation/56-key family, owner
  request/result/refusal meaning, GTL identity, ABG event contracts, Event
  Calculus, replay, Public/SDK/CLI interfaces, and all C1F/D6 resource-carrier
  work. The sole producing-interface re-entry is the F_H-authorized closed F_P
  leaf receipt below. No compatibility scope is retained.
- **Old operative path:** `public executeGraphTraversal -> graph_execute Effect
  shell -> Effect.promise -> execute.ts::completeExecutableTraversal`, with
  control-flow coordination also resident in `structural_execute.ts`,
  `traversal.ts`, and `traversal_route.ts`.
- **New operative path:** admitted `CProgramNode` plus exact cursor/scope -> one
  stack-safe `Effect` fold -> exact GTL/Product/HoG/ABG/implementation owner
  ports -> ABG-admitted events -> unchanged Event Calculus/replay projection.
- **Old producers:** the `graph_execute.ts` shell and imperative HoG
  coordinators that procedurally derive traversal progression.
- **New producers:** the existing GTL validation/materialization and source-path
  relations supply the admitted algebra; existing ABG projections supply exact
  runtime prefix, cursor, and scope. Neither is changed by this migration.
- **Consumers:** the installed Public run/continue call sites, HoG package
  export, exact leaf/child/judgment/route owner ports, ABG admission owners,
  replay/Public outcome projection, and traversal proof lanes.
- **Closure law:** the installed Public call path reaches one fold and exact
  owner ports without importing, invoking, exporting, packaging, or testing a
  superseded coordinator; result, refusal, ordered event, Event Calculus, and
  replay behavior remains exact; no temporary scaffold remains reachable.

Old paths are classified as follows:

| Path | Classification | Closure |
|---|---|---|
| `public/operations.ts` call sites and `hog/index.ts::executeGraphTraversal` | `re-authorize` | Preserve their existing external types; bind them only to the final fold. |
| `hog/graph_execute.ts` Effect shell around `completeExecutableTraversal` | `replace` | Make `executeGraphTraversal` run the direct fold; remove the shell-to-old-engine call. |
| `hog/execute.ts::completeExecutableTraversal` and its imperative coordination | `remove` | No production import, export, package symbol, or direct proof invocation remains. |
| Coordinator control flow in `structural_execute.ts`, `traversal.ts`, `traversal_route.ts`, and `retry_exit.ts` | `replace` or `remove` | Each retained pure derivation or owner call is consumed by the fold; competing loops are deleted. |
| Exact GTL derivations and Product/ABG/implementation owner ports | `re-authorize` | Retain owner meaning unchanged; hard-break the observation-only F_P handoff into one closed leaf receipt, then call each port only at its algebraic locus. |
| `direct_fold.ts`, direct-HoG prototypes, and E29 prototype runners | `temporary scaffolding` | Reuse a pure carrier only if it becomes the final fold input; delete every prototype runner and alternate path before closure. |
| Tests that import `hog/execute.js` or call `completeExecutableTraversal` | `replace` | Migrate to the installed `executeGraphTraversal` path or delete when they prove only the old engine. |

#### Migration Checklist

- [x] exact affected migration scope is named
- [x] excluded scopes are named and no compatibility scope is retained
- [x] old operative path and new authoritative path are named explicitly
- [x] producer, consumer, projection, package, and proof families are listed
- [ ] old path is removed from the normal and installed execution closure
- [x] mixed-state green behavior is explicitly inadmissible as closure evidence
- [ ] tests proving the mixed or direct old path are removed or repriced
- [x] recurring sequencing/failure/suspension mechanics consume Effect rather than a local rebuild
- [x] `library_usage: consume` and `governing_library: effect@3.22.1` are declared
- [x] this ticket carries only the TypeScript build-tenant lifecycle
- [ ] ticket wording, live code, package exports, and proof claims are reconciled

#### Functional Review Criteria

1. Walk the installed call path from each `public/operations.ts` invocation to
   `hog.executeGraphTraversal`, the one fold, each exact owner port, ABG event
   admission, Event Calculus, and replay. Record every function and file.
2. Reject the cut if that walk enters `completeExecutableTraversal`, an
   equivalent imperative coordinator, a nested Effect runner, or a Promise
   shell around old traversal control flow.
3. Verify that the fold consumes the closed admitted C algebra and that its
   main step is readable as a typed transform, not an orchestration loop with
   topology or semantic policy encoded procedurally.
4. Verify owner meaning remains in the existing exact owner ports and Effect
   supplies only composition, typed failure/Cause, suspension, provision, and
   physical scope.
5. Verify every retained C constructor and traversal relation reaches the same
   fold; a green scalar path cannot stand in for complete reachability.
6. Verify the semantic center was removed rather than renamed, split among
   helpers, or left behind a wrapper.
7. Compare exact results, refusals, event order, Event Calculus, and replay;
   passing counts alone cannot satisfy this review.

#### Operative structural closure gate

This is a `design_reframe` under the installed `SPEC_METHOD.md` Core Interface
Migration, Inside-Out Hard-Break, and Transformation Wave laws. Product,
requirements, owner meaning, and external interfaces remain unchanged. Section
5.6.1A of the ABI5 Realization Constitution is the local operative projection;
it does not restate or replace the shared method.

Its singularity claim is one admitted implementation-and-authority path per
accepted relation, not one runtime occurrence or one-to-one source mapping.
Product-required batch, retry, recursion, and child occurrences remain lawful
inside the one fold. Reconstruction uses the complete 5.6.2 basis, including
explicit verified physical preimages/resource bindings and owner-issued
successor handoffs; events do not recreate external physical state.

This gate applies only to HoG-bearing Public owner closures, currently run
invoke/continue. Other 18/56 definitions do not enter HoG. The 10,175-line
baseline and 2,550-line construction target are diagnostic evidence for
expected contraction only. Neither value is a pass/fail threshold, escalation
predicate, or substitute for walking every installed function and edge against
the singular owner-algebra laws below.

Structural conformance runs before behavioral proof and must reject every
counterexample it finds. C2A cannot advance while any of these predicates is
true:

| Check | Counterexample |
|---|---|
| `OCR-01` | The dynamic traversal fold is recursive, belongs to a call-graph SCC, or invokes another evaluator instance. |
| `OCR-02` | One Public operation invokes HoG more than once or invokes it from a loop. |
| `OCR-03` | The installed transitive graph reaches `execute.ts`, `completeExecutableTraversal`, or a distributed equivalent coordinator. |
| `OCR-04` | `Effect.promise` or `Effect.tryPromise` lifts a local HoG coordinator rather than an exact physical/Promise owner port. |
| `OCR-05` | `ExecuteGraphTraversalCommonInput` crosses from the fold into a locus or owner port. |
| `OCR-06` | An owner port returns `unknown`, or HoG constructs, repairs, validates, or totalizes an owner candidate/refusal. |
| `OCR-07` | The installed path has zero or multiple outer Effect runners, or a nested runner. |
| `OCR-08` | A production line-count comparison is used to accept, reject, or redirect the cut instead of evaluating semantic-owner singularity, exact prefix direction, native Effect composition, entity/lifecycle algebra, and negative reachability on the installed code path. |

The current checkpoint is deliberately red. Its expected signature includes:
recursive `graphTraversalEffect` calls; repeated Public continuation entry;
reachable imports and exports from `execute.ts`; a local leaf coordinator under
`Effect.promise`; `ExecuteGraphTraversalCommonInput` in locus modules;
HoG-authored `leaf_realization_candidate` failure totalization; and HoG LOC
above the ceiling. The sole shared `runEffectProgram` membrane is preserved.
Each repair must remove the reported operative relation, not rename, relocate,
or wrap it. The gate turns green only when a function-by-function installed
path walk and the mechanical predicates agree.

#### Impacted Interface Review Checklist

- [ ] `gtl/c_algebra.ts` and `gtl/source_path.ts` supply the admitted node and
  source coordinate without an executable rival representation.
- [ ] all `public/operations.ts` traversal call sites consume only the final
  `hog.executeGraphTraversal` contract.
- [ ] `hog/index.ts` exposes no old coordinator or alternate evaluator.
- [ ] `hog/graph_execute.ts` owns the one fold and has no call/import edge to
  `completeExecutableTraversal` or equivalent coordinator.
- [ ] coordinator control flow in `hog/execute.ts`, `structural_execute.ts`,
  `traversal.ts`, `traversal_route.ts`, and `retry_exit.ts` is deleted or
  reduced to exact pure derivations/owner ports consumed by the fold.
- [ ] `leaf_invocation_port.ts`, `child_traversal.ts`, judgment/result/route
  ports, and ABG admission modules retain their owner-local contracts and do
  not acquire traversal authority.
- [ ] Event Calculus, replay, continuation, and Public projections consume the
  same unchanged admitted events and do not rebuild traversal truth.
- [ ] `rival-authority-mutations.test.mjs`, `r9-causal-result-closure.test.mjs`,
  and `falsifiers/runtime-f09-worker.mjs` no longer invoke the old coordinator.
- [ ] installed traversal, conservation, retry, recursion, fan-out, Consensus,
  substitution, and Public sunny paths all enter the one fold.
- [ ] packed exports and generated JavaScript contain no reachable old engine
  or prototype runner.

#### Required Break Order

1. Freeze this best-guess interface inventory before using tests as closure.
2. Change the F_P source contract first: worker execution returns the existing
   ABG-validated request/observation relation; the owner returns that relation
   with the unchanged semantic candidate as one closed immutable leaf receipt;
   remove observation-only, unknown-return, mutable-capture, and Deferred/Ref
   handoffs across every direct producer and consumer. Freeze this interface
   cut before B1/B2.
3. Establish the direct Effect fold over the existing admitted C algebra and
   exact owner ports without calling any old coordinator.
4. Sever `graph_execute.ts -> completeExecutableTraversal` and keep it broken.
5. Repair outward through identity/leaf, compose/edge, batch/fan-out,
   workflow/recursion, retry/continuation, and terminal projection relations.
6. Rebind all Public/package consumers to the one fold.
7. Delete the old coordinator paths and prototype runners; migrate or delete
   direct-old-path tests.
8. Run structural negative reachability first, then focused behavioral
   conservation and the source-blind installed sunny paths.

#### Break-To-Closure Map

| Break | Deliberately severed seam | Closure clause |
|---|---|---|
| `B1` | New fold may not call the old engine | New authoritative producer and deepest kernel exist without proxy implementation. |
| `B2` | `graph_execute.ts` loses its import/call to `completeExecutableTraversal` | Public and HoG have one operative evaluator. |
| `B3` | Structural/retry/workflow/recursion coordination leaves old loops | Every C relation consumes the same fold and exact owner ports. |
| `B4` | Direct old exports, tests, and prototype runners are removed | No old consumer, temporary scaffold, or package path remains authoritative. |
| `B5` | Installed proof cannot bypass the new fold | Runtime, events, replay, projection, and proof share one closure law. |

#### Mixed-State Negative Proof

Before behavioral green is considered:

- static import and package scans must find no path from
  `executeGraphTraversal` to `completeExecutableTraversal`, no exported old
  coordinator, and no packaged prototype runner;
- the old symbol must be unavailable to normal and installed consumers rather
  than merely unused by one test;
- removing or refusing the new fold must make Public traversal fail closed,
  proving there is no fallback to the old engine;
- every direct-old-path test must be deleted or migrated before its result is
  counted; and
- an independent reviewer must repeat the complete function-by-function code
  path walk. A mixed-state green suite, export-count check, or wrapper-level
  unit test cannot close C2A.

### Construction sequence

| Step | Functional work | Mechanical evidence | State |
|---:|---|---|---|
| `W2-C0` | Consume the accepted W1 interface receipt; refresh the exact 56-row endpoint/contract/dependency/deletion join; apply only the catalog/workspace/definition-coordinate reconciliation above. | Exact W1 receipt; refreshed 56-row join; zero key diff; explicit construction dependencies; clean reconciliation diff. | Complete - frozen external-contract/deletion evidence; not a primitive-basis decision |
| `W2-C1` | Prove one unexported vertical function chain through existing owner relations: create/open -> verify -> resolve -> install -> bind -> catalog admit/view/apply -> invoke -> result/replay. | Direct installed chain proof; JSON round-trip at every boundary; no new Public export or adapter. | Complete as construction evidence at the maximal pre-admission boundary; prior owner-port interpretation superseded |
| `W2-C1F` | Recursively classify all 56 external definitions; close the minimal installed basis; retain Effect 3.22.1; specify one serializable execution ingress, closed topology-arm families, exact grant/receipt/load identity, private provider closure, and fixed recursive initial-to-final prefix relations. | Exact 56-row classification and ordered trace; Table 5.6.3-D closed family/arm projection; one outer candidate and arm-indexed `DefinitionCall`/`DefinitionReturn` family; exact definition/family/arm/owner-leaf/occurrence/scope/predecessor identity; complete grant basis; child receipt journals and successor handoffs; Section 10.1.3 foundation ledger; no executable plan, Public composition, outer child transaction, `providerLayer`, or authority amplification. | Historical held candidate; non-operative |
| `W2-C2` | First close C2A: directly fold the admitted C algebra through exact owner ports and delete the reachable imperative engine. Then complete the D01-D15 source-independent bindings on that basis after C1F/D6 is lawfully resumed. | C2A code-path walk and negative reachability; exact behavioral conservation for results, refusals, ordered events, projections, Event Calculus, and replay; later source and packed load/callability probe for all 56 bindings; superseded coordinators and prototypes unreachable or deleted. | Historical checkpoint evidence; non-operative |
| `W2-C3` | Construct the structural envelope, intrinsic definition family, indexed admission, exact one-binding invocation, indexed outcome projection, schemas, SDK, CLI grammar, Codex sibling transport, PFC-F07 proposals, Product PFC-F08 binding, contract-group exports, and manifest rows from that family. | Exact-set equality and new candidate digest; generator idempotence; projection equality; package dependency closure. | Deferred historical backlog; non-operative |
| `W2-C4` | Atomically export the replacement family and delete the legacy carrier, parser, semantic controller, schema synthesis, parallel manifest roster, aliases, compatibility tests, and legacy proof projections. | One installed 18/56 family over the closed primitive basis; zero reachable legacy or new-to-old translation; `git diff --check`. | Deferred historical backlog; non-operative |
| `W2-C5` | Pack once and execute the two installed sunny paths and compact changed-boundary guards below through both SDK and CLI. | One exact artifact, interface receipt, scenario receipts, event/replay receipts, and guard vector. | Deferred historical backlog; non-operative |
| `W2-C6` | Freeze one exact candidate for independent review and Executive disposition. | HEAD/tree or synthetic tree, status hash, patch hash, tarball/package/manifest/family digests, no moving files. | Deferred historical backlog; non-operative |
| `W2-C7` | Accept the exact Product/Public interface substrate and unlock final Wave 3 Public binding and Wave 4 host projection. | Accepted frozen interface handoff; no M5 or release claim. | Deferred historical backlog; non-operative |

The HoG algebra and Effect selection were fixed for this historical cut. C2A
was the inside-out hard break. This paragraph supplies no current construction
authority. One cold
code review of the frozen C2A subject must walk the full installed function
path; it may not accept test counts or a moving tree. A materially different
Product, owner, event lifecycle, 18/56 family, or Wave 1 interface decision
returns to the Executive.

At C5 the tarball contains the entire 18/56 family, every direct,
statically composed, and projection callable and
runtime dependency, every required schema and static catalog row, and a
mechanical load/callability probe for every definition binding. The sentinel may execute only its
two representative paths; package constructability may not be reduced to
sentinel dependencies.

### Atomic Public replacement

The replacement production path consists only of:

```text
public/envelope.ts
  -> public/definition_family.ts
  -> public/invocation_admission.ts
  -> public/resource_state_admission.ts
  -> selection.loadedDefinitionBinding.invoke(...)
  -> public/outcome_projection.ts
```

`public/project_read_contracts.ts`, `public/schema_projection.ts`, and
`public/sdk.ts` are total structural projections of owner packets and the one
family. CLI parses one generated grammar and invokes the same SDK/Public path.
`abg.codex` may remain an exact-sibling process transport of that grammar; its
host-specific behavior is Wave 4 proof, not a second Wave 2 operation family.

Intrinsic definitions contain declarative source-independent execution-binding
specifications, one complete closed topology family and total arm selector,
exact owner-resource contract/atomicity references, output allocations, and the
required stateless provider-capability set, never loaded callables or resource
values. Those fields
enter intrinsic definition and callable-contract identity. The installed
binding loader resolves each specification under the admitted lock and Product
set, constructs/provides its exact stateless Layer once inside a private
closure, freezes one real direct, statically composed, or projection callable,
and emits a minimal source-blind evidence receipt. No Layer escapes. The receipt
proves exact specification/callable/module/contract, complete family/arms,
provider-capability, owner-binding types, and resolved-provider equality. It
itself never enters intrinsic definition, family, Product-content, invocation,
event, or replay identity.
Factorization maps and ordered primitive traces are non-executable assurance
evidence and are never loaded. Public receives the already loaded binding and
does not resolve modules, sequence factors, interpret a plan, construct owner
contexts, choose owner dependencies, open a semantic runtime, scan events, or
switch on operation identity. GTL.TypeScript remains the sole Product program
language. Pure relations consume immutable inputs. The one
`PublicExecutionCandidate` carries the unchanged semantic envelope plus one
sibling resource assertion. After semantic admission, the definition's total
selector derives one arm and the call supplies exact resource identity,
locator, expected version, provider, complete grant-use basis, and owner
refinement. Resource access/commit derives from that arm, not an operation
mode or resource candidate. Effectful
owner leaves consume the exact explicit state, including acquisition/handoff or
durable prefix where applicable, and each returns its typed mechanical receipt,
successor state, and handoff before dependent work. Each fixed physical or ABG
leaf owns its existing atomicity boundary; `E29-E32` thread the separately
durable dynamic child journal inside HoG/ABG and expose only fixed initial/final
prefixes to Public. No definition-wide transaction is added.
The exact semantic owner consumes the receipt and applies its frozen `Rnn` only
after the transition or replay truth that `Rnn` classifies. Public validates
the call and loaded-binding relation structurally; it neither resolves nor
operates on a resource, sequences leaves, interprets receipts, nor applies
`Rnn`.

The atomic swap deletes or wholesale-replaces at least:

- `public/contracts.ts`, including `RootPublicInvocation`, the 11/19 roster,
  parser, aliases, and generic result family;
- `public/operations.ts` and every semantic handler/switch;
- `public/schema.ts`, `public/outcome.ts`, and Public-owned child traversal;
- the legacy `contracts/schemas/public-operation.schema.json`;
- independent Public rows in `generate-product-manifest.mjs`;
- legacy R10 transcript/outcome/event/governor projections; and
- test assertions whose subject is the old carrier, parser, roster, schema,
  generic refusal collapse, old spelling, object/store brand, or volatile
  duplicate behavior.

Lawful setup, external Product, F_P, Consensus, continuation, replay,
portability, and installed scenario meaning is rewritten against exact
`{ operationId, memberKey }` definitions. A file path may be reused only when
its old export, carrier, handler, parser, alias, and semantic branch are gone.

### Installed sunny paths

Exactly two table-driven Product paths gate Wave 2 functional closure. Each is
run from the clean packed artifact once through the installed SDK and once
through the installed CLI on independent equivalent workspaces. Every carrier
is JSON-round-tripped. Every effectful successor is consumed from another Node
process using only the exact owner-issued durable prefix and close handoff.

```text
S1 direct Product path
  workspace.create(clean)
    -> workspace.open(open)
    -> product.verify(verify)
    -> product.resolve(resolve)
    -> product.install(install)
    -> workspace.bind(bind)
    -> catalog.admit(admit)
    -> project.read(catalog_list | catalog_describe)
    -> catalog.view(allowlist)
    -> catalog.apply(node_type)
    -> run.invoke(invoke) over the frozen Wave 1 scalar Program
    -> project.read(run_result | run_replay)

S2 held interaction path
  equivalent exact setup plus catalog.apply(overlay)
    -> run.invoke(start) over the frozen Wave 1 mixed F_H Program
    -> project.read(run_status | run_gaps | run_lawful_actions)
    -> interaction.respond(approve)
    -> run.continue(current_intent)
    -> project.read(run_result | run_replay) after another process restart
```

SDK and CLI outcomes, nested refusals, adapter exit classes, admitted events,
successor handoffs, Event-Calculus truth, and replay projections must be
canonically equal for equal inputs. The sunny paths do not claim packed Hello,
One Surface, Consensus, native host, self-conformance, qualification, or
release success; those remain their selected later waves.

### Compact changed-boundary guards

Four compact guard tables protect only the new coupling boundary:

1. **Singular exact family** - exact 18/56 set and digest, unique composite
   identities, equality across family/schema/SDK/CLI/PFC-F07/PFC-F08/manifest,
   generator idempotence, and zero reachable legacy name or fallback.
2. **Exact selection and owner call** - wrong operation, member key, definition
   digest, contract slot, or cross-definition output refuses at its selected
   structural frontier; the exact loaded definition binding runs once; all five common
   refusal codes preserve their exact nested evidence.
3. **Authority and restart** - workspace open, catalog, and every read are
   eventless; effectful duplicates derive from admitted truth after restart;
   a refusal consumes no effect; equal prefixes in a fresh process reproduce
   equal currentness/result/replay.
4. **Publication and adapter parity** - the accepted PFC-F08 success relation
   and eight typed refusal rows remain exact and eventless; SDK and CLI preserve
   identical invocation identity, outcome, nested refusal, and exit class.

Complete variant success, malformed-input, collision, permutation, retry,
transport, topology, refusal, and cross-feature matrices are retained for the
integrated M5 candidate. A newly found counterexample gates Wave 2 only when it
invalidates one frozen interface, owner, singular-authority relation, or sunny
Product path.

### Immediate drift stops

Stop the Wave 2 cut immediately if it introduces or retains:

- `RootPublicInvocation`, `ROOT_PUBLIC_OPERATION_DEFINITIONS`, `legacyRequest`,
  `indexedRequest ?? legacyRequest`, a new-to-old translation, alias, fallback,
  or second family;
- a Public semantic switch, handler, context builder, event interpreter,
  catalog aggregation, owner selection, or process-local run/read authority;
- an executable binding represented only by an interface, string, locator,
  registry, callback, declarative specification, or test implementation;
- an endpoint, file, export, interface, or port count used as evidence of a
  primitive basis;
- a bespoke primitive that reproduces an accepted project/library function;
- a multi-owner or multi-stage endpoint without one ordinary statically
  composed installed TypeScript callable and non-executable factorization
  evidence;
- Public resolution, sequencing, plan interpretation, or composition;
- resource fields inside semantic `requestCandidate`, a second resource API,
  adapter-specific execution carrier, caller-selected arm/mode, optional slot
  standing in for a closed arm, or a later call without the exact prior
  successor receipt/handoff;
- a second executable plan, DSL, interpreter, generated HoG Program, factor
  registry, runtime-loaded factor trace, invocation adapter, or new-to-old
  translation carrier;
- an Effect workflow, retry, persistence, state, clock, scheduler, concurrency,
  event, currentness, or replay authority;
- a definition-wide or provider-created transaction that groups independently
  durable owner leaves, ABG appends, physical effects, or replay; or an
  `E29-E32` dynamic HoG/ABG child list encoded as intrinsic Public topology;
- `Rnn` applied before the mechanical transition/replay truth it classifies,
  or a transition whose committed, idempotent-no-new-commit, residue,
  compensation, or substrate-fault evidence is discarded;
- an intrinsic definition, callable contract, call, transition receipt, loaded
  binding, load receipt, or host receipt that omits or disagrees on the exact
  topology-family/complete-arm/selected-arm/selector digest, definition,
  owner-leaf occurrence/scope/predecessor, required provider-capability set,
  complete grant-use basis, resolved provider identities, allocation law, or
  successor handoff;
- an exposed `providerLayer`, Layer construction in Public, Effect `Resource`
  used as durable/current truth, `@effect/platform` added without satisfying
  its recorded falsifier, or local reconstruction of filesystem/Event Store
  mechanics already supplied by the selected foundation composition;
- a logical owner ref used as a physical resource identity, an unscoped
  provider identity, an observed version that differs from the expected
  version, an alias/collision check performed after effects, or a successor
  binding not issued by the exact owner leaf;
- universal content-addressed allocation, ambient idempotence, or generic
  provider semantics for publication, subprocesses, external side effects,
  deletion, ABG event meaning, or arbitrary GraphFunction effects;
- an installed load receipt entering intrinsic definition, family,
  Product-content, invocation, event, or replay identity;
- a catalog runtime event, Event-Calculus catalog fluent, persistent catalog
  registry, object brand, or context-local catalog/application truth;
- an SDK, CLI, schema, manifest, PFC-F07, or test fixture with an independently
  authored operation/key roster or semantic default;
- a schema library transform or projection that changes owner meaning;
- a Wave 1 owner/carrier/event/handoff/projection change outside the exact
  F_H-authorized closed F_P leaf receipt and the three explicitly excluded
  legacy Public relations; or
- donor code that imports, constructs, or assumes the rejected Public family.

Do not stop for owner-local callable names, exact carrier fields, helper
placement, Valibot/Effect composition inside their accepted bounded roles, or
one obvious implementation algorithm inside the accepted owner boundary. The
worker decides those HOW relations.

### Historical review and acceptance boundary - non-operative

The historical C2A review asked whether the installed Public path directly reached
one Effect fold and exact owner ports, whether every old coordinator and
prototype is unreachable, and whether exact behavior is conserved. It must
inspect the live function call path and the mixed-state negative proof. C1F/D6
remains held and is outside this review.

The frozen C6 review asks only:

- Is there exactly one 18/56 external definition family, one loaded binding per
  row, and one closed minimal primitive basis rather than 56 presumed atoms?
- Does Table 5.6.3-D cover every exact definition key and every closed arm with
  its canonical slots, pre-state, provider capabilities, owner leaf or nested
  child journal, allocation law, successor state, and handoff, with exact
  family/arm equality preserved through call, receipt, callable contract, load
  receipt, and host receipt?
- Does Public perform only admit -> select -> call -> project?
- Are catalog readiness/view/application and workspace open eventless?
- Do runtime mutation outcomes and runtime reads derive from ABG events and
  Event Calculus, while pure Product reads remain eventless?
- Are SDK, CLI, schemas, catalog rows, manifest, and Codex transport projections
  of the same family?
- Does the clean tarball load and call all 56 definition bindings and execute S1/S2
  across real process restarts?
- Does every composition preserve exact results, refusals, ordered admitted
  events, projections, replay, leaf-local receipts, successor bindings,
  residue/compensation evidence, and handoffs, with no enclosing generic
  transaction and semantic authority retained by its exact owner primitives?
- Is every legacy carrier, parser, semantic switch, schema, projection, and
  compatibility test unreachable or deleted?

Wave 2 acceptance freezes the Public definition, invocation, outcome, SDK, CLI,
schema, manifest, PFC-F08, execution-binding specification/load, primitive
basis, non-executable factorization evidence, statically composed callable,
and transport receipt interfaces. Wave 3
may add Product definitions and scenarios through those interfaces; it may not
change the family or add a feature-specific execution path.

Execution estimates are based on the fixed minimal basis, missing primitive
leaves, installed bindings, and displaced paths to delete, never on 56 endpoint
rows. Package footprint is optimization evidence only; it does not reopen the
selected Effect foundation. Any further Wave 1 interface change returns to the
Executive.

## Prior C2A Slice — prerequisite checkpoint history

This section records the producing refactor that precedes the current sentinel.
It does not select current work or reopen Wave 1.

The selected implementation increment is
`w2_c2a_hog_effect_hard_break`, starting from code basis `de506b57`. Preserve
the accumulated owner-local Product, GTL, ABG, catalog, event, Event Calculus,
and replay work. Rejected candidates remain evidence only; do not reset the
tree or resume C1F/D6.

```text
admitted CProgramNode + exact cursor/scope
  -> one Effect fold
  -> exact owner port at the current locus
  -> ABG-admitted event
  -> Event Calculus/replay projection
```

Implement the declared break order above. First freeze the bounded F_P
source-contract migration with the old observation-only and unknown-return
signatures rejected. The next accepted checkpoint must sever
`graph_execute.ts -> completeExecutableTraversal`; each later checkpoint must
reduce the remaining old reachability. Do not count a green test until the
break it claims is structurally closed. Stop only for a required change beyond
the authorized F_P receipt to Product, requirements, accepted design, owner
meaning, event law, Public interfaces, or the 18/56 family.

### Retained Construction — Setup And Invocation Authority Reconstruction

This retained increment removed reachable `RootOperationState` and
process-local setup/invocation semantic authority. It is limited to complete
verified-carrier revalidation, exact explicit-prefix ABG setup/run
reconstruction, one common effectful invocation identity projection across
install, bind, run, respond, and continue, and directly required proof/support
migration. Catalog admission remains pure and eventless; the increment adds no
Product operation, event, runtime, catalog, store, controller, Public-authored
meaning, donor, or compatibility path.

### Accepted Increment — TV5 Nested Retry Exit

The accepted TV5 increment was governed by
`ABI5_REALIZATION_CONSTITUTION.md` Sections 5.1–5.5 and 10.2–10.7. It preserved
the accumulated catalog contraction and corrected the demonstrated nested-retry
completion boundary:

```text
held F_H cursor H
  -> admitted response and exact owner-derived successor S
  -> GTL-derived target T or terminal
  -> common same-basis rooted-topology partition(S, T)
  -> direct ABG owner construction of predecessor-linked progress rows
  -> one existing ABG progress-and-route transaction
  -> Event Calculus and replay reconstruction
```

The common addition ends at a complete immutable partition or structural
refusal. It receives no carried domain value, evidence transformer, candidate
constructor, owner refusal mapper, or runtime-selected adapter. ABG retains
candidate/refusal meaning and admission.

#### Accepted TV5 Coding Plan

The F_H proxy accepted the bounded coding plan on 2026-08-08 after one cold
Max review, one bounded plan repair, and a passing delta review. Implementation
is authorized only within this relation:

- add private `shared/rooted_topology_partition.ts` as one
  `catalog_addition_proposal`;
- derive exact GTL retry-topology witnesses in `gtl/source_path.ts` from
  `graph.template.graphRef`, `graph.materializationRef`,
  `graph.materializationDigest`, node ref, retry term path, and task ordinal;
- represent terminal as the same graph/materialization root with an empty
  segment path;
- return only detached, deeply frozen `preserved`, `exited`, and `entered`
  segment refs or one closed refusal:
  `invalid_witness | topology_mismatch | basis_mismatch | root_mismatch |
  adjacency_mismatch`;
- keep GTL context maps and outward refusals owner-local; common code accepts
  no callback, mapper, carrier value, evidence, candidate constructor, or
  runtime adapter;
- replace only the equivalent successful-exit, stopped-cascade, HoG depth-gate,
  completed-chain, and blocked-route partition computations in
  `abg/retry.ts`, `abg/traversal_route.ts`, and `hog/retry_exit.ts`;
- preserve H-to-S admission, attempt/boundary identity, predecessor and causal
  law, route semantics, ABG transaction ownership, Event Calculus, replay,
  child/foldback, Public, schemas, exports, and dependencies.

The exact authored file boundary is six production files and five proof
files:

```text
code/src/shared/rooted_topology_partition.ts
code/src/gtl/source_path.ts
code/src/abg/retry.ts
code/src/abg/traversal_route.ts
code/src/hog/retry_exit.ts
code/src/hog/execute.ts
test_env/tests/t287-tv5-rooted-topology-partition.test.mjs
test_env/tests/t287-r6-retry-success-exit.test.mjs
test_env/support/t287-tv5-success-reconstruction-worker.mjs
test_env/falsifiers/t287-r3-reopen-route-worker.mjs
test_env/tests/m5-installed-retry.test.mjs
```

Focused stopped-unwind execution exposed one pre-existing competing HoG seam:
an ABG-admitted blocked retry transition was reclassified through
`completeFailedTraversal`, so the existing blocked-route owner never consumed
the admitted stopped-progress suffix. The F_H proxy extended the production
boundary by `hog/execute.ts` for exactly one repair: pass the admitted result,
judgment, reason, and complete `stoppedProgresses` relation to the existing
`completeBlockedTraversal`. No other execution branch or lifecycle meaning is
authorized to change.

The cold stopped-route proof already reconstructs and validates the exact
GraphFunction but its existing `admitRoute` call omitted that required field
from `BlockedRouteAdmissionEvidence`. The proof boundary therefore includes
`t287-r3-reopen-route-worker.mjs` for the sole migration of passing its exact
reconstructed `graphFunction`; production authority may not become optional
or infer the missing value.

The stale-selector mutation still refuses after that migration, but now at
the stronger exact-coordinate invariant rather than the obsolete cardinality
message. The proof boundary includes `m5-installed-retry.test.mjs` only to
match that one negative wrapper to the exact retry-path rejection message;
the mutation and expected refusal remain unchanged.

Qualification exposed one bounded proof-integration migration outside the
semantic TV5 subject. Current ABG CCall and route admission contracts require
the exact already-held GraphFunction coordinates, while four direct JavaScript
proof consumers retained their prior call or evidence shape. The F_H proxy
therefore adds only these verification consumers to the authorized file
boundary:

```text
test_env/falsifiers/runtime-f08.mjs
test_env/falsifiers/runtime-f09-worker.mjs
test_env/tests/m5-event-calculus-runtime.test.mjs
test_env/tests/r9-causal-result-closure.test.mjs
```

The known migration threads the existing exact `graph`, `graphFunction`, and
traversal cursor through 15 CCall lifecycle calls and adds the existing exact
`graphFunction` to five route-admission evidence objects. Within these same
four verification consumers, the worker may also thread a mechanically omitted
required owner carrier already held at that call site. This decision envelope
does not authorize a new lookup, inference, constructor, carrier meaning,
mutation, refusal oracle, event basis, production change, optional carrier, or
additional file. The frozen delta must report the final exact carrier census.
This is a proof-only qualification repair; it does not enlarge the accepted
TV5 semantic candidate.

The R9 closure negative already contains one intentional owner-bypass
corrupted-prefix blocker. It is not a lawful retry attempt and may not be cited
as owner-admitted retry truth. Its sole additional migration is to the current
structural event contract: derive `attemptManifestRef` from the exact held
basis/input coordinates, recompute `attemptDigest` and `attemptRef` from the
minimal synthetic body, and retain the deliberately invalid terminal-route
cause. The retry owner must still refuse to rehydrate that row. The control
closure, exact blocking-fluent refusal, zero-append, unrelated-route, and
stale-prefix oracles remain unchanged. No other raw event basis may move.

The AX-F09 A-B-A fixture has authored topology after its retry leaf: one root
workflow child that holds at an F_H interaction. Its retained attempt-four
terminal-route oracle is therefore stale. The F_H proxy authorizes a proof-only
correction in `runtime-f09-worker.mjs` and `runtime-f09.mjs` to prove the exact
attempt-four success judgment, single completed retry progress, advance route
to the authored workflow, child F_H hold route, and parent/child held
suspension lineage. The proof must also establish zero attempt-four terminal
route and zero root closure. It may not change production, fixture topology,
the A-B-A mutation, retry counts/signals, or the wrapper test.

The AX-F08 proof currently obtains its unrelated active Run S by executing the
deferred Wave 3 One Surface/Consensus path. That prerequisite fails before any
paired AX-F08 mutation or oracle is exercised and is not evidence of a TV5 or
Wave 1 production defect. The F_H proxy authorizes one proof-fixture-only
replacement in `runtime-f08.mjs`: remove the Consensus-backed S dependency and
reuse the file's already-supported installed terminal-F_H developer mini-
Product as the direct, held, active disjoint Run S. Run S and each requested
root Run R must each consume its own exact admitted ProductInstall,
WorkspaceBinding, and CatalogView environment on the same authentic durable
event store; the mini-rooted and ABIogenesis-rooted bindings may not be
collapsed, weakened, or inferred from ProductSet membership. The mini
publication variant must retain only the existing mixed terminal-F_H Program,
GraphFunction, contribution, and their exact declared contract/implementation
closure; deferred One Surface rows may not remain a validation prerequisite.
This is row selection from already-published meaning, not authority to invent a
replacement definition or closure. Preserve two
distinct Runs, the owner-admitted S-scoped `runtime_failure_observed` event as
the sole interleaving mutation, exact pre-target R replay/input/basis equality,
all eight target dispositions and event/ref/replay comparisons, the physical
global-coordinate shift, no R causal reference to S, and every invalid-
prerequisite masking control. This is a `realization_refactor` of fixture
mechanics only. It may not change production, Public contracts, Consensus, One
Surface, event admission, the AX-F08 mutation or oracle, or any other file.

After those authored files are stable, the existing
`scripts/refresh-candidate-basis.mjs` owner must mechanically refresh
`test_env/fixtures/abi5-root-candidate-basis.json` so installed verification
names the exact packed candidate. This generated identity projection is not a
ninth semantic edit, may not be hand-authored or bypassed, and must be refreshed
again after any subsequent authored change before the candidate freezes.

Retained focused proof includes the isolated common laws, deterministic complete-
partition construction through the authentic installed owner path, H distinct
from S with S as route source, retry success, stopped unwind, refusal and
rollback, and a distinct-Node-process reconstruction of both completed retry
owners and the historical route from the durable prefix. PID-2 derives S from
durable H plus the admitted resume successor input and verifies the existing
H-to-S and admitted-cursor relations; it does not assume a stored full-S
carrier or add a projector. No proof-only grouping operation may be invented
where production has no grouping seam. The worker freezes one exact candidate
after focused checks. Full serialized qualification remains at the integrated
M5 candidate after Waves 1–4 compose over their frozen interfaces.

#### Ratified TV5 Proof-Bookkeeping Exception

The F_H proxy approved one proof-only evidence-bookkeeping repair in
`test_env/tests/m5-traversal-conservation.test.mjs`, and the frozen delta passed
cold review. The pre-repair content SHA-256 was
`780459e34247cef87a58616b8d3d8adf00742532642b32e3c3b9eba3bc689227`; the
repaired content SHA-256 is
`da2664ab024098568537062a923b6c7974008b5c71465b63d7d6c711116ff4a1`.
The exact `+3/-59` repair removes six stale `CURRENT_DEPENDENCY_RED` entries,
changes the expected status census from `34 proven / 6 dependency_red` to
`40 proven / 0 dependency_red`, and changes the exact expected-red roster to
empty. All 40 row definitions, semantic oracles, immutable RC5 witnesses,
mutations, scenarios, and unconditional row execution remain unchanged.

This exception changes evidence bookkeeping only. It does not expand TV5,
Product, requirements, or design, and it is not A5-F10 or Wave 1 qualification.

#### Ratified TV5 Opened-CCall Projection Exception

The F_H proxy extends the TV5 production boundary to `code/src/abg/c_call.ts`
for one local reconstruction repair and its regression in
`test_env/tests/t287-r6-retry-success-exit.test.mjs`. Both private branches used
by `projectOpenedCCallCarrierAtPrefix` must use one private generic coordinate
predicate: one safe positive integer `attempt` and an array of safe positive
integer `retryPath` entries. Generic opened-CCall projection does not require a
non-empty retry path or equality between `attempt` and its final entry. The
proof reconstructs an owner-generated and admitted attempt-greater-than-one
leaf CCall with an empty retry path from the existing bounded-recursion path,
and separately reconstructs the existing published flat `workflow.C` open and
fibre to prove the workflow branch uses the same generic predicate.

This exception changes no Product, design, event, identity, admission, export,
or package meaning. Coupling between retry attempt and retry-path tail remains
owner-local to retry admission and projection.

## Hard Invariants

- ABG-admitted events are the sole runtime transformation truth.
- Published GTL definitions are the sole GraphFunction semantic truth.
- The GraphFunction catalog is one reconstructible HoG tool, not an admitted
  runtime entity, registry authority, event family, or replay projection.
- Event Calculus over an explicit validated immutable prefix is the sole
  runtime-currentness relation.
- Release currentness is the exact immutable requested/committed cut, manifest,
  originating request, owner outcome, and owner-issued publication receipt; it
  is not runtime currentness and never consumes an ABG prefix.
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

Wave 1 functional interface closure is the accepted historical record above;
it is not reopened by this ticket. T-287 closes only when all five waves and
the immutable 5.0 release close.
