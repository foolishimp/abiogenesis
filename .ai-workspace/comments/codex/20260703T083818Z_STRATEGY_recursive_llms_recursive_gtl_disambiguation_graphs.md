# Strategy: Recursive LLMs, Recursive GTL Graph Functions, And Disambiguation Graphs

**Status**: strategy commentary, not ratified specification
**Date**: 2026-07-03
**Author**: Codex
**Project**: Abiogenesis
**Scope**: Recursive Language Models, GTL graph functions, ABG traversal monad, GLC, SDLC-style disambiguation pipelines, requirement/proof carry-through, and lifecycle closure

## Source Paper

Alex L. Zhang, Tim Kraska, and Omar Khattab, **"Recursive Language
Models"**, arXiv:2512.24601, submitted 2025-12-31, revised v3
2026-05-11.

- Paper: <https://arxiv.org/abs/2512.24601>
- Revised HTML: <https://arxiv.org/html/2512.24601v3>
- Code: <https://github.com/alexzhang13/rlm>

The paper proposes Recursive Language Models (RLMs): an inference scaffold that
treats a long prompt as external environment state, gives the model a symbolic
handle to that state, lets the model write code against it, and lets that code
recursively call sub-LLMs or sub-RLMs over selected slices.

The relevant abstraction is not "make the model context bigger." The relevant
abstraction is:

```text
external state
  -> symbolic inspection and decomposition
  -> recursive semantic calls over selected sub-context
  -> aggregation into intermediate state
  -> final response
```

The paper implements this with a Python REPL, variables, `llm_query`, recursive
calls, and final-answer tags. That is a useful prototype shape, but it leaves
the hard lifecycle questions outside the formal model: authority, admissibility,
obligation conservation, proof coverage, residual pressure, replay, and closure.

## Claim

RLMs are best understood in Abiogenesis as an untyped instance of a more general
pattern:

```text
recursive disambiguation over external state
```

GTL and ABG can express the same pattern with stronger semantics:

```text
workspace/context binding
  -> selected GTL program or overlay
  -> direct GTL graph-function call
  -> ABG traversal bind
  -> F_D/F_P/F_H stage effects
  -> admitted payload/evidence/projection truth
  -> recursive child graph-function traversal
  -> foldback into parent obligation state
  -> closure, residual, re-entry, or continuation
```

The graph-function call is direct in GTL program structure. It is not a direct
runtime callback. Its denotation is an ABG traversal-monad bind.

```text
GTL:  F calls G
ABG:  bind(parent traversal state, selected call to G)
```

That distinction is the key. It allows graph functions to be ordinary reusable
program functions while keeping ABG as the runtime unit of compute,
admissibility, replay, and closure.

This is a clarification of the intended GTL/ABG model, not a second execution
mode. GTL graph functions were always intended to be recursively callable,
including tail-recursive self-calls. The RLM paper supplies a useful comparison
point because it shows why recursion over external state is powerful, but it
does not introduce the recursion requirement for Abiogenesis.

The single semantic rule is:

```text
Every GTL graph-function call denotes ABG traversal bind.
Every ABG traversal is recursion-capable.
A traversal with no child calls is the base case.
```

Therefore there should not be two modalities:

```text
normal graph traversal
recursive graph traversal
```

There is one traversal semantics. Recursion is a shape that traversal can take.

## Translation Table

| RLM paper surface | GTL / ABG / GLC surface | Correction |
| --- | --- | --- |
| prompt as external environment | workspace/context binding plus admitted payloads | context is bound workspace truth, not hidden prompt text |
| REPL variable | ABG carrier, event, projection, or read model | state must be admitted or derived before it can govern traversal |
| code probing the prompt | F_D transform/check over admitted carriers | deterministic code is an effect inside traversal |
| `llm_query(...)` | `plugin.transform.C`, `plugin.evaluate.C`, or `human_callout` where applicable | model output is candidate material until ABG admission |
| recursive sub-LLM call | graph-function call under selected program truth | direct in GTL, denoted by ABG traversal bind |
| chunking strategy | refinement boundary / graph decomposition / child frontier | decomposition must preserve obligation lineage |
| intermediate buffers | payload/evidence ledgers and replay-derived projections | buffers do not become authority by being useful |
| final answer tag | assurance-folded closure disposition | finality is ABG closure truth, not worker syntax |
| failed or partial answer | residual, re-entry, continuation, or block | non-closure is explicit lifecycle truth |

## Disambiguation Graph Model

The better model for GLC and SDLC-shaped work is not a linear pipeline. It is a
recursive disambiguation graph.

In this post, "disambiguation" is narrative. The typed substrate reality is:

```text
obligations + candidates + admitted evidence + coverage + residual pressure
```

Do not introduce a rival `Ambiguity` carrier, ledger, projection, or closure
surface. Ambiguity is a useful name for the condition where the current admitted
state has not yet concentrated into an admissible witness for the active
obligations. The replayable truth remains obligation coverage, residuals,
evidence roles, assurance fold, and closure disposition.

Each lifecycle step asks:

```text
Given admitted state A and active obligations O,
what must become less ambiguous before the lifecycle can lawfully advance?
```

The more precise question is:

```text
Given admitted problem constraints, current candidate space, and evidence,
what obligation pressure can be discharged, preserved, or delegated?
```

That means lifecycle graph functions carry typed obligation-discharge contracts.
`Disambiguate` can be a readable function name, but its contract must still be
obligation discharge, not a new ambiguity truth surface:

```text
GraphFunction Disambiguate<A, B>:
  input:
    selected input carriers A
    active requirement / intent / policy obligations
    current residual and coverage projections
    admitted evidence and proof policy refs

  output:
    candidate target carriers B
    admitted or candidate evidence refs
    obligation_delta
    residuals
    closure eligibility
```

The graph function can call other graph functions directly:

```text
DisambiguateRequirement
  -> call RefineScope
  -> call ConstructCandidate
  -> call EvaluateCandidate
  -> call ProveObligation
  -> call FoldLifecycleDisposition
```

But each call is interpreted through ABG:

```text
parent graph-function call
  -> child traversal frame/span
  -> selected child graph function
  -> admitted input carrier binding
  -> active obligation carry-in
  -> stage execution and admission
  -> child obligation_delta
  -> foldback into parent traversal state
```

This gives the useful part of RLM recursion without inheriting the weak parts of
REPL recursion.

## Signal, Candidate Space, And Constraint Space

The practical reason a lifecycle frame remains ambiguous is that it lacks enough
admitted signal to collapse the current candidate space under the active problem
constraints.

There are two different moves:

| Move | Typed surface | Authority |
| --- | --- | --- |
| expand the solution set | `CandidateFamily`, refinement boundaries, `plugin.transform.C` candidates, generated alternatives | worker or product may propose candidate material |
| constrain the problem set | admitted requirements, contexts, node/type contracts, proof obligations, evaluators, policy refs | substrate admits and projects constraint truth |
| converge | admitted evidence plus coverage/assurance fold | ABG derives closure, residual, re-entry, continuation, or block |

The asymmetry is load-bearing. Workers may expand the candidate space. Workers
must not decide which requirements, contexts, proof obligations, or closure
conditions bind the problem. Constraint authority comes from admitted substrate
truth.

The information-theoretic reading is useful if it stays subordinate to the typed
model:

```text
candidate posterior under admitted constraints
  -> more candidate signal expands alternatives
  -> more admitted constraint/evidence signal concentrates alternatives
  -> one sufficient admissible witness closes
  -> diffuse posterior preserves residual pressure
  -> missing signal opens recursive child traversal
```

This is another way to say obligation discharge. It must not become a second
uncertainty or probability ledger. Coverage and residual projections are the
replayable measurement surfaces.

## SDLC As Recursive Disambiguation

An SDLC pipeline should not be modeled as:

```text
requirements -> design -> code -> tests -> review -> done
```

That shape implies phase completion. It hides the fact that most lifecycle work
is obligation discharge under active problem constraints.

A better shape is:

```text
LifecycleGraph:
  IntakeChange
    -> ClassifyChangePressure
    -> SelectSmallestLawfulReentry
    -> DeriveObligations
    -> DisambiguateTargetTruth
    -> SelectOrRefineGraphFunction
    -> ConstructCandidate
    -> EvaluateCandidate
    -> ProveCarryThrough
    -> FoldAssurance
    -> Close | Recurse | Residualize | Re-enter | Block
```

Every node may be a graph function. Every graph function may call graph
functions. Every call is a traversal bind. Every close depends on admitted
evidence and replay-derived obligation coverage.

Not every lifecycle edge requires F_P disambiguation. Many edges are
deterministic F_D or P0 discharge surfaces: schema checks, digest checks,
known-command execution, identity checks, and replay-derived projection checks.
Those edges should not render an F_P prompt just to satisfy the metaphor. The
lawful split is:

```text
F_D / P0 edges discharge deterministically.
F_P edges expand or judge candidates under active obligation pressure.
F_H edges admit external human decision material.
ABG projects coverage, residuals, and closure.
```

For SDLC, the principal ambiguity classes are:

| Ambiguity class | Lifecycle question |
| --- | --- |
| intent ambiguity | what outcome is the work actually trying to change? |
| product ambiguity | what product surface must change? |
| requirement ambiguity | what constitutional truth now applies? |
| design ambiguity | what realization structure satisfies the requirement? |
| implementation ambiguity | what code/artifact change realizes the design? |
| proof ambiguity | what evidence proves the same obligation as the realization? |
| closure ambiguity | what admitted facts permit closure instead of residual or re-entry? |

This turns lifecycle management into recursive obligation discharge:

```text
obligation pressure
  -> disambiguation graph
  -> child graph-function traversals
  -> admitted realization/proof witnesses
  -> obligation_delta foldback
  -> closure or preserved pressure
```

## Why GTL Is A Better Carrier Than The RLM REPL

The RLM paper uses a REPL because it needs somewhere outside the context window
to store and transform prompt state. In GTL/ABG, that role belongs to admitted
carriers and replay-derived projections.

The REPL has no native answer to:

- which decomposition is lawful;
- which sub-call is authorized;
- which obligation the sub-call carries;
- whether the sub-call proved the same requirement as the parent;
- whether a candidate output is admissible;
- whether an output is stale, forged, weaker than the source obligation, or role
  mismatched;
- whether closure is allowed;
- how to replay the lifecycle decision.

ABG has to answer those questions anyway. Therefore the RLM pattern should not
be copied as a workspace script or product-local agent loop. It should be
translated into graph-function recursion under ABG traversal law.

## Direct Graph-Function Calls With ABG Denotation

The programming model should allow direct graph-function calls:

```text
F(x):
  a = call G(x)
  b = call H(a)
  return b
```

The semantic model should lower those calls into traversal binds:

```text
call G(x)
  == ABG.bind(
       selectedProgramOrOverlayRef,
       callerGraphFunctionRef = F,
       calleeGraphFunctionRef = G,
       selectedCompositionRef,
       selectedCompositionDigest,
       admittedInputCarrierRefs,
       activeObligationRefs,
       replayIdentity
     )
```

So directness exists at the GTL language layer, not at the runtime authority
layer.

Tail recursion is the special case where the callee is the current graph
function and the recursive call is in tail position:

```text
F(state):
  next_state = disambiguate(state)

  if closable(next_state):
    return close(next_state)

  return F(next_state)
```

The denotation is not a product-local loop. It is ABG continuation over the same
lineage:

```text
tail call F(next_state)
  == ABG.continue(
       currentGraphFunctionRef = F,
       selectedCompositionRef,
       selectedCompositionDigest,
       admittedNextInputCarrierRefs,
       preservedActiveObligationRefs,
       residualPressureRefs,
       replayIdentity
     )
```

The distinction is:

| GTL call shape | ABG denotation | Lifecycle meaning |
| --- | --- | --- |
| `F` calls `G` | child traversal frame/span | decomposition or delegation |
| `F` calls `F` in non-tail position | recursive child traversal with parent continuation | nested refinement |
| `F` tail-calls `F` | continuation over same graph-function lineage | lifecycle iteration without a product-local controller |

Tail recursion is the lawful form for "keep disambiguating until closed,
residualized, re-entered, or blocked." It preserves the lifecycle loop while
keeping bind, admission, replay, proof coverage, and closure under ABG.

Forbidden shape:

```text
product shell calls graph-vector handler directly
plugin chooses next vector
worker output mutates lifecycle state
test success closes obligation
```

Lawful shape:

```text
graph function calls graph function
  -> ABG opens child traversal
  -> ABG admits candidate outputs
  -> ABG projects obligation coverage
  -> ABG folds assurance
  -> ABG returns obligation_delta to parent
```

## Example: Coding Retry As Tail Recursion

The coding retry loop is an illustrative case of tail-recursive lifecycle
disambiguation. It is not the singular solution for every lifecycle graph, but
it clarifies the model because it is familiar.

A conventional implementation sees coding retry as a local loop:

```text
while checks fail:
  edit code
  run tests
```

That is the wrong authority shape if the loop can close work, mutate lifecycle
state, or decide that requirement pressure has been discharged.

The GTL/ABG interpretation is a tail-recursive graph function:

```text
RealizeAndProveUntilClosed(state):
  candidate = call EditCode(state)
  proof = call RunChecks(candidate)
  assessment = call EvaluateCoverage(candidate, proof)

  if assessment.closable:
    return Close(candidate, proof)

  if assessment.requires_reentry:
    return Reenter(assessment)

  if assessment.blocked:
    return Block(assessment)

  return RealizeAndProveUntilClosed(next_state)
```

The tail call denotes ABG continuation:

```text
tail call RealizeAndProveUntilClosed(next_state)
  -> same graph-function lineage
  -> new attempt identity
  -> preserved active obligations
  -> admitted retry evidence
  -> updated residual pressure
  -> assurance fold before any closure claim
```

This reframes coding retry as:

```text
retry = tail recursion over unresolved obligation pressure
```

The closure condition is not test success:

```text
tests/checks/evidence admitted
  + requirement/proof obligations covered
  + no active blocking residual
  + assurance fold permits closure
```

Non-tail child calls still have a role inside the retry function. For example,
`DiagnoseFailure`, `EditCode`, `GenerateProof`, and `EvaluateCoverage` may each
be graph-function calls with their own child traversal frames. The retry itself
is the tail-recursive continuation when the current attempt remains locally
repairable.

## Consequence For GLC

If GLC means general lifecycle control or general lifecycle construction, then
GLC should be a recursive GTL program over disambiguation graph functions.

It should not be:

- a fixed phase board;
- a local workflow shell;
- a prompt sequence;
- a slot map over lifecycle states;
- a direct vector-call harness;
- a summary agent that compacts context until it can answer.

It should be:

```text
GLC program / overlay
  -> graph-function library of lifecycle disambiguators
  -> typed lifecycle node and edge carriers
  -> requirement / intent / design / realization / proof obligations
  -> recursive graph-function calls for unresolved ambiguity
  -> ABG traversal frames for every call
  -> replay-derived lifecycle projections
  -> closure only through admitted obligation coverage
```

This model makes SDLC pipelines explainable as a special case:

```text
SDLC = GLC over software-product lifecycle obligations
```

The same recursive disambiguation graph can apply to non-software lifecycle
domains when their domain obligations, artifacts, evidence roles, and closure
policies are supplied as product-owned GTL/ABG carriers.

## Implementation Options

### Option 1: Recursive SDLC Graph As A GLC Domain Overlay

Define recursive SDLC as a GLC overlay whose graph functions discharge
software-product obligations recursively. Do not define recursive SDLC as a new
runtime or a second traversal modality.

```text
SDLC = GLC domain overlay
       over software obligations,
       software artifacts,
       software evidence roles,
       and software closure policy
```

Start with typed SDLC state carriers, not phases:

```text
SdlcWorkState
SdlcChangePressure
SdlcObligationSet
SdlcCandidateArtifactSet
SdlcProofEvidenceSet
SdlcResidualSet
SdlcClosureDisposition
SdlcObligationDelta
```

`Ambiguity` is not a carrier. If the word is useful, keep it as narrative over
obligations, candidates, admitted evidence, coverage, and residual pressure.

Define a reusable SDLC graph-function library:

```text
ClassifyChangePressure
SelectSmallestLawfulReentry
DeriveSdlcObligations
RefineTargetTruth
ConstructCandidateChange
EvaluateCandidateChange
GenerateOrBindProof
EvaluateRequirementCoverage
FoldSdlcAssurance
RealizeAndProveUntilClosed
```

The regime split must stay explicit:

```text
F_D:
  SelectSmallestLawfulReentry
  schema / digest / identity checks
  known-command execution admission
  coverage projection
  stale / ref-mismatch checks

F_P:
  RefineTargetTruth
  ConstructCandidateChange
  semantic adequacy assessment
  repair proposal

F_H:
  accept risk
  approve scope interpretation
  authorize nonlocal re-entry
```

The recursive root can be modeled as a tail-recursive graph function:

```text
GraphFunction RealizeAndProveUntilClosed<
  SdlcWorkState,
  SdlcClosureDisposition
>:
  obligations = call DeriveSdlcObligations(state)
  candidate = call ConstructCandidateChange(state, obligations)
  proof = call GenerateOrBindProof(candidate, obligations)
  coverage = call EvaluateRequirementCoverage(candidate, proof, obligations)
  disposition = call FoldSdlcAssurance(coverage)

  if disposition.close:
    return disposition

  if disposition.reenter:
    return call SelectSmallestLawfulReentry(disposition)

  if disposition.block:
    return disposition

  return RealizeAndProveUntilClosed(next_state)
```

The final call is the lifecycle retry loop:

```text
retry = tail recursion over unresolved obligation pressure
```

Use non-tail graph-function calls for decomposition:

```text
RefineTargetTruth
  -> call RefineRequirement
  -> call RefineDesign
  -> call RefineProofPolicy

ConstructCandidateChange
  -> call EditCode
  -> call UpdateSpec
  -> call UpdateTests

EvaluateRequirementCoverage
  -> call CheckRealizationWitness
  -> call CheckProofWitness
  -> call CheckWeakerContractRisk
```

Each call lowers to ABG traversal bind:

```text
ABG.bind(parent_state, selected_child_graph_function)
```

Closure is over obligation coverage, not phase completion:

```text
close iff:
  every active SDLC obligation has admitted realization witness
  every proof obligation has admitted proof witness
  proof roles match
  proof strength is sufficient
  no active blocking residual remains
  assurance fold permits closure
```

The GLC overlay shape is:

```text
GLC_SoftwareLifecycleOverlay:
  starts:
    - RealizeAndProveUntilClosed

  graphFunctions:
    - ClassifyChangePressure
    - SelectSmallestLawfulReentry
    - DeriveSdlcObligations
    - RefineTargetTruth
    - ConstructCandidateChange
    - EvaluateCandidateChange
    - GenerateOrBindProof
    - EvaluateRequirementCoverage
    - FoldSdlcAssurance
    - RealizeAndProveUntilClosed

  obligations:
    - intent obligation
    - product obligation
    - requirement obligation
    - design obligation
    - implementation obligation
    - proof obligation
    - closure obligation

  evidenceRoles:
    - realization
    - verifier-artifact
    - verifier-execution
    - semantic-interpretation
    - human-decision
```

Governing sentence for this option:

```text
A recursive SDLC graph is a GLC program overlay whose graph functions discharge
software lifecycle obligations. Graph-function calls are direct in GTL and
denote ABG traversal bind. Tail calls denote ABG continuation over the same
obligation lineage.
```

## Requirement-Proof Carry-Through Link

This strategy depends on requirement proof carry-through.

Recursive graph-function calls are dangerous if they only pass task summaries.
They are lawful when they carry:

- source obligation ids;
- active realization obligations;
- active proof obligations;
- selected composition identity;
- admitted input carriers;
- response and plugin result contracts;
- evidence role refs;
- replay identity;
- residual pressure.

Then a child traversal can prove or preserve the same obligation pressure the
parent carried in.

That is a sequencing constraint, not a decorative note. Recursive lifecycle
disambiguation is not safely realizable until the requirement proof
carry-through work lands the fields and admission checks needed to preserve
source obligation identity, proof role, candidate kind, response contract,
plugin result interface, replay identity, and evidence strength through plugin
and graph-function boundaries.

Without those fields, recursion degrades back into the RLM weakness this post is
trying to avoid:

```text
parent task summary
  -> child worker answer
  -> aggregate prose
  -> apparent closure without carried obligation proof
```

That shape is not GLC. It is an untyped recursive agent loop.

The closure question becomes:

```text
For each source obligation carried into this recursive call graph,
is there an admitted realization witness and admitted proof witness,
with compatible roles and sufficient strength,
folded back into the parent lifecycle state?
```

That is the typed version of the RLM paper's "recursively call over snippets and
aggregate answers" pattern.

## Design Direction

The design direction is:

1. Treat lifecycle pipelines as recursive obligation-discharge graphs, with
   "disambiguation" as the narrative lens.
2. Treat graph functions as reusable lifecycle obligation-discharge functions.
3. Allow graph functions to call graph functions directly in GTL.
4. Interpret each graph-function call as ABG traversal bind.
5. Treat tail-recursive graph-function calls as ABG continuation over the same
   obligation lineage.
6. Make recursion visible as child frames/spans, continuation refs, and foldback
   projections.
7. Keep the authority split: workers expand candidates; substrate admits
   constraints, evidence, coverage, residuals, and closure.
8. Carry obligations through every recursive call and tail call.
9. Admit candidate outputs before they can affect coverage, assurance,
   transition, continuation, or closure.
10. Preserve residual pressure when obligation discharge is incomplete.
11. Do not build a separate ambiguity, entropy, or disambiguation subsystem.

This gives Abiogenesis a stronger answer than the paper's REPL scaffold:

```text
RLM:
  recursive semantic calls over external prompt state

GTL / ABG:
  recursive graph-function calls over admitted lifecycle state,
  with traversal-monad semantics, obligation conservation,
  evidence admission, replay, and closure law
```

## Non-Goal

This post does not ratify new GTL or ABG requirements.

It is a strategy interpretation of the RLM paper and a proposed mental model for
GLC and SDLC-style lifecycle construction. Any reusable law from this post must
be ratified through specification requirements or design surfaces before it can
govern implementation.
