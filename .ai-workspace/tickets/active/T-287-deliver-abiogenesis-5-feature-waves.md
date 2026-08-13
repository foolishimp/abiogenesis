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
- change_class: design_reframe
- migration_strategy: 4_6_structural_adoption_then_feature_composition
- library_usage: extend
- selected_method: STDO v2.2.2
- selected_method_commit: 0519129d63de10822ae6353fa0c5ce05d56f13e9
- immutable_reference_product: v4.6.0-rc.5
- selected_wave: W2
- selected_feature: A5-F01
- selected_slice: exact_public_family_construction
- selected_slice_stage: design_reframe
- selected_increment: w2_c1f_leaf_local_resource_binding_repair
- selected_increment_stage: design
- accepted_checkpoint: 1f6a86074bf995763b4caff286422b5b1501374b
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
  W2 = A5-F01, A5-F09, A5-F05, A5-F06
selected feature and slice:
  A5-F01 / exact_public_family_construction
  = exact installed Product/catalog basis consumed by one 18-operation/56-key
    Public family, SDK, and CLI
active increment:
  w2_c1f_leaf_local_resource_binding_repair
  = retain the common type-indexed DefinitionCall/DefinitionReturn relation,
    bind exact topology/provider identity for all 56 keys, and make every
    physical or ABG transition an owner-leaf receipt boundary;
    preserve the accepted HoG translation/deletion and hold D6 production
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
| W2 | A5-F01, A5-F09, A5-F05, A5-F06 | One exact 18-operation/56-key Public family over a closed installed execution basis | Active at C2 HoG algebra translation/deletion cut |
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

### Wave 1 functional interface closure — current

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

After `W1-C5`, the concrete parallel lanes are:

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

## Wave 2 Delivery Plan - active

Wave 2 delivers `A5-F01`, `A5-F09`, `A5-F05`, and `A5-F06` as one installed
function:

```text
source-blind Product bytes and workspace target
  -> verify -> resolve -> install -> bind
  -> construct exact eventless catalog, view, and application
  -> admit one common Public envelope
  -> select one exact { operationId, memberKey } definition
  -> call its already loaded direct, statically composed, or projection binding once
  -> structurally project its indexed outcome
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
green non-bypassed release basis. They may not publish success early.

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

### Bounded C1F leaf-local resource-state binding repair

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

Sections 5.6.2A-B, Table 5.6.3-D, and amendment 16.5 in the local constitution
are the sole repaired relation. This ticket does not restate their algebra. For
C1F/D6 accounting:

- all 56 definition keys retain their exact owner, request, indexed outcome,
  effect regime, installed coordinate, and ordered factor trace;
- the existing `5 + 24 + 1 + 4 + 14 = 48` incomplete rows are carrier/binding
  gaps, not another family or a request for 48 wrappers;
- one common `DefinitionCall<K, I, O>` joins `PublicInvocation<K>` to exact
  resource bindings and pre-state; one `DefinitionReturn<K, I, O>` joins the
  owner output to ordered leaf receipts, successor resource state, and handoff;
- Table 5.6.3-D projects all 56 exact keys through the existing `E01-E40`
  classes and shared `T0-T9` forms; it creates no 56/48 wrapper roster;
- canonical provider-scoped input/output resource identity topology derives
  read, same-resource mutation, and owner-allocated distinct-output creation;
  no mode flag selects access or commit behavior;
- every physical or ABG resource transition is owned by its exact `L`, `J`, or
  `X` leaf and returns a typed mechanical receipt before dependent work;
  existing expected-prefix appends remain independently durable and reissue
  the exact successor prefix/close handoff;
- the exact semantic owner consumes committed, no-new-commit idempotent,
  residue/compensation, or substrate-fault evidence and applies the frozen
  `Rnn` only at the lawful post-transition/replay locus; no generic provider
  invents owner meaning;
- intrinsic definition and callable-contract identity bind the topology
  ref/digest and required stateless provider capabilities; loaded binding,
  load receipt, and host receipt preserve the exact same relation;
- the installed Effect Layer closes stateless provider mechanics only, and the
  resulting callable remains `R = never`; and
- logical refs never substitute for canonical locators, expected versions,
  provider identities, grants, Git commit/tree state, ABG prefix/reopen
  handoff, object digest/version, or transaction/version tokens.

This design correction authorizes no production, schema, generator, test,
Public-family, legacy-deletion, HoG, Event Calculus, replay, or release work.
The accepted D2-D5 HoG translation, contraction, deletion, and proportional
proof remain intact. D6 resumes only after one frozen correction passes cold
review. A requirement conflict or missing owner meaning remains a stop.

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
further technology decision remains. The current refactor translates the
established HoG functions into the small algebra and one fold, then deletes or
makes unreachable the prototypes and displaced imperative coordinators. Event
Calculus and replay are unchanged and no reduction redesign is selected.

The frozen seven-path PoC aggregate
`sha256:18e2a602cbe7000b56aec8e1e92eed52dce5ce4af50bd94bf301cf5dd95df241`
and the installed E29 prototype are conservation evidence for the selected
foundation. They do not change Product behavior or authority and may not be
retained as wrappers around the imperative HoG path.

### Construction sequence

| Step | Functional work | Mechanical evidence | State |
|---:|---|---|---|
| `W2-C0` | Consume the accepted W1 interface receipt; refresh the exact 56-row endpoint/contract/dependency/deletion join; apply only the catalog/workspace/definition-coordinate reconciliation above. | Exact W1 receipt; refreshed 56-row join; zero key diff; explicit construction dependencies; clean reconciliation diff. | Complete - frozen external-contract/deletion evidence; not a primitive-basis decision |
| `W2-C1` | Prove one unexported vertical function chain through existing owner relations: create/open -> verify -> resolve -> install -> bind -> catalog admit/view/apply -> invoke -> result/replay. | Direct installed chain proof; JSON round-trip at every boundary; no new Public export or adapter. | Complete as construction evidence at the maximal pre-admission boundary; prior owner-port interpretation superseded |
| `W2-C1F` | Recursively classify all 56 external definitions as direct primitive, statically composed callable, projection, duplicate, or invalid; close the minimal installed primitive basis; retain the bounded Effect 3.22.1 composition foundation; specify source-independent callable and leaf-local type-indexed resource-state bindings plus install-derived load receipts. | Exact 56-row classification; primitive input/output/refusal/effect/owner/frame/nonfactorability map; non-executable factorization map and ordered primitive trace; Table 5.6.3-D exact class-to-topology projection; one `DefinitionCall`/`DefinitionReturn` family with ordered mechanical receipts and successor handoffs; intrinsic/callable/load/host topology/provider identity equality; conservation oracle for results, refusals, owner-leaf commits, ordered events, projections, replay, resource pre/post state, residue, and handoff; no executable plan, Public composition, outer transaction, or authority amplification. | One bounded repair active - factorization and Effect selection retained; unary PFC-F05 and rejected late-commit interpretation superseded; cold acceptance pending |
| `W2-C2` | Translate the established 4.6 and accepted 5.0 HoG functions into small carrier/sum types, one primitive algebra and laws, derived combinators, one Effect fold/interpreter, and exact owner ports; complete the D01-D15 source-independent bindings on that basis; delete or make unreachable displaced imperative coordinators and prototype scaffolding. | Exact behavioral conservation for results, refusals, ordered events, projections, Event Calculus, replay, and exact resource pre/post state; source and packed load/resolve/callability probe for all 56 bindings and dependencies; zero wrapper over the old HoG path; superseded coordinators and prototypes unreachable or deleted. | D2-D5 accepted; D6 held pending C1F resource-state correction acceptance |
| `W2-C3` | Construct the structural envelope, intrinsic definition family, indexed admission, exact one-binding invocation, indexed outcome projection, schemas, SDK, CLI grammar, Codex sibling transport, PFC-F07 proposals, Product PFC-F08 binding, contract-group exports, and manifest rows from that family. | Exact-set equality and new candidate digest; generator idempotence; projection equality; package dependency closure. | Pending C2 |
| `W2-C4` | Atomically export the replacement family and delete the legacy carrier, parser, semantic controller, schema synthesis, parallel manifest roster, aliases, compatibility tests, and legacy proof projections. | One installed 18/56 family over the closed primitive basis; zero reachable legacy or new-to-old translation; `git diff --check`. | Pending C3 |
| `W2-C5` | Pack once and execute the two installed sunny paths and compact changed-boundary guards below through both SDK and CLI. | One exact artifact, interface receipt, scenario receipts, event/replay receipts, and guard vector. | Pending C4 |
| `W2-C6` | Freeze one exact candidate for independent review and Executive disposition. | HEAD/tree or synthetic tree, status hash, patch hash, tarball/package/manifest/family digests, no moving files. | Pending C5 |
| `W2-C7` | Accept the exact Product/Public interface substrate and unlock final Wave 3 Public binding and Wave 4 host projection. | Accepted frozen interface handoff; no M5 or release claim. | Pending C6 review |

The C1F factorization and Effect selection remain fixed; only the resource-
state call/load relation is in one bounded design repair. C2 is held at D6
until this frozen repair passes cold review. After acceptance, C2 returns to pure
`realization_refactor` and has no semantic-review interruption before C6.
Mechanical checks run continuously. One cold review at the current correction
boundary and one cold review of the frozen C6 candidate are sufficient. A
local review finding may receive at most one bounded repair. A materially
different Product, owner, event lifecycle, 18/56 family, or Wave 1 interface
decision returns to the Executive.

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
  -> selection.loadedDefinitionBinding.invoke(...)
  -> public/outcome_projection.ts
```

`public/project_read_contracts.ts`, `public/schema_projection.ts`, and
`public/sdk.ts` are total structural projections of owner packets and the one
family. CLI parses one generated grammar and invokes the same SDK/Public path.
`abg.codex` may remain an exact-sibling process transport of that grammar; its
host-specific behavior is Wave 4 proof, not a second Wave 2 operation family.

Intrinsic definitions contain declarative source-independent execution-binding
specifications, canonical input/output resource-slot topology ref/digest, exact
owner-leaf atomicity references, output allocations, and the required stateless
provider-capability set, never loaded callables or resource values. Those fields
enter intrinsic definition and callable-contract identity. The installed
binding loader resolves each specification under the admitted lock and Product
set, freezes one real direct, statically composed, or projection callable plus
its exact stateless provider Layer, and emits a minimal source-blind evidence
receipt. The receipt proves exact specification/callable/module/contract,
topology, provider-capability, and resolved-provider equality. The receipt
itself never enters intrinsic definition, family, Product-content, invocation,
event, or replay identity.
Factorization maps and ordered primitive traces are non-executable assurance
evidence and are never loaded. Public receives the already loaded binding and
does not resolve modules, sequence factors, interpret a plan, construct owner
contexts, choose owner dependencies, open a semantic runtime, scan events, or
switch on operation identity. GTL.TypeScript remains the sole Product program
language. Pure relations consume immutable inputs. The one common call carrier
supplies exact resource identity, locator, expected version, provider, resolved
grant, and owner refinement. Resource access/commit derives from the
definition's canonical input/output topology, not an operation mode. Effectful
owner leaves consume the exact explicit state, including acquisition/handoff or
durable prefix where applicable, and each returns its typed mechanical receipt,
successor state, and handoff before dependent work. Each physical or ABG leaf
owns its existing atomicity boundary; no definition-wide transaction is added.
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
- a second executable plan, DSL, interpreter, generated HoG Program, factor
  registry, runtime-loaded factor trace, invocation adapter, or new-to-old
  translation carrier;
- an Effect workflow, retry, persistence, state, clock, scheduler, concurrency,
  event, currentness, or replay authority;
- a definition-wide or provider-created transaction that groups independently
  durable owner leaves, ABG appends, physical effects, or replay;
- `Rnn` applied before the mechanical transition/replay truth it classifies,
  or a transition whose committed, idempotent-no-new-commit, residue,
  compensation, or substrate-fault evidence is discarded;
- an intrinsic definition, callable contract, loaded binding, load receipt, or
  host receipt that omits or disagrees on the exact resource-topology digest,
  required provider-capability set, resolved provider identities, owner-leaf
  atomicity refs, allocation law, or successor handoff;
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
- a Wave 1 owner/carrier/event/handoff/projection change outside the three
  explicitly excluded legacy Public relations; or
- donor code that imports, constructs, or assumes the rejected Public family.

Do not stop for owner-local callable names, exact carrier fields, helper
placement, Valibot/Effect composition inside their accepted bounded roles, or
one obvious implementation algorithm inside the accepted owner boundary. The
worker decides those HOW relations.

### Review and acceptance boundary

The frozen C6 review asks only:

- Is there exactly one 18/56 external definition family, one loaded binding per
  row, and one closed minimal primitive basis rather than 56 presumed atoms?
- Does Table 5.6.3-D cover every exact definition key with its canonical slots,
  pre-state, provider capabilities, owner-leaf atomicity, allocation law,
  successor state, and handoff, with exact equality preserved through the
  intrinsic definition, callable contract, load receipt, and host receipt?
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

## Current Slice

The active uncommitted construction is based on accepted checkpoint
`1f6a86074bf995763b4caff286422b5b1501374b`. Preserve that accumulated
catalog/runtime construction; do not reset or rebuild it from historical
candidates. Rejected candidate identities remain donor evidence only. Continue
the accepted
[Graph Catalog Contraction](../../../build_tenants/abiogenesis/typescript/design/T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN.md)
without another design cycle.

```text
exact published GTL GraphFunctions
  -> one deterministic HoG GraphFunctionCatalog dictionary
  -> pure lookup, narrowing, refresh, and application
  -> invocation records exact catalog/Program/GraphFunction selection and HoG structural entry witness
  -> ExecutionBasis records complete implementation/interaction sets
  -> each CCall admits fibre at actual locus; no global execution-plan entity
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
- bind invocation to exact catalog/Program/GraphFunction selection plus the HoG
  structural entry witness; bind complete implementation/interaction sets in
  ExecutionBasis; admit fibre at each CCall locus; define no global execution-plan entity;
- retain ABG/Event Calculus only for execution, observation, evidence, and
  workspace transformation;
- recover terminal, CCall, actor/process, retry, traversal, continuation,
  result, closure, durable-prefix, and fresh-process code only where it remains
  valid after this contraction;
- leave no compatibility adapter or reachable old registry/catalog authority.

The retained catalog/runtime construction continues to carry its accepted
focused evidence. Its complete shuffled-order, refresh, collision, cache-loss,
cross-basis, dependency, provenance, R1–R10, conservation, and full-M5 matrix
is rerun once against the integrated M5 candidate. Wave 1 interface closure
does not repeatedly execute that matrix while authored bytes are moving.

Scope guard: finish this catalog hard break, remove every stale executable and
proof consumer of its deleted authority, and return to the Wave 1 feature
sequence. Other audit findings enter this slice only when they are competing
semantic authority, fresh-process correctness defects, or redundancy beyond
the 4.6 baseline. Purely structural deeper compression is recorded for 5.1 and
does not extend this implementation cut.

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

Wave 1 functional interface closure occurs when its delivery checkboxes map to
one frozen installed implementation, S1 and S2 pass, the three known coupling
guards pass, and cold review finds no interface-owner or coupling defect. This
closure unlocks dependency-safe parallel construction; it is not exhaustive
M5, pre-RC, or release qualification. T-287 closes only when all five waves and
the immutable 5.0 release close.
