# T-287 Default Governance Library

Accepted HOW under `execution.md#s5-acceptance-and-implementation-grant`. Exact STDO v2.5.1-rc.1; Product/Design/Owner, Reuse/Foundation and End-To-End Interface Integration. Source proposal SHA-256 `f9e7f51a2bd12ee0d27e5e0d3a9861545a941e139835ab87097144e8e053fe2a`; focused review SHA-256 `fc71d3c2cae63de284b0ef28bff11fec655bf790d9922674d1e3e7289712efda`. Immutable history: `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-plan.md` and `default-library-plan-review-02.md`. This tenant document owns the technical relation.

Publish one ordinary default-library module with seven callable purposes:
recursive Executive, induction, specification, design, construction, testing
and UAT. Construction wraps the existing native coding-worker GraphFunction.
The other work wrappers reuse existing native work/assessment/execution owners.
Their GraphFunctions have distinct declared purposes, contracts and policy
assets; selection invokes a permitted registered wrapper, not a label in a
universal runtime dispatcher. Consumers select/restrict/replace these ordinary
catalogue contributions. There is no required induction→specification→design
sequence, role hierarchy or graph generation.

## Common application contract and coverage

Use one small typed library input/result, `governance_work_state`: original task
and exact selected source identities; declared outcome/criterion and authority
references; applicable installed policy/assets; currently supplied or observed
worksite/evidence coordinates; requested bounded work and retained unresolved
outcomes. These are application data, not a new ABG ledger or obligation engine.
A child returns its bounded product/measurement, source/producer correspondence,
explicit gaps and the conserved parent state. It cannot replace originals,
strengthen its grant, discard valid evidence or certify parent convergence.

The table specifies callable coverage, not mandatory calls. “Ready” below means
the bounded capability result exists; it does not mean the application is done.
All semantic interpretation, suitability and sufficiency judgments are F_P.
F_D performs declared copying, schema/identity checks and total control rules.

| Callable purpose | Typed work/result within state | Selected frame and criterion | Effects and completion/gap | Actual invocation and retained assets |
|---|---|---|---|---|
| **Executive**: select/revise registered work and reevaluate the original outcome | State → same state with admitted choice/returned evidence and parent evaluation | Executive + consumer outcome criteria; purpose/contract fit, proportionality, preserved residuals | Selection is effect-free. Closure requires the explicit parent outcome evaluation; unsupported capability/input stays gap | S3 `registered_selection_task`/raw binder + S4 declared recursion. Open parent sufficiency uses the existing read-only native assessment; F_D only projects its admitted verdict into the declared recursion termination rule |
| **Induction**: establish task model, context, assumptions and unknowns | Complete original source → bounded task-model asset plus unresolved questions | Worker/induction; source faithfulness, modality, conflicting statements and uncertainty | Read selected sources; write only selected model asset when needed. No invented resolution of unknowns | Fixed native-work workflow; applicable separate assessment. Retain `native-intent-declarations.mjs` policy content and headings as reusable source, adapting its narrow Intent outcome into explicit induction coverage |
| **Specification**: state requested behavior and testable criteria | Source/model and any already-valid requirements → behavior/criterion asset | Product/Specification; source-grounded behavior, boundaries and meaningful proof obligations | Scoped asset writes; absent source/authority remains gap. Does not require a freshly generated induction asset | Fixed native-work and applicable native-assessment calls. Retain donor product/requirements required-content and common rubric; remove fixed predecessor-stage requirements |
| **Design**: propose a realizable bounded change and checks | Source/criteria/current worksite/reusable design → selected artifact and command plan | Design + interface integration; actual context, feasibility, preservation and executable proof | Scoped design asset only. Unknown dependency/capacity remains explicit; no guessed controls | Fixed native work/assessment; retain donor design content and executable-proof criterion, including actual inventory and declared capacity |
| **Construction**: realize the selected work | Bounded work order/current context → `NativeWorkspaceWorkObservation` folded into state | Worker/Construction; original outcomes and selected change scope | Existing native coding host reads/edits/runs permitted checks; actual before/after observations own effect truth. Report alone never proves success | Existing `NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef`, `realizeNativeWorkspaceWork`; retain exact native task, scope and observation contracts |
| **Testing**: establish reproducible executable behavior | Selected criteria/check plan plus actual candidate → native command/predicate observations and residuals | Testing/verification; meaningful tests of the actual candidate and declared expected observations | Permitted command/check effects and explicitly scoped verifier artifacts. Missing plan/tools/evidence remains gap | Existing native work may author a needed verifier/plan; existing C2 command GraphFunction executes the declared commands and returns typed observations. Reuse its unchanged native-source arm, or the explicitly proposed observed-input child extension below; never fabricate construction success |
| **UAT**: independently assess selected user outcomes | Original source, independently authored oracle/rubric, exact candidate and execution evidence → consumer-declared assessment | Product/UAT + independent Reviewer; requested behavior in the selected usage context | Read-only fresh assessment; use declared C2 probes if required. Unsatisfied/indeterminate outcomes remain open | Existing native assessment GraphFunction with installed schema asset and exact source/candidate/rubric digests. Retain donor evidence/common-rubric meaning, not its unconditional final stage |

Policy rows and source assets are declaration data. Existing run-environment
roles remain `selector`, native `constructor` and `assessor` (plus C2's command
executor when used); they do not create an arbitrary actor roster. The registered
wrapper fixes its policy selection, and its mechanically constructed task names
the exact applicable policy/rubric asset. Existing owned assembly binds the task
and admitted source context. A shared native leaf retains its fixed identity;
we do not clone/rename it to evade native-work authority checks.

## Selected execution relation

Generalize the S4 consumer composition into the ordinary library declarations:
parent evaluation → registered selection → one fixed permitted wrapper → normal
child result/foldback → parent reevaluation. Preserve the same compact S3 choice
or gap, common exact child input, declared candidate domain and route binding.
The parent has an explicit recursion bound supplied in the selected declaration.
A missing initial outcome observation is mechanically nonterminal. When outcome
sufficiency requires judgment, the parent's fresh F_P assessment supplies the
verdict; a total F_D projection may read that verdict, never infer success from
file presence, a report, command exit, stage count or catalogue membership.

Each work wrapper projects the common state into the existing native task,
invokes its exact registered child and folds the actual observation back.
Retained-input edges preserve the parent's original state across task/result
carriers. Foldback obtains real result/CCall provenance from existing admitted
causal facts; no implementation invents future event references. Unknown required
inputs refuse preparation or preserve an explicit gap before launching work.
Fresh observations replace only the corresponding stale evidence; unaffected
valid work remains available. A suitable previously established artifact can
be consumed directly, without rerunning its author capability.

## Concrete missing relation and smallest implementation boundary

The current native effect and assessment owners already exist. Their reusable
tasks are **not** the existing ordered semantic-job envelope. In particular,
`product/semantic_job.ts:865–873` requires the selected stage to equal the current
`assets.length` position and checks declared assessed predecessors.
`abg/semantic_job.ts:471–501` binds preparation/foldback to that envelope.
Importing these helpers unchanged would restore the rejected lifecycle.

The missing relation is therefore **unordered library state ↔ an exactly owned
native task/observation**, including current context and admitted producer links.
Implement it as a bounded projection/result correspondence under existing ABG
owners, not a new effect, event family or execution entity:

- New `gtl/default_library.ts`: ordinary module, wrapper templates, registered
  domain, optional recursive Executive, policies, contracts and contributions.
  Export through `gtl/index.ts`; add its publication to the existing
  `scripts/generate-product-manifest.mjs` module list beside native work/C2.
- New `product/default_library.ts` and packaged policy assets: typed state,
  selected work-order/assessment/command-plan contracts and pure conservation
  predicates. New `implementation/default_library.ts`: packaged projections and
  S3-style prepared selector realization. No shell/native effects in these
  adapters; the existing child implementations own them.
- Use the current `abg/execution_basis.ts:159–240` owned occurrence authentication
  for the preparation/fold projection. It already recovers current cursor input,
  Program, implementation and workspace environment without an F_P-only
  restriction. Add only the required binding arm at HoG preparation and ABG result
  admission (`hog/ccall_lifecycle.ts`, `abg/c_call_outcome.ts`). Put the narrow
  projection helpers in `abg/default_library.ts` under existing ABG authority;
  this file adds no runtime entity or admission authority. Consume the bound
  basis once and preserve its private reuse; no repeated declaration hashing,
  full-graph event copy or another cache/proof carrier.
- Preparation invokes existing `observeWorksiteContext` for declared current
  input, constructs existing `NativeWorkspaceWorkTask` or C2 task and checks
  exact scope. Assessment uses existing `NativeWorkspaceAssessmentSelection`
  and installed schema resolution. Result admission authenticates the actual
  selected child, same authority, raw/result relation and retained parent input.

This owner extension needs explicit S5 implementation authority; it is not
claimed delivered by the fixture. If its existing basis cannot supply the
required occurrence/producer relation, return that exact seam before introducing
another carrier. The task must not fall back to a naked prompt, caller-side
snapshot/continuation loop or the ordered semantic-job helper.

## DL-D01: observed-input Testing child — selected extension

The governing C2 HOW, `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:303–339`,
explicitly supports **root C2 only** for observed files and deliberately excludes
children. This proposal amends that HOW boundary for one admitted Testing-child
composition; it must not be described as already supported. The existing root
binding at `abg/execution_basis.ts:714–724` remains exact and unchanged. No Product
conflict was found: COMPOSE-004/007/008 requires replayable composition with
preserved, sufficient inputs; HANDLERS-001/003/005 requires exact admitted calls,
real observations and authority; BINDING-016–018 separates observations from
immutable authority. Product's Preparation/Execution boundary and default-library
reuse require no invented author or gratuitous construction call. Implementation
must update only the owning C2 HOW's root-only exclusion and its affected joins;
Product, requirements, effect scope and Public operations stay fixed.

There are two distinct source cases. Native-source Testing retains its existing
completed native Result, same-Run/reacquisition preparation and currentness laws.
Observed-input Testing carries actual existing file observations, **no author
claim and no predecessor native/construction Result**. Its real F_D preparation
Result proves task preparation, not file authorship. Keep
`deriveSameRunWorksiteCommandSourceBasisAtPrefix`'s native/C1/C3 branches unchanged;
do not coerce observed files into `ProductInvocationSourceResultBasis`.

Use one pure observed-child provenance projection in existing
`abg/worksite_input_provenance.ts`, selected by the existing closed
`sourceObservedInput` task arm and the actual declared C2 call boundary. It
returns the already-admitted input/preparation/result/judgment/route coordinates
and selected observation set. This is an internal projection, with no new basis
identity, serialized carrier, event, cache, ledger or effect permission.

1. **Input and acquisition.** The Testing wrapper receives the admitted parent
   state and an explicit ordered file selection plus command/predicate/write
   configuration. Its named `prepareObservedTestingTask` F_D leaf consumes the
   existing owned occurrence basis; it derives A/W/grant from the current admitted
   environment and original invocation. It uses existing worksite observation
   operations for exactly those subjects and constructs the existing
   `ObservedWorksiteCommandExecutionTask`. Nonempty/unique source rows, exact
   subject/observation binding, source-set identity and protected territories
   remain the existing constructor's law. Caller-provided file claims alone are
   insufficient. This leaf executes no command and makes no suitability judgment.
2. **Preparation admission and route.** The proposed library preparation guard
   admits the exact task/observations only against that occurrence, declared
   input and admitted implementation. The shared projector follows the current
   parent basis, Run, invocation, workflow CCall and cursor to its actual preceding
   advance route and successful, advancing preparation Result. It verifies the
   exact declared preparation binding, Result/judgment causal refs and canonical
   task/contract equality. Recover the preparation input through the existing
   cursor/retained-input projections; any retained source is an actual upstream
   result, never an invented native producer. Preserve the acquisition prefix
   belonging to the preparation occurrence using its existing CCall/fibre events.
   Index by occurrence and causal route before comparing content; equal task
   digests in unrelated history cannot establish or invalidate this relation.
3. **Child admission.** At `execution_basis.ts:2411–2417`, branch only for this
   admitted observed task into the shared projector, instead of requiring a
   completed-source Result. The exact fixed C2 GraphFunction, input digest,
   parent CCall/basis, Program membership/implementation subset, A/W and original
   grant still match. Reject missing/ambiguous preparation, crossed route/input,
   mixed source arms, foreign authority or intervening invalidation before opening
   the child. Leave the existing source-result branch and root arm unchanged.
4. **Before effects.** Replace only the unconditional observed-child refusal at
   `execution_basis.ts:980–981` with the same exact provenance join. Check later
   admitted mutations and uncertain failed-write residue affecting the selected
   protected paths from the preparation's acquisition cut through the held
   pre-effect prefix, not merely through child admission. Keep current binding,
   grant, fixed implementation, protected-file and physical O1 re-observation
   checks before manifests/snapshot/dispatch. A preparation Result or source-set
   digest never authorizes execution of changed files. Preserve unaffected paths;
   do not widen read/write territories, controls or trusted-desktop guarantees.
5. **Result and replay.** C2 helper execution, typed command observations, result
   admission, ordinary foldback and parent evaluation stay unchanged. At
   `abg/replay.ts:1789–1798`, project observed child provenance at that child's
   historical admission cut using the same projector; distinguish its observation
   set and real preparation Result from the existing source-Result projection.
   Do not fabricate author lineage or make historical replay reread today's
   filesystem. Existing pre-effect/effect evidence retains the later currentness
   obligation. The existing basis/route/result facts suffice for fresh-process
   reconstruction; missing provenance refuses rather than trusting task shape.

This adds the named observed arm in `abg/worksite_input_provenance.ts`, whose
current completed-source projector excludes it at `:305–309`, plus the three
listed `execution_basis.ts`/`replay.ts` consumers and the already-proposed library
preparation/result correspondence. `abg/invocation_admission.ts:530–556` continues
to derive actual predecessor Result bases only. Existing retention, traversal,
C2 task/snapshot/effect and native-source owners are reused, not replaced.

Retain donor **meaning** from `native-intent-declarations.mjs` and the per-stage
content/rubrics in `native-lifecycle-declarations.mjs`. Pin its exact source and
adapt the bounded policy data into the ABI library; do not make runtime depend
on an odd_glc checkout. Exclude `constructFreshNativeLifecyclePublication`, its
fixed chain and stage-count/role-count assumptions. The two donor publication
constructors remain exported, but the bounded `src/*.mjs` caller search found
only their definitions. This proposal displaces their fixed-chain design for
the new library; it does not claim to delete them or audit external callers.
Ordered semantic-job code remains an existing optional path and is not used by
the new library. No retired odd_glc planner is restored.

## Small route to the independent Hello witness

A separate consumer authors original Hello source, acceptance criteria and a
prospective counterevidence case before execution. It selects the installed
library and its allowed callable subset, worksite/effect scope, source assets,
frames, bounds and oracle; it supplies no solution or expected graph schedule.
The library contains no Hello-specific text, file output, command or branch.

One installed Public start lets the Executive choose applicable work. Native
construction must create actual sandbox files; Testing must execute actual
checks; independent UAT must compare exact artifacts/observations against the
consumer oracle. Bind one source-authored counterexample that changes the needed
kind of work—e.g. an actual use-case failure requiring specification clarification
versus construction—without telling the selector the expected graph identity.
Its observed failure must enter owned context, cause a different preregistered
wrapper to be admitted and run, and return through recursive foldback before
parent reevaluation. Unexpected semantic outcomes remain evidence for Executive
triage; do not rewrite the oracle or force the next choice. Finish with fresh
Public Result/replay and exact installed-source/archive identities.

Before that live thread, check publication/closure, generic task conservation,
selected missing context, unknown capability gap, native scope and independent
assessment correspondence. Reuse accepted S2–S4 refusal/native/recursion proof
where unchanged. Use one small live library-to-Hello composition discriminator,
not seven independent label-qualification campaigns. Explicit closed-rule versus
F_P and frame/criterion selection checks remain bound to the Product witness;
publication coverage alone earns no runtime or release claim.


Add one affected reuse discriminator to that same installed S5 thread: supply
an already-valid candidate and check plan with no native/construction producer;
select Testing, admit its observation/preparation, execute the fixed C2 child,
fold actual command evidence back and obtain fresh Public replay/readback.
Assert no native author call, unchanged protected originals, the actual observed
source arm and parent obligations preserved. This is reuse of the consumer's
prospectively selected files, not a second Hello solution embedded in the library.
Keep the existing fresh-native-source thread as its regression witness.

Use bounded mechanical mutations of that actual preparation/child boundary for
missing or non-advancing preparation, crossed Run/cursor/Result despite equal
bytes, changed task/file selection or foreign grant, and mixed source carriers.
For currentness, exercise a selected-file change (including an admitted failed
write with unknown residue) after preparation/child admission but before effect;
expect refusal before command dispatch. Preserve unchanged-unrelated-path
behavior through existing currentness checks. Fresh-process replay must reproduce
the positive provenance and refuse a detached/mismatched preparation; no extra
provider reliability campaign, author rerun or execution-policy widening is
selected by these checks.

No further Product decision is needed. Executive must accept this HOW and grant
the named owner extension before implementation. Source-authored Hello/oracle
selection and independent review remain separate roles; no implementation,
provider, build or qualification effects occurred in this proposal.

## Read-subject identities
- `/Users/jim/src/apps/abiogenesis/specification/PRODUCT.md`: `179ee0e82b4617e4bb40bba0fb91200ada684e94592bf9dc61812fab365aa7a1`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/gtl/native_workspace_work.ts`: `e46879346a2bbf47e0e37e529582a01c1f37c955fc5d9fb9f3a175010813ae25`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/native_workspace_work.ts`: `d70f556ba83d6c5060b924e9ef0a5755d6c9c3adfb7f42023405e76a1954fed5`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/native_workspace_assessment.ts`: `fb140fcb9868ff66147e677216442f6f501aaa73d87288318a6fddf057d7aa8a`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/semantic_job.ts`: `b0513a0f392643c1c476f7f190649d72e0df100fd17385a07213a85f203a5dfe`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/semantic_job.ts`: `5c9196e5761551d7bfa9c3f0841d8aaef84ed2430824866c405b02c4f9e54ff2`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/execution_basis.ts`: `daef2ec655bb7f2cbf6b174c0342a43030daf65a325205f5cdd0b95ab0c2dae5`.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts`: `14b1f9036b6c1aaac6b6ab75006bd3ec06d2eef76416c1be3180d269a28e55be`.
- `/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/native-intent-declarations.mjs`: `5630d1d25802a8ad1bd3c81d6f68155b439c5edb4cad5e4135650afdf1077ea9`.
- `/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/native-lifecycle-declarations.mjs`: `580f7680cb2fc4cc0dbadacd596fd361f8c1a0f5f13821821ad5530f68ac7a32`.

DL-D01 additional read-subject identities:
- `specification/requirements/gtl/REQ-L-GTL3-COMPOSE.md`: `d6614b9a9e992fa3d8c07a977f9edeec83ac5c8893a60e859f1cc0a86342a89c`.
- `specification/requirements/abg/REQ-R-ABG3-HANDLERS.md`: `11b1c61ecb52c11b2bbc047c019792139b9a80367f881bbddd5826a8e4189000`.
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`: `af6538e5bf717feeefc90a8becedac9f3556fc77ea4c149443fa2a9c4d5f3175`.
- `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md`: `1918f94eb8c289e0af71386a88631a903a40dd6f43a0aa0de2ed9ef59d03cca3`.
- `build_tenants/abiogenesis/typescript/code/src/abg/worksite_input_provenance.ts`: `c092a78ada894d2e9220487011fc30cfcdc87d8da7ec2b3f1845d30be59dcbca`.
- `build_tenants/abiogenesis/typescript/code/src/abg/invocation_admission.ts`: `4f47f3084d8079d0dd04989e4aa35c7beeb56ed59cd92d05046b555b8d440cba`.
- `build_tenants/abiogenesis/typescript/code/src/abg/replay.ts`: `db57002098ace36cc173b3e3544ecf43ea5b4748af297fc940dda9f03cd4950c`.

### Imported contracts and selected governing frames

The consumer owns its application assessment contract and imports the library's
state, selection task, choice and response contracts. The retained-input
contract retains its existing C2 publication owner. The admitted leaf port's
existing unique contract projection is passed as the same owner-bound operation
to native preparation, selector assembly and observed-result correspondence. An
admitted null refuses without local fallback. Standalone local-publication
assembly retains its bounded scope; no contract registry or serialized owner
carrier is introduced.

The default publication packages the exact selected STDO v2.5.1-rc.1 reference
frame source member with its member and span digests. Roles bind applicable
Executive, Worker, Reviewer, specialist and Product testing source spans through
the existing run-environment inventory. Only those spans enter role context.
Capability instructions remain separate local policy. The consumer may select
the existing full STDO source/companion/corpus-access environment, as the live
witness does; packaged source projection does not claim corpus access.
