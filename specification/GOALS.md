# abiogenesis Goals

## Position

`GOALS.md` holds the current work-wave focus above intent, product definition,
requirements, and design.

In this wave, abiogenesis is following the strict inside-out migration rule
from `SPEC_METHOD.md`:

- reprice the public contract first
- remove superseded bridge authority
- migrate producer and consumer surfaces to the new contract
- prove only after the old contract is no longer authoritative

This wave does not treat alias spellings or mixed operator stories as
acceptable closure.

The current completed wave is ABG construction-substrate. It turns the T-127
first-slice construction carriers into an installed mixed-regime runner with
composition grammar, vector-local regimes, observed-state admission, overlay
frames, F_D authority placement, construction pressure packaging, and
dependency-ready saga-frontier realization transparency.
Downstream product migration follows after this substrate proves by deleting
product-local loop/controller authority rather than rebuilding it.

## Current Goals

| Goal ID | Scope | Goal | Success Signal | Proving Surface | Status | Tracking |
| --- | --- | --- | --- | --- | --- | --- |
| `GOAL-003` | `Product` + `Policy` + `Design` | Replace the split human operator surface with one public advancement/observation contract: `gen-start` and `gen-gaps` as named composition truth, with literal CLI or service spellings treated as adapter/build bindings rather than rival public law. | Intent, product, policy, docs, adapter help, and tests all describe one operator model; `gen-iterate` and `run-status` no longer stand as co-equal public human commands. | `B-021`, `B-022`, `B-025`, `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`, `test_cli_adapter_auto.py` | Completed | `B-021`, `B-022`, `B-025` |
| `GOAL-004` | `Product` + `Policy` + `Projection` | Make repeated proof failure become authoritative control-plane hold truth instead of loop-local behavior. | One resolved hold policy source governs enablement and threshold; `gen-start`, `gen-gaps`, and live status project the same replay-derived held truth; the clear path is authoritative event truth, not controller memory. | `B-018`, `REQ-P-POLICY`, `test_abg3_runtime_envelope.py`, `test_cli_adapter_auto.py`, `test_m03_engine_kernel_integration.py` | Completed | `B-018` |
| `GOAL-005` | `Product` + `Design` | Make public targeting identity-backed and fail closed before downstream domains build higher-order traversal over it. | Public graph-function targeting resolves through a published target catalog to canonical callable-carrier identity, ambiguity fails closed, and `asset:<published_handle>` resolves only through one published operator asset registry and ownership surface to one governing callable boundary. | `B-023`, `B-024`, GTL identity law, target-resolution tests | Completed | `B-023`, `B-024`, `B-026` |
| `GOAL-006` | `Run` + `Convergence` + `Policy` + `Projection` | Make continuation-owned retry/repair/review outcomes project as yielded public truth instead of failure-shaped status whenever a lawful next step exists. | `gen-start`, runtime return payloads, run projection, and live-status agree on yielded continuation truth; downstream products no longer need semantic repair over ABG status. | `B-029`, `REQ-R-ABG3-RUN`, `REQ-R-ABG3-CONVERGENCE`, `REQ-R-ABG3-EVENTS`, `REQ-P-POLICY`, `test_abg3_runtime_envelope.py`, `test_cli_adapter_auto.py` | Completed | `B-029` |
| `GOAL-007` | `Requirements` + `Projection` + `Convergence` | Make ABG closure derive from total assurance projection over current authority and admitted runtime events, so bounded compute cannot close by worker success, report shape, test success, or absent closure rows. | ABG has requirement authority for exhaustive ambiguity rows and event-sourced payload ledgers, GTL can declare assurance and payload hook refs without side-door runtime config, TS tenant proof owns the primary release gate, Python evidence is retained only as paused reference material, and ABG owns process actor truth, typed F_P stage carriers, and full retry frontier projection before downstream products consume them. | `T-088`, `T-089`, `T-090`, `T-091`, `T-092-TS`, `T-093-TS`, `T-094`, `T-095`, `T-096`, `T-097`, `T-098`, `T-099`, `REQ-R-ABG3-ASSURANCE`, `REQ-R-ABG3-PAYLOAD`, `REQ-L-GTL3-HOOKS` | Completed | `T-088`, `T-089`, `T-086`, `T-090`, `T-091`, `T-092-TS`, `T-093-TS`, `T-094`, `T-095`, `T-096`, `T-097`, `T-098`, `T-099` |
| `GOAL-008` | `GTL` + `ABG Runtime` + `Construction` + `Projection` | Realize the generic mixed-regime construction substrate that replaces downstream product outer loops. | ABG owns an installed construction runner over admitted construction intent; vector-local regimes drive mixed F_P/F_D/F_H traversal; observed workspace/register state is admitted and replay-visible; overlay frames are GTL-bound runtime contracts; F_D outcomes route by authority placement; construction pressure packages reproduce the load-bearing test35 behavior; dependency-ready fan-out is an admitted traversal opportunity that ABG may realize serially or bounded-parallel without product-local loop control; system parallelism keeps immutable semantic carriers over the shared workspace effect boundary. | `T-134`, `T-128`, `T-135`, `T-136`, `T-137`, `T-138`, `T-139`, `T-141`, `REQ-R-ABG3-FP-CONSCIOUSNESS`, `REQ-R-ABG3-SAGA-FRONTIER`, `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-PROJECTION`, `REQ-L-GTL3-GRAPHVECTOR`, `REQ-L-GTL3-EVALUATOR` | Completed | `T-134`, `T-128`, `T-135`, `T-136`, `T-137`, `T-138`, `T-139`, `T-141` |
| `GOAL-009` | `Product` + `Requirements` + `GTL` + `ABG Runtime` + `Projection` | Realize the first ABG/GTL requirements-algebra substrate that preserves WHAT pressure through graph-function traversal, evidence binding, assurance fold projection, residual pressure, and query. | Product and requirement law name requirements as replay-derived algebraic carriers; `RequirementLedger` is a projection over emitted requirement events, not a writable ledger; M03 design passes IACS and ODD execution-authority review; TypeScript first-slice carriers, admission, projection, fold/residual, completeness gates, query, and compatibility wrappers prove the T-204-derived materialization/postflight bug patterns without downstream migration. | `T-162`, `REQ-R-ABG3-REQUIREMENTS-ALGEBRA`, `REQ-L-GTL3-CONTRACT-LAW-API`, `REQ-R-ABG3-ASSURANCE`, `REQ-R-ABG3-PAYLOAD`, `REQ-R-ABG3-PROJECTION`, `M03_REQUIREMENTS_ALGEBRA_DERIVATION`, `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS` | Completed | `T-162` |
| `GOAL-010` | `Product` + `Install` + `Release` + `Runtime` | Make the shared product toolchain the only install and runtime resolution model for ABG and downstream ODD products. | Product, requirements, design, installer, resolver, runtime commands, and tests agree on one canonical selector: `ABG_TOOLCHAIN_ROOT` plus workspace binding truth. Target workspaces carry binding/provenance/config and mutable roots only; immutable package, command, docs, and standards payloads resolve through the selected versioned product manifest. Legacy aliases, target-local package copies, top-level command shims, and implicit target-root defaults fail closed. | `T-163`, `REQ-P-INSTALL`, `M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION`, `M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS`, `M04_SHARED_PRODUCT_TOOLCHAIN_DESIGN_MODULE_REVIEW`, `test:t163` | Completed | `T-163` |
| `GOAL-011` | `Requirements` + `GTL` + `ABG Runtime` + `Projection` + `Interface` | Wire and pin the downstream-consumable requirements-algebra route without turning T-162 symbols into a new carrier/function catalog. | Existing T-162 symbols are exposed through stable GTL/ABG route interfaces; GTL declaration/composition refs do not import ABG runtime code; downstream-public surfaces are declarations and read-only queries; ABG-runtime-internal admission/projection commands emit declaration, projection, evidence, fold, residual, and disposition truth on the traversal path; admitted refs are nominal and replay-verified; F_D cannot infer F_P/F_H semantic meaning; route proof rejects forged refs, boolean evidence, manual truth refs, query-lazy fold/residual/disposition, downstream-public emitters, and caller-supplied route truth. | `T-164`, `REQ-L-GTL3-REQUIREMENTS-ALGEBRA`, `REQ-R-ABG3-REQUIREMENTS-ALGEBRA`, `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN`, `test:t164` | Completed | `T-164` |
| `GOAL-012` | `Live Proof` + `Requirements` + `GTL` + `ABG Runtime` | Prove the completed T-164 requirements route through a Hello World live F_P steel thread. | A gated live test starts from GTL requirement declarations for a Hello World program, invokes a real F_P transport worker, executes the produced Hello World artifact, emits ABG requirement route facts through the runtime event stream, joins disposition over ABG continuation truth, and replays the lifecycle state without product-local ledgers, caller-supplied route truth, or prompt-side preconstruction of the Hello World source. | `T-165`, `test:t165:hello-world-live` | Completed | `T-165` |
| `GOAL-013` | `Proof` + `Projection` + `Downstream Consumption` | Publish the requirements-route replay proof as a downstream-consumable artifact without exposing ABG runtime-internal emitters. | A T-165 or successor proof run writes a digest-pinned route replay artifact and manifest containing serialized `requirement_route_fact_projected` events and replay-derived lifecycle state; downstream consumers can prove read-only consumption from that artifact while ABG keeps emission, admission, fold, residual, and disposition authority internal. | `T-166`, `test:t166`, `test:t166:live` | Completed | `T-166` |
| `GOAL-014` | `GTL` + `ABG Runtime` + `Requirements` + `Projection` | Close the ABI substrate gaps needed for odd_glc beyond route-1 closed-path consumption. | ABI publishes a non-closed requirements-route replay artifact with residual and continuation/re-entry truth; GTL ratifies requirement graph/refinement declarations; ABG admits/projects/folds/residualizes multi-requirement structure; span identity is stable across frame, zoom, recursion, foldback, and re-entry boundaries; recursive executive observation preserves obligation pressure without downstream product-local controllers. | `T-167`, `T-168`, `T-169`, `T-160`, `T-170`, `T-175` | Completed | `T-175` |
| `GOAL-015` | `GTL` + `ABG Runtime` + `Requirements` + `Projection` + `Release` | Earn the corrected full odd_glc ABI substrate closure under STDO/DMM. | T-167 proves every retained non-closed disposition branch through real emitted route events; T-169 proves recursive span identity across a nested traversal rather than first-traversal declaration projection; T-160 is invoked on a runtime path, admits live F_P findings through ABG, emits executive pressure facts through the event stream, and feeds ABG continuation without prompt-carried or fixture-injected answers; a corrected RC is cut and odd_glc is retargeted only after focused, live, semantic, install, and downstream smoke tests pass. | `T-170`, `T-169`, `T-160`, `T-175` | Completed | `T-175` |
| `GOAL-016` | `GTL` + `ABG Runtime` + `Actor/Operator` + `Proof` | Prove the remaining generic ABI runtime mechanics required by odd_glc Hello World ladder rungs that are not covered by rc16: multi-role proof evidence, non-default command execution, and long-running process/request execution. | ABI publishes live, event-sourced, replay-consumable proof artifacts for generic subject-artifact, verifier-artifact, and verifier-execution evidence roles; for declared command/cwd/env execution; and for declared process start, endpoint/env binding, request, response evidence, cleanup, fold, residual, and disposition truth. JavaScript, Rust/rustc, and service/request bindings are proof scenarios only; ABI owns no language, test, service, release, protocol, or acceptability policy. | `T-171`, `T-172`, `T-173` | Completed | `T-171`, `T-172`, `T-173` |
| `GOAL-017` | `GTL` + `ABG Runtime` + `Saga Frontier` + `Requirements` + `Proof` | Publish the upstream replay artifact required by the odd_glc parallel Hello World ladder rung without letting odd_glc synthesize branch, fan-in, evidence, fold, or lifecycle truth. | ABI publishes a live, digest-pinned, replay-consumable artifact that joins dependency-frontier branch/fan-in events with GTL requirement graph/refinement declarations, admitted branch and fan-in evidence, requirement fold/residual/disposition, and replay-derived lifecycle state. JavaScript branch artifacts and Hello World composition are proof bindings only; ABI owns no JavaScript, test, fan-in acceptability, scheduling, release, or downstream lifecycle policy. | `T-174` | Completed | `T-174` |
| `GOAL-018` | `GTL` + `ABG Runtime` + `Requirements` + `Live Proof` | Replace the T-167 installed non-closed artifact with a live execution-grounded non-closed requirements-route artifact for downstream consumers. | ABI publishes a digest-pinned live artifact where residual pressure and non-closed lifecycle disposition are caused by admitted evidence and live worker or executable-subject judgment, not by an in-test evaluator stub or answer-carrying requirement source. A closeable control scenario proves discriminating output, and odd_glc can consume the artifact read-only for T-014. | `T-175` | Completed | `T-175` |
| `GOAL-019` | `GTL` + `ABG Runtime` + `Registry` + `Design` | Define the GTL language capability model, current TypeScript HOW account, and spec-vs-implementation gap map. | Requirements define GTL language capabilities first, with publication inventory, runtime registry, system library, product library, ledger, projection, overlay, and selection terms as subordinate vocabulary; the current TypeScript carrier/API, semantic compiler, conformance, overlay, compute-notation, and proof capabilities are documented as HOW bindings; gaps are itemized before the live runtime registry lookup design proceeds under T-177. | `T-176` | Completed | `T-176` |
| `GOAL-020` | `GTL` + `ABG Runtime` + `Registry` + `Plugin` + `Design` | Design the live ABG runtime graph-function registry and lookup capability over GTL system and product libraries. | The TypeScript design pack and realization define registry admission, replay-derived projection, public read-only lookup, deterministic eligibility filtering, product-plugin-assisted candidate advice, ABG-emitted selection truth, system/product shadow prevention, ABG-owned startup pickup from product GTL declarations/config, runner-integrated registry selection before traversal effects, a live Hello World proof over the T-165 route with T-177 registry startup and selection ordering, and negative proofs that plugins or downstream startup shells cannot call graph functions, mutate registry state, bypass eligibility, select traversal, or create parallel registry truth. | `T-177` | Completed | `T-177` |
| `GOAL-021` | `GTL` + `ABG Runtime` + `Node Types` + `Composition` + `Release` | Publish reusable GTL node types and type-sensitive graph-function composition before odd_glc build-out. | GTL publishes reusable node types as non-callable identity `GraphFunction` entries with `Node.typeRef` carrier truth; composed types preserve or strengthen constituent obligations; explicit typed wiring composes differently named ports; ABG admits/projects node-type satisfaction and rejects node types at callable, selection, graph-call, and invocation boundaries; canonical ABG startup consumes product GTL node-type/library declarations and registry startup config; an installed GLC Hello World bootstrap proof runs through the live LLM worker from a snapshot-installed sandbox instance. | `T-180`, `test:t180`, `test:t177`, `test:t180:live`, `test:semantic` | Completed | `T-180` |
| `GOAL-022` | `ABG Runtime` + `Binding` + `Payload` + `Evidence` + `Instruction Rendering` | Realize causal carry in ABG instruction rendering before full instruction assembly work. | ABG binds admitted prior payload/evidence/artifact truth into the current edge instruction envelope when selected graph-vector, node-type, or asset-surface obligations require it; missing or digest-drifted causal evidence fails closed before weakened F_P dispatch; the proof demonstrates staged software-build traversal causality without a product-local prompt shell, prompt ledger, or broad new prompt carrier. | `T-182`, `test:t182`, `test:t182:live` | Completed | `T-182` |
| `GOAL-023` | `ABG Runtime` + `Semantic Compiler` + `Instruction Assembly` + `Transport` | Design and realize ABG instruction assembly law with semantic compiler assurance. | ABG compiles edge-bound instruction plans from existing GTL/ABG carriers; relevance, compression, proportionality, source trace, type coverage, authority coverage, response contract derivation, non-duplication, P0 no-dispatch, non-tautology, renderer authority, startup admission, runtime binding, prompt manifest replay, response admission, and evidence-only F_P validation traversal are F_D-proven as total functions over known algebras and admitted inputs before or during dispatch without product-local prompt shells or broad duplicate prompt carriers. | `T-183`, `REQ-R-ABG3-INSTRUCTION-ASSEMBLY`, `M03_INSTRUCTION_ASSEMBLY_DERIVATION`, `test:t183`, `test:t183:live` | Completed | `T-183` |
| `GOAL-024` | `GTL` + `ABG Runtime` + `Registry` + `Instruction Assembly` + `Live Proof` | Consolidate the release-facing Hello World proof into one installed sandbox live run over the full GTL/ABG stack. | A canonical `test:hello-world:live` creates a fresh sandbox, installs the latest ABI package snapshot, consumes product GTL declarations and startup config, admits node-type and graph-function library entries, selects the product graph function through ABG registry truth, opens graph calls, renders F_P prompts through ABG instruction assembly manifests, admits worker responses against derived output contracts, executes the generated Hello World artifact, and writes a digestable proof summary without a product-local prompt shell or duplicate truth surface. | `T-184`, `test:hello-world:live`, `test:t180:live`, `test:t182:live`, `test:t183:live` | Completed | `T-184` |
| `GOAL-025` | `GTL` + `ABG Runtime` + `Mapping` + `Traversal` | Ratify the corrected program abstraction before downstream odd_glc build-out continues: graph functions are reusable workflow library functions, graph overlays or GTL program compositions are programs, workspaces are mutable instance surfaces, and ABG traversal is the runtime bind over admitted program and workspace truth. | PRODUCT, INTENT, GTL graph-function law, language-capability vocabulary, and the mapping requirement agree on the library/program/workspace/runtime boundary; slot maps, local catalogs, workspace shells, and direct vector-call harnesses are classified as derived indexes or non-traversal unless rooted in admitted GTL declarations and ABG replay truth. | `T-185`, `REQ-M-GTL3-PROGRAM-TRAVERSAL`, traversal-monad strategy post | Completed | `T-185` |
| `GOAL-026` | `Install` + `Context` + `Toolchain Binding` | Make downstream target bootstrap a local reference/context operation over the selected installed ABG/GTL product version. | `REQ-P-INSTALL` distinguishes full product payload materialization from target workspace bootstrap; the TypeScript installer records version-owned ABG/GTL context evidence; `abg.install` writes `.abiogenesis/toolchain-binding.json`, refreshes context markers in `AGENTS.md`/`CLAUDE.md`, initializes `.ai-workspace`, and does not install a target-local GTL/ABG product payload. | `T-186`, `REQ-P-INSTALL`, `test:t076` | Completed | `T-186` |
| `GOAL-027` | `Semantic Compiler` + `GTL Program Conformance` + `Install Context` | Make compiler conformance reject drift in the installed context and program/startup shape before downstream projects reproduce local truth surfaces. | `REQ-M-GTL3-PROGRAM-TRAVERSAL` names semantic compiler guardrails; TypeScript conformance rejects direct graph-function public starts without overlay/program composition, rejects `abg.install` as traversal runtime, and rejects stale or mismatched installed context compression while admitting current context rows. | `T-187`, `REQ-M-GTL3-PROGRAM-TRAVERSAL`, `test:t159`, `test:t076` | Completed | `T-187` |
| `GOAL-028` | `Requirements` + `ABG Runtime` + `Instruction Assembly` + `Assurance` | Make admitted requirement pressure carry through into paired realization and proof obligations before closure. | ABG derives stable requirement obligation ids, projects paired realization/proof obligations, binds them into instruction assembly, admits realization and proof witnesses against the same source obligations, proves recursive graph-function calls as ABG traversal bind with foldback, and fails closure for missing proof, missing realization, role mismatch, weaker-contract proof, test-pass-with-uncovered-requirements, incomplete proof-policy depth, or unadmitted proof strength. | `T-188`, `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH`, `M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION`, `test:t188`, `test:t188:live` | Completed | `T-188` |
| `GOAL-029` | `Requirements` + `ABG Runtime` + `Instruction Assembly` + `Registry Selection` + `Release Claims` | Wire ratified dispatch and selection law into the live runtime path: instruction assembly mandatory and fail-closed on every F_P dispatch arm, non-tautology gated on every arm, registry eligibility computed from the registry universe plus vector constraints, and release narration aligned to closed-ticket truth. | Absent instruction-assembly startup at an F_P boundary resolves to blocked; a source-derived dispatch-site census covers seven instruction-binding sites, ten F_P regime branches, and both F_P yield sites; composed transform/consequence tasks and F_P evaluation-rule batches dispatch with admitted manifests; registry lookup treats absent vector constraints as unconstrained and rejects vector-excluded or non-conformant selected candidates; the RC4 claim paragraph matches shipped truth. | `T-189`, `REQ-R-ABG3-INSTRUCTION-ASSEMBLY`, `REQ-R-ABG3-SELECTION-APPLICATION`, `test:t189`, `test:semantic` | Completed | `T-189` |
| `GOAL-030` | `ABG Runtime` + `Instruction Assembly` + `Proof Hardening` | Replace the T-189 source-text dispatch census with runtime F_P dispatch enumeration and mutation differentials. | Every F_P-capable runtime arm is runtime-proven with an attached instruction prompt manifest and a missing/mutated-manifest rejection differential, or has a typed construct-and-block exemption; the latent singular `evaluation_rule_evaluate` effect is covered before it can become an unbound live F_P path. | `T-190`, `test:t189`, `test:t183`, `test:semantic` | Completed | `T-190` |
| `GOAL-031` | `GTL` + `Semantic Compiler` + `Conformance` + `Requirements` | Ratify the GTL authoring-loop meta-law: stable diagnostic IDs with admissible-repair sets, canonical authored data format with declarations-as-data law, contract-bound golden examples promoted from existing ABG ref families, declared underdetermination, declaration authorship, evolution vocabulary on the relation-kind family, and a seeded language conformance corpus. | Conformance diagnostics carry ratified stable IDs and typed repair sets with an unknown-ID rejection differential; a computed declaration fails conformance; one live edge binds golden instances feeding evaluator calibration and non-tautology material; undeclared holes produce typed diagnostics; the language-conformance-corpus seed passes against the TS tenant in the ratified format. | `T-191`, `REQ-L-GTL3-LAWS`, `REQ-L-GTL3-CONTRACT-LAW-API`, `test:semantic` | Completed | `T-191` |

## Wave Boundary

The completed ABG operator/control-plane wave covered:

1. `B-018`
2. `B-021`
3. `B-022`
4. `B-025`
5. `B-023`
6. `B-024`
7. `B-029`
8. `T-088`
9. `T-089`
10. `T-090`
11. `T-091`
12. `T-092-TS`
13. `T-093-TS`
14. `T-094`
15. `T-095`
16. `T-096`
17. `T-097`
18. `T-098`
19. `T-099`

Python tenant work from this wave is paused by the tenant registry. Existing
Python evidence remains reference material, but Python parity is not an active
RC gate while the release line is TS-primary.

The completed construction-substrate wave covers:

1. `T-134` completed requirements/design grammar
2. `T-128` completed installed construction runner
3. `T-135` completed vector-local regime resolution
4. `T-136` completed observed-state admission
5. `T-137` completed overlay-frame contract
6. `T-138` completed F_D authority placement
7. `T-139` completed construction pressure package substrate
8. `T-141` completed dependency-ready saga frontier substrate

`T-134` supplies the completed requirements/design grammar that all
implementation tickets bind to; it does not own parser/runtime/export
implementation before the runner shape is proven. `T-135` now supplies
vector-local regime resolution for mixed F_P/F_D/F_H traversal. `T-136` now
supplies replay-visible observed-state admission for workspace, register,
projection, event-watermark, and policy observations. `T-128` now supplies the
runner-owned construction step over admitted construction intent and mixed
F_P/F_D graph invocation. `T-138` now supplies severity-classified F_D
authority placement and pressure routing. `T-137` now supplies the generic
overlay-frame contract and projection. `T-139` now supplies the construction
pressure package substrate. `T-141` supplies dependency-ready saga frontier
truth and runtime-realization transparency so downstream dependency fan-out can
be admitted without forcing downstream async controller authority.

Downstream product follow-on work starts after this ABG wave lands and proves.
Immediate downstream consumer work is expected to consume ABG construction
runner truth, vector-local regime truth, observed-state refs, overlay-frame
truth, construction pressure packages, and dependency-frontier truth rather
than rebuilding those surfaces in product-local controller code.

The completed requirements-algebra wave covers:

1. `T-162` product/requirements reprice for ABG/GTL-owned requirements algebra.
2. `T-162` first-slice M03 design pack, including IACS, structural carrier
   diagram, worked trace, ODD execution-authority audit, and gap partition.
3. `T-162` TypeScript first-slice realization for event-sourced requirement
   payloads, replay-derived requirement ledger projection, edge requirement
   environments, evidence binding, fold/residual projection, deterministic
   completeness gates, query/read models, and retained-compatibility wrappers.

This wave does not implement `odd_glc`, T-160 executive observation,
downstream `odd_sdlc` ledger migration, or KAOS/ReqIF/GSN/GRL editor/import
surfaces. Those surfaces may consume the admitted substrate as successor work.

The completed shared product toolchain wave covers:

1. `T-163` product/requirements reprice for one install-resolution model.
2. `T-163` M04 design/IACS clarification for versioned product payload roots,
   workspace binding truth, and mutable state-root separation.
3. `T-163` TypeScript installer and CLI migration from optional shared mode to
   mandatory shared product toolchain resolution.
4. `T-163` regression proof that legacy env aliases, target-local product
   payload fallback, top-level command shims, and missing workspace bindings
   fail closed.

The completed requirements-algebra downstream-readiness wave covers:

1. `T-164` requirements audit and route-interface law for the downstream
   requirements-algebra route.
2. `T-164` public `gtl.requirements` and `abg.requirements` facade design over
   existing T-162 symbols, with no GTL-to-ABG runtime dependency.
3. `T-164` ABG-runtime-internal declaration admission, evidence binding,
   assurance-fold bridge, residual projection, disposition projection, and
   joined lifecycle read model.
4. `T-164` proof that downstream consumers can only declare/query and cannot
   emit fold, residual, or disposition truth.
5. `T-164` installed non-live runner proof that starts from GTL requirement
   declarations, emits requirement route facts through the ABG runtime event
   stream, joins disposition over ABG continuation truth, and projects
   lifecycle state from replayed events.

The completed Hello World requirements-route live-proof wave covers:

1. `T-165` a gated live F_P proof over the completed T-164 route.
2. `T-165` a minimal Hello World program artifact as steel-thread evidence,
   not as the product scope.
3. `T-165` proof that GTL declarations activate the route without a
   caller-supplied `RequirementRouteRuntimeContext`.
4. `T-165` proof that the live worker artifact, local Hello World execution,
   ABG evidence admission, requirement fold/residual/disposition emission, and
   replay query all agree.
5. `T-165` proof that the prompt carries admitted requirement source refs,
   source digests, and active requirement context into F_P without supplying
   the exact program source or prefilled fulfillment answer.

The completed downstream requirements-route proof-publication wave covers:

1. `T-166` a non-live schema and digest contract for serialized
   requirements-route replay artifacts.
2. `T-166` live T-165 artifact publication that records route replay events,
   route payload refs, lifecycle state, source metadata, and manifest digest.
3. `T-166` downstream consumption support for odd_glc Phase 5 without exposing
   ABG runtime-internal route emitters or requiring downstream caller-supplied
   route truth.

The ABI closure wave for downstream lifecycle scale is completed:

1. `T-167` earned installed non-closed route mechanics with residual pressure
   and continuation or re-entry disposition emitted by ABG.
2. `T-168` earned GTL requirement graph/refinement declaration law plus ABG
   admission/projection/fold/residual/query over multi-requirement structure.
3. `T-169` earned requirement span identity through traversal-derived
   ABG-emitted frame/zoom/foldback truth rather than hand-authored matching
   constants.
4. `T-160` earned recursive executive observer pressure preservation through a
   runtime path that consumes admitted worker disposition truth instead of
   marker-driven diagnostic refs.
5. `T-170` records the root-cause taxonomy for the late-stage algebraic
   violations and remains earned after the T-175 live-proof correction.
6. `T-175` replaces the T-167 installed fixture as the live proof-of-record for
   downstream non-closed route consumption.

This wave explicitly includes GTL. Requirement graph/refinement and lifecycle
composition structure must be declared through GTL contract-law surfaces; ABG
interprets and admits those declarations. Downstream products must not supply
that structure through local requirement compilers or local controller loops.
Span identity across recursion is also GTL/ABG work: GTL declares the stable
span and lineage refs; ABG admits, projects, folds, residualizes, and re-enters
over those refs without product-local span maps.

The refuted corrected-closure attempt is ABI TypeScript rc15:

- source commit `1af67e4dfe52297d4ba9513ddd6b54829debb2f6`;
- release snapshot commit `6c8a799383729b80bcaf1cce8bc709e16adc1a7c`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.15/`;
- `latest -> 4.1.0-rc.15`;
- tarball sha256
  `8313b6a82fb6852ebb52bce70ac84a74df8dce57f866aa236b25602a6cff6242`;
- odd_glc retarget commit `0997109`.

rc15 is cleaner than rc14, but it is not full odd_glc ABI substrate closure:
T-169 still proves matching over proof-authored lineage refs, and T-160 still
uses a marker-driven disposition path. A successor corrected RC must replace
that proof shape before odd_glc parity may treat the recursive substrate as
complete.

The earned corrected release is ABI TypeScript rc16:

- source commit `eec4090f64f5c95562732d6a67c7a52659feb3d4`;
- release snapshot commit `534dd3a5488b1603c45e1461d73ced7e0aea5653`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.16/`;
- `latest -> 4.1.0-rc.16`;
- tarball sha256
  `2e692cece027fcd43eae82042d4a12729dbd5a92c3077efb92c32cc0ccc8c1bc`;
- release snapshot manifest sha256
  `7d13aabee419f6ca8ca76442dbdd1b1e85eabb2b4c2a10c78cb6030807491085`;
- odd_glc retarget commit `8854735`.

rc16 is the first release cut in this wave that aligns source, snapshot,
install, live proof artifacts, and downstream provenance against the same
corrected recursive substrate.

The T-167 non-closed artifact is retained as installed route-mechanics
regression coverage. Its 2026-06-30 qualification is resolved by `T-175`, which
publishes the live proof-of-record:

- source run kind: `live_fp_non_closed_requirements_route`;
- control branch: `close`;
- non-closed branch: `no_close` with `continuation_available`;
- artifact digest:
  `sha256:fd4596f6c481ae957461cb7bc0222d6242052336d3d9bac2841ca10e2b0e501e`;
- replay event count: `36`;
- route event count: `9`.

Downstream consumers may claim non-closed lifecycle interpretation only against
the T-175 live artifact or a successor live artifact, not against the T-167
installed fixture alone.

The completed odd_glc ladder prerequisite wave covers:

1. `T-173` generic multi-role proof evidence, with a live JavaScript binding
   that records separate subject-artifact, verifier-artifact,
   verifier-execution, admitted evidence, requirement evidence binding, fold,
   residual, and disposition through ABG runtime truth. JavaScript test meaning
   is plugin/downstream policy, not ABI policy.
2. `T-171` generic non-default command execution, with a live rustc command
   binding that
   records cwd, env, command invocation, stdout/stderr/exit status, admitted
   evidence, requirement evidence binding, fold, residual, and disposition
   through ABG runtime truth. Rust/rustc meaning is a proof scenario binding,
   not ABI policy.
3. `T-172` generic long-running process/request execution, with a live service
   binding that records process start, endpoint/env binding, client request,
   response evidence, cleanup/termination, admitted evidence, requirement
   evidence binding, fold, residual, and disposition through ABG runtime truth.
   Service readiness and request acceptability are plugin/downstream policy, not
   ABI policy.

This wave exists because odd_glc shall not invent local execution, service
supervision, request admission, evidence binding, fold, residual, or
disposition authority for its JavaScript tenant/test, Rust CLI, and Rust
service Hello World ladder rungs. ABI owns only generic actor/operator,
admission, evidence-role, replay, fold, residual, and disposition mechanics.
Plugins and downstream declarations own language/toolchain/test/service
semantics and policy content. Those rungs are no longer upstream-blocked on
these three ABI mechanics after this wave's digest-pinned live proof artifacts.

The earned ladder-prerequisite release is ABI TypeScript rc17:

- source commit `682d0de2f154740e358a95be7e39cce4c40f5239`;
- release snapshot commit `59f15b33de417c0f7cf161d689d7ada6a68a4b0f`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.1.0-rc.17/`;
- `latest -> 4.1.0-rc.17`;
- tarball sha256
  `d07e8d6fa6d27de4ca959f5cf10af1ab922216df94d212521e0e144ce89283d9`;
- release snapshot manifest sha256
  `5f3d1706609c02f82b54218d74425a79da516a6a14378a659a9fbaf34b97165f`;
- release note sha256
  `7f2c1ade561834326aac57a20b9d278a88dba0537400ab3a954a6ad8902b777c`.

rc17 is the release cut for GOAL-016. It keeps rc16 as the recursive
requirements substrate and adds the generic actor/operator proof mechanics for
the odd_glc Hello World ladder prerequisites without assigning policy ownership
for JavaScript, Rust, services, HTTP, tests, or release readiness to ABI.

The completed parallel ladder-prerequisite wave covers:

1. `T-174` generic dependency-frontier plus requirements-route proof, with a
   live parallel Hello World binding that records branch runtime events,
   fan-in projection, branch/fan-in evidence, requirement graph/refinement,
   fold, residual, disposition, and replay-derived lifecycle state through ABI
   truth.

This wave exists because odd_glc shall not invent local branch scheduling,
fan-in, execution evidence, aggregate fold, residual, or disposition authority
for its parallel Hello World ladder rung. ABI owns only generic
dependency-frontier, admission, evidence, replay, fold, residual, and
disposition mechanics. Plugins and downstream declarations own branch content,
fan-in acceptability, JavaScript meaning, and lifecycle interpretation.

The completed reusable node-type and type-composition wave covers:

1. `T-180` reusable node types as non-callable identity `GraphFunction`
   publications with `Node.typeRef` carrier truth.
2. `T-180` composed node types that preserve constituent obligations and
   explicit `composeWithTypeWiring` for differently named typed ports.
3. `T-180` ABG registry, conformance, graph-call, invocation, and
   traversal-close guards that admit/project node types while rejecting them as
   callable traversal work.
4. `T-180` canonical installed startup pickup of product GTL declarations and
   product registry startup config, preventing downstream product-local shells
   from creating parallel registry or invocation truth.
5. `T-180` odd_glc readiness publication for downstream consumption:
   `.ai-workspace/comments/codex/20260630T161837Z_READINESS_odd-glc-node-types-and-bootstrap-registry.md`.

This wave exists because odd_glc should be able to define lifecycle node types,
overlays, product graph functions, and GTL bindings once and reuse them through
GTL/ABG rather than repeating inline node declarations or rebuilding local type
registries. ABI/GTL owns generic type, composition, registry admission,
selection, invocation, startup, and satisfaction mechanics. odd_glc and other
downstream products own domain names, overlays, prompt/policy content, plugin
behavior, and lifecycle interpretation.

The earned reusable node-type, instruction assembly, installed context,
semantic compiler guardrail, canonical live proof, and first requirement-proof
carry-through algebra release is ABI TypeScript `4.2.0-rc.4`:

- source commit `472dbebab90a4552e0cc30032b9e64d43136054b`;
- release snapshot commit `1a2eb5779c739d3c807cfb0733d89a00e1efa499`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.2.0-rc.4/`;
- `latest -> 4.2.0-rc.4`;
- tarball sha256
  `a5cb619c1eb3d3b51a88341b981011ea1bd1c49cc0311f328bda14a3b66b5eef`;
- release snapshot manifest sha256
  `82bd0448ad02ddb1dffee569eb0984cdc0c969abf36894a3236acf5b370f09de`;
- release note sha256
  `8cd6da8b0af3b1daaa4ab291542256b52f2231a343cf2de219abfb3f82638219`;
- installed sandbox/bootstrap live proof artifact inherited from RC3:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/canonical_hello_world_full_stack_live/20260702T191230832Z_pid95807/canonical-hello-world-full-stack-live-proof.json`;
- requirement-proof carry-through live proof artifact:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t188_requirement_proof_carry_through_live/20260703T201352116Z_pid47828/t188-requirement-proof-live-summary.json`.

The RC4 release snapshot was cut from clean source commit
`472dbebab90a4552e0cc30032b9e64d43136054b` with `sourceDirty: false`. RC4
preserves the RC3 canonical installed sandbox path, selected graph functions
through ABG registry truth, ABG-rendered instruction prompt manifests,
response admission, causal carry, generated artifact execution, and exact
stdout `Hello, world!\n`. RC4 adds the T-188 requirement-proof carry-through
carrier and admission algebra: digest-bound requirement/proof pairing,
candidate classification checks, depth-policy and proof-strength admission
checks, and fail-closed rejection for caller-provided weaker or incomplete
proof material. T-188 remains the active carrier for live fold gating, resolved
strength admission, coverage producer threading, and requirement-pressure
consumption on the runner close path.

The earned runtime dispatch and registry-selection wiring release is ABI
TypeScript `4.2.0-rc.5`:

- source commit `b9e5b10775a98abb8d9c8e93488637188681bea7`;
- release snapshot commit `6c53e4604b0af75d9e5c8124eba767dd6ae0d8f1`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.2.0-rc.5/`;
- `latest -> 4.2.0-rc.5`;
- tarball sha256
  `283fe1dff0d23ad6b33edc802425aaa4282a88d5dd8c7867094c6df598daabaa`;
- release snapshot manifest sha256
  `66f8ffee5fd5f9be1f7871a5c3e88df50bc61a342e38ea179cd6784847926dd6`;
- release note sha256
  `61a60d69100fee6e9bd5f06d4b4548a0149f7dd0c1135d79b8d3b808ad2fb33f`;
- verification: `test:t189` 5/5, `test:t177` 16/16, `test:t183` 16/16,
  `test:t188` 20/20, `test:semantic` 1039/1039, `git diff --check`, and
  `npm pack --dry-run`.

The RC5 release snapshot was cut from clean source commit
`b9e5b10775a98abb8d9c8e93488637188681bea7` with `sourceDirty: false`. RC5
adds the T-189 runtime law wiring: every live F_P dispatch arm binds admitted
instruction assembly or fails closed; scalar transform/evaluate, composed
transform/consequence, and evaluation-rule batch dispatches are covered by a
source-derived dispatch-site census; registry lookup starts from the registry
universe, treats absent vector constraints as unconstrained, and rejects
selected candidates excluded by vector constraints or registry eligibility
rather than self-confirming from the selected entry.

The post-RC5 dispatch-review record release is ABI TypeScript `4.2.0-rc.6`:

- source commit `f38168358e31d9bb4181b5b47fd24c5f44557c6a`;
- release snapshot commit `ec329750c9c0b200cad23073eaab7e6863832ba4`;
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.2.0-rc.6/`;
- `latest -> 4.2.0-rc.6`;
- tarball sha256
  `e28cb3d8840f4e7c1dfb104142ef2a4303cf414225c5346111954a3c466507d3`;
- release snapshot manifest sha256
  `7e59b26f00b2dd2d33729016919f472fae91fac84b03ea84661ba3c7d5c2a7e5`;
- release note sha256
  `1b559fe538413e19e897b737325bef39bb56fac6c6fc566e0e65158bdbc50407`;
- verification: `test:t189` 5/5, `test:t177` 16/16, `test:t183` 16/16,
  `test:t188` 20/20, `test:semantic` 1039/1039, `git diff --check`, and
  `npm pack --dry-run`.

The RC6 release snapshot was cut from clean source commit
`f38168358e31d9bb4181b5b47fd24c5f44557c6a` with `sourceDirty: false`. RC6
preserves the RC5 runtime wiring behavior and adds the post-RC5 DMM review
record to release source: T-189 records the review disposition and surviving
successor item, T-190 tracks replacement of the source-text dispatch census
with runtime F_P dispatch enumeration and mutation differentials, T-188 names
the startup-carried depth/strength/dependency boolean hazard as a non-closure
condition before fold gating, and GOAL-030 keeps that proof-hardening work
active. RC6 does not reprice `REQ-R-ABG3-SELECTION-APPLICATION-006`: absent
vector or edge registry constraints remain intentionally unconstrained.

The carry-through, dispatch-enumeration, authoring-loop, and standing-gate
release is ABI TypeScript `4.2.0-rc.7`:

- source commit `abe61eb11fc79f69730ddf8a4b269f83b7fd77d9` (`sourceDirty:
  false`);
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.2.0-rc.7/`;
- `latest -> 4.2.0-rc.7`;
- tarball sha256
  `9c452c9b10bc8fde3206be9970ba3da9522be9e83163dc7b90970676e32d9c43`;
- release snapshot manifest sha256
  `d394d50c0a68cec5c715c1fecbc1da8955f7f45a9c2eeec8955485e525bd51ae`;
- release note sha256
  `a28a651d4faa255f6dccd3b0318839a7ba87c73e64a04fbb7fc48838fd340a1b`;
- verification at the source commit: `test:semantic` 1073/1073, `test:t188`
  31/31, `test:t189` 11/11, `test:t191` 14/14, `test:t183` 16/16,
  `test:t177` 16/16, `git diff --check`, `npm pack --dry-run`;
- live gates at the source commit: standing installed-sandbox gate
  `test:t194:sandbox-live` 1/1 with `t194-gate-classification.json`
  `{ sourceClean: true, releaseGrade: true }` (run
  `test_env/test_runs/t194_feature_matrix_live/`, earn-commit run), and
  canonical `test:hello-world:live` 1/1.

RC7's closure claim is scoped by `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038`:
coverage-gated closure on DECLARED carry-through edges; undeclared edges
with active obligations are a typed transitional state retired by the
mandatory witness migration (named successor, not an RC7 claim).

The runtime self-enforcement release is ABI TypeScript `4.2.0-rc.8`:

- source commit `50a1eaa47e4cdb8c63ec0fa904d32d2671f865d4` (`sourceDirty:
  false`);
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.2.0-rc.8/`;
- `latest -> 4.2.0-rc.8`;
- tarball sha256
  `d1dfb2fcdf292c76b981fc40d9c3b93290f5ec4853b45f1f126cc190faf3bec6`;
- release snapshot manifest sha256
  `6c57177d24d9f104cae76f9a228cd7cc744800bcfd0b82ba74677023464216dd`;
- release note sha256
  `a97199d2f8c7301e36409cab69f6baa80d115d841ae3983ca060424dd1bc8f56`;
- verification at the source commit: `test:semantic` 1092/1092 (including
  the T-192 temporal-property lane 14/14 and the T-193 constitutional
  drift real-tree witness 5/5), `test:t188` 31/31, `test:t189` 11/11,
  `test:t191` 14/14, `test:t183` 16/16, `test:t177` 16/16,
  `git diff --check`, `npm pack --dry-run`;
- live gates at the source commit: standing installed-sandbox gate
  `test:t194:sandbox-live` 1/1 with `{ sourceClean: true, releaseGrade:
  true }` (the run carried the five standing temporal gates live: all
  satisfied, dispatch gate witnessed, liveness completion-decided) and
  canonical `test:hello-world:live` 1/1.

RC8 publishes runtime self-enforcement: the five standing audit gates as
declared per-run temporal properties (T-192) and constitutional drift as
a typed compiler diagnostic (T-193) — this cut is the first supervised by
its own drift gate (a version bump without bootstrap propagation is a red
suite). RC8 preserves every RC7 claim including the
`REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038` closure-claim scope.

The downstream-driven root-cause release is ABI TypeScript `4.2.0-rc.9`:

- source commit `dd45c381e40470c7b4240f4fb0db6e180c20e19f` (`sourceDirty:
  false`);
- release snapshot `release_snapshots/abiogenesis-typescript-tenant/4.2.0-rc.9/`;
- `latest -> 4.2.0-rc.9`;
- tarball sha256
  `008ce3ef88c8130dc2d1943c5227429073e6671af8b62d9ec0a50661c7b8709b`;
- release snapshot manifest sha256
  `4b60090e651c4236f03a8c382a34183ba8ee817bc361eeb986880a0a5789ba02`;
- release note sha256
  `37225e1455886360536db1b83fb2ef50e5413d6a5fc42b8decccea9a8fbf43b7`;
- verification at the source commit: `test:semantic` 1093/1093, `test:t188`
  32/32 (including the plan-declared causal-excerpt-bound differential),
  `test:t189` 11/11, `git diff --check`, `npm pack --dry-run`; standing
  gate `test:t194:sandbox-live` 1/1 `{ sourceClean: true, releaseGrade:
  true }`.

RC9 carries two root-cause fixes driven by the odd_glc T-030 data-mapper
live campaign: `causalExcerptMaxChars` as fail-closed plan policy (a
hardcoded 12k render ceiling starved product-scale admitted content and
forced a lawful worker refusal at the test-design stage), and
`ABG_TS_CODEX_MODEL` adapter ingress for the codex worker model. All RC8
claims preserved.
