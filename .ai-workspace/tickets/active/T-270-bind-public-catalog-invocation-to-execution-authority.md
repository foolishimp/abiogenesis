# T-270 - Complete M5 Pre-Qualification Behavior

- id: T-270
- title: Complete M5 pre-qualification behavior through the direct-GTL Product path
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src direct-GTL realization across
    gtl, validator, hog, implementation, abg, product, and public
- status: active
- phase_status: m5_s03_active
- review_status: corrected_s02_closed_s03_reprice_active
- proof_status: s02_green_s03_open
- goal: GOAL-035 M5
- priority: critical
- change_intent: >-
    Continue from closed corrected S02 through one Product-defined S03 path:
    One Surface orders work, public operations admit human response and
    continuation, and ABG replay remains the runtime truth.
- change_class: requirement_reprice
- re_entry_point: >-
    specification/requirements/product/REQ-P-SCENARIOS.md
    REQ-P-SCENARIOS-009 and REQ-P-SCENARIOS-010
- triaged_at: 2026-07-24
- created_at: 2026-07-14
- updated_at: 2026-07-24
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- implementation_hold: released
- implementation_hold_effect: >-
    Direct F_H authorized the bounded requirement and delivery-order correction
    on 2026-07-24; ABI5-M5-EXT-001 and corrected ABG5-S02 are green, and
    T-272 is released for ABG5-S03 through the same Product path
- accepted_m5_design_commit: d6da426947e1b7e18e7ed5bd1c0f945dcde9c73f
- accepted_m5_design_sha256: 80269e7306f021723f8713ee6cb37d19cfc96f3a43ed5887c92d18996738c0f3
- regression_binding: ABI5-ROOT-001
- current_product_frontier: ABG5-S03-ONE-SURFACE-CONTINUATION
- current_implementation_base: de29a7b7
- retained_implementation_subject: ffba4e71456cf19168fa2bbf2981b463e018a0cf
- current_branch_head_at_intake: e0575b824773d2105110918cf71257deca8b0f3a
- selected_method_release: STDO v2.0.0
- selected_method_commit: 94ccf4faa1c0a10b002273b1e9a9e7bf4a34753a
- selected_method_member_set_digest: 284efbb31affd6772fe8e523bdd157f7f2ebe4d4d8dee7b5c9ddfd0482da93a0
- completed_dependencies:
  - T-283 accepted Product constitution
  - T-284 accepted correction vector and donor dispositions
  - T-285 accepted direct-GTL root design
  - T-286 installed ABI5-ROOT-001
- subordinate_existing_tickets:
  - T-272
  - T-274
  - T-275
  - T-276
  - T-281
  - T-268
- successor_qualification_tickets:
  - T-282
  - T-247
  - T-248

## Purpose

T-270 is the sole M5 parent owner. It preserves the accepted Product and
direct-GTL authority chain while correcting one lower requirement that assigned
S03 behavior to S02. Intent and Product remain closed; the affected scenario
requirement, GOALS ordering, and existing ticket projections are repriced in
place:

```text
GTL.TypeScript
  -> raw admission and non-lowering validation
  -> direct HoG traversal
  -> declared implementation seam
  -> ABG admission, events, replay, continuation, correction, and closure
  -> thin public projection
```

The current code proves this relation through S01 and corrected S02, including
an independently packed developer Product, all S02-owned traversal rows, live
F_P, and durable F_H continuation. Those proofs remain regression evidence.
The next Product-progress claim is S03: one GTL-owned One Surface path through
the same product-neutral public extension seam.

## Ticket And Authority Rule

No new ticket is required for M5. `GOALS.md` owns sequence. This ticket owns
the integrated M5 outcome. Existing tickets are repriced in place only when
their boundary becomes active:

| Existing ticket | M5 or successor role |
|---|---|
| `T-272` | active `ABG5-S03`: consume the now-green durable F_H continuation path for One Surface, consequence/runtime rows, and public-control rows |
| `T-274` | `ABG5-S05`: ordinary GTL Consensus Module and GraphFunction publication |
| `T-275` | `ABG5-S05`: attributed profiles and replay-derived Consensus result projection |
| `T-276` | `ABG5-S05`: source-blind installed Consensus scenarios |
| `T-281` | active `ABI5-M5-EXT-001` seam: caller-supplied publication, non-empty dependency lock, product-owned contracts and judgment, installed implementation resolution, and product-neutral SDK/CLI; later continues into S06 without a fixed operation count |
| `T-268` | observer/tuner realization plus the final M5 feature and capability read model |
| `T-282` | M6 Product-context materialization of the already-selected STDO v2.0.0 basis |
| `T-247` | M6 self-conformance and exact-candidate qualification |
| `T-248` | M7 RC, final-tap, stable release, and post-publication proof |
| `T-278` | superseded historical ontology input; no implementation authority |

Until repriced, every subordinate active X ticket remains held donor evidence.
Its historical body, count, dependency chain, design, or closure claim is not
current authority.

## Bounded M5 Design Delta

Direct F_H accepted the exact repaired design at commit `d6da4269`, SHA-256
`80269e7306f021723f8713ee6cb37d19cfc96f3a43ed5887c92d18996738c0f3`, on
2026-07-22 and authorized continued T-270 implementation. The implementation
hold is discharged only for that boundary.

The accepted M3 Ontology, authority split, module architecture, and lifecycle
remain the governing design. Before implementation resumes, T-270 shall add
and obtain acceptance for only the affected M5 delta:

1. represent all retained graph relations and seven C constructors without an
   executable intermediate representation;
2. generalize the HoG cursor, structural transition, child traversal, retry,
   batch, foldback, and terminal relations;
3. preserve exact Run, GraphCall, Frame, CCall, locus, fibre, evidence, result,
   judgment, and replay lineage at every transition;
4. define the shared primitive ownership needed to remove GTL/validator
   runtime dependency on Product canonicalization, digest, and immutability
   utilities without creating semantic authority;
5. expose the admitted implementation seam required by deterministic, F_P,
   and later F_H execution without selecting an implementation in HoG or the
   public layer;
6. bind durable event-log reopening and continuation inputs needed by T-272;
   and
7. state the affected three-view and Prime delta while citing unchanged M3
   evidence rather than recreating it.

This is a material-boundary design gate because node identity, traversal
lifecycle, public behavior, and cross-module topology change. It is not a new
Product design programme. Micro implementation choices inside the accepted
delta may co-evolve with code.

## Proportional Execution Order

Every promoted implementation cut reruns `ABI5-ROOT-001`. Review follows a
working installed slice and scales to the changed authority and risk boundary.

| Order | Existing owner | Installed outcome |
|---:|---|---|
| `1` | `T-270`, `T-281` | From an empty consumer directory, install packed ABIogenesis and a separately packed developer mini-product; resolve a non-empty Product lock; admit its supplied publication; invoke it through installed SDK and CLI; and derive the same typed result from ABG replay. |
| `2` | `T-270` | **Complete at `de29a7b7`:** representative complete graph/C behavior, live F_P, four compute-fibre rows, eight structural-form rows, fibre substitution, transparent child traversal, and owned negatives close S02. |
| `3` | `T-272` | **Active:** use durable F_H response and same-run continuation to exercise One Surface, consequence/runtime/public-control rows, and close `ABG5-S03`. |
| `4` | `T-274`, `T-275`, `T-276` | Execute Consensus through the same ordinary extension, catalog, GTL, HoG, ABG, and public path; close `ABG5-S05`. |
| `5` | `T-281`, `T-268` | Complete observer/tuner realization, native and bounded host projection, and independent flavored-catalog portability through the same extension path; close `ABG5-S06` and make `ABG5-S04` runnable. |
| `6` | `T-270` | Re-evaluate the feature ledger and freeze one exact M5 candidate; the complete forty-row conservation sweep remains an M6 qualification obligation. |

No subordinate ticket can weaken the root, define Product scope, or project
M5 closure independently.

## Current M5 Checkpoint

Implementation commit `d7cabbec374133687ebc286699e20504d06a4564`
repairs the first F_P slice after the second authority review:

- Product verifies the exact installed payload and resolves packaged
  implementation descriptors; Public performs fixed preparation and calls HoG
  once without loading concrete implementation symbols;
- HoG owns the direct graph fold and invokes one opaque install-bound admitted
  leaf port; the port binds Product, publication, implementation-set, and
  implementation-row identity and rechecks installed bytes before execution;
- ABG admits exact worker configuration before actor identity, owns truthful
  process supervision events, and derives rather than trusts probabilistic
  evidence;
- F_P success-result admission rejects missing or wrong attribution,
  contradictory output, malformed JSON, and undeclared fields; and
- worker timeout handling escalates from `SIGTERM` to bounded `SIGKILL`, records
  exit only when observed, and fails closed with an explicit unconfirmed state.

Fresh serialized verification is `test:m5` `28/28` and retained `test:m4`
`26/26`. This checkpoint does not close `ABG5-S02`: its model worker is a
subprocess-backed deterministic fixture rather than a live probabilistic
model. The installed path now also proves the B-001 `worker_executes` lane,
post-install code substitution refusal, and observed bounded termination.

Direct `F_H` accepted this bounded checkpoint on 2026-07-23 at
`0b26230c01bfc86e3d93f57a963f4630d904010e`. The decision receipt is
`.ai-workspace/comments/codex/20260722T230559Z_DECISION_fh_accept_t270_fp_authority_checkpoint.md`.

Implementation commit `898f7bd5aa115bc1a4e653d070ddc9a8b2723bb8`
advances the next typed frontier without claiming `ABG5-S02` closure:

- native GTL `workflow.C` opens one transparent parent `CCall`, admits one
  child `ExecutionBasis`, traverses the child in the same Run through HoG, and
  folds the admitted child result and judgment back through ABG evidence;
- the child-preparation seam is an opaque Product-bound port and is absent
  from the packaged HoG construction surface;
- the F_P path now binds parser, prompt transport, lane, process contract, and
  dispatch ordinal into admitted identity, allows one dispatch per `CCall`,
  records unavailable commands as typed process failure, and salvages only
  contract-valid output after transport failure; and
- Public still performs one HoG invocation and exposes no traversal loop,
  implementation symbol selection, compiled carrier, or child-port minting
  authority.

Fresh serialized verification is `test:m5` `34/34` and retained `test:m4`
`26/26`. `ABG5-S02` remains open. The next typed frontier is the complete
forty-row traversal matrix and shape-preserving fibre-substitution differential,
followed by a genuinely live F_P proof.

Implementation commit `3149a9b2b96d9cd08c27ffd02fb87f1434e2d8cc`
completes the shape-preserving fibre-substitution differential without claiming
the forty-row matrix or `ABG5-S02`:

- one additional direct GTL Program and GraphFunction use the same input and
  output contracts and the same C-call locus as the existing F_P leaf while
  selecting an F_D implementation and deterministic evidence contract;
- source-blind installed CLI execution proves both fibres produce the same
  five-event C-call spine, terminal route shape, result contract, public result,
  and replayable closure while preserving distinct fibre and evidence truth;
- the F_D execution admits no actor event while the subprocess-backed F_P
  execution admits actor truth through ABG; and
- a cross-wired Program and GraphFunction with otherwise equivalent contracts
  is refused before a Run or event log exists.

Fresh serialized verification is `test:m5` `36/36` and retained `test:m4`
`26/26`. No parser, lowering, compiled carrier, public traversal controller, or
second runtime path was added. `ABG5-S02` remains open: the residual T-270
frontier is the uncovered forty-row inventory followed by a genuinely live F_P
proof.

Implementation commit `8970130652f914b0603914d8720ed1d54dff970f`
completes the genuinely live F_P proof through the same installed path:

- the packed candidate invokes the operator-bound real Claude executable under
  the admitted F_P transport contract and receives an exact contract-valid
  result from `claude-fable-5`;
- ABG admits the transport binding, actor and process lifecycle, artifact
  observation, probabilistic evidence, result, judgment, terminal route, and
  complete closure chain across `41` durable events;
- replay and the public CLI outcome agree, and the exact proof binds the package
  basis, model, transport identity, event-log digest, artifact digests, result,
  and replay digest; and
- the live run exposed one bounded transport defect: Claude's protocol-owned
  `StructuredOutput` event had been counted as a capability tool. The repair
  excludes that event only when an exact response schema is declared, while an
  undeclared `StructuredOutput` event and ordinary tools remain contract
  failures on the closed-prompt lane.

Fresh verification is live `test:m5:live-fp` `1/1`, fast `test:m5` `37/37`,
and retained `test:m4` `26/26`. This proves the live F_P obligation but does not
close `ABG5-S02`; the remaining T-270 frontier is installed graph-application
and conservation-row coverage, including recursion, fan-out/fan-in, gate, and
their nearest invalid substitutes.

Implementation commit `13d413905728a3d8464dec20ddf5de06dc11e6ec`
advances the first direct graph-relation frontier without claiming the other
application relations:

- GTL.TypeScript now constructs the ordinary graph edge and all nine typed
  `GraphFunctionApplication` relations with canonical identities; recursion
  additionally requires an exact positive bound and declared rebind foldback
  with parent re-evaluation;
- the non-lowering validator checks exact relation shape, complete Program
  membership, outer interfaces, typed joins, and invalid widened or forged
  declarations;
- one packed two-node F_D GraphFunction follows exactly one declared edge from
  its non-terminal node to its terminal node, with HoG deriving the transition
  from original GTL and ABG admitting its exact target; and
- the installed CLI result, two C-call loci, route sequence, durable events,
  replay, and public outcome agree without a compiled carrier, lowering pass,
  scheduler, or public traversal loop.

Fresh serialized verification is `test:m5` `42/42` and retained `test:m4`
`26/26`; `ABI5-ROOT-001` is `root_satisfied` with R1-R10 true. Static relation
declarations are not traversal-row proof. `ABG5-S02` remains open on installed
recursion, fan-out/fan-in, gate, the remaining application relations, and the
complete conservation-row inventory.

Implementation commit `25af35dbad0efb625eea7f00da131102294dcc1b`
closes the declaration/admission prerequisite for runtime-visible recursion
and gate relations without claiming their execution:

- GTL.TypeScript publishes first-class immutable `Rule` and `Evaluator`
  declarations as ordinary Module data; a Rule remains passive and an
  Evaluator carries no event, traversal, or closure authority;
- recurse binds one published termination Rule and one or more published
  termination Evaluators in addition to its exact bound and foldback;
- gate binds its Rule and Evaluators to the same admitted publication; and
- static validation rejects absent, ambient, duplicate, widened, malformed,
  or identity-forged declaration/application data before runtime entry.

Fresh serialized verification is `test:m5` `43/43`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. Two independent
`npm pack` runs reproduced artifact SHA-256
`6efcc659e8d4a81c5b50ec303fb5da0ea4c2e1a9493e4e79842b758a758a2908`.
No evaluator runtime, policy engine, parser, lowering, compiled plan, public
controller, or second runtime path was added. `ABG5-S02` remains open on
runtime recursion, fan-out/fan-in, gate, the remaining application relations,
and the complete conservation-row inventory.

Implementation commit `f65059a8` establishes the first native
GraphFunction-construction path without claiming the remaining static
relations:

- `composeGraphFunctions` consumes two immutable GTL.TypeScript
  GraphFunctions and returns one immutable GraphFunction containing their
  original nodes, one derived bridge edge, and one canonical compose
  application;
- construction preserves both source values, demotes only the left terminal
  result into an intermediate value, merges cumulative environment and
  metadata fail-closed, and rejects malformed topology, interface mismatch,
  duplicate identities, and declaration conflicts;
- static validation resolves compose provenance against exact published source
  GraphFunctions while retaining only the constructed parent in the invoked
  Program membership; and
- the packed parent traverses through ordinary HoG and ABG, with two C-call
  fibres bound to the same composition application and replay agreeing with
  the public CLI outcome.

Fresh serialized verification is `test:m5` `44/44`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. Two independent
`npm pack` runs reproduced artifact SHA-256
`d4cf72318e3a39250db060aadc1c991ff78e7c8e1b5ec995d5d7e07c184d0134`.
No parser, lowering, semantic IR, compiled program, public controller, or rival
runtime was added. `ABG5-S02` remains open on substitute, identity, promotion,
same-object, runtime recurse/fan-out/fan-in/gate, and the conservation rows.

Implementation commit `38a33ae6` establishes native GraphVector substitution
without claiming the remaining graph relations:

- `substituteGraphFunction` consumes immutable outer and inner
  GTL.TypeScript GraphFunctions, replaces one exact canonical outer vector,
  and returns one immutable GraphFunction with the inner structure visible;
- construction preserves the outer interface and topology boundary, binds
  canonical substitution provenance, demotes only inserted terminal results,
  and rejects missing or forged targets, interface or environment mismatch,
  duplicate identities, and declaration conflicts;
- static validation resolves the exact published outer and inner sources and
  checks the materialized typed replacement while the invoked Program retains
  only the substituted parent as callable membership; and
- the packed parent traverses through ordinary HoG and ABG as three C-calls,
  with durable events retaining compose provenance on the outer leaves and
  substitute provenance on the inserted leaf.

Fresh serialized verification is `test:m5` `46/46`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. Two independent
`npm pack` runs reproduced artifact SHA-256
`7159345de37858a486c62753d9fb0863ac447743d0ad8c0161790e26a0674d5f`.
No parser, lowering, semantic IR, compiled program, public controller, or rival
runtime was added. `ABG5-S02` remains open on identity, promotion,
same-object, runtime recurse/fan-out/fan-in/gate, and the conservation rows.

Implementation commit `cf4790cb` closes the validator-only `same_object`
relation without adding runtime work. GTL now derives one canonical witness
from one exact opaque identity; construction rejects unequal identities, and
whole-Program validation rejects a forged identity or witness. Fresh
verification is `test:m5` `47/47`, retained `test:m4` `26/26`, and
`ABI5-ROOT-001` `root_satisfied`. Repeat packing reproduced artifact SHA-256
`3a9615098496d75f111fedd50dc12996a9744726c35cfb034a78f9155d473336`.
`ABG5-S02` remains open on identity, promotion, runtime
recurse/fan-out/fan-in/gate, and the conservation rows.

Implementation commit `09e14a18` binds the Product's fixed traversal
conservation inventory to executable installed evidence without claiming the
unimplemented rows:

- one test-owned matrix contains exactly `4 + 8 + 9 + 13 + 6 = 40` Product
  behavior identities and all six required evidence columns;
- `15` rows execute against packed CLI scenarios covering F_D, F_P, atomic,
  composition, edge, batch, child traversal, depth, advance, close, block,
  non-admission, GraphFunction targeting, and direct root control;
- `25` rows remain explicit `todo` gaps, including F_H, mixed traversal,
  runtime evaluator selection, recursion, real retry, continuation, public
  bounded control, and the other typed consequence/disposition families; and
- the exact package basis and retained root proof were regenerated from the
  ordinary installed path rather than edited into agreement.

Fresh serialized verification is conservation progress `15/40` with `25`
named `todo` rows, ordinary `test:m5` `47/47`, retained `test:m4` `26/26`, and
`ABI5-ROOT-001` `root_satisfied`. Repeated packing reproduced artifact SHA-256
`41ba3f89af7af84bf02a6cd42319651af48540e196cb32606ce4cb0c1aa747c0`.
This matrix is a no-silence governor, not an S02 completion substitute;
`ABG5-S02` remains open.

Implementation commit `46a2786b` closes the native GraphFunction identity law
without inventing a runtime identity service:

- `identityGraphFunction` constructs one immutable typed `C.id` GraphFunction
  with one canonical identity application and no effect or executable leaf;
- native GraphFunction composition recognizes exact left and right identity,
  removes only the no-effect identity topology, and retains the source and
  composition provenance in the constructed GraphFunction;
- whole-Program validation admits both identity compositions while a forged
  identity target falls through to ordinary composition checks and refuses;
  and
- no HoG, ABG, Product, Public, parser, lowering, compiled carrier, or rival
  execution path changed.

Fresh serialized verification is `test:m5` `48/48`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. The fixed
conservation inventory remains honestly `15/40` with `25` explicit gaps.
Repeated packing reproduced artifact SHA-256
`333e48aa5026a87868d79951decd1bad3bab2abe78d26248a363557076aa8ec9`.
That checkpoint closed the static identity relation only; promotion and
runtime recurse/fan-out/fan-in/gate were still open, so it did not close
`ABG5-S02`.

Implementation commit `c0b81d6c` closes the native GraphFunction promotion
law without adding runtime policy:

- `promoteGraphFunction` consumes one immutable GraphFunction and one exact
  declared source/target contract boundary;
- the constructed GraphFunction preserves the complete source topology,
  environment, effects, declarations, and tags while adding one canonical
  promotion application and a distinct graph identity;
- whole-Program validation admits the promoted relation and rejects contract
  mismatch or a forged promotion target; and
- no HoG, ABG, Product, Public, parser, lowering, compiled carrier, policy
  engine, or second execution path changed.

Fresh serialized verification is `test:m5` `49/49`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. The fixed
conservation inventory remains `15/40` with `25` explicit gaps. Repeated
packing reproduced artifact SHA-256
`041854a46c67ce5b7525787382131438e3750e5f28688113e9d70cb1213ecaac`.
Runtime recurse, fan-out/fan-in, and gate remain open, so `ABG5-S02` remains
open.

Implementation commit `d543fd21` proves one heterogeneous native
GraphFunction composition through the ordinary installed Product path:

- GraphFunction composition derives the `mixed` declaration only when exact
  `F_D`, `F_P`, or `F_H` declarations differ; unrelated declaration conflicts
  still refuse;
- one published GTL Program composes the existing admitted `F_P` leaf with an
  exact total `F_D` output-preservation leaf, with no generated executable
  carrier;
- source-blind CLI execution traverses both original GTL loci through HoG and
  admits distinct probabilistic and deterministic C-call evidence through one
  ABG run; and
- both C-calls retain one GraphFunction-composition identity and produce one
  replay-agreeing terminal result.

Fresh serialized verification is `test:m5` `50/50`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. The fixed
conservation inventory remains `15/40` with `25` explicit gaps. The Product's
`mixed` row requires one Program containing `F_D`, `F_P`, and `F_H`; this
two-fibre checkpoint is prerequisite evidence only and does not claim that
row. Repeated packing reproduced artifact SHA-256
`f64d28264dcf05018b04ed5269b3eaa8cf4884f2affe21471ba94fcec7b94164`.
No parser, lowering, compiled carrier, public controller, or rival runtime was
added. `ABG5-S02` remains open, and T-272 owns the missing `F_H` continuation
locus needed for the complete mixed witness.

Implementation commit `ff2636ef` proves bounded same-edge retry through the
ordinary installed Product path:

- one Product-published GTL.TypeScript GraphFunction declares
  `C.retry(C.of(F_P), 2)` with no lowered executable carrier;
- HoG retains the exact input basis, derives the second-attempt cursor from the
  original GTL term, and owns the retry inside its existing graph fold;
- ABG admits retry attempt, failed C-call judgment, retry progress, same-edge
  route, fresh attempt, and eventual closure as append-only runtime truth;
- replay and Public accept the successful chain only when the retried call has
  an exact admitted retry route and sequential successor call; and
- installed negatives prove semantic disagreement does not retry and repeated
  malformed output stops after exactly two worker dispatches.

Fresh serialized verification is `test:m5` `53/53`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. The fixed
conservation inventory advances to `18/40`, with `22` explicit gaps. Repeated
packing reproduced artifact SHA-256
`b1360405472ec9f42ec56115176a5a6e480564dfff9a6170dc4836fd8a172362`.
This checkpoint proves the installed `contract_failure` retry path only;
runtime recursion, gate, fan-out/fan-in, F_H continuation, and the remaining
rows stay open. `ABG5-S02` remains open.

Implementation commit `c803dd65f947660def0568bcddc7e39d519d7eb9`
proves one declared gate through the ordinary installed Product path:

- one Product-published GTL.TypeScript `GateApplication` binds an immutable
  Rule, one F_D Evaluator, and one named target GraphFunction;
- whole-Program validation requires the evaluator locus to match the declared
  evaluator implementation, regime, composition identity, and gate input
  contract before runtime entry;
- HoG traverses the evaluator C-call and advances into the declared
  `workflow.C` target only after ABG admits the evaluator result, judgment, and
  caused route; and
- the installed negative admits a valid evaluator result but blocks before
  opening the target GraphCall, while detached evaluator authority refuses at
  validation.

Fresh serialized verification is `test:m5` `55/55`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. The fixed
conservation inventory advances to `19/40`, with `21` explicit gaps. Two
independent packs reproduced artifact SHA-256
`eca20ec46453b12796c6020ed093f5506e29f8f62c5fab64b434ed5519ef8994`.
No parser, lowering, compiled carrier, public controller, policy engine, or
second runtime path was added. Runtime recursion, fan-out/fan-in, F_H
continuation, and the remaining rows stay open. `ABG5-S02` remains open.

Implementation commit `a4df6eeb15dcfee565c7510f43f49de283c7fbd2`
proves bounded graph recursion through the same ordinary installed Product
path:

- whole-Program validation requires each declared gate target to equal its
  adjacent `workflow.C` target and binds recursion to an exact Boolean
  termination field, published Rule and Evaluator, rebind foldback, child
  GraphFunction, and positive bound;
- one Product-published GTL.TypeScript Program evaluates its parent locus,
  opens the declared child GraphCall when non-terminal, and re-enters the same
  parent Frame only after ABG admits the child result, judgment, and foldback;
- HoG advances the parent cursor through attempts `1` to `4` from admitted
  application routes without a JavaScript recursion stack, generated program,
  lowered carrier, or public traversal loop; and
- the installed bound negative opens only three child GraphCalls, admits the
  fourth non-terminal parent judgment as blocked application truth, and ends
  the Run with `run_stopped`.

Fresh serialized verification is `test:m5` `57/57`, retained `test:m4`
`26/26`, and `ABI5-ROOT-001` `root_satisfied` with R1-R10 true. The fixed
conservation inventory advances to `20/40`, with `20` explicit gaps. Two
independent packs reproduced artifact SHA-256
`50924833d69949f29c0dab90f5d004b196150bc69abf400e538c83d81a574849`,
Product content digest
`sha256:0bbb15434783efb107458915a20796c82c3a03069f821de83f84c4262af1e9b1`,
and manifest digest
`sha256:430e4402773ee2be8bb3b02aebc8d034df3132dcad752af96fda20517ef22596`.
Fan-out/fan-in, F_H continuation, and the remaining rows stay open.
`ABG5-S02` remains open.

Review-repair commit `0ed75e8f27c551451cf6998d24ccce9f4ccfccab`
corrects the nested child-lifecycle defect in that checkpoint:

- every successful child now admits its own exact
  `terminal_reached -> frame_closed -> graph_call_closed` chain before
  foldback can claim `closed`;
- runtime lifecycle fluents are keyed by Run, GraphCall, Frame, cursor, CCall,
  route, judgment, and foldback identity, and the exact application foldback
  availability is consumed by the parent route;
- replay selects root closure from the root aggregate identities rather than
  the first nested closure event, and a successful Public outcome refuses any
  remaining transient lifecycle truth; and
- one declared installed negative makes a child judgment block, admits stopped
  child foldback truth, and propagates it into exactly one parent
  `run_stopped`.

Fresh serialized verification is `test:m5` `58/58`, retained `test:m4`
`26/26`, and conservation `20/40` with `20` explicit gaps. Two independent
packs reproduce artifact SHA-256
`e97df484d3e310a1e1e6aebd26eab46474779f7657a40e8b9538654a6a07e975`,
Product content digest
`sha256:4e923e09dde9ba97512c08cbd86827681a75207f71f7101f0642faf29bca7a61`,
and manifest digest
`sha256:e8472a350ff69e15105d6818d5e33a3099d77bdc154b3f28e4af78cfde40638f`.
Fan-out/fan-in remains the next frontier and was not started by this repair.

Follow-up repair commit `dea47b7c19341c8610630c07af024b849589b091`
closes the three remaining recursion-lifecycle findings without starting the
next frontier:

- closure contracts now discriminate complete Run closure from nested
  GraphCall closure; each child names an explicit GraphCall-scope contract
  containing exactly
  `terminal_reached -> frame_closed -> graph_call_closed`, while the root alone
  names `run_closed`;
- static validation, child-basis admission, and closure admission reject a
  missing, mismatched, or root-scoped child closure contract;
- stopped child foldback terminates the exact child active, blocked, and failed
  Frame fluents plus the child GraphCall fluent; the public and installed proof
  lifecycle census now includes blocked and failed Frame state; and
- `parent_waiting_on_child` is initiated and terminated by child GraphCall
  identity, so sibling waits cannot collapse through their shared parent
  Frame.

The first complete M5 run correctly exposed that workflow and gate children
still declared the root Hello World closure contract. Their GTL declarations
were repaired to name the shared GraphCall-scope child contract rather than
weakening child admission.

Fresh serialized verification is `test:m5` `59/59`, retained `test:m4`
`26/26`, and conservation `20/40` with `20` explicit gaps. Two independent
packs reproduce artifact SHA-256
`1dbd11d16ab24c02fa1783eaa14af9c9a72398d2f4d777dcae9cbcb7ed2b66ac`,
Product content digest
`sha256:897009bee8bb7da013d3eb9d4f32b51e97ebe6a3e55b5bd2b04df359018d132f`,
and manifest digest
`sha256:974acba36c4fd1376b6a4c60f343c979fcc4703d6f913e0552d6d81565eacaf6`.
Fan-out/fan-in remains paused pending bounded review of this exact repair.

Implementation commit `6c25b7c5cc0826b8fb9153c3739065b2325ab534`
proves serial fan-out and guarded fan-in through the same ordinary installed
Product path:

- one GTL.TypeScript Program and GraphFunction declare an exact ordered
  `C.batch` of transparent `workflow.C` member calls followed by one reducer,
  with whole-Program validation re-deriving the materialized member set from
  the admitted input vector;
- HoG traverses the member tasks serially through their exact installed leaf
  port, without a Public traversal loop, and enters the reducer only after ABG
  admits complete-vector truth for the same Frame and batch;
- ABG admits disjoint complete-vector and partial-stop outcomes: completion
  binds the ordered per-task census and canonical output vector, while a stop
  binds the completed prefix, stopping task, and unstarted suffix and cannot
  open the reducer; and
- installed proofs cover ordered `Alpha`, `Beta`, `Gamma` completion, one
  reducer after all three members, reordered-input refusal, and a blocked
  second member that leaves the third unstarted and the reducer unopened.

Fresh serialized verification is `test:m5` `62/62`, retained `test:m4`
`26/26`, and conservation `21/40` with `19` explicit gaps. Two independent
packs reproduce artifact SHA-256
`43c2bb73f02de2b5d6afa4caad553da3c638d95bad288bb6e690de0eae8c1801`,
Product content digest
`sha256:25b96e30084996ac01749c6aa48f79d3265abedccda77d05dcf290fdd9e6b1ed`,
and manifest digest
`sha256:450cd2d558646fc213f5cf846ba5b2c7da58a37e549b984e96cc2145d7b50a24`.
No parser, lowering, compiled carrier, Public controller, or second runtime
path was added. `ABG5-S02` remains open on the remaining installed traversal
and conservation gaps.

Review-repair commit `8377adf7533faad9b49aee66de6048e358cce20b`
closes the four findings against that checkpoint:

- complete-vector and partial-stop routes consume both the terminal task
  judgment and the exact fan-out completion availability; Public now refuses
  successful closure if any C-call judgment remains active, and the retained
  retry route consumes the same paired judgment and progress truth;
- replay reconstructs and verifies typed complete-vector or partial-stop
  carriers from the admitted event payload, and HoG discards the process-local
  completion object and proposes and admits the route from replay truth;
- Product admission preserves each caller-submitted member ref through
  materialization, task truth, completion rows, and output lineage; and
- GTL authoring and raw whole-Program validation require the fan-out outer
  input/output contracts and fan-in outer input contract to equal their exact
  vector contracts.

Fresh serialized verification is `test:m5` `63/63`, retained `test:m4`
`26/26`, and the conservation runner `21/40` with `19` explicit gaps. Two
independent packs reproduce artifact SHA-256
`7c1bbd6a7c8ae1a3b6312237db4d8936d5fed6182dd2ba9f74b1022a3ed54f87`,
Product content digest
`sha256:d538249c584bcd8f374595c842d40af854845c46e98759eafa49bfff9cff1eca`,
and manifest digest
`sha256:06e02d06cb19206d76c42d1b425eb6e69195b44ab21cdb2ec6b12e6191970107`.
The runner's `graph_span_reentry` row remains provisional pending bounded
re-review; the durable status is therefore twenty accepted rows plus one
repaired provisional row. `ABG5-S02` remains open.

The subsequent bounded review accepted repaired `graph_span_reentry` as the
twenty-first installed conservation row. No new conservation row is claimed by
the event-history work below.

## Durable Event-History Reopen Checkpoint

Implementation commit `21166b11` completes the direct prerequisite named by
the accepted M5 design without starting F_H response or continuation:

- `EventStoreReopenAuthority` binds one exact durable path, file identity,
  byte length, log digest, and event-contract digest and survives a
  serialization boundary;
- reopening validates the complete historical prefix without restamping,
  preserves its admission ordinals and causation, and admits the next event at
  `maxOrdinal + 1`;
- live admission and historical reconstruction share one closed 41-kind event
  contract, including coupled root/child and run/frame variants;
- one atomic, fully written exclusive append lock prevents two contexts from
  owning the same sink; an active or abandoned lock fails closed and is never
  stolen by a competing process;
- append verifies exact sink identity and position, fsyncs admitted bytes, and
  rolls back an unadmitted suffix on failure; and
- the CLI retains one context across its complete JSONL transcript and
  releases durable ownership only after that transcript ends.

The focused reopen lane is `7/7`. Fresh serialized verification is `test:m5`
`70/70`, retained `test:m4` `26/26`, and conservation `21/40` with `19`
explicit gaps. Two independent packs reproduce artifact SHA-256
`f541bfa7480d0413bd3b189f3e8ba35026c23d1a6fa83635c9507dc2ca0fe180`,
Product content digest
`sha256:eeaf0b43b2e989fec85158c51bffc1cab43247e14c3490c2c5604b32e55836c1`,
and manifest digest
`sha256:d8fddae5cf0562aacc2f058ba91974ea700abb53bab9f7b62e7a3555a42f7607`.

An independent boundary re-review confirmed that atomic lock publication
closes the earlier split-ownership race and partial-lock defect. This
checkpoint does not close `ABG5-S02`, reprice T-272, admit a human response, or
claim durable continuation. Its next consumer is T-272's exact
interaction-response and continuation slice.

## 2026-07-24 Product-Frontier Correction

The prior execution order is superseded where it treated the complete
forty-row conservation matrix as an S02 work queue. Product assigns S02 the
compute-fibre and structural-form behavior and assigns consequence routes,
runtime dispositions, public control, and continuation to S03 and later
scenarios. The lower requirement and this ticket incorrectly scheduled all
forty rows before those later capabilities existed.

Current implementation base
`b98dc7f5be9373c9b475af558fe2dabc1bf04f80` is retained. No reset, new
zero-inherited line, Product rewrite, or new ticket hierarchy is authorized.
At the correction point, the `21/40` matrix state was retained as conservation
evidence but no longer selected implementation order or projected Product
progress.

The current checkpoint is `ABI5-M5-EXT-001`. It requires:

- packed ABIogenesis and a separately packed developer-authored mini-product
  installed into an empty consumer directory;
- a non-empty exact Product dependency lock;
- caller-supplied Module, Program, GraphFunction, contract, judgment, and
  implementation publication;
- installed catalog admission and product-neutral SDK/CLI invocation;
- ordinary GTL validation, direct HoG traversal, ABG event admission and
  replay-derived typed outcome; and
- structural proof that no identifier, branch, validator, judgment, or
  implementation for the mini-product exists in ABIogenesis core.

Only seams exposed by that installed path are current implementation work.
T-272 remains held until this checkpoint and the corrected S02 boundary are
ready.

## Independent Product Checkpoint

Implementation commit `bc9ca26a` closes `ABI5-M5-EXT-001`:

- packed ABIogenesis and a separately authored TypeScript/GTL mini-product
  install into empty consumer roots;
- one exact two-Product lock carries a non-empty dependency edge;
- the caller supplies the mini-product Module, Program, GraphFunction,
  contracts, judgment relation, semantics provider, and implementation
  binding;
- ABIogenesis validates and admits that publication without a
  product-specific branch, traverses it through HoG, admits runtime truth in
  ABG, and returns the same typed result through the installed SDK and CLI;
- the exact installed Product owns input, result, and judgment semantics, and
  missing semantics or an undeclared judgment fails closed; and
- the retained bootstrap proof now supplies its publication explicitly rather
  than relying on Public to author ABIogenesis-specific GTL.

Fresh serialized verification is `test:m5` `71/71` and retained `test:m4`
`26/26`. The ABIogenesis package basis is artifact SHA-256
`55a3361ed6de48327ed453461455f654c120ab416ebe134c53ef1842ff4c466f`,
Product content digest
`sha256:37eb270e3e25b1596fff658e3e67615694aa5e58f7f238cadb1a42125b4dd394`,
and manifest digest
`sha256:7033856da9947f5690ab3341a750ca8234a543a574d98939db3453d7d968359c`.
This checkpoint proves the extension seam, not S02 or S06 closure. The next
typed frontier is corrected S02.

## Corrected S02 Closure Checkpoint

Implementation commit `de29a7b7` closes corrected `ABG5-S02` through the same
independently packed Product seam:

- the developer Product publishes one mixed `F_D` -> `F_P` -> terminal `F_H`
  GTL Program without any developer-specific switch in ABIogenesis core;
- the installed path holds at the exact F_H cursor, exposes replay-derived
  state through `project.read`, admits an attributed typed response through
  `interaction.respond`, reopens the append-only event log, and resumes the
  same Run through a separate `run.continue`;
- ABG reconstructs invocation, execution-basis, scope, C-call, pending
  result/judgment, and continuation truth from durable events; HoG separately
  re-admits its exact held cursor before traversal resumes;
- malformed response shape and wrong actor refuse without advancing the
  continuation, while the successful path records exactly three fibre
  selections, three complete C-call spines, one resolved continuation, one
  run closure, and gap-free admission ordinals; and
- the fresh current-candidate live F_P proof uses `claude-fable-5` through the
  same installed transport and replay path.

Fresh serialized verification is `test:m5` `72/72`, retained `test:m4`
`26/26`, live `test:m5:live-fp` `1/1`, focused durable reopen `7/7`, and
conservation `23/40` with `17` explicit later-scenario gaps. All four
compute-fibre and eight structural-form rows are green, alongside fibre
substitution, transparent child traversal, and the required malformed GTL and
F_P refusals. S02 is closed; S03 is the next Product frontier.

## 4.6 Conservation

The T-284 correction vector remains the origin ledger. T-270 shall consume,
not reproduce, its exact rows. The first F_P slice must explicitly conserve
RC5 `B07-B14`, `B24`, and final-integration donor class `Y02`, including:

- `closed_prompt_proof` versus `worker_executes` lane behavior;
- protocol-owned execution flags;
- bounded append-argument admission;
- declared external sandbox posture;
- real transport process, progress, tool, artifact, and result evidence; and
- invariant-based negative proof.

Every other known RC5 semantic row must reach a terminal disposition by M5,
M6, or M7. A missing implementation is a typed gap, not permission to copy a
donor controller or compiled carrier.

## Derived Feature Ledger

This ledger prevents silence over known Product outcomes. It is a read model,
not a proof that the Product is complete.

| Feature | M4 state | Owning closure |
|---|---|---|
| `A5-F01` exact product/install/workspace/catalog | two independently packed Products and one non-empty exact dependency lock proven; broader conflict coverage pending | `T-270`, `T-281` |
| `A5-F02` complete GTL authoring and validation | S02 authoring, serialization, raw admission, validation, publication, seven constructors, ten relation declarations, GraphFunction relations, and invalid substitutes proven | `T-270` / S02 complete |
| `A5-F03` complete graph, C, and traversal | all four compute-fibre and eight structural-form rows, fibre substitution, transparent child traversal, and representative graph/C applications proven | `T-270` / S02 complete |
| `A5-F04` probabilistic result integrity | current-candidate live F_P evidence/result admission and malformed, incomplete, contradictory, unattributed, and extra-field refusals proven | `T-270` / S02 complete |
| `A5-F05` one public contract authority | caller-supplied independent publication proven; complete public family pending | `T-281` / S06 |
| `A5-F06` thin SDK and CLI | independent Product invocation proven through both installed surfaces; complete public family pending | `T-281` / S06 |
| `A5-F07` complete One Surface loop | absent | `T-272` / S03 |
| `A5-F08` Consensus free construction | absent | `T-274`, `T-275`, `T-276` / S05 |
| `A5-F09` catalog semantics | product-neutral admit, view, and invoke proven for an independent Product | `T-270`, `T-281` / S02 and S06 |
| `A5-F10` event-sourced runtime truth | deterministic, live F_P, child traversal, bounded retry, blocked, terminal, exact durable-history reopen, and F_H hold/respond/continue subsets proven; S03 and later scenario truth remains open | `T-270`, `T-272` / S02 complete, S03 active |
| `A5-F11` self-conformance | absent | realization readiness in `T-268`; qualification in `T-247` / S04 |
| `A5-F12` observer and tuner | absent | realization in `T-268`; qualification in `T-247` / S04 |
| `A5-F13` native and bounded host projection | absent | `T-281` / S06 |
| `A5-F14` packed Hello World and live F_P | installed deterministic and live F_P proofs green | `T-270` / S02 |
| `A5-F15` exact-candidate qualification | pending by phase | `T-247` / M6 |
| `A5-F16` immutable RC and stable release | pending by phase | `T-248` / M7 |
| `A5-F17` downstream portability | first independently packed Product proven; independently flavored downstream catalog remains pending | `T-281` / S06 |

At M5 closure, every row must state `realized`, `proof_pending`,
`qualification_pending`, or `release_pending` against one exact candidate.
F15 and F16 cannot be falsely closed before M6 and M7.

## Goedel And Proportionality Boundary

The finite Product, scenario, and feature inventories define known authority;
they cannot prove from inside themselves that no counterexample or missing
behavior exists. Therefore:

- enumeration is not computation or completion;
- the feature ledger cannot self-certify M5;
- installed scenarios, mutation negatives, independent consumers, and review
  remain falsification surfaces; and
- a discovered gap is added to its existing owning ticket unless it changes
  Product meaning or a material semantic boundary.

Additional text, design, proof, or review is proportional only when it removes
enough ambiguity to justify the reasoning surface it adds. Existing Ontology,
IACS, Prime, three-view, requirement, and proof evidence is cited when
unchanged. No duplicate ticket, operation census, design pack, receipt family,
or closure surface is authorized merely to make the plan look exhaustive.

## M5 Closure

T-270 closes M5 only when:

1. one exact source-independent candidate retains green `ABI5-ROOT-001`;
2. `ABI5-M5-EXT-001` and `ABG5-S02`, `S03`, `S05`, and `S06` pass through the
   same product-neutral public Product path;
3. each M5 scenario carries its owned traversal evidence and the
   fibre-substitution differential; the complete forty-row aggregate remains
   explicit and ready for M6 qualification;
4. B-001 and every admitted RC5 behavior are conserved without a donor
   controller or compiled carrier;
5. observer/tuner and self-conformance behavior needed by S04 are realized and
   frozen before qualification;
6. the feature ledger has no silent or contradictory row;
7. malformed GTL, malformed F_P, authority substitution, rival traversal,
   continuation, event, and public-controller paths refuse at their owning
   boundaries; and
8. the exact M5 candidate is ready for T-247 qualification under the selected
   STDO v2.0.0 basis.

Root green, component tests, file counts, operation counts, ticket counts, or
the ledger alone cannot substitute for these installed outcomes.
