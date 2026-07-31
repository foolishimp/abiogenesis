# REVIEW: ABIogenesis 5.0 Function-To-Axiom Gate 1

**Author**: Codex

**Date**: 2026-07-31T05:18:41Z

**Addresses**: ABIogenesis 5.0 installed-root construction map and Gate 1 at `08cd748515d3776bc6637412ceb2f99b27fc8a98`

**Status**: Open

## Summary

Gate 1 remains rejected.

The frozen implementation contains four connected classes of failure:

1. Public setup and product verification use process and object identity to
   decide whether an otherwise valid operation may reach ABG admission.
2. The public definition family is incomplete relative to the selected
   18-operation, 56-definition-key Product contract.
3. GTL validation and HoG execution do not preserve one canonical,
   pre-effect, replay-sufficient executable identity.
4. ABG Event Calculus and continuation/closure admission do not consistently
   derive scoped runtime truth from the applicable event prefix.

Deleting `RootOperationState` alone cannot repair this boundary. The corrected
construction map must cover every rival authority, the missing durable
carriers, topology and identity normalization, scoped Event Calculus law, and
the accepted-design clauses that currently prescribe object-local authority.

No Product, requirement, design, code, schema, test, or proof file was edited
during this review. This post is commentary, not ratified law.

## Frozen Subject And Review Basis

| field | value |
|---|---|
| repository | `abiogenesis-5-root-build` |
| branch | `codex/t286-abi5-root` |
| HEAD | `08cd748515d3776bc6637412ceb2f99b27fc8a98` |
| tracked tree before review | clean |
| pre-existing untracked commentary posts | eight, preserved |
| implementation edits | none |
| Gate 2 | not started |
| governing method for this review | STDO `2.2.2`, tag commit `0519129d63de10822ae6353fa0c5ce05d56f13e9` |

The repository's embedded STDO 2.2.0 pin is stale and is rejected as the
governing review basis. It remains a repository migration defect until the
consumer authority surfaces are explicitly updated. This review does not mix
2.2.0 and 2.2.2 clauses.

STDO 2.2.2 supplies the review method:

- evaluate the smallest causally closed affected decision set;
- derive local realization from Ontology, Prime atoms, and the Irreducible
  Architectural Carrier Set;
- prove one authority seam for each semantic boundary;
- reject controller-local lifecycle truth when events, replay, graph, or
  admitted carriers own that truth;
- map domain, sequence, and state views through cross-view axioms;
- preserve exact subject identity and reproducible closure evidence.

ABIogenesis Product, requirements, and accepted design supply the
domain-specific axioms evaluated below.

## Axiomatic Constraint Network

The applicable constraint network is:

```text
exact packed Product and installed public contract
  -> complete canonical public operation family
  -> immutable verification and resolution carriers
  -> admitted install, workspace, catalog, and view authority
  -> complete canonical Program and graph validation
  -> admitted implementation resolution and ExecutionBasis
  -> direct HoG traversal of the admitted GTL graph
  -> ABG-only event admission and Event Calculus
  -> scoped replay-derived result, continuation, and closure
  -> identical SDK, CLI, installed, restart, and replay observations
  -> exact-candidate qualification
  -> immutable RC and stable release
```

The principal global axioms are:

| axiom | required invariant |
|---|---|
| `A5-F01` | exact source-blind product, install, workspace, and catalog |
| `A5-F02` | complete GTL authoring, canonical serialization, validation, and malformed-program refusal |
| `A5-F03` | complete graph/C/traversal execution without lowering or feature runners |
| `A5-F05` | one public contract authority |
| `A5-F06` | thin public SDK and CLI, not controllers |
| `A5-F09` | admitted catalog semantics govern application and invocation |
| `A5-F10` | one causal event-sourced episode; replay, not caller memory, derives state |
| `A5-F14` | source-blind packed deterministic and live probabilistic proof |
| `A5-F15` | exact-candidate qualification |
| `A5-F16` | immutable RC and stable release identity |
| `A5-F17` | installed-public-contract portability for an independent Product |

The most load-bearing lower-level laws are:

- `REQ-R-ABG3-EVENTS-001`: `emit()` is the only runtime-truth write path.
- `REQ-R-ABG3-EVENTS-002`: runtime truth reconstructs from events plus declared
  GTL surfaces.
- `REQ-R-ABG3-EVENTS-032`: effectful public-operation artifacts have
  scope-keyed event/fluent truth and conflicting scope digests fail closed.
- `REQ-R-ABG3-CONTINUATION-011/-012`: current-intent continuation and fresh
  next-action selection remain distinct admitted paths.
- `REQ-L-GTL3-C-ALGEBRA-014/-016`: graph algebra and validation refuse invalid
  topology before effects.
- `REQ-L-GTL3-LAWS-021`: canonical semantic identity cannot depend on transport
  order.
- `REQ-P-PUBLIC-CONTRACTS-013`: the complete public definition family projects
  consistently through native types, schemas, SDK, CLI, runtime, and replay.
- `REQ-P-SCENARIOS-008/-010/-012/-013`: S01, S03, S05, and S06 prove the
  installed causal path rather than component or event co-presence.

## Verdict Table

| ID | severity | local defect | global break | origin |
|---|---|---|---|---|
| F01 | Critical | `RootOperationState` and context `WeakMap` own setup truth | A5-F01/F06/F10/F14/F17; S01/S05/S06 | implementation plus accepted-design contradiction |
| F02 | Critical | verified native evidence is attached by object identity | source-blind verification and resolution are not reproducible | implementation plus accepted-design contradiction |
| F03 | Critical | current public family has 11, not 18, operations | one public contract and S06 portability are incomplete | implementation/design incompleteness |
| F04 | Critical | Event Calculus projects one unkeyed artifact fluent | scoped artifact truth and digest collision law are absent | implementation plus stale-design contradiction |
| F05 | Critical | whole-program validation omits topology laws | invalid Programs execute effects before refusal | implementation plus incomplete design conservation |
| F06 | High | `CatalogApplication` admission is a store/object brand | catalog selection cannot survive reconstruction | accepted-design contradiction |
| F07 | High | invocation source-result basis is a `WeakSet` brand | recursive/chained invocation depends on object identity | accepted-design contradiction |
| F08 | High | cursor, continuation, and closure compare against global tail | unrelated runs change scoped admissibility | implementation defect |
| F09 | High | retry values live only in an executor-local `Map` | restart changes executable traversal behavior | implementation/IACS defect |
| F10 | High | caller order enters `ProgramValidation` identity | equal Program sets produce rival execution/replay identities | implementation defect |
| F11 | High | typed owner refusals collapse to prose `owner_refusal` | public negative semantics and qualification evidence are lossy | implementation/public-contract gap |
| F12 | High | `pendingReopenAuthority` implicitly selects the log | retained and fresh contexts read different prefixes | implementation defect |
| F13 | High | duplicate invocation identity is a volatile pre-admission `Set` | failure, retry, restart, and continuation use different identity laws | implementation defect |
| F14 | Low | default `localeCompare` participates in identity hashing | comparator is not explicitly canonical | portability hardening |

`PublicContinuationAuthority` and `PublicRunProjectionAuthority` are not in the
deletion set. Their effectful consumers revalidate them against ABG truth.
No forgery bypass was established.

## Findings

### F01 — `RootOperationState` Is A Rival Runtime Authority

#### Function-level evidence

- `code/src/product/root_operation_state.ts:60-70` declares process-local
  `Set` and `Map` stores for invocation, verification, resolution, install,
  workspace, catalog, view, and application state.
- `code/src/public/operations.ts:64-80` hides this state in a
  `WeakMap<RootOperationContext, RootOperationState>`.
- `createRootOperationContext` at `operations.ts:128-134` creates a fresh
  authority island.
- `applyResolve` reads verified state at `operations.ts:535-538`.
- `applyInstall` reads verification and resolution at `operations.ts:591-603`.
- `applyWorkspaceBind` reads install state at `operations.ts:692-697`.
- `applyCatalogView` reads catalog state at `operations.ts:922-928`.
- `applyCatalogApplication` reads view and install state at
  `operations.ts:985-997`.
- `applyRunInvoke` reads install, workspace, and view state at
  `operations.ts:1234-1265`.

#### Counterexample

1. Verify an artifact in context A.
2. Preserve the returned immutable values and invocation reference.
3. Close context A.
4. Create context B over the same admitted durable prefix.
5. Submit the same resolve request.

Context B refuses `missing_prerequisite` because no admitted carrier or event is
consulted for the verified result. Equal immutable inputs and equal durable
truth have different meaning solely because the JavaScript context identity
changed.

#### Module propagation

```text
Public RootOperationContext
  -> hidden RootOperationState
  -> setup prerequisite reachability
  -> whether ABG install/workspace/catalog admission can occur
  -> whether ExecutionBasis can be constructed
  -> installed runtime and replay evidence
```

ABG may own individual admission events after Public reaches them, but Public
owns whether they are reachable. This is split authority, not a thin public
projection.

#### Design contradiction

Accepted direct-runtime design prohibits process registries and requires
retained and fresh contexts to behave identically
(`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1316,1667`).

Accepted S06 design nevertheless prescribes opaque evidence retained through
verifier/root-operation state
(`M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md:733,740-743`), and T-281 preserves
remembered root-operation authority. Gate 1 must re-enter and disposition those
accepted clauses. Code deletion alone would leave the selected design
contradictory.

### F02 — Verification Evidence Is An Object-Identity Capability

#### Function-level evidence

- `code/src/product/verify_product.ts:73-80` stores
  `NativeProductDeclarationEvidence` in a `WeakMap<object, ...>`.
- `verifyProduct` constructs the public `VerifiedProductArtifact` at
  `verify_product.ts:962-1007`, but its downstream-required native evidence is
  not carried by or durably referenced from that value.
- `constructResolvedProductLock` retrieves the hidden evidence at
  `code/src/product/environment.ts:460-477`.

#### Counterexample

```text
verified = await verifyProduct(bytes)
copy = JSON.parse(JSON.stringify(verified))

verified and copy have equal declared fields and digests.
constructResolvedProductLock([verified]) may succeed.
constructResolvedProductLock([copy]) returns lock_mismatch.
```

The declared immutable result is therefore not the result consumed by
resolution. The real capability is membership in a process-local `WeakMap`.

#### Global consequence

Serialization, package transport, process restart, source-blind installation,
post-publication verification, and independent Product consumption all destroy
the hidden capability without changing the public artifact. A5-F01, F14, F17,
S01, S06, qualification, and release cannot close.

The replacement must be either:

- one complete immutable verified carrier containing all required evidence; or
- an explicit durable admission reference whose exact carrier is
  reconstructable and revalidated.

Another registry or brand is not a repair.

### F03 — The Public Definition Family Is Structurally Incomplete

#### Function-level evidence

`code/src/public/contracts.ts:34-279` currently publishes eleven operation
identities:

```text
product.verify
product.resolve
product.install
workspace.bind
catalog.admit
catalog.apply
catalog.view
project.read
interaction.respond
run.continue
run.invoke
```

The selected S06 boundary requires eighteen operation identities and
fifty-six definition keys through native types, parser, JSON Schema, SDK, CLI,
runtime, publication, and replay.

`product.verify` exposes only variant `artifact`; the live Product requirement
defines the closed `packed_artifact | installed_artifact` distinction and
requires the verification result to preserve checked identity and outstanding
evidence.

#### Counterexample

A conforming caller submits an `installed_artifact` verification request.
The current parser rejects the constitutionally required variant as unknown.

#### Global consequence

The SDK and CLI cannot be projections of the complete public family. An
independent downstream Product cannot author against the accepted contract.
S06, A5-F05/F06/F17, and the complete publication predicate remain open.

The Gate 1 map must enumerate every retained, added, rewritten, and removed
definition. Treating the current eleven-operation registry as the conserved
family would freeze an incomplete ontology.

### F04 — Event Calculus Erases Public Artifact Scope

#### Function-level evidence

- `code/src/abg/event_calculus.ts:11-15` maps every
  `public_operation_artifact_admitted` event to the same string:
  `public_operation_artifact_available`.
- The payload-aware `eventCalculusEffect` switch at
  `event_calculus.ts:265-623` has no artifact case that keys the fluent by
  `authorityScopeRef` and digest.
- Consumers reconstruct partial meaning by scanning raw events:
  `environment_admission.ts:69-92,161-185` and
  `catalog_admission.ts:399-551`.

#### Executed counterexample

Two `public_operation_artifact_admitted` events were admitted against the
frozen implementation with:

- the same `authorityScopeRef`;
- different `authorityScopeDigest` values; and
- different artifact digests.

Both events were accepted. Replay returned:

```json
{
  "eventCount": 2,
  "activeFluents": ["public_operation_artifact_available"],
  "runtimeStatus": "workspace"
}
```

Replay neither preserved which authority scope was available nor rejected the
same-scope digest collision.

#### Module propagation

```text
artifact admission event
  -> unkeyed Event Calculus fluent
  -> no authoritative scope projection
  -> per-consumer raw-event scans
  -> multiple partial implementations of artifact meaning
  -> qualification sees event presence while semantic collision remains
```

This directly violates `REQ-R-ABG3-EVENTS-032` and A5-F10. It affects install,
workspace binding, catalog admission, catalog view, and every generic effectful
public artifact boundary.

### F05 — Invalid Graph Topology Reaches Runtime Effects

#### Function-level evidence

`validateProgramSubject` in `code/src/validator/validation.ts:564`:

- creates a node `Map` at line 703;
- checks start/terminal membership at lines 704-706;
- checks edge endpoint membership at lines 707-708; and
- checks edge shape at lines 710-715.

It does not prove:

- unique node identities;
- a non-empty terminal set;
- no outgoing edge from a terminal;
- exactly one outgoing edge from each non-terminal;
- reachability from the start;
- reachability of declared terminals; or
- boundedness/absence of an ungoverned cycle.

HoG applies terminal and outdegree law only later in
`code/src/gtl/source_path.ts:487-507`, after the current node's C interior may
already have executed.

#### Counterexamples

1. Terminal A contains a valid effectful leaf and edge `A -> B`. Validation
   succeeds, A executes, and only continuation derivation refuses.
2. Non-terminal cycle `A -> B -> A` plus unreachable terminal C passes endpoint
   checks and can append effects indefinitely.
3. Two nodes share `nodeRef = A` but contain different valid terms. The
   validator's `Map` selects the last declaration while HoG's `.find(...)`
   selects the first. Static and runtime topology observe different Programs.

#### Global consequence

The validator does not own whole-program truth, HoG becomes a late validator,
and ABG records an episode that should never have crossed admission. This
breaks A5-F02/F03/F10, malformed-program refusal, pre-effect refusal, replay
integrity, and qualification termination.

The immediate defect is implementation. The accepted design also failed to
enumerate the finite topology predicate while assigning whole-program law to
the validator. Gate 1 must conserve the complete predicate into design before
implementation.

### F06 — `CatalogApplication` Is A Store-Local Object Brand

#### Function-level evidence

- `code/src/abg/catalog_admission.ts:38-56` owns application truth in a
  `WeakMap<AbgEventStore, ...>` containing two `WeakSet`s.
- Application construction at `catalog_admission.ts:377-389` sets
  `admissionEventRef: null` and brands the exact object.
- `hasAdmittedCatalogApplication` at `catalog_admission.ts:520-551` requires:
  the exact open store, active store-local context, and exact object membership.

#### Counterexample

Serialize and reconstruct a byte/digest-identical `CatalogApplication`, or
reopen the same durable prefix in another process. The application fails
`hasAdmittedCatalogApplication` because the brand and active store object do not
survive.

#### Global consequence

`catalog.apply` influences the semantics later consumed by `run.invoke`, yet
its truth is neither an event nor a renewable immutable admission carrier.
Runtime selection depends on retained object identity.

This is an accepted-design contradiction, not merely accidental code drift:
the accepted S05 design prescribed one-shot operation-local no-event behavior.
That prescription conflicts with live EVENTS-032 and A5-F09/F10 when the
effectful artifact is consumed by runtime.

### F07 — Invocation Source-Result Basis Is A `WeakSet` Brand

#### Function-level evidence

- `code/src/abg/invocation_admission.ts:184` declares
  `sourceResultBases = new WeakSet<object>()`.
- `isInvocationSourceResultBasis` at lines 195-199 accepts only branded object
  identity.
- `deriveInvocationSourceResultBasis` begins at lines 201-215 by deriving from
  admitted invocation and scoped replay, but the resulting authority is still
  valid only while the exact branded object survives.

#### Global consequence

Replay can identify the result and causal episode, but a later chained or
recursive invocation cannot use a reconstructed equal carrier. Accepted M05
simultaneously prescribes the brand and declares that durable authority belongs
to the log/declarations rather than brands, weak sets, or object identity.
That is an internal accepted-design contradiction requiring re-entry.

### F08 — Global Store Tail Controls Scoped Runtime Actions

#### Function-level evidence

The implementation computes scoped replay, then additionally requires the
applicable event to be the final event in the entire store:

- initial cursor: `code/src/abg/traversal_cursor.ts:225-233`;
- root closure: `code/src/abg/closure.ts:184-190`;
- resumed closure: `closure.ts:388-398`;
- child closure: `closure.ts:604-610`;
- F_H response and resume contain the same global-store selection pattern in
  `code/src/abg/continuation.ts`.

#### Counterexample

```text
Store A: exact run R prefix -> R may close.
Store B: exact same run R prefix + unrelated event for run S -> R refuses.
```

The scoped replay of R is identical in both stores. Only the unrelated global
tail differs.

#### Global consequence

Independent runs become globally serialized. Unrelated events can make
`interaction.respond`, `run.continue`, initial traversal, or closure
inadmissible. A refusal path that uses the unrelated final event as cause may
also attempt cross-run causation.

The correct currentness relation is the latest applicable event within the
declared candidate scope, not the latest event in the process-wide store.

### F09 — Retry Execution Depends On A Process-Local Value Map

#### Function-level evidence

- `captureRetryInputs` stores executable values in a local `Map` at
  `code/src/hog/graph_execute.ts:174-200`.
- `selectRetryInput` reads only that map at lines 203-219.
- `executeGraphTraversal` creates a fresh empty map at line 388.
- Retry consumption occurs at lines 804-821.

Events and cursors preserve retry identity, digest, attempt, and frontier
facts. The executor contains no replay-to-`RetainedRetryInput` reconstruction
function.

#### Counterexample

1. Enter a retry term with input X.
2. Complete a retryable attempt.
3. Lose the process.
4. Reopen the durable prefix.
5. Replay identifies the retry frontier and X's expected digest, but the
   executable value X was only in the lost map.

#### Global consequence

Process survival changes the next executable state. HoG is not a function of
admitted GTL, scope, and replay. If admitted payloads cannot recover X, the
implementation defect exposes a missing design carrier; in either case the
current implementation violates M05's replay-sufficient cursor invariant and
A5-F10.

### F10 — Caller Ordering Creates Rival Program Identities

#### Function-level evidence

- `validation.ts:594-612` accepts GraphFunctions as a complete semantic set in
  any ordering.
- `validation.ts:1555` preserves caller order in `graphFunctionDigests`.
- `validation.ts:1563-1577` hashes that array into `sourceDigest` and
  `validationRef`.

#### Counterexample

```text
validate([A, B]) -> V1
validate([B, A]) -> V2
```

All declarations and member values are identical. Both validate, but
`V1 != V2`.

#### Global propagation

```text
ProgramValidation
  -> GraphValidation
  -> implementation resolution
  -> ExecutionBasis
  -> event identity and payload
  -> replay digest
  -> public projection
  -> qualification evidence
```

Transport order therefore becomes runtime and release identity. Canonicalize
the semantic set before hashing or make sequence order an explicit admitted
part of the Program law. The current mixture does neither.

### F11 — Typed Refusal Semantics Collapse At Public Ingress

#### Function-level evidence

`code/src/public/operations.ts` maps detailed owner refusals to the generic
`owner_refusal` code:

- verification: lines 491-492;
- installation: lines 624-625;
- workspace/catalog paths: lines 754-769, 850-893, 933-948, 1062-1083.

`code/src/public/contracts.ts:469-480` permits only five generic public refusal
codes.

#### Counterexample

`artifact_digest_mismatch` and `manifest_digest_mismatch` become the same
public code. A consumer must parse prose to recover the lost distinction.

#### Global consequence

SDK/CLI equivalence can prove only generic failure, not the required typed
negative. Conformance and qualification cannot distinguish materially
different owner refusals. This violates the Product's typed public-boundary
law and weakens S01/S06 negative proof.

### F12 — `pendingReopenAuthority` Is An Implicit Current-Log Pointer

#### Function-level evidence

- `RootOperationContext` carries mutable `pendingReopenAuthority` at
  `operations.ts:59-62`.
- close stores it at `operations.ts:144-150`.
- reopen consumes it at `operations.ts:153-167`.
- dispatch silently invokes reopen at `operations.ts:3980-3983`.

#### Counterexample

Submit the same request to:

- a retained context after a previous durable close; and
- a fresh context.

The request contains no exact prefix selector, but the retained context silently
chooses a log while the fresh context does not. Context history, not explicit
ingress, selects authority.

#### Global consequence

Fresh and retained contexts are not observationally equivalent. Every
non-continuation public operation can inherit undeclared durable history.

### F13 — Duplicate Invocation Identity Is Volatile And Pre-Admitted

#### Function-level evidence

- `RootOperationState.#seenInvocations` and `claimInvocation` are at
  `root_operation_state.ts:62,72-75`.
- dispatch claims the identifier before semantic admission at
  `operations.ts:3967-3972`.
- continuation operations bypass this set and use durable ABG authority.

#### Counterexamples

1. A malformed or failed request consumes the invocation reference until
   restart even though no admitting event exists.
2. A successfully admitted request becomes reusable after restart because the
   set is empty.
3. Setup and continuation operations apply different identity laws.

#### Global consequence

Idempotency, retry, refusal, and replay disagree. Duplicate identity must derive
uniformly from admitted event truth, with explicit law for refused or
non-admitted attempts.

### F14 — `localeCompare` Is Not An Explicit Canonical Comparator

`validation.ts:1559-1560` sorts requirement keys with default
`localeCompare` immediately before identity hashing.

The actual variable domain is fixed-prefix lowercase hexadecimal keys, so no
cross-install divergent ordering counterexample was established. This remains
a low-severity release-portability defect. Replace it with an explicit byte or
code-unit comparator, but do not use it as a primary Gate 1 rejection basis.

## Local-To-Global Failure Composition

The findings compose; they are not independent cleanup items.

```text
F03 incomplete public contract
  -> caller cannot express every required operation/variant

F01/F02/F12/F13 process and object authority
  -> equal public inputs do not reach equal setup admissions

F04/F06/F07 artifact scope and brand authority
  -> admitted/reconstructed product semantics are not one Event Calculus truth

F05/F10 validation ambiguity
  -> invalid or transport-ordered Programs receive executable identities

F09 retry memory
  -> admitted execution cannot resume from replay alone

F08 global-tail coupling
  -> unrelated runs change continuation and closure admissibility

F11 refusal collapse
  -> public consumers and qualification cannot observe exact failures

combined result
  -> S01/S03/S05/S06 cannot prove one installed causal path
  -> A5-F15 exact-candidate qualification cannot bind reproducible evidence
  -> A5-F16 immutable release identity cannot close
```

Deleting only `RootOperationState` would expose, not solve, the missing durable
verification, setup, application, retry, and scope carriers. Repairing only
canonical ordering and topology would still leave split authority. Repairing
only Event Calculus would still leave Public deciding reachability from object
identity. Gate 1 must close the complete causal set.

## Corrected Gate 1 Construction Boundary

### Delete

- `RootOperationState`;
- `rootOperationStates`;
- process-local setup prerequisite maps;
- volatile duplicate-invocation authority;
- implicit `pendingReopenAuthority` log selection;
- `WeakMap`/`WeakSet` brands used as verification, catalog-application, or
  source-result authority;
- executor-local retry value authority;
- global-store-tail checks used as scoped-currentness law.

### Retain

- ABG events as the sole written runtime truth;
- Event Calculus as the sole runtime state-transition interpretation, after
  scope-key repair;
- deterministic replay as reconstructive projection;
- `PublicContinuationAuthority` and `PublicRunProjectionAuthority` as durable
  read/projection carriers whose effect paths revalidate against ABG;
- immutable content-addressed Product, install, workspace, catalog, Program,
  validation, execution-basis, event, replay, and public-result identities.

### Add Or Exact-Contract Rewrite

- complete immutable verification evidence or an explicit durable verified
  artifact admission carrier;
- durable setup artifact lookup from exact admitted events and declarations;
- scope-keyed public artifact fluents and same-scope digest collision refusal;
- renewable catalog-application and source-result bases;
- full graph topology validation before any effect;
- canonical semantic-set ordering before identity hashing;
- replay-derived retry input recovery;
- scoped latest-applicable-event selection;
- complete 18-operation, 56-definition-key public family;
- lossless typed refusal projection.

### Re-enter Accepted Design

Gate 1 cannot silently work around accepted design. Re-enter the smallest
causally closed design set that currently:

- prescribes opaque verification/root-operation evidence;
- prescribes no-event, object-local `CatalogApplication` authority;
- prescribes source-result branding;
- omits the complete finite topology predicate;
- accepts an unkeyed public-artifact Event Calculus fluent; or
- otherwise contradicts replay-sufficient durable authority.

## Required Proof Matrix

| proof | mutation | required result |
|---|---|---|
| fresh-context setup | recreate context from exact durable prefix | same result as retained context |
| verification serialization | serialize/reconstruct verified carrier | resolve result unchanged |
| artifact scope separation | admit two different authority scopes | distinct scoped fluents/projections |
| artifact collision | same scope ref, conflicting digest | typed fail-closed refusal |
| topology terminal edge | terminal node has outgoing edge | refusal before any runtime event/effect |
| topology cycle | reachable unbounded cycle with unreachable terminal | static refusal |
| topology duplicate | duplicate node identity with different terms | static refusal |
| Program permutation | reverse semantic-set transport order | identical validation and downstream identities |
| retry restart | lose process between retry attempts | replay reconstructs identical executable input |
| interleaved runs | append unrelated run event | scoped continuation/closure result unchanged |
| duplicate request restart | replay prior admitted invocation | identical typed duplicate disposition |
| typed negatives | mutate artifact, manifest, catalog, basis separately | distinct stable public refusal codes |
| full public family | enumerate installed definitions | exact 18-operation/56-key agreement through all projections |

Sunny same-process tests are insufficient. Each authority claim needs:

- positive same-process proof;
- fresh-process or reconstructed-carrier proof;
- structural mutation refusal;
- interleaved-scope metamorphic proof where applicable; and
- exact installed public-consumer proof.

## Non-Findings And Deferred Gaps

1. `PublicContinuationAuthority` and `PublicRunProjectionAuthority` remain
   retained. Constructors produce candidates, but current effect paths
   rehydrate and revalidate against ABG. Rename or narrow their type contracts
   if needed; do not delete them without a demonstrated bypass.
2. Missing continuation `superseded` and `abandoned` termination transitions
   remain a live Product/requirement completeness gap. Accepted M05 explicitly
   deferred them, so they are not classified here as implementation drift in
   the selected slice. They still prevent claiming complete Product closure.
3. The earlier proposed Critical grading for `localeCompare` is not sustained.
   Its actual input domain does not establish a cross-locale identity
   counterexample.

## Recommended Action

Do not start Gate 2 or implementation.

Freeze one corrected Gate 1 map under STDO 2.2.2 that:

1. declares the complete affected Ontology and authority matrix;
2. contracts the Prime semantic atoms across the whole family;
3. names the IACS and every durable/reconstructive carrier;
4. dispositions every finding above as delete, retain, exact-contract rewrite,
   or design re-entry;
5. maps each local function change through module invariants to the global
   Product axioms and scenarios;
6. includes the negative and metamorphic proof matrix; and
7. receives review before implementation.

The last axiom-satisfying cut remains the stopping point. Gate 1 is not ready
to advance.
