---
id: T-134
title: Define ABG.Fn composition grammar for F_D, F_P, and F_H interaction
type: feature
ticket_category: abg_fn_composition_grammar
status: completed
review_status: completed_requirements_design_proof
priority: high
owner: codex
created_at: 2026-05-15T22:40:00+10:00
activated_at: 2026-05-16T13:58:40+10:00
updated_at: 2026-05-16T15:40:00+10:00
completed_at: 2026-05-16T14:43:04+10:00
change_class: requirement_reprice
re_entry_point: requirement
goal: first-class-regime-composition-law
release_scope: post-3.7.1 construction substrate grammar design slice
batch_role: foundational_requirements_and_design_contract
active_scope: requirements_and_design_only
build_tenant: typescript
intake_source:
  - user review after T-133 target carrier closure hardening
  - concern that regime behavior is currently distributed across prompts, assurance code, and design prose
  - T-164 pattern from odd_sdlc per-edge gain and closure contracts
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-RULE.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - docs/LLM_GTL_APP_BUILDER_GUIDE.md
  - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_FD_FP_FH_ABSENTIA_GRAPH.md
  - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_CONSCIOUSNESS.md
  - build_tenants/abiogenesis/typescript/design/TRAVERSAL_MODULATION_RUNTIME.md
related_tickets:
  - T-107
  - T-127
  - T-128
  - T-131
  - T-132
  - T-133
  - T-135
  - T-136
  - T-137
  - T-138
  - T-139
dependent_tickets:
  - .ai-workspace/tickets/completed/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
  - .ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md
  - .ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md
  - .ai-workspace/tickets/completed/T-137-declare-generic-overlay-frame-contract-over-graph-and-observed-state.md
  - .ai-workspace/tickets/completed/T-138-classify-fd-outcomes-by-authority-placement-and-pressure-routing.md
  - .ai-workspace/tickets/active/T-139-materialize-construction-pressure-package-for-mixed-fp-and-deterministic-follow-up.md
consolidates:
  - deterministic gate vs probabilistic construction boundary
  - edge assurance contract regime identity
  - target carrier closure identity
  - traversal modulation optimization law
  - F_H absentia handling
  - standards and policy context binding for runtime closure
affected_boundary:
  requirements:
    - specification/PRODUCT.md
    - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
    - specification/requirements/gtl/REQ-L-GTL3-RULE.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
    - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/M03_FD_FP_FH_ABSENTIA_GRAPH.md
    - build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_CONSCIOUSNESS.md
    - build_tenants/abiogenesis/typescript/design/TRAVERSAL_MODULATION_RUNTIME.md
  docs:
    - docs/LLM_GTL_APP_BUILDER_GUIDE.md
deferred_implementation_boundary:
  gtl_code:
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/carriers/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/scenario/
  abg_code:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/event_calculus/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/consciousness/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/traversal_modulation/
  tests:
    - build_tenants/abiogenesis/typescript/test_env/tests/
    - build_tenants/abiogenesis/typescript/test_env/scenarios/
excluded_boundary:
  - product-specific semantic schema engines
  - downstream application data-model validation
  - complete prompt-authoring redesign
  - replacing worker agents or PTY executor behavior
  - turning F_P outputs into deterministic truth
  - giving F_H closure authority
target_truth: >
  ABG.Fn is a first-class composition contract over deterministic, probabilistic,
  and human/held-out regimes. Every published graph function, vector, evaluator,
  assurance gate, and traversal optimization can state the regimes it invokes,
  the order and authority of those regimes, the standards/policy context that
  constrains them, and the closure predicate that admits or rejects the result.
superseded_truth: >
  Regime composition is implied by scattered design prose, prompt instructions,
  evaluator names, and runtime behavior. Closure can be enforced by local
  assurance surfaces without a single declared composition identity binding F_D,
  F_P, F_H, policy context, carrier shape, and traversal optimization.
closure_law: >
  This ticket closes only the requirements and design layer of the ABG.Fn
  composition grammar. It must ratify the participating regimes, host binding,
  deterministic closure authority, evidence-only F_P/F_H placement, standards
  and policy context, and optimization law well enough for the substrate tickets
  to implement against one grammar. Parser, runtime-event, typed-export, and
  live-scenario implementation are deferred to the dependent substrate tickets
  after T-128/T-135/T-136 prove the carrier shape the runner actually needs.
evaluation_criteria:
  - requirements declare ABG.Fn composition as a product law, not just a design note
  - GraphVector, hook, evaluator, rule, payload, policy, and assurance requirements refer to the same composition identity model
  - design describes a concrete ABGFnCompositionContract shape and its closure rules
  - design states which implementation and test obligations are deferred to dependent substrate tickets
  - edge assurance, target carrier closure, regime resolution, observed-state admission, overlay frames, F_D placement, and construction pressure packages have one declared grammar binding
  - typed exports are explicitly deferred until a consuming implementation ticket proves the shape needed by the runner or downstream product
proof_surface:
  static:
    - npm run lint:semantic
    - npm run lint:test-harness
    - npm run test:semantic
  focused:
    - requirements/design consistency review for the ABG.Fn grammar
    - dependent-ticket dependency graph review proving all implementation tickets bind to T-134
  deferred_to_dependents:
    - focused ABG.Fn contract parser/admission tests
    - focused edge-assurance composition binding tests
    - focused traversal-modulation optimization tests
    - focused replay projection tests
    - live F_D-only, F_P-to-F_D, F_H absentia, and optimized-F_D scenario tests
closure_evidence:
  - specification/PRODUCT.md declares ABG.Fn composition binding in the probabilistic compute boundary.
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md ratifies the replay-stable ABG.Fn composition contract requirements.
  - GTL graph-vector, hook, evaluator, and rule requirements now bind regime, declaration, and authority placement to the same composition identity.
  - ABG assurance, payload, and policy requirements now preserve selected composition ref/digest and reject hidden defaults, lazy filesystem lookup, prompt authority, and null/default code paths.
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_DERIVATION.md defines schema, declaration precedence, closure law, deferred implementation ownership, and proof mapping.
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md declares the prime and subordinate carrier split.
  - build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md adds the structural carrier diagram required by DESIGN_MODULE_METHOD.
  - Dependent substrate tickets T-128, T-135, T-136, T-137, T-138, and T-139 list T-134 as their grammar dependency.
  - 2026-05-16 `git diff --check` passed.
  - 2026-05-16 `npm run lint:test-harness` passed.
  - 2026-05-16 `npm run lint:semantic` passed.
  - 2026-05-16 `npm run test:t097` passed after a harness timeout-race repair in the supervised process actor escalation test.
  - 2026-05-16 `npm run test:semantic` passed: 531 tests, 0 failures.
non_closure_conditions:
  - ABG.Fn remains only prose without a ratified requirements/design contract schema
  - a vector-local composition declaration can bind to a different host vector, target, schema, or assurance contract
  - edge assurance can close without the selected composition contract identity
  - target carrier closure is not bound to the selected composition contract where required
  - projection loads defaults or policy context lazily from process.cwd during replay
  - F_P findings are treated as closure law rather than evidence for F_D admission
  - F_H absentia is modeled as a missing worker instead of a declared regime state
  - traversal optimization can replace F_P behavior without proving equivalence against the declared composition contract
  - tests only assert happy-path parsing and do not derive negative cases from the same contract
---

# T-134 - Define ABG.Fn Composition Grammar For F_D, F_P, And F_H Interaction

## STDO Triage

Smallest lawful re-entry point: `requirement_reprice`.

Reason: the missing surface is not only implementation detail. The product
currently has regime concepts across GTL evaluators, ABG assurance, construction
consciousness, target carriers, and traversal modulation, but no first-class
contract that states how those regimes compose for a graph function or edge.

This ticket is the foundational requirements/design contract for the active
construction-substrate batch. The dependent implementation tickets must bind to
it before they land code:

- `T-128`: installed construction runner
- `T-135`: vector-local effective runtime regimes
- `T-136`: observed-state/register admission
- `T-137`: overlay-frame contract
- `T-138`: F_D authority placement
- `T-139`: construction pressure package

The active closure is not a 4-layer waterfall. It is a layered contract:

1. Requirements define ABG.Fn composition as a product law.
2. Design defines the contract, declaration sites, precedence, and projection
   model.
3. Realization adds typed admission and runtime enforcement only through the
   dependent substrate tickets after the runner/observation shape is proven.
4. Tests prove closure from the same contract used by implementation in those
   dependent tickets.

Typed exports for downstream builders are deferred until a consuming
implementation ticket proves the required shape. T-134 must not ship an export
surface ahead of runner or consumer evidence.

## Design Module Method Notes

Governing standard:
`/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`.

ODD alignment: this ticket defines the GTL/ABG grammar for regime composition.
It must not replace graph functions, graph vectors, or traversal law with a
deterministic module API. The grammar is the carrier contract that dependent
modules implement under ODD authority.

Module roles:

- carrier module design for `ABGFnCompositionContract`;
- admission-boundary design for host binding, digest, standards/policy context,
  carrier context, assurance context, closure, and optimization;
- design source for dependent semantic kernels, projections, and effect shells.

Irreducible Architectural Carrier Set for the grammar:

- `ABGFnCompositionContract`;
- `ABGFnHostBinding`;
- `ABGFnRegimeBinding`;
- `ABGFnClosureContract`;
- `ABGFnOptimizationContract`;
- `ABGFnContextBinding` for standards, policy, carrier, and assurance context
  if design proves one shared context carrier is prime.

Subordinate payloads: template examples, positive/negative proof cases,
standards refs, policy refs, and nested carrier/assurance refs remain subordinate
unless they are independently admitted, published, versioned, or pattern-matched
by consumers.

Design assets required before T-134 closure:

- requirements/design schema for the IACS above;
- structural carrier diagram for the ABG.Fn composition grammar;
- declaration-site and precedence table;
- reference-derived mapping from T-133 target-carrier identity and the active
  construction-substrate tickets to the target grammar;
- explicit deferred implementation map showing which dependent ticket owns each
  parser, runtime event, projection, typed export, and test proof;
- design-method review record before closure.

This is not a prompt-polish task. Prompt text may expose the contract to workers,
but prompt text must not be the authority surface.

## Problem

ABG already uses three regime classes:

- `F_D`: deterministic functions, gates, projections, validators, and closure
  folds.
- `F_P`: probabilistic construction, interpretation, proposal, diagnosis, and
  repair behavior.
- `F_H`: human or held-out judgement, including explicit absentia.

The current product has useful laws for each region, but the composition between
them is implicit. That leaves several bugs and drift paths open:

- A graph vector can imply a regime without a stable contract identity.
- An assurance gate can enforce local evidence while losing the function-level
  composition identity that made the evidence meaningful.
- An F_P worker can be asked to construct a value without a typed statement of
  what F_D will admit.
- F_H absentia can be treated as an operational gap instead of a declared
  graph state.
- Traversal modulation can optimize behavior without an explicit law that says
  when a probabilistic step has been replaced by an equivalent deterministic
  function.
- Tests can exercise code paths without co-affirming the same design asset as
  implementation.

T-133 hardened target-carrier closure by requiring the selected contract identity
to survive admission and replay. T-134 applies the same discipline one layer up:
the function or edge must declare the regime composition that makes carrier,
assurance, policy, traversal, and closure evidence interpretable.

## Target Contract

The required surface is a typed, serializable, replay-stable contract. The
exact naming may change during design, but the work must converge on an
equivalent shape:

```ts
export interface ABGFnCompositionContract {
  readonly kind: "abg.fn_composition";
  readonly version: "1";
  readonly contractRef: string;
  readonly contractDigest: string;

  readonly host: ABGFnHostBinding;
  readonly regimes: ABGFnRegimeBinding[];
  readonly standardsContext: ABGFnStandardsContext;
  readonly policyContext: ABGFnPolicyContext;
  readonly carrierContext: ABGFnCarrierContext;
  readonly assuranceContext: ABGFnAssuranceContext;
  readonly closure: ABGFnClosureContract;
  readonly optimization?: ABGFnOptimizationContract;
}
```

Required supporting declarations:

```ts
export interface ABGFnHostBinding {
  readonly graphFunctionRef?: string;
  readonly graphVectorRef?: string;
  readonly evaluatorRef?: string;
  readonly ruleRef?: string;
  readonly operatorRef?: string;
  readonly sourceNodeRef?: string;
  readonly targetNodeRef?: string;
  readonly targetSchemaRef?: string;
}

export interface ABGFnRegimeBinding {
  readonly regime: "F_D" | "F_P" | "F_H";
  readonly role:
    | "construct"
    | "observe"
    | "validate"
    | "gate"
    | "repair"
    | "escalate"
    | "close"
    | "absentia";
  readonly authority: "closure" | "evidence" | "advisory" | "absent";
  readonly order: number;
  readonly inputCarrierRef?: string;
  readonly outputCarrierRef?: string;
  readonly evidenceRef?: string;
}

export interface ABGFnClosureContract {
  readonly closureFunctionRef: string;
  readonly closureRegime: "F_D";
  readonly requiredEvidenceRefs: readonly string[];
  readonly rejectionEvidenceRefs: readonly string[];
  readonly replayProjectionRef: string;
}
```

Contract requirements:

- `contractRef` is stable and human-addressable.
- `contractDigest` is calculated over normalized contract content.
- `host` binds the contract to the GTL surface that owns it.
- `regimes` state the participating regimes, their order, and their authority.
- `standardsContext` binds the standards or method authority used by the graph
  function.
- `policyContext` binds admissible runtime policy, fallback, and escalation
  law.
- `carrierContext` binds source, target, and target-carrier contracts where
  applicable.
- `assuranceContext` binds edge assurance and evidence requirements.
- `closure` states the deterministic function that can admit or reject the
  result.
- `optimization` states when an F_P step may be replaced by an F_D function.

## Mandatory Contract Components

Every ABG.Fn composition contract must explicitly contain these components.
No component may be implied by default code, prompt text, or worker behavior.

### 1. Host Identity

Missing component being closed:

The current runtime can infer a function or vector from surrounding objects, but
there is no single typed contract that binds regime composition to the owning
GTL host.

Required fields:

- graph function reference when the host is a public graph function
- graph vector reference when the host is an edge/vector
- evaluator, rule, or operator reference when composition is local to those
  surfaces
- source node reference when edge-local composition depends on source state
- target node reference and schema reference when closure admits a target

Justification:

Composition identity must not float. If the contract says an F_P worker proposes
a target and an F_D gate closes it, replay must know which vector, function, or
evaluator owned that relationship.

### 2. Regime Register

Missing component being closed:

`F_D`, `F_P`, and `F_H` are presently visible across design and requirements,
but the runtime does not have a required register that says which regimes
participate in a graph function.

Required fields:

- regime kind
- role
- authority level
- evaluation order
- input and output carrier references when the regime transforms a payload
- evidence reference when the regime emits observed evidence

Justification:

F_P may construct and diagnose, but it cannot close. F_H may be present,
deferred, or absent, but absentia must be declared rather than discovered as an
operator failure. F_D must own admission and replay projection. These authority
differences need a typed register.

### 3. Standards Context

Missing component being closed:

Workers currently receive standards and design context through prompts and
selected documents, while runtime closure often only sees evidence payloads.

Required fields:

- standards document refs
- requirement refs
- design refs
- version or digest refs where available
- local override refs where a builder product installs a standards copy

Justification:

The same F_P output has different meaning under different standards. The
contract must say which standards context constrained construction and which
context the deterministic gate used for admission.

### 4. Policy Context

Missing component being closed:

Policy, fallback, escalation, and admissible runtime behavior are governed in
ABG requirements but are not bound into a single function composition identity.

Required fields:

- policy profile ref
- fallback policy ref
- escalation policy ref
- observability policy ref
- replay policy ref

Justification:

Closure must not depend on ambient runtime policy. Replay must project the same
composition outcome from the same policy context, or reject the projection as
non-equivalent.

### 5. Carrier Context

Missing component being closed:

Target carrier contracts now exist, but the higher-level function composition
contract does not yet state when those carrier contracts are required by a
function or edge.

Required fields:

- source carrier ref
- target carrier ref
- target carrier contract ref and digest where applicable
- payload ledger projection ref
- accepted/rejected payload evidence refs

Justification:

The target carrier proves the target envelope. ABG.Fn composition proves why
that target envelope is the right closure surface for this function or edge.

### 6. Assurance Context

Missing component being closed:

Edge assurance has its own contract surface, but the relationship between edge
assurance and function composition is not yet a mandatory typed binding.

Required fields:

- edge assurance contract ref
- edge assurance contract digest
- required evidence refs
- closure-gate ref
- assurance projection ref

Justification:

Assurance evidence without composition identity can prove the wrong thing. The
runtime must know which composition contract selected the assurance contract.

### 7. Closure Predicate

Missing component being closed:

Closure is enforced by concrete code paths, but there is no uniform contract
field that states the deterministic closure function for a graph function or
edge.

Required fields:

- deterministic closure function ref
- closure regime, always `F_D`
- required evidence refs
- rejection evidence refs
- replay projection ref
- closure event ref or event kind

Justification:

This preserves the boundary: F_P and F_H can provide evidence, pressure, or
proposals, but only an F_D closure predicate admits graph state.

### 8. Optimization Contract

Missing component being closed:

Traversal modulation can observe that a probabilistic path has become stable,
but the product lacks a typed law for replacing an F_P step with an F_D
function.

Required fields:

- source composition contract ref and digest
- proposed deterministic replacement function ref
- equivalence proof refs
- positive case refs
- negative case refs
- rollback or invalidation policy ref

Justification:

Optimization is lawful only when it preserves semantics under the declared
composition contract. A faster path is not sufficient proof.

## Contract Authority Rules

1. `F_D` is the only closure authority.
2. `F_P` may construct, propose, diagnose, repair, summarize, and supply
   evidence.
3. `F_P` findings are not closure law.
4. `F_H` may be represented as present, deferred, or absentia.
5. `F_H` absentia is a declared graph state, not a runtime failure.
6. Policy and standards context must be explicit contract inputs.
7. Target carrier and edge assurance contracts may be referenced or embedded,
   but their identities must remain visible.
8. Replay must derive from recorded events and admitted contracts, not ambient
   filesystem reads or current process configuration.
9. Optimization is a contract-preserving transformation, not an operator
   preference.

## Graph And Function Inventory

This ticket touches the language/runtime graph, not one downstream product
graph. The following register is the complete initial work surface. During
implementation, every addition or deletion must update this section.

### GTL Nodes And Carriers

Affected graph nodes and carriers:

- `GraphFunction`: must be able to declare or reference an
  `abg.fn_composition` contract.
- `GraphVector`: must be able to bind composition identity to source, target,
  declarations, hooks, target carrier, and edge assurance.
- `Operator`: must declare which regime it executes or invokes.
- `Evaluator`: must distinguish deterministic closure from probabilistic
  evidence.
- `Rule`: must preserve gate/evaluator split and identify deterministic closure
  rules.
- `Hook`: must not become hidden composition authority; hook-local declarations
  must bind back to the host vector/function.
- `Module`: must publish composition defaults or templates without making them
  invisible runtime defaults.
- `Scenario`: must be able to carry composition proof cases.

### ABG Runtime Nodes

Affected runtime nodes and projections:

- `Job`: records selected composition contract for a run or edge invocation.
- `Role`: records whether a worker acts as F_P constructor, F_D gate, or F_H
  observer/escalation surface.
- `InvocationFrame`: carries composition context into runtime traversal.
- `PayloadLedger`: records payload evidence under the selected composition.
- `AssuranceProjection`: projects evidence against selected composition,
  assurance, and carrier identities.
- `TargetCarrierAdmissionProjection`: admits carrier satisfaction only under
  the selected carrier contract and composition where required.
- `TraversalAttemptEnvelope`: records regime, optimization, and fallback state.
- `TraversalModulationProfile`: records whether a traversal is F_P-backed,
  F_D-backed, or undergoing lawful optimization.
- `ConstructionConsciousnessProjection`: records ambiguity, repair pressure, and
  F_P findings as evidence, not closure.
- `EventCalculusProjection`: derives replay-visible facts from admitted events.

### Graph Functions To Be Defined Or Extended

The following graph functions or function families must exist as first-class
contract shapes. Names can change during design, but equivalent graph functions
must be present.

| Function family | Required role | Closure rule |
| --- | --- | --- |
| `Fn_D` | pure deterministic validation/projection/closure | closes directly when inputs satisfy deterministic predicate |
| `Fn_P` | probabilistic construction/proposal/diagnosis | emits evidence only; cannot close without F_D gate |
| `Fn_H` | human/held-out judgement or absentia | emits present/deferred/absent state; cannot close alone |
| `Fn_DP` | F_P proposes, F_D validates | closes only when F_D admits selected proposal |
| `Fn_DH` | F_H supplies evidence or absentia, F_D validates | closes only when F_D admits required human/absentia evidence state |
| `Fn_DPH` | F_P constructs, F_H may review or be absent, F_D closes | closes only when deterministic evidence requirements are satisfied |
| `Fn_opt_D` | deterministic replacement for prior F_P path | closes only after equivalence proof against source composition |
| `Fn_repair_P_to_D` | probabilistic repair loop under deterministic rejection | closes only when repaired output satisfies F_D predicate |

### Code Functions Expected To Be Touched

This is a deferred implementation register for the dependent substrate tickets.
The implementation pass must verify and update the concrete names from the
codebase. This initial register is intentionally explicit so the grammar is not
lost in general architecture prose, but T-134 itself does not own these code
edits.

GTL contract and carrier surfaces:

- `parseGraphVector` and related graph-vector admission helpers
- graph function declaration/admission helpers
- operator contract admission helpers
- evaluator contract admission helpers
- rule/gate contract admission helpers
- hook declaration resolution helpers
- target carrier binding helpers

ABG assurance and payload surfaces:

- `evaluateAssuranceGate`
- `deriveAssuranceProjection`
- `deriveAssuranceClosureDecision`
- `derivePayloadLedgerProjection`
- `deriveTargetCarrierAdmissionProjection`
- payload observed/validated/rejected event factories
- edge assurance contract parsing/admission helpers

ABG traversal and consciousness surfaces:

- `runEngineIterate`
- `runEngineIterateAsync`
- traversal attempt envelope builders
- traversal modulation profile derivation
- construction consciousness projection helpers
- F_P finding/evidence event factories
- F_H absentia event/projection helpers

Installer/runtime surfaces:

- config admission for any generic composition templates
- installed editable config copy if defaults are required
- replay bootstrap admission for composition defaults
- public exports for the new contract surface

Test surfaces:

- contract parser tests
- vector-local binding tests
- assurance-gate closure tests
- payload-ledger replay tests
- traversal-modulation optimization tests
- live scenario tests covering F_D, F_P-to-F_D, F_H absentia, and optimized F_D

## Required Design Output

The design pass must produce a document or section that answers these questions:

1. What is the exact `abg.fn_composition` contract schema?
2. Where can the contract be declared?
3. Which declaration wins when module, graph function, vector, evaluator, or
   hook all provide composition information?
4. How does a vector-local declaration prove it belongs to the host vector?
5. How does the contract bind target carrier identity?
6. How does the contract bind edge assurance identity?
7. How does the contract bind standards and policy context?
8. How are F_P findings recorded without making them closure law?
9. How is F_H absentia represented?
10. How does replay admit the same contract without filesystem drift?
11. How is a probabilistic path replaced by an optimized deterministic path?
12. Which tests must be derived from the same contract as implementation?

## Realization Requirements

### Requirement Layer

Update the relevant requirement files so they state:

- ABG.Fn composition is a product-level contract surface.
- Graph functions and vectors may not hide regime composition in prose.
- Evaluators distinguish deterministic closure from probabilistic evidence.
- Rules and gates preserve deterministic closure authority.
- Payload and target carrier admission can bind to composition identity.
- Assurance closure requires the selected composition identity where applicable.
- Policy and standards context are explicit inputs to closure.
- F_H absentia is a declared runtime graph state.
- Traversal optimization is a contract-preserving transformation.

### Design Layer

Update M03 design surfaces so they define:

- the composition contract schema
- declaration sites and precedence
- replay/admission sequence
- event and projection shape
- relationship to edge assurance and target carrier contracts
- optimization law
- negative case derivation

### Deferred Implementation Constraints

Do not add code under T-134. Add code only through the dependent substrate
tickets after requirements/design are coherent and T-128/T-135/T-136 have
proven the runner, regime, and observed-state carrier shapes.

Required implementation behavior:

- parse/admit `abg.fn_composition` contracts
- normalize and digest contracts consistently
- reject null composition for surfaces that require closure
- allow generic templates through config, not hardcoded fallback objects
- bind vector-local declarations to the hosting vector/function
- bind assurance closure to selected composition identity
- bind target carrier closure to selected composition identity where required
- record selected contract ref and digest in relevant events
- derive replay projection from admitted events/config, not lazy filesystem reads
- expose typed exports for downstream builders only when a consuming
  implementation ticket proves the required export shape

### Deferred Test Constraints

Tests must use the same contract asset for implementation and verification.

Required positive tests:

- F_D-only closure admits a deterministic graph function.
- F_P construction plus F_D closure admits a valid target.
- F_H absentia is represented as declared evidence and does not crash the run.
- Target carrier admission remains bound to selected composition identity.
- Edge assurance closure remains bound to selected composition identity.
- Optimized F_D replacement admits only after equivalence proof.

Required negative tests:

- vector-local composition references the wrong target node
- vector-local composition references the wrong target schema
- F_P evidence attempts to close without F_D gate
- F_H absentia is missing when required by the contract
- target carrier digest mismatch
- edge assurance digest mismatch
- standards/policy context mismatch on replay
- optimized F_D replacement lacks positive and negative equivalence cases
- projection attempts lazy filesystem default loading during replay

## Functional Predicate

The closure predicate for an ABG.Fn contract can be stated as:

```text
admit_abg_fn_contract(C, Host, Events, RuntimeConfig) iff
  C.kind = "abg.fn_composition"
  and digest(normalize(C)) = C.contractDigest
  and host_binding_matches(C.host, Host)
  and all required standards refs are admitted
  and all required policy refs are admitted
  and every regime binding has a declared authority
  and no non-F_D regime has closure authority
  and closure.closureRegime = F_D
  and required carrier contracts are admitted under selected digest
  and required assurance contracts are admitted under selected digest
  and closure evidence projects from Events under C.contractDigest
  and replay projection does not consult ambient filesystem state
```

Optimization predicate:

```text
admit_optimized_fn(C_source, C_optimized, Proof) iff
  C_source.contractDigest is admitted
  and C_optimized.closure.closureRegime = F_D
  and Proof.positiveCases derive from C_source
  and Proof.negativeCases derive from C_source
  and Proof.equivalenceProjection admits the same closure/rejection outcomes
  and invalidation policy is declared
```

## Runtime Lifecycle

Definition-time lifecycle:

1. A graph function, vector, evaluator, rule, or module declares a composition
   contract or references a declared template.
2. The contract is normalized and digested.
3. Host identity is cross-checked against the owning GTL surface.
4. Standards and policy context are admitted.
5. Carrier and assurance dependencies are admitted.
6. The contract becomes available to runtime traversal.

Invocation-time lifecycle:

1. Runtime selects the composition contract for the graph function or edge.
2. F_P workers receive the contract as construction context when invoked.
3. F_P workers emit findings or candidate payloads as evidence.
4. F_H state is recorded as present, deferred, or absentia when required.
5. F_D gates validate payload, carrier, assurance, and policy evidence.
6. Closure event records selected contract ref and digest.
7. Replay projection derives the same admitted or rejected state from events.

Optimization lifecycle:

1. Traversal modulation observes a stable F_P-backed path.
2. A deterministic replacement function is proposed.
3. Positive and negative cases are generated from the source contract.
4. The deterministic function proves equivalent closure/rejection behavior.
5. The optimized function is admitted as `Fn_opt_D`.
6. Runtime may select the optimized path while preserving source lineage.

## Edge Categories And Templates

The ticket should produce generic templates, not hardcoded hidden defaults.
Templates may live in config or published GTL assets.

Required templates:

### Template A - Deterministic Gate

Use when a graph function can evaluate closure without F_P or F_H.

Required regimes:

- `F_D` with role `gate`
- `F_D` with role `close`

### Template B - Probabilistic Construction With Deterministic Closure

Use when a worker constructs or repairs a target but deterministic code admits
or rejects the result.

Required regimes:

- `F_P` with role `construct` or `repair`
- `F_D` with role `validate`
- `F_D` with role `close`

### Template C - F_H Absentia With Deterministic Closure

Use when human review can be present, deferred, or absent, and the graph still
needs a lawful runtime state.

Required regimes:

- `F_H` with role `absentia`, `observe`, or `escalate`
- `F_D` with role `validate`
- `F_D` with role `close`

### Template D - Full D/P/H Composition

Use when probabilistic construction, human review or absentia, and deterministic
closure all participate.

Required regimes:

- `F_P` with role `construct`
- `F_H` with role `observe`, `escalate`, or `absentia`
- `F_D` with role `validate`
- `F_D` with role `close`

### Template E - Optimized Deterministic Replacement

Use when a previous F_P-backed path is replaced by deterministic logic.

Required regimes:

- source contract regimes from prior composition
- `F_D` with role `validate`
- `F_D` with role `close`

Required proof:

- source contract ref and digest
- deterministic replacement ref
- positive equivalence cases
- negative equivalence cases
- invalidation policy

## Review Finding Disposition

This ticket accepts the following findings as real design gaps:

1. Regime composition is not a first-class typed contract.
2. F_D/F_P/F_H authority is not uniformly expressed at function or edge level.
3. Edge assurance and target carrier contracts are not yet bound by a shared
   function composition identity.
4. Standards and policy context can be implicit in prompt/runtime setup instead
   of explicit in replay-visible contract state.
5. F_H absentia needs a declared graph state.
6. Traversal optimization needs a typed equivalence contract.
7. Tests need to derive from the same contract assets as implementation.

The ticket rejects the following overreach:

1. ABG should not become a product-specific schema engine.
2. ABG should not make downstream semantic meaning deterministic.
3. ABG should not require F_H for every graph function.
4. ABG should not treat all F_P output as suspect; it should type F_P output as
   evidence with explicit closure requirements.
5. ABG should not hide default behavior in code. Defaults, if required, must be
   admitted from config or published assets.

## Completion Checklist

- [x] Requirements updated and internally consistent.
- [x] Design contract written with explicit missing components.
- [x] IACS and structural carrier diagram added to the governing design surface.
- [x] Declaration sites, precedence, host-binding, standards/policy context,
      carrier/assurance binding, F_H absentia, and optimization law are stated.
- [x] Dependent substrate tickets list T-134 as a dependency or dependent
      grammar binding.
- [x] Parser/admission, runtime-event, typed-export, and live-scenario work is
      explicitly deferred to dependent implementation tickets.
- [x] `npm run lint:semantic` passes for the changed requirements/design
      surfaces.
- [x] `npm run test:semantic` passes when the changed requirements/design
      surfaces are included in semantic tests.

## Closure Statement To Prove

T-134 can close only when ABG has a first-class requirements/design contract for
replay-stable function composition that makes F_D, F_P, and F_H interaction
explicit at graph function and edge boundaries, and when assurance, carrier,
policy, standards, regime resolution, observed-state admission, overlay frames,
F_D placement, and construction pressure tickets are all explicitly bound to
that same grammar identity. Code-level consumption closes in the dependent
substrate tickets, not in T-134.

The result should be a narrow boundary lock, not a broad semantic prison:

- ABG owns regime authority, identity, evidence, replay, and closure.
- GTL owns published graph/function declaration surfaces.
- F_P workers own construction and repair attempts.
- F_H is explicit when present, deferred, or absent.
- Downstream products own domain meaning beyond the generic contract envelope.
