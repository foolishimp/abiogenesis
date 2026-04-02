# GTL/ABG LLM Guide For Domain Workflows

Status: active
Audience: LLM coding agents authoring or refactoring domain workflows such as GSDLC
Scope: how to think, what to publish, what to avoid, and where to read next

## 1. Mission

Use GTL/ABG to express domain workflows as lawful reusable workflow programs.

Your goal is not to “make the runtime do the right thing somehow.”
Your goal is to publish enough explicit structure that the runtime can interpret
it lawfully.

The core rule is:

> if a domain workflow pattern is repeatable, publish it as GTL structure
> first, not as hidden runtime code, prompt logic, or topology surgery

For domain systems like GSDLC, think in this order:

1. outer institutional contract
2. reusable workflow programs
3. lawful alternatives
4. lawful refinement or recursion
5. jobs, roles, evaluators, and reporting derived from that published truth

## 2. Ontology Split

Keep the GTL / ABG split strict.

GTL declares:
- `Node`
- `GraphVector`
- `Graph`
- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`
- `Job`
- `Role`
- `Module`
- algebra such as `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`

ABG realizes:
- materialization
- selection application
- recursive frames
- continuation/frontier control
- events
- projection
- convergence
- lineage
- correction/reset
- transport

Do not solve GTL authoring problems by inventing ABG-local behavior.
Do not solve ABG runtime problems by smuggling hidden semantics into GTL labels or tags.

## 3. Primary Authoring Rule

`GraphFunction` is the primary reusable compute abstraction.

For an LLM agent, that means:

- do not start from edges as the main reusable unit
- do not start from prompts as the main reusable unit
- do not start from command handlers as the main reusable unit

Start from:

> what reusable workflow program should exist here?

If you find repeatable realization logic in helper code, policy code, bootstrap
logic, or wrapper code, ask whether it should be promoted into a published
`GraphFunction`.

## 4. How To Build A Domain Workflow

### Step 1: Define the stable outer graph

First define the institutionally visible domain workflow:

- the nodes that matter
- the graph vectors that matter
- the outer contract that must remain stable even if inner realization changes

For GSDLC-like systems this is the stage graph.
Do not start by expanding inner realization detail into the top-level graph.

### Step 2: Identify repeatable realization patterns

For each coarse vector, ask:

- is there one lawful reusable workflow program here?
- are there several lawful alternatives?
- is there a lawful refinement boundary here?
- is there a lawful recursive pattern here?

If the answer is “yes,” publish it explicitly.

### Step 3: Publish workflow programs as `GraphFunction`

Use `GraphFunction` when:

- the realization is repeatable
- the outer interface is stable
- inner structure may change without changing the promise to callers
- the workflow should be composable, refinable, recursive, or reusable elsewhere

The function should publish:

- explicit inputs
- explicit outputs
- replayable template truth
- declarations needed for lawful runtime interpretation

Do not leave important function meaning only in side registries, helper dicts,
or runtime selectors.

### Step 4: Publish alternatives as `CandidateFamily`

Use `CandidateFamily` when there is more than one lawful workflow-program
realization for the same outer contract.

Examples:

- tenant-specific realization
- prototype vs production path
- policy-visible jurisdiction path
- different build families with the same outer boundary

The language publishes the alternatives.
Selection remains explicit.

### Step 5: Publish refinement explicitly

Use `RefinementBoundary` when a coarse vector may be refined.

Do not hide refinement in:

- helper code
- wrapper branches
- topology mode switches
- private metadata conventions

### Step 6: Use recursion only when the pattern is real

Use `recurse(graph_function, termination, foldback)` when:

- repeated or child application is part of the real workflow law
- the outer contract remains stable
- termination is declared
- fold-back is declared
- parent re-evaluation is part of the contract

Do not use recursion as a disguised implementation trick.
Do not use recursion if the “repeatability” is really just imperative loop code
with no lawful reusable workflow-program boundary.

## 5. What “Graph-Function-First” Means

A domain workflow is graph-function-first when:

- repeatable realization lives in published `GraphFunction`s
- alternatives live in published `CandidateFamily`s
- refinement lives in published `RefinementBoundary`s
- selection is explicit and provenance-carrying
- runtime/read-model surfaces derive from published workflow-program truth
- edge/topology views are projections, not the primary source of truth

It is not graph-function-first when:

- top-level wrappers decide the real workflow shape
- helper metadata tables carry the real function semantics
- the runtime recompiles topology from hidden side registries
- prompts imply workflow structure that GTL does not publish
- module rewrite is used to simulate recursive realization

## 6. Domain-Workflow Checklist

When authoring a domain workflow, check these in order.

### Contract

- What is the stable outer graph?
- Which vectors are institutionally visible contracts?
- Which parts are internal realization detail only?

### Reuse

- What repeatable patterns should be `GraphFunction`s?
- What patterns are currently duplicated and should be published once?
- What should remain a direct primitive vector instead of being lifted?

### Alternatives

- Are there multiple lawful realizations for one outer contract?
- If yes, are they published as a `CandidateFamily`?
- Is the choice explicit, fail-closed, and provenance-carrying?

### Refinement

- Is there a lawful declared refinement boundary?
- Is refinement visible in the module publication surface?

### Recursion

- Is recursive descent real workflow law or just imperative implementation?
- Is termination declared?
- Is fold-back declared?
- Is parent re-evaluation preserved?

### Runtime Alignment

- Can ABG interpret this without hidden domain-specific strategy?
- Does runtime state derive from declared workflow-program truth?
- Are reporting surfaces observational only?

## 7. Anti-Patterns

Avoid these.

### Anti-pattern 1: Global topology rewrite

Do not rewrite the live module to simulate selected graph-function realization.

Correct model:
- stable outer module
- invocation-local recursive frame
- fold-back to parent

### Anti-pattern 2: Side-registry truth

Do not make helper dicts, edge registries, or wrapper metadata the authoritative
source of function meaning.

If a field is required for lawful selection, materialization, proof, or
reporting, try to move it into published GTL truth first.

### Anti-pattern 3: Hidden default strategy

Do not bury selection policy in convenience code without explicit published
alternatives and explicit decision/provenance surfaces.

### Anti-pattern 4: Synthetic fallback traversal

Do not invent traversal targets because a lawful published one is missing.
Fail closed instead.

### Anti-pattern 5: First-order trap

Do not hardcode a domain around one fixed stage-to-stage pipeline if the domain
already exhibits reusable combinators, branching families, reduction patterns,
or recursive realization.

## 8. Higher-Order Readiness

Build domain workflows so they can later host higher-order GTL operators
cleanly:

- `fan_out`
- `fan_in`
- `gate`
- `promote`
- `compose`
- `recurse`

That means:

- keep contracts explicit
- keep reusable realization in workflow programs
- do not name/report everything as if only first-order stage edges exist
- avoid runtime shortcuts that only work for one concrete domain path

If a design choice would make higher-order composition awkward later, it is
probably the wrong choice now.

## 9. Minimal Authoring Heuristic For LLMs

When writing GTL/ABG domain workflow code:

1. define the outer graph first
2. lift repeatable realization into `GraphFunction`
3. publish lawful alternatives with `CandidateFamily`
4. publish refinement with `RefinementBoundary`
5. use `recurse(...)` only with declared termination and fold-back
6. keep selection explicit
7. keep reporting observational
8. remove hidden registries and runtime-only semantic carriers
9. prefer present published truth over convenience helper code

## 10. Where To Read Next

Core GTL requirements:
- `workspace://specification/requirements/gtl/REQ-L-GTL2-GRAPHFUNCTION.md`
- `workspace://specification/requirements/gtl/REQ-L-GTL2-RECURSE.md`
- `workspace://specification/requirements/gtl/REQ-L-GTL2-SUBSTITUTE.md`

Core ABG requirements:
- `workspace://specification/requirements/abg/REQ-R-ABG2-INTERPRET.md`
- `workspace://specification/requirements/abg/REQ-R-ABG2-SELECTION-APPLICATION.md`
- `workspace://specification/requirements/abg/REQ-R-ABG2-LINEAGE.md`

Design surfaces:
- `workspace://build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md`
- `workspace://build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`

Runtime/code examples:
- `workspace://build_tenants/abiogenesis/python/code/gtl/algebra.py`
- `workspace://build_tenants/abiogenesis/python/code/gtl/function_model.py`
- `workspace://build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `workspace://build_tenants/abiogenesis/python/code/genesis/frames.py`

Qualification lanes:
- `workspace://build_tenants/abiogenesis/python/test_env/tests/test_m01_gtl_core_integration.py`
- `workspace://build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py`
- `workspace://build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py`

## 11. One-Sentence Summary

When building domain workflows like GSDLC, publish reusable workflow law in GTL
first, let ABG interpret it lawfully, and treat hidden runtime structure as a
defect rather than a shortcut.
