# STRATEGY: ABIogenesis 5.0 Single-Surface MVP Release Plan

**Author**: Codex

**Date**: 2026-07-31T06:31:31Z

**Updated**: 2026-07-31T08:29:46Z

**Addresses**: GOAL-035, T-270, T-281, T-247, T-248, accepted S06 design,
Gate 1 review, and the implementation at
`08cd748515d3776bc6637412ceb2f99b27fc8a98`

**Status**: Approved — sole current plan

**Direct F_H source wording**: “ok plan is approved, setup the goals and
tickets”

**Current authorization**: Freeze the STDO 2.2.2 and authority-setup cut,
then perform the read-only construction census and return it to direct F_H.
Gate 1 construction and semantic implementation remain held.

This post is the single planning surface for ABIogenesis 5.0. It supersedes
`20260731T055914Z_STRATEGY_abiogenesis_5_0_mvp_release_plan.md` and incorporates
the function-to-axiom review, the historical handoff, the STDO 2.2.2
selection, independent feedback, code confirmation, falsifier-first proof
strategy, implementation sequence, qualification, and release sequence.

## Decision

For this plan, MVP means the minimum causally closed route to the already
selected ABIogenesis 5.0 Product. It does not mean a smaller third Product
contract.

The active Intent and Product remain governing. The release therefore retains:

- all 16 selected 5.0 outcomes;
- `ABG5-S01`, `S02`, `S03`, `S05`, `S06`, and release scenario `S07`;
- the exact one-family 18-operation, 56-definition-key Public algebra,
  including all 24 `project.read` cases;
- `F_D`, `F_P`, `F_H`, continuation, retry, recursion, Consensus, and Event
  Calculus-derived runtime truth;
- SDK, CLI, and bounded Codex as projections of the same exact contract;
- self-conformance and complete 4.6 conservation as M6 pre-release
  qualification, not as S06 implementation; and
- the immutable RC, final-tap, stable release, and post-publication proof
  lineage.

The previously proposed nine-operation/four-read release family is rejected.
It would require an `intent_reprice`, discard accepted S03/S05 stock, defer
pre-release obligations until after the release they must qualify, and create
a third Public algebra. The nine-operation chain remains useful only as the
installed Gate 2 sentinel.

The release route is:

```text
STDO 2.2.2 basis
  -> read-only exact 56-key construction census
  -> direct F_H authorizes bounded corrective design work
  -> Gate 1 construction/authority review and direct acceptance
  -> falsifier-first defect/preservation baseline
  -> identity/topology, Product-carrier, and Event Calculus prerequisites
  -> complete installed 18/56 roster/owner closure plus one fresh-process sentinel
  -> delete the production legacy family
  -> Gate 2 architecture sentinel
  -> generate projections and preserve accepted Product behavior
  -> Gate 3 frozen S06 candidate
  -> direct F_H S06 acceptance
  -> accepted post-S06 Prime entropy reduction
  -> complete public publication closure and unified M5 candidate
  -> M6 exact qualification
  -> M7 immutable RC, final tap, and stable 5.0.0
```

## Historical Lessons Conserved

### 1. Code-first realization caused repeated non-local resets

Earlier S06 work implemented and reviewed moving candidates before the complete
symbolic Product function and authority relations were fixed. Local repair
then propagated across Public, Product, ABG, schemas, SDK, CLI, tests, and
package evidence. Correlated review found defects late and encouraged forward
repair rather than reset.

The donor branch is evidence of that failure mode. It is not an implementation
basis.

### 2. Review cannot be the constitutional restoring force

Three review gates are sufficient. Product, ticket, and accepted-design axioms
must reject drift before review:

```text
admissible(delta) =
  satisfies(Product + ticket + accepted design, state + delta)
  and advances the selected Product outcome
```

An axiom counterexample invalidates the cut. Green tests, compatibility value,
implementation effort, donor precedent, and future generality cannot cure it.

### 3. The first corrected Gate 1 map was still too narrow

Deleting only `RootOperationState` would expose missing verification,
resolution, installation, catalog, application, prefix, invocation-identity,
and retry carriers. The code review confirmed a causally connected defect set
across Product, Validator, ABG, HoG, Public, and release evidence.

### 4. Green same-process tests are preservation evidence, not release proof

The full M5 suite at this exact code baseline passed:

```text
tests 181
pass 181
fail 0
duration_ms 1543971.0015
```

Those tests preserve valuable working stock. They do not exercise all
fresh-process, scope-collision, interleaved-run, topology, permutation,
restart-idempotency, or typed-refusal counterexamples.

### 5. Product shrink can increase churn

S03 and S05 are accepted and green. Removing continuation, Consensus, retry,
recursion, Codex, self-conformance, conservation, or most Public operations
would reopen Intent, Product, requirements, design, scenarios, qualification,
and release. It would remove working stock while leaving the main authority
repairs. This plan conserves the accepted Product and narrows the sequence, not
the promise.

## Verified Current State

| Field | Current state |
|---|---|
| repository | `/Users/jim/src/apps/abiogenesis-5-root-build` |
| branch | `codex/t286-abi5-root` |
| implementation baseline | `08cd748515d3776bc6637412ceb2f99b27fc8a98` |
| initial tracked state | clean before analysis and the authorized STDO correction |
| commentary | all original eight untracked posts and subsequent review/strategy posts preserved |
| package version | `5.0.0-dev.286` |
| current Public family | legacy 11 operations and 19 keys |
| accepted Public family | 18 operations and 56 keys |
| Gate 1 | rejected; read-only census, proposed corrective relation, review, and direct acceptance required |
| Gate 2 | not started |
| full M5 baseline | 181/181 pass |
| governing method | STDO `v2.2.2` |

The exact selected STDO subject is:

| Field | Identity |
|---|---|
| tag object | `9b95e85c8ca2a9a5165cae6e058428d9a38373b5` |
| release commit | `0519129d63de10822ae6353fa0c5ce05d56f13e9` |
| release tree | `6386ba31d6e56f37e2560f960a340fb44e7a9dd1` |
| member count | 41 |
| member-set digest | `4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21` |

The live consumer pins now select this identity and the ignored local standards
projection is byte-equal to its 41-member distribution. Accepted design files
remain byte-preserved; predecessor method references inside those exact
subjects are provenance, not a second current selection.

One external qualification residual remains. The upstream 2.2.2 human
publication decision names an earlier carrier and aggregate than the current
tag. ABIogenesis may select the current 2.2.2 cut under direct F_H, but stable
5.0 qualification must not claim the older decision accepted the later
carrier. T-282 must close the provenance relation, or direct F_H must accept an
exact typed refusal and its release consequence. An unresolved or
implementation-local refusal blocks the final tap.

## Code-Confirmed Blocking And Verification Set

| ID | Finding | Release consequence |
|---|---|---|
| F01 | `RootOperationState` owns setup reachability through one Set and seven Maps hidden behind a context-keyed WeakMap. | Same durable facts behave differently after restart. |
| F02 | verification evidence is in a `WeakMap`; resolved locks require a `WeakSet` brand; Public returns narrowed projections. | Complete verification and resolution truth cannot cross process boundaries. |
| F03 | current Public is 11 operations/19 keys, not the accepted 18/56 family. | The installed SDK, CLI, schemas, and catalog cannot express the selected Product. |
| F04 | Event Calculus collapses every public artifact into one unkeyed fluent and admits same-scope digest collisions. | Replay erases authority scope and consumers implement rival raw-event scans. |
| F05 | whole-program validation omits uniqueness, terminal, outdegree, reachability, and boundedness law; its node `Map` keeps the last duplicate while HoG `.find()` executes the first. | Validator and runtime can observe different Programs, and invalid topology can execute effects before HoG refuses. |
| F06 | `CatalogApplication` truth is an originating-store/object brand. | Equal reconstructed applications cannot lawfully reach `run.invoke`. |
| F07 | invocation source-result basis uses a `WeakSet` brand, but current Public reopens the durable store, rehydrates the invocation, replays the run, checks result/judgment/Product semantics, and only then mints a fresh brand. | This is not a confirmed second authority path. A real second-process preservation probe must prove that reconstructed source-result authority survives; a failure promotes F07 to a blocker. |
| F08 | initial cursor admission, continuation reconstruction, F_H response admission, F_H resume admission, `admitClosure`, `admitInteractionClosure`, `admitChildClosure`, and refusal-event causation use unscoped global-tail currentness. | An unrelated run changes scoped admissibility. |
| F09 | retry executable input exists only in an executor-local Map. | Replay identifies the retry frontier but cannot reconstruct the next input. |
| F10 | caller GraphFunction ordering enters validation identity. | Equal semantic Programs receive rival downstream identities. |
| F11 | the declared common-ingress `PublicInvocationRefusal` schema enumerates exactly five codes: `duplicate_invocation`, `invalid_request`, `missing_prerequisite`, `owner_refusal`, and `target_mismatch`, although `parseRootPublicInvocation()` emits only `invalid_request`. Post-parse failures use an untyped JSON outcome: most owner failures collapse to `owner_refusal`, while some handler-specific strings survive only as arbitrary strings. | Public, SDK, CLI, schemas, and qualification cannot preserve exact negative meaning. |
| F12 | `pendingReopenAuthority` silently selects a remembered event log. | Equal requests in fresh and retained contexts consume different authority. |
| F13 | setup duplicate identity is a volatile Set claimed before semantic admission. | Rejected attempts and admitted invocations have process-dependent identity law. |
| F14 | an identity-bearing sort uses default `localeCompare`. | Severity remains Low; canonical identity still needs an explicit portability disposition. |

Three review statements require exact qualification:

- accepted `product.verify` has one definition key, `verify`; packed versus
  installed is the request/result `targetKind` sum, not two public variants;
- common-envelope parse failures occur before the volatile duplicate Set, while
  parse-valid later refusals consume the volatile identity.
- F07 is a preservation obligation, not a code-confirmed failure, unless the
  real second-process probe demonstrates a counterexample.

The first two qualifications do not weaken the blocking set. The third removes
an overclaim and turns F07 into a falsifier-controlled disposition.

## Implementation Complexity Assessment

Overall complexity is High and authority-critical. This is not primarily a
56-case coding problem. It is a replacement of the relation that lets later
operations know what earlier operations established.

| Surface | Complexity | Load-bearing reason | Completion proof |
|---|---|---|---|
| authority re-entry | High | live tickets and accepted design currently authorize the rejected stateful relation | direct F_H accepts one bounded corrective cut |
| 56 owner definitions | High but finite | every key needs a real owner export, callable port, four exact slots, effect/event participant, and projection owner | frozen 56-row totality census |
| Product setup carriers | High | verify/resolve/install/bind truth currently cannot cross a process boundary completely | explicit carrier plus fresh-process reconstruction |
| Validator/HoG Program law | High | different structures can currently be validated and executed | one normalized Program and zero pre-refusal effect |
| ABG Event Calculus | High | scope, currentness, duplicate identity, retry, and reconstruction are coupled | interleaved-prefix and restart equivalence |
| Public hard break | Medium after owners exist | dispatch is mechanically small only when meaning is owner-local | generic four-step path and forbidden-symbol proof |
| static/runtime catalog split | Medium | PFC-F08 publication and ABG admission are distinct but easily conflated | typed non-substitutability and exact refusal corpus |
| generated projections | Medium and mechanical | schema, manifest, SDK, CLI, and Codex have a large blast radius | exact-set equality and idempotent generation |
| lawful scenario rewrite | High-volume, low-design | same-process stock must be retained without preserving legacy semantics | installed behavior plus mutation corpus |
| M5/M6/M7 release path | High but sequential | each stage consumes an immutable accepted predecessor | exact candidate and package lineage |

The smallest causally closed implementation unit is therefore not an isolated
operation. It is the full intrinsic roster, complete installed owner/runtime
dependency closure for all 56 ports, plus one executed vertical path, with
production legacy removed, scoped event truth, and fresh-process
reconstruction. Work outside that unit is mechanical projection or accepted
behavior coverage.

## Axiomatic Sentinel

Every implementation checkpoint must satisfy these hard constraints:

| Axiom | Immediate falsifier |
|---|---|
| one Public algebra | before the atomic swap, replacement Public is reachable beside legacy; at or after the swap, legacy is reachable or a subset family is published |
| hard replacement | the swap is not atomic, or a new request translates to `RootPublicInvocation` or another old request |
| exact dispatch | path is not `admit -> select exact definition -> concrete owner port -> project outcome` |
| concrete ownership | Public switches on operation identity to supply semantics, or a port exists only as a string/interface |
| catalog singularity | Product publication constructs any rival `PublicContractCatalog`, or Public/Product constructs a rival ABG runtime `ProductCatalog`; the two typed relations are not conflated |
| ABG event authority | Public, Product, HoG, cache, object brand, or process registry authors runtime truth |
| Event Calculus truth | replay/raw scans override the Event Calculus result or unrelated events change scoped truth |
| explicit ingress | request meaning depends on remembered context or an implicit log pointer |
| derived projections | SDK, CLI, Codex, schemas, or manifest owns an independent roster or semantic branch |
| PFC-F08 relation | catalog publication does not preserve the accepted exact attempt/success-or-refusal relation |
| accepted authority | tracked semantic implementation starts before direct F_H accepts the bounded corrective relation and corresponding GOAL/ticket/requirement disposition |
| ticket boundary | S04, post-S06 Prime entropy reduction, M6 realization, or M7 realization enters the S06 delta |
| donor non-authority | donor behavior or shape decides a relation absent from current authority |

At the first counterexample:

1. stop the increment;
2. preserve the rejected delta and counterexample as evidence;
3. reset to the last satisfying frozen cut; and
4. correct the owning authority relation before another implementation attempt.

Do not create a forward compatibility or repair campaign.

## Exact 18-Operation / 56-Key Construction Map

This is the accepted target routing map. It is not yet a constructability
finding about the current code. Gate 1 must expand every one of the 56 keys
into a frozen row containing:

```text
full operation identity
+ definition key
+ existing semantic implementation file/export/content hash
+ proposed exact concrete port contract/export to accept and install
+ realization status: existing | isolated-adoption | build
+ request/result/refusal/non-terminal slots
+ effect/event participant
+ outcome projection owner
```

The names below fix the required owner boundary. They are not permission to
satisfy ownership with metadata strings, TypeScript interfaces, slash-separated
joint owners, or a Public switch.

| Full operation identity | Exact definition keys | Single semantic owner and required callable | Effect/event participant |
|---|---|---|---|
| `abg.operation.workspace.create` | `clean`, `imported` | Product.WorkspaceOperations `WorkspaceOperationPort.create` | Product filesystem boundary |
| `abg.operation.workspace.open` | `open` | Product.WorkspaceOperations `WorkspaceOperationPort.open` | none; deterministic readiness projection |
| `abg.operation.project.read` | 24 cases below | exact case owner `PROJECT_READ_OWNER_PORTS[key].project` | none; pure projection |
| `abg.operation.product.verify` | `verify` | Product.Verification `ProductVerificationPort.verify` | none; deterministic evaluation |
| `abg.operation.product.resolve` | `resolve` | Product.EnvironmentResolution `ProductEnvironmentPort.resolve` | none; deterministic evaluation |
| `abg.operation.product.install` | `install` | Product.Installation `ProductInstallPort.install` | Product immutable-install boundary plus ABG artifact admission where selected |
| `abg.operation.workspace.bind` | `bind` | Product.EnvironmentResolution `ProductEnvironmentPort.bindWorkspace` | Product binding persistence plus ABG artifact admission where selected |
| `abg.operation.catalog.admit` | `admit` | Product.CatalogAdmission `CatalogOperationPort.admit` | ABG owns runtime catalog-event admission and admitted runtime catalog truth |
| `abg.operation.catalog.view` | `allowlist` | Product.CatalogView `CatalogOperationPort.constructView` | none; deterministic content-addressed narrowing from admitted runtime catalog plus exact allowlist |
| `abg.operation.catalog.apply` | `node_type`, `overlay` | Product.CatalogApplication `CatalogOperationPort.apply` | deterministic carrier construction; no event or admission; invocation records exact use |
| `abg.operation.run.invoke` | `invoke`, `start` | Product.RunInvocation `RunInvocationPort[key]` | HoG executes admitted GTL; ABG admits and derives runtime truth |
| `abg.operation.run.continue` | `current_intent`, `selected_action` | Product.RunContinuation `RunContinuationPort[key]` | HoG continuation participant; ABG admission and Event Calculus |
| `abg.operation.interaction.respond` | `select`, `approve`, `reject`, `assess`, `answer_escalation` | Product.InteractionResponse `InteractionResponsePort.respond` | ABG admits F_H response events |
| `abg.operation.result.assess` | `assess` | Product.ResultAssessment `ResultAssessmentPort.assess` | ABG admits result-assessment events |
| `abg.operation.witness.admit` | `reprice`, `attest`, `hygiene-stamp`, `intake`, `run-resumed`, `run-stopped` | ABG.WitnessAdmission `WitnessAdmissionPort.admit` | ABG admits witnessed-act events |
| `abg.operation.conformance.evaluate` | `gtl_program` | Validator.Conformance `ConformancePort.evaluateGtlProgram` | conformance assessment; no GTL execution |
| `abg.operation.product.materialize` | `context_bootstrap`, `configuration` | Product.ProductMaterialization `ProductMaterializationPort[key]` | Product filesystem boundary |
| `abg.operation.release.snapshot` | `published_rc`, `tapped_release` | Product.ReleaseSnapshot `ReleaseSnapshotPort[key]` | immutable release-publication boundary |

The 24 `abg.operation.project.read` definitions and concrete projection owners
are:

| Owner port | Definition keys |
|---|---|
| `Product.CatalogProjectionPort.list/describe` | `catalog_list`, `catalog_describe` |
| `Product.WorkspaceProjectionPort.status` | `workspace_status` |
| `ABG.RunProjectionPort.status/result/evidence/replay/gaps/lawfulActions` | `run_status`, `run_result`, `run_evidence`, `run_replay`, `run_gaps`, `run_lawful_actions` |
| `ABG.GraphCallProjectionPort.status/result/evidence/replay` | `graph_call_status`, `graph_call_result`, `graph_call_evidence`, `graph_call_replay` |
| `ABG.ResultProjectionPort.evidence` | `result_evidence` |
| `ABG.AssessmentProjectionPort.evidence` | `assessment_evidence` |
| `ABG.WitnessProjectionPort.evidence` | `witness_evidence` |
| `Product.InstallProjectionPort.evidence` | `install_evidence` |
| `Product.ReleaseProjectionPort.evidence` | `release_evidence` |
| `ABG.WorkspaceProjectionPort.replay/gaps` | `workspace_replay`, `workspace_gaps` |
| `ABG.InteractionProjectionPort.replay` | `interaction_replay` |
| `ABG.ContinuationProjectionPort.replay` | `continuation_replay` |
| `ABG.CCallProjectionPort.replay` | `c_call_replay` |
| `Product.ConsensusProjectionPort.ticketConsensus` | `ticket_consensus` |

The arithmetic is fixed:

```text
32 non-read definition keys
+ 24 project.read definition keys
= 56 definition keys across 18 operations
```

Definition presence does not grant later-milestone success. The
`conformance.evaluate(gtl_program)` owner is the public GTL-program relation,
not M6 self-conformance. Both `release.snapshot` ports must be concrete and
callable in the family, but successful `published_rc` or `tapped_release`
execution remains an exact closed refusal until M7 supplies its authority.

Any missing concrete owner meaning is a Gate 1 stop. Gate 1 may identify a
concrete owner port that Increment 3 must build, but only when the exact
accepted semantics already exist in an owner-local implementation or
authority-grounded relation. A row with only a proposed type name, donor
symbol, interface, or unresolved joint owner is missing. By Gate 2 every row
must hold an actual runtime-callable port value. Public may not invent it.

## Bounded Authority Re-Entry Before Realization

No Intent or Product shrink is selected. The smallest lawful re-entry is:

- `design_reframe` for explicit setup carriers, scoped Event Calculus, retry
  reconstruction, and currentness;
- targeted `requirement_reprice` only where current requirements conflict,
  especially any generic effectful-artifact wording that misclassifies
  deterministic `CatalogApplication` construction as admission;
- `realization_refactor` for implementation; and
- `goal_reprice` only to place these prerequisites before resumed S06
  realization.

This re-entry is not optional planning commentary. Live T-270/T-281 currently
authorize one realization of accepted design `aa0daa62`, prohibit recursive
design revision and broad Validator/HoG/ABG refactor, and accept a realization
that includes root-operation state. The code-confirmed authority defects cannot
be repaired lawfully under that execution boundary.

Before any tracked falsifier or semantic implementation edit:

1. direct F_H selects the bounded prerequisite and authorizes bounded authority
   editing;
2. GOALS, T-270, T-281, and only the conflicting requirements are amended;
3. one corrective design plus the reconciled construction map is frozen as the
   content-addressed Gate 1 subject;
4. Gate 1 supplies the one independent constructability/authority review; and
5. direct F_H accepts or rejects that exact reviewed Gate 1 authority cut.

Only the acceptance receipt unlocks Increment 0A. If direct F_H does not grant
that boundary, implementation stops at the clean construction baseline.
Commentary cannot supersede accepted design or ticket law. The reframe must
settle only the following relations.

### Product carrier relation

Verification returns a complete immutable verified carrier and native evidence.
Resolution consumes explicit verified carrier preimages and returns a complete
immutable lock. Install and later Product operations consume explicit
digest-bound carrier preimages.

No `WeakMap`, `WeakSet`, registry, ABG Product-body repository, ambient lookup,
or reference-only authority is permitted.

### Static publication and runtime catalog relation

PFC-F08 and `abg.operation.catalog.admit` are different typed relations:

```text
Product-publication manifest-binding attempt
  -> static PublicContractCatalog or exact PFC-F08 refusal
  -> product.verify relation

verified Product contribution
  -> abg.operation.catalog.admit
  -> one ABG-owned admitted runtime ProductCatalog
```

PFC-F08 emits no runtime event. It preserves the extant flat catalog while
binding one Product publication. Its accepted attempt basis is the existing
catalog, proposal set, Product identity, and Product content. It must either
return the exact retained-and-bound catalog plus diagnostic or one of these
eight refusal classes:

```text
forbidden_operation_identity
duplicate_contract_identity
missing_projected_identity
unexpected_projected_identity
retained_row_changed
owning_product_mismatch
unresolved_locator
content_digest_mismatch
```

Only `abg.operation.catalog.admit` authors admitted runtime catalog truth.
Neither relation may aggregate or substitute for the other.

Positive proof must show:

- successful PFC-F08 preserves every retained non-operation row byte-for-byte,
  replaces exactly the three common plus 18 operation identities, emits its
  exact diagnostic, and leaves the ABG event store unchanged;
- each refusal preserves attempt ref/digest, carries non-empty unique
  `issuePaths`, binds refusal ref/digest to that attempt and failure class,
  returns neither output catalog nor diagnostic, and changes no runtime truth;
- `catalog.admit` changes only ABG runtime catalog/Event Calculus truth and
  cannot mutate or reconstruct the static `PublicContractCatalog`; and
- compile-time and runtime checks refuse substitution between
  `PublicContractCatalog` and runtime `ProductCatalog`.

### Admitted artifact and deterministic catalog-application relation

Install, workspace binding, and runtime catalog admission use the one generic
ABG artifact-admission boundary and a scope-keyed Event Calculus projection.
Rehydration combines the exact admitted event/prefix with an explicit immutable
carrier preimage and revalidates identity.

`catalog.view` admits no event. One admitted runtime `ProductCatalog` plus the
exact allowlist deterministically constructs one content-addressed
`CatalogView`; reconstruction repeats and revalidates that relation from the
same inputs.

Gate 1 selects deterministic construction, not admission:

```text
constructCatalogApplication(
  admitted immutable install,
  deterministic CatalogView,
  exact declaration,
  explicit durable prefix
) -> complete canonical CatalogApplication
```

This is a total Product function of those immutable inputs. Any caller may
reconstruct the same carrier. Construction requires no originating object,
store, constructor capability, retained context, registry, brand, or hidden
decision, and changes no runtime truth. `run.invoke` independently revalidates
the inputs and carrier identity, then its ordinary invocation event records the
exact application ref/digest as a used basis.

The corrective design must disposition any generic effectful-artifact wording
that would classify this construction as admission. Do not add an application
event family or preserve admission semantics under a structural name.

### Prefix, identity, scope, and retry relation

- every prior durable prefix is explicit input;
- effectful invocation uniqueness derives from admitted event identity;
- pre-admission refusal does not consume admitted invocation identity;
- pure reads are explicitly repeatable;
- public artifact fluents are keyed by operation, authority-scope ref, and
  authority-scope digest, with collision refusal;
- applicable currentness is the latest applicable event inside the declared
  scope, never the global store tail; and
- retry executable input is carried by admitted event truth and reconstructed
  by one ABG projector.

## Legacy Deletion And Rewrite Boundary

The current legacy census is exactly:

```text
product.verify(artifact)
product.resolve(verified_product_set)
product.install(verified_artifact)
workspace.bind(exact_product_set)
catalog.admit(module_publication)
catalog.apply(node_type|overlay)
catalog.view(allowlist)
project.read(gaps|lawful-actions|replay|result|status|ticket.consensus)
interaction.respond(answer_escalation|approve)
run.continue(current_intent)
run.invoke(direct|start)
```

That is 11 operations and 19 keys. Only seven keys already spell an accepted
target key exactly: both `catalog.apply` keys, `catalog.view(allowlist)`,
`interaction.respond(approve|answer_escalation)`,
`run.continue(current_intent)`, and `run.invoke(start)`. Twelve current keys
must be removed/replaced and 49 target keys introduced. Seven target operations
are wholly absent: `workspace.create`, `workspace.open`, `result.assess`,
`witness.admit`, `conformance.evaluate`, `product.materialize`, and
`release.snapshot`.

Delete or wholesale-replace the old implementation. Reusing a pathname must
not preserve an old export, alias, parser, carrier, or semantic branch:

1. `code/src/product/root_operation_state.ts`: delete the complete process-local
   authority and remove its exports from `product/index.ts`.
2. `code/src/public/contracts.ts`: delete the complete legacy
   roster/carrier/parser/result family, including
   `ROOT_PUBLIC_OPERATION_DEFINITIONS`, `ROOT_PUBLIC_OPERATION_IDS`,
   `RootPublicInvocation`, generic `PublicOutcome`, and
   `parseRootPublicInvocation`. New exact-family modules must not export aliases
   for them.
3. `code/src/public/operations.ts`: delete the complete Public semantic
   controller: context WeakMap, remembered prefix, all `apply*` operation
   handlers, raw legacy parsing, semantic switches, generic refusal collapse,
   and `applyRootPublicInvocation`. Its replacement is the generic exact
   admit/select/call/project path.
4. `code/src/public/schema.ts`: delete the handwritten schema synthesis from
   the old roster. Replace it with canonical projection from strict owner
   schemas.
5. `code/src/public/child_traversal_port.ts`: remove it from Public. Re-home any
   lawful materialize/validate/admit/open composition behind concrete
   Product.RunInvocation, HoG, and ABG owner ports.
6. `code/src/public/outcome.ts`: wholesale-replace replay interpretation and
   generic outcome shaping. A replacement may only project exact
   `ResultOf<K> | RefusalOf<K> | NonTerminalOf<K>` or projection refusal.
7. `contracts/schemas/public-operation.schema.json`: delete and regenerate; no
   `RootPublicInvocation`, old roster, or generic `{}` result survives.
8. `test_env/proof/abi5-root-r10.transcript.json`,
   `abi5-root-r10.outcomes.json`, `abi5-root-r10.events.jsonl`, and dependent
   `abi5-root-r10.json`: remove as current proof and regenerate from the exact
   family.
9. Delete `rootOperationStates`, `pendingReopenAuthority`, all prior-invocation
   lookup maps, volatile duplicate authority, semantic object brands,
   executor-local retry value authority, and global-tail currentness checks
   wherever they occur.

Rewrite or re-home these lawful coordinates:

- `public/index.ts`: export the exact family, schemas, indexed admission and
  outcomes, and SDK projection only;
- `public/cli.ts`: enter the same exact envelope/family/owner-port path as SDK;
- `public/codex_cli.ts`: retain only exact-sibling process delegation and update
  its contract/grammar checks;
- `public/continuation_authority.ts`,
  `public/run_projection_authority.ts`, and `public/gap_authority.ts`: parse
  unverified candidates and obtain usable bases only through owner/ABG
  rehydration;
- `product/index.ts`: remove root-state exports and expose owner-local
  contracts/ports/publication bindings;
- `product/publication.ts`: own Product public-contract publication, the exact
  PFC-F08 attempt/refusal relation, and the sole lawful static
  `PublicContractCatalog` merge;
- `scripts/generate-product-manifest.mjs`: remove old single-schema locators and
  local catalog aggregation; consume owner-derived family projections and the
  Product-owned PFC-F08 result;
- `contracts/schemas/public-contract-catalog.schema.json`: retain the flat
  carrier but add exact PFC-F08 attempt/refusal definitions;
- `contracts/schemas/product-toolchain-manifest.schema.json`: bind the exact
  public catalog relation rather than an unconstrained object;
- `product-toolchain-manifest.json`: clean-build regenerate;
- `package.json`: preserve `./public`, `abg.cli`, and `abg.codex` coordinates,
  but expose only the replacement family; and
- Product verification/environment surfaces: verify the exact family, nested
  owner slots, final catalog, and explicit durable setup carriers.

Rewrite the exact directly coupled support/test surface:

- `test_env/support/root-cli-environment.mjs`;
- `test_env/support/root-installed-environment.mjs`;
- `test_env/support/root-governor.mjs`;
- `test_env/tests/m5-installed-portability.test.mjs`;
- `test_env/tests/m5-installed-external-product.test.mjs`;
- `test_env/tests/m5-installed-consensus.test.mjs`;
- `test_env/tests/m5-installed-fp.test.mjs`;
- `test_env/tests/rival-authority-mutations.test.mjs`;
- `test_env/tests/m5-consensus-module.test.mjs`;
- `test_env/tests/r10-installed-cli-outcome.test.mjs`;
- `test_env/tests/r5-invocation-admission.test.mjs`;
- `test_env/tests/m5-s03-authority.test.mjs`;
- `test_env/tests/m5-event-store-reopen.test.mjs`;
- `test_env/tests/r3-workspace-binding.test.mjs`; and
- `test_env/tests/r4-catalog-admission.test.mjs`.

Delete assertions whose subject is the legacy carrier, roster, parser, schema,
three-row operation catalog, generic refusal, old definition spelling
(`artifact`, `verified_product_set`, `verified_artifact`,
`exact_product_set`, `module_publication`, `direct`, `lawful-actions`,
`ticket.consensus`), same-object/store application authority, or volatile
context-local duplicate behavior. Rewrite the conserved installed, Consensus,
F_P, external-Product, continuation, replay, and rival-authority scenarios
against exact structural `K = {operationId, memberKey}`. No lawful scenario test
file should be deleted wholesale.

Rerun transitive harness consumers, including fibre substitution, installed
compose/fan-out/F_P/gate/graph-edge/recursion/retry/substitute/workflow, live
F_P, traversal conservation, flavored-catalog, runtime-scope, and root-governor
tests. Adjust fixtures only where the exact contract changes; preserve their
scenario meaning.

Retain accepted S03/S05 behavior and owner-local Product, ABG, Validator, HoG,
and release functions. Retain the bounded Codex transport. `legacyRequest`,
`indexedRequest`, and `indexedRequest ?? legacyRequest` are not present at the
baseline; they remain explicit donor/rejected-realization hazards.

## Generated Projection Relation

There is one intrinsic definition family. Everything else is generated or
indexed from it:

```text
owner-local contract sources + concrete owner ports
  -> IntrinsicPublicFunctionDefinition<K>
  -> exact 18/56 family
  -> native invocation/outcome types
  -> JSON Schemas
  -> installed SDK
  -> installed CLI
  -> bounded Codex delegation

exact 18/56 family + Product publication
  -> PFC-F08 static catalog-binding attempt
  -> PublicContractCatalog + product manifest rows
     or one exact PFC-F08 typed refusal

verified Product contribution
  -> abg.operation.catalog.admit
  -> one ABG-owned admitted runtime ProductCatalog
  -> Event Calculus projections
```

Mechanical equality must prove:

- exactly 18 operation identities and 56 definition keys;
- exactly 24 read definitions;
- one request/result/refusal/non-terminal slot set per key;
- owner source, concrete port, schema, SDK, CLI, capabilities, and exit map are
  total and key-consistent;
- generated assets are idempotent;
- SDK, CLI, and Codex add no roster or semantics; and
- PFC-F08 preserves every lawful retained catalog row and emits exactly one
  attempt-bound success or one of the eight accepted refusal classes; and
- the static `PublicContractCatalog` and ABG runtime `ProductCatalog` remain
  typed, singular, and mechanically non-substitutable.

## Delivery Sequence

The three independent implementation reviews below are the S06 construction,
architecture, and frozen-candidate gates. The direct F_H selections and later
Prime/M6/M7 ticket reviews are constitutional acceptance boundaries, not extra
reviews of a moving S06 tree. Every reviewer receives an immutable subject.

### Phase 0 — Freeze the STDO identity-only cut

The current authority delta:

- selects STDO 2.2.2 in live authority surfaces;
- refreshes and byte-verifies the ignored 41-member local projection;
- preserves accepted design bytes; and
- records the upstream carrier/acceptance residual for T-282.

Freeze this delta separately or establish another exact clean construction
baseline. Record commit, tree, branch, tracked-state, 41-member inventory, and
member-set digest. Do not mix semantic code into the method cut.

### Phase 1 — Read-only exact construction census

Against the frozen STDO baseline, current accepted authority, and unchanged
semantic implementation, produce:

1. the complete 56-row matrix with full operation identity, key, actual
   semantic-implementation file/export/hash, proposed exact concrete port
   contract/export, existing/adopt/build status, all four slots, effect/event
   participant, and outcome projection owner;
2. the exact legacy carrier/parser/schema/dispatch/state/test deletion manifest
   and the lawful scenario rewrite manifest;
3. the Product carrier, catalog-application, durable-prefix, invocation,
   scope/currentness, retry, and refusal relations;
4. the static PFC-F08 oracle, including complete attempt/success basis, all
   eight refusals, and retained-row conservation;
5. the generated projection graph and exact-set checks;
6. the smallest installed sentinel recipe; and
7. one decision-complete falsifier constructability record for every `AX-F*`
   and `AX-PFC-F08` relation; and
8. any proposed donor symbol with a transitive proof that it imports, types,
   generates, and executes no legacy Public dependency.

No target-only type name counts as a current export. Missing concrete owner
meaning and every contradiction between current authority and the required
architecture are explicit census results, not requests to edit code.

### Phase 2 — Reset authority and reconcile the map

Using the read-only census as evidence, direct F_H selects the bounded
corrective re-entry and authorizes the required GOAL, ticket, requirement, and
design edits. This is authorization to construct the Gate 1 authority
candidate, not acceptance of that candidate. No tracked falsifier, production,
schema, generator, or semantic test edit starts first.

Reconcile the 56-row census to the proposed corrective design without touching
semantic implementation. The authority cut must distinguish two Prime
boundaries:

1. the bounded S06 first-realization gate that consumes or explicitly refuses
   the identified recurrence families without broad ABG/HoG redesign; and
2. the post-S06 Prime entropy-reduction design and realization required before
   the unified M5 candidate.

They are not one phase and neither permits premature M6 or M7 work.

### Gate 1 — Construction map

Freeze one commit/tree or content-addressed bundle containing the proposed
corrective authority cut, complete construction matrix, deletion manifest,
projection graph, PFC-F08 oracle, sentinel recipe, falsifier specification,
reviewer inputs, and donor-evidence digests.

The falsifier specification is total only when every stable relation ID binds:

```text
current-code ingress = exact file + exported/internal callable
exact-family ingress = proposed owner/Public callable to receive the same test
process boundary = same process | reopened store | real second process
fixture source = exact builder/carrier/event-prefix source
mutation = one reproducible input transformation
observable oracle = exact return/event/effect/identity assertion
expected baseline signature = exact value/code/event count or preservation result
mask controls = every earlier prerequisite preconstructed, bypassed, or asserted
```

All fields are mandatory and content-addressed. “Test operation X” or “expect a
refusal” is not a specification. The record must show why parse failure,
missing setup state, duplicate identity, wrong prefix, missing dependency,
timeout, or another earlier refusal cannot mask the target relation.

Independent review:

- one constructability reviewer attempts to disprove that all 56 owner rows
  can be built and that every falsifier record can be implemented without
  choosing a new ingress, fixture, mutation, oracle, baseline signature, or
  mask control; and
- one authority reviewer seeks only Product, ticket, accepted-design, catalog,
  event-authority, and milestone-boundary counterexamples.

Gate 1 fails if any owner meaning is absent, the proposed exact owner-port
destination is unresolved, any authority disposition remains in commentary
only, or construction requires a compatibility facade, second authority path,
Public semantics, rival static/runtime catalog, process-local runtime truth,
or donor-derived meaning. It also fails if any falsifier record is incomplete
or can terminate at an earlier prerequisite without observing its target.

After the two reviews are consolidated, direct F_H accepts or rejects the exact
unchanged Gate 1 subject. The acceptance receipt binds its commit/tree or bundle
digest and both review receipts. Only that receipt authorizes Increment 0A.

### Increment 0A — Establish the falsifier baseline

After Gate 1 and before semantic repair, encode the already accepted falsifier
records in one dedicated characterization command and evidence artifact.
Increment 0A may not choose or change an ingress, process boundary, fixture,
mutation, oracle, baseline signature, or mask control. Each stable relation ID
records its exact mutation/oracle digest and expected baseline signature; a
nonzero aggregate exit is not evidence. F07 is a preservation probe and may
already be green. Every confirmed defect must be demonstrably red before its
repair.

The table below is a routing index. Its implementable meaning is the frozen
Gate 1 constructability record for that relation ID, not prose completed during
Increment 0A.

| Relation | Lane | Exact mutation | Finding |
|---|---|---|---|
| `AX-F02` | verified carrier restart | serialize verification output, spawn a second process, reopen explicit authority, then resolve | F02 |
| `AX-F01` | admitted setup restart | in separate processes reconstruct install, workspace, and runtime catalog from carrier plus event prefix; reconstruct view from admitted catalog plus allowlist | F01 |
| `AX-F06` | catalog-application origin | independently reconstruct an equal application from immutable install/view/declaration/prefix inputs, then drive `run.invoke` without any originating object/store/context/brand | F06 |
| `AX-F07` | source-result derivation | reopen durable projection authority and directly call ABG-backed source-result derivation with reconstructed Product-semantics basis | F07 preservation; promote only if it fails |
| `AX-F12` | two-prefix ingress | alternate two durable prefixes through one retained context and two fresh contexts | F12 |
| `AX-F13` | invocation identity | retry one admitted effectful invocation after restart; compare a parse-valid semantic refusal in-process/after restart; repeat a declared pure read | F13 |
| `AX-F08` | interleaved currentness | append an unrelated valid event before initial cursor, continuation reconstruction, F_H response, F_H resume, normal closure, interaction closure, child closure, and refusal-event causation | F08 |
| `AX-F10` | semantic permutation | permute the same GraphFunction semantic membership | F10 |
| `AX-F05` | pre-effect topology | mutate duplicate node, empty terminal set, terminal edge, nonterminal zero outgoing, nonterminal multiple outgoing, unreachable terminal, and undeclared/ungoverned cycle | F05 |
| `AX-F04` | artifact scope/collision | admit two scopes, then a conflicting digest inside one scope | F04 |
| `AX-F09` | retry restart | terminate the executor at the admitted retry frontier and reconstruct the next input | F09 |
| `AX-F11` | refusal fidelity | with distinct invocation refs, drive `artifact_unreadable` and `artifact_digest_mismatch` through the same operation boundary | F11 |
| `AX-F14` | canonical ordering | mechanically prohibit locale-sensitive identity sorts and test the code-unit comparator, or use verified distinct-locale subprocesses | F14 |
| `AX-F03` | family mutation | remove, add, duplicate, or mis-slot one operation/key | F03 |
| `AX-PFC-F08` | catalog binding | isolate successful static binding and one exact fixture for each of the eight refusal classes; verify runtime event-store non-effect | PFC-F08 |

A real second process is mandatory where specified. Same-process reopen retains
the `WeakMap` keys, `WeakSet` brands, module globals, and object identities
under test. `AX-F07` passes only when the same ABG-derived basis
ref/digest/value is reconstructed; the derived brand is not itself an admitted
event. `AX-F06` must reach the object-brand check rather than fail earlier on
`RootOperationState`.

Invalid topology must refuse before any admitted runtime event or leaf effect,
and Validator and HoG must interpret the same Program. The cycle
characterization separately proves static acceptance and uses a capped/counting
leaf port or watchdog to prove execution crossed the pre-effect boundary; a
timeout alone is not a finding signature.

Each `AX-PFC-F08` refusal fixture binds one exact `failureClass`: forbidden
extant operation row, duplicate contract identity, omitted projected identity,
extra projected identity, changed retained row, wrong owning Product,
unresolved locator, or mismatched content digest. Every fixture verifies the
attempt/refusal identities, unique non-empty issue paths, absence of output
catalog/diagnostic, and absence of runtime events.

If locale subprocesses implement `AX-F14`, record
`Intl.Collator().resolvedOptions().locale` and use a corpus proven to order
differently under the selected locales. Otherwise use the static prohibition
plus code-unit comparator test for every identity-bearing sort.

Do not weaken a failing characterization. If a lane cannot deterministically
observe its claimed relation, repair the proof harness before production code.
Freeze a harness-only commit/tree and red/preservation evidence digest before
the first repair.

### Increment 1 — Deterministic identity and whole-Program validation

Implement the accepted prerequisite:

- unique node identity;
- non-empty exact start and terminal law;
- terminal outdegree zero;
- declared non-terminal outdegree law;
- reachability and boundedness;
- declared recursion only, with undeclared/ungoverned cycles refused;
- one normalized Program consumed by Validator and HoG;
- pre-effect topology refusal;
- canonical GraphFunction semantic-set ordering; and
- explicit byte/code-unit comparison for identity-bearing sorts.

Mechanical proof:

```text
equal semantic Program under admitted permutation
  -> one ProgramValidation
  -> one GraphValidation
  -> one ExecutionBasis
```

### Increment 2 — Scoped ABG Event Calculus and reconstruction

Implement:

- scope-keyed artifact fluents and same-scope collision refusal;
- one ordinal-ordered ABG projector instead of consumer raw-event scans;
- latest-applicable-event selection inside declared run/frame/aggregate scope;
- retry executable input in admitted event truth and one ABG projector;
- explicit durable-prefix ingress;
- event-derived effectful invocation identity and declared repeatable reads; and
- preservation of the existing ABG-backed source-result reconstruction when
  `AX-F07` passes, or repair of only that relation when the probe proves a gap.

Mechanical proof:

```text
same scoped prefix + any unrelated valid suffix
  -> same scoped admissibility, retry frontier, result, and closure
```

### Increment 3 — Owner contracts, carriers, and exact Public dispatch

Implement the complete owner-local request/result/refusal/non-terminal
contracts and runtime-callable ports for all 56 keys. Product verification,
resolution, installation, binding, catalog view/application, invocation,
continuation, interaction, assessment, conformance, materialization, and
release carriers must cross the installed process boundary by explicit
preimage plus admitted authority where required.

Public implements only:

```text
admit common envelope
  -> select exact IntrinsicPublicFunctionDefinition<K>
  -> call its concrete owner port
  -> project ResultOf<K> | RefusalOf<K> | NonTerminalOf<K>
```

There is no operation-identity semantic switch and no generic JSON refusal
collapse. PFC-F08 binds the static publication catalog. ABG alone admits the
runtime Product catalog and derives runtime truth.

Until Increment 4's atomic swap, the owner-local modules and exact dispatcher
remain unexported and uninstalled. The unchanged legacy family is the sole
reachable Public path. No intermediate checkpoint may expose both families,
and no adapter may connect them.

### Increment 4 — Install the full family, sentinel, and hard break

Perform one atomic production swap, then complete the pre-Gate-2 proof:

1. install the complete intrinsic 18-operation/56-key roster with a concrete
   owner port for every row while disconnecting the legacy Public exports in
   the same cut; do not publish a sentinel-only subset or dual family;
2. generate every native binding, schema, static `PublicContractCatalog` row,
   and Product manifest row needed to admit all 56 keys, and include the full
   transitive owner-module/runtime dependency closure required by all 56
   callable ports; no sentinel-only projection or dependency pruning is
   permitted;
3. from a clean tarball install, mechanically load and resolve every one of the
   56 concrete owner ports and its declared runtime closure without invoking
   semantic behavior; and
4. run this one complete cross-process sentinel through that family:

   ```text
   product.verify(verify)
     -> product.resolve(resolve)
     -> product.install(install)
     -> workspace.bind(bind)
     -> catalog.admit(admit)
     -> catalog.view(allowlist)
     -> catalog.apply(node_type)
     -> run.invoke(invoke)
     -> project.read(run_result)
     -> project.read(run_replay)
   ```

5. serialize each setup carrier, move it to a fresh process/context, parse it as
   a candidate, and revalidate it against the explicit durable prefix before
   the next operation;
6. delete the production legacy carrier, parser, schema, state, dispatch,
   semantic controller, remembered-prefix path, volatile duplicate authority,
   object-brand authority, and every new-to-old bridge; and
7. delete tests that assert legacy semantics. Wider lawful scenario rewrites
   may continue after Gate 2, but no reachable production or test authority may
   require the legacy family; and
8. port every Increment 0A falsifier to the exact-family ingress without
   changing its stable relation ID, mutation, oracle, or frozen baseline
   digest. Characterization relations are rewritten, never deleted as legacy
   tests.

The same event prefix must produce the same result after restart. The sentinel
is the behavior reviewed at Gate 2; the installed family remains the full
18/56 algebra. After the atomic cut, any legacy reachability is an immediate
axiom failure.

### Gate 2 — Architecture sentinel

Clean-build one interim sentinel tarball from the exact family. Its explicit
inventory contains the entire 18/56 family, every concrete owner module and
transitive runtime dependency required by all 56 ports, every schema and static
catalog/Product-manifest row needed to admit every key, and only exact Public
exports. The sentinel exercises one vertical path; the package is not pruned to
that path. It is an installed architecture subject, not the final S06 package.

Freeze its exact commit, tree, tarball/package digest, inventory, 18/56 owner
census, 56-row installed load/resolve report, fresh-process
requests/outcomes/events/replay evidence, PFC-F08 evidence, forbidden-symbol
report, and a row-addressed ledger:

```text
stable relation ID
  -> frozen legacy baseline artifact/digest
  -> unchanged mutation/oracle digest
  -> exact-family green evidence/digest
```

At Gate 2 every `AX-F*` and `AX-PFC-F08` relation must be green through its
owning/intrinsic/Public boundary, except that `AX-F07` may be a preserved green
baseline rather than a repaired red relation. `AX-F11` must distinguish the
exact refusals through Public here; installed SDK and CLI equality completes at
Gate 3. One cold reviewer inspects only singular authority and forbidden
bridges.

Reject if:

- any legacy carrier/parser/schema or new-to-old translation is reachable;
- Public supplies operation semantics or an owner port is metadata-only;
- either catalog relation has a rival admission/aggregation path or the static
  and runtime catalog types are conflated;
- any prior fact depends on a registry, object identity, remembered prefix, or
  global store tail;
- effectful duplicate identity is not event-derived;
- run/read truth is not the scoped Event Calculus result; or
- the installed roster is not exactly 18/56 even if the sentinel itself passes;
  or
- any of the 56 ports or its declared runtime closure cannot load and resolve
  solely from the installed tarball.

Gate 2 passes only with a decision receipt bound to the frozen subject,
row-addressed ledger, and cold-review findings. That receipt alone authorizes
Increment 5.

### Increment 5 — Complete projections and preserve accepted behavior

Without another semantic review interruption:

1. complete and regenerate native types, JSON Schemas, Product manifest rows,
   SDK, CLI, bounded Codex grammar, capabilities, and exit mapping from the
   single family;
2. enforce exact-set equality and generator idempotence;
3. rewrite every lawful legacy scenario against exact
   `K = {operationId, memberKey}` while preserving scenario meaning;
4. exercise every definition and refusal/non-terminal variant, including
   `AX-F11` with distinct invocation refs through both installed SDK and CLI;
5. run S01, S02, accepted S03, accepted S05, S06, external Product,
   continuation, retry, recursion, Consensus, interleaving, reopen, closure,
   and C/traversal conservation stock; and
6. clean-pack twice, compare required inventory/content digests, and install
   only from each tarball.

Failures are classified against the frozen axioms. Do not reopen accepted S03
or S05 semantics merely because their carriers changed.

### Gate 3 — Frozen S06 candidate

Freeze one exact S06 commit, tree, tarball, generated inventory, 18/56/24
census, owner-port census, deletion report, package digest, focused mutation
evidence, full conserved behavior corpus, and installed external-Product
evidence. Stop editing that candidate.

Two heterogeneous independent reviewers inspect the same subject:

- architecture/authority seeks a counterexample to Product, ticket, accepted
  design, singular catalog/event authority, or hard-break deletion; and
- installed Product behavior seeks a counterexample across the complete 18/56
  contract and accepted S01/S02/S03/S05/S06 behavior.

Aggregate findings once. A repair creates a new frozen candidate and reruns the
complete mechanical corpus. Semantic rereview may remain limited to the
repaired relations and their regression basis.

### Direct S06 acceptance

After Gate 3 only, direct F_H accepts or rejects the exact S06 candidate.
The acceptance receipt binds commit, tree, tarball, package digest, both review
receipts, and the consolidated finding disposition. Acceptance closes the S06
realization boundary. Rejection resets to the last axiom-satisfying cut; it
does not start a forward compatibility campaign.

### Post-S06 Prime entropy reduction

Only after direct S06 acceptance:

1. complete and freeze the compact atomic Prime design;
2. independently review and directly accept that exact design;
3. realize the selected contraction without changing S06 Public meaning; and
4. freeze and accept the exact Prime realization.

This is the declared post-S06 phase. It is not the bounded S06 prerequisite and
must not be pulled into the S06 candidate.

### Complete publication closure and unified M5

After accepted Prime realization:

- close `REQ-P-PUBLIC-CONTRACTS-005..011`;
- close all nine publication groups and all 44 schema/vocabulary/corpus rows;
- prove the complete 18-operation roster, all 16 capabilities, and the
  capability graph;
- regenerate and verify every publication/projection from the single family;
  and
- freeze one unified M5 candidate containing accepted S03, S05, S06, Prime,
  and complete Public publication closure.

Prime and publication edits can invalidate S06-era mechanical evidence.
Therefore rerun the complete Gate 3 mechanical and installed-behavior corpus,
freeze the unified M5 commit/tree/tarball/inventory/digests, and obtain the
T-270/direct-F_H acceptance receipt for that exact subject. This is the
declared M5 constitutional handoff, not a fourth moving-tree S06 review. No M6
work starts before that acceptance.

### M6 qualification handoff

Activate T-247 and T-282 only from the accepted unified M5 candidate:

- materialize the exact STDO 2.2.2 law basis;
- close the upstream STDO carrier/acceptance provenance relation;
- run self-conformance;
- close every 4.6 conservation row with installed witness and real mutation;
- freeze one exact `pre_rc_candidate` basis and owning-gate vector; and
- prove zero unexplained executable-change gaps.

An exact T-282 refusal is evidence, not release permission. Unless the same
direct F_H decision lawfully resolves its release consequence without weakening
the Product, the refusal blocks M6 and the final tap. M6 uses its own active
tickets and acceptance reviews; it does not reopen S06.

### M7 RC and stable-release handoff

Activate T-248 only after accepted M6 qualification:

1. materialize one immutable RC;
2. fresh-install and qualify that exact RC;
3. bind the final-tap candidate and typed final-only delta;
4. rerun every affected gate;
5. publish stable `5.0.0`;
6. fresh-install the published package; and
7. run installed deterministic, F_P, F_H/continuation, Consensus, and
   downstream-portability journeys through the same exact public family.

Any Product-significant repair creates a new exact candidate. Do not move or
relabel a rejected cut. M7 uses its own active ticket and release acceptance;
Gate 3 remains the frozen S06 realization gate, not a retrospective review of
an already published RC.

## Continuous Mechanical Checks

Between the three semantic gates, run:

- exact branch/HEAD/tree and tracked-state checks;
- `git diff --check`;
- forbidden-symbol and forbidden-bridge search;
- 18/56/24 exact-set census;
- owner export and callable-port census;
- installed load/resolve census for all 56 owner ports and their declared
  runtime closures;
- schema/native/manifest/SDK/CLI key equality;
- generator idempotence;
- TypeScript build;
- the dedicated row-addressed falsifier command;
- focused mutation suites;
- every stage-applicable conserved M4/M5 suite;
- clean pack/install tests; and
- reproducible package inventory/digest checks.

Each frozen checkpoint records the exact commands, tool/runtime versions,
expected-red or expected-green row disposition, output artifact, and digest.
Expected-red evidence is not mixed into a green aggregate. A repaired candidate
reruns the complete applicable mechanical corpus even when semantic rereview is
limited to the repaired relation. Mechanical checks locate drift continuously.
They do not reinterpret the Product or prescribe repairs.

## Mandatory Counterexamples

The standing proof rule is:

> No authority, identity, currentness, or replay-sufficiency claim is proven
> solely by a single-process, single-run, fixed-order test. The proof lane must
> vary the dimension that could carry hidden authority: process identity,
> object identity, durable prefix, run interleaving, transport order, or
> pre-effect invalidity.

A claim of the form "X is admitted, verified, applied, current, replayable, or
closed" requires a reconstructed-carrier or fresh-process proof unless its
accepted lifecycle explicitly ends before that boundary. A same-process sunny
lane is preservation evidence, not authority proof.

| Relation | Mutation | Required result |
|---|---|---|
| verified carrier reconstruction | serialize verification and resolve in a fresh process | same lawful resolution |
| admitted setup reconstruction | reconstruct install/workspace/runtime catalog from carrier plus prefix, then view from catalog plus allowlist | same lawful outcome without view event |
| catalog-application reconstruction | independently construct an equal carrier, with setup already rehydrated, and invoke in a fresh process | deterministic equality passes; invocation records exact use; no origin/store/context governs |
| source-result reconstruction | directly rederive through ABG events/replay in a fresh process | same derived basis ref/digest/value, or F07 promoted |
| prefix ingress | interleave two explicit durable prefixes through retained and fresh contexts | no ambient selection |
| artifact scope | two distinct scopes | two distinct scoped Event Calculus projections |
| artifact collision | same scope ref with conflicting digest | typed refusal |
| topology | duplicate, empty terminals, terminal edge, invalid nonterminal outdegree, unreachable terminal, or undeclared cycle | refusal before any effect/event; capped/counting evidence for cycle |
| semantic identity | permute equal GraphFunction set | identical validation and execution identity |
| run isolation | append unrelated run event at initial cursor, continuation reconstruction, F_H response/resume, normal/interaction/child closure, and refusal-causation sites | no change to scoped currentness/result/closure |
| retry restart | reopen at retry frontier | identical admitted next input and attempt |
| invocation identity | repeat an admitted effectful call after restart, repeat a parse-valid refusal before/after restart, and repeat a declared read | one uniform event-derived or explicitly repeatable disposition |
| refusal fidelity | use distinct invocation refs and vary unreadable versus digest mismatch | distinct exact Public refusal at Gate 2 and identical SDK/CLI projection at Gate 3 |
| canonical ordering | prove distinct effective locales and varying corpus, or prohibit locale sorts and use the code-unit corpus | identical canonical identity |
| family closure | remove/add/duplicate any operation/key/slot | exact-set refusal |
| PFC-F08 refusal | one isolated fixture for each accepted failure class | exact attempt/refusal identity, unique issue paths, no catalog/diagnostic/event |
| PFC-F08 success | bind exact proposals into extant catalog | byte-preserved retained rows, exactly 3+18 replacements, exact diagnostic, no event |
| catalog non-substitution | apply static binding, runtime admission, and cross-type substitution attempts | each relation changes only its own truth and cross-type use refuses |
| projection purity | mutate SDK/CLI/Codex roster or semantics | equality/authority failure |
| external Product | use only installed public exports | succeeds without private/source paths |
| installed owner closure | load/resolve every owner port and declared dependency from the tarball | all 56 resolve without source/private paths |
| package | pack and install twice against a pinned inventory | required inventory and content digests reproduce |

## Release Scope Exclusions And Milestone Holds

Only already excluded work remains deferred:

- A5-F12 / S04 observer and tuner for 5.1;
- self-hosting and 5.0.1 dogfooding;
- actual odd_glc release;
- hosted, distributed, marketplace, billing, IAM/RBAC, signing, and hostile
  workstation features;
- post-install update, disable, unbind, uninstall, revocation, retirement, and
  supersession lifecycle.

Post-S06 Prime entropy reduction, complete publication closure, M6, and M7 are
inside the release route but held at their declared predecessor boundaries.
This plan sequences their handoffs; it does not authorize their implementation
inside the S06 delta.

## Immediate Next Action

Freeze the STDO 2.2.2 and authority-setup cut as one exact clean baseline.
From that baseline and without tracked edits, produce the complete 56-row
current-code construction census, deletion manifest, PFC-F08 oracle,
projection graph, donor dependency proofs, sentinel recipe, and
authority-contradiction register. Give that exact evidence to direct F_H for
selection and authorization of the bounded authority work. Construct the
proposed corrective design and reconciled map, freeze the Gate 1 subject,
obtain its two reviews, and only then request direct acceptance of that exact
cut.

Only after the Gate 1 acceptance receipt, implement Increment 0A and record
each expected-red or preservation signature against the unchanged semantic
implementation.

If any required owner meaning is missing, stop and report the exact gap. Do not
begin the sentinel, invent meaning in Public, build an adapter, or publish a
smaller family.
