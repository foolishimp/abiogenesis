# HANDOFF: ABIogenesis 5.0 After T-265, Before T-266

- timestamp_utc: 2026-07-12T18:05:35Z
- handoff_owner: codex
- governing_goal: GOAL-035 stable ABIogenesis 5.0 baseline
- current_delivery_boundary: DS-1 prerequisites
- last_closed_leaf: T-265
- next_leaf: T-266
- implementation_state: no T-266 product edits started

## Purpose

This post is the restart surface for the next Codex context. It records the
current authority, the failure patterns that already caused material delay, the
process that is now working, the exact repository state, the T-266 realization
map, and the remaining dependency sequence.

Do not reconstruct the plan from old T-218 prose, the rejected Consensus
implementation, the provisional T-252 body, or the Claude status board alone.
Those are historical or derived surfaces. Start from live specification,
accepted designs, active tickets, this handoff, and the current tree.

## Ratified Direction

The following F_H rulings govern all remaining 5.0 work.

1. ABIogenesis 5.0 is the stable product baseline. It is developed conventionally
   in the current source project and must be specification-method ready and
   compliant.
2. Recursive dogfooding does not build or qualify 5.0. Dogfooding begins after
   the stable 5.0 release, with odd_glc 1.0 over installed 5.0 used to build the
   5.0.1 successor.
3. Consensus is Tier 1 and is in 5.0. It is the refinement organ in the
   homeostatic ticket loop and must be invocable by an agentic builder through
   the ordinary `abg.cli`/`catalog.invoke` GraphFunction path.
4. Consensus is not engine law. The 5.0 product feature is the uplifted public
   ABG/GTL atom set. Consensus is the first shipped free construction and
   reference stdlib GraphFunction proving those atoms suffice.
5. The Consensus body must be pure GTL data over public atoms and public catalog
   paths. A consumer must be able to author an equivalent function without a
   private import, plugin interception, scheduler, shell loop, or hidden
   controller.
6. The complete 5.0 product includes later-phase public F_H interaction,
   workflow.C, typed HOF/batch, retry, recurse, the retained operator surface,
   compliance, and release qualification. "Stable first" is not permission to
   cut the product to a self-hosting proof or defer the primary product workflow.
7. Every code-bearing stage requires an accepted three-view Mermaid design:
   domain model, sequence diagram, and lifecycle state machine. Code is then
   reviewed against the cross-view axioms before the next stage begins.
8. Work proceeds by substantive design and implementation, not ticket churn.
   Update a ticket when authority, a real typed gap, dependency routing, or
   closure changes. Do not create paperwork to simulate progress.
9. The threat model is a trusted single-developer desktop. Defend likely
   malformed LLM-authored GTL in native types, raw admission, and the semantic
   compiler. Defend likely malformed F_P output at its typed admission boundary.
   Do not add hostile in-process, filesystem-tamper, cryptographic, or
   multi-tenant hardening without a changed threat model.
10. Risk management means proportionate hedging. A hedge against an unlikely
    failure that complicates the likely path is technical debt.

## Current Repository State

### Main

- repository: `/Users/jim/src/apps/abiogenesis`
- branch: `main`
- pushed head before this post: `b6f0db6` (commentary-only drift callout and
  board update)
- last T-265 product commit: `c3b9d0b`
- remote: `origin/main`
- T-265 main commits:
  - `d62b434 feat(gtl): add canonical graph function applications`
  - `c3b9d0b feat(gtl): close canonical combinator applications`
- accepted-design checkpoint: `9ad45d2`

T-265 is closed and pushed. Its clean isolated proof state was:

- direct T-265: 21/21
- standing GTL law: 75/75
- full semantic: 1552/1552
- lint and GTL authority guard: green
- packed/publication differential: 13/13
- generated publication: 33 assets over 1014 immutable payload files
- public schemas: 63 verified
- package dry-run: green
- independent closure review: no blocker, high, or medium finding

After `b6f0db6` claimed that the committed T-265 state was red, the exact
product tree was rechecked in the clean isolated worktree on this handoff:

- `npm run test:t223`: 70/70 passed, including checked-in publication parity,
  packed candidate, generated schemas, and source-blind SDK/CLI lanes
- `npm run test:t250`: 13/13 passed, including the T-195 documentation/version
  census

The callout was produced from the contaminated main worktree, which contains
untracked provisional T-252 source and user-owned documentation. It is not
evidence that `c3b9d0b` is red and does not create a product fix-forward before
T-266. Preserve the callout as commentary lineage, but do not implement its
publication or README repairs against the clean product tree.

T-265 closure evidence:

- `.ai-workspace/tickets/completed/T-265-close-canonical-graph-function-combinator-applications.md`
- `build_tenants/abiogenesis/typescript/design/M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md`
- `.ai-workspace/comments/codex/20260712T175525Z_SELF_REVIEW_t265_canonical_graph_function_applications.md`

### Isolated Continuation Worktree

- path: `/Users/jim/src/apps/abiogenesis-t266-stage`
- branch: `codex/t266-stage`
- head: `a4b8e2c`
- status: clean except the intentional untracked
  `build_tenants/abiogenesis/typescript/node_modules` symlink

The isolated branch has the same T-265 product content as main but not the
Claude progress-board commit. Continue T-266 here. Never stage the node_modules
symlink.

### Main Worktree Exclusions

The main worktree contains pre-existing user/Claude work. Do not edit, delete,
stage, commit, or use it as T-266 closure evidence:

- modified `build_tenants/abiogenesis/python/design/abiogenesis.code-workspace`
- modified `docs/README.md`
- untracked `.ai-workspace/tickets/active/T-267-author-governed-ai-software-construction-manuscript.md`
- untracked `docs/GOVERNED_AI_SOFTWARE_CONSTRUCTION.md`
- untracked `docs/GOVERNED_AI_SOFTWARE_CONSTRUCTION.pdf`
- untracked self-build design files under
  `build_tenants/abiogenesis/typescript/design/M02_M04_SELF_BUILD_*`
- untracked provisional T-252 Consensus body, census, tests, tool, and type
  tests under the TypeScript tenant

The dirty `docs/README.md` can make a main-worktree suite report a 5.0.1 claim
failure. That is not a T-265/T-266 defect. Run closure gates in the clean
isolated worktree and leave the user-owned file untouched.

The untracked T-252 body is provisional invalid evidence from before T-265 and
T-266. Do not patch it into conformance and do not stage it accidentally. After
T-266 closes, re-author the body from the accepted T-252 design and public atoms,
then generate a new census. Old digests, counts, and diagnostics are non-evidence.

## Failure Patterns To Prevent

### F-1: A GraphFunction Nameplate With An Imperative Body

The rejected commit `945b5a2` put a GraphFunction catalog identity in front of
1,363 lines of TypeScript plugin orchestration. Fan-out was a TS loop, rounds
were plugin retries, prompts were local string templates, and closure was
plugin-owned. There was no graph.

This violated the PRODUCT atom criterion, ODD Method, Scenario 09, and the
accepted T-244 delivery boundary. It also bypassed the algebra and concealed
the exact workflow.C, batch, retry, and recursion gaps the build was intended
to discover. The code was reverted by `2c85a88`.

Tripwire: before reviewing secondary admission rigor, ask the category question:
"Is the constructive carrier an admitted GTL graph body?" If the answer is no,
stop. Do not review the imperative substitute into acceptability.

### F-2: Formalizing F_H Language Into A Different Product

T-218 translated phrases such as "ABG builds ABG", "self-hosting", and
"feature-complete" into a release ladder the user did not intend. Two agents
reviewed the formalization without forcing an early read of the load-bearing
closure paragraph.

Tripwire: the product meaning must be visible in the short closure paragraph,
the exact feature row, and the three diagrams. When a phrase could imply two
products, persist the user's words verbatim and obtain disposition before code.

### F-3: Holistic Operator Classification Instead Of Algebraic Construction

The T-217 detour treated whole vectors as globally F_P or F_D and proposed new
dispatch routing. The system is composed from typed nodes, graph functions, C
terms, evaluators, and traversal law. Regime and behavior derive from those
atoms; they are not a second holistic taxonomy attached by the host.

Tripwire: first state the algebra and type relation. Use native types as far as
they can prove local relations. Let the semantic compiler diagnose erased or
global gaps. Do not add a parallel carrier because an LLM misunderstood the
structure.

### F-4: Adversarial Hardening Beyond The Product Threat Model

T-217 spent repeated review rounds on caller-supplied plugin misuse,
tamper-resistant archives, symlink attacks, and hostile in-process behavior
before the sunny-day campaign ran. Some evidence-integrity fixes were real;
the unbounded hostile hardening was not proportionate to a single developer
desktop.

Tripwire: attach a probability and consumer consequence to each defense. For
5.0, prioritize malformed GTL and malformed F_P results. A low-probability
defense that expands authority or delays the actual path is deferred unless it
protects release evidence directly.

### F-5: Reviewer Approval Replacing Ticket Closure

T-217 drifted into "keep fixing until Codex approves" instead of closing its
stated live campaign condition. This made review unbounded.

Tripwire: a phase has finite objective gates. Self-review finds drift and
defects, but reviewer approval is not an open-ended product goal. Fix findings
inside the accepted boundary, run the declared gates, and act on the closure
condition.

### F-6: Derived Data Becoming A Second Authority

T-265 initially reconsidered copied composition declarations under every
lineage owner. One successful interpretation suppressed the same declaration's
failed owner. This silently reclassified inherited truth as result-local truth.

Tripwire: derive provenance from containment and adjacent source relations.
Never iterate candidate authorities and keep whichever interpretation succeeds.
No success-over-failure suppression, nearest-owner convention, name inference,
or duplicated authored lineage.

### F-7: Phantom Native Generics

The current pre-T-266 APIs allow calls such as
`cInterfaceCarrier<T>(nodes)` and `hofContract<T>(node)`. The caller chooses
`T` independently of the actual Node. A matching generic or carrier string is
not a Node/type proof.

Tripwire: one trusted decoder introduces a concrete native type. Constructor-
owned private brands bind it to the exact admitted Node ref and full contract
key. Interfaces retain exact ordered tuples. Generic carriers and ordinary C
terms cannot impersonate Node-backed relations.

### F-8: A Feature-Specific Atom

The atom work exists because Consensus exposed generic gaps. T-253, T-254, and
T-265 correctly use Scenario 09 and contain zero Consensus vocabulary in their
generic implementation paths.

Tripwire: every atom has a non-Consensus fixture and a zero-vocabulary scan.
Consensus may consume the atom later but cannot define the atom's API,
diagnostic, branch, or identity.

### F-9: Stale Generated Publication After A Final Build

T-265 twice showed the ordering hazard: code or a final build changed packaged
JS after the product manifest was generated. Packed tests correctly refused the
stale manifest.

Tripwire: make all product edits first, run the final host build, then generate
public schemas and product publication, then run packed checks and the full
suite. Do not rebuild product JS after final publication without regenerating.

### F-10: Dirty-Tree Ride-Alongs

The source tree routinely contains user, Claude, generated, and provisional
work. A broad add/commit can silently mix authorities and invalidate review.

Tripwire: implement in a clean isolated worktree. Stage explicit files. Check
`git diff --cached --check`, staged names, and generated assets. Cherry-pick the
closed commits to main. Re-check main dirty files before push.

### F-11: Attributing A Dirty-Workspace Failure To A Commit

The `b6f0db6` callout labeled `c3b9d0b` red after running gates in a workspace
that also contained provisional T-252 code and user documentation. The same
product tree passed T-223 70/70 and T-250 13/13 in the isolated worktree. A
working-tree observation was incorrectly promoted to a commit verdict.

Tripwire: any claim that a commit is red must reproduce from a clean checkout
of that commit, or identify the exact dirty paths as part of the test subject.
Never route a product repair from a contaminated test without a clean
differential. Comments and boards report observations; they do not override the
reproduced product state.

## The Process That Is Working

Use this loop for every remaining code-bearing leaf.

1. Read live authority in order: GOALS, INTENT, PRODUCT, requirements, accepted
   design, ticket, local AGENTS/CLAUDE.
2. Restate the singular boundary and explicit non-scope in implementation
   terms. Stop if the code would require a new domain entity, controller,
   authority, state, or transition absent from the accepted diagrams.
3. Verify the three Mermaid views and cross-view axioms before editing.
4. Implement in the clean isolated worktree. Keep generic atoms free of
   Consensus vocabulary and runtime behavior.
5. Add native/type, raw-admission, semantic-compiler, and public-package proofs
   in proportion to the boundary. Prefer impossible states in the native type
   system and global/erased contradictions in M03.
6. Run the focused gate and standing upstream regression gates.
7. Perform a category-first self-review against domain, sequence, state, and
   axioms. Ask whether the correct carrier exists before reviewing defensive
   details.
8. For nontrivial ownership or authority work, run one independent review with
   concrete reproductions. Fix findings inside the accepted boundary.
9. Run lint, authority guard, public API, generated publication, packed
   candidate, package containment, Mermaid, diff, and full semantic gates.
10. Write a durable self-review post. Update and move the ticket only when its
    closure conditions are actually satisfied.
11. Commit only the leaf. Cherry-pick to main, verify unrelated dirt is intact,
    push, and then start the next leaf.

T-265 proved this loop works. Its initial semantic tests were green while six
real design defects remained: copied owner reclassification, ordinary
cross-host bypass, JavaScript property order becoming native law, loss of the
typed result-identity diagnostic, blank vector member admission, and duplicate
vector ownership. Self-review and independent reproduction found them before
checkpoint; all were fixed and the full suite then passed.

## Next Leaf: T-266

### Authority

- ticket:
  `.ai-workspace/tickets/active/T-266-close-native-node-interface-type-witness.md`
- accepted design:
  `build_tenants/abiogenesis/typescript/design/M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md`
- change class: `design_reframe`
- no requirement reprice is currently needed

### Singular Boundary

T-266 closes the native relation:

```text
trusted native decoder d : unknown -> T
ordinary admitted Node n -> exact full nodeContractKey(n)
TypedNode<T> := private constructor-owned projection of d, n, and key(n)
TypedInterface<Value, ExactNodes> := exact ordered non-empty TypedNode tuple
CInterfaceCarrier and NodeBackedCProgramTerm := nominal Node-backed relation
```

Canonical Node, GraphVector, GraphFunction, Module, C terms, and HOF declarations
remain pure non-generic GTL data. Decoder functions, TypeScript types, private
brands, wrapper names, and invariants never serialize.

### Mandatory T-266 Realization Guards

1. The decoder is the one trusted native assertion point. Reject inferred
   `any`, `unknown`, and `never` statically. Do not claim the decoder proves a
   symbolic SchemaRef, do not invoke it against worker output, and do not invent
   a pre-DS-4 schema contract.
2. Node identity and TypeScript value type are different facts. Two different
   Nodes may decode to the same `T`. Static types reject different value types,
   tuple order, and cardinality. Runtime/native admission must reject same-type
   foreign, missing, added, or reordered Node refs and full contract keys.
3. Private unique-symbol brands are module-private and non-exported. Public
   object literals, generic carriers, matching strings, and ordinary C terms
   cannot mint witnesses. Prove this through the packed public package, not
   source-relative tests alone.
4. Preserve the Node-backed brand across all seven serialized C generators:
   of, id, compose, edge, workflow.C, batch, retry. Do not add an eighth
   generator or a second serialized term shape.
5. A separate `nodeC` namespace is allowed, but it is insufficient by itself if
   branded terms can enter ordinary `C.compose`, `C.edge`, `C.batch`, or
   `C.retry` and silently return an ordinary unbranded term. Either overload the
   canonical constructors to preserve the brand or make generic fallbacks
   statically and dynamically refuse branded operands. A brand downgrade is
   non-closure.
6. Rebind canonical T-265 `fan_in`. The current
   `fan_in(reducer: GraphFunction, over: Node)` API is an untyped Node-backed
   escape hatch. The final API must consume exact witnessed reducer and vector
   boundaries and preserve the relation required by later workflow.C use.
7. Close the symbolic reducer gap in M03. T-265 currently checks
   `operand.template.graph.inputs == [over]` only for inline reducers. A
   symbolic reducer whose ordinary `inputs` differ from the declared fan-in
   vector must be `invalid_program`, not `semantic_not_realized`.
8. `bindGraphVectorCProgram` is a native proof, not a selector or program-
   identity authority. A C term has no `programRef`. `declareCProgram` supplies
   program identity and the existing T-254 `abg.hog_program_ref` remains the
   sole serialized selector. Do not invent a second key or derived program id.
9. Keep `Node.typeRef` optional and preserve its existing strengthening law.
10. M03 recomputes ordinary refs, full Node keys, ordered interface refs, C
    carrier refs, and HOF relation refs. It never reconstructs TypeScript `T`.

### Minimal Product File Map

1. Add
   `build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/native_node_witness.ts`.
   It owns private TypedNode/TypedVectorNode/TypedInterface brands, trusted
   decoder type utilities, exact tuple utilities, constructors, Node key/digest
   derivation, and internal assertion/read helpers.
2. Modify `gtl/m01/algebra/c_algebra.ts` to retire
   `cInterfaceCarrier<T>(Node[])`, require witnessed interfaces, add nominal
   Node-backed GraphFunction refs, preserve branded terms across all seven C
   constructors, and add the exact GraphVector binding proof.
3. Modify `gtl/m01/algebra/hof.ts` so `hofContract`, `hofVector`,
   `hofUnaryRef`, fan-out, and fan-in derive native types only from witnessed
   Nodes and compare exact refs plus full keys.
4. Modify `gtl/m01/algebra/index.ts` to export constructors and opaque types,
   never brand symbols or internal assertion tokens.
5. Modify M03 only where current identity checks are actually short. Reuse
   T-253 HOF and T-254 vector/program compilers. Add exact workflow boundary
   comparison if absent and the symbolic fan-in input/vector check. Do not add a
   new compiler subsystem.
6. Migrate the bounded existing test consumers. Current approximate call counts
   are: cInterfaceCarrier 12, hofContract 11, hofVector 17, hofUnaryRef 8,
   cGraphFunctionRef 6. No production-code consumer currently uses the unsafe
   routes.
7. Add T-266 focused JS/type/public-package proofs and package scripts. Update
   the test-surface map and generated publication only after implementation is
   final.

### T-266 Proof Matrix

Static native proofs must reject:

- decoder return `any`, `unknown`, or `never`
- ordinary Node passed to a typed API
- structural witness literals
- wrong C composition middle
- wrong GraphFunction boundary witness
- wrong fan-out member/vector pair
- wrong fan-in reducer/vector pair
- reordered, shortened, lengthened, or widened multi-source tuple
- zero- or multi-Node GraphVector target
- generic `CCarrier` at a Node-backed boundary
- ordinary `CProgramTerm` at a Node-backed binding
- any seven-constructor brand downgrade

Native runtime proofs must reject:

- same-TypeScript-type but foreign Node refs or full keys
- malformed Vector member relation
- wrong ordered GraphFunction boundaries
- wrong GraphVector source order/cardinality or target
- structural/erased brand forgery
- mixed branded and ordinary C terms

Serialization/raw/M03 proofs must show:

- ordinary GTL bytes are unchanged
- decoder, type, brand, invariant, and wrapper fields never serialize
- raw admission never mints a native witness
- mutated Node ref/key/order, C carrier ref, HOF ref, workflow boundary, or
  symbolic fan-in relation is `invalid_program`
- a lawful missing runtime consumer remains the separately owned
  `semantic_not_realized` gap

Public package proof must install/consume the packed candidate and confirm the
private brands remain unnameable through published `.d.ts` surfaces.

Genericity proof uses Scenario 09:

- `LabObservation -> NormalizedObservation`
- scalar TypedNodes
- Vector witnesses
- a three-source exact readonly tuple
- all seven Node-backed C constructors
- HOF relations
- zero Consensus vocabulary in generic implementation and fixture identities

### T-266 Explicit Non-Scope

- Consensus body, schemas, profiles, prompts, reducers, or runtime
- JSON Schema publication or decoder certification
- worker/F_P payload validation
- C/HOF execution, scheduling, retries, recursion runtime, events, or replay
- global generic Node/GraphFunction ontology
- mandatory typeRef
- hostile witness forgery, crypto, filesystem, or process isolation
- closing T-255/T-259..T-262 runtime gaps

## Delivery Sequence After T-266

Do not reorder this chain by convenience.

1. Close T-266 with its self-review, independent review, full gates, commit,
   main cherry-pick, and push.
2. Re-enter T-252. Re-author the held Consensus body as pure GTL using only
   public atoms. Do not salvage the provisional body by presumption.
3. Admit the corrected body and persist the frontier compiler gap census. This
   is the uncertainty-collapse point. A frontier census can expose inner gaps
   after an outer gap closes; do not assume monotone counts.
4. Close DS-1 admission/conformance prerequisites T-263 then T-264. T-255 is
   currently dependent on T-264.
5. Rework and accept the three-view designs for the DS-2 spine, then implement
   T-255 execution handoff, T-256 declared context join, T-257 F_P result
   contract admission, and T-258 public F_H hold/act/resume.
6. Design and implement runtime atoms T-259 workflow.C, T-260 typed HOF and
   C.batch, T-261 C.retry policy/runtime, and T-262 typed recurse
   policy/runtime. Recompile the same body after each atom and require the
   expected gap to disappear without Consensus-specific runtime code.
7. Run the atom-uplift proof: Consensus is the first free construction and may
   use only public atoms and public catalog paths. Qualify converge,
   recurse-on-dispute, round-limit/F_H escalation, attributed profiles, and
   named/alternate/temp workspace applications through ordinary catalog invoke.
8. Complete the retained 36-operation product surface and associated public
   schemas/capabilities.
9. Run T-247 compliance only after features close.
10. Cut 5.0.0 through T-248 only after compliance and release qualification.
11. Retarget and mature odd_glc to 1.0 over exact installed 5.0.
12. Begin dogfood scaffold/pilot and build 5.0.1 as the first GLC project.

Current active leaf states at handoff:

| Ticket | State |
|---|---|
| T-252 | corrected design accepted; body blocked on T-266 after T-265 closure |
| T-255 | design rework required |
| T-256 | design rework required |
| T-257 | design rework required |
| T-258 | three-view design required |
| T-259..T-262 | three-view design required |
| T-263..T-264 | three-view design required |
| T-266 | accepted design; realization is the next code leaf |

## Stop Conditions

Stop and return to design/F_H only if one of these occurs:

- T-266 requires a new canonical GTL carrier, serialized selector, generator,
  controller, runtime state, or public schema authority not present in the
  accepted diagrams.
- A Node-backed brand cannot be preserved without changing the seven-term C
  algebra or exposing a public assertion token.
- The final fan-in witnessed relation cannot be expressed within the accepted
  Node/HOF/interface carriers.
- The corrected Consensus body requires a private path or a Consensus-shaped
  atom after T-266.
- A compiler gap contradicts PRODUCT or a requirement rather than exposing a
  missing realization.

Do not stop for ordinary implementation difficulty, source-breaking migration
of the explicitly retired unsafe APIs, generated-publication churn, or a
proportionate focused defect. Fix those inside the accepted boundary.

## Resume Commands

```bash
cd /Users/jim/src/apps/abiogenesis-t266-stage
git status --short
git log -5 --oneline
sed -n '1,360p' .ai-workspace/tickets/active/T-266-close-native-node-interface-type-witness.md
sed -n '1,980p' build_tenants/abiogenesis/typescript/design/M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md
cd build_tenants/abiogenesis/typescript
npm run test:t265
npm run lint:semantic
```

Before the first edit, restate the T-266 singular boundary and the two P0
guards: witnessed canonical fan-in, and symbolic-reducer M03 equality. After
the last product edit, build first, generate publication second, then run packed
and full gates.

## Handoff Verdict

Direction and process are now sound. T-265 demonstrated that the design-first,
three-view, self-review, independent-reproduction loop catches category and
ownership defects that a green adjacent test suite misses. Continue that loop.

The immediate task is T-266 only. No T-266 implementation has started in this
handoff context. The next context has a clean worktree, an accepted design, a
bounded file map, explicit type/runtime/compiler proof obligations, and named
tripwires against every known failure mode.
