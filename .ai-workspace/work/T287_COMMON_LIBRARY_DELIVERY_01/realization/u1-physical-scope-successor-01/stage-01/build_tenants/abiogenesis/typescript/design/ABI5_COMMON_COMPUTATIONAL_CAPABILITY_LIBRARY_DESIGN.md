# ABIogenesis 5 Common Computational Capability Library

**Status:** candidate library design for independent assessment. It selects reusable contracts, ownership, composition and bounded consolidation decisions. It does not establish implementation conformance, measured savings, installed outcomes, qualification or release.

**Selection:** the owner's 2026-10-21 clarification makes this library design the first ABG activity. The intended asset is a common computational basis from which features are composed, reducing independent solutions to equivalent computational problems. Explicit obligations determine what execution must establish; execution determines the actual outcomes.

**Basis:** [activation](../../../../.ai-workspace/work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/activation.md), [source inventory](../../../../.ai-workspace/work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/basis.json), SHA-256 `7c4196afaf481be05056a5c3b5120b98b9e4d012ccf2b673f765076b3ec23376`; HEAD `727f1dbcab3c198f7704735fdf91b994b7aac243` plus the inventoried dirty bytes. The [Product assessment](../../../../.ai-workspace/work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/product-assessment.md) and [realization assessment](../../../../.ai-workspace/work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/realization-assessment.md) are separate source-evidence inputs conjoined by the Executive. The latter searched 264 TypeScript sources and inspected the named consumer bodies; it is not a complete semantic clone or dynamic-path audit.

**Authority:** [Product](../../../../specification/PRODUCT.md), [requirements](../../../../specification/requirements/README.md), the [project frame](ABI5_PROJECT_REFERENCE_FRAME_BASIS.md), [realization constitution](ABI5_REALIZATION_CONSTITUTION.md) and [computational binding](ABI5_STDO3_COMPUTATIONAL_BINDING.md). The exact method is `stdo://releases/v3.0.0-rc.1/`, manifest `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`, including [DESIGN_MODULE](stdo://releases/v3.0.0-rc.1/standards/DESIGN_MODULE.md), [SPEC_METHOD §11](stdo://releases/v3.0.0-rc.1/standards/SPEC_METHOD.md#11-build-tenant-binding) and [FOUNDATIONS](stdo://releases/v3.0.0-rc.1/standards/FOUNDATIONS.md). No companion or moving methodology source is selected.

## 1. Selected asset and Product boundary

The common library consists of the canonical mechanics, reusable owner ports and static compositions specified below. Existing modules remain its implementation locations. Direct typed imports are the consumption mechanism. No new root barrel, package export, runtime catalog, dispatcher, resource framework or `runPipeline` is selected merely to give the library one name.

The design covers the intended common capability basis across all fifteen selected Product families. The present installation, preparation, history and continuation path is an initial consumer and proof discriminator, not the boundary of the library. The [Product compression allocation](../../../../specification/PRODUCT.md#50-compression-boundary) remains: applicable identity, authority, currentness, replay and fresh-process defects are 5.0 work; further equivalent pure-helper contraction may be realized in 5.1. This design is undertaken now; an all-helper refactor is not a new release gate.

The following decisions are selected:

1. One admitted computational relation is reused across equivalent instances. A feature name or Public definition key does not justify another algorithm.
2. Canonical bytes, exact coordinate equality, finite selection and closed structural mechanics have canonical implementations. Owner predicates and result interpretation remain explicit.
3. Product declaration resolution, GTL construction, HoG traversal, ABG event resources/history and native effect owners remain reusable libraries in their existing domains. Their semantic relations are not reimplemented inside a generic helper.
4. Existing Effect 3.22.1, exact owner schemas and Node mechanics remain the admitted foundation composition. No material new dependency is selected.
5. The finite consolidation ledger in §6 distinguishes equivalent mechanics, existing compositions, intentionally different contracts and proposed additions awaiting a material design decision.
6. Each retained implementation increment must name its consumer replacements and complete affected path. Moving code or counting fewer functions does not establish reduced proliferation.

The [published default governance/lifecycle library](T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md) remains ordinary declared GTL GraphFunctions and Programs. Its Executive, induction, design, testing and UAT roles use this lower realization library through GTL/HoG/Product/ABG owners. They do not become low-level library primitives. Likewise [capability_contracts.ts](../code/src/shared/capability_contracts.ts) describes existing public definition capabilities; this document's capability identifiers are design coordinates, not additional DS1 capability rows or callable exports.

## 2. Library organization and dependency direction

| Library portion | Canonical locations and direct dependencies | Consumers and retained meaning |
|---|---|---|
| Value and finite-structure mechanics | [canonical_json.ts](../code/src/shared/canonical_json.ts), [digests.ts](../code/src/shared/digests.ts), [immutable.ts](../code/src/shared/immutable.ts), [i_json.ts](../code/src/shared/i_json.ts), [admission_predicates.ts](../code/src/shared/admission_predicates.ts), [references.ts](../code/src/shared/references.ts), [exact_match.ts](../code/src/product/exact_match.ts), [rooted_topology_partition.ts](../code/src/shared/rooted_topology_partition.ts). Native arrays/maps/strings and Node crypto; I-JSON text uses existing jsonc-parser. | GTL, Validator, Product, HoG, ABG and Implementation import exact functions. Mechanics do not select semantic preimages, evidence, topology targets or grants. The historical placement of `exact_match.ts` under Product does not give its generic selection algorithm Product admission authority. |
| Static contract and execution membrane | [public_function_contracts.ts](../code/src/shared/public_function_contracts.ts), [definition_binding_mechanics.ts](../code/src/shared/definition_binding_mechanics.ts), [static_definition_bindings.ts](../code/src/shared/static_definition_bindings.ts), [effect_definition.ts](../code/src/shared/effect_definition.ts). Exact owner types/schemas, Valibot, Effect subpaths and the ABG resource-receipt checks explicitly imported by the prefix binders. | Module-static definition bindings consume one fixed packet and one imported owner. Resource types remain concrete generics. This is an explicit boundary composition, not a reason for foundational value modules to import Public or ABG behavior. |
| Reusable semantic-owner capabilities | Product declaration/install/environment ports; GTL constructor/materialization/source-path ports; ABG event resource, exact-prefix, history, Event Calculus and projection ports; Implementation request/effect ports. §3 names their precise contracts. | Callers reuse owner relations. Common mechanics may implement a role, but the declaring owner retains identity, admission, refusal, effect ordering, lifetime and closure meaning. |
| Executable composition | [graph_execute.ts](../code/src/hog/graph_execute.ts), [traversal.ts](../code/src/hog/traversal.ts), existing leaf/child/retry owner ports and [run_invocation.ts](../code/src/owner_bindings/run_invocation.ts). | The admitted GTL Program supplies topology; HoG directly executes it with the existing Effect fold. Public/SDK/CLI invoke and project the result. No feature controller or second execution plan is introduced. |

There are 18 existing shared modules on the assessment basis; that fact locates current code, not the required module count. Pure mechanical functions remain cohesive with their actual domain. Owner-local compositions need not move to `shared/`. The April [common realization derivation](ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md) and [common delivery derivation](ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md) are design lineage: their `shared/abg_library`, `shared/delivery`, `app/m04/control` and directory `abg/m03/transport` implementations are absent from this basis. They do not select a replacement layout or restore M04 control.

### Domain scaffold

```mermaid
classDiagram
  class OwnerContract {
    exact input and result domain
    authority and refusal law
  }
  class ValueMechanics {
    encode hash inspect select partition
  }
  class StaticBinding {
    fixed packet
    exact resources and receipts
  }
  class OwnerCapability {
    declared semantic relation
  }
  class GTLProgram {
    admitted graph and C composition
  }
  class HoGTraversal {
    direct traversal
  }
  class ABGHistory {
    admitted causal events
  }
  class DerivedProjection {
    exact prefix support
  }
  StaticBinding --> OwnerContract : imports
  StaticBinding --> OwnerCapability : calls once
  OwnerCapability --> ValueMechanics : composes
  HoGTraversal --> GTLProgram : traverses
  HoGTraversal --> OwnerCapability : invokes declared port
  OwnerCapability --> ABGHistory : only through ABG admission
  DerivedProjection --> ABGHistory : reconstructs
  OwnerCapability --> DerivedProjection : reads explicit support
```

These are design roles, not proposed classes or runtime identities. The domain carriers and identities remain those in [binding §3](ABI5_STDO3_COMPUTATIONAL_BINDING.md#3-ontology-and-carrier-projection). No library entry owns a new lifecycle. A pure value is constructed/read/discarded; a derived projection is recomputed or invalidated; a physical resource is acquired/completed/closed or abandoned by its existing owner. Immutable Product coordinates, mutable worksite state, observations, proposed effects and admitted runtime truth remain distinct.

## 3. Closed capability contracts

`K01`–`K12` are review coordinates. They classify concrete functions and compositions; they are not twelve new atoms, services or runtime operations. Source-owned type declarations are imported, not redeclared as a universal result/resource union. “Pure” below excludes physical I/O and semantic admission; allocation and explicitly stated freezing or sink writes still occur.

### K01 — Closed value and structural admission

**Mechanisms:** [i_json.ts](../code/src/shared/i_json.ts), [admission_predicates.ts](../code/src/shared/admission_predicates.ts), exact owner Valibot schemas and GTL [raw_admission.ts](../code/src/validator/raw_admission.ts).

`admitIJsonText(string) → IJsonValue` or `IJsonAdmissionError`; `admitIJsonValue(unknown) → IJsonValue` on its inspected finite ordinary-value domain, or the same typed error. The seven declared error codes are duplicate key, invalid framing, invalid Unicode scalar, malformed JSON, non-finite number, non-I-JSON value and unsafe integral number. Text admission retains duplicate-key detection; value admission constructs detached ordinary dense arrays/records and normalizes negative zero. Arbitrary cyclic/proxy/host-object behavior is outside the established totality claim; a stack/inspection fault is not a fabricated typed refusal.

`isRecord` and its JsonValue variants check only shallow non-null non-array shape. Their type refinements do not validate members. `hasExactKeys`/`hasExactJsonKeys` compare actual and expected keys elementwise with equal lengths. The NUL-joined variants retain a different historical relation: `["a","b"]` and `["a\u0000b"]` collide when joined. They are not exact key-set checks even where a caller aliases the function as `hasExactKeys`.

All operations retain exact input-domain and failure behavior. Strict owner schemas decide concrete carrier shape; raw GTL admission, TypeScript local typing, complete Program validation and semantic judgment remain different evaluations. Resource work is proportional to inspected text/value/keys; no ambient cache, default field or semantic repair is introduced.

### K02 — Canonical bytes, digest and named equality

**Mechanisms:** [canonical_json.ts](../code/src/shared/canonical_json.ts), [digests.ts](../code/src/shared/digests.ts) and the existing `sameJson`/`sameCoordinate` in [definition_binding_mechanics.ts](../code/src/shared/definition_binding_mechanics.ts).

On a finite acyclic admitted JSON value, `canonicalJson(value) → string`; `writeCanonicalJson(value, synchronousSink) → void` emits the same ordered text chunks; `sha256Canonical(value) → Sha256Digest` hashes that stream. Preserve Unicode code-unit key ordering, array order, finite-number handling and `-0 → 0`. The stricter common I-JSON path excludes sparse arrays. Existing canonical-writer sparse-array behavior is historical source behavior, not a new valid-JSON guarantee or permission to silently change an existing caller's accepted domain.

The sink is an explicit synchronous output effect. A sink or encoding exception propagates and may follow partial output; it is not a successful complete encoding. `sha256Bytes` hashes exactly its input bytes; `sha256File` performs a physical file read and can reject. Owners choose all preimages and coordinate meanings. A digest does not authenticate a publication, install or event.

Three equalities stay separate: exact canonical text comparison (`sameJson`, false when encoding throws); exact `ReferenceDigest` pair comparison (`ref === ref && digest === digest`); and canonical-digest comparison (`hog/operator_support.ts::sameCanonical`). The latter is not exact byte equality. Identity/deep-strict shortcuts in native reacquisition remain separate owner contracts. No global “equal” operator is selected. Streaming avoids a required whole-text intermediate for hashing; actual retained memory and whole-path benefit require measurement.

### K03 — Capturing and preserving immutable values

**Mechanisms:** [immutable.ts](../code/src/shared/immutable.ts), K01 construction and existing typed owner constructors.

`deepFreeze<T>(value) → Readonly<T>` mutates the reachable, not-already-frozen ordinary object graph in place and returns the original reference. It neither detaches caller aliases nor authenticates/adopts a value; it returns early for an already-frozen object and therefore does not establish recursive immutability of every input. `isDeeplyFrozen(unknown) → boolean` inspects ordinary data-descriptor object/array graphs with a visited set, rejects unsuitable prototypes/accessors and checks nested frozen state. It is inspection, not admission.

A caller requiring detached admitted I-JSON composes K01's copying construction and freezing. An event owner requiring a captured event uses its own [captureRuntimeEventCandidate](../code/src/abg/event_body_encoding.ts), then owner validation/admission. These are distinct contracts, not overloads of “immutable.” No general clone/cache/branding framework is added. The lifetime is that of the owning value; alias mutation, already-frozen shells, cycles and unsupported object kinds are explicit preservation cases when changing a consumer.

### K04 — Multiplicity-preserving finite selection

**Mechanism:** [exact_match.ts](../code/src/product/exact_match.ts)::`resolveExactMatch<T>(readonly T[], predicate) → ExactMatch<T>`.

The closed result is `absent | one(value) | many(values)`. On a finite sequence and total deterministic owner predicate, preserve order, every matching occurrence and candidate identity. Duplicate equal-looking values remain `many`; there is no deduplication, default or first-match authority. A throwing predicate throws; it is not an `absent` result. The result wrappers/multiple-value array are frozen, not the candidate values.

The owner maps this result to its exact output/refusal contract. For example `many → ambiguous`, or `absent | many → null`, are named local projections after multiplicity is decided. Declaration closure additionally distinguishes no matching declaration from a matching declaration outside reachable dependencies; K04 cannot erase that distinction. Work is one finite scan plus the materialized matches; the scan retains no state between calls.

### K05 — Static owner binding and typed execution

**Mechanisms:** [static_definition_bindings.ts](../code/src/shared/static_definition_bindings.ts), [definition_binding_mechanics.ts](../code/src/shared/definition_binding_mechanics.ts), [effect_definition.ts](../code/src/shared/effect_definition.ts).

`ExactDefinitionCallable<Packet, Resources, Receipt>` consumes `DefinitionCall<Packet, Resources>` and returns `Effect<DefinitionReturn<Packet, Receipt>, DefinitionExecutionFault<Packet.definitionKey>, never>`. `DefinitionReturn` preserves the exact owner semantic output and resource receipt. Expected semantic refusals remain owner values; structural execution faults and defects/interruption remain their existing channels.

Exactly three module-static constructors are selected: `bindStaticOwner` admits the fixed call/resource contracts, calls its imported owner once and checks output/receipt; `bindExactPrefixRead` additionally requires an exact reopened unchanged prefix; `bindExactPrefixTransition` checks the owner-issued matching same-store successor, including the held-resource completion form. No dynamic function lookup, fourth binding mode, generic workflow, outer transaction, per-key switch or erased `Resources` carrier is added.

Effect supplies typed sequence, stack-safe suspension/iteration and owner-local physical Scope. [runEffectProgram](../code/src/shared/effect_definition.ts) is the existing outer host runner. Scope release is a physical event, not ABG semantic closure. Invalid returned receipts can occur after owner effects; the binder must conserve that fact and cannot imply rollback. Cost includes call/resource checking, one owner call and result checking; expensive acquisition inside the owner is accounted for separately.

### K06 — Admitted construction and rooted-path partition

**Mechanisms:** GTL [c_algebra.ts](../code/src/gtl/c_algebra.ts), [materialize.ts](../code/src/gtl/materialize.ts), [source_path.ts](../code/src/gtl/source_path.ts); common [rooted_topology_partition.ts](../code/src/shared/rooted_topology_partition.ts).

GTL owns its existing typed constructors and materialized-graph contracts. The reusable structural atom here is `deriveCanonicalRootedTopologyPartition(sourceWitness, targetWitness) → CanonicalRootedTopologyPartition | CanonicalRootedTopologyPartitionRefusal`. Its domain is two finite unique canonical root-to-frame paths with one topology, exact basis and root. Output preserves their common prefix, exits inner-to-outer and enters outer-to-inner. Refusal codes are `invalid_witness | topology_mismatch | basis_mismatch | root_mismatch | adjacency_mismatch`.

The function performs no effects, semantic target choice or candidate admission. Work/temporary state is linear in supplied paths. Identity, ancestor exit, descendant entry and lateral movement are covered. Cycles, multiple-parent causal DAG search, cross-basis topology, human response `H → S`, retry policy and HoG next-route choice are not this relation. [retry.ts](../code/src/abg/retry.ts) is an actual consumer; further consumers must first supply the same admitted witness contract. Existing [TV5 obligations](ABI5_REALIZATION_CONSTITUTION.md#108-accepted-implementation-gate-and-remaining-proof-obligations) remain open where not proved.

### K07 — Exact immutable dependency and executable resolution

**Mechanisms:** Product [declaration_closure.ts](../code/src/product/declaration_closure.ts), [execution_resolution.ts](../code/src/product/execution_resolution.ts), [implementation_resolution.ts](../code/src/product/implementation_resolution.ts) and [installed_module.ts](../code/src/product/installed_module.ts).

`resolveExecutionDeclarationClosure(catalog, view, programRef, graphFunctionRef)` and `resolveProgramDeclarationClosure(catalog, view, programRef)` return their distinct resolved closure or `ExecutionDeclarationClosureRefusal`: `absent | ambiguous | catalog_mismatch | missing_dependency | wrong_owner`. `ProductExecutionResolutionPort.resolve` composes exact Product inputs/selection, closure, implementation and semantic binding into the existing resolution result/refusal. Resolution refusal codes and stages remain the source-owned closed unions; physical acquisition failures retain their actual fault boundary.

Catalog/view are pure readiness/narrowing. A view may contain zero or several Programs; an executable resolution selects one exact Program and its lawful membership. Closure reuse is keyed by the actual deeply frozen catalog/view objects plus Program, execution/program scope and requested GraphFunction. Copied or mutable foreign values require their own validation. Installed module preparation is reused only within one physical resolution call per actual install object; it is not a global install/currentness cache.

K01–K04 support the mechanics; publication ownership, dependency reachability, callable membership and executable source provenance remain Product/GTL relations. Changed dependencies invalidate affected results. Consumers include current execution, [historical project reads](../code/src/abg/project_read_ports.ts), invocation truth and qualification; none may build a feature-local closure map with weaker source rules.

### K08 — Authenticated history, selected bodies and derived current state

**Mechanisms:** ABG [runtime_history.ts](../code/src/abg/runtime_history.ts), [runtime_derivation.ts](../code/src/abg/runtime_derivation.ts), [event_prefix.ts](../code/src/abg/event_prefix.ts), [event_calculus.ts](../code/src/abg/event_calculus.ts) and [replay.ts](../code/src/abg/replay.ts).

The existing `RuntimeEventPrefix` union distinguishes validated explicit snapshots, an owner-bound `RuntimeHistorySelection`, and a prospective validation view. Exact owner prefix selection plus scope/index/body selectors returns the declared view or the owner's refusal/exception; `runtimeEventAtPrefix` can return `undefined` for an absent member. A copied coordinate or selection cannot manufacture the owner's authenticity. Explicit current acquisition and a historical prefix read retain different contracts.

`runtimePrefixComputation` and owner derivation scopes reuse an established same-owner computation and advance through the required suffix. Event Calculus owns initiation/termination/inertia; replay and other projections compose those declared facts. Shared iteration/indexing is not an arbitrary caller-supplied reducer or axiom set. Rollback/abandonment invalidation, exact event-contract profile, scope and predecessor relationships remain part of reuse.

Operational history retains envelope/index/scalar/body-location facts; it does not retain every decoded payload as current state. Selected body views are transient and released after the consumer; complete output remains complete when requested. Cold reconstruction must equal the supported warm result. Resource obligations separately count envelopes examined, selector extent, suffix rows, decoded bodies/bytes, retained live facts and recovery work. Repeated entire-history expansion at each call boundary is not justified by using a common function.

### K09 — Expected-prefix transaction and physical event-resource lifetime

**Mechanisms:** [event_store.ts](../code/src/abg/event_store.ts) and [definition_event_resource.ts](../code/src/abg/definition_event_resource.ts).

Reuse `admitRuntimeEventTransactionAtExpectedPrefix`/`admitRuntimeEventTransactionAtDurablePrefix`, durable reopen and held-prefix selection; reuse `acquireAbgEventResource`, `selectAcquiredAbgEventResource`, `completeAbgEventResource`, `closeAbgEventResource`, `abandonAbgEventResource` and declared interrupted recovery. Inputs/outputs remain their exact owner types, including `AbgEventResourceAssertion | AcquiredAbgEventResourceSelection` and `AbgEventResourceReceipt | AbgEventResourceCompletion`.

Admission preserves expected predecessor, declared semantic commit unit, event order, append durability and actual resource identity. A held selection is not serializable acquisition authority. Completing a held operation does not close its enclosing resource; only the physical finalizer produces a close/reopen handoff. Wrong predecessor, foreign resource, unavailable bytes, poisoned/interrupted store, failed append and failed finalization cannot become success through a shared wrapper.

Store locks, descriptors, staged rows and receipts are owned for their declared acquisition scope. ABG transaction atomicity applies to its admitted event batch, not to arbitrary earlier filesystem/native effects. No feature may invent a parallel lock/reopen protocol or write events outside these owners.

### K10 — Reversible physical encoding of admitted event bodies

**Mechanism:** [event_body_encoding.ts](../code/src/abg/event_body_encoding.ts), called by the Event Store.

`encodeEventBody(RuntimeEvent, committedInlineBodies, stagedInlineBodies, ownerReader?) → physical string`; `decodeEventBody(unknown, earlierInlineByEvent, ownerReader?) → {event: unknown, physicallyInline: boolean}` or a validation/read exception. The Event Store still validates the fully restored logical event and stamps. Encoding stages index additions; only committed durable rows establish later reuse eligibility.

The closed slots are `basis_input`, `c_call_result_value` and `native_definition_material`. The first two retain v1 cross-slot body reuse; native material uses the separately typed v2 bundle and cannot alias unrestricted input/result values. A reference names an earlier physically inline source from the same authenticated stream with matching slot compatibility, source event/payload/digest and exact canonical value. Missing/forward/foreign/chained/mixed references refuse. Small bodies remain inline when the reference would cost more.

Logical event identity and public values are unchanged by encoding; physical byte-prefix identity remains distinct. This is storage sharing, not a semantic result cache or permission to omit context. Cold raw/v1/v2 reconstruction, partial durable batches and staged-but-uncommitted reuse are finite proof cases.

### K11 — Exact source/context preparation and leaf exchange

**Mechanisms:** [instruction_assembly.ts](../code/src/abg/instruction_assembly.ts), [execution_basis.ts](../code/src/abg/execution_basis.ts), [Implementation contracts](../code/src/implementation/contracts.ts), [leaf_invocation_port.ts](../code/src/implementation/leaf_invocation_port.ts) and concrete native owner adapters.

Reuse the existing `NativeInstructionAssembly`, `PreparedProbabilisticLeafInvocation`, `LeafExecutionOccurrence` and `LeafRealizationCandidate` contracts. Declared assembly and native semantic/worksite assembly remain distinct owner entrypoints. Explicit assembly refusal causes are `unknown_dependency | unavailable_required_content | stale_basis | unsupported_selection | declared_bound_overflow`; compatibility entrypoints returning `null` or throwing remain their named projections, not universal success/failure conversions.

Within the assembly owner, existing `assemblyIdentity`, `renderInstructionSections` and `finishInstructionAssembly` share canonical bookkeeping after each branch establishes its own selected material. Exact current producer/input, role/frame, declarations, contracts, source provenance/qualification, accessible content, ordering and declared bounds must survive every projection. A locator is not supplied content; a digest is not semantic sufficiency; graph entry input is not necessarily the current input.

Prepared execution is completed from the actual attributed exchange. Worksite work requires post-effect observation even after timeout or malformed output; framed selection has its separate zero-tool-call and exact-choice obligations. Mechanical envelope/digest checks can be reused; owner assessment and required independent evaluation cannot be collapsed into a “successful transport ⇒ accepted result” function. Retention is limited to selected call material and exact reusable immutable definitions, with worksite freshness assessed separately.

### K12 — Authorized physical materialization and process observation

**Mechanisms:** Product [verify_product.ts](../code/src/product/verify_product.ts), [install_product.ts](../code/src/product/install_product.ts), [workspace_operations.ts](../code/src/product/workspace_operations.ts), [materialization_operations.ts](../code/src/product/materialization_operations.ts); ABG [worker_transport.ts](../code/src/abg/worker_transport.ts), [actor_process.ts](../code/src/abg/actor_process.ts) and [worksite_command_helper.ts](../code/src/implementation/worksite_command_helper.ts).

Use the existing closed Product request/candidate/refusal types and `ActorProcessRequest`, `ActorProcessObservation`, `ActorProcessCarrierValidationResult`, `ActorProcessEffectResult`. Input includes the exact declared request, resource/grant and executable/environment basis; output records actual physical observations/candidate, typed refusal or fault. Actor carrier-validation codes remain `invalid_actor_process_request | invalid_actor_process_observation`; effect refusals remain `actor_process_carrier_refused | actor_process_invocation_refused`. These do not exhaust physical completion states: observation fields separately preserve timeout class, exit/close evidence, signal sequence, status and `terminationConfirmed`.

Product payload inventory hashes declared file locators/content. [Execution-root inventory](../code/src/implementation/worksite_command_execution.ts) observes files, directories, symlinks and physical/link identities. They remain distinct contracts. Path traversal/hash mechanics may be shared only after preserving each policy and identity projection. The existing archive parser is retained; a material parser replacement requires new foundation discovery and archive-domain proof.

The recurring process-lifetime contract is fixed at this design level as: one owner-launched process and explicit platform scope + declared deadline/grace/drain bounds + actual observations → termination evidence with uncertainty preserved. Its closed material cases are:

| Case | Required mechanical distinction | Owner consequence |
|---|---|---|
| Launch refused/failed with no established child | Preserve launch evidence; do not invent an exit or process identity. | No completed work result follows; any known residue remains attributable. |
| POSIX owned process group | Launcher exit/pipe close is distinct from evidence that the owned group is absent. | Confirmed termination requires the selected group/exit relation; still assess performed work. |
| Windows owned child | Use the supported child-completion contract and identify its scope. | Do not relabel child completion as POSIX group absence or unproved descendant termination. |
| Absolute/inactivity deadline or cancellation | Preserve the triggering cause, ordered TERM/grace/KILL requests and actual outcomes. | Timeout or a signal request does not prove termination, rollback or nonperformance. |
| Confirmation/drain/probe/observer failure | Return uncertainty and any known exit, output and signal facts; release known local handles/timers as permitted. | Preserve cleanup obligation; withdraw dependent currentness when post-effect state is unknown. |
| Process terminated, output missing/invalid or semantic assessment negative | Preserve termination and output/effect evidence as separate facts. | Reobserve affected worksite; refuse/unresolve result as the existing owner requires. |

This selects one common contract for recurrence comparison. It does **not** yet select a new callable/module or merge the three process loops. Observer timing, protocol parsing, platform evidence, timeout policies and post-observation obligations materially differ. E03 in §9 blocks that extraction until those mappings and the proportional foundation choice close. Existing owner implementations remain the selected realization meanwhile. No Effect scheduler, retry policy or new process authority is created.

## 4. Lawful composition and the calculus

The [eight operator classes](ABI5_REALIZATION_CONSTITUTION.md#561-closed-operator-algebra) remain `select`, `validate`, `derive`, `transition`, `admit`, `traverse`, `project`, `materialize`. They classify roles, not universal exported functions. K04 realizes selection mechanics; K01/K05 support structural validation; K02/K03/K06 support pure derivation; K07/K08/K10 support exact resolution/projection; K09 supports owner transition/admission; K12 supports physical materialization. K11 and executable owner paths compose several classes without acquiring their authorities.

The [seven C constructors](../../../../specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md) remain `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`, `C.batch`, `C.retry`. GTL's graph relations and continuation range remain as declared in [computational binding §4](ABI5_STDO3_COMPUTATIONAL_BINDING.md#4-closed-operation-and-composition-signature). Library reuse does not add an eighth constructor or another traversal algorithm.

The following composition laws apply to every selected consumer:

- **Closure:** the actual producer output, its type/cardinality and basis satisfy the next exact input. A raw candidate cannot replace an admitted Result, and a historical fact cannot replace required current observation.
- **Identity:** a pure identity preserves value and support. Re-encoding equal bytes does not create a new invocation, authority, admission or evaluation.
- **Ordered composition:** equivalent regrouping must preserve data dependencies, result/refusal behavior and every observable effect/admission/resource boundary. It may not commute effects, fold child completion into parent closure or hide partial completion.
- **Higher-order selection:** K04 predicates and K05 owners/contracts are selected statically within declared meaning. Data cannot register another semantic handler or choose an undeclared fallback.
- **Effects and cardinality:** Effect sequential bind/lifting handles execution mechanics. C.batch, graph fan-out/fan-in, retry and recursion retain GTL/HoG/ABG cardinality, ordering, bounds, attempt and parent relations; no generic concurrency or automatic physical retry is inferred.
- **Reuse:** admission/support, material dependency validity and present applicability must all hold. Reusing implementation code is different from reusing a computed value, historical Result, evidence or physical resource. Each uses K03/K07/K08/K09 and its owner invalidators.

The algorithmic account names the concrete scan/encoding/partition/fold or owner-call sequence. The informational account names what its values, refusals, evidence and identity relations mean. The computational account names actual Effect/Node/module execution, effects, storage, lifetime and cost. These three accounts must agree; neither an algebraic signature nor a method result proves execution.

No new categorical functor claim is made. Such a claim would separately require objects/arrows, equality, identity/composition and preservation evidence under FOUNDATIONS. The library's practical obligation is explicit callable/path correspondence and source-linked conservation under the already accepted calculus.

## 5. Foundation selection and cost

The bounded discovery population and exact package/lock hashes are recorded in the [realization assessment](../../../../.ai-workspace/work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/realization-assessment.md#bounded-discovery-and-current-foundations). Its cutoff is this activation's source basis on 2026-10-21. Applicable populations were the current source/dependencies, Node mechanics, accepted constitution ledgers and named predecessor documents; archived donor bodies and fresh external alternatives were not independently searched.

| Capability decision | Selected foundation composition | Alternative and decisive boundary |
|---|---|---|
| K01–K04 finite value/shape/selection mechanics | Existing implementation + native strings/arrays/maps; exact jsonc-parser/Valibot in their admitted roles | A second serializer, duplicate exact-match scan or identical ref/digest comparator adds independently maintained behavior without a new relation. These bounded contractions introduce no material algorithm/dependency choice. Broader unknown-object equality, parser replacement and changed input domains are separate decisions. |
| K05/executable composition | Existing Effect **3.22.1**, fixed owner contracts and one outer runner, under [constitution §10.1.1](ABI5_REALIZATION_CONSTITUTION.md#1011-effect-3221-decision-ledger) | Preserve the accepted comparison against manual wrappers and alternate runtimes. No present-day package-health, size or universal dominance claim is inferred from that historical ledger. New scheduler/state/runtime features fail the current authority boundary. |
| K06 partition | Existing native array/path algorithm and accepted witness/refusal contract, under [§10.3–10.8](ABI5_REALIZATION_CONSTITUTION.md#103-semantic-and-computational-disposition) | General graph search/tree edit has a larger different domain and is not a lawful drop-in replacement. New domains re-enter instead of weakening witness checks. |
| K07–K11 owner computation/resource/representation | Existing owner ports + canonical/selection mechanics + [Node/Effect owner-local resource composition](ABI5_REALIZATION_CONSTITUTION.md#1013-exact-1856-resource-capability-foundation-ledger) | Universal resource carriers, ambient caches, parallel catalogs/event reducers and generic prompt engines add meaning/lifetime surfaces. Preserve exact owner contracts and bounded reconstruction instead. |
| K12 current physical owners | Existing Node filesystem/process composition and source-owned Product/actor contracts | Preserve admitted realization. A new common process-lifetime implementation, archive parser or material inventory algorithm remains subject to proportional discovery, adapter/effect evidence and total cost; current incumbency alone cannot select it. |

No fresh external alternatives were searched because this candidate selects no new material foundation. That residual does not block reuse of already admitted contracts; it blocks new package selection, new dominance claims and any material construction whose frontier could change. E03/E04 identify those proposed additions. A newly acquired applicable candidate that could materially change the choice reopens the affected decision.

Compare integration/deletion cost, authority leakage, package/startup/storage/runtime cost, determinism/failure/recovery, proof fan-out and exit cost. No dependency-count or line-count score substitutes for that comparison. A common module can increase migration and proof cost; actual benefit is established only by removed independent mechanisms plus preserved complete-path behavior.

## 6. Concrete consolidation and separation ledger

These are target design dispositions, not claims that code has already migrated. “Consolidate” uses the existing named mechanism and preserves the listed owner adapter; “retain” names a concrete non-equivalent relation.

| ID | Source recurrence and selected disposition | Exact target and preservation obligation |
|---|---|---|
| D01 | Canonical collected text and streaming digest already share one writer. **Consume** it throughout the named Product/event/context paths. | K02; no second serialization implementation or owner-independent preimage normalizer. Prove same bytes for the affected admitted domain and retain source-specific historical edge behavior. |
| D02 | `environment_definition_bindings.ts::sameJson` duplicates `definition_binding_mechanics.ts::sameJson`; environment and verification bindings duplicate `sameCoordinate`. **Consolidate** those identical functions. | Import the existing K02 functions from the already-used definition-binding module; delete the local implementations. Preserve false-on-encoding-exception and exact ref-plus-digest comparison. `hog/operator_support.ts::sameCanonical` remains digest equality; native identity/deep-strict shortcuts remain distinct. |
| D03 | [execution_resolution.ts](../code/src/product/execution_resolution.ts)::`exact` and [definition_binding_mechanics.ts](../code/src/shared/definition_binding_mechanics.ts)::`selectedDefinition` repeat finite filter/cardinality mechanics. **Consolidate** through K04 with explicit owner projection. | `absent/one/many → absent/one/ambiguous` for Product resolution; `one.value`, otherwise `null`, for definition selection. Retain the actual predicate, candidate sequence and duplicate multiplicity. No new exact-one algorithm or public operation. Existing implementation-resolution consumers remain the reference route. |
| D04 | Rooted-witness and event-codec private exact-key checks use closed unique constant key lists. **Consolidate** their elementwise/set-membership mechanics into existing `hasExactKeys` after proving that constant-domain correspondence. | K01; keep member validation and owner-specific refusal local. NUL-joined callers are **retain-distinct pending E01**, not silently substituted. Exact-list comparison and NUL-delimited equality have different raw-input domains. |
| D05 | `declaration_closure.ts::locateRequired` selects all matching declarations and eligible reachable declarations. **Compose/retain owner decision**, not replace wholesale with generic exact-one. | K04 may decide eligible multiplicity; `all.length === 0 → absent`, otherwise no eligible result → `missing_dependency` stays Product-owned. Dependency closure, source provenance and executable resolution reuse K07. No generic graph/dependency algorithm addition is selected. |
| D06 | Definition bindings, installed run entry and read/transition wrappers share structural admission and receipt checking. **Consume** K05's three binders where their exact domain fits; keep irreducible Product/ABG composition. | Fixed imported owner and concrete contracts; no fourth binder or per-definition interpreter. A custom body is only removed after its physical effects, receipt/currentness and refusal branches have an exact existing-binder correspondence. No blanket “all bindings already converted” claim. |
| D07 | Current/historical event consumers share authenticated selection, suffix derivation and body acquisition. **Consume** K08/K09; retain canonical Event Calculus and owner projection law. | No feature-local entire-history fold, cache or lock protocol with different meaning. Preserve held versus cold, complete versus selected output, rollback/profile invalidation and actual close. Source counts do not prove every consumer already conforms. |
| D08 | Body storage and native instruction assembly both reuse immutable definitions but have different outputs. **Consume** K10 for storage and existing K11 bookkeeping inside its owner; **retain distinct** codec and context selection contracts. | Codec reconstruction restores every logical field. Context projection independently conserves required sources, role qualifications, actual current input and readable content. Body savings cannot justify semantic omission. |
| D09 | `deepFreeze`, I-JSON capture, event capture and immutable closure reuse address different alias/admission/lifetime relations. **Retain distinct, compose explicitly** through K03/K07/K10. | No substitute “immutable<T>” brand or universal cache. Detached value, recursively frozen inspection, owner-authenticated value and current observation remain separate predicates. |
| D10 | Native worker, command and HTTP-probe paths repeat owned process cleanup. **Proposed common contract K12; extraction blocked by E03**. Inventory/parser factoring is **blocked by E04** where a material new algorithm is proposed. | Retain existing owner implementations now. A later selected shared mechanical function must preserve platform scope, observers/effect order, uncertainty and post-work observation; no protocol, result or ABG authority moves into it. |
| D11 | Installation and artifact admission are used by many features. **Reuse their ordered composition**, not a fictitious all-or-nothing common transaction. | [install_definition_bindings.ts](../code/src/product/install_definition_bindings.ts) → `installProductInResolvedLock` → [admitProductInstallInResolvedLock](../code/src/abg/environment_admission.ts) → exact artifact projection/receipt. Physical success may precede admission refusal. Reuse a previously admitted install only under its original identity/support; changing invocation labels cannot create another install truth. |

D02–D04 are concrete small contraction targets, with mechanical equivalence obligations and no new module layout prerequisite. D05–D09/D11 establish the mandatory construction basis for future consumers. D10 names a higher-impact recurrence requiring a stronger decision, not an excuse to add another bespoke solution meanwhile. The Executive allocates accepted contractions under Product's 5.0/5.1 boundary; this document does not activate their implementation.

## 7. Source-to-library-to-outcome paths

These are reconstructible design paths, not executed traces.

| Path | Current source route and common capabilities | Outcome and irreducible remainder |
|---|---|---|
| Exact install and later reuse | [install binding](../code/src/product/install_definition_bindings.ts) → K01/K02/K05 request/resource checks → K09 acquisition → K12 Product verification/install → ABG environment admission → K08 artifact projection → resource receipt. Later K07 resolution consumes the exact valid installed dependency. | Physical installed candidate, admission result and usable resolved install are distinct. An existing same-content install with another occurrence must be lawfully reused or refused under owner rules; it cannot be relabeled to satisfy a new invocation. |
| Installed graph invocation and native work | [run owner](../code/src/owner_bindings/run_invocation.ts) → K05/K09 → K07 exact resolution → ABG invocation admission → [HoG fold](../code/src/hog/graph_execute.ts) → K11 exact current-input preparation → K12 actor/worksite execution → mandatory owner observation/assessment → ABG result admission → K08 current facts → next declared consumer. | Reuses the same value, selection, binding, resource and history mechanisms across producer and consumer. GTL topology, F_D/F_P/F_H authority, actual observed work and independent assessment remain distinct. |
| Retry/continuation | K08 exact current prefix → [GTL source path](../code/src/gtl/source_path.ts) → K06 rooted partition → [ABG retry](../code/src/abg/retry.ts) constructs predecessor-linked progress/route candidates → K09 atomic admission → same HoG traversal → K08 fresh projection. | Reuse the same partition for production and route verification. Target selection, retry allowance, attempt lineage, child/parent meaning and terminal closure remain owner decisions. |

### Sequence view: prepared native work

```mermaid
sequenceDiagram
  participant R as Installed run owner
  participant P as Product preparation and resolution
  participant A as ABG owners
  participant H as HoG
  participant L as Common mechanics
  participant N as Native effect owner
  R->>P: ProductRunInvocationPort.prepare
  P->>L: Canonical identity and finite selection
  P-->>R: Prepared exact Program and execution resolution
  R->>A: admitExactInvocation using prepared resolution
  A-->>R: Admitted invocation and successor
  R->>A: Admit execution basis and open traversal
  A-->>R: Admitted basis and opened scope
  R->>H: executeGraphTraversalEffect with prepared basis
  H->>A: Prepare current call at explicit prefix
  A->>L: Select supported history and encode selected context
  A->>N: Exact prepared request and permitted effects
  N-->>A: Actual exchange and effect observations
  alt Complete admissible result and observation
    A->>A: Admit at expected prefix
    A-->>H: Admitted output and successor
  else Refusal, uncertain effect or admission failure
    A->>A: Preserve known effect and unresolved obligations
    A-->>H: Exact non-success or blocked relation
  end
  H->>A: Read derived next state from admitted history
```

The entry shown is the admitted path: [Product preparation](../code/src/product/run_invocation_operation.ts) resolves the execution selection; the [installed run owner](../code/src/owner_bindings/run_invocation.ts) handles its refusal, calls `admitExactInvocation`, establishes the execution/opened-traversal basis and only then enters HoG. A preparation, admission or opening refusal returns through that owner before traversal, preserving the actual prefix. HoG's later GTL term/source-path resolution is a different operation.

The “common mechanics” participant groups static calls, not a service. A semantic assessment may be required before admission; no library return substitutes for it. Known physical residue and the actual admitted prefix remain distinct even when later output/receipt validation fails. Required unavailable evaluation is a missing result, not a completed negative or indeterminate assessment.

### State view: physical resource and admitted truth

```mermaid
stateDiagram-v2
  [*] --> Prepared
  Prepared --> RefusedBeforeEffect: invalid request or authority
  Prepared --> Acquired: exact resource acquired
  Acquired --> Observed: owner performs and observes
  Acquired --> Uncertain: interrupted or unknown completion
  Observed --> Admitted: expected-prefix admission succeeds
  Observed --> UnadmittedResidue: admission refuses with no new successor
  Observed --> Uncertain: admission outcome unknown
  Uncertain --> RecoveryRequired: preserve known prefix and effect evidence
  UnadmittedResidue --> RecoveryRequired: preserve unchanged prefix and physical residue
  Admitted --> PostAdmissionFailure: receipt or output validation fails
  Admitted --> HeldCompletion: enclosing owner retains resource
  Admitted --> ClosedHandoff: direct physical finalizer succeeds
  Admitted --> PostAdmissionFailure: direct physical finalizer fails
  HeldCompletion --> ClosedHandoff: enclosing finalizer succeeds
  HeldCompletion --> PostAdmissionFailure: receipt or output fails, abandonment or close failure
  ClosedHandoff --> PostAdmissionFailure: later receipt or output validation fails
  PostAdmissionFailure --> RecoveryRequired: conserve admitted successor and physical facts
  ClosedHandoff --> FreshRead: exact reopen and reconstruction
  RecoveryRequired --> Prepared: lawful re-entry on authenticated actual prefix and new evidence
```

This is the combined relation, not a new persisted state machine. Read-only acquisition may complete unchanged without performing a semantic transition. Pure K01–K07 operations do not require ABG lifecycle events. `RefusedBeforeEffect` is valid only when no relevant effect occurred. `UnadmittedResidue` applies only when the attempted admission established no successor; a refusal accompanied by admitted diagnostic events preserves that actual successor.

[Static binders](../code/src/shared/static_definition_bindings.ts) execute the owner before validating receipts and owner output. The run owner's `finish` passes its computed final prefix to [`completeAbgEventResource`](../code/src/abg/definition_event_resource.ts), which either completes a borrowed held resource or calls `closeAbgEventResource`. Receipt/output failure after admission, direct-finalizer failure and later held-finalizer failure therefore preserve the admitted successor. Physical close may itself have occurred before a receipt becomes unavailable or invalid. Recovery conserves those known facts and any unresolved physical state, reacquires the actual admitted prefix when needed, and never infers rollback, successful handoff or permission to repeat native work from a missing receipt.

Cross-view checks bind the same identities, typed handoffs, authority, effect order, current/historical support and resource owner. Whole-family Prime review considers identity, topology, lifecycle, admission, effects and closure as well as functions/carriers. This candidate proposes no new semantic atom; retained common mechanics and owner relations still require review against their declared domains. No global minimality or completed Prime contraction claim follows from the catalog.

## 8. Finite coverage and execution obligations

The finite coverage unit is a selected capability contract × concrete consumer mapping × material case partition. A counterexample in that domain re-enters the shared relation and every affected consumer, rather than authorizing a feature-local fork. New domains require explicit admission; no universal source-wide exhaustiveness is claimed.

| Obligation set | Finite cases and falsifiers |
|---|---|
| V1 values/equality/selection, K01–K04 | Each declared value/refusal variant; missing/extra/NUL-containing keys; unsafe/non-finite numbers; sparse versus admitted dense arrays; already-frozen shell/alias behavior; equal/unequal canonical text and ref/digest pairs; zero/one/multiple/duplicate matches; throwing predicate/sink. Falsifier: changed accepted input set, output byte, multiplicity, failure channel or identity. |
| V2 static composition, K05 | Each of three binders; exact/wrong packet, resource and receipt; unchanged read; same-store successor; held completion; owner success/refusal/fault/interruption; malformed output after effects. Falsifier: second owner call, new fallback/controller, erased resources, changed effect order or lost residue. |
| V3 algebra/structure, K06 and HoG | All seven C constructors and each retained graph relation through its owning proof; partition identity/ancestor/descendant/lateral and all five refusal codes; retry bounds/attempt lineage, child result/foldback, batch partial/unstarted cases. Falsifier: hidden callable constructor, duplicate walker or mismatched source-to-execution edge. Existing proof is reused only on unchanged support. |
| V4 exact resolution, K07 | Empty/multi-Program view and exact execution selection; absent/ambiguous/wrong owner/missing dependency; immutable same-input reuse, copied/mutated input and changed dependency; call-local preparation versus next-call fresh acquisition. Falsifier: catalog presence treated as authority or a stale/foreign closure consumed. |
| V5 history/resource/codec, K08–K10 | Held/warm versus copied/cold; current versus historical; relevant versus unrelated history growth; exact/scope-crossed/profile-changed prefix; committed/prospective/rolled-back state; selected versus complete bodies; raw/v1/v2; inline/reference including missing/forward/foreign/chained/mixed references; close/abandon/poison/failed append. Falsifier: different logical truth, missing full output, retained unbounded decoded history or reused invalid support. |
| V6 context/effect, K11–K12 | Current producer input versus entry input; available/missing/stale/over-bound required content; role/source qualifications; native success/invalid output/timeout/unavailable actor; POSIX versus Windows evidence; physical success with failed ABG admission; required post-observation unavailable; retained producer with failed consumer preparation. Falsifier: context omission, attributed wrong result, false termination, invented rollback/currentness or unperformed assessment reported as a result. |
| V7 whole path and cost | One selected actual installed producer→consumer path, retained work, close/reopen and fresh read, plus its negative/partial-effect discriminator. Record startup/acquisition counts, bytes read/hashed/encoded/written, decoded bodies, selector/suffix work, live/peak memory, native calls, wall/CPU time and material install/temp footprint. Falsifier: savings only move repeated work to another stage, changed source/basis, or endpoint proof omits the failing boundary. |

V1–V7 are execution/assessment obligations. No tests, builds, native calls or performance measurements were performed for this design activity. The existing [computational binding's evidence boundary](ABI5_STDO3_COMPUTATIONAL_BINDING.md#7-computational-realization-and-whole-path-work) and prior source/component proofs retain their exact subjects. They do not become STDO 3 installed qualification by citation.

For method assessment, declare the predicate and support first. A valid evaluation that proves wrong/missing/crossed submitted basis falsifies admissibility. An attempted evaluation whose own required basis is incoherent is `invalid_basis`; a performed admissible evaluation with insufficient evidence is `indeterminate`; an evaluation not performed because its actor/tool is unavailable has no result. Runtime refusal/transport tags, host exit codes and physical termination do not map globally to method results or Product completion.

### All fifteen Product families

| Family | Library routes | Owner outcome retained |
|---|---|---|
| A5-F01 | K01–K05, K07, K09, K12 | Exact verification/install/workspace and pure readiness catalog. |
| A5-F02 | K01–K04, K06–K07 | Complete retained GTL typing, raw admission, serialization and Program law. |
| A5-F03 | K04–K09, K11–K12 | Every retained graph/C/traversal relation with exact call and parent/child conservation. |
| A5-F04 | K01–K05, K08, K10–K12 | Declared context, actual attributed F_P output and admission integrity. |
| A5-F05 | K01–K05, K07 | One typed Public definition authority and exact derived projections. |
| A5-F06 | K04–K05, K07–K09, K12 | Thin installed SDK/CLI; no adapter continuation controller. |
| A5-F07 | K01–K05, K07–K12 | Distinct One Surface authorities, fresh evidence and admitted consequence. |
| A5-F09 | K01–K05, K07 | Pure catalog readiness/narrowing and exact callable/start membership. |
| A5-F10 | K01–K06, K08–K12 | ABG causal runtime truth, currentness, continuation and closure. |
| A5-F11 | K01–K05, K07–K11 | Authentic independent self-conformance and explicit uncovered obligations. |
| A5-F13 | K01–K05, K07, K09, K12 | Source-blind native operation through the same Public owners. |
| A5-F14 | K01–K12 as traversed | Independently authored installed mechanics/live F_P witness and oracle. |
| A5-F15 | K01–K05, K07–K12 | Exact candidate/law/assessment subject and sole qualification authority. |
| A5-F16 | K01–K05, K07–K09, K12 | Immutable publication, installed-RC proof and actual human acceptance. |
| A5-F17 | K01–K12 as traversed | Original source→working outcome→independent evaluation→consequential correction. |

This routes coverage without claiming every occurrence consolidated or every family qualified. F08/F12, native human response/resume and other [reserved 5.1 behavior](../../../../specification/PRODUCT.md#50-and-51-release-boundaries) are not reintroduced. Full Data Mapper delivery and all seven sandbox workloads are not additional library or 5.0 release gates.

## 9. Remaining decisions and finite realization sequence

The existing-contract architecture, D01–D09/D11 dispositions and obligations above are concrete decisions offered for acceptance. The following additions or contract changes are intentionally not admitted for retained implementation:

| Gap | Exact unresolved decision and dependent stop | Closure evidence |
|---|---|---|
| E01 raw structural-domain change | For each proposed NUL-joined replacement, establish the caller's admitted key domain and whether exact comparison preserves or intentionally changes it. No blanket replacement or proof of equivalence. | Named caller/owner, concrete colliding and noncolliding inputs, owning decision and affected admission/negative-path proof. |
| E02 wider reusable equality/closure/cache extraction | No general unknown-object equality, shared dependency solver, identity shortcut or library-wide cache is selected. Propose one only when an actual additional consumer needs a proved common domain. | Exact domain, equality/support/invalidation/lifetime law, alternative comparison if material, consumer mapping and cold/current counterexamples. Existing K02/K07/K08 contracts remain usable. |
| E03 common process implementation | Decide whether/how one mechanical process-lifetime function can preserve worker observers, command/probe policies, platform scope and uncertainty without moving owner meaning. Its export, placement and algorithm are not yet selected. | Bounded foundation comparison; source correspondence for all proposed consumers; precise input/observation/refusal types; launch, timeout, observer/probe, descendants, drain and post-observation cases. This blocks extraction, not current owner use. |
| E04 filesystem/archive factoring | Decide any proposed new traversal/materialization or archive parser capability against the two inventory domains and real candidate foundations. No generic filesystem framework is selected. | Node-kind/path/link/collision/preimage/partial-write contracts, exact archive domain, foundation/cost comparison and real owner consumer proof. Existing Product ports remain selected. |

Finite delivery order:

1. Independently assess this exact design with Product, computational, foundation, authority/effect and proof frames; the Executive resolves the findings. Design acceptance is the current requested outcome.
2. Select one bounded realization increment and its consumer set. For D02–D04, import existing functions, preserve owner projections and delete only the corresponding equivalent implementations. For K07–K11 path work, bind the exact retained source/evidence and shared-owner correspondence. E01–E04 must close before their affected addition/change is retained.
3. Verify the affected finite contract cases and transitive control/effect graph. Every executable vertex/edge maps to existing GTL/C, static owner, Effect, ABG admission or projection; every required relation has an operative route. Preserve unrelated accepted evidence and dirty bytes.
4. Execute the earliest selected installed producer-to-consumer discriminator, using the existing installation/preparation/history/native/continuation path where authorized. Preserve physical-install/admission partial completion, retained producer identity, required observation and fresh-read results. An integration failure returns the exact causal relation for owner triage; it does not authorize retries or another framework.
5. Measure complete-path work and actual contraction, then independently assess the exact implementation/outcome subject. Reuse sufficient evidence; broader pure compression remains allocated by Product. F11, qualification, the selected lifecycle and release retain their separate remaining gates.

The exit for this activity is an independently dispositioned, source-grounded library design with these obligations and bounded stops. Exhaustive design within a declared domain means every material admitted case has an owner, composition and disposition. It does not mean that a library taxonomy predicts execution, that all source is already consolidated, or that ABG 5.0 is complete.
