# M03 Edge Assurance Contract Derivation

**Status**: Active
**Date**: 2026-05-13
**Purpose**: Design the T-130/T-131 GTL/ABG boundary for declared edge gain,
close, residual pressure, and replay-visible F_P hook findings.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md`
- `M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md`
- `T-130`
- `T-131`
- `T-133`

## Position

An edge traversal is a functional boundary:

```text
current edge state + declared contract + admitted evidence
-> gain finding
-> close/residual/continuation finding
-> ABG admission
-> assurance projection and next lawful basis
```

GTL declares the contract. F_P performs the constructive or semantic work inside
that contract. ABG records the hook action, admits or rejects returned findings,
projects assurance, and routes the next basis. Plugins and worker reports do not
own runtime events, ledgers, projections, selected vectors, or closure.

The design is functional-programming first. The central runtime objects are
immutable carriers. The semantic steps are total or fail-closed transforms over
those carriers. Effects sit at the shell: invoking a plugin, observing a
workspace, reading fallback config, or writing an event sink. No controller may
reconstruct edge closure from prompt prose, file presence, worker percent
complete, or a gap table that is not admitted under the declared edge contract.

## Edge Assurance Contract

`EdgeAssuranceContract` is the GTL-to-ABG contract for one closure-capable edge.
It names:

- target outcome
- authority surface refs
- obligation binding refs
- transform F_P contract
- eval F_P contract
- eval prompt input and expected output contract refs
- admissible evidence policy
- admitted evidence kinds
- gain report schema
- metric function ref
- close decision schema
- residual pressure schema
- continuation schema
- A-to-Z composition law
- cheap structural check refs
- policy refs

Gain is not required to be scalar. A scalar may be one domain's metric, but the
generic carrier records refs to the gain report and metric functions, then lets
the domain contract define what those refs mean. Closure is not an F_P claim. It
is an ABG projection over admitted findings and assurance rows.

The first projection carrier for this slice is
`EdgeAssuranceEvaluationProjection`. It consumes the selected contract, eval hook
action, admitted finding, existing `AssuranceProjection`, and existing
`AssuranceClosureDecision`. The F_P close disposition remains a proposed close
disposition. The ABG assurance fold remains the actual close, retry, reprice,
block, or defer decision.

## Target Carrier Contract

T-133 adds the missing output-carrier side of the edge contract. Edge assurance
can declare target outcome, gain, metric, close, residual, continuation, and
composition law, but closure still needs a structural target carrier that can be
admitted before semantic closure is lawful.

Every graph-vector output has an effective `gtl.target_carrier_contract`
binding. The vector may declare a product-specific binding. If it does not, the
generic binding is read from visible GTL defaults config:

```text
config/gtl.target-carrier-defaults.json
-> generic output template
-> materialized target carrier contract for vector.target
```

The generic binding is not a code constant and not null. Missing or malformed
config fails closed. A product-specific vector-local binding still wins over the
config default.

The binding declares:

- target node ref
- output surface ref
- output carrier family and kind
- envelope contract ref
- nested payload path
- required fields
- fixed protocol fields
- worker-fillable fields
- literal or enum domains
- schema and admission refs
- payload-ledger binding ref
- edge-assurance binding ref
- handoff projection ref
- construction template ref
- replay digest policy ref
- materialization policy ref
- closure precondition ref
- test-case generation ref

ABG payload-ledger projection records the selected target-carrier contract ref
and digest. Closure cannot treat file presence, worker prose, or arbitrary
payload existence as target satisfaction. The target carrier must be admitted
under the selected contract, and rejected or missing target carriers remain
non-closing pressure.

## Resolution Law

ABG resolves an edge assurance contract from visible GTL surfaces in this order:

1. `GraphVector.declarations["abg.edge_assurance_contract"]`
2. `GraphFunction.declarations["abg.edge_assurance_contract"]`
3. `Job.policyHooks["abg.edge_assurance_contract"]`
4. `Role.policyHooks["abg.edge_assurance_contract"]`
5. `Module.policyHooks["abg.edge_assurance_contract"]`
6. replay-visible ABG defaults

A vector-local declaration has highest authority for the edge. Wider policy
surfaces may supply defaults but cannot override the vector-local contract. A
present malformed declaration fails closed. Absence does not authorize automated
closure.

## F_H By Absentia

If no assurance contract is declared, ABG resolves
`EdgeAssuranceAbsentiaResolution`:

```text
edge assurance contract absent
-> F_H assurance required
-> human declares close, continue, reprice, block, defer
   or performs direct worksite transform
-> ABG observes and admits the scoped judgment or changed state
```

The graph overlay governs interpretation, traversal, and measurement over the
workspace. It is not the only materializer of the workspace. F_H may change the
underlying workspace directly; ABG only owns the scoped observation/admission and
the subsequent assurance projection.

## Hook Action Typing

T-130 requires every consequential hook call to become replay-visible before its
returned data can influence runtime truth:

```text
ABG calls plugin.<hook_class>.F_P
plugin returns findings
ABG records HookActionRecord
ABG admits or rejects HookFindingAdmission
ABG derives owning projection, event, ledger, or intent truth
```

The first hook classes are `traversal`, `eval`, `transform`, `admission`, and
`projection`. Each hook action records the hook class, plugin ref, input basis
refs, policy refs, config refs, returned finding refs, admission refs,
predecessor refs, and intended output surface. The hook action is a carrier, not
a side effect.

## F_D Boundary

F_D is not the generic semantic recognizer for arbitrary software work. In this
slice F_D may check structural envelope law:

- schema shape
- required refs
- identity and digest consistency
- declared precedence
- evidence presence
- write-root and provenance refs
- forbidden authority fields

Domain-owned deterministic semantics may later add stronger F_D checks, but the
generic GTL/ABG edge contract relies on constrained F_P plus ABG admission for
semantic gain and close.

## Effect Boundary

Pure kernel:

- contract construction
- contract resolution
- absentia resolution
- hook action construction
- finding admission/rejection
- forbidden-authority rejection

Effect shell:

- plugin invocation
- worksite observation
- runtime event emission
- config file loading
- archive/report writing

The runner may call the effect shell, but it must pass through the pure carriers
before any consequential runtime truth is projected.

## Proof Hand-Off

The first proof slice must show:

- valid vector-local edge assurance contracts resolve with highest precedence,
- graph function, job, role, module, and visible defaults only supply lower
  precedence defaults,
- malformed declarations fail closed,
- missing declarations resolve to F_H absentia,
- F_P eval findings contain gain, close disposition, residual pressure, evidence,
  authority, and composition refs,
- F_P eval findings cannot smuggle events, ledgers, projections, vector choice,
  or closure authority,
- hook actions and finding admissions form a replayable chain from hook call to
  admitted finding,
- admitted edge eval findings project gain, residual pressure, continuation, and
  next-action basis through ABG-owned projection/read-model carriers,
- qualified defer preserves continuation, residual pressure, and composition
  contribution as the next-action basis,
- an F_P-proposed `close` cannot override a non-close `AssuranceClosureDecision`,
- an F_P-proposed human-assurance disposition is distinct from F_H absentia for
  a missing edge assurance contract.
