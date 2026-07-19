# M03 Complete C-Program Interpreter Behavior Design

> **T-283 authority disposition (2026-07-20):**
> `invalidated_for_5_0_implementation_by_upstream_intent_reprice`. This file is
> retained as historical and current-state evidence only. Prior acceptance
> records its former basis; it does not authorize design, code, proof, Product
> scope, or closure under the T-283 candidate. Reusable local contracts must be
> re-derived under the accepted direct-GTL replacement design after T-283
> closes.

**Prior status**: Accepted under delegated F_H authority; bounded C-call-enclosure
conformance re-entry accepted 2026-07-19 on the superseded basis
**Date**: 2026-07-14
**Ticket**: `T-271`
**Method authority**: `specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md` section 5E
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

## Boundary

This design closes the structural interpreter gap between admitted GTL C
syntax and the generic runtime atoms already realized by T-257 through T-262.
It compiles one complete admitted C program before effects, then interprets
only the compiled plan:

```text
admitted CProgramDeclaration
  -> selected Module and GraphVector program binding
  -> exact selected abg.fn_composition
  -> one immutable CompiledCProgramPlan
  -> replay-derived CProgramExecutionCursor
  -> T-271-owned C-call enclosure around bounded effect-interior submissions
  -> existing workflow.C, C.batch, and C.retry runtime laws
  -> admitted CProgramExecutionOutcome
```

The seven GTL constructors remain exactly:

```text
C.of | C.id | C.compose | C.edge | workflow.C | C.batch | C.retry
```

The interpreter introduces no eighth constructor. Graph-level `recurse` is a
GraphFunction application relation and remains outside the C syntax tree. The
interpreter may consume an already admitted recurse relation only at the
public graph traversal boundary owned by T-267/T-270; it does not translate
that relation into a C node.

### Requirements

- `REQ-L-GTL3-C-ALGEBRA-001..-017`
- `REQ-R-ABG3-CCALL-001..-017`
- `REQ-R-ABG3-FN-COMP-001..-024`
- `REQ-R-ABG3-INTERPRET-010` and `-027`
- `specification/PRODUCT.md` atom criterion
- T-259 direct `workflow.C` atom
- T-260 direct HOF and `C.batch` atoms
- T-261 direct `C.retry` atom
- T-262 typed graph-recurse atom
- T-269 authored-stage and interpreter-bind separation

### Explicit exclusions

- Consensus-specific stage names, reviewer policy, panel control, or routes;
- a controller, service loop, prompt shell, or second graph traversal loop;
- parsing or repairing authored C syntax after execution starts;
- synthesis of transform/evaluate/consequence stages not present in the C
  declaration;
- flattening `workflow.C`, `C.batch`, or `C.retry` into anonymous `C.of`
  leaves;
- treating call preparation, evidence, result admission, or materialization
  binds as authored C stages;
- treating GraphFunction `recurse` as a C constructor;
- unbounded retry, scheduling, leases, cancellation, or distributed execution;
- public SDK routing, owned by T-270;
- whole-program traversal conservation and static TraversalUnit closure, owned
  by the reframed T-267; and
- tenant capability publication, owned by T-268.

## Irreducible Architectural Carrier Set

The active boundary has five prime carriers.

| Prime carrier | Authority | Purpose |
|---|---|---|
| `AdmittedCProgramDeclarationNode` | GTL M01 authoritative input | Canonical authored syntax, program identity, outer carriers, and proportionality class. |
| `CProgramCompilationOutcome` | M03 authoritative compiler result | Closed `compiled`, `invalid`, or `semantic_not_realized` result; only `compiled` carries a plan. |
| `CompiledCProgramPlan` | M03 authoritative compiled projection | Exact selected-Module, program, composition, carrier, constructor, path, role/fibre/arm, result-cardinality, retry, and child-reference joins. |
| `CProgramExecutionCursor` | M03 replay-derived runtime position | Current plan path, sequence position, batch task, retry attempt, input payload, lineage, and admitted predecessor outcome. |
| `CProgramExecutionOutcome` | M03 authoritative admitted outcome family | Completed, held, blocked, semantic-gap, or runtime-failed result with exact plan and replay identity. |

Subordinate plan nodes are a closed recursive family:

```text
CompiledCPlanNode
  = CompiledCStageLeaf
  | CompiledCIdentity
  | CompiledCSequence
  | CompiledCWorkflowLift
  | CompiledCBatch
  | CompiledCRetry
```

`CompiledCSequence.sourceConstructor` distinguishes `c_compose` from
`c_edge`; an edge retains its three named field paths while using the same
ordered sequence law. A plan node always carries its canonical source path,
source digest, input carrier, output carrier, and result-cardinality
projection. It cannot carry effects, events, continuation authority, or a
product-specific route.

`CProgramExecutionCursor` is not controller memory. It is derived from the
compiled plan plus admitted replay. The interpreter may retain a local value
for efficiency, but re-entry must reproduce the same cursor from those two
authorities.

## Design Decisions

### D1. Canonical C syntax remains the only program authority

The compiler consumes the exact T-254 selected program binding and readmits
the selected canonical C declaration. It walks the admitted C tree once and
produces one digest-bound `CompiledCProgramPlan`. Runtime consumes that plan;
it does not invoke `compileCAlgebraToHog`, parse declaration attributes, or
infer a program from effects, handlers, graph shape, names, or observed
results.

The existing normalized HoG flat/workflow/batch/retry variants remain direct
form compatibility projections. For a direct form, the complete compiler must
produce a plan observationally equivalent to the existing direct binding and
resolver. Those HoG projections do not become a second authority for mixed or
nested programs.

### D2. Source paths make every structural locus exact

Every node receives a canonical source path rooted at `$.term`:

```text
c_compose:  .left, .right
c_edge:     .transform, .evaluate, .consequence
c_batch:    .tasks[n]
c_retry:    .term
```

The node ref and digest cover the program binding digest, selected Module
digest, source path, canonical source node, outer carrier pair, parent path,
and constructor-specific authority. Equal-looking subterms at different paths
therefore remain distinct.

The compiler derives two orthogonal ordinals:

- `sequenceOrdinal`: serial position inside the current sequence scope; and
- `taskOrdinal`: stable batch list position, null outside a batch.

Retry attempts remain replay-derived runtime ordinals and never enter static
program identity. Workflow child frames retain child GraphFunction and frame
identity. These coordinates join the existing C-call identity without
inventing a parallel call namespace: complete-program calls extend the
canonical digest tuple with `programLocusRef = compiledNodeRef` and the full,
possibly empty sequence of positive-integer `retryPath` coordinates. The
retained flat compatibility path omits both fields and preserves its existing
identity form.

### D3. Carrier continuity and result cardinality close before effects

The compiler proves input/output continuity recursively:

- `C.id<A>` requires equal input and output carriers and invokes no atom;
- `C.compose(left, right)` requires `left.output == right.input`;
- `C.edge` requires the same continuity across its three direct fields;
- `workflow.C` requires one exact Module-contained child whose typed outer
  interface preserves the declared carrier pair;
- `C.batch` requires a non-empty ordered task family with the same input,
  output, and per-task result cardinality; and
- `C.retry` preserves the wrapped plan's carrier pair and cardinality.

Cardinality is derived structurally as `zero | one | many | unresolved`.
`workflow.C` has no authored result-bearing flag. The compiler therefore uses
only authored sequence structure: a sole direct workflow or a terminal
workflow with no other authored result-bearing locus supplies the parent
result; an intermediate workflow supplies admitted bind output but not the
outer result. An explicit `C.of.resultBearing` remains authoritative and may
not be cleared because another term follows it. A program with both an
explicit result-bearing leaf and a terminal workflow result is `many` and
fails. This is a structural cardinality judgment, not a claim that the
workflow's internal Node-interface refs equal a published wire contract; the
existing `childOuterContractRef: null` and `childWireContractCertified: false`
truth remain unchanged. Batch cardinality is the shared per-task cardinality,
not task count. The complete plan admits only `one`; `zero`, `many`, or an
unresolved child reference is a typed compiler stop.

### D4. Composition binding is exact and separate from domain role

`C.of` owns its domain stage role, fibre, arm, and result-bearing flag.
`workflow.C` intentionally owns none of those domain-stage fields; it is a
transparent named lift. The compiler does not fabricate them.

For each invoking locus, the compiler joins the selected
`abg.fn_composition` governance row:

- exact composition selection and digest;
- exact fibre for `C.of`;
- when that fibre has one row, that unique row may govern more than one domain
  locus and every locus still receives a distinct compiled binding record;
- when a fibre has several rows, exact declared `order` at the stable
  depth-first invocation ordinal must select one;
- role-free `workflow.C` uses the sole composition row, or exact order when
  the composition has several rows; and
- batch task ordinals remain separate C-call identity even when lawful tasks
  reuse the same unique governance row.

The compiled locus carries both `domainStageRole: string | null` and the
closed `compositionStageRole`. A null domain role is lawful only for
`workflow.C`; its `armId` is the exact child GraphFunction ref and its evidence
class is `sub_traversal`. The child program preserves and executes its own
authored roles under its own selected composition.

Ambiguous order, missing fibre, undeclared role, or a composition row outside
the selected owner fails compilation before effects. A row reused through the
unique-fibre rule is recorded on every locus; reuse never merges stage, task,
arm, evidence, or C-call identity.

### D5. Structural constructors delegate effects, not C-call ownership

The interpreter exhaustively matches `CompiledCPlanNode` while remaining the
single owner of every invoking locus's C-call enclosure:

- stage leaf: open the exact C-call, invoke the declared-stage effect interior,
  then admit and seal the returned submission;
- identity: pass the admitted input and lineage without events or effects;
- sequence: interpret children in order, passing only admitted output;
- workflow lift: open the exact C-call, invoke the T-259 child traversal
  interior under the compiled child binding, then admit and seal the returned
  submission;
- batch: invoke the T-260 all-or-block task-family law, with each task adapter
  interpreting that task's compiled child plan; and
- retry: invoke the T-261 replay/budget law, with each eligible attempt
  interpreting the wrapped compiled child plan.

Direct `C.batch(C.of...)` and `C.retry(C.of...)` retain observationally
equivalent resolver behavior. Their earlier direct implementations combined
the grouping/control law with the sole direct leaf's C-call construction.
T-271 factors those responsibilities at one boundary:

- the batch coordinator owns stable task order and all-or-block folding;
- the complete-program batch projection derives separate content-addressed
  output and result refs from the ordered admitted task outputs and task
  results, seals that derivation in a replay receipt, and accepts no caller-
  supplied projection callback;
- the retry coordinator owns replay-derived attempt eligibility and budget;
- T-271 owns the exact terminal child call's retry judgment; and
- an effect-interior callback owns only its bounded external action and returns
  exactly one `CProgramAtomInvocationSubmission` to T-271.

For each invoking stage leaf or workflow lift, T-271 alone admits this ordered
enclosure using existing runtime event kinds:

```text
c_call_opened
  -> c_call_fibre_selected
  -> validated effect-interior events
  -> payload and authority evidence
  -> c_call_evidenced
  -> c_call_result_admitted
  -> c_call_judged
```

The callback cannot open, evidence, admit, judge, or close a C-call and cannot
write directly to replay. It returns bounded data; T-271 validates exact
scope, basis, graph call, frame, vector, edge, C-call, causal order, and
cardinality before event admission. No new event kind, event authority,
controller, or C-call namespace is introduced.

Nested forms then reuse the same batch and retry laws while delegating task or
attempt interiors back to the structural interpreter. A wrapper never opens a
synthetic C-call around multiple effectful child calls. T-271 opens one spine
for each invoking leaf or workflow lift; batch remains a grouping relation and
retry remains a control relation. The retry attempt is included in every
wrapped child cursor, so replay distinguishes the whole new attempt while
T-271 attaches `retry` only to the failed attempt's exact terminal child
C-call.

### D6. The interpreter owns enclosure; the callback owns effect interior

The interpreter owns only:

```text
compiled-node dispatch
ordered carrier threading
batch child-plan delegation
retry child-plan delegation
replay-derived cursor re-entry
one C-call enclosure per invoking leaf or workflow lift
atom-submission validation and ordered event admission
closed outcome folding
```

The effect-interior callback continues to own the selected plugin, worker, or
child-traversal action. Existing F_P target/result admission, F_H held truth,
retry eligibility, and child-frame laws remain unchanged. T-271 does not
perform those semantic judgments; it validates their returned carriers and
events, owns the enclosing C-call spine, submits that ordered enclosure through
the existing event-admission authority, and folds replay-derived truth into one
program outcome. It cannot select a handler, invent effect output, create a
second traversal loop, or decide graph continuation.

The one callback API is a breaking replacement for separate result and event
projection callbacks:

```ts
interface CProgramAtomInvocationSubmission {
  readonly kind: "c_program_atom_invocation_submission";
  readonly result: CProgramAtomResult;
  readonly admittedTargetCarrier: AdmittedInvocationCarrier | null;
  readonly interiorEvents: readonly CProgramAtomInteriorEvent[];
  readonly evidenceEvents: readonly CProgramAtomEvidenceEvent[];
  readonly closeBasis: CProgramAtomCloseBasis | null;
}

interface CProgramInterpreterInvocation {
  readonly invokeAdmittedAtom: (
    request: CProgramAtomRequest
  ) => Promise<CProgramAtomInvocationSubmission>;
}
```

`CProgramAtomInteriorEvent` is this closed, neutral subset of the existing
runtime-event union:

```text
instruction_prompt_manifest_projected
fp_dispatch_requested
instruction_causal_context_bound
plugin_traversal_prompt_materialized
actor_invocation_started
actor_process_started
actor_process_start_failed
actor_process_stream_observed
actor_process_heartbeat
actor_process_timeout
actor_process_signal_sent
actor_process_exited
runtime_activity_probe_observed
runtime_external_interruption_observed
actor_result_artifact_observed
instruction_response_contract_admitted
actor_invocation_closed
```

It excludes
payload-evidence rows, C-call rows, graph/frame/vector lifecycle rows,
retry/continuation/terminal rows, F_H/public-operation rows, and every unknown
kind. `CProgramAtomEvidenceEvent` remains the closed existing payload and
authority evidence subset. `projectAtomRuntimeEvents` is removed; retaining it
would create a second event-projection authority beside the submission.

### D7. Replay and failure are path-conserving

Before dispatch, the interpreter projects the current cursor from the plan
and replay. A completed child path is not repeated. A dangling atom resumes
through that atom's existing replay law. A retry resumes the exact current
attempt. A batch resumes only unresolved task paths while retaining the
all-or-block parent disposition.

Every refusal identifies the available program or plan ref, node path, source
node digest, composition selection, carrier pair, and current replay basis.
Compilation has one closed outcome family:

```text
compiled
invalid
semantic_not_realized
```

Only `compiled` carries a `CompiledCProgramPlan`. Runtime has a separate
closed outcome family:

```text
blocked
held
runtime_failed
completed
```

Malformed atom output, stale replay, carrier mismatch, undeclared role,
unresolved child, unsupported graph-recursive shape, and plan drift cannot
advance the cursor or permit a later effect.

### D8. Graph recurse remains a separate application relation

A `workflow.C` self-reference or mutual workflow-reference cycle always stops
as `gtl-c-unsupported-recursive-shape-before-effects`; a C workflow lift is
not an alternate spelling of graph recurse. Lawful recursion is represented
by the already admitted GraphFunction application relation outside the
selected C tree. T-262 remains its one typed runtime, and T-267/T-270 join that
relation to conservation and public routing. T-271 may compile ordinary
non-cyclic C programs inside a GraphFunction that participates in that outer
relation, but it neither calls itself to simulate recursion nor encodes
recurse as a plan-node variant.

### D9. Publication and traversal closure remain gated

T-271 publishes the compiler/interpreter contract inside M03 and removes only
the `complete_c_program_interpreter` gap. It does not make the program publicly
invocable. T-267 must prove every authored locus and interpreter bind is
conserved. T-270 must connect the admitted plan to the one public catalog/start
router. T-268 must admit product capability coverage before effect-bearing
Consensus execution.

## Domain Model

```mermaid
classDiagram
  class AdmittedCProgramDeclarationNode {
    <<prime>>
    <<authoritative>>
    +programRef
    +term
    +proportionalityClass
  }
  class CompiledCProgramPlan {
    <<prime>>
    <<authoritative>>
    +planRef
    +planDigest
    +programBindingDigest
    +moduleDigest
    +compositionSelectionRef
    +rootNodeRef
    +resultCardinality one
  }
  class CProgramCompilationOutcome {
    <<prime>>
    <<authoritative>>
    +status compiled_or_invalid_or_unrealized
    +planRef
    +diagnostics
  }
  class CompiledCPlanNode {
    <<subordinate>>
    -nodeRef
    -nodeDigest
    -sourcePath
    -inputCarrierRef
    -outputCarrierRef
    -resultCardinality
  }
  class CompiledCStageLeaf {
    <<subordinate>>
    -domainStageRole
    -compositionStageRole
    -fibre
    -armId
    -resultBearing
  }
  class CompiledCIdentity {
    <<subordinate>>
    -carrierRef
  }
  class CompiledCSequence {
    <<subordinate>>
    -sourceConstructor
    -orderedChildRefs
  }
  class CompiledCWorkflowLift {
    <<subordinate>>
    -childGraphFunctionRef
    -compositionStageRole
    -fibre
    -evidenceClass sub_traversal
  }
  class CompiledCBatch {
    <<subordinate>>
    -batchRef
    -orderedTaskRefs
  }
  class CompiledCRetry {
    <<subordinate>>
    -childPlanNodeRef
    -maxAttempts
    -retryPolicyDigest
  }
  class CompositionLocusBinding {
    <<subordinate>>
    -selectionRef
    -bindingRef
    -sequenceOrdinal
    -taskOrdinal
  }
  class CProgramExecutionCursor {
    <<prime>>
    <<authoritative>>
    +cursorRef
    +planRef
    +nodeRef
    +inputPayloadRef
    +lineageRef
    +retryAttempt
  }
  class CProgramExecutionOutcome {
    <<prime>>
    <<authoritative>>
    +status
    +planRef
    +cursorRef
    +outputPayloadRef
    +evidenceRefs
  }
  class RuntimeAtomRequest {
    <<effect-edge>>
    -nodeRef
    -cursorRef
    -selectedCatalogEntryRef
  }
  class CCallEnclosure {
    <<subordinate>>
    -cCallRef
    -fibreSelection
    -orderedInterior
    -orderedEvidence
    -resultAdmission
    -judgment
  }
  class CProgramAtomInvocationSubmission {
    <<subordinate Prime neutral join>>
    -result
    -admittedTargetCarrier
    -interiorEvents
    -evidenceEvents
    -closeBasis
  }
  class TraversalConservationProjection {
    <<downstream>>
    +authoredStageRows
    +interpreterBindRows
  }
  class PublicInvocationRouter {
    <<deferred>>
    +catalogInvoke
    +start
  }
  class GraphRecurseRelation {
    <<deferred>>
    +applicationRelationRef
    +policyRef
  }
  class CompleteCProgramCompiler {
    <<authoritative>>
    -compile admitted syntax
    -resolve selected authority
  }
  class ABGReplayProjection {
    <<authoritative>>
    -derive exact cursor
  }
  class CProgramInterpreter {
    <<authoritative>>
    -dispatch compiled node
    -thread admitted carriers
    -own each invoking-locus C-call enclosure
  }
  class ExistingRuntimeAtom {
    <<effect-edge>>
    -perform bounded effect interior
    -return one submission
  }
  class ExternalEffectAdapter {
    <<effect-edge>>
    -perform selected interior only
  }
  class ABGEventAdmission {
    <<authoritative>>
    -admit runtime events
    -project replay truth
  }

  CompleteCProgramCompiler --> AdmittedCProgramDeclarationNode : admits
  CompleteCProgramCompiler --> CProgramCompilationOutcome : returns
  CProgramCompilationOutcome --> CompiledCProgramPlan : compiled variant owns
  CompiledCProgramPlan *-- CompiledCPlanNode : owns closed tree
  CompiledCPlanNode <|-- CompiledCStageLeaf
  CompiledCPlanNode <|-- CompiledCIdentity
  CompiledCPlanNode <|-- CompiledCSequence
  CompiledCPlanNode <|-- CompiledCWorkflowLift
  CompiledCPlanNode <|-- CompiledCBatch
  CompiledCPlanNode <|-- CompiledCRetry
  CompiledCStageLeaf *-- CompositionLocusBinding : owns exact join
  CompiledCWorkflowLift *-- CompositionLocusBinding : owns exact join
  CompiledCProgramPlan --> ABGReplayProjection : scopes
  ABGReplayProjection --> CProgramExecutionCursor : derives
  CProgramExecutionCursor --> CProgramInterpreter : drives
  CProgramInterpreter *-- CCallEnclosure : owns one per invoking locus
  CProgramInterpreter --> RuntimeAtomRequest : selects exact atom
  RuntimeAtomRequest --> ExistingRuntimeAtom : invokes
  ExistingRuntimeAtom --> ExternalEffectAdapter : bounded effect
  ExistingRuntimeAtom --> CProgramAtomInvocationSubmission : returns bounded data
  CProgramInterpreter --> CProgramAtomInvocationSubmission : validates exact submission
  CProgramAtomInvocationSubmission ..> ABGEventAdmission : supplies interior and evidence only
  CProgramInterpreter --> ABGEventAdmission : admits ordered C-call enclosure
  ABGEventAdmission --> CProgramExecutionOutcome : replay-derived fold
  CompiledCProgramPlan --> TraversalConservationProjection : T-267 consumes
  PublicInvocationRouter --> CompiledCProgramPlan : T-270 supplies
  GraphRecurseRelation ..> TraversalConservationProjection : separate T-267 join
```

## Execution Model

```mermaid
sequenceDiagram
  actor Caller as External admitted caller
  participant Router as PublicInvocationRouter (T-270 external)
  participant Compiler as CompleteCProgramCompiler
  participant CompileResult as CProgramCompilationOutcome
  participant Plan as CompiledCProgramPlan
  participant Replay as ABG ReplayProjection
  participant Interpreter as CProgramInterpreter
  participant Control as Existing Batch/Retry Law
  participant Atom as EffectInteriorCallback
  participant Effect as External EffectAdapter
  participant Events as ABG EventAdmission

  Caller->>Router: admitted catalog/start request
  Router->>Compiler: selected Module, handoff, C declaration, composition
  Compiler->>Compiler: admit tree, resolve refs, prove carriers/cardinality, bind paths
  alt Compiler owns invalid or unresolved relation
    Compiler-->>CompileResult: invalid or semantic_not_realized
    CompileResult-->>Router: typed pre-effect gap
    Router-->>Caller: truthful pre-effect stop
  else Compiler owns one exact complete plan
    Compiler-->>CompileResult: compiled with exact plan
    CompileResult-->>Plan: expose sealed plan ref and digest
    Router->>Replay: project plan-scoped runtime truth
    Replay-->>Interpreter: replay-derived cursor basis
    Router->>Interpreter: plan, cursor, selected catalog authority
    Interpreter->>Plan: exhaustive node lookup by nodeRef
    alt Interpreter owns C.id
      Interpreter->>Interpreter: pass admitted payload and lineage without effect
    else Interpreter owns C.of
      Interpreter->>Events: admit exact C-call open and fibre selection
      Events-->>Interpreter: open enclosure accepted
      Interpreter->>Atom: exact stage-leaf effect-interior request
      Atom->>Effect: selected fibre interior only
      Effect-->>Atom: raw result or failure
      Atom-->>Interpreter: one CProgramAtomInvocationSubmission
      Interpreter->>Interpreter: validate result, target, interior, evidence, and close basis
      Interpreter->>Events: admit interior, evidence, result, judgment in order
      Events-->>Interpreter: replay-visible completed, held, blocked, or failed truth
    else Interpreter owns workflow.C
      Interpreter->>Events: admit exact C-call open and fibre selection
      Events-->>Interpreter: open enclosure accepted
      Interpreter->>Atom: exact workflow-lift effect-interior request
      Atom->>Router: admitted child GraphFunction start
      Router-->>Atom: child traversal outcome with evidence
      Atom-->>Interpreter: one CProgramAtomInvocationSubmission
      Interpreter->>Interpreter: validate child result, interior, evidence, and close basis
      Interpreter->>Events: admit interior, evidence, result, judgment in order
      Events-->>Interpreter: replay-visible child output or truthful stop
    else Interpreter owns C.batch
      loop T-260 batch owner iterates stable task ordinals
        Interpreter->>Control: batch task with compiled child node ref
        Control->>Interpreter: delegate exact task child plan
        Interpreter-->>Control: admitted task outcome
      end
      Note over Interpreter,Events: T-271 owns each invoking child call and batch opens no synthetic spine
      Control-->>Interpreter: completed, held, or blocked family
    else Interpreter owns C.retry
      Control->>Replay: derive eligible attempt and budget
      Replay-->>Control: exact retry cursor
      alt Retry owner admits another attempt
        Control->>Interpreter: delegate wrapped child plan at attempt
        Interpreter-->>Control: admitted attempt outcome with exact terminal child C-call
        Interpreter->>Events: admit retry judgment on that terminal child C-call
        Events-->>Interpreter: replay-visible child-attempt truth
        Control-->>Interpreter: complete, retry cursor, held, or blocked
      else Retry owner refuses attempt
        Control-->>Interpreter: exhausted or ineligible typed stop
      end
    end
    alt Interpreter owns admitted next child
      Interpreter->>Replay: reproject cursor after admitted outcome
      Replay-->>Interpreter: next exact path or terminal path
    else Admitted enclosure outcome is held, blocked, gap, or failed
      Interpreter-->>Router: exact non-completed program outcome
      Router-->>Caller: truthful stop without later effects
    else Interpreter reaches terminal path
      Interpreter-->>Router: completed output and lineage
      Router-->>Caller: admitted program result
    end
  end
```

## Lifecycle Model

```mermaid
stateDiagram-v2
  [*] --> ProgramSelected : T-254 selection owner / exact program binding
  ProgramSelected --> CompileRefused : C compiler owner / raw admission or reference failure
  ProgramSelected --> Compiling : C compiler owner / admitted canonical tree
  Compiling --> CompileRefused : C compiler owner / carrier, cardinality, role, or composition mismatch
  Compiling --> SemanticGap : C compiler owner / lawful constructor authority unresolved
  Compiling --> PlanReady : C compiler owner / seal exact complete plan
  PlanReady --> StartupBlocked : T-267 or T-268 gate owner / conservation or capability absent
  PlanReady --> CursorProjected : replay projection owner / derive exact current path
  CursorProjected --> ReplayRefused : replay admission owner / stale or contradictory truth
  CursorProjected --> Interpreting : C interpreter owner / exhaustive compiled-node dispatch
  Interpreting --> CursorProjected : C.id interpreter owner / admitted no-effect pass
  Interpreting --> EnclosureOpen : T-271 owner / admit exact C-call open and fibre
  EnclosureOpen --> AtomPending : T-271 owner / invoke bounded effect interior
  AtomPending --> EnclosureSealing : effect callback / return one submission
  AtomPending --> RuntimeFailed : T-271 owner / missing or malformed submission
  EnclosureSealing --> ReplayRefused : T-271 owner / scope, order, cardinality, or evidence mismatch
  EnclosureSealing --> Held : T-271 owner / admit pending F_H or child truth and judgment
  EnclosureSealing --> Blocked : T-271 owner / admit semantic or runtime block and judgment
  EnclosureSealing --> RuntimeFailed : T-271 owner / typed non-admitted failure
  EnclosureSealing --> Retrying : T-271 plus C.retry law / admitted retryable judgment and budget remains
  Retrying --> CursorProjected : replay projection owner / derive exact next attempt cursor
  EnclosureSealing --> CursorProjected : T-271 event admission / admitted result, judgment, and next path
  CursorProjected --> Completed : interpreter fold owner / terminal path and one admitted result
  CompileRefused --> [*] : public projection owner / typed invalid stop
  SemanticGap --> [*] : public projection owner / typed unrealized stop
  StartupBlocked --> [*] : public projection owner / gated pre-effect stop
  ReplayRefused --> [*] : public projection owner / typed replay stop
  Held --> [*] : T-272 public F_H owner / pending continuation projection
  Blocked --> [*] : public projection owner / typed blocked stop
  RuntimeFailed --> [*] : public projection owner / typed failure stop
  Completed --> [*] : T-267 and graph traversal owner / consume conserved result
```

## Cross-View Axiom Evaluation

| Axiom | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission/compiler enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|
| Closed seven-constructor family | C-ALGEBRA-001 | Closed `CompiledCPlanNode` variants; recurse is separate | Exhaustive interpreter alternatives | `Interpreting` dispatches only compiled nodes | TypeScript discriminated union | Unknown syntax fails admission | pass | none |
| Compile before effects | C-ALGEBRA-016 | `CompiledCProgramPlan` precedes requests | Compile refusal returns before `EffectAdapter` | `PlanReady` precedes `AtomPending` | Plan-only interpreter input | Global references, carriers, cardinality, and composition close in compiler | pass | none |
| Authored stage conservation | C-ALGEBRA-016; FN-COMP-015/-021 | Source path and digest retained per node | Sequence never synthesizes a C stage | Compiler refusal on lost or replaced locus | Exact recursive plan union | Path census equals admitted tree census | pass | T-267 consumes proof |
| Role/fibre orthogonality | C-ALGEBRA-009 | Domain and composition roles are separate fields | Atom receives exact declared fibre | Mismatch transitions to `CompileRefused` | `C.of` typed fibre | Composition row joined without renaming domain role | pass | none |
| Named workflow transparency | C-ALGEBRA-006; CCALL-013 | Workflow node binds one child GraphFunction | Child runs through public graph start; callback returns one bounded submission | Held/block/complete derive from T-271-admitted enclosure truth | Node carries exact child ref | Selected Module and outer interface resolve exactly | pass | none |
| One C-call enclosure owner | CCALL-002/-004/-006/-009 | `CProgramInterpreter` owns one `CCallEnclosure` per invoking locus | T-271 opens and seals; callback returns interior data only | `EnclosureOpen` and `EnclosureSealing` are T-271-owned | Callback return type contains no C-call admission authority | Exact scope, order, evidence, result, and judgment validate before admission | pass | runtime reconciliation required by conformance re-entry |
| Bounded atom submission | CCALL-006; C-ALGEBRA-018 | One `CProgramAtomInvocationSubmission` separates result, target, interior, evidence, and close basis | No second event-projection callback exists | Missing, duplicate, malformed, or mis-scoped submission cannot leave `AtomPending` | One discriminated callback result | Closed interior/evidence kinds and exact target cardinality validate fail-closed | pass | runtime reconciliation required by conformance re-entry |
| Batch spine identity | C-ALGEBRA-007; CCALL-005 | Ordered task refs plus task ordinal | Each task delegates one child plan; T-271 owns each invoking child spine | Parent remains all-or-block | Non-empty typed task family | Equal carriers/cardinality and stable positions | pass | none |
| One retry law | C-ALGEBRA-008; CCALL-009 | Retry node carries shared policy digest | Retry atom consults replay before another attempt | Only admitted retry moves to `Retrying` | Positive authored budget | Policy digest, allowlist, budget, and replay eligibility rechecked | pass | none |
| Replay-derived continuation | CCALL-004; FN-COMP-011 | Cursor is prime replay projection | Cursor reprojects after T-271 admits the exact enclosure | No controller-local transition | Cursor type excludes decision flags | Replay identity, plan digest, C-call scope, and event order must match | pass | none |
| Raw F_P/F_H output cannot close | C-ALGEBRA-018; FN-COMP-017 | Raw effect result remains inside the callback submission | T-271 admits only validated target/evidence and ordered enclosure truth | Raw output has no transition to `EnclosureSealing` or `Completed` | Closed submission and outcome unions | Existing T-257/T-258 checks supply admitted carriers; T-271 owns enclosure admission | pass | none |
| Graph recurse separation | C-ALGEBRA-001; CCALL-013 | Recurse is deferred relation, not plan node | No recurse interpreter alternative | Unsupported cycle reaches `SemanticGap` | No recurse C variant exists | Graph application compiler owns relation | pass | T-267 join |
| Public invocation integration | T-270 | Router is deferred/downstream | Router supplies plan and consumes outcome | Startup remains blocked without router authority | Not applicable in T-271 | T-270 must join public catalog/start truth | not_applicable | T-270 |
| Whole-program TraversalUnit conservation | T-267 | Downstream projection consumes exact plan | Completed result returns to traversal owner | `Completed` does not self-close graph traversal | Not applicable in T-271 | T-267 must conserve authored and bind rows | not_applicable | T-267 |
| Tenant capability coverage | T-268 | Capability is outside interpreter plan | Router gates before effect | `StartupBlocked` is explicit | Not applicable in T-271 | Canonical manifest admission owns coverage | not_applicable | T-268 |

## Required Proof Matrix

Implementation may begin only after this design is accepted. Closure then
requires these tests against module-owned carriers rather than helper layout:

| Proof | Required observation |
|---|---|
| Native/raw equivalence | Native constructor tree and raw canonical admission compile to the same plan digest. |
| Flat parity | Existing direct `C.of`, `C.edge`, workflow, batch, and retry fixtures remain observationally equivalent. |
| Mixed sequence | `C.compose` threads carriers through at least one `C.of` and one `workflow.C` without flattening the lift. |
| Nested batch | A batch task containing composition executes each leaf under distinct path/task identity; T-271 owns each invoking child enclosure, opens no wrapper spine, and retains all-or-block semantics. |
| Nested retry | `C.retry` around a composite child re-enters only through replay-derived eligibility; T-271 owns each child enclosure and attaches retry judgment only to the exact terminal child C-call. |
| Single enclosure owner | For every invoking leaf and workflow lift, only T-271 admits open, fibre, interior, evidence, result, and judgment rows; the callback cannot submit C-call rows or write replay. |
| Submission cardinality | Each callback invocation returns exactly one `CProgramAtomInvocationSubmission`; absent, duplicate, or contradictory target, evidence, close-basis, or result carriers fail before enclosure sealing. |
| Interior allowlist negative | Unknown, payload-evidence, C-call, lifecycle, retry, continuation, terminal, F_H, or public-operation events in `interiorEvents` fail before admission. |
| Enclosure ordering negative | Injected, reordered, wrong-scope, wrong-basis, wrong-frame, wrong-vector, wrong-edge, or wrong-C-call interior/evidence rows cannot seal or replay. |
| Replay enclosure negative | Replay does not invoke the callback; a receipt with missing, duplicate, or reordered enclosure rows is rejected rather than reprojected as completed. |
| Identity law | Left and right `C.id` add no effect or C-call event and preserve the same admitted payload/lineage. |
| Edge law | `C.edge` retains transform/evaluate/consequence source paths and direct leaves without forcing those roles on open programs. |
| Carrier negative | One inner carrier discontinuity fails compilation before atom invocation. |
| Composition negative | Missing, ambiguous, reordered, or fibre-incompatible composition binding fails before effects. |
| Replay negative | Stale plan, cursor, attempt, task, child frame, or predecessor outcome cannot resume. |
| Role negative | Undeclared role or handler binding cannot invoke an atom. |
| Recursive-shape negative | Self or mutual workflow lift stops before effects; the separate admitted graph-recurse relation remains unchanged. |
| Canonical consumer | T-252 loses only `complete_c_program_interpreter`; no Consensus branch or body-byte change is introduced. |
| Governance | Strict TypeScript, semantic suite, GTL law, three-view Mermaid, DS governance, publication, and `git diff --check` pass. |

## Design Verdict

`accepted`.

The bounded self-review repaired workflow wire-authority, cross-view owner,
compiler/runtime outcome, nested batch/retry spine, composition-row reuse, and
recurse-separation defects before acceptance. The 2026-07-19 conformance audit
then found one remaining ownership contradiction: the earlier prose and views
assigned C-call admission to runtime atoms while the traversal monad requires
T-271 to own each invoking-locus enclosure. This accepted correction replaces
that claim with one neutral `CProgramAtomInvocationSubmission` callback and no
new event, authority, controller, constructor, or traversal path.

The historical implementation proof remains evidence for compilation,
structural interpretation, and replay coordinates. It is not closure evidence
for the corrected callback/enclosure seam until runtime removes
`projectAtomRuntimeEvents`, returns the single submission, and passes the added
proof rows plus independent post-implementation review.
