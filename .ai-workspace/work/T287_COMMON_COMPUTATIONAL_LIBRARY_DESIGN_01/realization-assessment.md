# Common computational capability library: realization assessment

Status: frozen Worker assessment; returns to root Executive for conjunction and
disposition. This is design evidence, not implementation acceptance, whole-family
Prime proof, runtime qualification, or a new work grant.

## Activation and exact subject

- Work root: `repo://abiogenesis/`.
- Frame: computational realization, foundation selection, and recurrence under
  `build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`.
- Parent activation: `activation.md` in this work directory.
- Source inventory: `basis.json`, SHA-256
  `7c4196afaf481be05056a5c3b5120b98b9e4d012ccf2b673f765076b3ec23376`;
  HEAD `727f1dbcab3c198f7704735fdf91b994b7aac243` plus its explicitly
  inventoried dirty source. The inventory contains 696 files.
- Method: `stdo://releases/v3.0.0-rc.1/`, manifest SHA-256
  `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`.
  `stdo status --definition stdo_abiogenesis.json --verify` returned
  installed/valid with no failures in this assessment.
- Effects: read source, inspect dependency metadata and existing evidence, and
  write this report only. No runtime execution, tests, build, package operations,
  source changes or Git mutation.
- Outcome: identify a concrete reusable library basis that can reduce bespoke
  computations, while explicit obligations precede actual execution evidence.

`AGENTS.md`, current Goals, Intent, Product, selected frame basis, and realization
constitution were reacquired. Product retains the fifteen-family ABG5 scope,
GTL.TypeScript, direct HoG traversal, ABG-only runtime admission/Event Calculus,
pure catalog/readiness and thin Public/SDK/CLI. F_D/F_P/F_H do not merge.
Current STDO's owning source is `standards/DESIGN_MODULE.md`, particularly
Capability and foundation selection, Atomic functions and higher-order
composition, and Whole-family Prime contraction. The constitution's older
`DESIGN_MODULE_METHOD.md` spelling is a historical source route, not another
installed V3 member.

## Finding

The intended asset can be designed from substantial existing common machinery.
It should be one coherent capability library with explicit reusable contracts
and consumer mappings. It does not require one new package, one giant generic
carrier, a dynamic dispatcher, or physically relocating every function.

The observed proliferation is not simply a shortage of generic helpers.
Canonical encoding, hashing, immutability, strict schemas, static bindings and
prefix-based derivation already recur through shared implementations. The
remaining design problem is to make those capabilities the default construction
basis, contract equivalent residuals into them, and identify owner-specific
relations that must survive contraction. Feature names and Public definition
keys are not evidence that a new computational algorithm is required.

The candidate library below has three forms:

1. authority-neutral mechanics with exact contracts;
2. existing owner-domain capabilities reused through their exact owner ports;
3. module-static compositions of those capabilities using the selected Effect
   algebra.

This is a candidate factoring supported by inspected source. It is not a claim
that every source helper is reachable, duplicative, reducible or already
conforming.

## Bounded discovery and current foundations

The population searched was the current tenant's 264 `code/src/**/*.ts` files,
the current package manifest/lock, constitution §§5.6 and 10.1, and the six
April ABG common-library derivation/IACS/diagram filenames. Imports, exported
symbols, representative function bodies and consumer chains named below were
inspected. The complete 264-file population was searched lexically; only the
named chains received body-level inspection. No complete dynamic call graph or
semantic clone census was constructed.

Lexical source-import evidence shows substantial present reuse: 191 files
reference `shared/canonical_json.js`, 172 reference `shared/digests.js`, 153
reference `shared/immutable.js`, and 61 reference
`shared/admission_predicates.js`. These counts locate the existing foundation;
they neither prove correctness nor measure contraction. There are 18 live
modules under `code/src/shared/`.

| Population/candidate | Current evidence | Disposition for this design |
|---|---|---|
| Already selected `effect@3.22.1` | Exact package and lock; MIT in lock. `shared/effect_definition.ts::runEffectProgram` contains the sole `Effect.runPromiseExit` spelling. `hog/graph_execute.ts::evaluateTraversalProgram` uses `Effect.iterate`; `executeOwnedGraphTraversalEffect` is consumed by installed run bindings. | Reuse the admitted composition foundation. Design does not select a competing execution runtime or reinterpret Effect as GTL program data. |
| Strict owner schemas, `valibot@1.4.2` | Exact manifest/lock; MIT in lock. `shared/public_function_contracts.ts`, `definition_binding_mechanics.ts`, and `static_definition_bindings.ts` carry native schema admission. | Reuse exact owner contracts and existing structural mechanics. No universal schema or semantic validator. |
| Existing other dependencies | `@valibot/to-json-schema@1.7.1`, `jsonc-parser@3.3.1`, `ajv@8.20.0`, `ajv-formats@3.0.1`; TypeScript 5.9.2, Node engine `>=20`. | Preserve their selected roles. Presence alone does not establish suitability for another capability. |
| Node mechanics and current owner implementations | Node crypto/fs/path/process APIs; Product filesystem functions; ABG event store, exact-prefix transitions and reconstruction. Constitution §10.1.3 already selects their owner-local composition. | First concrete realization basis; no new dependency needed to articulate the library. Selection is preserved by current admitted design, not justified merely by incumbency. |
| Immutable 4.6 and older Effect prototypes | Constitution §10.1.1/2 records semantic-lineage and bounded prototype evidence. Current `hog/execute.ts` and `hog/effect_direct_scalar.ts` are absent. | Historical semantic/equivalence evidence only. Do not cite absent prototypes as active implementations or resurrect them. This assessment did not independently reacquire those archived cuts. |
| April common realization/delivery libraries | Derivations preserve useful separation of mechanics from module meaning. Their current-source paths `shared/abg_library`, `shared/delivery`, `app/m04/control`, and directory `abg/m03/transport` are absent. A different `abg/m03/transport.ts` file exists. | Design lineage, not a live reusable library implementation. Do not select the old path layout or restore obsolete M04 control authority. |
| External alternatives | Current constitution already records bounded Effect/native/fp-ts/RxJS/XState and resource/platform comparisons. No fresh external search or contemporary health claim was made. | No material new dependency is selected here. A new generic algorithm or material replacement must reopen proportional current candidate discovery; old package-health/size rows cannot be presented as current verification. |

The external/predecessor discovery gaps do not block preserving admitted
foundations and exposing candidate consolidation opportunities. They **do**
block any new dominance claim, new package selection, or assertion that an
unexamined external foundation cannot improve a material proposed algorithm.
Current installed footprint, startup, whole-path memory and actual contraction
savings were not measured in this report.

Supplemental source coordinates outside `basis.json`:

| Source | SHA-256 |
|---|---|
| `build_tenants/abiogenesis/typescript/package.json` | `17cefea93264afda099d65b81443bd9461f5b7b6c99484bb1d1cde4f8061b6c9` |
| `build_tenants/abiogenesis/typescript/package-lock.json` | `df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12` |
| `stdo://releases/v3.0.0-rc.1/standards/DESIGN_MODULE.md` | `50e70c797c93718e85192aaf2de39596f62f53030507ca8242c1af7e8f0ebcbe` |

All 264 source-file hashes were compared with the initial inventory immediately
before report freeze; all matched. Other Workers' authorized documentation
activity does not change this source assessment subject.

## Concrete capability families and consumer mappings

All source paths below are relative to
`build_tenants/abiogenesis/typescript/code/src/`.

### L1. Canonical values, exact equality, digests and immutable values

Generic capability: admit a declared value domain, produce its canonical byte
stream or digest, compare under a named equivalence relation, and preserve
immutability. Canonical implementation: `shared/canonical_json.ts`
(`canonicalJson`, `writeCanonicalJson`, `compareUnicodeCodeUnits`);
`shared/digests.ts` (`sha256Bytes`, `sha256Canonical`, `sha256File`,
`payloadInventoryDigest`); `shared/immutable.ts` (`deepFreeze`,
`isDeeplyFrozen`); `shared/i_json.ts` for untrusted I-JSON admission.

Representative consumers: GTL canonicalization/materialization; Product
publication, installation and declaration closure; Implementation descriptors
and deterministic evidence; ABG event encoding, artifact and execution basis.
The sink-based canonical writer is already shared by text materialization and
incremental hashing. A second canonical serialization algorithm is unjustified.

Visible contraction candidates include `shared/definition_binding_mechanics.ts::
sameJson`, `hog/operator_support.ts::sameCanonical`, the identical fail-false
comparison in `product/environment_definition_bindings.ts`, and repeated
`sameCoordinate(ref,digest)` in Product verification/environment bindings.
Numerous local `hash(unknown as JsonValue)` aliases are call-site aliases, not
necessarily additional algorithms; removing aliases alone is weak evidence.

Contract distinctions must be explicit: admitted I-JSON versus raw `unknown`;
throwing versus false-on-invalid comparison; canonical text equality versus
digest equality; identity/deep-strict short circuits in
`abg/native_work_reacquisition.ts` and `native_worksite_execution.ts`. A
cryptographic digest is not silently substituted for exact byte equality.
`deepFreeze` is not an arbitrary cyclic-object serializer. Domain admission,
key ordering, array order, -0, unsupported objects/accessors and failure
behaviour must survive consolidation.

### L2. Exact structural admission and zero/one/many selection

Generic capability: structurally check a closed shape without semantic repair,
and select from a multiplicity-preserving population with explicit absent,
unique and ambiguous outcomes.

Current mechanisms: `shared/admission_predicates.ts` shallow predicates;
strict Valibot owner schemas; `product/exact_match.ts::resolveExactMatch`.
The latter is currently consumed by `product/implementation_resolution.ts` for
GraphFunction and implementation selection. It already returns `absent`,
`one`, and `many`, preserving duplicate candidates.

Concrete residuals: `shared/definition_binding_mechanics.ts::selectedDefinition`
and `abg/native_work_reacquisition.ts::one` independently filter then require
one result; local key-set checks persist in `product/workspace_operations.ts`,
`validator/validation.ts`, `shared/rooted_topology_partition.ts`, and
`shared/operation_definition_coordinate.ts`.

Selection mechanics can be shared with owner-specific mapping of zero/many to
their lawful refusal. Equal-looking values must not be deduplicated before
cardinality is established. The shared shallow predicates explicitly preserve
legacy NUL-joined key comparisons; these are **not** exact key-set equivalence.
Replacing them with elementwise exact checking changes the accepted raw-input
domain and therefore needs an explicit owner design decision and affected
proof, not a mechanical rename.

### L3. Module-static typed binding and effect composition

Generic capability: close one imported typed owner function over its fixed
packet and exact structural contracts, preserve its result union, and lift
physical faults through the existing typed execution ABI.

Canonical mechanisms: `shared/static_definition_bindings.ts::bindStaticOwner`,
`bindExactPrefixRead`, `bindExactPrefixTransition`; contract checking in
`definition_binding_mechanics.ts`; `effect_definition.ts` carriers and outer
runner. Consumers include `abg/project_read_definition_bindings.ts`,
`abg/witness_definition_bindings.ts`, `product/project_read_definition_bindings.ts`
and `owner_bindings/run_invocation.ts`.

This is already a reusable library asset. Constitution §5.6.2C permits exactly
these three binding combinators, with exact non-erased resources and receipts.
The new library must not add a fourth generic mode, callback registry, universal
resource union, provider controller or per-definition interpreter.

Product install/environment/catalog binding bodies still contain their exact
owner compositions, resource validation and fault/receipt shaping. Their
presence is not itself duplication: compare structural shells against L3,
then retain Product policy, physical effect order and ABG admission in their
declared owners. Shared binding does not make physical install and ABG admission
one atomic effect.

### L4. Typed immutable graph construction and structural partition

Generic capability: construct and validate the admitted composition, preserve
typed interfaces/cardinality, materialize declared structure, and partition
two exact rooted paths into preserved/exited/entered relations.

Current owner capabilities: `gtl/c_algebra.ts` seven constructors exposed as
`C` and `workflow.C`; `gtl/materialize.ts::deriveMaterializedGraphShape`,
`materializeGraph`, and rehydration; `gtl/source_path.ts` source-path witnesses.
Common structural computation:
`shared/rooted_topology_partition.ts::deriveCanonicalRootedTopologyPartition`.
Actual ABG retry callers occur in `abg/retry.ts`; GTL source-path code produces
the witness types.

This partition is reusable across admitted same-topology, same-basis rooted
paths. It already rejects invalid shape, mismatched basis/root/topology and
inconsistent adjacency; exits are inner-to-outer, entries outer-to-inner.
Witness production, retry meaning, event construction and admission remain
GTL/ABG-owned. Neither a renamed endpoint nor a new workflow feature justifies
another path-difference algorithm. General DAG traversal, graph rewriting or
arbitrary tree edit is not established by this narrower path contract.

### L5. One operational fold over exact owner capabilities

Generic mechanics: typed sequential lifting, stack-safe iteration, fault
propagation and resource cleanup. Foundation: existing Effect. Domain
capability: `hog/graph_execute.ts::evaluateTraversalProgram`,
`executeOwnedGraphTraversalEffect`; direct decisions in `hog/traversal.ts`;
typed owners in `ccall_lifecycle.ts`, `workflow_lifecycle.ts`,
`retry_lifecycle.ts`, `recursion_lifecycle.ts`, and structural transition.

`owner_bindings/run_invocation.ts` imports the Effect-native traversal entry and
uses it for invoke/continuation. `evaluateTraversalProgram` operates through
one `Effect.iterate` fold. Leaf, retry, child and parent work reuse this basis;
they are not permission to create per-feature coordinators.

The library design should expose composition obligations through those existing
interfaces, rather than duplicate a `runPipeline` helper above them. The
constitution requires the complete transitive control/effect graph to correspond
to the admitted algebra. This assessment located the operative fold and
representative consumers, but did not prove complete reachable-path singularity.
Pure owner atoms need not be rewritten merely to return Effect.

### L6. Exact-prefix history, incremental derivation and projection

Generic subproblem: reuse an established immutable-prefix computation only
while its support relation remains valid, advance by suffix, and lazily obtain
large bodies. Existing ABG-owned library: `runtime_history.ts` (`RuntimeHistory`,
`RuntimeHistorySelection`, `RuntimeEventBodyView`); `runtime_derivation.ts`
(`RuntimeDerivationSource`, `RuntimeDerivationScope`); `event_prefix.ts`
(`runtimePrefixComputation`, indexed selectors, owned/exact prefix selection).

Actual consumers include `event_calculus.ts::deriveRuntimeEventCalculusProjection`,
`replay.ts` owner facts, `artifact_truth.ts::RuntimeArtifactFacts` and
`environment_admission.ts`. Each supplies its own relation/owner key and
interprets its own facts. Shared mechanics do not invent a generic event
reducer with admission authority.

The scope reuses only established same-owner prefix relations; it distinguishes
historical selection from live advance, invalidates on abandoned territories,
and is reconstructible. `event_body_encoding.ts::encodeEventBody`/`decodeEventBody`
provide shared inline/reference body mechanics under the event-store owner.
Discarding these structures because they are state-shaped would remove lawful
derived computation. Conversely, an ambient cache keyed only by a convenient
digest could erase currentness, occurrence or support-lifetime distinctions.

Consolidation preserves exact prefix identity, profile/source law, typed body
coordinates, cold reconstruction, rollback invalidation and bounded retention.
A new library-wide cache or persisted projection is not selected.

### L7. Owner-scoped expected-prefix transition and durable resource lifecycle

Canonical capabilities remain ABG-owned:
`event_store.ts::admitRuntimeEventTransactionAtExpectedPrefix`,
`admitRuntimeEventTransactionAtDurablePrefix`, `reopenEventStore`,
`selectHeldEventStoreDurablePrefix` and physical append/digest continuation;
`definition_event_resource.ts::acquireAbgEventResource`,
`selectAcquiredAbgEventResource`, `completeAbgEventResource`,
`closeAbgEventResource`, `abandonAbgEventResource`, recovery.

Install, environment and run bindings consume these exact capabilities.
Held-resource selection and serialized reopen share the owner domain but
remain distinct lifecycle cases: a copied selection does not acquire the
resource, held completion does not close it, and only its physical finalizer
produces the close/reopen handoff.

Reuse eliminates per-feature transaction/lock/reopen inventions. It must
preserve predecessor mismatch refusal, semantic commit units, suffix durability,
poisoned/interrupted states, physical resource identity and actual close
evidence. Effect Scope supplies mechanical finalization where used; it cannot
pretend a failed admission rolled back an already performed external effect.

### L8. Exact-source resolution, declaration closure and immutable load

Reusable owner capabilities:
`product/declaration_closure.ts::resolveExecutionDeclarationClosure`,
`resolveProgramDeclarationClosure`, `selectExactClosureContract`,
`reconstructHistoricalDeclarationCatalog`;
`product/execution_resolution.ts`;
`product/implementation_resolution.ts`;
installed definition call loading through `public/installed_public_definition_call.ts`.

Representative consumers of declaration closure include current execution
resolution, `abg/project_read_ports.ts` historical result reads,
`abg/invocation_execution_truth.ts`, and `abg/qualification_proof.ts`.
Exact publication/contract/implementation selection should reuse these
relations rather than rebuild feature-specific closure maps.

Candidate contraction concerns generic finite dependency closure, exact match,
canonical coordinate checks and verified source retrieval. Admission of the
specific Product/GTL publication, historical dependency validity, executable
module loading and authorization are irreducible owner relations. No new
catalog or source-discovery fallback is allowed. Current source-method pinning
does not supply a Run's method binding.

### L9. Content inventory, verification and authorized physical materialization

Current Product capabilities include `verify_product.ts::verifyProduct`,
`install_product.ts::installProductInResolvedLock`,
`installedProductContentMatches`, `workspace_operations.ts::createWorkspace`/
`openWorkspace`, and `materialization_operations.ts::materializeContextBootstrap`/
`materializeConfiguration`. They share Node fs, canonical digest and exact
carriers rather than an active April delivery-library implementation.

Factor candidate: safe path traversal, byte capture, inventory ordering, exact
preimage comparison, collision refusal, staged write and post-effect manifest
production. Existing owner-specific plans/effects remain the first consumers.
Do not make one invented filesystem framework a prerequisite for all features.

Two superficially similar inventories are materially different:
`install_product.ts` hashes declared Product payload locators into
`payloadInventoryDigest`; `implementation/worksite_command_execution.ts::
installedProductInventoryDigest` observes an execution root's files,
directories, symlinks, inode/link identities and byte content. They cannot be
collapsed into a single digest contract. Reusable traversal mechanics may serve
both only while policy, admitted node kinds, ordering and identity projection
remain explicit.

Archive verification currently has a regular-ustar parser and tar-based read
mechanics in `verify_product.ts`. Replacing that material parser needs a
proportional foundation comparison and exact archive-domain proof; this report
does not select a library or assert parser completeness.

### L10. Native process lifetime and effect observation

Recurring mechanical capability: launch an owned process, observe output,
enforce declared limits, request TERM then KILL when necessary, establish
process/group termination, and return evidence including uncertainty.

Present mechanisms: `abg/worker_transport.ts::runProcess`,
`prepareWorkerTransport`, `runPreparedWorkerTransport`;
`abg/actor_process.ts::prepareActorProcessInvocation`, `invokeActorProcess`,
`validateActorProcessCarrierPair`; command and HTTP-probe paths in
`implementation/worksite_command_helper.ts` also perform process cleanup.
These are concrete candidates for a common **mechanical** process lifetime
capability after scope/equivalence review.

Protocol parsing, actor identity, worker result authority, effect authorization,
ABG liveness/probe events and command/probe meaning remain distinct. POSIX group
absence and Windows child-process completion cannot be merged into a weaker
universal Boolean. Timeout, signal request, launcher close and confirmed
termination differ. Interrupted/unknown completion cannot produce fictitious
rollback or successful observations.

The older memory warning about HTTP cleanup was used only as a source-routing
hint; live code was reacquired. This assessment does not issue a source repair
or claim that all current process-tail paths have been qualified.

### L11. Leaf preparation, exchange authentication and evidence construction

Current coherent contract family:
`implementation/contracts.ts` (`LeafExecutionOccurrence`,
`PreparedProbabilisticLeafInvocation`, `LeafRealizationCandidate` and typed
owner receipts); `implementation/leaf_invocation_port.ts`;
`abg/instruction_assembly.ts`; actor process and result admission owners.

Representative concrete consumers:
`implementation/native_workspace_work.ts::realizeNativeWorkspaceWork`,
`worksite_construction.ts::realizeWorksiteConstructionCandidate`,
`semantic_stage.ts`, and `default_library.ts::selectGovernanceWork`.
All prepare an exact request and later complete from the actual exchange.
Mechanical candidate packing and deterministic evidence hashing recur.

One common implementation contract can reduce repeated envelope shaping,
exchange-coordinate checks and typed fault plumbing, composed with static
owner functions. Domain evaluation must remain owner-specific. Native workspace
work reobserves the worksite even after timeout/malformed result, whereas framed
selection requires zero tool calls and an exact bound choice. A generic
successful-transport-to-successful-result function would lose obligations.
F_P candidate output is never evidence of its own admission or adequacy.

### L12. Residual owner relations and application-level compositions

The common capability library does not replace the default GTL governance
library. `gtl/default_library.ts`, `product/default_library.ts`,
`abg/default_library.ts` and Implementation adapters express declared
selection, preparation, foldback and assessment under the existing owners.
Their workflows should be decomposed into L1-L11 and declared semantic
remainder, not relabelled as twelve independent runtime services.

Required remainders include GTL meaning/interface law; whole-Program Validator
decisions; Product publication/install/binding validity; HoG traversal choice;
ABG admission/currentness/continuation and Event Calculus; F_P judgment; F_H
authority; release acceptance. A reused foundation may realize an explicitly
assigned role without becoming its owner. The new design must explain each
retained semantic relation, not use “domain-specific” as an exemption from
factoring its generic mechanics.

## Representative complete consumer decompositions

These are actual source routes to ground the proposed library. They are design
decompositions, not newly executed traces.

1. **Installed run invocation:** exact Public carrier/loaded binding →
   `owner_bindings/run_invocation.ts` fixed contract and event-resource basis →
   Product execution resolution/declaration closure → ABG invocation/execution
   admission → `executeOwnedGraphTraversalEffect` → typed leaf/child/structural
   owner ports → ABG result/closure admissions → Event Calculus/replay →
   exact resource receipt/outer host projection. L1/L2/L3/L5/L6/L7/L8/L11
   supply common capabilities; feature/graph meaning remains declared.
2. **Product installation:** `product/install_definition_bindings.ts` fixed
   request/resource validation → acquire/reuse event resource →
   `ProductInstallPort.installInResolvedLock` →
   `installProductInResolvedLock` physical verification/materialization →
   `admitProductInstallInResolvedLock` → exact-prefix artifact projection →
   completion receipt. L1/L2/L3/L7/L9 apply. Physical success followed by ABG
   coordinate refusal is an explicit possible outcome, not an impossible
   transaction branch to erase.
3. **Native workspace work:** leaf authority and instruction assembly →
   pre-work observation comparison → prepared worker request → actor/transport
   execution → mandatory post-work observation → owner result/independence/
   scope assessment → candidate → ABG admission/replay. L1/L2/L6/L10/L11
   apply. Unknown post-state, partial effects and preserved authorized work
   survive transport failure.
4. **Retry/continuation:** exact prefix and admitted execution basis →
   GTL source/target path witnesses → shared rooted partition → ABG retry
   candidate and expected-prefix admission → same HoG fold re-entry →
   subsequent exact-prefix projection. L1/L2/L4/L5/L6/L7 apply. A retained
   producer may remain valid when consumer preparation fails; reuse depends
   on exact support/currentness and cannot substitute another occurrence.

These decompositions establish why the asset is a library of common
capabilities, rather than a taxonomy of names. Each feature consumes a common
mechanism through an exact contract; dependent realization must show which
bespoke mechanism is removed or which future duplication is prohibited.

## Contraction, refusal, reuse and measurement obligations

Before realization of each selected family, the Writer's design should fix:

- admitted domain and total input/result/refusal/fault/nonperformance cases;
- canonical mechanism/owner port and its exact consumer set;
- what becomes a typed parameter or closed variant, what is composition,
  what is a genuinely irreducible owner relation, and the rejected duplicates;
- identity, authority, ordering, effect, prefix and evidence conservation,
  including invalid inputs and zero prohibited effects;
- where physical execution can have happened without durable admission,
  retained obligations after partial completion, and lawful recovery;
- support/lifetime for reuse: immutable definitions, exact-prefix derivation,
  physical possession and observation, candidate-specific evidence and
  historical results are different reuse relations;
- the existing foundation decision or a new bounded comparison with explicit
  material unknowns; no presumption that local construction is best;
- the before/after complete consumer path and finite reproof selection.

Contraction evidence is the reduction of independently maintained algorithms,
semantic switches, wrappers and failure paths while preserving meaning. Count
source lines only as a diagnostic. A smaller file, moved helper or new generic
dispatcher is not contraction proof. A widespread library change may increase
proof fan-out; that cost belongs in the decision.

Computational evidence should name units and boundaries: bytes hashed/read/
written, body decodes/materializations, inspected event envelopes and relevant
selector extent, prefix suffix size, retained object/body bytes and peak live
memory, native process/resource acquisitions, call count, wall/CPU time, and
temporary/install footprint where material. Measure complete producer-to-
consumer paths under warm/held and cold/reopen regimes; compare relevant and
unrelated history growth separately. Do not introduce a universal time quota,
read multiplier or all-helper cleanup gate.

Design acceptance discharges the design relation only. Behavioral equivalence,
fresh-process reconstruction, actual effect/capacity outcomes, exact installed
dependency closure and release qualification need execution and assessment on
their own bound subjects.

## Recommended design disposition

The following decisions are ready to carry into the design, rather than being
hidden in a general future source audit:

| Relation | Disposition |
|---|---|
| Canonical encoding/hash | Reuse the existing writer/hash family. Admit exact equality as a separate contract; do not substitute digest equality or broad unknown-object equality. |
| Coordinate equality | Contract identical ref-and-digest checks into one exact value relation, while owner identity/provenance checks remain distinct. |
| Key-set admission | Preserve the distinction between exact elementwise keys and legacy NUL-joined variants. Changing the accepted input set is an owning contract change, not deduplication. |
| Exact selection | Reuse multiplicity-preserving zero/one/many mechanics; owner refusal mapping stays local and no first-match/dedup fallback is permitted. |
| Static binding | Reuse the three admitted combinators and exact generic resources/receipts. No fourth binding mode or dynamic registry. |
| Prefix computation | Retain the shared ABG prefix/suffix derivation mechanism with exact support, invalidation and cold-rebuild law; reject an ambient library-wide cache. |
| Inventories | Preserve Product payload content and physical execution-root observation as distinct projections. Only their lawfully equivalent traversal/hash mechanics may contract. |
| Installation | Preserve physical materialization, ABG admission and resulting receipt as distinct ordered boundaries, including physical success followed by admission refusal. |
| Native lifecycle | Design one reusable mechanical process-lifetime contract with explicit platform and uncertainty cases; protocol, actor, effect and ABG interpretation remain separate compositions. |
| Leaf result | Share structural preparation/authentication/evidence mechanics; retain owner assessment, post-effect observation and independent-evaluator obligations. |

Select one coherent library design first. It should retain the concrete
capabilities above, contract materially equivalent variants, state how new
requirements reuse the basis, and establish a finite realization sequence.
Start implementation only after the affected common contracts are decided.

Low-risk structural opportunity and high-value whole-path opportunity are
different prioritization inputs: exact coordinate/structural utilities give
bounded contraction; native process lifetime and prefix/body/reuse paths can
remove much greater duplicated lifecycle/computational cost but require
stronger ownership and effect evidence. The Executive should choose one
complete consumer discriminator after design acceptance, not demand that all
264 source files be refactored before the next installed lifecycle.

The library design may describe full intended coverage while leaving new
material algorithms/foundation choices explicitly unresolved. It must not
claim the complete candidate semantic family Prime based on this function
inventory. Identities, lifecycle, topology, authority, effect, closure and
composition relations must enter the same bounded whole-family review.

Worker returns this report to the root Executive. No Reviewer is activated by
this Worker and no source implementation is changed.
